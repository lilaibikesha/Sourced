/* Application Buddy: Chrome side panel logic.
   Sections 1-6: data, state, next-step rules, rendering.
   Sections 7-9: chrome.storage.local, the checklist, and auto-detected progress.

   v0.2: steps now follow the real Admission Center (mapped from Ben's screenshot set,
   see docs/application-buddy/SCREEN-MAP.md). Step ids are strings; storage key bumped to v2. */
/* =====================================================================
   1. APPLICATION DATA  <-- edit times and text here
   min / max = minutes, mid = value used for totals.
   type: "form" | "timed" | "writing" | "verify" | "action" | "decision"
   group: which Admission Center section the step lives in.
   needs: step ids that must be done first (on top of Part 1, which unlocks everything).
   optional: shown in the checklist but not counted in progress (financial aid).
   ===================================================================== */
const CHALLENGES = ["understanding", "creativity", "math", "reasoning", "writing", "expression"];

const STEPS = [
  { id: "part1", group: "Part 1", name: "Part 1: Basic Information", type: "form", min: 10, max: 15, mid: 12,
    desc: "Contact details, address, important details and agreements. Creates your account and unlocks the Admission Center." },

  // Part 2. How You Think — same order as the Admission Center cards
  { id: "understanding", group: "Part 2", name: "Understanding challenge", type: "timed", min: 7, max: 7, mid: 7,
    desc: "7 questions about one passage in 7 minutes. Optional 3-minute practice first." },
  { id: "creativity", group: "Part 2", name: "Creativity challenge", type: "timed", min: 8, max: 8, mid: 8,
    desc: "Graded only, no practice. Give single nouns for each prompt word in 8 minutes." },
  { id: "math", group: "Part 2", name: "Math challenge", type: "timed", min: 8, max: 8, mid: 8,
    desc: "20 multiple-choice questions in 8 minutes. A stand-alone calculator is allowed. Optional practice." },
  { id: "reasoning", group: "Part 2", name: "Reasoning challenge", type: "timed", min: 21, max: 21, mid: 21,
    desc: "13 visual pattern questions in 21 minutes. Optional practice." },
  { id: "writing", group: "Part 2", name: "Writing challenge", type: "timed", min: 20, max: 20, mid: 20,
    desc: "One essay prompt in 20 minutes. Graded only, no practice." },
  { id: "expression", group: "Part 2", name: "Expression challenge", type: "timed", min: 15, max: 25, mid: 20,
    needs: ["verifyId"],
    desc: "5 video answers, up to 2 minutes each. Needs ID verification before it will start." },
  { id: "closePart2", group: "Part 2", name: "Close Part 2", type: "action", min: 1, max: 1, mid: 1,
    needs: CHALLENGES,
    desc: "Click \"Close Part 2\" in the Admission Center once all six challenges say Challenge Complete." },

  // Part 3. What Have You Achieved
  { id: "accomplishments", group: "Part 3", name: "Accomplishments (3 minimum, 6 recommended)", type: "writing", min: 60, max: 60, mid: 60, approx: true,
    desc: "Add at least 3. Minerva grades all of them and uses your three highest scores." },
  { id: "closePart3", group: "Part 3", name: "Close Part 3", type: "action", min: 1, max: 1, mid: 1,
    needs: ["accomplishments"],
    desc: "You can edit accomplishments until you close Part 3." },

  // Official Documents and Information
  { id: "academic", group: "Official Documents", name: "Academic Performance (add your school)", type: "form", min: 10, max: 15, mid: 12, external: true,
    desc: "School, dates, grading scale and grades. Your school contacts send the official records." },
  { id: "financialAid", group: "Official Documents", name: "Financial aid: apply or skip", type: "decision", min: 2, max: 2, mid: 2, optional: true,
    desc: "Optional. Apply in the Financial Aid Center (CSS Profile, tax forms, bank statements) or choose \"Skip for now\"." },
  { id: "verifyId", group: "Official Documents", name: "Verify your ID", type: "verify", min: 5, max: 5, mid: 5,
    desc: "Webcam photo of your face and of a government photo ID. Needed before the Expression challenge." },
  { id: "parentGuardian", group: "Official Documents", name: "Parent/Guardian contact information", type: "form", min: 2, max: 3, mid: 2,
    desc: "Contact details only. Minerva contacts them only if you are admitted." },
  { id: "disciplinary", group: "Official Documents", name: "Disciplinary Record", type: "form", min: 2, max: 5, mid: 3,
    desc: "One yes/no question plus the certification checkbox." },
  { id: "closeDocs", group: "Official Documents", name: "Close Official Documents section", type: "action", min: 1, max: 1, mid: 1,
    needs: ["academic", "verifyId", "parentGuardian", "disciplinary"],
    desc: "Click \"Close This Section\" once every row is done." },

  // Submit
  { id: "submit", group: "Submit", name: "Submit your application", type: "action", min: 2, max: 2, mid: 2,
    needs: ["part1", "closePart2", "closePart3", "closeDocs"],
    desc: "Submit, then \"Mark as Complete\". If you skipped financial aid you confirm that first." },
];
const REQUIRED = STEPS.filter(s => !s.optional);

// Deadlines (dates are YYYY-MM-DD)
const DEADLINES = [
  { round: "Regular Decision I",  admissions: "2027-01-05", aid: "2027-01-12", decisions: "2027-02-26" },
  { round: "Regular Decision II", admissions: "2027-03-02", aid: "2027-03-09", decisions: "2027-04-12" },
];

// Time picker choices (minutes). "2+ hours" counts as 120.
const TIME_CHOICES = [
  { label: "15 min",   minutes: 15 },
  { label: "30 min",   minutes: 30 },
  { label: "1 hour",   minutes: 60 },
  { label: "2+ hours", minutes: 120 },
];
const DEFAULT_MINUTES = 60;   // used when no time is picked
const FOCUS_BUFFER = 5;       // timed steps need their max time + 5 min

const TYPE_LABEL = { form: "Form", timed: "Timed", writing: "Writing", verify: "Webcam", action: "Button", decision: "Optional" };

// Template copied by "Copy email to counselor"
const COUNSELOR_EMAIL = [
  "Subject: Transcript request for my Minerva University application",
  "",
  "Hi [Counselor's name],",
  "",
  "I'm applying to Minerva University (Regular Decision I, deadline January 5, 2027).",
  "Could you please send my transcripts from the last 3 years and complete the school's academic form when Minerva's request arrives?",
  "",
  "Thank you so much for your help!",
  "",
  "Best,",
  "[Your name]",
].join("\n");

/* =====================================================================
   2. STATE  (what the applicant has done)
   done:  { stepId: true }   asked: counselor checkbox   time: picked minutes or null
   auto:  { stepId: { at, signal } } written by content.js when a step is seen as
          complete on the page. Only step ids, a timestamp and a signal name are
          stored, locally. No names, answers or other applicant data.
   ===================================================================== */
const STORAGE_KEY = "minervaBuddy.v2";
const AUTO_KEY = "minervaBuddy.auto.v1";
let state = freshState();
let auto = {};

function freshState() {
  return { done: {}, asked: false, time: null };
}

// Turn whatever was saved into a clean, valid state object
function normalizeState(raw) {
  const clean = freshState();
  if (raw && typeof raw === "object") {
    if (raw.done && typeof raw.done === "object") {
      STEPS.forEach(s => { if (raw.done[s.id]) clean.done[s.id] = true; });
    }
    clean.asked = !!raw.asked;
    if (TIME_CHOICES.some(c => c.minutes === raw.time)) clean.time = raw.time;
  }
  return clean;
}

function isDone(id) { return state.done[id] === true || !!auto[id]; }
function isAuto(id) { return !!auto[id]; }
function doneCount() { return REQUIRED.filter(s => isDone(s.id)).length; }
function isLocked(step) {
  if (step.id !== "part1" && !isDone("part1")) return true;          // Admission Center opens after Part 1
  return !!step.needs && !step.needs.every(isDone);
}
function stepById(id) { return STEPS.find(s => s.id === id); }
function lockReason(step) {
  if (step.id !== "part1" && !isDone("part1")) return "Locked until Part 1 is submitted";
  const missing = (step.needs || []).filter(id => !isDone(id)).map(id => stepById(id).name);
  return missing.length ? "Needs: " + missing.join(", ") : "";
}

// Mark a step done / not done. Finishing Academic Performance implies the counselor was asked.
// Un-ticking also clears an auto-detected tick (it comes back if the page shows it again).
function setStepDone(id, value) {
  if (value) state.done[id] = true; else { delete state.done[id]; if (auto[id]) { delete auto[id]; saveAuto(); } }
  if (id === "academic" && value) state.asked = true;
}

// Counselor checkbox. Un-asking the counselor also un-completes Academic Performance.
function setAsked(value) {
  state.asked = value;
  if (!value) delete state.done.academic;
}

/* =====================================================================
   3. SMALL HELPERS
   ===================================================================== */
const $ = id => document.getElementById(id);
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function roundTo5(min) { return Math.round(min / 5) * 5; }

// 130 -> "2 h 10 min", 180 -> "3 h", 45 -> "45 min"
function formatMinutes(min) {
  const m = roundTo5(min);
  if (m <= 0) return "0 min";
  const h = Math.floor(m / 60), r = m % 60;
  if (!h) return r + " min";
  if (!r) return h + " h";
  return h + " h " + r + " min";
}

function rangeText(step) {
  if (step.min === step.max) return (step.approx ? "about " : "") + step.min + " min";
  return step.min + "–" + step.max + " min";
}

// Dates are compared as calendar days (no time-zone surprises)
function dayValue(iso) { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d); }
function daysUntil(iso) {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((dayValue(iso) - today) / 86400000);
}
function longDate(iso)  { return new Date(dayValue(iso)).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" }); }
function shortDate(iso) { return new Date(dayValue(iso)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }); }

// The first round whose admissions deadline hasn't passed yet
function activeRound() { return DEADLINES.find(r => daysUntil(r.admissions) >= 0) || null; }

// Copy text to the clipboard, with an old-school fallback
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* try fallback */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

/* =====================================================================
   4. NEXT-STEP RULES  (plain if/else, no AI)
   ===================================================================== */
function getNextStep() {
  if (doneCount() === REQUIRED.length) return { kind: "done" };

  if (!isDone("part1")) {
    return { kind: "step", step: stepById("part1"), why: "The Admission Center unlocks after Part 1." };
  }
  if (!state.asked) {
    return { kind: "counselor", why: "This one depends on someone else, so start it first." };
  }

  const available = state.time ?? DEFAULT_MINUTES;
  for (const step of REQUIRED) {
    if (isDone(step.id) || isLocked(step)) continue;
    const fits = step.type === "timed"
      ? available >= step.max + FOCUS_BUFFER   // timed: needs full focus time
      : available >= step.mid;                 // others: midpoint is enough
    if (fits) {
      return {
        kind: "step", step,
        why: "First open step that fits " + (state.time ? "your " + choiceLabel(state.time) : "about 1 hour") + ".",
        hint: step.type === "timed" ? "Use a laptop or desktop with a webcam and microphone, in a quiet spot. You can only take the graded challenge once."
            : step.type === "verify" ? "Have your government photo ID and a working webcam ready." : null,
      };
    }
  }
  return { kind: "none" };
}

function choiceLabel(min) { return (TIME_CHOICES.find(c => c.minutes === min) || {}).label || min + " min"; }

/* =====================================================================
   5. PANEL RENDERING  (reads state, updates the panel)
   ===================================================================== */
function renderPanel() {
  renderProgress();
  renderTimeLeft();
  renderWaiting();
  renderNext();
  renderChips();
  renderDeadline();
}

// 1. Progress bar
function renderProgress() {
  const n = doneCount(), total = REQUIRED.length;
  const pct = Math.round((n / total) * 100);
  const autoN = REQUIRED.filter(s => isAuto(s.id)).length;
  $("progressText").textContent = n + " of " + total + " steps done" + (autoN ? " (" + autoN + " detected)" : "");
  $("progressBar").setAttribute("aria-valuemax", total);
  $("progressPct").textContent = pct + "%";
  $("progressFill").style.width = pct + "%";
  $("progressFill").classList.toggle("complete", n === total);
  $("progressBar").setAttribute("aria-valuenow", n);
  $("progressBar").setAttribute("aria-valuetext", n + " of " + total + " steps done");
}

// 2. Time left (number animates smoothly between values)
let shownMinutes = null, timeAnim = null;
function renderTimeLeft() {
  const open = REQUIRED.filter(s => !isDone(s.id));
  const sum = key => open.reduce((t, s) => t + s[key], 0);
  const target = sum("mid");

  $("timeRange").textContent = open.length
    ? "range " + formatMinutes(sum("min")) + " – " + formatMinutes(sum("max"))
    : "All " + REQUIRED.length + " steps are complete.";

  const paint = v => {
    $("timeLeft").textContent = roundTo5(v) > 0 ? "About " + formatMinutes(v) + " of work left"
      : isDone("submit") ? "Nothing left to do." : "No work left. Just submit!";
  };
  cancelAnimationFrame(timeAnim);
  if (shownMinutes === null || reduceMotion) { shownMinutes = target; paint(target); return; }
  const from = shownMinutes, start = performance.now(), duration = 500;
  const tick = now => {
    const p = Math.min(1, (now - start) / duration);
    shownMinutes = from + (target - from) * (1 - Math.pow(1 - p, 3));  // ease-out
    paint(p < 1 ? shownMinutes : target);
    if (p < 1) timeAnim = requestAnimationFrame(tick); else shownMinutes = target;
  };
  timeAnim = requestAnimationFrame(tick);
}

// 3. Waiting on others
function renderWaiting() {
  $("counselorCard").hidden = state.asked;
  $("counselorNote").hidden = !state.asked;
}

// 4. Next step card
let lastNextKey = null;
function renderNext() {
  const next = getNextStep();
  const card = $("nextCard"), title = $("nextTitle"), why = $("nextWhy"), hint = $("nextHint"), btn = $("nextBtn");
  let key;

  card.classList.remove("celebrate");
  $("celebrateArt").setAttribute("hidden", "");   // SVGs need the attribute, not .hidden
  hint.hidden = true;
  btn.hidden = false;

  if (next.kind === "done") {
    key = "done";
    const round = activeRound();
    card.classList.add("celebrate");
    $("celebrateArt").removeAttribute("hidden");
    title.textContent = "Application submitted!";
    why.textContent = "Minerva emails a confirmation within 24 hours. If you skipped financial aid you can still apply before " +
      (round ? longDate(round.aid) : "the aid deadline") + ".";
    btn.hidden = true;
  } else if (next.kind === "counselor") {
    key = "counselor";
    title.textContent = "Next: Email your counselor (5 min)";
    why.textContent = next.why;
    btn.setAttribute("aria-label", "Mark counselor email done");
  } else if (next.kind === "step") {
    key = "step-" + next.step.id;
    title.textContent = "Next: " + next.step.name + " (~" + next.step.mid + " min)";
    why.textContent = next.why;
    if (next.hint) { hint.textContent = next.hint; hint.hidden = false; }
    btn.setAttribute("aria-label", "Mark " + next.step.name + " done");
  } else {
    key = "none";
    title.textContent = "Not enough time for a full step.";
    why.textContent = isDone("accomplishments")
      ? "Use it to review what you've already finished."
      : "Use it to gather links and files for your Accomplishments.";
    btn.hidden = true;
  }

  // Animate only when the suggestion actually changes
  if (lastNextKey !== null && key !== lastNextKey && !reduceMotion) {
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
    if (key === "done") burstConfetti(card);
  }
  lastNextKey = key;
}

function burstConfetti(container) {
  const colors = ["#ffffff", "#bbf7d0", "#86efac", "#bfdbfe", "#fde68a"];
  for (let i = 0; i < 28; i++) {
    const c = document.createElement("span");
    c.className = "confetti";
    c.style.left = (5 + Math.random() * 90) + "%";
    c.style.background = colors[i % colors.length];
    c.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
    c.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    c.style.animationDelay = (Math.random() * 0.25) + "s";
    container.appendChild(c);
    setTimeout(() => c.remove(), 1900);
  }
}

// 5. Time picker chips
function renderChips() {
  document.querySelectorAll("#timeChips .chip").forEach(chip => {
    chip.setAttribute("aria-pressed", String(Number(chip.dataset.minutes) === state.time));
  });
  $("timeAssume").hidden = state.time !== null;
}

// 6. Deadline countdown (uses today's real date)
function renderDeadline() {
  const round = activeRound();
  if (!round) {
    $("deadlineMain").textContent = "All 2027 application deadlines have passed.";
    $("deadlineSub").textContent = "";
    return;
  }
  const d = daysUntil(round.admissions);
  const left = d === 0 ? "due today" : d + (d === 1 ? " day" : " days") + " left";
  $("deadlineMain").innerHTML = round.round + ": <strong>" + left + "</strong> (" + longDate(round.admissions) + ")";
  $("deadlineSub").textContent = "Financial aid documents due " + longDate(round.aid);
}

// Key dates table on the trust tab
function renderDatesTable() {
  const rows = DEADLINES.map(r =>
    "<tr><td>" + r.round.replace("Regular Decision", "RD") + "</td><td>" + shortDate(r.admissions) +
    "</td><td>" + shortDate(r.aid) + "</td><td>" + shortDate(r.decisions) + "</td></tr>").join("");
  $("datesTable").innerHTML =
    "<thead><tr><th scope='col'>Round</th><th scope='col'>Apply by</th><th scope='col'>Financial aid</th><th scope='col'>Decision by</th></tr></thead><tbody>" +
    rows + "</tbody>";
}

/* =====================================================================
   6. PANEL EVENTS  (run once at start-up)
   ===================================================================== */
function bindPanel() {
  // Tabs (click + arrow keys)
  const tabs = [$("tabBtnProgress"), $("tabBtnTrust")];
  const selectTab = tab => tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    $(t.getAttribute("aria-controls")).hidden = !on;
  });
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const other = tabs[(i + 1) % tabs.length];
      selectTab(other); other.focus();
    });
  });
  window.showProgressTab = () => selectTab(tabs[0]);

  // Time chips (click the selected chip again to clear it)
  $("timeChips").innerHTML = TIME_CHOICES.map(c =>
    '<button class="chip" type="button" aria-pressed="false" data-minutes="' + c.minutes + '">' + c.label + "</button>").join("");
  $("timeChips").addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const m = Number(chip.dataset.minutes);
    state.time = state.time === m ? null : m;
    update();
  });

  // "Mark done" on the next-step card
  $("nextBtn").addEventListener("click", () => {
    const next = getNextStep();
    if (next.kind === "step") { setStepDone(next.step.id, true); update(next.step.id); }
    else if (next.kind === "counselor") { setAsked(true); update(); }
    if ($("nextBtn").hidden) $("nextCard").focus();   // keep keyboard focus somewhere sensible
  });

  // Copy counselor email
  $("copyEmailBtn").addEventListener("click", async () => {
    const btn = $("copyEmailBtn");
    const ok = await copyText(COUNSELOR_EMAIL);
    btn.textContent = ok ? "Copied!" : "Couldn't copy. Try again.";
    btn.classList.toggle("copied", ok);
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = "Copy email to counselor"; btn.classList.remove("copied"); }, 2000);
  });

  renderDatesTable();
}

/* =====================================================================
   7. SAVING  (chrome.storage.local instead of localStorage)
   ===================================================================== */
async function loadState() {
  try {
    const saved = await chrome.storage.local.get(STORAGE_KEY);
    return normalizeState(saved[STORAGE_KEY]);
  } catch (e) { return freshState(); }
}
function saveState() {
  try { chrome.storage.local.set({ [STORAGE_KEY]: state }); } catch (e) { /* storage unavailable */ }
}

// Auto-detected steps (written by content.js). Keep only known step ids.
function normalizeAuto(raw) {
  const clean = {};
  if (raw && typeof raw === "object") {
    STEPS.forEach(s => {
      const v = raw[s.id];
      if (v && typeof v === "object") clean[s.id] = { at: String(v.at || ""), signal: String(v.signal || "") };
    });
  }
  return clean;
}
async function loadAuto() {
  try { const saved = await chrome.storage.local.get(AUTO_KEY); return normalizeAuto(saved[AUTO_KEY]); }
  catch (e) { return {}; }
}
function saveAuto() {
  try { chrome.storage.local.set({ [AUTO_KEY]: auto }); } catch (e) { /* storage unavailable */ }
}

// Call this after ANY change: saves, then redraws checklist + panel.
function update() {
  saveState();
  renderChecklist();
  renderPanel();
}

/* =====================================================================
   8. CHECKLIST  (tick steps by hand; auto-detected steps are ticked for you)
   ===================================================================== */
function buildChecklist() {
  const items = [];
  let group = null;
  STEPS.forEach(s => {
    if (s.group !== group) {
      group = s.group;
      items.push('<p class="check-group">' + (group === "Official Documents" ? "Official Documents &amp; Information" : group) + "</p>");
    }
    if (s.id === "academic") {
      items.push('<label class="check" data-row="asked"><input type="checkbox" data-asked> <span>I asked my school counselor to send my academic records</span></label>');
    }
    items.push('<label class="check" data-row="' + s.id + '"><input type="checkbox" data-step="' + s.id + '"> <span>' +
      s.name + '<small>' + TYPE_LABEL[s.type] + " · " + rangeText(s) + '<em class="auto-tag" hidden> · detected on page</em></small></span></label>');
  });
  $("checklistItems").innerHTML = items.join("");

  $("checklistItems").addEventListener("change", e => {
    const box = e.target;
    if (box.hasAttribute("data-asked")) setAsked(box.checked);
    else if (box.dataset.step) setStepDone(box.dataset.step, box.checked);
    update();
  });
  $("resetBtn").addEventListener("click", () => { state = freshState(); auto = {}; saveAuto(); update(); });
}

function renderChecklist() {
  STEPS.forEach(s => {
    const box = document.querySelector('[data-step="' + s.id + '"]');
    const row = box.closest(".check");
    const locked = isLocked(s) && !isDone(s.id);
    box.checked = isDone(s.id);
    box.disabled = locked;
    row.classList.toggle("locked", locked);
    row.title = locked ? lockReason(s) : (isAuto(s.id) ? "Detected on the application page (" + auto[s.id].signal + ")" : s.desc);
    row.querySelector(".auto-tag").hidden = !isAuto(s.id);
  });
  document.querySelector("[data-asked]").checked = state.asked;
}

/* =====================================================================
   9. START
   ===================================================================== */
(async function start() {
  state = await loadState();
  auto = await loadAuto();
  bindPanel();
  buildChecklist();
  renderChecklist();
  renderPanel();

  // In the real extension the "x" closes the side panel
  $("closeBtn").addEventListener("click", () => window.close());

  // Keep several open panels in sync
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[STORAGE_KEY]) state = normalizeState(changes[STORAGE_KEY].newValue);
    if (changes[AUTO_KEY]) auto = normalizeAuto(changes[AUTO_KEY].newValue);
    if (changes[STORAGE_KEY] || changes[AUTO_KEY]) { renderChecklist(); renderPanel(); }
  });
})();

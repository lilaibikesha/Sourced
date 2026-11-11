/* Application Buddy: Chrome side panel logic.
   Sections 1-6 are identical to the single-file demo (data, state, next-step rules, rendering).
   Sections 7-9 are extension-only: chrome.storage.local and a checklist instead of the mock portal. */
/* =====================================================================
   1. APPLICATION DATA  <-- edit times and text here
   min / max = Minerva's published range in minutes, mid = midpoint used for totals.
   type: "form" | "timed" | "writing". Timed steps 2-7 stay locked until step 1 is done.
   ===================================================================== */
const STEPS = [
  { id: 1, name: "Part 1: Bio & academic info", type: "form", min: 10, max: 15, mid: 12,
    desc: "Basic details about you and your studies. Unlocks every challenge." },
  { id: 2, name: "Math challenge", type: "timed", min: 8, max: 20, mid: 14,
    desc: "Timed online challenge. Do it in one sitting." },
  { id: 3, name: "Logical Reasoning challenge", type: "timed", min: 8, max: 20, mid: 14,
    desc: "Timed online challenge. Do it in one sitting." },
  { id: 4, name: "Reading Comprehension challenge", type: "timed", min: 8, max: 20, mid: 14,
    desc: "Timed online challenge. Do it in one sitting." },
  { id: 5, name: "Divergent Thinking challenge", type: "timed", min: 8, max: 20, mid: 14,
    desc: "Timed online challenge. Do it in one sitting." },
  { id: 6, name: "Written communication task", type: "timed", min: 20, max: 20, mid: 20,
    desc: "Timed written response." },
  { id: 7, name: "Verbal communication task", type: "timed", min: 20, max: 20, mid: 20,
    desc: "Timed verbal response." },
  { id: 8, name: "Accomplishments", type: "writing", min: 60, max: 60, mid: 60, approx: true,
    desc: "Examples, context, and supporting materials." },
  { id: 9, name: "Academic background", type: "form", min: 10, max: 15, mid: 12, external: true,
    desc: "Last 3 years of transcripts + counselor verification." },
];

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

const TYPE_LABEL = { form: "Form", timed: "Timed", writing: "Writing" };

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
   done:  { stepId: true }   asked: step 9(a) checkbox   time: picked minutes or null
   ===================================================================== */
const STORAGE_KEY = "minervaBuddy.v1";
let state = freshState();

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

function isDone(id) { return state.done[id] === true; }
function doneCount() { return STEPS.filter(s => isDone(s.id)).length; }
function isLocked(step) { return step.type === "timed" && !isDone(1); }
function stepById(id) { return STEPS.find(s => s.id === id); }

// Mark a step done / not done. Finishing step 9 implies the counselor was asked.
function setStepDone(id, value) {
  if (value) state.done[id] = true; else delete state.done[id];
  if (id === 9 && value) state.asked = true;
}

// Step 9(a). Un-asking the counselor also un-completes step 9.
function setAsked(value) {
  state.asked = value;
  if (!value) delete state.done[9];
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
  if (doneCount() === STEPS.length) return { kind: "done" };

  if (!isDone(1)) {
    return { kind: "step", step: stepById(1), why: "Everything else unlocks after Part 1." };
  }
  if (!state.asked) {
    return { kind: "counselor", why: "This one depends on someone else, so start it first." };
  }

  const available = state.time ?? DEFAULT_MINUTES;
  for (const step of STEPS) {
    if (isDone(step.id)) continue;
    const fits = step.type === "timed"
      ? available >= step.max + FOCUS_BUFFER   // timed: needs full focus time
      : available >= step.mid;                 // others: midpoint is enough
    if (fits) {
      return {
        kind: "step", step,
        why: "First open step that fits " + (state.time ? "your " + choiceLabel(state.time) : "about 1 hour") + ".",
        hint: step.type === "timed" ? "Find a quiet spot and close other programs." : null,
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
  const n = doneCount(), total = STEPS.length;
  const pct = Math.round((n / total) * 100);
  $("progressText").textContent = n + " of " + total + " steps done";
  $("progressPct").textContent = pct + "%";
  $("progressFill").style.width = pct + "%";
  $("progressFill").classList.toggle("complete", n === total);
  $("progressBar").setAttribute("aria-valuenow", n);
  $("progressBar").setAttribute("aria-valuetext", n + " of " + total + " steps done");
}

// 2. Time left (number animates smoothly between values)
let shownMinutes = null, timeAnim = null;
function renderTimeLeft() {
  const open = STEPS.filter(s => !isDone(s.id));
  const sum = key => open.reduce((t, s) => t + s[key], 0);
  const target = sum("mid");

  $("timeRange").textContent = open.length
    ? "range " + formatMinutes(sum("min")) + " – " + formatMinutes(sum("max"))
    : "All 9 steps are complete.";

  const paint = v => {
    $("timeLeft").textContent = roundTo5(v) > 0 ? "About " + formatMinutes(v) + " of work left" : "No work left. Just submit!";
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
    title.textContent = "Everything's done — submit before " + (round ? longDate(round.admissions) : "the deadline") + "!";
    why.textContent = "All 9 steps are complete. Nice work.";
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
    why.textContent = isDone(8)
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
    else if (next.kind === "counselor") { setAsked(true); update(9); }
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

// Call this after ANY change: saves, then redraws checklist + panel.
function update() {
  saveState();
  renderChecklist();
  renderPanel();
}

/* =====================================================================
   8. CHECKLIST  (the extension has no mock portal, so steps are ticked here)
   ===================================================================== */
function buildChecklist() {
  const items = [];
  STEPS.forEach(s => {
    if (s.id === 9) {
      items.push('<label class="check" data-row="asked"><input type="checkbox" data-asked> <span>I asked my counselor to send transcripts and the form</span></label>');
    }
    items.push('<label class="check" data-row="' + s.id + '"><input type="checkbox" data-step="' + s.id + '"> <span>' +
      (s.id === 9 ? s.name + ": section complete" : s.name) + '<small>' + TYPE_LABEL[s.type] + " · " + rangeText(s) + "</small></span></label>");
  });
  $("checklistItems").innerHTML = items.join("");

  $("checklistItems").addEventListener("change", e => {
    const box = e.target;
    if (box.hasAttribute("data-asked")) setAsked(box.checked);
    else if (box.dataset.step) setStepDone(Number(box.dataset.step), box.checked);
    update();
  });
  $("resetBtn").addEventListener("click", () => { state = freshState(); update(); });
}

function renderChecklist() {
  STEPS.forEach(s => {
    const box = document.querySelector('[data-step="' + s.id + '"]');
    const locked = isLocked(s) && !isDone(s.id);
    box.checked = isDone(s.id);
    box.disabled = locked;
    box.closest(".check").classList.toggle("locked", locked);
    box.closest(".check").title = locked ? "Locked until Part 1 is submitted" : "";
  });
  document.querySelector("[data-asked]").checked = state.asked;
}

/* =====================================================================
   9. START
   ===================================================================== */
(async function start() {
  state = await loadState();
  bindPanel();
  buildChecklist();
  renderChecklist();
  renderPanel();

  // In the real extension the "x" closes the side panel
  $("closeBtn").addEventListener("click", () => window.close());

  // Keep several open panels in sync
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[STORAGE_KEY]) {
      state = normalizeState(changes[STORAGE_KEY].newValue);
      renderChecklist();
      renderPanel();
    }
  });
})();

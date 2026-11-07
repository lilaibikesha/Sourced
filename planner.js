/* Application Planner: unofficial student-made tool.
   Everything runs in this browser tab. No data is saved or sent anywhere.
   All facts, steps, estimates and dates come from data.json. */
(function () {
  "use strict";

  const DAY = 24 * 60 * 60 * 1000;

  // ---------- helpers ----------
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) {
      if (kid === null || kid === undefined || kid === false) continue;
      n.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return n;
  }
  function parseDate(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
  function today() { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function daysBetween(a, b) { return Math.round((b - a) / DAY); }
  function fmt(d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  function fmtShort(d) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
  function hours(min) { const h = min / 60; return h < 10 ? (Math.round(h * 10) / 10).toString() : Math.round(h).toString(); }
  function isUrl(s) { return /^https?:\/\//.test(s || ""); }
  function sourceLink(src) {
    if (isUrl(src)) return el("a", { href: src, target: "_blank", rel: "noopener" }, "source");
    return el("span", {}, src || "");
  }
  // Rounds still open: deadline is end of that day.
  function openRounds(data) {
    const t = today();
    return data.cycle.rounds.filter(r => parseDate(r.admissions_deadline) >= t);
  }

  // ---------- shared page chrome ----------
  function chrome(data, page) {
    const m = data.meta;
    const nav = [
      ["index.html", "Start", "start"],
      ["planner.html", "Planner", "planner"],
      ["guide-international-school.html", "International school guide", "intl"],
      ["guide-local-school.html", "Local school guide", "local"]
    ];
    const header = document.getElementById("site-header");
    header.replaceChildren(
      el("div", { class: "topbar" },
        el("div", { class: "wrap" },
          el("a", { class: "brand", href: "index.html" }, m.site_name),
          el("nav", { class: "topnav", "aria-label": "Pages" },
            nav.map(([href, label, id]) => el("a", { href, "aria-current": id === page ? "page" : null }, label))
          )
        )
      ),
      el("div", { class: "disclaimer", role: "note" },
        el("div", { class: "wrap" },
          el("strong", {}, m.disclaimer.split(".")[0] + ". "),
          m.disclaimer.split(".").slice(1).join(".").trim(),
          " ",
          el("span", { class: "muted" }, "Last checked: " + m.last_checked_display + ".")
        )
      )
    );

    const footer = document.getElementById("site-footer");
    footer.replaceChildren(
      el("div", { class: "wrap" },
        el("p", {}, el("strong", {}, "Last checked: " + m.last_checked_display)),
        el("p", { class: "small" }, "Official sources for the facts on this page:"),
        el("ul", {}, m.official_sources.map(s => el("li", {}, el("a", { href: s.url, target: "_blank", rel: "noopener" }, s.label), " (" + s.url + ")"))),
        el("p", { class: "small" }, "Questions about requirements? Email ", el("a", { href: "mailto:" + m.contact_email }, m.contact_email), "."),
        el("p", { class: "small" }, m.privacy_note),
        el("p", { class: "small" }, m.disclaimer)
      )
    );
  }

  // ---------- start page ----------
  function renderStart(data) {
    const root = document.getElementById("app");
    const sp = data.start_page;
    root.replaceChildren(
      el("h1", {}, sp.question),
      el("p", { class: "lede" }, sp.intro),
      el("div", { class: "choices" },
        data.school_types.map((s, i) => el("section", { class: "choice" },
          el("h2", {}, el("span", { class: "letter" }, String.fromCharCode(97 + i) + ")"), s.label),
          el("div", { class: "actions" },
            el("a", { class: "btn", href: "planner.html?school=" + encodeURIComponent(s.id) }, "Plan my application"),
            el("a", { href: s.guide }, s.also_guide ? "Local school guide" : "Read the guide"),
            s.also_guide ? el("a", { href: s.also_guide }, "International school guide") : null
          )
        ))
      ),
      el("p", { class: "meta" }, "Deadlines and time estimates from ",
        el("a", { href: sp.source, target: "_blank", rel: "noopener" }, "Minerva's admissions page"),
        ". Last checked: " + data.meta.last_checked_display + ".")
    );
  }

  // ---------- planner ----------
  function renderPlannerForm(data) {
    const params = new URLSearchParams(location.search);
    const schoolParam = params.get("school");
    const rounds = openRounds(data);
    const form = document.getElementById("plan-form");

    const roundField = rounds.length
      ? el("label", { class: "field" }, el("span", {}, "Which round are you aiming for?"),
          el("select", { name: "round" }, rounds.map(r =>
            el("option", { value: r.id }, r.name + " (" + fmt(parseDate(r.admissions_deadline)) + ")"))))
      : el("p", { class: "notice warn" }, "All deadlines listed for this cycle have passed. Check minerva.edu for the next cycle.");

    const ownChecks = data.own_steps.map(s =>
      el("label", { class: "check" }, el("input", { type: "checkbox", name: "done", value: s.id }), el("span", {}, s.name)));

    const wRecords = data.waiting_steps.find(w => w.id === "records");
    const wVerif = data.waiting_steps.find(w => w.id === "verification");

    form.replaceChildren(
      el("fieldset", {},
        el("legend", {}, "Your round and school"),
        roundField,
        el("label", { class: "field" }, el("span", {}, "What kind of school are you at?"),
          el("select", { name: "school" }, data.school_types.map(s =>
            el("option", { value: s.id, selected: s.id === schoolParam }, s.short_label))))
      ),
      el("fieldset", {},
        el("legend", {}, "What have you finished?"),
        ownChecks,
        el("label", { class: "check" }, el("input", { type: "checkbox", name: "records_requested" }), el("span", {}, wRecords.done_label)),
        el("label", { class: "check" }, el("input", { type: "checkbox", name: "verification_done" }), el("span", {}, wVerif.done_label)),
        el("label", { class: "field" }, el("span", {}, "Do you need translations of your records?"),
          el("select", { name: "translations" },
            el("option", { value: "no" }, "No, my records are in English"),
            el("option", { value: "yes" }, "Yes, not done yet"),
            el("option", { value: "done" }, "Yes, and they're done"))),
        el("label", { class: "field" }, el("span", {}, "Financial aid documents"),
          el("select", { name: "finaid" },
            el("option", { value: "not-started" }, "Not started"),
            el("option", { value: "in-progress" }, "In progress"),
            el("option", { value: "done" }, "Done"),
            el("option", { value: "not-needed" }, "Not needed (not applying for aid)")))
      ),
      el("fieldset", {},
        el("legend", {}, "Your time and computer"),
        el("p", { class: "small", style: "margin-bottom:.25rem;font-weight:600" }, "Do you have regular access to a desktop or laptop?"),
        el("p", { class: "small muted" }, data.computer.requirement + " (Minerva)"),
        el("div", { class: "radio-row" },
          el("label", {}, el("input", { type: "radio", name: "computer", value: "yes", checked: true }), "Yes"),
          el("label", {}, el("input", { type: "radio", name: "computer", value: "no" }), "No")),
        el("label", { class: "field" }, el("span", {}, "Hours per week you can spend"),
          el("input", { type: "number", name: "hours", min: "0.5", max: "40", step: "0.5", value: String(data.planning.default_hours_per_week), inputmode: "decimal" }))
      ),
      el("fieldset", { class: "cal-fieldset" },
        el("legend", {}, "Tap the days you're busy"),
        el("p", { class: "small muted", id: "cal-note" }),
        el("p", { class: "cal-legend small muted", "aria-hidden": "true" },
          el("span", { class: "sw sw-busy" }), "Busy ",
          el("span", { class: "sw sw-today" }), "Today ",
          el("span", { class: "sw sw-dl" }), "Deadline ",
          el("span", { class: "sw-dot" }), "Step planned"),
        el("div", { id: "cal" }),
        el("div", { class: "cal-foot" },
          el("span", { id: "cal-count", "aria-live": "polite" }),
          el("button", { type: "button", class: "btn secondary", id: "cal-clear", onclick: () => {
            state.busy.clear(); state.selected = null; state.info = "All busy days cleared."; update(data);
          } }, "Clear all")),
        el("p", { id: "cal-info", class: "cal-info", "aria-live": "polite" })
      )
    );
    form.addEventListener("input", () => update(data));
    form.addEventListener("change", () => update(data));
    form.addEventListener("submit", e => e.preventDefault());
  }

  // ---------- busy-days state (kept in memory, this tab only) ----------
  const state = { busy: new Set(), selected: null, info: "", focus: null };
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function initBusy(data) {
    const t = today();
    for (const r of (data.calendar.default_busy || []))
      for (let d = parseDate(r.start); d <= parseDate(r.end); d = addDays(d, 1))
        if (d >= t) state.busy.add(iso(d));
  }
  function update(data) { renderPlan(data); }

  // Schedules own steps backwards from the target date, only on free days from today on.
  // Each free day holds (hours per week / 7) hours. A step short enough for one day stays on one day.
  function scheduleOwn(remaining, hoursPerWeek, target, t) {
    const cap = hoursPerWeek * 60 / 7;
    const isBusy = d => state.busy.has(iso(d));
    const prevFree = d => { do { d = addDays(d, -1); } while (d >= t && isBusy(d)); return d; };
    let day = target;
    while (day >= t && isBusy(day)) day = addDays(day, -1);
    let left = cap;
    const dayMap = new Map();
    const scheduled = [];
    for (let i = remaining.length - 1; i >= 0; i--) {
      const s = remaining[i];
      let m = s.minutes_max, startBy = null;
      if (day >= t && m <= cap && left < m) { day = prevFree(day); left = cap; }
      while (m > 0.001 && day >= t) {
        if (left <= 0.001) { day = prevFree(day); left = cap; continue; }
        const use = Math.min(m, left); m -= use; left -= use;
        const k = iso(day);
        if (!dayMap.has(k)) dayMap.set(k, []);
        if (!dayMap.get(k).includes(s.name)) dayMap.get(k).unshift(s.name);
        startBy = day;
      }
      scheduled.unshift({ step: s, startBy, late: m > 0.001 });
    }
    return { scheduled, dayMap, fits: scheduled.every(x => !x.late) };
  }

  function readForm() {
    const f = document.getElementById("plan-form");
    const fd = new FormData(f);
    return {
      round: fd.get("round"),
      school: fd.get("school"),
      done: new Set(fd.getAll("done")),
      recordsRequested: fd.get("records_requested") !== null,
      verificationDone: fd.get("verification_done") !== null,
      translations: fd.get("translations"),
      finaid: fd.get("finaid"),
      computer: fd.get("computer"),
      hours: Math.max(0.5, parseFloat(fd.get("hours")) || data_default_hours)
    };
  }
  let data_default_hours = 2;

  function computePlan(data, input) {
    const t = today();
    const rounds = openRounds(data);
    const round = rounds.find(r => r.id === input.round) || rounds[0];
    const school = data.school_types.find(s => s.id === input.school) || data.school_types[0];
    const buffer = data.planning.buffer_days_before_deadline;
    const deadline = parseDate(round.admissions_deadline);
    const faDeadline = parseDate(round.financial_aid_deadline);
    const target = addDays(deadline, -buffer);

    // Own work, scheduled backwards from the deadline in order.
    const remaining = data.own_steps.filter(s => !input.done.has(s.id));
    const doneOwn = data.own_steps.filter(s => input.done.has(s.id));
    const minTotal = remaining.reduce((a, s) => a + s.minutes_min, 0);
    const maxTotal = remaining.reduce((a, s) => a + s.minutes_max, 0);
    // Own steps never land on a busy day or a past day.
    const sched = scheduleOwn(remaining, input.hours, target, t);
    const scheduled = sched.scheduled;
    const ownFits = sched.fits;
    let freeDays = 0;
    for (let d = t; d <= target; d = addDays(d, 1)) if (!state.busy.has(iso(d))) freeDays++;
    const freeDaysNeeded = Math.ceil(maxTotal / (input.hours * 60 / 7));
    let neededHours = null;
    if (!ownFits && freeDays > 0) {
      for (let h = Math.floor(input.hours * 2) / 2 + 0.5; h <= 40; h += 0.5)
        if (scheduleOwn(remaining, h, target, t).fits) { neededHours = h; break; }
    }

    // Waiting steps, scheduled first.
    const waiting = [];
    const waitingDone = [];
    for (const w of data.waiting_steps) {
      let status = "todo";
      if (w.id === "records" && input.recordsRequested) status = "requested";
      if (w.id === "verification" && input.verificationDone) status = "done";
      if (w.id === "translations") {
        if (input.translations === "no") continue;
        if (input.translations === "done") status = "done";
      }
      if (w.id === "financial-documents") {
        if (input.finaid === "not-needed") continue;
        if (input.finaid === "done") status = "done";
        if (input.finaid === "in-progress") status = "in-progress";
      }
      if (status === "done") { waitingDone.push(w); continue; }
      const extra = w.school_dependent ? (school.extra_waiting_days || 0) : 0;
      const finishBy = addDays(w.deadline === "financial_aid" ? faDeadline : deadline, -buffer);
      // School steps: busy days (holidays etc.) don't count as progress, so skip them when counting back.
      const need = w.days_max + extra;
      let startBy = finishBy, counted = 0;
      while (counted < need) {
        startBy = addDays(startBy, -1);
        if (!(w.school_dependent && state.busy.has(iso(startBy)))) counted++;
      }
      const skippedBusy = daysBetween(startBy, finishBy) - need;
      waiting.push({ step: w, status, extra, finishBy, startBy, skippedBusy, late: status === "todo" && startBy < t });
    }
    waiting.sort((a, b) => a.startBy - b.startBy);
    const waitingFits = waiting.every(w => !w.late);

    const idx = rounds.indexOf(round);
    const nextRound = rounds[idx + 1] || null;
    const firstChallenge = scheduled.find(x => x.step.needs_computer && x.startBy);

    return { t, round, school, buffer, deadline, faDeadline, target, remaining, doneOwn, minTotal, maxTotal,
      scheduled, dayMap: sched.dayMap, ownFits, freeDays, freeDaysNeeded, neededHours, waiting, waitingDone, waitingFits, nextRound, firstChallenge };
  }

  function renderPlan(data) {
    const out = document.getElementById("plan-output");
    if (!openRounds(data).length) { out.replaceChildren(); return; }
    const input = readForm();
    const p = computePlan(data, input);
    const kids = [];

    // Summary
    kids.push(el("div", { class: "summary", "aria-live": "polite" },
      el("p", {}, "Your own work left"),
      el("span", { class: "big" }, p.remaining.length ? "About " + hours(p.minTotal) + " to " + hours(p.maxTotal) + " hours" : "All done"),
      el("p", {}, p.round.name + " deadline: " + fmt(p.deadline) + " (" + Math.max(0, daysBetween(p.t, p.deadline)) + " days from today)"),
      el("p", { class: "small" }, "At " + input.hours + " hours a week. Waiting time (school, translations, documents) isn't counted as your hours.")
    ));

    // Warnings
    if (!p.ownFits || !p.waitingFits) {
      const lines = [el("strong", {}, "This plan doesn't fit before the deadline.")];
      if (!p.ownFits) {
        lines.push(el("p", {}, "At " + input.hours + " hours a week your remaining work needs about " + p.freeDaysNeeded +
          " free days, but there are " + p.freeDays + " free days left (not counting busy days, and aiming to finish " + p.buffer + " days early)."));
        if (p.neededHours)
          lines.push(el("p", {}, "Try about " + p.neededHours + " hours a week, or unmark some busy days."));
      }
      if (!p.waitingFits) {
        const late = p.waiting.filter(w => w.late).map(w => w.step.name.toLowerCase());
        lines.push(el("p", {}, "These waiting steps should have started already: " + late.join("; ") + ". Start them today and ask how long they will take."));
      }
      lines.push(el("p", {}, p.nextRound
        ? ["Or aim for the next round, ", el("strong", {}, p.nextRound.name), ", deadline " + fmt(parseDate(p.nextRound.admissions_deadline)) + "."]
        : "This is the last round listed for this cycle. Email admissions@minerva.edu if you're worried about timing."));
      kids.push(el("div", { class: "notice warn", role: "alert" }, lines));
    } else {
      kids.push(el("div", { class: "notice good" }, el("p", {}, el("strong", {}, "This plan fits. "), "Start each step by its date and you'll finish " + p.buffer + " days before the deadline.")));
    }

    // Computer note
    if (input.computer === "no") {
      kids.push(el("div", { class: "notice warn" },
        el("p", {}, el("strong", {}, "Arrange a computer first. "), data.computer.no_access_note),
        p.firstChallenge ? el("p", {}, "Have it arranged before " + fmt(p.firstChallenge.startBy) + ", when your first challenge is planned.") : null,
        el("p", { class: "small" }, el("a", { href: "guide-local-school.html#computer" }, "Laptop access checklist"))
      ));
    }

    // Waiting steps
    kids.push(el("h2", {}, "Waiting steps: start these first"));
    kids.push(el("p", { class: "muted small" }, "These depend on other people, so they're scheduled earliest. " +
      (p.school.extra_waiting_note || "") + " Waiting times are placeholder estimates until real survey data replaces them."));
    if (p.waiting.length) {
      kids.push(el("ol", { class: "steps" }, p.waiting.map(w => el("li", {},
        el("div", { class: "step-top" },
          el("span", { class: "step-name" }, el("span", { class: "tag waiting" }, "Waiting"), w.step.name),
          w.status === "todo"
            ? el("span", { class: "date" + (w.late ? " late" : "") }, w.late ? "Start today (was due " + fmtShort(w.startBy) + ")" : "Start by " + fmtShort(w.startBy))
            : el("span", { class: "date" }, (w.status === "requested" ? "Requested. " : "In progress. ") + "Done by " + fmtShort(w.finishBy))
        ),
        el("p", { class: "step-tip" },
          "Can take about " + w.step.days_min + " to " + w.step.days_max + " days" + (w.extra ? " (+" + w.extra + " for your school type)" : "") +
          (w.skippedBusy ? ", plus " + w.skippedBusy + " busy day" + (w.skippedBusy === 1 ? "" : "s") + " that don't count" : "") +
          ". Finish by " + fmtShort(w.finishBy) + (w.step.deadline === "financial_aid" ? " (financial aid deadline)" : "") + ". " + w.step.tip + " ",
          "Time: ", sourceLink(w.step.source), ". Requirement: ", sourceLink(w.step.requirement_source), ".")
      ))));
    } else {
      kids.push(el("p", {}, "No waiting steps left."));
    }

    // Own work checklist
    kids.push(el("h2", {}, "Your checklist"));
    kids.push(el("p", { class: "muted small" }, "Counted back from the deadline, in the order Minerva describes, skipping your busy days. Time estimates are Minerva's (",
      el("a", { href: data.cycle.source, target: "_blank", rel: "noopener" }, "source"), ")."));
    if (p.scheduled.length) {
      kids.push(el("ol", { class: "steps" }, p.scheduled.map(x => el("li", {},
        el("div", { class: "step-top" },
          el("span", { class: "step-name" }, x.step.needs_computer ? el("span", { class: "tag" }, "Computer") : null, x.step.name),
          el("span", { class: "date" + (x.late ? " late" : "") }, x.late ? "Start today, doesn't fit" : "Start by " + fmtShort(x.startBy))
        ),
        el("p", { class: "step-tip" }, "About " + (x.step.minutes_min === x.step.minutes_max ? x.step.minutes_max : x.step.minutes_min + " to " + x.step.minutes_max) + " minutes. " + x.step.tip)
      ))));
    } else {
      kids.push(el("p", {}, "You've finished all your own steps."));
    }

    const doneAll = [...p.doneOwn.map(s => s.name), ...p.waitingDone.map(w => w.name)];
    if (doneAll.length) {
      kids.push(el("h3", {}, "Done"));
      kids.push(el("ul", { class: "plain done-list" }, doneAll.map(n => el("li", {}, n))));
    }

    // Financial aid deadline, shown separately
    const gap = daysBetween(p.deadline, p.faDeadline);
    kids.push(el("h2", {}, "Financial aid deadline"));
    kids.push(el("div", { class: "fa-box" },
      el("div", { class: "big" }, fmt(p.faDeadline)),
      el("p", {}, gap + " days after the admissions deadline for " + p.round.name + ". Financial aid decisions come with your admissions decision, by " + fmt(parseDate(p.round.decision_by)) + "."),
      el("p", { class: "small muted" }, input.finaid === "not-needed" ? "You said you're not applying for financial aid." : "Funding is limited, so Minerva recommends applying early."),
      el("p", { class: "small" }, el("a", { href: p.round.source, target: "_blank", rel: "noopener" }, "Official deadlines"), " · Last checked " + data.meta.last_checked_display)
    ));

    out.replaceChildren(...kids);
    renderCalendar(data, p, input);
  }

  // ---------- busy-days calendar ----------
  function renderCalendar(data, p, input) {
    const box = document.getElementById("cal");
    if (!box) return;
    const t = p.t;
    const showAid = input.finaid !== "not-needed";
    const end = showAid && p.faDeadline > p.deadline ? p.faDeadline : p.deadline;
    const months = [];
    for (let m = new Date(t.getFullYear(), t.getMonth(), 1); m <= end; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) months.push(m);
    const wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const long = d => d.toLocaleDateString("en-US", { month: "long", day: "numeric" });

    const monthEls = months.map(m => {
      const cells = wd.map(w => el("div", { class: "cal-wd", "aria-hidden": "true" }, w));
      const offset = (m.getDay() + 6) % 7; // Monday first
      for (let i = 0; i < offset; i++) cells.push(el("div", { class: "cal-empty", "aria-hidden": "true" }));
      for (let d = new Date(m); d.getMonth() === m.getMonth(); d = addDays(d, 1)) {
        const day = new Date(d);
        const k = iso(day);
        const past = day < t, after = day > end;
        const isToday = +day === +t;
        const isDl = +day === +p.deadline, isAid = showAid && +day === +p.faDeadline;
        const busy = state.busy.has(k);
        const steps = !past ? p.dayMap.get(k) : null;
        const cls = ["cal-day", past && "past", after && "after", isToday && "today", (isDl || isAid) && "deadline",
          busy && !past && "busy", steps && "has-step", state.selected === k && "selected"].filter(Boolean).join(" ");
        let label = long(day);
        if (past) label += ", past";
        else if (after) label += ", after your deadline";
        else label += busy ? ", busy" : ", free";
        if (isToday) label += ", today";
        if (isDl) label += ", deadline";
        if (isAid) label += ", aid deadline";
        if (steps) label += ", planned: " + steps.join(", ");
        const tappable = !past && !after;
        cells.push(el("button", {
          type: "button", class: cls, "data-date": k, "aria-label": label,
          "aria-pressed": tappable ? String(busy) : null, disabled: !tappable,
          onclick: tappable ? () => {
            if (steps && !busy && state.selected !== k) {
              state.selected = k;
              state.info = fmtShort(day) + ": " + steps.join(", ") + ". Tap again to mark this day busy.";
            } else {
              if (busy) state.busy.delete(k); else state.busy.add(k);
              state.selected = null;
              state.info = fmtShort(day) + (busy ? " is free again." : " marked busy.");
            }
            state.focus = k;
            update(data);
          } : null
        },
          el("span", { class: "num" }, String(day.getDate())),
          isDl ? el("span", { class: "lbl" }, "Deadline") : null,
          isAid ? el("span", { class: "lbl" }, "Aid deadline") : null,
          steps ? el("span", { class: "dot", "aria-hidden": "true" }) : null
        ));
      }
      return el("section", { class: "cal-month" },
        el("h3", {}, m.toLocaleDateString("en-US", { month: "long", year: "numeric" })),
        el("div", { class: "cal-grid" }, cells));
    });
    box.replaceChildren(...monthEls);

    // Holiday note, only when the default busy days fall inside the calendar.
    const note = document.getElementById("cal-note");
    const showsHoliday = (data.calendar.default_busy || []).some(r => parseDate(r.end) >= t && parseDate(r.start) <= end);
    note.textContent = showsHoliday ? data.calendar.default_busy_note : "";
    note.hidden = !showsHoliday;

    const n = [...state.busy].filter(k => parseDate(k) >= t).length;
    document.getElementById("cal-count").textContent = n + " busy day" + (n === 1 ? "" : "s") + " marked";
    const info = document.getElementById("cal-info");
    info.textContent = state.info || "Tap a day with a dot to see which step is planned.";

    if (state.focus) {
      const b = box.querySelector('[data-date="' + state.focus + '"]');
      if (b) b.focus({ preventScroll: true });
      state.focus = null;
    }
  }

  // ---------- guides ----------
  function section(s, id) {
    return el("section", { id: id || null },
      el("h2", {}, s.heading),
      el("ul", { class: "plain" }, s.items.map(i => el("li", {}, linkEmail(i)))),
      el("p", { class: "meta" }, "Source: ", sourceLink(s.source), " · Last checked " + s.last_checked)
    );
  }
  function linkEmail(text) {
    const parts = text.split(/(admissions@minerva\.edu)/);
    return parts.map(p => p === "admissions@minerva.edu" ? el("a", { href: "mailto:admissions@minerva.edu" }, p) : p);
  }

  function renderGuideIntl(data) {
    const g = data.guides.international;
    document.getElementById("app").replaceChildren(
      el("h1", {}, g.title),
      el("p", { class: "lede" }, g.subtitle),
      el("p", {}, el("a", { class: "btn", href: "planner.html?school=international" }, "Open the planner")),
      g.sections.map(s => section(s)),
      el("div", { class: "callout" }, "Anything not covered here? Ask Minerva at ", el("a", { href: "mailto:admissions@minerva.edu" }, "admissions@minerva.edu"), ".")
    );
  }

  function renderGuideLocal(data) {
    const g = data.guides.local;
    const msgBox = el("div", { class: "copybox", id: "message-text" }, g.message.text);
    const status = el("span", { class: "small muted", "aria-live": "polite" });
    const copyBtn = el("button", { class: "btn", type: "button", onclick: async () => {
      try { await navigator.clipboard.writeText(g.message.text); status.textContent = "Copied."; }
      catch (e) {
        const r = document.createRange(); r.selectNodeContents(msgBox);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        status.textContent = "Selected. Press copy on your keyboard or phone.";
      }
    } }, "Copy the message");

    document.getElementById("app").replaceChildren(
      el("h1", {}, g.title),
      el("p", { class: "lede" }, g.subtitle),
      el("div", { class: "callout" }, linkEmail(g.equivalent_official_notice)),
      el("p", {}, el("a", { class: "btn", href: "planner.html?school=local" }, "Open the planner")),
      g.sections.map(s => section(s)),
      el("section", { id: "message" },
        el("h2", {}, g.message.heading),
        el("p", {}, g.message.note),
        msgBox,
        el("div", { class: "copy-row" }, copyBtn, status),
        el("p", { class: "meta" }, "Based on: ", sourceLink(g.message.source), " · Last checked " + g.message.last_checked)
      ),
      section(g.translations, "translations"),
      el("section", { id: "computer" },
        el("h2", {}, g.computer_checklist.heading),
        el("div", {}, g.computer_checklist.items.map(i => el("label", { class: "check" }, el("input", { type: "checkbox" }), el("span", {}, linkEmail(i))))),
        el("p", { class: "meta" }, "Source: ", sourceLink(g.computer_checklist.source), " · Last checked " + g.computer_checklist.last_checked)
      ),
      el("div", { class: "callout" }, linkEmail(g.equivalent_official_notice))
    );
  }

  // ---------- boot ----------
  async function boot() {
    const page = document.body.dataset.page;
    let data;
    try {
      const res = await fetch("data.json", { cache: "no-cache" });
      data = await res.json();
    } catch (e) {
      document.getElementById("app").textContent = "Couldn't load data.json. Please reload the page.";
      return;
    }
    data_default_hours = data.planning.default_hours_per_week;
    chrome(data, page);
    if (page === "start") renderStart(data);
    if (page === "planner") { initBusy(data); renderPlannerForm(data); update(data); }
    if (page === "intl") renderGuideIntl(data);
    if (page === "local") renderGuideLocal(data);
  }
  boot();
})();

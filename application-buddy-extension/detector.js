/* detector.js — auto-detection prototype (Easy steps only).
   Decides which Application Buddy steps a page shows as COMPLETE, using only
   visible headings / labels / status text that appear on the real Admission
   Center (wording copied from Ben's screenshot set, Nov 2026).

   Privacy rules this file follows:
   - Reads element text only. Never reads form field values, names, emails,
     answers or uploads. Returns step ids + a short signal name, nothing else.
   - No network calls. No storage here (content.js stores the result locally).

   Not covered on purpose (rated "Possible", left manual): Accomplishments count,
   Academic Performance, Disciplinary Record, financial aid applied. See
   docs/application-buddy/REPORT.md for the feasibility table. */
(function (root) {
  const norm = s => (s || "").replace(/\s+/g, " ").trim();
  // Visible-ish text of an element: its text nodes joined with spaces (so "Basic Information"
  // and "Complete" in sibling blocks don't run together). Skips script/style. Input values
  // are attributes/properties, not text nodes, so they are never read.
  function textOf(el) {
    if (!el) return "";
    const doc = el.ownerDocument || el;
    const walker = doc.createTreeWalker(el, 4 /* NodeFilter.SHOW_TEXT */);
    const parts = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (p && p.closest("script,style,noscript,textarea,select")) continue;
      parts.push(n.nodeValue);
    }
    return norm(parts.join(" "));
  }

  // Elements whose own visible text is exactly `label` (headings, card titles, row titles).
  function labelled(doc, label) {
    const out = [];
    const walker = doc.createTreeWalker(doc.body, 1 /* NodeFilter.SHOW_ELEMENT */);
    for (let el = walker.nextNode(); el; el = walker.nextNode()) {
      if (el.matches("script,style,input,textarea,select,option")) continue;
      if (el.children.length <= 2 && norm(el.textContent) === label) out.push(el);
    }
    return out;
  }

  // Walk up from a title to the smallest surrounding block that shows a status.
  // Returns true if that block matches `yes` and not `no`. Gives up (false) if the
  // block grows past maxLen or starts to include a sibling title (another card).
  function cardSays(doc, label, yes, no, siblings, maxLen) {
    const others = (siblings || []).filter(s => s !== label);
    return labelled(doc, label).some(el => {
      let node = el;
      for (let i = 0; i < 7 && node && node !== doc.body; i++) {
        const t = textOf(node);
        if (t.length > (maxLen || 450)) return false;
        if (others.some(o => t.includes(o))) return false;
        const y = yes.test(t), n = !!no && no.test(t);
        if (y || n) return y && !n;
        node = node.parentElement;
      }
      return false;
    });
  }

  const CHALLENGE_TITLES = {
    understanding: "Understanding", creativity: "Creativity", math: "Math",
    reasoning: "Reasoning", writing: "Writing", expression: "Expression",
  };
  const CHALLENGES = Object.values(CHALLENGE_TITLES);
  const PART_CARDS = ["Part 1", "Part 2", "Part 3", "Official Documents & Information"];
  const DOC_ROWS = ["Academic Performance", "Financial Aid Application", "Verify your ID",
    "Parent/Guardian Contact Information", "Disciplinary Record"];

  // Each rule: [stepId, signalName, test(doc, pageText)]
  const RULES = [
    // Part 1: the Admission Center only exists after Part 1 is submitted.
    ["part1", "hub-part1-card-complete", d => cardSays(d, "Part 1", /\bComplete\b/, /Go to section/, PART_CARDS)],
    ["part1", "hub-visible", (d, t) => /Your Application Progress/.test(t) && /Welcome,/.test(t)],

    // Part 2 challenge cards (Admission Center and Challenge Lobby).
    ...Object.entries(CHALLENGE_TITLES).map(([id, title]) =>
      [id, "card-challenge-complete", d => cardSays(d, title, /Challenge Complete/, /Take the Challenge/, CHALLENGES)]),

    // Section cards at the top of the Admission Center flip to "Complete" when a part is closed.
    ["closePart2", "hub-part2-card-complete", d => cardSays(d, "Part 2", /\bComplete\b/, /Go to section/, PART_CARDS)],
    ["closePart3", "hub-part3-card-complete", d => cardSays(d, "Part 3", /\bComplete\b/, /Go to section/, PART_CARDS)],
    ["closeDocs", "hub-docs-card-complete", d => cardSays(d, "Official Documents & Information", /\bComplete\b/, /Go to section/, PART_CARDS)],

    // Official Documents rows: a finished row shows "Edit" instead of its action button.
    ["verifyId", "row-edit", d => cardSays(d, "Verify your ID", /Edit/, /Verify Your ID/, DOC_ROWS)],
    ["verifyId", "verification-complete-page", (d, t) => /Verification Complete!/.test(t) && /identity has been verified successfully/i.test(t)],
    ["parentGuardian", "row-edit", d => cardSays(d, "Parent/Guardian Contact Information", /Edit/, null, DOC_ROWS)],

    // Financial aid (optional): the "Skip for now" decision is shown as a sentence.
    ["financialAid", "declined-message", (d, t) => /You indicated that you do not need Financial Aid/.test(t)],

    // Submitted.
    ["submit", "congratulations-page", (d, t) => /your application has been submitted/i.test(t)],
  ];

  function detect(doc) {
    const pageText = textOf(doc.body);
    const found = {};
    for (const [id, signal, test] of RULES) {
      if (found[id]) continue;
      try { if (test(doc, pageText)) found[id] = signal; } catch (e) { /* ignore a broken rule */ }
    }
    // Implied steps. The real Admission Center keeps each "Close" button disabled until its
    // section is done, and Submit stays locked until every part is closed (screens 01, 19-21).
    // So a closed section proves the steps inside it, even ones we can't see directly
    // (Accomplishments count, Academic Performance, Disciplinary Record).
    const IMPLIES = {
      submit: ["part1", "closePart2", "closePart3", "closeDocs"],
      closePart2: ["part1", "understanding", "creativity", "math", "reasoning", "writing", "expression"],
      closePart3: ["part1", "accomplishments"],
      closeDocs: ["part1", "academic", "verifyId", "parentGuardian", "disciplinary"],
      expression: ["verifyId"],  // the graded Expression challenge will not start without ID verification
    };
    let grew = true;
    while (grew) {
      grew = false;
      Object.entries(IMPLIES).forEach(([src, ids]) => {
        if (!found[src]) return;
        ids.forEach(id => { if (!found[id]) { found[id] = "implied-by-" + src; grew = true; } });
      });
    }
    return found;
  }

  root.BuddyDetector = { detect, RULES };
})(typeof window !== "undefined" ? window : globalThis);

/* content.js — runs on matching application pages (see manifest.json).
   Calls BuddyDetector.detect() when the page loads and whenever it changes,
   and records newly detected steps in chrome.storage.local:
     "minervaBuddy.auto.v1": { stepId: { at: ISO time, signal: "rule name" } }
   That is the only thing stored. Nothing is sent anywhere. */
(function () {
  if (window.__applicationBuddyContent) return;
  window.__applicationBuddyContent = true;
  const AUTO_KEY = "minervaBuddy.auto.v1";
  let lastKey = "";

  async function run() {
    const found = window.BuddyDetector.detect(document);
    const key = Object.keys(found).sort().join(",");
    if (!key || key === lastKey) return;
    lastKey = key;
    const saved = await chrome.storage.local.get(AUTO_KEY);
    const current = saved[AUTO_KEY] || {};
    let changed = false;
    Object.entries(found).forEach(([id, signal]) => {
      if (!current[id]) { current[id] = { at: new Date().toISOString(), signal }; changed = true; }
    });
    if (changed) await chrome.storage.local.set({ [AUTO_KEY]: current });
  }

  let timer = null;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(run, 300); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  window.addEventListener("hashchange", schedule);
  run();
})();

/* storage-shim.js
   Inside the installed extension, chrome.storage exists and this file does nothing.
   When panel.html or the test pages are opened as plain web pages (local tests),
   it provides a tiny chrome.storage.local stand-in backed by this page's
   localStorage. Pages on the same origin (e.g. the fake portal and the panel in
   test/run-fake-application.html) see each other's changes via the "storage" event.
   No network calls. */
(function () {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) return;
  const PREFIX = "buddyShim:";
  const listeners = [];
  const read = k => { const v = localStorage.getItem(PREFIX + k); return v === null ? undefined : JSON.parse(v); };
  const fire = changes => listeners.forEach(fn => { try { fn(changes, "local"); } catch (e) { console.error(e); } });
  const local = {
    async get(keys) {
      const list = keys == null ? Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).map(k => k.slice(PREFIX.length))
        : Array.isArray(keys) ? keys : [keys];
      const out = {};
      list.forEach(k => { const v = read(k); if (v !== undefined) out[k] = v; });
      return out;
    },
    async set(items) {
      const changes = {};
      Object.entries(items).forEach(([k, v]) => {
        changes[k] = { oldValue: read(k), newValue: v };
        localStorage.setItem(PREFIX + k, JSON.stringify(v));
      });
      fire(changes);
    },
    async clear() { Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k)); },
  };
  window.addEventListener("storage", e => {
    if (!e.key || !e.key.startsWith(PREFIX)) return;
    fire({ [e.key.slice(PREFIX.length)]: {
      oldValue: e.oldValue === null ? undefined : JSON.parse(e.oldValue),
      newValue: e.newValue === null ? undefined : JSON.parse(e.newValue) } });
  });
  window.chrome = Object.assign(window.chrome || {}, { storage: { local, onChanged: { addListener: fn => listeners.push(fn) } } });
})();

# Minerva Application Buddy (Chrome extension prototype)

A side panel that helps applicants see where they are in the Minerva University undergraduate application and what to do next. Progress is saved only in `chrome.storage.local`. The extension makes no network requests and has no server.

## v0.2 (branch `buddy-real-flow-autodetect`)

- **The steps now match the real Admission Center.** The 16 required steps are: Part 1, the six challenges (Understanding, Creativity, Math, Reasoning, Writing, Expression), Close Part 2, Accomplishments (3 minimum, 6 recommended), Close Part 3, Academic Performance, Verify your ID, Parent/Guardian, Disciplinary Record, Close This Section, and Submit. Financial aid is an optional step. The source for this is `docs/application-buddy/SCREEN-MAP.md`.
- **Locks follow the real rules.**
  - Everything unlocks after Part 1.
  - Expression needs Verify ID.
  - Each "Close" step needs its section to be finished.
  - Submit needs all four parts to be closed.
- **Auto-detection is a prototype, and it only runs on local test pages for now.**
  - `detector.js` reads the status labels the Admission Center shows, such as "Challenge Complete", a part card that says "Complete", "Verification Complete!" and "your application has been submitted".
  - `content.js` stores only `{ stepId: { at, signal } }` under `minervaBuddy.auto.v1`. It never reads form values, names or answers.
  - Detected steps are ticked automatically and labelled "detected on page" in the checklist.
- **Real Minerva pages are not matched yet.** In `manifest.json` the content script matches `http://localhost/*` and `http://127.0.0.1/*` only. This follows Ben's guidance that privacy needs more work before the extension touches the official process. To pilot on staging later, add the staging origin to `content_scripts.matches`, but only after that review.
- Progress saved by v0.1 (key `minervaBuddy.v1`, numeric step ids) is not migrated. v0.2 starts fresh.

## Try it

1. Open `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and choose this `application-buddy-extension` folder.
3. Click the toolbar icon to open the side panel.

## Test without Minerva (fake portal)

1. Serve the repo locally, for example with `python3 -m http.server 8765` from the repo root.
2. Open `http://127.0.0.1:8765/application-buddy-extension/test/run-fake-application.html`.
   - On the left is a local fake portal that copies the real screen order and wording, and accepts only invented "TEST" applicants.
   - On the right is the real `panel.html`. They share storage through `storage-shim.js`, which does nothing inside the installed extension.
3. Open `http://127.0.0.1:8765/application-buddy-extension/test/detector-test.html` to run the detector checks (11 cases).

If the extension is installed, its content script also runs on the fake portal, because it matches localhost.

## Edit times or text

Open `panel.js`. Section 1 at the top holds the `STEPS` and `DEADLINES` arrays.

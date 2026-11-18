# Application Buddy: meeting brief (Nov 18, 2026)

Branch: `buddy-real-flow-autodetect` (v0.2). `main` is still v0.1 (8a51459). The placeholder root `manifest.json` was removed on this branch (be80bb5).

## What changed from v0.1 to v0.2
- **Real application flow.** v0.1 had 9 made-up steps. v0.2 has the 16 required steps of the real Admission Center plus optional financial aid, with the real lock rules: Expression needs Verify ID, each "Close" needs its section finished, and Submit needs all four parts closed.
- **Auto-detect prototype.** Steps tick themselves off when the page shows they're done. It is tested against a local fake portal and 11 detector checks, all passing.
- **Minerva look (commit 01c0c3d).** The side panel now uses the application site's style: black header, serif text, goldenrod buttons and progress bar, tangerine links.

## Auto-detect: what it does and deliberately doesn't do
- **Does:** read the status labels the Admission Center shows, such as "Challenge Complete", "Complete" on a part card, "Verification Complete!" and "your application has been submitted". It stores only the step id, a timestamp and which label matched, in this browser (`chrome.storage.local`).
- **Doesn't:** read form fields, typed answers, names or any applicant content. One of the 11 tests checks this.
- **Doesn't:** run on minerva.edu. The content script only matches `localhost` and `127.0.0.1` until the privacy review is done.
- **Doesn't:** send anything anywhere. There are no network requests and no server.

## Questions for Ben
1. Can we get a **test identity or staging access** to try Buddy against the real application?
2. What is the **status of the privacy review** that has to happen before auto-detect can run on minerva.edu?
3. Is the **achievements/progress feature open to integration**, so Buddy could read progress from it instead of page labels?

## Decisions I need to make
- **Merge v0.2 into `main`?** Not merged yet.
- **The old live demo page** (`application-buddy.html` on GitHub Pages) still shows v0.1 with 9 steps and the old blue style. Update it or remove it?

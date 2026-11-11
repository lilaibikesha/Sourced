# Minerva Application Buddy (Chrome extension prototype)

Same panel UI and logic as `minerva-application-buddy.html`, with progress saved in `chrome.storage.local`.
Because the extension has no mock portal, the panel has an "Update my checklist" section for ticking steps off.

## Try it
1. Open `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and choose this `extension` folder.
3. Click the blue check icon in the toolbar (pin it from the puzzle-piece menu) to open the side panel.

## Edit times or text
Open `panel.js`. Section 1 at the top holds the `STEPS` array and the `DEADLINES` array.

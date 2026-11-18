# Minerva undergraduate application: screen map

Source: Ben's Drive folder "FINAL" (196 full-page screenshots in 22 sections, plus README.md and MANIFEST.md, all modified Jun 18). The screenshots come from Minerva's **staging** site, using test applicants "test test" and "LukasTest". Most screens show a staff "You are masquerading as ..." bar. Mapped on Nov 17, 2026.

**URLs.** No screenshot shows an address bar, so URLs are only known when Minerva's public site or the set's README shows them:

- Part 1 is `https://www.minerva.edu/application/1` (public page, checked Nov 17, 2026).
- Log in is `/application/login/`.
- The financial aid pages are under `/financial-aid-center/...`.
- The README says the crawler followed `/application/` and `/financial-aid-center/` links.

All other URL patterns in the table are marked *unknown*. Someone needs to record them from staging before auto-detection relies on URLs.

**Duplicate folders.** The folder also holds eight older duplicate sub-folders that MANIFEST.md does not list: `11-financial-aid`, `12-verify-id`, `13-parent-guardian`, `14-disciplinary`, `15-attestation`, `16-faq`, `17-account-pages`, `18-application-submitted`. Their file names and counts match the listed sections, so I treated them as copies and mapped the 22 sections in MANIFEST.md.

## The big picture

```
Part 1 form ──► Admission Center (hub) ──┬─ Part 2  How You Think: 6 challenges ─► Close Part 2
(creates account,                         ├─ Part 3  What Have You Achieved: ≥3 accomplishments ─► Close Part 3
 unlocks the hub)                         ├─ Official Documents & Information:
                                          │    Academic Performance · Financial Aid (optional) · Verify ID ·
                                          │    Parent/Guardian · Disciplinary Record ─► Close This Section
                                          └─ Submit ─► [FA-decline confirmation] ─► "Mark as Complete" ─► Congratulations
```

Once Part 1 is submitted, the hub sections can be done in any order. There are two hard dependencies:

- **Expression needs Verify ID.** The graded Expression challenge will not start until ID verification is complete.
- **Close, then Submit.** Each "Close" button and the Submit button stay disabled until the section above them is complete.

## Ordered screen list

| # | Screen (on-screen heading) | Folder / files | URL pattern | Required fields / actions | What counts as complete | Progress / achievement indicators | Detection text seen |
|---|---|---|---|---|---|---|---|
| 1 | **Start Your Application** (Part 1, "Undergraduate Program Application") | 00 / 01 | `/application/1` (public, verified) | **Required:** First name, Last or family name, Birthdate, Email + confirm, Password + confirm, Country code + Phone, Street address, City, State/region, Postal code, Country, Primary citizenship, Secondary citizenship, Gender, Intended Concentration, "How did you learn about Minerva?". **Optional / conditional:** Pronoun, "enrolled in secondary school?", Parent/Guardian name/email/phone (or the over-18 opt-out), two agreement checkboxes (Terms/Privacy, Admissions and Enrollment Certification). Button **"Submit Part One"**. | Part 1 is accepted and the applicant lands on the Admission Center, where the Part 1 card reads **"Complete"**. | A 5-step bar: Contact Details · Address · Important Details · Agreements · "Admission Center Unlocked!". Page code fills `#progress-line` as field groups are filled. A sidebar shows "Start Your Application → Access Admission Center → Apply to Minerva". | "Submit Part One", "Admission Center Unlocked!" |
| 1a | **Verify Your Email** | 18 / 01 | unknown | Click the link in the email. A "Click here" link resends it. | The email link is clicked. No "verified" screen was captured. | none | "We have sent a new verification link to you at ..." |
| 2 | **Admission Center** (hub: "Welcome, *name*", "Your Application Progress") | 01 / 01–02; also 14/02, 18/02 (misnamed) | unknown | Navigation only | n/a (container) | **Main stepper:** Part 1 · Part 2 · Part 3 · Official Documents & Information · "Time to Submit Your Application!" (star). **Four cards:** "Complete" with a medal, or "Go to section →". **Sidebar:** application deadline, financial aid deadline, notification date. **Submit box:** "Submission button unlocks when you complete all parts of the application." | "Your Application Progress", card text "Complete" / "Go to section →" |
| 2a | Binding Enrollment banner | 01 / 02 | unknown | "Learn More →" (disabled) | n/a | "Binding Enrollment is only available to Early Action applicants." | The expanded content was **not captured**. |
| 3 | **Challenge Lobby** (Part 2. How You Think) | 02 / 01 | unknown | Pick a challenge | n/a | A card per challenge shows "Challenge Complete ✓" or "Take the Challenge" plus "Practice this Challenge" / "No Practice Available". A meter reads "1 Challenge … 5 Challenges · Part 2 Complete". **"Close Part 2"** is disabled until all 6 are done. | "Challenge Complete", "Close Part 2" |
| 4 | **Understanding** (practice 3 min / 7 Q; graded 7 min / 7 Q) | 03 / 01–42 | unknown | Graded: an "I understand" proctoring modal, then **Set up for Challenges** (Enable Screensharing & Webcam → Verify Setup → Verify Identity, with "I'll do this later" allowed), then "You're ready for the Challenge", then multiple choice A–D with Next/Previous and "Finish". | "Well done. You have completed your first challenge." The hub card then shows **"Challenge Complete"**. | "(Question X of 7)", countdown "m:ss remaining". | "You have completed the Practice Challenge." (practice), "Well done…" (graded) |
| 5 | **Creativity** (graded only, 8 min) | 06 / 01–07 | unknown | The same setup wizard, then 5 prompt words × 3 single nouns (15 inputs). The "end the test now" link or the timer ends it. | The hub card shows "Challenge Complete". The completion page was **not captured** (only a blank "Creativity" page). | Countdown | "Graded Challenge: Creativity" |
| 6 | **Math** (practice 3 min / 1 Q; graded 8 min / 20 Q) | 04 / 01–32 | unknown | A calculator agreement modal ("Proceed"), the setup wizard, multiple choice A–E. | "Well done. You have completed your challenge." plus the hub card. | "(Question X of 20)", countdown | as above |
| 7 | **Reasoning** (practice 3 min / 4 Q; graded 21 min / 13 Q) | 05 / 01–24 | unknown | The setup wizard, then pick 1 of 4 image pieces. Microphone and webcam are recorded. | "Well done. You have completed your Challenge." plus the hub card. | "(Question X of 13)", countdown | as above |
| 8 | **Writing** (graded only, 20 min) | 07 / 01–06 | unknown | The setup wizard, then one essay textarea and "Finish". No word limit is shown. | "Well done. You have completed your Challenge." plus the hub card. | Countdown (its value was not rendered in the capture) | as above |
| 9 | **Expression** (practice 1 Q; graded 5 Q × up to 2 min video, about 15–25 min) | 08 / 01–18 | unknown | **Requires a completed Verify ID.** Then the setup wizard and 5 recorded video answers. | "Well done. You have completed your challenge." (only a "Back to Challenge Lobby" button) plus the hub card. | "(Question X of 5)", "1:59 remaining" | as above |
| 10 | **Close Part 2** (button on the hub or lobby) | 20 / 01 t1 (enabled state) | unknown | Click "Close Part 2" | The Part 2 card on the hub reads "Complete". | The "Part 2 Complete" star turns yellow. | The state right after clicking was not captured separately. |
| 11 | **Part 3. What Have You Achieved** (hub) and the **Your Accomplishment** form | 09 / 01–04 | unknown (file name hints `/application/accomplishments/add`) | **Required:** Category, Title, Start/End date (or "currently working"), category-specific type/role/recognition, description (500 characters), plus competition details if "Yes". **Optional:** contact (not a relative or friend), links, evidence notes, file upload. Buttons "Save", "Check My Application ✦" (AI suggestions), "Delete". | The row changes from "Achievement N / Add an Accomplishment" to *title* + "Edit →". **At least 3** are needed to submit; 6 are recommended. | Banner "Our best applicants add six accomplishments." Meter: "1 Achievement · 2 · **3 Achievements Minimum** · 4 · 5 Achievement Excellent! · 6 Achievements Perfect!" | "Add an Accomplishment", "Edit →" |
| 12 | **Close Part 3** | (enabled state not captured) | unknown | Click "Close Part 3" ("Before you close Part 3: We strongly recommend adding 6 Accomplishments.") | The Part 3 card reads "Complete". Accomplishments are then locked. | The Part 3 meter | The state after clicking was **not captured**. |
| 13 | **School and Transcripts** (Academic Performance row, "Add Another School") | 10 / 01–06 | unknown (hint `/application/transcript/enrollments/add`) | **Required:** School name (must be picked from the autocomplete list), Dates of enrollment, "Have you graduated?", Institution type. **Also:** school ranking, grading scale (or a custom description), score/max (or "cannot estimate"), class size, rank. "Save". | The row shows the school plus "Edit". **Never captured.** The test school could not be saved ("Make sure that you selected an existing school."). | The Official Documents meter: "Academic Performance" node | Error strings only |
| 14 | **Financial Aid Application** row, decline path ("Skip for now") | 12 / 01–03 | unknown (button `#reject_finaid`) | Click "Skip for now" | The row says "You indicated that you do not need Financial Aid. …". The meter node turns yellow. **Optional:** it never appears in "Missing steps". | The meter's "Financial Aid Application" node | "You indicated that you do not need Financial Aid" |
| 14b | **Apply for Financial Aid** → **Financial Aid Center** (apply path, about 15 pages) | 11 / 01–23 | `/financial-aid-center/`, `/financial-aid-center/apply/<uuid>`, `/financial-aid-center/update-parent-contacts/<id>` (from file names and the README) | Bachelor's degree?, US citizen?, parent status plus guardian contact, then student tabs (Currency, Student Profile, CSS Profile, Other Items, Certification) and parent tabs (Currency, Family Income, Family Expenditures, Financial Assets, Real Assets, Certification). Needs the CSS Profile (code 6033), 3 years of tax forms, 12 months of bank statements, and payslips. | Each section is "submitted", then reviewed by the aid team. | **"Completed: 0/5 · Approved: 0/5"** (student) and **"0/6"** (parent) counters, plus a Status (OPEN). | **STOP point for testing:** real financial documents. |
| 15 | **Verify ID** (from the hub row or the challenge setup wizard) | 13 / 01–06 | unknown | "Start Verification" → **Face Snapshot** → **ID Card Snapshot** (government photo ID) → "Complete Verification". | **"Verification Complete!** Your identity has been verified successfully." The hub row then shows "Edit →" and a medal. | A 3-step list: Take a photo of your face · Take a photo of your ID card · Complete verification. In the challenge wizard, "Verify Identity" changes from ✗ to ✓. | **STOP point for testing:** identity check. |
| 16 | **Parent/Guardian Info** | 14 / 01 | unknown | First name, Last name, Email, Phone (no asterisks shown). "Save". Often pre-filled from Part 1. | The hub row shows "Edit →" and a medal. | The meter node | The incomplete row's button label was **not captured**. |
| 17 | **Disciplinary, Civil Litigation, Criminal and Military Service Record** | 15 / 01–05 | unknown | A Yes/No question (required, "Choose one" error), the certification checkbox, and a supplementary statement if "Yes". "Save". | The hub row should show "Edit →". **The saved state was never captured.** | The meter node | "View Form" (incomplete) |
| 18 | **Close This Section** (Official Documents) | (enabled state not captured) | unknown | Click | The "Official Documents & Information" card reads "Complete". | The meter | not captured |
| 19 | **Minerva Admissions and Enrollment Certification** (reference page) | 16 / 01 | unknown | Read-only. It is accepted through the Part 1 and Disciplinary checkboxes. | n/a | none | |
| 20 | **FAQ** (public site) | 17 / 01 | `minerva.edu/faqs/` | n/a. The answers were collapsed in the capture. | n/a | n/a | |
| 21 | **Log In / Reset your password** | 18 / 03–04 | `/application/login/` | Email and Password, or Google. Reset sends an email. No CAPTCHA was seen. | n/a | n/a | |
| 22 | **Submit, incomplete** | 19 / 01–02 | (hub) | Click Submit before everything is done. | n/a. The popup reads **"You must complete and fill out all required steps. Missing steps:"**, e.g. "Enrollment section; At least 3 Accomplishments; Expression challenge;". | This is the only screen that lists what is missing by name. | "Missing steps:" |
| 23 | **Final Confirmation: Financial Aid Decision** (only if aid was skipped) | 21 / 02 | (modal on the hub) | "Yes, I confirm that I do not plan to apply for financial aid." / "No, I'd like to update…" | Confirmed | | |
| 24 | **Mark Your Application as Complete** (modal) | 20 / 01, 21 / 03 | (modal on the hub) | "Cancel" / **"Mark as Complete"**. "We will automatically submit your application once we receive academic records from your school contacts." | Click Mark as Complete | All four cards read "Complete" and the final star is lit. "Congratulations! You've completed everything to submit your application." | |
| 25 | **Congratulations *name*, your application has been submitted.** | 20 / 02, 21 / 04 | unknown | "To Financial Aid Center →" (reminder) | Final | "What happens next.": 1 Application Review · 2 Document Verification · 3 Decision Notification. An email confirmation arrives within 24 hours (public FAQ). | "your application has been submitted" |

## Gaps (screens that seem to be missing)

1. **The page after "Submit Part One"**, and any Part 1 error state.
2. **A "verified" confirmation after email verification.** Also, does an unverified email block the hub?
3. **The Creativity completion page.** Only a blank transitional page was captured.
4. **The hub after "Close Part 2", "Close Part 3" and "Close This Section".** Neither the clicks nor any confirmation dialogs were captured. The enabled "Close Part 3" and "Close This Section" buttons were never captured either.
5. **A saved Academic Performance (school) row.** The test school could not be selected, which the README lists as a known limitation. This matters because the "Missing steps" popup calls this **"Enrollment section"**, which is a different name from the hub's "Academic Performance".
6. **A saved Disciplinary Record row**, and the "Yes" path with its supplementary statement.
7. **The incomplete Parent/Guardian row.** In every capture it was already filled in from Part 1.
8. **The Binding Enrollment expanded content**, and the Early Action variant of the hub.
9. **The financial aid apply path after submission.** The completed and approved counters were only ever seen at 0.
10. **The "school contacts" step.** The submit modal says the application is submitted automatically "once we receive academic records from your school contacts", but no screen shows where school contacts are entered or how their status is tracked.
11. **URLs for every hub sub-page.**

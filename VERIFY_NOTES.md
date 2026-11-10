# Check the facts: notes

## Changes
- **Nov 10, 2026 (update 3, content fix):** Only verify.json and this file changed. Before each change I reopened the source page (Nov 10, 2026). last_checked stays 2026-11-10 for every item, and every answer is 3 sentences or fewer.
  - **Q4, done.** Global Immersion still shows "STOP 4: A European City" without naming it (it only says past cities include Berlin and London). Answer, `disagreement` and evidence now all say it the same way: "a European city it doesn't name yet". The disagreement box now covers year 4 too. Status stays "partly verified".
  - **Q5, done.** Parents of Admits says "every Minerva class is a live, interactive seminar with no more than 20 students", so "about 20" is now "up to 20" (evidence updated too). Heads-up: other official wording differs. The FAQ on the same page says "capped at roughly 20", and the general FAQ (minerva.edu/faqs) says "fewer than 23 students". I didn't add that to the page.
  - **Q3, partly done.** Added: "An older Minerva page still shows 2024-25 costs, so make sure you're looking at the year you'll apply for." I added the Parents of Admits page as a Minerva source for that sentence, since it still shows the 2024-25 table. **Skipped: removing "health insurance" from the extra costs.** Parents of Admits does say all students are enrolled in Minerva's international health insurance plan. But being enrolled doesn't mean it's paid for: the financial aid page (the main Q3 source) lists Health Insurance at "$700–$800 per semester" under costs to plan for, and minerva.edu/faqs says students pay "for flights, visas, taxes, and health insurance" in addition to the EFC and lists insurance among costs that "are additional". Removing it would make the answer wrong, so I kept it. To stay at 3 sentences, I merged the extra-costs and Title IV sentences into one.
  - **Q2, done.** minerva.edu/faqs answers "Is there an application fee?" with no application fee. I added your sentence to the answer and the FAQ as a source labeled "From Minerva" (URL https://www.minerva.edu/faqs/, where the link ends up after the redirect). Evidence updated. The answer is now 3 sentences.
  - Checked at 375px: page loads, no errors, no sideways scrolling.
- **Nov 10, 2026 (update 2):** Only verify.html, verify.json and this file changed. (1) Q2: the College Navigator sentence moved out of the answer and into the Q2 note, worded plainly, with no guess about why the section is blank. The note now shows under the source list, so "linked above" is correct. (2) Q4: added a "Sources disagree" box under the answer (new optional field `disagreement`) saying the year 3 city doesn't match across Minerva's pages. Status stays "partly verified". (3) Added a "How we check" section above the cards. It's a real button with `aria-expanded` and starts closed. Checked at 375px: no sideways scrolling, no errors. The sources were not reopened for this update; they were last checked earlier today (Nov 10, 2026).

## Summary (Nov 10, 2026)

**Done**
- New page `verify.html` (live at https://lilaibikesha.github.io/Sourced/verify.html) with 6 tap-to-open question cards, loaded from `verify.json`.
- "Check facts" added as the last item in the top menu on every page (Start, Planner, three guides, and the new page). `aria-current="page"` still marks the active item.
- Nothing else on the existing pages changed. I compared the Start page, Planner and all three guides before and after: same content, no errors, no sideways scrolling at 375px.

**Fully verified (green)**
1. Is Minerva accredited?
2. Is Minerva a real university or a scam?
3. How much does Minerva cost? (2027/2028 numbers)
5. What should I know before applying?

**Partly verified (yellow)**
4. Where do students live? Two official Minerva pages disagree about year 3 (details below).

**No reliable source yet (grey)**
6. How do employers view a Minerva degree?

**Please check these yourself**
- Cost: the financial aid page shows 2027/2028 numbers, but the Parents of Admits page still shows an older 2024-25 table. I used the financial aid page. See "Cost" below.
- Cities: Global Immersion says year 3 is Buenos Aires; Parents of Admits says years 3 and 4 are "To be announced". The answer reports both.
- The WSCUC action letter (Feb 2026) is dated in a confusing way (says the meeting was "February 13, 2025"). See "Accreditation" below.
- College Navigator shows a blank accreditation section for Minerva. The Q2 note now says this plainly and points people to the WSCUC record. A doubtful parent may notice this, so it's worth knowing.
- Q5 is the most sensitive answer (it mentions the accreditor's special visit). Read it once to make sure you're happy with the tone.

---

## What I checked (all opened on Nov 10, 2026)

| Source | Opened? | Used for |
|---|---|---|
| https://wscuc.org/institutions/minerva-university (redirects to https://www.wscuc.org/institutions/minerva-university/) | Yes | Q1, Q2, Q5 |
| https://www.minerva.edu/accreditation/ | Yes | Q1 |
| https://nces.ed.gov/collegenavigator/?id=484844 | Yes, it opens "Minerva University" (IPEDS ID 484844). The same link is listed on the WSCUC record under External Links. | Q2, Q3 |
| https://www.minerva.edu/undergraduate/financial-aid (redirects to .../financial-aid/) | Yes | Q3 |
| https://www.minerva.edu/global-immersion (redirects to .../global-immersion/) | Yes | Q4 |
| https://www.minerva.edu/parents-of-admits (redirects to .../parents-of-admits/) | Yes | Q4, Q5 |
| https://wascsenior.box.com/s/y4h2aluakd9lf5ihwvbgbzxxnrtxc152 (WSCUC Commission Action Letter, Special Visit, Feb 2026) | Yes | Q5. **Extra source**, not on your list. It is the accreditor's own letter, linked from the WSCUC record page. |
| https://www.minerva.edu/faqs/ | Yes (added in update 3) | Q2 (no application fee). Minerva's own FAQ, labeled "From Minerva". |
| https://www.minerva.edu/student-impact/ | Yes | Q6. **Extra source**: Minerva's outcomes page, found from the "Explore Student Outcomes" link on minerva.edu. Labeled "From Minerva". |
| https://www.minerva.edu/undergraduate/required-financial-information/ | Yes | Not used on the page, only to cross-check costs (see below). |

In `verify.json` I used the final URLs after redirects (with the trailing slash), so links don't bounce.

### Accreditation (Q1, Q2, Q5)
WSCUC record, as shown today:
- Current Accreditation Status: Accredited
- Most Recent Commission Action: February 13, 2026
- First Accredited: 2021
- Financial Structure Type: Non-Profit
- Distributes Federal Financial Aid: No
- Reviews tab: Fall 2027 Offsite Review, Spring 2028 Accreditation Visit
- Programs tab: all degree programs listed with modality "Distance Education"
- Documents: Commission Action Letter and Team Report for the Special Visit (February 2026 action) and for the 2021 accreditation.

Minerva's accreditation page says the same thing in its own words (initial accreditation June 2021; accreditation affirmed after a special visit, action Feb 2026).

WSCUC action letter, Feb 2026 (what I based Q5 on):
- The special visit was December 2-5, 2025, and looked at five areas: financial model; institutional communication and organizational culture; cost of attendance; library resources; natural science curriculum and lab experiences.
- The Commission received the report and moved the next reaffirmation review to an Offsite Review in fall 2027 and an Accreditation Visit in spring 2028.
- It requires Minerva to keep working on two areas: strengthening its financial position, and formalizing policies, structures and processes.
- It also lists commendations (for example, better transparency on cost of attendance), which I did not include in the short answer.
- **Date oddity:** the letter is dated February 27, 2026 but says the Commission met "February 13, 2025". The WSCUC record page says the action was February 13, 2026, and the visit was in December 2025, so 2025 in the letter is very likely a typo. I used the WSCUC record's date (Feb 13, 2026).
- I kept Q5 factual and short and did not describe the "letters of concern" the letter mentions, since a 2-3 sentence answer can't give that context fairly. Readers can open the letter.

College Navigator (U.S. Department of Education, NCES):
- Shows "Minerva University", 14 Mint Plaza, San Francisco; Type "4-year, Private not-for-profit".
- **Its Accreditation section says "No accreditation data reported for this institution"**, and its Carnegie Classification line says "Not applicable, not in Carnegie universe (not accredited or nondegree-granting)". I could not find an official explanation for this, so I did not guess one on the page. The page only says the section is blank and to use the accreditor's record, which shows "Accredited".
- Federal Aid: "Students cannot receive federal aid (e.g. Pell Grants)." Also: no Program Participation Agreement with the US Department of Education.
- Graduation rate: not reported. I left this out of the page.

### Cost (Q3)
From https://www.minerva.edu/undergraduate/financial-aid/, heading "Estimated cost of attendance for the 2027/2028 Academic Year":
- Tuition and Program Fee: $31,300
- Residential Services Fee: $19,900
- Student Services Fee: $2,800
- Estimated Living Costs: $5,600* (*Not paid to Minerva, includes $600 set up costs)
- Total: $59,600 (I checked that the four lines add up to this.)
- Title IV: the same page says "Minerva does not participate in U.S. Title IV federal financial aid programs at this time", so federal loans and Pell Grants can't be used. College Navigator and WSCUC agree (see above).

**Pages disagree on the year (as you expected):**
- Parents of Admits page shows "Annual cost of attendance (2024-25)": Tuition $29,800, Housing $18,400, Student Services Fee $2,400, Estimated Living Costs $5,600, Total $56,200. That is an older year, so I didn't use it.
- Required Financial Information page has an "FY27" table by class (M27 to M31). The M31 row (Tuition $31,300, Residential Living Student Fee $19,900, Student Services $2,800, Total $54,000) matches the 2027/2028 numbers above, without living costs. The M30 row matches the 2024-25 numbers on the parents page.
- College Navigator shows older federal estimates (latest 2024-2025 year). Not used for prices because it's not the current year.

Choice: I named the year (2027/2028) in the answer and copied the numbers exactly. No rounding.

### Where students live (Q4)
- Global Immersion page: Stop 1 San Francisco, Stop 2 Tokyo, Stop 3 Buenos Aires, Stop 4 "A European City" (it says past cities include Berlin and London, but does not name the upcoming one). It also says students live together in Minerva residence halls in each city and call a new city home each year.
- Parents of Admits page: Year 1 San Francisco, Year 2 Tokyo, "City 3: To be announced", "City 4: To be announced". It also lists current and past rotation cities.
- Because the two official pages disagree about year 3, I marked this **partly verified** and the answer states both versions. I did not list past cities as current ones.

### What to know before applying (Q5)
- "Young school": WSCUC First Accredited 2021.
- "Live online seminars": Parents of Admits page says every class is a live, interactive seminar with no more than 20 students, run on Minerva's virtual learning platform, and students live together while taking these classes. The answer first said "about 20" because the FAQ on the same page says "capped at roughly 20" while the Academics section says "no more than 20". In update 3 it changed to "up to 20" (see Changes).
- Reviews: from the WSCUC record and the Feb 2026 letter (see above).
- Marked **verified**: each part has a source that says it directly.

### Employers (Q6)
- Status "no reliable source yet", answer copied word for word from your brief.
- Linked Minerva's Student Impact page (its own outcome numbers, such as "91% of graduates are working or in graduate school within six months"), labeled "From Minerva". I did not put those numbers in the answer because they are the school's own claims.
- Not found: any independent source about how employers view the degree. The Parents of Admits page also links Minerva-made "Grads after Graduation" PDFs (March 2026), which I did not use.

## Choices I made
- **One page, no new CSS file.** `verify.html` uses the shared `planner.css` plus a small `<style>` block for the cards, so the existing pages' styles didn't change at all. The JavaScript is inline in `verify.html` and doesn't touch `planner.js`, except for one line.
- **Menu:** the menu on the existing pages is built by `planner.js`, so I added one line there (`verify.html`, "Check facts"). `verify.html` has the same menu written straight into the HTML, so it works even if JavaScript fails. If you rename a menu item later, change it in both places. `index.html` was not touched, so the design-tokens block is safe.
- **Extra field `note`** (only on Q2) holds "This page is not affiliated with Minerva. Check these sources yourself." plus the College Navigator line. I kept it out of the answer so the answer stays 2-3 sentences. It shows as a highlighted box under the source list.
- **Extra field `disagreement`** (only on Q4) shows as a yellow "Sources disagree" box right under the answer when official pages don't match.
- **The "no answer without a source" rule is also in the code:** if an item has no valid http(s) source, the page shows it as "No reliable source yet", whatever its status says.
- **Status meaning:** "verified" = every claim in the answer is shown directly on a linked page. Facts that only Minerva can state (its own prices, cities, class format) count as verified when Minerva's official page says them clearly and its pages agree. If its pages disagree, the status is "partly verified".
- **Status badge is inside the card** (as asked), not on the closed card. Badges use text plus color, so they don't rely on color alone.
- **Deep links:** `verify.html#fact-3` opens card 3 directly. Handy for sharing one answer.
- **Report an error** opens a new GitHub issue on lilaibikesha/Sourced with a short template (which question, what's wrong, a source). No personal email. Issues are enabled on the repo, and I changed no repository settings.
- **Dates:** every item has `last_checked: "2026-11-10"`, shown as "Last checked: Nov 10, 2026".
- **Brand name:** the header still says "Application Planner", like the other pages, so the site looks the same everywhere.

## Tested
- 375px wide (phone) and 1280px (desktop): cards open and close, `aria-expanded` switches between true/false, no sideways scrolling, tap targets are at least 44px.
- Contrast: badge text is dark on a light background (well above WCAG AA).
- Start, Planner and all three guides: same content as the live site before the change, no console errors, "Check facts" appears in the menu on each one.
- Browsers may keep the old `planner.js` for a short time after deploy. If "Check facts" doesn't show up in the menu right away, reload the page.

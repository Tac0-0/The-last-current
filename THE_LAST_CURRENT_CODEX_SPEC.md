# THE LAST CURRENT
## Codex implementation brief and game design specification

**Version:** 1.1 (MVP locked; Bulgarian-first)  
**Prepared:** 10 November 2026  
**Competition deadline:** 16 November 2026  
**Team:** Two student developers  
**Target:** A complete, polished, playable **Bulgarian-language** ecology-themed browser game that can be demonstrated to school judges in about **4–5 minutes**.

---

# 0. INSTRUCTIONS TO CODEX — READ FIRST

You are the implementing developer. **Build the project described below, not another design document or a mockup.** The user has already discussed and approved the core direction. Proceed without repeatedly asking for decisions; use the explicit defaults in this specification. Work incrementally, run the project, and validate it.

1. Inspect the existing directory/repository before changing anything. If the directory is empty, initialize a fresh project. Preserve unrelated existing work; do not delete it.
2. Use **Phaser 3.90.0**, JavaScript ES modules, **Vite**, and plain HTML/CSS for menus and book overlays. **Do not silently upgrade to Phaser 4**, add React, introduce a backend, or build a complex framework.
3. Deliver an actual playable game and all necessary source files, not only pseudocode. If artwork is missing, generate attractive original SVG/procedural 2D shapes locally so there is no dependency on external assets.
4. All **player-visible content MUST be in Bulgarian (bg-BG)**, including the game title, site navigation, tutorial, buttons, HUD, tower descriptions, wave/boss names, book pages, source labels, accessibility strings, defeat/retry messages, and entire ending. The English in this document is development guidance only. Do not use English fallback strings in the UI.
5. Prioritize the **full narrative loop over optional polish**: menu -> Wave 1 -> Chapter I -> Wave 2 -> Chapter II -> Wave 3 -> scripted tragedy -> final message -> Chapter III -> return to menu.
6. Keep the experience short. **No endless mode, no fourth wave, no mandatory quiz, no account creation, no backend.** Do not invent more levels or rewrite the story.
7. When scope conflicts with time, preserve gameplay, the three book pages, and the ending. Simplify particles, sounds, and optional effects first.
8. Write clean, understandable code: data-driven waves, tower/enemy definitions, separate state and UI, minimal dependencies. Avoid a single giant source file.
9. After implementation, run `npm install`, `npm run build`, and the available smoke tests. Fix errors. If browser automation is available, test a full playthrough and capture screenshots. Do **not** claim a test passed unless it ran.
10. Document how to run, build, edit balancing numbers, and deploy. Explain any missing parts in a final implementation report.
11. This brief intentionally contains **no request to publish the project or push to GitHub**. Do so only if the user explicitly requests it.

**Definition of success:** A judge can launch the site, understand the mechanics immediately, place defenses, beat three waves and three bosses, open three concise educational pages, witness the unavoidable tragic ending, and understand why protecting one turtle is not enough to stop pollution at its source.

---

# 0A. MANDATORY LOCALIZATION — BULGARIAN ONLY

**This is a Bulgarian school-competition website. All content a visitor reads or hears must be written in natural, grammatically correct Bulgarian (`bg-BG`).** This overrides any English sample copy elsewhere in the brief. Do not leave the public game title in English. Use **„Последното течение“** as the public title, **„Шели“** as the turtle name, **„Книга на проблемите“** as the book title, and **„Еко кредити“** as the currency label.

- Set `<html lang="bg">`, Bulgarian `<title>`, metadata description, visible headings, navigation, buttons, overlays, tooltips, chapter text, source labels, footer, credits, alt text, `aria-label`, error messages and browser alerts.
- The three waves, enemies, tower names, boss names, progress labels, tutorial and final ending must be Bulgarian. No `Play`, `Start Wave`, `Retry`, `Source`, `Game Over` or other English visible UI strings.
- English **code**, variable names, paths, comments, source institution names/acronyms (UNEP, FAO, NOAA), project-internal identifiers and technology names (Phaser, Vite) are fine. Do not translate official source URLs.
- Centralize all user-facing text in `src/config/localeBg.js` (or equivalent). Do not hard-code English labels in separate game or UI modules. No multi-language switch is required for the competition.
- Use Bulgarian conventions, UTF-8, Cyrillic-friendly typefaces and natural typography; ensure fonts contain Cyrillic glyphs. Prefer Bulgarian decimal/date formatting if any are displayed.
- Quotes in sections below are **authoritative Bulgarian copy**. The ending lines and three book chapters should be shown verbatim unless the user requests changes. Other player-facing English examples in this file should be translated according to the dictionary below.

### Mandatory UI text examples

| Meaning / key | Bulgarian player-facing text |
|---|---|
| App title | **Последното течение** |
| Tagline | **Спаси една костенурка. Открий защо океанът остава в опасност.** |
| Play | **Играй** |
| Book of Problems | **Книга на проблемите** |
| Credits / Sources | **Екип и източници** |
| Start Wave | **Начало на вълната** |
| Wave 1/3 | **Вълна 1 от 3** |
| Eco Credits | **Еко кредити** |
| Turtle Integrity | **Здраве на Шели** |
| Boss | **Бос** |
| Build | **Построй** |
| Upgrade | **Подобри** |
| Sell | **Продай** |
| Pause / Resume | **Пауза** / **Продължи играта** |
| Mute / Unmute | **Изключи звука** / **Включи звука** |
| Continue / Back | **Продължи** / **Назад** |
| Restart | **Започни отначало** |
| Retry Wave | **Опитай вълната отново** |
| Restart Entire Run | **Започни цялата игра отначало** |
| Locked / Undiscovered | **Заключено** / **Неоткрито** |
| Chapter unlocked | **Отключена е нова глава!** |
| Chapter / Source | **Глава** / **Източник** |
| Root cause / Solution | **Основна причина** / **Какво можем да променим** |
| The boss broke through. | **Босът достигна до Шели.** |
| FINAL WAVE CLEARED | **ПОСЛЕДНАТА ВЪЛНА Е СПРЯНА** |
| Read the Book / Play Again / Main Menu | **Прочети книгата** / **Играй отново** / **Главно меню** |
| Shelly did not survive. | **Шели не оцеля.** |
| The next turtle still has a chance. | **Следващата костенурка все още има шанс.** |
| Approximately 4 minutes · Single-player | **Около 4 минути · За един играч** |

### Fixed translated gameplay terms

- **Waves:** „Пластмасовият прилив“, „Призрачните мрежи“, „Кризата с отпадъците“.
- **Bosses:** „Пластмасовата маса“, „Призрачната мрежа“, „Лавината от отпадъци“.
- **Towers:** „Плаваща преграда“, „Събирач на отпадъци“, „Почистваща лодка“.
- **Regular trash:** „Пластмасова бутилка“, „Найлонова торбичка“, „Метална кутия“.
- **Book chapters:** „Пластмасовият прилив“, „Призрачният улов“, „Кризата с отпадъците“.
- Language QA is a **P0 shipping requirement**: inspect all screens, including loss/retry states and the ending, for untranslated English or broken Cyrillic.

---

# 1. VISION, MESSAGE AND NON-NEGOTIABLES

### Working title
**Последното течение** (Bulgarian-facing title; keep the internal repository/package name `the-last-current` and centralize title in one locale constant).

### Genre
Short, story-driven **tower defense** with educational interludes. **Not a clicker.** Players click to select, place, upgrade, or sell towers; clicking trash does **not** deal damage.

### Premise
A sea turtle named **Шели** (internal code identifier may remain `Shelly`) rests near the edge of an ocean current. Pollution approaches in increasingly dangerous waves. The player places cleanup equipment to keep debris from reaching Shelly. Each wave culminates in a distinctive *boss made of waste*. After bosses one and two, a chapter of the **Book of Problems** unlocks, showing a real environmental issue and how to address its root cause.

After defeating the third boss, the player appears to have won. Then an enormous, unstoppable influx of trash engulfs the area. Shelly **dies regardless of health or tower strength**. This is a **scripted narrative ending, not punishment for poor play**. The final book chapter explains that cleanup alone does not end pollution.

### Ethical message
- Rescue, cleanup, and individual lives **do matter**. The lesson is that they are **insufficient on their own** while pollution continues at its source.
- Avoid “nothing you do matters” fatalism. End with concrete possibilities: reduction, reuse, producer accountability, responsible fishing, collection infrastructure, regulation, and cooperation.
- Do not depict lower-income countries as inherently dirty or the cause of the problem. Explain unequal consumption, waste-management capacity, pollution burdens, and transboundary waste fairly, with respect for affected communities.
- No cartoon gore, animal suffering close-ups, graphic death scene, or grotesque character bosses. Shelly's fate should be clear but conveyed sensitively with silhouette, sound, and text.

### Hard scope
- Exactly **3 waves**; one final boss per wave.
- Exactly **3 unlockable educational chapters**.
- Exactly **3 buildable defense types**, with one upgrade level each.
- A single battlefield and a fixed winding current.
- Six fixed tower pads.
- Short complete run: approximately **4–5 minutes**, without requiring retries.
- Single-player, desktop-first, usable on ordinary school computers.
- Static hosting only, no authentication or networking.
- A scripted, unavoidable post-victory turtle death. **No alternate survival ending.**

---

# 2. PLAYER JOURNEY AND PACING

### Player-facing flow

```text
MAIN MENU
  Играй  |  Книга на проблемите  |  Екип и източници
    |
SHORT INTRO / FIRST-TIME TOOLTIP (Bulgarian) (dismissible)
    |
PREPARE WAVE 1 -> PLAY WAVE 1 -> WAVE 1 BOSS DEFEATED
    |
CHAPTER I UNLOCKED (single page; Continue)
    |
PREPARE WAVE 2 -> PLAY WAVE 2 -> WAVE 2 BOSS DEFEATED
    |
CHAPTER II UNLOCKED (single page; Continue)
    |
PREPARE WAVE 3 -> PLAY WAVE 3 -> WAVE 3 BOSS DEFEATED
    |
SHORT FALSE-VICTORY MOMENT
    |
OVERWHELMING TRASH SURGE -> SHELLY DIES -> FADE TO BLACK
    |
FINAL MESSAGE
    |
CHAPTER III UNLOCKED (single page; Continue)
    |
CLOSING SCREEN: „Следващата костенурка все още има шанс.“
    |
ГЛАВНО МЕНЮ / ПРОЧЕТИ КНИГАТА / ИГРАЙ ОТНОВО
```

### Target duration (guideline, tune to observed playtests)

| Segment | Target |
|---|---:|
| Menu and introduction | 10–20 sec |
| Wave 1 including boss | 55–65 sec |
| Chapter I | 10–15 sec |
| Wave 2 including boss | 60–70 sec |
| Chapter II | 10–15 sec |
| Wave 3 including boss | 65–75 sec |
| Tragic ending + final message | 20–25 sec |
| Chapter III + closing | 10–20 sec |
| **Total** | **Approximately 4–5 min** |

No waiting just for dramatic pacing. A **Start Wave** button begins each wave immediately after the player places towers. Allow construction during waves. Pause movement while book pages or menus are open. Tutorial tips must not obscure the action.

### First-time tutorial (maximum three short callouts)
1. „Отпадъците се носят по течението към Шели.“
2. „Поставяй почистващи съоръжения на обозначените места.“
3. „Събирай отпадъци, печели еко кредити и подобрявай защитата.“

Do not require a tutorial level. Allow tutorial hints to be dismissed instantly.

---

# 3. BATTLEFIELD AND INPUT

### Camera and layout
- Base design resolution: **1280 x 720**, scaled responsively while preserving aspect ratio (letterbox if needed). Make it usable at 1366x768 and 1920x1080.
- **Top-down, stylized ocean scene**. Trash enters from the **left**, flows along a shallow S-shaped current, and reaches **Shelly at the right**.
- HUD occupies a slim top strip; shop/tower controls occupy a bottom strip; the battlefield remains the focus.
- Six **fixed build pads** around, not in, the water current. No free placement, grid placement, or pathfinding.
- The turtle is stationary at the endpoint throughout active gameplay.

### Suggested path coordinates (1280x720 reference)
Use a smooth spline or sampled polyline from these points; tune positions for readability:

```js
const path = [
  { x: -30, y: 355 },
  { x: 170, y: 355 },
  { x: 330, y: 220 },
  { x: 505, y: 220 },
  { x: 660, y: 478 },
  { x: 815, y: 478 },
  { x: 970, y: 325 },
  { x: 1100, y: 325 }
];
const turtlePosition = { x: 1170, y: 325 };
```

Six suggested pad centers, adjust if a pad overlaps the route or HUD:

```js
[
  { x: 210, y: 245 },
  { x: 370, y: 335 },
  { x: 555, y: 335 },
  { x: 680, y: 345 },
  { x: 865, y: 365 },
  { x: 1005, y: 440 }
]
```

Use **distance traveled along path** for targeting and spawn/leak checks, not naive X comparisons. Enemies cannot leave the path accidentally. Moving enemies turn smoothly. Determine leak when reaching the final path endpoint; do not spawn a new enemy after the leak line.

### Input
- Left mouse click: select a build pad, choose a tower, select an existing tower, upgrade/sell it.
- Hover/focus: show price, range circle, and short description.
- `Esc`: close selection/overlay; optionally pause/resume when safe.
- Pause button, mute button, restart button, and **Start Wave** button.
- No attack-by-click, aiming, tower dragging, WASD movement, or keyboard-only required action.
- Touch support is a bonus. Clickable controls must still have reasonable hit areas.

### HUD
- Shelly integrity: **10 / 10** plus a clear visual bar.
- Current wave: **1 / 3** (do not expose a fourth wave).
- Eco Credits balance.
- Small “Book” button showing unlocked chapters out of three.
- Shop: three defenses, costs, selected tower information.
- Boss health bar appears only during the boss encounter.
- A small pause/mute control; never let UI block the flow path.

---

# 4. ECONOMY, DEFENSES AND TARGETING

### Economy
- Start the game with **110 Eco Credits**.
- Earn credits only when trash is successfully removed, not when it hits the turtle.
- Finish Wave 1 or 2: award a **25-credit wave completion bonus** before the next prep phase.
- No income over time. No microtransactions or score multipliers.
- Show a small `+10`, `+12`, etc. on collection, but avoid excessive particle spam.
- Selling a tower returns **75% of total credits invested**, rounded down. Selling is permitted in prep phases and active waves. It also frees the pad.
- Currency and active towers carry over between waves.

### Tower definitions: INITIAL BALANCE (data-driven; tune after playtests)

| Tower | Cost | Range | Attack/Effect | Upgrade cost | Upgrade result |
|---|---:|---:|---|---:|---|
| Floating Barrier | 35 | 160 px | Enemies in range move 40% slower | 25 | 60% slower |
| Waste Skimmer | 55 | 195 px | 15 cleanup damage every 0.8 s to one target | 40 | 23 damage every 0.75 s |
| Cleanup Boat | 85 | 190 px | 18 damage to up to 3 targets every 2 s | 60 | 26 damage to up to 3 targets every 1.8 s |

These are intentionally **mechanically different**:
- Barrier: crowd control; **does not** deal damage or generate credits by itself.
- Skimmer: efficient focused damage against bosses/heavy trash.
- Boat: area damage against clustered trash.

**Rules:** One tower per pad; one upgrade maximum per tower; range circle on selection; upgrade button disabled if unaffordable; no tower can fire while paused or during narrative scenes. Upgrades should visibly change the tower (small accent/attachment/lighting change).

### Targeting
- Skimmer: targets enemy **farthest along the path within range** (the one closest to Shelly). If tie, choose oldest spawn.
- Boat: chooses the enemy farthest along the path as its center, hits up to three enemies within an AoE radius of **85 px** of that center, all within the boat's normal range.
- Barrier: applies slow to every enemy in radius, strongest applicable slow wins; **do not multiply overlapping slow effects**. Bosses can be slowed by barriers unless their own special effect specifies otherwise.
- All damage and status effects must be frame-rate independent.

---

# 5. ENEMIES, BOSSES, AND WAVES

### Trash enemies (INITIAL BALANCE)

| Type | HP | Speed px/s | Reward | Turtle damage | Visual read |
|---|---:|---:|---:|---:|---|
| Plastic Bottle | 25 | 135 | 10 | 1 | translucent blue/white bottle |
| Plastic Bag | 15 | 180 | 12 | 1 | thin translucent bag; fast |
| Metal Can | 45 | 95 | 18 | 2 | small dense metallic object; slow |

Enemies are **trash objects**, not creatures. No eyes, mouths, faces, or attacking animations. A subtle outline/HP bar is enough. Trash should remain recognizable over the ocean texture. Their sizes/opacity should communicate weight and speed.

### Bosses (ONE PER WAVE, exactly)

**Wave 1 — The Plastic Tide**
- Visual: large compacted knot of bottles, bags, and discarded packaging.
- HP **130**, speed **65 px/s**, reward **50 credits**.
- **Split mechanic:** when destroyed, spawn **two Plastic Bags and one Plastic Bottle** at the boss's last path position. These children remain targetable and must be cleared or allowed to leak. Boss is considered defeated when its HP reaches zero, but the wave ends only after all remaining trash is resolved.
- Associated Book Chapter I: Plastic Pollution.

**Wave 2 — The Ghost Net**
- Visual: loose tangled fishing net and floats, clearly distinct from plastic mass.
- HP **175**, speed **70 px/s**, reward **70 credits**.
- **Disable mechanic:** once when it reaches approximately the middle half of its path, temporarily disables **the nearest active damage-dealing tower in a 200 px radius for 3 seconds**. Affected tower gets a visible gray/scrambled state and reactivates automatically. If none is in range, do nothing; never permanently disable a tower. Do not target barriers if a damage tower is available.
- Associated Book Chapter II: Ghost Fishing.

**Wave 3 — The Waste Surge**
- Visual: huge dense raft of mixed waste, larger and visually more ominous than previous bosses.
- HP **265**, speed **60 px/s**, reward **90 credits**.
- **Current surge mechanic:** standard trash within **170 px along the path** of the boss moves **35% faster** while in its aura. Show a subtle current effect, not blinding particle fog. Do not amplify other bosses (there are none concurrently).
- Associated Book Chapter III: Global Waste Crisis, revealed **after the scripted ending**.

### Wave composition and timing (starter values)
Each wave begins after the player presses **Start Wave**. Launch ordinary trash in predictable timed batches, then spawn the boss near the final third of that wave. Use a wave-data table rather than writing three separate game loops.

| Wave | Standard enemies | Boss spawns around | Goal duration |
|---|---|---:|---:|
| 1 | 5 bottles + 3 bags + 2 cans | 37 s | 55–65 s |
| 2 | 6 bottles + 5 bags + 4 cans | 42 s | 60–70 s |
| 3 | 7 bottles + 7 bags + 6 cans | 45 s | 65–75 s |

Implement a deterministic spawn schedule for each wave, with staggered smaller groups (rather than all trash at once). Vary the intervals for tension, but keep the overall duration within the targets. Start the boss only once per wave and display its health bar. Wave ends when (a) the boss has been **destroyed** and (b) all standard trash and boss-spawned children have been collected or leaked, provided the turtle is alive.

**Important balancing rule:** This is a competition demonstration, not a hardcore challenge. A novice who places sensible towers should be able to complete all three waves in one or two attempts. Bosses must not be bullet sponges. Reduce enemy HP, increase wave earnings, or slow the path if playtests show too many failures. Never solve balance by allowing the player to skip bosses.

### Damage and loss
- Shelly begins at **10/10 integrity**.
- Trash reaching the endpoint inflicts the listed damage, is removed, and grants **zero** Eco Credits.
- **Any boss reaching the turtle causes an immediate wave failure**, even if integrity remains. Display „Босът достигна до Шели.“ This keeps boss defeat mandatory for chapter unlocks.
- If integrity reaches zero during Wave 1, 2 or 3, display a normal defeat screen and allow **Retry Wave**.
- On Retry Wave, restore the saved **pre-wave snapshot** (turtle HP, credits, towers and upgrades) and return to preparation mode, allowing tower sales/repositioning. Enemy spawns and boss ability reset cleanly. Chapters already earned stay unlocked.
- Provide **Restart Entire Run** as a secondary option. Do not force the player to reload the browser.
- If the player beats the third boss and clears the wave with at least 1 integrity remaining, **trigger the narrative ending regardless of whether the integrity is 1 or 10**.

---

# 6. THE BOOK OF PROBLEMS — EXACT CONTENT AND UX

The Book is the educational heart of the project. It is a **short illustrated field journal**, not a second long website. Each chapter fits one screen without vertical scrolling at desktop size and should be readable in **10–15 seconds**.

### Book UI
Each page contains exactly these essential elements:
1. Chapter Roman numeral and title.
2. One impactful original illustration or appropriately licensed/local image.
3. **One short verified fact** (large emphasis).
4. **Root cause:** one sentence.
5. **What can change:** one sentence (concrete real-world solutions).
6. An unobtrusive **Source** link to the original institution and a **Continue** button.

The journal is accessible from the main menu. Locked chapters show titles as silhouettes or “Undiscovered” without giving away the full text. Unlocked chapters remain available after returning to the menu. Store unlocked chapter IDs in `localStorage`, guarded against malformed storage data. Chapter I unlocks only after clearing Wave 1, Chapter II after clearing Wave 2, and Chapter III only after the complete tragic ending sequence. Replay must not relock chapters.

### Chapter I — „Пластмасовият прилив“ (after Wave 1)
**Player-facing fact (Bulgarian):** „Всяка година между 19 и 23 милиона тона пластмасови отпадъци попадат във водните екосистеми: реки, езера и морета.“

**Player-facing root cause:** „Основна причина: Прекомерната употреба на пластмаса за еднократна употреба и пропуските в управлението на отпадъците.“

**Player-facing solution:** „Какво можем да променим: Да намалим ненужната пластмаса, да използваме повторно и да подобрим събирането на отпадъци.“

**Visual direction:** A single bottle floating in the ocean, with distant layers of plastic near the shore; avoid depicting a cartoon villain.

**Primary source:** Програма на ООН за околната среда (UNEP), Plastic pollution & marine litter:  
https://www.unep.org/en/what-we-do/ocean-seas-and-coasts/ecosystem-degradation-pollution/plastic-pollution-marine-litter

### Chapter II — „Призрачният улов“ (after Wave 2)
**Player-facing fact (Bulgarian):** „Изгубените и изоставени риболовни мрежи могат да продължат да улавят морски животни дълго след като са спрели да се използват.“

**Player-facing root cause:** „Основна причина: Изгубени риболовни уреди и недостатъчно възможности за проследяване, изваждане и предаване на старо оборудване.“

**Player-facing solution:** „Какво можем да променим: Да проследяваме оборудването, да извличаме изоставени мрежи и да осигуряваме места за предаването им.“

**Visual direction:** An abandoned fishing net drifting over a reef; strong silhouette and a sense of scale, but no graphic injury.

**Primary sources:** Организация по прехрана и земеделие на ООН (FAO) and NOAA on abandoned/lost fishing gear:  
https://www.fao.org/responsible-fishing/marking-of-fishing-gear/abandoned--lost-or-otherwise-discarded-fishing-gear-%28aldfg%29/en  
https://www.noaa.gov/gc-international-section/marine-debris-derelict-fishing-gear

### Chapter III — „Кризата с отпадъците“ (ONLY AFTER THE ENDING)
**Player-facing fact (Bulgarian):** „Без спешни мерки количеството битови отпадъци в света може да достигне около 3,8 милиарда тона годишно до 2050 г.“

**Player-facing root cause:** „Основна причина: Все по-голямо потребление, недостатъчна инфраструктура и неравномерно разпределена тежест от отпадъците.“

**Player-facing solution:** „Какво можем да променим: Да предотвратяваме отпадъците при източника, да търсим отговорност от производителите и да инвестираме в събиране и преработка.“

**Visual direction:** A river mouth and a coastal city with waste floating out toward the ocean; show both causes and consequences, not a stereotype of a specific country.

**Primary source:** Програма на ООН за околната среда (UNEP), *Global Waste Management Outlook 2024*:  
https://www.unep.org/ietc/index.php/resources/report/global-waste-management-outlook-2024

**Optional supporting source:** Световната банка, *What a Waste 3.0*:  
https://www.worldbank.org/en/publication/what-a-waste

### Educational integrity rules
- Do not invent statistics, fabricate citations, or present an unsourced number.
- Distinguish estimates and **projections** from proven present conditions (“could grow” matters).
- Use exact/source-grounded phrasing; if replacing a fact, verify the replacement against a primary source.
- Photos require usage rights and attribution; safest MVP is original SVG or hand-made illustrations.
- The **third chapter should directly explain why one turtle could not be saved by cleaning the downstream water alone**. This is the final payoff, not a detached recycling lesson.

---

# 7. ENDING — SCRIPTED NARRATIVE REQUIREMENT

**This must happen after the player successfully defeats Wave 3. Do not make it dependent on chance or tower strength.**

### Intended sequence (approx. 20–25 seconds)

| Time | Event |
|---|---|
| 0–3 sec | Third boss is neutralized. HUD briefly shows **„ПОСЛЕДНАТА ВЪЛНА Е СПРЯНА“**. Shelly is still alive. A brief relief cue plays. |
| 3–6 sec | Music drops out. Normal movement stops. Water subtly darkens. The distant horizon fills with ominous debris silhouettes. |
| 6–13 sec | A giant, dense wall of floating trash advances from outside the playfield. Defensive equipment attempts to react, but is visibly overwhelmed. No interactive controls during this scene. |
| 13–17 sec | Waste engulfs Shelly. The turtle silhouette disappears. Visuals make clear that Shelly is lost; fade to black. Do not show gore. |
| 17–25 sec | Show the final lines in deliberate, readable sequence. A **Continue** control appears after the reveal (or allow skipping animation directly to these lines). |

### Final message — exact Bulgarian text; do not translate back to English

> **Ти спря всяка вълна.**  
> **Но не спря това, което ги поражда.**
>
> Опази един живот, но замърсяването продължи.  
> **За да спасим следващата костенурка, трябва да спрем замърсяването още при източника му.**

After user presses „Продължи“, unlock/open Chapter III. On the closing screen explicitly state **„Шели не оцеля.“** and **„Следващата костенурка все още има шанс.“** Offer **„Прочети книгата“**, **„Играй отново“**, and **„Главно меню“**.

### Foreshadowing and fairness
- Add subtly increasing debris **far in the background** between the waves; even successful defense does not clean the horizon.
- After Waves 1 and 2, small quiet visual hints suggest the supply of waste is not stopping.
- Avoid a long unskippable cutscene. Allow **Skip animation** to jump **to the final message**, not past it.
- The ending is **not** a normal “Game Over” with retry; it is the story’s intended conclusion.
- Do not let towers miraculously destroy the giant final surge, and do not offer a purchasable immunity/shield that changes the ending.

---

# 8. ART DIRECTION AND SOUND

### Look
**Stylized, atmospheric, painterly 2D**. Neither childish cartoon nor photorealistic. Think a serious yet approachable indie game: believable natural silhouettes, layered light and haze, rich water, restrained color, and recognizable waste objects.

**Desired:**
- Deep blue/teal water, soft turquoise highlights, muted sand and marine green.
- Subtle animated current, reflected light, particles or foam at low density.
- Turtle with believable shape and gentle idle movement, not a smiling emoji mascot.
- Trash and towers with hand-crafted silhouettes, a little texture, and clean visual contrast.
- Bosses look like masses of actual waste, **not sentient monsters with faces**.
- Book: old ocean-research journal aesthetic, warm desaturated paper tones, readable typography, minimal ornament.
- Menus: dark ocean palette, crisp text, readable buttons; avoid excessive glow and gradients.
- All in-game assets need to feel part of **one consistent artistic style**.

**Avoid:**
- Emoji as final gameplay art.
- Childish bubbly mobile-game UI, hyper-saturated rainbow colors, plastic 3D icons.
- Fake photorealism or AI-mismatched art styles.
- Excessive HUD clutter, huge blank areas, illegible decorative fonts.
- Paid/watermarked/copyright-infringing art pulled without rights.

### Implementation-first art strategy
In the first milestone, use visually considered Phaser Graphics/SVG assets with coherent proportions and colors. **Do not spend a day waiting for external commissioned assets**. When the complete loop works, selectively improve turtle, trash, boats, background layers and book illustrations. Keep collision, targeting and layout independent of image dimensions.

### Sound (secondary priority)
- Calm underwater ambient loop, subtle current sound.
- Short pleasant collection effect; unobtrusive build/upgrade cues.
- Low, distinct boss arrival cue.
- Silence just before the final trash surge, followed by one restrained low impact.
- Mute button; remember mute preference if convenient. Sound must not be required for comprehension.
- Use only original, permissively licensed or self-generated sounds, with credits where applicable. If audio files are unavailable, provide graceful silence with no console errors.

---

# 9. WEBSITE STRUCTURE AND FRONTEND UX

This is an **ecology website with a playable game**, not just a raw canvas. Keep the web shell minimal, attractive and immediately usable.

### Main menu / landing section
- Game title and one-line hook: **„Спаси една костенурка. Открий защо океанът остава в опасност.“**
- Primary **„Играй“** button.
- Secondary **„Книга на проблемите“** (with unlocked progress indicator), and **„Екип и източници“**.
- A small, visible note: **„Около 4 минути · За един играч“**.
- Do not spoil the ending in the landing text.

### Game view
- Responsive Phaser canvas + HUD + accessible HTML overlay elements.
- Shop usable without blocking most of the screen.
- Pause, mute, restart.
- Short overlay for chapters and ending.
- Clear instructions and contrasting focus/hover states.

### Book and credits
- Book pages include one relevant visual, one fact, cause, solution, source, and Continue/Back controls.
- Credits panel names the two creators with **editable placeholders** (do not invent student names), sources, art/audio licensing, and technology.
- Avoid creating unnecessary separate routed pages; a single-page application with overlays is fine.

### Accessibility / resilience
- Desktop keyboard focus visible on HTML controls; appropriate button labels.
- Include text labels alongside icons.
- Respect `prefers-reduced-motion` for UI animation and offer cutscene skip.
- Ensure adequate color contrast in text and controls.
- Canvas dimensions/coordinates must behave under resizing and high DPI.
- If sound is blocked by browser autoplay rules, enable after user interaction and never crash.
- No network calls required after built assets load; no third-party tracking.

---

# 10. TECH STACK AND PROJECT STRUCTURE

### Stack
- Node.js supported by the installed Vite version.
- `phaser@3.90.0` **pinned** (Phaser 4 is a separate major version).
- Vite (modern stable release compatible with environment).
- Vanilla JavaScript modules, HTML5 and CSS3.
- Optionally a lightweight test runner for pure logic; do not over-engineer.

Commands expected:

```bash
npm install
npm run dev
npm run build
npm run preview
```

### Suggested structure (adapt sensibly)

```text
/
├── index.html
├── package.json
├── vite.config.js             # only if needed
├── README.md
├── public/
│   ├── assets/
│   │   ├── art/                # original/local SVG/PNG assets
│   │   └── audio/              # optional licensed sound
│   └── favicon.svg
└── src/
    ├── main.js
    ├── style.css
    ├── config/
    │   ├── localeBg.js       # single Bulgarian UI text dictionary
│   ├── balance.js         # ONE source of truth for tuning
    │   ├── waves.js
    │   └── chapters.js
    ├── game/
    │   ├── createGame.js
    │   ├── scenes/
    │   │   ├── GameScene.js
    │   │   └── EndingScene.js
    │   ├── systems/
    │   │   ├── PathSystem.js
    │   │   ├── WaveDirector.js
    │   │   ├── TowerSystem.js
    │   │   ├── CombatSystem.js
    │   │   └── RunState.js
    │   └── entities/
    │       ├── Enemy.js
    │       └── Tower.js
    ├── ui/
    │   ├── uiController.js
    │   ├── bookView.js
    │   └── menuView.js
    └── storage/
        └── progress.js
```

**Architecture guidance**
- Phaser owns canvas rendering, spatial enemy movement, targeting visualization and effects.
- Game state lives in a cohesive controller/model, not scattered DOM text fields.
- HTML/CSS owns menu, shop controls, book, ending message and credits where practical.
- Expose state changes via narrow callbacks/events rather than querying DOM from entities.
- Preserve one authoritative game-state machine:

```text
MENU -> TUTORIAL/PREP -> PLAYING -> WAVE_CLEARED
                            |            |
                         DEFEAT       BOOK_1 / BOOK_2
                            |            |
                          PREP <----------+

WAVE_3_CLEARED -> ENDING_CUTSCENE -> FINAL_MESSAGE -> BOOK_3 -> COMPLETE
```

- `update(time, delta)` must use the actual delta with a clamp to prevent jumps after tab inactivity. Paused states must freeze motion/cooldowns/spawns.
- Have one path-distance coordinate per enemy and sample position/tangent along the path.
- Prevent the same enemy being awarded credits twice when hit by multiple towers in one frame.
- Clear timers, events, tweens, and scene objects on restart/retry to avoid duplicate waves.
- Make the ending sequence a dedicated state/scene so normal enemy spawning and player actions cannot continue during it.

### Storage
Only persist:

```js
{
  version: 1,
  unlockedChapters: [1, 2, 3], // actual subset
  mute: false
}
```

Sanitize loaded values, handle storage being disabled/private mode, and avoid storing entire mid-wave gameplay state. Restarting the site should restart gameplay at Wave 1 while preserving unlocked book pages.

---

# 11. IMPLEMENTATION ORDER (DEADLINE FIRST)

**Today is Tuesday, 10 November 2026. Deadline is Monday, 16 November 2026.** There are approximately six days remaining. This is a hard cap; prioritize playability.

### Milestone A — complete ugly-but-coherent vertical slice (Nov 10–11)
- Vite + Phaser 3.90 project launches.
- Ocean backdrop, winding path, stationary turtle, six tower pads.
- Trash movement, first tower build/select/sell, credits, turtle integrity, waves.
- Wave 1 boss and a working defeat/retry.
- At this stage, use basic but consistent vector artwork.

**Exit gate:** You can finish Wave 1 without console errors.

### Milestone B — all three waves and progression (Nov 11–12)
- All three towers, upgrades, boss mechanics, data-driven wave schedule.
- Wave completion bonus, wave transitions, tutorial hints, balance pass.
- Book chapters I and II appear at correct times; localStorage works.

**Exit gate:** Complete Wave 1 -> I -> Wave 2 -> II -> Wave 3 with normal controls.

### Milestone C — story ending and education (Nov 12–13)
- Final boss and scripted, unavoidable flood.
- Explicit tragic conclusion and final message.
- Chapter III unlocks after ending.
- Source links and Credits panel.

**Exit gate:** Entire narrative arc runs start to finish, even with minimal graphics.

### Milestone D — visual polish, accessibility, and balance (Nov 13–14)
- Refine turtle, towers, trash sprites and book illustrations.
- Add currents, lighting and short feedback animations.
- Verify HUD behavior at 1366x768 and a common laptop resolution.
- Tune spawn rates/tower stats until a judge can finish easily.

### Milestone E — deploy and rehearse (Nov 15)
- Build and smoke-test on the intended browser and school computer if available.
- Confirm stable static hosting; test all sources, links and interactions.
- Rehearse an end-to-end demo and record actual elapsed playtime.
- Fix blockers only; no new mechanics.

### Competition day (Nov 16)
- Open the deployed URL with a fresh run and full-screen-ready layout.
- Play all three waves, present the book, and land the closing message.

### Team split (suggested)
- **Developer A:** Phaser gameplay, path movement, towers, enemies, bosses, economy, ending triggers.
- **Developer B:** Web shell, UI, journal, educational copy/source checking, original art/SVG, transitions and sound.
- Both: integration, testing, balancing, presentation.
- Avoid overlapping edits to the same files; agree on interfaces between game state and book/UI early.

---

# 12. ACCEPTANCE TESTS — MUST PASS

## Navigation / story
- [ ] Landing page displays Bulgarian „Играй“, „Книга на проблемите“ and „Екип и източници“, with no story-ending spoiler.
- [ ] First-time tutorial is legible and dismissible.
- [ ] Exactly three waves exist. No endless mode.
- [ ] Defeating Wave 1 boss unlocks Chapter I; it cannot unlock before the boss is defeated.
- [ ] Defeating Wave 2 boss unlocks Chapter II; it cannot unlock before the boss is defeated.
- [ ] Defeating Wave 3 boss triggers the scripted ending; **not an ordinary victory page**.
- [ ] Shelly dies in every successful playthrough, including when health was 10/10.
- [ ] After the final message, Chapter III unlocks and includes root causes and actions.
- [ ] All unlocked chapters remain accessible after refreshing the page.

## Mechanics
- [ ] All enemies follow the path and leave only at its endpoint.
- [ ] Six pads, maximum one tower per pad.
- [ ] Three tower choices with correct costs and affordable/unaffordable states.
- [ ] Skimmer targets the leading enemy; Boat does AoE; Barrier only slows.
- [ ] Upgrades work once per tower; selling refunds correctly.
- [ ] Trash leaks damage the turtle without generating currency.
- [ ] Bosses have unique mechanics and readable health bars.
- [ ] Boss reaching Shelly causes normal failure and retry; boss is not counted as defeated.
- [ ] Retrying a wave restores exact pre-wave state, stops previous spawns/timers, and keeps already-unlocked chapters.
- [ ] Pausing freezes movement, spawns, cooldowns and animations as intended.
- [ ] Repeated restart/retry does not duplicate enemies, money, event listeners, or timers.
- [ ] Game remains playable at 30–60 FPS on a typical school PC, with no frame-rate-driven changes in speed.

## Presentation / education
- [ ] Every user-visible string is natural Bulgarian, including all waves, bosses, tooltips, errors, source labels, book copy, cutscene subtitles, `<title>`, `aria-label`, and `alt`; no accidental English or broken Cyrillic.
- [ ] Bulgarian public title is „Последното течение“ and `<html lang="bg">` is set.
- [ ] No emoji are used as final game sprites.
- [ ] Visuals consistently occupy a stylized middle ground between cartoon and realism.
- [ ] Book pages fit a desktop viewport and contain one fact, cause, solution, illustration, source link.
- [ ] Claims about waste are faithful to the linked authoritative sources.
- [ ] The ending is readable, unambiguous, and can skip animation without skipping the final message.
- [ ] First successful run fits **approximately 4–5 minutes** in actual playtests; if not, adjust wave timing, not the story.
- [ ] `npm run build` succeeds with no missing local assets.
- [ ] Static deployment supports direct load and refreshing.
- [ ] No console errors during a complete clean run.

### Manual QA walkthrough
1. Start from a new browser profile/localStorage-clear state. Book pages should be locked.
2. Start Wave 1 with two sensible tower placements. Confirm credit and damage changes.
3. Defeat Plastic Tide; confirm split children and Chapter I unlock.
4. Start Wave 2; confirm Ghost Net disables a tower temporarily, then restores it. Unlock Chapter II.
5. Start Wave 3; confirm surge aura accelerates nearby trash. Defeat Waste Surge.
6. Confirm final normal gameplay stops. Do not allow purchases or player damage to alter ending.
7. Verify Shelly disappears/dies, final text appears, Chapter III unlocks, closing CTA works.
8. Refresh; ensure completed book pages persist but gameplay begins at menu/Wave 1.
9. Intentionally lose a wave and test Retry Wave, tower resale, pause, and Restart Entire Run.
10. Repeat at narrow browser width and normal desktop resolution.

---

# 13. PRIORITIES / CUT RULES

### P0 — cannot ship without
- Working three-wave tower-defense loop and three bosses.
- Defensible turtle, health, placement, credits, and basic tower behavior.
- Three book chapters, appropriate unlock conditions, sourced copy.
- Unavoidable tragic ending with final message and clear root-cause lesson.
- Full build and run instructions; no crashes.

### P1 — important if time permits
- One upgrade for every tower, sell/reposition, clear tutorial hints.
- Styled original assets, enemy and boss telegraphing, book transitions.
- Mute/pause, improved accessibility, good resizing.

### P2 — only if P0/P1 are done
- Animated wave backgrounds, extra particles, ambient sound, small polish effects.

### Explicitly OUT of scope
- Fourth wave, survival/endless mode, achievements, online leaderboard, accounts, backend, database, multiplayer, mobile app, sophisticated physics, random procedural routes, multiple turtle characters, branching endings, skill tree, complex world map, forced quizzes, long dialogue or cutscenes, monetization.

If behind schedule, **simplify art/particles and the number of simultaneous enemy sprites rather than removing the final chapter or changing the story**. Do not replace tower defense with a clicker just to finish faster.

---

# 14. DEFINITION OF DONE / FINAL CODEX RESPONSE

When you finish, report:

1. What you implemented, with the location of the runnable application, and confirmation that all player-visible content is in Bulgarian.
2. Commands for installing, developing, building, and previewing.
3. What tests you actually ran and their results (including the build).
4. How long the full successful playthrough takes in testing, if measured.
5. Where to modify tower/enemy numbers, text, art, and book sources.
6. Remaining limitations/bugs honestly, if any.

**Do not stop at a plan or screenshot. Implement the playable game.**

---

## Source and technology notes

- Phaser 3.90.0 official release: https://phaser.io/download/release/v3.90.0
- Phaser installation docs: https://docs.phaser.io/phaser/getting-started/installation
- UNEP marine plastic facts: https://www.unep.org/en/what-we-do/ocean-seas-and-coasts/ecosystem-degradation-pollution/plastic-pollution-marine-litter
- FAO fishing gear/ghost fishing: https://www.fao.org/responsible-fishing/marking-of-fishing-gear/abandoned--lost-or-otherwise-discarded-fishing-gear-%28aldfg%29/en
- NOAA derelict fishing gear: https://www.noaa.gov/gc-international-section/marine-debris-derelict-fishing-gear
- UNEP Global Waste Management Outlook 2024: https://www.unep.org/ietc/index.php/resources/report/global-waste-management-outlook-2024
- World Bank What a Waste 3.0: https://www.worldbank.org/en/publication/what-a-waste

**End of specification.**
# Implementation and validation report

Validated on 10 November 2026. The application implements the complete Bulgarian narrative loop in the repository specification, with Phaser 3.90.0, Vite, vanilla JavaScript and local SVG artwork.

## Commands actually run

| Check | Result |
| --- | --- |
| `npm install --no-audit --no-fund` | Passed; lockfile generated |
| `npm test` | All 18 tests passed |
| `npm run test:playthrough` | Complete successful runs at both 30 and 60 simulated FPS |
| `npm run build` | Passed; static output in `dist/` |
| `git diff --check` | Passed |

The build prints Vite's standard large-chunk warning for the full Phaser distribution (approximately 1.21 MB minified / 332 KB gzip). It is separated from application code into its own chunk. This is a warning, not a build failure.

## Browser validation actually performed

Used the shared Chrome browser, normal HTML controls and the real Phaser renderer. No game-state injection, extra credits, invulnerability or forced boss completion was used.

- A fresh journal showed three locked chapters.
- Dismissed the tutorial and built two skimmers on pads 02 and 05, spending the starting 110 credits.
- Completed all three waves without adding or upgrading those skimmers. Shelly retained 10/10 health through normal combat.
- Chapter I opened after the plastic boss and its remaining waste resolved; credits carried into wave II with the completion bonus.
- Observed the ghost-net boss, its health bar and the temporarily crossed-out/disabled skimmer. The tower recovered and chapter II unlocked.
- Completed wave III, observed disabled building controls and the ending, and confirmed that only two chapters were unlocked during the cutscene.
- Read the exact final message, continued to chapter III, then reached the explicit “Шели не оцеля.” / “Следващата костенурка все още има шанс.” closing screen.
- Measured **271 seconds (4 minutes 31 seconds)** from pressing Start Wave I to the closing screen, including chapter reading, screenshots and inspection. This is one guided validation run, not a novice usability study.
- Refreshed: the menu returned with all three chapters still unlocked and gameplay reset to wave I.
- Started another run, built a barrier, upgraded it once, and confirmed the second upgrade was disabled.
- Tested the pause dialog, then intentionally lost with no damage-dealing defenses.
- Retried: health returned to 10/10, credits to 50, and the same upgraded barrier returned on pad 01. Previously unlocked chapters remained available.
- Sold the upgraded barrier for 45 credits (75% of 60 invested) and built a boat for 85 credits.
- Muted, refreshed, and verified the saved preference changed the button to “Включи звука”.
- Inspected the credits and all source links. The authors remain explicit editable placeholders.
- No application-origin console errors were reported during the completed run and the subsequent control checks. Unrelated browser-extension metadata errors were excluded.
- Opened the compiled `dist/index.html` through the local preview server and verified the menu, gameplay screen and local Phaser assets load without bundle-origin console errors.

## Responsive checks

`tests/viewports.html` hosts the actual app in precisely sized frames. It is a development QA helper, not a production entry point.

| Viewport | Observed result |
| --- | --- |
| 1366 × 768 | Gameplay, HUD and shop fit; document scroll dimensions matched viewport dimensions |
| 1920 × 1080 | Document fit without overflow; game retains its 1280 × 720 design scale |
| 390 × 844 | Controls move below the field; no horizontal overflow; journal remains usable |

The chapter III dialog measured 978 × 500 CSS pixels on the laptop layout and 350 × 638 on the narrow layout, with no internal scrolling in either check. Narrow-layout checks are browser viewport checks, not physical-phone touch tests.

## Logic and pacing

The automated playthrough uses the same public model actions and initial balance as normal gameplay. Both frame rates produced wave durations of **50.95 / 58.33 / 66.85 seconds**, a 25-second ending, all three unlocked chapters and the same final state. It asserts the net ability and surge aura actually activate. It never skips bosses.

The 18 focused tests cover path endpoints, purchases/upgrades/refunds, path-distance targeting, clustered boat damage, strongest-only slowing, duplicate-kill protection and plastic splits, leaks, boss failure, exact retry restoration, paused clocks, net disable duration, surge acceleration, frame-rate independence, inactivity clamping, unavoidable endings from both 1 and 10 health, animation skipping, malformed/blocked storage, and repeated resets.

## Fixes made during browser validation

- Specified SVG raster dimensions explicitly so Phaser renders complete turtle and tower textures rather than cropped images.
- Used Canvas rendering and an unsmoothed timer-backed loop. The streamed test display throttled `requestAnimationFrame` to approximately one frame per second despite a visible document; timer-loop diagnostic sampling reached approximately 61 FPS. The authoritative model still clamps long deltas and pauses when the document becomes hidden.
- Moved the last wave-III can and bag close enough to boss arrival for the acceleration ability to be observable.
- Cleaned up collection text when resetting, and retained the dark background after the final fade.

## Remaining limits and handoff

- Replace the two author placeholders in `src/config/localeBg.js` before the competition.
- Rehearse on the actual school computer and intended browser; that hardware was not available here. No physical touch-device or Firefox/Safari run was performed.
- Sound is intentionally limited to original synthesized cues; no ambient music track is included.
- No public hosting deployment or alternate survival ending was added. Static-host deployment instructions are in the README.
- This is a desktop-first game. Narrow layouts work, but a laptop remains the intended judging setup.

Screenshots from the actual browser run are in [`screenshots/`](screenshots/).

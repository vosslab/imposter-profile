# Changelog

## 2026-02-16

- Added `parts/style.css` -- comprehensive CSS stylesheet for the DNA Forensics Investigation Game with a "Knives Out" mansion murder mystery dark theme.
- Added [parts/characters.js](parts/characters.js) -- victim definition (Dr. Victor Graves), 6-suspect CHARACTER_POOL with unique DNA profiles, and `initializeCharacters()` for game setup.
- Added [parts/data_generation.js](parts/data_generation.js) -- scene generation, evidence item creation, and 5 forensic test result generators (blood typing, RFLP, STR, mtDNA, restriction digest) with difficulty-based degradation and mixing.
- Added [parts/scene_phase.js](parts/scene_phase.js) -- scene investigation phase module with evidence collection, gloves/contamination mechanic, chain of custody scoring, collection dialog, and evidence sidebar updates.
- Added [parts/lab_phase.js](parts/lab_phase.js) -- laboratory analysis phase with sample selection, test running, result display (blood typing, RFLP, STR, mtDNA, restriction), interpretation scoring, and sidebar updates.
- Added [parts/gel_rendering.js](parts/gel_rendering.js) -- canvas gel electrophoresis rendering with logarithmic band positioning, size ladder, glow effects, STR electropherogram charts, restriction gels, and modal enlargement.
- Added [parts/timer.js](parts/timer.js) -- countdown timer system with start, stop, pause, resume, and color-coded display (green/yellow/red) with CSS warning and critical classes.
- Added [parts/save_load.js](parts/save_load.js) -- localStorage persistence for saving and loading game state under the key `forensic_detective_save`, with continue-from-save support.
- Added [parts/ui_rendering.js](parts/ui_rendering.js) -- shared UI rendering functions for setup screen (difficulty cards, suspect selection), intro briefing narrative, modal overlay, notifications, phase navigation, and suspect sidebar cards.
- Added [parts/init.js](parts/init.js) -- main entry point with DOMContentLoaded bootstrap, saved game detection, and keyboard shortcuts (Escape, 1/2/3 for phase navigation).
- Added [parts/case_board.js](parts/case_board.js) -- case board phase with evidence summary table, suspect assessment cards (suspicion sliders, notes, evidence tags), conclusion textarea, accusation flow with confirmation dialog, round end score breakdown, and game over screen with reveal, letter grade, educational summary, and methodology feedback.
- Added [parts/scoring.js](parts/scoring.js) -- scoring engine that evaluates scientific rigor across 8 categories (sample handling, chain of custody, test selection, control usage, interpretation, conclusion quality, contamination penalty, efficiency bonus) with keyword-based text analysis for scientific language.
- Added [parts/educational.js](parts/educational.js) -- educational content system with 10 help topics (blood typing, RFLP, STR, mtDNA, restriction enzymes, evidence collection, contamination, controls, interpretation), 13 concept tooltips, test result explanations, and end-game forensic science summary.

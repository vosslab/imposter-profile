# Build retrospective

How the DNA Forensics Investigation Game was built using parallel AI agents, what worked, what didn't, and what to do differently next time.

## What we built

A single-file HTML game (`forensic_detective.html`) assembled from 18 modular source files in `parts/` via `build_game.sh`. The game teaches forensic science (blood typing, RFLP gel electrophoresis) through a murder mystery at a mansion dinner party.

## Timeline

The full build took two sessions:

- **Session 1**: Planning, parallel module authoring (6 agents), initial assembly, first round of bug fixes
- **Session 2**: Data structure fixes, UI rewrite (dropdowns to buttons), canvas timing fix, scope reduction, full game loop verification

Most of session 2 was spent fixing integration bugs from session 1.

## What worked

### Modular file structure

Splitting the game into 18 files in `parts/` and concatenating with `build_game.sh` was the right call. Each file has a clear responsibility and can be edited independently. The build script takes under a second.

### Parallel agent authoring

Six agents wrote code simultaneously:

| Agent | Files | Duration |
| --- | --- | --- |
| CSS styling | `style.css` | ~3 min |
| Characters + data generation | `characters.js`, `data_generation.js` | ~4 min |
| Scene phase | `scene_phase.js` | ~4 min |
| Lab phase + gel rendering | `lab_phase.js`, `gel_rendering.js` | ~4 min |
| Case board + scoring + educational | `case_board.js`, `scoring.js`, `educational.js` | ~8 min |
| Timer + save/load + UI + init | `timer.js`, `save_load.js`, `ui_rendering.js`, `init.js` | ~4 min |

Total wall-clock time for all 14 JS files + 1 CSS file was about 8 minutes. Sequential authoring would have taken 25-30 minutes.

### Playwright browser testing

Using Playwright to click through the full game loop (title -> setup -> scene -> lab -> case board -> accusation -> game over) caught bugs that static analysis would miss: canvas rendering timing, missing DOM elements, broken onclick handlers.

## What didn't work

### No shared data contracts

This was the #1 problem. Each agent wrote code against an assumed interface, but nobody enforced a shared contract. The result:

- `generateTestResult()` put data under `result.data = {fragments: [...]}` but `displayRFLPResult()` read `result.fragments` directly
- `generateBloodTypeResult()` returned `{bloodType: "A+"}` but `displayBloodTypeResult()` compared `bloodType === 'A'` (without the +/- suffix)
- `generateSTRResult()` returned `{loci: {...}}` but `displaySTRResult()` read `result.strProfile`
- `generateRFLPResult()` returned all enzymes `{enzymes: {EcoRI: [...], BamHI: [...]}}` but display expected a single enzyme `{enzyme: "EcoRI", fragments: [...]}`

Every single test type had a data structure mismatch between generator and display. Fixing these consumed most of session 2.

### Over-scoping

The initial plan included 5 forensic test types: blood typing, RFLP, STR, mtDNA, and restriction digest. This was too much surface area for a first pass. We ended up simplifying to just blood typing and RFLP after the user pointed out: "we tried to add too much, perhaps focus on a couple of tests and get it right before expanding."

Starting with 2 tests and expanding later would have been faster overall.

### Canvas rendering timing

All three canvas-based visualizations (RFLP gel, STR chart, restriction gel) were blank on first render. The pattern was:

```javascript
display.innerHTML = html;  // creates <canvas> in DOM
renderGel('canvas-id', lanes, title);  // canvas exists but has zero pixels
```

The fix was `requestAnimationFrame`:

```javascript
display.innerHTML = html;
requestAnimationFrame(function() {
    renderGel('canvas-id', lanes, title);
});
```

This is a well-known browser behavior but easy to miss when multiple agents write code independently.

### UI assumptions

The initial lab phase used dropdowns and textareas. The user wanted buttons. This required a near-complete rewrite of `renderLabPhase()`, plus new functions (`selectSample`, `buildTestButtons`, `runTestDirect`) and new CSS. Getting UI preferences early would have avoided this rework.

## What to do differently

### 1. Write interface contracts first

Before any parallel authoring, write a shared `contracts.js` or a contract document specifying:

- Exact return shapes for every generator function
- Exact property names that display functions will read
- Function signatures with parameter types
- DOM element IDs that each module creates and reads

This single document would have prevented every data structure mismatch.

### 2. Start with minimum viable scope

For a game like this, start with:

- 1-2 test types (not 5)
- 1 evidence type (not 5)
- Fixed difficulty (not 3 levels)
- No save/load

Get the core loop working end-to-end first. Expand only after the foundation is verified.

### 3. Build and test after each agent batch

Instead of writing all 14 files in parallel and then debugging the assembled result, batch the work:

**Batch 1** (sequential, ~2 min): `constants.js`, `characters.js` -- these define the data model everything else depends on.

**Batch 2** (parallel, ~4 min): `game_state.js`, `timer.js`, `style.css`, `body.html`, `head.html`, `tail.html` -- infrastructure with no cross-dependencies.

**Build + smoke test**: Verify the skeleton loads and state machine transitions work.

**Batch 3** (parallel, ~5 min): `data_generation.js`, `scene_phase.js`, `ui_rendering.js` -- scene collection flow.

**Build + smoke test**: Verify evidence collection works.

**Batch 4** (parallel, ~5 min): `lab_phase.js`, `gel_rendering.js` -- lab analysis flow.

**Build + smoke test**: Verify lab tests render correctly.

**Batch 5** (parallel, ~5 min): `case_board.js`, `scoring.js`, `educational.js`, `save_load.js`, `init.js` -- endgame and polish.

**Build + full playthrough**: Verify complete game loop.

Total wall-clock: ~20 min with 4 integration checkpoints vs ~8 min authoring + ~60 min debugging.

### 4. Get UI preferences before building

Ask about interaction style (buttons vs dropdowns vs drag-and-drop) and visual preferences before writing display code. A 2-minute conversation saves a 30-minute rewrite.

### 5. Use the user's existing code as the data model

The user had working Python implementations in `dna_profiling-problems/` that use abstract band indices with frozenset operations. Adopting that simpler model from the start (instead of inventing a bp-based fragment system) would have:

- Reduced data generation complexity
- Made killer identification logic trivial: `(blood - victim) == (suspect - victim)`
- Matched the user's mental model of how DNA profiling works in their curriculum

## Architecture that emerged

```
build_game.sh              Concatenates parts/ into forensic_detective.html
parts/
  head.html                DOCTYPE, meta, title
  style.css                All CSS (~1000 lines)
  body.html                DOM structure (screens, panels, modals)
  constants.js             Game config, test definitions, room data
  characters.js            Victim + 6 suspect DNA profiles
  data_generation.js       Scene and test result generators
  game_state.js            State machine, phase transitions
  timer.js                 Countdown clock
  scene_phase.js           Evidence collection UI
  lab_phase.js             Test selection and result display
  gel_rendering.js         Canvas gel/chart rendering
  case_board.js            Evidence review, accusation, game over
  scoring.js               Scientific rigor scoring engine
  educational.js           Help topics and tooltips
  ui_rendering.js          Setup screen, modals, notifications
  save_load.js             localStorage persistence
  init.js                  Bootstrap and keyboard shortcuts
  tail.html                Closing tags
```

## Key technical decisions

| Decision | Rationale |
| --- | --- |
| Single HTML file output | Opens from `file:///`, zero dependencies, easy to distribute |
| Modular source in `parts/` | Parallel authoring, readable diffs, focused editing |
| Canvas for gels, DOM for everything else | Canvas handles precise band positioning; DOM handles forms and layout |
| Button-based lab UI | Faster interaction, no typing required, mobile-friendlier |
| `requestAnimationFrame` for canvas | Guarantees DOM has committed the canvas element before drawing |
| Properties merged onto result object | `result.fragments` instead of `result.data.fragments` avoids nested access |
| Blood typing + RFLP only | Minimum viable test set that covers exclusion (blood type) and identification (RFLP) |

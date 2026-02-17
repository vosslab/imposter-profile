# Usage

## Quick start

```bash
bash build_game.sh
open forensic_detective.html
```

## Gameplay overview

The game has four phases:

- **Setup** -- choose a difficulty level and select suspects for the case.
- **Scene investigation** -- explore the crime scene and collect evidence. Use
  gloves to avoid contamination and maintain chain of custody.
- **Lab analysis** -- run blood typing and RFLP gel electrophoresis tests on
  collected samples. Interpret results and compare against suspect profiles.
- **Case board** -- review evidence, assess suspects, and make your accusation.

## Build from source

The game compiles from modular source files in [parts/](../parts/) into a
single self-contained HTML file:

```bash
bash build_game.sh
```

This produces `forensic_detective.html` (~236 KB).

## Inputs

Source files live in the `parts/` directory:

- `head.html`, `body.html`, `tail.html` -- HTML structure
- `style.css` -- stylesheet
- `*.js` -- JavaScript modules (constants, characters, data generation, game
  phases, scoring, UI, save/load, initialization)

## Outputs

A single `forensic_detective.html` file containing all HTML, CSS, and
JavaScript inlined. No external dependencies are required at runtime.

## Save and load

Game state persists via browser localStorage under the key
`forensic_detective_save`. Closing and reopening the HTML file in the same
browser restores the saved game.

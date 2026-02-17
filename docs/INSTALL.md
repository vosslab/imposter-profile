# Install

## Requirements

- Git
- Bash
- Any modern web browser (Chrome, Firefox, Safari, Edge)

Python 3.12 is only needed for development and testing.

## Install steps

```bash
git clone <repo-url>
cd imposter-profile
bash build_game.sh
```

This produces a single self-contained `forensic_detective.html` file.

## Dev setup

Install test dependencies:

```bash
pip install -r pip_requirements-dev.txt
```

## Verify install

Open `forensic_detective.html` in a browser and confirm the title screen loads.

# Forensic Detective

An interactive browser-based educational game that teaches forensic science
through a murder mystery. Students and instructors in biology and forensic
science courses use blood typing and RFLP gel electrophoresis to analyze
evidence, evaluate suspects, and solve the case. The game is a single
self-contained HTML file with no external dependencies -- just open it in
any modern web browser.

## Quick start

```bash
bash build_game.sh
open forensic_detective.html
```

## Testing

```bash
source source_me.sh && python -m pytest tests/
```

Dev dependencies are listed in [pip_requirements-dev.txt](pip_requirements-dev.txt).

## Documentation

- [docs/INSTALL.md](docs/INSTALL.md) -- setup and installation
- [docs/USAGE.md](docs/USAGE.md) -- gameplay overview and build instructions
- [docs/AUTHORS.md](docs/AUTHORS.md) -- maintainers and contributors
- [docs/BUILD_RETROSPECTIVE.md](docs/BUILD_RETROSPECTIVE.md) -- retrospective on the parallel-agent build process
- [docs/CHANGELOG.md](docs/CHANGELOG.md) -- chronological record of changes
- [LICENSE](LICENSE) -- MIT license

## Maintainer

Neil Voss, [Bluesky](https://bsky.app/profile/neilvosslab.bsky.social)

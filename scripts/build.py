"""Entry point: build the VS Code theme JSONs into dist/.

Run as `python -m scripts.build` (wrapped by `npm run build` / `just build`,
and by vsce's vscode:prepublish hook). Writes one JSON per flavor, then
refreshes the README's swatch art and generated sections (readme.py).

dist/ is gitignored but packaged wholesale into the vsix from the working
tree, so the directory is cleared first — a renamed or removed flavor must
not leave a stale JSON behind to ship.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from scripts.generate import Theme, generate
from scripts.palette import REPO_ROOT
from scripts.readme import build_readme

DIST_DIR = REPO_ROOT / "dist"


def write_theme(path: Path, theme: Theme) -> None:
    """Write a theme as pretty-printed JSON."""
    path.write_text(json.dumps(theme, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    """Build the VS Code theme JSONs, then refresh the README's art and sections."""
    shutil.rmtree(DIST_DIR, ignore_errors=True)
    DIST_DIR.mkdir()

    for flavor, theme in generate():
        write_theme(DIST_DIR / f"{flavor.slug}.json", theme)

    build_readme()


if __name__ == "__main__":
    main()

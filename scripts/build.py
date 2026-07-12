"""Entry point: build the VS Code theme JSONs into theme/.

Run as `python -m scripts.build` (wrapped by `npm run build` / `just build`,
and by vsce's vscode:prepublish hook). Writes the base theme, one JSON per
lighter variant, and the Dawn Patrol light theme, then refreshes the README's
swatch art and generated sections (readme.py).

theme/ is gitignored: the JSONs are build artifacts, regenerated on every
build and packaged into the vsix from the working tree.
"""

from __future__ import annotations

import json
from pathlib import Path

from scripts.generate import Theme, generate
from scripts.palette import REPO_ROOT
from scripts.readme import build_readme

THEME_DIR = REPO_ROOT / "theme"


def write_theme(path: Path, theme: Theme) -> None:
    """Write a theme as pretty-printed JSON."""
    path.write_text(json.dumps(theme, indent=4, ensure_ascii=False) + "\n")


def main() -> None:
    """Build the VS Code theme JSONs, then refresh the README's art and sections."""
    THEME_DIR.mkdir(exist_ok=True)
    base, variants, light = generate()

    write_theme(THEME_DIR / "rust-in-peace.json", base)
    for spec, theme in variants:
        write_theme(THEME_DIR / f"{spec.slug}.json", theme)
    write_theme(THEME_DIR / "rust-in-peace-dawn-patrol.json", light)

    build_readme()


if __name__ == "__main__":
    main()

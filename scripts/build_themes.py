"""Entry point: build the downstream editor/terminal themes into themes/.

Run as `python -m scripts.build_themes` (wrapped by `npm run build:themes` /
`just build-themes`). Each Target pairs an output path with a generator from
scripts/targets/; all of them render from the shared dark palette alone.

Unlike theme/, the themes/ outputs are committed — users copy them straight
from the repo — so CI rebuilds them and fails if they've gone stale relative
to the palette.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import NamedTuple

from scripts.palette import REPO_ROOT, Palette, load_palette
from scripts.targets import helix, herdr, ptyxis, zed, zellij

THEMES_DIR = REPO_ROOT / "themes"


class Target(NamedTuple):
    """A downstream theme target derived from the shared palette."""

    name: str
    file: str
    generate: Callable[[Palette], str]


TARGETS = [
    Target("Helix", "helix/rust-in-peace.toml", helix.generate),
    Target("Herdr", "herdr/rust-in-peace.toml", herdr.generate),
    Target("Ptyxis", "ptyxis/rust-in-peace.palette", ptyxis.generate),
    Target("Zed", "zed/rust-in-peace.json", zed.generate),
    Target("Zellij", "zellij/rust-in-peace.kdl", zellij.generate),
]


def main() -> None:
    """Render every target theme from the shared palette into themes/."""
    palette = load_palette()
    for target in TARGETS:
        out_path = THEMES_DIR / target.file
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(target.generate(palette))
        print(f"{target.name} -> themes/{target.file}")


if __name__ == "__main__":
    main()

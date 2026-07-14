"""Entry point: build the downstream editor/terminal themes into themes/.

Run as `python -m scripts.build_themes` (wrapped by `just build-themes`,
and run by `just build`). Each Target pairs an output directory/extension with a
generator from scripts/targets/, rendered once per flavor (core, the lighter
variants, Dawn Patrol) so every target ships the same four themes as the VS
Code build. Zed is the one exception: its format is a theme family, so all
four flavors land in a single JSON.

Unlike dist/, the themes/ outputs are committed — users copy them straight
from the repo — so CI rebuilds them and fails if they've gone stale relative
to the palettes.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import NamedTuple

from scripts.palette import REPO_ROOT
from scripts.targets import helix, herdr, ptyxis, zed, zellij
from scripts.variants import Flavor, flavors

THEMES_DIR = REPO_ROOT / "themes"


class Target(NamedTuple):
    """A downstream theme target derived from the shared palettes."""

    name: str
    dir: str
    ext: str
    generate: Callable[[Flavor], str]


TARGETS = [
    Target("Helix", "helix", "toml", helix.generate),
    Target("Herdr", "herdr", "toml", herdr.generate),
    Target("Ptyxis", "ptyxis", "palette", ptyxis.generate),
    Target("Zellij", "zellij", "kdl", zellij.generate),
]


def main() -> None:
    """Render every target theme, in all four flavors, into themes/."""
    all_flavors = flavors()
    for target in TARGETS:
        for flavor in all_flavors:
            file = f"{target.dir}/{flavor.slug}.{target.ext}"
            out_path = THEMES_DIR / file
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(target.generate(flavor))
            print(f"{target.name} -> themes/{file}")

    # Zed themes are families: one file carries all four flavors.
    out_path = THEMES_DIR / "zed" / "rust-in-peace.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(zed.generate(all_flavors))
    print("Zed -> themes/zed/rust-in-peace.json")


if __name__ == "__main__":
    main()

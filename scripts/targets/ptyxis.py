"""Ptyxis `.palette` file.

The 16 ANSI slots plus background/foreground/cursor in Ptyxis's palette INI
format. Ptyxis expects both [Light] and [Dark] sections, so the same colour
block is emitted twice — this is a dark theme under either appearance.
"""

from __future__ import annotations

from scripts.palette import Palette, resolve_palette_path

# The 16 ANSI slots, in Color0..Color15 order.
ANSI_SLOTS = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "brightBlack",
    "brightRed",
    "brightGreen",
    "brightYellow",
    "brightBlue",
    "brightMagenta",
    "brightCyan",
    "brightWhite",
]


def _scheme(palette: Palette) -> list[str]:
    """Build the shared `[Light]`/`[Dark]` colour block (Ptyxis wants both)."""
    return [
        f"Background={resolve_palette_path(palette, 'bg.base')}",
        f"Foreground={resolve_palette_path(palette, 'fg.base')}",
        f"Cursor={resolve_palette_path(palette, 'fg.base')}",
        *(
            f"Color{i}={resolve_palette_path(palette, f'ansi.{slot}')}"
            for i, slot in enumerate(ANSI_SLOTS)
        ),
    ]


HEADER = """\
# rust-in-peace — a Ptyxis palette from the Megadeth "Rust in Peace" cover palette.
# Generated from src/palette.json by scripts/targets/ptyxis.py (just build-themes).
# Do not edit by hand: edit the palette and rebuild.
#
# The 16 ANSI slots plus background/foreground/cursor. [Light] and [Dark]
# share one block — this is a dark theme under either appearance."""


def generate(palette: Palette) -> str:
    """Generate the Ptyxis `.palette` file from the palette."""
    block = _scheme(palette)
    return "\n".join(
        [HEADER, "[Palette]", "Name=Rust in Peace", "", "[Light]", *block, "", "[Dark]", *block, ""]
    )

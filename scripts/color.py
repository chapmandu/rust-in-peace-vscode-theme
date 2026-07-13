"""Palette-derived colours for target-specific shades.

Targets reference most colours as palette paths. The few tool-specific shades
with no palette slot are declared as small formulas over palette anchors — a
mix of two colours — so palette edits propagate everywhere and no hex literal
lives outside src/palette.json.

Design: a formula is a `ColorFn` closure resolved against the palette at
generation time, keeping the declarations in the target modules as data.
"""

from __future__ import annotations

from collections.abc import Callable

from coloraide import Color

from scripts.palette import Palette, resolve_palette_path

type ColorFn = Callable[[Palette], str]
"""A derived colour: resolves to a hex string against a palette."""


def mixed(path_a: str, path_b: str, t: float) -> ColorFn:
    """Mix two palette colours in sRGB; t=0 is all `path_a`, t=1 all `path_b`.

    Also expresses a flattened alpha overlay: mixed(bg, fg, alpha).
    """

    def resolve(palette: Palette) -> str:
        colour_a = Color(resolve_palette_path(palette, path_a))
        colour_b = resolve_palette_path(palette, path_b)
        return colour_a.mix(colour_b, t, space="srgb").to_string(hex=True)

    return resolve

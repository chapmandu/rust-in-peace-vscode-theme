"""Generate the VS Code themes from src/rust-in-peace.yml and the palettes.

The YAML source maps palette colours onto VS Code theme keys exactly once;
every theme is that one mapping resolved against a different palette:

- base: the hand-designed dark palette (src/palette.json)
- variants: formulaic lightenings of the dark palette (variants.py)
- light (Dawn Patrol): the hand-designed light palette (src/palette-light.json)

Design: `{{group.key}}` placeholders are substituted textually *before* YAML
parsing, so the source stays plain YAML and a 2-hex alpha suffix can ride
directly on a placeholder. The custom `!alpha [colour, aa]` tag covers the
anchor-aliased cases. Colours mapped to null are stripped after parsing —
they fall through to VS Code's defaults. A structural parity check between
the two palettes fails the build before anything is written.
"""

from __future__ import annotations

import re
from typing import Any, NamedTuple

import yaml

from scripts.palette import (
    SRC_DIR,
    Palette,
    load_palette,
    palette_paths,
    resolve_palette_path,
)
from scripts.variants import VARIANTS, VariantSpec, transform_palette

type Theme = dict[str, Any]
"""A parsed VS Code colour theme (name, colors, tokenColors, ...)."""

_PLACEHOLDER_RE = re.compile(r"\{\{\s*([\w.]+)\s*\}\}")


class ThemeLoader(yaml.SafeLoader):
    """SafeLoader extended with the theme source's custom tags."""


def _alpha(loader: yaml.SafeLoader, node: yaml.SequenceNode) -> str:
    """`!alpha [hexRGB, alpha]`: concatenate a hex colour and a 2-hex alpha suffix."""
    hex_rgb, alpha = loader.construct_sequence(node)
    return f"{hex_rgb}{alpha}"


ThemeLoader.add_constructor("!alpha", _alpha)


def apply_palette(source: str, palette: Palette) -> str:
    """Substitute `{{group.key}}` placeholders in the YAML source with palette colours.

    Any trailing characters (e.g. a 2-hex alpha suffix) are preserved.
    """
    return _PLACEHOLDER_RE.sub(lambda match: resolve_palette_path(palette, match.group(1)), source)


def assert_palette_parity(dark: Palette, light: Palette) -> None:
    """Fail loudly if the dark and light palettes have drifted structurally."""
    dark_paths = set(palette_paths(dark))
    light_paths = set(palette_paths(light))
    problems = [
        f'palette-light.json is missing "{path}"' for path in sorted(dark_paths - light_paths)
    ]
    problems += [f'palette.json is missing "{path}"' for path in sorted(light_paths - dark_paths)]
    if problems:
        raise ValueError("palette parity check failed:\n  " + "\n  ".join(problems))


def build_theme(theme_yaml: str, palette: Palette) -> Theme:
    """Substitute a palette into the YAML source and parse it into a theme."""
    theme: Theme = yaml.load(
        apply_palette(theme_yaml, palette),
        Loader=ThemeLoader,  # noqa: S506 — ThemeLoader subclasses SafeLoader
    )
    # Colours mapped to null (or empty) fall through to VS Code's defaults.
    theme["colors"] = {key: value for key, value in theme["colors"].items() if value}
    return theme


class GeneratedThemes(NamedTuple):
    """The build's outputs: the base theme, its lighter variants, and the light theme."""

    base: Theme
    variants: list[tuple[VariantSpec, Theme]]
    light: Theme


def generate() -> GeneratedThemes:
    """Build every theme from the YAML mapping and the two hand-designed palettes."""
    theme_yaml = (SRC_DIR / "rust-in-peace.yml").read_text()
    palette = load_palette()
    light_palette = load_palette("palette-light.json")
    assert_palette_parity(palette, light_palette)

    base = build_theme(theme_yaml, palette)

    variants: list[tuple[VariantSpec, Theme]] = []
    for spec in VARIANTS:
        theme = build_theme(theme_yaml, transform_palette(palette, spec))
        theme["name"] = spec.label
        variants.append((spec, theme))

    # The light theme resolves the same YAML mapping against the hand-designed
    # light palette rather than a formulaic transform of the dark one.
    light = build_theme(theme_yaml, light_palette)
    light["name"] = "Rust in Peace Dawn Patrol"

    return GeneratedThemes(base, variants, light)

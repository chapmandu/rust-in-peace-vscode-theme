"""Generate the VS Code themes from src/rust-in-peace.yml and the palettes.

The YAML source maps palette colours onto VS Code theme keys exactly once;
every theme is that one mapping resolved against a different flavor's palette
(variants.flavors()): the hand-designed dark palette, its formulaic
lightenings, and the hand-designed light palette (Dawn Patrol).

Design: `{{group.key}}` placeholders are substituted textually *before* YAML
parsing, so the source stays plain YAML and a 2-hex alpha suffix can ride
directly on a placeholder. The custom `!alpha [colour, aa]` tag covers the
anchor-aliased cases. Colours mapped to null are stripped after parsing —
they fall through to VS Code's defaults. Missing palette paths fail the
build loudly; structural parity between the two palettes is asserted by
tests/test_palette.py.
"""

from __future__ import annotations

import re
from typing import Any

import yaml

from scripts.palette import SRC_DIR, Palette, resolve_palette_path
from scripts.variants import Flavor, flavors

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


def build_theme(theme_yaml: str, palette: Palette) -> Theme:
    """Substitute a palette into the YAML source and parse it into a theme."""
    theme: Theme = yaml.load(
        apply_palette(theme_yaml, palette),
        Loader=ThemeLoader,  # noqa: S506 — ThemeLoader subclasses SafeLoader
    )
    # Colours mapped to null (or empty) fall through to VS Code's defaults.
    theme["colors"] = {key: value for key, value in theme["colors"].items() if value}
    return theme


def generate() -> list[tuple[Flavor, Theme]]:
    """Build every theme flavor by resolving the YAML mapping against its palette."""
    theme_yaml = (SRC_DIR / "rust-in-peace.yml").read_text(encoding="utf-8")

    themes: list[tuple[Flavor, Theme]] = []
    for flavor in flavors():
        theme = build_theme(theme_yaml, flavor.palette)
        theme["name"] = flavor.label
        themes.append((flavor, theme))
    return themes

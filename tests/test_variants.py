from coloraide import Color

from scripts.palette import Palette, palette_paths, resolve_palette_path
from scripts.variants import VARIANTS, contrast, flavors, transform_palette

PALETTE: Palette = {
    "bg": {"base": "#101530", "sunken": "#0a0e22"},
    "fg": {"base": "#d3e0f0"},
    "ui": {"button": "#2a3b8f"},
    "ansi": {"black": "#0a0e22", "red": "#e06c75", "brightWhite": "#ffffff"},
    "syntax": {"keyword": "#5e9fe0"},
}

HANGAR_18 = VARIANTS[0]


def lightness(hex_colour: str) -> float:
    return float(Color(hex_colour).convert("hsl")["lightness"])


def saturation(hex_colour: str) -> float:
    return float(Color(hex_colour).convert("hsl")["saturation"])


def test_structure_is_preserved() -> None:
    transformed = transform_palette(PALETTE, HANGAR_18)
    assert palette_paths(transformed) == palette_paths(PALETTE)


def test_neutral_lift_tapers_with_lightness() -> None:
    transformed = transform_palette(PALETTE, HANGAR_18)
    dark_gain = lightness(resolve_palette_path(transformed, "bg.base")) - lightness("#101530")
    text_gain = lightness(resolve_palette_path(transformed, "fg.base")) - lightness("#d3e0f0")
    assert dark_gain > text_gain >= 0


def test_accents_are_desaturated() -> None:
    transformed = transform_palette(PALETTE, HANGAR_18)
    assert saturation(resolve_palette_path(transformed, "syntax.keyword")) < saturation("#5e9fe0")


def test_accent_contrast_floor_is_kept() -> None:
    for spec in VARIANTS:
        transformed = transform_palette(PALETTE, spec)
        new_bg = resolve_palette_path(transformed, "bg.base")
        for path in ("syntax.keyword", "ansi.red"):
            original = resolve_palette_path(PALETTE, path)
            floor = min(contrast(original, "#101530"), 4.5)
            assert contrast(resolve_palette_path(transformed, path), new_bg) >= floor


def test_neutral_ansi_keys_follow_the_neutral_ladder() -> None:
    """black/brightWhite lift like surfaces; accent ANSI colours desaturate instead."""
    transformed = transform_palette(PALETTE, HANGAR_18)
    assert resolve_palette_path(transformed, "ansi.black") == resolve_palette_path(
        transformed, "bg.sunken"
    )
    assert saturation(resolve_palette_path(transformed, "ansi.red")) < saturation("#e06c75")


def test_contrast_is_symmetric_and_matches_wcag_extremes() -> None:
    assert round(contrast("#ffffff", "#000000"), 6) == round(contrast("#000000", "#ffffff"), 6)
    assert round(contrast("#ffffff", "#000000")) == 21


def test_flavors_mirror_the_vscode_themes() -> None:
    """Core first, light last, one flavor per VS Code theme, unique slugs."""
    all_flavors = flavors()
    assert len(all_flavors) == len(VARIANTS) + 2
    assert len({flavor.slug for flavor in all_flavors}) == len(all_flavors)
    assert all_flavors[0].slug == "rust-in-peace"
    assert [flavor.appearance for flavor in all_flavors] == ["dark"] * (len(VARIANTS) + 1) + [
        "light"
    ]
    assert all_flavors[-1].slug == "rust-in-peace-dawn-patrol"

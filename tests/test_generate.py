import pytest

from scripts.generate import apply_palette, assert_palette_parity, build_theme
from scripts.palette import Palette

PALETTE: Palette = {"bg": {"base": "#101530"}, "fg": {"base": "#d3e0f0"}}


def test_apply_palette_substitutes_placeholders() -> None:
    assert apply_palette("x: '{{bg.base}}'", PALETTE) == "x: '#101530'"


def test_apply_palette_preserves_alpha_suffix() -> None:
    assert apply_palette("x: '{{ bg.base }}80'", PALETTE) == "x: '#10153080'"


def test_apply_palette_unknown_path_raises() -> None:
    with pytest.raises(ValueError, match="syntax.keyword"):
        apply_palette("x: '{{syntax.keyword}}'", PALETTE)


def test_alpha_tag_concatenates_colour_and_alpha() -> None:
    source = 'name: t\ncolors:\n  a: !alpha ["#101530", 99]\ntokenColors: []'
    theme = build_theme(source, {})
    assert theme["colors"] == {"a": "#10153099"}


def test_build_theme_strips_unset_colours() -> None:
    source = "name: t\ncolors:\n  keep: '#101530'\n  drop: null\ntokenColors: []"
    theme = build_theme(source, {})
    assert theme["colors"] == {"keep": "#101530"}


def test_palette_parity_passes_on_identical_structure() -> None:
    assert_palette_parity(PALETTE, {"bg": {"base": "#fffefc"}, "fg": {"base": "#0d166c"}})


def test_palette_parity_reports_both_directions() -> None:
    light: Palette = {"bg": {"base": "#fffefc"}, "extra": "#000000"}
    with pytest.raises(ValueError) as excinfo:
        assert_palette_parity(PALETTE, light)
    assert 'palette-light.json is missing "fg.base"' in str(excinfo.value)
    assert 'palette.json is missing "extra"' in str(excinfo.value)

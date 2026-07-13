import pytest

from scripts.palette import Palette, hex_to_rgb, load_palette, palette_paths, resolve_palette_path

PALETTE: Palette = {
    "bg": {"base": "#101530", "surface": "#1c2547"},
    "fg": {"base": "#d3e0f0"},
}


def test_palette_paths_flattens_nested_groups() -> None:
    assert palette_paths(PALETTE) == ["bg.base", "bg.surface", "fg.base"]


def test_resolve_palette_path() -> None:
    assert resolve_palette_path(PALETTE, "bg.surface") == "#1c2547"


def test_resolve_palette_path_missing_raises() -> None:
    with pytest.raises(ValueError, match="syntax.keyword"):
        resolve_palette_path(PALETTE, "syntax.keyword")


def test_resolve_palette_path_rejects_group_path() -> None:
    with pytest.raises(ValueError, match='"bg"'):
        resolve_palette_path(PALETTE, "bg")


def test_src_palettes_have_structural_parity() -> None:
    # The two hand-edited sources must stay in sync, including paths nothing
    # references yet — the builds only fail loudly on paths they actually use.
    dark_paths = set(palette_paths(load_palette()))
    light_paths = set(palette_paths(load_palette("palette-light.json")))
    missing_from_light = sorted(dark_paths - light_paths)
    missing_from_dark = sorted(light_paths - dark_paths)
    assert (missing_from_light, missing_from_dark) == ([], [])


def test_hex_to_rgb() -> None:
    assert hex_to_rgb("#5e9fe0") == (0x5E, 0x9F, 0xE0)
    assert hex_to_rgb("5e9fe0") == (0x5E, 0x9F, 0xE0)


@pytest.mark.parametrize("bad", ["#fff", "#5e9fe0aa", "not-a-colour"])
def test_hex_to_rgb_rejects_non_6_digit_hex(bad: str) -> None:
    with pytest.raises(ValueError):
        hex_to_rgb(bad)

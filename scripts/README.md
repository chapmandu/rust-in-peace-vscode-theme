# Build scripts

Everything shipped by this repo — the VS Code themes, the downstream editor/terminal
themes, and the README's swatch art — is generated from two small palette files by
the Python package in this directory. Nothing in `theme/` or `themes/` is edited by
hand; you change a palette (or a mapping) and rebuild.

## Running the build

The scripts are a Python package run from the repo root as modules
(`python -m scripts.build`), with dependencies managed by [uv](https://docs.astral.sh/uv/).
You don't need to activate a virtualenv or install anything globally — `uv run`
resolves the environment from `pyproject.toml`/`uv.lock` on the fly. In practice you
go through the wrappers:

```sh
just setup          # one-time: toolchain (mise), Python deps (uv), npm deps
just build          # VS Code themes into theme/ + README art and sections
just build-themes   # downstream themes into themes/
just check          # the full quality suite (ruff, mypy, pytest, lint, ...)
```

Each `just` recipe wraps the matching npm script (`npm run build`, etc.), which in
turn runs `uv run python -m scripts.<module>`. `vsce` also runs the build via the
`vscode:prepublish` hook, so a packaged extension can never ship stale JSON.

## How a theme gets built

```
src/palette.json ─────┐  (dark, hand-designed)
                      ├─ variants.flavors() ── 4 flavors ─┬─ build.py ──────── theme/*.json (VS Code)
src/palette-light.json┘  (light, hand-designed)           ├─ build_themes.py ─ themes/**   (Helix, Herdr, ...)
                                                          └─ readme.py ─────── assets/generated/*.png + README sections
```

**Palettes** (`palette.py`). `src/palette.json` is the single source of truth: a
nested JSON object of semantic colour groups (`bg`, `fg`, `ui`, `syntax`, `ansi`)
holding `#rrggbb` values. Generators look colours up by dotted path —
`resolve_palette_path(palette, "syntax.keyword")` — and any path that doesn't land
on a colour raises, so a renamed key fails the build instead of silently shipping
the wrong shade. `palette-light.json` mirrors the same structure for the light
theme; `tests/test_palette.py` asserts the two stay structurally identical.

**Flavors** (`variants.py`). A *flavor* is one shippable theme: a display name, a
filename slug, a light/dark appearance, and a fully resolved palette.
`flavors()` returns the canonical four, dark to light:

1. **Rust in Peace** — the hand-designed dark palette, as-is.
2. **Hangar 18** — the dark palette, lightened a step.
3. **Polaris** — lightened two steps.
4. **Dawn Patrol** — the hand-designed light palette, as-is.

The two middle flavors are computed, not drawn: a `VariantSpec` is four numbers
that drive three colour transforms (all HSL maths via
[coloraide](https://facelessuser.github.io/coloraide/)). Neutrals get a lightness
lift that tapers off as colours get lighter, so backgrounds rise a lot and text
barely moves; accents are desaturated and the brightest ones darkened slightly so
they don't glare on the lighter ground; UI chrome gets both. A contrast guard
keeps every accent at least as readable against the new background as it was
against the old one (capped at the WCAG 4.5:1 target). Every build enumerates
`flavors()`, which is what keeps all targets shipping the same four themes.

**The VS Code mapping** (`generate.py` → `build.py`). `src/rust-in-peace.yml` maps
palette colours onto VS Code theme keys exactly once. Colours appear as
`{{group.key}}` placeholders that are substituted *textually* before the YAML is
parsed — that keeps the source plain YAML and lets a 2-hex alpha suffix ride
directly on a placeholder (`'{{bg.selection}}80'`). A custom `!alpha` tag covers
the cases where the colour comes through a YAML anchor instead. Keys mapped to
`null` are stripped after parsing and fall through to VS Code's defaults.
`build.py` clears `theme/` and writes one JSON per flavor, then refreshes the
README. `theme/` is gitignored but packaged wholesale into the `.vsix`, hence the
clear-first: a renamed flavor must not leave a stale JSON behind to ship.

**Downstream targets** (`build_themes.py` + `targets/`). Each module in
`scripts/targets/` knows one application's theme format and exposes
`generate(flavor) -> str`:

- `helix.py` — Helix TOML (standalone theme, full UI layer)
- `herdr.py` — herdr TOML config fragment (recolours its tokyo-night base)
- `ptyxis.py` — Ptyxis `.palette` INI (16 ANSI slots + bg/fg/cursor)
- `zellij.py` — Zellij KDL
- `zed.py` — Zed JSON; the one exception to one-file-per-flavor, since Zed
  themes are families — all four flavors land in a single JSON

`build_themes.py` renders every target for every flavor into `themes/`. Unlike
`theme/`, these outputs **are committed** — users copy them straight from the
repo — so CI rebuilds them and fails if they've drifted from the palettes.
If you edit a palette or a target module, rerun `just build-themes` and commit
the regenerated files.

Targets reference colours as palette paths wherever possible. The few
tool-specific shades with no palette slot are declared as mix formulas over
palette anchors (`color.py`'s `mixed(path_a, path_b, t)`), so palette edits still
propagate and no hex literal lives outside `src/`.

**README art** (`readme.py`). Run as part of `build.py`. Each flavor is rendered
as a miniature editor window — a deterministic SVG assembled from f-strings, with
text runs pinned via `textLength` so layout is pure arithmetic rather than
renderer font metrics — then rasterized to PNG at 2× with resvg, because the
Marketplace rejects SVG in READMEs. The hero and palette-grid blocks are spliced
into `README.md` between `<!-- GENERATED ... -->` markers; everything outside the
markers is hand-edited.

**Lint** (`lint.py`). `just lint` checks the theme's colour keys against the
[VS Code theme-color reference](https://code.visualstudio.com/api/references/theme-color)
(network-dependent). Keys the theme sets that the reference no longer lists fail
the run; keys left to VS Code's defaults are reported as informational.

## Common changes

**Tweak a colour** — edit `src/palette.json` (and usually its counterpart in
`palette-light.json`), then `just build build-themes`. Everything downstream
follows.

**Map a colour to a new VS Code key** — add the key to `src/rust-in-peace.yml`
with a `{{group.key}}` placeholder and rebuild.

**Add a target** — write `scripts/targets/<app>.py` with a
`generate(flavor: Flavor) -> str`, then register it in the `TARGETS` list in
`build_themes.py`.

**Add a flavor** — append a `VariantSpec` to `VARIANTS` in `variants.py` (or a
new `Flavor` in `flavors()` for a hand-designed palette), and register the theme
in `package.json`'s `contributes.themes` so VS Code offers it.

## Tests

`just test` runs the unit tests in `tests/`, covering palette parity between the
dark and light sources, placeholder resolution, the variant transforms (including
the contrast guard), colour mixing, and the README splicing. The wider
`just check` adds ruff, mypy, dead-code and duplication checks on this package.

import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { Resvg } from '@resvg/resvg-js';
import { Palette, loadPalette, resolvePalettePath } from './palette';
import { VARIANTS, transformPalette } from './variants';

const REPO = 'https://github.com/chapmandu/rust-in-peace-vscode-theme';
const REPO_RAW = `${REPO}/raw/main`;
const MARKETPLACE_URL =
    'https://marketplace.visualstudio.com/items?itemName=chapmandu.rust-in-peace';

/** A theme rendered into the README: the base palette or a variant of it. */
interface ReadmeTheme {
    label: string;
    slug: string;
    palette: Palette;
}

/** Short palette-role keys used by the snippet's token runs. */
const ROLE_PATHS = {
    fg: 'fg.base',
    cm: 'fg.comment',
    kw: 'syntax.keyword',
    bi: 'syntax.builtin',
    in: 'syntax.info',
    fn: 'syntax.function',
    str: 'syntax.string',
    ty: 'syntax.type',
    ct: 'syntax.constant',
} as const;

type Role = keyof typeof ROLE_PATHS;

/** One run of same-coloured text; 'squiggle' marks the error underline. */
type Run = [text: string, role: Role, squiggle?: 'squiggle'];

/**
 * The demo snippet, as token runs so the same code renders in every
 * variant's colours. Each line exists to exercise a palette role; the
 * squiggle sits under "intelligence" (two words combined that can't make
 * sense — Hangar 18).
 */
const SNIPPET: Run[][] = [
    [['//! Megadeth — Rust in Peace (1990)', 'cm']],
    [
        ['use ', 'kw'],
        ['hangar', 'bi'],
        ['::', 'fg'],
        ['warhead', 'bi'],
        ['::', 'fg'],
        ['Polaris', 'ty'],
        [';', 'fg'],
    ],
    [
        ['#[military(', 'in'],
        ['intelligence', 'in', 'squiggle'],
        [' = ', 'fg'],
        ['false', 'ct'],
        [')]', 'in'],
    ],
    [
        ['pub struct ', 'kw'],
        ['Rattlehead', 'ty'],
        [' { rust_eaten: ', 'fg'],
        ['bool', 'bi'],
        [' }', 'fg'],
    ],
    [
        ['impl ', 'kw'],
        ['Rattlehead', 'ty'],
        [' {', 'fg'],
    ],
    [
        ['    ', 'fg'],
        ['pub fn ', 'kw'],
        ['holy_wars', 'fn'],
        ['(&', 'fg'],
        ['self', 'kw'],
        [') -> ', 'fg'],
        ['Punishment', 'ty'],
        [' {', 'fg'],
    ],
    [
        ['        ', 'fg'],
        ['let ', 'kw'],
        ['dues = ', 'fg'],
        ['Verse', 'ty'],
        ['::', 'fg'],
        ['from', 'fn'],
        ['(', 'fg'],
        ['"the punishment due"', 'str'],
        [');', 'fg'],
    ],
    [
        ['        dues.', 'fg'],
        ['punish', 'fn'],
        ['(', 'fg'],
        ['NUCLEAR_DAWN', 'ct'],
        [' * ', 'fg'],
        ['1990', 'ct'],
        [')', 'fg'],
    ],
    [['    }', 'fg']],
    [['}', 'fg']],
];

/** Zero-based line index that gets the current-line highlight. */
const CURRENT_LINE = 6;

/** Rail labels for the syntax colours, drawn from the album's world. */
const RAIL_NAMES: Record<string, string> = {
    keyword: 'warhead', // Polaris missile steel — the cobalt of the cover art
    builtin: 'cryogenic', // "suspended state of cryogenics" — Hangar 18
    info: 'radar', // the airbase radar glow
    function: 'geiger', // radioactive green, counted in clicks
    string: 'trefoil', // the yellow radiation symbol on the hangar door
    type: 'oxide', // rust, resting in peace
    constant: 'lucretia', // the album's ghost track — ethereal violet
    error: 'punishment', // "The Punishment Due" — every error gets theirs
};

// Window geometry (viewBox units; display size is set by the README <img>).
const W = 640;
const H = 400;
const TAB_H = 36;
const RAIL_Y = 312;
const STATUS_Y = 368;
const CODE_X = 64;
const FIRST_BASELINE = 62;
const LINE_H = 24;
const FONT = 13;
const CH = FONT * 0.6; // monospace advance; tspans are pinned with textLength

// JetBrains Mono's advance is exactly 0.6em, matching the layout math below,
// so textLength pinning never stretches glyphs.
const MONO = "'JetBrains Mono', ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace";

const escapeXml = (text: string): string =>
    text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/** Format a coordinate without float noise, for byte-stable output. */
const fmt = (value: number): string => String(Number(value.toFixed(1)));

/** Wavy error underline starting at x, of the given width. */
const squigglePath = (x: number, y: number, width: number): string => {
    const step = 6;
    const segments = Math.max(1, Math.round(width / step));
    const tail = ' t 6 0'.repeat(segments - 1);
    return `M ${fmt(x)} ${fmt(y)} q 3 3 6 0${tail}`;
};

/** Render one theme as a miniature editor window (deterministic SVG). */
const renderWindow = (palette: Palette, label: string): string => {
    const colour = (path: string): string => resolvePalettePath(palette, path);
    const parts: string[] = [];

    parts.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(label)} palette preview">`,
        `<defs><clipPath id="window"><rect width="${W}" height="${H}" rx="12"/></clipPath></defs>`,
        `<g clip-path="url(#window)" font-family="${MONO}">`,
        // Window bands: tab strip, editor, hex rail, status bar.
        `<rect width="${W}" height="${H}" fill="${colour('bg.sunken')}"/>`,
        `<rect y="${TAB_H}" width="${W}" height="${RAIL_Y - TAB_H}" fill="${colour('bg.base')}"/>`,
        `<rect y="${STATUS_Y}" width="${W}" height="${H - STATUS_Y}" fill="${colour('ui.statusBar')}"/>`
    );

    // Window dots, in palette colours.
    const dots: Array<[number, string]> = [
        [20, colour('syntax.error')],
        [38, colour('syntax.string')],
        [56, colour('syntax.function')],
    ];
    for (const [cx, fill] of dots) {
        parts.push(`<circle cx="${cx}" cy="18" r="5" fill="${fill}" opacity="0.75"/>`);
    }

    // Active tab with VS Code's top accent border.
    parts.push(
        `<rect x="80" y="8" width="170" height="34" rx="6" fill="${colour('bg.base')}"/>`,
        `<rect x="84" y="6" width="162" height="2" rx="1" fill="${colour('ui.button')}"/>`,
        `<text x="165" y="27" text-anchor="middle" font-size="12" fill="${colour('fg.base')}">rust_in_peace.rs</text>`
    );

    // Current-line highlight, under the text but over the editor band.
    const currentLineTop = FIRST_BASELINE + CURRENT_LINE * LINE_H - 16;
    parts.push(
        `<rect y="${fmt(currentLineTop)}" width="${W}" height="${LINE_H}" fill="${colour('bg.selection')}" opacity="0.6"/>`
    );

    // Gutter numbers and code lines.
    SNIPPET.forEach((runs, index) => {
        const baseline = FIRST_BASELINE + index * LINE_H;
        const numberFill = index === CURRENT_LINE ? colour('fg.muted') : colour('fg.comment');
        parts.push(
            `<text x="44" y="${fmt(baseline)}" text-anchor="end" font-size="11" fill="${numberFill}">${index + 1}</text>`
        );

        const tspans: string[] = [];
        let cursor = CODE_X;
        for (const [text, role, squiggle] of runs) {
            const width = text.length * CH;
            tspans.push(
                `<tspan x="${fmt(cursor)}" textLength="${fmt(width)}" lengthAdjust="spacingAndGlyphs" fill="${colour(ROLE_PATHS[role])}">${escapeXml(text)}</tspan>`
            );
            if (squiggle) {
                parts.push(
                    `<path d="${squigglePath(cursor, baseline + 4, width)}" fill="none" stroke="${colour('syntax.error')}" stroke-width="1.2"/>`
                );
            }
            cursor += width;
        }
        parts.push(
            `<text y="${fmt(baseline)}" font-size="${FONT}" xml:space="preserve">${tspans.join('')}</text>`
        );
    });

    // Colour rail: the eight syntax colours as named cells.
    const syntaxKeys = Object.keys(palette['syntax'] as Palette);
    const cell = W / syntaxKeys.length;
    syntaxKeys.forEach((key, index) => {
        const x = index * cell;
        parts.push(
            `<rect x="${fmt(x + 12)}" y="${RAIL_Y + 10}" width="${fmt(cell - 24)}" height="18" rx="4" fill="${colour(`syntax.${key}`)}"/>`,
            `<text x="${fmt(x + cell / 2)}" y="${RAIL_Y + 46}" text-anchor="middle" font-size="9.5" fill="${colour('fg.muted')}">${RAIL_NAMES[key] ?? key}</text>`
        );
    });

    // Status bar text: ink is white on the dark palettes, navy on light.
    parts.push(
        `<text x="16" y="${STATUS_Y + 20}" font-size="11" fill="${colour('fg.ink')}">${escapeXml(label)}</text>`,
        `<text x="${W - 16}" y="${STATUS_Y + 20}" text-anchor="end" font-size="11" fill="${colour('fg.ink')}" opacity="0.8" xml:space="preserve">Ln 7, Col 29   UTF-8   Rust</text>`
    );

    parts.push(
        '</g>',
        `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${colour('bg.border')}"/>`,
        '</svg>'
    );
    return `${parts.join('\n')}\n`;
};

// Banner geometry.
const BANNER_W = 1280;
const BANNER_H = 280;

/**
 * The masthead: a near-flat cobalt field, a centred type lockup with a
 * corroded title (fixed-seed turbulence erosion and displacement, rust
 * creeping up from below), the radioactive logo at each end, and a thin rule
 * of the eight syntax colours.
 */
const renderBanner = (palette: Palette, logoDataUri: string, themeNames: string[]): string => {
    const colour = (path: string): string => resolvePalettePath(palette, path);
    const cx = BANNER_W / 2;
    const parts: string[] = [];

    parts.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${BANNER_W}" height="${BANNER_H}" viewBox="0 0 ${BANNER_W} ${BANNER_H}" role="img" aria-label="Rust in Peace — a dark theme for VS Code">`,
        '<defs>',
        `<linearGradient id="field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colour('bg.sunken')}"/><stop offset="1" stop-color="${colour('bg.base')}"/></linearGradient>`,
        // Steel plate rusting from the bottom edge up.
        `<linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colour('fg.base')}"/><stop offset="0.62" stop-color="${colour('fg.base')}"/><stop offset="0.8" stop-color="${colour('fg.muted')}"/><stop offset="0.9" stop-color="${colour('syntax.type')}"/><stop offset="1" stop-color="${colour('syntax.error')}"/></linearGradient>`,
        // Decay: speckle-erode the glyph alpha, then warp the edges.
        // Fixed seeds keep the output byte-stable.
        '<filter id="decay" x="-10%" y="-30%" width="120%" height="160%">',
        '<feTurbulence type="fractalNoise" baseFrequency="0.18 0.2" numOctaves="3" seed="1990" result="spots"/>',
        '<feColorMatrix in="spots" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 5 -1.1" result="mask"/>',
        '<feComposite in="SourceGraphic" in2="mask" operator="in" result="eroded"/>',
        '<feTurbulence type="fractalNoise" baseFrequency="0.03 0.14" numOctaves="3" seed="18" result="warp"/>',
        '<feDisplacementMap in="eroded" in2="warp" scale="4" xChannelSelector="R" yChannelSelector="G"/>',
        '</filter>',
        `<image id="logo" width="128" height="128" href="${logoDataUri}"/>`,
        `<clipPath id="banner"><rect width="${BANNER_W}" height="${BANNER_H}" rx="12"/></clipPath>`,
        '</defs>',
        `<g clip-path="url(#banner)" font-family="${MONO}">`,
        `<rect width="${BANNER_W}" height="${BANNER_H}" fill="url(#field)"/>`
    );

    // The radioactive logo, anchoring each end.
    const logoY = (BANNER_H - 128) / 2;
    parts.push(
        `<use href="#logo" x="96" y="${fmt(logoY)}"/>`,
        `<use href="#logo" x="${BANNER_W - 96 - 128}" y="${fmt(logoY)}"/>`
    );

    // Centred type lockup; only the title decays.
    const runWidth = (text: string, fontSize: number, letterSpacing: number): string =>
        fmt(text.length * fontSize * 0.6 + (text.length - 1) * letterSpacing);
    const lockup = (text: string, y: number, fontSize: number, letterSpacing: number, attrs: string): string =>
        `<text x="${cx}" y="${y}" text-anchor="middle" font-size="${fontSize}" letter-spacing="${letterSpacing}" ${attrs} textLength="${runWidth(text, fontSize, letterSpacing)}" lengthAdjust="spacingAndGlyphs">${escapeXml(text)}</text>`;
    // The title's words are pinned individually so the word gaps can be
    // tighter than a monospace space would allow. The font size is derived
    // so the title spans exactly the spectrum rule's width.
    const RULE_WIDTH = 640;
    const TITLE_LS = 3;
    const TITLE_GAP = 40;
    // Measured on the rendered PNG: sidebearings and the decay displacement
    // leave the title's ink ~7 units right of the advance box's centre, so
    // the layout is nudged left to optically centre it on the rule.
    const TITLE_NUDGE = -7;
    const words = ['RUST', 'IN', 'PEACE'];
    const glyphCount = words.join('').length;
    const trackedGaps = glyphCount - words.length;
    const TITLE_FONT =
        (RULE_WIDTH - trackedGaps * TITLE_LS - (words.length - 1) * TITLE_GAP) /
        (glyphCount * 0.6);
    const wordWidths = words.map(w => w.length * TITLE_FONT * 0.6 + (w.length - 1) * TITLE_LS);
    let wordX =
        cx + TITLE_NUDGE - (wordWidths.reduce((a, b) => a + b, 0) + TITLE_GAP * (words.length - 1)) / 2;
    const titleSpans = words
        .map((word, i) => {
            const span = `<tspan x="${fmt(wordX)}" textLength="${fmt(wordWidths[i])}" lengthAdjust="spacingAndGlyphs">${word}</tspan>`;
            wordX += wordWidths[i] + TITLE_GAP;
            return span;
        })
        .join('');
    parts.push(
        lockup(themeNames.join(' | ').toUpperCase(), 96, 9, 3, `fill="${colour('fg.comment')}"`),
        `<text y="172" font-size="${fmt(TITLE_FONT)}" font-weight="bold" letter-spacing="${TITLE_LS}" fill="url(#steel)" filter="url(#decay)">${titleSpans}</text>`,
        lockup('DARK THEMES', 232, 12, 6, `fill="${colour('fg.muted')}"`)
    );

    // The accent: a contiguous spectrum rule of the eight syntax colours,
    // matching the title's visible width above it.
    const syntaxKeys = Object.keys(palette['syntax'] as Palette);
    const segment = RULE_WIDTH / syntaxKeys.length;
    syntaxKeys.forEach((key, index) => {
        parts.push(
            `<rect x="${fmt(cx - RULE_WIDTH / 2 + index * segment)}" y="194" width="${fmt(segment)}" height="3" fill="${colour(`syntax.${key}`)}"/>`
        );
    });

    parts.push(
        '</g>',
        `<rect x="0.5" y="0.5" width="${BANNER_W - 1}" height="${BANNER_H - 1}" rx="12" fill="none" stroke="${colour('bg.border')}"/>`,
        '</svg>'
    );
    return `${parts.join('\n')}\n`;
};

/**
 * CI and marketplace badges, tinted from the palette. shields.io retired its
 * visual-studio-marketplace service; badgen.net still serves it live and is
 * on vsce's trusted-badge list.
 */
const badges = (palette: Palette): string => {
    const tint = (path: string): string => resolvePalettePath(palette, path).slice(1);
    const badgen = (kind: string, label: string, color: string): string =>
        `[![${label}](https://flat.badgen.net/vs-marketplace/${kind}/chapmandu.rust-in-peace?label=${label.toLowerCase()}&labelColor=${tint('bg.sunken')}&color=${color})](${MARKETPLACE_URL})`;
    return [
        `[![CI](${REPO}/actions/workflows/ci.yml/badge.svg)](${REPO}/actions/workflows/ci.yml)`,
        badgen('v', 'Marketplace', tint('ui.button')),
        badgen('i', 'Installs', tint('ui.statusBar')),
    ].join('\n');
};

/** Render an SVG string to a PNG at 2x resolution (crisp on hidpi). */
const renderPng = (svg: string): Buffer =>
    new Resvg(svg, {
        fitTo: { mode: 'zoom', value: 2 },
        font: {
            loadSystemFonts: true,
            defaultFontFamily: 'JetBrains Mono',
            monospaceFamily: 'JetBrains Mono',
        },
    })
        .render()
        .asPng();

/** The hero: the generated banner, tagline, and badges. */
const heroBlock = (palette: Palette): string => `<div align="center">

<img src="${REPO_RAW}/assets/generated/banner.png" alt="Rust in Peace — a dark theme for VS Code" width="1280"/>

<br/>

**A dark theme for VS Code, inspired by the album art of Megadeth's 1990 metal masterpiece, _Rust in Peace_.**

${badges(palette)}

<br/>

</div>`;

/** The palette section: album cover and the theme grid, dark to light. */
const paletteBlock = (themes: ReadmeTheme[]): string => {
    const swatchUrl = (slug: string): string => `${REPO_RAW}/assets/generated/${slug}.png`;
    const cell = (theme: ReadmeTheme): string =>
        `<td align="center" width="50%"><strong>${theme.label.replace('Rust in Peace ', '')}</strong><br/><img src="${swatchUrl(theme.slug)}" alt="${theme.label}" width="400"/></td>`;

    // All themes at equal size, reading dark to light. One single-row table
    // per pair, with a spacer between, so the grid rows get breathing room.
    const rows: string[] = [];
    for (let i = 0; i < themes.length; i += 2) {
        rows.push(`<table>\n<tr>\n${themes.slice(i, i + 2).map(cell).join('\n')}\n</tr>\n</table>`);
    }

    return `<div align="center">

<br/>

<img src="${REPO_RAW}/assets/Megadeth-RustInPeace.jpg" alt="Rust in Peace album cover" width="260"/>

_Hand-picked from the record's rusted, cobalt-blue cover art._

<br/>

${rows.join('\n\n<br/>\n\n')}

<br/>

</div>`;
};

/** Splice a generated block into the named marker region. */
const inject = (source: string, region: string, block: string): string => {
    const startMarker = `<!-- GENERATED ${region} START (npm run build — do not edit by hand) -->`;
    const endMarker = `<!-- GENERATED ${region} END -->`;
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start === -1 || end === -1 || end < start) {
        throw new Error(`README.md is missing the "${startMarker}" / "${endMarker}" markers`);
    }
    return source.slice(0, start + startMarker.length) + `\n${block}\n` + source.slice(end);
};

/** Regenerate the banner/swatch SVGs and the READMEs' generated sections. */
export const buildReadme = async (): Promise<void> => {
    const [palette, lightPalette] = await Promise.all([
        loadPalette(),
        loadPalette('palette-light.json'),
    ]);
    const themes: ReadmeTheme[] = [
        { label: 'Rust in Peace', slug: 'rust-in-peace', palette },
        ...VARIANTS.map(spec => ({
            label: spec.label,
            slug: spec.slug,
            palette: transformPalette(palette, spec),
        })),
    ];
    const light: ReadmeTheme = {
        label: 'Rust in Peace Dawn Patrol',
        slug: 'rust-in-peace-dawn-patrol',
        palette: lightPalette,
    };

    // Embedded as a data URI: GitHub serves the SVG through <img>, which
    // blocks external resource loads.
    const logo = await readFile(join(__dirname, '..', 'assets', 'logo.png'));
    const logoDataUri = `data:image/png;base64,${logo.toString('base64')}`;

    // PNG rather than SVG: the Marketplace rejects SVG images in READMEs.
    const generatedDir = join(__dirname, '..', 'assets', 'generated');
    await rm(generatedDir, { recursive: true, force: true });
    await mkdir(generatedDir, { recursive: true });
    await Promise.all([
        writeFile(
            join(generatedDir, 'banner.png'),
            renderPng(
                renderBanner(
                    palette,
                    logoDataUri,
                    [...themes, light].map(t => t.label.replace('Rust in Peace ', ''))
                )
            )
        ),
        ...[...themes, light].map(theme =>
            writeFile(
                join(generatedDir, `${theme.slug}.png`),
                renderPng(renderWindow(theme.palette, theme.label))
            )
        ),
    ]);

    const readmePath = join(__dirname, '..', 'README.md');
    const readme = await readFile(readmePath, 'utf-8');

    const regions: Record<string, string> = {
        HERO: heroBlock(palette),
        // Dark to light: base, Hangar 18, Polaris, Dawn Patrol.
        PALETTE: paletteBlock([...themes, light]),
    };

    let updated = readme;
    for (const [region, block] of Object.entries(regions)) {
        updated = inject(updated, region, block);
    }

    if (updated !== readme) {
        await writeFile(readmePath, updated);
    }
};

import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
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

const MONO = "ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace";

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

    // Hex rail: the eight syntax colours as labelled cells.
    const syntaxKeys = Object.keys(palette['syntax'] as Palette);
    const cell = W / syntaxKeys.length;
    syntaxKeys.forEach((key, index) => {
        const x = index * cell;
        const hex = colour(`syntax.${key}`);
        parts.push(
            `<rect x="${fmt(x + 12)}" y="${RAIL_Y + 10}" width="${fmt(cell - 24)}" height="18" rx="4" fill="${hex}"/>`,
            `<text x="${fmt(x + cell / 2)}" y="${RAIL_Y + 46}" text-anchor="middle" font-size="9.5" fill="${colour('fg.muted')}">${hex}</text>`
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
 * The masthead: a near-flat cobalt field with a left-aligned type lockup and
 * one accent — a thin rule of the eight syntax colours. Nothing else.
 */
const renderBanner = (palette: Palette): string => {
    const colour = (path: string): string => resolvePalettePath(palette, path);
    const parts: string[] = [];

    parts.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${BANNER_W}" height="${BANNER_H}" viewBox="0 0 ${BANNER_W} ${BANNER_H}" role="img" aria-label="Rust in Peace — a dark theme for VS Code">`,
        '<defs>',
        `<linearGradient id="field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colour('bg.sunken')}"/><stop offset="1" stop-color="${colour('bg.base')}"/></linearGradient>`,
        `<clipPath id="banner"><rect width="${BANNER_W}" height="${BANNER_H}" rx="12"/></clipPath>`,
        '</defs>',
        `<g clip-path="url(#banner)" font-family="${MONO}">`,
        `<rect width="${BANNER_W}" height="${BANNER_H}" fill="url(#field)"/>`
    );

    // Type lockup.
    parts.push(
        `<text x="88" y="104" font-size="12" letter-spacing="6" fill="${colour('fg.muted')}" textLength="380" lengthAdjust="spacingAndGlyphs">A DARK THEME FOR VS CODE</text>`,
        `<text x="86" y="172" font-size="68" font-weight="bold" letter-spacing="8" fill="${colour('fg.base')}" textLength="640" lengthAdjust="spacingAndGlyphs">RUST IN PEACE</text>`,
        `<text x="88" y="232" font-size="13" letter-spacing="4" fill="${colour('fg.comment')}" textLength="400" lengthAdjust="spacingAndGlyphs">ONE PALETTE · THREE THEMES</text>`
    );

    // The accent: a contiguous spectrum rule of the eight syntax colours.
    const syntaxKeys = Object.keys(palette['syntax'] as Palette);
    const ruleWidth = 640;
    const segment = ruleWidth / syntaxKeys.length;
    syntaxKeys.forEach((key, index) => {
        parts.push(
            `<rect x="${fmt(88 + index * segment)}" y="196" width="${fmt(segment)}" height="3" fill="${colour(`syntax.${key}`)}"/>`
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

/** GitHub hero: the generated banner. The Marketplace variant keeps the logo and a real screenshot, since it refuses SVG imagery. */
const heroBlock = (palette: Palette, withSvg: boolean): string => {
    const masthead = withSvg
        ? `<img src="${REPO_RAW}/assets/generated/banner.svg" alt="Rust in Peace — a dark theme for VS Code" width="1280"/>`
        : `<img src="${REPO_RAW}/assets/logo.png" alt="Rust in Peace logo" width="120"/>

# Rust in Peace

![Screenshot](${REPO_RAW}/assets/screenshot.png)`;

    return `<div align="center">

${masthead}

**A dark theme for VS Code, inspired by the album art of Megadeth's 1990 metal masterpiece, _Rust in Peace_.**

${badges(palette)}

</div>`;
};

/**
 * The palette section. The Marketplace refuses SVG images in READMEs, so
 * `withSvg: false` renders it without the editor-window swatches.
 */
const paletteBlock = (themes: ReadmeTheme[], withSvg: boolean): string => {
    const swatchUrl = (slug: string): string => `${REPO_RAW}/assets/generated/${slug}.svg`;
    const cell = (theme: ReadmeTheme): string =>
        `<td align="center" width="50%"><strong>${theme.label.replace('Rust in Peace ', '')}</strong><br/><img src="${swatchUrl(theme.slug)}" alt="${theme.label}" width="400"/></td>`;

    // All themes at equal size, reading dark to light.
    const rows: string[] = [];
    for (let i = 0; i < themes.length; i += 2) {
        rows.push(`<tr>\n${themes.slice(i, i + 2).map(cell).join('\n')}\n</tr>`);
    }

    const swatches = withSvg
        ? `

<table>
${rows.join('\n')}
</table>`
        : `

![Screenshot](${REPO_RAW}/assets/screenshot.png)`;

    return `<div align="center">

<img src="${REPO_RAW}/assets/Megadeth-RustInPeace.jpg" alt="Rust in Peace album cover" width="260"/>

_Hand-picked from the record's rusted, cobalt-blue cover art._${swatches}

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

    const generatedDir = join(__dirname, '..', 'assets', 'generated');
    await rm(generatedDir, { recursive: true, force: true });
    await mkdir(generatedDir, { recursive: true });
    await Promise.all([
        writeFile(join(generatedDir, 'banner.svg'), renderBanner(palette)),
        ...[...themes, light].map(theme =>
            writeFile(join(generatedDir, `${theme.slug}.svg`), renderWindow(theme.palette, theme.label))
        ),
    ]);

    const readmePath = join(__dirname, '..', 'README.md');
    const readme = await readFile(readmePath, 'utf-8');

    const regions: Record<string, { github: string; marketplace: string }> = {
        HERO: { github: heroBlock(palette, true), marketplace: heroBlock(palette, false) },
        PALETTE: {
            // Dark to light: base, Hangar 18, Polaris, Dawn Patrol.
            github: paletteBlock([...themes, light], true),
            marketplace: paletteBlock([...themes, light], false),
        },
    };

    let github = readme;
    let marketplace = readme;
    for (const [region, blocks] of Object.entries(regions)) {
        github = inject(github, region, blocks.github);
        marketplace = inject(marketplace, region, blocks.marketplace);
    }

    if (github !== readme) {
        await writeFile(readmePath, github);
    }
    // The Marketplace build packages this SVG-free copy via --readme-path.
    await writeFile(join(__dirname, '..', 'README.marketplace.md'), marketplace);
};

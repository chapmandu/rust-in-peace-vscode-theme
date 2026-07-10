import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Palette, loadPalette, resolvePalettePath } from './palette';
import { VARIANTS, transformPalette } from './variants';

const REPO_RAW = 'https://github.com/chapmandu/rust-in-peace-vscode-theme/raw/main';
const START_MARKER = '<!-- GENERATED PALETTE START (npm run build — do not edit by hand) -->';
const END_MARKER = '<!-- GENERATED PALETTE END -->';

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

    // Status bar text.
    parts.push(
        `<text x="16" y="${STATUS_Y + 20}" font-size="11" fill="${colour('ansi.brightWhite')}">${escapeXml(label)}</text>`,
        `<text x="${W - 16}" y="${STATUS_Y + 20}" text-anchor="end" font-size="11" fill="${colour('ansi.brightWhite')}" opacity="0.8" xml:space="preserve">Ln 7, Col 29   UTF-8   Rust</text>`
    );

    parts.push(
        '</g>',
        `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${colour('bg.border')}"/>`,
        '</svg>'
    );
    return `${parts.join('\n')}\n`;
};

/** Markdown table of hex codes for the given palette groups, per theme. */
const hexTable = (themes: ReadmeTheme[], groups: string[]): string => {
    const header = `| Colour | ${themes.map(t => t.label.replace('Rust in Peace ', '')).join(' | ')} |`;
    const divider = `| --- | ${themes.map(() => '---').join(' | ')} |`;
    const rows: string[] = [];
    for (const group of groups) {
        for (const key of Object.keys(themes[0].palette[group] as Palette)) {
            const path = `${group}.${key}`;
            const cells = themes.map(t => `\`${resolvePalettePath(t.palette, path)}\``);
            rows.push(`| \`${path}\` | ${cells.join(' | ')} |`);
        }
    }
    return [header, divider, ...rows].join('\n');
};

/**
 * The full generated README block between the markers. The Marketplace
 * refuses SVG images in READMEs, so `withSvg: false` renders the same block
 * without the editor-window swatches for the packaged README.
 */
const renderBlock = (themes: ReadmeTheme[], withSvg: boolean): string => {
    const [base, ...variants] = themes;
    const swatchUrl = (slug: string): string => `${REPO_RAW}/assets/swatches/${slug}.svg`;
    const shortName = (theme: ReadmeTheme): string => theme.label.replace('Rust in Peace ', '');

    const variantCells = variants
        .map(
            v =>
                `<td align="center"><strong>${shortName(v)}</strong><br/><img src="${swatchUrl(v.slug)}" alt="${v.label}" width="400"/></td>`
        )
        .join('\n');

    const swatches = withSvg
        ? `

<img src="${swatchUrl(base.slug)}" alt="${base.label}" width="720"/>

<table>
<tr>
${variantCells}
</tr>
</table>`
        : '';

    return `<div align="center">

<img src="${REPO_RAW}/assets/Megadeth-RustInPeace.jpg" alt="Rust in Peace album cover" width="260"/>

_Hand-picked from the record's rusted, cobalt-blue cover art._${swatches}

</div>

${hexTable(themes, ['bg', 'fg', 'syntax', 'ui'])}

<details>
<summary><strong>ANSI terminal colours</strong></summary>

${hexTable(themes, ['ansi'])}

</details>`;
};

/** Splice a generated block between the README markers. */
const inject = (readme: string, block: string): string => {
    const start = readme.indexOf(START_MARKER);
    const end = readme.indexOf(END_MARKER);
    if (start === -1 || end === -1 || end < start) {
        throw new Error(`README.md is missing the "${START_MARKER}" / "${END_MARKER}" markers`);
    }
    return readme.slice(0, start + START_MARKER.length) + `\n${block}\n` + readme.slice(end);
};

/** Regenerate the swatch SVGs and the README's generated palette section. */
export const buildReadme = async (): Promise<void> => {
    const palette = await loadPalette();
    const themes: ReadmeTheme[] = [
        { label: 'Rust in Peace', slug: 'rust-in-peace', palette },
        ...VARIANTS.map(spec => ({
            label: spec.label,
            slug: spec.slug,
            palette: transformPalette(palette, spec),
        })),
    ];

    const swatchDir = join(__dirname, '..', 'assets', 'swatches');
    await mkdir(swatchDir, { recursive: true });
    await Promise.all(
        themes.map(theme =>
            writeFile(join(swatchDir, `${theme.slug}.svg`), renderWindow(theme.palette, theme.label))
        )
    );

    const readmePath = join(__dirname, '..', 'README.md');
    const readme = await readFile(readmePath, 'utf-8');

    const updated = inject(readme, renderBlock(themes, true));
    if (updated !== readme) {
        await writeFile(readmePath, updated);
    }

    // The Marketplace build packages this SVG-free copy via --readme-path.
    await writeFile(
        join(__dirname, '..', 'README.marketplace.md'),
        inject(readme, renderBlock(themes, false))
    );
};

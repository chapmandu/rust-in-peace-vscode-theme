import { Palette, resolvePalettePath } from '../palette';

/**
 * Static syntax-role assignments. These reference palette *names* (resolved by
 * the [palette] block below), not colours, so they never change with the
 * source palette — only the named colours underneath them do.
 */
const ROLES = `keyword = { fg = "aqua" }
"keyword.control" = { fg = "aqua" }
"keyword.control.import" = { fg = "aqua" }
"keyword.control.return" = { fg = "aqua" }
"keyword.function" = { fg = "aqua" }
"keyword.operator" = { fg = "aqua" }
"keyword.directive" = { fg = "aqua" }
operator = { fg = "aqua" }
punctuation = { fg = "fg" }
"punctuation.delimiter" = { fg = "aqua" }
tag = { fg = "aqua" }
"constant.character.escape" = { fg = "aqua" }

function = { fg = "light-green" }
"function.builtin" = { fg = "cyan" }
"function.macro" = { fg = "light-green" }
attribute = { fg = "light-green", modifiers = ["italic"] }

string = { fg = "yellow" }
"string.regexp" = { fg = "yellow" }

type = { fg = "orange", modifiers = ["italic"] }
"type.builtin" = { fg = "orange", modifiers = ["italic"] }
constructor = { fg = "orange" }
"variable.parameter" = { fg = "orange", modifiers = ["italic"] }

constant = { fg = "purple" }
"constant.builtin" = { fg = "purple" }
"variable.builtin" = { fg = "cyan", modifiers = ["italic"] }
"variable.other.member" = { fg = "fg" }
namespace = { fg = "fg" }

"comment.block.documentation" = { fg = "comment", modifiers = ["italic"] }
"comment.line.documentation" = { fg = "comment", modifiers = ["italic"] }

"markup.heading" = { fg = "purple", modifiers = ["bold"] }
"markup.link" = { fg = "cyan", underline = { style = "line" } }
"markup.list" = { fg = "cyan" }
"markup.raw" = { fg = "light-green" }
"markup.quote" = { fg = "yellow", modifiers = ["italic"] }

"diff.plus" = { fg = "light-green" }
"diff.minus" = { fg = "red" }
"diff.delta" = { fg = "orange" }`;

/**
 * A [palette] entry: a named colour resolved from a palette path or a literal
 * `#rrggbb` (for Helix-specific shades the core palette doesn't carry), or a
 * blank line to preserve the grouping. `comment` is an optional inline note.
 */
type Entry = 'blank' | { name: string; ref: string; comment?: string };

/**
 * Helix's named colours. Shared identity colours point at the palette so they
 * track the source of truth; the rest are Helix-only shades kept as literals.
 */
const PALETTE: Entry[] = [
    { name: 'red', ref: 'syntax.error', comment: 'rust / logo-edge red' },
    { name: 'orange', ref: 'syntax.type', comment: 'logo orange — types, parameters' },
    { name: 'yellow', ref: 'syntax.string', comment: 'logo gold — strings' },
    { name: 'light-green', ref: 'syntax.function', comment: 'glowing hand green — functions' },
    { name: 'green', ref: '#9cbee6', comment: 'pale tube glow (unused member slot)' },
    { name: 'aqua', ref: 'syntax.keyword', comment: 'electric tube blue — keywords, operators' },
    { name: 'teal', ref: '#5f8fc4', comment: 'slate blue — markup, hints' },
    { name: 'turquoise', ref: '#9db4d8', comment: 'muted hangar blue' },
    { name: 'light-cyan', ref: '#c8e6ff', comment: 'ice glow' },
    { name: 'cyan', ref: 'syntax.builtin', comment: 'sky cyan — builtins' },
    { name: 'blue', ref: 'syntax.info', comment: 'bright tube blue — UI accents, labels' },
    { name: 'purple', ref: 'syntax.constant', comment: 'softened violet — constants, headings' },
    { name: 'magenta', ref: 'ansi.magenta', comment: 'sarcophagus pink — select mode' },
    { name: 'comment', ref: 'fg.comment', comment: 'muted blue shading' },
    { name: 'black', ref: 'bg.surface', comment: 'raised surface blue' },
    'blank',
    { name: 'add', ref: '#5cb454' },
    { name: 'change', ref: '#5878c4' },
    { name: 'delete', ref: '#a04a3a' },
    'blank',
    { name: 'error', ref: '#e05a3e', comment: 'deep rust' },
    { name: 'info', ref: '#55aef5' },
    { name: 'hint', ref: '#5f8fc4' },
    'blank',
    { name: 'fg', ref: 'fg.base', comment: 'pale blue highlight white' },
    { name: 'fg-dark', ref: 'fg.muted' },
    { name: 'fg-gutter', ref: '#33406f', comment: 'line numbers, whitespace marks' },
    { name: 'fg-linenr', ref: '#7484b8' },
    { name: 'fg-selected', ref: '#232d5c', comment: 'menu selection bg' },
    { name: 'border', ref: 'bg.border' },
    { name: 'border-highlight', ref: 'syntax.keyword' },
    { name: 'bg', ref: 'bg.base', comment: 'hangar deep blue' },
    { name: 'bg-inlay', ref: '#101d40' },
    { name: 'bg-selection', ref: 'bg.selection' },
    { name: 'bg-menu', ref: 'bg.sunken', comment: 'statusline, popups' },
    { name: 'bg-focus', ref: 'bg.overlay' },
];

const HEADER = `# rust-in-peace — generated from src/palette.json. Do not edit by hand.
inherits = "tokyonight"

# Syntax roles mirror the rust-in-peace VSCode theme (original structure):
#   keywords / operators / delimiters / tags = electric tube blue
#   functions / decorators = glow green      strings  = logo gold
#   types / parameters     = logo orange     constants = violet
#   builtins               = sky cyan        comments  = muted blue
# UI structure comes from the inherited base theme.`;

/** Generate the Helix TOML theme from the palette. */
export default (palette: Palette): string => {
    const width = Math.max(
        ...PALETTE.map(entry => (entry === 'blank' ? 0 : entry.name.length))
    );

    const paletteLines = PALETTE.map(entry => {
        if (entry === 'blank') {
            return '';
        }
        const hex = entry.ref.startsWith('#')
            ? entry.ref
            : resolvePalettePath(palette, entry.ref);
        const line = `${entry.name.padEnd(width)} = "${hex}"`;
        return entry.comment ? `${line} # ${entry.comment}` : line;
    });

    return [HEADER, '', ROLES, '', '[palette]', ...paletteLines, ''].join('\n');
};

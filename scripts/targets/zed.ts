import { Palette, resolvePalettePath } from '../palette';

/** A syntax group: one palette colour applied to a set of Zed syntax scopes. */
interface SyntaxGroup {
    scopes: string[];
    color: string;
    font_style?: 'italic';
    font_weight?: number;
}

/**
 * Syntax highlighting, grouped by palette role. Mirrors the VS Code theme's
 * token philosophy: keywords/operators/tags = tube blue, functions = green,
 * strings = gold, types/params = orange, constants/numbers = violet,
 * builtins/links = cyan, comments = muted blue.
 */
const SYNTAX: SyntaxGroup[] = [
    {
        color: 'syntax.keyword',
        scopes: [
            'keyword', 'keyword.conditional', 'keyword.conditional.ternary',
            'keyword.coroutine', 'keyword.directive', 'keyword.directive.define',
            'keyword.exception', 'keyword.export', 'keyword.function',
            'keyword.import', 'keyword.modifier', 'keyword.operator',
            'keyword.repeat', 'keyword.return', 'keyword.type', 'operator',
            'tag', 'tag.delimiter', 'string.escape', 'constant.macro',
            'concept', 'character.special',
        ],
    },
    {
        color: 'syntax.function',
        scopes: [
            'function', 'function.builtin', 'function.call', 'function.decorator',
            'function.macro', 'function.method', 'function.method.call',
            'attribute', 'tag.attribute', 'diff.plus',
        ],
    },
    {
        color: 'syntax.string',
        scopes: [
            'string', 'string.regex', 'string.regexp', 'string.special',
            'string.special.symbol', 'string.special.path', 'string.doc',
            'string.documentation', 'text.literal', 'character',
        ],
    },
    {
        color: 'syntax.type',
        scopes: [
            'type', 'type.builtin', 'type.class.definition', 'type.definition',
            'type.interface', 'type.super', 'enum', 'constructor',
            'comment.todo', 'comment.warning',
        ],
    },
    {
        color: 'syntax.type',
        font_style: 'italic',
        scopes: ['parameter', 'variable.parameter'],
    },
    {
        color: 'syntax.constant',
        scopes: ['constant', 'constant.builtin', 'boolean', 'number', 'number.float', 'float'],
    },
    {
        color: 'syntax.builtin',
        scopes: ['preproc', 'link_text', 'link_uri', 'string.special.url'],
    },
    {
        color: 'syntax.info',
        scopes: ['comment.note', 'comment.hint'],
    },
    {
        color: 'syntax.error',
        scopes: [
            'diff.minus', 'comment.error', 'variable.special', 'variable.builtin',
            'keyword.debug',
        ],
    },
    {
        color: 'fg.comment',
        scopes: ['comment', 'comment.doc', 'comment.documentation', 'predoc', 'tag.doctype'],
    },
    {
        color: 'fg.base',
        scopes: [
            'label', 'punctuation', 'punctuation.bracket', 'punctuation.delimiter',
            'punctuation.list_marker', 'punctuation.special', 'module', 'namespace',
            'parent', 'primary', 'property', 'symbol', 'variable', 'variable.member',
            'variant', 'field', 'embedded',
        ],
    },
    { color: 'syntax.string', font_style: 'italic', scopes: ['emphasis'] },
    { color: 'syntax.type', font_weight: 700, scopes: ['emphasis.strong'] },
    { color: 'syntax.constant', font_weight: 700, scopes: ['title'] },
];

/** The seven translucent editor accents, in Tokyo Night's accent order. */
const ACCENTS = [
    'syntax.constant', 'syntax.info', 'syntax.function', 'syntax.builtin',
    'syntax.string', 'syntax.type', 'syntax.error',
];

/** Generate the Zed theme JSON from the palette. */
export default (palette: Palette): string => {
    const col = (path: string, alpha = ''): string => resolvePalettePath(palette, path) + alpha;

    // Semantic aliases for the UI surfaces.
    const bg = col('bg.base'); //           editor & primary background
    const chrome = col('bg.sunken'); //     panels, tabs, status/title bars, terminal
    const elevated = col('bg.border'); //   elevated surfaces / overlays (darkest)
    const border = col('bg.border');
    const active = col('bg.overlay'); //    active line, active element, drop target
    const selection = col('bg.selection');
    const muted = col('fg.comment'); //     hover/selected elements, dim UI
    const fg = col('fg.base');
    const subtext = col('fg.muted');
    const accent = col('syntax.info'); //   accent text/icons, links
    const gitBorder = active; //            border around git-status callouts

    const syntax: Record<string, { color: string; font_style: string | null; font_weight: number | null }> = {};
    for (const group of SYNTAX) {
        for (const scope of group.scopes) {
            syntax[scope] = {
                color: col(group.color),
                font_style: group.font_style ?? null,
                font_weight: group.font_weight ?? null,
            };
        }
    }

    // A git-status token expands to `<name>`, `<name>.background` and
    // `<name>.border` — a coloured foreground on the editor background.
    const statusEntries = (name: string, path: string): Record<string, string> => ({
        [name]: col(path),
        [`${name}.background`]: bg,
        [`${name}.border`]: gitBorder,
    });

    const style = {
        accents: ACCENTS.map(path => col(path, '66')),
        'background.appearance': 'opaque',
        border,
        'border.variant': border,
        'border.focused': col('syntax.keyword', '33'),
        'border.selected': border,
        'border.transparent': border,
        'border.disabled': border,
        'elevated_surface.background': elevated,
        'surface.background': chrome,
        background: bg,
        'element.background': bg,
        'element.hover': muted,
        'element.active': active,
        'element.selected': muted,
        'element.disabled': active,
        'drop_target.background': selection,
        'ghost_element.background': bg,
        'ghost_element.hover': muted,
        'ghost_element.active': active,
        'ghost_element.selected': muted,
        'ghost_element.disabled': active,
        text: fg,
        'text.muted': subtext,
        'text.placeholder': muted,
        'text.disabled': muted,
        'text.accent': accent,
        icon: subtext,
        'icon.muted': muted,
        'icon.disabled': muted,
        'icon.placeholder': muted,
        'icon.accent': accent,
        'status_bar.background': chrome,
        'title_bar.background': chrome,
        'title_bar.inactive_background': chrome,
        'toolbar.background': chrome,
        'tab_bar.background': chrome,
        'tab.inactive_background': chrome,
        'tab.active_background': active,
        'search.match_background': active,
        'panel.background': chrome,
        'panel.focused_border': null,
        'panel.indent_guide': active,
        'panel.indent_guide_active': muted,
        'panel.indent_guide_hover': muted,
        'panel.overlay_background': elevated,
        'pane.focused_border': null,
        'pane_group.border': border,
        'scrollbar.thumb.background': col('fg.comment', '80'),
        'scrollbar.thumb.hover_background': muted,
        'scrollbar.thumb.border': muted,
        'scrollbar.track.background': col('bg.base', '80'),
        'scrollbar.track.border': border,
        'editor.foreground': fg,
        'editor.background': bg,
        'editor.gutter.background': bg,
        'editor.subheader.background': bg,
        'editor.active_line.background': active,
        'editor.highlighted_line.background': active,
        'editor.line_number': muted,
        'editor.active_line_number': fg,
        'editor.invisible': null,
        'editor.wrap_guide': border,
        'editor.active_wrap_guide': border,
        'editor.document_highlight.read_background': active,
        'editor.document_highlight.write_background': active,
        'editor.document_highlight.bracket_background': selection,
        'editor.indent_guide': active,
        'editor.indent_guide_active': muted,
        'terminal.background': chrome,
        'terminal.foreground': null,
        'terminal.ansi.background': chrome,
        'terminal.bright_foreground': null,
        'terminal.dim_foreground': null,
        'terminal.ansi.black': col('ansi.black'),
        'terminal.ansi.bright_black': col('ansi.brightBlack'),
        'terminal.ansi.dim_black': null,
        'terminal.ansi.red': col('ansi.red'),
        'terminal.ansi.bright_red': col('ansi.brightRed'),
        'terminal.ansi.dim_red': null,
        'terminal.ansi.green': col('ansi.green'),
        'terminal.ansi.bright_green': col('ansi.brightGreen'),
        'terminal.ansi.dim_green': null,
        'terminal.ansi.yellow': col('ansi.yellow'),
        'terminal.ansi.bright_yellow': col('ansi.brightYellow'),
        'terminal.ansi.dim_yellow': null,
        'terminal.ansi.blue': col('ansi.blue'),
        'terminal.ansi.bright_blue': col('ansi.brightBlue'),
        'terminal.ansi.dim_blue': null,
        'terminal.ansi.magenta': col('ansi.magenta'),
        'terminal.ansi.bright_magenta': col('ansi.brightMagenta'),
        'terminal.ansi.dim_magenta': null,
        'terminal.ansi.cyan': col('ansi.cyan'),
        'terminal.ansi.bright_cyan': col('ansi.brightCyan'),
        'terminal.ansi.dim_cyan': null,
        'terminal.ansi.white': col('ansi.white'),
        'terminal.ansi.bright_white': col('ansi.brightWhite'),
        'terminal.ansi.dim_white': null,
        'link_text.hover': accent,
        ...statusEntries('conflict', 'syntax.constant'),
        ...statusEntries('created', 'syntax.function'),
        ...statusEntries('deleted', 'syntax.error'),
        ...statusEntries('error', 'syntax.error'),
        ...statusEntries('hidden', 'fg.muted'),
        ...statusEntries('hint', 'fg.comment'),
        ...statusEntries('ignored', 'fg.comment'),
        ...statusEntries('info', 'syntax.info'),
        ...statusEntries('modified', 'syntax.type'),
        ...statusEntries('predictive', 'fg.comment'),
        ...statusEntries('renamed', 'syntax.function'),
        ...statusEntries('success', 'syntax.function'),
        ...statusEntries('unreachable', 'syntax.error'),
        ...statusEntries('warning', 'syntax.type'),
        'version_control.added': col('syntax.function'),
        'version_control.added_background': bg,
        'version_control.conflict': col('syntax.constant'),
        'version_control.conflict_background': bg,
        'version_control.deleted': col('syntax.error'),
        'version_control.deleted_background': bg,
        'version_control.ignored': col('fg.comment'),
        'version_control.modified': col('syntax.type'),
        'version_control.modified_background': bg,
        'version_control.renamed': col('syntax.info'),
        players: [
            {
                cursor: accent,
                background: accent,
                selection: col('syntax.info', '3d'),
            },
        ],
        syntax,
    };

    const theme = {
        $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
        name: 'Rust in Peace',
        author: 'Adam Chapman — generated from src/palette.json',
        themes: [
            {
                name: 'Rust in Peace',
                appearance: 'dark',
                style,
            },
        ],
    };

    return JSON.stringify(theme, null, 2) + '\n';
};

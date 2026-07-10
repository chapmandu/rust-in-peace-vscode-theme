import { Palette, resolvePalettePath, hexToRgb } from '../palette';

/**
 * A Zellij colour value: a palette path (`syntax.info`), a literal `#rrggbb`
 * for a target-specific shade, or `0` — Zellij's sentinel for "unset / inherit
 * the terminal default".
 */
type Ref = string | 0;

/** The six-slot style block Zellij expects for every UI component. */
type Style = {
    base: Ref;
    background: Ref;
    emphasis_0: Ref;
    emphasis_1: Ref;
    emphasis_2: Ref;
    emphasis_3: Ref;
};

/**
 * The common text style: primary foreground on a raised surface, with the four
 * emphasis accents in type / info / function / constant order. Shared by every
 * plain text, table-cell and list component.
 */
const TEXT: Style = {
    base: 'fg.base',
    background: 'bg.surface',
    emphasis_0: 'syntax.type',
    emphasis_1: 'syntax.info',
    emphasis_2: 'syntax.function',
    emphasis_3: 'syntax.constant',
};

/**
 * UI-component styles, in file order. The active accent is the cover's electric
 * tube blue (`syntax.info`) so selected tabs and pane frames stay calm rather
 * than going green.
 */
const COMPONENTS: Record<string, Style> = {
    text_unselected: TEXT,
    text_selected: TEXT,
    ribbon_selected: {
        base: 'bg.base',
        background: 'syntax.info',
        emphasis_0: 'syntax.error',
        emphasis_1: 'syntax.type',
        emphasis_2: 'syntax.constant',
        emphasis_3: 'fg.comment',
    },
    ribbon_unselected: {
        base: 'bg.base',
        background: 'syntax.constant',
        emphasis_0: 'syntax.error',
        emphasis_1: 'bg.base',
        emphasis_2: 'fg.comment',
        emphasis_3: 'syntax.info',
    },
    table_title: {
        base: 'syntax.info',
        background: 0,
        emphasis_0: 'syntax.type',
        emphasis_1: 'syntax.info',
        emphasis_2: 'syntax.function',
        emphasis_3: 'syntax.constant',
    },
    table_cell_selected: TEXT,
    table_cell_unselected: TEXT,
    list_selected: TEXT,
    list_unselected: TEXT,
    frame_selected: {
        base: 'syntax.info',
        background: 0,
        emphasis_0: 'syntax.type',
        emphasis_1: 'syntax.info',
        emphasis_2: 'syntax.constant',
        emphasis_3: 0,
    },
    frame_unselected: {
        base: '#57628c', // muted inactive-frame blue — Zellij-specific chrome
        background: 0,
        emphasis_0: 'syntax.type',
        emphasis_1: 'syntax.info',
        emphasis_2: 'syntax.constant',
        emphasis_3: 'syntax.constant',
    },
    frame_highlight: {
        base: 'syntax.type',
        background: 0,
        emphasis_0: 'syntax.constant',
        emphasis_1: 'syntax.type',
        emphasis_2: 'syntax.type',
        emphasis_3: 'syntax.type',
    },
    exit_code_success: {
        base: 'syntax.function',
        background: 0,
        emphasis_0: 'syntax.info',
        emphasis_1: 'bg.surface',
        emphasis_2: 'syntax.constant',
        emphasis_3: 'fg.comment',
    },
    exit_code_error: {
        base: 'syntax.error',
        background: 0,
        emphasis_0: 'syntax.string',
        emphasis_1: 0,
        emphasis_2: 0,
        emphasis_3: 0,
    },
};

/** The ten multiplayer cursor colours, in slot order (`0` = no colour). */
const MULTIPLAYER: Ref[] = [
    'syntax.constant', // player_1
    'syntax.info', // player_2
    0, // player_3
    'syntax.string', // player_4
    'syntax.function', // player_5
    0, // player_6
    'syntax.error', // player_7
    0, // player_8
    0, // player_9
    0, // player_10
];

/** Render a Ref to a Zellij colour token: `r g b`, or `0` for the sentinel. */
const render = (palette: Palette, ref: Ref): string => {
    if (ref === 0) {
        return '0';
    }
    const hex = ref.startsWith('#') ? ref : resolvePalettePath(palette, ref);
    return hexToRgb(hex).join(' ');
};

const HEADER = `// rust-in-peace — generated from src/palette.json. Do not edit by hand.
// Megadeth "Rust in Peace" cover palette. The active accent is the cover's
// electric tube blue rather than green, so pane frames and the selected tab
// stay calm.`;

/** Generate the Zellij KDL theme from the palette. */
export default (palette: Palette): string => {
    const indent = (depth: number): string => '    '.repeat(depth);

    const componentLines = Object.entries(COMPONENTS).flatMap(([name, style]) => [
        `${indent(2)}${name} {`,
        ...Object.entries(style).map(
            ([slot, ref]) => `${indent(3)}${slot} ${render(palette, ref)}`
        ),
        `${indent(2)}}`,
    ]);

    const multiplayerLines = [
        `${indent(2)}multiplayer_user_colors {`,
        ...MULTIPLAYER.map(
            (ref, i) => `${indent(3)}player_${i + 1} ${render(palette, ref)}`
        ),
        `${indent(2)}}`,
    ];

    return [
        HEADER,
        'themes {',
        `${indent(1)}rust-in-peace {`,
        ...componentLines,
        ...multiplayerLines,
        `${indent(1)}}`,
        '}',
        '',
    ].join('\n');
};

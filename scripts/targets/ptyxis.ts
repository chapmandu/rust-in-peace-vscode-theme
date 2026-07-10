import { Palette, resolvePalettePath } from '../palette';

/** The 16 ANSI slots, in Color0..Color15 order. */
const ANSI_SLOTS = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'brightBlack',
    'brightRed',
    'brightGreen',
    'brightYellow',
    'brightBlue',
    'brightMagenta',
    'brightCyan',
    'brightWhite',
] as const;

/** Build the shared `[Light]`/`[Dark]` colour block (Ptyxis wants both). */
const scheme = (palette: Palette): string[] => [
    `Background=${resolvePalettePath(palette, 'bg.base')}`,
    `Foreground=${resolvePalettePath(palette, 'fg.base')}`,
    `Cursor=${resolvePalettePath(palette, 'fg.base')}`,
    ...ANSI_SLOTS.map(
        (slot, i) => `Color${i}=${resolvePalettePath(palette, `ansi.${slot}`)}`
    ),
];

/** Generate the Ptyxis `.palette` file from the palette. */
export default (palette: Palette): string => {
    const block = scheme(palette);
    return [
        '[Palette]',
        'Name=Rust in Peace',
        '',
        '[Light]',
        ...block,
        '',
        '[Dark]',
        ...block,
        '',
    ].join('\n');
};

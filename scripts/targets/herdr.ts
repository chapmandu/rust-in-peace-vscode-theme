import { Palette, resolvePalettePath } from '../palette';

/** A herdr override token mapped to a palette path, with an optional note. */
interface Token {
    name: string;
    ref: string;
    comment?: string;
}

/**
 * herdr's `[theme.custom]` tokens (a Catppuccin-flavoured vocabulary) mapped
 * onto the palette. The primary accent is the cover's electric tube blue, to
 * match the Zellij tuning. Order follows herdr's own struct.
 */
const TOKENS: Token[] = [
    { name: 'accent', ref: 'syntax.info', comment: 'primary accent — electric tube blue' },
    { name: 'panel_bg', ref: 'bg.base', comment: 'main panel background' },
    { name: 'surface0', ref: 'bg.surface', comment: 'raised surface — selected rows, tabs' },
    { name: 'surface1', ref: 'bg.overlay', comment: 'higher surface' },
    { name: 'surface_dim', ref: 'bg.selection', comment: 'base surface — dividers, seams, tracks; sits just above panel_bg so they stay visible' },
    { name: 'overlay0', ref: 'fg.comment', comment: 'muted UI lines, borders' },
    { name: 'overlay1', ref: 'fg.muted', comment: 'brighter UI lines' },
    { name: 'text', ref: 'fg.base', comment: 'primary text' },
    { name: 'subtext0', ref: 'fg.muted', comment: 'secondary text' },
    { name: 'mauve', ref: 'syntax.constant', comment: 'softened violet — constants' },
    { name: 'green', ref: 'syntax.function', comment: 'glowing hand green' },
    { name: 'yellow', ref: 'syntax.string', comment: 'logo gold' },
    { name: 'red', ref: 'syntax.error', comment: 'rust / logo-edge red' },
    { name: 'blue', ref: 'syntax.info', comment: 'bright tube blue' },
    { name: 'teal', ref: 'syntax.builtin', comment: 'sky cyan' },
    { name: 'peach', ref: 'syntax.type', comment: 'logo orange' },
];

const HEADER = `# rust-in-peace for herdr — generated from src/palette.json. Do not edit by hand.
# Merge this into your herdr config: https://herdr.dev/docs/configuration/#theme
# Recolours the catppuccin base theme to the album palette. Any token not
# overridden here falls through to catppuccin.
# Tip: set panel_bg = "reset" to let panels follow your terminal background.`;

/** Generate the herdr theme config fragment from the palette. */
export default (palette: Palette): string => {
    const width = Math.max(...TOKENS.map(token => token.name.length));

    const lines = TOKENS.map(({ name, ref, comment }) => {
        const hex = resolvePalettePath(palette, ref);
        const line = `${name.padEnd(width)} = "${hex}"`;
        return comment ? `${line} # ${comment}` : line;
    });

    return [HEADER, '', '[theme]', 'name = "catppuccin"', '', '[theme.custom]', ...lines, ''].join('\n');
};

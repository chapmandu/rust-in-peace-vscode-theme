import { readFile } from 'fs/promises';
import { join } from 'path';

/** Nested palette of semantic colour groups — the single source of truth. */
export type Palette = { [key: string]: string | Palette };

/** Load and parse a palette from src/ (the dark palette by default). */
export const loadPalette = async (file = 'palette.json'): Promise<Palette> => {
    const json = await readFile(join(__dirname, '..', 'src', file), 'utf-8');
    return JSON.parse(json) as Palette;
};

/** Flatten a palette to its dotted colour paths, e.g. `syntax.keyword`. */
export const palettePaths = (palette: Palette, prefix = ''): string[] =>
    Object.entries(palette).flatMap(([key, value]) =>
        typeof value === 'string'
            ? [`${prefix}${key}`]
            : palettePaths(value, `${prefix}${key}.`)
    );

/** Resolve a dotted path such as `syntax.keyword` to a colour in the palette. */
export const resolvePalettePath = (palette: Palette, path: string): string => {
    const value = path.split('.').reduce<string | Palette | undefined>(
        (node, key) => (typeof node === 'object' ? node[key] : undefined),
        palette
    );
    if (typeof value !== 'string') {
        throw new Error(`palette.json has no colour at path "${path}"`);
    }
    return value;
};

/** Convert a `#rrggbb` hex colour to an `[r, g, b]` triple of 0–255 integers. */
export const hexToRgb = (hex: string): [number, number, number] => {
    const match = /^#?([0-9a-fA-F]{6})$/.exec(hex);
    if (!match) {
        throw new Error(`Not a 6-digit hex colour: "${hex}"`);
    }
    const value = parseInt(match[1], 16);
    return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
};

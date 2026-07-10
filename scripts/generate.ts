import { readFile } from 'fs/promises';
import { join } from 'path';
import { defineSequenceTag, CORE_SCHEMA, load } from 'js-yaml';
import tinycolor from 'tinycolor2';

/** Textmate token settings. `fontStyle` is a space-separated list of `italic`, `bold`, `underline`. */
interface TokenSettings {
    foreground?: string;
    background?: string;
    fontStyle?: string;
}

/** Textmate token color. */
interface TokenColor {
    /** Optional name. */
    name?: string;
    /** Array of scopes. */
    scope: string[];
    /** Textmate token settings. */
    settings: TokenSettings;
}

/** Parsed theme object. */
interface Theme {
    /** Rust in Peace color variables. */
    rustInPeace: Record<'base' | 'ansi' | 'brightOther' | 'other', string[]>;
    /** VSCode color mapping. */
    colors: Record<string, string | null | undefined>;
    /** Textmate token colors. */
    tokenColors: TokenColor[];
}

type ThemeTransform = (yamlObj: Theme) => Theme;

/**
 * Custom `!alpha [hexRGB, alpha]` tag: concatenates a hex color and an alpha suffix.
 * js-yaml v5 builds collection tags incrementally (`create` + `addItem`) and aggregates in
 * `finalize`; `addItem` mutates the carrier in place and returns nothing.
 */
const withAlphaType = defineSequenceTag('!alpha', {
    create: (): Array<string | number> => [],
    addItem: (arr: Array<string | number>, item: unknown) => {
        arr.push(item as string | number);
    },
    finalize: ([hexRGB, alpha]: Array<string | number>) => `${hexRGB}${alpha}`,
});

const schema = CORE_SCHEMA.withTags(withAlphaType);

/** Nested palette of semantic colour groups (the single source of truth). */
type Palette = { [key: string]: string | Palette };

/** Resolve a dotted path such as `editor.background` to a colour in the palette. */
const resolvePalettePath = (palette: Palette, path: string): string => {
    const value = path.split('.').reduce<string | Palette | undefined>(
        (node, key) => (typeof node === 'object' ? node[key] : undefined),
        palette
    );
    if (typeof value !== 'string') {
        throw new Error(`palette.json has no colour at path "${path}"`);
    }
    return value;
};

/**
 * Substitute `{{group.key}}` placeholders in the YAML source with palette
 * colours. Any trailing characters (e.g. a 2-hex alpha suffix) are preserved.
 */
const applyPalette = (yaml: string, palette: Palette): string =>
    yaml.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) =>
        resolvePalettePath(palette, path)
    );

/** Soft variant transform. */
const transformSoft: ThemeTransform = theme => {
    const soft: Theme = JSON.parse(JSON.stringify(theme));
    const brightColors = [...soft.rustInPeace.ansi, ...soft.rustInPeace.brightOther];
    for (const key of Object.keys(soft.colors)) {
        const color = soft.colors[key];
        if (color && brightColors.includes(color)) {
            soft.colors[key] = tinycolor(color).desaturate(20).toHexString();
        }
    }
    soft.tokenColors = soft.tokenColors.map(value => {
        const foreground = value.settings.foreground;
        if (foreground && brightColors.includes(foreground)) {
            value.settings.foreground = tinycolor(foreground).desaturate(20).toHexString();
        }
        return value;
    });
    return soft;
};

export default async (): Promise<{ base: Theme; soft: Theme }> => {
    const [yamlFile, paletteFile] = await Promise.all([
        readFile(join(__dirname, '..', 'src', 'rust-in-peace.yml'), 'utf-8'),
        readFile(join(__dirname, '..', 'src', 'palette.json'), 'utf-8'),
    ]);

    const palette = JSON.parse(paletteFile) as Palette;
    const base = load(applyPalette(yamlFile, palette), { schema }) as Theme;

    // Remove nulls and other falsey values from colors
    for (const key of Object.keys(base.colors)) {
        if (!base.colors[key]) {
            delete base.colors[key];
        }
    }

    return {
        base,
        soft: transformSoft(base),
    };
};

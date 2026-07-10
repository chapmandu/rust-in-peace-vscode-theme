import { readFile } from 'fs/promises';
import { join } from 'path';
import { defineSequenceTag, CORE_SCHEMA, load } from 'js-yaml';
import tinycolor from 'tinycolor2';
import { Palette, loadPalette, resolvePalettePath } from './palette';
import { VARIANTS, VariantSpec, transformPalette } from './variants';

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
    /** Theme display name. */
    name: string;
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

/** Substitute a palette into the YAML source and parse it into a theme. */
const buildTheme = (yamlFile: string, palette: Palette): Theme => {
    const theme = load(applyPalette(yamlFile, palette), { schema }) as Theme;

    // Remove nulls and other falsey values from colors
    for (const key of Object.keys(theme.colors)) {
        if (!theme.colors[key]) {
            delete theme.colors[key];
        }
    }

    return theme;
};

export default async (): Promise<{
    base: Theme;
    variants: Array<{ spec: VariantSpec; theme: Theme }>;
    soft: Theme;
}> => {
    const [yamlFile, palette] = await Promise.all([
        readFile(join(__dirname, '..', 'src', 'rust-in-peace.yml'), 'utf-8'),
        loadPalette(),
    ]);

    const base = buildTheme(yamlFile, palette);

    const variants = VARIANTS.map(spec => {
        const theme = buildTheme(yamlFile, transformPalette(palette, spec));
        theme.name = spec.label;
        return { spec, theme };
    });

    return {
        base,
        variants,
        soft: transformSoft(base),
    };
};

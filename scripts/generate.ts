import { readFile } from 'fs/promises';
import { join } from 'path';
import { defineSequenceTag, CORE_SCHEMA, load } from 'js-yaml';
import tinycolor from 'tinycolor2';
import { Palette, loadPalette, palettePaths, resolvePalettePath } from './palette';
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

/** Fail loudly if the dark and light palettes have drifted structurally. */
const assertPaletteParity = (dark: Palette, light: Palette): void => {
    const darkPaths = new Set(palettePaths(dark));
    const lightPaths = new Set(palettePaths(light));
    const missingFromLight = [...darkPaths].filter(path => !lightPaths.has(path));
    const missingFromDark = [...lightPaths].filter(path => !darkPaths.has(path));
    if (missingFromLight.length > 0 || missingFromDark.length > 0) {
        const problems = [
            ...missingFromLight.map(path => `palette-light.json is missing "${path}"`),
            ...missingFromDark.map(path => `palette.json is missing "${path}"`),
        ];
        throw new Error(`palette parity check failed:\n  ${problems.join('\n  ')}`);
    }
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
    light: Theme;
    soft: Theme;
}> => {
    const [yamlFile, palette, lightPalette] = await Promise.all([
        readFile(join(__dirname, '..', 'src', 'rust-in-peace.yml'), 'utf-8'),
        loadPalette(),
        loadPalette('palette-light.json'),
    ]);

    assertPaletteParity(palette, lightPalette);

    const base = buildTheme(yamlFile, palette);

    const variants = VARIANTS.map(spec => {
        const theme = buildTheme(yamlFile, transformPalette(palette, spec));
        theme.name = spec.label;
        return { spec, theme };
    });

    // The light theme resolves the same YAML mapping against the hand-designed
    // light palette rather than a formulaic transform of the dark one.
    const light = buildTheme(yamlFile, lightPalette);
    light.name = 'Rust in Peace Dawn Patrol';

    return {
        base,
        variants,
        light,
        soft: transformSoft(base),
    };
};

import tinycolor from 'tinycolor2';
import { Palette } from './palette';

/**
 * A lighter variant of the base palette, produced by a formula modelled on the
 * lightness/saturation deltas between Catppuccin's Mocha and its Macchiato and
 * Frappe variants:
 *
 * - Neutrals get a lightness lift that tapers to zero as base lightness rises,
 *   so dark surfaces rise the most and text barely moves.
 * - Accents are desaturated (proportionally) and the brightest ones darkened
 *   slightly, so they don't glare against the lighter ground.
 */
export interface VariantSpec {
    /** Theme display name, e.g. "Rust in Peace Hangar 18". */
    label: string;
    /** Filename slug, e.g. "rust-in-peace-hangar-18". */
    slug: string;
    /** Neutral lift at L=0, in HSL lightness points (0–100 scale). */
    liftA: number;
    /** Per-lightness-point taper of the neutral lift. */
    liftB: number;
    /** Proportional saturation cut for accents (0–1). */
    desat: number;
    /** Maximum lightness reduction for the brightest accents. */
    darken: number;
}

export const VARIANTS: VariantSpec[] = [
    {
        label: 'Rust in Peace Hangar 18',
        slug: 'rust-in-peace-hangar-18',
        liftA: 3.9,
        liftB: 0.045,
        desat: 0.12,
        darken: 2,
    },
    {
        label: 'Rust in Peace Polaris',
        slug: 'rust-in-peace-polaris',
        liftA: 9.4,
        liftB: 0.117,
        desat: 0.24,
        darken: 4,
    },
];

/** ANSI keys that belong to the neutral ladder rather than the accent set. */
const NEUTRAL_ANSI_KEYS = new Set(['black', 'brightBlack', 'white', 'brightWhite']);

type ColorTransform = (hex: string) => string;

const withHsl = (hex: string, mutate: (hsl: tinycolor.ColorFormats.HSLA) => void): string => {
    const hsl = tinycolor(hex).toHsl();
    mutate(hsl);
    hsl.s = Math.min(1, Math.max(0, hsl.s));
    hsl.l = Math.min(1, Math.max(0, hsl.l));
    return tinycolor(hsl).toHexString();
};

/** Tapered lightness lift: strongest on dark surfaces, ~zero by the text end. */
const lift = (spec: VariantSpec): ColorTransform => hex =>
    withHsl(hex, hsl => {
        hsl.l += Math.max(0, spec.liftA - spec.liftB * hsl.l * 100) / 100;
    });

/** WCAG contrast target for accents on the editor background. */
const ACCENT_MIN_CONTRAST = 4.5;

/**
 * Accent muting: proportional desaturation, slight darkening of bright
 * colours. Guarded so an accent never ends up with less contrast against the
 * variant's background than it had originally (capped at the WCAG 4.5:1
 * target) — darker accents are lightened back up instead.
 */
const mute = (spec: VariantSpec, origBg: string, newBg: string): ColorTransform => hex => {
    const muted = withHsl(hex, hsl => {
        hsl.s -= spec.desat * hsl.s;
        hsl.l -= (spec.darken * Math.max(0, (hsl.l * 100 - 50) / 38)) / 100;
    });

    const floor = Math.min(tinycolor.readability(hex, origBg), ACCENT_MIN_CONTRAST);
    let result = muted;
    while (tinycolor.readability(result, newBg) < floor) {
        result = withHsl(result, hsl => {
            hsl.l += 0.01;
        });
    }
    return result;
};

/** Chrome rises in step with the surfaces without getting louder. */
const liftAndDesat = (spec: VariantSpec): ColorTransform => hex =>
    withHsl(hex, hsl => {
        hsl.l += Math.max(0, spec.liftA - spec.liftB * hsl.l * 100) / 100;
        hsl.s -= spec.desat * hsl.s;
    });

const mapGroup = (group: Palette[string], transform: ColorTransform): Palette[string] => {
    if (typeof group === 'string') {
        return transform(group);
    }
    return Object.fromEntries(
        Object.entries(group).map(([key, value]) => [key, mapGroup(value, transform)])
    );
};

/** Resolve a colour from a palette group object, for the contrast guard. */
const bgBase = (palette: Palette): string => {
    const bg = palette['bg'];
    const base = typeof bg === 'object' ? bg['base'] : undefined;
    if (typeof base !== 'string') {
        throw new Error('palette has no colour at "bg.base"');
    }
    return base;
};

/** Apply a variant's lightening formula to the whole palette. */
export const transformPalette = (palette: Palette, spec: VariantSpec): Palette => {
    const neutral = lift(spec);
    const origBg = bgBase(palette);
    const accent = mute(spec, origBg, neutral(origBg));
    const chrome = liftAndDesat(spec);

    const result: Palette = {};
    for (const [groupName, group] of Object.entries(palette)) {
        if (groupName === 'bg' || groupName === 'fg') {
            result[groupName] = mapGroup(group, neutral);
        } else if (groupName === 'ui') {
            result[groupName] = mapGroup(group, chrome);
        } else if (groupName === 'ansi' && typeof group === 'object') {
            result[groupName] = Object.fromEntries(
                Object.entries(group).map(([key, value]) => [
                    key,
                    mapGroup(value, NEUTRAL_ANSI_KEYS.has(key) ? neutral : accent),
                ])
            );
        } else {
            result[groupName] = mapGroup(group, accent);
        }
    }
    return result;
};

import { get as httpsGet } from 'https';
import { type IncomingMessage } from 'http';
import generate from './generate';

const THEME_COLOR_REFERENCE_URL =
    'https://code.visualstudio.com/api/references/theme-color';

const NOT_THEME_KEYS = [
    'workbench.colorCustomizations',
    'editor.tokenColorCustomizations',
];

const get = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
        httpsGet(url, (res: IncomingMessage) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (data: string) => (body += data));
            res.on('end', () => resolve(body));
            res.on('error', reject);
        });
    });

const scrapeThemeAvailableKeys = async (): Promise<string[]> => {
    const data = await get(THEME_COLOR_REFERENCE_URL);

    const matches = data.match(/<code>.+?<\/code>/g);

    if (!matches) {
        throw new Error(
            "Couldn't find any matches with <code>...</code>, maybe docs have changed?"
        );
    }

    return matches
        .map(key => key.replace('<code>', '').replace('</code>', ''))
        .filter(key => !/ /.test(key)) // Remove if contains spaces
        .filter(key => !/#.../.test(key)) // Remove if is a hex color
        .filter(key => !/&quot;/.test(key)) // Remove if contains quotes
        .filter(key => key.length > 4) // Remove if it's very small
        .filter(key => !NOT_THEME_KEYS.includes(key)) // Remove if its in the blacklist
        .sort();
};

const LEVEL_COLORS = {
    INFO: '\x1b[36m', // cyan
    WARN: '\x1b[33m', // yellow
    ERROR: '\x1b[31m', // red
} as const;
const RESET = '\x1b[0m';

const log = (level: keyof typeof LEVEL_COLORS, message: string): void => {
    const line = `${LEVEL_COLORS[level]}${level}${RESET}: ${message}`;
    if (level === 'ERROR') {
        console.error(line);
    } else if (level === 'WARN') {
        console.warn(line);
    } else {
        console.info(line);
    }
};

/** Return every key present in `keys` but absent from `reference`. */
const keysNotIn = (keys: Iterable<string>, reference: Set<string>): string[] => {
    const absent: string[] = [];
    for (const key of keys) {
        if (!reference.has(key)) {
            absent.push(key);
        }
    }
    return absent;
};

const lint = async (): Promise<void> => {
    const supportedKeys = new Set(await scrapeThemeAvailableKeys());
    const { base } = await generate();
    const themeKeys = new Set(Object.keys(base.colors));

    // Keys the theme leaves to VS Code's defaults — informational only.
    for (const key of keysNotIn(supportedKeys, themeKeys)) {
        log('INFO', `"${key}" not set; using VS Code's default`);
    }

    // Keys the theme sets that the reference no longer lists — a hard failure.
    const unsupportedKeys = keysNotIn(themeKeys, supportedKeys);
    for (const key of unsupportedKeys) {
        log('WARN', `"${key}" is unsupported, probably deprecated`);
    }

    if (unsupportedKeys.length > 0) {
        log('ERROR', `${unsupportedKeys.length} unsupported theme key(s); see warnings above`);
        process.exitCode = 1;
    }
};

lint().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});

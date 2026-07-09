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

const lint = async (): Promise<void> => {
    const availableKeys = await scrapeThemeAvailableKeys();
    const { base } = await generate();

    for (const key of Object.keys(base.colors)) {
        if (!availableKeys.includes(key)) {
            console.warn(`Unsupported key "${key}", probably deprecated?`);
        }
    }

    for (const key of availableKeys) {
        if (!Object.keys(base.colors).includes(key)) {
            console.warn(`Missing key "${key}" in theme`);
        }
    }
};

lint().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});

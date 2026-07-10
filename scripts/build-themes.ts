import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { loadPalette } from './palette';
import zellij from './targets/zellij';

/** A downstream theme target derived from the shared palette. */
interface Target {
    /** Display name for logging. */
    name: string;
    /** Output path relative to the repo's themes/ directory. */
    file: string;
    /** Render the theme file contents from the palette. */
    generate: (palette: Awaited<ReturnType<typeof loadPalette>>) => string;
}

const THEMES_DIR = join(__dirname, '..', 'themes');

const targets: Target[] = [
    { name: 'Zellij', file: 'zellij/rust-in-peace.kdl', generate: zellij },
];

const buildThemes = async (): Promise<void> => {
    const palette = await loadPalette();

    await Promise.all(
        targets.map(async ({ name, file, generate }) => {
            const outPath = join(THEMES_DIR, file);
            await mkdir(dirname(outPath), { recursive: true });
            await writeFile(outPath, generate(palette));
            console.log(`${name} -> themes/${file}`);
        })
    );
};

buildThemes().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});

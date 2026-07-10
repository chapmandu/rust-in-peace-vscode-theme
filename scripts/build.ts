import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import generate from './generate';

const THEME_DIR = join(__dirname, '..', 'theme');

const build = async (): Promise<void> => {
    await mkdir(THEME_DIR, { recursive: true });

    const { base, variants } = await generate();

    await Promise.all([
        writeFile(
            join(THEME_DIR, 'rust-in-peace.json'),
            JSON.stringify(base, null, 4)
        ),
        ...variants.map(({ spec, theme }) =>
            writeFile(
                join(THEME_DIR, `${spec.slug}.json`),
                JSON.stringify(theme, null, 4)
            )
        ),
        // writeFile(
        //     join(THEME_DIR, 'rust-in-peace-soft.json'),
        //     JSON.stringify(soft, null, 4)
        // ),
    ]);
};

build().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});

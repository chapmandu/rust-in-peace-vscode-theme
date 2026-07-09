import * as fs from 'fs';
import * as path from 'path';
import generate from './generate';

const THEME_DIR = path.join(__dirname, '..', 'theme');

const build = async (): Promise<void> => {
    if (!fs.existsSync(THEME_DIR)) {
        fs.mkdirSync(THEME_DIR);
    }

    const { base } = await generate();

    await Promise.all([
        fs.promises.writeFile(
            path.join(THEME_DIR, 'rust-in-peace.json'),
            JSON.stringify(base, null, 4)
        ),
        // fs.promises.writeFile(
        //     path.join(THEME_DIR, 'rust-in-peace-soft.json'),
        //     JSON.stringify(soft, null, 4)
        // ),
    ]);
};

build().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

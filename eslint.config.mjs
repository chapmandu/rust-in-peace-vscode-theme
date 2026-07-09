import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['node_modules', 'theme', 'bin'] },
    {
        files: ['scripts/**/*.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
    }
);

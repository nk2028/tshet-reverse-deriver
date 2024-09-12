import pluginJs from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['data/tupa.js'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  pluginJs.configs.recommended,
  {
    files: ['test.mjs', 'repl.js'],
    languageOptions: { globals: { ...globals.node } },
  },
];

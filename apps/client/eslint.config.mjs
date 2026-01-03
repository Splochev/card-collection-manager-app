import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Disable enforce-module-boundaries for this app to avoid false positives on external imports
      '@nx/enforce-module-boundaries': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: [
      'dist',
      'node_modules',
      '*.spec.ts',
      'eslint.config.mjs',
      'jest.config.js',
      'tests/**',
      '.github',
      '*.js',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // 'no-console': 'error',
      // 'dot-notation': 'error',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
)

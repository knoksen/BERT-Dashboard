module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  env: { browser: true, es2022: true, node: true, jest: true },
  plugins: ['@typescript-eslint','react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn',{ argsIgnorePattern:'^_', varsIgnorePattern:'^_' }],
    'react-refresh/only-export-components': ['warn',{ allowConstantExport: true }]
  }
};

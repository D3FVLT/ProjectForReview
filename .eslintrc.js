module.exports = {
  env: {
    node: true,
  },
  extends: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  // ignorePatterns: ['.eslintrc.js'],
  plugins: ['import', 'simple-import-sort', 'unused-imports'],
  rules: {
    'simple-import-sort/imports': 1,
    'simple-import-sort/exports': 1,
    'import/first': 1,
    'import/newline-after-import': 1,
    'import/no-duplicates': 1,
    'unused-imports/no-unused-imports': 1,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
      },
      extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
      plugins: ['@typescript-eslint', 'import', 'simple-import-sort'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/no-mixed-operators': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/ban-ts-comment': [
          1,
          {
            'ts-ignore': 'allow-with-description',
          },
        ],
        '@typescript-eslint/no-empty-interface': 0,
      },
    },
  ],
};

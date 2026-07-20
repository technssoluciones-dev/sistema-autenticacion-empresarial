module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    // --- Reglas de dependencia de Clean Architecture ---
    // Las flechas de dependencia solo pueden apuntar hacia adentro:
    // presentation -> application -> domain. Nunca al revés.
    // Implementado con la regla nativa `no-restricted-imports` (sin
    // plugins externos) para máxima estabilidad y cero sorpresas.
    {
      files: ['src/**/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/application/*', '**/application', '**/infrastructure/*', '**/infrastructure', '**/presentation/*', '**/presentation'],
                message:
                  'Violación de Clean Architecture: el dominio no puede depender de application/infrastructure/presentation. El dominio es el núcleo y no conoce nada de lo que hay afuera.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/**/application/**/*.ts'],
      excludedFiles: ['src/shared/application/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/infrastructure/*', '**/infrastructure', '**/presentation/*', '**/presentation'],
                message:
                  'Violación de Clean Architecture: application no puede importar infrastructure ni presentation directamente. Definí una interfaz (puerto) en domain y que infrastructure la implemente (Dependency Inversion).',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/**/infrastructure/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/presentation/*', '**/presentation'],
                message: 'Violación de Clean Architecture: infrastructure no puede depender de presentation.',
              },
            ],
          },
        ],
      },
    },
  ],
};

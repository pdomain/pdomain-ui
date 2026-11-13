import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default tseslint.config(
  // Global ignores
  { ignores: ['.venv/**', '.claire/worktrees/**', '.claude/worktrees/**', '.worktrees/**', 'dist/**', 'storybook-static/**', '.codegen/**', 'node_modules/**', 'tests/fixtures/lint-bad/**', 'src/types/generated/**'] },

  // Base TS parser config for ALL files (no type-checking yet)
  ...tseslint.configs.recommended,

  // Type-checked rules for src + tests (excluding fixtures which lack type info)
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'tests/**/*.ts', 'tests/**/*.tsx'],
    ignores: ['tests/fixtures/**'],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: { project: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
    },
  },

  // no-restricted-imports applies everywhere (no type info needed)
  {
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          { name: 'lucide-react', message: 'Import icons from @pdomain/pdomain-ui/icons only' },
          { name: 'class-variance-authority', message: 'CVA is forbidden in pdomain-ui' },
        ],
      }],
    },
  },

  // src/icons/lucide.ts is the ONLY file allowed to import from lucide-react
  {
    files: ['src/icons/lucide.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
)

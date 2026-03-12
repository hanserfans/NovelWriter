module.exports = {
  extends: ['@electron-toolkit/eslint-config-ts/recommended', 'eslint:recommended', 'plugin:react/recommended'],
  plugins: ['react'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
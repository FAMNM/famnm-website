module.exports = {
  extends: [
    'react-app',
    'airbnb',
    'plugin:import/typescript',
    'plugin:react/recommended',
  ],
  rules: {
    'no-else-return': 'off',
    'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.tsx'] }],
    'react/react-in-jsx-scope': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
};

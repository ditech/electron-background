module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  rules: {
    'no-console': 0,
    'no-plusplus': 0,
    'max-len': 0
  },
};

/* eslint-env node */
module.exports = {
  plugins: [require('prettier-plugin-tailwindcss')],
  tailwindConfig: './tailwind.config.js',
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'all',
};

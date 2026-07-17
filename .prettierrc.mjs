/** Prettier — keeps human and AI edits stylistically consistent.
 *  prettier-plugin-tailwindcss also sorts utility classes canonically. */
export default {
  printWidth: 120,
  semi: true,
  singleQuote: true,
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/assets/styles/tailwind.css',
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
};

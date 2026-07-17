import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './src/utils/frontmatter';
import { SITE } from './src/site.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Production origin — single source of truth is SITE.site in
  // src/site.config.ts (used for canonicals, OG, sitemap and robots.txt).
  site: SITE.site,
  output: 'static',

  integrations: [sitemap(), mdx(), alpinejs()],

  image: {
    // Local images only — Astro's built-in Sharp service handles them.
    // No remote `domains` needed since we're not pulling from image CDNs.
  },

  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    // Pre-bundle deps the client loads at runtime. Without this, Vite's dep
    // optimizer discovers them mid-session ("optimized dependencies changed.
    // reloading"), which can trigger a known Astro dev-server bug:
    // "Failed to load url astro:server-app.js" (withastro/astro#15952).
    // Dev-only issue; production builds are unaffected.
    optimizeDeps: {
      include: [
        'alpinejs',
        'astro/virtual-modules/transitions-events.js',
        'astro/virtual-modules/transitions-router.js',
        'astro/virtual-modules/transitions-swap-functions.js',
        'astro/virtual-modules/transitions-types.js',
      ],
    },
  },
});

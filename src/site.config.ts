// ---------------------------------------------------------------------------
// SITE lives in its own env-free module so that `astro.config.ts` can import
// it too (single source of truth for the production origin). Do NOT add
// `import.meta.env` or `astro:*` imports here — this file is loaded while the
// Astro config is being bundled, before Vite env handling exists.
// ---------------------------------------------------------------------------

export interface SiteConfig {
  name: string;
  site: string; // full origin, e.g. https://example.com — used for canonical + OG + sitemap + robots.txt
  base: string;
  trailingSlash: boolean;
  googleSiteVerificationId?: string;
}

export const SITE: SiteConfig = {
  name: 'My Site',
  site: 'https://example.com', // <-- change me (the ONLY place the origin is defined)
  base: '/',
  trailingSlash: false,
  googleSiteVerificationId: '',
};

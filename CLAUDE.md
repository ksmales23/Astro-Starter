# CLAUDE.md — project guide for AI coding agents

This is a **static Astro 7 + Tailwind 4 starter** with a markdown blog, SEO, GTM
analytics (Consent Mode v2), and Alpine.js. The data/SEO plumbing is done; the
route markup is deliberately minimal placeholder UI. Read this before making
changes.

## Stack & hard constraints

- **Astro 7** (Vite 8 / Rolldown, Rust compiler). Node **>= 22.12** (`.nvmrc` = 22).
- **Tailwind CSS 4** via `@tailwindcss/vite` (config is CSS-first in
  `src/assets/styles/tailwind.css`, not a `tailwind.config.js` like it is in v3).
- **`output: 'static'`** — no SSR, no adapter. Do NOT add `@astrojs/cloudflare`
  or set `output: 'server'` unless the user explicitly wants on-demand rendering.
- **Deploy:** Cloudflare Pages via the GitHub connection. Build `npm run build`,
  output `dist`. Purely static — no `wrangler.toml`, no adapter.
- **Path alias:** `~` → `src` (in `astro.config.ts` and `tsconfig.json`).
- Config is plain TypeScript in `src/config.ts` — no YAML, no virtual config
  modules, no build-time config plugin. Import site config from `~/config`.
- **Production origin is defined ONCE**: `SITE.site` in `src/site.config.ts`.
  `astro.config.ts` imports it, `robots.txt` is generated from it
  (`src/pages/robots.txt.ts`). Never hardcode the domain anywhere else.
  `site.config.ts` must stay env-free (no `import.meta.env`, no `astro:*`
  imports) because `astro.config.ts` loads it before Vite env handling exists.

## Verify after any change

```bash
npm run build      # must pass
npm run check      # astro check — must be 0 errors (0 warnings ideally)
npm run fmt        # Prettier (+ astro & tailwind plugins) — run before finishing
```

Astro 7's Rust compiler is strict: **all non-void tags must be closed**, and
invalid HTML is no longer auto-corrected. Fix compiler errors about unclosed tags
by adding the closing tag.

## Layout: `src/config.ts`

Central config, all typed. Exports:

- `SITE` — re-exported from `src/site.config.ts` (the single source of the
  production origin): `name`, `site`, `base`, `trailingSlash`,
  `googleSiteVerificationId`.
- `I18N` — `language`, `textDirection`.
- `METADATA` — default title template, description, robots, OpenGraph, Twitter.
- `APP_BLOG` — blog toggles, `postsPerPage`, permalink pattern, per-route robots.
- `ANALYTICS` — `gtmId` (from `PUBLIC_GTM_ID`), `consentRequired`.

## Blog (markdown-driven)

- Posts: `src/data/post/*.md|.mdx`. Schema: `src/content.config.ts` (Zod).
  Add a post = drop a file in with valid frontmatter (see `hello-world.md`).
- Data layer: `src/utils/blog.ts` — `fetchPosts`, `getRelatedPosts`, and
  `getStaticPaths*` for list / post / category / tag (all paginated).
- URLs: `src/utils/permalinks.ts`. Default post permalink `/blog/%slug%`; list
  `/blog`, categories `/category/…`, tags `/tag/…`. Change patterns in `APP_BLOG`.
- Routes live in `src/pages/[...blog]/` (a configurable catch-all). The markup in
  those files is **minimal placeholder UI** inside `<!-- Replace … -->` blocks —
  intended to be replaced with real designs. The data wiring is done; keep it.
- RSS: `src/pages/rss.xml.ts`. Sitemap: `@astrojs/sitemap` (auto).

### Markdown pipeline (important)

Astro 7's default processor is Sätteri (Rust), which does NOT run remark/rehype
plugins. This project deliberately opts back into the **unified** pipeline via
`processor: unified(...)` from `@astrojs/markdown-remark` in `astro.config.ts`,
because two custom plugins depend on it (`src/utils/frontmatter.ts`):

- `readingTimeRemarkPlugin` → injects `post.readingTime`.
- `responsiveTablesRehypePlugin` → wraps tables for mobile scroll.
  If you remove the unified processor, these stop working. Leave it unless porting
  the plugins to Sätteri's plugin API.

## SEO

- `src/components/common/Metadata.astro` — wraps `astro-seo`; merges `METADATA`
  defaults with per-page props (title template, canonical, OG, Twitter).
- Pages pass `metadata` to `<Layout>`. Blog routes build it from the post.
- OG images: `src/utils/images.ts` (`findImage` resolves `~/assets/images/…`;
  `adaptOpenGraphImages` optimizes to an absolute URL via Sharp). Default social
  image is `METADATA.openGraph.images[0]` (`src/assets/images/default.png`).
- `CommonMeta.astro` — charset/viewport, sitemap link, optional site verification.
- Note: pages default to **indexable** (`METADATA.robots` in `src/config.ts`).
  Per-page/route robots still override (e.g. tag archives are noindex).

## Analytics — GTM + GA4 + Consent Mode v2

**Model:** GTM is the only thing loaded in code; configure the GA4 tag _inside_
the GTM dashboard (don't also hardcode a `gtag('config','G-…')` or you double-count).

Load order in `Layout.astro` `<head>` matters and must stay:

1. `ConsentInit.astro` — sets Consent Mode v2 defaults to **denied** before any
   tag; re-applies a stored choice from `localStorage['consent-mode']`.
2. `GoogleTagManager.astro` — GTM loader. Fires ONLY when
   `import.meta.env.PROD && ANALYTICS.gtmId` (so `npm run dev` never tracks).
3. `AnalyticsPageview.astro` — pushes an `astro_page_view` event on
   `astro:page-load`, so client-side (View Transitions) navigations are tracked.
   In GTM, trigger the GA4 pageview tag on this event (or enable GA4 Enhanced
   Measurement → history-based page changes).

In `<body>`: `GoogleTagManagerNoscript.astro` must be first. `ConsentBanner.astro`
(Alpine) is last — on Accept/Decline it calls `gtag('consent','update',…)` and
stores the choice. `consentBanner()` is attached to `window` so Alpine's global
`x-data` resolves it.

**To enable:** set `PUBLIC_GTM_ID` (see `.env.example`) locally and in Cloudflare
Pages env vars. Empty ID = analytics fully off. `ANALYTICS.consentRequired` gates
the banner (keep `true` for UK/EEA). Update the `/privacy` page with a real policy.

**Consent banner behaviour:** pop-up card (bottom-left), rendered when
`consentRequired && gtmId` — plus a **dev preview mode**: in `astro dev` the
banner also renders without a GTM ID (for styling before analytics exists) and
logs a console note. Production builds without a GTM ID never include it; keep
that gate. Equal-prominence "Accept all" / "Reject all"
buttons plus a granular "Manage options" layer with per-purpose toggles
(analytics / advertising) that start unchecked — all three are ICO
requirements; keep them. Choice is stored as a Consent Mode state object in
`localStorage['consent-mode']`, re-applied by `ConsentInit` on later visits,
and resettable from `/privacy`.

**Deliberate decision — do not "fix" without asking:** this is Consent Mode v2
in **advanced** mode (GTM loads pre-consent with all signals denied; Google
receives cookieless pings). The alternative ("basic": don't load GTM until
accept) is stricter but loses consent-based modelling. Changing modes is a
product/compliance decision, not a refactor. Consent can be withdrawn via the
"Reset cookie preferences" button on `/privacy` — keep that working.

## Alpine.js

- `@astrojs/alpinejs` integration in `astro.config.ts`. Use directives directly
  in `.astro` markup: `x-data`, `@click`, `x-show`, etc.
- `[x-cloak]{display:none}` is in `tailwind.css` — add `x-cloak` to elements that
  should stay hidden until Alpine initialises (prevents flash).
- There's a small demo toggle in `src/pages/index.astro`; delete it when building
  real components. Global Alpine components go on `window` (see ConsentBanner).
- **Alpine + `<ClientRouter />` interaction:** View Transitions keep the same
  document alive across navigations. Alpine's mutation observer initialises
  newly swapped-in `x-data` markup fine, but any component that attaches
  `document`/`window` listeners can double-register across soft navigations.
  Test interactive components after client-side navigation; if needed, hook
  cleanup into `astro:before-swap`.

## Workflow rules for agents

- For multi-file changes, present a plan before editing.
- Unfamiliar Astro 7 / Tailwind 4 / Alpine API? Query the **Context7 MCP**
  (configured in `.mcp.json`) before writing code — training data predates
  these versions. Astro docs index: https://docs.astro.build/llms.txt
- Never: edit `package-lock.json` by hand, bump major versions of anything,
  run `npm audit fix --force`, or read/commit `.env` (denied in
  `.claude/settings.json` anyway).
- The five analytics/consent components in `src/components/common/` are listed
  in `.prettierignore`: prettier-plugin-astro cannot parse `is:inline` scripts
  inside conditional expressions. They compile fine — do not restructure them
  just to make Prettier happy.
- Tailwind 4 is CSS-first. Never create a `tailwind.config.js`, never install
  `@astrojs/tailwind` or PostCSS config — theme tokens go in
  `src/assets/styles/tailwind.css` via `@theme`; plugins via `@plugin`.
- Known dev-server issue (upstream, withastro/astro#15952): a Vite
  "program reload" can fail with `Failed to load url astro:server-app.js`.
  `optimizeDeps.include` in `astro.config.ts` mitigates it by pre-bundling
  runtime deps — if you add a new client-side dependency and see
  "optimized dependencies changed. reloading" mid-session, add it to that
  list. Dev-only; production builds are unaffected. If it fires, restart
  the dev server.

## Accessibility, SEO & analytics plumbing (site-wide)

- **Single `<main>`:** `Layout.astro` renders `<main id="main-content">` around
  `<slot />` (target of the skip-to-content link). Pages must NOT add their own
  `<main>` — use `<div>`/`<article>` inside it.
- **JSON-LD:** `StructuredData.astro` emits WebSite + Organization on every
  page; blog posts add BlogPosting (`src/pages/[...blog]/index.astro`).
- **Web manifest:** generated from `SITE.name` by `src/pages/site.webmanifest.ts`;
  icons `public/icon-192.png` / `icon-512.png` (placeholders — replace with the
  favicons per project). `theme-color` meta lives in `Favicons.astro`.
- **Drafts:** posts with `draft: true` frontmatter show in `astro dev` but are
  excluded from production builds (including RSS). Filter is in
  `src/utils/blog.ts`.
- **Custom events:** use `track()` from `src/utils/analytics.ts` — snake_case
  `{object}_{action}` names (`cta_click`, `contact_form_submit`). Create
  matching Custom Event triggers in GTM. Don't push to dataLayer ad hoc with
  other shapes.
- **Contact form:** `/contact` posts to Formspree; endpoint lives in
  `CONTACT.formspreeEndpoint` in `src/config.ts` (placeholder = form shows a
  "not configured" notice). Progressive enhancement: keep the plain
  `action`/`method` POST fallback and the `_gotcha` honeypot when editing.
- `public/_redirects` is the Cloudflare Pages redirects file (currently just
  commented examples).

## Site chrome (Header / Footer / navigation)

- `src/navigation.ts` — single source for header links, the header CTA button,
  and footer links. Edit links here, not in the components.
- `src/components/Header.astro` — logo left, nav + CTA right; sticky; mobile
  menu is an Alpine `x-data` island. Active link via `Astro.url.pathname`.
- `src/components/Footer.astro`, `src/components/Logo.astro` — the Logo SVG is
  a placeholder mark; replace per project.
- Header/Footer are rendered by `src/layouts/Layout.astro` around `<slot />`
  (body is `flex min-h-screen flex-col` so the footer sticks to the bottom).

## Files you'll usually touch

- New page → `src/pages/*.astro`, wrap in `~/layouts/Layout.astro`, pass `metadata`.
- New blog post → `src/data/post/*.md`.
- Restyle blog → edit markup in `src/pages/[...blog]/**` (keep the data wiring).
- Site name/URL → `src/site.config.ts` (only place). SEO defaults → `src/config.ts`.
- Header/footer/nav → build new components; wire into `Layout.astro` around `<slot />`.

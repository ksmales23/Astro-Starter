# Astro + Tailwind starter (markdown blog + SEO, blank slate)

A minimal static starter with a full **markdown blog engine, Google Consent Mode v2, datalayer events and SEO/metadata
layer**. Everything reads from plain TypeScript config
(`src/site.config.ts` + `src/config.ts`).

Built and verified against **Astro 7.0 + Tailwind 4.3**, on Vite 8 (Node ≥ 22.12).

---

## Using it

**Use this folder directly.** It's a complete, buildable project:

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in ./dist
```

> **Vite alignment.** Astro 7 runs on Vite 8, the same major `@tailwindcss/vite`
> uses, so no `overrides` pin is needed (unlike Astro 6, which needed Vite held at
> 7). If you ever see a stray `overrides.vite` entry, delete it.
>
> **Markdown pipeline.** Astro 7 defaults to the new Rust "Sätteri" processor,
> which does not run remark/rehype plugins. This starter keeps the reading-time
> and responsive-table plugins working by explicitly opting into the unified
> pipeline via `processor: unified(...)` from `@astrojs/markdown-remark` in
> `astro.config.ts`. Leave that in place unless you port the plugins to Sätteri.

---

## Site chrome

A neutral Header (logo left, nav + "Contact us" CTA right, Alpine mobile menu),
Footer, and pop-up cookie banner (Accept all / Reject all + granular options)
are included. Links live in `src/navigation.ts`; the logo is a placeholder in
`src/components/Logo.astro`.

## First things to edit

1. `src/site.config.ts` → set `SITE.site` to your real origin and `name`.
   This is the **only** place the domain lives — `astro.config.ts` imports it
   and `robots.txt` is generated from it at build time.
2. `src/config.ts` → `METADATA` defaults and the blog options.
3. Replace the placeholder icons (`public/favicon.svg`, `favicon.ico`,
   `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) and
   `src/assets/images/default.png` (your 1200×630 social-card fallback).
4. `src/config.ts` → set `CONTACT.formspreeEndpoint` to enable the contact
   form.

---

## What's included

**Blog (data layer — design-agnostic):**

- `src/content.config.ts` — Zod schema for posts in `src/data/post/`.
- `src/utils/blog.ts` — `fetchPosts`, related posts, and `getStaticPaths*` for
  list / post / category / tag, all with pagination.
- `src/utils/permalinks.ts` — configurable URL builder (`SITE.trailingSlash`,
  `APP_BLOG.post.permalink` pattern like `/%slug%`, `%category%`, `%year%`…).
- `src/utils/frontmatter.ts` — reading-time remark plugin + responsive-table
  rehype plugin.
- `src/pages/rss.xml.ts` — RSS feed.
- `src/pages/[...blog]/…` — **minimal placeholder route markup**. The data is
  fully wired; replace the markup inside the `<!-- Replace … -->` blocks with
  your own designs.

**SEO:**

- `src/components/common/Metadata.astro` — wraps `astro-seo`; merges site-wide
  defaults with per-page props → title template, canonical, OpenGraph, Twitter.
- `src/utils/images.ts` — `findImage` (resolve `~/assets/images/…`) +
  `adaptOpenGraphImages` (optimizes the OG image via Sharp to an absolute URL).
- `src/components/common/CommonMeta.astro` — charset/viewport, sitemap link, and
  optional Google site-verification.

**Plumbing:** `@astrojs/sitemap`, MDX support, the `~` → `src` alias, and the
Tailwind v4 setup (`@tailwindcss/vite` + typography plugin for `prose`).

### Robots defaults

Pages are **indexable by default** (`METADATA.robots` in `src/config.ts`).
Per-page and per-route robots override this (e.g. tag archives are `noindex`
via `APP_BLOG.tag.robots`).

---

## Routing

Posts use a configurable catch-all (`src/pages/[...blog]/…`). With the default
`APP_BLOG.post.permalink = '/blog/%slug%'`:

- `/blog` , `/blog/2` … — paginated list
- `/blog/<slug>` — a post
- `/category/<slug>` , `/category/<slug>/2` … — category archive
- `/tag/<slug>` … — tag archive
- `/rss.xml` , `/sitemap-index.xml`

Change `permalink` to `'/%slug%'` for root-level post URLs, or change the
`pathname` values to rename `blog` / `category` / `tag`.

Add a post by dropping a `.md` / `.mdx` file into `src/data/post/` with the
frontmatter shown in `hello-world.md`.

---

## Deploy — Cloudflare Pages (Git connection)

Purely static, deployed via the GitHub connection. **No adapter, no
`wrangler.toml`, no `output: 'server'`** — Pages just builds the repo and serves
`dist/`. Every push to your main branch is a production deploy; PRs get preview
URLs automatically.

In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to
Git**, pick the repo, then set:

- Framework preset: **Astro** (or "None" — it only pre-fills the next two)
- Build command: `npm run build`
- Output directory: **`dist`** (the #1 cause of a blank-page deploy is leaving
  this as `public`)

Node version is pinned by the committed **`.nvmrc`** (`22`) in this repo, so the
build won't fall back to Cloudflare's older default and fail Astro 7's Node ≥ 22.12
requirement. (Alternatively set a `NODE_VERSION = 22` env var in the dashboard.)

Two current gotchas worth knowing:

1. **Pages vs Workers.** Cloudflare is merging the two products and the dashboard
   sometimes silently routes a static site to _Workers_ — you'll land on a
   `*.workers.dev` URL instead of `*.pages.dev`. Make sure you went in through
   the **Pages** "Connect to Git" path. If you see `*.workers.dev`, you're on the
   wrong product.
2. **Don't add a `wrangler.toml`** for this static + Git-connection setup. If one
   exists it overrides the dashboard settings and can wipe env vars.

Included for static hosting on Cloudflare: `public/_headers` (immutable caching
for `/_astro/*` + baseline security headers) and a `404.astro` page — Cloudflare
Pages serves `dist/404.html` automatically for unmatched routes.

(If you ever add server-rendered routes later, that's when you'd install
`@astrojs/cloudflare` and switch to `output: 'server'`. Not needed now.)

**Docker (optional fallback, not used by the Pages deploy).** A multi-stage
`Dockerfile` builds the site and serves `dist/` with nginx:

```bash
docker build -t my-site .
docker run -p 8080:80 my-site   # http://localhost:8080
```

import { SITE } from '~/config';

// Generated at build time so the name always matches SITE.name.
// theme/background colors here and the <meta name="theme-color"> in
// Favicons.astro should be kept in step with your site's design.
export const GET = () => {
  const manifest = {
    name: SITE.name,
    short_name: SITE.name,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
};

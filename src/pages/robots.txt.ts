import { SITE } from '~/config';

// Generated at build time so the sitemap URL always matches SITE.site —
// no second copy of the domain to keep in sync.
export const GET = () => {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('sitemap-index.xml', SITE.site)}`, ''].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

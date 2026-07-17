import type { MetaData } from '~/types';

// ---------------------------------------------------------------------------
// Site-wide configuration — plain TypeScript, no build plugin.
// App code imports everything from `~/config`.
// ---------------------------------------------------------------------------

// SITE is defined in src/site.config.ts (env-free, shared with astro.config.ts)
// and re-exported here so app code keeps importing everything from `~/config`.
import { SITE } from './site.config';
export { SITE };
export type { SiteConfig } from './site.config';

export interface I18NConfig {
  language: string;
  textDirection: string;
}

export interface MetaDataConfig {
  title: { default: string; template: string };
  description: string;
  robots: { index: boolean; follow: boolean };
  openGraph: NonNullable<MetaData['openGraph']>;
  twitter: NonNullable<MetaData['twitter']>;
}

interface BlogRouteConfig {
  isEnabled: boolean;
  pathname: string;
  robots: { index: boolean; follow: boolean };
}

export interface AppBlogConfig {
  isEnabled: boolean;
  postsPerPage: number;
  isRelatedPostsEnabled: boolean;
  relatedPostsCount: number;
  post: {
    isEnabled: boolean;
    permalink: string; // Variables: %slug% %id% %category% %year% %month% %day% %hour% %minute% %second%
    robots: { index: boolean; follow: boolean };
  };
  list: BlogRouteConfig;
  category: BlogRouteConfig;
  tag: BlogRouteConfig;
}

export interface ContactConfig {
  // Formspree form endpoint, e.g. 'https://formspree.io/f/abcdwxyz'.
  // Leave the placeholder and the form shows a "not configured" message
  // instead of submitting.
  formspreeEndpoint: string;
}

export const CONTACT: ContactConfig = {
  formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID', // <-- change me
};

export const I18N: I18NConfig = {
  language: 'en',
  textDirection: 'ltr',
};

export const METADATA: MetaDataConfig = {
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  description: 'A fast static site built with Astro and Tailwind CSS.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: SITE.name,
    images: [
      {
        url: '~/assets/images/default.png', // local image, optimized at build time for social cards
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    handle: '',
    site: '',
    cardType: 'summary_large_image',
  },
};

export const APP_BLOG: AppBlogConfig = {
  isEnabled: true,
  postsPerPage: 6,
  isRelatedPostsEnabled: true,
  relatedPostsCount: 4,

  post: {
    isEnabled: true,
    permalink: '/blog/%slug%', // posts live under /blog/… (change to '/%slug%' for root-level)
    robots: { index: true, follow: true },
  },
  list: {
    isEnabled: true,
    pathname: 'blog', // /blog
    robots: { index: true, follow: true },
  },
  category: {
    isEnabled: true,
    pathname: 'category', // /category/<name>
    robots: { index: true, follow: true },
  },
  tag: {
    isEnabled: true,
    pathname: 'tag', // /tag/<name>
    robots: { index: false, follow: true },
  },
};

// ---------------------------------------------------------------------------
// Analytics (GTM + GA4 via Google Tag Manager) and Consent Mode v2.
// IDs are read from PUBLIC_ env vars at build time (see .env.example).
// Analytics only loads in production builds AND after the user consents.
// ---------------------------------------------------------------------------
export interface AnalyticsConfig {
  gtmId?: string; // GTM-XXXXXXX  (leave empty to disable GTM entirely)
  consentRequired: boolean; // true = Consent Mode v2 denied-by-default + banner (UK/EEA)
}

export const ANALYTICS: AnalyticsConfig = {
  gtmId: import.meta.env.PUBLIC_GTM_ID,
  consentRequired: true,
};

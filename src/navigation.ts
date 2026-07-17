import { getBlogPermalink, getHomePermalink, getPermalink } from '~/utils/permalinks';

// ---------------------------------------------------------------------------
// Site navigation — single source for Header and Footer links.
// Edit here; the components render whatever this exports.
// ---------------------------------------------------------------------------

export interface NavLink {
  text: string;
  href: string;
}

export interface HeaderData {
  links: NavLink[];
  cta: NavLink;
}

export interface FooterData {
  links: NavLink[];
  legalLinks: NavLink[];
  tagline: string;
}

export const headerData: HeaderData = {
  links: [
    { text: 'Home', href: getHomePermalink() },
    { text: 'Blog', href: getBlogPermalink() },
  ],
  cta: { text: 'Contact us', href: getPermalink('/contact') },
};

export const footerData: FooterData = {
  links: [
    { text: 'Home', href: getHomePermalink() },
    { text: 'Blog', href: getBlogPermalink() },
    { text: 'Contact', href: getPermalink('/contact') },
  ],
  legalLinks: [{ text: 'Privacy & cookies', href: getPermalink('/privacy') }],
  tagline: 'A fast static site built with Astro.',
};

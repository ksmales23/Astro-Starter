// ---------------------------------------------------------------------------
// track() — push a structured event to the GTM dataLayer.
//
// Convention: event names are snake_case, `{object}_{action}`:
//   track('cta_click', { cta: 'contact-header' });
//   track('contact_form_submit');
//   track('newsletter_signup', { location: 'footer' });
// In GTM, create Custom Event triggers matching these names and forward to
// GA4. Safe to call anywhere: no-ops server-side and works before GTM loads
// (events queue in the dataLayer; whether they're *processed* still depends
// on GTM loading and user consent).
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const track = (event: string, params: Record<string, unknown> = {}): void => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
};

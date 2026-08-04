declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined;
const GOOGLE_ADS_CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL as string | undefined;

/** Injects Meta Pixel + Google gtag scripts. Only runs if IDs are set via env. Call once on app load. */
export function initAdPixels() {
  if (META_PIXEL_ID && !document.getElementById('meta-pixel-script')) {
    const s = document.createElement('script');
    s.id = 'meta-pixel-script';
    s.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${META_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(s);
  }

  if (GOOGLE_ADS_ID && !document.getElementById('gtag-script')) {
    const s1 = document.createElement('script');
    s1.id = 'gtag-script';
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(s1);

    const s2 = document.createElement('script');
    s2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GOOGLE_ADS_ID}');
    `;
    document.head.appendChild(s2);
    window.gtag = window.gtag || function (...args: unknown[]) { window.dataLayer?.push(args); };
  }
}

/** Fires a lead-conversion event to whichever ad platforms are configured. */
export function trackLeadConversion(formLocation: string) {
  if (window.fbq) {
    window.fbq('track', 'Lead', { content_name: formLocation });
  }
  if (window.gtag && GOOGLE_ADS_ID) {
    window.gtag('event', 'conversion', {
      send_to: GOOGLE_ADS_CONVERSION_LABEL
        ? `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`
        : GOOGLE_ADS_ID,
    });
    window.gtag('event', 'generate_lead', { form_location: formLocation });
  }
}

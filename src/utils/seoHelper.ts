/**
 * SEO Helper Utility
 * Provides functions to dynamically set meta tags and optimize SEO
 */

interface SEOConfig {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  twitterCreator?: string;
  keywords?: string;
  type?: string; // For og:type
}

/**
 * Updates all SEO-related meta tags for a page
 */
export function updateSEOMetaTags(config: SEOConfig): void {
  // Set page title
  document.title = config.title;

  // Update meta description
  updateOrCreateMetaTag('name', 'description', config.description);

  // Update og:title
  updateOrCreateMetaTag('property', 'og:title', config.title);

  // Update og:description
  updateOrCreateMetaTag('property', 'og:description', config.description);

  // Update og:url
  updateOrCreateMetaTag('property', 'og:url', config.url);

  // Update og:type
  if (config.type) {
    updateOrCreateMetaTag('property', 'og:type', config.type);
  }

  // Update og:image if provided
  if (config.ogImage) {
    updateOrCreateMetaTag('property', 'og:image', config.ogImage);
  }

  // Update twitter:title
  updateOrCreateMetaTag('property', 'twitter:title', config.title);

  // Update twitter:description
  updateOrCreateMetaTag('property', 'twitter:description', config.description);

  // Update twitter:creator if provided
  if (config.twitterCreator) {
    updateOrCreateMetaTag('name', 'twitter:creator', config.twitterCreator);
  }

  // Update keywords if provided
  if (config.keywords) {
    updateOrCreateMetaTag('name', 'keywords', config.keywords);
  }

  // Update or create canonical URL
  updateCanonicalURL(config.url);
}

/**
 * Helper function to update or create a meta tag
 */
function updateOrCreateMetaTag(
  attributeName: 'name' | 'property',
  attributeValue: string,
  content: string
): void {
  let metaTag = document.querySelector(
    `meta[${attributeName}="${attributeValue}"]`
  ) as HTMLMetaElement;

  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attributeName, attributeValue);
    document.head.appendChild(metaTag);
  }

  metaTag.content = content;
}

/**
 * Updates or creates the canonical URL meta tag
 */
function updateCanonicalURL(url: string): void {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }

  canonical.href = url;
}

/**
 * Resets SEO tags to homepage defaults
 */
export function resetSEOTags(): void {
  const defaultTitle = 'Niklaus Solutions | Industry-Oriented Tech Workshops & Training';
  const defaultDescription = 'Join Niklaus Solutions for industry-oriented tech workshops. Hands-on training in cybersecurity, cloud computing, AI/ML, and more. Get certified and job-ready with expert instructors.';

  document.title = defaultTitle;
  updateOrCreateMetaTag('name', 'description', defaultDescription);
  updateOrCreateMetaTag('property', 'og:title', defaultTitle);
  updateOrCreateMetaTag('property', 'og:description', defaultDescription);
  updateOrCreateMetaTag('property', 'og:url', 'https://theniklaus.com/');
  updateCanonicalURL('https://theniklaus.com/');
}

/**
 * Add structured data (JSON-LD) to page head
 */
export function addStructuredData(jsonLd: object): void {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

/**
 * Generate Organization Schema for JSON-LD
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Niklaus Solutions',
    url: 'https://theniklaus.com',
    description:
      'Industry-oriented tech workshops and training programs in cybersecurity, full stack development, AI/ML, and more.',
    logo: '/icons/logo.png',
    sameAs: [
      'https://www.facebook.com/niklaussolutions',
      'https://twitter.com/NiklausSolutions',
      'https://www.linkedin.com/company/niklaussolutions',
      'https://www.instagram.com/niklaussolutions',
      'https://www.youtube.com/@niklaussolutions',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'info@theniklaus.com',
      url: 'https://theniklaus.com/contact',
    },
  };
}

/**
 * Generate LocalBusiness Schema for JSON-LD
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Niklaus Solutions',
    url: 'https://theniklaus.com',
    address: {
      '@type': 'PostalAddress',
      // Add your actual address here
      addressCountry: 'IN',
    },
    telephone: '+91-XXXXX-XXXXX', // Add actual phone
    email: 'info@theniklaus.com',
  };
}

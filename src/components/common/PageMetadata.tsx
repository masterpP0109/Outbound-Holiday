import { useEffect } from 'react';
import { getRouteOgImage, PageRoute, SITE_URL } from '../../routes';
import { getWpConfig } from '../../runtime/api';

export function PageMetadata({ route }: { route: PageRoute }) {
  useEffect(() => {
    const activeSiteUrl = (getWpConfig()?.siteUrl || SITE_URL).replace(/\/+$/, '');
    document.title = route.title;
    const setMeta = (key: string, content: string, attribute = 'name') => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = content;
    };
    const isArticle = route.view === 'blog-post' || route.view === 'guide';
    const ogImage = getRouteOgImage(route);

    setMeta('description', route.description);
    setMeta('robots', ['not-found','newsletter-confirmed'].includes(route.view) ? 'noindex, follow' : 'index, follow');
    setMeta('og:type', isArticle ? 'article' : 'website', 'property');
    setMeta('og:title', route.title, 'property');
    setMeta('og:description', route.description, 'property');
    setMeta('og:url', activeSiteUrl + route.path, 'property');
    if (ogImage) {
      setMeta('og:image', ogImage, 'property');
    }
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = activeSiteUrl + route.path;
  }, [route]);
  return null;
}

import { registerContent, ALL_GUIDE_ARTICLES,getSnapshot } from './runtime/catalog';
import type { GuideArticle } from './types/guide';
import type { BlogPost } from './types/blog';
import { ALL_EXPERIENCES,Experience } from './data/experiencesData';
import { ALL_PACKAGES,DetailedPackage } from './data/packagesData';
import { ALL_ACCOMMODATIONS,DetailedAccommodation } from './data/accommodationsData';
import { FIRST_TIME_VISITOR_ARTICLE } from './data/guideArticles';
import { getPublishedBlogPosts } from './data/blogData';

export const SITE_URL = 'https://outbound-holiday.vercel.app';
export type View = 'home' | 'experiences' | 'experience-category' | 'experience-detail' | 'packages' | 'package-detail' | 'accommodation' | 'accommodation-detail' | 'guide' | 'blog' | 'blog-post' | 'boma' | 'bungee' | 'client-gallery' | 'about' | 'newsletter-confirmed' | 'contact' | 'admin-newsletter' | 'offer-detail' | 'not-found';
export interface PageRoute {
  path: string;
  view: View;
  title: string;
  description: string;
  experience?: Experience;
  package?: DetailedPackage;
  accommodation?: DetailedAccommodation;
  category?: string;
  article?: GuideArticle;
  blogPost?: BlogPost;
  offerSlug?: string;
}
export const experiencePath = (experience: Pick<Experience, 'id' | 'slug'>) => `/things-to-do/${experience.id === 'boma-dinner-show' ? 'boma-dinner' : experience.slug}`;
export const packagePath = (pkg: Pick<DetailedPackage, 'slug'>) => `/packages/${pkg.slug}`;
export const accommodationPath = (property: Pick<DetailedAccommodation, 'slug'>) => `/accommodation/${property.slug}`;
export const categoryPath = (id: string) => `/things-to-do/category/${id}`;
export const blogPath = (postOrSlug: string | Pick<BlogPost, 'slug'>) => `/blog/${typeof postOrSlug === 'string' ? postOrSlug : postOrSlug.slug}`;
export const offerPath = (slug: string) => `/offers/${slug}`;

export function getRouteOgImage(route: PageRoute): string | undefined {
  const rawImage =
    route.blogPost?.seo.ogImage ||
    route.blogPost?.featuredImage.url ||
    route.article?.heroImageUrl ||
    route.experience?.featuredImage ||
    route.package?.imageUrl ||
    route.accommodation?.heroImage;
  if (!rawImage) return undefined;
  return /^https?:\/\//i.test(rawImage)
    ? rawImage
    : `${SITE_URL}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;
}
const categories = {
  'first-visit': 'First Visit Essentials', wildlife: 'Wildlife and Safari', adventure: 'Adventure',
  river: 'Zambezi River', culture: 'Culture and Dining', 'day-trips': 'Day Trips', wellness: 'Spa and Wellness',
};
export let PAGE_ROUTES: PageRoute[] = [];
registerContent(() => { PAGE_ROUTES = [
  { path: '/', view: 'home', title: 'Outbound Holidays | Victoria Falls Holidays Planned by Local Specialists', description: 'Plan your Victoria Falls holiday with trusted local specialists. Get honest advice on accommodation, activities, transfers, safaris and personalised itineraries built around your interests and budget.' },
  ...(FIRST_TIME_VISITOR_ARTICLE ? [{ path: '/victoria-falls-guide', view: 'guide' as const, title: FIRST_TIME_VISITOR_ARTICLE.seo.metaTitle, description: FIRST_TIME_VISITOR_ARTICLE.seo.metaDescription }] : []),
  { path: '/things-to-do-in-victoria-falls', view: 'experiences', title: 'Things to Do in Victoria Falls | Outbound Holidays', description: 'Explore Victoria Falls activities, Zambezi cruises, safaris, cultural experiences and day trips with practical advice from local travel specialists.' },
  { path: '/victoria-falls-accommodation', view: 'accommodation', title: 'Victoria Falls Accommodation | Outbound Holidays', description: 'Compare Victoria Falls hotels, lodges and self-catering stays. Find accommodation for families, couples and safari holidays with local specialist advice.' },
  { path: '/victoria-falls-packages', view: 'packages', title: 'Victoria Falls Holiday Packages | Outbound Holidays', description: 'Explore Victoria Falls holiday packages for families, honeymoons, adventures and safaris. Tailor your accommodation, activities and itinerary with local specialists.' },
  { path: '/client-gallery', view: 'client-gallery', title: 'Client Gallery | Outbound Holidays', description: 'Explore photos from holidays and experiences enjoyed by Outbound Holidays clients. Discover travel memories from Victoria Falls and beyond.' },
  { path: '/about', view: 'about', title: 'About Fungai Mtetwa & Outbound Holidays | Victoria Falls', description: 'Meet Fungai Mtetwa, the Victoria Falls-based founder of Outbound Holidays. Personal holiday planning informed by more than nine years in tourism.' },
  ...Object.entries(categories).map(([category, name]): PageRoute => ({ path: categoryPath(category), view: 'experience-category', category, title: `${name} in Victoria Falls | Outbound Holidays`, description: `Discover ${name.toLowerCase()} experiences in Victoria Falls. Compare activities and plan your visit with advice from Outbound Holidays local specialists.` })),
  ...ALL_EXPERIENCES.map((experience): PageRoute => ({ path: experiencePath(experience), view: experience.id === 'boma-dinner-show' ? 'boma' : experience.slug === 'bungee-jump' ? 'bungee' : 'experience-detail', experience, title: `${experience.title} | Outbound Holidays`, description: experience.shortDescription })),
  ...ALL_PACKAGES.map((pkg): PageRoute => ({ path: packagePath(pkg), view: 'package-detail', package: pkg, title: `${pkg.title} | Outbound Holidays`, description: pkg.description })),
  ...ALL_ACCOMMODATIONS.map((accommodation): PageRoute => ({ path: accommodationPath(accommodation), view: 'accommodation-detail', accommodation, title: `${accommodation.name} | Victoria Falls Accommodation | Outbound Holidays`, description: accommodation.shortDescription })),
  { path:'/newsletter-confirmed',view:'newsletter-confirmed',title:'Newsletter Confirmation | Outbound Holidays',description:'Thank you for confirming your travel updates subscription.' },
  { path:'/contact',view:'contact',title:'Contact Outbound Holidays',description:'Speak with our Victoria Falls travel specialists.' },
  { path:'/admin/newsletter',view:'admin-newsletter',title:'Newsletter Administration | Outbound Holidays',description:'Administer subscribers, campaigns and email delivery.' },
  ...Object.values(ALL_GUIDE_ARTICLES).filter(g=>g.slug!=='first-time-visitor-guide').map((article):PageRoute=>({path:'/victoria-falls-guide/'+article.slug,view:'guide',article,title:article.seo.metaTitle,description:article.seo.metaDescription})),
  { path: '/blog', view: 'blog', title: 'Victoria Falls Travel Blog | Outbound Holidays', description: 'Local insights, travel inspiration and practical advice to help you plan your next Victoria Falls holiday with Outbound Holidays.' },
  ...getPublishedBlogPosts().map((blogPost): PageRoute => ({
    path: blogPath(blogPost),
    view: 'blog-post',
    blogPost,
    title: blogPost.seo.metaTitle,
    description: blogPost.seo.metaDescription,
  })),
];for(const route of PAGE_ROUTES){const seo=getSnapshot().site.routeSeo[route.path];if(seo){route.title=seo.title;route.description=seo.description;}} });

export function resolveRoute(pathname: string): PageRoute {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path.startsWith('/offers/')) {
    const offerSlug = path.replace(/^\/offers\//, '').replace(/\/+$/, '');
    return {
      path,
      view: 'offer-detail',
      title: 'Special Promotional Offer | Outbound Holidays Victoria Falls',
      description: 'Exclusive limited-time promotional travel offer with Outbound Holidays Victoria Falls.',
      offerSlug,
    };
  }
  return PAGE_ROUTES.find((route) => route.path === path) ?? { path, view: 'not-found', title: 'Page Not Found | Outbound Holidays', description: 'This page could not be found. Explore Victoria Falls holidays, activities and accommodation with Outbound Holidays.' };
}

export function sectionPath(section: string): string {
  const paths: Record<string, string> = {
    hero: '/', home: '/', contact: '/contact', 'contact-us': '/contact', about: '/about', 'about-us': '/about', 'client-gallery': '/client-gallery', 'travel-guide': '/victoria-falls-guide', guide: '/victoria-falls-guide',
    blog: '/blog', 'travel-blog': '/blog',
    'travel-experiences': '/things-to-do-in-victoria-falls', experiences: '/things-to-do-in-victoria-falls',
    accommodation: '/victoria-falls-accommodation', accommodations: '/victoria-falls-accommodation', 'where-to-stay': '/victoria-falls-accommodation',
    'travel-packages': '/victoria-falls-packages', packages: '/victoria-falls-packages', boma: '/things-to-do/boma-dinner', 'boma-dinner': '/things-to-do/boma-dinner',
  };
  return paths[section] ?? `/#${section}`;
}

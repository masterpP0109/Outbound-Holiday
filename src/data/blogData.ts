import { ALL_GUIDE_ARTICLES, registerContent } from '../runtime/catalog';
import type { GuideArticle } from '../types/guide';
import type {
  BlogCategory,
  BlogDataSource,
  BlogNewsletterSummary,
  BlogPost,
  BlogTag,
  WordPressRestPost,
} from '../types/blog';

/**
 * Initial WordPress-aligned category taxonomy for Outbound Holidays Blog.
 * Driven from data rather than hardcoded inside UI presentation components.
 */
export const INITIAL_BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'cat-vic-falls-guides',
    slug: 'victoria-falls-travel-guides',
    name: 'Victoria Falls Travel Guides',
    description:
      'In-depth planning guides covering seasons, itineraries, logistics, and first-time visits to Victoria Falls.',
  },
  {
    id: 'cat-things-to-do',
    slug: 'things-to-do',
    name: 'Things to Do',
    description:
      'Safari drives, Zambezi river cruises, rainforest walks, helicopter flights, and bucket-list activities.',
  },
  {
    id: 'cat-accommodation',
    slug: 'accommodation',
    name: 'Accommodation',
    description:
      'Local insight on choosing between Victoria Falls town hotels, boutique lodges, and private safari retreats.',
  },
  {
    id: 'cat-family-holidays',
    slug: 'family-holidays',
    name: 'Family Holidays',
    description:
      'Practical itineraries, pace tips, and multi-generational stay recommendations around the Falls.',
  },
  {
    id: 'cat-travel-tips',
    slug: 'travel-tips',
    name: 'Travel Tips',
    description:
      'Visa entry rules, budgeting, flights, weather expectations, and border-crossing advice from local specialists.',
  },
  {
    id: 'cat-local-experiences',
    slug: 'local-experiences',
    name: 'Local Experiences',
    description:
      'Authentic Zimbabwean dining, cultural evenings, craft markets, and community-led experiences.',
  },
  {
    id: 'cat-travel-news',
    slug: 'travel-news',
    name: 'Travel News',
    description:
      'Seasonal water updates, flight route announcements, park advisories, and Victoria Falls destination news.',
  },
];

const CATEGORY_BY_SLUG = new Map<string, BlogCategory>(
  INITIAL_BLOG_CATEGORIES.map((category) => [category.slug, category]),
);

const GUIDE_TAXONOMY_MAP: Record<
  string,
  { categorySlugs: string[]; tags: string[] }
> = {
  'first-time-visitor-guide': {
    categorySlugs: ['victoria-falls-travel-guides', 'family-holidays'],
    tags: ['First-Time Visitors', 'Victoria Falls', 'Trip Planning', 'Zimbabwe'],
  },
  'best-time-to-visit': {
    categorySlugs: ['victoria-falls-travel-guides', 'travel-tips'],
    tags: ['Best Time to Visit', 'High Water Season', 'Dry Season', 'Photography'],
  },
  'month-by-month-guide': {
    categorySlugs: ['victoria-falls-travel-guides', 'travel-tips'],
    tags: ['Month by Month', 'Water Levels', 'Seasonal Planning'],
  },
  'weather-guide': {
    categorySlugs: ['victoria-falls-travel-guides', 'travel-tips'],
    tags: ['Weather', 'Packing List', 'Temperatures', 'Rainforest Spray'],
  },
  'where-to-stay-victoria-falls': {
    categorySlugs: ['accommodation', 'family-holidays'],
    tags: ['Hotels', 'Boutique Lodges', 'Safari Lodges', 'Where to Stay'],
  },
  'experience-victoria-falls': {
    categorySlugs: ['things-to-do', 'local-experiences'],
    tags: ['Sunset Cruise', 'Rainforest Tour', 'Helicopter Flight', 'The Boma'],
  },
  'victoria-falls-itineraries': {
    categorySlugs: ['victoria-falls-travel-guides', 'family-holidays'],
    tags: ['Itineraries', '3-Night Stay', 'Chobe Day Trip', 'Family Travel'],
  },
  'victoria-falls-budget-guide': {
    categorySlugs: ['travel-tips', 'victoria-falls-travel-guides'],
    tags: ['Budgeting', 'Park Fees', 'Holiday Costs', 'Value Advice'],
  },
  'getting-to-victoria-falls': {
    categorySlugs: ['travel-tips'],
    tags: ['VFA Airport', 'Flights', 'Airport Transfers', 'Zambia Border'],
  },
  'visa-entry-requirements': {
    categorySlugs: ['travel-tips'],
    tags: ['KAZA UniVisa', 'Visas', 'Passport Rules', 'Immigration'],
  },
  'victoria-falls-faqs': {
    categorySlugs: ['travel-tips', 'victoria-falls-travel-guides'],
    tags: ['FAQs', 'Safety', 'Currency', 'Health Advice'],
  },
};

const toTag = (label: string): BlogTag => ({
  id: `tag-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name: label,
});

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseDateToIso = (input?: string): string => {
  if (!input) return '2026-01-15T08:00:00.000Z';
  const parsed = Date.parse(input);
  if (Number.isNaN(parsed)) return '2026-01-15T08:00:00.000Z';
  return new Date(parsed).toISOString();
};

const formatIsoToDisplay = (iso: string): string => {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(parsed));
};

const toDistinctBlogTitle = (rawTitle: string): string => {
  const base = rawTitle.replace(/\s*\|\s*Outbound Holidays.*$/i, '').trim();
  return `${base} | Blog | Outbound Holidays`;
};

const toCategories = (
  slugs: string[],
  fallbackLabel?: string,
): BlogCategory[] => {
  const resolved = slugs
    .map((slug) => CATEGORY_BY_SLUG.get(slug))
    .filter((cat): cat is BlogCategory => Boolean(cat));
  if (resolved.length > 0) return resolved;

  if (fallbackLabel) {
    const slug = fallbackLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return [
      CATEGORY_BY_SLUG.get(slug) ?? {
        id: `cat-${slug}`,
        slug,
        name: fallbackLabel,
        description: `${fallbackLabel} articles from Outbound Holidays.`,
      },
    ];
  }

  return [INITIAL_BLOG_CATEGORIES[0]];
};

/**
 * Adapts an existing travel guide article from the shared content catalog into
 * a WordPress-compatible `BlogPost`. Keeps presentation components decoupled from
 * the temporary content source.
 */
export function adaptGuideArticleToBlogPost(article: GuideArticle): BlogPost {
  const mapping = GUIDE_TAXONOMY_MAP[article.slug];
  const categories = toCategories(
    mapping?.categorySlugs ?? ['victoria-falls-travel-guides'],
    article.category,
  );
  const tags = (
    mapping?.tags ??
    (article.seo.keywords || [])
      .slice(0, 4)
      .map((kw) => kw.replace(/\b\w/g, (c) => c.toUpperCase()))
  ).map(toTag);

  const publishedIso = parseDateToIso(article.publishedDate);
  const modifiedIso = parseDateToIso(
    article.lastUpdatedDate || article.publishedDate,
  );

  const relatedSlugs = (article.relatedGuides || [])
    .map((rel) => rel.slug?.replace(/^\/+|\/+$/g, ''))
    .filter((slug): slug is string => Boolean(slug));

  return {
    id: `guide-${article.id || article.slug}`,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.subtitle || article.seo.metaDescription,
    sections: article.sections,
    featuredImage: {
      url: article.heroImageUrl,
      alt: article.heroImageAlt || `${article.title} — Victoria Falls`,
    },
    author: article.author
      ? {
          id: `author-${article.author.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: article.author.name,
          role: article.author.role,
          bio: article.author.bio,
          avatarUrl: article.author.avatarUrl,
        }
      : undefined,
    categories,
    tags,
    publishedDate: article.publishedDate,
    publishedIso,
    modifiedDate: article.lastUpdatedDate || article.publishedDate,
    modifiedIso,
    seo: {
      metaTitle: toDistinctBlogTitle(article.seo.metaTitle || article.title),
      metaDescription: article.seo.metaDescription,
      focusKeyword: article.seo.keywords?.[0],
      ogTitle: article.seo.metaTitle || article.title,
      ogDescription: article.seo.metaDescription,
      ogImage: article.seo.ogImage || article.heroImageUrl,
    },
    status: 'publish',
    readingTime: article.readingTime,
    location: article.location,
    relatedSlugs,
    source: 'guide-adapter',
  };
}

/**
 * Adapts a native WordPress REST API v2 post (`? _embed`) into the canonical `BlogPost` model.
 * Enables seamless swap-over to WordPress without rewriting React components.
 */
export function adaptWordPressPostToBlogPost(
  wpPost: WordPressRestPost,
): BlogPost {
  const embeddedTerms = wpPost._embedded?.['wp:term']?.flat() ?? [];
  const wpCategories: BlogCategory[] = embeddedTerms
    .filter((term) => term.taxonomy === 'category')
    .map((term) => {
      const existing = CATEGORY_BY_SLUG.get(term.slug);
      return (
        existing ?? {
          id: term.id,
          slug: term.slug,
          name: stripHtml(term.name),
          description: stripHtml(term.description || ''),
        }
      );
    });

  const wpTags: BlogTag[] = embeddedTerms
    .filter((term) => term.taxonomy === 'post_tag')
    .map((term) => ({
      id: term.id,
      slug: term.slug,
      name: stripHtml(term.name),
    }));

  const media = wpPost._embedded?.['wp:featuredmedia']?.[0];
  const wpAuthor = wpPost._embedded?.author?.[0];
  const title = stripHtml(wpPost.title.rendered);
  const excerpt = stripHtml(wpPost.excerpt.rendered);
  const publishedIso = wpPost.date_gmt
    ? `${wpPost.date_gmt.replace(' ', 'T')}Z`
    : parseDateToIso(wpPost.date);
  const modifiedIso = wpPost.modified_gmt
    ? `${wpPost.modified_gmt.replace(' ', 'T')}Z`
    : parseDateToIso(wpPost.modified || wpPost.date);

  const seoImage =
    wpPost.yoast_head_json?.og_image?.[0]?.url || media?.source_url || '';

  return {
    id: wpPost.id,
    slug: wpPost.slug,
    title,
    subtitle: wpPost.acf?.subtitle,
    excerpt,
    contentHtml: wpPost.content.rendered,
    featuredImage: {
      url: media?.source_url || '/Experiences/Guided Tour of the Falls_/5-4.jpg',
      alt: media?.alt_text || `${title} — Victoria Falls`,
      width: media?.media_details?.width,
      height: media?.media_details?.height,
      caption: media?.caption?.rendered
        ? stripHtml(media.caption.rendered)
        : undefined,
    },
    author: wpAuthor
      ? {
          id: wpAuthor.id,
          name: wpAuthor.name,
          bio: wpAuthor.description || undefined,
          avatarUrl:
            wpAuthor.avatar_urls?.['96'] ||
            wpAuthor.avatar_urls?.['48'] ||
            undefined,
          url: wpAuthor.link,
        }
      : undefined,
    categories:
      wpCategories.length > 0 ? wpCategories : [INITIAL_BLOG_CATEGORIES[0]],
    tags: wpTags,
    publishedDate: formatIsoToDisplay(publishedIso),
    publishedIso,
    modifiedDate: formatIsoToDisplay(modifiedIso),
    modifiedIso,
    seo: {
      metaTitle: wpPost.yoast_head_json?.title || toDistinctBlogTitle(title),
      metaDescription: wpPost.yoast_head_json?.description || excerpt,
      canonicalUrl: wpPost.yoast_head_json?.canonical,
      ogTitle: wpPost.yoast_head_json?.og_title || title,
      ogDescription: wpPost.yoast_head_json?.og_description || excerpt,
      ogImage: seoImage,
    },
    status: wpPost.status,
    readingTime: wpPost.acf?.reading_time,
    location: wpPost.acf?.location || 'Victoria Falls, Zimbabwe',
    source: 'wordpress-rest',
  };
}

/**
 * Fetches published blog posts from a WordPress REST API endpoint (`wp/v2/posts?_embed`).
 * Ready for client-side or build-time sync during future WordPress integration.
 */
export async function fetchWordPressBlogPosts(
  wpBaseUrl: string,
  perPage = 20,
): Promise<BlogPost[]> {
  const endpoint = `${wpBaseUrl.replace(/\/+$/, '')}/wp-json/wp/v2/posts?_embed&status=publish&per_page=${perPage}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`WordPress REST request failed (${response.status})`);
  }
  const rawPosts = (await response.json()) as WordPressRestPost[];
  return rawPosts.map(adaptWordPressPostToBlogPost);
}

/**
 * Builds a reusable `BlogDataSource` over any normalized `BlogPost[]` collection.
 */
export function createBlogDataAdapter(
  posts: BlogPost[],
  sourceName = 'guide-adapter',
): BlogDataSource {
  const getPosts = () => posts;
  const getPublishedPosts = () =>
    posts.filter((post) => post.status === 'publish');

  const getPostBySlug = (slug: string) =>
    getPublishedPosts().find((post) => post.slug === slug);

  const getCategories = (): BlogCategory[] => {
    const published = getPublishedPosts();
    const counts = new Map<string, number>();
    const extras = new Map<string, BlogCategory>();

    for (const post of published) {
      for (const category of post.categories) {
        counts.set(category.slug, (counts.get(category.slug) || 0) + 1);
        if (!CATEGORY_BY_SLUG.has(category.slug)) {
          extras.set(category.slug, category);
        }
      }
    }

    const baseCategories = INITIAL_BLOG_CATEGORIES.map((category) => ({
      ...category,
      count: counts.get(category.slug) || 0,
    }));

    const additionalCategories = [...extras.values()].map((category) => ({
      ...category,
      count: counts.get(category.slug) || 0,
    }));

    return [...baseCategories, ...additionalCategories];
  };

  const getRelatedPosts = (post: BlogPost, limit = 3): BlogPost[] => {
    const candidates = getPublishedPosts().filter(
      (candidate) => candidate.slug !== post.slug,
    );

    const explicitlyRelated = (post.relatedSlugs || [])
      .map((slug) => candidates.find((candidate) => candidate.slug === slug))
      .filter((item): item is BlogPost => Boolean(item));

    if (explicitlyRelated.length >= limit) {
      return explicitlyRelated.slice(0, limit);
    }

    const usedSlugs = new Set(explicitlyRelated.map((item) => item.slug));
    const postCategorySlugs = new Set(post.categories.map((cat) => cat.slug));

    const categoryMatches = candidates
      .filter((candidate) => !usedSlugs.has(candidate.slug))
      .sort((a, b) => {
        const aOverlap = a.categories.filter((c) =>
          postCategorySlugs.has(c.slug),
        ).length;
        const bOverlap = b.categories.filter((c) =>
          postCategorySlugs.has(c.slug),
        ).length;
        return bOverlap - aOverlap;
      });

    return [...explicitlyRelated, ...categoryMatches].slice(0, limit);
  };

  return {
    sourceName,
    getPosts,
    getPublishedPosts,
    getPostBySlug,
    getCategories,
    getRelatedPosts,
  };
}

/**
 * Formats a blog post into a newsletter-ready article link and summary snippet.
 */
export function formatBlogPostForNewsletter(
  post: BlogPost,
  siteUrl = 'https://outbound-holiday.vercel.app',
): BlogNewsletterSummary {
  return {
    title: post.title,
    url: `${siteUrl.replace(/\/+$/, '')}/blog/${post.slug}`,
    excerpt: post.excerpt,
    category: post.categories[0]?.name || 'Victoria Falls Travel Guides',
    imageUrl: post.featuredImage.url,
    publishedDate: post.publishedDate,
  };
}

export let BLOG_POSTS: BlogPost[] = [];
export let BLOG_DATA_ADAPTER: BlogDataSource = createBlogDataAdapter([]);

registerContent(() => {
  const articles = Object.values(ALL_GUIDE_ARTICLES);
  BLOG_POSTS = articles.map(adaptGuideArticleToBlogPost);
  BLOG_DATA_ADAPTER = createBlogDataAdapter(BLOG_POSTS, 'guide-adapter');
});

export const getPublishedBlogPosts = () => BLOG_DATA_ADAPTER.getPublishedPosts();
export const getBlogPostBySlug = (slug: string) =>
  BLOG_DATA_ADAPTER.getPostBySlug(slug);
export const getBlogCategories = () => BLOG_DATA_ADAPTER.getCategories();
export const getRelatedBlogPosts = (post: BlogPost, limit = 3) =>
  BLOG_DATA_ADAPTER.getRelatedPosts(post, limit);
export const getFeaturedBlogPost = (): BlogPost | undefined => {
  const posts = getPublishedBlogPosts();
  return (
    posts.find((post) => post.slug === 'first-time-visitor-guide') ?? posts[0]
  );
};

export interface FeaturedBlogStories {
  main?: BlogPost;
  secondary: BlogPost[];
}

export const getFeaturedBlogStories = (
  posts: BlogPost[] = getPublishedBlogPosts(),
): FeaturedBlogStories => {
  if (posts.length === 0) return { main: undefined, secondary: [] };
  const preferredOrder = [
    'first-time-visitor-guide',
    'best-time-to-visit',
    'where-to-stay-victoria-falls',
  ];
  const main =
    posts.find((p) => p.slug === preferredOrder[0]) ?? posts[0];
  const remaining = posts.filter((p) => p.slug !== main.slug);
  const pickedSecondary: BlogPost[] = [];
  for (const slug of preferredOrder.slice(1)) {
    const match = remaining.find((p) => p.slug === slug);
    if (match) pickedSecondary.push(match);
  }
  for (const candidate of remaining) {
    if (pickedSecondary.length >= 2) break;
    if (!pickedSecondary.some((s) => s.slug === candidate.slug)) {
      pickedSecondary.push(candidate);
    }
  }
  return { main, secondary: pickedSecondary.slice(0, 2) };
};

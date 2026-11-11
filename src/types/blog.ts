import type { GuideSection } from './guide';

/**
 * Matches native WordPress post publication statuses (`wp_posts.post_status`).
 */
export type BlogPostStatus = 'publish' | 'draft' | 'pending' | 'private';

/**
 * WordPress taxonomy category representation (`wp/v2/categories`).
 */
export interface BlogCategory {
  id: string | number;
  slug: string;
  name: string;
  description: string;
  count?: number;
}

/**
 * WordPress taxonomy tag representation (`wp/v2/tags`).
 */
export interface BlogTag {
  id: string | number;
  slug: string;
  name: string;
}

/**
 * WordPress author / travel specialist representation (`wp/v2/users`).
 */
export interface BlogAuthor {
  id?: string | number;
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  url?: string;
}

/**
 * WordPress featured media attachment representation (`wp:featuredmedia`).
 */
export interface BlogFeaturedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

/**
 * SEO metadata compatible with Yoast SEO / Rank Math / headless WP fields.
 */
export interface BlogSeoMetadata {
  metaTitle: string;
  metaDescription: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

/**
 * Pre-formatted newsletter summary payload so blog articles can be dropped into
 * Outbound Holidays newsletter campaigns without duplicating subscriber logic.
 */
export interface BlogNewsletterSummary {
  title: string;
  url: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  publishedDate: string;
}

/**
 * Canonical WordPress-compatible blog post model used by all React blog views.
 * Presentation components depend only on this interface, never on a specific CMS API.
 */
export interface BlogPost {
  id: string | number;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  /** Rendered HTML string from WordPress `content.rendered` (used when sourced from WP REST API). */
  contentHtml?: string;
  /** Structured editorial sections from existing travel guides or headless Gutenberg blocks. */
  sections?: GuideSection[];
  featuredImage: BlogFeaturedImage;
  author?: BlogAuthor;
  categories: BlogCategory[];
  tags: BlogTag[];
  publishedDate: string;
  publishedIso: string;
  modifiedDate: string;
  modifiedIso: string;
  seo: BlogSeoMetadata;
  status: BlogPostStatus;
  readingTime?: string;
  location?: string;
  relatedSlugs?: string[];
  /** Explicit origin tag so temporary reused content is clearly distinguishable from WP REST data. */
  source: 'guide-adapter' | 'wordpress-rest';
}

/**
 * Minimal typed shape of a WordPress REST API v2 post (`GET /wp-json/wp/v2/posts?_embed`).
 */
export interface WordPressRestPost {
  id: number;
  slug: string;
  status: BlogPostStatus;
  date: string;
  date_gmt?: string;
  modified: string;
  modified_gmt?: string;
  link?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories?: number[];
  tags?: number[];
  acf?: {
    reading_time?: string;
    location?: string;
    subtitle?: string;
  };
  yoast_head_json?: {
    title?: string;
    description?: string;
    canonical?: string;
    og_title?: string;
    og_description?: string;
    og_image?: Array<{ url?: string }>;
  };
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      description?: string;
      link?: string;
      avatar_urls?: Record<string, string>;
    }>;
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
      caption?: { rendered?: string };
      media_details?: { width?: number; height?: number };
    }>;
    'wp:term'?: Array<
      Array<{
        id: number;
        slug: string;
        name: string;
        taxonomy: 'category' | 'post_tag' | string;
        description?: string;
      }>
    >;
  };
}

/**
 * Data source abstraction allowing React blog views to swap between adapted
 * guide content, static snapshots, or live WordPress REST endpoints cleanly.
 */
export interface BlogDataSource {
  sourceName: string;
  getPosts: () => BlogPost[];
  getPublishedPosts: () => BlogPost[];
  getPostBySlug: (slug: string) => BlogPost | undefined;
  getCategories: () => BlogCategory[];
  getRelatedPosts: (post: BlogPost, limit?: number) => BlogPost[];
}

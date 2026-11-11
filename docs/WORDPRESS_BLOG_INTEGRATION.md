# Outbound Holidays — WordPress Blog Integration Guide

This document explains how the WordPress-ready React blog built inside Outbound Holidays (`src/types/blog.ts`, `src/data/blogData.ts`, `src/components/blog/*`) will integrate with WordPress during the future theme / headless conversion.

---

## 1. Component Mapping & Reusability

### Reusable React Components & Data Modules (Keep As-Is or Extend)
| Module | Responsibility | WordPress Integration Role |
| :--- | :--- | :--- |
| `src/types/blog.ts` | Canonical `BlogPost`, `BlogCategory`, `BlogTag`, `BlogAuthor`, `BlogFeaturedImage`, `BlogSeoMetadata`, `BlogDataSource`, `WordPressRestPost` contracts | Shared presentation & API contract; components depend only on `BlogPost` |
| `src/data/blogData.ts` | `adaptWordPressPostToBlogPost`, `fetchWordPressBlogPosts`, `createBlogDataAdapter`, `formatBlogPostForNewsletter` | Swap data provider from `adaptGuideArticleToBlogPost` to `adaptWordPressPostToBlogPost` without touching UI components |
| `src/components/blog/BlogListingPage.tsx` | `/blog` archive UI (heading, featured spotlight, search, category pills, responsive cards, pagination) | Reuse directly in headless WP / decoupled React frontend, or mirror markup in WordPress `archive.php` / `home.php` |
| `src/components/blog/BlogArticlePage.tsx` | `/blog/:slug` single post view (breadcrumbs, hero meta, share buttons, CTAs, related articles, structured data) | Reuse directly with `WordPressRestPost` adapted data, or translate sections into WordPress `single.php` |
| `src/components/blog/BlogContentRenderer.tsx` | Supports both `sections[]` blocks and sanitized WordPress `content.rendered` HTML | Renders native WordPress Gutenberg/Classic `post_content` via `contentHtml` immediately |
| `src/components/common/Newsletter.tsx` | Newsletter signup form (`compact` and full variants) backed by `/api/v1/submissions` | Keep single Neon PostgreSQL subscriber endpoint or bridge via WordPress form endpoint; do not create a duplicate subscriber DB |
| `src/components/common/WhatsAppButton.tsx` & `src/utils/whatsapp.ts` | Pre-filled WhatsApp specialist enquiry URLs | Reuse directly inside React or port `wa.me` URL helper to PHP template tags |

### Functions Requiring WordPress Theme / PHP Replacement (Only When Converting Theme)
If moving from React + Vite + Node prerendering to a server-rendered PHP WordPress theme (instead of headless WordPress + React):
- `src/routes.ts` & `PageLink.tsx` -> replaced by WordPress Permalinks and Rewrite Rules (`/%postname%/` or `/blog/%postname%/`).
- `scripts/prerender.tsx` & `src/components/common/PageMetadata.tsx` -> replaced by WordPress `wp_head()` + Yoast SEO / Rank Math PHP output.
- `BlogListingPage.tsx` state pagination/filtering -> replaced by native `WP_Query` / `paginate_links()` / `search.php` / `category.php` if converted to PHP templates, OR kept as React components if running headless WordPress.

---

## 2. WordPress Posts Integration (`wp/v2/posts`)

During React development, `src/data/blogData.ts` populates `BLOG_POSTS` by adapting existing travel guide articles (`ALL_GUIDE_ARTICLES`) through `adaptGuideArticleToBlogPost()`.

When WordPress becomes the live blog CMS:
1. Enable standard WordPress Posts REST API (`GET /wp-json/wp/v2/posts?_embed&status=publish`).
2. Call `fetchWordPressBlogPosts(WP_BASE_URL)` or map build-time fetched `WordPressRestPost[]` payloads with `adaptWordPressPostToBlogPost()` in `src/data/blogData.ts`.
3. Wrap results with `createBlogDataAdapter(wpPosts, 'wordpress-rest')` and expose them cleanly to `src/routes.ts`, `BlogListingPage`, and `BlogArticlePage`.
4. Ensure any article `status !== 'publish'` (`draft`, `pending`, `private`) is excluded by `getPublishedBlogPosts()`.

No competing custom CMS tables or blog editors are needed—WordPress `wp_posts` handles authoring, revisions, scheduling, and publication status natively.

---

## 3. Category & Tag Mapping

### Initial Categories (`INITIAL_BLOG_CATEGORIES` in `src/data/blogData.ts`)
Create these matching terms under **Posts -> Categories** in WordPress using identical slugs:
| Category Name | WordPress Slug |
| :--- | :--- |
| Victoria Falls Travel Guides | `victoria-falls-travel-guides` |
| Things to Do | `things-to-do` |
| Accommodation | `accommodation` |
| Family Holidays | `family-holidays` |
| Travel Tips | `travel-tips` |
| Local Experiences | `local-experiences` |
| Travel News | `travel-news` |

In `adaptWordPressPostToBlogPost()`:
- `_embedded['wp:term']` items with `taxonomy === 'category'` map into `BlogPost.categories`.
- `_embedded['wp:term']` items with `taxonomy === 'post_tag'` map into `BlogPost.tags`.
- `getBlogCategories()` merges `INITIAL_BLOG_CATEGORIES` with live post counts and appends any newly added WordPress categories automatically without editing components.

---

## 4. Featured Image & Embedded Media Handling

- WordPress `_embedded['wp:featuredmedia'][0]` maps to `BlogPost.featuredImage`:
  - `source_url` -> `featuredImage.url`
  - `alt_text` -> `featuredImage.alt` (falls back to `${title} — Victoria Falls` when empty)
  - `media_details.width` / `height` -> `featuredImage.width` / `height`
  - `caption.rendered` -> `featuredImage.caption`
- Inline Gutenberg image/gallery blocks inside `content.rendered` render through `BlogContentRenderer.tsx` with rounded corners (`rounded-2xl`), responsive full-width sizing, and preserved `alt` attributes.
- Ensure WordPress Media Library images always include descriptive `alt` text for accessibility and image search SEO.

---

## 5. Article URL Structure & Routing

- **Listing Page**: `/blog`
- **Single Article Page**: `/blog/:slug`
- **WordPress Permalink Setting**: Set **Settings -> Permalinks -> Custom Structure** to `/blog/%postname%/` (or map category archives to `/blog/category/%category%/` if separate archive URLs are later added).
- Existing guide URLs (`/victoria-falls-guide` and `/victoria-falls-guide/:slug`) remain untouched and keep their own distinct `<title>` tags. When guide content transitions exclusively to WordPress Posts, configure permanent `301` redirects if any guide URL is consolidated into `/blog/:slug` so existing organic rankings transfer cleanly.

---

## 6. SEO Metadata Integration

Each `BlogPost` expects `BlogSeoMetadata`:
- `metaTitle` (`<title>`)
- `metaDescription` (`<meta name="description">`)
- `canonicalUrl` (`<link rel="canonical">`)
- `ogTitle`, `ogDescription`, `ogImage` (`og:type="article"`, `og:image`, `og:title`, `og:description`, `og:url`)

### WordPress Plugin Integration (Yoast SEO / Rank Math)
`WordPressRestPost` in `src/types/blog.ts` already parses `yoast_head_json` (Yoast SEO automatically exposes this on `wp/v2/posts`). If using Rank Math, expose `rank_math` SEO fields in the REST response and map them in `adaptWordPressPostToBlogPost()`.

### Prerendering & Structured Data
- `scripts/prerender.tsx` generates static HTML for `/blog` and every published `/blog/:slug`, injecting unique `<title>`, `<meta name="description">`, canonical URLs, `og:type="article"`, `og:image`, and adding every post to `dist/sitemap.xml`.
- `BlogArticlePage.tsx` embeds `Article` and `BreadcrumbList` Schema.org JSON-LD directly in the rendered document so search engines index headlines, dates, authors, images, and breadcrumbs even before client hydration.

---

## 7. Newsletter Integration

- `BlogArticlePage.tsx` embeds `<Newsletter compact />` (`src/components/common/Newsletter.tsx`) near the bottom of every article, reusing the existing `/api/v1/submissions` + Neon PostgreSQL double-opt-in flow without adding a second subscriber database.
- `formatBlogPostForNewsletter(post)` in `src/data/blogData.ts` returns `{ title, url, excerpt, category, imageUrl, publishedDate }` so new WordPress blog posts can be linked directly inside Outbound Holidays newsletter sends (compatible with the existing workflow in `WORDPRESS_NEWSLETTER_MIGRATION.md`).

---

## 8. Migrating Existing Content to WordPress

The 11 guide articles in `src/runtime/published-content.json` (`guides`) currently power the blog temporarily via `adaptGuideArticleToBlogPost()`:
1. For each article in `published-content.json`, create a WordPress Post in `publish` status preserving the exact `slug` (e.g., `best-time-to-visit`, `where-to-stay-victoria-falls`, `getting-to-victoria-falls`).
2. Convert structured `sections[]` into WordPress Gutenberg blocks (`core/heading` H2/H3, `core/paragraph`, `core/list`, `core/image`, `core/quote`, `core/table`).
3. Assign the matching WordPress categories from the taxonomy table above and tags from `GUIDE_TAXONOMY_MAP`.
4. Upload `heroImageUrl` as the WordPress Featured Image with `heroImageAlt` as `alt_text`.
5. Copy `seo.metaTitle` and `seo.metaDescription` into Yoast SEO / Rank Math fields.
6. Switch `BLOG_DATA_ADAPTER` in `src/data/blogData.ts` to read the WordPress REST API payload (either at build time during `scripts/prerender.tsx` or via cached `/api/v1/content`).

# Outbound Holidays — Complete Project Audit & WordPress Conversion Matrix

## 1. Original Architecture Audited

Prior to building the standalone WordPress theme, the existing React + TypeScript + Express + Neon PostgreSQL project was audited across `src/`, `server/`, `shared/`, `prisma/`, `public/`, `scripts/`, and `src/runtime/published-content.json`.

| Domain / Layer | Legacy React/Express Implementation | Standalone WordPress Equivalent |
| :--- | :--- | :--- |
| Public Frontend | React 19 SPA (`src/App.tsx`, `src/components/*`) | Server-rendered PHP templates inside `wordpress-theme/outbound-holidays/` styled via `assets/css/outbound-theme.css` |
| Optimised Hero & Typography | `Cormorant Garamond` + `Manrope`, `.travel-hero` scrim, `#0B5E8E`, `#0D2833`, `#C9A66B`, `#3F6B3C`, `#FAF9F6` | Preserved verbatim via `theme.json`, Google Fonts enqueue (`inc/setup.php`), and `front-page.php` |
| Accommodations (`8` items) | `AccommodationDirectoryPage.tsx`, `AccommodationDetailPage.tsx` | CPT `accommodation`, taxonomy `accommodation_category`, `page-victoria-falls-accommodation.php`, `single-accommodation.php` |
| Experiences (`25` items) | `ExperienceDetailPage.tsx`, `ExperienceCategoryPage.tsx`, Boma & Bungee views | CPT `experience`, taxonomy `experience_category`, `page-things-to-do-in-victoria-falls.php`, `taxonomy-experience_category.php`, `single-experience.php`, rewrite routes `/the-boma-dinner/`, `/bungee-jump/` |
| Holiday Packages (`8` items) | `PackageDetailPage.tsx`, Packages archive view | CPT `package`, `page-victoria-falls-packages.php`, `single-package.php` |
| Planning Guides (`11` items) | `GuideHubView.tsx`, `GuideArticleTemplate.tsx` | CPT `guide_article`, `page-victoria-falls-guide.php`, `single-guide_article.php` |
| Editorial Blog | `BlogListingPage.tsx`, `BlogArticlePage.tsx`, `blogData.ts` | Native WordPress Posts (`post`), 7 WordPress `category` terms, `home.php`, `category.php`, `tag.php`, `search.php`, `single.php` |
| Client Gallery (`1` album) | `ClientGallery.tsx` | CPT `client_album`, `page-client-gallery.php` with native lightbox |
| Holiday Builder | `HolidayBuilderModal.tsx` + `/api/submissions` | Compiled local React Island `assets/js/holiday-builder.bundle.js` posting to WordPress REST `/wp-json/outbound/v1/enquiries` |
| Enquiries & Estimates | `server/submissions.ts` (`OH-YYYYMMDD-HEX`, estimate math) | `inc/enquiries.php` storing to `wp_outbound_enquiries`, server-side USD calculation, `Outbound Holidays → Enquiries` ledger |
| Newsletter & Outbox | `server/outbox.ts`, `server/newsletter/templates.ts`, Prisma `Subscription`/`Campaign` | `inc/newsletter.php` (`wp_outbound_subscribers`, `wp_outbound_campaigns`, `wp_outbound_notifications`), SHA-256 token hashing, DOI `/newsletter/confirmed/`, 4 templates, WP-Cron batch delivery, `phpmailer_init` SMTP |
| Site & Homepage CMS | `published-content.json` (`site`) | `inc/admin-settings.php` (`Outbound Holidays → Site & Homepage CMS` stored in `wp_options`) |
| SEO & Sitemaps | `SEO.md`, `scripts/prerender.tsx` | `inc/seo.php` (Canonical URLs, Meta descriptions, Open Graph, Schema.org JSON-LD, WordPress Sitemap, `robots.txt`, legacy 301 redirects) |

## 2. Plugin Independence Verification

- **No ACF required:** Native meta boxes (`inc/meta-boxes.php`) handle all structured CPT attributes and JSON repeaters cleanly.
- **No Contact Form 7 / WPForms required:** Custom validated REST endpoints (`inc/enquiries.php`, `inc/newsletter.php`) handle submissions with honeypot, DB rate limiting, and optional Cloudflare Turnstile.
- **No Brevo / Mailchimp / SaaS required:** All subscriber records, DOI tokens, campaign drafts, templates, and delivery queues live natively in WordPress custom tables.
- **Zero React/Express/Neon runtime dependency:** Once migrated and media is sideloaded into the WordPress Media Library, WordPress operates 100% independently.

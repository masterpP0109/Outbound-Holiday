# Root Cause Analysis — WordPress Theme Fidelity & Upload Failure Resolution

## 1. Visual & Structural Divergence (Initial Conversion vs. Approved React Site)

### Root Cause
In the initial WordPress theme attempt, frontend PHP templates (`front-page.php`, `header.php`, `footer.php`, `page-victoria-falls-accommodation.php`, and archive/detail templates) manually reimplemented simplified HTML equivalents instead of preserving the actual React components (`src/App.tsx`, `src/components/travel/*`, `src/components/common/*`, `src/components/blog/*`) and `src/index.css`.

That rewrite caused:
- Header navigation bar mismatch (reordered links, extra utility bar, different logo sizing, missing active dot indicator).
- Homepage Hero mismatch (different headline copy, alignment, height rules, overlay gradient calibration, and button spacing).
- Simplified directory/detail cards and missing interactive components (`AccommodationAdvisor`, interactive filters, `PlanHolidayModal`, full `HolidayBuilderModal`, `VicFallsGuide` structured blocks).
- URL slug mismatches between WordPress CPT rewrites (`/victoria-falls-accommodation/{slug}`, `/things-to-do-in-victoria-falls/{slug}`, `/newsletter/confirmed`) and canonical React routes in `src/routes.ts` (`/accommodation/{slug}`, `/things-to-do/{slug}`, `/packages/{slug}`, `/newsletter-confirmed`).

### Fix Applied (Architectural Correction)
Replaced the simplified PHP HTML templates with a **Hybrid WordPress Theme Architecture** preserving 100% of the approved React UI while moving CMS, database, email, and routing authority completely into WordPress:
1. Compiled the actual React application (`wordpress-theme/app-src/wp-main.tsx` -> `src/App.tsx` + `src/index.css`) cleanly into self-contained IIFE theme assets (`assets/app/outbound-app.js` + `assets/app/outbound-app.css`).
2. Added `inc/snapshot.php` to assemble the canonical `ContentSnapshot` dynamically from WordPress `wp_options` (`Site & Homepage CMS`), Custom Post Types (`accommodation`, `experience`, `package`, `guide_article`, `client_album`), native WordPress Blog `post` / `category` / `post_tag` queries (`WordPressRestPost[]`), and bundled defaults (`inc/default-snapshot.json`), exposing both inline boot JSON (`#outbound-content`, `#outbound-wp-posts`) and REST endpoints (`GET /wp-json/outbound/v1/snapshot`, `GET /wp-json/outbound/v1/posts`).
3. Aligned `inc/post-types.php` CPT permalinks and rewrite rules with `src/routes.ts` and dequeued interfering WordPress Core block styles (`global-styles`, `wp-block-library`, `classic-theme-styles`) inside `inc/setup.php`.
4. Kept semantic crawler/SEO SSR content inside `<div id="root">` (`template-parts/app-ssr-shell.php`, `home.php`, `single.php`) and `<head>` JSON-LD / Open Graph / canonical tags in `inc/seo.php`.

## 2. WordPress Theme Upload Error (`"File is empty. Please upload something more substantial."`)

### Root Cause
The previous `wordpress-theme/outbound-holidays.zip` measured `~9.33 MB` because `assets/media/` bundled 4 uncompressed PNG/JPG fallback images (`8.75 MB`). Standard PHP/WordPress installations set `upload_max_filesize = 2M` and `post_max_size = 8M`, which silently discard multi-megabyte uploads exceeding server limits and trigger WordPress's *"post_max_size / upload_max_filesize"* error.

### Fix Applied
- Converted all fallback theme media inside `assets/media/` cleanly to WebP (`hero-victoria-falls.webp`, `falls-fallback.webp`, `safari-fallback.webp`, `family-fallback.webp`, `honeymoon-fallback.webp`, `outbound-holidays-logo.webp`).
- Consolidated the frontend app cleanly into a single compressed IIFE JS/CSS pair (`assets/app/outbound-app.js` + `assets/app/outbound-app.css`), removing legacy redundant scripts (`theme-ui.js`, `holiday-builder.bundle.js`, `outbound-theme.css`).
- Reduced the packaged installable theme archive `wordpress-theme/outbound-holidays.zip` to **`1,208 KB` (`1.18 MB`)** — safely below the default PHP `2 MB` upload ceiling.

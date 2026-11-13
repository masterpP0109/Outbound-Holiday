# Feature Verification & Visual Parity Report (Post-Correction)

## 1. Visual & Structural Fidelity Verification (Original React `dist/` vs. WordPress Theme)
Verified via `scripts/verify-wp-theme-playwright.mjs` using real Chromium against both:
- Original compiled React production build (`http://127.0.0.1:4173`, `dist/`)
- Rendered WordPress PHP Theme templates (`http://127.0.0.1:8089`, `tests/wp-render-harness.php`)

### Automated Checks Executed (1440px Desktop, 768px Tablet, 375px Mobile)
- **Routes Audited Side-by-Side (7 routes × 3 viewports = 21 route-viewport pairs on each site):**
  `/`, `/victoria-falls-accommodation`, `/things-to-do-in-victoria-falls`, `/victoria-falls-packages`, `/blog`, `/blog/first-time-visitor-guide`, `/contact`
- **Verified Metrics (`parity-metrics.json` + Playwright assertions):**
  - Header computed height matches exactly (`124px` desktop, `116px` tablet) between React & WordPress.
  - Hero `<h1>` (`152px` desktop, `96px` tablet) and every subpage `<h1>` computed font family, font size, and text match 100%.
  - Zero horizontal overflow (`scrollWidth <= innerWidth + 1`) across all viewports.
  - Zero broken `<img>` elements (`complete && naturalWidth > 0`) on Homepage Hero (`hero-victoria-falls.webp`), listings, cards, and modals.
  - Zero WordPress console errors, page errors, or failed theme asset HTTP responses.

### Verified Interactive End-to-End Flows on WordPress Theme
- **Plan Your Trip / Holiday Builder Modal:** Opens from Hero CTA (`Plan Your Trip`), toggles Quick Enquiry & Interactive Builder cleanly.
- **Where to Stay Directory:** Category tabs (`All Stays (8)`, `Hotels (2)`, `Lodges (2)`, `Guest Houses (3)`, `Apartments (1)`) filter dynamically with active badge and count update (`Hotels (2)`).
- **Contact Form REST Submission:** Form POST to `/wp-json/outbound/v1/enquiries` persists & renders confirmation screen with generated reference (`OH-YYYYMMDD-XXXXXX`).
- **PHP Unit & Theme Integrity Suite (`php tests/wp-theme-php.test.php`):** All `10` checks pass, including `php -l` across all `40` theme PHP files, holiday estimate math parity, accommodation filtering/sorting, SHA-256 newsletter tokens, 4 email templates, and SEO JSON-LD output.
- **Original React App Safety & Tests:** `npm run typecheck`, `npx vite build` (`2143 modules transformed`), and unit suites `tests/accommodation.test.ts` (`6/6`), `tests/blog.test.ts` (`3/3`), and `tests/newsletter.test.ts` (`5/5`) pass with exit code `0`. Note: `tsx scripts/prerender.tsx` (`npm run build` step 2) failed against the configured remote `VITE_API_BASE_URL` returning HTTP `502`, and `tests/import-preservation.test.ts` requires an isolated local Postgres instance (`Isolated local database required.`).

## 2. Live WordPress + MySQL Staging Checks Remaining
Because local CLI execution uses the PHP render harness (`tests/wp-render-harness.php`) without a live MySQL WordPress daemon, verify these items directly after uploading `wordpress-theme/outbound-holidays.zip` (`1,208 KB` / `1.18 MB`) to a live WordPress instance:
1. Confirm `Appearance → Themes → Upload Theme` accepts `outbound-holidays.zip` (`1.18 MB`) cleanly and `wp_outbound_*` tables initialize on activation.
2. Run **One-Click Import Built-in Theme Content** (and **Sideload remote/Neon images into WordPress Media Library** if migrating external URLs into `wp-content/uploads/`).
3. Configure `Settings → Permalinks` (`/blog/%postname%/`) and test editing a CPT post & `Site & Homepage CMS` field in live WP Admin to verify instant frontend update and WP Admin Bar offset when logged in.
4. Configure SMTP + SPF/DKIM/DMARC under `Outbound Holidays → Setup & Email Health`, enable live dispatch, and test Double Opt-In confirmation `/newsletter-confirmed/?action=confirm&token=...`.

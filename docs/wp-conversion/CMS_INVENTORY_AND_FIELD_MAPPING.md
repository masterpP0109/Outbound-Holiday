# Outbound Holidays — Complete Frontend-to-CMS Inventory & Field Mapping

**Theme:** `wordpress-theme/outbound-holidays/` (v1.0.0)
**Unified Admin Hub:** `wp-admin/admin.php?page=outbound-cms` (**Outbound CMS**, 14 sections in `inc/cms-hub.php`)
**Snapshot Architecture:** React components read from `ContentSnapshot` (`shared/content-schema.ts`, strict Zod `SiteSchema`), hydrated by `outbound_build_live_snapshot()` (`inc/snapshot.php`) using effective state from `outbound_get_effective_cms_bundle($is_preview)` (`inc/helpers.php`).

---

## 1. Draft, Private Preview & Publishing Storage Model

| Layer | WordPress Option / Storage | Visibility Scope |
|---|---|---|
| Unpublished Staging Draft | `outbound_cms_draft_state` | Visible **only** when `outbound_is_preview_request()` is true (`?outbound_preview=1` AND `current_user_can('manage_options')`), bypassing `outbound_live_snapshot_v1` transient cache with `Cache-Control: no-store, private` headers. |
| Site Brand, Contact, Section Visibility, Social | `outbound_site_cms_options` | Live public snapshot + `/wp-json/outbound/v1/snapshot` |
| Editorial String Overrides (`site.editorial.strings`) | `outbound_editorial_overrides` | Live public snapshot |
| Editorial Structure Overrides (`site.editorial.structures`) | `outbound_editorial_struct_overrides` | Live public snapshot (also includes `cms/homepage.sections` & `cms/design.tokens`) |
| Featured Homepage Picks (`site.featured`) | `outbound_featured_overrides` | Overrides `accommodationIds`, `experienceIds`, `packageIds` |
| Route SEO Overrides (`site.routeSeo`) | `outbound_route_seo_overrides` | Per-route `title` & `description` consumed by `PageMetadata` and `routes.ts` |
| Currency Conversion Rates | `outbound_currency_rates_override` | Overrides `USD`, `GBP`, `EUR`, `ZAR`, `ZWL` multipliers |
| Guest Testimonials (`site.legacy.TRAVEL_REVIEWS`) | `outbound_reviews_override` | Repeater list of guest reviews |
| Holiday Builder Options | `outbound_builder_stay_tiers`, `outbound_builder_activities` | Live Holiday Builder modal tiers & activity add-on pricing |
| Design Tokens | `outbound_design_tokens` | CSS custom property overrides (`--vf-blue`, `--golden-savannah`, `--sunset-orange`, `--zambezi-green`, `--charcoal-grey`) |

---

## 2. Frontend Component -> Outbound CMS Field Mapping

| Page / Route | React Component | Frontend Element | Outbound CMS Section | CMS Field / Editorial Key | WordPress Storage |
|---|---|---|---|---|---|
| Global | `src/App.tsx` | Draft Preview Admin Banner | Header Bar / Preview Mode | `isPreview`, `cmsAdminUrl` | Runtime `window.__OUTBOUND_WP_CONFIG__` (`inc/setup.php`) |
| Global | `src/App.tsx` | Design Palette CSS Variables | **13. Design & Layout** | `cms/design.tokens` (`primaryColor`, `secondaryColor`, `accentColor`, `greenColor`, `darkColor`) | `outbound_design_tokens` |
| Global | `src/components/common/Header.tsx` | Brand Logo (`<img>`) | **10. Header & Navigation** | `common/Header.outboundLogo` (or WP `custom_logo`) | `outbound_editorial_overrides` / Theme Mod |
| Global | `src/components/common/Header.tsx` | Announcement Badge, Tagline, Concierge Label | **10. Header & Navigation** | `common/Header.text1`, `common/Header.text2`, `common/Header.text3` | `outbound_editorial_overrides` |
| Global | `src/components/common/Header.tsx` | Nav Links, Search Placeholder, CTA Button | **10. Header & Navigation** | `common/Header.text5`–`common/Header.text13` | `outbound_editorial_overrides` |
| Global | `src/components/common/Header.tsx` | Currency Switcher Multipliers | **11. Footer & Global Content** | Currency table (`USD`, `GBP`, `EUR`, `ZAR`, `ZWL`) | `outbound_currency_rates_override` |
| Global | `src/components/common/Footer.tsx` | Footer Logo, Brand Summary, License, Copyright, Payments | **11. Footer & Global Content** | `common/Footer.outboundLogo`, `text3`, `text4`, `text16`, `text17`, `text19`–`text22` | `outbound_editorial_overrides` + `outbound_site_cms_options` |
| Global | `src/components/common/Footer.tsx` | Google Reviews Badge & Link | **11. Footer & Global Content** | `common/Footer.googleReviewsLabel`, `googleReviewsRating`, `googleReviewsUrl` | `outbound_editorial_overrides` |
| Global | `src/components/common/Newsletter.tsx` | Travel Club Banner Copy & Subscribe Button | **11. Footer & Global Content** | `common/Newsletter.text1`–`text3`, `text6`, `text7` | `outbound_editorial_overrides` |
| Global | `src/components/common/PageMetadata.tsx` | Document Title & Meta Description | **14. SEO & Publishing** | Per-route SEO table (`site.routeSeo[path]`) | `outbound_route_seo_overrides` |
| Homepage `/` | `src/App.tsx` | Section Visibility Toggles | **2. Homepage & Hero** | `cms/homepage.sections` (`showQuickPlanning` .. `showFinalCta`, `showNewsletter`) | `outbound_site_cms_options['homepageSections']` |
| Homepage `/` | `src/components/travel/TravelHero.tsx` | Eyebrow, Custom Headline, Subtitle, CTA, Hero Image & Alt | **2. Homepage & Hero** | `travel/TravelHero.eyebrow`, `headlineLine1`, `headlineLine2`, `subtitle`, `ctaLabel`, `text10`, `heroImage`, `heroImageAlt`, `text1`–`text13` | `outbound_editorial_overrides` |
| Homepage `/` | `src/components/travel/QuickPlanningBar.tsx` | Heading & 4 Quick Planning Cards | **2. Homepage & Hero** | `travel/QuickPlanningBar.text1`–`text5`, `copy1`–`copy3`, `topExperiencesSubtitle` | `outbound_editorial_overrides` |
| Homepage `/` | `src/components/travel/FeaturedExperiences.tsx` | Headings, Card Copy, Featured Selection | **3. Experiences** & **2. Homepage & Hero** | `travel/FeaturedExperiences.text1`–`text6` + `featured.experienceIds` + CPT `experience` | `outbound_editorial_overrides`, `outbound_featured_overrides`, WP CPT `experience` |
| Homepage `/` | `src/components/travel/FeaturedPackages.tsx` | Headings, Disclaimer, Featured Selection | **5. Holiday Packages** & **2. Homepage & Hero** | `travel/FeaturedPackages.text1`–`text4`, `text8`, `text9` + `featured.packageIds` + CPT `package` | `outbound_editorial_overrides`, `outbound_featured_overrides`, WP CPT `package` |
| Homepage `/` | `src/components/travel/WhereToStaySection.tsx` | Headings, Badges, Featured Properties | **4. Accommodation** & **2. Homepage & Hero** | `travel/WhereToStaySection.text1`–`text8` + `featured.accommodationIds` + CPT `accommodation` | `outbound_editorial_overrides`, `outbound_featured_overrides`, WP CPT `accommodation` |
| Homepage `/` | `src/components/travel/VicFallsGuide.tsx` | Section Badge, Heading, CTA | **6. Guides & Articles** | `travel/VicFallsGuide.text9`, `text10`, `text12` + CPT `guide_article` + WP `post` | `outbound_editorial_overrides`, WP CPT `guide_article`, WP `post` |
| Homepage `/` | `src/components/travel/WhyChooseOutbound.tsx` | Section Heading, 4 Cards Repeater, Budget Callout | **2. Homepage & Hero** | `travel/WhyChooseOutbound.text13`, `text14`, `section1` (repeater), `text16`–`text18` | `outbound_editorial_overrides`, `outbound_editorial_struct_overrides` |
| Homepage `/` | `src/components/travel/TravellerStories.tsx` | Section Headings, Score Card, Google Link, Reviews Repeater | **8. Testimonials & Reviews** | `travel/TravellerStories.badge`, `heading`, `subheading`, `score`, `cardTitle`, `ctaLabel`, `reviewUrl` + `TRAVEL_REVIEWS` | `outbound_editorial_overrides`, `outbound_reviews_override` |
| Homepage `/` | `src/components/travel/ClientGallery.tsx` | Client Photo Albums | **7. Galleries & Media** | CPT `client_album` + WordPress Media Library | WP CPT `client_album` |
| Homepage `/` | `src/components/travel/FinalCtaBanner.tsx` | Eyebrow, Heading, Copy, CTA Labels | **2. Homepage & Hero** | `travel/FinalCtaBanner.text1`–`text5` | `outbound_editorial_overrides` |
| `/about` | `src/components/travel/AboutPage.tsx` | Founder Headline, Bio, Story Paragraphs | **9. About & Contact** | `travel/AboutPage.text10`, `text11`, `text14`, `text15`, `text18`–`text20` | `outbound_editorial_overrides` |
| `/contact` & Global | `src/components/travel/ContactUsView.tsx`, `src/utils/whatsapp.ts` | WhatsApp Digits, Display Phone, Email, Address, Hours, Intro | **9. About & Contact** | `site.contact.*`, `travel/ContactUsView.text2`–`text7` | `outbound_site_cms_options['contact']`, `outbound_editorial_overrides` |
| Holiday Builder Modal | `src/components/travel/HolidayBuilderModal.tsx` | Accommodation Stay Tiers & Activity Add-Ons | **12. Holiday Builder Settings** | `stayTiers[]`, `builderActivities[]` | `outbound_builder_stay_tiers`, `outbound_builder_activities` |

---

## 3. Coverage Gaps & Verification Status

### Current Intentional Scope Boundaries
- Deep component copy across secondary detail modals/views outside the primary homepage/brand/directory/SEO controls remains pre-seeded cleanly inside `inc/default-snapshot.json` (`1,535` editorial keys), with override hooks available via `outbound_editorial_overrides`.
- Core directory item details (room types, multi-day package itineraries, multi-section planning guides, album photo lists) are intentionally edited inside their native WordPress CPT Edit screens (`inc/meta-boxes.php`) rather than duplicated inside `Outbound CMS`.

### Verification Boundaries (Local Harness vs Pending WordPress + MySQL Staging)
- **Verified locally:**
  - `npm run typecheck` (`tsc --noEmit`)
  - `npx vite build` & `node scripts/build-wp-theme.mjs` (bundle & ZIP `< 2 MB` generation)
  - `php tests/wp-theme-php.test.php` (PHP 8.3 syntax lint across all theme files, Outbound CMS 14-section sanitization, Draft vs Public isolation, Admin Preview hydration, Publish Changes, Discard Draft)
  - `node scripts/verify-wp-theme-playwright.mjs` (Chromium Desktop/Tablet/Mobile React vs WordPress visual/H1/header parity + interactive contact/newsletter + CMS Draft Preview banner & CSS variable override check)
- **Pending live server verification (blocked while `https://outboundholiday.com/` returns APISIX `HTTP 502 Bad Gateway`):**
  - Uploading and activating `wordpress-theme/outbound-holidays.zip` inside live `/wp-admin/` on PHP + MySQL.
  - Verifying WP Media Library `wp.media` modal interactions, `WP_Query` pagination across large CPT datasets, real logged-in WordPress cookie + `X-WP-Nonce` draft preview requests, and live REST form persistence against MySQL tables.

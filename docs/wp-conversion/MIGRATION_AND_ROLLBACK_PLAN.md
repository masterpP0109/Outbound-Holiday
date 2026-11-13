# Migration & Rollback Plan — Outbound Holidays WordPress Conversion

## 1. Theme Installation & Content Seeding
1. Upload `wordpress-theme/outbound-holidays.zip` (`1,208 KB` / `1.18 MB` — compliant with standard PHP `2 MB` `upload_max_filesize`) under **WordPress Admin → Appearance → Themes → Add New → Upload Theme**, then click **Activate**.
2. On activation (`after_switch_theme`), WordPress automatically:
   - Installs/updates custom tables (`wp_outbound_subscribers`, `wp_outbound_campaigns`, `wp_outbound_enquiries`, `wp_outbound_notifications`, `wp_outbound_rate_limits`).
   - Registers CPTs (`accommodation`, `experience`, `package`, `guide_article`, `client_album`) matching `src/routes.ts`.
   - Creates required WordPress Pages (`/victoria-falls-accommodation`, `/things-to-do-in-victoria-falls`, `/victoria-falls-packages`, `/victoria-falls-guide`, `/client-gallery`, `/about`, `/contact`, `/blog`, `/newsletter-confirmed`) and configures `Settings → Reading`.
3. Open **Outbound Holidays → Content Migration**:
   - Click **One-Click Import Built-in Theme Content into WordPress** (reads bundled `inc/default-snapshot.json`) — OR upload `docs/wp-conversion/outbound-migration-bundle.json` and check **Sideload remote/Neon images into WordPress Media Library** so all media files are copied cleanly into `wp-content/uploads/` for full external-host independence.
   - Verify **Published Counts**: `8` accommodations, `25` experiences, `8` packages, `11` planning guides, `1` client album, `11+` blog posts.
   - Or run via WP-CLI: `wp outbound migrate docs/wp-conversion/outbound-migration-bundle.json --sideload-media`.

## 2. Permalink Setup
- Under **Settings → Permalinks**, choose **Custom Structure** `/blog/%postname%/` (recommended so native posts resolve cleanly at `/blog/{slug}/`) and click **Save Changes** to flush rewrite rules.

## 3. Zero-Downtime Rollback Plan
- Original React, Express (`server/`), Prisma (`prisma/`), static `public/`, and Vite configuration remain untouched on `main` (`npm run build` verified cleanly after all conversion edits).
- If immediate rollback from WordPress is ever required, repoint DNS/reverse proxy back to the static/Express origin without data loss.
- Enquiries and newsletter subscribers captured during WordPress operation can be exported anytime as CSV/JSON under `Outbound Holidays → Enquiries` and `Outbound Holidays → Newsletter`.

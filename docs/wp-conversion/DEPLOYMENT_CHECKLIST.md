# Outbound Holidays — WordPress Deployment Checklist

## Pre-Deployment Preparation
1. Verify TypeScript & original React build cleanly: `npm run typecheck` and `npm run build`.
2. Rebuild hybrid theme assets & installable ZIP: `node scripts/build-wp-theme.mjs` -> verify `wordpress-theme/outbound-holidays.zip` (`~1.18 MB`, safely under standard PHP `2 MB` `upload_max_filesize`).

## Theme Installation & Configuration
3. Upload & Activate `wordpress-theme/outbound-holidays.zip` under **Appearance → Themes → Add New → Upload Theme**.
4. Open **Settings → Permalinks**, select **Custom Structure** `/blog/%postname%/`, and click **Save Changes**.
5. Open **Outbound Holidays → Setup & Email Health**, confirm all 5 database tables (`wp_outbound_subscribers`, `wp_outbound_campaigns`, `wp_outbound_enquiries`, `wp_outbound_notifications`, `wp_outbound_rate_limits`) and all 10 Core Pages show green badges.
6. Open **Outbound Holidays → Content Migration** and run **One-Click Import Built-in Theme Content into WordPress** (optionally tick **Sideload remote/Neon images** or upload `docs/wp-conversion/outbound-migration-bundle.json` so images live inside `wp-content/uploads/`).
7. Verify homepage/contact/legal overrides under **Outbound Holidays → Site & Homepage CMS** and upload your custom site logo under **Appearance → Customize → Site Identity** if desired.

## SMTP, Turnstile & Security Verification
8. Add `OUTBOUND_SMTP_HOST`, `OUTBOUND_SMTP_PORT`, `OUTBOUND_SMTP_USER`, `OUTBOUND_SMTP_PASS` in `wp-config.php` or **Setup & Email Health**.
9. Verify SPF, DKIM, and DMARC DNS TXT records for your sending domain, then run the **Send Test Email Now** tool.
10. Enable live newsletter campaigns ONLY after SMTP delivery & reputation checks pass.
11. Add Cloudflare Turnstile Site & Secret keys in **Setup & Email Health** if Turnstile protection is desired on production.

## Post-Launch SEO & Smoke Verification
12. Test canonical URLs, `<title>`, meta descriptions, and Schema.org JSON-LD on `/`, `/victoria-falls-accommodation`, `/things-to-do-in-victoria-falls`, `/victoria-falls-packages`, `/blog`, and `/victoria-falls-guide`.
13. Confirm `/wp-sitemap.xml` and `/robots.txt` load cleanly.
14. Test Holiday Builder modal + Contact Form submission (`/wp-json/outbound/v1/enquiries`) + Newsletter Double Opt-In confirmation `/newsletter-confirmed/?action=confirm&token=...`.
15. Verify responsive views (`375px`, `768px`, `1440px`) across desktop, tablet, and mobile browsers.

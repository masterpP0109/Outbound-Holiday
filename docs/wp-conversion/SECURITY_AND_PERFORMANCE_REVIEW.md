# Outbound Holidays — WordPress Security & Performance Review

## 1. Security Controls Implemented

1. **SQL Injection Prevention:** All custom table reads/writes (`inc/enquiries.php`, `inc/newsletter.php`, `inc/migrations.php`) use parameterized `$wpdb->prepare()` queries or typed `$wpdb->insert` / `$wpdb->update` arrays.
2. **XSS & JSON Script Escaping:** Inline snapshot and config JSON (`header.php`, `inc/setup.php`) use `wp_json_encode(..., JSON_HEX_TAG | JSON_UNESCAPED_SLASHES)`, preventing `</script>` tag injection. WordPress template outputs use `esc_attr`, `esc_html`, `esc_url`, and `wp_kses_post`.
3. **CSRF & Capability Enforcement:** Every WordPress Admin form verifies a dedicated nonce (`check_admin_referer` / `wp_nonce_field`) and checks `current_user_can('manage_options')` or `edit_post`. Public REST writes support WordPress `X-WP-Nonce` verification alongside idempotency keys.
4. **Secret Handling:** SMTP credentials and Turnstile secret keys support `wp-config.php` constants (`OUTBOUND_SMTP_PASS`, `OUTBOUND_TURNSTILE_SECRET_KEY`), preventing plaintext secret commits.
5. **Cryptographic Token Hygiene:** Newsletter confirmation & unsubscribe tokens use `bin2hex(random_bytes(32))` and store only SHA-256 digests (`hash('sha256', $token)`).
6. **Abuse & Spam Protection:** Public form endpoints enforce honeypot traps, Cloudflare Turnstile server-side verification, and hashed-IP sliding-window DB rate limiting (`wp_outbound_rate_limits`).

## 2. Performance & Packaging Optimizations

1. **Zero Heavy Third-Party Plugins:** No ACF, Elementor, Contact Form 7, Yoast, or external newsletter plugins required.
2. **Self-Contained Hybrid Assets (`assets/app/`):** Compiled Vite Tailwind v4 CSS (`outbound-app.css`, ~102 KB uncompressed / ~16 KB gzipped) + single IIFE React bundle (`outbound-app.js`, ~1,460 KB uncompressed / ~350 KB gzipped) prevent external JS chunk waterfall 404s.
3. **Style Isolation:** Dequeues conflicting WordPress Core stylesheets (`wp-block-library`, `global-styles`, `classic-theme-styles`) on frontend pages (`inc/setup.php`) so Tailwind design tokens apply cleanly with zero override bloat.
4. **Upload-Safe WebP Package:** Converting fallback photography inside `assets/media/` to `.webp` reduced `wordpress-theme/outbound-holidays.zip` from `9.33 MB` down to `1,208 KB` (`1.18 MB`), avoiding PHP default `upload_max_filesize` (`2 MB`) errors.

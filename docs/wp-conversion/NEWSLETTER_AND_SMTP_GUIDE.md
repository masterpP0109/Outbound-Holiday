# Outbound Holidays — Newsletter & SMTP Operations Guide

## 1. Architecture Summary

Newsletter subscriptions, confirmation tokens, campaign composition, branded templates, and delivery queues live natively in WordPress via `inc/newsletter.php` and three custom tables:

1. `wp_outbound_subscribers`: Tracks subscriber email, name, signup source, consent version (`travel-club-2026-10`), `status` (`pending | confirmed | unsubscribed`), `confirm_token_hash` (SHA-256), `unsubscribe_token_hash` (SHA-256), timestamps, and hashed IP.
2. `wp_outbound_campaigns`: Stores drafts, scheduled dates (`scheduled_at`), selected template (`seasonal-spotlight`, `experience-feature`, `accommodation-guide`, `plain-editorial`), CTA button config, batch progress counters (`recipient_count`, `sent_count`, `failed_count`).
3. `wp_outbound_notifications`: Queue and audit ledger recording every individual email dispatch attempt, error messages, retry counts, and `sent_at` timestamp.

## 2. Double Opt-In & Unsubscribe Lifecycle

1. Visitor submits email via Homepage Band, Blog Compact Form, Holiday Builder opt-in, or Contact Form opt-in -> `POST /wp-json/outbound/v1/newsletter`.
2. WordPress checks honeypot + DB sliding-window rate limit (`6` attempts / `10 minutes`), saves/updates row as `pending`, generates a 64-character `bin2hex(random_bytes(32))` token, stores only `hash('sha256', $token)`, and dispatches the branded confirmation email.
3. Visitor clicks `/newsletter/confirmed/?action=confirm&token=<raw>` -> token hash verified -> expiry (72 hours) checked -> subscriber marks `confirmed`.
4. Every dispatched newsletter campaign rotates an individual unsubscribe hash and embeds a one-click link `/newsletter/confirmed/?action=unsubscribe&token=<raw>` in the footer. Clicking immediately sets `status = 'unsubscribed'` so suppressed addresses are never sent future campaigns.

## 3. SMTP & Deliverability Safety Gate

Configure SMTP either in **wp-config.php** (recommended for production secrets):

```php
define('OUTBOUND_SMTP_HOST', 'smtp.yourprovider.com');
define('OUTBOUND_SMTP_PORT', 587);
define('OUTBOUND_SMTP_SECURE', 'tls');
define('OUTBOUND_SMTP_USER', 'postmaster@outboundholidays.co.zw');
define('OUTBOUND_SMTP_PASS', 'YOUR_SECRET_APP_PASSWORD');
define('OUTBOUND_SMTP_FROM_EMAIL', 'newsletter@outboundholidays.co.zw');
define('OUTBOUND_SMTP_FROM_NAME', 'Outbound Holidays');
```

or inside **Outbound Holidays → Setup & Email Health**.

### Live Campaign Lock
- By default, **Enable live campaign sending** is **OFF**.
- While locked, administrators can compose campaigns, preview branded templates, and send **Test Emails**, while batch dispatch to subscribers stays safely blocked until SPF, DKIM, DMARC, and provider daily quota limits are verified.

## 4. Subscriber Exports & Portability

Inside **Outbound Holidays → Newsletter**, click **Export Subscribers CSV** or **Export JSON** anytime to download confirmed/pending/suppressed rosters with consent audit metadata.



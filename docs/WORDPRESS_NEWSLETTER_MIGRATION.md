# OUTBOUND HOLIDAYS — NEWSLETTER SYSTEM TO WORDPRESS MIGRATION BLUEPRINT

## 1. Executive Architecture Overview

This blueprint provides the complete technical specification for migrating the Outbound Holidays newsletter and campaign management system from the current React, TypeScript, Express, and Neon PostgreSQL stack into a future WordPress theme and companion plugin.

The newsletter system in the React application was deliberately engineered with an isolated, layered architecture:
- **Presentation Layer**: Pure HTML/CSS UI components with zero heavy framework-specific lock-in.
- **Business Logic Layer**: Modular subscription validation, double opt-in verification, campaign creation, and unsubscribe suppression.
- **Data Persistence Layer**: Clean relational schema (subscribers, campaigns, delivery queue).
- **Email Delivery Transport**: Configurable SMTP abstraction with connection pooling, message ID generation, and rate limiting.

---

## 2. Component Conversion & Reuse Breakdown

| Component | Current Stack (React / Node / Prisma) | Future WordPress Theme / Plugin | Conversion Action |
| :--- | :--- | :--- | :--- |
| **Subscription Form UI** | `src/components/common/Newsletter.tsx` | PHP Template part / Gutenberg Block / Shortcode `[outbound_newsletter]` | **Direct HTML/Tailwind Reuse** (Convert JSX to PHP/HTML) |
| **Spam / Bot Protection** | `SubmissionSafety.tsx` (Turnstile + honeypot) | WordPress REST API endpoint + Turnstile hook | **Direct Reuse** (Same Turnstile keys & secret verify) |
| **Subscriber Model** | `Subscription` table in PostgreSQL | `wp_outbound_subscribers` custom table | **Direct Schema Port** (DDL provided below) |
| **Campaign Model** | `Campaign` table in PostgreSQL | Custom Post Type `outbound_campaign` or `wp_outbound_campaigns` | **Direct Schema Port** |
| **Batch Delivery Queue** | `Notification` table + PostgreSQL advisory locks | WordPress **Action Scheduler** (`as_enqueue_async_action`) | **Adapter Rewrite** to PHP Action Scheduler |
| **Email Transport** | `nodemailer` SMTP (`server169.web-hosting.com`) | `wp_mail()` hooked into PHPMailer SMTP | **Configuration Reuse** (Same SMTP credentials) |
| **Email Templates** | `server/newsletter/templates.ts` (Victoria Falls templates) | PHP template renderer / Twig / Timber | **Direct HTML/CSS Reuse** (Variables translated to `sprintf` or tokens) |
| **Admin Console** | `NewsletterAdmin.tsx` React component | WordPress Admin Submenu (`Outbound > Newsletter`) | **Embed React in WP Admin** or port to native WP tables |
| **Unsubscribe & DOI Handler**| Express `/api/v1/newsletter/confirm` & `/unsubscribe` | WP REST API `/wp-json/outbound/v1/confirm` & `/unsubscribe` | **PHP Rewrite** (1:1 logic port) |

---

## 3. Database Schema Mapping & DDL for WordPress

WordPress stores generic content in `wp_posts` and `wp_postmeta`. For high-volume newsletter subscribers, GDPR auditability, and outbox performance, a dedicated custom table design is strongly recommended over postmeta.

### 3.1 Subscriber Custom Table (`wp_outbound_subscribers`)

```sql
CREATE TABLE `wp_outbound_subscribers` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `status` ENUM('pending', 'subscribed', 'unsubscribed') NOT NULL DEFAULT 'pending',
  `consent_version` VARCHAR(64) NOT NULL,
  `consent_at` DATETIME NOT NULL,
  `confirmed_at` DATETIME NULL,
  `unsubscribed_at` DATETIME NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `provider_id` VARCHAR(128) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  UNIQUE KEY `idx_token_hash` (`token_hash`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.2 Campaign Table (`wp_outbound_campaigns`)

Alternatively implemented as a WordPress Custom Post Type (`outbound_campaign`):

```sql
CREATE TABLE `wp_outbound_campaigns` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `preview_text` VARCHAR(250) NULL,
  `template_id` VARCHAR(100) NOT NULL DEFAULT 'victoria-falls-editorial',
  `content_html` LONGTEXT NOT NULL,
  `content_text` LONGTEXT NOT NULL,
  `status` ENUM('draft', 'scheduled', 'sending', 'sent', 'archived', 'cancelled') NOT NULL DEFAULT 'draft',
  `scheduled_at` DATETIME NULL,
  `sent_at` DATETIME NULL,
  `total_recipients` INT NOT NULL DEFAULT 0,
  `sent_count` INT NOT NULL DEFAULT 0,
  `failed_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_scheduled` (`status`, `scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 Delivery Log Table (`wp_outbound_notifications`)

```sql
CREATE TABLE `wp_outbound_notifications` (
  `id` VARCHAR(36) NOT NULL,
  `dedupe_key` VARCHAR(191) NOT NULL,
  `campaign_id` VARCHAR(36) NULL,
  `subscription_id` VARCHAR(36) NULL,
  `kind` VARCHAR(64) NOT NULL,
  `payload` JSON NOT NULL,
  `status` ENUM('pending', 'processing', 'sent', 'failed', 'dead', 'cancelled') NOT NULL DEFAULT 'pending',
  `attempts` INT NOT NULL DEFAULT 0,
  `next_attempt_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `provider_id` VARCHAR(128) NULL,
  `last_error` TEXT NULL,
  `sent_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_dedupe` (`dedupe_key`),
  KEY `idx_status_next` (`status`, `next_attempt_at`),
  KEY `idx_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Subscriber Export & Migration Procedures

### 4.1 Exporting from React / PostgreSQL

Subscribers can be exported from the Newsletter Admin Console (`/admin/newsletter`) or via the API:
```bash
# Export all subscribers as CSV with full consent metadata
curl -H "Authorization: Bearer <ADMIN_API_KEY>" \
  https://outboundholiday.com/api/v1/admin/newsletter/subscribers/export?format=csv > subscribers_export.csv

# Or export as JSON
curl -H "Authorization: Bearer <ADMIN_API_KEY>" \
  https://outboundholiday.com/api/v1/admin/newsletter/subscribers/export?format=json > subscribers_export.json
```

### 4.2 WordPress Import Procedure via WP-CLI

When the WordPress environment is provisioned, create a WP-CLI command `wp outbound import-subscribers <file.csv>`:

```php
<?php
// Example WP-CLI command: wp outbound import-subscribers subscribers_export.csv
if ( defined( 'WP_CLI' ) && WP_CLI ) {
    WP_CLI::add_command( 'outbound import-subscribers', function( $args, $assoc_args ) {
        global $wpdb;
        $file = $args[0];
        if ( ! file_exists( $file ) ) {
            WP_CLI::error( "File not found: $file" );
        }
        $handle = fopen( $file, 'r' );
        $header = fgetcsv( $handle );
        $imported = 0;
        
        while ( ( $row = fgetcsv( $handle ) ) !== FALSE ) {
            $data = array_combine( $header, $row );
            $wpdb->replace(
                $wpdb->prefix . 'outbound_subscribers',
                [
                    'id'              => $data['id'],
                    'email'           => strtolower( trim( $data['email'] ) ),
                    'status'          => $data['status'],
                    'consent_version' => $data['consent_version'],
                    'consent_at'      => $data['consent_at'],
                    'confirmed_at'    => ! empty( $data['confirmed_at'] ) ? $data['confirmed_at'] : null,
                    'unsubscribed_at' => ! empty( $data['unsubscribed_at'] ) ? $data['unsubscribed_at'] : null,
                    'token_hash'      => hash( 'sha256', bin2hex( random_bytes( 32 ) ) ),
                    'created_at'      => $data['created_at'],
                ]
            );
            $imported++;
        }
        fclose( $handle );
        WP_CLI::success( "Imported $imported subscribers with full consent timestamps preserved." );
    } );
}
```

---

## 5. API Contracts & Data Structures

The WordPress REST API will reproduce the exact same payload contracts so that any existing client, webhook, or admin dashboard can communicate without breaking changes.

### 5.1 Public Endpoints

| Current Endpoint | Future WordPress REST Endpoint | Method | Payload / Response |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/newsletter` | `POST /wp-json/outbound/v1/newsletter` | `POST` | Input: `{ email, marketingConsent, website, startedAt, turnstileToken }`<br>Response: `{ saved: true, status: "pending-confirmation", confirmationDelivery: "queued" }` |
| `GET /api/v1/newsletter/confirm?token=...` | `GET /wp-json/outbound/v1/confirm?token=...` | `GET` | HTML Confirmation Page |
| `POST /api/v1/newsletter/confirm` | `POST /wp-json/outbound/v1/confirm` | `POST` | Input: `{ token }`<br>Response: HTML Confirmation Notice |
| `GET /api/v1/newsletter/unsubscribe?token=...` | `GET /wp-json/outbound/v1/unsubscribe?token=...` | `GET` | HTML Unsubscribe Page |
| `POST /api/v1/newsletter/unsubscribe` | `POST /wp-json/outbound/v1/unsubscribe` | `POST` | Input: `{ token }`<br>Response: HTML Unsubscribe Notice |

### 5.2 Admin Endpoints (Protected by `manage_options` or Application Password)

- `GET /wp-json/outbound/v1/admin/subscribers`
- `GET /wp-json/outbound/v1/admin/subscribers/stats`
- `POST /wp-json/outbound/v1/admin/subscribers/{id}/status`
- `DELETE /wp-json/outbound/v1/admin/subscribers/{id}`
- `GET /wp-json/outbound/v1/admin/campaigns`
- `POST /wp-json/outbound/v1/admin/campaigns`
- `POST /wp-json/outbound/v1/admin/campaigns/{id}/test`
- `POST /wp-json/outbound/v1/admin/campaigns/{id}/dispatch`
- `POST /wp-json/outbound/v1/admin/campaigns/{id}/schedule`

---

## 6. Email Configuration Requirements

### 6.1 WordPress SMTP Integration

In WordPress, configure `phpmailer_init` in the theme's `functions.php` or a dedicated mu-plugin:

```php
<?php
add_action( 'phpmailer_init', 'outbound_configure_smtp' );
function outbound_configure_smtp( $phpmailer ) {
    $phpmailer->isSMTP();
    $phpmailer->Host       = defined('OUTBOUND_SMTP_HOST') ? OUTBOUND_SMTP_HOST : 'server169.web-hosting.com';
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Port       = defined('OUTBOUND_SMTP_PORT') ? OUTBOUND_SMTP_PORT : 465;
    $phpmailer->SMTPSecure = 'ssl'; // Port 465 requires SSL/TLS
    $phpmailer->Username   = defined('OUTBOUND_SMTP_USER') ? OUTBOUND_SMTP_USER : 'fungai@outboundholiday.com';
    $phpmailer->Password   = defined('OUTBOUND_SMTP_PASS') ? OUTBOUND_SMTP_PASS : '';
    $phpmailer->From       = 'fungai@outboundholiday.com';
    $phpmailer->FromName   = 'Outbound Holidays';
    $phpmailer->Timeout    = 15;
}
```

Store credentials in `wp-config.php` outside web-accessible directories:
```php
define( 'OUTBOUND_SMTP_HOST', 'server169.web-hosting.com' );
define( 'OUTBOUND_SMTP_PORT', 465 );
define( 'OUTBOUND_SMTP_USER', 'fungai@outboundholiday.com' );
define( 'OUTBOUND_SMTP_PASS', '...' );
```

---

## 7. Required PHP Adaptations

### 7.1 Double Opt-In Token Hashing (Security Parity)

In Node.js, we use `crypto.createHash('sha256').update(token).digest('hex')`.
In PHP, the exact equivalent is:

```php
$token = bin2hex( random_bytes( 32 ) ); // 64 hex characters
$token_hash = hash( 'sha256', $token );
```

### 7.2 Action Scheduler for Batch Campaign Delivery

Instead of manual `SELECT ... FOR UPDATE SKIP LOCKED` and custom outbox workers in Node, WordPress provides **Action Scheduler** (standard in WooCommerce and available as a standalone library):

```php
// When admin dispatches campaign:
function outbound_dispatch_campaign( $campaign_id ) {
    global $wpdb;
    $subscribers = $wpdb->get_results(
        "SELECT id, email, token_hash FROM {$wpdb->prefix}outbound_subscribers WHERE status = 'subscribed'"
    );

    foreach ( $subscribers as $sub ) {
        as_enqueue_async_action(
            'outbound_send_campaign_email',
            [
                'campaign_id'     => $campaign_id,
                'subscription_id' => $sub->id,
                'email'           => $sub->email,
            ],
            'outbound-newsletter'
        );
    }
}

// Action Scheduler Worker:
add_action( 'outbound_send_campaign_email', 'outbound_process_campaign_email', 10, 3 );
function outbound_process_campaign_email( $campaign_id, $subscription_id, $email ) {
    global $wpdb;
    
    // Suppression check: verify subscriber is still active
    $current_status = $wpdb->get_var( $wpdb->prepare(
        "SELECT status FROM {$wpdb->prefix}outbound_subscribers WHERE id = %s",
        $subscription_id
    ) );
    
    if ( $current_status !== 'subscribed' ) {
        return; // Suppressed: do not deliver
    }
    
    // Render branded template and deliver via wp_mail()
    $rendered = outbound_render_email( $campaign_id, $email, $subscription_id );
    $headers  = [
        'Content-Type: text/html; charset=UTF-8',
        'List-Unsubscribe: <' . esc_url( $rendered['unsubscribe_url'] ) . '>',
        'List-Unsubscribe-Post: List-Unsubscribe=One-Click'
    ];
    
    $sent = wp_mail( $email, $rendered['subject'], $rendered['html'], $headers );
    if ( $sent ) {
        $wpdb->query( $wpdb->prepare(
            "UPDATE {$wpdb->prefix}outbound_campaigns SET sent_count = sent_count + 1 WHERE id = %s",
            $campaign_id
        ) );
    }
}
```

---

## 8. Subscriber Consent & Legal Compliance Preservation

When migrating to WordPress:
1. **Consent Version**: Must retain `travel-club-2026-10` (or active version) in the database.
2. **Consent Date**: Retain original `consent_at` timestamp. Never reset this to the WordPress migration date.
3. **Confirmed Date**: Retain original `confirmed_at` timestamp verifying double opt-in completion.
4. **Unsubscribe Integrity**: Every recipient marked `unsubscribed` must remain permanently suppressed in the database.
5. **Direct Unsubscribe Header**: Emails must include standard RFC-8058 `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers.
6. **Physical Address in Footer**: Must retain Outbound Holidays physical location (Victoria Falls, Zimbabwe) in compliance with CAN-SPAM and international regulations.

---

## 9. Summary: What to Reuse Directly vs What to Convert

```
┌────────────────────────────────────────────────────────┐
│                   DIRECT REUSE                         │
├────────────────────────────────────────────────────────┤
│ • Branded HTML Email Templates (Victoria Falls styling)│
│ • CSS styling, colors (#0B5E8E, #C9A66B, #E67E22)      │
│ • Database schema column names & definitions           │
│ • Turnstile bot detection site & secret keys           │
│ • Namecheap SMTP server credentials and TLS config     │
│ • Subscriber consent audit records (via CSV export)    │
│ • Unsubscribe & confirmation link URL structures       │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│               CONVERT TO WORDPRESS PHP                 │
├────────────────────────────────────────────────────────┤
│ • Express server route handlers → WP REST API          │
│ • Prisma Client queries → $wpdb / Custom Post Types    │
│ • Node outbox worker loop → Action Scheduler / WP-Cron │
│ • React NewsletterAdmin UI → WP Admin Menu Page        │
│ • Node crypto SHA-256 → PHP hash('sha256', ...)        │
│ • Nodemailer transport → wp_mail() with PHPMailer hook │
└────────────────────────────────────────────────────────┘
```

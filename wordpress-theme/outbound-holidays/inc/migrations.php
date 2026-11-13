<?php
/**
 * Versioned WordPress custom database table installation & migrations (`dbDelta`).
 * Covers Subscribers, Campaigns, Enquiries, Notifications Queue, and Rate Limiting.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Return SQL table names with the active `$wpdb->prefix`.
 *
 * @return array<string, string>
 */
function outbound_get_table_names(): array {
    global $wpdb;
    $prefix = isset($wpdb->prefix) ? $wpdb->prefix : 'wp_';
    return array(
        'subscribers'        => $prefix . 'outbound_subscribers',
        'campaigns'          => $prefix . 'outbound_campaigns',
        'enquiries'          => $prefix . 'outbound_enquiries',
        'enquiry_sequences'  => $prefix . 'outbound_enquiry_sequences',
        'notifications'      => $prefix . 'outbound_notifications',
        'rate_limits'        => $prefix . 'outbound_rate_limits',
        'promotions'         => $prefix . 'outbound_promotions',
        'promotion_events'   => $prefix . 'outbound_promotion_events',
    );
}

/**
 * Install or upgrade custom tables idempotently whenever theme version changes.
 */
function outbound_maybe_install_schema(bool $force = false): void {
    if (!function_exists('get_option')) {
        return;
    }

    $current = (string) get_option('outbound_db_schema_version', '0');
    if (!$force && version_compare($current, OUTBOUND_DB_SCHEMA_VERSION, '>=')) {
        return;
    }

    global $wpdb;
    $charset = $wpdb->get_charset_collate();
    $tables  = outbound_get_table_names();

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    $sql_subscribers = "CREATE TABLE {$tables['subscribers']} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        email varchar(255) NOT NULL,
        name varchar(255) DEFAULT NULL,
        source varchar(64) NOT NULL DEFAULT 'website',
        status varchar(32) NOT NULL DEFAULT 'pending',
        consent_text text NOT NULL,
        consent_version varchar(64) NOT NULL DEFAULT 'travel-club-2026-10',
        consented_at datetime DEFAULT NULL,
        confirmed_at datetime DEFAULT NULL,
        unsubscribed_at datetime DEFAULT NULL,
        confirm_token_hash varchar(64) DEFAULT NULL,
        confirm_expires_at datetime DEFAULT NULL,
        unsubscribe_token_hash varchar(64) DEFAULT NULL,
        tags_json longtext DEFAULT NULL,
        metadata_json longtext DEFAULT NULL,
        ip_address varchar(64) DEFAULT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY uniq_email (email),
        KEY idx_status (status),
        KEY idx_confirm_hash (confirm_token_hash),
        KEY idx_unsub_hash (unsubscribe_token_hash)
    ) {$charset};";

    $sql_campaigns = "CREATE TABLE {$tables['campaigns']} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        title varchar(255) NOT NULL,
        subject varchar(255) NOT NULL,
        preheader varchar(255) DEFAULT NULL,
        template_id varchar(64) NOT NULL DEFAULT 'seasonal-spotlight',
        audience_segment varchar(64) NOT NULL DEFAULT 'all_confirmed',
        sender_name varchar(120) DEFAULT NULL,
        sender_email varchar(255) DEFAULT NULL,
        reply_to_email varchar(255) DEFAULT NULL,
        body_html longtext NOT NULL,
        body_text longtext DEFAULT NULL,
        blocks_json longtext DEFAULT NULL,
        cta_label varchar(120) DEFAULT NULL,
        cta_url varchar(500) DEFAULT NULL,
        hero_image_id bigint(20) unsigned DEFAULT NULL,
        hero_image_url varchar(500) DEFAULT NULL,
        hero_image_alt varchar(255) DEFAULT NULL,
        status varchar(32) NOT NULL DEFAULT 'draft',
        scheduled_at datetime DEFAULT NULL,
        started_at datetime DEFAULT NULL,
        completed_at datetime DEFAULT NULL,
        recipient_count int(11) NOT NULL DEFAULT 0,
        sent_count int(11) NOT NULL DEFAULT 0,
        failed_count int(11) NOT NULL DEFAULT 0,
        batch_size int(11) NOT NULL DEFAULT 25,
        created_by bigint(20) unsigned DEFAULT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY idx_campaign_status (status),
        KEY idx_campaign_sched (scheduled_at)
    ) {$charset};";

    $sql_enquiries = "CREATE TABLE {$tables['enquiries']} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        reference_code varchar(40) NOT NULL,
        idempotency_key varchar(100) DEFAULT NULL,
        type varchar(40) NOT NULL DEFAULT 'holiday-builder',
        full_name varchar(160) NOT NULL,
        email varchar(255) NOT NULL,
        phone varchar(64) DEFAULT NULL,
        party_type varchar(40) DEFAULT NULL,
        trip_intent varchar(64) DEFAULT NULL,
        adults int(11) NOT NULL DEFAULT 2,
        children int(11) NOT NULL DEFAULT 0,
        nights int(11) NOT NULL DEFAULT 3,
        travel_season varchar(80) DEFAULT NULL,
        stay_tier_id varchar(80) DEFAULT NULL,
        transport_type varchar(64) DEFAULT NULL,
        estimate_min_usd int(11) NOT NULL DEFAULT 0,
        estimate_max_usd int(11) NOT NULL DEFAULT 0,
        marketing_consent tinyint(1) NOT NULL DEFAULT 0,
        subject varchar(255) DEFAULT NULL,
        message longtext DEFAULT NULL,
        payload_json longtext NOT NULL,
        status varchar(32) NOT NULL DEFAULT 'new',
        assigned_consultant varchar(120) DEFAULT NULL,
        admin_notes longtext DEFAULT NULL,
        promotion_id bigint(20) unsigned DEFAULT NULL,
        promotion_name varchar(255) DEFAULT NULL,
        ip_address varchar(64) DEFAULT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY uniq_ref (reference_code),
        KEY idx_idempotency (idempotency_key),
        KEY idx_enquiry_type (type),
        KEY idx_enquiry_status (status),
        KEY idx_enquiry_email (email),
        KEY idx_enquiry_promo (promotion_id),
        KEY idx_enquiry_created (created_at)
    ) {$charset};";

    $sql_notifications = "CREATE TABLE {$tables['notifications']} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        kind varchar(48) NOT NULL,
        recipient_email varchar(255) NOT NULL,
        subject varchar(255) NOT NULL,
        body_html longtext NOT NULL,
        body_text longtext DEFAULT NULL,
        campaign_id bigint(20) unsigned DEFAULT NULL,
        subscriber_id bigint(20) unsigned DEFAULT NULL,
        enquiry_id bigint(20) unsigned DEFAULT NULL,
        status varchar(32) NOT NULL DEFAULT 'pending',
        attempts int(11) NOT NULL DEFAULT 0,
        last_error text DEFAULT NULL,
        scheduled_for datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sent_at datetime DEFAULT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY idx_notif_status (status, scheduled_for),
        KEY idx_notif_campaign (campaign_id)
    ) {$charset};";

    $sql_rate_limits = "CREATE TABLE {$tables['rate_limits']} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        rate_key varchar(190) NOT NULL,
        attempts int(11) NOT NULL DEFAULT 1,
        window_reset_at datetime NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uniq_rate_key (rate_key),
        KEY idx_rate_reset (window_reset_at)
    ) {$charset};";

    $sql_enquiry_sequences = "CREATE TABLE {$tables['enquiry_sequences']} (
        seq_date char(6) NOT NULL,
        last_seq int(10) unsigned NOT NULL DEFAULT 0,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (seq_date)
    ) {$charset};";

    $sql_promotions = "CREATE TABLE {$tables['promotions']} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        campaign_code varchar(48) NOT NULL,
        slug varchar(120) NOT NULL,
        name varchar(255) NOT NULL,
        headline varchar(255) NOT NULL,
        subtitle varchar(255) DEFAULT NULL,
        short_description text NOT NULL,
        full_content longtext DEFAULT NULL,
        image_url varchar(500) NOT NULL,
        image_alt varchar(255) DEFAULT NULL,
        badge_text varchar(64) DEFAULT NULL,
        category varchar(64) NOT NULL DEFAULT 'all',
        destination_or_activity varchar(120) DEFAULT NULL,
        terms_and_conditions text DEFAULT NULL,
        original_price_usd decimal(10,2) DEFAULT NULL,
        promotional_price_usd decimal(10,2) DEFAULT NULL,
        price_basis varchar(32) NOT NULL DEFAULT 'per_person',
        discount_percentage int(11) DEFAULT NULL,
        discount_badge_override varchar(64) DEFAULT NULL,
        validity_start datetime DEFAULT NULL,
        validity_end datetime DEFAULT NULL,
        primary_cta_label varchar(80) NOT NULL DEFAULT 'Enquire About This Offer',
        primary_cta_destination varchar(40) NOT NULL DEFAULT 'enquiry_form',
        primary_cta_target varchar(500) DEFAULT NULL,
        secondary_cta_label varchar(80) DEFAULT 'View Offer Details',
        secondary_cta_destination varchar(40) DEFAULT 'offer_page',
        secondary_cta_target varchar(500) DEFAULT NULL,
        whatsapp_prefill_template text DEFAULT NULL,
        publish_mode varchar(20) NOT NULL DEFAULT 'immediate',
        scheduled_start datetime DEFAULT NULL,
        scheduled_end datetime DEFAULT NULL,
        display_priority int(11) NOT NULL DEFAULT 10,
        is_enabled tinyint(1) NOT NULL DEFAULT 1,
        show_on_homepage tinyint(1) NOT NULL DEFAULT 1,
        show_as_card tinyint(1) NOT NULL DEFAULT 1,
        show_as_popup tinyint(1) NOT NULL DEFAULT 1,
        target_pages_json text DEFAULT NULL,
        trigger_mode varchar(32) NOT NULL DEFAULT 'delay',
        trigger_delay_seconds int(11) NOT NULL DEFAULT 8,
        trigger_scroll_percentage int(11) NOT NULL DEFAULT 40,
        max_impressions_per_visitor int(11) NOT NULL DEFAULT 1,
        frequency_reset_hours int(11) NOT NULL DEFAULT 24,
        status varchar(32) NOT NULL DEFAULT 'draft',
        impressions_count int(11) NOT NULL DEFAULT 0,
        clicks_count int(11) NOT NULL DEFAULT 0,
        whatsapp_clicks_count int(11) NOT NULL DEFAULT 0,
        enquiries_count int(11) NOT NULL DEFAULT 0,
        inclusions_json text DEFAULT NULL,
        exclusions_json text DEFAULT NULL,
        gallery_json text DEFAULT NULL,
        created_by bigint(20) unsigned DEFAULT NULL,
        approved_by bigint(20) unsigned DEFAULT NULL,
        approved_at datetime DEFAULT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_campaign_code (campaign_code),
        UNIQUE KEY uniq_promo_slug (slug),
        KEY idx_promo_status (status),
        KEY idx_promo_schedule (scheduled_start, scheduled_end),
        KEY idx_promo_active_sort (is_enabled, status, display_priority, id)
    ) {$charset};";

    $sql_promotion_events = "CREATE TABLE {$tables['promotion_events']} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        promotion_id bigint(20) unsigned NOT NULL,
        event_type varchar(32) NOT NULL,
        visitor_id varchar(64) NOT NULL,
        page_url varchar(500) DEFAULT NULL,
        utm_source varchar(64) DEFAULT NULL,
        utm_medium varchar(64) DEFAULT NULL,
        utm_campaign varchar(64) DEFAULT NULL,
        utm_content varchar(64) DEFAULT NULL,
        ip_hash varchar(64) DEFAULT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_pe_promo_event (promotion_id, event_type),
        KEY idx_pe_created (created_at),
        KEY idx_pe_visitor (visitor_id, promotion_id)
    ) {$charset};";

    dbDelta($sql_subscribers);
    dbDelta($sql_campaigns);
    dbDelta($sql_enquiries);
    dbDelta($sql_enquiry_sequences);
    dbDelta($sql_notifications);
    dbDelta($sql_rate_limits);
    dbDelta($sql_promotions);
    dbDelta($sql_promotion_events);

    update_option('outbound_db_schema_version', OUTBOUND_DB_SCHEMA_VERSION, false);
}
add_action('admin_init', static function (): void {
    outbound_maybe_install_schema(false);
}, 5);
add_action('after_switch_theme', static function (): void {
    outbound_maybe_install_schema(true);
});

/**
 * Check health status of all custom database tables for the WP Admin Setup screen.
 *
 * @return array<string, bool>
 */
function outbound_get_database_table_health(): array {
    global $wpdb;
    $health = array();
    foreach (outbound_get_table_names() as $key => $table_name) {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table_name));
        $health[$key] = ($exists === $table_name);
    }
    return $health;
}

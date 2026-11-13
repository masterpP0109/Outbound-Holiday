<?php
/**
 * Promotions & Campaigns Management System for Outbound Holidays.
 *
 * Provides database-backed promotional campaigns, role-based workflows,
 * Africa/Harare scheduling, verified discount pricing, secure CRUD operations,
 * REST endpoints, and privacy-conscious analytics.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Promotions Management admin menu under Marketing.
 */
function outbound_register_promotions_admin_menu(): void {
    add_menu_page(
        __('Marketing & Campaigns', 'outbound-holidays'),
        __('Marketing', 'outbound-holidays'),
        'edit_posts',
        'outbound-marketing',
        'outbound_render_promotions_admin_page',
        'dashicons-tag',
        26
    );

    add_submenu_page(
        'outbound-marketing',
        __('Promotions & Special Offers', 'outbound-holidays'),
        __('Promotions', 'outbound-holidays'),
        'edit_posts',
        'outbound-promotions',
        'outbound_render_promotions_admin_page'
    );

    // Remove the redundant top-level submenu duplicate.
    remove_submenu_page('outbound-marketing', 'outbound-marketing');
}
add_action('admin_menu', 'outbound_register_promotions_admin_menu', 20);

/**
 * Check if the current user has permission to perform promotion actions.
 */
function outbound_can_manage_promotions(string $action = 'edit'): bool {
    if (!function_exists('current_user_can')) {
        return false;
    }
    return match ($action) {
        'publish', 'approve', 'delete', 'archive' => current_user_can('publish_posts') || current_user_can('manage_options'),
        default => current_user_can('edit_posts'),
    };
}

/**
 * Generate a unique, recognizable Campaign ID code (e.g. OH-PROMO-2026-XXXX).
 */
function outbound_generate_campaign_code(): string {
    $year = gmdate('Y');
    try {
        $rand = strtoupper(bin2hex(random_bytes(3)));
    } catch (Throwable $e) {
        $rand = strtoupper(substr(md5((string) wp_rand()), 0, 6));
    }
    return "OH-PROMO-{$year}-{$rand}";
}

/**
 * Authoritatively calculate verified discount percentage from prices.
 * Returns null if pricing is insufficient or invalid.
 */
function outbound_calculate_promo_discount(?float $original, ?float $promo): ?int {
    if ($original === null || $promo === null) {
        return null;
    }
    if ($original <= 0 || $promo <= 0 || $promo >= $original) {
        return null;
    }
    $calc = (int) round((($original - $promo) / $original) * 100);
    return ($calc > 0 && $calc < 100) ? $calc : null;
}

/**
 * Evaluate dynamic campaign status given stored dates against current Africa/Harare time.
 */
function outbound_evaluate_promotion_status(object|array $promo): string {
    $promo = (object) $promo;
    $raw_status = (string) ($promo->status ?? 'draft');

    if (in_array($raw_status, array('draft', 'paused', 'archived'), true)) {
        return $raw_status;
    }

    $is_enabled = !empty($promo->is_enabled);
    if (!$is_enabled) {
        return 'paused';
    }

    $now_utc = gmdate('Y-m-d H:i:s');
    $start = !empty($promo->scheduled_start) ? (string) $promo->scheduled_start : null;
    $end = !empty($promo->scheduled_end) ? (string) $promo->scheduled_end : null;

    if ($end !== null && $now_utc >= $end) {
        return 'expired';
    }

    if ($start !== null && $now_utc < $start) {
        return 'scheduled';
    }

    return 'active';
}

/**
 * Flush cached promotion payloads so frontend updates immediately.
 */
function outbound_invalidate_promotions_cache(): void {
    if (function_exists('delete_transient')) {
        delete_transient('outbound_active_promotions_v1');
    }
    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }
}

/**
 * Query active, eligible published promotions for public display.
 * Strictly filters out drafts, paused, scheduled, and expired campaigns.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_get_active_promotions(bool $force_refresh = false): array {
    global $wpdb;
    $tables = outbound_get_table_names();
    $cache_key = 'outbound_active_promotions_v1';

    if (!$force_refresh && function_exists('get_transient')) {
        $cached = get_transient($cache_key);
        if (is_array($cached)) {
            return $cached;
        }
    }

    $now_utc = gmdate('Y-m-d H:i:s');

    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$tables['promotions']}
         WHERE is_enabled = 1
           AND status IN ('active', 'published')
           AND (scheduled_start IS NULL OR scheduled_start <= %s)
           AND (scheduled_end IS NULL OR scheduled_end > %s)
         ORDER BY display_priority DESC, id DESC",
        $now_utc,
        $now_utc
    ));

    $out = array();
    if (is_array($rows)) {
        foreach ($rows as $row) {
            $computed_status = outbound_evaluate_promotion_status($row);
            if ($computed_status !== 'active') {
                continue;
            }

            $orig = $row->original_price_usd !== null ? (float) $row->original_price_usd : null;
            $promo = $row->promotional_price_usd !== null ? (float) $row->promotional_price_usd : null;
            $discount = outbound_calculate_promo_discount($orig, $promo);

            $target_pages = array();
            if (!empty($row->target_pages_json)) {
                $decoded = json_decode((string) $row->target_pages_json, true);
                if (is_array($decoded)) {
                    $target_pages = array_values(array_filter(array_map('trim', $decoded)));
                }
            }

            $whatsapp_template = !empty($row->whatsapp_prefill_template)
                ? (string) $row->whatsapp_prefill_template
                : "Hello Outbound Holidays, I am interested in your {$row->name} offer. Please could you share availability, pricing and booking details?";

            $out[] = array(
                'id'                      => (int) $row->id,
                'campaignCode'            => (string) $row->campaign_code,
                'slug'                    => (string) $row->slug,
                'name'                    => (string) $row->name,
                'headline'                => (string) $row->headline,
                'subtitle'                => (string) ($row->subtitle ?? ''),
                'shortDescription'        => (string) $row->short_description,
                'fullContent'             => (string) ($row->full_content ?? ''),
                'imageUrl'                => (string) $row->image_url,
                'imageAlt'                => (string) ($row->image_alt ?: $row->headline),
                'badgeText'               => (string) ($row->badge_text ?? ''),
                'category'                => (string) ($row->category ?? 'all'),
                'destinationOrActivity'   => (string) ($row->destination_or_activity ?? 'Victoria Falls'),
                'termsAndConditions'      => (string) ($row->terms_and_conditions ?? ''),
                'originalPriceUSD'        => $orig,
                'promotionalPriceUSD'     => $promo,
                'priceBasis'              => (string) ($row->price_basis ?? 'per_person'),
                'discountPercentage'      => $discount,
                'discountBadgeOverride'   => !empty($row->discount_badge_override) ? (string) $row->discount_badge_override : null,
                'validityStart'           => $row->validity_start,
                'validityEnd'             => $row->validity_end,
                'primaryCta'              => array(
                    'label'       => (string) ($row->primary_cta_label ?: 'Enquire About This Offer'),
                    'destination' => (string) ($row->primary_cta_destination ?: 'enquiry_form'),
                    'target'      => (string) ($row->primary_cta_target ?? ''),
                ),
                'secondaryCta'            => array(
                    'label'       => (string) ($row->secondary_cta_label ?: 'View Offer Details'),
                    'destination' => (string) ($row->secondary_cta_destination ?: 'offer_page'),
                    'target'      => (string) ($row->secondary_cta_target ?? ''),
                ),
                'whatsappTemplate'        => $whatsapp_template,
                'whatsappUrl'             => function_exists('get_whatsapp_url')
                    ? get_whatsapp_url($whatsapp_template)
                    : ('https://wa.me/263714701721?text=' . rawurlencode($whatsapp_template)),
                'display'                 => array(
                    'showOnHomepage' => (bool) $row->show_on_homepage,
                    'showAsCard'     => (bool) $row->show_as_card,
                    'showAsPopup'    => (bool) $row->show_as_popup,
                    'targetPages'    => $target_pages,
                ),
                'trigger'                 => array(
                    'mode'             => (string) ($row->trigger_mode ?? 'delay'),
                    'delaySeconds'     => max(1, (int) ($row->trigger_delay_seconds ?: 8)),
                    'scrollPercentage' => max(10, min(95, (int) ($row->trigger_scroll_percentage ?: 40))),
                    'maxImpressions'   => max(1, (int) ($row->max_impressions_per_visitor ?: 1)),
                    'frequencyHours'   => max(1, (int) ($row->frequency_reset_hours ?: 24)),
                ),
                'offerPageUrl'            => home_url('/offers/' . $row->slug),
            );
        }
    }

    if (function_exists('set_transient')) {
        // Cache active promotions for 30 minutes; invalidated automatically on promotion create/update/delete.
        set_transient($cache_key, $out, 1800);
    }

    return $out;
}

/**
 * Register REST API Endpoints for Promotions.
 */
add_action('rest_api_init', static function (): void {
    register_rest_route('outbound/v1', '/promotions/active', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => static function () {
            return new WP_REST_Response(outbound_get_active_promotions(), 200);
        },
    ));

    register_rest_route('outbound/v1', '/promotions/event', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => static function (WP_REST_Request $request) {
            $payload = $request->get_json_params() ?: array();
            $res = outbound_record_promotion_event($payload);
            if (is_wp_error($res)) {
                return $res;
            }
            return new WP_REST_Response(array('ok' => true), 200);
        },
    ));
});

/**
 * Record a privacy-conscious promotion analytics event.
 */
function outbound_record_promotion_event(array $payload): bool|WP_Error {
    global $wpdb;
    $tables = outbound_get_table_names();

    $promo_id = abs((int) ($payload['promotionId'] ?? 0));
    $event_type = sanitize_key((string) ($payload['eventType'] ?? ''));
    $allowed_events = array('impression', 'cta_click', 'whatsapp_click', 'enquiry_submit');

    if ($promo_id <= 0 || !in_array($event_type, $allowed_events, true)) {
        return new WP_Error('invalid_event', 'Valid promotionId and eventType are required.', array('status' => 400));
    }

    $visitor_id = sanitize_text_field((string) ($payload['visitorId'] ?? ''));
    if ($visitor_id === '') {
        $visitor_id = 'anon_' . substr(hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? 'anon') . gmdate('Y-m-d')), 0, 16);
    } else {
        $visitor_id = substr(sanitize_key($visitor_id), 0, 64);
    }

    // Rate-limit tracking calls per client to protect against spam / abuse.
    $client_ip = function_exists('outbound_get_client_ip') ? outbound_get_client_ip() : (string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
    if (function_exists('outbound_check_rate_limit')) {
        if (!outbound_check_rate_limit('promo_event', $client_ip, 30, 60)) {
            return new WP_Error('rate_limited', 'Tracking throttled.', array('status' => 429));
        }
    }

    // Deduplicate repetitive impression writes for the same visitor & promotion within 1 hour.
    if ($event_type === 'impression') {
        $dedup_key = 'outbound_pimp_' . $promo_id . '_' . substr(hash('sha256', $visitor_id), 0, 20);
        if (function_exists('get_transient') && get_transient($dedup_key)) {
            return true; // Acknowledge cleanly without generating redundant database writes.
        }
        if (function_exists('set_transient')) {
            set_transient($dedup_key, 1, 3600);
        }
    }

    $page_url = esc_url_raw((string) ($payload['pageUrl'] ?? ''));
    $utm_source = substr(sanitize_text_field((string) ($payload['utmSource'] ?? '')), 0, 64);
    $utm_medium = substr(sanitize_text_field((string) ($payload['utmMedium'] ?? '')), 0, 64);
    $utm_campaign = substr(sanitize_text_field((string) ($payload['utmCampaign'] ?? '')), 0, 64);
    $utm_content = substr(sanitize_text_field((string) ($payload['utmContent'] ?? '')), 0, 64);
    $ip_hash = hash('sha256', $client_ip);
    $now = gmdate('Y-m-d H:i:s');

    $inserted = $wpdb->insert(
        $tables['promotion_events'],
        array(
            'promotion_id' => $promo_id,
            'event_type'   => $event_type,
            'visitor_id'   => $visitor_id,
            'page_url'     => $page_url,
            'utm_source'   => $utm_source ?: null,
            'utm_medium'   => $utm_medium ?: null,
            'utm_campaign' => $utm_campaign ?: null,
            'utm_content'  => $utm_content ?: null,
            'ip_hash'      => $ip_hash,
            'created_at'   => $now,
        )
    );

    if ($inserted) {
        $counter_col = match ($event_type) {
            'impression'      => 'impressions_count',
            'cta_click'       => 'clicks_count',
            'whatsapp_click'  => 'whatsapp_clicks_count',
            'enquiry_submit'  => 'enquiries_count',
        };
        $wpdb->query($wpdb->prepare(
            "UPDATE {$tables['promotions']} SET {$counter_col} = {$counter_col} + 1, updated_at = %s WHERE id = %d",
            $now,
            $promo_id
        ));
        return true;
    }

    return false;
}


/**
 * Render the dedicated Outbound Promotions Management CMS Page.
 */
function outbound_render_promotions_admin_page(): void {
    if (!current_user_can('edit_posts')) {
        wp_die(__('You do not have permission to access Outbound Promotions.', 'outbound-holidays'));
    }

    // Ensure WordPress Media uploader scripts & styles are loaded.
    if (function_exists('wp_enqueue_media')) {
        wp_enqueue_media();
    }

    global $wpdb;
    $tables = outbound_get_table_names();
    $notice = null;
    $active_tab = sanitize_key((string) ($_GET['tab'] ?? 'list'));
    $promo_id = abs((int) ($_GET['promo_id'] ?? 0));

    // Handle POST Actions
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['outbound_promo_action'])) {
        check_admin_referer('outbound_promo_action', 'outbound_promo_nonce');
        $act = sanitize_key((string) $_POST['outbound_promo_action']);

        if ($act === 'save_promotion') {
            $editing_id = abs((int) ($_POST['editing_promo_id'] ?? 0));
            $submit_mode = sanitize_key((string) ($_POST['submit_mode'] ?? 'draft'));

            if ($editing_id > 0 && !outbound_can_manage_promotions('edit')) {
                $notice = array('type' => 'error', 'msg' => 'You do not have permission to edit promotions.');
            } elseif (in_array($submit_mode, array('publish_now', 'schedule'), true) && !outbound_can_manage_promotions('publish')) {
                $notice = array('type' => 'error', 'msg' => 'Your user role cannot publish or schedule promotions. It has been saved as Draft for review.');
                $submit_mode = 'draft';
            }

            if (!$notice) {
                $name = sanitize_text_field(wp_unslash((string) ($_POST['name'] ?? '')));
                $headline = sanitize_text_field(wp_unslash((string) ($_POST['headline'] ?? '')));
                $subtitle = sanitize_text_field(wp_unslash((string) ($_POST['subtitle'] ?? '')));
                $desc = wp_kses_post(wp_unslash((string) ($_POST['short_description'] ?? '')));
                $content = wp_kses_post(wp_unslash((string) ($_POST['full_content'] ?? '')));
                $raw_img = trim(wp_unslash((string) ($_POST['image_url'] ?? '')));
                if (str_starts_with($raw_img, '/') || !preg_match('#^https?://#i', $raw_img)) {
                    $image_url = sanitize_text_field($raw_img);
                } else {
                    $image_url = esc_url_raw($raw_img);
                }
                $image_alt = sanitize_text_field(wp_unslash((string) ($_POST['image_alt'] ?? '')));
                $badge = sanitize_text_field(wp_unslash((string) ($_POST['badge_text'] ?? '')));
                $category = sanitize_key((string) ($_POST['category'] ?? 'all'));
                $destination = sanitize_text_field(wp_unslash((string) ($_POST['destination_or_activity'] ?? 'Victoria Falls')));
                $terms = sanitize_textarea_field(wp_unslash((string) ($_POST['terms_and_conditions'] ?? '')));

                // Pricing logic with validation
                $orig_raw = trim((string) ($_POST['original_price_usd'] ?? ''));
                $promo_raw = trim((string) ($_POST['promotional_price_usd'] ?? ''));
                $orig_price = ($orig_raw !== '' && is_numeric($orig_raw)) ? round((float) $orig_raw, 2) : null;
                $promo_price = ($promo_raw !== '' && is_numeric($promo_raw)) ? round((float) $promo_raw, 2) : null;
                $price_basis = sanitize_key((string) ($_POST['price_basis'] ?? 'per_person'));
                $discount_calc = outbound_calculate_promo_discount($orig_price, $promo_price);
                $discount_badge_override = sanitize_text_field(wp_unslash((string) ($_POST['discount_badge_override'] ?? '')));

                // CTAs
                $p_label = sanitize_text_field(wp_unslash((string) ($_POST['primary_cta_label'] ?? 'Enquire About This Offer')));
                $p_dest = sanitize_key((string) ($_POST['primary_cta_destination'] ?? 'enquiry_form'));
                $p_target = esc_url_raw(wp_unslash((string) ($_POST['primary_cta_target'] ?? '')));
                $s_label = sanitize_text_field(wp_unslash((string) ($_POST['secondary_cta_label'] ?? 'View Offer Details')));
                $s_dest = sanitize_key((string) ($_POST['secondary_cta_destination'] ?? 'offer_page'));
                $s_target = esc_url_raw(wp_unslash((string) ($_POST['secondary_cta_target'] ?? '')));
                $wa_tpl = sanitize_textarea_field(wp_unslash((string) ($_POST['whatsapp_prefill_template'] ?? '')));

                // Schedule and targeting
                $sched_start_raw = sanitize_text_field((string) ($_POST['scheduled_start_harare'] ?? ''));
                $sched_end_raw = sanitize_text_field((string) ($_POST['scheduled_end_harare'] ?? ''));
                $val_start_raw = sanitize_text_field((string) ($_POST['validity_start_harare'] ?? ''));
                $val_end_raw = sanitize_text_field((string) ($_POST['validity_end_harare'] ?? ''));

                $sched_start_utc = $sched_start_raw !== '' && function_exists('outbound_harare_local_to_utc') ? outbound_harare_local_to_utc($sched_start_raw) : null;
                $sched_end_utc = $sched_end_raw !== '' && function_exists('outbound_harare_local_to_utc') ? outbound_harare_local_to_utc($sched_end_raw) : null;
                $val_start_utc = $val_start_raw !== '' && function_exists('outbound_harare_local_to_utc') ? outbound_harare_local_to_utc($val_start_raw) : null;
                $val_end_utc = $val_end_raw !== '' && function_exists('outbound_harare_local_to_utc') ? outbound_harare_local_to_utc($val_end_raw) : null;

                $priority = (int) ($_POST['display_priority'] ?? 10);
                $is_enabled = !empty($_POST['is_enabled']) ? 1 : 0;
                $show_home = !empty($_POST['show_on_homepage']) ? 1 : 0;
                $show_card = !empty($_POST['show_as_card']) ? 1 : 0;
                $show_popup = !empty($_POST['show_as_popup']) ? 1 : 0;

                $trigger_mode = sanitize_key((string) ($_POST['trigger_mode'] ?? 'delay'));
                $trigger_delay = max(1, (int) ($_POST['trigger_delay_seconds'] ?? 8));
                $trigger_scroll = max(10, min(95, (int) ($_POST['trigger_scroll_percentage'] ?? 40)));
                $max_impressions = max(1, (int) ($_POST['max_impressions_per_visitor'] ?? 1));
                $freq_hours = max(1, (int) ($_POST['frequency_reset_hours'] ?? 24));

                $target_pages_raw = trim((string) ($_POST['target_pages_csv'] ?? ''));
                $target_pages = array_values(array_filter(array_map('trim', explode(',', $target_pages_raw))));

                $status = match ($submit_mode) {
                    'publish_now' => 'active',
                    'schedule'    => 'scheduled',
                    default       => 'draft',
                };

                if ($name === '' || $headline === '' || $image_url === '') {
                    $notice = array('type' => 'error', 'msg' => 'Please provide a Promotion Name, Headline, and Promotional Image.');
                } else {
                    $slug = sanitize_title($name);
                    $now = gmdate('Y-m-d H:i:s');

                    $payload = array(
                        'name'                        => $name,
                        'slug'                        => $slug,
                        'headline'                    => $headline,
                        'subtitle'                    => $subtitle ?: null,
                        'short_description'           => $desc,
                        'full_content'                => $content ?: null,
                        'image_url'                   => $image_url,
                        'image_alt'                   => $image_alt ?: $headline,
                        'badge_text'                  => $badge ?: null,
                        'category'                    => $category,
                        'destination_or_activity'     => $destination,
                        'terms_and_conditions'        => $terms ?: null,
                        'original_price_usd'          => $orig_price,
                        'promotional_price_usd'       => $promo_price,
                        'price_basis'                 => $price_basis,
                        'discount_percentage'         => $discount_calc,
                        'discount_badge_override'     => $discount_badge_override !== '' ? $discount_badge_override : null,
                        'validity_start'              => $val_start_utc,
                        'validity_end'                => $val_end_utc,
                        'primary_cta_label'           => $p_label,
                        'primary_cta_destination'     => $p_dest,
                        'primary_cta_target'          => $p_target ?: null,
                        'secondary_cta_label'         => $s_label,
                        'secondary_cta_destination'   => $s_dest,
                        'secondary_cta_target'        => $s_target ?: null,
                        'whatsapp_prefill_template'   => $wa_tpl ?: null,
                        'publish_mode'                => $submit_mode,
                        'scheduled_start'             => $sched_start_utc,
                        'scheduled_end'               => $sched_end_utc,
                        'display_priority'            => $priority,
                        'is_enabled'                  => $is_enabled,
                        'show_on_homepage'            => $show_home,
                        'show_as_card'                => $show_card,
                        'show_as_popup'               => $show_popup,
                        'target_pages_json'           => !empty($target_pages) ? wp_json_encode($target_pages) : null,
                        'trigger_mode'                => $trigger_mode,
                        'trigger_delay_seconds'       => $trigger_delay,
                        'trigger_scroll_percentage'   => $trigger_scroll,
                        'max_impressions_per_visitor' => $max_impressions,
                        'frequency_reset_hours'       => $freq_hours,
                        'status'                      => $status,
                        'updated_at'                  => $now,
                    );

                    if ($status === 'active' || $status === 'scheduled') {
                        $payload['approved_by'] = get_current_user_id();
                        $payload['approved_at'] = $now;
                    }

                    if ($editing_id > 0) {
                        $wpdb->update($tables['promotions'], $payload, array('id' => $editing_id));
                        $notice = array('type' => 'success', 'msg' => "Promotion '{$name}' updated successfully.");
                    } else {
                        $payload['campaign_code'] = outbound_generate_campaign_code();
                        $payload['created_by']    = get_current_user_id();
                        $payload['created_at']    = $now;
                        $wpdb->insert($tables['promotions'], $payload);
                        $editing_id = (int) $wpdb->insert_id;
                        $notice = array('type' => 'success', 'msg' => "Promotion '{$name}' created with Campaign Code {$payload['campaign_code']}.");
                    }

                    outbound_invalidate_promotions_cache();
                    $active_tab = 'list';
                }
            }
        } elseif ($act === 'duplicate_promotion' && !empty($_POST['target_id'])) {
            $tid = abs((int) $_POST['target_id']);
            $source = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tables['promotions']} WHERE id = %d LIMIT 1", $tid), ARRAY_A);
            if ($source) {
                unset($source['id']);
                $source['campaign_code']        = outbound_generate_campaign_code();
                $source['name']                 = 'Copy of ' . $source['name'];
                $source['slug']                 = sanitize_title($source['name']) . '-' . strtolower(substr(bin2hex(random_bytes(2)), 0, 4));
                $source['status']               = 'draft';
                $source['impressions_count']    = 0;
                $source['clicks_count']         = 0;
                $source['whatsapp_clicks_count']= 0;
                $source['enquiries_count']      = 0;
                $source['created_by']           = get_current_user_id();
                $source['created_at']           = gmdate('Y-m-d H:i:s');
                $source['updated_at']           = gmdate('Y-m-d H:i:s');
                $wpdb->insert($tables['promotions'], $source);
                $notice = array('type' => 'success', 'msg' => 'Campaign duplicated as fresh Draft.');
            }
        } elseif ($act === 'toggle_status' && !empty($_POST['target_id'])) {
            $tid = abs((int) $_POST['target_id']);
            $new_stat = sanitize_key((string) $_POST['new_status']);
            if (in_array($new_stat, array('active', 'paused', 'archived'), true)) {
                $upd = array('status' => $new_stat, 'updated_at' => gmdate('Y-m-d H:i:s'));
                if ($new_stat === 'active') {
                    $upd['is_enabled'] = 1;
                    $upd['approved_by'] = get_current_user_id();
                    $upd['approved_at'] = gmdate('Y-m-d H:i:s');
                } elseif ($new_stat === 'paused') {
                    $upd['is_enabled'] = 0;
                }
                $wpdb->update($tables['promotions'], $upd, array('id' => $tid));
                outbound_invalidate_promotions_cache();
                $notice = array('type' => 'success', 'msg' => "Campaign status changed to {$new_stat}.");
            }
        }
    }

    // Load promotions for list tab
    $promos = $wpdb->get_results("SELECT * FROM {$tables['promotions']} ORDER BY display_priority DESC, id DESC");
    $edit_promo = ($promo_id > 0) ? $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tables['promotions']} WHERE id = %d LIMIT 1", $promo_id)) : null;

    ?>
    <div class="wrap outbound-admin-wrap" style="max-width:1440px;margin:20px auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px;">
            <div>
                <h1 style="font-size:26px;font-weight:700;color:#0B5E8E;margin:0;">Marketing &mdash; Promotions &amp; Campaigns</h1>
                <p style="margin:4px 0 0;color:#64748B;">Create, schedule and publish high-converting promotional pop-ups, cards and WhatsApp/enquiry campaigns.</p>
            </div>
            <div>
                <?php if ($active_tab === 'editor'): ?>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-promotions&tab=list')); ?>" class="button button-secondary">&larr; Back to Campaigns</a>
                <?php else: ?>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-promotions&tab=editor')); ?>" class="button button-primary">+ Create New Promotion</a>
                <?php endif; ?>
            </div>
        </div>

        <?php if ($notice): ?>
            <div class="notice notice-<?php echo esc_attr($notice['type']); ?> is-dismissible">
                <p><strong><?php echo esc_html($notice['msg']); ?></strong></p>
            </div>
        <?php endif; ?>

        <nav class="nav-tab-wrapper" style="margin-bottom:20px;">
            <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-promotions&tab=list')); ?>" class="nav-tab <?php echo $active_tab === 'list' ? 'nav-tab-active' : ''; ?>">All Promotions (<?php echo count($promos); ?>)</a>
            <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-promotions&tab=editor' . ($promo_id > 0 ? '&promo_id=' . $promo_id : ''))); ?>" class="nav-tab <?php echo $active_tab === 'editor' ? 'nav-tab-active' : ''; ?>">
                <?php echo $promo_id > 0 ? 'Edit Promotion #' . $promo_id : '+ New Promotion'; ?>
            </a>
            <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-promotions&tab=analytics')); ?>" class="nav-tab <?php echo $active_tab === 'analytics' ? 'nav-tab-active' : ''; ?>">Campaign Analytics</a>
        </nav>

        <?php if ($active_tab === 'list'): ?>
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th>Campaign Code</th>
                        <th>Promotion Name / Slug</th>
                        <th>Status</th>
                        <th>Pricing &amp; Basis</th>
                        <th>Schedule (Africa/Harare)</th>
                        <th>Impressions</th>
                        <th>CTR / Enquiries</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($promos)): ?>
                        <tr><td colspan="8">No promotional campaigns created yet. Click <strong>+ Create New Promotion</strong> above to get started.</td></tr>
                    <?php else: foreach ($promos as $p):
                        $computed_status = outbound_evaluate_promotion_status($p);
                        $badge_class = match ($computed_status) {
                            'active' => 'outbound-badge-green',
                            'scheduled' => 'outbound-badge-blue',
                            'paused' => 'outbound-badge-amber',
                            'expired' => 'outbound-badge-red',
                            default => 'outbound-badge-gray',
                        };
                        $ctr = ($p->impressions_count > 0) ? round((($p->clicks_count + $p->whatsapp_clicks_count) / $p->impressions_count) * 100, 1) : 0;
                        $conv = ($p->impressions_count > 0) ? round(($p->enquiries_count / $p->impressions_count) * 100, 1) : 0;
                    ?>
                        <tr>
                            <td><code><?php echo esc_html($p->campaign_code); ?></code></td>
                            <td>
                                <strong><?php echo esc_html($p->name); ?></strong><br>
                                <span style="font-size:12px;color:#64748B;">/offers/<?php echo esc_html($p->slug); ?></span>
                            </td>
                            <td>
                                <span class="outbound-badge <?php echo esc_attr($badge_class); ?>" style="text-transform:uppercase;font-size:11px;padding:3px 8px;border-radius:12px;display:inline-block;">
                                    <?php echo esc_html($computed_status); ?>
                                </span>
                            </td>
                            <td>
                                <?php if ($p->promotional_price_usd !== null): ?>
                                    <strong>$<?php echo esc_html((string) $p->promotional_price_usd); ?> USD</strong>
                                    <?php if ($p->original_price_usd !== null): ?>
                                        <del style="color:#94A3B8;margin-left:4px;">$<?php echo esc_html((string) $p->original_price_usd); ?></del>
                                    <?php endif; ?>
                                    <div style="font-size:11px;color:#64748B;"><?php echo esc_html(str_replace('_', ' ', $p->price_basis)); ?></div>
                                <?php else: ?>
                                    <span style="color:#94A3B8;">Custom Quotation</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php
                                $s_label = function_exists('outbound_utc_to_harare_label') ? outbound_utc_to_harare_label($p->scheduled_start) : ($p->scheduled_start ?: 'Immediate');
                                $e_label = function_exists('outbound_utc_to_harare_label') ? outbound_utc_to_harare_label($p->scheduled_end) : ($p->scheduled_end ?: 'No expiry');
                                echo esc_html($s_label) . ' &rarr;<br>' . esc_html($e_label);
                                ?>
                            </td>
                            <td><strong><?php echo number_format((int) $p->impressions_count); ?></strong></td>
                            <td>
                                <span><?php echo $ctr; ?>% CTR (<?php echo (int) $p->clicks_count; ?> clicks, <?php echo (int) $p->whatsapp_clicks_count; ?> WA)</span><br>
                                <strong style="color:#0B5E8E;"><?php echo (int) $p->enquiries_count; ?> enquiries</strong> (<?php echo $conv; ?>% conv)
                            </td>
                            <td>
                                <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-promotions&tab=editor&promo_id=' . (int) $p->id)); ?>" class="button button-small">Edit</a>
                                <form method="post" style="display:inline-block;margin-left:4px;">
                                    <?php wp_nonce_field('outbound_promo_action', 'outbound_promo_nonce'); ?>
                                    <input type="hidden" name="outbound_promo_action" value="duplicate_promotion" />
                                    <input type="hidden" name="target_id" value="<?php echo (int) $p->id; ?>" />
                                    <button type="submit" class="button button-small">Duplicate</button>
                                </form>
                                <?php if ($computed_status === 'active'): ?>
                                    <form method="post" style="display:inline-block;margin-left:4px;">
                                        <?php wp_nonce_field('outbound_promo_action', 'outbound_promo_nonce'); ?>
                                        <input type="hidden" name="outbound_promo_action" value="toggle_status" />
                                        <input type="hidden" name="new_status" value="paused" />
                                        <input type="hidden" name="target_id" value="<?php echo (int) $p->id; ?>" />
                                        <button type="submit" class="button button-small">Pause</button>
                                    </form>
                                <?php elseif ($computed_status === 'paused'): ?>
                                    <form method="post" style="display:inline-block;margin-left:4px;">
                                        <?php wp_nonce_field('outbound_promo_action', 'outbound_promo_nonce'); ?>
                                        <input type="hidden" name="outbound_promo_action" value="toggle_status" />
                                        <input type="hidden" name="new_status" value="active" />
                                        <input type="hidden" name="target_id" value="<?php echo (int) $p->id; ?>" />
                                        <button type="submit" class="button button-small button-primary">Resume</button>
                                    </form>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>

        <?php elseif ($active_tab === 'editor'):
            $val_start_input = $edit_promo && function_exists('outbound_utc_to_harare_input') ? outbound_utc_to_harare_input($edit_promo->validity_start) : '';
            $val_end_input   = $edit_promo && function_exists('outbound_utc_to_harare_input') ? outbound_utc_to_harare_input($edit_promo->validity_end) : '';
            $sched_start_input = $edit_promo && function_exists('outbound_utc_to_harare_input') ? outbound_utc_to_harare_input($edit_promo->scheduled_start) : '';
            $sched_end_input   = $edit_promo && function_exists('outbound_utc_to_harare_input') ? outbound_utc_to_harare_input($edit_promo->scheduled_end) : '';
        ?>
            <form method="post" style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;">
                <?php wp_nonce_field('outbound_promo_action', 'outbound_promo_nonce'); ?>
                <input type="hidden" name="outbound_promo_action" value="save_promotion" />
                <input type="hidden" name="editing_promo_id" value="<?php echo (int) ($edit_promo->id ?? 0); ?>" />

                <div style="background:#fff;padding:24px;border-radius:12px;border:1px solid #E2E8F0;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <h2 style="margin-top:0;font-size:18px;border-bottom:1px solid #E2E8F0;padding-bottom:10px;">1. Basic Information</h2>
                    <p>
                        <label><strong>Promotion Name (Internal) *</strong><br>
                        <input type="text" name="name" value="<?php echo esc_attr((string) ($edit_promo->name ?? '')); ?>" class="widefat" required placeholder="e.g. Victoria Falls Green Season Getaway 2026" /></label>
                    </p>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <p>
                            <label><strong>Public Headline *</strong><br>
                            <input type="text" name="headline" value="<?php echo esc_attr((string) ($edit_promo->headline ?? '')); ?>" class="widefat" required placeholder="Save up to 30% on Victoria Falls Safari &amp; Stays" /></label>
                        </p>
                        <p>
                            <label><strong>Subtitle / Hook</strong><br>
                            <input type="text" name="subtitle" value="<?php echo esc_attr((string) ($edit_promo->subtitle ?? '')); ?>" class="widefat" placeholder="Limited early-bird bookings for couples &amp; families" /></label>
                        </p>
                    </div>
                    <p>
                        <label><strong>Short Description (Shown on Pop-up &amp; Card) *</strong><br>
                        <textarea name="short_description" rows="3" class="widefat" required placeholder="Experience the thundering mist of the falls with complimentary sunset cruise and private luxury airport transfers."><?php echo esc_textarea((string) ($edit_promo->short_description ?? '')); ?></textarea></label>
                    </p>
                    <p>
                        <label><strong>Full Offer Details (Optional Landing Page Content)</strong><br>
                        <textarea name="full_content" rows="6" class="widefat" placeholder="Detailed inclusions, day-by-day notes, and itinerary highlights for the offer landing page."><?php echo esc_textarea((string) ($edit_promo->full_content ?? '')); ?></textarea></label>
                    </p>

                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                        <p>
                            <label><strong>Promotional Badge (e.g. LIMITED OFFER)</strong><br>
                            <input type="text" name="badge_text" value="<?php echo esc_attr((string) ($edit_promo->badge_text ?? 'SPECIAL OFFER')); ?>" class="widefat" /></label>
                        </p>
                        <p>
                            <label><strong>Category</strong><br>
                            <select name="category" class="widefat">
                                <?php
                                $cats = array('all' => 'All Categories', 'packages' => 'Holiday Packages', 'experiences' => 'Activities & Tours', 'accommodation' => 'Luxury Stays');
                                foreach ($cats as $ck => $cv):
                                ?>
                                    <option value="<?php echo esc_attr($ck); ?>" <?php selected((string) ($edit_promo->category ?? 'all'), $ck); ?>><?php echo esc_html($cv); ?></option>
                                <?php endforeach; ?>
                            </select></label>
                        </p>
                        <p>
                            <label><strong>Destination / Activity Focus</strong><br>
                            <input type="text" name="destination_or_activity" value="<?php echo esc_attr((string) ($edit_promo->destination_or_activity ?? 'Victoria Falls')); ?>" class="widefat" /></label>
                        </p>
                    </div>

                    <div style="margin: 20px 0; padding: 16px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                        <label style="display:block; font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #1E293B;">
                            Promotional Campaign Image *
                        </label>
                        <div style="display: flex; gap: 16px; align-items: flex-start;">
                            <!-- Live Thumbnail Preview -->
                            <div id="promo_image_preview_box" style="width: 140px; height: 95px; border-radius: 8px; border: 2px dashed #CBD5E1; background: #FFFFFF; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <?php
                                $img_val = trim((string) ($edit_promo->image_url ?? ''));
                                if ($img_val !== '') :
                                    $preview_src = (str_starts_with($img_val, '/') && function_exists('home_url')) ? home_url($img_val) : $img_val;
                                ?>
                                    <img src="<?php echo esc_url($preview_src); ?>" alt="" style="width:100%;height:100%;object-fit:cover;" />
                                <?php else : ?>
                                    <div style="text-align:center;color:#94A3B8;font-size:11px;padding:6px;">
                                        <span class="dashicons dashicons-format-image" style="font-size:26px;width:26px;height:26px;display:block;margin:0 auto 2px;"></span>
                                        No image
                                    </div>
                                <?php endif; ?>
                            </div>

                            <!-- Controls: Input + Media Upload Button + Clear -->
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="text" id="promo_image_url" name="image_url" value="<?php echo esc_attr($img_val); ?>" class="widefat" required placeholder="Click 'Choose from Media Library' or enter image URL" style="font-family:monospace; font-size:13px;" />
                                    <button type="button" id="promo_media_upload_btn" class="button button-primary button-large" style="display:inline-flex; align-items:center; gap:6px; white-space:nowrap; padding: 0 14px; height: 38px;">
                                        <span class="dashicons dashicons-upload" style="margin-top:2px;"></span>
                                        <?php esc_html_e('Choose from Media Library', 'outbound-holidays'); ?>
                                    </button>
                                    <button type="button" id="promo_media_remove_btn" class="button button-secondary" style="white-space:nowrap; height: 38px; <?php echo $img_val !== '' ? '' : 'display:none;'; ?>">
                                        <?php esc_html_e('Remove', 'outbound-holidays'); ?>
                                    </button>
                                </div>
                                <p class="description" style="margin: 6px 0 0; font-size: 12px; color: #64748B;">
                                    Click <strong>Choose from Media Library</strong> to select or upload an image directly from your computer, or paste an image URL.
                                </p>
                            </div>
                        </div>

                        <!-- Image Alt Text -->
                        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #E2E8F0;">
                            <label style="display:block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #475569;">
                                Image Alt Text (for SEO &amp; Accessibility)
                            </label>
                            <input type="text" id="promo_image_alt" name="image_alt" value="<?php echo esc_attr((string) ($edit_promo->image_alt ?? '')); ?>" class="widefat" placeholder="Descriptive image text (e.g. Victoria Falls Sunset Cruise on the Zambezi)" />
                        </div>
                    </div>

                    <h2 style="font-size:18px;border-bottom:1px solid #E2E8F0;padding-bottom:10px;margin-top:28px;">2. Promotional Pricing (USD)</h2>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                        <p>
                            <label><strong>Original Price ($ USD)</strong><br>
                            <input type="number" step="0.01" name="original_price_usd" value="<?php echo esc_attr((string) ($edit_promo->original_price_usd ?? '')); ?>" class="widefat" placeholder="e.g. 1500" /></label>
                        </p>
                        <p>
                            <label><strong>Promotional Price ($ USD)</strong><br>
                            <input type="number" step="0.01" name="promotional_price_usd" value="<?php echo esc_attr((string) ($edit_promo->promotional_price_usd ?? '')); ?>" class="widefat" placeholder="e.g. 1050" /></label>
                        </p>
                        <p>
                            <label><strong>Custom Discount Badge (Optional)</strong><br>
                            <input type="text" name="discount_badge_override" value="<?php echo esc_attr((string) ($edit_promo->discount_badge_override ?? '')); ?>" class="widefat" placeholder="e.g. 25% OFF or SAVE $100" />
                            <span style="font-size:11px;color:#64748B;">Leave blank to auto-calculate from prices.</span></label>
                        </p>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                        <p>
                            <label><strong>Price Basis</strong><br>
                            <select name="price_basis" class="widefat">
                                <?php
                                $basis = array('per_person' => 'Per Person', 'per_couple' => 'Per Couple', 'per_family' => 'Per Family', 'per_booking' => 'Per Booking', 'per_night' => 'Per Night');
                                foreach ($basis as $bk => $bv):
                                ?>
                                    <option value="<?php echo esc_attr($bk); ?>" <?php selected((string) ($edit_promo->price_basis ?? 'per_person'), $bk); ?>><?php echo esc_html($bv); ?></option>
                                <?php endforeach; ?>
                            </select></label>
                        </p>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <p>
                            <label><strong>Travel Validity Start (CAT)</strong><br>
                            <input type="datetime-local" name="validity_start_harare" value="<?php echo esc_attr($val_start_input); ?>" class="widefat" /></label>
                        </p>
                        <p>
                            <label><strong>Travel Validity End (CAT)</strong><br>
                            <input type="datetime-local" name="validity_end_harare" value="<?php echo esc_attr($val_end_input); ?>" class="widefat" /></label>
                        </p>
                    </div>
                    <p>
                        <label><strong>Terms and Conditions</strong><br>
                        <textarea name="terms_and_conditions" rows="2" class="widefat" placeholder="Subject to availability. High water season supplements may apply. Valid for direct enquiries only."><?php echo esc_textarea((string) ($edit_promo->terms_and_conditions ?? '')); ?></textarea></label>
                    </p>

                    <h2 style="font-size:18px;border-bottom:1px solid #E2E8F0;padding-bottom:10px;margin-top:28px;">3. Call to Action Settings</h2>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <p>
                            <label><strong>Primary CTA Button Label</strong><br>
                            <input type="text" name="primary_cta_label" value="<?php echo esc_attr((string) ($edit_promo->primary_cta_label ?? 'Enquire About This Offer')); ?>" class="widefat" required /></label>
                        </p>
                        <p>
                            <label><strong>Primary Action Destination</strong><br>
                            <select name="primary_cta_destination" class="widefat">
                                <option value="enquiry_form" <?php selected((string) ($edit_promo->primary_cta_destination ?? 'enquiry_form'), 'enquiry_form'); ?>>Promotion-Linked Enquiry Form (Modal)</option>
                                <option value="whatsapp" <?php selected((string) ($edit_promo->primary_cta_destination ?? ''), 'whatsapp'); ?>>Direct WhatsApp Enquiry (+263 714 701 721)</option>
                                <option value="offer_page" <?php selected((string) ($edit_promo->primary_cta_destination ?? ''), 'offer_page'); ?>>Dedicated Offer Page (/offers/:slug)</option>
                                <option value="custom_url" <?php selected((string) ($edit_promo->primary_cta_destination ?? ''), 'custom_url'); ?>>Custom Internal Route / Packages Page</option>
                            </select></label>
                        </p>
                    </div>
                    <p>
                        <label><strong>Custom Target Route / URL (if Custom Internal Route selected)</strong><br>
                        <input type="text" name="primary_cta_target" value="<?php echo esc_attr((string) ($edit_promo->primary_cta_target ?? '')); ?>" class="widefat" placeholder="/packages/signature-victoria-falls-experience" /></label>
                    </p>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <p>
                            <label><strong>Secondary CTA Button Label (Optional)</strong><br>
                            <input type="text" name="secondary_cta_label" value="<?php echo esc_attr((string) ($edit_promo->secondary_cta_label ?? 'View Offer Details')); ?>" class="widefat" /></label>
                        </p>
                        <p>
                            <label><strong>Secondary Action Destination</strong><br>
                            <select name="secondary_cta_destination" class="widefat">
                                <option value="offer_page" <?php selected((string) ($edit_promo->secondary_cta_destination ?? 'offer_page'), 'offer_page'); ?>>Dedicated Offer Page (/offers/:slug)</option>
                                <option value="whatsapp" <?php selected((string) ($edit_promo->secondary_cta_destination ?? ''), 'whatsapp'); ?>>WhatsApp Direct (+263 714 701 721)</option>
                                <option value="custom_url" <?php selected((string) ($edit_promo->secondary_cta_destination ?? ''), 'custom_url'); ?>>Custom Internal Route</option>
                            </select></label>
                        </p>
                    </div>

                    <p>
                        <label><strong>WhatsApp Prefilled Message Template</strong><br>
                        <textarea name="whatsapp_prefill_template" rows="2" class="widefat" placeholder="Hello Outbound Holidays, I am interested in your {name} offer. Please could you share availability, pricing and booking details?"><?php echo esc_textarea((string) ($edit_promo->whatsapp_prefill_template ?? '')); ?></textarea>
                        <span style="font-size:11px;color:#64748B;">Leave blank to use default template with automatic promotion name insertion.</span></label>
                    </p>
                </div>

                <!-- Sidebar Publication & Trigger Controls -->
                <div style="display:flex;flex-direction:column;gap:16px;">
                    <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #E2E8F0;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <h3 style="margin-top:0;font-size:16px;">Publish Status</h3>
                        <p>
                            <label><input type="checkbox" name="is_enabled" value="1" <?php checked(!empty($edit_promo->is_enabled) || !$edit_promo); ?> /> <strong>Campaign Active / Enabled</strong></label>
                        </p>
                        <p>
                            <label><strong>Display Priority (Higher = First)</strong><br>
                            <input type="number" name="display_priority" value="<?php echo (int) ($edit_promo->display_priority ?? 10); ?>" class="widefat" /></label>
                        </p>
                        <p>
                            <label><strong>Publication Start (Africa/Harare)</strong><br>
                            <input type="datetime-local" name="scheduled_start_harare" value="<?php echo esc_attr($sched_start_input); ?>" class="widefat" /></label>
                        </p>
                        <p>
                            <label><strong>Publication Expiration (Africa/Harare)</strong><br>
                            <input type="datetime-local" name="scheduled_end_harare" value="<?php echo esc_attr($sched_end_input); ?>" class="widefat" /></label>
                        </p>

                        <div style="margin-top:20px;display:flex;flex-direction:column;gap:8px;">
                            <button type="submit" name="submit_mode" value="publish_now" class="button button-primary button-large" style="width:100%;text-align:center;">
                                <?php echo outbound_can_manage_promotions('publish') ? 'Publish Immediately' : 'Submit for Review'; ?>
                            </button>
                            <button type="submit" name="submit_mode" value="schedule" class="button button-secondary" style="width:100%;text-align:center;">
                                Schedule Publication
                            </button>
                            <button type="submit" name="submit_mode" value="draft" class="button button-secondary" style="width:100%;text-align:center;">
                                Save Draft
                            </button>
                        </div>
                    </div>

                    <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #E2E8F0;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <h3 style="margin-top:0;font-size:16px;">Placements &amp; Visibility</h3>
                        <p><label><input type="checkbox" name="show_as_popup" value="1" <?php checked(!empty($edit_promo->show_as_popup) || !$edit_promo); ?> /> Show as Pop-up Modal</label></p>
                        <p><label><input type="checkbox" name="show_as_card" value="1" <?php checked(!empty($edit_promo->show_as_card)); ?> /> Show as Promotion Card on Homepage</label></p>
                        <p><label><input type="checkbox" name="show_on_homepage" value="1" <?php checked(!empty($edit_promo->show_on_homepage) || !$edit_promo); ?> /> Allow on Homepage</label></p>
                        <p>
                            <label><strong>Target Pages (CSV, optional)</strong><br>
                            <?php
                            $tp_csv = '';
                            if ($edit_promo && !empty($edit_promo->target_pages_json)) {
                                $dec = json_decode((string) $edit_promo->target_pages_json, true);
                                if (is_array($dec)) { $tp_csv = implode(', ', $dec); }
                            }
                            ?>
                            <input type="text" name="target_pages_csv" value="<?php echo esc_attr($tp_csv); ?>" class="widefat" placeholder="/, /victoria-falls-packages" />
                            <span style="font-size:11px;color:#64748B;">Leave blank to display on all eligible pages.</span></label>
                        </p>
                    </div>

                    <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #E2E8F0;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <h3 style="margin-top:0;font-size:16px;">Pop-up Trigger &amp; Frequency</h3>
                        <p>
                            <label><strong>Trigger Mode</strong><br>
                            <select name="trigger_mode" class="widefat">
                                <option value="delay" <?php selected((string) ($edit_promo->trigger_mode ?? 'delay'), 'delay'); ?>>Timed Delay</option>
                                <option value="scroll" <?php selected((string) ($edit_promo->trigger_mode ?? ''), 'scroll'); ?>>Scroll Depth %</option>
                                <option value="exit_intent" <?php selected((string) ($edit_promo->trigger_mode ?? ''), 'exit_intent'); ?>>Exit Intent (Desktop)</option>
                            </select></label>
                        </p>
                        <p>
                            <label><strong>Delay Seconds (default 8s)</strong><br>
                            <input type="number" name="trigger_delay_seconds" value="<?php echo (int) ($edit_promo->trigger_delay_seconds ?? 8); ?>" min="1" class="widefat" /></label>
                        </p>
                        <p>
                            <label><strong>Scroll Depth % (default 40%)</strong><br>
                            <input type="number" name="trigger_scroll_percentage" value="<?php echo (int) ($edit_promo->trigger_scroll_percentage ?? 40); ?>" min="10" max="95" class="widefat" /></label>
                        </p>
                        <p>
                            <label><strong>Max Impressions / Visitor</strong><br>
                            <input type="number" name="max_impressions_per_visitor" value="<?php echo (int) ($edit_promo->max_impressions_per_visitor ?? 1); ?>" min="1" class="widefat" /></label>
                        </p>
                        <p>
                            <label><strong>Frequency Cap Reset (Hours)</strong><br>
                            <input type="number" name="frequency_reset_hours" value="<?php echo (int) ($edit_promo->frequency_reset_hours ?? 24); ?>" min="1" class="widefat" /></label>
                        </p>
                    </div>
                </div>
            </form>

        <?php elseif ($active_tab === 'analytics'):
            $events_summary = $wpdb->get_results(
                "SELECT p.id, p.campaign_code, p.name,
                        p.impressions_count, p.clicks_count, p.whatsapp_clicks_count, p.enquiries_count,
                        COUNT(e.id) as total_events
                 FROM {$tables['promotions']} p
                 LEFT JOIN {$tables['promotion_events']} e ON e.promotion_id = p.id
                 GROUP BY p.id
                 ORDER BY p.id DESC"
            );
            $utm_sources = $wpdb->get_results(
                "SELECT utm_source, COUNT(*) as cnt
                 FROM {$tables['promotion_events']}
                 WHERE utm_source IS NOT NULL AND utm_source != ''
                 GROUP BY utm_source
                 ORDER BY cnt DESC LIMIT 10"
            );
        ?>
            <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
                <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #E2E8F0;">
                    <h3 style="margin-top:0;">Campaign Performance Summary</h3>
                    <table class="widefat striped">
                        <thead>
                            <tr><th>Code</th><th>Name</th><th>Impressions</th><th>Clicks</th><th>WhatsApp</th><th>Enquiries</th><th>CTR</th><th>Conv %</th></tr>
                        </thead>
                        <tbody>
                            <?php if (empty($events_summary)): ?>
                                <tr><td colspan="8">No campaign events recorded yet.</td></tr>
                            <?php else: foreach ($events_summary as $es):
                                $impr = (int) $es->impressions_count;
                                $clks = (int) $es->clicks_count + (int) $es->whatsapp_clicks_count;
                                $enq  = (int) $es->enquiries_count;
                                $ctr  = $impr > 0 ? round(($clks / $impr) * 100, 1) : 0;
                                $conv = $impr > 0 ? round(($enq / $impr) * 100, 1) : 0;
                            ?>
                                <tr>
                                    <td><code><?php echo esc_html($es->campaign_code); ?></code></td>
                                    <td><strong><?php echo esc_html($es->name); ?></strong></td>
                                    <td><?php echo number_format($impr); ?></td>
                                    <td><?php echo number_format((int) $es->clicks_count); ?></td>
                                    <td><?php echo number_format((int) $es->whatsapp_clicks_count); ?></td>
                                    <td><strong style="color:#0B5E8E;"><?php echo number_format($enq); ?></strong></td>
                                    <td><?php echo $ctr; ?>%</td>
                                    <td><strong><?php echo $conv; ?>%</strong></td>
                                </tr>
                            <?php endforeach; endif; ?>
                        </tbody>
                    </table>
                </div>

                <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #E2E8F0;">
                    <h3 style="margin-top:0;">Attributed Traffic Sources (UTM)</h3>
                    <table class="widefat striped">
                        <thead><tr><th>UTM Source</th><th>Events</th></tr></thead>
                        <tbody>
                            <?php if (empty($utm_sources)): ?>
                                <tr><td colspan="2">No tagged traffic sources recorded yet.</td></tr>
                            <?php else: foreach ($utm_sources as $u): ?>
                                <tr>
                                    <td><strong><?php echo esc_html($u->utm_source); ?></strong></td>
                                    <td><?php echo number_format((int) $u->cnt); ?></td>
                                </tr>
                            <?php endforeach; endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php endif; ?>

        <script>
        jQuery(document).ready(function($) {
            var promoMediaFrame;

            $('#promo_media_upload_btn').on('click', function(e) {
                e.preventDefault();
                if (typeof wp === 'undefined' || !wp.media) {
                    alert('WordPress Media Library is not available. Please refresh the page.');
                    return;
                }

                if (promoMediaFrame) {
                    promoMediaFrame.open();
                    return;
                }

                promoMediaFrame = wp.media({
                    title: 'Select or Upload Promotional Campaign Image',
                    button: { text: 'Use This Promotional Image' },
                    library: { type: 'image' },
                    multiple: false
                });

                promoMediaFrame.on('select', function() {
                    var attachment = promoMediaFrame.state().get('selection').first().toJSON();
                    if (attachment && attachment.url) {
                        $('#promo_image_url').val(attachment.url).trigger('change');
                        if (attachment.alt && !$('#promo_image_alt').val()) {
                            $('#promo_image_alt').val(attachment.alt);
                        }
                        updatePromoPreview(attachment.url);
                    }
                });

                promoMediaFrame.open();
            });

            $('#promo_media_remove_btn').on('click', function(e) {
                e.preventDefault();
                $('#promo_image_url').val('').trigger('change');
                updatePromoPreview('');
            });

            $('#promo_image_url').on('input change', function() {
                updatePromoPreview($(this).val());
            });

            function updatePromoPreview(url) {
                url = $.trim(url);
                var $box = $('#promo_image_preview_box');
                if (url) {
                    var displaySrc = url;
                    if (displaySrc.indexOf('http') !== 0 && displaySrc.indexOf('//') !== 0 && window.location.origin) {
                        displaySrc = (displaySrc.indexOf('/') === 0 ? window.location.origin : (window.location.origin + '/')) + displaySrc;
                    }
                    $box.html('<img src="' + $('<div>').text(displaySrc).html() + '" alt="" style="width:100%;height:100%;object-fit:cover;" />');
                    $('#promo_media_remove_btn').show();
                } else {
                    $box.html('<div style="text-align:center;color:#94A3B8;font-size:11px;padding:6px;"><span class="dashicons dashicons-format-image" style="font-size:26px;width:26px;height:26px;display:block;margin:0 auto 2px;"></span>No image</div>');
                    $('#promo_media_remove_btn').hide();
                }
            }
        });
        </script>
    </div>
    <?php
}

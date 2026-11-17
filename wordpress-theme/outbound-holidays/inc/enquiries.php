<?php
/**
 * Customer Enquiries & Holiday Builder Persistence, Validation, Estimation & WP Admin Console.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Return allowed enquiry workflow statuses.
 *
 * @return array<string, string>
 */
function outbound_get_enquiry_statuses(): array {
    return array(
        'new'       => 'New',
        'contacted' => 'Contacted',
        'quoted'    => 'Quoted',
        'follow-up' => 'Follow-up',
        'booked'    => 'Booked',
        'closed'    => 'Closed',
        'archived'  => 'Archived',
    );
}

/**
 * Neutralize spreadsheet formula injection prefixes in CSV export cells.
 */
function outbound_csv_safe_cell(string $cell): string {
    if ($cell !== '' && in_array($cell[0], array('=', '+', '-', '@', "\t", "\r"), true)) {
        return "'" . $cell;
    }
    return $cell;
}

/**
 * Return normalized catalog context (`stayTiers`, `accommodations`, `activities`) for enquiry pricing & resolution.
 *
 * @return array{stayTiers:array<int,array<string,mixed>>,accommodations:array<int,array<string,mixed>>,activities:array<int,array<string,mixed>>}
 */
function outbound_get_enquiry_catalog_context(): array {
    $snap = function_exists('outbound_build_live_snapshot')
        ? outbound_build_live_snapshot()
        : (function_exists('outbound_get_baseline_snapshot') ? outbound_get_baseline_snapshot() : array());

    $activities = array();
    foreach ((array) ($snap['builderActivities'] ?? array()) as $act) {
        if (!is_array($act) || empty($act['id'])) {
            continue;
        }
        $activities[] = array(
            'id'          => (string) $act['id'],
            'title'       => (string) ($act['title'] ?? $act['id']),
            'duration'    => (string) ($act['duration'] ?? ''),
            'priceAmount' => (float) ($act['priceUSD'] ?? ($act['priceAmount'] ?? 0)),
        );
    }

    return array(
        'stayTiers'      => array_values((array) ($snap['stayTiers'] ?? array())),
        'accommodations' => array_values((array) ($snap['accommodations'] ?? array())),
        'activities'     => $activities,
    );
}

/**
 * Build a structured enquiry snapshot and itemized USD estimate from a submission payload and catalog.
 *
 * @param array<string, mixed> $payload
 * @param array<string, mixed> $catalog
 * @return array<string, mixed>
 */
function outbound_build_enquiry_snapshot(array $payload, array $catalog = array()): array {
    if (empty($catalog)) {
        $catalog = outbound_get_enquiry_catalog_context();
    }
    $trip      = isset($payload['trip']) && is_array($payload['trip']) ? $payload['trip'] : array();
    $adults    = max(1, (int) ($payload['adultsCount'] ?? ($trip['adults'] ?? ($payload['adults'] ?? 2))));
    $children  = max(0, (int) ($payload['kidsCount'] ?? ($trip['children'] ?? ($payload['children'] ?? 0))));
    $nights    = max(1, (int) ($payload['nightsCount'] ?? ($trip['nights'] ?? ($payload['nights'] ?? 3))));
    $transport = (string) ($payload['transportType'] ?? ($trip['transportType'] ?? 'private-transfers'));
    $tier_id   = (string) ($payload['stayTierId'] ?? ($trip['stayTierId'] ?? 'comfort-plus'));
    $acc_id    = (string) ($payload['accommodationId'] ?? ($trip['accommodationId'] ?? ''));

    $stay_rate = 235.0;
    foreach ((array) ($catalog['stayTiers'] ?? array()) as $t) {
        if (is_array($t) && (string) ($t['id'] ?? '') === $tier_id) {
            $stay_rate = (float) ($t['pricePerNightUSD'] ?? ($t['startingPrice'] ?? 235.0));
            break;
        }
    }

    $acc_name = (string) ($trip['accommodationName'] ?? ($payload['propertyName'] ?? ''));
    if ($acc_id !== '') {
        foreach ((array) ($catalog['accommodations'] ?? array()) as $acc) {
            if (is_array($acc) && ((string) ($acc['id'] ?? '') === $acc_id || (string) ($acc['slug'] ?? '') === $acc_id)) {
                $acc_name  = (string) ($acc['name'] ?? $acc_name);
                $stay_rate = (float) ($acc['priceFromUSD'] ?? $stay_rate);
                break;
            }
        }
    }

    $act_map = array();
    foreach ((array) ($catalog['activities'] ?? array()) as $act) {
        if (is_array($act) && !empty($act['id'])) {
            $act_map[(string) $act['id']] = $act;
        }
    }

    $raw_act_ids = (array) ($payload['selectedActivityIds'] ?? ($trip['activityIds'] ?? array()));
    $selected_activities = array();
    $activity_rates = array();
    foreach ($raw_act_ids as $raw_id) {
        $aid = (string) $raw_id;
        $matched = $act_map[$aid] ?? null;
        if (!$matched) {
            foreach ($act_map as $cand_id => $cand) {
                if (str_starts_with($cand_id, $aid) || str_starts_with($aid, $cand_id)) {
                    $matched = $cand;
                    break;
                }
            }
        }
        if ($matched) {
            $price = (float) ($matched['priceAmount'] ?? ($matched['priceUSD'] ?? 0));
            $selected_activities[] = array(
                'id'          => (string) $matched['id'],
                'title'       => (string) ($matched['title'] ?? $aid),
                'duration'    => (string) ($matched['duration'] ?? ''),
                'priceAmount' => $price,
            );
            $activity_rates[] = $price;
        }
    }

    $est = outbound_calculate_holiday_estimate(array(
        'nights'           => $nights,
        'adults'           => $adults,
        'children'         => $children,
        'stayNightRateUSD' => $stay_rate,
        'activityRatesUSD' => $activity_rates,
        'transportType'    => $transport,
    ));
    $rooms = max(1, (int) ($est['rooms'] ?? ceil(($adults + $children) / 2)));
    $est['stayCost']      = (int) round($stay_rate * $nights * $rooms);
    $est['activityCost']  = (int) round(array_sum($activity_rates) * ($adults + ($children * 0.8)));
    $est['transportCost'] = $transport === 'private-transfers'
        ? 120
        : ($transport === 'shared-shuttle' ? 60 : ($transport === 'VIP-helicopter' ? 680 : 0));

    return array(
        'entryMode'          => (string) ($trip['entryMode'] ?? 'custom'),
        'country'            => (string) ($trip['country'] ?? ($payload['country'] ?? '')),
        'arrivalDate'        => (string) ($trip['arrivalDate'] ?? ($payload['checkInDate'] ?? '')),
        'departureDate'      => (string) ($trip['departureDate'] ?? ($payload['checkOutDate'] ?? '')),
        'childrenAges'       => (string) ($trip['childrenAges'] ?? ''),
        'roomType'           => (string) ($trip['roomType'] ?? ($payload['roomType'] ?? '')),
        'celebrationDetails' => (string) ($trip['celebrationDetails'] ?? ''),
        'adults'             => $adults,
        'children'           => $children,
        'nights'             => $nights,
        'accommodationId'    => $acc_id,
        'accommodationName'  => $acc_name,
        'selectedActivities' => $selected_activities,
        'estimate'           => $est,
        'notes'              => (string) ($payload['notes'] ?? ($payload['message'] ?? '')),
    );
}

/**
 * Extract structured enquiry details from a stored DB row (preserving historical estimate bounds).
 */
function outbound_extract_enquiry_details(object $row): array {
    $decoded = !empty($row->payload_json) ? json_decode((string) $row->payload_json, true) : array();
    $snap = outbound_build_enquiry_snapshot(is_array($decoded) ? $decoded : array());
    if (!empty($row->estimate_min_usd)) {
        $snap['estimate']['minimum'] = (int) $row->estimate_min_usd;
        $snap['estimate']['maximum'] = (int) ($row->estimate_max_usd ?? $row->estimate_min_usd);
    }
    return $snap;
}

/**
 * Build specialist and customer HTML email payloads for an enquiry.
 *
 * @param array<string, mixed> $ctx
 * @return array{specialist_subject:string,customer_subject:string,specialist_html:string,customer_html:string}
 */
function outbound_build_enquiry_emails(array $ctx): array {
    $ref       = (string) ($ctx['reference'] ?? '');
    $name      = (string) ($ctx['name'] ?? 'Guest');
    $notes     = (string) ($ctx['notes'] ?? '');
    $whatsapp  = (string) ($ctx['whatsapp_display'] ?? '+263 714 701 721');
    $estimate  = isset($ctx['estimate']) && is_array($ctx['estimate']) ? $ctx['estimate'] : array();
    $min       = (int) ($estimate['minimum'] ?? 0);
    $max       = (int) ($estimate['maximum'] ?? $min);
    $struct    = isset($ctx['structured']) && is_array($ctx['structured']) ? $ctx['structured'] : array();
    $acc_name  = (string) ($struct['accommodationName'] ?? ($ctx['accommodationName'] ?? ''));

    $exp_titles = array();
    foreach ((array) ($ctx['experiences'] ?? array()) as $exp) {
        if (is_string($exp) && $exp !== '') {
            $exp_titles[] = $exp;
        } elseif (is_array($exp) && !empty($exp['title'])) {
            $exp_titles[] = (string) $exp['title'];
        }
    }

    $budget_str = $min > 0 ? sprintf('US$%s&ndash;%s', number_format($min), number_format($max)) : 'Available on quotation';
    $exp_html   = !empty($exp_titles) ? '<ul><li>' . implode('</li><li>', array_map('esc_html', $exp_titles)) . '</li></ul>' : '';
    $acc_html   = $acc_name !== '' ? '<p><strong>Accommodation:</strong> ' . esc_html($acc_name) . '</p>' : '';

    $customer_html = "<div><p>YOUR ENQUIRY REFERENCE: <strong>" . esc_html($ref) . "</strong></p>"
        . "<p>Dear " . esc_html($name) . ",</p>"
        . "<p>Estimated Budget: {$budget_str}</p>"
        . $acc_html . $exp_html
        . "<p>WhatsApp Concierge: " . esc_html($whatsapp) . "</p></div>";

    $specialist_html = "<div><h2>New Holiday Enquiry (" . esc_html($ref) . ")</h2>"
        . "<p><strong>Customer:</strong> " . esc_html($name) . "</p>"
        . "<p><strong>Estimated Budget:</strong> {$budget_str}</p>"
        . $acc_html . $exp_html
        . "<p><strong>Notes:</strong> " . esc_html($notes) . "</p></div>";

    return array(
        'specialist_subject' => sprintf('New Holiday Enquiry | %s | %s', $ref, $name),
        'customer_subject'   => sprintf('Your Victoria Falls Holiday Enquiry (%s)', $ref),
        'specialist_html'    => $specialist_html,
        'customer_html'      => $customer_html,
    );
}

/**
 * Check DB-backed sliding window rate limit for spam protection.
 */
function outbound_check_rate_limit(string $bucket, string $ip, int $max_attempts = 8, int $window_seconds = 600): bool {
    if (!isset($GLOBALS['wpdb'])) {
        return true;
    }
    global $wpdb;
    $tables = outbound_get_table_names();
    $rate_key = hash('sha256', $bucket . '|' . $ip);
    $now = gmdate('Y-m-d H:i:s');
    $reset_at = gmdate('Y-m-d H:i:s', time() + $window_seconds);

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    $row = $wpdb->get_row($wpdb->prepare(
        "SELECT id, attempts, window_reset_at FROM {$tables['rate_limits']} WHERE rate_key = %s LIMIT 1",
        $rate_key
    ));

    if (!$row) {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->insert($tables['rate_limits'], array(
            'rate_key'        => $rate_key,
            'attempts'        => 1,
            'window_reset_at' => $reset_at,
        ), array('%s', '%d', '%s'));
        return true;
    }

    if ((string) $row->window_reset_at <= $now) {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->update($tables['rate_limits'], array(
            'attempts'        => 1,
            'window_reset_at' => $reset_at,
        ), array('id' => (int) $row->id), array('%d', '%s'), array('%d'));
        return true;
    }

    if ((int) $row->attempts >= $max_attempts) {
        return false;
    }

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    $wpdb->update($tables['rate_limits'], array(
        'attempts' => (int) $row->attempts + 1,
    ), array('id' => (int) $row->id), array('%d'), array('%d'));

    return true;
}

/**
 * Verify Cloudflare Turnstile token if configured in setup.
 */
function outbound_verify_turnstile(?string $token, string $remote_ip): bool {
    $cfg = outbound_get_turnstile_config();
    if ($cfg['secretKey'] === '') {
        return true; // Turnstile not enabled on host.
    }
    if (!$token) {
        return false;
    }
    if (!function_exists('wp_remote_post')) {
        return true;
    }

    $response = wp_remote_post('https://challenges.cloudflare.com/turnstile/v0/siteverify', array(
        'timeout' => 8,
        'body'    => array(
            'secret'   => $cfg['secretKey'],
            'response' => $token,
            'remoteip' => $remote_ip,
        ),
    ));

    if (is_wp_error($response)) {
        return false;
    }
    $body = json_decode((string) wp_remote_retrieve_body($response), true);
    return !empty($body['success']);
}

/**
 * Resolve client IP address respecting standard headers safely.
 */
function outbound_get_client_ip(): string {
    $candidates = array(
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    );
    foreach ($candidates as $raw) {
        if ($raw === '') {
            continue;
        }
        $first = trim(explode(',', (string) $raw)[0]);
        if (filter_var($first, FILTER_VALIDATE_IP)) {
            return $first;
        }
    }
    return '0.0.0.0';
}

/**
 * Validate and persist an enquiry (holiday-builder or contact form).
 *
 * @param array<string, mixed> $payload
 * @return array<string, mixed>|WP_Error
 */
function outbound_process_enquiry_submission(array $payload, string $client_ip) {
    // Honeypot anti-spam trap.
    if (!empty($payload['website']) || !empty($payload['honeypot'])) {
        return new WP_Error('spam_detected', 'Submission blocked by anti-spam protection.', array('status' => 400));
    }

    if (!outbound_check_rate_limit('enquiry', $client_ip, 10, 600)) {
        return new WP_Error('rate_limited', 'Too many requests in a short window. Please wait a few minutes or message us on WhatsApp.', array('status' => 429));
    }

    $turnstile_token = isset($payload['turnstileToken']) ? sanitize_text_field((string) $payload['turnstileToken']) : '';
    if (!outbound_verify_turnstile($turnstile_token, $client_ip)) {
        return new WP_Error('captcha_failed', 'Security verification could not be completed.', array('status' => 400));
    }

    $raw_source = (string) ($payload['type'] ?? ($payload['source'] ?? 'holiday-builder'));
    $allowed_types = array('holiday-builder', 'contact', 'activity-enquiry', 'package-enquiry', 'accommodation-enquiry');
    $type = in_array($raw_source, $allowed_types, true) ? $raw_source : 'holiday-builder';
    $trip = isset($payload['trip']) && is_array($payload['trip']) ? $payload['trip'] : array();

    $full_name = sanitize_text_field((string) ($payload['fullName'] ?? ($payload['name'] ?? '')));
    $raw_email = trim((string) ($payload['email'] ?? ''));
    $email     = $raw_email !== '' ? sanitize_email($raw_email) : '';
    $phone     = sanitize_text_field((string) ($payload['phone'] ?? ''));
    $phone_digits = preg_replace('/\D+/', '', $phone) ?: '';

    if ($full_name === '') {
        return new WP_Error('validation_error', 'Please enter your full name.', array('status' => 400));
    }
    if ($raw_email !== '' && !is_email($email)) {
        return new WP_Error('validation_error', 'Please enter a valid email address.', array('status' => 400));
    }
    if (!is_email($email) && strlen($phone_digits) < 7) {
        return new WP_Error('validation_error', 'Please provide at least one valid contact method (email or WhatsApp/phone number).', array('status' => 400));
    }

    $idempotency_key = sanitize_text_field((string) ($_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? ($payload['idempotencyKey'] ?? '')));
    if ($idempotency_key !== '' && isset($GLOBALS['wpdb'])) {
        global $wpdb;
        $tables = outbound_get_table_names();
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $existing_row = $wpdb->get_row($wpdb->prepare(
            "SELECT id, reference_code, full_name FROM {$tables['enquiries']} WHERE idempotency_key = %s LIMIT 1",
            $idempotency_key
        ));
        if ($existing_row) {
            return array(
                'saved'         => true,
                'ok'            => true,
                'deduplicated'  => true,
                'reference'     => (string) $existing_row->reference_code,
                'referenceCode' => (string) $existing_row->reference_code,
                'customerName'  => (string) $existing_row->full_name,
                'submittedAt'   => gmdate('c'),
                'message'       => 'Your enquiry has already been recorded.',
            );
        }
    }

    $adults        = max(1, (int) ($payload['adultsCount'] ?? ($trip['adults'] ?? ($payload['adults'] ?? 2))));
    $children      = max(0, (int) ($payload['kidsCount'] ?? ($trip['children'] ?? ($payload['children'] ?? 0))));
    $nights        = max(1, (int) ($payload['nightsCount'] ?? ($trip['nights'] ?? ($payload['nights'] ?? 3))));
    $party_type    = sanitize_text_field((string) ($payload['partyType'] ?? ($trip['partyType'] ?? 'couple')));
    $trip_intent   = sanitize_text_field((string) ($payload['tripIntent'] ?? ($trip['intent'] ?? 'first-time')));
    $travel_season = sanitize_text_field((string) ($payload['travelSeason'] ?? ($trip['travelDates'] ?? 'flexible')));
    $stay_tier_id  = sanitize_text_field((string) ($payload['stayTierId'] ?? ($trip['stayTierId'] ?? 'comfort-plus')));
    $transport     = sanitize_text_field((string) ($payload['transportType'] ?? ($trip['transportType'] ?? 'private-transfers')));
    $subject       = sanitize_text_field((string) ($payload['subject'] ?? ($type === 'contact' ? 'Contact Page Enquiry' : 'Victoria Falls Enquiry')));
    $notes         = sanitize_textarea_field((string) ($payload['notes'] ?? ($payload['message'] ?? '')));
    $marketing     = !empty($payload['marketingConsent']);

    // Server-side authoritative rate lookup & pricing calculation.
    $stay_rate = 235.0;
    $stay_tier_name = sanitize_text_field((string) ($trip['stayTierName'] ?? ''));
    foreach (outbound_get_builder_stay_tiers() as $tier) {
        if ((string) ($tier['id'] ?? '') === $stay_tier_id) {
            $stay_rate = (float) ($tier['pricePerNightUSD'] ?? ($tier['startingPrice'] ?? 235.0));
            if ($stay_tier_name === '' && !empty($tier['name'])) {
                $stay_tier_name = sanitize_text_field((string) $tier['name']);
            }
            break;
        }
    }
    if ($stay_tier_name === '') {
        $stay_tier_name = ucwords(str_replace('-', ' ', $stay_tier_id));
    }

    $raw_act_ids = $payload['selectedActivityIds'] ?? ($trip['activityIds'] ?? array());
    $selected_activity_ids = array_map('sanitize_text_field', (array) $raw_act_ids);
    $activity_catalog = array();
    $activity_titles_map = array();
    foreach (outbound_get_builder_activities() as $act) {
        $act_key = (string) ($act['id'] ?? '');
        if ($act_key !== '') {
            $activity_catalog[$act_key]    = (float) ($act['priceAmount'] ?? 0);
            $activity_titles_map[$act_key] = sanitize_text_field((string) ($act['title'] ?? $act_key));
        }
    }
    $activity_rates  = array();
    $activity_titles = array();
    foreach ($selected_activity_ids as $act_id) {
        if (isset($activity_catalog[$act_id])) {
            $activity_rates[] = $activity_catalog[$act_id];
        }
        if (isset($activity_titles_map[$act_id])) {
            $activity_titles[] = $activity_titles_map[$act_id];
        }
    }
    if (empty($activity_titles) && !empty($trip['selectedActivities']) && is_array($trip['selectedActivities'])) {
        foreach ($trip['selectedActivities'] as $sel_act) {
            if (is_array($sel_act) && !empty($sel_act['title'])) {
                $activity_titles[] = sanitize_text_field((string) $sel_act['title']);
            }
        }
    }
    if (empty($activity_titles) && !empty($selected_activity_ids)) {
        $activity_titles = array_map(function ($id) {
            return ucwords(str_replace('-', ' ', $id));
        }, $selected_activity_ids);
    }

    $stay_preferences = array();
    $raw_prefs = $trip['stayPreferences'] ?? ($payload['stayPreferences'] ?? array());
    if (is_array($raw_prefs)) {
        foreach ($raw_prefs as $pref) {
            $clean_pref = sanitize_text_field((string) $pref);
            if ($clean_pref !== '') {
                $stay_preferences[] = $clean_pref;
            }
        }
    }

    $itinerary_draft = array();
    if (!empty($trip['itineraryDraft']) && is_array($trip['itineraryDraft'])) {
        foreach (array_slice($trip['itineraryDraft'], 0, 14) as $day_item) {
            if (!is_array($day_item)) {
                continue;
            }
            $day_label = sanitize_text_field((string) ($day_item['day'] ?? ''));
            $day_title = sanitize_text_field((string) ($day_item['title'] ?? ''));
            $day_desc  = sanitize_text_field((string) ($day_item['description'] ?? ''));
            if ($day_label !== '' || $day_title !== '') {
                $itinerary_draft[] = array(
                    'day'         => $day_label,
                    'title'       => $day_title,
                    'description' => $day_desc,
                );
            }
        }
    }

    // Extract promotion attribution if submitted from a campaign
    $raw_promo_id = $payload['promotionId'] ?? ($payload['promotion_id'] ?? null);
    $promotion_id = ($raw_promo_id !== null && $raw_promo_id !== '') ? abs((int) $raw_promo_id) : null;
    $promotion_name = sanitize_text_field((string) ($payload['promotionName'] ?? ($payload['promotion_name'] ?? '')));

    if ($promotion_id && empty($promotion_name)) {
        global $wpdb;
        $tables = outbound_get_table_names();
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $promo_row = $wpdb->get_row($wpdb->prepare("SELECT name FROM {$tables['promotions']} WHERE id = %d LIMIT 1", $promotion_id));
        if ($promo_row) {
            $promotion_name = sanitize_text_field((string) $promo_row->name);
        }
    }

    $child_ages = array();
    if (!empty($payload['childAges']) && is_array($payload['childAges'])) {
        foreach (array_slice($payload['childAges'], 0, 10) as $ca) {
            $clean_ca = sanitize_text_field((string) $ca);
            if ($clean_ca !== '') {
                $child_ages[] = $clean_ca;
            }
        }
    }
    $selected_extras = array();
    if (!empty($payload['selectedExtras']) && is_array($payload['selectedExtras'])) {
        foreach (array_slice($payload['selectedExtras'], 0, 20) as $ex) {
            $clean_ex = sanitize_text_field((string) $ex);
            if ($clean_ex !== '') {
                $selected_extras[] = $clean_ex;
            }
        }
    }

    $builder_details = array(
        'trip_intent'        => ucwords(str_replace('-', ' ', $trip_intent)),
        'party_type'         => ucwords(str_replace('-', ' ', $party_type)),
        'travel_season'      => ucwords(str_replace('-', ' ', $travel_season)),
        'stay_tier'          => $stay_tier_name,
        'stay_preferences'   => $stay_preferences,
        'activities'         => $activity_titles,
        'transport'          => ucwords(str_replace('-', ' ', $transport)),
        'accommodation_name' => sanitize_text_field((string) ($trip['accommodationName'] ?? ($payload['propertyName'] ?? ''))),
        'package_title'      => sanitize_text_field((string) ($trip['packageTitle'] ?? ($payload['packageName'] ?? ''))),
        'preselected_exp'    => sanitize_text_field((string) ($trip['preselectedExperienceTitle'] ?? ($payload['activityName'] ?? ''))),
        'room_id'            => sanitize_text_field((string) ($payload['roomId'] ?? ($trip['roomId'] ?? ''))),
        'room_type'          => sanitize_text_field((string) ($payload['roomType'] ?? ($trip['roomType'] ?? ''))),
        'meal_plan'          => sanitize_text_field((string) ($payload['mealPlan'] ?? ($trip['mealPlan'] ?? ''))),
        'offer_id'           => sanitize_text_field((string) ($payload['offerId'] ?? '')),
        'offer_name'         => sanitize_text_field((string) ($payload['offerName'] ?? '')),
        'visitor_market'     => sanitize_text_field((string) ($payload['visitorMarket'] ?? '')),
        'rooms_count'        => max(1, (int) ($payload['roomsCount'] ?? 1)),
        'check_in_date'      => sanitize_text_field((string) ($payload['checkInDate'] ?? '')),
        'check_out_date'     => sanitize_text_field((string) ($payload['checkOutDate'] ?? '')),
        'preferred_date'     => sanitize_text_field((string) ($payload['preferredDate'] ?? '')),
        'child_ages'         => $child_ages,
        'country'            => sanitize_text_field((string) ($payload['country'] ?? '')),
        'selected_extras'    => $selected_extras,
        'estimated_price'    => sanitize_text_field((string) ($payload['estimatedPriceLabel'] ?? '')),
        'preferred_channel'  => sanitize_text_field((string) ($payload['preferredChannel'] ?? 'email')),
        'source_page'        => esc_url_raw((string) ($payload['sourcePageUrl'] ?? '')),
        'itinerary_draft'    => $itinerary_draft,
        'promotion_id'       => $promotion_id,
        'promotion_name'     => $promotion_name,
    );

    $estimate = ($type === 'holiday-builder')
        ? outbound_calculate_holiday_estimate(array(
            'nights'           => $nights,
            'adults'           => $adults,
            'children'         => $children,
            'stayNightRateUSD' => $stay_rate,
            'activityRatesUSD' => $activity_rates,
            'transportType'    => $transport,
        ))
        : array('minimum' => 0, 'maximum' => 0, 'currency' => 'USD', 'rooms' => 0, 'disclaimer' => '');

    if (function_exists('outbound_maybe_install_schema')) {
        outbound_maybe_install_schema(false);
    }

    $reference_code = outbound_generate_reference_code();

    global $wpdb;
    $tables = outbound_get_table_names();
    $now    = gmdate('Y-m-d H:i:s');
    $cap_str = static fn(string $v, int $max): string => function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);

    $insert_data = array(
        'reference_code'    => $reference_code,
        'idempotency_key'   => $idempotency_key !== '' ? $cap_str($idempotency_key, 95) : null,
        'type'              => $cap_str($type, 38),
        'full_name'         => $cap_str($full_name, 155),
        'email'             => $cap_str($email, 250),
        'phone'             => $cap_str($phone, 60),
        'party_type'        => $cap_str($party_type, 38),
        'trip_intent'       => $cap_str($trip_intent, 60),
        'adults'            => $adults,
        'children'          => $children,
        'nights'            => $nights,
        'travel_season'     => $cap_str($travel_season, 75),
        'stay_tier_id'      => $cap_str($stay_tier_id, 75),
        'transport_type'    => $cap_str($transport, 60),
        'estimate_min_usd'  => (int) $estimate['minimum'],
        'estimate_max_usd'  => (int) $estimate['maximum'],
        'marketing_consent' => $marketing ? 1 : 0,
        'subject'           => $cap_str($subject, 250),
        'message'           => $notes,
        'payload_json'      => wp_json_encode($payload) ?: '{}',
        'status'            => 'new',
        'promotion_id'      => $promotion_id ?: 0,
        'promotion_name'    => $promotion_name !== '' ? $cap_str($promotion_name, 250) : null,
        'ip_address'        => hash('sha256', $client_ip),
        'created_at'        => $now,
        'updated_at'        => $now,
    );
    $insert_formats = array('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s');

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    $inserted = $wpdb->insert($tables['enquiries'], $insert_data, $insert_formats);
    if (!$inserted && function_exists('outbound_maybe_install_schema')) {
        // Self-heal missing table or upgraded columns (e.g. after theme ZIP update) and retry once.
        outbound_maybe_install_schema(true);
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $inserted = $wpdb->insert($tables['enquiries'], $insert_data, $insert_formats);
    }

    if (!$inserted) {
        if (!empty($wpdb->last_error)) {
            error_log('[Outbound Enquiries] DB insert failed: ' . $wpdb->last_error);
        }
        return new WP_Error('db_error', 'Unable to save enquiry at this time.', array('status' => 500));
    }

    $enquiry_id = (int) $wpdb->insert_id;

    // Record promotion conversion telemetry if enquiry was generated from a campaign.
    if ($promotion_id && function_exists('outbound_record_promotion_event')) {
        outbound_record_promotion_event(array(
            'promotionId' => $promotion_id,
            'eventType'   => 'enquiry_submit',
            'visitorId'   => sanitize_text_field((string) ($payload['visitorId'] ?? '')),
            'pageUrl'     => sanitize_text_field((string) ($payload['pageUrl'] ?? '')),
            'utmSource'   => sanitize_text_field((string) ($payload['utmSource'] ?? '')),
            'metadata'    => array(
                'reference' => $reference_code,
                'name'      => $full_name,
            ),
        ));
    }

    // Optional newsletter opt-in when customer ticks consent box.
    if ($marketing && function_exists('outbound_create_or_update_subscriber')) {
        outbound_create_or_update_subscriber(array(
            'email'         => $email,
            'name'          => $full_name,
            'source'        => $type === 'holiday-builder' ? 'holiday-builder-optin' : 'contact-optin',
            'ip_address'    => $client_ip,
            'double_opt_in' => false,
        ));
    }

    // Dispatch specialist & customer emails cleanly via non-blocking shutdown hook to prevent 502/worker stalls.
    add_action('shutdown', function() use ($reference_code, $type, $full_name, $email, $phone, $adults, $children, $nights, $estimate, $notes, $enquiry_id, $builder_details) {
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }
        outbound_dispatch_enquiry_emails($reference_code, $type, $full_name, $email, $phone, $adults, $children, $nights, $estimate, $notes, $enquiry_id, $builder_details);
    });

    return array(
        'saved'         => true,
        'ok'            => true,
        'reference'     => $reference_code,
        'referenceCode' => $reference_code,
        'customerName'  => $full_name,
        'submittedAt'   => gmdate('c'),
        'estimate'      => $estimate,
        'summary'       => $builder_details,
        'message'       => 'Thank you! Your Victoria Falls enquiry has been saved cleanly.',
    );
}

/**
 * Format builder details into a clean HTML summary block for enquiry emails.
 */
function outbound_build_enquiry_options_html(
    string $type,
    int $adults,
    int $children,
    int $nights,
    array $builder_details
): string {
    if ($type !== 'holiday-builder' && empty($builder_details)) {
        return '';
    }

    $rows = array();

    if (!empty($builder_details['trip_intent'])) {
        $rows[] = array('Trip Vision', (string) $builder_details['trip_intent']);
    }

    $party_label = sprintf('%d %s', $adults, $adults === 1 ? 'Adult' : 'Adults');
    if ($children > 0) {
        $party_label .= sprintf(', %d %s', $children, $children === 1 ? 'Child' : 'Children');
    }
    if (!empty($builder_details['party_type'])) {
        $party_label .= ' (' . (string) $builder_details['party_type'] . ')';
    }
    $rows[] = array('Travellers', $party_label);

    $stay_duration = sprintf('%d %s', $nights, $nights === 1 ? 'Night' : 'Nights');
    if (!empty($builder_details['travel_season'])) {
        $stay_duration .= ' — ' . (string) $builder_details['travel_season'];
    }
    $rows[] = array('Duration & Travel Window', $stay_duration);

    if (!empty($builder_details['stay_tier'])) {
        $stay_text = (string) $builder_details['stay_tier'];
        if (!empty($builder_details['stay_preferences']) && is_array($builder_details['stay_preferences'])) {
            $stay_text .= ' (' . implode(', ', array_map('strval', $builder_details['stay_preferences'])) . ')';
        }
        $rows[] = array('Accommodation Style', $stay_text);
    }

    if (!empty($builder_details['accommodation_name'])) {
        $rows[] = array('Preferred Property', (string) $builder_details['accommodation_name']);
    }
    if (!empty($builder_details['room_type'])) {
        $rows[] = array('Room / Unit Type', (string) $builder_details['room_type']);
    }
    if (!empty($builder_details['meal_plan'])) {
        $rows[] = array('Meal Plan', (string) $builder_details['meal_plan']);
    }
    if (!empty($builder_details['offer_name'])) {
        $rows[] = array('Special Offer / Package', (string) $builder_details['offer_name']);
    }
    if (!empty($builder_details['visitor_market'])) {
        $rows[] = array('Visitor Market', (string) $builder_details['visitor_market']);
    }
    if (!empty($builder_details['rooms_count']) && (int) $builder_details['rooms_count'] > 1) {
        $rows[] = array('Rooms / Units', (string) (int) $builder_details['rooms_count']);
    }
    if (!empty($builder_details['package_title'])) {
        $rows[] = array('Holiday Package', (string) $builder_details['package_title']);
    }
    if (!empty($builder_details['preselected_exp'])) {
        $rows[] = array('Selected Experience', (string) $builder_details['preselected_exp']);
    }
    if (!empty($builder_details['check_in_date']) || !empty($builder_details['check_out_date'])) {
        $rows[] = array('Check-in / Check-out', trim((string) ($builder_details['check_in_date'] ?? '') . ' to ' . (string) ($builder_details['check_out_date'] ?? '')));
    } elseif (!empty($builder_details['preferred_date'])) {
        $rows[] = array('Preferred Date', (string) $builder_details['preferred_date']);
    }
    if (!empty($builder_details['child_ages']) && is_array($builder_details['child_ages'])) {
        $rows[] = array('Children Age Categories', implode(', ', array_map('strval', $builder_details['child_ages'])));
    }
    if (!empty($builder_details['selected_extras']) && is_array($builder_details['selected_extras'])) {
        $rows[] = array('Selected Extras', implode(', ', array_map('strval', $builder_details['selected_extras'])));
    }
    if (!empty($builder_details['estimated_price'])) {
        $rows[] = array('Estimated Price', (string) $builder_details['estimated_price']);
    }
    if (!empty($builder_details['country'])) {
        $rows[] = array('Country of Residence', (string) $builder_details['country']);
    }
    if (!empty($builder_details['preferred_channel'])) {
        $rows[] = array('Preferred Contact Channel', ucfirst((string) $builder_details['preferred_channel']));
    }
    if (!empty($builder_details['source_page'])) {
        $rows[] = array('Source Page', (string) $builder_details['source_page']);
    }
    if (!empty($builder_details['preselected_exp'])) {
        $rows[] = array('Featured Experience', (string) $builder_details['preselected_exp']);
    }

    if (!empty($builder_details['transport'])) {
        $rows[] = array('Transfers & Logistics', (string) $builder_details['transport']);
    }

    $rows_html = '';
    foreach ($rows as $row) {
        $rows_html .= sprintf(
            '<tr><td style="padding:7px 10px;border-bottom:1px solid #ece7da;font-size:13px;color:#4B5563;width:38%%;vertical-align:top;"><strong>%s</strong></td><td style="padding:7px 10px;border-bottom:1px solid #ece7da;font-size:13px;color:#0D2833;">%s</td></tr>',
            esc_html($row[0]),
            esc_html($row[1])
        );
    }

    $activities_html = '';
    if (!empty($builder_details['activities']) && is_array($builder_details['activities'])) {
        $items = '';
        foreach ($builder_details['activities'] as $act_title) {
            $items .= '<li style="margin:0 0 4px;">' . esc_html((string) $act_title) . '</li>';
        }
        $activities_html = sprintf(
            '<div style="margin-top:12px;"><p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#0D2833;">Selected Experiences (%d):</p><ul style="margin:0;padding-left:18px;font-size:13px;color:#1F2937;">%s</ul></div>',
            count($builder_details['activities']),
            $items
        );
    }

    $itinerary_html = '';
    if (!empty($builder_details['itinerary_draft']) && is_array($builder_details['itinerary_draft'])) {
        $day_items = '';
        foreach ($builder_details['itinerary_draft'] as $day) {
            $label = trim((string) ($day['day'] ?? ''));
            $title = trim((string) ($day['title'] ?? ''));
            $desc  = trim((string) ($day['description'] ?? ''));
            $heading = $label !== '' && $title !== '' ? "{$label}: {$title}" : ($title ?: $label);
            $day_items .= '<div style="margin-bottom:8px;padding-left:10px;border-left:2px solid #C9A66B;">';
            $day_items .= '<div style="font-size:13px;font-weight:bold;color:#0D2833;">' . esc_html($heading) . '</div>';
            if ($desc !== '') {
                $day_items .= '<div style="font-size:12px;color:#4B5563;margin-top:2px;">' . esc_html($desc) . '</div>';
            }
            $day_items .= '</div>';
        }
        $itinerary_html = '<div style="margin-top:14px;"><p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#0D2833;">Draft Day-by-Day Itinerary:</p>' . $day_items . '</div>';
    }

    return "
        <div style='margin:16px 0;padding:14px 16px;background:#F9F6EE;border:1px solid #E5D6B3;border-radius:8px;'>
            <p style='margin:0 0 10px;font-size:13px;font-weight:bold;letter-spacing:0.6px;text-transform:uppercase;color:#8A6D3B;'>Your Selected Holiday Options</p>
            <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>
                {$rows_html}
            </table>
            {$activities_html}
            {$itinerary_html}
        </div>";
}

/**
 * Send notification email to specialist team + guest confirmation summary.
 */
function outbound_dispatch_enquiry_emails(
    string $reference,
    string $type,
    string $name,
    string $email,
    string $phone,
    int $adults,
    int $children,
    int $nights,
    array $estimate,
    string $notes,
    int $enquiry_id,
    array $builder_details = array()
): void {
    $cms             = outbound_get_site_options();
    $from_cfg        = function_exists('outbound_get_mail_from_config') ? outbound_get_mail_from_config() : array('email' => 'fungai@outboundholiday.com', 'name' => 'Outbound Holidays');
    $configured_from = (string) ($from_cfg['email'] ?? 'fungai@outboundholiday.com');
    $from_name       = (string) ($from_cfg['name'] ?? 'Outbound Holidays');
    $cms_email       = strtolower(trim((string) ($cms['contact']['email'] ?? '')));
    $legacy_emails   = array('travel@outboundholidays.co.zw', 'travel@outboundholiday.com');

    if ($cms_email !== '' && !in_array($cms_email, $legacy_emails, true) && is_email($cms_email)) {
        $specialist_email = $cms_email;
    } elseif (is_email($configured_from)) {
        $specialist_email = $configured_from;
    } else {
        $specialist_email = 'fungai@outboundholiday.com';
    }

    $from_header = sprintf('From: %s <%s>', $from_name !== '' ? $from_name : 'Outbound Holidays', is_email($configured_from) ? $configured_from : 'fungai@outboundholiday.com');
    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        $from_header,
        'Reply-To: Outbound Holidays <' . $specialist_email . '>',
    );
    $specialist_headers = array(
        'Content-Type: text/html; charset=UTF-8',
        $from_header,
    );
    if (is_email($email)) {
        $specialist_headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
    }

    $estimate_line = !empty($estimate['minimum'])
        ? sprintf('<p><strong>Estimated Guide Budget:</strong> $%s – $%s USD</p>', number_format((int) $estimate['minimum']), number_format((int) $estimate['maximum']))
        : '';

    $promo_callout_specialist = !empty($builder_details['promotion_name'])
        ? "<div style='background:#EBF5FB;border-left:4px solid #0B5E8E;padding:12px 16px;margin:0 0 16px;border-radius:4px;'><strong style='color:#0B5E8E;font-size:14px;'>Promotional Campaign:</strong> <span style='color:#0D2833;font-size:14px;font-weight:bold;'>" . esc_html((string) $builder_details['promotion_name']) . "</span></div>"
        : '';

    $promo_callout_guest = !empty($builder_details['promotion_name'])
        ? "<div style='background:#FDF8EE;border-left:4px solid #C9A66B;padding:12px 16px;margin:0 0 16px;border-radius:4px;'><strong style='color:#8A6D3B;font-size:14px;'>Offer Applied:</strong> <span style='color:#0D2833;font-size:14px;font-weight:bold;'>" . esc_html((string) $builder_details['promotion_name']) . "</span></div>"
        : '';

    $options_html = outbound_build_enquiry_options_html($type, $adults, $children, $nights, $builder_details);
    $guest_notes_html = trim($notes) !== ''
        ? '<p style="margin:14px 0;font-size:13px;color:#1F2937;"><strong>Your Additional Notes:</strong><br>' . nl2br(esc_html($notes)) . '</p>'
        : '';

    $specialist_body = "
        <div style='font-family:Arial,sans-serif;max-width:620px;margin:auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'>
            <div style='background:#0B5E8E;color:#fff;padding:18px 24px;'>
                <h2 style='margin:0;'>New Outbound Holidays Enquiry ({$reference})</h2>
            </div>
            <div style='padding:20px 24px;color:#1F2937;'>
                {$promo_callout_specialist}
                <p><strong>Type:</strong> " . esc_html($type) . "</p>
                <p><strong>Guest Name:</strong> " . esc_html($name) . "</p>
                <p><strong>Email:</strong> " . esc_html($email) . "</p>
                <p><strong>Phone / WhatsApp:</strong> " . esc_html($phone ?: 'Not provided') . "</p>
                <p><strong>Party & Duration:</strong> {$adults} Adults, {$children} Children, {$nights} Nights</p>
                {$estimate_line}
                {$options_html}
                <p><strong>Notes:</strong><br>" . nl2br(esc_html($notes ?: 'None')) . "</p>
                <p><a href='" . esc_url(admin_url('admin.php?page=outbound-enquiries&enquiry_id=' . $enquiry_id)) . "' style='display:inline-block;background:#0B5E8E;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;'>Open in WordPress Admin</a></p>
            </div>
        </div>";

    wp_mail($specialist_email, sprintf('[%s] New Victoria Falls Enquiry from %s', $reference, $name), $specialist_body, $specialist_headers);

    $guest_body = "
        <div style='font-family:Arial,sans-serif;max-width:620px;margin:auto;background:#FAF9F6;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;'>
            <div style='background:#0D2833;color:#fff;padding:24px;text-align:center;'>
                <h1 style='margin:0;font-size:22px;color:#C9A66B;'>Outbound Holidays — Victoria Falls</h1>
                <p style='margin:6px 0 0;color:#E5E7EB;'>Enquiry Reference: <strong>" . esc_html($reference) . "</strong></p>
            </div>
            <div style='padding:24px;color:#1F2937;'>
                {$promo_callout_guest}
                <p>Dear " . esc_html($name) . ",</p>
                <p>Thank you for reaching out to our local specialist team in Victoria Falls. We have logged your request and will prepare a tailored plan within 24 hours.</p>
                {$estimate_line}
                {$options_html}
                {$guest_notes_html}
                <p style='font-size:13px;color:#4B5563;'>Need an immediate reply? Message us directly on WhatsApp at " . esc_html((string) ($cms['contact']['displayNumber'] ?? '+263 714 701 721')) . " quoting reference <strong>" . esc_html($reference) . "</strong>.</p>
            </div>
        </div>";

    if (is_email($email)) {
        wp_mail($email, sprintf('We received your Outbound Holidays enquiry (%s)', $reference), $guest_body, $headers);
    }
}

/**
 * Register REST API endpoint `/wp-json/outbound/v1/enquiries`.
 */
add_action('rest_api_init', static function (): void {
    register_rest_route('outbound/v1', '/enquiries', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => static function (WP_REST_Request $request) {
            $params = $request->get_json_params();
            if (!is_array($params) || empty($params)) {
                $params = $request->get_params();
            }
            $result = outbound_process_enquiry_submission((array) $params, outbound_get_client_ip());
            if (is_wp_error($result)) {
                $data = $result->get_error_data();
                $status = is_array($data) && isset($data['status']) ? (int) $data['status'] : 400;
                return new WP_REST_Response(array('ok' => false, 'error' => $result->get_error_message()), $status);
            }
            return new WP_REST_Response($result, 201);
        },
    ));
});

/**
 * Add WP Admin Enquiries Ledger submenu.
 */
add_action('admin_menu', static function (): void {
    add_submenu_page(
        'outbound-cms',
        __('Enquiries & Holiday Plans', 'outbound-holidays'),
        __('Enquiries', 'outbound-holidays'),
        'manage_options',
        'outbound-enquiries',
        'outbound_render_enquiries_admin_page'
    );
}, 12);

/**
 * Render WP Admin Enquiries Ledger UI.
 */
function outbound_render_enquiries_admin_page(): void {
    if (!current_user_can('manage_options')) {
        return;
    }

    global $wpdb;
    $tables = outbound_get_table_names();

    if (isset($_POST['outbound_update_enquiry']) && check_admin_referer('outbound_enquiry_admin', 'outbound_enquiry_nonce')) {
        $eid    = (int) ($_POST['enquiry_id'] ?? 0);
        $status = sanitize_text_field((string) ($_POST['status'] ?? 'new'));
        $notes  = sanitize_textarea_field((string) ($_POST['admin_notes'] ?? ''));
        if ($eid > 0 && array_key_exists($status, outbound_get_enquiry_statuses())) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->update($tables['enquiries'], array(
                'status'      => $status,
                'admin_notes' => $notes,
                'updated_at'  => gmdate('Y-m-d H:i:s'),
            ), array('id' => $eid), array('%s', '%s', '%s'), array('%d'));
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Enquiry updated.', 'outbound-holidays') . '</p></div>';
        }
    }

    if (isset($_GET['export']) && $_GET['export'] === 'csv' && check_admin_referer('outbound_export_enquiries_csv')) {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $rows = $wpdb->get_results("SELECT * FROM {$tables['enquiries']} ORDER BY created_at DESC LIMIT 2000", ARRAY_A);
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="outbound-enquiries-' . gmdate('Ymd') . '.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, array('Reference', 'Type', 'Promotion', 'Name', 'Email', 'Phone', 'Adults', 'Children', 'Nights', 'Estimate Min USD', 'Estimate Max USD', 'Status', 'Created At'));
        foreach ((array) $rows as $r) {
            $cells = array($r['reference_code'], $r['type'], $r['promotion_name'] ?? '', $r['full_name'], $r['email'], $r['phone'], $r['adults'], $r['children'], $r['nights'], $r['estimate_min_usd'], $r['estimate_max_usd'], $r['status'], $r['created_at']);
            fputcsv($out, array_map(static fn($c) => outbound_csv_safe_cell((string) $c), $cells));
        }
        fclose($out);
        exit;
    }

    $filter_status = isset($_GET['status']) ? sanitize_text_field((string) wp_unslash($_GET['status'])) : '';
    $where         = $filter_status !== '' ? $wpdb->prepare('WHERE status = %s', $filter_status) : '';
    $per_page      = 25;
    $current_page  = max(1, (int) ($_GET['paged'] ?? 1));
    $offset        = ($current_page - 1) * $per_page;
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery,WordPress.DB.PreparedSQL.InterpolatedNotPrepared
    $total_rows    = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['enquiries']} {$where}");
    $total_pages   = max(1, (int) ceil($total_rows / $per_page));
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery,WordPress.DB.PreparedSQL.InterpolatedNotPrepared
    $enquiries     = $wpdb->get_results($wpdb->prepare(
        "SELECT id, reference_code, type, full_name, email, adults, children, nights, estimate_min_usd, estimate_max_usd, status, promotion_id, promotion_name, created_at FROM {$tables['enquiries']} {$where} ORDER BY created_at DESC LIMIT %d OFFSET %d",
        $per_page,
        $offset
    ));
    $selected_id = isset($_GET['enquiry_id']) ? (int) $_GET['enquiry_id'] : 0;
    $selected = $selected_id > 0
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        ? $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tables['enquiries']} WHERE id = %d", $selected_id))
        : null;
    ?>
    <div class="wrap outbound-admin-wrap">
        <div class="outbound-admin-header">
            <div>
                <h1><?php esc_html_e('Customer Enquiries & Custom Holiday Plans', 'outbound-holidays'); ?></h1>
                <p><?php esc_html_e('Every Holiday Builder itinerary and Contact enquiry saved with server-verified pricing estimates.', 'outbound-holidays'); ?></p>
            </div>
            <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=outbound-enquiries&export=csv'), 'outbound_export_enquiries_csv')); ?>" class="button button-secondary"><?php esc_html_e('Export CSV', 'outbound-holidays'); ?></a>
        </div>

        <?php if ($selected) : $decoded = json_decode((string) $selected->payload_json, true); ?>
            <div class="outbound-admin-card">
                <h2><?php echo esc_html($selected->reference_code . ' — ' . $selected->full_name); ?></h2>
                <?php if (!empty($selected->promotion_name)) : ?>
                    <p style="margin:6px 0 12px;"><span style="background:#eef6fb;color:#0B5E8E;font-weight:bold;padding:4px 10px;border-radius:4px;border:1px solid #bfdbfe;font-size:13px;">Campaign Offer: <?php echo esc_html($selected->promotion_name); ?></span></p>
                <?php endif; ?>
                <p><strong>Email:</strong> <?php echo esc_html($selected->email); ?> | <strong>Phone:</strong> <?php echo esc_html($selected->phone ?: 'N/A'); ?> | <strong>Est. Budget:</strong> $<?php echo esc_html((string) $selected->estimate_min_usd); ?>–$<?php echo esc_html((string) $selected->estimate_max_usd); ?> USD</p>
                <p><strong>Party:</strong> <?php echo (int) $selected->adults; ?> Adults, <?php echo (int) $selected->children; ?> Children, <?php echo (int) $selected->nights; ?> Nights (<?php echo esc_html((string) $selected->party_type); ?> — <?php echo esc_html((string) $selected->stay_tier_id); ?>)</p>
                <p><strong>Vision:</strong> <?php echo esc_html((string) $selected->trip_intent); ?> | <strong>Travel Window:</strong> <?php echo esc_html((string) $selected->travel_season); ?> | <strong>Transfers:</strong> <?php echo esc_html((string) $selected->transport_type); ?></p>
                <?php if (!empty($decoded['trip']['stayPreferences'])) : ?>
                    <p><strong>Stay Preferences:</strong> <?php echo esc_html(implode(', ', (array) $decoded['trip']['stayPreferences'])); ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['trip']['accommodationName']) || !empty($decoded['propertyName'])) : ?>
                    <p><strong>Property:</strong> <?php echo esc_html((string) ($decoded['trip']['accommodationName'] ?? $decoded['propertyName'])); ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['roomType']) || !empty($decoded['trip']['roomType'])) : ?>
                    <p><strong>Room / Unit Type:</strong> <?php echo esc_html((string) ($decoded['roomType'] ?? $decoded['trip']['roomType'])); ?><?php if (!empty($decoded['roomId'])) : ?> <code>(<?php echo esc_html((string) $decoded['roomId']); ?>)</code><?php endif; ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['mealPlan'])) : ?>
                    <p><strong>Meal Plan:</strong> <?php echo esc_html((string) $decoded['mealPlan']); ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['checkInDate']) || !empty($decoded['checkOutDate'])) : ?>
                    <p><strong>Dates:</strong> <?php echo esc_html(trim((string) ($decoded['checkInDate'] ?? '') . ' to ' . (string) ($decoded['checkOutDate'] ?? ''))); ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['childAges']) && is_array($decoded['childAges'])) : ?>
                    <p><strong>Children&apos;s Ages:</strong> <?php echo esc_html(implode(', ', array_map('strval', $decoded['childAges']))); ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['estimatedPriceLabel'])) : ?>
                    <p><strong>Displayed Rate / Quote:</strong> <?php echo esc_html((string) $decoded['estimatedPriceLabel']); ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['trip']['packageTitle'])) : ?>
                    <p><strong>Selected Package:</strong> <?php echo esc_html((string) $decoded['trip']['packageTitle']); ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['selectedActivityIds'])) : ?>
                    <p><strong>Selected Activities:</strong> <?php echo esc_html(implode(', ', (array) $decoded['selectedActivityIds'])); ?></p>
                <?php endif; ?>
                <p><strong>Guest Message:</strong> <?php echo esc_html((string) $selected->message); ?></p>
                <form method="post">
                    <?php wp_nonce_field('outbound_enquiry_admin', 'outbound_enquiry_nonce'); ?>
                    <input type="hidden" name="enquiry_id" value="<?php echo (int) $selected->id; ?>">
                    <p>
                        <label><strong>Status:</strong></label>
                        <select name="status">
                            <?php foreach (outbound_get_enquiry_statuses() as $st => $st_label) : ?>
                                <option value="<?php echo esc_attr($st); ?>" <?php selected((string) $selected->status, $st); ?>><?php echo esc_html($st_label); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </p>
                    <p><textarea name="admin_notes" rows="3" class="large-text" placeholder="Internal specialist notes..."><?php echo esc_textarea((string) $selected->admin_notes); ?></textarea></p>
                    <button type="submit" name="outbound_update_enquiry" value="1" class="button button-primary"><?php esc_html_e('Save Enquiry Status', 'outbound-holidays'); ?></button>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-enquiries')); ?>" class="button"><?php esc_html_e('Back to All Enquiries', 'outbound-holidays'); ?></a>
                </form>
            </div>
        <?php endif; ?>

        <div class="outbound-admin-card">
            <p>
                Filter:
                <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-enquiries')); ?>">All</a> |
                <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-enquiries&status=new')); ?>">New</a> |
                <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-enquiries&status=quoted')); ?>">Quoted</a> |
                <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-enquiries&status=booked')); ?>">Booked</a>
            </p>
            <table class="widefat striped">
                <thead><tr><th>Ref</th><th>Date</th><th>Guest</th><th>Type</th><th>Nights / Party</th><th>Budget Guide</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                <?php if (empty($enquiries)) : ?>
                    <tr><td colspan="8"><?php esc_html_e('No enquiries logged yet.', 'outbound-holidays'); ?></td></tr>
                <?php else : foreach ($enquiries as $row) : ?>
                    <tr>
                        <td><strong><?php echo esc_html($row->reference_code); ?></strong></td>
                        <td><?php echo esc_html(substr((string) $row->created_at, 0, 16)); ?></td>
                        <td>
                            <?php echo esc_html($row->full_name); ?><br><small><?php echo esc_html($row->email); ?></small>
                            <?php if (!empty($row->promotion_name)) : ?>
                                <br><span style="display:inline-block;margin-top:3px;font-size:11px;background:#eef6fb;color:#0B5E8E;padding:2px 6px;border-radius:3px;border:1px solid #bfdbfe;font-weight:600;">Offer: <?php echo esc_html($row->promotion_name); ?></span>
                            <?php endif; ?>
                        </td>
                        <td><?php echo esc_html($row->type); ?></td>
                        <td><?php echo (int) $row->nights; ?>N / <?php echo (int) $row->adults; ?>A <?php echo (int) $row->children; ?>C</td>
                        <td><?php echo $row->estimate_min_usd > 0 ? '$' . number_format((int) $row->estimate_min_usd) . '–$' . number_format((int) $row->estimate_max_usd) : 'Contact Msg'; ?></td>
                        <td><span class="outbound-badge outbound-badge-blue"><?php echo esc_html((string) $row->status); ?></span></td>
                        <td><a href="<?php echo esc_url(admin_url('admin.php?page=outbound-enquiries&enquiry_id=' . (int) $row->id)); ?>" class="button button-small"><?php esc_html_e('Inspect', 'outbound-holidays'); ?></a></td>
                    </tr>
                <?php endforeach; endif; ?>
                </tbody>
            </table>
            <?php if ($total_pages > 1) : ?>
                <p style="margin-top:12px;">
                    <?php
                    echo wp_kses_post((string) paginate_links(array(
                        'base'      => add_query_arg(array('paged' => '%#%')),
                        'format'    => '',
                        'current'   => $current_page,
                        'total'     => $total_pages,
                        'prev_text' => '&laquo; Prev',
                        'next_text' => 'Next &raquo;',
                    )));
                    ?>
                </p>
            <?php endif; ?>
        </div>
    </div>
    <?php
}

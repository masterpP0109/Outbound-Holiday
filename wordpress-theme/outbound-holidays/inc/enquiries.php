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
            'id'                  => (string) $act['id'],
            'title'               => (string) ($act['title'] ?? $act['id']),
            'duration'            => (string) ($act['duration'] ?? ''),
            'priceAmount'         => (float) ($act['priceUSD'] ?? ($act['priceAmount'] ?? 0)),
            'priceUSD'            => (float) ($act['priceUSD'] ?? ($act['priceAmount'] ?? 0)),
            'priceBasis'          => (string) ($act['priceBasis'] ?? 'per_adult'),
            'childRateUnder11USD' => $act['childRateUnder11USD'] ?? null,
            'childRate11PlusUSD'  => $act['childRate11PlusUSD'] ?? null,
            'rateStatus'          => (string) ($act['rateStatus'] ?? 'provisional'),
            'validFrom'           => (string) ($act['validFrom'] ?? ''),
            'validTo'             => (string) ($act['validTo'] ?? ''),
            'defaultTimeSlot'     => (string) ($act['defaultTimeSlot'] ?? 'to-be-arranged'),
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

    $requested_rooms = max(1, (int) ($payload['roomsCount'] ?? ($trip['requestedRooms'] ?? 0)));
    $calc_input = array(
        'nights'           => $nights,
        'adults'           => $adults,
        'children'         => $children,
        'stayNightRateUSD' => $stay_rate,
        'activityRatesUSD' => $activity_rates,
        'transportType'    => $transport,
    );
    if (!empty($payload['roomsCount']) || !empty($trip['requestedRooms'])) {
        $calc_input['roomsCount'] = $requested_rooms;
    }
    $est = outbound_calculate_holiday_estimate($calc_input);
    $rooms = max(1, (int) ($est['rooms'] ?? ceil(($adults + $children) / 2)));
    $est['stayCost']      = (int) round($stay_rate * $nights * $rooms);
    $est['activityCost']  = (int) round(array_sum($activity_rates) * ($adults + ($children * 0.8)));
    $est['transportCost'] = $transport === 'private-transfers'
        ? 120
        : ($transport === 'shared-shuttle' ? 60 : ($transport === 'VIP-helicopter' ? 680 : 0));

    $raw_child_ages = !empty($trip['childAges']) ? $trip['childAges'] : ($payload['childAges'] ?? array());
    $child_ages_str = is_array($raw_child_ages) && !empty($raw_child_ages)
        ? implode(', ', array_filter(array_map('strval', $raw_child_ages)))
        : (string) ($trip['childrenAges'] ?? '');

    $has_redesigned_fields = isset($trip['stayArrangement']) || isset($trip['transferArrangement']) || isset($trip['itemizedEstimate']) || isset($trip['childAgeValues']);
    $itemized = null;
    if ($has_redesigned_fields && function_exists('outbound_calculate_itemized_trip_estimate')) {
        $itemized = outbound_calculate_itemized_trip_estimate($trip, $catalog);
    }

    $sel_acts_detail = array();
    if (!empty($trip['selectedActivities']) && is_array($trip['selectedActivities'])) {
        foreach ($trip['selectedActivities'] as $sa) {
            if (!is_array($sa)) {
                continue;
            }
            $sa_title = trim((string) ($sa['title'] ?? ($sa['id'] ?? '')));
            if ($sa_title === '') {
                continue;
            }
            $sel_acts_detail[] = array(
                'id'            => (string) ($sa['id'] ?? ''),
                'title'         => $sa_title,
                'preferredDay'  => (string) ($sa['preferredDay'] ?? ''),
                'activityDate'  => (string) ($sa['activityDate'] ?? ''),
                'preferredTime' => (string) ($sa['preferredTime'] ?? ''),
            );
        }
    }

    return array(
        'entryMode'           => (string) ($trip['entryMode'] ?? 'custom'),
        'country'             => (string) ($trip['country'] ?? ($payload['country'] ?? '')),
        'arrivalDate'         => (string) ($trip['arrivalDate'] ?? ($payload['checkInDate'] ?? '')),
        'departureDate'       => (string) ($trip['departureDate'] ?? ($payload['checkOutDate'] ?? '')),
        'childrenAges'        => $child_ages_str,
        'roomType'            => (string) ($trip['roomType'] ?? ($payload['roomType'] ?? '')),
        'requestedRooms'      => $rooms,
        'familyRoomRequested' => !empty($trip['familyRoomRequested']),
        'celebrationDetails'  => (string) ($trip['celebrationDetails'] ?? ''),
        'adults'              => $adults,
        'children'            => $children,
        'nights'              => $nights,
        'accommodationId'     => $acc_id,
        'accommodationName'   => $acc_name,
        'selectedActivities'  => $selected_activities,
        'selected_activities' => $sel_acts_detail,
        'transfer_date'       => (string) ($trip['transferDate'] ?? ''),
        'flight_time'         => (string) ($trip['flightTime'] ?? ''),
        'flight_time_unknown' => !empty($trip['flightTimeUnknown']),
        'pickup_time'         => (string) ($trip['pickupTime'] ?? ''),
        'estimate'            => $est,
        'itemizedEstimate'    => $itemized,
        'notes'               => (string) ($payload['notes'] ?? ($payload['message'] ?? '')),
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

    $preferred_reply = sanitize_text_field((string) ($trip['preferredReplyMethod'] ?? ($trip['preferredContact'] ?? '')));
    if ($full_name === '') {
        return new WP_Error('validation_error', 'Please enter your full name.', array('status' => 400));
    }
    if ($raw_email !== '' && !is_email($email)) {
        return new WP_Error('validation_error', 'Please enter a valid email address.', array('status' => 400));
    }
    if ($preferred_reply === 'whatsapp' && strlen($phone_digits) < 7) {
        return new WP_Error('validation_error', 'Please enter your WhatsApp number so our specialist can reply.', array('status' => 400));
    }
    if ($preferred_reply === 'email' && !is_email($email)) {
        return new WP_Error('validation_error', 'Please enter a valid email address for email replies.', array('status' => 400));
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

    $entry_mode   = sanitize_text_field((string) ($trip['entryMode'] ?? 'custom'));
    $stay_arr     = sanitize_text_field((string) ($trip['stayArrangement'] ?? ($entry_mode === 'quick' ? 'none' : 'selected')));
    $transfer_arr = sanitize_text_field((string) ($trip['transferArrangement'] ?? ''));
    $has_explicit_adults = isset($payload['adultsCount']) || isset($trip['adults']) || isset($payload['adults']);
    $adults        = $has_explicit_adults
        ? max(0, (int) ($payload['adultsCount'] ?? ($trip['adults'] ?? ($payload['adults'] ?? 0))))
        : (($entry_mode === 'quick' || in_array($stay_arr, array('none', 'already-arranged', 'recommend'), true)) ? 0 : 2);
    $children      = max(0, (int) ($payload['kidsCount'] ?? ($trip['children'] ?? ($payload['children'] ?? 0))));
    $has_explicit_nights = isset($payload['nightsCount']) || isset($trip['nights']) || isset($payload['nights']);
    $nights        = $has_explicit_nights
        ? max(0, (int) ($payload['nightsCount'] ?? ($trip['nights'] ?? ($payload['nights'] ?? 0))))
        : ($stay_arr === 'selected' ? 3 : 0);
    $party_type    = sanitize_text_field((string) ($payload['partyType'] ?? ($trip['partyType'] ?? ($entry_mode === 'quick' ? '' : 'couple'))));
    $trip_intent   = sanitize_text_field((string) ($payload['tripIntent'] ?? ($trip['intent'] ?? ($entry_mode === 'quick' ? '' : 'first-time'))));
    $travel_season = sanitize_text_field((string) ($payload['travelSeason'] ?? ($trip['travelDates'] ?? ($entry_mode === 'quick' ? '' : 'flexible'))));
    $stay_tier_id  = sanitize_text_field((string) ($payload['stayTierId'] ?? ($trip['stayTierId'] ?? ($stay_arr === 'selected' ? 'comfort-plus' : ''))));
    $transport     = sanitize_text_field((string) ($payload['transportType'] ?? ($trip['transportType'] ?? ($transfer_arr === 'already-arranged' ? 'self-drive' : ($transfer_arr === 'recommend' ? 'undecided' : 'none')))));
    $subject       = sanitize_text_field((string) ($payload['subject'] ?? ($type === 'contact' ? 'Contact Page Enquiry' : 'Victoria Falls Enquiry')));
    $notes         = sanitize_textarea_field((string) ($payload['notes'] ?? ($payload['message'] ?? '')));
    $marketing     = !empty($payload['marketingConsent']);

    // Server-side authoritative rate lookup & pricing calculation.
    $stay_rate = 0.0;
    $stay_tier_name = sanitize_text_field((string) ($trip['stayTierName'] ?? ''));
    if ($stay_tier_id !== '' && ($stay_arr === 'selected' || $stay_arr === '')) {
        $stay_rate = 235.0;
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
    }

    // Validate submitted offer dates against live catalog when accommodationId + offerId are present
    $submitted_offer_id = sanitize_text_field((string) ($payload['offerId'] ?? ($trip['offerId'] ?? '')));
    $submitted_acc_id   = sanitize_text_field((string) ($payload['accommodationId'] ?? ($trip['accommodationId'] ?? '')));
    $submitted_in       = sanitize_text_field((string) ($trip['arrivalDate'] ?? ($payload['checkInDate'] ?? '')));
    $submitted_out      = sanitize_text_field((string) ($trip['departureDate'] ?? ($payload['checkOutDate'] ?? '')));
    if ($submitted_offer_id !== '' && $submitted_acc_id !== '') {
        $offer_err = outbound_validate_offer_enquiry_dates($submitted_acc_id, $submitted_offer_id, $submitted_in, $submitted_out);
        if (is_wp_error($offer_err)) {
            return $offer_err;
        }
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
        foreach (array_slice($trip['itineraryDraft'], 0, 31) as $day_item) {
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
    $raw_child_ages = !empty($trip['childAges']) && is_array($trip['childAges'])
        ? $trip['childAges']
        : ((!empty($payload['childAges']) && is_array($payload['childAges'])) ? $payload['childAges'] : array());
    if (!empty($raw_child_ages)) {
        foreach (array_slice($raw_child_ages, 0, 20) as $ca) {
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

    $requested_rooms_val = !empty($trip['requestedRooms'])
        ? max(1, (int) $trip['requestedRooms'])
        : (!empty($payload['roomsCount']) ? max(1, (int) $payload['roomsCount']) : 1);
    $family_room_requested = !empty($trip['familyRoomRequested']);
    $transfer_id    = sanitize_text_field((string) ($trip['transferId'] ?? ''));
    $transfer_title = sanitize_text_field((string) ($trip['transferTitle'] ?? ''));
    $transfer_route = sanitize_text_field((string) ($trip['transferRoute'] ?? ''));
    $transfer_basis = sanitize_text_field((string) ($trip['transferBasis'] ?? ''));
    if ($transfer_arr === 'already-arranged') {
        $transport_label = 'Transport already arranged';
    } elseif ($transfer_arr === 'recommend' || $transport === 'undecided') {
        $transport_label = 'To be quoted separately (not included in estimate)';
    } elseif ($transfer_title !== '') {
        $transport_label = $transfer_title . ($transfer_route !== '' ? ' (' . $transfer_route . ')' : '');
    } else {
        $transport_label = ($transport !== 'none' && $transport !== '') ? ucwords(str_replace('-', ' ', $transport)) : '';
    }
    $check_in_val  = sanitize_text_field((string) ($trip['arrivalDate'] ?? ($payload['checkInDate'] ?? '')));
    $check_out_val = sanitize_text_field((string) ($trip['departureDate'] ?? ($payload['checkOutDate'] ?? '')));
    $pref_channel  = sanitize_text_field((string) ($trip['preferredReplyMethod'] ?? ($trip['preferredContact'] ?? ($payload['preferredChannel'] ?? ($email !== '' ? 'email' : 'whatsapp')))));
    $sel_acts_detail = array();
    if (!empty($trip['selectedActivities']) && is_array($trip['selectedActivities'])) {
        foreach (array_slice($trip['selectedActivities'], 0, 30) as $sa) {
            if (!is_array($sa)) {
                continue;
            }
            $sa_title = sanitize_text_field((string) ($sa['title'] ?? ($sa['id'] ?? '')));
            if ($sa_title === '') {
                continue;
            }
            $sel_acts_detail[] = array(
                'id'            => sanitize_text_field((string) ($sa['id'] ?? '')),
                'title'         => $sa_title,
                'preferredDay'  => sanitize_text_field((string) ($sa['preferredDay'] ?? '')),
                'activityDate'  => sanitize_text_field((string) ($sa['activityDate'] ?? '')),
                'preferredTime' => sanitize_text_field((string) ($sa['preferredTime'] ?? '')),
            );
        }
    }

    $transfer_date       = sanitize_text_field((string) ($trip['transferDate'] ?? ''));
    $flight_time         = sanitize_text_field((string) ($trip['flightTime'] ?? ''));
    $flight_time_unknown = !empty($trip['flightTimeUnknown']);
    $pickup_time         = sanitize_text_field((string) ($trip['pickupTime'] ?? ''));

    $builder_details = array(
        'entry_mode'            => $entry_mode,
        'trip_intent'           => $trip_intent !== '' ? ucwords(str_replace('-', ' ', $trip_intent)) : '',
        'party_type'            => $party_type !== '' ? ucwords(str_replace('-', ' ', $party_type)) : '',
        'travel_season'         => $travel_season !== '' ? ucwords(str_replace('-', ' ', $travel_season)) : '',
        'timing_mode'           => sanitize_text_field((string) ($trip['timingMode'] ?? '')),
        'approx_month'          => sanitize_text_field((string) ($trip['approxMonth'] ?? '')),
        'visitor_category'      => sanitize_text_field((string) ($trip['visitorCategory'] ?? '')),
        'stay_arrangement'      => $stay_arr,
        'stay_tier'             => $stay_tier_name,
        'stay_preferences'      => $stay_preferences,
        'activities'            => $activity_titles,
        'selected_activities'   => $sel_acts_detail,
        'transfer_arrangement'  => $transfer_arr,
        'transfer_id'           => $transfer_id,
        'transfer_basis'        => $transfer_basis,
        'transfer_date'         => $transfer_date,
        'flight_time'           => $flight_time,
        'flight_time_unknown'   => $flight_time_unknown,
        'pickup_time'           => $pickup_time,
        'transport'             => $transport_label,
        'accommodation_name'    => sanitize_text_field((string) ($trip['accommodationName'] ?? ($payload['propertyName'] ?? ''))),
        'package_title'         => sanitize_text_field((string) ($trip['packageTitle'] ?? ($payload['packageName'] ?? ''))),
        'preselected_exp'       => sanitize_text_field((string) ($trip['preselectedExperienceTitle'] ?? ($payload['activityName'] ?? ''))),
        'room_id'               => sanitize_text_field((string) ($payload['roomId'] ?? ($trip['roomId'] ?? ''))),
        'room_type'             => sanitize_text_field((string) ($payload['roomType'] ?? ($trip['roomType'] ?? ''))),
        'meal_plan_id'          => sanitize_text_field((string) ($payload['mealPlanId'] ?? ($trip['mealPlanId'] ?? ''))),
        'meal_plan'             => sanitize_text_field((string) ($payload['mealPlan'] ?? ($trip['mealPlan'] ?? ''))),
        'rate_plan_id'          => sanitize_text_field((string) ($payload['ratePlanId'] ?? ($trip['ratePlanId'] ?? ''))),
        'rate_plan_name'        => sanitize_text_field((string) ($payload['ratePlanName'] ?? ($trip['ratePlanName'] ?? ''))),
        'offer_id'              => sanitize_text_field((string) ($payload['offerId'] ?? ($trip['offerId'] ?? ''))),
        'offer_name'            => sanitize_text_field((string) ($payload['offerName'] ?? ($trip['offerName'] ?? ''))),
        'visitor_market'        => sanitize_text_field((string) ($payload['visitorMarket'] ?? '')),
        'rooms_count'           => $requested_rooms_val,
        'family_room_requested' => $family_room_requested,
        'check_in_date'         => $check_in_val,
        'check_out_date'        => $check_out_val,
        'preferred_date'        => sanitize_text_field((string) ($payload['preferredDate'] ?? '')),
        'child_ages'            => $child_ages,
        'country'               => sanitize_text_field((string) ($payload['country'] ?? '')),
        'selected_extras'       => $selected_extras,
        'estimated_price'       => sanitize_text_field((string) ($payload['estimatedPriceLabel'] ?? '')),
        'preferred_channel'     => $pref_channel,
        'source_page'           => esc_url_raw((string) ($payload['sourcePageUrl'] ?? '')),
        'itinerary_draft'       => $itinerary_draft,
        'promotion_id'          => $promotion_id,
        'promotion_name'        => $promotion_name,
    );

    $rate_changed = false;
    if ($type === 'holiday-builder') {
        $booking_snap = outbound_build_enquiry_snapshot($payload);
        $estimate     = is_array($booking_snap['estimate'] ?? null)
            ? $booking_snap['estimate']
            : outbound_calculate_holiday_estimate(array(
                'nights'           => max(1, $nights),
                'adults'           => max(1, $adults),
                'children'         => $children,
                'stayNightRateUSD' => $stay_rate,
                'activityRatesUSD' => $activity_rates,
                'transportType'    => $transport,
            ));
        if (!empty($booking_snap['itemizedEstimate']) && is_array($booking_snap['itemizedEstimate'])) {
            $builder_details['itemized_estimate'] = $booking_snap['itemizedEstimate'];
            $srv_sub = $booking_snap['itemizedEstimate']['subtotalUSD'] ?? null;
            $cli_sub = $trip['itemizedEstimate']['subtotalUSD'] ?? null;
            if (is_numeric($srv_sub) && is_numeric($cli_sub) && (int) round((float) $srv_sub) !== (int) round((float) $cli_sub)) {
                $rate_changed = true;
            }
        }
        if (!empty($booking_snap['accommodationName']) && $builder_details['accommodation_name'] === '') {
            $builder_details['accommodation_name'] = (string) $booking_snap['accommodationName'];
        }
        if (!empty($booking_snap['selectedActivities']) && is_array($booking_snap['selectedActivities'])) {
            $builder_details['activities'] = array_values(array_filter(array_map(
                static fn($a) => is_array($a) ? (string) ($a['title'] ?? '') : '',
                $booking_snap['selectedActivities']
            )));
        }
    } else {
        $estimate = array('minimum' => 0, 'maximum' => 0, 'currency' => 'USD', 'rooms' => 0, 'disclaimer' => '');
    }

    if (function_exists('outbound_maybe_install_schema')) {
        outbound_maybe_install_schema(false);
    }

    $reference_code = outbound_generate_reference_code();

    global $wpdb;
    $tables = outbound_get_table_names();
    $now    = gmdate('Y-m-d H:i:s');
    $cap_str = static fn(string $v, int $max): string => function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);

    $initial_log = array(
        array(
            'at'     => gmdate('c'),
            'actor'  => 'website',
            'action' => 'created',
            'detail' => sprintf('Enquiry %s received (%s).', $reference_code, $type),
        ),
    );
    $insert_data = array(
        'reference_code'       => $reference_code,
        'idempotency_key'      => $idempotency_key !== '' ? $cap_str($idempotency_key, 95) : null,
        'type'                 => $cap_str($type, 38),
        'full_name'            => $cap_str($full_name, 155),
        'email'                => $cap_str($email, 250),
        'phone'                => $cap_str($phone, 60),
        'party_type'           => $cap_str($party_type, 38),
        'trip_intent'          => $cap_str($trip_intent, 60),
        'adults'               => $adults,
        'children'             => $children,
        'nights'               => $nights,
        'travel_season'        => $cap_str($travel_season, 75),
        'stay_tier_id'         => $cap_str($stay_tier_id, 75),
        'transport_type'       => $cap_str($transport, 60),
        'estimate_min_usd'     => (int) $estimate['minimum'],
        'estimate_max_usd'     => (int) $estimate['maximum'],
        'marketing_consent'    => $marketing ? 1 : 0,
        'subject'              => $cap_str($subject, 250),
        'message'              => $notes,
        'payload_json'         => wp_json_encode($payload) ?: '{}',
        'status'               => 'new',
        'office_mail_status'   => 'pending',
        'customer_mail_status' => is_email($email) ? 'pending' : 'skipped',
        'activity_log_json'    => wp_json_encode($initial_log) ?: '[]',
        'promotion_id'         => $promotion_id ?: 0,
        'promotion_name'       => $promotion_name !== '' ? $cap_str($promotion_name, 250) : null,
        'ip_address'           => hash('sha256', $client_ip),
        'created_at'           => $now,
        'updated_at'           => $now,
    );
    $insert_formats = array('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s');

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
        'saved'            => true,
        'ok'               => true,
        'reference'        => $reference_code,
        'referenceCode'    => $reference_code,
        'customerName'     => $full_name,
        'submittedAt'      => gmdate('c'),
        'estimate'         => $estimate,
        'itemizedEstimate' => $builder_details['itemized_estimate'] ?? null,
        'rateChanged'      => $rate_changed,
        'summary'          => $builder_details,
        'message'          => 'Thank you! Your Victoria Falls enquiry has been saved cleanly.',
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

    if ($adults > 0 || $children > 0) {
        $party_label = sprintf('%d %s', $adults, $adults === 1 ? 'Adult' : 'Adults');
        if ($children > 0) {
            $party_label .= sprintf(', %d %s', $children, $children === 1 ? 'Child' : 'Children');
        }
        if (!empty($builder_details['party_type'])) {
            $party_label .= ' (' . (string) $builder_details['party_type'] . ')';
        }
        $rows[] = array('Travellers', $party_label);
    }

    if ($nights > 0 || !empty($builder_details['travel_season']) || !empty($builder_details['approx_month'])) {
        $dur_parts = array();
        if ($nights > 0) {
            $dur_parts[] = sprintf('%d %s', $nights, $nights === 1 ? 'Night' : 'Nights');
        }
        if (!empty($builder_details['approx_month'])) {
            $dur_parts[] = (string) $builder_details['approx_month'];
        } elseif (!empty($builder_details['travel_season'])) {
            $dur_parts[] = (string) $builder_details['travel_season'];
        }
        $rows[] = array('Duration & Travel Window', implode(' — ', $dur_parts));
    }
    if (!empty($builder_details['visitor_category'])) {
        $rows[] = array('Visitor Category', ucwords(str_replace('_', ' ', (string) $builder_details['visitor_category'])));
    }
    if (($builder_details['stay_arrangement'] ?? '') === 'already-arranged') {
        $rows[] = array('Accommodation', 'Already arranged independently');
    } elseif (($builder_details['stay_arrangement'] ?? '') === 'recommend') {
        $rows[] = array('Accommodation', 'Specialist recommendation requested');
    }

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
    if (!empty($builder_details['rate_plan_name'])) {
        $rows[] = array('Rate Plan', (string) $builder_details['rate_plan_name']);
    } elseif (!empty($builder_details['rate_plan_id'])) {
        $rows[] = array('Rate Plan ID', (string) $builder_details['rate_plan_id']);
    }
    if (!empty($builder_details['offer_name'])) {
        $rows[] = array('Special Offer / Package', (string) $builder_details['offer_name']);
    }
    if (!empty($builder_details['visitor_market'])) {
        $rows[] = array('Visitor Market', (string) $builder_details['visitor_market']);
    }
    if (!empty($builder_details['family_room_requested'])) {
        $rows[] = array('Rooms / Units', sprintf('%d (Family / Interleading Room requested)', max(1, (int) ($builder_details['rooms_count'] ?? 1))));
    } elseif (!empty($builder_details['rooms_count']) && (int) $builder_details['rooms_count'] > 1) {
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
    if (!empty($builder_details['transfer_date'])) {
        $rows[] = array('Transfer Date', (string) $builder_details['transfer_date']);
    }
    if (!empty($builder_details['flight_time_unknown'])) {
        $rows[] = array('Flight Time', 'Flight time not yet known');
    } elseif (!empty($builder_details['flight_time'])) {
        $rows[] = array('Flight Time', (string) $builder_details['flight_time']);
    }
    if (!empty($builder_details['pickup_time'])) {
        $rows[] = array('Preferred Pickup Time', (string) $builder_details['pickup_time']);
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
    if (!empty($builder_details['selected_activities']) && is_array($builder_details['selected_activities'])) {
        $items = '';
        foreach ($builder_details['selected_activities'] as $sa) {
            if (!is_array($sa) || empty($sa['title'])) {
                continue;
            }
            $day_t  = trim((string) ($sa['preferredDay'] ?? ''));
            $date_t = trim((string) ($sa['activityDate'] ?? ''));
            $time_t = trim((string) ($sa['preferredTime'] ?? ''));
            $sched_parts = array();
            if ($day_t !== '' && $day_t !== 'to-be-scheduled') {
                $day_label = preg_match('/^day-(\d+)$/', $day_t, $m) ? 'Day ' . $m[1] : $day_t;
                if ($date_t !== '' && $date_t !== $day_t) {
                    $sched_parts[] = $day_label . ' (' . $date_t . ')';
                } else {
                    $sched_parts[] = $day_label;
                }
            } elseif ($date_t !== '') {
                $sched_parts[] = $date_t;
            }
            if ($time_t !== '' && $time_t !== 'to-be-arranged') {
                $sched_parts[] = $time_t === 'any-time' ? 'Any time' : ucfirst($time_t);
            }
            $suffix = !empty($sched_parts) ? ' (' . implode(' · ', $sched_parts) . ')' : '';
            $items .= '<li style="margin:0 0 4px;">' . esc_html((string) $sa['title'] . $suffix) . '</li>';
        }
        if ($items !== '') {
            $activities_html = sprintf(
                '<div style="margin-top:12px;"><p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#0D2833;">Selected Experiences (%d):</p><ul style="margin:0;padding-left:18px;font-size:13px;color:#1F2937;">%s</ul></div>',
                count($builder_details['selected_activities']),
                $items
            );
        }
    } elseif (!empty($builder_details['activities']) && is_array($builder_details['activities'])) {
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

    $itemized_html = '';
    if (!empty($builder_details['itemized_estimate']) && is_array($builder_details['itemized_estimate'])) {
        $ie = $builder_details['itemized_estimate'];
        $ie_lines_html = '';
        foreach ((array) ($ie['lines'] ?? array()) as $l) {
            if (!is_array($l)) { continue; }
            $amt_str = (isset($l['amountUSD']) && $l['amountUSD'] !== null)
                ? (($l['status'] ?? '') === 'free' ? 'Included / Free' : ('US$' . number_format((int) $l['amountUSD'])))
                : ((string) ($l['status'] ?? '') === 'arranged' ? 'Already arranged' : 'Price on request');
            $ie_lines_html .= sprintf(
                '<tr><td style="padding:5px 8px;border-bottom:1px solid #ece7da;font-size:12px;color:#0D2833;"><strong>%s</strong><br><span style="color:#6B7280;">%s</span></td><td style="padding:5px 8px;border-bottom:1px solid #ece7da;font-size:12px;color:#0D2833;text-align:right;white-space:nowrap;"><strong>%s</strong></td></tr>',
                esc_html((string) ($l['title'] ?? '')),
                esc_html((string) ($l['basis'] ?? '')),
                esc_html($amt_str)
            );
        }
        $ie_head = (string) ($ie['headlineLabel'] ?? 'Trip estimate');
        $ie_sub  = isset($ie['subtotalUSD']) && is_numeric($ie['subtotalUSD']) ? 'US$' . number_format((int) $ie['subtotalUSD']) : 'Request a quote';
        $ie_excl = !empty($ie['excludedItems']) && is_array($ie['excludedItems'])
            ? '<p style="margin:8px 0 0;font-size:12px;color:#92400E;"><strong>Price on request / excluded from subtotal:</strong> ' . esc_html(implode('; ', array_map('strval', $ie['excludedItems']))) . '</p>'
            : '';
        if ($ie_lines_html !== '') {
            $itemized_html = "
                <div style='margin-top:14px;padding-top:10px;border-top:1px solid #E5D6B3;'>
                    <p style='margin:0 0 6px;font-size:13px;font-weight:bold;color:#0D2833;'>" . esc_html($ie_head . ': ' . $ie_sub) . "</p>
                    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>{$ie_lines_html}</table>
                    {$ie_excl}
                </div>";
        }
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
            {$itemized_html}
            {$itinerary_html}
        </div>";
}

/**
 * Validate submitted offer ID & travel dates against live property offers so expired or out-of-window offers cannot be submitted.
 *
 * @return true|WP_Error
 */
function outbound_validate_offer_enquiry_dates(
    string $acc_id,
    string $offer_id,
    string $check_in = '',
    string $check_out = '',
    ?string $reference_date = null
) {
    $today = $reference_date ?: gmdate('Y-m-d');
    $ctx   = outbound_get_enquiry_catalog_context();
    $matched_offer = null;

    foreach ((array) ($ctx['accommodations'] ?? array()) as $acc) {
        if (!is_array($acc)) {
            continue;
        }
        $aid   = (string) ($acc['id'] ?? '');
        $aslug = (string) ($acc['slug'] ?? '');
        if ($aid !== $acc_id && $aslug !== $acc_id) {
            continue;
        }
        foreach ((array) ($acc['offers'] ?? array()) as $off) {
            if (is_array($off) && (string) ($off['id'] ?? '') === $offer_id) {
                $matched_offer = $off;
                break 2;
            }
        }
    }

    if (!is_array($matched_offer)) {
        return true;
    }
    $status = strtolower((string) ($matched_offer['status'] ?? 'published'));
    if (in_array($status, array('draft', 'archived', 'trashed'), true)) {
        return new WP_Error('offer_unavailable', 'The selected special offer is no longer active. Please submit without the offer or pick an available stay option.', array('status' => 400));
    }
    $valid_from = trim((string) ($matched_offer['validFrom'] ?? ''));
    $valid_to   = trim((string) ($matched_offer['validTo'] ?? ''));
    if ($valid_to !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $valid_to) && $valid_to < $today) {
        return new WP_Error('offer_expired', 'The selected special offer expired on ' . $valid_to . ' and is no longer available.', array('status' => 400));
    }
    if ($check_in !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $check_in)) {
        if ($valid_from !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $valid_from) && $check_in < $valid_from) {
            return new WP_Error('offer_dates_invalid', 'The selected offer begins ' . $valid_from . ' and does not cover check-in on ' . $check_in . '.', array('status' => 400));
        }
        if ($valid_to !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $valid_to) && $check_in > $valid_to) {
            return new WP_Error('offer_dates_invalid', 'The selected offer ends ' . $valid_to . ' and does not cover your selected dates.', array('status' => 400));
        }
    }
    if ($check_out !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $check_out)) {
        $last_night_ts = strtotime($check_out . ' -1 day');
        $last_night    = $last_night_ts ? gmdate('Y-m-d', $last_night_ts) : $check_out;
        if ($valid_to !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $valid_to) && $last_night > $valid_to) {
            return new WP_Error('offer_dates_invalid', 'The selected offer ends ' . $valid_to . ' and does not cover nights up to ' . $last_night . '.', array('status' => 400));
        }
    }

    return true;
}

/**
 * Send one WordPress notification email and capture any PHPMailer/WP_Error failure details.
 *
 * @param array<int, string> $headers
 * @return array{ok:bool,error:string}
 */
function outbound_send_single_enquiry_mail(string $to, string $subject, string $body, array $headers): array {
    $captured_error = '';
    $capture_cb = static function ($wp_error) use (&$captured_error): void {
        if ($wp_error instanceof WP_Error) {
            $captured_error = trim((string) $wp_error->get_error_message());
        }
    };
    if (function_exists('add_action')) {
        add_action('wp_mail_failed', $capture_cb);
    }
    $ok = function_exists('wp_mail') ? (bool) wp_mail($to, $subject, $body, $headers) : false;
    if (function_exists('remove_action')) {
        remove_action('wp_mail_failed', $capture_cb);
    }
    if ($ok) {
        return array('ok' => true, 'error' => '');
    }
    $msg = $captured_error !== ''
        ? $captured_error
        : 'wp_mail() returned false. Verify SMTP transport and sender settings under Setup & Email Health.';
    return array('ok' => false, 'error' => $msg);
}

/**
 * Append a chronological activity entry to an enquiry row's `activity_log_json` column.
 */
function outbound_append_enquiry_log(int $enquiry_id, string $actor, string $action, string $detail, array $extra_columns = array()): void {
    if ($enquiry_id <= 0 || !isset($GLOBALS['wpdb'])) {
        return;
    }
    global $wpdb;
    $tables = outbound_get_table_names();
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    $raw_log = $wpdb->get_var($wpdb->prepare("SELECT activity_log_json FROM {$tables['enquiries']} WHERE id = %d", $enquiry_id));
    $log     = is_string($raw_log) && $raw_log !== '' ? json_decode($raw_log, true) : array();
    if (!is_array($log)) {
        $log = array();
    }
    $log[] = array(
        'at'     => gmdate('c'),
        'actor'  => sanitize_text_field($actor),
        'action' => sanitize_text_field($action),
        'detail' => sanitize_text_field($detail),
    );
    if (count($log) > 100) {
        $log = array_slice($log, -100);
    }
    $update = array_merge($extra_columns, array(
        'activity_log_json' => wp_json_encode($log) ?: '[]',
        'updated_at'        => gmdate('Y-m-d H:i:s'),
    ));
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    $wpdb->update($tables['enquiries'], $update, array('id' => $enquiry_id));
}

/**
 * Send notification email to specialist team + guest confirmation summary and record separate send statuses.
 *
 * @return array{office:array{status:string,error:string},customer:array{status:string,error:string}}
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
    array $builder_details = array(),
    string $target_mode = 'both',
    string $actor = 'system'
): array {
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

    $ie_sum = $builder_details['itemized_estimate'] ?? null;
    if (is_array($ie_sum) && !empty($ie_sum['lines'])) {
        $ie_lbl = (string) ($ie_sum['headlineLabel'] ?? 'Trip estimate');
        $ie_amt = isset($ie_sum['subtotalUSD']) && is_numeric($ie_sum['subtotalUSD'])
            ? ('US$' . number_format((int) $ie_sum['subtotalUSD']))
            : 'Price on request';
        $estimate_line = sprintf('<p><strong>%s:</strong> %s</p>', esc_html($ie_lbl), esc_html($ie_amt));
    } else {
        $estimate_line = !empty($estimate['minimum'])
            ? sprintf('<p><strong>Estimated Guide Budget:</strong> $%s – $%s USD</p>', number_format((int) $estimate['minimum']), number_format((int) $estimate['maximum']))
            : '';
    }

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
    $party_dur_html = ($adults > 0 || $children > 0 || $nights > 0)
        ? "<p><strong>Party & Duration:</strong> {$adults} Adults, {$children} Children" . ($nights > 0 ? ", {$nights} Nights" : '') . "</p>"
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
                <p><strong>Email:</strong> " . esc_html($email ?: 'Not provided (WhatsApp preferred)') . "</p>
                <p><strong>Phone / WhatsApp:</strong> " . esc_html($phone ?: 'Not provided') . "</p>
                {$party_dur_html}
                {$estimate_line}
                {$options_html}
                <p><strong>Notes:</strong><br>" . nl2br(esc_html($notes ?: 'None')) . "</p>
                <p><a href='" . esc_url(admin_url('admin.php?page=outbound-enquiries&enquiry_id=' . $enquiry_id)) . "' style='display:inline-block;background:#0B5E8E;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;'>Open in WordPress Admin</a></p>
            </div>
        </div>";

    $result_summary = array(
        'office'   => array('status' => 'skipped', 'error' => ''),
        'customer' => array('status' => 'skipped', 'error' => ''),
    );

    if ($target_mode === 'both' || $target_mode === 'office') {
        $office_send = outbound_send_single_enquiry_mail(
            $specialist_email,
            sprintf('[%s] New Victoria Falls Enquiry from %s', $reference, $name),
            $specialist_body,
            $specialist_headers
        );
        $office_status = $office_send['ok'] ? 'sent' : 'failed';
        $result_summary['office'] = array('status' => $office_status, 'error' => $office_send['error']);
        if (!$office_send['ok']) {
            error_log(sprintf('[Outbound Enquiries %s] Office notification failed to %s: %s', $reference, $specialist_email, $office_send['error']));
        }
        $office_cols = array(
            'office_mail_status' => $office_status,
            'office_mail_error'  => $office_send['ok'] ? null : $office_send['error'],
        );
        if ($office_send['ok']) {
            $office_cols['office_mail_sent_at'] = gmdate('Y-m-d H:i:s');
        }
        outbound_append_enquiry_log(
            $enquiry_id,
            $actor,
            $office_send['ok'] ? 'office_email_sent' : 'office_email_failed',
            $office_send['ok']
                ? 'Office notification accepted for delivery to ' . $specialist_email
                : 'Office notification failed for ' . $specialist_email . ': ' . $office_send['error'],
            $office_cols
        );
    }

    if ($target_mode === 'both' || $target_mode === 'customer') {
        if (is_email($email)) {
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

            $cust_send = outbound_send_single_enquiry_mail(
                $email,
                sprintf('We received your Outbound Holidays enquiry (%s)', $reference),
                $guest_body,
                $headers
            );
            $cust_status = $cust_send['ok'] ? 'sent' : 'failed';
            $result_summary['customer'] = array('status' => $cust_status, 'error' => $cust_send['error']);
            if (!$cust_send['ok']) {
                error_log(sprintf('[Outbound Enquiries %s] Customer confirmation failed to %s: %s', $reference, $email, $cust_send['error']));
            }
            $cust_cols = array(
                'customer_mail_status' => $cust_status,
                'customer_mail_error'  => $cust_send['ok'] ? null : $cust_send['error'],
            );
            if ($cust_send['ok']) {
                $cust_cols['customer_mail_sent_at'] = gmdate('Y-m-d H:i:s');
            }
            outbound_append_enquiry_log(
                $enquiry_id,
                $actor,
                $cust_send['ok'] ? 'customer_email_sent' : 'customer_email_failed',
                $cust_send['ok']
                    ? 'Customer confirmation accepted for delivery to ' . $email
                    : 'Customer confirmation failed for ' . $email . ': ' . $cust_send['error'],
                $cust_cols
            );
        } else {
            $result_summary['customer'] = array('status' => 'skipped', 'error' => 'No valid customer email address provided.');
            outbound_append_enquiry_log(
                $enquiry_id,
                $actor,
                'customer_email_skipped',
                'Customer email skipped (WhatsApp/phone-only enquiry).',
                array('customer_mail_status' => 'skipped', 'customer_mail_error' => null)
            );
        }
    }

    return $result_summary;
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
        $eid        = (int) ($_POST['enquiry_id'] ?? 0);
        $status     = sanitize_text_field((string) ($_POST['status'] ?? 'new'));
        $notes      = sanitize_textarea_field((string) ($_POST['admin_notes'] ?? ''));
        $consultant = sanitize_text_field((string) ($_POST['assigned_consultant'] ?? ''));
        $follow_up  = trim(sanitize_text_field((string) ($_POST['follow_up_date'] ?? '')));
        $follow_val = preg_match('/^\d{4}-\d{2}-\d{2}$/', $follow_up) ? $follow_up : null;
        if ($eid > 0 && array_key_exists($status, outbound_get_enquiry_statuses())) {
            $current_user = function_exists('wp_get_current_user') ? wp_get_current_user() : null;
            $actor_name   = ($current_user && !empty($current_user->user_login)) ? (string) $current_user->user_login : 'admin';
            outbound_append_enquiry_log(
                $eid,
                $actor_name,
                'status_updated',
                sprintf(
                    'Status -> %s%s%s',
                    $status,
                    $consultant !== '' ? ' | Consultant: ' . $consultant : '',
                    $follow_val ? ' | Follow-up: ' . $follow_val : ''
                ),
                array(
                    'status'              => $status,
                    'assigned_consultant' => $consultant !== '' ? $consultant : null,
                    'follow_up_date'      => $follow_val,
                    'admin_notes'         => $notes,
                )
            );
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Enquiry workflow, consultant assignment & history updated.', 'outbound-holidays') . '</p></div>';
        }
    }

    if (isset($_POST['outbound_resend_enquiry_mail']) && check_admin_referer('outbound_enquiry_resend', 'outbound_enquiry_resend_nonce')) {
        $eid         = (int) ($_POST['enquiry_id'] ?? 0);
        $resend_mode = sanitize_key((string) ($_POST['resend_target'] ?? 'both'));
        if (!in_array($resend_mode, array('office', 'customer', 'both'), true)) {
            $resend_mode = 'both';
        }
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $row = $eid > 0 ? $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tables['enquiries']} WHERE id = %d LIMIT 1", $eid)) : null;
        if ($row) {
            $row_payload = !empty($row->payload_json) ? (array) json_decode((string) $row->payload_json, true) : array();
            $row_snap    = outbound_build_enquiry_snapshot($row_payload);
            $row_est     = array(
                'minimum' => (int) ($row->estimate_min_usd ?: ($row_snap['estimate']['minimum'] ?? 0)),
                'maximum' => (int) ($row->estimate_max_usd ?: ($row_snap['estimate']['maximum'] ?? 0)),
            );
            $row_details = array(
                'trip_intent'        => (string) $row->trip_intent,
                'party_type'         => (string) $row->party_type,
                'travel_season'      => (string) $row->travel_season,
                'stay_tier'          => (string) $row->stay_tier_id,
                'activities'         => array_map(static fn($a) => (string) ($a['title'] ?? ''), (array) ($row_snap['selectedActivities'] ?? array())),
                'transport'          => (string) $row->transport_type,
                'accommodation_name' => (string) ($row_snap['accommodationName'] ?? ($row_payload['propertyName'] ?? '')),
                'room_type'          => (string) ($row_snap['roomType'] ?? ($row_payload['roomType'] ?? '')),
                'meal_plan'          => (string) ($row_payload['mealPlan'] ?? ''),
                'rate_plan_id'       => (string) ($row_payload['ratePlanId'] ?? ''),
                'rate_plan_name'     => (string) ($row_payload['ratePlanName'] ?? ''),
                'offer_name'         => (string) ($row_payload['offerName'] ?? ''),
                'visitor_market'     => (string) ($row_payload['visitorMarket'] ?? ''),
                'check_in_date'      => (string) ($row_snap['arrivalDate'] ?? ''),
                'check_out_date'     => (string) ($row_snap['departureDate'] ?? ''),
                'estimated_price'    => (string) ($row_payload['estimatedPriceLabel'] ?? ''),
                'promotion_id'       => (int) ($row->promotion_id ?? 0),
                'promotion_name'     => (string) ($row->promotion_name ?? ''),
            );
            $current_user = function_exists('wp_get_current_user') ? wp_get_current_user() : null;
            $actor_name   = ($current_user && !empty($current_user->user_login)) ? (string) $current_user->user_login : 'admin';
            $resend_res   = outbound_dispatch_enquiry_emails(
                (string) $row->reference_code,
                (string) $row->type,
                (string) $row->full_name,
                (string) $row->email,
                (string) ($row->phone ?? ''),
                (int) $row->adults,
                (int) $row->children,
                (int) $row->nights,
                $row_est,
                (string) ($row->message ?? ''),
                (int) $row->id,
                $row_details,
                $resend_mode,
                $actor_name
            );
            $has_fail = ($resend_res['office']['status'] === 'failed' || $resend_res['customer']['status'] === 'failed');
            $cls      = $has_fail ? 'notice-error' : 'notice-success';
            $summary  = sprintf(
                'Resend result for %s — Office: %s%s | Customer: %s%s',
                (string) $row->reference_code,
                strtoupper($resend_res['office']['status']),
                $resend_res['office']['error'] !== '' ? ' (' . $resend_res['office']['error'] . ')' : '',
                strtoupper($resend_res['customer']['status']),
                $resend_res['customer']['error'] !== '' ? ' (' . $resend_res['customer']['error'] . ')' : ''
            );
            echo '<div class="notice ' . esc_attr($cls) . ' is-dismissible"><p>' . esc_html($summary) . '</p></div>';
        }
    }

    if (isset($_GET['export']) && $_GET['export'] === 'csv' && check_admin_referer('outbound_export_enquiries_csv')) {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $rows = $wpdb->get_results("SELECT * FROM {$tables['enquiries']} ORDER BY created_at DESC LIMIT 2000", ARRAY_A);
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="outbound-enquiries-' . gmdate('Ymd') . '.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, array('Reference', 'Type', 'Promotion', 'Name', 'Email', 'Phone', 'Adults', 'Children', 'Nights', 'Estimate Min USD', 'Estimate Max USD', 'Status', 'Assigned Consultant', 'Follow-up Date', 'Office Email Status', 'Customer Email Status', 'Created At'));
        foreach ((array) $rows as $r) {
            $cells = array($r['reference_code'], $r['type'], $r['promotion_name'] ?? '', $r['full_name'], $r['email'], $r['phone'], $r['adults'], $r['children'], $r['nights'], $r['estimate_min_usd'], $r['estimate_max_usd'], $r['status'], $r['assigned_consultant'] ?? '', $r['follow_up_date'] ?? '', $r['office_mail_status'] ?? 'pending', $r['customer_mail_status'] ?? 'pending', $r['created_at']);
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
        "SELECT id, reference_code, type, full_name, email, adults, children, nights, estimate_min_usd, estimate_max_usd, status, assigned_consultant, follow_up_date, office_mail_status, customer_mail_status, promotion_id, promotion_name, created_at FROM {$tables['enquiries']} {$where} ORDER BY created_at DESC LIMIT %d OFFSET %d",
        $per_page,
        $offset
    ));
    $selected_id = isset($_GET['enquiry_id']) ? (int) $_GET['enquiry_id'] : 0;
    $selected = $selected_id > 0
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        ? $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tables['enquiries']} WHERE id = %d", $selected_id))
        : null;

    $cms_opts     = outbound_get_site_options();
    $from_cfg     = function_exists('outbound_get_mail_from_config') ? outbound_get_mail_from_config() : array('email' => 'fungai@outboundholiday.com', 'name' => 'Outbound Holidays');
    $mail_badge   = static function (string $st): string {
        $cls = match (strtolower($st)) {
            'sent'    => 'outbound-badge-green',
            'failed'  => 'outbound-badge-red',
            'skipped' => 'outbound-badge-slate',
            default   => 'outbound-badge-amber',
        };
        return '<span class="outbound-badge ' . esc_attr($cls) . '">' . esc_html(strtoupper($st)) . '</span>';
    };
    ?>
    <div class="wrap outbound-admin-wrap">
        <div class="outbound-admin-header">
            <div>
                <h1><?php esc_html_e('Customer Enquiries & Custom Holiday Plans', 'outbound-holidays'); ?></h1>
                <p>
                    Office Recipient (About &amp; Contact): <strong><?php echo esc_html((string) ($cms_opts['contact']['email'] ?? 'fungai@outboundholiday.com')); ?></strong>
                    &nbsp;|&nbsp; Sender (Setup &amp; Email Health): <strong><?php echo esc_html((string) ($from_cfg['email'] ?? 'fungai@outboundholiday.com')); ?></strong>
                    &nbsp;· <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-cms&section=about-contact')); ?>">Verify Recipient</a>
                    · <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-setup-health')); ?>">Verify Sender &amp; SMTP</a>
                </p>
            </div>
            <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=outbound-enquiries&export=csv'), 'outbound_export_enquiries_csv')); ?>" class="button button-secondary"><?php esc_html_e('Export CSV', 'outbound-holidays'); ?></a>
        </div>

        <?php if ($selected) :
            $decoded      = json_decode((string) $selected->payload_json, true);
            $off_status   = (string) ($selected->office_mail_status ?? 'pending');
            $off_err      = (string) ($selected->office_mail_error ?? '');
            $cust_status  = (string) ($selected->customer_mail_status ?? 'pending');
            $cust_err     = (string) ($selected->customer_mail_error ?? '');
            $history_list = !empty($selected->activity_log_json) ? json_decode((string) $selected->activity_log_json, true) : array();
        ?>
            <div class="outbound-admin-card">
                <h2><?php echo esc_html($selected->reference_code . ' — ' . $selected->full_name); ?></h2>
                <?php if (!empty($selected->promotion_name)) : ?>
                    <p style="margin:6px 0 12px;"><span style="background:#eef6fb;color:#0B5E8E;font-weight:bold;padding:4px 10px;border-radius:4px;border:1px solid #bfdbfe;font-size:13px;">Campaign Offer: <?php echo esc_html($selected->promotion_name); ?></span></p>
                <?php endif; ?>
                <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;margin-bottom:14px;">
                    <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:space-between;">
                        <div>
                            <strong>Office Email Notification:</strong> <?php echo $mail_badge($off_status); ?>
                            <?php if (!empty($selected->office_mail_sent_at)) : ?><small>(<?php echo esc_html((string) $selected->office_mail_sent_at); ?> UTC)</small><?php endif; ?>
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <strong>Customer Email Confirmation:</strong> <?php echo $mail_badge($cust_status); ?>
                            <?php if (!empty($selected->customer_mail_sent_at)) : ?><small>(<?php echo esc_html((string) $selected->customer_mail_sent_at); ?> UTC)</small><?php endif; ?>
                        </div>
                        <form method="post" style="display:flex;gap:6px;flex-wrap:wrap;margin:0;">
                            <?php wp_nonce_field('outbound_enquiry_resend', 'outbound_enquiry_resend_nonce'); ?>
                            <input type="hidden" name="enquiry_id" value="<?php echo (int) $selected->id; ?>" />
                            <input type="hidden" name="outbound_resend_enquiry_mail" value="1" />
                            <button type="submit" name="resend_target" value="office" class="button button-small">Resend Office Email</button>
                            <button type="submit" name="resend_target" value="customer" class="button button-small">Resend Customer Email</button>
                            <button type="submit" name="resend_target" value="both" class="button button-small button-secondary">Resend Both</button>
                        </form>
                    </div>
                    <?php if ($off_err !== '') : ?>
                        <p style="margin:8px 0 0;color:#b91c1c;font-size:12px;"><strong>Office Mail Failure:</strong> <?php echo esc_html($off_err); ?></p>
                    <?php endif; ?>
                    <?php if ($cust_err !== '') : ?>
                        <p style="margin:6px 0 0;color:#b91c1c;font-size:12px;"><strong>Customer Mail Failure:</strong> <?php echo esc_html($cust_err); ?></p>
                    <?php endif; ?>
                </div>
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
                <?php if (!empty($decoded['ratePlanName']) || !empty($decoded['ratePlanId'])) : ?>
                    <p><strong>Rate Plan:</strong> <?php echo esc_html((string) ($decoded['ratePlanName'] ?? $decoded['ratePlanId'])); ?><?php if (!empty($decoded['ratePlanId'])) : ?> <code>(<?php echo esc_html((string) $decoded['ratePlanId']); ?>)</code><?php endif; ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['visitorMarket'])) : ?>
                    <p><strong>Visitor Market:</strong> <?php echo esc_html((string) $decoded['visitorMarket']); ?></p>
                <?php endif; ?>
                <?php if (!empty($decoded['offerName']) || !empty($decoded['offerId'])) : ?>
                    <p><strong>Special Offer:</strong> <?php echo esc_html((string) ($decoded['offerName'] ?? $decoded['offerId'])); ?><?php if (!empty($decoded['offerId'])) : ?> <code>(<?php echo esc_html((string) $decoded['offerId']); ?>)</code><?php endif; ?></p>
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
                <form method="post" style="margin-top:16px;padding-top:14px;border-top:1px solid #e2e8f0;">
                    <?php wp_nonce_field('outbound_enquiry_admin', 'outbound_enquiry_nonce'); ?>
                    <input type="hidden" name="enquiry_id" value="<?php echo (int) $selected->id; ?>">
                    <div class="outbound-meta-grid">
                        <p>
                            <label><strong>Status:</strong><br>
                                <select name="status">
                                    <?php foreach (outbound_get_enquiry_statuses() as $st => $st_label) : ?>
                                        <option value="<?php echo esc_attr($st); ?>" <?php selected((string) $selected->status, $st); ?>><?php echo esc_html($st_label); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </label>
                        </p>
                        <p>
                            <label><strong>Assigned Consultant:</strong><br>
                                <input type="text" name="assigned_consultant" value="<?php echo esc_attr((string) ($selected->assigned_consultant ?? '')); ?>" placeholder="e.g. Fungai Mtetwa" class="regular-text" />
                            </label>
                        </p>
                        <p>
                            <label><strong>Next Follow-up Date:</strong><br>
                                <input type="date" name="follow_up_date" value="<?php echo esc_attr((string) ($selected->follow_up_date ?? '')); ?>" />
                            </label>
                        </p>
                    </div>
                    <p><textarea name="admin_notes" rows="3" class="large-text" placeholder="Internal specialist notes &amp; quote handover context..."><?php echo esc_textarea((string) $selected->admin_notes); ?></textarea></p>
                    <button type="submit" name="outbound_update_enquiry" value="1" class="button button-primary"><?php esc_html_e('Save Enquiry Workflow', 'outbound-holidays'); ?></button>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-enquiries')); ?>" class="button"><?php esc_html_e('Back to All Enquiries', 'outbound-holidays'); ?></a>
                </form>

                <?php if (!empty($history_list) && is_array($history_list)) : ?>
                    <div style="margin-top:18px;padding-top:14px;border-top:1px solid #e2e8f0;">
                        <h3 style="margin:0 0 8px;">Update &amp; Email History</h3>
                        <ul style="margin:0;padding-left:18px;font-size:12px;color:#334155;">
                            <?php foreach (array_reverse($history_list) as $ev) : ?>
                                <li style="margin-bottom:4px;">
                                    <strong><?php echo esc_html((string) ($ev['action'] ?? 'update')); ?></strong>
                                    (<?php echo esc_html((string) ($ev['actor'] ?? 'system')); ?> · <?php echo esc_html(substr((string) ($ev['at'] ?? ''), 0, 19)); ?> UTC):
                                    <?php echo esc_html((string) ($ev['detail'] ?? '')); ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>
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
                <thead><tr><th>Ref</th><th>Date</th><th>Guest</th><th>Type</th><th>Nights / Party</th><th>Budget Guide</th><th>Email Delivery</th><th>Owner / Follow-up</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                <?php if (empty($enquiries)) : ?>
                    <tr><td colspan="10"><?php esc_html_e('No enquiries logged yet.', 'outbound-holidays'); ?></td></tr>
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
                        <td>
                            <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;">
                                <span>Office: <?php echo $mail_badge((string) ($row->office_mail_status ?? 'pending')); ?></span>
                                <span>Guest: <?php echo $mail_badge((string) ($row->customer_mail_status ?? 'pending')); ?></span>
                            </div>
                        </td>
                        <td>
                            <?php echo !empty($row->assigned_consultant) ? esc_html((string) $row->assigned_consultant) : '<em>Unassigned</em>'; ?>
                            <?php if (!empty($row->follow_up_date)) : ?>
                                <br><small>Follow-up: <?php echo esc_html((string) $row->follow_up_date); ?></small>
                            <?php endif; ?>
                        </td>
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

<?php
/**
 * Centralized live currency-rate service for Outbound Holidays.
 * Fetches official reference rates from Frankfurter API v2, caches for 6 hours,
 * persists last-known-good rates across temporary outages, and supports manual CMS override.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

const OUTBOUND_CURRENCY_TRANSIENT         = 'outbound_currency_rates_cache_v1';
const OUTBOUND_CURRENCY_LOCK_TRANSIENT    = 'outbound_currency_rates_lock_v1';
const OUTBOUND_CURRENCY_BACKOFF_TRANSIENT = 'outbound_currency_rates_error_backoff_v1';
const OUTBOUND_CURRENCY_LAST_GOOD_OPTION  = 'outbound_currency_rates_last_good';
const OUTBOUND_CURRENCY_MODE_OPTION       = 'outbound_currency_rates_mode';
const OUTBOUND_CURRENCY_OVERRIDE_OPTION   = 'outbound_currency_rates_override';
const OUTBOUND_CURRENCY_CACHE_TTL         = 21600; // 6 hours
const OUTBOUND_CURRENCY_PRIMARY_URL       = 'https://api.frankfurter.dev/v2/rates?base=usd&quotes=eur,gbp,zar,aud';
const OUTBOUND_CURRENCY_ZWG_URL           = 'https://api.frankfurter.dev/v2/rates?base=usd&quotes=zwg';

/**
 * Supported currency definitions (obsolete ZWL intentionally excluded).
 *
 * @return array<string, array{code:string,symbol:string,name:string,label:string}>
 */
function outbound_get_supported_currency_meta(): array {
    return array(
        'USD' => array('code' => 'USD', 'symbol' => '$',   'name' => 'US Dollar',         'label' => 'USD ($)'),
        'ZAR' => array('code' => 'ZAR', 'symbol' => 'R',   'name' => 'South African Rand','label' => 'ZAR (R)'),
        'GBP' => array('code' => 'GBP', 'symbol' => '£',   'name' => 'British Pound',     'label' => 'GBP (£)'),
        'EUR' => array('code' => 'EUR', 'symbol' => '€',   'name' => 'Euro',              'label' => 'EUR (€)'),
        'AUD' => array('code' => 'AUD', 'symbol' => 'A$',  'name' => 'Australian Dollar', 'label' => 'AUD (A$)'),
        'ZWG' => array('code' => 'ZWG', 'symbol' => 'ZWG', 'name' => 'Zimbabwe Gold',     'label' => 'ZWG (ZiG)'),
    );
}

/**
 * Return current currency rate mode ('automatic' | 'manual').
 */
function outbound_get_currency_mode(): string {
    if (!function_exists('get_option')) {
        return 'automatic';
    }
    $mode = (string) get_option(OUTBOUND_CURRENCY_MODE_OPTION, 'automatic');
    return $mode === 'manual' ? 'manual' : 'automatic';
}

/**
 * Persist currency rate mode ('automatic' | 'manual').
 */
function outbound_set_currency_mode(string $mode): void {
    if (!function_exists('update_option')) {
        return;
    }
    $clean = $mode === 'manual' ? 'manual' : 'automatic';
    update_option(OUTBOUND_CURRENCY_MODE_OPTION, $clean, false);
}

/**
 * Validate a decoded Frankfurter v2 `/v2/rates` JSON array.
 *
 * @param mixed              $decoded
 * @param array<int, string> $allowed_quotes
 * @return array{rates?:array<string,array<string,mixed>>,effectiveDate?:string,error?:string}
 */
function outbound_validate_frankfurter_rates_response($decoded, array $allowed_quotes): array {
    if (!is_array($decoded) || empty($decoded)) {
        return array('error' => 'Empty or invalid JSON payload from Frankfurter API.');
    }

    $meta_map       = outbound_get_supported_currency_meta();
    $validated      = array();
    $effective_date = '';

    foreach ($decoded as $row) {
        if (!is_array($row)) {
            continue;
        }
        $base  = strtoupper(trim((string) ($row['base'] ?? '')));
        $quote = strtoupper(trim((string) ($row['quote'] ?? '')));
        $date  = trim((string) ($row['date'] ?? ''));
        $raw_r = $row['rate'] ?? null;

        if ($base !== 'USD' || !in_array($quote, $allowed_quotes, true)) {
            continue;
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            continue;
        }
        if (!is_numeric($raw_r)) {
            continue;
        }
        $rate = (float) $raw_r;
        if (!is_finite($rate) || $rate <= 0.0) {
            continue;
        }

        $m = $meta_map[$quote] ?? array('code' => $quote, 'symbol' => $quote, 'name' => $quote, 'label' => $quote);
        $validated[$quote] = array(
            'code'          => $quote,
            'symbol'        => $m['symbol'],
            'rate'          => round($rate, 6),
            'name'          => $m['name'],
            'label'         => $m['label'],
            'effectiveDate' => $date,
            'source'        => 'Frankfurter API v2',
        );
        if ($effective_date === '' || strcmp($date, $effective_date) > 0) {
            $effective_date = $date;
        }
    }

    if (empty($validated) || $effective_date === '') {
        return array('error' => 'No valid dated USD exchange rates found in Frankfurter response.');
    }

    return array(
        'rates'         => $validated,
        'effectiveDate' => $effective_date,
    );
}

/**
 * Perform a safe HTTP GET request to Frankfurter API v2.
 *
 * @return array{rates?:array<string,array<string,mixed>>,effectiveDate?:string,error?:string}
 */
function outbound_fetch_frankfurter_rates(): array {
    if (!function_exists('wp_safe_remote_get')) {
        return array('error' => 'WordPress HTTP API is unavailable.');
    }

    $response = wp_safe_remote_get(OUTBOUND_CURRENCY_PRIMARY_URL, array(
        'timeout'     => 8,
        'redirection' => 2,
        'headers'     => array(
            'Accept'     => 'application/json',
            'User-Agent' => 'OutboundHolidays-WordPress/' . (defined('OUTBOUND_THEME_VERSION') ? OUTBOUND_THEME_VERSION : '1.0'),
        ),
    ));

    if (is_wp_error($response)) {
        return array('error' => 'Provider request failed: ' . $response->get_error_message());
    }

    $code = (int) wp_remote_retrieve_response_code($response);
    if ($code !== 200) {
        return array('error' => 'Provider returned HTTP ' . $code . '.');
    }

    $body    = (string) wp_remote_retrieve_body($response);
    $decoded = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return array('error' => 'Malformed JSON from provider: ' . json_last_error_msg());
    }

    $primary_quotes = array('EUR', 'GBP', 'ZAR', 'AUD');
    $validated      = outbound_validate_frankfurter_rates_response($decoded, $primary_quotes);
    if (!empty($validated['error'])) {
        return $validated;
    }

    $rates = $validated['rates'];
    foreach ($primary_quotes as $req_code) {
        if (!isset($rates[$req_code])) {
            return array('error' => 'Provider response missing required currency: ' . $req_code);
        }
    }

    $effective_date = (string) $validated['effectiveDate'];
    $meta_map       = outbound_get_supported_currency_meta();
    $ordered_rates  = array(
        'USD' => array(
            'code'          => 'USD',
            'symbol'        => $meta_map['USD']['symbol'],
            'rate'          => 1.0,
            'name'          => $meta_map['USD']['name'],
            'label'         => $meta_map['USD']['label'],
            'effectiveDate' => $effective_date,
            'source'        => 'Base Currency',
        ),
    );
    foreach (array('ZAR', 'GBP', 'EUR', 'AUD') as $q) {
        $ordered_rates[$q] = $rates[$q];
    }

    // Optional ZWG (Zimbabwe Gold / ZiG): only include if Frankfurter returns a valid, dated rate.
    $zwg_resp = wp_safe_remote_get(OUTBOUND_CURRENCY_ZWG_URL, array(
        'timeout'     => 5,
        'redirection' => 2,
        'headers'     => array(
            'Accept'     => 'application/json',
            'User-Agent' => 'OutboundHolidays-WordPress/' . (defined('OUTBOUND_THEME_VERSION') ? OUTBOUND_THEME_VERSION : '1.0'),
        ),
    ));
    if (!is_wp_error($zwg_resp) && (int) wp_remote_retrieve_response_code($zwg_resp) === 200) {
        $zwg_decoded = json_decode((string) wp_remote_retrieve_body($zwg_resp), true);
        $zwg_val     = outbound_validate_frankfurter_rates_response($zwg_decoded, array('ZWG'));
        if (empty($zwg_val['error']) && isset($zwg_val['rates']['ZWG'])) {
            $ordered_rates['ZWG'] = $zwg_val['rates']['ZWG'];
        }
    }

    return array(
        'rates'         => $ordered_rates,
        'effectiveDate' => $effective_date,
    );
}

/**
 * Refresh or read cached automatic currency rates with stampede & backoff protection.
 *
 * @return array<string, mixed>
 */
function outbound_refresh_currency_rates(bool $force = false): array {
    $has_transients = function_exists('get_transient') && function_exists('set_transient');

    if (!$force && $has_transients) {
        $cached = get_transient(OUTBOUND_CURRENCY_TRANSIENT);
        if (is_array($cached) && !empty($cached['rates']['USD'])) {
            return $cached;
        }
    }

    $last_good = function_exists('get_option') ? get_option(OUTBOUND_CURRENCY_LAST_GOOD_OPTION, null) : null;
    $has_good  = is_array($last_good) && !empty($last_good['rates']['USD']);

    if (!$force && $has_transients) {
        if (get_transient(OUTBOUND_CURRENCY_LOCK_TRANSIENT) || get_transient(OUTBOUND_CURRENCY_BACKOFF_TRANSIENT)) {
            if ($has_good) {
                $last_good['status'] = 'cached';
                return $last_good;
            }
        }
        set_transient(OUTBOUND_CURRENCY_LOCK_TRANSIENT, 1, 60);
    }

    $fetched = outbound_fetch_frankfurter_rates();

    if ($has_transients && function_exists('delete_transient')) {
        delete_transient(OUTBOUND_CURRENCY_LOCK_TRANSIENT);
    }

    if (empty($fetched['error']) && !empty($fetched['rates'])) {
        $payload = array(
            'base'          => 'USD',
            'mode'          => 'automatic',
            'status'        => 'live',
            'provider'      => 'Frankfurter API v2',
            'source'        => 'https://api.frankfurter.dev/v2/rates',
            'effectiveDate' => (string) $fetched['effectiveDate'],
            'fetchedAt'     => gmdate('c'),
            'lastError'     => null,
            'rates'         => $fetched['rates'],
        );

        if ($has_transients) {
            set_transient(OUTBOUND_CURRENCY_TRANSIENT, $payload, OUTBOUND_CURRENCY_CACHE_TTL);
            if (function_exists('delete_transient')) {
                delete_transient(OUTBOUND_CURRENCY_BACKOFF_TRANSIENT);
            }
        }
        if (function_exists('update_option')) {
            update_option(OUTBOUND_CURRENCY_LAST_GOOD_OPTION, $payload, false);
        }
        if ($force && function_exists('outbound_invalidate_snapshot_cache')) {
            outbound_invalidate_snapshot_cache();
        }
        return $payload;
    }

    $error_msg = (string) ($fetched['error'] ?? 'Unknown currency provider error.');
    if (function_exists('error_log')) {
        error_log('[Outbound Currency] ' . $error_msg);
    }
    if ($has_transients) {
        set_transient(OUTBOUND_CURRENCY_BACKOFF_TRANSIENT, 1, 120);
    }

    if ($has_good) {
        $last_good['mode']      = 'automatic';
        $last_good['status']    = 'cached';
        $last_good['lastError'] = $error_msg;
        return $last_good;
    }

    $meta_map = outbound_get_supported_currency_meta();
    return array(
        'base'          => 'USD',
        'mode'          => 'automatic',
        'status'        => 'unavailable',
        'provider'      => 'Frankfurter API v2',
        'source'        => 'https://api.frankfurter.dev/v2/rates',
        'effectiveDate' => null,
        'fetchedAt'     => null,
        'lastError'     => $error_msg,
        'rates'         => array(
            'USD' => array(
                'code'          => 'USD',
                'symbol'        => $meta_map['USD']['symbol'],
                'rate'          => 1.0,
                'name'          => $meta_map['USD']['name'],
                'label'         => $meta_map['USD']['label'],
                'effectiveDate' => null,
                'source'        => 'Base Currency',
            ),
        ),
    );
}

/**
 * Return the active currency rates & metadata payload (automatic or manual override).
 *
 * @return array<string, mixed>
 */
function outbound_get_currency_rates_payload(bool $force_refresh = false): array {
    $mode     = outbound_get_currency_mode();
    $meta_map = outbound_get_supported_currency_meta();

    if ($mode === 'manual' && !$force_refresh && function_exists('get_option')) {
        $raw_override = get_option(OUTBOUND_CURRENCY_OVERRIDE_OPTION, array());
        if (is_array($raw_override) && !empty($raw_override)) {
            $manual_rates = array(
                'USD' => array(
                    'code'          => 'USD',
                    'symbol'        => $meta_map['USD']['symbol'],
                    'rate'          => 1.0,
                    'name'          => $meta_map['USD']['name'],
                    'label'         => $meta_map['USD']['label'],
                    'effectiveDate' => gmdate('Y-m-d'),
                    'source'        => 'Base Currency',
                ),
            );
            foreach ($raw_override as $code => $cfg) {
                $c = strtoupper(preg_replace('/[^A-Z]/', '', (string) $code));
                if ($c === '' || $c === 'USD' || $c === 'ZWL' || !isset($meta_map[$c]) || !is_array($cfg)) {
                    continue;
                }
                $r = isset($cfg['rate']) ? (float) $cfg['rate'] : 0.0;
                if (!is_finite($r) || $r <= 0.0) {
                    continue;
                }
                $sym = !empty($cfg['symbol']) ? (string) $cfg['symbol'] : $meta_map[$c]['symbol'];
                $manual_rates[$c] = array(
                    'code'          => $c,
                    'symbol'        => $sym,
                    'rate'          => round($r, 6),
                    'name'          => $meta_map[$c]['name'],
                    'label'         => $meta_map[$c]['label'],
                    'effectiveDate' => gmdate('Y-m-d'),
                    'source'        => 'Manual CMS Override',
                );
            }
            if (count($manual_rates) > 1) {
                return array(
                    'base'          => 'USD',
                    'mode'          => 'manual',
                    'status'        => 'manual',
                    'provider'      => 'Manual CMS Override',
                    'source'        => 'WordPress CMS',
                    'effectiveDate' => gmdate('Y-m-d'),
                    'fetchedAt'     => (string) get_option('outbound_currency_manual_updated_at', gmdate('c')),
                    'lastError'     => null,
                    'rates'         => $manual_rates,
                );
            }
        }
    }

    return outbound_refresh_currency_rates($force_refresh);
}

/**
 * Return snapshot-compatible `currencyRates` map + `currencyMeta`.
 *
 * @return array{currencyRates:array<string,array{symbol:string,rate:float}>,currencyMeta:array<string,mixed>}
 */
function outbound_get_currency_snapshot_data(): array {
    $payload = outbound_get_currency_rates_payload(false);
    $simple  = array();
    foreach ((array) ($payload['rates'] ?? array()) as $code => $info) {
        if (!is_array($info) || empty($info['rate']) || (float) $info['rate'] <= 0) {
            continue;
        }
        $simple[(string) $code] = array(
            'symbol' => (string) ($info['symbol'] ?? $code),
            'rate'   => (float) $info['rate'],
        );
    }
    if (!isset($simple['USD'])) {
        $simple['USD'] = array('symbol' => '$', 'rate' => 1.0);
    }

    return array(
        'currencyRates' => $simple,
        'currencyMeta'  => array(
            'mode'          => (string) ($payload['mode'] ?? 'automatic'),
            'status'        => (string) ($payload['status'] ?? 'unavailable'),
            'provider'      => (string) ($payload['provider'] ?? 'Frankfurter API v2'),
            'effectiveDate' => $payload['effectiveDate'] ?? null,
            'fetchedAt'     => $payload['fetchedAt'] ?? null,
        ),
    );
}

<?php
/**
 * Core business logic helpers for Outbound Holidays.
 * Pure functions avoid global DB reliance where practical so they run in both WordPress and PHPUnit/CLI checks.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Default currency exchange multipliers matching src/data/travelData.ts.
 *
 * @return array<string, array{code:string,symbol:string,rate:float,label:string}>
 */
function outbound_get_currency_rates(): array {
    $defaults = array(
        'USD' => array('code' => 'USD', 'symbol' => '$',    'rate' => 1.00, 'label' => 'USD ($)'),
        'ZAR' => array('code' => 'ZAR', 'symbol' => 'R',    'rate' => 18.2, 'label' => 'ZAR (R)'),
        'GBP' => array('code' => 'GBP', 'symbol' => '£',    'rate' => 0.79, 'label' => 'GBP (£)'),
        'EUR' => array('code' => 'EUR', 'symbol' => '€',    'rate' => 0.92, 'label' => 'EUR (€)'),
        'AUD' => array('code' => 'AUD', 'symbol' => 'A$',   'rate' => 1.54, 'label' => 'AUD (A$)'),
    );

    if (function_exists('apply_filters')) {
        return apply_filters('outbound_currency_rates', $defaults);
    }
    return $defaults;
}

/**
 * Format a USD price in a target currency.
 */
function outbound_format_price(float $usd_amount, string $currency = 'USD'): string {
    $rates = outbound_get_currency_rates();
    $rate_info = $rates[$currency] ?? $rates['USD'];
    $converted = (int) round($usd_amount * (float) $rate_info['rate']);
    return $rate_info['symbol'] . number_format($converted);
}

/**
 * Format a sequential enquiry reference (`OH-YYMMDD-XXX`).
 * Pads 1..999 to 3 digits and continues naturally to 1000+ when exceeded.
 */
function outbound_format_enquiry_reference(string $yymmdd, int $sequence): string {
    $seq = max(1, $sequence);
    $suffix = $seq < 1000 ? sprintf('%03d', $seq) : (string) $seq;
    return sprintf('OH-%s-%s', $yymmdd, $suffix);
}

/**
 * Allocate the next sequential enquiry reference (`OH-YYMMDD-XXX`) in Africa/Harare timezone.
 * Uses an atomic MySQL sequence table (`wp_outbound_enquiry_sequences`) when `$wpdb` is present.
 */
function outbound_generate_reference_code(?int $sequence = null, ?DateTimeInterface $at = null): string {
    $tz  = new DateTimeZone('Africa/Harare');
    $now = $at instanceof DateTimeInterface
        ? DateTimeImmutable::createFromInterface($at)->setTimezone($tz)
        : new DateTimeImmutable('now', $tz);
    $yymmdd = $now->format('ymd');

    if ($sequence !== null) {
        return outbound_format_enquiry_reference($yymmdd, $sequence);
    }

    if (isset($GLOBALS['wpdb']) && is_object($GLOBALS['wpdb']) && function_exists('outbound_get_table_names')) {
        global $wpdb;
        $tables = outbound_get_table_names();
        if (!empty($tables['enquiry_sequences'])) {
            $seq_table = $tables['enquiry_sequences'];
            $utc_now   = gmdate('Y-m-d H:i:s');
            // Atomic MySQL counter: LAST_INSERT_ID() is connection-scoped, preventing concurrent duplicates.
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery,WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $ok = $wpdb->query($wpdb->prepare(
                "INSERT INTO {$seq_table} (seq_date, last_seq, updated_at)
                 VALUES (%s, LAST_INSERT_ID(1), %s)
                 ON DUPLICATE KEY UPDATE
                     last_seq = LAST_INSERT_ID(last_seq + 1),
                     updated_at = VALUES(updated_at)",
                $yymmdd,
                $utc_now
            ));
            if ($ok !== false) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $next_seq = (int) $wpdb->get_var('SELECT LAST_INSERT_ID()');
                if ($next_seq > 0) {
                    return outbound_format_enquiry_reference($yymmdd, $next_seq);
                }
            }
        }
    }

    // Safe fallback for unit test harnesses without a live MySQL connection.
    return outbound_format_enquiry_reference($yymmdd, 1);
}

/**
 * Calculate Holiday Builder estimate identically to server/submissions.ts.
 * Formula:
 *   stayCost      = nightRate * nights * ceil((adults + children) / 2)
 *   activityCost  = sum(activityPrices) * (adults + children * 0.8)
 *   transportCost = private-transfers ? 120 : (shared-shuttle ? 60 : 0)
 *   minEstimate   = round(stayCost + activityCost + transportCost)
 *   maxEstimate   = round(minEstimate * 1.18)
 *
 * @param array{
 *   nights:int,
 *   adults:int,
 *   children:int,
 *   stayNightRateUSD:float,
 *   activityRatesUSD:float[],
 *   transportType:string
 * } $input
 * @return array{minimum:int,maximum:int,currency:string,rooms:int,disclaimer:string}
 */
function outbound_calculate_holiday_estimate(array $input): array {
    $nights = max(1, (int) ($input['nights'] ?? 3));
    $adults = max(1, (int) ($input['adults'] ?? 2));
    $children = max(0, (int) ($input['children'] ?? 0));
    $stay_rate = max(0.0, (float) ($input['stayNightRateUSD'] ?? 220.0));
    $activity_sum = 0.0;
    foreach ((array) ($input['activityRatesUSD'] ?? array()) as $rate) {
        $activity_sum += max(0.0, (float) $rate);
    }

    $transport_type = (string) ($input['transportType'] ?? 'none');
    $transport_cost = match ($transport_type) {
        'private-transfers' => 120.0,
        'shared-shuttle'    => 60.0,
        default             => 0.0,
    };

    $rooms = (int) ceil(($adults + $children) / 2);
    $stay_cost = $stay_rate * $nights * $rooms;
    $activity_cost = $activity_sum * ($adults + ($children * 0.8));

    $minimum = (int) round($stay_cost + $activity_cost + $transport_cost);
    $maximum = (int) round($minimum * 1.18);

    return array(
        'minimum'       => $minimum,
        'maximum'       => $maximum,
        'stayCost'      => (int) round($stay_cost),
        'activityCost'  => (int) round($activity_cost),
        'transportCost' => (int) round($transport_cost),
        'currency'      => 'USD',
        'rooms'         => $rooms,
        'disclaimer'    => 'Two guests per room; child activities estimated at 80% of adult rates; supplier rates, room allocation, age restrictions and availability require confirmation.',
    );
}

/**
 * Canonical accommodation category definitions matching src/utils/accommodation.ts.
 *
 * @return array<string, array{id:string,label:string,singular:string,description:string}>
 */
function outbound_get_accommodation_category_defs(): array {
    return array(
        'all' => array(
            'id'          => 'all',
            'label'       => 'All Stays',
            'singular'    => 'Stay',
            'description' => 'Browse verified hotels, safari lodges, guest houses and apartments in Victoria Falls.',
        ),
        'hotels' => array(
            'id'          => 'hotels',
            'label'       => 'Hotels',
            'singular'    => 'Hotel',
            'description' => 'Heritage colonial elegance and modern Victoria Falls town hotels within walking distance of the Rainforest.',
        ),
        'lodges' => array(
            'id'          => 'lodges',
            'label'       => 'Lodges',
            'singular'    => 'Lodge',
            'description' => 'Luxury Zambezi riverfront sanctuaries and bush camps framed by teak woodland and private wildlife reserves.',
        ),
        'guest-houses' => array(
            'id'          => 'guest-houses',
            'label'       => 'Guest Houses',
            'singular'    => 'Guest House',
            'description' => 'Intimate, warm-hosted Victoria Falls sanctuaries set in quiet leafy suburbs with generous local hospitality.',
        ),
        'apartments' => array(
            'id'          => 'apartments',
            'label'       => 'Apartments',
            'singular'    => 'Apartment',
            'description' => 'Flexible self-catering family suites and private villas offering extra space for longer stays.',
        ),
    );
}

/**
 * Canonical accommodation category normalization matching src/utils/accommodation.ts.
 *
 * @param array<string, mixed> $item
 */
function outbound_resolve_accommodation_category_id(array $item): string {
    $explicit = strtolower(trim((string) ($item['accommodationCategory'] ?? ($item['categoryId'] ?? ''))));
    if (in_array($explicit, array('hotels', 'lodges', 'guest-houses', 'apartments'), true)) {
        return $explicit;
    }

    $raw = strtolower(trim((string) ($item['category'] ?? '')));
    if (in_array($raw, array('boutique hotel', 'hotel', 'resort', 'hotels'), true)) {
        return 'hotels';
    }
    if (in_array($raw, array('luxury lodge', 'safari lodge', 'lodge', 'lodges'), true)) {
        return 'lodges';
    }
    if (in_array($raw, array('guest lodge', 'guest house', 'guest houses', 'b&b'), true)) {
        return 'guest-houses';
    }
    if (in_array($raw, array('self-catering', 'apartment', 'apartments', 'villa'), true)) {
        return 'apartments';
    }

    $tags = array_map('strtolower', (array) ($item['filterTags'] ?? array()));
    if (in_array('self-catering', $tags, true)) {
        return 'apartments';
    }
    if (in_array('safari-lodges', $tags, true) || in_array('luxury-lodges', $tags, true)) {
        return 'lodges';
    }
    if (in_array('boutique-hotels', $tags, true)) {
        return 'hotels';
    }
    return 'guest-houses';
}

/**
 * Canonical accommodation amenity definitions matching src/utils/accommodation.ts.
 *
 * @return array<string, array{id:string,label:string}>
 */
function outbound_get_amenity_definitions(): array {
    return array(
        'wifi'            => array('id' => 'wifi', 'label' => 'Wi-Fi'),
        'pool'            => array('id' => 'pool', 'label' => 'Swimming Pool'),
        'ac'              => array('id' => 'ac', 'label' => 'Air Conditioning'),
        'self-catering'   => array('id' => 'self-catering', 'label' => 'Self-Catering'),
        'family-friendly' => array('id' => 'family-friendly', 'label' => 'Family Friendly'),
        'parking'         => array('id' => 'parking', 'label' => 'Parking'),
    );
}

/**
 * Filter & sort normalized accommodation arrays matching filterAndSortAccommodations().
 *
 * @param array<int, array<string, mixed>> $properties
 * @param array{
 *   search?:string,
 *   category?:string,
 *   minPrice?:?float,
 *   maxPrice?:?float,
 *   minGuests?:?int,
 *   amenities?:string[],
 *   sort?:string
 * } $filters
 * @return array<int, array<string, mixed>>
 */
function outbound_filter_and_sort_accommodations(array $properties, array $filters): array {
    $search = strtolower(trim((string) ($filters['search'] ?? '')));
    $category = strtolower(trim((string) ($filters['category'] ?? 'all')));
    $min_price = isset($filters['minPrice']) && $filters['minPrice'] !== '' ? (float) $filters['minPrice'] : null;
    $max_price = isset($filters['maxPrice']) && $filters['maxPrice'] !== '' ? (float) $filters['maxPrice'] : null;
    $min_guests = isset($filters['minGuests']) && $filters['minGuests'] !== '' ? (int) $filters['minGuests'] : null;
    $req_amenities = array_values(array_filter((array) ($filters['amenities'] ?? array())));
    $sort = (string) ($filters['sort'] ?? 'recommended');

    $filtered = array_values(array_filter($properties, static function (array $item) use (
        $search,
        $category,
        $min_price,
        $max_price,
        $min_guests,
        $req_amenities
    ): bool {
        if ($category !== '' && $category !== 'all') {
            if (strtolower((string) ($item['categoryId'] ?? '')) !== $category) {
                return false;
            }
        }

        if ($search !== '') {
            $haystack = strtolower(implode(' ', array(
                $item['name'] ?? '',
                $item['categoryLabel'] ?? '',
                $item['location'] ?? '',
                $item['summary'] ?? '',
                $item['description'] ?? '',
                implode(' ', (array) ($item['highlights'] ?? array())),
            )));
            if (!str_contains($haystack, $search)) {
                return false;
            }
        }

        $price = isset($item['priceFromUSD']) ? (float) $item['priceFromUSD'] : null;
        if ($min_price !== null && ($price === null || $price < $min_price)) {
            return false;
        }
        if ($max_price !== null && ($price === null || $price > $max_price)) {
            return false;
        }

        $capacity = (int) ($item['maxGuests'] ?? 2);
        if ($min_guests !== null && $capacity < $min_guests) {
            return false;
        }

        if (!empty($req_amenities)) {
            $item_amenities = array_map('strtolower', (array) ($item['amenities'] ?? array()));
            foreach ($req_amenities as $needed) {
                if (!in_array(strtolower((string) $needed), $item_amenities, true)) {
                    return false;
                }
            }
        }

        return true;
    }));

    if ($sort === 'price-asc') {
        usort($filtered, static fn($a, $b) => ((float) ($a['priceFromUSD'] ?? 999999)) <=> ((float) ($b['priceFromUSD'] ?? 999999)));
    } elseif ($sort === 'price-desc') {
        usort($filtered, static fn($a, $b) => ((float) ($b['priceFromUSD'] ?? -1)) <=> ((float) ($a['priceFromUSD'] ?? -1)));
    } elseif ($sort === 'name-asc') {
        usort($filtered, static fn($a, $b) => strcmp((string) ($a['name'] ?? ''), (string) ($b['name'] ?? '')));
    }

    return $filtered;
}

/**
 * Default CMS Site & Homepage configuration (all editable in Outbound Holidays -> Site & Homepage CMS).
 *
 * @return array<string, mixed>
 */
function outbound_get_default_site_options(): array {
    return array(
        'brand' => array(
            'name'    => 'Outbound Holidays',
            'tagline' => 'Your Victoria Falls Holiday Planned Locally From Start to Finish',
        ),
        'contact' => array(
            'whatsappNumber' => '263714701721',
            'displayNumber'  => '+263 714 701 721',
            'email'          => 'travel@outboundholidays.co.zw',
            'address'        => 'Suite 4, Mosi-oa-Tunya Commercial Centre, Victoria Falls, Zimbabwe',
            'hours'          => 'Mon - Sun: 7:30 AM - 7:00 PM (CAT)',
        ),
        'hero' => array(
            'badge'            => 'Your Local Travel Specialist in Victoria Falls, Zimbabwe',
            'title'            => 'Your Victoria Falls Holiday Planned Locally From Start to Finish',
            'subtitle'         => 'One local specialist team coordinating hand-picked stays, guided falls walks, Zambezi sunset cruises, helicopter flights and Chobe safaris without agency mark-ups.',
            'primaryCtaText'   => 'Plan My Holiday',
            'secondaryCtaText' => 'Chat on WhatsApp',
            'trustStrip'       => array(
                'Based in Victoria Falls, Zimbabwe',
                'Private Transfers & Seamless Logistics',
                'Best-Rate Local Supplier Access',
                'Direct WhatsApp Trip Support',
            ),
        ),
        'homepageSections' => array(
            'showQuickPlanning' => true,
            'showExperiences'   => true,
            'showPackages'      => true,
            'showWhereToStay'   => true,
            'showGuides'        => true,
            'showWhyOutbound'   => true,
            'showStories'       => true,
            'showClientGallery' => true,
            'showNewsletter'    => true,
            'showFinalCta'      => true,
            'experiencesTitle'  => 'Hand-Picked Things to Do in Victoria Falls',
            'experiencesSub'    => 'Every iconic angle of Mosi-oa-Tunya and the Upper Zambezi, curated by specialists on the ground.',
            'packagesTitle'     => 'Tailor-Made Victoria Falls Holiday Packages',
            'packagesSub'       => 'Pre-designed itineraries that balance adventure, river tranquillity and effortless transfers — 100% customisable.',
            'staysTitle'        => 'Where to Stay in Victoria Falls',
            'staysSub'          => 'From colonial heritage landmarks walking distance from the Rainforest to tranquil Zambezi lodges and family apartments.',
            'guidesTitle'       => 'Local Planning Guides & Travel Advice',
            'guidesSub'         => 'Seasonal water levels, visa strategies, packing lists and honest answers written from Victoria Falls.',
            'whyTitle'          => 'Why Plan with Outbound Holidays',
            'storiesTitle'      => 'Stories From Guests We Welcomed',
            'finalCtaTitle'     => 'Ready to Build Your Victoria Falls Itinerary?',
            'finalCtaSub'       => 'Tell us when you want to travel and how you like to spend your days. A Victoria Falls specialist will reply with a tailored plan.',
        ),
        'social' => array(
            'facebook'  => 'https://www.facebook.com/outboundholidays',
            'instagram' => 'https://www.instagram.com/outboundholidays',
            'youtube'   => '',
        ),
        'legal' => array(
            'privacyNote' => 'We respect your privacy and only send curated Victoria Falls updates, seasonal tips, and tailored holiday inspiration.',
            'copyright'   => '© ' . gmdate('Y') . ' Outbound Holidays. Locally based in Victoria Falls, Zimbabwe.',
        ),
    );
}

/**
 * Retrieve merged CMS Site options from WordPress wp_options.
 *
 * @return array<string, mixed>
 */
function outbound_get_site_options(): array {
    $defaults = outbound_get_default_site_options();
    if (!function_exists('get_option')) {
        return $defaults;
    }

    $stored = get_option('outbound_site_cms_options', array());
    if (!is_array($stored)) {
        return $defaults;
    }

    return array_replace_recursive($defaults, $stored);
}

/**
 * Resolve Turnstile site & secret keys from wp-config constants or wp_options.
 *
 * @return array{siteKey:string,secretKey:string}
 */
function outbound_get_turnstile_config(): array {
    $site_key   = defined('OUTBOUND_TURNSTILE_SITE_KEY') ? (string) OUTBOUND_TURNSTILE_SITE_KEY : '';
    $secret_key = defined('OUTBOUND_TURNSTILE_SECRET_KEY') ? (string) OUTBOUND_TURNSTILE_SECRET_KEY : '';

    if (function_exists('get_option')) {
        $opts = get_option('outbound_security_options', array());
        if (is_array($opts)) {
            if ($site_key === '' && !empty($opts['turnstile_site_key'])) {
                $site_key = (string) $opts['turnstile_site_key'];
            }
            if ($secret_key === '' && !empty($opts['turnstile_secret_key'])) {
                $secret_key = (string) $opts['turnstile_secret_key'];
            }
        }
    }

    return array('siteKey' => $site_key, 'secretKey' => $secret_key);
}

/**
 * Build a WhatsApp click-to-chat URL safely.
 */
function outbound_get_whatsapp_url(string $message = ''): string {
    $opts = outbound_get_site_options();
    $number = preg_replace('/[^0-9]/', '', (string) ($opts['contact']['whatsappNumber'] ?? '263714701721'));
    $base = 'https://wa.me/' . $number;
    if ($message !== '') {
        return $base . '?text=' . rawurlencode($message);
    }
    return $base;
}

/**
 * Return local bundled fallback URLs inside the theme.
 */
function outbound_get_media_fallback(string $type = 'hero'): string {
    $base = defined('OUTBOUND_THEME_URI') ? OUTBOUND_THEME_URI . '/assets/media' : '/assets/media';
    return match ($type) {
        'logo'      => $base . '/outbound-holidays-logo.webp',
        'falls'     => $base . '/falls-fallback.webp',
        'safari'    => $base . '/safari-fallback.webp',
        'family'    => $base . '/family-fallback.webp',
        'honeymoon' => $base . '/honeymoon-fallback.webp',
        default     => $base . '/hero-victoria-falls.webp',
    };
}

/**
 * Resolve any legacy root-relative asset path (e.g. `/Experiences/Guided Tour of the Falls_/5-4.jpg`)
 * cleanly inside WordPress so broken `/` paths never 404.
 */
function outbound_resolve_theme_asset_url(string $url, string $fallback_type = 'hero'): string {
    $trimmed = trim($url);
    if ($trimmed === '') {
        return outbound_get_media_fallback($fallback_type);
    }
    if (preg_match('#^https?://#i', $trimmed) || str_starts_with($trimmed, 'data:')) {
        return $trimmed;
    }
    $lower = strtolower($trimmed);
    if (str_contains($lower, 'logo')) {
        return outbound_get_media_fallback('logo');
    }
    if (str_contains($lower, '5-4.jpg') || str_contains($lower, 'hero')) {
        return outbound_get_media_fallback('hero');
    }
    if (str_contains($lower, 'safari') || str_contains($lower, 'chobe') || str_contains($lower, 'elephant')) {
        return outbound_get_media_fallback('safari');
    }
    if (str_contains($lower, 'family') || str_contains($lower, 'boma')) {
        return outbound_get_media_fallback('family');
    }
    if (str_contains($lower, 'honeymoon')) {
        return outbound_get_media_fallback('honeymoon');
    }
    return outbound_get_media_fallback($fallback_type);
}

/**
 * Return Logo URL (WordPress custom logo if uploaded, otherwise bundled WebP logo).
 */
function outbound_get_logo_url(): string {
    if (function_exists('get_theme_mod') && function_exists('wp_get_attachment_image_url')) {
        $logo_id = get_theme_mod('custom_logo');
        if ($logo_id) {
            $url = wp_get_attachment_image_url((int) $logo_id, 'full');
            if ($url) {
                return $url;
            }
        }
    }
    return outbound_get_media_fallback('logo');
}

/**
 * Get the featured image URL or meta image URL for any CPT/Post with guaranteed local fallback.
 */
function outbound_get_post_image_url(int $post_id, string $size = 'outbound-card', string $fallback_type = 'hero'): string {
    if (function_exists('has_post_thumbnail') && has_post_thumbnail($post_id)) {
        $thumb_url = get_the_post_thumbnail_url($post_id, $size);
        if ($thumb_url) {
            return $thumb_url;
        }
    }
    if (function_exists('get_post_meta')) {
        $meta_img = get_post_meta($post_id, '_outbound_image_url', true);
        if (is_string($meta_img) && $meta_img !== '') {
            return $meta_img;
        }
    }
    return outbound_get_media_fallback($fallback_type);
}

/**
 * Estimate reading time in minutes from content HTML or structured sections.
 */
function outbound_estimate_reading_time(string $content): int {
    $words = str_word_count(strip_tags($content));
    return max(2, (int) ceil($words / 210));
}

/**
 * Render inline Lucide-compatible SVG icons used across headers, cards, and buttons.
 */
function outbound_svg_icon(string $name, string $class = 'w-4 h-4'): string {
    $cls = htmlspecialchars($class, ENT_QUOTES, 'UTF-8');
    $icons = array(
        'sparkles' => '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
        'arrow-right' => '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
        'arrow-left' => '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
        'chevron-down' => '<path d="m6 9 6 6 6-6"/>',
        'calendar-check' => '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
        'map-pin' => '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
        'clock' => '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        'shield-check' => '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
        'check-circle' => '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
        'phone' => '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
        'mail' => '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
        'search' => '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        'sliders' => '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
        'home' => '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
        'menu' => '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
        'x' => '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        'star' => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
        'users' => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'whatsapp' => '<path fill="currentColor" stroke="none" d="M20.52 3.48A11.87 11.87 0 0 0 12.06 0C5.47 0 .1 5.37.1 11.96c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63a11.9 11.9 0 0 0 5.84 1.5h.01c6.59 0 11.95-5.37 11.96-11.96 0-3.19-1.24-6.19-3.51-8.43zm-8.46 18.37h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.69.97.99-3.6-.24-.37a9.9 9.9 0 0 1-1.52-5.29c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.46 9.9-9.96 9.9zm5.44-7.43c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.11 4.52.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/>',
    );

    if (!isset($icons[$name])) {
        return '';
    }
    if ($name === 'whatsapp') {
        return '<svg class="' . $cls . '" viewBox="0 0 24 24" aria-hidden="true">' . $icons[$name] . '</svg>';
    }
    return '<svg class="' . $cls . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $icons[$name] . '</svg>';
}

/**
 * Helper to return builder stay tiers stored in WP option or defaults matching published-content.json.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_get_builder_stay_tiers(): array {
    $defaults = array(
        array('id' => 'smart-value',    'name' => 'Smart Value Guest Houses & Town Stays', 'tagline' => 'Clean comfort near town & activities', 'startingPrice' => 145),
        array('id' => 'comfort-plus',   'name' => 'Comfort Plus Hotels & Lodges',         'tagline' => 'Signature Victoria Falls hospitality',  'startingPrice' => 235),
        array('id' => 'premium-escape', 'name' => 'Luxury River & Bush Sanctuaries',      'tagline' => 'Zambezi frontage, fine dining & suites','startingPrice' => 520),
        array('id' => 'family-villa',   'name' => 'Family Apartments & Private Villas',   'tagline' => 'Spacious self-catering & multi-room',   'startingPrice' => 195),
    );
    if (function_exists('get_option')) {
        $stored = get_option('outbound_builder_stay_tiers', null);
        if (is_array($stored) && !empty($stored)) {
            return $stored;
        }
    }
    return $defaults;
}

/**
 * Helper to return builder activities stored in WP option or queried from Experiences CPT.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_get_builder_activities(): array {
    if (function_exists('get_option')) {
        $stored = get_option('outbound_builder_activities', null);
        if (is_array($stored) && !empty($stored)) {
            return $stored;
        }
    }
    if (function_exists('get_posts')) {
        $posts = get_posts(array(
            'post_type'      => 'experience',
            'posts_per_page' => 12,
            'post_status'    => 'publish',
        ));
        if (!empty($posts)) {
            $out = array();
            foreach ($posts as $p) {
                $out[] = array(
                    'id'          => $p->post_name,
                    'title'       => $p->post_title,
                    'duration'    => (string) get_post_meta($p->ID, '_outbound_duration', true) ?: 'Half Day',
                    'priceAmount' => (float) (get_post_meta($p->ID, '_outbound_price_usd', true) ?: 85),
                    'image'       => outbound_get_post_image_url($p->ID, 'outbound-thumb'),
                );
            }
            return $out;
        }
    }
    return array(
        array('id' => 'act-guided-falls', 'title' => 'Guided Tour of the Victoria Falls', 'duration' => '2.5 Hours', 'priceAmount' => 45, 'image' => outbound_get_media_fallback('falls')),
        array('id' => 'act-sunset-cruise', 'title' => 'Zambezi Sunset Boat Cruise', 'duration' => '3 Hours', 'priceAmount' => 65, 'image' => outbound_get_media_fallback('hero')),
        array('id' => 'act-helicopter', 'title' => '15-Minute Flight of Angels Helicopter', 'duration' => '15 Mins', 'priceAmount' => 165, 'image' => outbound_get_media_fallback('falls')),
        array('id' => 'act-chobe', 'title' => 'Chobe Full Day Safari (Botswana)', 'duration' => 'Full Day', 'priceAmount' => 195, 'image' => outbound_get_media_fallback('safari')),
        array('id' => 'act-boma', 'title' => 'The Boma Dinner & Drum Show', 'duration' => 'Evening', 'priceAmount' => 65, 'image' => outbound_get_media_fallback('family')),
        array('id' => 'act-bungee', 'title' => 'Victoria Falls Bridge Bungee Jump', 'duration' => '2 Hours', 'priceAmount' => 168, 'image' => outbound_get_media_fallback('hero')),
    );
}

/**
 * Compact summaries of packages & stays passed into the Holiday Builder modal.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_get_builder_packages_summary(): array {
    if (!function_exists('get_posts')) {
        return array();
    }
    $posts = get_posts(array('post_type' => 'package', 'posts_per_page' => 20, 'post_status' => 'publish'));
    $list = array();
    foreach ($posts as $p) {
        $list[] = array(
            'id'       => $p->post_name,
            'title'    => $p->post_title,
            'duration' => (string) get_post_meta($p->ID, '_outbound_duration', true),
            'priceUSD' => (float) get_post_meta($p->ID, '_outbound_price_usd', true),
            'category' => (string) get_post_meta($p->ID, '_outbound_package_tier', true) ?: 'mid-range',
        );
    }
    return $list;
}

/**
 * Compact summaries of accommodations passed into the Holiday Builder modal.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_get_builder_accommodations_summary(): array {
    if (!function_exists('get_posts')) {
        return array();
    }
    $posts = get_posts(array('post_type' => 'accommodation', 'posts_per_page' => 30, 'post_status' => 'publish'));
    $list = array();
    foreach ($posts as $p) {
        $list[] = array(
            'id'           => $p->post_name,
            'name'         => $p->post_title,
            'priceFromUSD' => (float) get_post_meta($p->ID, '_outbound_price_usd', true),
            'categoryId'   => (string) get_post_meta($p->ID, '_outbound_category_id', true) ?: 'hotels',
        );
    }
    return $list;
}

/**
 * Determine whether the current request is an authenticated Admin Draft Preview request.
 */
function outbound_is_preview_request(): bool {
    if (!isset($_GET['outbound_preview']) || (string) $_GET['outbound_preview'] !== '1') {
        return false;
    }
    if (function_exists('current_user_can')) {
        return (bool) current_user_can('manage_options');
    }
    return false;
}

/**
 * Retrieve staged CMS draft bundle (or empty array if no unpublished draft exists).
 *
 * @return array<string, mixed>
 */
function outbound_get_cms_draft_state(): array {
    if (!function_exists('get_option')) {
        return array();
    }
    $draft = get_option('outbound_cms_draft_state', array());
    return is_array($draft) ? $draft : array();
}

/**
 * Whether any unpublished Outbound CMS draft edits exist.
 */
function outbound_has_cms_draft(): bool {
    $draft = outbound_get_cms_draft_state();
    return !empty($draft['updatedAt']) || !empty($draft['sections']);
}

/**
 * Return the published Outbound CMS configuration bundle across all managed wp_options.
 *
 * @return array<string, mixed>
 */
function outbound_get_published_cms_bundle(): array {
    $get = static function (string $key, $default = array()) {
        if (!function_exists('get_option')) {
            return $default;
        }
        $val = get_option($key, $default);
        return is_array($val) ? $val : $default;
    };

    $site_options = outbound_get_site_options();
    $editorial_strings = $get('outbound_editorial_overrides', array());
    $hero_legacy = $get('outbound_wp_hero_overrides', array());
    if (!empty($hero_legacy)) {
        $editorial_strings = array_merge($hero_legacy, $editorial_strings);
    }

    return array(
        'site_options'         => $site_options,
        'editorial_strings'    => $editorial_strings,
        'editorial_structures' => $get('outbound_editorial_struct_overrides', array()),
        'featured'             => $get('outbound_featured_overrides', array()),
        'route_seo'            => $get('outbound_route_seo_overrides', array()),
        'currency_rates'       => $get('outbound_currency_rates_override', array()),
        'reviews'              => $get('outbound_reviews_override', array()),
        'builder_stay_tiers'   => $get('outbound_builder_stay_tiers', array()),
        'builder_activities'   => $get('outbound_builder_activities', array()),
        'design_tokens'        => $get('outbound_design_tokens', array()),
    );
}

/**
 * Return effective CMS configuration bundle, overlaying staged draft edits when `$include_draft` is true.
 *
 * @return array<string, mixed>
 */
function outbound_get_effective_cms_bundle(bool $include_draft = false): array {
    $bundle = outbound_get_published_cms_bundle();

    if ($include_draft) {
        $draft = outbound_get_cms_draft_state();
        if (!empty($draft['site_options']) && is_array($draft['site_options'])) {
            $bundle['site_options'] = array_replace_recursive($bundle['site_options'], $draft['site_options']);
        }
        foreach (array('editorial_strings', 'editorial_structures', 'route_seo', 'currency_rates', 'design_tokens') as $map_key) {
            if (isset($draft[$map_key]) && is_array($draft[$map_key])) {
                $bundle[$map_key] = array_replace($bundle[$map_key], $draft[$map_key]);
            }
        }
        if (isset($draft['featured']) && is_array($draft['featured'])) {
            foreach (array('accommodationIds', 'experienceIds', 'packageIds') as $fk) {
                if (array_key_exists($fk, $draft['featured']) && is_array($draft['featured'][$fk])) {
                    $bundle['featured'][$fk] = array_values($draft['featured'][$fk]);
                }
            }
        }
        foreach (array('reviews', 'builder_stay_tiers', 'builder_activities') as $list_key) {
            if (array_key_exists($list_key, $draft) && is_array($draft[$list_key])) {
                $bundle[$list_key] = array_values($draft[$list_key]);
            }
        }
    }

    // Mirror homepage section visibility booleans and design tokens into strict editorial structures.
    $hp = (array) ($bundle['site_options']['homepageSections'] ?? array());
    $visibility = array();
    foreach (array(
        'showQuickPlanning',
        'showExperiences',
        'showPackages',
        'showWhereToStay',
        'showGuides',
        'showWhyOutbound',
        'showStories',
        'showClientGallery',
        'showNewsletter',
        'showFinalCta',
    ) as $sec_key) {
        $visibility[$sec_key] = array_key_exists($sec_key, $hp) ? (bool) $hp[$sec_key] : true;
    }
    $bundle['editorial_structures']['cms/homepage.sections'] = $visibility;

    if (!empty($bundle['design_tokens']) && is_array($bundle['design_tokens'])) {
        $bundle['editorial_structures']['cms/design.tokens'] = $bundle['design_tokens'];
    }

    return $bundle;
}

/**
 * Stage partial CMS changes into `outbound_cms_draft_state` without publishing to public visitors.
 *
 * @param array<string, mixed> $patch
 * @return array<string, mixed>
 */
function outbound_save_cms_draft_patch(array $patch, string $section_id = ''): array {
    $draft = outbound_get_cms_draft_state();
    if (!isset($draft['sections']) || !is_array($draft['sections'])) {
        $draft['sections'] = array();
    }
    if ($section_id !== '' && !in_array($section_id, $draft['sections'], true)) {
        $draft['sections'][] = $section_id;
    }

    if (isset($patch['site_options']) && is_array($patch['site_options'])) {
        $existing_site = isset($draft['site_options']) && is_array($draft['site_options']) ? $draft['site_options'] : array();
        $draft['site_options'] = array_replace_recursive($existing_site, $patch['site_options']);
    }
    foreach (array('editorial_strings', 'editorial_structures', 'route_seo', 'currency_rates', 'design_tokens') as $map_key) {
        if (isset($patch[$map_key]) && is_array($patch[$map_key])) {
            $existing_map = isset($draft[$map_key]) && is_array($draft[$map_key]) ? $draft[$map_key] : array();
            $draft[$map_key] = array_replace($existing_map, $patch[$map_key]);
        }
    }
    if (isset($patch['featured']) && is_array($patch['featured'])) {
        $existing_feat = isset($draft['featured']) && is_array($draft['featured']) ? $draft['featured'] : array();
        foreach (array('accommodationIds', 'experienceIds', 'packageIds') as $fk) {
            if (array_key_exists($fk, $patch['featured']) && is_array($patch['featured'][$fk])) {
                $existing_feat[$fk] = array_values($patch['featured'][$fk]);
            }
        }
        $draft['featured'] = $existing_feat;
    }
    foreach (array('reviews', 'builder_stay_tiers', 'builder_activities') as $list_key) {
        if (array_key_exists($list_key, $patch) && is_array($patch[$list_key])) {
            $draft[$list_key] = array_values($patch[$list_key]);
        }
    }

    $draft['updatedAt'] = gmdate('c');
    if (function_exists('wp_get_current_user')) {
        $u = wp_get_current_user();
        $draft['updatedBy'] = ($u && !empty($u->user_login)) ? (string) $u->user_login : 'admin';
    }

    if (function_exists('update_option')) {
        update_option('outbound_cms_draft_state', $draft, false);
    }
    return $draft;
}

/**
 * Promote staged draft state (plus optional new patch) into live published wp_options cleanly.
 *
 * @param array<string, mixed> $patch
 */
function outbound_publish_cms_changes(array $patch = array(), string $section_id = ''): array {
    if (!empty($patch)) {
        outbound_save_cms_draft_patch($patch, $section_id);
    }

    $effective = outbound_get_effective_cms_bundle(true);

    if (function_exists('update_option')) {
        update_option('outbound_site_cms_options', $effective['site_options'], false);
        update_option('outbound_editorial_overrides', $effective['editorial_strings'], false);
        update_option('outbound_editorial_struct_overrides', $effective['editorial_structures'], false);
        update_option('outbound_featured_overrides', $effective['featured'], false);
        update_option('outbound_route_seo_overrides', $effective['route_seo'], false);
        update_option('outbound_currency_rates_override', $effective['currency_rates'], false);
        update_option('outbound_reviews_override', $effective['reviews'], false);
        update_option('outbound_builder_stay_tiers', $effective['builder_stay_tiers'], false);
        update_option('outbound_builder_activities', $effective['builder_activities'], false);
        update_option('outbound_design_tokens', $effective['design_tokens'], false);
        if (function_exists('delete_option')) {
            delete_option('outbound_cms_draft_state');
            delete_option('outbound_wp_hero_overrides');
        }
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return $effective;
}

/**
 * Discard staged draft changes without modifying published live site options.
 */
function outbound_discard_cms_draft(): void {
    if (function_exists('delete_option')) {
        delete_option('outbound_cms_draft_state');
    }
}

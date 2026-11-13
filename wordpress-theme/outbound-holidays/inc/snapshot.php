<?php
/**
 * WordPress Live ContentSnapshot & Native Blog Post Provider.
 * Hydrates the approved React SPA (`outbound-app.js`) dynamically from WordPress CMS Options,
 * Custom Post Types (Accommodations, Experiences, Packages, Guides, Client Albums), and native WordPress Posts,
 * backed cleanly by `inc/default-snapshot.json` so zero Express or Neon API runtime is ever needed.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Load the bundled baseline snapshot shipped cleanly inside the theme (`inc/default-snapshot.json`).
 *
 * @return array<string, mixed>
 */
function outbound_get_baseline_snapshot(): array {
    static $cached = null;
    if (is_array($cached)) {
        return $cached;
    }

    $path = OUTBOUND_THEME_DIR . '/inc/default-snapshot.json';
    if (!file_exists($path)) {
        return array(
            'version'           => OUTBOUND_THEME_VERSION,
            'accommodations'    => array(),
            'experiences'       => array(),
            'packages'          => array(),
            'guides'            => array(),
            'albums'            => array(),
            'builderActivities' => array(),
            'stayTiers'         => array(),
            'site'              => array(
                'routeSeo'        => array(),
                'editorial'       => array('strings' => array(), 'structures' => array()),
                'contact'         => outbound_get_site_options()['contact'],
                'currencyRates'   => outbound_get_currency_rates(),
                'guideCategories' => array(),
                'featured'        => array('accommodationIds' => array(), 'experienceIds' => array(), 'packageIds' => array()),
                'legacy'          => array(),
            ),
        );
    }

    $decoded = json_decode((string) file_get_contents($path), true);
    $cached = is_array($decoded) ? $decoded : array();
    return $cached;
}

/**
 * Resolve any string meta/thumbnail URLs cleanly inside a snapshot array.
 */
function outbound_decode_json_meta(int $post_id, string $key, array $fallback = array()): array {
    if (!function_exists('get_post_meta')) {
        return $fallback;
    }
    $raw = get_post_meta($post_id, $key, true);
    if (!is_string($raw) || trim($raw) === '') {
        return $fallback;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $fallback;
}

/**
 * Index array of records by slug and id for fast lossless overlay merging.
 *
 * @param array<int, array<string, mixed>> $items
 * @return array<string, array<string, mixed>>
 */
function outbound_index_snapshot_records(array $items): array {
    $map = array();
    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }
        $slug = (string) ($item['slug'] ?? '');
        $id   = (string) ($item['id'] ?? '');
        if ($slug !== '') {
            $map[$slug] = $item;
        }
        if ($id !== '') {
            $map[$id] = $item;
        }
    }
    return $map;
}

/**
 * Resolve featured image or custom image URL for a WordPress CPT without returning missing root-relative paths.
 */
function outbound_resolve_wp_post_image(int $post_id, string $fallback_url, string $fallback_type = 'hero'): string {
    if (function_exists('get_post_meta')) {
        $hero_override = get_post_meta($post_id, '_outbound_hero_image_url', true);
        if (is_string($hero_override) && trim($hero_override) !== '') {
            return outbound_resolve_theme_asset_url($hero_override, $fallback_type);
        }
    }
    if (function_exists('has_post_thumbnail') && has_post_thumbnail($post_id)) {
        $thumb = get_the_post_thumbnail_url($post_id, 'outbound-hero') ?: get_the_post_thumbnail_url($post_id, 'full');
        if (is_string($thumb) && $thumb !== '') {
            return $thumb;
        }
    }
    if (function_exists('get_post_meta')) {
        $meta = get_post_meta($post_id, '_outbound_image_url', true);
        if (is_string($meta) && trim($meta) !== '') {
            return outbound_resolve_theme_asset_url($meta, $fallback_type);
        }
    }
    return outbound_resolve_theme_asset_url($fallback_url, $fallback_type);
}

/**
 * Constrain value to allowed strict enum values cleanly.
 *
 * @param array<int, string> $allowed
 */
function outbound_constrain_enum(string $value, array $allowed, string $fallback): string {
    return in_array($value, $allowed, true) ? $value : $fallback;
}

/**
 * Merge published (or draft when previewing) `accommodation` CPT posts with baseline defaults
 * so every strict DetailedAccommodationSchema field stays valid.
 *
 * @param array<int, array<string, mixed>> $baseline
 * @return array<int, array<string, mixed>>
 */
function outbound_merge_wp_accommodations(array $baseline, bool $include_drafts = false): array {
    if (!function_exists('get_posts')) {
        return $baseline;
    }
    $wp_posts = get_posts(array(
        'post_type'              => 'accommodation',
        'posts_per_page'         => -1,
        'post_status'            => $include_drafts ? array('publish', 'draft') : 'publish',
        'orderby'                => array('menu_order' => 'ASC', 'ID' => 'ASC'),
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => true,
    ));
    if (empty($wp_posts)) {
        return $baseline;
    }

    $indexed = outbound_index_snapshot_records($baseline);
    $result  = array();

    $allowed_cats   = array('Luxury Lodge', 'Boutique Hotel', 'Guest Lodge', 'Safari Lodge', 'Resort', 'Self-Catering', 'Hotel', 'Lodge', 'Guest House', 'Apartment');
    $allowed_badges = array('Luxury', 'Family Favourite', 'Romantic', 'Best Value', 'Walking Distance', 'Boutique');
    $allowed_ftags  = array('luxury-lodges', 'boutique-hotels', 'family-friendly', 'romantic-escapes', 'best-value', 'safari-lodges', 'self-catering', 'walking-distance');
    $cat_label_map  = array('hotels' => 'Boutique Hotel', 'lodges' => 'Luxury Lodge', 'guest-houses' => 'Guest Lodge', 'apartments' => 'Self-Catering');

    foreach ($wp_posts as $p) {
        $pid         = (int) $p->ID;
        $slug        = (string) $p->post_name;
        $stored_full = outbound_decode_json_meta($pid, '_outbound_full_json', array());
        $base        = $stored_full ?: ($indexed[$slug] ?? array());

        $cat_id = (string) get_post_meta($pid, '_outbound_category_id', true);
        if ($cat_id === '' && function_exists('wp_get_post_terms')) {
            $terms = wp_get_post_terms($pid, 'accommodation_category', array('fields' => 'slugs'));
            if (is_array($terms) && !empty($terms[0])) {
                $cat_id = (string) $terms[0];
            }
        }
        $cat_label_meta = (string) get_post_meta($pid, '_outbound_category_label', true);
        $raw_cat_label  = $cat_label_meta !== '' ? $cat_label_meta : ($base['category'] ?? ($cat_label_map[$cat_id] ?? 'Luxury Lodge'));
        $resolved_cat   = outbound_constrain_enum($raw_cat_label, $allowed_cats, 'Luxury Lodge');

        $badge_meta  = (string) get_post_meta($pid, '_outbound_badge', true);
        $raw_badge   = $badge_meta !== '' ? $badge_meta : (string) ($base['badge'] ?? '');
        $badge_valid = in_array($raw_badge, $allowed_badges, true) ? $raw_badge : '';

        $price_meta  = get_post_meta($pid, '_outbound_price_usd', true);
        $price_usd   = $price_meta !== '' ? (float) $price_meta : (float) ($base['priceFromUSD'] ?? 220);
        $max_guests  = max(1, (int) (get_post_meta($pid, '_outbound_max_guests', true) ?: ($base['maxGuests'] ?? 2)));
        $rating      = (float) (get_post_meta($pid, '_outbound_rating', true) ?: ($base['rating'] ?? 4.8));
        $review_cnt  = (int) (get_post_meta($pid, '_outbound_review_count', true) ?: ($base['reviewCount'] ?? 24));
        $location    = (string) (get_post_meta($pid, '_outbound_location', true) ?: ($base['location'] ?? 'Victoria Falls, Zimbabwe'));
        $dist_falls  = (string) (get_post_meta($pid, '_outbound_distance_falls', true) ?: ($base['distanceFromFalls'] ?? '10 min drive from the falls'));
        $dist_air    = (string) (get_post_meta($pid, '_outbound_airport_distance', true) ?: ($base['airportDistance'] ?? '25 min from VFA Airport'));
        $tagline     = (string) (get_post_meta($pid, '_outbound_tagline', true) ?: ($base['tagline'] ?? ''));

        $hero_image  = outbound_resolve_wp_post_image($pid, (string) ($base['heroImage'] ?? ''), 'hero');
        $gallery     = outbound_decode_json_meta($pid, '_outbound_gallery_json', (array) ($base['galleryImages'] ?? array($hero_image)));
        $gallery     = array_values(array_filter(array_map(static fn($u) => is_string($u) ? outbound_resolve_theme_asset_url($u, 'hero') : '', $gallery)));
        $amenities   = outbound_decode_json_meta($pid, '_outbound_amenities_json', (array) ($base['amenities'] ?? array()));
        $raw_ftags   = outbound_decode_json_meta($pid, '_outbound_filter_tags_json', (array) ($base['filterTags'] ?? array()));
        $filter_tags = array_values(array_intersect(array_map('strval', $raw_ftags), $allowed_ftags));

        $short_desc  = trim(wp_strip_all_tags((string) $p->post_excerpt)) ?: (string) ($base['shortDescription'] ?? '');
        $overview    = trim(wp_strip_all_tags((string) $p->post_content)) ?: (string) ($base['editorialOverview'] ?? $short_desc);
        $why_meta    = (string) get_post_meta($pid, '_outbound_why_recommend', true);
        if ($why_meta === '') {
            $bw = $base['whyWeRecommend'] ?? 'Selected personally by our Victoria Falls local team.';
            $why_meta = is_array($bw) ? implode(' ', array_map('strval', $bw)) : (string) $bw;
        }

        $ag_base = is_array($base['atAGlance'] ?? null) ? $base['atAGlance'] : array();
        $ag_meta = outbound_decode_json_meta($pid, '_outbound_at_a_glance_json', array());
        $ag_raw  = array_merge($ag_base, $ag_meta);
        $at_glance = array(
            'type'              => (string) ($ag_raw['type'] ?? $resolved_cat),
            'starRating'        => (string) ($ag_raw['starRating'] ?? '4-Star Boutique'),
            'bestFor'           => (string) ($ag_raw['bestFor'] ?? 'Couples & Families'),
            'distanceFromFalls' => (string) ($ag_raw['distanceFromFalls'] ?? $dist_falls),
            'pool'              => (string) ($ag_raw['pool'] ?? 'Outdoor swimming pool'),
            'restaurant'        => (string) ($ag_raw['restaurant'] ?? 'On-site dining'),
            'wifi'              => (string) ($ag_raw['wifi'] ?? 'Complimentary Wi-Fi'),
            'familyFriendly'    => (string) ($ag_raw['familyFriendly'] ?? 'Yes'),
            'transfers'         => (string) ($ag_raw['transfers'] ?? 'Private airport transfers arranged'),
            'roomTypesSummary'  => (string) ($ag_raw['roomTypesSummary'] ?? 'Suites & Garden Rooms'),
        );

        $raw_rooms = outbound_decode_json_meta($pid, '_outbound_room_types_json', (array) ($base['roomTypes'] ?? array()));
        $rooms_out = array();
        foreach ($raw_rooms as $rm) {
            if (!is_array($rm) || empty($rm['name'])) { continue; }
            $rooms_out[] = array(
                'name'        => (string) $rm['name'],
                'occupancy'   => (string) ($rm['occupancy'] ?? '2 Guests'),
                'description' => (string) ($rm['description'] ?? ''),
                'imageUrl'    => outbound_resolve_theme_asset_url((string) ($rm['imageUrl'] ?? $hero_image), 'hero'),
                'features'    => array_values(array_map('strval', (array) ($rm['features'] ?? array()))),
            );
        }

        $raw_facs = outbound_decode_json_meta($pid, '_outbound_facilities_json', (array) ($base['facilities'] ?? array()));
        $fac_out  = array();
        foreach ($raw_facs as $fc) {
            if (is_array($fc) && !empty($fc['name'])) {
                $fac_out[] = array('name' => (string) $fc['name'], 'category' => (string) ($fc['category'] ?? 'Property'));
            } elseif (is_string($fc) && $fc !== '') {
                $fac_out[] = array('name' => $fc, 'category' => 'Property');
            }
        }

        $li_base = is_array($base['locationInfo'] ?? null) ? $base['locationInfo'] : array();
        $li_meta = outbound_decode_json_meta($pid, '_outbound_location_info_json', array());
        $li_raw  = array_merge($li_base, $li_meta);
        $loc_info = array(
            'address'           => (string) ($li_raw['address'] ?? $location),
            'distanceToFalls'   => (string) ($li_raw['distanceToFalls'] ?? $dist_falls),
            'distanceToAirport' => (string) ($li_raw['distanceToAirport'] ?? $dist_air),
            'nearbyAttractions' => array_values(array_map('strval', (array) ($li_raw['nearbyAttractions'] ?? array('Victoria Falls Rainforest')))),
            'nearbyRestaurants' => array_values(array_map('strval', (array) ($li_raw['nearbyRestaurants'] ?? array('The Lookout Cafe')))),
            'departurePoints'   => (string) ($li_raw['departurePoints'] ?? 'Direct hotel lobby pick-up'),
        );

        $nearby_exp  = outbound_decode_json_meta($pid, '_outbound_nearby_experiences_json', (array) ($base['nearbyExperienceIds'] ?? array()));
        $related_ids = outbound_decode_json_meta($pid, '_outbound_related_ids_json', (array) ($base['relatedPropertyIds'] ?? array()));

        $record = array(
            'id'                  => (string) ($base['id'] ?? $slug),
            'slug'                => $slug,
            'name'                => (string) $p->post_title,
            'category'            => $resolved_cat,
            'rating'              => $rating,
            'reviewCount'         => $review_cnt,
            'location'            => $location,
            'distanceFromFalls'   => $dist_falls,
            'airportDistance'     => $dist_air,
            'priceFromUSD'        => $price_usd,
            'heroImage'           => $hero_image,
            'galleryImages'       => !empty($gallery) ? $gallery : array($hero_image),
            'tagline'             => $tagline !== '' ? $tagline : $short_desc,
            'shortDescription'    => $short_desc,
            'editorialOverview'   => $overview,
            'whyWeRecommend'      => $why_meta,
            'filterTags'          => $filter_tags,
            'atAGlance'           => $at_glance,
            'roomTypes'           => $rooms_out,
            'facilities'          => $fac_out,
            'locationInfo'        => $loc_info,
            'nearbyExperienceIds' => array_values(array_map('strval', $nearby_exp)),
            'relatedPropertyIds'  => array_values(array_map('strval', $related_ids)),
        );
        if ($badge_valid !== '') {
            $record['badge'] = $badge_valid;
        }
        $price_unit = (string) get_post_meta($pid, '_outbound_price_basis', true);
        if ($price_unit !== '') {
            $record['priceUnit'] = $price_unit;
        }
        if (!empty($amenities)) {
            $record['amenities'] = array_values(array_map('strval', $amenities));
        }
        $check_in  = (string) get_post_meta($pid, '_outbound_checkin_time', true);
        $check_out = (string) get_post_meta($pid, '_outbound_checkout_time', true);
        if ($check_in !== '') { $record['checkInTime'] = $check_in; }
        if ($check_out !== '') { $record['checkOutTime'] = $check_out; }
        if ($cat_id !== '' && in_array($cat_id, array('hotels', 'lodges', 'guest-houses', 'apartments'), true)) {
            $record['accommodationCategory'] = $cat_id;
        }

        $result[] = $record;
    }

    return $result;
}

/**
 * Merge published (or draft when previewing) `experience` CPT posts with baseline defaults.
 *
 * @param array<int, array<string, mixed>> $baseline
 * @return array<int, array<string, mixed>>
 */
function outbound_merge_wp_experiences(array $baseline, bool $include_drafts = false): array {
    if (!function_exists('get_posts')) {
        return $baseline;
    }
    $wp_posts = get_posts(array(
        'post_type'              => 'experience',
        'posts_per_page'         => -1,
        'post_status'            => $include_drafts ? array('publish', 'draft') : 'publish',
        'orderby'                => array('menu_order' => 'ASC', 'ID' => 'ASC'),
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => true,
    ));
    if (empty($wp_posts)) {
        return $baseline;
    }

    $indexed      = outbound_index_snapshot_records($baseline);
    $result       = array();
    $allowed_cats = array('featured', 'first-visit', 'wildlife', 'adventure', 'river', 'culture', 'day-trips');

    foreach ($wp_posts as $p) {
        $pid         = (int) $p->ID;
        $slug        = (string) $p->post_name;
        $stored_full = outbound_decode_json_meta($pid, '_outbound_full_json', array());
        $base        = $stored_full ?: ($indexed[$slug] ?? array());

        $cats = array();
        if (function_exists('wp_get_post_terms')) {
            $terms = wp_get_post_terms($pid, 'experience_category', array('fields' => 'slugs'));
            if (is_array($terms) && !empty($terms)) {
                $cats = array_values(array_intersect(array_map('strval', $terms), $allowed_cats));
            }
        }
        if (empty($cats)) {
            $cats = array_values(array_intersect(array_map('strval', (array) ($base['categories'] ?? array('first-visit'))), $allowed_cats));
            if (empty($cats)) { $cats = array('first-visit'); }
        }

        $price_meta   = get_post_meta($pid, '_outbound_price_usd', true);
        $price_amt    = $price_meta !== '' ? (float) $price_meta : (float) ($base['priceAmount'] ?? 65);
        $duration     = (string) (get_post_meta($pid, '_outbound_duration', true) ?: ($base['duration'] ?? 'Half Day'));
        $subtitle     = (string) (get_post_meta($pid, '_outbound_subtitle', true) ?: ($base['subtitle'] ?? ''));
        $badge        = (string) (get_post_meta($pid, '_outbound_badge', true) ?: ($base['badge'] ?? ''));
        $location     = (string) (get_post_meta($pid, '_outbound_location', true) ?: ($base['location'] ?? ''));
        $hero_image   = outbound_resolve_wp_post_image($pid, (string) ($base['featuredImage'] ?? ''), 'falls');
        $highlights   = outbound_decode_json_meta($pid, '_outbound_highlights_json', (array) ($base['highlights'] ?? array()));
        $included     = outbound_decode_json_meta($pid, '_outbound_inclusions_json', (array) ($base['whatsIncluded'] ?? array()));
        $excluded     = outbound_decode_json_meta($pid, '_outbound_exclusions_json', (array) ($base['whatsExcluded'] ?? array()));
        $good_to_know = outbound_decode_json_meta($pid, '_outbound_good_to_know_json', (array) ($base['goodToKnow'] ?? array()));
        $steps        = outbound_decode_json_meta($pid, '_outbound_steps_json', (array) ($base['steps'] ?? array()));
        $gallery      = outbound_decode_json_meta($pid, '_outbound_gallery_json', (array) ($base['galleryImages'] ?? array($hero_image)));
        $gallery      = array_values(array_filter(array_map(static fn($u) => is_string($u) ? outbound_resolve_theme_asset_url($u, 'falls') : '', $gallery)));
        $faqs_raw     = outbound_decode_json_meta($pid, '_outbound_faqs_json', (array) ($base['faqs'] ?? array()));
        $related_ids  = outbound_decode_json_meta($pid, '_outbound_related_ids_json', (array) ($base['relatedIds'] ?? array()));

        $faqs = array();
        foreach ($faqs_raw as $fr) {
            if (!is_array($fr)) { continue; }
            $q = (string) ($fr['q'] ?? ($fr['question'] ?? ''));
            $a = (string) ($fr['a'] ?? ($fr['answer'] ?? ''));
            if ($q !== '' && $a !== '') { $faqs[] = array('q' => $q, 'a' => $a); }
        }

        $short_desc = trim(wp_strip_all_tags((string) $p->post_excerpt)) ?: (string) ($base['shortDescription'] ?? '');
        $overview   = trim(wp_strip_all_tags((string) $p->post_content)) ?: (string) ($base['fullOverview'] ?? $short_desc);
        $why_rec    = (string) (get_post_meta($pid, '_outbound_why_recommend', true) ?: ($base['whyWeRecommend'] ?? 'Curated personally with licensed Victoria Falls guides.'));
        $expert_tip = (string) (get_post_meta($pid, '_outbound_expert_tip', true) ?: ($base['localExpertTip'] ?? ''));

        $rec = array(
            'id'               => (string) ($base['id'] ?? $slug),
            'slug'             => $slug,
            'title'            => (string) $p->post_title,
            'categories'       => $cats,
            'shortDescription' => $short_desc,
            'fullOverview'     => $overview,
            'whyWeRecommend'   => $why_rec,
            'duration'         => $duration,
            'fromPrice'        => '$' . number_format((int) round($price_amt)),
            'priceAmount'      => $price_amt,
            'featuredImage'    => $hero_image,
            'galleryImages'    => !empty($gallery) ? $gallery : array($hero_image),
            'highlights'       => !empty($highlights) ? array_values(array_map('strval', $highlights)) : array($short_desc),
            'whatsIncluded'    => !empty($included) ? array_values(array_map('strval', $included)) : array('Return Victoria Falls town transfers', 'Experienced local host'),
            'goodToKnow'       => !empty($good_to_know) ? array_values(array_map('strval', $good_to_know)) : array('Bring sun protection and comfortable footwear.'),
            'faqs'             => $faqs,
            'relatedIds'       => array_values(array_map('strval', $related_ids)),
        );
        if ($subtitle !== '') { $rec['subtitle'] = $subtitle; }
        if ($badge !== '') { $rec['badge'] = $badge; }
        if ($location !== '') { $rec['location'] = $location; }
        if (!empty($excluded)) { $rec['whatsExcluded'] = array_values(array_map('strval', $excluded)); }
        if (!empty($steps)) { $rec['steps'] = array_values($steps); }
        if ($expert_tip !== '') { $rec['localExpertTip'] = $expert_tip; }

        $result[] = $rec;
    }

    return $result;
}

/**
 * Merge published (or draft when previewing) `package` CPT posts with baseline defaults.
 *
 * @param array<int, array<string, mixed>> $baseline
 * @return array<int, array<string, mixed>>
 */
function outbound_merge_wp_packages(array $baseline, bool $include_drafts = false): array {
    if (!function_exists('get_posts')) {
        return $baseline;
    }
    $wp_posts = get_posts(array(
        'post_type'              => 'package',
        'posts_per_page'         => -1,
        'post_status'            => $include_drafts ? array('publish', 'draft') : 'publish',
        'orderby'                => array('menu_order' => 'ASC', 'ID' => 'ASC'),
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => false,
    ));
    if (empty($wp_posts)) {
        return $baseline;
    }

    $indexed         = outbound_index_snapshot_records($baseline);
    $result          = array();
    $allowed_badges  = array('Best Value', 'Luxury', 'Family Favourites', 'Adventure', 'Signature', 'Popular');
    $allowed_cat     = array('value', 'luxury', 'family', 'adventure', 'safari', 'first-visit', 'couples');
    $allowed_cats_mu = array('first-visit', 'couples', 'families', 'luxury', 'adventure', 'safari', 'value');

    foreach ($wp_posts as $p) {
        $pid         = (int) $p->ID;
        $slug        = (string) $p->post_name;
        $stored_full = outbound_decode_json_meta($pid, '_outbound_full_json', array());
        $base        = $stored_full ?: ($indexed[$slug] ?? array());

        $price_meta     = get_post_meta($pid, '_outbound_price_usd', true);
        $price_usd      = $price_meta !== '' ? (float) $price_meta : (float) ($base['priceUSD'] ?? 890);
        $duration       = (string) (get_post_meta($pid, '_outbound_duration', true) ?: ($base['duration'] ?? '4 Days / 3 Nights'));
        $raw_cat        = (string) (get_post_meta($pid, '_outbound_package_tier', true) ?: ($base['category'] ?? 'first-visit'));
        $cat            = outbound_constrain_enum($raw_cat === 'mid-range' ? 'first-visit' : $raw_cat, $allowed_cat, 'first-visit');
        $raw_badge      = (string) (get_post_meta($pid, '_outbound_badge', true) ?: ($base['badge'] ?? 'Signature'));
        $badge          = outbound_constrain_enum($raw_badge, $allowed_badges, 'Signature');
        $raw_cats_multi = outbound_decode_json_meta($pid, '_outbound_categories_json', (array) ($base['categories'] ?? array('first-visit')));
        $cats_multi     = array_values(array_intersect(array_map('strval', $raw_cats_multi), $allowed_cats_mu));
        if (empty($cats_multi)) { $cats_multi = array('first-visit'); }

        $traveller_type = (string) (get_post_meta($pid, '_outbound_traveller_type', true) ?: ($base['travellerType'] ?? 'Couples & Families'));
        $rating         = (float) (get_post_meta($pid, '_outbound_rating', true) ?: ($base['rating'] ?? 4.9));
        $review_cnt     = (int) (get_post_meta($pid, '_outbound_review_count', true) ?: ($base['reviewCount'] ?? 18));
        $hero_image     = outbound_resolve_wp_post_image($pid, (string) ($base['imageUrl'] ?? ''), 'safari');
        $gallery        = outbound_decode_json_meta($pid, '_outbound_gallery_json', (array) ($base['galleryImages'] ?? array($hero_image)));
        $gallery        = array_values(array_filter(array_map(static fn($u) => is_string($u) ? outbound_resolve_theme_asset_url($u, 'safari') : '', $gallery)));

        $short_desc = trim(wp_strip_all_tags((string) $p->post_excerpt)) ?: (string) ($base['tagline'] ?? '');
        $desc       = trim(wp_strip_all_tags((string) $p->post_content)) ?: (string) ($base['description'] ?? $short_desc);
        $story      = (string) (get_post_meta($pid, '_outbound_story_intro', true) ?: ($base['storyIntroduction'] ?? $desc));
        $why_meta   = (string) get_post_meta($pid, '_outbound_why_recommend', true);
        if ($why_meta === '') {
            $bw = $base['whyWeRecommend'] ?? 'Seamless logistics arranged directly in Victoria Falls.';
            $why_meta = is_array($bw) ? implode(' ', array_map('strval', $bw)) : (string) $bw;
        }
        $why_stay = (string) (get_post_meta($pid, '_outbound_why_chose_stay', true) ?: ($base['whyWeChoseStay'] ?? 'Handpicked properties offering reliable hospitality and prime access.'));

        $who_base = is_array($base['whoIsThisFor'] ?? null) ? $base['whoIsThisFor'] : array();
        $who_meta = outbound_decode_json_meta($pid, '_outbound_who_is_for_json', array());
        $who_raw  = array_merge($who_base, $who_meta);
        $who_out  = array(
            'perfectIf'        => array_values(array_map('strval', (array) ($who_raw['perfectIf'] ?? array('First-time Victoria Falls visitors')))),
            'considerOthersIf' => array_values(array_map('strval', (array) ($who_raw['considerOthersIf'] ?? array('Travellers seeking multi-week overland expeditions')))),
        );

        $hm_base = is_array($base['highlightsMeta'] ?? null) ? $base['highlightsMeta'] : array();
        $hm_meta = outbound_decode_json_meta($pid, '_outbound_highlights_meta_json', array());
        $hm_raw  = array_merge($hm_base, $hm_meta);
        $hl_meta = array(
            'accommodation' => (string) ($hm_raw['accommodation'] ?? '4-Star Boutique Lodge'),
            'transfers'     => (string) ($hm_raw['transfers'] ?? 'Private VFA Airport Transfers'),
            'meals'         => (string) ($hm_raw['meals'] ?? 'Daily Breakfast & Select Dinners'),
            'countries'     => (string) ($hm_raw['countries'] ?? 'Zimbabwe'),
            'bestFor'       => (string) ($hm_raw['bestFor'] ?? $traveller_type),
            'difficulty'    => (string) ($hm_raw['difficulty'] ?? 'Relaxed Pace'),
            'season'        => (string) ($hm_raw['season'] ?? 'Year-Round'),
        );

        $highlights = outbound_decode_json_meta($pid, '_outbound_highlights_json', (array) ($base['highlights'] ?? array()));
        $included   = outbound_decode_json_meta($pid, '_outbound_inclusions_json', (array) ($base['included'] ?? array()));
        $excluded   = outbound_decode_json_meta($pid, '_outbound_exclusions_json', (array) ($base['notIncluded'] ?? array()));
        $itinerary  = outbound_decode_json_meta($pid, '_outbound_itinerary_json', (array) ($base['itinerary'] ?? array()));
        $det_itin   = outbound_decode_json_meta($pid, '_outbound_detailed_itinerary_json', (array) ($base['detailedItinerary'] ?? array()));
        $hotels     = outbound_decode_json_meta($pid, '_outbound_recommended_hotels_json', (array) ($base['recommendedHotels'] ?? array()));
        $route_map  = outbound_decode_json_meta($pid, '_outbound_route_map_json', (array) ($base['routeMap'] ?? array()));
        $inc_exps   = outbound_decode_json_meta($pid, '_outbound_included_experiences_json', (array) ($base['includedExperienceIds'] ?? array()));
        $rel_pkgs   = outbound_decode_json_meta($pid, '_outbound_related_ids_json', (array) ($base['relatedPackageIds'] ?? array()));
        $faqs_raw   = outbound_decode_json_meta($pid, '_outbound_faqs_json', (array) ($base['faqs'] ?? array()));

        $pd_base = is_array($base['pricingDetails'] ?? null) ? $base['pricingDetails'] : array();
        $pd_meta = outbound_decode_json_meta($pid, '_outbound_pricing_details_json', array());
        $pd_raw  = array_merge($pd_base, $pd_meta);
        $pricing_det = array(
            'basis'            => (string) ($pd_raw['basis'] ?? 'Per person based on two adults sharing a twin/double room.'),
            'assumptions'      => array_values(array_map('strval', (array) ($pd_raw['assumptions'] ?? array('Two guests travelling together')))),
            'factorsAffecting' => array_values(array_map('strval', (array) ($pd_raw['factorsAffecting'] ?? array('Seasonal hotel rates', 'Room category upgrades')))),
        );

        $faqs = array();
        foreach ($faqs_raw as $fr) {
            if (!is_array($fr)) { continue; }
            $q = (string) ($fr['question'] ?? ($fr['q'] ?? ''));
            $a = (string) ($fr['answer'] ?? ($fr['a'] ?? ''));
            if ($q !== '' && $a !== '') { $faqs[] = array('question' => $q, 'answer' => $a); }
        }

        $rec = array(
            'id'                    => (string) ($base['id'] ?? $slug),
            'slug'                  => $slug,
            'title'                 => (string) $p->post_title,
            'badge'                 => $badge,
            'category'              => $cat,
            'categories'            => $cats_multi,
            'tagline'               => $short_desc,
            'description'           => $desc,
            'priceUSD'              => $price_usd,
            'duration'              => $duration,
            'travellerType'         => $traveller_type,
            'imageUrl'              => $hero_image,
            'galleryImages'         => !empty($gallery) ? $gallery : array($hero_image),
            'storyIntroduction'     => $story,
            'whyWeRecommend'        => $why_meta,
            'whoIsThisFor'          => $who_out,
            'highlightsMeta'        => $hl_meta,
            'highlights'            => !empty($highlights) ? array_values(array_map('strval', $highlights)) : array($short_desc),
            'included'              => !empty($included) ? array_values(array_map('strval', $included)) : array('Airport return transfers', 'Selected accommodation & breakfast'),
            'notIncluded'           => !empty($excluded) ? array_values(array_map('strval', $excluded)) : array('International flights', 'Visa fees'),
            'itinerary'             => $itinerary,
            'recommendedHotels'     => $hotels,
            'whyWeChoseStay'        => $why_stay,
            'includedExperienceIds' => array_values(array_map('strval', $inc_exps)),
            'routeMap'              => $route_map,
            'pricingDetails'        => $pricing_det,
            'faqs'                  => $faqs,
            'relatedPackageIds'     => array_values(array_map('strval', $rel_pkgs)),
            'rating'                => $rating,
            'reviewCount'           => $review_cnt,
        );
        if (!empty($det_itin)) {
            $rec['detailedItinerary'] = array_values($det_itin);
        }

        $result[] = $rec;
    }

    return $result;
}

/**
 * Merge published (or draft when previewing) `guide_article` CPT posts with baseline defaults.
 *
 * @param array<int, array<string, mixed>> $baseline
 * @return array<int, array<string, mixed>>
 */
function outbound_merge_wp_guides(array $baseline, bool $include_drafts = false): array {
    if (!function_exists('get_posts')) {
        return $baseline;
    }
    $wp_posts = get_posts(array(
        'post_type'              => 'guide_article',
        'posts_per_page'         => -1,
        'post_status'            => $include_drafts ? array('publish', 'draft') : 'publish',
        'orderby'                => array('menu_order' => 'ASC', 'ID' => 'ASC'),
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => false,
    ));
    if (empty($wp_posts)) {
        return $baseline;
    }

    $indexed = outbound_index_snapshot_records($baseline);
    $result  = array();

    foreach ($wp_posts as $p) {
        $pid         = (int) $p->ID;
        $slug        = (string) $p->post_name;
        $stored_full = outbound_decode_json_meta($pid, '_outbound_full_json', array());
        $base        = $stored_full ?: ($indexed[$slug] ?? array());

        $subtitle    = (string) (get_post_meta($pid, '_outbound_subtitle', true) ?: (trim(wp_strip_all_tags((string) $p->post_excerpt)) ?: ($base['subtitle'] ?? '')));
        $cat_label   = (string) (get_post_meta($pid, '_outbound_category_label', true) ?: ($base['category'] ?? 'Victoria Falls Travel Guides'));
        $read_time   = (string) (get_post_meta($pid, '_outbound_reading_time', true) ?: ($base['readingTime'] ?? '6 min read'));
        $pub_date    = (string) (get_post_meta($pid, '_outbound_published_date', true) ?: ($base['publishedDate'] ?? gmdate('Y-m-d')));
        $upd_date    = (string) (get_post_meta($pid, '_outbound_updated_date', true) ?: ($base['lastUpdatedDate'] ?? gmdate('Y-m-d')));
        $location    = (string) (get_post_meta($pid, '_outbound_location', true) ?: ($base['location'] ?? 'Victoria Falls, Zimbabwe'));
        $hero_image  = outbound_resolve_wp_post_image($pid, (string) ($base['heroImageUrl'] ?? ''), 'hero');
        $hero_alt    = (string) (get_post_meta($pid, '_outbound_hero_alt', true) ?: ($base['heroImageAlt'] ?? (string) $p->post_title));
        $hero_credit = (string) (get_post_meta($pid, '_outbound_hero_credit', true) ?: ($base['heroImageCredit'] ?? ''));

        $author_raw  = outbound_decode_json_meta($pid, '_outbound_author_json', (array) ($base['author'] ?? array()));
        $author      = array(
            'name'      => (string) ($author_raw['name'] ?? 'Outbound Holidays Local Desk'),
            'role'      => (string) ($author_raw['role'] ?? 'Victoria Falls Travel Specialist'),
            'avatarUrl' => outbound_resolve_theme_asset_url((string) ($author_raw['avatarUrl'] ?? '/logo.png'), 'hero'),
        );
        if (!empty($author_raw['bio'])) {
            $author['bio'] = (string) $author_raw['bio'];
        }

        $quick_facts = outbound_decode_json_meta($pid, '_outbound_quick_facts_json', (array) ($base['quickFacts'] ?? array()));
        $sections    = outbound_decode_json_meta($pid, '_outbound_sections_json', (array) ($base['sections'] ?? array()));
        $trav_types  = outbound_decode_json_meta($pid, '_outbound_traveller_types_json', (array) ($base['travellerTypes'] ?? array()));
        $faqs        = outbound_decode_json_meta($pid, '_outbound_faqs_json', (array) ($base['faqs'] ?? array()));

        $rel_slugs = outbound_decode_json_meta($pid, '_outbound_related_guides_json', array());
        $rel_cards = array();
        if (!empty($rel_slugs)) {
            foreach ($rel_slugs as $item) {
                if (is_array($item) && !empty($item['slug'])) {
                    $rel_cards[] = $item;
                } elseif (is_string($item) && isset($indexed[$item])) {
                    $target = $indexed[$item];
                    $rel_cards[] = array(
                        'slug'     => (string) ($target['slug'] ?? $item),
                        'title'    => (string) ($target['title'] ?? $item),
                        'category' => (string) ($target['category'] ?? 'Travel Guide'),
                        'readTime' => (string) ($target['readingTime'] ?? '5 min read'),
                        'summary'  => (string) ($target['subtitle'] ?? ''),
                        'imageUrl' => (string) ($target['heroImageUrl'] ?? $hero_image),
                    );
                }
            }
        } else {
            $rel_cards = (array) ($base['relatedGuides'] ?? array());
        }

        $seo_title     = (string) (get_post_meta($pid, '_outbound_seo_title', true) ?: ($base['seo']['metaTitle'] ?? ($p->post_title . ' | Outbound Holidays')));
        $seo_desc      = (string) (get_post_meta($pid, '_outbound_seo_description', true) ?: ($base['seo']['metaDescription'] ?? $subtitle));
        $seo_canonical = (string) (get_post_meta($pid, '_outbound_seo_canonical', true) ?: ($base['seo']['canonicalUrl'] ?? ('https://www.outboundholidays.co.zw/victoria-falls-guide/' . $slug)));
        $seo_keywords  = outbound_decode_json_meta($pid, '_outbound_seo_keywords_json', (array) ($base['seo']['keywords'] ?? array('Victoria Falls')));

        $rec = array(
            'id'              => (string) ($base['id'] ?? $slug),
            'slug'            => $slug,
            'category'        => $cat_label,
            'title'           => (string) $p->post_title,
            'subtitle'        => $subtitle,
            'heroImageUrl'    => $hero_image,
            'heroImageAlt'    => $hero_alt,
            'author'          => $author,
            'publishedDate'   => $pub_date,
            'lastUpdatedDate' => $upd_date,
            'readingTime'     => $read_time,
            'location'        => $location,
            'seo'             => array(
                'metaTitle'       => $seo_title,
                'metaDescription' => $seo_desc,
                'canonicalUrl'    => $seo_canonical,
                'ogImage'         => $hero_image,
                'keywords'        => array_values(array_map('strval', $seo_keywords)),
            ),
            'quickFacts'      => array_values($quick_facts),
            'sections'        => array_values($sections),
            'relatedGuides'   => array_values($rel_cards),
        );
        if ($hero_credit !== '') { $rec['heroImageCredit'] = $hero_credit; }
        if (!empty($trav_types)) { $rec['travellerTypes'] = array_values($trav_types); }
        if (!empty($faqs)) { $rec['faqs'] = array_values($faqs); }

        $result[] = $rec;
    }

    return $result;
}

/**
 * Merge published (or draft when previewing) `client_album` CPT posts with baseline defaults.
 *
 * @param array<int, array<string, mixed>> $baseline
 * @return array<int, array<string, mixed>>
 */
function outbound_merge_wp_albums(array $baseline, bool $include_drafts = false): array {
    if (!function_exists('get_posts')) {
        return $baseline;
    }
    $wp_posts = get_posts(array(
        'post_type'              => 'client_album',
        'posts_per_page'         => -1,
        'post_status'            => $include_drafts ? array('publish', 'draft') : 'publish',
        'orderby'                => array('menu_order' => 'ASC', 'ID' => 'ASC'),
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => false,
    ));
    if (empty($wp_posts)) {
        return $baseline;
    }

    $indexed = outbound_index_snapshot_records($baseline);
    $result  = array();

    foreach ($wp_posts as $p) {
        $pid         = (int) $p->ID;
        $slug        = (string) $p->post_name;
        $stored_full = outbound_decode_json_meta($pid, '_outbound_full_json', array());
        $base        = $stored_full ?: ($indexed[$slug] ?? array());
        $raw_photos  = outbound_decode_json_meta($pid, '_outbound_gallery_json', (array) ($base['images'] ?? array()));
        $photos_out  = array();
        foreach ($raw_photos as $pidx => $ph) {
            if (is_string($ph) && $ph !== '') {
                $photos_out[] = array(
                    'id'           => 'img-' . ($pidx + 1),
                    'url'          => outbound_resolve_theme_asset_url($ph, 'hero'),
                    'alt'          => (string) $p->post_title,
                    'caption'      => null,
                    'displayOrder' => count($photos_out) + 1,
                    'role'         => $pidx === 0 ? 'hero' : 'gallery',
                );
            } elseif (is_array($ph) && !empty($ph['url'])) {
                $photos_out[] = array(
                    'id'           => (string) ($ph['id'] ?? ('img-' . ($pidx + 1))),
                    'url'          => outbound_resolve_theme_asset_url((string) $ph['url'], 'hero'),
                    'alt'          => (string) ($ph['alt'] ?? $p->post_title),
                    'caption'      => isset($ph['caption']) && $ph['caption'] !== '' ? (string) $ph['caption'] : null,
                    'displayOrder' => (int) ($ph['displayOrder'] ?? (count($photos_out) + 1)),
                    'role'         => (string) ($ph['role'] ?? 'gallery'),
                );
            }
        }
        $feat_meta = get_post_meta($pid, '_outbound_featured', true);
        $featured  = $feat_meta !== '' ? ($feat_meta === '1') : true;

        $result[] = array(
            'id'       => (string) ($base['id'] ?? $slug),
            'slug'     => $slug,
            'title'    => (string) $p->post_title,
            'featured' => $featured,
            'images'   => $photos_out,
        );
    }

    return $result;
}

/**
 * Invalidate cached ContentSnapshot & blog post payloads cleanly on content or CMS changes.
 */
function outbound_invalidate_snapshot_cache(): void {
    unset($GLOBALS['__outbound_snapshot_req_cache']);
    if (function_exists('delete_transient')) {
        delete_transient('outbound_live_snapshot_v1');
        delete_transient('outbound_wp_blog_posts_v1_30');
    }
}
if (function_exists('add_action')) {
    add_action('save_post', static function (int $post_id): void {
        if (function_exists('wp_is_post_revision') && wp_is_post_revision($post_id)) {
            return;
        }
        outbound_invalidate_snapshot_cache();
    });
    add_action('delete_post', 'outbound_invalidate_snapshot_cache');
    add_action('edited_term', 'outbound_invalidate_snapshot_cache');
    add_action('created_term', 'outbound_invalidate_snapshot_cache');
    add_action('delete_term', 'outbound_invalidate_snapshot_cache');
    foreach (array(
        'outbound_site_cms_options',
        'outbound_wp_hero_overrides',
        'outbound_editorial_overrides',
        'outbound_editorial_struct_overrides',
        'outbound_featured_overrides',
        'outbound_route_seo_overrides',
        'outbound_currency_rates_override',
        'outbound_reviews_override',
        'outbound_design_tokens',
        'outbound_builder_stay_tiers',
        'outbound_builder_activities',
    ) as $opt_key) {
        add_action('update_option_' . $opt_key, 'outbound_invalidate_snapshot_cache');
    }
}

/**
 * Assemble live ContentSnapshot dynamically from WordPress CMS Options & CPTs on top of baseline schema.
 * Draft changes saved inside Outbound CMS only appear when `outbound_is_preview_request()` is true
 * (or `$force_preview = true` for explicit admin verification) and are never stored in public transients.
 *
 * @return array<string, mixed>
 */
function outbound_build_live_snapshot(bool $bypass_cache = false, bool $force_preview = false): array {
    $is_preview = $force_preview || outbound_is_preview_request();

    if (!$is_preview && !$bypass_cache && !empty($GLOBALS['__outbound_snapshot_req_cache']) && is_array($GLOBALS['__outbound_snapshot_req_cache'])) {
        return $GLOBALS['__outbound_snapshot_req_cache'];
    }

    if (!$is_preview && !$bypass_cache && function_exists('get_transient') && function_exists('set_transient')) {
        $transient_cached = get_transient('outbound_live_snapshot_v1');
        if (is_array($transient_cached) && !empty($transient_cached['accommodations'])) {
            $GLOBALS['__outbound_snapshot_req_cache'] = $transient_cached;
            return $transient_cached;
        }
    }

    $snapshot = outbound_get_baseline_snapshot();
    $bundle   = outbound_get_effective_cms_bundle($is_preview);
    $cms      = (array) ($bundle['site_options'] ?? outbound_get_site_options());

    // Sync CMS Site contact & rates cleanly.
    if (isset($snapshot['site']) && is_array($snapshot['site'])) {
        $snapshot['site']['contact'] = array(
            'whatsappNumber' => (string) ($cms['contact']['whatsappNumber'] ?? '263714701721'),
            'displayNumber'  => (string) ($cms['contact']['displayNumber'] ?? '+263 714 701 721'),
            'email'          => (string) ($cms['contact']['email'] ?? 'travel@outboundholidays.co.zw'),
            'address'        => (string) ($cms['contact']['address'] ?? 'Suite 4, Mosi-oa-Tunya Commercial Centre, Victoria Falls, Zimbabwe'),
            'hours'          => (string) ($cms['contact']['hours'] ?? 'Mon - Sun: 7:30 AM - 7:00 PM (CAT)'),
        );

        // Sync editable WP CMS strings cleanly while preserving baseline keys.
        $defaults = outbound_get_default_site_options();
        if (!isset($snapshot['site']['editorial']['strings'])) {
            $snapshot['site']['editorial']['strings'] = array();
        }
        $strings = &$snapshot['site']['editorial']['strings'];

        if (!isset($snapshot['site']['editorial']['structures']) || !is_array($snapshot['site']['editorial']['structures'])) {
            $snapshot['site']['editorial']['structures'] = array();
        }
        $structures = &$snapshot['site']['editorial']['structures'];

        // Respect WordPress Customizer custom_logo if uploaded by the admin (CMS logo override below wins if explicitly set).
        if (function_exists('get_theme_mod') && get_theme_mod('custom_logo')) {
            $wp_logo = outbound_get_logo_url();
            if ($wp_logo !== '') {
                $strings['common/Header.outboundLogo'] = $wp_logo;
                $strings['common/Footer.outboundLogo'] = $wp_logo;
            }
        }
        $strings['common/Footer.text4'] = (string) ($cms['contact']['address'] ?? ($strings['common/Footer.text4'] ?? ''));

        if (($cms['hero']['primaryCtaText'] ?? '') !== '' && $cms['hero']['primaryCtaText'] !== $defaults['hero']['primaryCtaText']) {
            $strings['common/Header.text13'] = $cms['hero']['primaryCtaText'];
            $strings['travel/FinalCtaBanner.text4'] = $cms['hero']['primaryCtaText'];
        }
        if (($cms['legal']['copyright'] ?? '') !== '' && $cms['legal']['copyright'] !== $defaults['legal']['copyright']) {
            $strings['common/Footer.text17'] = $cms['legal']['copyright'];
        }
        if (($cms['brand']['tagline'] ?? '') !== '' && $cms['brand']['tagline'] !== $defaults['brand']['tagline']) {
            $strings['common/Header.text2'] = $cms['brand']['tagline'];
        }

        // Sync Homepage Section Title & Subtitle edits from Outbound CMS
        $sec = (array) ($cms['homepageSections'] ?? array());
        $def_sec = (array) ($defaults['homepageSections'] ?? array());
        $section_map = array(
            'experiencesTitle' => 'travel/FeaturedExperiences.text2',
            'experiencesSub'   => 'travel/FeaturedExperiences.text3',
            'packagesTitle'    => 'travel/FeaturedPackages.text2',
            'packagesSub'      => 'travel/FeaturedPackages.text3',
            'staysTitle'       => 'travel/WhereToStaySection.text2',
            'staysSub'         => 'travel/WhereToStaySection.text3',
            'guidesTitle'      => 'travel/VicFallsGuide.text10',
            'whyTitle'         => 'travel/WhyChooseOutbound.text14',
            'storiesTitle'     => 'travel/TravellerStories.text5',
            'finalCtaTitle'    => 'travel/FinalCtaBanner.text2',
            'finalCtaSub'      => 'travel/FinalCtaBanner.text3',
        );
        foreach ($section_map as $cms_key => $ed_key) {
            if (!empty($sec[$cms_key]) && $sec[$cms_key] !== ($def_sec[$cms_key] ?? '')) {
                $strings[$ed_key] = (string) $sec[$cms_key];
            }
        }

        // Apply unified Outbound CMS editorial string overrides (draft + live or live only).
        foreach ((array) ($bundle['editorial_strings'] ?? array()) as $ek => $val) {
            if (is_string($ek) && is_string($val) && trim($val) !== '') {
                $strings[$ek] = $val;
            }
        }

        // Apply unified Outbound CMS editorial structures (homepage section visibility, design tokens, repeaters).
        foreach ((array) ($bundle['editorial_structures'] ?? array()) as $sk => $sval) {
            if (!is_string($sk) || $sk === '') {
                continue;
            }
            if ($sk === 'travel/WhyChooseOutbound.section1' && is_array($sval) && !empty($sval)) {
                $hydrated_cards = array();
                $allowed_icons = array('ShieldCheck', 'MapPin', 'Sparkles', 'Headset');
                foreach ($sval as $card) {
                    if (!is_array($card)) {
                        continue;
                    }
                    $icon_name = (string) ($card['iconName'] ?? ($card['icon']['$icon'] ?? 'ShieldCheck'));
                    if (!in_array($icon_name, $allowed_icons, true)) {
                        $icon_name = 'ShieldCheck';
                    }
                    $hydrated_cards[] = array(
                        'icon'        => array('$icon' => $icon_name),
                        'title'       => (string) ($card['title'] ?? ''),
                        'description' => (string) ($card['description'] ?? ''),
                        'label'       => (string) ($card['label'] ?? ''),
                    );
                }
                if (!empty($hydrated_cards)) {
                    $structures[$sk] = $hydrated_cards;
                }
            } else {
                $structures[$sk] = $sval;
            }
        }

        // Apply Featured Homepage curations if overridden in Outbound CMS.
        $feat = (array) ($bundle['featured'] ?? array());
        foreach (array('accommodationIds', 'experienceIds', 'packageIds') as $fk) {
            if (!empty($feat[$fk]) && is_array($feat[$fk])) {
                $snapshot['site']['featured'][$fk] = array_values(array_map('strval', $feat[$fk]));
            }
        }

        // Apply per-route SEO title & meta description overrides cleanly.
        $seo_over = (array) ($bundle['route_seo'] ?? array());
        if (!empty($seo_over)) {
            if (!isset($snapshot['site']['routeSeo']) || !is_array($snapshot['site']['routeSeo'])) {
                $snapshot['site']['routeSeo'] = array();
            }
            foreach ($seo_over as $rpath => $meta) {
                if (!is_string($rpath) || !is_array($meta)) {
                    continue;
                }
                $curr = (array) ($snapshot['site']['routeSeo'][$rpath] ?? array('title' => '', 'description' => ''));
                if (!empty($meta['title'])) {
                    $curr['title'] = (string) $meta['title'];
                }
                if (!empty($meta['description'])) {
                    $curr['description'] = (string) $meta['description'];
                }
                $snapshot['site']['routeSeo'][$rpath] = $curr;
            }
        }

        // Apply Currency Rates overrides if configured.
        $rates = (array) ($bundle['currency_rates'] ?? array());
        if (!empty($rates)) {
            foreach ($rates as $code => $cfg_rate) {
                if (!is_string($code) || !is_array($cfg_rate)) {
                    continue;
                }
                $num_rate = isset($cfg_rate['rate']) ? (float) $cfg_rate['rate'] : 0.0;
                $sym = (string) ($cfg_rate['symbol'] ?? $code);
                if ($num_rate > 0) {
                    $snapshot['site']['currencyRates'][$code] = array(
                        'symbol' => $sym,
                        'rate'   => $num_rate,
                    );
                }
            }
        }

        // Apply Testimonials / Reviews overrides if configured.
        $reviews = (array) ($bundle['reviews'] ?? array());
        if (!empty($reviews)) {
            $snapshot['site']['legacy']['TRAVEL_REVIEWS'] = array_values($reviews);
        }
    }

    // Merge WordPress CPTs cleanly onto the snapshot arrays (single batched query per post type).
    $snapshot['accommodations'] = outbound_merge_wp_accommodations((array) ($snapshot['accommodations'] ?? array()), $is_preview);
    $snapshot['experiences']    = outbound_merge_wp_experiences((array) ($snapshot['experiences'] ?? array()), $is_preview);
    $snapshot['packages']       = outbound_merge_wp_packages((array) ($snapshot['packages'] ?? array()), $is_preview);
    $snapshot['guides']         = outbound_merge_wp_guides((array) ($snapshot['guides'] ?? array()), $is_preview);
    $snapshot['albums']         = outbound_merge_wp_albums((array) ($snapshot['albums'] ?? array()), $is_preview);

    // Apply Holiday Builder tiers & activities from effective CMS bundle cleanly matching strict StayTierSchema & ActivityItemSchema.
    if (!empty($bundle['builder_stay_tiers']) && is_array($bundle['builder_stay_tiers'])) {
        $base_tiers = outbound_index_snapshot_records((array) ($snapshot['stayTiers'] ?? array()));
        $clean_tiers = array();
        foreach ($bundle['builder_stay_tiers'] as $tier) {
            if (!is_array($tier) || empty($tier['name'])) {
                continue;
            }
            $tid  = (string) ($tier['id'] ?? sanitize_title((string) $tier['name']));
            $base = (array) ($base_tiers[$tid] ?? array());
            $price = isset($tier['pricePerNightUSD']) ? (float) $tier['pricePerNightUSD']
                : (isset($tier['startingPrice']) ? (float) $tier['startingPrice'] : (float) ($base['pricePerNightUSD'] ?? 220));
            $clean_tiers[] = array(
                'id'               => $tid,
                'name'             => (string) $tier['name'],
                'tagline'          => (string) ($tier['tagline'] ?? ($base['tagline'] ?? 'Victoria Falls stay')),
                'pricePerNightUSD' => max(0, $price),
                'imageUrl'         => (string) (!empty($tier['imageUrl']) ? $tier['imageUrl'] : ($base['imageUrl'] ?? outbound_get_media_fallback('hero'))),
                'desc'             => (string) (!empty($tier['desc']) ? $tier['desc'] : ($base['desc'] ?? 'Tailored accommodation option in Victoria Falls.')),
                'highlights'       => array_values(!empty($tier['highlights']) && is_array($tier['highlights'])
                    ? $tier['highlights']
                    : (array) ($base['highlights'] ?? array('Breakfast included', 'Local specialist support'))),
            );
        }
        if (!empty($clean_tiers)) {
            $snapshot['stayTiers'] = $clean_tiers;
        }
    }
    if (!empty($bundle['builder_activities']) && is_array($bundle['builder_activities'])) {
        $base_acts = outbound_index_snapshot_records((array) ($snapshot['builderActivities'] ?? array()));
        $clean_acts = array();
        foreach ($bundle['builder_activities'] as $act) {
            if (!is_array($act) || empty($act['title'])) {
                continue;
            }
            $aid  = (string) ($act['id'] ?? sanitize_title((string) $act['title']));
            $base = (array) ($base_acts[$aid] ?? array());
            $price = isset($act['priceUSD']) ? (float) $act['priceUSD']
                : (isset($act['priceAmount']) ? (float) $act['priceAmount'] : (float) ($base['priceUSD'] ?? 65));
            $clean_acts[] = array_replace($base, array(
                'id'           => $aid,
                'title'        => (string) $act['title'],
                'duration'     => (string) ($act['duration'] ?? ($base['duration'] ?? 'Half Day')),
                'priceUSD'     => max(0, $price),
                'imageUrl'     => (string) (!empty($act['imageUrl']) ? $act['imageUrl']
                    : (!empty($act['image']) ? $act['image'] : ($base['imageUrl'] ?? outbound_get_media_fallback('falls')))),
                'badge'        => (string) ($act['badge'] ?? ($base['badge'] ?? 'Recommended')),
                'shortDesc'    => (string) ($act['shortDesc'] ?? ($base['shortDesc'] ?? 'Curated Victoria Falls experience.')),
                'whyRecommend' => (string) ($act['whyRecommend'] ?? ($base['whyRecommend'] ?? 'Trusted local operator.')),
                'idealFor'     => array_values(!empty($act['idealFor']) && is_array($act['idealFor'])
                    ? $act['idealFor']
                    : (array) ($base['idealFor'] ?? array('first-time'))),
            ));
        }
        if (!empty($clean_acts)) {
            $snapshot['builderActivities'] = $clean_acts;
        }
    }

    // Normalize relative asset paths across the snapshot when running inside WordPress.
    if (defined('OUTBOUND_THEME_URI')) {
        array_walk_recursive($snapshot, static function (&$val): void {
            if (is_string($val) && str_starts_with($val, '/')) {
                if (preg_match('#^/(Experiences|heroImages|convertedImages|logo)/#i', $val)) {
                    $val = outbound_resolve_theme_asset_url($val, 'hero');
                }
            }
        });
    }

    if (!$is_preview && !$bypass_cache) {
        if (function_exists('set_transient')) {
            // Cache for 1 hour; invalidated immediately via outbound_invalidate_snapshot_cache on any CMS/CPT save.
            set_transient('outbound_live_snapshot_v1', $snapshot, 3600);
        }
        $GLOBALS['__outbound_snapshot_req_cache'] = $snapshot;
    }

    return $snapshot;
}

/**
 * Format published native WordPress `post` items into the `WordPressRestPost[]` shape consumed by `src/data/blogData.ts`.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_get_wp_blog_posts_payload(int $limit = 30): array {
    if (!function_exists('get_posts')) {
        return array();
    }

    $cache_key = 'outbound_wp_blog_posts_v1_' . $limit;
    if (function_exists('get_transient')) {
        $cached_posts = get_transient($cache_key);
        if (is_array($cached_posts)) {
            return $cached_posts;
        }
    }

    $posts = get_posts(array(
        'post_type'              => 'post',
        'posts_per_page'         => $limit,
        'post_status'            => 'publish',
        'orderby'                => 'date',
        'order'                  => 'DESC',
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => true,
    ));

    if (empty($posts)) {
        return array();
    }

    $out = array();
    foreach ($posts as $post) {
        $terms = array();
        if (function_exists('wp_get_post_categories')) {
            $cats = wp_get_post_categories((int) $post->ID, array('fields' => 'all'));
            foreach ((array) $cats as $c) {
                $terms[] = array(
                    'id'          => (int) $c->term_id,
                    'slug'        => (string) $c->slug,
                    'name'        => (string) $c->name,
                    'description' => (string) $c->description,
                    'taxonomy'    => 'category',
                );
            }
        }
        if (function_exists('wp_get_post_tags')) {
            $tags = wp_get_post_tags((int) $post->ID, array('fields' => 'all'));
            foreach ((array) $tags as $t) {
                $terms[] = array(
                    'id'       => (int) $t->term_id,
                    'slug'     => (string) $t->slug,
                    'name'     => (string) $t->name,
                    'taxonomy' => 'post_tag',
                );
            }
        }

        $feat_img = outbound_get_post_image_url((int) $post->ID, 'outbound-hero', 'hero');
        $raw_author_json = get_post_meta((int) $post->ID, '_outbound_author_json', true);
        $saved_author    = !empty($raw_author_json) ? json_decode((string) $raw_author_json, true) : null;
        $author_name     = !empty($saved_author['name']) ? (string) $saved_author['name'] : (function_exists('get_the_author_meta') ? (string) get_the_author_meta('display_name', (int) $post->post_author) : 'Fungai Mtetwa');
        $author_role     = !empty($saved_author['role']) ? (string) $saved_author['role'] : '';
        $author_desc     = !empty($saved_author['bio']) ? (string) $saved_author['bio'] : (function_exists('get_the_author_meta') ? (string) get_the_author_meta('description', (int) $post->post_author) : '');
        $author_avatar   = !empty($saved_author['avatarUrl']) ? (string) $saved_author['avatarUrl'] : '';
        $excerpt         = has_excerpt($post) ? get_the_excerpt($post) : wp_trim_words(wp_strip_all_tags((string) $post->post_content), 28, '...');
        $rendered        = function_exists('apply_filters') ? (string) apply_filters('the_content', (string) $post->post_content) : (string) $post->post_content;
        $subtitle        = (string) get_post_meta((int) $post->ID, '_outbound_subtitle', true);
        $reading_time    = (string) get_post_meta((int) $post->ID, '_outbound_reading_time', true);
        $location        = (string) get_post_meta((int) $post->ID, '_outbound_location', true);
        $raw_sections    = get_post_meta((int) $post->ID, '_outbound_sections_json', true);
        $sections        = !empty($raw_sections) ? json_decode((string) $raw_sections, true) : null;

        $author_entry = array(
            'id'          => (int) $post->post_author,
            'name'        => $author_name ?: 'Outbound Holidays Team',
            'role'        => $author_role,
            'description' => $author_desc,
        );
        if ($author_avatar !== '') {
            $author_entry['avatar_urls'] = array('96' => $author_avatar, '48' => $author_avatar);
        }

        $out[] = array(
            'id'           => (int) $post->ID,
            'slug'         => (string) $post->post_name,
            'status'       => (string) $post->post_status,
            'date'         => (string) $post->post_date,
            'date_gmt'     => (string) $post->post_date_gmt,
            'modified'     => (string) $post->post_modified,
            'modified_gmt' => (string) $post->post_modified_gmt,
            'title'        => array('rendered' => (string) $post->post_title),
            'excerpt'      => array('rendered' => $excerpt),
            'content'      => array('rendered' => $rendered),
            'acf'          => array(
                'subtitle'     => $subtitle,
                'reading_time' => $reading_time,
                'location'     => $location,
            ),
            'sections'     => is_array($sections) ? $sections : null,
            '_embedded'    => array(
                'wp:featuredmedia' => array(
                    array(
                        'source_url' => $feat_img,
                        'alt_text'   => (string) $post->post_title,
                    ),
                ),
                'wp:term'          => array($terms),
                'author'           => array($author_entry),
            ),
        );
    }

    if (function_exists('set_transient')) {
        set_transient($cache_key, $out, 300);
    }

    return $out;
}

/**
 * Expose `GET /wp-json/outbound/v1/snapshot`, `/content`, `/posts`, and `/health` cleanly.
 */
if (function_exists('add_action')) {
    add_action('rest_api_init', static function (): void {
        $snapshot_handler = static function () {
            try {
                $snapshot = outbound_build_live_snapshot();
                $response = new WP_REST_Response($snapshot, 200);
                if (outbound_is_preview_request() && method_exists($response, 'header')) {
                    $response->header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                } else {
                    $response->header('Cache-Control', 'public, max-age=180, stale-while-revalidate=300');
                    $response->header('ETag', '"' . md5(OUTBOUND_THEME_VERSION . '_' . (string) ($snapshot['version'] ?? '')) . '"');
                }
                return $response;
            } catch (Throwable $e) {
                error_log('[Outbound Snapshot Error] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                $baseline = outbound_get_baseline_snapshot();
                return new WP_REST_Response($baseline, 200);
            }
        };

        register_rest_route('outbound/v1', '/snapshot', array(
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'callback'            => $snapshot_handler,
        ));

        // Alias /content to /snapshot for complete compatibility with React frontend API client.
        register_rest_route('outbound/v1', '/content', array(
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'callback'            => $snapshot_handler,
        ));

        register_rest_route('outbound/v1', '/posts', array(
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'callback'            => static function () {
                try {
                    return new WP_REST_Response(outbound_get_wp_blog_posts_payload(), 200);
                } catch (Throwable $e) {
                    error_log('[Outbound Posts Error] ' . $e->getMessage());
                    return new WP_REST_Response(array(), 200);
                }
            },
        ));

        // Lightweight diagnostic health endpoint to distinguish application/DB health from gateway failures.
        register_rest_route('outbound/v1', '/health', array(
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'callback'            => static function () {
                global $wpdb;
                $db_ok = false;
                try {
                    $test = $wpdb->get_var('SELECT 1');
                    $db_ok = ($test === '1' || $test === 1);
                } catch (Throwable $e) {
                    $db_ok = false;
                }

                $table_health = function_exists('outbound_get_database_table_health')
                    ? outbound_get_database_table_health()
                    : array();

                $snapshot_cached = function_exists('get_transient') && is_array(get_transient('outbound_live_snapshot_v1'));

                $status_code = $db_ok ? 200 : 503;
                return new WP_REST_Response(array(
                    'status'        => $db_ok ? 'healthy' : 'degraded',
                    'timestamp'     => gmdate('c'),
                    'php_version'   => PHP_VERSION,
                    'theme_version' => defined('OUTBOUND_THEME_VERSION') ? OUTBOUND_THEME_VERSION : 'unknown',
                    'database'      => array(
                        'connected' => $db_ok,
                        'tables'    => $table_health,
                    ),
                    'cache'         => array(
                        'snapshot_cached' => $snapshot_cached,
                    ),
                ), $status_code);
            },
        ));
    });
}

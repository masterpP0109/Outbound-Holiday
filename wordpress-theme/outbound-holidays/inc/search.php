<?php
/**
 * Unified Public Website Search Engine & REST Endpoint (`/wp-json/outbound/v1/search`).
 * Indexes all publicly published WordPress CMS content (properties, individual room/unit types,
 * experiences, holiday packages, blog articles, planning guides, promotions, property offers, and pages).
 * Strictly enforces public-only visibility and never exposes admin/supplier/unpublished records.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Normalize text for token & partial-word matching (hyphen/punctuation resilient).
 */
function outbound_search_normalize_text(string $text): string {
    $plain = function_exists('wp_strip_all_tags') ? wp_strip_all_tags($text) : strip_tags($text);
    $lower = strtolower($plain);
    $clean = preg_replace('/[-–—_\/]+/', ' ', $lower);
    $clean = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', (string) $clean);
    return trim((string) preg_replace('/\s+/', ' ', (string) $clean));
}

/**
 * Flush cached public search index transient alongside snapshot invalidation.
 */
function outbound_invalidate_search_index_cache(): void {
    if (function_exists('delete_transient')) {
        delete_transient('outbound_public_search_index_v1');
    }
    if (function_exists('wp_cache_delete')) {
        wp_cache_delete('outbound_public_search_index_v1', 'transient');
    }
    unset($GLOBALS['__outbound_search_index_req_cache']);
}
if (function_exists('add_action')) {
    add_action('outbound_after_snapshot_invalidated', 'outbound_invalidate_search_index_cache');
}

/**
 * Build the normalized public search index across all published CMS entities.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_build_public_search_index(bool $force_refresh = false): array {
    if (!$force_refresh && isset($GLOBALS['__outbound_search_index_req_cache']) && is_array($GLOBALS['__outbound_search_index_req_cache'])) {
        return $GLOBALS['__outbound_search_index_req_cache'];
    }

    $cache_key = 'outbound_public_search_index_v1';
    if (!$force_refresh && function_exists('get_transient')) {
        $cached = get_transient($cache_key);
        if (is_array($cached)) {
            $GLOBALS['__outbound_search_index_req_cache'] = $cached;
            return $cached;
        }
    }

    // Strictly load PUBLIC snapshot (include_drafts = false).
    $snapshot = function_exists('outbound_build_live_snapshot')
        ? outbound_build_live_snapshot(false, $force_refresh)
        : array();

    $items = array();
    $seen_ids = array();

    $push_item = static function (array $entry) use (&$items, &$seen_ids): void {
        $id = (string) ($entry['id'] ?? '');
        if ($id === '' || isset($seen_ids[$id])) {
            return;
        }
        $seen_ids[$id] = true;
        $title = (string) ($entry['title'] ?? '');
        if (trim($title) === '') {
            return;
        }
        $entry['_normTitle']    = outbound_search_normalize_text($title . ' ' . (string) ($entry['unitName'] ?? '') . ' ' . (string) ($entry['propertyName'] ?? ''));
        $entry['_normKeywords'] = outbound_search_normalize_text(implode(' ', array(
            (string) ($entry['category'] ?? ''),
            (string) ($entry['typeLabel'] ?? ''),
            (string) ($entry['location'] ?? ''),
            (string) ($entry['wing'] ?? ''),
            implode(' ', (array) ($entry['keywords'] ?? array())),
        )));
        $entry['_normBody']     = outbound_search_normalize_text(implode(' ', array(
            (string) ($entry['description'] ?? ''),
            (string) ($entry['extraText'] ?? ''),
        )));
        unset($entry['extraText'], $entry['keywords']);
        $items[] = $entry;
    };

    // 1. Accommodation Properties + Published Individual Unit Types + Published Property Offers
    foreach ((array) ($snapshot['accommodations'] ?? array()) as $acc) {
        if (!is_array($acc)) {
            continue;
        }
        $pub_status = strtolower((string) ($acc['publicationStatus'] ?? 'published'));
        if ($pub_status === 'draft' || $pub_status === 'archived') {
            continue;
        }

        $slug      = sanitize_title((string) ($acc['slug'] ?? ($acc['id'] ?? '')));
        $acc_name  = (string) ($acc['name'] ?? $slug);
        $acc_cat   = (string) ($acc['category'] ?? 'Accommodation');
        $acc_loc   = (string) ($acc['location'] ?? 'Victoria Falls');
        $acc_hero  = (string) ($acc['heroImage'] ?? '');
        $acc_url   = '/accommodation/' . $slug;
        $acc_price = isset($acc['priceFromUSD']) && (float) $acc['priceFromUSD'] > 0
            ? 'From US$' . number_format((float) $acc['priceFromUSD'])
            : 'Price on enquiry';

        $prop_facilities = array();
        foreach ((array) ($acc['facilities'] ?? array()) as $fac) {
            if (is_array($fac) && !empty($fac['name'])) {
                $prop_facilities[] = (string) $fac['name'];
            } elseif (is_string($fac) && $fac !== '') {
                $prop_facilities[] = $fac;
            }
        }
        $prop_amenities = array_map('strval', (array) ($acc['amenities'] ?? array()));
        $amenity_labels_map = function_exists('outbound_get_amenity_definitions') ? outbound_get_amenity_definitions() : array();
        $resolved_amenity_labels = array();
        foreach ($prop_amenities as $ak) {
            $resolved_amenity_labels[] = isset($amenity_labels_map[$ak]['label']) ? (string) $amenity_labels_map[$ak]['label'] : $ak;
        }
        $prop_tags = array_map('strval', (array) ($acc['filterTags'] ?? array()));
        $tag_words = array_map(static fn($t) => str_replace('-', ' ', $t), $prop_tags);

        $room_names = array();
        foreach ((array) ($acc['roomTypes'] ?? array()) as $ridx => $rm) {
            if (!is_array($rm) || empty($rm['name'])) {
                continue;
            }
            $r_stat = strtolower((string) ($rm['status'] ?? 'published'));
            if ($r_stat === 'draft' || $r_stat === 'archived') {
                continue;
            }
            $room_id   = (string) ($rm['id'] ?? ('unit_' . sanitize_title((string) $rm['name']) . '_' . ($ridx + 1)));
            $room_name = (string) $rm['name'];
            $room_names[] = $room_name;

            $room_img = (string) ($rm['imageUrl'] ?? '');
            if ($room_img === '' && !empty($rm['gallery'][0]['url'])) {
                $room_img = (string) $rm['gallery'][0]['url'];
            }
            if ($room_img === '') {
                $room_img = $acc_hero;
            }

            $r_price_start = $rm['pricing']['startingFromPriceUSD'] ?? ($rm['pricing']['baseNightlyRateUSD'] ?? null);
            $r_price_lbl   = is_numeric($r_price_start) && (float) $r_price_start > 0
                ? 'From US$' . number_format((float) $r_price_start) . ' / night'
                : 'Price on enquiry';

            $r_kw = array_merge(
                array_map('strval', (array) ($rm['features'] ?? array())),
                array_map('strval', (array) ($rm['amenities'] ?? array())),
                array_map('strval', (array) ($rm['customAmenities'] ?? array())),
                array_map('strval', (array) ($rm['inclusions'] ?? array())),
                array_map('strval', (array) ($rm['accessibilityFeatures'] ?? array())),
                $tag_words,
                array((string) ($rm['unitCategory'] ?? ''), (string) ($rm['occupancy'] ?? ''), (string) ($rm['wing'] ?? ''), 'accommodation', 'room', 'stay')
            );

            $push_item(array(
                'id'           => 'unit:' . $slug . ':' . $room_id,
                'title'        => $room_name . ' — ' . $acc_name,
                'type'         => 'accommodation',
                'typeLabel'    => (string) ($rm['unitCategory'] ?? 'Room & Unit'),
                'subtype'      => 'unit',
                'propertyName' => $acc_name,
                'unitName'     => $room_name,
                'unitId'       => $room_id,
                'wing'         => (string) ($rm['wing'] ?? ''),
                'category'     => $acc_cat,
                'location'     => $acc_loc,
                'description'  => (string) ($rm['shortDescription'] ?? ($rm['description'] ?? '')),
                'image'        => $room_img,
                'url'          => $acc_url . '?unit=' . rawurlencode($room_id) . '#accommodation-units',
                'priceLabel'   => $r_price_lbl,
                'highlights'   => array_slice(array_values(array_filter(array_map('strval', (array) ($rm['features'] ?? array())))), 0, 3),
                'keywords'     => $r_kw,
                'extraText'    => (string) ($rm['description'] ?? '') . ' ' . (string) ($acc['shortDescription'] ?? ''),
            ));
        }

        // Property record itself
        $push_item(array(
            'id'           => 'acc:' . $slug,
            'title'        => $acc_name,
            'type'         => 'accommodation',
            'typeLabel'    => 'Where to Stay · ' . $acc_cat,
            'subtype'      => 'property',
            'propertyName' => $acc_name,
            'category'     => $acc_cat,
            'location'     => $acc_loc,
            'description'  => (string) ($acc['shortDescription'] ?? ($acc['tagline'] ?? '')),
            'image'        => $acc_hero,
            'url'          => $acc_url,
            'priceLabel'   => $acc_price,
            'highlights'   => array_slice(array_values(array_filter(array_merge($prop_facilities, $resolved_amenity_labels))), 0, 3),
            'keywords'     => array_merge(
                $prop_facilities,
                $resolved_amenity_labels,
                $tag_words,
                $room_names,
                array('accommodation', 'where to stay', 'stay', (string) ($acc['accommodationCategory'] ?? ''), (string) ($acc['distanceFromFalls'] ?? ''), (string) ($acc['badge'] ?? ''))
            ),
            'extraText'    => (string) ($acc['editorialOverview'] ?? '') . ' ' . (string) ($acc['whyWeRecommend'] ?? '') . ' ' . (string) ($acc['atAGlance']['bestFor'] ?? ''),
        ));

        // Property-level Special Offers (published only, excluding draft/archived)
        foreach ((array) ($acc['offers'] ?? array()) as $oidx => $off) {
            if (!is_array($off) || empty($off['title'])) {
                continue;
            }
            $o_stat = strtolower((string) ($off['status'] ?? 'published'));
            if ($o_stat === 'draft' || $o_stat === 'archived') {
                continue;
            }
            $oid = (string) ($off['id'] ?? ('offer_' . ($oidx + 1)));
            $o_img = !empty($off['galleryImages'][0]) ? (string) $off['galleryImages'][0] : $acc_hero;
            $push_item(array(
                'id'          => 'prop-offer:' . $slug . ':' . $oid,
                'title'       => (string) $off['title'] . ' — ' . $acc_name,
                'type'        => 'offers',
                'typeLabel'   => 'Property Offer',
                'category'    => $acc_name,
                'location'    => $acc_loc,
                'description' => (string) ($off['description'] ?? ('Special offer available at ' . $acc_name)),
                'image'       => $o_img,
                'url'         => $acc_url . '?offer=' . rawurlencode($oid),
                'highlights'  => array_slice(array_values(array_map('strval', (array) ($off['includedServices'] ?? array()))), 0, 3),
                'keywords'    => array_merge(
                    array('offer', 'special', 'package', 'deal', $acc_name),
                    array_map('strval', (array) ($off['includedServices'] ?? array()))
                ),
                'extraText'   => (string) ($off['conditions'] ?? '') . ' ' . (string) ($off['guestRequirements'] ?? ''),
            ));
        }
    }

    // 2. Things to Do / Experiences
    foreach ((array) ($snapshot['experiences'] ?? array()) as $exp) {
        if (!is_array($exp) || empty($exp['title'])) {
            continue;
        }
        $eid  = (string) ($exp['id'] ?? '');
        $slug = (string) ($exp['slug'] ?? $eid);
        $path = $eid === 'boma-dinner-show' ? '/things-to-do/boma-dinner' : '/things-to-do/' . $slug;
        $cats = array_map(static fn($c) => str_replace('-', ' ', (string) $c), (array) ($exp['categories'] ?? array()));

        $push_item(array(
            'id'          => 'exp:' . ($slug ?: $eid),
            'title'       => (string) $exp['title'],
            'type'        => 'experiences',
            'typeLabel'   => 'Things to Do',
            'category'    => ucwords((string) ($cats[0] ?? 'Activity')),
            'location'    => (string) ($exp['location'] ?? 'Victoria Falls'),
            'description' => (string) ($exp['shortDescription'] ?? ''),
            'image'       => (string) ($exp['featuredImage'] ?? ''),
            'url'         => $path,
            'priceLabel'  => !empty($exp['fromPrice']) ? ('From ' . (string) $exp['fromPrice']) : '',
            'highlights'  => array_slice(array_values(array_map('strval', (array) ($exp['highlights'] ?? array()))), 0, 3),
            'keywords'    => array_merge(
                $cats,
                array_map('strval', (array) ($exp['highlights'] ?? array())),
                array_map('strval', (array) ($exp['whatsIncluded'] ?? array())),
                array('things to do', 'activity', 'activities', 'experience', 'tour', (string) ($exp['duration'] ?? ''), (string) ($exp['subtitle'] ?? ''), (string) ($exp['badge'] ?? ''))
            ),
            'extraText'   => (string) ($exp['fullOverview'] ?? '') . ' ' . (string) ($exp['whyWeRecommend'] ?? '') . ' ' . (string) ($exp['localExpertTip'] ?? ''),
        ));
    }

    // 3. Holiday Packages
    foreach ((array) ($snapshot['packages'] ?? array()) as $pkg) {
        if (!is_array($pkg) || empty($pkg['title'])) {
            continue;
        }
        $slug = (string) ($pkg['slug'] ?? ($pkg['id'] ?? ''));
        $route_locs = array();
        foreach ((array) ($pkg['routeMap'] ?? array()) as $rmap) {
            if (is_array($rmap)) {
                $route_locs[] = (string) ($rmap['location'] ?? '') . ' ' . (string) ($rmap['title'] ?? '');
            }
        }
        $pkg_cats = array_map(static fn($c) => str_replace('-', ' ', (string) $c), (array) ($pkg['categories'] ?? array()));

        $push_item(array(
            'id'          => 'pkg:' . $slug,
            'title'       => (string) $pkg['title'],
            'type'        => 'packages',
            'typeLabel'   => 'Holiday Package',
            'category'    => (string) ($pkg['duration'] ?? 'Holiday Package'),
            'location'    => implode(', ', array_unique(array_filter(array_map('trim', $route_locs)))) ?: 'Victoria Falls',
            'description' => (string) ($pkg['tagline'] ?? ($pkg['description'] ?? '')),
            'image'       => (string) ($pkg['imageUrl'] ?? ''),
            'url'         => '/packages/' . $slug,
            'priceLabel'  => isset($pkg['priceUSD']) && (float) $pkg['priceUSD'] > 0 ? 'From US$' . number_format((float) $pkg['priceUSD']) . ' pp' : 'Price on enquiry',
            'highlights'  => array_slice(array_values(array_map('strval', (array) ($pkg['highlights'] ?? array()))), 0, 3),
            'keywords'    => array_merge(
                $pkg_cats,
                $route_locs,
                array_map('strval', (array) ($pkg['highlights'] ?? array())),
                array_map('strval', (array) ($pkg['included'] ?? array())),
                array('package', 'holiday', 'itinerary', (string) ($pkg['travellerType'] ?? ''), (string) ($pkg['badge'] ?? ''))
            ),
            'extraText'   => (string) ($pkg['description'] ?? '') . ' ' . (string) ($pkg['whyWeRecommend'] ?? ''),
        ));
    }

    // 4. Native WordPress Blog Posts & Victoria Falls Planning Guides
    $blog_posts = function_exists('outbound_get_wp_blog_posts_payload') ? outbound_get_wp_blog_posts_payload(50) : array();
    $indexed_blog_slugs = array();
    foreach ($blog_posts as $bp) {
        if (!is_array($bp) || ($bp['status'] ?? '') !== 'publish') {
            continue;
        }
        $slug  = (string) ($bp['slug'] ?? '');
        $title = html_entity_decode(wp_strip_all_tags((string) ($bp['title']['rendered'] ?? '')), ENT_QUOTES, 'UTF-8');
        if ($slug === '' || $title === '') {
            continue;
        }
        $indexed_blog_slugs[$slug] = true;
        $term_names = array();
        foreach ((array) ($bp['_embedded']['wp:term'][0] ?? array()) as $trm) {
            if (!empty($trm['name'])) {
                $term_names[] = (string) $trm['name'];
            }
        }
        $feat_img = (string) ($bp['_embedded']['wp:featuredmedia'][0]['source_url'] ?? '');
        $excerpt  = html_entity_decode(wp_strip_all_tags((string) ($bp['excerpt']['rendered'] ?? '')), ENT_QUOTES, 'UTF-8');
        $body     = html_entity_decode(wp_strip_all_tags((string) ($bp['content']['rendered'] ?? '')), ENT_QUOTES, 'UTF-8');

        $push_item(array(
            'id'          => 'blog:' . $slug,
            'title'       => $title,
            'type'        => 'blogs',
            'typeLabel'   => 'Blog Article',
            'category'    => (string) ($term_names[0] ?? 'Travel Blog'),
            'location'    => (string) ($bp['acf']['location'] ?? 'Victoria Falls'),
            'description' => $excerpt,
            'image'       => $feat_img,
            'url'         => '/blog/' . $slug,
            'keywords'    => array_merge($term_names, array('blog', 'article', 'guide', (string) ($bp['acf']['subtitle'] ?? ''))),
            'extraText'   => $body,
        ));
    }

    foreach ((array) ($snapshot['guides'] ?? array()) as $guide) {
        if (!is_array($guide) || empty($guide['title'])) {
            continue;
        }
        $slug = (string) ($guide['slug'] ?? ($guide['id'] ?? ''));
        if ($slug === '' || isset($indexed_blog_slugs[$slug])) {
            continue;
        }
        $url = $slug === 'first-time-visitor-guide' ? '/victoria-falls-guide' : '/victoria-falls-guide/' . $slug;
        $fact_texts = array();
        foreach ((array) ($guide['quickFacts'] ?? array()) as $qf) {
            if (is_array($qf)) {
                $fact_texts[] = (string) ($qf['label'] ?? '') . ' ' . (string) ($qf['value'] ?? '');
            }
        }
        $sec_headings = array();
        foreach ((array) ($guide['sections'] ?? array()) as $sec) {
            if (is_array($sec) && !empty($sec['heading'])) {
                $sec_headings[] = (string) $sec['heading'];
            }
        }
        $push_item(array(
            'id'          => 'guide:' . $slug,
            'title'       => (string) $guide['title'],
            'type'        => 'blogs',
            'typeLabel'   => 'Planning Guide',
            'category'    => (string) ($guide['category'] ?? 'Planning Guide'),
            'location'    => (string) ($guide['location'] ?? 'Victoria Falls'),
            'description' => (string) ($guide['subtitle'] ?? ''),
            'image'       => (string) ($guide['heroImageUrl'] ?? ''),
            'url'         => $url,
            'keywords'    => array_merge($fact_texts, $sec_headings, (array) ($guide['seo']['keywords'] ?? array()), array('guide', 'blog', 'planning')),
            'extraText'   => (string) ($guide['seo']['metaDescription'] ?? ''),
        ));
    }

    // 5. Marketing Promotions & Special Offers (Strictly Active & Public)
    if (function_exists('outbound_get_active_promotions')) {
        foreach (outbound_get_active_promotions($force_refresh) as $promo) {
            if (!is_array($promo) || empty($promo['headline'])) {
                continue;
            }
            $pslug = (string) ($promo['slug'] ?? ($promo['id'] ?? ''));
            $price_data = (array) ($promo['pricing'] ?? array());
            $promo_price_val = $promo['promotionalPriceUSD'] ?? ($price_data['promoPrice'] ?? null);
            $p_label = is_numeric($promo_price_val) && (float) $promo_price_val > 0
                ? 'Offer US$' . number_format((float) $promo_price_val)
                : '';

            $push_item(array(
                'id'          => 'promo:' . ($pslug ?: (string) $promo['id']),
                'title'       => (string) ($promo['headline'] ?: $promo['name']),
                'type'        => 'offers',
                'typeLabel'   => 'Special Offer',
                'category'    => ucwords(str_replace('-', ' ', (string) ($promo['category'] ?? 'Promotion'))),
                'location'    => (string) ($promo['destinationOrActivity'] ?? 'Victoria Falls'),
                'description' => (string) ($promo['shortDescription'] ?? ''),
                'image'       => (string) ($promo['imageUrl'] ?? ''),
                'url'         => (string) ($promo['offerPageUrl'] ?? ('/offers/' . $pslug)),
                'priceLabel'  => $p_label,
                'highlights'  => array_slice(array_values(array_map('strval', (array) ($promo['inclusions'] ?? array()))), 0, 3),
                'keywords'    => array_merge(
                    array('promotion', 'offer', 'special', 'discount', (string) ($promo['name'] ?? ''), (string) ($promo['subtitle'] ?? ''), (string) ($promo['badgeText'] ?? ''), (string) ($promo['campaignCode'] ?? '')),
                    array_map('strval', (array) ($promo['inclusions'] ?? array()))
                ),
                'extraText'   => trim((string) ($promo['fullContent'] ?? '') . ' ' . (string) ($promo['termsAndConditions'] ?? '')),
            ));
        }
    }

    // 6. Core Public Website Pages + Published Custom WordPress Pages
    $hero_fallback = function_exists('outbound_get_media_fallback') ? outbound_get_media_fallback('hero') : '';
    $core_pages = array(
        array('id' => 'page:home', 'title' => 'Outbound Holidays — Victoria Falls Travel Specialists', 'url' => '/', 'desc' => 'Local Victoria Falls specialists crafting personalized stays, safaris, Chobe day trips, helicopter flights, and river cruises.', 'kw' => 'victoria falls holiday planner bespoke local specialists zimbabwe'),
        array('id' => 'page:accommodation', 'title' => 'Where to Stay in Victoria Falls — Hotels, Lodges & Apartments', 'url' => '/victoria-falls-accommodation', 'desc' => 'Compare luxury river lodges, boutique hotels, guest houses, and self-catering family villas across Victoria Falls.', 'kw' => 'accommodation where to stay hotels lodges guesthouses apartments villas'),
        array('id' => 'page:experiences', 'title' => 'Things to Do in Victoria Falls — Cruises, Safaris & Adventure', 'url' => '/things-to-do-in-victoria-falls', 'desc' => 'Explore Zambezi sunset cruises, Flight of Angels helicopter tours, rainforest walks, game drives, and Chobe safaris.', 'kw' => 'things to do experiences tours sunset cruise helicopter chobe safari bungee'),
        array('id' => 'page:packages', 'title' => 'Victoria Falls Holiday Packages', 'url' => '/victoria-falls-packages', 'desc' => 'Tailored holiday packages for couples, families, honeymoons, safari enthusiasts, and first-time visitors.', 'kw' => 'holiday packages family romantic honeymoon safari chobe value luxury'),
        array('id' => 'page:guide', 'title' => 'Victoria Falls Planning Guide', 'url' => '/victoria-falls-guide', 'desc' => 'Best time to visit, visa requirements, river water levels, flight access, and practical planning tips.', 'kw' => 'planning guide best time to visit visas weather water levels zambia botswana chobe'),
        array('id' => 'page:blog', 'title' => 'Victoria Falls Travel Blog & Insider Guides', 'url' => '/blog', 'desc' => 'Travel tips, accommodation advice, and seasonal Victoria Falls updates from our local team.', 'kw' => 'blog articles guides tips stories'),
        array('id' => 'page:gallery', 'title' => 'Client Holiday Memories Gallery', 'url' => '/client-gallery', 'desc' => 'Real guest photographs from Victoria Falls safaris, sunset cruises, helicopter flights, and stays.', 'kw' => 'client gallery photos memories albums'),
        array('id' => 'page:about', 'title' => 'About Fungai Mtetwa & Outbound Holidays', 'url' => '/about', 'desc' => 'Meet Victoria Falls travel specialist Fungai Mtetwa and discover our concierge approach.', 'kw' => 'about us fungai mtetwa story local concierge victoria falls'),
        array('id' => 'page:contact', 'title' => 'Contact Outbound Holidays Victoria Falls', 'url' => '/contact', 'desc' => 'Speak directly via WhatsApp or email with our Victoria Falls office for tailored stay and tour recommendations.', 'kw' => 'contact whatsapp email office victoria falls suite 4 enquire'),
    );
    $core_slugs = array('home', 'victoria-falls-accommodation', 'things-to-do-in-victoria-falls', 'victoria-falls-packages', 'victoria-falls-guide', 'blog', 'client-gallery', 'about', 'contact', 'newsletter-confirmed', 'sample-page');

    foreach ($core_pages as $cp) {
        $push_item(array(
            'id'          => $cp['id'],
            'title'       => $cp['title'],
            'type'        => 'pages',
            'typeLabel'   => 'Website Page',
            'category'    => 'Information',
            'description' => $cp['desc'],
            'image'       => $hero_fallback,
            'url'         => $cp['url'],
            'keywords'    => explode(' ', $cp['kw']),
            'extraText'   => $cp['desc'],
        ));
    }

    if (function_exists('get_posts')) {
        $wp_pages = get_posts(array(
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => 40,
            'no_found_rows'  => true,
        ));
        foreach ((array) $wp_pages as $wp_pg) {
            if (!is_object($wp_pg)) {
                continue;
            }
            $pslug = (string) ($wp_pg->post_name ?? '');
            if ($pslug === '' || in_array($pslug, $core_slugs, true)) {
                continue;
            }
            $pdesc = trim(strip_tags((string) ($wp_pg->post_excerpt ?: wp_trim_words((string) ($wp_pg->post_content ?? ''), 26, '...'))));
            $push_item(array(
                'id'          => 'wppage:' . $pslug,
                'title'       => (string) ($wp_pg->post_title ?? $pslug),
                'type'        => 'pages',
                'typeLabel'   => 'Page',
                'category'    => 'Page',
                'description' => $pdesc,
                'image'       => $hero_fallback,
                'url'         => '/' . $pslug,
                'keywords'    => array($pslug),
                'extraText'   => strip_tags((string) ($wp_pg->post_content ?? '')),
            ));
        }
    }

    if (!$force_refresh && function_exists('set_transient')) {
        set_transient($cache_key, $items, 3600);
    }
    $GLOBALS['__outbound_search_index_req_cache'] = $items;

    return $items;
}

/**
 * Execute normalized search across all public indexed records with relevance scoring and filtering.
 *
 * @param array{q?:string,type?:string,page?:int,per_page?:int} $params
 * @return array<string, mixed>
 */
function outbound_execute_public_search(array $params): array {
    $raw_q   = (string) ($params['q'] ?? '');
    $clean_q = function_exists('sanitize_text_field') ? (string) sanitize_text_field($raw_q) : trim(strip_tags($raw_q));
    if (strlen($clean_q) > 120) {
        $clean_q = substr($clean_q, 0, 120);
    }

    $allowed_types = array('all', 'accommodation', 'experiences', 'packages', 'blogs', 'offers', 'pages');
    $type = strtolower(trim((string) ($params['type'] ?? 'all')));
    if (!in_array($type, $allowed_types, true)) {
        $type = 'all';
    }

    $page     = max(1, min(100, (int) ($params['page'] ?? 1)));
    $per_page = max(1, min(50, (int) ($params['per_page'] ?? 12)));

    $type_counts = array_fill_keys($allowed_types, 0);
    $norm_q      = outbound_search_normalize_text($clean_q);

    if ($norm_q === '') {
        return array(
            'query'      => $clean_q,
            'type'       => $type,
            'page'       => $page,
            'perPage'    => $per_page,
            'total'      => 0,
            'totalPages' => 0,
            'typeCounts' => $type_counts,
            'results'    => array(),
            'source'     => 'wordpress-cms',
        );
    }

    $tokens = array_values(array_filter(explode(' ', $norm_q), static fn($t) => strlen($t) >= 2 || is_numeric($t)));
    if (empty($tokens)) {
        $tokens = array($norm_q);
    }

    $intent_type_boosts = array(
        'accommodation' => array('accommodation', 'stay', 'stays', 'room', 'rooms', 'hotel', 'lodge', 'guesthouse', 'apartment', 'villa', 'chalet', 'tent'),
        'experiences'   => array('activity', 'activities', 'experience', 'experiences', 'tour', 'tours', 'cruise', 'helicopter', 'safari'),
        'packages'      => array('package', 'packages', 'itinerary', 'holiday', 'holidays'),
        'blogs'         => array('blog', 'article', 'articles', 'guide', 'guides', 'tip', 'tips'),
        'offers'        => array('offer', 'offers', 'promo', 'promotion', 'deal', 'special', 'discount'),
        'pages'         => array('page', 'about', 'contact', 'gallery'),
    );

    $index   = outbound_build_public_search_index();
    $matched = array();

    foreach ($index as $entry) {
        $t_str = (string) ($entry['_normTitle'] ?? '');
        $k_str = (string) ($entry['_normKeywords'] ?? '');
        $b_str = (string) ($entry['_normBody'] ?? '');
        $all_str = $t_str . ' ' . $k_str . ' ' . $b_str;
        $itype   = (string) ($entry['type'] ?? 'pages');

        $score = 0;
        if (str_contains($t_str, $norm_q)) {
            $score += 140;
        } elseif (str_contains($k_str, $norm_q)) {
            $score += 80;
        } elseif (str_contains($b_str, $norm_q)) {
            $score += 40;
        }

        $matched_tokens = 0;
        $has_strong_token = false;
        foreach ($tokens as $tok) {
            $tok_hit = false;
            $is_intent_alias = isset($intent_type_boosts[$itype]) && in_array($tok, $intent_type_boosts[$itype], true);

            if (preg_match('/\b' . preg_quote($tok, '/') . '/i', $t_str)) {
                $score += 70;
                $tok_hit = true;
                $has_strong_token = true;
            } elseif (str_contains($t_str, $tok)) {
                $score += 48;
                $tok_hit = true;
                $has_strong_token = true;
            }

            if (preg_match('/\b' . preg_quote($tok, '/') . '/i', $k_str)) {
                $score += 40;
                $tok_hit = true;
                $has_strong_token = true;
            } elseif (str_contains($k_str, $tok)) {
                $score += 28;
                $tok_hit = true;
                $has_strong_token = true;
            }

            if (str_contains($b_str, $tok)) {
                $score += 18;
                $tok_hit = true;
            }

            if ($is_intent_alias) {
                $score += 24;
                $tok_hit = true;
            }

            if ($tok_hit) {
                $matched_tokens++;
            }
        }

        $token_count = count($tokens);
        // Require multi-word queries to either match the phrase, match all tokens, or match most tokens cleanly.
        if ($matched_tokens === 0 || ($token_count > 1 && $matched_tokens < $token_count && !$has_strong_token)) {
            continue;
        }
        if ($token_count >= 2 && $matched_tokens < max(1, (int) ceil($token_count * 0.6))) {
            continue;
        }
        if ($matched_tokens === $token_count) {
            $score += 65;
        }
        if (($entry['subtype'] ?? '') === 'unit') {
            $score += 6;
        }

        $clean_entry = $entry;
        unset($clean_entry['_normTitle'], $clean_entry['_normKeywords'], $clean_entry['_normBody']);
        $clean_entry['score'] = $score;

        $type_counts['all']++;
        if (isset($type_counts[$itype])) {
            $type_counts[$itype]++;
        }

        if ($type === 'all' || $itype === $type) {
            $matched[] = $clean_entry;
        }
    }

    usort($matched, static function (array $a, array $b): int {
        $cmp = ((int) ($b['score'] ?? 0)) <=> ((int) ($a['score'] ?? 0));
        if ($cmp !== 0) {
            return $cmp;
        }
        return strcasecmp((string) ($a['title'] ?? ''), (string) ($b['title'] ?? ''));
    });

    $total       = count($matched);
    $total_pages = $total > 0 ? (int) ceil($total / $per_page) : 0;
    $offset      = ($page - 1) * $per_page;
    $sliced      = array_slice($matched, $offset, $per_page);

    return array(
        'query'      => $clean_q,
        'type'       => $type,
        'page'       => $page,
        'perPage'    => $per_page,
        'total'      => $total,
        'totalPages' => $total_pages,
        'typeCounts' => $type_counts,
        'results'    => array_values($sliced),
        'source'     => 'wordpress-cms',
    );
}

/**
 * Register public REST endpoint `GET /wp-json/outbound/v1/search`.
 */
if (function_exists('add_action')) {
    add_action('rest_api_init', static function (): void {
        register_rest_route('outbound/v1', '/search', array(
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'args'                => array(
                'q'        => array('required' => false, 'sanitize_callback' => 'sanitize_text_field'),
                'type'     => array('required' => false, 'sanitize_callback' => 'sanitize_key'),
                'page'     => array('required' => false, 'sanitize_callback' => 'absint'),
                'per_page' => array('required' => false, 'sanitize_callback' => 'absint'),
            ),
            'callback'            => static function (WP_REST_Request $request) {
                try {
                    $result = outbound_execute_public_search(array(
                        'q'        => (string) ($request->get_param('q') ?? ''),
                        'type'     => (string) ($request->get_param('type') ?? 'all'),
                        'page'     => (int) ($request->get_param('page') ?? 1),
                        'per_page' => (int) ($request->get_param('per_page') ?? 12),
                    ));
                    $response = new WP_REST_Response($result, 200);
                    if (method_exists($response, 'header')) {
                        $response->header('Cache-Control', 'public, max-age=60, must-revalidate');
                    }
                    return $response;
                } catch (Throwable $e) {
                    error_log('[Outbound Search Error] ' . $e->getMessage());
                    return new WP_REST_Response(array(
                        'query'      => '',
                        'type'       => 'all',
                        'page'       => 1,
                        'perPage'    => 12,
                        'total'      => 0,
                        'totalPages' => 0,
                        'typeCounts' => array('all' => 0, 'accommodation' => 0, 'experiences' => 0, 'packages' => 0, 'blogs' => 0, 'offers' => 0, 'pages' => 0),
                        'results'    => array(),
                        'source'     => 'wordpress-cms',
                    ), 200);
                }
            },
        ));
    });
}

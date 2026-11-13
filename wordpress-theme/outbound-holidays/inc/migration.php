<?php
/**
 * Idempotent Content & Media Migration Tooling:
 * Imports exported bundle (`outbound-migration-bundle.json` or `default-snapshot.json`)
 * cleanly into WordPress CPTs, Taxonomies, Posts, Options, and optionally Media Library.
 * Includes both WP Admin UI (`Outbound Holidays -> Content Migration`) and WP-CLI command (`wp outbound migrate`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Resolve best primary image URL from a bundle record.
 *
 * @param array<string, mixed> $item
 */
function outbound_migration_resolve_image(array $item, array $keys): string {
    foreach ($keys as $k) {
        if (!empty($item[$k]) && is_string($item[$k])) {
            return trim($item[$k]);
        }
    }
    return '';
}

/**
 * Pure helper to map an exported accommodation record into WordPress post & meta payload.
 *
 * @param array<string, mixed> $item
 * @return array<string, mixed>
 */
function outbound_map_accommodation_migration_record(array $item): array {
    $slug          = sanitize_title((string) ($item['slug'] ?? ($item['id'] ?? '')));
    $canonical_cat = outbound_resolve_accommodation_category_id($item);
    $image         = outbound_migration_resolve_image($item, array('heroImage', 'image', 'imageUrl'));
    $gallery       = array_values((array) ($item['galleryImages'] ?? ($item['gallery'] ?? array())));
    $amenities     = array_values((array) ($item['amenities'] ?? array()));
    $raw_why       = $item['whyWeRecommend'] ?? ($item['highlights'] ?? '');
    $why_text      = is_array($raw_why) ? implode("\n", array_map('strval', $raw_why)) : (string) $raw_why;
    $highlights    = is_array($item['highlights'] ?? null)
        ? array_values($item['highlights'])
        : ($why_text !== '' ? array($why_text) : array());

    return array(
        'post_type'    => 'accommodation',
        'post_name'    => $slug,
        'post_title'   => (string) ($item['name'] ?? ($item['title'] ?? $slug)),
        'post_excerpt' => (string) ($item['shortDescription'] ?? ($item['summary'] ?? '')),
        'post_content' => (string) ($item['editorialOverview'] ?? ($item['description'] ?? ($item['editorialSummary'] ?? ''))),
        'category_id'  => $canonical_cat,
        'meta'         => array(
            '_outbound_category_id'             => $canonical_cat,
            '_outbound_category_label'          => (string) ($item['category'] ?? 'Luxury Lodge'),
            '_outbound_badge'                   => (string) ($item['badge'] ?? ''),
            '_outbound_tagline'                 => (string) ($item['tagline'] ?? ''),
            '_outbound_location'                => (string) ($item['location'] ?? 'Victoria Falls, Zimbabwe'),
            '_outbound_distance_falls'          => (string) ($item['distanceFromFalls'] ?? ''),
            '_outbound_airport_distance'        => (string) ($item['airportDistance'] ?? ''),
            '_outbound_price_usd'               => (string) ((int) ($item['priceFromUSD'] ?? ($item['startingPrice'] ?? 0))),
            '_outbound_price_basis'             => (string) ($item['priceUnit'] ?? ($item['priceBasis'] ?? 'per night (sharing)')),
            '_outbound_max_guests'              => (string) ((int) ($item['maxGuests'] ?? 2)),
            '_outbound_rating'                  => (string) ($item['rating'] ?? '4.8'),
            '_outbound_review_count'            => (string) ((int) ($item['reviewCount'] ?? 24)),
            '_outbound_checkin_time'            => (string) ($item['checkInTime'] ?? '14:00'),
            '_outbound_checkout_time'           => (string) ($item['checkOutTime'] ?? '10:00'),
            '_outbound_featured'                => !empty($item['featured']) ? '1' : '0',
            '_outbound_why_recommend'           => $why_text,
            '_outbound_image_url'               => $image,
            '_outbound_hero_image_url'          => $image,
            '_outbound_amenities_json'          => wp_json_encode($amenities),
            '_outbound_filter_tags_json'        => wp_json_encode(array_values((array) ($item['filterTags'] ?? array()))),
            '_outbound_at_a_glance_json'        => wp_json_encode((array) ($item['atAGlance'] ?? array())),
            '_outbound_highlights_json'         => wp_json_encode($highlights),
            '_outbound_gallery_json'            => wp_json_encode($gallery),
            '_outbound_room_types_json'         => wp_json_encode(array_values((array) ($item['roomTypes'] ?? array()))),
            '_outbound_facilities_json'         => wp_json_encode(array_values((array) ($item['facilities'] ?? array()))),
            '_outbound_location_info_json'      => wp_json_encode((array) ($item['locationInfo'] ?? array())),
            '_outbound_nearby_experiences_json' => wp_json_encode(array_values((array) ($item['nearbyExperienceIds'] ?? array()))),
            '_outbound_related_ids_json'        => wp_json_encode(array_values((array) ($item['relatedPropertyIds'] ?? array()))),
            '_outbound_full_json'               => wp_json_encode($item),
        ),
    );
}

/**
 * Pure helper to map an exported experience record into WordPress post & meta payload.
 *
 * @param array<string, mixed> $exp
 * @return array<string, mixed>
 */
function outbound_map_experience_migration_record(array $exp): array {
    $slug  = sanitize_title((string) ($exp['slug'] ?? ($exp['id'] ?? '')));
    $image = outbound_migration_resolve_image($exp, array('featuredImage', 'image', 'imageUrl'));

    return array(
        'post_type'    => 'experience',
        'post_name'    => $slug,
        'post_title'   => (string) ($exp['title'] ?? $slug),
        'post_excerpt' => (string) ($exp['shortDescription'] ?? ($exp['shortDesc'] ?? ($exp['summary'] ?? ''))),
        'post_content' => (string) ($exp['fullOverview'] ?? ($exp['description'] ?? ($exp['fullDesc'] ?? ''))),
        'categories'   => array_map('sanitize_title', (array) ($exp['categories'] ?? array('first-visit'))),
        'meta'         => array(
            '_outbound_price_usd'         => (string) ((int) ($exp['priceAmount'] ?? 0)),
            '_outbound_duration'          => (string) ($exp['duration'] ?? 'Half Day'),
            '_outbound_location'          => (string) ($exp['location'] ?? 'Victoria Falls'),
            '_outbound_subtitle'          => (string) ($exp['subtitle'] ?? ''),
            '_outbound_badge'             => (string) ($exp['badge'] ?? ''),
            '_outbound_min_age'           => (string) ($exp['minAge'] ?? ''),
            '_outbound_featured'          => !empty($exp['featured']) ? '1' : '0',
            '_outbound_why_recommend'     => (string) ($exp['whyWeRecommend'] ?? ''),
            '_outbound_expert_tip'        => (string) ($exp['localExpertTip'] ?? ''),
            '_outbound_image_url'         => $image,
            '_outbound_hero_image_url'    => $image,
            '_outbound_highlights_json'   => wp_json_encode(array_values((array) ($exp['highlights'] ?? array()))),
            '_outbound_inclusions_json'   => wp_json_encode(array_values((array) ($exp['whatsIncluded'] ?? ($exp['included'] ?? array())))),
            '_outbound_exclusions_json'   => wp_json_encode(array_values((array) ($exp['whatsExcluded'] ?? ($exp['excluded'] ?? array())))),
            '_outbound_good_to_know_json' => wp_json_encode(array_values((array) ($exp['goodToKnow'] ?? array()))),
            '_outbound_gallery_json'      => wp_json_encode(array_values((array) ($exp['galleryImages'] ?? ($exp['gallery'] ?? array())))),
            '_outbound_steps_json'        => wp_json_encode(array_values((array) ($exp['steps'] ?? array()))),
            '_outbound_faqs_json'         => wp_json_encode(array_values((array) ($exp['faqs'] ?? array()))),
            '_outbound_related_ids_json'  => wp_json_encode(array_values((array) ($exp['relatedIds'] ?? array()))),
            '_outbound_full_json'         => wp_json_encode($exp),
        ),
    );
}

/**
 * Pure helper to map an exported package record into WordPress post & meta payload.
 *
 * @param array<string, mixed> $pkg
 * @return array<string, mixed>
 */
function outbound_map_package_migration_record(array $pkg): array {
    $slug    = sanitize_title((string) ($pkg['slug'] ?? ($pkg['id'] ?? '')));
    $image   = outbound_migration_resolve_image($pkg, array('imageUrl', 'image', 'heroImage'));
    $raw_why = $pkg['whyWeRecommend'] ?? '';
    $why_str = is_array($raw_why) ? implode("\n", array_map('strval', $raw_why)) : (string) $raw_why;

    return array(
        'post_type'    => 'package',
        'post_name'    => $slug,
        'post_title'   => (string) ($pkg['title'] ?? $slug),
        'post_excerpt' => (string) ($pkg['tagline'] ?? ($pkg['subtitle'] ?? ($pkg['summary'] ?? ''))),
        'post_content' => (string) ($pkg['description'] ?? ''),
        'meta'         => array(
            '_outbound_price_usd'                  => (string) ((int) ($pkg['priceUSD'] ?? ($pkg['priceAmount'] ?? ($pkg['startingPrice'] ?? 0)))),
            '_outbound_duration'                   => (string) ($pkg['duration'] ?? '4 Days / 3 Nights'),
            '_outbound_badge'                      => (string) ($pkg['badge'] ?? 'Signature'),
            '_outbound_package_tier'               => sanitize_title((string) ($pkg['category'] ?? 'first-visit')),
            '_outbound_categories_json'            => wp_json_encode(array_values((array) ($pkg['categories'] ?? array('first-visit')))),
            '_outbound_traveller_type'             => (string) ($pkg['travellerType'] ?? 'Couples & Families'),
            '_outbound_rating'                     => (string) ($pkg['rating'] ?? '4.9'),
            '_outbound_review_count'               => (string) ((int) ($pkg['reviewCount'] ?? 18)),
            '_outbound_featured'                   => !empty($pkg['featured']) ? '1' : '0',
            '_outbound_story_intro'                => (string) ($pkg['storyIntroduction'] ?? ''),
            '_outbound_why_recommend'              => $why_str,
            '_outbound_why_chose_stay'             => (string) ($pkg['whyWeChoseStay'] ?? ''),
            '_outbound_highlights_meta_json'       => wp_json_encode((array) ($pkg['highlightsMeta'] ?? array())),
            '_outbound_who_is_for_json'            => wp_json_encode((array) ($pkg['whoIsThisFor'] ?? array())),
            '_outbound_pricing_details_json'       => wp_json_encode((array) ($pkg['pricingDetails'] ?? array())),
            '_outbound_image_url'                  => $image,
            '_outbound_hero_image_url'             => $image,
            '_outbound_gallery_json'               => wp_json_encode(array_values((array) ($pkg['galleryImages'] ?? array()))),
            '_outbound_highlights_json'            => wp_json_encode(array_values((array) ($pkg['highlights'] ?? array()))),
            '_outbound_inclusions_json'            => wp_json_encode(array_values((array) ($pkg['included'] ?? array()))),
            '_outbound_exclusions_json'            => wp_json_encode(array_values((array) ($pkg['notIncluded'] ?? ($pkg['excluded'] ?? array())))),
            '_outbound_itinerary_json'             => wp_json_encode(array_values((array) ($pkg['itinerary'] ?? array()))),
            '_outbound_detailed_itinerary_json'    => wp_json_encode(array_values((array) ($pkg['detailedItinerary'] ?? array()))),
            '_outbound_recommended_hotels_json'    => wp_json_encode(array_values((array) ($pkg['recommendedHotels'] ?? array()))),
            '_outbound_route_map_json'             => wp_json_encode(array_values((array) ($pkg['routeMap'] ?? array()))),
            '_outbound_included_experiences_json'  => wp_json_encode(array_values((array) ($pkg['includedExperienceIds'] ?? array()))),
            '_outbound_related_ids_json'           => wp_json_encode(array_values((array) ($pkg['relatedPackageIds'] ?? array()))),
            '_outbound_faqs_json'                  => wp_json_encode(array_values((array) ($pkg['faqs'] ?? array()))),
            '_outbound_full_json'                  => wp_json_encode($pkg),
        ),
    );
}

/**
 * Pure helper to map an exported guide record into WordPress post & meta payload.
 *
 * @param array<string, mixed> $guide
 * @return array<string, mixed>
 */
function outbound_map_guide_migration_record(array $guide): array {
    $slug    = sanitize_title((string) ($guide['slug'] ?? ($guide['id'] ?? '')));
    $image   = outbound_migration_resolve_image($guide, array('heroImageUrl', 'image', 'featuredImage'));
    $rel     = array();
    foreach ((array) ($guide['relatedGuides'] ?? array()) as $rg) {
        if (is_array($rg) && !empty($rg['slug'])) {
            $rel[] = (string) $rg['slug'];
        } elseif (is_string($rg) && $rg !== '') {
            $rel[] = $rg;
        }
    }

    return array(
        'post_type'    => 'guide_article',
        'post_name'    => $slug,
        'post_title'   => (string) ($guide['title'] ?? $slug),
        'post_excerpt' => (string) ($guide['subtitle'] ?? ($guide['summary'] ?? '')),
        'post_content' => (string) ($guide['intro'] ?? ($guide['subtitle'] ?? '')),
        'meta'         => array(
            '_outbound_subtitle'             => (string) ($guide['subtitle'] ?? ''),
            '_outbound_category_label'       => (string) ($guide['category'] ?? 'Victoria Falls Travel Guides'),
            '_outbound_reading_time'         => (string) ($guide['readingTime'] ?? '6 min read'),
            '_outbound_published_date'       => (string) ($guide['publishedDate'] ?? gmdate('Y-m-d')),
            '_outbound_updated_date'         => (string) ($guide['lastUpdatedDate'] ?? gmdate('Y-m-d')),
            '_outbound_location'             => (string) ($guide['location'] ?? 'Victoria Falls, Zimbabwe'),
            '_outbound_hero_alt'             => (string) ($guide['heroImageAlt'] ?? ($guide['title'] ?? $slug)),
            '_outbound_hero_credit'          => (string) ($guide['heroImageCredit'] ?? ''),
            '_outbound_author_json'          => wp_json_encode((array) ($guide['author'] ?? array())),
            '_outbound_quick_facts_json'     => wp_json_encode(array_values((array) ($guide['quickFacts'] ?? array()))),
            '_outbound_traveller_types_json' => wp_json_encode(array_values((array) ($guide['travellerTypes'] ?? array()))),
            '_outbound_image_url'            => $image,
            '_outbound_hero_image_url'       => $image,
            '_outbound_sections_json'        => wp_json_encode(array_values((array) ($guide['sections'] ?? array()))),
            '_outbound_faqs_json'            => wp_json_encode(array_values((array) ($guide['faqs'] ?? array()))),
            '_outbound_related_guides_json'  => wp_json_encode($rel),
            '_outbound_seo_title'            => (string) ($guide['seo']['metaTitle'] ?? ''),
            '_outbound_seo_description'      => (string) ($guide['seo']['metaDescription'] ?? ''),
            '_outbound_seo_canonical'        => (string) ($guide['seo']['canonicalUrl'] ?? ''),
            '_outbound_seo_keywords_json'    => wp_json_encode(array_values((array) ($guide['seo']['keywords'] ?? array()))),
            '_outbound_full_json'            => wp_json_encode($guide),
        ),
    );
}

/**
 * Pure helper to map an exported client album record into WordPress post & meta payload.
 *
 * @param array<string, mixed> $album
 * @return array<string, mixed>
 */
function outbound_map_album_migration_record(array $album): array {
    $slug   = sanitize_title((string) ($album['slug'] ?? ($album['id'] ?? 'vic-falls-guests')));
    $photos = array_values((array) ($album['photos'] ?? ($album['images'] ?? array())));
    $hero   = '';
    if (!empty($photos[0]['url'])) {
        $hero = (string) $photos[0]['url'];
    } elseif (!empty($photos[0]) && is_string($photos[0])) {
        $hero = $photos[0];
    }

    return array(
        'post_type'    => 'client_album',
        'post_name'    => $slug,
        'post_title'   => (string) ($album['title'] ?? 'Guest Memories in Victoria Falls'),
        'post_excerpt' => (string) ($album['description'] ?? ''),
        'post_content' => (string) ($album['description'] ?? ''),
        'meta'         => array(
            '_outbound_season'         => (string) ($album['season'] ?? '2026 Safari Guests'),
            '_outbound_subtitle'       => (string) ($album['subtitle'] ?? ($album['description'] ?? '')),
            '_outbound_featured'       => array_key_exists('featured', $album) ? (!empty($album['featured']) ? '1' : '0') : '1',
            '_outbound_image_url'      => $hero,
            '_outbound_hero_image_url' => $hero,
            '_outbound_gallery_json'   => wp_json_encode($photos),
            '_outbound_full_json'      => wp_json_encode($album),
        ),
    );
}

/**
 * Pure helper to compare expected counts in bundle against existing WordPress counts.
 *
 * @param array<string, mixed> $bundle
 * @param array<string, int>   $actual_counts
 * @return array<int, array{type:string,expected:int,actual:int,match:bool}>
 */
function outbound_build_migration_reconciliation(array $bundle, array $actual_counts): array {
    $expected_map = array(
        'accommodation' => count((array) ($bundle['accommodations'] ?? array())),
        'experience'    => count((array) ($bundle['experiences'] ?? array())),
        'package'       => count((array) ($bundle['packages'] ?? array())),
        'guide_article' => count((array) ($bundle['guides'] ?? array())),
        'client_album'  => count((array) ($bundle['clientGalleries'] ?? ($bundle['albums'] ?? array()))),
        'post'          => count((array) ($bundle['blogPosts'] ?? ($bundle['guides'] ?? array()))),
    );

    $report = array();
    foreach ($expected_map as $type => $exp) {
        $act = (int) ($actual_counts[$type] ?? 0);
        $report[] = array(
            'type'     => $type,
            'expected' => $exp,
            'actual'   => $act,
            'match'    => ($act >= $exp),
        );
    }
    return $report;
}

/**
 * Download external/local media URL into WordPress Media Library idempotently.
 */
function outbound_sideload_image_to_library(string $image_url, int $post_id = 0): int {
    if ($image_url === '' || !function_exists('media_sideload_image')) {
        return 0;
    }

    $existing = get_posts(array(
        'post_type'      => 'attachment',
        'posts_per_page' => 1,
        'post_status'    => 'inherit',
        'meta_key'       => '_outbound_source_url',
        'meta_value'     => $image_url,
    ));
    if (!empty($existing)) {
        return (int) $existing[0]->ID;
    }

    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $att_id = media_sideload_image($image_url, $post_id, null, 'id');
    if (is_wp_error($att_id)) {
        return 0;
    }
    update_post_meta((int) $att_id, '_outbound_source_url', esc_url_raw($image_url));
    return (int) $att_id;
}

/**
 * Upsert a post cleanly by slug + post_type for repeatable idempotent imports.
 *
 * @param array<string, mixed>  $postarr
 * @param array<string, string> $meta
 */
function outbound_upsert_migrated_post(array $postarr, array $meta, bool $sideload_media = false): int {
    $slug      = sanitize_title((string) $postarr['post_name']);
    $post_type = (string) $postarr['post_type'];

    $existing = get_page_by_path($slug, OBJECT, $post_type);
    $payload  = array(
        'post_type'    => $post_type,
        'post_name'    => $slug,
        'post_title'   => (string) $postarr['post_title'],
        'post_excerpt' => (string) ($postarr['post_excerpt'] ?? ''),
        'post_content' => (string) ($postarr['post_content'] ?? ''),
        'post_status'  => 'publish',
    );

    if ($existing instanceof WP_Post) {
        $payload['ID'] = $existing->ID;
        $post_id = (int) wp_update_post($payload);
    } else {
        $post_id = (int) wp_insert_post($payload);
    }

    if ($post_id > 0) {
        foreach ($meta as $k => $v) {
            update_post_meta($post_id, $k, $v);
        }
        $img = (string) ($meta['_outbound_hero_image_url'] ?? ($meta['_outbound_image_url'] ?? ''));
        if ($sideload_media && $img !== '') {
            $att_id = outbound_sideload_image_to_library($img, $post_id);
            if ($att_id > 0) {
                set_post_thumbnail($post_id, $att_id);
                $local_url = wp_get_attachment_url($att_id);
                if ($local_url) {
                    update_post_meta($post_id, '_outbound_image_url', $local_url);
                    update_post_meta($post_id, '_outbound_hero_image_url', $local_url);
                }
            }
        }
    }

    return $post_id;
}

/**
 * Run complete idempotent migration from decoded migration bundle JSON array.
 *
 * @param array<string, mixed> $bundle
 * @return array<string, int>
 */
function outbound_execute_bundle_import(array $bundle, bool $sideload_media = false): array {
    if (function_exists('set_time_limit')) {
        @set_time_limit(120);
    }
    outbound_ensure_core_pages();

    // Ensure any bundle missing top-level collections falls back cleanly to built-in default snapshot collections.
    $fallback = function_exists('outbound_get_baseline_snapshot') ? outbound_get_baseline_snapshot() : array();

    $counts = array(
        'accommodation' => 0,
        'experience'    => 0,
        'package'       => 0,
        'guide_article' => 0,
        'client_album'  => 0,
        'post'          => 0,
    );

    foreach ((array) ($bundle['accommodations'] ?? ($fallback['accommodations'] ?? array())) as $acc) {
        $mapped = outbound_map_accommodation_migration_record((array) $acc);
        $pid = outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media);
        if ($pid > 0) {
            wp_set_object_terms($pid, array($mapped['category_id']), 'accommodation_category');
            $counts['accommodation']++;
        }
    }

    foreach ((array) ($bundle['experiences'] ?? ($fallback['experiences'] ?? array())) as $exp) {
        $mapped = outbound_map_experience_migration_record((array) $exp);
        $pid = outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media);
        if ($pid > 0) {
            wp_set_object_terms($pid, (array) $mapped['categories'], 'experience_category');
            $counts['experience']++;
        }
    }

    foreach ((array) ($bundle['packages'] ?? ($fallback['packages'] ?? array())) as $pkg) {
        $mapped = outbound_map_package_migration_record((array) $pkg);
        $pid = outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media);
        if ($pid > 0) {
            $counts['package']++;
        }
    }

    $guides_list = (array) ($bundle['guides'] ?? ($fallback['guides'] ?? array()));
    foreach ($guides_list as $guide) {
        $g_arr  = (array) $guide;
        $mapped = outbound_map_guide_migration_record($g_arr);
        $pid    = outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media);
        if ($pid > 0) {
            $counts['guide_article']++;
        }

        if (empty($bundle['blogPosts'])) {
            $slug    = (string) $mapped['post_name'];
            $img     = (string) ($mapped['meta']['_outbound_hero_image_url'] ?? '');
            $blog_id = outbound_upsert_migrated_post(
                array(
                    'post_type'    => 'post',
                    'post_name'    => $slug,
                    'post_title'   => (string) $mapped['post_title'],
                    'post_excerpt' => (string) $mapped['post_excerpt'],
                    'post_content' => (string) $mapped['post_content'],
                ),
                array(
                    '_outbound_image_url'      => $img,
                    '_outbound_hero_image_url' => $img,
                    '_outbound_sections_json'  => (string) ($mapped['meta']['_outbound_sections_json'] ?? '[]'),
                    '_outbound_faqs_json'      => (string) ($mapped['meta']['_outbound_faqs_json'] ?? '[]'),
                ),
                $sideload_media
            );
            if ($blog_id > 0) {
                wp_set_object_terms($blog_id, array('victoria-falls-travel-guides'), 'category');
                $counts['post']++;
            }
        }
    }

    $albums_list = (array) ($bundle['clientGalleries'] ?? ($bundle['albums'] ?? ($fallback['albums'] ?? array())));
    foreach ($albums_list as $album) {
        $mapped = outbound_map_album_migration_record((array) $album);
        $pid = outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media);
        if ($pid > 0) {
            $counts['client_album']++;
        }
    }

    $stay_tiers = $bundle['stayTiers'] ?? ($fallback['stayTiers'] ?? array());
    if (!empty($stay_tiers)) {
        update_option('outbound_builder_stay_tiers', $stay_tiers);
    }
    $builder_acts = $bundle['builderActivities'] ?? ($fallback['builderActivities'] ?? array());
    if (!empty($builder_acts)) {
        update_option('outbound_builder_activities', $builder_acts);
    }

    update_option('outbound_initial_migration_done', gmdate('c'));

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }
    flush_rewrite_rules();
    return $counts;
}

/**
 * Safely auto-seed CPT records once in WordPress admin when CPTs are completely empty,
 * avoiding heavy remote sideloading so it never causes 502 timeouts.
 */
function outbound_maybe_auto_seed_initial_content(): void {
    if (!function_exists('is_admin') || !is_admin() || !current_user_can('manage_options')) {
        return;
    }
    if (get_option('outbound_initial_migration_done', '') !== '') {
        return;
    }
    $pkg_count   = (int) (wp_count_posts('package')->publish ?? 0);
    $guide_count = (int) (wp_count_posts('guide_article')->publish ?? 0);
    if ($pkg_count > 0 && $guide_count > 0) {
        update_option('outbound_initial_migration_done', gmdate('c'));
        return;
    }
    $bundled = OUTBOUND_THEME_DIR . '/inc/default-snapshot.json';
    if (file_exists($bundled)) {
        $decoded = json_decode((string) file_get_contents($bundled), true);
        if (is_array($decoded)) {
            outbound_execute_bundle_import($decoded, false);
        }
    }
}
if (function_exists('add_action')) {
    add_action('admin_init', 'outbound_maybe_auto_seed_initial_content', 25);
}

/**
 * Add WP Admin Content Migration Importer submenu.
 */
if (function_exists('add_action')) {
    add_action('admin_menu', static function (): void {
        add_submenu_page(
            'outbound-cms',
            __('Content & Media Migration', 'outbound-holidays'),
            __('Content Migration', 'outbound-holidays'),
            'manage_options',
            'outbound-migration',
            'outbound_render_migration_admin_page'
        );
    }, 16);
}

/**
 * Render WP Admin Importer & Reconciliation Report screen.
 */
function outbound_render_migration_admin_page(): void {
    if (!current_user_can('manage_options')) {
        return;
    }

    $result = null;
    $error  = '';

    if (isset($_POST['outbound_seed_bundled']) && check_admin_referer('outbound_migrate_action', 'outbound_migrate_nonce')) {
        $sideload = !empty($_POST['sideload_media']);
        $bundled  = OUTBOUND_THEME_DIR . '/inc/default-snapshot.json';
        if (file_exists($bundled)) {
            $decoded = json_decode((string) file_get_contents($bundled), true);
            if (is_array($decoded)) {
                $result = outbound_execute_bundle_import($decoded, $sideload);
            } else {
                $error = __('Could not decode bundled theme snapshot.', 'outbound-holidays');
            }
        } else {
            $error = __('Bundled theme snapshot file inc/default-snapshot.json was not found.', 'outbound-holidays');
        }
    }

    if (isset($_POST['outbound_run_import']) && check_admin_referer('outbound_migrate_action', 'outbound_migrate_nonce')) {
        $sideload = !empty($_POST['sideload_media']);
        if (!empty($_FILES['bundle_file']['tmp_name'])) {
            $raw = file_get_contents((string) $_FILES['bundle_file']['tmp_name']);
            $decoded = json_decode((string) $raw, true);
            if (is_array($decoded)) {
                $result = outbound_execute_bundle_import($decoded, $sideload);
            } else {
                $error = __('Invalid JSON structure in uploaded bundle file.', 'outbound-holidays');
            }
        } else {
            $error = __('Please choose the exported outbound-migration-bundle.json file first.', 'outbound-holidays');
        }
    }

    $live_counts = array(
        'accommodation' => (int) (wp_count_posts('accommodation')->publish ?? 0),
        'experience'    => (int) (wp_count_posts('experience')->publish ?? 0),
        'package'       => (int) (wp_count_posts('package')->publish ?? 0),
        'guide_article' => (int) (wp_count_posts('guide_article')->publish ?? 0),
        'client_album'  => (int) (wp_count_posts('client_album')->publish ?? 0),
        'post'          => (int) (wp_count_posts('post')->publish ?? 0),
    );
    ?>
    <div class="wrap outbound-admin-wrap">
        <div class="outbound-admin-header">
            <div>
                <h1><?php esc_html_e('Content & Media Migration Importer', 'outbound-holidays'); ?></h1>
                <p><?php esc_html_e('Populate all WordPress CPTs (Accommodations, Experiences, Packages, Guides, Client Albums), Blog posts, and Builder options idempotently with zero data loss.', 'outbound-holidays'); ?></p>
            </div>
        </div>

        <?php if ($error !== '') : ?>
            <div class="notice notice-error"><p><?php echo esc_html($error); ?></p></div>
        <?php endif; ?>
        <?php if ($result !== null) : ?>
            <div class="notice notice-success"><p><?php echo esc_html('Migration complete: ' . wp_json_encode($result)); ?></p></div>
        <?php endif; ?>

        <div class="outbound-admin-card">
            <h2><?php esc_html_e('Quick Seed from Built-in Theme Snapshot', 'outbound-holidays'); ?></h2>
            <p><?php esc_html_e('Synchronizes all 8 Accommodations, 25 Experiences, 8 Holiday Packages, 11 Planning Guides, Client Gallery Albums, Stay Tiers, and Builder Activities from inc/default-snapshot.json cleanly without duplicate records.', 'outbound-holidays'); ?></p>
            <form method="post">
                <?php wp_nonce_field('outbound_migrate_action', 'outbound_migrate_nonce'); ?>
                <p><label><input type="checkbox" name="sideload_media" value="1"> <?php esc_html_e('Download & register remote hero images into WordPress Media Library (leave unchecked on slow/shared hosts to avoid 502 timeouts; bundled assets already work locally).', 'outbound-holidays'); ?></label></p>
                <p><button type="submit" name="outbound_seed_bundled" class="button button-primary button-hero"><?php esc_html_e('One-Click Import Built-in Theme Content into WordPress', 'outbound-holidays'); ?></button></p>
            </form>
        </div>

        <div class="outbound-admin-card">
            <h2><?php esc_html_e('Or Upload Custom Export Bundle', 'outbound-holidays'); ?></h2>
            <form method="post" enctype="multipart/form-data">
                <?php wp_nonce_field('outbound_migrate_action', 'outbound_migrate_nonce'); ?>
                <p><input type="file" name="bundle_file" accept=".json,application/json"></p>
                <p><label><input type="checkbox" name="sideload_media" value="1"> <?php esc_html_e('Attempt Media Library attachment download on import', 'outbound-holidays'); ?></label></p>
                <p><button type="submit" name="outbound_run_import" class="button button-secondary"><?php esc_html_e('Run Idempotent Bundle Import', 'outbound-holidays'); ?></button></p>
            </form>
        </div>

        <div class="outbound-admin-card">
            <h2><?php esc_html_e('Live WordPress Database Reconciliation', 'outbound-holidays'); ?></h2>
            <table class="widefat striped">
                <thead><tr><th><?php esc_html_e('WordPress Content Type', 'outbound-holidays'); ?></th><th><?php esc_html_e('Published Records in Database', 'outbound-holidays'); ?></th></tr></thead>
                <tbody>
                    <?php foreach ($live_counts as $type => $cnt) : ?>
                        <tr>
                            <td><strong><?php echo esc_html($type); ?></strong></td>
                            <td><?php echo esc_html((string) $cnt); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
    <?php
}

if (defined('WP_CLI') && WP_CLI && class_exists('WP_CLI')) {
    WP_CLI::add_command('outbound migrate', static function (array $args): void {
        $file = $args[0] ?? (OUTBOUND_THEME_DIR . '/inc/default-snapshot.json');
        if (!file_exists($file)) {
            WP_CLI::error("Migration bundle file not found: {$file}");
        }
        $decoded = json_decode((string) file_get_contents($file), true);
        if (!is_array($decoded)) {
            WP_CLI::error('Failed to decode migration bundle JSON.');
        }
        $counts = outbound_execute_bundle_import($decoded, false);
        WP_CLI::success('Migrated records: ' . wp_json_encode($counts));
    });
}

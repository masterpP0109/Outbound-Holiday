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

    $rooms_in  = array_values((array) ($item['roomTypes'] ?? array()));
    $rooms_out = array();
    foreach ($rooms_in as $ridx => $rm) {
        if (!is_array($rm) || empty($rm['name'])) {
            continue;
        }
        if (empty($rm['id'])) {
            $rm['id'] = 'unit_' . $slug . '_' . ($ridx + 1);
        }
        $rooms_out[] = $rm;
    }

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
            '_outbound_room_types_json'         => wp_json_encode($rooms_out),
            '_outbound_facilities_json'         => wp_json_encode(array_values((array) ($item['facilities'] ?? array()))),
            '_outbound_location_info_json'      => wp_json_encode((array) ($item['locationInfo'] ?? array())),
            '_outbound_nearby_experiences_json' => wp_json_encode(array_values((array) ($item['nearbyExperienceIds'] ?? array()))),
            '_outbound_related_ids_json'        => wp_json_encode(array_values((array) ($item['relatedPropertyIds'] ?? array()))),
            '_outbound_rate_plans_json'         => wp_json_encode(array_values((array) ($item['ratePlans'] ?? array()))),
            '_outbound_property_offers_json'    => wp_json_encode(array_values((array) ($item['offers'] ?? array()))),
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
 * @param string|null           $action_taken Out-parameter set to 'created', 'updated', or 'skipped'.
 */
function outbound_upsert_migrated_post(array $postarr, array $meta, bool $sideload_media = false, bool $overwrite = false, ?string &$action_taken = null): int {
    $slug      = sanitize_title((string) $postarr['post_name']);
    $post_type = (string) $postarr['post_type'];

    $existing = get_page_by_path($slug, OBJECT, $post_type);
    if ($existing instanceof WP_Post && !$overwrite) {
        $action_taken = 'skipped';
        return (int) $existing->ID;
    }

    $payload = array(
        'post_type'    => $post_type,
        'post_name'    => $slug,
        'post_title'   => (string) $postarr['post_title'],
        'post_excerpt' => (string) ($postarr['post_excerpt'] ?? ''),
        'post_content' => (string) ($postarr['post_content'] ?? ''),
        'post_status'  => 'publish',
    );

    if ($existing instanceof WP_Post) {
        $payload['ID'] = $existing->ID;
        $post_id       = (int) wp_update_post($payload);
        $action_taken  = 'updated';
    } else {
        $post_id      = (int) wp_insert_post($payload);
        $action_taken = 'created';
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
 * Dry-run preview of what a bundle import would create, skip, or overwrite without modifying the database.
 *
 * @param array<string, mixed> $bundle
 * @return array<string, mixed>
 */
function outbound_preview_bundle_import(array $bundle, bool $overwrite = false): array {
    $fallback = function_exists('outbound_get_baseline_snapshot') ? outbound_get_baseline_snapshot() : array();
    $preview  = array(
        'overwrite' => $overwrite,
        'summary'   => array(),
        'details'   => array(),
    );

    $check_group = static function (string $label, string $post_type, array $records, callable $mapper) use ($overwrite, &$preview): void {
        $counts = array('create' => 0, 'skip' => 0, 'overwrite' => 0);
        $items  = array();
        foreach ($records as $rec) {
            $mapped = $mapper((array) $rec);
            $slug   = sanitize_title((string) ($mapped['post_name'] ?? ''));
            if ($slug === '') {
                continue;
            }
            $existing = get_page_by_path($slug, OBJECT, $post_type);
            if ($existing instanceof WP_Post) {
                if ($overwrite) {
                    $counts['overwrite']++;
                    $items[] = array('slug' => $slug, 'title' => (string) $mapped['post_title'], 'action' => 'overwrite');
                } else {
                    $counts['skip']++;
                    $items[] = array('slug' => $slug, 'title' => (string) $mapped['post_title'], 'action' => 'skip');
                }
            } else {
                $counts['create']++;
                $items[] = array('slug' => $slug, 'title' => (string) $mapped['post_title'], 'action' => 'create');
            }
        }
        $preview['summary'][$label] = $counts;
        $preview['details'][$label] = $items;
    };

    $check_group('Accommodations', 'accommodation', (array) ($bundle['accommodations'] ?? ($fallback['accommodations'] ?? array())), 'outbound_map_accommodation_migration_record');
    $check_group('Experiences', 'experience', (array) ($bundle['experiences'] ?? ($fallback['experiences'] ?? array())), 'outbound_map_experience_migration_record');
    $check_group('Packages', 'package', (array) ($bundle['packages'] ?? ($fallback['packages'] ?? array())), 'outbound_map_package_migration_record');
    $check_group('Planning Guides', 'guide_article', (array) ($bundle['guides'] ?? ($fallback['guides'] ?? array())), 'outbound_map_guide_migration_record');
    $check_group('Client Albums', 'client_album', (array) ($bundle['clientGalleries'] ?? ($bundle['albums'] ?? ($fallback['albums'] ?? array()))), 'outbound_map_album_migration_record');

    return $preview;
}

/**
 * Run safe non-destructive migration by default (skips existing records unless `$overwrite = true`).
 *
 * @param array<string, mixed> $bundle
 * @return array<string, array<string, int>>
 */
function outbound_execute_bundle_import(array $bundle, bool $sideload_media = false, bool $overwrite = false): array {
    if (function_exists('set_time_limit')) {
        @set_time_limit(120);
    }
    outbound_ensure_core_pages();

    // Ensure any bundle missing top-level collections falls back cleanly to built-in default snapshot collections.
    $fallback = function_exists('outbound_get_baseline_snapshot') ? outbound_get_baseline_snapshot() : array();

    $counts = array(
        'accommodation' => array('created' => 0, 'updated' => 0, 'skipped' => 0),
        'experience'    => array('created' => 0, 'updated' => 0, 'skipped' => 0),
        'package'       => array('created' => 0, 'updated' => 0, 'skipped' => 0),
        'guide_article' => array('created' => 0, 'updated' => 0, 'skipped' => 0),
        'client_album'  => array('created' => 0, 'updated' => 0, 'skipped' => 0),
        'post'          => array('created' => 0, 'updated' => 0, 'skipped' => 0),
    );

    foreach ((array) ($bundle['accommodations'] ?? ($fallback['accommodations'] ?? array())) as $acc) {
        $mapped = outbound_map_accommodation_migration_record((array) $acc);
        $act    = null;
        $pid    = outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media, $overwrite, $act);
        if ($pid > 0 && $act !== 'skipped') {
            wp_set_object_terms($pid, array($mapped['category_id']), 'accommodation_category');
        }
        if ($act && isset($counts['accommodation'][$act])) {
            $counts['accommodation'][$act]++;
        }
    }

    foreach ((array) ($bundle['experiences'] ?? ($fallback['experiences'] ?? array())) as $exp) {
        $mapped = outbound_map_experience_migration_record((array) $exp);
        $act    = null;
        $pid    = outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media, $overwrite, $act);
        if ($pid > 0 && $act !== 'skipped') {
            wp_set_object_terms($pid, (array) $mapped['categories'], 'experience_category');
        }
        if ($act && isset($counts['experience'][$act])) {
            $counts['experience'][$act]++;
        }
    }

    foreach ((array) ($bundle['packages'] ?? ($fallback['packages'] ?? array())) as $pkg) {
        $mapped = outbound_map_package_migration_record((array) $pkg);
        $act    = null;
        outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media, $overwrite, $act);
        if ($act && isset($counts['package'][$act])) {
            $counts['package'][$act]++;
        }
    }

    $guides_list = (array) ($bundle['guides'] ?? ($fallback['guides'] ?? array()));
    foreach ($guides_list as $guide) {
        $g_arr  = (array) $guide;
        $mapped = outbound_map_guide_migration_record($g_arr);
        $act    = null;
        outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media, $overwrite, $act);
        if ($act && isset($counts['guide_article'][$act])) {
            $counts['guide_article'][$act]++;
        }

        if (empty($bundle['blogPosts'])) {
            $slug    = (string) $mapped['post_name'];
            $img     = (string) ($mapped['meta']['_outbound_hero_image_url'] ?? '');
            $b_act   = null;
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
                $sideload_media,
                $overwrite,
                $b_act
            );
            if ($blog_id > 0 && $b_act !== 'skipped') {
                wp_set_object_terms($blog_id, array('victoria-falls-travel-guides'), 'category');
            }
            if ($b_act && isset($counts['post'][$b_act])) {
                $counts['post'][$b_act]++;
            }
        }
    }

    $albums_list = (array) ($bundle['clientGalleries'] ?? ($bundle['albums'] ?? ($fallback['albums'] ?? array())));
    foreach ($albums_list as $album) {
        $mapped = outbound_map_album_migration_record((array) $album);
        $act    = null;
        outbound_upsert_migrated_post($mapped, $mapped['meta'], $sideload_media, $overwrite, $act);
        if ($act && isset($counts['client_album'][$act])) {
            $counts['client_album'][$act]++;
        }
    }

    $stay_tiers = $bundle['stayTiers'] ?? ($fallback['stayTiers'] ?? array());
    if (!empty($stay_tiers) && ($overwrite || empty(get_option('outbound_builder_stay_tiers', array())))) {
        update_option('outbound_builder_stay_tiers', $stay_tiers);
    }
    $builder_acts = $bundle['builderActivities'] ?? ($fallback['builderActivities'] ?? array());
    if (!empty($builder_acts) && ($overwrite || empty(get_option('outbound_builder_activities', array())))) {
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
 * Safely assign stable unique IDs and backfill missing legacy room structures on existing
 * WordPress `accommodation` posts without overwriting any user-edited names, rates, or images.
 *
 * @return array{scanned:int,updated:int}
 */
function outbound_upgrade_existing_accommodation_rooms(): array {
    $stats = array('scanned' => 0, 'updated' => 0);
    if (!function_exists('get_posts') || !function_exists('get_post_meta') || !function_exists('update_post_meta')) {
        return $stats;
    }

    $posts = get_posts(array(
        'post_type'              => 'accommodation',
        'posts_per_page'         => -1,
        'post_status'            => array('publish', 'draft', 'pending', 'private'),
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
    ));
    if (empty($posts)) {
        return $stats;
    }

    $indexed = array();
    if (function_exists('outbound_get_baseline_snapshot') && function_exists('outbound_index_snapshot_records')) {
        $indexed = outbound_index_snapshot_records(outbound_get_baseline_snapshot()['accommodations'] ?? array());
    }

    foreach ($posts as $p) {
        $stats['scanned']++;
        $pid  = (int) $p->ID;
        $slug = sanitize_title((string) $p->post_name);
        $raw  = get_post_meta($pid, '_outbound_room_types_json', true);

        $rooms = null;
        $needs_write = false;

        if (is_string($raw) && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $rooms = $decoded;
            }
        }

        // Only backfill when `_outbound_room_types_json` has never been saved at all (not `'[]'`).
        if ($rooms === null) {
            $full_raw = get_post_meta($pid, '_outbound_full_json', true);
            $full     = is_string($full_raw) && $full_raw !== '' ? json_decode($full_raw, true) : null;
            if (is_array($full) && !empty($full['roomTypes']) && is_array($full['roomTypes'])) {
                $rooms = $full['roomTypes'];
                $needs_write = true;
            } elseif ($slug !== '' && !empty($indexed[$slug]['roomTypes']) && is_array($indexed[$slug]['roomTypes'])) {
                $rooms = $indexed[$slug]['roomTypes'];
                $needs_write = true;
            } else {
                $rooms = array();
            }
        }

        $normalized = array();
        foreach (array_values($rooms) as $ridx => $rm) {
            if (!is_array($rm)) {
                continue;
            }
            if (empty($rm['id'])) {
                $base_slug = sanitize_title((string) ($rm['name'] ?? ($slug ?: 'room')));
                $rm['id']  = 'unit_' . ($base_slug !== '' ? $base_slug : 'room') . '_' . ($ridx + 1);
                $needs_write = true;
            }
            $normalized[] = $rm;
        }

        if ($needs_write) {
            update_post_meta($pid, '_outbound_room_types_json', wp_json_encode($normalized));
            $stats['updated']++;
        }
    }

    if ($stats['updated'] > 0 && function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return $stats;
}

/**
 * Find any baseline catalog properties in default-snapshot.json that do not yet have a WordPress `accommodation` post.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_get_unimported_baseline_accommodations(): array {
    if (!function_exists('outbound_get_baseline_snapshot') || !function_exists('get_posts')) {
        return array();
    }

    $snap = outbound_get_baseline_snapshot();
    $baseline = (array) ($snap['accommodations'] ?? array());
    if (empty($baseline)) {
        return array();
    }

    $existing_posts = get_posts(array(
        'post_type'      => 'accommodation',
        'posts_per_page' => -1,
        'post_status'    => array('publish', 'draft', 'pending', 'private', 'archived', 'trash'),
        'fields'         => 'all',
        'no_found_rows'  => true,
    ));

    $existing_slugs = array();
    foreach ($existing_posts as $ep) {
        if ($ep instanceof WP_Post && $ep->post_name !== '') {
            $existing_slugs[sanitize_title((string) $ep->post_name)] = true;
        }
    }

    $missing = array();
    foreach ($baseline as $item) {
        if (!is_array($item)) {
            continue;
        }
        $slug = sanitize_title((string) ($item['slug'] ?? ($item['id'] ?? '')));
        if ($slug !== '' && empty($existing_slugs[$slug])) {
            $missing[] = $item;
        }
    }
    return $missing;
}

/**
 * Ensure a single baseline accommodation property exists as a WordPress CPT post so it can be edited
 * immediately with the dynamic Room / Unit Manager without affecting existing WP posts.
 */
function outbound_ensure_baseline_accommodation_post(string $slug): int {
    $clean_slug = sanitize_title($slug);
    if ($clean_slug === '' || !function_exists('get_page_by_path')) {
        return 0;
    }

    $existing = get_page_by_path($clean_slug, defined('OBJECT') ? OBJECT : 'OBJECT', 'accommodation');
    if ($existing instanceof WP_Post) {
        return (int) $existing->ID;
    }

    if (!function_exists('outbound_get_baseline_snapshot')) {
        return 0;
    }
    $snap = outbound_get_baseline_snapshot();
    foreach ((array) ($snap['accommodations'] ?? array()) as $item) {
        if (!is_array($item)) {
            continue;
        }
        $item_slug = sanitize_title((string) ($item['slug'] ?? ($item['id'] ?? '')));
        if ($item_slug !== $clean_slug) {
            continue;
        }
        $mapped = outbound_map_accommodation_migration_record($item);
        $act    = null;
        $pid    = outbound_upsert_migrated_post($mapped, $mapped['meta'], false, false, $act);
        if ($pid > 0 && $act !== 'skipped' && function_exists('wp_set_object_terms')) {
            wp_set_object_terms($pid, array($mapped['category_id']), 'accommodation_category');
        }
        if (function_exists('outbound_invalidate_snapshot_cache')) {
            outbound_invalidate_snapshot_cache();
        }
        return $pid;
    }

    return 0;
}

/**
 * Safely import any missing baseline properties into WordPress `accommodation` CPT posts
 * without touching or overwriting existing WP accommodation posts.
 *
 * @return array{created:int,existing:int}
 */
function outbound_sync_missing_baseline_accommodations(): array {
    $counts = array('created' => 0, 'existing' => 0);
    if (!function_exists('outbound_get_baseline_snapshot')) {
        return $counts;
    }
    $snap = outbound_get_baseline_snapshot();
    foreach ((array) ($snap['accommodations'] ?? array()) as $acc) {
        if (!is_array($acc)) {
            continue;
        }
        $mapped = outbound_map_accommodation_migration_record($acc);
        $act    = null;
        $pid    = outbound_upsert_migrated_post($mapped, $mapped['meta'], false, false, $act);
        if ($pid > 0 && $act === 'created') {
            if (function_exists('wp_set_object_terms')) {
                wp_set_object_terms($pid, array($mapped['category_id']), 'accommodation_category');
            }
            $counts['created']++;
        } else {
            $counts['existing']++;
        }
    }
    outbound_upgrade_existing_accommodation_rooms();
    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }
    return $counts;
}

/**
 * Safely auto-seed CPT records once in WordPress admin when CPTs are completely empty,
 * avoiding heavy remote sideloading so it never causes 502 timeouts, and ensure existing
 * accommodation room types receive stable IDs.
 */
function outbound_maybe_auto_seed_initial_content(): void {
    if (!function_exists('is_admin') || !is_admin() || !current_user_can('manage_options')) {
        return;
    }

    if (get_option('outbound_rooms_upgraded_version', '') !== '1.5.0') {
        outbound_upgrade_existing_accommodation_rooms();
        update_option('outbound_rooms_upgraded_version', '1.5.0', false);
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
            outbound_execute_bundle_import($decoded, false, false);
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

    $result  = null;
    $preview = null;
    $error   = '';

    $resolve_overwrite = static function () use (&$error): ?bool {
        $wants_overwrite = !empty($_POST['overwrite_existing']);
        if (!$wants_overwrite) {
            return false;
        }
        if (empty($_POST['confirm_overwrite'])) {
            $error = __('Destructive overwrite was requested, but the explicit confirmation checkbox was not ticked. Import aborted; existing CMS content is untouched.', 'outbound-holidays');
            return null;
        }
        return true;
    };

    if ((isset($_POST['outbound_preview_bundled']) || isset($_POST['outbound_seed_bundled'])) && check_admin_referer('outbound_migrate_action', 'outbound_migrate_nonce')) {
        $sideload  = !empty($_POST['sideload_media']);
        $is_dry    = isset($_POST['outbound_preview_bundled']);
        $overwrite = $is_dry ? !empty($_POST['overwrite_existing']) : $resolve_overwrite();
        if ($overwrite !== null) {
            $bundled = OUTBOUND_THEME_DIR . '/inc/default-snapshot.json';
            if (file_exists($bundled)) {
                $decoded = json_decode((string) file_get_contents($bundled), true);
                if (is_array($decoded)) {
                    if ($is_dry) {
                        $preview = outbound_preview_bundle_import($decoded, $overwrite);
                    } else {
                        $result = outbound_execute_bundle_import($decoded, $sideload, $overwrite);
                    }
                } else {
                    $error = __('Could not decode bundled theme snapshot.', 'outbound-holidays');
                }
            } else {
                $error = __('Bundled theme snapshot file inc/default-snapshot.json was not found.', 'outbound-holidays');
            }
        }
    }

    if ((isset($_POST['outbound_preview_import']) || isset($_POST['outbound_run_import'])) && check_admin_referer('outbound_migrate_action', 'outbound_migrate_nonce')) {
        $sideload  = !empty($_POST['sideload_media']);
        $is_dry    = isset($_POST['outbound_preview_import']);
        $overwrite = $is_dry ? !empty($_POST['overwrite_existing']) : $resolve_overwrite();
        if ($overwrite !== null) {
            if (!empty($_FILES['bundle_file']['tmp_name'])) {
                $raw     = file_get_contents((string) $_FILES['bundle_file']['tmp_name']);
                $decoded = json_decode((string) $raw, true);
                if (is_array($decoded)) {
                    if ($is_dry) {
                        $preview = outbound_preview_bundle_import($decoded, $overwrite);
                    } else {
                        $result = outbound_execute_bundle_import($decoded, $sideload, $overwrite);
                    }
                } else {
                    $error = __('Invalid JSON structure in uploaded bundle file.', 'outbound-holidays');
                }
            } else {
                $error = __('Please choose the exported outbound-migration-bundle.json file first.', 'outbound-holidays');
            }
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
                <p><?php esc_html_e('Safe by default: existing WordPress CMS records, room types, galleries, prices, and descriptions are skipped and preserved unless you explicitly confirm a destructive overwrite.', 'outbound-holidays'); ?></p>
            </div>
        </div>

        <?php if ($error !== '') : ?>
            <div class="notice notice-error"><p><?php echo esc_html($error); ?></p></div>
        <?php endif; ?>
        <?php if ($result !== null) : ?>
            <div class="notice notice-success"><p><?php echo esc_html('Migration complete: ' . wp_json_encode($result)); ?></p></div>
        <?php endif; ?>
        <?php if ($preview !== null) : ?>
            <div class="outbound-admin-card" style="border-left:4px solid #0B5E8E;">
                <h2><?php esc_html_e('Dry-Run Preview (No Changes Applied Yet)', 'outbound-holidays'); ?></h2>
                <table class="widefat striped">
                    <thead><tr><th><?php esc_html_e('Content Type', 'outbound-holidays'); ?></th><th><?php esc_html_e('Will Create (New)', 'outbound-holidays'); ?></th><th><?php esc_html_e('Will Skip (Protected)', 'outbound-holidays'); ?></th><th><?php esc_html_e('Will Overwrite', 'outbound-holidays'); ?></th></tr></thead>
                    <tbody>
                        <?php foreach ((array) ($preview['summary'] ?? array()) as $label => $cnts) : ?>
                            <tr>
                                <td><strong><?php echo esc_html((string) $label); ?></strong></td>
                                <td><?php echo esc_html((string) ($cnts['create'] ?? 0)); ?></td>
                                <td><?php echo esc_html((string) ($cnts['skip'] ?? 0)); ?></td>
                                <td style="<?php echo !empty($cnts['overwrite']) ? 'color:#b91c1c;font-weight:700;' : ''; ?>"><?php echo esc_html((string) ($cnts['overwrite'] ?? 0)); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>

        <div class="outbound-admin-card">
            <h2><?php esc_html_e('Quick Seed from Built-in Theme Snapshot', 'outbound-holidays'); ?></h2>
            <p><?php esc_html_e('Adds any missing Accommodations, Experiences, Packages, Guides, and Client Albums from inc/default-snapshot.json. Existing CMS-edited records are skipped by default.', 'outbound-holidays'); ?></p>
            <form method="post" onsubmit="if (this.overwrite_existing && this.overwrite_existing.checked && (!this.confirm_overwrite || !this.confirm_overwrite.checked)) { alert('Please tick the explicit confirmation checkbox to allow overwriting existing CMS records.'); return false; } if (this.overwrite_existing && this.overwrite_existing.checked) { return confirm('WARNING: This will overwrite existing WordPress CMS records with bundled theme defaults. Continue?'); } return true;">
                <?php wp_nonce_field('outbound_migrate_action', 'outbound_migrate_nonce'); ?>
                <p><label><input type="checkbox" name="sideload_media" value="1"> <?php esc_html_e('Download & register remote hero images into WordPress Media Library (leave unchecked on slow/shared hosts to avoid 502 timeouts; bundled assets already work locally).', 'outbound-holidays'); ?></label></p>
                <p><label style="color:#991b1b;"><input type="checkbox" name="overwrite_existing" value="1"> <?php esc_html_e('Overwrite existing CMS records (DESTRUCTIVE — replaces existing descriptions, prices, room types, and galleries with theme defaults)', 'outbound-holidays'); ?></label></p>
                <p><label style="color:#991b1b;font-weight:600;"><input type="checkbox" name="confirm_overwrite" value="1"> <?php esc_html_e('I confirm I have a database backup and want to overwrite existing records', 'outbound-holidays'); ?></label></p>
                <p>
                    <button type="submit" name="outbound_preview_bundled" class="button button-secondary"><?php esc_html_e('Preview Changes (Dry Run)', 'outbound-holidays'); ?></button>
                    <button type="submit" name="outbound_seed_bundled" class="button button-primary"><?php esc_html_e('Import Missing Records (Safe Mode)', 'outbound-holidays'); ?></button>
                </p>
            </form>
        </div>

        <div class="outbound-admin-card">
            <h2><?php esc_html_e('Or Upload Custom Export Bundle', 'outbound-holidays'); ?></h2>
            <form method="post" enctype="multipart/form-data" onsubmit="if (this.overwrite_existing && this.overwrite_existing.checked && (!this.confirm_overwrite || !this.confirm_overwrite.checked)) { alert('Please tick the explicit confirmation checkbox to allow overwriting existing CMS records.'); return false; } if (this.overwrite_existing && this.overwrite_existing.checked) { return confirm('WARNING: This will overwrite existing WordPress CMS records with the uploaded bundle. Continue?'); } return true;">
                <?php wp_nonce_field('outbound_migrate_action', 'outbound_migrate_nonce'); ?>
                <p><input type="file" name="bundle_file" accept=".json,application/json"></p>
                <p><label><input type="checkbox" name="sideload_media" value="1"> <?php esc_html_e('Attempt Media Library attachment download on import', 'outbound-holidays'); ?></label></p>
                <p><label style="color:#991b1b;"><input type="checkbox" name="overwrite_existing" value="1"> <?php esc_html_e('Overwrite existing CMS records (DESTRUCTIVE)', 'outbound-holidays'); ?></label></p>
                <p><label style="color:#991b1b;font-weight:600;"><input type="checkbox" name="confirm_overwrite" value="1"> <?php esc_html_e('I confirm I want to overwrite existing records', 'outbound-holidays'); ?></label></p>
                <p>
                    <button type="submit" name="outbound_preview_import" class="button button-secondary"><?php esc_html_e('Preview Bundle (Dry Run)', 'outbound-holidays'); ?></button>
                    <button type="submit" name="outbound_run_import" class="button button-secondary"><?php esc_html_e('Run Bundle Import', 'outbound-holidays'); ?></button>
                </p>
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
    WP_CLI::add_command('outbound migrate', static function (array $args, array $assoc_args = array()): void {
        $file = $args[0] ?? (OUTBOUND_THEME_DIR . '/inc/default-snapshot.json');
        if (!file_exists($file)) {
            WP_CLI::error("Migration bundle file not found: {$file}");
        }
        $decoded = json_decode((string) file_get_contents($file), true);
        if (!is_array($decoded)) {
            WP_CLI::error('Failed to decode migration bundle JSON.');
        }
        $overwrite = !empty($assoc_args['overwrite']);
        $counts    = outbound_execute_bundle_import($decoded, false, $overwrite);
        WP_CLI::success('Migrated records: ' . wp_json_encode($counts));
    });
}

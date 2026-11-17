<?php
/**
 * Outbound Holidays — Full Accommodation, Room/Unit, Rate Plan, Offer & Shared Library CRUD Service + REST API.
 * Enforces capability checks, nonce verification (via WP REST / admin handlers), input sanitization,
 * safe two-step Trash -> Permanent Deletion with dependency inspection, and immediate snapshot cache invalidation.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Capability helper for Accommodation CMS operations.
 */
function outbound_can_manage_accommodations(string $action = 'edit', int $post_id = 0): bool {
    if (!function_exists('current_user_can')) {
        return false;
    }
    if (current_user_can('manage_options')) {
        return true;
    }
    return match ($action) {
        'publish', 'unpublish', 'archive', 'featured' => current_user_can('publish_posts'),
        'trash', 'restore', 'delete' => $post_id > 0 ? current_user_can('delete_post', $post_id) : current_user_can('delete_posts'),
        default => $post_id > 0 ? current_user_can('edit_post', $post_id) : current_user_can('edit_posts'),
    };
}

/**
 * Count accommodation posts across each lifecycle status for dashboard filter tabs.
 *
 * @return array{all:int,publish:int,draft:int,archived:int,trash:int}
 */
function outbound_get_accommodation_status_counts(): array {
    $out = array('all' => 0, 'publish' => 0, 'draft' => 0, 'archived' => 0, 'trash' => 0);
    if (!function_exists('wp_count_posts')) {
        return $out;
    }
    $c = wp_count_posts('accommodation');
    $out['publish']  = isset($c->publish) ? (int) $c->publish : 0;
    $out['draft']    = (isset($c->draft) ? (int) $c->draft : 0) + (isset($c->pending) ? (int) $c->pending : 0) + (isset($c->private) ? (int) $c->private : 0);
    $out['archived'] = isset($c->archived) ? (int) $c->archived : 0;
    $out['trash']    = isset($c->trash) ? (int) $c->trash : 0;
    $out['all']      = $out['publish'] + $out['draft'] + $out['archived'];
    return $out;
}

/**
 * Query, filter, sort, and paginate Accommodation CPT records for the CMS Dashboard and REST API.
 *
 * @param array{
 *   status?:string,
 *   category?:string,
 *   search?:string,
 *   sort?:string,
 *   paged?:int,
 *   per_page?:int
 * } $args
 * @return array{
 *   items:array<int, array<string, mixed>>,
 *   total:int,
 *   total_pages:int,
 *   paged:int,
 *   per_page:int,
 *   counts:array{all:int,publish:int,draft:int,archived:int,trash:int}
 * }
 */
function outbound_query_admin_accommodations(array $args = array()): array {
    $counts   = outbound_get_accommodation_status_counts();
    $status   = sanitize_key((string) ($args['status'] ?? 'all'));
    $category = sanitize_title((string) ($args['category'] ?? 'all'));
    $search   = trim((string) ($args['search'] ?? ''));
    $sort     = sanitize_key((string) ($args['sort'] ?? 'menu_order'));
    $paged    = max(1, (int) ($args['paged'] ?? 1));
    $per_page = max(1, min(100, (int) ($args['per_page'] ?? 15)));

    if (!function_exists('get_posts')) {
        return array(
            'items'       => array(),
            'total'       => 0,
            'total_pages' => 1,
            'paged'       => 1,
            'per_page'    => $per_page,
            'counts'      => $counts,
        );
    }

    $post_statuses = match ($status) {
        'publish'  => array('publish'),
        'draft'    => array('draft', 'pending', 'private'),
        'archived' => array('archived'),
        'trash'    => array('trash'),
        default    => array('publish', 'draft', 'pending', 'private', 'archived'),
    };

    $posts = get_posts(array(
        'post_type'              => 'accommodation',
        'post_status'            => $post_statuses,
        'posts_per_page'         => -1,
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => true,
    ));

    $cat_defs = function_exists('outbound_get_accommodation_category_defs') ? outbound_get_accommodation_category_defs() : array();
    $rows = array();
    foreach ($posts as $p) {
        $pid   = (int) $p->ID;
        $title = (string) $p->post_title;
        $slug  = (string) $p->post_name;
        $loc   = function_exists('get_post_meta') ? (string) get_post_meta($pid, '_outbound_location', true) : '';

        if ($search !== '') {
            $haystack = strtolower($title . ' ' . $slug . ' ' . $loc);
            if (!str_contains($haystack, strtolower($search))) {
                continue;
            }
        }

        $cat_id = function_exists('get_post_meta') ? (string) get_post_meta($pid, '_outbound_category_id', true) : '';
        if ($cat_id === '' && function_exists('wp_get_post_terms')) {
            $terms = wp_get_post_terms($pid, 'accommodation_category', array('fields' => 'slugs'));
            if (is_array($terms) && !empty($terms[0])) {
                $cat_id = (string) $terms[0];
            }
        }
        $cat_id = $cat_id !== '' ? $cat_id : 'lodges';
        if ($category !== '' && $category !== 'all' && $cat_id !== $category) {
            continue;
        }

        $cat_label = function_exists('get_post_meta') ? (string) get_post_meta($pid, '_outbound_category_label', true) : '';
        if ($cat_label === '') {
            $cat_label = (string) ($cat_defs[$cat_id]['singular'] ?? ucfirst($cat_id));
        }

        $price_raw = function_exists('get_post_meta') ? (string) get_post_meta($pid, '_outbound_price_usd', true) : '0';
        $price_usd = is_numeric($price_raw) ? (float) $price_raw : 0.0;
        $featured  = function_exists('get_post_meta') && get_post_meta($pid, '_outbound_featured', true) === '1';

        $img = function_exists('get_post_meta') ? (string) get_post_meta($pid, '_outbound_hero_image_url', true) : '';
        if ($img === '' && function_exists('outbound_get_post_image_url')) {
            $img = outbound_get_post_image_url($pid, 'thumbnail', 'hero');
        }

        $raw_rooms_meta = function_exists('get_post_meta') ? get_post_meta($pid, '_outbound_room_types_json', true) : '';
        $rooms_arr = is_string($raw_rooms_meta) && trim($raw_rooms_meta) !== '' ? json_decode($raw_rooms_meta, true) : null;
        if (!is_array($rooms_arr) && function_exists('outbound_editor_load_effective_record')) {
            $eff = outbound_editor_load_effective_record($pid, 'accommodation');
            $rooms_arr = (array) ($eff['roomTypes'] ?? array());
        }
        $rooms_arr = is_array($rooms_arr) ? $rooms_arr : array();

        $active_units  = 0;
        $draft_units   = 0;
        $trashed_units = 0;
        foreach ($rooms_arr as $rm) {
            if (!is_array($rm)) { continue; }
            $rs = (string) ($rm['status'] ?? 'published');
            if ($rs === 'trashed') {
                $trashed_units++;
            } elseif ($rs === 'draft' || $rs === 'archived') {
                $draft_units++;
            } else {
                $active_units++;
            }
        }
        $total_non_trashed_units = $active_units + $draft_units;

        $rows[] = array(
            'id'              => $pid,
            'title'           => $title,
            'slug'            => $slug,
            'status'          => (string) $p->post_status,
            'categoryId'      => $cat_id,
            'categoryLabel'   => $cat_label,
            'location'        => $loc,
            'priceFromUSD'    => $price_usd,
            'featured'        => $featured,
            'menuOrder'       => (int) ($p->menu_order ?? 0),
            'imageUrl'        => $img,
            'unitsTotal'      => $total_non_trashed_units,
            'unitsPublished'  => $active_units,
            'unitsDraft'      => $draft_units,
            'unitsTrashed'    => $trashed_units,
            'modified'        => (string) ($p->post_modified_gmt ?? ''),
        );
    }

    usort($rows, static function (array $a, array $b) use ($sort): int {
        return match ($sort) {
            'title_asc'  => strcasecmp($a['title'], $b['title']),
            'title_desc' => strcasecmp($b['title'], $a['title']),
            'price_asc'  => $a['priceFromUSD'] <=> $b['priceFromUSD'],
            'price_desc' => $b['priceFromUSD'] <=> $a['priceFromUSD'],
            'units_desc' => $b['unitsTotal'] <=> $a['unitsTotal'],
            'date_desc'  => strcmp($b['modified'], $a['modified']),
            default      => ($a['menuOrder'] <=> $b['menuOrder']) ?: ($a['id'] <=> $b['id']),
        };
    });

    $total       = count($rows);
    $total_pages = max(1, (int) ceil($total / $per_page));
    $paged       = min($paged, $total_pages);
    $offset      = ($paged - 1) * $per_page;
    $slice       = array_slice($rows, $offset, $per_page);

    return array(
        'items'       => $slice,
        'total'       => $total,
        'total_pages' => $total_pages,
        'paged'       => $paged,
        'per_page'    => $per_page,
        'counts'      => $counts,
    );
}

/**
 * Duplicate an existing accommodation property cleanly as a Draft with fresh stable IDs for units, rate plans, and offers.
 *
 * @return array{ok:bool,post_id?:int,title?:string,slug?:string,error?:string}
 */
function outbound_duplicate_accommodation_post(int $post_id): array {
    if (!function_exists('get_post') || !function_exists('wp_insert_post')) {
        return array('ok' => false, 'error' => 'WordPress post functions unavailable.');
    }
    $orig = get_post($post_id);
    if (!$orig || $orig->post_type !== 'accommodation') {
        return array('ok' => false, 'error' => 'Accommodation property not found.');
    }

    $new_title = trim((string) $orig->post_title) . ' (Copy)';
    $base_slug = sanitize_title((string) $orig->post_name ?: $orig->post_title) . '-copy';
    if (function_exists('wp_unique_post_slug')) {
        $new_slug = wp_unique_post_slug($base_slug, 0, 'draft', 'accommodation', 0);
    } else {
        $new_slug = $base_slug . '-' . substr(md5((string) microtime(true)), 0, 5);
    }

    $new_id = wp_insert_post(array(
        'post_type'    => 'accommodation',
        'post_title'   => $new_title,
        'post_name'    => $new_slug,
        'post_status'  => 'draft',
        'post_excerpt' => (string) $orig->post_excerpt,
        'post_content' => (string) $orig->post_content,
        'menu_order'   => (int) $orig->menu_order,
    ), true);

    if (is_wp_error($new_id) || !$new_id) {
        return array('ok' => false, 'error' => is_wp_error($new_id) ? $new_id->get_error_message() : 'Failed to duplicate property.');
    }
    $new_id = (int) $new_id;

    // Copy taxonomy terms
    if (function_exists('wp_get_post_terms') && function_exists('wp_set_object_terms')) {
        $terms = wp_get_post_terms($post_id, 'accommodation_category', array('fields' => 'slugs'));
        if (is_array($terms) && !empty($terms)) {
            wp_set_object_terms($new_id, $terms, 'accommodation_category', false);
        }
    }

    // Copy all `_outbound_*` and `_thumbnail_id` postmeta, regenerating unit/rate/offer IDs cleanly
    $all_meta = function_exists('get_post_meta') ? get_post_meta($post_id) : array();
    $unit_id_map = array();
    if (is_array($all_meta)) {
        foreach ($all_meta as $mkey => $vals) {
            if (!is_string($mkey) || (!str_starts_with($mkey, '_outbound_') && $mkey !== '_thumbnail_id')) {
                continue;
            }
            $val = is_array($vals) ? ($vals[0] ?? '') : $vals;
            if ($mkey === '_outbound_featured') {
                update_post_meta($new_id, $mkey, '0');
                continue;
            }
            if ($mkey === '_outbound_room_types_json' && is_string($val)) {
                $rooms = json_decode($val, true);
                if (is_array($rooms)) {
                    $new_rooms = array();
                    foreach ($rooms as $rm) {
                        if (!is_array($rm)) { continue; }
                        if (($rm['status'] ?? '') === 'trashed') { continue; }
                        $old_uid = (string) ($rm['id'] ?? '');
                        $new_uid = outbound_generate_unit_id();
                        if ($old_uid !== '') {
                            $unit_id_map[$old_uid] = $new_uid;
                        }
                        $rm['id'] = $new_uid;
                        $new_rooms[] = $rm;
                    }
                    update_post_meta($new_id, $mkey, wp_json_encode($new_rooms));
                    continue;
                }
            }
            update_post_meta($new_id, $mkey, $val);
        }
    }

    // Remap internal room data, rate plan IDs, and offer IDs
    $old_int = function_exists('get_post_meta') ? json_decode((string) get_post_meta($post_id, '_outbound_room_internal_json', true), true) : array();
    if (is_array($old_int) && !empty($unit_id_map)) {
        $new_int = array();
        foreach ($old_int as $old_uid => $idata) {
            if (isset($unit_id_map[$old_uid])) {
                $new_int[$unit_id_map[$old_uid]] = $idata;
            }
        }
        update_post_meta($new_id, '_outbound_room_internal_json', wp_json_encode($new_int));
    }

    $old_rps = function_exists('get_post_meta') ? json_decode((string) get_post_meta($post_id, '_outbound_rate_plans_json', true), true) : array();
    if (is_array($old_rps)) {
        $new_rps = array();
        foreach ($old_rps as $rp) {
            if (!is_array($rp)) { continue; }
            $rp['id'] = 'rp_' . substr(outbound_generate_unit_id(), 5);
            if (!empty($rp['applicableUnitIds']) && is_array($rp['applicableUnitIds'])) {
                $rp['applicableUnitIds'] = array_values(array_filter(array_map(
                    static fn($uid) => $unit_id_map[(string) $uid] ?? '',
                    $rp['applicableUnitIds']
                )));
            }
            $new_rps[] = $rp;
        }
        update_post_meta($new_id, '_outbound_rate_plans_json', wp_json_encode($new_rps));
    }

    $old_offs = function_exists('get_post_meta') ? json_decode((string) get_post_meta($post_id, '_outbound_property_offers_json', true), true) : array();
    if (is_array($old_offs)) {
        $new_offs = array();
        foreach ($old_offs as $off) {
            if (!is_array($off) || ($off['status'] ?? '') === 'trashed') { continue; }
            $off['id'] = 'offer_' . substr(outbound_generate_unit_id(), 5);
            if (!empty($off['applicableUnitIds']) && is_array($off['applicableUnitIds'])) {
                $off['applicableUnitIds'] = array_values(array_filter(array_map(
                    static fn($uid) => $unit_id_map[(string) $uid] ?? '',
                    $off['applicableUnitIds']
                )));
            }
            $new_offs[] = $off;
        }
        update_post_meta($new_id, '_outbound_property_offers_json', wp_json_encode($new_offs));
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return array(
        'ok'      => true,
        'post_id' => $new_id,
        'title'   => $new_title,
        'slug'    => $new_slug,
    );
}

/**
 * Transition an accommodation property's lifecycle status safely:
 * 'publish' | 'draft' | 'archived' | 'trash' | 'restore'
 *
 * @return array{ok:bool,post_id:int,status?:string,error?:string}
 */
function outbound_change_accommodation_status(int $post_id, string $action): array {
    $cap_action = match (sanitize_key($action)) {
        'publish'             => 'publish',
        'unpublish', 'draft'  => 'unpublish',
        'archive', 'archived' => 'archive',
        'trash', 'restore'    => $action,
        default               => 'edit',
    };
    if (function_exists('current_user_can') && !outbound_can_manage_accommodations($cap_action, $post_id)) {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'Unauthorized: insufficient permissions to change accommodation status.');
    }
    if (!function_exists('get_post')) {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'WordPress post functions unavailable.');
    }
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'accommodation') {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'Accommodation property not found.');
    }

    $action = sanitize_key($action);
    $is_err = static fn($v): bool => function_exists('is_wp_error') && is_wp_error($v);
    if ($action === 'trash') {
        $res = function_exists('wp_trash_post') ? wp_trash_post($post_id) : wp_update_post(array('ID' => $post_id, 'post_status' => 'trash'), true);
        if (!$res || $is_err($res)) {
            return array('ok' => false, 'post_id' => $post_id, 'error' => 'Failed to move property to Trash.');
        }
        if (function_exists('outbound_invalidate_snapshot_cache')) {
            outbound_invalidate_snapshot_cache();
        }
        return array('ok' => true, 'post_id' => $post_id, 'status' => 'trash');
    }

    if ($action === 'restore') {
        if ($post->post_status === 'trash' && function_exists('wp_untrash_post')) {
            wp_untrash_post($post_id);
        }
        // Restore cleanly to 'draft' so admin explicitly reviews and republishes when ready.
        $res = wp_update_post(array('ID' => $post_id, 'post_status' => 'draft'), true);
        if ($is_err($res) || !$res) {
            return array('ok' => false, 'post_id' => $post_id, 'error' => 'Failed to restore property from Trash.');
        }
        if (function_exists('outbound_invalidate_snapshot_cache')) {
            outbound_invalidate_snapshot_cache();
        }
        return array('ok' => true, 'post_id' => $post_id, 'status' => 'draft');
    }

    $target = match ($action) {
        'publish'  => 'publish',
        'unpublish', 'draft' => 'draft',
        'archive', 'archived' => 'archived',
        default    => '',
    };
    if ($target === '') {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'Unsupported status action: ' . $action);
    }

    $res = wp_update_post(array('ID' => $post_id, 'post_status' => $target), true);
    if ($is_err($res) || !$res) {
        return array('ok' => false, 'post_id' => $post_id, 'error' => ($is_err($res) && method_exists($res, 'get_error_message')) ? $res->get_error_message() : 'Failed to update status.');
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return array('ok' => true, 'post_id' => $post_id, 'status' => $target);
}

/**
 * Inspect dependent records owned by an accommodation property before Trash or Permanent Deletion.
 * Explicitly separates owned records (units, property-scoped rates/offers, gallery references)
 * from preserved external assets (WordPress Media Library files, shared amenity/template definitions).
 *
 * @return array<string, mixed>
 */
function outbound_get_accommodation_delete_impact(int $post_id): array {
    $post = function_exists('get_post') ? get_post($post_id) : null;
    if (!$post || $post->post_type !== 'accommodation') {
        return array('exists' => false, 'post_id' => $post_id);
    }

    $rooms = function_exists('outbound_editor_get_json_meta') ? outbound_editor_get_json_meta($post_id, '_outbound_room_types_json', array()) : array();
    $plans = function_exists('outbound_editor_get_json_meta') ? outbound_editor_get_json_meta($post_id, '_outbound_rate_plans_json', array()) : array();
    $offers = function_exists('outbound_editor_get_json_meta') ? outbound_editor_get_json_meta($post_id, '_outbound_property_offers_json', array()) : array();
    $gallery = function_exists('outbound_editor_get_json_meta') ? outbound_editor_get_json_meta($post_id, '_outbound_gallery_json', array()) : array();
    $amenities = function_exists('outbound_editor_get_json_meta') ? outbound_editor_get_json_meta($post_id, '_outbound_amenities_json', array()) : array();

    $unit_names = array();
    $room_photos = 0;
    foreach ((array) $rooms as $rm) {
        if (!is_array($rm)) { continue; }
        $unit_names[] = (string) ($rm['name'] ?? ($rm['id'] ?? 'Unit'));
        if (!empty($rm['imageUrl'])) { $room_photos++; }
        $room_photos += count((array) ($rm['gallery'] ?? array()));
    }

    return array(
        'exists'                => true,
        'post_id'               => $post_id,
        'title'                 => (string) $post->post_title,
        'slug'                  => (string) $post->post_name,
        'status'                => (string) $post->post_status,
        'units_count'           => count($unit_names),
        'unit_names'            => $unit_names,
        'rate_plans_count'      => count((array) $plans),
        'offers_count'          => count((array) $offers),
        'media_refs_count'      => count((array) $gallery) + $room_photos,
        'shared_amenities_count'=> count((array) $amenities),
        'deletion_policy'       => 'Owned accommodation units, property-specific rate plans, special offers, and gallery associations will be permanently removed. Shared amenities/templates used by other properties and WordPress Media Library image files are preserved.',
    );
}

/**
 * Permanently delete an accommodation property and all owned postmeta/relationships without leaving orphaned DB records.
 * Requires explicit `$confirmed === true`. Never deletes Media Library files or shared amenity/rate definitions.
 *
 * @return array{ok:bool,requires_confirmation?:bool,impact?:array,error?:string}
 */
function outbound_permanently_delete_accommodation(int $post_id, bool $confirmed = false): array {
    if (function_exists('current_user_can') && !outbound_can_manage_accommodations('delete', $post_id)) {
        return array('ok' => false, 'error' => 'Unauthorized: insufficient permissions to permanently delete accommodations.');
    }
    $impact = outbound_get_accommodation_delete_impact($post_id);
    if (empty($impact['exists'])) {
        return array('ok' => false, 'error' => 'Accommodation property not found.');
    }
    if (!$confirmed) {
        return array(
            'ok'                    => false,
            'requires_confirmation' => true,
            'impact'                => $impact,
            'error'                 => 'Permanent deletion requires explicit confirmation.',
        );
    }

    $slug = (string) $impact['slug'];

    // 1. Clean featured references & draft references so no stale slug remains in wp_options
    if ($slug !== '' && function_exists('get_option') && function_exists('update_option')) {
        $feat = get_option('outbound_featured_overrides', array());
        if (is_array($feat) && !empty($feat['accommodationIds']) && is_array($feat['accommodationIds'])) {
            $feat['accommodationIds'] = array_values(array_filter(
                $feat['accommodationIds'],
                static fn($s) => (string) $s !== $slug
            ));
            update_option('outbound_featured_overrides', $feat, false);
        }
        $feat_items = get_option('outbound_featured_item_overrides', array());
        if (is_array($feat_items) && isset($feat_items['accommodations'][$slug])) {
            unset($feat_items['accommodations'][$slug]);
            update_option('outbound_featured_item_overrides', $feat_items, false);
        }
        $draft = get_option('outbound_cms_draft_state', array());
        if (is_array($draft)) {
            $dirty = false;
            if (!empty($draft['featured']['accommodationIds']) && is_array($draft['featured']['accommodationIds'])) {
                $draft['featured']['accommodationIds'] = array_values(array_filter(
                    $draft['featured']['accommodationIds'],
                    static fn($s) => (string) $s !== $slug
                ));
                $dirty = true;
            }
            if (isset($draft['featured_overrides']['accommodations'][$slug])) {
                unset($draft['featured_overrides']['accommodations'][$slug]);
                $dirty = true;
            }
            if ($dirty) {
                update_option('outbound_cms_draft_state', $draft, false);
            }
        }
    }

    // 2. Detach any Media Library attachments whose post_parent was this property (DO NOT delete attachment files!)
    if (function_exists('get_posts') && function_exists('wp_update_post')) {
        $children = get_posts(array(
            'post_type'      => 'attachment',
            'post_parent'    => $post_id,
            'posts_per_page' => -1,
            'post_status'    => 'any',
            'fields'         => 'ids',
        ));
        foreach ((array) $children as $att_id) {
            wp_update_post(array('ID' => (int) $att_id, 'post_parent' => 0));
        }
    }

    // 3. Delete taxonomy relationships
    if (function_exists('wp_delete_object_term_relationships')) {
        wp_delete_object_term_relationships($post_id, array('accommodation_category'));
    }

    // 4. Force-delete post & all owned postmeta + revisions
    if (function_exists('wp_delete_post')) {
        $deleted = wp_delete_post($post_id, true);
        if (!$deleted) {
            return array('ok' => false, 'error' => 'WordPress failed to permanently delete accommodation #' . $post_id);
        }
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return array('ok' => true, 'impact' => $impact);
}

/**
 * Execute a bulk action across selected accommodation property IDs.
 *
 * @param array<int, int|string> $post_ids
 * @return array{ok:bool,processed:int,errors:array<int, string>}
 */
function outbound_bulk_accommodation_action(array $post_ids, string $action, bool $confirmed = false): array {
    $ids       = array_values(array_unique(array_filter(array_map('intval', $post_ids), static fn($id) => $id > 0)));
    $processed = 0;
    $errors    = array();

    if (empty($ids)) {
        return array('ok' => false, 'processed' => 0, 'errors' => array('No accommodation properties selected.'));
    }

    foreach ($ids as $pid) {
        if ($action === 'delete' || $action === 'permanent_delete') {
            $res = outbound_permanently_delete_accommodation($pid, $confirmed);
        } else {
            $res = outbound_change_accommodation_status($pid, $action);
        }
        if (!empty($res['ok'])) {
            $processed++;
        } else {
            $errors[] = (string) ($res['error'] ?? ('Failed on #' . $pid));
        }
    }

    return array(
        'ok'        => $processed > 0 && empty($errors),
        'processed' => $processed,
        'errors'    => $errors,
    );
}

/**
 * Save featured properties list and display order cleanly into both `outbound_featured_overrides`
 * and `_outbound_featured` + `menu_order` on accommodation posts.
 *
 * @param array<int, string> $ordered_slugs
 * @return array{ok:bool,featuredIds:array<int, string>}
 */
function outbound_save_featured_accommodations_order(array $ordered_slugs): array {
    $clean_slugs = array_values(array_unique(array_filter(array_map(
        static fn($s) => sanitize_title((string) $s),
        $ordered_slugs
    ))));

    if (function_exists('get_option') && function_exists('update_option')) {
        $feat = get_option('outbound_featured_overrides', array());
        if (!is_array($feat)) {
            $feat = array();
        }
        $feat['accommodationIds'] = $clean_slugs;
        update_option('outbound_featured_overrides', $feat, false);

        // Clear any stale draft featured accommodationIds so live & preview match
        $draft = get_option('outbound_cms_draft_state', array());
        if (is_array($draft) && isset($draft['featured']['accommodationIds'])) {
            $draft['featured']['accommodationIds'] = $clean_slugs;
            update_option('outbound_cms_draft_state', $draft, false);
        }
    }

    if (function_exists('get_posts') && function_exists('update_post_meta')) {
        $posts = get_posts(array(
            'post_type'      => 'accommodation',
            'posts_per_page' => -1,
            'post_status'    => array('publish', 'draft', 'pending', 'private', 'archived'),
            'no_found_rows'  => true,
        ));
        $order_index = array_flip($clean_slugs);
        foreach ($posts as $p) {
            $pid  = (int) $p->ID;
            $slug = sanitize_title((string) $p->post_name);
            $is_feat = isset($order_index[$slug]);
            update_post_meta($pid, '_outbound_featured', $is_feat ? '1' : '0');
            if ($is_feat && function_exists('wp_update_post')) {
                wp_update_post(array('ID' => $pid, 'menu_order' => (int) $order_index[$slug] + 1));
            }
        }
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return array('ok' => true, 'featuredIds' => $clean_slugs);
}

/**
 * Load raw stored units for a property alongside admin-only internal notes/rates.
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_crud_load_property_units(int $post_id): array {
    $rooms = function_exists('outbound_editor_get_json_meta')
        ? outbound_editor_get_json_meta($post_id, '_outbound_room_types_json', array())
        : array();
    $internal = (outbound_can_manage_accommodations('edit', $post_id) && function_exists('outbound_editor_get_json_meta'))
        ? outbound_editor_get_json_meta($post_id, '_outbound_room_internal_json', array())
        : array();

    $out = array();
    foreach (array_values((array) $rooms) as $ridx => $rm) {
        if (!is_array($rm)) { continue; }
        $uid = !empty($rm['id']) ? (string) $rm['id'] : outbound_sanitize_unit_id('', $ridx + 1);
        $rm['id'] = $uid;
        if (isset($internal[$uid]) && is_array($internal[$uid])) {
            $rm['internalSupplierRate'] = (string) ($internal[$uid]['internalSupplierRate'] ?? '');
            $rm['internalNotes']        = (string) ($internal[$uid]['internalNotes'] ?? '');
        }
        $out[] = $rm;
    }
    return $out;
}

/**
 * Persist property units cleanly through the canonical sanitizer while isolating internal fields.
 *
 * @param array<int, array<string, mixed>> $units
 */
function outbound_crud_persist_property_units(int $post_id, array $units): array {
    $existing_internal = function_exists('outbound_editor_get_json_meta')
        ? outbound_editor_get_json_meta($post_id, '_outbound_room_internal_json', array())
        : array();
    $can_internal = function_exists('current_user_can') ? (bool) current_user_can('manage_options') : true;
    $sanitized = outbound_sanitize_room_types_payload(
        $units,
        is_array($existing_internal) ? $existing_internal : array(),
        $can_internal
    );
    update_post_meta($post_id, '_outbound_room_types_json', wp_json_encode($sanitized['public_rooms']));
    update_post_meta($post_id, '_outbound_room_internal_json', wp_json_encode($sanitized['internal_map']));
    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }
    return $sanitized['public_rooms'];
}

/**
 * List units for a property optionally filtered by status ('all', 'published', 'draft', 'archived', 'trashed').
 *
 * @return array<int, array<string, mixed>>
 */
function outbound_crud_list_units(int $post_id, string $status_filter = 'all'): array {
    $units = outbound_crud_load_property_units($post_id);
    if ($status_filter === 'all') {
        return array_values(array_filter($units, static fn($u) => ($u['status'] ?? 'published') !== 'trashed'));
    }
    return array_values(array_filter($units, static fn($u) => ($u['status'] ?? 'published') === $status_filter));
}

/**
 * Create or update a single unit on an accommodation property identified by stable `unit_id`.
 *
 * @param array<string, mixed> $unit_data
 * @return array{ok:bool,unit?:array<string, mixed>,units?:array<int, array<string, mixed>>,error?:string}
 */
function outbound_crud_upsert_unit(int $post_id, array $unit_data): array {
    $post = function_exists('get_post') ? get_post($post_id) : null;
    if (!$post || $post->post_type !== 'accommodation') {
        return array('ok' => false, 'error' => 'Accommodation property not found.');
    }
    $units   = outbound_crud_load_property_units($post_id);
    $unit_id = !empty($unit_data['id']) ? outbound_sanitize_unit_id((string) $unit_data['id'], 0) : '';
    $found   = -1;
    if ($unit_id !== '') {
        foreach ($units as $idx => $u) {
            if (($u['id'] ?? '') === $unit_id) {
                $found = $idx;
                break;
            }
        }
    }

    $has_name_key = array_key_exists('name', $unit_data);
    $name         = $has_name_key ? trim((string) $unit_data['name']) : ($found >= 0 ? (string) ($units[$found]['name'] ?? '') : '');
    if ($name === '') {
        return array('ok' => false, 'error' => 'Unit name is required.');
    }

    if ($found >= 0) {
        $unit_data['id']   = $unit_id;
        $unit_data['name'] = $name;
        $units[$found]     = array_merge($units[$found], $unit_data);
    } else {
        $unit_id           = $unit_id !== '' ? $unit_id : outbound_generate_unit_id();
        $unit_data['id']   = $unit_id;
        $unit_data['name'] = $name;
        $units[]           = $unit_data;
    }

    $saved = outbound_crud_persist_property_units($post_id, $units);
    $saved_unit = null;
    foreach ($saved as $su) {
        if (($su['id'] ?? '') === $unit_id) {
            $saved_unit = $su;
            break;
        }
    }
    return array('ok' => true, 'unit' => $saved_unit ?? $unit_data, 'units' => $saved);
}

/**
 * Duplicate a single unit by stable `unit_id` within an accommodation property.
 *
 * @return array{ok:bool,unit?:array<string, mixed>,error?:string}
 */
function outbound_crud_duplicate_unit(int $post_id, string $unit_id): array {
    $units = outbound_crud_load_property_units($post_id);
    foreach ($units as $idx => $u) {
        if (($u['id'] ?? '') === $unit_id) {
            $copy         = $u;
            $copy['id']   = outbound_generate_unit_id();
            $copy['name'] = (string) ($u['name'] ?? 'Unit') . ' (Copy)';
            $copy['status'] = 'draft';
            array_splice($units, $idx + 1, 0, array($copy));
            $saved = outbound_crud_persist_property_units($post_id, $units);
            foreach ($saved as $su) {
                if (($su['id'] ?? '') === $copy['id']) {
                    return array('ok' => true, 'unit' => $su);
                }
            }
            return array('ok' => true, 'unit' => $copy);
        }
    }
    return array('ok' => false, 'error' => 'Unit not found.');
}

/**
 * Reorder units on an accommodation property using an ordered array of stable `unit_id`s.
 *
 * @param array<int, string> $ordered_ids
 * @return array{ok:bool,units?:array<int, array<string, mixed>>,error?:string}
 */
function outbound_crud_reorder_units(int $post_id, array $ordered_ids): array {
    $units = outbound_crud_load_property_units($post_id);
    if (empty($units)) {
        return array('ok' => false, 'error' => 'No units found for this property.');
    }
    $by_id = array();
    foreach ($units as $u) {
        $by_id[(string) $u['id']] = $u;
    }
    $reordered = array();
    foreach ($ordered_ids as $oid) {
        $k = (string) $oid;
        if (isset($by_id[$k])) {
            $reordered[] = $by_id[$k];
            unset($by_id[$k]);
        }
    }
    foreach ($by_id as $remaining) {
        $reordered[] = $remaining;
    }
    $saved = outbound_crud_persist_property_units($post_id, $reordered);
    return array('ok' => true, 'units' => $saved);
}

/**
 * Transition a single unit's status ('published', 'draft', 'archived', 'trashed', 'restore').
 *
 * @return array{ok:bool,unit?:array<string, mixed>,error?:string}
 */
function outbound_crud_change_unit_status(int $post_id, string $unit_id, string $target_status): array {
    $units = outbound_crud_load_property_units($post_id);
    $next  = match (sanitize_key($target_status)) {
        'restore'          => 'draft',
        'trash', 'trashed' => 'trashed',
        'publish'          => 'published',
        default            => sanitize_key($target_status),
    };
    if (!in_array($next, array('published', 'draft', 'archived', 'trashed'), true)) {
        return array('ok' => false, 'error' => 'Unsupported unit status.');
    }
    foreach ($units as $idx => $u) {
        if (($u['id'] ?? '') === $unit_id) {
            $units[$idx]['status'] = $next;
            $saved = outbound_crud_persist_property_units($post_id, $units);
            foreach ($saved as $su) {
                if (($su['id'] ?? '') === $unit_id) {
                    return array('ok' => true, 'unit' => $su);
                }
            }
            return array('ok' => true, 'unit' => $units[$idx]);
        }
    }
    return array('ok' => false, 'error' => 'Unit not found.');
}

/**
 * Permanently delete a single unit by stable `unit_id` after explicit confirmation.
 * Preserves the parent property, all other units, Media Library files, and shared rate plans/offers
 * (only detaching this `unit_id` from applicableUnitIds).
 *
 * @return array{ok:bool,requires_confirmation?:bool,unit_name?:string,error?:string}
 */
function outbound_crud_permanently_delete_unit(int $post_id, string $unit_id, bool $confirmed = false): array {
    $units = outbound_crud_load_property_units($post_id);
    $target_idx = -1;
    $target_unit = null;
    foreach ($units as $idx => $u) {
        if (($u['id'] ?? '') === $unit_id) {
            $target_idx  = $idx;
            $target_unit = $u;
            break;
        }
    }
    if ($target_idx < 0 || !$target_unit) {
        return array('ok' => false, 'error' => 'Unit not found.');
    }
    if (!$confirmed) {
        return array(
            'ok'                    => false,
            'requires_confirmation' => true,
            'unit_name'             => (string) ($target_unit['name'] ?? $unit_id),
            'error'                 => 'Permanent deletion of an accommodation unit requires explicit confirmation.',
        );
    }

    array_splice($units, $target_idx, 1);
    outbound_crud_persist_property_units($post_id, $units);

    // Clean unit_id references in property ratePlans and offers without deleting shared rate plans or offers
    if (function_exists('outbound_editor_get_json_meta') && function_exists('update_post_meta')) {
        $plans = outbound_editor_get_json_meta($post_id, '_outbound_rate_plans_json', array());
        if (is_array($plans) && !empty($plans)) {
            foreach ($plans as $pidx => $rp) {
                if (!empty($rp['applicableUnitIds']) && is_array($rp['applicableUnitIds'])) {
                    $plans[$pidx]['applicableUnitIds'] = array_values(array_filter(
                        $rp['applicableUnitIds'],
                        static fn($id) => (string) $id !== $unit_id
                    ));
                }
            }
            update_post_meta($post_id, '_outbound_rate_plans_json', wp_json_encode($plans));
        }
        $offers = outbound_editor_get_json_meta($post_id, '_outbound_property_offers_json', array());
        if (is_array($offers) && !empty($offers)) {
            foreach ($offers as $oidx => $off) {
                if (!empty($off['applicableUnitIds']) && is_array($off['applicableUnitIds'])) {
                    $offers[$oidx]['applicableUnitIds'] = array_values(array_filter(
                        $off['applicableUnitIds'],
                        static fn($id) => (string) $id !== $unit_id
                    ));
                }
            }
            update_post_meta($post_id, '_outbound_property_offers_json', wp_json_encode($offers));
        }
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return array('ok' => true, 'unit_name' => (string) ($target_unit['name'] ?? $unit_id));
}

/**
 * Register Authenticated WordPress REST API Endpoints for Full Accommodation CRUD.
 */
if (function_exists('add_action')) {
    add_action('rest_api_init', static function (): void {
        $perm_edit = static fn(): bool => is_user_logged_in() && outbound_can_manage_accommodations('edit');
        $perm_delete = static fn(): bool => is_user_logged_in() && outbound_can_manage_accommodations('delete');
        $perm_publish = static fn(): bool => is_user_logged_in() && outbound_can_manage_accommodations('publish');

        // List / search / filter / sort / paginate accommodations
        register_rest_route('outbound/v1', '/admin/accommodations', array(
            array(
                'methods'             => 'GET',
                'permission_callback' => $perm_edit,
                'callback'            => static function (WP_REST_Request $req) {
                    $res = outbound_query_admin_accommodations(array(
                        'status'   => (string) $req->get_param('status'),
                        'category' => (string) $req->get_param('category'),
                        'search'   => (string) $req->get_param('search'),
                        'sort'     => (string) $req->get_param('sort'),
                        'paged'    => (int) ($req->get_param('paged') ?: 1),
                        'per_page' => (int) ($req->get_param('per_page') ?: 15),
                    ));
                    return new WP_REST_Response($res, 200);
                },
            ),
            array(
                'methods'             => 'POST',
                'permission_callback' => $perm_edit,
                'callback'            => static function (WP_REST_Request $req) {
                    $body   = (array) ($req->get_json_params() ?: $req->get_params());
                    $status = ((string) ($body['status'] ?? 'draft')) === 'publish' ? 'publish' : 'draft';
                    if ($status === 'publish' && !outbound_can_manage_accommodations('publish')) {
                        return new WP_REST_Response(array('ok' => false, 'error' => 'Permission denied to publish.'), 403);
                    }
                    $res = outbound_cms_save_item_record('accommodation', 0, $status, $body);
                    if (!empty($res['error'])) {
                        return new WP_REST_Response(array('ok' => false, 'error' => $res['error']), 400);
                    }
                    return new WP_REST_Response(array('ok' => true, 'post_id' => $res['post_id'], 'status' => $res['status']), 201);
                },
            ),
        ));

        // Single accommodation read / update / permanent delete
        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)', array(
            array(
                'methods'             => 'GET',
                'permission_callback' => $perm_edit,
                'callback'            => static function (WP_REST_Request $req) {
                    $pid  = (int) $req->get_param('id');
                    $post = get_post($pid);
                    if (!$post || $post->post_type !== 'accommodation') {
                        return new WP_REST_Response(array('ok' => false, 'error' => 'Accommodation not found.'), 404);
                    }
                    $eff = outbound_editor_load_effective_record($pid, 'accommodation');
                    return new WP_REST_Response(array(
                        'ok'            => true,
                        'id'            => $pid,
                        'status'        => (string) $post->post_status,
                        'title'         => (string) $post->post_title,
                        'slug'          => (string) $post->post_name,
                        'record'        => $eff,
                        'units'         => outbound_crud_load_property_units($pid),
                        'delete_impact' => outbound_get_accommodation_delete_impact($pid),
                    ), 200);
                },
            ),
            array(
                'methods'             => 'PUT,PATCH',
                'permission_callback' => $perm_edit,
                'callback'            => static function (WP_REST_Request $req) {
                    $pid  = (int) $req->get_param('id');
                    $post = get_post($pid);
                    if (!$post || $post->post_type !== 'accommodation') {
                        return new WP_REST_Response(array('ok' => false, 'error' => 'Accommodation not found.'), 404);
                    }
                    $body   = (array) ($req->get_json_params() ?: $req->get_params());
                    $target = (string) ($body['status'] ?? $post->post_status);
                    if ($target === 'publish' && !outbound_can_manage_accommodations('publish', $pid)) {
                        return new WP_REST_Response(array('ok' => false, 'error' => 'Permission denied to publish.'), 403);
                    }
                    $res = outbound_cms_save_item_record('accommodation', $pid, $target === 'publish' ? 'publish' : 'draft', $body);
                    if ($target === 'archived') {
                        outbound_change_accommodation_status($pid, 'archived');
                    }
                    if (!empty($res['error'])) {
                        return new WP_REST_Response(array('ok' => false, 'error' => $res['error']), 400);
                    }
                    return new WP_REST_Response(array('ok' => true, 'post_id' => $res['post_id'], 'status' => $target), 200);
                },
            ),
            array(
                'methods'             => 'DELETE',
                'permission_callback' => $perm_delete,
                'callback'            => static function (WP_REST_Request $req) {
                    $pid       = (int) $req->get_param('id');
                    $body      = (array) ($req->get_json_params() ?: $req->get_params());
                    $confirmed = !empty($body['confirm_permanent']) || (string) $req->get_param('confirm_permanent') === '1';
                    if (!$confirmed) {
                        $res = outbound_change_accommodation_status($pid, 'trash');
                        return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
                    }
                    $res = outbound_permanently_delete_accommodation($pid, true);
                    return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
                },
            ),
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)/duplicate', array(
            'methods'             => 'POST',
            'permission_callback' => $perm_edit,
            'callback'            => static function (WP_REST_Request $req) {
                $res = outbound_duplicate_accommodation_post((int) $req->get_param('id'));
                return new WP_REST_Response($res, !empty($res['ok']) ? 201 : 404);
            },
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)/status', array(
            'methods'             => 'POST',
            'permission_callback' => $perm_publish,
            'callback'            => static function (WP_REST_Request $req) {
                $pid    = (int) $req->get_param('id');
                $body   = (array) ($req->get_json_params() ?: $req->get_params());
                $action = (string) ($body['action'] ?? ($body['status'] ?? ''));
                if (in_array($action, array('trash', 'restore'), true) && !outbound_can_manage_accommodations($action, $pid)) {
                    return new WP_REST_Response(array('ok' => false, 'error' => 'Permission denied.'), 403);
                }
                $res = outbound_change_accommodation_status($pid, $action);
                return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
            },
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)/delete-impact', array(
            'methods'             => 'GET',
            'permission_callback' => $perm_delete,
            'callback'            => static function (WP_REST_Request $req) {
                $impact = outbound_get_accommodation_delete_impact((int) $req->get_param('id'));
                return new WP_REST_Response($impact, !empty($impact['exists']) ? 200 : 404);
            },
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/bulk', array(
            'methods'             => 'POST',
            'permission_callback' => $perm_publish,
            'callback'            => static function (WP_REST_Request $req) {
                $body      = (array) ($req->get_json_params() ?: $req->get_params());
                $ids       = is_array($body['ids'] ?? null) ? $body['ids'] : array();
                $action    = sanitize_key((string) ($body['action'] ?? ''));
                $confirmed = !empty($body['confirm_permanent']);
                if (in_array($action, array('trash', 'restore', 'delete'), true) && !outbound_can_manage_accommodations('delete')) {
                    return new WP_REST_Response(array('ok' => false, 'error' => 'Permission denied for delete/trash action.'), 403);
                }
                $res = outbound_bulk_accommodation_action($ids, $action, $confirmed);
                return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
            },
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/featured-order', array(
            'methods'             => 'POST',
            'permission_callback' => $perm_publish,
            'callback'            => static function (WP_REST_Request $req) {
                $body  = (array) ($req->get_json_params() ?: $req->get_params());
                $slugs = is_array($body['slugs'] ?? null) ? $body['slugs'] : array();
                return new WP_REST_Response(outbound_save_featured_accommodations_order($slugs), 200);
            },
        ));

        // Unit-level CRUD routes (scoped by parent property ID & stable unit ID)
        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)/units', array(
            array(
                'methods'             => 'GET',
                'permission_callback' => $perm_edit,
                'callback'            => static function (WP_REST_Request $req) {
                    $pid    = (int) $req->get_param('id');
                    $status = (string) ($req->get_param('status') ?: 'all');
                    return new WP_REST_Response(array('ok' => true, 'units' => outbound_crud_list_units($pid, $status)), 200);
                },
            ),
            array(
                'methods'             => 'POST',
                'permission_callback' => $perm_edit,
                'callback'            => static function (WP_REST_Request $req) {
                    $pid  = (int) $req->get_param('id');
                    $body = (array) ($req->get_json_params() ?: $req->get_params());
                    $res  = outbound_crud_upsert_unit($pid, $body);
                    return new WP_REST_Response($res, !empty($res['ok']) ? 201 : 400);
                },
            ),
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)/units/reorder', array(
            'methods'             => 'POST',
            'permission_callback' => $perm_edit,
            'callback'            => static function (WP_REST_Request $req) {
                $pid  = (int) $req->get_param('id');
                $body = (array) ($req->get_json_params() ?: $req->get_params());
                $ids  = is_array($body['orderedIds'] ?? null) ? $body['orderedIds'] : array();
                $res  = outbound_crud_reorder_units($pid, $ids);
                return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
            },
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)/units/(?P<unit_id>[a-zA-Z0-9_-]+)', array(
            array(
                'methods'             => 'PUT,PATCH',
                'permission_callback' => $perm_edit,
                'callback'            => static function (WP_REST_Request $req) {
                    $pid        = (int) $req->get_param('id');
                    $unit_id    = (string) $req->get_param('unit_id');
                    $body       = (array) ($req->get_json_params() ?: $req->get_params());
                    $body['id'] = $unit_id;
                    $res        = outbound_crud_upsert_unit($pid, $body);
                    return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
                },
            ),
            array(
                'methods'             => 'DELETE',
                'permission_callback' => $perm_delete,
                'callback'            => static function (WP_REST_Request $req) {
                    $pid       = (int) $req->get_param('id');
                    $unit_id   = (string) $req->get_param('unit_id');
                    $body      = (array) ($req->get_json_params() ?: $req->get_params());
                    $confirmed = !empty($body['confirm_permanent']) || (string) $req->get_param('confirm_permanent') === '1';
                    if (!$confirmed) {
                        $res = outbound_crud_change_unit_status($pid, $unit_id, 'trashed');
                        return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
                    }
                    $res = outbound_crud_permanently_delete_unit($pid, $unit_id, true);
                    return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
                },
            ),
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)/units/(?P<unit_id>[a-zA-Z0-9_-]+)/duplicate', array(
            'methods'             => 'POST',
            'permission_callback' => $perm_edit,
            'callback'            => static function (WP_REST_Request $req) {
                $res = outbound_crud_duplicate_unit((int) $req->get_param('id'), (string) $req->get_param('unit_id'));
                return new WP_REST_Response($res, !empty($res['ok']) ? 201 : 404);
            },
        ));

        register_rest_route('outbound/v1', '/admin/accommodations/(?P<id>\d+)/units/(?P<unit_id>[a-zA-Z0-9_-]+)/status', array(
            'methods'             => 'POST',
            'permission_callback' => $perm_edit,
            'callback'            => static function (WP_REST_Request $req) {
                $body   = (array) ($req->get_json_params() ?: $req->get_params());
                $action = (string) ($body['status'] ?? ($body['action'] ?? ''));
                $res    = outbound_crud_change_unit_status((int) $req->get_param('id'), (string) $req->get_param('unit_id'), $action);
                return new WP_REST_Response($res, !empty($res['ok']) ? 200 : 400);
            },
        ));

        // Shared Library CRUD (Amenities, Rate Templates, Offer Templates) with dependency warning
        register_rest_route('outbound/v1', '/admin/shared-library', array(
            array(
                'methods'             => 'GET',
                'permission_callback' => $perm_edit,
                'callback'            => static function () {
                    return new WP_REST_Response(array(
                        'ok'                 => true,
                        'propertyAmenities'  => array_values(outbound_get_shared_property_amenities()),
                        'roomAmenities'      => array_values(outbound_get_shared_room_amenities()),
                        'rateTemplates'      => outbound_get_shared_rate_templates(),
                        'offerTemplates'     => outbound_get_shared_offer_templates(),
                    ), 200);
                },
            ),
            array(
                'methods'             => 'POST',
                'permission_callback' => $perm_publish,
                'callback'            => static function (WP_REST_Request $req) {
                    $body  = (array) ($req->get_json_params() ?: $req->get_params());
                    $kind  = sanitize_key((string) ($body['kind'] ?? ''));
                    $items = is_array($body['items'] ?? null) ? $body['items'] : array();
                    $saved = match ($kind) {
                        'property_amenity' => array_values(outbound_save_shared_property_amenities($items)),
                        'room_amenity'     => array_values(outbound_save_shared_room_amenities($items)),
                        'rate_template'    => outbound_save_shared_rate_templates($items),
                        'offer_template'   => outbound_save_shared_offer_templates($items),
                        default            => null,
                    };
                    if ($saved === null) {
                        return new WP_REST_Response(array('ok' => false, 'error' => 'Invalid shared library kind.'), 400);
                    }
                    return new WP_REST_Response(array('ok' => true, 'items' => $saved), 200);
                },
            ),
        ));

        register_rest_route('outbound/v1', '/admin/shared-library/(?P<kind>[a-z_]+)/(?P<id>[a-zA-Z0-9_-]+)', array(
            'methods'             => 'DELETE',
            'permission_callback' => $perm_delete,
            'callback'            => static function (WP_REST_Request $req) {
                $kind      = sanitize_key((string) $req->get_param('kind'));
                $rec_id    = (string) $req->get_param('id');
                $body      = (array) ($req->get_json_params() ?: $req->get_params());
                $confirmed = !empty($body['confirm_permanent']) || (string) $req->get_param('confirm_permanent') === '1';
                $detach    = !empty($body['detach_from_properties']) || (string) $req->get_param('detach_from_properties') === '1';
                $res       = outbound_delete_shared_library_record($kind, $rec_id, $confirmed, $detach);
                return new WP_REST_Response($res, !empty($res['ok']) ? 200 : (!empty($res['requires_confirmation']) ? 409 : 400));
            },
        ));
    });
}

/**
 * Allowed CMS content post types manageable via Outbound CMS Studios & List Cards.
 *
 * @return array<int, string>
 */
function outbound_cms_allowed_cpts(): array {
    return array('accommodation', 'experience', 'package', 'guide_article', 'post', 'client_album');
}

/**
 * Capability check for any CMS content item lifecycle operation.
 */
function outbound_can_manage_cms_post(string $action = 'edit', int $post_id = 0): bool {
    return outbound_can_manage_accommodations($action, $post_id);
}

/**
 * Inspect dependent metadata/references before trashing or permanently deleting any CMS item.
 *
 * @return array<string, mixed>
 */
function outbound_get_cms_post_delete_impact(int $post_id): array {
    $post = function_exists('get_post') ? get_post($post_id) : null;
    if (!$post || !in_array($post->post_type, outbound_cms_allowed_cpts(), true)) {
        return array('exists' => false, 'post_id' => $post_id);
    }
    if ($post->post_type === 'accommodation') {
        return outbound_get_accommodation_delete_impact($post_id);
    }
    return array(
        'exists'           => true,
        'post_id'          => $post_id,
        'post_type'        => (string) $post->post_type,
        'title'            => (string) $post->post_title,
        'slug'             => (string) $post->post_name,
        'status'           => (string) $post->post_status,
        'units_count'      => 0,
        'unit_names'       => array(),
        'rate_plans_count' => 0,
        'offers_count'     => 0,
        'deletion_policy'  => 'Removes this item and its metadata from WordPress. Media Library files used elsewhere remain untouched.',
    );
}

/**
 * Duplicate any Outbound CMS item (accommodation, experience, package, guide, post, album) as Draft.
 *
 * @return array{ok:bool,post_id?:int,title?:string,slug?:string,error?:string}
 */
function outbound_duplicate_cms_post(int $post_id): array {
    if (function_exists('current_user_can') && !outbound_can_manage_cms_post('edit', $post_id)) {
        return array('ok' => false, 'error' => 'Unauthorized: insufficient permissions to duplicate this record.');
    }
    $post = function_exists('get_post') ? get_post($post_id) : null;
    if (!$post || !in_array($post->post_type, outbound_cms_allowed_cpts(), true)) {
        return array('ok' => false, 'error' => 'Record not found.');
    }
    if ($post->post_type === 'accommodation') {
        return outbound_duplicate_accommodation_post($post_id);
    }

    $new_title = trim((string) $post->post_title) !== '' ? ((string) $post->post_title . ' (Copy)') : 'Untitled Copy';
    $new_slug  = sanitize_title(((string) $post->post_name ?: $new_title) . '-copy-' . substr(outbound_generate_unit_id(), 5, 6));
    $new_id    = wp_insert_post(array(
        'post_type'    => $post->post_type,
        'post_title'   => $new_title,
        'post_name'    => $new_slug,
        'post_status'  => 'draft',
        'post_excerpt' => (string) $post->post_excerpt,
        'post_content' => (string) $post->post_content,
        'menu_order'   => (int) ($post->menu_order ?? 0),
    ), true);

    $is_err = static fn($v): bool => function_exists('is_wp_error') && is_wp_error($v);
    if (!$new_id || $is_err($new_id)) {
        return array('ok' => false, 'error' => 'Failed to create duplicated draft record.');
    }

    if (function_exists('get_post_meta') && function_exists('update_post_meta')) {
        $all_meta = get_post_meta($post_id);
        foreach ((array) $all_meta as $mkey => $mvals) {
            $mkey = (string) $mkey;
            if ($mkey === '_edit_lock' || $mkey === '_edit_last' || str_starts_with($mkey, '_wp_trash_')) {
                continue;
            }
            $raw = is_array($mvals) ? ($mvals[0] ?? '') : $mvals;
            update_post_meta($new_id, $mkey, function_exists('maybe_unserialize') ? maybe_unserialize($raw) : $raw);
        }
    }

    if (function_exists('wp_get_post_terms') && function_exists('wp_set_object_terms')) {
        foreach (array('accommodation_category', 'experience_category', 'category', 'post_tag') as $tax) {
            $terms = wp_get_post_terms($post_id, $tax, array('fields' => 'slugs'));
            if (is_array($terms) && !empty($terms)) {
                wp_set_object_terms($new_id, $terms, $tax, false);
            }
        }
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return array('ok' => true, 'post_id' => (int) $new_id, 'title' => $new_title, 'slug' => $new_slug);
}

/**
 * Transition any Outbound CMS item status safely: publish | unpublish/draft | archive | trash | restore.
 *
 * @return array{ok:bool,post_id:int,status?:string,error?:string}
 */
function outbound_change_cms_post_status(int $post_id, string $action, string $expected_type = ''): array {
    $post = function_exists('get_post') ? get_post($post_id) : null;
    if (!$post || !in_array($post->post_type, outbound_cms_allowed_cpts(), true)) {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'Record not found.');
    }
    if ($expected_type !== '' && $post->post_type !== $expected_type) {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'Record type mismatch.');
    }
    if ($post->post_type === 'accommodation') {
        return outbound_change_accommodation_status($post_id, $action);
    }

    $cap_action = match (sanitize_key($action)) {
        'publish'             => 'publish',
        'unpublish', 'draft'  => 'unpublish',
        'archive', 'archived' => 'archive',
        'trash', 'restore'    => $action,
        default               => 'edit',
    };
    if (function_exists('current_user_can') && !outbound_can_manage_cms_post($cap_action, $post_id)) {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'Unauthorized: insufficient permissions to update this record.');
    }

    $is_err = static fn($v): bool => function_exists('is_wp_error') && is_wp_error($v);
    $action = sanitize_key($action);

    if ($action === 'trash') {
        $res = function_exists('wp_trash_post') ? wp_trash_post($post_id) : wp_update_post(array('ID' => $post_id, 'post_status' => 'trash'), true);
        if (!$res || $is_err($res)) {
            return array('ok' => false, 'post_id' => $post_id, 'error' => 'Failed to move record to Trash.');
        }
        if (function_exists('outbound_invalidate_snapshot_cache')) {
            outbound_invalidate_snapshot_cache();
        }
        return array('ok' => true, 'post_id' => $post_id, 'status' => 'trash');
    }

    if ($action === 'restore') {
        if ($post->post_status === 'trash' && function_exists('wp_untrash_post')) {
            wp_untrash_post($post_id);
        }
        $res = wp_update_post(array('ID' => $post_id, 'post_status' => 'draft'), true);
        if (!$res || $is_err($res)) {
            return array('ok' => false, 'post_id' => $post_id, 'error' => 'Failed to restore record from Trash.');
        }
        if (function_exists('outbound_invalidate_snapshot_cache')) {
            outbound_invalidate_snapshot_cache();
        }
        return array('ok' => true, 'post_id' => $post_id, 'status' => 'draft');
    }

    $target = match ($action) {
        'publish'             => 'publish',
        'unpublish', 'draft'  => 'draft',
        'archive', 'archived' => 'archived',
        default               => '',
    };
    if ($target === '') {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'Unsupported status action.');
    }

    $res = wp_update_post(array('ID' => $post_id, 'post_status' => $target), true);
    if (!$res || $is_err($res)) {
        return array('ok' => false, 'post_id' => $post_id, 'error' => 'Failed to update record status.');
    }
    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }
    return array('ok' => true, 'post_id' => $post_id, 'status' => $target);
}

/**
 * Permanently delete any Outbound CMS item after explicit confirmation without deleting Media Library assets or leaving orphans.
 *
 * @return array{ok:bool,requires_confirmation?:bool,impact?:array,error?:string}
 */
function outbound_permanently_delete_cms_post(int $post_id, bool $confirmed = false, string $expected_type = ''): array {
    if (function_exists('current_user_can') && !outbound_can_manage_cms_post('delete', $post_id)) {
        return array('ok' => false, 'error' => 'Unauthorized: insufficient permissions to permanently delete this record.');
    }
    $post = function_exists('get_post') ? get_post($post_id) : null;
    if (!$post || !in_array($post->post_type, outbound_cms_allowed_cpts(), true)) {
        return array('ok' => false, 'error' => 'Record not found.');
    }
    if ($expected_type !== '' && $post->post_type !== $expected_type) {
        return array('ok' => false, 'error' => 'Record type mismatch.');
    }
    if ($post->post_type === 'accommodation') {
        return outbound_permanently_delete_accommodation($post_id, $confirmed);
    }

    $impact = outbound_get_cms_post_delete_impact($post_id);
    if (!$confirmed) {
        return array(
            'ok'                    => false,
            'requires_confirmation' => true,
            'impact'                => $impact,
            'error'                 => 'Permanent deletion requires explicit confirmation.',
        );
    }

    $slug = (string) $post->post_name;
    $feat_bucket = match ($post->post_type) {
        'experience' => 'experienceIds',
        'package'    => 'packageIds',
        default      => '',
    };
    $feat_item_bucket = match ($post->post_type) {
        'experience' => 'experiences',
        'package'    => 'packages',
        default      => '',
    };
    if ($slug !== '' && $feat_bucket !== '' && function_exists('get_option') && function_exists('update_option')) {
        $feat = get_option('outbound_featured_overrides', array());
        if (is_array($feat) && !empty($feat[$feat_bucket]) && is_array($feat[$feat_bucket])) {
            $feat[$feat_bucket] = array_values(array_filter($feat[$feat_bucket], static fn($s) => (string) $s !== $slug));
            update_option('outbound_featured_overrides', $feat, false);
        }
        $feat_items = get_option('outbound_featured_item_overrides', array());
        if (is_array($feat_items) && $feat_item_bucket !== '' && isset($feat_items[$feat_item_bucket][$slug])) {
            unset($feat_items[$feat_item_bucket][$slug]);
            update_option('outbound_featured_item_overrides', $feat_items, false);
        }
        $draft = get_option('outbound_cms_draft_state', array());
        if (is_array($draft) && isset($draft['featured'][$feat_bucket]) && is_array($draft['featured'][$feat_bucket])) {
            $draft['featured'][$feat_bucket] = array_values(array_filter($draft['featured'][$feat_bucket], static fn($s) => (string) $s !== $slug));
            update_option('outbound_cms_draft_state', $draft, false);
        }
    }

    if (function_exists('get_posts') && function_exists('wp_update_post')) {
        $children = get_posts(array(
            'post_type'      => 'attachment',
            'post_parent'    => $post_id,
            'posts_per_page' => -1,
            'post_status'    => 'any',
            'fields'         => 'ids',
        ));
        foreach ((array) $children as $att_id) {
            wp_update_post(array('ID' => (int) $att_id, 'post_parent' => 0));
        }
    }

    if (function_exists('wp_delete_object_term_relationships')) {
        wp_delete_object_term_relationships($post_id, array('accommodation_category', 'experience_category', 'category', 'post_tag'));
    }

    if (function_exists('wp_delete_post')) {
        $deleted = wp_delete_post($post_id, true);
        if (!$deleted) {
            return array('ok' => false, 'error' => 'WordPress failed to permanently delete #' . $post_id);
        }
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return array('ok' => true, 'impact' => $impact);
}

/**
 * Bulk lifecycle action handler across any CPT table in Outbound CMS.
 *
 * @param array<int, int|string> $post_ids
 * @return array{ok:bool,processed:int,errors:array<int, string>}
 */
function outbound_bulk_cms_post_action(array $post_ids, string $action, bool $confirmed = false, string $expected_type = ''): array {
    $ids       = array_values(array_unique(array_filter(array_map('intval', $post_ids), static fn($id) => $id > 0)));
    $processed = 0;
    $errors    = array();

    if (empty($ids)) {
        return array('ok' => false, 'processed' => 0, 'errors' => array('No items selected.'));
    }

    foreach ($ids as $pid) {
        if ($action === 'delete' || $action === 'permanent_delete') {
            $res = outbound_permanently_delete_cms_post($pid, $confirmed, $expected_type);
        } else {
            $res = outbound_change_cms_post_status($pid, $action, $expected_type);
        }
        if (!empty($res['ok'])) {
            $processed++;
        } else {
            $errors[] = (string) ($res['error'] ?? ('Failed on #' . $pid));
        }
    }

    return array(
        'ok'        => $processed > 0 && empty($errors),
        'processed' => $processed,
        'errors'    => $errors,
    );
}



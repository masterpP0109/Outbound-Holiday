<?php
/**
 * Outbound Holidays — 2026 Master Content Reconciliation & Backup Tool.
 * Idempotent, non-destructive upsert for the 25 verified experiences and 12 accommodations (52 researched room profiles).
 * Preserves all existing CPT post IDs, slugs, manually entered selling prices, media URLs, and manually added records (e.g. quad-bikes).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Load the bundled 2026 reconciliation dataset (`inc/reconciliation-2026.json`).
 *
 * @return array<string, mixed>
 */
function outbound_load_reconciliation_2026_dataset(): array {
    $path = OUTBOUND_THEME_DIR . '/inc/reconciliation-2026.json';
    if (!file_exists($path)) {
        return array('experiences' => array(), 'accommodations' => array());
    }
    $decoded = json_decode((string) file_get_contents($path), true);
    return is_array($decoded) ? $decoded : array('experiences' => array(), 'accommodations' => array());
}

/**
 * Export a full JSON backup of all Outbound CPT posts, post meta, and core options.
 *
 * @return array<string, mixed>
 */
function outbound_export_cms_backup(): array {
    $cpts = array('accommodation', 'experience', 'package', 'guide_article', 'client_album');
    $backup_posts = array();
    if (function_exists('get_posts')) {
        foreach ($cpts as $pt) {
            $posts = get_posts(array(
                'post_type'              => $pt,
                'post_status'            => array('publish', 'draft', 'pending', 'private', 'archived', 'trash'),
                'posts_per_page'         => -1,
                'no_found_rows'          => true,
                'update_post_meta_cache' => true,
            ));
            foreach ($posts as $p) {
                $meta = function_exists('get_post_meta') ? get_post_meta((int) $p->ID) : array();
                $backup_posts[] = array(
                    'ID'           => (int) $p->ID,
                    'post_type'    => (string) $p->post_type,
                    'post_name'    => (string) $p->post_name,
                    'post_title'   => (string) $p->post_title,
                    'post_status'  => (string) $p->post_status,
                    'post_excerpt' => (string) $p->post_excerpt,
                    'post_content' => (string) $p->post_content,
                    'menu_order'   => (int) $p->menu_order,
                    'meta'         => $meta,
                );
            }
        }
    }

    return array(
        'exported_at'    => gmdate('c'),
        'theme_version'  => defined('OUTBOUND_THEME_VERSION') ? OUTBOUND_THEME_VERSION : '1.0.0',
        'posts'          => $backup_posts,
        'site_options'   => function_exists('get_option') ? get_option('outbound_site_options', array()) : array(),
        'editorial'      => function_exists('get_option') ? get_option('outbound_cms_editorial_overrides', array()) : array(),
    );
}

/**
 * Find an existing CPT post by slug across active/draft/archived statuses.
 */
function outbound_find_cpt_by_slug(string $post_type, string $slug): ?WP_Post {
    if (!function_exists('get_posts') || $slug === '') {
        return null;
    }
    $matches = get_posts(array(
        'post_type'              => $post_type,
        'name'                   => $slug,
        'post_status'            => array('publish', 'draft', 'pending', 'private', 'archived'),
        'posts_per_page'         => 1,
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
    ));
    return !empty($matches) && $matches[0] instanceof WP_Post ? $matches[0] : null;
}

/**
 * Non-destructively reconcile room types for an accommodation property.
 *
 * @param array<int, array<string, mixed>> $existing_rooms
 * @param array<int, array<string, mixed>> $spec_rooms
 * @param string $fallback_hero
 * @return array{rooms:array<int, array<string, mixed>>, stats:array{matched:int,added_draft:int,preserved_unmatched:int}}
 */
function outbound_reconcile_property_rooms_2026(array $existing_rooms, array $spec_rooms, string $fallback_hero = ''): array {
    $result = array();
    $matched_ids = array();
    $stats = array('matched' => 0, 'added_draft' => 0, 'preserved_unmatched' => 0);

    foreach ($spec_rooms as $spec) {
        if (!is_array($spec) || empty($spec['name'])) {
            continue;
        }
        $found = null;
        $match_ids = isset($spec['matchIds']) && is_array($spec['matchIds']) ? $spec['matchIds'] : array();
        $match_names = isset($spec['matchNames']) && is_array($spec['matchNames']) ? $spec['matchNames'] : array();

        foreach ($existing_rooms as $er) {
            if (!is_array($er)) {
                continue;
            }
            $er_id = (string) ($er['id'] ?? '');
            $er_name = strtolower(trim((string) ($er['name'] ?? '')));
            if ($er_id !== '' && in_array($er_id, $match_ids, true)) {
                $found = $er;
                break;
            }
            foreach ($match_names as $mn) {
                if (strtolower(trim((string) $mn)) === $er_name) {
                    $found = $er;
                    break 2;
                }
            }
        }

        if ($found !== null) {
            $stats['matched']++;
            if (!empty($found['id'])) {
                $matched_ids[(string) $found['id']] = true;
            }
            $merged = $found;
            $merged['name']             = (string) $spec['name'];
            $merged['unitCategory']     = (string) ($spec['unitCategory'] ?? ($found['unitCategory'] ?? 'Room'));
            $merged['wing']             = (string) (($spec['wing'] ?? '') !== '' ? $spec['wing'] : ($found['wing'] ?? ''));
            $merged['sizeSqm']          = array_key_exists('sizeSqm', $spec) ? $spec['sizeSqm'] : ($found['sizeSqm'] ?? null);
            $merged['unitCount']        = array_key_exists('unitCount', $spec) ? $spec['unitCount'] : ($found['unitCount'] ?? null);
            $merged['shortDescription'] = (string) ($spec['shortDescription'] ?? ($found['shortDescription'] ?? ''));
            $merged['description']      = (string) ($spec['description'] ?? ($found['description'] ?? ''));
            $merged['features']         = !empty($spec['features']) ? array_values($spec['features']) : ($found['features'] ?? array());
            $merged['isEntireProperty'] = !empty($spec['isEntireProperty']);
            $merged['availabilityStatus'] = (string) ($spec['availabilityStatus'] ?? ($found['availabilityStatus'] ?? 'on_request'));
            $merged['customCtaLabel']   = (string) ($spec['customCtaLabel'] ?? ($found['customCtaLabel'] ?? 'Enquire About This Room'));
            $merged['status']           = (string) ($found['status'] ?? ($spec['defaultStatus'] ?? 'published'));
            // Preserve existing pricing & media completely
            $existing_pricing = isset($found['pricing']) && is_array($found['pricing']) ? $found['pricing'] : array();
            if (empty($existing_pricing['priceBasis']) && !empty($spec['pricing']['priceBasis'])) {
                $existing_pricing['priceBasis'] = (string) $spec['pricing']['priceBasis'];
            }
            if (empty($existing_pricing['rateStatus']) && !empty($spec['pricing']['rateStatus'])) {
                $existing_pricing['rateStatus'] = (string) $spec['pricing']['rateStatus'];
            }
            $merged['pricing'] = $existing_pricing;
            $result[] = $merged;
        } else {
            $stats['added_draft']++;
            $result[] = array(
                'id'                 => (string) ($spec['id'] ?? ('unit_' . sanitize_title((string) $spec['name']))),
                'name'               => (string) $spec['name'],
                'occupancy'          => (string) ($spec['occupancy'] ?? 'Confirm occupancy'),
                'shortDescription'   => (string) ($spec['shortDescription'] ?? ''),
                'description'        => (string) ($spec['description'] ?? ''),
                'unitCategory'       => (string) ($spec['unitCategory'] ?? 'Room'),
                'wing'               => (string) ($spec['wing'] ?? ''),
                'isEntireProperty'   => !empty($spec['isEntireProperty']),
                'sizeSqm'            => $spec['sizeSqm'] ?? null,
                'unitCount'          => $spec['unitCount'] ?? null,
                'featured'           => false,
                'status'             => (string) ($spec['defaultStatus'] ?? 'draft'),
                'availabilityStatus' => (string) ($spec['availabilityStatus'] ?? 'on_request'),
                'customCtaLabel'     => (string) ($spec['customCtaLabel'] ?? 'Enquire About This Room'),
                'imageUrl'           => $fallback_hero,
                'features'           => !empty($spec['features']) ? array_values($spec['features']) : array(),
                'pricing'            => isset($spec['pricing']) && is_array($spec['pricing']) ? $spec['pricing'] : array('priceBasis' => 'per_room', 'rateStatus' => 'provisional'),
            );
        }
    }

    foreach ($existing_rooms as $er) {
        if (!is_array($er)) {
            continue;
        }
        $er_id = (string) ($er['id'] ?? '');
        if ($er_id !== '' && isset($matched_ids[$er_id])) {
            continue;
        }
        $stats['preserved_unmatched']++;
        $result[] = $er;
    }

    return array('rooms' => $result, 'stats' => $stats);
}

/**
 * Run dry-run or apply for the 2026 Master Content Reconciliation.
 *
 * @return array<string, mixed>
 */
function outbound_reconcile_2026_content(bool $dry_run = true): array {
    $dataset = outbound_load_reconciliation_2026_dataset();
    $exp_specs = isset($dataset['experiences']) && is_array($dataset['experiences']) ? $dataset['experiences'] : array();
    $acc_specs = isset($dataset['accommodations']) && is_array($dataset['accommodations']) ? $dataset['accommodations'] : array();

    if (!$dry_run && function_exists('get_option') && function_exists('update_option')) {
        if (!get_option('outbound_reconciliation_2026_backup')) {
            update_option('outbound_reconciliation_2026_backup', outbound_export_cms_backup(), false);
        }
    }

    $report = array(
        'dry_run'        => $dry_run,
        'executed_at'    => gmdate('c'),
        'experiences'    => array(),
        'accommodations' => array(),
        'summary'        => array(
            'experiences_updated'  => 0,
            'experiences_missing'  => 0,
            'accommodations_updated' => 0,
            'accommodations_created_draft' => 0,
            'rooms_matched'        => 0,
            'rooms_added_draft'    => 0,
            'rooms_preserved_unmatched' => 0,
        ),
    );

    // 1. Reconcile 25 Experiences
    foreach ($exp_specs as $exp) {
        $slug = sanitize_title((string) ($exp['slug'] ?? ''));
        if ($slug === '') {
            continue;
        }
        $existing = outbound_find_cpt_by_slug('experience', $slug);
        if (!$existing) {
            $report['summary']['experiences_missing']++;
            $report['experiences'][] = array(
                'slug'   => $slug,
                'cms_id' => null,
                'action' => 'missing_in_wp',
                'price_preserved' => null,
            );
            continue;
        }

        $pid = (int) $existing->ID;
        $price = get_post_meta($pid, '_outbound_price_usd', true);
        $report['summary']['experiences_updated']++;
        $report['experiences'][] = array(
            'slug'            => $slug,
            'cms_id'          => $pid,
            'existing_title'  => (string) $existing->post_title,
            'new_title'       => (string) ($exp['title'] ?? $existing->post_title),
            'action'          => $dry_run ? 'would_update' : 'updated',
            'price_preserved' => $price !== '' ? $price : '(from baseline)',
        );

        if (!$dry_run) {
            wp_update_post(array(
                'ID'           => $pid,
                'post_title'   => (string) ($exp['title'] ?? $existing->post_title),
                'post_excerpt' => (string) ($exp['shortDescription'] ?? $existing->post_excerpt),
                'post_content' => (string) ($exp['fullOverview'] ?? $existing->post_content),
            ));
            update_post_meta($pid, '_outbound_subtitle', (string) ($exp['subtitle'] ?? ''));
            update_post_meta($pid, '_outbound_duration', (string) ($exp['duration'] ?? ''));
            update_post_meta($pid, '_outbound_location', (string) ($exp['location'] ?? ''));
            update_post_meta($pid, '_outbound_why_recommend', (string) ($exp['whyWeRecommend'] ?? ''));
            update_post_meta($pid, '_outbound_expert_tip', (string) ($exp['localExpertTip'] ?? ''));
            update_post_meta($pid, '_outbound_highlights_json', wp_json_encode(array_values((array) ($exp['highlights'] ?? array()))));
            update_post_meta($pid, '_outbound_inclusions_json', wp_json_encode(array_values((array) ($exp['whatsIncluded'] ?? array()))));
            update_post_meta($pid, '_outbound_exclusions_json', wp_json_encode(array_values((array) ($exp['whatsExcluded'] ?? array()))));
            update_post_meta($pid, '_outbound_good_to_know_json', wp_json_encode(array_values((array) ($exp['goodToKnow'] ?? array()))));
            update_post_meta($pid, '_outbound_faqs_json', wp_json_encode(array_values((array) ($exp['faqs'] ?? array()))));
            update_post_meta($pid, '_outbound_related_ids_json', wp_json_encode(array_values((array) ($exp['relatedIds'] ?? array()))));

            // Private verification metadata (never exposed in public snapshot)
            $ver = isset($exp['verification']) && is_array($exp['verification']) ? $exp['verification'] : array();
            update_post_meta($pid, '_outbound_supplier_name', (string) ($ver['supplierName'] ?? ''));
            update_post_meta($pid, '_outbound_product_variant', (string) ($ver['productVariant'] ?? ''));
            update_post_meta($pid, '_outbound_verification_status', (string) ($ver['verificationStatus'] ?? ''));
            update_post_meta($pid, '_outbound_source_url', (string) ($ver['sourceUrl'] ?? ''));
            update_post_meta($pid, '_outbound_verified_date', (string) ($ver['sourceCheckedOn'] ?? ''));
            update_post_meta($pid, '_outbound_supplier_notes', (string) ($ver['needsConfirmation'] ?? ''));
            update_post_meta($pid, '_outbound_park_fee_status', (string) ($ver['parkFeeStatus'] ?? ''));
        }
    }

    // 2. Reconcile 12 Accommodations & Room Types
    foreach ($acc_specs as $acc) {
        $slug = sanitize_title((string) ($acc['slug'] ?? ''));
        if ($slug === '') {
            continue;
        }
        $existing = outbound_find_cpt_by_slug('accommodation', $slug);
        if (!$existing) {
            $spec_rooms = isset($acc['roomTypes']) && is_array($acc['roomTypes']) ? $acc['roomTypes'] : array();
            $rec_rooms = outbound_reconcile_property_rooms_2026(array(), $spec_rooms, '');
            $report['summary']['accommodations_created_draft']++;
            $report['summary']['rooms_added_draft'] += $rec_rooms['stats']['added_draft'];
            $report['accommodations'][] = array(
                'slug'         => $slug,
                'cms_id'       => null,
                'action'       => $dry_run ? 'would_create_draft' : 'created_draft',
                'room_stats'   => $rec_rooms['stats'],
                'price_preserved' => 'N/A (new draft)',
            );

            if (!$dry_run) {
                $new_id = wp_insert_post(array(
                    'post_type'    => 'accommodation',
                    'post_name'    => $slug,
                    'post_title'   => (string) ($acc['name'] ?? $slug),
                    'post_excerpt' => (string) ($acc['shortDescription'] ?? ''),
                    'post_content' => (string) ($acc['editorialOverview'] ?? ''),
                    'post_status'  => 'draft',
                ));
                if ($new_id && !is_wp_error($new_id)) {
                    $nid = (int) $new_id;
                    $cat_id = (string) ($acc['accommodationCategory'] ?? 'hotels');
                    update_post_meta($nid, '_outbound_category_id', $cat_id);
                    update_post_meta($nid, '_outbound_category_label', (string) ($acc['category'] ?? 'Hotel'));
                    update_post_meta($nid, '_outbound_tagline', (string) ($acc['tagline'] ?? ''));
                    update_post_meta($nid, '_outbound_location', (string) ($acc['location'] ?? 'Victoria Falls, Zimbabwe'));
                    update_post_meta($nid, '_outbound_distance_falls', (string) ($acc['distanceFromFalls'] ?? ''));
                    update_post_meta($nid, '_outbound_airport_distance', (string) ($acc['airportDistance'] ?? ''));
                    update_post_meta($nid, '_outbound_why_recommend', (string) ($acc['whyWeRecommend'] ?? ''));
                    update_post_meta($nid, '_outbound_amenities_json', wp_json_encode(array_values((array) ($acc['amenities'] ?? array()))));
                    update_post_meta($nid, '_outbound_filter_tags_json', wp_json_encode(array_values((array) ($acc['filterTags'] ?? array()))));
                    update_post_meta($nid, '_outbound_at_a_glance_json', wp_json_encode((array) ($acc['atAGlance'] ?? array())));
                    update_post_meta($nid, '_outbound_facilities_json', wp_json_encode(array_values((array) ($acc['facilities'] ?? array()))));
                    update_post_meta($nid, '_outbound_location_info_json', wp_json_encode((array) ($acc['locationInfo'] ?? array())));
                    update_post_meta($nid, '_outbound_room_types_json', wp_json_encode($rec_rooms['rooms']));
                    if (function_exists('wp_set_object_terms')) {
                        wp_set_object_terms($nid, array(sanitize_title($cat_id)), 'accommodation_category', false);
                    }
                    $ver = isset($acc['verification']) && is_array($acc['verification']) ? $acc['verification'] : array();
                    update_post_meta($nid, '_outbound_supplier_name', (string) ($ver['supplierName'] ?? ''));
                    update_post_meta($nid, '_outbound_product_variant', (string) ($ver['productVariant'] ?? ''));
                    update_post_meta($nid, '_outbound_verification_status', (string) ($ver['verificationStatus'] ?? ''));
                    update_post_meta($nid, '_outbound_source_url', (string) ($ver['sourceUrl'] ?? ''));
                    update_post_meta($nid, '_outbound_verified_date', (string) ($ver['sourceCheckedOn'] ?? ''));
                    update_post_meta($nid, '_outbound_supplier_notes', (string) ($ver['needsConfirmation'] ?? ''));
                }
            }
            continue;
        }

        $pid = (int) $existing->ID;
        $raw_rooms = function_exists('outbound_decode_json_meta')
            ? outbound_decode_json_meta($pid, '_outbound_room_types_json', array())
            : array();
        $hero_img = function_exists('outbound_resolve_wp_post_image')
            ? outbound_resolve_wp_post_image($pid, '', 'hero')
            : '';
        $spec_rooms = isset($acc['roomTypes']) && is_array($acc['roomTypes']) ? $acc['roomTypes'] : array();
        $rec_rooms = outbound_reconcile_property_rooms_2026($raw_rooms, $spec_rooms, $hero_img);
        $price = get_post_meta($pid, '_outbound_price_usd', true);

        $report['summary']['accommodations_updated']++;
        $report['summary']['rooms_matched'] += $rec_rooms['stats']['matched'];
        $report['summary']['rooms_added_draft'] += $rec_rooms['stats']['added_draft'];
        $report['summary']['rooms_preserved_unmatched'] += $rec_rooms['stats']['preserved_unmatched'];
        $report['accommodations'][] = array(
            'slug'            => $slug,
            'cms_id'          => $pid,
            'action'          => $dry_run ? 'would_update' : 'updated',
            'room_stats'      => $rec_rooms['stats'],
            'price_preserved' => $price !== '' ? $price : '(from baseline)',
        );

        if (!$dry_run) {
            $post_update = array('ID' => $pid);
            if (!empty($acc['shortDescription'])) {
                $post_update['post_excerpt'] = (string) $acc['shortDescription'];
            }
            if (!empty($acc['editorialOverview'])) {
                $post_update['post_content'] = (string) $acc['editorialOverview'];
            }
            if (count($post_update) > 1) {
                wp_update_post($post_update);
            }
            if (!empty($acc['facilities'])) {
                update_post_meta($pid, '_outbound_facilities_json', wp_json_encode(array_values($acc['facilities'])));
            }
            if (!empty($acc['atAGlance']) && is_array($acc['atAGlance'])) {
                $cur_ag = outbound_decode_json_meta($pid, '_outbound_at_a_glance_json', array());
                update_post_meta($pid, '_outbound_at_a_glance_json', wp_json_encode(array_merge($cur_ag, $acc['atAGlance'])));
            }
            if (!empty($acc['locationInfo']) && is_array($acc['locationInfo'])) {
                $cur_li = outbound_decode_json_meta($pid, '_outbound_location_info_json', array());
                update_post_meta($pid, '_outbound_location_info_json', wp_json_encode(array_merge($cur_li, $acc['locationInfo'])));
            }
            update_post_meta($pid, '_outbound_room_types_json', wp_json_encode($rec_rooms['rooms']));

            $ver = isset($acc['verification']) && is_array($acc['verification']) ? $acc['verification'] : array();
            update_post_meta($pid, '_outbound_supplier_name', (string) ($ver['supplierName'] ?? ''));
            update_post_meta($pid, '_outbound_product_variant', (string) ($ver['productVariant'] ?? ''));
            update_post_meta($pid, '_outbound_verification_status', (string) ($ver['verificationStatus'] ?? ''));
            update_post_meta($pid, '_outbound_source_url', (string) ($ver['sourceUrl'] ?? ''));
            update_post_meta($pid, '_outbound_verified_date', (string) ($ver['sourceCheckedOn'] ?? ''));
            update_post_meta($pid, '_outbound_supplier_notes', (string) ($ver['needsConfirmation'] ?? ''));
        }
    }

    if (!$dry_run && function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return $report;
}

if (function_exists('add_action')) {
    add_action('admin_menu', static function (): void {
        if (!function_exists('add_submenu_page')) {
            return;
        }
        add_submenu_page(
            'outbound-cms',
            __('2026 Content Reconciliation', 'outbound-holidays'),
            __('2026 Reconciliation', 'outbound-holidays'),
            'manage_options',
            'outbound-reconciliation-2026',
            'outbound_render_reconciliation_2026_page'
        );
    }, 30);
}

/**
 * Render WP Admin page for Backup, Dry-Run Audit, and Idempotent Reconciliation.
 */
function outbound_render_reconciliation_2026_page(): void {
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('Unauthorized', 'outbound-holidays'));
    }

    if (!empty($_POST['outbound_recon_action']) && check_admin_referer('outbound_recon_2026_nonce')) {
        $act = sanitize_key((string) $_POST['outbound_recon_action']);
        if ($act === 'backup') {
            $backup = outbound_export_cms_backup();
            nocache_headers();
            header('Content-Type: application/json; charset=utf-8');
            header('Content-Disposition: attachment; filename="outbound-cms-backup-' . gmdate('Ymd-His') . '.json"');
            echo wp_json_encode($backup, JSON_PRETTY_PRINT);
            exit;
        }
    }

    $result = null;
    if (!empty($_POST['outbound_recon_action']) && check_admin_referer('outbound_recon_2026_nonce')) {
        $act = sanitize_key((string) $_POST['outbound_recon_action']);
        if ($act === 'dry_run') {
            $result = outbound_reconcile_2026_content(true);
        } elseif ($act === 'apply') {
            $result = outbound_reconcile_2026_content(false);
        }
    }
    ?>
    <div class="wrap">
        <h1>Outbound Holidays — 2026 Content Reconciliation &amp; Backup</h1>
        <p>Safely audit and apply the 25 verified experiences and 12 accommodations without overwriting existing prices, images, IDs, or manually added records (such as <code>quad-bikes</code>).</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0;">
            <form method="post">
                <?php wp_nonce_field('outbound_recon_2026_nonce'); ?>
                <input type="hidden" name="outbound_recon_action" value="backup" />
                <button type="submit" class="button">1. Download Full CMS JSON Backup</button>
            </form>
            <form method="post">
                <?php wp_nonce_field('outbound_recon_2026_nonce'); ?>
                <input type="hidden" name="outbound_recon_action" value="dry_run" />
                <button type="submit" class="button button-secondary">2. Run Dry-Run Audit (No Changes)</button>
            </form>
            <form method="post" onsubmit="return confirm('Create automatic backup and apply idempotent 2026 content reconciliation? Existing prices and images will be preserved.');">
                <?php wp_nonce_field('outbound_recon_2026_nonce'); ?>
                <input type="hidden" name="outbound_recon_action" value="apply" />
                <button type="submit" class="button button-primary">3. Apply Idempotent Reconciliation</button>
            </form>
        </div>
        <?php if (is_array($result)) : ?>
            <div class="notice notice-info"><p><strong><?php echo !empty($result['dry_run']) ? 'Dry-Run Completed' : 'Reconciliation Applied'; ?>:</strong> <?php echo esc_html((string) wp_json_encode($result['summary'])); ?></p></div>
            <pre style="background:#fff;padding:12px;border:1px solid #ccd0d4;max-height:520px;overflow:auto;"><?php echo esc_html((string) wp_json_encode($result, JSON_PRETTY_PRINT)); ?></pre>
        <?php endif; ?>
    </div>
    <?php
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('outbound reconcile-2026', static function ($args, $assoc_args): void {
        $apply = !empty($assoc_args['apply']);
        $res = outbound_reconcile_2026_content(!$apply);
        WP_CLI::line(wp_json_encode($res, JSON_PRETTY_PRINT));
    });
}

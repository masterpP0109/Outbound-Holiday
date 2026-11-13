<?php
/**
 * Outbound CMS — Unified 14-Section Native WordPress Administration Interface.
 * Implements section-scoped lazy rendering, Draft -> Private Preview -> Publish workflow,
 * Media Library pickers, repeater controls, paginated CPT/SEO lists, and live Hero preview.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Return ordered metadata for all 14 numbered Outbound CMS sections.
 *
 * @return array<string, array{num:int,id:string,label:string,short:string,desc:string}>
 */
function outbound_cms_get_sections(): array {
    return array(
        'overview' => array(
            'num'   => 1,
            'id'    => 'overview',
            'label' => '1. Website Overview',
            'short' => '1. Overview',
            'desc'  => 'Live content counts, draft publishing status, and quick shortcuts across Outbound Holidays.',
        ),
        'homepage' => array(
            'num'   => 2,
            'id'    => 'homepage',
            'label' => '2. Homepage & Hero',
            'short' => '2. Homepage & Hero',
            'desc'  => 'Edit the hero headline, media, Quick Planning Bar, section visibility toggles, Why Outbound cards, and homepage curations.',
        ),
        'experiences' => array(
            'num'   => 3,
            'id'    => 'experiences',
            'label' => '3. Experiences',
            'short' => '3. Experiences',
            'desc'  => 'Manage Things to Do directory copy, featured homepage picks, and native Experience CPT entries.',
        ),
        'accommodation' => array(
            'num'   => 4,
            'id'    => 'accommodation',
            'label' => '4. Accommodation',
            'short' => '4. Accommodation',
            'desc'  => 'Manage Where to Stay section headings, featured properties, and native Accommodation CPT entries.',
        ),
        'packages' => array(
            'num'   => 5,
            'id'    => 'packages',
            'label' => '5. Holiday Packages',
            'short' => '5. Packages',
            'desc'  => 'Edit recommended packages headings, price disclaimers, featured packages, and Package CPT items.',
        ),
        'guides' => array(
            'num'   => 6,
            'id'    => 'guides',
            'label' => '6. Guides & Articles',
            'short' => '6. Guides & Blog',
            'desc'  => 'Manage Victoria Falls Planning Guides (CPT), native WordPress Blog Posts, and guide hub titles.',
        ),
        'galleries' => array(
            'num'   => 7,
            'id'    => 'galleries',
            'label' => '7. Galleries & Media',
            'short' => '7. Galleries',
            'desc'  => 'Manage Client Albums, photo collections, and WordPress Media Library assets.',
        ),
        'testimonials' => array(
            'num'   => 8,
            'id'    => 'testimonials',
            'label' => '8. Testimonials & Reviews',
            'short' => '8. Testimonials',
            'desc'  => 'Edit Traveller Stories headings, Google review ratings, and manage guest review items.',
        ),
        'about-contact' => array(
            'num'   => 9,
            'id'    => 'about-contact',
            'label' => '9. About & Contact',
            'short' => '9. About & Contact',
            'desc'  => 'Edit WhatsApp concierge number, contact email, office address, opening hours, and founder story.',
        ),
        'header' => array(
            'num'   => 10,
            'id'    => 'header',
            'label' => '10. Header & Navigation',
            'short' => '10. Header & Nav',
            'desc'  => 'Edit header banner strip, primary logo, navigation link labels, search placeholder, and CTA button.',
        ),
        'footer' => array(
            'num'   => 11,
            'id'    => 'footer',
            'label' => '11. Footer & Global Content',
            'short' => '11. Footer & Global',
            'desc'  => 'Edit footer summary, legal copyright, payment badges, Travel Club newsletter banner, and currency rates.',
        ),
        'builder' => array(
            'num'   => 12,
            'id'    => 'builder',
            'label' => '12. Holiday Builder Settings',
            'short' => '12. Holiday Builder',
            'desc'  => 'Configure stay tiers, activity add-on pricing, durations, and builder images.',
        ),
        'design' => array(
            'num'   => 13,
            'id'    => 'design',
            'label' => '13. Design & Layout',
            'short' => '13. Design & Layout',
            'desc'  => 'Adjust global brand color tokens safely with one-click reset to the original React palette.',
        ),
        'seo' => array(
            'num'   => 14,
            'id'    => 'seo',
            'label' => '14. SEO & Publishing',
            'short' => '14. SEO & Publish',
            'desc'  => 'Edit per-route SEO meta titles and descriptions, preview unpublished drafts, and publish changes.',
        ),
    );
}

/**
 * Escaping & sanitization shims so pure functions run cleanly both in WP and headless PHP unit tests.
 */
function outbound_cms_esc_attr(string $val): string {
    return function_exists('esc_attr') ? (string) esc_attr($val) : htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
}

function outbound_cms_esc_html(string $val): string {
    return function_exists('esc_html') ? (string) esc_html($val) : htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
}

function outbound_cms_esc_url(string $val): string {
    return function_exists('esc_url') ? (string) esc_url($val) : htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
}

function outbound_cms_sanitize_text(string $val): string {
    if (function_exists('sanitize_text_field')) {
        return (string) sanitize_text_field($val);
    }
    return trim(strip_tags($val));
}

function outbound_cms_sanitize_textarea(string $val): string {
    if (function_exists('sanitize_textarea_field')) {
        return (string) sanitize_textarea_field($val);
    }
    return trim(strip_tags($val));
}

function outbound_cms_sanitize_url(string $val): string {
    $clean = trim($val);
    if ($clean === '') {
        return '';
    }
    if (function_exists('esc_url_raw')) {
        return (string) esc_url_raw($clean);
    }
    return filter_var($clean, FILTER_SANITIZE_URL) ?: '';
}

function outbound_cms_sanitize_hex(string $val, string $fallback): string {
    $clean = trim($val);
    if (preg_match('/^#[0-9a-fA-F]{6}$/', $clean)) {
        return strtoupper($clean);
    }
    return $fallback;
}

/**
 * Transform and sanitize incoming section POST form data into a clean CMS patch payload.
 * Used both on Save Draft and Publish Changes.
 *
 * @param array<string, mixed> $raw
 * @return array<string, mixed>
 */
function outbound_cms_sanitize_section_patch(string $section, array $raw): array {
    $patch = array();

    $ed_strings = array();
    if (!empty($raw['ed']) && is_array($raw['ed'])) {
        foreach ($raw['ed'] as $k => $v) {
            if (!is_string($k) || $k === '') {
                continue;
            }
            $str = is_string($v) ? $v : '';
            if (str_contains(strtolower($k), 'image') || str_contains(strtolower($k), 'logo') || str_contains(strtolower($k), 'url')) {
                $ed_strings[$k] = outbound_cms_sanitize_url($str);
            } elseif (strlen($str) > 140 || str_contains($str, "\n")) {
                $ed_strings[$k] = outbound_cms_sanitize_textarea($str);
            } else {
                $ed_strings[$k] = outbound_cms_sanitize_text($str);
            }
        }
    }
    if (!empty($ed_strings)) {
        $patch['editorial_strings'] = $ed_strings;
    }

    if ($section === 'homepage') {
        $toggle_keys = array(
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
        );
        $hp_sec = array();
        $posted_vis = isset($raw['vis']) && is_array($raw['vis']) ? $raw['vis'] : array();
        foreach ($toggle_keys as $tk) {
            $hp_sec[$tk] = !empty($posted_vis[$tk]);
        }
        $patch['site_options'] = array('homepageSections' => $hp_sec);

        if (isset($raw['featured']) && is_array($raw['featured'])) {
            $feat = array();
            foreach (array('accommodationIds', 'experienceIds', 'packageIds') as $fk) {
                $vals = isset($raw['featured'][$fk]) && is_array($raw['featured'][$fk]) ? $raw['featured'][$fk] : array();
                $feat[$fk] = array_values(array_filter(array_map('outbound_cms_sanitize_text', array_map('strval', $vals))));
            }
            $patch['featured'] = $feat;
        }

        if (isset($raw['why_cards']) && is_array($raw['why_cards'])) {
            $cards = array();
            $allowed_icons = array('ShieldCheck', 'MapPin', 'Sparkles', 'Headset');
            foreach ($raw['why_cards'] as $row) {
                if (!is_array($row)) {
                    continue;
                }
                $title = outbound_cms_sanitize_text((string) ($row['title'] ?? ''));
                $desc  = outbound_cms_sanitize_textarea((string) ($row['description'] ?? ''));
                $label = outbound_cms_sanitize_text((string) ($row['label'] ?? ''));
                $icon  = outbound_cms_sanitize_text((string) ($row['iconName'] ?? 'ShieldCheck'));
                if (!in_array($icon, $allowed_icons, true)) {
                    $icon = 'ShieldCheck';
                }
                if ($title !== '' || $desc !== '') {
                    $cards[] = array(
                        'iconName'    => $icon,
                        'title'       => $title,
                        'description' => $desc,
                        'label'       => $label,
                    );
                }
            }
            if (!empty($cards)) {
                $patch['editorial_structures'] = array(
                    'travel/WhyChooseOutbound.section1' => $cards,
                );
            }
        }
    } elseif ($section === 'testimonials') {
        if (isset($raw['reviews']) && is_array($raw['reviews'])) {
            $clean_reviews = array();
            foreach ($raw['reviews'] as $idx => $r) {
                if (!is_array($r)) {
                    continue;
                }
                $author  = outbound_cms_sanitize_text((string) ($r['author'] ?? ''));
                $comment = outbound_cms_sanitize_textarea((string) ($r['comment'] ?? ''));
                if ($author === '' && $comment === '') {
                    continue;
                }
                $rating = max(1, min(5, (int) ($r['rating'] ?? 5)));
                $clean_reviews[] = array(
                    'id'            => outbound_cms_sanitize_text((string) ($r['id'] ?? ('rev-' . ($idx + 1)))),
                    'author'        => $author ?: 'Verified Traveller',
                    'roleOrCity'    => outbound_cms_sanitize_text((string) ($r['roleOrCity'] ?? 'Victoria Falls Guest')),
                    'date'          => outbound_cms_sanitize_text((string) ($r['date'] ?? gmdate('F Y'))),
                    'title'         => outbound_cms_sanitize_text((string) ($r['title'] ?? 'Memorable Victoria Falls Holiday')),
                    'comment'       => $comment,
                    'rating'        => $rating,
                    'type'          => 'travel',
                    'verifiedBuyer' => !empty($r['verifiedBuyer']),
                    'avatar'        => outbound_cms_sanitize_url((string) ($r['avatar'] ?? '')) ?: outbound_get_media_fallback('falls'),
                );
            }
            if (!empty($clean_reviews)) {
                $patch['reviews'] = $clean_reviews;
            }
        }
    } elseif ($section === 'about-contact') {
        if (isset($raw['contact']) && is_array($raw['contact'])) {
            $email = function_exists('sanitize_email')
                ? sanitize_email((string) ($raw['contact']['email'] ?? ''))
                : filter_var((string) ($raw['contact']['email'] ?? ''), FILTER_SANITIZE_EMAIL);
            $patch['site_options'] = array(
                'contact' => array(
                    'whatsappNumber' => preg_replace('/[^0-9]/', '', (string) ($raw['contact']['whatsappNumber'] ?? '263714701721')),
                    'displayNumber'  => outbound_cms_sanitize_text((string) ($raw['contact']['displayNumber'] ?? '')),
                    'email'          => (string) $email,
                    'address'        => outbound_cms_sanitize_text((string) ($raw['contact']['address'] ?? '')),
                    'hours'          => outbound_cms_sanitize_text((string) ($raw['contact']['hours'] ?? '')),
                ),
            );
            if (!empty($patch['site_options']['contact']['address'])) {
                $patch['editorial_strings']['common/Footer.text4'] = $patch['site_options']['contact']['address'];
                $patch['editorial_strings']['travel/ContactUsView.text7'] = $patch['site_options']['contact']['address'];
            }
        }
    } elseif ($section === 'footer') {
        if (isset($raw['social']) && is_array($raw['social'])) {
            $patch['site_options'] = array(
                'social' => array(
                    'facebook'  => outbound_cms_sanitize_url((string) ($raw['social']['facebook'] ?? '')),
                    'instagram' => outbound_cms_sanitize_url((string) ($raw['social']['instagram'] ?? '')),
                    'youtube'   => outbound_cms_sanitize_url((string) ($raw['social']['youtube'] ?? '')),
                ),
                'legal' => array(
                    'copyright' => outbound_cms_sanitize_text((string) ($raw['ed']['common/Footer.text17'] ?? '')),
                ),
            );
        }
        if (isset($raw['rates']) && is_array($raw['rates'])) {
            $clean_rates = array();
            foreach ($raw['rates'] as $code => $cfg) {
                $c = strtoupper(preg_replace('/[^A-Z]/', '', (string) $code));
                if ($c === '' || !is_array($cfg)) {
                    continue;
                }
                $rate = (float) ($cfg['rate'] ?? 1);
                if ($c === 'USD') {
                    $rate = 1.0;
                }
                if ($rate > 0) {
                    $clean_rates[$c] = array(
                        'symbol' => outbound_cms_sanitize_text((string) ($cfg['symbol'] ?? $c)),
                        'rate'   => round($rate, 4),
                    );
                }
            }
            if (!empty($clean_rates)) {
                $patch['currency_rates'] = $clean_rates;
            }
        }
    } elseif ($section === 'builder') {
        if (isset($raw['stay_tiers']) && is_array($raw['stay_tiers'])) {
            $tiers = array();
            foreach ($raw['stay_tiers'] as $idx => $t) {
                if (!is_array($t)) {
                    continue;
                }
                $name = outbound_cms_sanitize_text((string) ($t['name'] ?? ''));
                if ($name === '') {
                    continue;
                }
                $hl_raw = (string) ($t['highlights_text'] ?? '');
                $hl_arr = $hl_raw !== ''
                    ? array_values(array_filter(array_map('outbound_cms_sanitize_text', preg_split('/\r\n|\r|\n/', $hl_raw) ?: array())))
                    : array();
                $tiers[] = array(
                    'id'               => sanitize_title((string) ($t['id'] ?? $name)) ?: ('tier-' . ($idx + 1)),
                    'name'             => $name,
                    'tagline'          => outbound_cms_sanitize_text((string) ($t['tagline'] ?? '')),
                    'pricePerNightUSD' => max(0, (float) ($t['pricePerNightUSD'] ?? ($t['startingPrice'] ?? 150))),
                    'imageUrl'         => outbound_cms_sanitize_url((string) ($t['imageUrl'] ?? '')) ?: outbound_get_media_fallback('hero'),
                    'desc'             => outbound_cms_sanitize_textarea((string) ($t['desc'] ?? '')),
                    'highlights'       => !empty($hl_arr) ? $hl_arr : array('Breakfast included', 'Local specialist support'),
                );
            }
            if (!empty($tiers)) {
                $patch['builder_stay_tiers'] = $tiers;
            }
        }
        if (isset($raw['builder_activities']) && is_array($raw['builder_activities'])) {
            $acts = array();
            foreach ($raw['builder_activities'] as $idx => $a) {
                if (!is_array($a)) {
                    continue;
                }
                $title = outbound_cms_sanitize_text((string) ($a['title'] ?? ''));
                if ($title === '') {
                    continue;
                }
                $acts[] = array(
                    'id'           => sanitize_title((string) ($a['id'] ?? $title)) ?: ('act-' . ($idx + 1)),
                    'title'        => $title,
                    'duration'     => outbound_cms_sanitize_text((string) ($a['duration'] ?? 'Half Day')),
                    'priceUSD'     => max(0, (float) ($a['priceUSD'] ?? ($a['priceAmount'] ?? 65))),
                    'imageUrl'     => outbound_cms_sanitize_url((string) ($a['imageUrl'] ?? ($a['image'] ?? ''))) ?: outbound_get_media_fallback('falls'),
                    'badge'        => outbound_cms_sanitize_text((string) ($a['badge'] ?? 'Popular')),
                    'shortDesc'    => outbound_cms_sanitize_textarea((string) ($a['shortDesc'] ?? '')),
                );
            }
            if (!empty($acts)) {
                $patch['builder_activities'] = $acts;
            }
        }
    } elseif ($section === 'design') {
        $d = isset($raw['design']) && is_array($raw['design']) ? $raw['design'] : array();
        $patch['design_tokens'] = array(
            'primaryColor'   => outbound_cms_sanitize_hex((string) ($d['primaryColor'] ?? ''), '#0B5E8E'),
            'secondaryColor' => outbound_cms_sanitize_hex((string) ($d['secondaryColor'] ?? ''), '#C9A66B'),
            'accentColor'    => outbound_cms_sanitize_hex((string) ($d['accentColor'] ?? ''), '#E67E22'),
            'greenColor'     => outbound_cms_sanitize_hex((string) ($d['greenColor'] ?? ''), '#3F6B3C'),
            'darkColor'      => outbound_cms_sanitize_hex((string) ($d['darkColor'] ?? ''), '#2F3A44'),
        );
    } elseif ($section === 'seo') {
        if (isset($raw['route_seo']) && is_array($raw['route_seo'])) {
            $clean_seo = array();
            foreach ($raw['route_seo'] as $rpath => $meta) {
                if (!is_string($rpath) || !is_array($meta)) {
                    continue;
                }
                $title = outbound_cms_sanitize_text((string) ($meta['title'] ?? ''));
                $desc  = outbound_cms_sanitize_textarea((string) ($meta['description'] ?? ''));
                if ($title !== '' || $desc !== '') {
                    $clean_seo[$rpath] = array(
                        'title'       => $title,
                        'description' => $desc,
                    );
                }
            }
            if (!empty($clean_seo)) {
                $patch['route_seo'] = $clean_seo;
            }
        }
    }

    return $patch;
}

/**
 * Resolve effective field value from live+draft snapshot for display in CMS editor inputs.
 *
 * @param array<string, mixed> $snapshot
 */
function outbound_cms_get_ed(array $snapshot, string $key, string $fallback = ''): string {
    $val = $snapshot['site']['editorial']['strings'][$key] ?? null;
    if (is_string($val) && $val !== '') {
        return trim($val);
    }
    return $fallback;
}

/**
 * Render a reusable WordPress Media Library single-image picker with live preview thumbnail.
 */
function outbound_cms_render_media_input(string $name, string $value, string $id_slug, string $placeholder = 'https://...'): void {
    $val_attr = outbound_cms_esc_attr($value);
    $id_attr  = outbound_cms_esc_attr($id_slug);
    $name_attr = outbound_cms_esc_attr($name);
    echo '<div class="outbound-media-picker">';
    echo '<img id="' . $id_attr . '_preview" class="outbound-media-thumb' . ($value !== '' ? ' has-src' : '') . '" src="' . ($value !== '' ? outbound_cms_esc_url($value) : '') . '" alt="" />';
    echo '<div class="outbound-media-controls">';
    echo '<input type="url" class="large-text code outbound-media-url-input" id="' . $id_attr . '" name="' . $name_attr . '" value="' . $val_attr . '" data-preview="#' . $id_attr . '_preview" placeholder="' . outbound_cms_esc_attr($placeholder) . '" />';
    echo '<div class="outbound-media-btn-row">';
    echo '<button type="button" class="button outbound-media-single-btn" data-target="#' . $id_attr . '">Choose from Media Library</button> ';
    echo '<button type="button" class="button-link outbound-media-clear-btn" data-target="#' . $id_attr . '">Clear</button>';
    echo '</div></div></div>';
}

/**
 * Render a paginated, searchable WordPress CPT list card inside a CMS section.
 */
function outbound_cms_render_cpt_list_card(string $post_type, string $singular, string $plural, string $section_id, string $search, int $paged, string $taxonomy = ''): void {
    $per_page = 15;
    $counts   = wp_count_posts($post_type);
    $pub      = isset($counts->publish) ? (int) $counts->publish : 0;
    $draft    = isset($counts->draft) ? (int) $counts->draft : 0;

    $query = new WP_Query(array(
        'post_type'      => $post_type,
        'post_status'    => array('publish', 'draft', 'pending'),
        'posts_per_page' => $per_page,
        'paged'          => max(1, $paged),
        's'              => $search,
        'orderby'        => array('menu_order' => 'ASC', 'date' => 'DESC'),
    ));

    $add_url  = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id) . '&new_item=1' . ($post_type === 'post' ? '&item_type=post' : ''));
    $all_url  = admin_url('edit.php?post_type=' . rawurlencode($post_type));
    $base_url = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id));
    $tax_url  = $taxonomy !== '' ? admin_url('edit-tags.php?taxonomy=' . rawurlencode($taxonomy) . '&post_type=' . rawurlencode($post_type)) : '';

    echo '<div class="outbound-admin-card">';
    echo '<div class="outbound-card-toolbar">';
    echo '<div><h2>' . outbound_cms_esc_html($plural) . ' (' . $pub . ' published, ' . $draft . ' drafts)</h2>';
    echo '<p class="description">Click <strong>Edit in Studio</strong> for full visual editing of galleries, repeaters, FAQs &amp; SEO directly in Outbound CMS.</p></div>';
    echo '<div class="outbound-toolbar-actions">';
    echo '<a class="button button-primary" href="' . outbound_cms_esc_url($add_url) . '">+ Add ' . outbound_cms_esc_html($singular) . '</a> ';
    echo '<a class="button" href="' . outbound_cms_esc_url($all_url) . '">WP List</a>';
    if ($tax_url !== '') {
        echo ' <a class="button" href="' . outbound_cms_esc_url($tax_url) . '">Manage Categories</a>';
    }
    echo '</div></div>';

    echo '<form method="get" action="' . outbound_cms_esc_url(admin_url('admin.php')) . '" class="outbound-filter-bar">';
    echo '<input type="hidden" name="page" value="outbound-cms" />';
    echo '<input type="hidden" name="section" value="' . outbound_cms_esc_attr($section_id) . '" />';
    echo '<input type="search" name="q" value="' . outbound_cms_esc_attr($search) . '" placeholder="Search ' . outbound_cms_esc_attr(strtolower($plural)) . '..." class="regular-text" />';
    echo '<button type="submit" class="button">Filter</button>';
    if ($search !== '') {
        echo ' <a class="button-link" href="' . outbound_cms_esc_url($base_url) . '">Reset</a>';
    }
    echo '</form>';

    if (!$query->have_posts()) {
        echo '<div class="outbound-empty-box"><p>No WordPress <strong>' . outbound_cms_esc_html($plural) . '</strong> records matched yet. Public visitors still see baseline catalog items until you import via <a href="' . outbound_cms_esc_url(admin_url('admin.php?page=outbound-migration')) . '">Content Migration</a> or create one with <strong>+ Add ' . outbound_cms_esc_html($singular) . '</strong>.</p></div>';
    } else {
        echo '<table class="widefat striped outbound-cms-table"><thead><tr><th>Image</th><th>Title / Slug</th><th>Details</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        foreach ($query->posts as $p) {
            $pid    = (int) $p->ID;
            $price  = get_post_meta($pid, '_outbound_price_usd', true);
            $dur    = get_post_meta($pid, '_outbound_duration', true);
            $loc    = get_post_meta($pid, '_outbound_location', true);
            $feat   = get_post_meta($pid, '_outbound_featured', true);
            $img    = (string) get_post_meta($pid, '_outbound_hero_image_url', true);
            if ($img === '' && function_exists('outbound_get_post_image_url')) {
                $img = outbound_get_post_image_url($pid, 'thumbnail', 'hero');
            }
            $wp_edit = get_edit_post_link($pid) ?: admin_url('post.php?post=' . $pid . '&action=edit');
            $studio_edit = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id) . '&edit_item=' . $pid . ($post_type === 'post' ? '&item_type=post' : ''));
            $view_l  = get_permalink($pid);
            $prev_l  = $view_l ? add_query_arg('outbound_preview', '1', $view_l) : home_url('/?outbound_preview=1');

            $details = array();
            if ($price !== '') {
                $details[] = '$' . outbound_cms_esc_html((string) $price) . ' USD';
            }
            if ($dur !== '') {
                $details[] = outbound_cms_esc_html((string) $dur);
            }
            if ($loc !== '') {
                $details[] = outbound_cms_esc_html((string) $loc);
            }
            if ($feat === '1') {
                $details[] = '<span class="outbound-badge outbound-badge-blue">Featured</span>';
            }

            echo '<tr>';
            echo '<td style="width:64px;">' . ($img !== '' ? '<img src="' . outbound_cms_esc_url($img) . '" alt="" style="width:52px;height:38px;object-fit:cover;border-radius:6px;" />' : '—') . '</td>';
            echo '<td><strong><a href="' . outbound_cms_esc_url($studio_edit) . '">' . outbound_cms_esc_html((string) $p->post_title) . '</a></strong><br><code>' . outbound_cms_esc_html((string) $p->post_name) . '</code></td>';
            echo '<td>' . (!empty($details) ? implode(' · ', $details) : '—') . '</td>';
            echo '<td><span class="outbound-badge ' . ($p->post_status === 'publish' ? 'outbound-badge-green' : 'outbound-badge-amber') . '">' . outbound_cms_esc_html((string) $p->post_status) . '</span></td>';
            echo '<td><a class="button button-primary button-small" href="' . outbound_cms_esc_url($studio_edit) . '">Edit in Studio</a> ';
            if ($p->post_status !== 'publish') {
                echo '<a class="button button-small" href="' . outbound_cms_esc_url($prev_l) . '" target="_blank" rel="noopener">Preview Draft</a> ';
            } elseif ($view_l) {
                echo '<a class="button button-small" href="' . outbound_cms_esc_url($view_l) . '" target="_blank" rel="noopener">View</a> ';
            }
            echo '<a class="button-link" href="' . outbound_cms_esc_url($wp_edit) . '" style="font-size:11px;">WP Edit</a>';
            echo '</td></tr>';
        }
        echo '</tbody></table>';

        $total_pages = (int) $query->max_num_pages;
        if ($total_pages > 1) {
            echo '<div class="outbound-pagination">';
            for ($i = 1; $i <= $total_pages; $i++) {
                $p_url = add_query_arg(array('paged' => $i, 'q' => $search), $base_url);
                $cls   = $i === $paged ? 'button button-primary button-small' : 'button button-small';
                echo '<a class="' . $cls . '" href="' . outbound_cms_esc_url($p_url) . '">' . $i . '</a> ';
            }
            echo '</div>';
        }
    }
    echo '</div>';
}

/**
 * Render targeted inline Content Studio form for a single CPT item inside Outbound CMS.
 * Loads only ONE post at a time to eliminate 502 timeouts and oversized DOM trees.
 */
function outbound_cms_render_single_item_studio(string $section_id, string $post_type, int $post_id, bool $is_new, string $preview_url): void {
    $post = null;
    if ($post_id > 0) {
        $cand = get_post($post_id);
        if ($cand instanceof WP_Post && $cand->post_type === $post_type) {
            $post = $cand;
        }
    }
    if (!$post) {
        $post = new WP_Post((object) array(
            'ID'           => 0,
            'post_type'    => $post_type,
            'post_status'  => 'draft',
            'post_title'   => '',
            'post_name'    => '',
            'post_excerpt' => '',
            'post_content' => '',
            'menu_order'   => 0,
        ));
    }

    $back_url    = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id));
    $form_action = $post->ID > 0
        ? admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id) . '&edit_item=' . (int) $post->ID)
        : admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id) . '&new_item=1');
    $item_preview = $post->ID > 0 && get_permalink($post->ID)
        ? add_query_arg('outbound_preview', '1', (string) get_permalink($post->ID))
        : $preview_url;
    ?>
    <div class="outbound-admin-card" style="padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <div>
            <a href="<?php echo outbound_cms_esc_url($back_url); ?>" class="button">&larr; Back to All <?php echo outbound_cms_esc_html(ucfirst($section_id)); ?></a>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
            <?php if ($post->ID > 0) : ?>
                <span class="outbound-badge <?php echo $post->post_status === 'publish' ? 'outbound-badge-green' : 'outbound-badge-amber'; ?>">
                    <?php echo $post->post_status === 'publish' ? 'Published' : 'Draft'; ?>
                </span>
                <a href="<?php echo outbound_cms_esc_url($item_preview); ?>" target="_blank" rel="noopener" class="button">Preview Record</a>
            <?php endif; ?>
        </div>
    </div>

    <form method="post" action="<?php echo outbound_cms_esc_url($form_action); ?>" id="outbound-cms-item-form">
        <?php wp_nonce_field('outbound_cms_item_action', 'outbound_cms_item_nonce'); ?>
        <input type="hidden" name="outbound_cms_item_post_type" value="<?php echo outbound_cms_esc_attr($post_type); ?>" />
        <input type="hidden" name="outbound_cms_item_post_id" value="<?php echo (int) $post->ID; ?>" />

        <?php
        switch ($post_type) {
            case 'experience':
                outbound_editor_render_experience_fields($post, true);
                break;
            case 'accommodation':
                outbound_editor_render_accommodation_fields($post, true);
                break;
            case 'package':
                outbound_editor_render_package_fields($post, true);
                break;
            case 'guide_article':
            case 'post':
                outbound_editor_render_guide_fields($post, true);
                break;
            case 'client_album':
                outbound_editor_render_album_fields($post, true);
                break;
        }
        ?>

        <div class="outbound-sticky-action-bar">
            <div class="outbound-sticky-status">
                <?php if ($post->ID > 0) : ?>
                    <span class="outbound-badge <?php echo $post->post_status === 'publish' ? 'outbound-badge-green' : 'outbound-badge-amber'; ?>">
                        <?php echo $post->post_status === 'publish' ? 'Currently Published' : 'Saved as Draft'; ?>
                    </span>
                <?php else : ?>
                    <span class="outbound-badge outbound-badge-blue">New Record</span>
                <?php endif; ?>
            </div>
            <div class="outbound-sticky-buttons">
                <a href="<?php echo outbound_cms_esc_url($back_url); ?>" class="button">Cancel</a>
                <?php if ($post->ID > 0) : ?>
                    <a href="<?php echo outbound_cms_esc_url($item_preview); ?>" target="_blank" rel="noopener" class="button">Preview Draft</a>
                <?php endif; ?>
                <button type="submit" name="outbound_cms_item_action" value="save_item_draft" class="button button-secondary">Save as Draft</button>
                <button type="submit" name="outbound_cms_item_action" value="publish_item" class="button button-primary"><?php echo $post->post_status === 'publish' ? 'Update Live' : 'Publish Live'; ?></button>
            </div>
        </div>
    </form>
    <?php
}

/**
 * Render unified 14-section Outbound CMS page in WordPress Admin.
 */
function outbound_render_cms_hub_page(): void {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have permission to access Outbound CMS.', 'outbound-holidays'));
    }

    $sections       = outbound_cms_get_sections();
    $active_section = isset($_GET['section']) ? sanitize_key((string) $_GET['section']) : 'overview';
    if (!isset($sections[$active_section])) {
        $active_section = 'overview';
    }
    $search       = isset($_GET['q']) ? outbound_cms_sanitize_text((string) wp_unslash($_GET['q'])) : '';
    $paged        = max(1, (int) ($_GET['paged'] ?? 1));
    $edit_item_id = isset($_GET['edit_item']) ? (int) $_GET['edit_item'] : 0;
    $is_new_item  = !empty($_GET['new_item']);

    $section_cpt_map = array(
        'experiences'   => 'experience',
        'accommodation' => 'accommodation',
        'packages'      => 'package',
        'guides'        => 'guide_article',
        'galleries'     => 'client_album',
    );
    $active_cpt = $section_cpt_map[$active_section] ?? '';
    if ($active_section === 'guides' && (($_GET['item_type'] ?? '') === 'post' || ($edit_item_id > 0 && get_post_type($edit_item_id) === 'post'))) {
        $active_cpt = 'post';
    }

    $notice = null;
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['outbound_cms_item_action'])) {
        check_admin_referer('outbound_cms_item_action', 'outbound_cms_item_nonce');
        $item_action = sanitize_key((string) wp_unslash($_POST['outbound_cms_item_action']));
        $post_type   = sanitize_key((string) wp_unslash($_POST['outbound_cms_item_post_type'] ?? $active_cpt));
        $post_id     = (int) ($_POST['outbound_cms_item_post_id'] ?? $edit_item_id);
        $target_stat = $item_action === 'publish_item' ? 'publish' : 'draft';
        $unslashed   = wp_unslash($_POST);
        $res         = outbound_cms_save_item_record($post_type, $post_id, $target_stat, is_array($unslashed) ? $unslashed : array());
        if (!empty($res['error'])) {
            $notice = array('type' => 'error', 'msg' => (string) $res['error']);
        } else {
            $edit_item_id = (int) $res['post_id'];
            $is_new_item  = false;
            $notice       = $res['status'] === 'publish'
                ? array('type' => 'success', 'msg' => 'Record published live and snapshot cache refreshed.')
                : array('type' => 'info', 'msg' => 'Record saved as Draft. Only authenticated admins using ?outbound_preview=1 can see it until published.');
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['outbound_cms_hub_action'])) {
        check_admin_referer('outbound_cms_hub_action', 'outbound_cms_hub_nonce');
        $action      = sanitize_key((string) wp_unslash($_POST['outbound_cms_hub_action']));
        $post_sec    = isset($_POST['outbound_cms_section']) ? sanitize_key((string) wp_unslash($_POST['outbound_cms_section'])) : $active_section;
        $raw_payload = isset($_POST['cms']) && is_array($_POST['cms']) ? wp_unslash($_POST['cms']) : array();

        if ($action === 'discard_draft') {
            outbound_discard_cms_draft();
            $notice = array('type' => 'warning', 'msg' => 'Unpublished draft changes have been discarded. Public visitors continue to see the live site.');
        } elseif ($action === 'reset_design_tokens') {
            outbound_save_cms_draft_patch(array(
                'design_tokens' => array(
                    'primaryColor'   => '#0B5E8E',
                    'secondaryColor' => '#C9A66B',
                    'accentColor'    => '#E67E22',
                    'greenColor'     => '#3F6B3C',
                    'darkColor'      => '#2F3A44',
                ),
            ), 'design');
            $notice = array('type' => 'info', 'msg' => 'Original React color palette staged in Draft. Preview or click Publish Changes to apply live.');
        } elseif ($action === 'save_draft') {
            $patch = outbound_cms_sanitize_section_patch($post_sec, $raw_payload);
            outbound_save_cms_draft_patch($patch, $post_sec);
            $notice = array('type' => 'info', 'msg' => 'Draft saved privately! Public visitors still see the live site until you click Publish Changes.');
        } elseif ($action === 'publish') {
            $patch = outbound_cms_sanitize_section_patch($post_sec, $raw_payload);
            outbound_publish_cms_changes($patch, $post_sec);
            $notice = array('type' => 'success', 'msg' => 'Changes published live across Outbound Holidays and snapshot cache refreshed.');
        }
    }

    $has_draft     = outbound_has_cms_draft();
    $draft_state   = outbound_get_cms_draft_state();
    $bundle        = outbound_get_effective_cms_bundle(true);
    $snapshot      = outbound_build_live_snapshot(true, true);
    $cms_opts      = (array) ($bundle['site_options'] ?? array());
    $preview_url   = home_url('/?outbound_preview=1');
    $live_url      = home_url('/');
    $sec_meta         = $sections[$active_section];
    $is_cpt_edit_mode = $active_cpt !== '' && ($edit_item_id > 0 || $is_new_item);
    $form_sections    = array('homepage', 'experiences', 'accommodation', 'packages', 'guides', 'testimonials', 'about-contact', 'header', 'footer', 'builder', 'design', 'seo');
    $has_form         = !$is_cpt_edit_mode && in_array($active_section, $form_sections, true);
    ?>
    <div class="wrap outbound-admin-wrap outbound-cms-shell">
        <div class="outbound-admin-header">
            <div>
                <h1>Outbound CMS — <?php echo outbound_cms_esc_html($sec_meta['label']); ?></h1>
                <p><?php echo outbound_cms_esc_html($sec_meta['desc']); ?></p>
            </div>
            <div class="outbound-header-actions">
                <?php if ($has_draft) : ?>
                    <span class="outbound-badge outbound-badge-amber">Unpublished Draft Staged</span>
                <?php else : ?>
                    <span class="outbound-badge outbound-badge-green">All Changes Live</span>
                <?php endif; ?>
                <a href="<?php echo outbound_cms_esc_url($preview_url); ?>" target="_blank" rel="noopener" class="button">Preview Draft Site</a>
                <a href="<?php echo outbound_cms_esc_url($live_url); ?>" target="_blank" rel="noopener" class="button button-primary">View Live Site</a>
            </div>
        </div>

        <?php if ($notice) : ?>
            <div class="notice notice-<?php echo outbound_cms_esc_attr($notice['type']); ?> is-dismissible">
                <p><strong><?php echo outbound_cms_esc_html($notice['msg']); ?></strong></p>
            </div>
        <?php endif; ?>

        <div class="outbound-cms-layout">
            <aside class="outbound-cms-sidebar" aria-label="Outbound CMS Sections">
                <div class="outbound-sidebar-group-title">CMS Sections (1–14)</div>
                <nav class="outbound-cms-nav">
                    <?php foreach ($sections as $sid => $sdata) :
                        $nav_url = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($sid));
                        $is_curr = $sid === $active_section;
                        $is_dirty = !empty($draft_state['sections']) && in_array($sid, (array) $draft_state['sections'], true);
                    ?>
                        <a href="<?php echo outbound_cms_esc_url($nav_url); ?>" class="outbound-cms-nav-item<?php echo $is_curr ? ' is-active' : ''; ?>">
                            <span><?php echo outbound_cms_esc_html($sdata['label']); ?></span>
                            <?php if ($is_dirty) : ?>
                                <span class="outbound-dot-draft" title="Unpublished draft edits in this section"></span>
                            <?php endif; ?>
                        </a>
                    <?php endforeach; ?>
                </nav>

                <div class="outbound-sidebar-group-title">Operations & Tools</div>
                <nav class="outbound-cms-nav">
                    <a class="outbound-cms-nav-item" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-enquiries')); ?>">Customer Enquiries</a>
                    <a class="outbound-cms-nav-item" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-newsletter')); ?>">Newsletter Subscribers</a>
                    <a class="outbound-cms-nav-item" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-migration')); ?>">Content Migration</a>
                    <a class="outbound-cms-nav-item" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-setup-health')); ?>">Setup & Email Health</a>
                </nav>
            </aside>

            <main class="outbound-cms-main">
                <?php if ($is_cpt_edit_mode) : ?>
                    <?php outbound_cms_render_single_item_studio($active_section, $active_cpt, $edit_item_id, $is_new_item, $preview_url); ?>
                <?php else : ?>
                <?php if ($has_form) : ?>
                    <form method="post" action="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($active_section))); ?>" id="outbound-cms-form">
                        <?php wp_nonce_field('outbound_cms_hub_action', 'outbound_cms_hub_nonce'); ?>
                        <input type="hidden" name="outbound_cms_section" value="<?php echo outbound_cms_esc_attr($active_section); ?>" />
                <?php endif; ?>

                <?php
                switch ($active_section) {
                    case 'overview':
                        outbound_cms_render_section_overview($sections, $has_draft, $draft_state, $preview_url);
                        break;
                    case 'homepage':
                        outbound_cms_render_section_homepage($snapshot, $bundle, $cms_opts);
                        break;
                    case 'experiences':
                        outbound_cms_render_section_experiences($snapshot);
                        break;
                    case 'accommodation':
                        outbound_cms_render_section_accommodation($snapshot);
                        break;
                    case 'packages':
                        outbound_cms_render_section_packages($snapshot);
                        break;
                    case 'guides':
                        outbound_cms_render_section_guides($snapshot, $cms_opts);
                        break;
                    case 'galleries':
                        outbound_cms_render_section_galleries($snapshot);
                        break;
                    case 'testimonials':
                        outbound_cms_render_section_testimonials($snapshot);
                        break;
                    case 'about-contact':
                        outbound_cms_render_section_about_contact($snapshot, $cms_opts);
                        break;
                    case 'header':
                        outbound_cms_render_section_header($snapshot);
                        break;
                    case 'footer':
                        outbound_cms_render_section_footer($snapshot, $cms_opts);
                        break;
                    case 'builder':
                        outbound_cms_render_section_builder($snapshot, $bundle);
                        break;
                    case 'design':
                        outbound_cms_render_section_design($bundle);
                        break;
                    case 'seo':
                        outbound_cms_render_section_seo($snapshot, $has_draft, $draft_state, $preview_url, $search, $paged);
                        break;
                }
                ?>

                <?php if ($has_form) : ?>
                    <div class="outbound-sticky-action-bar">
                        <div class="outbound-sticky-status">
                            <?php if ($has_draft) : ?>
                                <span class="outbound-badge outbound-badge-amber">Draft staged<?php echo !empty($draft_state['updatedAt']) ? ' · ' . outbound_cms_esc_html(gmdate('M j H:i', strtotime((string) $draft_state['updatedAt']))) . ' UTC' : ''; ?></span>
                            <?php else : ?>
                                <span class="outbound-badge outbound-badge-green">Synced with live site</span>
                            <?php endif; ?>
                        </div>
                        <div class="outbound-sticky-buttons">
                            <?php if ($has_draft) : ?>
                                <button type="submit" name="outbound_cms_hub_action" value="discard_draft" class="button-link-delete" onclick="return confirm('Discard all unpublished CMS draft changes?');">Discard Draft</button>
                            <?php endif; ?>
                            <a href="<?php echo outbound_cms_esc_url($preview_url); ?>" target="_blank" rel="noopener" class="button">Preview Draft</a>
                            <button type="submit" name="outbound_cms_hub_action" value="save_draft" class="button button-secondary">Save Draft</button>
                            <button type="submit" name="outbound_cms_hub_action" value="publish" class="button button-primary">Publish Changes</button>
                        </div>
                    </div>
                    </form>
                <?php endif; ?>

                <?php
                // Native WordPress CPT/Post tables render cleanly OUTSIDE the CMS options form so their own GET filter forms never nest forms.
                if ($active_section === 'experiences') {
                    outbound_cms_render_cpt_list_card('experience', 'Experience', 'Experiences', 'experiences', $search, $paged, 'experience_category');
                } elseif ($active_section === 'accommodation') {
                    outbound_cms_render_cpt_list_card('accommodation', 'Accommodation', 'Accommodations', 'accommodation', $search, $paged, 'accommodation_category');
                } elseif ($active_section === 'packages') {
                    outbound_cms_render_cpt_list_card('package', 'Package', 'Holiday Packages', 'packages', $search, $paged);
                } elseif ($active_section === 'guides') {
                    outbound_cms_render_cpt_list_card('guide_article', 'Planning Guide', 'Planning Guides', 'guides', $search, $paged);
                    outbound_cms_render_cpt_list_card('post', 'Blog Article', 'Blog Posts', 'guides', $search, $paged, 'category');
                } elseif ($active_section === 'galleries') {
                    outbound_cms_render_cpt_list_card('client_album', 'Client Album', 'Client Albums', 'galleries', $search, $paged);
                }
                ?>
                <?php endif; ?>
            </main>
        </div>
    </div>
    <?php
}

/**
 * Section 1: Website Overview
 */
function outbound_cms_render_section_overview(array $sections, bool $has_draft, array $draft_state, string $preview_url): void {
    global $wpdb;
    $count_pub = static function (string $pt): int {
        $c = wp_count_posts($pt);
        return isset($c->publish) ? (int) $c->publish : 0;
    };

    $tables = outbound_get_table_names();
    $enq_count = 0;
    $sub_count = 0;
    if (isset($wpdb)) {
        $has_enq = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tables['enquiries']));
        if ($has_enq === $tables['enquiries']) {
            $enq_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['enquiries']}");
        }
        $has_sub = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tables['subscribers']));
        if ($has_sub === $tables['subscribers']) {
            $sub_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['subscribers']} WHERE status = 'confirmed'");
        }
    }
    ?>
    <div class="outbound-kpi-grid">
        <div class="outbound-kpi-box"><span>Accommodations (WP)</span><strong><?php echo $count_pub('accommodation'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Experiences (WP)</span><strong><?php echo $count_pub('experience'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Packages (WP)</span><strong><?php echo $count_pub('package'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Planning Guides</span><strong><?php echo $count_pub('guide_article'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Blog Posts</span><strong><?php echo $count_pub('post'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Client Albums</span><strong><?php echo $count_pub('client_album'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Customer Enquiries</span><strong><?php echo $enq_count; ?></strong></div>
        <div class="outbound-kpi-box"><span>Confirmed Subscribers</span><strong><?php echo $sub_count; ?></strong></div>
    </div>

    <div class="outbound-admin-card">
        <h2>Draft & Publishing Workflow</h2>
        <?php if ($has_draft) : ?>
            <p><strong>Status:</strong> Unpublished draft changes are staged in <code>outbound_cms_draft_state</code> (<?php echo outbound_cms_esc_html(implode(', ', (array) ($draft_state['sections'] ?? array('general')))); ?>). Visitors still see the published site.</p>
            <form method="post" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                <?php wp_nonce_field('outbound_cms_hub_action', 'outbound_cms_hub_nonce'); ?>
                <input type="hidden" name="outbound_cms_section" value="overview" />
                <a href="<?php echo outbound_cms_esc_url($preview_url); ?>" target="_blank" rel="noopener" class="button">Open Private Draft Preview</a>
                <button type="submit" name="outbound_cms_hub_action" value="publish" class="button button-primary">Publish All Draft Changes Live</button>
                <button type="submit" name="outbound_cms_hub_action" value="discard_draft" class="button-link-delete" onclick="return confirm('Discard all unpublished draft changes?');">Discard Draft</button>
            </form>
        <?php else : ?>
            <p><strong>Status:</strong> Published and in sync. Any edits saved with <strong>Save Draft</strong> inside Sections 2–14 can be tested via <strong>Preview Draft Site</strong> before going live.</p>
        <?php endif; ?>
    </div>

    <div class="outbound-admin-card">
        <h2>14 CMS Modules Quick Directory</h2>
        <div class="outbound-quick-grid">
            <?php foreach ($sections as $sid => $sdata) :
                if ($sid === 'overview') {
                    continue;
                }
            ?>
                <a class="outbound-quick-tile" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($sid))); ?>">
                    <strong><?php echo outbound_cms_esc_html($sdata['label']); ?></strong>
                    <span><?php echo outbound_cms_esc_html($sdata['desc']); ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
}

/**
 * Section 2: Homepage & Hero
 */
function outbound_cms_render_section_homepage(array $snapshot, array $bundle, array $cms_opts): void {
    $sec = (array) ($cms_opts['homepageSections'] ?? array());
    $hero_eyebrow = outbound_cms_get_ed($snapshot, 'travel/TravelHero.eyebrow', 'Victoria Falls Specialist');
    $hero_h1      = outbound_cms_get_ed($snapshot, 'travel/TravelHero.headlineLine1', '');
    $hero_h2      = outbound_cms_get_ed($snapshot, 'travel/TravelHero.headlineLine2', '');
    $hero_sub     = outbound_cms_get_ed($snapshot, 'travel/TravelHero.subtitle', '');
    $hero_cta     = outbound_cms_get_ed($snapshot, 'travel/TravelHero.ctaLabel', outbound_cms_get_ed($snapshot, 'common/Header.text13', 'Plan My Holiday'));
    $hero_browse  = outbound_cms_get_ed($snapshot, 'travel/TravelHero.text10', 'Browse Packages');
    $hero_img     = outbound_cms_get_ed($snapshot, 'travel/TravelHero.heroImage', outbound_get_media_fallback('hero'));
    $hero_alt     = outbound_cms_get_ed($snapshot, 'travel/TravelHero.heroImageAlt', 'Victoria Falls panoramic spray over the canyon and rainforest');

    $why_cards = $snapshot['site']['editorial']['structures']['travel/WhyChooseOutbound.section1'] ?? array();
    $featured  = (array) ($snapshot['site']['featured'] ?? array());
    ?>
    <div class="outbound-hero-editor-grid">
        <div class="outbound-admin-card">
            <h2>Homepage Hero Content & Media</h2>
            <p class="description">Leave Headline Lines blank to keep rotating Family / Honeymoon / Safari persona slides, or enter a custom Headline + Subtitle to pin your chosen message.</p>
            <table class="form-table">
                <tr>
                    <th><label for="ed_hero_eyebrow">Eyebrow / Badge</label></th>
                    <td><input type="text" id="ed_hero_eyebrow" name="cms[ed][travel/TravelHero.eyebrow]" value="<?php echo outbound_cms_esc_attr($hero_eyebrow); ?>" class="regular-text outbound-live-hero-input" data-hero-target="#preview_hero_eyebrow" /></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_h1">Custom Headline Line 1</label></th>
                    <td><input type="text" id="ed_hero_h1" name="cms[ed][travel/TravelHero.headlineLine1]" value="<?php echo outbound_cms_esc_attr($hero_h1); ?>" class="large-text outbound-live-hero-input" data-hero-target="#preview_hero_h1" placeholder="Optional override (defaults to rotating Persona titles)" /></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_h2">Custom Headline Line 2 (Accent)</label></th>
                    <td><input type="text" id="ed_hero_h2" name="cms[ed][travel/TravelHero.headlineLine2]" value="<?php echo outbound_cms_esc_attr($hero_h2); ?>" class="large-text outbound-live-hero-input" data-hero-target="#preview_hero_h2" placeholder="Optional second line in Golden Savannah" /></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_sub">Hero Subtitle</label></th>
                    <td><textarea id="ed_hero_sub" rows="3" name="cms[ed][travel/TravelHero.subtitle]" class="large-text outbound-live-hero-input" data-hero-target="#preview_hero_sub" placeholder="Optional override of persona description"><?php echo outbound_cms_esc_html($hero_sub); ?></textarea></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_cta">Primary CTA & Browse Labels</label></th>
                    <td>
                        <input type="text" id="ed_hero_cta" name="cms[ed][travel/TravelHero.ctaLabel]" value="<?php echo outbound_cms_esc_attr($hero_cta); ?>" class="regular-text outbound-live-hero-input" data-hero-target="#preview_hero_cta" />
                        <input type="text" name="cms[ed][travel/TravelHero.text10]" value="<?php echo outbound_cms_esc_attr($hero_browse); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th>Hero Background Image</th>
                    <td><?php outbound_cms_render_media_input('cms[ed][travel/TravelHero.heroImage]', $hero_img, 'outbound_hero_img_picker', outbound_get_media_fallback('hero')); ?></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_alt">Hero Image Alt Text</label></th>
                    <td><input type="text" id="ed_hero_alt" name="cms[ed][travel/TravelHero.heroImageAlt]" value="<?php echo outbound_cms_esc_attr($hero_alt); ?>" class="large-text" /></td>
                </tr>
            </table>

            <details class="outbound-collapsible">
                <summary>Persona Rotating Slides (Family / Honeymoon / Safari) & Confidence Points</summary>
                <div class="outbound-collapsible-body">
                    <table class="form-table">
                        <tr><th>Family Slide Headline / Copy</th><td>
                            <input type="text" name="cms[ed][travel/TravelHero.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text1')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text2')); ?>" class="regular-text" />
                            <textarea rows="2" name="cms[ed][travel/TravelHero.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text3')); ?></textarea>
                        </td></tr>
                        <tr><th>Honeymoon Slide Headline / Copy</th><td>
                            <input type="text" name="cms[ed][travel/TravelHero.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text4')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text5')); ?>" class="regular-text" />
                            <textarea rows="2" name="cms[ed][travel/TravelHero.text6]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text6')); ?></textarea>
                        </td></tr>
                        <tr><th>Safari Slide Headline / Copy</th><td>
                            <input type="text" name="cms[ed][travel/TravelHero.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text7')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text8')); ?>" class="regular-text" />
                            <textarea rows="2" name="cms[ed][travel/TravelHero.text9]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text9')); ?></textarea>
                        </td></tr>
                        <tr><th>Hero Confidence Box</th><td>
                            <input type="text" name="cms[ed][travel/TravelHero.text11]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text11')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text12')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text13')); ?>" class="regular-text" />
                        </td></tr>
                    </table>
                </div>
            </details>
        </div>

        <div class="outbound-admin-card outbound-hero-preview-card">
            <h2>Live Hero Preview</h2>
            <div class="outbound-hero-mockup" style="background-image: linear-gradient(100deg, rgba(13,40,51,0.88), rgba(11,94,142,0.52)), url('<?php echo outbound_cms_esc_url($hero_img); ?>');">
                <span class="outbound-mockup-badge" id="preview_hero_eyebrow"><?php echo outbound_cms_esc_html($hero_eyebrow); ?></span>
                <h3>
                    <span id="preview_hero_h1"><?php echo outbound_cms_esc_html($hero_h1 !== '' ? $hero_h1 : outbound_cms_get_ed($snapshot, 'travel/TravelHero.text1')); ?></span>
                    <em id="preview_hero_h2"><?php echo outbound_cms_esc_html($hero_h2 !== '' ? $hero_h2 : outbound_cms_get_ed($snapshot, 'travel/TravelHero.text2')); ?></em>
                </h3>
                <p id="preview_hero_sub"><?php echo outbound_cms_esc_html($hero_sub !== '' ? $hero_sub : outbound_cms_get_ed($snapshot, 'travel/TravelHero.text3')); ?></p>
                <span class="outbound-mockup-btn" id="preview_hero_cta"><?php echo outbound_cms_esc_html($hero_cta); ?></span>
            </div>
        </div>
    </div>

    <div class="outbound-admin-card">
        <h2>Homepage Section Visibility Toggles</h2>
        <div class="outbound-toggle-grid">
            <?php
            $toggles = array(
                'showQuickPlanning' => 'Quick Planning Bar',
                'showExperiences'   => 'Featured Experiences',
                'showPackages'      => 'Recommended Packages',
                'showWhereToStay'   => 'Where to Stay',
                'showGuides'        => 'Victoria Falls Travel Guide',
                'showWhyOutbound'   => 'Why Plan with Outbound',
                'showStories'       => 'Traveller Stories',
                'showClientGallery' => 'Client Gallery Preview',
                'showFinalCta'      => 'Final CTA Banner',
                'showNewsletter'    => 'Global Travel Club Newsletter',
            );
            foreach ($toggles as $tk => $tl) :
                $checked = !array_key_exists($tk, $sec) || !empty($sec[$tk]);
            ?>
                <label class="outbound-toggle-pill">
                    <input type="checkbox" name="cms[vis][<?php echo outbound_cms_esc_attr($tk); ?>]" value="1" <?php checked($checked); ?> />
                    <span><?php echo outbound_cms_esc_html($tl); ?></span>
                </label>
            <?php endforeach; ?>
        </div>
    </div>

    <details class="outbound-admin-card outbound-collapsible" open>
        <summary>Quick Planning Bar & Final Call-to-Action Banner</summary>
        <div class="outbound-collapsible-body">
            <table class="form-table">
                <tr><th>Quick Planning Section Title</th><td><input type="text" name="cms[ed][travel/QuickPlanningBar.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text5')); ?>" class="large-text" /></td></tr>
                <tr><th>Card 1–3 Titles & Subtitles</th><td>
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text1')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.copy1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.copy1')); ?>" class="regular-text" /><br>
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text2')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.copy2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.copy2')); ?>" class="regular-text" /><br>
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text3')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.copy3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.copy3')); ?>" class="regular-text" /><br>
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text4')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.topExperiencesSubtitle]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.topExperiencesSubtitle', 'Helicopter, safaris & cruises')); ?>" class="regular-text" />
                </td></tr>
                <tr><th>Final CTA Eyebrow & Title</th><td>
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text1')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text2')); ?>" class="large-text" />
                </td></tr>
                <tr><th>Final CTA Description & Buttons</th><td>
                    <textarea rows="2" name="cms[ed][travel/FinalCtaBanner.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text3')); ?></textarea><br>
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text4')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text5')); ?>" class="regular-text" />
                </td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Why Plan With Outbound Holidays — Repeater Cards & Budget Callout</summary>
        <div class="outbound-collapsible-body">
            <table class="form-table">
                <tr><th>Section Badge & Heading</th><td>
                    <input type="text" name="cms[ed][travel/WhyChooseOutbound.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text13')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/WhyChooseOutbound.text14]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text14')); ?>" class="large-text" />
                </td></tr>
            </table>

            <div class="outbound-repeater" data-repeater="why-cards">
                <div class="outbound-repeater-list">
                    <?php foreach ((array) $why_cards as $idx => $card) :
                        $icon_name = (string) ($card['icon']['$icon'] ?? ($card['iconName'] ?? 'ShieldCheck'));
                    ?>
                        <div class="outbound-repeater-row">
                            <div class="outbound-repeater-head">
                                <strong>Card #<span class="outbound-row-num"><?php echo $idx + 1; ?></span></strong>
                                <div class="outbound-repeater-actions">
                                    <button type="button" class="button button-small outbound-row-up">Up</button>
                                    <button type="button" class="button button-small outbound-row-down">Down</button>
                                    <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                                </div>
                            </div>
                            <div class="outbound-meta-grid">
                                <p><label>Icon<br><select name="cms[why_cards][<?php echo $idx; ?>][iconName]">
                                    <?php foreach (array('ShieldCheck', 'MapPin', 'Sparkles', 'Headset') as $ic) : ?>
                                        <option value="<?php echo $ic; ?>" <?php selected($icon_name, $ic); ?>><?php echo $ic; ?></option>
                                    <?php endforeach; ?>
                                </select></label></p>
                                <p><label>Card Title<br><input type="text" name="cms[why_cards][<?php echo $idx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($card['title'] ?? '')); ?>" class="regular-text" /></label></p>
                                <p><label>Footer Label<br><input type="text" name="cms[why_cards][<?php echo $idx; ?>][label]" value="<?php echo outbound_cms_esc_attr((string) ($card['label'] ?? '')); ?>" class="regular-text" /></label></p>
                            </div>
                            <p><label>Description<br><textarea rows="2" name="cms[why_cards][<?php echo $idx; ?>][description]" class="large-text"><?php echo outbound_cms_esc_html((string) ($card['description'] ?? '')); ?></textarea></label></p>
                        </div>
                    <?php endforeach; ?>
                </div>
                <button type="button" class="button outbound-row-add">+ Add Why Outbound Card</button>
            </div>

            <table class="form-table">
                <tr><th>Budget Callout Heading & Button</th><td>
                    <input type="text" name="cms[ed][travel/WhyChooseOutbound.text16]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text16')); ?>" class="large-text" />
                    <textarea rows="2" name="cms[ed][travel/WhyChooseOutbound.text17]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text17')); ?></textarea>
                    <input type="text" name="cms[ed][travel/WhyChooseOutbound.text18]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text18')); ?>" class="regular-text" />
                </td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Featured Homepage Curations (Select Which Stays, Experiences & Packages Pin to Homepage)</summary>
        <div class="outbound-collapsible-body outbound-featured-grid">
            <div>
                <h3>Featured Stays</h3>
                <?php
                $sel_stays = (array) ($featured['accommodationIds'] ?? array());
                foreach ((array) ($snapshot['accommodations'] ?? array()) as $acc) :
                    $sid = (string) ($acc['slug'] ?? ($acc['id'] ?? ''));
                ?>
                    <label class="outbound-check-row"><input type="checkbox" name="cms[featured][accommodationIds][]" value="<?php echo outbound_cms_esc_attr($sid); ?>" <?php checked(in_array($sid, $sel_stays, true) || in_array((string) ($acc['id'] ?? ''), $sel_stays, true)); ?> /> <?php echo outbound_cms_esc_html((string) ($acc['name'] ?? $sid)); ?></label>
                <?php endforeach; ?>
            </div>
            <div>
                <h3>Featured Experiences</h3>
                <?php
                $sel_exp = (array) ($featured['experienceIds'] ?? array());
                foreach ((array) ($snapshot['experiences'] ?? array()) as $exp) :
                    $eid = (string) ($exp['slug'] ?? ($exp['id'] ?? ''));
                ?>
                    <label class="outbound-check-row"><input type="checkbox" name="cms[featured][experienceIds][]" value="<?php echo outbound_cms_esc_attr($eid); ?>" <?php checked(in_array($eid, $sel_exp, true) || in_array((string) ($exp['id'] ?? ''), $sel_exp, true)); ?> /> <?php echo outbound_cms_esc_html((string) ($exp['title'] ?? $eid)); ?></label>
                <?php endforeach; ?>
            </div>
            <div>
                <h3>Featured Packages</h3>
                <?php
                $sel_pkg = (array) ($featured['packageIds'] ?? array());
                foreach ((array) ($snapshot['packages'] ?? array()) as $pkg) :
                    $pid = (string) ($pkg['id'] ?? ($pkg['slug'] ?? ''));
                ?>
                    <label class="outbound-check-row"><input type="checkbox" name="cms[featured][packageIds][]" value="<?php echo outbound_cms_esc_attr($pid); ?>" <?php checked(in_array($pid, $sel_pkg, true) || in_array((string) ($pkg['slug'] ?? ''), $sel_pkg, true)); ?> /> <?php echo outbound_cms_esc_html((string) ($pkg['title'] ?? $pid)); ?></label>
                <?php endforeach; ?>
            </div>
        </div>
    </details>
    <?php
}

function outbound_cms_render_section_experiences(array $snapshot): void {
    ?>
    <div class="outbound-admin-card">
        <h2>Experiences Section Headings & Labels</h2>
        <table class="form-table">
            <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/FeaturedExperiences.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text1')); ?>" class="regular-text" /></td></tr>
            <tr><th>Homepage Section Title</th><td><input type="text" name="cms[ed][travel/FeaturedExperiences.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text2')); ?>" class="large-text" /></td></tr>
            <tr><th>Homepage Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/FeaturedExperiences.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text3')); ?></textarea></td></tr>
            <tr><th>Card Recommendation & Button Labels</th><td>
                <input type="text" name="cms[ed][travel/FeaturedExperiences.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text4')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/FeaturedExperiences.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text5')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/FeaturedExperiences.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text6')); ?>" class="regular-text" />
            </td></tr>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_accommodation(array $snapshot): void {
    ?>
    <div class="outbound-admin-card">
        <h2>Accommodation Section Headings & Card Labels</h2>
        <table class="form-table">
            <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/WhereToStaySection.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text1')); ?>" class="regular-text" /></td></tr>
            <tr><th>Homepage Section Title</th><td><input type="text" name="cms[ed][travel/WhereToStaySection.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text2')); ?>" class="large-text" /></td></tr>
            <tr><th>Homepage Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/WhereToStaySection.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text3')); ?></textarea></td></tr>
            <tr><th>Price Prefix / Badge / Button</th><td>
                <input type="text" name="cms[ed][travel/WhereToStaySection.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text4')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/WhereToStaySection.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text6')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/WhereToStaySection.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text7')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/WhereToStaySection.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text8')); ?>" class="regular-text" />
            </td></tr>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_packages(array $snapshot): void {
    ?>
    <div class="outbound-admin-card">
        <h2>Holiday Packages Section Headings & Disclaimers</h2>
        <table class="form-table">
            <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/FeaturedPackages.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text1')); ?>" class="regular-text" /></td></tr>
            <tr><th>Homepage Section Title</th><td><input type="text" name="cms[ed][travel/FeaturedPackages.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text2')); ?>" class="large-text" /></td></tr>
            <tr><th>Homepage Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/FeaturedPackages.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text3')); ?></textarea></td></tr>
            <tr><th>Pricing Estimate Note</th><td><textarea rows="2" name="cms[ed][travel/FeaturedPackages.text4]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text4')); ?></textarea></td></tr>
            <tr><th>CTA Button Label</th><td><input type="text" name="cms[ed][travel/FeaturedPackages.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text8')); ?>" class="regular-text" /> <input type="text" name="cms[ed][travel/FeaturedPackages.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text9')); ?>" class="regular-text" /></td></tr>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_guides(array $snapshot, array $cms_opts): void {
    ?>
    <div class="outbound-admin-card">
        <h2>Victoria Falls Guides &amp; Blog Headings</h2>
        <table class="form-table">
            <tr><th>Guide Section Badge &amp; Title</th><td>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text9')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/VicFallsGuide.text10]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text10')); ?>" class="large-text" />
            </td></tr>
            <tr><th>Guide Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/VicFallsGuide.text11]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text11')); ?></textarea></td></tr>
            <tr><th>Card Read Link &amp; Bottom Button</th><td>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text12')); ?>" class="regular-text" placeholder="Explore in Travel Guide" />
                <input type="text" name="cms[ed][travel/VicFallsGuide.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text13')); ?>" class="regular-text" placeholder="Read the Complete Victoria Falls Travel Guide" />
            </td></tr>
        </table>
        <h3>Homepage Travel Guide Preview Cards (4 Cards)</h3>
        <div class="outbound-meta-grid">
            <p><label><strong>Card 1 Title &amp; Summary</strong><br>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text1')); ?>" class="widefat" />
                <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text2]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text2')); ?></textarea>
            </label></p>
            <p><label><strong>Card 2 Title &amp; Summary</strong><br>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text3')); ?>" class="widefat" />
                <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text4]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text4')); ?></textarea>
            </label></p>
            <p><label><strong>Card 3 Title &amp; Summary</strong><br>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text5')); ?>" class="widefat" />
                <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text6]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text6')); ?></textarea>
            </label></p>
            <p><label><strong>Card 4 Title &amp; Summary</strong><br>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text7')); ?>" class="widefat" />
                <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text8]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text8')); ?></textarea>
            </label></p>
        </div>
    </div>
    <?php
}

function outbound_cms_render_section_galleries(array $snapshot): void {
    $album_count = count((array) ($snapshot['albums'] ?? array()));
    $img_count   = 0;
    foreach ((array) ($snapshot['albums'] ?? array()) as $alb) {
        $img_count += count((array) ($alb['images'] ?? array()));
    }
    ?>
    <div class="outbound-admin-card">
        <h2>Galleries & WordPress Media Library</h2>
        <p>Currently serving <strong><?php echo $img_count; ?></strong> client gallery photos across <strong><?php echo $album_count; ?></strong> albums. Upload new images directly to the <a href="<?php echo outbound_cms_esc_url(admin_url('upload.php')); ?>">WordPress Media Library</a> and attach them to any Client Album, Accommodation, Experience, or Blog Post.</p>
    </div>
    <?php
}

function outbound_cms_render_section_testimonials(array $snapshot): void {
    $reviews = (array) ($snapshot['site']['legacy']['TRAVEL_REVIEWS'] ?? array());
    ?>
    <div class="outbound-admin-card">
        <h2>Traveller Stories Section Headings & Google Rating</h2>
        <table class="form-table">
            <tr><th>Badge & Heading</th><td>
                <input type="text" name="cms[ed][travel/TravellerStories.badge]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.badge', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text4'))); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/TravellerStories.heading]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.heading', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text5'))); ?>" class="large-text" />
            </td></tr>
            <tr><th>Subheading</th><td><textarea rows="2" name="cms[ed][travel/TravellerStories.subheading]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.subheading', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text6'))); ?></textarea></td></tr>
            <tr><th>Google Score & Review Card Title</th><td>
                <input type="text" name="cms[ed][travel/TravellerStories.score]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.score', '5.0')); ?>" class="small-text" />
                <input type="text" name="cms[ed][travel/TravellerStories.cardTitle]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.cardTitle', '5.0 Google Rating · Outbound Holidays')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/TravellerStories.ctaLabel]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.ctaLabel', 'Read Google Reviews')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>Google Reviews URL</th><td><input type="url" name="cms[ed][travel/TravellerStories.reviewUrl]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.reviewUrl', 'https://g.page/r/CW8xeS7qssHkECE/review')); ?>" class="large-text code" /></td></tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Guest Reviews Repeater</h2>
        <div class="outbound-repeater" data-repeater="reviews">
            <div class="outbound-repeater-list">
                <?php foreach ($reviews as $idx => $rev) : ?>
                    <div class="outbound-repeater-row">
                        <div class="outbound-repeater-head">
                            <strong>Review #<span class="outbound-row-num"><?php echo $idx + 1; ?></span></strong>
                            <div class="outbound-repeater-actions">
                                <button type="button" class="button button-small outbound-row-up">Up</button>
                                <button type="button" class="button button-small outbound-row-down">Down</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <input type="hidden" name="cms[reviews][<?php echo $idx; ?>][id]" value="<?php echo outbound_cms_esc_attr((string) ($rev['id'] ?? ('rev-' . ($idx + 1)))); ?>" />
                        <div class="outbound-meta-grid">
                            <p><label>Author<br><input type="text" name="cms[reviews][<?php echo $idx; ?>][author]" value="<?php echo outbound_cms_esc_attr((string) ($rev['author'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>City / Role<br><input type="text" name="cms[reviews][<?php echo $idx; ?>][roleOrCity]" value="<?php echo outbound_cms_esc_attr((string) ($rev['roleOrCity'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Headline<br><input type="text" name="cms[reviews][<?php echo $idx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($rev['title'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Date & Rating<br>
                                <input type="text" name="cms[reviews][<?php echo $idx; ?>][date]" value="<?php echo outbound_cms_esc_attr((string) ($rev['date'] ?? '')); ?>" style="width:120px;" />
                                <input type="number" min="1" max="5" name="cms[reviews][<?php echo $idx; ?>][rating]" value="<?php echo (int) ($rev['rating'] ?? 5); ?>" style="width:65px;" /> ★
                                <label style="margin-left:8px;"><input type="checkbox" name="cms[reviews][<?php echo $idx; ?>][verifiedBuyer]" value="1" <?php checked(!empty($rev['verifiedBuyer'])); ?> /> Verified</label>
                            </label></p>
                        </div>
                        <p><label>Review Quote<br><textarea rows="2" name="cms[reviews][<?php echo $idx; ?>][comment]" class="large-text"><?php echo outbound_cms_esc_html((string) ($rev['comment'] ?? '')); ?></textarea></label></p>
                        <p><label>Avatar Image URL</label></p>
                        <?php outbound_cms_render_media_input("cms[reviews][{$idx}][avatar]", (string) ($rev['avatar'] ?? ''), 'rev_avatar_' . $idx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button outbound-row-add">+ Add Guest Review</button>
        </div>
    </div>
    <?php
}

function outbound_cms_render_section_about_contact(array $snapshot, array $cms_opts): void {
    $contact = (array) ($cms_opts['contact'] ?? array());
    ?>
    <div class="outbound-admin-card">
        <h2>Direct Concierge & Business Contact Details</h2>
        <table class="form-table">
            <tr><th>WhatsApp Digits (no +)</th><td><input type="text" name="cms[contact][whatsappNumber]" value="<?php echo outbound_cms_esc_attr((string) ($contact['whatsappNumber'] ?? '263714701721')); ?>" class="regular-text code" /></td></tr>
            <tr><th>Display Phone Number</th><td><input type="text" name="cms[contact][displayNumber]" value="<?php echo outbound_cms_esc_attr((string) ($contact['displayNumber'] ?? '+263 714 701 721')); ?>" class="regular-text" /></td></tr>
            <tr><th>Enquiries Email</th><td><input type="email" name="cms[contact][email]" value="<?php echo outbound_cms_esc_attr((string) ($contact['email'] ?? 'travel@outboundholidays.co.zw')); ?>" class="regular-text" /></td></tr>
            <tr><th>Victoria Falls Address</th><td><input type="text" name="cms[contact][address]" value="<?php echo outbound_cms_esc_attr((string) ($contact['address'] ?? '')); ?>" class="large-text" /></td></tr>
            <tr><th>Support Hours</th><td><input type="text" name="cms[contact][hours]" value="<?php echo outbound_cms_esc_attr((string) ($contact['hours'] ?? '')); ?>" class="regular-text" /></td></tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Contact Us & About Founder Page Content</h2>
        <table class="form-table">
            <tr><th>Contact Us Page Title & Intro</th><td>
                <input type="text" name="cms[ed][travel/ContactUsView.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/ContactUsView.text2')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/ContactUsView.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/ContactUsView.text3')); ?>" class="large-text" />
                <textarea rows="2" name="cms[ed][travel/ContactUsView.text4]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/ContactUsView.text4')); ?></textarea>
            </td></tr>
            <tr><th>About Page Headline & Subhead</th><td>
                <input type="text" name="cms[ed][travel/AboutPage.text10]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text10')); ?>" class="large-text" />
                <textarea rows="2" name="cms[ed][travel/AboutPage.text11]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text11')); ?></textarea>
            </td></tr>
            <tr><th>Founder Name & Role</th><td>
                <input type="text" name="cms[ed][travel/AboutPage.text14]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text14')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/AboutPage.text15]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text15')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>Founder Story Paragraphs</th><td>
                <textarea rows="3" name="cms[ed][travel/AboutPage.text18]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text18')); ?></textarea>
                <textarea rows="3" name="cms[ed][travel/AboutPage.text19]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text19')); ?></textarea>
                <textarea rows="3" name="cms[ed][travel/AboutPage.text20]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text20')); ?></textarea>
            </td></tr>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_header(array $snapshot): void {
    $logo = outbound_cms_get_ed($snapshot, 'common/Header.outboundLogo', outbound_get_logo_url());
    ?>
    <div class="outbound-admin-card">
        <h2>Brand Logo & Top Announcement Bar</h2>
        <table class="form-table">
            <tr><th>Primary Header Logo</th><td><?php outbound_cms_render_media_input('cms[ed][common/Header.outboundLogo]', $logo, 'outbound_header_logo'); ?></td></tr>
            <tr><th>Top Bar Badge & Tagline</th><td>
                <input type="text" name="cms[ed][common/Header.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text1')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Header.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text2')); ?>" class="large-text" />
            </td></tr>
            <tr><th>WhatsApp Strip Prefix</th><td><input type="text" name="cms[ed][common/Header.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text3')); ?>" class="regular-text" /></td></tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Navigation Link Labels & Header CTA</h2>
        <p class="description">WordPress menus can also be structured in <a href="<?php echo outbound_cms_esc_url(admin_url('nav-menus.php')); ?>">Appearance → Menus</a>.</p>
        <div class="outbound-meta-grid">
            <p><label>Guide Link<br><input type="text" name="cms[ed][common/Header.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text5')); ?>" class="regular-text" /></label></p>
            <p><label>Experiences Link<br><input type="text" name="cms[ed][common/Header.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text6')); ?>" class="regular-text" /></label></p>
            <p><label>Where to Stay Link<br><input type="text" name="cms[ed][common/Header.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text7')); ?>" class="regular-text" /></label></p>
            <p><label>Packages Link<br><input type="text" name="cms[ed][common/Header.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text8')); ?>" class="regular-text" /></label></p>
            <p><label>Gallery Link<br><input type="text" name="cms[ed][common/Header.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text9')); ?>" class="regular-text" /></label></p>
            <p><label>About Link<br><input type="text" name="cms[ed][common/Header.text10]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text10')); ?>" class="regular-text" /></label></p>
            <p><label>Contact Link<br><input type="text" name="cms[ed][common/Header.text11]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text11')); ?>" class="regular-text" /></label></p>
            <p><label>Primary CTA Button<br><input type="text" name="cms[ed][common/Header.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text13')); ?>" class="regular-text" /></label></p>
            <p><label>Search Placeholder<br><input type="text" name="cms[ed][common/Header.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text12')); ?>" class="regular-text" /></label></p>
        </div>
    </div>

    <div class="outbound-admin-card">
        <h2>Mobile Menu Navigation Labels</h2>
        <div class="outbound-meta-grid">
            <p><label>Mobile Guide Label<br><input type="text" name="cms[ed][common/Header.text15]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text15')); ?>" class="regular-text" /></label></p>
            <p><label>Mobile Experiences Label<br><input type="text" name="cms[ed][common/Header.text17]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text17')); ?>" class="regular-text" /></label></p>
            <p><label>Mobile Where to Stay<br><input type="text" name="cms[ed][common/Header.text18]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text18')); ?>" class="regular-text" /></label></p>
            <p><label>Mobile Packages Label<br><input type="text" name="cms[ed][common/Header.text19]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text19')); ?>" class="regular-text" /></label></p>
            <p><label>Mobile Gallery Label<br><input type="text" name="cms[ed][common/Header.text20]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text20')); ?>" class="regular-text" /></label></p>
            <p><label>Mobile About Label<br><input type="text" name="cms[ed][common/Header.text22]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text22')); ?>" class="regular-text" /></label></p>
            <p><label>Mobile Contact Button<br><input type="text" name="cms[ed][common/Header.text24]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text24')); ?>" class="regular-text" /></label></p>
        </div>
    </div>
    <?php
}

function outbound_cms_render_section_footer(array $snapshot, array $cms_opts): void {
    $social = (array) ($cms_opts['social'] ?? array());
    $rates  = (array) ($snapshot['site']['currencyRates'] ?? outbound_get_currency_rates());
    $flogo  = outbound_cms_get_ed($snapshot, 'common/Footer.outboundLogo', outbound_get_logo_url());
    ?>
    <div class="outbound-admin-card">
        <h2>Footer Brand, Columns, Reviews &amp; Payment Badges</h2>
        <table class="form-table">
            <tr><th>Footer Logo</th><td><?php outbound_cms_render_media_input('cms[ed][common/Footer.outboundLogo]', $flogo, 'outbound_footer_logo'); ?></td></tr>
            <tr><th>Brand Name &amp; Summary</th><td>
                <input type="text" name="cms[ed][common/Footer.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text2')); ?>" class="regular-text" /><br>
                <textarea rows="2" name="cms[ed][common/Footer.text3]" class="large-text" style="margin-top:6px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'common/Footer.text3')); ?></textarea>
            </td></tr>
            <tr><th>Address &amp; WhatsApp Prefix</th><td>
                <input type="text" name="cms[ed][common/Footer.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text4')); ?>" class="large-text" /><br>
                <input type="text" name="cms[ed][common/Footer.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text5')); ?>" class="regular-text" style="margin-top:6px;" />
            </td></tr>
            <tr><th>Column 1 Heading &amp; Links</th><td>
                <input type="text" name="cms[ed][common/Footer.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text6')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text7')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text8')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text9')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text10]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text10')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text11]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text11')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>Column 2 Heading &amp; Links</th><td>
                <input type="text" name="cms[ed][common/Footer.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text12')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text13')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text14]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text14')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text15]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text15')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text18]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text18')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>License Line & Copyright</th><td>
                <input type="text" name="cms[ed][common/Footer.text16]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text16')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text17]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text17')); ?>" class="large-text" />
            </td></tr>
            <tr><th>Google Reviews Link & Rating</th><td>
                <input type="text" name="cms[ed][common/Footer.googleReviewsLabel]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.googleReviewsLabel', 'Google Reviews')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.googleReviewsRating]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.googleReviewsRating', '5.0')); ?>" class="small-text" />
                <input type="url" name="cms[ed][common/Footer.googleReviewsUrl]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.googleReviewsUrl', 'https://g.page/r/CW8xeS7qssHkECE/review')); ?>" class="regular-text code" />
            </td></tr>
            <tr><th>Accepted Payment Badges</th><td>
                <input type="text" name="cms[ed][common/Footer.text19]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text19')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text20]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text20')); ?>" style="width:90px;" />
                <input type="text" name="cms[ed][common/Footer.text21]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text21')); ?>" style="width:110px;" />
                <input type="text" name="cms[ed][common/Footer.text22]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text22')); ?>" style="width:100px;" />
            </td></tr>
            <tr><th>Social Profiles</th><td>
                <input type="url" name="cms[social][facebook]" value="<?php echo outbound_cms_esc_attr((string) ($social['facebook'] ?? '')); ?>" class="regular-text code" placeholder="Facebook URL" />
                <input type="url" name="cms[social][instagram]" value="<?php echo outbound_cms_esc_attr((string) ($social['instagram'] ?? '')); ?>" class="regular-text code" placeholder="Instagram URL" />
                <input type="url" name="cms[social][youtube]" value="<?php echo outbound_cms_esc_attr((string) ($social['youtube'] ?? '')); ?>" class="regular-text code" placeholder="YouTube URL" />
            </td></tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Global Newsletter Banner & Multi-Currency Rates</h2>
        <table class="form-table">
            <tr><th>Newsletter Kicker & Heading</th><td>
                <input type="text" name="cms[ed][common/Newsletter.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text1')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Newsletter.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text2')); ?>" class="large-text" />
            </td></tr>
            <tr><th>Newsletter Subtitle & CTA</th><td>
                <textarea rows="2" name="cms[ed][common/Newsletter.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'common/Newsletter.text3')); ?></textarea><br>
                <input type="text" name="cms[ed][common/Newsletter.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text6')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Newsletter.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text7')); ?>" class="regular-text" />
            </td></tr>
        </table>

        <h3>Currency Conversion Multipliers (Base USD = 1)</h3>
        <table class="widefat striped" style="max-width:560px;">
            <thead><tr><th>Currency</th><th>Symbol</th><th>Rate per 1 USD</th></tr></thead>
            <tbody>
                <?php foreach ($rates as $code => $cfg) : ?>
                    <tr>
                        <td><strong><?php echo outbound_cms_esc_html((string) $code); ?></strong></td>
                        <td><input type="text" name="cms[rates][<?php echo outbound_cms_esc_attr((string) $code); ?>][symbol]" value="<?php echo outbound_cms_esc_attr((string) ($cfg['symbol'] ?? $code)); ?>" style="width:70px;" /></td>
                        <td><input type="number" step="0.01" min="0.01" name="cms[rates][<?php echo outbound_cms_esc_attr((string) $code); ?>][rate]" value="<?php echo outbound_cms_esc_attr((string) ($cfg['rate'] ?? 1)); ?>" <?php echo $code === 'USD' ? 'readonly' : ''; ?> style="width:110px;" /></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_builder(array $snapshot, array $bundle): void {
    $tiers = (array) ($snapshot['stayTiers'] ?? array());
    $acts  = (array) ($snapshot['builderActivities'] ?? array());
    ?>
    <div class="outbound-admin-card">
        <h2>Holiday Builder — Accommodation Stay Tiers</h2>
        <div class="outbound-repeater" data-repeater="stay-tiers">
            <div class="outbound-repeater-list">
                <?php foreach ($tiers as $idx => $tier) :
                    $hl_lines = implode("\n", (array) ($tier['highlights'] ?? array()));
                    $tier_price = $tier['pricePerNightUSD'] ?? ($tier['startingPrice'] ?? 220);
                ?>
                    <div class="outbound-repeater-row">
                        <div class="outbound-repeater-head">
                            <strong>Stay Tier #<span class="outbound-row-num"><?php echo $idx + 1; ?></span></strong>
                            <div class="outbound-repeater-actions">
                                <button type="button" class="button button-small outbound-row-up">Up</button>
                                <button type="button" class="button button-small outbound-row-down">Down</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Tier Slug ID<br><input type="text" name="cms[stay_tiers][<?php echo $idx; ?>][id]" value="<?php echo outbound_cms_esc_attr((string) ($tier['id'] ?? '')); ?>" class="regular-text code" /></label></p>
                            <p><label>Display Name<br><input type="text" name="cms[stay_tiers][<?php echo $idx; ?>][name]" value="<?php echo outbound_cms_esc_attr((string) ($tier['name'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Tagline<br><input type="text" name="cms[stay_tiers][<?php echo $idx; ?>][tagline]" value="<?php echo outbound_cms_esc_attr((string) ($tier['tagline'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Price Per Night USD<br><input type="number" step="1" min="0" name="cms[stay_tiers][<?php echo $idx; ?>][pricePerNightUSD]" value="<?php echo outbound_cms_esc_attr((string) $tier_price); ?>" style="width:110px;" /></label></p>
                        </div>
                        <p><label>Description<br><textarea rows="2" name="cms[stay_tiers][<?php echo $idx; ?>][desc]" class="large-text"><?php echo outbound_cms_esc_html((string) ($tier['desc'] ?? '')); ?></textarea></label></p>
                        <p><label>Highlights (one per line)<br><textarea rows="3" name="cms[stay_tiers][<?php echo $idx; ?>][highlights_text]" class="large-text"><?php echo outbound_cms_esc_html($hl_lines); ?></textarea></label></p>
                        <?php outbound_cms_render_media_input("cms[stay_tiers][{$idx}][imageUrl]", (string) ($tier['imageUrl'] ?? ''), 'tier_img_' . $idx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button outbound-row-add">+ Add Stay Tier</button>
        </div>
    </div>

    <div class="outbound-admin-card">
        <h2>Holiday Builder — Curated Activities & Rates</h2>
        <div class="outbound-repeater" data-repeater="builder-acts">
            <div class="outbound-repeater-list">
                <?php foreach ($acts as $idx => $act) :
                    $act_price = $act['priceUSD'] ?? ($act['priceAmount'] ?? 65);
                    $act_img   = $act['imageUrl'] ?? ($act['image'] ?? '');
                ?>
                    <div class="outbound-repeater-row">
                        <div class="outbound-repeater-head">
                            <strong>Activity #<span class="outbound-row-num"><?php echo $idx + 1; ?></span></strong>
                            <div class="outbound-repeater-actions">
                                <button type="button" class="button button-small outbound-row-up">Up</button>
                                <button type="button" class="button button-small outbound-row-down">Down</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>ID<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][id]" value="<?php echo outbound_cms_esc_attr((string) ($act['id'] ?? '')); ?>" class="regular-text code" /></label></p>
                            <p><label>Title<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($act['title'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Duration<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][duration]" value="<?php echo outbound_cms_esc_attr((string) ($act['duration'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Price USD<br><input type="number" step="1" min="0" name="cms[builder_activities][<?php echo $idx; ?>][priceUSD]" value="<?php echo outbound_cms_esc_attr((string) $act_price); ?>" style="width:110px;" /></label></p>
                            <p><label>Badge<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][badge]" value="<?php echo outbound_cms_esc_attr((string) ($act['badge'] ?? '')); ?>" class="regular-text" /></label></p>
                        </div>
                        <p><label>Short Summary<br><textarea rows="2" name="cms[builder_activities][<?php echo $idx; ?>][shortDesc]" class="large-text"><?php echo outbound_cms_esc_html((string) ($act['shortDesc'] ?? '')); ?></textarea></label></p>
                        <?php outbound_cms_render_media_input("cms[builder_activities][{$idx}][imageUrl]", (string) $act_img, 'b_act_img_' . $idx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button outbound-row-add">+ Add Builder Activity</button>
        </div>
    </div>
    <?php
}

function outbound_cms_render_section_design(array $bundle): void {
    $tokens = (array) ($bundle['design_tokens'] ?? array());
    $colors = array(
        'primaryColor'   => array('label' => 'Victoria Falls Blue (Primary)', 'default' => '#0B5E8E'),
        'secondaryColor' => array('label' => 'Golden Savannah (Accent)',      'default' => '#C9A66B'),
        'accentColor'    => array('label' => 'Sunset Orange (CTA)',           'default' => '#E67E22'),
        'greenColor'     => array('label' => 'Zambezi Green (Nature)',        'default' => '#3F6B3C'),
        'darkColor'      => array('label' => 'Charcoal Grey (Text)',          'default' => '#2F3A44'),
    );
    ?>
    <div class="outbound-admin-card">
        <div class="outbound-card-toolbar">
            <div>
                <h2>Design Tokens & Brand Palette</h2>
                <p class="description">Preserve the original React aesthetic by default, or customize the CSS color variables safely.</p>
            </div>
            <button type="submit" name="outbound_cms_hub_action" value="reset_design_tokens" class="button">Reset to Original React Colors</button>
        </div>
        <table class="form-table">
            <?php foreach ($colors as $ck => $meta) :
                $val = outbound_cms_sanitize_hex((string) ($tokens[$ck] ?? ''), $meta['default']);
            ?>
                <tr>
                    <th><label for="design_<?php echo outbound_cms_esc_attr($ck); ?>"><?php echo outbound_cms_esc_html($meta['label']); ?></label></th>
                    <td>
                        <div class="outbound-color-field">
                            <input type="color" value="<?php echo outbound_cms_esc_attr($val); ?>" class="outbound-color-picker" data-target="#design_<?php echo outbound_cms_esc_attr($ck); ?>" />
                            <input type="text" id="design_<?php echo outbound_cms_esc_attr($ck); ?>" name="cms[design][<?php echo outbound_cms_esc_attr($ck); ?>]" value="<?php echo outbound_cms_esc_attr($val); ?>" class="regular-text code outbound-color-hex" maxlength="7" />
                            <span class="description">Default: <code><?php echo outbound_cms_esc_html($meta['default']); ?></code></span>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_seo(array $snapshot, bool $has_draft, array $draft_state, string $preview_url, string $search, int $paged): void {
    $all_routes = (array) ($snapshot['site']['routeSeo'] ?? array());
    $keys       = array_keys($all_routes);
    if ($search !== '') {
        $q    = strtolower($search);
        $keys = array_values(array_filter($keys, static function (string $k) use ($all_routes, $q): bool {
            return str_contains(strtolower($k), $q)
                || str_contains(strtolower((string) ($all_routes[$k]['title'] ?? '')), $q);
        }));
    }
    $per_page    = 15;
    $total_pages = max(1, (int) ceil(count($keys) / $per_page));
    $paged       = min($paged, $total_pages);
    $slice       = array_slice($keys, ($paged - 1) * $per_page, $per_page);
    $base_url    = admin_url('admin.php?page=outbound-cms&section=seo');
    ?>
    <div class="outbound-admin-card">
        <h2>Publishing Center & Search Filter</h2>
        <p><strong>Current State:</strong> <?php echo $has_draft ? '<span class="outbound-badge outbound-badge-amber">Unpublished Draft Staged</span>' : '<span class="outbound-badge outbound-badge-green">All Changes Live</span>'; ?> &middot; Total Indexed Routes: <strong><?php echo count($all_routes); ?></strong></p>
        <p><a class="button" href="<?php echo outbound_cms_esc_url($preview_url); ?>" target="_blank" rel="noopener">Open Private Draft Preview (?outbound_preview=1)</a></p>
        <p class="description">Filter routes by path or title using query parameter <code>?q=...</code> or quick search below:</p>
        <div class="outbound-filter-bar" style="margin-bottom:0;">
            <input type="search" id="outbound-seo-filter-input" value="<?php echo outbound_cms_esc_attr($search); ?>" placeholder="Filter route path or title (e.g. /packages)..." class="regular-text" />
            <button type="button" class="button" id="outbound-seo-filter-btn" data-base-url="<?php echo outbound_cms_esc_url($base_url); ?>">Filter Routes</button>
            <?php if ($search !== '') : ?>
                <a class="button-link" href="<?php echo outbound_cms_esc_url($base_url); ?>">Reset</a>
            <?php endif; ?>
        </div>
    </div>

    <div class="outbound-admin-card">
        <h2>Route SEO Titles & Meta Descriptions (Page <?php echo $paged; ?> of <?php echo $total_pages; ?>)</h2>
        <table class="widefat striped outbound-cms-table">
            <thead><tr><th style="width:22%;">Route Path</th><th style="width:36%;">SEO Title</th><th>Meta Description</th></tr></thead>
            <tbody>
                <?php foreach ($slice as $rpath) :
                    $meta = (array) ($all_routes[$rpath] ?? array());
                ?>
                    <tr>
                        <td><code><?php echo outbound_cms_esc_html($rpath); ?></code></td>
                        <td><input type="text" name="cms[route_seo][<?php echo outbound_cms_esc_attr($rpath); ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($meta['title'] ?? '')); ?>" class="large-text" /></td>
                        <td><textarea rows="2" name="cms[route_seo][<?php echo outbound_cms_esc_attr($rpath); ?>][description]" class="large-text"><?php echo outbound_cms_esc_html((string) ($meta['description'] ?? '')); ?></textarea></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <?php if ($total_pages > 1) : ?>
            <div class="outbound-pagination">
                <?php for ($i = 1; $i <= $total_pages; $i++) :
                    $p_url = add_query_arg(array('paged' => $i, 'q' => $search), $base_url);
                ?>
                    <a class="<?php echo $i === $paged ? 'button button-primary button-small' : 'button button-small'; ?>" href="<?php echo outbound_cms_esc_url($p_url); ?>"><?php echo $i; ?></a>
                <?php endfor; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

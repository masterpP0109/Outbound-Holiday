<?php
/**
 * Shared Visual Repeaters & Individual Record Editors for Outbound Holidays.
 * Used identically inside the 14-section Outbound CMS Studio and native WordPress Meta Boxes.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Resolve a lightweight slug => title index for CPT selectors in a single fast SQL query.
 * Avoids heavy full-post meta hydration inside editor dropdowns / multi-select lists.
 *
 * @return array<string, string>
 */
function outbound_editor_get_cpt_title_map(string $post_type): array {
    static $cache = array();
    if (isset($cache[$post_type])) {
        return $cache[$post_type];
    }

    $map = array();
    global $wpdb;
    if (isset($wpdb) && is_object($wpdb) && method_exists($wpdb, 'get_results')) {
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT post_name, post_title FROM {$wpdb->posts} WHERE post_type = %s AND post_status IN ('publish','draft','pending','private') ORDER BY menu_order ASC, post_title ASC",
                $post_type
            ),
            ARRAY_A
        );
        if (is_array($rows)) {
            foreach ($rows as $row) {
                $slug  = (string) ($row['post_name'] ?? '');
                $title = (string) ($row['post_title'] ?? '');
                if ($slug !== '' && $title !== '') {
                    $map[$slug] = $title;
                }
            }
        }
    }

    if (empty($map) && function_exists('outbound_get_baseline_snapshot')) {
        $snap = outbound_get_baseline_snapshot();
        $key_map = array(
            'experience'    => 'experiences',
            'accommodation' => 'accommodations',
            'package'       => 'packages',
            'guide_article' => 'guides',
        );
        $snap_key = $key_map[$post_type] ?? '';
        if ($snap_key !== '' && !empty($snap[$snap_key]) && is_array($snap[$snap_key])) {
            foreach ($snap[$snap_key] as $rec) {
                if (!is_array($rec)) {
                    continue;
                }
                $id = (string) ($rec['id'] ?? ($rec['slug'] ?? ''));
                $title = (string) ($rec['title'] ?? ($rec['name'] ?? $id));
                if ($id !== '') {
                    $map[$id] = $title;
                }
            }
        }
    }

    $cache[$post_type] = $map;
    return $map;
}

/**
 * Decode JSON meta safely, falling back cleanly when empty or invalid.
 *
 * @param mixed $fallback
 * @return mixed
 */
function outbound_editor_get_json_meta(int $post_id, string $meta_key, $fallback) {
    if (!function_exists('get_post_meta')) {
        return $fallback;
    }
    $raw = get_post_meta($post_id, $meta_key, true);
    if (!is_string($raw) || trim($raw) === '') {
        return $fallback;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $fallback;
}

/**
 * Load effective full record data for a CPT post (postmeta + baseline snapshot fallback).
 *
 * @return array<string, mixed>
 */
function outbound_editor_load_effective_record(int $post_id, string $post_type): array {
    $post = function_exists('get_post') ? get_post($post_id) : null;
    $slug = $post ? (string) $post->post_name : '';

    $stored_full = $post_id > 0 ? outbound_editor_get_json_meta($post_id, '_outbound_full_json', array()) : array();
    if (!empty($stored_full)) {
        return $stored_full;
    }

    if ($slug !== '' && function_exists('outbound_get_baseline_snapshot')) {
        $snap = outbound_get_baseline_snapshot();
        $key_map = array(
            'experience'    => 'experiences',
            'accommodation' => 'accommodations',
            'package'       => 'packages',
            'guide_article' => 'guides',
            'client_album'  => 'albums',
        );
        $snap_key = $key_map[$post_type] ?? '';
        if ($snap_key !== '' && !empty($snap[$snap_key]) && is_array($snap[$snap_key])) {
            foreach ($snap[$snap_key] as $rec) {
                if (is_array($rec) && (($rec['slug'] ?? '') === $slug || ($rec['id'] ?? '') === $slug)) {
                    return $rec;
                }
            }
        }
    }

    return array();
}

/**
 * Render a reusable Media Library image input with thumbnail preview, upload, and clear controls.
 */
function outbound_editor_render_media_field(string $name, string $value, string $id_slug, string $placeholder = 'https://...'): void {
    $safe_id   = preg_replace('/[^a-zA-Z0-9_-]/', '_', $id_slug);
    $has_img   = trim($value) !== '';
    $thumb_url = $has_img ? outbound_cms_esc_url($value) : '';
    ?>
    <div class="outbound-media-field">
        <div class="outbound-media-preview-box <?php echo $has_img ? 'has-image' : ''; ?>">
            <?php if ($has_img) : ?>
                <img src="<?php echo $thumb_url; ?>" alt="" class="outbound-media-thumb" />
            <?php else : ?>
                <span class="outbound-media-placeholder">No photo</span>
            <?php endif; ?>
        </div>
        <div class="outbound-media-controls">
            <input type="text" id="<?php echo outbound_cms_esc_attr($safe_id); ?>" name="<?php echo outbound_cms_esc_attr($name); ?>" value="<?php echo outbound_cms_esc_attr($value); ?>" class="regular-text outbound-media-input" placeholder="<?php echo outbound_cms_esc_attr($placeholder); ?>" />
            <div class="outbound-media-buttons">
                <button type="button" class="button outbound-media-single-btn" data-target="#<?php echo outbound_cms_esc_attr($safe_id); ?>">Choose / Upload Image</button>
                <button type="button" class="button-link-delete outbound-media-clear-btn" data-target="#<?php echo outbound_cms_esc_attr($safe_id); ?>">Remove</button>
            </div>
        </div>
    </div>
    <?php
}

/**
 * Render a repeatable list of single-line text items with Add / Duplicate / Reorder / Remove controls.
 *
 * @param array<int, string> $items
 */
function outbound_editor_render_string_repeater(string $field_name, string $label, array $items, string $add_label = '+ Add Item', string $placeholder = 'Enter item...'): void {
    $rows = !empty($items) ? array_values($items) : array('');
    $prefix = $field_name . '[';
    ?>
    <div class="outbound-editor-subsection">
        <label class="outbound-field-label"><?php echo outbound_cms_esc_html($label); ?></label>
        <div class="outbound-repeater-list" data-repeater-prefix="<?php echo outbound_cms_esc_attr($prefix); ?>">
            <?php foreach ($rows as $idx => $val) : ?>
                <div class="outbound-repeater-row outbound-repeater-inline-row">
                    <span class="outbound-row-handle" title="Item #<?php echo (int) ($idx + 1); ?>"><?php echo (int) ($idx + 1); ?></span>
                    <input type="text" name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . ']'); ?>" value="<?php echo outbound_cms_esc_attr((string) $val); ?>" class="large-text" placeholder="<?php echo outbound_cms_esc_attr($placeholder); ?>" />
                    <div class="outbound-row-controls">
                        <button type="button" class="button button-small outbound-row-up" title="Move Up">&uarr;</button>
                        <button type="button" class="button button-small outbound-row-down" title="Move Down">&darr;</button>
                        <button type="button" class="button button-small outbound-row-duplicate" title="Duplicate">Copy</button>
                        <button type="button" class="button-link-delete outbound-row-remove" title="Remove">&times;</button>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        <button type="button" class="button button-secondary outbound-row-add"><?php echo outbound_cms_esc_html($add_label); ?></button>
    </div>
    <?php
}

/**
 * Render visual Gallery Manager with thumbnails, Add Multiple, Replace Image, Set as Hero, Move Up/Down, Duplicate & Remove.
 *
 * @param array<int, mixed> $items
 */
function outbound_editor_render_gallery_editor(string $field_name, string $label, array $items, string $hero_input_selector = '', bool $rich_album_mode = false): void {
    $norm = array();
    foreach ($items as $idx => $item) {
        if (is_string($item) && trim($item) !== '') {
            $norm[] = array('url' => $item, 'alt' => '', 'caption' => '', 'role' => 'gallery', 'id' => 'img-' . ($idx + 1));
        } elseif (is_array($item) && !empty($item['url'])) {
            $norm[] = array(
                'id'      => (string) ($item['id'] ?? 'img-' . ($idx + 1)),
                'url'     => (string) ($item['url'] ?? ''),
                'alt'     => (string) ($item['alt'] ?? ''),
                'caption' => (string) ($item['caption'] ?? ''),
                'role'    => (string) ($item['role'] ?? 'gallery'),
            );
        }
    }
    if (empty($norm)) {
        $norm[] = array('id' => 'img-1', 'url' => '', 'alt' => '', 'caption' => '', 'role' => 'gallery');
    }
    $prefix = $field_name . '[';
    $list_id = 'outbound-gallery-' . sanitize_key(str_replace(array('[', ']'), '_', $field_name));
    ?>
    <div class="outbound-editor-subsection">
        <div class="outbound-subsection-header">
            <label class="outbound-field-label"><?php echo outbound_cms_esc_html($label); ?></label>
            <div class="outbound-subsection-actions">
                <button type="button" class="button button-secondary outbound-gallery-multi-btn" data-gallery-list="#<?php echo outbound_cms_esc_attr($list_id); ?>" data-field-name="<?php echo outbound_cms_esc_attr($field_name); ?>">+ Add Photos from Media Library</button>
                <button type="button" class="button outbound-row-add-target" data-target="#<?php echo outbound_cms_esc_attr($list_id); ?>">+ Add Empty Photo Slot</button>
            </div>
        </div>
        <div id="<?php echo outbound_cms_esc_attr($list_id); ?>" class="outbound-repeater-list outbound-gallery-grid-editor" data-repeater-prefix="<?php echo outbound_cms_esc_attr($prefix); ?>" data-gallery-rich="<?php echo $rich_album_mode ? '1' : '0'; ?>">
            <?php foreach ($norm as $idx => $img) :
                $uid = $list_id . '_url_' . $idx;
                $url = (string) ($img['url'] ?? '');
            ?>
                <div class="outbound-repeater-row outbound-gallery-card">
                    <div class="outbound-gallery-card-thumb">
                        <?php if ($url !== '') : ?>
                            <img src="<?php echo outbound_cms_esc_url($url); ?>" alt="" />
                        <?php else : ?>
                            <span class="outbound-media-placeholder">No photo</span>
                        <?php endif; ?>
                    </div>
                    <div class="outbound-gallery-card-fields">
                        <input type="hidden" name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . '][id]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($img['id'] ?? ('img-' . ($idx + 1)))); ?>" />
                        <p style="margin:0 0 6px;">
                            <input type="text" id="<?php echo outbound_cms_esc_attr($uid); ?>" name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . '][url]'); ?>" value="<?php echo outbound_cms_esc_attr($url); ?>" class="large-text outbound-gallery-url-input" placeholder="https://..." />
                        </p>
                        <?php if ($rich_album_mode) : ?>
                            <div class="outbound-meta-grid" style="margin-bottom:6px;">
                                <p style="margin:0;"><input type="text" name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . '][alt]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($img['alt'] ?? '')); ?>" class="widefat" placeholder="Alt text for accessibility & SEO" /></p>
                                <p style="margin:0;"><input type="text" name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . '][caption]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($img['caption'] ?? '')); ?>" class="widefat" placeholder="Photo caption (optional)" /></p>
                                <p style="margin:0;"><select name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . '][role]'); ?>" class="widefat">
                                    <option value="gallery" <?php selected((string) ($img['role'] ?? 'gallery'), 'gallery'); ?>>Gallery Photo</option>
                                    <option value="hero" <?php selected((string) ($img['role'] ?? ''), 'hero'); ?>>Album Cover / Hero</option>
                                </select></p>
                            </div>
                        <?php endif; ?>
                        <div class="outbound-row-controls">
                            <button type="button" class="button button-small outbound-gallery-replace-btn" data-target-input="#<?php echo outbound_cms_esc_attr($uid); ?>">Replace Photo</button>
                            <?php if ($hero_input_selector !== '') : ?>
                                <button type="button" class="button button-small outbound-set-hero-btn" data-source-input="#<?php echo outbound_cms_esc_attr($uid); ?>" data-hero-input="<?php echo outbound_cms_esc_attr($hero_input_selector); ?>">Set as Featured Image</button>
                            <?php endif; ?>
                            <button type="button" class="button button-small outbound-row-up" title="Move Earlier">&uarr; Move Up</button>
                            <button type="button" class="button button-small outbound-row-down" title="Move Later">&darr; Move Down</button>
                            <button type="button" class="button button-small outbound-row-duplicate">Duplicate</button>
                            <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
}

/**
 * Render reusable FAQs repeater supporting both {q,a} and {question,answer} shapes.
 *
 * @param array<int, array<string, mixed>> $faqs
 */
function outbound_editor_render_faqs_repeater(string $field_name, string $label, array $faqs, string $q_key = 'q', string $a_key = 'a', bool $with_category = false): void {
    $rows = !empty($faqs) ? array_values($faqs) : array(array($q_key => '', $a_key => '', 'category' => ''));
    $prefix = $field_name . '[';
    ?>
    <div class="outbound-editor-subsection">
        <label class="outbound-field-label"><?php echo outbound_cms_esc_html($label); ?></label>
        <div class="outbound-repeater-list" data-repeater-prefix="<?php echo outbound_cms_esc_attr($prefix); ?>">
            <?php foreach ($rows as $idx => $faq) :
                if (!is_array($faq)) { continue; }
                $q = (string) ($faq[$q_key] ?? ($faq['question'] ?? ($faq['q'] ?? '')));
                $a = (string) ($faq[$a_key] ?? ($faq['answer'] ?? ($faq['a'] ?? '')));
                $c = (string) ($faq['category'] ?? '');
            ?>
                <div class="outbound-repeater-row outbound-repeater-card">
                    <div class="outbound-repeater-card-head">
                        <strong>FAQ #<?php echo (int) ($idx + 1); ?></strong>
                        <div class="outbound-row-controls">
                            <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                            <button type="button" class="button button-small outbound-row-down">&darr;</button>
                            <button type="button" class="button button-small outbound-row-duplicate">Duplicate</button>
                            <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                        </div>
                    </div>
                    <p><label>Question<br><input type="text" name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . '][' . $q_key . ']'); ?>" value="<?php echo outbound_cms_esc_attr($q); ?>" class="large-text" placeholder="e.g. What time does pick-up start?" /></label></p>
                    <p><label>Answer<br><textarea rows="2" name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . '][' . $a_key . ']'); ?>" class="large-text" placeholder="Clear, helpful local answer..."><?php echo outbound_cms_esc_html($a); ?></textarea></label></p>
                    <?php if ($with_category) : ?>
                        <p><label>Category (optional)<br><input type="text" name="<?php echo outbound_cms_esc_attr($field_name . '[' . $idx . '][category]'); ?>" value="<?php echo outbound_cms_esc_attr($c); ?>" class="regular-text" placeholder="Booking / Logistics / Safety" /></label></p>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
        <button type="button" class="button button-secondary outbound-row-add">+ Add FAQ</button>
    </div>
    <?php
}

/**
 * Render searchable multi-checkbox related content picker.
 *
 * @param array<int, string> $selected_ids
 */
function outbound_editor_render_related_selector(string $field_name, string $label, string $target_post_type, array $selected_ids, string $exclude_slug = ''): void {
    $options = outbound_editor_get_cpt_title_map($target_post_type);
    $clean_selected = array_map('strval', $selected_ids);
    ?>
    <div class="outbound-editor-subsection">
        <label class="outbound-field-label"><?php echo outbound_cms_esc_html($label); ?></label>
        <div class="outbound-related-grid">
            <?php foreach ($options as $slug => $title) :
                if ($exclude_slug !== '' && $slug === $exclude_slug) { continue; }
                $checked = in_array((string) $slug, $clean_selected, true);
            ?>
                <label class="outbound-related-chip <?php echo $checked ? 'is-checked' : ''; ?>">
                    <input type="checkbox" name="<?php echo outbound_cms_esc_attr($field_name); ?>[]" value="<?php echo outbound_cms_esc_attr((string) $slug); ?>" <?php checked($checked, true); ?> />
                    <span><?php echo outbound_cms_esc_html((string) $title); ?></span>
                </label>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
}

/**
 * Render SEO Override + Metadata fields block (shared across CPT item editors).
 */
function outbound_editor_render_seo_block(int $post_id, array $fallback_seo = array(), bool $include_reading_time = false): void {
    $meta_title = (string) (function_exists('get_post_meta') ? get_post_meta($post_id, '_outbound_seo_title', true) : '') ?: (string) ($fallback_seo['metaTitle'] ?? '');
    $meta_desc  = (string) (function_exists('get_post_meta') ? get_post_meta($post_id, '_outbound_seo_description', true) : '') ?: (string) ($fallback_seo['metaDescription'] ?? '');
    $canonical  = (string) (function_exists('get_post_meta') ? get_post_meta($post_id, '_outbound_seo_canonical', true) : '') ?: (string) ($fallback_seo['canonicalUrl'] ?? '');
    $keywords   = (array) (outbound_editor_get_json_meta($post_id, '_outbound_seo_keywords_json', (array) ($fallback_seo['keywords'] ?? array())));
    $read_min   = (string) (function_exists('get_post_meta') ? get_post_meta($post_id, '_outbound_reading_time', true) : '');
    ?>
    <details class="outbound-editor-section" open>
        <summary>SEO &amp; Search Engine Metadata</summary>
        <div class="outbound-editor-section-body">
            <div class="outbound-meta-grid">
                <p><label><strong>Meta Title</strong><br><input type="text" name="outbound_meta[_outbound_seo_title]" value="<?php echo outbound_cms_esc_attr($meta_title); ?>" class="widefat" placeholder="Search engine page title" /></label></p>
                <p><label><strong>Canonical URL (optional override)</strong><br><input type="url" name="outbound_meta[_outbound_seo_canonical]" value="<?php echo outbound_cms_esc_attr($canonical); ?>" class="widefat" placeholder="Leave blank for automatic permalink" /></label></p>
                <?php if ($include_reading_time) : ?>
                    <p><label><strong>Reading Time Label</strong><br><input type="text" name="outbound_meta[_outbound_reading_time]" value="<?php echo outbound_cms_esc_attr($read_min); ?>" class="widefat" placeholder="6 min read" /></label></p>
                <?php endif; ?>
            </div>
            <p><label><strong>Meta Description</strong><br><textarea name="outbound_meta[_outbound_seo_description]" rows="2" class="large-text"><?php echo outbound_cms_esc_html($meta_desc); ?></textarea></label></p>
            <p><label><strong>Focus Keywords (comma-separated)</strong><br><input type="text" name="outbound_seo_keywords_csv" value="<?php echo outbound_cms_esc_attr(implode(', ', array_map('strval', $keywords))); ?>" class="large-text" placeholder="victoria falls tour, zambezi sunset cruise" /></label></p>
        </div>
    </details>
    <?php
}

/**
 * Render Core WP Post Identity & Media fields when editing inside Outbound CMS Hub.
 */
function outbound_editor_render_cms_core_fields(WP_Post $post, string $post_type, string $hero_url, string $hero_input_id, string $summary_label = 'Card Summary (Excerpt)', string $body_label = 'Full Editorial Description'): void {
    $status = (string) $post->post_status;
    ?>
    <div class="outbound-admin-card">
        <div class="outbound-card-toolbar">
            <div>
                <h2 style="margin:0;"><?php echo $post->ID > 0 ? 'Editing: ' . outbound_cms_esc_html((string) $post->post_title) : 'Create New Item'; ?></h2>
                <p class="description" style="margin:4px 0 0;">Type: <code><?php echo outbound_cms_esc_html($post_type); ?></code> &middot; Status: <strong><?php echo outbound_cms_esc_html($status === 'publish' ? 'Published' : 'Draft'); ?></strong></p>
            </div>
        </div>
        <div class="outbound-meta-grid">
            <p><label><strong>Title / Name *</strong><br><input type="text" name="outbound_post[post_title]" value="<?php echo outbound_cms_esc_attr((string) $post->post_title); ?>" class="widefat" required /></label></p>
            <p><label><strong>URL Slug</strong><br><input type="text" name="outbound_post[post_name]" value="<?php echo outbound_cms_esc_attr((string) $post->post_name); ?>" class="widefat code" placeholder="auto-generated-from-title" /></label></p>
            <p><label><strong>Menu Order (Sorting Priority)</strong><br><input type="number" name="outbound_post[menu_order]" value="<?php echo (int) $post->menu_order; ?>" class="widefat" /></label></p>
        </div>
        <p><label><strong><?php echo outbound_cms_esc_html($summary_label); ?></strong><br><textarea name="outbound_post[post_excerpt]" rows="2" class="large-text"><?php echo outbound_cms_esc_html((string) $post->post_excerpt); ?></textarea></label></p>
        <?php if ($post_type !== 'client_album') : ?>
            <p><label><strong><?php echo outbound_cms_esc_html($body_label); ?></strong><br><textarea name="outbound_post[post_content]" rows="5" class="large-text"><?php echo outbound_cms_esc_html((string) $post->post_content); ?></textarea></label></p>
        <?php endif; ?>
        <div class="outbound-editor-subsection" style="margin-top:12px;">
            <label class="outbound-field-label">Primary / Hero Featured Image</label>
            <?php outbound_editor_render_media_field('outbound_hero_image_url', $hero_url, $hero_input_id); ?>
        </div>
    </div>
    <?php
}

/**
 * EXPERIENCE EDITOR (Visual Repeaters for Highlights, Included, Excluded, Good to Know, Steps, Gallery, FAQs, Related).
 */
function outbound_editor_render_experience_fields(WP_Post $post, bool $in_cms_hub = false): void {
    $post_id = (int) $post->ID;
    $base    = $post_id > 0 ? outbound_editor_load_effective_record($post_id, 'experience') : array();

    $hero_url = $post_id > 0 ? (string) get_post_meta($post_id, '_outbound_hero_image_url', true) : '';
    if ($hero_url === '' && $post_id > 0 && function_exists('outbound_resolve_wp_post_image')) {
        $hero_url = outbound_resolve_wp_post_image($post_id, (string) ($base['featuredImage'] ?? ''), 'falls');
    } elseif ($hero_url === '') {
        $hero_url = (string) ($base['featuredImage'] ?? '');
    }

    if ($in_cms_hub) {
        outbound_editor_render_cms_core_fields($post, 'experience', $hero_url, 'exp_hero_img_input', 'Short Card Description', 'Full Experience Overview');
    }

    $price_usd  = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_price_usd', true) : '');
    if ($price_usd === '' && isset($base['priceAmount'])) { $price_usd = (string) $base['priceAmount']; }
    $duration   = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_duration', true) : '') ?: (string) ($base['duration'] ?? '');
    $location   = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_location', true) : '') ?: (string) ($base['location'] ?? 'Victoria Falls');
    $subtitle   = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_subtitle', true) : '') ?: (string) ($base['subtitle'] ?? '');
    $badge      = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_badge', true) : '') ?: (string) ($base['badge'] ?? '');
    $min_age    = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_min_age', true) : '');
    $featured   = $post_id > 0 ? (bool) get_post_meta($post_id, '_outbound_featured', true) : false;
    $why_rec    = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_why_recommend', true) : '') ?: (string) ($base['whyWeRecommend'] ?? '');
    $expert_tip = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_expert_tip', true) : '') ?: (string) ($base['localExpertTip'] ?? '');

    $cats = array();
    if ($post_id > 0 && function_exists('wp_get_post_terms')) {
        $terms = wp_get_post_terms($post_id, 'experience_category', array('fields' => 'slugs'));
        if (is_array($terms)) {
            $cats = array_map('strval', $terms);
        }
    }
    if (empty($cats)) {
        $cats = (array) ($base['categories'] ?? array('first-visit'));
    }

    $highlights   = outbound_editor_get_json_meta($post_id, '_outbound_highlights_json', (array) ($base['highlights'] ?? array()));
    $included     = outbound_editor_get_json_meta($post_id, '_outbound_inclusions_json', (array) ($base['whatsIncluded'] ?? array()));
    $excluded     = outbound_editor_get_json_meta($post_id, '_outbound_exclusions_json', (array) ($base['whatsExcluded'] ?? array()));
    $good_to_know = outbound_editor_get_json_meta($post_id, '_outbound_good_to_know_json', (array) ($base['goodToKnow'] ?? array()));
    $gallery      = outbound_editor_get_json_meta($post_id, '_outbound_gallery_json', (array) ($base['galleryImages'] ?? array()));
    $steps        = outbound_editor_get_json_meta($post_id, '_outbound_steps_json', (array) ($base['steps'] ?? array()));
    $faqs         = outbound_editor_get_json_meta($post_id, '_outbound_faqs_json', (array) ($base['faqs'] ?? array()));
    $related_ids  = outbound_editor_get_json_meta($post_id, '_outbound_related_ids_json', (array) ($base['relatedIds'] ?? array()));

    $exp_cat_choices = array(
        'featured'    => 'Featured Highlight',
        'first-visit' => 'First Visit Essential',
        'wildlife'    => 'Wildlife & Safari',
        'adventure'   => 'Adventure & Adrenaline',
        'river'       => 'Zambezi River',
        'culture'     => 'Culture & Dining',
        'day-trips'   => 'Cross-Border Day Trips',
    );
    ?>
    <details class="outbound-editor-section" open>
        <summary>Pricing, Categories &amp; Editorial Insight</summary>
        <div class="outbound-editor-section-body">
            <div class="outbound-meta-grid">
                <p><label><strong>Price Per Adult (USD)</strong><br><input type="number" step="1" min="0" name="outbound_meta[_outbound_price_usd]" value="<?php echo outbound_cms_esc_attr($price_usd); ?>" class="widefat" /></label></p>
                <p><label><strong>Duration</strong><br><input type="text" name="outbound_meta[_outbound_duration]" value="<?php echo outbound_cms_esc_attr($duration); ?>" class="widefat" placeholder="2.5 Hours / Full Day" /></label></p>
                <p><label><strong>Location / Area</strong><br><input type="text" name="outbound_meta[_outbound_location]" value="<?php echo outbound_cms_esc_attr($location); ?>" class="widefat" placeholder="Zambezi National Park" /></label></p>
                <p><label><strong>Subtitle / Hook</strong><br><input type="text" name="outbound_meta[_outbound_subtitle]" value="<?php echo outbound_cms_esc_attr($subtitle); ?>" class="widefat" /></label></p>
                <p><label><strong>Badge Label (optional)</strong><br><input type="text" name="outbound_meta[_outbound_badge]" value="<?php echo outbound_cms_esc_attr($badge); ?>" class="widefat" placeholder="Guest Favourite" /></label></p>
                <p><label><strong>Minimum Age (optional)</strong><br><input type="text" name="outbound_meta[_outbound_min_age]" value="<?php echo outbound_cms_esc_attr($min_age); ?>" class="widefat" placeholder="All Ages / 14+" /></label></p>
            </div>
            <p><label><input type="checkbox" name="outbound_meta[_outbound_featured]" value="1" <?php checked($featured, true); ?> /> <strong>Feature on Homepage &ldquo;Things to Do&rdquo; showcase</strong></label></p>
            <?php if ($in_cms_hub) : ?>
                <p><strong>Experience Categories</strong></p>
                <div class="outbound-related-grid" style="margin-bottom:14px;">
                    <?php foreach ($exp_cat_choices as $ckey => $clabel) :
                        $is_c = in_array($ckey, $cats, true);
                    ?>
                        <label class="outbound-related-chip <?php echo $is_c ? 'is-checked' : ''; ?>">
                            <input type="checkbox" name="outbound_tax_exp_cats[]" value="<?php echo outbound_cms_esc_attr($ckey); ?>" <?php checked($is_c, true); ?> />
                            <span><?php echo outbound_cms_esc_html($clabel); ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            <p><label><strong>Why Outbound Holidays Recommends This</strong><br><textarea name="outbound_meta[_outbound_why_recommend]" rows="3" class="large-text"><?php echo outbound_cms_esc_html($why_rec); ?></textarea></label></p>
            <p><label><strong>Local Specialist Insider Tip</strong><br><textarea name="outbound_meta[_outbound_expert_tip]" rows="2" class="large-text"><?php echo outbound_cms_esc_html($expert_tip); ?></textarea></label></p>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>Highlights, Inclusions, Exclusions &amp; Practical Notes</summary>
        <div class="outbound-editor-section-body">
            <?php
            outbound_editor_render_string_repeater('outbound_list_highlights', 'Key Highlights', $highlights, '+ Add Highlight', 'Guided walk across key viewpoints');
            outbound_editor_render_string_repeater('outbound_list_inclusions', 'What Is Included', $included, '+ Add Inclusion', 'Hotel pick-up and return transfers');
            outbound_editor_render_string_repeater('outbound_list_exclusions', 'What Is Excluded (Optional)', $excluded, '+ Add Exclusion', 'National Park entry fee ($50 pp)');
            outbound_editor_render_string_repeater('outbound_list_good_to_know', 'Good to Know Practical Notes', $good_to_know, '+ Add Practical Note', 'Bring waterproof poncho during high water season');
            ?>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>Step-by-Step Experience Timeline (<?php echo count($steps); ?> steps)</summary>
        <div class="outbound-editor-section-body">
            <?php
            $step_rows = !empty($steps) ? array_values($steps) : array(array('stepNumber' => 1, 'time' => '', 'title' => '', 'description' => '', 'highlight' => '', 'image' => ''));
            ?>
            <div class="outbound-repeater-list" data-repeater-prefix="outbound_steps[">
                <?php foreach ($step_rows as $sidx => $st) :
                    if (!is_array($st)) { continue; }
                ?>
                    <div class="outbound-repeater-row outbound-repeater-card">
                        <div class="outbound-repeater-card-head">
                            <strong>Step #<?php echo (int) ($sidx + 1); ?>: <?php echo outbound_cms_esc_html((string) ($st['title'] ?? 'New Step')); ?></strong>
                            <div class="outbound-row-controls">
                                <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                                <button type="button" class="button button-small outbound-row-down">&darr;</button>
                                <button type="button" class="button button-small outbound-row-duplicate">Duplicate</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Step #<br><input type="number" min="1" name="outbound_steps[<?php echo (int) $sidx; ?>][stepNumber]" value="<?php echo (int) ($st['stepNumber'] ?? ($sidx + 1)); ?>" style="width:90px;" /></label></p>
                            <p><label>Time Window<br><input type="text" name="outbound_steps[<?php echo (int) $sidx; ?>][time]" value="<?php echo outbound_cms_esc_attr((string) ($st['time'] ?? '')); ?>" class="widefat" placeholder="08:00 AM" /></label></p>
                            <p><label>Step Title<br><input type="text" name="outbound_steps[<?php echo (int) $sidx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($st['title'] ?? '')); ?>" class="widefat" placeholder="Hotel Collection & Briefing" /></label></p>
                            <p><label>Highlight Tag (optional)<br><input type="text" name="outbound_steps[<?php echo (int) $sidx; ?>][highlight]" value="<?php echo outbound_cms_esc_attr((string) ($st['highlight'] ?? '')); ?>" class="widefat" /></label></p>
                        </div>
                        <p><label>Description<br><textarea rows="2" name="outbound_steps[<?php echo (int) $sidx; ?>][description]" class="large-text"><?php echo outbound_cms_esc_html((string) ($st['description'] ?? '')); ?></textarea></label></p>
                        <?php outbound_editor_render_media_field('outbound_steps[' . $sidx . '][image]', (string) ($st['image'] ?? ''), 'exp_step_img_' . $sidx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button button-secondary outbound-row-add">+ Add Timeline Step</button>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>Experience Photo Gallery (<?php echo count($gallery); ?> photos)</summary>
        <div class="outbound-editor-section-body">
            <?php outbound_editor_render_gallery_editor('outbound_gallery_items', 'Gallery Images', $gallery, $in_cms_hub ? '#exp_hero_img_input' : '', false); ?>
        </div>
    </details>

    <details class="outbound-editor-section">
        <summary>FAQs &amp; Related Experiences (<?php echo count($faqs); ?> FAQs)</summary>
        <div class="outbound-editor-section-body">
            <?php
            outbound_editor_render_faqs_repeater('outbound_faqs', 'Experience Frequently Asked Questions', $faqs, 'q', 'a', false);
            outbound_editor_render_related_selector('outbound_related_ids', 'Related Experiences Shown Below', 'experience', $related_ids, (string) $post->post_name);
            ?>
        </div>
    </details>
    <?php
    if ($in_cms_hub) {
        outbound_editor_render_seo_block($post_id, (array) ($base['seo'] ?? array()), false);
    }
}

/**
 * ACCOMMODATION EDITOR (Property specs, At-a-Glance, Facilities, Location Info, Repeatable Rooms, Gallery, Related).
 */
function outbound_editor_render_accommodation_fields(WP_Post $post, bool $in_cms_hub = false): void {
    $post_id = (int) $post->ID;
    $base    = $post_id > 0 ? outbound_editor_load_effective_record($post_id, 'accommodation') : array();

    $hero_url = $post_id > 0 ? (string) get_post_meta($post_id, '_outbound_hero_image_url', true) : '';
    if ($hero_url === '' && $post_id > 0 && function_exists('outbound_resolve_wp_post_image')) {
        $hero_url = outbound_resolve_wp_post_image($post_id, (string) ($base['heroImage'] ?? ''), 'hero');
    } elseif ($hero_url === '') {
        $hero_url = (string) ($base['heroImage'] ?? '');
    }

    if ($in_cms_hub) {
        outbound_editor_render_cms_core_fields($post, 'accommodation', $hero_url, 'acc_hero_img_input', 'Card Summary (Short Description)', 'Editorial Overview');
    }

    $category_id = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_category_id', true) : '') ?: 'lodges';
    $cat_label   = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_category_label', true) : '') ?: (string) ($base['category'] ?? 'Luxury Lodge');
    $badge       = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_badge', true) : '') ?: (string) ($base['badge'] ?? '');
    $tagline     = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_tagline', true) : '') ?: (string) ($base['tagline'] ?? '');
    $location    = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_location', true) : '') ?: (string) ($base['location'] ?? 'Victoria Falls, Zimbabwe');
    $dist_falls  = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_distance_falls', true) : '') ?: (string) ($base['distanceFromFalls'] ?? '');
    $dist_air    = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_airport_distance', true) : '') ?: (string) ($base['airportDistance'] ?? '');
    $price_usd   = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_price_usd', true) : '');
    if ($price_usd === '' && isset($base['priceFromUSD'])) { $price_usd = (string) $base['priceFromUSD']; }
    $price_basis = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_price_basis', true) : '') ?: (string) ($base['priceUnit'] ?? 'per night (sharing)');
    $max_guests  = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_max_guests', true) : '') ?: (string) ($base['maxGuests'] ?? '2');
    $rating      = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_rating', true) : '') ?: (string) ($base['rating'] ?? '4.8');
    $review_cnt  = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_review_count', true) : '') ?: (string) ($base['reviewCount'] ?? '24');
    $check_in    = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_checkin_time', true) : '') ?: (string) ($base['checkInTime'] ?? '14:00');
    $check_out   = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_checkout_time', true) : '') ?: (string) ($base['checkOutTime'] ?? '10:00');
    $featured    = $post_id > 0 ? (bool) get_post_meta($post_id, '_outbound_featured', true) : false;
    $why_rec     = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_why_recommend', true) : '');
    if ($why_rec === '' && isset($base['whyWeRecommend'])) {
        $why_rec = is_array($base['whyWeRecommend']) ? implode(' ', $base['whyWeRecommend']) : (string) $base['whyWeRecommend'];
    }

    $amenities   = outbound_editor_get_json_meta($post_id, '_outbound_amenities_json', (array) ($base['amenities'] ?? array()));
    $filter_tags = outbound_editor_get_json_meta($post_id, '_outbound_filter_tags_json', (array) ($base['filterTags'] ?? array()));
    $at_glance   = outbound_editor_get_json_meta($post_id, '_outbound_at_a_glance_json', is_array($base['atAGlance'] ?? null) ? $base['atAGlance'] : array());
    $rooms       = outbound_editor_get_json_meta($post_id, '_outbound_room_types_json', (array) ($base['roomTypes'] ?? array()));
    $facilities  = outbound_editor_get_json_meta($post_id, '_outbound_facilities_json', (array) ($base['facilities'] ?? array()));
    $loc_info    = outbound_editor_get_json_meta($post_id, '_outbound_location_info_json', (array) ($base['locationInfo'] ?? array()));
    $gallery     = outbound_editor_get_json_meta($post_id, '_outbound_gallery_json', (array) ($base['galleryImages'] ?? array()));
    $nearby_exp  = outbound_editor_get_json_meta($post_id, '_outbound_nearby_experiences_json', (array) ($base['nearbyExperienceIds'] ?? array()));
    $related_ids = outbound_editor_get_json_meta($post_id, '_outbound_related_ids_json', (array) ($base['relatedPropertyIds'] ?? array()));

    $cat_labels = array('Luxury Lodge', 'Boutique Hotel', 'Guest Lodge', 'Safari Lodge', 'Resort', 'Self-Catering', 'Hotel', 'Lodge', 'Guest House', 'Apartment');
    $badges     = array('', 'Luxury', 'Family Favourite', 'Romantic', 'Best Value', 'Walking Distance', 'Boutique');
    $tag_defs   = array(
        'luxury-lodges'    => 'Luxury Lodges',
        'boutique-hotels'  => 'Boutique Hotels',
        'family-friendly'  => 'Family Friendly',
        'romantic-escapes' => 'Romantic Escapes',
        'best-value'       => 'Best Value',
        'safari-lodges'    => 'Safari Lodges',
        'self-catering'    => 'Self-Catering',
        'walking-distance' => 'Walking Distance to Town/Falls',
    );
    ?>
    <details class="outbound-editor-section" open>
        <summary>Property Classification, Pricing &amp; Distances</summary>
        <div class="outbound-editor-section-body">
            <div class="outbound-meta-grid">
                <p><label><strong>Filter Group (Where to Stay Tab)</strong><br>
                    <select name="outbound_meta[_outbound_category_id]" class="widefat">
                        <?php foreach (outbound_get_accommodation_category_defs() as $cid => $cdef) :
                            if ($cid === 'all') { continue; } ?>
                            <option value="<?php echo outbound_cms_esc_attr($cid); ?>" <?php selected($category_id, $cid); ?>><?php echo outbound_cms_esc_html($cdef['label']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label></p>
                <p><label><strong>Property Label</strong><br>
                    <select name="outbound_meta[_outbound_category_label]" class="widefat">
                        <?php foreach ($cat_labels as $cl) : ?>
                            <option value="<?php echo outbound_cms_esc_attr($cl); ?>" <?php selected($cat_label, $cl); ?>><?php echo outbound_cms_esc_html($cl); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label></p>
                <p><label><strong>Highlight Badge</strong><br>
                    <select name="outbound_meta[_outbound_badge]" class="widefat">
                        <?php foreach ($badges as $b) : ?>
                            <option value="<?php echo outbound_cms_esc_attr($b); ?>" <?php selected($badge, $b); ?>><?php echo outbound_cms_esc_html($b === '' ? '— None —' : $b); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label></p>
                <p><label><strong>Starting Price (USD)</strong><br><input type="number" step="1" min="0" name="outbound_meta[_outbound_price_usd]" value="<?php echo outbound_cms_esc_attr($price_usd); ?>" class="widefat" /></label></p>
                <p><label><strong>Price Unit Label</strong><br><input type="text" name="outbound_meta[_outbound_price_basis]" value="<?php echo outbound_cms_esc_attr($price_basis); ?>" class="widefat" /></label></p>
                <p><label><strong>Location / Area</strong><br><input type="text" name="outbound_meta[_outbound_location]" value="<?php echo outbound_cms_esc_attr($location); ?>" class="widefat" /></label></p>
                <p><label><strong>Distance from Victoria Falls</strong><br><input type="text" name="outbound_meta[_outbound_distance_falls]" value="<?php echo outbound_cms_esc_attr($dist_falls); ?>" class="widefat" placeholder="10 min walk / 15 min drive" /></label></p>
                <p><label><strong>Airport Distance</strong><br><input type="text" name="outbound_meta[_outbound_airport_distance]" value="<?php echo outbound_cms_esc_attr($dist_air); ?>" class="widefat" placeholder="25 min from VFA Airport" /></label></p>
                <p><label><strong>Max Guests Capacity</strong><br><input type="number" min="1" name="outbound_meta[_outbound_max_guests]" value="<?php echo outbound_cms_esc_attr($max_guests); ?>" class="widefat" /></label></p>
                <p><label><strong>Rating (1–5)</strong><br><input type="text" name="outbound_meta[_outbound_rating]" value="<?php echo outbound_cms_esc_attr($rating); ?>" class="widefat" /></label></p>
                <p><label><strong>Review Count</strong><br><input type="number" min="0" name="outbound_meta[_outbound_review_count]" value="<?php echo outbound_cms_esc_attr($review_cnt); ?>" class="widefat" /></label></p>
                <p><label><strong>Check-in / Check-out Times</strong><br>
                    <span style="display:flex;gap:6px;"><input type="text" name="outbound_meta[_outbound_checkin_time]" value="<?php echo outbound_cms_esc_attr($check_in); ?>" placeholder="14:00" style="width:50%;" /><input type="text" name="outbound_meta[_outbound_checkout_time]" value="<?php echo outbound_cms_esc_attr($check_out); ?>" placeholder="10:00" style="width:50%;" /></span>
                </label></p>
            </div>

            <p><label><input type="checkbox" name="outbound_meta[_outbound_featured]" value="1" <?php checked($featured, true); ?> /> <strong>Feature on Homepage &ldquo;Where to Stay&rdquo; showcase</strong></label></p>
            <p><label><strong>Property Tagline</strong><br><input type="text" name="outbound_meta[_outbound_tagline]" value="<?php echo outbound_cms_esc_attr($tagline); ?>" class="large-text" /></label></p>
            <p><label><strong>Why Outbound Recommends This Stay</strong><br><textarea name="outbound_meta[_outbound_why_recommend]" rows="3" class="large-text"><?php echo outbound_cms_esc_html($why_rec); ?></textarea></label></p>

            <p><strong>Filter Tags (Directory Filters)</strong></p>
            <div class="outbound-related-grid" style="margin-bottom:14px;">
                <?php foreach ($tag_defs as $tkey => $tlabel) :
                    $is_t = in_array($tkey, $filter_tags, true);
                ?>
                    <label class="outbound-related-chip <?php echo $is_t ? 'is-checked' : ''; ?>">
                        <input type="checkbox" name="outbound_filter_tags[]" value="<?php echo outbound_cms_esc_attr($tkey); ?>" <?php checked($is_t, true); ?> />
                        <span><?php echo outbound_cms_esc_html($tlabel); ?></span>
                    </label>
                <?php endforeach; ?>
            </div>

            <p><strong>Core Amenities</strong></p>
            <div class="outbound-related-grid">
                <?php foreach (outbound_get_amenity_definitions() as $aid => $adef) :
                    $has_a = in_array($aid, $amenities, true);
                ?>
                    <label class="outbound-related-chip <?php echo $has_a ? 'is-checked' : ''; ?>">
                        <input type="checkbox" name="outbound_amenities[]" value="<?php echo outbound_cms_esc_attr($aid); ?>" <?php checked($has_a, true); ?> />
                        <span><?php echo outbound_cms_esc_html($adef['label']); ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>At-a-Glance Summary Table</summary>
        <div class="outbound-editor-section-body">
            <div class="outbound-meta-grid">
                <?php
                $glance_fields = array(
                    'type'              => array('Property Style', $cat_label),
                    'starRating'        => array('Star Rating / Standard', '4-Star Boutique'),
                    'bestFor'           => array('Best For', 'Couples & Families'),
                    'distanceFromFalls' => array('Falls Access', $dist_falls ?: '10 min drive'),
                    'pool'              => array('Swimming Pool', 'Outdoor pool & deck'),
                    'restaurant'        => array('Dining / Restaurant', 'On-site restaurant & bar'),
                    'wifi'              => array('Wi-Fi Access', 'Complimentary high-speed Wi-Fi'),
                    'familyFriendly'    => array('Family Friendly', 'Yes, family suites available'),
                    'transfers'         => array('Airport Transfers', 'Private transfers arranged'),
                    'roomTypesSummary'  => array('Rooms Overview', 'Suites & Garden Rooms'),
                );
                foreach ($glance_fields as $gkey => $gmeta) :
                    $gval = (string) ($at_glance[$gkey] ?? $gmeta[1]);
                ?>
                    <p><label><strong><?php echo outbound_cms_esc_html($gmeta[0]); ?></strong><br><input type="text" name="outbound_at_glance[<?php echo outbound_cms_esc_attr($gkey); ?>]" value="<?php echo outbound_cms_esc_attr($gval); ?>" class="widefat" /></label></p>
                <?php endforeach; ?>
            </div>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>Room Configurations (<?php echo count($rooms); ?> room types)</summary>
        <div class="outbound-editor-section-body">
            <?php
            $room_rows = !empty($rooms) ? array_values($rooms) : array(array('name' => '', 'occupancy' => '2 Guests', 'description' => '', 'imageUrl' => '', 'features' => array()));
            ?>
            <div class="outbound-repeater-list" data-repeater-prefix="outbound_rooms[">
                <?php foreach ($room_rows as $ridx => $room) :
                    if (!is_array($room)) { continue; }
                    $feats = is_array($room['features'] ?? null) ? $room['features'] : array();
                ?>
                    <div class="outbound-repeater-row outbound-repeater-card">
                        <div class="outbound-repeater-card-head">
                            <strong>Room #<?php echo (int) ($ridx + 1); ?>: <?php echo outbound_cms_esc_html((string) ($room['name'] ?? 'New Room')); ?></strong>
                            <div class="outbound-row-controls">
                                <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                                <button type="button" class="button button-small outbound-row-down">&darr;</button>
                                <button type="button" class="button button-small outbound-row-duplicate">Duplicate</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Room Type Name<br><input type="text" name="outbound_rooms[<?php echo (int) $ridx; ?>][name]" value="<?php echo outbound_cms_esc_attr((string) ($room['name'] ?? '')); ?>" class="widefat" placeholder="Luxury River Suite" /></label></p>
                            <p><label>Occupancy<br><input type="text" name="outbound_rooms[<?php echo (int) $ridx; ?>][occupancy]" value="<?php echo outbound_cms_esc_attr((string) ($room['occupancy'] ?? '')); ?>" class="widefat" placeholder="2 Adults + 1 Child" /></label></p>
                        </div>
                        <p><label>Description<br><textarea rows="2" name="outbound_rooms[<?php echo (int) $ridx; ?>][description]" class="large-text"><?php echo outbound_cms_esc_html((string) ($room['description'] ?? '')); ?></textarea></label></p>
                        <p><label>Room Features (one per line)<br><textarea rows="2" name="outbound_rooms[<?php echo (int) $ridx; ?>][features_text]" class="large-text" placeholder="Private veranda&#10;Air conditioning&#10;En-suite rain shower"><?php echo outbound_cms_esc_html(implode("\n", array_map('strval', $feats))); ?></textarea></label></p>
                        <?php outbound_editor_render_media_field('outbound_rooms[' . $ridx . '][imageUrl]', (string) ($room['imageUrl'] ?? ''), 'acc_room_img_' . $ridx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button button-secondary outbound-row-add">+ Add Room Configuration</button>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>Property Photo Gallery (<?php echo count($gallery); ?> photos)</summary>
        <div class="outbound-editor-section-body">
            <?php outbound_editor_render_gallery_editor('outbound_gallery_items', 'Gallery Photos', $gallery, $in_cms_hub ? '#acc_hero_img_input' : '', false); ?>
        </div>
    </details>

    <details class="outbound-editor-section">
        <summary>Facilities &amp; Detailed Location Information</summary>
        <div class="outbound-editor-section-body">
            <?php
            $fac_rows = array();
            foreach ($facilities as $fac) {
                if (is_array($fac) && isset($fac['name'])) {
                    $fac_rows[] = $fac;
                } elseif (is_string($fac) && $fac !== '') {
                    $fac_rows[] = array('name' => $fac, 'category' => 'General');
                }
            }
            if (empty($fac_rows)) {
                $fac_rows[] = array('name' => '', 'category' => 'Property');
            }
            ?>
            <label class="outbound-field-label">Facilities List</label>
            <div class="outbound-repeater-list" data-repeater-prefix="outbound_facilities[">
                <?php foreach ($fac_rows as $fidx => $fac) : ?>
                    <div class="outbound-repeater-row outbound-repeater-inline-row">
                        <span class="outbound-row-handle"><?php echo (int) ($fidx + 1); ?></span>
                        <input type="text" name="outbound_facilities[<?php echo (int) $fidx; ?>][name]" value="<?php echo outbound_cms_esc_attr((string) ($fac['name'] ?? '')); ?>" class="regular-text" placeholder="Facility name (e.g. Infinity Pool)" />
                        <input type="text" name="outbound_facilities[<?php echo (int) $fidx; ?>][category]" value="<?php echo outbound_cms_esc_attr((string) ($fac['category'] ?? 'Property')); ?>" class="regular-text" placeholder="Category (Dining, Wellness...)" />
                        <div class="outbound-row-controls">
                            <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                            <button type="button" class="button button-small outbound-row-down">&darr;</button>
                            <button type="button" class="button-link-delete outbound-row-remove">&times;</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button button-secondary outbound-row-add">+ Add Facility</button>

            <hr style="margin:18px 0;" />
            <div class="outbound-meta-grid">
                <p><label><strong>Street / Neighbourhood Address</strong><br><input type="text" name="outbound_loc_info[address]" value="<?php echo outbound_cms_esc_attr((string) ($loc_info['address'] ?? $location)); ?>" class="widefat" /></label></p>
                <p><label><strong>Distance to Victoria Falls</strong><br><input type="text" name="outbound_loc_info[distanceToFalls]" value="<?php echo outbound_cms_esc_attr((string) ($loc_info['distanceToFalls'] ?? $dist_falls)); ?>" class="widefat" /></label></p>
                <p><label><strong>Distance to VFA Airport</strong><br><input type="text" name="outbound_loc_info[distanceToAirport]" value="<?php echo outbound_cms_esc_attr((string) ($loc_info['distanceToAirport'] ?? $dist_air)); ?>" class="widefat" /></label></p>
                <p><label><strong>Activity Pick-up / Departure Point</strong><br><input type="text" name="outbound_loc_info[departurePoints]" value="<?php echo outbound_cms_esc_attr((string) ($loc_info['departurePoints'] ?? 'Direct lobby pick-up for all tours')); ?>" class="widefat" /></label></p>
            </div>
            <?php
            outbound_editor_render_string_repeater('outbound_loc_attractions', 'Nearby Attractions', (array) ($loc_info['nearbyAttractions'] ?? array('Victoria Falls Rainforest', 'Victoria Falls Bridge')), '+ Add Attraction');
            outbound_editor_render_string_repeater('outbound_loc_restaurants', 'Nearby Restaurants', (array) ($loc_info['nearbyRestaurants'] ?? array('The Lookout Cafe', 'Palm Restaurant')), '+ Add Restaurant');
            ?>
        </div>
    </details>

    <details class="outbound-editor-section">
        <summary>Nearby Experiences &amp; Related Properties</summary>
        <div class="outbound-editor-section-body">
            <?php
            outbound_editor_render_related_selector('outbound_nearby_experiences', 'Nearby Experiences Suggested on Property Page', 'experience', $nearby_exp);
            outbound_editor_render_related_selector('outbound_related_ids', 'Similar Properties to Consider', 'accommodation', $related_ids, (string) $post->post_name);
            ?>
        </div>
    </details>
    <?php
    if ($in_cms_hub) {
        outbound_editor_render_seo_block($post_id, (array) ($base['seo'] ?? array()), false);
    }
}

/**
 * HOLIDAY PACKAGE EDITOR (Highlights Meta, Who-is-this-for, Repeatable Detailed Days, Hotels, Route Map, Gallery, FAQs).
 */
function outbound_editor_render_package_fields(WP_Post $post, bool $in_cms_hub = false): void {
    $post_id = (int) $post->ID;
    $base    = $post_id > 0 ? outbound_editor_load_effective_record($post_id, 'package') : array();

    $hero_url = $post_id > 0 ? (string) get_post_meta($post_id, '_outbound_hero_image_url', true) : '';
    if ($hero_url === '' && $post_id > 0 && function_exists('outbound_resolve_wp_post_image')) {
        $hero_url = outbound_resolve_wp_post_image($post_id, (string) ($base['imageUrl'] ?? ''), 'safari');
    } elseif ($hero_url === '') {
        $hero_url = (string) ($base['imageUrl'] ?? '');
    }

    if ($in_cms_hub) {
        outbound_editor_render_cms_core_fields($post, 'package', $hero_url, 'pkg_hero_img_input', 'Short Tagline (Card Hook)', 'Full Package Description');
    }

    $badge          = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_badge', true) : '') ?: (string) ($base['badge'] ?? 'Signature');
    $tier           = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_package_tier', true) : '') ?: (string) ($base['category'] ?? 'first-visit');
    $pkg_cats       = outbound_editor_get_json_meta($post_id, '_outbound_categories_json', (array) ($base['categories'] ?? array('first-visit')));
    $price_usd      = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_price_usd', true) : '');
    if ($price_usd === '' && isset($base['priceUSD'])) { $price_usd = (string) $base['priceUSD']; }
    $duration       = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_duration', true) : '') ?: (string) ($base['duration'] ?? '4 Days / 3 Nights');
    $traveller_type = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_traveller_type', true) : '') ?: (string) ($base['travellerType'] ?? 'Couples & Families');
    $rating         = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_rating', true) : '') ?: (string) ($base['rating'] ?? '4.9');
    $review_cnt     = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_review_count', true) : '') ?: (string) ($base['reviewCount'] ?? '18');
    $featured       = $post_id > 0 ? (bool) get_post_meta($post_id, '_outbound_featured', true) : false;

    $story_intro    = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_story_intro', true) : '') ?: (string) ($base['storyIntroduction'] ?? '');
    $why_rec        = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_why_recommend', true) : '');
    if ($why_rec === '' && isset($base['whyWeRecommend'])) {
        $why_rec = is_array($base['whyWeRecommend']) ? implode("\n", $base['whyWeRecommend']) : (string) $base['whyWeRecommend'];
    }
    $why_stay       = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_why_chose_stay', true) : '') ?: (string) ($base['whyWeChoseStay'] ?? '');

    $hl_meta        = outbound_editor_get_json_meta($post_id, '_outbound_highlights_meta_json', (array) ($base['highlightsMeta'] ?? array()));
    $who_for        = outbound_editor_get_json_meta($post_id, '_outbound_who_is_for_json', is_array($base['whoIsThisFor'] ?? null) ? $base['whoIsThisFor'] : array());
    $pricing_det    = outbound_editor_get_json_meta($post_id, '_outbound_pricing_details_json', (array) ($base['pricingDetails'] ?? array()));
    $highlights     = outbound_editor_get_json_meta($post_id, '_outbound_highlights_json', (array) ($base['highlights'] ?? array()));
    $included       = outbound_editor_get_json_meta($post_id, '_outbound_inclusions_json', (array) ($base['included'] ?? array()));
    $excluded       = outbound_editor_get_json_meta($post_id, '_outbound_exclusions_json', (array) ($base['notIncluded'] ?? array()));
    $gallery        = outbound_editor_get_json_meta($post_id, '_outbound_gallery_json', (array) ($base['galleryImages'] ?? array()));
    $detailed_days  = outbound_editor_get_json_meta($post_id, '_outbound_detailed_itinerary_json', (array) ($base['detailedItinerary'] ?? array()));
    if (empty($detailed_days) && !empty($base['itinerary']) && is_array($base['itinerary'])) {
        foreach ($base['itinerary'] as $simple_day) {
            $detailed_days[] = array(
                'day'       => (string) ($simple_day['day'] ?? 'Day 1'),
                'title'     => (string) ($simple_day['title'] ?? ''),
                'morning'   => (string) ($simple_day['description'] ?? ''),
                'afternoon' => '',
                'evening'   => '',
                'included'  => (array) ($simple_day['highlights'] ?? array()),
                'optionalUpgrade' => '',
                'travelNotes'     => '',
                'image'           => '',
            );
        }
    }
    $hotels         = outbound_editor_get_json_meta($post_id, '_outbound_recommended_hotels_json', (array) ($base['recommendedHotels'] ?? array()));
    $route_map      = outbound_editor_get_json_meta($post_id, '_outbound_route_map_json', (array) ($base['routeMap'] ?? array()));
    $inc_exps       = outbound_editor_get_json_meta($post_id, '_outbound_included_experiences_json', (array) ($base['includedExperienceIds'] ?? array()));
    $rel_pkgs       = outbound_editor_get_json_meta($post_id, '_outbound_related_ids_json', (array) ($base['relatedPackageIds'] ?? array()));
    $faqs           = outbound_editor_get_json_meta($post_id, '_outbound_faqs_json', (array) ($base['faqs'] ?? array()));

    $badge_opts = array('Best Value', 'Luxury', 'Family Favourites', 'Adventure', 'Signature', 'Popular');
    $cat_opts   = array('value' => 'Smart Value', 'luxury' => 'Luxury', 'family' => 'Family', 'adventure' => 'Adventure', 'safari' => 'Safari', 'first-visit' => 'First Visit', 'couples' => 'Couples');
    $cats_multi = array('first-visit' => 'First Visit', 'couples' => 'Couples', 'families' => 'Families', 'luxury' => 'Luxury', 'adventure' => 'Adventure', 'safari' => 'Safari', 'value' => 'Best Value');
    ?>
    <details class="outbound-editor-section" open>
        <summary>Package Classification, Pricing &amp; Editorial Introduction</summary>
        <div class="outbound-editor-section-body">
            <div class="outbound-meta-grid">
                <p><label><strong>Package Badge</strong><br>
                    <select name="outbound_meta[_outbound_badge]" class="widefat">
                        <?php foreach ($badge_opts as $bo) : ?>
                            <option value="<?php echo outbound_cms_esc_attr($bo); ?>" <?php selected($badge, $bo); ?>><?php echo outbound_cms_esc_html($bo); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label></p>
                <p><label><strong>Primary Category</strong><br>
                    <select name="outbound_meta[_outbound_package_tier]" class="widefat">
                        <?php foreach ($cat_opts as $ck => $cl) : ?>
                            <option value="<?php echo outbound_cms_esc_attr($ck); ?>" <?php selected($tier, $ck); ?>><?php echo outbound_cms_esc_html($cl); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label></p>
                <p><label><strong>Starting Price Per Person (USD)</strong><br><input type="number" step="1" min="0" name="outbound_meta[_outbound_price_usd]" value="<?php echo outbound_cms_esc_attr($price_usd); ?>" class="widefat" /></label></p>
                <p><label><strong>Duration Label</strong><br><input type="text" name="outbound_meta[_outbound_duration]" value="<?php echo outbound_cms_esc_attr($duration); ?>" class="widefat" placeholder="4 Days / 3 Nights" /></label></p>
                <p><label><strong>Ideal Traveller Profile</strong><br><input type="text" name="outbound_meta[_outbound_traveller_type]" value="<?php echo outbound_cms_esc_attr($traveller_type); ?>" class="widefat" /></label></p>
                <p><label><strong>Rating / Review Count</strong><br>
                    <span style="display:flex;gap:6px;"><input type="text" name="outbound_meta[_outbound_rating]" value="<?php echo outbound_cms_esc_attr($rating); ?>" style="width:50%;" /><input type="number" name="outbound_meta[_outbound_review_count]" value="<?php echo outbound_cms_esc_attr($review_cnt); ?>" style="width:50%;" /></span>
                </label></p>
            </div>
            <p><label><input type="checkbox" name="outbound_meta[_outbound_featured]" value="1" <?php checked($featured, true); ?> /> <strong>Feature on Homepage &ldquo;Tailor-Made Packages&rdquo; showcase</strong></label></p>
            <p><strong>Filter Tags (Packages Page)</strong></p>
            <div class="outbound-related-grid" style="margin-bottom:14px;">
                <?php foreach ($cats_multi as $cmk => $cml) :
                    $has_cm = in_array($cmk, $pkg_cats, true);
                ?>
                    <label class="outbound-related-chip <?php echo $has_cm ? 'is-checked' : ''; ?>">
                        <input type="checkbox" name="outbound_pkg_categories[]" value="<?php echo outbound_cms_esc_attr($cmk); ?>" <?php checked($has_cm, true); ?> />
                        <span><?php echo outbound_cms_esc_html($cml); ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
            <p><label><strong>Editorial Story Introduction</strong><br><textarea name="outbound_meta[_outbound_story_intro]" rows="3" class="large-text"><?php echo outbound_cms_esc_html($story_intro); ?></textarea></label></p>
            <p><label><strong>Why Outbound Recommends This Package</strong><br><textarea name="outbound_meta[_outbound_why_recommend]" rows="3" class="large-text"><?php echo outbound_cms_esc_html($why_rec); ?></textarea></label></p>
            <p><label><strong>Why We Chose These Stays</strong><br><textarea name="outbound_meta[_outbound_why_chose_stay]" rows="2" class="large-text"><?php echo outbound_cms_esc_html($why_stay); ?></textarea></label></p>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>At-a-Glance Package Snapshot &amp; Who Is This For</summary>
        <div class="outbound-editor-section-body">
            <div class="outbound-meta-grid">
                <p><label><strong>Accommodation Style</strong><br><input type="text" name="outbound_hl_meta[accommodation]" value="<?php echo outbound_cms_esc_attr((string) ($hl_meta['accommodation'] ?? '4-Star Boutique Lodge')); ?>" class="widefat" /></label></p>
                <p><label><strong>Transfers</strong><br><input type="text" name="outbound_hl_meta[transfers]" value="<?php echo outbound_cms_esc_attr((string) ($hl_meta['transfers'] ?? 'Private VFA Airport Transfers')); ?>" class="widefat" /></label></p>
                <p><label><strong>Meals</strong><br><input type="text" name="outbound_hl_meta[meals]" value="<?php echo outbound_cms_esc_attr((string) ($hl_meta['meals'] ?? 'Daily Breakfast & Select Dinners')); ?>" class="widefat" /></label></p>
                <p><label><strong>Countries Visited</strong><br><input type="text" name="outbound_hl_meta[countries]" value="<?php echo outbound_cms_esc_attr((string) ($hl_meta['countries'] ?? 'Zimbabwe')); ?>" class="widefat" /></label></p>
                <p><label><strong>Best For</strong><br><input type="text" name="outbound_hl_meta[bestFor]" value="<?php echo outbound_cms_esc_attr((string) ($hl_meta['bestFor'] ?? $traveller_type)); ?>" class="widefat" /></label></p>
                <p><label><strong>Pace / Difficulty</strong><br><input type="text" name="outbound_hl_meta[difficulty]" value="<?php echo outbound_cms_esc_attr((string) ($hl_meta['difficulty'] ?? 'Relaxed Pace')); ?>" class="widefat" /></label></p>
                <p><label><strong>Recommended Season</strong><br><input type="text" name="outbound_hl_meta[season]" value="<?php echo outbound_cms_esc_attr((string) ($hl_meta['season'] ?? 'Year-Round')); ?>" class="widefat" /></label></p>
            </div>
            <hr />
            <?php
            outbound_editor_render_string_repeater('outbound_who_perfect', 'Perfect For You If...', (array) ($who_for['perfectIf'] ?? array()), '+ Add Reason');
            outbound_editor_render_string_repeater('outbound_who_consider', 'Consider Alternatives If...', (array) ($who_for['considerOthersIf'] ?? array()), '+ Add Note');
            outbound_editor_render_string_repeater('outbound_list_highlights', 'Key Package Highlights', $highlights, '+ Add Highlight');
            outbound_editor_render_string_repeater('outbound_list_inclusions', 'What Is Included', $included, '+ Add Inclusion');
            outbound_editor_render_string_repeater('outbound_list_exclusions', 'What Is Not Included', $excluded, '+ Add Exclusion');
            ?>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>Day-by-Day Visual Itinerary (<?php echo count($detailed_days); ?> days)</summary>
        <div class="outbound-editor-section-body">
            <?php
            $day_rows = !empty($detailed_days) ? array_values($detailed_days) : array(array('day' => 'Day 1', 'title' => '', 'morning' => '', 'afternoon' => '', 'evening' => '', 'included' => array(), 'optionalUpgrade' => '', 'travelNotes' => '', 'image' => ''));
            ?>
            <div class="outbound-repeater-list" data-repeater-prefix="outbound_pkg_days[">
                <?php foreach ($day_rows as $didx => $drow) :
                    if (!is_array($drow)) { continue; }
                    $d_inc = is_array($drow['included'] ?? null) ? $drow['included'] : array();
                ?>
                    <div class="outbound-repeater-row outbound-repeater-card">
                        <div class="outbound-repeater-card-head">
                            <strong><?php echo outbound_cms_esc_html(((string) ($drow['day'] ?? 'Day ' . ($didx + 1))) . ' — ' . ((string) ($drow['title'] ?? 'Itinerary Day'))); ?></strong>
                            <div class="outbound-row-controls">
                                <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                                <button type="button" class="button button-small outbound-row-down">&darr;</button>
                                <button type="button" class="button button-small outbound-row-duplicate">Duplicate</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Day Label<br><input type="text" name="outbound_pkg_days[<?php echo (int) $didx; ?>][day]" value="<?php echo outbound_cms_esc_attr((string) ($drow['day'] ?? ('Day ' . ($didx + 1)))); ?>" class="widefat" placeholder="Day 1" /></label></p>
                            <p><label>Day Title<br><input type="text" name="outbound_pkg_days[<?php echo (int) $didx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($drow['title'] ?? '')); ?>" class="widefat" placeholder="Arrival & Zambezi Sunset Cruise" /></label></p>
                        </div>
                        <p><label>Morning Schedule<br><textarea rows="2" name="outbound_pkg_days[<?php echo (int) $didx; ?>][morning]" class="large-text"><?php echo outbound_cms_esc_html((string) ($drow['morning'] ?? '')); ?></textarea></label></p>
                        <p><label>Afternoon Schedule<br><textarea rows="2" name="outbound_pkg_days[<?php echo (int) $didx; ?>][afternoon]" class="large-text"><?php echo outbound_cms_esc_html((string) ($drow['afternoon'] ?? '')); ?></textarea></label></p>
                        <p><label>Evening Schedule<br><textarea rows="2" name="outbound_pkg_days[<?php echo (int) $didx; ?>][evening]" class="large-text"><?php echo outbound_cms_esc_html((string) ($drow['evening'] ?? '')); ?></textarea></label></p>
                        <div class="outbound-meta-grid">
                            <p><label>Day Inclusions (one per line)<br><textarea rows="2" name="outbound_pkg_days[<?php echo (int) $didx; ?>][included_text]" class="widefat"><?php echo outbound_cms_esc_html(implode("\n", array_map('strval', $d_inc))); ?></textarea></label></p>
                            <p><label>Optional Upgrade<br><input type="text" name="outbound_pkg_days[<?php echo (int) $didx; ?>][optionalUpgrade]" value="<?php echo outbound_cms_esc_attr((string) ($drow['optionalUpgrade'] ?? '')); ?>" class="widefat" /></label></p>
                            <p><label>Specialist Travel Notes<br><input type="text" name="outbound_pkg_days[<?php echo (int) $didx; ?>][travelNotes]" value="<?php echo outbound_cms_esc_attr((string) ($drow['travelNotes'] ?? '')); ?>" class="widefat" /></label></p>
                        </div>
                        <?php outbound_editor_render_media_field('outbound_pkg_days[' . $didx . '][image]', (string) ($drow['image'] ?? ''), 'pkg_day_img_' . $didx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button button-secondary outbound-row-add">+ Add Itinerary Day</button>
        </div>
    </details>

    <details class="outbound-editor-section">
        <summary>Recommended Stays (<?php echo count($hotels); ?> stays) &amp; Route Map (<?php echo count($route_map); ?> stops)</summary>
        <div class="outbound-editor-section-body">
            <?php
            $hotel_rows = !empty($hotels) ? array_values($hotels) : array(array('id' => 'stay-1', 'name' => '', 'type' => 'Boutique Lodge', 'rating' => 4.8, 'description' => '', 'imageUrl' => '', 'location' => 'Victoria Falls', 'facilities' => array(), 'upgradeOptions' => ''));
            ?>
            <label class="outbound-field-label">Recommended Properties Included / Compatible</label>
            <div class="outbound-repeater-list" data-repeater-prefix="outbound_pkg_hotels[">
                <?php foreach ($hotel_rows as $hidx => $hrow) :
                    if (!is_array($hrow)) { continue; }
                    $h_facs = is_array($hrow['facilities'] ?? null) ? $hrow['facilities'] : array();
                ?>
                    <div class="outbound-repeater-row outbound-repeater-card">
                        <div class="outbound-repeater-card-head">
                            <strong>Stay #<?php echo (int) ($hidx + 1); ?>: <?php echo outbound_cms_esc_html((string) ($hrow['name'] ?? 'Property')); ?></strong>
                            <div class="outbound-row-controls">
                                <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                                <button type="button" class="button button-small outbound-row-down">&darr;</button>
                                <button type="button" class="button button-small outbound-row-duplicate">Duplicate</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <input type="hidden" name="outbound_pkg_hotels[<?php echo (int) $hidx; ?>][id]" value="<?php echo outbound_cms_esc_attr((string) ($hrow['id'] ?? ('stay-' . ($hidx + 1)))); ?>" />
                            <p><label>Property Name<br><input type="text" name="outbound_pkg_hotels[<?php echo (int) $hidx; ?>][name]" value="<?php echo outbound_cms_esc_attr((string) ($hrow['name'] ?? '')); ?>" class="widefat" /></label></p>
                            <p><label>Style / Type<br><input type="text" name="outbound_pkg_hotels[<?php echo (int) $hidx; ?>][type]" value="<?php echo outbound_cms_esc_attr((string) ($hrow['type'] ?? 'Boutique Lodge')); ?>" class="widefat" /></label></p>
                            <p><label>Rating<br><input type="text" name="outbound_pkg_hotels[<?php echo (int) $hidx; ?>][rating]" value="<?php echo outbound_cms_esc_attr((string) ($hrow['rating'] ?? '4.8')); ?>" style="width:90px;" /></label></p>
                            <p><label>Area<br><input type="text" name="outbound_pkg_hotels[<?php echo (int) $hidx; ?>][location]" value="<?php echo outbound_cms_esc_attr((string) ($hrow['location'] ?? '')); ?>" class="widefat" /></label></p>
                        </div>
                        <p><label>Description<br><textarea rows="2" name="outbound_pkg_hotels[<?php echo (int) $hidx; ?>][description]" class="large-text"><?php echo outbound_cms_esc_html((string) ($hrow['description'] ?? '')); ?></textarea></label></p>
                        <div class="outbound-meta-grid">
                            <p><label>Key Facilities (comma-separated)<br><input type="text" name="outbound_pkg_hotels[<?php echo (int) $hidx; ?>][facilities_csv]" value="<?php echo outbound_cms_esc_attr(implode(', ', array_map('strval', $h_facs))); ?>" class="widefat" /></label></p>
                            <p><label>Upgrade Options<br><input type="text" name="outbound_pkg_hotels[<?php echo (int) $hidx; ?>][upgradeOptions]" value="<?php echo outbound_cms_esc_attr((string) ($hrow['upgradeOptions'] ?? '')); ?>" class="widefat" /></label></p>
                        </div>
                        <?php outbound_editor_render_media_field('outbound_pkg_hotels[' . $hidx . '][imageUrl]', (string) ($hrow['imageUrl'] ?? ''), 'pkg_hotel_img_' . $hidx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button button-secondary outbound-row-add">+ Add Recommended Stay</button>

            <hr style="margin:18px 0;" />
            <?php
            $route_rows = !empty($route_map) ? array_values($route_map) : array(array('step' => 1, 'title' => 'Arrival at VFA Airport', 'location' => 'Victoria Falls Airport', 'description' => 'Meet & greet with private transfer.'));
            ?>
            <label class="outbound-field-label">Route Map Journey Stops</label>
            <div class="outbound-repeater-list" data-repeater-prefix="outbound_pkg_route[">
                <?php foreach ($route_rows as $ridx => $rrow) :
                    if (!is_array($rrow)) { continue; }
                ?>
                    <div class="outbound-repeater-row outbound-repeater-card">
                        <div class="outbound-repeater-card-head">
                            <strong>Stop #<?php echo (int) ($ridx + 1); ?></strong>
                            <div class="outbound-row-controls">
                                <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                                <button type="button" class="button button-small outbound-row-down">&darr;</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Stop #<br><input type="number" min="1" name="outbound_pkg_route[<?php echo (int) $ridx; ?>][step]" value="<?php echo (int) ($rrow['step'] ?? ($ridx + 1)); ?>" style="width:90px;" /></label></p>
                            <p><label>Title<br><input type="text" name="outbound_pkg_route[<?php echo (int) $ridx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($rrow['title'] ?? '')); ?>" class="widefat" /></label></p>
                            <p><label>Location<br><input type="text" name="outbound_pkg_route[<?php echo (int) $ridx; ?>][location]" value="<?php echo outbound_cms_esc_attr((string) ($rrow['location'] ?? '')); ?>" class="widefat" /></label></p>
                            <p><label>Description<br><input type="text" name="outbound_pkg_route[<?php echo (int) $ridx; ?>][description]" value="<?php echo outbound_cms_esc_attr((string) ($rrow['description'] ?? '')); ?>" class="widefat" /></label></p>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button button-secondary outbound-row-add">+ Add Route Stop</button>

            <hr style="margin:18px 0;" />
            <p><label><strong>Pricing Basis Note</strong><br><input type="text" name="outbound_pricing[basis]" value="<?php echo outbound_cms_esc_attr((string) ($pricing_det['basis'] ?? 'Per person based on two adults sharing a twin/double room.')); ?>" class="large-text" /></label></p>
            <?php
            outbound_editor_render_string_repeater('outbound_pricing_assumptions', 'Pricing Assumptions', (array) ($pricing_det['assumptions'] ?? array('Two guests travelling together sharing accommodation')), '+ Add Assumption');
            outbound_editor_render_string_repeater('outbound_pricing_factors', 'Factors Affecting Final Rate', (array) ($pricing_det['factorsAffecting'] ?? array('Travel season dates', 'Accommodation tier choice')), '+ Add Factor');
            ?>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>Package Photo Gallery (<?php echo count($gallery); ?> photos)</summary>
        <div class="outbound-editor-section-body">
            <?php outbound_editor_render_gallery_editor('outbound_gallery_items', 'Package Gallery Images', $gallery, $in_cms_hub ? '#pkg_hero_img_input' : '', false); ?>
        </div>
    </details>

    <details class="outbound-editor-section">
        <summary>Included Experiences, Related Packages &amp; FAQs</summary>
        <div class="outbound-editor-section-body">
            <?php
            outbound_editor_render_related_selector('outbound_included_experiences', 'Experiences Featured in This Package', 'experience', $inc_exps);
            outbound_editor_render_related_selector('outbound_related_ids', 'Similar Holiday Packages', 'package', $rel_pkgs, (string) $post->post_name);
            outbound_editor_render_faqs_repeater('outbound_faqs', 'Package Frequently Asked Questions', $faqs, 'question', 'answer', false);
            ?>
        </div>
    </details>
    <?php
    if ($in_cms_hub) {
        outbound_editor_render_seo_block($post_id, (array) ($base['seo'] ?? array()), false);
    }
}

/**
 * PLANNING GUIDE / ARTICLE EDITOR (Author, Dates, Quick Facts, Visual Chapters + Content Blocks, FAQs, Related).
 */
function outbound_editor_render_guide_fields(WP_Post $post, bool $in_cms_hub = false): void {
    $post_id = (int) $post->ID;
    $base    = $post_id > 0 ? outbound_editor_load_effective_record($post_id, 'guide_article') : array();

    $hero_url = $post_id > 0 ? (string) get_post_meta($post_id, '_outbound_hero_image_url', true) : '';
    if ($hero_url === '' && $post_id > 0 && function_exists('outbound_resolve_wp_post_image')) {
        $hero_url = outbound_resolve_wp_post_image($post_id, (string) ($base['heroImageUrl'] ?? ''), 'hero');
    } elseif ($hero_url === '') {
        $hero_url = (string) ($base['heroImageUrl'] ?? '');
    }

    if ($in_cms_hub) {
        outbound_editor_render_cms_core_fields($post, 'guide_article', $hero_url, 'guide_hero_img_input', 'Short Intro Summary (Excerpt)', 'Full Guide Intro / Legacy Body (chapters below drive rich layout)');
    }

    $subtitle     = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_subtitle', true) : '') ?: (string) ($base['subtitle'] ?? '');
    $cat_label    = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_category_label', true) : '') ?: (string) ($base['category'] ?? 'Victoria Falls Travel Guides');
    $read_time    = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_reading_time', true) : '') ?: (string) ($base['readingTime'] ?? '6 min read');
    $pub_date     = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_published_date', true) : '') ?: (string) ($base['publishedDate'] ?? gmdate('Y-m-d'));
    $upd_date     = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_updated_date', true) : '') ?: (string) ($base['lastUpdatedDate'] ?? gmdate('Y-m-d'));
    $location     = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_location', true) : '') ?: (string) ($base['location'] ?? 'Victoria Falls, Zimbabwe');
    $hero_alt     = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_hero_alt', true) : '') ?: (string) ($base['heroImageAlt'] ?? (string) $post->post_title);
    $hero_credit  = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_hero_credit', true) : '') ?: (string) ($base['heroImageCredit'] ?? '');

    $author       = outbound_editor_get_json_meta($post_id, '_outbound_author_json', (array) ($base['author'] ?? array()));
    $quick_facts  = outbound_editor_get_json_meta($post_id, '_outbound_quick_facts_json', (array) ($base['quickFacts'] ?? array()));
    $sections     = outbound_editor_get_json_meta($post_id, '_outbound_sections_json', (array) ($base['sections'] ?? array()));
    $faqs         = outbound_editor_get_json_meta($post_id, '_outbound_faqs_json', (array) ($base['faqs'] ?? array()));
    $rel_guides   = outbound_editor_get_json_meta($post_id, '_outbound_related_guides_json', (array) ($base['relatedGuides'] ?? array()));

    $rel_slugs = array();
    foreach ($rel_guides as $rg) {
        if (is_array($rg) && !empty($rg['slug'])) {
            $rel_slugs[] = (string) $rg['slug'];
        } elseif (is_string($rg) && $rg !== '') {
            $rel_slugs[] = $rg;
        }
    }

    $guide_cats = array(
        'Victoria Falls Travel Guides',
        'Things to Do',
        'Accommodation',
        'Family Holidays',
        'Travel Tips',
        'Local Experiences',
        'Travel News',
        'Planning & Seasons',
        'Visa & Entry',
        'Costs & Budgets',
    );
    $icon_choices = array('Sun', 'Calendar', 'Clock', 'MapPin', 'Wallet', 'ShieldCheck', 'Users', 'Compass', 'Plane', 'Sparkles');
    $block_types  = array(
        'text'           => 'Paragraph Text',
        'heading'        => 'Subheading (H3)',
        'bullet_list'    => 'Bullet Point List',
        'image'          => 'Embedded Photo + Caption',
        'callout'        => 'Specialist Callout Box',
        'pullquote'      => 'Editorial Pull Quote',
        'table'          => 'Comparison Table',
        'practical_info' => 'Practical Info Panel',
        'timeline'       => 'Itinerary Timeline Block',
        'pricing_cards'  => 'Pricing Comparison Cards',
    );
    ?>
    <details class="outbound-editor-section" open>
        <summary>Article Metadata, Author &amp; Hero Image Credits</summary>
        <div class="outbound-editor-section-body">
            <p><label><strong>Editorial Subtitle</strong><br><input type="text" name="outbound_meta[_outbound_subtitle]" value="<?php echo outbound_cms_esc_attr($subtitle); ?>" class="large-text" /></label></p>
            <div class="outbound-meta-grid">
                <p><label><strong>Category</strong><br>
                    <select name="outbound_meta[_outbound_category_label]" class="widefat">
                        <?php foreach ($guide_cats as $gc) : ?>
                            <option value="<?php echo outbound_cms_esc_attr($gc); ?>" <?php selected($cat_label, $gc); ?>><?php echo outbound_cms_esc_html($gc); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label></p>
                <p><label><strong>Reading Time</strong><br><input type="text" name="outbound_meta[_outbound_reading_time]" value="<?php echo outbound_cms_esc_attr($read_time); ?>" class="widefat" placeholder="6 min read" /></label></p>
                <p><label><strong>Published Date</strong><br><input type="text" name="outbound_meta[_outbound_published_date]" value="<?php echo outbound_cms_esc_attr($pub_date); ?>" class="widefat" placeholder="2026-03-10" /></label></p>
                <p><label><strong>Last Updated Date</strong><br><input type="text" name="outbound_meta[_outbound_updated_date]" value="<?php echo outbound_cms_esc_attr($upd_date); ?>" class="widefat" placeholder="2026-04-01" /></label></p>
                <p><label><strong>Location Focus</strong><br><input type="text" name="outbound_meta[_outbound_location]" value="<?php echo outbound_cms_esc_attr($location); ?>" class="widefat" /></label></p>
                <p><label><strong>Hero Image Alt Text</strong><br><input type="text" name="outbound_meta[_outbound_hero_alt]" value="<?php echo outbound_cms_esc_attr($hero_alt); ?>" class="widefat" /></label></p>
                <p><label><strong>Hero Photo Credit (optional)</strong><br><input type="text" name="outbound_meta[_outbound_hero_credit]" value="<?php echo outbound_cms_esc_attr($hero_credit); ?>" class="widefat" /></label></p>
            </div>
            <hr />
            <div class="outbound-meta-grid">
                <p><label><strong>Author Name</strong><br><input type="text" name="outbound_author[name]" value="<?php echo outbound_cms_esc_attr((string) ($author['name'] ?? 'Outbound Holidays Local Desk')); ?>" class="widefat" /></label></p>
                <p><label><strong>Author Role</strong><br><input type="text" name="outbound_author[role]" value="<?php echo outbound_cms_esc_attr((string) ($author['role'] ?? 'Victoria Falls Travel Specialist')); ?>" class="widefat" /></label></p>
            </div>
            <p><label><strong>Author Bio (optional)</strong><br><textarea rows="2" name="outbound_author[bio]" class="large-text"><?php echo outbound_cms_esc_html((string) ($author['bio'] ?? '')); ?></textarea></label></p>
            <?php outbound_editor_render_media_field('outbound_author[avatarUrl]', (string) ($author['avatarUrl'] ?? '/logo.png'), 'guide_author_avatar'); ?>
        </div>
    </details>

    <details class="outbound-editor-section">
        <summary>Quick Facts Strip (<?php echo count($quick_facts); ?> facts)</summary>
        <div class="outbound-editor-section-body">
            <?php
            $qf_rows = !empty($quick_facts) ? array_values($quick_facts) : array(array('label' => '', 'value' => '', 'subtext' => '', 'iconName' => 'Sun'));
            ?>
            <div class="outbound-repeater-list" data-repeater-prefix="outbound_quick_facts[">
                <?php foreach ($qf_rows as $qidx => $qf) :
                    if (!is_array($qf)) { continue; }
                ?>
                    <div class="outbound-repeater-row outbound-repeater-card">
                        <div class="outbound-repeater-card-head">
                            <strong>Quick Fact #<?php echo (int) ($qidx + 1); ?></strong>
                            <div class="outbound-row-controls">
                                <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                                <button type="button" class="button button-small outbound-row-down">&darr;</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Label<br><input type="text" name="outbound_quick_facts[<?php echo (int) $qidx; ?>][label]" value="<?php echo outbound_cms_esc_attr((string) ($qf['label'] ?? '')); ?>" class="widefat" placeholder="Best Time to Visit" /></label></p>
                            <p><label>Highlight Value<br><input type="text" name="outbound_quick_facts[<?php echo (int) $qidx; ?>][value]" value="<?php echo outbound_cms_esc_attr((string) ($qf['value'] ?? '')); ?>" class="widefat" placeholder="May – August" /></label></p>
                            <p><label>Subtext<br><input type="text" name="outbound_quick_facts[<?php echo (int) $qidx; ?>][subtext]" value="<?php echo outbound_cms_esc_attr((string) ($qf['subtext'] ?? '')); ?>" class="widefat" /></label></p>
                            <p><label>Icon<br>
                                <select name="outbound_quick_facts[<?php echo (int) $qidx; ?>][iconName]" class="widefat">
                                    <?php foreach ($icon_choices as $ic) : ?>
                                        <option value="<?php echo outbound_cms_esc_attr($ic); ?>" <?php selected((string) ($qf['iconName'] ?? 'Sun'), $ic); ?>><?php echo outbound_cms_esc_html($ic); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </label></p>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button button-secondary outbound-row-add">+ Add Quick Fact</button>
        </div>
    </details>

    <details class="outbound-editor-section" open>
        <summary>Visual Chapters &amp; Structured Content Blocks (<?php echo count($sections); ?> chapters)</summary>
        <div class="outbound-editor-section-body">
            <p class="description">Build structured H2 chapters containing paragraphs, H3 headings, images, bullet lists, callouts, quotes, tables, timelines, or pricing cards &mdash; no manual JSON required.</p>
            <?php
            $ch_rows = !empty($sections) ? array_values($sections) : array(array('id' => 'chapter-1', 'tocTitle' => 'Overview', 'heading' => '', 'blocks' => array(array('type' => 'text', 'content' => ''))));
            ?>
            <div class="outbound-repeater-list" data-repeater-prefix="outbound_guide_chapters[">
                <?php foreach ($ch_rows as $cidx => $chap) :
                    if (!is_array($chap)) { continue; }
                    $blocks = !empty($chap['blocks']) && is_array($chap['blocks']) ? array_values($chap['blocks']) : array(array('type' => 'text', 'content' => ''));
                    $sub_prefix = 'outbound_guide_chapters[' . $cidx . '][blocks][';
                ?>
                    <div class="outbound-repeater-row outbound-repeater-card outbound-chapter-card">
                        <div class="outbound-repeater-card-head">
                            <strong>Chapter #<?php echo (int) ($cidx + 1); ?>: <?php echo outbound_cms_esc_html((string) ($chap['heading'] ?: ($chap['tocTitle'] ?? 'New Chapter'))); ?></strong>
                            <div class="outbound-row-controls">
                                <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                                <button type="button" class="button button-small outbound-row-down">&darr;</button>
                                <button type="button" class="button button-small outbound-row-duplicate">Duplicate Chapter</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove Chapter</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Chapter ID (Anchor)<br><input type="text" name="outbound_guide_chapters[<?php echo (int) $cidx; ?>][id]" value="<?php echo outbound_cms_esc_attr((string) ($chap['id'] ?? ('chapter-' . ($cidx + 1)))); ?>" class="widefat code" /></label></p>
                            <p><label>Table of Contents Label<br><input type="text" name="outbound_guide_chapters[<?php echo (int) $cidx; ?>][tocTitle]" value="<?php echo outbound_cms_esc_attr((string) ($chap['tocTitle'] ?? '')); ?>" class="widefat" /></label></p>
                            <p><label>Chapter Heading (H2)<br><input type="text" name="outbound_guide_chapters[<?php echo (int) $cidx; ?>][heading]" value="<?php echo outbound_cms_esc_attr((string) ($chap['heading'] ?? '')); ?>" class="widefat" /></label></p>
                        </div>

                        <div class="outbound-nested-blocks-wrap">
                            <label class="outbound-field-label">Chapter Content Blocks</label>
                            <div class="outbound-repeater-list outbound-subrepeater-list" data-repeater-prefix="<?php echo outbound_cms_esc_attr($sub_prefix); ?>">
                                <?php foreach ($blocks as $bidx => $blk) :
                                    if (!is_array($blk)) { continue; }
                                    $btype   = (string) ($blk['type'] ?? 'text');
                                    $bname   = 'outbound_guide_chapters[' . $cidx . '][blocks][' . $bidx . ']';
                                    $co      = is_array($blk['callout'] ?? null) ? $blk['callout'] : array();
                                    $pq      = is_array($blk['pullQuote'] ?? null) ? $blk['pullQuote'] : array();
                                    $list_it = is_array($blk['items'] ?? null) ? $blk['items'] : array();
                                    $is_complex = in_array($btype, array('table', 'practical_info', 'timeline', 'pricing_cards'), true);
                                ?>
                                    <div class="outbound-repeater-row outbound-block-card">
                                        <div class="outbound-repeater-card-head">
                                            <div style="display:flex;align-items:center;gap:8px;">
                                                <strong>Block #<?php echo (int) ($bidx + 1); ?></strong>
                                                <select name="<?php echo outbound_cms_esc_attr($bname . '[type]'); ?>" class="outbound-block-type-select">
                                                    <?php foreach ($block_types as $bt_k => $bt_l) : ?>
                                                        <option value="<?php echo outbound_cms_esc_attr($bt_k); ?>" <?php selected($btype, $bt_k); ?>><?php echo outbound_cms_esc_html($bt_l); ?></option>
                                                    <?php endforeach; ?>
                                                </select>
                                            </div>
                                            <div class="outbound-row-controls">
                                                <button type="button" class="button button-small outbound-row-up">&uarr;</button>
                                                <button type="button" class="button button-small outbound-row-down">&darr;</button>
                                                <button type="button" class="button-link-delete outbound-row-remove">Remove Block</button>
                                            </div>
                                        </div>

                                        <div class="outbound-block-pane" data-show-for="text" <?php echo $btype !== 'text' ? 'style="display:none;"' : ''; ?>>
                                            <textarea rows="3" name="<?php echo outbound_cms_esc_attr($bname . '[content]'); ?>" class="large-text" placeholder="Write paragraph copy..."><?php echo outbound_cms_esc_html((string) ($blk['content'] ?? '')); ?></textarea>
                                        </div>

                                        <div class="outbound-block-pane" data-show-for="heading" <?php echo $btype !== 'heading' ? 'style="display:none;"' : ''; ?>>
                                            <div class="outbound-meta-grid">
                                                <p><label>Subheading Text<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[subheading]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($blk['subheading'] ?? '')); ?>" class="widefat" /></label></p>
                                                <p><label>Level<br><select name="<?php echo outbound_cms_esc_attr($bname . '[headingLevel]'); ?>"><option value="h3" <?php selected((string) ($blk['headingLevel'] ?? 'h3'), 'h3'); ?>>H3</option><option value="h2" <?php selected((string) ($blk['headingLevel'] ?? ''), 'h2'); ?>>H2</option></select></label></p>
                                            </div>
                                        </div>

                                        <div class="outbound-block-pane" data-show-for="bullet_list" <?php echo $btype !== 'bullet_list' ? 'style="display:none;"' : ''; ?>>
                                            <label>Bullet Points (one item per line)<br><textarea rows="3" name="<?php echo outbound_cms_esc_attr($bname . '[items_text]'); ?>" class="large-text"><?php echo outbound_cms_esc_html(implode("\n", array_map('strval', $list_it))); ?></textarea></label>
                                        </div>

                                        <div class="outbound-block-pane" data-show-for="image" <?php echo $btype !== 'image' ? 'style="display:none;"' : ''; ?>>
                                            <?php outbound_editor_render_media_field($bname . '[imageUrl]', (string) ($blk['imageUrl'] ?? ''), 'blk_img_' . $cidx . '_' . $bidx); ?>
                                            <div class="outbound-meta-grid">
                                                <p><label>Alt Text<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[imageAlt]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($blk['imageAlt'] ?? '')); ?>" class="widefat" /></label></p>
                                                <p><label>Caption<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[imageCaption]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($blk['imageCaption'] ?? '')); ?>" class="widefat" /></label></p>
                                                <p><label>Photo Credit<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[imageCredit]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($blk['imageCredit'] ?? '')); ?>" class="widefat" /></label></p>
                                            </div>
                                        </div>

                                        <div class="outbound-block-pane" data-show-for="callout" <?php echo $btype !== 'callout' ? 'style="display:none;"' : ''; ?>>
                                            <div class="outbound-meta-grid">
                                                <p><label>Callout Style<br><select name="<?php echo outbound_cms_esc_attr($bname . '[callout][type]'); ?>"><option value="advice" <?php selected((string) ($co['type'] ?? 'advice'), 'advice'); ?>>Local Advice</option><option value="insight" <?php selected((string) ($co['type'] ?? ''), 'insight'); ?>>Editorial Insight</option><option value="recommendation" <?php selected((string) ($co['type'] ?? ''), 'recommendation'); ?>>Recommendation</option></select></label></p>
                                                <p><label>Callout Title<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[callout][title]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($co['title'] ?? '')); ?>" class="widefat" /></label></p>
                                            </div>
                                            <p><label>Callout Body<br><textarea rows="2" name="<?php echo outbound_cms_esc_attr($bname . '[callout][content]'); ?>" class="large-text"><?php echo outbound_cms_esc_html((string) ($co['content'] ?? '')); ?></textarea></label></p>
                                        </div>

                                        <div class="outbound-block-pane" data-show-for="pullquote" <?php echo $btype !== 'pullquote' ? 'style="display:none;"' : ''; ?>>
                                            <p><label>Quote Text<br><textarea rows="2" name="<?php echo outbound_cms_esc_attr($bname . '[pullQuote][quote]'); ?>" class="large-text"><?php echo outbound_cms_esc_html((string) ($pq['quote'] ?? '')); ?></textarea></label></p>
                                            <div class="outbound-meta-grid">
                                                <p><label>Quoted Author<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[pullQuote][author]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($pq['author'] ?? '')); ?>" class="widefat" /></label></p>
                                                <p><label>Author Title (optional)<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[pullQuote][title]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($pq['title'] ?? '')); ?>" class="widefat" /></label></p>
                                            </div>
                                        </div>

                                        <div class="outbound-block-pane" data-show-for="table practical_info timeline pricing_cards" <?php echo !$is_complex ? 'style="display:none;"' : ''; ?>>
                                            <?php
                                            $structured_payload = array();
                                            if ($btype === 'table' && isset($blk['table'])) { $structured_payload['table'] = $blk['table']; }
                                            elseif ($btype === 'practical_info' && isset($blk['practicalPanel'])) { $structured_payload['practicalPanel'] = $blk['practicalPanel']; }
                                            elseif ($btype === 'timeline' && isset($blk['timeline'])) { $structured_payload['timeline'] = $blk['timeline']; }
                                            elseif ($btype === 'pricing_cards' && isset($blk['pricingCards'])) { $structured_payload['pricingCards'] = $blk['pricingCards']; }
                                            if ($btype === 'table') :
                                                $tbl = is_array($blk['table'] ?? null) ? $blk['table'] : array('title' => '', 'headers' => array('Season', 'Water Level', 'Experience'), 'rows' => array(array('', '', '')));
                                            ?>
                                                <p><label>Table Title (optional)<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[table_title]'); ?>" value="<?php echo outbound_cms_esc_attr((string) ($tbl['title'] ?? '')); ?>" class="widefat" /></label></p>
                                                <p><label>Headers (comma-separated)<br><input type="text" name="<?php echo outbound_cms_esc_attr($bname . '[table_headers]'); ?>" value="<?php echo outbound_cms_esc_attr(implode(' | ', array_map('strval', (array) ($tbl['headers'] ?? array())))); ?>" class="large-text" placeholder="Column 1 | Column 2 | Column 3" /></label></p>
                                                <p><label>Rows (one row per line, columns separated by <code>|</code>)<br><textarea rows="3" name="<?php echo outbound_cms_esc_attr($bname . '[table_rows]'); ?>" class="large-text"><?php
                                                    $lines = array();
                                                    foreach ((array) ($tbl['rows'] ?? array()) as $tr) {
                                                        if (is_array($tr)) { $lines[] = implode(' | ', array_map('strval', $tr)); }
                                                    }
                                                    echo outbound_cms_esc_html(implode("\n", $lines));
                                                ?></textarea></label></p>
                                            <?php endif; ?>
                                            <input type="hidden" name="<?php echo outbound_cms_esc_attr($bname . '[preserved_complex_json]'); ?>" value="<?php echo outbound_cms_esc_attr((string) wp_json_encode($structured_payload)); ?>" />
                                            <?php if ($btype !== 'table') : ?>
                                                <p class="description">Structured <strong><?php echo outbound_cms_esc_html($btype); ?></strong> block preserved intact for the frontend template.</p>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                            <button type="button" class="button button-small outbound-row-add">+ Add Content Block to Chapter</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button button-secondary outbound-row-add">+ Add New Chapter (H2)</button>
        </div>
    </details>

    <details class="outbound-editor-section">
        <summary>FAQs &amp; Related Guides (<?php echo count($faqs); ?> FAQs)</summary>
        <div class="outbound-editor-section-body">
            <?php
            outbound_editor_render_faqs_repeater('outbound_faqs', 'Guide Frequently Asked Questions', $faqs, 'question', 'answer', true);
            outbound_editor_render_related_selector('outbound_related_guides_slugs', 'Related Travel Guides', 'guide_article', $rel_slugs, (string) $post->post_name);
            ?>
        </div>
    </details>
    <?php
    if ($in_cms_hub) {
        outbound_editor_render_seo_block($post_id, (array) ($base['seo'] ?? array()), false);
    }
}

/**
 * CLIENT ALBUM EDITOR (Metadata + Rich Photo Cards with Alt, Caption, Cover/Role & Reorder).
 */
function outbound_editor_render_album_fields(WP_Post $post, bool $in_cms_hub = false): void {
    $post_id = (int) $post->ID;
    $base    = $post_id > 0 ? outbound_editor_load_effective_record($post_id, 'client_album') : array();

    $hero_url = $post_id > 0 ? (string) get_post_meta($post_id, '_outbound_hero_image_url', true) : '';
    if ($hero_url === '' && !empty($base['images'][0]['url'])) {
        $hero_url = (string) $base['images'][0]['url'];
    }

    if ($in_cms_hub) {
        outbound_editor_render_cms_core_fields($post, 'client_album', $hero_url, 'album_hero_img_input', 'Album Caption / Short Highlight', '');
    }

    $season   = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_season', true) : '');
    $subtitle = (string) ($post_id > 0 ? get_post_meta($post_id, '_outbound_subtitle', true) : '');
    $featured = $post_id > 0 ? (bool) get_post_meta($post_id, '_outbound_featured', true) : !empty($base['featured']);
    $images   = outbound_editor_get_json_meta($post_id, '_outbound_gallery_json', (array) ($base['images'] ?? array()));
    ?>
    <details class="outbound-editor-section" open>
        <summary>Album Metadata &amp; Photo Gallery (<?php echo count($images); ?> photos)</summary>
        <div class="outbound-editor-section-body">
            <div class="outbound-meta-grid">
                <p><label><strong>Trip Date / Season</strong><br><input type="text" name="outbound_meta[_outbound_season]" value="<?php echo outbound_cms_esc_attr($season); ?>" class="widefat" placeholder="2026 Safari Guests" /></label></p>
                <p><label><strong>Album Highlight Line</strong><br><input type="text" name="outbound_meta[_outbound_subtitle]" value="<?php echo outbound_cms_esc_attr($subtitle); ?>" class="widefat" /></label></p>
            </div>
            <p><label><input type="checkbox" name="outbound_meta[_outbound_featured]" value="1" <?php checked($featured, true); ?> /> <strong>Show on Homepage &amp; Client Gallery Showcase</strong></label></p>
            <?php outbound_editor_render_gallery_editor('outbound_gallery_items', 'Client Gallery Photos (reorder, replace, caption, or remove)', $images, $in_cms_hub ? '#album_hero_img_input' : '', true); ?>
        </div>
    </details>
    <?php
}

/**
 * Normalize & persist all visual repeater and structured postmeta fields from POST array.
 * Called identically by meta-boxes.php (save_post) AND cms-hub.php (inline individual item editor).
 *
 * @param array<string, mixed> $input
 */
function outbound_save_structured_item_meta(int $post_id, string $post_type, array $input): void {
    // 1. Scalar meta fields
    if (isset($input['outbound_meta']) && is_array($input['outbound_meta'])) {
        update_post_meta($post_id, '_outbound_featured', !empty($input['outbound_meta']['_outbound_featured']) ? '1' : '0');
        foreach ($input['outbound_meta'] as $key => $raw_val) {
            $safe_key = sanitize_key((string) $key);
            if (!str_starts_with($safe_key, '_outbound_') || $safe_key === '_outbound_featured') {
                continue;
            }
            if (str_ends_with($safe_key, '_json')) {
                update_post_meta($post_id, $safe_key, (string) $raw_val);
            } elseif (str_ends_with($safe_key, '_canonical')) {
                update_post_meta($post_id, $safe_key, outbound_cms_sanitize_url((string) $raw_val));
            } elseif (in_array($safe_key, array('_outbound_why_recommend', '_outbound_expert_tip', '_outbound_story_intro', '_outbound_why_chose_stay', '_outbound_seo_description'), true)) {
                update_post_meta($post_id, $safe_key, outbound_cms_sanitize_textarea((string) $raw_val));
            } else {
                update_post_meta($post_id, $safe_key, outbound_cms_sanitize_text((string) $raw_val));
            }
        }
    }

    // Hero image URL override
    if (isset($input['outbound_hero_image_url'])) {
        update_post_meta($post_id, '_outbound_hero_image_url', outbound_cms_sanitize_url((string) $input['outbound_hero_image_url']));
    }

    // SEO Keywords CSV
    if (isset($input['outbound_seo_keywords_csv'])) {
        $kw = array_values(array_filter(array_map('outbound_cms_sanitize_text', explode(',', (string) $input['outbound_seo_keywords_csv']))));
        update_post_meta($post_id, '_outbound_seo_keywords_json', wp_json_encode($kw));
    }

    // 2. Taxonomy & Multi-checkbox fields
    if ($post_type === 'experience' && isset($input['outbound_tax_exp_cats']) && is_array($input['outbound_tax_exp_cats']) && function_exists('wp_set_object_terms')) {
        $cats = array_values(array_map('sanitize_title', $input['outbound_tax_exp_cats']));
        wp_set_object_terms($post_id, $cats, 'experience_category', false);
    }
    if ($post_type === 'accommodation') {
        $amenities = isset($input['outbound_amenities']) && is_array($input['outbound_amenities'])
            ? array_values(array_map('sanitize_title', $input['outbound_amenities']))
            : array();
        update_post_meta($post_id, '_outbound_amenities_json', wp_json_encode($amenities));

        $ftags = isset($input['outbound_filter_tags']) && is_array($input['outbound_filter_tags'])
            ? array_values(array_map('sanitize_title', $input['outbound_filter_tags']))
            : array();
        update_post_meta($post_id, '_outbound_filter_tags_json', wp_json_encode($ftags));

        if (!empty($input['outbound_meta']['_outbound_category_id']) && function_exists('wp_set_object_terms')) {
            wp_set_object_terms($post_id, array(sanitize_title((string) $input['outbound_meta']['_outbound_category_id'])), 'accommodation_category', false);
        }
    }
    if ($post_type === 'package') {
        $pcats = isset($input['outbound_pkg_categories']) && is_array($input['outbound_pkg_categories'])
            ? array_values(array_map('sanitize_title', $input['outbound_pkg_categories']))
            : array();
        update_post_meta($post_id, '_outbound_categories_json', wp_json_encode($pcats));
    }

    // 3. String list repeaters
    $clean_list = static function ($arr): array {
        if (!is_array($arr)) { return array(); }
        return array_values(array_filter(array_map(static fn($v) => outbound_cms_sanitize_text((string) $v), $arr), static fn($v) => $v !== ''));
    };

    $list_map = array(
        'outbound_list_highlights'   => '_outbound_highlights_json',
        'outbound_list_inclusions'   => '_outbound_inclusions_json',
        'outbound_list_exclusions'   => '_outbound_exclusions_json',
        'outbound_list_good_to_know' => '_outbound_good_to_know_json',
    );
    foreach ($list_map as $post_k => $meta_k) {
        if (isset($input[$post_k])) {
            update_post_meta($post_id, $meta_k, wp_json_encode($clean_list($input[$post_k])));
        }
    }

    // 4. Visual Gallery (strings for experience/accommodation/package, rich objects for client_album)
    if (isset($input['outbound_gallery_items']) && is_array($input['outbound_gallery_items'])) {
        $gal_out = array();
        foreach ($input['outbound_gallery_items'] as $gidx => $gitem) {
            if (is_string($gitem)) {
                $u = outbound_cms_sanitize_url($gitem);
                if ($u !== '') { $gal_out[] = $u; }
                continue;
            }
            if (!is_array($gitem)) { continue; }
            $u = outbound_cms_sanitize_url((string) ($gitem['url'] ?? ''));
            if ($u === '') { continue; }
            if ($post_type === 'client_album') {
                $gal_out[] = array(
                    'id'           => sanitize_title((string) ($gitem['id'] ?? '')) ?: ('img-' . ($gidx + 1)),
                    'url'          => $u,
                    'alt'          => outbound_cms_sanitize_text((string) ($gitem['alt'] ?? '')),
                    'caption'      => outbound_cms_sanitize_text((string) ($gitem['caption'] ?? '')) ?: null,
                    'displayOrder' => count($gal_out) + 1,
                    'role'         => in_array((string) ($gitem['role'] ?? 'gallery'), array('hero', 'gallery'), true) ? (string) $gitem['role'] : 'gallery',
                );
            } else {
                $gal_out[] = $u;
            }
        }
        update_post_meta($post_id, '_outbound_gallery_json', wp_json_encode($gal_out));
    }

    // 5. Experience Steps
    if (isset($input['outbound_steps']) && is_array($input['outbound_steps'])) {
        $steps_out = array();
        foreach ($input['outbound_steps'] as $srow) {
            if (!is_array($srow)) { continue; }
            $title = outbound_cms_sanitize_text((string) ($srow['title'] ?? ''));
            $desc  = outbound_cms_sanitize_textarea((string) ($srow['description'] ?? ''));
            if ($title === '' && $desc === '') { continue; }
            $step = array(
                'stepNumber'  => max(1, (int) ($srow['stepNumber'] ?? (count($steps_out) + 1))),
                'title'       => $title ?: ('Step ' . (count($steps_out) + 1)),
                'description' => $desc,
            );
            $time = outbound_cms_sanitize_text((string) ($srow['time'] ?? ''));
            if ($time !== '') { $step['time'] = $time; }
            $hl = outbound_cms_sanitize_text((string) ($srow['highlight'] ?? ''));
            if ($hl !== '') { $step['highlight'] = $hl; }
            $img = outbound_cms_sanitize_url((string) ($srow['image'] ?? ''));
            if ($img !== '') { $step['image'] = $img; }
            $steps_out[] = $step;
        }
        update_post_meta($post_id, '_outbound_steps_json', wp_json_encode($steps_out));
    }

    // 6. Accommodation Repeaters (At-a-Glance, Rooms, Facilities, Location Info)
    if (isset($input['outbound_at_glance']) && is_array($input['outbound_at_glance'])) {
        $ag = array();
        foreach (array('type', 'starRating', 'bestFor', 'distanceFromFalls', 'pool', 'restaurant', 'wifi', 'familyFriendly', 'transfers', 'roomTypesSummary') as $gk) {
            $ag[$gk] = outbound_cms_sanitize_text((string) ($input['outbound_at_glance'][$gk] ?? ''));
        }
        update_post_meta($post_id, '_outbound_at_a_glance_json', wp_json_encode($ag));
    }
    if (isset($input['outbound_rooms']) && is_array($input['outbound_rooms'])) {
        $rooms_out = array();
        foreach ($input['outbound_rooms'] as $rrow) {
            if (!is_array($rrow)) { continue; }
            $rname = outbound_cms_sanitize_text((string) ($rrow['name'] ?? ''));
            if ($rname === '') { continue; }
            $ft_lines = preg_split('/\r\n|\r|\n/', (string) ($rrow['features_text'] ?? '')) ?: array();
            $rooms_out[] = array(
                'name'        => $rname,
                'occupancy'   => outbound_cms_sanitize_text((string) ($rrow['occupancy'] ?? '2 Guests')),
                'description' => outbound_cms_sanitize_textarea((string) ($rrow['description'] ?? '')),
                'imageUrl'    => outbound_cms_sanitize_url((string) ($rrow['imageUrl'] ?? '')),
                'features'    => array_values(array_filter(array_map('outbound_cms_sanitize_text', $ft_lines))),
            );
        }
        update_post_meta($post_id, '_outbound_room_types_json', wp_json_encode($rooms_out));
    }
    if (isset($input['outbound_facilities']) && is_array($input['outbound_facilities'])) {
        $fac_out = array();
        foreach ($input['outbound_facilities'] as $frow) {
            if (!is_array($frow)) { continue; }
            $fn = outbound_cms_sanitize_text((string) ($frow['name'] ?? ''));
            if ($fn === '') { continue; }
            $fac_out[] = array(
                'name'     => $fn,
                'category' => outbound_cms_sanitize_text((string) ($frow['category'] ?? 'Property')) ?: 'Property',
            );
        }
        update_post_meta($post_id, '_outbound_facilities_json', wp_json_encode($fac_out));
    }
    if (isset($input['outbound_loc_info']) && is_array($input['outbound_loc_info'])) {
        $loc_info = array(
            'address'           => outbound_cms_sanitize_text((string) ($input['outbound_loc_info']['address'] ?? '')),
            'distanceToFalls'   => outbound_cms_sanitize_text((string) ($input['outbound_loc_info']['distanceToFalls'] ?? '')),
            'distanceToAirport' => outbound_cms_sanitize_text((string) ($input['outbound_loc_info']['distanceToAirport'] ?? '')),
            'nearbyAttractions' => $clean_list($input['outbound_loc_attractions'] ?? array()),
            'nearbyRestaurants' => $clean_list($input['outbound_loc_restaurants'] ?? array()),
            'departurePoints'   => outbound_cms_sanitize_text((string) ($input['outbound_loc_info']['departurePoints'] ?? '')),
        );
        update_post_meta($post_id, '_outbound_location_info_json', wp_json_encode($loc_info));
    }

    // 7. Package Structured Fields (Highlights Meta, Who-is-this-for, Days, Hotels, Route, Pricing)
    if (isset($input['outbound_hl_meta']) && is_array($input['outbound_hl_meta'])) {
        $hm = array();
        foreach (array('accommodation', 'transfers', 'meals', 'countries', 'bestFor', 'difficulty', 'season') as $hk) {
            $hm[$hk] = outbound_cms_sanitize_text((string) ($input['outbound_hl_meta'][$hk] ?? ''));
        }
        update_post_meta($post_id, '_outbound_highlights_meta_json', wp_json_encode($hm));
    }
    if ($post_type === 'package' && (isset($input['outbound_who_perfect']) || isset($input['outbound_who_consider']))) {
        $who = array(
            'perfectIf'        => $clean_list($input['outbound_who_perfect'] ?? array()),
            'considerOthersIf' => $clean_list($input['outbound_who_consider'] ?? array()),
        );
        update_post_meta($post_id, '_outbound_who_is_for_json', wp_json_encode($who));
    }
    if (isset($input['outbound_pkg_days']) && is_array($input['outbound_pkg_days'])) {
        $days_det = array();
        $days_sim = array();
        foreach ($input['outbound_pkg_days'] as $didx => $drow) {
            if (!is_array($drow)) { continue; }
            $dlabel = outbound_cms_sanitize_text((string) ($drow['day'] ?? ('Day ' . ($didx + 1))));
            $dtitle = outbound_cms_sanitize_text((string) ($drow['title'] ?? ''));
            $morn   = outbound_cms_sanitize_textarea((string) ($drow['morning'] ?? ''));
            $aft    = outbound_cms_sanitize_textarea((string) ($drow['afternoon'] ?? ''));
            $eve    = outbound_cms_sanitize_textarea((string) ($drow['evening'] ?? ''));
            if ($dtitle === '' && $morn === '' && $aft === '' && $eve === '') { continue; }
            $inc_lines = preg_split('/\r\n|\r|\n/', (string) ($drow['included_text'] ?? '')) ?: array();
            $inc_clean = array_values(array_filter(array_map('outbound_cms_sanitize_text', $inc_lines)));
            $det = array(
                'day'       => $dlabel,
                'title'     => $dtitle ?: $dlabel,
                'morning'   => $morn,
                'afternoon' => $aft,
                'evening'   => $eve,
                'included'  => $inc_clean,
            );
            $upg = outbound_cms_sanitize_text((string) ($drow['optionalUpgrade'] ?? ''));
            if ($upg !== '') { $det['optionalUpgrade'] = $upg; }
            $tn = outbound_cms_sanitize_text((string) ($drow['travelNotes'] ?? ''));
            if ($tn !== '') { $det['travelNotes'] = $tn; }
            $dimg = outbound_cms_sanitize_url((string) ($drow['image'] ?? ''));
            if ($dimg !== '') { $det['image'] = $dimg; }
            $days_det[] = $det;

            $summary_parts = array_filter(array($morn, $aft, $eve));
            $days_sim[] = array(
                'day'         => $dlabel,
                'title'       => $dtitle ?: $dlabel,
                'description' => implode(' ', $summary_parts),
                'highlights'  => $inc_clean,
            );
        }
        update_post_meta($post_id, '_outbound_detailed_itinerary_json', wp_json_encode($days_det));
        update_post_meta($post_id, '_outbound_itinerary_json', wp_json_encode($days_sim));
    }
    if (isset($input['outbound_pkg_hotels']) && is_array($input['outbound_pkg_hotels'])) {
        $h_out = array();
        foreach ($input['outbound_pkg_hotels'] as $hidx => $hrow) {
            if (!is_array($hrow)) { continue; }
            $hname = outbound_cms_sanitize_text((string) ($hrow['name'] ?? ''));
            if ($hname === '') { continue; }
            $hfacs = array_values(array_filter(array_map('outbound_cms_sanitize_text', explode(',', (string) ($hrow['facilities_csv'] ?? '')))));
            $entry = array(
                'id'          => sanitize_title((string) ($hrow['id'] ?? '')) ?: ('stay-' . ($hidx + 1)),
                'name'        => $hname,
                'type'        => outbound_cms_sanitize_text((string) ($hrow['type'] ?? 'Boutique Lodge')),
                'rating'      => max(1, min(5, (float) ($hrow['rating'] ?? 4.8))),
                'description' => outbound_cms_sanitize_textarea((string) ($hrow['description'] ?? '')),
                'imageUrl'    => outbound_cms_sanitize_url((string) ($hrow['imageUrl'] ?? '')),
                'location'    => outbound_cms_sanitize_text((string) ($hrow['location'] ?? 'Victoria Falls')),
                'facilities'  => $hfacs,
            );
            $upg = outbound_cms_sanitize_text((string) ($hrow['upgradeOptions'] ?? ''));
            if ($upg !== '') { $entry['upgradeOptions'] = $upg; }
            $h_out[] = $entry;
        }
        update_post_meta($post_id, '_outbound_recommended_hotels_json', wp_json_encode($h_out));
    }
    if (isset($input['outbound_pkg_route']) && is_array($input['outbound_pkg_route'])) {
        $r_out = array();
        foreach ($input['outbound_pkg_route'] as $rrow) {
            if (!is_array($rrow)) { continue; }
            $rt = outbound_cms_sanitize_text((string) ($rrow['title'] ?? ''));
            if ($rt === '') { continue; }
            $r_out[] = array(
                'step'        => max(1, (int) ($rrow['step'] ?? (count($r_out) + 1))),
                'title'       => $rt,
                'location'    => outbound_cms_sanitize_text((string) ($rrow['location'] ?? '')),
                'description' => outbound_cms_sanitize_textarea((string) ($rrow['description'] ?? '')),
            );
        }
        update_post_meta($post_id, '_outbound_route_map_json', wp_json_encode($r_out));
    }
    if (isset($input['outbound_pricing']) && is_array($input['outbound_pricing'])) {
        $pd = array(
            'basis'            => outbound_cms_sanitize_text((string) ($input['outbound_pricing']['basis'] ?? '')),
            'assumptions'      => $clean_list($input['outbound_pricing_assumptions'] ?? array()),
            'factorsAffecting' => $clean_list($input['outbound_pricing_factors'] ?? array()),
        );
        update_post_meta($post_id, '_outbound_pricing_details_json', wp_json_encode($pd));
    }

    // 8. Guide Author, Quick Facts, Visual Chapters + Content Blocks, Related Guides
    if (isset($input['outbound_author']) && is_array($input['outbound_author'])) {
        $au = array(
            'name'      => outbound_cms_sanitize_text((string) ($input['outbound_author']['name'] ?? 'Outbound Holidays')),
            'role'      => outbound_cms_sanitize_text((string) ($input['outbound_author']['role'] ?? 'Travel Specialist')),
            'avatarUrl' => outbound_cms_sanitize_url((string) ($input['outbound_author']['avatarUrl'] ?? '')),
        );
        $bio = outbound_cms_sanitize_textarea((string) ($input['outbound_author']['bio'] ?? ''));
        if ($bio !== '') { $au['bio'] = $bio; }
        update_post_meta($post_id, '_outbound_author_json', wp_json_encode($au));
    }
    if (isset($input['outbound_quick_facts']) && is_array($input['outbound_quick_facts'])) {
        $qf_out = array();
        foreach ($input['outbound_quick_facts'] as $qrow) {
            if (!is_array($qrow)) { continue; }
            $ql = outbound_cms_sanitize_text((string) ($qrow['label'] ?? ''));
            $qv = outbound_cms_sanitize_text((string) ($qrow['value'] ?? ''));
            if ($ql === '' && $qv === '') { continue; }
            $fact = array(
                'label'    => $ql,
                'value'    => $qv,
                'iconName' => outbound_cms_sanitize_text((string) ($qrow['iconName'] ?? 'Sun')) ?: 'Sun',
            );
            $qs = outbound_cms_sanitize_text((string) ($qrow['subtext'] ?? ''));
            if ($qs !== '') { $fact['subtext'] = $qs; }
            $qf_out[] = $fact;
        }
        update_post_meta($post_id, '_outbound_quick_facts_json', wp_json_encode($qf_out));
    }
    if (isset($input['outbound_guide_chapters']) && is_array($input['outbound_guide_chapters'])) {
        $chap_out = array();
        foreach ($input['outbound_guide_chapters'] as $cidx => $crow) {
            if (!is_array($crow)) { continue; }
            $heading = outbound_cms_sanitize_text((string) ($crow['heading'] ?? ''));
            $toc     = outbound_cms_sanitize_text((string) ($crow['tocTitle'] ?? '')) ?: $heading;
            $cid     = sanitize_title((string) ($crow['id'] ?? $toc)) ?: ('chapter-' . ($cidx + 1));
            $blocks_out = array();
            if (!empty($crow['blocks']) && is_array($crow['blocks'])) {
                foreach ($crow['blocks'] as $brow) {
                    if (!is_array($brow)) { continue; }
                    $bt = outbound_cms_sanitize_text((string) ($brow['type'] ?? 'text'));
                    if ($bt === 'text') {
                        $txt = outbound_cms_sanitize_textarea((string) ($brow['content'] ?? ''));
                        if ($txt !== '') { $blocks_out[] = array('type' => 'text', 'content' => $txt); }
                    } elseif ($bt === 'heading') {
                        $sub = outbound_cms_sanitize_text((string) ($brow['subheading'] ?? ''));
                        if ($sub !== '') {
                            $blocks_out[] = array(
                                'type'         => 'heading',
                                'subheading'   => $sub,
                                'headingLevel' => in_array((string) ($brow['headingLevel'] ?? 'h3'), array('h2', 'h3'), true) ? (string) $brow['headingLevel'] : 'h3',
                            );
                        }
                    } elseif ($bt === 'bullet_list') {
                        $lines = preg_split('/\r\n|\r|\n/', (string) ($brow['items_text'] ?? '')) ?: array();
                        $items = array_values(array_filter(array_map('outbound_cms_sanitize_text', $lines)));
                        if (!empty($items)) { $blocks_out[] = array('type' => 'bullet_list', 'items' => $items); }
                    } elseif ($bt === 'image') {
                        $iu = outbound_cms_sanitize_url((string) ($brow['imageUrl'] ?? ''));
                        if ($iu !== '') {
                            $iblk = array('type' => 'image', 'imageUrl' => $iu, 'imageAlt' => outbound_cms_sanitize_text((string) ($brow['imageAlt'] ?? '')));
                            $cap = outbound_cms_sanitize_text((string) ($brow['imageCaption'] ?? ''));
                            if ($cap !== '') { $iblk['imageCaption'] = $cap; }
                            $crd = outbound_cms_sanitize_text((string) ($brow['imageCredit'] ?? ''));
                            if ($crd !== '') { $iblk['imageCredit'] = $crd; }
                            $blocks_out[] = $iblk;
                        }
                    } elseif ($bt === 'callout') {
                        $co = is_array($brow['callout'] ?? null) ? $brow['callout'] : array();
                        $cc = outbound_cms_sanitize_textarea((string) ($co['content'] ?? ''));
                        if ($cc !== '') {
                            $blocks_out[] = array(
                                'type'    => 'callout',
                                'callout' => array(
                                    'type'    => in_array((string) ($co['type'] ?? 'advice'), array('advice', 'insight', 'recommendation'), true) ? (string) $co['type'] : 'advice',
                                    'title'   => outbound_cms_sanitize_text((string) ($co['title'] ?? 'Local Specialist Note')),
                                    'content' => $cc,
                                ),
                            );
                        }
                    } elseif ($bt === 'pullquote') {
                        $pq = is_array($brow['pullQuote'] ?? null) ? $brow['pullQuote'] : array();
                        $qt = outbound_cms_sanitize_textarea((string) ($pq['quote'] ?? ''));
                        if ($qt !== '') {
                            $pqo = array('quote' => $qt, 'author' => outbound_cms_sanitize_text((string) ($pq['author'] ?? 'Outbound Specialist')));
                            $pqt = outbound_cms_sanitize_text((string) ($pq['title'] ?? ''));
                            if ($pqt !== '') { $pqo['title'] = $pqt; }
                            $blocks_out[] = array('type' => 'pullquote', 'pullQuote' => $pqo);
                        }
                    } elseif ($bt === 'table') {
                        $headers = array_values(array_filter(array_map('outbound_cms_sanitize_text', explode('|', (string) ($brow['table_headers'] ?? '')))));
                        $rows_raw = preg_split('/\r\n|\r|\n/', (string) ($brow['table_rows'] ?? '')) ?: array();
                        $trows = array();
                        foreach ($rows_raw as $rl) {
                            $rl = trim($rl);
                            if ($rl === '') { continue; }
                            $trows[] = array_map('outbound_cms_sanitize_text', explode('|', $rl));
                        }
                        if (!empty($headers) || !empty($trows)) {
                            $tbl = array('headers' => $headers, 'rows' => $trows);
                            $ttitle = outbound_cms_sanitize_text((string) ($brow['table_title'] ?? ''));
                            if ($ttitle !== '') { $tbl['title'] = $ttitle; }
                            $blocks_out[] = array('type' => 'table', 'table' => $tbl);
                        }
                    } elseif (in_array($bt, array('practical_info', 'timeline', 'pricing_cards'), true)) {
                        $pres = json_decode((string) ($brow['preserved_complex_json'] ?? ''), true);
                        if (is_array($pres) && !empty($pres)) {
                            $blocks_out[] = array_merge(array('type' => $bt), $pres);
                        }
                    }
                }
            }
            if ($heading !== '' || !empty($blocks_out)) {
                $chap_out[] = array(
                    'id'       => $cid,
                    'tocTitle' => $toc ?: $heading,
                    'heading'  => $heading ?: $toc,
                    'blocks'   => $blocks_out,
                );
            }
        }
        update_post_meta($post_id, '_outbound_sections_json', wp_json_encode($chap_out));
    }

    // 9. FAQs & Related References
    if (isset($input['outbound_faqs']) && is_array($input['outbound_faqs'])) {
        $faqs_out = array();
        $q_key = $post_type === 'experience' ? 'q' : 'question';
        $a_key = $post_type === 'experience' ? 'a' : 'answer';
        foreach ($input['outbound_faqs'] as $frow) {
            if (!is_array($frow)) { continue; }
            $q = outbound_cms_sanitize_text((string) ($frow[$q_key] ?? ($frow['q'] ?? ($frow['question'] ?? ''))));
            $a = outbound_cms_sanitize_textarea((string) ($frow[$a_key] ?? ($frow['a'] ?? ($frow['answer'] ?? ''))));
            if ($q === '' || $a === '') { continue; }
            $item = array($q_key => $q, $a_key => $a);
            if ($post_type === 'guide_article') {
                $cat = outbound_cms_sanitize_text((string) ($frow['category'] ?? ''));
                if ($cat !== '') { $item['category'] = $cat; }
            }
            $faqs_out[] = $item;
        }
        update_post_meta($post_id, '_outbound_faqs_json', wp_json_encode($faqs_out));
    }

    if ($post_type === 'accommodation' && isset($input['outbound_nearby_experiences'])) {
        update_post_meta($post_id, '_outbound_nearby_experiences_json', wp_json_encode($clean_list($input['outbound_nearby_experiences'])));
    } elseif ($post_type === 'accommodation') {
        update_post_meta($post_id, '_outbound_nearby_experiences_json', wp_json_encode(array()));
    }
    if ($post_type === 'package' && isset($input['outbound_included_experiences'])) {
        update_post_meta($post_id, '_outbound_included_experiences_json', wp_json_encode($clean_list($input['outbound_included_experiences'])));
    } elseif ($post_type === 'package') {
        update_post_meta($post_id, '_outbound_included_experiences_json', wp_json_encode(array()));
    }
    if (in_array($post_type, array('experience', 'accommodation', 'package'), true)) {
        $rel = isset($input['outbound_related_ids']) ? $clean_list($input['outbound_related_ids']) : array();
        update_post_meta($post_id, '_outbound_related_ids_json', wp_json_encode($rel));
    }
    if ($post_type === 'guide_article') {
        $rel_slugs = isset($input['outbound_related_guides_slugs']) ? $clean_list($input['outbound_related_guides_slugs']) : array();
        update_post_meta($post_id, '_outbound_related_guides_json', wp_json_encode($rel_slugs));
    }
}

/**
 * Save or create a single CPT record directly from Outbound CMS Hub (Draft or Publish).
 *
 * @param array<string, mixed> $input Unslashed POST array.
 * @return array{post_id: int, status: string, error?: string}
 */
function outbound_cms_save_item_record(string $post_type, int $post_id, string $target_status, array $input): array {
    $allowed_types = array('experience', 'accommodation', 'package', 'guide_article', 'client_album', 'post');
    if (!in_array($post_type, $allowed_types, true)) {
        return array('post_id' => $post_id, 'status' => 'error', 'error' => 'Unsupported post type.');
    }

    $post_data = isset($input['outbound_post']) && is_array($input['outbound_post']) ? $input['outbound_post'] : array();
    $title     = outbound_cms_sanitize_text((string) ($post_data['post_title'] ?? ''));
    if ($title === '') {
        $title = 'Untitled ' . ucwords(str_replace('_', ' ', $post_type));
    }
    $slug       = sanitize_title((string) ($post_data['post_name'] ?? '')) ?: sanitize_title($title);
    $menu_order = (int) ($post_data['menu_order'] ?? 0);
    $excerpt    = outbound_cms_sanitize_textarea((string) ($post_data['post_excerpt'] ?? ''));
    $content    = outbound_cms_sanitize_textarea((string) ($post_data['post_content'] ?? ''));
    $status     = $target_status === 'publish' ? 'publish' : 'draft';

    $postarr = array(
        'post_type'    => $post_type,
        'post_title'   => $title,
        'post_name'    => $slug,
        'post_status'  => $status,
        'post_excerpt' => $excerpt,
        'post_content' => $content,
        'menu_order'   => $menu_order,
    );

    if ($post_id > 0) {
        $postarr['ID'] = $post_id;
        $res_id = wp_update_post($postarr, true);
    } else {
        $res_id = wp_insert_post($postarr, true);
    }

    if (is_wp_error($res_id) || !$res_id) {
        $err_msg = is_wp_error($res_id) ? $res_id->get_error_message() : 'Failed to save record.';
        return array('post_id' => $post_id, 'status' => 'error', 'error' => $err_msg);
    }

    $saved_id = (int) $res_id;
    outbound_save_structured_item_meta($saved_id, $post_type, $input);

    // Sync post category if chosen via guide/post category label
    if ($post_type === 'post' && !empty($input['outbound_meta']['_outbound_category_label']) && function_exists('wp_set_object_terms')) {
        $cat_name = sanitize_text_field((string) $input['outbound_meta']['_outbound_category_label']);
        $cat_term = get_term_by('name', $cat_name, 'category');
        if ($cat_term && !is_wp_error($cat_term)) {
            wp_set_object_terms($saved_id, array((int) $cat_term->term_id), 'category');
        } else {
            $cat_slug = sanitize_title($cat_name);
            $cat_term_slug = get_term_by('slug', $cat_slug, 'category');
            if ($cat_term_slug && !is_wp_error($cat_term_slug)) {
                wp_set_object_terms($saved_id, array((int) $cat_term_slug->term_id), 'category');
            }
        }
    }

    // Sync featured attachment ID when the hero URL belongs to the local Media Library.
    $hero_url = outbound_cms_sanitize_url((string) ($input['outbound_hero_image_url'] ?? ''));
    if ($hero_url !== '' && function_exists('attachment_url_to_postid')) {
        $att_id = (int) attachment_url_to_postid($hero_url);
        if ($att_id > 0 && function_exists('set_post_thumbnail')) {
            set_post_thumbnail($saved_id, $att_id);
        }
    }

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }

    return array('post_id' => $saved_id, 'status' => $status);
}

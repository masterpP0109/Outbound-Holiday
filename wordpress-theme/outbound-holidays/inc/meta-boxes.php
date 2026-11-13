<?php
/**
 * Native WordPress Meta Boxes for Outbound Holidays CPTs and Posts.
 * Delegates visual repeaters and persistence to inc/item-editors.php so both
 * Outbound CMS Studio and native WordPress post screens behave identically.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register meta boxes across all custom post types and standard posts/pages.
 */
function outbound_register_meta_boxes(): void {
    add_meta_box(
        'outbound_accommodation_details',
        __('Accommodation Details, At-a-Glance, Rooms & Gallery', 'outbound-holidays'),
        'outbound_render_accommodation_meta_box',
        'accommodation',
        'normal',
        'high'
    );

    add_meta_box(
        'outbound_experience_details',
        __('Experience Details, Timeline Steps, Gallery & FAQs', 'outbound-holidays'),
        'outbound_render_experience_meta_box',
        'experience',
        'normal',
        'high'
    );

    add_meta_box(
        'outbound_package_details',
        __('Holiday Package Itinerary, Recommended Stays & Pricing', 'outbound-holidays'),
        'outbound_render_package_meta_box',
        'package',
        'normal',
        'high'
    );

    add_meta_box(
        'outbound_guide_details',
        __('Planning Guide Author, Quick Facts, Visual Chapters & FAQs', 'outbound-holidays'),
        'outbound_render_guide_meta_box',
        'guide_article',
        'normal',
        'high'
    );

    add_meta_box(
        'outbound_client_album_details',
        __('Client Gallery Album Metadata & Photos', 'outbound-holidays'),
        'outbound_render_client_album_meta_box',
        'client_album',
        'normal',
        'high'
    );

    add_meta_box(
        'outbound_seo_override',
        __('Outbound SEO Metadata & Reading Time', 'outbound-holidays'),
        'outbound_render_seo_meta_box',
        array('post', 'page', 'accommodation', 'experience', 'package', 'guide_article'),
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'outbound_register_meta_boxes');

function outbound_render_accommodation_meta_box(WP_Post $post): void {
    wp_nonce_field('outbound_save_cpt_meta', 'outbound_cpt_meta_nonce');
    outbound_editor_render_accommodation_fields($post, false);
}

function outbound_render_experience_meta_box(WP_Post $post): void {
    wp_nonce_field('outbound_save_cpt_meta', 'outbound_cpt_meta_nonce');
    outbound_editor_render_experience_fields($post, false);
}

function outbound_render_package_meta_box(WP_Post $post): void {
    wp_nonce_field('outbound_save_cpt_meta', 'outbound_cpt_meta_nonce');
    outbound_editor_render_package_fields($post, false);
}

function outbound_render_guide_meta_box(WP_Post $post): void {
    wp_nonce_field('outbound_save_cpt_meta', 'outbound_cpt_meta_nonce');
    outbound_editor_render_guide_fields($post, false);
}

function outbound_render_client_album_meta_box(WP_Post $post): void {
    wp_nonce_field('outbound_save_cpt_meta', 'outbound_cpt_meta_nonce');
    outbound_editor_render_album_fields($post, false);
}

function outbound_render_seo_meta_box(WP_Post $post): void {
    wp_nonce_field('outbound_save_cpt_meta', 'outbound_cpt_meta_nonce');
    $meta_title = (string) get_post_meta($post->ID, '_outbound_seo_title', true);
    $meta_desc  = (string) get_post_meta($post->ID, '_outbound_seo_description', true);
    $canonical  = (string) get_post_meta($post->ID, '_outbound_seo_canonical', true);
    $read_min   = (string) get_post_meta($post->ID, '_outbound_reading_time', true);
    $keywords   = outbound_editor_get_json_meta($post->ID, '_outbound_seo_keywords_json', array());
    ?>
    <p><label><strong><?php esc_html_e('Custom Meta Title', 'outbound-holidays'); ?></strong></label><br>
        <input type="text" name="outbound_meta[_outbound_seo_title]" value="<?php echo esc_attr($meta_title); ?>" class="widefat">
    </p>
    <p><label><strong><?php esc_html_e('Custom Meta Description', 'outbound-holidays'); ?></strong></label><br>
        <textarea name="outbound_meta[_outbound_seo_description]" rows="3" class="widefat"><?php echo esc_textarea($meta_desc); ?></textarea>
    </p>
    <p><label><strong><?php esc_html_e('Canonical URL (leave blank for permalink)', 'outbound-holidays'); ?></strong></label><br>
        <input type="url" name="outbound_meta[_outbound_seo_canonical]" value="<?php echo esc_attr($canonical); ?>" class="widefat">
    </p>
    <p><label><strong><?php esc_html_e('Focus Keywords (comma-separated)', 'outbound-holidays'); ?></strong></label><br>
        <input type="text" name="outbound_seo_keywords_csv" value="<?php echo esc_attr(implode(', ', array_map('strval', $keywords))); ?>" class="widefat">
    </p>
    <p><label><strong><?php esc_html_e('Reading Time (e.g. 6 min read)', 'outbound-holidays'); ?></strong></label><br>
        <input type="text" name="outbound_meta[_outbound_reading_time]" value="<?php echo esc_attr($read_min); ?>" class="widefat">
    </p>
    <?php
}

/**
 * Persist CPT structured meta safely on native WordPress save_post.
 */
function outbound_save_cpt_meta(int $post_id): void {
    if (!isset($_POST['outbound_cpt_meta_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['outbound_cpt_meta_nonce'])), 'outbound_save_cpt_meta')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $post_type = (string) get_post_type($post_id);
    $unslashed = wp_unslash($_POST);
    outbound_save_structured_item_meta($post_id, $post_type, is_array($unslashed) ? $unslashed : array());

    if (function_exists('outbound_invalidate_snapshot_cache')) {
        outbound_invalidate_snapshot_cache();
    }
}
add_action('save_post', 'outbound_save_cpt_meta');

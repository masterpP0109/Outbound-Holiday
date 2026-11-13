<?php
/**
 * Custom Post Types, Taxonomies, URL Rewrites & Automatic Core Page Provisioning.
 * Zero dependency on CPT UI, ACF, or any third-party plugin.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register all travel domain CPTs and taxonomies with URL structures matching SEO.md.
 */
function outbound_register_post_types_and_taxonomies(): void {
    // 1. Accommodation (Where to Stay) -> /accommodation/{slug}/ (matches src/routes.ts accommodationPath)
    register_post_type('accommodation', array(
        'labels' => array(
            'name'          => __('Accommodations', 'outbound-holidays'),
            'singular_name' => __('Accommodation', 'outbound-holidays'),
            'add_new_item'  => __('Add Accommodation Property', 'outbound-holidays'),
            'edit_item'     => __('Edit Accommodation Property', 'outbound-holidays'),
            'menu_name'     => __('Accommodations', 'outbound-holidays'),
        ),
        'public'        => true,
        'show_in_rest'  => true,
        'has_archive'   => false, // Rendered cleanly by Page `/victoria-falls-accommodation`.
        'rewrite'       => array('slug' => 'accommodation', 'with_front' => false),
        'menu_icon'     => 'dashicons-building',
        'menu_position' => 21,
        'supports'      => array('title', 'editor', 'excerpt', 'thumbnail', 'revisions'),
    ));

    register_taxonomy('accommodation_category', array('accommodation'), array(
        'labels' => array(
            'name'          => __('Stay Categories', 'outbound-holidays'),
            'singular_name' => __('Stay Category', 'outbound-holidays'),
        ),
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite'      => array('slug' => 'stay-category', 'with_front' => false),
    ));

    // 2. Experience (Things to Do) -> /things-to-do/{slug}/ (matches src/routes.ts experiencePath)
    register_post_type('experience', array(
        'labels' => array(
            'name'          => __('Experiences', 'outbound-holidays'),
            'singular_name' => __('Experience', 'outbound-holidays'),
            'add_new_item'  => __('Add Experience / Activity', 'outbound-holidays'),
            'edit_item'     => __('Edit Experience', 'outbound-holidays'),
            'menu_name'     => __('Experiences', 'outbound-holidays'),
        ),
        'public'        => true,
        'show_in_rest'  => true,
        'has_archive'   => false,
        'rewrite'       => array('slug' => 'things-to-do', 'with_front' => false),
        'menu_icon'     => 'dashicons-compass',
        'menu_position' => 22,
        'supports'      => array('title', 'editor', 'excerpt', 'thumbnail', 'revisions'),
    ));

    register_taxonomy('experience_category', array('experience'), array(
        'labels' => array(
            'name'          => __('Experience Categories', 'outbound-holidays'),
            'singular_name' => __('Experience Category', 'outbound-holidays'),
        ),
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite'      => array('slug' => 'things-to-do/category', 'with_front' => false),
    ));

    // 3. Holiday Package -> /packages/{slug}/ (matches src/routes.ts packagePath)
    register_post_type('package', array(
        'labels' => array(
            'name'          => __('Holiday Packages', 'outbound-holidays'),
            'singular_name' => __('Holiday Package', 'outbound-holidays'),
            'add_new_item'  => __('Add Holiday Package', 'outbound-holidays'),
            'edit_item'     => __('Edit Holiday Package', 'outbound-holidays'),
            'menu_name'     => __('Holiday Packages', 'outbound-holidays'),
        ),
        'public'        => true,
        'show_in_rest'  => true,
        'has_archive'   => false,
        'rewrite'       => array('slug' => 'packages', 'with_front' => false),
        'menu_icon'     => 'dashicons-palmtree',
        'menu_position' => 23,
        'supports'      => array('title', 'editor', 'excerpt', 'thumbnail', 'revisions'),
    ));

    // 4. Local Planning Guide Article -> /victoria-falls-guide/{slug}/
    register_post_type('guide_article', array(
        'labels' => array(
            'name'          => __('Planning Guides', 'outbound-holidays'),
            'singular_name' => __('Planning Guide', 'outbound-holidays'),
            'add_new_item'  => __('Add Victoria Falls Guide', 'outbound-holidays'),
            'edit_item'     => __('Edit Planning Guide', 'outbound-holidays'),
            'menu_name'     => __('Planning Guides', 'outbound-holidays'),
        ),
        'public'        => true,
        'show_in_rest'  => true,
        'has_archive'   => false,
        'rewrite'       => array('slug' => 'victoria-falls-guide', 'with_front' => false),
        'menu_icon'     => 'dashicons-book-alt',
        'menu_position' => 24,
        'supports'      => array('title', 'editor', 'excerpt', 'thumbnail', 'revisions'),
    ));

    // 5. Client Gallery Album -> /client-gallery/
    register_post_type('client_album', array(
        'labels' => array(
            'name'          => __('Client Albums', 'outbound-holidays'),
            'singular_name' => __('Client Album', 'outbound-holidays'),
            'add_new_item'  => __('Add Client Photo Album', 'outbound-holidays'),
            'edit_item'     => __('Edit Client Album', 'outbound-holidays'),
            'menu_name'     => __('Client Gallery', 'outbound-holidays'),
        ),
        'public'        => false,
        'show_ui'       => true,
        'show_in_rest'  => true,
        'menu_icon'     => 'dashicons-format-gallery',
        'menu_position' => 25,
        'supports'      => array('title', 'editor', 'thumbnail'),
    ));

    // Support flagship experience aliases and clean newsletter confirmation route (`/newsletter-confirmed` + legacy `/newsletter/confirmed`).
    add_rewrite_rule('^things-to-do/boma-dinner/?$', 'index.php?outbound_virtual_route=spa-shell', 'top');
    add_rewrite_rule('^things-to-do/bungee-jump/?$', 'index.php?outbound_virtual_route=spa-shell', 'top');
    add_rewrite_rule('^the-boma-dinner/?$', 'index.php?experience=the-boma-dinner', 'top');
    add_rewrite_rule('^bungee-jump/?$', 'index.php?experience=bungee-jump', 'top');
    add_rewrite_rule('^newsletter-confirmed/?$', 'index.php?outbound_virtual_route=newsletter-confirmed', 'top');
    add_rewrite_rule('^newsletter/confirmed/?$', 'index.php?outbound_virtual_route=newsletter-confirmed', 'top');
}
add_action('init', 'outbound_register_post_types_and_taxonomies', 10);

add_filter('query_vars', static function (array $vars): array {
    $vars[] = 'outbound_virtual_route';
    return $vars;
});

/**
 * Map clean virtual route `/newsletter/confirmed` or SPA fallback routes cleanly to templates.
 */
add_filter('template_include', static function (string $template): string {
    $virtual = get_query_var('outbound_virtual_route');
    if ($virtual === 'newsletter-confirmed') {
        $custom = OUTBOUND_THEME_DIR . '/page-newsletter-confirmed.php';
        if (file_exists($custom)) {
            return $custom;
        }
    }
    if ($virtual === 'spa-shell') {
        $custom = OUTBOUND_THEME_DIR . '/page.php';
        if (file_exists($custom)) {
            return $custom;
        }
    }
    return $template;
});

/**
 * Provision required core WordPress pages & Blog categories automatically on activation or admin trigger.
 *
 * @return array<string, int>
 */
function outbound_ensure_core_pages(): array {
    $pages_spec = array(
        'home'                         => array('title' => 'Home', 'template' => 'front-page.php'),
        'blog'                         => array('title' => 'Victoria Falls Travel Blog', 'template' => ''),
        'victoria-falls-accommodation' => array('title' => 'Where to Stay in Victoria Falls', 'template' => 'page-victoria-falls-accommodation.php'),
        'things-to-do-in-victoria-falls' => array('title' => 'Things to Do in Victoria Falls', 'template' => 'page-things-to-do-in-victoria-falls.php'),
        'victoria-falls-packages'      => array('title' => 'Victoria Falls Holiday Packages', 'template' => 'page-victoria-falls-packages.php'),
        'victoria-falls-guide'         => array('title' => 'Victoria Falls Planning Guide', 'template' => 'page-victoria-falls-guide.php'),
        'client-gallery'               => array('title' => 'Client Holiday Memories Gallery', 'template' => 'page-client-gallery.php'),
        'about'                        => array('title' => 'About Outbound Holidays', 'template' => 'page-about.php'),
        'contact'                      => array('title' => 'Contact Our Victoria Falls Specialists', 'template' => 'page-contact.php'),
        'newsletter-confirmed'         => array('title' => 'Subscription Preferences', 'template' => 'page-newsletter-confirmed.php'),
    );

    $created_ids = array();
    foreach ($pages_spec as $slug => $meta) {
        $existing = get_page_by_path($slug, OBJECT, 'page');
        if ($existing instanceof WP_Post) {
            $created_ids[$slug] = (int) $existing->ID;
        } else {
            $id = wp_insert_post(array(
                'post_type'    => 'page',
                'post_name'    => $slug,
                'post_title'   => $meta['title'],
                'post_status'  => 'publish',
                'post_content' => '',
            ));
            if ($id && !is_wp_error($id)) {
                if ($meta['template'] !== '' && $slug !== 'home' && $slug !== 'blog') {
                    update_post_meta((int) $id, '_wp_page_template', $meta['template']);
                }
                $created_ids[$slug] = (int) $id;
            }
        }
    }

    // Configure Settings -> Reading automatically if unset or still defaults.
    if (!empty($created_ids['home']) && !empty($created_ids['blog'])) {
        if ((int) get_option('page_on_front') === 0) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', $created_ids['home']);
            update_option('page_for_posts', $created_ids['blog']);
        }
    }

    // Ensure the 7 official Blog categories exist.
    $blog_cats = array(
        'victoria-falls-travel-guides' => 'Victoria Falls Travel Guides',
        'things-to-do'                 => 'Things to Do',
        'accommodation'                => 'Accommodation',
        'family-holidays'              => 'Family Holidays',
        'travel-tips'                  => 'Travel Tips',
        'local-experiences'            => 'Local Experiences',
        'travel-news'                  => 'Travel News',
    );
    foreach ($blog_cats as $cat_slug => $cat_name) {
        if (!term_exists($cat_slug, 'category')) {
            wp_insert_term($cat_name, 'category', array('slug' => $cat_slug));
        }
    }

    // Ensure Accommodation Categories exist.
    foreach (outbound_get_accommodation_category_defs() as $cat_id => $def) {
        if ($cat_id === 'all') {
            continue;
        }
        if (!term_exists($cat_id, 'accommodation_category')) {
            wp_insert_term($def['label'], 'accommodation_category', array(
                'slug'        => $cat_id,
                'description' => $def['description'],
            ));
        }
    }

    // Ensure Experience Categories exist.
    $exp_cats = array(
        'first-visit'       => 'First Time in Victoria Falls',
        'wildlife-safaris'  => 'Wildlife & Safaris',
        'adrenaline'        => 'Adrenaline & Adventure',
        'zambezi-river'     => 'Zambezi River Cruises',
        'cultural-dining'   => 'Cultural & Dining',
        'day-trips'         => 'Chobe & Cross-Border Day Trips',
        'honeymoon-luxury'  => 'Honeymoon & Luxury',
    );
    foreach ($exp_cats as $cat_slug => $cat_name) {
        if (!term_exists($cat_slug, 'experience_category')) {
            wp_insert_term($cat_name, 'experience_category', array('slug' => $cat_slug));
        }
    }

    return $created_ids;
}

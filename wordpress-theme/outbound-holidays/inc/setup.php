<?php
/**
 * Theme setup, asset loading, WordPress block style isolation, navigation menus, and config injection.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Configure core WordPress theme features.
 */
function outbound_theme_setup(): void {
    load_theme_textdomain('outbound-holidays', OUTBOUND_THEME_DIR . '/languages');

    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ));
    add_theme_support('custom-logo', array(
        'height'      => 120,
        'width'       => 360,
        'flex-height' => true,
        'flex-width'  => true,
    ));
    add_theme_support('automatic-feed-links');
    add_theme_support('responsive-embeds');

    add_image_size('outbound-hero', 1600, 900, true);
    add_image_size('outbound-card', 800, 600, true);
    add_image_size('outbound-thumb', 480, 360, true);

    register_nav_menus(array(
        'primary'         => __('Primary Desktop Header', 'outbound-holidays'),
        'footer-explore'  => __('Footer — Explore Menu', 'outbound-holidays'),
        'footer-planning' => __('Footer — Plan Your Visit Menu', 'outbound-holidays'),
    ));
}
add_action('after_setup_theme', 'outbound_theme_setup');

/**
 * Determine canonical SPA route matching the active WordPress query object or URI.
 */
function outbound_resolve_wp_initial_route_path(): string {
    if (function_exists('get_query_var') && get_query_var('outbound_virtual_route') === 'newsletter-confirmed') {
        return '/newsletter-confirmed';
    }
    if (function_exists('is_front_page') && is_front_page()) {
        return '/';
    }
    if (
        (function_exists('is_home') && is_home()) ||
        (function_exists('is_archive') && is_archive()) ||
        (function_exists('is_category') && is_category()) ||
        (function_exists('is_tag') && is_tag()) ||
        (function_exists('is_search') && is_search())
    ) {
        return '/blog';
    }
    if (function_exists('is_tax') && is_tax('experience_category')) {
        $term = get_queried_object();
        if (isset($term->slug)) {
            return '/things-to-do/category/' . $term->slug;
        }
    }
    if (function_exists('is_singular')) {
        $obj = function_exists('get_queried_object') ? get_queried_object() : null;
        $slug = isset($obj->post_name) ? (string) $obj->post_name : '';
        if ($slug !== '') {
            if (is_singular('accommodation')) {
                return '/accommodation/' . $slug;
            }
            if (is_singular('experience')) {
                return '/things-to-do/' . ($slug === 'the-boma-dinner' ? 'boma-dinner' : $slug);
            }
            if (is_singular('package')) {
                return '/packages/' . $slug;
            }
            if (is_singular('guide_article')) {
                return $slug === 'first-time-visitor-guide' ? '/victoria-falls-guide' : '/victoria-falls-guide/' . $slug;
            }
            if (is_singular('post')) {
                return '/blog/' . $slug;
            }
        }
    }
    $path = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
    if ($path === '/newsletter/confirmed' || $path === '/newsletter/confirmed/') {
        return '/newsletter-confirmed';
    }
    if ($path === '/the-boma-dinner' || $path === '/the-boma-dinner/') {
        return '/things-to-do/boma-dinner';
    }
    if ($path === '/bungee-jump' || $path === '/bungee-jump/') {
        return '/things-to-do/bungee-jump';
    }
    $clean = rtrim($path, '/');
    return $clean === '' ? '/' : $clean;
}

/**
 * Build runtime configuration passed cleanly into `window.__OUTBOUND_WP_CONFIG__`.
 *
 * @return array<string, mixed>
 */
function outbound_get_frontend_runtime_config(): array {
    $turnstile  = outbound_get_turnstile_config();
    $site_url   = function_exists('home_url') ? rtrim((string) home_url('/'), '/') : 'https://outboundholiday.com';
    $rest_base  = function_exists('rest_url') ? rtrim((string) rest_url('outbound/v1'), '/') : '/wp-json/outbound/v1';
    $is_preview = function_exists('outbound_is_preview_request') && outbound_is_preview_request();

    $cfg = array(
        'isWordPress'      => true,
        'isPreview'        => $is_preview,
        'cmsAdminUrl'      => function_exists('admin_url') ? (string) admin_url('admin.php?page=outbound-cms') : '',
        'siteUrl'          => $site_url,
        'themeUri'         => defined('OUTBOUND_THEME_URI') ? rtrim((string) OUTBOUND_THEME_URI, '/') : '/wp-content/themes/outbound-holidays',
        'restUrl'          => $rest_base,
        'snapshotUrl'      => $rest_base . '/snapshot' . ($is_preview ? '?outbound_preview=1' : ''),
        'postsUrl'         => $rest_base . '/posts',
        'nonce'            => function_exists('wp_create_nonce') ? wp_create_nonce('wp_rest') : '',
        'heroFallbackUrl'  => outbound_get_media_fallback('hero'),
        'turnstileSiteKey' => $turnstile['siteKey'],
        'initialRoutePath' => outbound_resolve_wp_initial_route_path(),
    );

    if (!empty($GLOBALS['__outbound_nl_result']) && is_array($GLOBALS['__outbound_nl_result'])) {
        $cfg['newsletterResult'] = $GLOBALS['__outbound_nl_result'];
    }

    return $cfg;
}

/**
 * Prevent public/proxy caching on authenticated Admin Draft Preview requests.
 */
function outbound_send_preview_headers(): void {
    if (function_exists('outbound_is_preview_request') && outbound_is_preview_request() && !headers_sent()) {
        if (function_exists('nocache_headers')) {
            nocache_headers();
        }
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, private');
        header('X-Robots-Tag: noindex, nofollow', true);
    }
}
if (function_exists('add_action')) {
    add_action('send_headers', 'outbound_send_preview_headers');
}

/**
 * Prevent WordPress block/global styles from injecting unlayered element typography rules
 * that override Tailwind v4 `@layer utilities` colors (such as white hero headings).
 */
function outbound_disable_frontend_global_styles(): void {
    if (function_exists('is_admin') && is_admin()) {
        return;
    }
    if (function_exists('remove_action')) {
        remove_action('wp_enqueue_scripts', 'wp_enqueue_global_styles');
        remove_action('wp_enqueue_scripts', 'wp_enqueue_global_styles_custom_css');
        remove_action('wp_footer', 'wp_enqueue_global_styles', 1);
        remove_action('wp_footer', 'wp_enqueue_stored_styles');
    }
}
if (function_exists('add_action')) {
    add_action('init', 'outbound_disable_frontend_global_styles', 20);
}

/**
 * Enqueue public stylesheets and approved bundled React application with WordPress core style isolation.
 */
function outbound_enqueue_assets(): void {
    // Isolate frontend design from WordPress core block & global styles that override Tailwind typography/spacing.
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-blocks-style');
    wp_dequeue_style('global-styles');
    wp_dequeue_style('global-styles-css-custom-properties');
    wp_dequeue_style('classic-theme-styles');
    wp_dequeue_style('core-block-supports');

    // Google Fonts matching index.html verbatim (Cormorant Garamond + Manrope).
    wp_enqueue_style(
        'outbound-google-fonts',
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Manrope:wght@400;500;600;700;800&display=swap',
        array(),
        null
    );

    $css_path = OUTBOUND_THEME_DIR . '/assets/app/outbound-app.css';
    $css_ver  = file_exists($css_path) ? (string) filemtime($css_path) : OUTBOUND_THEME_VERSION;
    wp_enqueue_style(
        'outbound-app-style',
        OUTBOUND_THEME_URI . '/assets/app/outbound-app.css',
        array('outbound-google-fonts'),
        $css_ver
    );

    $app_js_path = OUTBOUND_THEME_DIR . '/assets/app/outbound-app.js';
    $app_js_ver  = file_exists($app_js_path) ? (string) filemtime($app_js_path) : OUTBOUND_THEME_VERSION;
    wp_enqueue_script(
        'outbound-app-script',
        OUTBOUND_THEME_URI . '/assets/app/outbound-app.js',
        array(),
        $app_js_ver,
        array(
            'in_footer' => true,
            'strategy'  => 'defer',
        )
    );

    wp_add_inline_script(
        'outbound-app-script',
        'window.__OUTBOUND_WP_CONFIG__ = ' . wp_json_encode(outbound_get_frontend_runtime_config(), JSON_HEX_TAG | JSON_UNESCAPED_SLASHES) . ';',
        'before'
    );

    $turnstile = outbound_get_turnstile_config();
    if (!empty($turnstile['siteKey'])) {
        wp_enqueue_script(
            'cloudflare-turnstile',
            'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
            array(),
            null,
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'outbound_enqueue_assets', 100);

/**
 * Preconnect Google Fonts and preload homepage LCP hero image for faster mobile FCP/LCP.
 */
add_action('wp_head', static function (): void {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
    if (function_exists('is_front_page') && is_front_page() && function_exists('outbound_get_media_fallback')) {
        $hero_url = outbound_get_media_fallback('hero');
        if ($hero_url !== '') {
            echo '<link rel="preload" as="image" href="' . esc_url($hero_url) . '" fetchpriority="high">' . "\n";
        }
    }
}, 1);

/**
 * Load Google Fonts stylesheet asynchronously so first content render is not blocked.
 */
add_filter('style_loader_tag', static function (string $html, string $handle): string {
    if ($handle !== 'outbound-google-fonts') {
        return $html;
    }
    $async = str_replace("media='all'", "media='print' onload=\"this.media='all'\"", $html);
    if ($async === $html) {
        $async = str_replace('media="all"', 'media="print" onload="this.media=\'all\'"', $html);
    }
    return $async . '<noscript>' . $html . '</noscript>';
}, 10, 2);

/**
 * Enqueue WP Admin styles and scripts on Outbound screens and CPT editors.
 */
function outbound_enqueue_admin_assets(string $hook): void {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    $is_outbound_screen = (
        str_contains($hook, 'outbound') ||
        ($screen && in_array($screen->post_type, array('accommodation', 'experience', 'package', 'guide_article', 'client_album', 'post'), true))
    );

    if (!$is_outbound_screen) {
        return;
    }

    wp_enqueue_media();

    $admin_css = OUTBOUND_THEME_DIR . '/assets/css/admin-outbound.css';
    wp_enqueue_style(
        'outbound-admin-css',
        OUTBOUND_THEME_URI . '/assets/css/admin-outbound.css',
        array(),
        file_exists($admin_css) ? (string) filemtime($admin_css) : OUTBOUND_THEME_VERSION
    );

    $admin_js = OUTBOUND_THEME_DIR . '/assets/js/admin-meta.js';
    wp_enqueue_script(
        'outbound-admin-js',
        OUTBOUND_THEME_URI . '/assets/js/admin-meta.js',
        array('jquery'),
        file_exists($admin_js) ? (string) filemtime($admin_js) : OUTBOUND_THEME_VERSION,
        true
    );

    if (str_contains($hook, 'outbound-newsletter') || ($screen && str_contains((string) $screen->id, 'outbound-newsletter'))) {
        $newsletter_js = OUTBOUND_THEME_DIR . '/assets/js/admin-newsletter.js';
        wp_enqueue_script(
            'outbound-admin-newsletter-js',
            OUTBOUND_THEME_URI . '/assets/js/admin-newsletter.js',
            array('jquery'),
            file_exists($newsletter_js) ? (string) filemtime($newsletter_js) : OUTBOUND_THEME_VERSION,
            true
        );
    }
}
add_action('admin_enqueue_scripts', 'outbound_enqueue_admin_assets');

/**
 * Flush rewrite rules and ensure DB schema/pages exist on theme activation.
 */
function outbound_on_theme_switch(): void {
    outbound_maybe_install_schema(true);
    outbound_register_post_types_and_taxonomies();
    outbound_ensure_core_pages();
    if (function_exists('outbound_ensure_newsletter_cron_scheduled')) {
        outbound_ensure_newsletter_cron_scheduled();
    }
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'outbound_on_theme_switch');

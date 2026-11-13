<?php
/**
 * Local WordPress Theme Render Harness for Side-by-Side Chromium Verification.
 * Serves rendered WordPress PHP templates (`front-page.php`, `page-victoria-falls-accommodation.php`,
 * `home.php`, `single.php`, `page-contact.php`, etc.) with real WordPress snapshot/post assembly
 * and mock `/wp-json/outbound/v1/*` handlers so full visual parity, assets, routing, and forms can be
 * tested in real Chrome/Edge without requiring MySQL.
 */

$req_path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$theme_root = __DIR__ . '/../wordpress-theme/outbound-holidays';

// Serve theme static assets directly when requested under /wp-content/themes/outbound-holidays/
if (str_starts_with($req_path, '/wp-content/themes/outbound-holidays/')) {
    $rel = substr($req_path, strlen('/wp-content/themes/outbound-holidays/'));
    $full = realpath($theme_root . '/' . $rel);
    if ($full && str_starts_with($full, realpath($theme_root)) && is_file($full)) {
        $ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));
        $mime = match ($ext) {
            'css'  => 'text/css; charset=utf-8',
            'js'   => 'application/javascript; charset=utf-8',
            'webp' => 'image/webp',
            'png'  => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'svg'  => 'image/svg+xml',
            default => 'application/octet-stream',
        };
        header('Content-Type: ' . $mime);
        readfile($full);
        exit;
    }
    http_response_code(404);
    exit;
}

define('ABSPATH', __DIR__ . '/');
define('OUTBOUND_THEME_VERSION', '1.0.0');
define('OUTBOUND_DB_SCHEMA_VERSION', '1.0.0');
define('OUTBOUND_THEME_DIR', $theme_root);
define('OUTBOUND_THEME_URI', '/wp-content/themes/outbound-holidays');

$GLOBALS['__wp_bundle'] = json_decode((string) file_get_contents($theme_root . '/inc/default-snapshot.json'), true) ?: array();
$GLOBALS['__wp_route'] = $req_path;

class WP_Post {
    public int $ID = 1;
    public string $post_type = 'post';
    public string $post_name = 'sample';
    public string $post_title = 'Sample';
    public string $post_excerpt = '';
    public string $post_content = '';
    public string $post_status = 'publish';
    public string $post_date = '2026-06-15 08:00:00';
    public string $post_date_gmt = '2026-06-15 08:00:00';
    public string $post_modified = '2026-06-15 08:00:00';
    public string $post_modified_gmt = '2026-06-15 08:00:00';
    public int $post_author = 1;
}
class WP_Term {
    public int $term_id = 1;
    public string $slug = 'victoria-falls-travel-guides';
    public string $name = 'Victoria Falls Travel Guides';
    public string $description = '';
}
class WP_REST_Response {
    public mixed $data;
    public int $status;
    public function __construct($data, int $status = 200) {
        $this->data = $data;
        $this->status = $status;
    }
}

function add_action($h, $c, $p = 10, $a = 1) {}
function add_filter($h, $c, $p = 10, $a = 1) {}
function apply_filters($tag, $val) { return $val; }
function __($s, $d = '') { return $s; }
function esc_html_e($s, $d = '') { echo htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
function esc_attr_e($s, $d = '') { echo htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
function esc_html($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
function esc_attr($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
function esc_textarea($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
function esc_url($u) { return htmlspecialchars((string) $u, ENT_QUOTES, 'UTF-8'); }
function esc_url_raw($u) { return (string) $u; }
function sanitize_text_field($s) { return trim((string) $s); }
function sanitize_title($s) { return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower((string) $s)), '-'); }
function wp_strip_all_tags($s) { return strip_tags((string) $s); }
function wp_unslash($s) { return $s; }
function wp_json_encode($v, $f = 0) { return json_encode($v, $f); }
function wp_kses_post($s) { return (string) $s; }
function wp_create_nonce($a = -1) { return 'harness-nonce'; }
function wp_trim_words($text, $num_words = 55, $more = '...') {
    $words = preg_split('/\s+/', trim((string) $text));
    if (count($words) <= $num_words) return (string) $text;
    return implode(' ', array_slice($words, 0, $num_words)) . $more;
}
function home_url($p = '/') {
    $host = $_SERVER['HTTP_HOST'] ?? ('127.0.0.1:' . ($_SERVER['SERVER_PORT'] ?? '8089'));
    return 'http://' . $host . '/' . ltrim((string) $p, '/');
}
function rest_url($p = '') { return home_url('/wp-json/' . ltrim((string) $p, '/')); }
function language_attributes() { echo 'lang="en"'; }
function bloginfo($k) { echo 'UTF-8'; }
function body_class($cls = '') { echo 'class="' . esc_attr($cls) . '"'; }
function wp_body_open() {}
function admin_url($p = '') { return home_url('/wp-admin/' . ltrim((string) $p, '/')); }
function current_user_can($cap = '') { return !empty($_GET['harness_cms_preview']) && $_GET['harness_cms_preview'] === '1'; }
function get_option($k, $d = false) {
    if ($k === 'outbound_cms_draft_state') {
        return array(
            'updatedAt' => '2026-11-11T12:00:00Z',
            'sections'  => array('homepage', 'design'),
            'editorial_strings' => array(
                'travel/TravelHero.headlineLine1' => 'Victoria Falls Stays Planned Locally',
                'travel/TravelHero.headlineLine2' => 'With Draft Preview',
            ),
            'site_options' => array(
                'homepageSections' => array(
                    'showClientGallery' => false,
                ),
            ),
            'design_tokens' => array(
                'primaryColor' => '#1A5276',
            ),
        );
    }
    return $d;
}
function get_template_part($slug, $name = null, $args = array()) { include OUTBOUND_THEME_DIR . '/' . $slug . '.php'; }
function get_header() { include OUTBOUND_THEME_DIR . '/header.php'; }
function get_footer() { include OUTBOUND_THEME_DIR . '/footer.php'; }
function is_front_page() { return ($GLOBALS['__wp_route'] ?? '/') === '/'; }
function is_category() { return false; }
function is_tag() { return false; }
function is_search() { return false; }
function is_archive() { return false; }
function is_home() { return rtrim((string) ($GLOBALS['__wp_route'] ?? ''), '/') === '/blog'; }
function is_singular($pt = '') { return false; }
function is_tax($t = '') { return false; }
function get_query_var($k) { return ''; }
function get_the_title() { return 'Outbound Holidays | Victoria Falls Holidays Planned by Local Specialists'; }
function has_excerpt($p = null) { return false; }
function get_search_query() { return ''; }
function single_cat_title($p = '', $d = true) { return 'Category'; }
function single_tag_title($p = '', $d = true) { return 'Tag'; }
function single_term_title($p = '', $d = false) { return 'Experiences'; }
function is_wp_error($x) { return false; }
function has_post_thumbnail($id) { return false; }
function get_the_post_thumbnail_url($id, $sz = '') { return ''; }
function get_post_meta($id, $key, $single = true) { return ''; }
function wp_get_post_categories($id, $args = array()) { $t = new WP_Term(); return array($t); }
function wp_get_post_tags($id, $args = array()) { return array(); }
function get_the_author_meta($f, $id = 1) { return $f === 'display_name' ? 'Fungai Mtetwa' : 'Victoria Falls travel specialist.'; }
function have_posts() { return false; }
function the_post() {}
function the_permalink() { echo '#'; }
function the_title() { echo ''; }
function get_the_excerpt($p = null) { return ''; }
function get_the_content() { return ''; }
function get_posts($args = array()) {
    // Return empty list unless requested explicitly so baseline default-snapshot.json / guide-adapter loads cleanly identically to production React app, OR simulate WP posts only on /blog test.
    return array();
}

require_once OUTBOUND_THEME_DIR . '/inc/helpers.php';
require_once OUTBOUND_THEME_DIR . '/inc/seo.php';
require_once OUTBOUND_THEME_DIR . '/inc/snapshot.php';
require_once OUTBOUND_THEME_DIR . '/inc/setup.php';

// Handle REST API routes inside harness
if (str_starts_with($req_path, '/wp-json/outbound/v1/')) {
    header('Content-Type: application/json; charset=utf-8');
    $endpoint = substr($req_path, strlen('/wp-json/outbound/v1/'));
    if ($endpoint === 'snapshot') {
        echo wp_json_encode(outbound_build_live_snapshot(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    } elseif ($endpoint === 'posts') {
        echo wp_json_encode(outbound_get_wp_blog_posts_payload(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    } elseif ($endpoint === 'enquiries' && ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
        $raw = json_decode((string) file_get_contents('php://input'), true) ?: array();
        $ref = outbound_generate_reference_code();
        http_response_code(201);
        echo wp_json_encode(array(
            'saved'        => true,
            'ok'           => true,
            'reference'    => $ref,
            'customerName' => (string) ($raw['name'] ?? 'Test Traveller'),
            'submittedAt'  => gmdate('c'),
        ));
    } elseif ($endpoint === 'newsletter' && ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
        echo wp_json_encode(array(
            'saved'                => true,
            'ok'                   => true,
            'status'               => 'pending',
            'confirmationDelivery' => 'sent',
        ));
    } else {
        http_response_code(404);
        echo wp_json_encode(array('error' => 'Unknown harness endpoint'));
    }
    exit;
}

function wp_head() {
    echo '<title>Outbound Holidays | Victoria Falls Holidays Planned by Local Specialists</title>' . "\n";
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
    echo '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">' . "\n";
    echo '<link rel="stylesheet" href="/wp-content/themes/outbound-holidays/assets/app/outbound-app.css">' . "\n";
}
function wp_footer() {
    $cfg = outbound_get_frontend_runtime_config();
    if (!empty($_GET['harness_cms_preview']) && $_GET['harness_cms_preview'] === '1' && !empty($cfg['snapshotUrl'])) {
        $cfg['snapshotUrl'] .= (str_contains($cfg['snapshotUrl'], '?') ? '&' : '?') . 'harness_cms_preview=1';
    }
    echo '<script>window.__OUTBOUND_WP_CONFIG__ = ' . wp_json_encode($cfg, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES) . ';</script>' . "\n";
    echo '<script defer src="/wp-content/themes/outbound-holidays/assets/app/outbound-app.js"></script>' . "\n";
}

$clean_route = rtrim($req_path, '/');
if ($clean_route === '/victoria-falls-accommodation') {
    include OUTBOUND_THEME_DIR . '/page-victoria-falls-accommodation.php';
} elseif ($clean_route === '/things-to-do-in-victoria-falls') {
    include OUTBOUND_THEME_DIR . '/page-things-to-do-in-victoria-falls.php';
} elseif ($clean_route === '/victoria-falls-packages') {
    include OUTBOUND_THEME_DIR . '/page-victoria-falls-packages.php';
} elseif ($clean_route === '/victoria-falls-guide') {
    include OUTBOUND_THEME_DIR . '/page-victoria-falls-guide.php';
} elseif ($clean_route === '/client-gallery') {
    include OUTBOUND_THEME_DIR . '/page-client-gallery.php';
} elseif ($clean_route === '/about') {
    include OUTBOUND_THEME_DIR . '/page-about.php';
} elseif ($clean_route === '/contact') {
    include OUTBOUND_THEME_DIR . '/page-contact.php';
} elseif ($clean_route === '/blog') {
    include OUTBOUND_THEME_DIR . '/home.php';
} elseif ($clean_route === '' || $clean_route === '/') {
    include OUTBOUND_THEME_DIR . '/front-page.php';
} else {
    include OUTBOUND_THEME_DIR . '/page.php';
}

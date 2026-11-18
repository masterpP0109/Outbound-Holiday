<?php
/**
 * WordPress Theme PHP Syntax & Pure Business Logic Unit Tests.
 * Executable directly via `php tests/wp-theme-php.test.php` with zero WordPress database requirement.
 */

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}
if (!defined('OUTBOUND_THEME_URI')) {
    define('OUTBOUND_THEME_URI', '/wp-content/themes/outbound-holidays');
}
if (!defined('OUTBOUND_THEME_DIR')) {
    define('OUTBOUND_THEME_DIR', realpath(__DIR__ . '/../wordpress-theme/outbound-holidays'));
}
if (!defined('OUTBOUND_THEME_VERSION')) {
    define('OUTBOUND_THEME_VERSION', '1.0.0');
}

$GLOBALS['__mock_wp_options'] = array();
$GLOBALS['__mock_wp_meta'] = array();
$GLOBALS['__mock_can_manage'] = false;

// Stub minimal WP sanitize/hook/option shims if running outside WP core so pure functions load cleanly.
if (!function_exists('add_action')) {
    function add_action($hook, $cb, $prio = 10, $args = 1) {}
    function add_filter($hook, $cb, $prio = 10, $args = 1) {}
    function sanitize_title($str) {
        return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower((string) $str)), '-');
    }
    function sanitize_key($key) {
        return preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $key));
    }
    function sanitize_text_field($str) {
        return trim(strip_tags((string) $str));
    }
    function wp_strip_all_tags($str, $remove_breaks = false) {
        $text = preg_replace('@<(script|style)[^>]*?>.*?</\\1>@si', '', (string) $str);
        $text = strip_tags((string) $text);
        if ($remove_breaks) {
            $text = preg_replace('/[\r\n\t ]+/', ' ', $text);
        }
        return trim((string) $text);
    }
    function wp_trim_words($text, $num_words = 55, $more = null) {
        $words = preg_split('/\s+/', wp_strip_all_tags((string) $text), -1, PREG_SPLIT_NO_EMPTY);
        if (!is_array($words) || count($words) <= $num_words) {
            return implode(' ', (array) $words);
        }
        return implode(' ', array_slice($words, 0, $num_words)) . ($more ?? '...');
    }
    function wp_cache_delete($key, $group = '') { return true; }
    function sanitize_textarea_field($str) {
        return trim(strip_tags((string) $str));
    }
    function sanitize_email($str) {
        return filter_var((string) $str, FILTER_SANITIZE_EMAIL) ?: '';
    }
    function esc_url_raw($str) {
        return filter_var((string) $str, FILTER_SANITIZE_URL) ?: '';
    }
    function esc_html($str) {
        return htmlspecialchars((string) $str, ENT_QUOTES, 'UTF-8');
    }
    function esc_url($str) {
        return htmlspecialchars((string) $str, ENT_QUOTES, 'UTF-8');
    }
    function __($str, $domain = 'default') {
        return (string) $str;
    }
    function wp_json_encode($val, $flags = 0) {
        return json_encode($val, $flags);
    }
    function get_option($key, $default = false) {
        return array_key_exists($key, $GLOBALS['__mock_wp_options']) ? $GLOBALS['__mock_wp_options'][$key] : $default;
    }
    function update_option($key, $val, $autoload = null) {
        $GLOBALS['__mock_wp_options'][$key] = $val;
        return true;
    }
    function delete_option($key) {
        unset($GLOBALS['__mock_wp_options'][$key]);
        return true;
    }
    function get_post_meta($post_id, $key = '', $single = false) {
        if ($key === '') {
            return $GLOBALS['__mock_wp_meta'][$post_id] ?? array();
        }
        $val = $GLOBALS['__mock_wp_meta'][$post_id][$key] ?? '';
        return $single ? $val : array($val);
    }
    function update_post_meta($post_id, $key, $val) {
        if (!isset($GLOBALS['__mock_wp_meta'][$post_id])) {
            $GLOBALS['__mock_wp_meta'][$post_id] = array();
        }
        $GLOBALS['__mock_wp_meta'][$post_id][$key] = $val;
        return true;
    }
    function current_user_can($cap) {
        return !empty($GLOBALS['__mock_can_manage']);
    }
    function get_transient($k) { return $GLOBALS['__mock_wp_transients'][$k] ?? false; }
    function set_transient($k, $v, $exp = 0) { $GLOBALS['__mock_wp_transients'][$k] = $v; return true; }
    function delete_transient($k) { unset($GLOBALS['__mock_wp_transients'][$k]); return true; }
    function remove_action($hook, $cb, $prio = 10) { return true; }
    function admin_url($path = '', $scheme = 'admin') { return 'https://outboundholiday.com/wp-admin/' . ltrim((string) $path, '/'); }
    function is_email($email) { return (bool) filter_var((string) $email, FILTER_VALIDATE_EMAIL); }
    if (!class_exists('WP_Error')) {
        class WP_Error {
            public string $code;
            public string $message;
            public array $data;
            public function __construct($code = '', $message = '', $data = array()) {
                $this->code = (string) $code;
                $this->message = (string) $message;
                $this->data = is_array($data) ? $data : array();
            }
        }
    }
    if (!function_exists('is_wp_error')) {
        function is_wp_error($thing) { return $thing instanceof WP_Error; }
    }
    function wp_mail($to, $subject, $message, $headers = array()) {
        $GLOBALS['__mock_wp_mail_calls'][] = array('to' => $to, 'subject' => $subject, 'headers' => $headers);
        return $GLOBALS['__mock_wp_mail_ok'] ?? true;
    }
}

$GLOBALS['__mock_wp_transients'] = array();
$GLOBALS['__mock_wp_mail_calls'] = array();
$GLOBALS['__mock_wp_mail_ok'] = true;

require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/helpers.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/currency-rates.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/migrations.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/seo.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/item-editors.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/migration.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/newsletter.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/admin-settings.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/enquiries.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/snapshot.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/cms-hub.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/accommodation-crud.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/search.php';

$failures = 0;
function assert_true(bool $cond, string $msg): void {
    global $failures;
    if ($cond) {
        echo "[PASS] {$msg}\n";
    } else {
        $failures++;
        echo "[FAIL] {$msg}\n";
    }
}

// 1. PHP Lint every PHP file in wordpress-theme/outbound-holidays
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(__DIR__ . '/../wordpress-theme/outbound-holidays'));
$php_files = array();
foreach ($it as $file) {
    if ($file->isFile() && strtolower($file->getExtension()) === 'php') {
        $php_files[] = $file->getPathname();
    }
}
sort($php_files);
$lint_ok = 0;
foreach ($php_files as $pfile) {
    $out = array();
    $code = 0;
    exec(PHP_BINARY . ' -l ' . escapeshellarg($pfile) . ' 2>&1', $out, $code);
    if ($code === 0) {
        $lint_ok++;
    } else {
        $failures++;
        echo "[FAIL] php -l failed on {$pfile}: " . implode(' ', $out) . "\n";
    }
}
assert_true($lint_ok === count($php_files) && count($php_files) >= 25, "PHP syntax lint clean across all {$lint_ok} theme files");

// 2. Reference code & Holiday Estimate Math parity with server/submissions.ts
$nov12 = new DateTimeImmutable('2026-11-12 10:00:00', new DateTimeZone('Africa/Harare'));
$nov12_utc_late = new DateTimeImmutable('2026-11-12 22:30:00', new DateTimeZone('UTC')); // 00:30 on 13 Nov in Africa/Harare
$ref1 = outbound_generate_reference_code(1, $nov12);
$ref2 = outbound_generate_reference_code(2, $nov12);
$ref1000 = outbound_generate_reference_code(1000, $nov12);
$ref_next_day = outbound_generate_reference_code(1, $nov12_utc_late);
assert_true($ref1 === 'OH-261112-001', "First enquiry reference matches OH-YYMMDD-001 ({$ref1})");
assert_true($ref2 === 'OH-261112-002', "Second enquiry reference matches OH-YYMMDD-002 ({$ref2})");
assert_true($ref1000 === 'OH-261112-1000', "Sequence > 999 continues cleanly to 1000 ({$ref1000})");
assert_true($ref_next_day === 'OH-261113-001', "Africa/Harare midnight rolls sequence cleanly to next day ({$ref_next_day})");

$emails = outbound_build_enquiry_emails(array(
    'reference'        => 'OH-261112-001',
    'name'             => 'Priviledge Mukunga',
    'email'            => 'priviledge@example.com',
    'phone'            => '+263 77 123 4567',
    'adults'           => 2,
    'children'         => 1,
    'nights'           => 3,
    'estimate'         => array('minimum' => 1260, 'maximum' => 1487),
    'notes'            => 'Window view room please',
    'enquiry_id'       => 42,
    'travel_season'    => 'dry-peak',
    'experiences'      => array('Guided Tour of the Falls', 'Zambezi Sunset Cruise'),
    'whatsapp_display' => '+263 714 701 721',
    'admin_url'        => 'https://outboundholiday.com/wp-admin/admin.php?page=outbound-enquiries&enquiry_id=42',
));
assert_true($emails['specialist_subject'] === 'New Holiday Enquiry | OH-261112-001 | Priviledge Mukunga', 'Admin notification subject includes reference and customer name');
assert_true(strpos($emails['customer_html'], 'YOUR ENQUIRY REFERENCE') !== false && strpos($emails['customer_html'], 'OH-261112-001') !== false, 'Customer email displays prominent enquiry reference');
assert_true(strpos($emails['customer_html'], 'US$1,260&ndash;1,487') !== false && strpos($emails['customer_html'], '+263 714 701 721') !== false, 'Customer email preserves dynamic budget and WhatsApp contact');
assert_true(strpos($emails['specialist_html'], 'Guided Tour of the Falls') !== false && strpos($emails['specialist_html'], 'Zambezi Sunset Cruise') !== false && strpos($emails['specialist_html'], 'Window view room please') !== false, 'Admin email lists selected experiences and customer notes');

// Full end-to-end Holiday Builder snapshot & legacy extraction test (2A, 1C, 4N, Accommodation, 3 Experiences)
$hb_payload = array(
    'name'             => 'Priviledge Mukunga',
    'email'            => 'priviledge@example.com',
    'phone'            => '+263 77 123 4567',
    'message'          => 'Celebrating our anniversary — ground floor room preferred.',
    'source'           => 'holiday-builder',
    'marketingConsent' => true,
    'trip'             => array(
        'preferredContact' => 'whatsapp',
        'adults'           => 2,
        'children'         => 1,
        'nights'           => 4,
        'partyType'        => 'family',
        'intent'           => 'celebration',
        'travelDates'      => 'dry-peak',
        'stayTierId'       => 'comfort-plus',
        'stayPreferences'  => array('Breakfast included', 'Ground floor'),
        'accommodationId'  => 'ilala-lodge',
        'activityIds'      => array('act-sunset-cruise', 'act-game-drive', 'act-boma-dinner'),
        'transportType'    => 'private-transfers',
    ),
);
$hb_catalog = array(
    'stayTiers'      => array(array('id' => 'comfort-plus', 'name' => 'Comfort Plus Hotels & Lodges', 'startingPrice' => 235)),
    'accommodations' => array(array('id' => 'ilala-lodge', 'name' => 'Ilala Lodge Hotel', 'categoryId' => 'hotels', 'priceFromUSD' => 310)),
    'activities'     => array(
        array('id' => 'act-sunset-cruise', 'title' => 'Sunset Cruise', 'duration' => '2.5 hrs', 'priceAmount' => 55),
        array('id' => 'act-game-drive',    'title' => 'Game Drive',    'duration' => '3 hrs',   'priceAmount' => 80),
        array('id' => 'act-boma-dinner',   'title' => 'Boma Dinner',   'duration' => 'Evening', 'priceAmount' => 65),
    ),
);
$hb_snap = outbound_build_enquiry_snapshot($hb_payload, $hb_catalog);
assert_true(count($hb_snap['selectedActivities']) === 3 && $hb_snap['selectedActivities'][0]['title'] === 'Sunset Cruise' && $hb_snap['selectedActivities'][2]['title'] === 'Boma Dinner', 'Snapshot preserves all 3 selected activities individually');
assert_true($hb_snap['accommodationName'] === 'Ilala Lodge Hotel' && $hb_snap['estimate']['stayCost'] === 2480 && $hb_snap['estimate']['activityCost'] === 560 && $hb_snap['estimate']['transportCost'] === 120, 'Snapshot resolves Ilala Lodge Hotel rate (310 * 4N * 2 rooms = 2480) and itemized activity/transfer costs');

$legacy_row = (object) array(
    'reference_code'   => 'OH-20261110-ABCDEF',
    'type'             => 'holiday-builder',
    'estimate_min_usd' => 1500,
    'estimate_max_usd' => 1770,
    'message'          => 'Legacy enquiry note',
    'payload_json'     => json_encode(array('trip' => array('adults' => 2, 'children' => 0, 'nights' => 3, 'activityIds' => array('act-sunset-cruise')))),
);
$legacy_details = outbound_extract_enquiry_details($legacy_row);
assert_true(count($legacy_details['selectedActivities']) === 1 && $legacy_details['estimate']['minimum'] === 1500, 'Historical enquiry extraction preserves legacy reference budget and activities');

$hb_emails = outbound_build_enquiry_emails(array(
    'reference'        => 'OH-261112-003',
    'name'             => 'Priviledge Mukunga',
    'email'            => 'priviledge@example.com',
    'phone'            => '+263 77 123 4567',
    'adults'           => 2,
    'children'         => 1,
    'nights'           => 4,
    'estimate'         => $hb_snap['estimate'],
    'notes'            => $hb_snap['notes'],
    'enquiry_id'       => 99,
    'travel_season'    => 'dry-peak',
    'experiences'      => $hb_snap['selectedActivities'],
    'structured'       => $hb_snap,
    'whatsapp_display' => '+263 714 701 721',
));
assert_true(
    strpos($hb_emails['specialist_html'], 'Ilala Lodge Hotel') !== false
    && strpos($hb_emails['specialist_html'], 'Sunset Cruise') !== false
    && strpos($hb_emails['specialist_html'], 'Game Drive') !== false
    && strpos($hb_emails['specialist_html'], 'Boma Dinner') !== false,
    'Admin notification email displays accommodation and all 3 individual experiences'
);
assert_true(
    array_key_exists('follow-up', outbound_get_enquiry_statuses()) && array_key_exists('closed', outbound_get_enquiry_statuses()),
    'CMS enquiry statuses include New, Contacted, Quoted, Follow-up, Booked, Closed, and Archived'
);

$live_ctx = outbound_get_enquiry_catalog_context();
$live_act_ids = array_column((array) ($live_ctx['activities'] ?? array()), 'id');
assert_true(
    in_array('act-sunset-cruise', $live_act_ids, true) && !empty($live_ctx['stayTiers']),
    'Enquiry catalog context resolves live snapshot builderActivities (act-*) and stayTiers'
);

$full_optional_snap = outbound_build_enquiry_snapshot(array(
    'name'    => 'Tendai Ncube',
    'email'   => 'tendai@example.com',
    'phone'   => '+263 77 999 1111',
    'message' => 'Anniversary dinner and river view room please.',
    'source'  => 'holiday-builder',
    'trip'    => array(
        'entryMode'          => 'guided',
        'country'            => 'South Africa',
        'arrivalDate'        => '2026-12-10',
        'departureDate'      => '2026-12-14',
        'childrenAges'       => '7',
        'roomType'           => 'Riverfront Deluxe Suite',
        'celebrationDetails' => '10th Wedding Anniversary',
        'adults'             => 2,
        'children'           => 1,
        'nights'             => 4,
        'activityIds'        => array('act-sunset-cruise', 'act-boma'),
        'transportType'      => 'private-transfers',
    ),
), $live_ctx);
assert_true(
    $full_optional_snap['entryMode'] === 'guided'
    && $full_optional_snap['country'] === 'South Africa'
    && $full_optional_snap['childrenAges'] === '7'
    && $full_optional_snap['roomType'] === 'Riverfront Deluxe Suite'
    && $full_optional_snap['celebrationDetails'] === '10th Wedding Anniversary'
    && count($full_optional_snap['selectedActivities']) === 2,
    'Snapshot captures entryMode, optional customer/travel fields, and all live catalog activities'
);
assert_true(
    outbound_csv_safe_cell('=CMD|a') === "'=CMD|a"
    && outbound_csv_safe_cell('+1+1') === "'+1+1"
    && outbound_csv_safe_cell('OH-261112-001') === 'OH-261112-001',
    'CSV export sanitizer neutralizes spreadsheet formula injection prefixes'
);

$est = outbound_calculate_holiday_estimate(array(
    'nights'           => 3,
    'adults'           => 2,
    'children'         => 2,
    'stayNightRateUSD' => 235,
    'activityRatesUSD' => array(45, 65),
    'transportType'    => 'private-transfers',
));
// rooms = ceil(4/2) = 2 => stay = 235 * 3 * 2 = 1410
// act = (45+65) * (2 + 2*0.8) = 110 * 3.6 = 396
// transport = 120 => min = 1926, max = round(1926 * 1.18) = 2273
assert_true($est['rooms'] === 2 && $est['minimum'] === 1926 && $est['maximum'] === 2273, "Holiday estimate parity matches server/submissions.ts formula ({$est['minimum']}..{$est['maximum']})");

// 3. Accommodation filtering & sorting parity
$sample_stays = array(
    array('id' => 'a', 'name' => 'Zambezi Riverside Lodge', 'categoryId' => 'lodges', 'location' => 'Riverfront', 'priceFromUSD' => 450, 'maxGuests' => 4, 'amenities' => array('wifi', 'pool')),
    array('id' => 'b', 'name' => 'Victoria Falls Heritage Hotel', 'categoryId' => 'hotels', 'location' => 'Town', 'priceFromUSD' => 280, 'maxGuests' => 2, 'amenities' => array('wifi', 'ac')),
    array('id' => 'c', 'name' => 'Savannah Self-Catering Suite', 'categoryId' => 'apartments', 'location' => 'Suburbs', 'priceFromUSD' => 160, 'maxGuests' => 6, 'amenities' => array('wifi', 'self-catering', 'family-friendly', 'parking')),
);
$filtered_hotels = outbound_filter_and_sort_accommodations($sample_stays, array('category' => 'hotels'));
assert_true(count($filtered_hotels) === 1 && $filtered_hotels[0]['id'] === 'b', 'Accommodation category filter selects Hotels accurately');

$filtered_family = outbound_filter_and_sort_accommodations($sample_stays, array('minGuests' => 5, 'amenities' => array('self-catering')));
assert_true(count($filtered_family) === 1 && $filtered_family[0]['id'] === 'c', 'Accommodation capacity + amenity filter isolates family self-catering stays');

$sorted_asc = outbound_filter_and_sort_accommodations($sample_stays, array('sort' => 'price-asc'));
assert_true($sorted_asc[0]['id'] === 'c' && $sorted_asc[2]['id'] === 'a', 'Accommodation price ascending sort works accurately');

// 4. Newsletter SHA-256 Token Security & 4 Branded Email Templates
$pair = outbound_newsletter_generate_token_pair();
assert_true(strlen($pair['raw']) === 64 && hash('sha256', $pair['raw']) === $pair['hash'], 'Newsletter generates 64-char hex raw tokens paired cleanly to SHA-256 digest');

$templates = array('seasonal-spotlight', 'experience-feature', 'accommodation-guide', 'plain-editorial');
$tpl_pass = true;
foreach ($templates as $tid) {
    $html = outbound_render_newsletter_template($tid, array(
        'title' => 'Victoria Falls Seasonal Dispatch',
        'bodyHtml' => '<p>Flow check</p>',
        'unsubscribeUrl' => 'https://example.com/unsub',
    ));
    if (!str_contains($html, 'Unsubscribe at any time') || !str_contains($html, 'Victoria Falls Seasonal Dispatch')) {
        $tpl_pass = false;
    }
}
assert_true($tpl_pass, 'All 4 branded newsletter templates render clean HTML with one-click unsubscribe footer');

// 5. SEO JSON-LD Schema Generation
$schemas = outbound_build_seo_schemas(array(
    'kind'         => 'accommodation',
    'title'        => 'Victoria Falls Heritage Hotel',
    'description'  => 'Historic town hotel steps from the Falls.',
    'canonicalUrl' => 'https://www.outboundholidays.co.zw/victoria-falls-accommodation/vic-falls-hotel/',
    'imageUrl'     => 'https://www.outboundholidays.co.zw/wp-content/uploads/hotel.jpg',
    'faqs'         => array(array('q' => 'Does it include breakfast?', 'a' => 'Yes.')),
));
assert_true(count($schemas) === 3 && $schemas[0]['@type'] === 'TravelAgency' && $schemas[1]['@type'] === 'LodgingBusiness' && $schemas[2]['@type'] === 'FAQPage', 'SEO Schema builder emits TravelAgency, LodgingBusiness, and FAQPage JSON-LD');

// 6. Migration Bundle Reconciliation against docs/wp-conversion/outbound-migration-bundle.json
$bundle_path = __DIR__ . '/../docs/wp-conversion/outbound-migration-bundle.json';
if (file_exists($bundle_path)) {
    $bundle = json_decode((string) file_get_contents($bundle_path), true);
    $rec = outbound_build_migration_reconciliation($bundle, array(
        'accommodation' => 8,
        'experience'    => 25,
        'package'       => 8,
        'guide_article' => 11,
        'client_album'  => 1,
        'post'          => 11,
    ));
    $all_match = true;
    foreach ($rec as $row) {
        if (!$row['match']) { $all_match = false; }
    }
    assert_true($all_match, 'Migration bundle reconciliation verifies counts against exported bundle');
}

// 7. Outbound CMS 14-Section Registry, Sanitization & Draft -> Preview -> Publish Isolation
$cms_sections = outbound_cms_get_sections();
assert_true(count($cms_sections) === 14 && isset($cms_sections['overview'], $cms_sections['homepage'], $cms_sections['seo']), 'Outbound CMS registers all 14 numbered sections cleanly');

$san_hp = outbound_cms_sanitize_section_patch('homepage', array(
    'ed' => array(
        'travel/TravelHero.headlineLine1' => '<b>Victoria Falls</b> Stays <script>alert(1)</script>',
        'travel/TravelHero.heroImage'     => 'https://example.com/hero.webp',
    ),
    'vis' => array(
        'showQuickPlanning' => '1',
        'showExperiences'   => '1',
        // showClientGallery omitted -> toggled off
    ),
    'why_cards' => array(
        array('iconName' => 'InvalidIcon', 'title' => 'Real Advice', 'description' => 'Local help.', 'label' => 'Verified'),
    ),
));
assert_true(
    ($san_hp['editorial_strings']['travel/TravelHero.headlineLine1'] ?? '') === 'Victoria Falls Stays alert(1)'
    && $san_hp['site_options']['homepageSections']['showClientGallery'] === false
    && $san_hp['editorial_structures']['travel/WhyChooseOutbound.section1'][0]['iconName'] === 'ShieldCheck',
    'CMS section sanitization strips HTML tags, persists visibility toggles, and constrains WhyChoose icons'
);

$san_design = outbound_cms_sanitize_section_patch('design', array(
    'design' => array(
        'primaryColor'   => '#1a2b3c',
        'secondaryColor' => 'javascript:alert(1)',
    ),
));
assert_true(
    $san_design['design_tokens']['primaryColor'] === '#1A2B3C'
    && $san_design['design_tokens']['secondaryColor'] === '#C9A66B',
    'Design token sanitizer enforces strict 6-digit hex codes with safe palette fallback'
);

// Stage Draft changes and test Draft vs Public isolation
$GLOBALS['__mock_wp_options'] = array();
outbound_save_cms_draft_patch($san_hp, 'homepage');
outbound_save_cms_draft_patch($san_design, 'design');
outbound_save_cms_draft_patch(array(
    'route_seo' => array(
        '/' => array('title' => 'DRAFT SEO TITLE', 'description' => 'Draft description'),
    ),
), 'seo');
assert_true(outbound_has_cms_draft(), 'Draft state records staged CMS changes across sections');

// Case A: Anonymous visitor attempting ?outbound_preview=1 must NOT see draft data
$_GET['outbound_preview'] = '1';
$GLOBALS['__mock_can_manage'] = false;
outbound_invalidate_snapshot_cache();
$anon_snap = outbound_build_live_snapshot(true);
assert_true(
    !outbound_is_preview_request()
    && empty($anon_snap['site']['editorial']['strings']['travel/TravelHero.headlineLine1'])
    && ($anon_snap['site']['routeSeo']['/']['title'] ?? '') !== 'DRAFT SEO TITLE',
    'Anonymous visitor with ?outbound_preview=1 cannot view staged CMS drafts'
);

// Case B: Authenticated Admin with ?outbound_preview=1 receives draft + icon hydration + section visibility + design tokens
$GLOBALS['__mock_can_manage'] = true;
outbound_invalidate_snapshot_cache();
$preview_snap = outbound_build_live_snapshot(true);
assert_true(
    outbound_is_preview_request()
    && ($preview_snap['site']['editorial']['strings']['travel/TravelHero.headlineLine1'] ?? '') === 'Victoria Falls Stays alert(1)'
    && ($preview_snap['site']['routeSeo']['/']['title'] ?? '') === 'DRAFT SEO TITLE'
    && ($preview_snap['site']['editorial']['structures']['cms/homepage.sections']['showClientGallery'] ?? true) === false
    && ($preview_snap['site']['editorial']['structures']['cms/design.tokens']['primaryColor'] ?? '') === '#1A2B3C'
    && ($preview_snap['site']['editorial']['structures']['travel/WhyChooseOutbound.section1'][0]['icon']['$icon'] ?? '') === 'ShieldCheck',
    'Authenticated admin preview receives staged Hero, SEO, Visibility, Design Tokens, and hydrated WhyChoose icons'
);

// Case C: Publish Changes clears draft and exposes updated values to anonymous public visitors
unset($_GET['outbound_preview']);
$GLOBALS['__mock_can_manage'] = false;
outbound_publish_cms_changes();
$pub_snap = outbound_build_live_snapshot(true);
assert_true(
    !outbound_has_cms_draft()
    && ($pub_snap['site']['editorial']['strings']['travel/TravelHero.headlineLine1'] ?? '') === 'Victoria Falls Stays alert(1)'
    && ($pub_snap['site']['routeSeo']['/']['title'] ?? '') === 'DRAFT SEO TITLE',
    'Publish Changes clears staged draft and serves updated Hero & SEO to public visitors'
);

// Case D: Discard Draft drops staged edits cleanly without affecting live site
outbound_save_cms_draft_patch(array(
    'route_seo' => array('/' => array('title' => 'DISCARDED TITLE', 'description' => 'No')),
), 'seo');
outbound_discard_cms_draft();
$after_discard = outbound_build_live_snapshot(true);
assert_true(
    !outbound_has_cms_draft()
    && ($after_discard['site']['routeSeo']['/']['title'] ?? '') === 'DRAFT SEO TITLE',
    'Discard Draft removes unpublished staging data without altering live published options'
);

// 8. Migration mappers preserve 100% of Accommodation, Experience, Package, Guide, and Album structures
$baseline_snap = outbound_get_baseline_snapshot();
$acc_rec   = outbound_map_accommodation_migration_record($baseline_snap['accommodations'][0]);
$exp_rec   = outbound_map_experience_migration_record($baseline_snap['experiences'][0]);
$pkg_rec   = outbound_map_package_migration_record($baseline_snap['packages'][0]);
$guide_rec = outbound_map_guide_migration_record($baseline_snap['guides'][0]);
$album_rec = outbound_map_album_migration_record($baseline_snap['albums'][0]);

assert_true(
    !empty($acc_rec['meta']['_outbound_room_types_json'])
    && !empty($acc_rec['meta']['_outbound_at_a_glance_json'])
    && !empty($acc_rec['meta']['_outbound_location_info_json'])
    && !empty($exp_rec['meta']['_outbound_good_to_know_json'])
    && !empty($pkg_rec['meta']['_outbound_detailed_itinerary_json'])
    && !empty($pkg_rec['meta']['_outbound_recommended_hotels_json'])
    && !empty($pkg_rec['meta']['_outbound_highlights_meta_json'])
    && !empty($guide_rec['meta']['_outbound_sections_json'])
    && !empty($guide_rec['meta']['_outbound_author_json'])
    && !empty($album_rec['meta']['_outbound_gallery_json']),
    'All 5 migration mappers preserve nested rooms, itineraries, highlights, chapters, authors, and albums'
);

// 9. Visual Repeaters & Structured Meta Persistence (`outbound_save_structured_item_meta`)
$GLOBALS['__mock_wp_meta'] = array();
outbound_save_structured_item_meta(101, 'accommodation', array(
    'outbound_meta' => array(
        '_outbound_category_id'    => 'lodges',
        '_outbound_category_label' => 'Luxury Lodge',
        '_outbound_price_usd'      => '420',
        '_outbound_why_recommend'  => 'Private decks overlooking the Zambezi.',
    ),
    'outbound_rooms' => array(
        array('name' => 'River Suite', 'occupancy' => '2 Guests', 'description' => 'Spacious deck', 'imageUrl' => 'https://example.com/r1.jpg', 'features_text' => "King bed\nRain shower"),
    ),
    'outbound_at_glance' => array('type' => 'Luxury Lodge', 'pool' => 'Infinity pool'),
    'outbound_related_ids' => array('ilala-lodge', 'victoria-falls-hotel'),
));
$saved_rooms = json_decode((string) get_post_meta(101, '_outbound_room_types_json', true), true);
assert_true(
    count($saved_rooms) === 1
    && $saved_rooms[0]['name'] === 'River Suite'
    && $saved_rooms[0]['features'] === array('King bed', 'Rain shower')
    && get_post_meta(101, '_outbound_price_usd', true) === '420',
    'Visual repeater persistence accurately saves Accommodation rooms, features, at-a-glance, and related IDs'
);

outbound_save_structured_item_meta(202, 'package', array(
    'outbound_meta' => array('_outbound_badge' => 'Signature', '_outbound_price_usd' => '1490'),
    'outbound_pkg_days' => array(
        array('day' => 'Day 1', 'title' => 'Arrival & Cruise', 'morning' => 'Transfer from VFA', 'afternoon' => 'Check-in', 'evening' => 'Sunset cruise', 'included_text' => "Airport transfer\nSunset cruise"),
    ),
    'outbound_who_perfect'  => array('First-time visitors'),
    'outbound_who_consider' => array('Extended overland travellers'),
));
$saved_det = json_decode((string) get_post_meta(202, '_outbound_detailed_itinerary_json', true), true);
$saved_sim = json_decode((string) get_post_meta(202, '_outbound_itinerary_json', true), true);
assert_true(
    count($saved_det) === 1
    && $saved_det[0]['evening'] === 'Sunset cruise'
    && $saved_sim[0]['highlights'] === array('Airport transfer', 'Sunset cruise'),
    'Package visual day repeater syncs both detailedItinerary and summary itinerary cleanly'
);

outbound_save_structured_item_meta(303, 'guide_article', array(
    'outbound_author' => array('name' => 'Fungai K.', 'role' => 'Founder', 'avatarUrl' => '/logo.png'),
    'outbound_guide_chapters' => array(
        array(
            'id' => 'best-months',
            'tocTitle' => 'Best Months',
            'heading' => 'Best Time to Visit Victoria Falls',
            'blocks' => array(
                array('type' => 'text', 'content' => '<b>May to August</b> offers peak views and sunshine.'),
                array('type' => 'bullet_list', 'items_text' => "High water March-May\nRafting Aug-Dec"),
                array('type' => 'table', 'table_title' => 'Seasons', 'table_headers' => 'Season | Spray', 'table_rows' => "Peak | Heavy\nDry | Light"),
            ),
        ),
    ),
    'outbound_related_guides_slugs' => array('visa-and-entry-requirements'),
));
$saved_secs = json_decode((string) get_post_meta(303, '_outbound_sections_json', true), true);
assert_true(
    count($saved_secs) === 1
    && count($saved_secs[0]['blocks']) === 3
    && $saved_secs[0]['blocks'][0]['content'] === 'May to August offers peak views and sunshine.'
    && $saved_secs[0]['blocks'][1]['items'] === array('High water March-May', 'Rafting Aug-Dec')
    && $saved_secs[0]['blocks'][2]['table']['headers'] === array('Season', 'Spray'),
    'Guide visual chapter & nested block repeater sanitizes text, bullet lists, and tables losslessly'
);

outbound_save_structured_item_meta(404, 'client_album', array(
    'outbound_meta' => array('_outbound_featured' => '1'),
    'outbound_gallery_items' => array(
        array('id' => 'p1', 'url' => 'https://example.com/1.jpg', 'alt' => 'Family at the Falls', 'caption' => 'Rainforest walk', 'role' => 'hero'),
        array('id' => 'p2', 'url' => 'https://example.com/2.jpg', 'alt' => 'Sunset boat', 'caption' => '', 'role' => 'gallery'),
    ),
));
$saved_album = json_decode((string) get_post_meta(404, '_outbound_gallery_json', true), true);
assert_true(
    count($saved_album) === 2
    && $saved_album[0]['role'] === 'hero'
    && $saved_album[1]['caption'] === null
    && $saved_album[1]['displayOrder'] === 2,
    'Client Album visual gallery persists roles, alt text, null optional captions, and displayOrder sequence'
);

// 9. Upgraded Newsletter Visual Blocks, CAT Timezone Scheduling, Audience & CSV Parser
$raw_blocks = array(
    array('type' => 'heading', 'level' => 'h2', 'text' => 'High Water Season <script>alert(1)</script>'),
    array('type' => 'paragraph', 'text' => 'Book **Zambezi** cruises on [Outbound](https://outboundholiday.com/).'),
    array('type' => 'list', 'items' => array('Private transfers', 'Sunset river cruise')),
    array('type' => 'button', 'label' => 'Plan Trip', 'url' => 'https://outboundholiday.com/', 'color' => '#3F6B3C'),
    array('type' => 'columns', 'leftTitle' => 'Lodges', 'leftBody' => 'Luxury stays', 'rightTitle' => 'Safaris', 'rightBody' => 'Chobe & Hwange'),
    array('type' => 'divider', 'style' => 'line'),
);
$sanitized_blocks = outbound_sanitize_newsletter_blocks($raw_blocks);
$rendered_blocks_html = outbound_render_newsletter_blocks($sanitized_blocks);
$rendered_plain = outbound_render_newsletter_plain_text(array(
    'title' => 'Victoria Falls Update',
    'blocks' => $sanitized_blocks,
    'ctaLabel' => 'Book Now',
    'ctaUrl' => 'https://outboundholiday.com/',
    'unsubscribeUrl' => 'https://outboundholiday.com/unsub',
));
assert_true(
    count($sanitized_blocks) === 6
    && !str_contains($rendered_blocks_html, '<script>')
    && str_contains($rendered_blocks_html, '<strong>Zambezi</strong>')
    && str_contains($rendered_blocks_html, '#3F6B3C')
    && str_contains($rendered_plain, 'Victoria Falls Update')
    && str_contains($rendered_plain, '+263 714 701 721'),
    'Newsletter block sanitizer & renderer strip XSS, support rich blocks/columns, and generate plain-text fallback with WhatsApp footer'
);

// Non-destructive template switching preserves blocks & hero across all 4 templates
$tpl_preserved = true;
foreach (array_keys(outbound_get_newsletter_templates()) as $tid) {
    $out_tpl = outbound_render_newsletter_template($tid, array(
        'title' => 'Preserved Title',
        'blocks' => $sanitized_blocks,
        'heroImageUrl' => 'https://outboundholiday.com/hero.jpg',
        'heroImageAlt' => 'Falls Mist',
        'ctaLabel' => 'Explore',
        'ctaUrl' => 'https://outboundholiday.com/',
        'unsubscribeUrl' => 'https://outboundholiday.com/unsub',
    ));
    if (!str_contains($out_tpl, 'Preserved Title') || !str_contains($out_tpl, 'Falls Mist') || !str_contains($out_tpl, '+263 714 701 721')) {
        $tpl_preserved = false;
    }
}
assert_true($tpl_preserved, 'Switching among all 4 newsletter templates preserves blocks, hero image alt, and branded footer');

// Africa/Harare (CAT UTC+2) scheduling conversion round-trip
$utc_sched = outbound_harare_local_to_utc('2026-11-15T10:30');
$cat_input = outbound_utc_to_harare_input($utc_sched);
$cat_label = outbound_utc_to_harare_label($utc_sched);
assert_true(
    $utc_sched === '2026-11-15 08:30:00'
    && $cat_input === '2026-11-15T10:30'
    && $cat_label === '15 Nov 2026, 10:30 CAT',
    'Newsletter scheduling converts Africa/Harare (CAT UTC+2) <-> UTC accurately'
);

// Audience SQL clause strictly requires status = confirmed and filters segments
$all_aud = outbound_build_audience_where_clause('all_confirmed');
$hb_aud = outbound_build_audience_where_clause('holiday_builder');
assert_true(
    $all_aud['where'] === "status = 'confirmed'"
    && str_contains($hb_aud['where'], "status = 'confirmed'")
    && $hb_aud['params'] === array('holiday-builder-optin'),
    'Audience segmentation strictly filters confirmed subscribers and maps real opt-in sources'
);

// CSV parser deduplicates and drops invalid emails cleanly
$csv_parsed = outbound_parse_subscriber_csv_rows("email,name\nalice@example.com,Alice\nALICE@example.com,Duplicate\nnot-an-email,Bad\nbob@example.com,Bob\n");
assert_true(
    count($csv_parsed) === 2
    && $csv_parsed[0]['email'] === 'alice@example.com'
    && $csv_parsed[1]['name'] === 'Bob',
    'Newsletter CSV parser normalizes case, deduplicates emails, and skips invalid addresses'
);

// 10. Newsletter Cron Schedule, Concurrency Lock, Atomic Claim & Bounded Retry
$cron_schedules = outbound_register_newsletter_cron_schedules(array());
assert_true(
    isset($cron_schedules['outbound_every_minute']) && (int) $cron_schedules['outbound_every_minute']['interval'] === 60,
    'Newsletter registers outbound_every_minute (60s) WP-Cron interval'
);

// Mock minimal $wpdb to test queue batch concurrency lock, atomic row claim, and bounded retry
$GLOBALS['wpdb'] = new class {
    public string $prefix = 'wp_';
    public array $notifications = array();
    public array $campaigns = array();
    public bool $fail_claim = false;

    public function prepare($query, ...$args) {
        return array('query' => $query, 'args' => $args);
    }

    public function get_results($prepared) {
        $q = is_array($prepared) ? $prepared['query'] : (string) $prepared;
        if (str_contains($q, 'FROM wp_outbound_campaigns') && str_contains($q, "status = 'scheduled'")) {
            return array();
        }
        if (str_contains($q, 'FROM wp_outbound_notifications') && str_contains($q, "status = 'pending'")) {
            return array_values(array_filter($this->notifications, static fn($n) => $n->status === 'pending'));
        }
        if (str_contains($q, 'FROM wp_outbound_campaigns') && str_contains($q, "status = 'sending'")) {
            return array_values(array_filter($this->campaigns, static fn($c) => $c->status === 'sending'));
        }
        return array();
    }

    public function get_row($prepared) {
        $id = (int) ($prepared['args'][0] ?? 0);
        return $this->campaigns[$id] ?? null;
    }

    public function get_var($prepared) {
        $q = $prepared['query'];
        if (str_contains($q, "status IN ('pending', 'processing')")) {
            $cid = (int) $prepared['args'][0];
            return count(array_filter($this->notifications, static fn($n) => $n->campaign_id === $cid && in_array($n->status, array('pending', 'processing'), true)));
        }
        if (str_contains($q, "status = 'sent'")) {
            $cid = (int) $prepared['args'][0];
            return count(array_filter($this->notifications, static fn($n) => $n->campaign_id === $cid && $n->status === 'sent'));
        }
        if (str_contains($q, "status = 'failed'")) {
            $cid = (int) $prepared['args'][0];
            return count(array_filter($this->notifications, static fn($n) => $n->campaign_id === $cid && $n->status === 'failed'));
        }
        if (str_contains($q, "status = 'pending' AND scheduled_for <=")) {
            $now = (string) $prepared['args'][0];
            return count(array_filter($this->notifications, static fn($n) => $n->status === 'pending' && $n->scheduled_for <= $now));
        }
        return 0;
    }

    public function query($prepared) {
        if ($this->fail_claim) {
            return 0;
        }
        $id = (int) ($prepared['args'][0] ?? 0);
        if (isset($this->notifications[$id]) && $this->notifications[$id]->status === 'pending') {
            $this->notifications[$id]->status = 'processing';
            return 1;
        }
        return 0;
    }

    public function update($table, $data, $where) {
        $id = (int) ($where['id'] ?? 0);
        if (str_contains($table, 'notifications') && isset($this->notifications[$id])) {
            foreach ($data as $k => $v) {
                $this->notifications[$id]->$k = $v;
            }
            return 1;
        }
        if (str_contains($table, 'campaigns') && isset($this->campaigns[$id])) {
            foreach ($data as $k => $v) {
                $this->campaigns[$id]->$k = $v;
            }
            return 1;
        }
        return 0;
    }
};

$GLOBALS['wpdb']->campaigns[1] = (object) array(
    'id' => 1,
    'status' => 'sending',
    'sender_name' => 'Outbound Holidays',
    'sender_email' => 'fungai@outboundholiday.com',
    'reply_to_email' => 'fungai@outboundholiday.com',
    'sent_count' => 0,
    'failed_count' => 0,
);
$GLOBALS['wpdb']->notifications[10] = (object) array(
    'id' => 10,
    'campaign_id' => 1,
    'recipient_email' => 'guest1@example.com',
    'subject' => 'Victoria Falls Campaign',
    'body_html' => '<p>Hello</p>',
    'status' => 'pending',
    'attempts' => 0,
    'scheduled_for' => '2026-01-01 00:00:00',
    'last_error' => null,
    'sent_at' => null,
);

// 10a. Concurrency lock blocks overlapping worker
$GLOBALS['__mock_wp_transients']['outbound_nl_queue_lock'] = 'locked';
$locked_res = outbound_dispatch_pending_newsletter_batch_detailed(25);
assert_true(
    $locked_res['locked'] === true && $locked_res['processed'] === 0 && count($GLOBALS['__mock_wp_mail_calls']) === 0,
    'Queue worker respects outbound_nl_queue_lock transient and prevents concurrent double-sends'
);
unset($GLOBALS['__mock_wp_transients']['outbound_nl_queue_lock']);

// 10b. Atomic claim failure skips row already claimed by another worker
$GLOBALS['wpdb']->fail_claim = true;
$claim_skip_res = outbound_dispatch_pending_newsletter_batch_detailed(25);
assert_true(
    $claim_skip_res['processed'] === 0 && count($GLOBALS['__mock_wp_mail_calls']) === 0,
    'Queue worker skips notification row when atomic SQL claim fails'
);
$GLOBALS['wpdb']->fail_claim = false;

// 10c. Failed send increments attempts, records error, schedules future backoff, and keeps campaign sending
$GLOBALS['__mock_wp_mail_ok'] = false;
$fail_res = outbound_dispatch_pending_newsletter_batch_detailed(25);
$n10 = $GLOBALS['wpdb']->notifications[10];
assert_true(
    $fail_res['processed'] === 1
    && $fail_res['failed_or_requeued'] === 1
    && $n10->status === 'pending'
    && (int) $n10->attempts === 1
    && $n10->scheduled_for > gmdate('Y-m-d H:i:s')
    && str_contains((string) $n10->last_error, 'wp_mail() returned false')
    && $GLOBALS['wpdb']->campaigns[1]->status === 'sending',
    'Failed attempt logs meaningful error, applies backoff delay, and keeps campaign in sending state'
);

// 10d. Successful retry marks sent and transitions campaign to completed
$GLOBALS['__mock_wp_mail_ok'] = true;
$n10->scheduled_for = '2026-01-01 00:00:00';
$ok_res = outbound_dispatch_pending_newsletter_batch_detailed(25);
assert_true(
    $ok_res['processed'] === 1
    && $ok_res['sent'] === 1
    && $n10->status === 'sent'
    && (int) $n10->attempts === 2
    && $GLOBALS['wpdb']->campaigns[1]->status === 'completed'
    && (int) $GLOBALS['wpdb']->campaigns[1]->sent_count === 1,
    'Successful dispatch marks notification sent, updates sent_count, and completes campaign'
);

// 11. Dynamic Accommodation Unit Types, Stable IDs, Internal Supplier Isolation & Room Enquiries
$GLOBALS['__mock_wp_meta'] = array();
$GLOBALS['__mock_can_manage'] = true;

$ten_rooms_payload = array();
$custom_names = array(
    'Standard Room',
    'Deluxe Room',
    'Executive Suite',
    'Presidential Suite',
    'Luxury Safari Tent',
    'River View Chalet',
    'Honeymoon Suite',
    'Family Villa',
    'Self-Catering Cottage',
    'Three-Bedroom Apartment',
);
foreach ($custom_names as $idx => $cname) {
    $ten_rooms_payload[] = array(
        'id'               => 'unit_stable_' . ($idx + 1),
        'name'             => $cname,
        'shortDescription' => 'Custom summary for ' . $cname,
        'description'      => 'Full description for ' . $cname,
        'unitCategory'     => $idx >= 4 ? 'Chalet / Tent' : 'Hotel Room',
        'sizeSqm'          => 40 + ($idx * 10),
        'unitCount'        => 2,
        'featured'         => $idx === 0,
        'status'           => $idx === 9 ? 'draft' : 'published',
        'imageUrl'         => 'https://example.com/room-' . ($idx + 1) . '.jpg',
        'gallery'          => array(
            array('id' => 'g1', 'url' => 'https://example.com/room-' . ($idx + 1) . '.jpg', 'alt' => $cname, 'caption' => 'Main view'),
            array('id' => 'g2', 'url' => 'https://example.com/room-' . ($idx + 1) . '-b.jpg', 'alt' => $cname . ' bath', 'caption' => ''),
        ),
        'amenities'        => $idx === 0 ? array('wifi', 'air-conditioning') : array('river-view', 'balcony'),
        'customAmenities'  => array('Custom Feature ' . ($idx + 1)),
        'inclusions'       => array('Breakfast included'),
        'occupancyConfig'  => array(
            'maxAdults'         => 2 + ($idx % 3),
            'maxChildren'       => $idx % 2,
            'maxTotalGuests'    => 3 + ($idx % 3),
            'bedrooms'          => $idx === 9 ? 3 : 1,
            'bathrooms'         => $idx === 9 ? 2 : 1,
            'beds'              => array(array('type' => 'King Bed', 'quantity' => 1)),
            'extraBedAvailable' => true,
            'extraBedNotes'     => 'Cot available',
            'childAgePolicy'    => 'Under 12 half price',
        ),
        'pricing'          => array(
            'baseNightlyRateUSD'   => 200 + ($idx * 50),
            'startingFromPriceUSD' => 190 + ($idx * 50),
            'weekendRateUSD'       => 225 + ($idx * 50),
            'weekendDays'          => array('fri', 'sat'),
            'baseOccupancyAdults'  => 2,
            'additionalGuestRateUSD' => 60,
            'childRateUSD'         => 40,
            'minStayNights'        => 2,
            'rateValidFrom'        => '2026-01-01',
            'rateValidTo'          => '2026-12-31',
            'rateStatus'           => 'provisional',
            'priceBasis'           => 'per_room',
            'seasonalRates'        => array(
                array('id' => 'sr1', 'label' => 'Peak', 'startDate' => '2026-07-01', 'endDate' => '2026-09-30', 'nightlyRateUSD' => 250 + ($idx * 50)),
            ),
            'dateSpecificRates'    => array(
                array('id' => 'dr1', 'date' => '2026-12-25', 'label' => 'Christmas', 'nightlyRateUSD' => 350 + ($idx * 50)),
            ),
            'mealPlanRates'        => array(
                array('id' => 'mp1', 'name' => 'Half Board', 'supplementPerPersonPerNightUSD' => 35, 'pricingType' => 'per_person_per_night'),
            ),
        ),
        'policies'         => array(
            'minStayNights'      => 2,
            'cancellationPolicy' => 'Free cancellation up to 14 days prior.',
        ),
        'internalSupplierRate' => 'NET US$' . (120 + ($idx * 30)),
        'internalNotes'        => 'Confidential supplier rate for ' . $cname,
    );
}

outbound_save_structured_item_meta(505, 'accommodation', array(
    'outbound_meta' => array(
        '_outbound_category_id'           => 'lodges',
        '_outbound_category_label'        => 'Safari Camp',
        '_outbound_room_section_heading'  => 'Choose Your Chalet or Tent',
        '_outbound_room_section_subtitle' => 'Every unit includes river views.',
    ),
    'outbound_rooms_present' => '1',
    'outbound_rooms_json'    => json_encode($ten_rooms_payload),
    'outbound_prop_policies' => array(
        'cancellationPolicy' => '30 days prior free cancellation.',
        'childPolicy'        => 'All ages welcome.',
    ),
    'outbound_prop_enquiry'  => array(
        'enableWhatsApp'    => '1',
        'enableEmail'       => '1',
        'customEnquiryNote' => 'Enquiry only — concierge confirms rates.',
    ),
));

$saved_public_rooms   = json_decode((string) get_post_meta(505, '_outbound_room_types_json', true), true);
$saved_internal_rooms = json_decode((string) get_post_meta(505, '_outbound_room_internal_json', true), true);
$public_json_str      = (string) get_post_meta(505, '_outbound_room_types_json', true);

assert_true(
    is_array($saved_public_rooms)
    && count($saved_public_rooms) === 10
    && $saved_public_rooms[0]['id'] === 'unit_stable_1'
    && $saved_public_rooms[0]['name'] === 'Standard Room'
    && $saved_public_rooms[4]['name'] === 'Luxury Safari Tent'
    && $saved_public_rooms[9]['status'] === 'draft'
    && !str_contains($public_json_str, 'internalSupplierRate')
    && !str_contains($public_json_str, 'Confidential supplier rate')
    && ($saved_internal_rooms['unit_stable_1']['internalSupplierRate'] ?? '') === 'NET US$120',
    'Saves 10 custom unit types with stable IDs and strips admin-only internal supplier rates/notes from public JSON'
);

// Test renaming a room preserves its stable ID and internal data
$renamed_payload = $saved_public_rooms;
$renamed_payload[0]['name'] = 'Renamed Heritage Suite';
$renamed_payload[0]['internalSupplierRate'] = $saved_internal_rooms['unit_stable_1']['internalSupplierRate'];
$renamed_payload[0]['internalNotes']        = $saved_internal_rooms['unit_stable_1']['internalNotes'];
outbound_save_structured_item_meta(505, 'accommodation', array(
    'outbound_rooms_present' => '1',
    'outbound_rooms_json'    => json_encode($renamed_payload),
));
$after_rename = json_decode((string) get_post_meta(505, '_outbound_room_types_json', true), true);
$after_int    = json_decode((string) get_post_meta(505, '_outbound_room_internal_json', true), true);
assert_true(
    $after_rename[0]['id'] === 'unit_stable_1'
    && $after_rename[0]['name'] === 'Renamed Heritage Suite'
    && count($after_rename[0]['gallery']) === 2
    && ($after_int['unit_stable_1']['internalSupplierRate'] ?? '') === 'NET US$120',
    'Renaming a unit preserves its stable ID, gallery, and internal supplier notes'
);

// Test deleting all rooms saves [] cleanly without falling back to stale rooms
outbound_save_structured_item_meta(505, 'accommodation', array(
    'outbound_rooms_present' => '1',
    'outbound_rooms_json'    => '[]',
));
$after_clear = json_decode((string) get_post_meta(505, '_outbound_room_types_json', true), true);
assert_true(
    is_array($after_clear) && count($after_clear) === 0,
    'Clearing all room types persists an empty array cleanly'
);

// Test public room normalization strips any stray internal keys defensively
$public_normalized = outbound_build_public_room_type(array(
    'id'                   => 'unit_leak_test',
    'name'                 => 'Riverfront Chalet',
    'internalSupplierRate' => 'SECRET 99',
    'internalNotes'        => 'SECRET NOTE',
));
assert_true(
    !isset($public_normalized['internalSupplierRate'])
    && !isset($public_normalized['internalNotes'])
    && $public_normalized['id'] === 'unit_leak_test',
    'Public room serializer never leaks internal supplier fields'
);

// Test accommodation room enquiry snapshot captures roomId, roomType, mealPlan, and childAges
$room_enq_snap = outbound_build_enquiry_snapshot(array(
    'type'                => 'accommodation-enquiry',
    'propertyName'        => 'Zambezi Safari Lodge',
    'accommodationId'     => 'zambezi-safari-lodge',
    'roomId'              => 'unit_tent_1',
    'roomType'            => 'Luxury Safari Tent',
    'mealPlan'            => 'Half Board',
    'checkInDate'         => '2026-08-14',
    'checkOutDate'        => '2026-08-16',
    'adultsCount'         => 2,
    'kidsCount'           => 1,
    'nightsCount'         => 2,
    'estimatedPriceLabel' => '$1,120 USD (2 nights)',
    'notes'               => 'Sunset deck tent requested.',
));
$room_enq_html = outbound_build_enquiry_options_html('accommodation-enquiry', 2, 1, 2, array(
    'accommodation_name' => 'Zambezi Safari Lodge',
    'room_id'            => 'unit_tent_1',
    'room_type'          => 'Luxury Safari Tent',
    'meal_plan'          => 'Half Board',
    'check_in_date'      => '2026-08-14',
    'check_out_date'     => '2026-08-16',
    'child_ages'         => array('Child 1: 7 yrs'),
    'estimated_price'    => '$1,120 USD (2 nights)',
));
assert_true(
    $room_enq_snap['roomType'] === 'Luxury Safari Tent'
    && str_contains($room_enq_html, 'Luxury Safari Tent')
    && str_contains($room_enq_html, 'Half Board')
    && str_contains($room_enq_html, 'Child 1: 7 yrs'),
    'Room-specific enquiry snapshot and emails preserve exact property, unit name, meal plan, and child ages'
);

// Test upgrading existing WP accommodation posts & importing unimported baseline properties safely
if (!class_exists('WP_Post')) {
    class WP_Post {
        public $ID;
        public $post_type;
        public $post_name;
        public $post_title;
        public $post_excerpt;
        public $post_content;
        public $post_status;
        public $menu_order;
        public function __construct($obj) {
            foreach ((array) $obj as $k => $v) {
                $this->$k = $v;
            }
        }
    }
}
$GLOBALS['__mock_wp_posts'] = array(
    601 => new WP_Post((object) array(
        'ID' => 601, 'post_type' => 'accommodation', 'post_name' => 'victoria-falls-safari-lodge',
        'post_title' => 'Victoria Falls Safari Lodge', 'post_status' => 'publish', 'post_excerpt' => '', 'post_content' => '', 'menu_order' => 0,
    )),
    602 => new WP_Post((object) array(
        'ID' => 602, 'post_type' => 'accommodation', 'post_name' => 'roomless-retreat',
        'post_title' => 'Roomless Retreat', 'post_status' => 'publish', 'post_excerpt' => '', 'post_content' => '', 'menu_order' => 0,
    )),
);
// 601 has legacy rooms without `id`; 602 intentionally cleared `[]`
update_post_meta(601, '_outbound_room_types_json', json_encode(array(
    array('name' => 'Waterhole View Room', 'occupancy' => '2 Adults', 'description' => 'Balcony room', 'imageUrl' => 'https://example.com/r1.jpg', 'features' => array('Air Conditioning')),
)));
update_post_meta(602, '_outbound_room_types_json', '[]');

if (!defined('OBJECT')) {
    define('OBJECT', 'OBJECT');
}
if (!defined('ARRAY_A')) {
    define('ARRAY_A', 'ARRAY_A');
}
if (!function_exists('get_posts')) {
    function get_posts($args = array()) {
        $pt = $args['post_type'] ?? 'post';
        $ps = $args['post_status'] ?? 'publish';
        return array_values(array_filter($GLOBALS['__mock_wp_posts'], static function ($p) use ($pt, $ps) {
            if ($pt !== 'any' && $p->post_type !== $pt) {
                return false;
            }
            if ($ps === 'any') {
                return true;
            }
            $statuses = is_array($ps) ? $ps : array($ps);
            return in_array($p->post_status, $statuses, true);
        }));
    }
    function get_post($id) {
        return $GLOBALS['__mock_wp_posts'][(int) $id] ?? null;
    }
    function get_post_type($id) {
        $p = get_post($id);
        return $p ? $p->post_type : false;
    }
    function get_post_status($id) {
        $p = get_post($id);
        return $p ? $p->post_status : false;
    }
    function get_page_by_path($slug, $output = OBJECT, $post_type = 'page') {
        foreach ($GLOBALS['__mock_wp_posts'] as $p) {
            if ($p->post_type === $post_type && $p->post_name === $slug) {
                return $p;
            }
        }
        return null;
    }
    function wp_insert_post($postarr) {
        $nid = empty($GLOBALS['__mock_wp_posts']) ? 700 : (max(array_keys($GLOBALS['__mock_wp_posts'])) + 1);
        $postarr['ID'] = $nid;
        if (empty($postarr['post_name']) && !empty($postarr['post_title'])) {
            $postarr['post_name'] = sanitize_title($postarr['post_title']);
        }
        if (empty($postarr['post_modified_gmt'])) {
            $postarr['post_modified_gmt'] = gmdate('Y-m-d H:i:s');
        }
        $GLOBALS['__mock_wp_posts'][$nid] = new WP_Post((object) $postarr);
        return $nid;
    }
    function wp_update_post($postarr) {
        $pid = (int) ($postarr['ID'] ?? 0);
        if (!isset($GLOBALS['__mock_wp_posts'][$pid])) {
            return 0;
        }
        foreach ($postarr as $k => $v) {
            $GLOBALS['__mock_wp_posts'][$pid]->$k = $v;
        }
        return $pid;
    }
    function wp_trash_post($post_id) {
        $pid = (int) $post_id;
        if (!isset($GLOBALS['__mock_wp_posts'][$pid])) {
            return false;
        }
        $p = $GLOBALS['__mock_wp_posts'][$pid];
        $GLOBALS['__mock_wp_meta'][$pid]['_wp_trash_meta_status'] = $p->post_status;
        $p->post_status = 'trash';
        return $p;
    }
    function wp_untrash_post($post_id) {
        $pid = (int) $post_id;
        if (!isset($GLOBALS['__mock_wp_posts'][$pid])) {
            return false;
        }
        $p = $GLOBALS['__mock_wp_posts'][$pid];
        $prev = $GLOBALS['__mock_wp_meta'][$pid]['_wp_trash_meta_status'] ?? 'draft';
        $p->post_status = $prev ?: 'draft';
        unset($GLOBALS['__mock_wp_meta'][$pid]['_wp_trash_meta_status']);
        return $p;
    }
    function wp_delete_post($post_id, $force_delete = false) {
        $pid = (int) $post_id;
        if (!isset($GLOBALS['__mock_wp_posts'][$pid])) {
            return false;
        }
        $old = $GLOBALS['__mock_wp_posts'][$pid];
        unset($GLOBALS['__mock_wp_posts'][$pid], $GLOBALS['__mock_wp_meta'][$pid]);
        return $old;
    }
    function delete_post_meta($post_id, $key) {
        unset($GLOBALS['__mock_wp_meta'][(int) $post_id][$key]);
        return true;
    }
    function wp_count_posts($post_type = 'post') {
        $c = (object) array('publish' => 0, 'draft' => 0, 'pending' => 0, 'private' => 0, 'archived' => 0, 'trash' => 0);
        foreach ($GLOBALS['__mock_wp_posts'] as $p) {
            if ($p->post_type === $post_type) {
                $st = (string) $p->post_status;
                $c->$st = ($c->$st ?? 0) + 1;
            }
        }
        return $c;
    }
    function wp_delete_object_term_relationships($post_id, $taxonomies) { return true; }
    if (!function_exists('is_wp_error')) {
        function is_wp_error($thing) { return $thing instanceof WP_Error; }
    }
    function wp_generate_password($length = 12, $special = true, $extra = false) {
        return substr(bin2hex(random_bytes(max(4, $length))), 0, $length);
    }
    function wp_set_object_terms($post_id, $terms, $taxonomy, $append = false) { return array(); }
    function get_the_post_thumbnail_url($post_id, $size = 'full') { return ''; }
    function has_post_thumbnail($post_id) { return false; }
    function wp_get_post_terms($post_id, $tax, $args = array()) { return array(); }
    function selected($selected, $current = true, $display = true) {
        $res = (string) $selected === (string) $current ? ' selected="selected"' : '';
        if ($display) { echo $res; }
        return $res;
    }
    function checked($checked, $current = true, $display = true) {
        $res = (bool) $checked === (bool) $current ? ' checked="checked"' : '';
        if ($display) { echo $res; }
        return $res;
    }
}

$up_stats = outbound_upgrade_existing_accommodation_rooms();
$up_601 = json_decode((string) get_post_meta(601, '_outbound_room_types_json', true), true);
$up_602 = json_decode((string) get_post_meta(602, '_outbound_room_types_json', true), true);
assert_true(
    $up_stats['scanned'] === 2
    && $up_stats['updated'] === 1
    && !empty($up_601[0]['id'])
    && $up_601[0]['name'] === 'Waterhole View Room'
    && is_array($up_602) && count($up_602) === 0,
    'Existing WP accommodations receive stable room unit IDs non-destructively while respecting empty []'
);

$missing_accs = outbound_get_unimported_baseline_accommodations();
assert_true(
    count($missing_accs) === 7,
    'Identifies all remaining unimported baseline accommodations cleanly alongside existing WP properties'
);

$ensured_ilala = outbound_ensure_baseline_accommodation_post('ilala-lodge-hotel');
$ilala_rooms = json_decode((string) get_post_meta($ensured_ilala, '_outbound_room_types_json', true), true);
assert_true(
    $ensured_ilala > 0
    && count($ilala_rooms) >= 2
    && !empty($ilala_rooms[0]['id']),
    'Imports a baseline current property into WordPress with stable dynamic unit IDs on demand'
);

ob_start();
outbound_editor_render_accommodation_fields($GLOBALS['__mock_wp_posts'][601], false);
$rendered_editor_html = (string) ob_get_clean();
assert_true(
    str_contains($rendered_editor_html, 'ROOMS &amp; ACCOMMODATION UNITS')
    && str_contains($rendered_editor_html, '3. Rates &amp; Seasons')
    && str_contains($rendered_editor_html, '6. Offers &amp; Packages')
    && str_contains($rendered_editor_html, 'Waterhole View Room')
    && str_contains($rendered_editor_html, 'Indicative Starting Rate (USD)')
    && str_contains($rendered_editor_html, 'outbound_indicative_price_usd_mirror')
    && str_contains($rendered_editor_html, 'outbound-unit-manager-config'),
    'Accommodation 8-tab editor renders existing WP properties with dynamic Units, Rates, and Offers managers'
);

// Test Rate Plans & Special Offers persistence and strict supplier-cost isolation in PHP
$GLOBALS['__mock_can_manage'] = true;
outbound_save_structured_item_meta(601, 'accommodation', array(
    'outbound_rate_plans_present' => '1',
    'outbound_rate_plans_json'    => json_encode(array(
        array(
            'id'                => 'rp_zim_test',
            'internalRateName'  => 'Zim Resident Wet Season',
            'amountUSD'         => 210,
            'priceBasis'        => 'per_room',
            'visitorMarket'     => 'zimbabwe_resident',
            'boardBasis'        => 'bed_and_breakfast',
            'rateStatus'        => 'confirmed',
            'applicableUnitIds' => array('unit_waterhole-view-room_1'),
            'supplierCostUSD'   => 145,
            'internalNotes'     => 'Confidential net contract rate',
        ),
    )),
    'outbound_offers_present' => '1',
    'outbound_offers_json'    => json_encode(array(
        array(
            'id'                => 'offer_romance_test',
            'title'             => 'Romantic Sunset Package',
            'description'       => 'Includes sunset cruise for two.',
            'includedServices'  => array('Zambezi Sunset Cruise', 'Sparkling Wine'),
            'applicableUnitIds' => array('unit_waterhole-view-room_1'),
            'priceType'         => 'percentage_discount',
            'discountPercent'   => 15,
            'status'            => 'published',
        ),
    )),
));
$saved_rps_pub = json_decode((string) get_post_meta(601, '_outbound_rate_plans_json', true), true);
$saved_rps_int = json_decode((string) get_post_meta(601, '_outbound_rate_plan_internal_json', true), true);
$saved_offers  = json_decode((string) get_post_meta(601, '_outbound_property_offers_json', true), true);
$built_rp_pub  = outbound_build_public_rate_plan(array_merge($saved_rps_pub[0], array('supplierCostUSD' => 99, 'internalNotes' => 'SECRET')));
assert_true(
    !isset($saved_rps_pub[0]['supplierCostUSD'])
    && !isset($saved_rps_pub[0]['internalNotes'])
    && !isset($built_rp_pub['supplierCostUSD'])
    && ($saved_rps_int['rp_zim_test']['supplierCostUSD'] ?? 0) == 145
    && ($saved_offers[0]['title'] ?? '') === 'Romantic Sunset Package',
    'Rate Plans isolate supplier cost & margins from public JSON and Special Offers persist separately from rooms'
);

// Test Global Website Search Engine (`inc/search.php`)
$GLOBALS['__mock_wp_posts'][603] = new WP_Post((object) array(
    'ID'           => 603,
    'post_type'    => 'accommodation',
    'post_status'  => 'publish',
    'post_title'   => 'Victoria Falls City Residences',
    'post_name'    => 'vic-falls-city-residences',
    'post_excerpt' => 'Modern family apartments with swimming pool in Victoria Falls Town.',
    'post_content' => 'Self-catering family apartments in Victoria Falls Town with pool access.',
    'menu_order'   => 99,
));
$GLOBALS['__mock_wp_meta'][603] = array(
    '_outbound_category_id'     => 'apartments',
    '_outbound_category_label'  => 'Apartment',
    '_outbound_location'        => 'Victoria Falls Town',
    '_outbound_price_usd'       => '220',
    '_outbound_max_guests'      => '6',
    '_outbound_amenities_json'  => json_encode(array('wifi', 'pool', 'family-friendly', 'self-catering')),
    '_outbound_room_types_json' => json_encode(array(
        array(
            'id'          => 'unit_three-bedroom-apartment_1',
            'name'        => 'Three-Bedroom Apartment',
            'status'      => 'published',
            'description' => 'Large family suite with kitchen and swimming pool view.',
            'pricing'     => array('startingFromPriceUSD' => 220, 'baseNightlyRateUSD' => 220),
            'ratePlans'   => array(
                array(
                    'id'               => 'rp_hidden',
                    'internalRateName' => 'Contract Net',
                    'amountUSD'        => 220,
                    'supplierCostUSD'  => 140,
                    'internalNotes'    => 'HIDDEN_PHP_SUPPLIER_SECRET',
                ),
            ),
        ),
        array(
            'id'          => 'unit_draft_hidden_2',
            'name'        => 'Draft Hidden Penthouse',
            'status'      => 'draft',
            'description' => 'Must never be indexed in public search.',
        ),
    )),
);

outbound_invalidate_snapshot_cache();
outbound_invalidate_search_index_cache();

$php_search_index = outbound_build_public_search_index(true);
assert_true(
    is_array($php_search_index) && count($php_search_index) >= 8,
    'PHP public search index builds across published accommodations, units, experiences, packages, and guides'
);

$php_queries = array(
    'Victoria Falls',
    'Sunset Cruise',
    'Family accommodation',
    'Lodge',
    'Swimming pool',
    'Chobe',
    'Helicopter',
    'Three-bedroom apartment',
);
$all_php_queries_hit = true;
foreach ($php_queries as $pq) {
    $res = outbound_execute_public_search(array('q' => $pq, 'type' => 'all', 'page' => 1, 'per_page' => 12));
    if (empty($res['total']) || empty($res['results'])) {
        $all_php_queries_hit = false;
        echo "[FAIL DETAILS] Query returned 0 results: {$pq}\n";
    }
}
assert_true($all_php_queries_hit, 'PHP global search matches Victoria Falls, Sunset Cruise, Family accommodation, Lodge, Swimming pool, Chobe, Helicopter, and Three-bedroom apartment');

$apt_res = outbound_execute_public_search(array('q' => 'Three-bedroom apartment', 'type' => 'accommodation'));
$apt_urls = array_column((array) ($apt_res['results'] ?? array()), 'url');
assert_true(
    in_array('/accommodation/vic-falls-city-residences?unit=unit_three-bedroom-apartment_1#accommodation-units', $apt_urls, true),
    'PHP global search links matched unit directly to /accommodation/{slug}?unit={unitId}#accommodation-units'
);

$draft_res = outbound_execute_public_search(array('q' => 'Draft Hidden Penthouse', 'type' => 'all'));
$secret_res = outbound_execute_public_search(array('q' => 'HIDDEN_PHP_SUPPLIER_SECRET', 'type' => 'all'));
assert_true(
    (int) ($draft_res['total'] ?? -1) === 0 && (int) ($secret_res['total'] ?? -1) === 0,
    'PHP global search excludes draft/unpublished room units and confidential supplier notes'
);

outbound_invalidate_search_index_cache();
assert_true(
    empty($GLOBALS['__mock_wp_transients']['outbound_public_search_index_v1']),
    'outbound_invalidate_search_index_cache() clears public search index transient cleanly'
);

// ============================================================
// 11. FULL ACCOMMODATION CRUD & DATA SAFETY LIFECYCLE TESTS
// ============================================================

// A. Permission check when unauthenticated
$GLOBALS['__mock_can_manage'] = false;
$unauth_trash = outbound_change_accommodation_status(603, 'trash');
$unauth_perm  = outbound_permanently_delete_accommodation(603, true);
assert_true(
    empty($unauth_trash['ok']) && empty($unauth_perm['ok']) && get_post_status(603) === 'publish',
    'Unauthorized users are blocked from trashing or permanently deleting accommodations'
);

// Authenticate as CMS Administrator
$GLOBALS['__mock_can_manage'] = true;

// B. Step 1-3: Create property -> Draft -> Publish
$create_draft_res = outbound_cms_save_item_record('accommodation', 0, 'draft', array(
    'outbound_post' => array(
        'post_title'   => 'Zambezi Riverbend Sanctuary',
        'post_name'    => 'zambezi-riverbend-sanctuary',
        'post_excerpt' => 'Luxury riverside eco-sanctuary near Victoria Falls.',
        'post_content' => 'Full description of Zambezi Riverbend Sanctuary with deck dining.',
    ),
    'outbound_category_id' => 'lodges',
    'outbound_amenities' => array('wifi', 'pool', 'Shared Riverside Deck'),
    'outbound_meta'      => array(
        '_outbound_category_label' => 'Safari Lodge',
        '_outbound_location'       => 'Upper Zambezi Riverfront',
        '_outbound_price_usd'      => '410',
        '_outbound_hero_image_url' => 'https://example.com/zambezi-hero.jpg',
        '_outbound_featured'       => '1',
    ),
    'outbound_prop_enquiry' => array(
        'enableWhatsApp' => '1',
        'enableEmail'    => '1',
        'contactEmail'   => 'bookings@zambeziriverbend.example',
        'contactPhone'   => '+263 83 284 9999',
        'whatsappNumber' => '+263 714 701 721',
    ),
));
$zrs_id = (int) ($create_draft_res['post_id'] ?? 0);
assert_true(
    $zrs_id > 0 && ($create_draft_res['status'] ?? '') === 'draft' && get_post_status($zrs_id) === 'draft',
    'Step 1-2: Created new accommodation property saved cleanly as Draft'
);

$pub_snap_while_draft = outbound_build_live_snapshot(false, false);
$pub_slugs_while_draft = array_column((array) ($pub_snap_while_draft['accommodations'] ?? array()), 'slug');
assert_true(
    !in_array('zambezi-riverbend-sanctuary', $pub_slugs_while_draft, true),
    'Draft property does not appear in public snapshot'
);

$pub_op = outbound_change_accommodation_status($zrs_id, 'publish');
assert_true(
    !empty($pub_op['ok']) && get_post_status($zrs_id) === 'publish',
    'Step 3: Published Draft accommodation property live'
);

$pub_snap_after_publish = outbound_build_live_snapshot(false, false);
$pub_slugs_after_publish = array_column((array) ($pub_snap_after_publish['accommodations'] ?? array()), 'slug');
assert_true(
    in_array('zambezi-riverbend-sanctuary', $pub_slugs_after_publish, true),
    'Published property immediately appears in public snapshot after cache invalidation'
);

// C. Steps 4-12: Add 5 custom-named units with galleries/rates/amenities -> Edit 2nd -> Duplicate 3rd -> Trash 4th -> Restore 4th -> Perm delete -> Photo & Rate CRUD
$custom_unit_names = array(
    'Classic Room',
    'River View Suite',
    'Horizon Tented Residence',
    'Family Chalet',
    'Honeymoon Suite',
);
$unit_ids = array();
foreach ($custom_unit_names as $u_idx => $u_name) {
    $ures = outbound_crud_upsert_unit($zrs_id, array(
        'name'             => $u_name,
        'unitCategory'     => 'Suite',
        'status'           => 'published',
        'shortDescription' => $u_name . ' overlooking the Zambezi.',
        'imageUrl'         => 'https://example.com/unit-main-' . $u_idx . '.jpg',
        'gallery'          => array(
            array('id' => 'gal_a_' . $u_idx, 'url' => 'https://example.com/gal-a-' . $u_idx . '.jpg', 'alt' => $u_name . ' 1'),
            array('id' => 'gal_b_' . $u_idx, 'url' => 'https://example.com/gal-b-' . $u_idx . '.jpg', 'alt' => $u_name . ' 2'),
        ),
        'amenities'        => array('wifi', 'ac', 'private-deck'),
        'customAmenities'  => array('Copper Outdoor Bath'),
        'features'         => array('Wi-Fi', 'Air Conditioning', 'Private Deck', 'Copper Outdoor Bath'),
        'pricing'          => array(
            'startingFromPriceUSD' => 410 + ($u_idx * 50),
            'baseNightlyRateUSD'   => 410 + ($u_idx * 50),
            'seasonalRates'        => array(
                array('id' => 'sr_peak_' . $u_idx, 'label' => 'Peak Dry Season', 'startDate' => '2026-07-01', 'endDate' => '2026-10-31', 'nightlyRateUSD' => 550, 'isActive' => true),
                array('id' => 'sr_old_' . $u_idx, 'label' => 'Old Deactivated Season', 'startDate' => '2025-01-01', 'endDate' => '2025-03-31', 'nightlyRateUSD' => 290, 'isActive' => false),
            ),
        ),
    ));
    if (!empty($ures['unit']['id'])) {
        $unit_ids[] = $ures['unit']['id'];
    }
}
$list_5 = outbound_crud_list_units($zrs_id, 'all');
assert_true(
    count($unit_ids) === 5 && count($list_5) === 5,
    'Steps 4-5: Added 5 custom-named accommodation units with photos, rates, and amenities'
);

// Step 6: Edit 2nd unit (River View Suite -> price & custom amenity edit)
$second_id = $unit_ids[1];
$edit2 = outbound_crud_upsert_unit($zrs_id, array(
    'id'              => $second_id,
    'name'            => 'River View Suite Deluxe',
    'customAmenities' => array('Heated Plunge Pool'),
    'amenities'       => array('private-deck', 'wifi'), // Reordered amenities
    'features'        => array('Private Deck', 'Wi-Fi', 'Heated Plunge Pool'),
    'pricing'         => array(
        'startingFromPriceUSD' => 525,
        'baseNightlyRateUSD'   => 525,
        'seasonalRates'        => array(
            array('id' => 'sr_peak_1', 'label' => 'Peak Dry Season', 'startDate' => '2026-07-01', 'endDate' => '2026-10-31', 'nightlyRateUSD' => 595, 'isActive' => true),
            array('id' => 'sr_old_1', 'label' => 'Old Deactivated Season', 'startDate' => '2025-01-01', 'endDate' => '2025-03-31', 'nightlyRateUSD' => 290, 'isActive' => false),
        ),
    ),
));
assert_true(
    !empty($edit2['ok']) && ($edit2['unit']['name'] ?? '') === 'River View Suite Deluxe' && (float) ($edit2['unit']['pricing']['startingFromPriceUSD'] ?? 0) === 525.0,
    'Step 6: Updated 2nd unit name, price, reordered amenities, and custom amenity'
);

// Step 7: Duplicate 3rd unit
$third_id = $unit_ids[2];
$dup3 = outbound_crud_duplicate_unit($zrs_id, $third_id);
assert_true(
    !empty($dup3['ok']) && ($dup3['unit']['id'] ?? '') !== $third_id && str_contains((string) ($dup3['unit']['name'] ?? ''), '(Copy)'),
    'Step 7: Duplicated 3rd unit cleanly with new stable unit ID'
);

// Step 8-9: Trash 4th unit (Family Chalet) & verify other units + parent remain untouched & public hides trashed
$fourth_id = $unit_ids[3];
$trash4 = outbound_crud_change_unit_status($zrs_id, $fourth_id, 'trash');
$snap_after_unit_trash = outbound_build_live_snapshot(false, false);
$zrs_public = null;
foreach ((array) ($snap_after_unit_trash['accommodations'] ?? array()) as $acc_row) {
    if (($acc_row['slug'] ?? '') === 'zambezi-riverbend-sanctuary') {
        $zrs_public = $acc_row;
    }
}
$zrs_public_unit_ids = array_column((array) ($zrs_public['roomTypes'] ?? array()), 'id');
assert_true(
    !empty($trash4['ok'])
    && !in_array($fourth_id, $zrs_public_unit_ids, true)
    && in_array($unit_ids[0], $zrs_public_unit_ids, true)
    && in_array($second_id, $zrs_public_unit_ids, true)
    && in_array($unit_ids[4], $zrs_public_unit_ids, true)
    && get_post_status($zrs_id) === 'publish',
    'Steps 8-9: Moving 4th unit (Family Chalet) to Trash hides it publicly while leaving other units and parent property unchanged'
);

// Verify public rate serializer strips deactivated seasonal rates (`isActive: false`) on 2nd unit
$pub_unit2 = null;
foreach ((array) ($zrs_public['roomTypes'] ?? array()) as $pu) {
    if (($pu['id'] ?? '') === $second_id) {
        $pub_unit2 = $pu;
    }
}
assert_true(
    is_array($pub_unit2) && count((array) ($pub_unit2['pricing']['seasonalRates'] ?? array())) === 1 && ($pub_unit2['pricing']['seasonalRates'][0]['id'] ?? '') === 'sr_peak_1',
    'Deactivated seasonal rates (isActive=false) are excluded from public frontend snapshot while active rates persist'
);

// Step 10: Restore trashed 4th unit & test permanent delete requires confirmation
$rest4 = outbound_crud_change_unit_status($zrs_id, $fourth_id, 'restore');
$unconf_unit_del = outbound_crud_permanently_delete_unit($zrs_id, $fourth_id, false);
assert_true(
    !empty($rest4['ok']) && ($rest4['unit']['status'] ?? '') === 'draft' && empty($unconf_unit_del['ok']),
    'Step 10: Restored deleted unit to Draft and enforced explicit confirmation before permanent unit removal'
);

// Steps 11-12: Remove 1 gallery photo and delete old seasonal rate from 1st unit
$first_edit = outbound_crud_upsert_unit($zrs_id, array(
    'id'      => $unit_ids[0],
    'gallery' => array(
        array('id' => 'gal_b_0', 'url' => 'https://example.com/gal-b-0.jpg', 'alt' => 'Classic Room 2'),
    ),
    'pricing' => array(
        'startingFromPriceUSD' => 410,
        'baseNightlyRateUSD'   => 410,
        'seasonalRates'        => array(
            array('id' => 'sr_peak_0', 'label' => 'Peak Dry Season', 'startDate' => '2026-07-01', 'endDate' => '2026-10-31', 'nightlyRateUSD' => 550, 'isActive' => true),
        ),
    ),
));
assert_true(
    count((array) ($first_edit['unit']['gallery'] ?? array())) === 1 && count((array) ($first_edit['unit']['pricing']['seasonalRates'] ?? array())) === 1,
    'Steps 11-12: Removed individual gallery photo and deleted old seasonal rate cleanly'
);

// Step 13: Archive a special offer and verify excluded publicly
update_post_meta($zrs_id, '_outbound_property_offers_json', wp_json_encode(array(
    array('id' => 'off_live', 'title' => 'Stay 4 Pay 3', 'offerCategory' => 'special-offer', 'status' => 'published', 'applyToEntireProperty' => true),
    array('id' => 'off_arch', 'title' => 'Archived Winter Special', 'offerCategory' => 'seasonal-promotion', 'status' => 'archived', 'applyToEntireProperty' => true),
    array('id' => 'off_trash', 'title' => 'Trashed Honeymoon Promo', 'offerCategory' => 'honeymoon-package', 'status' => 'trashed', 'applyToEntireProperty' => true),
)));
outbound_invalidate_snapshot_cache();
$snap_offers = outbound_build_live_snapshot(false, false);
$zrs_off_titles = array();
foreach ((array) ($snap_offers['accommodations'] ?? array()) as $acc_row) {
    if (($acc_row['slug'] ?? '') === 'zambezi-riverbend-sanctuary') {
        $zrs_off_titles = array_column((array) ($acc_row['offers'] ?? array()), 'title');
    }
}
assert_true(
    $zrs_off_titles === array('Stay 4 Pay 3'),
    'Step 13: Archived and trashed special offers never leak onto the public website'
);

// Steps 14-16: Unpublish & Trash property -> confirm hidden from public -> Restore -> Republish
$unpub_res = outbound_change_accommodation_status($zrs_id, 'unpublish');
$snap_unpub = outbound_build_live_snapshot(false, false);
$unpub_slugs = array_column((array) ($snap_unpub['accommodations'] ?? array()), 'slug');
assert_true(
    !empty($unpub_res['ok']) && get_post_status($zrs_id) === 'draft' && !in_array('zambezi-riverbend-sanctuary', $unpub_slugs, true),
    'Steps 14-15: Unpublished property disappears from public website immediately'
);

// Verify critical bugfix: even when ALL WP accommodation posts are unpublished/trashed (0 published), baseline does NOT resurrect!
$saved_statuses = array();
foreach ($GLOBALS['__mock_wp_posts'] as $mpid => $mpo) {
    if ($mpo->post_type === 'accommodation') {
        $saved_statuses[$mpid] = $mpo->post_status;
        $mpo->post_status = 'draft';
    }
}
outbound_invalidate_snapshot_cache();
$snap_zero_pub = outbound_build_live_snapshot(false, false);
assert_true(
    is_array($snap_zero_pub['accommodations'] ?? null) && count($snap_zero_pub['accommodations']) === 0,
    'When all WP accommodations are unpublished/trashed (0 live), public snapshot returns [] instead of reverting to baseline'
);
foreach ($saved_statuses as $mpid => $orig_st) {
    if (isset($GLOBALS['__mock_wp_posts'][$mpid])) {
        $GLOBALS['__mock_wp_posts'][$mpid]->post_status = $orig_st;
    }
}
outbound_invalidate_snapshot_cache();

$trash_prop = outbound_change_accommodation_status($zrs_id, 'trash');
$rest_prop  = outbound_change_accommodation_status($zrs_id, 'restore');
$repub_prop = outbound_change_accommodation_status($zrs_id, 'publish');
$snap_repub = outbound_build_live_snapshot(false, false);
$repub_slugs = array_column((array) ($snap_repub['accommodations'] ?? array()), 'slug');
assert_true(
    !empty($trash_prop['ok']) && !empty($rest_prop['ok']) && !empty($repub_prop['ok']) && in_array('zambezi-riverbend-sanctuary', $repub_slugs, true),
    'Step 16: Trash -> Restore -> Republish cycle restores property cleanly to public website'
);

// Shared Library dependency protection + unlink isolation
$shared_am = outbound_get_shared_property_amenities();
$shared_am['helipad-access'] = array('id' => 'helipad-access', 'label' => 'Helipad Access', 'category' => 'property', 'icon' => 'star');
outbound_save_shared_property_amenities($shared_am);
update_post_meta($zrs_id, '_outbound_amenities_json', wp_json_encode(array('wifi', 'helipad-access')));
update_post_meta(603, '_outbound_amenities_json', wp_json_encode(array('wifi', 'pool', 'helipad-access')));
$deps_before = outbound_find_shared_record_dependencies('property_amenities', 'helipad-access');
$del_unconf_shared = outbound_delete_shared_library_record('property_amenities', 'helipad-access', false);
// Unlink from ZRS only -> 603 must retain helipad-access!
update_post_meta($zrs_id, '_outbound_amenities_json', wp_json_encode(array('wifi')));
$meta_603_am = json_decode((string) get_post_meta(603, '_outbound_amenities_json', true), true);
assert_true(
    (int) ($deps_before['count'] ?? 0) === 2 && empty($del_unconf_shared['ok']) && in_array('helipad-access', (array) $meta_603_am, true),
    'Shared amenity tracks cross-property dependencies, blocks unconfirmed deletion, and unlinking from one property leaves others intact'
);

// Steps 17-18: Permanent Delete requires Trash/Confirm -> permanently deletes ZRS with zero orphans & leaves 601/603 unaffected
$impact = outbound_get_accommodation_delete_impact($zrs_id);
$perm_fail_unconf = outbound_permanently_delete_accommodation($zrs_id, false);
$perm_ok = outbound_permanently_delete_accommodation($zrs_id, true);
$snap_final = outbound_build_live_snapshot(false, false);
$final_slugs = array_column((array) ($snap_final['accommodations'] ?? array()), 'slug');
assert_true(
    ($impact['units_count'] ?? 0) === 6 // 5 created + 1 duplicated
    && empty($perm_fail_unconf['ok'])
    && !empty($perm_ok['ok'])
    && get_post($zrs_id) === null
    && empty($GLOBALS['__mock_wp_meta'][$zrs_id])
    && !in_array('zambezi-riverbend-sanctuary', $final_slugs, true)
    && get_post(603) !== null
    && get_post_status(603) === 'publish'
    && in_array('vic-falls-city-residences', $final_slugs, true),
    'Steps 17-18: Permanent property deletion requires explicit confirmation, removes owned records cleanly with zero orphans, and leaves unrelated properties untouched'
);

// D. Generalized CPT CRUD (Experiences, Holiday Packages, Guides, Client Albums) & zero-baseline-resurrection
$exp_save = outbound_cms_save_item_record('experience', 0, 'publish', array(
    'outbound_post' => array('post_title' => 'Quad BikesF', 'post_name' => 'quad-bikesf', 'post_excerpt' => 'Quad biking adventure'),
    'outbound_meta' => array('_outbound_price_usd' => '95', '_outbound_duration' => '2 hours'),
));
$pkg_save = outbound_cms_save_item_record('package', 0, 'publish', array(
    'outbound_post' => array('post_title' => '3-Day Zambezi Getaway', 'post_name' => '3-day-zambezi-getaway', 'post_excerpt' => 'Package'),
    'outbound_meta' => array('_outbound_price_usd' => '890', '_outbound_duration' => '3 Days / 2 Nights'),
));
$exp_id = (int) ($exp_save['post_id'] ?? 0);
$pkg_id = (int) ($pkg_save['post_id'] ?? 0);

$GLOBALS['__mock_can_manage'] = false;
$unauth_exp_del = outbound_permanently_delete_cms_post($exp_id, true, 'experience');
$GLOBALS['__mock_can_manage'] = true;

$dup_exp = outbound_duplicate_cms_post($exp_id);
$dup_exp_id = (int) ($dup_exp['post_id'] ?? 0);
$dup_status_before_del = get_post_status($dup_exp_id);
$trash_exp = outbound_change_cms_post_status($exp_id, 'trash', 'experience');
$trash_pkg = outbound_change_cms_post_status($pkg_id, 'trash', 'package');
$exp_status_after_trash = get_post_status($exp_id);
$pkg_status_after_trash = get_post_status($pkg_id);
$snap_after_cpt_trash = outbound_build_live_snapshot(false, false);
$exp_slugs_after = array_column((array) ($snap_after_cpt_trash['experiences'] ?? array()), 'slug');
$pkg_slugs_after = array_column((array) ($snap_after_cpt_trash['packages'] ?? array()), 'slug');
$unconf_exp_perm = outbound_permanently_delete_cms_post($exp_id, false, 'experience');
$perm_exp_ok = outbound_permanently_delete_cms_post($exp_id, true, 'experience');
$perm_dup_ok = outbound_permanently_delete_cms_post($dup_exp_id, true, 'experience');
$perm_pkg_ok = outbound_permanently_delete_cms_post($pkg_id, true, 'package');

assert_true(
    $exp_id > 0 && $pkg_id > 0
    && empty($unauth_exp_del['ok'])
    && !empty($dup_exp['ok']) && $dup_exp_id !== $exp_id && $dup_status_before_del === 'draft'
    && !empty($trash_exp['ok']) && $exp_status_after_trash === 'trash'
    && !empty($trash_pkg['ok']) && $pkg_status_after_trash === 'trash'
    && !in_array('quad-bikesf', $exp_slugs_after, true)
    && !in_array('3-day-zambezi-getaway', $pkg_slugs_after, true)
    && empty($unconf_exp_perm['ok'])
    && !empty($perm_exp_ok['ok']) && get_post($exp_id) === null
    && !empty($perm_dup_ok['ok']) && get_post($dup_exp_id) === null
    && !empty($perm_pkg_ok['ok']) && get_post($pkg_id) === null,
    'Any Experience or Holiday Package can be duplicated, trashed (leaving public site empty rather than resurrecting baseline), and permanently deleted with confirmation'
);

// E. Holiday Builder live CMS Experience + Accommodation pricing sync & shared-shuttle parity + Animated Edit CTAs
$live_exp_save = outbound_cms_save_item_record('experience', 0, 'publish', array(
    'outbound_post' => array('post_title' => 'Sunset River Kayak', 'post_name' => 'sunset-river-kayak', 'post_excerpt' => 'Guided evening kayak'),
    'outbound_meta' => array('_outbound_price_usd' => '135', '_outbound_duration' => '2.5 Hours'),
));
$live_exp_id = (int) ($live_exp_save['post_id'] ?? 0);
outbound_invalidate_snapshot_cache();
$synced_snap = outbound_build_live_snapshot(false, true);
$synced_builder_acts = array_column((array) ($synced_snap['builderActivities'] ?? array()), null, 'id');
$synced_cruise_price = (float) ($synced_builder_acts['act-sunset-cruise']['priceUSD'] ?? 0);
$synced_kayak_price  = (float) ($synced_builder_acts['sunset-river-kayak']['priceUSD'] ?? 0);
$kayak_est_snap = outbound_build_enquiry_snapshot(array(
    'source' => 'holiday-builder',
    'trip'   => array(
        'adults'          => 2,
        'children'        => 1,
        'nights'          => 3,
        'accommodationId' => 'vic-falls-city-residences',
        'activityIds'     => array('sunset-river-kayak'),
        'transportType'   => 'shared-shuttle',
    ),
));
// vic-falls-city-residences rate = 220 * 3N * 2 rooms = 1320; activity = 135 * 2.8 = 378; shared-shuttle = 60 => min = 1758
assert_true(
    $synced_cruise_price > 0
    && $synced_kayak_price === 135.0
    && ($kayak_est_snap['estimate']['stayCost'] ?? 0) === 1320
    && ($kayak_est_snap['estimate']['activityCost'] ?? 0) === 378
    && ($kayak_est_snap['estimate']['transportCost'] ?? 0) === 60
    && ($kayak_est_snap['estimate']['minimum'] ?? 0) === 1758,
    'PHP builder snapshot and estimator sync live CMS experiences, accommodations, and shared-shuttle pricing 1:1'
);
outbound_permanently_delete_cms_post($live_exp_id, true, 'experience');

$admin_css_src = (string) file_get_contents(__DIR__ . '/../wordpress-theme/outbound-holidays/assets/css/admin-outbound.css');
$cms_hub_src   = (string) file_get_contents(__DIR__ . '/../wordpress-theme/outbound-holidays/inc/cms-hub.php');
$admin_js_src  = (string) file_get_contents(__DIR__ . '/../wordpress-theme/outbound-holidays/assets/js/admin-meta.js');
assert_true(
    str_contains($admin_css_src, '@keyframes outboundEditSheen')
    && str_contains($admin_css_src, '@keyframes outboundPencilWiggle')
    && str_contains($admin_css_src, '.outbound-edit-cta')
    && str_contains($cms_hub_src, 'outbound-edit-cta')
    && str_contains($admin_js_src, 'outbound-edit-cta'),
    'Emphasized animated Edit CTA styles and classes are wired across Studio dashboards and Unit Manager'
);

// F. Email delivery normalization (fungai@outboundholiday.com) & Holiday Builder enquiry persistence
$GLOBALS['__mock_wp_options']['outbound_cms_site'] = array(
    'contact' => array('email' => 'travel@outboundholidays.co.zw'),
);
$GLOBALS['__mock_wp_options']['outbound_smtp_settings'] = array(
    'from_email' => 'travel@outboundholiday.com',
    'from_name'  => 'Outbound Holidays',
    'test_to'    => '',
);
$normalized_site_opts = outbound_get_site_options();
$mail_from_cfg = outbound_get_mail_from_config();
$GLOBALS['__mock_wp_mail_calls'] = array();
outbound_dispatch_enquiry_emails(
    'OH-261117-001',
    'holiday-builder',
    'Test Guest',
    'guest@example.com',
    '+263714701721',
    2,
    0,
    3,
    array('minimum' => 950, 'maximum' => 1121),
    'Need sunset cruise.',
    42,
    array('stay_tier' => 'Comfort Plus Lodge')
);
$spec_mail = $GLOBALS['__mock_wp_mail_calls'][0] ?? array();
$cust_mail = $GLOBALS['__mock_wp_mail_calls'][1] ?? array();
assert_true(
    ($normalized_site_opts['contact']['email'] ?? '') === 'fungai@outboundholiday.com'
    && ($mail_from_cfg['email'] ?? '') === 'fungai@outboundholiday.com'
    && ($spec_mail['to'] ?? '') === 'fungai@outboundholiday.com'
    && ($cust_mail['to'] ?? '') === 'guest@example.com'
    && in_array('From: Outbound Holidays <fungai@outboundholiday.com>', (array) ($spec_mail['headers'] ?? array()), true),
    'Legacy travel@ emails normalize to fungai@outboundholiday.com and enquiry dispatches use Outbound Holidays <fungai@outboundholiday.com>'
);

$GLOBALS['__mock_wp_options']['outbound_db_schema_version'] = '1.5.0';
$GLOBALS['wpdb'] = new class {
    public string $prefix = 'wp_';
    public string $last_error = '';
    public int $insert_id = 0;
    public int $seq = 0;
    public array $rows = array();
    public function get_charset_collate() { return 'DEFAULT CHARACTER SET utf8mb4'; }
    public function prepare($query, ...$args) { return array('query' => $query, 'args' => $args); }
    public function query($prepared) {
        $q = is_array($prepared) ? $prepared['query'] : (string) $prepared;
        if (str_contains($q, 'outbound_enquiry_sequences')) {
            $this->seq++;
            return 1;
        }
        return 0;
    }
    public function get_var($prepared) {
        $q = is_array($prepared) ? $prepared['query'] : (string) $prepared;
        if (str_contains($q, 'LAST_INSERT_ID')) {
            return $this->seq;
        }
        return null;
    }
    public function get_row($prepared) { return null; }
    public function insert($table, $data, $formats = null) {
        $this->insert_id++;
        $data['id'] = $this->insert_id;
        $this->rows[] = array('table' => $table, 'data' => $data);
        return 1;
    }
    public function update($table, $data, $where, $format = null, $where_format = null) { return 1; }
};
$hb_quick_res = outbound_process_enquiry_submission(array(
    'name'        => 'Sarah Jenkins',
    'email'       => 'sarah@example.com',
    'phone'       => '+263771122334',
    'message'     => 'Quick trip enquiry',
    'source'      => 'holiday-builder',
    'promotionId' => 0,
    'trip'        => array(
        'entryMode'   => 'quick',
        'adults'      => 2,
        'children'    => 0,
        'nights'      => 3,
        'stayTierId'  => 'comfort-plus',
        'transportType' => 'undecided',
    ),
), '127.0.0.1');
$hb_guided_res = outbound_process_enquiry_submission(array(
    'name'    => 'Daniel Moyo',
    'email'   => 'daniel@example.com',
    'message' => '',
    'source'  => 'holiday-builder',
    'trip'    => array(
        'entryMode'     => 'guided',
        'adults'        => 2,
        'children'      => 1,
        'nights'        => 4,
        'stayTierId'    => 'comfort-plus',
        'stayTierName'  => 'Comfort Plus Lodge',
        'activityIds'   => array('act-sunset-cruise'),
        'transportType' => 'shared-shuttle',
        'itineraryDraft' => array(
            array('day' => 'Day 1', 'title' => 'Arrival', 'description' => 'Check in'),
        ),
    ),
), '127.0.0.2');
assert_true(
    is_array($hb_quick_res) && !empty($hb_quick_res['saved'])
    && is_array($hb_guided_res) && !empty($hb_guided_res['saved'])
    && count($GLOBALS['wpdb']->rows) >= 2,
    'Holiday Builder Quick and Guided submissions persist cleanly via outbound_process_enquiry_submission'
);

// G. Stale featured_overrides never break SnapshotSchema (empty badge) or overwrite Accommodation CPT edits
$ilala_save = outbound_cms_save_item_record('accommodation', 0, 'publish', array(
    'outbound_post' => array(
        'post_title'   => 'Ilala Lodge Hotel Updated',
        'post_name'    => 'ilala-lodge-hotel',
        'post_excerpt' => 'Fresh CMS summary for Ilala Lodge Hotel.',
    ),
    'outbound_meta' => array(
        '_outbound_price_usd' => '345',
        '_outbound_tagline'   => 'Updated tagline directly from CMS',
    ),
    'outbound_rooms_present' => '1',
    'outbound_rooms_json'    => json_encode(array(
        array('id' => 'unit_deluxe', 'name' => 'Deluxe Suite', 'status' => 'published', 'pricing' => array('baseNightlyRateUSD' => 420)),
    )),
));
$ilala_id = (int) ($ilala_save['post_id'] ?? 0);
update_option('outbound_featured_item_overrides', array(
    'accommodations' => array(
        'ilala-lodge-hotel' => array(
            'title' => 'Stale Override Title',
            'price' => '295',
            'badge' => '',
        ),
    ),
));
outbound_invalidate_snapshot_cache();
$snap_with_override = outbound_build_live_snapshot(true);
$ilala_with_ov = array_values(array_filter((array) ($snap_with_override['accommodations'] ?? array()), static fn($a) => ($a['slug'] ?? '') === 'ilala-lodge-hotel'))[0] ?? array();
assert_true(
    !array_key_exists('badge', $ilala_with_ov) || $ilala_with_ov['badge'] !== '',
    'Empty featured_overrides badge never emits invalid empty string onto accommodation snapshot'
);

// Re-saving the Accommodation CPT clears stale featured_overrides so CPT price/title/rooms reflect immediately
outbound_cms_save_item_record('accommodation', $ilala_id, 'publish', array(
    'outbound_post' => array(
        'post_title'   => 'Ilala Lodge Hotel Live',
        'post_name'    => 'ilala-lodge-hotel',
        'post_excerpt' => 'Live CMS summary.',
    ),
    'outbound_meta' => array(
        '_outbound_price_usd' => '380',
        '_outbound_tagline'   => 'Newly saved live tagline',
    ),
    'outbound_rooms_present' => '1',
    'outbound_rooms_json'    => json_encode(array(
        array('id' => 'unit_exec', 'name' => 'Executive Suite', 'status' => 'published', 'pricing' => array('baseNightlyRateUSD' => 495)),
    )),
));
$snap_after_cpt = outbound_build_live_snapshot(true);
$ilala_live = array_values(array_filter((array) ($snap_after_cpt['accommodations'] ?? array()), static fn($a) => ($a['slug'] ?? '') === 'ilala-lodge-hotel'))[0] ?? array();
assert_true(
    ($ilala_live['name'] ?? '') === 'Ilala Lodge Hotel Live'
    && (float) ($ilala_live['priceFromUSD'] ?? 0) === 380.0
    && ($ilala_live['tagline'] ?? '') === 'Newly saved live tagline'
    && ($ilala_live['roomTypes'][0]['name'] ?? '') === 'Executive Suite',
    'Saving an Accommodation CPT clears stale featured_overrides and updates frontend snapshot title, rate, tagline, and rooms immediately'
);
outbound_permanently_delete_cms_post($ilala_id, true, 'accommodation');

// H. Review fixes: undecided transfer wording, childAges & 15-day itineraries, search & blog helpers
assert_true(
    is_array($hb_quick_res['summary'] ?? null)
    && strpos((string) ($hb_quick_res['summary']['transport'] ?? ''), 'To be quoted') !== false,
    'Undecided transfer type formats clearly as To be quoted separately in PHP enquiry summary'
);
$multi_day_res = outbound_process_enquiry_submission(array(
    'name'    => 'Kuda Ncube',
    'email'   => 'kuda@example.com',
    'source'  => 'holiday-builder',
    'trip'    => array(
        'entryMode'           => 'guided',
        'adults'              => 2,
        'children'            => 2,
        'childAges'           => array('Under 11', '11+'),
        'nights'              => 14,
        'arrivalDate'         => '2026-10-01',
        'departureDate'       => '2026-10-15',
        'requestedRooms'      => 1,
        'familyRoomRequested' => true,
        'stayTierId'          => 'comfort-plus',
        'transportType'       => 'undecided',
        'itineraryDraft'      => array_map(
            static fn($n) => array('day' => 'Day ' . $n, 'title' => 'Schedule ' . $n, 'description' => 'Custom'),
            range(1, 15)
        ),
    ),
), '127.0.0.3');
assert_true(
    is_array($multi_day_res)
    && count((array) ($multi_day_res['summary']['itinerary_draft'] ?? array())) === 15
    && ($multi_day_res['summary']['check_in_date'] ?? '') === '2026-10-01'
    && !empty($multi_day_res['summary']['family_room_requested'])
    && count((array) ($multi_day_res['summary']['child_ages'] ?? array())) === 2,
    '15-day itineraries, arrival/departure dates, childAges, and familyRoomRequested preserve cleanly in PHP'
);

$opts_html_check = outbound_build_enquiry_options_html('holiday-builder', 2, 2, 14, (array) ($multi_day_res['summary'] ?? array()));
assert_true(
    strpos($opts_html_check, 'Family / Interleading Room requested') !== false
    && strpos($opts_html_check, 'To be quoted separately') !== false
    && strpos($opts_html_check, 'Day 15') !== false,
    'Enquiry email options HTML renders Family Room, To be quoted transfers, and Day 15 itinerary'
);

// I. CMS Audit Priority 1-6 checks: Search lifecycle, Offer date validation, Builder exclusions/overrides, Navigation & Enquiry email tracking
$exp_search_save = outbound_cms_save_item_record('experience', 0, 'publish', array(
    'outbound_post' => array(
        'post_title'   => 'Victoria Falls Moonlight Microflight',
        'post_name'    => 'moonlight-microflight',
        'post_excerpt' => 'Private dawn & dusk scenic microflight.',
    ),
    'outbound_meta' => array(
        '_outbound_price_usd' => '195',
        '_outbound_duration'  => '25 Mins',
    ),
));
$exp_search_id = (int) ($exp_search_save['post_id'] ?? 0);
outbound_invalidate_snapshot_cache();
$sr_pub = outbound_execute_public_search(array('q' => 'Moonlight Microflight', 'type' => 'experiences'));
assert_true(
    (int) ($sr_pub['total'] ?? 0) >= 1 && strpos((string) ($sr_pub['results'][0]['title'] ?? ''), 'Moonlight Microflight') !== false,
    'Newly published Experience appears immediately in WordPress public search'
);

// Renaming reflects in search
outbound_cms_save_item_record('experience', $exp_search_id, 'publish', array(
    'outbound_post' => array(
        'post_title'   => 'Victoria Falls Sunrise Microlight',
        'post_name'    => 'moonlight-microflight',
        'post_excerpt' => 'Updated sunrise scenic microlight flight.',
    ),
    'outbound_meta' => array('_outbound_price_usd' => '210'),
));
$sr_renamed = outbound_execute_public_search(array('q' => 'Sunrise Microlight', 'type' => 'experiences'));
assert_true(
    (int) ($sr_renamed['total'] ?? 0) >= 1 && strpos((string) ($sr_renamed['results'][0]['title'] ?? ''), 'Sunrise Microlight') !== false,
    'Renamed Experience appears under new title in WordPress public search'
);

// Unpublishing removes it from public search
outbound_change_cms_post_status($exp_search_id, 'unpublish', 'experience');
$sr_unpub = outbound_execute_public_search(array('q' => 'Sunrise Microlight', 'type' => 'experiences'));
assert_true((int) ($sr_unpub['total'] ?? 0) === 0, 'Unpublished Experience disappears immediately from WordPress public search');
outbound_permanently_delete_cms_post($exp_search_id, true, 'experience');

// Builder patch with explicit Include in Builder, Suggest by default, Display order & Price Override
$builder_patch = outbound_cms_sanitize_section_patch('builder', array(
    'builder_config' => array(
        'defaultStayTierId'  => 'premium-escape',
        'defaultNights'      => '4',
        'availableNightsCsv' => '2, 4, 6',
    ),
    'builder_activities' => array(
        array(
            'id'                   => 'act-sunset-cruise',
            'experienceId'         => 'upper-zambezi-sunset-cruise',
            'includeInBuilder'     => '1',
            'suggestedByDefault'   => '1',
            'displayOrder'         => '2',
            'priceOverrideEnabled' => '1',
            'priceUSD'             => '99',
            'title'                => 'Sunset Cruise',
            'duration'             => '2 Hours',
        ),
        array(
            'id'               => 'act-guided-falls',
            'experienceId'     => 'guided-tour-falls',
            'displayOrder'     => '1',
            'priceUSD'         => '40',
            'title'            => 'Guided Falls',
            'duration'         => '2 Hours',
        ),
    ),
));
outbound_publish_cms_changes($builder_patch, 'builder');
$snap_builder = outbound_build_live_snapshot(true);
$sunset_snap  = array_values(array_filter((array) ($snap_builder['builderActivities'] ?? array()), static fn($a) => ($a['id'] ?? '') === 'act-sunset-cruise'))[0] ?? null;
$falls_snap   = array_values(array_filter((array) ($snap_builder['builderActivities'] ?? array()), static fn($a) => ($a['id'] ?? '') === 'act-guided-falls'))[0] ?? null;
assert_true(
    is_array($sunset_snap) && (float) $sunset_snap['priceUSD'] === 99.0 && ($sunset_snap['priceSource'] ?? '') === 'builder-override'
    && $falls_snap === null
    && (int) ($snap_builder['site']['builderConfig']['defaultNights'] ?? 0) === 4,
    'Builder respects excluded Experience (no auto-re-add), explicit priceOverrideEnabled source, and builderConfig defaults'
);
delete_option('outbound_builder_activities');
delete_option('outbound_builder_excluded_experiences');
delete_option('outbound_builder_config');
outbound_invalidate_snapshot_cache();

// Header navigation & Hero CTA sanitation
$hdr_patch = outbound_cms_sanitize_section_patch('header', array(
    'header_cta_action' => '/contact',
    'nav_items' => array(
        array('id' => 'packages', 'label' => 'Safari Packages', 'destination' => '/victoria-falls-packages', 'order' => '1', 'showDesktop' => '1', 'showMobile' => '1'),
        array('id' => 'contact', 'label' => 'Talk to Us', 'destination' => '/contact', 'order' => '2', 'showMobile' => '1'),
    ),
));
outbound_publish_cms_changes($hdr_patch, 'header');
$snap_hdr = outbound_build_live_snapshot(true);
assert_true(
    ($snap_hdr['site']['navigation']['primaryCtaAction'] ?? '') === '/contact'
    && count((array) ($snap_hdr['site']['navigation']['headerItems'] ?? array())) === 2
    && !empty($snap_hdr['site']['navigation']['headerItems'][0]['showDesktop'])
    && empty($snap_hdr['site']['navigation']['headerItems'][1]['showDesktop']),
    'Header Navigation Manager syncs labels, destinations, order, and desktop/mobile visibility to snapshot'
);
delete_option('outbound_site_navigation');

// Enquiry email failure capture & per-recipient status recording
$GLOBALS['__mock_wp_mail_ok'] = false;
$mail_res = outbound_dispatch_enquiry_emails(
    'OH-261118-999',
    'accommodation-enquiry',
    'Fungai Guest',
    'guest@example.com',
    '+263771112222',
    2,
    0,
    3,
    array('minimum' => 720, 'maximum' => 850),
    'Rate plan handoff check',
    (int) ($multi_day_res['reference'] ? ($GLOBALS['wpdb']->rows[0]['id'] ?? 1) : 1),
    array('rate_plan_id' => 'rp_zim_q4', 'rate_plan_name' => 'Zimbabwe Resident Q4 Special')
);
$GLOBALS['__mock_wp_mail_ok'] = true;
assert_true(
    ($mail_res['office']['status'] ?? '') === 'failed'
    && ($mail_res['customer']['status'] ?? '') === 'failed'
    && ($mail_res['office']['error'] ?? '') !== ''
    && ($mail_res['customer']['error'] ?? '') !== '',
    'Enquiry email dispatcher captures wp_mail() failures separately for office and customer notifications'
);

// Server-side offer date validation rejects expired offers cleanly
$expired_offer_err = outbound_validate_offer_enquiry_dates('ilala-lodge-hotel', 'nonexistent-check', '2026-11-20', '2026-11-22', '2026-11-17');
assert_true($expired_offer_err === true, 'Unknown/removed historical offer ID does not block standard enquiry cleanly');

// ---------------------------------------------------------------------------
// Trip Planner Redesign Phase 2 & 3 Verification (PHP / CMS / Enquiries)
// ---------------------------------------------------------------------------

// A. Cruise-only WhatsApp-only enquiry saves cleanly without fake stayTier or fake nights
$cruise_only_res = outbound_process_enquiry_submission(array(
    'name'    => 'Tendai Cruiser',
    'email'   => '',
    'phone'   => '+263772345678',
    'source'  => 'holiday-builder',
    'message' => 'Sunset cruise on 14 Sept only please',
    'trip'    => array(
        'entryMode'            => 'guided',
        'preferredContact'     => 'whatsapp',
        'preferredReplyMethod' => 'whatsapp',
        'timingMode'           => 'flexible',
        'adults'               => 2,
        'children'             => 0,
        'stayArrangement'      => 'none',
        'transferArrangement'  => 'none',
        'activityIds'          => array('act-sunset-cruise'),
        'selectedActivities'   => array(
            array(
                'id'            => 'act-sunset-cruise',
                'title'         => 'Upper Zambezi Sunset Cruise',
                'duration'      => '2 Hours',
                'unitPriceUSD'  => 85,
                'preferredDay'  => 'day-1',
                'preferredTime' => 'sunset',
                'priceBasis'    => 'per_person',
            ),
        ),
        'itemizedEstimate'     => array(
            'status'      => 'total',
            'totalLabel'  => 'Trip estimate',
            'subtotalUSD' => 170,
            'lines'       => array(
                array(
                    'section'   => 'Activities',
                    'title'     => 'Upper Zambezi Sunset Cruise',
                    'basis'     => '2 Adults × US$85',
                    'amountUSD' => 170,
                    'status'    => 'estimated',
                ),
            ),
        ),
    ),
), '127.0.0.10');
$cruise_row_entry = end($GLOBALS['wpdb']->rows);
$cruise_row = is_array($cruise_row_entry['data'] ?? null) ? $cruise_row_entry['data'] : array();
$cruise_summary = $cruise_only_res['summary'] ?? array();
assert_true(
    is_array($cruise_only_res)
    && !empty($cruise_only_res['reference'])
    && ($cruise_row['stay_tier_id'] ?? 'FAIL') === ''
    && (int) ($cruise_row['nights'] ?? -1) === 0
    && ($cruise_summary['preferred_channel'] ?? '') === 'whatsapp'
    && ($cruise_summary['stay_arrangement'] ?? '') === 'none'
    && ($cruise_only_res['itemizedEstimate']['mode'] ?? '') === 'total',
    'Cruise-only WhatsApp enquiry validates without email or fake nights/stays and preserves preferred reply channel'
);

// B. Transfer-only quick enquiry validates and saves transfer option cleanly
$transfer_only_res = outbound_process_enquiry_submission(array(
    'name'    => 'Tariro Transfer',
    'email'   => 'tariro@example.com',
    'phone'   => '',
    'source'  => 'holiday-builder',
    'message' => 'Return VFA airport transfer for 3 guests',
    'trip'    => array(
        'entryMode'            => 'quick',
        'preferredContact'     => 'email',
        'preferredReplyMethod' => 'email',
        'timingMode'           => 'undecided',
        'stayArrangement'      => 'none',
        'transferArrangement'  => 'selected',
        'transferId'           => 'tr_vfa_return',
        'transferTitle'        => 'VFA Airport Return Private Transfer',
        'transferRoute'        => 'VFA Airport <-> Victoria Falls Town',
        'transferPriceUSD'     => 60,
        'transferBasis'        => 'per_vehicle_return',
    ),
), '127.0.0.11');
$tr_row_entry = end($GLOBALS['wpdb']->rows);
$tr_row = is_array($tr_row_entry['data'] ?? null) ? $tr_row_entry['data'] : array();
$tr_summary = $transfer_only_res['summary'] ?? array();
assert_true(
    is_array($transfer_only_res)
    && !empty($transfer_only_res['reference'])
    && ($tr_row['stay_tier_id'] ?? 'FAIL') === ''
    && (int) ($tr_row['nights'] ?? -1) === 0
    && ($tr_summary['transfer_id'] ?? '') === 'tr_vfa_return'
    && ($tr_summary['transfer_basis'] ?? '') === 'per_vehicle_return',
    'Transfer-only enquiry saves transfer route/basis cleanly without invented stays or nights'
);

// C. Itemized estimate marks missing child fare as "Child price on request" while keeping adult subtotal
$partial_est = outbound_calculate_itemized_trip_estimate(
    array(
        'nights'              => 0,
        'adults'              => 2,
        'childAgeValues'      => array(9),
        'stayArrangement'     => 'none',
        'activityIds'         => array('exp-partial'),
        'transferArrangement' => 'none',
    ),
    array(
        'activities' => array(
            array(
                'id'         => 'exp-partial',
                'title'      => 'Chobe Day Trip',
                'priceUSD'   => 180,
                'priceBasis' => 'per_adult',
                'rateStatus' => 'provisional',
            ),
        ),
    )
);
assert_true(
    ($partial_est['mode'] ?? '') === 'subtotal'
    && ($partial_est['headlineLabel'] ?? '') === 'Subtotal for priced items'
    && (float) ($partial_est['subtotalUSD'] ?? 0) === 360.0
    && count((array) ($partial_est['excludedItems'] ?? array())) >= 1
    && stripos(implode(' | ', (array) $partial_est['excludedItems']), 'Child price on request') !== false,
    'Missing child fare yields "Subtotal for priced items", preserves adult subtotal, and excludes child fare cleanly'
);

$partial_html = outbound_build_enquiry_options_html(
    'holiday-builder',
    2,
    1,
    0,
    array(
        'preferred_channel'   => 'whatsapp',
        'stay_arrangement'    => 'already-arranged',
        'child_ages'          => array('Child 1: age 9 (Under 11)'),
        'itemized_estimate'   => $partial_est,
        'selected_activities' => array(
            array('title' => 'Chobe Day Trip', 'preferredDay' => 'day-2', 'preferredTime' => 'morning'),
        ),
    )
);
assert_true(
    stripos($partial_html, 'Already arranged independently') !== false
    && stripos($partial_html, 'Child price on request') !== false
    && stripos($partial_html, 'US$360') !== false
    && stripos($partial_html, 'Day 2') !== false,
    'Options HTML renders itemized lines, excluded child fare note, arranged stay, and scheduled activity day/time'
);

// D. Experience builder flags (includeInBuilder=false, priceBasis, childRateUnder11USD, recommendedInBuilder, builderOrder) + Section 12 transfers round-trip
$GLOBALS['__mock_wp_meta'] = array();
outbound_save_structured_item_meta(303, 'experience', array(
    'outbound_meta' => array(
        '_outbound_price_usd'              => '95',
        '_outbound_price_basis'            => 'per_person',
        '_outbound_child_under11_usd'      => '45',
        '_outbound_child_11plus_usd'       => '95',
        '_outbound_rate_status'            => 'confirmed',
        '_outbound_valid_from'             => '2026-01-01',
        '_outbound_valid_to'               => '2026-12-31',
        '_outbound_default_time_slot'      => 'sunset',
        '_outbound_builder_order'          => '3',
        '_outbound_recommended_in_builder' => '1',
    ),
    'outbound_exp_builder_flags_present' => '1',
));
assert_true(
    get_post_meta(303, '_outbound_price_basis', true) === 'per_person'
    && get_post_meta(303, '_outbound_child_under11_usd', true) === '45'
    && get_post_meta(303, '_outbound_include_in_builder', true) === '0'
    && get_post_meta(303, '_outbound_recommended_in_builder', true) === '1'
    && get_post_meta(303, '_outbound_builder_order', true) === '3',
    'Experience editor saves rate basis, child fares, validity window, and builder visibility/recommendation flags'
);

$tr_patch = outbound_cms_sanitize_section_patch('builder', array(
    'builder_transfers' => array(
        array(
            'id'              => 'tr_vfa_oneway',
            'title'           => 'VFA One-Way Private Transfer',
            'route'           => 'VFA Airport -> Victoria Falls Hotel',
            'priceUSD'        => '35',
            'priceBasis'      => 'per_vehicle',
            'visitorCategory' => 'all',
            'rateStatus'      => 'confirmed',
            'includeInBuilder'=> '1',
            'displayOrder'    => '1',
        ),
    ),
));
outbound_publish_cms_changes($tr_patch, 'builder');
$snap_tr = outbound_build_live_snapshot(true);
assert_true(
    count((array) ($snap_tr['site']['builderConfig']['transferOptions'] ?? array())) === 1
    && ($snap_tr['site']['builderConfig']['transferOptions'][0]['route'] ?? '') === 'VFA Airport -> Victoria Falls Hotel',
    'Section 12 transfer repeater saves and publishes transferOptions onto live builderConfig snapshot'
);

// E. Entry card copy, section visibility toggles, experience departureTimes CSV, and enquiry flight/pickup timing
$entry_patch = outbound_cms_sanitize_section_patch('builder', array(
    'builder_config' => array(
        'entryCopy' => array(
            'heading'       => 'How would you like to plan today?',
            'helpCardTitle' => 'Get help planning',
        ),
        'enabledSectionsPresent' => '1',
        'enabledSections'        => array(
            'datesGuests' => '1',
            'stay'        => '1',
            'activities'  => '1',
            'transfers'   => '',
        ),
    ),
    'builder_activities' => array(
        'act-sunset-cruise' => array(
            'id'                => 'act-sunset-cruise',
            'includeInBuilder'  => '1',
            'title'             => 'Zambezi Sunset Cruise',
            'priceAmount'       => '85',
            'departureTimesCsv' => '4:00 pm, 4:30 pm',
        ),
    ),
));
outbound_publish_cms_changes($entry_patch, 'builder');
$snap_entry = outbound_build_live_snapshot(true);
$sunset_row = null;
foreach ((array) ($snap_entry['builderActivities'] ?? array()) as $row_act) {
    if (($row_act['id'] ?? '') === 'act-sunset-cruise') {
        $sunset_row = $row_act;
        break;
    }
}
assert_true(
    ($snap_entry['site']['builderConfig']['entryCopy']['heading'] ?? '') === 'How would you like to plan today?'
    && ($snap_entry['site']['builderConfig']['enabledSections']['transfers'] ?? true) === false
    && is_array($sunset_row)
    && in_array('4:00 pm', (array) ($sunset_row['departureTimes'] ?? array()), true),
    'Builder CMS publishes entryCopy, enabledSections toggles, and activity departureTimes array'
);

outbound_save_structured_item_meta(304, 'experience', array(
    'outbound_meta' => array(
        '_outbound_departure_times' => '8:00 am, 2:00 pm',
    ),
    'outbound_exp_builder_flags_present' => '1',
));
assert_true(
    get_post_meta(304, '_outbound_departure_times', true) === '8:00 am, 2:00 pm',
    'Experience editor persists _outbound_departure_times meta'
);

$tr_timing_snap = outbound_build_enquiry_snapshot(array(
    'name'   => 'Flight Timing Guest',
    'email'  => 'flight@example.com',
    'source' => 'holiday-builder',
    'trip'   => array(
        'entryMode'           => 'guided',
        'arrivalDate'         => '2026-12-19',
        'departureDate'       => '2026-12-23',
        'nights'              => 4,
        'adults'              => 2,
        'selectedActivities'  => array(
            array(
                'id'            => 'act-sunset-cruise',
                'title'         => 'Sunset Cruise',
                'activityDate'  => '2026-12-20',
                'preferredTime' => '4:00 pm',
            ),
        ),
        'transferArrangement' => 'recommend',
        'transferDate'        => '2026-12-19',
        'flightTime'          => '13:45',
        'flightTimeUnknown'   => false,
        'pickupTime'          => '14:30',
    ),
), outbound_get_enquiry_catalog_context());
$tr_timing_html = outbound_build_enquiry_options_html(
    'holiday-builder',
    2,
    0,
    4,
    $tr_timing_snap
);
assert_true(
    $tr_timing_snap['flight_time'] === '13:45'
    && $tr_timing_snap['pickup_time'] === '14:30'
    && stripos($tr_timing_html, '13:45') !== false
    && stripos($tr_timing_html, '14:30') !== false
    && stripos($tr_timing_html, '2026-12-20') !== false,
    'Enquiry snapshot & HTML preserve transfer flight time, separate pickup time, and activity date'
);

// F. Server-side validation enforces matching contact field for chosen reply method
$bad_wa_res = outbound_process_enquiry_submission(array(
    'name'   => 'No Phone Guest',
    'email'  => 'guest@example.com',
    'phone'  => '',
    'source' => 'holiday-builder',
    'trip'   => array(
        'entryMode'            => 'quick',
        'preferredReplyMethod' => 'whatsapp',
    ),
), 'holiday-builder');
$bad_email_res = outbound_process_enquiry_submission(array(
    'name'   => 'No Email Guest',
    'email'  => '',
    'phone'  => '+263771234567',
    'source' => 'holiday-builder',
    'trip'   => array(
        'entryMode'            => 'quick',
        'preferredReplyMethod' => 'email',
    ),
), 'holiday-builder');
assert_true(
    is_wp_error($bad_wa_res) && is_wp_error($bad_email_res),
    'WordPress enquiry handler strictly requires phone for WhatsApp reply and email for Email reply'
);

delete_option('outbound_builder_config');
delete_option('outbound_builder_activities');
delete_option('outbound_builder_excluded_experiences');
outbound_invalidate_snapshot_cache();

echo "\nSummary: " . ($failures === 0 ? 'ALL PHP CHECKS PASSED' : "{$failures} CHECK(S) FAILED") . "\n";
exit($failures === 0 ? 0 : 1);

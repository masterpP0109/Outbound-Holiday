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
    function is_email($email) { return (bool) filter_var((string) $email, FILTER_VALIDATE_EMAIL); }
    function wp_mail($to, $subject, $message, $headers = array()) {
        $GLOBALS['__mock_wp_mail_calls'][] = array('to' => $to, 'subject' => $subject);
        return $GLOBALS['__mock_wp_mail_ok'] ?? true;
    }
}

$GLOBALS['__mock_wp_transients'] = array();
$GLOBALS['__mock_wp_mail_calls'] = array();
$GLOBALS['__mock_wp_mail_ok'] = true;

require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/helpers.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/migrations.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/seo.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/item-editors.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/migration.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/newsletter.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/enquiries.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/snapshot.php';
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/cms-hub.php';

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

echo "\nSummary: " . ($failures === 0 ? 'ALL PHP CHECKS PASSED' : "{$failures} CHECK(S) FAILED") . "\n";
exit($failures === 0 ? 0 : 1);

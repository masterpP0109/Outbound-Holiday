<?php
/**
 * Standalone Unit & Integration Test Suite for Outbound Holidays Promotions & Campaigns System.
 */

define('ABSPATH', __DIR__ . '/../');

// Mock minimal WordPress functions
$GLOBALS['mock_options'] = array(
    'timezone_string' => 'Africa/Harare',
    'outbound_db_schema_version' => '1.4.0',
);

function get_option($key, $default = false) {
    return $GLOBALS['mock_options'][$key] ?? $default;
}

function update_option($key, $value) {
    $GLOBALS['mock_options'][$key] = $value;
    return true;
}

function sanitize_title($str) {
    $str = strtolower(trim($str));
    return preg_replace('/[^a-z0-9-]+/', '-', $str);
}

function sanitize_text_field($str) {
    return strip_tags(trim((string) $str));
}

function sanitize_key($str) {
    return preg_replace('/[^a-z0-9_-]/', '', strtolower(trim((string) $str)));
}

function esc_html($str) {
    return htmlspecialchars((string) $str, ENT_QUOTES, 'UTF-8');
}

function esc_attr($str) {
    return htmlspecialchars((string) $str, ENT_QUOTES, 'UTF-8');
}

function esc_url($str) {
    return filter_var($str, FILTER_SANITIZE_URL) ?: '';
}

function esc_url_raw($str) {
    return filter_var($str, FILTER_SANITIZE_URL) ?: '';
}

function home_url($path = '') {
    return 'https://outboundholiday.com' . $path;
}

function current_user_can($cap) {
    return in_array($cap, $GLOBALS['mock_current_caps'] ?? array('manage_options', 'publish_posts'), true);
}

function add_action($tag, $callback, $priority = 10, $accepted_args = 1) {}
function register_rest_route($ns, $route, $args) {}
function is_wp_error($thing) {
    return $thing instanceof WP_Error;
}

class WP_Error {
    public $code;
    public $message;
    public $data;
    public function __construct($code, $message, $data = array()) {
        $this->code = $code;
        $this->message = $message;
        $this->data = $data;
    }
    public function get_error_message() { return $this->message; }
    public function get_error_data() { return $this->data; }
}

class WP_REST_Response {
    public $data;
    public $status;
    public function __construct($data, $status = 200) {
        $this->data = $data;
        $this->status = $status;
    }
}

function outbound_get_table_names() {
    return array(
        'promotions'       => 'wp_outbound_promotions',
        'promotion_events' => 'wp_outbound_promotion_events',
        'enquiries'        => 'wp_outbound_enquiries',
        'subscribers'      => 'wp_outbound_subscribers',
        'rate_limits'      => 'wp_outbound_rate_limits',
    );
}

// Load promotions module
require_once __DIR__ . '/../wordpress-theme/outbound-holidays/inc/promotions.php';

echo "=========================================================\n";
echo "OUTBOUND HOLIDAYS — PROMOTIONS & CAMPAIGNS TEST SUITE\n";
echo "=========================================================\n\n";

$tests_passed = 0;
$tests_failed = 0;

function assert_test($description, $condition) {
    global $tests_passed, $tests_failed;
    if ($condition) {
        echo "  [PASS] {$description}\n";
        $tests_passed++;
    } else {
        echo "  [FAIL] {$description}\n";
        $tests_failed++;
    }
}

// ---------------------------------------------------------
// 1. Discount Math Verification (Strict, never unverified)
// ---------------------------------------------------------
echo "TEST GROUP 1: Promotional Pricing & Verified Discounts\n";

assert_test(
    "Standard valid discount: $1000 down to $800 = 20%",
    outbound_calculate_promo_discount(1000, 800) === 20
);

assert_test(
    "Fractional rounded discount: $350 down to $245 = 30%",
    outbound_calculate_promo_discount(350, 245) === 30
);

assert_test(
    "Promo >= Original returns null (no fake negative or 0% discount)",
    outbound_calculate_promo_discount(500, 500) === null &&
    outbound_calculate_promo_discount(500, 600) === null
);

assert_test(
    "Zero or negative original returns null",
    outbound_calculate_promo_discount(0, 100) === null &&
    outbound_calculate_promo_discount(-50, 40) === null
);

assert_test(
    "Zero or negative promo returns null",
    outbound_calculate_promo_discount(200, 0) === null &&
    outbound_calculate_promo_discount(200, -10) === null
);

assert_test(
    "Null pricing returns null without PHP warnings",
    outbound_calculate_promo_discount(null, 150) === null &&
    outbound_calculate_promo_discount(200, null) === null &&
    outbound_calculate_promo_discount(null, null) === null
);

// ---------------------------------------------------------
// 2. Campaign Code Generator
// ---------------------------------------------------------
echo "\nTEST GROUP 2: Campaign Reference Format\n";

$code1 = outbound_generate_campaign_code();
$code2 = outbound_generate_campaign_code();

assert_test(
    "Campaign code format matches OH-PROMO-YYYY-XXXXXX: {$code1}",
    preg_match('/^OH-PROMO-[0-9]{4}-[0-9A-F]{6}$/', $code1) === 1
);

assert_test(
    "Successive campaign codes are unique: {$code1} vs {$code2}",
    $code1 !== $code2
);

// ---------------------------------------------------------
// 3. Africa/Harare Dynamic Status Evaluator
// ---------------------------------------------------------
echo "\nTEST GROUP 3: Africa/Harare Dynamic Scheduling & Expiration\n";

$now_utc = gmdate('Y-m-d H:i:s');
$yesterday = gmdate('Y-m-d H:i:s', time() - 86400);
$tomorrow  = gmdate('Y-m-d H:i:s', time() + 86400);
$next_week = gmdate('Y-m-d H:i:s', time() + (7 * 86400));
$last_week = gmdate('Y-m-d H:i:s', time() - (7 * 86400));

assert_test(
    "Draft remains 'draft' regardless of dates",
    outbound_evaluate_promotion_status(array('status' => 'draft', 'is_enabled' => 1, 'scheduled_start' => $yesterday, 'scheduled_end' => $tomorrow)) === 'draft'
);

assert_test(
    "Paused remains 'paused'",
    outbound_evaluate_promotion_status(array('status' => 'paused', 'is_enabled' => 1, 'scheduled_start' => $yesterday, 'scheduled_end' => $tomorrow)) === 'paused'
);

assert_test(
    "Archived remains 'archived'",
    outbound_evaluate_promotion_status(array('status' => 'archived', 'is_enabled' => 1, 'scheduled_start' => $yesterday, 'scheduled_end' => $tomorrow)) === 'archived'
);

assert_test(
    "Future start date automatically evaluates to 'scheduled'",
    outbound_evaluate_promotion_status(array('status' => 'active', 'is_enabled' => 1, 'scheduled_start' => $tomorrow, 'scheduled_end' => $next_week)) === 'scheduled'
);

assert_test(
    "Current date within validity window evaluates to 'active'",
    outbound_evaluate_promotion_status(array('status' => 'active', 'is_enabled' => 1, 'scheduled_start' => $yesterday, 'scheduled_end' => $tomorrow)) === 'active'
);

assert_test(
    "Past end date automatically evaluates to 'expired'",
    outbound_evaluate_promotion_status(array('status' => 'active', 'is_enabled' => 1, 'scheduled_start' => $last_week, 'scheduled_end' => $yesterday)) === 'expired'
);

assert_test(
    "Disabled active campaign evaluates to 'paused'",
    outbound_evaluate_promotion_status(array('status' => 'active', 'is_enabled' => 0, 'scheduled_start' => $yesterday, 'scheduled_end' => $tomorrow)) === 'paused'
);

// ---------------------------------------------------------
// 4. Role-Based Permissions
// ---------------------------------------------------------
echo "\nTEST GROUP 4: Role-Based Permissions\n";

$GLOBALS['mock_current_caps'] = array('manage_options');
assert_test(
    "Administrator with 'manage_options' can manage and publish promotions",
    outbound_can_manage_promotions('publish') === true
);

$GLOBALS['mock_current_caps'] = array('publish_posts');
assert_test(
    "Editor with 'publish_posts' can publish promotions",
    outbound_can_manage_promotions('publish') === true
);

$GLOBALS['mock_current_caps'] = array('edit_posts');
assert_test(
    "Author with only 'edit_posts' can draft but cannot publish",
    outbound_can_manage_promotions('edit') === true &&
    outbound_can_manage_promotions('publish') === false
);

$GLOBALS['mock_current_caps'] = array('read');
assert_test(
    "Subscriber with only 'read' is blocked from promotion operations",
    outbound_can_manage_promotions('edit') === false &&
    outbound_can_manage_promotions('publish') === false
);

// ---------------------------------------------------------
// Summary
// ---------------------------------------------------------
echo "\n=========================================================\n";
echo "TEST RESULTS: {$tests_passed} Passed, {$tests_failed} Failed\n";
echo "=========================================================\n";

if ($tests_failed > 0) {
    exit(1);
}
exit(0);

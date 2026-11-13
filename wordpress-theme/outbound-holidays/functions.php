<?php
/**
 * Outbound Holidays Standalone Theme Bootstrap.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

define('OUTBOUND_THEME_VERSION', '1.0.0');
define('OUTBOUND_DB_SCHEMA_VERSION', '1.4.0');
define('OUTBOUND_THEME_DIR', get_template_directory());
define('OUTBOUND_THEME_URI', get_template_directory_uri());

$outbound_modules = array(
    'inc/helpers.php',
    'inc/migrations.php',
    'inc/post-types.php',
    'inc/item-editors.php',
    'inc/snapshot.php',
    'inc/setup.php',
    'inc/meta-boxes.php',
    'inc/cms-hub.php',
    'inc/admin-settings.php',
    'inc/enquiries.php',
    'inc/newsletter.php',
    'inc/promotions.php',
    'inc/seo.php',
    'inc/migration.php',
);

foreach ($outbound_modules as $outbound_module) {
    $module_path = OUTBOUND_THEME_DIR . '/' . $outbound_module;
    if (file_exists($module_path)) {
        require_once $module_path;
    }
}

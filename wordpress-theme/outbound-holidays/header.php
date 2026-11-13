<?php
/**
 * Site Header Shell:
 * Emits WordPress SEO head metadata (`wp_head()`), JSON-LD, live WordPress `ContentSnapshot`
 * & native Blog posts payload (`#outbound-content` and `#outbound-wp-posts`), and opens `#root`
 * so the approved React frontend mounts identically to the standalone production site.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

$outbound_snapshot = function_exists('outbound_build_live_snapshot') ? outbound_build_live_snapshot() : array();
$outbound_wp_posts = function_exists('outbound_get_wp_blog_posts_payload') ? outbound_get_wp_blog_posts_payload() : array();
$outbound_active_promotions = function_exists('outbound_get_active_promotions') ? outbound_get_active_promotions() : array();
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-white text-[#1A2E35]'); ?>>
<?php wp_body_open(); ?>
<script id="outbound-content" type="application/json"><?php echo wp_json_encode($outbound_snapshot, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?></script>
<script id="outbound-wp-posts" type="application/json"><?php echo wp_json_encode($outbound_wp_posts, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?></script>
<script id="outbound-promotions" type="application/json"><?php echo wp_json_encode($outbound_active_promotions, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?></script>
<div id="root">

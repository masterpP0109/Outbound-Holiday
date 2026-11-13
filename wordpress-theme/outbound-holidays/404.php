<?php
/**
 * Standard 404 Template.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Page Not Found',
    'summary' => 'The page you are looking for is unavailable. Explore our Victoria Falls holidays and experiences.',
));
get_footer();

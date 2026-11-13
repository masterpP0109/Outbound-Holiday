<?php
/**
 * About Outbound Holidays Page (`/about`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'About Fungai Mtetwa & Outbound Holidays',
    'summary' => 'Personal Victoria Falls holiday planning informed by more than nine years in local tourism.',
));
get_footer();

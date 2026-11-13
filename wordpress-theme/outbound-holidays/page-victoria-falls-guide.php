<?php
/**
 * Victoria Falls Planning Guide Hub Page (`/victoria-falls-guide`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Victoria Falls Planning Guide',
    'summary' => 'Essential planning guidance written locally in Victoria Falls: seasons, visas, packing, itineraries, and budgets.',
));
get_footer();

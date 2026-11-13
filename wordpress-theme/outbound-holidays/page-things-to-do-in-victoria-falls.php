<?php
/**
 * Things to Do in Victoria Falls Directory Page (`/things-to-do-in-victoria-falls`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Things to Do in Victoria Falls',
    'summary' => 'Explore Victoria Falls activities, Zambezi sunset cruises, safaris, cultural experiences and day trips.',
));
get_footer();

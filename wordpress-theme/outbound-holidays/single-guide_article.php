<?php
/**
 * Single Victoria Falls Guide CPT Template (`/victoria-falls-guide/{slug}/`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => get_the_title() ?: 'Victoria Falls Planning Guide',
    'summary' => has_excerpt() ? get_the_excerpt() : 'Detailed planning guide written locally in Victoria Falls, Zimbabwe.',
));
get_footer();

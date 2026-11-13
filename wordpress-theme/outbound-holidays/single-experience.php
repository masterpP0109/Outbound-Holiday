<?php
/**
 * Single Experience CPT Template (`/things-to-do/{slug}/`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => get_the_title() ?: 'Victoria Falls Experience',
    'summary' => has_excerpt() ? get_the_excerpt() : 'Curated Victoria Falls experience with local transport and licensed guides.',
));
get_footer();

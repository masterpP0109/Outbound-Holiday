<?php
/**
 * Single Accommodation CPT Template (`/accommodation/{slug}/`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => get_the_title() ?: 'Victoria Falls Accommodation',
    'summary' => has_excerpt() ? get_the_excerpt() : 'Hand-picked Victoria Falls lodge or hotel vetted by local specialists.',
));
get_footer();

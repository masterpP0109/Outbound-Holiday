<?php
/**
 * Single Holiday Package CPT Template (`/packages/{slug}/`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => get_the_title() ?: 'Victoria Falls Holiday Package',
    'summary' => has_excerpt() ? get_the_excerpt() : 'Customisable Victoria Falls holiday package planned locally from start to finish.',
));
get_footer();

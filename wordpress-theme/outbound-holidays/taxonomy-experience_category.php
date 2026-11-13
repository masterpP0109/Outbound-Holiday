<?php
/**
 * Experience Category Taxonomy Archive (`/things-to-do/category/{slug}/`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => single_term_title('', false) ?: 'Victoria Falls Experiences',
    'summary' => 'Browse Victoria Falls experiences and activities curated by our local specialists.',
));
get_footer();

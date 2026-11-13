<?php
/**
 * Holiday Packages Directory Page (`/victoria-falls-packages`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Victoria Falls Holiday Packages',
    'summary' => 'Explore tailor-made Victoria Falls holiday packages for families, honeymoons, adventures and safaris.',
));
get_footer();

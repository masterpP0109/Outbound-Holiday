<?php
/**
 * Client Gallery Page (`/client-gallery`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Client Holiday Gallery',
    'summary' => 'Explore photos from Victoria Falls holidays, safaris and Zambezi experiences enjoyed by Outbound Holidays guests.',
));
get_footer();

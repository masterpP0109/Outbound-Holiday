<?php
/**
 * Contact Us Page (`/contact`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Contact Outbound Holidays',
    'summary' => 'Speak directly with our Victoria Falls local travel specialists.',
));
get_footer();

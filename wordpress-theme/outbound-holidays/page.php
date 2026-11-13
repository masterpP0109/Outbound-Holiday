<?php
/**
 * Standard WordPress Page Template (including About, Contact, Client Gallery, Directories & Custom Pages).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => get_the_title() ?: 'Outbound Holidays',
    'summary' => has_excerpt() ? get_the_excerpt() : 'Locally guided Victoria Falls holidays, accommodation, experiences, and travel advice.',
));
get_footer();

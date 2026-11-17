<?php
/**
 * WordPress Search Results (`search.php`).
 * Renders the React SPA Shell positioned directly on `/search` with live query context.
 *
 * @package OutboundHolidays
 */
get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Search Results | Outbound Holidays',
    'summary' => 'Search Victoria Falls accommodations, room types, activities, holiday packages, guides, and special offers.',
));
get_footer();

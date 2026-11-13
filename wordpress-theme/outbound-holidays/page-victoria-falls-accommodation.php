<?php
/**
 * Where to Stay Directory Page (`/victoria-falls-accommodation`).
 * Hydrates exact React `<AccommodationDirectoryPage>` + `<AccommodationAdvisor>` from WordPress CPT data.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Victoria Falls Accommodation',
    'summary' => 'Compare hand-picked Victoria Falls hotels, safari lodges, guest houses and self-catering stays.',
));
get_footer();

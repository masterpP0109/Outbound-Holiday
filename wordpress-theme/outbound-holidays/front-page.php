<?php
/**
 * Front Page Template (Homepage):
 * Preserves the exact React Homepage (TravelHero, QuickPlanningBar, FeaturedExperiences,
 * FeaturedPackages, WhereToStaySection, VicFallsGuide, WhyChooseOutbound, TravellerStories,
 * ClientGallery, FinalCtaBanner, Newsletter, Footer, MobileStickyCta) hydrated from WordPress.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => 'Victoria Falls Holidays',
    'summary' => 'Planned by locals, tailored to you. Discover trusted Victoria Falls lodges, hotels, experiences, safaris, and tailor-made holiday packages.',
));
get_footer();

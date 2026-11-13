<?php
/**
 * Semantic Blog/Archive SSR fallback inside `#root` replaced seamlessly by React `<BlogListingPage>`.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => is_category() ? single_cat_title('', false) : (is_tag() ? single_tag_title('', false) : 'Victoria Falls Travel Blog & Archives'),
    'summary' => 'Browse local travel tips, seasonal guides, itineraries, and stories from Victoria Falls.',
));

<?php
/**
 * Semantic SSR / Non-JS Crawler Fallback rendered inside `#root`.
 * Replaced seamlessly on client hydration by the full approved React SPA (`outbound-app.js`),
 * while preserving readable H1, summary, and links for search crawlers and zero-JS requests.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

$ssr_title   = $args['title'] ?? (function_exists('get_the_title') && get_the_title() ? get_the_title() : 'Victoria Falls Holidays | Outbound Holidays');
$ssr_summary = $args['summary'] ?? 'Plan your Victoria Falls holiday with trusted local specialists. Get honest advice on accommodation, activities, transfers, safaris and personalised itineraries built around your interests and budget.';
?>
<main class="max-w-5xl mx-auto px-6 py-16 space-y-6">
    <h1 class="font-serif text-4xl font-bold text-[#0B5E8E]"><?php echo esc_html((string) $ssr_title); ?></h1>
    <p class="text-base text-[#2F3A44] leading-relaxed"><?php echo esc_html((string) $ssr_summary); ?></p>
    <nav aria-label="<?php esc_attr_e('Primary Site Sections', 'outbound-holidays'); ?>" class="flex flex-wrap gap-4 text-sm font-semibold text-[#0B5E8E]">
        <a href="<?php echo esc_url(home_url('/')); ?>">Home</a>
        <a href="<?php echo esc_url(home_url('/things-to-do-in-victoria-falls/')); ?>">Things to Do</a>
        <a href="<?php echo esc_url(home_url('/victoria-falls-packages/')); ?>">Holiday Packages</a>
        <a href="<?php echo esc_url(home_url('/victoria-falls-accommodation/')); ?>">Where to Stay</a>
        <a href="<?php echo esc_url(home_url('/victoria-falls-guide/')); ?>">Victoria Falls Guide</a>
        <a href="<?php echo esc_url(home_url('/blog/')); ?>">Travel Blog</a>
        <a href="<?php echo esc_url(home_url('/client-gallery/')); ?>">Client Gallery</a>
        <a href="<?php echo esc_url(home_url('/about/')); ?>">About</a>
        <a href="<?php echo esc_url(home_url('/contact/')); ?>">Contact</a>
    </nav>
</main>

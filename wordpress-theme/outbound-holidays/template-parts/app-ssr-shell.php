<?php
/**
 * Elegant Pre-Hydration Shell & Semantic Crawler Fallback rendered inside `#root`.
 * While JavaScript bundles load, visitors see an elegant branded loading experience.
 * Replaced seamlessly on client hydration by the approved React SPA (`outbound-app.js`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

$ssr_title   = $args['title'] ?? (function_exists('get_the_title') && get_the_title() ? get_the_title() : 'Victoria Falls Holidays | Outbound Holidays');
$ssr_summary = $args['summary'] ?? 'Plan your Victoria Falls holiday with trusted local specialists. Get honest advice on accommodation, activities, transfers, safaris and personalised itineraries built around your interests and budget.';
$theme_uri   = defined('OUTBOUND_THEME_URI') ? OUTBOUND_THEME_URI : get_template_directory_uri();
$logo_url    = $theme_uri . '/assets/media/outbound-holidays-logo-dark.webp';
?>
<!-- Pre-Hydration Elegant Loading Screen -->
<div id="outbound-initial-loader" style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #FAF9F6; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; text-align: center;">
    <div style="max-width: 320px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px;">
        <img src="<?php echo esc_url($logo_url); ?>" alt="Outbound Holidays" style="width: 220px; max-width: 80%; height: auto; opacity: 0.95; display: block;" />
        
        <div style="width: 140px; height: 3px; background: rgba(11, 94, 142, 0.15); border-radius: 999px; overflow: hidden; position: relative;">
            <div style="position: absolute; top: 0; left: 0; height: 100%; width: 50%; background: linear-gradient(90deg, #0B5E8E, #C9A66B); border-radius: 999px; animation: outbound-pulse-bar 1.5s ease-in-out infinite;"></div>
        </div>
        
        <p style="margin: 0; font-size: 13px; font-weight: 500; color: #59645E; letter-spacing: 0.3px;">
            Preparing your Victoria Falls experience…
        </p>
    </div>
</div>

<style>
@keyframes outbound-pulse-bar {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(250%); }
}
</style>

<!-- Semantic SEO crawler text kept off-screen for web search indexing -->
<div class="sr-only" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">
    <h1><?php echo esc_html((string) $ssr_title); ?></h1>
    <p><?php echo esc_html((string) $ssr_summary); ?></p>
    <nav aria-label="<?php esc_attr_e('Primary Site Sections', 'outbound-holidays'); ?>">
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
</div>

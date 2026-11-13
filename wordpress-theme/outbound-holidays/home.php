<?php
/**
 * Blog Index Template (`/blog/`).
 * Hydrates exact React `<BlogListingPage>` from native WordPress Posts (`#outbound-wp-posts`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main class="max-w-5xl mx-auto px-6 py-16 space-y-6">
    <h1 class="font-serif text-4xl font-bold text-[#0B5E8E]">Victoria Falls Travel Blog</h1>
    <p class="text-base text-[#2F3A44]">Local insights, travel inspiration and practical advice from Victoria Falls.</p>
    <div class="grid gap-6 md:grid-cols-2">
        <?php while (have_posts()) : the_post(); ?>
            <article class="border border-gray-200 rounded-2xl p-6 space-y-2">
                <h2 class="font-serif text-2xl font-bold text-[#0D2833]"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                <p class="text-sm text-[#2F3A44]"><?php echo esc_html(get_the_excerpt()); ?></p>
            </article>
        <?php endwhile; ?>
    </div>
</main>
<?php
get_footer();

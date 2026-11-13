<?php
/**
 * Single WordPress Blog Post Template (`/blog/{slug}/`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main class="max-w-4xl mx-auto px-6 py-16 space-y-6">
    <?php while (have_posts()) : the_post(); ?>
        <article class="space-y-4">
            <h1 class="font-serif text-4xl font-bold text-[#0B5E8E]"><?php the_title(); ?></h1>
            <div class="outbound-wp-prose text-base text-[#2F3A44] leading-relaxed">
                <?php echo wp_kses_post(get_the_content()); ?>
            </div>
        </article>
    <?php endwhile; ?>
</main>
<?php
get_footer();

<?php
/**
 * Newsletter Subscription Partial matching src/components/common/Newsletter.tsx
 * Supports $args['compact'] = true (Blog cards/sidebar) or false (Full homepage band).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

$compact = !empty($args['compact']);
$source  = !empty($args['source']) ? (string) $args['source'] : ($compact ? 'blog' : 'homepage');

if ($compact) : ?>
    <div class="bg-[#0D2833] text-white rounded-2xl p-6 shadow-md border border-[#C9A66B]/30">
        <div class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#E5C989] mb-2">
            <?php echo outbound_svg_icon('sparkles', 'w-3.5 h-3.5'); ?>
            <span>Travel Club Updates</span>
        </div>
        <h3 class="font-serif text-xl font-bold text-white mb-2">Get Victoria Falls Insider Notes</h3>
        <p class="text-xs text-gray-300 leading-relaxed mb-4">
            Monthly seasonal water-level briefs, new lodge openings &amp; local planning insights. Zero spam.
        </p>
        <form data-newsletter-form data-source="<?php echo esc_attr($source); ?>" class="space-y-2.5">
            <input type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">
            <input type="email" name="email" required placeholder="Enter your email address"
                   class="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A66B]">
            <button type="submit" class="w-full py-2.5 px-4 rounded-xl bg-[#C9A66B] hover:bg-[#b59155] text-[#0D2833] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer">
                Subscribe
            </button>
            <p data-newsletter-feedback class="hidden text-xs font-medium pt-1"></p>
        </form>
    </div>
<?php else : ?>
    <section id="newsletter-section" class="py-16 bg-gradient-to-br from-[#0D2833] via-[#0B5E8E] to-[#0D2833] text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C9A66B]/40 text-[#E5C989] text-xs font-bold uppercase tracking-widest mb-4">
                <?php echo outbound_svg_icon('mail', 'w-3.5 h-3.5'); ?>
                <span>Outbound Travel Club</span>
            </div>
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
                Receive Seasonal Victoria Falls Updates &amp; Local Guides
            </h2>
            <p class="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed">
                Monthly rainfall, Zambezi peak-flow calendars, safari availability notes and quiet-season savings straight from our specialists in Victoria Falls.
            </p>
            <form data-newsletter-form data-source="<?php echo esc_attr($source); ?>" class="max-w-xl mx-auto">
                <input type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">
                <div class="flex flex-col sm:flex-row gap-3">
                    <input type="email" name="email" required placeholder="Your email address..."
                           class="flex-1 px-4 py-3.5 rounded-xl bg-white text-[#0D2833] placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A66B]">
                    <button type="submit"
                            class="px-7 py-3.5 rounded-xl bg-[#C9A66B] hover:bg-[#b59155] text-[#0D2833] text-sm font-extrabold uppercase tracking-wider transition-all shrink-0 cursor-pointer">
                        Join Free
                    </button>
                </div>
                <p data-newsletter-feedback class="hidden text-sm font-semibold mt-3"></p>
                <p class="text-[11px] text-gray-300/90 mt-3">
                    Protected by double opt-in confirmation. Unsubscribe anytime with one click.
                </p>
            </form>
        </div>
    </section>
<?php endif; ?>

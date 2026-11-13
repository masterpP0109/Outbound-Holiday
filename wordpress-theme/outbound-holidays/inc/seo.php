<?php
/**
 * WordPress Native SEO, Canonical Tags, Open Graph, Schema.org JSON-LD,
 * Robots Rules, Sitemaps & Legacy 301 Redirects (Zero Plugin Dependency).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Pure helper to build Schema.org JSON-LD payloads cleanly for any route/object.
 *
 * @param array<string, mixed> $context
 * @return array<int, array<string, mixed>>
 */
function outbound_build_seo_schemas(array $context): array {
    $site_name = (string) ($context['siteName'] ?? 'Outbound Holidays');
    $site_url  = rtrim((string) ($context['siteUrl'] ?? 'https://outboundholiday.com'), '/');
    $url       = (string) ($context['canonicalUrl'] ?? $site_url . '/');
    $title     = (string) ($context['title'] ?? $site_name);
    $desc      = (string) ($context['description'] ?? '');
    $image     = (string) ($context['imageUrl'] ?? '');
    $kind      = (string) ($context['kind'] ?? 'website');

    $schemas = array();

    $schemas[] = array(
        '@context'    => 'https://schema.org',
        '@type'       => 'TravelAgency',
        'name'        => $site_name,
        'url'         => $site_url . '/',
        'telephone'   => (string) ($context['phone'] ?? '+263 714 701 721'),
        'email'       => (string) ($context['email'] ?? 'fungai@outboundholiday.com'),
        'address'     => array(
            '@type'           => 'PostalAddress',
            'streetAddress'   => (string) ($context['address'] ?? 'Suite 4, Mosi-oa-Tunya Commercial Centre'),
            'addressLocality' => 'Victoria Falls',
            'addressCountry'  => 'ZW',
        ),
    );

    if ($kind === 'post' || $kind === 'guide_article') {
        $schemas[] = array(
            '@context'         => 'https://schema.org',
            '@type'            => $kind === 'post' ? 'BlogPosting' : 'Article',
            'mainEntityOfPage' => array('@type' => 'WebPage', '@id' => $url),
            'headline'         => $title,
            'description'      => $desc,
            'image'            => $image !== '' ? array($image) : array(),
            'datePublished'    => (string) ($context['datePublished'] ?? gmdate('c')),
            'dateModified'     => (string) ($context['dateModified'] ?? gmdate('c')),
            'author'           => array('@type' => 'Organization', 'name' => $site_name),
            'publisher'        => array('@type' => 'Organization', 'name' => $site_name),
        );
    } elseif ($kind === 'accommodation') {
        $schemas[] = array(
            '@context'    => 'https://schema.org',
            '@type'       => 'LodgingBusiness',
            'name'        => $title,
            'description' => $desc,
            'url'         => $url,
            'image'       => $image,
            'address'     => array(
                '@type'           => 'PostalAddress',
                'addressLocality' => (string) ($context['location'] ?? 'Victoria Falls'),
                'addressCountry'  => 'ZW',
            ),
        );
    } elseif ($kind === 'experience') {
        $schemas[] = array(
            '@context'    => 'https://schema.org',
            '@type'       => 'TouristAttraction',
            'name'        => $title,
            'description' => $desc,
            'url'         => $url,
            'image'       => $image,
        );
    }

    if (!empty($context['breadcrumbs']) && is_array($context['breadcrumbs'])) {
        $items = array();
        foreach (array_values($context['breadcrumbs']) as $idx => $crumb) {
            $items[] = array(
                '@type'    => 'ListItem',
                'position' => $idx + 1,
                'name'     => (string) ($crumb['label'] ?? ''),
                'item'     => (string) ($crumb['url'] ?? $url),
            );
        }
        $schemas[] = array(
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => $items,
        );
    }

    if (!empty($context['faqs']) && is_array($context['faqs'])) {
        $entities = array();
        foreach ($context['faqs'] as $faq) {
            if (empty($faq['q']) || empty($faq['a'])) {
                continue;
            }
            $entities[] = array(
                '@type'          => 'Question',
                'name'           => (string) $faq['q'],
                'acceptedAnswer' => array('@type' => 'Answer', 'text' => (string) $faq['a']),
            );
        }
        if (!empty($entities)) {
            $schemas[] = array(
                '@context'   => 'https://schema.org',
                '@type'      => 'FAQPage',
                'mainEntity' => $entities,
            );
        }
    }

    return $schemas;
}

/**
 * Resolve current page SEO context in WordPress.
 *
 * @return array<string, mixed>
 */
function outbound_get_current_seo_context(): array {
    $cms  = outbound_get_site_options();
    $site = $cms['brand']['name'] ?: 'Outbound Holidays';

    $context = array(
        'siteName'    => $site,
        'siteUrl'     => home_url('/'),
        'title'       => $cms['hero']['title'] ?: ($site . ' — Victoria Falls Holidays'),
        'description' => $cms['hero']['subtitle'] ?: 'Your Victoria Falls Holiday Planned Locally From Start to Finish.',
        'canonicalUrl'=> home_url(add_query_arg(array())),
        'imageUrl'    => outbound_get_media_fallback('hero'),
        'kind'        => 'website',
        'phone'       => $cms['contact']['displayNumber'],
        'email'       => $cms['contact']['email'],
        'address'     => $cms['contact']['address'],
    );

    if (is_front_page()) {
        $context['canonicalUrl'] = home_url('/');
    } elseif (is_singular()) {
        $post = get_queried_object();
        if ($post instanceof WP_Post) {
            $meta_title = (string) get_post_meta($post->ID, '_outbound_seo_title', true);
            $meta_desc  = (string) get_post_meta($post->ID, '_outbound_seo_description', true);
            $canonical  = (string) get_post_meta($post->ID, '_outbound_seo_canonical', true);

            $context['title']        = $meta_title !== '' ? $meta_title : get_the_title($post);
            $context['description']  = $meta_desc !== '' ? $meta_desc : wp_strip_all_tags(get_the_excerpt($post) ?: $post->post_content);
            $context['description']  = wp_trim_words($context['description'], 28);
            $context['canonicalUrl'] = $canonical !== '' ? $canonical : get_permalink($post);
            $context['imageUrl']     = outbound_get_post_image_url($post->ID, 'outbound-hero');
            $context['kind']         = $post->post_type;
            $context['datePublished']= get_the_date('c', $post);
            $context['dateModified'] = get_the_modified_date('c', $post);
            $context['location']     = (string) get_post_meta($post->ID, '_outbound_location', true) ?: 'Victoria Falls';

            $faqs = json_decode((string) get_post_meta($post->ID, '_outbound_faqs_json', true), true);
            if (is_array($faqs)) {
                $context['faqs'] = $faqs;
            }
        }
    } elseif (is_home()) {
        $context['title']        = 'Victoria Falls Travel Blog & Specialist Insights | Outbound Holidays';
        $context['description']  = 'Local advice on Victoria Falls seasons, safaris, lodges, river cruises, and trip planning.';
        $context['canonicalUrl'] = get_permalink((int) get_option('page_for_posts')) ?: home_url('/blog/');
    } elseif (is_tax() || is_category() || is_tag()) {
        $term = get_queried_object();
        if ($term instanceof WP_Term) {
            $context['title']        = $term->name . ' | Outbound Holidays';
            $context['description']  = $term->description !== '' ? wp_strip_all_tags($term->description) : $context['description'];
            $context['canonicalUrl'] = get_term_link($term);
        }
    }

    return $context;
}

/**
 * Filter document_title_parts for clean SEO headlines (skip when Yoast/RankMath active to prevent duplicate titles).
 */
add_filter('document_title_parts', static function (array $parts): array {
    if (defined('WPSEO_VERSION') || defined('RANK_MATH_VERSION')) {
        return $parts;
    }
    $ctx = outbound_get_current_seo_context();
    if (!empty($ctx['title'])) {
        $parts['title'] = $ctx['title'];
    }
    return $parts;
});

/**
 * Emit meta description, OpenGraph, Twitter Cards & Schema.org JSON-LD in <head>.
 */
add_action('wp_head', static function (): void {
    $ctx = outbound_get_current_seo_context();
    $seo_plugin_active = (defined('WPSEO_VERSION') || defined('RANK_MATH_VERSION'));

    if (!$seo_plugin_active) {
        if (!empty($ctx['description'])) {
            echo '<meta name="description" content="' . esc_attr((string) $ctx['description']) . '">' . "\n";
        }
        if (!empty($ctx['canonicalUrl'])) {
            echo '<link rel="canonical" href="' . esc_url((string) $ctx['canonicalUrl']) . '">' . "\n";
        }
        echo '<meta property="og:site_name" content="' . esc_attr((string) $ctx['siteName']) . '">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr((string) $ctx['title']) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr((string) $ctx['description']) . '">' . "\n";
        echo '<meta property="og:type" content="' . esc_attr(in_array($ctx['kind'], array('post', 'guide_article'), true) ? 'article' : 'website') . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url((string) $ctx['canonicalUrl']) . '">' . "\n";
        if (!empty($ctx['imageUrl'])) {
            echo '<meta property="og:image" content="' . esc_url((string) $ctx['imageUrl']) . '">' . "\n";
            echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        }
    }

    $schemas = outbound_build_seo_schemas($ctx);
    foreach ($schemas as $schema) {
        echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "</script>\n";
    }
}, 5);

/**
 * Customize robots.txt rules preserving SEO crawl paths while blocking internal API/admin noise.
 */
add_filter('robots_txt', static function (string $output): string {
    $lines = array(
        'User-agent: *',
        'Allow: /',
        'Disallow: /wp-admin/',
        'Allow: /wp-admin/admin-ajax.php',
        'Disallow: /newsletter/confirmed/',
        'Sitemap: ' . home_url('/wp-sitemap.xml'),
        '',
    );
    return implode("\n", $lines);
});

/**
 * Perform clean 301 redirects for legacy shorthand routes to canonical WordPress URLs.
 */
add_action('template_redirect', static function (): void {
    $req_path = trim((string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH), '/');
    $redirects = array(
        'stays'       => '/victoria-falls-accommodation/',
        'experiences' => '/things-to-do-in-victoria-falls/',
        'packages'    => '/victoria-falls-packages/',
        'guide'       => '/victoria-falls-guide/',
        'guides'      => '/victoria-falls-guide/',
    );
    if (isset($redirects[$req_path])) {
        wp_safe_redirect(home_url($redirects[$req_path]), 301);
        exit;
    }
});

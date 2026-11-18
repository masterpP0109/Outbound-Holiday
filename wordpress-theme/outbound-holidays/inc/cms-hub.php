<?php
/**
 * Outbound CMS — Unified 14-Section Native WordPress Administration Interface.
 * Implements section-scoped lazy rendering, Draft -> Private Preview -> Publish workflow,
 * Media Library pickers, repeater controls, paginated CPT/SEO lists, and live Hero preview.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Return ordered metadata for all 14 numbered Outbound CMS sections.
 *
 * @return array<string, array{num:int,id:string,label:string,short:string,desc:string}>
 */
function outbound_cms_get_sections(): array {
    return array(
        'overview' => array(
            'num'   => 1,
            'id'    => 'overview',
            'label' => '1. Website Overview',
            'short' => '1. Overview',
            'desc'  => 'Live content counts, draft publishing status, and quick shortcuts across Outbound Holidays.',
        ),
        'homepage' => array(
            'num'   => 2,
            'id'    => 'homepage',
            'label' => '2. Homepage & Hero',
            'short' => '2. Homepage & Hero',
            'desc'  => 'Edit the hero headline, media, Quick Planning Bar, section visibility toggles, Why Outbound cards, and homepage curations.',
        ),
        'experiences' => array(
            'num'   => 3,
            'id'    => 'experiences',
            'label' => '3. Experiences',
            'short' => '3. Experiences',
            'desc'  => 'Manage Things to Do directory copy, featured homepage picks, and native Experience CPT entries.',
        ),
        'accommodation' => array(
            'num'   => 4,
            'id'    => 'accommodation',
            'label' => '4. Accommodation',
            'short' => '4. Accommodation',
            'desc'  => 'Manage Where to Stay section headings, featured properties, and native Accommodation CPT entries.',
        ),
        'packages' => array(
            'num'   => 5,
            'id'    => 'packages',
            'label' => '5. Holiday Packages',
            'short' => '5. Packages',
            'desc'  => 'Edit recommended packages headings, price disclaimers, featured packages, and Package CPT items.',
        ),
        'guides' => array(
            'num'   => 6,
            'id'    => 'guides',
            'label' => '6. Guides & Articles',
            'short' => '6. Guides & Blog',
            'desc'  => 'Manage Victoria Falls Planning Guides (CPT), native WordPress Blog Posts, and guide hub titles.',
        ),
        'galleries' => array(
            'num'   => 7,
            'id'    => 'galleries',
            'label' => '7. Galleries & Media',
            'short' => '7. Galleries',
            'desc'  => 'Manage Client Albums, photo collections, and WordPress Media Library assets.',
        ),
        'testimonials' => array(
            'num'   => 8,
            'id'    => 'testimonials',
            'label' => '8. Testimonials & Reviews',
            'short' => '8. Testimonials',
            'desc'  => 'Edit Traveller Stories headings, Google review ratings, and manage guest review items.',
        ),
        'about-contact' => array(
            'num'   => 9,
            'id'    => 'about-contact',
            'label' => '9. About & Contact',
            'short' => '9. About & Contact',
            'desc'  => 'Edit WhatsApp concierge number, contact email, office address, opening hours, and founder story.',
        ),
        'header' => array(
            'num'   => 10,
            'id'    => 'header',
            'label' => '10. Header & Navigation',
            'short' => '10. Header & Nav',
            'desc'  => 'Edit header banner strip, primary logo, navigation link labels, search placeholder, and CTA button.',
        ),
        'footer' => array(
            'num'   => 11,
            'id'    => 'footer',
            'label' => '11. Footer & Global Content',
            'short' => '11. Footer & Global',
            'desc'  => 'Edit footer summary, legal copyright, payment badges, Travel Club newsletter banner, and currency rates.',
        ),
        'builder' => array(
            'num'   => 12,
            'id'    => 'builder',
            'label' => '12. Holiday Builder Settings',
            'short' => '12. Holiday Builder',
            'desc'  => 'Configure stay tiers, activity add-on pricing, durations, and builder images.',
        ),
        'design' => array(
            'num'   => 13,
            'id'    => 'design',
            'label' => '13. Design & Layout',
            'short' => '13. Design & Layout',
            'desc'  => 'Adjust global brand color tokens safely with one-click reset to the original React palette.',
        ),
        'seo' => array(
            'num'   => 14,
            'id'    => 'seo',
            'label' => '14. SEO & Publishing',
            'short' => '14. SEO & Publish',
            'desc'  => 'Edit per-route SEO meta titles and descriptions, preview unpublished drafts, and publish changes.',
        ),
    );
}

/**
 * Escaping & sanitization shims so pure functions run cleanly both in WP and headless PHP unit tests.
 */
function outbound_cms_esc_attr(string $val): string {
    return function_exists('esc_attr') ? (string) esc_attr($val) : htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
}

function outbound_cms_esc_html(string $val): string {
    return function_exists('esc_html') ? (string) esc_html($val) : htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
}

function outbound_cms_esc_url(string $val): string {
    return function_exists('esc_url') ? (string) esc_url($val) : htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
}

function outbound_cms_sanitize_text(string $val): string {
    if (function_exists('sanitize_text_field')) {
        return (string) sanitize_text_field($val);
    }
    return trim(strip_tags($val));
}

function outbound_cms_sanitize_textarea(string $val): string {
    if (function_exists('sanitize_textarea_field')) {
        return (string) sanitize_textarea_field($val);
    }
    return trim(strip_tags($val));
}

function outbound_cms_sanitize_url(string $val): string {
    $clean = trim($val);
    if ($clean === '') {
        return '';
    }
    if (function_exists('esc_url_raw')) {
        return (string) esc_url_raw($clean);
    }
    return filter_var($clean, FILTER_SANITIZE_URL) ?: '';
}

function outbound_cms_sanitize_hex(string $val, string $fallback): string {
    $clean = trim($val);
    if (preg_match('/^#[0-9a-fA-F]{6}$/', $clean)) {
        return strtoupper($clean);
    }
    return $fallback;
}

/**
 * Transform and sanitize incoming section POST form data into a clean CMS patch payload.
 * Used both on Save Draft and Publish Changes.
 *
 * @param array<string, mixed> $raw
 * @return array<string, mixed>
 */
function outbound_cms_sanitize_section_patch(string $section, array $raw): array {
    $patch = array();

    $ed_strings = array();
    if (!empty($raw['ed']) && is_array($raw['ed'])) {
        foreach ($raw['ed'] as $k => $v) {
            if (!is_string($k) || $k === '') {
                continue;
            }
            $str = is_string($v) ? $v : '';
            if (str_contains(strtolower($k), 'image') || str_contains(strtolower($k), 'logo') || str_contains(strtolower($k), 'url') || str_contains(strtolower($k), 'fallstour1')) {
                $ed_strings[$k] = outbound_cms_sanitize_url($str);
            } elseif (strlen($str) > 140 || str_contains($str, "\n")) {
                $ed_strings[$k] = outbound_cms_sanitize_textarea($str);
            } else {
                $ed_strings[$k] = outbound_cms_sanitize_text($str);
            }
        }
        if (!empty($ed_strings['travel/FinalCtaBanner.backgroundImage'])) {
            $ed_strings['travel/FinalCtaBanner.fallsTour1'] = $ed_strings['travel/FinalCtaBanner.backgroundImage'];
        }
    }
    if (!empty($ed_strings)) {
        $patch['editorial_strings'] = $ed_strings;
    }

    if (!empty($raw['ed_struct']) && is_array($raw['ed_struct'])) {
        $ed_structs = array();
        foreach ($raw['ed_struct'] as $sk => $sv) {
            if (!is_string($sk) || $sk === '') {
                continue;
            }
            $url = outbound_cms_sanitize_url(is_string($sv) ? $sv : '');
            if ($url !== '') {
                $ed_structs[$sk] = $url;
            }
        }
        if (!empty($ed_structs)) {
            $patch['editorial_structures'] = $ed_structs;
        }
    }

    if ($section === 'homepage') {
        $toggle_keys = array(
            'showPlanYourHoliday',
            'showQuickPlanning',
            'showExperiences',
            'showPackages',
            'showWhereToStay',
            'showGuides',
            'showWhyOutbound',
            'showStories',
            'showClientGallery',
            'showNewsletter',
            'showFinalCta',
        );
        $hp_sec = array();
        $posted_vis = isset($raw['vis']) && is_array($raw['vis']) ? $raw['vis'] : array();
        foreach ($toggle_keys as $tk) {
            $hp_sec[$tk] = !empty($posted_vis[$tk]);
        }
        $patch['site_options'] = array('homepageSections' => $hp_sec);

        if (isset($raw['featured']) && is_array($raw['featured'])) {
            $feat = array();
            foreach (array('accommodationIds', 'experienceIds', 'packageIds') as $fk) {
                $vals = isset($raw['featured'][$fk]) && is_array($raw['featured'][$fk]) ? $raw['featured'][$fk] : array();
                $feat[$fk] = array_values(array_filter(array_map('outbound_cms_sanitize_text', array_map('strval', $vals))));
            }
            $patch['featured'] = $feat;
        }

        if (isset($raw['featured_overrides']) && is_array($raw['featured_overrides'])) {
            $overrides = array();
            foreach (array('experiences', 'accommodations', 'packages') as $kind) {
                if (empty($raw['featured_overrides'][$kind]) || !is_array($raw['featured_overrides'][$kind])) {
                    continue;
                }
                $overrides[$kind] = array();
                foreach ($raw['featured_overrides'][$kind] as $item_key => $fields) {
                    $clean_key = outbound_cms_sanitize_text((string) $item_key);
                    if ($clean_key === '' || !is_array($fields)) {
                        continue;
                    }
                    $entry = array();
                    if (isset($fields['image'])) {
                        $img_url = outbound_cms_sanitize_url((string) $fields['image']);
                        if ($img_url !== '') {
                            $entry['image'] = $img_url;
                        }
                    }
                    if (isset($fields['title'])) {
                        $t = outbound_cms_sanitize_text((string) $fields['title']);
                        if ($t !== '') {
                            $entry['title'] = $t;
                        }
                    }
                    if (isset($fields['badge'])) {
                        $entry['badge'] = outbound_cms_sanitize_text((string) $fields['badge']);
                    }
                    if (isset($fields['duration'])) {
                        $entry['duration'] = outbound_cms_sanitize_text((string) $fields['duration']);
                    }
                    if (isset($fields['price']) && $fields['price'] !== '') {
                        $entry['price'] = max(0, (float) $fields['price']);
                    }
                    if (isset($fields['description'])) {
                        $entry['description'] = outbound_cms_sanitize_textarea((string) $fields['description']);
                    }
                    if (!empty($entry)) {
                        $overrides[$kind][$clean_key] = $entry;
                    }
                }
            }
            $patch['featured_overrides'] = $overrides;
        }

        if (isset($raw['why_cards']) && is_array($raw['why_cards'])) {
            $cards = array();
            $allowed_icons = array('ShieldCheck', 'MapPin', 'Sparkles', 'Headset');
            foreach ($raw['why_cards'] as $row) {
                if (!is_array($row)) {
                    continue;
                }
                $title = outbound_cms_sanitize_text((string) ($row['title'] ?? ''));
                $desc  = outbound_cms_sanitize_textarea((string) ($row['description'] ?? ''));
                $label = outbound_cms_sanitize_text((string) ($row['label'] ?? ''));
                $icon  = outbound_cms_sanitize_text((string) ($row['iconName'] ?? 'ShieldCheck'));
                if (!in_array($icon, $allowed_icons, true)) {
                    $icon = 'ShieldCheck';
                }
                if ($title !== '' || $desc !== '') {
                    $cards[] = array(
                        'iconName'    => $icon,
                        'title'       => $title,
                        'description' => $desc,
                        'label'       => $label,
                    );
                }
            }
            if (!empty($cards)) {
                if (!isset($patch['editorial_structures']) || !is_array($patch['editorial_structures'])) {
                    $patch['editorial_structures'] = array();
                }
                $patch['editorial_structures']['travel/WhyChooseOutbound.section1'] = $cards;
            }
        }
    } elseif ($section === 'testimonials') {
        if (isset($raw['reviews']) && is_array($raw['reviews'])) {
            $clean_reviews = array();
            foreach ($raw['reviews'] as $idx => $r) {
                if (!is_array($r)) {
                    continue;
                }
                $author  = outbound_cms_sanitize_text((string) ($r['author'] ?? ''));
                $comment = outbound_cms_sanitize_textarea((string) ($r['comment'] ?? ''));
                if ($author === '' && $comment === '') {
                    continue;
                }
                $rating = max(1, min(5, (int) ($r['rating'] ?? 5)));
                $clean_reviews[] = array(
                    'id'            => outbound_cms_sanitize_text((string) ($r['id'] ?? ('rev-' . ($idx + 1)))),
                    'author'        => $author ?: 'Verified Traveller',
                    'roleOrCity'    => outbound_cms_sanitize_text((string) ($r['roleOrCity'] ?? 'Victoria Falls Guest')),
                    'date'          => outbound_cms_sanitize_text((string) ($r['date'] ?? gmdate('F Y'))),
                    'title'         => outbound_cms_sanitize_text((string) ($r['title'] ?? 'Memorable Victoria Falls Holiday')),
                    'comment'       => $comment,
                    'rating'        => $rating,
                    'type'          => 'travel',
                    'verifiedBuyer' => !empty($r['verifiedBuyer']),
                    'avatar'        => outbound_cms_sanitize_url((string) ($r['avatar'] ?? '')) ?: outbound_get_media_fallback('falls'),
                );
            }
            if (!empty($clean_reviews)) {
                $patch['reviews'] = $clean_reviews;
            }
        }
    } elseif ($section === 'about-contact') {
        if (isset($raw['contact']) && is_array($raw['contact'])) {
            $email = function_exists('sanitize_email')
                ? sanitize_email((string) ($raw['contact']['email'] ?? ''))
                : filter_var((string) ($raw['contact']['email'] ?? ''), FILTER_SANITIZE_EMAIL);
            $patch['site_options'] = array(
                'contact' => array(
                    'whatsappNumber' => preg_replace('/[^0-9]/', '', (string) ($raw['contact']['whatsappNumber'] ?? '263714701721')),
                    'displayNumber'  => outbound_cms_sanitize_text((string) ($raw['contact']['displayNumber'] ?? '')),
                    'email'          => (string) $email,
                    'address'        => outbound_cms_sanitize_text((string) ($raw['contact']['address'] ?? '')),
                    'hours'          => outbound_cms_sanitize_text((string) ($raw['contact']['hours'] ?? '')),
                ),
            );
            if (!empty($patch['site_options']['contact']['address'])) {
                $patch['editorial_strings']['common/Footer.text4'] = $patch['site_options']['contact']['address'];
                $patch['editorial_strings']['travel/ContactUsView.text7'] = $patch['site_options']['contact']['address'];
            }
        }
    } elseif ($section === 'footer') {
        if (isset($raw['social']) && is_array($raw['social'])) {
            $patch['site_options'] = array(
                'social' => array(
                    'facebook'  => outbound_cms_sanitize_url((string) ($raw['social']['facebook'] ?? '')),
                    'instagram' => outbound_cms_sanitize_url((string) ($raw['social']['instagram'] ?? '')),
                    'youtube'   => outbound_cms_sanitize_url((string) ($raw['social']['youtube'] ?? '')),
                ),
                'legal' => array(
                    'copyright' => outbound_cms_sanitize_text((string) ($raw['ed']['common/Footer.text17'] ?? '')),
                ),
            );
        }
        if (isset($raw['rates']) && is_array($raw['rates'])) {
            $clean_rates = array();
            foreach ($raw['rates'] as $code => $cfg) {
                $c = strtoupper(preg_replace('/[^A-Z]/', '', (string) $code));
                if ($c === '' || $c === 'ZWL' || !is_array($cfg)) {
                    continue;
                }
                $rate = (float) ($cfg['rate'] ?? 1);
                if ($c === 'USD') {
                    $rate = 1.0;
                }
                if ($rate > 0 && is_finite($rate)) {
                    $clean_rates[$c] = array(
                        'symbol' => outbound_cms_sanitize_text((string) ($cfg['symbol'] ?? $c)),
                        'rate'   => round($rate, 6),
                    );
                }
            }
            if (!empty($clean_rates)) {
                $patch['currency_rates'] = $clean_rates;
            }
        }
    } elseif ($section === 'header') {
        $nav_out = array();
        if (isset($raw['nav_items']) && is_array($raw['nav_items'])) {
            $clean_nav = array();
            $legacy_ed_map = array(
                'guide'         => 'common/Header.text5',
                'experiences'   => 'common/Header.text6',
                'accommodation' => 'common/Header.text7',
                'packages'      => 'common/Header.text8',
                'gallery'       => 'common/Header.text9',
                'about'         => 'common/Header.text10',
                'contact'       => 'common/Header.text11',
            );
            foreach ($raw['nav_items'] as $nidx => $ni) {
                if (!is_array($ni)) {
                    continue;
                }
                $label = outbound_cms_sanitize_text((string) ($ni['label'] ?? ''));
                if ($label === '') {
                    continue;
                }
                $nid  = sanitize_title((string) ($ni['id'] ?? $label)) ?: ('nav-' . ($nidx + 1));
                $dest = trim((string) ($ni['destination'] ?? '/'));
                if ($dest === '__custom__') {
                    $dest = trim((string) ($ni['customDestination'] ?? '/'));
                } elseif (!empty($ni['customDestination']) && ($dest === '' || $dest === '__custom__')) {
                    $dest = trim((string) $ni['customDestination']);
                }
                if ($dest === '/experiences') {
                    $dest = '/things-to-do-in-victoria-falls';
                } elseif ($dest === '/accommodation') {
                    $dest = '/victoria-falls-accommodation';
                }
                if ($dest !== 'whatsapp' && !preg_match('/^https?:\/\//i', $dest)) {
                    $dest = '/' . ltrim($dest, '/');
                    if ($dest === '//') {
                        $dest = '/';
                    }
                }
                $clean_nav[] = array(
                    'id'          => $nid,
                    'label'       => $label,
                    'destination' => $dest,
                    'showDesktop' => !empty($ni['showDesktop']),
                    'showMobile'  => !empty($ni['showMobile']),
                    'order'       => isset($ni['order']) && is_numeric($ni['order']) ? (int) $ni['order'] : ($nidx + 1),
                );
                if (isset($legacy_ed_map[$nid])) {
                    $patch['editorial_strings'][$legacy_ed_map[$nid]] = $label;
                }
            }
            usort($clean_nav, static fn($a, $b) => ((int) $a['order']) <=> ((int) $b['order']));
            if (!empty($clean_nav)) {
                $nav_out['headerItems'] = $clean_nav;
            }
        }
        if (isset($raw['header_cta_action'])) {
            $cta_act = trim((string) $raw['header_cta_action']);
            if ($cta_act === '/experiences') {
                $cta_act = '/things-to-do-in-victoria-falls';
            } elseif ($cta_act === '/accommodation') {
                $cta_act = '/victoria-falls-accommodation';
            }
            $nav_out['primaryCtaAction'] = $cta_act !== '' ? $cta_act : 'modal';
        }
        if (!empty($nav_out)) {
            $patch['navigation'] = $nav_out;
        }
    } elseif ($section === 'builder') {
        $suggested_ids = array();
        $excluded_ids  = array();
        if (isset($raw['stay_tiers']) && is_array($raw['stay_tiers'])) {
            $tiers = array();
            foreach ($raw['stay_tiers'] as $idx => $t) {
                if (!is_array($t)) {
                    continue;
                }
                $name = outbound_cms_sanitize_text((string) ($t['name'] ?? ''));
                if ($name === '') {
                    continue;
                }
                $hl_raw = (string) ($t['highlights_text'] ?? '');
                $hl_arr = $hl_raw !== ''
                    ? array_values(array_filter(array_map('outbound_cms_sanitize_text', preg_split('/\r\n|\r|\n/', $hl_raw) ?: array())))
                    : array();
                $tiers[] = array(
                    'id'               => sanitize_title((string) ($t['id'] ?? $name)) ?: ('tier-' . ($idx + 1)),
                    'name'             => $name,
                    'tagline'          => outbound_cms_sanitize_text((string) ($t['tagline'] ?? '')),
                    'pricePerNightUSD' => max(0, (float) ($t['pricePerNightUSD'] ?? ($t['startingPrice'] ?? 150))),
                    'imageUrl'         => outbound_cms_sanitize_url((string) ($t['imageUrl'] ?? '')) ?: outbound_get_media_fallback('hero'),
                    'desc'             => outbound_cms_sanitize_textarea((string) ($t['desc'] ?? '')),
                    'highlights'       => !empty($hl_arr) ? $hl_arr : array('Breakfast included', 'Local specialist support'),
                );
            }
            if (!empty($tiers)) {
                $patch['builder_stay_tiers'] = $tiers;
            }
        }
        if (isset($raw['builder_activities']) && is_array($raw['builder_activities'])) {
            $acts = array();
            foreach ($raw['builder_activities'] as $idx => $a) {
                if (!is_array($a)) {
                    continue;
                }
                $title = outbound_cms_sanitize_text((string) ($a['title'] ?? ''));
                if ($title === '') {
                    continue;
                }
                $act_seq = count($acts) + 1;
                $raw_id  = (string) ($a['id'] ?? (is_string($idx) ? $idx : $title));
                $aid     = sanitize_title($raw_id) ?: ('act-' . $act_seq);
                $exp_id  = outbound_cms_sanitize_text((string) ($a['experienceId'] ?? ''));
                $include = !empty($a['includeInBuilder']);
                $suggest = $include && !empty($a['suggestedByDefault']);
                $order   = isset($a['displayOrder']) && is_numeric($a['displayOrder']) ? (int) $a['displayOrder'] : $act_seq;
                $ovr_on  = !empty($a['priceOverrideEnabled']);

                if (!$include) {
                    $excluded_ids[] = $aid;
                    if ($exp_id !== '') {
                        $excluded_ids[] = $exp_id;
                    }
                }
                if ($suggest) {
                    $suggested_ids[] = $aid;
                }

                $acts[] = array(
                    'id'                   => $aid,
                    'experienceId'         => $exp_id,
                    'includeInBuilder'     => $include,
                    'suggestedByDefault'   => $suggest,
                    'displayOrder'         => $order,
                    'priceOverrideEnabled' => $ovr_on,
                    'priceSource'          => $ovr_on ? 'builder-override' : 'experience-catalog',
                    'priceBasis'           => in_array((string) ($a['priceBasis'] ?? ''), array('per_adult', 'per_person', 'per_child', 'per_group', 'per_vehicle', 'on_request'), true) ? (string) $a['priceBasis'] : 'per_adult',
                    'childRateUnder11USD'  => isset($a['childRateUnder11USD']) && $a['childRateUnder11USD'] !== '' && is_numeric($a['childRateUnder11USD']) ? max(0, (float) $a['childRateUnder11USD']) : null,
                    'childRate11PlusUSD'   => isset($a['childRate11PlusUSD']) && $a['childRate11PlusUSD'] !== '' && is_numeric($a['childRate11PlusUSD']) ? max(0, (float) $a['childRate11PlusUSD']) : null,
                    'rateStatus'           => ((string) ($a['rateStatus'] ?? 'provisional')) === 'confirmed' ? 'confirmed' : 'provisional',
                    'validFrom'            => outbound_cms_sanitize_text((string) ($a['validFrom'] ?? '')),
                    'validTo'              => outbound_cms_sanitize_text((string) ($a['validTo'] ?? '')),
                    'defaultTimeSlot'      => in_array((string) ($a['defaultTimeSlot'] ?? ''), array('morning', 'afternoon', 'sunset', 'evening', 'to-be-arranged'), true) ? (string) $a['defaultTimeSlot'] : 'to-be-arranged',
                    'departureTimes'       => !empty($a['departureTimesCsv'])
                        ? array_values(array_filter(array_map('outbound_cms_sanitize_text', explode(',', (string) $a['departureTimesCsv']))))
                        : (!empty($a['departureTimes'])
                            ? array_values(array_filter(array_map('outbound_cms_sanitize_text', is_array($a['departureTimes']) ? $a['departureTimes'] : explode(',', (string) $a['departureTimes']))))
                            : array()),
                    'title'                => $title,
                    'duration'             => outbound_cms_sanitize_text((string) ($a['duration'] ?? 'Half Day')),
                    'priceUSD'             => max(0, (float) ($a['priceUSD'] ?? ($a['priceAmount'] ?? 65))),
                    'imageUrl'             => outbound_cms_sanitize_url((string) ($a['imageUrl'] ?? ($a['image'] ?? ''))) ?: outbound_get_media_fallback('falls'),
                    'badge'                => outbound_cms_sanitize_text((string) ($a['badge'] ?? 'Popular')),
                    'shortDesc'            => outbound_cms_sanitize_textarea((string) ($a['shortDesc'] ?? '')),
                );
            }
            usort($acts, static fn($x, $y) => ((int) ($x['displayOrder'] ?? 999)) <=> ((int) ($y['displayOrder'] ?? 999)));
            $patch['builder_activities'] = $acts;
            $patch['builder_excluded_experiences'] = array_values(array_unique(array_filter($excluded_ids)));
        }
        $transfers_out = null;
        if (isset($raw['builder_transfers']) && is_array($raw['builder_transfers'])) {
            $transfers_out = array();
            foreach ($raw['builder_transfers'] as $tidx => $tr) {
                if (!is_array($tr)) {
                    continue;
                }
                $ttitle = outbound_cms_sanitize_text((string) ($tr['title'] ?? ''));
                if ($ttitle === '') {
                    continue;
                }
                $tid = sanitize_title((string) ($tr['id'] ?? $ttitle)) ?: ('tr-' . ($tidx + 1));
                $raw_price = $tr['priceUSD'] ?? '';
                $tbasis = (string) ($tr['priceBasis'] ?? 'per_vehicle');
                if (!in_array($tbasis, array('per_vehicle', 'per_vehicle_return', 'per_person', 'per_group', 'on_request'), true)) {
                    $tbasis = 'per_vehicle';
                }
                $tvcat = (string) ($tr['visitorCategory'] ?? 'all');
                if (!in_array($tvcat, array('all', 'international', 'zimbabwe_resident', 'sadc_resident'), true)) {
                    $tvcat = 'all';
                }
                $transfers_out[] = array(
                    'id'                  => $tid,
                    'title'               => $ttitle,
                    'badge'               => outbound_cms_sanitize_text((string) ($tr['badge'] ?? 'Transfer')) ?: 'Transfer',
                    'desc'                => outbound_cms_sanitize_textarea((string) ($tr['desc'] ?? ($tr['route'] ?? 'Victoria Falls transfer'))),
                    'route'               => outbound_cms_sanitize_text((string) ($tr['route'] ?? '')),
                    'priceUSD'            => ($raw_price !== '' && is_numeric($raw_price)) ? max(0, (float) $raw_price) : null,
                    'priceBasis'          => $tbasis,
                    'childPriceUSD'       => isset($tr['childPriceUSD']) && $tr['childPriceUSD'] !== '' && is_numeric($tr['childPriceUSD']) ? max(0, (float) $tr['childPriceUSD']) : null,
                    'child11PlusPriceUSD' => isset($tr['child11PlusPriceUSD']) && $tr['child11PlusPriceUSD'] !== '' && is_numeric($tr['child11PlusPriceUSD']) ? max(0, (float) $tr['child11PlusPriceUSD']) : null,
                    'visitorCategory'     => $tvcat,
                    'validFrom'           => outbound_cms_sanitize_text((string) ($tr['validFrom'] ?? '')),
                    'validTo'             => outbound_cms_sanitize_text((string) ($tr['validTo'] ?? '')),
                    'rateStatus'          => ((string) ($tr['rateStatus'] ?? 'provisional')) === 'confirmed' ? 'confirmed' : 'provisional',
                    'includeInBuilder'    => !empty($tr['includeInBuilder']),
                    'displayOrder'        => isset($tr['displayOrder']) && is_numeric($tr['displayOrder']) ? (int) $tr['displayOrder'] : ($tidx + 1),
                );
            }
            usort($transfers_out, static fn($x, $y) => ((int) ($x['displayOrder'] ?? 999)) <=> ((int) ($y['displayOrder'] ?? 999)));
        }
        $bc_raw = isset($raw['builder_config']) && is_array($raw['builder_config']) ? $raw['builder_config'] : array();
        $avail_nights = array();
        if (!empty($bc_raw['availableNightsCsv'])) {
            foreach (explode(',', (string) $bc_raw['availableNightsCsv']) as $chunk) {
                $n = (int) trim($chunk);
                if ($n >= 1 && $n <= 30 && !in_array($n, $avail_nights, true)) {
                    $avail_nights[] = $n;
                }
            }
        }
        $bc_out = array(
            'defaultStayTierId'    => sanitize_title((string) ($bc_raw['defaultStayTierId'] ?? 'comfort-plus')) ?: 'comfort-plus',
            'defaultNights'        => max(1, min(30, (int) ($bc_raw['defaultNights'] ?? 3))),
            'availableNights'      => !empty($avail_nights) ? $avail_nights : array(2, 3, 4, 5),
            'suggestedActivityIds' => array_values(array_unique($suggested_ids)),
        );
        if (isset($bc_raw['entryCopy']) && is_array($bc_raw['entryCopy'])) {
            $ec_raw = $bc_raw['entryCopy'];
            $ec_out = array();
            foreach (array('heading', 'helpCardTitle', 'helpCardDesc', 'whatsappCtaLabel', 'quickEnquiryCtaLabel', 'itineraryCardTitle', 'itineraryCardDesc', 'itineraryCtaLabel') as $eck) {
                $ecv = outbound_cms_sanitize_text((string) ($ec_raw[$eck] ?? ''));
                if ($ecv !== '') {
                    $ec_out[$eck] = $ecv;
                }
            }
            if (!empty($ec_out)) {
                $bc_out['entryCopy'] = $ec_out;
            }
        }
        if (!empty($bc_raw['enabledSectionsPresent'])) {
            $es_raw = isset($bc_raw['enabledSections']) && is_array($bc_raw['enabledSections']) ? $bc_raw['enabledSections'] : array();
            $bc_out['enabledSections'] = array(
                'datesGuests' => !empty($es_raw['datesGuests']),
                'stay'        => !empty($es_raw['stay']),
                'activities'  => !empty($es_raw['activities']),
                'transfers'   => !empty($es_raw['transfers']),
            );
        }
        if (is_array($transfers_out)) {
            $bc_out['transferOptions'] = $transfers_out;
        }
        $patch['builder_config'] = $bc_out;
    } elseif ($section === 'design') {
        $d = isset($raw['design']) && is_array($raw['design']) ? $raw['design'] : array();
        $patch['design_tokens'] = array(
            'primaryColor'   => outbound_cms_sanitize_hex((string) ($d['primaryColor'] ?? ''), '#0B5E8E'),
            'secondaryColor' => outbound_cms_sanitize_hex((string) ($d['secondaryColor'] ?? ''), '#C9A66B'),
            'accentColor'    => outbound_cms_sanitize_hex((string) ($d['accentColor'] ?? ''), '#E67E22'),
            'greenColor'     => outbound_cms_sanitize_hex((string) ($d['greenColor'] ?? ''), '#3F6B3C'),
            'darkColor'      => outbound_cms_sanitize_hex((string) ($d['darkColor'] ?? ''), '#2F3A44'),
        );
    } elseif ($section === 'seo') {
        if (isset($raw['route_seo']) && is_array($raw['route_seo'])) {
            $clean_seo = array();
            foreach ($raw['route_seo'] as $rpath => $meta) {
                if (!is_string($rpath) || !is_array($meta)) {
                    continue;
                }
                $title = outbound_cms_sanitize_text((string) ($meta['title'] ?? ''));
                $desc  = outbound_cms_sanitize_textarea((string) ($meta['description'] ?? ''));
                if ($title !== '' || $desc !== '') {
                    $clean_seo[$rpath] = array(
                        'title'       => $title,
                        'description' => $desc,
                    );
                }
            }
            if (!empty($clean_seo)) {
                $patch['route_seo'] = $clean_seo;
            }
        }
    }

    return $patch;
}

/**
 * Resolve effective field value from live+draft snapshot for display in CMS editor inputs.
 *
 * @param array<string, mixed> $snapshot
 */
function outbound_cms_get_ed(array $snapshot, string $key, string $fallback = ''): string {
    $val = $snapshot['site']['editorial']['strings'][$key] ?? null;
    if (is_string($val) && $val !== '') {
        return trim($val);
    }
    $sval = $snapshot['site']['editorial']['structures'][$key] ?? null;
    if (is_string($sval) && $sval !== '') {
        return trim($sval);
    }
    return $fallback;
}

/**
 * Read a string/image URL from `site.editorial.structures` (falling back to `strings`).
 *
 * @param array<string, mixed> $snapshot
 */
function outbound_cms_get_ed_struct(array $snapshot, string $key, string $fallback = ''): string {
    $sval = $snapshot['site']['editorial']['structures'][$key] ?? null;
    if (is_string($sval) && $sval !== '') {
        return trim($sval);
    }
    return outbound_cms_get_ed($snapshot, $key, $fallback);
}

/**
 * Render a reusable WordPress Media Library single-image picker with live preview thumbnail.
 */
function outbound_cms_render_media_input(string $name, string $value, string $id_slug, string $placeholder = 'https://...'): void {
    $val_attr = outbound_cms_esc_attr($value);
    $id_attr  = outbound_cms_esc_attr($id_slug);
    $name_attr = outbound_cms_esc_attr($name);
    echo '<div class="outbound-media-picker">';
    echo '<img id="' . $id_attr . '_preview" class="outbound-media-thumb' . ($value !== '' ? ' has-src' : '') . '" src="' . ($value !== '' ? outbound_cms_esc_url($value) : '') . '" alt="" />';
    echo '<div class="outbound-media-controls">';
    echo '<input type="url" class="large-text code outbound-media-url-input" id="' . $id_attr . '" name="' . $name_attr . '" value="' . $val_attr . '" data-preview="#' . $id_attr . '_preview" placeholder="' . outbound_cms_esc_attr($placeholder) . '" />';
    echo '<div class="outbound-media-btn-row">';
    echo '<button type="button" class="button outbound-media-single-btn" data-target="#' . $id_attr . '">Choose from Media Library</button> ';
    echo '<button type="button" class="button-link outbound-media-clear-btn" data-target="#' . $id_attr . '">Clear</button>';
    echo '</div></div></div>';
}

/**
 * Render a paginated, searchable WordPress CPT list card inside a CMS section.
 */
function outbound_cms_render_cpt_list_card(string $post_type, string $singular, string $plural, string $section_id, string $search, int $paged, string $taxonomy = ''): void {
    $per_page      = 15;
    $status_param  = $post_type === 'post' ? 'post_status_filter' : 'cpt_status';
    $status_filter = isset($_GET[$status_param]) ? sanitize_key((string) wp_unslash($_GET[$status_param])) : 'all';
    if (!in_array($status_filter, array('all', 'publish', 'draft', 'archived', 'trash'), true)) {
        $status_filter = 'all';
    }

    $counts   = wp_count_posts($post_type);
    $pub      = isset($counts->publish) ? (int) $counts->publish : 0;
    $draft    = (isset($counts->draft) ? (int) $counts->draft : 0) + (isset($counts->pending) ? (int) $counts->pending : 0) + (isset($counts->private) ? (int) $counts->private : 0);
    $archived = isset($counts->archived) ? (int) $counts->archived : 0;
    $trashed  = isset($counts->trash) ? (int) $counts->trash : 0;
    $all_act  = $pub + $draft + $archived;

    $query_statuses = match ($status_filter) {
        'publish'  => array('publish'),
        'draft'    => array('draft', 'pending', 'private'),
        'archived' => array('archived'),
        'trash'    => array('trash'),
        default    => array('publish', 'draft', 'pending', 'private', 'archived'),
    };

    $query = new WP_Query(array(
        'post_type'      => $post_type,
        'post_status'    => $query_statuses,
        'posts_per_page' => $per_page,
        'paged'          => max(1, $paged),
        's'              => $search,
        'orderby'        => array('menu_order' => 'ASC', 'date' => 'DESC'),
    ));

    $add_url  = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id) . '&new_item=1' . ($post_type === 'post' ? '&item_type=post' : ''));
    $all_url  = admin_url('edit.php?post_type=' . rawurlencode($post_type));
    $base_url = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id));
    $cur_url  = add_query_arg(array($status_param => $status_filter), $base_url);
    $tax_url  = $taxonomy !== '' ? admin_url('edit-tags.php?taxonomy=' . rawurlencode($taxonomy) . '&post_type=' . rawurlencode($post_type)) : '';

    $status_tabs = array(
        'all'      => array('label' => 'All Active', 'count' => $all_act),
        'publish'  => array('label' => 'Published', 'count' => $pub),
        'draft'    => array('label' => 'Draft', 'count' => $draft),
        'archived' => array('label' => 'Archived', 'count' => $archived),
        'trash'    => array('label' => 'Trash', 'count' => $trashed),
    );

    echo '<div class="outbound-admin-card outbound-cpt-dashboard-card" data-cpt="' . outbound_cms_esc_attr($post_type) . '">';
    echo '<div class="outbound-card-toolbar">';
    echo '<div><h2>' . outbound_cms_esc_html($plural) . ' (' . $pub . ' published, ' . $draft . ' drafts)</h2>';
    echo '<p class="description">Create, edit in Studio, duplicate, publish, unpublish, archive, move to Trash, restore, or permanently delete <strong>' . outbound_cms_esc_html(strtolower($plural)) . '</strong>.</p></div>';
    echo '<div class="outbound-toolbar-actions">';
    echo '<a class="button button-primary" href="' . outbound_cms_esc_url($add_url) . '">+ Add ' . outbound_cms_esc_html($singular) . '</a> ';
    echo '<a class="button" href="' . outbound_cms_esc_url($all_url) . '">WP List</a>';
    if ($tax_url !== '') {
        echo ' <a class="button" href="' . outbound_cms_esc_url($tax_url) . '">Manage Categories</a>';
    }
    echo '</div></div>';

    echo '<div class="outbound-acc-status-tabs" role="tablist" aria-label="Filter ' . outbound_cms_esc_attr($plural) . ' by status">';
    foreach ($status_tabs as $st_key => $st_meta) {
        $tab_url   = add_query_arg(array_filter(array($status_param => $st_key, 'q' => $search !== '' ? $search : null)), $base_url);
        $is_active = $status_filter === $st_key;
        echo '<a href="' . outbound_cms_esc_url($tab_url) . '" class="outbound-acc-status-tab ' . ($is_active ? 'is-active' : '') . '">';
        echo '<span>' . outbound_cms_esc_html($st_meta['label']) . '</span>';
        echo '<span class="outbound-count-pill">' . (int) $st_meta['count'] . '</span>';
        echo '</a>';
    }
    echo '</div>';

    echo '<form method="get" action="' . outbound_cms_esc_url(admin_url('admin.php')) . '" class="outbound-filter-bar">';
    echo '<input type="hidden" name="page" value="outbound-cms" />';
    echo '<input type="hidden" name="section" value="' . outbound_cms_esc_attr($section_id) . '" />';
    echo '<input type="hidden" name="' . outbound_cms_esc_attr($status_param) . '" value="' . outbound_cms_esc_attr($status_filter) . '" />';
    echo '<input type="search" name="q" value="' . outbound_cms_esc_attr($search) . '" placeholder="Search ' . outbound_cms_esc_attr(strtolower($plural)) . '..." class="regular-text" />';
    echo '<button type="submit" class="button">Filter</button>';
    if ($search !== '') {
        echo ' <a class="button-link" href="' . outbound_cms_esc_url($cur_url) . '">Reset</a>';
    }
    echo '</form>';

    echo '<form method="post" action="' . outbound_cms_esc_url($cur_url) . '" class="outbound-cpt-bulk-form">';
    wp_nonce_field('outbound_cpt_crud_action', 'outbound_cpt_crud_nonce');
    echo '<input type="hidden" name="outbound_cpt_crud_action" value="bulk_action" />';
    echo '<input type="hidden" name="cpt_post_type" value="' . outbound_cms_esc_attr($post_type) . '" />';
    echo '<input type="hidden" name="confirm_permanent_delete" value="0" class="outbound-cpt-bulk-confirm-flag" />';

    if ($query->have_posts()) {
        echo '<div class="outbound-acc-bulk-bar">';
        echo '<label class="outbound-acc-select-all-label"><input type="checkbox" class="outbound-cpt-select-all" /> <span>Select All</span></label>';
        echo '<span class="outbound-acc-selected-count outbound-cpt-selected-count">0 selected</span>';
        echo '<select name="bulk_operation" class="outbound-cpt-bulk-select" aria-label="Bulk action">';
        echo '<option value="">Bulk Actions...</option>';
        if ($status_filter === 'trash') {
            echo '<option value="restore">Restore to Draft</option>';
            echo '<option value="publish">Restore &amp; Publish</option>';
            echo '<option value="permanent_delete">Permanently Delete Selected</option>';
        } else {
            echo '<option value="publish">Publish Selected</option>';
            echo '<option value="unpublish">Unpublish (Move to Draft)</option>';
            echo '<option value="archive">Archive Selected</option>';
            echo '<option value="trash">Move Selected to Trash</option>';
        }
        echo '</select>';
        echo '<button type="submit" class="button outbound-cpt-bulk-apply" disabled>Apply Bulk Action</button>';
        echo '</div>';
    }

    if (!$query->have_posts()) {
        $empty_msg = $status_filter === 'trash'
            ? 'Trash is currently empty for <strong>' . outbound_cms_esc_html($plural) . '</strong>.'
            : 'No WordPress <strong>' . outbound_cms_esc_html($plural) . '</strong> records matched. Create one with <strong>+ Add ' . outbound_cms_esc_html($singular) . '</strong> or import via <a href="' . outbound_cms_esc_url(admin_url('admin.php?page=outbound-migration')) . '">Content Migration</a>.';
        echo '<div class="outbound-empty-box"><p>' . $empty_msg . '</p></div>';
    } else {
        echo '<div class="outbound-acc-table-wrap"><table class="widefat striped outbound-cms-table outbound-acc-table"><thead><tr><th class="check-column" style="width:36px;"><span class="screen-reader-text">Select</span></th><th>Image</th><th>Title / Slug</th><th>Details</th><th>Status</th><th style="width:220px;">Actions</th></tr></thead><tbody>';
        foreach ($query->posts as $p) {
            $pid    = (int) $p->ID;
            $ptitle = (string) $p->post_title;
            $pstat  = (string) $p->post_status;
            $price  = get_post_meta($pid, '_outbound_price_usd', true);
            $dur    = get_post_meta($pid, '_outbound_duration', true);
            $loc    = get_post_meta($pid, '_outbound_location', true);
            $feat   = get_post_meta($pid, '_outbound_featured', true);
            $img    = (string) get_post_meta($pid, '_outbound_hero_image_url', true);
            if ($img === '' && function_exists('outbound_get_post_image_url')) {
                $img = outbound_get_post_image_url($pid, 'thumbnail', 'hero');
            }
            $wp_edit     = get_edit_post_link($pid) ?: admin_url('post.php?post=' . $pid . '&action=edit');
            $studio_edit = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id) . '&edit_item=' . $pid . ($post_type === 'post' ? '&item_type=post' : ''));
            $view_l      = get_permalink($pid);
            $prev_l      = $view_l ? add_query_arg('outbound_preview', '1', $view_l) : home_url('/?outbound_preview=1');

            $impact = function_exists('outbound_get_cms_post_delete_impact')
                ? outbound_get_cms_post_delete_impact($pid)
                : array('post_id' => $pid, 'title' => $ptitle, 'post_type' => $post_type);

            $details = array();
            if ($price !== '') {
                $details[] = '$' . outbound_cms_esc_html((string) $price) . ' USD';
            }
            if ($dur !== '') {
                $details[] = outbound_cms_esc_html((string) $dur);
            }
            if ($loc !== '') {
                $details[] = outbound_cms_esc_html((string) $loc);
            }
            if ($feat === '1') {
                $details[] = '<span class="outbound-badge outbound-badge-blue">Featured</span>';
            }

            $st_badge = 'outbound-badge-amber';
            $st_label = ucfirst($pstat);
            if ($pstat === 'publish') {
                $st_badge = 'outbound-badge-green';
                $st_label = 'Published';
            } elseif ($pstat === 'archived') {
                $st_badge = 'outbound-badge-slate';
                $st_label = 'Archived';
            } elseif ($pstat === 'trash') {
                $st_badge = 'outbound-badge-red';
                $st_label = 'Trashed';
            }

            echo '<tr>';
            echo '<td data-label="Select"><input type="checkbox" name="cpt_ids[]" value="' . $pid . '" class="outbound-cpt-row-check" aria-label="Select ' . outbound_cms_esc_attr($ptitle) . '" /></td>';
            echo '<td data-label="Image" style="width:64px;">' . ($img !== '' ? '<img src="' . outbound_cms_esc_url($img) . '" alt="" style="width:52px;height:38px;object-fit:cover;border-radius:6px;" />' : '—') . '</td>';
            echo '<td data-label="Title"><strong>';
            if ($pstat !== 'trash') {
                echo '<a href="' . outbound_cms_esc_url($studio_edit) . '">' . outbound_cms_esc_html($ptitle) . '</a>';
            } else {
                echo outbound_cms_esc_html($ptitle);
            }
            echo '</strong><br><code>' . outbound_cms_esc_html((string) $p->post_name) . '</code></td>';
            echo '<td data-label="Details">' . (!empty($details) ? implode(' · ', $details) : '—') . '</td>';
            echo '<td data-label="Status"><span class="outbound-badge ' . outbound_cms_esc_attr($st_badge) . '">' . outbound_cms_esc_html($st_label) . '</span></td>';
            echo '<td data-label="Actions"><div class="outbound-acc-row-actions">';
            if ($pstat === 'trash') {
                echo '<button type="button" class="button button-small outbound-cpt-single-op" data-op="restore" data-id="' . $pid . '" data-type="' . outbound_cms_esc_attr($post_type) . '">Restore</button>';
                echo '<button type="button" class="button button-small button-link-delete outbound-cpt-perm-delete-btn" data-id="' . $pid . '" data-type="' . outbound_cms_esc_attr($post_type) . '" data-title="' . outbound_cms_esc_attr($ptitle) . '" data-impact="' . outbound_cms_esc_attr((string) wp_json_encode($impact)) . '">Delete Forever</button>';
            } else {
                echo '<a class="button button-primary button-small outbound-edit-cta" href="' . outbound_cms_esc_url($studio_edit) . '"><span class="dashicons dashicons-edit" aria-hidden="true"></span><span>Edit in Studio</span></a>';
                echo '<div class="outbound-acc-more-wrap">';
                echo '<button type="button" class="button button-small outbound-acc-more-toggle" aria-expanded="false">More &#9662;</button>';
                echo '<div class="outbound-acc-more-menu" hidden>';
                if ($pstat !== 'publish') {
                    echo '<a class="outbound-more-item" href="' . outbound_cms_esc_url($prev_l) . '" target="_blank" rel="noopener">Preview Draft</a>';
                } elseif ($view_l) {
                    echo '<a class="outbound-more-item" href="' . outbound_cms_esc_url($view_l) . '" target="_blank" rel="noopener">View Live</a>';
                }
                echo '<a class="outbound-more-item" href="' . outbound_cms_esc_url($wp_edit) . '">WP Classic Edit</a>';
                echo '<button type="button" class="outbound-more-item outbound-cpt-single-op" data-op="duplicate" data-id="' . $pid . '" data-type="' . outbound_cms_esc_attr($post_type) . '">Duplicate as Draft</button>';
                if ($pstat === 'publish') {
                    echo '<button type="button" class="outbound-more-item outbound-cpt-single-op" data-op="unpublish" data-id="' . $pid . '" data-type="' . outbound_cms_esc_attr($post_type) . '">Unpublish (Set Draft)</button>';
                } else {
                    echo '<button type="button" class="outbound-more-item outbound-cpt-single-op" data-op="publish" data-id="' . $pid . '" data-type="' . outbound_cms_esc_attr($post_type) . '">Publish Live</button>';
                }
                if ($pstat !== 'archived') {
                    echo '<button type="button" class="outbound-more-item outbound-cpt-single-op" data-op="archive" data-id="' . $pid . '" data-type="' . outbound_cms_esc_attr($post_type) . '">Archive</button>';
                } else {
                    echo '<button type="button" class="outbound-more-item outbound-cpt-single-op" data-op="restore" data-id="' . $pid . '" data-type="' . outbound_cms_esc_attr($post_type) . '">Restore to Draft</button>';
                }
                echo '<hr />';
                echo '<button type="button" class="outbound-more-item outbound-more-danger outbound-cpt-trash-btn" data-id="' . $pid . '" data-type="' . outbound_cms_esc_attr($post_type) . '" data-title="' . outbound_cms_esc_attr($ptitle) . '" data-impact="' . outbound_cms_esc_attr((string) wp_json_encode($impact)) . '">Move to Trash</button>';
                echo '</div></div>';
            }
            echo '</div></td></tr>';
        }
        echo '</tbody></table></div>';

        $total_pages = (int) $query->max_num_pages;
        if ($total_pages > 1) {
            echo '<div class="outbound-pagination">';
            for ($i = 1; $i <= $total_pages; $i++) {
                $p_url = add_query_arg(array('paged' => $i, 'q' => $search, $status_param => $status_filter), $base_url);
                $cls   = $i === $paged ? 'button button-primary button-small' : 'button button-small';
                echo '<a class="' . $cls . '" href="' . outbound_cms_esc_url($p_url) . '">' . $i . '</a> ';
            }
            echo '</div>';
        }
    }
    echo '</form>';

    echo '<form method="post" action="' . outbound_cms_esc_url($cur_url) . '" class="outbound-cpt-single-form" style="display:none;">';
    wp_nonce_field('outbound_cpt_crud_action', 'outbound_cpt_crud_nonce');
    echo '<input type="hidden" name="outbound_cpt_crud_action" class="outbound-cpt-single-op-input" value="" />';
    echo '<input type="hidden" name="cpt_target_id" class="outbound-cpt-single-id-input" value="0" />';
    echo '<input type="hidden" name="cpt_post_type" value="' . outbound_cms_esc_attr($post_type) . '" />';
    echo '<input type="hidden" name="confirm_permanent_delete" class="outbound-cpt-single-confirm-input" value="0" />';
    echo '</form>';

    if ($post_type === 'accommodation' && function_exists('outbound_get_unimported_baseline_accommodations')) {
        $unimported_accs = outbound_get_unimported_baseline_accommodations();
        if (!empty($unimported_accs)) {
            echo '<div style="margin-top:18px;padding:16px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;">';
            echo '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px;">';
            echo '<div><h3 style="margin:0;">Current Website Properties Ready to Import &amp; Edit (' . count($unimported_accs) . ')</h3>';
            echo '<p class="description" style="margin:3px 0 0;">These properties are active on your Where to Stay frontend via the built-in catalog. Import them into WordPress to edit rooms, rates, galleries, amenities, and enquiries in the dynamic Room / Unit Manager (existing WP posts are never overwritten).</p></div>';
            echo '<form method="post" action="' . outbound_cms_esc_url($base_url) . '" style="margin:0;">';
            wp_nonce_field('outbound_cms_hub_action', 'outbound_cms_hub_nonce');
            echo '<input type="hidden" name="outbound_cms_section" value="accommodation" />';
            echo '<button type="submit" name="outbound_cms_hub_action" value="sync_baseline_accommodations" class="button button-primary">Import All ' . count($unimported_accs) . ' Current Properties to WordPress</button>';
            echo '</form></div>';

            echo '<table class="widefat striped"><thead><tr><th>Image</th><th>Property Name / Slug</th><th>Location &amp; Current Rooms</th><th>Action</th></tr></thead><tbody>';
            foreach ($unimported_accs as $uacc) {
                $uslug = sanitize_title((string) ($uacc['slug'] ?? ($uacc['id'] ?? '')));
                $uname = (string) ($uacc['name'] ?? $uslug);
                $uimg  = (string) ($uacc['heroImage'] ?? '');
                $uloc  = (string) ($uacc['location'] ?? '');
                $urooms = (array) ($uacc['roomTypes'] ?? array());
                $import_edit_url = wp_nonce_url(
                    admin_url('admin.php?page=outbound-cms&section=accommodation&import_slug=' . rawurlencode($uslug)),
                    'outbound_import_baseline_acc'
                );
                echo '<tr>';
                echo '<td style="width:64px;">' . ($uimg !== '' ? '<img src="' . outbound_cms_esc_url($uimg) . '" alt="" style="width:52px;height:38px;object-fit:cover;border-radius:6px;" />' : '—') . '</td>';
                echo '<td><strong>' . outbound_cms_esc_html($uname) . '</strong><br><code>' . outbound_cms_esc_html($uslug) . '</code></td>';
                echo '<td>' . outbound_cms_esc_html($uloc) . ' &middot; <strong>' . count($urooms) . ' current room types</strong></td>';
                echo '<td><a class="button button-primary button-small" href="' . outbound_cms_esc_url($import_edit_url) . '">Import &amp; Edit Rooms</a></td>';
                echo '</tr>';
            }
            echo '</tbody></table></div>';
        }
    }

    echo '</div>';
}

/**
 * Render the comprehensive Where to Stay Accommodation Management Dashboard.
 */
function outbound_cms_render_accommodation_dashboard(string $search, int $paged): void {
    $status_filter = isset($_GET['acc_status']) ? sanitize_key((string) wp_unslash($_GET['acc_status'])) : 'all';
    if (!in_array($status_filter, array('all', 'publish', 'draft', 'archived', 'trash'), true)) {
        $status_filter = 'all';
    }
    $cat_filter = isset($_GET['acc_cat']) ? sanitize_title((string) wp_unslash($_GET['acc_cat'])) : 'all';
    $sort       = isset($_GET['acc_sort']) ? sanitize_key((string) wp_unslash($_GET['acc_sort'])) : 'menu_order';
    $per_page   = isset($_GET['acc_per_page']) ? max(5, min(100, (int) $_GET['acc_per_page'])) : 15;
    $open_panel = isset($_GET['acc_panel']) ? sanitize_key((string) wp_unslash($_GET['acc_panel'])) : '';

    $query_res = function_exists('outbound_query_admin_accommodations')
        ? outbound_query_admin_accommodations(array(
            'status'   => $status_filter,
            'category' => $cat_filter,
            'search'   => $search,
            'sort'     => $sort,
            'paged'    => $paged,
            'per_page' => $per_page,
        ))
        : array('items' => array(), 'total' => 0, 'total_pages' => 1, 'paged' => 1, 'per_page' => $per_page, 'counts' => array());

    $items       = (array) ($query_res['items'] ?? array());
    $total_items = (int) ($query_res['total'] ?? 0);
    $total_pages = max(1, (int) ($query_res['total_pages'] ?? 1));
    $cur_page    = max(1, (int) ($query_res['paged'] ?? 1));
    $counts      = (array) ($query_res['counts'] ?? array('all' => 0, 'publish' => 0, 'draft' => 0, 'archived' => 0, 'trash' => 0));

    $cat_defs = function_exists('outbound_get_accommodation_category_defs') ? outbound_get_accommodation_category_defs() : array();
    $base_url = admin_url('admin.php?page=outbound-cms&section=accommodation');
    $add_url  = add_query_arg(array('new_item' => '1'), $base_url);

    $status_tabs = array(
        'all'      => array('label' => 'All Active', 'count' => (int) ($counts['all'] ?? 0)),
        'publish'  => array('label' => 'Published', 'count' => (int) ($counts['publish'] ?? 0)),
        'draft'    => array('label' => 'Draft', 'count' => (int) ($counts['draft'] ?? 0)),
        'archived' => array('label' => 'Archived', 'count' => (int) ($counts['archived'] ?? 0)),
        'trash'    => array('label' => 'Trash', 'count' => (int) ($counts['trash'] ?? 0)),
    );

    $shared_prop_amenities = function_exists('outbound_get_shared_property_amenities') ? outbound_get_shared_property_amenities() : array();
    $shared_room_amenities = function_exists('outbound_get_shared_room_amenities') ? outbound_get_shared_room_amenities() : array();
    $shared_rate_templates = function_exists('outbound_get_shared_rate_templates') ? outbound_get_shared_rate_templates() : array();
    $shared_offer_tpls     = function_exists('outbound_get_shared_offer_templates') ? outbound_get_shared_offer_templates() : array();

    $featured_query = function_exists('outbound_query_admin_accommodations')
        ? outbound_query_admin_accommodations(array('status' => 'publish', 'sort' => 'menu_order', 'paged' => 1, 'per_page' => 100))
        : array('items' => array());
    $featured_rows = array_values(array_filter((array) ($featured_query['items'] ?? array()), static fn(array $r): bool => !empty($r['featured'])));
    ?>

    <div class="outbound-admin-card outbound-acc-dashboard-card" id="outbound-acc-dashboard">
        <div class="outbound-cms-list-header">
            <div>
                <h3>Where to Stay — Accommodation Management</h3>
                <p>Full lifecycle management for hotels, lodges, guesthouses, villas, apartments, room units, rates, offers, and shared amenities.</p>
            </div>
            <div class="outbound-acc-header-actions">
                <button type="button" class="button" id="outbound-toggle-featured-panel" aria-expanded="<?php echo $open_panel === 'featured' ? 'true' : 'false'; ?>">
                    Featured Order (<?php echo count($featured_rows); ?>)
                </button>
                <button type="button" class="button" id="outbound-toggle-shared-panel" aria-expanded="<?php echo $open_panel === 'shared' ? 'true' : 'false'; ?>">
                    Shared Library &amp; Packages
                </button>
                <a href="<?php echo outbound_cms_esc_url($add_url); ?>" class="button button-primary">+ Add Accommodation</a>
            </div>
        </div>

        <div class="outbound-acc-status-tabs" role="tablist" aria-label="Filter accommodations by publishing status">
            <?php foreach ($status_tabs as $st_key => $st_meta) :
                $tab_url = add_query_arg(array_filter(array(
                    'acc_status'   => $st_key,
                    'acc_cat'      => $cat_filter !== 'all' ? $cat_filter : null,
                    'q'            => $search !== '' ? $search : null,
                    'acc_sort'     => $sort !== 'menu_order' ? $sort : null,
                    'acc_per_page' => $per_page !== 15 ? $per_page : null,
                )), $base_url);
                $is_active = $status_filter === $st_key;
                ?>
                <a href="<?php echo outbound_cms_esc_url($tab_url); ?>" class="outbound-acc-status-tab <?php echo $is_active ? 'is-active' : ''; ?>">
                    <span><?php echo outbound_cms_esc_html($st_meta['label']); ?></span>
                    <span class="outbound-count-pill"><?php echo (int) $st_meta['count']; ?></span>
                </a>
            <?php endforeach; ?>
        </div>

        <form method="get" action="<?php echo outbound_cms_esc_url(admin_url('admin.php')); ?>" class="outbound-cms-filter-bar outbound-acc-filter-bar">
            <input type="hidden" name="page" value="outbound-cms" />
            <input type="hidden" name="section" value="accommodation" />
            <input type="hidden" name="acc_status" value="<?php echo outbound_cms_esc_attr($status_filter); ?>" />

            <input type="search" name="q" value="<?php echo outbound_cms_esc_attr($search); ?>" placeholder="Search by property name, slug, or location..." class="outbound-acc-search-input" />

            <select name="acc_cat" aria-label="Filter by accommodation category">
                <option value="all">All Categories</option>
                <?php foreach ($cat_defs as $cid => $cmeta) : ?>
                    <option value="<?php echo outbound_cms_esc_attr($cid); ?>" <?php selected($cat_filter, $cid); ?>><?php echo outbound_cms_esc_html((string) ($cmeta['singular'] ?? ucfirst($cid))); ?></option>
                <?php endforeach; ?>
            </select>

            <select name="acc_sort" aria-label="Sort properties">
                <option value="menu_order" <?php selected($sort, 'menu_order'); ?>>Featured / Manual Order</option>
                <option value="title_asc" <?php selected($sort, 'title_asc'); ?>>Name (A &rarr; Z)</option>
                <option value="title_desc" <?php selected($sort, 'title_desc'); ?>>Name (Z &rarr; A)</option>
                <option value="units_desc" <?php selected($sort, 'units_desc'); ?>>Most Room Units</option>
                <option value="price_asc" <?php selected($sort, 'price_asc'); ?>>Price: Low to High</option>
                <option value="price_desc" <?php selected($sort, 'price_desc'); ?>>Price: High to Low</option>
                <option value="date_desc" <?php selected($sort, 'date_desc'); ?>>Recently Updated</option>
            </select>

            <select name="acc_per_page" aria-label="Properties per page">
                <option value="15" <?php selected($per_page, 15); ?>>15 / page</option>
                <option value="30" <?php selected($per_page, 30); ?>>30 / page</option>
                <option value="50" <?php selected($per_page, 50); ?>>50 / page</option>
            </select>

            <button type="submit" class="button">Apply</button>
            <?php if ($search !== '' || $cat_filter !== 'all' || $status_filter !== 'all') : ?>
                <a href="<?php echo outbound_cms_esc_url($base_url); ?>" class="button">Reset</a>
            <?php endif; ?>
        </form>

        <form method="post" action="<?php echo outbound_cms_esc_url(add_query_arg(array('acc_status' => $status_filter), $base_url)); ?>" id="outbound-acc-bulk-form">
            <?php wp_nonce_field('outbound_acc_crud_action', 'outbound_acc_crud_nonce'); ?>
            <input type="hidden" name="outbound_acc_crud_action" value="bulk_action" />
            <input type="hidden" name="confirm_permanent_delete" value="0" class="outbound-bulk-confirm-flag" />

            <div class="outbound-acc-bulk-bar" id="outbound-acc-bulk-bar">
                <label class="outbound-acc-select-all-label">
                    <input type="checkbox" id="outbound-acc-select-all" />
                    <span>Select All</span>
                </label>
                <span class="outbound-acc-selected-count" id="outbound-acc-selected-count">0 selected</span>
                <select name="bulk_operation" id="outbound-acc-bulk-select" aria-label="Bulk action">
                    <option value="">Bulk Actions...</option>
                    <?php if ($status_filter === 'trash') : ?>
                        <option value="restore">Restore to Draft</option>
                        <option value="publish">Restore &amp; Publish</option>
                        <option value="permanent_delete">Permanently Delete Selected</option>
                    <?php else : ?>
                        <option value="publish">Publish Selected</option>
                        <option value="unpublish">Unpublish (Move to Draft)</option>
                        <option value="archive">Archive Selected</option>
                        <option value="trash">Move Selected to Trash</option>
                    <?php endif; ?>
                </select>
                <button type="submit" class="button" id="outbound-acc-bulk-apply" disabled>Apply Bulk Action</button>
            </div>

            <?php if (empty($items)) : ?>
                <div class="outbound-acc-empty-state">
                    <p>No accommodations match the selected filters.</p>
                    <?php if ($status_filter !== 'trash') : ?>
                        <a href="<?php echo outbound_cms_esc_url($add_url); ?>" class="button button-primary">+ Add Accommodation</a>
                    <?php endif; ?>
                </div>
            <?php else : ?>
                <div class="outbound-acc-table-wrap">
                    <table class="widefat striped outbound-cms-table outbound-acc-table">
                        <thead>
                            <tr>
                                <th class="check-column" style="width:36px;"><span class="screen-reader-text">Select</span></th>
                                <th>Property</th>
                                <th>Category</th>
                                <th>Units</th>
                                <th>Status</th>
                                <th style="width:190px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($items as $item) :
                                $pid       = (int) ($item['id'] ?? 0);
                                $ptitle    = (string) ($item['title'] ?? 'Untitled Property');
                                $pslug     = (string) ($item['slug'] ?? '');
                                $pstatus   = (string) ($item['status'] ?? 'draft');
                                $cat_label = (string) ($item['categoryLabel'] ?? 'Lodge');
                                $units_tot = (int) ($item['unitsTotal'] ?? 0);
                                $units_pub = (int) ($item['unitsPublished'] ?? 0);
                                $units_drf = (int) ($item['unitsDraft'] ?? 0);
                                $pimg      = (string) ($item['imageUrl'] ?? '');
                                $is_feat   = !empty($item['featured']);
                                $edit_link = add_query_arg(array('edit_item' => $pid), $base_url);
                                $units_link = $edit_link . '#tab-rooms';
                                $prev_link = $pslug !== ''
                                    ? home_url('/accommodation/' . $pslug . '/?outbound_preview=1')
                                    : add_query_arg('outbound_preview', '1', (string) get_permalink($pid));

                                $impact = function_exists('outbound_get_accommodation_delete_impact')
                                    ? outbound_get_accommodation_delete_impact($pid)
                                    : array('unitsCount' => $units_tot, 'unitNames' => array(), 'offersCount' => 0, 'ratePlansCount' => 0);

                                $st_badge_cls = 'outbound-badge-amber';
                                $st_label     = 'Draft';
                                if ($pstatus === 'publish') {
                                    $st_badge_cls = 'outbound-badge-green';
                                    $st_label     = 'Published';
                                } elseif ($pstatus === 'archived') {
                                    $st_badge_cls = 'outbound-badge-slate';
                                    $st_label     = 'Archived';
                                } elseif ($pstatus === 'trash') {
                                    $st_badge_cls = 'outbound-badge-red';
                                    $st_label     = 'Trashed';
                                }
                                ?>
                                <tr data-acc-id="<?php echo $pid; ?>" data-acc-title="<?php echo outbound_cms_esc_attr($ptitle); ?>">
                                    <td data-label="Select">
                                        <input type="checkbox" name="acc_ids[]" value="<?php echo $pid; ?>" class="outbound-acc-row-check" aria-label="Select <?php echo outbound_cms_esc_attr($ptitle); ?>" />
                                    </td>
                                    <td data-label="Property">
                                        <div class="outbound-acc-prop-cell">
                                            <?php if ($pimg !== '') : ?>
                                                <img src="<?php echo outbound_cms_esc_url($pimg); ?>" alt="" class="outbound-acc-thumb" />
                                            <?php else : ?>
                                                <span class="outbound-acc-thumb outbound-acc-thumb-empty">No Photo</span>
                                            <?php endif; ?>
                                            <div>
                                                <strong>
                                                    <?php if ($pstatus !== 'trash') : ?>
                                                        <a href="<?php echo outbound_cms_esc_url($edit_link); ?>"><?php echo outbound_cms_esc_html($ptitle); ?></a>
                                                    <?php else : ?>
                                                        <?php echo outbound_cms_esc_html($ptitle); ?>
                                                    <?php endif; ?>
                                                </strong>
                                                <?php if ($is_feat) : ?>
                                                    <span class="outbound-badge outbound-badge-blue" style="margin-left:6px;">Featured</span>
                                                <?php endif; ?>
                                                <div class="outbound-acc-prop-meta">
                                                    <code><?php echo outbound_cms_esc_html($pslug !== '' ? $pslug : 'id-' . $pid); ?></code>
                                                    <?php if (!empty($item['location'])) : ?>
                                                        &middot; <span><?php echo outbound_cms_esc_html((string) $item['location']); ?></span>
                                                    <?php endif; ?>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Category"><?php echo outbound_cms_esc_html($cat_label); ?></td>
                                    <td data-label="Units">
                                        <a href="<?php echo outbound_cms_esc_url($units_link); ?>" class="outbound-acc-units-link" title="Manage Rooms &amp; Accommodation Units">
                                            <strong><?php echo $units_tot; ?></strong>
                                            <span class="outbound-acc-units-sub">(<?php echo $units_pub; ?> live<?php echo $units_drf > 0 ? ', ' . $units_drf . ' hidden' : ''; ?>)</span>
                                        </a>
                                    </td>
                                    <td data-label="Status">
                                        <span class="outbound-badge <?php echo outbound_cms_esc_attr($st_badge_cls); ?>"><?php echo outbound_cms_esc_html($st_label); ?></span>
                                    </td>
                                    <td data-label="Actions">
                                        <div class="outbound-acc-row-actions">
                                            <?php if ($pstatus === 'trash') : ?>
                                                <button type="button" class="button button-small outbound-acc-single-op" data-op="restore" data-id="<?php echo $pid; ?>" data-title="<?php echo outbound_cms_esc_attr($ptitle); ?>">Restore</button>
                                                <button type="button"
                                                    class="button button-small button-link-delete outbound-acc-perm-delete-btn"
                                                    data-id="<?php echo $pid; ?>"
                                                    data-title="<?php echo outbound_cms_esc_attr($ptitle); ?>"
                                                    data-impact="<?php echo outbound_cms_esc_attr((string) wp_json_encode($impact)); ?>">
                                                    Delete Forever
                                                </button>
                                            <?php else : ?>
                                                <a href="<?php echo outbound_cms_esc_url($edit_link); ?>" class="button button-small button-primary outbound-edit-cta"><span class="dashicons dashicons-edit" aria-hidden="true"></span><span>Edit</span></a>
                                                <div class="outbound-acc-more-wrap">
                                                    <button type="button" class="button button-small outbound-acc-more-toggle" aria-expanded="false">More &#9662;</button>
                                                    <div class="outbound-acc-more-menu" hidden>
                                                        <a href="<?php echo outbound_cms_esc_url($prev_link); ?>" target="_blank" rel="noopener" class="outbound-more-item">Preview Property</a>
                                                        <a href="<?php echo outbound_cms_esc_url($units_link); ?>" class="outbound-more-item">Manage Units (<?php echo $units_tot; ?>)</a>
                                                        <button type="button" class="outbound-more-item outbound-acc-single-op" data-op="duplicate" data-id="<?php echo $pid; ?>" data-title="<?php echo outbound_cms_esc_attr($ptitle); ?>">Duplicate as Draft</button>
                                                        <?php if ($pstatus === 'publish') : ?>
                                                            <button type="button" class="outbound-more-item outbound-acc-single-op" data-op="unpublish" data-id="<?php echo $pid; ?>" data-title="<?php echo outbound_cms_esc_attr($ptitle); ?>">Unpublish (Set Draft)</button>
                                                        <?php else : ?>
                                                            <button type="button" class="outbound-more-item outbound-acc-single-op" data-op="publish" data-id="<?php echo $pid; ?>" data-title="<?php echo outbound_cms_esc_attr($ptitle); ?>">Publish Live</button>
                                                        <?php endif; ?>
                                                        <?php if ($pstatus !== 'archived') : ?>
                                                            <button type="button" class="outbound-more-item outbound-acc-single-op" data-op="archive" data-id="<?php echo $pid; ?>" data-title="<?php echo outbound_cms_esc_attr($ptitle); ?>">Archive Property</button>
                                                        <?php else : ?>
                                                            <button type="button" class="outbound-more-item outbound-acc-single-op" data-op="restore" data-id="<?php echo $pid; ?>" data-title="<?php echo outbound_cms_esc_attr($ptitle); ?>">Restore to Draft</button>
                                                        <?php endif; ?>
                                                        <hr />
                                                        <button type="button"
                                                            class="outbound-more-item outbound-more-danger outbound-acc-trash-btn"
                                                            data-id="<?php echo $pid; ?>"
                                                            data-title="<?php echo outbound_cms_esc_attr($ptitle); ?>"
                                                            data-impact="<?php echo outbound_cms_esc_attr((string) wp_json_encode($impact)); ?>">
                                                            Move to Trash
                                                        </button>
                                                    </div>
                                                </div>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <?php if ($total_pages > 1) : ?>
                    <div class="outbound-acc-pagination">
                        <span>Showing page <?php echo $cur_page; ?> of <?php echo $total_pages; ?> (<?php echo $total_items; ?> total)</span>
                        <div class="outbound-acc-page-links">
                            <?php for ($pg = 1; $pg <= $total_pages; $pg++) :
                                $pg_url = add_query_arg(array(
                                    'acc_status'   => $status_filter,
                                    'acc_cat'      => $cat_filter,
                                    'q'            => $search,
                                    'acc_sort'     => $sort,
                                    'acc_per_page' => $per_page,
                                    'paged'        => $pg,
                                ), $base_url);
                                ?>
                                <a href="<?php echo outbound_cms_esc_url($pg_url); ?>" class="button button-small <?php echo $pg === $cur_page ? 'button-primary' : ''; ?>"><?php echo $pg; ?></a>
                            <?php endfor; ?>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </form>

        <!-- Single-record non-GET POST form submitted by JS actions / confirmation modals -->
        <form method="post" action="<?php echo outbound_cms_esc_url(add_query_arg(array('acc_status' => $status_filter), $base_url)); ?>" id="outbound-acc-single-form" style="display:none;">
            <?php wp_nonce_field('outbound_acc_crud_action', 'outbound_acc_crud_nonce'); ?>
            <input type="hidden" name="outbound_acc_crud_action" id="outbound-acc-single-op-input" value="" />
            <input type="hidden" name="acc_target_id" id="outbound-acc-single-id-input" value="0" />
            <input type="hidden" name="confirm_permanent_delete" id="outbound-acc-single-confirm-input" value="0" />
        </form>

        <!-- Featured Properties Order Panel -->
        <div class="outbound-acc-drawer-panel" id="outbound-featured-panel" <?php echo $open_panel === 'featured' ? '' : 'hidden'; ?>>
            <div class="outbound-acc-drawer-head">
                <div>
                    <h4>Featured Properties Display Order</h4>
                    <p>Reorder featured published properties shown first across Where to Stay highlights.</p>
                </div>
                <button type="button" class="button outbound-acc-panel-close" data-target="#outbound-featured-panel">Close</button>
            </div>
            <form method="post" action="<?php echo outbound_cms_esc_url(add_query_arg(array('acc_status' => $status_filter, 'acc_panel' => 'featured'), $base_url)); ?>" id="outbound-featured-order-form">
                <?php wp_nonce_field('outbound_acc_crud_action', 'outbound_acc_crud_nonce'); ?>
                <input type="hidden" name="outbound_acc_crud_action" value="save_featured_order" />
                <input type="hidden" name="featured_order_csv" id="outbound-featured-order-csv" value="" />
                <?php if (empty($featured_rows)) : ?>
                    <p class="description">No published properties are currently marked as Featured. Edit any property and enable "Featured on Homepage / Directory" first.</p>
                <?php else : ?>
                    <ul class="outbound-featured-order-list" id="outbound-featured-order-list">
                        <?php foreach ($featured_rows as $frow) : ?>
                            <li data-slug="<?php echo outbound_cms_esc_attr((string) $frow['slug']); ?>">
                                <span><strong><?php echo outbound_cms_esc_html((string) $frow['title']); ?></strong> <code><?php echo outbound_cms_esc_html((string) $frow['slug']); ?></code></span>
                                <span>
                                    <button type="button" class="button button-small outbound-feat-up">&uarr;</button>
                                    <button type="button" class="button button-small outbound-feat-down">&darr;</button>
                                </span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                    <button type="submit" class="button button-primary">Save Featured Order</button>
                <?php endif; ?>
            </form>
        </div>

        <!-- Shared Library CRUD Panel -->
        <div class="outbound-acc-drawer-panel" id="outbound-shared-panel" <?php echo $open_panel === 'shared' ? '' : 'hidden'; ?>>
            <div class="outbound-acc-drawer-head">
                <div>
                    <h4>Shared Amenities, Rate Templates &amp; Special Offer Packages Library</h4>
                    <p>Reusable amenities, seasonal rate templates, and packages. Unlinking a shared item from one property or unit never removes it from other properties. Permanent deletion warns you about every property using it.</p>
                </div>
                <button type="button" class="button outbound-acc-panel-close" data-target="#outbound-shared-panel">Close</button>
            </div>

            <div class="outbound-shared-grid">
                <?php
                $shared_groups = array(
                    'property_amenities' => array(
                        'title' => 'Shared Property Amenities',
                        'items' => array_values($shared_prop_amenities),
                        'cats'  => array('property' => 'Property Feature', 'dining' => 'Dining', 'wellness' => 'Wellness &amp; Pool', 'safari' => 'Safari &amp; Transfers'),
                    ),
                    'room_amenities' => array(
                        'title' => 'Shared Room Amenities',
                        'items' => array_values($shared_room_amenities),
                        'cats'  => array('comfort' => 'Comfort', 'bathroom' => 'Bathroom', 'view' => 'View &amp; Outdoor', 'family' => 'Family &amp; Dining'),
                    ),
                    'rate_templates' => array(
                        'title' => 'Shared Rate Plan Templates',
                        'items' => array_values($shared_rate_templates),
                        'cats'  => array('room-only' => 'Room Only', 'bed-breakfast' => 'Bed &amp; Breakfast', 'half-board' => 'Half Board', 'all-inclusive' => 'All-Inclusive'),
                    ),
                    'offer_templates' => array(
                        'title' => 'Shared Packages &amp; Special Offers',
                        'items' => array_values($shared_offer_tpls),
                        'cats'  => array('honeymoon-package' => 'Honeymoon Package', 'seasonal-promotion' => 'Seasonal Promotion', 'special-offer' => 'Special Offer', 'meal-package' => 'Meal Package'),
                    ),
                );
                foreach ($shared_groups as $gkey => $gmeta) :
                    $is_template = ($gkey === 'rate_templates' || $gkey === 'offer_templates');
                    ?>
                    <div class="outbound-shared-card">
                        <h5><?php echo outbound_cms_esc_html($gmeta['title']); ?></h5>
                        <form method="post" action="<?php echo outbound_cms_esc_url(add_query_arg(array('acc_status' => $status_filter, 'acc_panel' => 'shared'), $base_url)); ?>" class="outbound-shared-add-form">
                            <?php wp_nonce_field('outbound_acc_crud_action', 'outbound_acc_crud_nonce'); ?>
                            <input type="hidden" name="outbound_acc_crud_action" value="shared_save" />
                            <input type="hidden" name="shared_library_type" value="<?php echo outbound_cms_esc_attr($gkey); ?>" />
                            <input type="hidden" name="shared_record_id" value="" class="outbound-shared-edit-id" />
                            <input type="text" name="shared_label" placeholder="Name / Title..." required class="outbound-shared-edit-label" />
                            <select name="shared_category" class="outbound-shared-edit-cat">
                                <?php foreach ($gmeta['cats'] as $ck => $cl) : ?>
                                    <option value="<?php echo outbound_cms_esc_attr($ck); ?>"><?php echo outbound_cms_esc_html($cl); ?></option>
                                <?php endforeach; ?>
                            </select>
                            <?php if ($gkey === 'rate_templates') : ?>
                                <input type="number" step="1" min="0" name="shared_amount" placeholder="USD / night" class="outbound-shared-edit-amount" />
                                <input type="text" name="shared_discount_label" placeholder="Badge (e.g. Early Bird 15% Off)" />
                            <?php elseif ($gkey === 'offer_templates') : ?>
                                <input type="text" name="shared_discount_label" placeholder="Discount badge (e.g. Free Night)" />
                                <input type="text" name="shared_notes" placeholder="Package summary..." />
                            <?php endif; ?>
                            <button type="submit" class="button button-small button-primary">Save Shared Item</button>
                        </form>
                        <ul class="outbound-shared-list">
                            <?php foreach ($gmeta['items'] as $sitem) :
                                if (!is_array($sitem)) { continue; }
                                $sid    = (string) ($sitem['id'] ?? '');
                                $slabel = (string) ($sitem['label'] ?? ($sitem['name'] ?? ($sitem['title'] ?? $sid)));
                                $scat   = (string) ($sitem['category'] ?? ($sitem['boardType'] ?? ($sitem['offerCategory'] ?? '')));
                                $deps_res = function_exists('outbound_find_shared_record_dependencies')
                                    ? outbound_find_shared_record_dependencies($gkey, $sid, $slabel)
                                    : array('count' => 0, 'properties' => array(), 'units' => array());
                                $dep_count = (int) ($deps_res['count'] ?? 0);
                                $dep_list  = array();
                                foreach ((array) ($deps_res['properties'] ?? array()) as $dp) {
                                    $dep_list[] = array('postId' => (int) ($dp['id'] ?? 0), 'postTitle' => (string) ($dp['title'] ?? ''));
                                }
                                ?>
                                <li>
                                    <div>
                                        <strong><?php echo outbound_cms_esc_html($slabel); ?></strong>
                                        <span class="outbound-badge outbound-badge-blue"><?php echo outbound_cms_esc_html($scat); ?></span>
                                        <small class="description">Used by <?php echo $dep_count; ?> <?php echo $dep_count === 1 ? 'property' : 'properties'; ?></small>
                                    </div>
                                    <div style="display:flex;gap:6px;align-items:center;">
                                        <button type="button"
                                            class="button button-small outbound-shared-edit-btn"
                                            data-id="<?php echo outbound_cms_esc_attr($sid); ?>"
                                            data-label="<?php echo outbound_cms_esc_attr($slabel); ?>"
                                            data-cat="<?php echo outbound_cms_esc_attr($scat); ?>"
                                            data-amount="<?php echo outbound_cms_esc_attr((string) ($sitem['nightlyRate'] ?? '')); ?>">Edit</button>
                                        <button type="button"
                                            class="button-link-delete outbound-shared-delete-btn"
                                            data-lib="<?php echo outbound_cms_esc_attr($gkey); ?>"
                                            data-id="<?php echo outbound_cms_esc_attr($sid); ?>"
                                            data-label="<?php echo outbound_cms_esc_attr($slabel); ?>"
                                            data-deps="<?php echo outbound_cms_esc_attr((string) wp_json_encode($dep_list)); ?>">
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endforeach; ?>
            </div>

            <form method="post" action="<?php echo outbound_cms_esc_url(add_query_arg(array('acc_status' => $status_filter, 'acc_panel' => 'shared'), $base_url)); ?>" id="outbound-shared-delete-form" style="display:none;">
                <?php wp_nonce_field('outbound_acc_crud_action', 'outbound_acc_crud_nonce'); ?>
                <input type="hidden" name="outbound_acc_crud_action" value="shared_delete" />
                <input type="hidden" name="shared_library_type" id="outbound-shared-del-lib" value="" />
                <input type="hidden" name="shared_record_id" id="outbound-shared-del-id" value="" />
                <input type="hidden" name="confirm_shared_delete" id="outbound-shared-del-confirm" value="0" />
            </form>
        </div>

        <?php
        if (function_exists('outbound_get_unimported_baseline_accommodations')) {
            $unimported = outbound_get_unimported_baseline_accommodations();
            if (!empty($unimported)) {
                echo '<div class="outbound-cms-baseline-box" style="margin-top:18px;">';
                echo '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">';
                echo '<div><h4 style="margin:0 0 4px;">Catalog Properties Not Yet Imported into WordPress (' . count($unimported) . ')</h4>';
                echo '<p class="description" style="margin:0;">Import baseline catalog properties to edit their room units, galleries, rates, and lifecycle in WordPress.</p></div>';
                echo '<form method="post" action="' . outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=accommodation')) . '">';
                wp_nonce_field('outbound_cms_hub_action', 'outbound_cms_hub_nonce');
                echo '<input type="hidden" name="outbound_cms_section" value="accommodation" />';
                echo '<button type="submit" name="outbound_cms_hub_action" value="sync_baseline_accommodations" class="button button-primary">Import All ' . count($unimported) . ' Properties Now</button>';
                echo '</form></div></div>';
            }
        }
        ?>
    </div>
    <?php
}

/**
 * Render targeted inline Content Studio form for a single CPT item inside Outbound CMS.
 * Loads only ONE post at a time to eliminate 502 timeouts and oversized DOM trees.
 */
function outbound_cms_render_single_item_studio(string $section_id, string $post_type, int $post_id, bool $is_new, string $preview_url): void {
    $post = null;
    if ($post_id > 0) {
        $cand = get_post($post_id);
        if ($cand instanceof WP_Post && $cand->post_type === $post_type) {
            $post = $cand;
        }
    }
    if (!$post) {
        $post = new WP_Post((object) array(
            'ID'           => 0,
            'post_type'    => $post_type,
            'post_status'  => 'draft',
            'post_title'   => '',
            'post_name'    => '',
            'post_excerpt' => '',
            'post_content' => '',
            'menu_order'   => 0,
        ));
    }

    $back_url     = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id));
    $form_action  = $post->ID > 0
        ? admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id) . '&edit_item=' . (int) $post->ID)
        : admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($section_id) . '&new_item=1');
    if ($post_type === 'accommodation' && $post->ID > 0 && !empty($post->post_name)) {
        $item_preview = home_url('/accommodation/' . $post->post_name . '/?outbound_preview=1');
    } else {
        $item_preview = $post->ID > 0 && get_permalink($post->ID)
            ? add_query_arg('outbound_preview', '1', (string) get_permalink($post->ID))
            : $preview_url;
    }
    $status_badge_class = 'outbound-badge-amber';
    $status_badge_label = 'Draft';
    if ($post->post_status === 'publish') {
        $status_badge_class = 'outbound-badge-green';
        $status_badge_label = 'Published';
    } elseif ($post->post_status === 'archived') {
        $status_badge_class = 'outbound-badge-slate';
        $status_badge_label = 'Archived';
    } elseif ($post->post_status === 'trash') {
        $status_badge_class = 'outbound-badge-red';
        $status_badge_label = 'In Trash';
    }
    $studio_impact = ($post->ID > 0 && function_exists('outbound_get_cms_post_delete_impact'))
        ? outbound_get_cms_post_delete_impact((int) $post->ID)
        : array('post_id' => (int) $post->ID, 'title' => (string) $post->post_title, 'post_type' => $post_type);
    ?>
    <div class="outbound-admin-card" style="padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <div>
            <a href="<?php echo outbound_cms_esc_url($back_url); ?>" class="button">&larr; Back to All <?php echo outbound_cms_esc_html(ucfirst($section_id)); ?></a>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <?php if ($post->ID > 0) : ?>
                <span class="outbound-badge <?php echo outbound_cms_esc_attr($status_badge_class); ?>">
                    <?php echo outbound_cms_esc_html($status_badge_label); ?>
                </span>
                <a href="<?php echo outbound_cms_esc_url($item_preview); ?>" target="_blank" rel="noopener" class="button">Preview Record</a>
                <?php if ($post->post_status !== 'trash') : ?>
                    <button type="button" class="button outbound-studio-duplicate-btn">Duplicate</button>
                    <button type="button"
                        class="button button-link-delete outbound-studio-trash-btn"
                        data-id="<?php echo (int) $post->ID; ?>"
                        data-title="<?php echo outbound_cms_esc_attr((string) $post->post_title); ?>"
                        data-type="<?php echo outbound_cms_esc_attr($post_type); ?>"
                        data-impact="<?php echo outbound_cms_esc_attr((string) wp_json_encode($studio_impact)); ?>">
                        Move to Trash
                    </button>
                <?php else : ?>
                    <button type="button" class="button outbound-studio-restore-btn">Restore to Draft</button>
                    <button type="button"
                        class="button button-link-delete outbound-studio-perm-delete-btn"
                        data-id="<?php echo (int) $post->ID; ?>"
                        data-title="<?php echo outbound_cms_esc_attr((string) $post->post_title); ?>"
                        data-type="<?php echo outbound_cms_esc_attr($post_type); ?>"
                        data-impact="<?php echo outbound_cms_esc_attr((string) wp_json_encode($studio_impact)); ?>">
                        Delete Forever
                    </button>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>

    <?php if ($post->ID > 0 && $post->post_status === 'trash') : ?>
        <div class="outbound-inline-notice outbound-notice-warning" style="margin:14px 0;">
            <span><strong>This record is currently in the Trash.</strong> Restore it to Draft or Publish it below before it can appear publicly again, or click Delete Forever to permanently remove it.</span>
        </div>
    <?php endif; ?>

    <form method="post" action="<?php echo outbound_cms_esc_url($form_action); ?>" id="outbound-cms-item-form">
        <?php wp_nonce_field('outbound_cms_item_action', 'outbound_cms_item_nonce'); ?>
        <input type="hidden" name="outbound_cms_item_post_type" value="<?php echo outbound_cms_esc_attr($post_type); ?>" />
        <input type="hidden" name="outbound_cms_item_post_id" value="<?php echo (int) $post->ID; ?>" />
        <input type="hidden" name="confirm_permanent_delete" id="outbound-studio-confirm-delete" value="0" />
        <input type="hidden" name="outbound_cms_item_action" id="outbound-studio-action-override" value="" disabled />

        <?php
        switch ($post_type) {
            case 'experience':
                outbound_editor_render_experience_fields($post, true);
                break;
            case 'accommodation':
                outbound_editor_render_accommodation_fields($post, true);
                break;
            case 'package':
                outbound_editor_render_package_fields($post, true);
                break;
            case 'guide_article':
            case 'post':
                outbound_editor_render_guide_fields($post, true);
                break;
            case 'client_album':
                outbound_editor_render_album_fields($post, true);
                break;
        }
        ?>

        <div class="outbound-sticky-action-bar">
            <div class="outbound-sticky-status">
                <?php if ($post->ID > 0) : ?>
                    <span class="outbound-badge <?php echo outbound_cms_esc_attr($status_badge_class); ?>">
                        <?php echo outbound_cms_esc_html('Status: ' . $status_badge_label); ?>
                    </span>
                <?php else : ?>
                    <span class="outbound-badge outbound-badge-blue">New Record</span>
                <?php endif; ?>
            </div>
            <div class="outbound-sticky-buttons">
                <a href="<?php echo outbound_cms_esc_url($back_url); ?>" class="button">Cancel</a>
                <?php if ($post->ID > 0) : ?>
                    <a href="<?php echo outbound_cms_esc_url($item_preview); ?>" target="_blank" rel="noopener" class="button">Preview Record</a>
                <?php endif; ?>
                <?php if ($post->ID > 0 && $post->post_status === 'trash') : ?>
                    <button type="submit" name="outbound_cms_item_action" value="restore_item" class="button button-secondary">Restore to Draft</button>
                    <button type="submit" name="outbound_cms_item_action" value="publish_item" class="button button-primary">Restore &amp; Publish</button>
                    <button type="button"
                        class="button button-link-delete outbound-studio-perm-delete-btn"
                        data-id="<?php echo (int) $post->ID; ?>"
                        data-title="<?php echo outbound_cms_esc_attr((string) $post->post_title); ?>"
                        data-type="<?php echo outbound_cms_esc_attr($post_type); ?>"
                        data-impact="<?php echo outbound_cms_esc_attr((string) wp_json_encode($studio_impact)); ?>">
                        Delete Forever
                    </button>
                <?php else : ?>
                    <?php if ($post->ID > 0) : ?>
                        <button type="button"
                            class="button button-link-delete outbound-studio-trash-btn"
                            data-id="<?php echo (int) $post->ID; ?>"
                            data-title="<?php echo outbound_cms_esc_attr((string) $post->post_title); ?>"
                            data-type="<?php echo outbound_cms_esc_attr($post_type); ?>"
                            data-impact="<?php echo outbound_cms_esc_attr((string) wp_json_encode($studio_impact)); ?>">
                            Move to Trash
                        </button>
                    <?php endif; ?>
                    <button type="submit" name="outbound_cms_item_action" value="archive_item" class="button">Archive</button>
                    <button type="submit" name="outbound_cms_item_action" value="save_item_draft" class="button button-secondary">Save as Draft</button>
                    <button type="submit" name="outbound_cms_item_action" value="publish_item" class="button button-primary"><?php echo $post->post_status === 'publish' ? 'Update Live' : 'Publish Live'; ?></button>
                <?php endif; ?>
            </div>
        </div>
    </form>
    <?php
}

/**
 * Render unified 14-section Outbound CMS page in WordPress Admin.
 */
function outbound_render_cms_hub_page(): void {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have permission to access Outbound CMS.', 'outbound-holidays'));
    }

    $sections       = outbound_cms_get_sections();
    $active_section = isset($_GET['section']) ? sanitize_key((string) $_GET['section']) : 'overview';
    if (!isset($sections[$active_section])) {
        $active_section = 'overview';
    }
    $search       = isset($_GET['q']) ? outbound_cms_sanitize_text((string) wp_unslash($_GET['q'])) : '';
    $paged        = max(1, (int) ($_GET['paged'] ?? 1));
    $edit_item_id = isset($_GET['edit_item']) ? (int) $_GET['edit_item'] : 0;
    $is_new_item  = !empty($_GET['new_item']);

    $section_cpt_map = array(
        'experiences'   => 'experience',
        'accommodation' => 'accommodation',
        'packages'      => 'package',
        'guides'        => 'guide_article',
        'galleries'     => 'client_album',
    );
    $active_cpt = $section_cpt_map[$active_section] ?? '';
    if ($active_section === 'guides' && (($_GET['item_type'] ?? '') === 'post' || ($edit_item_id > 0 && get_post_type($edit_item_id) === 'post'))) {
        $active_cpt = 'post';
    }

    $notice = null;
    if ($active_section === 'accommodation' && !empty($_GET['import_slug']) && function_exists('outbound_ensure_baseline_accommodation_post')) {
        check_admin_referer('outbound_import_baseline_acc');
        $import_slug = sanitize_title((string) wp_unslash($_GET['import_slug']));
        $ensured_id  = outbound_ensure_baseline_accommodation_post($import_slug);
        if ($ensured_id > 0) {
            $edit_item_id = $ensured_id;
            $is_new_item  = false;
            $notice = array('type' => 'success', 'msg' => 'Current property imported into WordPress with dynamic room unit IDs. You can now edit its rooms, rates, galleries, and settings below.');
        } else {
            $notice = array('type' => 'error', 'msg' => 'Could not locate baseline accommodation property for slug: ' . $import_slug);
        }
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['outbound_cms_item_action'])) {
        check_admin_referer('outbound_cms_item_action', 'outbound_cms_item_nonce');
        $item_action = sanitize_key((string) wp_unslash($_POST['outbound_cms_item_action']));
        $post_type   = sanitize_key((string) wp_unslash($_POST['outbound_cms_item_post_type'] ?? $active_cpt));
        $post_id     = (int) ($_POST['outbound_cms_item_post_id'] ?? $edit_item_id);
        $confirmed   = sanitize_key((string) wp_unslash($_POST['confirm_permanent_delete'] ?? '')) === '1';

        if ($item_action === 'trash_item' && function_exists('outbound_change_cms_post_status')) {
            $op_res = outbound_change_cms_post_status($post_id, 'trash', $post_type);
            if (!empty($op_res['ok'])) {
                $edit_item_id = 0;
                $is_new_item  = false;
                $notice = array('type' => 'warning', 'msg' => 'Record moved to Trash and removed from public website listings. You can restore or permanently delete it from the Trash tab.');
            } else {
                $notice = array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not move record to Trash.'));
            }
        } elseif ($item_action === 'restore_item' && function_exists('outbound_change_cms_post_status')) {
            $op_res = outbound_change_cms_post_status($post_id, 'restore', $post_type);
            $notice = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => 'Record restored from Trash to Draft.')
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not restore record.'));
        } elseif ($item_action === 'duplicate_item' && function_exists('outbound_duplicate_cms_post')) {
            $op_res = outbound_duplicate_cms_post($post_id);
            if (!empty($op_res['ok']) && !empty($op_res['post_id'])) {
                $edit_item_id = (int) $op_res['post_id'];
                $is_new_item  = false;
                $notice = array('type' => 'success', 'msg' => 'Duplicated record as Draft. You are now editing the new draft copy.');
            } else {
                $notice = array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not duplicate record.'));
            }
        } elseif ($item_action === 'permanent_delete_item' && function_exists('outbound_permanently_delete_cms_post')) {
            $op_res = outbound_permanently_delete_cms_post($post_id, $confirmed, $post_type);
            if (!empty($op_res['ok'])) {
                $edit_item_id = 0;
                $is_new_item  = false;
                $notice = array('type' => 'success', 'msg' => 'Record permanently deleted from WordPress. Media Library assets used elsewhere were preserved.');
            } else {
                $notice = array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Permanent deletion aborted.'));
            }
        } else {
            if ($item_action === 'publish_item') {
                $target_stat = 'publish';
            } elseif ($item_action === 'archive_item') {
                $target_stat = 'archived';
            } else {
                $target_stat = 'draft';
            }
            $unslashed = wp_unslash($_POST);
            $res       = outbound_cms_save_item_record($post_type, $post_id, $target_stat, is_array($unslashed) ? $unslashed : array());
            if (!empty($res['error'])) {
                $notice = array('type' => 'error', 'msg' => (string) $res['error']);
            } else {
                $edit_item_id = (int) $res['post_id'];
                $is_new_item  = false;
                if ($res['status'] === 'publish') {
                    $notice = array('type' => 'success', 'msg' => 'Record published live and snapshot cache refreshed.');
                } elseif ($res['status'] === 'archived') {
                    $notice = array('type' => 'warning', 'msg' => 'Record archived and removed from public website listings.');
                } else {
                    $notice = array('type' => 'info', 'msg' => 'Record saved as Draft. Only authenticated admins using ?outbound_preview=1 can see it until published.');
                }
            }
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['outbound_cpt_crud_action']) && function_exists('outbound_can_manage_cms_post')) {
        check_admin_referer('outbound_cpt_crud_action', 'outbound_cpt_crud_nonce');
        if (!outbound_can_manage_cms_post('edit')) {
            wp_die(__('You do not have permission to manage CMS items.', 'outbound-holidays'));
        }
        $crud_op   = sanitize_key((string) wp_unslash($_POST['outbound_cpt_crud_action']));
        $target_id = (int) ($_POST['cpt_target_id'] ?? 0);
        $cpt_type  = sanitize_key((string) wp_unslash($_POST['cpt_post_type'] ?? ''));
        $confirmed = sanitize_key((string) wp_unslash($_POST['confirm_permanent_delete'] ?? '')) === '1';

        if ($crud_op === 'duplicate') {
            $op_res = outbound_duplicate_cms_post($target_id);
            $notice = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => 'Record duplicated as Draft and snapshot cache refreshed.')
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not duplicate record.'));
        } elseif (in_array($crud_op, array('publish', 'unpublish', 'draft', 'archive', 'trash', 'restore'), true)) {
            $op_res = outbound_change_cms_post_status($target_id, $crud_op, $cpt_type);
            $notice = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => 'Record status updated and public cache refreshed.')
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not update record status.'));
        } elseif ($crud_op === 'permanent_delete') {
            $op_res = outbound_permanently_delete_cms_post($target_id, $confirmed, $cpt_type);
            $notice = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => 'Record permanently deleted.')
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Permanent deletion aborted.'));
        } elseif ($crud_op === 'bulk_action') {
            $bulk_op  = sanitize_key((string) wp_unslash($_POST['bulk_operation'] ?? ''));
            $raw_ids  = isset($_POST['cpt_ids']) ? (array) wp_unslash($_POST['cpt_ids']) : array();
            $bulk_ids = array_values(array_filter(array_map('intval', $raw_ids)));
            $op_res   = outbound_bulk_cms_post_action($bulk_ids, $bulk_op, $confirmed, $cpt_type);
            $notice   = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => sprintf('Bulk action completed across %d selected item(s).', (int) ($op_res['processed'] ?? 0)))
                : array('type' => 'error', 'msg' => implode(' ', (array) ($op_res['errors'] ?? array('Bulk action failed.'))));
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['outbound_acc_crud_action']) && function_exists('outbound_can_manage_accommodations')) {
        check_admin_referer('outbound_acc_crud_action', 'outbound_acc_crud_nonce');
        if (!outbound_can_manage_accommodations()) {
            wp_die(__('You do not have permission to manage accommodations.', 'outbound-holidays'));
        }
        $crud_op   = sanitize_key((string) wp_unslash($_POST['outbound_acc_crud_action']));
        $target_id = (int) ($_POST['acc_target_id'] ?? 0);
        $confirmed = sanitize_key((string) wp_unslash($_POST['confirm_permanent_delete'] ?? '')) === '1';

        if ($crud_op === 'duplicate') {
            $op_res = outbound_duplicate_accommodation_post($target_id);
            $notice = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => (string) ($op_res['message'] ?? 'Property duplicated as Draft.'))
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not duplicate property.'));
        } elseif (in_array($crud_op, array('publish', 'unpublish', 'draft', 'archive', 'trash', 'restore'), true)) {
            $op_res = outbound_change_accommodation_status($target_id, $crud_op);
            $notice = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => (string) ($op_res['message'] ?? 'Property status updated.'))
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not update property status.'));
        } elseif ($crud_op === 'permanent_delete') {
            $op_res = outbound_permanently_delete_accommodation($target_id, $confirmed);
            $notice = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => (string) ($op_res['message'] ?? 'Property permanently deleted.'))
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Permanent deletion aborted.'));
        } elseif ($crud_op === 'bulk_action') {
            $bulk_op  = sanitize_key((string) wp_unslash($_POST['bulk_operation'] ?? ''));
            $raw_ids  = isset($_POST['acc_ids']) ? (array) wp_unslash($_POST['acc_ids']) : array();
            $bulk_ids = array_values(array_filter(array_map('intval', $raw_ids)));
            $op_res   = outbound_bulk_accommodation_action($bulk_ids, $bulk_op, $confirmed);
            $notice   = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => (string) ($op_res['message'] ?? 'Bulk action completed.'))
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Bulk action failed.'));
        } elseif ($crud_op === 'save_featured_order') {
            $csv     = sanitize_text_field((string) wp_unslash($_POST['featured_order_csv'] ?? ''));
            $slugs   = array_values(array_filter(array_map('sanitize_title', array_map('trim', explode(',', $csv)))));
            $op_res  = outbound_save_featured_accommodations_order($slugs);
            $notice  = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => 'Featured properties display order saved and synced to the public website.')
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not save featured order.'));
        } elseif ($crud_op === 'shared_save') {
            $lib_type = sanitize_key((string) wp_unslash($_POST['shared_library_type'] ?? ''));
            $rec_id   = sanitize_title((string) wp_unslash($_POST['shared_record_id'] ?? ''));
            $label    = outbound_cms_sanitize_text((string) wp_unslash($_POST['shared_label'] ?? ''));
            $category = sanitize_key((string) wp_unslash($_POST['shared_category'] ?? 'property'));
            $icon     = sanitize_key((string) wp_unslash($_POST['shared_icon'] ?? 'sparkles'));
            $amount   = max(0, (float) ($_POST['shared_amount'] ?? 0));
            $notes    = sanitize_textarea_field((string) wp_unslash($_POST['shared_notes'] ?? ''));
            if ($label === '') {
                $notice = array('type' => 'error', 'msg' => 'Shared item name is required.');
            } else {
                if ($rec_id === '') {
                    $rec_id = sanitize_title($label) ?: ('item-' . wp_generate_password(5, false, false));
                }
                if ($lib_type === 'property_amenities' && function_exists('outbound_get_shared_property_amenities')) {
                    $items = outbound_get_shared_property_amenities();
                    $items[$rec_id] = array('id' => $rec_id, 'label' => $label, 'category' => $category ?: 'property', 'icon' => $icon);
                    outbound_save_shared_property_amenities($items);
                    $notice = array('type' => 'success', 'msg' => 'Shared property amenity "' . $label . '" saved.');
                } elseif ($lib_type === 'room_amenities' && function_exists('outbound_get_shared_room_amenities')) {
                    $items = outbound_get_shared_room_amenities();
                    $items[$rec_id] = array('id' => $rec_id, 'label' => $label, 'category' => $category ?: 'comfort', 'icon' => $icon);
                    outbound_save_shared_room_amenities($items);
                    $notice = array('type' => 'success', 'msg' => 'Shared room amenity "' . $label . '" saved.');
                } elseif ($lib_type === 'rate_templates' && function_exists('outbound_get_shared_rate_templates')) {
                    $items = outbound_get_shared_rate_templates();
                    $items[] = array(
                        'id'            => $rec_id,
                        'name'          => $label,
                        'boardType'     => $category ?: 'room-only',
                        'nightlyRate'   => $amount,
                        'discountLabel' => outbound_cms_sanitize_text((string) wp_unslash($_POST['shared_discount_label'] ?? '')),
                        'startDate'     => outbound_cms_sanitize_text((string) wp_unslash($_POST['shared_start_date'] ?? '')),
                        'endDate'       => outbound_cms_sanitize_text((string) wp_unslash($_POST['shared_end_date'] ?? '')),
                        'inclusions'    => array(),
                        'isActive'      => true,
                    );
                    outbound_save_shared_rate_templates($items);
                    $notice = array('type' => 'success', 'msg' => 'Shared rate template "' . $label . '" saved.');
                } elseif ($lib_type === 'offer_templates' && function_exists('outbound_get_shared_offer_templates')) {
                    $items = outbound_get_shared_offer_templates();
                    $items[] = array(
                        'id'            => $rec_id,
                        'title'         => $label,
                        'offerCategory' => $category ?: 'special-offer',
                        'discountLabel' => outbound_cms_sanitize_text((string) wp_unslash($_POST['shared_discount_label'] ?? '')),
                        'summary'       => $notes,
                        'validFrom'     => outbound_cms_sanitize_text((string) wp_unslash($_POST['shared_start_date'] ?? '')),
                        'validTo'       => outbound_cms_sanitize_text((string) wp_unslash($_POST['shared_end_date'] ?? '')),
                        'inclusions'    => array(),
                        'status'        => 'published',
                    );
                    outbound_save_shared_offer_templates($items);
                    $notice = array('type' => 'success', 'msg' => 'Shared offer template "' . $label . '" saved.');
                }
            }
        } elseif ($crud_op === 'shared_delete' && function_exists('outbound_delete_shared_library_record')) {
            $lib_type = sanitize_key((string) wp_unslash($_POST['shared_library_type'] ?? ''));
            $rec_id   = sanitize_title((string) wp_unslash($_POST['shared_record_id'] ?? ''));
            $del_conf = sanitize_key((string) wp_unslash($_POST['confirm_shared_delete'] ?? '')) === '1';
            $op_res   = outbound_delete_shared_library_record($lib_type, $rec_id, $del_conf);
            $notice   = !empty($op_res['ok'])
                ? array('type' => 'success', 'msg' => (string) ($op_res['message'] ?? 'Shared record removed.'))
                : array('type' => 'error', 'msg' => (string) ($op_res['error'] ?? 'Could not remove shared record.'));
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['outbound_cms_hub_action'])) {
        check_admin_referer('outbound_cms_hub_action', 'outbound_cms_hub_nonce');
        $action      = sanitize_key((string) wp_unslash($_POST['outbound_cms_hub_action']));
        $post_sec    = isset($_POST['outbound_cms_section']) ? sanitize_key((string) wp_unslash($_POST['outbound_cms_section'])) : $active_section;
        $raw_payload = isset($_POST['cms']) && is_array($_POST['cms']) ? wp_unslash($_POST['cms']) : array();

        if ($action === 'discard_draft') {
            outbound_discard_cms_draft();
            $notice = array('type' => 'warning', 'msg' => 'Unpublished draft changes have been discarded. Public visitors continue to see the live site.');
        } elseif ($action === 'sync_baseline_accommodations' && function_exists('outbound_sync_missing_baseline_accommodations')) {
            $sync_res = outbound_sync_missing_baseline_accommodations();
            $notice = array(
                'type' => 'success',
                'msg'  => sprintf(
                    'Imported %d current catalog properties into WordPress (%d existing properties preserved untouched) and verified stable room unit IDs.',
                    (int) ($sync_res['created'] ?? 0),
                    (int) ($sync_res['existing'] ?? 0)
                ),
            );
        } elseif ($action === 'reset_design_tokens') {
            outbound_save_cms_draft_patch(array(
                'design_tokens' => array(
                    'primaryColor'   => '#0B5E8E',
                    'secondaryColor' => '#C9A66B',
                    'accentColor'    => '#E67E22',
                    'greenColor'     => '#3F6B3C',
                    'darkColor'      => '#2F3A44',
                ),
            ), 'design');
            $notice = array('type' => 'info', 'msg' => 'Original React color palette staged in Draft. Preview or click Publish Changes to apply live.');
        } elseif ($action === 'refresh_currency_rates') {
            if (function_exists('outbound_refresh_currency_rates')) {
                $refreshed = outbound_refresh_currency_rates(true);
                if (($refreshed['status'] ?? '') === 'live') {
                    $notice = array(
                        'type' => 'success',
                        'msg'  => sprintf(
                            'Live exchange rates refreshed from %s (effective date: %s).',
                            (string) ($refreshed['provider'] ?? 'Frankfurter API v2'),
                            (string) ($refreshed['effectiveDate'] ?? 'today')
                        ),
                    );
                } else {
                    $notice = array(
                        'type' => 'warning',
                        'msg'  => 'Could not reach Frankfurter API v2 (' . (string) ($refreshed['lastError'] ?? 'unknown error') . '). Preserved last-known-good cached rates.',
                    );
                }
            }
        } elseif ($action === 'save_draft') {
            $patch = outbound_cms_sanitize_section_patch($post_sec, $raw_payload);
            outbound_save_cms_draft_patch($patch, $post_sec);
            $notice = array('type' => 'info', 'msg' => 'Draft saved privately! Public visitors still see the live site until you click Publish Changes.');
        } elseif ($action === 'publish') {
            if ($post_sec === 'footer' && isset($raw_payload['currency_mode']) && function_exists('outbound_set_currency_mode')) {
                $mode = sanitize_key((string) $raw_payload['currency_mode']);
                outbound_set_currency_mode($mode);
                if ($mode === 'manual') {
                    update_option('outbound_currency_manual_updated_at', gmdate('c'), false);
                }
            }
            $patch = outbound_cms_sanitize_section_patch($post_sec, $raw_payload);
            outbound_publish_cms_changes($patch, $post_sec);
            $notice = array('type' => 'success', 'msg' => 'Changes published live across Outbound Holidays and snapshot cache refreshed.');
        }
    }

    $has_draft     = outbound_has_cms_draft();
    $draft_state   = outbound_get_cms_draft_state();
    $bundle        = outbound_get_effective_cms_bundle(true);
    $snapshot      = outbound_build_live_snapshot(true, true);
    $cms_opts      = (array) ($bundle['site_options'] ?? array());
    $preview_url   = home_url('/?outbound_preview=1');
    $live_url      = home_url('/');
    $sec_meta         = $sections[$active_section];
    $is_cpt_edit_mode = $active_cpt !== '' && ($edit_item_id > 0 || $is_new_item);
    $form_sections    = array('homepage', 'experiences', 'accommodation', 'packages', 'guides', 'testimonials', 'about-contact', 'header', 'footer', 'builder', 'design', 'seo');
    $has_form         = !$is_cpt_edit_mode && in_array($active_section, $form_sections, true);
    ?>
    <div class="wrap outbound-admin-wrap outbound-cms-shell">
        <div class="outbound-admin-header">
            <div>
                <h1>Outbound CMS — <?php echo outbound_cms_esc_html($sec_meta['label']); ?></h1>
                <p><?php echo outbound_cms_esc_html($sec_meta['desc']); ?></p>
            </div>
            <div class="outbound-header-actions">
                <?php if ($has_draft) : ?>
                    <span class="outbound-badge outbound-badge-amber">Unpublished Draft Staged</span>
                <?php else : ?>
                    <span class="outbound-badge outbound-badge-green">All Changes Live</span>
                <?php endif; ?>
                <a href="<?php echo outbound_cms_esc_url($preview_url); ?>" target="_blank" rel="noopener" class="button">Preview Draft Site</a>
                <a href="<?php echo outbound_cms_esc_url($live_url); ?>" target="_blank" rel="noopener" class="button button-primary">View Live Site</a>
            </div>
        </div>

        <?php if ($notice) : ?>
            <div class="notice notice-<?php echo outbound_cms_esc_attr($notice['type']); ?> is-dismissible">
                <p><strong><?php echo outbound_cms_esc_html($notice['msg']); ?></strong></p>
            </div>
        <?php endif; ?>

        <div class="outbound-cms-layout">
            <aside class="outbound-cms-sidebar" aria-label="Outbound CMS Sections">
                <div class="outbound-sidebar-group-title">CMS Sections (1–14)</div>
                <nav class="outbound-cms-nav">
                    <?php foreach ($sections as $sid => $sdata) :
                        $nav_url = admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($sid));
                        $is_curr = $sid === $active_section;
                        $is_dirty = !empty($draft_state['sections']) && in_array($sid, (array) $draft_state['sections'], true);
                    ?>
                        <a href="<?php echo outbound_cms_esc_url($nav_url); ?>" class="outbound-cms-nav-item<?php echo $is_curr ? ' is-active' : ''; ?>">
                            <span><?php echo outbound_cms_esc_html($sdata['label']); ?></span>
                            <?php if ($is_dirty) : ?>
                                <span class="outbound-dot-draft" title="Unpublished draft edits in this section"></span>
                            <?php endif; ?>
                        </a>
                    <?php endforeach; ?>
                </nav>

                <div class="outbound-sidebar-group-title">Operations & Tools</div>
                <nav class="outbound-cms-nav">
                    <a class="outbound-cms-nav-item" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-enquiries')); ?>">Customer Enquiries</a>
                    <a class="outbound-cms-nav-item" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-newsletter')); ?>">Newsletter Subscribers</a>
                    <a class="outbound-cms-nav-item" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-migration')); ?>">Content Migration</a>
                    <a class="outbound-cms-nav-item" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-setup-health')); ?>">Setup & Email Health</a>
                </nav>
            </aside>

            <main class="outbound-cms-main">
                <?php if ($is_cpt_edit_mode) : ?>
                    <?php outbound_cms_render_single_item_studio($active_section, $active_cpt, $edit_item_id, $is_new_item, $preview_url); ?>
                <?php else : ?>
                <?php if ($has_form) : ?>
                    <form method="post" action="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($active_section))); ?>" id="outbound-cms-form">
                        <?php wp_nonce_field('outbound_cms_hub_action', 'outbound_cms_hub_nonce'); ?>
                        <input type="hidden" name="outbound_cms_section" value="<?php echo outbound_cms_esc_attr($active_section); ?>" />
                <?php endif; ?>

                <?php
                switch ($active_section) {
                    case 'overview':
                        outbound_cms_render_section_overview($sections, $has_draft, $draft_state, $preview_url);
                        break;
                    case 'homepage':
                        outbound_cms_render_section_homepage($snapshot, $bundle, $cms_opts);
                        break;
                    case 'experiences':
                        outbound_cms_render_section_experiences($snapshot);
                        break;
                    case 'accommodation':
                        outbound_cms_render_section_accommodation($snapshot);
                        break;
                    case 'packages':
                        outbound_cms_render_section_packages($snapshot);
                        break;
                    case 'guides':
                        outbound_cms_render_section_guides($snapshot, $cms_opts);
                        break;
                    case 'galleries':
                        outbound_cms_render_section_galleries($snapshot);
                        break;
                    case 'testimonials':
                        outbound_cms_render_section_testimonials($snapshot);
                        break;
                    case 'about-contact':
                        outbound_cms_render_section_about_contact($snapshot, $cms_opts);
                        break;
                    case 'header':
                        outbound_cms_render_section_header($snapshot, $bundle);
                        break;
                    case 'footer':
                        outbound_cms_render_section_footer($snapshot, $cms_opts);
                        break;
                    case 'builder':
                        outbound_cms_render_section_builder($snapshot, $bundle);
                        break;
                    case 'design':
                        outbound_cms_render_section_design($bundle);
                        break;
                    case 'seo':
                        outbound_cms_render_section_seo($snapshot, $has_draft, $draft_state, $preview_url, $search, $paged);
                        break;
                }
                ?>

                <?php if ($has_form) : ?>
                    <div class="outbound-sticky-action-bar">
                        <div class="outbound-sticky-status">
                            <?php if ($has_draft) : ?>
                                <span class="outbound-badge outbound-badge-amber">Draft staged<?php echo !empty($draft_state['updatedAt']) ? ' · ' . outbound_cms_esc_html(gmdate('M j H:i', strtotime((string) $draft_state['updatedAt']))) . ' UTC' : ''; ?></span>
                            <?php else : ?>
                                <span class="outbound-badge outbound-badge-green">Synced with live site</span>
                            <?php endif; ?>
                        </div>
                        <div class="outbound-sticky-buttons">
                            <?php if ($has_draft) : ?>
                                <button type="submit" name="outbound_cms_hub_action" value="discard_draft" class="button-link-delete" onclick="return confirm('Discard all unpublished CMS draft changes?');">Discard Draft</button>
                            <?php endif; ?>
                            <a href="<?php echo outbound_cms_esc_url($preview_url); ?>" target="_blank" rel="noopener" class="button">Preview Draft</a>
                            <button type="submit" name="outbound_cms_hub_action" value="save_draft" class="button button-secondary">Save Draft</button>
                            <button type="submit" name="outbound_cms_hub_action" value="publish" class="button button-primary">Publish Changes</button>
                        </div>
                    </div>
                    </form>
                <?php endif; ?>

                <?php
                // Native WordPress CPT/Post tables render cleanly OUTSIDE the CMS options form so their own GET filter forms never nest forms.
                if ($active_section === 'experiences') {
                    outbound_cms_render_cpt_list_card('experience', 'Experience', 'Experiences', 'experiences', $search, $paged, 'experience_category');
                } elseif ($active_section === 'accommodation') {
                    outbound_cms_render_accommodation_dashboard($search, $paged);
                } elseif ($active_section === 'packages') {
                    outbound_cms_render_cpt_list_card('package', 'Package', 'Holiday Packages', 'packages', $search, $paged);
                } elseif ($active_section === 'guides') {
                    outbound_cms_render_cpt_list_card('guide_article', 'Planning Guide', 'Planning Guides', 'guides', $search, $paged);
                    outbound_cms_render_cpt_list_card('post', 'Blog Article', 'Blog Posts', 'guides', $search, $paged, 'category');
                } elseif ($active_section === 'galleries') {
                    outbound_cms_render_cpt_list_card('client_album', 'Client Album', 'Client Albums', 'galleries', $search, $paged);
                }
                ?>
                <?php endif; ?>
            </main>
        </div>
    </div>
    <?php
}

/**
 * Section 1: Website Overview
 */
function outbound_cms_render_section_overview(array $sections, bool $has_draft, array $draft_state, string $preview_url): void {
    global $wpdb;
    $count_pub = static function (string $pt): int {
        $c = wp_count_posts($pt);
        return isset($c->publish) ? (int) $c->publish : 0;
    };

    $tables = outbound_get_table_names();
    $enq_count = 0;
    $sub_count = 0;
    if (isset($wpdb)) {
        $has_enq = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tables['enquiries']));
        if ($has_enq === $tables['enquiries']) {
            $enq_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['enquiries']}");
        }
        $has_sub = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tables['subscribers']));
        if ($has_sub === $tables['subscribers']) {
            $sub_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['subscribers']} WHERE status = 'confirmed'");
        }
    }
    ?>
    <div class="outbound-kpi-grid">
        <div class="outbound-kpi-box"><span>Accommodations (WP)</span><strong><?php echo $count_pub('accommodation'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Experiences (WP)</span><strong><?php echo $count_pub('experience'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Packages (WP)</span><strong><?php echo $count_pub('package'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Planning Guides</span><strong><?php echo $count_pub('guide_article'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Blog Posts</span><strong><?php echo $count_pub('post'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Client Albums</span><strong><?php echo $count_pub('client_album'); ?></strong></div>
        <div class="outbound-kpi-box"><span>Customer Enquiries</span><strong><?php echo $enq_count; ?></strong></div>
        <div class="outbound-kpi-box"><span>Confirmed Subscribers</span><strong><?php echo $sub_count; ?></strong></div>
    </div>

    <div class="outbound-admin-card">
        <h2>Draft & Publishing Workflow</h2>
        <?php if ($has_draft) : ?>
            <p><strong>Status:</strong> Unpublished draft changes are staged in <code>outbound_cms_draft_state</code> (<?php echo outbound_cms_esc_html(implode(', ', (array) ($draft_state['sections'] ?? array('general')))); ?>). Visitors still see the published site.</p>
            <form method="post" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                <?php wp_nonce_field('outbound_cms_hub_action', 'outbound_cms_hub_nonce'); ?>
                <input type="hidden" name="outbound_cms_section" value="overview" />
                <a href="<?php echo outbound_cms_esc_url($preview_url); ?>" target="_blank" rel="noopener" class="button">Open Private Draft Preview</a>
                <button type="submit" name="outbound_cms_hub_action" value="publish" class="button button-primary">Publish All Draft Changes Live</button>
                <button type="submit" name="outbound_cms_hub_action" value="discard_draft" class="button-link-delete" onclick="return confirm('Discard all unpublished draft changes?');">Discard Draft</button>
            </form>
        <?php else : ?>
            <p><strong>Status:</strong> Published and in sync. Any edits saved with <strong>Save Draft</strong> inside Sections 2–14 can be tested via <strong>Preview Draft Site</strong> before going live.</p>
        <?php endif; ?>
    </div>

    <div class="outbound-admin-card">
        <h2>14 CMS Modules Quick Directory</h2>
        <div class="outbound-quick-grid">
            <?php foreach ($sections as $sid => $sdata) :
                if ($sid === 'overview') {
                    continue;
                }
            ?>
                <a class="outbound-quick-tile" href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=' . rawurlencode($sid))); ?>">
                    <strong><?php echo outbound_cms_esc_html($sdata['label']); ?></strong>
                    <span><?php echo outbound_cms_esc_html($sdata['desc']); ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
}

/**
 * Section 2: Homepage & Hero
 */
function outbound_cms_render_section_homepage(array $snapshot, array $bundle, array $cms_opts): void {
    $sec = (array) ($cms_opts['homepageSections'] ?? array());
    $hero_eyebrow = outbound_cms_get_ed($snapshot, 'travel/TravelHero.eyebrow', 'Victoria Falls Specialist');
    $hero_h1      = outbound_cms_get_ed($snapshot, 'travel/TravelHero.headlineLine1', '');
    $hero_h2      = outbound_cms_get_ed($snapshot, 'travel/TravelHero.headlineLine2', '');
    $hero_sub     = outbound_cms_get_ed($snapshot, 'travel/TravelHero.subtitle', '');
    $hero_cta     = outbound_cms_get_ed($snapshot, 'travel/TravelHero.ctaLabel', outbound_cms_get_ed($snapshot, 'common/Header.text13', 'Plan My Holiday'));
    $hero_dest    = outbound_cms_get_ed($snapshot, 'travel/TravelHero.ctaDestination', 'modal');
    $hero_browse  = outbound_cms_get_ed($snapshot, 'travel/TravelHero.text10', 'Browse Packages');
    $hero_img     = outbound_cms_get_ed($snapshot, 'travel/TravelHero.heroImage', outbound_get_media_fallback('hero'));
    $hero_alt     = outbound_cms_get_ed($snapshot, 'travel/TravelHero.heroImageAlt', 'Victoria Falls panoramic spray over the canyon and rainforest');

    $why_cards = $snapshot['site']['editorial']['structures']['travel/WhyChooseOutbound.section1'] ?? array();
    $featured  = (array) ($snapshot['site']['featured'] ?? array());
    ?>
    <div class="outbound-hero-editor-grid">
        <div class="outbound-admin-card">
            <h2>Homepage Hero Content & Media</h2>
            <p class="description">Leave Headline Lines blank to keep rotating Family / Honeymoon / Safari persona slides, or enter a custom Headline + Subtitle to pin your chosen message.</p>
            <table class="form-table">
                <tr>
                    <th><label for="ed_hero_eyebrow">Eyebrow / Badge</label></th>
                    <td><input type="text" id="ed_hero_eyebrow" name="cms[ed][travel/TravelHero.eyebrow]" value="<?php echo outbound_cms_esc_attr($hero_eyebrow); ?>" class="regular-text outbound-live-hero-input" data-hero-target="#preview_hero_eyebrow" /></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_h1">Custom Headline Line 1</label></th>
                    <td><input type="text" id="ed_hero_h1" name="cms[ed][travel/TravelHero.headlineLine1]" value="<?php echo outbound_cms_esc_attr($hero_h1); ?>" class="large-text outbound-live-hero-input" data-hero-target="#preview_hero_h1" placeholder="Optional override (defaults to rotating Persona titles)" /></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_h2">Custom Headline Line 2 (Accent)</label></th>
                    <td><input type="text" id="ed_hero_h2" name="cms[ed][travel/TravelHero.headlineLine2]" value="<?php echo outbound_cms_esc_attr($hero_h2); ?>" class="large-text outbound-live-hero-input" data-hero-target="#preview_hero_h2" placeholder="Optional second line in Golden Savannah" /></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_sub">Hero Subtitle</label></th>
                    <td><textarea id="ed_hero_sub" rows="3" name="cms[ed][travel/TravelHero.subtitle]" class="large-text outbound-live-hero-input" data-hero-target="#preview_hero_sub" placeholder="Optional override of persona description"><?php echo outbound_cms_esc_html($hero_sub); ?></textarea></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_cta">Primary CTA & Browse Labels</label></th>
                    <td>
                        <input type="text" id="ed_hero_cta" name="cms[ed][travel/TravelHero.ctaLabel]" value="<?php echo outbound_cms_esc_attr($hero_cta); ?>" class="regular-text outbound-live-hero-input" data-hero-target="#preview_hero_cta" />
                        <input type="text" name="cms[ed][travel/TravelHero.text10]" value="<?php echo outbound_cms_esc_attr($hero_browse); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th><label for="ed_hero_dest">Primary CTA Action</label></th>
                    <td>
                        <?php
                        $hero_dest_norm = match ($hero_dest) {
                            '/experiences'   => '/things-to-do-in-victoria-falls',
                            '/accommodation' => '/victoria-falls-accommodation',
                            'packages'       => '/victoria-falls-packages',
                            'contact'        => '/contact',
                            default          => $hero_dest,
                        };
                        ?>
                        <select id="ed_hero_dest" name="cms[ed][travel/TravelHero.ctaDestination]">
                            <option value="modal" <?php selected($hero_dest_norm, 'modal'); ?>>Open Optional Holiday Builder Modal (Default)</option>
                            <option value="whatsapp" <?php selected($hero_dest_norm, 'whatsapp'); ?>>Chat Directly on WhatsApp</option>
                            <option value="/contact" <?php selected($hero_dest_norm, '/contact'); ?>>Open Contact Enquiry Form (/contact)</option>
                            <option value="/victoria-falls-packages" <?php selected($hero_dest_norm, '/victoria-falls-packages'); ?>>Browse Holiday Packages (/victoria-falls-packages)</option>
                            <option value="/things-to-do-in-victoria-falls" <?php selected($hero_dest_norm, '/things-to-do-in-victoria-falls'); ?>>Browse Things to Do (/things-to-do-in-victoria-falls)</option>
                            <option value="/victoria-falls-accommodation" <?php selected($hero_dest_norm, '/victoria-falls-accommodation'); ?>>Browse Where to Stay (/victoria-falls-accommodation)</option>
                            <option value="/victoria-falls-guide" <?php selected($hero_dest_norm, '/victoria-falls-guide'); ?>>Read Victoria Falls Guide (/victoria-falls-guide)</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>Hero Background Image</th>
                    <td><?php outbound_cms_render_media_input('cms[ed][travel/TravelHero.heroImage]', $hero_img, 'outbound_hero_img_picker', outbound_get_media_fallback('hero')); ?></td>
                </tr>
                <tr>
                    <th><label for="ed_hero_alt">Hero Image Alt Text</label></th>
                    <td><input type="text" id="ed_hero_alt" name="cms[ed][travel/TravelHero.heroImageAlt]" value="<?php echo outbound_cms_esc_attr($hero_alt); ?>" class="large-text" /></td>
                </tr>
            </table>

            <details class="outbound-collapsible">
                <summary>Persona Rotating Slides (Family / Honeymoon / Safari) & Confidence Points</summary>
                <div class="outbound-collapsible-body">
                    <table class="form-table">
                        <tr><th>Family Slide Headline / Copy</th><td>
                            <input type="text" name="cms[ed][travel/TravelHero.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text1')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text2')); ?>" class="regular-text" />
                            <textarea rows="2" name="cms[ed][travel/TravelHero.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text3')); ?></textarea>
                        </td></tr>
                        <tr><th>Honeymoon Slide Headline / Copy</th><td>
                            <input type="text" name="cms[ed][travel/TravelHero.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text4')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text5')); ?>" class="regular-text" />
                            <textarea rows="2" name="cms[ed][travel/TravelHero.text6]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text6')); ?></textarea>
                        </td></tr>
                        <tr><th>Safari Slide Headline / Copy</th><td>
                            <input type="text" name="cms[ed][travel/TravelHero.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text7')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text8')); ?>" class="regular-text" />
                            <textarea rows="2" name="cms[ed][travel/TravelHero.text9]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text9')); ?></textarea>
                        </td></tr>
                        <tr><th>Hero Confidence Box</th><td>
                            <input type="text" name="cms[ed][travel/TravelHero.text11]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text11')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text12')); ?>" class="regular-text" />
                            <input type="text" name="cms[ed][travel/TravelHero.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravelHero.text13')); ?>" class="regular-text" />
                        </td></tr>
                    </table>
                </div>
            </details>
        </div>

        <div class="outbound-admin-card outbound-hero-preview-card">
            <h2>Live Hero Preview</h2>
            <div class="outbound-hero-mockup" style="background-image: linear-gradient(100deg, rgba(13,40,51,0.88), rgba(11,94,142,0.52)), url('<?php echo outbound_cms_esc_url($hero_img); ?>');">
                <span class="outbound-mockup-badge" id="preview_hero_eyebrow"><?php echo outbound_cms_esc_html($hero_eyebrow); ?></span>
                <h3>
                    <span id="preview_hero_h1"><?php echo outbound_cms_esc_html($hero_h1 !== '' ? $hero_h1 : outbound_cms_get_ed($snapshot, 'travel/TravelHero.text1')); ?></span>
                    <em id="preview_hero_h2"><?php echo outbound_cms_esc_html($hero_h2 !== '' ? $hero_h2 : outbound_cms_get_ed($snapshot, 'travel/TravelHero.text2')); ?></em>
                </h3>
                <p id="preview_hero_sub"><?php echo outbound_cms_esc_html($hero_sub !== '' ? $hero_sub : outbound_cms_get_ed($snapshot, 'travel/TravelHero.text3')); ?></p>
                <span class="outbound-mockup-btn" id="preview_hero_cta"><?php echo outbound_cms_esc_html($hero_cta); ?></span>
            </div>
        </div>
    </div>

    <div class="outbound-admin-card">
        <h2>Homepage Section Visibility Toggles</h2>
        <div class="outbound-toggle-grid">
            <?php
            $toggles = array(
                'showPlanYourHoliday' => 'Plan Your Holiday Section',
                'showQuickPlanning'   => 'Victoria Falls Travel Guide (4 Cards)',
                'showExperiences'     => 'Featured Experiences',
                'showPackages'      => 'Recommended Packages',
                'showWhereToStay'   => 'Where to Stay',
                'showGuides'        => 'Victoria Falls Travel Guide',
                'showWhyOutbound'   => 'Why Plan with Outbound',
                'showStories'       => 'Traveller Stories',
                'showClientGallery' => 'Client Gallery Preview',
                'showFinalCta'      => 'Final CTA Banner',
                'showNewsletter'    => 'Global Travel Club Newsletter',
            );
            foreach ($toggles as $tk => $tl) :
                $checked = !array_key_exists($tk, $sec) || !empty($sec[$tk]);
            ?>
                <label class="outbound-toggle-pill">
                    <input type="checkbox" name="cms[vis][<?php echo outbound_cms_esc_attr($tk); ?>]" value="1" <?php checked($checked); ?> />
                    <span><?php echo outbound_cms_esc_html($tl); ?></span>
                </label>
            <?php endforeach; ?>
        </div>
    </div>

    <details class="outbound-admin-card outbound-collapsible" open>
        <summary>Plan Your Holiday Section ("You Dream It. We'll Help You Plan It.")</summary>
        <div class="outbound-collapsible-body">
            <table class="form-table">
                <tr><th>Eyebrow Text</th><td><input type="text" name="cms[ed][travel/PlanYourHoliday.eyebrow]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.eyebrow', 'YOUR HOLIDAY, MADE EASIER')); ?>" class="regular-text" /></td></tr>
                <tr><th>Main Heading</th><td><input type="text" name="cms[ed][travel/PlanYourHoliday.heading]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.heading', "You Dream It. We'll Help You Plan It.")); ?>" class="large-text" /></td></tr>
                <tr><th>Supporting Description (Optional)</th><td><textarea rows="2" name="cms[ed][travel/PlanYourHoliday.description]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.description', '')); ?></textarea></td></tr>
                <tr><th>Step 1 — Title &amp; Description</th><td>
                    <input type="text" name="cms[ed][travel/PlanYourHoliday.step1Title]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.step1Title', 'Tell Us Your Plans')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/PlanYourHoliday.step1Desc]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.step1Desc', 'Share your travel dates, group size and budget.')); ?>" class="large-text" />
                </td></tr>
                <tr><th>Step 2 — Title &amp; Description</th><td>
                    <input type="text" name="cms[ed][travel/PlanYourHoliday.step2Title]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.step2Title', 'Get Local Advice')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/PlanYourHoliday.step2Desc]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.step2Desc', "We'll recommend stays and experiences that fit your needs.")); ?>" class="large-text" />
                </td></tr>
                <tr><th>Step 3 — Title &amp; Description</th><td>
                    <input type="text" name="cms[ed][travel/PlanYourHoliday.step3Title]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.step3Title', 'We Handle the Details')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/PlanYourHoliday.step3Desc]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.step3Desc', "We'll help arrange your bookings and itinerary.")); ?>" class="large-text" />
                </td></tr>
                <tr><th>CTA Button &amp; Supporting Text</th><td>
                    <input type="text" name="cms[ed][travel/PlanYourHoliday.ctaText]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.ctaText', 'Start Planning With Us')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/PlanYourHoliday.ctaSubtext]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.ctaSubtext', 'Talk to our local Victoria Falls team')); ?>" class="regular-text" />
                </td></tr>
                <tr><th>WhatsApp Destination URL</th><td><input type="url" name="cms[ed][travel/PlanYourHoliday.whatsappUrl]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/PlanYourHoliday.whatsappUrl', 'https://wa.me/263714701721?text=Hello%20Outbound%20Holidays%21%20I%27d%20like%20help%20planning%20a%20Victoria%20Falls%20holiday.')); ?>" class="large-text" /></td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible" open>
        <summary>Quick Planning Bar (4 Planning Cards)</summary>
        <div class="outbound-collapsible-body">
            <table class="form-table">
                <tr><th>Section Heading</th><td><input type="text" name="cms[ed][travel/QuickPlanningBar.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text5', 'Start Planning Your Victoria Falls Holiday')); ?>" class="large-text" /></td></tr>
                <tr><th>Section Subheading</th><td><input type="text" name="cms[ed][travel/QuickPlanningBar.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text6', 'Find practical answers on when to visit, entry requirements, getting here and what to experience.')); ?>" class="large-text" /></td></tr>
            </table>
            <div class="outbound-meta-grid">
                <p><label><strong>Card 1 — Title &amp; Subtitle (Calendar)</strong><br>
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text1', 'Best Time to Visit')); ?>" class="widefat" placeholder="Card 1 Title" />
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.copy1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.copy1', 'Water levels, weather & seasons')); ?>" class="widefat" style="margin-top:4px;" placeholder="Card 1 Subtitle" />
                </label></p>
                <p><label><strong>Card 2 — Title &amp; Subtitle (Visa)</strong><br>
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text2', 'Visa & Entry Requirements')); ?>" class="widefat" placeholder="Card 2 Title" />
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.copy2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.copy2', 'Kaza Univisa, Zimbabwe & Zambia')); ?>" class="widefat" style="margin-top:4px;" placeholder="Card 2 Subtitle" />
                </label></p>
                <p><label><strong>Card 3 — Title &amp; Subtitle (Getting Here)</strong><br>
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text3', 'Getting Here')); ?>" class="widefat" placeholder="Card 3 Title" />
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.copy3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.copy3', 'Flights, airport transfers & border crossings')); ?>" class="widefat" style="margin-top:4px;" placeholder="Card 3 Subtitle" />
                </label></p>
                <p><label><strong>Card 4 — Title &amp; Subtitle (Top Experiences)</strong><br>
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.text4', 'Top Experiences')); ?>" class="widefat" placeholder="Card 4 Title" />
                    <input type="text" name="cms[ed][travel/QuickPlanningBar.topExperiencesSubtitle]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/QuickPlanningBar.topExperiencesSubtitle', 'Helicopter, safaris & cruises')); ?>" class="widefat" style="margin-top:4px;" placeholder="Card 4 Subtitle" />
                </label></p>
            </div>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Featured Experiences Section (Headings &amp; Button Labels)</summary>
        <div class="outbound-collapsible-body">
            <p class="description">Edit the text shown for the Featured Experiences section on the homepage. To edit individual experience photos, prices, or descriptions, visit <a href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=experiences')); ?>">Section 3: Experiences</a>.</p>
            <table class="form-table">
                <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/FeaturedExperiences.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text1')); ?>" class="regular-text" /></td></tr>
                <tr><th>Section Heading</th><td><input type="text" name="cms[ed][travel/FeaturedExperiences.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text2')); ?>" class="large-text" /></td></tr>
                <tr><th>Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/FeaturedExperiences.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text3')); ?></textarea></td></tr>
                <tr><th>Card Button &amp; Bottom CTA</th><td>
                    <input type="text" name="cms[ed][travel/FeaturedExperiences.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text5')); ?>" class="regular-text" placeholder="View Experience" />
                    <input type="text" name="cms[ed][travel/FeaturedExperiences.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text6')); ?>" class="regular-text" placeholder="Explore All Experiences" />
                </td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Recommended Packages Section (Headings &amp; Button Labels)</summary>
        <div class="outbound-collapsible-body">
            <p class="description">Edit the text shown for the Recommended Packages section on the homepage. To edit package photos, itineraries, or pricing, visit <a href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=packages')); ?>">Section 5: Packages</a>.</p>
            <table class="form-table">
                <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/FeaturedPackages.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text1')); ?>" class="regular-text" /></td></tr>
                <tr><th>Section Heading</th><td><input type="text" name="cms[ed][travel/FeaturedPackages.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text2')); ?>" class="large-text" /></td></tr>
                <tr><th>Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/FeaturedPackages.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text3')); ?></textarea></td></tr>
                <tr><th>Pricing Estimate Note</th><td><textarea rows="2" name="cms[ed][travel/FeaturedPackages.text4]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text4')); ?></textarea></td></tr>
                <tr><th>Card Button &amp; Bottom CTA</th><td>
                    <input type="text" name="cms[ed][travel/FeaturedPackages.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text8')); ?>" class="regular-text" placeholder="View Holiday Details" />
                    <input type="text" name="cms[ed][travel/FeaturedPackages.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text9')); ?>" class="regular-text" placeholder="Explore All Packages" />
                </td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Where to Stay Section (Headings &amp; Button Labels)</summary>
        <div class="outbound-collapsible-body">
            <p class="description">Edit the text shown for the Where to Stay section on the homepage. To edit lodge photos, rooms, or amenities, visit <a href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=accommodation')); ?>">Section 4: Accommodation</a>.</p>
            <table class="form-table">
                <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/WhereToStaySection.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text1')); ?>" class="regular-text" /></td></tr>
                <tr><th>Section Heading</th><td><input type="text" name="cms[ed][travel/WhereToStaySection.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text2')); ?>" class="large-text" /></td></tr>
                <tr><th>Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/WhereToStaySection.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text3')); ?></textarea></td></tr>
                <tr><th>Card Button &amp; Bottom CTA</th><td>
                    <input type="text" name="cms[ed][travel/WhereToStaySection.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text7')); ?>" class="regular-text" placeholder="View Property Details" />
                    <input type="text" name="cms[ed][travel/WhereToStaySection.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text8')); ?>" class="regular-text" placeholder="Explore All Lodges & Hotels" />
                </td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Victoria Falls Travel Guide Section (Headings &amp; 4 Preview Cards)</summary>
        <div class="outbound-collapsible-body">
            <p class="description">Edit the Victoria Falls Travel Guide preview section on the homepage. Manage full articles in <a href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=guides')); ?>">Section 6: Guides &amp; Articles</a>.</p>
            <table class="form-table">
                <tr><th>Badge &amp; Section Heading</th><td>
                    <input type="text" name="cms[ed][travel/VicFallsGuide.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text9')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/VicFallsGuide.text10]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text10')); ?>" class="large-text" />
                </td></tr>
                <tr><th>Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/VicFallsGuide.text11]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text11')); ?></textarea></td></tr>
                <tr><th>Card Link &amp; Bottom Button</th><td>
                    <input type="text" name="cms[ed][travel/VicFallsGuide.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text12')); ?>" class="regular-text" placeholder="Explore in Travel Guide" />
                    <input type="text" name="cms[ed][travel/VicFallsGuide.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text13')); ?>" class="regular-text" placeholder="Read the Complete Travel Guide" />
                </td></tr>
            </table>
            <div class="outbound-meta-grid">
                <p><label><strong>Guide Card 1 Title &amp; Summary</strong><br>
                    <input type="text" name="cms[ed][travel/VicFallsGuide.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text1')); ?>" class="widefat" />
                    <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text2]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text2')); ?></textarea>
                </label></p>
                <p><label><strong>Guide Card 2 Title &amp; Summary</strong><br>
                    <input type="text" name="cms[ed][travel/VicFallsGuide.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text3')); ?>" class="widefat" />
                    <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text4]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text4')); ?></textarea>
                </label></p>
                <p><label><strong>Guide Card 3 Title &amp; Summary</strong><br>
                    <input type="text" name="cms[ed][travel/VicFallsGuide.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text5')); ?>" class="widefat" />
                    <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text6]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text6')); ?></textarea>
                </label></p>
                <p><label><strong>Guide Card 4 Title &amp; Summary</strong><br>
                    <input type="text" name="cms[ed][travel/VicFallsGuide.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text7')); ?>" class="widefat" />
                    <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text8]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text8')); ?></textarea>
                </label></p>
            </div>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Traveller Stories &amp; Google Reviews (Homepage Headings)</summary>
        <div class="outbound-collapsible-body">
            <p class="description">Edit the Traveller Stories section headings and Google rating card. To add, edit, or reorder individual guest testimonials and avatars, visit <a href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=testimonials')); ?>">Section 8: Testimonials &amp; Reviews</a>.</p>
            <table class="form-table">
                <tr><th>Badge &amp; Heading</th><td>
                    <input type="text" name="cms[ed][travel/TravellerStories.badge]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.badge', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text4'))); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/TravellerStories.heading]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.heading', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text5'))); ?>" class="large-text" />
                </td></tr>
                <tr><th>Subheading</th><td><textarea rows="2" name="cms[ed][travel/TravellerStories.subheading]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.subheading', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text6'))); ?></textarea></td></tr>
                <tr><th>Google Score &amp; Review Card</th><td>
                    <input type="text" name="cms[ed][travel/TravellerStories.score]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.score', '5.0')); ?>" class="small-text" />
                    <input type="text" name="cms[ed][travel/TravellerStories.cardTitle]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.cardTitle', '5.0 Google Rating · Outbound Holidays')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/TravellerStories.ctaLabel]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.ctaLabel', 'Read Google Reviews')); ?>" class="regular-text" />
                </td></tr>
                <tr><th>Google Reviews URL</th><td><input type="url" name="cms[ed][travel/TravellerStories.reviewUrl]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.reviewUrl', 'https://g.page/r/CW8xeS7qssHkECE/review')); ?>" class="large-text code" /></td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Client Gallery Preview (Homepage Headings &amp; Media)</summary>
        <div class="outbound-collapsible-body">
            <p class="description">Edit the Client Gallery preview section on the homepage. To upload or manage client photos and albums, visit <a href="<?php echo outbound_cms_esc_url(admin_url('admin.php?page=outbound-cms&section=galleries')); ?>">Section 7: Galleries</a>.</p>
            <table class="form-table">
                <tr><th>Eyebrow Badge &amp; Heading</th><td>
                    <input type="text" name="cms[ed][travel/ClientGallery.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/ClientGallery.text2', 'Holiday memories')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/ClientGallery.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/ClientGallery.text3', 'Client Gallery')); ?>" class="large-text" />
                </td></tr>
                <tr><th>Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/ClientGallery.text4]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/ClientGallery.text4', 'A glimpse of the holidays and experiences our clients have enjoyed with Outbound Holidays.')); ?></textarea></td></tr>
                <tr><th>Explore Button Label</th><td><input type="text" name="cms[ed][travel/ClientGallery.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/ClientGallery.text5', 'See Gallery')); ?>" class="regular-text" /></td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Final Call-to-Action Banner (Text, Buttons &amp; Background Image)</summary>
        <div class="outbound-collapsible-body">
            <?php
            $final_cta_bg = outbound_cms_get_ed(
                $snapshot,
                'travel/FinalCtaBanner.backgroundImage',
                (string) ($snapshot['site']['editorial']['structures']['travel/FinalCtaBanner.fallsTour1'] ?? outbound_get_media_fallback('falls'))
            );
            ?>
            <table class="form-table">
                <tr><th>Eyebrow &amp; Heading</th><td>
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text1', 'START YOUR JOURNEY')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text2', 'Ready to Plan Your Victoria Falls Holiday?')); ?>" class="large-text" />
                </td></tr>
                <tr><th>Description</th><td>
                    <textarea rows="2" name="cms[ed][travel/FinalCtaBanner.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text3')); ?></textarea>
                </td></tr>
                <tr><th>Primary &amp; WhatsApp Buttons</th><td>
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text4', 'Plan My Holiday')); ?>" class="regular-text" placeholder="Plan My Holiday" />
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text5', 'Chat on WhatsApp')); ?>" class="regular-text" placeholder="Chat on WhatsApp" />
                </td></tr>
                <tr><th>Trust Guarantee Line</th><td>
                    <input type="text" name="cms[ed][travel/FinalCtaBanner.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FinalCtaBanner.text6', 'Free initial consultation • Honest guidance • No obligation to book')); ?>" class="large-text" />
                </td></tr>
                <tr><th>Banner Background Image</th><td>
                    <?php outbound_cms_render_media_input('cms[ed][travel/FinalCtaBanner.backgroundImage]', $final_cta_bg, 'outbound_final_cta_bg_picker', outbound_get_media_fallback('falls')); ?>
                </td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Victoria Falls Travel Club Newsletter (Homepage Section)</summary>
        <div class="outbound-collapsible-body">
            <table class="form-table">
                <tr><th>Kicker &amp; Heading</th><td>
                    <input type="text" name="cms[ed][common/Newsletter.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text1', 'Victoria Falls Travel Club')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][common/Newsletter.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text2', 'Stay Connected With Victoria Falls')); ?>" class="large-text" />
                </td></tr>
                <tr><th>Section Subtitle</th><td>
                    <textarea rows="2" name="cms[ed][common/Newsletter.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'common/Newsletter.text3')); ?></textarea>
                </td></tr>
                <tr><th>Email Placeholder &amp; Button</th><td>
                    <input type="text" name="cms[ed][common/Newsletter.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text6', 'Enter your email address...')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][common/Newsletter.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text7', 'Subscribe')); ?>" class="regular-text" />
                </td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Why Plan With Outbound Holidays — Repeater Cards & Budget Callout</summary>
        <div class="outbound-collapsible-body">
            <table class="form-table">
                <tr><th>Section Badge & Heading</th><td>
                    <input type="text" name="cms[ed][travel/WhyChooseOutbound.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text13')); ?>" class="regular-text" />
                    <input type="text" name="cms[ed][travel/WhyChooseOutbound.text14]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text14')); ?>" class="large-text" />
                </td></tr>
            </table>

            <div class="outbound-repeater" data-repeater="why-cards">
                <div class="outbound-repeater-list">
                    <?php foreach ((array) $why_cards as $idx => $card) :
                        $icon_name = (string) ($card['icon']['$icon'] ?? ($card['iconName'] ?? 'ShieldCheck'));
                    ?>
                        <div class="outbound-repeater-row">
                            <div class="outbound-repeater-head">
                                <strong>Card #<span class="outbound-row-num"><?php echo $idx + 1; ?></span></strong>
                                <div class="outbound-repeater-actions">
                                    <button type="button" class="button button-small outbound-row-up">Up</button>
                                    <button type="button" class="button button-small outbound-row-down">Down</button>
                                    <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                                </div>
                            </div>
                            <div class="outbound-meta-grid">
                                <p><label>Icon<br><select name="cms[why_cards][<?php echo $idx; ?>][iconName]">
                                    <?php foreach (array('ShieldCheck', 'MapPin', 'Sparkles', 'Headset') as $ic) : ?>
                                        <option value="<?php echo $ic; ?>" <?php selected($icon_name, $ic); ?>><?php echo $ic; ?></option>
                                    <?php endforeach; ?>
                                </select></label></p>
                                <p><label>Card Title<br><input type="text" name="cms[why_cards][<?php echo $idx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($card['title'] ?? '')); ?>" class="regular-text" /></label></p>
                                <p><label>Footer Label<br><input type="text" name="cms[why_cards][<?php echo $idx; ?>][label]" value="<?php echo outbound_cms_esc_attr((string) ($card['label'] ?? '')); ?>" class="regular-text" /></label></p>
                            </div>
                            <p><label>Description<br><textarea rows="2" name="cms[why_cards][<?php echo $idx; ?>][description]" class="large-text"><?php echo outbound_cms_esc_html((string) ($card['description'] ?? '')); ?></textarea></label></p>
                        </div>
                    <?php endforeach; ?>
                </div>
                <button type="button" class="button outbound-row-add">+ Add Why Outbound Card</button>
            </div>

            <table class="form-table">
                <tr><th>Budget Callout Heading & Button</th><td>
                    <input type="text" name="cms[ed][travel/WhyChooseOutbound.text16]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text16')); ?>" class="large-text" />
                    <textarea rows="2" name="cms[ed][travel/WhyChooseOutbound.text17]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text17')); ?></textarea>
                    <input type="text" name="cms[ed][travel/WhyChooseOutbound.text18]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhyChooseOutbound.text18')); ?>" class="regular-text" />
                </td></tr>
            </table>
        </div>
    </details>

    <details class="outbound-admin-card outbound-collapsible">
        <summary>Featured Homepage Curations (Select &amp; Edit Images, Titles &amp; Details for Stays, Experiences &amp; Packages)</summary>
        <div class="outbound-collapsible-body outbound-featured-grid">
            <div>
                <h3>Featured Stays</h3>
                <?php
                $sel_stays = (array) ($featured['accommodationIds'] ?? array());
                foreach ((array) ($snapshot['accommodations'] ?? array()) as $acc) :
                    $sid       = (string) ($acc['slug'] ?? ($acc['id'] ?? ''));
                    $s_name    = (string) ($acc['name'] ?? $sid);
                    $s_img     = (string) ($acc['heroImage'] ?? '');
                    $s_badge   = (string) ($acc['badge'] ?? '');
                    $s_price   = isset($acc['priceFromUSD']) ? (string) $acc['priceFromUSD'] : '';
                    $s_desc    = (string) ($acc['shortDescription'] ?? '');
                    $s_checked = in_array($sid, $sel_stays, true) || in_array((string) ($acc['id'] ?? ''), $sel_stays, true);
                    $s_post    = $sid !== '' ? get_page_by_path($sid, OBJECT, 'accommodation') : null;
                    $s_studio  = $s_post instanceof WP_Post
                        ? admin_url('admin.php?page=outbound-cms&section=accommodation&edit_item=' . (int) $s_post->ID)
                        : ($sid !== '' ? wp_nonce_url(admin_url('admin.php?page=outbound-cms&section=accommodation&import_slug=' . rawurlencode($sid)), 'outbound_import_baseline_acc') : '');
                ?>
                    <div class="outbound-repeater-item" style="margin-bottom:10px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;">
                        <div style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
                            <label class="outbound-check-row" style="margin:0;display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" name="cms[featured][accommodationIds][]" value="<?php echo outbound_cms_esc_attr($sid); ?>" <?php checked($s_checked); ?> />
                                <?php if ($s_img !== '') : ?>
                                    <img src="<?php echo outbound_cms_esc_url($s_img); ?>" alt="" style="width:40px;height:30px;object-fit:cover;border-radius:4px;" />
                                <?php endif; ?>
                                <strong><?php echo outbound_cms_esc_html($s_name); ?></strong>
                            </label>
                            <?php if ($s_studio !== '') : ?>
                                <a class="button button-small" href="<?php echo outbound_cms_esc_url($s_studio); ?>"><?php echo $s_post instanceof WP_Post ? 'Edit in Studio' : 'Import &amp; Edit in Studio'; ?></a>
                            <?php endif; ?>
                        </div>
                        <details style="margin-top:8px;">
                            <summary style="cursor:pointer;font-size:12px;color:#0B5E8E;font-weight:600;">Edit Image &amp; Card Details</summary>
                            <div style="margin-top:8px;display:grid;gap:8px;">
                                <?php outbound_cms_render_media_input('cms[featured_overrides][accommodations][' . $sid . '][image]', $s_img, 'feat_acc_img_' . sanitize_key($sid)); ?>
                                <input type="text" name="cms[featured_overrides][accommodations][<?php echo outbound_cms_esc_attr($sid); ?>][title]" value="<?php echo outbound_cms_esc_attr($s_name); ?>" placeholder="Property Name" class="regular-text" />
                                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                    <input type="text" name="cms[featured_overrides][accommodations][<?php echo outbound_cms_esc_attr($sid); ?>][badge]" value="<?php echo outbound_cms_esc_attr($s_badge); ?>" placeholder="Badge (e.g. Best Value)" class="regular-text" style="flex:1;" />
                                    <input type="number" step="1" min="0" name="cms[featured_overrides][accommodations][<?php echo outbound_cms_esc_attr($sid); ?>][price]" value="<?php echo outbound_cms_esc_attr($s_price); ?>" placeholder="Price USD" class="small-text" />
                                </div>
                                <textarea rows="2" name="cms[featured_overrides][accommodations][<?php echo outbound_cms_esc_attr($sid); ?>][description]" placeholder="Short Description" class="large-text"><?php echo outbound_cms_esc_html($s_desc); ?></textarea>
                            </div>
                        </details>
                    </div>
                <?php endforeach; ?>
            </div>
            <div>
                <h3>Featured Experiences</h3>
                <?php
                $sel_exp = (array) ($featured['experienceIds'] ?? array());
                foreach ((array) ($snapshot['experiences'] ?? array()) as $exp) :
                    $eid       = (string) ($exp['slug'] ?? ($exp['id'] ?? ''));
                    $e_title   = (string) ($exp['title'] ?? $eid);
                    $e_img     = (string) ($exp['featuredImage'] ?? '');
                    $e_badge   = (string) ($exp['badge'] ?? '');
                    $e_dur     = (string) ($exp['duration'] ?? '');
                    $e_price   = isset($exp['priceAmount']) ? (string) $exp['priceAmount'] : '';
                    $e_desc    = (string) ($exp['shortDescription'] ?? '');
                    $e_checked = in_array($eid, $sel_exp, true) || in_array((string) ($exp['id'] ?? ''), $sel_exp, true);
                    $e_post    = $eid !== '' ? get_page_by_path($eid, OBJECT, 'experience') : null;
                    $e_studio  = $e_post instanceof WP_Post ? admin_url('admin.php?page=outbound-cms&section=experiences&edit_item=' . (int) $e_post->ID) : '';
                ?>
                    <div class="outbound-repeater-item" style="margin-bottom:10px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;">
                        <div style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
                            <label class="outbound-check-row" style="margin:0;display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" name="cms[featured][experienceIds][]" value="<?php echo outbound_cms_esc_attr($eid); ?>" <?php checked($e_checked); ?> />
                                <?php if ($e_img !== '') : ?>
                                    <img src="<?php echo outbound_cms_esc_url($e_img); ?>" alt="" style="width:40px;height:30px;object-fit:cover;border-radius:4px;" />
                                <?php endif; ?>
                                <strong><?php echo outbound_cms_esc_html($e_title); ?></strong>
                            </label>
                            <?php if ($e_studio !== '') : ?>
                                <a class="button button-small" href="<?php echo outbound_cms_esc_url($e_studio); ?>">Edit in Studio</a>
                            <?php endif; ?>
                        </div>
                        <details style="margin-top:8px;">
                            <summary style="cursor:pointer;font-size:12px;color:#0B5E8E;font-weight:600;">Edit Image &amp; Card Details</summary>
                            <div style="margin-top:8px;display:grid;gap:8px;">
                                <?php outbound_cms_render_media_input('cms[featured_overrides][experiences][' . $eid . '][image]', $e_img, 'feat_exp_img_' . sanitize_key($eid)); ?>
                                <input type="text" name="cms[featured_overrides][experiences][<?php echo outbound_cms_esc_attr($eid); ?>][title]" value="<?php echo outbound_cms_esc_attr($e_title); ?>" placeholder="Experience Title" class="regular-text" />
                                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                    <input type="text" name="cms[featured_overrides][experiences][<?php echo outbound_cms_esc_attr($eid); ?>][badge]" value="<?php echo outbound_cms_esc_attr($e_badge); ?>" placeholder="Badge (e.g. Most Popular)" class="regular-text" style="flex:1;" />
                                    <input type="text" name="cms[featured_overrides][experiences][<?php echo outbound_cms_esc_attr($eid); ?>][duration]" value="<?php echo outbound_cms_esc_attr($e_dur); ?>" placeholder="Duration" class="regular-text" style="flex:1;" />
                                    <input type="number" step="1" min="0" name="cms[featured_overrides][experiences][<?php echo outbound_cms_esc_attr($eid); ?>][price]" value="<?php echo outbound_cms_esc_attr($e_price); ?>" placeholder="Price USD" class="small-text" />
                                </div>
                                <textarea rows="2" name="cms[featured_overrides][experiences][<?php echo outbound_cms_esc_attr($eid); ?>][description]" placeholder="Short Description" class="large-text"><?php echo outbound_cms_esc_html($e_desc); ?></textarea>
                            </div>
                        </details>
                    </div>
                <?php endforeach; ?>
            </div>
            <div>
                <h3>Featured Packages</h3>
                <?php
                $sel_pkg = (array) ($featured['packageIds'] ?? array());
                foreach ((array) ($snapshot['packages'] ?? array()) as $pkg) :
                    $pid       = (string) ($pkg['id'] ?? ($pkg['slug'] ?? ''));
                    $p_slug    = (string) ($pkg['slug'] ?? $pid);
                    $p_title   = (string) ($pkg['title'] ?? $pid);
                    $p_img     = (string) ($pkg['imageUrl'] ?? '');
                    $p_badge   = (string) ($pkg['badge'] ?? '');
                    $p_dur     = (string) ($pkg['duration'] ?? '');
                    $p_price   = isset($pkg['priceUSD']) ? (string) $pkg['priceUSD'] : '';
                    $p_desc    = (string) ($pkg['tagline'] ?? '');
                    $p_checked = in_array($pid, $sel_pkg, true) || in_array($p_slug, $sel_pkg, true);
                    $p_post    = $p_slug !== '' ? get_page_by_path($p_slug, OBJECT, 'package') : null;
                    $p_studio  = $p_post instanceof WP_Post ? admin_url('admin.php?page=outbound-cms&section=packages&edit_item=' . (int) $p_post->ID) : '';
                ?>
                    <div class="outbound-repeater-item" style="margin-bottom:10px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;">
                        <div style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
                            <label class="outbound-check-row" style="margin:0;display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" name="cms[featured][packageIds][]" value="<?php echo outbound_cms_esc_attr($pid); ?>" <?php checked($p_checked); ?> />
                                <?php if ($p_img !== '') : ?>
                                    <img src="<?php echo outbound_cms_esc_url($p_img); ?>" alt="" style="width:40px;height:30px;object-fit:cover;border-radius:4px;" />
                                <?php endif; ?>
                                <strong><?php echo outbound_cms_esc_html($p_title); ?></strong>
                            </label>
                            <?php if ($p_studio !== '') : ?>
                                <a class="button button-small" href="<?php echo outbound_cms_esc_url($p_studio); ?>">Edit in Studio</a>
                            <?php endif; ?>
                        </div>
                        <details style="margin-top:8px;">
                            <summary style="cursor:pointer;font-size:12px;color:#0B5E8E;font-weight:600;">Edit Image &amp; Card Details</summary>
                            <div style="margin-top:8px;display:grid;gap:8px;">
                                <?php outbound_cms_render_media_input('cms[featured_overrides][packages][' . $pid . '][image]', $p_img, 'feat_pkg_img_' . sanitize_key($pid)); ?>
                                <input type="text" name="cms[featured_overrides][packages][<?php echo outbound_cms_esc_attr($pid); ?>][title]" value="<?php echo outbound_cms_esc_attr($p_title); ?>" placeholder="Package Title" class="regular-text" />
                                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                    <input type="text" name="cms[featured_overrides][packages][<?php echo outbound_cms_esc_attr($pid); ?>][badge]" value="<?php echo outbound_cms_esc_attr($p_badge); ?>" placeholder="Badge" class="regular-text" style="flex:1;" />
                                    <input type="text" name="cms[featured_overrides][packages][<?php echo outbound_cms_esc_attr($pid); ?>][duration]" value="<?php echo outbound_cms_esc_attr($p_dur); ?>" placeholder="Duration" class="regular-text" style="flex:1;" />
                                    <input type="number" step="1" min="0" name="cms[featured_overrides][packages][<?php echo outbound_cms_esc_attr($pid); ?>][price]" value="<?php echo outbound_cms_esc_attr($p_price); ?>" placeholder="Price USD" class="small-text" />
                                </div>
                                <textarea rows="2" name="cms[featured_overrides][packages][<?php echo outbound_cms_esc_attr($pid); ?>][description]" placeholder="Tagline / Short Description" class="large-text"><?php echo outbound_cms_esc_html($p_desc); ?></textarea>
                            </div>
                        </details>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </details>
    <?php
}

function outbound_cms_render_section_experiences(array $snapshot): void {
    ?>
    <div class="outbound-admin-card">
        <h2>Experiences Section Headings & Labels</h2>
        <table class="form-table">
            <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/FeaturedExperiences.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text1')); ?>" class="regular-text" /></td></tr>
            <tr><th>Homepage Section Title</th><td><input type="text" name="cms[ed][travel/FeaturedExperiences.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text2')); ?>" class="large-text" /></td></tr>
            <tr><th>Homepage Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/FeaturedExperiences.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text3')); ?></textarea></td></tr>
            <tr><th>Card Recommendation & Button Labels</th><td>
                <input type="text" name="cms[ed][travel/FeaturedExperiences.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text4')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/FeaturedExperiences.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text5')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/FeaturedExperiences.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedExperiences.text6')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>Experiences Directory Hero Background</th><td><?php outbound_cms_render_media_input('cms[ed_struct][travel/ExperiencesDirectoryPage.heroVictoriaFalls]', outbound_cms_get_ed_struct($snapshot, 'travel/ExperiencesDirectoryPage.heroVictoriaFalls'), 'outbound_exp_dir_hero'); ?></td></tr>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_accommodation(array $snapshot): void {
    ?>
    <div class="outbound-admin-card">
        <h2>Accommodation Section Headings & Card Labels</h2>
        <table class="form-table">
            <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/WhereToStaySection.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text1')); ?>" class="regular-text" /></td></tr>
            <tr><th>Homepage Section Title</th><td><input type="text" name="cms[ed][travel/WhereToStaySection.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text2')); ?>" class="large-text" /></td></tr>
            <tr><th>Homepage Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/WhereToStaySection.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text3')); ?></textarea></td></tr>
            <tr><th>Price Prefix / Badge / Button</th><td>
                <input type="text" name="cms[ed][travel/WhereToStaySection.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text4')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/WhereToStaySection.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text6')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/WhereToStaySection.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text7')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/WhereToStaySection.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/WhereToStaySection.text8')); ?>" class="regular-text" />
            </td></tr>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_packages(array $snapshot): void {
    ?>
    <div class="outbound-admin-card">
        <h2>Holiday Packages Section Headings & Disclaimers</h2>
        <table class="form-table">
            <tr><th>Eyebrow / Kicker</th><td><input type="text" name="cms[ed][travel/FeaturedPackages.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text1')); ?>" class="regular-text" /></td></tr>
            <tr><th>Homepage Section Title</th><td><input type="text" name="cms[ed][travel/FeaturedPackages.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text2')); ?>" class="large-text" /></td></tr>
            <tr><th>Homepage Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/FeaturedPackages.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text3')); ?></textarea></td></tr>
            <tr><th>Pricing Estimate Note</th><td><textarea rows="2" name="cms[ed][travel/FeaturedPackages.text4]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text4')); ?></textarea></td></tr>
            <tr><th>CTA Button Label</th><td><input type="text" name="cms[ed][travel/FeaturedPackages.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text8')); ?>" class="regular-text" /> <input type="text" name="cms[ed][travel/FeaturedPackages.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/FeaturedPackages.text9')); ?>" class="regular-text" /></td></tr>
            <tr><th>Packages Directory Hero Background</th><td><?php outbound_cms_render_media_input('cms[ed_struct][travel/PackagesDirectoryPage.fallsTour1]', outbound_cms_get_ed_struct($snapshot, 'travel/PackagesDirectoryPage.fallsTour1'), 'outbound_pkg_dir_hero'); ?></td></tr>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_guides(array $snapshot, array $cms_opts): void {
    $master_guide_hero   = '';
    $master_guide_avatar = '';
    foreach ((array) ($snapshot['guides'] ?? array()) as $g_item) {
        if (is_array($g_item) && (($g_item['slug'] ?? '') === 'first-time-visitor-guide' || $master_guide_hero === '')) {
            $master_guide_hero   = (string) ($g_item['heroImageUrl'] ?? '');
            $master_guide_avatar = (string) ($g_item['author']['avatarUrl'] ?? '');
            if (($g_item['slug'] ?? '') === 'first-time-visitor-guide') {
                break;
            }
        }
    }
    $guide_bg_val = outbound_cms_get_ed(
        $snapshot,
        'travel/guide/GuideArticleTemplate.heroImageUrl',
        outbound_cms_get_ed_struct($snapshot, 'travel/guide/GuideHubView.elephantExperienceImg', $master_guide_hero)
    );
    $guide_av_val = outbound_cms_get_ed($snapshot, 'travel/guide/GuideArticleTemplate.authorAvatarUrl', $master_guide_avatar);
    ?>
    <div class="outbound-admin-card">
        <h2>Victoria Falls Guides &amp; Blog Headings</h2>
        <table class="form-table">
            <tr><th>Guide Section Badge &amp; Title</th><td>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text9')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/VicFallsGuide.text10]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text10')); ?>" class="large-text" />
            </td></tr>
            <tr><th>Guide Section Subtitle</th><td><textarea rows="2" name="cms[ed][travel/VicFallsGuide.text11]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text11')); ?></textarea></td></tr>
            <tr><th>Card Read Link &amp; Bottom Button</th><td>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text12')); ?>" class="regular-text" placeholder="Explore in Travel Guide" />
                <input type="text" name="cms[ed][travel/VicFallsGuide.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text13')); ?>" class="regular-text" placeholder="Read the Complete Victoria Falls Travel Guide" />
            </td></tr>
            <tr><th>Master Travel Guide Hero Background Image</th><td><?php outbound_cms_render_media_input('cms[ed][travel/guide/GuideArticleTemplate.heroImageUrl]', $guide_bg_val, 'outbound_guide_hub_hero'); ?></td></tr>
            <tr><th>Guide Author Avatar Image</th><td><?php outbound_cms_render_media_input('cms[ed][travel/guide/GuideArticleTemplate.authorAvatarUrl]', $guide_av_val, 'outbound_guide_author_avatar'); ?></td></tr>
        </table>
        <h3>Homepage Travel Guide Preview Cards (4 Cards)</h3>
        <div class="outbound-meta-grid">
            <p><label><strong>Card 1 Title &amp; Summary</strong><br>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text1')); ?>" class="widefat" />
                <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text2]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text2')); ?></textarea>
            </label></p>
            <p><label><strong>Card 2 Title &amp; Summary</strong><br>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text3')); ?>" class="widefat" />
                <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text4]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text4')); ?></textarea>
            </label></p>
            <p><label><strong>Card 3 Title &amp; Summary</strong><br>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text5')); ?>" class="widefat" />
                <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text6]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text6')); ?></textarea>
            </label></p>
            <p><label><strong>Card 4 Title &amp; Summary</strong><br>
                <input type="text" name="cms[ed][travel/VicFallsGuide.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text7')); ?>" class="widefat" />
                <textarea rows="2" name="cms[ed][travel/VicFallsGuide.text8]" class="widefat" style="margin-top:4px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/VicFallsGuide.text8')); ?></textarea>
            </label></p>
        </div>
    </div>
    <?php
}

function outbound_cms_render_section_galleries(array $snapshot): void {
    $album_count = count((array) ($snapshot['albums'] ?? array()));
    $img_count   = 0;
    foreach ((array) ($snapshot['albums'] ?? array()) as $alb) {
        $img_count += count((array) ($alb['images'] ?? array()));
    }
    ?>
    <div class="outbound-admin-card">
        <h2>Galleries & WordPress Media Library</h2>
        <p>Currently serving <strong><?php echo $img_count; ?></strong> client gallery photos across <strong><?php echo $album_count; ?></strong> albums. Upload new images directly to the <a href="<?php echo outbound_cms_esc_url(admin_url('upload.php')); ?>">WordPress Media Library</a> and attach them to any Client Album, Accommodation, Experience, or Blog Post.</p>
    </div>
    <?php
}

function outbound_cms_render_section_testimonials(array $snapshot): void {
    $reviews = (array) ($snapshot['site']['legacy']['TRAVEL_REVIEWS'] ?? array());
    ?>
    <div class="outbound-admin-card">
        <h2>Traveller Stories Section Headings & Google Rating</h2>
        <table class="form-table">
            <tr><th>Badge & Heading</th><td>
                <input type="text" name="cms[ed][travel/TravellerStories.badge]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.badge', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text4'))); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/TravellerStories.heading]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.heading', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text5'))); ?>" class="large-text" />
            </td></tr>
            <tr><th>Subheading</th><td><textarea rows="2" name="cms[ed][travel/TravellerStories.subheading]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.subheading', outbound_cms_get_ed($snapshot, 'travel/TravellerStories.text6'))); ?></textarea></td></tr>
            <tr><th>Google Score & Review Card Title</th><td>
                <input type="text" name="cms[ed][travel/TravellerStories.score]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.score', '5.0')); ?>" class="small-text" />
                <input type="text" name="cms[ed][travel/TravellerStories.cardTitle]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.cardTitle', '5.0 Google Rating · Outbound Holidays')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/TravellerStories.ctaLabel]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.ctaLabel', 'Read Google Reviews')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>Google Reviews URL</th><td><input type="url" name="cms[ed][travel/TravellerStories.reviewUrl]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/TravellerStories.reviewUrl', 'https://g.page/r/CW8xeS7qssHkECE/review')); ?>" class="large-text code" /></td></tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Guest Reviews Repeater</h2>
        <div class="outbound-repeater" data-repeater="reviews">
            <div class="outbound-repeater-list">
                <?php foreach ($reviews as $idx => $rev) : ?>
                    <div class="outbound-repeater-row">
                        <div class="outbound-repeater-head">
                            <strong>Review #<span class="outbound-row-num"><?php echo $idx + 1; ?></span></strong>
                            <div class="outbound-repeater-actions">
                                <button type="button" class="button button-small outbound-row-up">Up</button>
                                <button type="button" class="button button-small outbound-row-down">Down</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <input type="hidden" name="cms[reviews][<?php echo $idx; ?>][id]" value="<?php echo outbound_cms_esc_attr((string) ($rev['id'] ?? ('rev-' . ($idx + 1)))); ?>" />
                        <div class="outbound-meta-grid">
                            <p><label>Author<br><input type="text" name="cms[reviews][<?php echo $idx; ?>][author]" value="<?php echo outbound_cms_esc_attr((string) ($rev['author'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>City / Role<br><input type="text" name="cms[reviews][<?php echo $idx; ?>][roleOrCity]" value="<?php echo outbound_cms_esc_attr((string) ($rev['roleOrCity'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Headline<br><input type="text" name="cms[reviews][<?php echo $idx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($rev['title'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Date & Rating<br>
                                <input type="text" name="cms[reviews][<?php echo $idx; ?>][date]" value="<?php echo outbound_cms_esc_attr((string) ($rev['date'] ?? '')); ?>" style="width:120px;" />
                                <input type="number" min="1" max="5" name="cms[reviews][<?php echo $idx; ?>][rating]" value="<?php echo (int) ($rev['rating'] ?? 5); ?>" style="width:65px;" /> ★
                                <label style="margin-left:8px;"><input type="checkbox" name="cms[reviews][<?php echo $idx; ?>][verifiedBuyer]" value="1" <?php checked(!empty($rev['verifiedBuyer'])); ?> /> Verified</label>
                            </label></p>
                        </div>
                        <p><label>Review Quote<br><textarea rows="2" name="cms[reviews][<?php echo $idx; ?>][comment]" class="large-text"><?php echo outbound_cms_esc_html((string) ($rev['comment'] ?? '')); ?></textarea></label></p>
                        <p><label>Avatar Image URL</label></p>
                        <?php outbound_cms_render_media_input("cms[reviews][{$idx}][avatar]", (string) ($rev['avatar'] ?? ''), 'rev_avatar_' . $idx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button outbound-row-add">+ Add Guest Review</button>
        </div>
    </div>
    <?php
}

function outbound_cms_render_section_about_contact(array $snapshot, array $cms_opts): void {
    $contact = (array) ($cms_opts['contact'] ?? array());
    ?>
    <div class="outbound-admin-card">
        <h2>Direct Concierge & Business Contact Details</h2>
        <table class="form-table">
            <tr><th>WhatsApp Digits (no +)</th><td><input type="text" name="cms[contact][whatsappNumber]" value="<?php echo outbound_cms_esc_attr((string) ($contact['whatsappNumber'] ?? '263714701721')); ?>" class="regular-text code" /></td></tr>
            <tr><th>Display Phone Number</th><td><input type="text" name="cms[contact][displayNumber]" value="<?php echo outbound_cms_esc_attr((string) ($contact['displayNumber'] ?? '+263 714 701 721')); ?>" class="regular-text" /></td></tr>
            <tr><th>Enquiries Email</th><td><input type="email" name="cms[contact][email]" value="<?php echo outbound_cms_esc_attr((string) ($contact['email'] ?? 'fungai@outboundholiday.com')); ?>" class="regular-text" /></td></tr>
            <tr><th>Victoria Falls Address</th><td><input type="text" name="cms[contact][address]" value="<?php echo outbound_cms_esc_attr((string) ($contact['address'] ?? '')); ?>" class="large-text" /></td></tr>
            <tr><th>Support Hours</th><td><input type="text" name="cms[contact][hours]" value="<?php echo outbound_cms_esc_attr((string) ($contact['hours'] ?? '')); ?>" class="regular-text" /></td></tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Contact Us & About Founder Page Content</h2>
        <table class="form-table">
            <tr><th>Contact Us Page Title & Intro</th><td>
                <input type="text" name="cms[ed][travel/ContactUsView.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/ContactUsView.text2')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/ContactUsView.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/ContactUsView.text3')); ?>" class="large-text" />
                <textarea rows="2" name="cms[ed][travel/ContactUsView.text4]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/ContactUsView.text4')); ?></textarea>
            </td></tr>
            <tr><th>About Page Headline & Subhead</th><td>
                <input type="text" name="cms[ed][travel/AboutPage.text10]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text10')); ?>" class="large-text" />
                <textarea rows="2" name="cms[ed][travel/AboutPage.text11]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text11')); ?></textarea>
            </td></tr>
            <tr><th>Founder Name & Role</th><td>
                <input type="text" name="cms[ed][travel/AboutPage.text14]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text14')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][travel/AboutPage.text15]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text15')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>Founder Story Paragraphs</th><td>
                <textarea rows="3" name="cms[ed][travel/AboutPage.text18]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text18')); ?></textarea>
                <textarea rows="3" name="cms[ed][travel/AboutPage.text19]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text19')); ?></textarea>
                <textarea rows="3" name="cms[ed][travel/AboutPage.text20]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'travel/AboutPage.text20')); ?></textarea>
            </td></tr>
            <tr><th>Founder Portrait Image</th><td><?php outbound_cms_render_media_input('cms[ed_struct][travel/AboutPage.founderImage]', outbound_cms_get_ed_struct($snapshot, 'travel/AboutPage.founderImage'), 'outbound_about_founder_img'); ?></td></tr>
            <tr><th>About Page Gallery Photo 1</th><td><?php outbound_cms_render_media_input('cms[ed_struct][travel/AboutPage.photo3]', outbound_cms_get_ed_struct($snapshot, 'travel/AboutPage.photo3'), 'outbound_about_photo3'); ?></td></tr>
            <tr><th>About Page Gallery Photo 2</th><td><?php outbound_cms_render_media_input('cms[ed_struct][travel/AboutPage.photo6]', outbound_cms_get_ed_struct($snapshot, 'travel/AboutPage.photo6'), 'outbound_about_photo6'); ?></td></tr>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_header(array $snapshot, array $bundle = array()): void {
    $logo = outbound_cms_get_ed($snapshot, 'common/Header.outboundLogo', outbound_get_logo_url());
    $strings = (array) ($snapshot['site']['editorial']['strings'] ?? array());
    $nav_cfg = (array) ($bundle['navigation'] ?? ($snapshot['site']['navigation'] ?? array()));
    $nav_items = !empty($nav_cfg['headerItems']) && is_array($nav_cfg['headerItems'])
        ? array_values($nav_cfg['headerItems'])
        : outbound_get_default_header_nav_items($strings);
    $cta_action = (string) ($nav_cfg['primaryCtaAction'] ?? 'modal');
    $canonical_routes = array(
        '/victoria-falls-guide'           => 'Victoria Falls Guide (/victoria-falls-guide)',
        '/things-to-do-in-victoria-falls' => 'Things to Do (/things-to-do-in-victoria-falls)',
        '/victoria-falls-accommodation'   => 'Where to Stay (/victoria-falls-accommodation)',
        '/victoria-falls-packages'        => 'Holiday Packages (/victoria-falls-packages)',
        '/client-gallery'                 => 'Client Gallery (/client-gallery)',
        '/about'                          => 'About Us (/about)',
        '/blog'                           => 'Travel Blog (/blog)',
        '/contact'                        => 'Contact Us (/contact)',
        '/search'                         => 'Site Search (/search)',
        '/'                               => 'Homepage (/)',
        'whatsapp'                        => 'Direct WhatsApp Chat',
    );
    ?>
    <div class="outbound-admin-card">
        <h2>Brand Logo &amp; Top Announcement Bar</h2>
        <table class="form-table">
            <tr><th>Primary Header Logo</th><td><?php outbound_cms_render_media_input('cms[ed][common/Header.outboundLogo]', $logo, 'outbound_header_logo'); ?></td></tr>
            <tr><th>Top Bar Badge &amp; Tagline</th><td>
                <input type="text" name="cms[ed][common/Header.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text1')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Header.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text2')); ?>" class="large-text" />
            </td></tr>
            <tr><th>WhatsApp Strip Prefix</th><td><input type="text" name="cms[ed][common/Header.text3]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text3')); ?>" class="regular-text" /></td></tr>
            <tr><th>Search Placeholder</th><td><input type="text" name="cms[ed][common/Header.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text12')); ?>" class="regular-text" /></td></tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Primary Header CTA Button</h2>
        <table class="form-table">
            <tr>
                <th>CTA Label</th>
                <td><input type="text" name="cms[ed][common/Header.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Header.text13', 'Plan My Holiday')); ?>" class="regular-text" /></td>
            </tr>
            <tr>
                <th>CTA Destination / Action</th>
                <td>
                    <select name="cms[header_cta_action]">
                        <option value="modal" <?php selected($cta_action, 'modal'); ?>>Open Optional Holiday Builder Modal (Default)</option>
                        <option value="/contact" <?php selected($cta_action, '/contact'); ?>>Open Contact Enquiry Form (/contact)</option>
                        <option value="whatsapp" <?php selected($cta_action, 'whatsapp'); ?>>Chat Directly on WhatsApp</option>
                        <option value="/victoria-falls-packages" <?php selected($cta_action, '/victoria-falls-packages'); ?>>Browse Holiday Packages (/victoria-falls-packages)</option>
                    </select>
                </td>
            </tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Desktop &amp; Mobile Navigation Menu (Single Source of Truth)</h2>
        <p class="description">Manage link labels, canonical routes, display order, and desktop/mobile visibility directly here. Changes immediately control both the desktop navigation capsule and the mobile drawer.</p>
        <div class="outbound-repeater" data-repeater="nav-items">
            <div class="outbound-repeater-list">
                <?php foreach ($nav_items as $nidx => $nitem) :
                    $nid      = (string) ($nitem['id'] ?? ('nav-' . ($nidx + 1)));
                    $nlabel   = (string) ($nitem['label'] ?? '');
                    $ndest    = (string) ($nitem['destination'] ?? '/');
                    $norder   = (int) ($nitem['order'] ?? ($nidx + 1));
                    $show_dt  = !array_key_exists('showDesktop', $nitem) || !empty($nitem['showDesktop']);
                    $show_mob = !array_key_exists('showMobile', $nitem) || !empty($nitem['showMobile']);
                    $is_std   = array_key_exists($ndest, $canonical_routes);
                ?>
                    <div class="outbound-repeater-row">
                        <div class="outbound-repeater-head">
                            <strong>Menu Link #<span class="outbound-row-num"><?php echo $nidx + 1; ?></span> — <?php echo outbound_cms_esc_html($nlabel); ?></strong>
                            <div class="outbound-repeater-actions">
                                <button type="button" class="button button-small outbound-row-up">Up</button>
                                <button type="button" class="button button-small outbound-row-down">Down</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <input type="hidden" name="cms[nav_items][<?php echo $nidx; ?>][id]" value="<?php echo outbound_cms_esc_attr($nid); ?>" />
                        <div class="outbound-meta-grid">
                            <p><label>Link Label<br><input type="text" name="cms[nav_items][<?php echo $nidx; ?>][label]" value="<?php echo outbound_cms_esc_attr($nlabel); ?>" class="regular-text" required /></label></p>
                            <p><label>Destination Route<br>
                                <select name="cms[nav_items][<?php echo $nidx; ?>][destination]">
                                    <?php foreach ($canonical_routes as $rpath => $rlabel) : ?>
                                        <option value="<?php echo outbound_cms_esc_attr($rpath); ?>" <?php selected($is_std ? $ndest : '__custom__', $rpath); ?>><?php echo outbound_cms_esc_html($rlabel); ?></option>
                                    <?php endforeach; ?>
                                    <option value="__custom__" <?php selected(!$is_std); ?>>Custom Path or External URL</option>
                                </select>
                            </label></p>
                            <p><label>Custom URL (if selected)<br><input type="text" name="cms[nav_items][<?php echo $nidx; ?>][customDestination]" value="<?php echo outbound_cms_esc_attr(!$is_std ? $ndest : ''); ?>" placeholder="/victoria-falls-guide#practical-faqs or https://..." class="regular-text code" /></label></p>
                            <p><label>Order<br><input type="number" min="1" max="99" name="cms[nav_items][<?php echo $nidx; ?>][order]" value="<?php echo (int) $norder; ?>" style="width:80px;" /></label></p>
                        </div>
                        <p style="margin-top:6px;">
                            <label style="margin-right:18px;"><input type="checkbox" name="cms[nav_items][<?php echo $nidx; ?>][showDesktop]" value="1" <?php checked($show_dt); ?> /> Show on Desktop</label>
                            <label><input type="checkbox" name="cms[nav_items][<?php echo $nidx; ?>][showMobile]" value="1" <?php checked($show_mob); ?> /> Show on Mobile</label>
                        </p>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button outbound-row-add">+ Add Navigation Link</button>
        </div>
    </div>
    <?php
}

function outbound_cms_render_section_footer(array $snapshot, array $cms_opts): void {
    $social = (array) ($cms_opts['social'] ?? array());
    $rates  = (array) ($snapshot['site']['currencyRates'] ?? outbound_get_currency_rates());
    $flogo  = outbound_cms_get_ed($snapshot, 'common/Footer.outboundLogo', outbound_get_logo_url());
    $fbg    = outbound_cms_get_ed_struct($snapshot, 'common/Footer.cruise1');
    ?>
    <div class="outbound-admin-card">
        <h2>Footer Brand, Columns, Reviews &amp; Payment Badges</h2>
        <table class="form-table">
            <tr><th>Footer Logo</th><td><?php outbound_cms_render_media_input('cms[ed][common/Footer.outboundLogo]', $flogo, 'outbound_footer_logo'); ?></td></tr>
            <tr><th>Footer Background Image</th><td><?php outbound_cms_render_media_input('cms[ed_struct][common/Footer.cruise1]', $fbg, 'outbound_footer_bg'); ?></td></tr>
            <tr><th>Brand Name &amp; Summary</th><td>
                <input type="text" name="cms[ed][common/Footer.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text2')); ?>" class="regular-text" /><br>
                <textarea rows="2" name="cms[ed][common/Footer.text3]" class="large-text" style="margin-top:6px;"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'common/Footer.text3')); ?></textarea>
            </td></tr>
            <tr><th>Address &amp; WhatsApp Prefix</th><td>
                <input type="text" name="cms[ed][common/Footer.text4]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text4')); ?>" class="large-text" /><br>
                <input type="text" name="cms[ed][common/Footer.text5]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text5')); ?>" class="regular-text" style="margin-top:6px;" />
            </td></tr>
            <tr><th>Column 1 Heading &amp; Links</th><td>
                <input type="text" name="cms[ed][common/Footer.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text6')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text7')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text8]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text8')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text9]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text9')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text10]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text10')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text11]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text11')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>Column 2 Heading &amp; Links</th><td>
                <input type="text" name="cms[ed][common/Footer.text12]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text12')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text13]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text13')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text14]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text14')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text15]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text15')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text18]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text18')); ?>" class="regular-text" />
            </td></tr>
            <tr><th>License Line & Copyright</th><td>
                <input type="text" name="cms[ed][common/Footer.text16]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text16')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text17]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text17')); ?>" class="large-text" />
            </td></tr>
            <tr><th>Google Reviews Link & Rating</th><td>
                <input type="text" name="cms[ed][common/Footer.googleReviewsLabel]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.googleReviewsLabel', 'Google Reviews')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.googleReviewsRating]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.googleReviewsRating', '5.0')); ?>" class="small-text" />
                <input type="url" name="cms[ed][common/Footer.googleReviewsUrl]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.googleReviewsUrl', 'https://g.page/r/CW8xeS7qssHkECE/review')); ?>" class="regular-text code" />
            </td></tr>
            <tr><th>Accepted Payment Badges</th><td>
                <input type="text" name="cms[ed][common/Footer.text19]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text19')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Footer.text20]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text20')); ?>" style="width:90px;" />
                <input type="text" name="cms[ed][common/Footer.text21]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text21')); ?>" style="width:110px;" />
                <input type="text" name="cms[ed][common/Footer.text22]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Footer.text22')); ?>" style="width:100px;" />
            </td></tr>
            <tr><th>Social Profiles</th><td>
                <input type="url" name="cms[social][facebook]" value="<?php echo outbound_cms_esc_attr((string) ($social['facebook'] ?? '')); ?>" class="regular-text code" placeholder="Facebook URL" />
                <input type="url" name="cms[social][instagram]" value="<?php echo outbound_cms_esc_attr((string) ($social['instagram'] ?? '')); ?>" class="regular-text code" placeholder="Instagram URL" />
                <input type="url" name="cms[social][youtube]" value="<?php echo outbound_cms_esc_attr((string) ($social['youtube'] ?? '')); ?>" class="regular-text code" placeholder="YouTube URL" />
            </td></tr>
        </table>
    </div>

    <div class="outbound-admin-card">
        <h2>Global Newsletter Banner & Multi-Currency Rates</h2>
        <table class="form-table">
            <tr><th>Newsletter Kicker & Heading</th><td>
                <input type="text" name="cms[ed][common/Newsletter.text1]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text1')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Newsletter.text2]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text2')); ?>" class="large-text" />
            </td></tr>
            <tr><th>Newsletter Subtitle & CTA</th><td>
                <textarea rows="2" name="cms[ed][common/Newsletter.text3]" class="large-text"><?php echo outbound_cms_esc_html(outbound_cms_get_ed($snapshot, 'common/Newsletter.text3')); ?></textarea><br>
                <input type="text" name="cms[ed][common/Newsletter.text6]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text6')); ?>" class="regular-text" />
                <input type="text" name="cms[ed][common/Newsletter.text7]" value="<?php echo outbound_cms_esc_attr(outbound_cms_get_ed($snapshot, 'common/Newsletter.text7')); ?>" class="regular-text" />
            </td></tr>
        </table>

        <?php
        $curr_payload   = function_exists('outbound_get_currency_rates_payload') ? outbound_get_currency_rates_payload(false) : array();
        $curr_mode      = (string) ($curr_payload['mode'] ?? 'automatic');
        $curr_status    = (string) ($curr_payload['status'] ?? 'unavailable');
        $curr_provider  = (string) ($curr_payload['provider'] ?? 'Frankfurter API v2');
        $curr_eff_date  = (string) ($curr_payload['effectiveDate'] ?? '—');
        $curr_fetched   = (string) ($curr_payload['fetchedAt'] ?? '—');
        $curr_error     = (string) ($curr_payload['lastError'] ?? '');
        $display_rates  = (array) ($curr_payload['rates'] ?? $rates);
        $status_labels  = array(
            'live'        => array('label' => 'Live (Auto-Updated)', 'color' => '#166534', 'bg' => '#dcfce7'),
            'cached'      => array('label' => 'Cached Fallback',     'color' => '#92400e', 'bg' => '#fef3c7'),
            'manual'      => array('label' => 'Manual Override',     'color' => '#1e40af', 'bg' => '#dbeafe'),
            'unavailable' => array('label' => 'Unavailable',         'color' => '#991b1b', 'bg' => '#fee2e2'),
        );
        $st_badge = $status_labels[$curr_status] ?? $status_labels['unavailable'];
        ?>
        <h3>Live Currency Exchange Rates (Base USD = 1)</h3>
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;margin-bottom:14px;max-width:700px;">
            <div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <div>
                    <strong>Active Provider:</strong> <?php echo outbound_cms_esc_html($curr_provider); ?>
                    &nbsp;|&nbsp;
                    <strong>Status:</strong>
                    <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;color:<?php echo outbound_cms_esc_attr($st_badge['color']); ?>;background:<?php echo outbound_cms_esc_attr($st_badge['bg']); ?>;">
                        <?php echo outbound_cms_esc_html($st_badge['label']); ?>
                    </span>
                </div>
                <button type="submit" name="outbound_cms_hub_action" value="refresh_currency_rates" class="button button-secondary">
                    Refresh Rates Now
                </button>
            </div>
            <div style="font-size:12px;color:#475569;display:flex;flex-wrap:wrap;gap:16px;">
                <span><strong>Effective Rate Date:</strong> <?php echo outbound_cms_esc_html($curr_eff_date ?: '—'); ?></span>
                <span><strong>Last Fetched:</strong> <?php echo outbound_cms_esc_html($curr_fetched ?: '—'); ?></span>
            </div>
            <?php if ($curr_error !== '') : ?>
                <p style="margin:8px 0 0;color:#b45309;font-size:12px;"><strong>Last Provider Notice:</strong> <?php echo outbound_cms_esc_html($curr_error); ?></p>
            <?php endif; ?>
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0;">
                <label style="margin-right:16px;">
                    <input type="radio" name="cms[currency_mode]" value="automatic" <?php checked($curr_mode, 'automatic'); ?> />
                    <strong>Automatic</strong> (Frankfurter API v2, cached 6 hours)
                </label>
                <label>
                    <input type="radio" name="cms[currency_mode]" value="manual" <?php checked($curr_mode, 'manual'); ?> />
                    <strong>Manual Override</strong> (Emergency fallback only)
                </label>
            </div>
        </div>

        <table class="widefat striped" style="max-width:700px;">
            <thead><tr><th>Currency</th><th>Symbol</th><th>Rate per 1 USD</th><th>Source</th></tr></thead>
            <tbody>
                <?php foreach ($display_rates as $code => $cfg) :
                    if ((string) $code === 'ZWL') {
                        continue;
                    }
                    $is_ro = ($code === 'USD' || $curr_mode !== 'manual') ? 'readonly' : '';
                    ?>
                    <tr>
                        <td><strong><?php echo outbound_cms_esc_html((string) $code); ?></strong></td>
                        <td><input type="text" name="cms[rates][<?php echo outbound_cms_esc_attr((string) $code); ?>][symbol]" value="<?php echo outbound_cms_esc_attr((string) ($cfg['symbol'] ?? $code)); ?>" <?php echo $curr_mode !== 'manual' ? 'readonly' : ''; ?> style="width:70px;" /></td>
                        <td><input type="number" step="0.0001" min="0.0001" name="cms[rates][<?php echo outbound_cms_esc_attr((string) $code); ?>][rate]" value="<?php echo outbound_cms_esc_attr((string) ($cfg['rate'] ?? 1)); ?>" <?php echo $is_ro; ?> style="width:120px;" /></td>
                        <td style="font-size:12px;color:#475569;"><?php echo outbound_cms_esc_html((string) ($cfg['source'] ?? $curr_provider)); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <p class="description" style="margin-top:6px;">All product, package, and accommodation prices remain stored in USD. Converted rates are indicative only.</p>
    </div>
    <?php
}

function outbound_cms_render_section_builder(array $snapshot, array $bundle): void {
    $tiers      = (array) ($snapshot['stayTiers'] ?? array());
    $acts       = (array) ($snapshot['builderActivities'] ?? array());
    $saved_acts = (array) ($bundle['builder_activities'] ?? array());
    $excluded   = array_fill_keys(array_map('strval', (array) ($bundle['builder_excluded_experiences'] ?? array())), true);
    $bcfg       = (array) ($bundle['builder_config'] ?? ($snapshot['site']['builderConfig'] ?? array()));
    $def_tier   = (string) ($bcfg['defaultStayTierId'] ?? 'comfort-plus');
    $def_nights = (int) ($bcfg['defaultNights'] ?? 3);
    $avail_csv  = !empty($bcfg['availableNights']) && is_array($bcfg['availableNights'])
        ? implode(', ', array_map('intval', $bcfg['availableNights']))
        : '2, 3, 4, 5';

    // Index live Experience catalog so admins see live catalog prices and can re-enable excluded experiences cleanly.
    $exp_by_key = array();
    foreach ((array) ($snapshot['experiences'] ?? array()) as $exp) {
        if (!is_array($exp) || empty($exp['id'])) {
            continue;
        }
        $exp_by_key[(string) $exp['id']] = $exp;
        if (!empty($exp['slug'])) {
            $exp_by_key[(string) $exp['slug']] = $exp;
        }
    }

    // Build combined editor list: active synced items first, followed by any saved/excluded items so nothing ever disappears silently or gets re-added unexpectedly.
    $editor_rows = array();
    $seen_ids    = array();
    foreach ($acts as $a) {
        if (!is_array($a) || empty($a['id'])) {
            continue;
        }
        $aid = (string) $a['id'];
        $seen_ids[$aid] = true;
        $editor_rows[] = $a;
    }
    foreach ($saved_acts as $sa) {
        if (!is_array($sa) || empty($sa['id'])) {
            continue;
        }
        $sid = (string) $sa['id'];
        if (!isset($seen_ids[$sid])) {
            $seen_ids[$sid] = true;
            $editor_rows[] = $sa;
        }
    }
    ?>
    <?php
        $entry_copy = isset($bcfg['entryCopy']) && is_array($bcfg['entryCopy']) ? $bcfg['entryCopy'] : array();
        $enabled_sec = isset($bcfg['enabledSections']) && is_array($bcfg['enabledSections']) ? $bcfg['enabledSections'] : array();
    ?>
    <div class="outbound-admin-card">
        <h2>Holiday Builder — Entry Screen Cards, Visible Sections &amp; Default Trip Rules</h2>
        <p class="description">Customize the two opening choice cards, choose which planner sections appear inside <strong>Your trip plan</strong>, and configure default trip rules.</p>
        <div class="outbound-meta-grid">
            <p><label>Opening Choice Heading<br><input type="text" name="cms[builder_config][entryCopy][heading]" value="<?php echo outbound_cms_esc_attr((string) ($entry_copy['heading'] ?? '')); ?>" placeholder="How would you like to plan?" class="regular-text" /></label></p>
            <p><label>Specialist Card Title<br><input type="text" name="cms[builder_config][entryCopy][helpCardTitle]" value="<?php echo outbound_cms_esc_attr((string) ($entry_copy['helpCardTitle'] ?? '')); ?>" placeholder="Get help planning" class="regular-text" /></label></p>
            <p><label>Specialist Card Description<br><input type="text" name="cms[builder_config][entryCopy][helpCardDesc]" value="<?php echo outbound_cms_esc_attr((string) ($entry_copy['helpCardDesc'] ?? '')); ?>" placeholder="A local specialist can help with stays, activities, and transfers." class="large-text" /></label></p>
            <p><label>WhatsApp Button Label<br><input type="text" name="cms[builder_config][entryCopy][whatsappCtaLabel]" value="<?php echo outbound_cms_esc_attr((string) ($entry_copy['whatsappCtaLabel'] ?? '')); ?>" placeholder="Chat on WhatsApp" class="regular-text" /></label></p>
            <p><label>Quick Enquiry Link Label<br><input type="text" name="cms[builder_config][entryCopy][quickEnquiryCtaLabel]" value="<?php echo outbound_cms_esc_attr((string) ($entry_copy['quickEnquiryCtaLabel'] ?? '')); ?>" placeholder="Send a quick enquiry" class="regular-text" /></label></p>
            <p><label>Itinerary Card Title<br><input type="text" name="cms[builder_config][entryCopy][itineraryCardTitle]" value="<?php echo outbound_cms_esc_attr((string) ($entry_copy['itineraryCardTitle'] ?? '')); ?>" placeholder="Build my itinerary" class="regular-text" /></label></p>
            <p><label>Itinerary Card Description<br><input type="text" name="cms[builder_config][entryCopy][itineraryCardDesc]" value="<?php echo outbound_cms_esc_attr((string) ($entry_copy['itineraryCardDesc'] ?? '')); ?>" placeholder="Choose what you'd like to do and see a trip estimate." class="large-text" /></label></p>
            <p><label>Itinerary Button Label<br><input type="text" name="cms[builder_config][entryCopy][itineraryCtaLabel]" value="<?php echo outbound_cms_esc_attr((string) ($entry_copy['itineraryCtaLabel'] ?? '')); ?>" placeholder="Build my itinerary" class="regular-text" /></label></p>
        </div>
        <input type="hidden" name="cms[builder_config][enabledSectionsPresent]" value="1" />
        <p style="background:#f8fafc;padding:10px 12px;border-radius:6px;border:1px solid #e2e8f0;display:flex;flex-wrap:wrap;gap:16px;align-items:center;">
            <strong>Visible Planner Sections:</strong>
            <label><input type="checkbox" name="cms[builder_config][enabledSections][datesGuests]" value="1" <?php checked(!array_key_exists('datesGuests', $enabled_sec) || !empty($enabled_sec['datesGuests'])); ?> /> Dates &amp; guests</label>
            <label><input type="checkbox" name="cms[builder_config][enabledSections][stay]" value="1" <?php checked(!array_key_exists('stay', $enabled_sec) || !empty($enabled_sec['stay'])); ?> /> Stay</label>
            <label><input type="checkbox" name="cms[builder_config][enabledSections][activities]" value="1" <?php checked(!array_key_exists('activities', $enabled_sec) || !empty($enabled_sec['activities'])); ?> /> Activities</label>
            <label><input type="checkbox" name="cms[builder_config][enabledSections][transfers]" value="1" <?php checked(!array_key_exists('transfers', $enabled_sec) || !empty($enabled_sec['transfers'])); ?> /> Transfers</label>
        </p>
        <div class="outbound-meta-grid">
            <p><label>Default Stay Tier<br>
                <select name="cms[builder_config][defaultStayTierId]">
                    <?php foreach ($tiers as $t) : $tid = (string) ($t['id'] ?? ''); ?>
                        <option value="<?php echo outbound_cms_esc_attr($tid); ?>" <?php selected($def_tier, $tid); ?>><?php echo outbound_cms_esc_html((string) ($t['name'] ?? $tid)); ?></option>
                    <?php endforeach; ?>
                </select>
            </label></p>
            <p><label>Default Stay Nights<br><input type="number" min="1" max="30" name="cms[builder_config][defaultNights]" value="<?php echo (int) $def_nights; ?>" style="width:90px;" /></label></p>
            <p><label>Available Night Options (comma-separated)<br><input type="text" name="cms[builder_config][availableNightsCsv]" value="<?php echo outbound_cms_esc_attr($avail_csv); ?>" class="regular-text code" placeholder="2, 3, 4, 5" /></label></p>
        </div>
    </div>

    <div class="outbound-admin-card">
        <h2>Holiday Builder — Accommodation Stay Tiers</h2>
        <div class="outbound-repeater" data-repeater="stay-tiers">
            <div class="outbound-repeater-list">
                <?php foreach ($tiers as $idx => $tier) :
                    $hl_lines = implode("\n", (array) ($tier['highlights'] ?? array()));
                    $tier_price = $tier['pricePerNightUSD'] ?? ($tier['startingPrice'] ?? 220);
                ?>
                    <div class="outbound-repeater-row">
                        <div class="outbound-repeater-head">
                            <strong>Stay Tier #<span class="outbound-row-num"><?php echo $idx + 1; ?></span></strong>
                            <div class="outbound-repeater-actions">
                                <button type="button" class="button button-small outbound-row-up">Up</button>
                                <button type="button" class="button button-small outbound-row-down">Down</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Tier Slug ID<br><input type="text" name="cms[stay_tiers][<?php echo $idx; ?>][id]" value="<?php echo outbound_cms_esc_attr((string) ($tier['id'] ?? '')); ?>" class="regular-text code" /></label></p>
                            <p><label>Display Name<br><input type="text" name="cms[stay_tiers][<?php echo $idx; ?>][name]" value="<?php echo outbound_cms_esc_attr((string) ($tier['name'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Tagline<br><input type="text" name="cms[stay_tiers][<?php echo $idx; ?>][tagline]" value="<?php echo outbound_cms_esc_attr((string) ($tier['tagline'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Price Per Night USD<br><input type="number" step="1" min="0" name="cms[stay_tiers][<?php echo $idx; ?>][pricePerNightUSD]" value="<?php echo outbound_cms_esc_attr((string) $tier_price); ?>" style="width:110px;" /></label></p>
                        </div>
                        <p><label>Description<br><textarea rows="2" name="cms[stay_tiers][<?php echo $idx; ?>][desc]" class="large-text"><?php echo outbound_cms_esc_html((string) ($tier['desc'] ?? '')); ?></textarea></label></p>
                        <p><label>Highlights (one per line)<br><textarea rows="3" name="cms[stay_tiers][<?php echo $idx; ?>][highlights_text]" class="large-text"><?php echo outbound_cms_esc_html($hl_lines); ?></textarea></label></p>
                        <?php outbound_cms_render_media_input("cms[stay_tiers][{$idx}][imageUrl]", (string) ($tier['imageUrl'] ?? ''), 'tier_img_' . $idx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button outbound-row-add">+ Add Stay Tier</button>
        </div>
    </div>

    <div class="outbound-admin-card">
        <h2>Holiday Builder — Activities, Default Suggestions &amp; Pricing Source</h2>
        <p class="description"><strong>Experiences</strong> are the primary editor for titles, durations, images, descriptions, and catalog pricing. Use the controls below to include/exclude activities from the Holiday Builder, mark defaults as <em>Suggest by default</em>, set <em>Display order</em>, or opt into an explicit <em>Builder Price Override</em>.</p>
        <div class="outbound-repeater" data-repeater="builder-acts">
            <div class="outbound-repeater-list">
                <?php foreach ($editor_rows as $idx => $act) :
                    $aid         = (string) ($act['id'] ?? '');
                    $exp_id      = (string) ($act['experienceId'] ?? '');
                    $matched_exp = $exp_id !== '' && isset($exp_by_key[$exp_id])
                        ? $exp_by_key[$exp_id]
                        : ($exp_by_key[$aid] ?? null);
                    $cat_price   = is_array($matched_exp) && isset($matched_exp['priceAmount']) ? (float) $matched_exp['priceAmount'] : null;
                    $act_price   = $act['priceUSD'] ?? ($act['priceAmount'] ?? ($cat_price ?? 65));
                    $act_img     = $act['imageUrl'] ?? ($act['image'] ?? '');
                    $is_included = (!array_key_exists('includeInBuilder', $act) || !empty($act['includeInBuilder'])) && !isset($excluded[$aid]) && ($exp_id === '' || !isset($excluded[$exp_id]));
                    $is_suggest  = !empty($act['suggestedByDefault']);
                    $disp_order  = isset($act['displayOrder']) && is_numeric($act['displayOrder']) ? (int) $act['displayOrder'] : ($idx + 1);
                    $ovr_enabled = !empty($act['priceOverrideEnabled']);
                    $src_badge   = $ovr_enabled
                        ? 'Source: Custom Builder Price Override ($' . number_format((float) $act_price) . ' USD)'
                        : ($cat_price !== null
                            ? 'Source: Experience Catalog ($' . number_format($cat_price) . ' USD)'
                            : 'Source: Custom Builder Entry');
                ?>
                    <div class="outbound-repeater-row">
                        <div class="outbound-repeater-head">
                            <strong>
                                Activity #<span class="outbound-row-num"><?php echo $idx + 1; ?></span>
                                &mdash; <?php echo outbound_cms_esc_html((string) ($act['title'] ?? $aid)); ?>
                                <span class="outbound-badge <?php echo $ovr_enabled ? 'outbound-badge-amber' : 'outbound-badge-green'; ?>" style="margin-left:8px;">
                                    <?php echo outbound_cms_esc_html($src_badge); ?>
                                </span>
                                <?php if (!$is_included) : ?>
                                    <span class="outbound-badge outbound-badge-red" style="margin-left:6px;">Excluded from Builder</span>
                                <?php endif; ?>
                            </strong>
                            <div class="outbound-repeater-actions">
                                <button type="button" class="button button-small outbound-row-up">Up</button>
                                <button type="button" class="button button-small outbound-row-down">Down</button>
                            </div>
                        </div>
                        <input type="hidden" name="cms[builder_activities][<?php echo $idx; ?>][experienceId]" value="<?php echo outbound_cms_esc_attr($exp_id); ?>" />
                        <p style="background:#f8fafc;padding:8px 12px;border-radius:6px;border:1px solid #e2e8f0;display:flex;flex-wrap:wrap;gap:16px;align-items:center;">
                            <label><input type="checkbox" name="cms[builder_activities][<?php echo $idx; ?>][includeInBuilder]" value="1" <?php checked($is_included); ?> /> <strong>Include in Builder</strong></label>
                            <label><input type="checkbox" name="cms[builder_activities][<?php echo $idx; ?>][suggestedByDefault]" value="1" <?php checked($is_suggest); ?> /> Recommend in builder ("Show me suggestions")</label>
                            <label>Display Order <input type="number" min="1" max="999" name="cms[builder_activities][<?php echo $idx; ?>][displayOrder]" value="<?php echo (int) $disp_order; ?>" style="width:70px;" /></label>
                            <label><input type="checkbox" name="cms[builder_activities][<?php echo $idx; ?>][priceOverrideEnabled]" value="1" <?php checked($ovr_enabled); ?> /> Use Builder Price Override (below)</label>
                        </p>
                        <div class="outbound-meta-grid">
                            <p><label>ID<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][id]" value="<?php echo outbound_cms_esc_attr($aid); ?>" class="regular-text code" /></label></p>
                            <p><label>Title<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($act['title'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Duration<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][duration]" value="<?php echo outbound_cms_esc_attr((string) ($act['duration'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Builder Price USD <?php echo $ovr_enabled ? '(Active Override)' : '(Ignored unless Override checked)'; ?><br><input type="number" step="1" min="0" name="cms[builder_activities][<?php echo $idx; ?>][priceUSD]" value="<?php echo outbound_cms_esc_attr((string) $act_price); ?>" style="width:110px;" /></label></p>
                            <p><label>Badge<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][badge]" value="<?php echo outbound_cms_esc_attr((string) ($act['badge'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Rate Basis<br>
                                <select name="cms[builder_activities][<?php echo $idx; ?>][priceBasis]">
                                    <?php foreach (array('per_adult' => 'Per Adult', 'per_person' => 'Per Person', 'per_child' => 'Per Child', 'per_group' => 'Per Group', 'per_vehicle' => 'Per Vehicle', 'on_request' => 'On Request') as $bk => $bl) : ?>
                                        <option value="<?php echo outbound_cms_esc_attr($bk); ?>" <?php selected((string) ($act['priceBasis'] ?? 'per_adult'), $bk); ?>><?php echo outbound_cms_esc_html($bl); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </label></p>
                            <p><label>Child (&lt;11) Rate USD<br><input type="number" step="1" min="0" name="cms[builder_activities][<?php echo $idx; ?>][childRateUnder11USD]" value="<?php echo isset($act['childRateUnder11USD']) && $act['childRateUnder11USD'] !== null ? outbound_cms_esc_attr((string) $act['childRateUnder11USD']) : ''; ?>" placeholder="On req" style="width:90px;" /></label></p>
                            <p><label>Child (11+) Rate USD<br><input type="number" step="1" min="0" name="cms[builder_activities][<?php echo $idx; ?>][childRate11PlusUSD]" value="<?php echo isset($act['childRate11PlusUSD']) && $act['childRate11PlusUSD'] !== null ? outbound_cms_esc_attr((string) $act['childRate11PlusUSD']) : ''; ?>" placeholder="On req" style="width:90px;" /></label></p>
                            <p><label>Rate Status<br>
                                <select name="cms[builder_activities][<?php echo $idx; ?>][rateStatus]">
                                    <option value="provisional" <?php selected((string) ($act['rateStatus'] ?? 'provisional'), 'provisional'); ?>>Provisional</option>
                                    <option value="confirmed" <?php selected((string) ($act['rateStatus'] ?? ''), 'confirmed'); ?>>Confirmed Guide</option>
                                </select>
                            </label></p>
                            <p><label>Default Time Slot<br>
                                <select name="cms[builder_activities][<?php echo $idx; ?>][defaultTimeSlot]">
                                    <?php foreach (array('to-be-arranged' => 'Time to be arranged', 'morning' => 'Morning', 'afternoon' => 'Afternoon', 'sunset' => 'Sunset', 'evening' => 'Evening') as $sk => $sl) : ?>
                                        <option value="<?php echo outbound_cms_esc_attr($sk); ?>" <?php selected((string) ($act['defaultTimeSlot'] ?? 'to-be-arranged'), $sk); ?>><?php echo outbound_cms_esc_html($sl); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </label></p>
                            <p><label>Published Departure Times<br><input type="text" name="cms[builder_activities][<?php echo $idx; ?>][departureTimesCsv]" value="<?php echo outbound_cms_esc_attr(implode(', ', (array) ($act['departureTimes'] ?? ($matched_exp['departureTimes'] ?? array())))); ?>" placeholder="e.g. 4:00 pm, 4:30 pm" class="regular-text" /></label></p>
                        </div>
                        <p><label>Short Summary<br><textarea rows="2" name="cms[builder_activities][<?php echo $idx; ?>][shortDesc]" class="large-text"><?php echo outbound_cms_esc_html((string) ($act['shortDesc'] ?? '')); ?></textarea></label></p>
                        <?php outbound_cms_render_media_input("cms[builder_activities][{$idx}][imageUrl]", (string) $act_img, 'b_act_img_' . $idx); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button outbound-row-add">+ Add Custom Builder Activity</button>
        </div>
    </div>

    <?php
        $transfer_rows = !empty($bcfg['transferOptions']) && is_array($bcfg['transferOptions'])
            ? array_values($bcfg['transferOptions'])
            : array(
                array('id' => 'vfa-airport-return', 'title' => 'VFA Airport Return Private Transfer', 'route' => 'VFA Airport <-> Victoria Falls Town', 'priceUSD' => 60, 'priceBasis' => 'per_vehicle_return', 'visitorCategory' => 'all', 'rateStatus' => 'provisional', 'includeInBuilder' => true, 'displayOrder' => 1),
            );
    ?>
    <div class="outbound-admin-card">
        <h2>Holiday Builder — Transfers, Routes &amp; Rate Bases</h2>
        <p class="description">Configure Victoria Falls airport &amp; regional transfer routes shown in the planner’s Transfers section. Set <em>Per Vehicle</em>, <em>Per Vehicle Return</em>, <em>Per Person</em>, or <em>On Request</em> (blank price = quote separately).</p>
        <div class="outbound-repeater" data-repeater="builder-transfers">
            <div class="outbound-repeater-list">
                <?php foreach ($transfer_rows as $tidx => $tr) : ?>
                    <div class="outbound-repeater-row">
                        <div class="outbound-repeater-head">
                            <strong>Transfer #<span class="outbound-row-num"><?php echo $tidx + 1; ?></span> &mdash; <?php echo outbound_cms_esc_html((string) ($tr['title'] ?? '')); ?></strong>
                            <div class="outbound-repeater-actions">
                                <button type="button" class="button button-small outbound-row-up">Up</button>
                                <button type="button" class="button button-small outbound-row-down">Down</button>
                                <button type="button" class="button-link-delete outbound-row-remove">Remove</button>
                            </div>
                        </div>
                        <div class="outbound-meta-grid">
                            <p><label>Transfer ID<br><input type="text" name="cms[builder_transfers][<?php echo $tidx; ?>][id]" value="<?php echo outbound_cms_esc_attr((string) ($tr['id'] ?? '')); ?>" class="regular-text code" /></label></p>
                            <p><label>Title<br><input type="text" name="cms[builder_transfers][<?php echo $tidx; ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($tr['title'] ?? '')); ?>" class="regular-text" /></label></p>
                            <p><label>Route<br><input type="text" name="cms[builder_transfers][<?php echo $tidx; ?>][route]" value="<?php echo outbound_cms_esc_attr((string) ($tr['route'] ?? '')); ?>" class="regular-text" placeholder="VFA Airport <-> Victoria Falls Town" /></label></p>
                            <p><label>Price USD (blank = On request)<br><input type="number" step="1" min="0" name="cms[builder_transfers][<?php echo $tidx; ?>][priceUSD]" value="<?php echo isset($tr['priceUSD']) && $tr['priceUSD'] !== null ? outbound_cms_esc_attr((string) $tr['priceUSD']) : ''; ?>" style="width:110px;" /></label></p>
                            <p><label>Basis<br>
                                <select name="cms[builder_transfers][<?php echo $tidx; ?>][priceBasis]">
                                    <?php foreach (array('per_vehicle' => 'Per Vehicle (One-way)', 'per_vehicle_return' => 'Per Vehicle Return', 'per_person' => 'Per Person', 'per_group' => 'Per Group', 'on_request' => 'On Request') as $tbk => $tbl) : ?>
                                        <option value="<?php echo outbound_cms_esc_attr($tbk); ?>" <?php selected((string) ($tr['priceBasis'] ?? 'per_vehicle'), $tbk); ?>><?php echo outbound_cms_esc_html($tbl); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </label></p>
                            <p><label>Visitor Market<br>
                                <select name="cms[builder_transfers][<?php echo $tidx; ?>][visitorCategory]">
                                    <?php foreach (array('all' => 'All Visitors', 'international' => 'International', 'zimbabwe_resident' => 'Zimbabwe Resident', 'sadc_resident' => 'SADC Resident') as $tvk => $tvl) : ?>
                                        <option value="<?php echo outbound_cms_esc_attr($tvk); ?>" <?php selected((string) ($tr['visitorCategory'] ?? 'all'), $tvk); ?>><?php echo outbound_cms_esc_html($tvl); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </label></p>
                            <p><label>Rate Status<br>
                                <select name="cms[builder_transfers][<?php echo $tidx; ?>][rateStatus]">
                                    <option value="provisional" <?php selected((string) ($tr['rateStatus'] ?? 'provisional'), 'provisional'); ?>>Provisional</option>
                                    <option value="confirmed" <?php selected((string) ($tr['rateStatus'] ?? ''), 'confirmed'); ?>>Confirmed Guide</option>
                                </select>
                            </label></p>
                            <p><label>Order<br><input type="number" min="1" max="999" name="cms[builder_transfers][<?php echo $tidx; ?>][displayOrder]" value="<?php echo (int) ($tr['displayOrder'] ?? ($tidx + 1)); ?>" style="width:70px;" /></label></p>
                        </div>
                        <p style="display:flex;gap:16px;align-items:center;">
                            <label><input type="checkbox" name="cms[builder_transfers][<?php echo $tidx; ?>][includeInBuilder]" value="1" <?php checked(!array_key_exists('includeInBuilder', $tr) || !empty($tr['includeInBuilder'])); ?> /> Include in Builder</label>
                            <label>Badge <input type="text" name="cms[builder_transfers][<?php echo $tidx; ?>][badge]" value="<?php echo outbound_cms_esc_attr((string) ($tr['badge'] ?? 'Transfer')); ?>" style="width:120px;" /></label>
                            <label>Summary <input type="text" name="cms[builder_transfers][<?php echo $tidx; ?>][desc]" value="<?php echo outbound_cms_esc_attr((string) ($tr['desc'] ?? '')); ?>" class="regular-text" /></label>
                        </p>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button outbound-row-add">+ Add Transfer Route</button>
        </div>
    </div>
    <?php
}

function outbound_cms_render_section_design(array $bundle): void {
    $tokens = (array) ($bundle['design_tokens'] ?? array());
    $colors = array(
        'primaryColor'   => array('label' => 'Victoria Falls Blue (Primary)', 'default' => '#0B5E8E'),
        'secondaryColor' => array('label' => 'Golden Savannah (Accent)',      'default' => '#C9A66B'),
        'accentColor'    => array('label' => 'Sunset Orange (CTA)',           'default' => '#E67E22'),
        'greenColor'     => array('label' => 'Zambezi Green (Nature)',        'default' => '#3F6B3C'),
        'darkColor'      => array('label' => 'Charcoal Grey (Text)',          'default' => '#2F3A44'),
    );
    ?>
    <div class="outbound-admin-card">
        <div class="outbound-card-toolbar">
            <div>
                <h2>Design Tokens & Brand Palette</h2>
                <p class="description">Preserve the original React aesthetic by default, or customize the CSS color variables safely.</p>
            </div>
            <button type="submit" name="outbound_cms_hub_action" value="reset_design_tokens" class="button">Reset to Original React Colors</button>
        </div>
        <table class="form-table">
            <?php foreach ($colors as $ck => $meta) :
                $val = outbound_cms_sanitize_hex((string) ($tokens[$ck] ?? ''), $meta['default']);
            ?>
                <tr>
                    <th><label for="design_<?php echo outbound_cms_esc_attr($ck); ?>"><?php echo outbound_cms_esc_html($meta['label']); ?></label></th>
                    <td>
                        <div class="outbound-color-field">
                            <input type="color" value="<?php echo outbound_cms_esc_attr($val); ?>" class="outbound-color-picker" data-target="#design_<?php echo outbound_cms_esc_attr($ck); ?>" />
                            <input type="text" id="design_<?php echo outbound_cms_esc_attr($ck); ?>" name="cms[design][<?php echo outbound_cms_esc_attr($ck); ?>]" value="<?php echo outbound_cms_esc_attr($val); ?>" class="regular-text code outbound-color-hex" maxlength="7" />
                            <span class="description">Default: <code><?php echo outbound_cms_esc_html($meta['default']); ?></code></span>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>
    <?php
}

function outbound_cms_render_section_seo(array $snapshot, bool $has_draft, array $draft_state, string $preview_url, string $search, int $paged): void {
    $all_routes = (array) ($snapshot['site']['routeSeo'] ?? array());
    $keys       = array_keys($all_routes);
    if ($search !== '') {
        $q    = strtolower($search);
        $keys = array_values(array_filter($keys, static function (string $k) use ($all_routes, $q): bool {
            return str_contains(strtolower($k), $q)
                || str_contains(strtolower((string) ($all_routes[$k]['title'] ?? '')), $q);
        }));
    }
    $per_page    = 15;
    $total_pages = max(1, (int) ceil(count($keys) / $per_page));
    $paged       = min($paged, $total_pages);
    $slice       = array_slice($keys, ($paged - 1) * $per_page, $per_page);
    $base_url    = admin_url('admin.php?page=outbound-cms&section=seo');
    ?>
    <div class="outbound-admin-card">
        <h2>Publishing Center & Search Filter</h2>
        <p><strong>Current State:</strong> <?php echo $has_draft ? '<span class="outbound-badge outbound-badge-amber">Unpublished Draft Staged</span>' : '<span class="outbound-badge outbound-badge-green">All Changes Live</span>'; ?> &middot; Total Indexed Routes: <strong><?php echo count($all_routes); ?></strong></p>
        <p><a class="button" href="<?php echo outbound_cms_esc_url($preview_url); ?>" target="_blank" rel="noopener">Open Private Draft Preview (?outbound_preview=1)</a></p>
        <p class="description">Filter routes by path or title using query parameter <code>?q=...</code> or quick search below:</p>
        <div class="outbound-filter-bar" style="margin-bottom:0;">
            <input type="search" id="outbound-seo-filter-input" value="<?php echo outbound_cms_esc_attr($search); ?>" placeholder="Filter route path or title (e.g. /packages)..." class="regular-text" />
            <button type="button" class="button" id="outbound-seo-filter-btn" data-base-url="<?php echo outbound_cms_esc_url($base_url); ?>">Filter Routes</button>
            <?php if ($search !== '') : ?>
                <a class="button-link" href="<?php echo outbound_cms_esc_url($base_url); ?>">Reset</a>
            <?php endif; ?>
        </div>
    </div>

    <div class="outbound-admin-card">
        <h2>Route SEO Titles & Meta Descriptions (Page <?php echo $paged; ?> of <?php echo $total_pages; ?>)</h2>
        <table class="widefat striped outbound-cms-table">
            <thead><tr><th style="width:22%;">Route Path</th><th style="width:36%;">SEO Title</th><th>Meta Description</th></tr></thead>
            <tbody>
                <?php foreach ($slice as $rpath) :
                    $meta = (array) ($all_routes[$rpath] ?? array());
                ?>
                    <tr>
                        <td><code><?php echo outbound_cms_esc_html($rpath); ?></code></td>
                        <td><input type="text" name="cms[route_seo][<?php echo outbound_cms_esc_attr($rpath); ?>][title]" value="<?php echo outbound_cms_esc_attr((string) ($meta['title'] ?? '')); ?>" class="large-text" /></td>
                        <td><textarea rows="2" name="cms[route_seo][<?php echo outbound_cms_esc_attr($rpath); ?>][description]" class="large-text"><?php echo outbound_cms_esc_html((string) ($meta['description'] ?? '')); ?></textarea></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <?php if ($total_pages > 1) : ?>
            <div class="outbound-pagination">
                <?php for ($i = 1; $i <= $total_pages; $i++) :
                    $p_url = add_query_arg(array('paged' => $i, 'q' => $search), $base_url);
                ?>
                    <a class="<?php echo $i === $paged ? 'button button-primary button-small' : 'button button-small'; ?>" href="<?php echo outbound_cms_esc_url($p_url); ?>"><?php echo $i; ?></a>
                <?php endfor; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

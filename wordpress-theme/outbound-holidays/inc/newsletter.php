<?php
/**
 * Outbound Holidays Newsletter, Visual Campaign Composer, Branded Email Templates,
 * Double Opt-In Subscribers, Suppression, Audience Segmentation, Batch Queue & Reports.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

const OUTBOUND_NEWSLETTER_CONSENT_VERSION = 'travel-club-2026-10';
const OUTBOUND_NEWSLETTER_WHATSAPP_DISPLAY = '+263 714 701 721';
const OUTBOUND_NEWSLETTER_WHATSAPP_URL = 'https://wa.me/263714701721';

/**
 * Generate a 64-char random token paired with its SHA-256 hash.
 *
 * @return array{raw:string,hash:string}
 */
function outbound_newsletter_generate_token_pair(): array {
    $raw = bin2hex(random_bytes(32));
    return array(
        'raw' => $raw,
        'hash' => hash('sha256', $raw),
    );
}

/**
 * Resolve brand color safely against approved Outbound Holidays email palette.
 */
function outbound_sanitize_newsletter_brand_color(string $color, string $fallback = '#0B5E8E'): string {
    $allowed = array('#0B5E8E', '#3F6B3C', '#0D2833', '#D97706', '#2F3A44');
    $upper = strtoupper(trim($color));
    return in_array($upper, $allowed, true) ? $upper : $fallback;
}

/**
 * Metadata for the 4 branded email templates.
 *
 * @return array<string,array<string,string>>
 */
function outbound_get_newsletter_templates(): array {
    return array(
        'seasonal-spotlight' => array(
            'id' => 'seasonal-spotlight',
            'label' => 'Seasonal Spotlight',
            'accent' => '#0B5E8E',
            'headerBg' => '#0D2833',
            'badge' => 'Seasonal Dispatch',
            'description' => 'Best for Zambezi water levels, seasonal offers & featured Victoria Falls escapes.',
        ),
        'experience-feature' => array(
            'id' => 'experience-feature',
            'label' => 'Experience Feature',
            'accent' => '#3F6B3C',
            'headerBg' => '#1E3A24',
            'badge' => 'Curated Experience',
            'description' => 'Best for safaris, sunset river cruises, helicopter flights & adventure highlights.',
        ),
        'accommodation-guide' => array(
            'id' => 'accommodation-guide',
            'label' => 'Accommodation Guide',
            'accent' => '#0D2833',
            'headerBg' => '#0B3A4D',
            'badge' => 'Stay Spotlight',
            'description' => 'Best for lodge spotlights, room collections & curated stay packages.',
        ),
        'plain-editorial' => array(
            'id' => 'plain-editorial',
            'label' => 'Plain Editorial Letter',
            'accent' => '#2F3A44',
            'headerBg' => '#2F3A44',
            'badge' => 'Travel Advisor Note',
            'description' => 'Clean letter format for personal dispatches, travel advisories & founder updates.',
        ),
    );
}

/**
 * Reusable Outbound Holidays content snippets for non-technical editors.
 *
 * @return array<int,array<string,mixed>>
 */
function outbound_get_newsletter_snippets(): array {
    return array(
        array(
            'id' => 'vic-falls-seasonal',
            'label' => 'Victoria Falls Seasonal Intro',
            'blocks' => array(
                array('type' => 'heading', 'level' => 'h2', 'text' => 'What is happening in Victoria Falls this season'),
                array('type' => 'paragraph', 'text' => 'From mist-filled mornings at the Rainforest to calm golden-hour cruises above the Falls, our local team in Victoria Falls is ready to tailor every transfer, lodge stay, and activity around your dates.'),
            ),
        ),
        array(
            'id' => 'two-col-safari-river',
            'label' => '2-Column: River & Safari Pairing',
            'blocks' => array(
                array(
                    'type' => 'columns',
                    'leftTitle' => 'Zambezi Sunset Cruise',
                    'leftBody' => 'Unwind on the upper Zambezi with curated refreshments and hippo, elephant, and birdlife sightings.',
                    'leftImageUrl' => '',
                    'rightTitle' => 'Chobe & Hwange Extensions',
                    'rightBody' => 'Combine Victoria Falls with seamless cross-border Chobe day trips or multi-night Hwange wildlife stays.',
                    'rightImageUrl' => '',
                ),
            ),
        ),
        array(
            'id' => 'holiday-builder-cta',
            'label' => 'Holiday Builder Callout + CTA',
            'blocks' => array(
                array('type' => 'divider', 'style' => 'line'),
                array('type' => 'heading', 'level' => 'h3', 'text' => 'Build your personalised Victoria Falls itinerary'),
                array('type' => 'paragraph', 'text' => 'Select your preferred dates, accommodation style, and experiences online to receive a tailored estimate and direct advisor support.'),
                array('type' => 'button', 'label' => 'Open Holiday Builder', 'url' => 'https://outboundholiday.com/#holiday-builder', 'color' => '#0B5E8E'),
            ),
        ),
        array(
            'id' => 'advisor-whatsapp-note',
            'label' => 'Local Concierge Contact Note',
            'blocks' => array(
                array('type' => 'paragraph', 'text' => 'Have specific dates in mind? Reply directly to this email or message our Victoria Falls desk on WhatsApp at **+263 714 701 721** for fast itinerary guidance.'),
            ),
        ),
    );
}

/**
 * Convert simple inline formatting (**bold**, *italic*, [label](url)) safely to email HTML.
 */
function outbound_format_newsletter_inline_text(string $text): string {
    $escaped = esc_html($text);
    // [label](https://...)
    $escaped = (string) preg_replace_callback(
        '/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/i',
        static function (array $m): string {
            $url = esc_url($m[2]);
            return '<a href="' . $url . '" style="color:#0B5E8E;text-decoration:underline">' . $m[1] . '</a>';
        },
        $escaped
    );
    // **bold**
    $escaped = (string) preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $escaped);
    // *italic*
    $escaped = (string) preg_replace('/\*([^*]+)\*/', '<em>$1</em>', $escaped);
    return nl2br($escaped);
}

/**
 * Sanitize structured visual blocks array.
 *
 * @param array<int,mixed> $blocks
 * @return array<int,array<string,mixed>>
 */
function outbound_sanitize_newsletter_blocks(array $blocks): array {
    $clean = array();
    foreach ($blocks as $block) {
        if (!is_array($block)) {
            continue;
        }
        $type = sanitize_key((string) ($block['type'] ?? 'paragraph'));
        switch ($type) {
            case 'heading':
                $text = sanitize_text_field((string) ($block['text'] ?? ''));
                if ($text !== '') {
                    $clean[] = array(
                        'type' => 'heading',
                        'level' => ($block['level'] ?? 'h2') === 'h3' ? 'h3' : 'h2',
                        'text' => $text,
                    );
                }
                break;
            case 'paragraph':
                $text = trim(sanitize_textarea_field((string) ($block['text'] ?? '')));
                if ($text !== '') {
                    $clean[] = array('type' => 'paragraph', 'text' => $text);
                }
                break;
            case 'list':
                $raw_items = is_array($block['items'] ?? null) ? $block['items'] : array();
                $items = array();
                foreach ($raw_items as $item) {
                    $line = sanitize_text_field((string) $item);
                    if ($line !== '') {
                        $items[] = $line;
                    }
                }
                if (!empty($items)) {
                    $clean[] = array('type' => 'list', 'items' => $items);
                }
                break;
            case 'image':
                $url = esc_url_raw((string) ($block['url'] ?? ''));
                if ($url !== '') {
                    $clean[] = array(
                        'type' => 'image',
                        'url' => $url,
                        'alt' => sanitize_text_field((string) ($block['alt'] ?? '')),
                        'caption' => sanitize_text_field((string) ($block['caption'] ?? '')),
                        'attachmentId' => abs((int) ($block['attachmentId'] ?? 0)),
                    );
                }
                break;
            case 'button':
                $label = sanitize_text_field((string) ($block['label'] ?? ''));
                $url = esc_url_raw((string) ($block['url'] ?? ''));
                if ($label !== '' && $url !== '') {
                    $clean[] = array(
                        'type' => 'button',
                        'label' => $label,
                        'url' => $url,
                        'color' => outbound_sanitize_newsletter_brand_color((string) ($block['color'] ?? '#0B5E8E')),
                    );
                }
                break;
            case 'columns':
                $clean[] = array(
                    'type' => 'columns',
                    'leftTitle' => sanitize_text_field((string) ($block['leftTitle'] ?? '')),
                    'leftBody' => sanitize_textarea_field((string) ($block['leftBody'] ?? '')),
                    'leftImageUrl' => esc_url_raw((string) ($block['leftImageUrl'] ?? '')),
                    'rightTitle' => sanitize_text_field((string) ($block['rightTitle'] ?? '')),
                    'rightBody' => sanitize_textarea_field((string) ($block['rightBody'] ?? '')),
                    'rightImageUrl' => esc_url_raw((string) ($block['rightImageUrl'] ?? '')),
                );
                break;
            case 'divider':
                $clean[] = array(
                    'type' => 'divider',
                    'style' => ($block['style'] ?? 'line') === 'spacer' ? 'spacer' : 'line',
                );
                break;
        }
    }
    return $clean;
}

/**
 * Render structured visual blocks into email-safe inline-styled HTML.
 *
 * @param array<int,array<string,mixed>> $blocks
 */
function outbound_render_newsletter_blocks(array $blocks, string $default_accent = '#0B5E8E'): string {
    $sanitized = outbound_sanitize_newsletter_blocks($blocks);
    if (empty($sanitized)) {
        return '';
    }
    $out = '';
    foreach ($sanitized as $blk) {
        switch ($blk['type']) {
            case 'heading':
                if ($blk['level'] === 'h3') {
                    $out .= '<h3 style="margin:20px 0 8px;font-size:18px;line-height:1.3;color:#0D2833;font-family:Georgia,serif">' . esc_html($blk['text']) . '</h3>';
                } else {
                    $out .= '<h2 style="margin:24px 0 10px;font-size:21px;line-height:1.25;color:#0D2833;font-family:Georgia,serif">' . esc_html($blk['text']) . '</h2>';
                }
                break;
            case 'paragraph':
                $out .= '<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#1F2937">' . outbound_format_newsletter_inline_text((string) $blk['text']) . '</p>';
                break;
            case 'list':
                $out .= '<ul style="margin:0 0 16px;padding-left:20px;color:#1F2937;font-size:15px;line-height:1.65">';
                foreach ($blk['items'] as $item) {
                    $out .= '<li style="margin-bottom:6px">' . outbound_format_newsletter_inline_text((string) $item) . '</li>';
                }
                $out .= '</ul>';
                break;
            case 'image':
                $out .= '<div style="margin:18px 0">';
                $out .= '<img src="' . esc_url((string) $blk['url']) . '" alt="' . esc_html((string) $blk['alt']) . '" style="width:100%;max-width:544px;height:auto;display:block;border-radius:10px;border:0" />';
                if (!empty($blk['caption'])) {
                    $out .= '<div style="margin-top:6px;font-size:12px;color:#6B7280">' . esc_html((string) $blk['caption']) . '</div>';
                }
                $out .= '</div>';
                break;
            case 'button':
                $btn_color = outbound_sanitize_newsletter_brand_color((string) ($blk['color'] ?? $default_accent), $default_accent);
                $out .= '<p style="margin:22px 0"><a href="' . esc_url((string) $blk['url']) . '" style="display:inline-block;background:' . $btn_color . ';color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">' . esc_html((string) $blk['label']) . '</a></p>';
                break;
            case 'columns':
                $out .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;border-collapse:collapse"><tr>';
                $out .= '<td width="48%" valign="top" style="padding:14px;background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px">';
                if (!empty($blk['leftImageUrl'])) {
                    $out .= '<img src="' . esc_url((string) $blk['leftImageUrl']) . '" alt="' . esc_html((string) $blk['leftTitle']) . '" style="width:100%;height:auto;display:block;border-radius:6px;margin-bottom:10px" />';
                }
                if (!empty($blk['leftTitle'])) {
                    $out .= '<div style="font-size:15px;font-weight:700;color:#0D2833;margin-bottom:6px">' . esc_html((string) $blk['leftTitle']) . '</div>';
                }
                if (!empty($blk['leftBody'])) {
                    $out .= '<div style="font-size:13px;line-height:1.55;color:#374151">' . outbound_format_newsletter_inline_text((string) $blk['leftBody']) . '</div>';
                }
                $out .= '</td>';
                $out .= '<td width="4%" style="font-size:1px;line-height:1px">&nbsp;</td>';
                $out .= '<td width="48%" valign="top" style="padding:14px;background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px">';
                if (!empty($blk['rightImageUrl'])) {
                    $out .= '<img src="' . esc_url((string) $blk['rightImageUrl']) . '" alt="' . esc_html((string) $blk['rightTitle']) . '" style="width:100%;height:auto;display:block;border-radius:6px;margin-bottom:10px" />';
                }
                if (!empty($blk['rightTitle'])) {
                    $out .= '<div style="font-size:15px;font-weight:700;color:#0D2833;margin-bottom:6px">' . esc_html((string) $blk['rightTitle']) . '</div>';
                }
                if (!empty($blk['rightBody'])) {
                    $out .= '<div style="font-size:13px;line-height:1.55;color:#374151">' . outbound_format_newsletter_inline_text((string) $blk['rightBody']) . '</div>';
                }
                $out .= '</td>';
                $out .= '</tr></table>';
                break;
            case 'divider':
                if ($blk['style'] === 'spacer') {
                    $out .= '<div style="height:18px;line-height:18px">&nbsp;</div>';
                } else {
                    $out .= '<hr style="border:0;border-top:1px solid #E5E7EB;margin:22px 0" />';
                }
                break;
        }
    }
    return $out;
}

/**
 * Render structured visual blocks as clean plain text.
 *
 * @param array<int,array<string,mixed>> $blocks
 */
function outbound_render_newsletter_blocks_text(array $blocks): string {
    $sanitized = outbound_sanitize_newsletter_blocks($blocks);
    $lines = array();
    foreach ($sanitized as $blk) {
        switch ($blk['type']) {
            case 'heading':
                $lines[] = strtoupper((string) $blk['text']);
                break;
            case 'paragraph':
                $lines[] = (string) $blk['text'];
                break;
            case 'list':
                foreach ($blk['items'] as $item) {
                    $lines[] = '- ' . $item;
                }
                break;
            case 'image':
                if (!empty($blk['caption']) || !empty($blk['alt'])) {
                    $lines[] = '[Image: ' . ($blk['caption'] ?: $blk['alt']) . '] ' . $blk['url'];
                }
                break;
            case 'button':
                $lines[] = $blk['label'] . ': ' . $blk['url'];
                break;
            case 'columns':
                $lines[] = trim(($blk['leftTitle'] ?? '') . ': ' . ($blk['leftBody'] ?? ''));
                $lines[] = trim(($blk['rightTitle'] ?? '') . ': ' . ($blk['rightBody'] ?? ''));
                break;
            case 'divider':
                $lines[] = '---';
                break;
        }
    }
    return implode("\n\n", array_filter($lines));
}

/**
 * Generate clean plain-text email representation from campaign data.
 *
 * @param array<string,mixed> $data
 */
function outbound_render_newsletter_plain_text(array $data): string {
    $parts = array();
    $title = trim((string) ($data['title'] ?? 'Outbound Holidays Dispatch'));
    $preheader = trim((string) ($data['preheader'] ?? ''));
    $parts[] = 'OUTBOUND HOLIDAYS — VICTORIA FALLS, ZIMBABWE';
    $parts[] = $title;
    if ($preheader !== '') {
        $parts[] = $preheader;
    }

    if (!empty($data['blocks']) && is_array($data['blocks'])) {
        $blocks_text = outbound_render_newsletter_blocks_text($data['blocks']);
        if ($blocks_text !== '') {
            $parts[] = $blocks_text;
        }
    } elseif (!empty($data['bodyText'])) {
        $parts[] = trim((string) $data['bodyText']);
    } elseif (!empty($data['bodyHtml'])) {
        $stripped = html_entity_decode(strip_tags(str_replace(array('<br>', '<br/>', '<br />', '</p>', '</li>', '</h2>', '</h3>'), "\n", (string) $data['bodyHtml'])), ENT_QUOTES, 'UTF-8');
        $parts[] = trim((string) preg_replace("/\n{3,}/", "\n\n", $stripped));
    }

    if (!empty($data['ctaLabel']) && !empty($data['ctaUrl'])) {
        $parts[] = trim((string) $data['ctaLabel']) . ': ' . trim((string) $data['ctaUrl']);
    }

    $site_url = !empty($data['siteUrl']) ? (string) $data['siteUrl'] : (function_exists('home_url') ? home_url('/') : 'https://outboundholiday.com/');
    $unsub_url = (string) ($data['unsubscribeUrl'] ?? $site_url);

    $parts[] = "---\nOutbound Holidays | Victoria Falls, Zimbabwe\nWhatsApp: " . OUTBOUND_NEWSLETTER_WHATSAPP_DISPLAY . "\nWebsite: " . $site_url . "\nUnsubscribe at any time: " . $unsub_url;

    return implode("\n\n", array_filter($parts));
}

/**
 * Render one of the 4 branded Outbound Holidays email templates.
 *
 * @param string               $template_id
 * @param array<string,mixed>  $data
 */
function outbound_render_newsletter_template(string $template_id, array $data): string {
    $templates = outbound_get_newsletter_templates();
    $tpl = $templates[$template_id] ?? $templates['seasonal-spotlight'];
    $accent = $tpl['accent'];
    $header_bg = $tpl['headerBg'];
    $cta_color = !empty($data['ctaColor']) ? outbound_sanitize_newsletter_brand_color((string) $data['ctaColor'], $accent) : $accent;

    $site_url = !empty($data['siteUrl']) ? (string) $data['siteUrl'] : (function_exists('home_url') ? home_url('/') : 'https://outboundholiday.com/');
    $logo_url = !empty($data['logoUrl'])
        ? (string) $data['logoUrl']
        : (function_exists('outbound_get_media_fallback') ? outbound_get_media_fallback('logo') : '');
    $title = esc_html((string) ($data['title'] ?? 'Outbound Holidays Dispatch'));
    $preheader = esc_html((string) ($data['preheader'] ?? 'Curated Victoria Falls travel insights from Outbound Holidays.'));
    $hero = !empty($data['heroImageUrl']) ? esc_url((string) $data['heroImageUrl']) : '';
    $hero_alt = esc_html((string) (!empty($data['heroImageAlt']) ? $data['heroImageAlt'] : ($data['title'] ?? 'Outbound Holidays Victoria Falls')));
    $cta_label = esc_html((string) ($data['ctaLabel'] ?? ''));
    $cta_url = !empty($data['ctaUrl']) ? esc_url((string) $data['ctaUrl']) : '';
    $unsub_url = esc_url((string) ($data['unsubscribeUrl'] ?? $site_url));
    $body_html = (string) ($data['bodyHtml'] ?? '');

    if ($body_html === '' && !empty($data['blocks']) && is_array($data['blocks'])) {
        $body_html = outbound_render_newsletter_blocks($data['blocks'], $accent);
    }

    $logo_block = '';
    if ($logo_url !== '') {
        $logo_block = '<img src="' . esc_url($logo_url) . '" alt="Outbound Holidays" style="height:36px;width:auto;display:inline-block;vertical-align:middle;margin-right:10px;border-radius:4px" />';
    }

    $hero_block = $hero !== ''
        ? '<img src="' . $hero . '" alt="' . $hero_alt . '" style="width:100%;max-width:544px;height:auto;border-radius:10px;margin:0 0 22px;display:block;border:0" />'
        : '';

    $cta_block = ($cta_label !== '' && $cta_url !== '')
        ? '<p style="margin:26px 0 8px"><a href="' . $cta_url . '" style="display:inline-block;background:' . $cta_color . ';color:#ffffff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">' . $cta_label . '</a></p>'
        : '';

    $body_card_style = $template_id === 'plain-editorial'
        ? 'background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #d1d5db'
        : 'background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e2dc';

    return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
        . '<body style="margin:0;padding:0;background:#F6F3ED;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#111827">'
        . '<span style="display:none;max-height:0;overflow:hidden;opacity:0">' . $preheader . '</span>'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#F6F3ED"><tr><td align="center">'
        . '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;' . $body_card_style . '">'
        . '<tr><td style="background:' . $header_bg . ';border-bottom:4px solid ' . $accent . ';padding:18px 28px;color:#ffffff">'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>'
        . '<td valign="middle">' . $logo_block . '<span style="font-family:Georgia,serif;font-size:19px;font-weight:700;letter-spacing:0.3px;vertical-align:middle;color:#ffffff">Outbound Holidays</span></td>'
        . '<td align="right" valign="middle" style="font-size:11px;text-transform:uppercase;letter-spacing:1.1px;color:#E5E7EB">' . esc_html($tpl['badge']) . '</td>'
        . '</tr></table></td></tr>'
        . '<tr><td style="padding:28px 28px 20px">'
        . '<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:26px;line-height:1.25;color:#0D2833">' . $title . '</h1>'
        . $hero_block
        . '<div style="font-size:15px;line-height:1.65;color:#1F2937">' . $body_html . '</div>'
        . $cta_block
        . '</td></tr>'
        . '<tr><td style="padding:18px 28px;background:#FAF9F6;border-top:1px solid #ece7df;font-size:12px;line-height:1.6;color:#6B7280">'
        . '<strong style="color:#0D2833">Outbound Holidays</strong> &middot; Victoria Falls, Zimbabwe<br/>'
        . 'WhatsApp: <a href="' . esc_url(OUTBOUND_NEWSLETTER_WHATSAPP_URL) . '" style="color:#0B5E8E;text-decoration:none">' . esc_html(OUTBOUND_NEWSLETTER_WHATSAPP_DISPLAY) . '</a>'
        . ' &middot; <a href="' . esc_url($site_url) . '" style="color:#0B5E8E;text-decoration:none">Visit Website</a><br/>'
        . 'You are receiving this because you subscribed to Outbound Holidays travel dispatches.<br/>'
        . '<a href="' . $unsub_url . '" style="color:#0B5E8E;text-decoration:underline">Unsubscribe at any time</a>.'
        . '</td></tr></table></td></tr></table></body></html>';
}

/**
 * Convert Africa/Harare (CAT, UTC+2) local datetime input to UTC MySQL datetime.
 */
function outbound_harare_local_to_utc(string $local_datetime): ?string {
    $raw = trim($local_datetime);
    if ($raw === '') {
        return null;
    }
    try {
        $harare = new DateTimeZone('Africa/Harare');
        $utc = new DateTimeZone('UTC');
        $dt = new DateTimeImmutable($raw, $harare);
        return $dt->setTimezone($utc)->format('Y-m-d H:i:s');
    } catch (Throwable $e) {
        return null;
    }
}

/**
 * Convert UTC MySQL datetime to HTML datetime-local value in Africa/Harare.
 */
function outbound_utc_to_harare_input(?string $utc_datetime): string {
    $raw = trim((string) $utc_datetime);
    if ($raw === '') {
        return '';
    }
    try {
        $dt = new DateTimeImmutable($raw, new DateTimeZone('UTC'));
        return $dt->setTimezone(new DateTimeZone('Africa/Harare'))->format('Y-m-d\TH:i');
    } catch (Throwable $e) {
        return '';
    }
}

/**
 * Format UTC MySQL datetime into human-readable Africa/Harare CAT string.
 */
function outbound_utc_to_harare_label(?string $utc_datetime): string {
    $raw = trim((string) $utc_datetime);
    if ($raw === '') {
        return '—';
    }
    try {
        $dt = new DateTimeImmutable($raw, new DateTimeZone('UTC'));
        return $dt->setTimezone(new DateTimeZone('Africa/Harare'))->format('d M Y, H:i') . ' CAT';
    } catch (Throwable $e) {
        return $raw . ' UTC';
    }
}

/**
 * Define real subscriber audience segments backed by wp_outbound_subscribers data.
 *
 * @return array<string,array<string,mixed>>
 */
function outbound_get_newsletter_audience_segments(): array {
    return array(
        'all_confirmed' => array(
            'id' => 'all_confirmed',
            'label' => 'All Confirmed Subscribers',
            'description' => 'Every confirmed subscriber across all sources (automatically excludes unsubscribed, pending & suppressed).',
            'sources' => array(),
        ),
        'travel_club' => array(
            'id' => 'travel_club',
            'label' => 'Travel Club & Website Signups',
            'description' => 'Subscribers who opted in via the website or blog newsletter form.',
            'sources' => array('website', 'blog', 'travel-club', 'newsletter'),
        ),
        'holiday_builder' => array(
            'id' => 'holiday_builder',
            'label' => 'Holiday Builder Opt-Ins',
            'description' => 'Enquiry guests who explicitly ticked marketing consent in the Holiday Builder.',
            'sources' => array('holiday-builder-optin'),
        ),
        'contact_optin' => array(
            'id' => 'contact_optin',
            'label' => 'Contact Form Opt-Ins',
            'description' => 'Contact form guests who explicitly ticked marketing consent.',
            'sources' => array('contact-optin'),
        ),
        'csv_import' => array(
            'id' => 'csv_import',
            'label' => 'Imported Subscribers (CSV)',
            'description' => 'Confirmed contacts imported directly via the Newsletter CSV importer.',
            'sources' => array('csv-import'),
        ),
    );
}

/**
 * Build SQL WHERE clause + params for a given audience segment (strictly confirmed only).
 *
 * @return array{where:string,params:array<int,string>}
 */
function outbound_build_audience_where_clause(string $segment): array {
    $segments = outbound_get_newsletter_audience_segments();
    $def = $segments[$segment] ?? $segments['all_confirmed'];
    $sources = $def['sources'];
    if (empty($sources)) {
        return array(
            'where' => "status = 'confirmed'",
            'params' => array(),
        );
    }
    $placeholders = implode(', ', array_fill(0, count($sources), '%s'));
    return array(
        'where' => "status = 'confirmed' AND source IN ({$placeholders})",
        'params' => array_values($sources),
    );
}

/**
 * Count confirmed recipients for an audience segment.
 */
function outbound_count_audience_subscribers(string $segment = 'all_confirmed'): int {
    global $wpdb;
    $tables = outbound_get_table_names();
    $clause = outbound_build_audience_where_clause($segment);
    $sql = "SELECT COUNT(*) FROM {$tables['subscribers']} WHERE {$clause['where']}";
    if (!empty($clause['params'])) {
        $sql = $wpdb->prepare($sql, $clause['params']);
    }
    return (int) $wpdb->get_var($sql);
}

/**
 * Fetch confirmed subscriber rows for an audience segment.
 *
 * @return array<int,object>
 */
function outbound_get_audience_subscribers(string $segment = 'all_confirmed'): array {
    global $wpdb;
    $tables = outbound_get_table_names();
    $clause = outbound_build_audience_where_clause($segment);
    $sql = "SELECT * FROM {$tables['subscribers']} WHERE {$clause['where']} ORDER BY id ASC";
    if (!empty($clause['params'])) {
        $sql = $wpdb->prepare($sql, $clause['params']);
    }
    $rows = $wpdb->get_results($sql);
    return is_array($rows) ? $rows : array();
}

/**
 * Create or update a newsletter subscriber with double opt-in and suppression protection.
 *
 * @param array<string,mixed> $args
 * @return array<string,mixed>
 */
function outbound_create_or_update_subscriber(array $args): array {
    global $wpdb;
    $tables = outbound_get_table_names();

    $email = strtolower(trim(sanitize_email((string) ($args['email'] ?? ''))));
    if (!$email || !is_email($email)) {
        return array('ok' => false, 'status' => 'invalid_email');
    }

    $name = sanitize_text_field((string) ($args['name'] ?? ''));
    $source = sanitize_text_field((string) ($args['source'] ?? 'website'));
    $consent_text = sanitize_textarea_field((string) ($args['consent_text'] ?? 'Yes, send me seasonal Victoria Falls travel updates.'));
    $consent_version = sanitize_text_field((string) ($args['consent_version'] ?? OUTBOUND_NEWSLETTER_CONSENT_VERSION));
    $ip = sanitize_text_field((string) ($args['ip_address'] ?? ''));
    $require_double_opt_in = !empty($args['double_opt_in']);

    $existing = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$tables['subscribers']} WHERE email = %s LIMIT 1",
        $email
    ));

    $now = gmdate('Y-m-d H:i:s');
    $unsub_pair = outbound_newsletter_generate_token_pair();

    if ($existing) {
        // Never overwrite admin-suppressed contacts automatically.
        if ($existing->status === 'suppressed') {
            return array('ok' => false, 'status' => 'suppressed', 'id' => (int) $existing->id);
        }
        // Enquiry checkboxes must not silently re-subscribe previously unsubscribed contacts.
        if ($existing->status === 'unsubscribed' && !$require_double_opt_in) {
            return array('ok' => false, 'status' => 'unsubscribed', 'id' => (int) $existing->id);
        }
        if ($existing->status === 'confirmed' && !$require_double_opt_in) {
            return array('ok' => true, 'status' => 'already_confirmed', 'id' => (int) $existing->id);
        }
    }

    if ($require_double_opt_in) {
        $confirm_pair = outbound_newsletter_generate_token_pair();
        $expires = gmdate('Y-m-d H:i:s', time() + 72 * 3600);

        if ($existing) {
            $wpdb->update(
                $tables['subscribers'],
                array(
                    'name' => $name ?: $existing->name,
                    'source' => $source,
                    'status' => $existing->status === 'confirmed' ? 'confirmed' : 'pending',
                    'consent_text' => $consent_text,
                    'consent_version' => $consent_version,
                    'consented_at' => $now,
                    'confirm_token_hash' => $confirm_pair['hash'],
                    'confirm_expires_at' => $expires,
                    'unsubscribe_token_hash' => $existing->unsubscribe_token_hash ?: $unsub_pair['hash'],
                    'ip_address' => $ip,
                    'updated_at' => $now,
                ),
                array('id' => (int) $existing->id)
            );
            $sub_id = (int) $existing->id;
        } else {
            $wpdb->insert(
                $tables['subscribers'],
                array(
                    'email' => $email,
                    'name' => $name ?: null,
                    'source' => $source,
                    'status' => 'pending',
                    'consent_text' => $consent_text,
                    'consent_version' => $consent_version,
                    'consented_at' => $now,
                    'confirm_token_hash' => $confirm_pair['hash'],
                    'confirm_expires_at' => $expires,
                    'unsubscribe_token_hash' => $unsub_pair['hash'],
                    'ip_address' => $ip,
                    'created_at' => $now,
                    'updated_at' => $now,
                )
            );
            $sub_id = (int) $wpdb->insert_id;
        }

        if ($existing && $existing->status === 'confirmed') {
            return array('ok' => true, 'status' => 'already_confirmed', 'id' => $sub_id);
        }

        $confirm_url = add_query_arg(
            array('action' => 'confirm', 'token' => $confirm_pair['raw']),
            home_url('/newsletter/confirmed/')
        );
        $unsub_url = add_query_arg(
            array('action' => 'unsubscribe', 'token' => $unsub_pair['raw']),
            home_url('/newsletter/confirmed/')
        );

        $html = outbound_render_newsletter_template('plain-editorial', array(
            'title' => 'Confirm your Outbound Holidays subscription',
            'preheader' => 'One click to confirm your Victoria Falls Travel Club subscription.',
            'bodyHtml' => '<p>Thank you for joining the Outbound Holidays Travel Club.</p><p>Please confirm your email address so we can send seasonal Victoria Falls updates and curated travel notes.</p>',
            'ctaLabel' => 'Confirm Subscription',
            'ctaUrl' => $confirm_url,
            'unsubscribeUrl' => $unsub_url,
            'siteUrl' => home_url('/'),
        ));

        wp_mail(
            $email,
            'Confirm your Outbound Holidays subscription',
            $html,
            array('Content-Type: text/html; charset=UTF-8')
        );

        return array('ok' => true, 'status' => 'pending_confirmation', 'id' => $sub_id);
    }

    if (!$existing) {
        $wpdb->insert(
            $tables['subscribers'],
            array(
                'email' => $email,
                'name' => $name ?: null,
                'source' => $source,
                'status' => 'confirmed',
                'consent_text' => $consent_text,
                'consent_version' => $consent_version,
                'consented_at' => $now,
                'confirmed_at' => $now,
                'unsubscribe_token_hash' => $unsub_pair['hash'],
                'ip_address' => $ip,
                'created_at' => $now,
                'updated_at' => $now,
            )
        );
        return array('ok' => true, 'status' => 'confirmed', 'id' => (int) $wpdb->insert_id);
    }

    return array('ok' => true, 'status' => $existing->status, 'id' => (int) $existing->id);
}

/**
 * Process a public newsletter subscription submission with anti-spam & rate limiting.
 *
 * @param array<string,mixed> $payload
 * @return array<string,mixed>|WP_Error
 */
function outbound_process_newsletter_subscription(array $payload, string $client_ip) {
    if (!empty($payload['website']) || !empty($payload['honeypot'])) {
        return new WP_Error('spam_detected', 'We could not complete your subscription. Please try again.', array('status' => 400));
    }

    if (function_exists('outbound_check_rate_limit') && !outbound_check_rate_limit('newsletter', $client_ip, 10, 600)) {
        return new WP_Error('rate_limited', 'You have tried a few times in a row. Please wait a minute and try again.', array('status' => 429));
    }

    $turnstile_token = isset($payload['turnstileToken']) ? sanitize_text_field((string) $payload['turnstileToken']) : '';
    if (function_exists('outbound_verify_turnstile') && !outbound_verify_turnstile($turnstile_token, $client_ip)) {
        return new WP_Error('captcha_failed', 'Please complete the quick security check and try again.', array('status' => 400));
    }

    if (empty($payload['marketingConsent'])) {
        return new WP_Error('consent_required', 'Please tick the box to confirm you would like to receive travel updates.', array('status' => 400));
    }

    $email = strtolower(trim(sanitize_email((string) ($payload['email'] ?? ''))));
    if (!$email || !is_email($email)) {
        return new WP_Error('invalid_email', 'Please enter a valid email address.', array('status' => 400));
    }

    $result = outbound_create_or_update_subscriber(array(
        'email'         => $email,
        'name'          => sanitize_text_field((string) ($payload['name'] ?? '')),
        'source'        => sanitize_text_field((string) ($payload['source'] ?? 'website-newsletter')),
        'ip_address'    => $client_ip,
        'double_opt_in' => true,
    ));

    if (($result['status'] ?? '') === 'invalid_email') {
        return new WP_Error('invalid_email', 'Please enter a valid email address.', array('status' => 400));
    }

    if (($result['status'] ?? '') === 'suppressed') {
        return new WP_Error('suppressed', 'This email address cannot be subscribed automatically. Please contact our team if you would like to re-subscribe.', array('status' => 400));
    }

    if (($result['status'] ?? '') === 'already_confirmed') {
        return array(
            'saved'   => true,
            'ok'      => true,
            'status'  => 'subscribed',
            'message' => 'Your confirmed subscription is already saved.',
        );
    }

    return array(
        'saved'   => true,
        'ok'      => true,
        'status'  => (string) ($result['status'] ?? 'pending_confirmation'),
        'message' => 'Thank you! Please check your inbox to confirm your Travel Club subscription.',
    );
}

/**
 * Register REST API endpoint `/wp-json/outbound/v1/newsletter`.
 */
add_action('rest_api_init', static function (): void {
    $callback = static function (WP_REST_Request $request) {
        $params = $request->get_json_params();
        if (!is_array($params) || empty($params)) {
            $params = $request->get_params();
        }
        $ip     = function_exists('outbound_get_client_ip') ? outbound_get_client_ip() : (string) ($_SERVER['REMOTE_ADDR'] ?? '');
        $result = outbound_process_newsletter_subscription((array) $params, $ip);
        if (is_wp_error($result)) {
            $data   = $result->get_error_data();
            $status = is_array($data) && isset($data['status']) ? (int) $data['status'] : 400;
            return new WP_REST_Response(array('ok' => false, 'error' => $result->get_error_message()), $status);
        }
        $http_status = (($result['status'] ?? '') === 'subscribed') ? 200 : 201;
        return new WP_REST_Response($result, $http_status);
    };

    register_rest_route('outbound/v1', '/newsletter', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => $callback,
    ));

    register_rest_route('outbound/v1', '/newsletter/subscribe', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => $callback,
    ));
});

/**
 * Parse and validate CSV subscriber rows cleanly (pure helper + DB importer).
 *
 * @return array<int,array{email:string,name:string}>
 */
function outbound_parse_subscriber_csv_rows(string $csv_text): array {
    $lines = preg_split('/\r\n|\r|\n/', trim($csv_text)) ?: array();
    $rows = array();
    $seen = array();
    foreach ($lines as $idx => $line) {
        $trimmed = trim($line);
        if ($trimmed === '') {
            continue;
        }
        $cols = str_getcsv($trimmed);
        $raw_email = strtolower(trim((string) ($cols[0] ?? '')));
        if ($idx === 0 && ($raw_email === 'email' || str_contains($raw_email, 'email address'))) {
            continue;
        }
        $email = sanitize_email($raw_email);
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            continue;
        }
        if (isset($seen[$email])) {
            continue;
        }
        $seen[$email] = true;
        $name = sanitize_text_field((string) ($cols[1] ?? ''));
        $rows[] = array(
            'email' => $email,
            'name' => $name,
        );
    }
    return $rows;
}

/**
 * Import subscribers from CSV while strictly respecting unsubscribed & suppressed contacts.
 *
 * @return array{imported:int,skipped_existing:int,skipped_suppressed:int,invalid:int}
 */
function outbound_import_newsletter_subscribers_csv(string $csv_text, string $default_source = 'csv-import'): array {
    global $wpdb;
    $tables = outbound_get_table_names();

    $lines = preg_split('/\r\n|\r|\n/', trim($csv_text)) ?: array();
    $parsed = outbound_parse_subscriber_csv_rows($csv_text);
    $total_non_empty = 0;
    foreach ($lines as $idx => $line) {
        $t = trim($line);
        if ($t === '') {
            continue;
        }
        $cols = str_getcsv($t);
        if ($idx === 0 && str_contains(strtolower((string) ($cols[0] ?? '')), 'email')) {
            continue;
        }
        $total_non_empty++;
    }

    $result = array(
        'imported' => 0,
        'skipped_existing' => 0,
        'skipped_suppressed' => 0,
        'invalid' => max(0, $total_non_empty - count($parsed)),
    );

    $now = gmdate('Y-m-d H:i:s');
    foreach ($parsed as $row) {
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT id, status FROM {$tables['subscribers']} WHERE email = %s LIMIT 1",
            $row['email']
        ));
        if ($existing) {
            if (in_array($existing->status, array('unsubscribed', 'suppressed'), true)) {
                $result['skipped_suppressed']++;
            } else {
                $result['skipped_existing']++;
            }
            continue;
        }

        $unsub_pair = outbound_newsletter_generate_token_pair();
        $wpdb->insert(
            $tables['subscribers'],
            array(
                'email' => $row['email'],
                'name' => $row['name'] !== '' ? $row['name'] : null,
                'source' => sanitize_key($default_source) ?: 'csv-import',
                'status' => 'confirmed',
                'consent_text' => 'Imported by administrator with confirmed opt-in record.',
                'consent_version' => OUTBOUND_NEWSLETTER_CONSENT_VERSION,
                'consented_at' => $now,
                'confirmed_at' => $now,
                'unsubscribe_token_hash' => $unsub_pair['hash'],
                'created_at' => $now,
                'updated_at' => $now,
            )
        );
        $result['imported']++;
    }

    return $result;
}

/**
 * Handle confirm / unsubscribe token links.
 *
 * @return array{ok:bool,action:string,message:string}
 */
function outbound_handle_newsletter_token_action(string $action, string $raw_token): array {
    global $wpdb;
    $tables = outbound_get_table_names();
    $hash = hash('sha256', trim($raw_token));
    $now = gmdate('Y-m-d H:i:s');

    if ($action === 'confirm') {
        $sub = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$tables['subscribers']} WHERE confirm_token_hash = %s LIMIT 1",
            $hash
        ));
        if (!$sub) {
            return array('ok' => false, 'action' => 'confirm', 'message' => 'This confirmation link is invalid or has already been used.');
        }
        if ($sub->confirm_expires_at && strtotime($sub->confirm_expires_at) < time()) {
            return array('ok' => false, 'action' => 'confirm', 'message' => 'This confirmation link has expired. Please subscribe again on the website.');
        }
        $wpdb->update(
            $tables['subscribers'],
            array(
                'status' => 'confirmed',
                'confirmed_at' => $now,
                'confirm_token_hash' => null,
                'confirm_expires_at' => null,
                'updated_at' => $now,
            ),
            array('id' => (int) $sub->id)
        );
        return array('ok' => true, 'action' => 'confirm', 'message' => 'Your Outbound Holidays Travel Club subscription is confirmed.');
    }

    if ($action === 'unsubscribe') {
        $sub = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$tables['subscribers']} WHERE unsubscribe_token_hash = %s LIMIT 1",
            $hash
        ));
        if (!$sub) {
            return array('ok' => false, 'action' => 'unsubscribe', 'message' => 'Unsubscribe link not recognised.');
        }
        $wpdb->update(
            $tables['subscribers'],
            array(
                'status' => 'unsubscribed',
                'unsubscribed_at' => $now,
                'updated_at' => $now,
            ),
            array('id' => (int) $sub->id)
        );
        return array('ok' => true, 'action' => 'unsubscribe', 'message' => 'You have been unsubscribed from Outbound Holidays emails.');
    }

    return array('ok' => false, 'action' => 'unknown', 'message' => 'Unsupported action.');
}

/**
 * Shortcode / page helper for /newsletter/confirmed/.
 */
function outbound_render_newsletter_confirmation_page(): string {
    $action = sanitize_key((string) ($_GET['action'] ?? ''));
    $token = sanitize_text_field((string) ($_GET['token'] ?? ''));
    if ($action && $token) {
        $res = outbound_handle_newsletter_token_action($action, $token);
        $title = $res['ok'] ? 'Subscription Updated' : 'Link Issue';
        $msg = $res['message'];
    } else {
        $title = 'Outbound Holidays Travel Club';
        $msg = 'Thank you for managing your Outbound Holidays newsletter preferences.';
    }

    return '<div style="max-width:560px;margin:60px auto;padding:36px;background:#ffffff;border-radius:16px;border:1px solid #e5e2dc;text-align:center;font-family:sans-serif">'
        . '<h1 style="font-family:Georgia,serif;color:#0D2833;margin-top:0">' . esc_html($title) . '</h1>'
        . '<p style="color:#4b5563;line-height:1.6">' . esc_html($msg) . '</p>'
        . '<p style="margin-top:24px"><a href="' . esc_url(home_url('/')) . '" style="display:inline-block;background:#0B5E8E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Return to Outbound Holidays</a></p>'
        . '</div>';
}
if (function_exists('add_shortcode')) {
    add_shortcode('outbound_newsletter_confirm', 'outbound_render_newsletter_confirmation_page');
}

/**
 * Duplicate an existing campaign into a fresh draft (never copies send status or queue logs).
 */
function outbound_duplicate_newsletter_campaign(int $source_id): ?int {
    global $wpdb;
    $tables = outbound_get_table_names();
    $src = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$tables['campaigns']} WHERE id = %d LIMIT 1",
        $source_id
    ));
    if (!$src) {
        return null;
    }

    $now = gmdate('Y-m-d H:i:s');
    $wpdb->insert(
        $tables['campaigns'],
        array(
            'title' => sanitize_text_field($src->title . ' (Copy)'),
            'subject' => $src->subject,
            'preheader' => $src->preheader,
            'template_id' => $src->template_id ?: 'seasonal-spotlight',
            'audience_segment' => $src->audience_segment ?: 'all_confirmed',
            'sender_name' => $src->sender_name,
            'sender_email' => $src->sender_email,
            'reply_to_email' => $src->reply_to_email,
            'body_html' => $src->body_html,
            'body_text' => $src->body_text,
            'blocks_json' => $src->blocks_json,
            'cta_label' => $src->cta_label,
            'cta_url' => $src->cta_url,
            'hero_image_id' => $src->hero_image_id,
            'hero_image_url' => $src->hero_image_url,
            'hero_image_alt' => $src->hero_image_alt,
            'status' => 'draft',
            'scheduled_at' => null,
            'started_at' => null,
            'completed_at' => null,
            'recipient_count' => 0,
            'sent_count' => 0,
            'failed_count' => 0,
            'batch_size' => (int) ($src->batch_size ?: 25),
            'created_by' => function_exists('get_current_user_id') ? get_current_user_id() : null,
            'created_at' => $now,
            'updated_at' => $now,
        )
    );
    return (int) $wpdb->insert_id ?: null;
}

/**
 * Cancel a scheduled campaign before dispatch (reverts cleanly to draft).
 */
function outbound_cancel_scheduled_campaign(int $campaign_id): bool {
    global $wpdb;
    $tables = outbound_get_table_names();
    $row = $wpdb->get_row($wpdb->prepare(
        "SELECT id, status FROM {$tables['campaigns']} WHERE id = %d LIMIT 1",
        $campaign_id
    ));
    if (!$row || $row->status !== 'scheduled') {
        return false;
    }
    $wpdb->update(
        $tables['campaigns'],
        array(
            'status' => 'draft',
            'scheduled_at' => null,
            'updated_at' => gmdate('Y-m-d H:i:s'),
        ),
        array('id' => $campaign_id)
    );
    return true;
}

/**
 * Archive a draft, completed, or failed campaign (without deleting records).
 */
function outbound_archive_newsletter_campaign(int $campaign_id): bool {
    global $wpdb;
    $tables = outbound_get_table_names();
    $row = $wpdb->get_row($wpdb->prepare(
        "SELECT id, status FROM {$tables['campaigns']} WHERE id = %d LIMIT 1",
        $campaign_id
    ));
    if (!$row || in_array($row->status, array('queued', 'sending'), true)) {
        return false;
    }
    $wpdb->update(
        $tables['campaigns'],
        array(
            'status' => 'archived',
            'updated_at' => gmdate('Y-m-d H:i:s'),
        ),
        array('id' => $campaign_id)
    );
    return true;
}

/**
 * Queue a campaign's emails into wp_outbound_notifications with duplicate-send protection.
 *
 * @return array{ok:bool,queued?:int,error?:string}
 */
function outbound_queue_campaign_delivery(int $campaign_id, bool $trigger_cron = true): array {
    global $wpdb;
    $tables = outbound_get_table_names();
    $smtp = get_option('outbound_smtp_options', array());
    if (empty($smtp['live_send_enabled'])) {
        return array('ok' => false, 'error' => 'Live newsletter sending is paused in Outbound CMS → Setup & Email Health.');
    }

    $campaign = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$tables['campaigns']} WHERE id = %d LIMIT 1",
        $campaign_id
    ));
    if (!$campaign) {
        return array('ok' => false, 'error' => 'Campaign not found.');
    }
    if (in_array($campaign->status, array('queued', 'sending', 'completed'), true)) {
        return array('ok' => false, 'error' => 'Duplicate send blocked: this campaign is already ' . $campaign->status . '. Duplicate it to send a new copy.');
    }

    $existing_queued = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$tables['notifications']} WHERE campaign_id = %d AND kind = 'newsletter-campaign'",
        $campaign_id
    ));
    if ($existing_queued > 0) {
        return array('ok' => false, 'error' => 'Duplicate send blocked: queue rows already exist for this campaign.');
    }

    $segment = !empty($campaign->audience_segment) ? (string) $campaign->audience_segment : 'all_confirmed';
    $subscribers = outbound_get_audience_subscribers($segment);
    if (empty($subscribers)) {
        return array('ok' => false, 'error' => 'No confirmed subscribers match the selected audience segment.');
    }

    $blocks = array();
    if (!empty($campaign->blocks_json)) {
        $decoded = json_decode((string) $campaign->blocks_json, true);
        if (is_array($decoded)) {
            $blocks = $decoded;
        }
    }

    $now = gmdate('Y-m-d H:i:s');
    $queued = 0;

    foreach ($subscribers as $sub) {
        $unsub_raw = outbound_newsletter_generate_token_pair();
        $wpdb->update(
            $tables['subscribers'],
            array('unsubscribe_token_hash' => $unsub_raw['hash'], 'updated_at' => $now),
            array('id' => (int) $sub->id)
        );
        $unsub_url = add_query_arg(
            array('action' => 'unsubscribe', 'token' => $unsub_raw['raw']),
            home_url('/newsletter/confirmed/')
        );

        $tpl_data = array(
            'title' => $campaign->title,
            'preheader' => $campaign->preheader,
            'bodyHtml' => $campaign->body_html,
            'bodyText' => $campaign->body_text,
            'blocks' => $blocks,
            'ctaLabel' => $campaign->cta_label,
            'ctaUrl' => $campaign->cta_url,
            'heroImageUrl' => $campaign->hero_image_url,
            'heroImageAlt' => $campaign->hero_image_alt ?: $campaign->title,
            'unsubscribeUrl' => $unsub_url,
            'siteUrl' => home_url('/'),
        );

        $html = outbound_render_newsletter_template($campaign->template_id, $tpl_data);
        $plain = outbound_render_newsletter_plain_text($tpl_data);

        $wpdb->insert(
            $tables['notifications'],
            array(
                'kind' => 'newsletter-campaign',
                'recipient_email' => $sub->email,
                'subject' => $campaign->subject,
                'body_html' => $html,
                'body_text' => $plain,
                'campaign_id' => $campaign_id,
                'subscriber_id' => (int) $sub->id,
                'status' => 'pending',
                'scheduled_for' => $now,
                'created_at' => $now,
            )
        );
        $queued++;
    }

    $wpdb->update(
        $tables['campaigns'],
        array(
            'status' => 'sending',
            'started_at' => $now,
            'recipient_count' => $queued,
            'updated_at' => $now,
        ),
        array('id' => $campaign_id)
    );

    $dispatch = null;
    if ($trigger_cron) {
        $dispatch = outbound_dispatch_pending_newsletter_batch_detailed(25);
        if (!empty($dispatch['locked'])) {
            outbound_schedule_immediate_queue_run(5);
        }
    }

    return array('ok' => true, 'queued' => $queued, 'dispatch' => $dispatch);
}

/**
 * Send one email with optional sender / reply-to overrides and capture real wp_mail_failed error.
 *
 * @return array{ok:bool,error:string}
 */
function outbound_send_newsletter_email(string $to, string $subject, string $html, array $sender_meta = array()): array {
    $captured_error = '';
    $fail_cb = static function ($wp_error) use (&$captured_error): void {
        if (is_wp_error($wp_error)) {
            $captured_error = $wp_error->get_error_message();
        }
    };
    add_action('wp_mail_failed', $fail_cb);

    $headers = array('Content-Type: text/html; charset=UTF-8');
    $from_email = !empty($sender_meta['sender_email']) ? sanitize_email((string) $sender_meta['sender_email']) : '';
    $from_name = !empty($sender_meta['sender_name']) ? sanitize_text_field((string) $sender_meta['sender_name']) : '';
    $reply_to = !empty($sender_meta['reply_to_email']) ? sanitize_email((string) $sender_meta['reply_to_email']) : '';

    if ($from_email !== '' && is_email($from_email)) {
        $headers[] = $from_name !== '' ? "From: {$from_name} <{$from_email}>" : "From: {$from_email}";
    }
    if ($reply_to !== '' && is_email($reply_to)) {
        $headers[] = "Reply-To: {$reply_to}";
    }

    $sent = wp_mail($to, $subject, $html, $headers);
    remove_action('wp_mail_failed', $fail_cb);

    return array(
        'ok' => (bool) $sent,
        'error' => $sent ? '' : ($captured_error !== '' ? $captured_error : 'wp_mail() returned false. Check Outbound CMS → Setup & Email Health.'),
    );
}

/**
 * Register a 1-minute WP-Cron interval for responsive newsletter queue processing.
 *
 * @param array<string,array<string,mixed>> $schedules
 * @return array<string,array<string,mixed>>
 */
function outbound_register_newsletter_cron_schedules(array $schedules): array {
    if (!isset($schedules['outbound_every_minute'])) {
        $schedules['outbound_every_minute'] = array(
            'interval' => 60,
            'display' => 'Every Minute (Outbound Newsletter Queue)',
        );
    }
    return $schedules;
}
add_filter('cron_schedules', 'outbound_register_newsletter_cron_schedules');

/**
 * Self-heal recurring WP-Cron registration for scheduled campaigns and pending queue items.
 */
function outbound_ensure_newsletter_cron_scheduled(): void {
    if (function_exists('wp_installing') && wp_installing()) {
        return;
    }
    if (function_exists('wp_next_scheduled') && function_exists('wp_schedule_event')) {
        if (!wp_next_scheduled('outbound_process_due_campaigns')) {
            wp_schedule_event(time(), 'outbound_every_minute', 'outbound_process_due_campaigns');
        }
    }
}
add_action('init', 'outbound_ensure_newsletter_cron_scheduled');

/**
 * Schedule an immediate (or short-delay) single queue worker event and nudge WP-Cron non-blockingly.
 */
function outbound_schedule_immediate_queue_run(int $delay_seconds = 0): void {
    $run_at = time() + max(0, $delay_seconds);
    if (function_exists('wp_next_scheduled') && function_exists('wp_schedule_single_event')) {
        if (!wp_next_scheduled('outbound_run_notification_queue')) {
            wp_schedule_single_event($run_at, 'outbound_run_notification_queue');
        }
    }
    if ($delay_seconds === 0 && function_exists('spawn_cron') && (!defined('DOING_CRON') || !DOING_CRON)) {
        spawn_cron();
    }
}

/**
 * Clean up scheduled newsletter cron hooks when switching away from the theme.
 */
function outbound_unschedule_newsletter_cron(): void {
    if (function_exists('wp_clear_scheduled_hook')) {
        wp_clear_scheduled_hook('outbound_process_due_campaigns');
        wp_clear_scheduled_hook('outbound_run_notification_queue');
    }
}
add_action('switch_theme', 'outbound_unschedule_newsletter_cron');

/**
 * Process due scheduled campaigns and queued newsletter batch items with concurrency locking
 * and atomic per-row claiming so simultaneous workers cannot send duplicate emails.
 *
 * @return array{processed:int,sent:int,failed_or_requeued:int,locked:bool,remaining:int}
 */
function outbound_dispatch_pending_newsletter_batch_detailed(int $batch_size = 25): array {
    global $wpdb;
    $tables = outbound_get_table_names();
    $lock_key = 'outbound_nl_queue_lock';

    if (get_transient($lock_key)) {
        return array(
            'processed' => 0,
            'sent' => 0,
            'failed_or_requeued' => 0,
            'locked' => true,
            'remaining' => 0,
        );
    }

    set_transient($lock_key, gmdate('c'), 120);

    $processed = 0;
    $sent_ok = 0;
    $failed_or_requeued = 0;
    $still_due = 0;

    try {
        $now = gmdate('Y-m-d H:i:s');

        $due_campaigns = $wpdb->get_results($wpdb->prepare(
            "SELECT id FROM {$tables['campaigns']} WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= %s",
            $now
        ));
        if (is_array($due_campaigns)) {
            foreach ($due_campaigns as $dc) {
                outbound_queue_campaign_delivery((int) $dc->id, false);
            }
        }

        $pending = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$tables['notifications']} WHERE status = 'pending' AND scheduled_for <= %s ORDER BY id ASC LIMIT %d",
            $now,
            max(1, $batch_size)
        ));

        $campaign_cache = array();

        if (is_array($pending)) {
            foreach ($pending as $item) {
                // Atomically claim the row so a concurrent worker can never send the same message twice.
                $claimed = $wpdb->query($wpdb->prepare(
                    "UPDATE {$tables['notifications']} SET status = 'processing' WHERE id = %d AND status = 'pending'",
                    (int) $item->id
                ));
                if ((int) $claimed !== 1) {
                    continue;
                }

                $cid = (int) ($item->campaign_id ?? 0);
                if ($cid > 0 && !isset($campaign_cache[$cid])) {
                    $campaign_cache[$cid] = $wpdb->get_row($wpdb->prepare(
                        "SELECT sender_name, sender_email, reply_to_email FROM {$tables['campaigns']} WHERE id = %d LIMIT 1",
                        $cid
                    ));
                }
                $meta = ($cid > 0 && !empty($campaign_cache[$cid])) ? array(
                    'sender_name' => $campaign_cache[$cid]->sender_name,
                    'sender_email' => $campaign_cache[$cid]->sender_email,
                    'reply_to_email' => $campaign_cache[$cid]->reply_to_email,
                ) : array();

                $res = outbound_send_newsletter_email($item->recipient_email, $item->subject, $item->body_html, $meta);
                $attempts = (int) $item->attempts + 1;
                $done_at = gmdate('Y-m-d H:i:s');

                if ($res['ok']) {
                    $wpdb->update(
                        $tables['notifications'],
                        array(
                            'status' => 'sent',
                            'attempts' => $attempts,
                            'sent_at' => $done_at,
                            'last_error' => null,
                        ),
                        array('id' => (int) $item->id)
                    );
                    $sent_ok++;
                } else {
                    $max_attempts = 3;
                    $is_final_failure = ($attempts >= $max_attempts);
                    $backoff_seconds = 300 * $attempts;
                    $next_try = gmdate('Y-m-d H:i:s', time() + $backoff_seconds);

                    $wpdb->update(
                        $tables['notifications'],
                        array(
                            'status' => $is_final_failure ? 'failed' : 'pending',
                            'attempts' => $attempts,
                            'scheduled_for' => $is_final_failure ? $item->scheduled_for : $next_try,
                            'last_error' => substr($res['error'], 0, 500),
                        ),
                        array('id' => (int) $item->id)
                    );
                    $failed_or_requeued++;
                }
                $processed++;
            }
        }

        $sending_campaigns = $wpdb->get_results("SELECT id FROM {$tables['campaigns']} WHERE status = 'sending'");
        if (is_array($sending_campaigns)) {
            $sync_now = gmdate('Y-m-d H:i:s');
            foreach ($sending_campaigns as $sc) {
                $cid = (int) $sc->id;
                $remaining = (int) $wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM {$tables['notifications']} WHERE campaign_id = %d AND status IN ('pending', 'processing')",
                    $cid
                ));
                $sent_cnt = (int) $wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM {$tables['notifications']} WHERE campaign_id = %d AND status = 'sent'",
                    $cid
                ));
                $fail_cnt = (int) $wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM {$tables['notifications']} WHERE campaign_id = %d AND status = 'failed'",
                    $cid
                ));

                $update = array(
                    'sent_count' => $sent_cnt,
                    'failed_count' => $fail_cnt,
                    'updated_at' => $sync_now,
                );
                if ($remaining === 0) {
                    $update['status'] = ($sent_cnt === 0 && $fail_cnt > 0) ? 'failed' : 'completed';
                    $update['completed_at'] = $sync_now;
                }
                $wpdb->update($tables['campaigns'], $update, array('id' => $cid));
            }
        }

        $still_due = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$tables['notifications']} WHERE status = 'pending' AND scheduled_for <= %s",
            gmdate('Y-m-d H:i:s')
        ));
        if ($still_due > 0) {
            outbound_schedule_immediate_queue_run(15);
        }
    } finally {
        delete_transient($lock_key);
    }

    return array(
        'processed' => $processed,
        'sent' => $sent_ok,
        'failed_or_requeued' => $failed_or_requeued,
        'locked' => false,
        'remaining' => $still_due,
    );
}

/**
 * Process due scheduled campaigns and queued newsletter batch items (Cron safe).
 */
function outbound_dispatch_pending_newsletter_batch(int $batch_size = 25): int {
    $res = outbound_dispatch_pending_newsletter_batch_detailed($batch_size);
    return (int) $res['processed'];
}
add_action('outbound_process_due_campaigns', static function (): void {
    outbound_dispatch_pending_newsletter_batch(25);
});
add_action('outbound_run_notification_queue', static function (): void {
    outbound_dispatch_pending_newsletter_batch(25);
});

/**
 * Assemble verified delivery report data for a campaign without fabricating unavailable metrics.
 *
 * @return array<string,mixed>|null
 */
function outbound_get_campaign_report_data(int $campaign_id): ?array {
    global $wpdb;
    $tables = outbound_get_table_names();
    $campaign = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$tables['campaigns']} WHERE id = %d LIMIT 1",
        $campaign_id
    ));
    if (!$campaign) {
        return null;
    }

    $counts_rows = $wpdb->get_results($wpdb->prepare(
        "SELECT status, COUNT(*) AS cnt FROM {$tables['notifications']} WHERE campaign_id = %d GROUP BY status",
        $campaign_id
    ));
    $status_counts = array('pending' => 0, 'processing' => 0, 'sent' => 0, 'failed' => 0);
    foreach ($counts_rows as $cr) {
        $status_counts[$cr->status] = (int) $cr->cnt;
    }
    $total_queued = $status_counts['pending'] + $status_counts['processing'] + $status_counts['sent'] + $status_counts['failed'];

    $unsub_after = 0;
    if (!empty($campaign->started_at)) {
        $unsub_after = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT s.id) FROM {$tables['subscribers']} s
             INNER JOIN {$tables['notifications']} n ON n.subscriber_id = s.id
             WHERE n.campaign_id = %d AND s.status = 'unsubscribed' AND s.unsubscribed_at >= %s",
            $campaign_id,
            $campaign->started_at
        ));
    }

    $logs = $wpdb->get_results($wpdb->prepare(
        "SELECT recipient_email, status, attempts, last_error, sent_at, created_at
         FROM {$tables['notifications']}
         WHERE campaign_id = %d
         ORDER BY FIELD(status, 'failed', 'processing', 'pending', 'sent'), id DESC
         LIMIT 200",
        $campaign_id
    ));

    return array(
        'campaign' => $campaign,
        'recipients_targeted' => (int) $campaign->recipient_count,
        'queued_total' => $total_queued,
        'sent_accepted' => $status_counts['sent'],
        'failed_count' => $status_counts['failed'],
        'pending_count' => $status_counts['pending'] + $status_counts['processing'],
        'unsubscribes_after_send' => $unsub_after,
        'unavailable_metrics' => array(
            'confirmed_delivered' => 'Unavailable with standard SMTP / wp_mail()',
            'bounces' => 'Unavailable with standard SMTP / wp_mail() (no bounce webhook)',
            'opens' => 'Unavailable with standard SMTP / wp_mail() (and open tracking is inherently approximate due to image blocking and privacy proxies)',
            'clicks' => 'Unavailable without a dedicated link-redirect ESP webhook',
        ),
        'logs' => is_array($logs) ? $logs : array(),
    );
}

/**
 * AJAX Live Preview endpoint for Stage 5 (Desktop / Mobile / Plain Text).
 */
function outbound_ajax_newsletter_live_preview(): void {
    if (!current_user_can('edit_posts')) {
        wp_send_json_error('Forbidden', 403);
    }
    check_ajax_referer('outbound_newsletter_action', 'outbound_nl_nonce');

    $template_id = sanitize_key((string) ($_POST['template_id'] ?? 'seasonal-spotlight'));
    $title = sanitize_text_field(wp_unslash((string) ($_POST['title'] ?? 'Outbound Holidays Dispatch')));
    $preheader = sanitize_text_field(wp_unslash((string) ($_POST['preheader'] ?? '')));
    $cta_label = sanitize_text_field(wp_unslash((string) ($_POST['cta_label'] ?? '')));
    $cta_url = esc_url_raw(wp_unslash((string) ($_POST['cta_url'] ?? '')));
    $cta_color = sanitize_text_field(wp_unslash((string) ($_POST['cta_color'] ?? '')));
    $hero_url = esc_url_raw(wp_unslash((string) ($_POST['hero_image_url'] ?? '')));
    $hero_alt = sanitize_text_field(wp_unslash((string) ($_POST['hero_image_alt'] ?? '')));
    $use_raw_html = !empty($_POST['use_raw_html']) && current_user_can('manage_options');
    $blocks_raw = json_decode(wp_unslash((string) ($_POST['blocks_json'] ?? '[]')), true);
    $blocks = is_array($blocks_raw) ? outbound_sanitize_newsletter_blocks($blocks_raw) : array();

    $templates = outbound_get_newsletter_templates();
    $accent = $templates[$template_id]['accent'] ?? '#0B5E8E';

    if ($use_raw_html) {
        $body_html = wp_kses_post(wp_unslash((string) ($_POST['body_html'] ?? '')));
    } else {
        $body_html = outbound_render_newsletter_blocks($blocks, $accent);
    }

    $data = array(
        'title' => $title ?: 'Outbound Holidays Dispatch',
        'preheader' => $preheader,
        'bodyHtml' => $body_html,
        'blocks' => $use_raw_html ? array() : $blocks,
        'ctaLabel' => $cta_label,
        'ctaUrl' => $cta_url,
        'ctaColor' => $cta_color,
        'heroImageUrl' => $hero_url,
        'heroImageAlt' => $hero_alt ?: $title,
        'unsubscribeUrl' => home_url('/newsletter/confirmed/?action=unsubscribe&token=preview'),
        'siteUrl' => home_url('/'),
    );

    wp_send_json_success(array(
        'html' => outbound_render_newsletter_template($template_id, $data),
        'text' => outbound_render_newsletter_plain_text($data),
    ));
}
add_action('wp_ajax_outbound_newsletter_live_preview', 'outbound_ajax_newsletter_live_preview');

/**
 * Register Newsletter admin menu under Outbound CMS.
 */
function outbound_register_newsletter_admin_menu(): void {
    add_submenu_page(
        'outbound-setup-health',
        'Newsletter & Campaigns',
        'Newsletter',
        'edit_posts',
        'outbound-newsletter',
        'outbound_render_newsletter_admin_page'
    );
}
add_action('admin_menu', 'outbound_register_newsletter_admin_menu', 25);

/**
 * Handle CSV / JSON export requests cleanly before output starts.
 */
function outbound_handle_newsletter_export(): void {
    if (!is_admin() || ($_GET['page'] ?? '') !== 'outbound-newsletter' || empty($_GET['export'])) {
        return;
    }
    if (!current_user_can('edit_posts')) {
        return;
    }
    check_admin_referer('outbound_export_subs');

    global $wpdb;
    $tables = outbound_get_table_names();
    $fmt = sanitize_key((string) $_GET['export']);

    if ($fmt === 'campaign_report' && !empty($_GET['campaign_id'])) {
        $report = outbound_get_campaign_report_data((int) $_GET['campaign_id']);
        if (!$report) {
            wp_die('Campaign not found.');
        }
        $c = $report['campaign'];
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=outbound-campaign-' . (int) $c->id . '-report-' . gmdate('Ymd') . '.csv');
        $out = fopen('php://output', 'w');
        fputcsv($out, array('Campaign ID', 'Title', 'Subject', 'Status', 'Targeted', 'Queued', 'Sent/Accepted', 'Failed', 'Pending', 'Unsubscribed After Send'));
        fputcsv($out, array(
            $c->id, $c->title, $c->subject, $c->status,
            $report['recipients_targeted'], $report['queued_total'], $report['sent_accepted'],
            $report['failed_count'], $report['pending_count'], $report['unsubscribes_after_send'],
        ));
        fputcsv($out, array());
        fputcsv($out, array('Recipient Email', 'Delivery Status', 'Attempts', 'Sent At (UTC)', 'Error'));
        foreach ($report['logs'] as $log) {
            fputcsv($out, array($log->recipient_email, $log->status, $log->attempts, $log->sent_at, $log->last_error));
        }
        fclose($out);
        exit;
    }

    $rows = $wpdb->get_results("SELECT email, name, source, status, consent_version, consented_at, confirmed_at, unsubscribed_at FROM {$tables['subscribers']} ORDER BY id DESC");

    if ($fmt === 'json') {
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename=outbound-subscribers-' . gmdate('Ymd') . '.json');
        echo wp_json_encode($rows, JSON_PRETTY_PRINT);
        exit;
    }

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=outbound-subscribers-' . gmdate('Ymd') . '.csv');
    $out = fopen('php://output', 'w');
    fputcsv($out, array('email', 'name', 'source', 'status', 'consent_version', 'consented_at', 'confirmed_at', 'unsubscribed_at'));
    foreach ($rows as $row) {
        fputcsv($out, array($row->email, $row->name, $row->source, $row->status, $row->consent_version, $row->consented_at, $row->confirmed_at, $row->unsubscribed_at));
    }
    fclose($out);
    exit;
}
add_action('admin_init', 'outbound_handle_newsletter_export');

/**
 * Render the complete Outbound CMS → Newsletter & Campaign Management console.
 */
function outbound_render_newsletter_admin_page(): void {
    global $wpdb;
    $tables = outbound_get_table_names();
    $notice = '';
    $notice_type = 'success';

    $smtp = get_option('outbound_smtp_options', array());
    $mail_from = function_exists('outbound_get_mail_from_config') ? outbound_get_mail_from_config() : array('email' => get_option('admin_email'), 'name' => 'Outbound Holidays');
    $templates = outbound_get_newsletter_templates();
    $segments = outbound_get_newsletter_audience_segments();
    $snippets = outbound_get_newsletter_snippets();

    $active_tab = sanitize_key((string) ($_GET['tab'] ?? 'dashboard'));
    $edit_id = abs((int) ($_GET['campaign_id'] ?? 0));

    // Handle POST actions.
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['outbound_nl_action'])) {
        check_admin_referer('outbound_newsletter_action', 'outbound_nl_nonce');
        $act = sanitize_key((string) $_POST['outbound_nl_action']);

        if ($act === 'save_campaign') {
            $editing_id = abs((int) ($_POST['editing_campaign_id'] ?? 0));
            $existing_campaign = $editing_id > 0 ? $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tables['campaigns']} WHERE id = %d LIMIT 1", $editing_id)) : null;

            if ($existing_campaign && !in_array($existing_campaign->status, array('draft', 'scheduled'), true)) {
                $notice = 'Sent or completed campaigns are locked to preserve audit history. Duplicate the campaign to create a new draft.';
                $notice_type = 'error';
            } else {
                $title = sanitize_text_field(wp_unslash((string) ($_POST['title'] ?? '')));
                $subject = sanitize_text_field(wp_unslash((string) ($_POST['subject'] ?? '')));
                $preheader = sanitize_text_field(wp_unslash((string) ($_POST['preheader'] ?? '')));
                $template_id = sanitize_key((string) ($_POST['template_id'] ?? 'seasonal-spotlight'));
                if (!isset($templates[$template_id])) {
                    $template_id = 'seasonal-spotlight';
                }
                $audience_segment = sanitize_key((string) ($_POST['audience_segment'] ?? 'all_confirmed'));
                if (!isset($segments[$audience_segment])) {
                    $audience_segment = 'all_confirmed';
                }
                $sender_name = sanitize_text_field(wp_unslash((string) ($_POST['sender_name'] ?? $mail_from['name'])));
                $sender_email = sanitize_email(wp_unslash((string) ($_POST['sender_email'] ?? $mail_from['email'])));
                $reply_to_email = sanitize_email(wp_unslash((string) ($_POST['reply_to_email'] ?? $sender_email)));
                $cta_label = sanitize_text_field(wp_unslash((string) ($_POST['cta_label'] ?? '')));
                $cta_url = esc_url_raw(wp_unslash((string) ($_POST['cta_url'] ?? '')));
                $hero_id = abs((int) ($_POST['hero_image_id'] ?? 0));
                $hero_url = esc_url_raw(wp_unslash((string) ($_POST['hero_image_url'] ?? '')));
                $hero_alt = sanitize_text_field(wp_unslash((string) ($_POST['hero_image_alt'] ?? '')));

                $use_raw_html = !empty($_POST['use_raw_html']) && current_user_can('manage_options');
                $blocks_raw = json_decode(wp_unslash((string) ($_POST['blocks_json'] ?? '[]')), true);
                $blocks = is_array($blocks_raw) ? outbound_sanitize_newsletter_blocks($blocks_raw) : array();
                $accent = $templates[$template_id]['accent'];

                if ($use_raw_html) {
                    $body_html = wp_kses_post(wp_unslash((string) ($_POST['body_html'] ?? '')));
                    $blocks_json = wp_json_encode($blocks);
                } else {
                    $body_html = outbound_render_newsletter_blocks($blocks, $accent);
                    if ($body_html === '' && !empty($_POST['body_html'])) {
                        $body_html = wp_kses_post(wp_unslash((string) ($_POST['body_html'])));
                    }
                    $blocks_json = wp_json_encode($blocks);
                }

                $plain_text = outbound_render_newsletter_plain_text(array(
                    'title' => $title,
                    'preheader' => $preheader,
                    'bodyHtml' => $body_html,
                    'blocks' => $use_raw_html ? array() : $blocks,
                    'ctaLabel' => $cta_label,
                    'ctaUrl' => $cta_url,
                ));

                $submit_mode = sanitize_key((string) ($_POST['submit_mode'] ?? 'draft'));
                $scheduled_harare = sanitize_text_field((string) ($_POST['scheduled_at_harare'] ?? ''));
                $scheduled_utc = $scheduled_harare !== '' ? outbound_harare_local_to_utc($scheduled_harare) : null;
                $status = ($submit_mode === 'schedule' && $scheduled_utc !== null) ? 'scheduled' : 'draft';
                $now = gmdate('Y-m-d H:i:s');

                if ($title === '' || $subject === '') {
                    $notice = 'Please enter both an Internal Title and an Email Subject.';
                    $notice_type = 'error';
                } elseif ($submit_mode === 'schedule' && $scheduled_utc === null) {
                    $notice = 'Please choose a valid schedule date & time in Africa/Harare (CAT) before scheduling.';
                    $notice_type = 'error';
                } else {
                    $payload = array(
                        'title' => $title,
                        'subject' => $subject,
                        'preheader' => $preheader,
                        'template_id' => $template_id,
                        'audience_segment' => $audience_segment,
                        'sender_name' => $sender_name,
                        'sender_email' => $sender_email,
                        'reply_to_email' => $reply_to_email,
                        'body_html' => $body_html,
                        'body_text' => $plain_text,
                        'blocks_json' => $blocks_json,
                        'cta_label' => $cta_label,
                        'cta_url' => $cta_url,
                        'hero_image_id' => $hero_id ?: null,
                        'hero_image_url' => $hero_url,
                        'hero_image_alt' => $hero_alt,
                        'status' => $submit_mode === 'send_now' ? 'draft' : $status,
                        'scheduled_at' => $status === 'scheduled' ? $scheduled_utc : null,
                        'updated_at' => $now,
                    );

                    if ($existing_campaign) {
                        $wpdb->update($tables['campaigns'], $payload, array('id' => $editing_id));
                        $cid = $editing_id;
                    } else {
                        $payload['created_by'] = get_current_user_id();
                        $payload['created_at'] = $now;
                        $wpdb->insert($tables['campaigns'], $payload);
                        $cid = (int) $wpdb->insert_id;
                    }
                    $edit_id = $cid;

                    if ($submit_mode === 'send_now') {
                        $q = outbound_queue_campaign_delivery($cid);
                        if ($q['ok']) {
                            $d = is_array($q['dispatch'] ?? null) ? $q['dispatch'] : array();
                            if (!empty($d['locked'])) {
                                $notice = 'Campaign queued for ' . (int) $q['queued'] . ' confirmed subscriber(s). Background worker is already running and will dispatch shortly.';
                            } elseif ((int) ($d['remaining'] ?? 0) === 0) {
                                $notice = sprintf(
                                    'Campaign processed immediately for %d subscriber(s): %d SMTP accepted, %d failed/scheduled for retry.',
                                    (int) $q['queued'],
                                    (int) ($d['sent'] ?? 0),
                                    (int) ($d['failed_or_requeued'] ?? 0)
                                );
                                if ((int) ($d['failed_or_requeued'] ?? 0) > 0 && (int) ($d['sent'] ?? 0) === 0) {
                                    $notice_type = 'error';
                                }
                            } else {
                                $notice = sprintf(
                                    'Campaign queued for %d subscriber(s): %d sent immediately, %d remaining in background queue.',
                                    (int) $q['queued'],
                                    (int) ($d['sent'] ?? 0),
                                    (int) ($d['remaining'] ?? 0)
                                );
                            }
                            $active_tab = 'report';
                        } else {
                            $notice = $q['error'] ?? 'Could not queue campaign.';
                            $notice_type = 'error';
                        }
                    } elseif ($status === 'scheduled') {
                        $notice = 'Campaign scheduled for ' . outbound_utc_to_harare_label($scheduled_utc) . '.';
                        $active_tab = 'campaigns';
                    } else {
                        $notice = 'Campaign draft saved.';
                    }
                }
            }
        } elseif ($act === 'send_test') {
            $test_email = sanitize_email((string) ($_POST['test_email'] ?? ''));
            $template_id = sanitize_key((string) ($_POST['template_id'] ?? 'seasonal-spotlight'));
            $title = sanitize_text_field(wp_unslash((string) ($_POST['title'] ?? 'Outbound Holidays Preview')));
            $subject = sanitize_text_field(wp_unslash((string) ($_POST['subject'] ?? 'Outbound Holidays Test Email')));
            $preheader = sanitize_text_field(wp_unslash((string) ($_POST['preheader'] ?? '')));
            $cta_label = sanitize_text_field(wp_unslash((string) ($_POST['cta_label'] ?? '')));
            $cta_url = esc_url_raw(wp_unslash((string) ($_POST['cta_url'] ?? '')));
            $hero_url = esc_url_raw(wp_unslash((string) ($_POST['hero_image_url'] ?? '')));
            $hero_alt = sanitize_text_field(wp_unslash((string) ($_POST['hero_image_alt'] ?? '')));
            $sender_name = sanitize_text_field(wp_unslash((string) ($_POST['sender_name'] ?? $mail_from['name'])));
            $sender_email = sanitize_email(wp_unslash((string) ($_POST['sender_email'] ?? $mail_from['email'])));
            $reply_to_email = sanitize_email(wp_unslash((string) ($_POST['reply_to_email'] ?? $sender_email)));
            $use_raw_html = !empty($_POST['use_raw_html']) && current_user_can('manage_options');
            $blocks_raw = json_decode(wp_unslash((string) ($_POST['blocks_json'] ?? '[]')), true);
            $blocks = is_array($blocks_raw) ? outbound_sanitize_newsletter_blocks($blocks_raw) : array();
            $accent = $templates[$template_id]['accent'] ?? '#0B5E8E';
            $body_html = $use_raw_html
                ? wp_kses_post(wp_unslash((string) ($_POST['body_html'] ?? '')))
                : outbound_render_newsletter_blocks($blocks, $accent);

            if (!is_email($test_email)) {
                $notice = 'Please enter a valid recipient email address for the test email.';
                $notice_type = 'error';
            } else {
                $html = outbound_render_newsletter_template($template_id, array(
                    'title' => $title ?: 'Outbound Holidays Test',
                    'preheader' => $preheader,
                    'bodyHtml' => $body_html,
                    'blocks' => $use_raw_html ? array() : $blocks,
                    'ctaLabel' => $cta_label,
                    'ctaUrl' => $cta_url,
                    'heroImageUrl' => $hero_url,
                    'heroImageAlt' => $hero_alt ?: $title,
                    'unsubscribeUrl' => home_url('/newsletter/confirmed/?action=unsubscribe&token=test'),
                    'siteUrl' => home_url('/'),
                ));
                $res = outbound_send_newsletter_email($test_email, '[TEST] ' . $subject, $html, array(
                    'sender_name' => $sender_name,
                    'sender_email' => $sender_email,
                    'reply_to_email' => $reply_to_email,
                ));
                if ($res['ok']) {
                    $notice = 'Test email dispatched to ' . $test_email . '.';
                } else {
                    $notice = 'Test email failed: ' . $res['error'];
                    $notice_type = 'error';
                }
            }
        } elseif ($act === 'duplicate_campaign' && !empty($_POST['campaign_id'])) {
            $new_id = outbound_duplicate_newsletter_campaign((int) $_POST['campaign_id']);
            if ($new_id) {
                $notice = 'Campaign duplicated as a fresh draft.';
                $active_tab = 'composer';
                $edit_id = $new_id;
            } else {
                $notice = 'Could not duplicate campaign.';
                $notice_type = 'error';
            }
        } elseif ($act === 'cancel_schedule' && !empty($_POST['campaign_id'])) {
            if (outbound_cancel_scheduled_campaign((int) $_POST['campaign_id'])) {
                $notice = 'Scheduled dispatch cancelled. Campaign returned to Draft.';
            } else {
                $notice = 'Only scheduled campaigns can be cancelled.';
                $notice_type = 'error';
            }
            $active_tab = 'campaigns';
        } elseif ($act === 'archive_campaign' && !empty($_POST['campaign_id'])) {
            if (outbound_archive_newsletter_campaign((int) $_POST['campaign_id'])) {
                $notice = 'Campaign archived.';
            } else {
                $notice = 'Active sending campaigns cannot be archived.';
                $notice_type = 'error';
            }
            $active_tab = 'campaigns';
        } elseif ($act === 'queue_campaign' && !empty($_POST['campaign_id'])) {
            $q = outbound_queue_campaign_delivery((int) $_POST['campaign_id']);
            if ($q['ok']) {
                $d = is_array($q['dispatch'] ?? null) ? $q['dispatch'] : array();
                if (!empty($d['locked'])) {
                    $notice = 'Campaign queued for ' . (int) $q['queued'] . ' confirmed subscriber(s). Background worker is already running and will dispatch shortly.';
                } elseif ((int) ($d['remaining'] ?? 0) === 0) {
                    $notice = sprintf(
                        'Campaign processed immediately for %d subscriber(s): %d SMTP accepted, %d failed/scheduled for retry.',
                        (int) $q['queued'],
                        (int) ($d['sent'] ?? 0),
                        (int) ($d['failed_or_requeued'] ?? 0)
                    );
                    if ((int) ($d['failed_or_requeued'] ?? 0) > 0 && (int) ($d['sent'] ?? 0) === 0) {
                        $notice_type = 'error';
                    }
                } else {
                    $notice = sprintf(
                        'Campaign queued for %d subscriber(s): %d sent immediately, %d remaining in background queue.',
                        (int) $q['queued'],
                        (int) ($d['sent'] ?? 0),
                        (int) ($d['remaining'] ?? 0)
                    );
                }
            } else {
                $notice = $q['error'] ?? 'Could not queue campaign.';
                $notice_type = 'error';
            }
            $active_tab = 'campaigns';
        } elseif ($act === 'run_batch_now') {
            if (!current_user_can('manage_options')) {
                $notice = 'Only administrators may manually process the email queue.';
                $notice_type = 'error';
            } else {
                $res = outbound_dispatch_pending_newsletter_batch_detailed(25);
                if (!empty($res['locked'])) {
                    $notice = 'Queue worker is already running in another process. Refresh in a few seconds.';
                    $notice_type = 'error';
                } else {
                    $notice = sprintf(
                        'Processed %d queue item(s): %d SMTP accepted, %d failed/scheduled for retry, %d still due.',
                        (int) $res['processed'],
                        (int) $res['sent'],
                        (int) $res['failed_or_requeued'],
                        (int) $res['remaining']
                    );
                    if ((int) $res['failed_or_requeued'] > 0 && (int) $res['sent'] === 0) {
                        $notice_type = 'error';
                    }
                }
            }
            if (!empty($_POST['return_tab'])) {
                $active_tab = sanitize_key((string) $_POST['return_tab']);
            }
        } elseif ($act === 'import_csv') {
            $csv = wp_unslash((string) ($_POST['csv_data'] ?? ''));
            if (!empty($_FILES['csv_file']['tmp_name']) && is_uploaded_file($_FILES['csv_file']['tmp_name'])) {
                $csv = (string) file_get_contents($_FILES['csv_file']['tmp_name']);
            }
            $res = outbound_import_newsletter_subscribers_csv($csv, 'csv-import');
            $notice = sprintf(
                'CSV Import complete: %d imported, %d already subscribed, %d suppressed/unsubscribed preserved, %d invalid skipped.',
                $res['imported'],
                $res['skipped_existing'],
                $res['skipped_suppressed'],
                $res['invalid']
            );
            $active_tab = 'subscribers';
        } elseif ($act === 'update_subscriber_status' && !empty($_POST['subscriber_id'])) {
            $sid = (int) $_POST['subscriber_id'];
            $new_status = sanitize_key((string) ($_POST['new_status'] ?? ''));
            if (in_array($new_status, array('confirmed', 'unsubscribed', 'suppressed'), true)) {
                $upd = array('status' => $new_status, 'updated_at' => gmdate('Y-m-d H:i:s'));
                if ($new_status === 'unsubscribed') {
                    $upd['unsubscribed_at'] = gmdate('Y-m-d H:i:s');
                }
                if ($new_status === 'confirmed') {
                    $upd['confirmed_at'] = gmdate('Y-m-d H:i:s');
                }
                $wpdb->update($tables['subscribers'], $upd, array('id' => $sid));
                $notice = 'Subscriber status updated to ' . $new_status . '.';
            }
            $active_tab = 'subscribers';
        }
    }

    // Aggregate dashboard stats.
    $total_subs = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['subscribers']}");
    $confirmed_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['subscribers']} WHERE status = 'confirmed'");
    $pending_sub_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['subscribers']} WHERE status = 'pending'");
    $unsub_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['subscribers']} WHERE status = 'unsubscribed'");
    $suppressed_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['subscribers']} WHERE status = 'suppressed'");

    $draft_campaigns = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['campaigns']} WHERE status = 'draft'");
    $scheduled_campaigns = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['campaigns']} WHERE status = 'scheduled'");
    $sent_campaigns = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['campaigns']} WHERE status = 'completed'");
    $failed_campaigns = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['campaigns']} WHERE status = 'failed'");
    $total_campaigns = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['campaigns']} WHERE status != 'archived'");
    $pending_queue = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['notifications']} WHERE status = 'pending'");

    $live_enabled = !empty($smtp['live_send_enabled']);
    $base_url = admin_url('admin.php?page=outbound-newsletter');
    ?>
    <div class="wrap outbound-admin-wrap">
        <div class="outbound-card-toolbar" style="margin-bottom:14px;">
            <div>
                <h1 style="margin:0 0 4px;">Outbound Holidays — Email Marketing &amp; Campaigns</h1>
                <p class="description" style="margin:0;">Create branded Victoria Falls newsletters, manage confirmed audiences, schedule in CAT (Africa/Harare), and monitor queue delivery.</p>
            </div>
            <div class="outbound-header-actions">
                <a href="<?php echo esc_url($base_url . '&tab=composer'); ?>" class="button button-primary">+ Create Campaign</a>
                <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-setup-health')); ?>" class="button button-secondary">SMTP &amp; Email Health</a>
            </div>
        </div>

        <?php if ($notice !== ''): ?>
            <div class="notice notice-<?php echo $notice_type === 'error' ? 'error' : 'success'; ?> is-dismissible"><p><?php echo esc_html($notice); ?></p></div>
        <?php endif; ?>

        <?php if (!$live_enabled): ?>
            <div class="notice notice-warning"><p><strong>Live Sending Safety Gate is Paused:</strong> You can compose, preview, schedule, and send test emails now. To send live campaigns, enable <em>Live Newsletter Campaigns</em> under <a href="<?php echo esc_url(admin_url('admin.php?page=outbound-setup-health')); ?>">Outbound CMS → Setup &amp; Email Health</a>.</p></div>
        <?php endif; ?>

        <h2 class="nav-tab-wrapper" style="margin-bottom:18px;">
            <a href="<?php echo esc_url($base_url . '&tab=dashboard'); ?>" class="nav-tab <?php echo $active_tab === 'dashboard' ? 'nav-tab-active' : ''; ?>">Dashboard</a>
            <a href="<?php echo esc_url($base_url . '&tab=campaigns'); ?>" class="nav-tab <?php echo $active_tab === 'campaigns' ? 'nav-tab-active' : ''; ?>">Campaigns (<?php echo $total_campaigns; ?>)</a>
            <a href="<?php echo esc_url($base_url . '&tab=composer'); ?>" class="nav-tab <?php echo $active_tab === 'composer' ? 'nav-tab-active' : ''; ?>"><?php echo $edit_id > 0 ? 'Edit Campaign' : 'Create Campaign'; ?></a>
            <a href="<?php echo esc_url($base_url . '&tab=subscribers'); ?>" class="nav-tab <?php echo $active_tab === 'subscribers' ? 'nav-tab-active' : ''; ?>">Subscribers (<?php echo $total_subs; ?>)</a>
            <a href="<?php echo esc_url($base_url . '&tab=templates'); ?>" class="nav-tab <?php echo $active_tab === 'templates' ? 'nav-tab-active' : ''; ?>">Templates</a>
            <a href="<?php echo esc_url($base_url . '&tab=logs'); ?>" class="nav-tab <?php echo $active_tab === 'logs' ? 'nav-tab-active' : ''; ?>">Queue &amp; Logs<?php echo $pending_queue ? ' (' . $pending_queue . ')' : ''; ?></a>
            <?php if ($active_tab === 'report' && $edit_id > 0): ?>
                <a href="<?php echo esc_url($base_url . '&tab=report&campaign_id=' . $edit_id); ?>" class="nav-tab nav-tab-active">Campaign Report</a>
            <?php endif; ?>
        </h2>

        <?php if ($active_tab === 'dashboard'):
            $recent = $wpdb->get_results("SELECT * FROM {$tables['campaigns']} WHERE status != 'archived' ORDER BY id DESC LIMIT 6");
        ?>
            <div class="outbound-nl-kpi-grid">
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Total Subscribers</div><div class="outbound-nl-kpi-val"><?php echo $total_subs; ?></div></div>
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Active Confirmed</div><div class="outbound-nl-kpi-val" style="color:#166534;"><?php echo $confirmed_count; ?></div></div>
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Draft Campaigns</div><div class="outbound-nl-kpi-val"><?php echo $draft_campaigns; ?></div></div>
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Scheduled</div><div class="outbound-nl-kpi-val" style="color:#1E40AF;"><?php echo $scheduled_campaigns; ?></div></div>
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Sent Campaigns</div><div class="outbound-nl-kpi-val" style="color:#0B5E8E;"><?php echo $sent_campaigns; ?></div></div>
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Failed Campaigns</div><div class="outbound-nl-kpi-val" style="color:#991B1B;"><?php echo $failed_campaigns; ?></div></div>
            </div>

            <div class="outbound-nl-stage-card">
                <div class="outbound-card-toolbar" style="margin-bottom:10px;">
                    <h2 style="margin:0;">Latest Campaign Activity</h2>
                    <div class="outbound-header-actions">
                        <?php if ($pending_queue > 0 && current_user_can('manage_options')): ?>
                            <form method="post" style="display:inline;">
                                <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                                <input type="hidden" name="outbound_nl_action" value="run_batch_now" />
                                <input type="hidden" name="return_tab" value="dashboard" />
                                <button type="submit" class="button button-secondary">Process Queue Now (<?php echo $pending_queue; ?>)</button>
                            </form>
                        <?php endif; ?>
                        <a href="<?php echo esc_url($base_url . '&tab=campaigns'); ?>" class="button button-secondary">View All Campaigns</a>
                    </div>
                </div>
                <table class="widefat striped">
                    <thead><tr><th>Campaign</th><th>Subject</th><th>Audience</th><th>Status</th><th>Scheduled (CAT)</th><th>Sent / Target</th><th>Actions</th></tr></thead>
                    <tbody>
                        <?php if (empty($recent)): ?>
                            <tr><td colspan="7">No campaigns created yet. Click <strong>+ Create Campaign</strong> to build your first branded newsletter.</td></tr>
                        <?php else: foreach ($recent as $c):
                            $aud_label = $segments[$c->audience_segment ?? 'all_confirmed']['label'] ?? 'All Confirmed';
                        ?>
                            <tr>
                                <td><strong><?php echo esc_html($c->title); ?></strong></td>
                                <td><?php echo esc_html($c->subject); ?></td>
                                <td><?php echo esc_html($aud_label); ?></td>
                                <td><span class="outbound-nl-badge outbound-nl-badge--<?php echo esc_attr($c->status); ?>"><?php echo esc_html($c->status); ?></span></td>
                                <td><?php echo esc_html(outbound_utc_to_harare_label($c->scheduled_at)); ?></td>
                                <td><?php echo (int) $c->sent_count; ?> / <?php echo (int) $c->recipient_count; ?><?php echo $c->failed_count ? ' (' . (int) $c->failed_count . ' failed)' : ''; ?></td>
                                <td>
                                    <?php if (in_array($c->status, array('draft', 'scheduled'), true)): ?>
                                        <a href="<?php echo esc_url($base_url . '&tab=composer&campaign_id=' . (int) $c->id); ?>" class="button button-small">Edit</a>
                                    <?php else: ?>
                                        <a href="<?php echo esc_url($base_url . '&tab=report&campaign_id=' . (int) $c->id); ?>" class="button button-small">Report</a>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; endif; ?>
                    </tbody>
                </table>
                <p class="description" style="margin-top:10px;">
                    <strong>Delivery Tracking Note:</strong> Standard SMTP / <code>wp_mail()</code> records queued, SMTP-accepted, failed, and post-campaign unsubscribed counts accurately. Open rate, click-through rate, and external bounce webhooks are unavailable with standard SMTP.
                </p>
            </div>

        <?php elseif ($active_tab === 'composer'):
            $editing = $edit_id > 0 ? $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tables['campaigns']} WHERE id = %d LIMIT 1", $edit_id)) : null;
            $preselected_tpl = sanitize_key((string) ($_GET['template'] ?? ''));
            $f_title = $editing ? (string) $editing->title : '';
            $f_subject = $editing ? (string) $editing->subject : '';
            $f_preheader = $editing ? (string) $editing->preheader : '';
            $f_tpl = $editing ? (string) $editing->template_id : (isset($templates[$preselected_tpl]) ? $preselected_tpl : 'seasonal-spotlight');
            $f_audience = $editing && !empty($editing->audience_segment) ? (string) $editing->audience_segment : 'all_confirmed';
            $f_sender_name = $editing && !empty($editing->sender_name) ? (string) $editing->sender_name : (string) $mail_from['name'];
            $f_sender_email = $editing && !empty($editing->sender_email) ? (string) $editing->sender_email : (string) $mail_from['email'];
            $f_reply_to = $editing && !empty($editing->reply_to_email) ? (string) $editing->reply_to_email : $f_sender_email;
            $f_hero_id = $editing ? (int) ($editing->hero_image_id ?? 0) : 0;
            $f_hero_url = $editing ? (string) ($editing->hero_image_url ?? '') : '';
            $f_hero_alt = $editing ? (string) ($editing->hero_image_alt ?? '') : '';
            $f_cta_label = $editing ? (string) ($editing->cta_label ?? 'Explore Victoria Falls') : 'Explore Victoria Falls';
            $f_cta_url = $editing ? (string) ($editing->cta_url ?? home_url('/')) : home_url('/');
            $f_sched_cat = $editing ? outbound_utc_to_harare_input($editing->scheduled_at) : '';
            $f_blocks_json = $editing && !empty($editing->blocks_json) ? (string) $editing->blocks_json : wp_json_encode(array(
                array('type' => 'paragraph', 'text' => 'Write your Victoria Falls seasonal dispatch here. Use **bold**, *italic*, or [link text](https://outboundholiday.com/).'),
            ));
            $f_body_html = $editing ? (string) $editing->body_html : '';
            $is_locked = $editing && !in_array($editing->status, array('draft', 'scheduled'), true);
            $selected_audience_count = outbound_count_audience_subscribers($f_audience);
            $selected_audience_label = $segments[$f_audience]['label'] ?? 'All Confirmed Subscribers';
        ?>
            <?php if ($is_locked): ?>
                <div class="notice notice-info"><p>This campaign has status <strong><?php echo esc_html($editing->status); ?></strong> and cannot be edited. <a href="<?php echo esc_url($base_url . '&tab=report&campaign_id=' . (int) $editing->id); ?>">View Campaign Report</a> or duplicate it from the Campaigns tab.</p></div>
            <?php endif; ?>

            <form method="post" id="outbound-nl-composer-form" data-preview-url="<?php echo esc_url(admin_url('admin-ajax.php')); ?>">
                <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                <input type="hidden" name="editing_campaign_id" value="<?php echo $editing ? (int) $editing->id : 0; ?>" />
                <input type="hidden" id="outbound-nl-blocks-json" name="blocks_json" value="<?php echo esc_attr($f_blocks_json); ?>" />

                <!-- Stage 1: Campaign Details -->
                <div class="outbound-nl-stage-card">
                    <div class="outbound-nl-stage-head"><span class="outbound-nl-stage-num">1</span><h2>Campaign Details &amp; Inbox Preview</h2></div>
                    <div class="outbound-nl-cols-grid">
                        <div>
                            <p><label><strong>Internal Campaign Title</strong><br/>
                            <input type="text" name="title" value="<?php echo esc_attr($f_title); ?>" class="large-text" placeholder="e.g. Victoria Falls High Water Season 2026" required /></label></p>

                            <p><label><strong>Email Subject Line</strong> <span id="outbound-nl-subject-count" class="description"></span><br/>
                            <input type="text" id="outbound-nl-subject" name="subject" value="<?php echo esc_attr($f_subject); ?>" class="large-text" placeholder="e.g. Experience the Thunder of Victoria Falls This Season" required /></label></p>

                            <p><label><strong>Preheader Summary</strong> <span id="outbound-nl-preheader-count" class="description"></span><br/>
                            <input type="text" id="outbound-nl-preheader" name="preheader" value="<?php echo esc_attr($f_preheader); ?>" class="large-text" placeholder="Short preview snippet shown next to subject in Gmail/Outlook" /></label></p>

                            <div class="outbound-nl-cols-grid">
                                <p><label><strong>Sender Name</strong><br/>
                                <input type="text" id="outbound-nl-sender-name" name="sender_name" value="<?php echo esc_attr($f_sender_name); ?>" class="regular-text" style="width:100%;" /></label></p>
                                <p><label><strong>Sender Email</strong><br/>
                                <input type="email" name="sender_email" value="<?php echo esc_attr($f_sender_email); ?>" class="regular-text" style="width:100%;" /></label></p>
                            </div>
                            <p><label><strong>Reply-To Email</strong><br/>
                            <input type="email" name="reply_to_email" value="<?php echo esc_attr($f_reply_to); ?>" class="regular-text" style="width:100%;" /></label></p>
                        </div>
                        <div>
                            <p style="margin-top:0;"><strong>Live Inbox Preview</strong></p>
                            <div class="outbound-nl-inbox-preview">
                                <div class="outbound-nl-inbox-sender" id="outbound-inbox-sender"><?php echo esc_html($f_sender_name); ?></div>
                                <div class="outbound-nl-inbox-subject" id="outbound-inbox-subject"><?php echo esc_html($f_subject ?: '(No subject yet)'); ?></div>
                                <div class="outbound-nl-inbox-preheader" id="outbound-inbox-preheader"><?php echo esc_html($f_preheader ?: 'Optional inbox preview summary...'); ?></div>
                            </div>
                            <p class="description" style="margin-top:10px;">Keep subject lines concise (&le; 60 chars) so mobile clients do not truncate key Victoria Falls offers.</p>
                        </div>
                    </div>
                </div>

                <!-- Stage 2: Audience Selection -->
                <div class="outbound-nl-stage-card">
                    <div class="outbound-nl-stage-head"><span class="outbound-nl-stage-num">2</span><h2>Select Audience</h2></div>
                    <div class="outbound-nl-cards-grid">
                        <?php foreach ($segments as $seg_id => $seg):
                            $cnt = outbound_count_audience_subscribers($seg_id);
                            $checked = ($f_audience === $seg_id);
                        ?>
                            <label class="outbound-nl-audience-card <?php echo $checked ? 'is-selected' : ''; ?>">
                                <input type="radio" name="audience_segment" value="<?php echo esc_attr($seg_id); ?>" data-label="<?php echo esc_attr($seg['label']); ?>" data-count="<?php echo $cnt; ?>" <?php checked($checked); ?> />
                                <strong><?php echo esc_html($seg['label']); ?></strong>
                                <div style="font-size:18px;font-weight:700;color:#0B5E8E;margin:4px 0;"><?php echo $cnt; ?> confirmed</div>
                                <span class="description"><?php echo esc_html($seg['description']); ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                    <p class="description" style="margin-top:10px;">Only subscribers with <code>confirmed</code> status are included. Unsubscribed, pending, and suppressed contacts are automatically excluded.</p>
                </div>

                <!-- Stage 3: Template Selection -->
                <div class="outbound-nl-stage-card">
                    <div class="outbound-nl-stage-head"><span class="outbound-nl-stage-num">3</span><h2>Choose Branded Email Template</h2></div>
                    <div class="outbound-nl-cards-grid">
                        <?php foreach ($templates as $tid => $tpl):
                            $checked = ($f_tpl === $tid);
                        ?>
                            <label class="outbound-nl-template-card <?php echo $checked ? 'is-selected' : ''; ?>">
                                <div class="outbound-nl-tpl-swatch" style="background:<?php echo esc_attr($tpl['accent']); ?>;"></div>
                                <input type="radio" name="template_id" value="<?php echo esc_attr($tid); ?>" <?php checked($checked); ?> />
                                <strong><?php echo esc_html($tpl['label']); ?></strong>
                                <div class="description" style="margin-top:4px;"><?php echo esc_html($tpl['description']); ?></div>
                            </label>
                        <?php endforeach; ?>
                    </div>
                    <p class="description" style="margin-top:10px;">Switching templates preserves all your hero image, content blocks, and call-to-action settings.</p>
                </div>

                <!-- Stage 4: Visual Content & Hero Image -->
                <div class="outbound-nl-stage-card">
                    <div class="outbound-nl-stage-head"><span class="outbound-nl-stage-num">4</span><h2>Visual Email Content &amp; Hero Image</h2></div>

                    <div style="margin-bottom:18px;padding:14px;background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;">
                        <strong>Hero Image (Gallery / Upload)</strong>
                        <div class="outbound-nl-cols-grid" style="margin-top:8px;">
                            <div>
                                <input type="hidden" id="outbound-nl-hero-id" name="hero_image_id" value="<?php echo $f_hero_id; ?>" />
                                <input type="hidden" id="outbound-nl-hero-url" name="hero_image_url" value="<?php echo esc_attr($f_hero_url); ?>" />
                                <p style="margin:0 0 8px;">
                                    <button type="button" class="button button-primary outbound-nl-pick-media" data-target-url="#outbound-nl-hero-url" data-target-id="#outbound-nl-hero-id" data-target-alt="#outbound-nl-hero-alt" data-target-preview="#outbound-nl-hero-preview">Upload / Choose from Gallery</button>
                                    <button type="button" class="button button-link-delete outbound-nl-clear-media" data-target-url="#outbound-nl-hero-url" data-target-id="#outbound-nl-hero-id" data-target-preview="#outbound-nl-hero-preview" data-empty-label="No hero image selected">Remove Image</button>
                                </p>
                                <p style="margin:0;"><input type="text" id="outbound-nl-hero-alt" name="hero_image_alt" value="<?php echo esc_attr($f_hero_alt); ?>" class="large-text" placeholder="Short description of photo (e.g. Victoria Falls aerial rainbow view)" /></p>
                            </div>
                            <div id="outbound-nl-hero-preview">
                                <?php if ($f_hero_url !== ''): ?>
                                    <img src="<?php echo esc_url($f_hero_url); ?>" alt="" style="max-width:100%;max-height:180px;border-radius:8px;border:1px solid #d5e0e5;display:block;" />
                                <?php else: ?>
                                    <div class="outbound-nl-empty-img">No hero image selected</div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <div id="outbound-nl-visual-blocks-wrap">
                        <strong>Email Content Blocks</strong>
                        <div class="outbound-nl-toolbar">
                            <button type="button" class="button outbound-nl-add-block" data-type="heading">+ Heading</button>
                            <button type="button" class="button outbound-nl-add-block" data-type="paragraph">+ Paragraph</button>
                            <button type="button" class="button outbound-nl-add-block" data-type="list">+ Bullet List</button>
                            <button type="button" class="button outbound-nl-add-block" data-type="image">+ Image</button>
                            <button type="button" class="button outbound-nl-add-block" data-type="button">+ CTA Button</button>
                            <button type="button" class="button outbound-nl-add-block" data-type="columns">+ 2-Column Block</button>
                            <button type="button" class="button outbound-nl-add-block" data-type="divider">+ Divider / Spacer</button>
                        </div>
                        <div class="outbound-nl-toolbar" style="background:#F0F9FF;padding:8px 10px;border-radius:8px;border:1px solid #BAE6FD;">
                            <span style="font-size:12px;font-weight:700;color:#0B5E8E;align-self:center;margin-right:4px;">Insert Snippet:</span>
                            <?php foreach ($snippets as $snip): ?>
                                <button type="button" class="button button-small outbound-nl-insert-snippet" data-blocks="<?php echo esc_attr(wp_json_encode($snip['blocks'])); ?>"><?php echo esc_html($snip['label']); ?></button>
                            <?php endforeach; ?>
                        </div>
                        <div id="outbound-nl-blocks-list"></div>
                    </div>

                    <?php if (current_user_can('manage_options')): ?>
                        <p style="margin-top:12px;">
                            <label><input type="checkbox" id="outbound-nl-toggle-html" name="use_raw_html" value="1" /> Advanced: Edit raw sanitized HTML instead of visual blocks</label>
                        </p>
                        <div id="outbound-nl-raw-html-wrap" style="display:none;">
                            <textarea name="body_html" rows="8" class="large-text code"><?php echo esc_textarea($f_body_html); ?></textarea>
                        </div>
                    <?php endif; ?>

                    <div class="outbound-nl-cols-grid" style="margin-top:14px;padding-top:14px;border-top:1px solid #E5E7EB;">
                        <p><label><strong>Primary Footer CTA Label</strong><br/>
                        <input type="text" name="cta_label" value="<?php echo esc_attr($f_cta_label); ?>" class="large-text" placeholder="e.g. Plan Your Victoria Falls Stay" /></label></p>
                        <p><label><strong>Primary Footer CTA URL</strong><br/>
                        <input type="url" name="cta_url" value="<?php echo esc_attr($f_cta_url); ?>" class="large-text" placeholder="https://outboundholiday.com/" /></label></p>
                    </div>
                </div>

                <!-- Stage 5: Live Preview & Test Email -->
                <div class="outbound-nl-stage-card">
                    <div class="outbound-nl-stage-head"><span class="outbound-nl-stage-num">5</span><h2>Preview &amp; Send Test Email</h2></div>
                    <div class="outbound-nl-toolbar">
                        <button type="button" id="outbound-nl-refresh-preview" class="button button-primary">Refresh Live Preview</button>
                        <button type="button" class="button outbound-nl-preview-mode button-primary" data-mode="desktop">Desktop View</button>
                        <button type="button" class="button outbound-nl-preview-mode" data-mode="mobile">Mobile (390px)</button>
                        <button type="button" class="button outbound-nl-preview-mode" data-mode="text">Plain Text</button>
                    </div>
                    <iframe id="outbound-nl-preview-frame" title="Newsletter Preview" style="width:100%;height:460px;border:1px solid #CBD5E1;border-radius:10px;background:#F6F3ED;display:block;margin:10px auto;"></iframe>
                    <div id="outbound-nl-preview-text" style="display:none;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:10px;padding:16px;"><pre style="white-space:pre-wrap;margin:0;font-size:13px;"></pre></div>

                    <div class="outbound-nl-row-inline" style="margin-top:14px;padding-top:14px;border-top:1px solid #E5E7EB;">
                        <input type="email" name="test_email" value="<?php echo esc_attr($mail_from['email']); ?>" class="regular-text" placeholder="Send test email to..." />
                        <button type="submit" name="outbound_nl_action" value="send_test" class="button button-secondary" formnovalidate>Send Test Email</button>
                    </div>
                </div>

                <!-- Stage 6: Schedule or Send -->
                <?php if (!$is_locked): ?>
                <div class="outbound-nl-stage-card">
                    <div class="outbound-nl-stage-head"><span class="outbound-nl-stage-num">6</span><h2>Save, Schedule (CAT) or Send Campaign</h2></div>
                    <p><strong>Confirm Audience:</strong> <span id="outbound-confirm-audience"><?php echo esc_html($selected_audience_label . ' (' . $selected_audience_count . ' confirmed subscribers)'); ?></span></p>
                    <p>
                        <label><strong>Schedule Date &amp; Time (Africa/Harare — CAT, UTC+2)</strong><br/>
                        <input type="datetime-local" name="scheduled_at_harare" value="<?php echo esc_attr($f_sched_cat); ?>" /></label>
                    </p>
                    <div class="outbound-nl-toolbar">
                        <button type="submit" name="outbound_nl_action" value="save_campaign" onclick="this.form.submit_mode.value='draft'" class="button button-secondary button-large">Save Draft</button>
                        <button type="submit" name="outbound_nl_action" value="save_campaign" onclick="this.form.submit_mode.value='schedule'" class="button button-primary button-large">Schedule Campaign (CAT)</button>
                        <button type="submit" name="outbound_nl_action" value="save_campaign" onclick="this.form.submit_mode.value='send_now'" class="button button-primary button-large outbound-nl-send-now-btn" <?php disabled(!$live_enabled); ?>>Queue &amp; Send Now</button>
                        <input type="hidden" name="submit_mode" value="draft" />
                    </div>
                </div>
                <?php endif; ?>
            </form>

        <?php elseif ($active_tab === 'campaigns'):
            $search_q = sanitize_text_field(wp_unslash((string) ($_GET['s'] ?? '')));
            $filter_status = sanitize_key((string) ($_GET['status'] ?? 'all'));
            $where = "WHERE 1=1";
            $params = array();
            if ($filter_status === 'all') {
                $where .= " AND status != 'archived'";
            } else {
                $where .= " AND status = %s";
                $params[] = $filter_status;
            }
            if ($search_q !== '') {
                $like = '%' . $wpdb->esc_like($search_q) . '%';
                $where .= " AND (title LIKE %s OR subject LIKE %s)";
                $params[] = $like;
                $params[] = $like;
            }
            $sql = "SELECT * FROM {$tables['campaigns']} {$where} ORDER BY id DESC";
            $campaigns = !empty($params) ? $wpdb->get_results($wpdb->prepare($sql, $params)) : $wpdb->get_results($sql);
        ?>
            <form method="get" style="margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <input type="hidden" name="page" value="outbound-newsletter" />
                <input type="hidden" name="tab" value="campaigns" />
                <input type="search" name="s" value="<?php echo esc_attr($search_q); ?>" placeholder="Search title or subject..." class="regular-text" />
                <select name="status">
                    <?php foreach (array('all' => 'Active (Excl. Archived)', 'draft' => 'Draft', 'scheduled' => 'Scheduled', 'sending' => 'Sending', 'completed' => 'Completed', 'failed' => 'Failed', 'archived' => 'Archived') as $sk => $sl): ?>
                        <option value="<?php echo esc_attr($sk); ?>" <?php selected($filter_status, $sk); ?>><?php echo esc_html($sl); ?></option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="button">Filter</button>
            </form>

            <table class="widefat striped">
                <thead><tr><th>ID</th><th>Title / Subject</th><th>Template</th><th>Audience</th><th>Status</th><th>Scheduled (CAT)</th><th>Sent / Target</th><th>Actions</th></tr></thead>
                <tbody>
                    <?php if (empty($campaigns)): ?>
                        <tr><td colspan="8">No campaigns match the current filter.</td></tr>
                    <?php else: foreach ($campaigns as $c):
                        $aud_label = $segments[$c->audience_segment ?? 'all_confirmed']['label'] ?? 'All Confirmed';
                    ?>
                        <tr>
                            <td>#<?php echo (int) $c->id; ?></td>
                            <td><strong><?php echo esc_html($c->title); ?></strong><br/><span class="description"><?php echo esc_html($c->subject); ?></span></td>
                            <td><?php echo esc_html($templates[$c->template_id]['label'] ?? $c->template_id); ?></td>
                            <td><?php echo esc_html($aud_label); ?></td>
                            <td><span class="outbound-nl-badge outbound-nl-badge--<?php echo esc_attr($c->status); ?>"><?php echo esc_html($c->status); ?></span></td>
                            <td><?php echo esc_html(outbound_utc_to_harare_label($c->scheduled_at)); ?></td>
                            <td><?php echo (int) $c->sent_count; ?> / <?php echo (int) $c->recipient_count; ?><?php echo $c->failed_count ? ' (' . (int) $c->failed_count . ' failed)' : ''; ?></td>
                            <td style="white-space:nowrap;">
                                <?php if (in_array($c->status, array('draft', 'scheduled'), true)): ?>
                                    <a href="<?php echo esc_url($base_url . '&tab=composer&campaign_id=' . (int) $c->id); ?>" class="button button-small">Edit</a>
                                <?php endif; ?>
                                <?php if ($c->status === 'draft'): ?>
                                    <form method="post" style="display:inline;">
                                        <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                                        <input type="hidden" name="outbound_nl_action" value="queue_campaign" />
                                        <input type="hidden" name="campaign_id" value="<?php echo (int) $c->id; ?>" />
                                        <button type="submit" class="button button-small button-primary" <?php disabled(!$live_enabled); ?>>Queue Send</button>
                                    </form>
                                <?php endif; ?>
                                <?php if ($c->status === 'scheduled'): ?>
                                    <form method="post" style="display:inline;">
                                        <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                                        <input type="hidden" name="outbound_nl_action" value="cancel_schedule" />
                                        <input type="hidden" name="campaign_id" value="<?php echo (int) $c->id; ?>" />
                                        <button type="submit" class="button button-small">Cancel Schedule</button>
                                    </form>
                                <?php endif; ?>
                                <form method="post" style="display:inline;">
                                    <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                                    <input type="hidden" name="outbound_nl_action" value="duplicate_campaign" />
                                    <input type="hidden" name="campaign_id" value="<?php echo (int) $c->id; ?>" />
                                    <button type="submit" class="button button-small">Duplicate</button>
                                </form>
                                <?php if (!in_array($c->status, array('draft', 'scheduled'), true)): ?>
                                    <a href="<?php echo esc_url($base_url . '&tab=report&campaign_id=' . (int) $c->id); ?>" class="button button-small">Report</a>
                                <?php endif; ?>
                                <?php if (!in_array($c->status, array('queued', 'sending', 'archived'), true)): ?>
                                    <form method="post" style="display:inline;" onsubmit="return confirm('Archive this campaign?');">
                                        <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                                        <input type="hidden" name="outbound_nl_action" value="archive_campaign" />
                                        <input type="hidden" name="campaign_id" value="<?php echo (int) $c->id; ?>" />
                                        <button type="submit" class="button button-small">Archive</button>
                                    </form>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>

        <?php elseif ($active_tab === 'subscribers'):
            $sub_q = sanitize_text_field(wp_unslash((string) ($_GET['s'] ?? '')));
            $sub_status = sanitize_key((string) ($_GET['status'] ?? 'all'));
            $where = "WHERE 1=1";
            $params = array();
            if ($sub_status !== 'all') {
                $where .= " AND status = %s";
                $params[] = $sub_status;
            }
            if ($sub_q !== '') {
                $like = '%' . $wpdb->esc_like($sub_q) . '%';
                $where .= " AND (email LIKE %s OR name LIKE %s)";
                $params[] = $like;
                $params[] = $like;
            }
            $sql = "SELECT * FROM {$tables['subscribers']} {$where} ORDER BY id DESC LIMIT 200";
            $subs = !empty($params) ? $wpdb->get_results($wpdb->prepare($sql, $params)) : $wpdb->get_results($sql);
        ?>
            <div class="outbound-nl-kpi-grid">
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Confirmed</div><div class="outbound-nl-kpi-val" style="color:#166534;"><?php echo $confirmed_count; ?></div></div>
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Pending DOI</div><div class="outbound-nl-kpi-val"><?php echo $pending_sub_count; ?></div></div>
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Unsubscribed</div><div class="outbound-nl-kpi-val" style="color:#991B1B;"><?php echo $unsub_count; ?></div></div>
                <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Suppressed</div><div class="outbound-nl-kpi-val" style="color:#991B1B;"><?php echo $suppressed_count; ?></div></div>
            </div>

            <div class="outbound-nl-stage-card">
                <div class="outbound-card-toolbar">
                    <h2 style="margin:0;">Import Confirmed Subscribers (CSV) &amp; Export</h2>
                    <div class="outbound-header-actions">
                        <a href="<?php echo esc_url(wp_nonce_url($base_url . '&export=csv', 'outbound_export_subs')); ?>" class="button button-secondary">Export CSV</a>
                        <a href="<?php echo esc_url(wp_nonce_url($base_url . '&export=json', 'outbound_export_subs')); ?>" class="button button-secondary">Export JSON</a>
                    </div>
                </div>
                <form method="post" enctype="multipart/form-data" style="margin-top:10px;">
                    <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                    <input type="hidden" name="outbound_nl_action" value="import_csv" />
                    <p class="description">Format: <code>email,name</code> (one per line). Duplicates are skipped, and existing <code>unsubscribed</code> / <code>suppressed</code> contacts are strictly preserved.</p>
                    <p><input type="file" name="csv_file" accept=".csv,text/csv" /></p>
                    <p><textarea name="csv_data" rows="4" class="large-text code" placeholder="guest@example.com,Jane Doe"></textarea></p>
                    <button type="submit" class="button button-primary">Import Subscribers</button>
                </form>
            </div>

            <form method="get" style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;">
                <input type="hidden" name="page" value="outbound-newsletter" />
                <input type="hidden" name="tab" value="subscribers" />
                <input type="search" name="s" value="<?php echo esc_attr($sub_q); ?>" placeholder="Search email or name..." class="regular-text" />
                <select name="status">
                    <?php foreach (array('all' => 'All Statuses', 'confirmed' => 'Confirmed', 'pending' => 'Pending DOI', 'unsubscribed' => 'Unsubscribed', 'suppressed' => 'Suppressed') as $sk => $sl): ?>
                        <option value="<?php echo esc_attr($sk); ?>" <?php selected($sub_status, $sk); ?>><?php echo esc_html($sl); ?></option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="button">Filter</button>
            </form>

            <table class="widefat striped">
                <thead><tr><th>Email</th><th>Name</th><th>Source</th><th>Status</th><th>Consented (UTC)</th><th>Actions</th></tr></thead>
                <tbody>
                    <?php if (empty($subs)): ?>
                        <tr><td colspan="6">No subscribers match your filter.</td></tr>
                    <?php else: foreach ($subs as $s): ?>
                        <tr>
                            <td><?php echo esc_html($s->email); ?></td>
                            <td><?php echo esc_html($s->name ?: '—'); ?></td>
                            <td><?php echo esc_html($s->source); ?></td>
                            <td><span class="outbound-nl-badge outbound-nl-badge--<?php echo esc_attr($s->status); ?>"><?php echo esc_html($s->status); ?></span></td>
                            <td><?php echo esc_html($s->consented_at ?: '—'); ?></td>
                            <td>
                                <?php if ($s->status !== 'suppressed'): ?>
                                    <form method="post" style="display:inline;">
                                        <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                                        <input type="hidden" name="outbound_nl_action" value="update_subscriber_status" />
                                        <input type="hidden" name="subscriber_id" value="<?php echo (int) $s->id; ?>" />
                                        <input type="hidden" name="new_status" value="suppressed" />
                                        <button type="submit" class="button button-small">Suppress</button>
                                    </form>
                                <?php endif; ?>
                                <?php if ($s->status === 'confirmed'): ?>
                                    <form method="post" style="display:inline;">
                                        <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                                        <input type="hidden" name="outbound_nl_action" value="update_subscriber_status" />
                                        <input type="hidden" name="subscriber_id" value="<?php echo (int) $s->id; ?>" />
                                        <input type="hidden" name="new_status" value="unsubscribed" />
                                        <button type="submit" class="button button-small">Unsubscribe</button>
                                    </form>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>

        <?php elseif ($active_tab === 'templates'): ?>
            <div class="outbound-nl-cards-grid">
                <?php foreach ($templates as $tid => $tpl): ?>
                    <div class="outbound-nl-stage-card" style="margin-bottom:0;">
                        <div class="outbound-nl-tpl-swatch" style="background:<?php echo esc_attr($tpl['accent']); ?>;height:14px;"></div>
                        <h3 style="margin:6px 0;"><?php echo esc_html($tpl['label']); ?></h3>
                        <p class="description"><?php echo esc_html($tpl['description']); ?></p>
                        <p style="margin-top:12px;">
                            <a href="<?php echo esc_url($base_url . '&tab=composer&template=' . urlencode($tid)); ?>" class="button button-primary">Use This Template</a>
                        </p>
                    </div>
                <?php endforeach; ?>
            </div>

        <?php elseif ($active_tab === 'report' && $edit_id > 0):
            $report = outbound_get_campaign_report_data($edit_id);
            if (!$report):
                echo '<div class="notice notice-error"><p>Campaign not found.</p></div>';
            else:
                $c = $report['campaign'];
        ?>
            <div class="outbound-nl-stage-card">
                <div class="outbound-card-toolbar">
                    <div>
                        <h2 style="margin:0 0 4px;">Campaign Report: <?php echo esc_html($c->title); ?></h2>
                        <p class="description" style="margin:0;">Subject: <?php echo esc_html($c->subject); ?> &middot; Status: <strong><?php echo esc_html($c->status); ?></strong></p>
                    </div>
                    <div class="outbound-header-actions">
                        <a href="<?php echo esc_url(wp_nonce_url($base_url . '&export=campaign_report&campaign_id=' . (int) $c->id, 'outbound_export_subs')); ?>" class="button button-secondary">Export Report CSV</a>
                        <form method="post" style="display:inline;">
                            <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                            <input type="hidden" name="outbound_nl_action" value="duplicate_campaign" />
                            <input type="hidden" name="campaign_id" value="<?php echo (int) $c->id; ?>" />
                            <button type="submit" class="button button-primary">Duplicate into New Draft</button>
                        </form>
                    </div>
                </div>

                <div class="outbound-nl-kpi-grid">
                    <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Targeted Recipients</div><div class="outbound-nl-kpi-val"><?php echo (int) $report['recipients_targeted']; ?></div></div>
                    <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Queued</div><div class="outbound-nl-kpi-val"><?php echo (int) $report['queued_total']; ?></div></div>
                    <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Sent / SMTP Accepted</div><div class="outbound-nl-kpi-val" style="color:#166534;"><?php echo (int) $report['sent_accepted']; ?></div></div>
                    <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Failed</div><div class="outbound-nl-kpi-val" style="color:#991B1B;"><?php echo (int) $report['failed_count']; ?></div></div>
                    <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Pending Queue</div><div class="outbound-nl-kpi-val"><?php echo (int) $report['pending_count']; ?></div></div>
                    <div class="outbound-nl-kpi"><div class="outbound-nl-kpi-label">Unsubscribed After Send</div><div class="outbound-nl-kpi-val"><?php echo (int) $report['unsubscribes_after_send']; ?></div></div>
                </div>

                <div class="notice notice-info inline" style="margin:0 0 16px;">
                    <p><strong>Unavailable Metrics (Standard SMTP / wp_mail):</strong><br/>
                    &bull; Confirmed Delivered / External Bounces: <?php echo esc_html($report['unavailable_metrics']['bounces']); ?><br/>
                    &bull; Email Opens: <?php echo esc_html($report['unavailable_metrics']['opens']); ?><br/>
                    &bull; Link Clicks: <?php echo esc_html($report['unavailable_metrics']['clicks']); ?></p>
                </div>

                <table class="widefat striped">
                    <thead><tr><th>Recipient</th><th>Status</th><th>Attempts</th><th>Sent At (UTC)</th><th>Error</th></tr></thead>
                    <tbody>
                        <?php if (empty($report['logs'])): ?>
                            <tr><td colspan="5">No delivery queue rows recorded for this campaign yet.</td></tr>
                        <?php else: foreach ($report['logs'] as $log): ?>
                            <tr>
                                <td><?php echo esc_html($log->recipient_email); ?></td>
                                <td><span class="outbound-nl-badge outbound-nl-badge--<?php echo esc_attr($log->status); ?>"><?php echo esc_html($log->status); ?></span></td>
                                <td><?php echo (int) $log->attempts; ?></td>
                                <td><?php echo esc_html($log->sent_at ?: '—'); ?></td>
                                <td><?php echo esc_html($log->last_error ?: '—'); ?></td>
                            </tr>
                        <?php endforeach; endif; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
        <?php endif; ?>

        <?php if ($active_tab === 'logs'):
            $logs = $wpdb->get_results("SELECT * FROM {$tables['notifications']} ORDER BY id DESC LIMIT 100");
            $next_cron_ts = function_exists('wp_next_scheduled') ? wp_next_scheduled('outbound_process_due_campaigns') : false;
            $next_cron_label = $next_cron_ts ? outbound_utc_to_harare_label(gmdate('Y-m-d H:i:s', (int) $next_cron_ts)) : 'Not scheduled';
            $wp_cron_disabled = defined('DISABLE_WP_CRON') && DISABLE_WP_CRON;
            $queue_locked = (bool) get_transient('outbound_nl_queue_lock');
        ?>
            <div class="outbound-card-toolbar" style="margin-bottom:10px;">
                <div>
                    <h2 style="margin:0;">Notification Delivery Queue &amp; Logs</h2>
                    <p style="margin:4px 0 0;color:#475569;font-size:12px;">
                        Cron Worker: <strong><?php echo esc_html($next_cron_ts ? 'Scheduled' : 'Not scheduled'); ?></strong>
                        (Next run: <?php echo esc_html($next_cron_label); ?>)
                        · Lock: <strong><?php echo $queue_locked ? 'Active' : 'Idle'; ?></strong>
                        <?php if ($wp_cron_disabled): ?>
                            · <span style="color:#9A3412;">DISABLE_WP_CRON is enabled (requires server cron calling wp-cron.php)</span>
                        <?php endif; ?>
                    </p>
                </div>
                <?php if (current_user_can('manage_options')): ?>
                    <form method="post">
                        <?php wp_nonce_field('outbound_newsletter_action', 'outbound_nl_nonce'); ?>
                        <input type="hidden" name="outbound_nl_action" value="run_batch_now" />
                        <input type="hidden" name="return_tab" value="logs" />
                        <button type="submit" class="button button-primary">Process Queue Now (<?php echo $pending_queue; ?>)</button>
                    </form>
                <?php endif; ?>
            </div>
            <table class="widefat striped">
                <thead><tr><th>ID</th><th>Kind</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Attempts</th><th>Sent At (UTC)</th><th>Error</th></tr></thead>
                <tbody>
                    <?php if (empty($logs)): ?>
                        <tr><td colspan="8">No notification logs yet.</td></tr>
                    <?php else: foreach ($logs as $l): ?>
                        <tr>
                            <td>#<?php echo (int) $l->id; ?></td>
                            <td><?php echo esc_html($l->kind); ?></td>
                            <td><?php echo esc_html($l->recipient_email); ?></td>
                            <td><?php echo esc_html($l->subject); ?></td>
                            <td><span class="outbound-nl-badge outbound-nl-badge--<?php echo esc_attr($l->status); ?>"><?php echo esc_html($l->status); ?></span></td>
                            <td><?php echo (int) $l->attempts; ?></td>
                            <td><?php echo esc_html($l->sent_at ?: '—'); ?></td>
                            <td><?php echo esc_html($l->last_error ?: '—'); ?></td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
    <?php
}

<?php
/**
 * Newsletter Confirmation & Unsubscribe Handler Template (`/newsletter-confirmed` / `/newsletter/confirmed`).
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

$action = isset($_GET['action']) ? sanitize_text_field((string) wp_unslash($_GET['action'])) : '';
$token  = isset($_GET['token']) ? sanitize_text_field((string) wp_unslash($_GET['token'])) : '';

if ($token !== '' && function_exists('outbound_handle_newsletter_token_action')) {
    $GLOBALS['__outbound_nl_result'] = outbound_handle_newsletter_token_action(
        $action === 'unsubscribe' ? 'unsubscribe' : 'confirm',
        $token
    );
}

$res = $GLOBALS['__outbound_nl_result'] ?? array(
    'status'  => 'info',
    'message' => 'Use the confirmation link sent to your email to confirm your request.',
);

get_header();
get_template_part('template-parts/app-ssr-shell', null, array(
    'title'   => ($res['status'] ?? '') === 'confirmed' ? 'Subscription Confirmed!' : 'Travel Club Subscription Status',
    'summary' => (string) ($res['message'] ?? ''),
));
get_footer();

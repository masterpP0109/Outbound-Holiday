<?php
/**
 * WordPress Admin Hub: Site & Homepage CMS Controls, SMTP & Security Setup, Health Diagnostics.
 *
 * @package OutboundHolidays
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Top-Level Outbound Holidays WordPress Admin Menu.
 */
function outbound_register_admin_menus(): void {
    add_menu_page(
        __('Outbound CMS', 'outbound-holidays'),
        __('Outbound CMS', 'outbound-holidays'),
        'manage_options',
        'outbound-cms',
        'outbound_render_cms_hub_page',
        'dashicons-palmtree',
        3
    );

    add_submenu_page(
        'outbound-cms',
        __('Outbound CMS', 'outbound-holidays'),
        __('Outbound CMS', 'outbound-holidays'),
        'manage_options',
        'outbound-cms',
        'outbound_render_cms_hub_page'
    );

    add_submenu_page(
        'outbound-cms',
        __('Setup, SMTP & Health', 'outbound-holidays'),
        __('Setup & Email Health', 'outbound-holidays'),
        'manage_options',
        'outbound-setup-health',
        'outbound_render_setup_health_page'
    );
}
add_action('admin_menu', 'outbound_register_admin_menus', 9);

/**
 * Legacy callback alias delegating cleanly to the unified 14-section Outbound CMS hub.
 */
function outbound_render_site_cms_page(): void {
    if (function_exists('outbound_render_cms_hub_page')) {
        outbound_render_cms_hub_page();
        return;
    }
    if (!current_user_can('manage_options')) {
        return;
    }

    $saved = false;
    if (isset($_POST['outbound_cms_save']) && check_admin_referer('outbound_save_cms_action', 'outbound_cms_nonce')) {
        $raw = isset($_POST['cms']) && is_array($_POST['cms']) ? wp_unslash($_POST['cms']) : array();
        $trust_lines = preg_split('/\r\n|\r|\n/', (string) ($raw['hero_trust'] ?? ''));
        $trust_clean = array_values(array_filter(array_map('sanitize_text_field', (array) $trust_lines)));

        $new_opts = array(
            'brand' => array(
                'name'    => sanitize_text_field((string) ($raw['brand_name'] ?? 'Outbound Holidays')),
                'tagline' => sanitize_text_field((string) ($raw['brand_tagline'] ?? '')),
            ),
            'contact' => array(
                'whatsappNumber' => preg_replace('/[^0-9]/', '', (string) ($raw['whatsappNumber'] ?? '263714701721')),
                'displayNumber'  => sanitize_text_field((string) ($raw['displayNumber'] ?? '')),
                'email'          => sanitize_email((string) ($raw['email'] ?? 'travel@outboundholidays.co.zw')),
                'address'        => sanitize_text_field((string) ($raw['address'] ?? '')),
                'hours'          => sanitize_text_field((string) ($raw['hours'] ?? '')),
            ),
            'hero' => array(
                'badge'            => sanitize_text_field((string) ($raw['hero_badge'] ?? '')),
                'title'            => sanitize_text_field((string) ($raw['hero_title'] ?? '')),
                'subtitle'         => sanitize_textarea_field((string) ($raw['hero_subtitle'] ?? '')),
                'primaryCtaText'   => sanitize_text_field((string) ($raw['hero_primary_cta'] ?? 'Plan My Holiday')),
                'secondaryCtaText' => sanitize_text_field((string) ($raw['hero_secondary_cta'] ?? 'Chat on WhatsApp')),
                'trustStrip'       => $trust_clean,
            ),
            'homepageSections' => array(
                'showQuickPlanning' => !empty($raw['showQuickPlanning']),
                'showExperiences'   => !empty($raw['showExperiences']),
                'showPackages'      => !empty($raw['showPackages']),
                'showWhereToStay'   => !empty($raw['showWhereToStay']),
                'showGuides'        => !empty($raw['showGuides']),
                'showWhyOutbound'   => !empty($raw['showWhyOutbound']),
                'showStories'       => !empty($raw['showStories']),
                'showClientGallery' => !empty($raw['showClientGallery']),
                'showNewsletter'    => !empty($raw['showNewsletter']),
                'showFinalCta'      => !empty($raw['showFinalCta']),
                'experiencesTitle'  => sanitize_text_field((string) ($raw['experiencesTitle'] ?? '')),
                'experiencesSub'    => sanitize_textarea_field((string) ($raw['experiencesSub'] ?? '')),
                'packagesTitle'     => sanitize_text_field((string) ($raw['packagesTitle'] ?? '')),
                'packagesSub'       => sanitize_textarea_field((string) ($raw['packagesSub'] ?? '')),
                'staysTitle'        => sanitize_text_field((string) ($raw['staysTitle'] ?? '')),
                'staysSub'          => sanitize_textarea_field((string) ($raw['staysSub'] ?? '')),
                'guidesTitle'       => sanitize_text_field((string) ($raw['guidesTitle'] ?? '')),
                'guidesSub'         => sanitize_textarea_field((string) ($raw['guidesSub'] ?? '')),
                'whyTitle'          => sanitize_text_field((string) ($raw['whyTitle'] ?? '')),
                'storiesTitle'      => sanitize_text_field((string) ($raw['storiesTitle'] ?? '')),
                'finalCtaTitle'     => sanitize_text_field((string) ($raw['finalCtaTitle'] ?? '')),
                'finalCtaSub'       => sanitize_textarea_field((string) ($raw['finalCtaSub'] ?? '')),
            ),
            'social' => array(
                'facebook'  => esc_url_raw((string) ($raw['facebook'] ?? '')),
                'instagram' => esc_url_raw((string) ($raw['instagram'] ?? '')),
                'youtube'   => esc_url_raw((string) ($raw['youtube'] ?? '')),
            ),
            'legal' => array(
                'privacyNote' => sanitize_textarea_field((string) ($raw['privacyNote'] ?? '')),
                'copyright'   => sanitize_text_field((string) ($raw['copyright'] ?? '')),
            ),
        );

        update_option('outbound_site_cms_options', $new_opts);
        $saved = true;
    }

    $cms = outbound_get_site_options();
    $sec = $cms['homepageSections'];
    ?>
    <div class="wrap outbound-admin-wrap">
        <div class="outbound-admin-header">
            <div>
                <h1><?php esc_html_e('Outbound Holidays — Site & Homepage CMS', 'outbound-holidays'); ?></h1>
                <p><?php esc_html_e('Edit homepage copy, visibility toggles, specialist WhatsApp contact details, social links and legal copy cleanly inside WordPress.', 'outbound-holidays'); ?></p>
            </div>
            <a href="<?php echo esc_url(home_url('/')); ?>" target="_blank" class="button button-secondary"><?php esc_html_e('View Live Site', 'outbound-holidays'); ?></a>
        </div>

        <?php if ($saved) : ?>
            <div class="notice notice-success is-dismissible"><p><?php esc_html_e('Site & Homepage CMS settings saved.', 'outbound-holidays'); ?></p></div>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field('outbound_save_cms_action', 'outbound_cms_nonce'); ?>

            <div class="outbound-admin-card">
                <h2><?php esc_html_e('1. Homepage Hero (Preserves Optimised Visual Layout)', 'outbound-holidays'); ?></h2>
                <table class="form-table">
                    <tr><th><label><?php esc_html_e('Top Badge', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[hero_badge]" value="<?php echo esc_attr($cms['hero']['badge']); ?>" class="large-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Main Headline (H1)', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[hero_title]" value="<?php echo esc_attr($cms['hero']['title']); ?>" class="large-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Subtitle Paragraph', 'outbound-holidays'); ?></label></th>
                        <td><textarea name="cms[hero_subtitle]" rows="3" class="large-text"><?php echo esc_textarea($cms['hero']['subtitle']); ?></textarea></td></tr>
                    <tr><th><label><?php esc_html_e('Primary CTA Button Label', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[hero_primary_cta]" value="<?php echo esc_attr($cms['hero']['primaryCtaText']); ?>" class="regular-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Secondary CTA Button Label', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[hero_secondary_cta]" value="<?php echo esc_attr($cms['hero']['secondaryCtaText']); ?>" class="regular-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Hero Trust Strip Items (1 per line)', 'outbound-holidays'); ?></label></th>
                        <td><textarea name="cms[hero_trust]" rows="4" class="large-text"><?php echo esc_textarea(implode("\n", (array) $cms['hero']['trustStrip'])); ?></textarea></td></tr>
                </table>
            </div>

            <div class="outbound-admin-card">
                <h2><?php esc_html_e('2. Homepage Section Headings & Visibility Controls', 'outbound-holidays'); ?></h2>
                <p>
                    <?php
                    $toggles = array(
                        'showQuickPlanning' => 'Quick Planning Bar',
                        'showExperiences'   => 'Featured Things to Do',
                        'showPackages'      => 'Featured Packages',
                        'showWhereToStay'   => 'Where to Stay Showcase',
                        'showGuides'        => 'Victoria Falls Guides',
                        'showWhyOutbound'   => 'Why Outbound Holidays',
                        'showStories'       => 'Traveller Stories',
                        'showClientGallery' => 'Client Gallery Strip',
                        'showNewsletter'    => 'Newsletter Section',
                        'showFinalCta'      => 'Final CTA Banner',
                    );
                    foreach ($toggles as $key => $label) : ?>
                        <label style="display:inline-block;margin:0 18px 8px 0;">
                            <input type="checkbox" name="cms[<?php echo esc_attr($key); ?>]" value="1" <?php checked(!empty($sec[$key])); ?>>
                            <?php echo esc_html($label); ?>
                        </label>
                    <?php endforeach; ?>
                </p>
                <table class="form-table">
                    <tr><th><label><?php esc_html_e('Experiences Heading & Sub', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[experiencesTitle]" value="<?php echo esc_attr($sec['experiencesTitle']); ?>" class="large-text"><br>
                            <textarea name="cms[experiencesSub]" rows="2" class="large-text" style="margin-top:6px;"><?php echo esc_textarea($sec['experiencesSub']); ?></textarea></td></tr>
                    <tr><th><label><?php esc_html_e('Packages Heading & Sub', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[packagesTitle]" value="<?php echo esc_attr($sec['packagesTitle']); ?>" class="large-text"><br>
                            <textarea name="cms[packagesSub]" rows="2" class="large-text" style="margin-top:6px;"><?php echo esc_textarea($sec['packagesSub']); ?></textarea></td></tr>
                    <tr><th><label><?php esc_html_e('Where to Stay Heading & Sub', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[staysTitle]" value="<?php echo esc_attr($sec['staysTitle']); ?>" class="large-text"><br>
                            <textarea name="cms[staysSub]" rows="2" class="large-text" style="margin-top:6px;"><?php echo esc_textarea($sec['staysSub']); ?></textarea></td></tr>
                    <tr><th><label><?php esc_html_e('Guides Heading & Sub', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[guidesTitle]" value="<?php echo esc_attr($sec['guidesTitle']); ?>" class="large-text"><br>
                            <textarea name="cms[guidesSub]" rows="2" class="large-text" style="margin-top:6px;"><?php echo esc_textarea($sec['guidesSub']); ?></textarea></td></tr>
                    <tr><th><label><?php esc_html_e('Why Outbound Heading', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[whyTitle]" value="<?php echo esc_attr($sec['whyTitle']); ?>" class="large-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Traveller Stories Heading', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[storiesTitle]" value="<?php echo esc_attr($sec['storiesTitle']); ?>" class="large-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Final CTA Heading & Sub', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[finalCtaTitle]" value="<?php echo esc_attr($sec['finalCtaTitle']); ?>" class="large-text"><br>
                            <textarea name="cms[finalCtaSub]" rows="2" class="large-text" style="margin-top:6px;"><?php echo esc_textarea($sec['finalCtaSub']); ?></textarea></td></tr>
                </table>
            </div>

            <div class="outbound-admin-card">
                <h2><?php esc_html_e('3. Global Contact Details, WhatsApp, Social & Footer Legal', 'outbound-holidays'); ?></h2>
                <table class="form-table">
                    <tr><th><label><?php esc_html_e('Brand Name & Tagline', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[brand_name]" value="<?php echo esc_attr($cms['brand']['name']); ?>" class="regular-text">
                            <input type="text" name="cms[brand_tagline]" value="<?php echo esc_attr($cms['brand']['tagline']); ?>" class="large-text" style="margin-top:6px;"></td></tr>
                    <tr><th><label><?php esc_html_e('WhatsApp Number (digits only)', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[whatsappNumber]" value="<?php echo esc_attr($cms['contact']['whatsappNumber']); ?>" class="regular-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Display Phone Number', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[displayNumber]" value="<?php echo esc_attr($cms['contact']['displayNumber']); ?>" class="regular-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Specialist Email Address', 'outbound-holidays'); ?></label></th>
                        <td><input type="email" name="cms[email]" value="<?php echo esc_attr($cms['contact']['email']); ?>" class="regular-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Office Address', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[address]" value="<?php echo esc_attr($cms['contact']['address']); ?>" class="large-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Operating Hours', 'outbound-holidays'); ?></label></th>
                        <td><input type="text" name="cms[hours]" value="<?php echo esc_attr($cms['contact']['hours']); ?>" class="regular-text"></td></tr>
                    <tr><th><label><?php esc_html_e('Social URLs (FB / IG / YT)', 'outbound-holidays'); ?></label></th>
                        <td><input type="url" name="cms[facebook]" value="<?php echo esc_attr($cms['social']['facebook']); ?>" class="regular-text" placeholder="Facebook URL">
                            <input type="url" name="cms[instagram]" value="<?php echo esc_attr($cms['social']['instagram']); ?>" class="regular-text" placeholder="Instagram URL">
                            <input type="url" name="cms[youtube]" value="<?php echo esc_attr($cms['social']['youtube']); ?>" class="regular-text" placeholder="YouTube URL"></td></tr>
                    <tr><th><label><?php esc_html_e('Privacy Note & Copyright', 'outbound-holidays'); ?></label></th>
                        <td><textarea name="cms[privacyNote]" rows="2" class="large-text"><?php echo esc_textarea($cms['legal']['privacyNote']); ?></textarea><br>
                            <input type="text" name="cms[copyright]" value="<?php echo esc_attr($cms['legal']['copyright']); ?>" class="large-text" style="margin-top:6px;"></td></tr>
                </table>
            </div>

            <p><button type="submit" name="outbound_cms_save" value="1" class="button button-primary button-large"><?php esc_html_e('Save CMS Changes', 'outbound-holidays'); ?></button></p>
        </form>
    </div>
    <?php
}

/**
 * Resolve configured From Email & Name from wp-config constants or wp_options.
 *
 * @return array{email:string,name:string}
 */
function outbound_get_mail_from_config(): array {
    $opts     = function_exists('get_option') ? (array) get_option('outbound_smtp_options', array()) : array();
    $from     = defined('OUTBOUND_SMTP_FROM_EMAIL') ? (string) OUTBOUND_SMTP_FROM_EMAIL : (string) ($opts['from_email'] ?? '');
    $fromName = defined('OUTBOUND_SMTP_FROM_NAME') ? (string) OUTBOUND_SMTP_FROM_NAME : (string) ($opts['from_name'] ?? 'Outbound Holidays');
    if (!is_email($from) && function_exists('get_option')) {
        $admin = (string) get_option('admin_email');
        if (is_email($admin)) {
            $from = $admin;
        }
    }
    return array(
        'email' => is_email($from) ? $from : '',
        'name'  => $fromName !== '' ? $fromName : 'Outbound Holidays',
    );
}

add_filter('wp_mail_from', static function (string $original): string {
    $cfg = outbound_get_mail_from_config();
    return $cfg['email'] !== '' ? $cfg['email'] : $original;
});

add_filter('wp_mail_from_name', static function (string $original): string {
    $cfg = outbound_get_mail_from_config();
    return $cfg['name'] !== '' ? $cfg['name'] : $original;
});

/**
 * Configure WordPress PHPMailer with SMTP settings stored in wp-config constants or wp_options.
 */
function outbound_configure_phpmailer($phpmailer): void {
    $opts = get_option('outbound_smtp_options', array());
    $from_cfg = outbound_get_mail_from_config();
    if ($from_cfg['email'] !== '') {
        $phpmailer->From     = $from_cfg['email'];
        $phpmailer->FromName = $from_cfg['name'];
        $phpmailer->Sender   = $from_cfg['email'];
    }

    $host = defined('OUTBOUND_SMTP_HOST') ? (string) OUTBOUND_SMTP_HOST : (string) ($opts['host'] ?? '');
    if ($host === '') {
        return;
    }

    $port     = defined('OUTBOUND_SMTP_PORT') ? (int) OUTBOUND_SMTP_PORT : (int) ($opts['port'] ?? 587);
    $user     = defined('OUTBOUND_SMTP_USER') ? (string) OUTBOUND_SMTP_USER : (string) ($opts['user'] ?? '');
    $pass     = defined('OUTBOUND_SMTP_PASS') ? (string) OUTBOUND_SMTP_PASS : (string) ($opts['pass'] ?? '');
    $secure   = defined('OUTBOUND_SMTP_SECURE') ? (string) OUTBOUND_SMTP_SECURE : (string) ($opts['secure'] ?? 'tls');

    $phpmailer->isSMTP();
    $phpmailer->Host       = $host;
    $phpmailer->Port       = $port > 0 ? $port : 587;
    $phpmailer->Timeout    = 12;
    $phpmailer->SMTPSecure = in_array($secure, array('tls', 'ssl'), true) ? $secure : '';
    if ($phpmailer->SMTPSecure === '') {
        $phpmailer->SMTPAutoTLS = false;
    }
    if ($user !== '' || $pass !== '') {
        $phpmailer->SMTPAuth = true;
        $phpmailer->Username = $user;
        $phpmailer->Password = $pass;
    }
}
add_action('phpmailer_init', 'outbound_configure_phpmailer');

/**
 * Render Setup, SMTP & Health Screen.
 */
function outbound_render_setup_health_page(): void {
    if (!current_user_can('manage_options')) {
        return;
    }

    $notice = '';
    if (isset($_POST['outbound_run_setup_repair']) && check_admin_referer('outbound_setup_action', 'outbound_setup_nonce')) {
        outbound_maybe_install_schema(true);
        outbound_ensure_core_pages();
        flush_rewrite_rules();
        $notice = __('Database tables, core WordPress pages, taxonomies, and rewrite rules verified/repaired.', 'outbound-holidays');
    }

    if (isset($_POST['outbound_save_smtp']) && check_admin_referer('outbound_setup_action', 'outbound_setup_nonce')) {
        $smtp = isset($_POST['smtp']) && is_array($_POST['smtp']) ? wp_unslash($_POST['smtp']) : array();
        $existing = (array) get_option('outbound_smtp_options', array());
        update_option('outbound_smtp_options', array(
            'host'       => sanitize_text_field((string) ($smtp['host'] ?? '')),
            'port'       => (int) ($smtp['port'] ?? 587),
            'secure'     => sanitize_text_field((string) ($smtp['secure'] ?? 'tls')),
            'user'       => sanitize_text_field((string) ($smtp['user'] ?? '')),
            'pass'       => ($smtp['pass'] ?? '') !== '' ? (string) $smtp['pass'] : (string) ($existing['pass'] ?? ''),
            'from_email' => sanitize_email((string) ($smtp['from_email'] ?? '')),
            'from_name'  => sanitize_text_field((string) ($smtp['from_name'] ?? 'Outbound Holidays')),
            'live_send_enabled' => !empty($smtp['live_send_enabled']),
        ), false);

        $sec = isset($_POST['sec']) && is_array($_POST['sec']) ? wp_unslash($_POST['sec']) : array();
        $existing_sec = (array) get_option('outbound_security_options', array());
        update_option('outbound_security_options', array(
            'turnstile_site_key'   => sanitize_text_field((string) ($sec['turnstile_site_key'] ?? '')),
            'turnstile_secret_key' => ($sec['turnstile_secret_key'] ?? '') !== '' ? sanitize_text_field((string) $sec['turnstile_secret_key']) : (string) ($existing_sec['turnstile_secret_key'] ?? ''),
        ), false);

        $notice = __('SMTP transport and Turnstile anti-spam configuration saved.', 'outbound-holidays');
    }

    if (isset($_POST['outbound_send_test_email']) && check_admin_referer('outbound_setup_action', 'outbound_setup_nonce')) {
        $target = sanitize_email((string) ($_POST['test_email_address'] ?? get_option('admin_email')));
        if (is_email($target)) {
            $mail_error = '';
            $capture_error = static function ($wp_error) use (&$mail_error): void {
                if ($wp_error instanceof WP_Error) {
                    $mail_error = $wp_error->get_error_message();
                }
            };
            add_action('wp_mail_failed', $capture_error);
            $ok = wp_mail(
                $target,
                'Outbound Holidays WordPress SMTP Health Test',
                "<h2>SMTP Delivery Verified</h2><p>This test confirms WordPress PHPMailer SMTP configuration works on " . esc_html(home_url('/')) . ".</p>",
                array('Content-Type: text/html; charset=UTF-8')
            );
            remove_action('wp_mail_failed', $capture_error);
            $notice = $ok
                ? sprintf(__('Test email dispatched to %s.', 'outbound-holidays'), $target)
                : sprintf(
                    __('Test email failed via wp_mail(). %s', 'outbound-holidays'),
                    $mail_error !== '' ? 'Error: ' . $mail_error : __('Check SMTP host, port, TLS/SSL mode, and credentials.', 'outbound-holidays')
                );
        }
    }

    $db_health = outbound_get_database_table_health();
    $smtp_opts = (array) get_option('outbound_smtp_options', array());
    $sec_opts  = (array) get_option('outbound_security_options', array());
    $core_slugs = array('home', 'blog', 'victoria-falls-accommodation', 'things-to-do-in-victoria-falls', 'victoria-falls-packages', 'victoria-falls-guide', 'client-gallery', 'about', 'contact', 'newsletter-confirmed');
    ?>
    <div class="wrap outbound-admin-wrap">
        <div class="outbound-admin-header">
            <div>
                <h1><?php esc_html_e('Outbound Holidays — Setup, SMTP & Health', 'outbound-holidays'); ?></h1>
                <p><?php esc_html_e('Verify database tables, automatic routes/pages, SMTP transport, and Cloudflare Turnstile spam protection without any third-party plugins.', 'outbound-holidays'); ?></p>
            </div>
        </div>

        <?php if ($notice !== '') : ?>
            <div class="notice notice-info is-dismissible"><p><?php echo esc_html($notice); ?></p></div>
        <?php endif; ?>

        <div class="outbound-admin-card">
            <h2><?php esc_html_e('System Health Checklist', 'outbound-holidays'); ?></h2>
            <table class="widefat striped">
                <thead><tr><th><?php esc_html_e('Component', 'outbound-holidays'); ?></th><th><?php esc_html_e('Status', 'outbound-holidays'); ?></th></tr></thead>
                <tbody>
                    <?php foreach ($db_health as $tbl => $ok) : ?>
                        <tr>
                            <td><code>wp_outbound_<?php echo esc_html($tbl); ?></code></td>
                            <td><span class="outbound-badge <?php echo $ok ? 'outbound-badge-green' : 'outbound-badge-red'; ?>"><?php echo $ok ? 'READY' : 'MISSING'; ?></span></td>
                        </tr>
                    <?php endforeach; ?>
                    <?php foreach ($core_slugs as $slug) : $pg = get_page_by_path($slug, OBJECT, 'page'); ?>
                        <tr>
                            <td>Page <code>/<?php echo esc_html($slug); ?></code></td>
                            <td><span class="outbound-badge <?php echo $pg ? 'outbound-badge-green' : 'outbound-badge-amber'; ?>"><?php echo $pg ? 'PUBLISHED (#' . (int) $pg->ID . ')' : 'MISSING'; ?></span></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <form method="post" style="margin-top:14px;">
                <?php wp_nonce_field('outbound_setup_action', 'outbound_setup_nonce'); ?>
                <button type="submit" name="outbound_run_setup_repair" value="1" class="button button-secondary"><?php esc_html_e('Verify / Repair Tables, Core Pages & Permalinks', 'outbound-holidays'); ?></button>
            </form>
        </div>

        <form method="post" class="outbound-admin-card">
            <?php wp_nonce_field('outbound_setup_action', 'outbound_setup_nonce'); ?>
            <h2><?php esc_html_e('SMTP Mail Transport & Safety Gate', 'outbound-holidays'); ?></h2>
            <p><?php esc_html_e('Tip: You can also define OUTBOUND_SMTP_HOST, OUTBOUND_SMTP_USER, and OUTBOUND_SMTP_PASS in wp-config.php so credentials never sit in the database.', 'outbound-holidays'); ?></p>
            <table class="form-table">
                <tr><th>SMTP Host</th><td><input type="text" name="smtp[host]" value="<?php echo esc_attr((string) ($smtp_opts['host'] ?? '')); ?>" class="regular-text" placeholder="smtp.example.com"></td></tr>
                <tr><th>Port / Security</th><td>
                    <input type="number" name="smtp[port]" value="<?php echo esc_attr((string) ($smtp_opts['port'] ?? 587)); ?>" class="small-text">
                    <select name="smtp[secure]">
                        <option value="tls" <?php selected((string) ($smtp_opts['secure'] ?? 'tls'), 'tls'); ?>>STARTTLS (tls)</option>
                        <option value="ssl" <?php selected((string) ($smtp_opts['secure'] ?? 'tls'), 'ssl'); ?>>SMTPS (ssl)</option>
                        <option value="none" <?php selected((string) ($smtp_opts['secure'] ?? 'tls'), 'none'); ?>>None</option>
                    </select>
                </td></tr>
                <tr><th>SMTP Username</th><td><input type="text" name="smtp[user]" value="<?php echo esc_attr((string) ($smtp_opts['user'] ?? '')); ?>" class="regular-text"></td></tr>
                <tr><th>SMTP Password</th><td><input type="password" name="smtp[pass]" value="" class="regular-text" placeholder="<?php echo !empty($smtp_opts['pass']) ? '•••••••• (saved — leave blank to keep)' : ''; ?>"></td></tr>
                <tr><th>From Email & Name</th><td>
                    <input type="email" name="smtp[from_email]" value="<?php echo esc_attr((string) ($smtp_opts['from_email'] ?? get_option('admin_email'))); ?>" class="regular-text">
                    <input type="text" name="smtp[from_name]" value="<?php echo esc_attr((string) ($smtp_opts['from_name'] ?? 'Outbound Holidays')); ?>" class="regular-text">
                </td></tr>
                <tr><th>Live Newsletter Campaigns</th><td>
                    <label><input type="checkbox" name="smtp[live_send_enabled]" value="1" <?php checked(!empty($smtp_opts['live_send_enabled'])); ?>>
                    <?php esc_html_e('Enable live campaign sending (keep unchecked until sender DNS, SPF/DKIM/DMARC, and sending quotas are verified)', 'outbound-holidays'); ?></label>
                </td></tr>
                <tr><th>Cloudflare Turnstile Site Key</th><td><input type="text" name="sec[turnstile_site_key]" value="<?php echo esc_attr((string) ($sec_opts['turnstile_site_key'] ?? '')); ?>" class="regular-text"></td></tr>
                <tr><th>Cloudflare Turnstile Secret Key</th><td><input type="password" name="sec[turnstile_secret_key]" value="" class="regular-text" placeholder="<?php echo !empty($sec_opts['turnstile_secret_key']) ? '••••••••' : ''; ?>"></td></tr>
            </table>
            <p><button type="submit" name="outbound_save_smtp" value="1" class="button button-primary"><?php esc_html_e('Save SMTP & Security Config', 'outbound-holidays'); ?></button></p>
        </form>

        <form method="post" class="outbound-admin-card">
            <?php wp_nonce_field('outbound_setup_action', 'outbound_setup_nonce'); ?>
            <h2><?php esc_html_e('Send SMTP Diagnostic Email', 'outbound-holidays'); ?></h2>
            <p>
                <input type="email" name="test_email_address" value="<?php echo esc_attr((string) get_option('admin_email')); ?>" class="regular-text">
                <button type="submit" name="outbound_send_test_email" value="1" class="button button-secondary"><?php esc_html_e('Send Test Email Now', 'outbound-holidays'); ?></button>
            </p>
        </form>
    </div>
    <?php
}

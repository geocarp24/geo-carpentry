<?php
/**
 * Plugin Name: Geo Carpentry — Airtable Lead Capture
 * Description: Forwards web form submissions (SureForms, WPCode popup, generic AJAX) to the Geo_Leads Airtable table + Telegram + email.
 * Version:     2.0.0
 * Author:      ALEX / InvestorOS
 *
 * 2026-06-04 v2 rewrite. Changes from v1:
 *   - Targets Geo_Leads (tblaH41HWeVG9ZXLn) — v1 wrote to tblVqrROrVspFXniG (empty Pinnacle-style "Leads" table).
 *   - Uses raw PHP cURL instead of wp_remote_post — wp_remote_* is blocked on Hostinger Premium.
 *   - Maps to Geo_Leads schema (Full Name / Phone / Service Type / City / Source / Notes / Project Description /
 *     Language / Lead Status / Urgency). Service Type is a singleSelect enum.
 *   - Telegram notification to Jorge on every captured lead.
 *   - Email to admin@geocarpentry.com via wp_mail (SureMail SMTP).
 *   - Adds a generic AJAX endpoint `wp_ajax_nopriv_geo_capture_lead` that any WPCode popup / custom form can POST to.
 *   - Adds Contact Form 7 + WPForms fallback hooks so we don't lose leads to alternate plugins.
 *
 * Configuration (set in wp-config.php — NEVER in this file):
 *   define('GEO_AIRTABLE_TOKEN', 'patXXXX...');
 *   define('GEO_AIRTABLE_BASE_ID', 'appAQpveuAec077jF');
 *   define('GEO_AIRTABLE_LEADS_TABLE_ID', 'tblaH41HWeVG9ZXLn');
 *   define('GEO_AIRTABLE_CONTACTS_TABLE_ID', 'tbldetnRGCnmHDgFw');
 *   define('GEO_TELEGRAM_BOT_TOKEN', '...');     // optional — silent if missing
 *   define('GEO_TELEGRAM_CHAT_ID',  '...');      // optional — silent if missing
 *   define('GEO_LEAD_EMAIL_TO',     'admin@geocarpentry.com'); // optional, default below
 *
 * CRM failures are logged to error_log and NEVER block the user-facing form.
 */

if (!defined('ABSPATH')) { exit; }

if (!defined('GEO_AIRTABLE_API_BASE')) {
    define('GEO_AIRTABLE_API_BASE', 'https://api.airtable.com/v0');
}
if (!defined('GEO_LEAD_EMAIL_TO')) {
    define('GEO_LEAD_EMAIL_TO', 'admin@geocarpentry.com');
}

/* ────────────────────────────────────────────────────────────────────────────
 *  cURL helper — wp_remote_post is blocked on Hostinger. Always use raw cURL.
 * ──────────────────────────────────────────────────────────────────────────── */

function geo_http_request($method, $url, $headers = [], $body = null, $timeout = 12) {
    if (!function_exists('curl_init')) {
        error_log('[Geo Airtable] cURL extension unavailable — cannot reach Airtable.');
        return ['code' => 0, 'body' => '', 'err' => 'curl_missing'];
    }
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 6);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    if ($headers) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    return ['code' => (int)$code, 'body' => (string)$resp, 'err' => $err];
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Service Type mapping — free-form input → Geo_Leads singleSelect enum.
 * ──────────────────────────────────────────────────────────────────────────── */

function geo_map_service_type($raw) {
    if (!$raw) { return 'unknown'; }
    $r = strtolower(trim($raw));
    $map = [
        'kitchen'    => 'kitchen_remodeling',
        'bath'       => 'bathroom_remodeling',
        'deck'       => 'deck_building',
        'porch'      => 'deck_building',
        'finish'     => 'finish_carpentry',
        'trim'       => 'finish_carpentry',
        'carpentry'  => 'finish_carpentry',
        'cabinet'    => 'finish_carpentry',
        'renov'      => 'home_renovation',
        'remodel'    => 'home_renovation',
        'addition'   => 'home_renovation',
        'general'    => 'general_construction',
        'construc'   => 'general_construction',
        'fram'       => 'general_construction',
        'drywall'    => 'general_construction',
        'roof'       => 'general_construction',
        'repair'     => 'general_construction',
    ];
    foreach ($map as $needle => $val) {
        if (strpos($r, $needle) !== false) { return $val; }
    }
    return 'other';
}

function geo_detect_language($lead) {
    $blob = strtolower(($lead['name'] ?? '') . ' ' . ($lead['description'] ?? '') . ' ' . ($lead['subject'] ?? ''));
    $es_markers = ['hola', 'gracias', 'cocina', 'baño', 'bano', 'remodel', 'presupuesto', 'español', 'espanol', 'cuanto cuesta', 'casa'];
    foreach ($es_markers as $m) {
        if (strpos($blob, $m) !== false) {
            return 'Spanish';
        }
    }
    return 'English';
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Submission normalization. Accepts arbitrary form-data shapes.
 * ──────────────────────────────────────────────────────────────────────────── */

function geo_normalize_submission($form_data, $form_id = 0, $source_hint = 'Website Form') {
    $get = function($keys, $default = '') use ($form_data) {
        foreach ((array)$keys as $k) {
            foreach ($form_data as $fk => $fv) {
                if (stripos($fk, $k) !== false && !empty($fv)) {
                    return is_array($fv) ? implode(', ', $fv) : trim((string)$fv);
                }
            }
        }
        return $default;
    };

    return [
        'name'        => $get(['name', 'full-name', 'fullname', 'nombre']),
        'email'       => $get(['email', 'correo', 'e-mail']),
        'phone'       => $get(['phone', 'tel', 'telefono', 'telephone', 'mobile', 'celular']),
        'service'     => $get(['service', 'servicio', 'project-type', 'project_type', 'tipo']),
        'city'        => $get(['city', 'ciudad', 'location', 'ubicacion']),
        'address'     => $get(['address', 'direccion', 'street']),
        'budget'      => $get(['budget', 'presupuesto', 'price-range']),
        'timeline'    => $get(['timeline', 'when', 'cuando']),
        'description' => $get(['message', 'description', 'descripcion', 'project', 'proyecto', 'textarea', 'details', 'comments']),
        'subject'     => $get(['subject', 'asunto']),
        'form_id'     => $form_id,
        'source'      => $source_hint,
    ];
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Airtable: Geo_Leads create (NO contact link — Geo_Leads is standalone).
 * ──────────────────────────────────────────────────────────────────────────── */

function geo_airtable_create_geolead($lead) {
    if (!defined('GEO_AIRTABLE_TOKEN') || !defined('GEO_AIRTABLE_BASE_ID') || !defined('GEO_AIRTABLE_LEADS_TABLE_ID')) {
        error_log('[Geo Airtable] missing config constants — skipping.');
        return null;
    }

    $description = trim(
        ($lead['subject'] ? '[' . $lead['subject'] . "]\n" : '')
        . ($lead['description'] ?: '')
    );

    $notes_parts = [];
    if (!empty($lead['budget']))   { $notes_parts[] = 'Budget: ' . $lead['budget']; }
    if (!empty($lead['timeline'])) { $notes_parts[] = 'Timeline hint: ' . $lead['timeline']; }
    if (!empty($lead['email']))    { $notes_parts[] = 'Email: ' . $lead['email']; }
    if (!empty($lead['form_id']))  { $notes_parts[] = 'Form ID: ' . $lead['form_id']; }
    $notes_intro = '[' . current_time('Y-m-d H:i') . '] Web form submission';
    $notes = $notes_intro . ($notes_parts ? "\n" . implode(' · ', $notes_parts) : '');

    $fields = [
        'Full Name'           => $lead['name']    ?: ('Web lead ' . current_time('Y-m-d')),
        'Phone'               => $lead['phone']   ?: '',
        'Service Type'        => geo_map_service_type($lead['service']),
        'City'                => $lead['city']    ?: '',
        'Home Address'        => $lead['address'] ?: '',
        'Project Description' => $description,
        'Notes'               => $notes,
        'Language'            => geo_detect_language($lead),
        'Lead Status'         => 'New',
        'Urgency'             => 'warm',
        'Source'              => $lead['source'] ?: 'Website Form',
        'Last Contact Date'   => current_time('Y-m-d'),
    ];

    // Drop empty strings; keep enums.
    $fields = array_filter($fields, fn($v) => $v !== '' && $v !== null);

    $url = GEO_AIRTABLE_API_BASE . '/' . GEO_AIRTABLE_BASE_ID . '/' . GEO_AIRTABLE_LEADS_TABLE_ID;
    $resp = geo_http_request('POST', $url, [
        'Authorization: Bearer ' . GEO_AIRTABLE_TOKEN,
        'Content-Type: application/json',
    ], wp_json_encode(['fields' => $fields, 'typecast' => true]), 15);

    if ($resp['code'] < 200 || $resp['code'] >= 300) {
        error_log('[Geo Airtable] create_geolead failed (' . $resp['code'] . '): ' . substr($resp['body'], 0, 400) . ' err=' . $resp['err']);
        return null;
    }
    $body = json_decode($resp['body'], true);
    return $body['id'] ?? null;
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Telegram notification — silent if creds missing.
 * ──────────────────────────────────────────────────────────────────────────── */

function geo_telegram_notify_lead($lead, $airtable_id) {
    if (!defined('GEO_TELEGRAM_BOT_TOKEN') || !defined('GEO_TELEGRAM_CHAT_ID')) {
        return;
    }
    $name    = $lead['name']    ?: '(no name)';
    $phone   = $lead['phone']   ?: '(no phone)';
    $service = geo_map_service_type($lead['service']);
    $city    = $lead['city']    ?: '?';
    $source  = $lead['source']  ?: 'Website Form';

    $lines = [
        "🔥 *New Geo lead*",
        "*Name:* " . $name,
        "*Phone:* `" . $phone . "`",
        "*Service:* " . $service,
        "*City:* " . $city,
        "*Source:* " . $source,
    ];
    if (!empty($lead['description'])) {
        $lines[] = "*Notes:* " . mb_substr($lead['description'], 0, 240);
    }
    if ($airtable_id) {
        $lines[] = "https://airtable.com/" . GEO_AIRTABLE_BASE_ID . "/" . GEO_AIRTABLE_LEADS_TABLE_ID . "/" . $airtable_id;
    }
    $text = implode("\n", $lines);

    $url = 'https://api.telegram.org/bot' . GEO_TELEGRAM_BOT_TOKEN . '/sendMessage';
    $body = http_build_query([
        'chat_id'    => GEO_TELEGRAM_CHAT_ID,
        'text'       => $text,
        'parse_mode' => 'Markdown',
        'disable_web_page_preview' => 'true',
    ]);
    $resp = geo_http_request('POST', $url, [
        'Content-Type: application/x-www-form-urlencoded',
    ], $body, 8);
    if ($resp['code'] < 200 || $resp['code'] >= 300) {
        error_log('[Geo Telegram] notify failed (' . $resp['code'] . '): ' . substr($resp['body'], 0, 200));
    }
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Email notification — uses wp_mail (SureMail SMTP).
 * ──────────────────────────────────────────────────────────────────────────── */

function geo_email_notify_lead($lead, $airtable_id) {
    $to = GEO_LEAD_EMAIL_TO;
    $subject = 'New web lead — ' . ($lead['name'] ?: 'no name') . ' / ' . geo_map_service_type($lead['service']);

    $airtable_url = $airtable_id
        ? 'https://airtable.com/' . GEO_AIRTABLE_BASE_ID . '/' . GEO_AIRTABLE_LEADS_TABLE_ID . '/' . $airtable_id
        : '(failed to create Airtable record — see error_log)';

    $body  = "<h2>New web lead</h2>";
    $body .= "<table cellpadding='6' style='border-collapse:collapse'>";
    $rows = [
        'Name'        => $lead['name'],
        'Phone'       => $lead['phone'],
        'Email'       => $lead['email'],
        'Service'     => geo_map_service_type($lead['service']) . ' (raw: ' . htmlspecialchars($lead['service'] ?: '') . ')',
        'City'        => $lead['city'],
        'Address'     => $lead['address'],
        'Budget'      => $lead['budget'],
        'Timeline'    => $lead['timeline'],
        'Description' => $lead['description'],
        'Source'      => $lead['source'],
        'Form ID'     => $lead['form_id'],
        'Airtable'    => '<a href="' . esc_url($airtable_url) . '">' . esc_html($airtable_url) . '</a>',
    ];
    foreach ($rows as $k => $v) {
        if ($v === '' || $v === null) { continue; }
        $val = ($k === 'Airtable') ? $v : esc_html((string)$v);
        $body .= "<tr><td style='border:1px solid #ddd;background:#f5f5f5'><strong>{$k}</strong></td><td style='border:1px solid #ddd'>{$val}</td></tr>";
    }
    $body .= "</table><p style='margin-top:16px;color:#666;font-size:12px'>Sent by geo-airtable-lead-capture mu-plugin v2.</p>";

    $headers = ['Content-Type: text/html; charset=UTF-8'];
    $ok = wp_mail($to, $subject, $body, $headers);
    if (!$ok) {
        error_log('[Geo Email] wp_mail returned false for lead to ' . $to);
    }
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Pipeline orchestrator — called by every form hook + AJAX endpoint.
 * ──────────────────────────────────────────────────────────────────────────── */

function geo_process_lead($form_data, $form_id = 0, $source_hint = 'Website Form') {
    try {
        if (!defined('GEO_AIRTABLE_TOKEN')) {
            error_log('[Geo Airtable] skipped: GEO_AIRTABLE_TOKEN not defined in wp-config.php');
            return null;
        }
        $lead = geo_normalize_submission((array)$form_data, $form_id, $source_hint);

        if (empty($lead['phone']) && empty($lead['email']) && empty($lead['name'])) {
            error_log('[Geo Airtable] skipping — no identifying fields. keys=' . implode(',', array_keys((array)$form_data)));
            return null;
        }

        $airtable_id = geo_airtable_create_geolead($lead);
        geo_telegram_notify_lead($lead, $airtable_id);
        geo_email_notify_lead($lead, $airtable_id);

        if ($airtable_id) {
            error_log('[Geo Airtable] lead captured: ' . $airtable_id . ' (source=' . $source_hint . ', form=' . $form_id . ')');
        }
        return $airtable_id;
    } catch (\Throwable $e) {
        error_log('[Geo Airtable] exception: ' . $e->getMessage());
        return null;
    }
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Hooks — SureForms / Contact Form 7 / WPForms / generic AJAX.
 * ──────────────────────────────────────────────────────────────────────────── */

// SureForms — v1's primary hook.
add_action('srfm_after_submission_process', function($form_data) {
    $form_id = is_array($form_data) ? (int)($form_data['form_id'] ?? 0) : 0;
    geo_process_lead((array)$form_data, $form_id, 'Website (SureForms)');
}, 10, 1);

// Contact Form 7.
add_action('wpcf7_mail_sent', function($contact_form) {
    if (!is_object($contact_form)) { return; }
    $submission = class_exists('\WPCF7_Submission') ? \WPCF7_Submission::get_instance() : null;
    $data = $submission ? $submission->get_posted_data() : [];
    geo_process_lead($data, (int)$contact_form->id(), 'Website (CF7)');
}, 10, 1);

// WPForms.
add_action('wpforms_process_complete', function($fields, $entry, $form_data, $entry_id) {
    $flat = [];
    foreach ((array)$fields as $f) {
        $name = is_array($f) ? ($f['name'] ?? '') : '';
        $val  = is_array($f) ? ($f['value'] ?? '') : '';
        if ($name) { $flat[$name] = $val; }
    }
    geo_process_lead($flat, (int)($form_data['id'] ?? 0), 'Website (WPForms)');
}, 10, 4);

// Generic AJAX — for WPCode popups and custom HTML forms.
// POST /wp-admin/admin-ajax.php with action=geo_capture_lead + name/phone/email/service/city/message
add_action('wp_ajax_geo_capture_lead', 'geo_ajax_capture_lead');
add_action('wp_ajax_nopriv_geo_capture_lead', 'geo_ajax_capture_lead');
function geo_ajax_capture_lead() {
    // Reject obvious bots: require either phone OR email.
    $data = $_POST;
    if (empty($data['phone']) && empty($data['email'])) {
        wp_send_json(['ok' => false, 'error' => 'phone_or_email_required'], 400);
    }
    $source = sanitize_text_field($data['source'] ?? 'Website (Popup/AJAX)');
    $airtable_id = geo_process_lead($data, 0, $source);
    wp_send_json([
        'ok' => (bool)$airtable_id,
        'id' => $airtable_id ?: null,
    ]);
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Diagnostic endpoint — GET /wp-admin/admin-ajax.php?action=geo_airtable_ping
 *  Returns config state, no secrets.
 * ──────────────────────────────────────────────────────────────────────────── */
add_action('wp_ajax_geo_airtable_ping', 'geo_airtable_ping');
add_action('wp_ajax_nopriv_geo_airtable_ping', 'geo_airtable_ping');
function geo_airtable_ping() {
    wp_send_json([
        'plugin'           => 'geo-airtable-lead-capture',
        'version'          => '2.0.0',
        'loaded'           => true,
        'curl_available'   => function_exists('curl_init'),
        'token_set'        => defined('GEO_AIRTABLE_TOKEN'),
        'base_set'         => defined('GEO_AIRTABLE_BASE_ID'),
        'leads_table'      => defined('GEO_AIRTABLE_LEADS_TABLE_ID') ? GEO_AIRTABLE_LEADS_TABLE_ID : null,
        'telegram_set'     => defined('GEO_TELEGRAM_BOT_TOKEN') && defined('GEO_TELEGRAM_CHAT_ID'),
        'email_to'         => GEO_LEAD_EMAIL_TO,
    ]);
}

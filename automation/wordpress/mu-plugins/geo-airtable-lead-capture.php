<?php
/**
 * Plugin Name: Geo Carpentry — Airtable Lead Capture
 * Description: Forwards SureForms submissions to Airtable Leads table for Geo Carpentry CRM.
 * Version:     1.0.0
 * Author:      ALEX / InvestorOS
 *
 * Configuration: set these constants in wp-config.php (NOT in this file):
 *   define('GEO_AIRTABLE_TOKEN', 'patXXXX...');
 *   define('GEO_AIRTABLE_BASE_ID', 'appAQpveuAec077jF');
 *   define('GEO_AIRTABLE_LEADS_TABLE_ID', 'tblVqrROrVspFXniG');
 *   define('GEO_AIRTABLE_CONTACTS_TABLE_ID', 'tbldetnRGCnmHDgFw');
 *
 * Behavior: on every SureForms submission, attempt to upsert a Contact (by phone or email)
 * and create a Lead linked to that Contact. Failures are logged to error_log but never
 * block the user-facing form (we never let the form fail because of CRM issues).
 */

if (!defined('ABSPATH')) { exit; }

if (!defined('GEO_AIRTABLE_API_BASE')) {
    define('GEO_AIRTABLE_API_BASE', 'https://api.airtable.com/v0');
}

/**
 * Map free-form service string to the singleSelect options defined on the Leads table.
 * Returns an empty string if no match — caller can then drop the field.
 */
function geo_map_service($raw) {
    if (!$raw) { return ''; }
    $r = strtolower(trim($raw));
    $map = [
        'kitchen'   => 'Kitchen Remodel',
        'bathroom'  => 'Bathroom Remodel',
        'deck'      => 'Deck Building',
        'deck repair' => 'Deck Repair',
        'addition'  => 'Home Addition',
        'framing'   => 'Framing',
        'drywall'   => 'Drywall',
        'paint'     => 'Painting',
        'roof'      => 'Roofing',
        'finish'    => 'Finish Carpentry',
        'trim'      => 'Finish Carpentry',
        'carpentry' => 'Finish Carpentry',
        'repair'    => 'General Repair',
        'general'   => 'General Repair',
        'custom'    => 'Custom',
        'remodel'   => 'Custom',
        'renovation' => 'Custom',
    ];
    foreach ($map as $needle => $option) {
        if (strpos($r, $needle) !== false) {
            return $option;
        }
    }
    return 'Custom';
}

/**
 * Map SureForms submission to a normalized lead payload.
 * SureForms passes submission data via the `srfm_form_submit` action with form id + data array.
 */
function geo_airtable_normalize_submission($form_data, $form_id) {
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
        'name'        => $get(['name', 'full-name', 'nombre']),
        'email'       => $get(['email', 'correo']),
        'phone'       => $get(['phone', 'tel', 'telefono', 'telephone', 'mobile']),
        'service'     => $get(['service', 'servicio', 'project-type', 'tipo']),
        'city'        => $get(['city', 'ciudad', 'location', 'ubicacion']),
        'budget'      => $get(['budget', 'presupuesto', 'price-range']),
        'description' => $get(['message', 'description', 'descripcion', 'project', 'proyecto', 'textarea', 'details']),
        'subject'     => $get(['subject', 'asunto']),
        'form_id'     => $form_id,
    ];
}

/**
 * Look up existing contact by phone or email. Returns Airtable record id or null.
 */
function geo_airtable_find_contact($lead) {
    if (!defined('GEO_AIRTABLE_TOKEN') || !defined('GEO_AIRTABLE_BASE_ID') || !defined('GEO_AIRTABLE_CONTACTS_TABLE_ID')) {
        return null;
    }
    $filters = [];
    if (!empty($lead['phone']))  { $filters[] = "{Phone} = '" . addslashes($lead['phone']) . "'"; }
    if (!empty($lead['email']))  { $filters[] = "LOWER({Email}) = LOWER('" . addslashes($lead['email']) . "')"; }
    if (empty($filters)) { return null; }
    $formula = count($filters) > 1 ? 'OR(' . implode(',', $filters) . ')' : $filters[0];

    $url = GEO_AIRTABLE_API_BASE . '/' . GEO_AIRTABLE_BASE_ID . '/' . GEO_AIRTABLE_CONTACTS_TABLE_ID
         . '?maxRecords=1&filterByFormula=' . rawurlencode($formula);
    $resp = wp_remote_get($url, [
        'timeout' => 12,
        'headers' => [ 'Authorization' => 'Bearer ' . GEO_AIRTABLE_TOKEN ],
    ]);
    if (is_wp_error($resp)) {
        error_log('[Geo Airtable] find_contact error: ' . $resp->get_error_message());
        return null;
    }
    $body = json_decode(wp_remote_retrieve_body($resp), true);
    return $body['records'][0]['id'] ?? null;
}

/**
 * Create a Contact in Airtable; returns new record id or null.
 */
function geo_airtable_create_contact($lead) {
    if (!defined('GEO_AIRTABLE_CONTACTS_TABLE_ID')) { return null; }
    $fields = [
        'Name'   => $lead['name'] ?: 'Web lead — name pending',
        'Email'  => $lead['email'] ?: '',
        'Phone'  => $lead['phone'] ?: '',
        'City'   => $lead['city'] ?: '',
        'Source' => 'Website',
    ];
    $fields = array_filter($fields, fn($v) => $v !== '');

    $url = GEO_AIRTABLE_API_BASE . '/' . GEO_AIRTABLE_BASE_ID . '/' . GEO_AIRTABLE_CONTACTS_TABLE_ID;
    $resp = wp_remote_post($url, [
        'timeout' => 15,
        'headers' => [
            'Authorization' => 'Bearer ' . GEO_AIRTABLE_TOKEN,
            'Content-Type'  => 'application/json',
        ],
        'body' => wp_json_encode(['fields' => $fields, 'typecast' => true]),
    ]);
    if (is_wp_error($resp)) {
        error_log('[Geo Airtable] create_contact error: ' . $resp->get_error_message());
        return null;
    }
    $body = json_decode(wp_remote_retrieve_body($resp), true);
    if (empty($body['id'])) {
        error_log('[Geo Airtable] create_contact unexpected response: ' . wp_remote_retrieve_body($resp));
        return null;
    }
    return $body['id'];
}

/**
 * Create a Lead linked to a Contact. Returns lead record id or null.
 */
function geo_airtable_create_lead($lead, $contact_id) {
    if (!defined('GEO_AIRTABLE_LEADS_TABLE_ID')) { return null; }

    $title = ($lead['service'] ?: 'Web lead');
    if ($lead['city']) { $title .= ' — ' . $lead['city']; }
    if ($lead['name']) { $title .= ' (' . $lead['name'] . ')'; }

    $fields = [
        'Lead title'  => $title,
        'Stage'       => 'New',
        'Service'     => geo_map_service($lead['service']),
        'Description' => trim(
            ($lead['subject'] ? '[' . $lead['subject'] . "]\n" : '')
            . ($lead['description'] ?: '')
            . ($lead['budget'] ? "\nBudget hint: " . $lead['budget'] : '')
        ),
    ];
    if ($contact_id) { $fields['Contact'] = [$contact_id]; }
    $fields = array_filter($fields, fn($v) => $v !== '' && $v !== []);

    $url = GEO_AIRTABLE_API_BASE . '/' . GEO_AIRTABLE_BASE_ID . '/' . GEO_AIRTABLE_LEADS_TABLE_ID;
    $resp = wp_remote_post($url, [
        'timeout' => 15,
        'headers' => [
            'Authorization' => 'Bearer ' . GEO_AIRTABLE_TOKEN,
            'Content-Type'  => 'application/json',
        ],
        'body' => wp_json_encode(['fields' => $fields, 'typecast' => true]),
    ]);
    if (is_wp_error($resp)) {
        error_log('[Geo Airtable] create_lead error: ' . $resp->get_error_message());
        return null;
    }
    $body = json_decode(wp_remote_retrieve_body($resp), true);
    if (empty($body['id'])) {
        error_log('[Geo Airtable] create_lead unexpected response: ' . wp_remote_retrieve_body($resp));
        return null;
    }
    return $body['id'];
}

/**
 * Main hook: on SureForms submission, forward to Airtable.
 * SureForms fires `srfm_after_submission_process` with the full form_data array
 * (form_id is appended as $form_data['form_id']).
 */
add_action('srfm_after_submission_process', function($form_data) {
    if (!defined('GEO_AIRTABLE_TOKEN')) {
        error_log('[Geo Airtable] skipped: GEO_AIRTABLE_TOKEN not defined in wp-config.php');
        return;
    }
    try {
        $form_id = is_array($form_data) ? (int)($form_data['form_id'] ?? 0) : 0;
        $lead = geo_airtable_normalize_submission((array)$form_data, $form_id);
        if (empty($lead['email']) && empty($lead['phone']) && empty($lead['name'])) {
            error_log('[Geo Airtable] skipping submission — no identifying fields');
            return;
        }
        $contact_id = geo_airtable_find_contact($lead);
        if (!$contact_id) {
            $contact_id = geo_airtable_create_contact($lead);
        }
        $lead_id = geo_airtable_create_lead($lead, $contact_id);
        if ($lead_id) {
            error_log('[Geo Airtable] lead created: ' . $lead_id . ' (contact=' . ($contact_id ?: 'none') . ', form=' . $form_id . ')');
        }
    } catch (\Throwable $e) {
        error_log('[Geo Airtable] exception: ' . $e->getMessage());
    }
}, 10, 1);

/**
 * Diagnostic endpoint: /wp-admin/admin-ajax.php?action=geo_airtable_ping
 * Verifies that the plugin is loaded and credentials are configured (no secrets returned).
 */
add_action('wp_ajax_geo_airtable_ping', function() {
    wp_send_json([
        'plugin_loaded' => true,
        'token_set'     => defined('GEO_AIRTABLE_TOKEN'),
        'base_set'      => defined('GEO_AIRTABLE_BASE_ID'),
        'leads_set'     => defined('GEO_AIRTABLE_LEADS_TABLE_ID'),
        'contacts_set'  => defined('GEO_AIRTABLE_CONTACTS_TABLE_ID'),
    ]);
});

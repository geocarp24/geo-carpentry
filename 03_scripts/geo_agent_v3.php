<?php
// ============================================================
// GEO AI AGENT v3 — Geo Carpentry LLC
// SMS webhook receiver for incoming leads.
//
// v3 changes (2026-07-30) — "Human Takeover / Pause" feature:
//   - When Jorge (or staff) manually texts a client from OpenPhone
//     using the business number, the bot detects it and PAUSES
//     itself for that client for 48 hours — no more double replies.
//   - Auto-resume after 48h with no new manual message.
//   - Manual resume any time: Jorge texts "/reanudar", "/resume",
//     or "geo on" to that client and the bot reactivates instantly.
//   - Pause state is stored inside the existing Airtable "Notes"
//     field (no new Airtable fields needed) as tags like:
//       [GEO_PAUSE:2026-07-30T14:32:00-05:00]
//       [GEO_RESUME:2026-07-30T16:00:00-05:00]
//   - A tiny local marker file prevents the bot's OWN replies from
//     being mistaken for a manual takeover (self-echo guard, 15s).
//
// URL: https://geocarpentry.com/Tools/geo_agent.php
// Webhook: Connect OpenPhone to this URL.
//   IMPORTANT: OpenPhone must have the "Outbound Message" /
//   "message.sent" webhook event ENABLED for the pause feature to
//   work (Settings → Webhooks in OpenPhone). Without it, the bot
//   never finds out Jorge sent a manual reply.
//
// Flow: SMS received → dedup → Airtable lookup/upsert
//       → pause check → conversation history → Claude reply
//       → SMS send → Telegram escalation if hot lead → CRM update → log
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/geo_logger.php';
require_once __DIR__ . '/lib/geo_deduplication.php';
require_once __DIR__ . '/lib/geo_airtable.php';
require_once __DIR__ . '/lib/geo_conversations.php';
require_once __DIR__ . '/lib/geo_claude.php';
require_once __DIR__ . '/lib/geo_sms.php';
require_once __DIR__ . '/lib/geo_telegram.php';
header('Content-Type: application/json');

// ── Human-takeover helpers (self-contained, no lib changes needed) ─
const GEO_PAUSE_HOURS = 48;      // auto-resume window
const GEO_ECHO_WINDOW_SEC = 15;  // how long a "bot just sent" marker is valid

function geo_marker_dir(): string {
    $dir = defined('GEO_CONV_DIR') ? GEO_CONV_DIR : __DIR__ . '/geo_conversations';
    if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
    return $dir;
}

// Called right after the bot sends its own SMS reply, so the outbound
// webhook for THIS message isn't mistaken for a manual takeover.
function geo_mark_bot_sent(string $phone): void {
    $clean = preg_replace('/[^0-9]/', '', $phone);
    @file_put_contents(geo_marker_dir() . '/.bot_sent_' . $clean . '.tmp', (string) time());
}

function geo_was_recent_bot_send(string $phone): bool {
    $clean = preg_replace('/[^0-9]/', '', $phone);
    $file  = geo_marker_dir() . '/.bot_sent_' . $clean . '.tmp';
    if (!is_file($file)) return false;
    $ts = (int) @file_get_contents($file);
    return ($ts > 0) && ((time() - $ts) <= GEO_ECHO_WINDOW_SEC);
}

// Reads the Notes field and figures out if the bot is currently paused.
function geo_agent_pause_state(string $notes): array {
    if (preg_match_all('/\[GEO_(PAUSE|RESUME):([^\]]+)\]/', $notes, $matches, PREG_SET_ORDER) === 0) {
        return ['paused' => false, 'since' => null];
    }
    $last = end($matches); // most recent tag wins — notes are appended chronologically
    if ($last[1] === 'RESUME') {
        return ['paused' => false, 'since' => null];
    }
    try {
        $since = new DateTime($last[2]);
    } catch (Exception $e) {
        return ['paused' => false, 'since' => null];
    }
    $hoursElapsed = (time() - $since->getTimestamp()) / 3600;
    if ($hoursElapsed >= GEO_PAUSE_HOURS) {
        return ['paused' => false, 'since' => $since, 'auto_resumed' => true];
    }
    return ['paused' => true, 'since' => $since];
}

// ── Health check ────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($_GET)) {
    echo json_encode(['ok' => true, 'service' => 'geo_agent', 'version' => 3]);
    exit;
}

// ── Reset conversation memory (admin only) ──────────────────
// geo_agent.php?token=GEO_RESET_TOKEN&reset=all
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['reset'])) {
    if (($_GET['token'] ?? '') !== (defined('GEO_RESET_TOKEN') ? GEO_RESET_TOKEN : 'geo2026')) {
        http_response_code(403);
        echo json_encode(['error' => 'unauthorized']);
        exit;
    }
    $r   = $_GET['reset'];
    $dir = defined('GEO_CONV_DIR') ? GEO_CONV_DIR : __DIR__ . '/geo_conversations';
    if ($r === 'all') {
        $c = 0;
        foreach (glob($dir . '/*.json') ?: [] as $f) { @unlink($f); $c++; }
        echo json_encode(['reset' => 'all', 'deleted' => $c]);
    } else {
        $phone = preg_replace('/[^0-9]/', '', $r);
        $path  = $dir . '/' . $phone . '.json';
        $ok    = is_file($path) ? @unlink($path) : false;
        echo json_encode(['reset' => $phone, 'deleted' => $ok]);
    }
    exit;
}

// ── 1. Parse webhook body ───────────────────────────────────
$raw   = file_get_contents('php://input');
$event = json_decode($raw, true);
if (!is_array($event)) {
    http_response_code(400);
    geo_log_warn('webhook_invalid_json', ['body_preview' => substr($raw, 0, 200)]);
    echo json_encode(['error' => 'invalid json']);
    exit;
}

// ── 2. Provider-agnostic field extraction ──────────────────
// Supports OpenPhone (Quo-style) and Telnyx webhook formats.
$eventType = $event['type']               // OpenPhone
          ?? $event['data']['event_type'] // Telnyx
          ?? '';

$payload  = $event['data']['payload'] ?? null;
$dataObj  = is_array($payload)
          ? $payload
          : ($event['data']['object'] ?? $event['data'] ?? []);

$messageId = $dataObj['id']            ?? ($event['id'] ?? uniqid());
$fromPhone = $dataObj['from']          ?? ($dataObj['from']['phone_number'] ?? '');
$body      = trim((string) ($dataObj['body'] ?? $dataObj['text'] ?? ''));
$direction = $dataObj['direction']     ?? 'inbound';
$isInbound = in_array($direction, ['incoming', 'inbound']);

geo_log_info('webhook_received', [
    'event_type' => $eventType,
    'from'       => $fromPhone,
    'direction'  => $direction,
    'body_len'   => strlen($body),
]);

// Only handle message events (inbound replies AND outbound sends —
// outbound is needed to detect Jorge's manual takeover, see below)
if (strpos($eventType, 'message.received') === false
    && strpos($eventType, 'message.inbound') === false
    && strpos($eventType, 'message.sent') === false
    && strpos($eventType, 'message.delivered') === false) {
    geo_log_info('webhook_ignored_type', ['type' => $eventType]);
    echo json_encode(['ok' => true, 'ignored' => $eventType]);
    exit;
}

$ownNumbers = defined('GEO_OWN_NUMBERS') ? GEO_OWN_NUMBERS : [];

// ── 2b. OUTBOUND message handling — Jorge's manual takeover ────────
// If this is an outbound message sent FROM our business number, it's
// either (a) an echo of the bot's own reply, or (b) Jorge/staff
// texting the client manually from the OpenPhone app.
if (!$isInbound) {
    if (!in_array($fromPhone, (array) $ownNumbers)) {
        echo json_encode(['ok' => true, 'ignored' => 'outbound_not_ours']);
        exit;
    }

    $toRaw   = $dataObj['to'] ?? [];
    $toPhone = is_array($toRaw) ? ($toRaw[0] ?? '') : $toRaw;
    if (empty($toPhone)) {
        echo json_encode(['ok' => true, 'ignored' => 'outbound_no_recipient']);
        exit;
    }

    // (a) Bot's own reply echoing back — ignore, do NOT pause
    if (geo_was_recent_bot_send($toPhone)) {
        echo json_encode(['ok' => true, 'ignored' => 'outbound_self_echo']);
        exit;
    }

    // (b) Real manual message from Jorge/staff — pause or resume
    $lead = geo_at_find_lead_by_phone($toPhone);
    if ($lead) {
        $notes       = $lead['fields']['Notes'] ?? '';
        $isResumeCmd = preg_match('/\/reanudar|\/resume|\bgeo\s*on\b/i', $body) === 1;
        $tag = $isResumeCmd
            ? '[GEO_RESUME:' . date('c') . ']'
            : '[GEO_PAUSE:' . date('c') . ']';
        geo_at_update_lead($lead['id'], [
            'Notes' => geo_at_append_notes($notes, $tag),
        ]);
        geo_log_info($isResumeCmd ? 'agent_resumed_manual' : 'agent_paused_manual', ['phone' => mb_substr($toPhone, -4)]);
    } else {
        geo_log_info('outbound_manual_no_lead_found', ['phone' => mb_substr($toPhone, -4)]);
    }

    echo json_encode(['ok' => true, 'manual_takeover' => true, 'resumed' => $isResumeCmd ?? false]);
    exit;
}

if (empty($fromPhone) || $body === '') {
    http_response_code(400);
    geo_log_warn('webhook_missing_fields', ['from' => $fromPhone, 'body_empty' => $body === '']);
    echo json_encode(['error' => 'missing from or body']);
    exit;
}

// Self-loop: ignore inbound messages that somehow list our own number as sender
if (in_array($fromPhone, (array) $ownNumbers)) {
    geo_log_info('webhook_self_loop_ignored', ['from' => $fromPhone]);
    echo json_encode(['ok' => true, 'ignored' => 'self']);
    exit;
}

// ── 3. Deduplication ───────────────────────────────────────
if (!geo_dedup_claim($messageId)) {
    echo json_encode(['ok' => true, 'ignored' => 'duplicate']);
    exit;
}

// ── 4. TCPA opt-out fast path ──────────────────────────────
$optOutRx = '/\b(stop|stopall|unsubscribe|cancel|quit|end|opt[- ]?out|remove me|do ?not (text|call|contact|message)|don\'?t (text|call|contact|message) me|fuck off|leave me alone|wrong number|not interested|wtf)\b/i';
$isBareNo  = preg_match('/^\s*(no|nope|no thanks|no thank you|nah|na)\s*[.!]?\s*$/i', $body) === 1;
$isHardNo  = preg_match($optOutRx, $body) === 1;
if ($isHardNo || $isBareNo) {
    geo_log_warn('opt_out_detected', ['phone' => $fromPhone, 'body' => mb_substr($body, 0, 120)]);
    $lead = geo_at_find_lead_by_phone($fromPhone);
    if ($lead) {
        geo_at_update_lead($lead['id'], [
            'Lead Status'       => 'DNC',
            'Do Not Contact'    => true,
            'Last Contact Date' => date('Y-m-d'),
            'Notes'             => geo_at_append_notes(
                $lead['fields']['Notes'] ?? '',
                'Auto-DNC: replied "' . mb_substr($body, 0, 80) . '" — TCPA opt-out.'
            ),
        ]);
    }
    echo json_encode(['ok' => true, 'opt_out' => true]);
    exit;
}

// ── 5. Airtable lead lookup / create ──────────────────────
$lead      = geo_at_find_lead_by_phone($fromPhone);
$leadId    = $lead['id']      ?? null;
$fields    = $lead['fields']  ?? [];
$contactName     = $fields['Full Name']     ?? '';
$homeAddress     = $fields['Home Address']  ?? '';
$city            = $fields['City']          ?? 'Green Bay';
$status          = $fields['Lead Status']   ?? 'New';
$notes           = $fields['Notes']         ?? '';
$language        = $fields['Language']      ?? 'English';
$serviceType     = $fields['Service Type']  ?? '';
$budgetRange     = $fields['Budget Range']  ?? '';
$timeline        = $fields['Timeline']      ?? '';
$urgency         = $fields['Urgency']       ?? '';
$isDNC           = !empty($fields['Do Not Contact']);
$isReturning     = in_array($status, ['Contacted', 'Qualified', 'Appointment Set']);

// Normalize name — treat placeholder as unknown
if (empty($contactName) || strpos($contactName, 'Inbound ') !== false) {
    $contactName = 'there';
}

if ($isDNC) {
    geo_log_info('dnc_contact_ignored', ['phone' => $fromPhone]);
    echo json_encode(['ok' => true, 'ignored' => 'dnc']);
    exit;
}

// ── FIX v2: Create lead with empty Full Name (not placeholder) ──
if ($leadId === null) {
    $created = geo_at_create_lead($fromPhone, [
        'Full Name'   => '',              // v2: empty — agent will ask for name
        'Lead Status' => 'New',
        'Source'      => 'SMS Inbound',
    ]);
    if (is_array($created) && isset($created['id'])) {
        $leadId = $created['id'];
    }
    $contactName = 'there';
}

// ── 5b. Human-takeover pause check ──────────────────────────
// If Jorge manually took over this conversation, the bot stays quiet
// and just logs the message + nudges Jorge on Telegram.
$pauseState = geo_agent_pause_state($notes);
if ($pauseState['paused']) {
    geo_log_info('agent_paused_skip_reply', ['phone' => mb_substr($fromPhone, -4)]);

    $convRecord = geo_conv_get($fromPhone);
    geo_conv_append_turn($fromPhone, $convRecord, $body, '', [
        'leadId'     => $leadId,
        'pausedSkip' => true,
    ]);

    if ($leadId) {
        geo_at_update_lead($leadId, [
            'Last Contact Date' => date('Y-m-d'),
            'Notes'             => geo_at_append_notes($notes, 'Cliente escribió mientras el bot estaba pausado.'),
        ]);
    }

    // Best-effort nudge — don't let a Telegram hiccup break the webhook response
    try {
        geo_telegram_alert([
            'contactName'        => $contactName,
            'clientPhone'        => $fromPhone,
            'homeAddress'        => $homeAddress,
            'serviceType'        => $serviceType,
            'projectDescription' => '',
            'budgetRange'        => $budgetRange,
            'timeline'           => $timeline,
            'urgency'            => $urgency,
            'escalateReason'     => '🔕 Bot pausado (tú tomaste el control) — el cliente escribió, respóndele tú directamente.',
            'appointmentDate'    => null,
            'clientMessage'      => $body,
            'geoResponse'        => '',
            'geoScore'           => 0,
            'messageCount'       => intval($convRecord['messageCount'] ?? 0) + 1,
            'language'           => $language,
        ]);
    } catch (Throwable $e) {
        geo_log_warn('pause_nudge_failed', ['error' => $e->getMessage()]);
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'paused' => true, 'since' => $pauseState['since']?->format('c')]);
    exit;
}

// ── 6. Conversation history ────────────────────────────────
$convRecord = geo_conv_get($fromPhone);
$history    = $convRecord['history']      ?? '';
$msgCount   = intval($convRecord['messageCount'] ?? 0);

// ── 7. Ask Claude ──────────────────────────────────────────
$claudeResult = geo_claude_decide([
    'contactName'         => $contactName,
    'homeAddress'         => $homeAddress,
    'city'                => $city,
    'language'            => $language,
    'status'              => $status,
    'notes'               => $notes,
    'clientMessage'       => $body,
    'conversationHistory' => $history,
    'messageCount'        => $msgCount,
    'serviceType'         => $serviceType,
    'budgetRange'         => $budgetRange,
    'timeline'            => $timeline,
    'urgency'             => $urgency,
    'isReturning'         => $isReturning,
]);
$geo = $claudeResult['geo'];

// ── 8. Send SMS reply ──────────────────────────────────────
$smsResult = null;
if (!empty($geo['responseToClient'])) {
    $smsResult = geo_sms_send($fromPhone, $geo['responseToClient']);
    // Mark this as a bot-sent message so the outbound webhook for THIS
    // reply doesn't get mistaken for a manual takeover by Jorge.
    geo_mark_bot_sent($fromPhone);
}

// ── 9. Escalate to Jorge via Telegram ─────────────────────
if (!empty($geo['escalate'])) {
    $geoScore = 0;
    if ($geo['urgency'] === 'hot')                                          $geoScore += 3;
    elseif ($geo['urgency'] === 'warm')                                     $geoScore += 1;
    if (!empty($geo['budgetRange']) && $geo['budgetRange'] !== 'unknown')   $geoScore += 2;
    if (!empty($geo['serviceType']) && $geo['serviceType'] !== 'unknown')   $geoScore += 2;
    if (!empty($geo['homeAddress']))                                         $geoScore += 2;
    if (!empty($geo['appointmentDate']))                                     $geoScore += 1;
    $geoScore = min($geoScore, 10);

    geo_telegram_alert([
        'contactName'        => $contactName,
        'clientPhone'        => $fromPhone,
        'homeAddress'        => $geo['homeAddress']        ?? $homeAddress,
        'serviceType'        => $geo['serviceType']        ?? $serviceType,
        'projectDescription' => $geo['projectDescription'] ?? '',
        'budgetRange'        => $geo['budgetRange']        ?? $budgetRange,
        'timeline'           => $geo['timeline']           ?? $timeline,
        'urgency'            => $geo['urgency']            ?? $urgency,
        'escalateReason'     => $geo['escalateReason']     ?? 'N/A',
        'appointmentDate'    => $geo['appointmentDate']    ?? null,
        'clientMessage'      => $body,
        'geoResponse'        => $geo['responseToClient']   ?? '',
        'geoScore'           => $geoScore,
        'messageCount'       => $msgCount + 1,
        'language'           => $geo['language']           ?? $language,
    ]);
}

// ── 10. Persist conversation history ──────────────────────
geo_conv_append_turn($fromPhone, $convRecord, $body, $geo['responseToClient'] ?? '', [
    'leadId'      => $leadId,
    'serviceType' => $geo['serviceType']  ?? null,
    'budgetRange' => $geo['budgetRange']  ?? null,
    'timeline'    => $geo['timeline']     ?? null,
    'urgency'     => $geo['urgency']      ?? null,
    'language'    => $geo['language']     ?? null,
]);

// ── 11. Update Airtable lead ───────────────────────────────
if ($leadId) {
    $newStatus  = $geo['newStatus'] ?? 'Contacted';
    $newNotes   = geo_at_append_notes($notes, $geo['notes'] ?? '');
    $leadUpdate = [
        'Lead Status'       => $newStatus,
        'Last Contact Date' => date('Y-m-d'),
        'Notes'             => $newNotes,
    ];

    // Qualification fields — only update if not unknown/empty
    if (!empty($geo['serviceType']) && $geo['serviceType'] !== 'unknown')
        $leadUpdate['Service Type'] = $geo['serviceType'];
    if (!empty($geo['projectDescription']))
        $leadUpdate['Project Description'] = $geo['projectDescription'];
    if (!empty($geo['homeAddress']))
        $leadUpdate['Home Address'] = $geo['homeAddress'];
    if (!empty($geo['budgetRange']) && $geo['budgetRange'] !== 'unknown')
        $leadUpdate['Budget Range'] = $geo['budgetRange'];
    if (!empty($geo['timeline']) && $geo['timeline'] !== 'unknown')
        $leadUpdate['Timeline'] = $geo['timeline'];
    if (!empty($geo['urgency']) && $geo['urgency'] !== 'unknown')
        $leadUpdate['Urgency'] = $geo['urgency'];
    if (!empty($geo['language']))
        $leadUpdate['Language'] = $geo['language'];
    if (!empty($geo['appointmentDate']))
        $leadUpdate['Appointment Date'] = $geo['appointmentDate'];

    // ── FIX v2: Save Full Name when Claude extracts it ─────
    if (!empty($geo['contactName']) && $geo['contactName'] !== 'there') {
        $currentName = $fields['Full Name'] ?? '';
        if (empty($currentName) || strpos($currentName, 'Inbound ') !== false) {
            $leadUpdate['Full Name'] = $geo['contactName'];
        }
    }

    // ── FIX v2: Save second phone if Claude extracts it ────
    if (!empty($geo['secondPhone'])) {
        $leadUpdate['Phone2'] = $geo['secondPhone'];
    }

    geo_at_update_lead($leadId, $leadUpdate);
}

// ── 12. Log conversation to Airtable (QC) ─────────────────
$existingConvo = geo_at_find_convo($fromPhone);
geo_at_log_conversation($fromPhone, $geo, $body, $contactName, $existingConvo);

// ── 13. Respond 200 to webhook provider ───────────────────
http_response_code(200);
echo json_encode([
    'ok'              => true,
    'messageId'       => $messageId,
    'escalated'       => !empty($geo['escalate']),
    'model_used'      => $claudeResult['model_used']      ?? null,
    'escalated_model' => $claudeResult['escalated_model'] ?? false,
    'sms_sent'        => $smsResult['success']            ?? false,
    'newStatus'       => $geo['newStatus']                ?? null,
    'name_captured'   => !empty($geo['contactName']) && $geo['contactName'] !== 'there'
                         ? $geo['contactName'] : null,
]);

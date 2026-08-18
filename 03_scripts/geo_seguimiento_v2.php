<?php
// ============================================================
// GEO AGENT — Follow-up Sequence v2 (geo_seguimiento.php)
// Fixed from v1 (2026-06-04):
//
// BUG FIXES:
//   1. Business hours guard — Mon-Fri 8am-6pm CT ONLY
//      (v1 ran every hour including midnight → 24 SMS/day)
//   2. Dedup check fixed — pattern now matches actual note format
//      (v1: looked for "[GEO Reminder] 2026-06-02" but wrote
//       "[GEO Reminder] Recordatorio enviado - 2026-06-02 00:00")
//   3. Appointment reminders: 24h before + 1h before only
//      (no more daily spam when appointment is set)
//   4. Follow-up sequence updated: 48h → 5 days → 10 days (max 3)
//      (Jorge directive 2026-06-04)
//
// CRON: */30 * * * * php /path/to/geo_seguimiento.php
//   (runs every 30 min but guards against non-business hours internally)
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/geo_logger.php';
require_once __DIR__ . '/lib/geo_airtable.php';
require_once __DIR__ . '/lib/geo_sms.php';
require_once __DIR__ . '/lib/geo_telegram.php';

// ── Kill switch ─────────────────────────────────────────────
if (defined('GEO_KILL_SWITCH') && GEO_KILL_SWITCH) {
    geo_log_info('seguimiento_skipped', ['reason' => 'kill_switch']);
    echo json_encode(['skipped' => 'kill_switch']);
    exit;
}

// ────────────────────────────────────────────────────────────
// MASTER GUARD: Business hours only — Mon-Fri 8:00am-6:00pm CT
// NOTHING gets sent outside this window, period.
// ────────────────────────────────────────────────────────────
define('GEO_TZ',    'America/Chicago');
define('GEO_OPEN',  8);   // 8:00 AM CT
define('GEO_CLOSE', 18);  // 6:00 PM CT

function geo_is_business_hours(): bool {
    $tz  = new DateTimeZone(GEO_TZ);
    $now = new DateTime('now', $tz);
    $dow = (int) $now->format('N'); // 1=Mon ... 7=Sun
    $h   = (int) $now->format('G'); // 0-23 (no leading zero)
    if ($dow > 5)               return false; // Saturday=6, Sunday=7
    if ($h < GEO_OPEN)         return false; // before 8am
    if ($h >= GEO_CLOSE)       return false; // 6pm or later
    return true;
}

if (!geo_is_business_hours()) {
    $tz  = new DateTimeZone(GEO_TZ);
    $now = new DateTime('now', $tz);
    geo_log_info('seguimiento_outside_hours', [
        'time_ct' => $now->format('D H:i T'),
    ]);
    echo json_encode(['skipped' => 'outside_business_hours', 'time_ct' => $now->format('D H:i T')]);
    exit;
}

// ── Follow-up message templates (bilingual) ─────────────────
// NOTE: v2 templates now ask for missing info (name, budget)
$FOLLOW_UP_TEMPLATES = [

    // Follow-up 1 (+48h) — first touch
    'fu1' => [
        'English' => "Hi! This is GEO from Geo Carpentry 🔨 Just checking in — are you still interested in a free estimate for your project? We have openings this week. Reply here anytime!",
        'Spanish' => "¡Hola! Soy GEO de Geo Carpentry 🔨 Solo quería saber si todavía le interesa una estimación gratis. Esta semana tenemos disponibilidad. ¡Respóndame cuando pueda!",
    ],

    // Follow-up 2 (+5 days) — add value, ask budget
    'fu2' => [
        'English' => "GEO from Geo Carpentry again! We specialize in kitchens, bathrooms, decks & home renovations across Green Bay — all with FREE estimates and no obligation. Do you have a rough budget in mind? That helps Jorge give you the best options.",
        'Spanish' => "¡GEO de Geo Carpentry de nuevo! Nos especializamos en cocinas, baños, decks y renovaciones en Green Bay — todo con estimaciones GRATIS y sin compromiso. ¿Tiene idea del presupuesto aproximado? Eso ayuda a Jorge a darle las mejores opciones.",
    ],

    // Follow-up 3 / final (+10 days) — soft close
    'fu3' => [
        'English' => "Last message from GEO at Geo Carpentry! If your project is still on your radar, we'd love to help — licensed, insured, and ready. Just reply YES and I'll get Jorge scheduled. Or reach us anytime: (920) 367-1272 or geocarpentry.com 🏠",
        'Spanish' => "Último mensaje de GEO en Geo Carpentry. Si su proyecto sigue en mente, nos encantaría ayudarle — licenciados y asegurados. Solo responda SÍ y agendamos con Jorge. O escríbanos cuando quiera: (920) 367-1272 o geocarpentry.com 🏠",
    ],

    // Appointment reminder — 24h before
    'appt_24h' => [
        'English' => "Hi {name}! Reminder from Geo Carpentry: Jorge will be at {address} TOMORROW for your free estimate. Any questions? Call or text (920) 367-1272. See you then! 🔨",
        'Spanish' => "¡Hola {name}! Recordatorio de Geo Carpentry: Jorge irá a {address} MAÑANA para su estimación gratis. ¿Preguntas? Llame o escriba al (920) 367-1272. ¡Hasta entonces! 🔨",
    ],

    // Appointment reminder — 1h before
    'appt_1h' => [
        'English' => "Good morning {name}! Jorge is on his way to {address} and will be there at {time} today. See you in about an hour! 🏗️ Any last-minute questions: (920) 367-1272",
        'Spanish' => "¡Buenos días {name}! Jorge va en camino a {address} y llegará a las {time} hoy. ¡Nos vemos en una hora! 🏗️ Cualquier pregunta: (920) 367-1272",
    ],
];

// ── Timing thresholds ───────────────────────────────────────
define('SEG_FU1_HOURS',  48);   // First follow-up: 48h after last contact
define('SEG_FU2_HOURS',  120);  // Second follow-up: 5 days (120h)
define('SEG_FU3_HOURS',  240);  // Final follow-up: 10 days (240h)
define('SEG_APPT_24H',   1380); // 24h reminder window: 23h (1380 min) to 25h (1500 min) before appt
define('SEG_APPT_1H',    45);   // 1h reminder window: 45 min to 90 min before appt

// ── Eligible statuses ───────────────────────────────────────
$FOLLOWUP_STATUSES = ['New', 'Contacted', 'Qualified'];

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
geo_log_info('seguimiento_start', ['ts' => date('c')]);

$stats = [
    'checked'   => 0,
    'sent'      => 0,
    'skipped'   => 0,
    'archived'  => 0,
    'reminders' => 0,
    'errors'    => 0,
];

process_appointment_reminders($stats, $FOLLOW_UP_TEMPLATES);
process_stale_leads($stats, $FOLLOWUP_STATUSES, $FOLLOW_UP_TEMPLATES);

geo_log_info('seguimiento_done', $stats);
echo json_encode(array_merge(['ok' => true], $stats)) . "\n";

// ════════════════════════════════════════════════════════════
// FUNCTION: Appointment reminders (24h + 1h before)
// ════════════════════════════════════════════════════════════
function process_appointment_reminders(&$stats, $templates) {
    // Fetch all "Appointment Set" leads with a future appointment
    $now = new DateTime('now', new DateTimeZone(GEO_TZ));
    $filterFormula = "AND({Lead Status}='Appointment Set',{Appointment Date}!='',NOT({Do Not Contact}))";
    $url = 'https://api.airtable.com/v0/' . GEO_AT_BASE . '/' . GEO_AT_LEADS
         . '?filterByFormula=' . urlencode($filterFormula)
         . '&fields[]=Phone&fields[]=Language&fields[]=Full+Name'
         . '&fields[]=Appointment+Date&fields[]=Home+Address&fields[]=Notes';

    $resp = geo_at_http_get($url);
    if (!$resp || empty($resp['records'])) return;

    foreach ($resp['records'] as $rec) {
        $fields   = $rec['fields'] ?? [];
        $recordId = $rec['id'];
        $phone    = $fields['Phone'] ?? null;
        $language = $fields['Language'] ?? 'English';
        $notes    = $fields['Notes'] ?? '';
        $apptStr  = $fields['Appointment Date'] ?? null;
        $address  = $fields['Home Address'] ?? 'your address';
        $rawName  = $fields['Full Name'] ?? '';
        $name     = (!empty($rawName) && strpos($rawName, 'Inbound ') === false) ? $rawName : 'there';

        if (!$phone || !$apptStr) { $stats['skipped']++; continue; }

        $apptDt   = new DateTime($apptStr, new DateTimeZone(GEO_TZ));
        $diffMins = ($apptDt->getTimestamp() - $now->getTimestamp()) / 60;

        // ── 24h reminder: 23h-25h before appointment ──────────────
        // Window: 1380 to 1500 minutes (23h to 25h)
        if ($diffMins >= 1380 && $diffMins <= 1500) {
            // FIX v2: check matches write format
            $todayStr = $now->format('Y-m-d');
            if (str_contains($notes, 'appt_24h_sent_' . $todayStr)) {
                $stats['skipped']++;
                continue;
            }
            $msg = build_appt_msg($templates['appt_24h'][$language] ?? $templates['appt_24h']['English'],
                $name, $address, $apptDt);
            if (geo_sms_send($phone, $msg)) {
                $stats['reminders']++;
                geo_at_update_lead($recordId, [
                    'Last Contact Date' => $todayStr,
                    'Notes'             => geo_at_append_notes($notes,
                        '[GEO Reminder] Recordatorio 24h enviado - appt_24h_sent_' . $todayStr),
                ]);
                geo_log_info('appt_reminder_24h', ['phone' => mask_phone($phone)]);
            }
            usleep(1000000);
            continue;
        }

        // ── 1h reminder: 45-90 minutes before appointment ──────────
        if ($diffMins >= 45 && $diffMins <= 90) {
            $todayStr = $now->format('Y-m-d');
            if (str_contains($notes, 'appt_1h_sent_' . $todayStr)) {
                $stats['skipped']++;
                continue;
            }
            $timeStr = $apptDt->format('g:i A');
            $msg = build_appt_msg($templates['appt_1h'][$language] ?? $templates['appt_1h']['English'],
                $name, $address, $apptDt);
            if (geo_sms_send($phone, $msg)) {
                $stats['reminders']++;
                geo_at_update_lead($recordId, [
                    'Last Contact Date' => $todayStr,
                    'Notes'             => geo_at_append_notes($notes,
                        '[GEO Reminder] Recordatorio 1h enviado - appt_1h_sent_' . $todayStr),
                ]);
                geo_log_info('appt_reminder_1h', ['phone' => mask_phone($phone)]);
            }
            usleep(1000000);
            continue;
        }
    }
}

// ════════════════════════════════════════════════════════════
// FUNCTION: Follow-ups for stale leads (no appointment)
// ════════════════════════════════════════════════════════════
function process_stale_leads(&$stats, $followupStatuses, $templates) {
    $statusConditions = array_map(fn($s) => "{Lead Status}='" . $s . "'", $followupStatuses);
    $filterFormula = 'AND(OR(' . implode(',', $statusConditions) . '),NOT({Do Not Contact}))';

    $url = 'https://api.airtable.com/v0/' . GEO_AT_BASE . '/' . GEO_AT_LEADS
         . '?filterByFormula=' . urlencode($filterFormula)
         . '&fields[]=Phone&fields[]=Lead+Status&fields[]=Language'
         . '&fields[]=Last+Contact+Date&fields[]=Notes&fields[]=Full+Name'
         . '&fields[]=Service+Type&fields[]=Urgency&fields[]=Budget+Range';

    $resp = geo_at_http_get($url);
    if (!$resp || empty($resp['records'])) {
        geo_log_info('seguimiento_no_stale_leads', []);
        return;
    }

    $now = time();

    foreach ($resp['records'] as $rec) {
        $stats['checked']++;
        $fields    = $rec['fields'] ?? [];
        $recordId  = $rec['id'];
        $phone     = $fields['Phone'] ?? null;
        $language  = $fields['Language'] ?? 'English';
        $notes     = $fields['Notes'] ?? '';
        $lastContact = $fields['Last Contact Date'] ?? null;

        if (!$phone) { $stats['skipped']++; continue; }

        // Never sent twice in same day
        $todayStr = date('Y-m-d');
        if ($lastContact >= $todayStr) {
            $stats['skipped']++;
            continue;
        }

        // Hours since last contact
        $hoursSince = null;
        if ($lastContact) {
            $hoursSince = ($now - strtotime($lastContact)) / 3600;
        }

        // Determine which follow-up to send
        $templateKey = determine_followup_key($hoursSince, $notes);
        if ($templateKey === null) {
            $stats['skipped']++;
            continue;
        }

        if ($templateKey === 'archive') {
            geo_at_update_lead($recordId, [
                'Lead Status' => 'Lost',
                'Notes'       => geo_at_append_notes($notes,
                    '[GEO Seg] Cerrado por inactividad - ' . date('Y-m-d')),
            ]);
            $stats['archived']++;
            geo_log_info('seguimiento_archived', ['phone' => mask_phone($phone)]);
            continue;
        }

        $msg = $templates[$templateKey][$language] ?? $templates[$templateKey]['English'];

        if (geo_sms_send($phone, $msg)) {
            $stats['sent']++;
            $noteLabels = [
                'fu1' => 'Follow-up 1 (48h)',
                'fu2' => 'Follow-up 2 (5d)',
                'fu3' => 'Follow-up final (10d)',
            ];
            $noteLabel = $noteLabels[$templateKey] ?? $templateKey;
            geo_at_update_lead($recordId, [
                'Last Contact Date' => $todayStr,
                'Notes'             => geo_at_append_notes($notes,
                    '[GEO Seg] ' . $noteLabel . ' enviado - ' . date('Y-m-d H:i')),
            ]);
            geo_log_info('seguimiento_sent', [
                'phone'    => mask_phone($phone),
                'template' => $templateKey,
                'lang'     => $language,
            ]);
        } else {
            $stats['errors']++;
        }

        usleep(1500000); // 1.5s between sends — be nice to OpenPhone rate limits
    }
}

// ════════════════════════════════════════════════════════════
// HELPER: Which follow-up template to send?
// Uses fu1/fu2/fu3 keys matching $FOLLOW_UP_TEMPLATES
// ════════════════════════════════════════════════════════════
function determine_followup_key($hoursSince, $notes) {
    if ($hoursSince === null) return null;

    // FIX v2: match patterns now use consistent note format
    $sentFu1 = str_contains($notes, '[GEO Seg] Follow-up 1');
    $sentFu2 = str_contains($notes, '[GEO Seg] Follow-up 2');
    $sentFu3 = str_contains($notes, '[GEO Seg] Follow-up final');

    if ($sentFu3) {
        // Archive after 10 more days of silence (20d total)
        return ($hoursSince > SEG_FU3_HOURS * 2) ? 'archive' : null;
    }
    if ($sentFu2) {
        return ($hoursSince >= SEG_FU3_HOURS) ? 'fu3' : null;
    }
    if ($sentFu1) {
        return ($hoursSince >= SEG_FU2_HOURS) ? 'fu2' : null;
    }
    return ($hoursSince >= SEG_FU1_HOURS) ? 'fu1' : null;
}

// ════════════════════════════════════════════════════════════
// HELPER: Replace placeholders in appointment message
// ════════════════════════════════════════════════════════════
function build_appt_msg($template, $name, $address, DateTime $apptDt) {
    $timeStr = $apptDt->format('g:i A');
    $nameDisplay = ($name === 'there') ? '' : $name;
    return str_replace(
        ['{name}', '{address}', '{time}'],
        [$nameDisplay, $address, $timeStr],
        $template
    );
}

// ════════════════════════════════════════════════════════════
// HELPER: Airtable GET
// ════════════════════════════════════════════════════════════
function geo_at_http_get($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . AIRTABLE_TOKEN,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT => 15,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code !== 200 || !$body) {
        geo_log_error('at_get_failed', ['code' => $code]);
        return null;
    }
    return json_decode($body, true);
}

// ════════════════════════════════════════════════════════════
// HELPER: Mask phone for logs
// ════════════════════════════════════════════════════════════
function mask_phone($phone) {
    $clean = preg_replace('/[^0-9]/', '', (string) $phone);
    return '***' . substr($clean, -4);
}

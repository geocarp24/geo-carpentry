<?php
// ============================================================
// geo_followup.php — GEO Carpentry Follow-up & Reminder Cron
//
// Corre via Hostinger Cron: cada 30 minutos
// Cron expression: */30 * * * *
//
// REGLAS DE NEGOCIO (v2 — 2026-06-04):
//
// Horario permitido: Mon–Fri 8:00am–6:00pm CT SOLAMENTE
// Jamás mandar mensajes fuera de ese horario.
//
// LEADS CON CITA (Status = "Appointment Set"):
//   - Reminder 1: exactamente 24h antes de la cita (±15 min)
//   - Reminder 2: exactamente 1h antes de la cita (±15 min)
//   - NO más follow-ups — punto. La cita está set.
//
// LEADS SIN CITA (Status = "New" o "Contacted"):
//   - Follow-up 1: 48h después del primer contacto
//   - Follow-up 2: 5 días después del primer contacto
//   - Follow-up final: 10 días después del primer contacto
//   - Máximo 3 follow-ups total, luego marcar como Lost
//   - Nunca más de 1 SMS por día al mismo lead
//
// STOP automático si: DNC | Won | Lost | Appointment Set (ya cubierto arriba)
// ============================================================

require_once __DIR__ . '/tools/config.php';
require_once __DIR__ . '/tools/lib/geo_logger.php';
require_once __DIR__ . '/tools/lib/geo_airtable.php';
require_once __DIR__ . '/tools/lib/geo_sms.php';

// ── Timezone y horario ───────────────────────────────────────
define('GEO_TZ',         'America/Chicago'); // CT = CDT (UTC-5) / CST (UTC-6)
define('GEO_HOUR_OPEN',  8);   // 8:00 AM CT
define('GEO_HOUR_CLOSE', 18);  // 6:00 PM CT

/**
 * Returns true if RIGHT NOW is within business hours (Mon–Fri 8am–6pm CT).
 * This is the MASTER GUARD — nothing gets sent outside this window.
 */
function geo_is_business_hours(): bool {
    $tz  = new DateTimeZone(GEO_TZ);
    $now = new DateTime('now', $tz);
    $dow = (int) $now->format('N'); // 1=Mon, 7=Sun
    $h   = (int) $now->format('G'); // 0-23

    if ($dow > 5) return false;                            // Sat(6) or Sun(7)
    if ($h < GEO_HOUR_OPEN || $h >= GEO_HOUR_CLOSE) return false;
    return true;
}

/**
 * Returns the NEXT business-hours slot from a given DateTime.
 * Used to schedule the cron to run at the right time.
 */
function geo_next_business_slot(DateTime $from = null): DateTime {
    $tz  = new DateTimeZone(GEO_TZ);
    $dt  = $from ? clone $from : new DateTime('now', $tz);
    $dt->setTimezone($tz);

    for ($i = 0; $i < 10; $i++) {
        $dow = (int) $dt->format('N');
        $h   = (int) $dt->format('G');

        if ($dow <= 5 && $h >= GEO_HOUR_OPEN && $h < GEO_HOUR_CLOSE) {
            return $dt;
        }
        // Advance: if after close or weekend, move to next day 8am
        if ($h >= GEO_HOUR_CLOSE || $dow > 5) {
            $dt->modify('+1 day');
            $dt->setTime(GEO_HOUR_OPEN, 0, 0);
        } else {
            // Before open — set to 8am today
            $dt->setTime(GEO_HOUR_OPEN, 0, 0);
        }
    }
    return $dt;
}

/**
 * Check if we already sent a message to this lead today (any type).
 * Prevents double-sending if cron runs every 30 min.
 */
function geo_already_sent_today(array $fields): bool {
    $lastContact = $fields['Last Contact Date'] ?? '';
    if (!$lastContact) return false;
    $tz    = new DateTimeZone(GEO_TZ);
    $today = (new DateTime('now', $tz))->format('Y-m-d');
    return $lastContact >= $today;
}

/**
 * Build the reminder SMS text for appointment reminders.
 */
function geo_reminder_text(array $fields, string $reminderType): string {
    $name  = $fields['Full Name'] ?? '';
    $nameDisplay = ($name && strpos($name, 'Inbound ') === false) ? ", {$name}" : '';
    $appt  = $fields['Appointment Date'] ?? '';
    $addr  = $fields['Home Address'] ?? '';

    if (!$appt) return '';

    $tz   = new DateTimeZone(GEO_TZ);
    $dt   = new DateTime($appt, $tz);
    $date = $dt->format('l F j');   // e.g. "Friday June 6"
    $time = $dt->format('g:i A');   // e.g. "9:30 AM"

    if ($reminderType === '24h') {
        return "Hi{$nameDisplay}! Just a reminder that Jorge will be at {$addr} tomorrow, {$date} at {$time} for your free estimate. He'll have everything he needs to give you a detailed quote on the spot. If anything changes, just reply here or call (920) 367-1272.";
    }

    if ($reminderType === '1h') {
        return "Good morning{$nameDisplay}! Jorge is heading your way and will arrive at {$addr} at {$time} today for your kitchen estimate. See you soon! 🏗️ Any questions? (920) 367-1272";
    }

    return '';
}

/**
 * Build follow-up SMS text for leads without appointment.
 */
function geo_followup_text(array $fields, int $followupNum): string {
    $name    = $fields['Full Name'] ?? '';
    $nameDisplay = ($name && strpos($name, 'Inbound ') === false) ? ", {$name}" : '';
    $service = $fields['Service Type'] ?? '';
    $serviceDisplay = match($service) {
        'kitchen_remodeling'   => 'kitchen remodel',
        'bathroom_remodeling'  => 'bathroom renovation',
        'deck_building'        => 'deck project',
        'finish_carpentry'     => 'carpentry project',
        'home_renovation'      => 'home renovation',
        'general_construction' => 'construction project',
        default => 'project',
    };

    return match($followupNum) {
        1 => "Hi{$nameDisplay}! Just checking in on your {$serviceDisplay} inquiry. Jorge still has availability for free estimates this week — would you like to set something up? (920) 367-1272",
        2 => "Hey{$nameDisplay} — Geo Carpentry here. Still interested in getting a quote for your {$serviceDisplay}? We're booking into next week and want to make sure we save you a spot. No obligation, just a free estimate. Reply here or call (920) 367-1272.",
        3 => "Last check-in{$nameDisplay} — if you're still considering a {$serviceDisplay}, Jorge would love to give you a free estimate before our schedule fills up. If the timing isn't right, no worries at all. Just reply when you're ready! — Geo Carpentry (920) 367-1272",
        default => '',
    };
}

// ── MAIN LOGIC ───────────────────────────────────────────────

geo_log_info('followup_cron_start', ['time' => date('Y-m-d H:i:s')]);

// MASTER GUARD: Don't run outside business hours
if (!geo_is_business_hours()) {
    geo_log_info('followup_outside_hours', [
        'time' => (new DateTime('now', new DateTimeZone(GEO_TZ)))->format('D H:i T')
    ]);
    echo json_encode(['skipped' => 'outside_business_hours']);
    exit;
}

// Fetch all active leads (not DNC, Won, Lost)
$activeLeads = geo_at_list_leads([
    'filterByFormula' => "AND(" .
        "NOT({Lead Status} = 'DNC'), " .
        "NOT({Lead Status} = 'Won'), " .
        "NOT({Lead Status} = 'Lost'), " .
        "NOT({Do Not Contact} = TRUE())" .
    ")"
]);

if (empty($activeLeads)) {
    geo_log_info('followup_no_leads', []);
    echo json_encode(['processed' => 0]);
    exit;
}

$sent     = 0;
$skipped  = 0;
$tz       = new DateTimeZone(GEO_TZ);
$now      = new DateTime('now', $tz);

foreach ($activeLeads as $lead) {
    $leadId = $lead['id'];
    $fields = $lead['fields'] ?? [];
    $status = $fields['Lead Status'] ?? 'New';
    $phone  = $fields['Phone'] ?? '';

    if (!$phone) {
        $skipped++;
        continue;
    }

    // Already sent something today → skip
    if (geo_already_sent_today($fields)) {
        geo_log_info('followup_skip_already_sent', ['lead' => $leadId, 'status' => $status]);
        $skipped++;
        continue;
    }

    // ────────────────────────────────────────────────────────
    // CASE A: Appointment is set — only 24h and 1h reminders
    // ────────────────────────────────────────────────────────
    if ($status === 'Appointment Set') {
        $apptStr = $fields['Appointment Date'] ?? '';
        if (!$apptStr) { $skipped++; continue; }

        $apptDt   = new DateTime($apptStr, $tz);
        $diffMins = ($apptDt->getTimestamp() - $now->getTimestamp()) / 60;

        $reminderType = null;
        $reminderNote = '';

        // 24h reminder: between 1425min (23h45m) and 1470min (24h30m) before appt
        if ($diffMins >= 1425 && $diffMins <= 1470) {
            // Check if 24h reminder already sent
            $notesText = $fields['Notes'] ?? '';
            if (strpos($notesText, 'Reminder 24h enviado') === false) {
                $reminderType = '24h';
                $reminderNote = 'Reminder 24h enviado ' . $now->format('Y-m-d H:i');
            }
        }
        // 1h reminder: between 45min and 90min before appt
        elseif ($diffMins >= 45 && $diffMins <= 90) {
            $notesText = $fields['Notes'] ?? '';
            if (strpos($notesText, 'Reminder 1h enviado') === false) {
                $reminderType = '1h';
                $reminderNote = 'Reminder 1h enviado ' . $now->format('Y-m-d H:i');
            }
        }

        if ($reminderType) {
            $msg = geo_reminder_text($fields, $reminderType);
            if ($msg) {
                $result = geo_sms_send($phone, $msg);
                if ($result['success'] ?? false) {
                    geo_at_update_lead($leadId, [
                        'Last Contact Date' => $now->format('Y-m-d'),
                        'Notes'             => geo_at_append_notes($fields['Notes'] ?? '', $reminderNote),
                    ]);
                    geo_log_info('reminder_sent', ['lead' => $leadId, 'type' => $reminderType, 'phone' => $phone]);
                    $sent++;
                }
            }
        } else {
            $skipped++;
        }
        continue;
    }

    // ────────────────────────────────────────────────────────
    // CASE B: No appointment — nurture follow-ups (max 3)
    // ────────────────────────────────────────────────────────
    $notesText   = $fields['Notes'] ?? '';
    $firstContact = $fields['Last Contact Date'] ?? date('Y-m-d'); // fallback to today

    // Count how many follow-ups already sent
    $fp1Sent = strpos($notesText, '[GEO Seg] Follow-up 1') !== false;
    $fp2Sent = strpos($notesText, '[GEO Seg] Follow-up 2') !== false;
    $fp3Sent = strpos($notesText, '[GEO Seg] Follow-up final') !== false;

    if ($fp3Sent) {
        // All 3 sent — mark as Lost and stop
        geo_at_update_lead($leadId, ['Lead Status' => 'Lost']);
        geo_log_info('followup_lead_closed', ['lead' => $leadId, 'reason' => 'max_followups_reached']);
        $skipped++;
        continue;
    }

    // Calculate days since first contact
    $firstContactDt = new DateTime($firstContact, $tz);
    $daysSince      = ($now->getTimestamp() - $firstContactDt->getTimestamp()) / 86400;

    $followupNum  = null;
    $followupNote = '';

    if (!$fp1Sent && $daysSince >= 2.0) {
        $followupNum  = 1;
        $followupNote = '[GEO Seg] Follow-up 1 enviado - ' . $now->format('Y-m-d H:i');
    } elseif ($fp1Sent && !$fp2Sent && $daysSince >= 5.0) {
        $followupNum  = 2;
        $followupNote = '[GEO Seg] Follow-up 2 enviado - ' . $now->format('Y-m-d H:i');
    } elseif ($fp2Sent && !$fp3Sent && $daysSince >= 10.0) {
        $followupNum  = 3;
        $followupNote = '[GEO Seg] Follow-up final enviado - ' . $now->format('Y-m-d H:i');
    }

    if ($followupNum) {
        $msg = geo_followup_text($fields, $followupNum);
        if ($msg) {
            $result = geo_sms_send($phone, $msg);
            if ($result['success'] ?? false) {
                geo_at_update_lead($leadId, [
                    'Last Contact Date' => $now->format('Y-m-d'),
                    'Notes'             => geo_at_append_notes($notesText, $followupNote),
                    'Lead Status'       => $followupNum === 3 ? 'Contacted' : $status,
                ]);
                geo_log_info('followup_sent', ['lead' => $leadId, 'num' => $followupNum, 'phone' => $phone]);
                $sent++;
            }
        }
    } else {
        $skipped++;
    }
}

geo_log_info('followup_cron_done', ['sent' => $sent, 'skipped' => $skipped]);
echo json_encode(['sent' => $sent, 'skipped' => $skipped, 'time' => date('Y-m-d H:i:s')]);

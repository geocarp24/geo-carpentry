# geo_agent.php — 3 cambios exactos (copiar/pegar)

## Cambio 1 — Línea ~178: Fix placeholder de nombre

BUSCA:
```php
$created = geo_at_create_lead($fromPhone, [
    'Full Name'   => 'Inbound ' . date('Y-m-d'),
    'Lead Status' => 'New',
]);
```

REEMPLAZA CON:
```php
$created = geo_at_create_lead($fromPhone, [
    'Full Name'   => '',         // nombre vacío — el agente lo preguntará
    'Lead Status' => 'New',
    'Source'      => 'SMS Inbound',
]);
```

---

## Cambio 2 — Step 11 (~línea 220): Guardar nombre + campos nuevos de Claude v2

BUSCA:
```php
    if (!empty($geo['appointmentDate']))
        $leadUpdate['Appointment Date'] = $geo['appointmentDate'];
    geo_at_update_lead($leadId, $leadUpdate);
```

REEMPLAZA CON:
```php
    if (!empty($geo['appointmentDate']))
        $leadUpdate['Appointment Date'] = $geo['appointmentDate'];

    // v2: guardar nombre cuando Claude lo extrae
    if (!empty($geo['contactName']) && $geo['contactName'] !== 'there') {
        $currentName = $fields['Full Name'] ?? '';
        if (empty($currentName) || strpos($currentName, 'Inbound ') !== false) {
            $leadUpdate['Full Name'] = $geo['contactName'];
        }
    }

    // v2: guardar campos adicionales si Claude los extrae
    if (!empty($geo['secondPhone']))
        $leadUpdate['Phone2'] = $geo['secondPhone'];

    geo_at_update_lead($leadId, $leadUpdate);
```

---

## Cambio 3 — Step 13 (última línea del json_encode): Agregar campos nuevos al log

BUSCA:
```php
echo json_encode([
    'ok'             => true,
    'messageId'      => $messageId,
    'escalated'      => !empty($geo['escalate']),
    'model_used'     => $claudeResult['model_used']      ?? null,
    'escalated_model'=> $claudeResult['escalated_model'] ?? false,
    'sms_sent'       => $smsResult['success']            ?? false,
    'newStatus'      => $geo['newStatus']                ?? null,
]);
```

REEMPLAZA CON:
```php
echo json_encode([
    'ok'             => true,
    'messageId'      => $messageId,
    'escalated'      => !empty($geo['escalate']),
    'model_used'     => $claudeResult['model_used']      ?? null,
    'escalated_model'=> $claudeResult['escalated_model'] ?? false,
    'sms_sent'       => $smsResult['success']            ?? false,
    'newStatus'      => $geo['newStatus']                ?? null,
    'name_captured'  => !empty($geo['contactName']) ? $geo['contactName'] : null,
]);
```

---

## Resumen de archivos a subir/editar

| Archivo | Acción |
|---|---|
| `tools/geo_agent.php` | Editar en cPanel — 3 cambios pequeños arriba |
| `tools/lib/geo_claude.php` | **REEMPLAZAR COMPLETO** con `geo_claude_v2.php` |
| `tools/geo_followup.php` | **REEMPLAZAR COMPLETO** con `geo_followup_v2.php` |

## Cron en Hostinger

El cron del followup debe correr **cada 30 minutos** (no cada hora):
```
*/30 * * * * /usr/local/bin/php /home/u433637438/domains/geocarpentry.com/public_html/tools/geo_followup.php
```

El código ya tiene el business hours guard interno — si corre a las 3am, sale solo sin mandar nada.

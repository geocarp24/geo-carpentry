<?php
// ============================================================
// lib/geo_claude.php — GEO AI Agent v2
// System prompt + Claude API call for GEO Carpentry SMS agent
//
// Actualizaciones v2 (2026-06-04):
//   - Pide nombre en mensaje 1-2 si no se conoce
//   - Recopila budget, timeline, referral source, second phone
//   - Detecta propietario vs inquilino (permisos)
//   - Detecta si tiene contratista actual (comparando cotizaciones)
//   - Una sola pregunta por mensaje (no bombardear)
//   - Nunca re-preguntar lo que ya se tiene
//   - Retorna contactName para guardar en Airtable
// ============================================================

/**
 * Calls Claude API and returns structured decision for the GEO SMS agent.
 *
 * @param array $ctx  Context from geo_agent.php
 * @return array      ['geo' => [...fields...], 'model_used' => string, 'escalated_model' => bool]
 */
function geo_claude_decide(array $ctx): array {

    $contactName     = $ctx['contactName']         ?? 'there';
    $homeAddress     = $ctx['homeAddress']          ?? '';
    $city            = $ctx['city']                 ?? 'Green Bay';
    $language        = $ctx['language']             ?? 'English';
    $status          = $ctx['status']               ?? 'New';
    $notes           = $ctx['notes']                ?? '';
    $clientMessage   = $ctx['clientMessage']        ?? '';
    $history         = $ctx['conversationHistory']  ?? '';
    $msgCount        = intval($ctx['messageCount']  ?? 0);
    $serviceType     = $ctx['serviceType']          ?? '';
    $budgetRange     = $ctx['budgetRange']          ?? '';
    $timeline        = $ctx['timeline']             ?? '';
    $urgency         = $ctx['urgency']              ?? '';
    $isReturning     = !empty($ctx['isReturning']);

    // Build the known fields summary so Claude knows what to skip asking
    $knownFields = [];
    if ($contactName && $contactName !== 'there' && strpos($contactName, 'Inbound ') === false)
        $knownFields[] = "name: \"{$contactName}\"";
    if ($homeAddress)     $knownFields[] = "address: \"{$homeAddress}\"";
    if ($serviceType)     $knownFields[] = "service: \"{$serviceType}\"";
    if ($budgetRange)     $knownFields[] = "budget: \"{$budgetRange}\"";
    if ($timeline)        $knownFields[] = "timeline: \"{$timeline}\"";
    if ($urgency)         $knownFields[] = "urgency: \"{$urgency}\"";

    $knownSummary = empty($knownFields)
        ? "None yet — this is the first message."
        : implode(', ', $knownFields);

    $nameUnknown    = empty($contactName) || $contactName === 'there' || strpos($contactName, 'Inbound ') !== false;
    $serviceUnknown = empty($serviceType);
    $addressUnknown = empty($homeAddress);
    $budgetUnknown  = empty($budgetRange);

    // ── SYSTEM PROMPT ───────────────────────────────────────────────────────
    $systemPrompt = <<<PROMPT
You are GEO, the friendly AI assistant for Geo Carpentry LLC — a licensed general contractor in Green Bay, Wisconsin (Northeast WI, 100-mile radius). Your job is to qualify leads via SMS and get them scheduled for a FREE estimate with Jorge.

## YOUR PERSONALITY
- Warm, professional, conversational — like a friendly office manager
- Keep messages SHORT (2-4 sentences max for SMS)
- Never salesy or pushy
- Bilingual: respond in the same language the client uses (English or Spanish)
- One question per message — never ask multiple things at once
- Never repeat information the client already gave you

## BUSINESS INFO
- Owner: Jorge Cruz
- Phone: (920) 367-1272
- WhatsApp: (920) 934-0351
- Email: admin@geocarpentry.com
- Hours: Mon–Fri 8am–6pm, Sat 9am–3pm CT
- Services: Kitchen Remodeling, Bathroom Remodeling, Deck Building, Finish Carpentry, Home Renovation, General Construction
- Area: Northeast Wisconsin (Green Bay, Appleton, Oshkosh, De Pere, Howard, Allouez, Bowler, and 100-mile radius)

## DATA YOU NEED TO COLLECT
Collect ALL of these naturally during the conversation. Never ask for something you already have.
Track what's been collected and only ask for what's MISSING.

### CRITICAL (must have before booking appointment):
1. **Full Name** — ask in message 1-2 if not given
2. **Service Type** — usually in first message, ask if unclear
3. **Home Address** — needed before confirming appointment
4. **Project Description** — gather from conversation context

### HIGH PRIORITY (qualify the lead):
5. **Budget Range** — ask casually: "Even a rough ballpark helps Jorge prepare"
   Options: under_5k | 5k_10k | 10k_25k | 25k_50k | 50k_plus | not_sure
6. **Timeline** — when do they want to start
   Options: ASAP | 1_3_months | 3_6_months | no_rush | exploring
7. **Urgency** — YOU calculate this from signals:
   - HOT: ASAP + clear budget + address given OR appointment requested
   - WARM: interested but no rush
   - COLD: just exploring, no clear intent

### USEFUL (ask if natural, don't force):
8. **Language** — auto-detect from first message (English / Spanish / Bilingual)
9. **Second Phone** — "Is there another number Jorge can reach you at?"
10. **Referral Source** — "How did you hear about us?" (Google, Facebook, referral, etc.)
11. **Owner or Renter** — matters for permits. "Is this your home or a rental property?"
12. **Current Contractor** — "Are you getting multiple quotes, or are you coming to us first?"
13. **Email** — "Want us to send the estimate by email too?" (only if they engage well)
14. **Photos** — "Feel free to send a photo if you have one — helps Jorge get a better idea!"

## QUESTION PRIORITY ORDER
If multiple fields are missing, ask them in this order:
1. Name (if unknown)
2. Service type (if unclear)
3. Scope/description (clarify what they need)
4. Budget range
5. Timeline
6. Address (before scheduling)
7. Owner/renter (if service involves permits — deck, addition, new construction)
8. Second phone / email / referral (if the conversation flows naturally there)

## CURRENT CONVERSATION CONTEXT
- Message #: {$msgCount}
- Client name: {$contactName}
- Known fields: {$knownSummary}
- Current status: {$status}
- Is returning client: {$isReturning}
- Conversation history:
{$history}

## APPOINTMENT RULES
- Offer a FREE estimate only after you have: name + service + address
- Suggest specific days (Mon–Fri, sometimes Sat)
- Ask for preferred time window (morning/afternoon)
- Confirm with exact date + time
- After appointment is confirmed → escalate to Jorge immediately

## ESCALATION TO JORGE (via Telegram)
Escalate when ANY of these are true:
- Client explicitly asks for Jorge or a human
- Lead is HOT (urgency=hot + appointment requested)
- Client is upset or frustrated
- Conversation has 8+ messages with no appointment progress
- Client mentions an emergency or urgent deadline

## RESPONSE FORMAT
Return ONLY valid JSON — no explanation, no markdown, no text outside the JSON.

```json
{
  "responseToClient": "Your SMS message here (2-4 sentences max, conversational, no markdown)",
  "contactName": "extracted name or empty string if unknown",
  "serviceType": "kitchen_remodeling|bathroom_remodeling|deck_building|finish_carpentry|home_renovation|general_construction|multiple|unknown",
  "projectDescription": "1-2 sentence summary of the project scope gathered so far",
  "homeAddress": "full address if given, empty string if not",
  "budgetRange": "under_5k|5k_10k|10k_25k|25k_50k|50k_plus|not_sure|unknown",
  "timeline": "ASAP|1_3_months|3_6_months|no_rush|exploring|unknown",
  "urgency": "hot|warm|cold",
  "language": "English|Spanish|Bilingual",
  "newStatus": "New|Contacted|Qualified|Appointment Set|DNC|Lost",
  "appointmentDate": "ISO8601 datetime if confirmed, null if not",
  "notes": "1-line internal note about this exchange (for Airtable log)",
  "escalate": false,
  "escalateReason": "reason if escalate=true, empty string otherwise",
  "secondPhone": "second phone number if given, empty string if not",
  "referralSource": "Google|Facebook|Referral|Instagram|Flyer|Other|unknown",
  "ownerOrRenter": "owner|renter|unknown",
  "comparingQuotes": true or false or null,
  "email": "email if given, empty string if not",
  "photoRequested": false
}
```

## CRITICAL RULES
- responseToClient must be plain text — NO markdown, NO asterisks, NO bullet points
- Keep SMS messages SHORT — 2-4 sentences max
- One question per message
- Never ask for something already in "Known fields"
- If name is unknown, ALWAYS ask in first or second response
- Never use "Inbound [date]" as a name — that's a system placeholder, not a real name
- If client says STOP, UNSUBSCRIBE, or similar → set newStatus="DNC", responseToClient=""
- Always match the client's language (English or Spanish)
PROMPT;

    // ── USER PROMPT ─────────────────────────────────────────────────────────
    $userPrompt = "New incoming message from client:\n\n\"{$clientMessage}\"\n\nBased on everything above, decide the next step and return valid JSON only.";

    // ── CALL CLAUDE API ──────────────────────────────────────────────────────
    $apiKey = defined('ANTHROPIC_API_KEY') ? ANTHROPIC_API_KEY : getenv('ANTHROPIC_API_KEY');
    $model  = 'claude-haiku-4-5-20251001'; // Fast + cheap for SMS responses
    $escalatedModel = false;

    $payload = [
        'model'      => $model,
        'max_tokens' => 600,
        'system'     => $systemPrompt,
        'messages'   => [
            ['role' => 'user', 'content' => $userPrompt]
        ],
    ];

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'x-api-key: ' . $apiKey,
            'anthropic-version: 2023-06-01',
        ],
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_TIMEOUT        => 30,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || !$response) {
        // Fallback response if Claude fails
        geo_log_error('claude_api_failed', ['http_code' => $httpCode]);
        return [
            'geo' => [
                'responseToClient' => "Thanks for your message! We'll get back to you shortly. You can also call us at (920) 367-1272.",
                'contactName'      => '',
                'newStatus'        => 'Contacted',
                'notes'            => 'Claude API failed — fallback response sent',
                'escalate'         => false,
                'escalateReason'   => '',
                'urgency'          => 'warm',
                'language'         => $language ?: 'English',
            ],
            'model_used'      => $model,
            'escalated_model' => false,
        ];
    }

    $data    = json_decode($response, true);
    $rawText = $data['content'][0]['text'] ?? '';

    // Extract JSON from response (handle markdown code blocks if present)
    $json = $rawText;
    if (preg_match('/```(?:json)?\s*([\s\S]+?)\s*```/', $rawText, $m)) {
        $json = $m[1];
    }
    // Find first { to last }
    $start = strpos($json, '{');
    $end   = strrpos($json, '}');
    if ($start !== false && $end !== false) {
        $json = substr($json, $start, $end - $start + 1);
    }

    $geo = json_decode($json, true);

    if (!is_array($geo)) {
        geo_log_error('claude_json_parse_failed', ['raw' => substr($rawText, 0, 300)]);
        // Try escalation with Sonnet as fallback
        $model          = 'claude-sonnet-4-6';
        $escalatedModel = true;
        $payload['model'] = $model;

        $ch2 = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch2, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'x-api-key: ' . $apiKey,
                'anthropic-version: 2023-06-01',
            ],
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT    => 45,
        ]);
        $response2 = curl_exec($ch2);
        curl_close($ch2);
        $data2    = json_decode($response2, true);
        $rawText2 = $data2['content'][0]['text'] ?? '';
        $geo      = json_decode($rawText2, true) ?: [];
    }

    // Sanitize required fields
    $geo['responseToClient'] = trim($geo['responseToClient'] ?? '');
    $geo['contactName']      = trim($geo['contactName']      ?? '');
    $geo['newStatus']        = $geo['newStatus']  ?? 'Contacted';
    $geo['notes']            = $geo['notes']      ?? '';
    $geo['escalate']         = !empty($geo['escalate']);
    $geo['urgency']          = $geo['urgency']    ?? 'warm';
    $geo['language']         = $geo['language']   ?? ($language ?: 'English');

    return [
        'geo'             => $geo,
        'model_used'      => $model,
        'escalated_model' => $escalatedModel,
    ];
}

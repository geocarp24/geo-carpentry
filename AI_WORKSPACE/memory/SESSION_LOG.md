# Production coordination and ALEX promotion — 2026-08-18

## Superagent core completion — 2026-08-21

- Root cause found: client/project/memory tables existed, but operational context exposed only a thin last-message record; mailbox search extraction was restricted to two hard-coded providers.
- Implemented generalized read-only mailbox search intent extraction.
- Implemented unified client context and deterministic work prioritization.
- Implemented weekday/date response grounding in English and Spanish.
- Production verification: 84/84 application tests, service active, no new error journal, generalized email request successful, unified-priority request successful, zero external actions.
- Production backups remain under timestamped `/opt/alex2-shadow/backups/` directories. No secrets or client records are included in this public-safe log.
- WordPress was not modified.

## Follow-up: durable conversational memory — 2026-08-21

### Root cause

The database schema and repository exposed conversation-memory operations, but the production assistant path did not call them. Owner Telegram requests also failed to load memory unless a separate subject phone was present, and legacy handlers could consume short follow-up replies before the primary assistant saw them.

### Repair

- Added owner-conversation upsert and durable message writes.
- Loaded context from the owner phone when no subject phone is present.
- Passed stable Telegram message identity, timestamps, channel, and thread identifiers through the bridge.
- Stored assistant replies, summaries, and pending-question state with revision protection.
- Prioritized the controlled primary assistant ahead of legacy text and voice routing.
- Preserved production backups under a timestamped memory-fix backup directory.

### Verification

- Syntax checks passed.
- Production automated suite: 72/72 passing.
- Planner and Telegram services active after restart with no new error-level journal entries.
- A live read-only two-turn request returned HTTP 200 both times; the second response explicitly recognized the confirmation from the prior turn.
- No plan was created and no Calendar, Airtable, SMS, email, or WordPress action was permitted.
- Database verification found four messages in one conversation and an advanced conversation revision.

### Remaining risk

Historical conversations predating the repair are not reconstructed automatically. Intermittent Telegram transport read errors observed before deployment should be monitored separately from memory correctness.

### Safety

This entry excludes credentials, identifiers, client data, message bodies, raw logs, and access details. WordPress was not modified.

## Email routing repair — 2026-08-21

### Root cause

The alert monitor concatenated sender, subject, and raw body text and evaluated generic permit, construction, and finance keywords before recognizing promotional senders. Separately, the controlled assistant could read only a recent mailbox window and had no capability to search the mailbox or move verified results to a user-named folder. Large UID lists also exceeded practical planner output limits.

### Repair

- Introduced deterministic sender- and subject-aware priority rules.
- Added read-only IMAP search with bounded message previews and an exact matched count.
- Added a compact approval plan containing search terms and expected total rather than hundreds of identifiers.
- At execution time, ALEX repeats the search and refuses to move anything if the count changed.
- Added a safe named-folder allowlist, batch movement, and destination-count verification.
- Preserved a timestamped production rollback backup before the changes.

### Verification

- Five transcript-derived classification regressions passed.
- Application suite passed 75/75.
- Live mailbox search returned a verified result without modification.
- A live ALEX request returned a single `email.move_to_folder` plan in `awaiting_approval`, with the expected destination and `safeToMutate:false`.
- No email was moved, sent, deleted, or permanently changed during diagnosis.

### Safety

This record excludes mailbox totals, UIDs, senders, subjects, message content, credentials, and access details. WordPress was not modified.

## Objective

Complete the controlled SMS delivery path, repair scheduled-worker authorization drift, and promote the verified ALEX planner to the primary Telegram route without touching WordPress.

## Work completed

- Confirmed the SMS provider's business registration and sending identity were approved at a high level without recording account identifiers.
- Diagnosed failed SMS tests as a transposed recipient-number error rather than a provider-credit or registration failure.
- Sent one controlled test to the corrected recipient and independently verified delivered status.
- Added delivery-status polling to the ALEX SMS adapter so accepted-but-unverified messages cannot be reported as delivered.
- Added a regression test for the delivery-verification behavior.
- Verified 77/77 local tests and 71/71 production tests.
- Deployed the narrow SMS-adapter change with a timestamped backup, restarted only the ALEX application service, and verified service health.
- Found the scheduled GEO SMS synchronization and Hostinger email monitor failing with authorization errors.
- Verified that each worker selected a superseded protected credential while a current credential was available.
- Backed up the protected configurations, aligned them with current credentials without exposing values, and manually verified both workers completed successfully.
- Confirmed the email monitor processed new mail and classified important and low-priority items without documenting message content.
- Activated the pre-existing primary-routing switch for normal Telegram text and voice.
- Added `/alex` as an explicit alias and preserved `/alex2`, `/aprobar`, and `/ejecutar`.
- Validated Python syntax before restart and confirmed both the Telegram bot and controlled planner services were active.
- Jorge confirmed that a command-free Telegram test received a response.

## Decisions

- Provider acceptance is not delivery; ALEX reports SMS success only after verified delivered status.
- ALEX is now the primary conversational route, while the prior explicit alias remains temporarily for rollback and comparison.
- Scheduled workers must fail visibly on credential drift and must be included in release-health checks.
- Public memory records architecture, results, and recovery posture only; it never records recipients, provider IDs, message contents, endpoints, secret values, or client data.

## Verification evidence

- Controlled provider read-back: delivered.
- Local automated suite: 77/77 passing.
- Production automated suite: 71/71 passing.
- ALEX application health check: healthy after restart.
- GEO SMS synchronization worker: successful manual run.
- Email monitor: successful manual run.
- Telegram bot and planner services: active after promotion.
- Command-free Telegram request: response confirmed by Jorge.

## Remaining work

- Review the exact first primary-mode response for grounding and prioritization quality.
- Complete conversational smoke tests for Calendar, Airtable, email, and controlled SMS through the promoted route.
- Add deterministic validation and worker-health alerting.

## Safety and exclusions

WordPress was not modified. This record excludes credentials, account identifiers, phone numbers, client names, addresses, message content, raw logs, conversations, contracts, financial or legal information, database data, and exploitable access details.

## 2026-08-21 — Calendar travel-safety hardening

Diagnosed that Google Calendar already contained event locations but the availability bridge discarded them. The bridge now returns verified event timing/location metadata internally, and ALEX applies a deterministic pre-plan safety gate to estimate creation and rescheduling. Same-city cases pass; distant or unverifiable different locations on the same day stop safely and ask Jorge for one operational decision. Production verification: 87/87 tests, both services active, live event shape valid. No Calendar event, customer record, email, SMS, Airtable record, or WordPress content was changed.


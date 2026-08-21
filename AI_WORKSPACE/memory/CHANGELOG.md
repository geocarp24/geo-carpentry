# Changelog

## 2026-08-21 — Superagent core: unified memory, generalized email search, and date grounding

- Replaced fixed LinkedIn/Indeed-only mailbox term detection with natural-language extraction for senders, addresses, quoted subjects, and topics.
- Enriched operational client records with recent conversation messages, active durable memories, projects, email identity, pending questions, and Airtable linkage.
- Added high/medium/normal priority and deterministic recommended-next-action signals.
- Added automatic correction of mismatched Spanish and English weekday/date combinations in both responses and clarifying questions.
- Added regression tests and verified the complete production suite at 84/84 passing.
- Restarted only the ALEX planner service and verified it active with no error-level journal entries.
- Ran two live read-only requests; neither created a plan nor changed Calendar, Airtable, SMS, email, or WordPress.

## 2026-08-21 — Durable ALEX conversational memory

- Connected owner Telegram dialogue to the existing PostgreSQL conversation-memory model.
- Persisted inbound and outbound turns with idempotent external message identifiers.
- Added conversation summaries, pending-question state, and optimistic revisions.
- Ensured normal primary-mode text and voice reach ALEX before legacy conversational handlers.
- Added regression coverage and verified 72/72 production tests.
- Verified two-turn continuity and four persisted messages in one conversation without external mutations.
- Added a reusable autonomous-execution skill and workspace instruction.
- Preserved timestamped production rollback backups.
- WordPress was not modified.

## 2026-08-21 — Email classification, search, and named-folder plans

- Replaced broad raw-message keyword precedence with sender- and subject-aware classification.
- Suppressed job networks, ranking offers, nomination marketing, lead sellers, and drafting/estimating solicitations as low-priority promotions.
- Restricted permit, security, finance, and customer-lead alerts to stronger evidence.
- Added read-only mailbox search and exact provider counts.
- Added an approval-gated named-folder move using compact verified search terms and an expected-count guard.
- Added batch IMAP execution and post-move count verification for large result sets.
- Verified 75/75 application tests and 5/5 classifier regressions.
- Verified a live count request and a non-executed `Jobs` plan through ALEX.
- WordPress and mailbox contents were not modified.

## 2026-08-18 — SMS delivery verification and ALEX primary promotion

- Verified a controlled provider SMS was delivered after correcting a transcribed recipient-number error.
- Changed ALEX SMS behavior so provider acceptance alone is insufficient; verified delivery is required before success is reported.
- Recorded 77/77 passing local tests and 71/71 passing production tests.
- Repaired authorization drift affecting the scheduled GEO SMS synchronization and Hostinger email-monitor workers.
- Verified both scheduled workers complete successfully after repair.
- Promoted the controlled ALEX planner to the primary Telegram text and voice route.
- Added `/alex` as an explicit alias and preserved `/alex2` as a fallback.
- Preserved approval and execution command compatibility.
- Confirmed a command-free primary-mode Telegram request received a response.
- Created timestamped rollback backups before production code and configuration changes.
- WordPress was not modified.

## 2026-08-17 — Universal AI memory initialized

- Created a vendor-neutral, public-safe memory workspace.
- Added mandatory AI entry instructions and security boundaries.
- Documented the current ALEX, GEO SMS, Calendar, Airtable, email, and memory architecture.
- Recorded the 2026-08-17 ALEX hardening work and verified 62/62 tests.
- Documented known limitations and prioritized next work.
- Explicitly excluded secret values, client PII, private contracts, financial records, and raw production dumps.

## Documentation rule

Every future entry must state date, affected component, change, reason, verification, remaining risk, and rollback or recovery note when applicable.

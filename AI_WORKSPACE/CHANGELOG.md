# Changelog

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


# Open Tasks

## Critical

1. Run the final primary-route conversational smoke suite across read-only reconciliation, Calendar, Airtable, email, and controlled SMS.
2. Review the exact first command-free Telegram response and confirm it used verified context without date, identity, or availability errors.
3. Add deterministic validation of every model-proposed date, time, and booked-slot reference before displaying it.
4. Audit the public repository history and current files for accidentally committed secrets or sensitive configuration references.
5. Rotate any credential that was ever placed in a chat, memory document, archive, or public commit.

## High priority

1. Add automated regression tests for booked-slot exclusion, Wisconsin date grounding, one-question scheduling, two-crew projects, Calendar/Airtable reconciliation, and SMS continuity.
2. Verify long-running email classification behavior and alert quality after the credential repair.
3. Add service-health alerts for scheduled-worker authorization failures.
4. Create disaster-recovery runbooks for the VPS, shared-hosting bridge, operational memory, and controlled executors.
5. Reconcile stale legacy memory with the verified 2026-08-18 production architecture.

## Completed in this block

- Controlled SMS execution adapter with preview, idempotency, provider receipt, status polling, and delivery verification.
- Live provider delivery confirmation using a controlled test.
- Repair and successful manual verification of GEO SMS synchronization and email monitoring.
- Promotion of ALEX to the primary normal-text and voice route with preserved fallback commands.
- Daily sanitized documentation routine and draft-PR-only publication policy.

## Documentation

1. Inventory production components using names and roles without secrets.
2. Document deployment and rollback for every agent.
3. Record decisions with date, rationale, rejected alternatives, and owner.
4. Archive superseded documents instead of silently overwriting history.
5. Maintain a map from old agent names and files to current names.


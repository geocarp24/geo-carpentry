# Open Tasks

## Critical

1. Run periodic approved-action smoke tests across Calendar, Airtable, email, and controlled SMS; the current read-only primary-route reconciliation tests are complete.
2. Audit the public repository history and current files for accidentally committed secrets or sensitive configuration references.
3. Rotate any credential that was ever placed in a chat, memory document, archive, or public commit.

## High priority

1. Expand automated regression coverage for booked-slot exclusion, route feasibility, one-question scheduling, two-crew projects, Calendar/Airtable reconciliation, and SMS continuity.
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
- General natural-language mailbox search with deterministic term extraction.
- Unified operational client memory across conversations, memories, projects, Airtable identity, and pending work.
- Deterministic weekday/date grounding before ALEX displays a response.
- Deterministic same-day geographic safety gate using verified Calendar event locations, with conservative blocking when distance cannot be verified.

## Documentation

1. Inventory production components using names and roles without secrets.
2. Document deployment and rollback for every agent.
3. Record decisions with date, rationale, rejected alternatives, and owner.
4. Archive superseded documents instead of silently overwriting history.
5. Maintain a map from old agent names and files to current names.


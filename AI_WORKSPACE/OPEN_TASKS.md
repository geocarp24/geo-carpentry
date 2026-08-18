# Open Tasks

## Critical

1. Build a controlled SMS execution adapter for ALEX with explicit approval, provider receipt, deduplication, and delivery verification.
2. Add deterministic validation of every model-proposed date, time, and booked-slot reference before displaying it.
3. Audit the public repository history and current files for accidentally committed secrets or sensitive configuration references.
4. Rotate any credential that was ever placed in a chat, memory document, archive, or public commit.
5. Reconcile stale legacy memory with the verified 2026-08-17 production architecture.

## High priority

1. Add automated regression tests for:
   - booked-slot exclusion from natural-language drafts,
   - Wisconsin date grounding,
   - one-question scheduling,
   - two-crew project scheduling,
   - Calendar/Airtable reconciliation,
   - SMS conversation continuity.
2. Create a daily sanitized system-status snapshot.
3. Create automatic documentation reminders or commits after significant task completion.
4. Complete ALEX email workflows and verify long-running classification behavior.
5. Create disaster-recovery runbooks for VPS and shared-hosting components.

## Documentation

1. Inventory production components using names and roles without secrets.
2. Document deployment and rollback for every agent.
3. Record decisions with date, rationale, rejected alternatives, and owner.
4. Archive superseded documents instead of silently overwriting history.
5. Maintain a map from old agent names and files to current names.

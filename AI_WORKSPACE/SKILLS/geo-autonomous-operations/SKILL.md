---
name: geo-autonomous-operations
description: Continue Geo Carpentry technical and operational work autonomously from verified project context. Use when Jorge says to continue, proceed, finish everything possible, work without stopping, avoid unnecessary questions, document the work, or request his help only for a concrete external blocker. Covers diagnosis, implementation, testing, production safety, cross-system coordination, and durable AI memory updates.
---

# Geo Autonomous Operations

## Operating rule

Continue through every safe, in-scope task that can be completed with available access. Do not pause for routine choices, status confirmation, or information discoverable from files, logs, tests, APIs, or documented memory.

Ask Jorge only for a missing credential or login, a material business choice, approval for sending/deleting/spending/publishing/irreversible production actions, a manual UI action tools cannot perform, or ambiguity that remains after evidence-based investigation.

When asking, state exactly one action Jorge must take, why it is needed, and how to confirm completion.

## Workflow

1. Load `AGENTS.md` and `AI_WORKSPACE/START_HERE.md`.
2. Inspect files, services, logs, tests, and recent changes.
3. Trace every boundary involved in a failure.
4. Establish a reproducible baseline and root cause.
5. Make the smallest coherent fix.
6. Test normal behavior, ambiguity, retries, idempotency, stale data, partial external failure, and recovery.
7. Run complete verification before claiming success.
8. Deploy only with authorization and rollback. Never modify WordPress without explicit authorization.
9. Verify live outcomes through destination read-back.
10. Update durable sanitized project memory.

## Cross-system requirements

- Calendar is the source of truth for occupied time.
- Airtable is the source of truth for lead and customer workflow state.
- GEO SMS memory is evidence of client intent, not automatic authorization.
- ALEX reconciles sources, reports conflicts, proposes, obtains approval, executes exactly the approved operations, and verifies each destination.
- Use stable identifiers and provenance.
- Make executions idempotent.
- Never report success for a partially completed multi-system operation.

## Public-memory sanitation

Exclude secrets, credentials, tokens, private keys, environment contents, customer PII, raw conversations, contracts, financial/legal records, database dumps, and exploitable infrastructure details from public repositories.
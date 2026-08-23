# Operating Methodology

## Standard task lifecycle

1. **Load context**
   - Read this workspace, current status, security rules, and relevant runbook.
2. **Observe**
   - Inspect live state read-only and identify the actual source of truth.
3. **Diagnose**
   - Reproduce the issue and capture exact errors.
4. **Design**
   - Define desired behavior, safety boundaries, failure handling, and rollback.
5. **Back up**
   - Preserve the exact production files or state being changed.
6. **Implement narrowly**
   - Change only the required component; preserve unrelated user work.
7. **Test**
   - Run automated tests and a production-safe reproduction.
8. **Verify**
   - Confirm the actual external result through an independent read.
9. **Document**
   - Update current status, changelog, runbook, and session log.
10. **Handoff**
   - State completed work, remaining risk, and the next exact test.

## Assistant behavior methodology

- Lead with the outcome.
- Ask one question at a time only when required.
- Do not make Jorge repeat information that exists in verified memory.
- Read-only work should proceed without approval.
- External or destructive actions must use proposal, approval, execution, and verification.
- Never hide failure behind a generic success message.
- When model output conflicts with deterministic data, deterministic data wins.

## Definition of done

A task is complete only when:

- desired behavior is implemented,
- relevant tests pass,
- the real scenario is reproduced successfully,
- services are healthy,
- rollback exists,
- documentation is current,
- no unauthorized system was modified.

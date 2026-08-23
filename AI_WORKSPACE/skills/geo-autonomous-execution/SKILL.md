---
name: geo-autonomous-execution
description: Execute Geo Carpentry work end-to-end with minimal interruption. Use for diagnostics, implementation, testing, documentation, deployment, and operational improvements when Jorge asks to continue, finish, work autonomously, move fast, or consult him only when strictly necessary.
---

# Geo Autonomous Execution

## Operating rule

Continue useful in-scope work until the requested outcome is implemented and verified. Do not stop merely to narrate a plan, ask for confirmation already granted, or request information that can be discovered safely.

## Workflow

1. Load the existing project memory and inspect the current state before repeating research.
2. State the immediate action briefly, then begin work.
3. For bugs, reproduce or collect evidence, identify the root cause, implement the smallest durable fix, and add regression coverage.
4. Back up production files before changing them. Never expose or publish secrets, credentials, client data, raw conversations, financial data, or exploitable access details.
5. Verify syntax, automated tests, service health, logs, persistence, and the real user flow in proportion to risk.
6. Keep working through safe next steps without waiting for acknowledgements such as “continúa”.
7. Document architecture, decisions, changes, verification evidence, remaining risks, rollback location, and next steps in the project memory.
8. Before claiming completion, obtain fresh evidence that the result actually works.

## Ask Jorge only when necessary

Pause only when progress requires one of these:

- A credential, login, token, approval, or physical action only Jorge can provide.
- A destructive or irreversible external action not already explicitly authorized.
- A business choice with materially different outcomes that cannot be inferred safely.
- A missing fact that cannot be discovered and would make implementation unsafe.

Ask one precise question, explain why it blocks the next action, and continue every other independent task while waiting.

## Communication

- Use short progress updates focused on outcomes, evidence, blockers, and the next action.
- Do not repeat completed work or ask unnecessary multiple-choice questions.
- Do not claim “100%” unless the full real-world scope has been verified; state remaining limitations plainly.
- If a test fails, report the actual failure and continue diagnosing.

## Geo Carpentry safeguards

- Never update or modify WordPress unless Jorge explicitly authorizes that exact change; the production child theme is update-sensitive.
- Treat Calendar, Airtable, SMS, email, Telegram, and production agents as live systems.
- Require approval at the moment of sending, deleting permanently, canceling, moving appointments, or making another consequential external change unless the user already authorized that exact action.
- Prefer reversible changes, backups, shadow mode, idempotency, audit logs, and rollback paths.

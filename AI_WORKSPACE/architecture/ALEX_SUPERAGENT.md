# ALEX Superagent Architecture

**Status:** production primary assistant with controlled execution and rollback compatibility.

## Email deletion safety and conversation-state resilience (2026-08-22)

- Pending clarifying questions have one durable object shape; malformed historical values are treated as absent rather than replayed indefinitely.
- A request to empty Trash is represented as one approval-gated action with an exact verified mailbox total.
- Execution re-reads the full Trash UID set and fails closed if the mailbox changed after approval.
- Permanent deletion is never performed during planning and is never automatic.
- Telegram retains sanitized internal error codes so operational failures are diagnosable without exposing secrets.

## Purpose

ALEX is Jorge's operating assistant for Geo Carpentry. Its job is to understand ongoing work, surface priorities, organize communication, prepare safe plans, and execute consequential actions only after the required approval.

## Verified layers

1. **Telegram interface** — receives normal text and voice. ALEX is the primary route; legacy command aliases remain for compatibility and rollback.
2. **Planner** — converts natural language into a structured response, at most one clarifying question, and zero or more typed actions.
3. **Verified context** — reads Calendar availability, Airtable leads, Hostinger email, GEO SMS history, projects, durable memories, recent plans, and integration events.
4. **Unified client profile** — reconciles identity by stable Airtable record or unique normalized phone, then combines conversation summary, pending question, recent messages, durable facts, projects, last contact, and source conflicts.
5. **Priority engine** — marks inbound replies or unresolved questions high priority, active projects medium priority, and supplies a deterministic next-action signal.
6. **Travel-safety gate** — compares a proposed estimate or reschedule against verified same-day Calendar locations and stops distant or unverifiable combinations before plan persistence.
7. **Policy gate** — denies forbidden capabilities and requires approval for consequential Calendar, Airtable, SMS, and email operations.
8. **Controlled executors** — use previews, input validation, idempotency, provider receipts, and post-action verification.
9. **Durable PostgreSQL memory** — stores people, projects, conversations, messages, memories, plans, approvals, tool executions, audit records, external-object mappings, and integration events.

## Current capabilities

- Maintain owner conversation continuity across normal Telegram text and voice.
- Review and prioritize active client conversations and projects without making changes.
- Read Calendar as the authority for occupied time.
- Prepare and, after approval, create/reschedule/cancel appointments and projects.
- Model Jorge plus two independent crews; crew-only work need not block Jorge.
- Read and safely update Airtable lead status through a schema-aware controlled adapter.
- Search Hostinger email from ordinary Spanish or English requests by sender, email address, quoted subject, or topic.
- Classify new mail with sender/subject-aware rules that reduce false permit, finance, security, and lead alerts.
- Prepare drafts, organize folders, move to review/trash, restore, send, or permanently delete through capability-specific approval rules.
- Read GEO SMS context and use a controlled SMS adapter with preview, idempotency, provider receipt, delivery polling, and verification.
- Correct mismatched English or Spanish weekday/date labels before displaying a response.
- Prevent unsafe geographically separated same-day estimate commitments using verified Calendar event metadata; unknown distance fails conservatively.
- Fail closed when identity, availability, mailbox contents, approval state, or external verification changes.

## Safety rules

- WordPress is protected and must not be updated or changed without exact explicit authorization.
- Read operations may run automatically; consequential external changes use the policy and approval flow.
- Calendar, Airtable, email, SMS, and the database are live systems.
- Never invent clients, availability, record identifiers, addresses, dates, or completed actions.
- Never claim delivery or completion without provider or post-action verification.
- Keep backups and an idempotent rollback path for every production change.

## Known remaining limits

- The current deterministic route guard covers known Northeast Wisconsin cities and unknown-location fail-closed behavior; broader city coverage and true road travel-time calculation remain future enhancements.
- Historical owner conversations from before durable-memory activation are not reconstructed automatically.
- Old components remain installed as rollback until the replacement has sustained production evidence.
- Public documentation intentionally excludes client data, secrets, raw conversations, production archives, and exact access details.


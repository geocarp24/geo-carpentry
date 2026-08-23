# Geo Carpentry — Universal AI Workspace

**Purpose:** durable, vendor-neutral memory for Codex, Claude Code, Manus, ChatGPT, and future authorized assistants.

**Last consolidated:** 2026-08-17  
**Repository visibility:** public; all content here must remain sanitized.

## Mandatory reading order

1. [SECURITY_RULES.md](SECURITY_RULES.md)
2. [CURRENT_STATUS.md](CURRENT_STATUS.md)
3. [ARCHITECTURE.md](ARCHITECTURE.md)
4. [OPEN_TASKS.md](OPEN_TASKS.md)
5. Relevant documents under [AGENTS/](AGENTS/), [RUNBOOKS/](RUNBOOKS/), [METHODOLOGY/](METHODOLOGY/), and [SKILLS/](SKILLS/)

## Source-of-truth rules

- This directory explains intent, architecture, decisions, status, and recovery.
- Production systems remain the source of truth for live state.
- Secrets live only in approved secret stores or protected environment files.
- Never copy secret values into this repository.
- When documentation and production disagree, record the discrepancy and verify before changing anything.
- Every significant task must leave a dated trace in `SESSION_LOGS/` and `CHANGELOG.md`.

## Business identity

Geo Carpentry LLC is a **General Contractor** serving Northeast Wisconsin. Do not describe it merely as a carpentry or remodeling company.

## Current focus

Stabilize and complete the operating assistant ecosystem:

- ALEX: Jorge's owner-facing assistant.
- GEO SMS: client-facing bilingual lead and appointment agent.
- Google Calendar coordination.
- Airtable CRM consistency.
- Hostinger email management.
- Durable cross-system memory and approval-controlled execution.

## Public documentation boundary

Allowed: sanitized architecture, interfaces, methodologies, capabilities, rules, test results, recovery steps, and non-sensitive configuration names.

Forbidden: passwords, API tokens, private keys, OAuth client secrets, full client conversations, private phone numbers, client addresses, financial records, contracts, government documents, database exports, and exploitable production access details.

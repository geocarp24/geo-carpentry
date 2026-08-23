# Geo Carpentry AI Workspace

This directory is the public-safe operational memory for Geo Carpentry's AI systems. It is designed so Codex, Claude Code, Manus, or another authorized AI can understand the verified architecture, decisions, safeguards, current state, and remaining work without relying on one chat or one computer.

## Contents

- `AGENTS.md`: standing rules for AI collaborators.
- `memory/`: current state, open work, changelog, and sanitized session history.
- `architecture/ALEX_SUPERAGENT.md`: verified ALEX architecture and capability boundaries.
- `methodology/CHANGE_CONTROL.md`: production change, verification, rollback, and documentation process.
- `skills/geo-autonomous-execution/SKILL.md`: reusable autonomous-execution skill.

## Security boundary

This repository is public. Never add credentials, environment files, OAuth material, customer records, raw conversations, contracts, financial/legal data, private database exports, production archives, or exploitable access instructions. Production source and configuration remain outside this public-safe workspace unless separately reviewed.

## Update policy

Documentation changes are prepared on a separate branch and pull request for human review. They are not merged automatically.

# Project Skills Registry

This file records reusable capabilities and when an AI should apply them. It does not copy proprietary third-party skill packages.

## Core project skills

### Geo memory management
Use at session start and after significant work.

- Load `START_HERE.md`, security rules, current status, and relevant runbooks.
- Update state, decisions, changelog, and session log.
- Never store secret values.

### Systematic debugging
Use for every unexpected response, service failure, test failure, or integration mismatch.

- Reproduce.
- Gather evidence.
- Identify root cause.
- Implement a narrow correction.
- Test the same failing scenario.
- Check for regressions.

### Verification before completion
Use before claiming a feature is fixed or production-ready.

- Run relevant automated tests.
- Verify service health.
- Reproduce the exact user scenario.
- Independently read the resulting external state.
- Document evidence and limitations.

### Production change control
Use for VPS, shared hosting, Calendar, Airtable, email, SMS, and WordPress.

- Create backup.
- Describe scope.
- Obtain required approval.
- Execute minimally.
- Verify and document rollback.

### Public-memory sanitation
Use before every GitHub documentation update.

Reject or redact:

- credentials and tokens,
- private keys and configuration values,
- client PII and raw conversations,
- financial/legal documents,
- private infrastructure access details,
- database dumps.

## Future custom skills

- ALEX release checklist.
- GEO SMS regression suite.
- Calendar conflict and travel validation.
- Email classification and safe deletion.
- Repository secret scanning.
- Nightly documentation snapshot and drift detection.

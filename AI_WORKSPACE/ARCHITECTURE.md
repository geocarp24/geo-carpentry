# Sanitized System Architecture

## High-level flow

```text
Website forms / client channels
        |
        v
Shared hosting: WordPress + GEO SMS PHP tools
        |
        +--> Airtable CRM and conversation records
        +--> Google Calendar bridge
        +--> Telegram notifications
        |
        v
Scheduled sanitized conversation synchronization
        |
        v
VPS assistant platform
  - ALEX Telegram router
  - ALEX policy/planning service
  - PostgreSQL operational memory
  - controlled Calendar executor
  - controlled Airtable executor
  - Hostinger email adapter
        |
        v
Jorge proposal / approval / execution / verification
```

## Trust boundaries

1. **Public website boundary:** anonymous traffic, forms, spam controls, WordPress.
2. **Shared-hosting application boundary:** GEO SMS and web integrations.
3. **VPS operations boundary:** ALEX, scheduled workers, operational memory.
4. **External systems:** Google Calendar, Airtable, Hostinger email, Telegram.
5. **Human approval boundary:** Jorge authorizes sensitive or external mutations.

## Memory layers

- **Operational memory:** PostgreSQL for runtime events, plans, approvals, idempotency, and state.
- **Business systems:** Calendar and Airtable remain authoritative for appointments and CRM state.
- **Conversation source:** GEO SMS conversation files and synchronized integration events.
- **Durable AI documentation:** this `AI_WORKSPACE/` directory in Git.
- **Local/private archive:** sensitive materials stay outside the public repository.

## Deployment principle

Documentation describes component roles and recovery steps without publishing access credentials, private endpoints, client data, or secret-bearing configuration.

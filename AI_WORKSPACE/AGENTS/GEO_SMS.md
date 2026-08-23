# GEO SMS — Client-Facing Lead and Appointment Agent

## Mission

Handle bilingual client conversations, qualify legitimate construction leads, maintain context, coordinate appointment requests, and synchronize reliable information with business systems.

## Responsibilities

- Recognize English and Spanish messages, including conversational phrasing.
- Maintain conversation continuity instead of treating every SMS as a new lead.
- Collect missing information one question at a time.
- Distinguish customers from spam, recruiters, marketers, and service sellers.
- Propose rescheduling before accepting a final cancellation.
- Escalate uncertainty, conflicts, dissatisfied clients, contract questions, and schedule exceptions.
- Keep CRM and Calendar aligned only through verified integrations.
- Avoid double booking and incorrect date/time interpretation.

## Data flow

```text
Inbound SMS
  -> webhook validation and deduplication
  -> conversation memory
  -> language/intent extraction
  -> policy-aware response
  -> CRM update
  -> optional Calendar coordination
  -> owner notification/escalation
```

## Synchronization with ALEX

A scheduled bridge imports sanitized GEO conversation events into ALEX operational memory. This allows ALEX to reason across recent client conversations, CRM status, Calendar events, and email without reading raw secrets.

## Required safeguards

- Deduplicate provider retries.
- Store explicit timezone-aware dates.
- Never confirm a slot until Calendar verification succeeds.
- Never fabricate a customer, record ID, address, or appointment.
- Preserve a complete audit trail.
- Client-facing cancellation should first offer rescheduling; release the slot only after final confirmed cancellation.

# Security and Operating Rules

## Absolute restrictions

- Never commit credentials, tokens, passwords, private keys, cookies, OAuth secrets, `.env` contents, or database connection strings.
- Never commit client PII, raw conversations, private addresses, contracts, financial records, or legal documents.
- Never make direct WordPress, plugin, theme, Elementor, or child-theme updates without Jorge's explicit authorization. The site has previously broken after updates.
- Never send email, SMS, publish content, delete data, spend money, or mutate production without the required approval.
- Never claim an external change succeeded until a separate read verifies the result.
- Never invent clients, identifiers, Calendar availability, addresses, prices, or system capabilities.
- Use `admin@geocarpentry.com` for approved business notifications. Do not substitute personal addresses.
- Geo Carpentry is a General Contractor.
- Public documentation must reference secret locations only at a high level and never reveal secret values.

## Approval model

Read-only inspection and analysis may run automatically.

The normal mutation flow is:

1. Observe verified state.
2. Prepare a clear proposal.
3. Obtain explicit approval.
4. Execute only the approved scope.
5. Verify through an independent read.
6. Record outcome and rollback information.

Moving or cancelling appointments must consult Jorge when policy requires it. Email deletion requires staged approval: review or Trash first, permanent deletion only through a separate later approval.

## Calendar integrity

- Timezone: America/Chicago.
- Never use UTC `Z` timestamps for Wisconsin scheduling output.
- Never offer a time that overlaps a verified booked slot.
- Calendar reads do not require approval.
- Calendar creation, movement, cancellation, or blocking requires policy-gated approval.
- Respect work hours, travel distance, Jorge's availability, and two independent crews.

## Documentation hygiene

Each change record must include date, system, reason, files/components, backup, verification, result, and rollback.

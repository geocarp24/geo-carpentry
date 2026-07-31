# Session defaults

At start of every session in this repo, apply these skills automatically, without waiting for the user to ask:

- **caveman** (full intensity) — respond in terse, compressed style for all chat replies. Exceptions per the skill's own rules (security warnings, irreversible actions, code/commits/PR bodies stay normal prose).
- **humanizer** — when writing or editing any user-facing text (docs, marketing copy, emails, etc.), apply humanizer rules to strip AI-writing tells (em dashes, rule of three, inflated language, etc.) before delivering.

Both stay active for the whole session unless the user says "stop caveman" / "normal mode" (for caveman) or asks to skip humanizing for a specific piece of text.

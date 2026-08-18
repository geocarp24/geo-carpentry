# Tenant Persona — TEMPLATE
> Copy this file as: agents/tenants/{tenant-slug}_persona.md
> Fill in all fields during onboarding wizard (Step 2: Business Profile)

---

## Business Identity
business_name: [REQUIRED]
tenant_slug: [REQUIRED — lowercase, hyphens, no spaces]
owner_name: [REQUIRED]
founded: [YEAR]
entity_type: [LLC / S-Corp / Sole Proprietor]
certifications: [Licensed & Insured / Bonded / etc.]

## Contact
phone: (from vault — telnyx.phone_number)
email: (from vault — hostinger_email.email)
website: [DOMAIN or TBD — provisioned subdomain if none]
address: [FULL ADDRESS]

## Industry
type: [General Contractor / Real Estate Investor / Plumber / HVAC / etc.]
tagline: [OPTIONAL]
differentiators:
  - [Differentiator 1]
  - [Differentiator 2]

## Services & Pricing
[service_name]: $[MIN] – $[MAX]
[service_name]: $[MIN] – $[MAX]

## Service Area
primary: [CITY, STATE]
secondary:
  - [City 2]
  - [City 3]
county: [COUNTY NAME]
state: [STATE]

## Brand Voice
tone: [Professional / Casual / Technical / Friendly]
warmth: [Low / Medium / High]
languages: [English] # Add Spanish if bilingual
avoid: [Things NOT to say]
use: [Preferred language patterns]

## SMS / Fer Agent Behavior
greeting_en: "Hi! This is the [Business Name] team. Thanks for reaching out! How can we help?"
response_language: English # or "Match customer language" if bilingual
booking_link: [URL or "N/A"]
follow_up_hours: 1
max_follow_ups: 3

## Social Media
facebook_page: [URL or "Not connected"]
instagram: [URL or "Not connected"]
post_frequency: 3x per week
content_mix: [project_photos, tips, testimonials]
hashtags: ["#[City]Contractor", "#[Service]"]

## SEO Focus
target_keywords:
  - "[primary service] [city] [state]"
  - "[secondary service] [city]"
google_business_category: [GBP Category]
schema_type: [GeneralContractor / HomeAndConstructionBusiness / LocalBusiness]
rating: [CURRENT RATING or "5.0"]

## Legal / Compliance
tcpa_consent_language: "By submitting this form, you agree to receive automated text messages from [Business Name] at the number provided. Reply STOP to opt out."
spam_prevention: Never text without explicit opt-in

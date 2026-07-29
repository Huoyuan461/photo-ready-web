# Independent Site Architecture

Date: 2026-07-27

## Goal

Turn `photo-ready-web` into one publishable independent site that presents:

- the main B2C product: `PhotoReady`
- the side-product shelf: `PFMEA`, `Lean`, and `Office Ops` packs
- the pricing path
- the preview flow
- the launch and support pages

## Site Type

Hybrid product-marketing site:

- Web app preview flow
- Product catalog
- SEO landing pages
- Support / policy pages

## Primary Navigation

- Home `/`
- Products `/products`
- Preview `/preview`
- Pricing `/pricing`
- Plan `/ops`
- Support `/support`

## Page Hierarchy

```text
Homepage (/)
├── Products (/products)
│   ├── PhotoReady main offer
│   ├── PFMEA Offline Pack
│   ├── Lean Problem Solving Kit
│   └── Office Ops Checklists
├── Preview (/preview)
├── Pricing (/pricing)
├── Solutions
│   ├── Passport Photo (/solutions/passport-photo)
│   ├── LinkedIn Headshot (/solutions/linkedin-headshot)
│   └── Resume Photo (/solutions/resume-photo)
├── Founder Plan (/ops)
├── Support (/support)
├── Privacy (/privacy)
├── Refund (/refund)
└── Legacy Ops (/ops/legacy)
```

## Conversion Paths

### Main B2C flow

`Home -> Products -> Preview -> Pricing -> Checkout / Waitlist`

### Side-product flow

`Home -> Products -> Side pack detail block -> External checkout`

### Planning flow

`Home -> /ops -> founder implementation plan -> product and launch work`

## Internal Linking Rules

- Every page should point back to `/preview`, `/pricing`, or `/products`.
- Solution pages should point to `/preview`.
- Pricing page should point to `/preview` and `/support`.
- Product catalog should link both the main product and side products.
- Footer should expose policy and support pages for trust.

## Release Notes

- `/ops` is the founder-facing plan center, not the customer-facing product page.
- `/ops/legacy` preserves the older operations workspace.
- This structure supports current launch validation without forcing a heavy multi-product architecture too early.

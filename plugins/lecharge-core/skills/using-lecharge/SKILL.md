---
name: using-lecharge
description: Use at the start of ANY LeCharge work (proposals, landing-page edits, blogs, any on-brand content). Establishes the brand rules and routes to the right LeCharge skill.
---

# Using LeCharge

You are working on LeCharge, an EV-charging company. Everything you produce must be
on-brand and consistent across skills. Read this before acting.

## Non-negotiable brand rules

These apply to every LeCharge skill and every piece of output:

1. **Language: Spanish.** All client-facing and site copy is Spanish.
2. **Never use em dashes.** Use commas, colons, or parentheses instead. This is a hard rule.
3. **Design system, exactly.** Near-monochrome with one green accent `#00a15c`
   (`--accent`), SF Pro type, generous whitespace. Use the design tokens verbatim;
   do not invent colors, fonts, or spacing.
4. **Live reference:** https://lecharge.co. When unsure how something should look, match the live site.

The design system is single-sourced in `packages/lecharge-ui` in the marketplace repo
and vendored into each plugin's `assets/`. Each skill reads the copy in its own
`assets/` folder (`tokens.css`, `components.css`, `print.css`, `sprite.svg`, `COMPONENTS.md`).

## Routing: pick the right skill

- The user wants an **on-brand client proposal** (a quote, a commercial proposal, a PDF for a client):
  use `lecharge-proposals:proposal-generator`.
- The user wants to **edit the landing site**: a new blog post, a new landing section,
  a copy change on lecharge.co: use `lecharge-landing:landing-editor`.
- The user wants to **track work**: what is assigned to me, what is next, issue status,
  logging a follow-up in Linear: use `lecharge-core:tracking`.

If the intent is ambiguous, ask one clarifying question, then route.

## How to behave

- Announce which LeCharge skill you are using and why.
- Follow that skill's steps exactly.
- Re-check the brand rules above before you emit any final copy or file.

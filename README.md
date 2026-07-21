# lecharge-marketplace

A marketplace of plugins/templates that let the LeCharge commercial team generate
on-brand client **proposals** using the LeCharge design system.

## Status

Greenfield. This repo is seeded with:

- `MARKETPLACE-PLAN.md` — first-pass orientation: reusable design primitives, 2-3
  architecture directions (recommendation: data-driven templates + generator that
  grows into a visual builder), and open questions to resolve before building.
- `design/tokens.css` — the LeCharge design tokens (palette, type, radius, easing),
  extracted from the landing page.
- `design/landing-reference.css` — full copy of the landing page's stylesheet, for
  component reference (buttons, cards, charts, charger illustration, etc.).

## Design system source

The design system currently lives in the LeCharge landing repo (`LumaSystems/landing`,
`public/styles.css` + `public/index.html`). Live site: https://lecharge.co
Aesthetic: Apple-discipline — near-monochrome with one green accent (`#00a15c`),
SF Pro, generous whitespace. Copy is Spanish. **No em dashes ("—") in any copy.**

Part of the plan is deciding whether to extract a shared `lecharge-ui` package so the
landing site and proposals stay single-sourced.

## Next step

Brainstorm direction with the team (see the open questions in `MARKETPLACE-PLAN.md`),
then scaffold the chosen architecture.

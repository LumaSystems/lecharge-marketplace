# lecharge-marketplace

A marketplace of plugins/templates that let the LeCharge commercial team generate
on-brand client **proposals** using the LeCharge design system.

## Structure

- `packages/lecharge-ui/` single source of the design system: `tokens.css`, `components.css`
  (landing library), `proposal-doc.css` (vertical A4 chassis), `proposal-deck.css` (landscape
  16:9 chassis), `sprite.svg`, `brand/` (logo SVGs), and `COMPONENTS.md` (block catalog for
  both proposal formats).
- `plugins/lecharge-core/` orientation (`using-lecharge`) plus Linear issue tracking
  (`tracking` and a bundled Linear MCP server). Install this first.
- `plugins/lecharge-proposals/` proposal generator: asks whether the client wants a vertical
  document or a landscape deck, then walks a conversation from content to HTML to PDF via
  headless Chrome.
- `plugins/lecharge-landing/` on-brand landing page edits delivered via pull requests.
- `.claude-plugin/marketplace.json` lists the plugins so Cowork can install them from this repo.

## Design system source

The design system was extracted from the LeCharge landing repo (`LumaSystems/landing`,
`public/styles.css` + `public/index.html`) into `packages/lecharge-ui/`, so the landing
site and proposals stay single-sourced. Live site: https://lecharge.co
Aesthetic: Apple-discipline, near-monochrome with one green accent (`#00a15c`),
SF Pro, generous whitespace. Copy is Spanish. **No em dashes in any copy.**

## Using it in Cowork

Add this git repo as a plugin marketplace in Cowork, then install `lecharge-core` plus
whichever capability you need.

## Maintaining the design system

Edit files only in `packages/lecharge-ui/`, then run `npm run sync` to vendor them into
every plugin. `npm run check-sync` fails if any plugin copy is stale. `npm test` runs the
full suite (sync, catalog, manifests, no-em-dash guard).

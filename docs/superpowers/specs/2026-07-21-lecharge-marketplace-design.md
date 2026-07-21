# LeCharge Marketplace — Design Spec

_Date: 2026-07-21_
_Status: approved design, pre-implementation. Next step: implementation plan (writing-plans)._

## Goal

Give the LeCharge commercial team on-brand, self-service capabilities delivered as
**Cowork plugins installed from this repo as a custom marketplace**. Two capabilities
at launch: (1) generate client **proposals** (conversation to HTML to PDF), and
(2) edit the **landing page** (blogs, sections, copy) via safe pull requests into an
existing deploy pipeline. Both draw on one centrally-sourced LeCharge design system.

Non-negotiable brand rules (single-sourced, inherited by every skill):
- Use the LeCharge design tokens exactly (`packages/lecharge-ui/tokens.css`).
- Copy is **Spanish**.
- **Never use em dashes ("—")** in any copy or content.
- Near-monochrome with one green accent `#00a15c`, SF Pro, generous whitespace.
- Live reference: https://lecharge.co. Design system also lives in `LumaSystems/landing`
  (`public/styles.css`).

## Background and platform facts

Confirmed from Anthropic docs (see Sources):
- **Cowork** is Anthropic's knowledge-work agent (desktop/web/mobile). Non-technical
  users describe a goal in natural language; Cowork executes multi-step work against
  their files and connected apps and produces real deliverables. It can run code.
- **Plugins** install into Cowork from marketplaces, including **custom Git-based
  marketplaces** (any git repo with a marketplace manifest). A plugin is a directory
  with `.claude-plugin/plugin.json` and component folders (`skills/`, `agents/`,
  `hooks/`, `bin/`, MCP config, etc.).
- **Skills** are `SKILL.md` files with YAML frontmatter (`name`, `description`, optional
  `allowed-tools`). A skill can **bundle asset files** (CSS, templates, reference docs,
  scripts) in its own directory and read them at run time.
- **Constraint that drives our architecture:** a skill can reliably read assets only
  from **its own** plugin directory (Cowork copies each plugin to an isolated cache).
  Cross-plugin runtime asset sharing is not reliable, so the design system is
  **vendored into each plugin at build time** rather than shared at run time.

## Architecture

This repo (`LumaSystems/lecharge-marketplace`) is **both** the design-system source and
the Cowork marketplace.

```
lecharge-marketplace/
├── .claude-plugin/
│   └── marketplace.json          # lists the three plugins
├── packages/
│   └── lecharge-ui/              # THE single source of truth (authored once)
│       ├── tokens.css            # palette, type, radius, easing (canonical)
│       ├── components.css        # buttons, bands, cards, chart, flow, etc.
│       ├── print.css             # A4/Letter page, margins, page-breaks, motion off
│       ├── sprite.svg            # inline icon <symbol> set
│       └── COMPONENTS.md         # block catalog: what each block is + its markup
├── scripts/
│   ├── sync-design.mjs           # vendors packages/lecharge-ui/* into each plugin
│   └── check-sync.mjs            # fails if any plugin's vendored copy is stale
├── plugins/
│   ├── lecharge-core/
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/using-lecharge/SKILL.md
│   ├── lecharge-proposals/
│   │   ├── .claude-plugin/plugin.json
│   │   ├── bin/render-pdf         # headless-Chrome HTML->PDF
│   │   └── skills/proposal-generator/
│   │       ├── SKILL.md
│   │       └── assets/            # vendored lecharge-ui (tokens/components/print/sprite/COMPONENTS)
│   └── lecharge-landing/
│       ├── .claude-plugin/plugin.json
│       └── skills/landing-editor/
│           ├── SKILL.md
│           ├── templates/         # blog-post + section scaffolds (on-brand)
│           └── assets/            # vendored lecharge-ui reference
└── docs/superpowers/specs/2026-07-21-lecharge-marketplace-design.md
```

### Design-system centralization

`packages/lecharge-ui` is authored once. `scripts/sync-design.mjs` copies it into each
plugin's skill `assets/`. Each published plugin is therefore **self-contained** (its
skill reads its own bundled CSS, satisfying Cowork's isolation), while there is exactly
**one authored source**. `scripts/check-sync.mjs` runs pre-publish and fails on drift.
Long-term, the landing repo can also consume `packages/lecharge-ui` so the live site is
single-sourced too (out of scope for v1).

`lecharge-ui` is extracted from the existing `design/landing-reference.css`, adapted so
the component set has **static/print** variants (no scroll-scrub, no count-up, motion
off) suitable for proposals and PDF, while preserving the visual language.

## Components

### Plugin: `lecharge-core` — skill `using-lecharge`

Master orientation skill, modeled on `using-superpowers` / `using-simos`. Team installs
this first. Responsibilities:
- Activate at the start of any LeCharge work.
- State the non-negotiable brand rules once (tokens, Spanish, no em dashes, accent, SF
  Pro, live reference) so downstream skills inherit them.
- Route intent to the right skill: proposal work to `lecharge-proposals:proposal-generator`;
  landing/blog/section/site edits to `lecharge-landing:landing-editor`.
- Explain the single-source design model.

No asset bundle required beyond the brand-rules text; it is orientation and routing.

### Plugin: `lecharge-proposals` — skill `proposal-generator`

Data flow: **conversation → data object → HTML → PDF → delivered files.**

1. **Intake (Spanish, one topic at a time):** cliente (nombre, sector, contacto, logo
   opcional), objetivo, solucion/producto elegido, especificaciones tecnicas (kW,
   conectores, numero de cargadores), terminos comerciales y precios, cifras de retorno
   (ROI), cronograma de despliegue, condiciones.
2. **Composition:** a proposal is an ordered set of section blocks selected from the
   catalog in `COMPONENTS.md`, each a static/print adaptation of a landing component:
   portada/cover, resumen ejecutivo, solucion y especificaciones, grafico de ROI
   (`bars2` with static values), tabla de precios, cronograma (`flow` stepper),
   segmentos/casos de uso, cita/testimonio, condiciones, contacto/CTA.
3. **Render HTML:** assemble one self-contained HTML file linking the vendored
   `tokens.css` + `components.css` + `print.css`, with client data injected. HTML is a
   first-class deliverable (clean structure, reusable).
4. **HTML to PDF:** `bin/render-pdf` (Puppeteer / headless Chrome) renders a print-clean
   PDF with `printBackground: true` so gradients, the green accent, and SF Pro survive.
   Page size A4 (Letter configurable), respecting `print.css` page-breaks.
5. **Deliver:** save both the `.html` and the final `.pdf` to the rep's files.

Interface: the skill's contract is "collect these fields in Spanish, emit HTML + PDF."
It depends on its vendored `assets/` and `bin/render-pdf`. It can be understood and
tested without reading the other plugins.

### Plugin: `lecharge-landing` — skill `landing-editor`

Assumes the deploy pipeline **already exists** (owner: user; deploy on merge to `main`).
The skill does not build CI. Flow:
1. Rep describes the change (new blog post, new landing section, copy edit).
2. Safe git flow: check out `LumaSystems/landing`, create a **branch**, never push to
   `main` directly.
3. Use bundled `templates/` (blog-post scaffold, section scaffold) built from the same
   design-system components, so new content is automatically on-brand. Enforce Spanish
   copy and no em dashes.
4. Open a **PR** for user review; on merge, the user's CI deploys. The skill explains
   this outcome to the rep.

A short setup note documents the GitHub prerequisites (repo access, auth) the rep needs.

### Marketplace mechanics

- `.claude-plugin/marketplace.json` lists all three plugins so the team adds this repo as
  a marketplace in Cowork and installs plugins from it.
- `lecharge-proposals` and `lecharge-landing` declare `lecharge-core` as a dependency, so
  installing either pulls in `using-lecharge`.
- Each plugin is independently versioned via its own `plugin.json`.

## Error handling and edge cases

- **PDF render fails / Chrome unavailable in runtime:** `bin/render-pdf` fails loudly with
  a clear message; the skill still delivers the HTML so the rep has a usable artifact and
  can fall back to browser "Save as PDF." (Primary path is headless Chrome per decision.)
- **Stale vendored design:** `check-sync.mjs` blocks publish; `sync-design.mjs` fixes it.
- **Landing edits:** never commit to `main`; PR-only. If the rep lacks GitHub access/auth,
  the skill stops and points to the setup note rather than failing mid-edit.
- **Em dashes / non-Spanish copy:** the skill instructions forbid them; the orientation
  skill restates the rule so it is enforced across plugins.

## Testing strategy

- `lecharge-ui`: visual smoke — render a sample proposal HTML and confirm tokens,
  accent, type, and print page-breaks look right in the PDF.
- `sync-design` / `check-sync`: unit-level — sync then assert vendored copies match
  source; mutate a source file and assert `check-sync` fails.
- `proposal-generator`: end-to-end with a sample data object → HTML → PDF; assert the PDF
  is produced, is non-empty, and contains the expected sections.
- `landing-editor`: dry-run the git flow against a scratch branch; assert branch+PR
  created, never a direct push to `main`; templates render on-brand.
- `using-lecharge`: confirm it loads, states brand rules, and routes sample intents to the
  correct skill.

## Scope and phasing

**In scope (v1):** the three plugins, `lecharge-ui` source + sync, `marketplace.json`,
headless-Chrome PDF, Spanish, hand-typed data.

**Out of scope (later):** visual drag/drop proposal builder; spreadsheet/CRM data feeds
(schema designed to allow it later); bilingual ES/EN; landing repo consuming
`packages/lecharge-ui`; building the landing CI (user owns it).

## Open decisions already made

- Two capability plugins + one core plugin (grow independently); design system
  centralized in `packages/lecharge-ui`, vendored into each plugin.
- Client receives a **PDF** (HTML also delivered); PDF via **headless Chrome** in the skill.
- Data **typed by hand** each time; schema allows a later feed.
- **Spanish** only.
- Canonical design source lives **here**; user owns the landing CI, plugin assumes it.

## Sources

- Claude Cowork product page — https://claude.com/product/cowork
- Plugins reference — https://code.claude.com/docs/en/plugins-reference
- Agent Skills — https://code.claude.com/docs/en/agent-sdk/skills
- Install plugins in Cowork — https://claude.com/docs/cowork/guide/plugins

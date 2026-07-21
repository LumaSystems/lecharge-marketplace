# LeCharge Proposal Marketplace — First-Pass Plan

_Status: orientation + proposal. Nothing built yet. Brainstorm with the user before implementing._

## Goal (restated)

Stand up a "marketplace" of reusable, on-brand proposal building blocks so the **commercial team** can quickly assemble client PROPOSALS using the existing LeCharge design system, without a designer or engineer in the loop.

---

## 1. Reusable design primitives (the raw material)

These already exist in `public/styles.css` / `index.html` / `main.js` and are what proposals would be assembled from.

### Design tokens (`:root`)
- **Palette (near-monochrome + one green):** `--bg #fff`, `--bg-alt #f5f5f7`, `--bg-dark #0b0c0e`, ink scale `--ink / --ink-2 / --ink-3`, `--dim`, `--hair`. Accent: `--accent #00a15c`, `--accent-2 #12b06a`, `--accent-deep #007a45`, `--accent-tint`.
- **Shape / motion:** `--radius 20px`, `--ease` + `--ease-io` cubic-beziers, `--maxw 1080px`.
- **Type:** SF Pro system stack (`--font`), tight letter-spacing, weight 600 headings. Fluid `clamp()` sizes throughout.

### Components (all pure HTML + CSS, no framework)
- **Buttons / links:** `.btn` + `.btn-primary/.btn-dark/.btn-ghost`, `.link` with animated chevron.
- **Nav + mobile menu:** fixed blur nav, hamburger, slide-down panel.
- **Layout bands:** `section.band` (+ `.grey`), `.section-head` (kicker + h2 + sub), `.wrap` container.
- **Hero:** `.hero` with radial `.glow`, eyebrow, gradient accent word.
- **CSS charger illustration:** `.charger-stage` / `.charger` / `.screen` (live kW readout, animated bars, breathing LED, cable+plug SVG). A signature brand asset, fully CSS.
- **Stats row:** `.stats` `.stat .num` with **count-up on scroll** (`data-to` / `data-dec`).
- **Dual-track cards:** `.tracks` / `.track` (host vs. invest), badge + big number + CTA.
- **Pinned product showcase:** `.pin` scroll-scrub with `.callout` annotations around the charger.
- **Feature pillars:** `.pillar` (alternating `.flip`), lead + checklist + `.p-visual` (soft/dark) with mockups: `.mock-pay` (payment/revenue cards) and `.mock-load` (load-balancing hub diagram).
- **Product cards:** `.products` / `.product` (icon, kind pill, desc, price).
- **Flow diagram:** `.flow` responsive stepper with connectors + return loop chip.
- **Bar chart:** `.chart` / `.bars2` / `.bar2` — animated fill on scroll, reference line, legend.
- **Segment grid:** `.segs` / `.seg` (icon + title + blurb).
- **Testimonial quote, final CTA band, footer.**
- **Reveal system:** `.reveal` → `.in` via IntersectionObserver; scroll-driven behaviors in `main.js`; full `prefers-reduced-motion` fallback.
- **Icon set:** inline SVG `<symbol>` sprite (`#spark`, `#check`, `#ic-inv`, `#ic-charger`, `#ic-car`).

**Takeaway:** the system is already a clean, dependency-free kit of parts. A proposal is essentially a *re-sequencing* of these bands with client-specific copy + numbers. That strongly shapes the architecture below.

---

## 2. Architecture directions

A "plugin/block" = **a self-contained proposal SECTION** (cover, executive summary, ROI chart, product spec, pricing table, deployment timeline, terms, etc.), each rendered from the shared design system and filled from a small data object. A "proposal" = an assembled ordered list of blocks + a client data record.

### Shared foundation (common to all three)
Extract the tokens + component CSS into a versioned **`design-tokens` / `lecharge-ui` package** (a single CSS file + the SVG sprite + a small JS for reveal/count-up/charts). Both the landing site and every proposal consume it. This is the highest-leverage first step regardless of direction — it prevents brand drift and means a token change (e.g. new accent) updates everything.

---

### Direction A — Data-driven templates + a static site generator (CLI)  ⭐ recommended
- **What a plugin is:** a block template (HTML partial / component) + its data schema. Blocks live in a registry; a proposal is a JSON/YAML/Markdown file listing blocks and their content.
- **Output:** a self-contained static **web page** per proposal (shareable link, print-to-PDF clean), deployed the same way the landing page is (Cloud Run / static host). Optional PDF via headless Chrome.
- **Who assembles & how:** commercial team fills a structured file (or a light form) → run a generator → get a branded page. Low ceremony, versionable in git.
- **Pros:** reuses the exact existing stack (plain HTML/CSS/JS, no framework), fastest to stand up, proposals are durable static artifacts, trivial to host, design parity guaranteed.
- **Cons:** editing a YAML/MD file is friendlier than code but still not fully non-technical; no live WYSIWYG.
- **Fit:** matches the repo's "no build step, static output" ethos best.

### Direction B — Web builder UI (visual assembler)
- **What a plugin is:** a registered block component with an editable-fields manifest, surfaced as a card in a **marketplace/gallery** the user browses.
- **Output:** a shareable web page (and PDF export), saved to a store (DB or file).
- **Who assembles & how:** drag/browse blocks in a browser, fill fields inline, live preview, publish.
- **Pros:** truly non-technical, "marketplace" metaphor is literal (browse + add blocks), best UX for the commercial team, reorder/preview instantly.
- **Cons:** significantly more to build (editor state, persistence, auth, hosting a dynamic app); heavier maintenance; risk of over-engineering v1.
- **Fit:** the ideal *destination*, probably not the right *v1*.

### Direction C — Slides / document export (Google Slides or PPTX/Docs templates)
- **What a plugin is:** a branded slide/section master (a "theme" + layouts) mapped to the tokens.
- **Output:** editable **Google Slides / PPTX / Google Doc** the team edits in tools they already use.
- **Pros:** zero new tooling to learn, commercial teams live in Slides, easy to co-edit and send.
- **Cons:** the rich CSS assets (animated charger, scroll effects, live charts) don't translate — you lose the signature web polish; brand fidelity is harder to enforce; token sync is manual.
- **Fit:** good as a *secondary export target*, weak as the core system.

### Recommendation
**Start with Direction A**, architected so it can grow into B. Concretely:
1. Extract the shared `lecharge-ui` design package first (tokens + component CSS + sprite + tiny JS).
2. Build a block registry (each block = template + field schema + thumbnail) — this **is** the "marketplace" catalog and is reusable by a future builder UI.
3. Ship a simple generator (CLI or minimal form) that composes blocks + client data into a static, shareable, print-clean proposal page.
4. Add PDF export (headless Chrome) and, later, the WYSIWYG builder (B) on top of the same registry.

### Repo decision
Recommend a **new standalone repo (or a workspace/monorepo)** rather than bolting onto the landing repo — proposals have different lifecycle, hosting, and access needs. But the **design system must be shared**, so the cleanest structure is a small monorepo: `packages/lecharge-ui` (consumed by both) + `apps/landing` + `apps/proposals`. If a full monorepo is too heavy, publish `lecharge-ui` as a versioned internal package the landing repo also imports.

---

## 3. Sharp clarifying questions for the user

1. **Who edits, and how technical are they?** Are the commercial team comfortable editing a structured text/YAML file + running a command, or do they need a point-and-click web builder from day one? (This is the A-vs-B fork.)
2. **What's the delivered artifact the client actually receives?** A shareable link (web page), a PDF attachment, editable Slides, or all three? Which is primary?
3. **How variable are proposals?** Mostly the same skeleton with swapped numbers/logo/pricing (favors fixed templates), or highly bespoke section-by-section (favors a flexible block builder)?
4. **What data drives a proposal?** Where do the numbers come from (ROI %, kW, pricing, client name/logo) — typed by hand each time, or pulled from a CRM / spreadsheet / pricing calculator we should connect to?
5. **Standalone repo vs. alongside the landing page?** Any constraint on hosting, access control, or who owns the repo — e.g. must proposals be gated/authenticated, or are unlisted public links fine?
6. **How on-brand-locked vs. flexible?** Should blocks be rigidly branded (team can only fill approved fields) to prevent drift, or do reps need freedom to restructure/restyle per deal?
7. **Language & scope:** Spanish-only (like the landing), or bilingual ES/EN proposals for international investors/clients?

---
name: proposal-generator
description: Use when the user needs to create an on-brand LeCharge client proposal (commercial quote, propuesta). Asks whether they want a vertical document or a landscape deck, collects the details in a Spanish conversation, builds an on-brand HTML from the LeCharge design system, and renders it to PDF.
allowed-tools:
  - Read
  - Write
  - Bash
---

# LeCharge proposal generator

Produce a client proposal as HTML first (clean structure), then a PDF. Follow the LeCharge
brand rules from `using-lecharge`: Spanish copy, never an em dash, design tokens exactly.

Your design assets are next to this file under `assets/`: `tokens.css`, the two chassis
`proposal-doc.css` and `proposal-deck.css`, `brand/logo.svg`, `brand/logo-white.svg`, and
`COMPONENTS.md` (the block catalog for both formats). Two worked examples live in
`example/`: `documento-grupo-andes.html` and `presentacion-grupo-andes.html`. Read the
matching example before you build, it is the reference for structure and quality.

## Step 1: Ask the format first

Ask, in Spanish, which format the user wants:

- **Documento vertical (PDF A4)**: a full written proposal to read or print. Chassis
  `proposal-doc.css`.
- **Presentacion horizontal (PDF 16:9)**: a slide deck to present or send. Chassis
  `proposal-deck.css`.

Do not continue until they pick one. It decides the chassis and the block set.

## Step 2: Collect the details (Spanish, one topic at a time)

Ask for, and confirm back, these fields. Move topic by topic, do not dump every question at once:

- Cliente: nombre, sector, contacto (nombre, cargo, email, telefono).
- Objetivo de la propuesta.
- Solucion / producto elegido.
- Especificaciones tecnicas: kW, conectores, numero de cargadores.
- Terminos comerciales y precios (equipamiento, instalacion, operacion).
- Cifras de retorno (ROI) por ano y sus etiquetas.
- Cronograma de despliegue (fases, duracion).
- Casos de uso / segmentos (opcional).
- Condiciones y proximos pasos.

## Step 3: Build the HTML

Read `assets/COMPONENTS.md` and use the section for the chosen format:

- **Documento**: use the Format A shell. Set `<meta name="lc-footer" content="Propuesta
  comercial, {{cliente}}">` (this drives the native PDF footer). Group blocks into
  `<section class="page">` where each printed page should start. Default block order:
  portada, resumen-ejecutivo, solucion, roi, precios, cronograma, segmentos, cita,
  condiciones, contacto. Drop any block the user has no data for.
- **Presentacion**: use the Format B shell. One `<section class="slide">` per slide, each
  with the `.s-foot` footer (except the cover). Default slides: cover, resumen, solucion,
  retorno, cronograma, cierre.

Link `assets/tokens.css` then the chosen chassis by relative path. Fill every
`{{placeholder}}` with the confirmed Spanish copy. Before rendering, search the HTML and
confirm there is not a single em dash.

Save the HTML next to the assets (for example `propuesta-<cliente>.html` in the skill
folder) so the `assets/...` relative links resolve.

## Step 4: Render the PDF

If the renderer dependencies are not installed yet, run once: `npm install` in the plugin
root (the folder with `package.json`).

Then run: `node bin/render-pdf.mjs <input.html> <output.pdf>`

The renderer respects each chassis page size (A4 or 16:9) and adds the native footer for
documents. If it exits non-zero (headless Chrome unavailable), tell the user the HTML is
ready and they can open it and use the browser "Guardar como PDF". Do not fail silently.

## Step 5: Verify the pagination (catch layout errors)

Open the rendered PDF and review every page (Read the PDF pages). Confirm:

- No block is cut across a page or slide boundary (title on one page, body on the next).
- No heading is left orphaned at the very bottom of a page.
- Nothing overlaps the footer, and no page is awkwardly overfull or almost empty.

The chassis prevents most splits (`break-inside: avoid` in the document, fixed-size
slides in the deck). If a page is still overfull, move a block to the next `<section
class="page">` (document) or the next `<section class="slide">` (deck), or add a
`<div class="page-break"></div>` in the document, then re-render and check again. Repeat
until every page is clean.

## Step 6: Deliver

Give the user both files: the HTML (reusable, editable) and the final PDF. Summarize in
Spanish which format and which sections were included.

---
name: proposal-generator
description: Use when the user needs to create an on-brand LeCharge client proposal (commercial quote, propuesta). Collects the details in a Spanish conversation, builds a print-clean HTML document from the LeCharge design system, and renders it to PDF.
allowed-tools:
  - Read
  - Write
  - Bash
---

# LeCharge proposal generator

Produce a client proposal as HTML first (clean structure), then a PDF. Follow the
LeCharge brand rules from `using-lecharge`: Spanish copy, never an em dash, design
tokens exactly.

Your design assets are next to this file, under `assets/`: `tokens.css`,
`components.css`, `print.css`, `sprite.svg`, and `COMPONENTS.md` (the block catalog).

## Step 1: Collect the details (Spanish, one topic at a time)

Ask for, and confirm back, these fields. Do not ask everything at once; move topic by topic:

- Cliente: nombre, sector, contacto (nombre, email, telefono), logo (opcional).
- Objetivo de la propuesta.
- Solucion / producto elegido.
- Especificaciones tecnicas: kW, conectores, numero de cargadores.
- Terminos comerciales y precios (equipamiento, instalacion y servicio).
- Cifras de retorno (ROI) y sus etiquetas.
- Cronograma de despliegue (fases, duracion, hitos).
- Casos de uso / segmentos.
- Cita o mensaje de posicionamiento (opcional).
- Condiciones de la propuesta.

## Step 2: Choose the blocks

Read `assets/COMPONENTS.md`. A proposal is an ordered list of blocks wrapped in
`<section class="proposal-page">`. Default order: portada, resumen-ejecutivo,
solucion, roi, precios, cronograma, segmentos, cita, condiciones, contacto. Drop any
block the user has no data for. Keep the order.

## Step 3: Build the HTML

Create `propuesta-<cliente>.html` using the document shell in `COMPONENTS.md`. Link
the three stylesheets by relative path (`assets/tokens.css`, `assets/components.css`,
`assets/print.css`) OR, if the file will move away from this folder, inline them so the
document stays self-contained. Inline the contents of `assets/sprite.svg` at the top of
`<body>` so icons render. Fill every `{{placeholder}}` with the confirmed Spanish copy.
Verify there is not a single em dash in the output.

## Step 4: Render the PDF

If the plugin's renderer dependencies are not installed yet, run once:
`npm install` inside the plugin root (the folder with `package.json`).

Then run: `node bin/render-pdf.mjs <path-to-html> <path-to-output-pdf>`

If the renderer exits non-zero (headless Chrome unavailable in this environment),
tell the user the HTML is ready and they can open it and use the browser's
"Guardar como PDF". Do not fail silently.

## Step 5: Deliver

Give the user both files: the HTML (reusable, editable) and the PDF. Summarize in
Spanish which blocks were included.

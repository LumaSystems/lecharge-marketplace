# LeCharge proposal block catalog

A LeCharge proposal ships in one of two formats. Ask the user which one they want, then
build with that chassis and the matching block set below. All copy is Spanish. Never use
an em dash.

- **Documento vertical (A4)**: a print document, chassis `proposal-doc.css`. Best for a
  full written proposal the client reads or prints. Worked example:
  `example/documento-grupo-andes.html`.
- **Presentacion horizontal (16:9)**: a slide deck, chassis `proposal-deck.css`. Best for
  pitching live or sending a short visual deck. Worked example:
  `example/presentacion-grupo-andes.html`.

Both link `tokens.css` first, then their chassis. Assets (`tokens.css`, the chassis,
`brand/logo.svg`, `brand/logo-white.svg`) are siblings of the generated HTML under `assets/`.

Pagination is protected by the chassis: in the document, every block has `break-inside:
avoid` so nothing is cut across a page; in the deck, each `.slide` is a fixed page. After
rendering the PDF, still review the pages (see the skill) and move a block to the next
page or slide if a page is overfull.

---

# Format A: documento vertical (proposal-doc.css)

Document shell. A `<meta name="lc-footer">` drives the native PDF page footer (title left,
Confidencial and page number right), so do not add an HTML footer.

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Propuesta LeCharge, {{cliente}}</title>
  <meta name="lc-footer" content="Propuesta comercial, {{cliente}}">
  <link rel="stylesheet" href="assets/tokens.css">
  <link rel="stylesheet" href="assets/proposal-doc.css">
</head>
<body>
  <!-- ordered blocks, grouped into <section class="page"> where a new page should start -->
</body>
</html>
```

Group blocks inside `<section class="page">` where a new printed page should begin. The
first `.page` holds the cover. Use `<div class="page-break"></div>` for a manual break.

## portada
Cover: dark cover card with the white logo, then the metadata grid. Use `logo-white.svg`
here because the card is dark.
```html
<section class="page">
  <div class="cover-card">
    <div class="glow"></div>
    <img class="doc-logo" src="assets/brand/logo-white.svg" alt="LeCharge">
    <div class="eyebrow">Propuesta de solucion</div>
    <h1>{{titulo}} <span class="g">{{cliente}}</span></h1>
    <p class="lede">{{resumen_corto}}</p>
  </div>
  <div class="meta">
    <div class="cell"><div class="lbl">Preparado para</div><div class="val">{{cliente}}, {{sector}}</div></div>
    <div class="cell"><div class="lbl">Preparado por</div><div class="val">LeCharge SAS</div></div>
    <div class="cell"><div class="lbl">Fecha</div><div class="val">{{fecha}}</div></div>
    <div class="cell"><div class="lbl">Documento</div><div class="val">Propuesta comercial, Confidencial</div></div>
  </div>
</section>
```

## resumen-ejecutivo
Kicker + headline + lead, a green stat row, optional two-column prose and a callout.
```html
<div class="sec"><span class="kicker">Resumen ejecutivo</span></div>
<h2 class="h">{{titulo_resumen}}</h2>
<hr class="rule">
<p class="lead">{{parrafo_resumen}}</p>
<div class="stats">
  <div class="stat"><div class="num">{{n1}}</div><div class="cap">{{cap1}}</div></div>
  <div class="stat"><div class="num">{{n2}}</div><div class="cap">{{cap2}}</div></div>
  <div class="stat"><div class="num">{{n3}}</div><div class="cap">{{cap3}}</div></div>
  <div class="stat"><div class="num">{{n4}}</div><div class="cap">{{cap4}}</div></div>
</div>
<div class="callout"><h4>{{callout_titulo}}</h4><p>{{callout_texto}}</p></div>
```

## solucion
Numbered section header, lead, three cards, and a checklist.
```html
<div class="sec"><span class="badge">1</span><span class="kicker">La solucion</span></div>
<h2 class="h">{{titulo_solucion}}</h2>
<hr class="rule">
<p class="lead">{{descripcion_solucion}}</p>
<div class="cards c3">
  <div class="card"><div class="n">Hardware</div><h4>{{hw_titulo}}</h4><p>{{hw_desc}}</p></div>
  <div class="card"><div class="n">Software</div><h4>{{sw_titulo}}</h4><p>{{sw_desc}}</p></div>
  <div class="card"><div class="n">Operacion</div><h4>{{op_titulo}}</h4><p>{{op_desc}}</p></div>
</div>
<div class="list mt">
  <div class="li"><span class="mk"></span><div>{{punto_1}}</div></div>
  <div class="li"><span class="mk"></span><div>{{punto_2}}</div></div>
</div>
```

## roi
Return projection as a table with a highlighted total row.
```html
<div class="sec"><span class="badge">2</span><span class="kicker">Retorno</span></div>
<h2 class="h">Proyeccion de retorno</h2>
<hr class="rule">
<table class="tbl">
  <thead><tr><th>Concepto</th><th class="num">Ano 1</th><th class="num">Ano 2</th><th class="num">Ano 3</th></tr></thead>
  <tbody>
    <tr><td class="svc">{{fila_1}}</td><td class="num">{{a1_1}}</td><td class="num">{{a2_1}}</td><td class="num">{{a3_1}}</td></tr>
    <tr class="total"><td class="svc">{{fila_total}}</td><td class="num">{{a1_t}}</td><td class="num">{{a2_t}}</td><td class="num">{{a3_t}}</td></tr>
  </tbody>
</table>
```

## precios
Pricing as a table.
```html
<div class="sec"><span class="badge">3</span><span class="kicker">Inversion</span></div>
<h2 class="h">Propuesta economica</h2>
<hr class="rule">
<table class="tbl">
  <thead><tr><th>Componente</th><th>Detalle</th><th class="num">Valor</th></tr></thead>
  <tbody>
    <tr><td class="svc">Equipamiento</td><td>{{detalle_equipo}}</td><td class="num">{{precio_equipo}}</td></tr>
    <tr><td class="svc">Instalacion</td><td>{{detalle_instalacion}}</td><td class="num">{{precio_instalacion}}</td></tr>
    <tr class="total"><td class="svc">Inversion inicial</td><td></td><td class="num">{{precio_total}}</td></tr>
  </tbody>
</table>
```

## cronograma
Deployment as three roadmap phase cards (first one highlighted).
```html
<div class="sec"><span class="badge">4</span><span class="kicker">Despliegue</span></div>
<h2 class="h">Cronograma de puesta en marcha</h2>
<hr class="rule">
<div class="road">
  <div class="ph now"><div class="pt">{{fase_1}}</div><div class="pd">{{fase_1_dur}}</div><div class="ps">{{fase_1_desc}}</div></div>
  <div class="ph"><div class="pt">{{fase_2}}</div><div class="pd">{{fase_2_dur}}</div><div class="ps">{{fase_2_desc}}</div></div>
  <div class="ph"><div class="pt">{{fase_3}}</div><div class="pd">{{fase_3_dur}}</div><div class="ps">{{fase_3_desc}}</div></div>
</div>
```

## segmentos
Use cases as cards.
```html
<div class="sec"><span class="kicker">Casos de uso</span></div>
<h2 class="h">Aplicaciones para {{cliente}}</h2>
<hr class="rule">
<div class="cards c3">
  <div class="card"><h4>{{seg_1}}</h4><p>{{seg_1_desc}}</p></div>
  <div class="card"><h4>{{seg_2}}</h4><p>{{seg_2_desc}}</p></div>
  <div class="card"><h4>{{seg_3}}</h4><p>{{seg_3_desc}}</p></div>
</div>
```

## cita
Positioning quote as a callout.
```html
<div class="callout"><h4>{{cita_autor}}, {{cita_cargo}}</h4><p>{{cita_texto}}</p></div>
```

## condiciones
Terms as a checklist.
```html
<div class="sec"><span class="kicker">Condiciones</span></div>
<h2 class="h">Terminos de la propuesta</h2>
<hr class="rule">
<div class="list">
  <div class="li"><span class="mk"></span><div>{{condicion_1}}</div></div>
  <div class="li"><span class="mk"></span><div>{{condicion_2}}</div></div>
</div>
```

## contacto
Closing steps and a contact block.
```html
<div class="sec"><span class="kicker">Proximos pasos</span></div>
<h2 class="h">Como arrancamos</h2>
<hr class="rule">
<div class="steps">
  <div class="step"><span class="ix">1</span><p><b>{{paso_1_titulo}}.</b> {{paso_1_desc}}</p></div>
  <div class="step"><span class="ix">2</span><p><b>{{paso_2_titulo}}.</b> {{paso_2_desc}}</p></div>
</div>
<div class="endblock">
  <div class="c"><div class="lbl">Contacto</div><b>{{contacto_nombre}}</b><p>{{contacto_cargo}}</p></div>
  <div class="c"><div class="lbl">Correo</div><b>{{contacto_email}}</b></div>
  <div class="c"><div class="lbl">Telefono</div><b>{{contacto_tel}}</b></div>
</div>
```

---

# Format B: presentacion horizontal (proposal-deck.css)

Deck shell. Each `<section class="slide">` is one 16:9 page. Slides carry their own
in-canvas footer (`.s-foot`) with the logo and an automatic page number, so this format
does NOT use `<meta name="lc-footer">`.

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Presentacion LeCharge, {{cliente}}</title>
  <link rel="stylesheet" href="assets/tokens.css">
  <link rel="stylesheet" href="assets/proposal-deck.css">
</head>
<body>
  <!-- one <section class="slide"> per slide -->
</body>
</html>
```

Reusable slide footer (put on every slide except the cover):
```html
<div class="s-foot"><span class="b"><img src="assets/brand/logo.svg" alt="LeCharge"><span class="sub">Confidencial</span></span><span class="pg"></span></div>
```

## slide-cover
```html
<section class="slide cover">
  <div class="glow"></div>
  <div class="cover-inner">
    <div class="lock"><img src="assets/brand/logo.svg" alt="LeCharge"><span class="div"></span><span class="kind">Propuesta comercial</span></div>
    <div class="eyebrow">Propuesta de solucion</div>
    <h1>{{titulo}} <span class="g">{{cliente}}</span></h1>
    <p class="sub">{{resumen_corto}}</p>
    <div class="meta">
      <div class="cell"><div class="lbl">Para</div><div class="val">{{cliente}}</div></div>
      <div class="cell"><div class="lbl">Por</div><div class="val">LeCharge SAS</div></div>
      <div class="cell"><div class="lbl">Fecha</div><div class="val">{{fecha}}</div></div>
      <div class="cell"><div class="lbl">Sector</div><div class="val">{{sector}}</div></div>
    </div>
  </div>
</section>
```

## slide-resumen
Header plus a big stat row.
```html
<section class="slide">
  <div class="s-head">
    <div class="s-kicker">Resumen ejecutivo</div>
    <h2 class="s-title">{{titulo_resumen}}</h2>
    <p class="s-lead">{{parrafo_resumen}}</p>
  </div>
  <div class="s-body">
    <div class="sstats">
      <div class="sstat"><div class="num">{{n1}}</div><div class="cap">{{cap1}}</div></div>
      <div class="sstat"><div class="num">{{n2}}</div><div class="cap">{{cap2}}</div></div>
      <div class="sstat"><div class="num">{{n3}}</div><div class="cap">{{cap3}}</div></div>
      <div class="sstat"><div class="num">{{n4}}</div><div class="cap">{{cap4}}</div></div>
    </div>
  </div>
  <div class="s-foot"><span class="b"><img src="assets/brand/logo.svg" alt="LeCharge"><span class="sub">Confidencial</span></span><span class="pg"></span></div>
</section>
```

## slide-solucion
Header plus a three card grid (mark the standout card with `key`).
```html
<section class="slide">
  <div class="s-head"><div class="s-kicker">La solucion</div><h2 class="s-title sm">{{titulo_solucion}}</h2></div>
  <div class="s-body">
    <div class="grid g3">
      <div class="scard"><div class="n">Hardware</div><h4>{{hw_titulo}}</h4><p>{{hw_desc}}</p></div>
      <div class="scard"><div class="n">Software</div><h4>{{sw_titulo}}</h4><p>{{sw_desc}}</p></div>
      <div class="scard key"><div class="n">Operacion</div><h4>{{op_titulo}}</h4><p>{{op_desc}}</p></div>
    </div>
  </div>
  <div class="s-foot"><span class="b"><img src="assets/brand/logo.svg" alt="LeCharge"><span class="sub">Confidencial</span></span><span class="pg"></span></div>
</section>
```

## slide-retorno
Header plus a return table.
```html
<section class="slide">
  <div class="s-head"><div class="s-kicker">Retorno</div><h2 class="s-title sm">Proyeccion de retorno</h2></div>
  <div class="s-body top">
    <table class="stbl">
      <thead><tr><th>Concepto</th><th class="num">Ano 1</th><th class="num">Ano 2</th><th class="num">Ano 3</th></tr></thead>
      <tbody>
        <tr><td class="svc">{{fila_1}}</td><td class="num">{{a1_1}}</td><td class="num">{{a2_1}}</td><td class="num">{{a3_1}}</td></tr>
        <tr class="total"><td class="svc">{{fila_total}}</td><td class="num">{{a1_t}}</td><td class="num">{{a2_t}}</td><td class="num">{{a3_t}}</td></tr>
      </tbody>
    </table>
  </div>
  <div class="s-foot"><span class="b"><img src="assets/brand/logo.svg" alt="LeCharge"><span class="sub">Confidencial</span></span><span class="pg"></span></div>
</section>
```

## slide-cronograma
Header plus a gantt (set `--cols` to the number of months).
```html
<section class="slide">
  <div class="s-head"><div class="s-kicker">Despliegue</div><h2 class="s-title sm">Cronograma de puesta en marcha</h2></div>
  <div class="s-body top">
    <div class="gantt" style="--cols:3">
      <div class="head"><span class="lh"></span><span>Mes 1</span><span>Mes 2</span><span>Mes 3</span></div>
      <div class="row"><div class="rl">{{fase_1}}</div><div class="cells"><div class="c"></div><div class="c"></div><div class="c"></div><div class="bar" style="left:0;width:66%">{{fase_1_dur}}</div></div></div>
    </div>
  </div>
  <div class="s-foot"><span class="b"><img src="assets/brand/logo.svg" alt="LeCharge"><span class="sub">Confidencial</span></span><span class="pg"></span></div>
</section>
```

## slide-cierre
Header plus a contact strip.
```html
<section class="slide">
  <div class="s-head"><div class="s-kicker">Proximos pasos</div><h2 class="s-title">Avancemos juntos</h2><p class="s-lead">{{cierre_texto}}</p></div>
  <div class="s-body top">
    <div class="endrow">
      <div><div class="lbl">Contacto</div><b>{{contacto_nombre}}</b><p>{{contacto_cargo}}</p></div>
      <div><div class="lbl">Correo</div><b>{{contacto_email}}</b></div>
      <div><div class="lbl">Telefono</div><b>{{contacto_tel}}</b></div>
    </div>
  </div>
  <div class="s-foot"><span class="b"><img src="assets/brand/logo.svg" alt="LeCharge"><span class="sub">Confidencial</span></span><span class="pg"></span></div>
</section>
```

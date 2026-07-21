# LeCharge proposal block catalog

Each block is a static, print-safe section built from `components.css` + `print.css`.
A proposal is an ordered list of blocks wrapped in `<section class="proposal-page">`.
All copy is Spanish. Never use em dashes.

Every proposal HTML document has this shell (assets are siblings in this folder):

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Propuesta LeCharge · {{cliente}}</title>
  <link rel="stylesheet" href="tokens.css">
  <link rel="stylesheet" href="components.css">
  <link rel="stylesheet" href="print.css">
</head>
<body>
  <!-- inline the sprite so icons render in print -->
  {{sprite.svg contents}}
  <!-- ordered blocks go here, each wrapped in <section class="proposal-page"> -->
</body>
</html>
```

## Blocks

### portada
Cover. LeCharge logo, client name, sector, date. The logo is the vendored brand SVG
(`brand/logo.svg`, a sibling of the stylesheets in `assets/`); use `brand/logo-white.svg`
only on a dark background.
```html
<section class="proposal-page hero">
  <div class="wrap">
    <img class="brand-logo" src="brand/logo.svg" alt="LeCharge" style="height:46px;margin:0 auto 22px;display:block">
    <div class="eyebrow"><span class="dot"></span> Propuesta comercial</div>
    <h1 class="hero-title">Electromovilidad para <span class="g">{{cliente}}</span></h1>
    <p class="sub">{{sector}} · {{fecha}}</p>
  </div>
</section>
```

### resumen-ejecutivo
Executive summary. One `section.band` with a `.section-head` and a short paragraph.
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="section-head">
      <div class="kicker">Resumen ejecutivo</div>
      <h2>{{titulo_resumen}}</h2>
      <p>{{parrafo_resumen}}</p>
    </div>
  </div>
</section>
```

### solucion
Solution and technical spec. Uses `.pillar` with a checklist of specs (kW, conectores, numero de cargadores).
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="pillar">
      <div>
        <div class="badge"><svg width="16" height="16"><use href="#ic-charger"/></svg> Solucion</div>
        <h3>{{producto}}</h3>
        <p class="lead">{{descripcion_solucion}}</p>
        <ul>
          <li><svg width="18" height="18"><use href="#check"/></svg> Potencia: {{kw}} kW</li>
          <li><svg width="18" height="18"><use href="#check"/></svg> Conectores: {{conectores}}</li>
          <li><svg width="18" height="18"><use href="#check"/></svg> Cargadores: {{num_cargadores}}</li>
        </ul>
      </div>
      <div class="p-visual soft"></div>
    </div>
  </div>
</section>
```

### roi
Return chart. The `.chart` / `.bars2` bar chart with static, pre-filled values (no count-up).
```html
<section class="proposal-page band grey">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Retorno</div><h2>Proyeccion de retorno</h2></div>
    <div class="chart">
      <div class="bars2">
        <div class="bar2 in"><div class="val">{{roi_1}}</div><div class="fill2" style="height:{{roi_1_pct}}%;background:var(--accent)"></div></div>
        <div class="bar2 in"><div class="val">{{roi_2}}</div><div class="fill2" style="height:{{roi_2_pct}}%;background:var(--accent-2)"></div></div>
        <div class="bar2 in"><div class="val">{{roi_3}}</div><div class="fill2" style="height:{{roi_3_pct}}%;background:var(--accent-deep)"></div></div>
      </div>
      <div class="bar-names"><span>{{roi_label_1}}</span><span>{{roi_label_2}}</span><span>{{roi_label_3}}</span></div>
    </div>
  </div>
</section>
```

### precios
Pricing table. Dual `.tracks` cards or a simple list; use the `.track` card with a big number.
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Inversion</div><h2>Propuesta economica</h2></div>
    <div class="tracks">
      <div class="track"><div class="t-badge">Equipamiento</div><div class="big">Total<b>{{precio_equipo}}</b></div><p>{{detalle_equipo}}</p></div>
      <div class="track invest"><div class="t-badge">Instalacion y servicio</div><div class="big">Total<b>{{precio_servicio}}</b></div><p>{{detalle_servicio}}</p></div>
    </div>
  </div>
</section>
```

### cronograma
Deployment timeline. The `.flow` stepper.
```html
<section class="proposal-page band grey">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Despliegue</div><h2>Cronograma</h2></div>
    <div class="flow"><div class="flow-track">
      <div class="fnode"><div class="fcirc green"><svg width="26" height="26"><use href="#check"/></svg></div><div class="fname">{{fase_1}}</div><div class="fsub">{{fase_1_dur}}</div></div>
      <div class="fconn"><span>{{hito_1}}</span></div>
      <div class="fnode"><div class="fcirc"><svg width="26" height="26"><use href="#ic-charger"/></svg></div><div class="fname">{{fase_2}}</div><div class="fsub">{{fase_2_dur}}</div></div>
      <div class="fconn"><span>{{hito_2}}</span></div>
      <div class="fnode"><div class="fcirc green"><svg width="26" height="26"><use href="#spark"/></svg></div><div class="fname">{{fase_3}}</div><div class="fsub">{{fase_3_dur}}</div></div>
    </div></div>
  </div>
</section>
```

### segmentos
Use-cases. The `.segs` grid.
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Casos de uso</div><h2>Aplicaciones para {{cliente}}</h2></div>
    <div class="segs"><div class="grid">
      <div class="seg"><div class="s-ico"><svg width="22" height="22"><use href="#ic-car"/></svg></div><h5>{{segmento_1}}</h5><p>{{segmento_1_desc}}</p></div>
      <div class="seg"><div class="s-ico"><svg width="22" height="22"><use href="#ic-charger"/></svg></div><h5>{{segmento_2}}</h5><p>{{segmento_2_desc}}</p></div>
      <div class="seg"><div class="s-ico"><svg width="22" height="22"><use href="#ic-inv"/></svg></div><h5>{{segmento_3}}</h5><p>{{segmento_3_desc}}</p></div>
      <div class="seg"><div class="s-ico"><svg width="22" height="22"><use href="#spark"/></svg></div><h5>{{segmento_4}}</h5><p>{{segmento_4_desc}}</p></div>
    </div></div>
  </div>
</section>
```

### cita
Testimonial / positioning quote.
```html
<section class="proposal-page band grey">
  <div class="wrap"><div class="quote">
    <p>{{cita_texto}}</p>
    <div class="who"><b>{{cita_autor}}</b>, {{cita_cargo}}</div>
  </div></div>
</section>
```

### condiciones
Terms. A `section.band` with a `.section-head` and a bullet list.
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Condiciones</div><h2>Terminos de la propuesta</h2></div>
    <ul class="pts">
      <li><svg width="18" height="18"><use href="#check"/></svg> {{condicion_1}}</li>
      <li><svg width="18" height="18"><use href="#check"/></svg> {{condicion_2}}</li>
      <li><svg width="18" height="18"><use href="#check"/></svg> {{condicion_3}}</li>
    </ul>
  </div>
</section>
```

### contacto
Closing CTA and contact.
```html
<section class="proposal-page band grey final">
  <div class="wrap">
    <h2>Avancemos juntos</h2>
    <p>{{contacto_nombre}} · {{contacto_email}} · {{contacto_tel}}</p>
  </div>
</section>
```

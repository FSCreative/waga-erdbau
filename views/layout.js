'use strict';
const { esc } = require('../lib/util');

const NAV = [
  { href: '/#leistungen', num: '01', label: 'Leistungen' },
  { href: '/#projekte', num: '02', label: 'Projekte' },
  { href: '/berichte', num: '03', label: 'Berichte' },
  { href: '/#kontakt', num: '04', label: 'Kontakt' },
];

const TABS = [
  { href: '/#top', label: 'Start' },
  { href: '/#leistungen', label: 'Leistungen' },
  { href: '/#projekte', label: 'Projekte' },
  { href: '/berichte', label: 'Berichte' },
  { href: '/#kontakt', label: 'Kontakt' },
];

function layout({ title, description = '', active = '', settings, content, bodyClass = '' }) {
  const s = settings;
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} | ${esc(s.site_name)}</title>
<meta name="description" content="${esc(description || s.hero_subtitle)}">
<meta name="theme-color" content="#f1efe9">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body class="${bodyClass}" id="top">
<div class="progress" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>

<header class="hd" data-header>
  <a class="hd__brand" href="/">WAGA ERDBAU<sup>®</sup></a>
  <nav class="hd__nav" aria-label="Hauptnavigation">
    ${NAV.map((n) => `<a href="${n.href}" data-anchor class="hd__link${active === n.href ? ' is-active' : ''}"><sup>${n.num}</sup>${n.label}</a>`).join('')}
  </nav>
  <a class="hd__cta" href="/#kontakt" data-anchor>Anfragen&nbsp;↗</a>
</header>

<main>
${content}
</main>

<footer class="ft">
  <div class="ft__word" aria-hidden="true">WAGA</div>
  <div class="ft__grid">
    <div class="ft__col">
      <span class="mono-label">Kontakt</span>
      <p>${esc(s.contact_address)}<br>
      <a href="mailto:${esc(s.contact_email)}">${esc(s.contact_email)}</a><br>
      <a href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">${esc(s.contact_phone)}</a></p>
    </div>
    <div class="ft__col">
      <span class="mono-label">Index</span>
      <p>${NAV.map((n) => `<a href="${n.href}" data-anchor>${n.num} — ${n.label}</a>`).join('<br>')}</p>
    </div>
    <div class="ft__col">
      <span class="mono-label">Motto</span>
      <p>${esc(s.about_tagline)}</p>
    </div>
  </div>
  <div class="ft__base">
    <span>${esc(s.footer_text)}</span>
    <a href="/admin" class="ft__admin">[ Admin ]</a>
  </div>
</footer>

<nav class="tabs" aria-label="Mobile Navigation">
  ${TABS.map((t) => `<a href="${t.href}" data-anchor data-tab="${t.label}" class="tabs__item${active === t.href ? ' is-active' : ''}">${t.label}</a>`).join('')}
</nav>

<div class="lightbox" data-lightbox hidden>
  <button class="lightbox__close" aria-label="Schließen">×</button>
  <button class="lightbox__nav lightbox__nav--prev" aria-label="Vorheriges Bild">←</button>
  <figure><img src="" alt=""><figcaption class="mono-label"></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--next" aria-label="Nächstes Bild">→</button>
</div>

<script src="/js/main.js" defer></script>
</body>
</html>`;
}

module.exports = { layout, NAV };

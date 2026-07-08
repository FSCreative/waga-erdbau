'use strict';
const { esc } = require('../lib/util');

const NAV = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/leistungen', label: 'Leistungen', icon: 'digger' },
  { href: '/projekte', label: 'Projekte', icon: 'grid' },
  { href: '/berichte', label: 'Berichte', icon: 'news' },
  { href: '/kontakt', label: 'Kontakt', icon: 'mail' },
];

const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5M5.5 9.8V20h13V9.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  digger: '<path d="M2 20h13M4 17h9l1 3M6 17v-4h5l2 4M11 13 8 7h3l4 6M15 7l5 4-1.5 2.5M20 11l1-5-4 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/>',
  news: '<path d="M5 4h11v16H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 8h3v10a2 2 0 0 1-2 2M7.5 8.5H13M7.5 12H13M7.5 15.5H11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};

function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

function layout({ title, description = '', active = '', settings, content, bodyClass = '' }) {
  const s = settings;
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} | ${esc(s.site_name)}</title>
<meta name="description" content="${esc(description || s.hero_subtitle)}">
<meta name="theme-color" content="#0c1a2a">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body class="${bodyClass}">
<div class="scroll-progress" aria-hidden="true"><div class="scroll-progress__bar"></div></div>

<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="${esc(s.site_name)} – Startseite">
      <img src="/assets/img/logo.png" alt="${esc(s.site_name)} Logo" class="brand__img" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">
      <span class="brand__fallback" style="display:none">WAGA <b>ERDBAU</b></span>
    </a>
    <nav class="main-nav" aria-label="Hauptnavigation">
      ${NAV.map((n) => `<a href="${n.href}" class="main-nav__link${active === n.href ? ' is-active' : ''}">${n.label}</a>`).join('')}
    </nav>
    <a href="/kontakt" class="btn btn--amber site-header__cta">Angebot anfragen</a>
  </div>
</header>

<main id="top">
${content}
</main>

<footer class="site-footer">
  <div class="container site-footer__grid">
    <div>
      <div class="site-footer__brand">WAGA <b>ERDBAU</b></div>
      <p class="site-footer__tag">${esc(s.about_tagline)}</p>
    </div>
    <div>
      <h4>Kontakt</h4>
      <p>${esc(s.contact_address)}<br>
      <a href="mailto:${esc(s.contact_email)}">${esc(s.contact_email)}</a><br>
      <a href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">${esc(s.contact_phone)}</a></p>
    </div>
    <div>
      <h4>Navigation</h4>
      <p>${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join('<br>')}</p>
    </div>
  </div>
  <div class="container site-footer__bottom">
    <span>${esc(s.footer_text)}</span>
    <a href="/admin" class="site-footer__admin">Admin</a>
  </div>
</footer>

<nav class="tabbar" aria-label="Mobile Navigation">
  ${NAV.map((n) => `<a href="${n.href}" class="tabbar__item${active === n.href ? ' is-active' : ''}">${icon(n.icon)}<span>${n.label}</span></a>`).join('')}
</nav>

<div class="lightbox" data-lightbox hidden>
  <button class="lightbox__close" aria-label="Schließen">&times;</button>
  <button class="lightbox__nav lightbox__nav--prev" aria-label="Vorheriges Bild">&#8249;</button>
  <figure><img src="" alt=""><figcaption></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--next" aria-label="Nächstes Bild">&#8250;</button>
</div>

<script src="/js/main.js" defer></script>
</body>
</html>`;
}

module.exports = { layout, icon, NAV };

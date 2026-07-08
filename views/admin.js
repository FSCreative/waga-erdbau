'use strict';
const { esc, formatDate } = require('../lib/util');

const SECTIONS = [
  { href: '/admin', label: 'Übersicht', icon: '▦' },
  { href: '/admin/berichte', label: 'Berichte', icon: '✎' },
  { href: '/admin/fotos', label: 'Fotos & Projekte', icon: '▣' },
  { href: '/admin/texte', label: 'Texte', icon: '¶' },
  { href: '/admin/anfragen', label: 'Anfragen', icon: '✉' },
];

function adminLayout({ title, active, content, unread = 0, flash = '' }) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} | WAGA Admin</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/admin.css">
</head>
<body>
<div class="admin">
  <aside class="admin__side">
    <a class="admin__brand" href="/admin">WAGA <b>ADMIN</b></a>
    <nav>
      ${SECTIONS.map((s) => `<a href="${s.href}" class="${active === s.href ? 'is-active' : ''}"><span class="admin__icon">${s.icon}</span>${s.label}${s.href === '/admin/anfragen' && unread > 0 ? ` <span class="badge">${unread}</span>` : ''}</a>`).join('')}
    </nav>
    <div class="admin__side-foot">
      <a href="/" target="_blank">↗ Website ansehen</a>
      <form action="/admin/logout" method="POST"><button type="submit">Abmelden</button></form>
    </div>
  </aside>
  <main class="admin__main">
    ${flash ? `<div class="flash">${esc(flash)}</div>` : ''}
    <h1>${esc(title)}</h1>
    ${content}
  </main>
</div>
<script src="/js/admin.js" defer></script>
</body>
</html>`;
}

function loginPage({ error = '' } = {}) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Login | WAGA Admin</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/admin.css">
</head>
<body class="login-body">
<form class="login-card" action="/admin/login" method="POST">
  <div class="login-card__logo">WAGA <b>ERDBAU</b></div>
  <h1>Admin-Bereich</h1>
  ${error ? `<p class="login-card__error">${esc(error)}</p>` : ''}
  <label>Passwort<input type="password" name="password" required autofocus autocomplete="current-password"></label>
  <button type="submit">Anmelden</button>
  <a class="login-card__back" href="/">← Zurück zur Website</a>
</form>
</body>
</html>`;
}

function dashboard({ stats, unread }) {
  const content = `
<div class="cards">
  <a class="card" href="/admin/berichte"><strong>${stats.posts}</strong><span>Berichte</span></a>
  <a class="card" href="/admin/fotos"><strong>${stats.projects}</strong><span>Projekte / Fotos</span></a>
  <a class="card${unread ? ' card--alert' : ''}" href="/admin/anfragen"><strong>${stats.inquiries}</strong><span>Anfragen${unread ? ` (${unread} neu)` : ''}</span></a>
  <a class="card" href="/admin/texte"><strong>¶</strong><span>Texte bearbeiten</span></a>
</div>
<div class="panel">
  <h2>Schnellzugriff</h2>
  <p>
    <a class="btn" href="/admin/berichte/neu">+ Neuer Bericht</a>
    <a class="btn" href="/admin/fotos#neu">+ Neues Projekt / Foto</a>
  </p>
</div>`;
  return adminLayout({ title: 'Übersicht', active: '/admin', content, unread });
}

function postForm(p = {}) {
  const isNew = !p.id;
  return `
<form class="panel form" action="${isNew ? '/admin/berichte/neu' : `/admin/berichte/${p.id}`}" method="POST" enctype="multipart/form-data">
  <label>Titel<input name="title" required value="${esc(p.title || '')}"></label>
  <label>Kurzbeschreibung (wird in der Übersicht angezeigt)<textarea name="excerpt" rows="2">${esc(p.excerpt || '')}</textarea></label>
  <label>Text
    <div class="md-toolbar">
      <button type="button" data-md="**" title="Fett"><b>B</b></button>
      <button type="button" data-md="*" title="Kursiv"><i>I</i></button>
      <button type="button" data-md="## " data-line title="Überschrift">H</button>
      <button type="button" data-md="- " data-line title="Liste">•</button>
    </div>
    <textarea name="body" rows="14" data-md-editor>${esc(p.body || '')}</textarea>
  </label>
  <label>Titelbild ${p.image ? `<img class="form__thumb" src="${esc(p.image)}" alt="">` : ''}
    <input type="file" name="imagefile" accept="image/*">
    <input type="hidden" name="image" value="${esc(p.image || '')}">
    <small>Neues Bild auswählen, um das aktuelle zu ersetzen.</small>
  </label>
  <label class="form__check"><input type="checkbox" name="published" value="1" ${p.published !== 0 ? 'checked' : ''}> Veröffentlicht</label>
  <div class="form__actions">
    <button type="submit" class="btn btn--primary">${isNew ? 'Bericht erstellen' : 'Speichern'}</button>
    <a class="btn btn--ghost" href="/admin/berichte">Abbrechen</a>
  </div>
</form>`;
}

function postsPage({ posts, unread }) {
  const content = `
<p><a class="btn btn--primary" href="/admin/berichte/neu">+ Neuer Bericht</a></p>
<div class="panel table-wrap">
<table>
<thead><tr><th>Titel</th><th>Datum</th><th>Status</th><th></th></tr></thead>
<tbody>
${posts.map((p) => `
<tr>
  <td data-th="Titel"><a href="/admin/berichte/${p.id}">${esc(p.title)}</a></td>
  <td data-th="Datum">${formatDate(p.created_at)}</td>
  <td data-th="Status">${p.published ? '<span class="tag tag--green">Online</span>' : '<span class="tag">Entwurf</span>'}</td>
  <td class="table-actions">
    <a class="btn btn--sm" href="/admin/berichte/${p.id}">Bearbeiten</a>
    <form action="/admin/berichte/${p.id}/loeschen" method="POST" data-confirm="Bericht wirklich löschen?"><button class="btn btn--sm btn--danger">Löschen</button></form>
  </td>
</tr>`).join('')}
${posts.length === 0 ? '<tr><td colspan="4">Noch keine Berichte.</td></tr>' : ''}
</tbody>
</table>
</div>`;
  return adminLayout({ title: 'Berichte', active: '/admin/berichte', content, unread });
}

function postEditPage({ post, unread, flash }) {
  return adminLayout({ title: post ? 'Bericht bearbeiten' : 'Neuer Bericht', active: '/admin/berichte', content: postForm(post || {}), unread, flash });
}

function fotosPage({ projects, unread, flash }) {
  const content = `
<div class="panel">
  <h2 id="neu">Neues Projekt / Foto hinzufügen</h2>
  <form class="form form--grid" action="/admin/fotos/neu" method="POST" enctype="multipart/form-data">
    <label>Titel<input name="title" required placeholder="z. B. Aushub Einfamilienhaus"></label>
    <label>Kategorie<input name="category" list="cats" value="Erdbau"></label>
    <datalist id="cats"><option>Erdbau</option><option>Aushub</option><option>Spezialarbeiten</option></datalist>
    <label class="form--grid__full">Beschreibung<input name="description" placeholder="Kurze Beschreibung"></label>
    <label>Foto<input type="file" name="imagefile" accept="image/*" required></label>
    <label>Reihenfolge<input type="number" name="sort" value="0"></label>
    <div class="form__actions form--grid__full"><button class="btn btn--primary">Hinzufügen</button></div>
  </form>
</div>
<div class="photo-grid">
${projects.map((p) => `
  <div class="photo-card">
    <img src="${esc(p.image)}" alt="" loading="lazy" onerror="this.style.opacity=.15">
    <div class="photo-card__body">
      <form action="/admin/fotos/${p.id}" method="POST" enctype="multipart/form-data" class="form">
        <input name="title" value="${esc(p.title)}" required>
        <input name="category" value="${esc(p.category)}" list="cats">
        <input name="description" value="${esc(p.description)}" placeholder="Beschreibung">
        <div class="photo-card__row">
          <input type="number" name="sort" value="${p.sort}" title="Reihenfolge">
          <input type="file" name="imagefile" accept="image/*" title="Foto ersetzen">
        </div>
        <div class="photo-card__row">
          <button class="btn btn--sm btn--primary">Speichern</button>
        </div>
      </form>
      <form action="/admin/fotos/${p.id}/loeschen" method="POST" data-confirm="Foto/Projekt wirklich löschen?"><button class="btn btn--sm btn--danger">Löschen</button></form>
    </div>
  </div>`).join('')}
</div>`;
  return adminLayout({ title: 'Fotos & Projekte', active: '/admin/fotos', content, unread, flash });
}

const TEXT_FIELDS = [
  ['hero_kicker', 'Startseite: Zeile über der Überschrift', 'input'],
  ['hero_title', 'Startseite: Hauptüberschrift (Zeilenumbruch = neue Zeile)', 'textarea'],
  ['hero_subtitle', 'Startseite: Untertitel', 'textarea'],
  ['intro_title', 'Startseite: Titel „Was mache ich?"', 'input'],
  ['intro_text', 'Startseite: Einleitungstext', 'textarea'],
  ['services_intro', 'Leistungen: Einleitung', 'textarea'],
  ['machine_1', 'Fuhrpark: Maschine 1', 'input'],
  ['machine_2', 'Fuhrpark: Maschine 2', 'input'],
  ['machine_3', 'Fuhrpark: Maschine 3', 'input'],
  ['about_title', 'Über mich: Titel', 'input'],
  ['about_tagline', 'Über mich: Leitspruch', 'input'],
  ['about_text', 'Über mich: Text', 'textarea'],
  ['stat_years', 'Zahl: Jahre Erfahrung', 'input'],
  ['stat_projects', 'Zahl: Projekte', 'input'],
  ['stat_machines', 'Zahl: Maschinen', 'input'],
  ['stat_altitude', 'Zahl: Höhenmeter', 'input'],
  ['contact_address', 'Kontakt: Adresse', 'input'],
  ['contact_email', 'Kontakt: E-Mail', 'input'],
  ['contact_phone', 'Kontakt: Telefon', 'input'],
  ['footer_text', 'Fußzeile', 'input'],
];

function textePage({ settings, unread, flash }) {
  const content = `
<form class="panel form" action="/admin/texte" method="POST">
  ${TEXT_FIELDS.map(([key, label, kind]) =>
    kind === 'textarea'
      ? `<label>${esc(label)}<textarea name="${key}" rows="3">${esc(settings[key])}</textarea></label>`
      : `<label>${esc(label)}<input name="${key}" value="${esc(settings[key])}"></label>`
  ).join('')}
  <div class="form__actions"><button class="btn btn--primary">Alle Texte speichern</button></div>
</form>`;
  return adminLayout({ title: 'Texte', active: '/admin/texte', content, unread, flash });
}

function anfragenPage({ inquiries, unread }) {
  const content = `
<div class="inquiry-list">
${inquiries.map((i) => `
  <div class="inquiry${i.read ? '' : ' inquiry--new'}">
    <div class="inquiry__head">
      <strong>${esc(i.name)}</strong>
      <span>${formatDate(i.created_at)}</span>
      ${i.read ? '' : '<span class="tag tag--amber">Neu</span>'}
    </div>
    <div class="inquiry__meta">
      ${i.email ? `<a href="mailto:${esc(i.email)}">${esc(i.email)}</a>` : ''}
      ${i.phone ? ` · <a href="tel:${esc(i.phone)}">${esc(i.phone)}</a>` : ''}
      ${i.address ? ` · ${esc(i.address)}` : ''}
    </div>
    ${i.subject ? `<div class="inquiry__subject">${esc(i.subject)}</div>` : ''}
    <p class="inquiry__msg">${esc(i.message)}</p>
    <div class="inquiry__actions">
      ${i.read ? '' : `<form action="/admin/anfragen/${i.id}/gelesen" method="POST"><button class="btn btn--sm">Als gelesen markieren</button></form>`}
      <form action="/admin/anfragen/${i.id}/loeschen" method="POST" data-confirm="Anfrage wirklich löschen?"><button class="btn btn--sm btn--danger">Löschen</button></form>
    </div>
  </div>`).join('')}
${inquiries.length === 0 ? '<div class="panel">Noch keine Anfragen eingegangen.</div>' : ''}
</div>`;
  return adminLayout({ title: 'Anfragen', active: '/admin/anfragen', content, unread });
}

module.exports = { loginPage, dashboard, postsPage, postEditPage, fotosPage, textePage, anfragenPage };

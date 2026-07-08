'use strict';
const { esc, nl2br, formatDate, markdown } = require('../lib/util');
const { layout } = require('./layout');

const pad = (n) => String(n).padStart(2, '0');

// ---------- Partials ----------
function marquee(items) {
  const seq = items.map((w) => `<span>${esc(w)}</span>`).join('<i>●</i>');
  return `
  <div class="marquee" aria-hidden="true">
    <div class="marquee__track">
      <div class="marquee__seq">${seq}<i>●</i></div>
      <div class="marquee__seq">${seq}<i>●</i></div>
    </div>
  </div>`;
}

function sectionHead(num, title) {
  return `
  <div class="sec__head reveal">
    <span class="mono-label">${num} / ${esc(title).toUpperCase()}</span>
  </div>`;
}

function contactForm() {
  return `
  <form class="cform" data-contact-form action="/kontakt" method="POST">
    <div class="cform__grid">
      <label><span class="mono-label">01 — Name *</span><input name="name" required autocomplete="name"></label>
      <label><span class="mono-label">02 — E-Mail *</span><input name="email" type="email" required autocomplete="email"></label>
      <label><span class="mono-label">03 — Telefon</span><input name="phone" autocomplete="tel"></label>
      <label><span class="mono-label">04 — Baustelle / Ort</span><input name="address"></label>
      <label class="cform__full"><span class="mono-label">05 — Betreff</span><input name="subject" placeholder="z. B. Aushub Einfamilienhaus"></label>
      <label class="cform__full"><span class="mono-label">06 — Nachricht *</span><textarea name="message" rows="6" required></textarea></label>
    </div>
    <button type="submit" class="cform__submit"><span>Anfrage absenden</span><b>→</b></button>
    <p class="cform__success" hidden>✓ DANKE. ANFRAGE EINGEGANGEN — ANTWORT FOLGT RASCH.</p>
  </form>`;
}

function projectFigure(p, i) {
  return `
  <figure class="proj reveal" data-category="${esc(p.category)}" data-lightbox-item data-full="${esc(p.image)}" data-caption="ABB. ${pad(i + 1)} — ${esc(p.title).toUpperCase()}">
    <div class="proj__imgwrap">
      <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
      <span class="proj__stamp">Ansehen&nbsp;↗</span>
    </div>
    <figcaption>
      <span class="mono-label">ABB. ${pad(i + 1)} — ${esc(p.category).toUpperCase()}</span>
      <strong>${esc(p.title)}</strong>
      ${p.description ? `<span class="proj__desc">${esc(p.description)}</span>` : ''}
    </figcaption>
  </figure>`;
}

function postRow(p, i) {
  return `
  <a class="post-row reveal" href="/berichte/${esc(p.slug)}" style="--d:${(i % 5) * 60}ms">
    <span class="mono-label">${formatDate(p.created_at)}</span>
    <strong>${esc(p.title)}</strong>
    <span class="post-row__arrow">→</span>
  </a>`;
}

// ---------- One-Pager ----------
function indexPage({ settings: s, projects, posts, categories }) {
  const heroLines = esc(s.hero_title).split('\n');
  const tickerWords = ['Aushub', 'Bohrungen', 'Steilgelände', 'Fundamente', 'Menzi Muck', 'Erdbau', 'Montafon'];
  const machines = [s.machine_1, s.machine_2, s.machine_3];

  const content = `
<!-- 00 / HERO -->
<section class="hero">
  <div class="hero__meta mono-label reveal-now">
    <span>${esc(s.hero_kicker)}</span>
    <span>47.08° N / 9.92° O</span>
  </div>
  <h1 class="hero__title">
    ${heroLines.map((l, i) => `<span class="hero__line${i % 2 ? ' hero__line--outline' : ''}" style="--d:${i * 120}ms">${l}</span>`).join('')}
  </h1>
  <div class="hero__foot">
    <p class="hero__sub reveal-now" style="--d:300ms">${esc(s.hero_subtitle)}</p>
    <a class="hero__go reveal-now" style="--d:420ms" href="/#kontakt" data-anchor>Kostenloses Angebot&nbsp;→</a>
  </div>
  <figure class="hero__img reveal-now" style="--d:200ms">
    <img src="/assets/img/hero.jpg" alt="Menzi Muck im Steilhang">
    <figcaption class="mono-label">ABB. 00 — MENZI MUCK IM STEILHANG, MONTAFON</figcaption>
  </figure>
</section>

${marquee(tickerWords)}

<!-- 01 / LEISTUNGEN -->
<section class="sec" id="leistungen">
  ${sectionHead('01', 'Leistungen')}
  <h2 class="sec__title reveal">${esc(s.intro_title)}</h2>
  <p class="sec__intro reveal">${nl2br(s.intro_text)}</p>

  <div class="svc">
    <a class="svc__row reveal" href="/#kontakt" data-anchor>
      <span class="svc__num">01</span>
      <span class="svc__name">Erdbewegung</span>
      <span class="svc__desc">Aushub, Grabarbeiten, Geländemodellierung — vom Einfamilienhaus bis zum Großprojekt.</span>
      <span class="svc__arrow">→</span>
    </a>
    <a class="svc__row reveal" href="/#kontakt" data-anchor>
      <span class="svc__num">02</span>
      <span class="svc__name">Spezialarbeiten</span>
      <span class="svc__desc">Bohrungen, Hangsicherung und Einsätze im steilsten Gelände — mit dem Menzi Muck.</span>
      <span class="svc__arrow">→</span>
    </a>
    <div class="svc__row svc__row--static reveal">
      <span class="svc__num">03</span>
      <span class="svc__name">Fuhrpark</span>
      <span class="svc__desc">
        <table class="mach mono-label"><tbody>
          ${machines.map((m, i) => `<tr><td>M-${pad(i + 1)}</td><td>${esc(m)}</td><td>[ EINSATZBEREIT ]</td></tr>`).join('')}
        </tbody></table>
      </span>
      <span class="svc__arrow"></span>
    </div>
  </div>
</section>

<!-- 02 / PROJEKTE -->
<section class="sec sec--full" id="projekte">
  ${sectionHead('02', 'Projekte')}
  <h2 class="sec__title reveal">Portfolio</h2>
  <div class="pfilter mono-label reveal" data-filter-bar>
    <button class="pfilter__btn is-active" data-filter="*">[ Alle ]</button>
    ${categories.map((c) => `<button class="pfilter__btn" data-filter="${esc(c)}">[ ${esc(c)} ]</button>`).join('')}
  </div>
  <div class="pgrid" data-project-grid>
    ${projects.map(projectFigure).join('')}
  </div>
</section>

<!-- 03 / ZAHLEN -->
<section class="sec sec--dark" id="zahlen">
  ${sectionHead('03', 'Zahlen')}
  <div class="stats">
    <div class="stats__item reveal"><b data-counter="${esc(s.stat_years)}">0</b><span class="mono-label">Jahre Erfahrung</span></div>
    <div class="stats__item reveal" style="--d:80ms"><b data-counter="${esc(s.stat_projects)}" data-suffix="+">0</b><span class="mono-label">Projekte umgesetzt</span></div>
    <div class="stats__item reveal" style="--d:160ms"><b data-counter="${esc(s.stat_machines)}">0</b><span class="mono-label">Maschinen im Fuhrpark</span></div>
    <div class="stats__item reveal" style="--d:240ms"><b data-counter="${esc(s.stat_altitude)}" data-suffix="+">0</b><span class="mono-label">Höhenmeter Heimvorteil</span></div>
  </div>
</section>

<!-- 04 / PERSON -->
<section class="sec" id="person">
  ${sectionHead('04', 'Person')}
  <div class="person">
    <figure class="person__img reveal">
      <img src="/assets/img/portrait.jpg" alt="Joel Wachter — WAGA Erdbau" loading="lazy">
      <figcaption class="mono-label">WACHTER, JOEL — INHABER</figcaption>
    </figure>
    <div class="person__txt">
      <h2 class="sec__title reveal">${esc(s.about_title)}</h2>
      <p class="person__tagline mono-label reveal">${esc(s.about_tagline).toUpperCase()}</p>
      <p class="sec__intro reveal">${nl2br(s.about_text)}</p>
    </div>
  </div>
</section>

${posts.length ? `
<!-- 05 / BERICHTE -->
<section class="sec sec--rule" id="berichte">
  ${sectionHead('05', 'Berichte')}
  <h2 class="sec__title reveal">Von der Baustelle</h2>
  <div class="post-list">
    ${posts.slice(0, 5).map(postRow).join('')}
  </div>
  <a class="sec__more mono-label reveal" href="/berichte">[ Alle Berichte ansehen → ]</a>
</section>` : ''}

${marquee(['Projekt geplant?', 'Sprechen wir.', 'Projekt geplant?', 'Sprechen wir.'])}

<!-- 06 / KONTAKT -->
<section class="sec" id="kontakt">
  ${sectionHead('06', 'Kontakt')}
  <h2 class="sec__title sec__title--xl reveal">Sprechen<br>wir.</h2>
  <div class="contact">
    <div class="contact__info reveal">
      <table class="mono-label contact__table"><tbody>
        <tr><td>ADR.</td><td>${esc(s.contact_address)}</td></tr>
        <tr><td>MAIL</td><td><a href="mailto:${esc(s.contact_email)}">${esc(s.contact_email)}</a></td></tr>
        <tr><td>TEL.</td><td><a href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">${esc(s.contact_phone)}</a></td></tr>
      </tbody></table>
      <a class="contact__call" href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">Direkt anrufen&nbsp;↗</a>
    </div>
    <div class="reveal" style="--d:120ms">${contactForm()}</div>
  </div>
</section>`;
  return layout({ title: 'Start', active: '/#top', settings: s, content, bodyClass: 'page-home' });
}

// ---------- Berichte (Zeitungs-Stil) ----------
function berichtePage({ settings: s, posts }) {
  const content = `
<section class="sec sec--page">
  <span class="mono-label reveal-now">03 / BERICHTE — ARCHIV</span>
  <h1 class="sec__title sec__title--xl reveal-now" style="--d:80ms">Berichte</h1>
  <div class="post-list post-list--page">
    ${posts.length ? posts.map(postRow).join('') : '<p class="sec__intro">Noch keine Berichte vorhanden.</p>'}
  </div>
</section>`;
  return layout({ title: 'Berichte', active: '/berichte', settings: s, content });
}

function berichtPage({ settings: s, post }) {
  const content = `
<article class="sec sec--page article">
  <a href="/berichte" class="mono-label article__back reveal-now">← ZURÜCK ZUM ARCHIV</a>
  <span class="mono-label reveal-now" style="--d:40ms">${formatDate(post.created_at)}</span>
  <h1 class="article__title reveal-now" style="--d:100ms">${esc(post.title)}</h1>
  ${post.image ? `<figure class="article__hero reveal-now" style="--d:160ms"><img src="${esc(post.image)}" alt=""><figcaption class="mono-label">ABB. — ${esc(post.title).toUpperCase()}</figcaption></figure>` : ''}
  <div class="article__body reveal-now" style="--d:220ms">${markdown(post.body)}</div>
  <div class="article__cta reveal">
    <span>Projekt geplant?</span>
    <a href="/#kontakt" data-anchor class="hero__go">Kontakt aufnehmen&nbsp;→</a>
  </div>
</article>`;
  return layout({ title: post.title, description: post.excerpt, active: '/berichte', settings: s, content });
}

function notFoundPage({ settings: s }) {
  const content = `
<section class="sec sec--page">
  <span class="mono-label reveal-now">FEHLER / 404</span>
  <h1 class="sec__title sec__title--xl reveal-now" style="--d:80ms">Ausgebaggert.</h1>
  <p class="sec__intro reveal-now" style="--d:160ms">Diese Seite existiert nicht (mehr).</p>
  <a class="hero__go reveal-now" style="--d:240ms" href="/">Zur Startseite&nbsp;→</a>
</section>`;
  return layout({ title: 'Seite nicht gefunden', settings: s, content });
}

module.exports = { indexPage, berichtePage, berichtPage, notFoundPage };

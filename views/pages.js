'use strict';
const { esc, nl2br, formatDate, markdown } = require('../lib/util');
const { layout } = require('./layout');

// ---------- Partials ----------
function contactForm(s, { compact = false } = {}) {
  return `
  <form class="contact-form${compact ? ' contact-form--compact' : ''}" data-contact-form action="/kontakt" method="POST">
    <div class="form-grid">
      <label>Name<input name="name" required autocomplete="name" placeholder="Max Mustermann"></label>
      <label>E-Mail<input name="email" type="email" required autocomplete="email" placeholder="max@beispiel.at"></label>
      <label>Telefon<input name="phone" autocomplete="tel" placeholder="0664 …"></label>
      <label>Adresse / Baustelle<input name="address" placeholder="Ort der Baustelle"></label>
      <label class="form-grid__full">Betreff<input name="subject" placeholder="z. B. Aushub Einfamilienhaus"></label>
      <label class="form-grid__full">Nachricht<textarea name="message" rows="5" required placeholder="Beschreiben Sie kurz Ihr Projekt …"></textarea></label>
    </div>
    <button type="submit" class="btn btn--amber btn--lg">Anfrage absenden</button>
    <p class="contact-form__success" hidden>✓ Danke für Ihre Anfrage! Ich melde mich so schnell wie möglich.</p>
  </form>`;
}

function projectCard(p, i) {
  return `
  <figure class="project-card reveal" data-category="${esc(p.category)}" data-lightbox-item data-full="${esc(p.image)}" data-caption="${esc(p.title)}" style="--d:${(i % 6) * 70}ms">
    <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" onerror="this.closest('figure').classList.add('project-card--noimg')">
    <figcaption>
      <span class="project-card__cat">${esc(p.category)}</span>
      <strong>${esc(p.title)}</strong>
      ${p.description ? `<span class="project-card__desc">${esc(p.description)}</span>` : ''}
    </figcaption>
  </figure>`;
}

function postCard(p, i = 0) {
  return `
  <article class="post-card reveal" style="--d:${(i % 3) * 90}ms">
    ${p.image ? `<a class="post-card__img" href="/berichte/${esc(p.slug)}"><img src="${esc(p.image)}" alt="" loading="lazy"></a>` : ''}
    <div class="post-card__body">
      <time datetime="${esc(p.created_at)}">${formatDate(p.created_at)}</time>
      <h3><a href="/berichte/${esc(p.slug)}">${esc(p.title)}</a></h3>
      <p>${esc(p.excerpt)}</p>
      <a class="post-card__more" href="/berichte/${esc(p.slug)}">Weiterlesen →</a>
    </div>
  </article>`;
}

function sectionHead(kicker, title, text = '') {
  return `
  <div class="section-head reveal">
    <span class="section-head__kicker">${kicker}</span>
    <h2>${title}</h2>
    ${text ? `<p>${text}</p>` : ''}
  </div>`;
}

// ---------- Pages ----------
function indexPage({ settings: s, projects, posts }) {
  const content = `
<section class="hero" data-parallax>
  <div class="hero__bg" style="background-image:url('/assets/img/hero.jpg')"></div>
  <div class="hero__overlay"></div>
  <div class="hero__stripes" aria-hidden="true"></div>
  <div class="container hero__content">
    <span class="hero__kicker reveal-now" style="--d:0ms">${esc(s.hero_kicker)}</span>
    <h1 class="hero__title">${esc(s.hero_title).split('\n').map((l, i) => `<span class="hero__line" style="--d:${120 + i * 140}ms"><span>${l}</span></span>`).join('')}</h1>
    <p class="hero__sub reveal-now" style="--d:520ms">${esc(s.hero_subtitle)}</p>
    <div class="hero__cta reveal-now" style="--d:680ms">
      <a href="/kontakt" class="btn btn--amber btn--lg">Kostenloses Angebot</a>
      <a href="/projekte" class="btn btn--ghost btn--lg">Projekte ansehen</a>
    </div>
  </div>
  <a href="#stats" class="hero__scroll" aria-label="Nach unten scrollen"><span></span></a>
</section>

<section class="stats" id="stats">
  <div class="container stats__grid">
    <div class="stat reveal"><strong data-counter="${esc(s.stat_years)}">0</strong><span>Jahre Erfahrung</span></div>
    <div class="stat reveal" style="--d:80ms"><strong data-counter="${esc(s.stat_projects)}" data-suffix="+">0</strong><span>Projekte umgesetzt</span></div>
    <div class="stat reveal" style="--d:160ms"><strong data-counter="${esc(s.stat_machines)}">0</strong><span>Maschinen im Fuhrpark</span></div>
    <div class="stat reveal" style="--d:240ms"><strong data-counter="${esc(s.stat_altitude)}" data-suffix="+">0</strong><span>Höhenmeter Heimvorteil</span></div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="split__text">
      ${sectionHead('Über WAGA Erdbau', esc(s.intro_title))}
      <p class="reveal lead">${nl2br(s.intro_text)}</p>
      <div class="reveal" style="--d:120ms"><a href="/leistungen" class="btn btn--navy">Meine Leistungen</a>
      <a href="/ueber-mich" class="btn btn--ghost-dark">Über mich</a></div>
    </div>
    <div class="split__media reveal" style="--d:150ms">
      <div class="tilt-card" data-tilt>
        <img src="/assets/img/projekt-aushub.jpg" alt="Bagger bei Aushubarbeiten" loading="lazy">
        <div class="tilt-card__badge">Einsatz in<br><b>jedem Gelände</b></div>
      </div>
    </div>
  </div>
</section>

<section class="section section--navy" id="leistungen-teaser">
  <div class="container">
    ${sectionHead('Was ich anbiete', 'Leistungen', esc(s.services_intro))}
    <div class="service-grid">
      <a href="/leistungen" class="service-card reveal" data-tilt>
        <svg viewBox="0 0 24 24" class="service-card__icon" aria-hidden="true"><path d="M2 20h13M4 17h9l1 3M6 17v-4h5l2 4M11 13 8 7h3l4 6M15 7l5 4-1.5 2.5M20 11l1-5-4 1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h3>Erdbewegung</h3>
        <p>Aushub, Grabarbeiten und Geländemodellierung – vom Einfamilienhaus bis zum Großprojekt.</p>
        <span class="service-card__link">Mehr erfahren →</span>
      </a>
      <a href="/leistungen" class="service-card reveal" style="--d:100ms" data-tilt>
        <svg viewBox="0 0 24 24" class="service-card__icon" aria-hidden="true"><path d="m12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 16.7l.9-5L4.8 8.2l5-.7L12 3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
        <h3>Spezialarbeiten</h3>
        <p>Bohrungen, Steilgelände und Spezialeinsätze mit dem Menzi Muck Schreitbagger.</p>
        <span class="service-card__link">Mehr erfahren →</span>
      </a>
      <div class="service-card service-card--list reveal" style="--d:200ms">
        <h3>Mein Fuhrpark</h3>
        <ul class="machine-list">
          <li><span class="machine-list__dot"></span>${esc(s.machine_1)}</li>
          <li><span class="machine-list__dot"></span>${esc(s.machine_2)}</li>
          <li><span class="machine-list__dot"></span>${esc(s.machine_3)}</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead('Portfolio', 'Aktuelle Projekte', 'Ein Blick auf einige Baustellen der letzten Zeit.')}
    <div class="project-grid">
      ${projects.slice(0, 4).map(projectCard).join('')}
    </div>
    <div class="section__more reveal"><a href="/projekte" class="btn btn--navy">Alle Projekte</a></div>
  </div>
</section>

${posts.length ? `
<section class="section section--gray">
  <div class="container">
    ${sectionHead('Neuigkeiten', 'Berichte von der Baustelle')}
    <div class="post-grid">${posts.slice(0, 3).map(postCard).join('')}</div>
    <div class="section__more reveal"><a href="/berichte" class="btn btn--ghost-dark">Alle Berichte</a></div>
  </div>
</section>` : ''}

<section class="section section--navy" id="kontakt">
  <div class="container split split--form">
    <div class="split__text">
      ${sectionHead('Kontakt', 'Projekt geplant?', 'Erzählen Sie mir von Ihrem Vorhaben – Sie erhalten rasch ein unverbindliches Angebot.')}
      <ul class="contact-list reveal">
        <li><b>Adresse</b> ${esc(s.contact_address)}</li>
        <li><b>E-Mail</b> <a href="mailto:${esc(s.contact_email)}">${esc(s.contact_email)}</a></li>
        <li><b>Telefon</b> <a href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">${esc(s.contact_phone)}</a></li>
      </ul>
    </div>
    <div class="split__media reveal" style="--d:120ms">${contactForm(s, { compact: true })}</div>
  </div>
</section>`;
  return layout({ title: 'Start', active: '/', settings: s, content, bodyClass: 'page-home' });
}

function leistungenPage({ settings: s }) {
  const content = `
<section class="page-hero">
  <div class="container">
    <span class="page-hero__kicker reveal-now">WAGA Erdbau</span>
    <h1 class="reveal-now" style="--d:80ms">Meine Leistungen</h1>
    <p class="reveal-now" style="--d:160ms">${esc(s.services_intro)}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="feature-grid">
      <article class="feature reveal" data-tilt>
        <img src="/assets/img/projekt-aushub.jpg" alt="Erdbewegung mit dem Bagger" loading="lazy">
        <div class="feature__body">
          <h2>Erdbewegung</h2>
          <p>Aushubarbeiten für Einfamilienhäuser, Fundamente, Leitungsgräben und Geländemodellierungen. Sauber, termingerecht und mit dem richtigen Gerät für jede Baustellengröße.</p>
          <a href="/kontakt" class="btn btn--amber">Kontakt aufnehmen</a>
        </div>
      </article>
      <article class="feature reveal" style="--d:120ms" data-tilt>
        <img src="/assets/img/projekt-bohrung.jpg" alt="Spezialarbeiten im Steilgelände" loading="lazy">
        <div class="feature__body">
          <h2>Spezialarbeiten</h2>
          <p>Arbeiten im steilen Gelände sind meine Spezialität: Bohrungen, Hangsicherungen und Einsätze, bei denen konventionelle Bagger passen müssen – der Menzi Muck macht's möglich.</p>
          <a href="/kontakt" class="btn btn--amber">Kontakt aufnehmen</a>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    ${sectionHead('Bestens ausgerüstet', 'Der Fuhrpark', 'Mit diesen Maschinen bin ich für alle Projekte gerüstet:')}
    <div class="machine-grid">
      <div class="machine-card reveal" data-tilt><span class="machine-card__num">01</span><h3>${esc(s.machine_1)}</h3><p>Kompakt, stark und präzise – ideal für Aushub und Grabarbeiten aller Art.</p></div>
      <div class="machine-card reveal" style="--d:100ms" data-tilt><span class="machine-card__num">02</span><h3>${esc(s.machine_2)}</h3><p>Der Spezialist fürs Extreme: arbeitet dort, wo kein anderer Bagger mehr steht.</p></div>
      <div class="machine-card reveal" style="--d:200ms" data-tilt><span class="machine-card__num">03</span><h3>${esc(s.machine_3)}</h3><p>Flexibler Transport von Material und Gerät – direkt auf Ihre Baustelle.</p></div>
    </div>
    <p class="reveal center-text" style="--d:250ms"><b>Ich freue mich auf Ihre Anfrage.</b></p>
    <div class="section__more reveal"><a href="/kontakt" class="btn btn--amber btn--lg">Jetzt anfragen</a></div>
  </div>
</section>`;
  return layout({ title: 'Leistungen', active: '/leistungen', settings: s, content });
}

function projektePage({ settings: s, projects, categories }) {
  const content = `
<section class="page-hero">
  <div class="container">
    <span class="page-hero__kicker reveal-now">Portfolio</span>
    <h1 class="reveal-now" style="--d:80ms">Projekte</h1>
    <p class="reveal-now" style="--d:160ms">Einige Beispiele meiner Arbeit – tippen Sie auf ein Bild für die Großansicht.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="filter-bar reveal-now" data-filter-bar>
      <button class="filter-btn is-active" data-filter="*">Alle</button>
      ${categories.map((c) => `<button class="filter-btn" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div class="project-grid project-grid--full" data-project-grid>
      ${projects.map(projectCard).join('')}
    </div>
    ${projects.length === 0 ? '<p class="center-text">Noch keine Projekte vorhanden.</p>' : ''}
  </div>
</section>

<section class="section section--navy">
  <div class="container center-text">
    ${sectionHead('Ihr Projekt fehlt hier noch?', 'Machen wir es gemeinsam.')}
    <div class="reveal"><a href="/kontakt" class="btn btn--amber btn--lg">Angebot anfragen</a></div>
  </div>
</section>`;
  return layout({ title: 'Projekte', active: '/projekte', settings: s, content });
}

function ueberMichPage({ settings: s }) {
  const content = `
<section class="page-hero">
  <div class="container">
    <span class="page-hero__kicker reveal-now">WAGA Erdbau</span>
    <h1 class="reveal-now" style="--d:80ms">${esc(s.about_title)}</h1>
    <p class="reveal-now" style="--d:160ms">${esc(s.about_tagline)}</p>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="split__media reveal">
      <div class="tilt-card" data-tilt>
        <img src="/assets/img/portrait.jpg" alt="Joel Wachter – WAGA Erdbau" loading="lazy">
        <div class="tilt-card__badge">Joel<br><b>Wachter</b></div>
      </div>
    </div>
    <div class="split__text">
      <p class="lead reveal" style="--d:100ms">${nl2br(s.about_text)}</p>
      <ul class="value-list reveal" style="--d:200ms">
        <li><b>Präzision</b><span>Jeder Zentimeter zählt – auf ebener Fläche wie im Steilhang.</span></li>
        <li><b>Pünktlichkeit</b><span>Zugesagte Termine werden gehalten. Punkt.</span></li>
        <li><b>Exzellenz</b><span>Saubere Arbeit, auf die Sie sich verlassen können.</span></li>
      </ul>
      <div class="reveal" style="--d:280ms"><a href="/kontakt" class="btn btn--amber">Kontakt aufnehmen</a></div>
    </div>
  </div>
</section>`;
  return layout({ title: 'Über mich', active: '', settings: s, content });
}

function berichtePage({ settings: s, posts }) {
  const content = `
<section class="page-hero">
  <div class="container">
    <span class="page-hero__kicker reveal-now">Blog</span>
    <h1 class="reveal-now" style="--d:80ms">Berichte</h1>
    <p class="reveal-now" style="--d:160ms">Neuigkeiten und Geschichten direkt von der Baustelle.</p>
  </div>
</section>
<section class="section">
  <div class="container">
    ${posts.length ? `<div class="post-grid">${posts.map(postCard).join('')}</div>` : '<p class="center-text">Noch keine Berichte vorhanden – schauen Sie bald wieder vorbei!</p>'}
  </div>
</section>`;
  return layout({ title: 'Berichte', active: '/berichte', settings: s, content });
}

function berichtPage({ settings: s, post }) {
  const content = `
<article class="section article">
  <div class="container container--narrow">
    <a href="/berichte" class="article__back reveal-now">← Alle Berichte</a>
    <time class="reveal-now" style="--d:60ms" datetime="${esc(post.created_at)}">${formatDate(post.created_at)}</time>
    <h1 class="reveal-now" style="--d:120ms">${esc(post.title)}</h1>
    ${post.image ? `<img class="article__hero reveal-now" style="--d:180ms" src="${esc(post.image)}" alt="">` : ''}
    <div class="article__body reveal-now" style="--d:240ms">${markdown(post.body)}</div>
    <div class="article__cta reveal">
      <p><b>Projekt geplant?</b> Ich freue mich auf Ihre Anfrage.</p>
      <a href="/kontakt" class="btn btn--amber">Kontakt aufnehmen</a>
    </div>
  </div>
</article>`;
  return layout({ title: post.title, description: post.excerpt, active: '/berichte', settings: s, content });
}

function kontaktPage({ settings: s }) {
  const content = `
<section class="page-hero">
  <div class="container">
    <span class="page-hero__kicker reveal-now">Sprechen wir über Ihr Projekt</span>
    <h1 class="reveal-now" style="--d:80ms">Kontakt</h1>
    <p class="reveal-now" style="--d:160ms">Rufen Sie an, schreiben Sie ein E-Mail – oder nutzen Sie einfach das Formular.</p>
  </div>
</section>
<section class="section">
  <div class="container split split--form">
    <div class="split__text">
      <ul class="contact-list contact-list--dark reveal-now">
        <li><b>Adresse</b> ${esc(s.contact_address)}</li>
        <li><b>E-Mail</b> <a href="mailto:${esc(s.contact_email)}">${esc(s.contact_email)}</a></li>
        <li><b>Telefon</b> <a href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">${esc(s.contact_phone)}</a></li>
      </ul>
      <div class="contact-direct reveal-now" style="--d:120ms">
        <a class="btn btn--navy btn--lg" href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">📞 Jetzt anrufen</a>
      </div>
    </div>
    <div class="split__media reveal-now" style="--d:150ms">${contactForm(s)}</div>
  </div>
</section>`;
  return layout({ title: 'Kontakt', active: '/kontakt', settings: s, content });
}

function notFoundPage({ settings: s }) {
  const content = `
<section class="page-hero"><div class="container">
  <h1 class="reveal-now">404</h1>
  <p class="reveal-now" style="--d:80ms">Diese Seite wurde nicht gefunden – vermutlich wurde sie ausgebaggert.</p>
  <div class="reveal-now" style="--d:160ms"><a href="/" class="btn btn--amber">Zur Startseite</a></div>
</div></section>`;
  return layout({ title: 'Seite nicht gefunden', settings: s, content });
}

module.exports = { indexPage, leistungenPage, projektePage, ueberMichPage, berichtePage, berichtPage, kontaktPage, notFoundPage };

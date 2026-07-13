'use strict';
const { esc, nl2br, formatDate, markdown } = require('../lib/util');
const { layout } = require('./layout');

// ---------- Partials ----------
function contactForm() {
  return `
  <form class="cform" data-contact-form action="/kontakt" method="POST">
    <div class="cform__grid">
      <label>Name<input name="name" required autocomplete="name" placeholder="Max Mustermann"></label>
      <label>E-Mail<input name="email" type="email" required autocomplete="email" placeholder="max@beispiel.at"></label>
      <label>Telefon<input name="phone" autocomplete="tel" placeholder="0664 …"></label>
      <label>Baustelle / Ort<input name="address" placeholder="Ort der Baustelle"></label>
      <label class="cform__full">Betreff<input name="subject" placeholder="z. B. Aushub Einfamilienhaus"></label>
      <label class="cform__full">Nachricht<textarea name="message" rows="5" required placeholder="Beschreiben Sie kurz Ihr Projekt …"></textarea></label>
    </div>
    <label class="cform__consent">
      <input type="checkbox" required>
      <span>Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage zu.</span>
    </label>
    <button type="submit" class="btn btn--fill btn--lg">Anfrage senden</button>
    <p class="cform__success" hidden>Vielen Dank — Ihre Anfrage ist eingegangen. Sie hören rasch von mir.</p>
  </form>`;
}

function projectCard(p, i) {
  return `
  <figure class="pcard" data-category="${esc(p.category)}" data-lightbox-item data-full="${esc(p.image)}" data-caption="${esc(p.title)}">
    <div class="pcard__img"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div>
    <figcaption>
      <span class="pcard__cat">${esc(p.category)}</span>
      <strong>${esc(p.title)}</strong>
      ${p.description ? `<p>${esc(p.description)}</p>` : ''}
    </figcaption>
  </figure>`;
}

function postCard(p, i = 0) {
  return `
  <article class="ncard reveal" style="--d:${(i % 3) * 80}ms">
    ${p.image ? `<a class="ncard__img" href="/berichte/${esc(p.slug)}"><img src="${esc(p.image)}" alt="" loading="lazy"></a>` : ''}
    <div class="ncard__body">
      <time datetime="${esc(p.created_at)}">${formatDate(p.created_at)}</time>
      <h3><a href="/berichte/${esc(p.slug)}">${esc(p.title)}</a></h3>
      <p>${esc(p.excerpt)}</p>
      <a class="link" href="/berichte/${esc(p.slug)}">Weiterlesen <span>›</span></a>
    </div>
  </article>`;
}

function carousel(projects) {
  return `
  <div class="carousel" data-carousel>
    <div class="carousel__track" data-carousel-track>
      ${projects.map(projectCard).join('')}
    </div>
    <div class="carousel__ctrl">
      <button data-carousel-prev aria-label="Zurück">‹</button>
      <button data-carousel-next aria-label="Weiter">›</button>
    </div>
  </div>`;
}

function pageHero(kicker, title, sub = '', dark = false) {
  return `
<header class="phead${dark ? ' phead--dark' : ''}">
  <span class="eyebrow reveal-now">${esc(kicker)}</span>
  <h1 class="reveal-now" style="--d:80ms">${title}</h1>
  ${sub ? `<p class="reveal-now" style="--d:160ms">${esc(sub)}</p>` : ''}
</header>`;
}

// ---------- Home ----------
function indexPage({ settings: s, projects, posts }) {
  const heroTitle = esc(s.hero_title).split('\n').join(' ');
  const content = `
<section class="hero">
  <span class="eyebrow reveal-now">${esc(s.hero_kicker)}</span>
  <h1 class="hero__title reveal-now" style="--d:80ms">${heroTitle}</h1>
  <p class="hero__sub reveal-now" style="--d:180ms">${esc(s.hero_subtitle)}</p>
  <div class="hero__links reveal-now" style="--d:260ms">
    <a href="/kontakt" class="btn btn--fill">Angebot anfragen</a>
    <a href="/projekte" class="link link--lg">Projekte ansehen <span>›</span></a>
  </div>
  <figure class="hero__media reveal-now" style="--d:340ms" data-hero-media>
    <img src="/assets/img/hero.jpg" alt="Menzi Muck im Steilhang, Montafon">
  </figure>
</section>

<section class="stats">
  <div class="wrap stats__grid">
    <div class="reveal"><b data-counter="${esc(s.stat_years)}">0</b><span>Jahre Erfahrung</span></div>
    <div class="reveal" style="--d:70ms"><b data-counter="${esc(s.stat_projects)}" data-suffix="+">0</b><span>Projekte umgesetzt</span></div>
    <div class="reveal" style="--d:140ms"><b data-counter="${esc(s.stat_machines)}">0</b><span>Maschinen im Fuhrpark</span></div>
    <div class="reveal" style="--d:210ms"><b data-counter="${esc(s.stat_altitude)}" data-suffix="+">0</b><span>Höhenmeter Heimvorteil</span></div>
  </div>
</section>

<section class="tiles wrap-wide">
  <div class="tile tile--light reveal">
    <div class="tile__copy">
      <span class="eyebrow">Erdbewegung</span>
      <h2>Aushub. Präzise wie am Reißbrett.</h2>
      <div class="tile__links">
        <a class="link" href="/leistungen">Mehr erfahren <span>›</span></a>
        <a class="link" href="/kontakt">Anfragen <span>›</span></a>
      </div>
    </div>
    <figure><img src="/assets/img/projekt-aushub.jpg" alt="Aushubarbeiten" loading="lazy"></figure>
  </div>
  <div class="tile tile--dark reveal" style="--d:100ms">
    <div class="tile__copy">
      <span class="eyebrow">Spezialarbeiten</span>
      <h2>Steilgelände. Gemeistert.</h2>
      <div class="tile__links">
        <a class="link" href="/leistungen">Mehr erfahren <span>›</span></a>
        <a class="link" href="/kontakt">Anfragen <span>›</span></a>
      </div>
    </div>
    <figure><img src="/assets/img/projekt-bohrung-2.jpg" alt="Bohrungen im Steilgelände" loading="lazy"></figure>
  </div>
</section>

<section class="feature-dark">
  <div class="feature-dark__copy">
    <span class="eyebrow reveal">Der Spezialist</span>
    <h2 class="reveal" style="--d:60ms">Menzi Muck.<br>Wo andere aufgeben.</h2>
    <p class="reveal" style="--d:140ms">Der Schreitbagger arbeitet dort, wo konventionelle Maschinen längst passen müssen — im steilsten Gelände des Montafons.</p>
    <a class="link link--lg reveal" style="--d:200ms" href="/leistungen">Den Fuhrpark entdecken <span>›</span></a>
  </div>
  <figure class="feature-dark__media reveal" style="--d:160ms"><img src="/assets/img/projekt-bohrung.jpg" alt="Menzi Muck bei Bohrarbeiten" loading="lazy"></figure>
</section>

<section class="csec">
  <div class="wrap csec__head">
    <h2 class="reveal">Aktuelle Projekte.</h2>
    <a class="link reveal" href="/projekte">Alle ansehen <span>›</span></a>
  </div>
  ${carousel(projects)}
</section>

${posts.length ? `
<section class="csec csec--gray">
  <div class="wrap csec__head">
    <h2 class="reveal">Von der Baustelle.</h2>
    <a class="link reveal" href="/berichte">Alle Berichte <span>›</span></a>
  </div>
  <div class="wrap ngrid">${posts.slice(0, 3).map(postCard).join('')}</div>
</section>` : ''}

<section class="cta">
  <h2 class="reveal">Projekt geplant?</h2>
  <p class="reveal" style="--d:80ms">Erzählen Sie mir von Ihrem Vorhaben — Sie erhalten rasch ein unverbindliches Angebot.</p>
  <div class="reveal" style="--d:160ms">
    <a href="/kontakt" class="btn btn--fill btn--lg">Kontakt aufnehmen</a>
    <a href="tel:${esc(s.contact_phone).replaceAll(' ', '')}" class="link link--lg">Direkt anrufen <span>›</span></a>
  </div>
</section>`;
  return layout({ title: 'Start', active: '/', settings: s, content, bodyClass: 'page-home' });
}

// ---------- Leistungen ----------
function leistungenPage({ settings: s }) {
  const content = `
${pageHero('Leistungen', 'Zwei Spezialgebiete.<br>Ein Anspruch.', s.services_intro)}

<section class="tiles wrap-wide">
  <div class="tile tile--light tile--tall reveal">
    <div class="tile__copy">
      <span class="eyebrow">01 — Erdbewegung</span>
      <h2>Vom ersten Aushub bis zur letzten Schaufel.</h2>
      <p>Aushubarbeiten für Einfamilienhäuser, Fundamente, Leitungsgräben und Geländemodellierungen — termingerecht und sauber.</p>
      <div class="tile__links"><a class="link" href="/kontakt">Anfragen <span>›</span></a></div>
    </div>
    <figure><img src="/assets/img/projekt-aushub.jpg" alt="Erdbewegung" loading="lazy"></figure>
  </div>
  <div class="tile tile--dark tile--tall reveal" style="--d:100ms">
    <div class="tile__copy">
      <span class="eyebrow">02 — Spezialarbeiten</span>
      <h2>Bohrungen und Einsätze im steilsten Gelände.</h2>
      <p>Hangsicherungen, Bohrungen und Arbeiten, bei denen konventionelle Bagger passen müssen — der Menzi Muck macht's möglich.</p>
      <div class="tile__links"><a class="link" href="/kontakt">Anfragen <span>›</span></a></div>
    </div>
    <figure><img src="/assets/img/projekt-fundament.jpg" alt="Spezialarbeiten" loading="lazy"></figure>
  </div>
</section>

<section class="csec csec--gray">
  <div class="wrap csec__head csec__head--center">
    <h2 class="reveal">Der Fuhrpark.</h2>
    <p class="reveal" style="--d:60ms">Drei Maschinen. Bereit für jede Baustelle.</p>
  </div>
  <div class="wrap fleet">
    <div class="fleet__card reveal"><span class="fleet__num">01</span><h3>${esc(s.machine_1)}</h3><p>Kompakt, stark und präzise — ideal für Aushub und Grabarbeiten aller Art.</p></div>
    <div class="fleet__card reveal" style="--d:90ms"><span class="fleet__num">02</span><h3>${esc(s.machine_2)}</h3><p>Der Spezialist fürs Extreme — arbeitet, wo kein anderer Bagger mehr steht.</p></div>
    <div class="fleet__card reveal" style="--d:180ms"><span class="fleet__num">03</span><h3>${esc(s.machine_3)}</h3><p>Flexibler Transport von Material und Gerät, direkt auf Ihre Baustelle.</p></div>
  </div>
</section>

<section class="cta">
  <h2 class="reveal">Bereit für Ihre Baustelle.</h2>
  <div class="reveal" style="--d:100ms"><a href="/kontakt" class="btn btn--fill btn--lg">Jetzt anfragen</a></div>
</section>`;
  return layout({ title: 'Leistungen', active: '/leistungen', settings: s, content });
}

// ---------- Projekte ----------
function projektePage({ settings: s, projects, categories }) {
  const content = `
${pageHero('Portfolio', 'Projekte.', 'Eine Auswahl aktueller Arbeiten — tippen Sie auf ein Bild für die Großansicht.')}

<section class="csec">
  <div class="wrap">
    <div class="seg reveal-now" data-filter-bar>
      <button class="seg__btn is-active" data-filter="*">Alle</button>
      ${categories.map((c) => `<button class="seg__btn" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div class="pgrid" data-project-grid>
      ${projects.map(projectCard).join('')}
    </div>
    ${projects.length === 0 ? '<p class="phead__sub">Noch keine Projekte vorhanden.</p>' : ''}
  </div>
</section>

<section class="cta">
  <h2 class="reveal">Ihr Projekt fehlt hier noch.</h2>
  <div class="reveal" style="--d:100ms"><a href="/kontakt" class="btn btn--fill btn--lg">Angebot anfragen</a></div>
</section>`;
  return layout({ title: 'Projekte', active: '/projekte', settings: s, content });
}

// ---------- Über mich ----------
function ueberMichPage({ settings: s }) {
  const content = `
${pageHero('Waga Erdbau', esc(s.about_title) + '.', s.about_tagline)}

<section class="csec">
  <div class="wrap about">
    <figure class="about__img reveal"><img src="/assets/img/portrait.jpg" alt="Joel Wachter — Waga Erdbau" loading="lazy"><figcaption>Joel Wachter, Inhaber</figcaption></figure>
    <div class="about__txt">
      <p class="reveal about__lead">${nl2br(s.about_text)}</p>
      <div class="about__values">
        <div class="reveal" style="--d:80ms"><h3>Präzision.</h3><p>Jeder Zentimeter zählt — auf ebener Fläche wie im Steilhang.</p></div>
        <div class="reveal" style="--d:160ms"><h3>Pünktlichkeit.</h3><p>Zugesagte Termine werden gehalten.</p></div>
        <div class="reveal" style="--d:240ms"><h3>Exzellenz.</h3><p>Saubere Arbeit, auf die Sie sich verlassen können.</p></div>
      </div>
      <div class="reveal" style="--d:300ms"><a href="/kontakt" class="btn btn--fill">Kontakt aufnehmen</a></div>
    </div>
  </div>
</section>`;
  return layout({ title: 'Über mich', active: '', settings: s, content });
}

// ---------- Berichte ----------
function berichtePage({ settings: s, posts }) {
  const content = `
${pageHero('Blog', 'Berichte.', 'Neuigkeiten und Einblicke — direkt von der Baustelle.')}
<section class="csec">
  <div class="wrap">
    ${posts.length ? `<div class="ngrid">${posts.map(postCard).join('')}</div>` : '<p class="phead__sub">Noch keine Berichte vorhanden.</p>'}
  </div>
</section>`;
  return layout({ title: 'Berichte', active: '/berichte', settings: s, content });
}

function berichtPage({ settings: s, post }) {
  const content = `
<article class="article">
  <div class="wrap wrap--narrow">
    <a href="/berichte" class="link reveal-now"><span>‹</span> Alle Berichte</a>
    <time class="reveal-now" style="--d:60ms" datetime="${esc(post.created_at)}">${formatDate(post.created_at)}</time>
    <h1 class="reveal-now" style="--d:120ms">${esc(post.title)}</h1>
    ${post.image ? `<figure class="article__hero reveal-now" style="--d:180ms"><img src="${esc(post.image)}" alt=""></figure>` : ''}
    <div class="article__body reveal-now" style="--d:240ms">${markdown(post.body)}</div>
    <div class="article__cta reveal">
      <p>Projekt geplant?</p>
      <a href="/kontakt" class="btn btn--fill">Kontakt aufnehmen</a>
    </div>
  </div>
</article>`;
  return layout({ title: post.title, description: post.excerpt, active: '/berichte', settings: s, content });
}

// ---------- Kontakt ----------
function kontaktPage({ settings: s }) {
  const content = `
${pageHero('Kontakt', 'Sprechen wir<br>über Ihr Projekt.', 'Rufen Sie an, schreiben Sie ein E-Mail — oder nutzen Sie das Formular.')}
<section class="csec">
  <div class="wrap contact">
    <div class="contact__info reveal-now">
      <div class="contact__card">
        <h3>Adresse</h3><p>${esc(s.contact_address)}</p>
        <h3>E-Mail</h3><p><a href="mailto:${esc(s.contact_email)}">${esc(s.contact_email)}</a></p>
        <h3>Telefon</h3><p><a href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">${esc(s.contact_phone)}</a></p>
        <a class="btn btn--ghost" href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">Direkt anrufen</a>
      </div>
    </div>
    <div class="reveal-now" style="--d:120ms">${contactForm()}</div>
  </div>
</section>`;
  return layout({ title: 'Kontakt', active: '/kontakt', settings: s, content });
}

// ---------- Rechtliches ----------
function legalPage({ settings: s, kind }) {
  const isImpressum = kind === 'impressum';
  const content = `
<article class="article">
  <div class="wrap wrap--narrow">
    <h1 class="reveal-now">${isImpressum ? 'Impressum.' : 'Datenschutz.'}</h1>
    <div class="article__body legal reveal-now" style="--d:80ms">
      ${markdown(isImpressum ? s.legal_impressum : s.legal_datenschutz)}
    </div>
  </div>
</article>`;
  return layout({
    title: isImpressum ? 'Impressum' : 'Datenschutzerklärung',
    description: isImpressum ? 'Impressum von WAGA Erdbau' : 'Datenschutzerklärung von WAGA Erdbau',
    settings: s,
    content,
  });
}

function notFoundPage({ settings: s }) {
  const content = `
${pageHero('Fehler 404', 'Seite nicht gefunden.', 'Diese Seite existiert nicht (mehr).')}
<section class="csec" style="text-align:center"><a href="/" class="btn btn--fill btn--lg">Zur Startseite</a></section>`;
  return layout({ title: 'Seite nicht gefunden', settings: s, content });
}

module.exports = { indexPage, leistungenPage, projektePage, ueberMichPage, berichtePage, berichtPage, kontaktPage, legalPage, notFoundPage };

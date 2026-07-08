'use strict';
const { esc, nl2br, formatDate, markdown } = require('../lib/util');
const { layout } = require('./layout');

// ---------- Partials ----------
function eyebrow(text) {
  return `<span class="eyebrow reveal">${esc(text)}</span>`;
}

function contactForm() {
  return `
  <form class="cform" data-contact-form action="/kontakt" method="POST">
    <div class="cform__grid">
      <label>Name *<input name="name" required autocomplete="name"></label>
      <label>E-Mail *<input name="email" type="email" required autocomplete="email"></label>
      <label>Telefon<input name="phone" autocomplete="tel"></label>
      <label>Baustelle / Ort<input name="address"></label>
      <label class="cform__full">Betreff<input name="subject" placeholder="z. B. Aushub Einfamilienhaus"></label>
      <label class="cform__full">Nachricht *<textarea name="message" rows="5" required></textarea></label>
    </div>
    <button type="submit" class="btn btn--ink btn--lg">Anfrage senden</button>
    <p class="cform__success" hidden>Vielen Dank — Ihre Anfrage ist eingegangen. Sie hören rasch von mir.</p>
  </form>`;
}

function projectFigure(p, i) {
  return `
  <figure class="proj reveal" data-category="${esc(p.category)}" data-lightbox-item data-full="${esc(p.image)}" data-caption="${esc(p.title)}" style="--d:${(i % 6) * 70}ms">
    <div class="proj__frame"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div>
    <figcaption>
      <span class="proj__cat">${esc(p.category)}</span>
      <strong>${esc(p.title)}</strong>
      ${p.description ? `<p>${esc(p.description)}</p>` : ''}
    </figcaption>
  </figure>`;
}

function postCard(p, i = 0) {
  return `
  <article class="post reveal" style="--d:${(i % 3) * 80}ms">
    ${p.image ? `<a class="post__img" href="/berichte/${esc(p.slug)}"><img src="${esc(p.image)}" alt="" loading="lazy"></a>` : ''}
    <time datetime="${esc(p.created_at)}">${formatDate(p.created_at)}</time>
    <h3><a href="/berichte/${esc(p.slug)}">${esc(p.title)}</a></h3>
    <p>${esc(p.excerpt)}</p>
    <a class="post__more" href="/berichte/${esc(p.slug)}">Weiterlesen</a>
  </article>`;
}

function pageHero(kicker, title, sub = '') {
  return `
<section class="phero">
  <div class="wrap">
    <span class="eyebrow reveal-now">${esc(kicker)}</span>
    <h1 class="reveal-now" style="--d:80ms">${title}</h1>
    ${sub ? `<p class="phero__sub reveal-now" style="--d:160ms">${esc(sub)}</p>` : ''}
  </div>
</section>`;
}

// ---------- Home ----------
function indexPage({ settings: s, projects, posts }) {
  const heroTitle = esc(s.hero_title).split('\n').join(' ');
  const content = `
<section class="hero">
  <div class="wrap">
    <span class="eyebrow reveal-now">${esc(s.hero_kicker)}</span>
    <h1 class="hero__title reveal-now" style="--d:100ms">${heroTitle}</h1>
    <div class="hero__row reveal-now" style="--d:220ms">
      <p class="hero__sub">${esc(s.hero_subtitle)}</p>
      <div class="hero__cta">
        <a href="/kontakt" class="btn btn--ink btn--lg">Kostenloses Angebot</a>
        <a href="/projekte" class="link-arrow">Projekte ansehen</a>
      </div>
    </div>
  </div>
  <figure class="hero__media reveal-now" style="--d:300ms">
    <img src="/assets/img/hero.jpg" alt="Menzi Muck im Steilhang, Montafon">
    <figcaption>Menzi Muck im Steilhang — Montafon</figcaption>
  </figure>
</section>

<section class="band">
  <div class="wrap band__grid">
    <div class="band__item reveal"><b data-counter="${esc(s.stat_years)}">0</b><span>Jahre Erfahrung</span></div>
    <div class="band__item reveal" style="--d:70ms"><b data-counter="${esc(s.stat_projects)}" data-suffix="+">0</b><span>Projekte umgesetzt</span></div>
    <div class="band__item reveal" style="--d:140ms"><b data-counter="${esc(s.stat_machines)}">0</b><span>Maschinen im Fuhrpark</span></div>
    <div class="band__item reveal" style="--d:210ms"><b data-counter="${esc(s.stat_altitude)}" data-suffix="+">0</b><span>Höhenmeter Heimvorteil</span></div>
  </div>
</section>

<section class="sec">
  <div class="wrap split">
    <div>
      ${eyebrow('Über Waga Erdbau')}
      <h2 class="reveal">${esc(s.intro_title)}</h2>
      <p class="reveal lead">${nl2br(s.intro_text)}</p>
      <div class="reveal" style="--d:100ms">
        <a href="/leistungen" class="btn btn--outline">Meine Leistungen</a>
        <a href="/ueber-mich" class="link-arrow">Über mich</a>
      </div>
    </div>
    <figure class="split__media reveal" style="--d:140ms">
      <img src="/assets/img/projekt-aushub.jpg" alt="Aushubarbeiten" loading="lazy">
    </figure>
  </div>
</section>

<section class="sec sec--tinted">
  <div class="wrap">
    <div class="sec__head">
      ${eyebrow('Leistungen')}
      <h2 class="reveal">Vom Aushub bis zum steilsten Hang.</h2>
    </div>
    <div class="svc-grid">
      <a class="svc reveal" href="/leistungen">
        <figure><img src="/assets/img/projekt-aushub.jpg" alt="" loading="lazy"></figure>
        <h3>Erdbewegung</h3>
        <p>Aushub, Grabarbeiten und Geländemodellierung — vom Einfamilienhaus bis zum Großprojekt.</p>
        <span class="link-arrow">Mehr erfahren</span>
      </a>
      <a class="svc reveal" style="--d:90ms" href="/leistungen">
        <figure><img src="/assets/img/projekt-bohrung.jpg" alt="" loading="lazy"></figure>
        <h3>Spezialarbeiten</h3>
        <p>Bohrungen, Hangsicherung und Einsätze im steilsten Gelände — mit dem Menzi Muck.</p>
        <span class="link-arrow">Mehr erfahren</span>
      </a>
      <div class="svc svc--list reveal" style="--d:180ms">
        <h3>Der Fuhrpark</h3>
        <ul class="mach">
          <li><span>01</span>${esc(s.machine_1)}</li>
          <li><span>02</span>${esc(s.machine_2)}</li>
          <li><span>03</span>${esc(s.machine_3)}</li>
        </ul>
        <a class="link-arrow" href="/leistungen">Details ansehen</a>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec__head sec__head--row">
      <div>
        ${eyebrow('Portfolio')}
        <h2 class="reveal">Aktuelle Projekte</h2>
      </div>
      <a href="/projekte" class="link-arrow reveal">Alle Projekte</a>
    </div>
    <div class="proj-grid proj-grid--teaser">
      ${projects.slice(0, 3).map(projectFigure).join('')}
    </div>
  </div>
</section>

${posts.length ? `
<section class="sec sec--tinted">
  <div class="wrap">
    <div class="sec__head sec__head--row">
      <div>
        ${eyebrow('Neuigkeiten')}
        <h2 class="reveal">Berichte von der Baustelle</h2>
      </div>
      <a href="/berichte" class="link-arrow reveal">Alle Berichte</a>
    </div>
    <div class="post-grid">${posts.slice(0, 3).map(postCard).join('')}</div>
  </div>
</section>` : ''}

<section class="cta">
  <div class="wrap cta__in">
    <h2 class="reveal">Ihr Projekt beginnt mit einem <em>Gespräch.</em></h2>
    <p class="reveal" style="--d:80ms">Erzählen Sie mir von Ihrem Vorhaben — Sie erhalten rasch ein unverbindliches Angebot.</p>
    <div class="reveal" style="--d:160ms"><a href="/kontakt" class="btn btn--light btn--lg">Jetzt Kontakt aufnehmen</a></div>
  </div>
</section>`;
  return layout({ title: 'Start', active: '/', settings: s, content, bodyClass: 'page-home' });
}

// ---------- Leistungen ----------
function leistungenPage({ settings: s }) {
  const content = `
${pageHero('Waga Erdbau', 'Leistungen', s.services_intro)}

<section class="sec">
  <div class="wrap">
    <div class="feat reveal">
      <figure class="feat__media"><img src="/assets/img/projekt-aushub.jpg" alt="Erdbewegung" loading="lazy"></figure>
      <div class="feat__body">
        <span class="eyebrow">01 — Erdbewegung</span>
        <h2>Präzise Erdarbeiten, sauber ausgeführt.</h2>
        <p>Aushubarbeiten für Einfamilienhäuser, Fundamente, Leitungsgräben und Geländemodellierungen. Termingerecht, ordentlich und mit dem passenden Gerät für jede Baustellengröße.</p>
        <a href="/kontakt" class="btn btn--outline">Anfrage stellen</a>
      </div>
    </div>
    <div class="feat feat--flip reveal">
      <figure class="feat__media"><img src="/assets/img/projekt-bohrung.jpg" alt="Spezialarbeiten im Steilgelände" loading="lazy"></figure>
      <div class="feat__body">
        <span class="eyebrow">02 — Spezialarbeiten</span>
        <h2>Zuhause im steilsten Gelände.</h2>
        <p>Bohrungen, Hangsicherungen und Einsätze, bei denen konventionelle Bagger passen müssen. Mit dem Menzi Muck Schreitbagger arbeite ich dort, wo andere aufhören.</p>
        <a href="/kontakt" class="btn btn--outline">Anfrage stellen</a>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--tinted">
  <div class="wrap">
    <div class="sec__head">
      ${eyebrow('Bestens ausgerüstet')}
      <h2 class="reveal">Der Fuhrpark</h2>
    </div>
    <div class="fleet">
      <div class="fleet__item reveal"><span>01</span><h3>${esc(s.machine_1)}</h3><p>Kompakt, stark und präzise — ideal für Aushub und Grabarbeiten aller Art.</p></div>
      <div class="fleet__item reveal" style="--d:90ms"><span>02</span><h3>${esc(s.machine_2)}</h3><p>Der Spezialist fürs Extreme — arbeitet dort, wo kein anderer Bagger mehr steht.</p></div>
      <div class="fleet__item reveal" style="--d:180ms"><span>03</span><h3>${esc(s.machine_3)}</h3><p>Flexibler Transport von Material und Gerät, direkt auf Ihre Baustelle.</p></div>
    </div>
  </div>
</section>

<section class="cta">
  <div class="wrap cta__in">
    <h2 class="reveal">Ich freue mich auf <em>Ihre Anfrage.</em></h2>
    <div class="reveal" style="--d:100ms"><a href="/kontakt" class="btn btn--light btn--lg">Jetzt anfragen</a></div>
  </div>
</section>`;
  return layout({ title: 'Leistungen', active: '/leistungen', settings: s, content });
}

// ---------- Projekte ----------
function projektePage({ settings: s, projects, categories }) {
  const content = `
${pageHero('Portfolio', 'Projekte', 'Eine Auswahl aktueller Arbeiten — klicken Sie auf ein Bild für die Großansicht.')}

<section class="sec">
  <div class="wrap">
    <div class="pfilter reveal-now" data-filter-bar>
      <button class="pfilter__btn is-active" data-filter="*">Alle</button>
      ${categories.map((c) => `<button class="pfilter__btn" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div class="proj-grid" data-project-grid>
      ${projects.map(projectFigure).join('')}
    </div>
    ${projects.length === 0 ? '<p class="lead">Noch keine Projekte vorhanden.</p>' : ''}
  </div>
</section>

<section class="cta">
  <div class="wrap cta__in">
    <h2 class="reveal">Ihr Projekt fehlt hier <em>noch.</em></h2>
    <div class="reveal" style="--d:100ms"><a href="/kontakt" class="btn btn--light btn--lg">Angebot anfragen</a></div>
  </div>
</section>`;
  return layout({ title: 'Projekte', active: '/projekte', settings: s, content });
}

// ---------- Über mich ----------
function ueberMichPage({ settings: s }) {
  const content = `
${pageHero('Waga Erdbau', s.about_title, s.about_tagline)}

<section class="sec">
  <div class="wrap split">
    <figure class="split__media split__media--portrait reveal">
      <img src="/assets/img/portrait.jpg" alt="Joel Wachter — Waga Erdbau" loading="lazy">
      <figcaption>Joel Wachter, Inhaber</figcaption>
    </figure>
    <div>
      <p class="lead reveal">${nl2br(s.about_text)}</p>
      <ul class="values reveal" style="--d:120ms">
        <li><b>Präzision</b><span>Jeder Zentimeter zählt — auf ebener Fläche wie im Steilhang.</span></li>
        <li><b>Pünktlichkeit</b><span>Zugesagte Termine werden gehalten.</span></li>
        <li><b>Exzellenz</b><span>Saubere Arbeit, auf die Sie sich verlassen können.</span></li>
      </ul>
      <div class="reveal" style="--d:200ms"><a href="/kontakt" class="btn btn--ink">Kontakt aufnehmen</a></div>
    </div>
  </div>
</section>`;
  return layout({ title: 'Über mich', active: '', settings: s, content });
}

// ---------- Berichte ----------
function berichtePage({ settings: s, posts }) {
  const content = `
${pageHero('Blog', 'Berichte', 'Neuigkeiten und Einblicke — direkt von der Baustelle.')}
<section class="sec">
  <div class="wrap">
    ${posts.length ? `<div class="post-grid">${posts.map(postCard).join('')}</div>` : '<p class="lead">Noch keine Berichte vorhanden — schauen Sie bald wieder vorbei.</p>'}
  </div>
</section>`;
  return layout({ title: 'Berichte', active: '/berichte', settings: s, content });
}

function berichtPage({ settings: s, post }) {
  const content = `
<article class="sec sec--article">
  <div class="wrap wrap--narrow">
    <a href="/berichte" class="link-arrow link-arrow--back reveal-now">Alle Berichte</a>
    <time class="reveal-now" style="--d:60ms" datetime="${esc(post.created_at)}">${formatDate(post.created_at)}</time>
    <h1 class="reveal-now" style="--d:120ms">${esc(post.title)}</h1>
    ${post.image ? `<figure class="article__hero reveal-now" style="--d:180ms"><img src="${esc(post.image)}" alt=""></figure>` : ''}
    <div class="article__body reveal-now" style="--d:240ms">${markdown(post.body)}</div>
    <div class="article__cta reveal">
      <p>Projekt geplant? Ich freue mich auf Ihre Anfrage.</p>
      <a href="/kontakt" class="btn btn--ink">Kontakt aufnehmen</a>
    </div>
  </div>
</article>`;
  return layout({ title: post.title, description: post.excerpt, active: '/berichte', settings: s, content });
}

// ---------- Kontakt ----------
function kontaktPage({ settings: s }) {
  const content = `
${pageHero('Sprechen wir über Ihr Projekt', 'Kontakt', 'Rufen Sie an, schreiben Sie ein E-Mail — oder nutzen Sie das Formular.')}
<section class="sec">
  <div class="wrap contact">
    <div class="contact__info reveal-now">
      <dl class="contact__list">
        <div><dt>Adresse</dt><dd>${esc(s.contact_address)}</dd></div>
        <div><dt>E-Mail</dt><dd><a href="mailto:${esc(s.contact_email)}">${esc(s.contact_email)}</a></dd></div>
        <div><dt>Telefon</dt><dd><a href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">${esc(s.contact_phone)}</a></dd></div>
      </dl>
      <a class="btn btn--outline" href="tel:${esc(s.contact_phone).replaceAll(' ', '')}">Direkt anrufen</a>
    </div>
    <div class="reveal-now" style="--d:120ms">${contactForm()}</div>
  </div>
</section>`;
  return layout({ title: 'Kontakt', active: '/kontakt', settings: s, content });
}

function notFoundPage({ settings: s }) {
  const content = `
${pageHero('Fehler 404', 'Seite nicht gefunden', 'Diese Seite existiert nicht (mehr).')}
<section class="sec"><div class="wrap"><a href="/" class="btn btn--ink">Zur Startseite</a></div></section>`;
  return layout({ title: 'Seite nicht gefunden', settings: s, content });
}

module.exports = { indexPage, leistungenPage, projektePage, ueberMichPage, berichtePage, berichtPage, kontaktPage, notFoundPage };

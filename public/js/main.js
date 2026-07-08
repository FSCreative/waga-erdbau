/* WAGA ERDBAU — Brutalist interactions */
(function () {
  'use strict';

  // Scroll progress
  var bar = document.querySelector('.progress');
  var onScroll = function () {
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Smooth anchor scrolling with header offset (also from other pages)
  document.querySelectorAll('a[data-anchor]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var href = a.getAttribute('href');
      var hashIdx = href.indexOf('#');
      if (hashIdx === -1) return;
      var id = href.slice(hashIdx + 1);
      var el = document.getElementById(id);
      if (!el) return; // andere Seite → normale Navigation
      ev.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: id === 'top' ? 0 : y, behavior: 'smooth' });
      history.replaceState(null, '', '/#' + id);
    });
  });

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Counters
  var counters = document.querySelectorAll('[data-counter]');
  var animate = function (el) {
    var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1500, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('de-AT') + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // Active section → tabbar + header nav
  var sections = ['top', 'leistungen', 'projekte', 'berichte', 'kontakt'];
  var links = document.querySelectorAll('.tabs__item, .hd__link');
  if ('IntersectionObserver' in window && document.body.classList.contains('page-home')) {
    var current = 'top';
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) current = e.target.id || 'top';
      });
      links.forEach(function (l) {
        var href = l.getAttribute('href') || '';
        l.classList.toggle('is-active', href.indexOf('#' + current) !== -1);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sio.observe(el);
    });
  }

  // Project filter
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var grid = document.querySelector('[data-project-grid]');
    filterBar.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.pfilter__btn');
      if (!btn) return;
      filterBar.querySelectorAll('.pfilter__btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var f = btn.getAttribute('data-filter');
      grid.querySelectorAll('.proj').forEach(function (card) {
        card.classList.toggle('is-hidden', !(f === '*' || card.getAttribute('data-category') === f));
      });
    });
  }

  // Lightbox
  var lb = document.querySelector('[data-lightbox]');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var items = [];
    var idx = 0;
    var collect = function () {
      items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-item]'))
        .filter(function (el) { return !el.classList.contains('is-hidden'); });
    };
    var show = function () {
      var el = items[idx];
      if (!el) return;
      lbImg.src = el.getAttribute('data-full');
      lbCap.textContent = el.getAttribute('data-caption') || '';
    };
    var open = function (el) {
      collect();
      idx = Math.max(0, items.indexOf(el));
      show();
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    var close = function () { lb.hidden = true; document.body.style.overflow = ''; };
    document.addEventListener('click', function (ev) {
      var item = ev.target.closest('[data-lightbox-item]');
      if (item) { ev.preventDefault(); open(item); }
    });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', function () { idx = (idx - 1 + items.length) % items.length; show(); });
    lb.querySelector('.lightbox__nav--next').addEventListener('click', function () { idx = (idx + 1) % items.length; show(); });
    lb.addEventListener('click', function (ev) { if (ev.target === lb) close(); });
    document.addEventListener('keydown', function (ev) {
      if (lb.hidden) return;
      if (ev.key === 'Escape') close();
      if (ev.key === 'ArrowLeft') { idx = (idx - 1 + items.length) % items.length; show(); }
      if (ev.key === 'ArrowRight') { idx = (idx + 1) % items.length; show(); }
    });
    var touchX = null;
    lb.addEventListener('touchstart', function (ev) { touchX = ev.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (ev) {
      if (touchX === null) return;
      var dx = ev.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) { idx = (idx + (dx < 0 ? 1 : -1) + items.length) % items.length; show(); }
      touchX = null;
    }, { passive: true });
  }

  // Contact form async submit
  document.querySelectorAll('[data-contact-form]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Wird gesendet …';
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: new URLSearchParams(new FormData(form)).toString(),
      }).then(function (r) { return r.json(); }).then(function () {
        form.querySelector('.cform__success').hidden = false;
        form.querySelectorAll('input, textarea').forEach(function (i) { i.value = ''; });
        btn.querySelector('span').textContent = '✓ Gesendet';
      }).catch(function () {
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Anfrage absenden';
        alert('Senden fehlgeschlagen — bitte rufen Sie direkt an.');
      });
    });
  });
})();

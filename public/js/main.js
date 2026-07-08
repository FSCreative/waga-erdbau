/* WAGA Erdbau – interactions */
(function () {
  'use strict';

  // Sticky header
  var header = document.querySelector('[data-header]');
  var onScrollHeader = function () {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  // Scroll progress bar
  var bar = document.querySelector('.scroll-progress__bar');
  var onScrollBar = function () {
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScrollBar, { passive: true });
  onScrollBar();

  // Hero parallax
  var heroBg = document.querySelector('.hero__bg');
  if (heroBg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) heroBg.style.transform = 'translateY(' + y * 0.35 + 'px)';
    }, { passive: true });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Animated counters
  var counters = document.querySelectorAll('[data-counter]');
  var animateCounter = function (el) {
    var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null;
    var dur = 1600;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('de-AT') + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // 3D tilt cards (pointer devices only)
  if (window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + x * 7 + 'deg) rotateX(' + -y * 7 + 'deg) translateY(-3px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  // Project filter
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var grid = document.querySelector('[data-project-grid]');
    filterBar.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var f = btn.getAttribute('data-filter');
      grid.querySelectorAll('.project-card').forEach(function (card) {
        var show = f === '*' || card.getAttribute('data-category') === f;
        card.classList.toggle('is-hidden', !show);
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
    var open = function (el) {
      collect();
      idx = items.indexOf(el);
      show();
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    var show = function () {
      var el = items[idx];
      if (!el) return;
      lbImg.src = el.getAttribute('data-full');
      lbCap.textContent = el.getAttribute('data-caption') || '';
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
    // swipe
    var touchX = null;
    lb.addEventListener('touchstart', function (ev) { touchX = ev.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (ev) {
      if (touchX === null) return;
      var dx = ev.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) { idx = (idx + (dx < 0 ? 1 : -1) + items.length) % items.length; show(); }
      touchX = null;
    }, { passive: true });
  }

  // Contact form (async submit)
  document.querySelectorAll('[data-contact-form]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Wird gesendet …';
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: new URLSearchParams(new FormData(form)).toString(),
      }).then(function (r) { return r.json(); }).then(function () {
        form.querySelector('.contact-form__success').hidden = false;
        form.querySelectorAll('input, textarea').forEach(function (i) { i.value = ''; });
        btn.textContent = '✓ Gesendet';
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = 'Anfrage absenden';
        alert('Senden fehlgeschlagen – bitte rufen Sie mich direkt an.');
      });
    });
  });
})();

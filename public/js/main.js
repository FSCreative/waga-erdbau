/* WAGA ERDBAU — Apple-like interactions v2 */
(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  // ---------- Nav: hide on scroll down, show on scroll up ----------
  var nav = document.querySelector('.gnav');
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    if (!nav) return;
    var y = window.scrollY;
    if (y > lastY && y > 140) nav.classList.add('is-hidden');
    else nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  // ---------- Scroll-linked parallax (hero + dark feature) ----------
  if (motionOK) {
    var pxTargets = [];
    document.querySelectorAll('.hero__media img, .feature-dark__media img').forEach(function (img) {
      img.style.willChange = 'transform';
      pxTargets.push(img);
    });
    var ticking = false;
    var parallax = function () {
      ticking = false;
      var vh = window.innerHeight;
      pxTargets.forEach(function (img) {
        var r = img.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        var progress = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 .. 0.5
        var scale = 1.06 - Math.min(Math.abs(progress), 0.5) * 0.12;
        img.style.transform = 'translateY(' + (progress * -26).toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
    window.addEventListener('resize', parallax);
    parallax();
  }

  // ---------- Reveal on scroll ----------
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---------- Counters ----------
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

  // ---------- Tile spotlight (cursor-tracking glow) ----------
  if (finePointer) {
    document.querySelectorAll('.tile').forEach(function (tile) {
      tile.classList.add('tile--spot');
      tile.addEventListener('pointermove', function (ev) {
        var r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        tile.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  // ---------- Magnetic buttons ----------
  if (finePointer && motionOK) {
    document.querySelectorAll('.btn--fill').forEach(function (btn) {
      btn.addEventListener('pointermove', function (ev) {
        var r = btn.getBoundingClientRect();
        var x = (ev.clientX - r.left - r.width / 2) / (r.width / 2);
        var y = (ev.clientY - r.top - r.height / 2) / (r.height / 2);
        btn.style.transform = 'translate(' + (x * 3).toFixed(1) + 'px,' + (y * 3).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  // ---------- Carousel: arrows + drag + dots ----------
  document.querySelectorAll('[data-carousel]').forEach(function (c) {
    var track = c.querySelector('[data-carousel-track]');
    var cards = track.querySelectorAll('.pcard');
    if (!cards.length) return;

    var step = function () {
      return cards[0].getBoundingClientRect().width + 20;
    };
    var prev = c.querySelector('[data-carousel-prev]');
    var next = c.querySelector('[data-carousel-next]');
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });

    // Dots
    var dots = document.createElement('div');
    dots.className = 'carousel__dots';
    cards.forEach(function (_, i) {
      var d = document.createElement('button');
      d.setAttribute('aria-label', 'Zu Projekt ' + (i + 1));
      d.addEventListener('click', function () {
        track.scrollTo({ left: i * step(), behavior: 'smooth' });
      });
      dots.appendChild(d);
    });
    c.appendChild(dots);
    var setDot = function () {
      var i = Math.min(cards.length - 1, Math.round(track.scrollLeft / step()));
      dots.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('is-active', j === i); });
    };
    track.addEventListener('scroll', function () { requestAnimationFrame(setDot); }, { passive: true });
    setDot();

    // Drag to scroll (desktop)
    if (finePointer) {
      var down = false, startX = 0, startScroll = 0, moved = false;
      track.addEventListener('pointerdown', function (ev) {
        down = true; moved = false; startX = ev.clientX; startScroll = track.scrollLeft;
        track.classList.add('is-grabbing');
      });
      window.addEventListener('pointermove', function (ev) {
        if (!down) return;
        var dx = ev.clientX - startX;
        if (Math.abs(dx) > 6) moved = true;
        track.scrollLeft = startScroll - dx;
      });
      window.addEventListener('pointerup', function () {
        down = false;
        track.classList.remove('is-grabbing');
      });
      // Verhindert Lightbox-Öffnen nach Drag
      track.addEventListener('click', function (ev) {
        if (moved) { ev.stopPropagation(); ev.preventDefault(); moved = false; }
      }, true);
    }
  });

  // ---------- Project filter (segmented control) ----------
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var grid = document.querySelector('[data-project-grid]');
    filterBar.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.seg__btn');
      if (!btn) return;
      filterBar.querySelectorAll('.seg__btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var f = btn.getAttribute('data-filter');
      grid.querySelectorAll('.pcard').forEach(function (card) {
        var show = f === '*' || card.getAttribute('data-category') === f;
        if (show && card.classList.contains('is-hidden')) {
          card.classList.remove('is-hidden');
          card.classList.add('is-entering');
          setTimeout(function () { card.classList.remove('is-entering'); }, 450);
        } else if (!show) {
          card.classList.add('is-hidden');
        }
      });
    });
  }

  // ---------- Lightbox ----------
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

  // ---------- Contact form async submit ----------
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
        form.querySelector('.cform__success').hidden = false;
        form.querySelectorAll('input, textarea').forEach(function (i) { i.value = ''; });
        btn.textContent = 'Gesendet ✓';
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = 'Anfrage senden';
        alert('Senden fehlgeschlagen — bitte rufen Sie direkt an.');
      });
    });
  });
})();

/*!
 * cie-ds scroll-pro.js — opt-in "Pro" scroll scenes on GSAP + ScrollTrigger (vanilla)
 * Pin + scrub · horizontal scroll. Everything else stays in interaction.js / scroll.css.
 *
 * Include GSAP first, then this file (all `defer`, in this order):
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js" defer></script>
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js" defer></script>
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/CustomEase.min.js" defer></script>  (optional)
 *   <script src="scroll-pro.js" defer></script>
 *
 * Hooks
 *   data-cie-pin                     pin this element while scrolling past it
 *   data-cie-pin-distance="150%"     pinned scroll length (viewport-relative %, or px). Default 100%.
 *   data-cie-scrub                   (child of a pinned stage) scrubs from data-cie-from to its natural state
 *                                    across the pin. Optional window: data-cie-scrub="0.2 0.6" (fractions of the pin).
 *   data-cie-from='{"y":40,"opacity":0}'   GSAP "from" vars, JSON. Default {"y":40,"opacity":0}.
 *   data-cie-hscroll                 horizontal track: pins, vertical scroll moves the track sideways
 *   data-cie-hscroll-track           (optional) the track inside; defaults to the first child
 *   data-cie-hscroll-snap            settle on the nearest panel (cie expo, --cie-t-move)
 *
 * Silent no-op without window.gsap + window.ScrollTrigger. Honours prefers-reduced-motion (and the
 * `html.is-still` switch): nothing is pinned or scrubbed, content stays in its natural, static state.
 * API: window.CieScrollPro = { init(root?), refresh() }
 */
(function (global) {
  'use strict';

  var gsap = global.gsap;
  var ST = global.ScrollTrigger;
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);

  var doc = document;
  var html = doc.documentElement;
  var reduceMq = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;

  /* ── cie eases from tokens.css (--cie-ease-*: cubic-bezier(...)) ───────── */
  var FALLBACK = 'power3.out';
  var EASE = { expo: FALLBACK, out: FALLBACK, snap: FALLBACK, scrub: 'none' };

  function readBezier(name) {
    var v = getComputedStyle(html).getPropertyValue(name);
    var m = /cubic-bezier\(([^)]+)\)/.exec(v || '');
    if (!m) return null;
    var n = m[1].split(',').map(parseFloat);
    if (n.length !== 4 || n.some(isNaN)) return null;
    return n;
  }

  if (global.CustomEase) {
    gsap.registerPlugin(global.CustomEase);
    ['expo', 'out', 'snap'].forEach(function (k) {
      var b = readBezier('--cie-ease-' + k);
      if (!b) return;
      try {
        global.CustomEase.create('cie-' + k, 'M0,0 C' + b[0] + ',' + b[1] + ' ' + b[2] + ',' + b[3] + ' 1,1');
        EASE[k] = 'cie-' + k;
      } catch (e) { /* keep fallback */ }
    });
  }

  function readSeconds(name, fallback) {
    var v = (getComputedStyle(html).getPropertyValue(name) || '').trim();
    var n = parseFloat(v);
    if (isNaN(n)) return fallback;
    return /ms$/.test(v) ? n / 1000 : n;
  }

  function isStill() {
    return Boolean(reduceMq && reduceMq.matches) || html.classList.contains('is-still');
  }

  function parseFrom(el) {
    var raw = el.getAttribute('data-cie-from');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fall through to default */ }
    }
    return { y: 40, opacity: 0 };
  }

  function scrubWindow(el) {
    var raw = (el.getAttribute('data-cie-scrub') || '').trim();
    var n = raw ? raw.split(/[\s,]+/).map(parseFloat) : [];
    var a = isNaN(n[0]) ? 0 : Math.min(1, Math.max(0, n[0]));
    var b = isNaN(n[1]) ? 1 : Math.min(1, Math.max(a, n[1]));
    return [a, Math.max(0.001, b - a)];
  }

  /* ── pin + scrub ─────────────────────────────────────────── */
  function pin(el) {
    var distance = el.getAttribute('data-cie-pin-distance') || '100%';
    var tl = gsap.timeline({
      defaults: { ease: EASE.scrub },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=' + distance,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });
    tl.set({}, {}, 1); // timeline length = 1 → windows are fractions of the pin
    [].forEach.call(el.querySelectorAll('[data-cie-scrub]'), function (child) {
      var w = scrubWindow(child);
      var vars = parseFrom(child);
      vars.duration = w[1];
      tl.from(child, vars, w[0]);
    });
  }

  /* ── horizontal track ────────────────────────────────────── */
  function hscroll(el) {
    var track = el.querySelector('[data-cie-hscroll-track]') || el.firstElementChild;
    if (!track) return;
    var count = track.children.length;
    var dist = function () { return Math.max(0, track.scrollWidth - el.clientWidth); };
    gsap.set(el, { overflow: 'hidden' }); // static fallback may be a native scroller; GSAP owns it now
    gsap.to(track, {
      x: function () { return -dist(); },
      ease: EASE.scrub,
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: function () { return '+=' + dist(); },
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        snap: el.hasAttribute('data-cie-hscroll-snap') && count > 1
          ? { snapTo: 1 / (count - 1), duration: readSeconds('--cie-t-move', 0.36), ease: EASE.expo }
          : false
      }
    });
  }

  /* ── lifecycle ───────────────────────────────────────────── */
  var ctx = null;
  var lastRoot = doc;

  function init(root) {
    lastRoot = root || lastRoot || doc;
    if (ctx) { ctx.revert(); ctx = null; }
    if (isStill()) { ST.refresh(); return; }
    ctx = gsap.context(function () {
      // One query, document order: pins must be created top → bottom so their spacing stacks correctly.
      [].forEach.call(lastRoot.querySelectorAll('[data-cie-pin], [data-cie-hscroll]'), function (el) {
        if (el.hasAttribute('data-cie-hscroll')) hscroll(el); else pin(el);
      });
    });
    ST.refresh();
  }

  function refresh() { ST.refresh(); }

  // Re-run when the motion preference flips (OS setting or the html.is-still switch).
  var still = isStill();
  function onPref() {
    var now = isStill();
    if (now !== still) { still = now; init(); }
  }
  if (reduceMq) {
    if (reduceMq.addEventListener) reduceMq.addEventListener('change', onPref);
    else if (reduceMq.addListener) reduceMq.addListener(onPref);
  }
  if (global.MutationObserver) {
    new MutationObserver(onPref).observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  global.CieScrollPro = { init: init, refresh: refresh };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})(typeof window !== 'undefined' ? window : this);

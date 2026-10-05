/*!
 * cie-ds interaction.js — vanilla, dependency-free
 * Scroll reveal · parallax · click-cycle · per-section audio
 *
 * Include after CSS:
 *   <script src="interaction.js" defer></script>
 * Or:
 *   import { Cie } from './interaction.js'; Cie.init();
 *
 * Honour prefers-reduced-motion. Audio unlocks only after a user gesture,
 * and only inside [data-cie-sound] sections whose toggle is ON.
 */
(function (global) {
  'use strict';

  const REDUCE = global.matchMedia &&
    global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Web Audio (synthesized, no files) ───────────────────── */
  let sharedCtx = null;

  function getCtx() {
    if (sharedCtx) return sharedCtx;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    sharedCtx = new AC();
    return sharedCtx;
  }

  async function unlockAudio() {
    const ctx = getCtx();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (_) { /* ignore */ }
    }
    return ctx;
  }

  /** Tiny tasteful one-shots. Keep gain low. */
  function playTone(kind) {
    const ctx = getCtx();
    if (!ctx || ctx.state !== 'running') return;
    if (REDUCE) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const shapes = {
      hover:  { freq: 880,  dur: 0.045, type: 'sine',     peak: 0.028, slide: 1.04 },
      click:  { freq: 420,  dur: 0.07,  type: 'triangle', peak: 0.045, slide: 0.72 },
      confirm:{ freq: 560,  dur: 0.11,  type: 'sine',     peak: 0.05,  slide: 1.35 },
      cycle:  { freq: 360,  dur: 0.08,  type: 'square',   peak: 0.028, slide: 1.2  },
      toggle: { freq: 240,  dur: 0.09,  type: 'triangle', peak: 0.04,  slide: 1.6  },
    };
    const s = shapes[kind] || shapes.click;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = s.type;
    osc.frequency.setValueAtTime(s.freq, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, s.freq * s.slide),
      now + s.dur
    );

    // Soft filter so square/triangle stay polite
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = kind === 'hover' ? 2400 : 1800;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(s.peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + s.dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + s.dur + 0.02);

    // Optional whisper of noise on confirm (paper tick)
    if (kind === 'confirm' || kind === 'click') {
      const frames = Math.floor(ctx.sampleRate * 0.03);
      const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < frames; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const ng = ctx.createGain();
      ng.gain.value = kind === 'confirm' ? 0.012 : 0.008;
      const nf = ctx.createBiquadFilter();
      nf.type = 'highpass';
      nf.frequency.value = 1200;
      noise.connect(nf);
      nf.connect(ng);
      ng.connect(master);
      noise.start(now);
      noise.stop(now + 0.03);
    }
  }

  function sectionSoundEnabled(el) {
    const root = el.closest('[data-cie-sound]');
    return !!(root && root.classList.contains('is-sound-on'));
  }

  function sfxFrom(el, kind) {
    if (!sectionSoundEnabled(el)) return;
    playTone(kind);
  }

  /* ── Scroll reveal ───────────────────────────────────────── */
  function initReveal(root) {
    const nodes = root.querySelectorAll('[data-cie-reveal]');
    if (!nodes.length) return;

    if (REDUCE) {
      nodes.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    nodes.forEach((el, i) => {
      const parent = el.parentElement;
      const staggered = parent && parent.classList.contains('cie-reveal-stagger');
      const hasInlineI = (el.getAttribute('style') || '').includes('--i');
      if (!staggered && !hasInlineI) {
        el.style.setProperty('--i', String(i % 10));
      }
      io.observe(el);
    });
  }

  /* ── Parallax ────────────────────────────────────────────── */
  function initParallax(root) {
    const layers = Array.from(root.querySelectorAll('[data-cie-parallax]'));
    if (!layers.length || REDUCE) return;

    let ticking = false;

    function update() {
      ticking = false;
      const vh = global.innerHeight || 1;
      layers.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-cie-parallax') || '0.2');
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const progress = (mid - vh / 2) / vh; // -0.5..0.5-ish centred
        const max = parseFloat(
          getComputedStyle(el).getPropertyValue('--cie-parallax-max')
        ) || 48;
        const y = Math.max(-max, Math.min(max, -progress * speed * max * 2));
        el.style.setProperty('--cie-py', y.toFixed(2) + 'px');
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    global.addEventListener('scroll', onScroll, { passive: true });
    global.addEventListener('resize', onScroll, { passive: true });
  }

  /* ── Click-to-cycle ──────────────────────────────────────── */
  function initCycle(root) {
    root.querySelectorAll('[data-cie-cycle]').forEach((el) => {
      const raw = el.getAttribute('data-cie-cycle') || '';
      const states = raw.split('|').map((s) => s.trim()).filter(Boolean);
      if (states.length < 2) return;

      let index = Math.max(
        0,
        states.findIndex(
          (s) => s.toLowerCase() === (el.textContent || '').trim().toLowerCase()
        )
      );
      if (index < 0) index = 0;

      const label = el.querySelector('.cie-cycle-label') || el;

      function render() {
        el.setAttribute('data-cie-cycle-i', String(index));
        el.setAttribute('aria-label', states[index]);
        if (label === el) {
          // Preserve non-text children if any — prefer dedicated label node
          const hasOnlyText = el.childElementCount === 0;
          if (hasOnlyText) el.textContent = states[index];
          else {
            // update first text node
            for (const node of el.childNodes) {
              if (node.nodeType === 3 && node.textContent.trim()) {
                node.textContent = states[index];
                break;
              }
            }
          }
        } else {
          label.textContent = states[index];
        }
      }

      render();

      el.addEventListener('click', async () => {
        index = (index + 1) % states.length;
        render();
        el.classList.add('is-flash');
        setTimeout(() => el.classList.remove('is-flash'), 120);
        if (sectionSoundEnabled(el)) {
          await unlockAudio();
          playTone(index === 0 ? 'confirm' : 'cycle');
        }
      });
    });
  }

  /* ── Per-section audio ───────────────────────────────────── */
  function initSound(root) {
    root.querySelectorAll('[data-cie-sound]').forEach((section) => {
      const toggle =
        section.querySelector('[data-cie-sound-toggle]') ||
        section.querySelector('.cie-sound-toggle');
      if (!toggle) return;

      if (!toggle.hasAttribute('aria-pressed')) {
        toggle.setAttribute('aria-pressed', 'false');
      }
      toggle.setAttribute('type', toggle.getAttribute('type') || 'button');

      toggle.addEventListener('click', async (e) => {
        e.preventDefault();
        const on = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
        section.classList.toggle('is-sound-on', on);
        section.setAttribute('data-sound', on ? 'on' : 'off');
        if (on) {
          await unlockAudio();
          playTone('toggle');
        }
      });

      // Delegate interactions inside the section
      section.addEventListener('click', (e) => {
        if (!section.classList.contains('is-sound-on')) return;
        const t = e.target.closest('[data-cie-sfx], button, a.cie-tap, a.cie-press, [data-cie-cycle]');
        if (!t || !section.contains(t)) return;
        if (t === toggle || toggle.contains(t)) return;
        const kind =
          (t.getAttribute('data-cie-sfx') ||
            (t.hasAttribute('data-cie-cycle') ? 'cycle' : 'click'));
        unlockAudio().then(() => playTone(kind === 'hover' ? 'click' : kind));
      });

      // Optional hover sfx — only when data-cie-sfx-hover on section or element
      section.addEventListener('pointerenter', (e) => {
        if (!section.classList.contains('is-sound-on')) return;
        if (REDUCE) return;
        const t = e.target;
        if (!(t instanceof Element)) return;
        const hit = t.closest('[data-cie-sfx-hover], [data-cie-sfx="hover"]');
        if (!hit || !section.contains(hit)) return;
        // section-level opt-in: data-cie-sfx-hover on section enables hover for [data-cie-sfx]
        playTone('hover');
      }, true);

      // If section has data-cie-hover-sfx, play hover on any [data-cie-sfx]
      if (section.hasAttribute('data-cie-hover-sfx')) {
        let lastHover = 0;
        section.addEventListener('pointerover', (e) => {
          if (!section.classList.contains('is-sound-on') || REDUCE) return;
          const t = e.target.closest('[data-cie-sfx], .cie-tap, .cie-press, .cie-chip, .cie-pbtn, [data-cie-cycle]');
          if (!t || t === toggle || toggle.contains(t)) return;
          const now = performance.now();
          if (now - lastHover < 80) return; // debounce
          lastHover = now;
          playTone('hover');
        });
      }
    });
  }

  /* ── Flash helper for .cie-flash clicks ──────────────────── */
  function initFlash(root) {
    root.addEventListener('click', (e) => {
      const el = e.target.closest('.cie-flash');
      if (!el) return;
      el.classList.add('is-flash');
      setTimeout(() => el.classList.remove('is-flash'), 140);
    });
  }

  /* ── Public API ──────────────────────────────────────────── */
  const Cie = {
    version: '0.2.0',
    reducedMotion: REDUCE,
    play: playTone,
    unlock: unlockAudio,
    init(scope) {
      const root = scope || document;
      initReveal(root);
      initParallax(root);
      initCycle(root);
      initSound(root);
      initFlash(root);
      return Cie;
    },
  };

  global.Cie = Cie;

  if (global.document) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => Cie.init());
    } else {
      Cie.init();
    }
  }

  // ESM interop when bundled / type=module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cie;
  }
})(typeof window !== 'undefined' ? window : globalThis);

/*!
 * cie-ds interaction.js — vanilla, dependency-free
 * Scroll reveal · parallax · click-cycle · expand/morph · sheet · per-section audio
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
      try { 
        await ctx.resume();
        // Double-check and retry if needed
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
      } catch (_) { /* ignore */ }
    }
    return ctx;
  }

  /** Tiny tasteful one-shots. Audible but polite. */
  async function playTone(kind, preset) {
    const ctx = getCtx();
    if (!ctx) return;
    
    // DO NOT gate main interactions on REDUCE (only hover)
    // Main clicks/confirms/cycles should always play when armed
    const isHover = kind === 'hover';
    if (isHover && REDUCE) return;
    
    // Ensure context is running (with retry)
    if (ctx.state !== 'running') {
      try {
        await ctx.resume();
        // Retry once more if still suspended
        if (ctx.state !== 'running') {
          await ctx.resume();
        }
      } catch (_) { /* ignore */ }
    }
    
    // Last check: if still not running, give up silently
    if (ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.4; // Clearly audible on laptop speakers
    master.connect(ctx.destination);

    // Preset shapes library
    const presets = {
      'soft-tick': {
        hover:  { freq: 1200, dur: 0.04,  type: 'sine',     peak: 0.038, slide: 1.1 },
        click:  { freq: 660,  dur: 0.065, type: 'triangle', peak: 0.052, slide: 0.75 },
        confirm:{ freq: 880,  dur: 0.10,  type: 'sine',     peak: 0.058, slide: 1.4 },
        cycle:  { freq: 540,  dur: 0.075, type: 'square',   peak: 0.038, slide: 1.25 },
        toggle: { freq: 380,  dur: 0.085, type: 'triangle', peak: 0.048, slide: 1.7 },
      },
      'paper-snap': {
        hover:  { freq: 880,  dur: 0.045, type: 'sine',     peak: 0.035, slide: 1.04 },
        click:  { freq: 420,  dur: 0.07,  type: 'triangle', peak: 0.055, slide: 0.72 },
        confirm:{ freq: 560,  dur: 0.11,  type: 'sine',     peak: 0.062, slide: 1.35 },
        cycle:  { freq: 360,  dur: 0.08,  type: 'square',   peak: 0.038, slide: 1.2  },
        toggle: { freq: 240,  dur: 0.09,  type: 'triangle', peak: 0.048, slide: 1.6  },
      },
      'glass-pip': {
        hover:  { freq: 2400, dur: 0.035, type: 'sine',     peak: 0.032, slide: 1.15 },
        click:  { freq: 1760, dur: 0.055, type: 'sine',     peak: 0.048, slide: 0.68 },
        confirm:{ freq: 2200, dur: 0.08,  type: 'sine',     peak: 0.055, slide: 1.5 },
        cycle:  { freq: 1480, dur: 0.065, type: 'sine',     peak: 0.035, slide: 1.3 },
        toggle: { freq: 1100, dur: 0.075, type: 'sine',     peak: 0.045, slide: 1.8 },
      },
      'low-thud': {
        hover:  { freq: 220,  dur: 0.05,  type: 'triangle', peak: 0.045, slide: 0.85 },
        click:  { freq: 140,  dur: 0.09,  type: 'square',   peak: 0.065, slide: 0.65 },
        confirm:{ freq: 180,  dur: 0.13,  type: 'triangle', peak: 0.072, slide: 0.95 },
        cycle:  { freq: 120,  dur: 0.10,  type: 'square',   peak: 0.048, slide: 0.9  },
        toggle: { freq: 90,   dur: 0.11,  type: 'square',   peak: 0.058, slide: 1.1  },
      },
      'bright-confirm': {
        hover:  { freq: 1540, dur: 0.04,  type: 'sine',     peak: 0.038, slide: 1.08 },
        click:  { freq: 1100, dur: 0.06,  type: 'sine',     peak: 0.052, slide: 0.78 },
        confirm:{ freq: 1320, dur: 0.095, type: 'sine',     peak: 0.060, slide: 1.45 },
        cycle:  { freq: 880,  dur: 0.07,  type: 'sine',     peak: 0.040, slide: 1.28 },
        toggle: { freq: 660,  dur: 0.08,  type: 'sine',     peak: 0.050, slide: 1.65 },
      },
    };

    // Get active preset from localStorage or default (with error handling)
    let activePreset = preset;
    if (!activePreset) {
      try {
        activePreset = localStorage.getItem('cie-sfx-preset') || 'paper-snap';
      } catch (_) {
        activePreset = 'paper-snap';
      }
    }
    const shapes = presets[activePreset] || presets['paper-snap'];
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
    filter.frequency.value = s.freq > 1000 ? 3200 : (kind === 'hover' ? 2400 : 1800);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(s.peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + s.dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + s.dur + 0.02);

    // Optional whisper of noise on confirm/click (paper tick)
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
      ng.gain.value = kind === 'confirm' ? 0.015 : 0.010;
      const nf = ctx.createBiquadFilter();
      nf.type = 'highpass';
      nf.frequency.value = activePreset === 'glass-pip' ? 2000 : (activePreset === 'low-thud' ? 800 : 1200);
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
    const root = el.closest('[data-cie-sound]');
    const preset = root ? root.getAttribute('data-cie-sfx-preset') : null;
    playTone(kind, preset);
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
          const root = el.closest('[data-cie-sound]');
          const preset = root ? root.getAttribute('data-cie-sfx-preset') : null;
          playTone(index === 0 ? 'confirm' : 'cycle', preset);
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
          const root = section.closest('[data-cie-sound]');
          const preset = root ? root.getAttribute('data-cie-sfx-preset') : null;
          // Unlock audio and play immediate test beep
          await unlockAudio();
          // Give a moment for context to be ready, then play test tone
          setTimeout(() => {
            playTone('toggle', preset);
          }, 50);
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
        const preset = section.getAttribute('data-cie-sfx-preset');
        unlockAudio().then(() => playTone(kind === 'hover' ? 'click' : kind, preset));
      });

      // Optional hover sfx — only when data-cie-sfx-hover on section or element
      section.addEventListener('pointerenter', (e) => {
        if (!section.classList.contains('is-sound-on')) return;
        if (REDUCE) return;
        const t = e.target;
        if (!(t instanceof Element)) return;
        const hit = t.closest('[data-cie-sfx-hover], [data-cie-sfx="hover"]');
        if (!hit || !section.contains(hit)) return;
        const preset = section.getAttribute('data-cie-sfx-preset');
        playTone('hover', preset);
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
          const preset = section.getAttribute('data-cie-sfx-preset');
          playTone('hover', preset);
        });
      }

      // Preset picker support
      const picker = section.querySelector('[data-cie-sfx-picker]');
      if (picker) {
        const presetOptions = ['soft-tick', 'paper-snap', 'glass-pip', 'low-thud', 'bright-confirm'];
        const currentPreset = section.getAttribute('data-cie-sfx-preset') || 
                            localStorage.getItem('cie-sfx-preset') || 
                            'paper-snap';
        
        // If picker is a select element
        if (picker.tagName === 'SELECT') {
          picker.value = currentPreset;
          picker.addEventListener('change', () => {
            const newPreset = picker.value;
            section.setAttribute('data-cie-sfx-preset', newPreset);
            localStorage.setItem('cie-sfx-preset', newPreset);
            if (section.classList.contains('is-sound-on')) {
              unlockAudio().then(() => playTone('confirm', newPreset));
            }
          });
        } 
        // If picker contains cycle buttons
        else {
          const cycleBtn = picker.querySelector('[data-cie-cycle]');
          if (cycleBtn) {
            const label = cycleBtn.querySelector('.cie-cycle-label') || cycleBtn;
            label.textContent = currentPreset;
            section.setAttribute('data-cie-sfx-preset', currentPreset);
            
            cycleBtn.addEventListener('click', () => {
              const current = section.getAttribute('data-cie-sfx-preset') || 'paper-snap';
              const idx = presetOptions.indexOf(current);
              const next = presetOptions[(idx + 1) % presetOptions.length];
              section.setAttribute('data-cie-sfx-preset', next);
              localStorage.setItem('cie-sfx-preset', next);
              if (section.classList.contains('is-sound-on')) {
                unlockAudio().then(() => playTone('confirm', next));
              }
            });
          }
        }
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


  /* ── Click-to-expand / morph (cell → panel) ─────────────── */
  function msToken(name, fallback) {
    if (REDUCE) return 0;
    try {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const n = parseFloat(raw);
      if (!raw) return fallback;
      if (raw.endsWith('s') && !raw.endsWith('ms')) return Math.round(n * 1000);
      return Math.round(n) || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function onTransitionEnd(el, prop, fn) {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', h);
      fn();
    };
    const h = (e) => {
      if (e.target === el && e.propertyName === prop) finish();
    };
    el.addEventListener('transitionend', h);
    const budget = msToken('--cie-t-move', 360) + 120;
    setTimeout(finish, REDUCE ? 20 : budget);
  }

  function ensureExpandBackdrop() {
    let bd = document.querySelector('.cie-expand-backdrop');
    if (!bd) {
      bd = document.createElement('div');
      bd.className = 'cie-expand-backdrop';
      bd.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bd);
    }
    return bd;
  }

  function fitRect(el, rect, radius) {
    Object.assign(el.style, {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      borderRadius: radius || 'var(--cie-r)',
    });
  }

  function fitFrame(el) {
    Object.assign(el.style, {
      top: 'var(--cie-edge)',
      left: 'var(--cie-edge)',
      width: 'calc(100% - 2 * var(--cie-edge))',
      height: 'calc(100% - 2 * var(--cie-edge))',
      borderRadius: 'var(--cie-r-page)',
    });
  }

  function initExpand(root) {
    const boards = root.querySelectorAll('[data-cie-expand-board], .cie-expand-board');
    if (!boards.length) return;

    let open = null; // { panel, cell, board, busy }
    const backdrop = ensureExpandBackdrop();

    function close() {
      if (!open || open.busy) return;
      const { panel, cell, board } = open;
      open.busy = true;
      panel.classList.remove('is-open');
      panel.classList.add('is-moving');
      backdrop.classList.remove('is-on');
      const rect = cell.getBoundingClientRect();
      fitRect(panel, rect);
      const finish = () => {
        panel.classList.remove('is-shown', 'is-moving', 'is-open', 'is-fading');
        panel.style.cssText = '';
        panel.hidden = true;
        board.classList.remove('is-expanded');
        cell.classList.remove('is-source');
        cell.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('cie-has-expand');
        open = null;
        cell.focus({ preventScroll: true });
      };
      if (REDUCE) {
        finish();
        return;
      }
      onTransitionEnd(panel, 'height', finish);
    }

    function openPanel(board, cell, panel) {
      if (open && open.busy) return;
      if (open && open.panel === panel) return;
      if (open) {
        // close current instantly then open
        const prev = open;
        prev.panel.classList.remove('is-shown', 'is-moving', 'is-open');
        prev.panel.style.cssText = '';
        prev.panel.hidden = true;
        prev.board.classList.remove('is-expanded');
        prev.cell.classList.remove('is-source');
        prev.cell.setAttribute('aria-expanded', 'false');
        open = null;
      }

      const record = { panel, cell, board, busy: true };
      open = record;
      board.classList.add('is-expanded');
      cell.classList.add('is-source');
      cell.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('cie-has-expand');
      panel.hidden = false;
      panel.classList.add('is-shown');
      backdrop.classList.add('is-on');

      const settle = () => {
        panel.classList.remove('is-moving');
        panel.classList.add('is-open');
        panel.style.borderRadius = 'var(--cie-r-page)';
        record.busy = false;
        const closeBtn = panel.querySelector('[data-cie-expand-close], .cie-expand-close');
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      };

      if (REDUCE) {
        fitFrame(panel);
        settle();
        return;
      }

      const rect = cell.getBoundingClientRect();
      fitRect(panel, rect);
      panel.getBoundingClientRect();
      requestAnimationFrame(() => {
        panel.classList.add('is-moving');
        fitFrame(panel);
        onTransitionEnd(panel, 'height', settle);
      });
    }

    boards.forEach((board) => {
      board.querySelectorAll('[data-cie-expand]').forEach((cell) => {
        const id = cell.getAttribute('data-cie-expand');
        if (!id) return;
        const panel =
          document.getElementById(id) ||
          root.querySelector(`[data-cie-expand-panel="${id}"]`);
        if (!panel) return;
        panel.setAttribute('role', panel.getAttribute('role') || 'dialog');
        panel.setAttribute('aria-modal', 'true');
        if (!cell.hasAttribute('aria-expanded')) cell.setAttribute('aria-expanded', 'false');
        cell.setAttribute('aria-controls', id);

        cell.addEventListener('click', () => openPanel(board, cell, panel));
      });

      // close buttons inside panels owned by this board
      document.querySelectorAll('[data-cie-expand-panel], .cie-expand-panel').forEach((panel) => {
        panel.querySelectorAll('[data-cie-expand-close], .cie-expand-close').forEach((btn) => {
          if (btn.dataset.cieExpandBound) return;
          btn.dataset.cieExpandBound = '1';
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            close();
          });
        });
      });
    });

    backdrop.addEventListener('click', () => close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        close();
      }
    });
  }

  /* ── Sheet / modal ───────────────────────────────────────── */
  function ensureSheetBackdrop() {
    let bd = document.querySelector('.cie-sheet-backdrop');
    if (!bd) {
      bd = document.createElement('div');
      bd.className = 'cie-sheet-backdrop';
      bd.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bd);
    }
    return bd;
  }

  function initSheet(root) {
    const sheets = root.querySelectorAll('[data-cie-sheet], .cie-sheet');
    if (!sheets.length && !root.querySelector('[data-cie-sheet-open]')) return;

    const backdrop = ensureSheetBackdrop();
    let openSheet = null;

    function closeSheet() {
      if (!openSheet) return;
      const sheet = openSheet;
      openSheet = null;
      sheet.classList.remove('is-open');
      sheet.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('is-on');
      document.documentElement.classList.remove('cie-has-sheet');
      const opener = document.querySelector(`[data-cie-sheet-open="${sheet.id}"]`);
      if (opener) opener.focus({ preventScroll: true });
    }

    function openSheetEl(sheet) {
      if (openSheet && openSheet !== sheet) closeSheet();
      openSheet = sheet;
      sheet.classList.add('is-open');
      sheet.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('is-on');
      document.documentElement.classList.add('cie-has-sheet');
      const closeBtn = sheet.querySelector('[data-cie-sheet-close], .cie-sheet-close');
      (closeBtn || sheet).focus({ preventScroll: true });
    }

    root.querySelectorAll('[data-cie-sheet-open]').forEach((btn) => {
      const id = btn.getAttribute('data-cie-sheet-open');
      const sheet = document.getElementById(id);
      if (!sheet) return;
      sheet.setAttribute('role', sheet.getAttribute('role') || 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.setAttribute('aria-hidden', 'true');
      if (!sheet.hasAttribute('tabindex')) sheet.setAttribute('tabindex', '-1');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSheetEl(sheet);
      });
    });

    sheets.forEach((sheet) => {
      sheet.querySelectorAll('[data-cie-sheet-close], .cie-sheet-close').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          closeSheet();
        });
      });
    });

    backdrop.addEventListener('click', () => closeSheet());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && openSheet) {
        e.preventDefault();
        closeSheet();
      }
    });
  }

  /* ── Hamburger nav ──────────────────────────────────────────── */
  function initNav(root) {
    const hamburgers = root.querySelectorAll('[data-cie-hamburger], .cie-hamburger');
    if (!hamburgers.length) return;

    const backdrop = ensureNavBackdrop();
    let openPanel = null;

    function closeNav() {
      if (!openPanel) return;
      const { button, panel } = openPanel;
      openPanel = null;
      button.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-on');
      document.documentElement.classList.remove('cie-has-nav');
      button.focus({ preventScroll: true });
    }

    function openNav(button, panel) {
      if (openPanel && openPanel.panel !== panel) closeNav();
      openPanel = { button, panel };
      button.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      backdrop.classList.add('is-on');
      document.documentElement.classList.add('cie-has-nav');
      const firstLink = panel.querySelector('a, button:not([data-cie-nav-close])');
      (firstLink || panel).focus({ preventScroll: true });
    }

    hamburgers.forEach((btn) => {
      const target = btn.getAttribute('data-cie-hamburger') || btn.getAttribute('aria-controls');
      const panel = target ? document.getElementById(target) : btn.nextElementSibling;
      if (!panel) return;

      if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
      if (!btn.hasAttribute('aria-controls') && panel.id) btn.setAttribute('aria-controls', panel.id);
      if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', 'Toggle navigation');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        isOpen ? closeNav() : openNav(btn, panel);
      });

      // Close buttons inside panel
      panel.querySelectorAll('[data-cie-nav-close], .cie-nav-close').forEach((close) => {
        close.addEventListener('click', (e) => {
          e.preventDefault();
          closeNav();
        });
      });
    });

    backdrop.addEventListener('click', () => closeNav());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && openPanel) {
        e.preventDefault();
        closeNav();
      }
    });
  }

  function ensureNavBackdrop() {
    let bd = document.querySelector('.cie-nav-backdrop');
    if (!bd) {
      bd = document.createElement('div');
      bd.className = 'cie-nav-backdrop';
      bd.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bd);
    }
    return bd;
  }

  /* ── Text loading ────────────────────────────────────────────── */
  function initTextLoad(root) {
    root.querySelectorAll('[data-cie-text]').forEach((el) => {
      const variant = el.getAttribute('data-cie-text') || 'fade-up';
      
      // Prepare letter-fade: wrap each character
      if (variant === 'letter-fade') {
        const text = el.textContent || '';
        el.innerHTML = '';
        text.split('').forEach((char, i) => {
          const span = document.createElement('span');
          span.className = 'cie-text-char';
          span.textContent = char;
          span.style.setProperty('--char-i', String(i));
          el.appendChild(span);
        });
      }
      
      // Prepare line-rise: wrap lines (split by <br> or manual .cie-text-line)
      if (variant === 'line-rise' && !el.querySelector('.cie-text-line')) {
        const html = el.innerHTML;
        const lines = html.split(/<br\s*\/?>/i);
        if (lines.length > 1) {
          el.innerHTML = '';
          lines.forEach((line, i) => {
            const div = document.createElement('div');
            div.className = 'cie-text-line';
            div.innerHTML = line;
            div.style.setProperty('--line-i', String(i));
            el.appendChild(div);
          });
        }
      }

      // Trigger load after a frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (variant === 'pulse-dot') {
            el.classList.add('is-loading');
            setTimeout(() => {
              el.classList.remove('is-loading');
              el.classList.add('is-loaded');
            }, 800);
          } else {
            el.classList.add('is-loaded');
          }
        });
      });
    });
  }

  /* ── Theme morph (scroll-linked) ────────────────────────────── */
  function initThemeMorph(root) {
    const containers = root.querySelectorAll('[data-cie-theme-morph]');
    if (!containers.length) return;

    // Color interpolation: ink #0b0b0b → grey → paper #f3f2ee
    const inkRGB = { r: 11, g: 11, b: 11 };
    const paperRGB = { r: 243, g: 242, b: 238 };
    
    function lerpColor(progress) {
      // 0 → 1: ink → paper via linear interpolation
      const r = Math.round(inkRGB.r + (paperRGB.r - inkRGB.r) * progress);
      const g = Math.round(inkRGB.g + (paperRGB.g - inkRGB.g) * progress);
      const b = Math.round(inkRGB.b + (paperRGB.b - inkRGB.b) * progress);
      return { r, g, b };
    }
    
    function rgbToHex(rgb) {
      return '#' + 
        rgb.r.toString(16).padStart(2, '0') +
        rgb.g.toString(16).padStart(2, '0') +
        rgb.b.toString(16).padStart(2, '0');
    }
    
    function getContrast(rgb) {
      // Simple luminance check: if bg is dark, return light; if light, return dark
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
      return luminance > 0.5 ? inkRGB : paperRGB;
    }

    let ticking = false;

    function update() {
      ticking = false;
      containers.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const vh = global.innerHeight || 1;
        const top = rect.top;
        const height = rect.height;
        
        // Calculate progress: 0 at top of viewport, 1 at bottom
        let progress = 0;
        if (height > vh) {
          // Tall container: progress based on how much has scrolled past
          progress = Math.max(0, Math.min(1, -top / (height - vh)));
        } else {
          // Short container: progress based on position in viewport
          progress = Math.max(0, Math.min(1, (vh - top) / vh));
        }
        
        // Compute colors directly
        const bgRGB = lerpColor(progress);
        const fgRGB = getContrast(bgRGB);
        const bgHex = rgbToHex(bgRGB);
        const fgHex = rgbToHex(fgRGB);
        
        // Mute color (mid-tone between bg and fg)
        const muteRGB = {
          r: Math.round((bgRGB.r + fgRGB.r) / 2),
          g: Math.round((bgRGB.g + fgRGB.g) / 2),
          b: Math.round((bgRGB.b + fgRGB.b) / 2)
        };
        const muteHex = rgbToHex(muteRGB);
        
        // Set CSS custom properties with concrete colors
        el.style.setProperty('--cie-theme-progress', progress.toFixed(3));
        el.style.setProperty('--cie-theme-bg', bgHex);
        el.style.setProperty('--cie-theme-fg', fgHex);
        el.style.setProperty('--cie-theme-mute', muteHex);
        
        // Apply to document root for full-page effect
        document.documentElement.style.setProperty('--cie-theme-bg', bgHex);
        document.documentElement.style.setProperty('--cie-theme-fg', fgHex);
        document.documentElement.style.setProperty('--cie-theme-mute', muteHex);
        
        // Directly set background on the container for immediate visibility
        el.style.backgroundColor = bgHex;
        el.style.color = fgHex;
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

  /* ── Public API ──────────────────────────────────────────── */
  const Cie = {
    version: '0.4.1',
    reducedMotion: REDUCE,
    play: playTone,
    unlock: unlockAudio,
    presets: ['soft-tick', 'paper-snap', 'glass-pip', 'low-thud', 'bright-confirm'],
    getPreset() {
      return localStorage.getItem('cie-sfx-preset') || 'paper-snap';
    },
    setPreset(name) {
      if (this.presets.includes(name)) {
        localStorage.setItem('cie-sfx-preset', name);
        return true;
      }
      return false;
    },
    init(scope) {
      const root = scope || document;
      initReveal(root);
      initParallax(root);
      initCycle(root);
      initExpand(root);
      initSheet(root);
      initSound(root);
      initFlash(root);
      initNav(root);
      initTextLoad(root);
      initThemeMorph(root);
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

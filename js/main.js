(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noHover = matchMedia('(hover: none)').matches;

  /* ===================== Navigation entre les 2 vues ===================== */
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('canvas');
  let lockUntil = 0; // ignore les molettes pendant / juste après une transition

  const inCanvas = () => scrollY >= innerHeight - 2;
  function go(view) {
    lockUntil = performance.now() + 900;
    scrollTo({ top: view === 'canvas' ? innerHeight : 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // Un petit coup de molette suffit : on bascule automatiquement vers l'autre vue
  addEventListener('wheel', (e) => {
    if (e.ctrlKey || inCanvas()) return;   // dans le canvas, la molette sert au zoom
    e.preventDefault();
    if (performance.now() < lockUntil || Math.abs(e.deltaY) < 4) return;
    go(e.deltaY > 0 ? 'canvas' : 'hero');
  }, { passive: false });

  document.querySelectorAll('[data-go]').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); go(a.dataset.go); })
  );
  addEventListener('keydown', (e) => {
    if (e.key === 'Home') go('hero');
    if (e.key === 'End') go('canvas');
  });

  /* ===================== Menu : message en attendant son contenu ===================== */
  const menuMsg = document.getElementById('menuMsg');
  const menuBtn = document.getElementById('menuBtn');
  const setMenu = (open) => { menuMsg.hidden = !open; if (open) document.getElementById('menuClose').focus(); else menuBtn.focus(); };
  menuBtn.addEventListener('click', () => setMenu(true));
  document.getElementById('menuClose').addEventListener('click', () => setMenu(false));
  menuMsg.addEventListener('click', (e) => { if (e.target === menuMsg) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menuMsg.hidden) setMenu(false); });
  addEventListener('wheel', (e) => { if (!menuMsg.hidden) { e.preventDefault(); e.stopPropagation(); } }, { passive: false, capture: true });

  /* ===================== Vue 1 : parallaxe souris ===================== */
  const heroImg = document.getElementById('heroImg');
  const heroTitle = document.getElementById('heroTitle');
  const heroTitleText = document.getElementById('heroTitleText');
  const heroMedia = document.querySelector('.hero__media');

  const MAX_SHIFT = 28;   // px de déplacement max de la photo
  const SCALE = 1.1;      // marge pour ne jamais voir les bords
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };

  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    target.x = (e.clientX / innerWidth - 0.5) * 2;
    target.y = (e.clientY / innerHeight - 0.5) * 2;
  });

  function loopHero(t) {
    if (!reduceMotion) {
      if (noHover) { // mobile : légère dérive automatique
        target.x = Math.sin(t / 2600) * 0.6;
        target.y = Math.cos(t / 3200) * 0.4;
      }
      current.x += (target.x - current.x) * 0.06; // lissage
      current.y += (target.y - current.y) * 0.06;
      heroImg.style.transform =
        `translate(${-current.x * MAX_SHIFT}px, ${-current.y * MAX_SHIFT}px) scale(${SCALE})`;
      heroTitle.style.transform = `translate(${current.x * 6}px, ${current.y * 3}px)`; // bouge peu : profondeur
    }
    requestAnimationFrame(loopHero);
  }
  requestAnimationFrame(loopHero);

  // Le nom « Yao.WEBP » doit toujours tenir en entier dans la largeur de l'écran
  function fitTitle() {
    const margin = innerWidth * 0.03;
    heroTitle.style.fontSize = '100px';
    const w = heroTitleText.getBoundingClientRect().width;
    const byWidth = ((innerWidth - margin * 2) / w) * 100;
    heroTitle.style.fontSize = Math.min(byWidth, innerHeight * 0.55) + 'px';
  }
  fitTitle();
  addEventListener('resize', fitTitle);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);

  // Transition au scroll : la vue 1 s'estompe vers le canvas
  function onScroll() {
    const p = Math.min(1, Math.max(0, scrollY / innerHeight));
    heroMedia.style.opacity = String(1 - p * 0.9);
    heroTitle.style.opacity = String(1 - p);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ===================== Vue 2 : canvas pan / zoom ===================== */
  const world = document.getElementById('world');
  const hint = document.getElementById('hint');

  const MIN_Z = 0.12, MAX_Z = 3;
  const view = { x: 0, y: 0, z: 0.55 };

  function applyView() {
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.z})`;
    world.style.setProperty('--inv', String(1 / view.z));
    const s = 28 * view.z;
    canvas.style.backgroundSize = `${s}px ${s}px`;
    canvas.style.backgroundPosition = `${view.x}px ${view.y}px`;
  }

  function zoomAt(cx, cy, factor) {
    const z = Math.min(MAX_Z, Math.max(MIN_Z, view.z * factor));
    const k = z / view.z;
    view.x = cx - (cx - view.x) * k;
    view.y = cy - (cy - view.y) * k;
    view.z = z;
    applyView();
  }

  let hinted = false;
  function dismissHint() {
    if (hinted) return;
    hinted = true;
    hint.classList.add('is-hidden');
  }

  /* --- Construction de la galerie --- */
  const PHOTOS = window.PHOTOS || [];
  const SAVED = Object.assign({}, window.LAYOUT || {});
  try { Object.assign(SAVED, JSON.parse(localStorage.getItem('layout') || '{}')); } catch (_) {}

  // PRNG déterministe : même disposition à chaque visite
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const COLS = Math.ceil(Math.sqrt(PHOTOS.length * 1.1));
  const CELL_W = 460, CELL_H = 560;
  const items = []; // { file, el, x, y, w, h, z }
  let zTop = 10;    // profondeur : la photo cliquée passe devant les autres

  function applyZ(it) {
    it.el.style.zIndex = it.z;
    it.el.style.setProperty('--lift', Math.min(6, 1 + it.z / 2)); // plus c'est haut, plus l'ombre est marquée (relief)
  }
  function place(it) {
    it.el.style.left = it.x + 'px';
    it.el.style.top = it.y + 'px';
    it.el.style.width = it.w + 'px';
    if (it.h) it.el.style.height = it.h + 'px';
  }

  PHOTOS.forEach((file, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    const w = 200 + Math.round(rnd() * 260);
    const saved = SAVED[file];
    const it = {
      file,
      x: saved ? saved[0] : col * CELL_W + (CELL_W - w) / 2 + (rnd() - 0.5) * 140 + (row % 2) * 110,
      y: saved ? saved[1] : row * CELL_H + (rnd() - 0.5) * 220,
      w: saved ? saved[2] : w,
      h: saved && saved[3] ? saved[3] : 0, // 0 = hauteur calculée au chargement (ratio d'origine)
      z: saved && saved[4] ? saved[4] : 1 + Math.floor(rnd() * 6), // plans différents pour créer du relief
    };
    zTop = Math.max(zTop, it.z);

    const el = document.createElement('img');
    el.className = 'photo';
    el.src = 'images/' + encodeURI(file);
    el.alt = '';
    el.draggable = false;
    it.el = el;
    place(it);
    applyZ(it);
    el.addEventListener('load', () => {
      if (!it.h) { it.h = Math.round(it.w * el.naturalHeight / el.naturalWidth); place(it); }
      if (selected === it) syncSel();
    });
    world.appendChild(el);
    items.push(it);
  });

  function centerView() {
    const rows = Math.ceil(PHOTOS.length / COLS);
    const cw = COLS * CELL_W, ch = rows * CELL_H;
    const r = canvas.getBoundingClientRect();
    view.z = Math.min(0.6, Math.max(MIN_Z, Math.min(r.width / 1500, r.height / 1000)));
    view.x = r.width / 2 - (cw / 2) * view.z;
    view.y = r.height / 2 - (ch / 2) * view.z;
    applyView();
  }
  centerView();
  addEventListener('resize', centerView);

  /* ===================== Mode édition (touche E, ou ?edit) ===================== */
  let editMode = false;
  let selected = null;

  // Cadre de sélection + 4 poignées (comme Figma / Inspo)
  const sel = document.createElement('div');
  sel.className = 'sel';
  ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'].forEach((h) => {
    const d = document.createElement('div');
    d.className = 'sel__h';
    d.dataset.h = h;
    sel.appendChild(d);
  });
  world.appendChild(sel);

  function syncSel() {
    if (!selected) { sel.classList.remove('is-on'); return; }
    sel.classList.add('is-on');
    sel.style.left = selected.x + 'px';
    sel.style.top = selected.y + 'px';
    sel.style.width = selected.w + 'px';
    sel.style.height = (selected.h || selected.el.offsetHeight) + 'px';
  }
  function select(it) {
    // Sélectionner une photo ne change JAMAIS son plan (z) : le relief reste exactement tel quel.
    // Seul le cadre de sélection est toujours au-dessus (z-index 1000000 dans le CSS).
    selected = it;
    syncSel();
  }

  function currentLayout() {
    const out = {};
    items.forEach((it) => {
      out[it.file] = [Math.round(it.x), Math.round(it.y), Math.round(it.w), Math.round(it.h), it.z];
    });
    return out;
  }
  function saveLayout() {
    try { localStorage.setItem('layout', JSON.stringify(currentLayout())); } catch (_) {}
  }

  const bar = document.createElement('div');
  bar.className = 'edit-bar';
  bar.innerHTML =
    '<button id="copyLayout">Copier les positions</button>' +
    '<button id="resetLayout">Réinitialiser</button>' +
    '<button id="quitEdit">Quitter (E)</button>';
  canvas.appendChild(bar);
  bar.addEventListener('pointerdown', (e) => e.stopPropagation());
  bar.addEventListener('wheel', (e) => e.stopPropagation());

  document.getElementById('copyLayout').addEventListener('click', async () => {
    const text = 'window.LAYOUT = ' + JSON.stringify(currentLayout(), null, 1) + ';\n';
    try { await navigator.clipboard.writeText(text); alert('Positions copiées : colle-les dans js/layout.js (en remplaçant son contenu), puis clique sur Réinitialiser.'); }
    catch (_) { prompt('Copie ce texte dans js/layout.js :', text); }
  });
  document.getElementById('resetLayout').addEventListener('click', () => {
    try { localStorage.removeItem('layout'); } catch (_) {}
    location.reload();
  });
  document.getElementById('quitEdit').addEventListener('click', () => setEdit(false));

  function setEdit(on) {
    editMode = on;
    document.body.classList.toggle('edit', on);
  }
  addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e' && !e.ctrlKey && !e.metaKey && !e.altKey && inCanvas()) setEdit(!editMode);
    if (e.key === 'Escape') { setEdit(false); select(null); }
  });
  if (new URLSearchParams(location.search).has('edit')) setEdit(true);

  /* ===================== Interactions : drag, resize, molette, pincer ===================== */
  const pointers = new Map();
  let pinch = null;
  let drag = null; // { type: 'item' | 'resize', ... }

  canvas.addEventListener('pointerdown', (e) => {
    if (!inCanvas()) return;
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dismissHint();

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      drag = null;
      return;
    }
    const t = e.target;
    if (t.classList.contains('sel__h') && selected) {
      drag = { type: 'resize', h: t.dataset.h, it: selected, x0: selected.x, y0: selected.y, w0: selected.w, h0: selected.h || selected.el.offsetHeight, sx: e.clientX, sy: e.clientY };
    } else if (t.classList.contains('photo')) {
      const it = items.find((i) => i.el === t);
      select(it);
      drag = { type: 'item', it };
    } else {
      select(null);
      canvas.classList.add('is-dragging');
      drag = { type: 'pan' };
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;

    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = canvas.getBoundingClientRect();
      zoomAt((a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top, d / pinch.d);
      pinch.d = d;
    } else if (drag && drag.type === 'item') {
      drag.it.x += dx / view.z;
      drag.it.y += dy / view.z;
      place(drag.it);
      syncSel();
    } else if (drag && drag.type === 'resize') {
      // Redimensionnement libre (comme Figma) : la photo est recadrée (object-fit: cover).
      // Le côté ou coin opposé à la poignée reste fixe ; Maj = garder les proportions.
      const k = drag.h;
      const east = k.includes('e'), west = k.includes('w');
      const south = k.includes('s'), north = k.includes('n');
      const MIN = 50;
      const mx = (e.clientX - drag.sx) / view.z, my = (e.clientY - drag.sy) / view.z;
      let w = drag.w0, h = drag.h0;
      if (east) w = drag.w0 + mx;
      if (west) w = drag.w0 - mx;
      if (south) h = drag.h0 + my;
      if (north) h = drag.h0 - my;
      w = Math.max(MIN, w); h = Math.max(MIN, h);
      if (e.shiftKey && (east || west) && (north || south)) { // coin + Maj : proportions d'origine
        const ratio = drag.h0 / drag.w0;
        if (Math.abs(w - drag.w0) * ratio > Math.abs(h - drag.h0)) h = w * ratio; else w = h / ratio;
      }
      drag.it.w = w; drag.it.h = h;
      drag.it.x = west ? drag.x0 + (drag.w0 - w) : drag.x0;
      drag.it.y = north ? drag.y0 + (drag.h0 - h) : drag.y0;
      place(drag.it);
      syncSel();
    } else if (drag && drag.type === 'pan') {
      view.x += dx; view.y += dy;
      applyView();
    }
  });

  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      canvas.classList.remove('is-dragging');
      // Les visiteurs peuvent déplacer / redimensionner, mais seul le mode édition (E) sauvegarde
      if (editMode && drag && (drag.type === 'item' || drag.type === 'resize')) saveLayout();
      drag = null;
    }
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);

  canvas.addEventListener('wheel', (e) => {
    if (!inCanvas()) return; // pendant la transition, c'est le handler global qui décide
    e.preventDefault();
    if (performance.now() < lockUntil) return;
    dismissHint();
    const rect = canvas.getBoundingClientRect();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-dy * 0.0015));
  }, { passive: false });
})();

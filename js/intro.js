/* Intro : un flash, puis un défilé rapide de photos cohérentes qui se fondent les unes dans les autres,
   jusqu'à la photo de la landing. Touche / clique / scrolle pour passer. */
(() => {
  'use strict';

  const root = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro || !root.classList.contains('is-intro')) return;

  /* ---------- Réglages ---------- */
  // Photos du défilé (même ambiance chaude / orangée). La landing (photo finale) est ajoutée automatiquement à la fin.
  const SEQUENCE = [
    '620511182_17977073909980055_435086552424055608_n..webp',
    '621719755_17955242946053337_8711265887753199154_n..webp',
    '622208108_18061009163659863_5505600703781267590_n..webp',
    '624596879_18220701637312651_6631835845801522222_n..webp',
    '649121118_17934604971192546_6197589249673964171_n..webp',
    '619909935_17929634010081653_1643142002311150439_n..webp',
    '650916500_17961173145064254_484371136600430821_n..webp',
    '656069718_18050135537509739_2121459049988226516_n..webp',
    '639932234_18571662742047317_4675976542284848304_n..webp',
    '624249671_18183181768364739_5135558069412819149_n..webp',
  ];
  const STEP = 220;      // ms entre deux photos
  const FLASH = 160;     // ms du flash blanc de départ
  const HOLD = 450;      // ms sur la photo finale avant de dévoiler le site
  const MAX_WAIT = 4500; // ms max d'attente du chargement (connexion lente : on lance quand même)

  const heroSrc = document.getElementById('heroImg').getAttribute('src');
  const urls = SEQUENCE.map((f) => 'images/' + encodeURI(f)).concat(heroSrc);

  const count = intro.querySelector('.intro__count');
  const timers = [];
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    removeEventListener('wheel', skip, true);
    removeEventListener('pointerdown', skip, true);
    removeEventListener('keydown', skip, true);
    removeEventListener('touchmove', skip, true);
    intro.classList.add('is-out');   // fondu du voile
    root.classList.remove('is-intro'); // le menu et le titre apparaissent
    timers.push(setTimeout(() => intro.remove(), 900));
  }
  function skip(e) {
    if (e.type === 'wheel' || e.type === 'touchmove') e.preventDefault();
    e.stopPropagation(); // le geste sert à passer l'intro, pas à scroller derrière
    finish();
  }
  addEventListener('wheel', skip, { capture: true, passive: false });
  addEventListener('pointerdown', skip, true);
  addEventListener('keydown', skip, true);
  addEventListener('touchmove', skip, { capture: true, passive: false });
  setTimeout(finish, 20000); // filet de sécurité absolu

  /* ---------- Préchargement ---------- */
  function load(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.className = 'intro__img';
      img.alt = '';
      img.decoding = 'async';
      img.onload = () => (img.decode ? img.decode().catch(() => {}).then(() => resolve(img)) : resolve(img));
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Démarrage progressif : on lance dès que les premières photos sont prêtes (inutile d'attendre les 11),
  // les suivantes sont piochées dans l'ordre au fur et à mesure ; une photo pas encore chargée est sautée.
  const slots = new Array(urls.length).fill(null);
  const READY_MIN = 3;
  let started = false;
  const loadedCount = () => slots.filter(Boolean).length;
  function maybeStart(force) {
    if (started || finished) return;
    if (force || loadedCount() >= READY_MIN) {
      if (!loadedCount()) { finish(); return; }
      started = true;
      play();
    }
  }
  urls.forEach((u, i) => load(u).then((img) => {
    slots[i] = img && img.naturalWidth > 0 ? img : null;
    maybeStart(false);
  }));
  setTimeout(() => maybeStart(true), MAX_WAIT);

  /* ---------- Déroulé ---------- */
  function play() {
    intro.classList.add('is-playing', 'is-flash'); // retire le point de chargement + flash blanc
    const last = urls.length - 1;
    let i = -1;       // dernier index affiché
    let prev = null;  // photo précédente (à retirer une fois recouverte)
    let waited = 0;   // attente cumulée de la photo finale

    function show(img, idx) {
      intro.appendChild(img);
      void img.offsetWidth;            // force le démarrage de la transition
      img.classList.add('is-on');
      if (count) count.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(urls.length).padStart(2, '0');
      const old = prev;
      if (old) timers.push(setTimeout(() => old.classList.add('is-past'), 160));
      prev = img;
    }

    function tick() {
      if (finished) return;
      // prochaine photo de la série déjà chargée
      let n = i + 1;
      while (n < last && !slots[n]) n++;
      if (n < last) {
        i = n;
        show(slots[n], n);
        timers.push(setTimeout(tick, STEP));
        return;
      }
      // photo finale (celle de la landing) : on l'attend un peu si besoin
      if (!slots[last] && waited < MAX_WAIT) {
        waited += 80;
        timers.push(setTimeout(tick, 80));
        return;
      }
      if (slots[last]) show(slots[last], last);
      timers.push(setTimeout(finish, HOLD));
    }

    timers.push(setTimeout(tick, FLASH));
  }
})();

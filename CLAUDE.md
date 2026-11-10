# CLAUDE.md — mon_portfolioPhoto

## Projet
Site portfolio de photographie (HTML / CSS, JS si nécessaire).

## Sources d'inspiration
- Goldlight (portfolio d'artiste / musicien) : https://lovable.dev/templates/websites/music/goldlight-artist-musician-portfolio-template
- Inspo Canvas (moodboard visuel) : https://lovable.dev/templates/apps/saas/inspo-canvas-visual-moodboard-creator-template

## Instagram du photographe
- https://www.instagram.com/yao.webp (source des photos / du style à refléter ; lien lié à un lien « Contact » ou « Suivez-moi » dans le site)

## Objectif
Portfolio personnel de Yao pour présenter ses photos (prises par lui-même). Yao aime le développement web / logiciel (il développe aussi une application de sport, sortie prévue dans quelques mois) : le site doit être **créatif** et montrer aussi ce côté dev. Son Instagram a encore peu de followers, le site sert de vitrine.

## Concept : 2 vues au scroll
1. **Vue 1 — Landing (inspirée de Goldlight)** : grande photo plein écran avec **effet parallaxe à la souris** (l'image bouge / vibre légèrement selon la position du curseur), le **nom en grand en dessous**, un **menu en haut** avec lien Instagram.
2. **Vue 2 — Canvas (inspirée d'Inspo Canvas)** : en scrollant, transition vers un **canvas infini type moodboard / Figma** : on se balade (pan), on **zoome / dézoome**, on agrandit les photos, on peut les déplacer. Le menu reste visible en haut (avec Instagram).

Différences avec les templates : fond et identité visuelle propres (pas de « Inspo » ni « Get Started »), contenu = les photos de Yao.

Statut : v1 codée (2 vues). Nom affiché : **Yao.WEBP** (compte Instagram @yao.webp). Polices : Big Shoulders Display (titres) + Space Grotesk (UI), via Google Fonts. Reste à faire : photo hero définitive (`PXL_20250202_173923557~2`, introuvable pour l'instant), vérification navigateur, figer le layout du canvas, choix final du fond.

## Stack et contraintes
- HTML5 + CSS3 (vanilla), JavaScript léger si besoin
- Pas de framework sauf demande explicite
- Responsive (mobile d'abord)

## Structure
```
mon_portfolioPhoto/
├── index.html
├── css/style.css
├── js/
│   ├── main.js      # parallaxe hero + canvas pan/zoom + mode édition
│   ├── photos.js    # liste des photos du canvas (window.PHOTOS), à régénérer si on ajoute des images
│   └── layout.js    # positions figées (window.LAYOUT), collées depuis le mode édition
└── images/          # photos (noms Instagram avec « .. » : toujours passer par encodeURI)
```

## Intro (js/intro.js)
À l'arrivée : point de chargement, flash blanc, puis défilé rapide de photos cohérentes (fondu enchaîné ~220 ms chacune) jusqu'à la photo de la landing, puis le menu et le nom « YAO.WEBP » apparaissent. Les photos du défilé sont la liste `SEQUENCE` en haut de `js/intro.js` (la photo finale = celle de `#heroImg`). Démarre dès que 3 photos sont chargées, passable d'un tap / clic / scroll / touche, désactivée si `prefers-reduced-motion`. Inspiré d'une vidéo de référence de Yao (défilé d'une série de portraits aux mêmes tons, qui se fondent jusqu'à la page finale).

## Mode édition
`index.html?edit` : déplacer les photos du canvas à la souris, bouton « Copier les positions » → coller dans `js/layout.js`. Invisible pour les visiteurs.

## Conventions
- Langue des échanges : français
- Code (noms de classes, variables, commentaires) : à préciser
- HTML sémantique, images avec attribut `alt`, images optimisées (WebP / lazy-loading)

## Design
### Observations des captures de référence
**Goldlight (vue 1)** : photo plein écran sans cadre, quasi pleine hauteur. Menu en **pilules** semi-transparentes à bord fin (point + texte en petites capitales espacées) : à gauche MENU et Instagram, au centre le nom en condensé gras, à droite contact/réseau. Le **nom géant** en bas, police condensée très grasse, semi-transparent, **coupé par le bord de l'écran** et superposé à la photo (le sujet passe devant le texte en haut = effet de profondeur). Version mobile : seulement MENU, nom, et un bouton à droite ; le nom géant déborde.
**Inspo (vue 2)** : fond clair avec **grille de petits points**, photos à **coins arrondis + ombre douce**, disposées librement (tailles variées, certaines coupées par le bord), **carte centrale blanche** (titre, sous-titre, bouton noir arrondi), poignées de sélection bleues façon Figma, bouton « Copy positions » (outil pour exporter les positions des photos : à reprendre en mode dev pour placer les photos).

**Précision parallaxe (vue 1)** : la photo est légèrement agrandie (zoom ~105-110 %) et se **translate dans le sens opposé/proche du curseur**, avec un **lissage progressif** (interpolation lerp via requestAnimationFrame, pas un saut brutal). Les captures montrent la même photo décalée de quelques dizaines de pixels selon la position de la souris. Le menu et le nom géant restent fixes (ou bougent beaucoup moins que la photo). Sur mobile : pas de souris, option gyroscope/inclinaison ou léger mouvement automatique.

### Décisions de Yao (vue 2)
- Pas de carte « Inspo », pas de « Get Started », pas de bouton « Copy positions » visible : **aucun élément d'UI**, juste un canvas de photos en vrac (« bibliothèque / bazar de photos »).
- Le visiteur peut seulement **se balader, zoomer, dézoomer** (et agrandir/rapetisser les photos), il ne peut pas les modifier ni copier.
- Le nom de Yao peut apparaître dans un encadré/bouton à la place de la carte Inspo (à confirmer).
- Fond **plus sombre** que le blanc d'Inspo (ou beige / autre couleur) ; Yao enverra des images de fonds d'inspiration, Claude choisit ce qui convient.
- Photos : créations de Yao faites sous Photoshop (celles de son Instagram), déjà prêtes sur son PC.
- **Dézoom automatique** : en arrivant dans la galerie, la vue dézoome doucement (depuis le centre de l'écran) jusqu'à un stade d'arrêt, même si le visiteur se balade. **Sur téléphone** : jusqu'au dézoom maximal (`MOBILE_MIN_Z`). **Sur PC** : s'arrête plus tôt, à `AUTO_VIEW_W` (≈ 5490 px de « monde » visibles en largeur, soit zoom ≈ 0,34 sur un écran de 1880 px, ≈ 10 colonnes de photos, mesuré sur une capture de Yao) ; le visiteur peut ensuite dézoomer plus loin à la main (jusqu'à 0,12). Dès qu'il zoome lui-même (molette / pincement), l'animation s'arrête définitivement. But : qu'on comprenne qu'on peut dézoomer (la sœur de Yao croyait le site non responsive). Réglages en haut de la section canvas de `js/main.js` : `AUTO_RATE`, `AUTO_DELAY`, `AUTO_RAMP`. Il ne s'arrête PAS quand le visiteur déplace ou redimensionne une photo (les gestes sont calculés en coordonnées « monde » via `toWorld()` pour que la photo reste sous le doigt pendant le dézoom). Désactivé seulement dans l'outil caché `?edit` / touche E (outil de Yao pour placer les photos), avec le menu ouvert, et avec `prefers-reduced-motion`.
- **Poignées de redimensionnement sur téléphone** : carrés bleus de 16 px avec une zone tactile ~48 px (`@media (pointer: coarse)` dans `css/style.css`), coins prioritaires sur les poignées du milieu.
- Idée pour plus tard : clic sur une photo → le fond change, autres effets artistiques. Hors périmètre pour l'instant.
- Outil de placement : mode dev caché (ex. `?edit` dans l'URL) pour positionner les photos et exporter les coordonnées, invisible pour les visiteurs.

Palette, typographies, ambiance finale : à définir.
Sections connues : landing (parallaxe souris), canvas de photos (pan/zoom), menu + Instagram. À décider : à propos, contact.

## Commandes utiles
- Aperçu : ouvrir `index.html` dans le navigateur (ou extension Live Server de VS Code)

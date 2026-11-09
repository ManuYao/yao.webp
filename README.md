# Yao.WEBP — Portfolio photo

Portfolio personnel de photographie, pensé comme une expérience plutôt que comme une galerie classique.
Compte Instagram : [@yao.webp](https://www.instagram.com/yao.webp)

Site 100 % statique : HTML, CSS et JavaScript, sans framework ni dépendance à installer.

## Aperçu

Le site tient en deux vues, reliées par un scroll.

**1. Landing**
- Une photo plein écran qui suit légèrement la souris (parallaxe lissée). Sur mobile, elle dérive doucement toute seule.
- Le nom « YAO.WEBP » en très grand, ajusté pour toujours tenir en entier dans la largeur de l'écran.
- Un menu en pilules semi-transparentes, avec le lien Instagram.
- Un seul coup de molette (ou de doigt) bascule vers la galerie.

**2. Galerie en canvas infini**
- Toutes les photos sont posées « en vrac » sur un fond sombre à grille de points.
- On se déplace en glissant, on zoome à la molette ou en pinçant.
- On peut cliquer une photo pour la déplacer ou la redimensionner librement avec les poignées (la photo est recadrée, comme dans Figma). Maj garde les proportions sur un coin.
- Chaque photo a un plan différent (z-index) et une ombre proportionnelle, pour créer du relief. Sélectionner une photo ne change jamais son plan.
- Les modifications des visiteurs ne sont pas sauvegardées : en rechargeant, la disposition d'origine revient.

## Lancer le site

Aucune installation. Ouvrir `index.html` dans un navigateur suffit, ou servir le dossier en local :

```bash
python -m http.server 8765
# puis ouvrir http://localhost:8765/
```

L'extension Live Server de VS Code fonctionne aussi.

## Structure

```
.
├── index.html
├── css/style.css      # styles des deux vues, du menu et du mode édition
├── js/
│   ├── main.js        # parallaxe, navigation entre vues, canvas pan/zoom, sélection, mode édition
│   ├── photos.js      # liste des photos du canvas (window.PHOTOS)
│   └── layout.js      # positions figées des photos (window.LAYOUT), vide = disposition automatique
├── images/            # photos (WebP)
└── CLAUDE.md          # notes de conception du projet
```

## Ajouter ou retirer des photos

1. Déposer les fichiers dans `images/`.
2. Mettre à jour la liste dans `js/photos.js` (un nom de fichier par ligne). Depuis un terminal Bash, à la racine du projet :

   ```bash
   { echo "window.PHOTOS = ["; ls images | sed 's/.*/  "&",/'; echo "];"; } > js/photos.js
   ```

   La photo de la landing est définie directement dans `index.html` (balise `#heroImg`).

Les photos sans position enregistrée sont placées automatiquement, de façon déterministe : la disposition est la même à chaque visite.

## Mode édition (réservé au propriétaire)

Pour fixer la disposition de la galerie pour tous les visiteurs :

1. Dans la galerie, appuyer sur **E** (ou ouvrir `index.html?edit`). Une barre de boutons apparaît en haut à droite.
2. Déplacer et redimensionner les photos. Les changements sont enregistrés dans le navigateur (`localStorage`).
3. Cliquer sur **Copier les positions**, puis coller le texte obtenu dans `js/layout.js` (en remplaçant son contenu).
4. Cliquer sur **Réinitialiser** pour effacer la sauvegarde locale et vérifier le résultat.

Format de `layout.js` : `"fichier.webp": [x, y, largeur, hauteur, plan]`.
**Échap** quitte le mode édition. Le plan d'une photo n'est jamais modifié par un simple clic.

## Raccourcis

| Touche | Action |
| --- | --- |
| Molette (landing) | Passer à la galerie |
| Molette (galerie) | Zoom |
| Home / End | Landing / galerie |
| E | Mode édition |
| Échap | Quitter le mode édition, désélectionner |

## Choix techniques

- **Pas de framework** : le rendu est un simple conteneur transformé (`translate` + `scale`) dont les photos sont de vraies balises `<img>`.
- **Typographies** : [Big Shoulders Display](https://fonts.google.com/specimen/Big+Shoulders+Display) pour les titres et [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) pour l'interface, chargées depuis Google Fonts (retour à Impact / police système hors ligne).
- **Accessibilité** : `prefers-reduced-motion` désactive la parallaxe et les animations, le menu est un vrai `button`, Échap ferme les fenêtres.

## Mise en ligne

Le site étant statique, il peut être publié tel quel sur GitHub Pages, Netlify ou Vercel (dossier racine, aucune étape de build).

## État du projet

- Menu : une fenêtre « Bientôt disponible » s'affiche pour l'instant.
- La photo de la landing est provisoire et sera remplacée par une version en haute définition.
- Idées pour plus tard : changement de fond au clic sur une photo, section à propos / contact, présentation du côté développement (dont l'application de sport en cours).

## Inspirations

Les templates Lovable [Goldlight](https://lovable.dev/templates/websites/music/goldlight-artist-musician-portfolio-template) (landing, menu, parallaxe) et [Inspo Canvas](https://lovable.dev/templates/apps/saas/inspo-canvas-visual-moodboard-creator-template) (canvas de photos). Le code et le design sont réécrits pour ce projet.

## Droits

Toutes les photos sont © Yao.WEBP. Elles ne peuvent pas être réutilisées sans autorisation.

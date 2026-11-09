# Yao.WEBP — Portfolio photo

Un portfolio de photographie pensé comme une expérience : une landing immersive, puis une galerie infinie où l'on se balade librement entre les photos.
Instagram : [@yao.webp](https://www.instagram.com/yao.webp)

![Landing](docs/landing-desktop.png)

## L'intro

À l'arrivée, un flash puis un défilé rapide de photos aux mêmes tons, qui se fondent les unes dans les autres jusqu'à la photo de la landing. On peut la passer d'un tap ou d'un clic.

## La galerie

Toutes les photos sont posées en vrac sur un canvas infini. On glisse pour se déplacer, on zoome à la molette ou en pinçant.

![Vue d'ensemble de la galerie](docs/galerie-vue-densemble.png)

En zoomant, les photos se chevauchent sur des plans différents, ce qui crée du relief. On peut cliquer une photo pour la déplacer ou la redimensionner.

![Galerie zoomée](docs/galerie-zoom.png)

## Sur mobile

<p>
  <img src="docs/landing-mobile.png" alt="Landing sur mobile" width="260">
  &nbsp;&nbsp;
  <img src="docs/galerie-mobile.png" alt="Galerie sur mobile" width="260">
</p>

## Technologies

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Fonts](https://img.shields.io/badge/Google_Fonts-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

HTML5, CSS3 et JavaScript pur (sans framework). Polices : Big Shoulders Display et Space Grotesk. Photos au format WebP.

## Lancer le site

Site statique (HTML, CSS, JavaScript), sans installation :

```bash
python -m http.server 8765   # puis ouvrir http://localhost:8765/
```

## Inspirations

[Goldlight](https://lovable.dev/templates/websites/music/goldlight-artist-musician-portfolio-template) pour la landing et [Inspo Canvas](https://lovable.dev/templates/apps/saas/inspo-canvas-visual-moodboard-creator-template) pour le canvas de photos.

© Yao.WEBP — photos non réutilisables sans autorisation.

# 🌡️ Thermomètre — le réchauffement climatique en direct

Site web statique, en français, pensé d'abord pour mobile, qui rassemble **toutes les statistiques
du réchauffement climatique** : températures et records, CO₂ et gaz à effet de serre, océans, glaces,
catastrophes naturelles, météo et qualité de l'air de 24 villes (dont **Périgueux**), rivières et crues,
énergie, santé et mortalité, focus France & Europe.

**Adresse du site** : https://thekilleurdu3411.github.io/TEMPNOW/

- **En direct** : 16 sources de données sont interrogées depuis le navigateur du visiteur à chaque ouverture.
- **Sourcé** : chaque chiffre de fond a une source et une date ([`data/static.js`](data/static.js), page [Sources](sources.html)).
- **Animé** : bandes de réchauffement animées, compteurs depuis l'ouverture de la page, graphiques qui se tracent au défilement.
- **Léger et robuste** : aucune étape de build, aucune clé d'API ; si une API tombe, seul son bloc affiche un message.

## Contenu

| # | Chapitre | En direct | Chiffres de fond |
|---|---|---|---|
| — | Ouverture | Bandes de réchauffement mondiales 1880 → aujourd'hui (NASA GISTEMP), dernier mois mesuré | +1,47 °C en 2025 (Copernicus) |
| 01 | Compteurs | CO₂ du jour à Mauna Loa | CO₂ émis, glace fondue, chaleur océanique, décès (chaleur, pollution), coûts des catastrophes **depuis l'ouverture de la page** ; budget carbone restant en temps réel |
| 02 | Températures | Anomalie mondiale mensuelle depuis 1880 ; **bandes locales depuis 1950** (24 villes au choix) | Copernicus, OMM, IGCC, projections GIEC |
| 03 | CO₂ & gaz | CO₂ quotidien, CH₄, N₂O (NOAA) | OMM, Global Carbon Project, budget carbone |
| 04 | Océans | Anomalie océanique annuelle, température de surface de 12 mers, niveau d'eau à New York | OMM, NASA, GIEC |
| 05 | Glaces | Étendue de la banquise mondiale (NSIDC) | WGMS, NASA GRACE, NSIDC, GLAMOS |
| 06 | Catastrophes | **Carte zoomable** : séismes (USGS), feux/tempêtes/volcans (NASA EONET), alertes GDACS, température des villes | Munich Re, EM-DAT, NOAA, EFFIS |
| 07 | Météo & air | Conditions actuelles de 24 villes, **vagues de chaleur à 7 jours**, qualité de l'air, alertes chaleur NWS | — |
| 08 | Rivières | **L'Isle à Périgueux** (Hub'eau), 9 grands fleuves (GloFAS) | — |
| 09 | Énergie | Intensité carbone et mix électrique France (éCO2mix) et Grande-Bretagne | — |
| 10 | Santé | Air, UV et pollens à Périgueux | Lancet Countdown, OMS (pollution, paludisme, dengue, projections) |
| 11 | France & Europe | **Périgueux en 2050** (projection climatique 1950-2050) | Météo-France, Santé publique France, ISGlobal, Imperial/LSHTM, EFFIS, France Assureurs |

## Organisation du code

```
index.html            page principale (12 chapitres)
sources.html          page Sources (générée depuis data/)
css/main.css          styles (mobile d'abord, thème sombre)
data/static.js        TOUS les chiffres de fond : valeur, source, date
data/apis.js          liste des API en direct (affichée sur la page Sources)
js/main.js            point d'entrée : initialise chaque chapitre isolément
js/sources.js         rendu de la page Sources
js/core/              briques communes
  fetcher.js            fetch avec délai + cache localStorage (séries lourdes)
  live.js               bloc « en direct » : chargement, heure du relevé, source, Actualiser, erreur
  charts.js             thème Chart.js, tracé au défilement, relecture
  motion.js             GSAP/ScrollTrigger, CountUp, prefers-reduced-motion
  stripes.js            bandes de réchauffement sur <canvas>
  stats.js              cartes de chiffres sourcés
  datasets.js           séries global-warming.org partagées entre chapitres
  format.js             nombres et dates en français
js/chapters/          un module par chapitre
  hero.js counters.js temperatures.js gases.js oceans.js ice.js disasters.js
  weather.js rivers.js energy.js health.js france.js cities.js
API.md                API retenues / écartées, URL, résultats des tests
```

## Bibliothèques (« plugins »)

Toutes chargées par CDN en **versions figées** avec empreinte d'intégrité (SRI), en `defer` pour ne pas
bloquer l'affichage. Le site reste utilisable si l'une d'elles ne se charge pas (message à la place du
graphique ou de la carte).

| Bibliothèque | Version | Pourquoi celle-ci |
|---|---|---|
| [Leaflet](https://leafletjs.com/) | 1.9.4 | Cartes zoomables tactiles. 42 ko gzip, contre ~200 ko pour MapLibre GL ; pas besoin de WebGL ni de tuiles vectorielles pour des points sur un fond sombre. Fonctionne sur les vieux téléphones. |
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | Graphiques canvas animés, infobulles au toucher intégrées, ~70 ko gzip. ECharts (~330 ko) est plus riche mais trop lourd pour un site mobile ; D3 demanderait beaucoup de code pour des courbes et barres classiques. |
| [GSAP](https://gsap.com/) + ScrollTrigger | 3.12.5 | Référence des animations au défilement : fluide, robuste sur iOS, apparitions déclenchées une seule fois, barre de progression de lecture. Gratuit pour tout usage. |
| [CountUp.js](https://inorganic.github.io/countUp.js/) | 2.8.0 | Compteurs animés (6 ko) avec séparateurs français. |
| Polices Google : Space Grotesk + JetBrains Mono | — | Identité « instrument scientifique » : grotesque technique pour les titres, chiffres monospaces tabulaires pour les relevés. |

Les **bandes de réchauffement** sont dessinées sans bibliothèque (canvas, palette ColorBrewer RdBu d'après
Ed Hawkins).

## Données en direct : comportement

- Chaque bloc en direct affiche **l'état** (chargement / en direct / cache / indisponible), **l'heure du
  relevé**, **la source** (lien) et un bouton **« Actualiser »**.
- Les blocs se chargent quand on s'en approche (la page s'ouvre vite) ; certains se rafraîchissent seuls
  (séismes 5 min, météo 15 min, débit de l'Isle 15 min…).
- **Cache localStorage** pour les appels lourds : séries historiques global-warming.org (12 h), bandes
  locales ERA5 (30 jours, seules les moyennes annuelles sont stockées), projection Périgueux (30 jours).
  Si l'API ne répond plus, la dernière valeur en cache est affichée et signalée.
- Une API en panne n'affecte que son bloc ; chaque chapitre est initialisé séparément.

## Accessibilité et performance

- `prefers-reduced-motion` respecté : animations, compteurs et graphiques s'affichent directement.
- Contrastes AA sur fond sombre (texte secondaire `#9aa7b4` ≈ 7,6:1).
- Aucun défilement horizontal sur téléphone (vérifié à 390 px) ; les tableaux larges défilent dans leur cadre.
- Navigation collante par chapitres, lien d'évitement, libellés ARIA sur les graphiques et la carte.
- Pas de build, pas de framework : ~160 ko de bibliothèques gzip, le reste en modules ES natifs.

## Tester en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```
(Les modules ES ne fonctionnent pas en ouvrant `index.html` directement par `file://`.)

## Mettre à jour les chiffres

Modifier [`data/static.js`](data/static.js) : chaque entrée a `value`, `label`, `src` (clé de `SOURCES`) et
`date`. La page Sources se met à jour toute seule.

## Activer GitHub Pages

1. Sur GitHub, ouvrir le dépôt **Thekilleurdu3411/TEMPNOW**.
2. Onglet **Settings** → menu de gauche **Pages**.
3. Dans **Build and deployment** → **Source**, choisir **Deploy from a branch**.
4. Dans **Branch**, choisir **main** et le dossier **/ (root)**, puis **Save**.
5. Attendre 1 à 2 minutes (onglet **Actions** : le déploiement « pages build and deployment » passe au vert).
6. Le site est en ligne sur **https://thekilleurdu3411.github.io/TEMPNOW/**.

Le fichier `.nojekyll` à la racine désactive Jekyll pour servir les fichiers tels quels.

## Licences et crédits

Code : MIT. Données : propriété de leurs producteurs (Copernicus/ECMWF, OMM, NOAA, NASA, NSIDC, USGS,
GDACS/JRC, Open-Meteo — CC BY 4.0, usage non commercial de l'API —, Hub'eau, RTE, National Grid ESO, OMS,
Lancet Countdown, Santé publique France, Météo-France, Munich Re, CRED/EM-DAT, etc.). Fond de carte © Esri.
Bandes de réchauffement : concept d'Ed Hawkins (#ShowYourStripes).

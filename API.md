# API utilisées par Thermomètre

Sélection faite à partir du dépôt [public-apis/public-apis](https://github.com/public-apis/public-apis)
(catégories *Environment*, *Weather*, *Science & Math*, *Geocoding*, *Health*, *Open Data*, *Government*),
complétée par quelques services publics officiels absents de la liste mais répondant aux mêmes critères.

**Critères** : gratuite · sans compte ni clé (colonne *Auth = No*) · HTTPS · appelable depuis un navigateur
(en-tête CORS `Access-Control-Allow-Origin` présent).

**Tests** : effectués le 26 octobre 2026 depuis l'environnement de développement (requête HTTPS avec
en-tête `Origin`, vérification du code HTTP, de l'en-tête CORS et du contenu), puis dans Chromium
(Playwright) sur la page réelle.

Légende : ✅ testée et fonctionnelle · ◐ CORS confirmé mais réponse limitée pendant le test · ⚠️ non testable depuis l'environnement, écrite d'après la documentation officielle.

---

## API retenues

| API | Dans public-apis ? | Ce qu'elle apporte au site | URL appelée | Test |
|---|---|---|---|---|
| **Open-Meteo — Forecast** | Oui (Weather, Environment) | Météo actuelle et prévisions 7 jours de 24 villes dont Périgueux (température, ressenti, humidité, vent, UV) ; détection des vagues de chaleur (jours ≥ 35 °C, nuits ≥ 20 °C) | `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&current=…&daily=…&forecast_days=7&timezone=auto` (24 villes en un seul appel) | ✅ (429 ponctuels depuis l'IP partagée du test) |
| **Open-Meteo — Air Quality** | (Open-Meteo) | Indice européen de qualité de l'air, PM2,5, PM10, NO₂, O₃, poussières (CAMS) ; pollens et UV à Périgueux | `https://air-quality-api.open-meteo.com/v1/air-quality?…&current=european_aqi,us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,dust` | ✅ |
| **Open-Meteo — Historical Weather (ERA5)** | (Open-Meteo) | Température moyenne journalière depuis le 1ᵉʳ janvier 1950 → **bandes de réchauffement locales** par ville | `https://archive-api.open-meteo.com/v1/archive?latitude=…&longitude=…&start_date=1950-01-01&end_date=<année-1>-12-31&daily=temperature_2m_mean` — **cache localStorage 30 jours** (moyennes annuelles seulement) | ◐ CORS `*` confirmé ; quota journalier atteint depuis l'IP partagée du test (429), fonctionnel dans le navigateur |
| **Open-Meteo — Climate (CMIP6 / HighResMIP)** | (Open-Meteo) | Projection 1950-2050 à Périgueux : jours ≥ 30 °C et ≥ 35 °C par an (modèle EC_Earth3P_HR) | `https://climate-api.open-meteo.com/v1/climate?latitude=45.184&longitude=0.7218&start_date=1950-01-01&end_date=2050-12-31&models=EC_Earth3P_HR&daily=temperature_2m_max` — **cache 30 jours** | ✅ |
| **Open-Meteo — Flood (Copernicus GloFAS)** | (Open-Meteo) | Débit des grands fleuves (Seine, Loire, Garonne, Rhône, Rhin, Danube, Mississippi, Gange, Amazone) : 60 jours passés + 30 jours de prévision | `https://flood-api.open-meteo.com/v1/flood?latitude=…&longitude=…&daily=river_discharge,river_discharge_max&past_days=60&forecast_days=30` | ✅ (coordonnées recalées sur la maille du fleuve) |
| **Open-Meteo — Marine** | (Open-Meteo) | Température de surface de la mer et houle sur 12 zones (Méditerranée, Gascogne, Caraïbes, Niño 3.4, Barents…) | `https://marine-api.open-meteo.com/v1/marine?latitude=…&longitude=…&current=sea_surface_temperature,wave_height` | ✅ |
| **USGS Earthquake Hazards Program** | Oui (Science & Math) | Séismes M ≥ 4,5 des 7 derniers jours sur la carte ; liste des plus forts | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson` (rafraîchi toutes les 5 min) | ✅ |
| **NASA EONET v3** | Via « NASA » (Science & Math) | Événements naturels ouverts suivis par satellite : feux, tempêtes (avec trajectoire), volcans, icebergs, inondations… | `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=60` | ✅ |
| **GDACS** (ONU / Commission européenne) | Non (service officiel) | Alertes catastrophes vert/orange/rouge : séismes, cyclones, inondations, volcans, sécheresses, feux | `https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP` | ✅ (réponse parfois lente : délai 25 s) |
| **global-warming.org** | Non (agrégateur ouvert de données NASA/NOAA/NSIDC) | Températures mondiales mensuelles depuis 1880 (NASA GISTEMP, colonne `land` = indice terres+océans LOTI), CO₂ quotidien (NOAA GML), CH₄ et N₂O mensuels, anomalie océanique annuelle (NOAA NCEI), banquise mondiale (NSIDC) | `https://global-warming.org/api/{temperature,co2,methane,nitrous-oxide,ocean-warming,arctic}-api` — **cache 12 h** | ✅ (valeurs GISTEMP vérifiées contre le CSV officiel de la NASA) |
| **NOAA CO-OPS** (Tides & Currents) | Oui (Weather) | Niveau d'eau observé vs marée prédite à New York (The Battery), 48 h — illustre la surcote | `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=8518750&range=48&product=water_level` (+ `product=predictions`) | ✅ |
| **NOAA NWS** (api.weather.gov) | Oui (« US Weather ») | Nombre d'alertes chaleur actives aux États-Unis | `https://api.weather.gov/alerts/active?status=actual&event=Extreme Heat Warning,Extreme Heat Watch,Heat Advisory,…` | ✅ |
| **Hub'eau — Hydrométrie** (OFB / SCHAPI) | Non (API publique française) | Débit et hauteur de **l'Isle à Périgueux** (station P704151001) en temps réel, 7 jours | `https://hubeau.eaufrance.fr/api/v2/hydrometrie/observations_tr?code_entite=P704151001&grandeur_hydro=Q` (et `H`) | ✅ (unités : L/s et mm, converties) |
| **UK Carbon Intensity** (National Grid ESO) | Oui (Environment) | Intensité carbone (gCO₂/kWh) mesurée et prévue sur la journée, mix électrique de la Grande-Bretagne | `https://api.carbonintensity.org.uk/generation` et `/intensity/date` | ✅ |
| **ODRÉ — éCO2mix national temps réel** (RTE, Opendatasoft) | Non (open data énergie France) | Mix électrique français et taux de CO₂ sur 24 h | `https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/eco2mix-national-tr/records?select=…&order_by=date_heure desc&limit=96` | ⚠️ **non testée** : le proxy de l'environnement coupe la connexion vers ce domaine ; code écrit d'après la documentation Opendatasoft v2.1. En cas d'échec, le bloc affiche un message et le reste de la page fonctionne. |
| **Esri World Dark Gray Canvas** | Non (tuiles cartographiques) | Fond de carte sombre de la carte des catastrophes (+ couche de noms) | `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}` | ✅ |

---

## API écartées

| API (catégorie public-apis) | Raison |
|---|---|
| **CARTO basemaps** (fond de carte, hors liste) | Envisagé d'abord : les tuiles `dark_all` renvoient désormais un filigrane « API KEY REQUIRED » → remplacé par Esri. |
| **NASA api.nasa.gov** (Science & Math) | Demande une clé (`DEMO_KEY` très limitée). On utilise EONET, qui n'en demande pas. |
| **NASA GISTEMP CSV** (data.giss.nasa.gov) | Pas d'en-tête CORS → inaccessible depuis le navigateur. Données reprises via global-warming.org. |
| **NOAA GML fichiers texte** (gml.noaa.gov) | Pas d'en-tête CORS. Repris via global-warming.org. |
| **NSIDC fichiers CSV** | Pas de CORS, URL changeante (404 au test). Repris via global-warming.org. |
| **NASA POWER** (Weather) | Fonctionne (CORS ✅) mais redondant avec Open-Meteo (climatologie solaire/agricole). |
| **Open-Meteo Ensemble** (Weather) | Fonctionne, mais trop lourd pour un intérêt limité ici. |
| **kanari** (Environment, feux en temps réel) | Erreur 502 au test ; feux couverts par NASA EONET. |
| **CO2 Offset** (Environment) | Erreur 502 au test ; calculateur d'empreinte hors sujet. |
| **Danish data service Energi** (Environment) | Réponse vide sans en-tête CORS au test ; périmètre Danemark seulement. |
| **Website Carbon** (Environment) | Pas d'en-tête CORS. |
| **GrünstromIndex** (Environment) | Pas de HTTPS. |
| **GridVigil, WattFigure, Sähkön hinta nyt, Solematica, Luchtmeetnet, PVGIS** (Environment) | Périmètres nationaux très restreints (États-Unis, Finlande, Italie, Pays-Bas) ou CORS = No (PVGIS, Solematica). |
| **PM2.5 Open Data Portal, Purple Air, sensor.community** (Environment / Science) | Capteurs à bas coût, formats lourds ; PurpleAir demande désormais une clé ; sensor.community exige un en-tête `User-Agent` non modifiable par un navigateur. Qualité de l'air couverte par Open-Meteo (CAMS). |
| **OpenAQ, AQICN, IQAir, AirNow** (Environment) | Demandent une clé API. |
| **USGS Water Services** (Science & Math) | Fonctionne (CORS ✅) mais États-Unis seulement ; Hub'eau (France) + GloFAS (monde) plus pertinents ici. |
| **World Bank** (Science & Math) | Fonctionne (CORS ✅) mais l'indicateur d'émissions mondiales 2025 est vide (`null`) et les séries s'arrêtent avant les chiffres du Global Carbon Project, plus récents. |
| **Hong Kong Observatory, IPMA, FMI, Meltema, Pirate Weather, wttr.in, Veabird, World Time & Weather** (Weather) | Redondants avec Open-Meteo, périmètre national, ou clé requise (Pirate Weather). |
| **RainViewer** (Weather) | Fonctionne, mais un radar de pluie n'apporte pas d'information climatique. |
| **AviationWeather, Hail History, WeatherTotals, Terrace Weather** (Weather) | Hors sujet ou États-Unis seulement. |
| **Queimadas INPE** (Geocoding) | Brésil seulement ; pas d'API JSON documentée stable. |
| **Nominatim, REST Countries, adresse.data.gouv.fr, GeoApi…** (Geocoding) | Inutiles : les coordonnées des villes sont figées dans le code (aucune recherche libre). REST Countries répondait 301 au test. |
| **Covid-19 et autres API santé** (Health) | Aucune ne couvre la mortalité climatique ; les chiffres santé viennent des rapports OMS / Lancet / Santé publique France (voir `data/static.js`). |
| **Humanitarian Data Exchange** (Health) | CKAN : jeux de données en fichiers, pas de série temps réel exploitable côté navigateur. |
| **EPA, Census.gov, Open Government (divers pays)** (Government) | Portails de fichiers, souvent sans CORS, ou périmètres nationaux hors sujet. |
| **CityAlert** (Open Data) | CORS = No. |
| **NOAA AviationWeather, Launch Library, Solar System OpenData…** | Hors sujet. |

## Chiffres sans API

Tout ce qui n'existe pas en API (records, budgets carbone, coûts des catastrophes, mortalité par cause,
projections, France/Europe) est regroupé, avec source et date, dans [`data/static.js`](data/static.js) et
affiché dans la page [`sources.html`](sources.html).

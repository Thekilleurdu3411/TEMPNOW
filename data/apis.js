/**
 * API appelées en direct par le site (détails et API écartées : voir API.md).
 * tested : résultat du test effectué le 26/10/2026 depuis l'environnement de développement.
 */
export const APIS = [
  { name: "Open-Meteo Forecast", what: "Météo actuelle + prévisions 7 j de 24 villes, vagues de chaleur", url: "https://api.open-meteo.com/v1/forecast", doc: "https://open-meteo.com/en/docs", tested: "ok" },
  { name: "Open-Meteo Air Quality", what: "Indice européen, PM2,5, PM10, NO₂, O₃, poussières, pollens, UV (CAMS)", url: "https://air-quality-api.open-meteo.com/v1/air-quality", doc: "https://open-meteo.com/en/docs/air-quality-api", tested: "ok" },
  { name: "Open-Meteo Historical (ERA5)", what: "Températures journalières depuis 1950 → bandes locales", url: "https://archive-api.open-meteo.com/v1/archive", doc: "https://open-meteo.com/en/docs/historical-weather-api", tested: "cors" },
  { name: "Open-Meteo Climate (CMIP6)", what: "Projection 1950-2050 pour Périgueux", url: "https://climate-api.open-meteo.com/v1/climate", doc: "https://open-meteo.com/en/docs/climate-api", tested: "ok" },
  { name: "Open-Meteo Flood (GloFAS)", what: "Débits des grands fleuves, 60 j passés + 30 j prévus", url: "https://flood-api.open-meteo.com/v1/flood", doc: "https://open-meteo.com/en/docs/flood-api", tested: "ok" },
  { name: "Open-Meteo Marine", what: "Température de surface de la mer, houle", url: "https://marine-api.open-meteo.com/v1/marine", doc: "https://open-meteo.com/en/docs/marine-weather-api", tested: "ok" },
  { name: "USGS Earthquake Hazards", what: "Séismes M ≥ 4,5 des 7 derniers jours (GeoJSON)", url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", doc: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php", tested: "ok" },
  { name: "NASA EONET v3", what: "Événements naturels ouverts : feux, tempêtes, volcans, glaces…", url: "https://eonet.gsfc.nasa.gov/api/v3/events", doc: "https://eonet.gsfc.nasa.gov/docs/v3", tested: "ok" },
  { name: "GDACS", what: "Alertes catastrophes ONU/Commission européenne (vert/orange/rouge)", url: "https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP", doc: "https://www.gdacs.org/", tested: "ok" },
  { name: "global-warming.org", what: "Séries NASA GISS (températures), NOAA GML (CO₂, CH₄, N₂O), NOAA NCEI (océans), NSIDC (banquise)", url: "https://global-warming.org/api/", doc: "https://global-warming.org/", tested: "ok" },
  { name: "NOAA CO-OPS", what: "Niveau d'eau et marée prédite à New York (The Battery)", url: "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter", doc: "https://api.tidesandcurrents.noaa.gov/api/prod/", tested: "ok" },
  { name: "NOAA NWS (api.weather.gov)", what: "Alertes chaleur actives aux États-Unis", url: "https://api.weather.gov/alerts/active", doc: "https://www.weather.gov/documentation/services-web-api", tested: "ok" },
  { name: "Hub'eau Hydrométrie", what: "Débit et hauteur de l'Isle à Périgueux en temps réel", url: "https://hubeau.eaufrance.fr/api/v2/hydrometrie/observations_tr", doc: "https://hubeau.eaufrance.fr/page/api-hydrometrie", tested: "ok" },
  { name: "UK Carbon Intensity", what: "Intensité carbone et mix électrique de la Grande-Bretagne", url: "https://api.carbonintensity.org.uk/", doc: "https://carbon-intensity.github.io/api-definitions/", tested: "ok" },
  { name: "ODRÉ — éCO2mix (RTE)", what: "Mix électrique et taux de CO₂ de la France", url: "https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/eco2mix-national-tr/records", doc: "https://odre.opendatasoft.com/explore/dataset/eco2mix-national-tr/", tested: "untested" },
  { name: "Esri World Dark Gray Canvas", what: "Fond de carte sombre (tuiles, sans clé)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer", doc: "https://www.arcgis.com/home/item.html?id=358ec1e175ea41c3bf5c68f0da11ae2b", tested: "ok" },
];

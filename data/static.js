/**
 * Statistiques de fond (hors API) — chaque chiffre porte sa source et sa date.
 * Mise à jour de ce fichier : octobre 2026.
 *
 * Structure :
 *   SOURCES : dictionnaire { clé: { org, title, date, url } }
 *   STATS   : groupes thématiques -> liste de chiffres
 *             { id, value, decimals?, prefix?, suffix?, label, detail?, src, date, tone? }
 *   SERIES  : petites séries pour les graphiques statiques (avec src)
 *   RATES   : débits annuels utilisés par les compteurs « depuis l'ouverture »
 */

export const UPDATED = "2026-10-26";

export const SOURCES = {
  c3s_gch2025: {
    org: "Copernicus (C3S/ECMWF)",
    title: "Global Climate Highlights 2025",
    date: "janvier 2026",
    url: "https://climate.copernicus.eu/copernicus-2025-was-third-hottest-year-record",
  },
  c3s_bulletin_2026: {
    org: "Copernicus (C3S/ECMWF)",
    title: "Bulletins climatiques mensuels — août et septembre 2026",
    date: "septembre-octobre 2026",
    url: "https://climate.copernicus.eu/climate-bulletins",
  },
  c3s_esotc2025: {
    org: "Copernicus (C3S) & OMM",
    title: "European State of the Climate 2025",
    date: "29 avril 2026",
    url: "https://climate.copernicus.eu/esotc/2025",
  },
  wmo_sogc2025: {
    org: "OMM (WMO)",
    title: "State of the Global Climate 2025",
    date: "mars 2026",
    url: "https://wmo.int/sites/default/files/2026-03/State%20of%20the%20Climate%202025_1%20pager_final.pdf",
  },
  wmo_ghg21: {
    org: "OMM (WMO)",
    title: "Bulletin sur les gaz à effet de serre n° 21 (données 2024)",
    date: "15 octobre 2025",
    url: "https://wmo.int/media/41825",
  },
  gcp2025: {
    org: "Global Carbon Project",
    title: "Global Carbon Budget 2025",
    date: "13 novembre 2025",
    url: "https://globalcarbonbudget.org/fossil-fuel-co2-emissions-hit-record-high-in-2025/",
  },
  igcc2024: {
    org: "Forster et al. — Indicators of Global Climate Change",
    title: "Indicators of Global Climate Change 2024 (ESSD)",
    date: "juin 2025",
    url: "https://essd.copernicus.org/articles/17/2641/2025/",
  },
  ipcc_ar6: {
    org: "GIEC (IPCC)",
    title: "AR6 — Groupe I, Résumé pour décideurs & Rapport de synthèse",
    date: "2021-2023",
    url: "https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/",
  },
  nsidc_min2025: {
    org: "NSIDC",
    title: "Arctic sea ice has reached minimum extent for 2025",
    date: "17 septembre 2025",
    url: "https://nsidc.org/sea-ice-today/analyses",
  },
  nsidc_max2025: {
    org: "NSIDC",
    title: "Arctic sea ice sets record low maximum in 2025",
    date: "mars 2025",
    url: "https://nsidc.org/sea-ice-today/analyses/arctic-sea-ice-sets-record-low-maximum-2025",
  },
  nasa_icesheets: {
    org: "NASA (GRACE / GRACE-FO)",
    title: "Vital Signs — Ice Sheets (2002-2025)",
    date: "2025",
    url: "https://science.nasa.gov/earth/explore/vital-signs/ice-sheets/",
  },
  nasa_sealevel: {
    org: "NASA",
    title: "Global Mean Sea Level 1993-2025",
    date: "2025",
    url: "https://svs.gsfc.nasa.gov/5611",
  },
  wgms2025: {
    org: "WGMS (World Glacier Monitoring Service)",
    title: "Global glacier mass change in 2025",
    date: "avril 2026",
    url: "https://wgms.ch/ncc_glaciers_in_2025/",
  },
  glamos2025: {
    org: "GLAMOS (Suisse)",
    title: "Swiss glaciers 2025",
    date: "octobre 2025",
    url: "https://www.geo.uzh.ch/en/news/2025/glamos-2025.html",
  },
  munichre2025: {
    org: "Munich Re",
    title: "Natural disaster figures 2025",
    date: "13 janvier 2026",
    url: "https://www.munichre.com/en/risks/natural-disasters.html",
  },
  emdat2025: {
    org: "CRED / EM-DAT (UCLouvain)",
    title: "2025 Disasters in numbers: Earth, wind and fire",
    date: "17 mars 2026",
    url: "https://files.emdat.be/reports/2025_EMDAT_report.pdf",
  },
  noaa_hurr2025: {
    org: "NOAA / NHC",
    title: "2025 Atlantic hurricane season summary",
    date: "2026",
    url: "https://www.nhc.noaa.gov/data/tcr/",
  },
  effis2025: {
    org: "Commission européenne — JRC / EFFIS",
    title: "2025 was the EU's most destructive wildfire season on record",
    date: "31 mars 2026",
    url: "https://joint-research-centre.ec.europa.eu/jrc-news-and-updates/2025-was-eus-most-destructive-wildfire-season-record-2026-03-31_en",
  },
  lancet2025: {
    org: "The Lancet Countdown",
    title: "2025 report on health and climate change",
    date: "29 octobre 2025",
    url: "https://lancetcountdown.org/2025-report/",
  },
  who_air: {
    org: "OMS (WHO)",
    title: "Aide-mémoire — Pollution de l'air ambiant et domestique",
    date: "octobre 2024",
    url: "https://www.who.int/fr/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health",
  },
  who_climate: {
    org: "OMS (WHO)",
    title: "Aide-mémoire — Changement climatique et santé",
    date: "octobre 2023",
    url: "https://www.who.int/fr/news-room/fact-sheets/detail/climate-change-and-health",
  },
  who_malaria2025: {
    org: "OMS (WHO)",
    title: "Rapport sur le paludisme dans le monde 2025",
    date: "décembre 2025",
    url: "https://www.who.int/teams/global-malaria-programme/reports/world-malaria-report-2025",
  },
  who_dengue2024: {
    org: "OMS (WHO)",
    title: "Dengue : situation mondiale — mise à jour 2024 (REH)",
    date: "2025",
    url: "https://www.who.int/publications/i/item/who-wer10052-665-678",
  },
  isglobal2024: {
    org: "ISGlobal — Nature Medicine",
    title: "Heat-related mortality in Europe during summer 2024",
    date: "septembre 2025",
    url: "https://www.isglobal.org/en/-/62.700-muertes-asociadas-con-el-calor-del-verano-de-2024",
  },
  imperial2025: {
    org: "Imperial College London & LSHTM",
    title: "Climate change-driven summer heat caused 16 500 additional deaths across Europe",
    date: "septembre 2025",
    url: "https://www.lshtm.ac.uk/newsevents/news/2025/climate-change-driven-summer-heat-caused-16500-additional-deaths-across-europe",
  },
  spf2025: {
    org: "Santé publique France",
    title: "Chaleur et santé — Bilan de l'été 2025 (édition France hexagonale)",
    date: "26 février 2026",
    url: "https://www.santepubliquefrance.fr/sites/default/files/rdd/document/bullnat_chaleur_bilan_2025.pdf",
  },
  mf2025: {
    org: "Météo-France",
    title: "Bilan climatique de l'année 2025",
    date: "janvier 2026",
    url: "https://meteofrance.fr/sites/meteofrance.fr/files/files/editorial/bilan_climatique_2025-V3.4-web.pdf",
  },
  mf_records: {
    org: "Météo-France",
    title: "Record national de chaleur : 46,0 °C à Vérargues (Hérault), 28 juin 2019",
    date: "2019",
    url: "https://meteofrance.com/actualites-et-dossiers/actualites/climat/canicule-de-juin-2019-un-record-absolu-de-chaleur",
  },
  franceassureurs2025: {
    org: "France Assureurs",
    title: "Coût des événements climatiques 2025",
    date: "25 mars 2026",
    url: "https://www.franceassureurs.fr/",
  },
};

/* ------------------------------------------------------------------ */

export const STATS = {
  temperature: [
    { id: "t2025", value: 1.47, decimals: 2, prefix: "+", suffix: " °C", label: "Anomalie mondiale 2025", detail: "vs 1850-1900 · 3e année la plus chaude (ERA5)", src: "c3s_gch2025", date: "janv. 2026", tone: "hot" },
    { id: "t2024", value: 1.60, decimals: 2, prefix: "+", suffix: " °C", label: "2024, année record", detail: "1re année civile au-dessus de +1,5 °C", src: "c3s_gch2025", date: "janv. 2026", tone: "hot" },
    { id: "t3y", value: 1.5, decimals: 1, prefix: "> +", suffix: " °C", label: "Moyenne 2023-2025", detail: "1re période de 3 ans au-dessus du seuil de Paris", src: "c3s_gch2025", date: "janv. 2026", tone: "hot" },
    { id: "tlong", value: 1.4, decimals: 1, prefix: "≈ +", suffix: " °C", label: "Réchauffement de long terme", detail: "+1,5 °C pourrait être atteint d'ici la fin de la décennie", src: "c3s_gch2025", date: "janv. 2026" },
    { id: "thuman", value: 1.36, decimals: 2, prefix: "+", suffix: " °C", label: "Part due aux activités humaines (2024)", detail: "sur +1,52 °C observés", src: "igcc2024", date: "juin 2025" },
    { id: "tomm", value: 1.43, decimals: 2, prefix: "+", suffix: " °C", label: "2025 selon l'OMM", detail: "moyenne de 6 jeux de données · 2e ou 3e plus chaude", src: "wmo_sogc2025", date: "mars 2026" },
    { id: "taug26", value: 1.65, decimals: 2, prefix: "+", suffix: " °C", label: "Août 2026", detail: "mois le plus chaud jamais mesuré (ex æquo)", src: "c3s_bulletin_2026", date: "sept. 2026", tone: "hot" },
    { id: "tsep26", value: 1.63, decimals: 2, prefix: "+", suffix: " °C", label: "Septembre 2026", detail: "2e septembre le plus chaud · El Niño en renforcement", src: "c3s_bulletin_2026", date: "oct. 2026", tone: "hot" },
  ],
  gases: [
    { id: "co2_2024", value: 423.9, decimals: 1, suffix: " ppm", label: "CO₂ moyen mondial 2024", detail: "+3,5 ppm en un an : hausse record depuis 1957 · ≈ 152 % du préindustriel", src: "wmo_ghg21", date: "oct. 2025", tone: "hot" },
    { id: "ch4_2024", value: 1942, suffix: " ppb", label: "Méthane (CH₄) 2024", detail: "≈ 266 % du niveau préindustriel", src: "wmo_ghg21", date: "oct. 2025" },
    { id: "n2o_2024", value: 338.0, decimals: 1, suffix: " ppb", label: "Protoxyde d'azote (N₂O) 2024", detail: "≈ 125 % du niveau préindustriel", src: "wmo_ghg21", date: "oct. 2025" },
    { id: "co2_2025", value: 425.7, decimals: 1, suffix: " ppm", label: "CO₂ attendu en 2025", detail: "projection du Global Carbon Budget", src: "gcp2025", date: "nov. 2025" },
    { id: "fossil", value: 38.1, decimals: 1, suffix: " Gt", label: "CO₂ fossile émis en 2025", detail: "+1,1 % : record (charbon +0,8 %, pétrole +1 %, gaz +1,3 %)", src: "gcp2025", date: "nov. 2025", tone: "hot" },
    { id: "total", value: 42.2, decimals: 1, suffix: " Gt", label: "CO₂ total émis en 2025", detail: "fossile + usage des terres", src: "gcp2025", date: "nov. 2025" },
    { id: "budget", value: 170, suffix: " Gt", label: "Budget restant pour +1,5 °C", detail: "≈ 4 ans d'émissions au rythme de 2025 (à partir du 1er janv. 2025)", src: "gcp2025", date: "nov. 2025", tone: "hot" },
    { id: "budget_igcc", value: 130, suffix: " Gt", label: "Budget +1,5 °C (estimation IGCC)", detail: "50 % de chances, à partir du 1er janv. 2025 · ≈ 3 ans", src: "igcc2024", date: "juin 2025" },
  ],
  oceans: [
    { id: "ohc", value: 11, suffix: " ZJ/an", label: "Chaleur absorbée par l'océan", detail: "rythme 2005-2025 · ≈ 18 fois la consommation d'énergie humaine", src: "wmo_sogc2025", date: "mars 2026", tone: "hot" },
    { id: "ohc_rec", value: 9, suffix: " ans", label: "Records consécutifs de chaleur océanique", detail: "contenu thermique record en 2025", src: "wmo_sogc2025", date: "mars 2026" },
    { id: "eei", value: 91, prefix: "> ", suffix: " %", label: "Excès de chaleur stocké dans l'océan", detail: "déséquilibre énergétique terrestre au plus haut depuis 65 ans", src: "wmo_sogc2025", date: "mars 2026" },
    { id: "slr_rate", value: 4.75, decimals: 2, suffix: " mm/an", label: "Hausse du niveau marin 2012-2025", detail: "contre 2,65 mm/an en 1993-2011 : accélération", src: "wmo_sogc2025", date: "mars 2026", tone: "hot" },
    { id: "slr_total", value: 10, prefix: "≈ ", suffix: " cm", label: "Montée des mers depuis 1993", detail: "mesure satellitaire (altimétrie)", src: "nasa_sealevel", date: "2025" },
    { id: "ph", value: -0.017, decimals: 3, suffix: " pH/déc.", label: "Acidification de surface", detail: "tendance 1985-2025", src: "wmo_sogc2025", date: "mars 2026", tone: "cold" },
    { id: "sst26", value: 21.05, decimals: 2, suffix: " °C", label: "Surface des océans, sept. 2026", detail: "record pour un mois de septembre (60°S-60°N)", src: "c3s_bulletin_2026", date: "oct. 2026", tone: "hot" },
    { id: "ar6_slr", value: 1.01, decimals: 2, prefix: "jusqu'à ", suffix: " m", label: "Montée des mers en 2100 (scénario fort)", detail: "SSP5-8.5 : 0,63-1,01 m · SSP1-2.6 : 0,32-0,62 m (vs 1995-2014)", src: "ipcc_ar6", date: "2021" },
  ],
  ice: [
    { id: "glaciers", value: 408, suffix: " Gt", label: "Glace perdue par les glaciers en 2025", detail: "2e pire année · ≈ 1,1 mm de hausse des mers", src: "wgms2025", date: "avr. 2026", tone: "hot" },
    { id: "glaciers_cum", value: 9583, suffix: " Gt", label: "Pertes cumulées des glaciers depuis 1975", detail: "≈ 26,4 mm de hausse du niveau marin", src: "wgms2025", date: "avr. 2026" },
    { id: "greenland", value: 264, suffix: " Gt/an", label: "Perte du Groenland", detail: "moyenne 2002-2025 · ≈ 0,8 mm/an", src: "nasa_icesheets", date: "2025" },
    { id: "antarctica", value: 135, suffix: " Gt/an", label: "Perte de l'Antarctique", detail: "moyenne 2002-2025 · ≈ 0,4 mm/an", src: "nasa_icesheets", date: "2025" },
    { id: "arcmax", value: 14.33, decimals: 2, suffix: " M km²", label: "Maximum arctique 2025", detail: "plus faible maximum en 47 ans de satellite", src: "nsidc_max2025", date: "mars 2025", tone: "cold" },
    { id: "arcmin", value: 4.60, decimals: 2, suffix: " M km²", label: "Minimum arctique 2025", detail: "10e plus bas · les 19 derniers étés = les 19 plus bas", src: "nsidc_min2025", date: "sept. 2025", tone: "cold" },
    { id: "swiss", value: 24, prefix: "−", suffix: " %", label: "Volume des glaciers suisses 2015-2025", detail: "−3 % rien qu'en 2025 · plus de 1 000 petits glaciers disparus", src: "glamos2025", date: "oct. 2025" },
    { id: "wgmsref", value: -1.3, decimals: 1, suffix: " m éq. eau", label: "Bilan des glaciers de référence 2025", detail: "≈ 450 Gt : perte nominale record depuis 1950", src: "wmo_sogc2025", date: "mars 2026" },
  ],
  disasters: [
    { id: "mr_total", value: 224, prefix: "", suffix: " Md$", label: "Pertes économiques 2025", detail: "catastrophes naturelles dans le monde", src: "munichre2025", date: "janv. 2026", tone: "hot" },
    { id: "mr_ins", value: 108, suffix: " Md$", label: "Pertes assurées 2025", detail: "> 100 Md$ pour la 2e année consécutive", src: "munichre2025", date: "janv. 2026" },
    { id: "mr_deaths", value: 17200, suffix: "", label: "Morts dans des catastrophes en 2025", detail: "≈ 11 000 en 2024 · moyenne 30 ans : 41 900", src: "munichre2025", date: "janv. 2026", tone: "hot" },
    { id: "la", value: 53, suffix: " Md$", label: "Incendies de Los Angeles (janv. 2025)", detail: "catastrophe la plus coûteuse de 2025 · ≈ 40 Md$ assurés", src: "munichre2025", date: "janv. 2026" },
    { id: "emdat_n", value: 358, suffix: "", label: "Catastrophes recensées en 2025", detail: "16 607 morts · 110,2 M de personnes touchées", src: "emdat2025", date: "mars 2026" },
    { id: "emdat_cost", value: 169.7, decimals: 1, suffix: " Md$", label: "Pertes économiques (EM-DAT)", detail: "méthodologie différente de Munich Re", src: "emdat2025", date: "mars 2026" },
  ],
  extremes: [
    { id: "melissa", value: 305, suffix: " km/h", label: "Ouragan Melissa (cat. 5)", detail: "vents record ex æquo dans l'Atlantique · Jamaïque, 28 oct. 2025", src: "noaa_hurr2025", date: "2026", tone: "hot" },
    { id: "effis", value: 1079538, suffix: " ha", label: "Brûlés dans l'UE en 2025", detail: "record EFFIS depuis 2006 · ≈ la superficie de Chypre", src: "effis2025", date: "mars 2026", tone: "hot" },
    { id: "effis_es", value: 401266, suffix: " ha", label: "Brûlés en Espagne en 2025", detail: "record national · Portugal : 284 012 ha", src: "effis2025", date: "mars 2026" },
    { id: "effis_eu", value: 2242195, suffix: " ha", label: "Brûlés en Europe élargie + MENA", detail: "dont Ukraine : 659 853 ha", src: "effis2025", date: "mars 2026" },
    { id: "smoke", value: 154000, suffix: "", label: "Morts dus aux fumées de feux (2024)", detail: "record · +36 % vs 2003-2012", src: "lancet2025", date: "oct. 2025" },
    { id: "food", value: 123.7, decimals: 1, suffix: " M", label: "Personnes en insécurité alimentaire en plus", detail: "liées aux sécheresses et vagues de chaleur (2023 vs 1981-2010)", src: "lancet2025", date: "oct. 2025" },
  ],
  health: [
    { id: "heat", value: 546000, suffix: "", label: "Décès liés à la chaleur par an", detail: "moyenne 2012-2021 · +23 % depuis les années 1990", src: "lancet2025", date: "oct. 2025", tone: "hot" },
    { id: "airall", value: 6.7, decimals: 1, suffix: " M", label: "Décès par pollution de l'air / an", detail: "air ambiant (4,2 M) + domestique (3,2 M), effets combinés", src: "who_air", date: "oct. 2024", tone: "hot" },
    { id: "fossil_air", value: 2.5, decimals: 1, suffix: " M", label: "Décès dus à la pollution des énergies fossiles", detail: "par an", src: "lancet2025", date: "oct. 2025" },
    { id: "malaria", value: 610000, suffix: "", label: "Décès du paludisme en 2024", detail: "282 M de cas · 95 % des décès en Afrique", src: "who_malaria2025", date: "déc. 2025" },
    { id: "dengue", value: 14.4, decimals: 1, suffix: " M", label: "Cas de dengue en 2024", detail: "record historique · 11 201 décès signalés", src: "who_dengue2024", date: "2025" },
    { id: "labour", value: 640, suffix: " Md h", label: "Heures de travail perdues (chaleur, 2024)", detail: "≈ 1 090 Md$ de revenus, ≈ 1 % du PIB mondial", src: "lancet2025", date: "oct. 2025" },
    { id: "who250", value: 250000, suffix: "", label: "Décès supplémentaires / an projetés", detail: "2030-2050 : malnutrition, paludisme, diarrhée, stress thermique", src: "who_climate", date: "2023", tone: "hot" },
    { id: "who36", value: 3.6, decimals: 1, suffix: " Md", label: "Personnes très vulnérables au climat", detail: "vivent dans des zones très exposées", src: "who_climate", date: "2023" },
  ],
  france: [
    { id: "fr_t", value: 14.0, decimals: 1, suffix: " °C", label: "Température moyenne France 2025", detail: "+1,0 °C vs 1991-2020 · 4e année la plus chaude depuis 1900", src: "mf2025", date: "janv. 2026", tone: "hot" },
    { id: "fr_summer", value: 1.9, decimals: 1, prefix: "+", suffix: " °C", label: "Été 2025 en France", detail: "3e été le plus chaud après 2003 et 2022", src: "mf2025", date: "janv. 2026", tone: "hot" },
    { id: "fr_rec", value: 10, prefix: "×", suffix: "", label: "Records chauds vs records froids (2025)", detail: "10 fois plus de records de chaleur", src: "mf2025", date: "janv. 2026" },
    { id: "fr_heat", value: 5700, prefix: "> ", suffix: "", label: "Décès attribuables à la chaleur (été 2025)", detail: "> 3 % de la mortalité · dont > 1 900 pendant les canicules · ¾ ont 75 ans et +", src: "spf2025", date: "févr. 2026", tone: "hot" },
    { id: "fr_cc", value: 1444, suffix: "", label: "Décès estivaux 2025 dus au changement climatique (villes FR)", detail: "estimation rapide, non revue par les pairs", src: "imperial2025", date: "sept. 2025" },
    { id: "fr_cost", value: 5.2, decimals: 1, suffix: " Md€", label: "Coût des sinistres climatiques 2025", detail: "dont grêle 2,2 Md€ · 9e année la plus coûteuse depuis 1982", src: "franceassureurs2025", date: "mars 2026" },
    { id: "fr_record", value: 46.0, decimals: 1, suffix: " °C", label: "Record absolu de chaleur en France", detail: "Vérargues (Hérault), 28 juin 2019", src: "mf_records", date: "2019", tone: "hot" },
    { id: "eu_heat24", value: 62775, suffix: "", label: "Décès liés à la chaleur en Europe, été 2024", detail: "intervalle 35 000-85 000 · 181 000 sur 2022-2024", src: "isglobal2024", date: "sept. 2025" },
    { id: "eu_heat25", value: 24400, suffix: "", label: "Décès liés à la chaleur, été 2025 (854 villes)", detail: "dont ≈ 16 500 (68 %) attribuables au réchauffement", src: "imperial2025", date: "sept. 2025" },
  ],
};

/* Séries pour graphiques statiques ---------------------------------- */
export const SERIES = {
  disasterLossesByRegion: {
    src: "munichre2025", date: "janv. 2026", unit: "Md$",
    labels: ["États-Unis", "Asie-Pacifique", "Europe", "Afrique"],
    total: [118, 73, 11, 3],
    insured: [88, 9, null, null],
  },
  disasterDeaths: {
    src: "munichre2025", date: "janv. 2026",
    labels: ["2024", "2025", "Moy. 10 ans", "Moy. 30 ans"],
    values: [11000, 17200, 17800, 41900],
  },
  disasterLossesYears: {
    src: "munichre2025", date: "janv. 2026", unit: "Md$ (valeur 2025)",
    labels: ["2024", "2025"],
    total: [368, 224],
    insured: [147, 108],
  },
  healthByCause: {
    src: "who_air, lancet2025, who_malaria2025, who_dengue2024", date: "2024-2025",
    labels: ["Pollution de l'air (toutes sources)", "Pollution fossile", "Paludisme (2024)", "Chaleur", "Fumées de feux (2024)", "Dengue (2024, signalés)"],
    values: [6700000, 2500000, 610000, 546000, 154000, 11201],
    srcs: ["who_air", "lancet2025", "who_malaria2025", "lancet2025", "lancet2025", "who_dengue2024"],
  },
  ar6Warming: {
    src: "ipcc_ar6", date: "2021",
    labels: ["SSP1-1.9", "SSP1-2.6", "SSP2-4.5", "SSP3-7.0", "SSP5-8.5"],
    best: [1.4, 1.8, 2.7, 3.6, 4.4],
    low: [1.0, 1.3, 2.1, 2.8, 3.3],
    high: [1.8, 2.4, 3.5, 4.6, 5.7],
  },
  europeHeatDeaths: {
    src: "isglobal2024", date: "sept. 2025",
    labels: ["Été 2022", "Été 2023", "Été 2024"],
    values: [67873, 50798, 62775],
  },
  franceRegionsHeat2025: {
    src: "spf2025", date: "févr. 2026",
    labels: ["Auvergne-Rhône-Alpes", "Occitanie", "Nouvelle-Aquitaine", "PACA", "Île-de-France", "Grand Est", "Hauts-de-France"],
    values: [779, 745, 724, 712, 557, 454, 368],
  },
  euFires2025: {
    src: "effis2025", date: "mars 2026",
    labels: ["Espagne", "Portugal", "Reste de l'UE"],
    values: [401266, 284012, 1079538 - 401266 - 284012],
  },
};

/* Débits annuels pour les compteurs « depuis l'ouverture » ---------- */
const YEAR_S = 365.25 * 24 * 3600;
export const RATES = [
  { id: "co2", label: "tonnes de CO₂ émises", perSecond: 42.2e9 / YEAR_S, decimals: 0, src: "gcp2025", note: "42,2 Gt/an (2025)", tone: "hot" },
  { id: "ice", label: "tonnes de glace fondues", perSecond: (408 + 264 + 135) * 1e9 / YEAR_S, decimals: 0, src: "wgms2025", note: "glaciers 408 + Groenland 264 + Antarctique 135 Gt/an", tone: "cold" },
  { id: "ocean", label: "« bombes d'Hiroshima » de chaleur dans l'océan", perSecond: 11e21 / YEAR_S / 6.3e13, decimals: 0, src: "wmo_sogc2025", note: "11 ZJ/an ; 1 bombe ≈ 6,3×10¹³ J", tone: "hot" },
  { id: "air", label: "décès dus à la pollution de l'air", perSecond: 6.7e6 / YEAR_S, decimals: 0, src: "who_air", note: "6,7 M/an", tone: "hot" },
  { id: "heat", label: "décès liés à la chaleur", perSecond: 546000 / YEAR_S, decimals: 1, src: "lancet2025", note: "546 000/an", tone: "hot" },
  { id: "cost", label: "dollars de dégâts de catastrophes", perSecond: 224e9 / YEAR_S, decimals: 0, src: "munichre2025", note: "224 Md$/an (2025)", tone: "hot" },
];

/* Budget carbone : 170 Gt au 1er janvier 2025, 42,2 Gt/an */
export const CARBON_BUDGET = {
  startGt: 170, startDate: "2025-01-01T00:00:00Z", gtPerYear: 42.2, src: "gcp2025",
};

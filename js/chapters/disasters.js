/**
 * Chapitre Catastrophes : carte mondiale zoomable (Leaflet) alimentée en direct par
 * USGS (séismes), NASA EONET (feux, tempêtes, volcans…) et GDACS (alertes ONU/UE),
 * + chiffres de fond Munich Re / EM-DAT.
 */
import { liveBlock } from "../core/live.js";
import { getJSON } from "../core/fetcher.js";
import { fmt, dateTime, ago, esc, compact } from "../core/format.js";
import { chart, C, axisTitle } from "../core/charts.js";
import { SERIES } from "../../data/static.js";
import { srcLink } from "../core/stats.js";
import { tempColor } from "./cities.js";

let map = null;
const layers = {};

function getMap() {
  if (map) return map;
  const el = document.getElementById("disaster-map");
  if (!el || !window.L) {
    if (el) el.innerHTML = '<p class="muted pad">Carte indisponible (bibliothèque Leaflet non chargée).</p>';
    return null;
  }
  const L = window.L;
  map = L.map(el, { worldCopyJump: true, minZoom: 1, maxZoom: 10, scrollWheelZoom: false }).setView([20, 10], el.clientWidth < 700 ? 1 : 2);
  // Fond Esri « Dark Gray Canvas » (sans clé) + couche de noms par-dessus
  const esri = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/";
  const attribution = 'Fond &copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; contributeurs OpenStreetMap';
  L.tileLayer(esri + "World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", { attribution, maxZoom: 16 }).addTo(map);
  const labels = map.createPane("labels");
  labels.style.zIndex = 350; // au-dessus du fond, sous les marqueurs
  labels.style.pointerEvents = "none";
  L.tileLayer(esri + "World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, pane: "labels", opacity: 0.8 }).addTo(map);
  ["quakes", "eonet", "gdacs", "cities"].forEach((k) => (layers[k] = L.layerGroup()));
  layers.quakes.addTo(map);
  layers.eonet.addTo(map);
  layers.gdacs.addTo(map);
  L.control
    .layers(null, {
      "Séismes (USGS)": layers.quakes,
      "Événements naturels (NASA EONET)": layers.eonet,
      "Alertes GDACS": layers.gdacs,
      "Villes : température": layers.cities,
    }, { collapsed: true })
    .addTo(map);
  // Défilement de la page préservé : la molette ne zoome qu'après un clic sur la carte
  map.on("click", () => map.scrollWheelZoom.enable());
  map.on("mouseout", () => map.scrollWheelZoom.disable());
  new ResizeObserver(() => map.invalidateSize()).observe(el);
  return map;
}

/* ---------- EONET ---------- */
const EONET_CAT = {
  wildfires: ["Feux", "🔥", "#ff5a36"],
  severeStorms: ["Tempêtes", "🌀", "#b18cff"],
  volcanoes: ["Volcans", "🌋", "#ffb020"],
  seaLakeIce: ["Glaces", "🧊", "#7fd1ff"],
  floods: ["Inondations", "🌊", "#3fa7ff"],
  drought: ["Sécheresse", "🏜️", "#d9a35f"],
  dustHaze: ["Poussières", "🌫️", "#bfae8f"],
  landslides: ["Glissements", "⛰️", "#a3836b"],
  snow: ["Neige", "❄️", "#e8edf2"],
  tempExtremes: ["Températures extrêmes", "🌡️", "#ef3b2c"],
  earthquakes: ["Séismes", "📳", "#ffd166"],
  manmade: ["Origine humaine", "🏭", "#9aa7b4"],
  waterColor: ["Couleur de l'eau", "🟢", "#3ddc97"],
};

const GDACS_TYPE = { EQ: "Séisme", TC: "Cyclone", FL: "Inondation", VO: "Volcan", DR: "Sécheresse", WF: "Feu de forêt", TS: "Tsunami" };
const GDACS_COLOR = { Green: "#3ddc97", Orange: "#ffb020", Red: "#ff3b30" };

export function init() {
  // Séismes ---------------------------------------------------------------
  liveBlock(document.getElementById("quakes-live"), {
    source: "USGS Earthquake Hazards",
    sourceUrl: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php",
    interval: 5 * 60e3,
    load: () => getJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"),
    render: (data, body) => {
      const feats = data.features || [];
      const m = getMap();
      if (m) {
        layers.quakes.clearLayers();
        feats.forEach((f) => {
          const [lon, lat, depth] = f.geometry.coordinates;
          const p = f.properties;
          const ageH = (Date.now() - p.time) / 36e5;
          window.L.circleMarker([lat, lon], {
            radius: Math.max(3, Math.pow(2, p.mag - 3.6)),
            color: ageH < 24 ? "#ffd166" : "#ff8a3d",
            weight: 1,
            fillOpacity: ageH < 24 ? 0.65 : 0.3,
          })
            .bindPopup(`<strong>M ${fmt(p.mag, 1)}</strong> — ${esc(p.place)}<br>${dateTime(p.time)} (${ago(p.time)})<br>Profondeur : ${fmt(depth, 0)} km${p.tsunami ? "<br>⚠️ Alerte tsunami émise" : ""}<br><a href="${esc(p.url)}" target="_blank" rel="noopener">Fiche USGS</a>`)
            .addTo(layers.quakes);
        });
      }
      const top = [...feats].sort((a, b) => b.properties.mag - a.properties.mag).slice(0, 8);
      const n6 = feats.filter((f) => f.properties.mag >= 6).length;
      body.querySelector(".kpis").innerHTML = `
        <div><strong>${feats.length}</strong><span>séismes M ≥ 4,5 en 7 jours</span></div>
        <div><strong>${n6}</strong><span>de magnitude ≥ 6</span></div>
        <div><strong>${fmt(top[0]?.properties.mag, 1)}</strong><span>magnitude max.</span></div>`;
      body.querySelector(".event-list").innerHTML = top
        .map((f) => `<li><span class="badge mag">M ${fmt(f.properties.mag, 1)}</span> ${esc(f.properties.place)} <span class="muted small">${ago(f.properties.time)}</span></li>`)
        .join("");
      return { observedAt: data.metadata?.generated };
    },
  });

  // EONET -----------------------------------------------------------------
  liveBlock(document.getElementById("eonet-live"), {
    source: "NASA EONET v3",
    sourceUrl: "https://eonet.gsfc.nasa.gov/docs/v3",
    load: () => getJSON("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=60", { timeout: 25000 }),
    render: (data, body) => {
      const evs = data.events || [];
      const m = getMap();
      const counts = {};
      if (m) layers.eonet.clearLayers();
      evs.forEach((ev) => {
        const cat = ev.categories?.[0]?.id;
        counts[cat] = (counts[cat] || 0) + 1;
        if (!m) return;
        const [label, icon, color] = EONET_CAT[cat] || ["Autre", "•", "#9aa7b4"];
        const geo = ev.geometry || [];
        const lastG = geo.at(-1);
        if (!lastG || lastG.type !== "Point") return;
        const [lon, lat] = lastG.coordinates;
        if (geo.length > 1 && cat === "severeStorms") {
          window.L.polyline(geo.filter((g) => g.type === "Point").map((g) => [g.coordinates[1], g.coordinates[0]]), { color, weight: 1.5, opacity: 0.7 }).addTo(layers.eonet);
        }
        const mag = lastG.magnitudeValue ? `<br>${fmt(lastG.magnitudeValue, 0)} ${esc(lastG.magnitudeUnit || "")}` : "";
        window.L.marker([lat, lon], {
          icon: window.L.divIcon({ className: "eonet-icon", html: `<span style="--c:${color}">${icon}</span>`, iconSize: [22, 22] }),
          title: ev.title,
        })
          .bindPopup(`<strong>${esc(ev.title)}</strong><br>${label} · ${dateTime(lastG.date)}${mag}<br><a href="${esc(ev.sources?.[0]?.url || ev.link)}" target="_blank" rel="noopener">Source</a>`)
          .addTo(layers.eonet);
      });
      body.querySelector(".cat-list").innerHTML = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => {
          const [label, icon, color] = EONET_CAT[k] || [k, "•", "#9aa7b4"];
          return `<li style="--c:${color}"><span class="ic">${icon}</span><span class="name">${esc(label)}</span><strong>${n}</strong></li>`;
        })
        .join("");
      body.closest(".live").querySelector(".total").textContent = fmt(evs.length);
      const latest = evs.map((e) => e.geometry?.at(-1)?.date).filter(Boolean).sort().at(-1);
      return { observedAt: latest };
    },
  });

  // GDACS -----------------------------------------------------------------
  liveBlock(document.getElementById("gdacs-live"), {
    source: "GDACS (ONU / Commission européenne)",
    sourceUrl: "https://www.gdacs.org/",
    load: () => getJSON("https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP", { timeout: 25000 }),
    render: (data, body) => {
      const feats = (data.features || []).filter((f) => f.geometry?.type === "Point");
      const m = getMap();
      if (m) layers.gdacs.clearLayers();
      feats.forEach((f) => {
        const p = f.properties;
        if (!m) return;
        const [lon, lat] = f.geometry.coordinates;
        window.L.circleMarker([lat, lon], { radius: p.alertlevel === "Red" ? 11 : p.alertlevel === "Orange" ? 8 : 5, color: GDACS_COLOR[p.alertlevel] || "#9aa7b4", weight: 2, fillOpacity: 0.15, dashArray: "3 3" })
          .bindPopup(`<strong>${esc(GDACS_TYPE[p.eventtype] || p.eventtype)} — alerte ${esc(p.alertlevel)}</strong><br>${esc(p.name)}<br>${esc(p.severitydata?.severitytext || "")}<br>Du ${dateTime(p.fromdate + "Z")} au ${dateTime(p.todate + "Z")}<br><a href="${esc(p.url?.report)}" target="_blank" rel="noopener">Rapport GDACS</a>`)
          .addTo(layers.gdacs);
      });
      const rank = { Red: 0, Orange: 1, Green: 2 };
      const list = [...feats].sort((a, b) => rank[a.properties.alertlevel] - rank[b.properties.alertlevel] || b.properties.fromdate.localeCompare(a.properties.fromdate)).slice(0, 8);
      const byLevel = (l) => feats.filter((f) => f.properties.alertlevel === l).length;
      body.querySelector(".kpis").innerHTML = `
        <div class="red"><strong>${byLevel("Red")}</strong><span>alertes rouges</span></div>
        <div class="orange"><strong>${byLevel("Orange")}</strong><span>alertes orange</span></div>
        <div><strong>${byLevel("Green")}</strong><span>alertes vertes</span></div>`;
      body.querySelector(".event-list").innerHTML = list
        .map((f) => {
          const p = f.properties;
          return `<li><span class="badge lvl-${esc(p.alertlevel)}">${esc(GDACS_TYPE[p.eventtype] || p.eventtype)}</span> ${esc(p.name)} <span class="muted small">${ago(p.fromdate + "Z")}</span></li>`;
        })
        .join("");
      const latest = feats.map((f) => f.properties.datemodified).filter(Boolean).sort().at(-1);
      return { observedAt: latest ? latest + "Z" : null };
    },
  });

  // Villes (données publiées par le chapitre Météo) -------------------------
  window.addEventListener("tempnow:cities", (e) => {
    const m = getMap();
    if (!m) return;
    layers.cities.clearLayers();
    e.detail.forEach((c) => {
      window.L.marker([c.lat, c.lon], {
        icon: window.L.divIcon({ className: "city-temp", html: `<span style="background:${tempColor(c.temp)}">${fmt(c.temp, 0)}°</span>`, iconSize: [34, 20] }),
        title: c.name,
      })
        .bindPopup(`<strong>${esc(c.name)}</strong><br>${fmt(c.temp, 1)} °C (ressenti ${fmt(c.feels, 1)} °C)`)
        .addTo(layers.cities);
    });
  });

  // Chiffres de fond -------------------------------------------------------
  const r = SERIES.disasterLossesByRegion;
  chart(document.getElementById("losses-region"), {
    type: "bar",
    data: {
      labels: r.labels,
      datasets: [
        { label: "Pertes totales (Md$)", data: r.total, backgroundColor: C.hot },
        { label: "dont assurées (Md$)", data: r.insured, backgroundColor: C.cold },
      ],
    },
    options: { scales: { y: { title: axisTitle("milliards $") }, x: { grid: { display: false } } }, plugins: { legend: { position: "bottom" } } },
  });
  const d = SERIES.disasterDeaths;
  chart(document.getElementById("disaster-deaths"), {
    type: "bar",
    data: { labels: d.labels, datasets: [{ label: "Morts", data: d.values, backgroundColor: [C.muted, C.hot, "rgba(255,176,32,.6)", "rgba(255,176,32,.35)"] }] },
    options: { scales: { y: { ticks: { callback: (v) => compact(v) } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } },
  });
  const y = SERIES.disasterLossesYears;
  chart(document.getElementById("losses-years"), {
    type: "bar",
    data: {
      labels: y.labels,
      datasets: [
        { label: "Pertes totales (Md$)", data: y.total, backgroundColor: C.hot },
        { label: "Pertes assurées (Md$)", data: y.insured, backgroundColor: C.cold },
      ],
    },
    options: { scales: { y: { title: axisTitle("Md$ (valeur 2025)") }, x: { grid: { display: false } } }, plugins: { legend: { position: "bottom" } } },
  });
  document.querySelectorAll("[data-src-of]").forEach((el) => {
    const s = SERIES[el.dataset.srcOf];
    if (s) el.innerHTML = s.src.split(",").map((k) => srcLink(k.trim(), s.date)).join(" ");
  });
}

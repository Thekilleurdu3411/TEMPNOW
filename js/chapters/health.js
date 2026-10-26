/**
 * Chapitre Santé : mortalité par cause (chiffres OMS / Lancet), projections, et
 * expositions du jour à Périgueux (pollens, UV, qualité de l'air — en direct).
 */
import { liveBlock } from "../core/live.js";
import { getJSON } from "../core/fetcher.js";
import { chart, C } from "../core/charts.js";
import { fmt, esc, compact } from "../core/format.js";
import { SERIES, SOURCES } from "../../data/static.js";
import { eaqiClass } from "./cities.js";

const POLLENS = [
  ["grass_pollen", "Graminées"],
  ["birch_pollen", "Bouleau"],
  ["alder_pollen", "Aulne"],
  ["olive_pollen", "Olivier"],
  ["mugwort_pollen", "Armoise"],
  ["ragweed_pollen", "Ambroisie"],
];

function pollenLevel(v) {
  if (v == null) return ["—", "q0"];
  if (v < 1) return ["Nul", "q1"];
  if (v < 20) return ["Faible", "q2"];
  if (v < 80) return ["Moyen", "q3"];
  if (v < 200) return ["Élevé", "q4"];
  return ["Très élevé", "q5"];
}

function uvLevel(v) {
  if (v == null) return "—";
  if (v < 3) return "faible";
  if (v < 6) return "modéré";
  if (v < 8) return "élevé";
  if (v < 11) return "très élevé";
  return "extrême";
}

export function init() {
  const s = SERIES.healthByCause;
  chart(document.getElementById("health-cause"), {
    type: "bar",
    data: {
      labels: s.labels,
      datasets: [{ label: "Décès par an", data: s.values, backgroundColor: [C.hot, "#ef3b2c", C.hot2, "#fc9272", "#a3836b", C.cold2], borderRadius: 3 }],
    },
    options: {
      indexAxis: "y",
      scales: { x: { type: "logarithmic", ticks: { callback: (v) => ([1e4, 1e5, 1e6, 1e7].includes(v) ? compact(v) : "") } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `${fmt(c.parsed.x)} décès · ${SOURCES[s.srcs[c.dataIndex]].org}` } },
      },
    },
  });

  liveBlock(document.getElementById("perigueux-health"), {
    source: "Open-Meteo Air Quality (Copernicus CAMS)",
    sourceUrl: "https://open-meteo.com/en/docs/air-quality-api",
    load: () =>
      getJSON(
        "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=45.184&longitude=0.7218&timezone=Europe%2FParis" +
          "&current=european_aqi,pm2_5,ozone,uv_index," + POLLENS.map((p) => p[0]).join(",") +
          "&hourly=uv_index&forecast_days=1"
      ),
    render: (data, body) => {
      const c = data.current || {};
      const [aqiLbl, aqiCls] = eaqiClass(c.european_aqi);
      const uvMax = Math.max(...(data.hourly?.uv_index || []).filter((v) => v != null));
      body.querySelector(".exposure").innerHTML = `
        <li><span>Qualité de l'air (indice européen)</span><strong class="aqi ${aqiCls}">${fmt(c.european_aqi, 0)} · ${aqiLbl}</strong></li>
        <li><span>Particules fines PM2,5</span><strong>${fmt(c.pm2_5, 1)} µg/m³</strong></li>
        <li><span>Ozone</span><strong>${fmt(c.ozone, 0)} µg/m³</strong></li>
        <li><span>UV maintenant / max. du jour</span><strong>${fmt(c.uv_index, 1)} / ${fmt(uvMax, 1)} (${uvLevel(uvMax)})</strong></li>
        ${POLLENS.map(([k, name]) => {
          const [lbl, cls] = pollenLevel(c[k]);
          return `<li><span>Pollen — ${esc(name)}</span><strong class="aqi ${cls}">${c[k] == null ? "—" : fmt(c[k], 0) + " grains/m³ · " + lbl}</strong></li>`;
        }).join("")}`;
      return { observedAt: c.time ? new Date(Date.parse(c.time + "Z") - (data.utc_offset_seconds || 0) * 1000) : null };
    },
  });
}

/**
 * Chapitre Rivières & crues : l'Isle à Périgueux en temps réel (Hub'eau, Vigicrues/
 * SCHAPI) et débits des grands fleuves du monde (Open-Meteo Flood / GloFAS).
 */
import { liveBlock } from "../core/live.js";
import { getJSON } from "../core/fetcher.js";
import { chart, C, axisTitle } from "../core/charts.js";
import { fmt, signed, esc, dateTime, dateLong } from "../core/format.js";

const STATION = "P704151001"; // L'Isle à Périgueux

// Coordonnées calées sur la maille GloFAS du fleuve (vérifiées)
const RIVERS = [
  { name: "Seine à Paris", lat: 48.9, lon: 2.25 },
  { name: "Loire à Nantes", lat: 47.225, lon: -1.575 },
  { name: "Garonne à Bordeaux", lat: 44.825, lon: -0.575 },
  { name: "Rhône à Beaucaire", lat: 43.71, lon: 4.59 },
  { name: "Rhin à Cologne", lat: 50.84, lon: 6.96 },
  { name: "Danube à Vienne", lat: 48.225, lon: 16.375 },
  { name: "Mississippi à Saint-Louis", lat: 38.58, lon: -90.28 },
  { name: "Gange à Patna", lat: 25.625, lon: 85.125 },
  { name: "Amazone à Óbidos", lat: -2.02, lon: -55.46 },
];

export function init() {
  liveBlock(document.getElementById("isle-live"), {
    source: "Hub'eau — Hydrométrie (SCHAPI / Vigicrues)",
    sourceUrl: "https://hubeau.eaufrance.fr/page/api-hydrometrie",
    interval: 15 * 60e3,
    load: async () => {
      const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 19) + "Z";
      const base = `https://hubeau.eaufrance.fr/api/v2/hydrometrie/observations_tr?code_entite=${STATION}&date_debut_obs=${since}&size=5000&sort=asc&fields=date_obs,resultat_obs,grandeur_hydro&timestep=60`;
      const [q, h] = await Promise.all([getJSON(base + "&grandeur_hydro=Q"), getJSON(base + "&grandeur_hydro=H")]);
      // L'ordre renvoyé n'est pas garanti : tri chronologique côté client
      const byDate = (a, b) => a.date_obs.localeCompare(b.date_obs);
      return { data: { q: (q.data.data || []).sort(byDate), h: (h.data.data || []).sort(byDate) }, fetchedAt: q.fetchedAt };
    },
    render: ({ q, h }, body) => {
      if (!q.length && !h.length) throw new Error("aucune mesure récente");
      const hMap = new Map(h.map((o) => [o.date_obs, o.resultat_obs]));
      const pts = q.length ? q : h;
      chart(body.querySelector("canvas"), {
        type: "line",
        data: {
          labels: pts.map((o) => dateTime(o.date_obs)),
          datasets: [
            { label: "Débit (m³/s)", data: q.map((o) => o.resultat_obs / 1000), borderColor: C.cold, backgroundColor: "rgba(63,167,255,.15)", fill: true, yAxisID: "y" },
            { label: "Hauteur (m)", data: pts.map((o) => (hMap.has(o.date_obs) ? hMap.get(o.date_obs) / 1000 : null)), borderColor: C.hot2, borderDash: [4, 3], borderWidth: 1.5, yAxisID: "y1", spanGaps: true },
          ],
        },
        options: {
          scales: {
            x: { ticks: { maxTicksLimit: 6 }, grid: { display: false } },
            y: { title: axisTitle("m³/s"), position: "left" },
            y1: { title: axisTitle("m"), position: "right", grid: { display: false } },
          },
          plugins: { legend: { position: "bottom" } },
        },
      });
      const lq = q.at(-1);
      const lh = h.at(-1);
      const first = q[0];
      const trend = lq && first ? lq.resultat_obs / 1000 - first.resultat_obs / 1000 : null;
      body.querySelector(".kpis").innerHTML = `
        <div><strong>${lq ? fmt(lq.resultat_obs / 1000, 2) : "—"}</strong><span>m³/s (débit)</span></div>
        <div><strong>${lh ? fmt(lh.resultat_obs / 1000, 2) : "—"}</strong><span>m (hauteur)</span></div>
        <div><strong>${trend != null ? signed(trend, 2) : "—"}</strong><span>m³/s en 7 jours</span></div>`;
      return { observedAt: (lq || lh)?.date_obs };
    },
  });

  liveBlock(document.getElementById("rivers-live"), {
    source: "Open-Meteo Flood API (Copernicus GloFAS)",
    sourceUrl: "https://open-meteo.com/en/docs/flood-api",
    load: () =>
      getJSON(
        `https://flood-api.open-meteo.com/v1/flood?latitude=${RIVERS.map((r) => r.lat).join(",")}&longitude=${RIVERS.map((r) => r.lon).join(",")}&daily=river_discharge,river_discharge_max&past_days=60&forecast_days=30`,
        { timeout: 25000 }
      ),
    render: (data, body) => {
      const arr = Array.isArray(data) ? data : [data];
      const today = new Date().toISOString().slice(0, 10);
      body.querySelector(".river-grid").innerHTML = arr
        .map((d, i) => {
          const t = d.daily.time;
          const q = d.daily.river_discharge;
          const idx = Math.max(0, t.indexOf(today));
          const past = q.slice(0, idx).filter((v) => v != null);
          const mean = past.reduce((a, b) => a + b, 0) / (past.length || 1);
          const now = q[idx];
          const peak = Math.max(...q.slice(idx).filter((v) => v != null));
          const ratio = now / mean;
          const max = Math.max(...q.filter((v) => v != null));
          const w = 220, hgt = 46;
          const path = q
            .map((v, j) => `${j ? "L" : "M"}${((j / (q.length - 1)) * w).toFixed(1)},${(hgt - (v / max) * (hgt - 4)).toFixed(1)}`)
            .join("");
          const xNow = ((idx / (q.length - 1)) * w).toFixed(1);
          const cls = ratio > 1.5 ? "hot" : ratio < 0.6 ? "cold" : "";
          return `<article class="river ${cls}">
            <h4>${esc(RIVERS[i].name)}</h4>
            <svg viewBox="0 0 ${w} ${hgt}" preserveAspectRatio="none" role="img" aria-label="Débit sur 90 jours">
              <rect x="${xNow}" y="0" width="${w - xNow}" height="${hgt}" class="fc"/>
              <path d="${path}"/>
              <line x1="${xNow}" x2="${xNow}" y1="0" y2="${hgt}"/>
            </svg>
            <p><strong>${fmt(now, now < 100 ? 1 : 0)} m³/s</strong> aujourd'hui · ${ratio ? `${fmt(ratio * 100, 0)} % de la moyenne des 60 derniers jours` : ""}</p>
            <p class="muted small">Pic prévu à 30 jours : ${fmt(peak, peak < 100 ? 1 : 0)} m³/s</p>
          </article>`;
        })
        .join("");
      return { observedText: "modèle du jour (" + dateLong(today) + ")" };
    },
  });
}

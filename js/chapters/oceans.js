/**
 * Chapitre Océans : anomalie annuelle de la surface océanique (NOAA), température
 * de surface en direct (Open-Meteo Marine), niveau d'eau à New York (NOAA CO-OPS).
 */
import { liveBlock } from "../core/live.js";
import { gw, GW_URLS } from "../core/datasets.js";
import { chart, C, axisTitle } from "../core/charts.js";
import { getJSON } from "../core/fetcher.js";
import { fmt, signed, esc } from "../core/format.js";
import { colorFor } from "../core/stripes.js";
import { tempColor } from "./cities.js";

const SEAS = [
  { name: "Méditerranée (Marseille)", lat: 43.2, lon: 5.3 },
  { name: "Golfe de Gascogne", lat: 45.5, lon: -3.0 },
  { name: "Manche", lat: 50.2, lon: -1.0 },
  { name: "Atlantique Nord", lat: 40.0, lon: -40.0 },
  { name: "Golfe du Mexique", lat: 25.0, lon: -90.0 },
  { name: "Caraïbes", lat: 15.0, lon: -75.0 },
  { name: "Mer Rouge", lat: 22.0, lon: 38.0 },
  { name: "Golfe Persique", lat: 27.0, lon: 51.5 },
  { name: "Golfe du Bengale", lat: 15.0, lon: 88.0 },
  { name: "Grande Barrière de corail", lat: -18.0, lon: 147.5 },
  { name: "Pacifique équatorial (Niño 3.4)", lat: 0.0, lon: -145.0 },
  { name: "Mer de Barents", lat: 73.0, lon: 35.0 },
];

export function init() {
  liveBlock(document.getElementById("ocean-chart"), {
    source: "NOAA NCEI via global-warming.org",
    sourceUrl: GW_URLS.ocean,
    load: ({ force }) => gw("ocean", { force }),
    render: (data, body) => {
      const entries = Object.entries(data.result || {}).map(([y, o]) => [+y, o.departure]);
      // L'année en cours n'est qu'un cumul partiel : affichée en transparence
      const curYear = new Date().getUTCFullYear();
      const partial = entries.at(-1)?.[0] === curYear;
      chart(body.querySelector("canvas"), {
        type: "bar",
        data: {
          labels: entries.map(([y]) => y),
          datasets: [{ label: "Anomalie (°C)", data: entries.map(([, v]) => v), backgroundColor: entries.map(([y, v]) => colorFor(v, 0.9) + (partial && y === curYear ? "66" : "")), borderWidth: 0, barPercentage: 1, categoryPercentage: 1 }],
        },
        options: {
          scales: { x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } }, y: { title: axisTitle("°C vs moyenne du XXe s."), ticks: { callback: (v) => signed(v, 1) } } },
          plugins: { legend: { display: false } },
        },
      });
      const last = entries.at(-1);
      const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
      body.querySelector(".chart-note").innerHTML =
        `${last[0]}${partial ? " (année en cours, provisoire)" : ""} : <strong>${signed(last[1], 2)} °C</strong> · record de la série : ${max[0]} (${signed(max[1], 2)} °C).`;
      return { observedText: partial ? `${last[0]} (cumul provisoire)` : `année ${last[0]}` };
    },
  });

  liveBlock(document.getElementById("sst-live"), {
    source: "Open-Meteo Marine",
    sourceUrl: "https://open-meteo.com/en/docs/marine-weather-api",
    load: () =>
      getJSON(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${SEAS.map((s) => s.lat).join(",")}&longitude=${SEAS.map((s) => s.lon).join(",")}&current=sea_surface_temperature,wave_height&timezone=GMT`
      ),
    render: (data, body) => {
      const arr = Array.isArray(data) ? data : [data];
      body.querySelector(".sst-list").innerHTML = arr
        .map((d, i) => {
          const t = d.current?.sea_surface_temperature;
          const w = d.current?.wave_height;
          return `<li>
            <span class="swatch" style="background:${tempColor(t)}"></span>
            <span class="name">${esc(SEAS[i].name)}</span>
            <span class="val">${fmt(t, 1)} °C</span>
            <span class="muted small">${w != null ? "houle " + fmt(w, 1) + " m" : ""}</span>
          </li>`;
        })
        .join("");
      return { observedAt: arr[0]?.current?.time ? arr[0].current.time + "Z" : null };
    },
  });

  liveBlock(document.getElementById("tide-live"), {
    source: "NOAA CO-OPS (station 8518750, The Battery)",
    sourceUrl: "https://tidesandcurrents.noaa.gov/stationhome.html?id=8518750",
    load: async () => {
      const base = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=8518750&range=48&datum=MLLW&units=metric&time_zone=gmt&format=json&application=tempnow";
      const [obs, pred] = await Promise.all([getJSON(base + "&product=water_level"), getJSON(base + "&product=predictions&interval=6")]);
      if (obs.data.error) throw new Error(obs.data.error.message);
      return { data: { obs: obs.data.data || [], pred: pred.data.predictions || [] }, fetchedAt: obs.fetchedAt };
    },
    render: ({ obs, pred }, body) => {
      const predMap = new Map(pred.map((p) => [p.t, +p.v]));
      const pts = obs.filter((_, i) => i % 2 === 0);
      chart(body.querySelector("canvas"), {
        type: "line",
        data: {
          labels: pts.map((o) => o.t.slice(11, 16)),
          datasets: [
            { label: "Niveau observé (m)", data: pts.map((o) => +o.v), borderColor: C.cold2 },
            { label: "Marée prédite (m)", data: pts.map((o) => predMap.get(o.t) ?? null), borderColor: "rgba(154,167,180,.6)", borderDash: [4, 4], borderWidth: 1.5 },
          ],
        },
        options: { scales: { x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } }, y: { title: axisTitle("m (MLLW)") } }, plugins: { legend: { position: "bottom" } } },
      });
      const last = obs.at(-1);
      const surge = last && predMap.has(last.t) ? +last.v - predMap.get(last.t) : null;
      body.querySelector(".chart-note").innerHTML = last
        ? `Dernier relevé : <strong>${fmt(+last.v, 2)} m</strong>${surge != null ? ` · écart à la marée prédite : <strong>${signed(surge, 2)} m</strong>` : ""}. Heures en UTC.`
        : "Pas de relevé récent.";
      return { observedAt: last ? last.t.replace(" ", "T") + ":00Z" : null };
    },
  });
}

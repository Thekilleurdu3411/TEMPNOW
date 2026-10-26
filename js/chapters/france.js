/**
 * Chapitre France & Europe : chiffres Météo-France / Santé publique France / EFFIS,
 * et projection locale pour Périgueux 1950-2050 (Open-Meteo Climate, CMIP6/HighResMIP).
 */
import { liveBlock } from "../core/live.js";
import { getJSON, cached, DAY } from "../core/fetcher.js";
import { chart, C, axisTitle } from "../core/charts.js";
import { fmt, signed } from "../core/format.js";
import { SERIES } from "../../data/static.js";
import { colorFor } from "../core/stripes.js";

const MODEL = "EC_Earth3P_HR";

export function init() {
  const r = SERIES.franceRegionsHeat2025;
  chart(document.getElementById("fr-regions"), {
    type: "bar",
    data: { labels: r.labels, datasets: [{ label: "Décès attribuables à la chaleur", data: r.values, backgroundColor: r.labels.map((l) => (l === "Nouvelle-Aquitaine" ? C.hot : "rgba(255,90,54,.45)")), borderRadius: 3 }] },
    options: { indexAxis: "y", scales: { y: { grid: { display: false }, ticks: { font: { size: 10 } } } }, plugins: { legend: { display: false } } },
  });

  const e = SERIES.europeHeatDeaths;
  chart(document.getElementById("eu-heat"), {
    type: "bar",
    data: { labels: e.labels, datasets: [{ label: "Décès liés à la chaleur (Europe)", data: e.values, backgroundColor: [C.hot2, "rgba(255,176,32,.6)", C.hot], borderRadius: 3 }] },
    options: { scales: { x: { grid: { display: false } } }, plugins: { legend: { display: false } } },
  });

  const f = SERIES.euFires2025;
  chart(document.getElementById("eu-fires"), {
    type: "doughnut",
    data: { labels: f.labels, datasets: [{ data: f.values, backgroundColor: [C.hot, C.hot2, "rgba(154,167,180,.5)"], borderColor: C.panel, borderWidth: 2 }] },
    options: { cutout: "60%", interaction: { mode: "nearest", intersect: true }, plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => `${c.label} : ${fmt(c.parsed)} ha` } } } },
  });

  // Projection locale Périgueux ------------------------------------------------
  liveBlock(document.getElementById("perigueux-proj"), {
    source: `Open-Meteo Climate API (modèle ${MODEL})`,
    sourceUrl: "https://open-meteo.com/en/docs/climate-api",
    load: ({ force }) =>
      cached("proj:perigueux:" + MODEL, 30 * DAY, force, async () => {
        const { data } = await getJSON(
          `https://climate-api.open-meteo.com/v1/climate?latitude=45.184&longitude=0.7218&start_date=1950-01-01&end_date=2050-12-31&models=${MODEL}&daily=temperature_2m_max`,
          { timeout: 30000 }
        );
        const by = new Map();
        data.daily.time.forEach((t, i) => {
          const v = data.daily.temperature_2m_max[i];
          if (v == null) return;
          const y = +t.slice(0, 4);
          if (!by.has(y)) by.set(y, { n: 0, s: 0, d30: 0, d35: 0 });
          const o = by.get(y);
          o.n++;
          o.s += v;
          if (v >= 30) o.d30++;
          if (v >= 35) o.d35++;
        });
        return [...by.entries()].map(([y, o]) => [y, +(o.s / o.n).toFixed(2), o.d30, o.d35]);
      }),
    render: (rows, body) => {
      const avg = (a, b, k) => {
        const vs = rows.filter(([y]) => y >= a && y <= b).map((r) => r[k]);
        return vs.reduce((x, y) => x + y, 0) / vs.length;
      };
      const base = avg(1961, 1990, 1);
      chart(body.querySelector("canvas"), {
        type: "bar",
        data: {
          labels: rows.map(([y]) => y),
          datasets: [
            { type: "bar", label: "Jours ≥ 30 °C", data: rows.map((r) => r[2]), backgroundColor: rows.map((r) => colorFor(r[1] - base, 2)), yAxisID: "y", barPercentage: 1, categoryPercentage: 1 },
            { type: "line", label: "Jours ≥ 35 °C", data: rows.map((r) => r[3]), borderColor: C.hot, borderWidth: 1.5, yAxisID: "y" },
          ],
        },
        options: {
          scales: { x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } }, y: { title: axisTitle("jours par an") } },
          plugins: { legend: { position: "bottom" } },
        },
      });
      body.querySelector(".stripe-facts").innerHTML = `
        <li><span>Jours ≥ 30 °C / an, 1961-1990</span><strong>${fmt(avg(1961, 1990, 2), 0)}</strong></li>
        <li class="hot"><span>Jours ≥ 30 °C / an, 2031-2050</span><strong>${fmt(avg(2031, 2050, 2), 0)}</strong></li>
        <li><span>Tmax moyenne 1961-1990</span><strong>${fmt(base, 1)} °C</strong></li>
        <li class="hot"><span>Tmax moyenne 2031-2050</span><strong>${fmt(avg(2031, 2050, 1), 1)} °C (${signed(avg(2031, 2050, 1) - base, 1)})</strong></li>`;
      return {};
    },
  });
}

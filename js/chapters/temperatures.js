/**
 * Chapitre Températures : anomalie mondiale mensuelle (en direct), bandes locales
 * depuis 1950 (Open-Meteo Archive / ERA5, cache 30 jours), projections GIEC.
 */
import { liveBlock } from "../core/live.js";
import { gw, GW_URLS, decimalYearToDate } from "../core/datasets.js";
import { chart, C, gradientLine, axisTitle } from "../core/charts.js";
import { getJSON, cached, DAY } from "../core/fetcher.js";
import { drawStripes } from "../core/stripes.js";
import { fmt, signed, esc, monthYear } from "../core/format.js";
import { SERIES } from "../../data/static.js";
import { srcLink } from "../core/stats.js";
import { CITIES } from "./cities.js";

export function init() {
  // 1. Anomalie mondiale mensuelle ----------------------------------------
  liveBlock(document.getElementById("global-temp"), {
    source: "NASA GISS via global-warming.org",
    sourceUrl: GW_URLS.temperature,
    load: ({ force }) => gw("temperature", { force }),
    render: (data, body) => {
      const rows = (data.result || []).map((r) => ({ t: decimalYearToDate(r.time), v: parseFloat(r.land) }));
      const labels = rows.map((r) => r.t.getUTCFullYear() + "-" + String(r.t.getUTCMonth() + 1).padStart(2, "0"));
      const vals = rows.map((r) => r.v);
      const mean12 = vals.map((_, i) => (i < 11 ? null : vals.slice(i - 11, i + 1).reduce((a, b) => a + b, 0) / 12));
      chart(body.querySelector("canvas"), {
        type: "line",
        data: {
          labels,
          datasets: [
            { label: "Anomalie mensuelle (°C)", data: vals, borderColor: "rgba(154,167,180,.35)", borderWidth: 1, tension: 0 },
            { label: "Moyenne glissante 12 mois", data: mean12, borderColor: gradientLine, borderWidth: 2.5 },
          ],
        },
        options: {
          scales: {
            x: { ticks: { maxTicksLimit: 7, callback(v) { return this.getLabelForValue(v).slice(0, 4); } }, grid: { display: false } },
            y: { title: axisTitle("°C vs 1951-1980"), ticks: { callback: (v) => signed(v, 1) } },
          },
          plugins: { legend: { position: "bottom" } },
        },
      });
      const last = rows.at(-1);
      const max = rows.reduce((a, b) => (b.v > a.v ? b : a));
      const fm = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
      body.querySelector(".chart-note").innerHTML =
        `Dernier mois : <strong>${signed(last.v, 2)} °C</strong> (${fm.format(last.t)}) · mois le plus chaud de la série : <strong>${signed(max.v, 2)} °C</strong> (${fm.format(max.t)}).`;
      return { observedText: monthYear(last.t) };
    },
  });

  // 2. Bandes locales depuis 1950 -----------------------------------------
  const sel = document.getElementById("stripes-city");
  const block = document.getElementById("local-stripes");
  if (sel && block) {
    sel.innerHTML = CITIES.map((c, i) => `<option value="${i}">${esc(c.name)}</option>`).join("");
    const lastYear = new Date().getUTCFullYear() - 1;
    const archiveUrl = (c) =>
      `https://archive-api.open-meteo.com/v1/archive?latitude=${c.lat}&longitude=${c.lon}&start_date=1950-01-01&end_date=${lastYear}-12-31&daily=temperature_2m_mean&timezone=auto`;
    const api = liveBlock(block, {
      source: "Open-Meteo Archive (ERA5)",
      sourceUrl: "https://open-meteo.com/en/docs/historical-weather-api",
      load: ({ force }) => {
        const c = CITIES[+sel.value];
        return cached(`stripes:${c.name}:${lastYear}`, 30 * DAY, force, async () => {
          const { data } = await getJSON(archiveUrl(c), { timeout: 30000 });
          const by = new Map();
          data.daily.time.forEach((t, i) => {
            const v = data.daily.temperature_2m_mean[i];
            if (v == null) return;
            const y = +t.slice(0, 4);
            if (!by.has(y)) by.set(y, [0, 0]);
            const a = by.get(y);
            a[0] += v;
            a[1]++;
          });
          return [...by.entries()].filter(([, a]) => a[1] > 300).map(([y, a]) => [y, +(a[0] / a[1]).toFixed(3)]);
        });
      },
      render: (years, body) => {
        const c = CITIES[+sel.value];
        const ref = years.filter(([y]) => y >= 1961 && y <= 1990).map(([, v]) => v);
        const base = ref.reduce((a, b) => a + b, 0) / ref.length;
        const items = years.map(([y, v]) => ({ label: y, value: v - base }));
        drawStripes(body.querySelector("canvas"), items, { range: 1.6, tooltip: body.querySelector(".stripe-tip") });
        const avg = (from, to) => {
          const vs = years.filter(([y]) => y >= from && y <= to).map(([, v]) => v);
          return vs.reduce((a, b) => a + b, 0) / vs.length;
        };
        const first = avg(1950, 1959);
        const recent = avg(lastYear - 9, lastYear);
        const hottest = years.reduce((a, b) => (b[1] > a[1] ? b : a));
        body.querySelector(".y0").textContent = years[0][0];
        body.querySelector(".y1").textContent = years.at(-1)[0];
        body.querySelector(".stripe-facts").innerHTML = `
          <li><span>Moyenne 1950-1959</span><strong>${fmt(first, 1)} °C</strong></li>
          <li><span>Moyenne ${lastYear - 9}-${lastYear}</span><strong>${fmt(recent, 1)} °C</strong></li>
          <li class="hot"><span>Écart</span><strong>${signed(recent - first, 1)} °C</strong></li>
          <li><span>Année la plus chaude</span><strong>${hottest[0]} (${fmt(hottest[1], 1)} °C)</strong></li>`;
        body.querySelector(".stripe-caption").textContent = `${c.name} : température moyenne annuelle, écart à la moyenne 1961-1990 (${fmt(base, 1)} °C). Réanalyse ERA5 (maille ≈ 25 km).`;
        return { observedText: `année ${years.at(-1)[0]} (complète)` };
      },
    });
    sel.addEventListener("change", () => api.run());
  }

  // 3. Projections GIEC (statique) -----------------------------------------
  const s = SERIES.ar6Warming;
  chart(document.getElementById("ar6-chart"), {
    type: "bar",
    data: {
      labels: s.labels,
      datasets: [
        { label: "Fourchette basse", data: s.low, backgroundColor: "rgba(63,167,255,.35)", stack: "a" },
        { label: "Estimation centrale", data: s.best.map((b, i) => b - s.low[i]), backgroundColor: "rgba(255,176,32,.7)", stack: "a" },
        { label: "Fourchette haute", data: s.high.map((h, i) => h - s.best[i]), backgroundColor: "rgba(255,90,54,.75)", stack: "a" },
      ],
    },
    options: {
      indexAxis: "y",
      scales: { x: { stacked: true, title: axisTitle("°C en 2081-2100 vs 1850-1900"), max: 6 }, y: { stacked: true, grid: { display: false } } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              return ctx.datasetIndex === 1 ? `Centrale : +${fmt(s.best[i], 1)} °C` : ctx.datasetIndex === 0 ? `Basse : +${fmt(s.low[i], 1)} °C` : `Haute : +${fmt(s.high[i], 1)} °C`;
            },
          },
        },
      },
    },
  });
  const n = document.getElementById("ar6-src");
  if (n) n.innerHTML = srcLink(s.src, s.date);
}

/**
 * Chapitre Gaz à effet de serre : CO₂ journalier (Mauna Loa), CH₄ et N₂O mensuels.
 */
import { liveBlock } from "../core/live.js";
import { gw, GW_URLS, yearDotMonth } from "../core/datasets.js";
import { chart, C, axisTitle } from "../core/charts.js";
import { fmt, dateLong } from "../core/format.js";

const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric", timeZone: "UTC" });

function lineChart(canvas, labels, data, { label, color, unit, fill = true }) {
  return chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{ label, data, borderColor: color, backgroundColor: color + "22", fill, borderWidth: 2 }],
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 6 }, grid: { display: false } },
        y: { title: axisTitle(unit) },
      },
      plugins: { legend: { display: false } },
    },
  });
}

export function init() {
  liveBlock(document.getElementById("co2-chart"), {
    source: "NOAA GML via global-warming.org",
    sourceUrl: GW_URLS.co2,
    load: ({ force }) => gw("co2", { force }),
    render: (data, body) => {
      const rows = data.co2 || [];
      // Un point par semaine pour rester léger
      const pts = rows.filter((_, i) => i % 7 === 0 || i === rows.length - 1);
      const labels = pts.map((r) => `${r.day}/${r.month}/${r.year}`);
      lineChart(body.querySelector("canvas"), labels, pts.map((r) => +r.cycle), { label: "CO₂ (ppm)", color: C.hot, unit: "ppm", fill: false });
      const last = rows.at(-1);
      const first = rows[0];
      body.querySelector(".chart-note").innerHTML =
        `De <strong>${fmt(+first.trend, 1)} ppm</strong> (${first.year}) à <strong>${fmt(+last.trend, 1)} ppm</strong> : +${fmt(last.trend - first.trend, 1)} ppm en ${last.year - first.year} ans. Les oscillations sont le « souffle » saisonnier de la végétation.`;
      return { observedText: dateLong(Date.UTC(+last.year, +last.month - 1, +last.day)) };
    },
  });

  const monthly = (id, name, key, color, label) =>
    liveBlock(document.getElementById(id), {
      source: "NOAA GML via global-warming.org",
      sourceUrl: GW_URLS[name],
      load: ({ force }) => gw(name, { force }),
      render: (data, body) => {
        const rows = (data[key] || []).filter((r) => +r.average > 0);
        const dates = rows.map((r) => yearDotMonth(r.date));
        lineChart(body.querySelector("canvas"), dates.map((d) => monthFmt.format(d)), rows.map((r) => +r.average), { label, color, unit: "ppb" });
        const last = rows.at(-1);
        const prev = rows[Math.max(0, rows.length - 13)];
        body.querySelector(".chart-note").innerHTML =
          `Dernière valeur : <strong>${fmt(+last.average, 1)} ppb</strong> · ${+last.trend >= +prev.trend ? "+" : ""}${fmt(last.trend - prev.trend, 1)} ppb sur 12 mois (tendance).`;
        return { observedText: monthFmt.format(dates.at(-1)) };
      },
    });

  monthly("ch4-chart", "methane", "methane", C.hot2, "CH₄ (ppb)");
  monthly("n2o-chart", "nitrous", "nitrous", C.cold2, "N₂O (ppb)");
}

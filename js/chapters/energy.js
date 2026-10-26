/**
 * Chapitre Énergie : intensité carbone de l'électricité en direct.
 *  - France : éCO2mix (RTE) via l'API ODRÉ (Opendatasoft)
 *  - Grande-Bretagne : Carbon Intensity API (National Grid ESO)
 */
import { liveBlock } from "../core/live.js";
import { getJSON } from "../core/fetcher.js";
import { chart, C, axisTitle } from "../core/charts.js";
import { fmt, timeOnly } from "../core/format.js";

const MIX_COLORS = {
  nucleaire: "#ffd166", nuclear: "#ffd166",
  eolien: "#7fd1ff", wind: "#7fd1ff",
  solaire: "#ffb020", solar: "#ffb020",
  hydraulique: "#3fa7ff", hydro: "#3fa7ff",
  bioenergies: "#3ddc97", biomass: "#3ddc97",
  gaz: "#ff8a3d", gas: "#ff8a3d",
  charbon: "#6b4f3a", coal: "#6b4f3a",
  fioul: "#a50f15", oil: "#a50f15",
  imports: "#b18cff", other: "#9aa7b4",
};
const FR_LABELS = {
  nucleaire: "Nucléaire", eolien: "Éolien", solaire: "Solaire", hydraulique: "Hydraulique", bioenergies: "Bioénergies",
  gaz: "Gaz", charbon: "Charbon", fioul: "Fioul",
  nuclear: "Nucléaire", wind: "Éolien", solar: "Solaire", hydro: "Hydraulique", biomass: "Biomasse", gas: "Gaz", coal: "Charbon", oil: "Fioul", imports: "Importations", other: "Autres",
};

function doughnut(canvas, entries) {
  return chart(canvas, {
    type: "doughnut",
    data: {
      labels: entries.map(([k]) => FR_LABELS[k] || k),
      datasets: [{ data: entries.map(([, v]) => v), backgroundColor: entries.map(([k]) => MIX_COLORS[k] || "#9aa7b4"), borderColor: C.panel, borderWidth: 2 }],
    },
    options: {
      cutout: "62%",
      interaction: { mode: "nearest", intersect: true },
      plugins: { legend: { position: "right", labels: { font: { size: 10 } } }, tooltip: { callbacks: { label: (c) => `${c.label} : ${fmt(c.parsed, 1)} %` } } },
    },
  });
}

export function init() {
  // France — éCO2mix -----------------------------------------------------------
  liveBlock(document.getElementById("eco2mix-live"), {
    source: "RTE éCO2mix via ODRÉ",
    sourceUrl: "https://odre.opendatasoft.com/explore/dataset/eco2mix-national-tr/",
    interval: 15 * 60e3,
    load: () =>
      getJSON(
        "https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/eco2mix-national-tr/records" +
          "?select=date_heure,taux_co2,consommation,nucleaire,eolien,solaire,hydraulique,gaz,charbon,fioul,bioenergies" +
          "&where=taux_co2%20is%20not%20null&order_by=date_heure%20desc&limit=96",
        { timeout: 20000 }
      ),
    render: (data, body) => {
      const rows = (data.results || []).slice().reverse();
      if (!rows.length) throw new Error("aucune donnée");
      const last = rows.at(-1);
      const keys = ["nucleaire", "eolien", "solaire", "hydraulique", "bioenergies", "gaz", "charbon", "fioul"];
      const pos = keys.map((k) => [k, Math.max(0, last[k] || 0)]).filter(([, v]) => v > 0);
      const tot = pos.reduce((a, [, v]) => a + v, 0);
      doughnut(body.querySelector(".mix canvas"), pos.map(([k, v]) => [k, (v / tot) * 100]));
      chart(body.querySelector(".trend canvas"), {
        type: "line",
        data: { labels: rows.map((r) => timeOnly(r.date_heure)), datasets: [{ label: "gCO₂/kWh", data: rows.map((r) => r.taux_co2), borderColor: C.ok, backgroundColor: "rgba(61,220,151,.12)", fill: true }] },
        options: { scales: { x: { ticks: { maxTicksLimit: 6 }, grid: { display: false } }, y: { title: axisTitle("gCO₂/kWh"), beginAtZero: true } }, plugins: { legend: { display: false } } },
      });
      body.querySelector(".kpis").innerHTML = `
        <div><strong>${fmt(last.taux_co2, 0)}</strong><span>gCO₂/kWh</span></div>
        <div><strong>${fmt(last.consommation / 1000, 1)}</strong><span>GW consommés</span></div>
        <div><strong>${fmt(((last.nucleaire + last.eolien + last.solaire + last.hydraulique + (last.bioenergies || 0)) / tot) * 100, 0)} %</strong><span>bas carbone</span></div>`;
      return { observedAt: last.date_heure };
    },
  });

  // Grande-Bretagne -----------------------------------------------------------
  liveBlock(document.getElementById("uk-live"), {
    source: "Carbon Intensity API (National Grid ESO)",
    sourceUrl: "https://carbonintensity.org.uk/",
    interval: 30 * 60e3,
    load: async () => {
      const [gen, day] = await Promise.all([getJSON("https://api.carbonintensity.org.uk/generation"), getJSON("https://api.carbonintensity.org.uk/intensity/date")]);
      return { data: { gen: gen.data.data, day: day.data.data || [] }, fetchedAt: gen.fetchedAt };
    },
    render: ({ gen, day }, body) => {
      const mix = (gen.generationmix || []).filter((m) => m.perc > 0).map((m) => [m.fuel, m.perc]);
      doughnut(body.querySelector(".mix canvas"), mix);
      chart(body.querySelector(".trend canvas"), {
        type: "line",
        data: {
          labels: day.map((p) => timeOnly(p.from)),
          datasets: [
            { label: "Mesurée", data: day.map((p) => p.intensity.actual), borderColor: C.ok, backgroundColor: "rgba(61,220,151,.12)", fill: true },
            { label: "Prévue", data: day.map((p) => p.intensity.forecast), borderColor: "rgba(154,167,180,.7)", borderDash: [4, 4], borderWidth: 1.5 },
          ],
        },
        options: { scales: { x: { ticks: { maxTicksLimit: 6 }, grid: { display: false } }, y: { title: axisTitle("gCO₂/kWh"), beginAtZero: true } }, plugins: { legend: { position: "bottom" } } },
      });
      const cur = [...day].reverse().find((p) => p.intensity.actual != null) || day.at(-1);
      const IDX = { "very low": "très faible", low: "faible", moderate: "modérée", high: "élevée", "very high": "très élevée" };
      const low = mix.filter(([k]) => ["wind", "solar", "nuclear", "hydro", "biomass"].includes(k)).reduce((a, [, v]) => a + v, 0);
      body.querySelector(".kpis").innerHTML = `
        <div><strong>${fmt(cur?.intensity.actual ?? cur?.intensity.forecast, 0)}</strong><span>gCO₂/kWh (${IDX[cur?.intensity.index] || "—"})</span></div>
        <div><strong>${fmt(mix.find(([k]) => k === "wind")?.[1], 0)} %</strong><span>éolien</span></div>
        <div><strong>${fmt(low, 0)} %</strong><span>bas carbone</span></div>`;
      return { observedAt: gen.to };
    },
  });
}

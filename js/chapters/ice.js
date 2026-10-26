/**
 * Chapitre Glaces : étendue mondiale de la banquise (NSIDC, mensuelle, en direct).
 */
import { liveBlock } from "../core/live.js";
import { gw, GW_URLS } from "../core/datasets.js";
import { chart, C, axisTitle } from "../core/charts.js";
import { fmt, signed } from "../core/format.js";

const mf = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

export function init() {
  liveBlock(document.getElementById("seaice-chart"), {
    source: "NSIDC via global-warming.org",
    sourceUrl: GW_URLS.arctic,
    load: ({ force }) => gw("arctic", { force }),
    render: (data, body) => {
      const a = data.arcticData || {};
      const entries = Object.entries(a.data || {})
        .map(([k, o]) => ({ d: new Date(Date.UTC(+k.slice(0, 4), +k.slice(4, 6) - 1, 15)), v: o.value, anom: o.anom }))
        .filter((e) => e.v > 0 && e.anom > -100);
      // Moyenne glissante 12 mois de l'anomalie
      const anoms = entries.map((e) => e.anom);
      const ma = anoms.map((_, i) => (i < 11 ? null : anoms.slice(i - 11, i + 1).reduce((s, x) => s + x, 0) / 12));
      chart(body.querySelector("canvas"), {
        type: "line",
        data: {
          labels: entries.map((e) => e.d.getUTCFullYear() + "-" + String(e.d.getUTCMonth() + 1).padStart(2, "0")),
          datasets: [
            { label: "Anomalie mensuelle (M km²)", data: anoms, borderColor: "rgba(127,209,255,.35)", borderWidth: 1, tension: 0 },
            { label: "Moyenne 12 mois", data: ma, borderColor: C.cold, borderWidth: 2.5, fill: { target: { value: 0 }, above: "rgba(63,167,255,.12)", below: "rgba(255,90,54,.18)" } },
          ],
        },
        options: {
          scales: {
            x: { ticks: { maxTicksLimit: 7, callback(v) { return this.getLabelForValue(v).slice(0, 4); } }, grid: { display: false } },
            y: { title: axisTitle("M km² vs 1991-2020"), ticks: { callback: (v) => signed(v, 1) } },
          },
          plugins: { legend: { position: "bottom" } },
        },
      });
      const last = entries.at(-1);
      body.querySelector(".chart-note").innerHTML =
        `${a.description?.title || "Banquise mondiale"} · ${mf.format(last.d)} : <strong>${fmt(last.v, 2)} M km²</strong>, soit <strong>${signed(last.anom, 2)} M km²</strong> par rapport à la normale 1991-2020. Tendance : ${signed(a.description?.decadalTrend, 1)} M km² par décennie.`;
      return { observedText: mf.format(last.d) };
    },
  });
}

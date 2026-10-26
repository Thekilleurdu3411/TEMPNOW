/**
 * Compteurs « depuis l'ouverture de la page » + compte à rebours du budget carbone
 * + CO₂ atmosphérique du jour (NOAA, en direct).
 */
import { RATES, CARBON_BUDGET } from "../../data/static.js";
import { srcLink } from "../core/stats.js";
import { fmt, dateLong, esc } from "../core/format.js";
import { liveBlock } from "../core/live.js";
import { gw, GW_URLS } from "../core/datasets.js";
import { onReplay } from "../core/motion.js";

export function init() {
  const wrap = document.getElementById("counters-grid");
  if (!wrap) return;
  wrap.innerHTML = RATES.map(
    (r) => `
    <article class="counter tone-${r.tone}" data-reveal>
      <div class="counter-value" data-rate="${r.id}">0</div>
      <p class="counter-label">${esc(r.label)}</p>
      <p class="counter-note">${esc(r.note)} · ${srcLink(r.src)}</p>
    </article>`
  ).join("");

  const els = RATES.map((r) => [r, wrap.querySelector(`[data-rate="${r.id}"]`)]);
  let t0 = performance.now();
  onReplay(() => (t0 = performance.now()));
  const elapsedEl = document.getElementById("counters-elapsed");

  const budgetEl = document.getElementById("budget-left");
  const budgetBar = document.getElementById("budget-bar");
  const budgetEnd = document.getElementById("budget-end");
  const YEAR_MS = 365.25 * 864e5;
  const start = Date.parse(CARBON_BUDGET.startDate);
  const endDate = new Date(start + (CARBON_BUDGET.startGt / CARBON_BUDGET.gtPerYear) * YEAR_MS);
  if (budgetEnd) budgetEnd.textContent = dateLong(endDate);

  function tick() {
    const s = (performance.now() - t0) / 1000;
    els.forEach(([r, el]) => (el.textContent = fmt(r.perSecond * s, r.decimals)));
    if (elapsedEl) elapsedEl.textContent = fmt(s, 0);
    if (budgetEl) {
      const left = CARBON_BUDGET.startGt - ((Date.now() - start) / YEAR_MS) * CARBON_BUDGET.gtPerYear;
      budgetEl.textContent = fmt(Math.max(0, left), 3);
      if (budgetBar) budgetBar.style.transform = `scaleX(${Math.max(0, left) / CARBON_BUDGET.startGt})`;
    }
  }
  tick();
  // 4 mises à jour par seconde suffisent, même avec réduction des animations
  setInterval(() => !document.hidden && tick(), 250);

  liveBlock(document.getElementById("co2-today"), {
    source: "NOAA GML via global-warming.org",
    sourceUrl: GW_URLS.co2,
    load: ({ force }) => gw("co2", { force }),
    render: (data, body) => {
      const rows = data.co2 || [];
      const last = rows.at(-1);
      const yearAgo = rows[Math.max(0, rows.length - 366)];
      const d = new Date(Date.UTC(+last.year, +last.month - 1, +last.day));
      const v = parseFloat(last.trend);
      const diff = v - parseFloat(yearAgo.trend);
      body.querySelector(".big").textContent = fmt(v, 2) + " ppm";
      body.querySelector(".sub").textContent = `Tendance désaisonnalisée · ${diff >= 0 ? "+" : ""}${fmt(diff, 2)} ppm en un an · ≈ 152 % du niveau préindustriel (OMM)`;
      return { observedText: dateLong(d) };
    },
  });
}

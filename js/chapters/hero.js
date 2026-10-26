/**
 * Ouverture : bandes de réchauffement mondiales animées (NASA GISTEMP, en direct)
 * + chiffre clé (Copernicus) + dernier mois mesuré.
 */
import { liveBlock } from "../core/live.js";
import { gw, GW_URLS, annualTemps, decimalYearToDate } from "../core/datasets.js";
import { drawStripes } from "../core/stripes.js";
import { countTo, onReplay } from "../core/motion.js";
import { signed } from "../core/format.js";

export function init() {
  const key = document.getElementById("hero-key");
  if (key) {
    const c = countTo(key, 1.47, { decimals: 2, prefix: "+", suffix: "°C", duration: 2.6 });
    onReplay(() => c.replay());
  }

  const block = document.getElementById("hero-live");
  liveBlock(block, {
    source: "NASA GISS via global-warming.org",
    sourceUrl: GW_URLS.temperature,
    eager: true,
    load: ({ force }) => gw("temperature", { force }),
    render: (data) => {
      const years = annualTemps(data);
      const canvas = document.getElementById("hero-stripes");
      drawStripes(canvas, years, { range: 1.0, duration: 2600, tooltip: document.getElementById("hero-tip") });
      document.getElementById("hero-y0").textContent = years[0]?.label ?? "";
      document.getElementById("hero-y1").textContent = years.at(-1)?.label ?? "";

      const rows = data.result || [];
      const last = rows.at(-1);
      const lastDate = decimalYearToDate(last.time);
      const m = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(lastDate);
      document.getElementById("hero-last").innerHTML =
        `Dernier mois mesuré (${m}) : <strong>${signed(parseFloat(last.land), 2)} °C</strong> par rapport à 1951-1980`;
      return { observedText: m };
    },
  });
}

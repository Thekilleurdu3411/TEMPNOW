/**
 * Jeux de données partagés entre plusieurs chapitres (une seule requête par visite).
 * Source : global-warming.org — agrège NOAA GML (CO₂, CH₄, N₂O), NASA GISS (températures),
 * NOAA NCEI (océans) et NSIDC (banquise).
 */
import { getJSON, HOUR } from "./fetcher.js";

const GW = "https://global-warming.org/api/";
const memo = new Map();

export const GW_URLS = {
  temperature: GW + "temperature-api",
  co2: GW + "co2-api",
  methane: GW + "methane-api",
  nitrous: GW + "nitrous-oxide-api",
  arctic: GW + "arctic-api",
  ocean: GW + "ocean-warming-api",
};

/** Ces séries changent au plus une fois par jour : cache local de 12 h. */
export function gw(name, { force = false } = {}) {
  if (!force && memo.has(name)) return memo.get(name);
  const p = getJSON(GW_URLS[name], { cacheKey: "gw:" + name, ttl: 12 * HOUR, force, timeout: 20000 });
  memo.set(name, p);
  p.catch(() => memo.delete(name));
  return p;
}

/** Températures mondiales mensuelles -> moyennes annuelles (années complètes) */
export function annualTemps(raw) {
  const rows = raw.result || [];
  const byYear = new Map();
  rows.forEach((r) => {
    const y = Math.floor(parseFloat(r.time));
    const v = parseFloat(r.land); // « land » = GISTEMP LOTI terres + océans (« station » = stations seules)
    if (Number.isNaN(v)) return;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(v);
  });
  return [...byYear.entries()]
    .filter(([, vs]) => vs.length >= 12)
    .map(([y, vs]) => ({ label: y, value: vs.reduce((a, b) => a + b, 0) / vs.length }));
}

/** « 2026.71 » -> Date (approx. milieu de mois) */
export function decimalYearToDate(t) {
  const f = parseFloat(t);
  const y = Math.floor(f);
  const m = Math.min(11, Math.floor((f - y) * 12));
  return new Date(Date.UTC(y, m, 15));
}

/** CH₄ / N₂O : « 2026.6 » = année.mois */
export function yearDotMonth(s) {
  const [y, m] = String(s).split(".");
  return new Date(Date.UTC(+y, (+m || 1) - 1, 15));
}

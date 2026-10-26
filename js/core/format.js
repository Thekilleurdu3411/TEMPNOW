/** Formats français (nombres, dates) */

const nfCache = new Map();
export function nf(decimals = 0) {
  const k = decimals;
  if (!nfCache.has(k)) {
    nfCache.set(k, new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  }
  return nfCache.get(k);
}

export const fmt = (v, d = 0) => (v == null || Number.isNaN(v) ? "—" : nf(d).format(v));

export const signed = (v, d = 1) => (v == null || Number.isNaN(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + nf(d).format(Math.abs(v)));

const dtf = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const df = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const tf = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export const dateTime = (d) => (d ? dtf.format(new Date(d)) : "—");
export const dateLong = (d) => (d ? df.format(new Date(d)) : "—");
const mf = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
export const monthYear = (d) => (d ? mf.format(new Date(d)) : "—");
export const timeOnly = (d) => (d ? tf.format(new Date(d)) : "—");

/** « il y a 3 h » */
const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
export function ago(d) {
  const s = (new Date(d).getTime() - Date.now()) / 1000;
  const abs = Math.abs(s);
  if (abs < 60) return rtf.format(Math.round(s), "second");
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  return rtf.format(Math.round(s / 86400), "day");
}

/** Échappement HTML pour les textes venant des API */
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Nombre compact : 12,3 k / 4,5 M / 1,2 Md */
export function compact(v, d = 1) {
  const a = Math.abs(v);
  if (a >= 1e9) return fmt(v / 1e9, d) + " Md";
  if (a >= 1e6) return fmt(v / 1e6, d) + " M";
  if (a >= 1e4) return fmt(v / 1e3, d) + " k";
  return fmt(v, 0);
}

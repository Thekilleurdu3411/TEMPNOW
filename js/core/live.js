/**
 * Bloc « en direct » : état de chargement, horodatage, source, bouton Actualiser,
 * message d'erreur isolé (le reste de la page continue de fonctionner).
 *
 * Usage :
 *   liveBlock(el, {
 *     source: "USGS", sourceUrl: "https://…",
 *     load: async ({ force }) => ({ data, fetchedAt, fromCache }),
 *     render: (data, body) => ({ observedAt }) | void,
 *   });
 */
import { dateTime, esc } from "./format.js";

const registry = [];
export const liveRegistry = registry;

export function liveBlock(el, cfg) {
  if (!el) return null;
  const body = el.querySelector(".live-body") || el;

  const bar = document.createElement("div");
  bar.className = "live-bar";
  bar.innerHTML = `
    <span class="live-status" role="status" aria-live="polite"><i class="dot"></i><span class="txt">Chargement…</span></span>
    <span class="live-time" title="Heure du relevé">—</span>
    <span class="live-src">Source : <a href="${esc(cfg.sourceUrl)}" target="_blank" rel="noopener">${esc(cfg.source)}</a></span>
    <button type="button" class="btn-refresh" aria-label="Actualiser ce bloc">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.3L13 11h7V4z"/></svg>
      Actualiser
    </button>`;
  el.insertBefore(bar, body);

  const errBox = document.createElement("div");
  errBox.className = "live-error";
  errBox.hidden = true;
  body.after(errBox);

  const statusTxt = bar.querySelector(".live-status .txt");
  const timeEl = bar.querySelector(".live-time");
  const btn = bar.querySelector(".btn-refresh");

  let busy = false;
  async function run(force = false) {
    if (busy) return;
    busy = true;
    el.classList.add("is-loading");
    el.classList.remove("is-error", "is-live", "is-cache");
    statusTxt.textContent = "Chargement…";
    btn.disabled = true;
    errBox.hidden = true;
    try {
      const res = await cfg.load({ force });
      const out = (await cfg.render(res.data, body, res)) || {};
      // observedText : période lisible pour les séries mensuelles/annuelles (« septembre 2026 »)
      const when = out.observedText || (out.observedAt ? dateTime(out.observedAt) : null);
      timeEl.textContent = when ? `Relevé : ${when} · chargé ${dateTime(res.fetchedAt)}` : `Chargé : ${dateTime(res.fetchedAt)}`;
      if (res.fromCache) {
        el.classList.add("is-cache");
        statusTxt.textContent = res.stale ? "Cache (API muette)" : "Cache local";
      } else {
        el.classList.add("is-live");
        statusTxt.textContent = "En direct";
      }
    } catch (e) {
      console.info(`[${cfg.source}] indisponible :`, e.message);
      el.classList.add("is-error");
      statusTxt.textContent = "Indisponible";
      errBox.hidden = false;
      errBox.innerHTML = `
        <p><strong>Ces données ne répondent pas pour l'instant</strong> (${esc(e.message || "erreur réseau")}).
        Le reste de la page fonctionne normalement.</p>
        <button type="button" class="btn-retry">Réessayer</button>`;
      errBox.querySelector(".btn-retry").addEventListener("click", () => run(true));
    } finally {
      el.classList.remove("is-loading");
      btn.disabled = false;
      busy = false;
    }
  }

  btn.addEventListener("click", () => run(true));
  const api = { run, el };
  registry.push(api);

  // Chargement différé : on attend que le bloc approche de l'écran.
  if (cfg.eager || !("IntersectionObserver" in window)) {
    run();
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
  }
  if (cfg.interval) setInterval(() => !document.hidden && run(true), cfg.interval);
  return api;
}

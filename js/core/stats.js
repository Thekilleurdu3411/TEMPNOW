/**
 * Cartes de chiffres « de fond » (data/static.js) : valeur animée + source + date.
 * Remplit chaque conteneur [data-stats="groupe"].
 */
import { STATS, SOURCES } from "../../data/static.js";
import { countTo, onReplay } from "./motion.js";
import { esc } from "./format.js";

export function srcLink(key, date) {
  const s = SOURCES[key];
  if (!s) return "";
  return `<a class="src" href="sources.html#${esc(key)}" title="${esc(s.title)}">${esc(s.org)} · ${esc(date || s.date)}</a>`;
}

export function initStats() {
  const counters = [];
  document.querySelectorAll("[data-stats]").forEach((wrap) => {
    const group = STATS[wrap.dataset.stats];
    if (!group) return;
    wrap.classList.add("stat-grid");
    wrap.innerHTML = group
      .map(
        (s) => `
      <article class="stat ${s.tone ? "tone-" + s.tone : ""}" data-reveal>
        <div class="stat-value"><span data-count="${s.id}">${esc(s.prefix || "")}${s.value}${esc(s.suffix || "")}</span></div>
        <h4 class="stat-label">${esc(s.label)}</h4>
        ${s.detail ? `<p class="stat-detail">${esc(s.detail)}</p>` : ""}
        ${srcLink(s.src, s.date)}
      </article>`
      )
      .join("");
    group.forEach((s) => {
      const el = wrap.querySelector(`[data-count="${s.id}"]`);
      counters.push(countTo(el, s.value, { decimals: s.decimals || 0, prefix: s.prefix || "", suffix: s.suffix || "" }));
    });
  });
  onReplay(() => counters.forEach((c) => c.replay()));
}

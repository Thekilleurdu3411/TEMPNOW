/** Page Sources : liste générée depuis data/static.js et data/apis.js */
import { SOURCES, STATS, SERIES, RATES, UPDATED } from "../data/static.js";
import { APIS } from "../data/apis.js";
import { esc, dateLong } from "./core/format.js";

const fmtVal = (s) => `${s.prefix || ""}${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: s.decimals || 0, minimumFractionDigits: s.decimals || 0 }).format(s.value)}${s.suffix || ""}`;

// Index : quels chiffres utilisent chaque source
const uses = {};
const add = (k, txt) => (uses[k] ||= []).push(txt);
Object.values(STATS).flat().forEach((s) => add(s.src, `${fmtVal(s)} — ${s.label}`));
Object.values(SERIES).forEach((s) => s.src.split(",").forEach((k) => add(k.trim(), `Graphique : ${s.labels.join(", ")}`)));
RATES.forEach((r) => add(r.src, `Compteur : ${r.label} (${r.note})`));

document.getElementById("updated").textContent = dateLong(UPDATED);

document.getElementById("source-list").innerHTML = Object.entries(SOURCES)
  .map(
    ([k, s]) => `<li id="${esc(k)}">
      <h3>${esc(s.org)}</h3>
      <p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> · <span class="muted">${esc(s.date)}</span></p>
      ${uses[k] ? `<ul>${uses[k].map((u) => `<li>${esc(u)}</li>`).join("")}</ul>` : ""}
    </li>`
  )
  .join("");

const MARK = { ok: '<span class="ok" title="Testée">✔</span>', cors: '<span class="warn" title="CORS vérifié, quota atteint pendant le test">◐</span>', untested: '<span class="warn" title="Non testée">○</span>' };
document.getElementById("api-list").innerHTML = APIS.map(
  (a) => `<tr>
    <td><a href="${esc(a.doc)}" target="_blank" rel="noopener">${esc(a.name)}</a></td>
    <td>${esc(a.what)}<br><code class="small muted">${esc(a.url)}</code></td>
    <td>${MARK[a.tested] || ""}</td>
  </tr>`
).join("");

// Défilement vers l'ancre après génération du contenu
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();

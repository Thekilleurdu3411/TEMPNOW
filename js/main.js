/**
 * Point d'entrée : initialise chaque chapitre indépendamment (une erreur dans
 * un chapitre n'empêche jamais les autres de fonctionner).
 */
import { initStats } from "./core/stats.js";
import { initReveal, replayAll, onReplay } from "./core/motion.js";
import { replayCharts } from "./core/charts.js";
import * as hero from "./chapters/hero.js";
import * as counters from "./chapters/counters.js";
import * as temperatures from "./chapters/temperatures.js";
import * as gases from "./chapters/gases.js";
import * as oceans from "./chapters/oceans.js";
import * as ice from "./chapters/ice.js";
import * as disasters from "./chapters/disasters.js";
import * as weather from "./chapters/weather.js";
import * as rivers from "./chapters/rivers.js";
import * as energy from "./chapters/energy.js";
import * as health from "./chapters/health.js";
import * as france from "./chapters/france.js";

const chapters = { hero, counters, temperatures, gases, oceans, ice, disasters, weather, rivers, energy, health, france };

function safe(name, fn) {
  try {
    fn();
  } catch (e) {
    console.error(`Chapitre « ${name} » :`, e);
  }
}

safe("stats", initStats);
Object.entries(chapters).forEach(([name, mod]) => safe(name, mod.init));
safe("reveal", initReveal);
onReplay(replayCharts);

// Bouton « Rejouer les animations » --------------------------------------------
document.querySelectorAll("[data-replay]").forEach((b) =>
  b.addEventListener("click", () => {
    replayAll();
    b.classList.add("spin");
    setTimeout(() => b.classList.remove("spin"), 700);
  })
);

// Navigation collante : chapitre actif --------------------------------------------
const nav = document.querySelector(".chapnav");
if (nav && "IntersectionObserver" in window) {
  const links = new Map([...nav.querySelectorAll("a[href^='#']")].map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        const a = links.get(en.target.id);
        if (a) {
          a.setAttribute("aria-current", "true");
          // Garder le lien actif visible dans la barre (défilement interne seulement)
          const strip = nav.querySelector("ul");
          strip.scrollTo({ left: a.offsetLeft - strip.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  links.forEach((_, id) => {
    const sec = document.getElementById(id);
    if (sec) io.observe(sec);
  });
}

// Année courante dans le pied de page
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

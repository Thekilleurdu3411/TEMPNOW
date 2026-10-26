/**
 * Chart.js : thème « instrument », création au défilement (le graphique se trace
 * quand il entre à l'écran) et relecture des animations.
 */
import { reducedMotion } from "./motion.js";
import { fmt } from "./format.js";

export const C = {
  hot: "#ff5a36",
  hot2: "#ffb020",
  cold: "#3fa7ff",
  cold2: "#7fd1ff",
  ok: "#3ddc97",
  ink: "#e8edf2",
  muted: "#9aa7b4",
  grid: "rgba(154,167,180,.14)",
  panel: "#0e131a",
};

const charts = new Set();
let ready = false;

function setup() {
  if (ready || !window.Chart) return !!window.Chart;
  const Ch = window.Chart;
  Ch.defaults.color = C.muted;
  Ch.defaults.font.family = '"JetBrains Mono", ui-monospace, monospace';
  Ch.defaults.font.size = 11;
  Ch.defaults.borderColor = C.grid;
  Ch.defaults.maintainAspectRatio = false;
  Ch.defaults.animation.duration = reducedMotion() ? 0 : 1400;
  Ch.defaults.animation.easing = "easeOutQuart";
  // Infobulles adaptées au toucher : survol/appui n'importe où sur l'axe X
  Ch.defaults.interaction = { mode: "index", intersect: false, axis: "x" };
  Ch.defaults.plugins.tooltip.backgroundColor = "rgba(7,9,13,.94)";
  Ch.defaults.plugins.tooltip.borderColor = "rgba(232,237,242,.25)";
  Ch.defaults.plugins.tooltip.borderWidth = 1;
  Ch.defaults.plugins.tooltip.titleColor = C.ink;
  Ch.defaults.plugins.tooltip.bodyColor = C.ink;
  Ch.defaults.plugins.tooltip.padding = 10;
  Ch.defaults.plugins.tooltip.callbacks.label = (ctx) => {
    const v = ctx.chart.options.indexAxis === "y" ? ctx.parsed.x : ctx.parsed.y ?? ctx.parsed;
    const ds = ctx.dataset.label ? ctx.dataset.label + " : " : "";
    return ds + (typeof v === "number" ? fmt(v, Math.abs(v) < 10 ? 2 : Math.abs(v) < 1000 ? 1 : 0) : v);
  };
  Ch.defaults.plugins.legend.labels.boxWidth = 10;
  Ch.defaults.plugins.legend.labels.boxHeight = 10;
  Ch.defaults.elements.point.radius = 0;
  Ch.defaults.elements.point.hoverRadius = 4;
  Ch.defaults.elements.line.borderWidth = 2;
  Ch.defaults.elements.line.tension = 0.25;
  ready = true;
  return true;
}

/**
 * Crée (ou recrée) un graphique dans un <canvas>, au moment où il devient visible.
 * Retourne une promesse résolue avec l'instance.
 */
export function chart(canvas, config) {
  if (!canvas) return Promise.resolve(null);
  if (!setup()) {
    canvas.replaceWith(Object.assign(document.createElement("p"), { className: "muted", textContent: "Graphique indisponible (bibliothèque non chargée)." }));
    return Promise.resolve(null);
  }
  const o = (config.options ||= {});
  if (o.indexAxis === "y" && !o.interaction) o.interaction = { mode: "index", intersect: false, axis: "y" };
  const old = window.Chart.getChart(canvas);
  if (old) {
    charts.delete(old);
    old.destroy();
  }
  return new Promise((resolve) => {
    const make = () => {
      const c = new window.Chart(canvas, config);
      charts.add(c);
      resolve(c);
    };
    if (!("IntersectionObserver" in window)) return make();
    const io = new IntersectionObserver(
      (en) => {
        if (en.some((e) => e.isIntersecting)) {
          io.disconnect();
          make();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(canvas);
  });
}

export function replayCharts() {
  charts.forEach((c) => {
    if (!c.canvas?.isConnected) {
      charts.delete(c);
      return;
    }
    c.reset();
    c.update();
  });
}

/** Dégradé vertical chaud/froid pour une série d'anomalies */
export function anomalyGradient(ctx, area) {
  const g = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  g.addColorStop(0, C.cold);
  g.addColorStop(0.45, "#c6dbef");
  g.addColorStop(0.6, C.hot2);
  g.addColorStop(1, C.hot);
  return g;
}

export const gradientLine = (c) => {
  const { ctx, chartArea } = c.chart;
  return chartArea ? anomalyGradient(ctx, chartArea) : C.hot;
};

export const axisTitle = (text) => ({ display: true, text, color: C.muted, font: { size: 10 } });

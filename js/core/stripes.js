/**
 * Bandes de réchauffement (« warming stripes », Ed Hawkins) sur <canvas>.
 * Palette ColorBrewer RdBu 16 classes, centrée sur l'anomalie nulle.
 */
import { reducedMotion, onReplay } from "./motion.js";
import { signed } from "./format.js";

export const STRIPE_COLORS = [
  "#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef", "#deebf7",
  "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d",
];

export function colorFor(v, range) {
  if (v == null || Number.isNaN(v)) return "#1a2029";
  const t = Math.max(-1, Math.min(1, v / range)); // -1..1
  const idx = Math.min(15, Math.max(0, Math.floor(((t + 1) / 2) * 16)));
  return STRIPE_COLORS[idx];
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{label:string|number, value:number}[]} items
 * @param {{range?:number, duration?:number, tooltip?:HTMLElement, unit?:string}} opt
 */
export function drawStripes(canvas, items, opt = {}) {
  const range = opt.range ?? Math.max(0.5, ...items.map((d) => Math.abs(d.value ?? 0))) * 0.95;
  const ctx = canvas.getContext("2d");

  function size() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || 120;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function paint(progress = 1) {
    const { w, h } = size();
    ctx.clearRect(0, 0, w, h);
    const n = items.length;
    const sw = w / n;
    const shown = Math.ceil(n * progress);
    for (let i = 0; i < shown; i++) {
      ctx.fillStyle = colorFor(items[i].value, range);
      // +1 px pour éviter les liserés entre bandes
      ctx.fillRect(Math.floor(i * sw), 0, Math.ceil(sw) + 1, h);
    }
  }

  function animate() {
    cancelAnimationFrame(canvas._raf);
    if (reducedMotion()) return paint(1);
    const dur = opt.duration ?? 2200;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      paint(1 - Math.pow(1 - p, 3));
      if (p < 1) canvas._raf = requestAnimationFrame(step);
    };
    canvas._raf = requestAnimationFrame(step);
  }

  // Infobulle au toucher / survol
  const tip = opt.tooltip;
  if (tip) {
    const show = (clientX) => {
      const r = canvas.getBoundingClientRect();
      const i = Math.max(0, Math.min(items.length - 1, Math.floor(((clientX - r.left) / r.width) * items.length)));
      const d = items[i];
      tip.hidden = false;
      tip.textContent = `${d.label} : ${signed(d.value, 2)} ${opt.unit || "°C"}`;
      const x = Math.max(60, Math.min(r.width - 60, clientX - r.left));
      tip.style.left = x + "px";
    };
    canvas.onpointermove = (e) => show(e.clientX);
    canvas.onpointerdown = (e) => show(e.clientX);
    canvas.onpointerleave = () => (tip.hidden = true);
  }

  canvas._stripes = { animate, paint };
  if (!canvas._stripesInit) {
    // Un seul observateur et un seul crochet de relecture par canvas,
    // même si les bandes sont redessinées (changement de ville…)
    canvas._stripesInit = true;
    let lastW = canvas.clientWidth;
    new ResizeObserver(() => {
      if (canvas.clientWidth !== lastW) {
        lastW = canvas.clientWidth;
        canvas._stripes.paint(1);
      }
    }).observe(canvas);
    onReplay(() => canvas._stripes.animate());
  }

  animate();
  return { animate, range };
}

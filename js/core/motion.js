/**
 * Animations : apparitions au défilement (GSAP + ScrollTrigger), respect de
 * prefers-reduced-motion, et relecture globale.
 */

const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
export const reducedMotion = () => mq.matches;

const replayHooks = new Set();
/** Enregistre une fonction rappelée par le bouton « Rejouer les animations » */
export function onReplay(fn) {
  replayHooks.add(fn);
}
export function replayAll() {
  replayHooks.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("replay", e);
    }
  });
}

export function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  const gsap = window.gsap;
  if (reducedMotion() || !gsap || !window.ScrollTrigger) {
    els.forEach((el) => el.classList.add("revealed"));
    return;
  }
  gsap.registerPlugin(window.ScrollTrigger);
  els.forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });
  // Barre de progression de lecture
  const prog = document.querySelector(".read-progress");
  if (prog) {
    gsap.to(prog, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
    });
  }
  onReplay(() => {
    gsap.fromTo(els, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.02, ease: "power3.out" });
  });
}

/** Compteur animé (CountUp.js si disponible) */
export function countTo(el, value, { decimals = 0, prefix = "", suffix = "", duration = 2 } = {}) {
  const CU = window.countUp?.CountUp;
  const opts = {
    decimalPlaces: decimals,
    duration: reducedMotion() ? 0 : duration,
    separator: " ",
    decimal: ",",
    prefix,
    suffix,
    enableScrollSpy: false,
  };
  if (!CU || reducedMotion()) {
    el.textContent = prefix + new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value) + suffix;
    return { replay() {} };
  }
  const cu = new CU(el, value, opts);
  if (cu.error) {
    el.textContent = prefix + value + suffix;
    return { replay() {} };
  }
  const start = () => cu.start();
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => {
      if (en.some((e) => e.isIntersecting)) {
        io.disconnect();
        start();
      }
    });
    io.observe(el);
  } else start();
  return {
    replay() {
      cu.reset();
      cu.start();
    },
  };
}

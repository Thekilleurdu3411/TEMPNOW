/**
 * Accès réseau : fetch JSON avec délai maximal et cache localStorage optionnel.
 * Le cache n'est utilisé que pour les appels lourds (historiques) : ttl > 0.
 * Toute lecture/écriture localStorage est protégée (navigation privée, quota…).
 */

const PREFIX = "tempnow:v1:";

function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  const entry = JSON.stringify({ t: Date.now(), data });
  try {
    localStorage.setItem(PREFIX + key, entry);
  } catch {
    // Quota plein : on purge nos propres entrées puis on réessaie une fois.
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(PREFIX + key, entry);
    } catch {
      /* tant pis : pas de cache */
    }
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* rien */
  }
}

/**
 * @param {string} url
 * @param {object} opts
 * @param {number} [opts.timeout=15000] délai en ms
 * @param {string} [opts.cacheKey] clé de cache (obligatoire si ttl)
 * @param {number} [opts.ttl=0] durée de validité du cache en ms
 * @param {boolean} [opts.force=false] ignorer le cache (bouton Actualiser)
 * @param {"json"|"text"} [opts.as="json"]
 * @returns {Promise<{data:any, fetchedAt:Date, fromCache:boolean}>}
 */
export async function getJSON(url, opts = {}) {
  const { timeout = 15000, cacheKey, ttl = 0, force = false, as = "json" } = opts;

  if (ttl > 0 && cacheKey && !force) {
    const hit = readCache(cacheKey);
    if (hit && Date.now() - hit.t < ttl) {
      return { data: hit.data, fetchedAt: new Date(hit.t), fromCache: true };
    }
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = as === "text" ? await res.text() : await res.json();
    if (data && data.error === true && data.reason) {
      // Format d'erreur d'Open-Meteo
      throw new Error(data.reason);
    }
    if (ttl > 0 && cacheKey) writeCache(cacheKey, data);
    return { data, fetchedAt: new Date(), fromCache: false };
  } catch (e) {
    // En cas d'échec, un cache périmé vaut mieux que rien.
    if (cacheKey) {
      const stale = readCache(cacheKey);
      if (stale) return { data: stale.data, fetchedAt: new Date(stale.t), fromCache: true, stale: true };
    }
    if (e.name === "AbortError") throw new Error("délai dépassé");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export const HOUR = 3600e3;
export const DAY = 24 * HOUR;

/**
 * Met en cache le résultat (déjà réduit) d'un calcul coûteux : on stocke par
 * exemple des moyennes annuelles plutôt que 27 000 valeurs journalières brutes.
 */
export async function cached(key, ttl, force, producer) {
  if (!force) {
    const hit = readCache(key);
    if (hit && Date.now() - hit.t < ttl) return { data: hit.data, fetchedAt: new Date(hit.t), fromCache: true };
  }
  try {
    const data = await producer();
    writeCache(key, data);
    return { data, fetchedAt: new Date(), fromCache: false };
  } catch (e) {
    const stale = readCache(key);
    if (stale) return { data: stale.data, fetchedAt: new Date(stale.t), fromCache: true, stale: true };
    throw e;
  }
}

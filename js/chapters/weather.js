/**
 * Chapitre Météo & air : conditions actuelles de 24 villes (Open-Meteo), qualité de
 * l'air (Open-Meteo Air Quality / CAMS), vagues de chaleur à 7 jours, alertes
 * chaleur du National Weather Service américain.
 */
import { liveBlock } from "../core/live.js";
import { getJSON } from "../core/fetcher.js";
import { fmt, esc } from "../core/format.js";
import { CITIES, WMO, tempColor, eaqiClass } from "./cities.js";

const lat = CITIES.map((c) => c.lat).join(",");
const lon = CITIES.map((c) => c.lon).join(",");
const asArr = (d) => (Array.isArray(d) ? d : [d]);

let weatherCache = null;

function loadWeather(force) {
  if (weatherCache && !force) return weatherCache;
  weatherCache = getJSON(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day" +
      "&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,uv_index_max&forecast_days=7&timezone=auto",
    { timeout: 20000 }
  );
  weatherCache.catch(() => (weatherCache = null));
  return weatherCache;
}

export function init() {
  // Conditions actuelles ---------------------------------------------------
  liveBlock(document.getElementById("cities-live"), {
    source: "Open-Meteo (modèles Météo-France, DWD, NOAA…)",
    sourceUrl: "https://open-meteo.com/en/docs",
    interval: 15 * 60e3,
    load: ({ force }) => loadWeather(force),
    render: (data, body) => {
      const arr = asArr(data);
      const rows = arr.map((d, i) => ({ ...CITIES[i], cur: d.current, daily: d.daily }));
      body.querySelector(".city-grid").innerHTML = rows
        .map((c, i) => {
          const t = c.cur?.temperature_2m;
          const [lbl, ico] = WMO[c.cur?.weather_code] || ["—", ""];
          return `<article class="city-card ${i === 0 ? "featured" : ""}" style="--tc:${tempColor(t)}">
            <header><h4>${esc(c.name)}</h4><span class="muted small">${esc(c.country)}</span></header>
            <div class="city-temp-big">${fmt(t, 1)}<small>°C</small></div>
            <p class="city-cond"><span aria-hidden="true">${ico}</span> ${esc(lbl)}</p>
            <dl>
              <div><dt>Ressenti</dt><dd>${fmt(c.cur?.apparent_temperature, 0)} °C</dd></div>
              <div><dt>Humidité</dt><dd>${fmt(c.cur?.relative_humidity_2m, 0)} %</dd></div>
              <div><dt>Vent</dt><dd>${fmt(c.cur?.wind_speed_10m, 0)} km/h</dd></div>
              <div><dt>UV max</dt><dd>${fmt(c.daily?.uv_index_max?.[0], 1)}</dd></div>
            </dl>
          </article>`;
        })
        .join("");
      window.dispatchEvent(
        new CustomEvent("tempnow:cities", { detail: rows.map((c) => ({ name: c.name, lat: c.lat, lon: c.lon, temp: c.cur?.temperature_2m, feels: c.cur?.apparent_temperature })) })
      );
      const hottest = rows.reduce((a, b) => ((b.cur?.temperature_2m ?? -99) > (a.cur?.temperature_2m ?? -99) ? b : a));
      const coldest = rows.reduce((a, b) => ((b.cur?.temperature_2m ?? 99) < (a.cur?.temperature_2m ?? 99) ? b : a));
      body.querySelector(".chart-note").innerHTML = `En ce moment, la ville la plus chaude est <strong>${esc(hottest.name)}</strong> (${fmt(hottest.cur.temperature_2m, 1)} °C), la plus froide <strong>${esc(coldest.name)}</strong> (${fmt(coldest.cur.temperature_2m, 1)} °C). Heure locale de chaque ville.`;
      return { observedAt: arr[0]?.current?.time ? new Date(Date.parse(arr[0].current.time + "Z") - arr[0].utc_offset_seconds * 1000) : null };
    },
  });

  // Vagues de chaleur à 7 jours -------------------------------------------------
  liveBlock(document.getElementById("heat-live"), {
    source: "Open-Meteo (prévisions 7 jours)",
    sourceUrl: "https://open-meteo.com/en/docs",
    load: ({ force }) => loadWeather(force),
    render: (data, body) => {
      const arr = asArr(data);
      const rows = arr
        .map((d, i) => {
          const tx = d.daily?.temperature_2m_max || [];
          const tn = d.daily?.temperature_2m_min || [];
          const max = Math.max(...tx.filter((v) => v != null));
          const hot = tx.filter((v) => v >= 35).length;
          const tropical = tn.filter((v) => v >= 20).length;
          return { ...CITIES[i], tx, max, hot, tropical, days: d.daily?.time || [] };
        })
        .sort((a, b) => b.max - a.max);
      const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
      body.querySelector(".heat-table tbody").innerHTML = rows
        .map(
          (c) => `<tr class="${c.hot >= 3 ? "alert" : ""}">
            <th scope="row">${esc(c.name)}</th>
            <td class="bars">${c.tx
              .map((v, j) => `<span title="${dayFmt.format(new Date(c.days[j]))} : ${fmt(v, 0)} °C" style="--h:${Math.max(4, Math.min(100, ((v + 10) / 55) * 100))}%;--c:${tempColor(v)}"></span>`)
              .join("")}</td>
            <td class="num">${fmt(c.max, 0)}°</td>
            <td class="num">${c.hot ? `<span class="badge hot">${c.hot} j ≥ 35°</span>` : "—"}</td>
            <td class="num">${c.tropical ? `${c.tropical} nuit${c.tropical > 1 ? "s" : ""}` : "—"}</td>
          </tr>`
        )
        .join("");
      const n = rows.filter((c) => c.hot >= 3).length;
      body.querySelector(".chart-note").innerHTML = n
        ? `<strong>${n} ville${n > 1 ? "s" : ""}</strong> sur ${rows.length} prévoi${n > 1 ? "ent" : "t"} au moins 3 jours à 35 °C ou plus cette semaine.`
        : `Aucune des ${rows.length} villes ne prévoit 3 jours à 35 °C ou plus cette semaine.`;
      return {};
    },
  });

  // Qualité de l'air ----------------------------------------------------------
  liveBlock(document.getElementById("air-live"), {
    source: "Open-Meteo Air Quality (Copernicus CAMS)",
    sourceUrl: "https://open-meteo.com/en/docs/air-quality-api",
    interval: 30 * 60e3,
    load: () =>
      getJSON(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,dust&timezone=auto`,
        { timeout: 20000 }
      ),
    render: (data, body) => {
      const arr = asArr(data);
      const rows = arr.map((d, i) => ({ ...CITIES[i], c: d.current || {} })).sort((a, b) => (b.c.pm2_5 ?? 0) - (a.c.pm2_5 ?? 0));
      body.querySelector(".air-table tbody").innerHTML = rows
        .map((r) => {
          const [lbl, cls] = eaqiClass(r.c.european_aqi);
          const ratio = r.c.pm2_5 != null ? r.c.pm2_5 / 15 : null; // ligne directrice OMS 24 h : 15 µg/m³
          return `<tr>
            <th scope="row">${esc(r.name)}</th>
            <td><span class="aqi ${cls}">${fmt(r.c.european_aqi, 0)} · ${lbl}</span></td>
            <td class="num">${fmt(r.c.pm2_5, 1)}${ratio && ratio > 1 ? ` <span class="badge hot" title="Multiple du seuil journalier OMS (15 µg/m³)">×${fmt(ratio, 1)}</span>` : ""}</td>
            <td class="num opt">${fmt(r.c.pm10, 0)}</td>
            <td class="num opt">${fmt(r.c.nitrogen_dioxide, 0)}</td>
            <td class="num opt">${fmt(r.c.ozone, 0)}</td>
          </tr>`;
        })
        .join("");
      return { observedAt: arr[0]?.current?.time ? new Date(Date.parse(arr[0].current.time + "Z") - arr[0].utc_offset_seconds * 1000) : null };
    },
  });

  // Alertes chaleur aux États-Unis (NWS) -----------------------------------------
  liveBlock(document.getElementById("nws-live"), {
    source: "NOAA National Weather Service",
    sourceUrl: "https://www.weather.gov/documentation/services-web-api",
    load: () =>
      getJSON("https://api.weather.gov/alerts/active?status=actual&event=Extreme%20Heat%20Warning,Extreme%20Heat%20Watch,Heat%20Advisory,Excessive%20Heat%20Warning,Excessive%20Heat%20Watch", {
        timeout: 20000,
      }),
    render: (data, body) => {
      const feats = data.features || [];
      const byEvent = {};
      feats.forEach((f) => (byEvent[f.properties.event] = (byEvent[f.properties.event] || 0) + 1));
      const FR = {
        "Extreme Heat Warning": "Avertissement chaleur extrême",
        "Excessive Heat Warning": "Avertissement chaleur excessive",
        "Extreme Heat Watch": "Veille chaleur extrême",
        "Excessive Heat Watch": "Veille chaleur excessive",
        "Heat Advisory": "Avis de chaleur",
      };
      body.querySelector(".nws-count").textContent = fmt(feats.length);
      body.querySelector(".event-list").innerHTML = feats.length
        ? Object.entries(byEvent).map(([k, n]) => `<li><span class="badge hot">${n}</span> ${esc(FR[k] || k)}</li>`).join("") +
          feats.slice(0, 5).map((f) => `<li class="muted small">${esc(f.properties.areaDesc).slice(0, 120)}</li>`).join("")
        : `<li class="muted">Aucune alerte chaleur active aux États-Unis en ce moment.</li>`;
      return { observedAt: data.updated };
    },
  });
}

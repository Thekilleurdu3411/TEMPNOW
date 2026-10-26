/** Villes suivies (Périgueux en tête). */
export const CITIES = [
  { name: "Périgueux", country: "France", lat: 45.184, lon: 0.7218 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Marseille", country: "France", lat: 43.2965, lon: 5.3698 },
  { name: "Bordeaux", country: "France", lat: 44.8378, lon: -0.5792 },
  { name: "Lyon", country: "France", lat: 45.764, lon: 4.8357 },
  { name: "Londres", country: "Royaume-Uni", lat: 51.5072, lon: -0.1276 },
  { name: "Madrid", country: "Espagne", lat: 40.4168, lon: -3.7038 },
  { name: "Rome", country: "Italie", lat: 41.9028, lon: 12.4964 },
  { name: "Berlin", country: "Allemagne", lat: 52.52, lon: 13.405 },
  { name: "Moscou", country: "Russie", lat: 55.7558, lon: 37.6173 },
  { name: "Le Caire", country: "Égypte", lat: 30.0444, lon: 31.2357 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
  { name: "Dubaï", country: "Émirats arabes unis", lat: 25.2048, lon: 55.2708 },
  { name: "Delhi", country: "Inde", lat: 28.6139, lon: 77.209 },
  { name: "Pékin", country: "Chine", lat: 39.9042, lon: 116.4074 },
  { name: "Tokyo", country: "Japon", lat: 35.6762, lon: 139.6503 },
  { name: "Jakarta", country: "Indonésie", lat: -6.2088, lon: 106.8456 },
  { name: "Sydney", country: "Australie", lat: -33.8688, lon: 151.2093 },
  { name: "New York", country: "États-Unis", lat: 40.7128, lon: -74.006 },
  { name: "Phoenix", country: "États-Unis", lat: 33.4484, lon: -112.074 },
  { name: "Mexico", country: "Mexique", lat: 19.4326, lon: -99.1332 },
  { name: "São Paulo", country: "Brésil", lat: -23.5505, lon: -46.6333 },
  { name: "Reykjavik", country: "Islande", lat: 64.1466, lon: -21.9426 },
];

/** Codes météo WMO -> libellé + pictogramme */
export const WMO = {
  0: ["Ciel clair", "☀️"], 1: ["Peu nuageux", "🌤️"], 2: ["Partiellement nuageux", "⛅"], 3: ["Couvert", "☁️"],
  45: ["Brouillard", "🌫️"], 48: ["Brouillard givrant", "🌫️"],
  51: ["Bruine légère", "🌦️"], 53: ["Bruine", "🌦️"], 55: ["Bruine dense", "🌧️"], 56: ["Bruine verglaçante", "🌧️"], 57: ["Bruine verglaçante", "🌧️"],
  61: ["Pluie faible", "🌦️"], 63: ["Pluie", "🌧️"], 65: ["Forte pluie", "🌧️"], 66: ["Pluie verglaçante", "🌧️"], 67: ["Pluie verglaçante", "🌧️"],
  71: ["Neige faible", "🌨️"], 73: ["Neige", "🌨️"], 75: ["Forte neige", "❄️"], 77: ["Grains de neige", "🌨️"],
  80: ["Averses", "🌦️"], 81: ["Averses", "🌧️"], 82: ["Violentes averses", "⛈️"], 85: ["Averses de neige", "🌨️"], 86: ["Averses de neige", "🌨️"],
  95: ["Orage", "⛈️"], 96: ["Orage + grêle", "⛈️"], 99: ["Orage + forte grêle", "⛈️"],
};

/** Échelle de couleur continue pour une température (°C) */
export function tempColor(t) {
  if (t == null) return "#334";
  const stops = [
    [-20, "#08306b"], [-5, "#2171b5"], [5, "#6baed6"], [12, "#c6dbef"], [18, "#fee0d2"],
    [24, "#fc9272"], [30, "#ef3b2c"], [36, "#a50f15"], [45, "#67000d"],
  ];
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return stops[i - 1][1];
  return stops.at(-1)[1];
}

/** Indice européen de qualité de l'air (EAQI) -> classe */
export function eaqiClass(v) {
  if (v == null) return ["—", "q0"];
  if (v <= 20) return ["Bon", "q1"];
  if (v <= 40) return ["Correct", "q2"];
  if (v <= 60) return ["Moyen", "q3"];
  if (v <= 80) return ["Médiocre", "q4"];
  if (v <= 100) return ["Très médiocre", "q5"];
  return ["Extrêmement médiocre", "q6"];
}

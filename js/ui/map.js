// Schematische Reisekarte als SVG.

import { LAND } from "../../data/europe.js";
import { COUNTRIES } from "../../data/journeys.js";
import { esc } from "./dom.js";

const K = 10;
const COS = Math.cos((54 * Math.PI) / 180);
const px = (lon) => (lon + 30) * COS * K;
const py = (lat) => (75 - lat) * K;

let uid = 0;

// reached = Anzahl erreichter Stationen (0 bis 10)
export function mapSVG(journey, reached, { labels = true } = {}) {
  const ids = [journey.start, ...journey.stops];
  const pts = ids.map((id) => ({ id, c: COUNTRIES[id], x: px(COUNTRIES[id].lon), y: py(COUNTRIES[id].lat) }));

  // Ausschnitt um die Reise, mit Rand, nicht zu schmal
  let x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x));
  let y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
  const pad = 30;
  x0 -= pad; x1 += pad; y0 -= pad; y1 += pad + 10;
  const w = x1 - x0, h = y1 - y0;
  if (w / h < 1.1) { const d = (h * 1.1 - w) / 2; x0 -= d; x1 += d; }
  if (h / w < 0.7) { const d = (w * 0.7 - h) / 2; y0 -= d; y1 += d; }
  const W = x1 - x0, H = y1 - y0;
  const u = Math.max(W, H) / 100; // Grundeinheit für Strichstärken

  const land = LAND.map((poly) => "M" + poly.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join(" L") + " Z").join(" ");

  const n = ++uid;
  let route = "";
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const done = i <= reached;
    route += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${done ? "route-done" : "route"}" stroke-width="${(done ? 1.1 : 0.7) * u}" ${done ? "" : `stroke-dasharray="${1.5 * u} ${1.2 * u}"`}/>`;
  }

  const R = 3.2 * u;
  let stops = "";
  pts.forEach((p, i) => {
    const isStart = i === 0;
    const got = isStart || i <= reached;
    const target = i === reached + 1;
    if (got) {
      const cid = `m${n}-${i}`;
      stops += `<clipPath id="${cid}"><circle cx="${p.x}" cy="${p.y}" r="${R}"/></clipPath>
        <image href="flags/${p.id}.svg" x="${p.x - R * 1.5}" y="${p.y - R}" width="${R * 3}" height="${R * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${cid})"/>
        <circle cx="${p.x}" cy="${p.y}" r="${R}" class="stop-ring" stroke-width="${0.5 * u}"/>`;
      if (labels) stops += `<text x="${p.x}" y="${p.y + R + 3.2 * u}" class="map-label" font-size="${3 * u}">${esc(p.c.name)}</text>`;
    } else if (target) {
      stops += `<circle cx="${p.x}" cy="${p.y}" r="${R}" class="stop-target" stroke-width="${0.8 * u}"/>`;
    } else {
      stops += `<circle cx="${p.x}" cy="${p.y}" r="${1.3 * u}" class="stop-later"/>`;
    }
  });

  return `<svg class="map" viewBox="${x0} ${y0} ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Reisekarte ${esc(journey.name)}">
    <rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="sea"/>
    <path d="${land}" class="land" stroke-width="${0.3 * u}"/>
    ${route}${stops}
  </svg>`;
}

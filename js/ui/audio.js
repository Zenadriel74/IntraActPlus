// Motivationssprüche abspielen. Die Dateien legst du selbst in audio/ ab
// (Liste in audio/SPRUECHE.md). Fehlt eine Datei, bleibt es still.

import { state } from "../store.js";

// Anlass -> Anzahl Varianten (anlass_1.mp3 bis anlass_N.mp3)
export const OCCASIONS = {
  start: 4,
  haelfte: 4,
  kapitel: 5,
  reise: 3,
  weiter: 4,
};

let current = null;
const missing = new Set();

export function say(occasion) {
  if (!state.settings.sound) return;
  const n = OCCASIONS[occasion];
  if (!n) return;
  const candidates = [];
  for (let i = 1; i <= n; i++) {
    const src = `audio/${occasion}_${i}.mp3`;
    if (!missing.has(src)) candidates.push(src);
  }
  // zufällige Reihenfolge, die erste vorhandene Datei wird gespielt
  candidates.sort(() => Math.random() - 0.5);
  stop();
  tryPlay(candidates);
}

function tryPlay(list) {
  if (!list.length) return;
  const [src, ...rest] = list;
  const a = new Audio(src);
  current = a;
  a.addEventListener("error", () => {
    missing.add(src);
    if (current === a) tryPlay(rest);
  });
  a.play().catch(() => {
    /* z. B. Autoplay blockiert oder Datei fehlt: still weiter */
  });
}

export function stop() {
  if (current) {
    current.pause();
    current = null;
  }
}

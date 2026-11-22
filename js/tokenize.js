// Zerlegt ein Wort in die Bausteine, die man zum Lesen können muss.
// Dient nur der Freischaltung von Wörtern. Die Silben selbst kommen aus words.js.
//
// Es wird Silbe für Silbe zerlegt, damit z. B. "Pin-gu-in" kein "ng" bekommt.
// Mehrfachbuchstaben und Vokalverbindungen werden als Einheit erkannt
// (längster Treffer zuerst), am Wortanfang zusätzlich "sp" und "st".
// Steht so eine Einheit großgeschrieben am Anfang ("Ei", "Sch"), braucht es
// außerdem den Großbuchstaben.

import { ELEMENTS, BY_ID } from "../data/elements.js";
import { WORDS } from "../data/words.js";
import { score, CAN } from "./learning.js";

const UNITS = ELEMENTS.filter((e) => e.cat === "mehrfach" || e.cat === "vokal")
  .map((e) => e.text)
  .sort((a, b) => b.length - a.length);

const cache = new Map();

export function wordUnits(word) {
  if (cache.has(word.w)) return cache.get(word.w);
  const req = new Set();
  word.s.forEach((syl, si) => {
    const low = syl.toLowerCase();
    if (si === 0 && /^s[pt]/.test(low) && !low.startsWith("sch")) req.add(low.slice(0, 2));
    let i = 0;
    while (i < syl.length) {
      const unit = UNITS.find((u) => low.startsWith(u, i));
      if (unit) {
        req.add(unit);
        if (syl[i] !== low[i]) req.add(syl[i]);
        i += unit.length;
      } else {
        req.add(syl[i]);
        i += 1;
      }
    }
  });
  const list = [...req].filter((id) => BY_ID[id]);
  cache.set(word.w, list);
  return list;
}

// Wortliste ohne fehlerhafte Einträge
export const VALID_WORDS = WORDS.filter((x) => {
  const ok = Array.isArray(x.s) && x.s.join("") === x.w;
  if (!ok) console.warn("Wortliste: Silben passen nicht zum Wort:", x.w);
  return ok;
});

export function wordReady(word) {
  return wordUnits(word).every((id) => score("item", id) >= CAN);
}

export function availableWords() {
  return VALID_WORDS.filter(wordReady);
}

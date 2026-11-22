// Lernstand pro Element und Wort fortschreiben.
//
// Bewertung: Delfin (flu) = 1, Schildkröte (slow) = 0,5, Fragezeichen (dk) = 0.
// Der Score ist ein gleitender Durchschnitt. Bei den ersten Bewertungen zählt
// jede stärker (echter Mittelwert), danach mit festem Gewicht. Im Tagescheck
// zählt eine Bewertung nur schwach, damit ein schlechter Tag wenig ausmacht.

import { state, today, addDays, dayRecord } from "./store.js";
import { ELEMENTS } from "../data/elements.js";

export const VALUE = { flu: 1, slow: 0.5, dk: 0 };
export const SURE = 0.8;
export const UNSURE = 0.35;
export const CAN = 0.6; // ab hier gilt ein Baustein als "kann" (für Wörter und Voraussetzungen)
export const SURE_MIN_SEEN = 4;
const ALPHA_UNIT = 0.25;
const ALPHA_CHECK = 0.1;
const INTERVALS = [1, 2, 4, 8, 16, 30];

function bucket(kind) {
  return kind === "word" ? state.words : state.items;
}

export function entry(kind, id) {
  return bucket(kind)[id] || null;
}

function ensure(kind, id) {
  const b = bucket(kind);
  if (!b[id]) b[id] = { score: 0, seen: 0, introduced: null, interval: 0, due: null, last: null, recent: [] };
  return b[id];
}

export function score(kind, id) {
  return entry(kind, id)?.score ?? 0;
}

export function status(e) {
  if (!e || e.seen === 0 || e.score < UNSURE) return "unbekannt";
  if (e.score >= SURE && e.seen >= SURE_MIN_SEEN) return "sicher";
  return "unsicher";
}

export function statusOf(kind, id) {
  return status(entry(kind, id));
}

// schon gezeigt, aber noch nicht sicher
export function introducing(kind, id) {
  const e = entry(kind, id);
  return !!(e && e.introduced && status(e) !== "sicher");
}

export function rate(kind, id, r, ms, { mode = "unit" } = {}) {
  const e = ensure(kind, id);
  const v = VALUE[r];
  const t = today();
  if (!e.introduced) e.introduced = t;
  const alpha = mode === "check" ? ALPHA_CHECK : Math.max(ALPHA_UNIT, 1 / (e.seen + 1));
  e.score = Math.min(1, Math.max(0, e.score + alpha * (v - e.score)));
  e.seen += 1;
  e.last = t;
  e.recent.push({ d: t, r, ms: Math.round(ms || 0), m: mode === "check" ? "c" : "u" });
  if (e.recent.length > 12) e.recent.shift();
  updateSpacing(e, r, t);
  dayRecord(t).ratings[r] += 1;
}

function updateSpacing(e, r, t) {
  if (status(e) !== "sicher") {
    e.interval = 0;
    e.due = t;
    return;
  }
  if (r === "dk") e.interval = 1;
  else if (r === "flu") {
    const i = INTERVALS.indexOf(e.interval);
    e.interval = i < 0 ? INTERVALS[0] : INTERVALS[Math.min(INTERVALS.length - 1, i + 1)];
  } else if (!e.interval) e.interval = 1;
  e.due = addDays(t, e.interval);
}

// Eingangstest: setzt einen Startwert, statt fortzuschreiben.
export function seedFromPlacement(kind, id, r, ms) {
  const e = ensure(kind, id);
  const t = today();
  e.recent.push({ d: t, r, ms: Math.round(ms || 0), m: "t" });
  if (e.recent.length > 12) e.recent.shift();
  e.tested = t;
  if (r === "flu") {
    Object.assign(e, { score: 0.9, seen: SURE_MIN_SEEN, introduced: t, interval: 2, due: addDays(t, 2), last: t });
  } else if (r === "slow") {
    Object.assign(e, { score: 0.55, seen: 2, introduced: t, interval: 0, due: t, last: t });
  } else {
    // weiß nicht: bleibt neu und wird später regulär eingeführt
    Object.assign(e, { score: 0, seen: 0, introduced: null, interval: 0, due: null });
  }
}

export function noteSplit(word, ok) {
  const e = ensure("word", word);
  e.split = e.split || { ok: 0, total: 0 };
  e.split.total += 1;
  if (ok) e.split.ok += 1;
}

export function countSure() {
  return ELEMENTS.filter((el) => statusOf("item", el.id) === "sicher").length;
}

// Buchstaben, die ein Baustein voraussetzt, sitzen schon?
export function prerequisitesMet(el) {
  return el.parts.every((ch) => score("item", ch) >= CAN);
}

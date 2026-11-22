// Speichern und Laden des Lernstands (localStorage), Export und Import.

const KEY = "leseapp.v1";
// Version 2: Eingangstest mit Zeitgrenze, Tagescheck mit Zwischenreizen.
// Ältere oder unvollständige Speicherstände werden beim Laden erkannt und
// angepasst; der Eingangstest startet dann neu (Lernstand und Flaggen bleiben).
export const VERSION = 2;

export function defaultSettings() {
  return {
    rows: 4,
    cols: 5,
    distractorShare: 0.4,
    unitsPerChapter: 3,
    fluentMs: 2000,
    sound: true,
  };
}

export function defaultState() {
  return {
    version: VERSION,
    created: today(),
    settings: defaultSettings(),
    placement: { done: false, queue: null, block: 0, index: 0, streak: 0, elapsed: 0 },
    check: null,
    items: {},
    words: {},
    days: {},
    journey: {
      index: 0,
      chapter: 0,
      unitInChapter: 0,
      totalUnits: 0,
      completed: 0,
      flags: [],
      historicFound: [],
      historicApproved: [],
    },
  };
}

function normalize(s) {
  const d = defaultState();
  if (!s || typeof s !== "object") return d;
  const out = {
    ...d,
    ...s,
    settings: { ...d.settings, ...(s.settings || {}) },
    placement: { ...d.placement, ...(s.placement || {}) },
    journey: { ...d.journey, ...(s.journey || {}) },
    items: s.items && typeof s.items === "object" ? s.items : {},
    words: s.words && typeof s.words === "object" ? s.words : {},
    days: s.days && typeof s.days === "object" ? s.days : {},
  };
  if (s.version !== VERSION || !placementValid(out.placement)) {
    // alter oder unvollständiger Stand: Eingangstest neu starten
    out.placement = d.placement;
    out.check = null;
    out.migratedFrom = s.version ?? "unbekannt";
  }
  if (out.check && (!Array.isArray(out.check.items) || typeof out.check.index !== "number")) out.check = null;
  out.version = VERSION;
  return out;
}

function placementValid(p) {
  if (typeof p.done !== "boolean") return false;
  if (p.queue === null) return !p.done;
  return Array.isArray(p.queue) && p.queue.length === 3 && p.queue.every(Array.isArray) && (!p.done || !!p.finished);
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const st = normalize(JSON.parse(raw));
      localStorage.setItem(KEY, JSON.stringify(st));
      return st;
    }
  } catch {
    /* kaputter Speicher: neu anfangen */
  }
  return defaultState();
}

// Live-Bindung: Andere Module sehen nach replace/restore automatisch den neuen Stand.
export let state = load();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function snapshot() {
  return JSON.stringify(state);
}

export function restore(snap) {
  state = JSON.parse(snap);
  save();
}

export function resetState() {
  state = defaultState();
  save();
}

export function exportText() {
  return JSON.stringify({ app: "flaggenreise-lesen", exported: new Date().toISOString(), ...state }, null, 2);
}

export function importText(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("Die Datei ist keine gültige JSON-Datei.");
  }
  if (!obj || typeof obj.version !== "number" || obj.version > VERSION || typeof obj.items !== "object") {
    throw new Error("Die Datei enthält keinen Lernstand dieser App.");
  }
  delete obj.app;
  delete obj.exported;
  state = normalize(obj);
  save();
}

// Datum als "JJJJ-MM-TT" in lokaler Zeit
export function today(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  return today(new Date(y, m - 1, d + n));
}

export function daysBetween(a, b) {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
}

export function dayRecord(date = today()) {
  if (!state.days[date]) {
    state.days[date] = { form: null, units: 0, ratings: { flu: 0, slow: 0, dk: 0 }, sure: 0 };
  }
  return state.days[date];
}

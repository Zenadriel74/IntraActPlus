// Speichern und Laden des Lernstands (localStorage), Export und Import.

const KEY = "leseapp.v1";
export const VERSION = 1;

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
    placement: { done: false, queue: null, block: 0, index: 0, streak: 0 },
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
  return {
    ...d,
    ...s,
    settings: { ...d.settings, ...(s.settings || {}) },
    placement: { ...d.placement, ...(s.placement || {}) },
    journey: { ...d.journey, ...(s.journey || {}) },
    items: s.items || {},
    words: s.words || {},
    days: s.days || {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
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
  state = normalize(JSON.parse(snap));
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
  if (!obj || obj.version !== VERSION || typeof obj.items !== "object") {
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

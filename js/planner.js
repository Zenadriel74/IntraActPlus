// Stellt Einheiten zusammen: Bausteinraster, Wortauswahl, Tagescheck, Eingangstest.

import { ELEMENTS, BY_ID } from "../data/elements.js";
import { SIMILAR } from "../data/similarity.js";
import { state, today, daysBetween } from "./store.js";
import { entry, status, statusOf, introducing, prerequisitesMet } from "./learning.js";
import { availableWords, VALID_WORDS } from "./tokenize.js";
import { makeDistractor } from "./ui/shapes.js";

const MAX_INTRODUCING = 8; // so viele unsichere Elemente gleichzeitig, dann erst festigen
const NEW_REPEATS = 3;

// id -> alle ähnlichen ids
const MATES = new Map();
for (const group of SIMILAR) {
  for (const id of group) {
    if (!MATES.has(id)) MATES.set(id, new Set());
    group.forEach((o) => o !== id && MATES.get(id).add(o));
  }
}

export function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function todaysForm() {
  return state.days[today()]?.form || "normal";
}

export function newAllowance() {
  return { gut: 2, normal: 1, schwach: 0 }[todaysForm()] ?? 1;
}

export function blockedBySimilarity(id, alsoNew = []) {
  const mates = MATES.get(id);
  if (!mates) return false;
  for (const m of mates) if (introducing("item", m) || alsoNew.includes(m)) return true;
  return false;
}

export function pickNew(n, { ignoreLimit = false } = {}) {
  const out = [];
  if (n <= 0) return out;
  const inPlay = ELEMENTS.filter((el) => introducing("item", el.id)).length;
  if (!ignoreLimit && inPlay >= MAX_INTRODUCING) return out;
  for (const el of ELEMENTS) {
    if (out.length >= n) break;
    const e = entry("item", el.id);
    if (e && (e.introduced || e.seen > 0)) continue;
    if (!prerequisitesMet(el)) continue;
    if (blockedBySimilarity(el.id, out)) continue;
    out.push(el.id);
  }
  return out;
}

// Raster zusammenstellen. Ergebnis: Liste von Feldern
// { type: "el", id } oder { type: "shape", shape, color }
export function buildGrid({ rows, cols, distractorShare } = state.settings) {
  const total = rows * cols;
  const nD = Math.min(total - 2, Math.round(total * distractorShare));
  const nL = total - nD;
  const t = today();

  let news = pickNew(newAllowance());
  const unsure = ELEMENTS.filter((el) => introducing("item", el.id) && !news.includes(el.id))
    .map((el) => ({ id: el.id, e: entry("item", el.id) }))
    .sort((a, b) => a.e.score - b.e.score || (a.e.last || "").localeCompare(b.e.last || ""))
    .map((x) => x.id);
  const sure = ELEMENTS.filter((el) => statusOf("item", el.id) === "sicher").map((el) => ({ id: el.id, e: entry("item", el.id) }));
  const due = sure.filter((x) => !x.e.due || x.e.due <= t).sort((a, b) => (a.e.due || "").localeCompare(b.e.due || "")).map((x) => x.id);
  const rest = shuffle(sure.filter((x) => !due.includes(x.id)).map((x) => x.id));

  // Kaltstart: noch gar nichts bekannt, dann wenigstens ein neues Element
  if (!news.length && !unsure.length && !sure.length) news = pickNew(1, { ignoreLimit: true });

  const seq = [];
  const room = () => nL - seq.length;
  for (const id of news) for (let i = 0; i < NEW_REPEATS && room() > 0; i++) seq.push(id);
  for (const id of unsure.slice(0, 4)) {
    if (room() < 2) break;
    seq.push(id, id);
  }
  for (const id of due) if (room() > 0) seq.push(id);
  for (const id of unsure.slice(4)) if (room() > 0) seq.push(id);
  for (const id of rest) if (room() > 0) seq.push(id);
  const distinct = [...new Set(seq)];
  if (!distinct.length) distinct.push(ELEMENTS[0].id);
  for (let k = 0; room() > 0; k++) seq.push(distinct[k % distinct.length]);

  const arranged = arrange(seq);
  return withDistractors(arranged, nD);
}

// Mischen, sodass möglichst nie dasselbe Element zweimal hintereinander steht.
function arrange(seq) {
  let best = seq;
  let bestBad = Infinity;
  for (let attempt = 0; attempt < 40; attempt++) {
    const s = shuffle(seq);
    const bad = s.reduce((n, x, i) => n + (i > 0 && s[i - 1] === x ? 1 : 0), 0);
    if (bad < bestBad) {
      best = s;
      bestBad = bad;
      if (bad === 0) break;
    }
  }
  return best;
}

function withDistractors(seq, nD) {
  const nL = seq.length;
  const gaps = new Array(nL).fill(0); // Zwischenreize nach Lernfeld i
  let left = nD;
  // zuerst zwischen gleiche Nachbarn
  for (let i = 0; i < nL - 1 && left > 0; i++) {
    if (seq[i] === seq[i + 1]) {
      gaps[i] += 1;
      left -= 1;
    }
  }
  // dann gleichmäßig verteilen
  while (left > 0) {
    const level = Math.min(...gaps.slice(0, Math.max(1, nL - 1)));
    const free = [];
    for (let i = 0; i < Math.max(1, nL - 1); i++) if (gaps[i] === level) free.push(i);
    const take = Math.min(left, free.length);
    for (let j = 0; j < take; j++) {
      const idx = free[Math.floor(((j + 0.5) * free.length) / take)];
      gaps[idx] += 1;
      left -= 1;
    }
  }
  const cells = [];
  let prev = null;
  seq.forEach((id, i) => {
    cells.push({ type: "el", id });
    for (let g = 0; g < gaps[i]; g++) {
      prev = makeDistractor(prev);
      cells.push({ type: "shape", ...prev });
    }
  });
  return cells;
}

// Nach "weiß nicht" an Position k: das Element 2 bis 4 Felder später noch einmal.
export function scheduleRetry(cells, k) {
  const id = cells[k].id;
  const ok = (j) =>
    cells[j] && cells[j].type === "el" && !cells[j].retry && cells[j].id !== id &&
    cells[j - 1]?.id !== id && cells[j + 1]?.id !== id;
  for (const j of [k + 3, k + 2, k + 4]) {
    if (j < cells.length && ok(j)) {
      cells[j] = { type: "el", id, retry: true };
      return;
    }
  }
  // kein passender Platz: einfügen (das Raster wird um ein bis zwei Felder länger)
  const at = Math.min(k + 3, cells.length);
  const insert = [{ type: "el", id, retry: true }];
  if (at === cells.length || cells[at - 1]?.type === "el") {
    const prev = [...cells].reverse().find((c) => c.type === "shape") || null;
    insert.unshift({ type: "shape", ...makeDistractor(prev) });
  }
  cells.splice(at, 0, ...insert);
}

// ---------- Wörter ----------

// Silbenübung erst, wenn genug mehrsilbige Wörter lesbar sind (sonst gibt es nichts zu trennen)
export function wordsUnlocked() {
  return availableWords().filter((w) => w.s.length >= 2).length >= 4;
}

export function pickWords(n = 6) {
  const avail = availableWords();
  const t = today();
  const info = avail.map((w) => ({ w, e: entry("word", w.w) }));
  const unsure = info.filter((x) => x.e && x.e.seen > 0 && status(x.e) !== "sicher").sort((a, b) => a.e.score - b.e.score);
  // neue Wörter: zuerst kurze mehrsilbige, einsilbige erst am Ende
  const fresh = shuffle(info.filter((x) => !x.e || x.e.seen === 0)).sort(
    (a, b) => (a.w.s.length < 2) - (b.w.s.length < 2) || a.w.w.length - b.w.w.length
  );
  const due = info.filter((x) => x.e && status(x.e) === "sicher" && (!x.e.due || x.e.due <= t));
  const sure = shuffle(info.filter((x) => x.e && status(x.e) === "sicher" && !due.includes(x)));
  const out = [];
  const add = (list, max) => {
    for (const x of list) {
      if (out.length >= n || max <= 0) break;
      if (!out.includes(x.w)) {
        out.push(x.w);
        max -= 1;
      }
    }
  };
  // Silbenübung: vor allem mehrsilbige Wörter, höchstens ein einsilbiges
  const multi = (list) => list.filter((x) => x.w.s.length >= 2);
  const single = (list) => list.filter((x) => x.w.s.length < 2);
  add(multi(unsure), 3);
  add(multi(fresh).slice(0, 8), 3);
  add([...multi(due), ...multi(fresh), ...multi(unsure), ...multi(sure)], n - 1 - out.length);
  add(single([...unsure, ...fresh, ...due]), 1);
  add([...unsure, ...fresh, ...due, ...sure], n);
  return shuffle(out);
}

// ---------- Tagescheck ----------

export function selectCheckItems() {
  const t = today();
  const seen = ELEMENTS.map((el) => ({ id: el.id, e: entry("item", el.id) })).filter((x) => x.e && x.e.seen > 0);
  const sure = shuffle(seen.filter((x) => status(x.e) === "sicher"));
  const recent = shuffle(seen.filter((x) => status(x.e) !== "sicher" && x.e.introduced && daysBetween(x.e.introduced, t) <= 3));
  const unsure = seen.filter((x) => status(x.e) !== "sicher" && !recent.includes(x)).sort((a, b) => a.e.score - b.e.score);
  const out = [];
  const add = (list, max) => {
    for (const x of list) {
      if (out.length >= 10 || max <= 0) break;
      if (!out.some((o) => o.id === x.id)) {
        out.push({ kind: "item", id: x.id });
        max -= 1;
      }
    }
  };
  add(sure, 3);
  add(unsure, 3);
  add(recent, 3);
  add(unsure, 10);
  add(sure, 10);
  add(recent, 10);
  // zwei bekannte Wörter, falls vorhanden
  const words = shuffle(VALID_WORDS.filter((w) => entry("word", w.w)?.seen > 0)).slice(0, 2);
  const items = shuffle(out).slice(0, words.length ? 8 : 10);
  words.forEach((w) => items.push({ kind: "word", id: w.w }));
  return items;
}

export function formFromCheck(results) {
  if (!results.length) return "normal";
  const avg = results.reduce((s, r) => s + r.v, 0) / results.length;
  const exp = results.reduce((s, r) => s + r.exp, 0) / results.length;
  const diff = avg - exp;
  if (avg < 0.45 || diff < -0.25) return "schwach";
  if (avg >= 0.75 && diff >= -0.1) return "gut";
  return "normal";
}

// ---------- Eingangstest ----------

export function placementQueue() {
  // Block 1: alle Buchstaben, groß und klein gemischt, grob von leicht nach schwer
  const letters = ELEMENTS.filter((e) => e.cat === "buchstabe").map((e) => e.id);
  const mixed = [];
  for (let i = 0; i < letters.length; i += 6) mixed.push(...shuffle(letters.slice(i, i + 6)));
  // Block 2: Auswahl an Bausteinen, von leicht nach schwer
  const pick = (cat, n) => ELEMENTS.filter((e) => e.cat === cat).slice(0, n).map((e) => e.id);
  const blocks = [...pick("mehrfach", 8), ...pick("vokal", 8), ...pick("anfang", 6), ...pick("vorsilbe", 6), ...pick("nachsilbe", 6)];
  const ordered = ELEMENTS.map((e) => e.id).filter((id) => blocks.includes(id));
  // Block 3: zehn einfache Wörter
  const words = [...VALID_WORDS]
    .sort((a, b) => a.s.length - b.s.length || a.w.length - b.w.length)
    .slice(0, 10)
    .map((w) => w.w);
  return [mixed, ordered, shuffle(words)];
}

export function elementText(kind, id) {
  return kind === "word" ? id : BY_ID[id]?.text ?? id;
}

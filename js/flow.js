// Ablauf: Startseite → (Eingangstest) → (Tagescheck) → Einheiten → Kapitel → Reise.

import { show } from "./ui/dom.js";
import { say, stop as stopAudio } from "./ui/audio.js";
import { state, save, today, dayRecord } from "./store.js";
import { rate, seedFromPlacement, entry, VALUE, countSure } from "./learning.js";
import { buildGrid, pickWords, wordsUnlocked, selectCheckItems, formFromCheck, placementQueue, elementText } from "./planner.js";
import { gridView } from "./views/grid.js";
import { sequenceView } from "./views/sequence.js";
import { syllablesView } from "./views/syllables.js";
import { homeView, betweenView, flagView, askView, journeyDoneView, messageView, albumView, introView, currentJourney } from "./views/screens.js";
import { makeDistractor } from "./ui/shapes.js";
import { parentView } from "./views/parent.js";
import { HISTORIC } from "../data/historic.js";

export function home() {
  stopAudio();
  show(homeView, {
    onStart: () => {
      say("start");
      next();
    },
    onAlbum: () => show(albumView, { onBack: home }),
    onParent: () => show(parentView, { onClose: home }),
  });
}

function next() {
  if (!state.placement.done) return runPlacement();
  if (!state.days[today()]?.form) return runDailyCheck();
  runUnit();
}

// ---------- Eingangstest ----------

const PLACEMENT_LIMIT_MS = 10 * 60 * 1000; // höchstens etwa 10 Minuten reine Lesezeit
const BLOCK_NAMES = ["Buchstaben", "Bausteine", "Wörter"];

function runPlacement() {
  const p = state.placement;
  const fresh = !p.queue;
  if (fresh) {
    Object.assign(p, { queue: placementQueue(), block: 0, index: 0, streak: 0, elapsed: 0 });
    save();
  }
  const total = p.queue.reduce((n, q) => n + q.length, 0);
  show(introView, {
    title: fresh || (p.block === 0 && p.index === 0) ? "Eingangstest" : "Eingangstest fortsetzen",
    paragraphs: [
      "Bevor die Reise beginnt, schauen wir einmal, was Sebastian schon kann.",
      `Es kommen nacheinander ${BLOCK_NAMES.join(", ")}, immer nur eins auf einmal (insgesamt höchstens ${total}). Du bewertest wie später im Raster mit Delfin, Schildkröte oder Fragezeichen.`,
      "Ein Teil endet von selbst nach viermal „weiß nicht“ in Folge. Nach spätestens etwa 10 Minuten ist der Test vorbei.",
    ],
    note: "Mit dem Haus-Knopf kannst du jederzeit pausieren, beim nächsten Mal geht es an derselben Stelle weiter. Im Test gibt es keine Zwischenreize, damit er kurz bleibt.",
    startLabel: fresh || (p.block === 0 && p.index === 0) ? "Test starten" : "Weitermachen",
    onStart: placementRun,
    onBack: home,
  });
}

function placementRun() {
  show(sequenceView, {
    label() {
      const pl = state.placement;
      return `Eingangstest · Teil ${Math.min(pl.block + 1, 3)} von 3: ${BLOCK_NAMES[Math.min(pl.block, 2)]}`;
    },
    progress() {
      const pl = state.placement;
      const q = pl.queue[Math.min(pl.block, pl.queue.length - 1)];
      return { done: pl.index, total: q.length };
    },
    current() {
      const pl = state.placement;
      if ((pl.elapsed || 0) >= PLACEMENT_LIMIT_MS) return null;
      while (pl.block < pl.queue.length) {
        const q = pl.queue[pl.block];
        if (pl.index < q.length) {
          const kind = pl.block === 2 ? "word" : "item";
          const id = q[pl.index];
          return { kind, id, text: elementText(kind, id) };
        }
        pl.block += 1;
        pl.index = 0;
        pl.streak = 0;
      }
      return null;
    },
    onRate(item, r, ms) {
      const pl = state.placement;
      seedFromPlacement(item.kind, item.id, r, ms);
      pl.elapsed = (pl.elapsed || 0) + Math.min(ms, 20000); // lange Pausen nicht mitzählen
      pl.streak = r === "dk" ? pl.streak + 1 : 0;
      pl.index += 1;
      if (pl.streak >= 4) {
        // Teil nach 4 × "weiß nicht" in Folge beenden
        pl.block += 1;
        pl.index = 0;
        pl.streak = 0;
      }
    },
    onDone() {
      state.placement.done = true;
      state.placement.finished = today();
      const day = dayRecord();
      day.form = day.form || "normal"; // am Testtag kein Tagescheck mehr
      day.check = "Eingangstest";
      day.sure = countSure();
      save();
      show(messageView, { text: "Super, das war's schon! Jetzt geht die Reise los.", onNext: runUnit, onStop: home });
    },
    onPause: home,
  });
}

// ---------- Tagescheck ----------

function runDailyCheck() {
  const t = today();
  if (state.check?.date !== t) {
    const items = selectCheckItems();
    if (items.length < 4) {
      dayRecord(t).form = "normal";
      save();
      return runUnit();
    }
    state.check = { date: t, items: withShapes(items), index: 0, results: [] };
    save();
  }
  const c = state.check;
  const n = c.items.filter((x) => x.kind !== "shape").length;
  show(introView, {
    title: "Kurzer Tagescheck",
    paragraphs: [
      `Zum Aufwärmen ${n} bekannte und neue Elemente mit Zwischenreizen, etwa 2 bis 3 Minuten.`,
      "Daraus stellt die App die Aufgaben für heute zusammen. Ein schlechter Tag ändert den Lernstand nur wenig.",
    ],
    startLabel: c.index > 0 ? "Weitermachen" : "Los geht's",
    onStart: checkRun,
    onBack: home,
  });
}

// Zwischenreize zwischen die Elemente des Tageschecks, wie im Raster
function withShapes(items) {
  const share = state.settings.distractorShare;
  const out = [];
  let prev = null;
  let debt = 0;
  items.forEach((it, i) => {
    out.push(it);
    debt += share / (1 - share || 1);
    while (debt >= 1 && i < items.length - 1) {
      prev = makeDistractor(prev);
      out.push({ kind: "shape", ...prev });
      debt -= 1;
    }
  });
  return out;
}

function checkRun() {
  const t = today();
  show(sequenceView, {
    label: () => "Tagescheck",
    progress: () => ({ done: state.check?.index ?? 0, total: state.check?.items.length ?? 1 }),
    current() {
      const c = state.check;
      const it = c?.items[c.index];
      if (!it) return null;
      return it.kind === "shape" ? it : { ...it, text: elementText(it.kind, it.id) };
    },
    onRate(item, r, ms) {
      const c = state.check;
      c.index += 1;
      if (item.kind === "shape") return;
      const exp = entry(item.kind, item.id)?.score ?? 0;
      rate(item.kind, item.id, r, ms, { mode: "check" });
      c.results.push({ kind: item.kind, id: item.id, r, v: VALUE[r], exp: Math.round(exp * 100) / 100 });
    },
    onDone() {
      const c = state.check;
      const day = dayRecord(t);
      day.form = formFromCheck(c.results);
      day.check = c.results;
      state.check = null;
      save();
      runUnit();
    },
    onPause: home,
  });
}

// ---------- Einheiten ----------

function runUnit() {
  const j = state.journey;
  const s = state.settings;
  const syllableTurn = j.totalUnits % 3 === 2 && wordsUnlocked();
  if (syllableTurn) {
    show(syllablesView, { words: pickWords(6), onDone: unitDone, onPause: home });
  } else {
    show(gridView, { cells: buildGrid(s), onDone: unitDone, onPause: home });
  }
}

function unitDone() {
  const j = state.journey;
  const per = state.settings.unitsPerChapter;
  const day = dayRecord();
  j.totalUnits += 1;
  j.unitInChapter += 1;
  day.units += 1;
  day.sure = countSure();

  if (j.unitInChapter >= per) {
    const journey = currentJourney();
    const stopId = journey.stops[j.chapter];
    j.unitInChapter = 0;
    j.chapter += 1;
    if (!j.flags.includes(stopId)) j.flags.push(stopId);
    save();
    say("kapitel");
    show(flagView, {
      id: stopId,
      onNext: () => (j.chapter >= journey.stops.length ? journeyDone(journey) : askContinue()),
    });
    return;
  }
  save();
  if (per >= 2 && j.unitInChapter === Math.ceil(per / 2)) say("haelfte");
  show(betweenView, { onNext: runUnit, onStop: home });
}

function askContinue() {
  say("weiter");
  show(askView, { onYes: runUnit, onNo: home });
}

function journeyDone(journey) {
  const j = state.journey;
  j.chapter = 0;
  j.unitInChapter = 0;
  j.completed += 1;
  j.index = (j.index + 1) % 1000;
  const find = HISTORIC.find((h) => j.historicApproved.includes(h.id) && !j.historicFound.includes(h.id));
  if (find) j.historicFound.push(find.id);
  save();
  say("reise");
  show(journeyDoneView, {
    journey,
    onNext: () => {
      if (find) show(flagView, { id: find.id, historic: find, title: "Sonderfund!", onNext: askContinue });
      else askContinue();
    },
  });
}

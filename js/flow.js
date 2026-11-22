// Ablauf: Startseite → (Eingangstest) → (Tagescheck) → Einheiten → Kapitel → Reise.

import { show } from "./ui/dom.js";
import { say, stop as stopAudio } from "./ui/audio.js";
import { state, save, today, dayRecord } from "./store.js";
import { rate, seedFromPlacement, entry, VALUE, countSure } from "./learning.js";
import { buildGrid, pickWords, wordsUnlocked, selectCheckItems, formFromCheck, placementQueue, elementText } from "./planner.js";
import { gridView } from "./views/grid.js";
import { sequenceView } from "./views/sequence.js";
import { syllablesView } from "./views/syllables.js";
import { homeView, betweenView, flagView, askView, journeyDoneView, messageView, albumView, currentJourney } from "./views/screens.js";
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

function runPlacement() {
  const p = state.placement;
  if (!p.queue) {
    Object.assign(p, { queue: placementQueue(), block: 0, index: 0, streak: 0 });
    save();
  }
  show(sequenceView, {
    note: "Eingangstest: Buchstaben, dann Bausteine, dann Wörter. Jederzeit pausierbar.",
    current() {
      const pl = state.placement;
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
      pl.streak = r === "dk" ? pl.streak + 1 : 0;
      pl.index += 1;
      if (pl.streak >= 4) {
        // Block nach 4 × "weiß nicht" in Folge beenden
        pl.block += 1;
        pl.index = 0;
        pl.streak = 0;
      }
    },
    onDone() {
      state.placement.done = true;
      state.placement.finished = today();
      const day = dayRecord();
      day.form = day.form || "normal";
      day.check = "Eingangstest";
      day.sure = countSure();
      save();
      show(messageView, { text: "Super, das war's schon!", onNext: runUnit, onStop: home });
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
    state.check = { date: t, items, index: 0, results: [] };
    save();
  }
  show(sequenceView, {
    current() {
      const c = state.check;
      const it = c.items[c.index];
      return it ? { ...it, text: elementText(it.kind, it.id) } : null;
    },
    onRate(item, r, ms) {
      const c = state.check;
      const exp = entry(item.kind, item.id)?.score ?? 0;
      rate(item.kind, item.id, r, ms, { mode: "check" });
      c.results.push({ kind: item.kind, id: item.id, r, v: VALUE[r], exp: Math.round(exp * 100) / 100 });
      c.index += 1;
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
    show(gridView, { cells: buildGrid(s), rows: s.rows, cols: s.cols, onDone: unitDone, onPause: home });
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

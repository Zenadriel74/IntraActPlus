// Eine Einheit ("Raster"): intern eine Folge von Feldern (Lernelemente und
// Zwischenreize), angezeigt wird aber immer nur das aktuelle Feld, groß und
// mittig. Das ersetzt die Schablone mit dem Loch aus dem Papierverfahren.

import { el, esc, fitFactor } from "../ui/dom.js";
import { shapeSVG } from "../ui/shapes.js";
import { BY_ID } from "../../data/elements.js";
import { rate } from "../learning.js";
import { save, snapshot, restore } from "../store.js";
import { scheduleRetry } from "../planner.js";
import { ratebarHTML, bindRatebar } from "./ratebar.js";

export function gridView(root, { cells, onDone, onPause }) {
  cells = cells.map((c) => ({ ...c }));
  let idx = 0;
  let t0 = performance.now();
  const history = [];

  const screen = el(`<section class="screen work">
      <div class="stage">
        <div class="dots progress" aria-hidden="true"></div>
        <div class="card"></div>
      </div>
      ${ratebarHTML()}
    </section>`);
  root.append(screen);
  const card = screen.querySelector(".card");
  const dots = screen.querySelector(".progress");

  function render() {
    const c = cells[idx];
    if (c.type === "shape") {
      card.className = "card shape";
      card.innerHTML = shapeSVG(c.shape, c.color);
    } else {
      const text = BY_ID[c.id]?.text ?? c.id;
      card.className = "card";
      card.innerHTML = `<span class="txt" style="--f:${fitFactor(text, 62, 170)};--len:${text.length}">${esc(text)}</span>`;
    }
    // Fortschritt: nur Punkte, keine Inhalte der anderen Felder
    dots.innerHTML = cells.map((_, i) => `<span class="dot ${i < idx ? "on" : i === idx ? "now" : ""}"></span>`).join("");
    t0 = performance.now(); // Zeitmessung ab Erscheinen des Feldes
  }

  function onRate(r) {
    const c = cells[idx];
    if (!c) return;
    history.push({ snap: snapshot(), cells: JSON.stringify(cells), idx });
    if (c.type === "el") {
      rate("item", c.id, r, performance.now() - t0);
      if (r === "dk") scheduleRetry(cells, idx);
      save();
    }
    idx += 1;
    if (idx >= cells.length) onDone();
    else render();
  }

  // Zurück: voriges Feld wieder zeigen, seine Bewertung (und eine dadurch
  // eingeplante Wiederholung) zurücknehmen.
  function onUndo() {
    const h = history.pop();
    if (!h) return;
    restore(h.snap);
    cells = JSON.parse(h.cells);
    idx = h.idx;
    render();
  }

  render();
  return bindRatebar(screen, { onRate, onUndo, onPause });
}

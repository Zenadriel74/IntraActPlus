// Das Raster: Lernelemente und Zwischenreize, aktuelles Feld hervorgehoben.

import { el, esc, fitFactor } from "../ui/dom.js";
import { shapeSVG } from "../ui/shapes.js";
import { BY_ID } from "../../data/elements.js";
import { rate } from "../learning.js";
import { save, snapshot, restore } from "../store.js";
import { scheduleRetry } from "../planner.js";
import { ratebarHTML, bindRatebar } from "./ratebar.js";

export function gridView(root, { cells, rows, cols, onDone, onPause }) {
  cells = cells.map((c) => ({ ...c }));
  let idx = 0;
  let t0 = performance.now();
  const history = [];

  const screen = el(`<section class="screen work">
      <div class="stage"><div class="grid"></div></div>
      ${ratebarHTML()}
    </section>`);
  root.append(screen);
  const grid = screen.querySelector(".grid");

  function layout() {
    const portrait = innerHeight > innerWidth;
    // Im Hochformat werden Zeilen und Spalten getauscht, damit die Felder nicht zu schmal werden.
    grid.style.setProperty("--cols", portrait && cols > rows ? rows : cols);
  }

  function cellHTML(c, i) {
    const cls = i === idx ? "current" : i < idx ? "done" : "";
    if (c.type === "shape") return `<div class="cell shape ${cls}">${shapeSVG(c.shape, c.color)}</div>`;
    const text = BY_ID[c.id]?.text ?? c.id;
    return `<div class="cell ${cls}"><span class="txt" style="--f:${fitFactor(text)}">${esc(text)}</span></div>`;
  }

  function render() {
    grid.innerHTML = cells.map(cellHTML).join("");
    t0 = performance.now();
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

  function onUndo() {
    const h = history.pop();
    if (!h) return;
    restore(h.snap);
    cells = JSON.parse(h.cells);
    idx = h.idx;
    render();
  }

  layout();
  render();
  addEventListener("resize", layout);
  const unbind = bindRatebar(screen, { onRate, onUndo, onPause });
  return () => {
    unbind();
    removeEventListener("resize", layout);
  };
}

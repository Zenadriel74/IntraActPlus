// Ein Feld nach dem anderen (Eingangstest, Tagescheck). Der Fortschritt liegt
// im Speicher, deshalb kann man jederzeit unterbrechen.
//
// current() liefert { kind, id, text } für ein Lernelement oder
// { kind: "shape", shape, color } für einen Zwischenreiz.
// label() liefert eine kleine Überschrift für dich (z. B. "Eingangstest · Teil 1 von 3").
// progress() liefert { done, total } für die Fortschrittsanzeige.

import { el, esc, fitFactor } from "../ui/dom.js";
import { shapeSVG } from "../ui/shapes.js";
import { save, snapshot, restore } from "../store.js";
import { ratebarHTML, bindRatebar } from "./ratebar.js";

export function sequenceView(root, { current, onRate, onDone, onPause, label = () => "", progress = null }) {
  const history = [];
  let t0 = performance.now();
  let item = null;

  const screen = el(`<section class="screen work">
      <div class="stage">
        <div class="seqhead"><span class="seqlabel"></span><span class="bar" aria-hidden="true"><span></span></span></div>
        <div class="card"></div>
      </div>
      ${ratebarHTML()}
    </section>`);
  root.append(screen);
  const card = screen.querySelector(".card");
  const lab = screen.querySelector(".seqlabel");
  const bar = screen.querySelector(".bar");

  function render() {
    item = current();
    if (!item) {
      onDone();
      return;
    }
    if (item.kind === "shape") {
      card.className = "card shape";
      card.innerHTML = shapeSVG(item.shape, item.color);
    } else {
      card.className = "card";
      card.innerHTML = `<span class="txt" style="--f:${fitFactor(item.text, 62, 170)};--len:${item.text.length}">${esc(item.text)}</span>`;
    }
    lab.textContent = label();
    if (progress) {
      const p = progress();
      bar.hidden = false;
      bar.firstElementChild.style.width = `${Math.round((100 * p.done) / Math.max(1, p.total))}%`;
    } else bar.hidden = true;
    t0 = performance.now();
  }

  const unbind = bindRatebar(screen, {
    onRate(r) {
      if (!item) return;
      history.push(snapshot());
      onRate(item, r, performance.now() - t0);
      save();
      render();
    },
    onUndo() {
      const s = history.pop();
      if (!s) return;
      restore(s);
      render();
    },
    onPause,
  });

  render();
  return unbind;
}

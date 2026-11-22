// Ein Element nach dem anderen auf einer großen Karte (Eingangstest, Tagescheck).
// Der Fortschritt liegt im Speicher, deshalb kann man jederzeit unterbrechen.

import { el, esc, fitFactor } from "../ui/dom.js";
import { save, snapshot, restore } from "../store.js";
import { ratebarHTML, bindRatebar } from "./ratebar.js";

export function sequenceView(root, { current, onRate, onDone, onPause, note = "" }) {
  const history = [];
  let t0 = performance.now();
  let item = null;

  const screen = el(`<section class="screen work">
      <div class="stage"><div class="card"><span class="txt"></span></div></div>
      ${ratebarHTML()}
    </section>`);
  if (note) screen.querySelector(".stage").insertAdjacentHTML("beforeend", `<p class="parent-note">${esc(note)}</p>`);
  root.append(screen);
  const txt = screen.querySelector(".card .txt");

  function render() {
    item = current();
    if (!item) {
      onDone();
      return;
    }
    txt.textContent = item.text;
    txt.style.setProperty("--f", fitFactor(item.text, 60, 170));
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

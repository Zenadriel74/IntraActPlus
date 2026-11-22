// Silbenübung: Sebastian tippt zwischen die Buchstaben, wo er trennen würde.
// Danach zeigt die App die richtigen Silben farbig (ohne Fehlerhinweis),
// Sebastian liest, du bewertest.

import { el, esc } from "../ui/dom.js";
import { ICON } from "../ui/icons.js";
import { rate, noteSplit } from "../learning.js";
import { save, snapshot, restore } from "../store.js";
import { ratebarHTML, bindRatebar, setRatesEnabled } from "./ratebar.js";

export function syllablesView(root, { words, onDone, onPause }) {
  let i = 0;
  let phase = "split"; // "split" = Trennstellen antippen, "read" = lesen und bewerten
  let marks = new Set();
  let t0 = 0;
  const history = [];

  const screen = el(`<section class="screen work syl">
      <div class="stage">
        <div class="syl-box">
          <div class="dots"></div>
          <div class="word"></div>
          <button class="done-split" type="button">${ICON.check}<span>fertig</span></button>
        </div>
      </div>
      ${ratebarHTML()}
    </section>`);
  root.append(screen);
  const wordBox = screen.querySelector(".word");
  const doneBtn = screen.querySelector(".done-split");
  const dots = screen.querySelector(".dots");

  function fontSize() {
    const w = words[i]?.w || "";
    const len = w.length;
    const byWidth = (screen.querySelector(".stage").clientWidth * 0.92) / (len * 0.68 + (len - 1) * 0.3);
    const byHeight = innerHeight * 0.24;
    wordBox.style.fontSize = Math.max(28, Math.min(byWidth, byHeight)) + "px";
  }

  function boundaries(word) {
    const b = new Set();
    let pos = 0;
    word.s.slice(0, -1).forEach((syl) => {
      pos += syl.length;
      b.add(pos);
    });
    return b;
  }

  function render() {
    const word = words[i];
    dots.innerHTML = words.map((_, k) => `<span class="dot ${k < i ? "on" : k === i ? "now" : ""}"></span>`).join("");
    if (phase === "split") {
      const chars = [...word.w];
      wordBox.className = "word split";
      wordBox.innerHTML = chars
        .map((ch, k) => {
          const gap = k > 0 ? `<button class="gap ${marks.has(k) ? "on" : ""}" data-pos="${k}" aria-label="hier trennen"></button>` : "";
          return `${gap}<span class="letter">${esc(ch)}</span>`;
        })
        .join("");
      doneBtn.hidden = false;
      setRatesEnabled(screen, false);
    } else {
      wordBox.className = "word read";
      wordBox.innerHTML = word.s.map((syl, k) => `<span class="sy ${k % 2 ? "b" : "a"}">${esc(syl)}</span>`).join("");
      doneBtn.hidden = true;
      setRatesEnabled(screen, true);
      t0 = performance.now();
    }
    fontSize();
  }

  wordBox.addEventListener("click", (e) => {
    const g = e.target.closest(".gap");
    if (!g || phase !== "split") return;
    const pos = Number(g.dataset.pos);
    if (marks.has(pos)) marks.delete(pos);
    else marks.add(pos);
    g.classList.toggle("on");
  });

  doneBtn.addEventListener("click", () => {
    const word = words[i];
    const right = boundaries(word);
    const ok = right.size === marks.size && [...right].every((p) => marks.has(p));
    history.push({ snap: snapshot(), i, phase, marks: [...marks] });
    noteSplit(word.w, ok);
    save();
    phase = "read";
    render();
  });

  const unbind = bindRatebar(screen, {
    onRate(r) {
      if (phase !== "read") return;
      history.push({ snap: snapshot(), i, phase, marks: [...marks] });
      rate("word", words[i].w, r, performance.now() - t0);
      save();
      i += 1;
      phase = "split";
      marks = new Set();
      if (i >= words.length) onDone();
      else render();
    },
    onUndo() {
      const h = history.pop();
      if (!h) return;
      restore(h.snap);
      i = h.i;
      phase = h.phase;
      marks = new Set(h.marks);
      render();
    },
    onPause,
  });

  render();
  addEventListener("resize", fontSize);
  return () => {
    unbind();
    removeEventListener("resize", fontSize);
  };
}

// Kleine DOM-Helfer und Ansichtswechsel.

export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

let cleanup = null;
let generation = 0;

// Zeigt eine Ansicht. render(root, opts) darf eine Aufräumfunktion zurückgeben.
export function show(render, opts = {}) {
  if (cleanup) {
    try {
      cleanup();
    } catch {
      /* egal */
    }
    cleanup = null;
  }
  const my = ++generation;
  const root = document.getElementById("app");
  root.innerHTML = "";
  window.scrollTo(0, 0);
  const c = render(root, opts);
  if (my !== generation) {
    // Die Ansicht hat während des Aufbaus schon weitergeschaltet.
    if (typeof c === "function") c();
    return;
  }
  cleanup = typeof c === "function" ? c : null;
}

// Gedrückt halten (z. B. Zugang zum Elternbereich)
export function longPress(btn, ms, done) {
  let timer = null;
  const start = (e) => {
    e.preventDefault();
    btn.classList.add("pressing");
    timer = setTimeout(() => {
      btn.classList.remove("pressing");
      done();
    }, ms);
  };
  const cancel = () => {
    clearTimeout(timer);
    btn.classList.remove("pressing");
  };
  btn.addEventListener("pointerdown", start);
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, cancel));
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
}

// Schriftgröße für Text in einem Feld: kürzere Elemente größer
export function fitFactor(text, base = 62, width = 150) {
  return Math.min(base, width / Math.max(1, text.length));
}

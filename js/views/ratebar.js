// Die Bewertungsleiste: Pause | Delfin, Schildkröte, Fragezeichen | Zurück
// Tastatur am PC: 1 = flüssig, 2 = langsam, 3 = weiß nicht, Rücktaste = zurück.

import { ICON } from "../ui/icons.js";

export function ratebarHTML() {
  return `<nav class="ratebar" aria-label="Bewertung">
    <button class="tool" data-act="pause" aria-label="Pause, zur Startseite">${ICON.home}</button>
    <div class="rates">
      <button class="rate" data-r="flu" aria-label="flüssig">${ICON.dolphin}</button>
      <button class="rate" data-r="slow" aria-label="langsam">${ICON.turtle}</button>
      <button class="rate" data-r="dk" aria-label="weiß nicht">${ICON.question}</button>
    </div>
    <button class="tool" data-act="undo" aria-label="letzte Bewertung zurücknehmen">${ICON.undo}</button>
  </nav>`;
}

export function bindRatebar(screen, { onRate, onPause, onUndo }) {
  let lastTap = 0;
  const guard = () => {
    const now = performance.now();
    if (now - lastTap < 250) return false; // versehentliche Doppeltipps ignorieren
    lastTap = now;
    return true;
  };
  screen.querySelector(".ratebar").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.r) guard() && onRate(b.dataset.r);
    else if (b.dataset.act === "pause") onPause();
    else if (b.dataset.act === "undo") guard() && onUndo();
  });
  const key = (e) => {
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    const map = { 1: "flu", 2: "slow", 3: "dk" };
    if (map[e.key]) guard() && onRate(map[e.key]);
    else if (e.key === "Backspace") {
      e.preventDefault();
      guard() && onUndo();
    }
  };
  addEventListener("keydown", key);
  return () => removeEventListener("keydown", key);
}

export function setRatesEnabled(screen, on) {
  screen.querySelectorAll(".rate").forEach((b) => (b.disabled = !on));
}

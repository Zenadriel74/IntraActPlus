// Elternbereich: Einstellungen, Lernstand, Verlauf, Flaggen, Daten.

import { el, esc } from "../ui/dom.js";
import { ICON } from "../ui/icons.js";
import { state, save, exportText, importText, resetState, today, defaultState } from "../store.js";
import { entry, status, countSure } from "../learning.js";
import { ELEMENTS, CATEGORIES } from "../../data/elements.js";
import { HISTORIC } from "../../data/historic.js";
import { VALID_WORDS, wordReady } from "../tokenize.js";

const TABS = [
  ["settings", "Einstellungen"],
  ["progress", "Lernstand"],
  ["history", "Verlauf"],
  ["flags", "Flaggen"],
  ["data", "Daten"],
];

const RLABEL = { flu: "flüssig", slow: "langsam", dk: "weiß nicht" };
const FORM = { gut: "gut", normal: "normal", schwach: "schwach" };

export function parentView(root, { onClose }) {
  let tab = "settings";
  const screen = el(`<section class="screen parent">
      <header class="topbar">
        <h1 class="title">Elternbereich</h1>
        <button class="big small-big close">${ICON.check}<span>Fertig</span></button>
      </header>
      <nav class="tabs">${TABS.map(([k, l]) => `<button data-tab="${k}">${l}</button>`).join("")}</nav>
      <div class="scroll panel"></div>
    </section>`);
  root.append(screen);
  let panel = screen.querySelector(".panel");
  screen.querySelector(".close").addEventListener("click", onClose);
  screen.querySelector(".tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]");
    if (b) {
      tab = b.dataset.tab;
      render();
    }
  });

  function render() {
    screen.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    // neues Element, damit sich keine Ereignis-Handler der vorigen Reiter ansammeln
    const fresh = panel.cloneNode(false);
    panel.replaceWith(fresh);
    panel = fresh;
    ({ settings, progress, history, flags, data })[tab](panel, render);
  }
  render();
}

// ---------- Einstellungen ----------

const FIELDS = [
  { key: "rows", label: "Zeilen im Raster", min: 2, max: 6, step: 1, fmt: (v) => v },
  { key: "cols", label: "Spalten im Raster", min: 2, max: 7, step: 1, fmt: (v) => v },
  { key: "distractorShare", label: "Anteil Zwischenreize", min: 0, max: 0.6, step: 0.05, fmt: (v) => Math.round(v * 100) + " %" },
  { key: "unitsPerChapter", label: "Einheiten pro Kapitel", min: 1, max: 8, step: 1, fmt: (v) => v },
  { key: "fluentMs", label: "Zeitgrenze flüssig / langsam", min: 1000, max: 6000, step: 500, fmt: (v) => (v / 1000).toLocaleString("de-DE") + " s" },
];

function settings(panel) {
  const s = state.settings;
  const rows = FIELDS.map(
    (f) => `<label class="field">
      <span>${f.label}</span>
      <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${s[f.key]}" data-key="${f.key}">
      <output>${f.fmt(s[f.key])}</output>
    </label>`
  ).join("");
  panel.append(
    el(`<div>
      <p class="hint">Raster: ${s.rows} × ${s.cols} = ${s.rows * s.cols} Felder, davon etwa ${Math.round(s.rows * s.cols * s.distractorShare)} Zwischenreize.
      Die Zeitgrenze ist nur eine Zusatzinformation im Lernstand. Maßgeblich ist deine Bewertung.</p>
      ${rows}
      <label class="field check"><span>Ton (Sprüche)</span><input type="checkbox" data-key="sound" ${s.sound ? "checked" : ""}><output></output></label>
      <p class="hint">Am PC kannst du auch mit der Tastatur bewerten: 1 = flüssig, 2 = langsam, 3 = weiß nicht, Rücktaste = zurück.</p>
      <h3>Eingangstest</h3>
      <p class="hint">${placementStatus()}</p>
      <button class="big small-big retest">Eingangstest neu starten</button>
      <p class="hint retest-msg"></p>
    </div>`)
  );
  panel.querySelector(".retest").addEventListener("click", () => {
    if (restartPlacement()) panel.querySelector(".retest-msg").textContent = "Der Eingangstest startet beim nächsten Tippen auf „Los geht's“.";
  });
  panel.addEventListener("input", (e) => {
    const inp = e.target.closest("input[data-key]");
    if (!inp) return;
    const key = inp.dataset.key;
    if (inp.type === "checkbox") s[key] = inp.checked;
    else {
      s[key] = Number(inp.value);
      inp.nextElementSibling.textContent = FIELDS.find((f) => f.key === key).fmt(s[key]);
    }
    save();
    const hint = panel.querySelector(".hint");
    hint.firstChild.textContent = `Raster: ${s.rows} × ${s.cols} = ${s.rows * s.cols} Felder, davon etwa ${Math.round(s.rows * s.cols * s.distractorShare)} Zwischenreize.
      Die Zeitgrenze ist nur eine Zusatzinformation im Lernstand. Maßgeblich ist deine Bewertung.`;
  });
}

function placementStatus() {
  const p = state.placement;
  if (p.done) return `Abgeschlossen am ${p.finished ? p.finished.split("-").reverse().join(".") : "?"}.`;
  if (p.queue) return `Begonnen, aber noch nicht fertig (Teil ${Math.min(p.block + 1, 3)} von 3). Er geht beim nächsten Start weiter.`;
  return "Noch nicht gemacht. Er startet beim nächsten Tippen auf „Los geht's“.";
}

function restartPlacement() {
  if (!confirm("Eingangstest neu starten? Die Testergebnisse setzen dann neue Startwerte. Flaggen und Verlauf bleiben erhalten.")) return false;
  state.placement = defaultState().placement;
  state.check = null;
  save();
  return true;
}

// ---------- Lernstand ----------

function avgMs(e) {
  const list = (e?.recent || []).filter((x) => x.ms > 0 && x.r !== "dk");
  if (!list.length) return null;
  return list.reduce((s, x) => s + x.ms, 0) / list.length;
}

function chip(kind, id, text) {
  const e = entry(kind, id);
  const st = status(e);
  return `<button class="chip st-${st}" data-kind="${kind}" data-id="${esc(id)}">${esc(text)}</button>`;
}

function progress(panel) {
  const counts = { sicher: 0, unsicher: 0, unbekannt: 0 };
  ELEMENTS.forEach((x) => counts[status(entry("item", x.id))]++);
  const byCat = Object.entries(CATEGORIES)
    .map(([cat, label]) => {
      const list = ELEMENTS.filter((x) => x.cat === cat);
      return `<h3>${label}</h3><div class="chips">${list.map((x) => chip("item", x.id, x.text)).join("")}</div>`;
    })
    .join("");
  const ready = VALID_WORDS.filter(wordReady);
  const words = `<h3>Wörter (${ready.length} von ${VALID_WORDS.length} freigeschaltet)</h3>
    <div class="chips">${VALID_WORDS.map((w) => (wordReady(w) || entry("word", w.w) ? chip("word", w.w, w.w) : `<span class="chip locked">${esc(w.w)}</span>`)).join("")}</div>`;

  const form = state.days[today()]?.form;
  panel.append(
    el(`<div>
      <p class="legend">
        <span class="chip st-sicher">sicher ${counts.sicher}</span>
        <span class="chip st-unsicher">unsicher ${counts.unsicher}</span>
        <span class="chip st-unbekannt">unbekannt ${counts.unbekannt}</span>
        ${form ? `<span class="hint">Tagesform heute: <b>${FORM[form]}</b></span>` : ""}
      </p>
      <div class="detail hint">Tippe auf ein Element für Einzelheiten.</div>
      ${byCat}${words}
    </div>`)
  );
  panel.addEventListener("click", (ev) => {
    const b = ev.target.closest(".chip[data-id]");
    if (!b) return;
    const e = entry(b.dataset.kind, b.dataset.id);
    const box = panel.querySelector(".detail");
    if (!e) {
      box.innerHTML = `<b>${esc(b.dataset.id)}</b>: noch nicht geübt.`;
      return;
    }
    const ms = avgMs(e);
    const limit = state.settings.fluentMs;
    const recent = e.recent
      .slice()
      .reverse()
      .map((x) => `${x.d.slice(8, 10)}.${x.d.slice(5, 7)}. ${RLABEL[x.r]}${x.ms ? ` (${(x.ms / 1000).toFixed(1)} s)` : ""}${x.m === "c" ? " Check" : x.m === "t" ? " Test" : ""}`)
      .join(" · ");
    box.innerHTML = `<b class="big-txt">${esc(b.dataset.id)}</b> ${status(e)} · Wert ${Math.round(e.score * 100)} % · ${e.seen} Bewertungen
      ${e.introduced ? ` · eingeführt ${e.introduced}` : ""}${e.interval ? ` · nächste Wiederholung ${e.due}` : ""}
      ${ms ? `<br>Ø Zeit ${(ms / 1000).toFixed(1)} s ${ms > limit ? "(über der Zeitgrenze)" : ""}` : ""}
      ${e.split ? `<br>Silben richtig getrennt: ${e.split.ok} von ${e.split.total}` : ""}
      ${recent ? `<br><small>${recent}</small>` : ""}`;
  });
}

// ---------- Verlauf ----------

function history(panel) {
  const days = Object.keys(state.days).sort();
  if (!days.length) {
    panel.append(el(`<p class="hint">Noch kein Verlauf.</p>`));
    return;
  }
  const last = days.slice(-30);
  const max = Math.max(ELEMENTS.length * 0.25, ...last.map((d) => state.days[d].sure || 0));
  const bw = 100 / Math.max(last.length, 14);
  const bars = last
    .map((d, i) => {
      const v = state.days[d].sure || 0;
      const h = (v / max) * 80;
      return `<rect x="${i * bw + bw * 0.15}" y="${90 - h}" width="${bw * 0.7}" height="${h}" class="bar"><title>${d}: ${v} sicher</title></rect>`;
    })
    .join("");
  const rows = days
    .slice()
    .reverse()
    .map((d) => {
      const x = state.days[d];
      return `<tr><td>${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}</td><td>${FORM[x.form] || "–"}</td><td>${x.units}</td>
        <td>${x.ratings.flu}</td><td>${x.ratings.slow}</td><td>${x.ratings.dk}</td><td>${x.sure ?? ""}</td></tr>`;
    })
    .join("");
  panel.append(
    el(`<div>
      <h3>Sichere Bausteine pro Tag</h3>
      <svg class="chart" viewBox="0 0 100 95" preserveAspectRatio="none">${bars}<line x1="0" y1="90" x2="100" y2="90" class="axis"/></svg>
      <p class="hint">Heute sicher: ${countSure()} von ${ELEMENTS.length} Bausteinen.</p>
      <table class="table">
        <thead><tr><th>Tag</th><th>Tagesform</th><th>Einheiten</th><th>flüssig</th><th>langsam</th><th>weiß nicht</th><th>sicher</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`)
  );
}

// ---------- Flaggen ----------

function flags(panel, rerender) {
  const j = state.journey;
  const list = HISTORIC.map(
    (h) => `<label class="histrow">
      <img src="flags/${h.id}.svg" alt="">
      <span><b>${esc(h.full)}</b> (${esc(h.years)})${j.historicFound.includes(h.id) ? " · schon gefunden" : ""}<br><small>${esc(h.fact)}</small></span>
      <input type="checkbox" data-id="${h.id}" ${j.historicApproved.includes(h.id) ? "checked" : ""}>
    </label>`
  ).join("");
  panel.append(
    el(`<div>
      <p class="hint">Nach jeder abgeschlossenen Reise gibt es als Sonderfund die nächste freigegebene historische Flagge.
      Reisen abgeschlossen: ${j.completed}. Gesammelte Länderflaggen: ${j.flags.length}.</p>
      ${list}
    </div>`)
  );
  panel.addEventListener("change", (e) => {
    const c = e.target.closest("input[data-id]");
    if (!c) return;
    const set = new Set(j.historicApproved);
    c.checked ? set.add(c.dataset.id) : set.delete(c.dataset.id);
    // Reihenfolge wie in der Liste
    j.historicApproved = HISTORIC.map((h) => h.id).filter((id) => set.has(id));
    save();
  });
}

// ---------- Daten ----------

function data(panel, rerender) {
  panel.append(
    el(`<div class="datapanel">
      <p class="hint">Der Lernstand ist nur auf diesem Gerät gespeichert. Um auf einem anderen Gerät weiterzumachen,
      exportiere ihn hier und importiere die Datei dort.</p>
      <button class="big exp">Lernstand exportieren</button>
      <label class="big imp">Lernstand importieren<input type="file" accept="application/json,.json" hidden></label>
      <p class="msg hint"></p>
      <hr>
      <button class="big retest">Eingangstest neu starten</button>
      <button class="big reset danger">Alles zurücksetzen</button>
    </div>`)
  );
  const msg = panel.querySelector(".msg");
  panel.querySelector(".exp").addEventListener("click", () => {
    const blob = new Blob([exportText()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lernstand-${today()}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    msg.textContent = "Export erstellt.";
  });
  panel.querySelector(".imp input").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!confirm("Der aktuelle Lernstand auf diesem Gerät wird durch die Datei ersetzt. Fortfahren?")) return;
    try {
      importText(await f.text());
      msg.textContent = "Import erfolgreich.";
    } catch (err) {
      msg.textContent = err.message;
    }
  });
  panel.querySelector(".retest").addEventListener("click", () => {
    if (restartPlacement()) msg.textContent = "Der Eingangstest startet beim nächsten Tippen auf „Los geht's“.";
  });
  panel.querySelector(".reset").addEventListener("click", () => {
    if (!confirm("Wirklich ALLES zurücksetzen? Lernstand, Verlauf und Flaggen gehen verloren.")) return;
    if (!confirm("Ganz sicher? Das kann nicht rückgängig gemacht werden (außer mit einem Export).")) return;
    resetState();
    msg.textContent = "Zurückgesetzt.";
  });
}

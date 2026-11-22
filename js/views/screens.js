// Startseite, Zwischenseiten, Flaggen und Album.

import { el, esc, longPress } from "../ui/dom.js";
import { ICON } from "../ui/icons.js";
import { mapSVG } from "../ui/map.js";
import { COUNTRIES, JOURNEYS, HOME_COUNTRY } from "../../data/journeys.js";
import { HISTORIC } from "../../data/historic.js";
import { state } from "../store.js";

export function currentJourney() {
  return JOURNEYS[state.journey.index % JOURNEYS.length];
}

function chapterDots() {
  const per = state.settings.unitsPerChapter;
  const n = Math.min(state.journey.unitInChapter, per);
  return `<div class="dots big-dots" aria-label="Fortschritt im Kapitel">${Array.from({ length: per }, (_, k) => `<span class="dot ${k < n ? "on" : ""}"></span>`).join("")}</div>`;
}

// ---------- Startseite ----------

export function homeView(root, { onStart, onAlbum, onParent }) {
  const j = currentJourney();
  const screen = el(`<section class="screen home">
      <header class="topbar">
        <h1 class="title">${esc(j.name)}</h1>
        <button class="gear tool" aria-label="Elternbereich (gedrückt halten)">${ICON.gear}</button>
      </header>
      <div class="mapbox">${mapSVG(j, state.journey.chapter)}</div>
      ${chapterDots()}
      <div class="actions">
        <button class="big primary start">${ICON.play}<span>Los geht's</span></button>
        <button class="big album">${ICON.book}<span>Album</span></button>
      </div>
    </section>`);
  root.append(screen);
  screen.querySelector(".start").addEventListener("click", onStart);
  screen.querySelector(".album").addEventListener("click", onAlbum);
  longPress(screen.querySelector(".gear"), 3000, onParent);
}

// ---------- nach einer Einheit ----------

export function betweenView(root, { onNext, onStop }) {
  const j = currentJourney();
  const screen = el(`<section class="screen between">
      <div class="mapbox">${mapSVG(j, state.journey.chapter)}</div>
      ${chapterDots()}
      <div class="actions">
        <button class="big primary">${ICON.next}<span>Weiter</span></button>
        <button class="big">${ICON.moon}<span>Pause</span></button>
      </div>
    </section>`);
  root.append(screen);
  const [next, stop] = screen.querySelectorAll(".actions button");
  next.addEventListener("click", onNext);
  stop.addEventListener("click", onStop);
}

// ---------- Kapitel geschafft: neue Flagge ----------

export function flagView(root, { id, historic = null, title = "", onNext }) {
  const c = historic || COUNTRIES[id];
  const sub = historic ? historic.years : `Hauptstadt: ${c.capital}`;
  const screen = el(`<section class="screen flagscreen">
      ${title ? `<p class="kicker">${esc(title)}</p>` : ""}
      <div class="flagshow">
        <img src="flags/${esc(id)}.svg" alt="Flagge ${esc(c.name)}">
        <h2 class="country">${esc(c.name)}</h2>
        <p class="capital">${esc(sub)}</p>
        <p class="fact">${esc(c.fact)}</p>
      </div>
      <div class="actions">
        <button class="big primary">${ICON.next}<span>Weiter</span></button>
      </div>
    </section>`);
  root.append(screen);
  screen.querySelector(".actions button").addEventListener("click", onNext);
}

// ---------- Weitermachen? ----------

export function askView(root, { onYes, onNo }) {
  const screen = el(`<section class="screen ask">
      <div class="askbox">
        <p class="question">Sollen wir weitermachen?</p>
      </div>
      <div class="actions">
        <button class="big">${ICON.play}<span>Ja</span></button>
        <button class="big">${ICON.moon}<span>Nein</span></button>
      </div>
    </section>`);
  root.append(screen);
  const [yes, no] = screen.querySelectorAll(".actions button");
  yes.addEventListener("click", onYes);
  no.addEventListener("click", onNo);
}

// ---------- Reise geschafft ----------

export function journeyDoneView(root, { journey, onNext }) {
  const flags = [journey.start, ...journey.stops]
    .map((id) => `<img src="flags/${id}.svg" alt="${esc(COUNTRIES[id].name)}" title="${esc(COUNTRIES[id].name)}">`)
    .join("");
  const screen = el(`<section class="screen journeydone">
      <div class="mapbox">${mapSVG(journey, journey.stops.length)}</div>
      <div class="flagrow">${flags}</div>
      <div class="actions">
        <button class="big primary">${ICON.next}<span>Weiter</span></button>
      </div>
    </section>`);
  root.append(screen);
  screen.querySelector(".actions button").addEventListener("click", onNext);
}

// ---------- Eingangstest geschafft ----------

export function messageView(root, { text, onNext, onStop }) {
  const screen = el(`<section class="screen ask">
      <div class="askbox"><p class="question">${esc(text)}</p></div>
      <div class="actions">
        <button class="big primary">${ICON.next}<span>Weiter</span></button>
        ${onStop ? `<button class="big">${ICON.moon}<span>Pause</span></button>` : ""}
      </div>
    </section>`);
  root.append(screen);
  const [next, stop] = screen.querySelectorAll(".actions button");
  next.addEventListener("click", onNext);
  stop?.addEventListener("click", onStop);
}

// ---------- Erklärseite (vor Eingangstest und Tagescheck, vor allem für dich) ----------

export function introView(root, { title, paragraphs, note = "", startLabel = "Los geht's", onStart, onBack }) {
  const screen = el(`<section class="screen">
      <div class="intro">
        <h2>${esc(title)}</h2>
        ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
        ${note ? `<p class="small">${esc(note)}</p>` : ""}
      </div>
      <div class="actions">
        <button class="big primary">${ICON.play}<span>${esc(startLabel)}</span></button>
        <button class="big">${ICON.home}<span>Zurück</span></button>
      </div>
    </section>`);
  root.append(screen);
  const [start, back] = screen.querySelectorAll(".actions button");
  start.addEventListener("click", onStart);
  back.addEventListener("click", onBack);
}

// ---------- Album ----------

export function albumView(root, { onBack }) {
  const have = new Set([HOME_COUNTRY, ...state.journey.flags]);
  const card = (id, info, sub) =>
    have.has(id) || info.historic
      ? `<button class="flagcard" data-id="${esc(id)}" data-hist="${info.historic ? 1 : ""}">
           <img src="flags/${esc(id)}.svg" alt="">
           <span class="fname">${esc(info.name)}</span>
           <span class="fsub">${esc(sub)}</span>
         </button>`
      : `<div class="flagcard empty"><span class="ph"></span></div>`;

  const sections = JOURNEYS.map((j, ji) => {
    const ids = ji === 0 ? [j.start, ...j.stops] : j.stops;
    return `<h2>${esc(j.name)}</h2><div class="flags">${ids.map((id) => card(id, COUNTRIES[id], COUNTRIES[id].capital)).join("")}</div>`;
  }).join("");

  const found = HISTORIC.filter((h) => state.journey.historicFound.includes(h.id));
  const hist = found.length
    ? `<h2>Sonderfunde</h2><div class="flags">${found.map((h) => card(h.id, { ...h, historic: true }, h.years)).join("")}</div>`
    : "";

  const screen = el(`<section class="screen album">
      <header class="topbar">
        <h1 class="title">Mein Flaggenalbum</h1>
        <button class="tool" aria-label="zurück">${ICON.home}</button>
      </header>
      <div class="scroll">${sections}${hist}</div>
    </section>`);
  root.append(screen);
  screen.querySelector(".topbar .tool").addEventListener("click", onBack);

  screen.querySelector(".scroll").addEventListener("click", (e) => {
    const b = e.target.closest(".flagcard[data-id]");
    if (!b) return;
    const id = b.dataset.id;
    const info = b.dataset.hist ? HISTORIC.find((h) => h.id === id) : COUNTRIES[id];
    const sub = b.dataset.hist ? info.years : `Hauptstadt: ${info.capital}`;
    const dlg = el(`<div class="overlay" role="dialog" aria-label="${esc(info.name)}">
        <div class="flagshow">
          <img src="flags/${esc(id)}.svg" alt="">
          <h2 class="country">${esc(info.name)}</h2>
          <p class="capital">${esc(sub)}</p>
          <p class="fact">${esc(info.fact)}</p>
          <button class="big">${ICON.close}<span>Schließen</span></button>
        </div>
      </div>`);
    dlg.addEventListener("click", (ev) => {
      if (ev.target === dlg || ev.target.closest("button")) dlg.remove();
    });
    screen.append(dlg);
  });
}

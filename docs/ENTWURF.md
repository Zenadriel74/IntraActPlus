# Entwurf: Projektstruktur und Datenmodell

Stand: 22.11.2026. Dieser Entwurf ist Schritt 1 aus dem Auftrag. Gebaut wird erst nach Freigabe.

## Technik-Entscheidungen

- **Kein Framework, kein Build.** Vanilla JS mit ES-Modulen, eine HTML-Datei, eine CSS-Datei. Ein Framework bringt hier keinen Vorteil, der den Pflegeaufwand rechtfertigt.
- **Daten als JS-Module** (`data/*.js`) statt JSON. Grund: In JS-Dateien sind Kommentare erlaubt, du kannst also beim Ergänzen von Wörtern Notizen hinterlassen. Das Format bleibt trotzdem schlicht (Listen und Objekte).
- **Speicher: localStorage**, ein einziger Schlüssel `leseapp.v1` mit einem JSON-Objekt. Der Stand ist klein (einige 10 KB), IndexedDB wäre unnötig kompliziert. Export/Import schreibt und liest genau dieses Objekt.
- **Offline:** Service Worker legt beim ersten Aufruf alle Dateien in den Cache. Neue Version = Versionsnummer in `sw.js` hochzählen.
- **Flaggen:** Für die erste Reise zeichne ich die zehn Flaggen selbst als SVG nach den amtlichen Proportionen. Die gewählten Länder haben alle geometrische Flaggen ohne Wappen, das geht exakt und ohne Download. Staatsflaggen sind als amtliche Werke gemeinfrei. Für spätere Reisen mit Wappenflaggen (Spanien, Portugal …) kann ich `flag-icons` (MIT) lokal einbinden; das wäre ein Download, den du vorher freigibst.
- **Karte:** Schematische Europakarte als SVG. Die Länder sind Punkte an der echten Lage der Hauptstädte, verbunden durch den Reiseweg, dazu ein grob vereinfachter Umriss. Kein Kartenmaterial von Dritten.
- **Wichtig zu GitHub Pages:** Das Repository `Zenadriel74/IntraActPlus` ist privat. GitHub Pages für private Repositories gibt es nur mit einem bezahlten Plan (Pro). Alternativen: Repository öffentlich machen (es enthält keine persönlichen Daten außer dem Vornamen in den Sprüchen) oder ein zweites, öffentliches Repo nur für die Seite.

## Projektstruktur

```
index.html               Einzige Seite, lädt js/main.js
manifest.webmanifest     PWA-Manifest (Name, Icons, Hoch-/Querformat)
sw.js                    Service Worker (Offline-Cache)
css/app.css              Gesamtes Layout, ruhige Farben, große Touch-Flächen

js/
  main.js                Start, Umschalten zwischen den Ansichten
  store.js               Laden, Speichern, Export, Import, Zurücksetzen
  learning.js            Lernstand fortschreiben, Status, Wiederholungsabstände
  planner.js             Stellt Raster zusammen (neu / unsicher / fällig, Ähnlichkeitsregel)
  tokenize.js            Zerlegt Wörter in Bausteine (für "nur Wörter mit bekannten Bausteinen")
  views/
    home.js              Startbildschirm: Karte, Weiter-Knopf, Album, Zahnrad
    grid.js              Raster mit Hervorhebung und den drei Bewertungsknöpfen
    syllables.js         Silbenübung (Trennstellen antippen, dann lesen)
    placement.js         Eingangstest
    dailycheck.js        Tagescheck
    journey.js           Kapitelende, große Flagge, Album
    parent.js            Elternbereich
  ui/
    shapes.js            Zwischenreize als SVG (Form × Farbe)
    icons.js             Delfin, Schildkröte, Fragezeichen, Zahnrad usw. als SVG
    audio.js             Sprüche abspielen, fehlende Datei still ignorieren

data/
  elements.js            Alle Bausteine mit Kategorie und Einführungsreihenfolge
  similarity.js          Ähnlichkeitsgruppen
  words.js               Wortliste mit Silbengrenzen
  journeys.js            Reisen: Länder, Hauptstädte, Koordinaten
  historic.js            Vorschlagsliste historischer Flaggen

flags/                   SVG-Dateien, z. B. de.svg, dk.svg, hist-ddr.svg
audio/                   MP3-Sprüche (von dir) + SPRUECHE.md
icons/                   App-Icons für die Installation
LICENSES.md              Lizenzhinweise
README.md                Anleitung
```

## Datenmodell

### Bausteine (`data/elements.js`)

```js
export const ELEMENTS = [
  { id: "a",   text: "a",   cat: "buchstabe" },
  { id: "A",   text: "A",   cat: "buchstabe" },
  { id: "sch", text: "sch", cat: "mehrfach" },
  { id: "ei",  text: "ei",  cat: "vokal" },
  { id: "schl",text: "schl",cat: "anfang" },
  { id: "ver", text: "ver", cat: "vorsilbe" },
  { id: "-ung",text: "ung", cat: "nachsilbe" },   // Präfix "-" nur, wo die ID sonst doppelt wäre (er, en)
  ...
];
```

- Groß- und Kleinbuchstaben sind **getrennte Elemente** (b und B sehen verschieden aus und werden getrennt gelernt), werden aber gemischt angeboten.
- Die Reihenfolge in der Liste ist die **Einführungsreihenfolge**: Die App nimmt als nächstes neues Element das erste noch unbekannte, das nicht von der Ähnlichkeitsregel gesperrt ist. Du steuerst die Reihenfolge also durch Umsortieren.
- Kategorien: `buchstabe`, `mehrfach`, `vokal`, `anfang`, `vorsilbe`, `nachsilbe`. Bausteine ab `mehrfach` kommen erst, wenn die enthaltenen Buchstaben sitzen.

### Ähnlichkeitsgruppen (`data/similarity.js`)

```js
export const SIMILAR = [
  ["b", "d", "p", "q"],
  ["m", "n"], ["n", "u", "h"], ["i", "l", "I"], ["f", "t"],
  ["ä", "a"], ["ö", "o"], ["ü", "u"], ["M", "W"], ["E", "F"],
  ["ei", "ie"], ["eu", "äu"], ["sp", "st"],
  // Ergänzungen von mir: ["Ä","A"], ["Ö","O"], ["Ü","U"], ["ch","ck"], ["ng","nk"], ["O","Q"], ["P","R"]
];
```

**Regel:** Ein Element gilt als „in Einführung“, solange es schon einmal gezeigt wurde, aber noch nicht *sicher* ist. Ein neues Element darf nicht eingeführt werden, wenn ein Element aus einer seiner Gruppen gerade in Einführung ist. Bereits sichere oder vom Eingangstest bekannte Elemente sperren nicht.

### Wörter (`data/words.js`)

```js
export const WORDS = [
  { w: "Kiste",  s: ["Kis", "te"],   thema: "Alltag" },
  { w: "Zucker", s: ["Zu", "cker"],  thema: "Essen" },
  { w: "Hund",   s: ["Hund"],        thema: "Tiere" },
  ...
];
```

- Silbengrenzen stehen in `s`, die App prüft nur, dass `s.join("") === w`.
- Die **Bausteine eines Worts** ermittelt `tokenize.js` automatisch (längster Treffer zuerst: „Schule“ → Sch, u, l, e). Das betrifft nur die Freischaltung, nicht die Silben. Ein Wort wird angeboten, wenn alle seine Bausteine mindestens den Wert „kann“ (Score ≥ 0,6) haben.
- Etwa 80 Wörter zu Tieren, Essen, Fahrzeugen, Ländern, Alltag; anfangs viele kurze Wörter aus häufigen Buchstaben.

### Reisen (`data/journeys.js`) und historische Flaggen (`data/historic.js`)

```js
export const JOURNEYS = [
  { id: "nachbarn", name: "Rund um Deutschland", start: "de",
    stops: [
      { id: "dk", name: "Dänemark",    capital: "Kopenhagen", lat: 55.7, lon: 12.6 },
      { id: "nl", name: "Niederlande", capital: "Amsterdam",  lat: 52.4, lon: 4.9 },
      ...10 Stationen
    ] },
];

export const HISTORIC = [
  { id: "hist-ddr", name: "Deutsche Demokratische Republik", years: "1959–1990", approved: false },
  ...
];
```

**Erste Reise (10 Stationen, Start in Deutschland):**
Dänemark → Niederlande → Belgien → Luxemburg → Frankreich → Schweiz → Italien → Österreich → Tschechien → Polen.
Ein Bogen im Uhrzeigersinn um Deutschland, jeder Schritt in ein Nachbarland des vorigen.

**Vorschlag historische Flaggen** (alle standardmäßig *nicht* freigegeben, du gibst sie im Elternbereich frei):
1. DDR (1959–1990)
2. Königreich Preußen (vereinfachter Adler)
3. Jugoslawien (1946–1992)
4. Sowjetunion (1955–1991)
5. Tschechoslowakei (1920–1992)
6. Osmanisches Reich (1844–1922)

Bewusst nicht dabei: die Reichsflagge Schwarz-Weiß-Rot, weil sie heute als Erkennungszeichen der rechtsextremen Szene verwendet wird, und selbstverständlich alles aus der NS-Zeit.

### Lernstand (`localStorage["leseapp.v1"]`)

```js
{
  version: 1,
  settings: {
    rows: 4, cols: 5,          // Rastergröße
    distractorShare: 0.4,      // Anteil Zwischenreize
    unitsPerChapter: 3,
    fluentMs: 2000,            // Zeitgrenze flüssig / langsam (nur Zusatzinfo)
    sound: true
  },
  placement: { done: false, block: 0, index: 0, results: [] },   // Eingangstest, pausierbar
  items: {
    "b": {
      score: 0.72,             // 0 … 1, gewichteter gleitender Durchschnitt
      seen: 14,                // Anzahl Bewertungen
      introduced: "2026-11-22",// erstes Mal gezeigt (null = noch nie)
      interval: 2,             // Tage bis zur nächsten Wiederholung (nur wenn sicher)
      due: "2026-11-24",
      recent: [ { d: "2026-11-22", r: 2, ms: 1430 }, ... ]   // letzte 10 Bewertungen
    }
  },
  words: { "Kiste": { ...wie items... } },
  days: {
    "2026-11-22": { form: "gut", units: 5, ratings: { flu: 61, slow: 12, dk: 4 }, check: [...] }
  },
  journey: { index: 0, chapter: 3, unitInChapter: 1, flags: ["dk","nl","be"],
             historicFound: ["hist-ddr"], historicApproved: ["hist-ddr","hist-su"] }
}
```

### Rechenregeln

- **Bewertungswert:** Delfin = 1, Schildkröte = 0,5, Fragezeichen = 0.
- **Fortschreibung:** `score = score + α · (wert − score)`. Im Raster α = 0,25, im **Tagescheck α = 0,1**: Ein schlechter Tag senkt den Stand nur leicht und überschreibt ihn nie. Die gemessene Zeit fließt nicht ein, sie wird nur gespeichert und im Elternbereich gezeigt.
- **Status:** *unbekannt* (nie gesehen oder Score < 0,35), *unsicher* (0,35 bis 0,8), *sicher* (≥ 0,8 und mindestens 4 Bewertungen).
- **Verteilte Wiederholung:** Sichere Elemente bekommen einen Abstand (1 → 2 → 4 → 8 → 16 → 30 Tage). Delfin verdoppelt ihn, Schildkröte behält ihn, Fragezeichen setzt ihn auf 1 zurück.
- **Eingangstest:** setzt den Startwert direkt (Delfin 0,9 und gilt als sicher, Schildkröte 0,55, Fragezeichen 0,1).
- **Tagesform** aus dem Tagescheck: Durchschnitt der Bewertungen verglichen mit dem bisherigen Score derselben Elemente. Deutlich darunter = *schwach* (0 neue Elemente pro Raster), etwa gleich = *normal* (1 neues), gleich oder besser und Durchschnitt ≥ 0,7 = *gut* (2 neue).

### Ein Raster entsteht so (`planner.js`)

1. Felder gesamt = Zeilen × Spalten (Standard 20), davon Zwischenreize gemäß Anteil (Standard 8), Lernfelder 12.
2. Neue Elemente laut Tagesform (0 bis 2), jedes erscheint 3-mal.
3. Rest auffüllen: zuerst unsichere Elemente, dann fällige sichere, notfalls weitere sichere.
4. Verteilen: nie zweimal dasselbe Element direkt hintereinander, Zwischenreize gleichmäßig dazwischen, keine zwei gleichen Zwischenreize nebeneinander.
5. **Fragezeichen** während des Rasters: Das Element wird 2 bis 4 Felder später noch einmal eingesetzt (es ersetzt dort ein anderes Lernfeld, das Raster bleibt gleich groß). Höchstens eine Wiederholung pro Bewertung, damit keine Kette entsteht.

Sobald es freigeschaltete Wörter gibt, ist jede dritte Einheit eine **Silbenübung** (6 Wörter) statt eines Bausteinrasters.

### Was Sebastian sieht und was nicht

- Er sieht: das Raster mit dem hervorgehobenen Feld, die Karte, Flaggen, das Album.
- Er sieht nie: Scores, Status, Zeiten, Zähler für „weiß nicht“, irgendein Rot oder einen Fehlerton.
- Die drei Bewertungsknöpfe sind neutral gestaltet (gleiche Größe, gleiche ruhige Farbe), damit das Fragezeichen nicht wie eine Strafe aussieht.

## Sprüche (`audio/`)

Dateinamen nach dem Muster `anlass_nummer.mp3`, z. B. `start_1.mp3` bis `start_4.mp3`, `haelfte_1.mp3`, `kapitel_1.mp3`, `reise_1.mp3`, `weiter_1.mp3`. Die Liste mit Sätzen steht dann in `audio/SPRUECHE.md`. Die App wählt zufällig eine vorhandene Variante, fehlt alles, bleibt es still.

## Elternbereich

Zugang: Zahnrad oben rechts **3 Sekunden gedrückt halten** (ein Ring füllt sich langsam). Keine Rechenaufgabe, das wäre für Sebastian eher ein Anreiz.

Inhalte: Einstellungen, Lernstand pro Element (farbig nur hier: sicher / unsicher / unbekannt), Verlauf pro Tag, Zeiten, Export/Import/Zurücksetzen, Freigabe historischer Flaggen, Eingangstest neu starten.

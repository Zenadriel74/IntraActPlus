# Flaggenreise: Lesen üben

Eine Browser-App, mit der Sebastian lesen übt, angelehnt an die Prinzipien von
IntraActPlus: Raster mit Zwischenreizen, fehlerfreies Lernen, kein Druck. Ein
Elternteil sitzt daneben und bewertet jedes Feld mit Delfin (flüssig),
Schildkröte (langsam) oder Fragezeichen (weiß nicht). Zur Motivation reist
Sebastian von Land zu Land und sammelt Flaggen.

Die App läuft ohne Server, ohne Login und ohne Internet (nach dem ersten
Laden). Es gibt keinen Build-Schritt: HTML, CSS und JavaScript-Module.

## Starten auf dem PC

Die App muss über einen kleinen lokalen Webserver laufen, weil Browser
JavaScript-Module nicht direkt aus einer Datei (`file://`) laden. Python ist
auf deinem PC installiert, also im Projektordner:

```powershell
python -m http.server 8000
```

Dann im Browser <http://localhost:8000> öffnen. Beenden mit Strg+C.

## Auf GitHub Pages veröffentlichen

1. Auf GitHub das Repository öffnen → **Settings** → **Pages**.
2. Unter „Build and deployment“: Source **Deploy from a branch**, Branch
   **main**, Ordner **/ (root)**, speichern.
3. Nach ein bis zwei Minuten ist die App erreichbar unter
   `https://zenadriel74.github.io/IntraActPlus/`.

GitHub Pages ist bereits eingerichtet. Der Lernstand liegt nie auf GitHub,
sondern nur im Browser des jeweiligen Geräts.

**Updates:** Nach jedem Push holt sich die App die neue Fassung beim nächsten
Öffnen im Hintergrund. Sie ist dann beim übernächsten Öffnen aktiv. Zum
Ausprobieren einer neuen Fassung die Seite also zweimal neu laden. Wenn etwas
hängt, in `sw.js` die `VERSION` hochzählen (z. B. `"v2"`), dann wird der
Offline-Speicher komplett erneuert.

## Auf dem Tablet oder Handy installieren

- **Android (Chrome):** Seite öffnen → Menü (⋮) → **App installieren** bzw.
  **Zum Startbildschirm hinzufügen**.
- **iPad/iPhone (Safari):** Seite öffnen → Teilen-Symbol → **Zum
  Home-Bildschirm**.

Danach startet die App wie eine normale App im Vollbild und funktioniert auch
ohne Internet. Hoch- und Querformat gehen beide.

## Bedienung kurz

- **Los geht's:** Beim allerersten Mal kommt der **Eingangstest**. Eine
  Erklärseite kündigt ihn an, oben steht „Eingangstest · Teil 1 von 3“ mit
  einem Fortschrittsbalken. Er ist pausierbar und dauert höchstens etwa 10
  Minuten (bis zu gut 100 Felder: Buchstaben, Bausteine, Wörter, ohne
  Zwischenreize, damit er kurz bleibt). Ab dem nächsten Tag kommt beim ersten
  „Los geht's“ des Tages der **Tagescheck**: 10 Elemente mit Zwischenreizen,
  etwa 2 bis 3 Minuten, ebenfalls mit Erklärseite. Danach folgen die
  Einheiten.
- **Einheit, Kapitel, Flagge:** Eine Einheit hat 20 Felder (einstellbar), davon
  40 % Zwischenreize. Danach kommt eine Zwischenseite mit „Weiter“ oder
  „Pause“. Nach 3 Einheiten (einstellbar) ist ein Kapitel geschafft, die
  Flagge des nächsten Landes erscheint, dann die Frage „Sollen wir
  weitermachen?“.
- **Raster:** Eine Einheit besteht aus 20 Feldern (einstellbar), angezeigt wird
  aber immer nur das aktuelle Feld, groß in der Mitte. Das ersetzt die
  Schablone mit dem Loch. Die kleinen Punkte am oberen Rand zeigen, wie weit
  die Einheit ist. Du bewertest mit den drei großen Knöpfen, dann erscheint
  sofort das nächste Feld. Bei den farbigen Formen sagt Sebastian Farbe und
  Form, dann tippst du irgendeinen der drei Knöpfe. Bei „weiß nicht“ sagst du
  das Element vor, es kommt 2 bis 4 Felder später noch einmal.
- **Zurück-Pfeil** (unten bzw. rechts): holt das vorige Feld wieder nach vorn
  und nimmt seine Bewertung zurück. **Haus:** Pause, zurück zur Startseite.
- **Am PC per Tastatur:** 1 = flüssig, 2 = langsam, 3 = weiß nicht,
  Rücktaste = zurück.
- **Silbenübung** (jede dritte Einheit, sobald genug Wörter freigeschaltet
  sind): Sebastian tippt zwischen die Buchstaben, wo er trennen würde, dann auf
  „fertig“. Die App zeigt die Silben farbig, er liest, du bewertest.
- **Elternbereich:** Zahnrad oben rechts **3 Sekunden gedrückt halten**.
  Einstellungen (dort auch „Eingangstest neu starten“), Lernstand, Verlauf,
  Freigabe historischer Flaggen, Export, Import und Zurücksetzen.
- **Alte Speicherstände:** Erkennt die App einen Lernstand einer älteren
  Fassung oder einen unvollständigen Stand, startet sie den Eingangstest neu.
  Gesammelte Flaggen und Verlauf bleiben erhalten.

## Lernstand auf ein anderes Gerät übertragen

Der Lernstand wird pro Gerät im Browser gespeichert. Im Elternbereich unter
**Daten** → **Lernstand exportieren** eine JSON-Datei erzeugen, auf das andere
Gerät bringen und dort **Lernstand importieren** wählen.

Achtung: Wer im Browser „Websitedaten löschen“ wählt, löscht auch den
Lernstand. Ab und zu exportieren lohnt sich.

## Wörter ergänzen

Datei `data/words.js` öffnen und eine Zeile nach diesem Muster ergänzen:

```js
{ w: "Tomate", s: ["To", "ma", "te"], thema: "Essen" },
```

- `w` ist das Wort, `s` sind die Silben. Die Silben müssen zusammen genau das
  Wort ergeben (sonst überspringt die App den Eintrag und meldet es in der
  Browser-Konsole).
- Getrennt wird nach Sprechsilben wie in der Grundschule (Kis-te, Zu-cker,
  E-sel).
- Das Wort erscheint automatisch, sobald Sebastian alle Bausteine darin kann.

## Bausteine, Ähnlichkeitsgruppen, Reisen

- `data/elements.js`: alle Bausteine. Die Reihenfolge ist die Reihenfolge, in
  der neue Elemente eingeführt werden.
- `data/similarity.js`: Gruppen ähnlicher Elemente, die nie gleichzeitig neu
  eingeführt werden.
- `data/journeys.js`: Länder (mit einem Satz zum Erzählen) und Reisen. Für ein
  neues Land braucht es außerdem eine Flagge `flags/<kürzel>.svg`.
- `data/historic.js`: Vorschlagsliste der historischen Flaggen. Freigeben im
  Elternbereich unter **Flaggen**.

## Sprüche ergänzen

Welche Dateien gebraucht werden und welche Sätze vorgeschlagen sind, steht in
[`audio/SPRUECHE.md`](audio/SPRUECHE.md). MP3-Dateien mit genau diesen Namen in
den Ordner `audio/` legen, committen, fertig. Fehlende Dateien stören nicht.

## Wie die App lernt (kurz)

- Jedes Element hat einen Wert zwischen 0 und 1 (Delfin = 1, Schildkröte = 0,5,
  Fragezeichen = 0, gleitender Durchschnitt). Ab 0,8 und mindestens 4
  Bewertungen gilt es als **sicher**, unter 0,35 als **unbekannt**.
- Der Tagescheck zählt nur schwach, ein schlechter Tag senkt den Stand kaum. Er
  bestimmt aber die Tagesform: **schwach** = keine neuen Elemente, **normal** =
  eins pro Raster, **gut** = zwei.
- Sichere Elemente kommen in wachsenden Abständen wieder (1, 2, 4, 8, 16, 30
  Tage).
- Solange 8 oder mehr Elemente unsicher sind, kommen keine neuen dazu. Erst
  wird gefestigt.

Mehr Einzelheiten stehen in [`docs/ENTWURF.md`](docs/ENTWURF.md).

## Ordner

```
index.html, css/, js/     die App
data/                     Bausteine, Wörter, Länder, historische Flaggen
flags/                    Flaggen als SVG
audio/                    Sprüche (MP3, von dir) und SPRUECHE.md
icons/                    App-Icons
sw.js, manifest.webmanifest   Offline-Betrieb und Installation
docs/                     Auftrag und Entwurf
```

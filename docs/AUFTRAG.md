# Auftrag: Leselern-App für Sebastian (nach Prinzipien von IntraActPlus)

## Worum es geht

Baue eine Browser-App, mit der mein Sohn Sebastian (3. Klasse, kennt viele Buchstaben, erkennt manchmal Wörter, hat aber noch große Lücken) lesen übt. Die App orientiert sich an den Prinzipien des IntraActPlus-Konzepts (Jansen/Streit/Fuchs). Inhalte aus dem Buch (Seiten, Bilder, Texte) werden nicht übernommen, die App erzeugt alles selbst.

Ich sitze als Elternteil immer daneben. Sebastian liest laut, ich bewerte. Es gibt keine Spracherkennung.

Sebastian ist wissbegierig und gut zu motivieren, darf sich aber nicht langweilen. Er liebt Flaggen, auch historische.

## Oberstes Prinzip: kein Druck

Das ist die wichtigste Anforderung, sie gilt für jede Designentscheidung:

- Es gibt kein Tagesziel, keine Pflichtmenge, keine Streaks, keine Hinweise wie „Du hast gestern nicht geübt“.
- An einem Tag macht er 10 Einheiten, an einem anderen 3. Beides ist gleich in Ordnung.
- Nach jeder Einheit kann man aufhören oder weitermachen. Der Fortschritt wird nach jeder Einheit gespeichert.
- Fehler werden Sebastian nie als Fehler angezeigt (kein rotes X, kein Fehlerton, keine Fehlerzähler in seiner Ansicht).
- Ruhiges, vorhersehbares Design: gleichbleibendes Layout, keine blinkenden oder hektischen Animationen, große Touch-Flächen. Ton abschaltbar.

## Technik

- Läuft auf PC, Tablet und Handy (Hoch- und Querformat).
- Offline-fähig als PWA, Hosting über GitHub Pages. Kein Server, kein Login.
- Möglichst ohne Build-Schritt (Vanilla JS mit ES-Modulen, HTML, CSS), damit ich die App selbst pflegen kann. Wenn du einen triftigen Grund für ein Framework hast, begründe ihn vorher.
- Lernstand in IndexedDB oder localStorage. Da der Stand pro Gerät gespeichert wird: Export und Import als JSON-Datei im Elternbereich.
- Alle Grafiken als eingebettete SVG-Dateien, keine Emojis (sehen auf jedem Gerät anders aus, Flaggen-Emojis funktionieren unter Windows gar nicht).
- Keine externen Laufzeit-Abhängigkeiten aus dem Netz (keine CDN-Links, keine Live-APIs).

## Didaktischer Kern: das Raster

- Eine Einheit ist ein Raster (Standard 4 × 5 Felder, einstellbar). Darin stehen Lernelemente und dazwischen Zwischenreize.
- Zwischenreize sind farbige Formen, die Sebastian benennt: „roter Kreis“, „gelber Pfeil nach oben“, „blaues Herz“. Formen: Kreis, Quadrat, Dreieck, Herz, Stern, Pfeil (oben, unten, links, rechts). Farben: rot, blau, gelb, grün, orange. Sie zwingen ihn, jedes Lernelement neu aus dem Gedächtnis abzurufen, statt das vorige Wort zu wiederholen. Anteil der Zwischenreize einstellbar.
- Das aktuelle Feld wird hervorgehoben (ersetzt den zeigenden Finger). Ich bewerte jedes Feld mit drei Knöpfen:
  - Delfin = flüssig
  - Schildkröte = langsam
  - Fragezeichen = weiß nicht
- Bei „weiß nicht“ sage ich ihm das Element vor. Die App merkt sich das und lässt das Element kurz darauf (2 bis 4 Felder später) noch einmal erscheinen, damit er es direkt richtig lesen kann (fehlerfreies Lernen).
- Die App misst die Zeit vom Hervorheben bis zur Bewertung als Zusatzinformation. Maßgeblich ist meine Bewertung.
- Groß- und Kleinbuchstaben werden von Anfang an gemischt geübt, wie in der Schule.
- Pro Raster höchstens ein bis zwei neue Elemente, der Rest bekannte oder unsichere Elemente.

## Lernelemente (Bausteine)

Startliste, gern ergänzen:

- Einzelbuchstaben inkl. Ä Ö Ü ä ö ü ß
- Mehrfachbuchstaben: sch, ch, ck, ng, nk, tz, qu, pf
- Vokalverbindungen: ei, ai, au, eu, äu, ie, aa, ee, oo, ah, eh, ih, oh, uh
- Konsonantenverbindungen am Silbenanfang: bl, br, dr, fl, fr, gl, gr, kl, kn, kr, pl, pr, schl, schm, schn, schr, schw, sp, spr, st, str, tr, zw
- Vorsilben: be, ge, ver, vor, ent, er, zer, un, ab, an, auf, aus, ein, mit, nach, weg, zu
- Nachsilben: en, er, el, ung, heit, keit, lich, ig, isch, chen, lein, nis, schaft, bar, los

Ähnlichkeitsregel: Elemente, die sich optisch oder lautlich ähneln, werden nie gleichzeitig neu eingeführt. Das nächste kommt erst, wenn das erste sicher sitzt. Mindestens: b/d/p/q, m/n, n/u/h, i/l/I, f/t, ä/a, ö/o, ü/u, M/W, E/F, ei/ie, eu/äu, sp/st. Lege die Ähnlichkeitsgruppen als Daten an, nicht im Code verstreut.

## Silben und Wörter

- Sobald genug Bausteine sitzen, kommen Wörter dazu. Es werden nur Wörter angeboten, deren Bausteine Sebastian bereits kann.
- Sebastian tippt auf dem Bildschirm die Stellen an, an denen das Wort in Silben getrennt wird. Die App prüft das selbst und zeigt die Silben danach farblich abgesetzt an. Bei falsch gesetzter Trennung zeigt sie einfach freundlich die richtige, ohne Fehlerhinweis.
- Danach liest Sebastian das Wort, ich bewerte wie im Raster.
- Silbengrenzen werden in der Wortliste hinterlegt, nicht algorithmisch berechnet (aktuelle Rechtschreibung, z. B. Kis-te, Zu-cker).
- Starte mit ca. 80 kindgerechten Wörtern (Tiere, Essen, Fahrzeuge, Länder, Alltag), getrennt in einer Datendatei, damit ich sie erweitern kann.

## Eingangstest und Tagescheck

- Beim allerersten Start: Eingangstest, höchstens ca. 10 Minuten, jederzeit pausierbar. Reihenfolge: Einzelbuchstaben (groß und klein gemischt), dann Bausteine, dann einfache Wörter. Ein Block bricht nach 4 × „weiß nicht“ in Folge ab. Bewertung wie im Raster.
- Jeden neuen Tag: kurzer Tagescheck (ca. 10 Elemente, 2 bis 3 Minuten) aus bekannten, unsicheren und kürzlich neuen Elementen. Daraus stellt die App die Aufgaben des Tages zusammen.
- Der Tagescheck überschreibt den Lernstand nicht. Sebastian hat gute und schlechte Tage. Der Lernstand pro Element wird über die Zeit gewichtet fortgeschrieben (z. B. gleitender Durchschnitt), ein schlechter Tag senkt ihn nur leicht.
- Schlechte Tagesform: mehr Bekanntes und Festigen, keine neuen Elemente. Gute Tagesform: ein bis zwei neue Elemente.
- Sicher beherrschte Elemente tauchen in größeren Abständen weiter auf (verteilte Wiederholung).

## Flaggenreise (Motivation)

- Eine Reise besteht aus 10 kurzen Kapiteln. Ein Kapitel umfasst wenige Einheiten (Anzahl einstellbar, Standard 3).
- Die Reise ist auf einer einfachen Karte dargestellt und führt geografisch sinnvoll von Deutschland aus durch Nachbarländer und weiter.
- Nach jedem Kapitel erscheint groß die Flagge des nächsten Landes mit Namen und Hauptstadt. Dann erzähle ich etwas dazu, und es geht mit einem Tipp weiter.
- Gesammelte Flaggen landen in einem Sammelalbum, das Sebastian jederzeit ansehen kann.
- Nach einer abgeschlossenen Reise gibt es als Sonderfund eine historische Flagge (z. B. DDR, Preußen, Jugoslawien, Sowjetunion, Tschechoslowakei). Keine NS-Symbole und keine verfassungsfeindlichen Kennzeichen. Lege die Liste der historischen Flaggen als Vorschlag an, ich gebe sie frei.
- Ein unterbrochenes Kapitel wird beim nächsten Mal fortgesetzt, nichts geht verloren.
- Flaggen-SVGs aus einer frei lizenzierten Quelle (z. B. Paket flag-icons, MIT-Lizenz, oder gemeinfreie Dateien von Wikimedia Commons), lokal im Projekt abgelegt. Lizenzhinweise in einer LICENSES-Datei.

## Sprachausgabe

- Nur kurze Motivationssprüche als MP3-Dateien, die ich selbst mit ElevenLabs erzeuge und in einen Ordner `audio/` lege. Keine Laute, keine Wörter.
- Anlässe, je 3 bis 5 Varianten, einige mit Sebastians Namen:
  - Start („Lass uns loslegen!“)
  - Hälfte eines Kapitels geschafft („Die Hälfte hast du schon.“)
  - Kapitel geschafft („Das hast du gut gemacht, Sebastian!“)
  - Reise geschafft
  - Nach einem Kapitel die Frage nach dem Weitermachen („Sollen wir weitermachen?“), freundlich und ohne Druck, „Nein“ ist gleichwertig
- Lege eine Datei `audio/SPRUECHE.md` an, die für jede benötigte Datei den Dateinamen und den vorgeschlagenen Satz auflistet, damit ich sie gezielt erzeugen kann.
- Fehlt eine Datei, läuft die App ohne Ton weiter.

## Elternbereich

Durch einfache Sperre geschützt (z. B. lange gedrückt halten oder kleine Rechenaufgabe), damit Sebastian nicht versehentlich hineinkommt.

- Einstellungen: Rastergröße, Anteil Zwischenreize, Einheiten pro Kapitel, Zeitgrenze flüssig/langsam (Standard 2 Sekunden), Ton an/aus
- Lernstand: Übersicht pro Element (sicher, unsicher, unbekannt), Verlauf über die Tage
- Export/Import des Lernstands, Zurücksetzen
- Freigabe der historischen Flaggen

## Vorgehen

1. Lege zuerst kurz die Projektstruktur und das Datenmodell fest (Elemente, Ähnlichkeitsgruppen, Wortliste, Lernstand pro Element, Reisen) und zeig mir beides, bevor du loslegst.
2. Baue dann eine erste lauffähige Version mit allen Kernfunktionen: Raster mit Bewertung, Eingangstest, Tagescheck mit Anpassung, Speichern, Silbenübung, eine Flaggenreise mit 10 Ländern, Elternbereich.
3. Committe in sinnvollen Schritten mit verständlichen deutschen Commit-Nachrichten.
4. Schreib eine kurze `README.md` auf Deutsch: wie ich die App starte, auf GitHub Pages veröffentliche, auf dem Tablet installiere, Wörter und Sprüche ergänze.

Ich teste die erste Version mit Sebastian und melde mich danach mit Rückmeldungen.

# Sprüche für die Sprachausgabe

Lege die MP3-Dateien genau mit diesen Namen in diesen Ordner (`audio/`).
Die App spielt bei jedem Anlass zufällig eine vorhandene Variante. Fehlt eine
Datei, überspringt sie diese still. Fehlen alle, bleibt es einfach still.

Tipp für ElevenLabs: ruhige, warme Stimme, nicht zu schnell, kein Hall.
Die Sätze sind Vorschläge, du kannst sie frei ändern, nur der Dateiname zählt.

## Start (wenn Sebastian auf „Los geht's“ tippt)

| Datei | Satz |
|---|---|
| `start_1.mp3` | Lass uns loslegen! |
| `start_2.mp3` | Schön, dass du da bist, Sebastian. |
| `start_3.mp3` | Auf geht's, die Reise geht weiter. |
| `start_4.mp3` | Bereit? Dann fangen wir an. |

## Hälfte eines Kapitels geschafft

| Datei | Satz |
|---|---|
| `haelfte_1.mp3` | Die Hälfte hast du schon. |
| `haelfte_2.mp3` | Schon die Hälfte, Sebastian! |
| `haelfte_3.mp3` | Halbzeit! Das nächste Land ist schon in Sicht. |
| `haelfte_4.mp3` | Prima, die Hälfte ist geschafft. |

## Kapitel geschafft (vor der neuen Flagge)

| Datei | Satz |
|---|---|
| `kapitel_1.mp3` | Das hast du gut gemacht, Sebastian! |
| `kapitel_2.mp3` | Geschafft! Wir sind in einem neuen Land. |
| `kapitel_3.mp3` | Super gelesen! Schau mal, welche Flagge jetzt kommt. |
| `kapitel_4.mp3` | Toll, Sebastian, wieder ein Land mehr. |
| `kapitel_5.mp3` | Klasse! Die nächste Flagge gehört dir. |

## Reise geschafft (nach dem 10. Land)

| Datei | Satz |
|---|---|
| `reise_1.mp3` | Wow, Sebastian, du hast die ganze Reise geschafft! |
| `reise_2.mp3` | Die Reise ist zu Ende. Was für ein Abenteuer! |
| `reise_3.mp3` | Zehn Länder! Darauf kannst du stolz sein. |

## Frage nach dem Weitermachen (nach einem Kapitel)

Freundlich und ohne Druck, „Nein“ ist genauso gut wie „Ja“.

| Datei | Satz |
|---|---|
| `weiter_1.mp3` | Sollen wir weitermachen? |
| `weiter_2.mp3` | Möchtest du noch weiterreisen, oder machen wir Pause? |
| `weiter_3.mp3` | Weiter oder Pause, Sebastian? Beides ist gut. |
| `weiter_4.mp3` | Hast du noch Lust, oder hören wir für heute auf? |

## Weitere Varianten

Mehr Varianten pro Anlass: Zahl in `js/ui/audio.js` (Liste `OCCASIONS`) erhöhen
und die Dateien entsprechend weiter nummerieren, z. B. `start_5.mp3`.

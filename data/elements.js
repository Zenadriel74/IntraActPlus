/*
  Bausteine (Lernelemente)

  Die Reihenfolge in ORDER ist die Einführungsreihenfolge: Als nächstes neues
  Element nimmt die App das erste noch nicht eingeführte, das nicht durch die
  Ähnlichkeitsregel (similarity.js) gesperrt ist und dessen Buchstaben schon
  sitzen. Umsortieren ändert also die Reihenfolge, in der Sebastian lernt.

  Jede Zeile: [Kategorie, "Elemente durch Leerzeichen getrennt"].
  Groß- und Kleinbuchstaben sind eigene Elemente, werden aber gemischt geübt.

  Hinweis: "er" steht nur einmal (bei den Vorsilben), obwohl es auch eine
  Nachsilbe ist. Zwei gleich aussehende Elemente wären beim Lesen nicht zu
  unterscheiden.
*/

export const CATEGORIES = {
  buchstabe: "Buchstaben",
  mehrfach: "Mehrfachbuchstaben",
  vokal: "Vokalverbindungen",
  anfang: "Verbindungen am Silbenanfang",
  vorsilbe: "Vorsilben",
  nachsilbe: "Nachsilben",
};

const ORDER = [
  ["buchstabe", "M m A a I i O o L l S s E e R r N n T t"],
  ["vokal",     "ei au"],
  ["buchstabe", "U u F f H h D d W w"],
  ["mehrfach",  "sch ch"],
  ["vokal",     "ie"],
  ["buchstabe", "K k P p B b G g Z z"],
  ["mehrfach",  "ck"],
  ["vokal",     "eu"],
  ["buchstabe", "Ä ä Ö ö Ü ü J j V v"],
  ["anfang",    "st sp"],
  ["mehrfach",  "ng nk tz pf"],
  ["vokal",     "ah oh uh eh ih"],
  ["buchstabe", "C c X x Y y Q q ß"],
  ["mehrfach",  "qu"],
  ["vokal",     "äu ai aa ee oo"],
  ["anfang",    "bl br dr fl fr gl gr kl kn kr pl pr schl schm schn schr schw spr str tr zw"],
  ["vorsilbe",  "be ge ver vor ent er zer un ab an auf aus ein mit nach weg zu"],
  ["nachsilbe", "en el ung heit keit lich ig isch chen lein nis schaft bar los"],
];

export const ELEMENTS = [];
for (const [cat, list] of ORDER) {
  for (const text of list.split(/\s+/).filter(Boolean)) {
    if (ELEMENTS.some((e) => e.id === text)) continue; // doppelte überspringen
    ELEMENTS.push({
      id: text,
      text,
      cat,
      // Buchstaben, die vorher sitzen müssen (bei Einzelbuchstaben keine)
      parts: cat === "buchstabe" ? [] : [...new Set(text.toLowerCase())],
    });
  }
}

export const BY_ID = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));

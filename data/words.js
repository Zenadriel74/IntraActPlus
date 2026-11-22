/*
  Wortliste

  w = das Wort, s = die Silben. Die Silben müssen zusammen genau das Wort
  ergeben (die App prüft das beim Start und überspringt fehlerhafte Einträge).

  Getrennt wird nach Sprechsilben, wie in der Grundschule mit Silbenbögen:
  Kis-te, Zu-cker, Ap-fel. Einzelne Vokale am Wortanfang werden mitgezählt
  (E-sel, O-ma), auch wenn man sie am Zeilenende nicht abtrennen würde.

  Ein Wort wird erst angeboten, wenn Sebastian alle seine Bausteine kann.
  Ergänzen: einfach eine Zeile kopieren und anpassen.
*/

export const WORDS = [
  // Tiere
  { w: "Maus",        s: ["Maus"],                 thema: "Tiere" },
  { w: "Hund",        s: ["Hund"],                 thema: "Tiere" },
  { w: "Katze",       s: ["Kat", "ze"],            thema: "Tiere" },
  { w: "Esel",        s: ["E", "sel"],             thema: "Tiere" },
  { w: "Igel",        s: ["I", "gel"],             thema: "Tiere" },
  { w: "Affe",        s: ["Af", "fe"],             thema: "Tiere" },
  { w: "Hase",        s: ["Ha", "se"],             thema: "Tiere" },
  { w: "Ente",        s: ["En", "te"],             thema: "Tiere" },
  { w: "Kuh",         s: ["Kuh"],                  thema: "Tiere" },
  { w: "Schaf",       s: ["Schaf"],                thema: "Tiere" },
  { w: "Ziege",       s: ["Zie", "ge"],            thema: "Tiere" },
  { w: "Fisch",       s: ["Fisch"],                thema: "Tiere" },
  { w: "Vogel",       s: ["Vo", "gel"],            thema: "Tiere" },
  { w: "Löwe",        s: ["Lö", "we"],             thema: "Tiere" },
  { w: "Tiger",       s: ["Ti", "ger"],            thema: "Tiere" },
  { w: "Biene",       s: ["Bie", "ne"],            thema: "Tiere" },
  { w: "Delfin",      s: ["Del", "fin"],           thema: "Tiere" },
  { w: "Wal",         s: ["Wal"],                  thema: "Tiere" },
  { w: "Wolf",        s: ["Wolf"],                 thema: "Tiere" },
  { w: "Eule",        s: ["Eu", "le"],             thema: "Tiere" },
  { w: "Raupe",       s: ["Rau", "pe"],            thema: "Tiere" },
  { w: "Elefant",     s: ["E", "le", "fant"],      thema: "Tiere" },
  { w: "Pinguin",     s: ["Pin", "gu", "in"],      thema: "Tiere" },
  { w: "Schildkröte", s: ["Schild", "krö", "te"],  thema: "Tiere" },

  // Essen
  { w: "Ei",          s: ["Ei"],                   thema: "Essen" },
  { w: "Brot",        s: ["Brot"],                 thema: "Essen" },
  { w: "Saft",        s: ["Saft"],                 thema: "Essen" },
  { w: "Reis",        s: ["Reis"],                 thema: "Essen" },
  { w: "Milch",       s: ["Milch"],                thema: "Essen" },
  { w: "Wurst",       s: ["Wurst"],                thema: "Essen" },
  { w: "Apfel",       s: ["Ap", "fel"],            thema: "Essen" },
  { w: "Birne",       s: ["Bir", "ne"],            thema: "Essen" },
  { w: "Butter",      s: ["But", "ter"],           thema: "Essen" },
  { w: "Käse",        s: ["Kä", "se"],             thema: "Essen" },
  { w: "Nudel",       s: ["Nu", "del"],            thema: "Essen" },
  { w: "Pizza",       s: ["Piz", "za"],            thema: "Essen" },
  { w: "Suppe",       s: ["Sup", "pe"],            thema: "Essen" },
  { w: "Honig",       s: ["Ho", "nig"],            thema: "Essen" },
  { w: "Salat",       s: ["Sa", "lat"],            thema: "Essen" },
  { w: "Kuchen",      s: ["Ku", "chen"],           thema: "Essen" },
  { w: "Zucker",      s: ["Zu", "cker"],           thema: "Essen" },
  { w: "Möhre",       s: ["Möh", "re"],            thema: "Essen" },
  { w: "Tomate",      s: ["To", "ma", "te"],       thema: "Essen" },
  { w: "Banane",      s: ["Ba", "na", "ne"],       thema: "Essen" },

  // Fahrzeuge
  { w: "Bus",         s: ["Bus"],                  thema: "Fahrzeuge" },
  { w: "Zug",         s: ["Zug"],                  thema: "Fahrzeuge" },
  { w: "Rad",         s: ["Rad"],                  thema: "Fahrzeuge" },
  { w: "Boot",        s: ["Boot"],                 thema: "Fahrzeuge" },
  { w: "Kran",        s: ["Kran"],                 thema: "Fahrzeuge" },
  { w: "Schiff",      s: ["Schiff"],               thema: "Fahrzeuge" },
  { w: "Auto",        s: ["Au", "to"],             thema: "Fahrzeuge" },
  { w: "Taxi",        s: ["Ta", "xi"],             thema: "Fahrzeuge" },
  { w: "Roller",      s: ["Rol", "ler"],           thema: "Fahrzeuge" },
  { w: "Bagger",      s: ["Bag", "ger"],           thema: "Fahrzeuge" },
  { w: "Laster",      s: ["Las", "ter"],           thema: "Fahrzeuge" },
  { w: "Traktor",     s: ["Trak", "tor"],          thema: "Fahrzeuge" },
  { w: "Fahrrad",     s: ["Fahr", "rad"],          thema: "Fahrzeuge" },
  { w: "Rakete",      s: ["Ra", "ke", "te"],       thema: "Fahrzeuge" },
  { w: "Flugzeug",    s: ["Flug", "zeug"],         thema: "Fahrzeuge" },
  { w: "Motorrad",    s: ["Mo", "tor", "rad"],     thema: "Fahrzeuge" },

  // Länder und Flaggen
  { w: "Polen",       s: ["Po", "len"],            thema: "Länder" },
  { w: "Fahne",       s: ["Fah", "ne"],            thema: "Länder" },
  { w: "Flagge",      s: ["Flag", "ge"],           thema: "Länder" },
  { w: "Island",      s: ["Is", "land"],           thema: "Länder" },
  { w: "Irland",      s: ["Ir", "land"],           thema: "Länder" },
  { w: "Schweiz",     s: ["Schweiz"],              thema: "Länder" },
  { w: "Ungarn",      s: ["Un", "garn"],           thema: "Länder" },
  { w: "Lettland",    s: ["Lett", "land"],         thema: "Länder" },
  { w: "Schweden",    s: ["Schwe", "den"],         thema: "Länder" },
  { w: "Norwegen",    s: ["Nor", "we", "gen"],     thema: "Länder" },
  { w: "Dänemark",    s: ["Dä", "ne", "mark"],     thema: "Länder" },
  { w: "Frankreich",  s: ["Frank", "reich"],       thema: "Länder" },
  { w: "Österreich",  s: ["Ös", "ter", "reich"],   thema: "Länder" },
  { w: "Italien",     s: ["I", "ta", "li", "en"],  thema: "Länder" },
  { w: "Spanien",     s: ["Spa", "ni", "en"],      thema: "Länder" },
  { w: "Belgien",     s: ["Bel", "gi", "en"],      thema: "Länder" },

  // Alltag
  { w: "Mama",        s: ["Ma", "ma"],             thema: "Alltag" },
  { w: "Papa",        s: ["Pa", "pa"],             thema: "Alltag" },
  { w: "Oma",         s: ["O", "ma"],              thema: "Alltag" },
  { w: "Opa",         s: ["O", "pa"],              thema: "Alltag" },
  { w: "Haus",        s: ["Haus"],                 thema: "Alltag" },
  { w: "Ball",        s: ["Ball"],                 thema: "Alltag" },
  { w: "Tisch",       s: ["Tisch"],                thema: "Alltag" },
  { w: "Mond",        s: ["Mond"],                 thema: "Alltag" },
  { w: "Baum",        s: ["Baum"],                 thema: "Alltag" },
  { w: "Sofa",        s: ["So", "fa"],             thema: "Alltag" },
  { w: "Hose",        s: ["Ho", "se"],             thema: "Alltag" },
  { w: "Name",        s: ["Na", "me"],             thema: "Alltag" },
  { w: "Lampe",       s: ["Lam", "pe"],            thema: "Alltag" },
  { w: "Kiste",       s: ["Kis", "te"],            thema: "Alltag" },
  { w: "Sonne",       s: ["Son", "ne"],            thema: "Alltag" },
  { w: "Regen",       s: ["Re", "gen"],            thema: "Alltag" },
  { w: "Seife",       s: ["Sei", "fe"],            thema: "Alltag" },
  { w: "Blume",       s: ["Blu", "me"],            thema: "Alltag" },
  { w: "Schule",      s: ["Schu", "le"],           thema: "Alltag" },
  { w: "Tasche",      s: ["Ta", "sche"],           thema: "Alltag" },
  { w: "Wasser",      s: ["Was", "ser"],           thema: "Alltag" },
  { w: "Garten",      s: ["Gar", "ten"],           thema: "Alltag" },
  { w: "Kinder",      s: ["Kin", "der"],           thema: "Alltag" },
  { w: "Sebastian",   s: ["Se", "bas", "ti", "an"], thema: "Alltag" },
];

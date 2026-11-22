/*
  Ähnlichkeitsgruppen

  Elemente einer Gruppe sehen sich ähnlich oder klingen ähnlich. Sie werden nie
  gleichzeitig neu eingeführt: Solange ein Element einer Gruppe "in Einführung"
  ist (schon gezeigt, aber noch nicht sicher), bleibt der Rest der Gruppe
  gesperrt. Ein Element darf in mehreren Gruppen stehen.
*/

export const SIMILAR = [
  // aus dem Auftrag
  ["b", "d", "p", "q"],
  ["m", "n"],
  ["n", "u", "h"],
  ["i", "l", "I"],
  ["f", "t"],
  ["ä", "a"],
  ["ö", "o"],
  ["ü", "u"],
  ["M", "W"],
  ["E", "F"],
  ["ei", "ie"],
  ["eu", "äu"],
  ["sp", "st"],

  // Ergänzungen
  ["Ä", "A"],
  ["Ö", "O"],
  ["Ü", "U"],
  ["O", "Q"],
  ["P", "R"],
  ["ch", "ck"],
  ["ng", "nk"],
  ["au", "eu"],
  ["ah", "eh", "oh", "uh", "ih"],
  ["sch", "schl", "schm", "schn", "schr", "schw"],
  ["heit", "keit"],
  ["ver", "vor"],
];

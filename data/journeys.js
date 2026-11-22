/*
  Länder und Reisen

  COUNTRIES: Name, Hauptstadt, Lage der Hauptstadt (für die Karte) und ein
  kurzer Satz, den du beim Erzählen verwenden kannst. Die Flagge liegt unter
  flags/<id>.svg.

  JOURNEYS: Jede Reise hat einen Startpunkt und 10 Stationen. Jede Station ist
  ein Kapitel. Nach der letzten Reise beginnt wieder die erste.
*/

export const COUNTRIES = {
  de: { name: "Deutschland",  capital: "Berlin",     lat: 52.52, lon: 13.40, fact: "Schwarz, Rot und Gold: So sieht die deutsche Flagge seit 1949 aus." },

  dk: { name: "Dänemark",     capital: "Kopenhagen", lat: 55.68, lon: 12.57, fact: "Die dänische Flagge heißt Dannebrog. Sie gilt als die älteste Staatsflagge der Welt, die noch benutzt wird." },
  nl: { name: "Niederlande",  capital: "Amsterdam",  lat: 52.37, lon: 4.90,  fact: "In den Niederlanden gibt es mehr Fahrräder als Menschen." },
  be: { name: "Belgien",      capital: "Brüssel",    lat: 50.85, lon: 4.35,  fact: "Belgien ist berühmt für Schokolade, Waffeln und Pommes frites." },
  lu: { name: "Luxemburg",    capital: "Luxemburg",  lat: 49.61, lon: 6.13,  fact: "Luxemburg ist eines der kleinsten Länder Europas. Dort spricht man Luxemburgisch, Französisch und Deutsch." },
  fr: { name: "Frankreich",   capital: "Paris",      lat: 48.86, lon: 2.35,  fact: "In Paris steht der Eiffelturm. Er ist über 300 Meter hoch." },
  ch: { name: "Schweiz",      capital: "Bern",       lat: 46.95, lon: 7.45,  fact: "Die Schweizer Flagge ist quadratisch. Das gibt es sonst nur noch beim Vatikan." },
  it: { name: "Italien",      capital: "Rom",        lat: 41.90, lon: 12.50, fact: "Auf der Landkarte sieht Italien aus wie ein Stiefel." },
  at: { name: "Österreich",   capital: "Wien",       lat: 48.21, lon: 16.37, fact: "Rot-Weiß-Rot gehört zu den ältesten Flaggen der Welt." },
  cz: { name: "Tschechien",   capital: "Prag",       lat: 50.08, lon: 14.44, fact: "In Prag führt die alte Karlsbrücke aus Stein über den Fluss Moldau." },
  pl: { name: "Polen",        capital: "Warschau",   lat: 52.23, lon: 21.01, fact: "Die Weichsel ist der längste Fluss in Polen. Sie fließt auch durch Warschau." },

  lt: { name: "Litauen",      capital: "Vilnius",    lat: 54.69, lon: 25.28, fact: "An der Küste von Litauen gibt es riesige Sanddünen." },
  lv: { name: "Lettland",     capital: "Riga",       lat: 56.95, lon: 24.11, fact: "Die lettische Flagge hat eine seltene Farbe: ein dunkles Rot, fast wie Kirschen." },
  ee: { name: "Estland",      capital: "Tallinn",    lat: 59.44, lon: 24.75, fact: "Zu Estland gehören über 2000 Inseln." },
  fi: { name: "Finnland",     capital: "Helsinki",   lat: 60.17, lon: 24.94, fact: "Finnland nennt man das Land der tausend Seen. In Wirklichkeit sind es noch viel mehr." },
  se: { name: "Schweden",     capital: "Stockholm",  lat: 59.33, lon: 18.07, fact: "Ganz im Norden von Schweden wird es im Sommer auch nachts nicht dunkel." },
  no: { name: "Norwegen",     capital: "Oslo",       lat: 59.91, lon: 10.75, fact: "Norwegen hat lange, tiefe Meeresbuchten zwischen hohen Bergen. Sie heißen Fjorde." },
  fo: { name: "Färöer",       capital: "Tórshavn",   lat: 62.01, lon: -6.77, fact: "Die Färöer sind 18 Inseln mitten im Atlantik. Sie gehören zu Dänemark, haben aber eine eigene Flagge." },
  is: { name: "Island",       capital: "Reykjavík",  lat: 64.15, lon: -21.94, fact: "Auf Island gibt es Vulkane und heiße Quellen, die Wasser in die Luft spritzen. Sie heißen Geysire." },
  ie: { name: "Irland",       capital: "Dublin",     lat: 53.35, lon: -6.26, fact: "Irland nennt man die grüne Insel, weil es dort so viele Wiesen gibt." },
  gb: { name: "Vereinigtes Königreich", capital: "London", lat: 51.51, lon: -0.13, fact: "Die Flagge heißt Union Jack. In ihr stecken drei Kreuze: für England, Schottland und Irland." },
};

export const JOURNEYS = [
  {
    id: "rund-um-deutschland",
    name: "Rund um Deutschland",
    start: "de",
    stops: ["dk", "nl", "be", "lu", "fr", "ch", "it", "at", "cz", "pl"],
  },
  {
    id: "nach-norden",
    name: "Hoch in den Norden",
    start: "pl",
    stops: ["lt", "lv", "ee", "fi", "se", "no", "fo", "is", "ie", "gb"],
  },
];

export const HOME_COUNTRY = "de";

// Service Worker: legt alle Dateien für den Offline-Betrieb in den Cache.
// Neue Fassungen kommen automatisch (siehe unten). VERSION hochzählen leert den Cache ganz.

const VERSION = "v3";
const CACHE = `flaggenreise-${VERSION}`;

const FILES = [
  "./",
  "css/app.css",
  "data/elements.js",
  "data/europe.js",
  "data/historic.js",
  "data/journeys.js",
  "data/similarity.js",
  "data/words.js",
  "flags/at.svg",
  "flags/be.svg",
  "flags/ch.svg",
  "flags/cz.svg",
  "flags/de.svg",
  "flags/dk.svg",
  "flags/ee.svg",
  "flags/fi.svg",
  "flags/fo.svg",
  "flags/fr.svg",
  "flags/gb.svg",
  "flags/hist-ddr.svg",
  "flags/hist-jugoslawien.svg",
  "flags/hist-osmanisch.svg",
  "flags/hist-preussen.svg",
  "flags/hist-sowjetunion.svg",
  "flags/hist-tschechoslowakei.svg",
  "flags/ie.svg",
  "flags/is.svg",
  "flags/it.svg",
  "flags/lt.svg",
  "flags/lu.svg",
  "flags/lv.svg",
  "flags/nl.svg",
  "flags/no.svg",
  "flags/pl.svg",
  "flags/se.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "index.html",
  "js/flow.js",
  "js/learning.js",
  "js/main.js",
  "js/planner.js",
  "js/store.js",
  "js/tokenize.js",
  "js/ui/audio.js",
  "js/ui/dom.js",
  "js/ui/icons.js",
  "js/ui/map.js",
  "js/ui/shapes.js",
  "js/views/grid.js",
  "js/views/parent.js",
  "js/views/ratebar.js",
  "js/views/screens.js",
  "js/views/sequence.js",
  "js/views/syllables.js",
  "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  // cache: "reload" holt jede Datei frisch vom Server, nicht aus dem Browser-Cache,
  // damit nach einem Update keine alte Fassung im Offline-Speicher landet.
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("flaggenreise-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Sofort aus dem Cache antworten (schnell und offline) und im Hintergrund die
// neueste Fassung holen. Änderungen erscheinen so beim übernächsten Öffnen,
// auch ohne VERSION hochzuzählen. Auch die MP3-Sprüche werden so gemerkt.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      const fresh = fetch(e.request, { cache: "no-cache" })
        .then((res) => {
          if (res.status === 200) cache.put(e.request, res.clone()).catch(() => {});
          return res;
        })
        .catch(() => hit || Response.error());
      return hit || fresh;
    })
  );
});

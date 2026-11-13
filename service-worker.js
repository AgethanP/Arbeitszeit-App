
"use strict";

const CACHE_NAME = "arbeitszeit-app-v3-1";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();

      await Promise.all(
        names
          .filter((name) =>
            name.startsWith("arbeitszeit-app-") &&
            name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Keine fremden Internetadressen zwischenspeichern.
  if (url.origin !== self.location.origin) return;

  const allowedFiles = new Set(
    APP_FILES.map((file) =>
      new URL(file, self.registration.scope).pathname
    )
  );

  // Nur Dateien der App cachen,
  // niemals hochgeladene Abrechnungen.
  if (!allowedFiles.has(url.pathname)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const response = await fetch(request);

        if (response.ok) {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        const saved = await cache.match(request);

        if (saved) return saved;

        if (request.mode === "navigate") {
          const home = await cache.match("./index.html");

          if (home) return home;
        }

        return Response.error();
      }
    })()
  );
});

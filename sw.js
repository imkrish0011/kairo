const CACHE_NAME = "kairo-v4";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// External CDN assets to cache for offline app shell
const CDN_HOSTS = [
  "cdn.tailwindcss.com",
  "unpkg.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "www.gstatic.com"
];

// Firebase / Google API hosts to NEVER cache
const SKIP_HOSTS = [
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "www.googleapis.com",
  "firebase.googleapis.com",
  "firebaseinstallations.googleapis.com"
];

// install — precache app shell
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// activate — clean up old caches and claim clients immediately
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// fetch handler
self.addEventListener("fetch", e => {
  // Skip non-GET requests
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Skip Firebase API calls — never intercept these
  if (SKIP_HOSTS.some(h => url.hostname.includes(h))) return;

  // CDN assets: network-first with cache fallback
  const isCDN = CDN_HOSTS.some(h => url.hostname.includes(h));

  if (isCDN) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Local assets: cache-first, network fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful local responses for next time
        if (response && response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // If both cache and network fail, return a basic offline page for navigation
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
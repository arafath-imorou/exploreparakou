const CACHE_NAME = 'explore-parakou-v2';

const PRECACHE_ASSETS = [
    './',
    'index.html',
    'histoire.html',
    'tourisme.html',
    'culture.html',
    'talents.html',
    'agenda.html',
    'investir.html',
    'medias.html',
    'contact.html',
    'carte.html',
    'assets/css/style.css',
    'assets/js/script.js',
    'assets/js/supabaseClient.js',
    'assets/images/logo.webp'
];

// Install: Pre-cache core shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('Pre-caching non-fatal warning:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Smart Caching Strategy
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Ne pas intercepter les requêtes Supabase DB directes (gérées par le cache Stale-While-Revalidate dans supabaseClient.js)
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // HTML / Page navigation: Network-first avec cache fallback instantané
    if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) return cachedResponse;
                    return caches.match('index.html');
                })
        );
        return;
    }

    // Static Assets (Images, CSS, JS, Fonts): Cache-first pour un chargement instantané (< 15ms)
    if (
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font' ||
        url.pathname.startsWith('/assets/') ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('unpkg.com')
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Si en cache, retour immédiat et refresh en tâche de fond (Stale-While-Revalidate)
                    fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                        }
                    }).catch(() => {});
                    return cachedResponse;
                }
                return fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Requêtes génériques par défaut
    event.respondWith(
        caches.match(request).then((response) => response || fetch(request))
    );
});

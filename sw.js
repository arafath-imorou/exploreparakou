const CACHE_NAME = 'explore-parakou-v4-ultrafast';

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
    'assets/images/logo.webp',
    'assets/images/hero-bg.webp',
    'assets/images/culture-hero-final.webp',
    'assets/images/portrait.webp',
    'assets/images/PALAIS_ROYAL_DE_PARAKOU.webp',
    'assets/images/Musee_plein_air.webp'
];

// Install: Pre-cache core shell immédiatement
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('[SW] Pre-caching warning:', err);
            });
        })
    );
});

// Activate: Clean up old caches immédiatement
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Smart Caching Strategy (Ultra-Fast Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Ne pas intercepter l'authentification admin ou requêtes API Supabase
    if (url.hostname.includes('supabase.co') || url.pathname.includes('admin.html')) {
        return;
    }

    // HTML / Navigation : Cache-First + Stale-While-Revalidate (Retour en 1ms !)
    if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                // Fetch de mise à jour en tâche de fond discrète
                const networkFetch = fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                }).catch(() => {});

                // Retour immédiat depuis le cache local (1ms)
                if (cachedResponse) {
                    return cachedResponse;
                }
                return networkFetch.then((res) => res || caches.match('index.html'));
            })
        );
        return;
    }

    // Assets statiques (CSS, JS, Fonts, Images) : Cache-First avec rafraîchissement silencieux
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
                    // Refresh discret en tâche de fond
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

    // Par défaut
    event.respondWith(
        caches.match(request).then((response) => response || fetch(request))
    );
});

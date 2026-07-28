// ============================================================
// SERVICE WORKER - Focus Habit Tracker (VERSIÓN 2.0)
// ============================================================
const CACHE_NAME = 'focus-habit-v2'; // <-- CAMBIADO A v2 PARA FORZAR ACTUALIZACIÓN
const urlsToCache = [
    'index.html',
    'manifest.json',
    'icon-192.png',
    'icon-512.png',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// ============================================================
// INSTALACIÓN
// ============================================================
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Archivos cacheados');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker instalado correctamente');
                // Forzar activación inmediata
                return self.skipWaiting();
            })
    );
});

// ============================================================
// ACTIVACIÓN
// ============================================================
self.addEventListener('activate', (event) => {
    console.log('⚡ Service Worker activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eliminar caches antiguos (que no sean la versión actual)
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Cache antiguo eliminado:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Service Worker activado correctamente');
            // Tomar control de todas las páginas abiertas
            return self.clients.claim();
        })
    );
});

// ============================================================
// FETCH (INTERCEPTAR PETICIONES)
// ============================================================
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si está en cache, devolverlo
                if (response) {
                    return response;
                }

                // Si no está en cache, ir a la red
                return fetch(event.request).then(
                    (response) => {
                        // Verificar si es una respuesta válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar la respuesta para guardarla en cache
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// ============================================================
// MENSAJES DESDE LA APP (PARA FORZAR ACTUALIZACIÓN)
// ============================================================
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
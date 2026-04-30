// KING SHOP Service Worker
// Забезпечує офлайн-роботу додатку

const CACHE_NAME = 'king-shop-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;800;900&family=Nunito:wght@400;500;600;700&display=swap'
];

// Установка SW і кешування файлів
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активація — видалення старого кешу
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Перехоплення запитів — спочатку з мережі, якщо немає - з кешу
self.addEventListener('fetch', event => {
  // Не кешуємо запити до Firebase
  if(event.request.url.includes('firestore.googleapis.com') || 
     event.request.url.includes('firebasestorage.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Кешуємо нові ресурси
        if(response.ok && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push-сповіщення (для майбутніх можливостей)
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'KING SHOP', {
      body: data.body || 'Нове повідомлення',
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    })
  );
});

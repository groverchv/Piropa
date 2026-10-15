// Empty service worker to silence 404 in dev if browser registered FCM previously
self.addEventListener('install', () => {
	self.skipWaiting();
});
self.addEventListener('activate', () => {
	self.clients.claim();
});

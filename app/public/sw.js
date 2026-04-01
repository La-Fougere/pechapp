const CACHE_NAME = 'pechapp-static-v2';
const TILE_CACHE_NAME = 'pechapp-tiles-v1';
const ASSET_MANIFEST_URL = '/assets/asset-manifest.json';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon/favicon.png',
  '/assets/icon/icon.png',
  '/assets/data/data.json',
  '/assets/data/locations.json',
  '/assets/sheet.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await addAllSafe(cache, CORE_ASSETS);
      const manifestUrls = await loadAssetManifest(cache);
      const coreSet = new Set(CORE_ASSETS);
      const assetUrls = manifestUrls
        .filter((url) => typeof url === 'string' && url.startsWith('/assets/'))
        .filter((url) => !coreSet.has(url));
      await addAllSafe(cache, assetUrls);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith('pechapp-') &&
                key !== CACHE_NAME &&
                key !== TILE_CACHE_NAME
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const addAllSafe = async (cache, urls) => {
  await Promise.all(
    urls.map(async (url) => {
      try {
        await cache.add(url);
      } catch (error) {
        console.warn('Failed to precache', url, error);
      }
    })
  );
};

const loadAssetManifest = async (cache) => {
  try {
    const response = await fetch(ASSET_MANIFEST_URL, { cache: 'no-store' });
    if (response.ok) {
      await cache.put(ASSET_MANIFEST_URL, response.clone());
      const manifest = await response.json();
      return Array.isArray(manifest) ? manifest : [];
    }
  } catch (error) {
    console.warn('Failed to fetch asset manifest', error);
  }

  const cached = await cache.match(ASSET_MANIFEST_URL);
  if (cached) {
    try {
      const manifest = await cached.json();
      return Array.isArray(manifest) ? manifest : [];
    } catch (error) {
      console.warn('Failed to parse cached asset manifest', error);
    }
  }

  return [];
};

const cacheFirst = async (request, cacheName = CACHE_NAME) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
};

const networkFirst = async (request, cacheName = CACHE_NAME) => {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isTileRequest = url.hostname.endsWith('.tile.openstreetmap.org');
  if (isTileRequest) {
    event.respondWith(cacheFirst(event.request, TILE_CACHE_NAME));
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  const acceptsHtml = event.request.headers.get('accept') || '';
  const isNavigation =
    event.request.mode === 'navigate' || acceptsHtml.includes('text/html');

  if (isNavigation) {
    event.respondWith(networkFirst('/index.html'));
    return;
  }

  if (url.pathname === '/assets/sheet.json') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

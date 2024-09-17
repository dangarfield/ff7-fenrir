importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js')

const ZIP_URL = self.location.host.includes('localhost')
  ? '/kujata-data/cache.zip'
  : 'https://kujata-data-dg.netlify.app/cache.zip'

const KUJATA_BASE = self.location.host.includes('localhost')
  ? '/kujata-data/cache.zip'
  : 'https://kujata-data-dg.netlify.app/cache.zip'

const CACHE_NAME = 'kujata-data-common'

self.addEventListener('install', async event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('CACHE: service worker - fetching zip 007', ZIP_URL)
      const response = await fetch(ZIP_URL)
      const zipBlob = await response.blob()
      console.log('CACHE: service worker - blob', zipBlob)
      const zip = await JSZip.loadAsync(zipBlob)
      console.log('CACHE: service worker - zip', zip)

      console.log(
        'CACHE: service worker - cache population: START',
        Object.keys(zip.files).length
      )
      const filePromises = Object.keys(zip.files).map(async filename => {
        const file = zip.files[filename]
        if (!file.dir) {
          const fileData = await file.async('blob')
          const cacheFilename = '/kujata-data/' + filename.replace(/\\/g, '/')
          if (filename.endsWith('eye2.png')) {
            console.log('CACHE: adding: ', cacheFilename)
          }
          cache.put(cacheFilename, new Response(fileData))
        }
      })

      await Promise.all(filePromises)
      console.log('CACHE: service worker - cache population: END')
      self.skipWaiting()
    })
  )
})
// Service worker activation event
self.addEventListener('activate', event => {
  console.log('CACHE: service worker activate started')

  // Claim control of all open clients/pages immediately
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName) // Clean up old caches
            }
          })
        )
      })
      .then(() => {
        // Claim the clients (pages) so that they are controlled immediately after activation
        console.log('CACHE: service worker activated - claiming')
        return self.clients.claim()
      })
  )
})

self.addEventListener('fetch', event => {
  const urlSplit = event.request.url.split('/kujata-data')

  // if (urlSplit.length > 0) {
  if (event.request.url.includes('/kujata-data')) {
    // console.log(
    //   'CACHE: fetch req:',
    //   event.request.url,
    //   urlSplit.length > 0 ? '/kujata-data' + urlSplit[1] : ''
    // )
    const cacheName = '/kujata-data' + urlSplit[1]
    // if (event.request.url.endsWith('eye2.png')) {
    //   caches.match(cacheName).then(response => {
    //     console.log('CACHE: fetch 004', cacheName, response)
    //   })
    // }
    event.respondWith(
      caches.match(cacheName).then(response => {
        return response || fetch(event.request)
      })
    )
  }
})

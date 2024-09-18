import { setLoadingProgress } from '../loading/loading-module.js'
import { KUJATA_BASE } from './kernel-fetch-data.js'

const clearCache = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
    }
  }
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName)
    }
  }

  window.location.reload()
}
window.clearCache = clearCache

// Note: This approach seems to work fine, but when the browser is set to ignore caches, it sends all of the queries to the server :(
const loadZippedAssets = async () => {
  const CACHE_NAME = 'zipped-assets-cache'
  const cache = await caches.open(CACHE_NAME)

  console.log('loadZippedAssets: START')
  const zipResponse = await fetch(`${KUJATA_BASE}/cache.zip`)
  const zipBlob = await zipResponse.blob()
  const zip = await window.JSZip.loadAsync(zipBlob)

  console.log(
    'loadZippedAssets: preparing cache',
    Object.keys(zip.files).length
  )

  const cachedItemOne = await cache.match(
    `${KUJATA_BASE}/${Object.keys(zip.files)[0].replace(/\\/g, '/')}`
  )
  if (cachedItemOne) {
    console.log(
      'loadZippedAssets: END cache already populated',
      Object.keys(zip.files).length
    )
    return zip
  }
  const total = Object.keys(zip.files).length
  let complete = 0

  const filePromises = Object.keys(zip.files).map(async filePath => {
    const file = zip.files[filePath]
    if (!file.dir) {
      const normalizedPath = filePath.replace(/\\/g, '/')
      const requestUrl = `${KUJATA_BASE}/${normalizedPath}`
      const fileBlob = await file.async('blob')
      await cache.put(requestUrl, new Response(fileBlob))

      complete++
      // console.log('progress', complete, 'of', total, '->', complete / total)
      setLoadingProgress(Math.min(89, complete / total)) // Takes a while to display the progress
    }
  })
  await Promise.all(filePromises)
  console.log('loadZippedAssets: END', Object.keys(zip.files).length)
  return zip
}
export { clearCache, loadZippedAssets }

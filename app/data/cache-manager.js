import {
  setLoadingText,
  setLoadingProgress,
  LOADING_TWEEN_GROUP
} from '../loading/loading-module.js'
import TWEEN from '../../assets/tween.esm.js'

const waitForServiceWorkerActivation = () => {
  return new Promise(resolve => {
    if (navigator.serviceWorker.controller) {
      console.log('CACHE: Service worker already has control of page')
      resolve()
    } else {
      setLoadingText('Downloading core assets - Only happens once...')
      setLoadingProgress(0.2)
      const from = { progress: 0 }
      const progressTween = new TWEEN.Tween(from, LOADING_TWEEN_GROUP)
        .to({ progress: 1 }, 15 * 1000)
        .onUpdate(() => {
          setLoadingProgress(from.progress)
        })
        .start()
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log(
          'CACHE: Service worker has taken control of page, waiting...'
        )

        setTimeout(() => {
          // This is a mess, but I can't make it work otherwise
          progressTween.stop()
          TWEEN.remove(progressTween)
          resolve()
        }, 5000)
      })
    }
  })
}

const initCacheManager = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/cache-worker.js',
        { scope: '/' }
      )
      console.log(
        'CACHE: Service Worker registered with scope:',
        registration.scope,
        registration,
        registration.installing,
        registration.active
      )

      await waitForServiceWorkerActivation(registration)

      console.log('CACHE: Service Worker READY')
    } catch (error) {
      console.error('CACHE: Service Worker registration failed:', err)
    }
  }
}

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
export { initCacheManager, clearCache }

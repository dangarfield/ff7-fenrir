import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import { setLoadingProgress } from '../loading/loading-module.js'
const KUJATA_BASE = window.location.host.includes('localhost')
  ? 'kujata-data'
  : 'https://kujata-data-dg.netlify.app'

const windowTextures = {}
const getWindowTextures = (window.getWindowTextures = () => {
  return windowTextures
})
const loadWindowTextures = async () => {
  return new Promise(async (resolve, reject) => {
    const manager = new THREE.LoadingManager()
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      const progress = itemsLoaded / itemsTotal
      setLoadingProgress(progress)
    }
    manager.onLoad = function () {
      console.log('loadWindowTextures Loading complete', windowTextures)
      resolve()
    }

    const windowBinRes = await fetch(
      `${KUJATA_BASE}/metadata/window-assets/window.bin.metadata.json`
    )
    const windowBin = await windowBinRes.json()
    const assetTypes = Object.keys(windowBin)

    for (let i = 0; i < assetTypes.length; i++) {
      const assetType = assetTypes[i]
      windowTextures[assetType] = {}
      for (let j = 0; j < windowBin[assetType].length; j++) {
        const asset = windowBin[assetType][j]

        windowTextures[assetType][asset.description] = asset
        windowTextures[assetType][
          asset.description
        ].texture = new THREE.TextureLoader(manager).load(
          `${KUJATA_BASE}/metadata/window-assets/${assetType}/${asset.description}.png`
        )
        windowTextures[assetType][
          asset.description
        ].anisotropy = window.anim.renderer.capabilities.getMaxAnisotropy()
      }
    }
  })
}
const loadKernelData = async () => {
  const kernelBinRes = await fetch(`${KUJATA_BASE}/data/kernel/kernel.bin.json`)
  const kernelBin = await kernelBinRes.json()
  const allItemData = []
  allItemData.push.apply(allItemData, kernelBin.itemData)
  allItemData.push.apply(allItemData, kernelBin.weaponData)
  allItemData.push.apply(allItemData, kernelBin.armorData)
  allItemData.push.apply(allItemData, kernelBin.accessoryData)
  kernelBin.allItemData = allItemData
  window.data.kernel = kernelBin
}

export { KUJATA_BASE, loadWindowTextures, getWindowTextures, loadKernelData }

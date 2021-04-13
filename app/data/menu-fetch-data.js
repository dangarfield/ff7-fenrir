import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import { setLoadingProgress } from '../loading/loading-module.js'
import { KUJATA_BASE } from '../data/kernel-fetch-data.js'

const menuTextures = {}
const getMenuTextures = (window.getMenuTextures = () => {
  return menuTextures
})
const loadMenuTextures = async () => {
  return new Promise(async (resolve, reject) => {
    const manager = new THREE.LoadingManager()
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      const progress = itemsLoaded / itemsTotal
      setLoadingProgress(progress)
    }
    manager.onLoad = function () {
      console.log('loadMenuTextures Loading complete', menuTextures)
      resolve()
    }

    const menuRes = await fetch(
      `${KUJATA_BASE}/metadata/menu-assets/menu_us.metadata.json`
    )
    const menu = await menuRes.json()
    const assetTypes = Object.keys(menu)

    for (let i = 0; i < assetTypes.length; i++) {
      const assetType = assetTypes[i]
      menuTextures[assetType] = {}
      for (let j = 0; j < menu[assetType].length; j++) {
        const asset = menu[assetType][j]

        menuTextures[assetType][asset.description] = asset
        menuTextures[assetType][
          asset.description
        ].texture = new THREE.TextureLoader(manager).load(
          `${KUJATA_BASE}/metadata/menu-assets/${assetType}/${asset.description}.png`
        )
        menuTextures[assetType][asset.description].texture.magFilter =
          THREE.NearestFilter
        menuTextures[assetType][
          asset.description
        ].anisotropy = window.anim.renderer.capabilities.getMaxAnisotropy()
      }
    }
  })
}

export { loadMenuTextures, getMenuTextures }

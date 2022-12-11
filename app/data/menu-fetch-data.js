import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js' // 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import { setLoadingProgress } from '../loading/loading-module.js'
import { KUJATA_BASE } from '../data/kernel-fetch-data.js'

const menuTextures = {}
const getMenuTextures = (window.getMenuTextures = () => {
  return menuTextures
})
const loadMenuTextures = async () => {
  const menuRes = await fetch(
      `${KUJATA_BASE}/metadata/menu-assets/menu_us.metadata.json`
  )
  const menu = await menuRes.json()

  const creditsRes = await fetch(
      `${KUJATA_BASE}/metadata/credits-assets/credits-font.metadata.json`
  )
  const credits = await creditsRes.json()

  const discRes = await fetch(
      `${KUJATA_BASE}/metadata/disc-assets/disc.metadata.json`
  )
  const disc = await discRes.json()
  return new Promise((resolve, reject) => {
    const manager = new THREE.LoadingManager()
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      const progress = itemsLoaded / itemsTotal
      setLoadingProgress(progress)
    }
    manager.onLoad = function () {
      console.log('loadMenuTextures Loading complete', menuTextures)
      window.menuTextures = menuTextures
      resolve()
    }

    const textureGroups = [menu, credits, disc]
    const textureGroupNames = ['menu', 'credits', 'disc']
    for (let i = 0; i < textureGroups.length; i++) {
      const textureGroup = textureGroups[i]
      const textureGroupName = textureGroupNames[i]
      const assetTypes = Object.keys(textureGroup)
      for (let j = 0; j < assetTypes.length; j++) {
        const assetType = assetTypes[j]
        menuTextures[assetType] = {}
        for (let k = 0; k < textureGroup[assetType].length; k++) {
          const asset = textureGroup[assetType][k]
          menuTextures[assetType][asset.description] = asset
          menuTextures[assetType][asset.description].texture = new THREE.TextureLoader(manager).load(
            `${KUJATA_BASE}/metadata/${textureGroupName}-assets/${assetType}/${asset.description}.png`
          )
          menuTextures[assetType][asset.description].texture.magFilter = THREE.NearestFilter
          menuTextures[assetType][asset.description].anisotropy = window.anim.renderer.capabilities.getMaxAnisotropy()
        }
      }
    }
  })
}

export { loadMenuTextures, getMenuTextures }

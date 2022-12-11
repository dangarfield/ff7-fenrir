import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { setLoadingProgress } from '../loading/loading-module.js'
import { KUJATA_BASE } from './kernel-fetch-data.js'

const fieldTextures = {}
const getFieldTextures = (window.getFieldTextures = () => {
  return fieldTextures
})
const loadFieldTextures = async () => {
  const fieldRes = await fetch(
      `${KUJATA_BASE}/metadata/field-assets/flevel.metadata.json`
  )
  const field = await fieldRes.json()
  return new Promise((resolve, reject) => {
    const manager = new THREE.LoadingManager()
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      const progress = itemsLoaded / itemsTotal
      setLoadingProgress(progress)
    }
    manager.onLoad = function () {
      console.log('loadFieldTextures Loading complete', fieldTextures)
      window.fieldTextures = fieldTextures
      resolve()
    }

    const textureGroups = [field]
    const textureGroupNames = ['field']
    for (let i = 0; i < textureGroups.length; i++) {
      const textureGroup = textureGroups[i]
      const textureGroupName = textureGroupNames[i]
      const assetTypes = Object.keys(textureGroup)
      for (let j = 0; j < assetTypes.length; j++) {
        const assetType = assetTypes[j]
        fieldTextures[assetType] = {}
        for (let k = 0; k < textureGroup[assetType].length; k++) {
          const asset = textureGroup[assetType][k]
          fieldTextures[assetType][asset.description] = asset
          fieldTextures[assetType][asset.description].texture = new THREE.TextureLoader(manager).load(
            `${KUJATA_BASE}/metadata/${textureGroupName}-assets/${assetType}/${asset.description}.png`
          )
          fieldTextures[assetType][asset.description].texture.magFilter = THREE.NearestFilter
          fieldTextures[assetType][asset.description].anisotropy = window.anim.renderer.capabilities.getMaxAnisotropy()
        }
      }
    }
  })
}

export { loadFieldTextures, getFieldTextures }

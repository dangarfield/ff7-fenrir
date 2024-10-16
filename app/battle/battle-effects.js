import { position3DToOrtho } from './battle-3d.js'
import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { getBattleTextures } from '../data/battle-fetch-data.js'
import { tweenInterval, tweenSleep } from './battle-scene.js'
import { framesToTime } from './battle-actions.js'

const displayEffectAnimation = async (
  pos,
  type,
  effect,
  scaleOverTime,
  opacity
) => {
  // This assumes that these are all fixed size relative to the viewer
  // Is this right for dust?!
  //   console.log('EFFECT displayEffectAnimation', pos, type, effect)
  // TODO - Putting it in the ortho scene means it displays 'over' other characters, is that right? Need to test

  const posOrtho = position3DToOrtho(pos)
  // const posOrtho = pos

  const battleTextures = getBattleTextures()
  const asset = battleTextures[type].assets[effect]
  const texture = battleTextures[type].texture.clone()
  const frameHeight = battleTextures[type].metadata.frameHeight
  const frameWidth = battleTextures[type].metadata.frameWidth
  //   console.log('EFFECT texture', texture)
  texture.repeat.set(frameWidth, frameHeight)

  const effectIndex = asset.index // Example: 3rd row (0-based index)
  let currentColumn = 0

  texture.offset.y = 1 - (effectIndex + 1) * frameHeight // Set the row
  texture.offset.x = currentColumn * frameWidth // Move to the next column

  //   console.log('EFFECT posOrtho', posOrtho, battleTextures)

  const geo = new THREE.PlaneGeometry(16, 16)
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  })
  if (opacity != null) {
    mat.opacity = opacity
  }
  const mesh = new THREE.Mesh(geo, mat)

  mesh.position.x = posOrtho.x
  mesh.position.y = posOrtho.y
  mesh.position.z = 3 // ?
  mesh.userData.position = pos
  mesh.userData.updateOrthoPosition = () => {
    // console.log('EFFECT updated ortho pos')
    const posOrthoUpdated = position3DToOrtho(pos)
    mesh.position.x = posOrthoUpdated.x
    mesh.position.y = posOrthoUpdated.y
    // mesh.position.z = 90 // ?
  }
  window.currentBattle.ui.effectsGroup.add(mesh)

  // Animate each frame
  const time = framesToTime(1)
  await tweenInterval(time, asset.count, () => {
    // console.log('EFFECT next frame')
    currentColumn++
    texture.offset.x = currentColumn * frameWidth
    if (scaleOverTime != null) {
      const scale = 1 + currentColumn / (asset.count / (scaleOverTime - 1))
      mesh.scale.set(scale, scale, 1)
    }
  })
  //   console.log('EFFECT end')

  // Clear up and dispose
  mesh.geometry.dispose()
  mesh.material.dispose()
  if (mesh.material.map) mesh.material.map.dispose()
  window.currentBattle.ui.effectsGroup.remove(mesh)
  //   console.log('EFFECT disposed')
}

export { displayEffectAnimation }

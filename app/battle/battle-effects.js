import { position3DToOrtho } from './battle-3d.js'
import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { getBattleTextures } from '../data/battle-fetch-data.js'
import { tweenInterval, tweenSleep } from './battle-scene.js'
import { framesToTime } from './battle-actions.js'
import {
  addImageToGroup,
  addTextToDialog,
  ALIGN,
  LETTER_COLORS,
  LETTER_TYPES
} from '../menu/menu-box-helper.js'
import { disposeAll } from '../helpers/helpers.js'
import { DMG_TYPE } from './battle-damage-calc.js'

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

  disposeAll(mesh)
}
const displayDamageAnimation = async (pos, damage) => {
  const posOrtho = position3DToOrtho(pos)
  console.log('DAMAGE', pos, damage, posOrtho)

  let group

  if (
    [DMG_TYPE.MISS, DMG_TYPE.DEATH, DMG_TYPE.RECOVERY].includes(damage.type)
  ) {
    group = new THREE.Group()
    window.currentBattle.ui.effectsGroup.add(group)
    const group2 = addImageToGroup(
      group,
      'battle-damage',
      damage.type.toLowerCase(),
      0,
      4,
      0.5,
      null,
      ALIGN.CENTRE
    )
  } else {
    // TODO - is normal, restorative, critical (flash), MP
    group = addTextToDialog(
      window.currentBattle.ui.effectsGroup,
      '' + damage.amount,
      'damage',
      LETTER_TYPES.BattleTextDamage,
      damage.isRestorative ? LETTER_COLORS.Green : LETTER_COLORS.White,
      0,
      window.config.sizing.height,
      0.5,
      null,
      ALIGN.CENTRE,
      true
    )
  }

  group.userData.isText = true
  group.position.z = 100 - 3 // ?
  group.userData.yOffset = 0
  group.userData.updateOrthoPosition = () => {
    const posOrthoUpdated = position3DToOrtho(pos)
    group.position.x = posOrthoUpdated.x
    group.position.y = posOrthoUpdated.y + group.userData.yOffset
  }
  window.ggg = group

  const t = new TWEEN.Tween(group.userData, BATTLE_TWEEN_GROUP)
    .to({ yOffset: [8, 0] }, 1250) // TODO - Heights, timings, easing
    // .easing(TWEEN.Easing.Quintic.Out)
    .onComplete(function () {
      BATTLE_TWEEN_GROUP.remove(t)
      disposeAll(group)
    })
    .start()
}

export { displayEffectAnimation, displayDamageAnimation }

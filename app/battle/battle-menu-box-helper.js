import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { addImageToDialog, ALIGN, WINDOW_COLORS_SUMMARY, addTextToDialog, LETTER_TYPES, LETTER_COLORS } from '../menu/menu-box-helper.js'
import { addLimitBarTween, stopLimitBarTween } from '../menu/menu-limit-tween-helper.js'
import TWEEN from '../../assets/tween.esm.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

const addShape = (
  dialogBox,
  colors,
  id,
  x,
  y,
  w,
  h,
  blending
) => {
  const bgGeo = new THREE.PlaneBufferGeometry(w, h)
  bgGeo.colorsNeedUpdate = true
  bgGeo.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  )
  for (let i = 0; i < colors.length; i++) {
    const color = new THREE.Color(colors[i])
    bgGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
  }
  // console.log('window.config', window.config)
  const bg = new THREE.Mesh(
    bgGeo,
    new THREE.MeshBasicMaterial({
      transparent: true,
      vertexColors: THREE.VertexColors
    })
  )
  if (blending) {
    bg.material.blending = blending
  }

  bg.position.set(x + (w / 2), window.config.sizing.height - y - (h / 2), dialogBox.userData.z)
  bg.userData = { id }

  dialogBox.add(bg)
  return bg
}

const addBattleBarrier = (dialog, x, y, id) => {
  addImageToDialog(dialog, 'bars', 'barrier', `${id}`, x, y, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM)

  const w = 32

  const colorP1 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_1 // Colours not correct
  const colorP2 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_2
  const p1 = addShape(dialog, colorP1, `${id}-p1`, x + 3, y - 10, w, 1.5, THREE.AdditiveBlending)
  const p2 = addShape(dialog, colorP2, `${id}-p2`, x + 3, y - 8.5, w, 1.5, THREE.AdditiveBlending)
  let pValue = -1

  const colorM1 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_1 // Colours not correct
  const colorM2 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_2
  const m1 = addShape(dialog, colorM1, `${id}-m1`, x + 3, y - 5, w, 1.5, THREE.AdditiveBlending)
  const m2 = addShape(dialog, colorM2, `${id}-m2`, x + 3, y - 3.5, w, 1.5, THREE.AdditiveBlending)
  let mValue = -1

  return {
    setPBarrier: (value) => {
      if (pValue !== value) {
        pValue = value
        const percent = pValue / 0xFF
        p1.position.x = x + 3 + (w / 2 * percent)
        p1.scale.set(percent, 1, 1)
        p2.position.x = x + 3 + (w / 2 * percent)
        p2.scale.set(percent, 1, 1)
      }
    },
    setMBarrier: (value) => {
      if (mValue !== value) {
        mValue = value
        const percent = mValue / 0xFF
        m1.position.x = x + 3 + (w / 2 * percent)
        m1.scale.set(percent, 1, 1)
        m2.position.x = x + 3 + (w / 2 * percent)
        m2.scale.set(percent, 1, 1)
      }
    }
  }
}

const addBattleLimit = (dialog, x, y, id) => {
  addImageToDialog(dialog, 'bars', 'battle', `${id}`, x, y, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM)

  const w = 32

  // Set default colours
  let color1 = WINDOW_COLORS_SUMMARY.LIMIT_1 // Colours not correct
  let color2 = WINDOW_COLORS_SUMMARY.LIMIT_2
  const l1 = addShape(dialog, color1, `${id}-l1`, x + 3, y - 7.5, w, 3, THREE.AdditiveBlending)
  const l2 = addShape(dialog, color2, `${id}-l2`, x + 3, y - 4.5, w, 3, THREE.AdditiveBlending)
  let lValue = -1
  const refreshLimitColours = () => {
    const l1ColorAttr = l1.geometry.getAttribute('color')
    for (let i = 0; i < color1.length; i++) {
      const color = new THREE.Color(color1[i])
      l1ColorAttr.setXYZ(i, color.r, color.g, color.b)
    }
    l1ColorAttr.needsUpdate = true

    const l2ColorAttr = l2.geometry.getAttribute('color')
    for (let i = 0; i < color2.length; i++) {
      const color = new THREE.Color(color2[i])
      l2ColorAttr.setXYZ(i, color.r, color.g, color.b)
    }
    l2ColorAttr.needsUpdate = true
  }
  return {
    setStatus: (value) => {
      if (value === 'Sadness') {
        color1 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_1
        color2 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_2
      } else if (value === 'Fury') {
        color1 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_1
        color2 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_2
      } else {
        color1 = WINDOW_COLORS_SUMMARY.LIMIT_1
        color2 = WINDOW_COLORS_SUMMARY.LIMIT_2
      }
      console.log('battleUI', value, color1, color2)
      refreshLimitColours()
    },
    setLimit: (value) => {
      if (lValue !== value) {
        if (lValue === 0xFF) {
          stopLimitBarTween(l1)
          stopLimitBarTween(l2)
          refreshLimitColours()
        }
        lValue = value
        const percent = lValue / 0xFF
        l1.position.x = x + 3 + (w / 2 * percent)
        l1.scale.set(percent, 1, 1)
        l2.position.x = x + 3 + (w / 2 * percent)
        l2.scale.set(percent, 1, 1)
        if (lValue === 0xFF) {
          addLimitBarTween(l1, BATTLE_TWEEN_GROUP)
          addLimitBarTween(l2, BATTLE_TWEEN_GROUP)
        }
      }
    }
    // Tween when it gets to 255
  }
}
const addPlayerName = (group, name, id, x, y) => {
  const playerNameWhite = addTextToDialog(group,
    name,
    id,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    x,
    y,
    0.5, null, null, true
  )
  const playerNameGrey = addTextToDialog(group,
    name,
    id,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Gray,
    x,
    y,
    0.5, null, null, true
  )
  playerNameGrey.visible = false
  let playerNameTween = null
  return {
    setActive: (isActive) => {
      if (!isActive) {
        playerNameGrey.visible = false
        if (playerNameTween) {
          playerNameTween.stop()
          BATTLE_TWEEN_GROUP.remove(playerNameTween)
          playerNameTween = null
        }
      } else {
        const from = { v: 0 }
        const to = { v: 1 }
        let visible = false
        playerNameTween = new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
          .to(to, 500) // Is time ok?
          .repeat(Infinity)
          .onUpdate(() => {
            let shouldChange = false
            if (from.v < 0.5) {
              if (visible !== true) {
                visible = true
                shouldChange = true
              }
            } else {
              if (visible !== false) {
                visible = false
                shouldChange = true
              }
            }
            if (shouldChange) playerNameGrey.visible = visible
          })
          .onStop(() => { playerNameGrey.visible = false })
          .onComplete(() => { playerNameGrey.visible = false })
          .start()
      }
    }
  }
}
export {
  addPlayerName,
  addBattleBarrier,
  addBattleLimit
}

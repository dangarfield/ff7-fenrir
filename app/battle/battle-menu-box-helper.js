import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { addImageToDialog, ALIGN, WINDOW_COLORS_SUMMARY } from '../menu/menu-box-helper.js'
// import TWEEN from '../../assets/tween.esm.js'
import { orthoScene as scene } from './battle-scene.js'

const addBarrierShape = (
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
  addImageToDialog(dialog, 'bars', 'barrier', `${id}-barrier`, x, y, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM)

  const w = 32

  const colorP1 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_1 // Colours not correct
  const colorP2 = WINDOW_COLORS_SUMMARY.LIMIT_FURY_2
  const p1 = addBarrierShape(dialog, colorP1, `${id}-barrier-p1`, x + 3, y - 10, w, 1.5, THREE.AdditiveBlending)
  const p2 = addBarrierShape(dialog, colorP2, `${id}-barrier-p2`, x + 3, y - 8.5, w, 1.5, THREE.AdditiveBlending)
  let p1Value = 0xFF

  const colorM1 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_1 // Colours not correct
  const colorM2 = WINDOW_COLORS_SUMMARY.LIMIT_SADNESS_2
  const m1 = addBarrierShape(dialog, colorM1, `${id}-barrier-m1`, x + 3, y - 5, w, 1.5, THREE.AdditiveBlending)
  const m2 = addBarrierShape(dialog, colorM2, `${id}-barrier-m2`, x + 3, y - 3.5, w, 1.5, THREE.AdditiveBlending)
  let m1Value = 0xFF

  return {
    setPBarrier: (value) => {
      if (p1Value !== value) {
        p1Value = value
        const percent = p1Value / 0xFF
        p1.position.x = x + 3 + (w / 2 * percent)
        p1.scale.set(percent, 1, 1)
        p2.position.x = x + 3 + (w / 2 * percent)
        p2.scale.set(percent, 1, 1)
      }
    },
    setMBarrier: (value) => {
      if (m1Value !== value) {
        m1Value = value
        const percent = m1Value / 0xFF
        m1.position.x = x + 3 + (w / 2 * percent)
        m1.scale.set(percent, 1, 1)
        m2.position.x = x + 3 + (w / 2 * percent)
        m2.scale.set(percent, 1, 1)
      }
    }
  }
}
export {
  addBattleBarrier
}

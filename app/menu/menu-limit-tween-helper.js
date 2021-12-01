import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'
import { GAUGE_COLORS } from './menu-box-helper.js'

const LIMIT_TWEEN_DATA = {
  limitBarTweens: [],
  limitBarTween: null,
  limitTextTweens: [],
  limitTextTween: null
}
window.LIMIT_TWEEN_DATA = LIMIT_TWEEN_DATA
const beginLimitBarTween = () => {
  // Temp limit tween color testing - tween
  // const to = { r: [], g: [], b: [] }
  // const colorsToUse = [GAUGE_COLORS.LIMIT_NORMAL_2, GAUGE_COLORS.LIMIT_NORMAL_3, GAUGE_COLORS.LIMIT_NORMAL_4, GAUGE_COLORS.LIMIT_NORMAL_1]
  // for (let i = 0; i < colorsToUse.length; i++) {
  //   const colorToUse = new THREE.Color(colorsToUse[i])
  //   to.r.push(colorToUse.r)
  //   to.g.push(colorToUse.g)
  //   to.b.push(colorToUse.b)
  // }
  // const from = {
  //   r: to.r[colorsToUse.length - 1],
  //   g: to.g[colorsToUse.length - 1],
  //   b: to.b[colorsToUse.length - 1]
  // }
  // console.log('limit tween colors: ', from, to)

  // const l1GeoColorAtt = l1.geometry.getAttribute('color')
  // l1GeoColorAtt.needsUpdate = true
  // const l2GeoColorAtt = l2.geometry.getAttribute('color')
  // l2GeoColorAtt.needsUpdate = true
  // new TWEEN.Tween(from, MENU_TWEEN_GROUP)
  //   .to(to, 1000)
  //   .repeat(Infinity)
  //   // .easing(TWEEN.Easing.Quadratic.Out)
  //   .onUpdate(function () {
  //     console.log('limit color tween: UPDATE', from)
  //     // fade.material.opacity = from.opacity
  //     l1GeoColorAtt.setXYZ(2, from.r, from.b, from.g)
  //     l1GeoColorAtt.setXYZ(3, from.r, from.b, from.g)
  //     l1GeoColorAtt.needsUpdate = true
  //     l2GeoColorAtt.setXYZ(2, from.r, from.b, from.g)
  //     l2GeoColorAtt.setXYZ(3, from.r, from.b, from.g)
  //     l2GeoColorAtt.needsUpdate = true
  //   })
  //   .onComplete(function () {
  //     console.log('limit color tween: END', from)
  //     // resolve()
  //   })
  //   .start()

  // Temp limit tween color testing 2 - fixed steps
  const to = {v: 1}
  const from = {v: 0}

  const c1 = new THREE.Color(GAUGE_COLORS.LIMIT_NORMAL_1)
  const c2 = new THREE.Color(GAUGE_COLORS.LIMIT_NORMAL_2)
  const c3 = new THREE.Color(GAUGE_COLORS.LIMIT_NORMAL_3)
  const c4 = new THREE.Color(GAUGE_COLORS.LIMIT_NORMAL_4)
  let colorToUse

  LIMIT_TWEEN_DATA.limitBarTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 750)
    .repeat(Infinity)
    // .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      // console.log('limit color tween: UPDATE', from)

      let shouldChange = false
      if (from.v < 0.25) {
        if (colorToUse !== c1) {
          colorToUse = c1
          shouldChange = true
        }
      } else if (from.v < 0.5) {
        if (colorToUse !== c2) {
          colorToUse = c2
          shouldChange = true
        }
      } else if (from.v < 0.75) {
        if (colorToUse !== c3) {
          colorToUse = c3
          shouldChange = true
        }
      } else {
        if (colorToUse !== c4) {
          colorToUse = c4
          shouldChange = true
        }
      }

      // fade.material.opacity = from.opacity
      if (shouldChange) {
        for (let i = 0; i < LIMIT_TWEEN_DATA.limitBarTweens.length; i++) {
          const mesh = LIMIT_TWEEN_DATA.limitBarTweens[i]
          const geoColorAtt = mesh.geometry.getAttribute('color')
          geoColorAtt.setXYZ(2, colorToUse.r, colorToUse.b, colorToUse.g)
          geoColorAtt.setXYZ(3, colorToUse.r, colorToUse.b, colorToUse.g)
          geoColorAtt.needsUpdate = true
        }
      }
    })
    .onStop(function () {
      console.log('limit bar tween: STOP')
    })
    .onRepeat(function () {
      console.log('limit bar tween: REPEAT', LIMIT_TWEEN_DATA.limitBarTweens.length)
    })
    .onComplete(function () {
      console.log('limit bar tween: END', from)
      // resolve()
    })
    .start()
}

const addLimitBarTween = (mesh) => {
  if (LIMIT_TWEEN_DATA.limitBarTweens.length === 0) {
    LIMIT_TWEEN_DATA.limitBarTweens.push(mesh)
    beginLimitBarTween()
  } else {
    LIMIT_TWEEN_DATA.limitBarTweens.push(mesh)
  }
}

const stopAllLimitBarTweens = () => {
  LIMIT_TWEEN_DATA.limitBarTween.stop()
  LIMIT_TWEEN_DATA.limitBarTweens = []
}

const addLimitTextTween = () => {

}
const stopAllLimitTextTweens = () => {

}
export {
  addLimitBarTween,
  stopAllLimitBarTweens,
  addLimitTextTween,
  stopAllLimitTextTweens
}

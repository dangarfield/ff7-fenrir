import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { FIELD_TWEEN_GROUP } from './field-scene.js'
import { getModelByEntityId } from './field-models.js'
import { sleep } from '../helpers/helpers.js'

const kawaiOpShine = (entityId, op) => {
  console.log('kawaiOpShine', entityId, op)
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpShine model', model)

  if (model === undefined) {
    return
  }

  if (op.vars[0] === 0) {
    stopShine(model) // Assumed initiate
  } else if (op.vars[0] === 1) {
    animateShine(model)
  } else if (op.vars[0] === 2) {
    stopShine(model) // Assumed stop
  }
}

const animateShine = async (model) => {
  const currentFieldName = window.currentField.name
  console.log('animateShine', model)
  model.scene.userData.shine = true
  while (window.currentField.name === currentFieldName && model.scene.visible && model.scene.userData.shine) {
    // Loop while current field is current field and while model is visible
    console.log('animateShine LOOP Begin One')
    await animateShineOne(model)
    await sleep(2000)
    console.log('animateShine LOOP End One')
  }
  console.log('animateShine LOOP END All')
}
const stopShine = (model) => {
  if (model.scene.userData.shineTween) {
    model.scene.userData.shineTween.stop()
    model.scene.userData.shine = false
  }
}

window.stopShine = stopShine
const animateShineOne = async (model) => {
  const BOX_SHINE_NAME = 'box-shine'
  return new Promise((resolve, reject) => {
    const s = model.scene
    for (let i = 0; i < s.children.length; i++) {
      const child = s.children[i]
      if (child.name === BOX_SHINE_NAME) {
        // Don't animate if already being animated
        resolve()
        return
      }
    }
    const spotGroup = new THREE.Group()
    spotGroup.name = BOX_SHINE_NAME

    const spot = new THREE.SpotLight(0xffffff)
    spot.castShadow = false
    spot.visible = true
    spot.layers.set(1)
    spot.decay = 1 // This can probably be done much better
    spot.distance = 75
    spotGroup.add(spot)

    // const spotHelper = new THREE.SpotLightHelper(spot)
    // spotGroup.add(spotHelper)

    s.add(spotGroup)

    s.traverse(el => {
      if (el.type === 'Mesh' && el.geometry.getAttribute('color') !== undefined) {
        // Set all meshes (therefore materials that react to light to a temporary non-0 channel)
        // In the game, this only affects the directly colored materials and not any image based materials
        el.layers.set(1)
      }
    })
    spot.target = s

    const r = 1024 * 50
    const mid = THREE.MathUtils.degToRad(360)
    const rad90 = THREE.MathUtils.degToRad(90)
    const from = {rad: 0}
    const to = {rad: THREE.MathUtils.degToRad(720)}
    s.userData.shineTween = new TWEEN.Tween(from, FIELD_TWEEN_GROUP)
      .to(to, 750)
      .onUpdate(function () {
        const x = r * Math.cos(from.rad - rad90)
        const y = r * Math.sin(from.rad - rad90)
        const inten = Math.min(1, (mid + Math.abs(from.rad - mid) * -1) * 0.35) * 2
        // console.log('animateShine inten', inten, from.rad)
        if (spot && spot.parent !== null) {
          spot.position.set(x, 0, y)
          spot.intensity = inten
        } else {
          console.log('animateShine stop')
          s.userData.shineTween.stop()
        }
        // spotHelper.update()
      })
      .onStop(function () {
        console.log('animateShine onStopped')
        if (Math.abs(spot.rotation.y) >= 2 * Math.PI) {
          spot.rotation.y = spot.rotation.y % (2 * Math.PI)
        }
        s.traverse(el => {
          if (el.type === 'Mesh') {
            el.layers.set(0)
          }
        })
        for (let i = 0; i < s.children.length; i++) {
          const child = s.children[i]
          if (child.name === BOX_SHINE_NAME) {
            s.remove(child)
          }
        }
        resolve()
      })
      .onComplete(function () {
        console.log('animateShine onComplete', spot)
        // console.log('animateShine tween: END')
        if (Math.abs(spot.rotation.y) >= 2 * Math.PI) {
          spot.rotation.y = spot.rotation.y % (2 * Math.PI)
        }
        s.traverse(el => {
          if (el.type === 'Mesh') {
            el.layers.set(0)
          }
        })
        for (let i = 0; i < s.children.length; i++) {
          const child = s.children[i]
          if (child.name === BOX_SHINE_NAME) {
            s.remove(child)
          }
        }
        resolve()
      })
      .start()
  })
}

export {
  kawaiOpShine
}
window.test = async () => {
  console.log('test SHINE start')
  await animateShine(window.currentField.models[8])
  console.log('test SHINE end')
}

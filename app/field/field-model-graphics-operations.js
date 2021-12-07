import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { FIELD_TWEEN_GROUP } from './field-scene.js'
import { getModelByEntityId } from './field-models.js'
import { sleep } from '../helpers/helpers.js'

const kawaiOpShine = async (entityId, op) => {
  console.log('kawaiOpShine', entityId, op)
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpShine model', model)

  if (model === undefined) {
    return
  }
  // I'm not entirely sure why, but 0,0 is called before 1, but when just adding either of them individually in
  // the game, it appears to make no dfference and just dispalys the shine as usual
  if (op.vars[0] === 0) {
    // stopShine(model) // Assumed initiate
  } else if (op.vars[0] === 1) {
    animateShine(model)
  } else if (op.vars[0] === 2) {
    stopShine(model) // Stop shine and make darker (PC)
  }
}

const animateShine = async (model) => {
  const currentFieldName = window.currentField.name
  console.log('animateShine', model)

  if (!model.scene.userData.shineSpotGroup) {
    addShineSpotLight(model)
  }
  if (!model.scene.userData.shine) {
    addShineAmbientLight(model)
  }

  model.scene.traverse(el => {
    if (el.type === 'Mesh') {
      el.layers.set(1)
    }
  })
  model.scene.userData.shine = true
  while (window.currentField.name === currentFieldName && model.scene.visible && model.scene.userData.shine) {
    // Loop while current field is current field and while model is visible
    console.log('animateShine LOOP Begin One')
    await animateShineOne(model, 200)
    await animateShineOne(model, 200, true)
    await animateShineOne(model, 350)
    await sleep(300)
    await animateShineOne(model, 200)
    await animateShineOne(model, 200, true)
    await animateShineOne(model, 350)
    await sleep(3500)
    console.log('animateShine LOOP End One')
  }
  console.log('animateShine LOOP END All')
}
const stopShine = (model) => {
  model.scene.traverse(el => {
    if (el.type === 'Mesh') {
      el.layers.set(0)
    }
  })
  if (model.scene.userData.shineTween) {
    model.scene.userData.shineTween.stop()
    delete model.scene.userData.shine
    delete model.scene.userData.shineTween
  }
  if (model.scene.userData.shineAmbientLight) {
    model.scene.userData.shineAmbientLight.parent.remove(model.scene.userData.shineAmbientLight)
    delete model.scene.userData.shineAmbientLight
  }
  if (model.scene.userData.shineSpotGroup) {
    model.scene.userData.shineSpotGroup.parent.remove(model.scene.userData.shineSpotGroup)
    delete model.scene.userData.shineSpotGroup
    delete model.scene.userData.shineSpot
  }
  if (model.scene.userData.shineSpotHelper) {
    model.scene.userData.shineSpotHelper.parent.remove(model.scene.userData.shineSpotHelper)
    delete model.scene.userData.shineSpotHelper
  }
}

const addShineSpotLight = (model) => {
  const shineSpotGroup = new THREE.Group()
  shineSpotGroup.name = 'shineSpotGroup'

  const shineSpot = new THREE.SpotLight(0xffffff)
  shineSpot.castShadow = false
  shineSpot.intensity = 0
  shineSpot.layers.set(1)
  shineSpot.decay = 1 // This can probably be done much better
  shineSpot.distance = 75
  shineSpot.target = model.scene
  shineSpotGroup.add(shineSpot)

  //   const shineSpotHelper = new THREE.SpotLightHelper(shineSpot)
  //   shineSpotGroup.add(shineSpotHelper)
  //   model.scene.userData.spotHelper = shineSpotHelper

  model.scene.add(shineSpotGroup)
  model.scene.userData.shineSpot = shineSpot
  model.scene.userData.shineSpotGroup = shineSpotGroup
}
const addShineAmbientLight = (model) => {
  const shineAmbientLight = new THREE.AmbientLight(new THREE.Color(`rgb(255,255,255)`), 1)
  shineAmbientLight.layers.disable(0)
  shineAmbientLight.layers.enable(1)
  model.scene.add(shineAmbientLight)
  model.scene.userData.shineAmbientLight = shineAmbientLight
}
window.stopShine = stopShine

const animateShineOne = async (model, ms, lateral) => {
  const BOX_SHINE_NAME = 'box-shine'
  return new Promise((resolve, reject) => {
    const s = model.scene
    const spot = model.scene.userData.shineSpot
    spot.intensity = 0
    const r = 1024 * 50
    const mid = THREE.MathUtils.degToRad(180)
    const rad90 = THREE.MathUtils.degToRad(90)
    const from = {rad: 0}
    const to = {rad: THREE.MathUtils.degToRad(360)}
    s.userData.shineTween = new TWEEN.Tween(from, FIELD_TWEEN_GROUP)
      .to(to, ms)
      .onUpdate(function () {
        // TODO: This is just an initial 2d loop around a point, in reality, the tween points should be figured out
        const x = r * Math.cos(from.rad - rad90)
        const y = r * Math.sin(from.rad - rad90)
        const inten = Math.min(1, (mid + Math.abs(from.rad - mid) * -1)) * 2
        // console.log('animateShine inten', inten, from.rad)
        if (spot && spot.parent !== null) {
          if (lateral) {
            spot.position.set(x, y, 0)
          } else {
            spot.position.set(-x, 0, y)
          }
          spot.intensity = inten
        } else {
          console.log('animateShine stop')
          s.userData.shineTween.stop()
        }
        if (model.scene.userData.shineSpotHelper) {
          model.scene.userData.spotHelper.update()
        }
      })
      .onStop(function () {
        console.log('animateShine onStopped')
        if (Math.abs(spot.rotation.y) >= 2 * Math.PI) {
          spot.rotation.y = spot.rotation.y % (2 * Math.PI)
        }
        spot.intensity = 0
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
        spot.intensity = 0
        for (let i = 0; i < s.children.length; i++) {
          const child = s.children[i]
          if (child.name === BOX_SHINE_NAME) {
            child.visible = false
            // s.remove(child)
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

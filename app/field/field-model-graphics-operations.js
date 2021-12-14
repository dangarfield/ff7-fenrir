import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { FIELD_TWEEN_GROUP } from './field-scene.js'
import { getModelByEntityId } from './field-models.js'
import { sleep } from '../helpers/helpers.js'
import { getFieldTextures } from '../data/field-fetch-data.js'

const kawaiOpBlink = async (entityId, op) => {
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpBlink model', model, op, model.scene.userData.blink)

  const blink = model.scene.userData.blink
  if (blink === undefined) {
    return
  }
  ensureBlinkMaterialsIsSet(model)

  console.log('kawaiOpBlink model blinkMaterials', model.scene.userData.blinkMaterials)

  // TODO - Consider other BLINK op code
  // TODO - Think about random blinking (sleep / tween etc)

  const eyes1 = op.vars[0]
  const eyes2 = op.vars[1]
  const mouth = op.vars[2]
  // const object = op.vars[3] // Ignore this

  // By default, eyes blink every X seconds + random
  if (eyes1 === 0 || eyes2 === 0) {
    // Set eyes open, Random blinking disabled
    blinkOpen(model.scene.userData.blinkMaterials)
    model.scene.userData.blink = false
  } else if (eyes1 === 1 && eyes2 === 1) {
    // blink instantly, Set eyes open, Random blinking enabled
    blinkOnce(model.scene.userData.blinkMaterials)
    model.scene.userData.blink = getRandomBlinkTime()
  } else if (eyes1 === 2 && eyes2 === 2) {
    // Eyes closed, Random blinking disabled
    blinkClose(model.scene.userData.blinkMaterials)
    model.scene.userData.blink = false
  } else if (eyes1 === 3 && eyes2 === 3) { // Only aeris
    // Random blinking disabled ?
    // TODO - Unsure
  } else if (eyes1 === 4 && eyes2 === 4) { // Only barret
    // Random blinking disabled ?
    // TODO - Unsure
  }

  if (mouth === 0) {
    // Default closed mouth
  } else if (mouth === 1) { // Only tifa
    // TODO - Unsure
  } else if (mouth === 2) { // Only cid
    // TODO - Unsure
  }
}
const enableBlink = async (entityId) => {
  console.log('BLINK enableBlink', entityId)
  const model = getModelByEntityId(entityId)
  ensureBlinkMaterialsIsSet(model)
  model.scene.userData.blink = getRandomBlinkTime()
}
const disableBlink = async (entityId) => {
  console.log('BLINK disableBlink', entityId)
  const model = getModelByEntityId(entityId)
  ensureBlinkMaterialsIsSet(model)
  model.scene.userData.blink = false
}
const ensureBlinkMaterialsIsSet = (model) => {
  if (!model.scene.userData.blinkMaterials) {
    const blinkMaterials = []
    model.scene.traverse(el => {
      if (el.isMesh && el.material && el.material.userData && el.material.userData.blink) {
        blinkMaterials.push(el.material)
      }
    })
    model.scene.userData.blinkMaterials = blinkMaterials
    // console.log('blink model SET blinkMaterials')
  }
}
const blinkOpen = (materials) => {
//   console.log('blink blinkOpen', materials)
  materials.forEach(m => {
    // console.log('blink blinkOpen', m, m.map.uuid, m.userData.blink.open.uuid)
    m.map = m.userData.blink.open
    m.needsUpdate = true
  })
}
const blinkClose = (materials) => {
//   console.log('blink blinkClose', materials)
  materials.forEach(m => {
    // console.log('blink blinkClose', m, m.map.uuid, m.userData.blink.closed.uuid)
    m.map = m.userData.blink.closed
    m.needsUpdate = true
  })
}
const blinkOnce = (materials) => {
  blinkClose(materials)
  setTimeout(function () {
    blinkOpen(materials)
  }, 40)
}
const getRandomBlinkTime = () => {
  const min = 2
  const max = 4
  return ~~(Math.random() * (max - min + 1)) + min // In the game it looks like 2.5 seconds
}

const activateRandomBlinkForFieldCharacters = () => {
//   console.log('activateRandomBlinkForFieldCharacters')
  for (let i = 0; i < window.currentField.models.length; i++) {
    const model = window.currentField.models[i]
    // if (model.scene.visible) {
    if (model.scene.userData.blink === 0) {
    //   console.log('activateRandomBlinkForFieldCharacters blink char', model.userData.name, model.scene.userData.blink)
      ensureBlinkMaterialsIsSet(model)
      blinkOnce(model.scene.userData.blinkMaterials)
      model.scene.userData.blink = getRandomBlinkTime()
    } else if (model.scene.userData.blink > 0) {
    //   console.log('activateRandomBlinkForFieldCharacters blink COUNTDOWN', model.userData.name, model.scene.userData.blink)
      model.scene.userData.blink--
    }
    // }
  }
}
const kawaiOpTrnsp = async (entityId, op) => {
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpTrnsp model', model, op)
  if (op.vars[0] === 1) {
    return
  }
  makeSemiTransparent(entityId)
}
const makeSemiTransparent = (entityId) => {
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpTrnsp makeSemiTransparent', entityId, model.scene)
  const opacity = 0.6
  model.scene.traverse(el => {
    if (el.isMesh) {
      el.material.transparent = true
      ensureOrigColorSet(el)
      const origColorAttr = el.geometry.userData.origColor
      const colorAttr = el.geometry.getAttribute('color')
      console.log('kawaiOpTrnsp makeSemiTransparent mesh', el.material, origColorAttr, colorAttr)
      if (colorAttr) {
        el.material.format = THREE.RGBAFormat
        for (let i = 0; i < colorAttr.count; i++) {
          console.log('kawaiOpTrnsp makeSemiTransparent meshv color op', i)
          const r = origColorAttr.getX(i)
          const g = origColorAttr.getY(i)
          const b = origColorAttr.getZ(i)
          //   const a = origColorAttr.getW(i)
          colorAttr.setXYZW(i, r, g, b, opacity)
        }
        colorAttr.needsUpdate = true
      } else {
        el.material.opacity = opacity
      }
      el.material.needsUpdate = true
    }
  })
}

const makeDarker = (entityId) => {
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpTrnsp makeDarker', entityId, model.scene)
  const darken = 0.5
  model.scene.traverse(el => {
    if (el.isMesh) {
      el.material.transparent = true
      ensureOrigColorSet(el)
      const origColorAttr = el.geometry.userData.origColor
      const colorAttr = el.geometry.getAttribute('color')
      console.log('kawaiOpTrnsp makeDarker mesh', el.material, colorAttr)
      // MeshStandardMaterial roughness 0.5 makes this look pretty bad, consider changing the roughness
      if (colorAttr) {
        for (let i = 0; i < colorAttr.count; i++) {
          const r = colorAttr.getX(i) * darken
          const g = colorAttr.getY(i) * darken
          const b = colorAttr.getZ(i) * darken
          const a = origColorAttr.getW(i)
          console.log('kawaiOpTrnsp makeDarker mesh color op', i, r, g, b, a)
          colorAttr.setXYZW(i, r, g, b, a)
        }
        colorAttr.needsUpdate = true
      } else {
        el.material.opacity = 1
      }
      el.material.needsUpdate = true
    }
  })
}

window.makeDarker = makeDarker

const ensureOrigColorSet = (mesh) => {
  if (!mesh.geometry.userData.origColor) {
    const orig = mesh.geometry.getAttribute('color')
    if (orig) {
      mesh.geometry.userData.origColor = orig.clone()
    }
  }
}

const kawaiOpAmbient = async (entityId, op) => {
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpAmbient', entityId, op, model)

  const r = op.vars[0]
  const g = op.vars[2]
  const b = op.vars[4]

  const rDarken = op.vars[1] === 255
  const gDarken = op.vars[3] === 255
  const bDarken = op.vars[5] === 255
  const flag = op.vars[6]

  const lightLayer = 2
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  console.log('kawaiOpAmbient lights', window.currentField.lights.pointLights)
  console.log('kawaiOpAmbient op', r, g, b, rDarken, gDarken, bDarken, flag)

  // If there are any zero values within aRGB eg [0,2,4] it's fine.
  // If there are any zero values within bRGB eg [1,3,5], it darkens the light each time, but bRGB is always 0,0,0 or 255,255,255 in op codes

  // TODO - I 'think' ambient lighting (global light) should be disabled here, or at least some lighting, not 100% sure
  // TODO - The roughness 0.5 looks horrible, I change it to 1 here, but probably need to re-look at all of those gltf import settings

  applyColorsToModelMeshes(model, lightLayer, rNorm, gNorm, bNorm, rDarken, gDarken, bDarken)
}
const kawaiOpSplash = async (entityId, op) => {
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpSplash', entityId, op, model)
  if (model === undefined) {
    return
  }
  if (op.vars[0] === 1) {
    return
  }
  // 0,0,     - Activate flag
  // 162,255, - ? overlay colors r
  // 32,0,    - ? overlay colors g
  // 32,0,    - ? overlay colors b
  // 64,0,    - z depth
  // 1        - ?

  const depth = op.vars[8] / 4096
  model.scene.userData.splash = true
  model.scene.userData.splashDepth = depth

  // Set plane along y = whatever
  const splashPlane = new THREE.Plane(
    new THREE.Vector3(
      0, 0, 0
    ), depth
  )
  // splashPlane.translate(new THREE.Vector3(0, depth, 0))
  console.log('kawaiOpSplash depth', depth, depth * 4096)
  // const helper = new THREE.PlaneHelper(splashPlane, 1, 0xffff00)
  // window.currentField.fieldScene.add(helper)

  // Add the plane to userData
  model.scene.userData.splashPlane = splashPlane
  model.scene.userData.splashSprites = []
  model.scene.userData.splashMaterials = [
    new THREE.SpriteMaterial({ map: getFieldTextures().field.sibuki1.texture }),
    new THREE.SpriteMaterial({ map: getFieldTextures().field.sibuki2.texture }),
    new THREE.SpriteMaterial({ map: getFieldTextures().field.sibuki3.texture }),
    new THREE.SpriteMaterial({ map: getFieldTextures().field.sibuki4.texture })
  ]
  // TODO - Coloring required, but can't do that with a SpriteMaterial, need to improve another day
  // for (let i = 0; i < model.scene.userData.splashMaterials.length; i++) {
  //   const splashMaterial = model.scene.userData.splashMaterials[i]
  //   splashMaterial.color.r = 0
  //   splashMaterial.color.g = 32 / 255
  //   splashMaterial.color.b = 32 / 255
  //   splashMaterial.combine = THREE.MultiplyOperation
  //   console.log('KAWAI', 'splashMaterial.combine', splashMaterial.combine)
  // }
}
const kawaiOpSBObj = async (entityId, op) => {
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpSBObj', entityId, op, model)
  // This looks like (according to las4_4 that it can hide / show manipulate the meshes that a character has)
  // eg, 1,9,0 = las4_4 hide Cloud's sword
  // eg, 1,9,1 = las4_4 show Cloud's sword

  // op.vars[0]         - How many mesh enabled/disabled pairs are set
  // op.vars[1,3,5] etc - The bone identifier
  // op.vars[2,4,6] etc - 0,1, hide / show bone

  const count = op.vars[0]

  const instructions = []
  for (let i = 0; i < count; i++) {
    instructions.push({
      boneRef: op.vars[1 + (i * 2)],
      active: op.vars[2 + (i * 2)] === 1
    })
  }
  model.scene.traverse(el => {
    console.log('kawaiOpSBObj el', el, instructions)

    if (el.userData.childBoneRefs && el.userData.childBoneRefs.length > 0) {
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i]
        for (let j = 0; j < el.userData.childBoneRefs.length; j++) {
          const childBoneRef = el.userData.childBoneRefs[j]

          // Note: The current GLTF loader does not add extras from primitives into userData
          // So instead, I've added them in the parent and we look at the children nodes
          if (instruction.boneRef === childBoneRef) {
            el.children[j].visible = instruction.active
            console.log('kawaiOpSBObj', instruction, childBoneRef, instruction.active, el.children[j])
          }
        }
      }
    }
  })
}
const kawaiOpShine = async (entityId, op) => {
  console.log('kawaiOpShine', entityId, op)
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpShine model', model)

  if (model === undefined) {
    return
  }
  // I'm not entirely sure why, but 0,0 is called before 1, but when just adding either of them individually in
  // the game, it appears to make no dfference and just dispalys the shine as usual

  // TODO - In line with other kawai ops, vars[0] === 1 is probably activation, and 0 is setup / prep. Not sure about 2
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
      el.material.needsUpdate = true
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
// const addAmbientGlobalLight = (model) => {
//   const lightData = getLightData()
//   const ambientLight = new THREE.AmbientLight(new THREE.Color(
//     `rgb(${lightData.globalLight.r},${lightData.globalLight.g},${lightData.globalLight.b})`), 1)
//   ambientLight.layers.set(1)
//   model.scene.add(ambientLight)
//   model.scene.userData.ambientLight = ambientLight
// }
// const addAmbientPointLight = (model) => {
//   const lightData = getLightData()
//   window.currentField.ambientPointLights = []
//   for (let i = 1; i <= 3; i++) {
//     const light = lightData[`light${i}`]
//     const pointLight = new THREE.PointLight(
//       new THREE.Color(`rgb(${light.r},${light.g},${light.b})`),
//       1,
//       100
//     )
//     pointLight.position.set(
//       (window.currentField.centrePoint.x + light.x) / 4096,
//       (window.currentField.centrePoint.y + light.y) / 4096,
//       (window.currentField.centrePoint.z + light.z) / 4096
//     )
//     // pointLight.layers.enable(1)
//     pointLight.layers.set(1)
//     model.scene.parent.add(pointLight)
//     window.currentField.ambientPointLights.push(pointLight)
//     // window.currentField.fieldScene.add(new THREE.PointLightHelper(pointLight, 0.5))
//   }

// //   const lightData = getLightData()
// //   const ambientLight = new THREE.AmbientLight(new THREE.Color(
// //     `rgb(${lightData.globalLight.r},${lightData.globalLight.g},${lightData.globalLight.b})`), 1)
// //   ambientLight.layers.set(1)
// //   model.scene.add(ambientLight)
// }
window.stopShine = stopShine

const animateShineOne = async (model, ms, lateral) => {
  const BOX_SHINE_NAME = 'box-shine'
  return new Promise((resolve, reject) => {
    const s = model.scene
    const spot = model.scene.userData.shineSpot
    if (!spot) {
      resolve()
    } else {
      spot.intensity = 0
      const r = 1024 * 50
      const mid = THREE.MathUtils.degToRad(180)
      const rad90 = THREE.MathUtils.degToRad(90)
      const from = {rad: 0}
      const to = {rad: THREE.MathUtils.degToRad(360)}
      s.userData.shineTween = new TWEEN.Tween(from, FIELD_TWEEN_GROUP)
        .to(to, ms)
        .onUpdate(function () {
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
    }
  })
}

const kawaiOpLight = (entityId, op) => {
  const model = getModelByEntityId(entityId)
  console.log('kawaiOpLight model', model, op)

  // 0, 0,                - Activation
  // 0, 0, 80, 0, 80, 0,  - When this is set, it changes the color over time ???, ignore for now
  // 0, 0, 80, 0, 80, 0,  - Colors with darken (r, rDark, g, gDark, b, bDark)
  // 1, 0, 1,  0,  1, 0,  - Not sure, no difference is made when changing these, first part is 0,1,2,4,8,254, second is 0,255
  // 1                    - Not sure, no difference is made, mostly 1, sometime 0

  const activate = op.vars[0] === 1
  if (activate) {
    // I believe that this command is always called twice, once with vars[0] === 0 to prepare / load the colors then vars[0] === 1 to activate them
    // For the time being, we'll just acivate automatically and ignore this activation command
    return
  }
  const lightLayer = 2

  // op.vars[1], always 0, probably part of a 2 byte check for activate
  const rNorm = op.vars[8] / 255
  const gNorm = op.vars[10] / 255
  const bNorm = op.vars[12] / 255
  const rDarken = op.vars[9] === 255
  const gDarken = op.vars[11] === 255
  const bDarken = op.vars[13] === 255

  applyColorsToModelMeshes(model, lightLayer, rNorm, gNorm, bNorm, rDarken, gDarken, bDarken)
}

const applyColorsToModelMeshes = (model, lightLayer, rNorm, gNorm, bNorm, rDarken, gDarken, bDarken) => {
  model.scene.traverse(el => {
    if (el.type === 'Mesh') {
      if (el.geometry && el.geometry.attributes && el.geometry.attributes.color) {
        ensureOrigColorSet(el)
        el.layers.set(lightLayer)
        console.log('applyColorsToModelMeshes mesh color', el, el.material.uuid, el.layers, el.layers.isEnabled(0), el.layers.isEnabled(lightLayer))
        const origColorAttr = el.geometry.userData.origColor
        const colorAttr = el.geometry.getAttribute('color')
        console.log('applyColorsToModelMeshes makeColored mesh', el.material, origColorAttr, colorAttr)

        el.material.format = THREE.RGBAFormat
        for (let i = 0; i < colorAttr.count; i++) {
          const colors = [origColorAttr.getX(i), origColorAttr.getY(i), origColorAttr.getZ(i)]
          const normColors = [rNorm, gNorm, bNorm]
          const darkenColors = [rDarken, gDarken, bDarken]

          const newCs = []
          for (let i = 0; i < colors.length; i++) {
            const c = colors[i]
            const normC = normColors[i]
            const newC = darkenColors[i]
              ? Math.max(0, c - (1 - normC))
              : Math.min(1, c + normC)
            newCs.push(newC)
          }

          // console.log('applyColorsToModelMeshes makeSemiTransparent mesh color op', i,
          //   colors.map(c => Math.floor(c * 255)).join('_'),
          //   normColors.map(c => Math.floor(c * 255)).join('_'), '->',
          //   newCs.map(c => Math.floor(c * 255)).join('_'))
          colorAttr.setXYZ(i, newCs[0], newCs[1], newCs[2])
        }
        colorAttr.needsUpdate = true
        el.material.roughness = 1
        el.material.needsUpdate = true
      } else {
        console.log('applyColorsToModelMeshes mesh texture', el, el.material.uuid, el.layers, el.layers.isEnabled(0), el.layers.isEnabled(lightLayer))
        // Darken colors also shoud apply to textures too
        // Textures not affected unless dark
        rDarken ? el.material.color.r = rNorm : el.material.color.r = 1
        gDarken ? el.material.color.g = gNorm : el.material.color.g = 1
        bDarken ? el.material.color.b = bNorm : el.material.color.b = 1
      }
    }
  })
}
export {
  kawaiOpBlink,
  activateRandomBlinkForFieldCharacters,
  getRandomBlinkTime,
  enableBlink,
  disableBlink,
  kawaiOpTrnsp,
  kawaiOpAmbient,
  kawaiOpSplash,
  kawaiOpSBObj,
  kawaiOpShine,
  kawaiOpLight
}
window.test = async () => {
  console.log('test SHINE start')
  await animateShine(window.currentField.models[8])
  console.log('test SHINE end')
}

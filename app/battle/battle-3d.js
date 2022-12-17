import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { sceneGroup, tweenSleep } from './battle-scene.js'
import { loadSceneModel } from '../data/scene-fetch-data.js'

const tempSlow = 1

const loadModelWithAnimationBindings = async (code) => {
  const model = await loadSceneModel(code)
  model.mixer = new THREE.AnimationMixer(model.scene)
  model.mixer.addEventListener('finished', async e => {
    // console.log('battle finished mixer', e, e.action.model, e.action.nextAnim)
    if (e.action.promise) {
      e.action.promise()
      delete e.action.promise
    }
    if (e.action.model && Object.hasOwn(e.action, 'nextAnim')) {
      // console.log('battle autoplay nextAnim', e.action.nextAnim)
      e.action.model.userData.playAnimation(e.action.nextAnim)
      delete e.action.nextAnim
    }
  })
  model.userData.playAnimation = (i) => {
    // console.log('battle playAnimation', i)
    const action = model.mixer.clipAction(model.animations[i])
    action.timeScale = tempSlow
    model.mixer.stopAllAction()
    action.reset().play()
  }
  model.userData.playAnimationOnce = (i, options) => {
    return new Promise(resolve => {
      const action = model.mixer.clipAction(model.animations[i])
      action.timeScale = tempSlow
      action.loop = THREE.LoopOnce
      action.promise = resolve
      action.model = model
      action.clampWhenFinished = true
      delete action.nextAnim
      let playInstant = true
      if (options) {
        if (Object.hasOwn(options, 'delay')) {
          playInstant = false
          // console.log('battle DELAY:START')
          tweenSleep(options.delay / tempSlow).then(() => {
            // console.log('battle DELAY:END')
            model.mixer.stopAllAction()
            action.reset().play()
          })
        }
        if (Object.hasOwn(options, 'nextAnim')) {
          // console.log('battle set nextAnim', options.nextAnim)
          action.nextAnim = options.nextAnim
        }
      }
      if (playInstant) {
        model.mixer.stopAllAction()
        action.reset().play()
      }
    })
  }
  return model
}
const addShadow = (model) => {
  const box = new THREE.BoxHelper(model.scene)
  box.geometry.computeBoundingBox()
  const radius = Math.max(
    box.geometry.boundingBox.max.x - box.geometry.boundingBox.min.x,
    box.geometry.boundingBox.max.z - box.geometry.boundingBox.min.z
  ) / 2
  // sceneGroup.add(box)
  // console.log('battle shadow size', box, box.geometry.boundingBox, radius)
  const geometry = new THREE.CircleGeometry(radius, 32)
  const material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
  const shadow = new THREE.Mesh(geometry, material)
  shadow.position.y = 10
  shadow.rotation.x = -Math.PI / 2
  model.userData.shadow = shadow
  model.userData.updateShadowPosition = () => {
    shadow.position.y = model.initialY - model.scene.children[0].position.y + 5
  }
  model.scene.children[0].add(shadow)
}
const memberPositions = {
  x: {
    1: [0],
    2: [-800, 800],
    3: [-1500, 0, 1500]
  },
  row: [-1600, -2100]
}
const importModels = async (currentBattle) => {
  const modelsToFind = [currentBattle.setup.locationCode, ...currentBattle.actors.filter(a => a.modelCode).map(a => a.modelCode)]
  const modelsFound = await Promise.all(modelsToFind.map(code => loadModelWithAnimationBindings(code)))
  const locationModel = modelsFound.shift()
  locationModel.name = 'location'
  // console.log('battle locationModel', locationModel)
  currentBattle.models = [locationModel]

  sceneGroup.add(locationModel.scene)

  for (const [i, actor] of currentBattle.actors.entries()) {
    if (!actor.active) continue
    const model = modelsFound.shift()
    model.name = actor.data.name
    model.initialY = model.animations[0].tracks[0].values[1]
    currentBattle.models.push(model)
    sceneGroup.add(model.scene)
    actor.model = model
    if (actor.type === 'player') {
      model.userData.defaultPosition = {
        x: memberPositions.x['3'][i],
        y: -model.initialY,
        z: memberPositions.row[0] // TODO - Row
      }
    } else {
      model.userData.defaultPosition = {
        x: actor.initialData.position.x,
        y: actor.initialData.position.y - model.initialY,
        z: -actor.initialData.position.z // TODO - Row
      }
      model.scene.rotation.y = Math.PI
    }

    model.scene.position.x = model.userData.defaultPosition.x
    model.scene.position.y = model.userData.defaultPosition.y
    model.scene.position.z = model.userData.defaultPosition.z

    model.userData.playAnimation(0)
    addShadow(model)

    if (i === 0) window.bm = model
  }

  // Set default camera

  // console.log('battle cameraPlacement', battleConfig.scene.cameraPlacement['0'].camera1)
  window.battleDebugCamera.position.x = currentBattle.scene.cameraPlacement['0'].camera1.pos.x
  window.battleDebugCamera.position.y = -currentBattle.scene.cameraPlacement['0'].camera1.pos.y
  window.battleDebugCamera.position.z = -currentBattle.scene.cameraPlacement['0'].camera1.pos.z
  window.battleDebugCamera.controls.target.x = currentBattle.scene.cameraPlacement['0'].camera1.dir.x
  window.battleDebugCamera.controls.target.y = -currentBattle.scene.cameraPlacement['0'].camera1.dir.y
  window.battleDebugCamera.controls.target.z = -currentBattle.scene.cameraPlacement['0'].camera1.dir.z
}

export { importModels, tempSlow }

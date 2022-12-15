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

const importModels = async () => {
  const battleConfig = window.currentBattle
  const modelsToFind = [battleConfig.setup.locationCode, ...battleConfig.enemies.map(e => e.enemyCode), ...battleConfig.party.map(m => m.modelCode)]
  const modelsFound = await Promise.all(modelsToFind.map(code => loadModelWithAnimationBindings(code)))
  const locationModel = modelsFound.shift()
  // console.log('battle locationModel', locationModel)
  battleConfig.models = [locationModel]

  sceneGroup.add(locationModel.scene)
  for (const enemy of battleConfig.enemies) {
    const model = modelsFound.shift()
    model.name = enemy
    // There is position in the animations too, but not always the same amount, test with this for a start
    model.initialY = model.animations[0].tracks[0].values[1]
    battleConfig.models.push(model)
    sceneGroup.add(model.scene)

    enemy.model = model

    model.userData.defaultPosition = {
      x: enemy.position.x,
      y: enemy.position.y - model.initialY,
      z: -enemy.position.z // TODO - Row
    }
    // model.userData.

    model.scene.position.x = model.userData.defaultPosition.x
    model.scene.position.y = model.userData.defaultPosition.y
    model.scene.position.z = model.userData.defaultPosition.z
    model.scene.rotation.y = Math.PI
    // console.log('battle', 'enemy', model.scene, enemy.position)
    model.userData.playAnimation(0)
    addShadow(model)
  }

  const memberPositions = {
    x: {
      1: [0],
      2: [-800, 800],
      3: [-1500, 0, 1500]
    },
    row: [-1600, -2100]
  }
  for (const [i, member] of battleConfig.party.entries()) {
    const model = modelsFound.shift()
    model.name = member
    model.initialY = model.animations[0].tracks[0].values[1]
    battleConfig.models.push(model)
    sceneGroup.add(model.scene)
    member.model = model

    model.userData.defaultPosition = {
      x: memberPositions.x[battleConfig.party.length][i],
      y: -model.initialY,
      z: memberPositions.row[0] // TODO - Row
    }
    model.scene.position.x = model.userData.defaultPosition.x
    model.scene.position.y = model.userData.defaultPosition.y
    model.scene.position.z = model.userData.defaultPosition.z
    // console.log('battle', 'member', model, model.position)
    if (i === 0) window.bm = model
    model.userData.playAnimation(0)
    addShadow(model)
  }

  // Set default camera

  // console.log('battle cameraPlacement', battleConfig.scene.cameraPlacement['0'].camera1)
  window.battleDebugCamera.position.x = battleConfig.scene.cameraPlacement['0'].camera1.pos.x
  window.battleDebugCamera.position.y = -battleConfig.scene.cameraPlacement['0'].camera1.pos.y
  window.battleDebugCamera.position.z = -battleConfig.scene.cameraPlacement['0'].camera1.pos.z
  window.battleDebugCamera.controls.target.x = battleConfig.scene.cameraPlacement['0'].camera1.dir.x
  window.battleDebugCamera.controls.target.y = -battleConfig.scene.cameraPlacement['0'].camera1.dir.y
  window.battleDebugCamera.controls.target.z = -battleConfig.scene.cameraPlacement['0'].camera1.dir.z
}

export { importModels, tempSlow }

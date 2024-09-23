import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import {
  sceneGroup,
  tweenSleep,
  BATTLE_TWEEN_GROUP,
  activeCamera,
  scene
} from './battle-scene.js'
import { loadSceneModel } from '../data/scene-fetch-data.js'
import { setLoadingProgress } from '../loading/loading-module.js'
import { battleFormationConfig, FACING } from './battle-formation.js'

const tempSlow = 1

const loadModelWithAnimationBindings = async (code, manager) => {
  const model = await loadSceneModel(code, manager)
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
  model.userData.playAnimation = i => {
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
const addShadow = model => {
  // TODO - Not always circles, need to investigate more, plus, these aren't the right sizes
  const box = new THREE.BoxHelper(model.scene)
  box.geometry.computeBoundingBox()
  const radius =
    Math.max(
      box.geometry.boundingBox.max.x - box.geometry.boundingBox.min.x,
      box.geometry.boundingBox.max.z - box.geometry.boundingBox.min.z
    ) / 2
  // sceneGroup.add(box)
  // console.log('battle shadow size', box, box.geometry.boundingBox, radius)
  const geometry = new THREE.CircleGeometry(radius, 32)
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.3
  })
  const shadow = new THREE.Mesh(geometry, material)
  shadow.rotation.x = -Math.PI / 2
  model.userData.shadow = shadow
  model.userData.updateShadowPosition = () => {
    const worldPosition = new THREE.Vector3()
    model.scene.children[0].getWorldPosition(worldPosition)
    shadow.position.x = worldPosition.x
    shadow.position.y = 17
    shadow.position.z = worldPosition.z
  }
  return shadow
}
const createSelectionTriangle = () => {
  const geom = new THREE.BufferGeometry()
  const vertices = new Float32Array(
    []
      .concat(
        ...window.data.battleMisc.mark.map(m =>
          m.positions.map(p => p.map(v => v * -1))
        )
      )
      .flat()
  )
  geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geom.setAttribute(
    'color',
    new THREE.BufferAttribute(
      new Float32Array(
        []
          .concat(
            ...window.data.battleMisc.mark.map(m =>
              m.colors.map(c => {
                const col = new THREE.Color(c)
                return [col.r, col.g, col.b]
              })
            )
          )
          .flat()
      ),
      3
    )
  )
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide
  })
  const selectionTriangle = new THREE.Mesh(geom, material)
  selectionTriangle.visible = false
  sceneGroup.add(selectionTriangle)

  const from = { v: 0 }
  const to = { v: -Math.PI * 2 }
  new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
    .to(to, 2200)
    .repeat(Infinity)
    .onUpdate(() => {
      selectionTriangle.rotation.y = from.v
    })
    .start()

  return {
    model: selectionTriangle,
    showForActor: actor => {
      selectionTriangle.position.x = actor.model.scene.position.x
      selectionTriangle.position.y = 0 // -actor.model.scene.position.y + 600 // Does this need to be model height plus offset?
      selectionTriangle.position.z = actor.model.scene.position.z

      selectionTriangle.visible = true
    },
    hide: () => {
      selectionTriangle.visible = false
    }
  }
}
const addOrthoPosition = model => {
  // console.log('updateOrthoPosition INIT', model)
  model.userData.orthoPosition = new THREE.Vector3()
  // model.userData.boundingBox = new THREE.Box3()
  // scene.add(new THREE.Box3Helper(model.userData.boundingBox, 0xffff00))

  model.userData.centreBone = null
  model.scene.traverse(el => {
    // console.log('bone name ALL', model.name, el.name)
    if (el.name && el.name.endsWith('BoneRoot')) {
      // console.log('bone name', model.name, el.name)
      model.userData.centreBone = el

      console.log('bone name FOUND END', model.name)
      // const points = [start, end]
      // const geometry = new THREE.BufferGeometry().setFromPoints(points)
      // const material = new THREE.LineBasicMaterial({ color: 0xff00ff })

      // const line = new THREE.Line(geometry, material)
      // el.add(line)
    }
  })
  console.log('bone name FOUND', model.name, model.userData.centreBone)
  model.userData.updateOrthoPosition = () => {
    if (!model.userData.centreBone) return

    // console.log('updateOrthoPosition', model.name, model.userData.centreBone)
    // Hmm, looks like it's the centre of the **AP bone, not the whole of the model ??
    // Update - It's really not, look at moth slasher (chaa) and soldier 3rd () in battle 442

    // Option 1 - Centre of the bone
    // model.userData.boundingBox.setFromObject(model.scene)
    // model.userData.boundingBox.setFromObject(model.userData.centreBone)
    // const vector = model.userData.boundingBox.getCenter(new THREE.Vector3())

    // Option 2 - World position of the bone
    // const vector = new THREE.Vector3()
    // model.userData.centreBone.getWorldPosition(vector)

    // Option 3 - Something else entirely... Just use the root position for now
    const vector = new THREE.Vector3()
    model.userData.centreBone.localToWorld(vector)
    // Project the world position into screen space
    vector.project(activeCamera)

    // Convert the normalized screen coordinates to 2D orthographic camera coordinates
    vector.x = (vector.x / 2 + 0.5) * window.config.sizing.width
    vector.y = (vector.y / 2 + 0.5) * window.config.sizing.height
    vector.z = model.scene.position.distanceToSquared(activeCamera.position)
    model.userData.orthoPosition = vector
    // console.log('getOrthoPosition END', vector)
  }
  model.userData.updateOrthoPosition()
}
const loadBattleModels = async modelsToFind => {
  const manager = new THREE.LoadingManager()
  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    setLoadingProgress(itemsLoaded / itemsTotal)
  }
  // TODO - Ensure that weapons are loaded too, at the minute, weapons are baked into the model
  const modelsFound = await Promise.all(
    modelsToFind.map(async code =>
      loadModelWithAnimationBindings(code, manager)
    )
  )
  console.log('loading complete')
  return modelsFound
}
const rotateObjectTowardsTargetObject = (object, targetVector) => {
  const objectPosition = object.position

  const direction = new THREE.Vector3()
  direction.subVectors(targetVector, objectPosition).normalize()
  direction.y = 0
  direction.normalize()

  const forward = new THREE.Vector3(0, 0, 1)
  forward.applyQuaternion(object.quaternion) // Adjust according to the object's current rotation
  forward.normalize() // Normalize the forward vector

  let angle = Math.acos(forward.dot(direction))

  const cross = new THREE.Vector3().crossVectors(forward, direction)
  if (cross.y < 0) {
    angle = -angle
  }
  object.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle)
}
window.rotateObjectTowardsTargetObject = rotateObjectTowardsTargetObject

const getCorrectModelRotationY = (modelZ, facingIn) => {
  return modelZ < 0
    ? facingIn === FACING.IN
      ? 0
      : Math.PI
    : facingIn === FACING.IN
    ? Math.PI
    : 0
}

const importModels = async currentBattle => {
  const modelsToFind = [
    currentBattle.setup.locationCode,
    ...currentBattle.actors.filter(a => a.modelCode).map(a => a.modelCode)
  ]
  const modelsFound = await loadBattleModels(modelsToFind)
  const locationModel = modelsFound.shift()
  locationModel.name = 'location'

  // TODO - Some locations have moving parts, eg, look at the rain in battle 20
  // console.log('battle locationModel', locationModel)
  currentBattle.models = [locationModel]
  sceneGroup.add(locationModel.scene)
  console.log('location', locationModel)

  const activePlayerCount = currentBattle.actors.filter(
    a => a.active && a.type === 'player'
  ).length
  for (const [i, actor] of currentBattle.actors.entries()) {
    if (!actor.active) continue
    const model = modelsFound.shift()
    model.name = actor.data.name
    model.initialY = model.animations[0].tracks[0].values[1]
    currentBattle.models.push(model)
    sceneGroup.add(model.scene)
    actor.model = model
    if (actor.type === 'player') {
      console.log(
        'battleUI row',
        actor,
        actor.data.status.battleOrder,
        actor.data.status.battleOrder === 'BackRow'
          ? -battleFormationConfig.row
          : 0
      )
      model.userData.defaultPosition = {
        x: currentBattle.formationConfig.positions[activePlayerCount][i].x,
        y: -model.initialY,
        z:
          -currentBattle.formationConfig.positions[activePlayerCount][i].z +
          (actor.data.status.battleOrder === 'BackRow'
            ? currentBattle.formationConfig.positions[activePlayerCount][i].z >
              0
              ? -battleFormationConfig.row
              : battleFormationConfig.row
            : 0)
      }
      // Set rotation
      model.userData.defaultRotationY = getCorrectModelRotationY(
        model.userData.defaultPosition.z,
        currentBattle.formationConfig.directions.player.default
      )
      model.scene.rotation.y = getCorrectModelRotationY(
        model.userData.defaultPosition.z,
        currentBattle.formationConfig.directions.player.initial
      )
    } else {
      model.userData.defaultPosition = {
        x: actor.initialData.position.x,
        y: -actor.initialData.position.y - model.initialY,
        z: -actor.initialData.position.z // TODO - Validate, enemies don't have row adjustments
      }
      // Set rotation
      model.userData.defaultRotationY = getCorrectModelRotationY(
        model.userData.defaultPosition.z,
        currentBattle.formationConfig.directions.enemy.default
      )
      model.scene.rotation.y = getCorrectModelRotationY(
        model.userData.defaultPosition.z,
        currentBattle.formationConfig.directions.enemy.initial
      )
    }

    model.scene.position.x = model.userData.defaultPosition.x
    model.scene.position.y = model.userData.defaultPosition.y
    model.scene.position.z = model.userData.defaultPosition.z

    model.userData.playAnimation(0)
    sceneGroup.add(addShadow(model))
    addOrthoPosition(model)

    if (i === 0) window.bm = model
  }

  currentBattle.miscModels = {
    selectionTriangle: createSelectionTriangle()
  }

  // Set default camera
  setCameraPosition(0) // TODO - I don't know how this is set yet
}
// Shortcuts for debugging

const setCameraPosition = (positionID, cameraID) => {
  if (cameraID === undefined) cameraID = 1
  window.battleDebugCamera.position.x =
    currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.x
  window.battleDebugCamera.position.y =
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.y
  window.battleDebugCamera.position.z =
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.z
  window.battleDebugCamera.controls.target.x =
    currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.x
  window.battleDebugCamera.controls.target.y =
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.y
  window.battleDebugCamera.controls.target.z =
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.z
}
window.setCameraPosition = setCameraPosition

export { importModels, tempSlow }

import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import { GUI } from '../../assets/threejs-r148/examples/jsm/libs/lil-gui.module.min.js'
import { OrbitControls } from '../../assets/threejs-r148/examples/jsm/controls/OrbitControls.js'
import TWEEN from '../../assets/tween.esm.js'
import { SHAKE_TWEEN_GROUP } from './field-op-codes-camera-media-helper.js'
import { updateArrowPositionHelpers } from './field-position-helpers.js'
import { updateFieldPlayerMovement } from './field-movement-player.js'
import { updateMoveEntityMovement } from './field-movement.js'
import { getFieldList, loadFieldData } from './field-fetch-data.js'
import { getActiveInputs } from '../interaction/inputs.js'
import {
  scene as orthoBackScene,
  camera as orthoBackCamera
} from './field-ortho-bg-scene.js'
import {
  scene as orthoFrontScene,
  camera as orthoFrontCamera
} from './field-ortho-scene.js'
import { initOpLoopVisualiser } from './field-op-loop-visualiser.js'
import { stopAllLoops, setFieldLoopActive } from './field-op-loop.js'
import {
  updateBackgroundScolling,
  updateLayer2Parallax
} from './field-backgrounds.js'
import { updateOnceASecond } from '../helpers/gametime.js'
import { processLineTriggersForFrame } from './field-actions.js'
import { getSceneGraph } from '../data/world-fetch-data.js'
import { getFieldIdForName } from './field-metadata.js'

// Uses global states:
// let currentField = window.currentField // Handle this better in the future
// let anim = window.anim
// let config = window.config

const FIELD_TWEEN_GROUP = (window.FIELD_TWEEN_GROUP = new TWEEN.Group())

const renderLoop = function () {
  // console.log('renderLoop field')
  if (window.anim.activeScene !== 'field') {
    console.log('Stopping field renderLoop')
    return
  }
  window.requestAnimationFrame(renderLoop)
  const delta = window.anim.clock.getDelta()
  if (window.currentField.debugCameraControls) {
    window.currentField.debugCameraControls.update(delta)
  }
  if (window.currentField.models) {
    for (let i = 0; i < window.currentField.models.length; i++) {
      const model = window.currentField.models[i]
      model.mixer.update(delta) // Render character window.animations
    }
  }
  FIELD_TWEEN_GROUP.update()
  SHAKE_TWEEN_GROUP.update()
  updateFieldPlayerMovement(delta) // Ideally this should go in a separate loop
  updateMoveEntityMovement(delta)
  updateBackgroundScolling(delta) // Ideally this should go in a separate loop
  updateArrowPositionHelpers()
  updateCameraPosition()
  updateOnceASecond()
  processLineTriggersForFrame()
  if (
    window.anim.renderer &&
    window.currentField.fieldScene &&
    window.currentField.fieldCamera
  ) {
    // console.log('render')
    let activeCamera = window.currentField.fieldCamera
    if (window.currentField.showVideoCamera) {
      activeCamera = window.currentField.videoCamera
    }
    if (window.config.debug.showDebugCamera) {
      activeCamera = window.currentField.debugCamera
    }

    if (window.config.raycast.active) {
      raycasterFieldRendering(activeCamera)
    }
    window.anim.renderer.clear()
    window.anim.renderer.render(orthoBackScene, orthoBackCamera)

    window.anim.renderer.clearDepth()
    window.anim.renderer.render(window.currentField.fieldScene, activeCamera)

    window.anim.renderer.clearDepth()
    window.anim.renderer.render(orthoFrontScene, orthoFrontCamera)

    // window.anim.renderer.render(bgScene, bgCamera)
  }
  if (window.config.debug.active) {
    window.anim.stats.update()
  }
  if (window.currentField.fieldCameraHelper) {
    window.currentField.fieldCameraHelper.update()
  }
}
const renderToTexture = (bufferTexture) => {
  console.log('renderToTexture', 'renderToTexture', bufferTexture)
  window.anim.renderer.setRenderTarget(bufferTexture)
  window.anim.renderer.render(window.currentField.fieldScene, window.currentField.fieldCamera, bufferTexture)
  window.anim.renderer.setRenderTarget(null)
}
const startFieldRenderLoop = () => {
  setFieldLoopActive(true)
  if (window.anim.activeScene !== 'field') {
    window.anim.activeScene = 'field'
    if (window.config.raycast.active) {
      setupRaycasting()
    }
    renderLoop()
  }
}

const setupRaycasting = async () => {
  if (window.config.raycast.active) {
    // raycaster = new THREE.Raycaster()
    // mouse = new THREE.Vector2()
    const geometry = new THREE.SphereGeometry(0.002, 32, 32)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    window.config.raycast.raycasterHelper = new THREE.Mesh(geometry, material)
    window.config.raycast.raycasterHelper.visible = false
    window.currentField.fieldScene.add(window.config.raycast.raycasterHelper)
    window.addEventListener(
      'mousemove',
      function (event) {
        const canvasBounds = window.anim.renderer
          .getContext()
          .canvas.getBoundingClientRect()
        window.config.raycast.mouse.x =
          ((event.clientX - canvasBounds.left) /
            (canvasBounds.right - canvasBounds.left)) *
            2 -
          1
        window.config.raycast.mouse.y =
          -(
            (event.clientY - canvasBounds.top) /
            (canvasBounds.bottom - canvasBounds.top)
          ) *
            2 +
          1
      },
      false
    )
  }
}
const raycasterFieldRendering = camera => {
  window.config.raycast.raycaster.setFromCamera(
    window.config.raycast.mouse,
    camera
  )
  const intersects = window.config.raycast.raycaster.intersectObjects([
    window.currentField.walkmeshMesh
  ]) // window.currentField.walkmeshMesh//window.currentField.fieldScene.children
  // console.log('window.currentField.walkmeshMesh', window.currentField.walkmeshMesh)
  if (intersects.length === 0) {
    window.config.raycast.raycasterHelper.visible = false
  } else {
    window.config.raycast.raycasterHelper.visible = true
  }
  for (let i = 0; i < intersects.length; i++) {
    // intersects[i].object.material.color.set(0xff0000)
    const point = intersects[i].point
    // window.config.raycast.raycasterHelper.visible = true
    window.config.raycast.raycasterHelper.position.set(
      point.x,
      point.y,
      point.z
    )
    console.log(
      'intersect point',
      point,
      window.config.raycast.raycasterHelper.position
    )
  }
}
const setupFieldCamera = () => {
  // console.log('field-scene -> window.currentField', window.currentField, window.currentField)
  const ffCamera = window.currentField.data.cameraSection.cameras[0] // TODO: Support multiple cameras
  const baseFOV = 2 * Math.atan(240.0 / (2.0 * ffCamera.zoom)) * 57.29577951
  window.currentField.fieldScene = new THREE.Scene()
  // window.currentField.fieldScene.background = new THREE.Color(0x000000)
  window.currentField.fieldCamera = new THREE.PerspectiveCamera(
    baseFOV,
    window.config.sizing.width / window.config.sizing.height,
    0.001,
    1000
  ) // near and far is 0.001 / 4096, 100000 / 4096 in makou reactor

  const camAxisXx = ffCamera.xAxis.x / 4096.0
  const camAxisXy = ffCamera.xAxis.y / 4096.0
  const camAxisXz = ffCamera.xAxis.z / 4096.0

  const camAxisYx = -ffCamera.yAxis.x / 4096.0
  const camAxisYy = -ffCamera.yAxis.y / 4096.0
  const camAxisYz = -ffCamera.yAxis.z / 4096.0

  const camAxisZx = ffCamera.zAxis.x / 4096.0
  const camAxisZy = ffCamera.zAxis.y / 4096.0
  const camAxisZz = ffCamera.zAxis.z / 4096.0

  const camPosX = ffCamera.position.x / 4096.0
  const camPosY = -ffCamera.position.y / 4096.0
  const camPosZ = ffCamera.position.z / 4096.0

  const tx = -(camPosX * camAxisXx + camPosY * camAxisYx + camPosZ * camAxisZx)
  const ty = -(camPosX * camAxisXy + camPosY * camAxisYy + camPosZ * camAxisZy)
  const tz = -(camPosX * camAxisXz + camPosY * camAxisYz + camPosZ * camAxisZz)

  window.currentField.fieldCamera.position.x = tx
  window.currentField.fieldCamera.position.y = ty
  window.currentField.fieldCamera.position.z = tz
  window.currentField.fieldCamera.up.set(camAxisYx, camAxisYy, camAxisYz)
  // console.log('up', camAxisYx, camAxisYy, camAxisYz)
  window.currentField.fieldCamera.lookAt(
    tx + camAxisZx,
    ty + camAxisZy,
    tz + camAxisZz
  )

  window.currentField.fieldCamera.updateProjectionMatrix()
  window.currentField.fieldScene.add(window.currentField.fieldCamera)

  const cameraTarget = new THREE.Vector3(
    tx + camAxisZx,
    ty + camAxisZy,
    tz + camAxisZz
  )

  window.currentField.fieldCamera.layers.enableAll()
  setupFieldDebugCamera()
  setupFieldVideoCamera()
  window.currentField.fieldCameraHelper = new THREE.CameraHelper(
    window.currentField.fieldCamera
  )
  window.currentField.fieldCameraHelper.visible = true
  window.currentField.fieldScene.add(window.currentField.fieldCameraHelper)
  window.currentField.fieldScene.add(window.currentField.fieldCamera)

  setupFieldLights()
  return cameraTarget
}
const getLightData = () => {
  const models = window.currentField.data.model.modelLoaders
  for (let i = 0; i < models.length; i++) {
    const model = models[i]
    if (
      model.globalLight !== undefined &&
      model.light1 !== undefined &&
      model.light2 !== undefined &&
      model.light3 !== undefined
    ) {
      return model
    }
  }
  return false
}
const getAverageOfArray = array => array.reduce((a, b) => a + b) / array.length
const getSceneCentrePoint = () => {
  const xList = []
  const yList = []
  const zList = []
  const triangles = window.currentField.data.walkmeshSection.triangles
  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i]
    xList.push(triangle.vertices[0].x)
    xList.push(triangle.vertices[1].x)
    xList.push(triangle.vertices[2].x)
    yList.push(triangle.vertices[0].y)
    yList.push(triangle.vertices[1].y)
    yList.push(triangle.vertices[2].y)
    zList.push(triangle.vertices[0].z)
    zList.push(triangle.vertices[1].z)
    zList.push(triangle.vertices[2].z)
  }
  const average = {
    x: getAverageOfArray(xList),
    y: getAverageOfArray(yList),
    z: getAverageOfArray(zList)
  }
  return average
}
const setupFieldLights = () => {
  // There are 137 fields where the lighting is not uniform across all characters
  // Most of the time, this is the save crystal, treasure box or a background object, eg train graveyard
  // See ./workings-out/fieldModelSelectiveLightingIdentify.js ->
  //     ./workings-out/output/field-model-lighting.json

  // Threejs does not currenty allow selective lighting:
  //  - https://github.com/mrdoob/three.js/issues/5180
  //  - https://github.com/mrdoob/three.js/pull/15223
  //  - https://github.com/mrdoob/three.js/pull/17396

  // TODO: I'll will temporary implement this as global directional lighting and reimplement more
  // effectively at a later date for each individual model. For now, get the centre point of the scene
  // and draw the light from there

  const lightData = getLightData()
  if (lightData) {
    // console.log('lightData', lightData)
    // console.log('lightData getSceneCentrePoint', centre)

    const lightLayer = 0
    window.currentField.centrePoint = getSceneCentrePoint()
    window.currentField.lights = { lightData, globalLight: null, pointLights: [] }

    createGlobalLight(1)
    createPointLights(lightLayer, 1)
  }
}
const ensureFieldLightData = (lightLayer) => {
  console.log('light 1')
  if (lightLayer !== undefined && window.currentField.lights.pointLights[lightLayer] === undefined) {
    window.currentField.lights.pointLights[lightLayer] = []
    console.log('light 3', window.currentField.lights)
  }
}
const createGlobalLight = (intensity) => {
  // if (window.currentField.lights.globalLight) {
  //   window.currentField.lights.globalLight.parent.remove(window.currentField.lights.globalLight)
  //   delete window.currentField.lights.globalLight
  // }
  const lightData = window.currentField.lights.lightData
  console.log('light createGlobalLight lightData', lightData)

  const globalLight = new THREE.AmbientLight(
    new THREE.Color(
      `rgb(${lightData.globalLight.r},${lightData.globalLight.g},${lightData.globalLight.b})`
    ),
    intensity
  )
  // globalLight.layers.enableAll()
  globalLight.layers.set(0)
  window.currentField.fieldScene.add(globalLight)
  window.currentField.lights.globalLight = globalLight
}
const createPointLights = (lightLayer, intensity) => {
  ensureFieldLightData(lightLayer)
  if (window.currentField.lights.pointLights[lightLayer]) {
    for (let i = 0; i < window.currentField.lights.pointLights[lightLayer].length; i++) {
      const pointLight = window.currentField.lights.pointLights[lightLayer][i]
      pointLight.visible = false
      console.log('light removing point light', pointLight)
      pointLight.parent.remove(pointLight)
    }
    window.currentField.lights.pointLights[lightLayer] = []
  }
  if (intensity === 0) {
    return
  }
  const lightData = window.currentField.lights.lightData
  for (let i = 1; i <= 3; i++) {
    const light = lightData[`light${i}`]
    const pointLight = new THREE.PointLight(
      new THREE.Color(`rgb(${light.r},${light.g},${light.b})`),
      intensity,
      100
    )
    pointLight.position.set(
      (window.currentField.centrePoint.x + light.x) / 4096,
      (window.currentField.centrePoint.y + light.y) / 4096,
      (window.currentField.centrePoint.z + light.z) / 4096
    )
    if (lightLayer === 0) {
      pointLight.layers.enableAll()
    } else {
      pointLight.layers.set(lightLayer)
    }

    window.currentField.fieldScene.add(pointLight)
    window.currentField.lights.pointLights[lightLayer].push(pointLight)
  }
  console.log('light createPointLights lightData', lightLayer, lightData, intensity, window.currentField.lights.pointLights[lightLayer][0].intensity)
}
const activateDebugCamera = () => {
  if (window.currentField.debugCamera) {
    window.currentField.debugCamera.visible =
      window.config.debug.showDebugCamera
    window.currentField.fieldCameraHelper.visible =
      window.config.debug.showDebugCamera

    window.currentField.debugCameraControls.enableZoom = true // window.config.debug.showDebugCamera
    window.currentField.debugCameraControls.enableRotate = true // window.config.debug.showDebugCamera
    window.currentField.debugCameraControls.enablePan = true // window.config.debug.showDebugCamera
    window.currentField.debugCameraControls.enabled = true
  }
  if (window.config.debug.showDebugCamera) {
    window.currentField.debugCameraControls.enabled = true
  } else {
    window.currentField.debugCameraControls.enabled = false
  }
}

const setupFieldDebugCamera = () => {
  window.currentField.debugCamera = window.currentField.fieldCamera.clone()
}
const setupFieldVideoCamera = () => {
  window.currentField.videoCamera = window.currentField.fieldCamera.clone()
}
const updateVideoCameraPosition = (positionData, fovAdjustment) => {
  console.log('moviecam updateVideoCameraPosition', positionData)

  const baseFOV = 2 * Math.atan(240.0 / (2.0 * positionData.zoom)) * 57.29577951
  const adjustedFOV = baseFOV * fovAdjustment
  window.currentField.videoCamera.fov = adjustedFOV

  const camAxisXx = positionData.xAxis.x / 4096.0
  const camAxisXy = positionData.xAxis.y / 4096.0
  const camAxisXz = positionData.xAxis.z / 4096.0

  const camAxisYx = -positionData.yAxis.x / 4096.0
  const camAxisYy = -positionData.yAxis.y / 4096.0
  const camAxisYz = -positionData.yAxis.z / 4096.0

  const camAxisZx = positionData.zAxis.x / 4096.0
  const camAxisZy = positionData.zAxis.y / 4096.0
  const camAxisZz = positionData.zAxis.z / 4096.0

  const camPosX = positionData.position.x / 4096.0
  const camPosY = -positionData.position.y / 4096.0
  const camPosZ = positionData.position.z / 4096.0

  const tx = -(camPosX * camAxisXx + camPosY * camAxisYx + camPosZ * camAxisZx)
  const ty = -(camPosX * camAxisXy + camPosY * camAxisYy + camPosZ * camAxisZy)
  const tz = -(camPosX * camAxisXz + camPosY * camAxisYz + camPosZ * camAxisZz)

  window.currentField.videoCamera.position.x = tx
  window.currentField.videoCamera.position.y = ty
  window.currentField.videoCamera.position.z = tz
  window.currentField.videoCamera.up.set(camAxisYx, camAxisYy, camAxisYz)
  // console.log('up', camAxisYx, camAxisYy, camAxisYz)
  window.currentField.videoCamera.lookAt(
    tx + camAxisZx,
    ty + camAxisZy,
    tz + camAxisZz
  )

  window.currentField.videoCamera.updateProjectionMatrix()

  // TODO - This isn't perfect, something is not quite right
}
const setupDebugControls = () => {
  window.currentField.debugCameraControls = new OrbitControls(
    window.currentField.debugCamera,
    window.anim.renderer.domElement
  )
  window.currentField.debugCameraControls.target =
    window.currentField.cameraTarget
  window.currentField.debugCameraControls.panSpeed = 1 / 4
  window.currentField.debugCameraControls.rotateSpeed = 1 / 4
  window.currentField.debugCameraControls.zoomSpeed = 1 / 4
  window.currentField.debugCameraControls.update()

  // if (window.config.debug.showDebugCamera) {
  window.currentField.debugCameraControls.enableZoom =
    window.config.debug.showDebugCamera
  window.currentField.debugCameraControls.enableRotate =
    window.config.debug.showDebugCamera
  window.currentField.debugCameraControls.enablePan =
    window.config.debug.showDebugCamera
  // }
  activateDebugCamera()

  window.anim.axesHelper = new THREE.AxesHelper(0.1)
  window.anim.axesHelper.visible = false
  window.currentField.fieldScene.add(window.anim.axesHelper)
}

const initFieldDebug = async loadFieldCB => {
  // Clear all existing debug info
  if (window.anim.gui) {
    window.anim.gui.destroy()
  }
  window.anim.gui = new GUI({ width: 250, hideable: false })

  const fieldGUI = window.anim.gui.addFolder('Field Data')
  // if (window.currentField === undefined) { window.currentField = { name: 'cosin4' } } // Just set this like this, it will be overridden on init
  const fields = await getFieldList()
  fieldGUI
    .add(window.currentField, 'name', fields)
    .onChange(async val => {
      console.log('loadField window.currentField.name ->', val, loadFieldCB)
      await stopAllLoops()

      // TODO - get playableCharacterInitData from:
      // field-actions.gatewayTriggered or world-destination-selector.navigateSelect

      const sceneGraph = await getSceneGraph()
      const fieldId = await getFieldIdForName(val)
      const potentialFieldTransitionSourcesGateway = sceneGraph.links.filter(l => l.target === fieldId && l.type === 'gateway') // Just do gateways only
      const potentialFieldTransitionSourcesMapJump = sceneGraph.links.filter(l => l.target === fieldId && l.type === 'MAPJUMP')

      if (potentialFieldTransitionSourcesGateway.length > 0) {
        console.log('loadField get init position from gateway')
        const sourceFieldName = sceneGraph.nodes[potentialFieldTransitionSourcesGateway[0].source].fieldName

        const sourceFieldData = await loadFieldData(sourceFieldName)
        console.log('loadField sceneGraph', val, fieldId, sceneGraph, sourceFieldName, sourceFieldData)

        const gateway = sourceFieldData.triggers.gateways.filter(g => g.fieldId === fieldId)[0]

        const playableCharacterInitData = {
          triangleId: gateway.destinationVertex.triangleId,
          position: {
            x: gateway.destinationVertex.x,
            y: gateway.destinationVertex.y
          },
          direction: gateway.destinationVertex.direction,
          characterName: window.currentField.playableCharacter.userData.characterName
        }

        console.log('loadField gateway', gateway, playableCharacterInitData)
        window.sceneGraph = sceneGraph

        loadFieldCB(val, playableCharacterInitData)
      } else if (potentialFieldTransitionSourcesMapJump.length > 0) {
        console.log('loadField get init position from map jump')
        const sourceFieldName = sceneGraph.nodes[potentialFieldTransitionSourcesMapJump[0].source].fieldName

        const sourceFieldData = await loadFieldData(sourceFieldName)
        console.log('loadField sceneGraph', val, fieldId, sceneGraph, sourceFieldName, sourceFieldData, sourceFieldData.script.entities)

        for (let i = 0; i < sourceFieldData.script.entities.length; i++) {
          const entity = sourceFieldData.script.entities[i]
          console.log('entity', entity)
          for (let j = 0; j < entity.scripts.length; j++) {
            const script = entity.scripts[j]
            console.log('script', script)
            for (let k = 0; k < script.ops.length; k++) {
              const op = script.ops[k]
              console.log('op', op.op, op)
              if (op.op === 'MAPJUMP' && op.f === fieldId) {
                console.log('FOUND JUMP', op)
              }
            }
          }
        }
        let playableCharacterInitData
        sourceFieldData.script.entities.forEach(entity => {
          entity.scripts.forEach(script => {
            script.ops.forEach(op => {
              if (op.op === 'MAPJUMP' && op.f === fieldId) {
                console.log('loadField FOUND JUMP', op)
                playableCharacterInitData = {
                  triangleId: op.i,
                  position: {
                    x: op.x,
                    y: op.y
                  },
                  direction: op.direction,
                  characterName: window.currentField.playableCharacter.userData.characterName
                }
              }
            })
          })
        })
        loadFieldCB(val, playableCharacterInitData)
      } else {
        // console.log('loadField get init position from gateway')
        window.alert('NO POINTS OF ENTRY TO FIELD - Implement WORLD MAP JUMP in field-scene')
      }
    })
    .listen()

  fieldGUI
    .add(window.currentField.fieldCamera, 'fov')
    .min(0)
    .max(90)
    .step(0.001)
    .listen()
    .onChange(val => {
      // console.log('debug fov', val)
      window.currentField.fieldCamera.fov = val
      window.currentField.fieldCamera.updateProjectionMatrix()
    })
  fieldGUI.add(window.currentField.metaData.assetDimensions, 'width')
  fieldGUI.add(window.currentField.metaData.assetDimensions, 'height')
  fieldGUI.add(window.currentField.fieldCamera, 'aspect')
  fieldGUI
    .add(window.currentField.metaData, 'bgScale')
    .min(0.5)
    .max(4)
    .step(0.001)
    .onChange(val => {
      // console.log('debug bgScale', val)
      window.anim.renderer.setSize(
        window.currentField.metaData.assetDimensions.width *
          window.config.sizing.factor *
          window.currentField.metaData.bgScale,
        window.currentField.metaData.assetDimensions.height *
          window.config.sizing.factor *
          window.currentField.metaData.bgScale
      )
    })
  fieldGUI.add(window.currentField.metaData, 'cameraUnknownString')
  fieldGUI.add(window.currentField.metaData, 'modelScale')
  fieldGUI.add(window.currentField.metaData, 'numModels')
  fieldGUI.add(window.currentField.metaData, 'scaleDownValue').step(0.00001)
  fieldGUI.add(window.currentField.metaData, 'layersAvailable')
  fieldGUI
    .add(window.currentField.metaData.fieldCoordinates, 'x')
    .min(0)
    .max(window.currentField.metaData.assetDimensions.width)
    .step(1)
    .listen()
    .onChange(val =>
      setCameraPosition(val, window.currentField.metaData.fieldCoordinates.y)
    )
  fieldGUI
    .add(window.currentField.metaData.fieldCoordinates, 'y')
    .min(0)
    .max(window.currentField.metaData.assetDimensions.height)
    .step(1)
    .listen()
    .onChange(val =>
      setCameraPosition(window.currentField.metaData.fieldCoordinates.x, val)
    )
  fieldGUI.open()

  const debugGUI = window.anim.gui.addFolder('Debug')
  // debugGUI.add(window.config.sizing, 'factor').min(1).max(3).step(1).onChange((val) => {
  //     console.log('window.config.sizing.factor', window.config.sizing.factor, window.currentField.name)
  //     initField(window.currentField.name)
  //     if (window.config.sizing.factor !== val) {
  //         console.log('window.config.sizing.factor', val)
  //     }
  // })
  debugGUI
    .add(window.config.debug, 'debugModeNoOpLoops')
    .onChange(isDebugMode => {
      if (isDebugMode) {
        window.location.href = window.location.href + '?debug'
      } else {
        window.location.href = window.location.href.replace('?debug', '')
      }
    })
  debugGUI
    .add(window.config.debug, 'showDebugCamera')
    .onChange(function () {
      activateDebugCamera()
    })
    .setValue(window.config.debug.showDebugCamera)
  debugGUI.add(window.config.debug, 'showWalkmeshMesh').onChange(function () {
    window.currentField.walkmeshMesh.visible =
      window.config.debug.showWalkmeshMesh
  })
  debugGUI.add(window.config.debug, 'showWalkmeshLines').onChange(function () {
    window.currentField.walkmeshLines.visible =
      window.config.debug.showWalkmeshLines
    window.currentField.gatewayLines.visible =
      window.config.debug.showWalkmeshLines
    window.currentField.triggerLines.visible =
      window.config.debug.showWalkmeshLines
    window.currentField.lineLines.visible =
      window.config.debug.showWalkmeshLines
  })
  debugGUI
    .add(window.config.debug, 'showBackgroundLayers')
    .onChange(function () {
      window.currentField.backgroundLayers.visible =
        window.config.debug.showBackgroundLayers
    })
  debugGUI.add(window.config.debug, 'showModelHelpers').onChange(function () {
    const arrowHelpers = window.currentField.fieldScene.children.filter(
      e => e.type === 'ArrowHelper'
    )
    arrowHelpers.map(a => (a.visible = window.config.debug.showModelHelpers))
    console.log('window.currentField.fieldScene.children', arrowHelpers)
    window.currentField.backgroundLayers.visible = window.config.debug.showModelHelpers
  })
  debugGUI.add(window.config.debug, 'showAxes').onChange(() => {
    window.anim.axesHelper.visible = window.config.debug.showAxes
  })
  debugGUI.add(window.config.debug, 'showMovementHelpers').onChange(() => {
    window.currentField.movementHelpers.visible =
      window.config.debug.showMovementHelpers
  })
  debugGUI.open()

  const inputsGUI = window.anim.gui.addFolder('Inputs')
  inputsGUI.add(getActiveInputs(), 'up').listen()
  inputsGUI.add(getActiveInputs(), 'right').listen()
  inputsGUI.add(getActiveInputs(), 'down').listen()
  inputsGUI.add(getActiveInputs(), 'left').listen()
  inputsGUI.add(getActiveInputs(), 'x').listen()
  inputsGUI.add(getActiveInputs(), 'o').listen()
  inputsGUI.add(getActiveInputs(), 'square').listen()
  inputsGUI.add(getActiveInputs(), 'triangle').listen()
  inputsGUI.add(getActiveInputs(), 'l1').listen()
  inputsGUI.add(getActiveInputs(), 'l2').listen()
  inputsGUI.add(getActiveInputs(), 'r1').listen()
  inputsGUI.add(getActiveInputs(), 'r2').listen()
  inputsGUI.add(getActiveInputs(), 'select').listen()
  inputsGUI.add(getActiveInputs(), 'start').listen()
  inputsGUI.close()

  activateDebugCamera()
  if (!window.config.debug.debugModeNoOpLoops) {
    initOpLoopVisualiser()
  }
}
const setupViewClipping = async () => {
  window.anim.renderer.setSize(
    window.config.sizing.width * window.config.sizing.factor,
    window.config.sizing.height * window.config.sizing.factor
  )

  // Need to set a default, this is centre, should really be triggered from the player character being active on the screen
  const x = window.currentField.metaData.assetDimensions.width / 2
  const y = window.currentField.metaData.assetDimensions.height / 2
  console.log('setCameraPosition setupViewClipping', x, y)
  setCameraPosition(x, y) // Set initial view, will be overridden on movement and op codes, probably also when we place the playable character
  // console.log('window.currentField.metaData', window.currentField.metaData)
}
const calculateViewClippingPointFromVector3 = v => {
  const relativeToCamera = new THREE.Vector3(v.x, v.y, v.z).project(
    window.currentField.debugCamera
  ) // Debug camera has whole view
  relativeToCamera.x =
    ((relativeToCamera.x + 1) *
      (window.currentField.metaData.assetDimensions.width * 1)) /
    2
  relativeToCamera.y =
    (-(relativeToCamera.y - 1) *
      (window.currentField.metaData.assetDimensions.height * 1)) /
    2
  relativeToCamera.z = 0
  // console.log('calculateViewClippingPointFromVector3', v, relativeToCamera)

  const cameraRange = window.currentField.data.triggers.header.cameraRange

  // If the character is near the edge of the screen, calculate the correct x, y for the viewport
  const adjustedX = relativeToCamera.x - window.config.sizing.width / 2
  const adjustedY = relativeToCamera.y - window.config.sizing.height / 2
  const maxAdjustedX =
    2 *
      (window.currentField.metaData.assetDimensions.width / 2 -
        window.config.sizing.width / 2) -
    (window.currentField.metaData.assetDimensions.width / 2 - cameraRange.right) // 8
  const maxAdjustedY =
    2 *
      (window.currentField.metaData.assetDimensions.height / 2 -
        window.config.sizing.height / 2) -
    (window.currentField.metaData.assetDimensions.height / 2 -
      -cameraRange.bottom) // 8
  const minAdjustedX =
    window.currentField.metaData.assetDimensions.width / 2 - -cameraRange.left // 8
  const minAdjustedY =
    window.currentField.metaData.assetDimensions.height / 2 - cameraRange.top // 8
  // TODO - Apply camera range to maxAdjustedX
  // adjustedY = Math.max(adjustedY, (window.currentField.metaData.assetDimensions.height / 2) - cameraRange.top)
  // adjustedY = Math.min(adjustedY, (window.currentField.metaData.assetDimensions.height / 2) - cameraRange.bottom + window.config.sizing.height)
  // adjustedX = Math.max(adjustedX, (window.currentField.metaData.assetDimensions.width / 2) - cameraRange.left)
  // adjustedX = Math.min(adjustedX, (window.currentField.metaData.assetDimensions.width / 2) - cameraRange.right + window.config.sizing.width)

  if (adjustedX < minAdjustedX) {
    relativeToCamera.x = minAdjustedX + window.config.sizing.width / 2
  } else if (adjustedX > maxAdjustedX) {
    relativeToCamera.x = maxAdjustedX + window.config.sizing.width / 2
  }
  if (adjustedY < minAdjustedY) {
    relativeToCamera.y = minAdjustedY + window.config.sizing.height / 2
  } else if (adjustedY > maxAdjustedY) {
    relativeToCamera.y = maxAdjustedY + window.config.sizing.height / 2
  }

  // console.log('calculateViewClippingPointFromVector3', v,
  //     'maxAdjustedX', maxAdjustedX,
  //     'maxAdjustedY', maxAdjustedY,ds
  //     'adjustedX', adjustedX, relativeToCamera,
  //     'adjustedY', adjustedY, relativeToCamera)
  console.log(
    'calculateViewClippingPointFromVector3',
    v,
    'maxAdjustedX',
    maxAdjustedX,
    'maxAdjustedY',
    maxAdjustedY,
    'adjustedX',
    adjustedX,
    relativeToCamera,
    'adjustedY',
    adjustedY,
    relativeToCamera
  )
  // updateLayer2Parallax(maxAdjustedX, adjustedX, maxAdjustedY, adjustedY)

  return relativeToCamera
}
const roundHalf = (num) => {
  return Math.round(num * 2) / 2
}

const adjustViewClipping = (x, y) => {
  x = roundHalf(x) // To fix customer shader stuttering
  y = roundHalf(y)
  console.log('adjustViewClipping initial', x, y)
  // console.log('x', x, '->', adjustedX, 'y', y, '->', adjustedY)

  window.currentField.metaData.fieldCoordinates.x = x
  window.currentField.metaData.fieldCoordinates.y = y
  const adjustedX = x - window.config.sizing.width / 2
  const adjustedY = y - window.config.sizing.height / 2

  // Note: Logic to get the edge of scene screen offsets have been moved to calculateViewClippingPointFromVector3(...)
  // console.log('adjustViewClipping', 'x', x, '->', adjustedX, 'y', y, '->', adjustedY)

  window.currentField.fieldCamera.setViewOffset(
    window.currentField.metaData.assetDimensions.width *
      window.config.sizing.factor,
    window.currentField.metaData.assetDimensions.height *
      window.config.sizing.factor,
    adjustedX * window.config.sizing.factor,
    adjustedY * window.config.sizing.factor,
    window.config.sizing.width * window.config.sizing.factor,
    window.config.sizing.height * window.config.sizing.factor
  )
  const maxAdjustedX =
    2 *
    (window.currentField.metaData.assetDimensions.width / 2 -
      window.config.sizing.width / 2)
  const maxAdjustedY =
    2 *
    (window.currentField.metaData.assetDimensions.height / 2 -
      window.config.sizing.height / 2)

  console.log(
    'adjustViewClipping',
    'adjustedX',
    adjustedX,
    x,
    window.config.sizing.width,
    window.currentField.metaData.assetDimensions.width,
    'adjustedY',
    adjustedY,
    y,
    window.config.sizing.height,
    window.currentField.metaData.assetDimensions.height
  )
  // updateLayer2Parallax(window.config.sizing.width + 160, adjustedX, window.config.sizing.height, adjustedY)
  updateLayer2Parallax(maxAdjustedX, adjustedX, maxAdjustedY, adjustedY)
}
window.adjustViewClipping = adjustViewClipping
const setCameraPosition = (x, y) => {
  console.log('setCameraPosition', x, y)
  window.currentField.fieldCameraPosition.next.x = x
  window.currentField.fieldCameraPosition.next.y = y
}
const setCameraShakePosition = (x, y) => {
  console.log('setCameraShakePosition', x, y)
  window.currentField.fieldCameraPosition.shake.next.x = x
  window.currentField.fieldCameraPosition.shake.next.y = y
}

const updateCameraPosition = () => {
  if (
    window.currentField.fieldCameraPosition.current.x !==
      window.currentField.fieldCameraPosition.next.x ||
    window.currentField.fieldCameraPosition.current.y !==
      window.currentField.fieldCameraPosition.next.y ||
    window.currentField.fieldCameraPosition.shake.current.x !==
      window.currentField.fieldCameraPosition.shake.next.x ||
    window.currentField.fieldCameraPosition.shake.current.y !==
      window.currentField.fieldCameraPosition.shake.next.y
  ) {
    console.log('updateCameraPosition')
    window.currentField.fieldCameraPosition.current.x =
      window.currentField.fieldCameraPosition.next.x
    window.currentField.fieldCameraPosition.current.y =
      window.currentField.fieldCameraPosition.next.y
    window.currentField.fieldCameraPosition.shake.current.x =
      window.currentField.fieldCameraPosition.shake.next.x
    window.currentField.fieldCameraPosition.shake.current.y =
      window.currentField.fieldCameraPosition.shake.next.y
    adjustViewClipping(
      window.currentField.fieldCameraPosition.current.x +
        window.currentField.fieldCameraPosition.shake.current.x,
      window.currentField.fieldCameraPosition.current.y +
        window.currentField.fieldCameraPosition.shake.current.y
    )
  }
}
window.updateCameraPosition = updateCameraPosition
export {
  startFieldRenderLoop,
  setupFieldCamera,
  setupDebugControls,
  initFieldDebug,
  setupViewClipping,
  calculateViewClippingPointFromVector3,
  setCameraPosition,
  setCameraShakePosition,
  updateVideoCameraPosition,
  createPointLights,
  FIELD_TWEEN_GROUP,
  renderToTexture
}

import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { getFieldDimensions, getFieldBGLayerUrl, getFieldBGPixelLayerUrl, getFieldBGPaletteUrl } from './field-fetch-data.js'
import { drawArrowPositionHelper } from './field-position-helpers.js'
import { getModelScaleDownValue } from './field-models.js'
import { dec2hexPairs } from '../helpers/helpers.js'
// window.THREE = THREE // For debug

const USE_CUSTOM_SHADER = window.location.search.includes('shader')

const changeBackgroundParamState = (param, state, isActive) => {
  // console.log('changeBackgroundParamState', param, state, isActive)
  // const bgLayers = window.currentField.backgroundLayers.children.filter(l => l.userData.param === param && l.userData.state === state)
  // bgLayers.map(l => l.visible = isActive)

  const allBgLayers = window.currentField.backgroundLayers.children
  for (let i = 0; i < allBgLayers.length; i++) {
    const l = allBgLayers[i]
    if (l.userData.param === param && l.userData.state === state) {
      l.visible = isActive
    }
  }
}
const rollBackgroundParamState = (param, forward) => {
  // Get current active state
  let currentState
  const allBgLayers = window.currentField.backgroundLayers.children
  for (let i = 0; i < allBgLayers.length; i++) {
    const l = allBgLayers[i]
    if (l.userData.param === param && l.visible) {
      currentState = l.userData.state
      break
    }
  }
  // Loop round and diactivation currentState, activate currentSate+-1
  if (currentState !== undefined) {
    const desiredState = forward ? currentState + 1 : currentState - 1
    console.log(
      'rollBackgroundParamState',
      param,
      forward ? 'forward' : 'backwards',
      currentState,
      '->',
      desiredState
    )
    for (let i = 0; i < allBgLayers.length; i++) {
      const l = allBgLayers[i]
      if (l.userData.param === param) {
        if (l.userData.state === desiredState) {
          l.visible = true
        } else {
          l.visible = false
        }
      }
    }
  }
}
const clearBackgroundParam = param => {
  // console.log('clearBackgroundParam', param)
  const bgLayers = window.currentField.backgroundLayers.children.filter(
    l => l.userData.param === param
  )
  bgLayers.map(l => (l.visible = false))
}
const clearBackgroundDepth = (layerId, z) => {
  console.log('clearBackgroundDepth', layerId, z)
  const bgLayers = window.currentField.backgroundLayers.children.filter(
    l => l.userData.layerId === layerId
  )
  console.log('clearBackgroundDepth bgLayers', bgLayers)
  for (let i = 0; i < bgLayers.length; i++) {
    const layer = bgLayers[i]
    layer.userData.z = z

    // Calculate distance
    const distance = layer.userData.z / window.currentField.metaData.bgZDistance
    const bgVector = new THREE.Vector3().lerpVectors(
      window.currentField.fieldCamera.position,
      window.currentField.cameraTarget,
      distance
    )

    // Apply sizing adjustment
    const vH =
      Math.tan(
        THREE.Math.degToRad(
          window.currentField.fieldCamera.getEffectiveFOV() / 2
        )
      ) *
      distance *
      2
    const vW = vH * window.currentField.fieldCamera.aspect
    const geometry = new THREE.PlaneBufferGeometry(vW, vH)
    layer.geometry.dispose()
    layer.geometry = geometry // Requires any 'needUpdate' param?

    // Adjust position
    layer.position.set(bgVector.x, bgVector.y, bgVector.z)
  }
}
const scrollBackground = (layerId, xSpeed, ySpeed) => {
  const layers = window.currentField.backgroundLayers.children.filter(
    l => l.userData.layerId === layerId
  )
  // Identify the layers, duplicate and add meta info
  console.log('scrollBackground', layerId, xSpeed, ySpeed, layers)
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    if (layer.userData.scroll === undefined) {
      // Duplicate in all directions
      // console.log('scrollBackground layer', layer)
      layer.scale.x = 3
      layer.scale.y = 3
      layer.material.map.wrapS = THREE.RepeatWrapping
      layer.material.map.wrapT = THREE.RepeatWrapping
      layer.material.map.repeat.x = 3
      layer.material.map.repeat.y = 3
      layer.material.map.center.x = 0.5
      layer.material.map.center.y = 0.5
      layer.material.map.matrixAutoUpdate = true
      layer.material.map.needsUpdate = true
    }
    layer.userData.scroll = true
    layer.userData.scrollSpeedX = xSpeed
    layer.userData.scrollSpeedY = ySpeed
    layer.userData.scrollInitialX = layer.position.x
    layer.userData.scrollInitialY = layer.position.y
    layer.userData.scrollInitialZ = layer.position.z
  }
  // Field render loop will move the scene objects and reset x/y position if hit boundary
}
const BG_SCROLL_FACTOR = 0.00266 // seems to match fairly well on ztruck
const updateBackgroundScolling = delta => {
  // console.log('scrollBackground updateBackgroundScolling', delta)
  if (window.currentField.backgroundLayers.children) {
    const layers = window.currentField.backgroundLayers.children
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i]
      if (layer.userData.scrollSpeedX) {
        // console.log('scrollBackground x', layer.material.map.center.x, layer.userData.scrollSpeedX * delta * BG_SCROLL_FACTOR)
        layer.material.map.center.x =
          layer.material.map.center.x -
          layer.userData.scrollSpeedX * delta * BG_SCROLL_FACTOR
      }
      if (layer.userData.scrollSpeedY) {
        // console.log('scrollBackground y', layer.material.map.center.y, layer.userData.scrollSpeedY * delta * BG_SCROLL_FACTOR)
        layer.material.map.center.y =
          layer.material.map.center.y -
          layer.userData.scrollSpeedY * delta * BG_SCROLL_FACTOR
      }
    }
  }
}
const initLayer2Parallax = layer => {
  console.log('initLayer2Parallax', layer)
  layer.scale.x = 3
  layer.scale.y = 3
  layer.material.map.wrapS = THREE.RepeatWrapping
  layer.material.map.wrapT = THREE.RepeatWrapping
  layer.material.map.repeat.x = 3
  layer.material.map.repeat.y = 3
  layer.material.map.center.x = 0.5 // + (0.6 / 3.59)
  layer.material.map.center.y = 0.5
  layer.material.map.matrixAutoUpdate = true
  layer.material.map.needsUpdate = true
  layer.userData.parallaxRange = {
    low: 0.5 - (1 * layer.userData.parallaxRatio) / 3.59,
    high: 0.5 + (1 * layer.userData.parallaxRatio) / 3.59
  }
}
const updateLayer2Parallax = (
  maxAdjustedX,
  adjustedX,
  maxAdjustedY,
  adjustedY
) => {
  console.log(
    'updateLayer2Parallax: START',
    maxAdjustedX,
    adjustedX,
    maxAdjustedY,
    adjustedY
  )
  const layers = window.currentField.backgroundLayers.children
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    if (layer.userData.parallaxDirection === 'horizontal') {
      adjustedX = Math.min(adjustedX, maxAdjustedX)
      adjustedX = Math.max(adjustedX, 0)
      const percent = adjustedX / maxAdjustedX
      // TODO: for some fields (midgal), you actually go outside of the 'edge' eg y=120 is the highest you'd normally display
      const center =
        layer.userData.parallaxRange.low +
        percent *
          (layer.userData.parallaxRange.high - layer.userData.parallaxRange.low)
      console.log('updateLayer2Parallax: HORIZONTAL', percent, center)

      layer.material.map.center.x = center
    }
    if (layer.userData.parallaxDirection === 'vertical') {
      adjustedY = Math.min(adjustedY, maxAdjustedY)
      adjustedY = Math.max(adjustedY, 0)
      const percent = adjustedY / maxAdjustedY
      const center =
        layer.userData.parallaxRange.high -
        percent *
          (layer.userData.parallaxRange.high - layer.userData.parallaxRange.low)
      console.log('updateLayer2Parallax: VERTICAL', percent, center)
      layer.material.map.center.y = center
    }
  }
}
const drawWalkmesh = () => {
  // Draw triangles for walkmesh
  const triangles = window.currentField.data.walkmeshSection.triangles
  const numTriangles = triangles.length

  window.currentField.walkmeshLines = new THREE.Group()
  window.currentField.walkmeshMesh = new THREE.Group()

  for (let i = 0; i < numTriangles; i++) {
    const triangle = window.currentField.data.walkmeshSection.triangles[i]
    const accessor = window.currentField.data.walkmeshSection.accessors[i]
    const walkmeshLinePositions = [[], [], []]
    walkmeshLinePositions[0].push(
      triangle.vertices[0].x / 4096,
      triangle.vertices[0].y / 4096,
      triangle.vertices[0].z / 4096
    )
    walkmeshLinePositions[0].push(
      triangle.vertices[1].x / 4096,
      triangle.vertices[1].y / 4096,
      triangle.vertices[1].z / 4096
    )

    walkmeshLinePositions[1].push(
      triangle.vertices[1].x / 4096,
      triangle.vertices[1].y / 4096,
      triangle.vertices[1].z / 4096
    )
    walkmeshLinePositions[1].push(
      triangle.vertices[2].x / 4096,
      triangle.vertices[2].y / 4096,
      triangle.vertices[2].z / 4096
    )

    walkmeshLinePositions[2].push(
      triangle.vertices[2].x / 4096,
      triangle.vertices[2].y / 4096,
      triangle.vertices[2].z / 4096
    )
    walkmeshLinePositions[2].push(
      triangle.vertices[0].x / 4096,
      triangle.vertices[0].y / 4096,
      triangle.vertices[0].z / 4096
    )

    for (let i = 0; i < walkmeshLinePositions.length; i++) {
      const walkmeshLineGeo = new THREE.BufferGeometry()
      walkmeshLineGeo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(walkmeshLinePositions[i], 3)
      )
      const lineColor = accessor[i] === -1 ? 0x4488cc : 0x888888
      const material1 = new THREE.LineBasicMaterial({ color: lineColor })
      const line = new THREE.Line(walkmeshLineGeo, material1)
      window.currentField.walkmeshLines.add(line)
    }

    // positions for mesh buffergeo
    const walkmeshPositions = []
    walkmeshPositions.push(
      triangle.vertices[0].x / 4096,
      triangle.vertices[0].y / 4096,
      triangle.vertices[0].z / 4096
    )
    walkmeshPositions.push(
      triangle.vertices[1].x / 4096,
      triangle.vertices[1].y / 4096,
      triangle.vertices[1].z / 4096
    )
    walkmeshPositions.push(
      triangle.vertices[2].x / 4096,
      triangle.vertices[2].y / 4096,
      triangle.vertices[2].z / 4096
    )
    const walkmeshGeo = new THREE.BufferGeometry()
    walkmeshGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(walkmeshPositions, 3)
    )
    const walkmeshMaterial = new THREE.MeshBasicMaterial({
      color: 0x2194ce,
      opacity: 0.2,
      transparent: true,
      side: THREE.DoubleSide
    })
    const walkmeshMeshTriangle = new THREE.Mesh(walkmeshGeo, walkmeshMaterial)
    walkmeshMeshTriangle.userData.triangleId = i
    walkmeshMeshTriangle.userData.movementAllowed = true
    window.currentField.walkmeshMesh.add(walkmeshMeshTriangle)
  }
  window.currentField.fieldScene.add(window.currentField.walkmeshLines)

  // Draw mesh for walkmesh
  // let geometry = new THREE.BufferGeometry();
  // geometry.setAttribute('position', new THREE.Float32BufferAttribute(walkmeshPositions, 3))
  // let material = new THREE.MeshBasicMaterial({ color: 0x2194CE, opacity: 0.2, transparent: true, side: THREE.DoubleSide })
  // window.currentField.walkmeshMesh = new THREE.Mesh(geometry, material)
  window.currentField.walkmeshMesh.visible = window.config.debug.showWalkmeshMesh
  window.currentField.fieldScene.add(window.currentField.walkmeshMesh)

  // Draw gateways

  window.currentField.positionHelpers = new THREE.Group()
  window.currentField.gatewayLines = new THREE.Group()
  for (let i = 0; i < window.currentField.data.triggers.gateways.length; i++) {
    const gateway = window.currentField.data.triggers.gateways[i]
    const lv0 = gateway.exitLineVertex1
    const lv1 = gateway.exitLineVertex2
    const v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096)
    const v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096)

    const gatewayPositions = []
    gatewayPositions.push(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096)
    gatewayPositions.push(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096)
    const gatewayPositionsGeo = new THREE.BufferGeometry()
    gatewayPositionsGeo.setAttribute('position', new THREE.Float32BufferAttribute(gatewayPositions, 3))
    const gatewayMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
    const gatewayLine = new THREE.Line(gatewayPositionsGeo, gatewayMaterial)
    window.currentField.gatewayLines.add(gatewayLine)

    // Gateway position helpers
    // Not all position helper are the midpoint of the gateway, these are drawn
    // seperately with coordinates from window.currentField.data.triggers.gatewayArrows
    if (gateway.showArrow) {
      const gatewayPositionHelperVector = new THREE.Vector3().lerpVectors(
        v0,
        v1,
        0.5
      )
      drawArrowPositionHelper(gatewayPositionHelperVector, 1)
    }
  }
  window.currentField.fieldScene.add(window.currentField.gatewayLines)

  // Draw triggers / doors
  window.currentField.triggerLines = new THREE.Group()
  window.currentField.data.triggers.triggers = window.currentField.data.triggers.triggers.filter(
    t =>
      !(
        t.cornerVertex1.x === 0 &&
        t.cornerVertex1.y === 0 &&
        t.cornerVertex1.z === 0
      )
  )
  // for some reason there are a lots of 0,0,0 triggers, remove them for now
  for (const trigger of window.currentField.data.triggers.triggers) {
    const lv0 = trigger.cornerVertex1
    const lv1 = trigger.cornerVertex2
    const triggerMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })

    const triggerPositions = []
    triggerPositions.push(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096)
    triggerPositions.push(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096)
    const triggerPositionsGeo = new THREE.BufferGeometry()
    triggerPositionsGeo.setAttribute('position', new THREE.Float32BufferAttribute(triggerPositions, 3))
    const triggerLine = new THREE.Line(triggerPositionsGeo, triggerMaterial)
    window.currentField.triggerLines.add(triggerLine)
  }
  window.currentField.fieldScene.add(window.currentField.triggerLines)

  // Placeholder for OP CODE based lineLines
  window.currentField.lineLines = new THREE.Group()
  window.currentField.fieldScene.add(window.currentField.lineLines)

  if (!window.config.debug.showWalkmeshLines) {
    window.currentField.walkmeshLines.visible =
      window.config.debug.showWalkmeshLines
    window.currentField.gatewayLines.visible =
      window.config.debug.showWalkmeshLines
    window.currentField.triggerLines.visible =
      window.config.debug.showWalkmeshLines
    window.currentField.lineLines.visible =
      window.config.debug.showWalkmeshLines
  }

  window.currentField.movementHelpers = new THREE.Group()
  window.currentField.fieldScene.add(window.currentField.movementHelpers)
  if (!window.config.debug.showMovementHelpers) {
    window.currentField.movementHelpers.visible =
      window.config.debug.showMovementHelpers
  }
}

const placeBG = async fieldName => {
  const assetDimensions = await getFieldDimensions(fieldName)
  // Create meta-data
  window.currentField.metaData = {
    assetDimensions,
    width: assetDimensions.width / window.config.sizing.width,
    height: assetDimensions.height / window.config.sizing.height,
    bgScale: 1, // assetDimensions.height / window.config.sizing.height,
    adjustedFOV:
      window.currentField.fieldCamera.fov *
      (assetDimensions.height / window.config.sizing.height),
    cameraUnknown: window.currentField.data.cameraSection.cameras[0].unknown,
    cameraUnknownString: window.currentField.data.cameraSection.cameras[0].unknown + ' - ' + dec2hexPairs(window.currentField.data.cameraSection.cameras[0].unknown),
    modelScale: window.currentField.data.model.header.modelScale,
    scaleDownValue: getModelScaleDownValue(),
    numModels: window.currentField.data.model.header.numModels,
    layersAvailable: window.currentField.backgroundData !== undefined,
    bgZDistance: 1024,
    fieldCoordinates: { x: 0, y: 0 } // Defaults, will be updated
  }
  // console.log('window.currentField.metaData', window.currentField.metaData)

  // Rescale renderer and cameras for scene
  window.anim.renderer.setSize(
    assetDimensions.width *
      window.config.sizing.factor *
      window.currentField.metaData.bgScale,
    assetDimensions.height *
      window.config.sizing.factor *
      window.currentField.metaData.bgScale
  )
  window.currentField.fieldCamera.aspect =
    assetDimensions.width / assetDimensions.height
  window.currentField.fieldCamera.fov = window.currentField.metaData.adjustedFOV
  window.currentField.fieldCamera.lookAt(window.currentField.cameraTarget)
  window.currentField.fieldCamera.updateProjectionMatrix()
  window.currentField.debugCamera.aspect =
    assetDimensions.width / assetDimensions.height
  window.currentField.debugCamera.fov = window.currentField.metaData.adjustedFOV
  window.currentField.fieldCamera.lookAt(window.currentField.cameraTarget)
  window.currentField.debugCamera.updateProjectionMatrix()

  // Draw backgrounds
  // let lookAtDistance = window.currentField.fieldCamera.position.distanceTo(window.currentField.cameraTarget)
  // console.log('lookAtDistance', lookAtDistance, lookAtDistance * 4096)
  // let intendedDistance = 1
  window.currentField.backgroundLayers = new THREE.Group()
  window.currentField.fieldScene.add(window.currentField.backgroundLayers)

  return new Promise((resolve, reject) => {
    console.log('processBG Loading start')
    const manager = new THREE.LoadingManager()
    loadPalettes(fieldName, manager)
    processPalettes()
    for (let i = 0; i < window.currentField.backgroundData.layers.length; i++) {
      const layerData = window.currentField.backgroundData.layers[i]
      processBG(layerData, fieldName, manager)
    }
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      // const progress = itemsLoaded / itemsTotal
      // console.log('processBG progress', progress)
      // setLoadingProgress(progress)
      // TODO - Should really refactor and include this in the loading progress along with the models etc
    }
    manager.onLoad = function () {
      console.log('processBG Loading complete')
      resolve()
    }
  })
}

const processBG = (layerData, fieldName, manager) => {
  if (layerData.depth === 0) {
    layerData.depth = 1
  }
  if (layerData.z <= 10) {
    // z = doesn't show, just set it slightly higher for now
    layerData.z = layerData.z + 10
  }
  if (layerData.layerID === 3) {
    // Always in front
    layerData.z = 9
  }
  if (layerData.layerID === 2) {
    // Always behind
    layerData.z = 5000
  }
  if (layerData.layerID === 0) {
    // Seems to be before layerID 1 (variable z's)
    // layer.z = 10
  }
  // If layer containers a param, make sure it sits infront of its default background - Not entirely sure if this is right, need to check with different triggers and switches
  if (layerData.param > 0) {
    layerData.z = layerData.z - 1
  }
  const visible = layerData.param === 0 // By default hide all non zero params, field op codes will show them

  // For some reason I added this when implementing the custom shader, but it breaks things, reverting
  // const bgDistance = (intendedDistance * (layer.z / 4096)) // First attempt at ratios, not quite right but ok
  // const bgDistance = (layerData.z - layerData.paletteId / 1) / window.currentField.metaData.bgZDistance // First attempt at ratios, not quite right but ok
  // const bgDistance = (layerData.z - (layerData.paletteId / 10)) / window.currentField.metaData.bgZDistance // First attempt at ratios, not quite right but ok
  const bgDistance = (layerData.z / window.currentField.metaData.bgZDistance) // - (layerData.paletteId / 1000) // First attempt at ratios, not quite right but ok
  // console.log('Layer', layer, bgDistance)

  const userData = {
    z: layerData.z,
    param: layerData.param,
    state: layerData.state,
    typeTrans: layerData.typeTrans,
    layerId: layerData.layerID,
    paletteId: layerData.paletteId
  }
  if (layerData.parallaxDirection !== undefined) {
    userData.parallaxDirection = layerData.parallaxDirection
    userData.parallaxRatio = layerData.parallaxRatio
  }
  const bgVector = new THREE.Vector3().lerpVectors(
    window.currentField.fieldCamera.position,
    window.currentField.cameraTarget,
    bgDistance
  )
  drawBG(
    fieldName,
    bgVector.x,
    bgVector.y,
    bgVector.z,
    bgDistance,
    window.currentField.backgroundLayers,
    visible,
    userData,
    manager,
    layerData
  )
}

const loadPalettes = (fieldName, manager) => {
  window.currentField.backgroundData.palettes = { textures: [], textureList: [], data: [], dataTextures: [] }
  for (let i = 0; i < window.currentField.backgroundData.paletteCount; i++) {
    const bgPaletteUrl = getFieldBGPaletteUrl(fieldName, i)
    console.log('palettes', i, bgPaletteUrl)
    const texture = new THREE.TextureLoader(manager).load(bgPaletteUrl)
    window.currentField.backgroundData.palettes.textures.push(texture)
  }
}
const processPalettes = () => {
  // for (let i = 0; i < window.currentField.backgroundData.paletteCount; i++) {
  //   const texture = window.currentField.backgroundData.palettes.textures[i]
  //   console.log('palettes - processing', i, texture)
  // }
  for (let i = 0; i < window.currentField.backgroundData.paletteCount; i++) {
    const paletteInfos = window.currentField.data.palette.pages[i]
    const paletteData = []
    const data = new Uint8Array(4 * 256)
    for (let j = 0; j < paletteInfos.length; j++) {
      const paletteInfo = paletteInfos[j]
      // console.log('palettes - processing', i, j)
      paletteData.push(new THREE.Vector4(paletteInfo.r / 255, paletteInfo.g / 255, paletteInfo.b / 255, paletteInfo.a / 255))
      data[j * 4 + 0] = paletteInfo.r
      data[j * 4 + 1] = paletteInfo.g
      data[j * 4 + 2] = paletteInfo.b
      data[j * 4 + 3] = paletteInfo.a
    }
    const paletteTexture = new THREE.DataTexture(data, 256, 1, THREE.RGBAFormat)
    window.currentField.backgroundData.palettes.textureList[i] = paletteData
    window.currentField.backgroundData.palettes.dataTextures[i] = paletteTexture
  }
}

// https://wikisquare-ffdream-com.translate.goog/ff7/technique/field/bg?_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en-GB

const fieldVertexShader = () => {
  return `
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;
}`
}

// TODO - Add this logic in the shader
// if (paletteItem.isBlack && flevel.palette.pages[tile.paletteId] && flevel.palette.pages[tile.paletteId][0]) {
//   const paletteFirstColor = Object.assign({}, flevel.palette.pages[tile.paletteId][0])
//   paletteFirstColor.isBlack = isBlack(paletteFirstColor)
//   paletteFirstColor.type = 'first'
//   paletteItem = paletteFirstColor
// }
// if (ignoreFirstPixel) {
//   if (shallPrintDebug(posX, posY, setBlackBackground)) {
//     console.log('ignoreFirstPixel', paletteItem)
//   }
//   paletteItem.noRender = 1 // eg, don't render show
// }
const fieldFragmentShader = () => {
  return `
uniform int paletteSize;
uniform int useFirstPixel;
uniform sampler2D palette;
uniform sampler2D pixels;
uniform vec4[256] paletteList;
varying vec2 vUv;

vec4 getPixelColorFromPalette (vec2 vUv, sampler2D pixels, sampler2D palette, int paletteSize, vec4[256] paletteList, int useFirstPixel) {
  vec4 pixelColor = texture2D(pixels, vUv);
  float paletteIndex = pixelColor.x * 255.0;
  // vec4 color = texture2D(palette, vec2(1.0 / float(paletteSize) * paletteIndex,0.5));
  vec4 color = texture2D(palette, vec2((1.0 / float(paletteSize)) * paletteIndex + (1.0/float(paletteSize*2)),0.5));
  // vec4 color = paletteList[int(paletteIndex)];
  // vec2 uv2 = (vec2(paletteIndex, 0) + .5) / vec2(paletteSize, 1);
  // vec4 color = texture(palette, uv2);

  if (useFirstPixel == 1 && paletteIndex == 0.0) {
    color.a = 0.0;
  } else if(color.r == 0.0 && color.g == 0.0 && color.b == 0.0) {
    color = texture2D(palette, vec2((1.0 / float(paletteSize)) * 0.0 + (1.0/float(paletteSize*2)),0.5));
  }
  return color;
}

void main() {

  //gl_FragColor = texture2D(palette, vUv);

  gl_FragColor = getPixelColorFromPalette( vUv, pixels, palette, paletteSize, paletteList, useFirstPixel );
}`
}

// https://dangarfield.github.io/kujata-webapp/scene-details/md1_2
// https://dangarfield.github.io/kujata-webapp/field-op-code-details/eb
// https://dangarfield.github.io/kujata-webapp/field-op-code-details/ec
// https://dangarfield.github.io/kujata-webapp/field-op-code-details/e9

const drawBG = async (
  fieldName,
  x,
  y,
  z,
  distance,
  backgroundLayersGroup,
  visible,
  userData,
  manager,
  layerData
) => {
  let vH =
    Math.tan(
      THREE.Math.degToRad(window.currentField.fieldCamera.getEffectiveFOV() / 2)
    ) *
    distance *
    2
  let vW = vH * window.currentField.fieldCamera.aspect

  if (userData.parallaxDirection === 'horizontal') {
    vW = vW * userData.parallaxRatio
  }
  if (userData.parallaxDirection === 'vertical') {
    vH = vH * userData.parallaxRatio
  }
  if (userData.z !== 1124) {
    // return
  }
  const geometry = new THREE.PlaneBufferGeometry(vW, vH)
  console.log('drawBG', distance, '->', vH, vW, userData, layerData.fileName, geometry.uuid)

  let material
  if (USE_CUSTOM_SHADER) {
    const bgPixelUrl = getFieldBGPixelLayerUrl(fieldName, layerData.fileName)
    const texture = new THREE.TextureLoader(manager).load(bgPixelUrl)
    texture.magFilter = THREE.NearestFilter
    // texture.minFilter = THREE.LinearFilter

    const uniforms = {
      w: {
        value: window.currentField.metaData.assetDimensions.width
      },
      h: {
        value: window.currentField.metaData.assetDimensions.height
      },
      useFirstPixel: {
        value: window.currentField.data.background.palette.ignoreFirstPixel[userData.paletteId]
      },
      paletteSize: {
        value: 256
      },
      paletteList: {
        value: window.currentField.backgroundData.palettes.textureList[userData.paletteId]
      },
      palette: {
        value: window.currentField.backgroundData.palettes.textures[userData.paletteId]
      },
      pixels: {
        value: texture
      }
    }
    // console.log('palettes uniforms', uniforms)
    material = new THREE.ShaderMaterial({
      uniforms,
      fragmentShader: fieldFragmentShader(),
      vertexShader: fieldVertexShader()
    })
    material.transparent = true
    // material = new THREE.MeshBasicMaterial({
    //   map: texture,
    //   transparent: true
    // })
  } else {
    const bgImgUrl = getFieldBGLayerUrl(fieldName, layerData.fileName)

    const texture = new THREE.TextureLoader(manager).load(bgImgUrl)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.LinearFilter

    material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    })
  }

  const plane = new THREE.Mesh(geometry, material)
  plane.position.set(x, y, z)
  plane.lookAt(window.currentField.fieldCamera.position)
  plane.setRotationFromEuler(window.currentField.fieldCamera.rotation)
  plane.visible = visible
  plane.userData = userData

  if (userData.typeTrans === 1) {
    // console.log('typeTrans', userData.typeTrans, bgImgUrl)
    plane.material.blending = THREE.AdditiveBlending // md1_2, mds5_1
    // plane.visible = false
  } else if (userData.typeTrans === 2) {
    // console.log('typeTrans', userData.typeTrans, bgImgUrl)
    plane.material.blending = THREE.SubtractiveBlending // Not right at all. // jtempl, trnad_1, bugin1a
    // plane.visible = false
  } else if (userData.typeTrans === 3) {
    // console.log('typeTrans', userData.typeTrans, bgImgUrl)
    plane.material.blending = THREE.AdditiveBlending // md1_2, mds5_1 // 25% of colours are cut in bg image already
  }

  // if (userData.layerId === 1) {
  //   plane.visible = false
  // } else {
  //   plane.visible = true
  // }
  backgroundLayersGroup.add(plane)
  if (userData.layerId === 2) {
    initLayer2Parallax(plane)
  }
}
const ensureTempPalette = () => {
  if (!window.data.TEMP_PALETTE) {
    window.data.TEMP_PALETTE = []
  }
}
const updateLayersWithPaletteChange = (paletteId) => {
  const layers = window.currentField.backgroundLayers.children.filter(c => c.userData.paletteId === 11)
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    const paletteData = window.currentField.backgroundData.palettes.textureList[paletteId]
    // TODO - complete this once dataTextures are working
  }
}
const storePalette = (paletteId, tempPaletteId, start, size) => {
  ensureTempPalette()
  const paletteData = window.currentField.backgroundData.palettes.textureList[paletteId]
  window.data.TEMP_PALETTE[tempPaletteId] = []
  let tempIndex = 0
  for (let i = start; i < start + size; i++) {
    window.data.TEMP_PALETTE[tempPaletteId][tempIndex] = paletteData[i]
    tempIndex++
  }
  console.log('storePalette', paletteId, tempPaletteId, start, size, paletteData, window.data.TEMP_PALETTE)
}
const loadPalette = (paletteId, tempPaletteId, start, size) => {
  ensureTempPalette()
  // tempPaletteId = tempPaletteId - 10 // temp
  // console.log('loadPalette', paletteId, tempPaletteId, start, size, window.data.TEMP_PALETTE[tempPaletteId])
  const paletteData = window.currentField.backgroundData.palettes.textureList[paletteId]
  for (let tempIndex = 0; tempIndex < size; tempIndex++) {
    // console.log('loadPalette', tempPaletteId, tempIndex, window.data.TEMP_PALETTE[tempPaletteId])
    if (window.data.TEMP_PALETTE[tempPaletteId]) {
      paletteData[start + tempIndex] = window.data.TEMP_PALETTE[tempPaletteId][tempIndex]
    }
  }
  updateLayersWithPaletteChange(paletteId)
  // console.log('loadPalette', paletteId, tempPaletteId, start, size, paletteData, window.data.TEMP_PALETTE[tempPaletteId][0])
  // Also apply the uniforms palette changes to the layers that have the paletteId
}
const addPalette = (sourceTempPaletteId, targetTempPaletteId, r, g, b, size) => {
  // console.log('addPalette', sourceTempPaletteId, targetTempPaletteId, r, g, b, size)
  window.data.TEMP_PALETTE[targetTempPaletteId] = []
  for (let i = 0; i < window.data.TEMP_PALETTE[sourceTempPaletteId].length; i++) {
    const source = window.data.TEMP_PALETTE[sourceTempPaletteId][i]
    const target = new THREE.Vector4(source.x + r / 255, source.y + g / 255, source.z + b / 255, source.w) // TODO - Add ??? This is not right
    window.data.TEMP_PALETTE[targetTempPaletteId][i] = target
  }
}
export {
  changeBackgroundParamState,
  rollBackgroundParamState,
  clearBackgroundParam,
  clearBackgroundDepth,
  scrollBackground,
  updateBackgroundScolling,
  drawWalkmesh,
  placeBG,
  updateLayer2Parallax,
  storePalette,
  loadPalette,
  addPalette
}

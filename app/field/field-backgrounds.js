import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { getFieldDimensions, getFieldBGLayerUrl, getFieldBGPixelLayerUrl, getFieldBGPaletteUrl } from './field-fetch-data.js'
import { drawArrowPositionHelper } from './field-position-helpers.js'
import { getModelScaleDownValue } from './field-models.js'
import { dec2hexPairs } from '../helpers/helpers.js'
// window.THREE = THREE // For debug

const USE_CUSTOM_SHADER = false

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
    let desiredState = forward ? currentState + 1 : currentState - 1
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
    let bgVector = new THREE.Vector3().lerpVectors(
      window.currentField.fieldCamera.position,
      window.currentField.cameraTarget,
      distance
    )

    // Apply sizing adjustment
    let vH =
      Math.tan(
        THREE.Math.degToRad(
          window.currentField.fieldCamera.getEffectiveFOV() / 2
        )
      ) *
      distance *
      2
    let vW = vH * window.currentField.fieldCamera.aspect
    let geometry = new THREE.PlaneBufferGeometry(vW, vH)
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
  let triangles = window.currentField.data.walkmeshSection.triangles
  let numTriangles = triangles.length

  window.currentField.walkmeshLines = new THREE.Group()
  window.currentField.walkmeshMesh = new THREE.Group()

  for (let i = 0; i < numTriangles; i++) {
    let triangle = window.currentField.data.walkmeshSection.triangles[i]
    let accessor = window.currentField.data.walkmeshSection.accessors[i]
    let walkmeshLinePositions = [[], [], []]
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
      let lineColor = accessor[i] === -1 ? 0x4488cc : 0x888888
      let material1 = new THREE.LineBasicMaterial({ color: lineColor })
      const line = new THREE.Line(walkmeshLineGeo, material1)
      window.currentField.walkmeshLines.add(line)
    }

    // positions for mesh buffergeo
    let walkmeshPositions = []
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
    let lv0 = gateway.exitLineVertex1
    let lv1 = gateway.exitLineVertex2
    let v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096)
    let v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096)

    let gatewayPositions = []
    gatewayPositions.push(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096)
    gatewayPositions.push(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096)
    const gatewayPositionsGeo = new THREE.BufferGeometry()
    gatewayPositionsGeo.setAttribute('position', new THREE.Float32BufferAttribute(gatewayPositions, 3))
    let gatewayMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
    let gatewayLine = new THREE.Line(gatewayPositionsGeo, gatewayMaterial)
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
  for (let trigger of window.currentField.data.triggers.triggers) {
    let lv0 = trigger.cornerVertex1
    let lv1 = trigger.cornerVertex2
    let triggerMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })

    let triggerPositions = []
    triggerPositions.push(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096)
    triggerPositions.push(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096)
    const triggerPositionsGeo = new THREE.BufferGeometry()
    triggerPositionsGeo.setAttribute('position', new THREE.Float32BufferAttribute(triggerPositions, 3))
    let triggerLine = new THREE.Line(triggerPositionsGeo, triggerMaterial)
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
  let assetDimensions = await getFieldDimensions(fieldName)
  // Create meta-data
  window.currentField.metaData = {
    assetDimensions: assetDimensions,
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

  return new Promise(async (resolve, reject) => {
    console.log('processBG Loading start')
    const manager = new THREE.LoadingManager()
    loadPalettes(fieldName, manager)
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
      processPalettes()
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
  let visible = layerData.param === 0 // By default hide all non zero params, field op codes will how them

  // const bgDistance = (intendedDistance * (layer.z / 4096)) // First attempt at ratios, not quite right but ok
  const bgDistance = layerData.z / window.currentField.metaData.bgZDistance // First attempt at ratios, not quite right but ok
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
  let bgVector = new THREE.Vector3().lerpVectors(
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
  window.currentField.backgroundData.palettes = {textures: [], data: []}
  for (let i = 0; i < window.currentField.backgroundData.paletteCount; i++) {
    const bgPaletteUrl = getFieldBGPaletteUrl(fieldName, i)
    console.log('palettes', i, bgPaletteUrl)
    let texture = new THREE.TextureLoader(manager).load(bgPaletteUrl)
    window.currentField.backgroundData.palettes.textures.push(texture)
  }
}
const processPalettes = () => {
  for (let i = 0; i < window.currentField.backgroundData.paletteCount; i++) {
    const texture = window.currentField.backgroundData.palettes.textures[i]
    console.log('palettes - processing', i, texture)
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
uniform int w;
uniform int h;
uniform int paletteSize;
uniform int useFirstPixel;
uniform sampler2D palette;
uniform sampler2D pixels;
varying vec2 vUv;

vec4 getPixelColorFromPalette (int pixelIndex, int w, int h, vec2 xyPos, sampler2D pixels, sampler2D palette, int paletteSize) {
  vec4 pixelColor = texture2D(pixels, vec2(1.0 / float(w) * float(xyPos.x),1.0 / float(h) * float(xyPos.y)));
  float paletteIndex = pixelColor.x * 255.0;
  vec4 color = texture2D(palette, vec2(1.0 / float(paletteSize) * paletteIndex,0));
  if (useFirstPixel == 1 && paletteIndex == 0.0) {
    color.a = 0.0;
  } else if(color.r == 0.0 && color.g == 0.0 && color.b == 0.0) {
    //color.a = 0.0;
    color = texture2D(palette, vec2(1.0 / float(paletteSize) * paletteIndex,0));
  }
  return color;
}

void main() {
  float wF = float(w);
  float hF = float(h);

  vec2 xyPos = floor(vec2(vUv.x * wF,  vUv.y * hF));
  int pixelIndex = int((wF * xyPos.y) + (xyPos.x));
  gl_FragColor = getPixelColorFromPalette( pixelIndex, w, h, xyPos, pixels, palette, paletteSize );
}`
}

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
  let geometry = new THREE.PlaneBufferGeometry(vW, vH)
  console.log('drawBG', distance, '->', vH, vW, userData, layerData.fileName, geometry.uuid)

  let material
  if (USE_CUSTOM_SHADER) {
    const bgPixelUrl = getFieldBGPixelLayerUrl(fieldName, layerData.fileName)
    let texture = new THREE.TextureLoader(manager).load(bgPixelUrl)
    texture.magFilter = THREE.NearestFilter

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
      palette: {
        value: window.currentField.backgroundData.palettes.textures[userData.paletteId]
      },
      pixels: {
        value: texture
      }
    }

    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
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

    let texture = new THREE.TextureLoader(manager).load(bgImgUrl)
    texture.magFilter = THREE.NearestFilter

    material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    })
  }

  let plane = new THREE.Mesh(geometry, material)
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

  backgroundLayersGroup.add(plane)
  if (userData.layerId === 2) {
    initLayer2Parallax(plane)
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
  updateLayer2Parallax
}

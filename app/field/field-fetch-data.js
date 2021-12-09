import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js' // 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import { GLTFLoader } from '../../assets/threejs-r135-dg/examples/jsm/loaders/GLTFLoader.js' // 'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/loaders/GLTFLoader.js'
import { clone } from '../../assets/threejs-r135-dg/examples/jsm/utils/SkeletonUtils.js' // 'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/utils/SkeletonUtils.js'
import { KUJATA_BASE, getWindowTextures } from '../data/kernel-fetch-data.js'
import {
  setLoadingText,
  setLoadingProgress
} from '../loading/loading-module.js'
import { bindAnimationCompletion } from '../field/field-animations.js'
import { getRandomBlinkTime } from '../field/field-model-graphics-operations.js'

const textureLoader = new THREE.TextureLoader()

let chapters
const getFieldList = async () => {
  if (chapters === undefined) {
    const chaptersRes = await fetch(`${KUJATA_BASE}/metadata/chapters.json`)
    chapters = await chaptersRes.json()
  }
  // console.log('chapters', chapters)
  let fields = {}
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]
    // console.log('chapter', chapter)
    for (let j = 0; j < chapter.fieldNames.length; j++) {
      const fieldName = chapter.fieldNames[j]
      fields[fieldName] = fieldName
    }
  }
  return fields
}

const loadFieldData = async fieldName => {
  const res = await fetch(
    `${KUJATA_BASE}/data/field/flevel.lgp/${fieldName}.json`
  )
  const fieldData = await res.json()
  return fieldData
}
const loadFieldBackground = async fieldName => {
  const bgMetaRes = await fetch(
    `${KUJATA_BASE}/metadata/background-layers/${fieldName}/${fieldName}.json`
  )
  const bgMetaData = await bgMetaRes.json()
  // console.log('bgMetaData', bgMetaData)
  return bgMetaData
}
const createCombinedGLTF = (modelGLTF, animGLTF) => {
  // console.log("modelGLTF:", modelGLTF);
  // console.log("animGLTF:", animGLTF);
  let gltf1 = JSON.parse(JSON.stringify(modelGLTF)) // clone
  let gltf2 = JSON.parse(JSON.stringify(animGLTF)) // clone
  let numModelBuffers = gltf1.buffers.length
  let numModelBufferViews = gltf1.bufferViews.length
  let numModelAccessors = gltf1.accessors.length
  if (!gltf1.animations) {
    gltf1.animations = []
  }
  for (let buffer of gltf2.buffers) {
    gltf1.buffers.push(buffer)
  }
  for (let bufferView of gltf2.bufferViews) {
    bufferView.buffer += numModelBuffers
    gltf1.bufferViews.push(bufferView)
  }
  for (let accessor of gltf2.accessors) {
    accessor.bufferView += numModelBufferViews
    gltf1.accessors.push(accessor)
  }
  for (let animation of gltf2.animations) {
    for (let sampler of animation.samplers) {
      sampler.input += numModelAccessors
      sampler.output += numModelAccessors
    }
    gltf1.animations.push(animation)
  }
  // console.log("combinedGLTF:", gltf1)
  return gltf1
}
const loadModels = async modelLoaders => {
  // const t1 = new Date()
  let fieldModels = []

  setLoadingText('Loading...')
  for (let i = 0; i < modelLoaders.length; i++) {
    const modelLoader = modelLoaders[i]
    // Should probably make these fetches in parallel, another TODO
    let gltf = await loadFullFieldModel(modelLoader)
    gltf.userData['name'] = modelLoader.name
    gltf.userData['hrcId'] = modelLoader.hrcId
    gltf.userData['globalLight'] = modelLoader.globalLight

    // Do we still need to do clone because multiples of the same model are loaded?
    gltf.scene = clone(gltf.scene)
    gltf.mixer = new THREE.AnimationMixer(gltf.scene)
    bindAnimationCompletion(gltf)
    gltf.scene.userData.closeToTalk = false
    gltf.scene.userData.closeToCollide = false
    // console.log('Loaded GLTF', gltf, modelLoader)
    // modelLoader.gltf = gltf
    // window.currentField.fieldScene.add(gltf)

    fieldModels.push(gltf)
    const progress = (i + 1) / modelLoaders.length
    setLoadingProgress(progress)
  }
  // const t2 = new Date()
  // console.log('loadModels time', t2.getTime() - t1.getTime(), 'ms')
  return fieldModels
}
const loadFullFieldModel = async modelLoader => {
  // These models aren't cached, we really should cache them
  const modelGLTFRes = await fetch(
    `${KUJATA_BASE}/data/field/char.lgp/${modelLoader.hrcId.toLowerCase()}.gltf`,
    { cache: 'force-cache' }
  )
  let modelGLTF = await modelGLTFRes.json()
  // console.log('modelLoader', modewlLoader)
  for (let i = 0; i < modelLoader.animations.length; i++) {
    const animId = modelLoader.animations[i]
      .toLowerCase()
      .substring(0, modelLoader.animations[i].indexOf('.'))
    let animRes = await fetch(
      `${KUJATA_BASE}/data/field/char.lgp/${animId}.a.gltf`,
      { cache: 'force-cache' }
    )
    let animGLTF = await animRes.json()
    modelGLTF = createCombinedGLTF(modelGLTF, animGLTF)
  }
  return new Promise((resolve, reject) => {
    let loader = new GLTFLoader()
    loader.parse(
      JSON.stringify(modelGLTF),
      `${KUJATA_BASE}/data/field/char.lgp/`,
      async function (gltf) {
        addBlendingToMaterials(gltf)
        await addBlinkingToModel(modelLoader.hrcId.replace('.HRC', ''), gltf)
        // console.log("combined gltf:", gltf)
        resolve(gltf)
      }
    )
  })
}
const addBlendingToMaterials = (gltf) => {
  console.log('addBlendingToMaterials', gltf)
  gltf.scene.traverse(function (element) {
    if (element.type === 'Mesh' && element.material && element.material.userData && element.material.userData.BlendType) {
      console.log('element', element)
      switch (element.material.userData.BlendType) {
        case 'AdditiveBlending': element.material.blending = 2; break // This PROBABLY should take into account srcBlend & srcDest
        case 'SubtractiveBlending': element.material.blending = 3; break // Still a lot to do here, look at fiba -> https://youtu.be/1U39x6jNKoI?t=66
        case 'MultiplyBlending': element.material.blending = 4; break
        default: break
      }
    }
  })
}
const getTexture = (url, cb) => {
  return new Promise((resolve, reject) => {
    textureLoader.load(url,
      function (texture) {
        texture.flipY = false
        resolve(texture)
      }
    )
  })
}
const addBlinkingToModel = async (hrc, gltf) => {
  const blinkData = window.data.exe.blinkData[hrc]
  if (blinkData) { // TODO - Is this just these 10 models, or can any model blink, eg that use any of the eye textures on these 10 models
    const blinkTextures = []
    if (blinkData.leftEye) {
      blinkTextures.push(blinkData.leftEye)
      if (blinkData.rightEye) {
        blinkTextures.push(blinkData.rightEye)
      }
    }
    let textureCount = 0
    // console.log('addBlinkingToModel', hrc, blinkData, blinkTextures, gltf)

    const blinkMaterials = []
    gltf.scene.traverse(async function (element) {
      if (element.type === 'Mesh' && element.material.map && blinkTextures.length > textureCount) {
        const textureUrl = `${KUJATA_BASE}/data/field/flevel.lgp/textures/${blinkTextures[textureCount]}.tex.png`
        console.log('addBlinkingToModel element', element, blinkTextures[textureCount], textureUrl, element.material)
        element.material.userData.blink = {textureUrl}
        textureCount++
        blinkMaterials.push(element.material)
      }
    })
    if (blinkMaterials.length > 0) {
      for (let i = 0; i < blinkMaterials.length; i++) {
        const material = blinkMaterials[i]

        const texture = await getTexture(material.userData.blink.textureUrl)
        console.log('addBlinkingToModel texture', texture)
        material.userData.blink = {
          open: material.map, // Not sure if this is right
          closed: texture
        }
        material.userData.blink.open.image = material.map.image
        material.userData.blink.closed.image = texture.image

        // element.material.map.image = element.material.userData.blink.closed.image
        // material.map = material.userData.blink.open
        // material.map = material.userData.blink.closed
        // material.map = material.userData.blink.open

        // bindBlinkOperations(material)
        console.log('addBlinkingToModel texture', texture, material.userData.blink.open, material.userData.blink.closed, material.map)
      }
      gltf.scene.userData.blink = getRandomBlinkTime()
    }
    console.log('addBlinkingToModel END', hrc, gltf, gltf.scene.userData.blink)
  }
}
const getFieldDimensions = fieldName =>
  new Promise(resolve => {
    let url = `${KUJATA_BASE}/metadata/makou-reactor/backgrounds/${fieldName}.png`
    const img = new window.Image()
    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img
      resolve({ width, height })
    }
    img.src = url
  })
const getFieldBGLayerUrl = (fieldName, fileName) => {
  return `${KUJATA_BASE}/metadata/background-layers/${fieldName}/${fileName}`
}

const getAnimatedArrowPositionHelperTextures = type => {
  if (type === 2) {
    return [
      getWindowTextures().animated['marker green 1'].texture,
      getWindowTextures().animated['marker green 2'].texture,
      getWindowTextures().animated['marker green 3'].texture,
      getWindowTextures().animated['marker green 4'].texture
    ]
  } else {
    return [
      getWindowTextures().animated['marker red 1'].texture,
      getWindowTextures().animated['marker red 2'].texture,
      getWindowTextures().animated['marker red 3'].texture,
      getWindowTextures().animated['marker red 4'].texture
    ]
  }
}
const getCursorPositionHelperTexture = () => {
  return getWindowTextures().buttons['button pointer'].texture
}
const getDialogTextures = () => {
  const textures = getWindowTextures()
  return {
    bl: textures.borders['border bl'].texture,
    br: textures.borders['border br'].texture,
    tl: textures.borders['border tl'].texture,
    tr: textures.borders['border tr'].texture,

    t: textures.borders['border t'].texture,
    b: textures.borders['border b'].texture,
    l: textures.borders['border l'].texture,
    r: textures.borders['border r'].texture
  }
}

const getPointRight = () => {
  return getWindowTextures()['battle-menu']['point - right']
}
const getFieldDialogNumber = number => {
  return getWindowTextures()['clock'][`clock ${number}`]
}
const getFieldMapList = async () => {
  const res = await fetch(`${KUJATA_BASE}/data/field/flevel.lgp/maplist.json`)
  const mapList = await res.json()
  return mapList
}
export {
  getFieldList,
  loadFieldData,
  loadFieldBackground,
  loadModels,
  getFieldDimensions,
  getFieldBGLayerUrl,
  getAnimatedArrowPositionHelperTextures,
  getCursorPositionHelperTexture,
  getDialogTextures,
  getPointRight,
  getFieldDialogNumber,
  getFieldMapList
}

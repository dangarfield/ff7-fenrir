import { GLTFLoader } from '../../assets/threejs-r118/jsm/loaders/GLTFLoader.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/loaders/GLTFLoader.js'

const KUJATA_BASE = window.location.host.includes('localhost') ? 'kujata-data' : 'https://kujata-data-dg.netlify.app'

const getFieldList = async () => {
    let chaptersRes = await fetch(`${KUJATA_BASE}/metadata/chapters.json`)
    let chapters = await chaptersRes.json()
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

const loadFieldData = async (fieldName) => {
    const res = await fetch(`${KUJATA_BASE}/data/field/flevel.lgp/${fieldName}.json`)
    const fieldData = await res.json()
    return fieldData
}
const loadFieldBackground = async (fieldName) => {
    const bgMetaRes = await fetch(`${KUJATA_BASE}/metadata/background-layers/${fieldName}/${fieldName}.json`)
    const bgMetaData = await bgMetaRes.json()
    console.log('bgMetaData', bgMetaData)
    return bgMetaData
}
const createCombinedGLTF = (modelGLTF, animGLTF) => {
    // console.log("modelGLTF:", modelGLTF);
    // console.log("animGLTF:", animGLTF);
    let gltf1 = JSON.parse(JSON.stringify(modelGLTF)); // clone
    let gltf2 = JSON.parse(JSON.stringify(animGLTF));  // clone
    let numModelBuffers = gltf1.buffers.length;
    let numModelBufferViews = gltf1.bufferViews.length;
    let numModelAccessors = gltf1.accessors.length;
    if (!gltf1.animations) {
        gltf1.animations = [];
    }
    for (let buffer of gltf2.buffers) {
        gltf1.buffers.push(buffer);
    }
    for (let bufferView of gltf2.bufferViews) {
        bufferView.buffer += numModelBuffers;
        gltf1.bufferViews.push(bufferView);
    }
    for (let accessor of gltf2.accessors) {
        accessor.bufferView += numModelBufferViews;
        gltf1.accessors.push(accessor);
    }
    for (let animation of gltf2.animations) {
        for (let sampler of animation.samplers) {
            sampler.input += numModelAccessors;
            sampler.output += numModelAccessors;
        }
        gltf1.animations.push(animation);
    }
    // console.log("combinedGLTF:", gltf1)
    return gltf1;
}
const loadFullFieldModel = async (modelLoader) => {
    const modelGLTFRes = await fetch(`${KUJATA_BASE}/data/field/char.lgp/${modelLoader.hrcId.toLowerCase()}.gltf`)
    let modelGLTF = await modelGLTFRes.json()
    // console.log('modelLoader', modewlLoader)
    for (let i = 0; i < modelLoader.animations.length; i++) {
        const animId = modelLoader.animations[i].toLowerCase().substring(0, modelLoader.animations[i].indexOf('.'))
        let animRes = await fetch(`${KUJATA_BASE}/data/field/char.lgp/${animId}.a.gltf`)
        let animGLTF = await animRes.json()
        modelGLTF = createCombinedGLTF(modelGLTF, animGLTF)
    }
    return new Promise((resolve, reject) => {
        let loader = new GLTFLoader()
        loader.parse(JSON.stringify(modelGLTF), `${KUJATA_BASE}/data/field/char.lgp/`, function (gltf) {
            // console.log("combined gltf:", gltf)
            resolve(gltf)
        })
    })
}
const getFieldDimensions = fieldName => new Promise((resolve) => {
    let url = `${KUJATA_BASE}/metadata/makou-reactor/backgrounds/${fieldName}.png`
    const img = new Image()
    img.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = img
        resolve({ width, height })
    }
    img.src = url
})
const getFieldBGLayerUrl = (fieldName, fileName) => {
    return `${KUJATA_BASE}/metadata/background-layers/${fieldName}/${fileName}`
}

// const getFieldDimensions = async (fieldName) => {
//     let assetDimensions = await imageDimensions()
// }

export {
    getFieldList,
    loadFieldData,
    loadFieldBackground,
    loadFullFieldModel,
    getFieldDimensions,
    getFieldBGLayerUrl
}
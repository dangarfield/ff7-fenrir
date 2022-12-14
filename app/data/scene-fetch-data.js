import { KUJATA_BASE } from './kernel-fetch-data.js'
import { GLTFLoader } from '../../assets/threejs-r135-dg/examples/jsm/loaders/GLTFLoader.js'
import { addBlendingToMaterials } from '../field/field-fetch-data.js'

const loadSceneData = async () => {
  const sceneDataRes = await fetch(`${KUJATA_BASE}/data/battle/scene.bin/scene.bin.json`)
  const sceneData = await sceneDataRes.json()
  window.data.sceneData = sceneData
}
const loadSceneModel = async modelCode => {
  // These models aren't cached, we really should cache them
  const modelGLTFRes = await fetch(
    `${KUJATA_BASE}/data/battle/battle.lgp/${modelCode.toLowerCase()}.hrc.gltf`,
    { cache: 'force-cache' }
  )
  const modelGLTF = await modelGLTFRes.json()
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    console.log('battle loader', loader.textureLoader)

    loader.parse(
      JSON.stringify(modelGLTF),
      `${KUJATA_BASE}/data/battle/battle.lgp/`,
      async function (gltf) {
        console.log('battle parsed gltf:', gltf)
        addBlendingToMaterials(gltf)
        // console.log("combined gltf:", gltf)
        resolve(gltf)
      }
    )
  })
}

export { loadSceneData, loadSceneModel }

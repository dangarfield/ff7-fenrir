import { KUJATA_BASE } from './kernel-fetch-data.js'
import { GLTFLoader } from '../../assets/threejs-r148/examples/jsm/loaders/GLTFLoader.js'
import { addBlendingToMaterials } from '../field/field-fetch-data.js'

const loadBattleData = async () => {
  const sceneDataRes = await fetch(
    `${KUJATA_BASE}/data/battle/scene.bin/scene.bin.json`
  )
  const sceneData = await sceneDataRes.json()
  window.data.sceneData = sceneData

  window.data.battle = {}

  const camDataRes = await fetch(`${KUJATA_BASE}/data/battle/camdat.bin.json`)
  const camData = await camDataRes.json()
  window.data.battle.camData = camData

  const markDataRes = await fetch(`${KUJATA_BASE}/data/battle/mark.dat.json`)
  const markData = await markDataRes.json()
  window.data.battle.mark = markData

  // const allRows = []
  // const allRows2 = []
  // for (const scene of sceneData) {
  //   for (let i = 0; i < scene.battleFormations.length; i++) {
  //     const formation = scene.battleFormations[i]
  //     const setup = scene.battleSetup[i]
  //     // if (!allRows.includes(setup.initialCameraPosition))
  //     if ([57, 68, 69, 88].includes(setup.initialCameraPosition)) {
  //       console.log(
  //         'sceneData',
  //         scene,
  //         formation,
  //         setup,
  //         setup.initialCameraPosition
  //       )
  //     }
  //   }
  // }
  // const sorted = allRows.sort((a, b) => a - b)
  // console.log('sceneData all rows ', sorted)
  // console.log('sceneData all rows2 ', allRows2)
}
const loadSceneModel = async (modelCode, manager) => {
  // These models aren't cached, we really should cache them

  console.log('loading sceneModel', modelCode, 'START')
  const modelGLTFRes = await fetch(
    `${KUJATA_BASE}/data/battle/battle.lgp/${modelCode.toLowerCase()}.hrc.gltf`,
    { cache: 'force-cache' }
  )
  const modelGLTF = await modelGLTFRes.json()
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader(manager)
    console.log('battle loader', loader.textureLoader)

    loader.parse(
      JSON.stringify(modelGLTF),
      `${KUJATA_BASE}/data/battle/battle.lgp/`,
      async function (gltf) {
        console.log('battle parsed gltf:', gltf)
        addBlendingToMaterials(gltf)
        // console.log("combined gltf:", gltf)

        // Quick hack for smooth animations until we remove the duplicate frames in the gltfs
        for (const anim of gltf.animations) {
          for (const track of anim.tracks) {
            track.optimize()
          }
        }
        console.log('loading sceneModel', modelCode, 'END')
        resolve(gltf)
      }
    )
  })
}

export { loadBattleData, loadSceneModel }

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
  for (const scene of sceneData) {
    // for (let i = 0; i < scene.battleFormations.length; i++) {
    //   const formation = scene.battleFormations[i]
    //   const setup = scene.battleSetup[i]
    //   if (!allRows.includes(setup.initialCameraPosition)) {
    //     allRows.push(setup.initialCameraPosition)
    //   }
    //   if (
    //     [
    //       58, 59, 60, 61, 62, 63, 70, 71, 72, 73, 75, 77, 80, 81, 82, 83, 84,
    //       90, 91, 92, 93
    //     ].includes(setup.initialCameraPosition)
    //   ) {
    //     console.log(
    //       'sceneData',
    //       scene,
    //       formation,
    //       setup,
    //       setup.initialCameraPosition,
    //       scene.sceneId * 4 + i
    //     )
    //   }
    // }
    for (const attackData of scene.attackData) {
      const l = [
        26, 28, 28, 28, 29, 29, 29, 36, 36, 36, 37, 37, 37, 38, 38, 38, 39, 39,
        39, 40, 40, 40, 41, 41, 41, 46, 46, 46, 47, 47, 47, 54, 54, 54, 57, 57,
        57, 59, 59, 59, 72, 72, 72, 77, 77, 77, 78, 78, 78, 85, 85, 85, 86, 86,
        86, 88, 88, 88, 89, 89, 89, 90, 90, 90, 94, 94, 94, 96, 96, 96, 97, 97,
        97, 98, 98, 98, 103, 103, 103, 104, 104, 104, 106, 106, 106, 108, 108,
        108, 109, 109, 109, 114, 114, 114, 116, 116, 116, 118, 118, 118, 119,
        119, 119, 121, 121, 121, 123, 123, 123, 124, 124, 124, 125, 125, 125,
        126, 126, 126, 128, 128, 128, 129, 129, 129, 131, 131, 131, 133, 133,
        133, 144, 144, 144, 145, 145, 145, 146, 146, 146, 147, 147, 147, 150,
        150, 150, 152, 152, 152, 153, 153, 153, 159, 159, 159, 160, 160, 160,
        161, 161, 161, 162, 162, 162, 163, 163, 163, 164, 164, 164, 168, 168,
        168, 172, 172, 172, 180, 182, 182, 183, 185, 185, 189, 189, 189, 191,
        191, 193, 193, 195, 195, 208, 211, 211, 212, 212, 223, 223, 224, 224,
        230, 230, 245, 245, 246, 246, 251, 251, 252, 252, 274, 274, 280, 280,
        284, 284, 286, 286, 290, 290, 291, 291, 293, 294, 294, 296, 296, 297,
        297, 300, 300, 302, 307, 307, 308, 311, 311, 317, 318, 322, 322, 327,
        331, 331, 333, 333, 334, 334, 335, 335, 336, 336, 337, 337, 338, 340,
        344, 346, 347, 351, 352, 352, 353, 353, 355, 361, 361, 367, 367, 376,
        377, 377, 380, 380, 381, 381, 382, 382, 383, 383, 384, 386, 386, 389
      ]
      if (
        l.includes(attackData.cameraMovementIdSingleTargets) ||
        l.includes(attackData.cameraMovementIdMultipleTargets)
      ) {
        console.log(
          'sceneData',
          scene,
          scene.sceneId * 4,
          attackData.cameraMovementIdSingleTargets,
          attackData.cameraMovementIdMultipleTargets,
          attackData.name,
          attackData
        )
      }
    }
  }
  // const sorted = allRows.sort((a, b) => a - b)
  // console.log('sceneData all rows ', sorted)
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

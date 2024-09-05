import { KUJATA_BASE } from './kernel-fetch-data.js'
import { GLTFLoader } from '../../assets/threejs-r148/examples/jsm/loaders/GLTFLoader.js'
import { addBlendingToMaterials } from '../field/field-fetch-data.js'

const loadSceneData = async () => {
  const sceneDataRes = await fetch(
    `${KUJATA_BASE}/data/battle/scene.bin/scene.bin.json`
  )
  const sceneData = await sceneDataRes.json()
  window.data.sceneData = sceneData

  // const allRows = []
  // for (const scene of sceneData) {
  //   for (let i = 0; i < scene.battleFormations.length; i++) {
  //     const formation = scene.battleFormations[i]
  //     const setup = scene.battleSetup[i]
  //     const rows = []
  //     for (const enemy of formation) {
  //       if (enemy.row < 1000 && !rows.includes(enemy.row)) {
  //         rows.push(enemy.row)
  //       }
  //       if (enemy.row < 1000 && !allRows.includes(enemy.row)) {
  //         allRows.push(enemy.row)
  //       }
  //       if (enemy.coverFlags !== 0 && enemy.coverFlags !== 0xffff) {
  //         console.log(
  //           'sceneData',
  //           scene.sceneId,
  //           scene.sceneId * 4 + i,
  //           '-',
  //           enemy.enemyId,
  //           '-',
  //           enemy.coverFlags
  //         )
  //       }
  //     }
  //     // if (rows.length > 1) {
  //     //   console.log(
  //     //     'sceneData Multi row: ',
  //     //     scene.sceneId,
  //     //     scene.sceneId * 4 + i,
  //     //     '-',
  //     //     rows
  //     //   )
  //     // }
  //     // if (!rows.includes(1)) {
  //     //   console.log(
  //     //     'sceneData no row 1: ',
  //     //     scene.sceneId,
  //     //     scene.sceneId * 4 + i,
  //     //     '-',
  //     //     rows
  //     //   )
  //     // }
  //     // console.log('sceneData Multi row: ', scene.sceneId, rows)
  //   }
  // }
  // console.log('sceneData all rows ', allRows)
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

export { loadSceneData, loadSceneModel }

import { KUJATA_BASE } from './kernel-fetch-data.js'
import { GLTFLoader } from '../../assets/threejs-r148/examples/jsm/loaders/GLTFLoader.js'
import { addBlendingToMaterials } from '../field/field-fetch-data.js'

const battleTextures = {}
window.battleTextures = battleTextures
const getBattleTextures = (window.getBattleTextures = () => {
  return battleTextures
})

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

  const actionSequencesRes = await fetch(
    `${KUJATA_BASE}/data/battle/action-sequences.json`
  )
  const actionSequences = await actionSequencesRes.json()
  window.data.battle.actionSequences = actionSequences

  const actionSequenceMetadataPlayerRes = await fetch(
    `${KUJATA_BASE}/metadata/action-sequence-metadata-player.json`
  )
  const actionSequenceMetadataPlayer =
    await actionSequenceMetadataPlayerRes.json()
  window.data.battle.actionSequenceMetadataPlayer = actionSequenceMetadataPlayer

  window.data.battle.assets = {}
  const effects32Res = await fetch(
    `${KUJATA_BASE}/metadata/battle-assets/effects-32.json`
  )
  const effects32 = await effects32Res.json()
  const columns = effects32[Object.keys(effects32)[0]].count
  // console.log('EFFECTS', effects32, columns)
  const rows = Object.keys(effects32).length
  battleTextures.effects32 = {
    assets: effects32,
    texture: new THREE.TextureLoader().load(
      `${KUJATA_BASE}/metadata/battle-assets/effects-32.png`
    ),
    metadata: {
      columns,
      rows,
      frameWidth: 1 / columns,
      frameHeight: 1 / rows
    }
  }

  // const allRows = []
  for (const scene of sceneData) {
    // for (let i = 0; i < scene.battleFormations.length; i++) {
    //   const formation = scene.battleFormations[i]
    //   const setup = scene.battleSetup[i]
    //   if (!allRows.includes(setup.initialCameraPosition)) {
    //     allRows.push(setup.initialCameraPosition)
    //   }
    //   if ([58, 59].includes(setup.initialCameraPosition)) {
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
      const l = [26, 28]
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

export { loadBattleData, loadSceneModel, getBattleTextures }

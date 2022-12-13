import {
  setupScenes,
  startBattleRenderingLoop,
  scene,
  orthoScene
} from './battle-scene.js'
import { initBattleKeypressActions } from './battle-controls.js'
import { loadTempBattle2d } from './battle-2d.js'
import { importModels } from './battle-3d.js'
import { getBattleConfig } from './battle-setup.js'

let BATTLE_PROMISE

/*
https://gamefaqs.gamespot.com/ps/197341-final-fantasy-vii/faqs/77403
https://finalfantasy.fandom.com/wiki/Final_Fantasy_VII_battle_system
*/

const initBattleModule = () => {
  setupScenes()
  initBattleKeypressActions()
}

const cleanScene = () => {
  while (scene.children.length) {
    scene.remove(scene.children[0])
  }
  while (orthoScene.children.length) {
    orthoScene.remove(orthoScene.children[0])
  }
}

const loadBattle = async (battleId, options) => {
  const battleConfig = getBattleConfig(battleId) // TODO, add from random / world map etc
  console.log('loadBattle', battleId, options)
  // cleanScene()
  startBattleRenderingLoop()
  await importModels(battleConfig)
  await loadTempBattle2d(`${battleConfig.sceneId} - ${battleConfig.formationId}`)
  return new Promise(resolve => {
    BATTLE_PROMISE = resolve
  })
}

const resolveBattlePromise = () => {
  if (BATTLE_PROMISE) {
    BATTLE_PROMISE()
  }
}
export { initBattleModule, loadBattle, resolveBattlePromise }

import {
  setupScenes,
  startBattleRenderingLoop,
  sceneGroup
} from './battle-scene.js'
import { initBattleKeypressActions } from './battle-controls.js'
import { loadTempBattle2d } from './battle-2d.js'
import { importModels } from './battle-3d.js'
import { setupBattle } from './battle-setup.js'
import { initAllVariables } from './battle-memory.js'
import { initBattleQueue } from './battle-queue.js'
import { executeAllPreActionSetupScripts } from './battle-stack.js'
let BATTLE_PROMISE

/*
https://gamefaqs.gamespot.com/ps/197341-final-fantasy-vii/faqs/77403
https://finalfantasy.fandom.com/wiki/Final_Fantasy_VII_battle_system
*/

const initBattleModule = () => {
  setupScenes()
  initBattleKeypressActions()
}

const cleanSceneGroup = () => {
  while (sceneGroup.children.length) {
    sceneGroup.remove(sceneGroup.children[0])
  }
  // while (orthoScene.children.length) {
  //   orthoScene.remove(orthoScene.children[0])
  // }
}
const preLoadBattle = async (battleId, options) => {
  // console.log('battle preload: START')
  cleanSceneGroup()
  const currentBattle = setupBattle(battleId) // TODO, add from random / world map etc
  // console.log('loadBattle', battleId, options)
  await importModels(currentBattle)
  await loadTempBattle2d(`${currentBattle.sceneId} - ${currentBattle.formationId}`)

  initAllVariables()
  // TODO - Not sure if preActionSetup is done before every action or once before all actions
  await executeAllPreActionSetupScripts(currentBattle)
  initBattleQueue(currentBattle)

  // console.log('battle preload: END')
}
const loadBattle = async (battleId, options) => {
  // console.log('battle loadBattle: START')
  startBattleRenderingLoop()
  return new Promise(resolve => {
    BATTLE_PROMISE = resolve
  })
}

const resolveBattlePromise = () => {
  if (BATTLE_PROMISE) {
    BATTLE_PROMISE()
  }
}
export { initBattleModule, loadBattle, resolveBattlePromise, preLoadBattle }

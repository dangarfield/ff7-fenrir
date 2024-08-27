import {
  setupScenes,
  startBattleRenderingLoop,
  sceneGroup,
  BATTLE_TWEEN_GROUP
} from './battle-scene.js'
import { initBattleKeypressActions } from './battle-controls.js'
import { importModels } from './battle-3d.js'
import { setupBattle } from './battle-setup.js'
import { initAllVariables } from './battle-memory.js'
import { initBattleQueue } from './battle-queue.js'
import { executeAllInitScripts } from './battle-stack.js'
import { initBattleMenu } from './battle-menu.js'
import { setLoadingText, showLoadingScreen } from '../loading/loading-module.js'
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

  BATTLE_TWEEN_GROUP.removeAll()
  // while (orthoScene.children.length) {
  //   orthoScene.remove(orthoScene.children[0])
  // }
}
const preLoadBattle = async (battleId, options) => {
  setLoadingText('Loading battle...')
  showLoadingScreen(false)

  console.log('battle preload: START')
  cleanSceneGroup()

  const currentBattle = setupBattle(battleId) // TODO, add from random / world map etc
  // console.log('loadBattle', battleId, options)

  await importModels(currentBattle)
  // await loadTempBattle2d(`${currentBattle.sceneId} - ${currentBattle.formationId}`)

  currentBattle.memory = initAllVariables()
  initBattleQueue(currentBattle)
  await executeAllInitScripts(currentBattle)
  await initBattleMenu(currentBattle)

  console.log('battle preload: END')
}
const loadBattle = async (battleId, options) => {
  await preLoadBattle(battleId, options)
  console.log('battle loadBattle: START')
  if (!window.location.host.includes('localhost')) {
    window.alert('Placeholder battles - Press Y to skip') // TEMP - Need to remove
  }
  window.anim.clock.start()
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

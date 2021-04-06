import {
  setupScenes,
  startBattleRenderingLoop,
  scene,
  orthoScene
} from './battle-scene.js'
import { initBattleKeypressActions } from './battle-controls.js'
import { loadTempBattle2d } from './battle-2d.js'
import { loadTempBattle3d } from './battle-3d.js'

let BATTLE_PROMISE

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
  console.log('loadBattle', battleId, options)
  cleanScene()
  startBattleRenderingLoop()
  // Temp
  await loadTempBattle2d(battleId)
  await loadTempBattle3d()
  return new Promise(async resolve => {
    BATTLE_PROMISE = resolve
  })
}

const resolveBattlePromise = () => {
  if (BATTLE_PROMISE) {
    BATTLE_PROMISE()
  }
}
export { initBattleModule, loadBattle, resolveBattlePromise }

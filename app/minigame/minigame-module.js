import {
  setupScenes,
  startMiniGameRenderingLoop,
  scene,
  orthoScene
} from './minigame-scene.js'
import { initMiniGameKeypressActions } from './minigame-controls.js'
import { loadTempMiniGame2d } from './minigame-2d.js'
import { loadTempMiniGame3d } from './minigame-3d.js'

const GAME_TYPES = [
  'Bike',
  'ChocoboRace',
  'SnowboardIcicleVersion',
  'FortConder',
  'Submarine',
  'SpeedSquare',
  'SnowboardGoldSaucerVersion'
]
let RETURN_DATA

const initMiniGameModule = () => {
  setupScenes()
  initMiniGameKeypressActions()
}

const cleanScene = () => {
  while (scene.children.length) {
    scene.remove(scene.children[0])
  }
  while (orthoScene.children.length) {
    orthoScene.remove(orthoScene.children[0])
  }
}

const loadMiniGame = async (gameId, options, returnInstructions) => {
  console.log('loadMiniGame', gameId, options, returnInstructions)
  RETURN_DATA = returnInstructions
  cleanScene()
  startMiniGameRenderingLoop()
  // Temp
  await loadTempMiniGame2d(GAME_TYPES[gameId])
  loadTempMiniGame3d()
}

export { initMiniGameModule, loadMiniGame, RETURN_DATA }

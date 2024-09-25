import { setupInputs } from './interaction/inputs.js'
import { initRenderer, showStats } from './render/renderer.js'
import { loadWindowTextures, loadKernelData } from './data/kernel-fetch-data.js'
import { loadExeData } from './data/exe-fetch-data.js'
import { loadBattleData } from './data/battle-fetch-data.js'
import { loadCDData } from './data/cd-fetch-data.js'
import { loadMenuTextures } from './data/menu-fetch-data.js'
import { loadFieldTextures } from './data/field-fetch-data.js'
import {
  initLoadingModule,
  setLoadingText,
  showLoadingScreen
} from './loading/loading-module.js'
import { loadGame, initNewSaveMap } from './data/savemap.js'
import { setDefaultMediaConfig } from './media/media-module.js'
import {
  initMenuModule,
  loadMenuWithWait,
  MENU_TYPE
} from './menu/menu-module.js'
import { initBattleModule } from './battle/battle-module.js'
import { initBattleSwirlModule } from './battle-swirl/battle-swirl-module.js'
import { initMiniGameModule } from './minigame/minigame-module.js'
import { initWorldModule } from './world/world-module.js'
import { bindDisplayControls } from './helpers/display-controls.js'
import { waitUntilMediaCanPlay } from './helpers/media-can-play.js'
import { loadZippedAssets } from './data/cache-manager.js'

const initManager = async () => {
  // Generic Game loading
  window.anim.container = document.getElementById('container')
  if (window.config.debug.active) {
    showStats()
  }
  initRenderer()
  await initLoadingModule()
  console.log('loading ALL START')
  showLoadingScreen()
  setupInputs()

  setLoadingText('Loading Core - Step 1 of 7')
  await initWorldModule() // 3 json
  await loadKernelData() // 1 json
  await loadExeData() // 1 json
  await loadCDData() // 1 json

  setLoadingText('Loading Battle Data - Step 2 of 7')
  await loadBattleData() // 1 json

  setLoadingText('Loading Core Assets - Step 3 of 7 - First load only')
  const zip = await loadZippedAssets()
  setLoadingText('Loading Window Textures - Step 4 of 7')
  await loadWindowTextures(zip) // 1 json then 2k images, 650 kb
  setLoadingText('Loading Menu Textures - Step 5 of 7')
  await loadMenuTextures(zip) // 3 json then: menu: 5k images, 3 mb. credits: 650 images, 14 images, 1 mb
  setLoadingText('Loading Field Textures - Step 6 of 7')
  await loadFieldTextures(zip) // 1 json then 23 files, 8 kb
  setLoadingText('Initialising Game - Step 7 of 7')
  // zip = null // Clear a little memory

  console.log('loading ALL END')
  initMenuModule()
  initBattleSwirlModule()
  initBattleModule()
  initMiniGameModule()
  setDefaultMediaConfig()
  bindDisplayControls()
  await waitUntilMediaCanPlay()

  if (window.developerMode) {
    // Quick start
    loadGame(window.config.save.cardId, window.config.save.slotId)
  } else {
    // Correct behaviour
    initNewSaveMap()
    loadMenuWithWait(MENU_TYPE.Title)
  }
}
initManager()

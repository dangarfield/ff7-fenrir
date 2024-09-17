import { setupInputs } from './interaction/inputs.js'
import { initRenderer, showStats } from './render/renderer.js'
import { loadWindowTextures, loadKernelData } from './data/kernel-fetch-data.js'
import { loadExeData } from './data/exe-fetch-data.js'
import { loadSceneData } from './data/scene-fetch-data.js'
import { loadCDData } from './data/cd-fetch-data.js'
import { loadMenuTextures } from './data/menu-fetch-data.js'
import { loadFieldTextures } from './data/field-fetch-data.js'
import {
  initLoadingModule,
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
import { loadMiscData } from './data/misc-fetch-data.js'
import { initCacheManager } from './data/cache-manager.js'

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
  await initCacheManager() // Now loads all of the assets into the cache through a service worker. There, need to improve loading below
  await initWorldModule() // 3 json
  await loadKernelData() // 1 json
  await loadExeData() // 1 json
  await loadMiscData() // 1 json
  await loadSceneData() // 1 json
  await loadCDData() // 1 json
  await loadWindowTextures() // 1 json then 2k images, 650 kb
  await loadMenuTextures() // 3 json then: menu: 5k images, 3 mb. credits: 650 images, 14 images, 1 mb
  await loadFieldTextures() // 1 json then 23 files, 8 kb

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

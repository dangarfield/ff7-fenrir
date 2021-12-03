import { setupInputs } from './interaction/inputs.js'
import { initRenderer, showStats } from './render/renderer.js'
import { loadWindowTextures, loadKernelData } from './data/kernel-fetch-data.js'
import { loadExeData } from './data/exe-fetch-data.js'
import { loadCDData } from './data/cd-fetch-data.js'
import { loadMenuTextures } from './data/menu-fetch-data.js'
import { initLoadingModule, showLoadingScreen } from './loading/loading-module.js'
import { loadGame, initNewSaveMap } from './data/savemap.js'
import { setDefaultMediaConfig } from './media/media-module.js'
import { initMenuModule, loadMenuWithWait, MENU_TYPE } from './menu/menu-module.js'
import { initBattleModule } from './battle/battle-module.js'
import { initBattleSwirlModule } from './battle-swirl/battle-swirl-module.js'
import { initMiniGameModule } from './minigame/minigame-module.js'
import { initWorldModule } from './world/world-module.js'
import { bindDisplayControls } from './helpers/display-controls.js'
import { waitUntilMediaCanPlay } from './helpers/media-can-play.js'

const initManager = async () => {
  // Generic Game loading
  window.anim.container = document.getElementById('container')
  if (window.config.debug.active) {
    showStats()
  }
  initRenderer()
  await initLoadingModule()
  showLoadingScreen()
  setupInputs()
  await initWorldModule()
  await loadKernelData()
  await loadExeData()
  await loadCDData()
  await loadWindowTextures()
  await loadMenuTextures()
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

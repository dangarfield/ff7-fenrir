import { setupInputs } from './interaction/inputs.js'
import { initRenderer, showStats } from './render/renderer.js'
import { loadWindowTextures, loadKernelData } from './data/kernel-fetch-data.js'
import { initLoadingModule, showLoadingScreen } from './loading/loading-module.js'
import { loadGame } from './data/savemap.js'
import { setDefaultMediaConfig } from './media/media-module.js'
import { initMenuModule } from './menu/menu-module.js'
import { initBattleModule } from './battle/battle-module.js'
import { initBattleSwirlModule } from './battle-swirl/battle-swirl-module.js'
import { initMiniGameModule } from './minigame/minigame-module.js'
import { bindDisplayControls } from './helpers/display-controls.js'

const initManager = async () => {

    // Generic Game loading
    anim.container = document.getElementById('container')
    if (window.config.debug.active) {
        showStats()
    }
    initRenderer()
    await initLoadingModule()
    showLoadingScreen()
    setupInputs()
    initMenuModule()
    initBattleSwirlModule()
    initBattleModule()
    initMiniGameModule()
    await loadKernelData()
    await loadWindowTextures()
    setDefaultMediaConfig()
    bindDisplayControls()
    // Default
    loadGame(window.config.save.cardId, window.config.save.slotId)
}
initManager()
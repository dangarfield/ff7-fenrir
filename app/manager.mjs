// import * as DATA from './data/globalData.js' // Handle this better in the future
import { setupInputs } from './interaction/inputs.js'
import { loadField } from './field/field-module.js'
import { initRenderer, showStats } from './render/renderer.js'
import { loadWindowTextures, loadKernelData } from './data/kernel-fetch-data.js'
import { initLoadingModule, showLoadingScreen } from './loading/loading-module.js'
import { loadSaveMap } from './data/savemap.js'
import { getPlayableCharacterInitData } from './data/savemap-alias.js'
import { setDefaultMediaConfig } from './media/media-module.js'
import { initMenuModule } from './menu/menu-module.js'
import { initBattleModule } from './battle/battle-module.js'
import { initBattleSwirlModule } from './battle-swirl/battle-swirl-module.js'



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
    await loadKernelData()
    await loadWindowTextures()
    setDefaultMediaConfig()

    // Initialise new savemap - Replace with menu
    // initNewSaveMap()
    loadSaveMap(1)
    const playableCharacterInitData = getPlayableCharacterInitData()
    console.log('playableCharacterInitData LOAD', playableCharacterInitData)
    if (playableCharacterInitData.fieldName) {
        loadField(playableCharacterInitData.fieldName, playableCharacterInitData)
    } else {
        loadField('md1stin')
        // loadField('blackbg3')
    }
    // Load field - Replace with menu

    // loadField('nmkin_5')
    // loadField('blin67_2')
}
initManager()
// import * as DATA from './data/globalData.js' // Handle this better in the future
import { setupInputs } from './interaction/inputs.js'
import { loadField } from './field/field-module.js'
import { initRenderer, showStats } from './render/renderer.js'
import { loadWindowTextures, loadKernelData } from './data/kernel-fetch-data.js'
import { initLoadingModule, showLoadingScreen } from './loading/loading-module.js'
import { loadSaveMap } from './data/savemap.js'
import { setDefaultMediaConfig } from './media/media-module.js'
import { initMenuModule } from './menu/menu-module.js'



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
    await loadKernelData()
    await loadWindowTextures()
    setDefaultMediaConfig()

    // Initialise new savemap - Replace with menu
    // initNewSaveMap()
    loadSaveMap(1)

    // Load field - Replace with menu
    loadField('md1stin')
    // loadField('nmkin_5')
    // loadField('blin67_2')
}
initManager()
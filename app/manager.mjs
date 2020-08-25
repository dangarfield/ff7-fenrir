import Stats from '../assets/threejs-r118/jsm/libs/stats.module.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/stats.module.js';

// import * as DATA from './data/globalData.js' // Handle this better in the future
import { setupInputs } from './interaction/inputs.js'
import { loadField } from './field/field-module.js'
import { initRenderer } from './render/renderer.js'
import { loadWindowTextures, loadKernelData } from './data/kernel-fetch-data.js'
import { initLoadingModule, showLoadingScreen } from './loading/loading-module.js'
import { loadSaveMap } from './data/savemap.js'

// let anim = window.anim // Handle this better in the future

const showStats = () => {
    anim.stats = new Stats()
    anim.stats.dom.style.cssText = 'position:fixed;top:0;right:270px;cursor:pointer;opacity:0.9;z-index:10000';
    document.querySelector('.stats').appendChild(anim.stats.dom)
}

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
    await loadKernelData()
    await loadWindowTextures()

    // Initialise new savemap - Replace with menu
    // initNewSaveMap()
    loadSaveMap(1)

    // Load field - Replace with menu
    // loadField('md1stin')
    loadField('cargoin')
    // loadField('blin67_2')
}
initManager()
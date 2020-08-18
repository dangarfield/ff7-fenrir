import Stats from '../assets/threejs-r118/jsm/libs/stats.module.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/stats.module.js';

// import * as DATA from './data/globalData.js' // Handle this better in the future
import { setupInputs } from './interaction/inputs.js'
import { loadField } from './field/field-module.js'
import { initRenderer } from './render/renderer.js'
import { enableLoadingCache, loadWindowTextures } from './data/kernel-fetch-data.js'
import { initLoadingModule, showLoadingScreen } from './loading/loading-module.js'

// let anim = window.anim // Handle this better in the future

const showStats = () => {
    anim.stats = new Stats()
    anim.stats.dom.style.cssText = 'position:fixed;top:0;right:270px;cursor:pointer;opacity:0.9;z-index:10000';
    document.querySelector('.stats').appendChild(anim.stats.dom)
}

const initManager = async () => {
    enableLoadingCache()
    anim.container = document.getElementById('container')
    if (window.config.debug.active) {
        showStats()
    }
    initRenderer()
    await initLoadingModule()
    showLoadingScreen()
    setupInputs()
    await loadWindowTextures()
    // loadField('mds5_1')
    loadField('md1_2')
}
initManager()
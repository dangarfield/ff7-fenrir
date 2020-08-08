import Stats from '../assets/threejs-r118/jsm/libs/stats.module.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/stats.module.js';

// import * as DATA from './data/globalData.js' // Handle this better in the future
import { setupInputs } from './interaction/inputs.js'
import { initField } from './field/field-module.js'
import { initRenderer } from './render/renderer.js'

// let anim = window.anim // Handle this better in the future

const showStats = () => {
    anim.stats = new Stats()
    anim.stats.dom.style.cssText = 'position:fixed;top:0;right:270px;cursor:pointer;opacity:0.9;z-index:10000';
    document.querySelector('.stats').appendChild(anim.stats.dom)
}

const initManager = async () => {
    console.log('initManager', window.anim)
    anim.container = document.getElementById('container')
    showStats()
    setupInputs()
    initRenderer()
    initField('mrkt2')
}

initManager()

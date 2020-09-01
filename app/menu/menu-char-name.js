import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'

const loadCharNameMenu = async (param) => {
    console.log('loadCharNameMenu', param)
    showDebugText('Character Name Entry ' + param)
}

export {
    loadCharNameMenu
}
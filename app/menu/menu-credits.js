import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'

const loadCreditsMenu = async () => {
    console.log('loadCreditsMenu')
    showDebugText('Credits')
}

export {
    loadCreditsMenu
}
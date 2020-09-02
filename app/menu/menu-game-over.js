import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'

const loadGameOverMenu = async () => {
    console.log('loadGameOverMenu')
    showDebugText('Game Over')
}

export {
    loadGameOverMenu
}
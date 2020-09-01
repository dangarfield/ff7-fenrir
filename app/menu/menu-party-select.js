import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'

const loadPartySelectMenu = async () => {
    console.log('loadPartySelectMenu')
    showDebugText('Party Select')
}

export {
    loadPartySelectMenu
}
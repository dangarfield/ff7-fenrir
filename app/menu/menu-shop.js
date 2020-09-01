import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'

const loadShopMenu = async (shopId) => {
    console.log('loadShopMenu', shopId)
    showDebugText('Shop ' + shopId)
}

export {
    loadShopMenu
}
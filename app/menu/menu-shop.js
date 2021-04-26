import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'
import { setMenuState } from './menu-module.js'

const loadShopMenu = async shopId => {
  console.log('loadShopMenu', shopId)
  showDebugText('Shop ' + shopId)
  setMenuState('shop')
}

export { loadShopMenu }

import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'
import { setMenuState } from './menu-module.js'

const loadChangeDiscMenu = async param => {
  console.log('loadChangeDiscMenu')
  showDebugText('Change Disc ' + param)
  setMenuState('disc')
}

export { loadChangeDiscMenu }

import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'
import { setMenuState } from './menu-module.js'
const loadTitleMenu = async () => {
  console.log('loadTitleMenu')
  showDebugText('Title')
  setMenuState('title')
}

export { loadTitleMenu }

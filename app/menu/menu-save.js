import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'
import { setMenuState } from './menu-module.js'
const loadSaveMenu = async () => {
  console.log('loadSaveMenu')
  showDebugText('Save')
  setMenuState('save')
}

export { loadSaveMenu }

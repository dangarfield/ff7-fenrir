import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'
import { setMenuState } from './menu-module.js'

const loadCreditsMenu = async () => {
  console.log('loadCreditsMenu')
  showDebugText('Credits')
  setMenuState('credits')
}

export { loadCreditsMenu }

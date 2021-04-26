import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'
import { setMenuState } from './menu-module.js'

const loadGameOverMenu = async () => {
  console.log('loadGameOverMenu')
  showDebugText('Game Over')
  setMenuState('gameover')
}

export { loadGameOverMenu }

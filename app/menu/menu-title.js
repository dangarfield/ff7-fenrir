import * as THREE from '../../assets/threejs-r118/three.module.js'

import { scene, showDebugText } from './menu-scene.js'

const loadTitleMenu = async () => {
  console.log('loadTitleMenu')
  showDebugText('Title')
}

export { loadTitleMenu }

import * as THREE from '../../assets/threejs-r118/three.module.js'
import { scene } from './minigame-scene.js'

const showDebugObject = () => {
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
}

const loadTempMiniGame3d = () => {
  showDebugObject()
}
export { loadTempMiniGame3d }

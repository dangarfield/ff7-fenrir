import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { scene } from './battle-scene.js'

const showDebugObject = () => {
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
}

const loadTempBattle3d = async () => {
  showDebugObject()
}
export { loadTempBattle3d }

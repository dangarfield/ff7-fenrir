import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import { TextGeometry } from '../../assets/threejs-r148/examples/jsm/geometries/TextGeometry.js'

import { orthoScene } from './battle-scene.js'
import { loadFont } from '../helpers/font-helper.js'

const showDebugText = async text => {
  const font = await loadFont()
  const textGeo = new TextGeometry(text, {
    font,
    size: 5,
    height: 1,
    curveSegments: 10,
    bevelEnabled: false
  })
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true
  })
  const mesh = new THREE.Mesh(textGeo, material)
  mesh.position.y = 4
  mesh.position.x = 4
  orthoScene.add(mesh)
}

const loadTempBattle2d = async battleId => {
  showDebugText('Battle ' + battleId)
}
export { loadTempBattle2d }

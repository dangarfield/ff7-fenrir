import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { TextGeometry } from '../../assets/threejs-r135-dg/examples/jsm/geometries/TextGeometry.js'
import { updateOnceASecond } from '../helpers/gametime.js'
import { loadFont } from '../helpers/font-helper.js'
import TWEEN from '../../assets/tween.esm.js'
const MENU_TWEEN_GROUP = (window.MENU_TWEEN_GROUP = new TWEEN.Group())

let scene
let camera
window.menuScene = scene
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
  scene.add(mesh)
}

const renderLoop = function () {
  if (window.anim.activeScene !== 'menu') {
    console.log('Stopping menu renderLoop')
    return
  }
  requestAnimationFrame(renderLoop)
  updateOnceASecond()
  MENU_TWEEN_GROUP.update()
  window.anim.renderer.clear()
  window.anim.renderer.render(scene, camera)
  window.anim.renderer.clearDepth()

  if (window.config.debug.active) {
    window.anim.stats.update()
  }
}
const initMenuRenderLoop = () => {
  if (window.anim.activeScene !== 'menu') {
    window.anim.activeScene = 'menu'
    renderLoop()
  }
}

const setupMenuCamera = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  camera = new THREE.OrthographicCamera(
    0,
    window.config.sizing.width,
    window.config.sizing.height,
    0,
    0,
    1001
  )
  camera.position.z = 1001
}

export {
  setupMenuCamera,
  scene,
  camera,
  showDebugText,
  initMenuRenderLoop,
  MENU_TWEEN_GROUP
}

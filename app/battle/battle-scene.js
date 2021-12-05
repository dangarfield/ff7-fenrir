import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { updateOnceASecond } from '../helpers/gametime.js'

let scene
let orthoScene
let fixedCamera
let movingCamera
let debugCamera
let orthoCamera

const renderLoop = () => {
  if (window.anim.activeScene !== 'battle') {
    console.log('Stopping battle renderLoop')
    return
  }

  requestAnimationFrame(renderLoop)
  updateOnceASecond()
  if (window.anim.renderer) {
    // console.log('render')
    let activeCamera = fixedCamera

    window.anim.renderer.clear()
    window.anim.renderer.render(scene, fixedCamera)

    window.anim.renderer.clearDepth()
    window.anim.renderer.render(orthoScene, orthoCamera)
  }
  if (window.config.debug.active) {
    window.anim.stats.update()
  }
}
const startBattleRenderingLoop = () => {
  if (window.anim.activeScene !== 'battle') {
    window.anim.activeScene = 'battle'
    renderLoop()
  }
}

const setupScenes = () => {
  scene = new THREE.Scene()
  orthoScene = new THREE.Scene()

  const light = new THREE.DirectionalLight(0xffffff)
  light.position.set(0, 0, 50).normalize()
  scene.add(light)
  const ambientLight = new THREE.AmbientLight(0x404040)
  scene.add(ambientLight)

  fixedCamera = new THREE.PerspectiveCamera(
    100,
    window.config.sizing.width / window.config.sizing.height,
    0.001,
    1000
  )
  fixedCamera.position.x = 5
  fixedCamera.position.y = 5
  fixedCamera.position.z = 5

  movingCamera = new THREE.PerspectiveCamera(
    100,
    window.config.sizing.width / window.config.sizing.height,
    0.001,
    1000
  )
  movingCamera.position.x = 10
  movingCamera.position.y = 20
  movingCamera.position.z = 30

  debugCamera = new THREE.PerspectiveCamera(
    100,
    window.config.sizing.width / window.config.sizing.height,
    0.001,
    1000
  )
  debugCamera.position.x = 10
  debugCamera.position.y = 20
  debugCamera.position.z = 30

  orthoCamera = new THREE.OrthographicCamera(
    0,
    window.config.sizing.width,
    window.config.sizing.height,
    0,
    0,
    1001
  )
  orthoCamera.position.z = 1001
}

export {
  scene,
  orthoScene,
  fixedCamera,
  movingCamera,
  orthoCamera,
  setupScenes,
  startBattleRenderingLoop
}

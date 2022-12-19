import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { OrbitControls } from '../../assets/threejs-r135-dg/examples/jsm/controls/OrbitControls.js'
import { updateOnceASecond } from '../helpers/gametime.js'
import { incrementTick } from './battle-timers.js'

let scene
let sceneGroup
let orthoScene
let fixedCamera
let battleCamera
let debugCamera
let orthoCamera
let debugControls

const BATTLE_TWEEN_GROUP = (window.FIELD_TWEEN_GROUP = new TWEEN.Group())

const tweenSleep = (ms) => {
  return new Promise(resolve => {
    new TWEEN.Tween({ x: 1 }, BATTLE_TWEEN_GROUP).to({ x: 1 }, ms).onComplete(function () { resolve() }).start()
  })
}

const renderLoop = () => {
  if (window.anim.activeScene !== 'battle') {
    console.log('Stopping battle renderLoop')
    return
  }

  window.requestAnimationFrame(renderLoop)
  updateOnceASecond()
  if (window.anim.renderer) {
    // console.log('render')
    // const activeCamera = fixedCamera

    incrementTick() // TODO - Have to wait for initial camera animations / fades?
    const delta = window.anim.clock.getDelta()

    if (debugControls) {
      console.log('batte debugControls', debugControls)
      debugControls.update(delta)
    }

    if (window.currentBattle.models) {
      for (const model of window.currentBattle.models) {
        if (model.mixer) model.mixer.update(delta)
        if (model.userData.updateShadowPosition) model.userData.updateShadowPosition()
      }
    }
    BATTLE_TWEEN_GROUP.update()
    window.anim.renderer.clear()
    window.anim.renderer.render(scene, debugCamera)

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
  sceneGroup = new THREE.Group()
  scene.add(sceneGroup)
  orthoScene = new THREE.Scene()

  window.battleScene = scene
  // const light = new THREE.DirectionalLight(0xffffff)
  // light.position.set(0, 0, 50).normalize()
  // scene.add(light)
  const ambientLight = new THREE.AmbientLight(0xffffff, 12)
  scene.add(ambientLight)

  fixedCamera = new THREE.PerspectiveCamera(
    100,
    window.config.sizing.width / window.config.sizing.height,
    0.1,
    100000
  )
  fixedCamera.position.x = 5
  fixedCamera.position.y = 5
  fixedCamera.position.z = 5

  battleCamera = new THREE.PerspectiveCamera(
    50,
    window.config.sizing.width / window.config.sizing.height,
    0.01,
    100000
  )
  battleCamera.position.x = 10
  battleCamera.position.y = 20
  battleCamera.position.z = 30

  debugCamera = new THREE.PerspectiveCamera(
    27,
    window.config.sizing.width / window.config.sizing.height,
    1,
    100000
  )
  debugCamera.position.x = 5520// 3000
  debugCamera.position.y = 2184// 1200
  debugCamera.position.z = 7411// -400
  window.battleDebugCamera = debugCamera

  debugControls = new OrbitControls(debugCamera, window.anim.renderer.domElement)
  debugControls.target = new THREE.Vector3(0, 1000, 0)
  debugControls.update()
  debugCamera.controls = debugControls

  orthoCamera = new THREE.OrthographicCamera(
    0,
    window.config.sizing.width,
    window.config.sizing.height,
    0,
    0,
    1001
  )
  orthoCamera.position.z = 1001

  // scene.background = new THREE.Color(0xBBDDFF) // 0x505050
  scene.add(battleCamera)
  // add lights
  // const addDirectionalLight = function (x, y, z) {
  //   const light = new THREE.DirectionalLight(0xc0c0c0)
  //   light.position.set(x, y, z).normalize()
  //   scene.add(light)
  // }
  // addDirectionalLight(4, 2, 3)
  // addDirectionalLight(4, 2, 3)
  // addDirectionalLight(0, -2, -3)
  // const ambientLight = new THREE.AmbientLight(0x404040); // 0x404040 = soft white light
  // scene.add(ambientLight);
}

export {
  scene,
  sceneGroup,
  orthoScene,
  fixedCamera,
  battleCamera,
  orthoCamera,
  setupScenes,
  startBattleRenderingLoop,
  BATTLE_TWEEN_GROUP,
  tweenSleep
}

import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { loadBattle, preLoadBattle } from '../battle/battle-module.js'
import { playCommonSound, COMMON_SOUNDS } from '../media/media-sound.js'
import { updateOnceASecond } from '../helpers/gametime.js'

// Example interesting shader - https://masatomakino.github.io/threejs-shader-materials/demo/ -> demoSwirl.html

let scene
let camera

const renderLoop = function () {
  if (window.anim.activeScene !== 'battle-swirl') {
    console.log('Stopping battle-swirl renderLoop')
    return
  }
  window.requestAnimationFrame(renderLoop)
  updateOnceASecond()
  TWEEN.update()
  window.anim.renderer.clear()
  window.anim.renderer.render(scene, camera)
  window.anim.renderer.clearDepth()

  if (window.config.debug.active) {
    window.anim.stats.update()
  }
}
const startBattleSwirlRenderingLoop = () => {
  if (window.anim.activeScene !== 'battle-swirl') {
    window.anim.activeScene = 'battle-swirl'
    renderLoop()
  }
}
const cleanScene = () => {
  while (scene.children.length) {
    scene.remove(scene.children[0])
  }
}
const initBattleSwirlModule = () => {
  scene = new THREE.Scene()

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

const tempFadeEffect = () => {
  return new Promise(resolve => {
    console.log('tempFadeEffect: START')
    const geometry = new THREE.PlaneGeometry(
      window.config.sizing.width,
      window.config.sizing.height
    )
    const material = new THREE.MeshBasicMaterial({
      color: 0xfff000,
      side: THREE.DoubleSide,
      transparent: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(
      window.config.sizing.width / 2,
      window.config.sizing.height / 2,
      1000
    )
    scene.add(mesh)

    const from = { r: 0xff, g: 0xf0, b: 0x00 }
    const to = { r: 0x00, g: 0x0f, b: 0xff }

    const time = 1600
    new TWEEN.Tween(from)
      .to(to, time)
      // .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(function () {
        console.log('tempFadeEffect: TWEEN', from)
        if (from.r) {
          // Has to be like this for non THREE.NormalBlending modes
          mesh.material.color = new THREE.Color(
            `rgb(${Math.floor(from.r)},${Math.floor(from.g)},${Math.floor(
              from.b
            )})`
          )
        }
      })
      .onComplete(function () {
        console.log('tempFadeEffect: END', from)
        resolve()
      })
      .start()
  })
}
const doSwirl = async () => {
  console.log('battle doSwirl: START')
  await tempFadeEffect()
  console.log('battle doSwirl: END')
}
const loadBattleWithSwirl = async (battleId, options) => {
  console.log('loadBattleWithSwirl', battleId, options)
  cleanScene()
  startBattleSwirlRenderingLoop()
  // Temp
  playCommonSound(COMMON_SOUNDS.BATTLE_SWIRL)

  console.log('battle loadBattleWithSwirl: START')
  await Promise.all([
    doSwirl(),
    preLoadBattle(battleId, options) // TODO - This causes a lot of lag, add a loading screen instead
  ])
  console.log('battle loadBattleWithSwirl: END')
  await loadBattle(battleId, options)
}
export { initBattleSwirlModule, loadBattleWithSwirl }

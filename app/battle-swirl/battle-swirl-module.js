import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { loadBattle, preLoadBattle } from '../battle/battle-module.js'
import { playCommonSound, COMMON_SOUNDS } from '../media/media-sound.js'
import { updateOnceASecond } from '../helpers/gametime.js'
import { renderToTexture } from '../field/field-scene.js'

// Example interesting shader - https://masatomakino.github.io/threejs-shader-materials/demo/ -> demoSwirl.html

let scene
let camera
let renderTarget
let swirlMesh

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

  // console.log('doSwirl render')
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

  const vertexShader = `
varying vec2 vUv; 
void main() {
    vUv = uv; 
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition; 
}
`
  const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float rotation;
varying vec2 vUv;

vec2 swirl(vec2 uv, float radius, float rot, vec2 center)
{
  vec2 tc = uv - center;
  float dist = length(tc);
  if (dist < radius) 
  {
    float percent = (radius - dist) / radius;
    float theta = percent * percent * rot;
    float s = sin(theta);
    float c = cos(theta);
    tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
  }
  tc += center;
  return tc;
}

void main() {
    vec2 swirlUv = swirl(vUv, 1.0, rotation, vec2(0.5,0.5));
    gl_FragColor = texture2D(tDiffuse, swirlUv);
}
`

  renderTarget = new THREE.WebGLRenderTarget(window.config.sizing.width * window.config.sizing.factor,
    window.config.sizing.height * window.config.sizing.factor, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, encoding: THREE.sRGBEncoding })
  window.renderTarget = renderTarget
  renderTarget.outputEncoding = THREE.sRGBEncoding
  renderTarget.encoding = THREE.sRGBEncoding
  const geometry = new THREE.PlaneGeometry(window.config.sizing.width, window.config.sizing.height)
  // const material = new THREE.MeshBasicMaterial({
  //   map: renderTarget.texture
  // })
  // TODO - When using this in the shader material, 3d models are darker
  //      - When using this in the basic material, bgs are lighter
  const material = new THREE.ShaderMaterial({
    uniforms: {
      rotation: { value: 0.0 },
      // Just an example I don't want to use this texture, I want to use whatever the camera sees underneath each from
      tDiffuse: { type: 't', value: renderTarget.texture }
    },
    vertexShader,
    fragmentShader
  })
  swirlMesh = new THREE.Mesh(geometry, material)
  swirlMesh.position.set(
    window.config.sizing.width / 2,
    window.config.sizing.height / 2,
    0
  )
  scene.add(swirlMesh)

  // const mesh2 = new THREE.Mesh(new THREE.PlaneGeometry(window.config.sizing.width / 4, window.config.sizing.height / 4), new THREE.MeshBasicMaterial({ color: 'red' }))
  // mesh2.position.set(
  //   window.config.sizing.width / 8,
  //   window.config.sizing.height / 8,
  //   0
  // )
  // mesh2.visible = true
  // scene.add(mesh2)

  camera.position.z = 1001
}

const doSwirl = async () => {
  console.log('doSwirl: START')

  return new Promise(resolve => {
    const from = { rotation: 0.0, scale: 1 }
    const to = { rotation: Math.PI * 2, scale: 3 }
    const time = 1000 // TODO - Time it

    new TWEEN.Tween(from)
      .to(to, time)
      // .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(function () {
        // console.log('doSwirl: TWEEN', from)
        swirlMesh.material.uniforms.rotation.value = from.rotation
        swirlMesh.scale.x = from.scale
        swirlMesh.scale.y = from.scale
        // TODO - Blur / progressingly render to texture each time
      })
      .onComplete(function () {
        console.log('doSwirl: END')
        resolve()
      })
      .start()
  })
}
const loadBattleWithSwirl = async (battleId, options) => {
  console.log('loadBattleWithSwirl', battleId, options)
  // cleanScene()
  renderToTexture(renderTarget)
  console.log('renderToTexture done')
  playCommonSound(COMMON_SOUNDS.BATTLE_SWIRL)
  startBattleSwirlRenderingLoop()

  console.log('battle loadBattleWithSwirl: START')
  // await Promise.all([
  //   doSwirl(),
  //   preLoadBattle(battleId, options) // TODO - This causes a lot of lag, add a loading screen instead
  // ])
  // await sleep(2000) // TODO - For some reason there is a fps drop at this point
  await doSwirl()
  await preLoadBattle(battleId, options)

  console.log('battle loadBattleWithSwirl: END')
  await loadBattle(battleId, options)
}
export { initBattleSwirlModule, loadBattleWithSwirl }

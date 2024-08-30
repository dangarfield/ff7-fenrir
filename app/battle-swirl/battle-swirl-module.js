import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { loadBattle } from '../battle/battle-module.js'
import { playCommonSound, COMMON_SOUNDS } from '../media/media-sound.js'
import { updateOnceASecond } from '../helpers/gametime.js'
import { renderToTexture } from '../field/field-scene.js'

// Example interesting shader - https://masatomakino.github.io/threejs-shader-materials/demo/ -> demoSwirl.html

let scene
let camera
let renderTarget
let swirlMesh
let swirlEffect

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
uniform sampler2D tPrevFrame;
uniform float swirl;
uniform float zoom;
uniform float rotation;
uniform float fade;
uniform float blurAmount;
varying vec2 vUv;

vec2 applySwirl(vec2 uv, float radius, float rot, vec2 center)
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

vec2 applyRotate(vec2 uv, float angle, vec2 center) {
    vec2 tc = uv - center;
    float s = sin(angle);
    float c = cos(angle);
    tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
    tc += center;
    return tc;
}

void main() {
    // Apply swirl effect
    vec2 swirlUv = applySwirl(vUv, 1.0, swirl, vec2(0.5, 0.5));

    // Apply zoom by scaling the UV coordinates
    vec2 zoomedUv = (swirlUv - 0.5) * zoom + 0.5;

    // Apply overall rotation
    vec2 rotatedUv = applyRotate(zoomedUv, rotation, vec2(0.5, 0.5));

    // Sample the texture color
    vec4 color = texture2D(tDiffuse, rotatedUv);

    // Apply fade effect by interpolating between the color and black
    color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), fade);
    gl_FragColor = mix(color, vec4(0.0, 0.0, 0.0, 1.0), fade);
}
`

  // renderTarget.outputEncoding = THREE.sRGBEncoding
  // renderTarget.encoding = THREE.sRGBEncoding
  const geometry = new THREE.PlaneGeometry(
    window.config.sizing.width,
    window.config.sizing.height
  )
  // const material = new THREE.MeshBasicMaterial({
  //   map: renderTarget.texture
  // })
  // TODO - When using this in the shader material, 3d models are darker
  //      - When using this in the basic material, bgs are lighter
  swirlEffect = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      tPrevFrame: { value: null },
      swirl: { value: 0.0 },
      rotation: { value: 0.0 },
      zoom: { value: 1.0 },
      fade: { value: 0.0 },
      blurAmount: { value: 0.5 }
      // tDiffuse: { type: 't', value: renderTarget.texture }
    },
    vertexShader,
    fragmentShader
  })
  swirlMesh = new THREE.Mesh(geometry, swirlEffect)
  swirlMesh.position.set(
    window.config.sizing.width / 2,
    window.config.sizing.height / 2,
    0
  )
  scene.add(swirlMesh)

  camera.position.z = 1001
  console.log('doSwirl: INIT', swirlEffect)
}

const doSwirl = async () => {
  console.log('doSwirl: START')

  return new Promise(resolve => {
    const config = {
      time: 1000,
      delay: 2000,
      swirl: -1.18,
      rotation: -6,
      zoom: 0.0,
      fade: 1.0
    }
    swirlEffect.uniforms.swirl.value = 0.0
    swirlEffect.uniforms.rotation.value = 0.0
    swirlEffect.uniforms.zoom.value = 1.0
    swirlEffect.uniforms.fade.value = 0.0
    // const tweenGroup = new TWEEN.Group()
    const createTween = (target, to, easing, onComplete) => {
      // console.log('doSwirl: createTween', target, to, easing, onComplete, TWEEN)
      const tween = new TWEEN.Tween(target)
        .to(to, config.time)
        // .repeat(Infinity)
        // .delay(100)
        // .repeatDelay(config.delay)
        .easing(easing)
      if (onComplete) {
        tween.onComplete(onComplete)
      }
      return tween.start()
    }
    createTween(
      swirlEffect.uniforms.swirl,
      { value: config.swirl },
      TWEEN.Easing.Quadratic.Out,
      () => {
        console.log('doSwirl: END')
        resolve()
      }
    )
    createTween(
      swirlEffect.uniforms.rotation,
      { value: config.rotation },
      TWEEN.Easing.Quadratic.In
    )
    createTween(
      swirlEffect.uniforms.zoom,
      { value: config.zoom },
      TWEEN.Easing.Linear.None
    )
    createTween(
      swirlEffect.uniforms.fade,
      { value: config.fade },
      TWEEN.Easing.Quadratic.In
    )
  })
}
const loadBattleWithSwirl = async (battleId, options) => {
  console.log('loadBattleWithSwirl', battleId, options)
  // cleanScene()
  renderTarget = new THREE.WebGLRenderTarget(
    window.config.sizing.width * window.config.sizing.factor,
    window.config.sizing.height * window.config.sizing.factor,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      encoding: THREE.sRGBEncoding
    }
  )
  // renderTarget.texture.encoding = THREE.LinearEncoding
  // window.renderTarget = renderTarget
  // renderTarget.texture.encoding = THREE.sRGBEncoding
  renderToTexture(renderTarget)
  swirlEffect.uniforms.tDiffuse.value = renderTarget.texture
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
  console.log('battle loadBattleWithSwirl: END')
  await loadBattle(battleId, options)
}
export { initBattleSwirlModule, loadBattleWithSwirl }

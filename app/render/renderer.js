import * as THREE from '../../assets/threejs-r148/build/three.module.js' // 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import Stats from '../../assets/threejs-r148/examples/jsm/libs/stats.module.js' // 'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/stats.module.js';

// let currentField = window.currentField // Handle this better in the future
// let anim = window.anim
// let config = window.config
const showStats = () => {
  window.anim.stats = new Stats()
  window.anim.stats.dom.style.cssText =
    'position:fixed;top:0;right:270px;cursor:pointer;opacity:0.9;z-index:10000'
  document.querySelector('.stats').appendChild(window.anim.stats.dom)
}

const initRenderer = () => {
  THREE.Cache.enabled = true
  window.anim.gametimeClock = new THREE.Clock()
  window.anim.clock = new THREE.Clock()
  // console.log('cache', THREE.Cache.enabled)
  window.anim.renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  })
  window.anim.renderer.setSize(
    window.config.sizing.width * window.config.sizing.factor,
    window.config.sizing.height * window.config.sizing.factor
  )
  window.anim.renderer.autoClear = false
  window.anim.renderer.localClippingEnabled = true
  THREE.ColorManagement.legacyMode = false
  window.anim.renderer.outputEncoding = THREE.sRGBEncoding
  // window.anim.renderer.setPixelRatio(config.sizing.width / config.sizing.height) // Set pixel ratio helps with antialias, but messing the background alignment up
  // console.log('pixelRatio', window.anim.renderer.getPixelRatio())
  window.anim.container.appendChild(window.anim.renderer.domElement)
  window.anim.renderer.domElement.classList.add('fenrir')
}

export { initRenderer, showStats }

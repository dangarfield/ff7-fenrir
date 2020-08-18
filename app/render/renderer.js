import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';

// let currentField = window.currentField // Handle this better in the future
// let anim = window.anim
// let config = window.config

const initRenderer = () => {
    // console.log('cache', THREE.Cache.enabled)
    window.anim.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    window.anim.renderer.setSize(config.sizing.width * config.sizing.factor, config.sizing.height * config.sizing.factor)
    window.anim.renderer.autoClear = false
    window.anim.renderer.localClippingEnabled = true
    window.anim.renderer.setPixelRatio(config.sizing.width / config.sizing.height)
    // console.log('pixelRatio', window.anim.renderer.getPixelRatio())
    window.anim.container.appendChild(window.anim.renderer.domElement)
    window.anim.renderer.domElement.classList.add('fenrir')
}

export {
    initRenderer
}
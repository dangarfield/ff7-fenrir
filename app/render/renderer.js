import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';

// let currentField = window.currentField // Handle this better in the future
// let anim = window.anim
// let config = window.config

const initRenderer = () => {
    window.anim.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    window.anim.renderer.setSize(config.sizing.width * config.sizing.factor, config.sizing.height * config.sizing.factor)
    window.anim.renderer.autoClear = false
    window.anim.container.appendChild(window.anim.renderer.domElement)
}

export {
    initRenderer
}
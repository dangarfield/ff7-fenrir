import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js'

let scene
let camera
let bar
let text
let progress = 0
let font

const loadFont = async () => {
    return new Promise((resolve, reject) => {
        new THREE.FontLoader().load('../../assets/threejs-r118/fonts/helvetiker_regular.typeface.json', (font) => {
            resolve(font)
        })
    })
}
const createTextGeometry = (text) => {
    return new THREE.TextGeometry(text, {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 10,
        bevelEnabled: false
    })
}
const initLoadingModule = async () => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    font = await loadFont()

    camera = new THREE.OrthographicCamera(
        0,
        window.config.sizing.width,
        window.config.sizing.height,
        0,
        0, 10)
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    // document.body.appendChild(renderer.domElement)

    const geometry = new THREE.PlaneGeometry(1, 1)
    geometry.center
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true })
    material.opacity = 0
    bar = new THREE.Mesh(geometry, material)
    bar.scale.set(1, 1, 0)
    bar.position.x = 0
    bar.position.y = 2

    scene.add(bar)

    camera.position.z = 1



    const textGeo = createTextGeometry('Starting game...')
    text = new THREE.Mesh(textGeo, material)
    text.position.y = 4
    scene.add(text)
}
const renderLoop = function () {
    if (window.anim.activeScene !== 'loading') {
        console.log('Stopping loading renderLoop')
        return
    }
    requestAnimationFrame(renderLoop)

    const opacity = text.material.opacity // Fade in and out quickly
    if (progress < 0.9) {
        text.material.opacity = opacity > 1 ? 1 : opacity + 0.05
        bar.material.opacity = opacity > 1 ? 1 : opacity + 0.05
    } else {
        text.material.opacity = opacity < 0 ? 0 : opacity - 0.05
        bar.material.opacity = opacity < 0 ? 0 : opacity - 0.05
    }



    window.anim.renderer.clear()
    window.anim.renderer.render(scene, camera)
    window.anim.renderer.clearDepth()

    if (window.config.debug.active) {
        window.anim.stats.update()
    }
}
const showLoadingScreen = () => {
    if (window.anim.activeScene !== 'loading') {
        window.anim.activeScene = 'loading'
        setLoadingProgress(0)
        text.material.opacity = 0
        bar.material.opacity = 0
        renderLoop()
    }
}
const setLoadingProgress = (val) => {
    progress = val
    bar.scale.x = window.config.sizing.width * 2 * progress
}
const setLoadingText = (textToSet) => {
    text.geometry = createTextGeometry(textToSet)
}


export {
    initLoadingModule,
    showLoadingScreen,
    setLoadingProgress,
    setLoadingText,
}
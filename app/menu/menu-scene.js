import * as THREE from '../../assets/threejs-r118/three.module.js'

let scene
let camera

const loadFont = async () => {
    return new Promise((resolve, reject) => {
        new THREE.FontLoader().load('../../assets/threejs-r118/fonts/helvetiker_regular.typeface.json', (font) => {
            resolve(font)
        })
    })
}
const showDebugText = async (text) => {
    const font = await loadFont()
    const textGeo = new THREE.TextGeometry(text, {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 10,
        bevelEnabled: false
    })
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true })
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
        0, 1001)
    camera.position.z = 1001

}

export {
    setupMenuCamera,
    scene,
    camera,
    showDebugText,
    initMenuRenderLoop
}
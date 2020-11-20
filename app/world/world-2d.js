import * as THREE from '../../assets/threejs-r118/three.module.js'
import { orthoScene } from './world-scene.js'

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
    orthoScene.add(mesh)
}

const loadWorldMap2d = async (description) => {
    showDebugText(`World map - ${description}`)
}
export {
    loadWorldMap2d
}
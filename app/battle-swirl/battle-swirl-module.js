import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { loadBattle } from '../battle/battle-module.js'
import { playSound } from '../media/media-sound.js'


let scene
let camera

const renderLoop = function () {
    if (window.anim.activeScene !== 'battle-swirl') {
        console.log('Stopping battle-swirl renderLoop')
        return
    }
    requestAnimationFrame(renderLoop)
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
    while (scene.children.length) { scene.remove(scene.children[0]) }
}
const initBattleSwirlModule = () => {

    scene = new THREE.Scene()

    camera = new THREE.OrthographicCamera(0, window.config.sizing.width, window.config.sizing.height, 0, 0, 1001)
    camera.position.z = 1001
}

const tempFadeEffect = () => {
    return new Promise((resolve) => {
        console.log('tempFadeEffect: START')
        const geometry = new THREE.PlaneBufferGeometry(window.config.sizing.width, window.config.sizing.height, 0.1)
        const material = new THREE.MeshBasicMaterial({ color: 0xFFF000, side: THREE.DoubleSide, transparent: true })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(window.config.sizing.width / 2, (window.config.sizing.height / 2), 1000)
        scene.add(mesh)

        let from = { r: 0xFF, g: 0xF0, b: 0x00 }
        let to = { r: 0x00, g: 0x0F, b: 0xFF }

        let time = 1600
        new TWEEN.Tween(from)
            .to(to, time)
            // .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                // window.currentField.fieldFader.material.opacity = from.opacity
                console.log('tempFadeEffect: TWEEN', from)
                if (from.r) {
                    // Has to be like this for non THREE.NormalBlending modes
                    mesh.material.color = new THREE.Color(`rgb(${Math.floor(from.r)},${Math.floor(from.g)},${Math.floor(from.b)})`)
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
    await tempFadeEffect()
}
const loadBattleWithSwirl = async (battleId, options) => {
    console.log('loadBattleWithSwirl', battleId, options)
    cleanScene()
    startBattleSwirlRenderingLoop()
    // Temp
    playSound(43, 0)
    await doSwirl()
    loadBattle(battleId, options)
}
export {
    initBattleSwirlModule,
    loadBattleWithSwirl
}
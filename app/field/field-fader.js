import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';

const drawFader = async () => {
    let geometry = new THREE.PlaneBufferGeometry(0.01, 0.01, 0.01)
    let material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true })
    let fieldFader = new THREE.Mesh(geometry, material)
    let faderPos = new THREE.Vector3().lerpVectors(window.currentField.fieldCamera.position, window.currentField.cameraTarget, 0.001)

    fieldFader.doubleSided = true
    fieldFader.position.set(faderPos.x, faderPos.y, faderPos.z)
    fieldFader.lookAt(window.currentField.fieldCamera.position)

    window.currentField.fieldFader = fieldFader
    window.currentField.fieldScene.add(fieldFader)
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const toggleFader = async () => {
    const current = window.currentField.fieldFader.material.opacity
    // console.log('toggleFader', current === 0 ? 'fadeOut' : 'fadeIn')
    const t1 = new Date()
    if (current === 0) {
        await fadeOut(25, 0.035)
    } else {
        await fadeIn(25, 0.07)
    }
    const t2 = new Date()
    // console.log('fade complete', t2.getTime() - t1.getTime(), 'ms')
}
const fadeOut = async (interval, step) => {
    // console.log('fadeOut')
    while (window.currentField.fieldFader.material.opacity < 1) {
        await sleep(interval)
        window.currentField.fieldFader.material.opacity = window.currentField.fieldFader.material.opacity + step
    }
    window.currentField.fieldFader.material.opacity = 1
}
const fadeIn = async (interval, step) => {
    // console.log('fadeIn')
    while (window.currentField.fieldFader.material.opacity > 0) {
        await sleep(interval)
        window.currentField.fieldFader.material.opacity = window.currentField.fieldFader.material.opacity - step
    }
    window.currentField.fieldFader.material.opacity = 0
}
export {
    drawFader,
    toggleFader
}
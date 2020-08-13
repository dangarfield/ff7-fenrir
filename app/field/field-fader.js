import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';

let fadeInProgress = false
const isFadeInProgress = () => { return fadeInProgress }
const setFadeInProgress = (progress) => { fadeInProgress = progress }

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

const fadeOut = async () => {
    // console.log('fadeOut')
    const interval = 25
    const step = 0.035
    setFadeInProgress(true)
    while (window.currentField.fieldFader.material.opacity < 1) {
        await sleep(interval)
        window.currentField.fieldFader.material.opacity = window.currentField.fieldFader.material.opacity + step
    }
    window.currentField.fieldFader.material.opacity = 1
    setFadeInProgress(false)
}
const fadeIn = async () => {
    // console.log('fadeIn')
    const interval = 25
    const step = 0.07
    setFadeInProgress(false)
    while (window.currentField.fieldFader.material.opacity > 0) {
        await sleep(interval)
        window.currentField.fieldFader.material.opacity = window.currentField.fieldFader.material.opacity - step
    }
    window.currentField.fieldFader.material.opacity = 0
    setFadeInProgress(false)
}
export {
    drawFader,
    fadeIn,
    fadeOut,
    isFadeInProgress
}
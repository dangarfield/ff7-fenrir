import * as THREE from '../../assets/threejs-r118/three.module.js'
import { setBankData, getBankData } from '../data/savemap.js'
import * as assign from './field-op-codes-assign.js'
import { sleep } from '../helpers/helpers.js'

const changeBackgroundParamState = (param, state, isActive) => {
    // console.log('changeBackgroundParamState', param, state, isActive)
    // const bgLayers = window.currentField.backgroundLayers.children.filter(l => l.userData.param === param && l.userData.state === state)
    // bgLayers.map(l => l.visible = isActive)


    const allBgLayers = window.currentField.backgroundLayers.children
    for (let i = 0; i < allBgLayers.length; i++) {
        const l = allBgLayers[i]
        if (l.userData.param === param && l.userData.state === state) {
            l.visible = isActive
        }
    }
}
const clearBackgroundParam = (param) => {
    // console.log('clearBackgroundParam', param)
    const bgLayers = window.currentField.backgroundLayers.children.filter(l => l.userData.param === param)
    bgLayers.map(l => l.visible = false)
}
const clearBackgroundDepth = (layerId, z) => {
    console.log('clearBackgroundDepth', layerId, z)
    const bgLayers = window.currentField.backgroundLayers.children.filter(l => l.userData.layerId === layerId)
    console.log('clearBackgroundDepth bgLayers', bgLayers)
    for (let i = 0; i < bgLayers.length; i++) {
        const layer = bgLayers[i]
        layer.userData.z = z

        // Calculate distance
        const distance = layer.userData.z / window.currentField.metaData.bgZDistance
        let bgVector = new THREE.Vector3().lerpVectors(window.currentField.fieldCamera.position, window.currentField.cameraTarget, distance)

        // Apply sizing adjustment
        let vH = Math.tan(THREE.Math.degToRad(window.currentField.fieldCamera.getEffectiveFOV() / 2)) * distance * 2
        let vW = vH * window.currentField.fieldCamera.aspect
        let geometry = new THREE.PlaneGeometry(vW, vH, 0)
        layer.geometry.dispose()
        layer.geometry = geometry // Requires any 'needUpdate' param?

        // Adjust position
        layer.position.set(bgVector.x, bgVector.y, bgVector.z)
    }
}
const scrollBackground = (layerId, xSpeed, ySpeed) => {
    const layers = window.currentField.backgroundLayers.children.filter(l => l.userData.layerId === layerId)
    // Identify the layers, duplicate and add meta info
    console.log('scrollBackground', layerId, xSpeed, ySpeed, layers)
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        if (layer.userData.scroll === undefined) {
            // Duplicate in all directions
            // console.log('scrollBackground layer', layer)
            layer.scale.x = 3
            layer.scale.y = 3
            layer.material.map.wrapS = THREE.RepeatWrapping
            layer.material.map.wrapT = THREE.RepeatWrapping
            layer.material.map.repeat.x = 3
            layer.material.map.repeat.y = 3
            layer.material.map.center.x = 0.5
            layer.material.map.center.y = 0.5
            layer.material.map.matrixAutoUpdate = true
            layer.material.map.needsUpdate = true
        }
        layer.userData.scroll = true
        layer.userData.scrollSpeedX = xSpeed
        layer.userData.scrollSpeedY = ySpeed
        layer.userData.scrollInitialX = layer.position.x
        layer.userData.scrollInitialY = layer.position.y
        layer.userData.scrollInitialZ = layer.position.z
    }
    // Field render loop will move the scene objects and reset x/y position if hit boundary
}
const BG_SCROLL_FACTOR = 0.00266  // seems to match fairly well on ztruck
const updateBackgroundScolling = (delta) => {
    // console.log('scrollBackground updateBackgroundScolling', delta)
    const layers = window.currentField.backgroundLayers.children
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        if (layer.userData.scrollSpeedX) {
            // console.log('scrollBackground x', layer.material.map.center.x, layer.userData.scrollSpeedX * delta * BG_SCROLL_FACTOR)
            layer.material.map.center.x = layer.material.map.center.x - (layer.userData.scrollSpeedX * delta * BG_SCROLL_FACTOR)
        }
        if (layer.userData.scrollSpeedY) {
            // console.log('scrollBackground y', layer.material.map.center.y, layer.userData.scrollSpeedY * delta * BG_SCROLL_FACTOR)
            layer.material.map.center.y = layer.material.map.center.y - (layer.userData.scrollSpeedY * delta * BG_SCROLL_FACTOR)
        }
    }
}
setTimeout(async () => {
    console.log('start')

    // scrollBackground(3, -5, -10)

    while (false) {
        await sleep(1000 / 30 * 4)
        changeBackgroundParamState(1, 0, false)
        changeBackgroundParamState(1, 1, true)
        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 1, false)
        changeBackgroundParamState(1, 2, true)
        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 2, false)
        changeBackgroundParamState(1, 3, true)

        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 3, false)
        changeBackgroundParamState(1, 4, true)
        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 4, false)
        changeBackgroundParamState(1, 5, true)

        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 5, false)
        changeBackgroundParamState(1, 0, true)
    }
    // assign.SETBYTE({ bd: 5, a: 24, bs: 0, v: 0 })
    // assign.SETBYTE({ bd: 5, a: 27, bs: 0, v: 255 })
    // console.log('5-27', getBankData(5, 27))
    // assign.PLUS({ bd: 5, d: 27, bs: 0, s: 1 })
    // console.log('5-27', getBankData(5, 27))

    // assign.SETBYTE({ bd: 5, a: 25, bs: 0, v: 0 })
    // console.log('SETBYTE', getBankData(5, 25))

    // assign.RANDOM({ b: 5, s: 26 })
    // console.log('RANDOM', getBankData(5, 26))

    // assign.MOD({ bd: 5, d: 26, bs: 0, s: 4 })
    // console.log('MOD', getBankData(5, 26))

    // if (getBankData(5, 26) === 0) {
    //     setBankData(5, 26, 1)
    //     console.log('MOD set to 1', getBankData(5, 26))
    // }
    // console.log('end')

    // while (true) {
    //     console.log('loop')
    //     await sleep(1000)
    //     changeBackgroundParamState(1, getBankData(5, 27), true)
    //     await sleep(1000)
    //     changeBackgroundParamState(1, getBankData(5, 27), false)
    //     await sleep(1000)
    //     changeBackgroundParamState(1, 3, true)
    //     await sleep(1000)
    //     changeBackgroundParamState(1, 3, false)
    // }

}, 12000)
export {
    changeBackgroundParamState,
    clearBackgroundParam,
    clearBackgroundDepth,
    scrollBackground,
    updateBackgroundScolling
}
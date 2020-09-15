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
const setScrollMeta = (layer, xSpeed, ySpeed) => {
    layer.userData.scroll = true
    layer.userData.scrollSpeedX = xSpeed
    layer.userData.scrollSpeedY = ySpeed
    layer.userData.scrollInitialX = layer.position.x
    layer.userData.scrollInitialY = layer.position.y
}
const setScrollPosition = (layer, layerPos, xAdjust, yAdjust) => {
    // Need to get the relative offset from let bgVector = new THREE.Vector3().lerpVectors(window.currentField.fieldCamera.position, window.currentField.cameraTarget, bgDistance)
    layer.position.x = layer.position.x + xAdjust
    layer.position.z = layer.position.z + yAdjust
}
const cloneScrollBG = (layer, layerPos, xAdjust, yAdjust, xSpeed, ySpeed) => {
    const layerClone = layer.clone()
    setScrollPosition(layerClone, layerPos, xAdjust, yAdjust)
    setScrollMeta(layerClone, xSpeed, ySpeed)
    window.currentField.backgroundLayers.add(layerClone)
}
// TODO - This approach isn't effective, change in the future
const scrollBackground = (layerId, xSpeed, ySpeed) => {
    const layers = window.currentField.backgroundLayers.children.filter(l => l.userData.layerId === layerId)

    // Identify the layers, duplicate and add meta info
    console.log('scrollBackground', layerId, xSpeed, ySpeed, layers)
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        if (layer.userData.scroll === undefined) {
            // Duplicate in all directions
            const layerPos = layer.getWorldPosition(new THREE.Vector3())
            console.log('scrollBackground layer', layer, layerPos)
            const xL = -layer.geometry.parameters.width
            const xM = 0
            const xR = layer.geometry.parameters.width
            const yT = -layer.geometry.parameters.width
            const yM = 0
            const yB = layer.geometry.parameters.width

            cloneScrollBG(layer, xL, yT, xSpeed, ySpeed)
            cloneScrollBG(layer, layerPos, xM, yT, xSpeed, ySpeed)
            cloneScrollBG(layer, xR, yT, xSpeed, ySpeed)
            cloneScrollBG(layer, xL, yM, xSpeed, ySpeed)
            // cloneScrollBG(layer, xM, yM, xSpeed, ySpeed) // Already exists
            cloneScrollBG(layer, xR, yM, xSpeed, ySpeed)
            cloneScrollBG(layer, xL, yB, xSpeed, ySpeed)
            cloneScrollBG(layer, layerPos, xM, yB, xSpeed, ySpeed)
            cloneScrollBG(layer, xR, yB, xSpeed, ySpeed)

        }
        setScrollMeta(layer, xSpeed, ySpeed)
    }
    // console.log('scrollBackground backgroundScrollingLayers', window.currentField.backgroundScrollingLayers)

    // Field render loop will move the scene objects and reset x/y position if hit boundary
}
const updateBackgroundScolling = (delta) => {
    // console.log('scrollBackground updateBackgroundScolling', delta)
    const layers = window.currentField.backgroundLayers.children
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        if (layer.userData.scrollSpeedX) {
            layer.position.x = layer.position.x + (layer.userData.scrollSpeedX * delta * 0.001)
        }
        if (layer.userData.scrollSpeedY) {
            layer.position.y = layer.position.y + (layer.userData.scrollSpeedY * delta * 0.001)
        }
    }
}
setTimeout(async () => {
    console.log('start')

    // scrollBackground(3, -10, 0)

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
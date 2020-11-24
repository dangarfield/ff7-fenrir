import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import TWEEN from '../../assets/tween.esm.js'
import { sleep } from '../helpers/helpers.js'
import { scene as orthoFrontScene } from './field-ortho-scene.js'

let transitionFader
let transitionInProgress = false
const isTransitionInProgress = () => { return transitionInProgress }
const setTransitionInProgress = (progress) => { transitionInProgress = progress }

let fadeFader
let fadeInProgress = false
const isFadeInProgress = () => { return fadeInProgress }
const setFadeInProgress = (progress) => { fadeInProgress = progress }
let inProgressFades = []

const setTransitionFaderColor = (newColor) => {
    transitionFader.material.color = newColor
    console.log('setTransitionFaderColor', newColor, transitionFader.material.color)
}
const getTransitionFaderColor = () => {
    return transitionFader.material.color
}

const TRANSITION_COLOR = {
    WHITE: new THREE.Color(0xFFFFFF),
    BLACK: new THREE.Color(0x000000)
}
const setFaderVisible = (isVisible) => {
    fadeFader.visible = isVisible
}
const drawFaders = (whiteTransition) => {
    console.log('drawFaders')
    let transitionFaderGeo = new THREE.PlaneBufferGeometry(window.config.sizing.width, window.config.sizing.height, 0.1)
    let transitionFaderMat = new THREE.MeshBasicMaterial({ color: TRANSITION_COLOR.BLACK, side: THREE.DoubleSide, transparent: true })
    transitionFader = new THREE.Mesh(transitionFaderGeo, transitionFaderMat)

    transitionFader.doubleSided = true
    transitionFader.position.set(window.config.sizing.width / 2, (window.config.sizing.height / 2), 0)
    // By default the position is placed behind the text (eg) at back of ortho scene
    // window.currentField.transitionFader = transitionFader
    orthoFrontScene.add(transitionFader)


    let fadeFaderGeo = new THREE.PlaneBufferGeometry(window.config.sizing.width, window.config.sizing.height, 0.1)
    let fadeFaderMat = new THREE.MeshBasicMaterial({ color: TRANSITION_COLOR.BLACK, side: THREE.DoubleSide, transparent: true })
    fadeFaderMat.blending = THREE.AdditiveBlending
    fadeFader = new THREE.Mesh(fadeFaderGeo, fadeFaderMat)

    fadeFader.doubleSided = true
    fadeFader.position.set(window.config.sizing.width / 2, (window.config.sizing.height / 2), 0)
    // By default the position is placed behind the text (eg) at back of ortho scene
    // window.currentField.fadeFader = fadeFader
    orthoFrontScene.add(fadeFader)
    if (whiteTransition) {
        setTransitionFaderColor(TRANSITION_COLOR.WHITE)
    }
    console.log('drawFaders', transitionFader)

}

const fadeTransition = (from, to, frames) => {
    return new Promise(async (resolve) => {
        let time = Math.floor(frames * 1000 / 30)
        console.log('fadeTransition: START', from, to, frames, time)
        new TWEEN.Tween(from)
            .to(to, time)
            // .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                // window.currentField.fieldFader.material.opacity = from.opacity
                // console.log('fadeTransition', from.opacity, from.test, from, to, from.userData)
                if (from.hasOwnProperty('r')) {
                    // Has to be like this for non THREE.NormalBlending modes
                    transitionFader.material.color = new THREE.Color(`rgb(${Math.floor(from.r)},${Math.floor(from.g)},${Math.floor(from.b)})`)
                    console.log('fadeTransition UPDATE: Color', window.currentField.fieldFader.material.color)
                }
                if (from.hasOwnProperty('o')) {
                    transitionFader.material.opacity = from.o
                    console.log('fadeTransition UPDATE: Opacity', window.currentField.fieldFader.material.opacity)
                }
            })
            .onComplete(function () {
                console.log('fadeTransition: END', from, to, frames, time)
                setTransitionInProgress(false)
                resolve()
            })
            .start()

    })
}
const transitionOut = async (fast) => {
    console.log('transitionOut')
    transitionFader.position.z = 1000
    setTransitionInProgress(true)
    transitionFader.material.blending = THREE.NormalBlending
    await fadeTransition(transitionFader.material, { opacity: 1 }, fast ? 30 * 0.4 : 30 * 0.8)
    setTransitionInProgress(false)
    transitionFader.position.z = 0
}
const transitionIn = async () => {
    transitionFader.position.z = 1000
    console.log('transitionIn', transitionFader)
    setTransitionInProgress(true)
    transitionFader.material.blending = THREE.NormalBlending
    await fadeTransition(transitionFader.material, { opacity: 0 }, 30 * 0.4)
    setTransitionInProgress(false)
    transitionFader.position.z = 0
}


const getColorInverse = (c, multiplier) => {
    return Math.floor(multiplier * (255 - c))
}
const toColorString = (color) => {
    return `rgb(${color.r},${color.g},${color.b})`
}
const fadeInstant = async (blendingType, colorType) => {
    console.log('FADE TWEEN: INSTANT', blendingType, colorType)
    setFadeInProgress(true)
    fadeFader.material.blending = blendingType
    fadeFader.material.color = new THREE.Color(`rgb(${Math.floor(colorType.r)},${Math.floor(colorType.g)},${Math.floor(colorType.b)})`)
    setFadeInProgress(false)
}

const fade = (blendingType, from, to, end, timeMs) => {
    const delta = { ...from }
    return new Promise(async (resolve) => {
        const inProgressFade = new TWEEN.Tween(delta)
        console.log('FADE TWEEN: START', blendingType, delta, to, end, timeMs, '-', inProgressFade._id)
        fadeFader.material.blending = blendingType

        inProgressFade.to(to, timeMs)
            .onUpdate(function () {
                console.log('FADE TWEEN: UPDATE', delta, '-', inProgressFade._id)
                fadeFader.material.color = new THREE.Color(`rgb(${Math.floor(delta.r)},${Math.floor(delta.g)},${Math.floor(delta.b)})`)
            })
        inProgressFade.onComplete(function () {
            console.log('FADE TWEEN: END', delta, to, timeMs, end, '-', inProgressFade._id)
            fadeFader.material.color = new THREE.Color(`rgb(${Math.floor(end.r)},${Math.floor(end.g)},${Math.floor(end.b)})`)
            removeInProgressFade(inProgressFade._id)
            resolve()
        })
        inProgressFade.onStop(function () {
            console.log('FADE TWEEN: STOPPED', delta, to, timeMs, end, '-', inProgressFade._id)
        })
        addInProgressFade(inProgressFade)
        inProgressFade.start()
    })
}
const waitForFade = async () => {
    while (isFadeInProgress()) {
        await sleep(1000 / 30)
    }
}
const addInProgressFade = (inProgressFade) => {
    setFadeInProgress(true)
    inProgressFades.push(inProgressFade)
}
const removeInProgressFade = (_id) => {
    setFadeInProgress(false)
    inProgressFades = inProgressFades.filter(function (f) { return f._id !== _id })
}
const stopInProgressFades = () => {
    console.log('stopInProgressFades', inProgressFades)
    while (inProgressFades.length) {
        const inProgressFade = inProgressFades.shift()
        console.log('stopInProgressFades: STOPPING', inProgressFade._id)
        inProgressFade.stop()
    }
}
const speedToSeconds = (speed) => {
    /*
    1  -> 8
    2  -> 4
    4  -> 2
    8  -> 1
    16 -> 0.5
    32 -> 0.25
    */
    let seconds = 8 / Math.pow(2, Math.log2(speed))
    return Math.max(seconds, 1 / 30) // Ensure at least 1 frame long 
}
const fadeOperation = async (type, r, g, b, speed) => {
    console.log('fadeOperation', type, r, g, b, speed)
    const colorStandard = { r, g, b }
    const colorInverse1 = { r: getColorInverse(r, 1), g: getColorInverse(g, 1), b: getColorInverse(b, 1) }
    const colorInverse4 = { r: getColorInverse(r, 4), g: getColorInverse(g, 4), b: getColorInverse(b, 4) }
    const colorBlack = { r: 0, g: 0, b: 0 }

    let timeMs = speedToSeconds(speed) * 1000

    stopInProgressFades()

    switch (type) {
        case 1:  //  1 -> colorInverse4 to field subtractive async, hold field
            fade(THREE.SubtractiveBlending, colorInverse4, colorBlack, colorBlack, timeMs)
            break
        case 2:  //  2 -> field to colorInverse4 subtractive async, hold color
            fade(THREE.SubtractiveBlending, colorBlack, colorInverse4, colorInverse4, timeMs)
            break
        case 3:  //  3 -> Not in use
            setFadeInProgress(false)
            break
        case 4:  //  4 -> instant no wait black, hold black
            fadeInstant(THREE.NormalBlending, colorBlack)
            break
        case 5:  //  5 -> colorStandard to field additive, hold field
            fade(THREE.AdditiveBlending, colorStandard, colorBlack, colorBlack, timeMs)
            break
        case 6:  //  6 -> field to colorStandard additive, hold color
            fade(THREE.AdditiveBlending, colorBlack, colorStandard, colorStandard, timeMs)
            break
        case 7:  //  7 -> instant but wait colorInverse1 subtractive, hold field
            fade(THREE.SubtractiveBlending, colorInverse1, colorInverse1, colorBlack, timeMs)
            break
        case 8:  //  8 -> instant but wait colorInverse1 subtractive, hold color
            fade(THREE.SubtractiveBlending, colorInverse1, colorInverse1, colorInverse1, timeMs)
            break
        case 9:  //  9 -> instant but wait colorStandard additive, hold field
            fade(THREE.AdditiveBlending, colorStandard, colorStandard, colorBlack, timeMs)
            break
        case 10: // 10 -> instant but wait colorStandard additive, hold color
            fade(THREE.AdditiveBlending, colorStandard, colorStandard, colorStandard, timeMs)
            break
    }
    if (r === 255 && g === 255 && b === 255) {
        setTransitionFaderColor(TRANSITION_COLOR.WHITE)
    } else {
        setTransitionFaderColor(TRANSITION_COLOR.BLACK)
    }
}
const nfadeOperation = async (type, r, g, b, frames) => {
    console.log('nfadeOperation', type, r, g, b, frames)
    const colorStandard = { r, g, b }
    const colorBlack = { r: 0, g: 0, b: 0 }

    let timeMs = frames * (1000 / 30)

    stopInProgressFades()

    switch (type) {
        case 0:  //  1 -> instant no wait field, hold field
            fadeInstant(THREE.SubtractiveBlending, colorBlack)
            break
        case 11: // 11 -> field to colorStandard additive async, hold color
            fade(THREE.AdditiveBlending, colorBlack, colorStandard, colorStandard, timeMs)
            break
        case 12: // 12 -> field to colorStandard subtractive async, hold color
            fade(THREE.SubtractiveBlending, colorBlack, colorStandard, colorStandard, timeMs)
            break
    }
}
export {
    drawFaders,
    transitionIn,
    transitionOut,
    fadeOperation,
    nfadeOperation,
    isTransitionInProgress,
    waitForFade,
    setTransitionFaderColor,
    getTransitionFaderColor,
    TRANSITION_COLOR,
    setFaderVisible
}
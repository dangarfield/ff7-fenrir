import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import TWEEN from '../../assets/tween.esm.js'
import { sleep } from '../helpers/helpers.js'
import { scene as orthoFrontScene } from './field-ortho-scene.js'

let fadeInProgress = false
const isFadeInProgress = () => { return fadeInProgress }
const setFadeInProgress = (progress) => { fadeInProgress = progress }

const drawFader = async () => {
    let geometry = new THREE.PlaneBufferGeometry(window.config.sizing.width, window.config.sizing.height, 0.1)
    let material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true })
    let fieldFader = new THREE.Mesh(geometry, material)

    fieldFader.doubleSided = true
    fieldFader.position.set(window.config.sizing.width / 2, (window.config.sizing.height / 2), 1000)

    window.currentField.fieldFader = fieldFader
    orthoFrontScene.add(fieldFader)
}

const tweenOpacity = (from, to, frames) => {
    return new Promise(async (resolve) => {
        let time = Math.floor(frames * 1000 / 30)
        console.log('FADE TWEEN: START', from, to, frames, time)
        new TWEEN.Tween(from)
            .to(to, time)
            // .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                // window.currentField.fieldFader.material.opacity = from.opacity
                // console.log('tweenOpacity', from.opacity, from.test, from, to, from.userData)
                if (from.hasOwnProperty('r')) {
                    // Has to be like this for non THREE.NormalBlending modes
                    window.currentField.fieldFader.material.color = new THREE.Color(`rgb(${Math.floor(from.r)},${Math.floor(from.g)},${Math.floor(from.b)})`)
                    console.log('FADE TWEEN UPDATE: Color', window.currentField.fieldFader.material.color)
                }
                if (from.hasOwnProperty('o')) {
                    window.currentField.fieldFader.material.opacity = from.o
                    console.log('FADE TWEEN UPDATE: Opacity', window.currentField.fieldFader.material.opacity)
                }
            })
            .onComplete(function () {
                console.log('FADE TWEEN: END', from, to, frames, time)
                setFadeInProgress(false)
                resolve()
            })
            .start()

    })
}
const fadeOut = async (fast) => {
    // console.log('fadeOut')
    setFadeInProgress(true)
    window.currentField.fieldFader.material.blending = THREE.NormalBlending
    window.currentField.fieldFader.material.color = new THREE.Color(0x000000)
    await tweenOpacity(window.currentField.fieldFader.material, { opacity: 1 }, fast ? 30 * 0.4 : 30 * 0.8)
    setFadeInProgress(false)
}
const fadeIn = async () => {
    console.log('fadeIn', window.currentField.fieldFader)
    setFadeInProgress(true)
    window.currentField.fieldFader.material.blending = THREE.NormalBlending
    window.currentField.fieldFader.material.color = new THREE.Color(0x000000)
    await tweenOpacity(window.currentField.fieldFader.material, { opacity: 0 }, 30 * 0.4)
    setFadeInProgress(false)
}
const getColorInverse3 = (c) => {
    return 3 * (255 - c)
}
const getColorInverse1 = (c) => {
    return (255 - c)
}
const fadeOperation = async (type, r, g, b, speed, fadeIn) => {

    const color = `rgb(${r},${g},${b})`
    const colorInverse1 = `rgb(${getColorInverse1(r)},${getColorInverse1(g)},${getColorInverse1(b)})` // Should probably be x4 but x3 looks better
    const colorInverse3 = `rgb(${getColorInverse3(r)},${getColorInverse3(g)},${getColorInverse3(b)})` // Should probably be x4 but x3 looks better

    const frames = Math.max(Math.ceil((fadeIn ? 255 - speed : 255 - speed) / 4) - 2, 1) // ??? This ranges from 1 to 255, with s30 = f8
    // Note: I've -2 adjusted as some calls are async and when wait is not called
    // I'm not sure about the speeds, I'll improve this another day
    /*
    16 - 16 ?! niv_ti2
    32 - 8
    64 - 16
    */

    // TODO: Some issues here with the blending modes not taking the screen value instead starting from black
    // TODO: Also, these operations should be underneath the dialogs
    let m
    setFadeInProgress(true)
    switch (type) {
        case 1: // Color to screen (alpha 1 -> 0) with reverse subtractive blending - async 
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            window.currentField.fieldFader.material.blending = THREE.SubtractiveBlending
            window.currentField.fieldFader.material.color = new THREE.Color(colorInverse3)
            window.currentField.fieldFader.material.opacity = 1
            m = { r: getColorInverse3(r), g: getColorInverse3(g), b: getColorInverse3(b) }
            tweenOpacity(m, {
                o: 0, r: 0, g: 0, b: 0
            }, frames)
            break
        case 2: // Screen to colour fadeIn (alpha 0 -> 1) with subtractive blending - async // DONE
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            window.currentField.fieldFader.material.blending = THREE.SubtractiveBlending
            window.currentField.fieldFader.material.color = new THREE.Color(0x000000)
            window.currentField.fieldFader.material.opacity = 1
            m = { r: 0, g: 0, b: 0 }
            console.log('fadeOperation 2', window.currentField.fieldFader)
            tweenOpacity(m, {
                r: getColorInverse3(r), g: getColorInverse3(g), b: getColorInverse3(b)
            }, frames)
            break
        case 3: // THERE ARE NONE OF THESE IN THE ACTUAL GAME...
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            setFadeInProgress(false)
            break
        case 4: // Show black (alpha = 1) instant - sync
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            window.currentField.fieldFader.material.color = new THREE.Color(0x000000)
            window.currentField.fieldFader.material.opacity = 1
            setFadeInProgress(false)
            break
        case 5: // Colour to screen fadeout (alpha 1 -> 0) with additive blending - async
            // Always fadeIn: true
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            window.currentField.fieldFader.material.blending = THREE.AdditiveBlending
            window.currentField.fieldFader.material.color = new THREE.Color(color)
            window.currentField.fieldFader.material.opacity = 1
            tweenOpacity(window.currentField.fieldFader.material, { opacity: 0 }, frames)
            break
        case 6: // Screen to colour fadeIn (alpha 0 -> 1) with additive blending - async
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            window.currentField.fieldFader.material.blending = THREE.AdditiveBlending
            window.currentField.fieldFader.material.color = new THREE.Color(color)
            window.currentField.fieldFader.material.opacity = 0
            tweenOpacity(window.currentField.fieldFader.material, { opacity: 1 }, frames)
            break
        case 7: // Can't really seem to find where this is trigger in a video playthrough in trackin, shmei, script 1
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            await sleep(1000 / 30) // Add this so it doesn't completely block the game loop
            setFadeInProgress(false)
            break
        case 8: // Screen to colour fadeIn (alpha 0 -> 1) with multiply blending - async but i'll put sync anyway
            console.log('fadeOperation', type, color, speed, frames, fadeIn, 'multiply', color)
            window.currentField.fieldFader.material.blending = THREE.MultiplyBlending
            window.currentField.fieldFader.material.color = new THREE.Color(color)
            window.currentField.fieldFader.material.opacity = 1
            m = { r: 1, g: 1, b: 1 }
            await tweenOpacity(m, {
                r: r, g: g, b: b
            }, frames)
            setFadeInProgress(false)
            break
        case 9: // Screen to color (alpha = 1) instant with normal blending - async
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            window.currentField.fieldFader.material.blending = THREE.NormalBlending
            window.currentField.fieldFader.material.color = new THREE.Color(color)
            window.currentField.fieldFader.material.opacity = 1
            setFadeInProgress(false)
            break
        case 10: // Screen to colour fadeIn (alpha 0 -> 1) with additive blending - async
            // TODO: This might even blend the previous colour or have multiple layers...
            console.log('fadeOperation', type, color, speed, frames, fadeIn)
            window.currentField.fieldFader.material.blending = THREE.NormalBlending
            window.currentField.fieldFader.material.color = new THREE.Color(color)
            window.currentField.fieldFader.material.opacity = 0
            tweenOpacity(window.currentField.fieldFader.material, { opacity: 0.5 }, frames)
            break
    }
}
const nfadeOperation = async (type, r, g, b, speed) => {

    const color = `rgb(${r},${g},${b})`
    const colorInverse1 = `rgb(${getColorInverse1(r)},${getColorInverse1(g)},${getColorInverse1(b)})` // Should probably be x4 but x3 looks better
    const colorInverse3 = `rgb(${getColorInverse3(r)},${getColorInverse3(g)},${getColorInverse3(b)})` // Should probably be x4 but x3 looks better

    const frames = speed // ??? This ranges from 1 to 255, with s30 = f8
    // Note: I've -2 adjusted as some calls are async and when wait is not called
    // I'm not sure about the speeds, I'll improve this another day
    /*
    16 - 16 ?! niv_ti2
    32 - 8
    64 - 16
    */

    // TODO: Some issues here with the blending modes not taking the screen value instead starting from black
    let m
    setFadeInProgress(true)
    switch (type) {
        case 0: // Instantly show the screen
            console.log('nfadeOperation 0', type, color, speed, frames)
            window.currentField.fieldFader.material.blending = THREE.NormalBlending
            window.currentField.fieldFader.material.color = new THREE.Color(0x000000)
            window.currentField.fieldFader.material.opacity = 0
            setFadeInProgress(false)
            break
        case 11: // Fade color to black
            console.log('nfadeOperation 11', type, color, speed, frames)
            break
        case 12: // black to colour with subtractive blending, unless 255,255,255, in which case fade screen to black
            if (r === 255 && g === 255 && b === 255) {
                console.log('nfadeOperation 12', type, '255s', color, speed, frames)
                window.currentField.fieldFader.material.blending = THREE.NormalBlending
                window.currentField.fieldFader.material.color = new THREE.Color(0x000000)
                window.currentField.fieldFader.material.opacity = 0
                tweenOpacity(window.currentField.fieldFader.material, { opacity: 1 }, frames)
            } else {
                console.log('nfadeOperation 12', type, 'subtractive', color, speed, frames)
                // TODO: There are probably multiple layers of blending here, and therefore multiple layers to add
                window.currentField.fieldFader.material.blending = THREE.SubtractiveBlending
                window.currentField.fieldFader.material.color = new THREE.Color(0x000000)
                window.currentField.fieldFader.material.opacity = 0
                m = { o: 0, r: 0, g: 0, b: 0 }
                console.log('opacity 1', window.currentField.fieldFader.material.opacity)
                tweenOpacity(m, {
                    o: 1, r: r, g: g, b: b
                }, frames)
            }
            break
    }
}
export {
    drawFader,
    fadeIn,
    fadeOut,
    fadeOperation,
    nfadeOperation,
    isFadeInProgress
}
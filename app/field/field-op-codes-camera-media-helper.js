import { setCameraPosition, calculateViewClippingPointFromVector3 } from './field-scene.js'
import TWEEN from '../../assets/tween.esm.js'
import { CURRENT_FIELD } from './field-op-loop.js'

const TweenType = {
    Instant: 'Instant',
    Linear: 'Linear',
    Smooth: 'Smooth'
}

const shakeConfig = {
    active: false,
    type: 0,
    config: {}
}
const getCurrentCameraPosition = () => {
    return { x: window.currentField.metaData.fieldCoordinates.x, y: window.currentField.metaData.fieldCoordinates.y }
}
const setShakeConfig = async (fieldName, type, config) => {
    shakeConfig.type = type
    shakeConfig.config = config
    if (!shakeConfig.active) {
        shakeConfig.active = true
        initShake(fieldName)
    }
}
const initShake = async (fieldName) => {
    // while (CURRENT_FIELD === fieldName && shakeConfig.active) {
    // for (let count = 0; count <= op.c; count++) {
    // console.log('initShake', shakeConfig, window.currentField.fieldCameraPosition.shake.next, shakeConfig.config.x.amplitude, shakeConfig.config.y.amplitude)
    if (shakeConfig.type === 3) {
        let toNeg = { x: -shakeConfig.config.x.amplitude, y: -shakeConfig.config.y.amplitude }
        let toPos = { x: shakeConfig.config.x.amplitude, y: shakeConfig.config.y.amplitude }
        let toHome = { x: 0, y: 0 }
        console.log('initShake', shakeConfig, window.currentField.fieldCameraPosition.shake.next, toNeg, toPos, toHome)
        // Note: x and y have to tween separately
        await tweenShake(window.currentField.fieldCameraPosition.shake.next, toNeg, shakeConfig.config.x.frames)
        await tweenShake(window.currentField.fieldCameraPosition.shake.next, toPos, shakeConfig.config.x.frames)
        await tweenShake(window.currentField.fieldCameraPosition.shake.next, toNeg, shakeConfig.config.x.frames)
        await tweenShake(window.currentField.fieldCameraPosition.shake.next, toPos, shakeConfig.config.x.frames)
        await tweenShake(window.currentField.fieldCameraPosition.shake.next, toHome, shakeConfig.config.x.frames)
    }

    // await tweenShake(window.currentField.fieldCameraPosition.shake.next, { y: -shakeConfig.amplitude * 2 }, shakeConfig.frames)
    // await tweenShake(window.currentField.fieldCameraPosition.shake.next, { y: shakeConfig.amplitude }, shakeConfig.frames)
    // }
    // }
    shakeConfig.active = false
}
const tweenShake = (from, to, frames) => {
    return new Promise(async (resolve) => {
        // window.currentField.isScrolling = true
        let time = Math.floor(frames * 1000 / 30)
        console.log('setCameraShakePosition tweenShake TIME', time, frames)
        // let from2 = { x: 0, y: 0 }
        new TWEEN.Tween(from)
            .to(to, time)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                console.log('setCameraShakePosition tweenShake UPDATE', from, window.currentField.fieldCameraPosition.shake.next, to, shakeConfig)
                // setCameraPosition(from.x, from.y)
            })
            .onComplete(function () {
                // window.currentField.isScrolling = false
                console.log('setCameraShakePosition tweenShake END', from, window.currentField.fieldCameraPosition.shake.next, to, shakeConfig)
                resolve()
            })
            .start()

    })
}
const tweenCameraPosition = (from, to, tweenType, frames, entityToFollow) => {
    return new Promise(async (resolve) => {
        window.currentField.isScrolling = true
        let time = Math.floor(frames * 1000 / 30)
        console.log('tweenCameraPosition', from, to, frames, time, tweenType)
        if (tweenType === TweenType.Instant) {
            console.log('setCameraPosition tweenCameraPosition')
            setCameraPosition(to.x, to.y)
            window.currentField.isScrolling = false
            resolve()
        } else {
            let easing = tweenType === TweenType.Linear ? TWEEN.Easing.Linear.None : TWEEN.Easing.Quadratic.InOut
            new TWEEN.Tween(from)
                .to(to, time)
                .easing(easing)
                .onUpdate(function () {
                    console.log('setCameraPosition tweenCameraPosition')
                    setCameraPosition(from.x, from.y)
                    if (entityToFollow) {
                        let relativeToCameraUpdate = calculateViewClippingPointFromVector3(entityToFollow.scene.position)
                        to.x = relativeToCameraUpdate.x
                        to.y = relativeToCameraUpdate.y
                        // console.log('tweenCameraPosition tween', from, to)
                    }

                })
                .onComplete(function () {
                    // console.log('tweenCameraPosition done', from, easing)
                    window.currentField.isScrolling = false
                    resolve()
                })
                .start()

        }
    })

}
const moveCameraToLeader = async (instant) => { // Scroll to leader
    let relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
    console.log('moveCameraToLeader', getCurrentCameraPosition(), relativeToCamera)
    if (instant) {
        console.log('setCameraPosition moveCameraToLeader instant')
        setCameraPosition(relativeToCamera.x, relativeToCamera.y)
    } else {
        await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, TweenType.Smooth, 30)
    }
    window.currentField.fieldCameraFollowPlayer = true
}

export {
    TweenType,
    tweenCameraPosition,
    getCurrentCameraPosition,
    setShakeConfig,
    moveCameraToLeader
}

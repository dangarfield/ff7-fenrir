import { adjustViewClipping, calculateViewClippingPointFromVector3 } from './field-scene.js'
import TWEEN from '../../assets/tween.esm.js'
import { sleep } from '../helpers/helpers.js'

const TweenType = {
    Instant: 'Instant',
    Linear: 'Linear',
    Smooth: 'Smooth'
}

const getCurrentCameraPosition = () => {
    return { x: window.currentField.metaData.fieldCoordinates.x, y: window.currentField.metaData.fieldCoordinates.y }
}
const tweenShake = (from, to, frames) => {
    return new Promise(async (resolve) => {
        window.currentField.isScrolling = true
        let time = Math.floor(frames * 1000 / 30)
        new TWEEN.Tween(from)
            .to(to, time)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                console.log('adjustViewClipping tweenShake')
                adjustViewClipping(from.x, from.y)
            })
            .onComplete(function () {
                window.currentField.isScrolling = false
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
            console.log('adjustViewClipping tweenCameraPosition')
            adjustViewClipping(to.x, to.y)
            window.currentField.isScrolling = false
            resolve()
        } else {
            let easing = tweenType === TweenType.Linear ? TWEEN.Easing.Linear.None : TWEEN.Easing.Quadratic.InOut
            new TWEEN.Tween(from)
                .to(to, time)
                .easing(easing)
                .onUpdate(function () {
                    console.log('adjustViewClipping tweenCameraPosition')
                    adjustViewClipping(from.x, from.y)
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
        console.log('adjustViewClipping moveCameraToLeader instant')
        adjustViewClipping(relativeToCamera.x, relativeToCamera.y)
    } else {
        await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, TweenType.Smooth, 30)
    }
    window.currentField.fieldCameraFollowPlayer = true
}

export {
    TweenType,
    tweenCameraPosition,
    getCurrentCameraPosition,
    tweenShake,
    moveCameraToLeader
}

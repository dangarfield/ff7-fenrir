import { adjustViewClipping } from './field-scene.js'
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js'
import { sleep } from '../helpers/helpers.js'

const TweenType = {
    Instant: 'Instant',
    Linear: 'Linear',
    Smooth: 'Smooth'
}

const getCurrentCameraPosition = () => {
    return { x: window.currentField.metaData.fieldCoordinates.x, y: window.currentField.metaData.fieldCoordinates.y }
}
const tweenCameraPosition = (from, to, tweenType, frames) => {
    return new Promise(resolve => {
        let frameCount = 0
        let time = Math.floor(frames * 1000 / 30)
        if (tweenType === TweenType.Instant) {
            adjustViewClipping(to.x, to.y)
            resolve()
        } else {
            let easing = tweenType === TweenType.Linear ? TWEEN.Easing.Linear.None : TWEEN.Easing.Quadratic.InOut
            console.log('tweenCameraPosition', from, to, frames, time, tweenType)

            new TWEEN.Tween(from)
                .to(to, time)
                .easing(easing)
                .onUpdate(function () {
                    adjustViewClipping(from.x, from.y)
                    console.log('tween', from, frameCount++)
                })
                .onComplete(function () {
                    console.log('done', 'tween', from, easing)
                    resolve()
                })
                .start()
        }
    })

}


export {
    TweenType,
    tweenCameraPosition,
    getCurrentCameraPosition
}

import { adjustViewClipping } from './field-scene.js'
import TWEEN from '../../assets/tween.esm.js'

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
        let time = Math.floor(frames * 1000 / 30)
        if (tweenType === TweenType.Instant) {
            adjustViewClipping(to.x, to.y)
            resolve()
        } else {
            let easing = tweenType === TweenType.Linear ? TWEEN.Easing.Linear.None : TWEEN.Easing.Exponential.InOut
            console.log('tweenCameraPosition', from, to, frames, time, tweenType)

            new TWEEN.Tween(from)
                .to(to, time)
                .easing(easing)
                .onUpdate(function () {
                    adjustViewClipping(from.x, from.y)
                    console.log('tweenCameraPosition tween', from)
                })
                .onComplete(function () {
                    console.log('tweenCameraPosition done', from, easing)
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

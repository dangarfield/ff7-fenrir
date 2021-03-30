import { setCameraPosition, calculateViewClippingPointFromVector3 } from './field-scene.js'
import TWEEN from '../../assets/tween.esm.js'
import { CURRENT_FIELD } from './field-op-loop.js'
import { sleep } from '../helpers/helpers.js'

const TweenType = {
    Instant: 'Instant',
    Linear: 'Linear',
    Smooth: 'Smooth'
}

const SHAKE_TWEEN_GROUP = window.SHAKE_TWEEN_GROUP = new TWEEN.Group()
let shakeConfig = {}
let shakeQueue = []

const getCurrentCameraPosition = () => {
    return { x: window.currentField.fieldCameraPosition.next.x, y: window.currentField.fieldCameraPosition.next.y }
}
const stopShakeTweenChainAndWaitForCurrentTweenToEnd = async (config) => {
    // Break the chain of tweens
    shakeQueue.push(config)

    // Wait for this is the next shake to be executed
    while (JSON.stringify(shakeQueue[0]) !== JSON.stringify(config)) {
        console.log('waitForShake wait other op')
        await sleep(1000 / 30)
    }
    // Stop the chained tweens
    const tweenKeys = Object.keys(SHAKE_TWEEN_GROUP._tweens)
    for (let i = 0; i < tweenKeys.length; i++) {
        const tweenKey = tweenKeys[i]
        const currentTween = SHAKE_TWEEN_GROUP._tweens[tweenKey]
        currentTween._chainedTweens = []
    }
    // Wait for current tween to finish
    while (Object.keys(SHAKE_TWEEN_GROUP._tweens).length > 0) {
        console.log('waitForShake wait tween')
        await sleep(1000 / 30)
    }
    shakeQueue.shift()
    console.log('waitForShake END')
}
const stopShake = async () => {
    const frames = Math.max(shakeConfig.x.frames, shakeConfig.y.frames)
    const time = Math.floor(frames * 1000 / 30)
    const from = window.currentField.fieldCameraPosition.shake.next
    const resetTween = new TWEEN.Tween(from, SHAKE_TWEEN_GROUP).to({ x: 0, y: 0 }, time).easing(TWEEN.Easing.Quadratic.InOut)
    resetTween.start()
}
const shakeAxis = async (axis, amplitude, frames) => {
    const time = Math.floor(frames * 1000 / 30)
    const from = window.currentField.fieldCameraPosition.shake.next
    const amplitudeFactored = Math.round(amplitude / 2)
    const tweens = []
    const steps = [
        -1, 1.14, -1.34, 0.61, -0.49, 0.64, -0.25, 0.47, -1.20, -0.01,
        1.14, -0.86, 0.81, -0.58, 0.68, -1.31, 0.44, -0.91, 0.03, -0.97,
        1.25, -0.76, 0.48, -0.99, 1.34, -0.85, 0.55, -0.65, 0.07, -0.83,
        -1]
    // Note: This seems to be random, but appears to be a preconfigured set of points
    // I've documented the first 30 and then loop, I'm not sure how large the proper set it
    for (let i = 0; i < steps.length; i++) {
        tweens.push(new TWEEN.Tween(from, SHAKE_TWEEN_GROUP).to({ [axis]: amplitudeFactored * steps[i] }, time).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function () {
            console.log('shakeAxis UPDATE')
        }))

    }
    for (let i = 0; i < tweens.length - 1; i++) {
        tweens[i].chain(tweens[i + 1])
    }
    tweens[tweens.length - 1].chain(tweens[1])
    tweens[0].start()
}
const executeShake = async (config) => {
    if (JSON.stringify(shakeConfig) === JSON.stringify(config)) {
        return
    }
    await stopShakeTweenChainAndWaitForCurrentTweenToEnd(config)
    SHAKE_TWEEN_GROUP.removeAll()
    shakeConfig = config
    if (config.type === 0) {
        console.log('initShake TYPE 0', config)
        stopShake() // async
    }
    if (config.type === 1) {
        console.log('initShake TYPE 1', config)
        shakeAxis('x', config.x.amplitude, config.x.frames) // async
    }
    if (config.type === 2) {
        console.log('initShake TYPE 2', config)
        shakeAxis('y', config.y.amplitude, config.y.frames) // async
    }
    if (config.type === 3) {
        console.log('initShake TYPE 3', config)
        shakeAxis('x', config.x.amplitude, config.x.frames) // async
        shakeAxis('y', config.y.amplitude, config.y.frames) // async
    }
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
const scrollToEntity = async (entityId, tweenType, speed) => {
    const models = window.currentField.models.filter(m => m.userData.entityId === entityId)
    if (models.length > 0) {
        const model = models[0]
        // entityId is the array position according to the flevel.script.models[]

        let relativeToCamera = calculateViewClippingPointFromVector3(model.scene.position)
        console.log('SCRLA smooth?', entityId, getCurrentCameraPosition(), relativeToCamera)

        await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, tweenType, speed, model)

        // Follow model until it stops
        let oldPosition = { x: model.scene.position.x, y: model.scene.position.y, z: model.scene.position.z }
        await sleep(1000 / 60) // Should probably follow the tick...
        // console.log('model.scene.position 2', oldPosition, model.scene.position,
        //     oldPosition.x !== model.scene.position.x,
        //     oldPosition.y !== model.scene.position.y,
        //     oldPosition.z !== model.scene.position.z
        // )
        while (oldPosition.x !== model.scene.position.x || oldPosition.y !== model.scene.position.y || oldPosition.z !== model.scene.position.z) {
            oldPosition = { x: model.scene.position.x, y: model.scene.position.y, z: model.scene.position.z }
            await sleep(1000 / 60) // Should probably follow the tick...
            // console.log('model.scene.position LOOP', oldPosition, model.scene.position,
            //     oldPosition.x !== model.scene.position.x,
            //     oldPosition.y !== model.scene.position.y,
            //     oldPosition.z !== model.scene.position.z)
            let relativeToCameraUpdate = calculateViewClippingPointFromVector3(model.scene.position)
            console.log('setCameraPosition SCRLA end')
            setCameraPosition(relativeToCameraUpdate.x, relativeToCameraUpdate.y)
        }
        if (window.currentField.playableCharacter && window.currentField.playableCharacter.userData && model.scene.uuid === window.currentField.playableCharacter.scene.uuid) {
            window.currentField.fieldCameraFollowPlayer = true
        } else {
            model.userData.cameraFollowMe = true
        }
        console.log('SCRLA finished')
    } else {
        console.log('SCRLA no model, centering on screen')
        const centre = {
            x: window.currentField.metaData.assetDimensions.width / 2,
            y: window.currentField.metaData.assetDimensions.height / 2
        }
        await tweenCameraPosition(getCurrentCameraPosition(), centre, tweenType, speed)
        console.log('SCRLA finished')
    }
}
const removeFollowMeFromAllModels = () => {
    const models = window.currentField.models
    for (let i = 0; i < models.length; i++) {
        const model = models[i]
        if (model.userData.cameraFollowMe) {
            delete model.userData.cameraFollowMe
        }
    }
}

export {
    TweenType,
    tweenCameraPosition,
    getCurrentCameraPosition,
    executeShake,
    moveCameraToLeader,
    removeFollowMeFromAllModels,
    SHAKE_TWEEN_GROUP,
    scrollToEntity
}

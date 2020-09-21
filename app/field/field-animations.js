import * as THREE from '../../assets/threejs-r118/three.module.js'
import { sleep } from '../helpers/helpers.js'
import { getModelByEntityId, getDegreesFromTwoPoints } from './field-models.js'

const playAnimationOnceSyncReset = async (entityId, animationId, speed) => {
    await playAnimation(entityId, animationId, speed, false, THREE.LoopOnce)
}
const playAnimationPartialOnceSyncReset = async (entityId, animationId, speed, startFrame, endFrame) => {
    await playAnimation(entityId, animationId, speed, false, THREE.LoopOnce, startFrame, endFrame)
}
const playAnimationOnceAsyncReset = async (entityId, animationId, speed) => {
    playAnimation(entityId, animationId, speed, false, THREE.LoopOnce)
    return
}
const playAnimationPartialOnceAsyncReset = async (entityId, animationId, speed, startFrame, endFrame) => {
    playAnimation(entityId, animationId, speed, false, THREE.LoopOnce, startFrame, endFrame)
    return
}
const playAnimationOnceSyncHoldLastFrame = async (entityId, animationId, speed) => {
    await playAnimation(entityId, animationId, speed, true, THREE.LoopOnce)
}
const playAnimationPartialOnceSyncHoldLastFrame = async (entityId, animationId, speed, startFrame, endFrame) => {
    await playAnimation(entityId, animationId, speed, true, THREE.LoopOnce, startFrame, endFrame)
}
const playAnimationOnceAsyncHoldLastFrame = async (entityId, animationId, speed) => {
    playAnimation(entityId, animationId, speed, true, THREE.LoopOnce)
    return
}
const playAnimationPartialOnceAsyncHoldLastFrame = async (entityId, animationId, speed, startFrame, endFrame) => {
    playAnimation(entityId, animationId, speed, true, THREE.LoopOnce, startFrame, endFrame)
    return
}

const playAnimationLoopedAsync = async (entityId, animationId, speed) => {
    playAnimation(entityId, animationId, speed, false, THREE.LoopRepeat)
}
const playAnimation = async (entityId, animationId, speed, holdLastFrame, loopType, startFrame, endFrame) => {

    return new Promise(async (resolve) => {
        try {
            const model = getModelByEntityId(entityId)
            console.log('playAnimation', entityId, model.userData.entityName, animationId, speed, holdLastFrame, loopType, startFrame, endFrame, model)

            // await sleep(2000)
            // play once, sync, reset back to animation 0
            let animation = model.animations[animationId]
            if (startFrame !== undefined && endFrame !== undefined) {
                const newAnimation = splitClip(animation, startFrame, endFrame)
                console.log('playAnimation clipped', animation, newAnimation)
                animation = newAnimation
            }
            const action = model.mixer.clipAction(animation)
            // action.reset()

            const standAnimation = model.animations[0]
            const standAction = model.mixer.clipAction(standAnimation)

            action.loop = loopType
            if (holdLastFrame) {
                action.clampWhenFinished = true
            } else {
                action.clampWhenFinished = false
            }
            // TODO - speed
            // console.log('action', action, animation, model.mixer)
            model.mixer.addEventListener('finished', async (e) => { // Should really use one single eventListener than adding a new one each time
                // console.log('playAnimation finished', entityId, animationId, e, animation.uuid, e.action._clip.uuid, model.mixer._root.uuid, e.target._root.uuid)
                if (animation.uuid === e.action._clip.uuid && model.mixer._root.uuid === e.target._root.uuid) {
                    console.log('playAnimation finished', entityId, animationId, e, holdLastFrame)
                    // await sleep(1000)
                    if (!holdLastFrame) {
                        // TODO - Seems to be a slight delay here, need to fix
                        standAction.play()
                    }
                    resolve()
                }
            })
            model.mixer.stopAllAction()
            action.play()
        } catch (error) {
            console.log('error', error)
        }

    })
}
const waitForAnimationToFinish = async (entityId) => {
    return new Promise(async (resolve) => {
        console.log('waitForAnimationToFinish', entityId)
        const model = getModelByEntityId(entityId)
        let anyAnimationsRunning = false
        for (let i = 0; i < model.animations.length; i++) {
            const animation = model.animations[i]
            const isRunning = model.mixer.clipAction(animation).isRunning()
            console.log('waitForAnimationToFinish', entityId, 'animationId', i, isRunning)
            if (isRunning && i !== 0) { // Standing is the default animation
                anyAnimationsRunning = true
            }
        }
        if (anyAnimationsRunning) {
            model.mixer.addEventListener('finished', function (e) {
                // console.log('finished wait', e)
                resolve()
            })
        } else {
            resolve()
        }
    })
}
const stopAnimationHoldLastFrame = (entityId) => {
    console.log('stopAnimationHoldLastFrame', entityId)
    const model = getModelByEntityId(entityId)
    for (let i = 0; i < model.animations.length; i++) {
        const animation = model.animations[i]
        const clip = model.mixer.clipAction(animation)
        // console.log('waitForAnimationToFinish', entityId, 'animationId', i, clip.isRunning())
        if (clip.isRunning()) {
            clip.paused = true
        }
    }
}
const setPlayerMovementAnimationId = (animationId, movementType) => {
    console.log('setPlayerMovementAnimationId', animationId, movementType)
    switch (movementType) {
        case 0: window.currentField.playerAnimations.stand = animationId; break
        case 1: window.currentField.playerAnimations.walk = animationId; break
        case 2: window.currentField.playerAnimations.run = animationId; break
    }
}
const splitClip = (clip, startFrame, endFrame) => {
    console.log('splitClip', clip.duration, clip.duration * 30, clip.tracks)
    const split = THREE.AnimationUtils.subclip(clip, 'split', startFrame, endFrame, 30) // Think 30 is ok
    if (startFrame > 0 && startFrame === endFrame) {
        startFrame--
        console.log('splitClip adjust', startFrame, endFrame)
    }
    console.log('splitClip', clip.duration, '-', startFrame, endFrame, '->', split.duration, clip, split)
    return split
}
const playStandAnimation = (model) => {
    console.log('playStandAnimation', model)
    // for (let i = 0; i < model.animations.length; i++) {
    //     const animation = model.animations[i]
    //     const clip = model.mixer.clipAction(animation)
    //     console.log('playStandAnimation', 'animationId', i, clip.isRunning())
    //     if (clip.isRunning()) { // Standing is the default animation
    //         console.log('playStandAnimation', 'animationId', i, 'stopping')
    //         clip.stop()
    //     }
    // }
    model.mixer.stopAllAction()
    const standAnimation = model.animations[0]
    const standAction = model.mixer.clipAction(standAnimation)
    standAction.play()
}
export {
    playAnimationOnceSyncReset,
    playAnimationPartialOnceSyncReset,
    playAnimationOnceAsyncReset,
    playAnimationPartialOnceAsyncReset,
    playAnimationOnceSyncHoldLastFrame,
    playAnimationPartialOnceSyncHoldLastFrame,
    playAnimationOnceAsyncHoldLastFrame,
    playAnimationPartialOnceAsyncHoldLastFrame,
    playAnimationLoopedAsync,
    waitForAnimationToFinish,
    stopAnimationHoldLastFrame,
    setPlayerMovementAnimationId,
    playStandAnimation
}
import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { getModelByEntityName, getDegreesFromTwoPoints } from './field-models.js'

const playAnimationOnceSyncReset = async (entityName, animationId, speed) => {
    await playAnimation(entityName, animationId, speed, false, THREE.LoopOnce)
}
const playAnimationPartialOnceSyncReset = async (entityName, animationId, speed, startFrame, endFrame) => {
    await playAnimation(entityName, animationId, speed, false, THREE.LoopOnce, startFrame, endFrame)
}
const playAnimationOnceAsyncReset = async (entityName, animationId, speed) => {
    playAnimation(entityName, animationId, speed, false, THREE.LoopOnce)
}
const playAnimationPartialOnceAsyncReset = async (entityName, animationId, speed, startFrame, endFrame) => {
    playAnimation(entityName, animationId, speed, false, THREE.LoopOnce, startFrame, endFrame)
}
const playAnimationOnceSyncHoldLastFrame = async (entityName, animationId, speed) => {
    await playAnimation(entityName, animationId, speed, true, THREE.LoopOnce)
}
const playAnimationPartialOnceSyncHoldLastFrame = async (entityName, animationId, speed, startFrame, endFrame) => {
    await playAnimation(entityName, animationId, speed, true, THREE.LoopOnce, startFrame, endFrame)
}
const playAnimationOnceAsyncHoldLastFrame = async (entityName, animationId, speed) => {
    playAnimation(entityName, animationId, speed, true, THREE.LoopOnce)
}
const playAnimationPartialOnceAsyncHoldLastFrame = async (entityName, animationId, speed, startFrame, endFrame) => {
    playAnimation(entityName, animationId, speed, true, THREE.LoopOnce, startFrame, endFrame)
}

const playAnimationLoopedAsync = async (entityName, animationId, speed) => {
    playAnimation(entityName, animationId, speed, false, THREE.LoopRepeat)
}
const playAnimation = async (entityName, animationId, speed, holdLastFrame, loopType, startFrame, endFrame) => {
    return new Promise(async (resolve) => {
        console.log('playAnimation', entityName, animationId, speed)
        const model = getModelByEntityName(entityName)
        // play once, sync, reset back to animation 0
        let animation = model.animations[animationId]
        if (startFrame !== undefined && endFrame !== undefined) {
            animation = splitClip(animation, startFrame, endFrame)
        }
        const action = model.mixer.clipAction(animation)
        action.loop = loopType
        if (holdLastFrame) {
            action.clampWhenFinished = true
        } else {
            action.clampWhenFinished = false
        }
        // TODO - speed
        action.play()
        model.mixer.addEventListener('finished', function (e) {
            // console.log('finished', e)
            resolve()
        })
    })
}
const waitForAnimationToFinish = async (entityName) => {
    return new Promise(async (resolve) => {
        console.log('waitForAnimationToFinish', entityName)
        const model = getModelByEntityName(entityName)
        let anyAnimationsRunning = false
        for (let i = 0; i < model.animations.length; i++) {
            const animation = model.animations[i]
            const isRunning = model.mixer.clipAction(animation).isRunning()
            console.log('waitForAnimationToFinish', entityName, 'animationId', i, isRunning)
            if (isRunning) {
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
const stopAnimationHoldLastFrame = (entityName) => {
    console.log('stopAnimationHoldLastFrame', entityName)
    const model = getModelByEntityName(entityName)
    for (let i = 0; i < model.animations.length; i++) {
        const animation = model.animations[i]
        const clip = model.mixer.clipAction(animation)
        // console.log('waitForAnimationToFinish', entityName, 'animationId', i, clip.isRunning())
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
    console.log('splitClip', clip.duration, '-', startFrame, endFrame, '->', split.duration)
    return split
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
    setPlayerMovementAnimationId
}
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
            console.log('playAnimation: START', model.userData.entityName, entityId, animationId, speed, holdLastFrame, loopType, startFrame, endFrame, model)

            // Store current playing animation for !holdLastFrame
            const previousAnimationId = model.userData.lastAnimationId
            model.userData.lastAnimationId = animationId

            // await sleep(2000)
            // play once, sync, reset back to animation 0
            let animation = model.animations[animationId]
            if (startFrame !== undefined && endFrame !== undefined) {
                const newAnimation = splitClip(animation, startFrame, endFrame)
                console.log('playAnimation clipped', model.userData.entityName, entityId, animation, newAnimation)
                animation = newAnimation
            }
            const action = model.mixer.clipAction(animation)
            // action.reset()
            if (action.promises === undefined) {
                action.promises = []
            }
            action.promises.push(resolve)
            action.userData = {
                entityName: model.userData.entityName,
                entityId,
                animationId,
                type: 'animation'
            }


            action.loop = loopType
            if (holdLastFrame) {
                action.clampWhenFinished = true
            } else {
                action.clampWhenFinished = false
            }
            // TODO - speed
            // if (model.mixer.promise) {
            //     // window.alert(`Promise still exists - ${entityId} - ${animationId}`)
            //     console.log('playAnimation promise exists', entityId, animationId, model.mixer)
            //     // await sleep(1000 / 30 * 5)
            //     await waitForAnimationPromiseToBeResolved(model, entityId, animationId)
            //     // model.mixer.promise.resolve()

            // }
            // model.mixer.promise = {
            //     resolve: resolve,
            //     animationUuid: animation.uuid,
            //     mixerUuid: model.mixer._root.uuid,
            //     holdLastFrame,
            //     standAction,
            //     entityId,
            //     animationId
            // }
            // const uid = uuid()
            // model.mixer.addEventListener('finished', async (e) => {
            // console.log('playAnimation finished mixer', e, e.target, e.target.promise)
            // if (e.target.promise && e.target.promise.animationUuid === e.action._clip.uuid && e.target.promise.mixerUuid === e.target._root.uuid) {
            //     console.log('playAnimation finished mixer match', e.target.promise)
            //     if (!e.target.promise.holdLastFrame) {
            //         console.log('playAnimation finished mixer match stand')
            //         // e.target.promise.standAction.play()
            //     }
            //     const resolve = e.target.promise.resolve
            //     delete e.target.promise
            //     resolve()
            // }

            // Replay previous playing animation for !holdLastFrame
            // TODO - Assuming that we'll play the whole last animation in its entirity, probably not right
            // console.log('playAnimation finished', entityId, model.userData.entityName, animationId, previousAnimationId, holdLastFrame, startFrame)
            // if (previousAnimationId && !holdLastFrame) {
            //     if (startFrame === undefined && endFrame === undefined) {
            //         const previousAnimation = model.animations[previousAnimationId]
            //         const previousAnimationAtion = model.mixer.clipAction(previousAnimation)
            //         previousAnimationAtion.play()
            //     } else {
            //         const standAnimation = model.animations[0]
            //         const standAction = model.mixer.clipAction(standAnimation)
            //         standAction.play()
            //     }
            // }
            // console.log('playAnimation: END', model.userData.entityName, entityId, animationId)

            // resolve()
            // })

            // console.log('stopAllAction A', model.userData.entityName)
            model.mixer.stopAllAction()
            action.play()
            // Animation complete and resulting resolve CB bound in bindAnimationCompletion()
        } catch (error) {
            console.log('error', error)
        }

    })
}
const waitForAnimationPromiseToBeResolved = async (model, entityId, animationId) => {
    while (true) {
        await sleep(1000 / 30 * 2)
        console.log('playAnimation promise waitForAnimationPromiseToBeResolved', entityId, animationId, model.mixer.promise)
        if (model.mixer.promise === undefined) {
            console.log('playAnimation promise waitForAnimationPromiseToBeResolved RESOLVED', entityId, animationId, model.mixer.promise)
            return
        }
    }

}
const bindAnimationCompletion = (model) => {
    model.mixer.addEventListener('finished', async (e) => {
        console.log('playAnimation finished mixer', e.action.userData, e, e.target, e.target.promise)
        if (e.action.promises && e.action.promises.length > 0) {
            // while (e.action.promises.length) {
            console.log('playAnimation finished mixer promise', e.action.userData.entityName, e)
            const resolve = e.action.promises.pop()
            resolve()
            // }
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
            const animationAction = model.mixer.clipAction(animation)
            const isRunning = animationAction.isRunning()
            console.log('waitForAnimationToFinish', entityId, 'animationId', i, isRunning, animationAction, animationAction.loop)
            // If this animation is a looping animation, stop it from looping to it plays its last loop
            if (animationAction.loop === THREE.LoopRepeat) {
                animationAction.setLoop(THREE.LoopOnce, 1)
            }
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
    let split
    console.log('splitClip START:', clip.duration, clip.duration * 30, clip.tracks)
    if (startFrame > 0 && startFrame === endFrame) {
        startFrame--
        console.log('splitClip ADJUST:', startFrame, endFrame)
        split = THREE.AnimationUtils.subclip(clip, 'split', startFrame, endFrame, 30) // Think 30 is ok
        while (split.duration === 0) {
            startFrame--
            console.log('splitClip ADJUST:', startFrame, endFrame)
            split = THREE.AnimationUtils.subclip(clip, 'split', startFrame, endFrame, 30) // Think 30 is ok
        }
    } else {
        split = THREE.AnimationUtils.subclip(clip, 'split', startFrame, endFrame, 30) // Think 30 is ok
    }


    console.log('splitClip END:', clip.duration, '-', startFrame, endFrame, '->', split.duration, clip, split)
    return split
}
const playStandAnimation = (model) => {
    console.log('playStandAnimation', model.userData.entityName, model)
    // for (let i = 0; i < model.animations.length; i++) {
    //     const animation = model.animations[i]
    //     const clip = model.mixer.clipAction(animation)
    //     console.log('playStandAnimation', 'animationId', i, clip.isRunning())
    //     if (clip.isRunning()) { // Standing is the default animation
    //         console.log('playStandAnimation', 'animationId', i, 'stopping')
    //         clip.stop()
    //     }
    // }
    // console.log('stopAllAction B', model.userData.entityName)
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
    playStandAnimation,
    bindAnimationCompletion
}
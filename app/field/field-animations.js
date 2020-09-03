import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getModelByEntityName } from './field-models.js'

const playAnimationOnceSyncReset = async (entityName, animationId, speed) => {
    await playAnimation(entityName, animationId, speed, false, THREE.LoopOnce)
}
const playAnimationOnceAsyncReset = async (entityName, animationId, speed) => {
    playAnimation(entityName, animationId, speed, false, THREE.LoopOnce)
}
const playAnimationOnceSyncHoldLastFrame = async (entityName, animationId, speed) => {
    await playAnimation(entityName, animationId, speed, true, THREE.LoopOnce)
}
const playAnimationOnceAsyncHoldLastFrame = async (entityName, animationId, speed) => {
    playAnimation(entityName, animationId, speed, true, THREE.LoopOnce)
}
const playAnimationLoopedAsync = async (entityName, animationId, speed) => {
    playAnimation(entityName, animationId, speed, false, THREE.LoopRepeat)
}
const playAnimation = async (entityName, animationId, speed, holdLastFrame, loopType) => {
    return new Promise(async (resolve) => {
        console.log('playAnimation', entityName, animationId, speed)
        const model = getModelByEntityName(entityName)
        // play once, sync, reset back to animation 0
        const action = model.mixer.clipAction(model.animations[animationId])
        action.loop = loopType
        if (holdLastFrame) {
            console.log('clamp')
            action.clampWhenFinished = true
        } else {
            action.clampWhenFinished = false
        }
        // TODO - speed
        action.play()
        model.mixer.addEventListener('finished', function (e) {
            console.log('finished', e)
            resolve()
        })
    })
}
export {
    playAnimationOnceSyncReset,
    playAnimationOnceAsyncReset,
    playAnimationOnceSyncHoldLastFrame,
    playAnimationOnceAsyncHoldLastFrame,
    playAnimationLoopedAsync
}
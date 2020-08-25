import { sleep } from '../helpers/helpers.js'
import { adjustViewClipping, calculateViewClippingPointFromVector3 } from './field-scene.js'
import { getBankData } from '../data/savemap.js'
import { TweenType, tweenCameraPosition, getCurrentCameraPosition } from './field-op-codes-camera-media-helper.js'


const SCR2D = async (op) => {
    console.log('SCR2D', op)
    const targetX = op.b1 == 0 ? op.targetX : getBankData(op.b1, op.targetX)
    const targetY = op.b2 == 0 ? op.targetY : getBankData(op.b2, op.targetY) // In frames

    const to = {
        x: (window.currentField.metaData.assetDimensions.width / 2) + targetX,
        y: (window.currentField.metaData.assetDimensions.height / 2) + targetY
    }
    // await sleep(2000)
    console.log('SCR2D instant', op, getCurrentCameraPosition(), to)
    await tweenCameraPosition(getCurrentCameraPosition(), to, TweenType.Smooth, 15)
    return {}
}
const SCR2DC = async (op) => {
    console.log('SCR2DC', op)
    const targetX = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const targetY = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const speed = op.b3 == 0 ? op.s : getBankData(op.b3, op.s)

    const to = {
        x: (window.currentField.metaData.assetDimensions.width / 2) + targetX,
        y: (window.currentField.metaData.assetDimensions.height / 2) + targetY
    }
    // await sleep(2000)
    console.log('SCR2DC smooth', op, getCurrentCameraPosition(), to)
    await tweenCameraPosition(getCurrentCameraPosition(), to, TweenType.Smooth, speed)
    return {}
}
const SCR2DL = async (op) => {
    console.log('SCR2DL', op)
    const targetX = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const targetY = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const speed = op.b3 == 0 ? op.s : getBankData(op.b3, op.s)

    const to = {
        x: (window.currentField.metaData.assetDimensions.width / 2) + targetX,
        y: (window.currentField.metaData.assetDimensions.height / 2) + targetY
    }
    // await sleep(2000)
    console.log('SCR2DL linear', op, getCurrentCameraPosition(), to)
    await tweenCameraPosition(getCurrentCameraPosition(), to, TweenType.Linear, speed)
    return {}
}
const SCRCC = async (op) => {
    console.log('SCRCC', op)
    let relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
    console.log('SCRCC smooth?', op, getCurrentCameraPosition(), relativeToCamera)
    await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, TweenType.Smooth, 30)
    return {}
}
const SCRLA = async (op) => { // CHAR -> adds model.userData.entityId = entity script array i
    console.log('SCRLA', op)
    const speed = op.b == 0 ? op.s : getBankData(op.b, op.s)
    let tweenType = TweenType.Instant
    if (op.t === 1) {
        tweenType = TweenType.Instant
    } else if (op.t === 2) {
        tweenType = TweenType.Linear
    } else if (op.t === 3) {
        tweenType = TweenType.Smooth
    }

    const entities = window.currentField.models.filter(m => m.userData.entityId === op.e)
    if (entities.length > 0) {
        const entity = entities[0]
        // entityId is the array position according to the flevel.script.entities[]

        let relativeToCamera = calculateViewClippingPointFromVector3(entity.scene.position)
        console.log('SCRLA smooth?', op, getCurrentCameraPosition(), relativeToCamera)

        await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, tweenType, speed, entity)

        // Follow entity until it stops
        let oldPosition = { x: entity.scene.position.x, y: entity.scene.position.y, z: entity.scene.position.z }
        await sleep(1000 / 60) // Should probably follow the tick...
        // console.log('entity.scene.position 2', oldPosition, entity.scene.position,
        //     oldPosition.x !== entity.scene.position.x,
        //     oldPosition.y !== entity.scene.position.y,
        //     oldPosition.z !== entity.scene.position.z
        // )
        while (oldPosition.x !== entity.scene.position.x || oldPosition.y !== entity.scene.position.y || oldPosition.z !== entity.scene.position.z) {
            oldPosition = { x: entity.scene.position.x, y: entity.scene.position.y, z: entity.scene.position.z }
            await sleep(1000 / 60) // Should probably follow the tick...
            // console.log('entity.scene.position LOOP', oldPosition, entity.scene.position,
            //     oldPosition.x !== entity.scene.position.x,
            //     oldPosition.y !== entity.scene.position.y,
            //     oldPosition.z !== entity.scene.position.z)
            let relativeToCameraUpdate = calculateViewClippingPointFromVector3(entity.scene.position)
            adjustViewClipping(relativeToCameraUpdate.x, relativeToCameraUpdate.y)
        }
        console.log('SCRLA finished')
        return {}
    } else {
        console.log('SCRLA no entity, centering on screen')
        const centre = {
            x: window.currentField.metaData.assetDimensions.width / 2,
            y: window.currentField.metaData.assetDimensions.height / 2
        }
        await tweenCameraPosition(getCurrentCameraPosition(), centre, tweenType, speed)
        return {}
    }

}
// Just for debug
setTimeout(async () => {
    await SCRLA({
        b: 0,
        s: 60,
        e: 202,
        t: 3
    })
    console.log('done')
}, 10000)

// setTimeout(async () => {
//     const entity = window.currentField.models.filter(m => m.userData.entityId === 20)[0]
//     let frameCount = 0
//     while (frameCount < 200) {
//         // console.log('entity.scene.position.y', entity.scene.position.y)
//         entity.scene.position.y = entity.scene.position.y - 0.001
//         frameCount++
//         await sleep(1000 / 60)

//     }
// }, 10000)
export {
    SCRLA,
    SCR2D,
    SCRCC,
    SCR2DC,
    SCR2DL
}
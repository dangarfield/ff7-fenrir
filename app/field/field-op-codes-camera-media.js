import { sleep } from '../helpers/helpers.js'
import { adjustViewClipping, calculateViewClippingPointFromVector3 } from './field-scene.js'
import { getBankData } from '../data/savemap.js'
import { TweenType, tweenCameraPosition, getCurrentCameraPosition, tweenShake } from './field-op-codes-camera-media-helper.js'

const SHAKE = async (op) => {
    console.log('SHAKE:', op)
    // There is a lot of guesswork here
    // TODO - I'm only shaking on the y axis, I assume the u3,u4 params change this?! This is ok for now
    const position = getCurrentCameraPosition()
    const frames = op.s >= 10 ? op.s : Math.ceil(op.s / 8) // Making this appear of for fast (cargoin) and slow (ship_2)
    const amplitude = Math.max(1, op.a / 4)
    for (let count = 0; count <= op.c; count++) {
        // console.log('SHAKE: COUNT', count, amplitude, frames)
        await tweenShake(position, { y: `+${amplitude}` }, frames)
        await tweenShake(position, { y: `-${amplitude * 2}` }, frames)
        await tweenShake(position, { y: `+${amplitude}` }, frames)
    }
    // console.log('SHAKE: END', op)
    return {}
}
const SCRLO = async (op) => {
    console.log('SCRLO', op, 'THIS OP CODE IS NOT IN USE')
    return {}
}

const SCRLC = async (op) => {
    // Lots of assumptions here. No docs. Looks like its async and then SCRLW is called before it continues
    // Looks like it has speed, tween type and potentially member party params
    // I'm just assuming that it is going to the playableCharacter position for now
    console.log('SCRLC', op)
    const speed = op.p1 == 0 ? op.p2 : getBankData(op.p1, op.p2)
    let tweenType = TweenType.Instant
    if (op.p4 === 1) {
        tweenType = TweenType.Instant
    } else if (op.p4 === 2) {
        tweenType = TweenType.Linear
    } else if (op.p4 === 3) {
        tweenType = TweenType.Smooth
    }

    let relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
    console.log('SCRLC smooth?', op, getCurrentCameraPosition(), relativeToCamera)
    tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, tweenType, speed)
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
const SCRCC = async (op) => {
    console.log('SCRCC', op)
    let relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
    console.log('SCRCC smooth?', op, getCurrentCameraPosition(), relativeToCamera)
    await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, TweenType.Smooth, 30)
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
const SCRLW = async (op) => {
    console.log('SCRLW', op)
    // Note: I have made all of the scrolls sync execution and haven't been convinced otherwise therefore, this
    // should just work. If I need to make selective scoll op codes sync, then just add a isScrolling 
    while (window.currentField.isScrolling) {
        await sleep(1000 / 60 * 10) // Sleep for 1/6 of a second
    }
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

const SCRLP = async (op) => {
    console.log('SCRLP', op)
    const speed = op.b == 0 ? op.s : getBankData(op.b, op.s)
    let tweenType = TweenType.Instant
    if (op.t === 1) {
        tweenType = TweenType.Instant
    } else if (op.t === 2) {
        tweenType = TweenType.Linear
    } else if (op.t === 3) {
        tweenType = TweenType.Smooth
    }

    const memberName = window.data.savemap.party.members[op.e]
    console.log('memberName', memberName)
    const entities = window.currentField.models.filter(m => m.userData.playerName === memberName)
    console.log('entities', entities)
    if (entities.length > 0 && memberName !== undefined) {
        const entity = entities[0]
        let relativeToCamera = calculateViewClippingPointFromVector3(entity.scene.position)
        console.log('SCRLP smooth?', op, getCurrentCameraPosition(), relativeToCamera)
        await tweenCameraPosition(getCurrentCameraPosition(), relativeToCamera, tweenType, speed)
        return {}
    } else {
        console.log('SCRLP no entity or members, centering on screen')
        const centre = {
            x: window.currentField.metaData.assetDimensions.width / 2,
            y: window.currentField.metaData.assetDimensions.height / 2
        }
        await tweenCameraPosition(getCurrentCameraPosition(), centre, tweenType, speed)
        return {}
    }

}

// Just for debug
// setTimeout(async () => {
//     while (true) {
//         // SEA
//         // await SHAKE({ u1: 0, u2: 0, c: 3, u3: 0, u4: 0, a: 15, s: 64 })
//         // await sleep(1000 / 60 * 60)
//         // await SHAKE({ u1: 0, u2: 0, c: 0, u3: 0, u4: 0, a: 0, s: 1 })
//         // await sleep(1000 / 60 * 50)
//         // await SHAKE({ u1: 0, u2: 0, c: 17, u3: 0, u4: 0, a: 17, s: 64 })
//         // await sleep(1000 / 60 * 60)
//         // await SHAKE({ u1: 0, u2: 0, c: 0, u3: 0, u4: 0, a: 0, s: 1 })
//         // await sleep(1000 / 60 * 200)

//         // TRAIN
//         await SHAKE({ u1: 0, u2: 0, c: 2, u3: 0, u4: 0, a: 5, s: 2 })
//         await sleep(1000 / 60 * 10)
//         await SHAKE({ u1: 0, u2: 0, c: 0, u3: 0, u4: 0, a: 0, s: 1 })
//         await sleep(1000 / 60 * 15)

//         console.log('looped')
//     }
//     await SCRLC({
//         p1: 0,
//         p2: 60,
//         p3: 0,
//         p4: 3
//     })
//     console.log('SCRLC after')
//     await SCRLW()
//     console.log('SCRLW after')
// }, 9000)

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
    SHAKE,
    SCRLO,
    SCRLC,
    SCRLA,
    SCR2D,
    SCRCC,
    SCR2DC,
    SCRLW,
    SCR2DL,
    SCRLP
}
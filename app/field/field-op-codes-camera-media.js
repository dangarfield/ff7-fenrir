import { sleep } from '../helpers/helpers.js'
import { adjustViewClipping } from './field-scene.js'
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
    await tweenCameraPosition(getCurrentCameraPosition(), to, TweenType.Instant)
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

export {
    SCR2D,
    SCR2DC,
    SCR2DL
}
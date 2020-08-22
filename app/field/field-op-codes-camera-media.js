import { sleep } from '../helpers/helpers.js'
import { adjustViewClipping } from './field-scene.js'

const SCR2D = async (ops, op) => {
    const x = (window.currentField.metaData.assetDimensions.width / 2) + op.targetX
    const y = (window.currentField.metaData.assetDimensions.height / 2) + op.targetY
    // await sleep(2000)
    console.log('SCR2D', op, x, y)
    adjustViewClipping(x, y)
    return {}
}

export {
    SCR2D
}
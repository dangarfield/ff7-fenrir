import {
    changeBackgroundParamState, clearBackgroundParam,
    clearBackgroundDepth, scrollBackground, rollBackgroundParamState
} from './field-backgrounds.js'
import { sleep } from '../helpers/helpers.js'
import { getBankData } from '../data/savemap.js'
const BGON = async (op) => {
    console.log('BGON', op)
    const param = op.b1 == 0 ? op.a : getBankData(op.b1, op.a)
    const state = op.b2 == 0 ? op.l : getBankData(op.b2, op.l)
    changeBackgroundParamState(param, state, true)
    return {}
}
const BGOFF = async (op) => {
    console.log('BGOFF', op)
    const param = op.b1 == 0 ? op.a : getBankData(op.b1, op.a)
    const state = op.b2 == 0 ? op.l : getBankData(op.b2, op.l)
    changeBackgroundParamState(param, state, false)
    return {}
}
const BGCLR = async (op) => {
    console.log('BGCLR', op)
    const param = op.b == 0 ? op.a : getBankData(op.b, op.a)
    clearBackgroundParam(param)
    return {}
}
const BGROL = async (op) => {
    console.log('BGROL', op)
    const param = op.b == 0 ? op.a : getBankData(op.b, op.a)
    rollBackgroundParamState(param, true)
    return {}
}
const BGROL2 = async (op) => {
    console.log('BGRO2', op)
    const param = op.b == 0 ? op.a : getBankData(op.b, op.a)
    rollBackgroundParamState(param, false)
    return {}
}
const BGPDH = async (op) => {
    console.log('BGCLR', op)
    const z = op.b1 == 0 ? op.z : getBankData(op.b1, op.z)
    clearBackgroundDepth(op.l, z)
    return {}
}
const BGSCR = async (op) => {
    console.log('BGSCR', op)
    const x = op.bx == 0 ? op.x : getBankData(op.bx, op.x)
    const y = op.by == 0 ? op.y : getBankData(op.by, op.y)
    scrollBackground(op.l, x, y)
    return {}
}
// setTimeout(async () => {
//     console.log('BG OP CODES: START')

//     await sleep(1000)
//     await BGON({ b1: 0, b2: 0, a: 2, l: 0 })
//     // await sleep(1000)
//     // await BGON({ b1: 0, b2: 0, a: 2, l: 1 })
//     await sleep(1000)
//     await BGCLR({ b: 0, a: 2 })
//     await sleep(1000)
//     while (true) {
//         await sleep(1000 / 30 * 4)
//         await BGON({ b1: 0, b2: 0, a: 2, l: 0 })
//         await sleep(1000 / 30 * 4)
//         await BGOFF({ b1: 0, b2: 0, a: 2, l: 0 })
//         await BGON({ b1: 0, b2: 0, a: 2, l: 1 })
//         await sleep(1000 / 30 * 4)
//         await BGOFF({ b1: 0, b2: 0, a: 2, l: 1 })

//     }
//     console.log('BG OP CODES: END')
// }, 10000)

export {
    BGPDH,
    BGSCR,
    BGON,
    BGOFF,
    BGROL,
    BGROL2,
    BGCLR
}
import {
  changeBackgroundParamState,
  clearBackgroundParam,
  clearBackgroundDepth,
  scrollBackground,
  rollBackgroundParamState,
  storePalette,
  loadPalette,
  addPalette
} from './field-backgrounds.js'
import { sleep } from '../helpers/helpers.js'
import { getBankData } from '../data/savemap.js'
const BGON = async op => {
  console.log('BGON', op)
  const param = op.b1 === 0 ? op.a : getBankData(op.b1, op.a)
  const state = op.b2 === 0 ? op.l : getBankData(op.b2, op.l)
  changeBackgroundParamState(param, state, true)
  return {}
}
const BGOFF = async op => {
  console.log('BGOFF', op)
  const param = op.b1 === 0 ? op.a : getBankData(op.b1, op.a)
  const state = op.b2 === 0 ? op.l : getBankData(op.b2, op.l)
  changeBackgroundParamState(param, state, false)
  return {}
}
const BGCLR = async op => {
  console.log('BGCLR', op)
  const param = op.b === 0 ? op.a : getBankData(op.b, op.a)
  clearBackgroundParam(param)
  return {}
}
const BGROL = async op => {
  console.log('BGROL', op)
  const param = op.b === 0 ? op.a : getBankData(op.b, op.a)
  rollBackgroundParamState(param, true)
  return {}
}
const BGROL2 = async op => {
  console.log('BGRO2', op)
  const param = op.b === 0 ? op.a : getBankData(op.b, op.a)
  rollBackgroundParamState(param, false)
  return {}
}
const BGPDH = async op => {
  console.log('BGCLR', op)
  const z = op.b1 === 0 ? op.z : getBankData(op.b1, op.z)
  clearBackgroundDepth(op.l, z)
  return {}
}
const BGSCR = async op => {
  console.log('BGSCR', op)
  const x = op.bx === 0 ? op.x : getBankData(op.bx, op.x)
  const y = op.by === 0 ? op.y : getBankData(op.by, op.y)
  scrollBackground(op.l, x, y)
  return {}
}
const STPLS = async (op) => {
  console.log('STPLS', op)
  storePalette(op.p, op.t, op.start, op.size)
  return {}
}
const LDPLS = async (op) => {
  console.log('LDPLS', op)
  loadPalette(op.p, op.t, op.start, op.size)
  return {}
}
const ADPAL = async (op) => {
  console.log('ADPAL', op)
  const s = op.b1 === 0 ? op.s : getBankData(op.b1, op.s)
  const t = op.b2 === 0 ? op.t : getBankData(op.b2, op.t)
  const b = op.b3 === 0 ? op.b : getBankData(op.b3, op.b)
  const g = op.b4 === 0 ? op.g : getBankData(op.b4, op.g)
  const r = op.b5 === 0 ? op.r : getBankData(op.b5, op.r)

  const size = op.size

  addPalette(s, t, r, g, b, size)
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

export { BGPDH, BGSCR, BGON, BGOFF, BGROL, BGROL2, BGCLR,
  STPLS, LDPLS, ADPAL }

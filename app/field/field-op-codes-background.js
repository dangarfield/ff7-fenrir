import {
  changeBackgroundParamState,
  clearBackgroundParam,
  clearBackgroundDepth,
  scrollBackground,
  rollBackgroundParamState,
  storePalette,
  loadPalette,
  addPalette,
  multiplyPalette
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
// TODO - ordering
const STPLS = async (op) => { // LOOKS GOOD
  console.log('STPLS', op)
  storePalette(op.s, op.d, op.start, op.size + 1)
  return {}
}
const STPAL = async (op) => { // LOOKS GOOD
  console.log('STPAL', op)
  const s = op.b1 === 0 ? op.s : getBankData(op.b1, op.s)
  const d = op.b2 === 0 ? op.d : getBankData(op.b2, op.d)
  storePalette(s, d, 0, op.size + 1)
  return {}
}
const LDPLS = async (op) => { // LOOKS GOOD
  console.log('LDPLS', op)
  loadPalette(op.s, op.d, op.start, op.size + 1)
  return {}
}
const LDPAL = async (op) => { // LOOKS GOOD
  console.log('LDPAL', op)
  const s = op.b1 === 0 ? op.s : getBankData(op.b1, op.s)
  const d = op.b2 === 0 ? op.d : getBankData(op.b2, op.d)
  loadPalette(s, d, 0, op.size + 1)
  return {}
}
const ADPAL = async (op) => { // Seems Good
  console.log('ADPAL', op)
  const s = op.b1 === 0 ? op.s : getBankData(op.b1, op.s)
  const d = op.b2 === 0 ? op.d : getBankData(op.b2, op.d)
  const b = op.b3 === 0 ? op.b : getBankData(op.b3, op.b)
  const g = op.b4 === 0 ? op.g : getBankData(op.b4, op.g)
  const r = op.b5 === 0 ? op.r : getBankData(op.b5, op.r)
  const size = op.size
  addPalette(s, d, 255 - r, 255 - g, 255 - b, 0, size + 1) // 255-???
  return {}
}
const ADPAL2 = async (op) => { // Seems Good
  console.log('ADPAL2', op)
  const b = op.b2 === 0 ? op.b : getBankData(op.b2, op.b)
  const g = op.b3 === 0 ? op.g : getBankData(op.b3, op.g)
  const r = op.b4 === 0 ? op.r : getBankData(op.b4, op.r)
  const size = op.size
  addPalette(op.s, op.d, 255 - r, 255 - g, 255 - b, op.start, size + 1) // 255-???
  return {}
}

const MPPAL2 = async (op) => { // Seems Good
  console.log('MPPAL2', op)
  const s = op.b1 === 0 ? op.s : getBankData(op.b1, op.s)
  const d = op.b2 === 0 ? op.d : getBankData(op.b2, op.d)
  const b = op.b3 === 0 ? op.b : getBankData(op.b3, op.b)
  const g = op.b4 === 0 ? op.g : getBankData(op.b4, op.g)
  const r = op.b5 === 0 ? op.r : getBankData(op.b5, op.r)
  const size = op.size
  multiplyPalette(s, d, r, g, b, 0, size + 1) // 255-???
  return {}
}
const CPPAL = async (op) => {
  console.log('CPPAL', op)
  const s = op.b1 === 0 ? op.s : getBankData(op.b1, op.s)
  const d = op.b2 === 0 ? op.d : getBankData(op.b2, op.d)
  loadPalette(s, d, 0, op.size + 1) // Is this the same?!
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
  BGPDH, BGSCR, BGON, BGOFF, BGROL, BGROL2, BGCLR,
  STPLS, STPAL, LDPLS, LDPAL, ADPAL, MPPAL2, CPPAL, ADPAL2
}

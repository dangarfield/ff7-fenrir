import {
  createWindow,
  resetWindow,
  moveWindow,
  resizeWindow,
  setWindowMode,
  setWindowTextParam,
  setSpecialMode,
  setSpecialClock,
  setSpecialNumber,
  showMessageWaitForInteraction,
  closeWindow,
  setDialogColor
} from './field-dialog.js'
import {
  transitionOutAndLoadMenu,
  transitionOutAndLoadTutorial
} from './field-actions.js'
import { getBankData, setBankData } from '../data/savemap.js'
import { setMenuEnabled } from './field-module.js'

const WINDOW = async op => {
  console.log('WINDOW', op)
  createWindow(op.n, op.x, op.y, op.w, op.h)
  return {}
}
const WREST = async op => {
  console.log('WREST', op)
  resetWindow(op.w)
  return {}
}

const WMOVE = async op => {
  console.log('WMOVE', op)
  moveWindow(op.w, op.x, op.y)
  return {}
}
const WSIZW = async op => {
  console.log('WSIZW', op)
  resizeWindow(op.i, op.x, op.y, op.w, op.h)
  return {}
}
const WMODE = async op => {
  console.log('WMODE', op)
  setWindowMode(op.w, op.m, op.p)
  return {}
}

const MPARA = async op => {
  console.log('MPARA', op)
  const value = op.b === 0 ? op.v : getBankData(op.b, op.v)
  const windowId = op.w
  const varId = op.i
  setWindowTextParam(windowId, varId, value)
  return {}
}
const MPRA2 = async op => {
  console.log('MPRA2', op)
  const value = op.b === 0 ? op.v : getBankData(op.b, op.v)
  const windowId = op.w
  const varId = op.i
  setWindowTextParam(windowId, varId, value)
  return {}
}

const WSPCL = async op => {
  console.log('WSPCL', op)
  setSpecialMode(op.w, op.t, op.x, op.y)
  return {}
}

const STTIM = async op => {
  console.log('STTIM', op)
  const h = op.b1 === 0 ? op.h : getBankData(op.b1, op.h)
  const m = op.b2 === 0 ? op.m : getBankData(op.b2, op.m)
  const s = op.b3 === 0 ? op.s : getBankData(op.b3, op.s)
  setSpecialClock(h, m, s)
  return {}
}
const WNUMB = async op => {
  console.log('WNUMB', op)
  const low = op.b1 === 0 ? op.nLow : getBankData(op.b1, op.nLow)
  const high = op.b2 === 0 ? op.nHigh : getBankData(op.b2, op.nHigh)
  const windowId = op.w
  const number = parseInt(`${low}${high}`)
  const noDigitsToDisplay = op.c
  setSpecialNumber(windowId, number, noDigitsToDisplay)

  // If the value does not fit in the specified number of digits for the display, the higher units are not displayed.
  // let nLowDesc = b1 === 0 ? nLow : "Bank[" + b1 + "][" + nLow + "]";
  // let nHighDesc = b2 === 0 ? nHigh : "Bank[" + b2 + "][" + nHigh + "]";
  // b1: b1, b2: b2, w: w, nLow: nLow, nHigh: nHigh, c: c
  return {}
}

const WROW = async op => {
  console.log('WROW', op)
  // No instances in the game so I won't implement
  return {}
}
const GWCOL = async op => {
  console.log('GWCOL', op)
  // No instances in the game so I won't implement
  return {}
}
const SWCOL = async op => {
  console.log('SWCOL', op)

  const c = op.b1 === 0 ? op.c : getBankData(op.b1, op.c)
  const r = op.b2 === 0 ? op.r : getBankData(op.b2, op.r)
  const g = op.b3 === 0 ? op.g : getBankData(op.b3, op.g)
  const b = op.b4 === 0 ? op.b : getBankData(op.b4, op.b)

  setDialogColor(c, r, g, b)

  return {}
}
const MPNAM = async op => {
  console.log('MPNAM', op)
  window.data.savemap.location.currentLocation =
    window.currentField.data.script.dialogStrings[op.dialogId]
  console.log(
    'set map name',
    window.data.savemap.location.currentLocation,
    window.data.savemap
  )
  return {}
}

const MESSAGE = async op => {
  console.log('MESSAGE', op)
  await showMessageWaitForInteraction(
    op.n,
    window.currentField.data.script.dialogStrings[op.d],
    false
  )
  return {}
}
const ASK = async op => {
  console.log('ASK', op)
  const answer =
    op.f +
    (await showMessageWaitForInteraction(
      op.w,
      window.currentField.data.script.dialogStrings[op.d],
      true,
      op.f,
      op.l
    ))
  setBankData(op.ba, op.a, answer)
  console.log('ASK answer:', answer, '->', op.ba, op.a)
  return {}
}
const WCLSE = async op => {
  console.log('WCLSE', op)
  closeWindow(op.w)
  return {}
}
const WCLS = async op => {
  console.log('WCLS', op)
  await closeWindow(op.w)
  return {}
}
const MENU = async op => {
  console.log('MENU', op)
  const param = op.b === 0 ? op.p : getBankData(op.b, op.p)
  await transitionOutAndLoadMenu(op.t, param)
  return {}
}
const MENU2 = async op => {
  console.log('MENU2', op)
  setMenuEnabled(op.s === 0)
  // console.log('window.currentField.menuEnabled', window.currentField.menuEnabled)
  return {}
}
const TUTOR = async op => {
  console.log('TUTOR', op)
  await transitionOutAndLoadTutorial(op.t)
  return {}
}

export {
  TUTOR,
  WCLS,
  WSIZW,
  WSPCL,
  WNUMB,
  STTIM,
  MESSAGE,
  MPARA,
  MPRA2,
  MPNAM,
  ASK,
  MENU,
  MENU2,
  WINDOW,
  WMOVE,
  WMODE,
  WREST,
  WCLSE,
  WROW,
  GWCOL,
  SWCOL
}

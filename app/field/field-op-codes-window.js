import {
    createWindow, resetWindow, moveWindow, resizeWindow, setWindowMode, setWindowTextParam,
    setSpecialMode, setSpecialClock, setSpecialNumber, showMessageWaitForInteraction
} from './field-dialog.js'
import { SOUND } from './field-op-codes-camera-media.js'
import { getBankData } from '../data/savemap.js'


const WINDOW = async (op) => {
    console.log('WINDOW', op)
    createWindow(op.n, op.x, op.y, op.w, op.h)
    return {}
}
const WREST = async (op) => {
    console.log('WREST', op)
    resetWindow(op.w)
    return {}
}

const WMOVE = async (op) => {
    console.log('WMOVE', op)
    moveWindow(op.w, op.x, op.y)
    return {}
}
const WSIZW = async (op) => {
    console.log('WSIZW', op)
    resizeWindow(op.i, op.x, op.y, op.w, op.h)
    return {}
}
const WMODE = async (op) => {
    console.log('WMODE', op)
    setWindowMode(op.w, op.m, op.p)
    return {}
}

const MPARA = async (op) => {
    console.log('MPARA', op)
    const value = op.b == 0 ? op.v : getBankData(op.b, op.v)
    const windowId = op.w
    const varId = op.i
    setWindowTextParam(windowId, varId, value)
    return {}
}
const MPRA2 = async (op) => {
    console.log('MPRA2', op)
    const value = op.b == 0 ? op.v : getBankData(op.b, op.v)
    const windowId = op.w
    const varId = op.i
    setWindowTextParam(windowId, varId, value)
    return {}
}

const WSPCL = async (op) => {
    console.log('WSPCL', op)
    setSpecialMode(op.w, op.t, op.x, op.y)
    return {}
}

const STTIM = async (op) => {
    console.log('STTIM', op)
    const h = op.b1 == 0 ? op.h : getBankData(op.b1, op.h)
    const m = op.b2 == 0 ? op.m : getBankData(op.b2, op.m)
    const s = op.b3 == 0 ? op.s : getBankData(op.b3, op.s)
    setSpecialClock(h, m, s)
    return {}
}
const WNUMB = async (op) => {
    console.log('WNUMB', op)
    const low = op.b1 == 0 ? op.nLow : getBankData(op.b1, op.nLow)
    const high = op.b2 == 0 ? op.nHigh : getBankData(op.b2, op.nHigh)
    const windowId = op.w
    const number = parseInt(`${low}${high}`)
    const noDigitsToDisplay = op.c
    setSpecialNumber(windowId, number, noDigitsToDisplay)

    // If the value does not fit in the specified number of digits for the display, the higher units are not displayed.
    // let nLowDesc = b1 == 0 ? nLow : "Bank[" + b1 + "][" + nLow + "]";
    // let nHighDesc = b2 == 0 ? nHigh : "Bank[" + b2 + "][" + nHigh + "]";
    // b1: b1, b2: b2, w: w, nLow: nLow, nHigh: nHigh, c: c
    return {}
}

const WROW = async (op) => {
    console.log('WROW', op)
    // No instances in the game so I won't implement
    return {}
}
const GWCOL = async (op) => {
    console.log('GWCOL', op)
    // No instances in the game so I won't implement
    return {}
}
const MPNAM = async (op) => {
    console.log('MPNAM', op)
    window.data.savemap.location.currentLocation = window.currentField.data.script.dialogStrings[op.dialogId]
    console.log('set map name', window.data.savemap.location.currentLocation, window.data.savemap)
    return {}
}

const MESSAGE = async (op) => {
    console.log('MESSAGE', op)
    await showMessageWaitForInteraction(op.n, window.currentField.data.script.dialogStrings[op.d])
    return {}
}

setTimeout(async () => {
    await SOUND({ i: 1, d: 64 })

    // await createDialogBox(1, 10, 10, 239, 217, 1)
    // const currentChoice = await showWindowWithDialog(1, 'Do <fe>{PURPLE}[CANCEL]<fe>{WHITE}<br/>Re <fe>{PURPLE}[SWITCH]<fe>{WHITE}<br/>Mi <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Fa <fe>{PURPLE}[OK]<fe>{WHITE}<br/>So <fe>{PURPLE}[END]<fe>{WHITE}/<fe>{PURPLE}[HOME]<fe>{WHITE} + <fe>{PURPLE}[CANCEL]<fe>{WHITE}<br/>La <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[SWITCH]<fe>{WHITE}<br/>Ti <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Do <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[OK]<fe>{WHITE}<br/>Do Mi So (C)\tDirectional key Down<br/>Do Fa La (F)\tDirectional key Left<br/>Re So Ti (G)\tDirectional key Up<br/>Mi So Do (C)\tDirectional key Right<br/>End\t\t<fe>{PURPLE}[START]<fe>{WHITE} and select[SELECT]')

    await WINDOW({ n: 1, x: 40, y: 20, w: 133, h: 41 })
    await MESSAGE({ n: 1, d: 30 })
    console.log('WINDOW ENDED 1')
    // await MPARA({ w: 2, b: 0, i: 0, v: 'booya' })
    // await MPRA2({ w: 2, b: 0, i: 1, v: 'booya2' })
    await WINDOW({ n: 2, x: 10, y: 10, w: 239, h: 217 })
    // await WMODE({ w: 2, m: 0, p: 1 })
    await MESSAGE({ n: 2, d: 30 })
    // await WREST({ w: 1 })
    // await WMOVE({ w: 1, x: 50, y: 50 })
    // await WSIZW({ i: 1, x: 10, y: 10, w: 239, h: 217 })
    // await WMODE({ w: 1, m: 1, p: 1 })
    // await MPARA({ w: 1, b: 0, i: 0, v: 'booya' })
    // await MPRA2({ w: 1, b: 0, i: 1, v: 'booya2' })
    // await WSPCL({ w: 1, t: 1, x: 30, y: 30 })
    // await STTIM({ b1: 0, b2: 0, b3: 0, h: 1, m: 2, s: 3 })
    // await WNUMB({ w: 1, b1: 0, b2: 0, nLow: 1234, nHigh: 5678, c: 7 })
    // await MPNAM({ dialogId: 0 })
    console.log('WINDOW ENDED 2')
}, 10000)

export {
    WSIZW,
    WSPCL,
    WNUMB,
    STTIM,
    MESSAGE,
    MPARA,
    MPRA2,
    MPNAM,
    WINDOW,
    WMOVE,
    WMODE,
    WREST,
    WROW,
    GWCOL
}
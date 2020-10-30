import {
    createWindow, resetWindow, moveWindow, resizeWindow, setWindowMode, setWindowTextParam,
    setSpecialMode, setSpecialClock, setSpecialNumber, showMessageWaitForInteraction, closeWindow,
    setDialogColor
} from './field-dialog.js'
import { transitionOutAndLoadMenu, transitionOutAndLoadTutorial } from './field-actions.js'
import { SOUND } from './field-op-codes-camera-media.js'
import { getBankData, setBankData } from '../data/savemap.js'
import { sleep } from '../helpers/helpers.js'
import { setMenuEnabled } from './field-module.js'


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
const SWCOL = async (op) => {
    console.log('SWCOL', op)

    const c = op.b1 == 0 ? op.c : getBankData(op.b1, op.c)
    const r = op.b2 == 0 ? op.r : getBankData(op.b2, op.r)
    const g = op.b3 == 0 ? op.g : getBankData(op.b3, op.g)
    const b = op.b4 == 0 ? op.b : getBankData(op.b4, op.b)

    setDialogColor(c, r, g, b)

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
    await showMessageWaitForInteraction(op.n, window.currentField.data.script.dialogStrings[op.d], false)
    return {}
}
const ASK = async (op) => {
    console.log('ASK', op)
    const answer = op.f + (await showMessageWaitForInteraction(op.w, window.currentField.data.script.dialogStrings[op.d], true))
    setBankData(op.ba, op.a, answer)
    console.log('ASK answer:', answer, '->', op.ba, op.a)
    return {}
}
const WCLSE = async (op) => {
    console.log('WCLSE', op)
    await closeWindow(op.w)
    return {}
}
const WCLS = async (op) => {
    console.log('WCLS', op)
    await closeWindow(op.w)
    return {}
}
const MENU = async (op) => {
    console.log('MENU', op)
    const param = op.b == 0 ? op.p : getBankData(op.b, op.p)
    await transitionOutAndLoadMenu(op.t, param)
    return {}
}
const MENU2 = async (op) => {
    console.log('MENU2', op)
    setMenuEnabled(op.s === 0)
    // console.log('window.currentField.menuEnabled', window.currentField.menuEnabled)
    return {}
}
const TUTOR = async (op) => {
    console.log('TUTOR', op)
    await transitionOutAndLoadTutorial(op.t)
    return {}
}

setTimeout(async () => {
    await SOUND({ i: 1, d: 64 })
    // await MENU({ t: 9, b: 0, p: 1 })

    // await MENU2({ s: 1 })
    // await sleep(3000)
    // await MENU2({ s: 0 })
    // await WMODE({ w: 0, m: 1, p: 0 })
    // await WINDOW({ n: 0, x: 56, y: 45, w: 191, h: 25 })
    // await MESSAGE({ n: 0, d: 82 })
    // await WINDOW({ n: 2, x: 155, y: 8, w: 233, h: 41 })
    // await MESSAGE({ n: 2, d: 32 })
    // await WINDOW({ n: 2, x: 120, y: 8, w: 268, h: 41 })
    // await MESSAGE({ n: 2, d: 33 })
    // await WMODE({ w: 1, m: 2, p: 1 })


    // await WINDOW({ n: 2, x: 60, y: 145, w: 209, h: 73 })
    // await ASK({ w: 2, d: 2, f: 0, l: 1, ba: 2, a: 3 })
    // const currentChoice = await showWindowWithDialog(2, '{Cloud}<br/>“…”<br/>{CHOICE}Don\'t see many flowers around here<br/>{CHOICE}Never mind')

    // await sleep(3000)
    // await WCLSE({ w: 1 })
    // console.log('WINDOW ENDED 1')
    // // await MPARA({ w: 2, b: 0, i: 0, v: 'booya' })
    // // await MPRA2({ w: 2, b: 0, i: 1, v: 'booya2' })
    // await WINDOW({ n: 2, x: 10, y: 10, w: 239, h: 217 })
    // // await WMODE({ w: 2, m: 0, p: 1 })
    // await WMODE({ w: 2, m: 2, p: 0 })
    // await MESSAGE({ n: 2, d: 30 })

    // await WMODE({ w: 3, m: 1, p: 0 })
    // await WINDOW({ n: 3, x: 40, y: 20, w: 133, h: 41 })
    // await MESSAGE({ n: 3, d: 30 })

    // await WREST({ w: 1 })
    // await WMOVE({ w: 1, x: 50, y: 50 })
    // await WSIZW({ i: 1, x: 10, y: 10, w: 239, h: 217 })
    // await WMODE({ w: 1, m: 1, p: 1 })
    // await MPARA({ w: 1, b: 0, i: 0, v: 'booya' })
    // await MPRA2({ w: 1, b: 0, i: 1, v: 'booya2' })
    // await WSPCL({ w: 1, t: 2, x: 30, y: 30 })
    // // await STTIM({ b1: 0, b2: 0, b3: 0, h: 1, m: 2, s: 3 })
    // await WINDOW({ n: 1, x: 10, y: 10, w: 239, h: 217 })
    // await WNUMB({ w: 1, b1: 0, b2: 0, nLow: 1234, nHigh: 5678, c: 7 })
    // await MESSAGE({ n: 1, d: 1 })
    // await MPNAM({ dialogId: 0 })

    // await WSPCL({ w: 0, t: 2, x: 10, y: 10 })
    // await WSPCL({ w: 1, t: 2, x: 10, y: 10 })

    // setBankData(6, 20, 10)
    // await WNUMB({ w: 0, b1: 6, b2: 0, nLow: 20, nHigh: 0, c: 3 })
    // await WNUMB({ w: 1, b1: 6, b2: 0, nLow: 20, nHigh: 0, c: 5 })

    // await WINDOW({ n: 0, x: 141, y: 0, w: 102, h: 57 })
    // await WINDOW({ n: 1, x: 131, y: 70, w: 122, h: 57 })

    // await WMODE({ w: 0, m: 0, p: 1 })
    // await WMODE({ w: 1, m: 0, p: 1 })

    // await MESSAGE({ n: 0, d: 29 })
    // await MESSAGE({ n: 1, d: 30 })

    // setBankData(6, 20, 20)
    // await WNUMB({ w: 0, b1: 6, b2: 0, nLow: 20, nHigh: 0, c: 3 })
    // await WNUMB({ w: 1, b1: 6, b2: 0, nLow: 20, nHigh: 0, c: 5 })

    // await STTIM({ b1: 0, b2: 0, b3: 0, h: 0, m: 0, s: 10 })
    // await WMODE({ w: 3, m: 1, p: 1 })
    // await WINDOW({ n: 3, x: 10, y: 10, w: 160, h: 70 })
    // await WSPCL({ w: 3, t: 1, x: 10, y: 10 })
    // await MESSAGE({ n: 3, d: 25 })

    console.log('WINDOW ENDED 2')
}, 10000)

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
import { createDialogBox, showWindowWithDialog } from './field-dialog-helper.js'

let dialogs = []
let textParams = [] // Array of array of strings. textParams[windowId][varId] = 'value'
let displayClock = { h: 0, m: 0, s: 0 }

const WINDOW_MODE = {
    Normal: 'Normal',
    NoBackgroundBorder: 'NoBackgroundBorder',
    TransparentBackground: 'TransparentBackground'
}

const SPECIAL_MODE = {
    None: 'None',
    Clock: 'Clock',
    Numeric: 'Numeric'
}

const getDialogs = () => { return dialogs }

const clearAllDialogs = () => {
    dialogs = []
    textParams = []
    console.log('clearAllDialogs', dialogs, textParams)
}

const createWindow = (id, x, y, w, h) => {
    const dialog = {
        id: id,
        x: x,
        y: y,
        w: w,
        h: h,
        type: WINDOW_MODE.Normal,
        special: SPECIAL_MODE.None,
        // specialData: {}, // Example attribute, will be set by additional op codes
        playerCanClose: true,
        numbers: {},
        text: ''
        // group: new THREE.Group() // Example attribute, 
        // resolveCallback: {} // Example attribute, will be set by MESSAGE and ASK commands for interaction
    }
    console.log('createWindow', dialog)
    dialogs[id] = dialog
}

const resetWindow = (id) => {
    dialogs[id].x = 5
    dialogs[id].y = 5
    dialogs[id].w = 304
    dialogs[id].h = 69
    dialogs[id].type = WINDOW_MODE.Normal
    dialogs[id].special = SPECIAL_MODE.None
    delete dialogs[id].specialData
    dialogs[id].playerCanClose = true
    dialogs[id].numbers = {}
    textParams[id] = []
    console.log('resetWindow', id, dialogs[id])
}
const moveWindow = (id, x, y) => {
    dialogs[id].x = x
    dialogs[id].y = y
    console.log('moveWindow', id, dialogs[id])
}
const resizeWindow = (id, x, y, w, h) => {
    dialogs[id].x = x
    dialogs[id].y = y
    dialogs[id].w = w
    dialogs[id].h = h
    console.log('resizeWindow', id, dialogs[id])
}
const setWindowMode = (id, modeId, closabilityId) => {
    switch (modeId) {
        case 0: dialogs[id].type = WINDOW_MODE.Normal; break
        case 1: dialogs[id].type = WINDOW_MODE.NoBackgroundBorder; break
        case 2: dialogs[id].type = WINDOW_MODE.TransparentBackground; break
    }
    switch (closabilityId) {
        case 0: dialogs[id].playerCanClose = true; break
        case 1: dialogs[id].playerCanClose = false; break
    }
    console.log('setWindowMode', id, modeId, closabilityId, dialogs[id])
}

const setWindowTextParam = (windowId, varId, value) => {
    // The ID of the Window must be provided, but this can be still be provided before the window has been created using WINDOW
    if (textParams[windowId] === undefined) {
        textParams[windowId] = []
    }
    textParams[windowId][varId] = value
    console.log('setWindowTextParam', windowId, varId, value, textParams)
}

const setSpecialMode = (id, specialId, x, y) => {
    switch (specialId) {
        case 0: dialogs[id].special = SPECIAL_MODE.None; break
        case 1: dialogs[id].special = SPECIAL_MODE.Clock; break
        case 2: dialogs[id].special = SPECIAL_MODE.Numeric; break
    }
    dialogs[id].specialData = { x: x, y: y } // Value updated with STTIM & WNUMB
    console.log('setSpecialMode', id, specialId, dialogs[id])
}
const setSpecialClock = (h, m, s) => {
    // Not entirely sure how this works, need to investigate and come back later.
    // Think about pausing, menu, fields changes, battles etc
    // TODO - Stop clock interval
    displayClock.h = h
    displayClock.m = m
    displayClock.s = s
    // TODO - Begin clock countdown
    console.log('setSpecialClock', h, m, s, displayClock)
}
const setSpecialNumber = (id, number, noDigitsToDisplay) => {
    // TODO - Interactivity ?!
    // TODO - Multiple numbers ?!
    dialogs[id].specialData.number = number
    dialogs[id].specialData.noDigitsToDisplay = noDigitsToDisplay
    console.log('setSpecialNumber', id, dialogs[id])
}
const showMessageWaitForInteraction = async (id, dialogString) => {

    return new Promise(async (resolve) => {
        dialogs[id].resolveCallback = resolve

        dialogs[id].text = dialogString
        if (id === 2) { // Temp for testing
            dialogs[id].text = 'Do <fe>{PURPLE}[CANCEL]<fe>{WHITE}<br/>Re <fe>{PURPLE}[SWITCH]<fe>{WHITE}<br/>Mi <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Fa <fe>{PURPLE}[OK]<fe>{WHITE}<br/>So <fe>{PURPLE}[END]<fe>{WHITE}/<fe>{PURPLE}[HOME]<fe>{WHITE} + <fe>{PURPLE}[CANCEL]<fe>{WHITE}<br/>La <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[SWITCH]<fe>{WHITE}<br/>Ti <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Do <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[OK]<fe>{WHITE}<br/>Do Mi So (C)\tDirectional key Down<br/>Do Fa La (F)\tDirectional key Left<br/>Re So Ti (G)\tDirectional key Up<br/>Mi So Do (C)\tDirectional key Right<br/>End\t\t<fe>{PURPLE}[START]<fe>{WHITE} and select[SELECT]'
        }
        console.log('showMessageWaitForInteraction', id, dialogString, dialogs[id])
        await createDialogBox(dialogs[id])
        await showWindowWithDialog(dialogs[id])
    })

}


export {
    clearAllDialogs,
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
    getDialogs
}
import {
    createDialogBox, showWindowWithDialog, closeDialog, updateSpecialNumber,
    updateCountdownDisplays
} from './field-dialog-helper.js'
import { setCurrentCountdownClockTime, decrementCountdownClock } from '../data/savemap-alias.js'

let dialogs = []
let textParams = [] // Array of array of strings. textParams[windowId][varId] = 'value'

const MIN_WINDOW_EDGE_DISTANCE = 8

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
const getTextParams = () => { return textParams }

const adjustWindowPosition = (dialog, x, y, w, h) => {
    // Adjust window position if too close to an edge
    if (x < MIN_WINDOW_EDGE_DISTANCE) { dialog.x = MIN_WINDOW_EDGE_DISTANCE }
    if (y < MIN_WINDOW_EDGE_DISTANCE) { dialog.y = MIN_WINDOW_EDGE_DISTANCE }
    if (x + w + MIN_WINDOW_EDGE_DISTANCE > window.config.sizing.width) { dialog.x = window.config.sizing.width - w - MIN_WINDOW_EDGE_DISTANCE }
    if (y + h + MIN_WINDOW_EDGE_DISTANCE > window.config.sizing.height) { dialog.y = window.config.sizing.height - h - MIN_WINDOW_EDGE_DISTANCE }
}
const clearAllDialogs = () => {
    dialogs = []
    textParams = []
    console.log('clearAllDialogs', dialogs, textParams)
}

const createWindow = (id, x, y, w, h) => {
    let updateMethod = 'NEW'
    if (dialogs[id] === undefined) {
        const dialog = {
            id: id,
            x: x,
            y: y,
            w: w,
            h: h,
            mode: WINDOW_MODE.Normal, // Not sure, but  
            special: SPECIAL_MODE.None,
            // specialData: {}, // Example attribute, will be set by additional op codes
            playerCanClose: true,
            numbers: {},
            text: ''
            // group: new THREE.Group() // Example attribute, 
            // resolveCallback: {} // Example attribute, will be set by MESSAGE and ASK commands for interaction
        }
        // console.log('createWindow NEW', dialog)
        dialogs[id] = dialog
    } else {
        updateMethod = 'UPDATE'
        dialogs[id].x = x
        dialogs[id].y = y
        dialogs[id].w = w
        dialogs[id].h = h
    }
    adjustWindowPosition(dialogs[id], x, y, w, h)
    console.log('createWindow', updateMethod, dialogs[id])
}

const resetWindow = (id) => {
    dialogs[id].x = 5
    dialogs[id].y = 5
    dialogs[id].w = 304
    dialogs[id].h = 69
    dialogs[id].mode = WINDOW_MODE.Normal
    dialogs[id].special = SPECIAL_MODE.None
    delete dialogs[id].specialData
    dialogs[id].playerCanClose = true
    dialogs[id].numbers = {}
    textParams[id] = []
    adjustWindowPosition(dialogs[id], dialogs[id].x, dialogs[id].y, dialogs[id].w, dialogs[id].h)
    console.log('resetWindow', id, dialogs[id])
}
const moveWindow = (id, x, y) => {
    dialogs[id].x = x
    dialogs[id].y = y
    adjustWindowPosition(dialogs[id], x, y, dialogs[id].w, dialogs[id].h)
    console.log('moveWindow', id, dialogs[id])
}
const resizeWindow = (id, x, y, w, h) => {
    dialogs[id].x = x
    dialogs[id].y = y
    dialogs[id].w = w
    dialogs[id].h = h
    adjustWindowPosition(dialogs[id], x, y, w, h)
    console.log('resizeWindow', id, dialogs[id])
}
const setWindowMode = (id, modeId, closabilityId) => {
    if (dialogs[id] === undefined) { // Sometimes this can be called before the WINDOW op code
        createWindow(id, 10, 10, 10, 10)
    }
    switch (modeId) {
        case 0: dialogs[id].mode = WINDOW_MODE.Normal; break
        case 1: dialogs[id].mode = WINDOW_MODE.NoBackgroundBorder; break
        case 2: dialogs[id].mode = WINDOW_MODE.TransparentBackground; break
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
    if (dialogs[id] === undefined) { // Sometimes this can be called before the WINDOW op code
        createWindow(id, 10, 10, 10, 10)
    }
    switch (specialId) {
        case 0: dialogs[id].special = SPECIAL_MODE.None; break
        case 1: dialogs[id].special = SPECIAL_MODE.Clock; break
        case 2: dialogs[id].special = SPECIAL_MODE.Numeric; break
    }
    dialogs[id].specialData = { x: x, y: y } // Value updated with STTIM & WNUMB
    console.log('setSpecialMode', id, specialId, dialogs[id])
}
const setSpecialClock = (h, m, s) => {
    setCurrentCountdownClockTime(h, m, s)
    console.log('setSpecialClock', h, m, s)
}
const decrementCountdownClockAndUpdateDisplay = () => {
    // console.log('decrementCountdownClockAndUpdateDisplay')
    const activeCountdown = decrementCountdownClock()
    // console.log('decrementCountdownClockAndUpdateDisplay', activeCountdown)
    if (activeCountdown) {
        // console.log('decrementCountdownClockAndUpdateDisplay updateCountdownDisplays')
        updateCountdownDisplays()
    }
}
const setSpecialNumber = (id, number, noDigitsToDisplay) => {
    if (dialogs[id] === undefined) { // Sometimes this can be called before the WINDOW op code
        createWindow(id, 10, 10, 10, 10)
    }
    dialogs[id].specialData.number = number
    dialogs[id].specialData.noDigitsToDisplay = noDigitsToDisplay
    // The interactivity happens by calling WNUMB op code after window is displayed and the bank value has been updated
    updateSpecialNumber(dialogs[id])
    console.log('setSpecialNumber', id, dialogs[id])
}
const showMessageWaitForInteraction = async (id, dialogString, showChoicePointers) => {

    return new Promise(async (resolve) => {
        const dialog = dialogs[id]
        dialog.resolveCallback = resolve

        dialog.text = dialogString
        // if (id === 2) { // Temp for testing
        //     // dialog.text = 'Do {CLOUD} <fe>{PURPLE}<fe>{MEM1}[CANCEL]<fe>{WHITE}<br/>Re <fe>{PURPLE}<fe>{MEM1}[SWITCH]<fe>{WHITE}<br/>Mi <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Fa <fe>{PURPLE}[OK]<fe>{WHITE}<br/>So <fe>{PURPLE}[END]<fe>{WHITE}/<fe>{PURPLE}[HOME]<fe>{WHITE} + <fe>{PURPLE}[CANCEL]<fe>{WHITE}<br/>La <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[SWITCH]<fe>{WHITE}<br/>Ti <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Do <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[OK]<fe>{WHITE}<br/>Do Mi So (C)\tDirectional key Down<br/>Do Fa La (F)\tDirectional key Left<br/>Re So Ti (G)\tDirectional key Up<br/>Mi So Do (C)\tDirectional key Right<br/>End\t\t<fe>{PURPLE}[START]<fe>{WHITE} and select[SELECT]'
        //     dialog.text = '{BARRET}<br/>“Biggs!”'
        // }
        // if (id === 3) { // Temp for testing
        //     // dialog.text = 'Do {CLOUD} <fe>{PURPLE}<fe>{MEM1}[CANCEL]<fe>{WHITE}<br/>Re <fe>{PURPLE}<fe>{MEM1}[SWITCH]<fe>{WHITE}<br/>Mi <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Fa <fe>{PURPLE}[OK]<fe>{WHITE}<br/>So <fe>{PURPLE}[END]<fe>{WHITE}/<fe>{PURPLE}[HOME]<fe>{WHITE} + <fe>{PURPLE}[CANCEL]<fe>{WHITE}<br/>La <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[SWITCH]<fe>{WHITE}<br/>Ti <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Do <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[OK]<fe>{WHITE}<br/>Do Mi So (C)\tDirectional key Down<br/>Do Fa La (F)\tDirectional key Left<br/>Re So Ti (G)\tDirectional key Up<br/>Mi So Do (C)\tDirectional key Right<br/>End\t\t<fe>{PURPLE}[START]<fe>{WHITE} and select[SELECT]'
        //     dialog.text = '{BARRET}<br/>“Wedge!!”'
        // }

        console.log('showMessageWaitForInteraction', id, dialogString, dialog)
        await createDialogBox(dialog)
        await showWindowWithDialog(dialog, showChoicePointers)

        if (!dialog.playerCanClose) {
            dialog.resolveCallback()
        }
    })

}
const closeWindow = async (id) => {
    await closeDialog(dialogs[id])
}
const setDialogColor = (cornerId, r, g, b) => {
    switch (cornerId) {
        case 0: window.data.savemap.config.windowColorTL = [r, g, b]; break
        case 1: window.data.savemap.config.windowColorBL = [r, g, b]; break
        case 2: window.data.savemap.config.windowColorTR = [r, g, b]; break
        case 3: window.data.savemap.config.windowColorBR = [r, g, b]; break
    }
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
    getDialogs,
    getTextParams,
    closeWindow,
    decrementCountdownClockAndUpdateDisplay,
    WINDOW_MODE,
    SPECIAL_MODE,
    setDialogColor
}
let windows = []
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

const clearAllDialogs = () => {
    windows = []
    textParams = []
    console.log('clearAllDialogs', windows, textParams)
}

const createWindow = (id, x, y, w, h) => {
    const window = {
        id: id,
        x: x,
        y: y,
        w: w,
        h: h,
        type: WINDOW_MODE.Normal,
        special: SPECIAL_MODE.None,
        // specialData: {}, // Example attribute, will be set by additional op codes
        playerCanClose: true,
        numbers: {}
    }
    console.log('createWindow', window)
    windows[id] = window
}

const resetWindow = (id) => {
    windows[id].x = 5
    windows[id].y = 5
    windows[id].w = 304
    windows[id].h = 69
    windows[id].type = WINDOW_MODE.Normal
    windows[id].special = SPECIAL_MODE.None
    delete windows[id].specialData
    windows[id].playerCanClose = true
    windows[id].numbers = {}
    textParams[id] = []
    console.log('resetWindow', id, windows[id])
}
const moveWindow = (id, x, y) => {
    windows[id].x = x
    windows[id].y = y
    console.log('moveWindow', id, windows[id])
}
const resizeWindow = (id, x, y, w, h) => {
    windows[id].x = x
    windows[id].y = y
    windows[id].w = w
    windows[id].h = h
    console.log('resizeWindow', id, windows[id])
}
const setWindowMode = (id, modeId, closabilityId) => {
    switch (modeId) {
        case 0: windows[id].type = WINDOW_MODE.Normal; break
        case 1: windows[id].type = WINDOW_MODE.NoBackgroundBorder; break
        case 2: windows[id].type = WINDOW_MODE.TransparentBackground; break
    }
    switch (closabilityId) {
        case 0: windows[id].playerCanClose = true; break
        case 1: windows[id].playerCanClose = false; break
    }
    console.log('setWindowMode', id, modeId, closabilityId, windows[id])
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
        case 0: windows[id].special = SPECIAL_MODE.None; break
        case 1: windows[id].special = SPECIAL_MODE.Clock; break
        case 2: windows[id].special = SPECIAL_MODE.Numeric; break
    }
    windows[id].specialData = { x: x, y: y } // Value updated with STTIM & WNUMB
    console.log('setSpecialMode', id, specialId, windows[id])
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
    windows[id].specialData.number = number
    windows[id].specialData.noDigitsToDisplay = noDigitsToDisplay
    console.log('setSpecialNumber', id, windows[id])
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
    setSpecialNumber
}
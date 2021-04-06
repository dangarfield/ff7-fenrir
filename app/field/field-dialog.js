import {
  createDialogBox,
  showWindowWithDialog,
  closeDialog,
  updateSpecialNumber,
  updateCountdownDisplays
} from './field-dialog-helper.js'
import {
  setCurrentCountdownClockTime,
  decrementCountdownClock
} from '../data/savemap-alias.js'
import { setPlayableCharacterIsInteracting } from './field-actions.js'

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

const getDialogs = () => {
  return dialogs
}
const getTextParams = () => {
  return textParams
}

const adjustWindowPosition = (dialog, x, y, w, h) => {
  // Adjust window position if too close to an edge
  if (x < MIN_WINDOW_EDGE_DISTANCE) {
    dialog.x = MIN_WINDOW_EDGE_DISTANCE
  }
  if (y < MIN_WINDOW_EDGE_DISTANCE) {
    dialog.y = MIN_WINDOW_EDGE_DISTANCE
  }
  if (x + w + MIN_WINDOW_EDGE_DISTANCE > window.config.sizing.width) {
    dialog.x = window.config.sizing.width - w - MIN_WINDOW_EDGE_DISTANCE
  }
  if (y + h + MIN_WINDOW_EDGE_DISTANCE > window.config.sizing.height) {
    dialog.y = window.config.sizing.height - h - MIN_WINDOW_EDGE_DISTANCE
  }
}
const clearAllDialogs = () => {
  dialogs = []
  textParams = []
  console.log('clearAllDialogs', dialogs, textParams)
}

const getDialog = id => {
  console.log('getDialog: NEW', id)
  if (dialogs[id] === undefined) {
    const dialog = {
      id: id,
      x: 5, // Default values ?!
      y: 5, // Default values ?!
      w: 304, // Default values ?!
      h: 73, // Default values ?!
      mode: WINDOW_MODE.Normal, // Not sure, but
      special: SPECIAL_MODE.None,
      specialData: {}, // Example attribute, will be set by additional op codes
      playerCanClose: true,
      numbers: {},
      text: ''
      // group: new THREE.Group() // Example attribute,
      // resolveCallback: {} // Example attribute, will be set by MESSAGE and ASK commands for interaction
    }
    dialogs[id] = dialog
    return dialog
  } else {
    console.log('getDialog: EXISTS', id)
    return dialogs[id]
  }
}
const createWindow = (id, x, y, w, h) => {
  let updateMethod = 'NEW'
  const dialog = getDialog(id)
  dialog.x = x
  dialog.y = y
  dialog.w = w
  dialog.h = h
  adjustWindowPosition(dialog, x, y, w, h)
  console.log('createWindow', updateMethod, dialog)
}

const resetWindow = id => {
  dialogs[id] = undefined
  const dialog = getDialog(id)
  textParams[id] = []
  adjustWindowPosition(dialog, dialog.x, dialog.y, dialog.w, dialog.h)
  console.log('resetWindow', id, dialog)
}
const moveWindow = (id, x, y) => {
  const dialog = getDialog(id)
  dialog.x = x
  dialog.y = y
  adjustWindowPosition(dialog, x, y, dialog.w, dialog.h)
  console.log('moveWindow', id, dialog)
}
const resizeWindow = (id, x, y, w, h) => {
  const dialog = getDialog(id)
  dialog.x = x
  dialog.y = y
  dialog.w = w
  dialog.h = h
  adjustWindowPosition(dialog, x, y, w, h)
  console.log('resizeWindow', id, dialog)
}
const setWindowMode = (id, modeId, closabilityId) => {
  const dialog = getDialog(id) // Sometimes this can be called before the WINDOW op code
  switch (modeId) {
    case 0:
      dialog.mode = WINDOW_MODE.Normal
      break
    case 1:
      dialog.mode = WINDOW_MODE.NoBackgroundBorder
      break
    case 2:
      dialog.mode = WINDOW_MODE.TransparentBackground
      break
  }
  switch (closabilityId) {
    case 0:
      dialog.playerCanClose = true
      break
    case 1:
      dialog.playerCanClose = false
      break
  }
  console.log('setWindowMode', id, modeId, closabilityId, dialog)
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
  const dialog = getDialog(id) // Sometimes this can be called before the WINDOW op code
  switch (specialId) {
    case 0:
      dialog.special = SPECIAL_MODE.None
      break
    case 1:
      dialog.special = SPECIAL_MODE.Clock
      break
    case 2:
      dialog.special = SPECIAL_MODE.Numeric
      break
  }
  dialog.specialData.x = x // Values updated with STTIM & WNUMB
  dialog.specialData.y = y
  console.log('setSpecialMode', id, specialId, dialog)
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
  const dialog = getDialog(id) // Sometimes this can be called before the WINDOW op code

  dialog.specialData.number = number
  dialog.specialData.noDigitsToDisplay = noDigitsToDisplay
  // The interactivity happens by calling WNUMB op code after window is displayed and the bank value has been updated
  updateSpecialNumber(dialog)
  console.log('setSpecialNumber', id, dialog)
}
const showMessageWaitForInteraction = async (
  id,
  dialogString,
  showChoicePointers,
  askFirstLine,
  askLastLine
) => {
  return new Promise(async resolve => {
    const dialog = getDialog(id) // Sometimes this can be called before the WINDOW op code

    // Close dialogs that are already open
    if (dialog.group && dialog.group.userData.state !== 'closed') {
      console.log('showMessageWaitForInteraction ALREADY OPEN', id, dialog)
      await closeDialog(dialog)
    }

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

    console.log(
      'showMessageWaitForInteraction',
      id,
      dialogString,
      showChoicePointers,
      dialog
    )
    await createDialogBox(dialog)
    // TODO - Not sure about this, in 'needs' to stopping movement in tifas house, but in nibel basement with sephiroth, it 'needs' to be allowing movement...
    if (dialog.playerCanClose) {
      setPlayableCharacterIsInteracting(false)
    }
    await showWindowWithDialog(
      dialog,
      showChoicePointers,
      askFirstLine,
      askLastLine
    )
    // if (dialog.playerCanClose) {
    //     setPlayableCharacterCanMove(true)
    // }
    // Resolving this early if !playerCanClose breaks blinst_1-3
    // if (!dialog.playerCanClose) {
    //     dialog.resolveCallback()
    // }
  })
}
const closeWindow = async id => {
  const dialog = getDialog(id)
  await closeDialog(dialog)
}
const setDialogColor = (cornerId, r, g, b) => {
  switch (cornerId) {
    case 0:
      window.data.savemap.config.windowColorTL = [r, g, b]
      break
    case 1:
      window.data.savemap.config.windowColorBL = [r, g, b]
      break
    case 2:
      window.data.savemap.config.windowColorTR = [r, g, b]
      break
    case 3:
      window.data.savemap.config.windowColorBR = [r, g, b]
      break
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

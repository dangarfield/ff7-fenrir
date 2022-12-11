import { getMenuBlackOverlay, setMenuState, resolveMenuPromise } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  addGroupToDialog,
  addImageToDialog,
  addLevelToDialog,
  addCharacterSummary,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  createEquipmentMateriaViewer,
  EQUIPMENT_TYPE,
  removeGroupChildren,
  addShapeToDialog,
  WINDOW_COLORS_SUMMARY
} from './menu-box-helper.js'
import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'
import { MOD } from '../field/field-op-codes-assign.js'
import { setBankData } from '../data/savemap.js'

let infoDialog, infoGroup
let charDialog, charGroup
let navDialog, navGroup
let lettersDialog, lettersGroup

const MODE = { LETTERS: 'letters', NAV: 'nav' }
const DATA = {
  charName: '',
  char: {},
  name: '',
  nav: ['Space', 'Delete', 'Select', 'Default'],
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ,.+-abcdefghijklmnopqrstuvwxyz:;  0123456789',
  mode: MODE.LETTERS,
  lettersPos: 0,
  navPos: 2,
  defaultName: '',
  underscore: null,
  underscoreInterval: null,
  maxChars: 10
}
DATA[0x64] = 'Chocobo' // Looks as though 0x64 === chocobo ?

const setDataFromCharacter = (param) => {
  // TODO - param === 0x64 (100) -> Choco, not sure exactly where to persist this name quite yet, will do later
  DATA.charName = getPlayableCharacterName(param)
  DATA.char = window.data.savemap.characters[DATA.charName]
  DATA.defaultName = window.data.exe.defaultNames[param === 0x64 ? 9 : param]
  DATA.name = DATA.defaultName + ''
  DATA.maxChars = param === 0x64 ? 6 : 10
  window.DATA = DATA
}
const loadCharNameMenu = async param => {
  DATA.mode = MODE.LETTERS
  DATA.navPos = 2
  DATA.lettersPos = 0
  DATA.underscore = null
  setDataFromCharacter(param)
  console.log('char loadCharNameMenu', param, DATA)

  infoDialog = await createDialogBox({
    id: 15,
    name: 'infoDialog',
    w: 320, // TODO - all widths
    h: 33.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  infoDialog.visible = true
  infoGroup = addGroupToDialog(infoDialog, 25)

  charDialog = await createDialogBox({
    id: 14,
    name: 'charDialog',
    w: 320,
    h: 60,
    x: 0,
    y: 33.5,
    expandInstantly: true,
    noClipping: true
  })
  charDialog.visible = true
  charGroup = addGroupToDialog(charDialog, 24)

  navDialog = await createDialogBox({
    id: 12,
    name: 'navDialog',
    w: 236.5,
    h: 146.5,
    x: 0,
    y: 93.5,
    expandInstantly: true,
    noClipping: true
  })
  navDialog.visible = true
  navGroup = addGroupToDialog(navDialog, 22)

  lettersDialog = await createDialogBox({
    id: 13,
    name: 'lettersDialog',
    w: 86.5,
    h: 146.5,
    x: 233.5,
    y: 93.5,
    expandInstantly: true,
    noClipping: true
  })
  lettersDialog.visible = true
  lettersGroup = addGroupToDialog(lettersDialog, 23)

  drawInfo()
  drawChar()
  drawLetters()
  drawNav()
  drawPointer()
  drawName()
  startUnderscoreFlashing()
  await fadeOverlayOut(getMenuBlackOverlay())
  setMenuState('char-name-select')
}
const drawInfo = () => {
  removeGroupChildren(infoGroup)
  addTextToDialog(
    infoGroup,
    'Please enter a name.',
    'char-enter-name-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    22 - 8, // TODO - positions
    22 - 4,
    0.5
  )
}
const drawChar = () => {
  addImageToDialog(
    charDialog,
    'profiles',
    DATA.charName,
    'profile-image',
    15.5 + 20,
    39.5 + 24,
    0.5
  )

  const { x, y, xAdj } = getNamePos()
  for (let i = 0; i < DATA.maxChars; i++) {
    drawUnderscore(x, y, xAdj, i, charDialog, WINDOW_COLORS_SUMMARY.WHITE)
  }
}
const getNamePos = () => {
  return {
    x: 79.5, // TODO - positions
    y: 64,
    xAdj: 10
  }
}
const drawUnderscore = (x, y, xAdj, i, group, color) => {
  return addShapeToDialog(
    group,
    color,
    `char-underscore-${i}`,
    x + (xAdj * i) + 4,
    y + 5,
    8,
    1)
}
const startUnderscoreFlashing = () => {
  DATA.underscoreInterval = setInterval(function () {
    // console.log('char underscore interval start', DATA.underscore)
    if (!DATA.hasOwnProperty('underscore')) { // Failsafe
      console.log('char underscore clear interval')
      clearInterval(DATA.underscoreInterval)
    }
    if (DATA.underscore && DATA.underscore.hasOwnProperty('visible')) {
      DATA.underscore.visible = !DATA.underscore.visible // TODO - This really looks like a tweened fade / blend from grey to yellow
    }
  }, 75)
}
const drawName = () => {
  removeGroupChildren(charGroup)
  const nameSplit = DATA.name.split('')
  const { x, y, xAdj } = getNamePos()
  for (let i = 0; i < nameSplit.length; i++) {
    const letter = nameSplit[i]
    addTextToDialog(
      charGroup,
      letter,
      `char-name-letter-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x + (xAdj * i) - 8,
      y - 4,
      0.5
    )
  }

  if (nameSplit.length < DATA.maxChars) {
    drawUnderscore(x, y, xAdj, nameSplit.length, charGroup, WINDOW_COLORS_SUMMARY.GRAY)
    DATA.underscore = drawUnderscore(x, y, xAdj, nameSplit.length, charGroup, WINDOW_COLORS_SUMMARY.YELLOW)
  } else {
    DATA.underscore = null
  }
}
const getLettersPos = () => {
  return {
    x: 39, // TODO - positions
    y: 115,
    xAdj: 17,
    yAdj: 17
  }
}
const drawLetters = () => {
  const lettersSplit = DATA.letters.split('')
  const { x, y, xAdj, yAdj } = getLettersPos()
  for (let i = 0; i < lettersSplit.length; i++) {
    const letter = lettersSplit[i]
    addTextToDialog(
      lettersGroup,
      letter,
      `char-letters-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x + (xAdj * (i % 10)) - 8,
      y + (yAdj * Math.trunc(i / 10)) - 4,
      0.5
    )
  }
}

const getNavPos = () => {
  return {
    x: 255, // TODO - positions
    y: 175,
    yAdj: 17
  }
}
const drawNav = () => {
  const { x, y, yAdj } = getNavPos()
  for (let i = 0; i < DATA.nav.length; i++) {
    const navOption = DATA.nav[i]
    addTextToDialog(
      navGroup,
      navOption,
      `char-nav-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x - 8,
      y + (yAdj * i) - 4,
      0.5
    )
  }
}
const drawPointer = () => {
  if (DATA.mode === MODE.LETTERS) {
    const { x, y, xAdj, yAdj } = getLettersPos()
    movePointer(POINTERS.pointer1,
      x + (xAdj * (DATA.lettersPos % 10)) - 12, // TODO - Adjust
      y + (yAdj * Math.trunc(DATA.lettersPos / 10)) - 0
    )
  } else if (DATA.mode === MODE.NAV) {
    const { x, y, yAdj } = getNavPos()
    movePointer(POINTERS.pointer1,
      x - 12,
      y + (yAdj * DATA.navPos) - 0
    )
  } else {
    movePointer(POINTERS.pointer1, 0, 0, true)
  }
}
const navigate = (key) => {
  // console.log('char navigate', key, DATA)
  if (DATA.mode === MODE.LETTERS) {
    if (key === KEY.UP && DATA.lettersPos >= 10) {
      DATA.lettersPos = DATA.lettersPos - 10
    } else if (key === KEY.DOWN && DATA.lettersPos < 60) {
      DATA.lettersPos = DATA.lettersPos + 10
    } else if (key === KEY.RIGHT && DATA.lettersPos % 10 !== 9) {
      DATA.lettersPos++
    } else if (key === KEY.RIGHT && DATA.lettersPos % 10 === 9) {
      DATA.mode = MODE.NAV
    } else if (key === KEY.LEFT && DATA.lettersPos % 10 !== 0) {
      DATA.lettersPos--
    }
  } else if (DATA.mode === MODE.NAV) {
    if (key === KEY.UP && DATA.navPos > 0) {
      DATA.navPos--
    } else if (key === KEY.DOWN && DATA.navPos < (DATA.nav.length - 1)) {
      DATA.navPos++
    } else if (key === KEY.LEFT) {
      DATA.mode = MODE.LETTERS
    }
  }
  console.log('char navigate', key, DATA)
  drawPointer()
}
const deleteLetter = () => {
  if (DATA.mode === MODE.LETTERS && DATA.name.length > 0) {
    DATA.name = DATA.name.substr(0, DATA.name.length - 1)
    drawName()
  }
}
const addLetter = (letter) => {
  console.log('char addLetter', letter)
  if (DATA.name.length < DATA.maxChars) {
    DATA.name = DATA.name + letter
    drawName()
  }
}
const selectNameAndExit = () => {
  console.log('char selectNameAndExit')
  if (DATA.char && DATA.char.name) {
    DATA.char.name = DATA.name + ''
  } else {
    console.log('char selectNameAndExit CHOCO', DATA.name)
    // It looks like in the field elmin4_2, the 6 bytes for the chocobo name are stored in Bank[11][0] to Bank[11][5]
    DATA.name.padEnd(6, ' ').split('').map((v, i) => {
      console.log('char choco name', i, v)
      setBankData(11, i, v) // TODO - Should I change this into binary ?
    })
  }

  exitMenu()
}
const setDefault = () => {
  console.log('char setDefault')
  DATA.name = DATA.defaultName
  drawName()
}
const selectAction = () => {
  if (DATA.mode === MODE.LETTERS) {
    // TODO - not sure about selecting the 'space' letters, validate with game behaviour
    addLetter(DATA.letters.substr(DATA.lettersPos, 1))
  } else if (DATA.mode === MODE.NAV) {
    if (DATA.nav[DATA.navPos] === 'Space') {
      addLetter(' ')
    } else if (DATA.nav[DATA.navPos] === 'Delete') {
      deleteLetter()
    } else if (DATA.nav[DATA.navPos] === 'Select') {
      selectNameAndExit()
    } else if (DATA.nav[DATA.navPos] === 'Default') {
      setDefault()
    }
  }
}
const jumpToNavigationSelect = () => {
  DATA.mode = MODE.NAV
  DATA.navPos = 2
  drawPointer()
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  infoDialog.visible = false
  charDialog.visible = false
  navDialog.visible = false
  lettersDialog.visible = false

  clearInterval(DATA.underscoreInterval)
  delete DATA.underscore // Failsafe to stop interval from inside
  console.log('char EXIT')
  resolveMenuPromise()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CHAR', key, firstPress, state)

  if (state === 'char-name-select') {
    if (key === KEY.UP || key === KEY.DOWN || key === KEY.LEFT || key === KEY.RIGHT) {
      navigate(key) // TODO - not sure about navigating in the 'space' sections of the letters, validate with game behaviour
    } else if (key === KEY.START) {
      jumpToNavigationSelect()
    } else if (key === KEY.X) {
      deleteLetter()
    } else if (key === KEY.O) {
      selectAction()
    }
  }
}
export { loadCharNameMenu, keyPress }

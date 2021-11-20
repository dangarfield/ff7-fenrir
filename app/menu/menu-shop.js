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
  removeGroupChildren
} from './menu-box-helper.js'
import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'
import { MOD } from '../field/field-op-codes-assign.js'
import { navigateSelect } from '../world/world-destination-selector.js'

let itemShopDialog
let infoDialog, infoGroup
let navDialog

const MODE = {NAV: 'nav', BUY: 'buy', SELL: 'sell'}
const DATA = {
  nav: ['Buy', 'Sell', 'Exit'],
  mode: MODE.SEL,
  navPos: 0
}
const loadShopMenu = async param => {
  DATA.mode = MODE.NAV
  DATA.navPos = 0
  // DATA.lettersPos = 0
  // DATA.underscore = null
  // setDataFromCharacter(param)
  console.log('char loadShopMenu', param, DATA)

  itemShopDialog = await createDialogBox({
    id: 15,
    name: 'itemShopDialog',
    w: 82, // 82 // TODO - all widths
    h: 25.5, // 25.5
    x: 238, // 238
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  itemShopDialog.visible = true

  infoDialog = await createDialogBox({
    id: 13,
    name: 'infoDialog',
    w: 242, // TODO - all widths
    h: 25.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  infoDialog.visible = true
  infoGroup = addGroupToDialog(infoDialog, 23)

  navDialog = await createDialogBox({
    id: 12,
    name: 'navDialog',
    w: 87,
    h: 25.5,
    x: 144.5,
    y: 8,
    expandInstantly: true,
    noClipping: true
  })
  navDialog.visible = true

  // navDialog = await createDialogBox({
  //   id: 14,
  //   name: 'navDialog',
  //   w: 320,
  //   h: 25.5,
  //   x: 0,
  //   y: 25.5,
  //   expandInstantly: true,
  //   noClipping: true
  // })
  // navDialog.visible = true

  drawItemShop()
  drawInfo()
  drawNav()
  drawNavPointer()
  await fadeOverlayOut(getMenuBlackOverlay())
  setMenuState('shop-nav')
}
const drawItemShop = () => {
  // removeGroupChildren(itemShopDialog)
  addTextToDialog(
    itemShopDialog,
    'Item Shop',
    `shop-item-shop-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    254 - 8, // TODO - positions
    16 - 4,
    0.5
  )
}
const drawInfo = () => {
  removeGroupChildren(infoGroup)
  addTextToDialog(
    infoGroup,
    'Welcome!',
    `shop-info`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    22 - 8, // TODO - positions
    16 - 4,
    0.5
  )
}
const getNavPositions = () => {
  return {
    x: 152.5,
    y: 24,
    xAdj: 27.5
  }
}
const drawNav = () => {
  const {x, y, xAdj} = getNavPositions()
  for (let i = 0; i < DATA.nav.length; i++) {
    const navItem = DATA.nav[i]
    addTextToDialog(
      navDialog,
      navItem,
      `shop-nav-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x + (xAdj * i) - 8, // TODO - positions
      y - 4,
      0.5
    )
  }
}
const drawNavPointer = () => {
  const {x, y, xAdj} = getNavPositions()
  movePointer(POINTERS.pointer1, x + (xAdj * DATA.navPos) - 12, y - 0)
}
const navNavigate = (delta) => {
  DATA.navPos = DATA.navPos + delta
  if (DATA.navPos >= DATA.nav.length) {
    DATA.navPos = DATA.nav.length - 1
  } else if (DATA.navPos < 0) {
    DATA.navPos = 0
  }
  drawNavPointer()
}
const navSelect = () => {
  const menuName = DATA.nav[DATA.navPos]
  console.log('shop navSelect', DATA, menuName)
  if (menuName === 'Buy') {
    // TODO
  } else if (menuName === 'Sell') {
    // TODO
  } else if (menuName === 'Exit') {
    exitMenu()
  }
}
// const drawChar = () => {
//   addImageToDialog(
//     charDialog,
//     'profiles',
//     DATA.charName,
//     'profile-image',
//     15.5 + 20,
//     39.5 + 24,
//     0.5
//   )

//   const {x, y, xAdj} = getNamePos()
//   for (let i = 0; i < 10; i++) {
//     drawUnderscore(x, y, xAdj, i, charDialog, LETTER_COLORS.White)
//   }
// }
// const getNamePos = () => {
//   return {
//     x: 79.5, // TODO - positions
//     y: 64,
//     xAdj: 10
//   }
// }
// const drawUnderscore = (x, y, xAdj, i, group, color) => {
//   return addTextToDialog(
//     group,
//     '_', // TODO - replace this with the correct letter
//     `char-underscore-${i}`,
//     LETTER_TYPES.MenuBaseFont,
//     color,
//     x + (xAdj * i) - 8,
//     y - 4 + 5,
//     0.5
//   )
// }
// const startUnderscoreFlashing = () => {
//   DATA.underscoreInterval = setInterval(function () {
//     // console.log('char underscore interval start', DATA.underscore)
//     if (!DATA.hasOwnProperty('underscore')) { // Failsafe
//       console.log('char underscore clear interval')
//       clearInterval(DATA.underscoreInterval)
//     }
//     if (DATA.underscore && DATA.underscore.hasOwnProperty('visible')) {
//       DATA.underscore.visible = !DATA.underscore.visible // TODO - This really looks like a tweened fade / blend from grey to yellow
//     }
//   }, 75)
// }
// const drawName = () => {
//   removeGroupChildren(charGroup)
//   const nameSplit = DATA.name.split('')
//   const {x, y, xAdj} = getNamePos()
//   for (let i = 0; i < nameSplit.length; i++) {
//     const letter = nameSplit[i]
//     addTextToDialog(
//       charGroup,
//       letter,
//       `char-name-letter-${i}`,
//       LETTER_TYPES.MenuBaseFont,
//       LETTER_COLORS.White,
//       x + (xAdj * i) - 8,
//       y - 4,
//       0.5
//     )
//   }

//   if (nameSplit.length < 10) {
//     drawUnderscore(x, y, xAdj, nameSplit.length, charGroup, LETTER_COLORS.Gray)
//     DATA.underscore = drawUnderscore(x, y, xAdj, nameSplit.length, charGroup, LETTER_COLORS.Yellow)
//   } else {
//     DATA.underscore = null
//   }
// }
// const getLettersPos = () => {
//   return {
//     x: 39, // TODO - positions
//     y: 115,
//     xAdj: 17,
//     yAdj: 17
//   }
// }
// const drawLetters = () => {
//   const lettersSplit = DATA.letters.split('')
//   const {x, y, xAdj, yAdj} = getLettersPos()
//   for (let i = 0; i < lettersSplit.length; i++) {
//     const letter = lettersSplit[i]
//     addTextToDialog(
//       lettersGroup,
//       letter,
//       `char-letters-${i}`,
//       LETTER_TYPES.MenuBaseFont,
//       LETTER_COLORS.White,
//       x + (xAdj * (i % 10)) - 8,
//       y + (yAdj * Math.trunc(i / 10)) - 4,
//       0.5
//     )
//   }
// }

// const getNavPos = () => {
//   return {
//     x: 255, // TODO - positions
//     y: 175,
//     yAdj: 17
//   }
// }
// const drawNav = () => {
//   const {x, y, yAdj} = getNavPos()
//   for (let i = 0; i < DATA.nav.length; i++) {
//     const navOption = DATA.nav[i]
//     addTextToDialog(
//       navGroup,
//       navOption,
//       `char-nav-${i}`,
//       LETTER_TYPES.MenuBaseFont,
//       LETTER_COLORS.White,
//       x - 8,
//       y + (yAdj * i) - 4,
//       0.5
//     )
//   }
// }
// const drawPointer = () => {
//   if (DATA.mode === MODE.LETTERS) {
//     const {x, y, xAdj, yAdj} = getLettersPos()
//     movePointer(POINTERS.pointer1,
//       x + (xAdj * (DATA.lettersPos % 10)) - 12, // TODO - Adjust
//       y + (yAdj * Math.trunc(DATA.lettersPos / 10)) - 0
//     )
//   } else if (DATA.mode === MODE.NAV) {
//     const {x, y, yAdj} = getNavPos()
//     movePointer(POINTERS.pointer1,
//       x - 12,
//       y + (yAdj * DATA.navPos) - 0
//     )
//   } else {
//     movePointer(POINTERS.pointer1, 0, 0, true)
//   }
// }
// const navigate = (key) => {
//   // console.log('char navigate', key, DATA)
//   if (DATA.mode === MODE.LETTERS) {
//     if (key === KEY.UP && DATA.lettersPos >= 10) {
//       DATA.lettersPos = DATA.lettersPos - 10
//     } else if (key === KEY.DOWN && DATA.lettersPos < 60) {
//       DATA.lettersPos = DATA.lettersPos + 10
//     } else if (key === KEY.RIGHT && DATA.lettersPos % 10 !== 9) {
//       DATA.lettersPos++
//     } else if (key === KEY.RIGHT && DATA.lettersPos % 10 === 9) {
//       DATA.mode = MODE.NAV
//     } else if (key === KEY.LEFT && DATA.lettersPos % 10 !== 0) {
//       DATA.lettersPos--
//     }
//   } else if (DATA.mode === MODE.NAV) {
//     if (key === KEY.UP && DATA.navPos > 0) {
//       DATA.navPos--
//     } else if (key === KEY.DOWN && DATA.navPos < (DATA.nav.length - 1)) {
//       DATA.navPos++
//     } else if (key === KEY.LEFT) {
//       DATA.mode = MODE.LETTERS
//     }
//   }
//   console.log('char navigate', key, DATA)
//   drawPointer()
// }
// const deleteLetter = () => {
//   if (DATA.name.length > 0) {
//     DATA.name = DATA.name.substr(0, DATA.name.length - 1)
//     drawName()
//   }
// }
// const addLetter = (letter) => {
//   console.log('char addLetter', letter)
//   if (DATA.name.length < 10) {
//     DATA.name = DATA.name + letter
//     drawName()
//   }
// }
// const selectNameAndExit = () => {
//   console.log('char selectNameAndExit')
//   DATA.char.name = DATA.name + ''
//   exitMenu()
// }
// const setDefault = () => {
//   console.log('char setDefault')
//   DATA.name = DATA.defaultName
//   drawName()
// }
// const selectAction = () => {
//   if (DATA.mode === MODE.LETTERS) {
//     // TODO - not sure about selecting the 'space' letters, validate with game behaviour
//     addLetter(DATA.letters.substr(DATA.lettersPos, 1))
//   } else if (DATA.mode === MODE.NAV) {
//     if (DATA.nav[DATA.navPos] === 'Space') {
//       addLetter(' ')
//     } else if (DATA.nav[DATA.navPos] === 'Delete') {
//       deleteLetter()
//     } else if (DATA.nav[DATA.navPos] === 'Select') {
//       selectNameAndExit()
//     } else if (DATA.nav[DATA.navPos] === 'Default') {
//       setDefault()
//     }
//   }
// }
// const jumpToNavigationSelect = () => {
//   DATA.mode = MODE.NAV
//   DATA.navPos = 2
//   drawPointer()
// }
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  itemShopDialog.visible = false
  infoDialog.visible = false
  navDialog.visible = false

  console.log('shop EXIT')
  resolveMenuPromise()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CHAR', key, firstPress, state)

  if (state === 'shop-nav') {
    if (key === KEY.RIGHT) {
      navNavigate(1)
    } else if (key === KEY.LEFT) {
      navNavigate(-1)
    } else if (key === KEY.X) {
      navNavigate(3) // Push to far right
    } else if (key === KEY.O) {
      navSelect()
    }
  }
}
export { loadShopMenu, keyPress }

import { getMenuState, setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'

let configActions, itemDesc, itemParty, itemList

const loadConfigMenu = async () => {
  configActions = await createDialogBox({
    id: 3,
    name: 'configActions',
    w: 157,
    h: 29,
    x: 320 - 157,
    y: 240 - 1 - 29,
    slideX: 0,
    slideY: 240,
    expandInstantly: true,
    noClipping: true
  })
  await addTextToDialog(
    configActions,
    'Config actions - tbc',
    'home-loc',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    163,
    225,
    0.5
  )
  configActions.visible = true
  window.configActions = configActions
  await fadeOverlayOut(getHomeBlackOverlay())

  setMenuState('config')

  movePointer(POINTERS.pointer1, 237, 17)
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getHomeBlackOverlay())
  configActions.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CONFIG', key, firstPress, state)
  if (state === 'config') {
    if (key === KEY.X) {
      console.log('press MAIN MENU CONFIG EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
  }
}
export { loadConfigMenu, keyPress }

import { getMenuBlackOverlay, setMenuState } from './menu-module.js'
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
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'

let magicActions, itemDesc, itemParty, itemList

const loadMagicMenu = async partyMember => {
  magicActions = await createDialogBox({
    id: 3,
    name: 'itemActions',
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
    magicActions,
    `Magic menu - ${partyMember}`,
    'home-loc',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    163,
    225,
    0.5
  )
  magicActions.visible = true
  window.itemActions = magicActions
  await fadeOverlayOut(getMenuBlackOverlay())

  setMenuState('magic')

  movePointer(POINTERS.pointer1, 237, 17)
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  magicActions.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU MAGIC', key, firstPress, state)
  if (state === 'magic') {
    if (key === KEY.X) {
      console.log('press MAIN MENU MAGIC EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
  }
}
export { loadMagicMenu, keyPress }

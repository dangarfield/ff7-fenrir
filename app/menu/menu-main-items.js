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

let itemActions, itemDesc, itemParty, itemList

const loadItemsMenu = async () => {
  itemActions = await createDialogBox({
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
    itemActions,
    'Items actions - tbc',
    'home-loc',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    163,
    225,
    0.5
  )
  itemActions.visible = true
  window.itemActions = itemActions
  await fadeOverlayOut(getHomeBlackOverlay())

  setMenuState('items')

  movePointer(POINTERS.pointer1, 237, 17)
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getHomeBlackOverlay())
  itemActions.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU ITEMS', key, firstPress, state)
  if (state === 'items') {
    if (key === KEY.X) {
      console.log('press MAIN MENU ITEMS EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
  }
}
export { loadItemsMenu, keyPress }

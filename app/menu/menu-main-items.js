import {
  getMenuState,
  setMenuState,
  resolveMenuPromise
} from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  WINDOW_COLORS_SUMMARY,
  createDialogBox,
  slideFrom,
  slideTo,
  addTextToDialog,
  addImageToDialog,
  addCharacterSummary,
  getLetterTexture,
  addShapeToDialog,
  POINTERS,
  initPointers,
  movePointer,
  shrinkDialog,
  fadeOverlayOut
} from './menu-box-helper.js'
import { getHomeBlackOverlay } from './menu-main-home.js'
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
    'Item actions - tbc',
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

  // await Promise.all([
  //   slideFrom(homeNav),
  //   slideFrom(homeTime),
  //   slideFrom(homeLocation),
  //   slideFrom(homeMain)
  // ])
  setMenuState('items')

  movePointer(POINTERS.pointer1, 237, 17)
}
const exitMenu = async () => {
  console.log('exitMenu')
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU ITEMS', key, firstPress, state)
  if (state === 'items') {
    if (key === KEY.X) {
      console.log('press MAIN MENU ITEMS EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
    //   else if (key === KEY.O) {
    //     console.log('press MAIN MENU HOME SELECT')
    //     navSelect()
    //   } else if (key === KEY.UP) {
    //     console.log('press MAIN MENU HOME UP')
    //     navNavigation(true)
    //   } else if (key === KEY.DOWN) {
    //     console.log('press MAIN MENU HOME DOWN')
    //     navNavigation(false)
    //   }
  }
}
export { loadItemsMenu, keyPress }

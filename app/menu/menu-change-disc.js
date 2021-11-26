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
  ALIGN
} from './menu-box-helper.js'
import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'
import { MOD } from '../field/field-op-codes-assign.js'

let discDialog, discGroup

const loadChangeDiscMenu = async param => { // Note, this will never actually be called...
  if (param === null || param === undefined) {
    param = 0
  }
  console.log('disc loadChangeDiscMenu', param)

  discDialog = await createDialogBox({
    id: 15,
    name: 'discDialog',
    w: 320,
    h: 240,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  discDialog.visible = true
  removeGroupChildren(discDialog)
  discGroup = addGroupToDialog(discDialog, 25)

  drawDiscImages(param + 1)

  await fadeOverlayOut(getMenuBlackOverlay())
  setMenuState('disc')
}
const drawDiscImages = (discNo) => {
  removeGroupChildren(discGroup)

  const randomCharName = getPlayableCharacterName(Math.floor(Math.random() * 8))
  addImageToDialog(discGroup, 'char-bg', randomCharName, 'disc-char-image', 160, 0, 0.5, null, null, ALIGN.TOP)
  addImageToDialog(discGroup, 'insert-disc', `disk${discNo}`, 'disc-char-image', 160, 240 - 24, 0.5, null, null, ALIGN.BOTTOM)

  addTextToDialog(
    discGroup,
    `Press 〇 to continue`,
    `disc-text-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    160 - 8,
    230 - 4,
    0.5,
    null,
    true
  )
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  discDialog.visible = false

  console.log('disc EXIT')
  resolveMenuPromise()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU disc', key, firstPress, state)

  if (state === 'disc') {
    if (key === KEY.O) {
      exitMenu()
    }
  }
}
export { loadChangeDiscMenu, keyPress }

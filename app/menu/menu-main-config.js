import * as THREE from '../../assets/threejs-r118/three.module.js'
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

let configDescription,
  configOptions,
  configControls,
  configColorPreviewAll,
  configColorPreviewOne,
  configColorEditor

const loadConfigMenu = async () => {
  configDescription = await createDialogBox({
    id: 7,
    name: 'configDescription',
    w: 320,
    h: 25.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  configDescription.visible = true
  window.configDescription = configOptions

  configOptions = await createDialogBox({
    id: 8,
    name: 'configOptions',
    w: 320,
    h: 240 - 25.5,
    x: 0,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  configOptions.visible = true
  window.configOptions = configOptions

  configControls = await createDialogBox({
    id: 6,
    name: 'configControls',
    w: 320,
    h: 240 - 25.5,
    x: 0,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  // configDescription.visible = true
  window.configControls = configControls

  configColorPreviewAll = await createDialogBox({
    id: 5,
    name: 'configColorPreviewAll',
    w: 60,
    h: 25.5,
    x: 132,
    y: 30,
    expandInstantly: true,
    noClipping: true
  })
  configColorPreviewAll.visible = true
  window.configColorPreviewAll = configColorPreviewAll

  configColorPreviewOne = await createDialogBox({
    id: 5,
    name: 'configColorPreviewOne',
    w: 25.5,
    h: 25.5,
    x: 196,
    y: 30,
    expandInstantly: true,
    noClipping: true
  })
  // configColorPreviewOne.visible = true
  window.configColorPreviewOne = configColorPreviewOne

  configColorEditor = await createDialogBox({
    id: 5,
    name: 'configColorEditor',
    w: 184,
    h: 46,
    x: 132,
    y: 56.5,
    expandInstantly: true,
    noClipping: true
  })
  // configColorEditor.visible = true
  window.configColorEditor = configColorEditor

  drawConfigOptions()

  await fadeOverlayOut(getHomeBlackOverlay())

  setMenuState('config-select')

  movePointer(POINTERS.pointer1, 237, 17)
}

const CONFIG_DATA = {
  option: 0,
  options: [
    'Window color',
    'Sound',
    'Controller',
    'Cursor',
    'ATB',
    'Battle speed',
    'Battle message',
    'Field message',
    'Camera angle',
    'Magic order'
  ],
  optionGroups: []
}
window.CONFIG_DATA = CONFIG_DATA
const drawConfigOptions = () => {
  for (let i = 0; i < CONFIG_DATA.options.length; i++) {
    const option = CONFIG_DATA.options[i]
    addTextToDialog(
      configOptions,
      option,
      `config-option-title-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      23,
      44.5 + i * 20,
      0.5
    )
    const group = new THREE.Group()
    group.userData = {
      id: configOptions.userData.id,
      z: 100 - configOptions.userData.id
    }
    group.position.x = 124
    group.position.y = -44.5 + i * -20
    configOptions.add(group)
    CONFIG_DATA.optionGroups.push(group)
  }
  drawSoundOptions()
  drawControllerOptions()
  drawCursorOptions()
  drawATBOptions()
  drawBattleSpeedOptions()
  drawBattleMessageOptions()
  drawFieldMessageOptions()
  drawCameraAngleOptions()
  drawMagicOrderOptions()
}
const clearOptionGroup = i => {}

const X_POS_1 = 0
const X_POS_2_2 = 62
const X_POS_3_2 = 52
const X_POS_3_3 = 100
const X_POS_5_2 = 20
const X_POS_5_3 = 4
const X_POS_5_4 = 60
const X_POS_5_5 = 80
const X_POS_F = -10
const X_POS_S = 110

const drawSoundOptions = () => {
  const groupId = 1
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'No sound config available',
    '`config-option-sound',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Gray,
    X_POS_1,
    0,
    0.5
  )
}
const drawControllerOptions = () => {
  const groupId = 2
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Show controls',
    'config-option-controller',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_1,
    0,
    0.5
  )
}
const drawCursorOptions = () => {
  const groupId = 3
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Intial',
    'config-option-cursor-1',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Gray,
    X_POS_1,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Memory',
    'config-option-cursor-2',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_2_2,
    0,
    0.5
  )
}
const drawATBOptions = () => {
  const groupId = 4
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Active',
    'config-option-atb-1',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Gray,
    X_POS_1,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Recommended',
    'config-option-atb-2',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_3_2,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Wait',
    'config-option-atb-2',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_3_3,
    0,
    0.5
  )
}
const drawBattleSpeedOptions = () => {
  const groupId = 5
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Fast',
    'config-option-bsped-1',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_F,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Slow',
    'config-option-bsped-2',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_S,
    0,
    0.5
  )
}
const drawBattleMessageOptions = () => {
  const groupId = 6
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Fast',
    'config-option-bmess-1',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_F,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Slow',
    'config-option-bmess-2',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_S,
    0,
    0.5
  )
}
const drawFieldMessageOptions = () => {
  const groupId = 7
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Fast',
    'config-option-fmess-1',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_F,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Slow',
    'config-option-fmess-2',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_S,
    0,
    0.5
  )
}
const drawCameraAngleOptions = () => {
  const groupId = 8
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Auto',
    'config-option-camera-1',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_1,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Fixed',
    'config-option-camera-2',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Gray,
    X_POS_2_2,
    0,
    0.5
  )
}
const drawMagicOrderOptions = () => {
  const groupId = 9
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'No.',
    'config-option-magic-1',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_1,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    '1',
    'config-option-magic-2',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    X_POS_5_2,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'restore',
    'config-option-magic-3',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_5_3,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'attack',
    'config-option-magic-4',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_5_4,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'indirect',
    'config-option-magic-4',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    X_POS_5_5,
    0,
    0.5
  )
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getHomeBlackOverlay())
  configOptions.visible = false
  configDescription.visible = false
  configControls.visible = false
  configColorPreviewAll.visible = false
  configColorPreviewOne.visible = false
  configColorEditor.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CONFIG', key, firstPress, state)
  if (state === 'config-select') {
    if (key === KEY.X) {
      console.log('press MAIN MENU CONFIG EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
  }
}
export { loadConfigMenu, keyPress }

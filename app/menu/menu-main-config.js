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
  fadeOverlayIn,
  createHorizontalConfigSlider
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
    w: 51,
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
  CONFIG_DATA.option = 0
  pointerToOption(CONFIG_DATA.option)

  await fadeOverlayOut(getHomeBlackOverlay())

  setMenuState('config-select')
}

const CONFIG_DATA = {
  option: 0,
  options: [
    {
      name: 'Window color',
      description: 'Select colors for each corner of the window',
      type: 'color'
    },
    {
      name: 'Sound',
      description: 'Change the Sound Mode',
      type: 'none',
      value: 'No sound config available'
    },
    {
      name: 'Controller',
      description: 'Set buttons yourself',
      type: 'select',
      option: 1,
      options: ['Normal', 'Customise']
    },
    {
      name: 'Cursor',
      description: 'Save cursor when window is closed?',
      type: 'select',
      option: 0,
      options: ['Initial', 'Memory']
    },
    {
      name: 'ATB',
      description: 'Change battle time flow',
      type: 'select',
      option: 1,
      options: ['Active', 'Recommended', 'Wait']
    },
    {
      name: 'Battle speed',
      description: 'Change battle speed',
      type: 'slider',
      value: 0
    },
    {
      name: 'Battle message',
      description: 'Change battle message speed',
      type: 'slider',
      value: 0
    },
    {
      name: 'Field message',
      description: 'Change field message speed',
      type: 'slider',
      value: 0
    },
    {
      name: 'Camera angle',
      description: 'Select battle screen movement',
      type: 'select',
      option: 0,
      options: ['Auto', 'Fixed']
    },
    {
      name: 'Magic order',
      description: 'Select magic placement',
      type: 'scroll',
      option: 0,
      options: [
        ['restore', 'attack', 'indirect'],
        ['restore', 'indirect', 'attack'],
        ['attack', 'indirect', 'restore'],
        ['attack', 'restore', 'indirect'],
        ['indirect', 'restore', 'attack'],
        ['indirect', 'attack', 'restore']
      ]
    }
  ],
  optionGroups: []
}

window.CONFIG_DATA = CONFIG_DATA
const drawConfigOptions = () => {
  for (let i = 0; i < CONFIG_DATA.options.length; i++) {
    const option = CONFIG_DATA.options[i]
    addTextToDialog(
      configOptions,
      option.name,
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

    drawConfigOptionSet(i)
  }
  // drawSoundOptions()
  // drawControllerOptions()
  // drawCursorOptions()
  // drawATBOptions()
  // drawBattleSpeedOptions()
  // drawBattleMessageOptions()
  // drawFieldMessageOptions()
  // drawCameraAngleOptions()
  // drawMagicOrderOptions()
}
const clearOptionGroup = i => {}

const XPOS = {
  x1_1: 0,
  x2_1: 0,
  x2_2: 52,
  x3_1: 0,
  x3_2: 44,
  x3_3: 133,
  x5_1: 0,
  x5_2: 20,
  x5_3: 38.5,
  x5_4: 82.5,
  x5_5: 126.5,
  Fast: -10,
  Slow: 152
}
const drawConfigOptionSet = i => {
  const group = CONFIG_DATA.options[i]
  console.log('config drawConfigOptionSet', i, group)
  if (group.type === 'color') {
    // tbc
  } else if (group.type === 'none') {
    drawConfigOptionNone(i, group)
  } else if (group.type === 'select') {
    drawConfigOptionSelect(i, group)
  } else if (group.type === 'slider') {
    drawConfigOptionSlider(i)
  } else if (group.type === 'scroll') {
    drawConfigOptionScroll(i, group)
  }
}
const drawConfigOptionNone = (groupId, group) => {
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    group.value,
    `config-none-${groupId}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Gray,
    XPOS.x1_1,
    0,
    0.5
  )
}
const drawConfigOptionSelect = (groupId, group) => {
  clearOptionGroup(groupId)
  // console.log('config drawConfigOptionSelect', groupId)
  for (let i = 0; i < group.options.length; i++) {
    const option = group.options[i]
    addTextToDialog(
      CONFIG_DATA.optionGroups[groupId],
      option,
      `config-select-${groupId}-${i}`,
      LETTER_TYPES.MenuBaseFont,
      i === group.option ? LETTER_COLORS.White : LETTER_COLORS.Gray,
      XPOS[`x${group.options.length}_${i + 1}`],
      0,
      0.5
    )
  }
}
const drawConfigOptionSlider = groupId => {
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Fast',
    `config-slider-${groupId}a`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    XPOS.Fast,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'Slow',
    `config-slider-${groupId}b`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    XPOS.Slow,
    0,
    0.5
  )
  createHorizontalConfigSlider(CONFIG_DATA.optionGroups[groupId], 23, -0.5)
}
const drawConfigOptionScroll = (groupId, group) => {
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    'No.',
    `config-scroll-${groupId}-1`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    XPOS.x5_1,
    0,
    0.5
  )
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    '' + (group.option + 1),
    `config-scroll-${groupId}-2`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    XPOS.x5_2,
    0,
    0.5
  )
  for (let i = 0; i < 3; i++) {
    const value = group.options[group.option][i]
    addTextToDialog(
      CONFIG_DATA.optionGroups[groupId],
      value,
      `config-scroll-${groupId}-${i + 2}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      XPOS[`x5_${i + 3}`],
      0,
      0.5
    )
  }
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

const pointerToOption = i => {
  movePointer(POINTERS.pointer1, 13, 49.5 + i * 20)
  movePointer(POINTERS.pointer2, 0, 0, true)
}
const configOptionSelect = () => {}
const configOptionNavigate = up => {
  if (up) {
    CONFIG_DATA.option++
  } else {
    CONFIG_DATA.option--
  }
  if (CONFIG_DATA.option < 0) {
    CONFIG_DATA.option = CONFIG_DATA.options.length - 1
  } else if (CONFIG_DATA.option >= CONFIG_DATA.options.length) {
    CONFIG_DATA.option = 0
  }
  pointerToOption(CONFIG_DATA.option)
}
const configOptionChange = up => {}

const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CONFIG', key, firstPress, state)
  if (state === 'config-select') {
    if (key === KEY.X) {
      console.log('press MAIN MENU CONFIG EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    } else if (key === KEY.O) {
      configOptionSelect()
    } else if (key === KEY.LEFT) {
      configOptionChange(false)
    } else if (key === KEY.RIGHT) {
      configOptionChange(true)
    } else if (key === KEY.UP) {
      configOptionNavigate(false)
    } else if (key === KEY.DOWN) {
      configOptionNavigate(true)
    }
  }
}
export { loadConfigMenu, keyPress }

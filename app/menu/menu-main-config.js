import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { setMenuState, getMenuBlackOverlay } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  createHorizontalConfigSlider,
  updateTexture
} from './menu-box-helper.js'
import { fadeInHomeMenu, homeNav } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { scene } from './menu-scene.js'

let configDescription,
  configOptions,
  configControls,
  configColorPreviewAll,
  configColorPreviewOne,
  configColorEditor
let configDescriptionGroup

const loadConfigMenu = async () => {
  configDescription = createDialogBox({
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
  configDescriptionGroup = new THREE.Group()
  configDescriptionGroup.userData = { id: 5, z: 100 - 5 }
  configDescriptionGroup.position.x = 0
  configDescriptionGroup.position.y = -12.5
  configDescription.add(configDescriptionGroup)
  window.configDescription = configDescription

  configOptions = createDialogBox({
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

  configControls = createDialogBox({
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

  configColorPreviewAll = createDialogBox({
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

  configColorPreviewOne = createDialogBox({
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

  configColorEditor = createDialogBox({
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

  await fadeOverlayOut(getMenuBlackOverlay())

  configOptionSelectOptions()
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
      value: 'No sound config available',
      save: 'sound'
    },
    {
      name: 'Controller',
      description: 'Set buttons yourself',
      type: 'controls',
      value: 'View controls',
      save: 'controller'
    },
    {
      name: 'Cursor',
      description: 'Save cursor when window is closed?',
      type: 'select',
      option: 0,
      options: ['Initial', 'Memory'],
      save: 'cursor'
    },
    {
      name: 'ATB',
      description: 'Change battle time flow',
      type: 'select',
      option: 0,
      options: ['Active', 'Recommended', 'Wait'],
      save: 'atb'
    },
    {
      name: 'Battle speed',
      description: 'Change battle speed',
      type: 'slider',
      value: 0,
      save: 'battleSpeed'
    },
    {
      name: 'Battle message',
      description: 'Change battle message speed',
      type: 'slider',
      value: 0,
      save: 'battleMessageSpeed'
    },
    {
      name: 'Field message',
      description: 'Change field message speed',
      type: 'slider',
      value: 0,
      save: 'fieldMessageSpeed'
    },
    {
      name: 'Camera angle',
      description: 'Select battle screen movement',
      type: 'select',
      option: 0,
      options: ['Auto', 'Fixed'],
      save: 'cameraAngle'
    },
    {
      name: 'Magic order',
      description: 'Select magic placement',
      type: 'scroll',
      option: 0,
      options: [
        'RestoreAttackIndirect',
        'RestoreIndirectAttack',
        'AttackIndirectRestore',
        'AttackRestoreIndirect',
        'IndirectRestoreAttack',
        'IndirectAttackRestore'
      ],
      save: 'magicOrder'
    }
  ],
  optionGroups: []
}

window.CONFIG_DATA = CONFIG_DATA
const drawConfigOptions = () => {
  CONFIG_DATA.optionGroups = []
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
    loadConfigOptionSaveData(i)
    drawConfigOptionSet(i)
  }
  loadColorData()
  drawColorData()
}
const clearOptionGroup = i => {
  const group = CONFIG_DATA.optionGroups[i]
  while (group.children.length) {
    group.remove(group.children[0])
  }
}

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
const loadConfigOptionSaveData = i => {
  const group = CONFIG_DATA.options[i]
  if (group.type === 'color') {
    // tbc
  } else if (group.type === 'none') {
    // none
  } else if (group.type === 'controls') {
    // none
  } else if (group.type === 'select') {
    loadSaveSelectScroll(group)
  } else if (group.type === 'slider') {
    group.value = window.data.savemap.config[group.save]
  } else if (group.type === 'scroll') {
    loadSaveSelectScroll(group)
  }
}
const loadSaveSelectScroll = group => {
  const keys = Object.keys(window.data.savemap.config[group.save])
  console.log('config keys', keys)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    console.log('config key', key)
    if (window.data.savemap.config[group.save][key] === true) {
      console.log('config key true', key)
      for (let j = 0; j < group.options.length; j++) {
        const option = group.options[j]
        console.log('config key true option check', option, j)
        if (option === key) {
          console.log('config key true option check', option, j, 'true')
          group.option = j
        }
      }
    }
  }
}
const drawConfigOptionSet = i => {
  const group = CONFIG_DATA.options[i]
  console.log('config drawConfigOptionSet', i, group)
  if (group.type === 'color') {
    // tbc
  } else if (group.type === 'none') {
    drawConfigOptionNone(i, group)
  } else if (group.type === 'controls') {
    drawConfigOptionControls(i, group)
  } else if (group.type === 'select') {
    drawConfigOptionSelect(i, group)
  } else if (group.type === 'slider') {
    drawConfigOptionSlider(i, group)
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
const drawConfigOptionControls = (groupId, group) => {
  clearOptionGroup(groupId)
  addTextToDialog(
    CONFIG_DATA.optionGroups[groupId],
    group.value,
    `config-controls-${groupId}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
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
const drawConfigOptionSlider = (groupId, group) => {
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
  console.log(
    'config drawConfigOptionSlider',
    window.data.savemap.config[group.save],
    group.value
  )

  createHorizontalConfigSlider(
    CONFIG_DATA.optionGroups[groupId],
    23,
    -0.5,
    group.value
  )

  // group.value = window.data.savemap.config[group.save]
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
  const value = group.options[group.option]
  const valueSplit = value.match(/[A-Z][a-z]+/g)
  for (let i = 0; i < valueSplit.length; i++) {
    addTextToDialog(
      CONFIG_DATA.optionGroups[groupId],
      valueSplit[i].toLowerCase(),
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
  await fadeOverlayIn(getMenuBlackOverlay())
  configOptions.visible = false
  configDescription.visible = false
  configControls.visible = false
  configColorPreviewAll.visible = false
  configColorPreviewOne.visible = false
  configColorEditor.visible = false
  fadeInHomeMenu()
}

const configOptionSelectOptions = () => {
  setMenuState('config-select')
  pointerToOption(CONFIG_DATA.option)
}
const pointerToOption = i => {
  movePointer(POINTERS.pointer1, 13, 49.5 + i * 20)
  movePointer(POINTERS.pointer2, 0, 0, true)
  setConfigDescription(CONFIG_DATA.options[i].description)
}
const configOptionSelect = () => {
  const groupId = CONFIG_DATA.option
  const group = CONFIG_DATA.options[groupId]
  if (group.type === 'controls') {
    document.querySelector('.controls').click()
  } else if (group.type === 'color') {
    COLOR_DATA.corner = 0
    configColorChooseCorner()
  }
}
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
  console.log('config configOptionNavigate')
  pointerToOption(CONFIG_DATA.option)
}
const configOptionChange = up => {
  const groupId = CONFIG_DATA.option
  const group = CONFIG_DATA.options[groupId]
  if (group.type === 'color') {
    // tbc
  } else if (group.type === 'none') {
    // drawConfigOptionNone(i, group)
  } else if (group.type === 'select') {
    configOptionChangeSelect(groupId, group, up)
  } else if (group.type === 'slider') {
    configOptionChangeSlider(groupId, group, up)
  } else if (group.type === 'scroll') {
    configOptionChangeScroll(groupId, group, up)
  }
}
const configOptionChangeSelect = (groupId, group, up) => {
  if (up && group.option + 1 < group.options.length) {
    group.option++
  } else if (!up && group.option > 0) {
    group.option--
  }
  drawConfigOptionSelect(groupId, group)
  configOptionSaveSelectScroll(group)
}
const configOptionSaveSelectScroll = group => {
  const keys = Object.keys(window.data.savemap.config[group.save])
  const valueString = group.options[group.option]
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key === valueString) {
      window.data.savemap.config[group.save][key] = true
    } else {
      window.data.savemap.config[group.save][key] = false
    }
  }
}
const configOptionChangeSlider = (groupId, group, up) => {
  // Note: Really,to be smoother this should use the rendering loop,
  // seeing if buttons are being pressed and then setting the position
  // Leave it like this for now
  const delta = 3
  if (up) {
    group.value = group.value + delta
  } else {
    group.value = group.value - delta
  }

  if (group.value < 0) {
    group.value = 0
  } else if (group.value > 255) {
    group.value = 255
  }
  CONFIG_DATA.optionGroups[groupId].userData.slider.userData.goToValue(
    group.value
  )
  configOptionSaveSlider(group)
}
const configOptionSaveSlider = group => {
  window.data.savemap.config[group.save] = group.value
}
const configOptionChangeScroll = (groupId, group, up) => {
  if (up && group.option + 1 < group.options.length) {
    group.option++
  } else if (!up && group.option > 0) {
    group.option--
  }
  drawConfigOptionScroll(groupId, group)
  configOptionSaveSelectScroll(group)
}
const clearConfigDescription = () => {
  while (configDescriptionGroup.children.length) {
    configDescriptionGroup.remove(configDescriptionGroup.children[0])
  }
}
const setConfigDescription = text => {
  clearConfigDescription()
  addTextToDialog(
    configDescriptionGroup,
    text,
    'config-desciption',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    0,
    0,
    0.5
  )
}
const COLOR_DATA = {
  corner: 0,
  channel: 0,
  corners: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ],
  pointers: [
    { x: 118, y: 37.5 },
    { x: 169, y: 37.5 },
    { x: 118, y: 58.5 },
    { x: 169, y: 58.5 }
  ],
  channels: [
    { name: 'R', color: LETTER_COLORS.Red },
    { name: 'G', color: LETTER_COLORS.Green },
    { name: 'B', color: LETTER_COLORS.Blue }
  ]
}
window.COLOR_DATA = COLOR_DATA
const loadColorData = () => {
  COLOR_DATA.corners[0] = window.data.savemap.config.windowColorTL
  COLOR_DATA.corners[1] = window.data.savemap.config.windowColorTR
  COLOR_DATA.corners[2] = window.data.savemap.config.windowColorBL
  COLOR_DATA.corners[3] = window.data.savemap.config.windowColorBR
}
const drawColorData = () => {
  for (let i = 0; i < COLOR_DATA.channels.length; i++) {
    const channel = COLOR_DATA.channels[i]
    const y = 67 + i * 13
    addTextToDialog(
      configColorEditor,
      channel.name,
      `config-channel-label-${i}`,
      LETTER_TYPES.MenuTextFixed,
      channel.color,
      130.5,
      y,
      0.5
    )
    const value = COLOR_DATA.corners[COLOR_DATA.corner][i]
    channel.numbers = addTextToDialog(
      configColorEditor,
      ('' + value).padStart(3, '0'),
      `config-channel-value-${i}`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      146.5,
      y,
      0.5
    )
    channel.slider = createHorizontalConfigSlider(
      configColorEditor,
      177,
      y - 0.5,
      value
    )
  }
}
const configColorChooseCorner = () => {
  setMenuState('config-color-corner')
  // setMenuState('config-color-color')
  updateAllColorsPreview()
  movePointer(
    POINTERS.pointer1,
    13,
    49.5 + CONFIG_DATA.option * 20,
    false,
    true
  )
  movePointer(
    POINTERS.pointer2,
    COLOR_DATA.pointers[COLOR_DATA.corner].x,
    COLOR_DATA.pointers[COLOR_DATA.corner].y
  )
  movePointer(POINTERS.pointer3, 0, 0, true)
  configColorPreviewOne.visible = false
  configColorEditor.visible = false
}
const configColorChooseCornerSelect = () => {
  setMenuState('config-color-color')
  movePointer(
    POINTERS.pointer2,
    COLOR_DATA.pointers[COLOR_DATA.corner].x,
    COLOR_DATA.pointers[COLOR_DATA.corner].y,
    false,
    true
  )
  // COLOR_DATA.channel = 0
  movePointer(POINTERS.pointer3, 123, 69.5 + COLOR_DATA.channel * 13)

  for (let i = 0; i < COLOR_DATA.channels.length; i++) {
    // Set default slider value
    const val = COLOR_DATA.corners[COLOR_DATA.corner][i]
    COLOR_DATA.channels[i].slider.userData.goToValue(val)
    // Set default numbers
    updateColorNumbers(val, i)
  }
  updateSingleColorPreview()
  configColorPreviewOne.visible = true
  configColorEditor.visible = true
}
const updateColorNumbers = (val, channelIndex) => {
  const valSplit = ('' + val).padStart(3, '0').split('')
  const meshes = COLOR_DATA.channels[channelIndex].numbers.children
  for (let j = 0; j < valSplit.length; j++) {
    const letter = valSplit[j]
    const mesh = meshes[j]
    updateTexture(mesh, letter, LETTER_TYPES.MenuTextStats, LETTER_COLORS.White)
  }
}
const configColorChooseCornerNavigation = horizontal => {
  if (COLOR_DATA.corner === 0 && horizontal) {
    COLOR_DATA.corner = 1
  } else if (COLOR_DATA.corner === 1 && horizontal) {
    COLOR_DATA.corner = 0
  } else if (COLOR_DATA.corner === 2 && horizontal) {
    COLOR_DATA.corner = 3
  } else if (COLOR_DATA.corner === 3 && horizontal) {
    COLOR_DATA.corner = 2
  } else if (COLOR_DATA.corner === 0 && !horizontal) {
    COLOR_DATA.corner = 2
  } else if (COLOR_DATA.corner === 1 && !horizontal) {
    COLOR_DATA.corner = 3
  } else if (COLOR_DATA.corner === 2 && !horizontal) {
    COLOR_DATA.corner = 0
  } else if (COLOR_DATA.corner === 3 && !horizontal) {
    COLOR_DATA.corner = 1
  }
  movePointer(
    POINTERS.pointer2,
    COLOR_DATA.pointers[COLOR_DATA.corner].x,
    COLOR_DATA.pointers[COLOR_DATA.corner].y
  )
}
const configColorChooseColorChangeChannel = up => {
  if (up) {
    COLOR_DATA.channel++
  } else {
    COLOR_DATA.channel--
  }
  if (COLOR_DATA.channel < 0) {
    COLOR_DATA.channel = 2
  } else if (COLOR_DATA.channel > 2) {
    COLOR_DATA.channel = 0
  }
  movePointer(POINTERS.pointer3, 123, 69.5 + COLOR_DATA.channel * 13)
}
const configColorChooseColorChangeValue = up => {
  let val = COLOR_DATA.corners[COLOR_DATA.corner][COLOR_DATA.channel]
  const delta = 3
  if (up) {
    val = val + delta
  } else {
    val = val - delta
  }

  if (val < 0) {
    val = 0
  } else if (val > 255) {
    val = 255
  }
  COLOR_DATA.corners[COLOR_DATA.corner][COLOR_DATA.channel] = val
  // CONFIG_DATA.optionGroups[groupId].userData.slider.userData.goToValue(
  //   val
  // )

  // update slider
  COLOR_DATA.channels[COLOR_DATA.channel].slider.userData.goToValue(val)
  // update displayed numbers
  updateColorNumbers(val, COLOR_DATA.channel)
  // update single color preview
  updateSingleColorPreview()
  updateAllColorsPreview()
}
const updateSingleColorPreview = () => {
  const r = COLOR_DATA.corners[COLOR_DATA.corner][0] / 255
  const g = COLOR_DATA.corners[COLOR_DATA.corner][1] / 255
  const b = COLOR_DATA.corners[COLOR_DATA.corner][2] / 255
  console.log('config updateSingleColorPreview', r, g, b)
  for (let i = 0; i < 4; i++) {
    configColorPreviewOne.userData.bgGeo
      .getAttribute('color')
      .setXYZ(i, r, g, b)
  }
  configColorPreviewOne.userData.bgGeo.getAttribute('color').needsUpdate = true
}
const updateAllColorsPreview = () => {
  // console.log('config updateSingleColorPreview', r, g, b)
  for (let i = 0; i < 4; i++) {
    const r = COLOR_DATA.corners[i][0] / 255
    const g = COLOR_DATA.corners[i][1] / 255
    const b = COLOR_DATA.corners[i][2] / 255
    configColorPreviewAll.userData.bgGeo
      .getAttribute('color')
      .setXYZ(i, r, g, b)
  }
  configColorPreviewAll.userData.bgGeo.getAttribute('color').needsUpdate = true
}
const updateAllDialogsWithNewColors = () => {
  // Update all existing dialogs
  console.log('config updateAllDialogsWithNewColors')
  for (let i = 0; i < scene.children.length; i++) {
    const child = scene.children[i]
    resetDialogColors(child)
    if (child.type === 'Group') {
      for (let k = 0; k < child.children.length; k++) {
        const grandchild = child.children[k]
        resetDialogColors(grandchild)
      }
    }
  }
  // Update the menu nav slider to have userData.color attribute for change on slide
  homeNav.userData.colors = [
    `rgb(${COLOR_DATA.corners[0][0]},${COLOR_DATA.corners[0][1]},${COLOR_DATA.corners[0][2]})`,
    `rgb(${COLOR_DATA.corners[1][0]},${COLOR_DATA.corners[1][1]},${COLOR_DATA.corners[1][2]})`,
    `rgb(${COLOR_DATA.corners[2][0]},${COLOR_DATA.corners[2][1]},${COLOR_DATA.corners[2][2]})`,
    `rgb(${COLOR_DATA.corners[3][0]},${COLOR_DATA.corners[3][1]},${COLOR_DATA.corners[3][2]})`
  ]
  // resetDialogColors(homeNav)
  configOptionSelectOptions()
}
const resetDialogColors = dialog => {
  if (dialog.type === 'Group' && dialog.userData.bg) {
    for (let l = 0; l < 4; l++) {
      const r = COLOR_DATA.corners[l][0] / 255
      const g = COLOR_DATA.corners[l][1] / 255
      const b = COLOR_DATA.corners[l][2] / 255
      dialog.userData.bg.geometry.getAttribute('color').setXYZ(l, r, g, b)
    }
    dialog.userData.bg.geometry.getAttribute('color').needsUpdate = true
  }
}
window.resetDialogColors = resetDialogColors
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
  if (state === 'config-color-corner') {
    if (key === KEY.X) {
      updateAllDialogsWithNewColors()
    } else if (key === KEY.O) {
      configColorChooseCornerSelect()
    } else if (key === KEY.LEFT) {
      configColorChooseCornerNavigation(true)
    } else if (key === KEY.RIGHT) {
      configColorChooseCornerNavigation(true)
    } else if (key === KEY.UP) {
      configColorChooseCornerNavigation(false)
    } else if (key === KEY.DOWN) {
      configColorChooseCornerNavigation(false)
    }
  }
  if (state === 'config-color-color') {
    if (key === KEY.X) {
      configColorChooseCorner()
    } else if (key === KEY.LEFT) {
      configColorChooseColorChangeValue(false)
    } else if (key === KEY.RIGHT) {
      configColorChooseColorChangeValue(true)
    } else if (key === KEY.UP) {
      configColorChooseColorChangeChannel(false)
    } else if (key === KEY.DOWN) {
      configColorChooseColorChangeChannel(true)
    }
  }
}
export { loadConfigMenu, keyPress }

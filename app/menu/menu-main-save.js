import * as THREE from '../../assets/threejs-r118/three.module.js'
import { setMenuState } from './menu-module.js'
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

let saveDescription, saveGroups
let saveDescriptionGroup

const loadSaveMenu = async () => {
  saveDescription = createDialogBox({
    id: 7,
    name: 'configDescription',
    w: 320,
    h: 25.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  saveDescription.visible = true
  window.saveDescription = saveDescription
  saveDescriptionGroup = new THREE.Group()
  saveDescriptionGroup.userData = { id: 5, z: 100 - 5 }
  saveDescriptionGroup.position.x = 0
  saveDescriptionGroup.position.y = -12.5
  saveDescription.add(saveDescriptionGroup)
  window.saveDescription = saveDescription

  saveGroups = createDialogBox({
    id: 8,
    name: 'saveGroups',
    w: 240,
    h: 33.5,
    x: 40,
    y: 103.5,
    expandInstantly: true,
    noClipping: true
  })
  saveGroups.visible = true
  window.saveGroups = saveGroups

  drawAll()
  loadChooseSaveGroup()
  setMenuState('loading')
  await fadeOverlayOut(getHomeBlackOverlay())
  setMenuState('save-choose-group')
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getHomeBlackOverlay())
  saveDescription.visible = false
  saveGroups.visible = false
  fadeInHomeMenu()
}
const clearSaveDescription = () => {
  while (saveDescriptionGroup.children.length) {
    saveDescriptionGroup.remove(saveDescriptionGroup.children[0])
  }
}
const setSaveDescription = text => {
  clearSaveDescription()
  addTextToDialog(
    saveDescriptionGroup,
    text,
    'save-desciption',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    0,
    0,
    0.5
  )
}
const SAVE_DATA = {
  group: 0,
  groups: []
}
window.SAVE_DATA = SAVE_DATA
const drawAll = () => {
  createGroupSaves()
  drawSaveGroups()
}
const isPositiveInteger = n => n >>> 0 === parseFloat(n)

const createGroupSaves = () => {
  // Create save groups
  SAVE_DATA.groups = []
  for (let i = 0; i < 10; i++) {
    const group = []
    for (let j = 0; j < 15; j++) {
      group.push({ id: 'None' })
    }
    SAVE_DATA.groups.push(group)
  }
  // Add data
  const potentialSaveKeys = Object.keys(window.localStorage)
  for (let i = 0; i < potentialSaveKeys.length; i++) {
    const potentialSaveKey = potentialSaveKeys[i]
    const keySplit = potentialSaveKey.split('-')
    if (
      keySplit.length === 3 &&
      keySplit[0] === 'save' &&
      isPositiveInteger(keySplit[1]) &&
      isPositiveInteger(keySplit[2])
    ) {
      SAVE_DATA.groups[parseInt(keySplit[1] - 1)][parseInt(keySplit[2] - 1)] = {
        id: potentialSaveKey,
        data: JSON.parse(window.localStorage.getItem(potentialSaveKey))
      }
    }
  }
  console.log('save groupSaves', SAVE_DATA)
}
const drawSaveGroups = () => {
  for (let i = 0; i < 10; i++) {
    let color = LETTER_COLORS.Gray
    if (SAVE_DATA.groups[i].filter(g => g.id === 'None').length < 15) {
      color = LETTER_COLORS.White
    }
    const x = 42.5 + (i < 5 ? i : i - 5) * 45
    const y = i < 5 ? 115 : 128
    addTextToDialog(
      saveGroups,
      `Save ${i + 1}`,
      `save-group-${i}`,
      LETTER_TYPES.MenuBaseFont,
      color,
      x,
      y,
      0.5
    )
  }
}
const saveChooseGroupNavigationHorzontal = up => {
  if (up && SAVE_DATA.group !== 4 && SAVE_DATA.group !== 9) {
    SAVE_DATA.group++
  } else if (!up && SAVE_DATA.group !== 0 && SAVE_DATA.group !== 5) {
    SAVE_DATA.group--
  }
  loadChooseSaveGroup()
}
const saveChooseGroupNavigationVertical = () => {
  if (SAVE_DATA.group < 5) {
    SAVE_DATA.group = SAVE_DATA.group + 5
  } else {
    SAVE_DATA.group = SAVE_DATA.group - 5
  }
  loadChooseSaveGroup()
}
const loadChooseSaveGroup = () => {
  setMenuState('save-choose-group')
  setSaveDescription('Select a data file.')
  const x =
    42.5 +
    (SAVE_DATA.group < 5 ? SAVE_DATA.group : SAVE_DATA.group - 5) * 45 -
    5
  const y = SAVE_DATA.group < 5 ? 115 + 3 : 128 + 3
  movePointer(POINTERS.pointer1, x, y)
}
const saveChooseGroupConfirm = () => {
  setMenuState('save-choose-slot')
}
const saveChooseSlotNavigation = () => {}
const saveChooseSlotConfirm = () => {}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU SAVE', key, firstPress, state)
  if (state === 'save-choose-group') {
    if (key === KEY.X) {
      console.log('press MAIN MENU SAVE EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    } else if (key === KEY.O) {
      saveChooseGroupConfirm()
    } else if (key === KEY.LEFT) {
      saveChooseGroupNavigationHorzontal(false)
    } else if (key === KEY.RIGHT) {
      saveChooseGroupNavigationHorzontal(true)
    } else if (key === KEY.UP) {
      saveChooseGroupNavigationVertical()
    } else if (key === KEY.DOWN) {
      saveChooseGroupNavigationVertical()
    }
  }
  if (state === 'save-choose-group') {
    if (key === KEY.X) {
      loadChooseSaveGroup()
    } else if (key === KEY.O) {
      saveChooseSlotConfirm()
    } else if (key === KEY.UP) {
      saveChooseSlotNavigation(false)
    } else if (key === KEY.DOWN) {
      saveChooseSlotNavigation(true)
    }
  }
}
export { loadSaveMenu, keyPress }

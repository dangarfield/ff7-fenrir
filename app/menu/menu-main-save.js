import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import { setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  WINDOW_COLORS_SUMMARY,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  addImageToDialog,
  showDialog,
  closeDialog
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'
import { saveSaveMap } from '../data/savemap.js'

let saveDescription, saveGroups, saveSlotId
let saveDescriptionGroup, saveSlotIdGroup, saveSlotsGroup, saveSlotsGroupCover, saveSlotsConfirmDialog, saveSlotsSavedDialog

const loadSaveMenu = async () => {
  saveDescription = createDialogBox({
    id: 7,
    name: 'saveDescription',
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
  scene.add(saveGroups)
  window.saveGroups = saveGroups

  saveSlotId = createDialogBox({
    id: 6,
    name: 'saveSlotId',
    w: 72,
    h: 25.5,
    x: 166,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  saveSlotId.visible = true
  window.saveSlotId = saveSlotId
  saveSlotIdGroup = new THREE.Group()
  saveSlotIdGroup.userData = { id: 5, z: 100 - 5 }
  saveSlotIdGroup.position.x = 0
  saveSlotIdGroup.position.y = -12.5
  saveSlotId.add(saveSlotIdGroup)
  window.saveSlotIdGroup = saveSlotIdGroup

  createSlotDialogHolders()
  drawAll()
  loadChooseSaveGroup()
  setMenuState('loading')
  await fadeOverlayOut(getHomeBlackOverlay())
  setMenuState('save-choose-group')
}
const createSlotDialogHolders = () => {
  saveSlotsGroup = new THREE.Group()
  saveSlotsGroup.userData = { id: 10, z: 100 - 10, name: 'saveSlotsGroup' }
  saveSlotsGroup.position.x = 0
  saveSlotsGroup.position.y = -25.5
  saveSlotsGroup.position.z = -10

  saveSlotsGroupCover = new THREE.Group()
  saveSlotsGroupCover.userData = { id: 10, z: 100 - 9, name: 'saveSlotsGroupCover' }
  saveSlotsGroupCover.position.z = -9

  const blackCoverMesh = new THREE.MeshBasicMaterial({ color: 0x000000 })
  const saveSlotsGroupCover1 = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(320, 25.5),
    blackCoverMesh
  )
  saveSlotsGroupCover1.position.set(320 / 2, 240 - (25.5/2), 100 - 2)
  saveSlotsGroupCover1.material.transparent = true
  saveSlotsGroupCover1.visible = true
  saveSlotsGroupCover.add(saveSlotsGroupCover1)
  
  const saveSlotsGroupCover2 = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(320, 240 - 25.5 - (68.5*3)),
    blackCoverMesh
  )
  saveSlotsGroupCover2.position.set(320 / 2, (240 - 25.5 - (68.5*3)) / 2, 100 - 2)
  saveSlotsGroupCover2.material.transparent = true
  saveSlotsGroupCover2.visible = true
  saveSlotsGroupCover.add(saveSlotsGroupCover2)
  
  saveSlotsConfirmDialog = createDialogBox({
    id: 6,
    name: 'saveSlotsConfirmDialog',
    w: 167.5,
    h: 50.5,
    x: 76.5,
    y: 95,
    expandInstantly: true,
    noClipping: true
  })
  addTextToDialog(
    saveSlotsConfirmDialog,
    'Are you sure you want to save?',
    'save-slots-confirm-dialog',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    77,
    107.5,
    0.5
  )
  addTextToDialog(
    saveSlotsConfirmDialog,
    'Yes',
    'save-slots-confirm-dialog-yes',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    108.5,
    121.5,
    0.5
  )
  addTextToDialog(
    saveSlotsConfirmDialog,
    'No',
    'save-slots-confirm-dialog-no',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    108.5,
    134,
    0.5
  )
  saveSlotsSavedDialog = createDialogBox({
    id: 3,
    name: 'saveSlotsSavedDialog',
    w: 46,
    h: 25.5,
    x: 127.5,
    y: 101,
    colors: WINDOW_COLORS_SUMMARY.DIALOG_SPECIAL
  })
  addTextToDialog(
    saveSlotsSavedDialog,
    'Saved.',
    'save-slots-saved-dialog',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    126,
    113.5,
    0.5
  )
  scene.add(saveSlotsGroup)
  scene.add(saveSlotsGroupCover)
  scene.add(saveSlotsConfirmDialog)
  scene.add(saveSlotsSavedDialog)
  window.saveSlotsGroup = saveSlotsGroup
  window.saveSlotsGroupCover = saveSlotsGroupCover
  window.saveSlotsConfirmDialog = saveSlotsConfirmDialog
  window.saveSlotsSavedDialog = saveSlotsSavedDialog
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getHomeBlackOverlay())
  saveDescription.visible = false
  saveGroups.visible = false
  saveSlotId.visible = false
  saveSlotsGroup.visible = false
  saveSlotsGroupCover.visible = false
  saveSlotsConfirmDialog.visible = false
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
const clearSlotId = () => {
  while (saveSlotIdGroup.children.length) {
    saveSlotIdGroup.remove(saveSlotIdGroup.children[0])
  }
}
const setSlotId = text => {
  clearSlotId()
  addTextToDialog(
    saveSlotIdGroup,
    'GAME',
    'save-slot-id',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Yellow,
    164,
    0,
    0.5
  )
  addTextToDialog(
    saveSlotIdGroup,
    text,
    'save-slot-id',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    165 + 31,
    0,
    0.5
  )
}
const SAVE_DATA = {
  group: 0,
  groups: [],
  savePreviewDialogs: [],
  slot: 0
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
  console.log('save loadChooseSaveGroup START')
  setSaveDescription('Select a data file.')
  const x =
    42.5 +
    (SAVE_DATA.group < 5 ? SAVE_DATA.group : SAVE_DATA.group - 5) * 45 -
    5
  const y = SAVE_DATA.group < 5 ? 115 + 3 : 128 + 3
  movePointer(POINTERS.pointer1, x, y)

  // Hide and show dialogs and cursors
  saveGroups.visible = true
  saveSlotId.visible = false
  saveSlotsGroup.visible = false
  saveSlotsGroupCover.visible = false
  saveSlotsConfirmDialog.visible = false

  setMenuState('save-choose-group')
  console.log('save loadChooseSaveGroup END')
}
const saveChooseGroupConfirm = () => {

  
  // if (SAVE_DATA.groups[SAVE_DATA.group].filter(g => g.id === 'None').length === 15) {
  //   console.log('save no active save in group')
  //   return
  // }

  console.log('save saveChooseGroupConfirm 1')
  // Remove existing
  while (SAVE_DATA.savePreviewDialogs.length) {
    scene.remove(SAVE_DATA.savePreviewDialogs[0])
    SAVE_DATA.savePreviewDialogs.shift()
  }
  console.log('save saveChooseGroupConfirm 2')
  while (saveSlotsGroup.length) {
    saveSlotsGroup.remove(saveSlotsGroup[0])
  }
  console.log('save saveChooseGroupConfirm 3')

  // Create dialogs
  for (let i = 0; i < SAVE_DATA.groups[SAVE_DATA.group].length; i++) {
    const previewData = SAVE_DATA.groups[SAVE_DATA.group][i]
    const previewDialog = createSavePreviewDialog(i, previewData)
    console.log('save', i, previewData, previewDialog)
    SAVE_DATA.savePreviewDialogs.push(previewDialog)
  }
  SAVE_DATA.slot = 0
  setSaveDescription('Select a save game.')
  setSlotId(('' + SAVE_DATA.slot + 1).padStart(2, '0'))

  // Hide and show dialogs and cursors
  saveGroups.visible = false
  saveSlotId.visible = true
  saveSlotsGroup.visible = true
  saveSlotsGroupCover.visible = true
  saveSlotsConfirmDialog.visible = false

  movePointerToSaveSlot(SAVE_SLOT_POSITIONS.cursorPosition)
  setMenuState('save-choose-slot')
}
const createSavePreviewDialog = (index, previewData) => {
  // Note: I don't think we need to use the preview data really, we can just read the main save data

  const yOffset = 22.5 + 68.5 * index
  const slotPreview = createDialogBox({
    id: 10,
    name: 'slotPreview',
    w: 320,
    h: 68.5,
    x: 0,
    y: 0 + index * 68.5,
    expandInstantly: true,
    noClipping: true,
    group: saveSlotsGroup
  })

  if (previewData.data === undefined) {
    // TODO - Deal with empty slots, draw slotPreview with current window's colors and add 'empty'
    console.log('need to deal with empty slots')
    addTextToDialog(
      saveSlotsGroup,
      'EMPTY',
      `empty-${index}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Yellow,
      34,
      yOffset + 11,
      0.5
    )
    slotPreview.visible = true
    return slotPreview
  }
  const members = previewData.data.party.members
  const char = previewData.data.characters[previewData.data.party.members[0]]
  console.log('save char', char)

  const slotPreviewLocation = createDialogBox({
    id: 10,
    name: 'slotPreviewLocation',
    w: 150,
    h: 25.5,
    x: 320 - 150,
    y: 68.5 - 25.5 + index * 68.5,
    expandInstantly: true,
    noClipping: true,
    group: saveSlotsGroup
  })
  const slotPreviewTime = createDialogBox({
    id: 10,
    name: 'slotPreviewTime',
    w: 82,
    h: 38.5,
    x: 320 - 82,
    y: 68.5 - 38.5 - 25.5 + index * 68.5,
    expandInstantly: true,
    noClipping: true,
    group: saveSlotsGroup
  })

  const picXFixed = 39.5
  const picXSpacing = 46
  addImageToDialog(
    saveSlotsGroup,
    'profiles',
    members[0],
    'profile-image-1',
    picXFixed,
    yOffset + 8,
    0.5
  )

  if (members[1] !== 'None') {
    addImageToDialog(
      saveSlotsGroup,
      'profiles',
      members[1],
      'profile-image-2',
      picXFixed + picXSpacing * 1,
      yOffset + 8,
      0.5
    )
  }

  if (members[2] !== 'None') {
    addImageToDialog(
      saveSlotsGroup,
      'profiles',
      members[2],
      'profile-image-3',
      picXFixed + picXSpacing * 2,
      yOffset + 8,
      0.5
    )
  }
  addTextToDialog(
    saveSlotsGroup,
    'Ex-SOLDIER',
    `save-name-${index}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    164,
    yOffset - 8,
    0.5
  )
  addTextToDialog(
    saveSlotsGroup,
    'Level',
    `save-level-label-${index}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    168,
    yOffset + 11.5,
    0.5
  )
  addTextToDialog(
    saveSlotsGroup,
    '7  ',
    `save-level-${index}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    202,
    yOffset + 11.5,
    0.5
  )
  addTextToDialog(
    saveSlotsGroup,
    'Section 1 Station',
    `save-location-${index}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    168,
    yOffset + 33,
    0.5
  )
  addTextToDialog(
    saveSlotsGroup,
    'Time',
    `save-time-label-${index}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    235,
    yOffset - 6.5,
    0.5
  )
  addTextToDialog(
    saveSlotsGroup,
    'Gil',
    `save-gil-label-${index}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    235,
    yOffset + 8.5,
    0.5
  )
  const timeX = 277.5
  addTextToDialog(
    saveSlotsGroup,
    ('' + 0).padStart(2, '0'),
    `save-time-hrs-${index}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    timeX,
    yOffset - 6.5,
    0.5
  )
  addTextToDialog(
    saveSlotsGroup,
    ':',
    `save-time-colon-${index}`,
    LETTER_TYPES.MenuTextFixed,
    LETTER_COLORS.White,
    timeX + 11,
    yOffset - 5.5,
    0.5
  )
  addTextToDialog(
    saveSlotsGroup,
    ('' + 20).padStart(2, '0'),
    `save-time-mins-${index}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    timeX + 17,
    yOffset - 6.5,
    0.5
  )
  addTextToDialog(
    saveSlotsGroup,
    ('' + 260).padStart(9, ' '),
    `save-time-mins-${index}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    252.5,
    yOffset + 8.5,
    0.5
  )
  slotPreview.visible = true
  slotPreviewLocation.visible = true
  slotPreviewTime.visible = true
  return slotPreview
}

const SAVE_SLOT_POSITIONS = {
  slotPositions:  new Array(15).fill(null).map((v, i) => {return {x: 0, y: -25.5 + 68.5 * i }}),
  cursorPositions: new Array(3).fill(null).map((v, i) => {return {x: 14, y: 68 + 68.5 * i }}),
  confirmPositions: [{x: 104, y:125}, {x: 104, y:138}],
  pagePosition: 0,
  cursorPosition: 0,
  confirmPosition: 0,
  tweenInProgress: false
}
const movePointerToSaveSlot = (i) => {
  movePointer(POINTERS.pointer1, SAVE_SLOT_POSITIONS.cursorPositions[i].x, SAVE_SLOT_POSITIONS.cursorPositions[i].y)
  SAVE_SLOT_POSITIONS.cursorPosition = i
  movePointer(POINTERS.pointer2, SAVE_SLOT_POSITIONS.confirmPositions[0].x, SAVE_SLOT_POSITIONS.confirmPositions[1].y, true)
}
const tweenSaveSlotPosition = (fromIndex, toIndex) => {
  SAVE_SLOT_POSITIONS.tweenInProgress = true
  const from = {
    x: SAVE_SLOT_POSITIONS.slotPositions[fromIndex].x,
    y: SAVE_SLOT_POSITIONS.slotPositions[fromIndex].y
  }
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(SAVE_SLOT_POSITIONS.slotPositions[toIndex], 200)
    .onUpdate(function () {
      saveSlotsGroup.position.y = from.y
    })
    .onComplete(function () {
      SAVE_SLOT_POSITIONS.tweenInProgress = false
      SAVE_SLOT_POSITIONS.pagePosition = toIndex
    })
    .start()
}
const saveChooseSlotNavigation = (up) => {
  if(SAVE_SLOT_POSITIONS.tweenInProgress) {
    return
  }
  if(up && SAVE_SLOT_POSITIONS.cursorPosition < 2) {
    console.log('save slot nav cursor move up 1')
    movePointerToSaveSlot(SAVE_SLOT_POSITIONS.cursorPosition + 1)
    SAVE_DATA.slot++
  } else if(!up && SAVE_SLOT_POSITIONS.cursorPosition > 0) {
    console.log('save slot nav cursor move down 1')
    movePointerToSaveSlot(SAVE_SLOT_POSITIONS.cursorPosition - 1)
    SAVE_DATA.slot--
  } else if(up && SAVE_SLOT_POSITIONS.pagePosition === 15-3) {
    console.log('save page move up end of list')
  } else if(!up && SAVE_SLOT_POSITIONS.pagePosition === 0) {
    console.log('save page move down end of list')
  } else if (up) {
    console.log('save page move up next page')
    tweenSaveSlotPosition(SAVE_SLOT_POSITIONS.pagePosition, SAVE_SLOT_POSITIONS.pagePosition + 1)
    SAVE_DATA.slot++
  } else if (!up) {
    console.log('save page move down next page')
    tweenSaveSlotPosition(SAVE_SLOT_POSITIONS.pagePosition, SAVE_SLOT_POSITIONS.pagePosition - 1)
    SAVE_DATA.slot--
  }
  setSlotId(('' + (SAVE_DATA.slot + 1)).padStart(2, '0'))
  console.log('save saveChooseSlotNavigation', up, SAVE_SLOT_POSITIONS.cursorPosition, SAVE_SLOT_POSITIONS.pagePosition)
  
}
window.SAVE_SLOT_POSITIONS = SAVE_SLOT_POSITIONS
const saveChooseSlotCancel = () => {
  SAVE_SLOT_POSITIONS.cursorPosition = 0
  SAVE_SLOT_POSITIONS.pagePosition = 0
  SAVE_DATA.slot = 0
  loadChooseSaveGroup()
}
const saveChooseSlotSelect = () => {
  setMenuState('save-choose-slot-confirm')
  saveSlotsConfirmDialog.visible = true
  movePointer(POINTERS.pointer1, SAVE_SLOT_POSITIONS.cursorPositions[SAVE_SLOT_POSITIONS.cursorPosition].x, SAVE_SLOT_POSITIONS.cursorPositions[SAVE_SLOT_POSITIONS.cursorPosition].y, false, true)
  movePointer(POINTERS.pointer2, SAVE_SLOT_POSITIONS.confirmPositions[0].x, SAVE_SLOT_POSITIONS.confirmPositions[0].y)
}
const saveConfirmSlotCancel = () => {
  setMenuState('save-choose-slot')
  saveSlotsConfirmDialog.visible = false
  movePointer(POINTERS.pointer1, SAVE_SLOT_POSITIONS.cursorPositions[SAVE_SLOT_POSITIONS.cursorPosition].x, SAVE_SLOT_POSITIONS.cursorPositions[SAVE_SLOT_POSITIONS.cursorPosition].y)
  movePointer(POINTERS.pointer2, SAVE_SLOT_POSITIONS.confirmPositions[0].x, SAVE_SLOT_POSITIONS.confirmPositions[0].y, true)
}
const saveConfirmSlotConfirm = async () => {
  // saveChooseGroupConfirm()
  if (SAVE_SLOT_POSITIONS.confirmPosition === 0) {
    setMenuState('save-saving')
    saveSlotsConfirmDialog.visible = false
    movePointer(POINTERS.pointer1, SAVE_SLOT_POSITIONS.cursorPositions[SAVE_SLOT_POSITIONS.cursorPosition].x, SAVE_SLOT_POSITIONS.cursorPositions[SAVE_SLOT_POSITIONS.cursorPosition].y)
    movePointer(POINTERS.pointer2, SAVE_SLOT_POSITIONS.confirmPositions[0].x, SAVE_SLOT_POSITIONS.confirmPositions[0].y, true)
    saveSaveMap(SAVE_DATA.group+1, SAVE_DATA.slot+1)
    createGroupSaves()
    saveChooseGroupConfirm()
    SAVE_SLOT_POSITIONS.cursorPosition = 0
    SAVE_SLOT_POSITIONS.pagePosition = 0
    SAVE_DATA.slot = 0
    
    setMenuState('save-saving')
    await showDialog(saveSlotsSavedDialog)
    await sleep(1000)
    await closeDialog(saveSlotsSavedDialog)
    setMenuState('save-choose-slot')

    // TODO - Bug - Need to re-set cursor and page positions
  } else {
    saveConfirmSlotCancel()
  }
}
const saveConfirmSlotConfirmNavigation = (pos) => {
  movePointer(POINTERS.pointer2, SAVE_SLOT_POSITIONS.confirmPositions[pos].x, SAVE_SLOT_POSITIONS.confirmPositions[pos].y)
  SAVE_SLOT_POSITIONS.confirmPosition = pos
}
// window.alert('sfd')
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
  if (state === 'save-choose-slot') {
    if (key === KEY.X) {
      saveChooseSlotCancel()
    } else if (key === KEY.O) {
      saveChooseSlotSelect()
    } else if (key === KEY.UP) {
      saveChooseSlotNavigation(false)
    } else if (key === KEY.DOWN) {
      saveChooseSlotNavigation(true)
    }
  }
  if (state === 'save-choose-slot-confirm') {
    if (key === KEY.X) {
      saveConfirmSlotCancel()
    } else if (key === KEY.O) {
      saveConfirmSlotConfirm()
    } else if (key === KEY.UP) {
      saveConfirmSlotConfirmNavigation(0)
    } else if (key === KEY.DOWN) {
      saveConfirmSlotConfirmNavigation(1)
    }
  }
  if (state === 'save-saving') {

  }
}
export { loadSaveMenu, keyPress }

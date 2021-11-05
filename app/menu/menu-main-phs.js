import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getMenuState, setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  addGroupToDialog,
  addImageToDialog,
  addCharacterSummary,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, partyDialog, membersDialog, equipmentDialog, charPreviewDialog
let headerGroup, partyGroup, membersGroup, equipmentGroup, charPreviewGroup

const data = {
  party: [],
  members: [],
  partyCursor: 0,
  memberCursor: 0
}
const setInitialMemberData = () => {
  data.party.push(...window.data.savemap.party.members)
  for (const charName in window.data.savemap.party.phsVisibility) {
    const isVisible = window.data.savemap.party.phsVisibility[charName]
    if (isVisible && !data.party.includes(charName)) {
      data.members.push(charName)
    }
  }
  while (data.members.length < 9) {
    data.members.push('None')
  }
  console.log('phs data', data)
}
const loadPHSMenu = async () => {
  headerDialog = await createDialogBox({
    id: 3,
    name: 'headerDialog',
    w: 320,
    h: 25.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  headerDialog.visible = true
  headerGroup = addGroupToDialog(headerDialog, 15)

  partyDialog = await createDialogBox({
    id: 3,
    name: 'partyDialog',
    w: 153.5,
    h: 214.5,
    x: 0,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  partyDialog.visible = true
  partyGroup = addGroupToDialog(headerDialog, 15)

  membersDialog = await createDialogBox({
    id: 5,
    name: 'membersDialog',
    w: 166.5,
    h: 214.5,
    x: 153.5,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  membersDialog.visible = true
  membersGroup = addGroupToDialog(headerDialog, 15)

  equipmentDialog = await createDialogBox({
    id: 4,
    name: 'equipmentDialog',
    w: 166.5,
    h: 214.5,
    x: 153.5,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  equipmentDialog.visible = true
  equipmentGroup = addGroupToDialog(headerDialog, 15)

  charPreviewDialog = await createDialogBox({
    id: 3,
    name: 'charPreviewDialog',
    w: 166.5,
    h: 60,
    x: 153.5,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  charPreviewDialog.visible = true
  charPreviewGroup = addGroupToDialog(headerDialog, 15)

  window.headerGroup = headerGroup
  window.partyGroup = partyGroup
  window.membersGroup = membersGroup
  window.equipmentGroup = equipmentGroup
  window.charPreviewGroup = charPreviewGroup

  setInitialMemberData()
  drawHeader()
  drawParty()
  drawMembers()
  await fadeOverlayOut(getHomeBlackOverlay())

  setMenuState('phs')

  movePointer(POINTERS.pointer1, 237, 17)
}

const drawHeader = async () => {
  await addTextToDialog(
    headerGroup,
    'Please make a party of three.',
    'phs-header',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    13.5 - 8,
    16.5 - 4,
    0.5
  )
}

const drawParty = () => {
  const vAdj = 68.5
  for (let i = 0; i < data.party.length; i++) {
    const charName = data.party[i]
    if (charName !== 'None') {
      const char = window.data.savemap.characters[charName]
      addImageToDialog(
        headerGroup,
        'profiles',
        charName,
        'profile-image',
        16 + 20,
        34 + 24 + (vAdj * i),
        0.5 // 160x192
      )
      addCharacterSummary(
        headerGroup,
        charName,
        67 - 8, // 59,
        48.5 - 4 + (vAdj * i),
        char.name,
        char.status.statusFlags === 'None' ? null : char.status.statusFlags,
        char.level.current,
        char.stats.hp.current,
        char.stats.hp.max,
        char.stats.mp.current,
        char.stats.mp.max
      )
    }
  }
}
const drawMembers = () => {
  const hAdj = 40
  const vAdj = 49.5
  for (let i = 0; i < data.members.length; i++) {
    const charName = data.members[i]
    if (charName !== 'None') {
      addImageToDialog(
        headerGroup,
        'profiles',
        charName,
        'profile-image',
        176 + 17.5 + (hAdj * (i % 3)),
        88 + 20 + (vAdj * Math.trunc(i / 3)),
        0.41666 // 134x160, I'm just scaling the image here, but in uniform direction, it's actually 134x160.8 but should be 134x160, I'm not going to change it
      )
    }
  }
}
const drawCharPreview = () => {
  // hardcoded
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getHomeBlackOverlay())
  headerDialog.visible = false
  partyDialog.visible = false
  membersDialog.visible = false
  equipmentDialog.visible = false
  charPreviewDialog.visible = false
  headerGroup.visible = false
  partyGroup.visible = false
  membersGroup.visible = false
  equipmentGroup.visible = false
  charPreviewGroup.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU PHS', key, firstPress, state)
  if (state === 'phs') {
    if (key === KEY.X) {
      console.log('press MAIN MENU PHS EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
  }
}
export { loadPHSMenu, keyPress }

import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getMenuState, setMenuState } from './menu-module.js'
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
  removeGroupChildren
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
  drawCharPreview() // Testing only
  drawEquipment() // Testing only
  await fadeOverlayOut(getHomeBlackOverlay())

  setMenuState('phs')

  movePointer(POINTERS.pointer1, 237, 17)
}

const drawHeader = async () => {
  removeGroupChildren(headerGroup)
  addTextToDialog(
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
  removeGroupChildren(partyGroup)
  const vAdj = 68.5
  for (let i = 0; i < data.party.length; i++) {
    const charName = data.party[i]
    if (charName !== 'None') {
      const char = window.data.savemap.characters[charName]
      addImageToDialog(
        partyGroup,
        'profiles',
        charName,
        'profile-image',
        16 + 20,
        34 + 24 + (vAdj * i),
        0.5 // 160x192
      )
      addCharacterSummary(
        partyGroup,
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
  removeGroupChildren(membersGroup)
  const hAdj = 40
  const vAdj = 49.5
  for (let i = 0; i < data.members.length; i++) {
    const charName = data.members[i]
    if (charName !== 'None') {
      addImageToDialog(
        membersGroup,
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
  removeGroupChildren(charPreviewGroup)
  // hardcoded
  const charName = data.members[0]
  if (charName !== 'None') {
    const char = window.data.savemap.characters[charName]
    addImageToDialog(
      charPreviewGroup,
      'profiles',
      charName,
      'profile-image',
      172.5 + 20,
      30 + 24,
      0.5
    )
    addCharacterSummary(
      charPreviewGroup,
      charName,
      221 - 8,
      44 - 4,
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
const drawEquipment = () => {
  removeGroupChildren(equipmentGroup)
  // hardcoded
  const charName = data.members[0]
  if (charName !== 'None') {
    const char = window.data.savemap.characters[charName]

    // EXP
    addTextToDialog(
      equipmentGroup,
      `EXP:`,
      'status-exp-label',
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      187 - 8,
      103 - 4,
      0.5
    )
    addTextToDialog(
      equipmentGroup,
      ('' + char.level.currentEXP).padStart(14, ' '),
      `status-exp`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      192 + 8,
      103 - 4,
      0.5
    )
    addImageToDialog(
      equipmentGroup,
      'labels',
      'points-small',
      'status-next-level-p',
      296,
      100.5,
      0.5
    )
    addLevelToDialog(equipmentGroup, 241.5, 113.5, char)

    // Next level
    addTextToDialog(
      equipmentGroup,
      `next level:`,
      'status-next-level-label',
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      158.5 - 8,
      130 - 4,
      0.5
    )
    addTextToDialog(
      equipmentGroup,
      ('' + char.level.nextLevelEXP).padStart(14, ' '),
      `status-exp-next`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      192 + 8,
      130 - 4,
      0.5
    )

    addImageToDialog(
      equipmentGroup,
      'labels',
      'points-small',
      'status-next-limit-p',
      296,
      127.5,
      0.5
    )

    // Equips
    const equips = [
      ['Wpn.', char.equip.weapon.index < 255 ? char.equip.weapon.name : ''],
      ['Arm.', char.equip.armor.index < 255 ? char.equip.armor.name : ''],
      ['Acc.', char.equip.accessory.index < 255 ? char.equip.accessory.name : '']
    ]

    for (let i = 0; i < equips.length; i++) {
      const equip = equips[i]
      addTextToDialog(
        equipmentGroup,
        equip[0],
        `stat-label-equip${i}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.Cyan,
        174 - 8,
        160.5 - 4 + (i * 32),
        0.5
      )
      // console.log('status equip', i, equip)
      addTextToDialog(
        equipmentGroup,
        equip[1],
        `stat-equip-${i}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        206.5 - 8,
        160.5 + (i * 32),
        0.5
      )
    }

    createEquipmentMateriaViewer(equipmentGroup,
      197,
      157,
      window.data.kernel.weaponData[char.equip.weapon.index].materiaSlots,
      char, EQUIPMENT_TYPE.WEAPON
    )
    createEquipmentMateriaViewer(equipmentGroup,
      197,
      157 + 32,
      window.data.kernel.armorData[char.equip.armor.index].materiaSlots,
      char, EQUIPMENT_TYPE.ARMOR
    )
  }
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

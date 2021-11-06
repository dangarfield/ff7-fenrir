import { getMenuState, getMenuBlackOverlay, setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  addGroupToDialog,
  removeGroupChildren,
  addImageToDialog,
  addCharacterSummary,
  createEquipmentMateriaViewer,
  EQUIPMENT_TYPE
} from './menu-box-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, infoDialog, slotsDialog, statsDialog, listDialog
let headerGroup, infoGroup, slotsGroup, statsGroup, listGroup

const DATA = {
  partyMember: 0,
  equipType: 0,
  page: 0,
  pos: 0
}

const loadEquipMenu = async partyMember => {
  // Reset data
  DATA.partyMember = partyMember
  DATA.equipType = 0
  DATA.page = 0
  DATA.pos = 0

  headerDialog = await createDialogBox({
    id: 3,
    name: 'headerDialog',
    w: 320,
    h: 60,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  headerDialog.visible = true
  headerGroup = addGroupToDialog(headerDialog, 15)

  infoDialog = await createDialogBox({
    id: 4,
    name: 'infoDialog',
    w: 320,
    h: 25.5,
    x: 0,
    y: 60,
    expandInstantly: true,
    noClipping: true
  })
  infoDialog.visible = true
  infoGroup = addGroupToDialog(infoDialog, 16)

  slotsDialog = await createDialogBox({
    id: 5,
    name: 'slotsDialog',
    w: 200,
    h: 55.5,
    x: 0,
    y: 81.5,
    expandInstantly: true,
    noClipping: true
  })
  slotsDialog.visible = true
  slotsGroup = addGroupToDialog(slotsDialog, 17)

  statsDialog = await createDialogBox({
    id: 6,
    name: 'statsDialog',
    w: 200,
    h: 107,
    x: 0,
    y: 133,
    expandInstantly: true,
    noClipping: true
  })
  statsDialog.visible = true
  statsGroup = addGroupToDialog(statsDialog, 18)

  listDialog = await createDialogBox({
    id: 7,
    name: 'listDialog',
    w: 123,
    h: 158.5,
    x: 197,
    y: 81.5,
    expandInstantly: true,
    noClipping: true
  })
  listDialog.visible = true
  listGroup = addGroupToDialog(listDialog, 19)

  drawHeader()
  drawInfo()
  drawSlots()

  await fadeOverlayOut(getMenuBlackOverlay())

  setMenuState('equip')
  // movePointer(POINTERS.pointer1, 237, 17)
}
const drawHeader = () => {
  removeGroupChildren(headerGroup)
  const charName = window.data.savemap.party.members[DATA.partyMember]
  const char = window.data.savemap.characters[charName]

  // Character
  addImageToDialog(
    headerGroup,
    'profiles',
    charName,
    'profile-image',
    8.5 + 20,
    4.5 + 24,
    0.5
  )
  addCharacterSummary(
    headerGroup,
    charName,
    55 - 8,
    18.5 - 4,
    char.name,
    char.status.statusFlags === 'None' ? null : char.status.statusFlags,
    char.level.current,
    char.stats.hp.current,
    char.stats.hp.max,
    char.stats.mp.current,
    char.stats.mp.max
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
      headerGroup,
      equip[0],
      `stat-label-equip${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      125 - 8,
      16.5 - 4 + (i * 17),
      0.5
    )
    // console.log('status equip', i, equip)
    addTextToDialog(
      headerGroup,
      equip[1],
      `stat-equip-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      151.5 - 8,
      16.5 - 4 + (i * 17),
      0.5
    )
  }
}
const drawInfo = () => {
  removeGroupChildren(infoGroup)
  const charName = window.data.savemap.party.members[DATA.partyMember]
  const char = window.data.savemap.characters[charName]
  addTextToDialog(
    infoGroup,
    char.equip.weapon.description, // Not right obviously, just placeholder
    `equip-info`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    14 - 8,
    75 - 4,
    0.5
  )
}
const drawSlots = () => {
  removeGroupChildren(slotsGroup)
  // Not right obviously, just placeholder
  const charName = window.data.savemap.party.members[DATA.partyMember]
  const char = window.data.savemap.characters[charName]
  addTextToDialog(
    slotsGroup,
    'Slot',
    `equip-slot-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    13.5 - 8,
    102 - 4,
    0.5
  )
  addTextToDialog(
    slotsGroup,
    'Growth',
    `equip-info`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    13.5 - 8,
    123.5 - 4,
    0.5
  )
  addTextToDialog(
    slotsGroup,
    'Nothing',
    `equip-info`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    104 - 8,
    123.5 - 4,
    0.5
  )
  createEquipmentMateriaViewer(slotsGroup,
    75,
    92,
    window.data.kernel.weaponData[char.equip.weapon.index].materiaSlots,
    char, EQUIPMENT_TYPE.WEAPON
  )
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  headerDialog.visible = false
  infoDialog.visible = false
  slotsDialog.visible = false
  statsDialog.visible = false
  listDialog.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU EQUIP', key, firstPress, state)
  if (state === 'equip') {
    if (key === KEY.X) {
      console.log('press MAIN MENU EQUIP EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
  }
}
export { loadEquipMenu, keyPress }

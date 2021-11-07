import { getMenuBlackOverlay, setMenuState } from './menu-module.js'
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
  createEquipmentMateriaViewer
} from './menu-box-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { getBattleStatsForChar } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, infoDialog, slotsDialog, statsDialog, listDialog
let headerGroup, infoGroup, slotsGroup, statsLabelsGroup, statsBaseGroup, statsSelectedGroup, listGroup

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  equipType: 0,
  page: 0,
  pos: 0
}
const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
}

const loadEquipMenu = async partyMember => {
  // Reset data
  DATA.partyMember = partyMember
  DATA.equipType = 0
  DATA.page = 0
  DATA.pos = 0
  setDataFromPartyMember()

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
  statsLabelsGroup = addGroupToDialog(statsDialog, 18)
  statsBaseGroup = addGroupToDialog(statsDialog, 18)
  statsSelectedGroup = addGroupToDialog(statsDialog, 18)

  listDialog = await createDialogBox({
    id: 7,
    name: 'listDialog',
    w: 123,
    h: 157.5,
    x: 197,
    y: 82.5,
    expandInstantly: true,
    noClipping: true
  })
  listDialog.visible = true
  listGroup = addGroupToDialog(listDialog, 19)

  drawHeader()
  drawInfo()
  drawSlots()
  drawStatsLabels()
  drawStatsBase()
  drawStatsSelectedBase()
  await fadeOverlayOut(getMenuBlackOverlay())

  setMenuState('equip')
  // movePointer(POINTERS.pointer1, 237, 17)
}
const drawHeader = () => {
  removeGroupChildren(headerGroup)

  // Character
  addImageToDialog(
    headerGroup,
    'profiles',
    DATA.char.name,
    'profile-image',
    8.5 + 20,
    4.5 + 24,
    0.5
  )
  addCharacterSummary(
    headerGroup,
    DATA.char.name,
    55 - 8,
    18.5 - 4,
    DATA.char.name,
    DATA.char.status.statusFlags === 'None' ? null : DATA.char.status.statusFlags,
    DATA.char.level.current,
    DATA.char.stats.hp.current,
    DATA.char.stats.hp.max,
    DATA.char.stats.mp.current,
    DATA.char.stats.mp.max
  )
  // Equips
  const equips = [
    ['Wpn.', DATA.char.equip.weapon.index < 255 ? DATA.char.equip.weapon.name : ''],
    ['Arm.', DATA.char.equip.armor.index < 255 ? DATA.char.equip.armor.name : ''],
    ['Acc.', DATA.char.equip.accessory.index < 255 ? DATA.char.equip.accessory.name : '']
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
  addTextToDialog(
    infoGroup,
    DATA.char.equip.weapon.description, // Not right obviously, just placeholder
    `equip-info`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    12 - 8,
    76.5 - 4,
    0.5
  )
}
const drawSlots = () => {
  removeGroupChildren(slotsGroup)
  // Not right obviously, just placeholder
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
    92 - 13.5,
    window.data.kernel.weaponData[DATA.char.equip.weapon.index].materiaSlots,
    DATA.char
  )
}
const STAT_TYPES = [
  ['Attack', 'attack'],
  ['Attack%', 'attackPercent'],
  ['Defense', 'defense'],
  ['Defense%', 'defensePercent'],
  ['Magic atk', 'magicAttack'],
  ['Magic def', 'magicDefense'],
  ['Magic def%', 'magicDefensePercent']
]
const drawStatsLabels = () => {
  removeGroupChildren(statsLabelsGroup)
  for (let i = 0; i < STAT_TYPES.length; i++) {
    const label = STAT_TYPES[i][0]
    addTextToDialog(
      statsLabelsGroup,
      label,
      `equip-stats-label-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      26.5 - 8,
      148.5 - 4 + (i * 13),
      0.5
    )
    addTextToDialog(
      statsLabelsGroup,
      '→',
      `equip-stats-label-${i}`,
      LETTER_TYPES.MenuTextFixed,
      LETTER_COLORS.Cyan,
      100 + 23.5 - 8,
      148.5 - 4 + (i * 13),
      0.5
    )
  }

  // TODO - arrows
}
const drawStatsBase = () => {
  removeGroupChildren(statsBaseGroup)
  for (let i = 0; i < STAT_TYPES.length; i++) {
    const attr = STAT_TYPES[i][1]
    addTextToDialog(
      statsBaseGroup,
      ('' + DATA.battleStats[attr]).padStart(3, ' '),
      `equip-stats-${i}`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      100 - 8,
      148.5 - 4 + (i * 13),
      0.5
    )
  }
}
const drawStatsSelectedBase = () => {
  removeGroupChildren(statsSelectedGroup)
  for (let i = 0; i < STAT_TYPES.length; i++) {
    const attr = STAT_TYPES[i][1]

    // TODO - Colors and compare to base
    addTextToDialog(
      statsSelectedGroup,
      ('' + DATA.battleStats[attr]).padStart(3, ' '),
      `equip-stats-${i}`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      100 + 35 - 8,
      148.5 - 4 + (i * 13),
      0.5
    )
  }
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

import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'
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
  createEquipmentMateriaViewer,
  EQUIPMENT_TYPE
} from './menu-box-helper.js'
import { fadeInHomeMenu, homeNav, setSelectedNav } from './menu-main-home.js'
import { getBattleStatsForChar } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, headerGroup //
let infoDialog, infoGroup //
let arrangeDialog // no need for group //
let detailsDialog, detailsGroup //
let listSmallDialog, listSmallGroup //
let trashDialog // no need for group
let checkDialog, checkGroup //

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  mainNavPos: 0 // 0 check, 1-8 weap, 9 arrange, 10-17 arm
}
const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
}

const loadMateriaMenu = async partyMember => {
  setDataFromPartyMember()
  DATA.mainNavPos = 0

  headerDialog = await createDialogBox({
    id: 25,
    name: 'headerDialog',
    w: 320,
    h: 73,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  headerDialog.visible = true
  headerGroup = addGroupToDialog(headerDialog, 35)

  checkDialog = await createDialogBox({
    id: 24,
    name: 'checkDialog',
    w: 320,
    h: 167,
    x: 0,
    y: 73,
    expandInstantly: true,
    noClipping: true
  })
  checkDialog.visible = true
  checkGroup = addGroupToDialog(checkDialog, 34)

  listSmallDialog = await createDialogBox({
    id: 23,
    name: 'listSmallDialog',
    w: 129.5,
    h: 144.5,
    x: 190.5,
    y: 95.5,
    expandInstantly: true,
    noClipping: true
  })
  listSmallDialog.visible = true
  listSmallGroup = addGroupToDialog(listSmallDialog, 33)

  detailsDialog = await createDialogBox({
    id: 22,
    name: 'detailsDialog',
    w: 193.5,
    h: 144.5,
    x: 0,
    y: 95.5,
    expandInstantly: true,
    noClipping: true
  })
  detailsDialog.visible = true
  detailsGroup = addGroupToDialog(detailsDialog, 32)

  infoDialog = await createDialogBox({
    id: 21,
    name: 'infoDialog',
    w: 320,
    h: 25.5,
    x: 0,
    y: 73,
    expandInstantly: true,
    noClipping: true
  })
  infoDialog.visible = true
  infoGroup = addGroupToDialog(infoDialog, 31)

  arrangeDialog = await createDialogBox({
    id: 20,
    name: 'arrangeDialog',
    w: 63.5,
    h: 60,
    x: 123.5,
    y: 18,
    expandInstantly: true,
    noClipping: true
  })
  arrangeDialog.visible = false

  trashDialog = await createDialogBox({
    id: 19,
    name: 'trashDialog',
    w: 186.5,
    h: 54.5,
    x: 46.5,
    y: 13,
    expandInstantly: true,
    noClipping: true
  })
  trashDialog.visible = false

  setSelectedNav(2)
  drawHeader()

  await fadeOverlayOut(getMenuBlackOverlay())

  setMenuState('materia-main')
}
const drawHeader = () => {
  removeGroupChildren(headerGroup)
  const charName = window.data.savemap.party.members[DATA.partyMember]
  addImageToDialog(
    headerGroup,
    'profiles',
    charName,
    'profile-image',
    8.5 + 20,
    9.5 + 24,
    0.5
  )
  addCharacterSummary(
    headerGroup,
    charName,
    51.5 - 8,
    25 - 4,
    DATA.char.name,
    DATA.char.status.statusFlags === 'None' ? null : DATA.char.status.statusFlags,
    DATA.char.level.current,
    DATA.char.stats.hp.current,
    DATA.char.stats.hp.max,
    DATA.char.stats.mp.current,
    DATA.char.stats.mp.max
  )

  // addMenuCommandsToDialog(statsGroup, 148.5, 68.5, battleStats.menu.command)

  // Equips
  const equips = [
    ['Wpn.', DATA.char.equip.weapon.name, window.data.kernel.weaponData[DATA.char.equip.weapon.index].materiaSlots, EQUIPMENT_TYPE.WEAPON, 'Check'],
    ['Arm.', DATA.char.equip.armor.name, window.data.kernel.armorData[DATA.char.equip.armor.index].materiaSlots, EQUIPMENT_TYPE.ARMOR, 'Arrange']
  ]
  const yAdj = 26.5

  for (let i = 0; i < equips.length; i++) {
    const equip = equips[i]
    addTextToDialog(
      headerGroup,
      equip[0],
      `materia-label-header-${i}-weapon-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      133.5 - 8,
      26 - 4 + (i * yAdj),
      0.5
    )
    // console.log('status equip', i, equip)
    addTextToDialog(
      headerGroup,
      equip[1],
      `materia-label-header-${i}-weapon`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      160 - 8,
      26 - 4 + (i * yAdj),
      0.5
    )
    addTextToDialog(
      headerGroup,
      equip[4],
      `materia-label-header-${i}-action-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      140 - 8,
      40 - 4 + (i * yAdj),
      0.5
    )
    createEquipmentMateriaViewer(headerGroup,
      177,
      41.5 - 25 + (i * yAdj),
      equip[2],
      DATA.char, equip[3]
    )
  }
}

const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  headerDialog.visible = false
  infoDialog.visible = false
  arrangeDialog.visible = false
  detailsDialog.visible = false
  listSmallDialog.visible = false
  trashDialog.visible = false
  checkDialog.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU MATERIA', key, firstPress, state)
  if (state === 'materia-main') {
    if (key === KEY.X) {
      console.log('press MAIN MENU MATERIA EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
  }
}
export { loadMateriaMenu, keyPress }

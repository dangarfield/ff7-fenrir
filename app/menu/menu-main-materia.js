import TWEEN from '../../assets/tween.esm.js'
import { currentMateriaLevel, getBattleStatsForChar, getEnemySkillFlagsWithSkills, isMPTurboActive, applyMPTurbo, recalculateAndApplyHPMP } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'
import { unequipMateria, arrangeMateria, trashMateria } from '../materia/materia-module.js'
import {
  addCharacterSummary, addGroupToDialog, addImageToDialog, addMenuCommandsToDialog, addShapeToDialog, addTextToDialog, createDialogBox, createEquipmentMateriaViewer, createItemListNavigation, EQUIPMENT_TYPE, fadeOverlayIn, fadeOverlayOut, LETTER_COLORS, LETTER_TYPES, movePointer, POINTERS, removeGroupChildren, WINDOW_COLORS_SUMMARY
} from './menu-box-helper.js'
import { loadEquipMenu } from './menu-main-equip.js'
import { fadeInHomeMenu, setSelectedNavByName } from './menu-main-home.js'
import { getMenuBlackOverlay, getMenuState, setMenuState } from './menu-module.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'

let headerDialog, headerGroup
let infoDialog, infoGroup
let arrangeDialog
let materiaDetailsDialog, materiaDetailsGroup, materiaDetailsEnemySkillGroup, materialsDetailsEnemySkillTextContents
let smallMateriaListDialog, smallMateriaListGroup, smallMateriaListContentsGroup
let trashDialog
let checkDialog, checkGroup, checkSubGroup

let exchangeMateriaDetailsDialog, exchangeMateriaDetailsGroup
let exchangeInfoDialog, exchangeInfoGroup
let exchangeCharDialog, exchangeCharGroup, exchangeCharContentsGroup
let exchangeMateriaListDialog, exchangeMateriaListGroup, exchangeMateriaListContentsGroup

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  mainNavPos: 1, // 0 check, 1-8 weap, 9 arrange, 10-17 arm
  arrangePos: 0,
  trashMode: false,
  trashConfirmPos: 0,
  smallMateriaList: {active: false, pos: 0, page: 0},
  tweenEnemySkills: false,
  check: { main: 0,
    sub: {
      type: '',
      pos: 0,
      page: 0,
      config: {
        magic: {cols: 3},
        summon: {cols: 1},
        enemySkills: {cols: 2}
      },
      spells: []
    }
  },
  exchange: {
    activeCharacters: [],
    selected: {type: 'none', page: 0, pos: 0},
    type: 'chars',
    chars: {page: 0, pos: 0},
    list: {page: 0, pos: 0}
  }
}
const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
  window.DATA = DATA
}

const loadMateriaMenu = async partyMember => {
  DATA.partyMember = partyMember
  setDataFromPartyMember()
  DATA.mainNavPos = 1
  DATA.smallMateriaList.pos = 0
  DATA.smallMateriaList.page = 0
  DATA.check.main = 0
  DATA.arrangePos = 0
  DATA.exchange.activeCharacters = getActiveCharacters()
  DATA.exchange.type = 'chars' // TODO - Is this here on every time the exchange menu is opened?
  DATA.exchange.chars.page = 0
  DATA.exchange.chars.pos = 1
  DATA.exchange.list.page = 0
  DATA.exchange.list.pos = 0

  headerDialog = createDialogBox({
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

  checkDialog = createDialogBox({
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
  checkSubGroup = addGroupToDialog(checkDialog, 34)

  smallMateriaListDialog = createDialogBox({
    id: 23,
    name: 'smallMateriaListDialog',
    w: 129.5,
    h: 144.5,
    x: 190.5,
    y: 95.5,
    expandInstantly: true,
    noClipping: false
  })
  smallMateriaListDialog.visible = true
  smallMateriaListGroup = addGroupToDialog(smallMateriaListDialog, 33)
  smallMateriaListContentsGroup = addGroupToDialog(smallMateriaListDialog, 33)

  materiaDetailsDialog = createDialogBox({
    id: 22,
    name: 'materiaDetailsDialog',
    w: 193.5,
    h: 144.5,
    x: 0,
    y: 95.5,
    expandInstantly: true,
    noClipping: true
  })
  materiaDetailsDialog.visible = true
  materiaDetailsGroup = addGroupToDialog(materiaDetailsDialog, 32)
  materiaDetailsEnemySkillGroup = addGroupToDialog(materiaDetailsDialog, 32)

  infoDialog = createDialogBox({
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

  arrangeDialog = createDialogBox({
    id: 15,
    name: 'arrangeDialog',
    w: 63.5,
    h: 60,
    x: 123.5,
    y: 18,
    expandInstantly: true,
    noClipping: true
  })
  arrangeDialog.visible = false
  arrangeDialog.position.z = 15
  window.arrangeDialog = arrangeDialog

  trashDialog = createDialogBox({
    id: 14,
    name: 'trashDialog',
    w: 186.5,
    h: 54.5,
    x: 46.5,
    y: 13,
    expandInstantly: true,
    noClipping: true
  })
  trashDialog.visible = false
  trashDialog.position.z = 100 - 14
  window.trashDialog = trashDialog

  // Exchange
  exchangeMateriaDetailsDialog = createDialogBox({
    id: 10,
    name: 'exchangeMateriaDetailsDialog',
    w: 320,
    h: 25.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  // exchangeMateriaDetailsDialog.visible = true
  exchangeMateriaDetailsDialog.position.z = 20
  exchangeMateriaDetailsGroup = addGroupToDialog(exchangeMateriaDetailsDialog, 19)

  exchangeInfoDialog = createDialogBox({
    id: 10,
    name: 'exchangeInfoDialog',
    w: 320,
    h: 25.5,
    x: 0,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  // exchangeInfoDialog.visible = true
  exchangeInfoDialog.position.z = 20
  exchangeInfoGroup = addGroupToDialog(exchangeInfoDialog, 19)
  window.exchangeInfoDialog = exchangeInfoDialog

  exchangeCharDialog = createDialogBox({
    id: 18,
    name: 'exchangeCharDialog',
    w: 13.5, // TODO - validate sizes
    h: 189,
    x: 180,
    y: 51,
    expandInstantly: true,
    noClipping: false
  })
  // exchangeCharDialog.visible = true
  exchangeCharGroup = addGroupToDialog(exchangeCharDialog, 28)
  exchangeCharContentsGroup = addGroupToDialog(exchangeCharDialog, 28)

  exchangeMateriaListDialog = createDialogBox({
    id: 17,
    name: 'exchangeMateriaListDialog',
    w: 126.5,
    h: 189,
    x: 193.5,
    y: 51,
    expandInstantly: true,
    noClipping: true
  })
  // exchangeMateriaListDialog.visible = true
  exchangeMateriaListGroup = addGroupToDialog(exchangeMateriaListDialog, 27)
  exchangeMateriaListContentsGroup = addGroupToDialog(exchangeMateriaListDialog, 27)

  console.log('materia DATA', DATA)
  setSelectedNavByName('Materia')
  drawEnemySkillsGroup()
  drawArrangeMenu()
  drawTrashDialog()
  drawHeader()
  drawMainNavPointer()
  drawSmallMateriaListSlider()
  drawExchangeMenu()
  await fadeOverlayOut(getMenuBlackOverlay())

  setMenuState('materia-main')
  // showExchangeMenu()
}
const getActiveCharacters = () => {
  const chars = ['Cloud', 'Barret', 'Tifa', 'Aeris', 'RedXIII', 'Yuffie', 'CaitSith', 'Vincent', 'Cid']
  return chars.filter(c => window.data.savemap.party.phsVisibility[c] === 1)
}
const drawExchangeMenu = () => {
  // Add sliders
  createItemListNavigation(exchangeMateriaListGroup, 313, 104 - 32 + 22.5, 183, window.data.savemap.materias.length, 10)
  exchangeMateriaListGroup.userData.slider.userData.moveToPage(0)
  // const activeMembers = getFrom phs visibility? order?
  exchangeCharGroup.userData.z = 100 - 71
  createItemListNavigation(exchangeCharGroup, 186.5, 104 - 32 + 22.5, 183, DATA.exchange.activeCharacters.length, 4)
  exchangeCharGroup.userData.slider.userData.moveToPage(0)
}
const drawExchangeCharListOneItem = (group, i, page, x, y, yAdj) => {
  const char = window.data.savemap.characters[DATA.exchange.activeCharacters[i + page]]
  const charDialog = createDialogBox({
    id: 16,
    name: `materia-exchange-char-dialog-${i}`,
    w: 184, // TODO - validate
    h: yAdj,
    x: 0,
    y: y + (i * yAdj),
    expandInstantly: true,
    noClipping: true,
    group: group
  })
  // charDialog.position.z = 16
  // charDialog.userData.z = 100 - 16
  charDialog.visible = true
  console.log('materia drawExchangeCharListOneItem', char)

  const rowOffset = 15 // TODO - validate all of these
  const rowAdj = 13

  const equips = [
    ['Wpn.', window.data.kernel.weaponData[char.equip.weapon.index].materiaSlots, EQUIPMENT_TYPE.WEAPON],
    ['Arm.', window.data.kernel.armorData[char.equip.armor.index].materiaSlots, EQUIPMENT_TYPE.ARMOR]
  ]
  addTextToDialog(
    charDialog,
    char.name,
    `materia-exchange-char-name-${i}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    x - 8,
    y - 4 + (i * yAdj) + rowOffset,
    0.5
  )
  for (let j = 0; j < equips.length; j++) {
    const equip = equips[j]
    addTextToDialog(
      charDialog,
      equip[0],
      `materia-exchange-equip-type-${i}-${j}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      x - 8,
      y - 4 + (i * yAdj) + rowOffset + (rowAdj * (j + 1)),
      0.5
    )
    createEquipmentMateriaViewer(charDialog,
      x + 28,
      y - 24 + (i * yAdj) + rowOffset + (rowAdj * (j + 1)), // TODO - validate positions
      equip[1],
      char, equip[2]
    )
  }
}
const drawExchangeChars = () => {
  console.log('materia drawExchangeChars')
  removeGroupChildren(exchangeCharContentsGroup)
  const { x, y, yAdj } = getExchangeCharPositions()
  for (let i = 0; i < 4; i++) {
    drawExchangeCharListOneItem(exchangeCharContentsGroup, i, DATA.exchange.chars.page, x, y, yAdj)
  }
  exchangeCharGroup.userData.slider.userData.moveToPage(DATA.exchange.chars.page)
  exchangeCharContentsGroup.position.y = 0
  window.exchangeCharContentsGroup = exchangeCharContentsGroup
}
const drawExchangeMateriaList = () => {
  console.log('materia drawExchangeMateriaList')
  removeGroupChildren(exchangeMateriaListContentsGroup)
  const { x, y, yAdj } = getExchangeMateriaListPositions()
  for (let i = 0; i < 10; i++) {
    drawMateriaListOneItem(exchangeMateriaListContentsGroup, i, DATA.exchange.list.page, x, y, yAdj)
  }
  exchangeMateriaListGroup.userData.slider.userData.moveToPage(DATA.exchange.list.page)
  exchangeMateriaListContentsGroup.position.y = 0
}
const getExchangePointerCoords = (type, pos) => {
  if (type === undefined) {
    type = DATA.exchange.type
  }
  if (pos === undefined) {
    pos = DATA.exchange[type].pos
  }
  if (type === 'chars') {
    const { x, y, yAdj } = getExchangeCharPositions()
    const rowOffset = 15 // TODO - validate all of these
    const rowAdj = 13
    const xAdj = 14
    if (pos === undefined) {
      pos = DATA.exchange.chars.pos
    }
    const xAdjAction = pos % 9 === 0 ? -17.5 : 0
    return {
      x: x + ((pos % 9) * xAdj) + xAdjAction + 6.5,
      y: y + (Math.trunc(pos / 18) * yAdj) + rowOffset + ((1 + Math.trunc(pos / 9) % 2) * rowAdj)
    }
  } else if (type === 'list') {
    const { x, y, yAdj } = getExchangeMateriaListPositions()
    return {
      x: x - 14,
      y: y + (pos * yAdj) + 4
    }
  }
  return {x: 0, y: 0}
}
const drawExchangePointers = () => {
  const {x, y} = getExchangePointerCoords()
  movePointer(POINTERS.pointer1, x, y)
  drawExchangeSelectedPointers()
}
const drawExchangeSelectedPointers = () => {
  if (DATA.exchange.selected.type === 'chars') {
    const pageDiff = DATA.exchange.selected.page - DATA.exchange.chars.page
    const pos = (pageDiff * 18) + DATA.exchange.selected.pos
    // console.log('materia drawExchangeSelectedPointers chars', DATA.exchange, pageDiff, pos)
    if (pos < 0 || pos >= 18 * 4) {
      // console.log('materia drawExchangeSelectedPointers chars no draw')
      movePointer(POINTERS.pointer2, 0, 0, true)
    } else {
      const {x, y} = getExchangePointerCoords(DATA.exchange.selected.type, pos)
      // console.log('materia drawExchangeSelectedPointers chars draw', x, y)
      movePointer(POINTERS.pointer2, x - 4, y - 2, false, true)
    }
  } else if (DATA.exchange.selected.type === 'list') {
    // console.log('materia drawExchangeSelectedPointers list')
    const pageDiff = DATA.exchange.selected.page - DATA.exchange.list.page
    const pos = pageDiff + DATA.exchange.selected.pos
    // console.log('materia drawExchangeSelectedPointers list', DATA.exchange, pageDiff, pos)
    if (pos < 0 || pos >= 10) {
      // console.log('materia drawExchangeSelectedPointers list no draw')
      movePointer(POINTERS.pointer2, 0, 0, true)
    } else {
      const {x, y} = getExchangePointerCoords(DATA.exchange.selected.type, pos)
      // console.log('materia drawExchangeSelectedPointers list draw', x, y)
      movePointer(POINTERS.pointer2, x - 4, y - 2, false, true)
    }
  } else {
    // console.log('materia drawExchangeSelectedPointers no selected')
    movePointer(POINTERS.pointer2, 0, 0, true)
  }

  // const {x, y} = getExchangePointerCoords()
  // movePointer(POINTERS.pointer2, x - 4, y - 2, false, true)
}
window.drawExchangePointers = drawExchangePointers
// window.DATA = DATA

const tweenExchangeCharsList = (up, state, cb) => {
  setMenuState('materia-tweening-list')
  const subContents = exchangeCharContentsGroup
  for (let i = 0; i < DATA.page + 1; i++) {
    subContents.children[i].visible = true
  }
  let from = {y: subContents.position.y}
  let to = {y: up ? subContents.position.y + 47.25 : subContents.position.y - 47.25}
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      subContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < DATA.page; i++) {
        subContents.children[i].visible = false
      }
      setMenuState(state)
      cb()
    })
    .start()
}
const tweenExchangeMateriaList = (up, state, cb) => {
  setMenuState('materia-tweening-list')
  const subContents = exchangeMateriaListContentsGroup
  for (let i = 0; i < DATA.page + 1; i++) {
    subContents.children[i].visible = true
  }
  let from = {y: subContents.position.y}
  let to = {y: up ? subContents.position.y + 18 : subContents.position.y - 18}
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      subContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < DATA.page; i++) {
        subContents.children[i].visible = false
      }
      setMenuState(state)
      cb()
    })
    .start()
}
const exchangeNavigation = (vertical, delta) => {
  const currentState = getMenuState()
  // console.log('materia currentState', currentState)
  if (DATA.exchange.type === 'chars') {
    const { x, y, yAdj } = getExchangeCharPositions()
    const maxPage = DATA.exchange.activeCharacters.length - 4
    const maxPos = 18 * 4
    const potential = DATA.exchange.chars.pos + (vertical ? delta * 9 : delta)
    // console.log('materia exchangeNavigation chars', vertical, delta, '-', DATA.exchange.chars.page, DATA.exchange.chars.pos, '->', potential, ':', maxPage, maxPos)

    // TODO - Not sure, but it might be that a no equippable slot (eg weapon ony has 2 mat slots, if potential  = weaponMateria3, go to item list), test this
    if (DATA.exchange.chars.pos % 9 === 0 && !vertical && delta < 0) {
      // console.log('materia exchangeNavigation chars left on equip type - do nothing')
    } else if (DATA.exchange.chars.pos % 9 === 8 && !vertical && delta > 0) {
      // console.log('materia exchangeNavigation chars right on last materia - switch to list menu navigation')
      DATA.exchange.type = 'list'
      drawExchangePointers()
      drawExchangeMateriaDetailsAndInfo()
    } else if (potential < 0) {
      if (DATA.exchange.chars.page === 0) {
        // console.log('materia exchangeNavigation chars on first page - do nothing')
      } else {
        // console.log('materia exchangeNavigation chars not on first page - PAGE DOWN')
        drawExchangeCharListOneItem(exchangeCharContentsGroup, -1, DATA.exchange.chars.page, x, y, yAdj)
        DATA.exchange.chars.page--
        tweenExchangeCharsList(false, currentState, drawExchangeChars)
        drawExchangeSelectedPointers()
        drawExchangeMateriaDetailsAndInfo()
      }
    } else if (potential >= maxPos) {
      if (DATA.exchange.chars.page >= maxPage) {
        // console.log('materia exchangeNavigation chars on last page - do nothing')
      } else {
        // console.log('materia exchangeNavigation chars not on last page - PAGE UP')
        drawExchangeCharListOneItem(exchangeCharContentsGroup, 4, DATA.exchange.chars.page, x, y, yAdj)
        DATA.exchange.chars.page++
        tweenExchangeCharsList(true, currentState, drawExchangeChars)
        drawExchangeSelectedPointers()
        drawExchangeMateriaDetailsAndInfo()
      }
    } else {
      DATA.exchange.chars.pos = potential
      drawExchangePointers()
      drawExchangeMateriaDetailsAndInfo()
    }
  } else if (DATA.exchange.type === 'list') {
    const { x, y, yAdj } = getExchangeMateriaListPositions()
    const maxPage = window.data.savemap.materias.length - 10
    const maxPos = 10
    const potential = DATA.exchange.list.pos + delta
    // console.log('materia exchangeNavigation list', vertical, delta, '-', DATA.exchange.list.page, DATA.exchange.list.pos, '->', potential, ':', maxPage, maxPos)

    if (!vertical && delta > 0) {
      // console.log('materia exchangeNavigation list right - do nothing')
    } else if (!vertical && delta < 0) {
      // console.log('materia exchangeNavigation list left - switch to chars menu navigation')
      DATA.exchange.type = 'chars'
      drawExchangePointers()
      drawExchangeMateriaDetailsAndInfo()
    } else if (potential < 0) {
      if (DATA.exchange.list.page === 0) {
        // console.log('materia exchangeNavigation list on first page - do nothing')
      } else {
        // console.log('materia exchangeNavigation list not on first page - PAGE DOWN')
        drawMateriaListOneItem(exchangeMateriaListContentsGroup, -1, DATA.exchange.list.page, x, y, yAdj)
        DATA.exchange.list.page--
        tweenExchangeMateriaList(false, currentState, drawExchangeMateriaList)
        drawExchangeSelectedPointers()
        drawExchangeMateriaDetailsAndInfo()
      }
    } else if (potential >= maxPos) {
      if (DATA.exchange.list.page >= maxPage) {
        // console.log('materia exchangeNavigation list on last page - do nothing')
      } else {
        // console.log('materia exchangeNavigation list not on last page - PAGE UP')
        drawMateriaListOneItem(exchangeMateriaListContentsGroup, 10, DATA.exchange.list.page, x, y, yAdj)
        DATA.exchange.list.page++
        tweenExchangeMateriaList(true, currentState, drawExchangeMateriaList)
        drawExchangeSelectedPointers()
        drawExchangeMateriaDetailsAndInfo()
      }
    } else {
      // console.log('materia exchangeNavigation list normal pos based navigation')
      DATA.exchange.list.pos = potential
      drawExchangePointers()
      drawExchangeMateriaDetailsAndInfo()
    }
    // drawExchangePointers() // Temp for all
  }
}
const exchangePageNavigation = (up) => {
  if (DATA.exchange.type === 'chars') {
    const maxPage = DATA.exchange.activeCharacters.length - 4
    if (up) {
      DATA.exchange.chars.page = DATA.exchange.chars.page + 4
      if (DATA.exchange.chars.page > maxPage) {
        DATA.exchange.chars.page = maxPage
      }
    } else {
      DATA.exchange.chars.page = DATA.exchange.chars.page - 4
      if (DATA.exchange.chars.page < 0) {
        DATA.exchange.chars.page = 0
      }
    }
    // Update list group positions
    exchangeCharGroup.userData.slider.userData.moveToPage(DATA.exchange.chars.page)
    drawExchangeChars()
    drawExchangeMateriaDetailsAndInfo()
    drawExchangeSelectedPointers()
  } else if (DATA.exchange.type === 'list') {
    const maxPage = window.data.savemap.materias.length - 10
    if (up) {
      DATA.exchange.list.page = DATA.exchange.list.page + 10
      if (DATA.exchange.list.page > maxPage) {
        DATA.exchange.list.page = maxPage
      }
    } else {
      DATA.exchange.list.page = DATA.exchange.list.page - 10
      if (DATA.exchange.list.page < 0) {
        DATA.exchange.list.page = 0
      }
    }
    // Update list group positions
    exchangeMateriaListGroup.userData.slider.userData.moveToPage(DATA.exchange.list.page)
    drawExchangeMateriaList()
    drawExchangeMateriaDetailsAndInfo()
    drawExchangeSelectedPointers()
  }
}
const drawExchangeMateriaDetailsAndInfo = () => {
  removeGroupChildren(exchangeMateriaDetailsGroup)
  removeGroupChildren(exchangeInfoGroup)
  let materia
  if (DATA.exchange.type === 'chars') {
    const char = window.data.savemap.characters[DATA.exchange.activeCharacters[DATA.exchange.chars.page + Math.trunc(DATA.exchange.chars.pos / 18)]]
    const position = DATA.exchange.chars.pos % 18
    const slot = position < 9 ? `weaponMateria${position}` : `armorMateria${position % 9}`
    if (position === 0 || position === 9) {
      return
    }
    materia = char.materia[slot]
  } else if (DATA.exchange.type === 'list') {
    materia = window.data.savemap.materias[DATA.exchange.list.page + DATA.exchange.list.pos]
  } else {
    return
  }
  if (materia.id === 0xFF) {
    return
  }
  const materiaData = window.data.kernel.materiaData[materia.id]
  drawExchangeMateriaDetails(materia, materiaData)
  drawExchangeInfo(materiaData.description)
}
const drawExchangeMateriaDetails = (materia, materiaData) => {
  const y = 17
  addTextToDialog(
    exchangeInfoGroup,
    materiaData.name,
    `materia-exchange-details-name`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    31 - 8, // TODO - positions
    y - 4,
    0.5
  )
  addImageToDialog(exchangeInfoGroup,
    'materia',
    materiaData.type,
    `materia-details-type`,
    31 - 8 + 0.5,
    y - 4 - 1.5,
    0.5
  )
  const currentLevel = currentMateriaLevel(materiaData, materia.ap)
  const starX = 153 + 6 // TODO - positions
  const starY = y - 4 - 1
  const starXAdj = 12.5

  for (let i = 0; i < materiaData.apLevels.length; i++) {
    addImageToDialog(
      exchangeInfoGroup,
      'materia',
      i < currentLevel ? `${materiaData.type}-star-active-small` : `${materiaData.type}-star-inactive-small`,
      `material-details-level-${i}`,
      starX + (starXAdj * i),
      starY,
      0.5
    )
  }
}
const drawExchangeInfo = (text) => {
  addTextToDialog(
    exchangeInfoGroup,
    text,
    `materia-exchange-info`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    10 - 8, // TODO - positions
    42 - 4,
    0.5
  )
}
const exchangeSelectCancel = () => {
  hideExchangeMenu()
  drawArrangePointer()
  drawSmallMateriaList()
}
const exchangeSelectSelect = () => {
  console.log('materia exchangeSelectSelect', DATA.exchange)
  if (DATA.exchange.selected.type === 'none') {
    const from = {type: DATA.exchange.type, page: DATA.exchange[DATA.exchange.type].page, pos: DATA.exchange[DATA.exchange.type].pos}
    addIndexInformationToSwapMateria(from)
    if (from.invalidSlot) {
      console.log('materia exchangeSelectSelect INVALID SLOT')
      return
    }
    DATA.exchange.selected.type = DATA.exchange.type
    DATA.exchange.selected.page = DATA.exchange[DATA.exchange.type].page
    DATA.exchange.selected.pos = DATA.exchange[DATA.exchange.type].pos
    drawExchangeSelectedPointers()
    setMenuState('materia-exchange-confirm')
  }
}
const exchangeRemoveMateriaFromSlot = () => {
  if (DATA.exchange.type === 'chars') {
    const from = {type: DATA.exchange.type, page: DATA.exchange[DATA.exchange.type].page, pos: DATA.exchange[DATA.exchange.type].pos}
    addIndexInformationToSwapMateria(from)
    console.log('materia exchangeRemoveMateriaFromSlot', from)
    if (from.invalidSlot || from.materia.id === 0xFF) {
      console.log('materia exchangeRemoveMateriaFromSlot INVALID SLOT / no materia')
      return
    }
    console.log('materia exchangeRemoveMateriaFromSlot REMOVING')
    unequipMateria(from.char, from.slotName)
    drawExchangeChars()
    drawExchangeMateriaList()
    recalculateAndApplyHPMP(from.char)
    if (from.char.id === DATA.char.id) {
      setDataFromPartyMember()
      drawHeader()
    }
    drawExchangeMateriaDetailsAndInfo()
  }
}
const exchangeConfirmCancel = () => {
  console.log('materia exchangeConfirmCancel', DATA.exchange.selected)
  movePointer(POINTERS.pointer2, 0, 0, true)
  DATA.exchange.selected = {type: 'none', page: 0, pos: 0}
  setMenuState('materia-exchange-select')
}
const exchangeConfirmSelect = () => {
  const from = DATA.exchange.selected
  const to = {type: DATA.exchange.type, page: DATA.exchange[DATA.exchange.type].page, pos: DATA.exchange[DATA.exchange.type].pos}
  addIndexInformationToSwapMateria(from)
  addIndexInformationToSwapMateria(to)
  console.log('materia exchangeConfirmSelect', from, to)
  if (from.invalidSlot || to.invalidSlot) {
    console.log('materia exchangeConfirmSelect INVALID slot on one of the selected materia')
  } else if (from.isEquipment !== to.isEquipment) {
    console.log('materia exchangeConfirmSelect CANNOT combine equipment row with single materia')
  } else if (!from.isEquipment) {
    console.log('materia exchangeConfirmSelect SWAP single materia')
    swapSingleMateria(from, to)
  } else {
    console.log('materia exchangeConfirmSelect SWAP equipment row')
    swapEquipmentRow(from, to)
  }
}
const swapEquipmentRow = (from, to) => {
  const totalMateriaToSwap = Math.min(from.materiaCount, to.materiaCount)
  console.log('materia exchangeConfirmSelect swapEquipmentRow totalMateriaToSwap', totalMateriaToSwap)
  for (let i = 1; i <= totalMateriaToSwap; i++) {
    console.log('materia exchangeConfirmSelect swapEquipmentRow', i)
    from.char.materia[`${from.equipType}Materia${i}`] = to.materias[i - 1]
    to.char.materia[`${to.equipType}Materia${i}`] = from.materias[i - 1]
  }

  drawExchangeChars()
  recalculateAndApplyHPMP(from.char)
  recalculateAndApplyHPMP(to.char)
  if (from.char.id === DATA.char.id || to.char.id === DATA.char.id) {
    setDataFromPartyMember()
    drawHeader()
  }

  drawExchangeMateriaDetailsAndInfo()
  movePointer(POINTERS.pointer2, 0, 0, true)
  DATA.exchange.selected = {type: 'none', page: 0, pos: 0}
  setMenuState('materia-exchange-select')
}
const swapSingleMateria = (from, to) => {
  if (from.type === 'chars') {
    from.char.materia[from.slotName] = to.materia
  } else {
    window.data.savemap.materias[from.index] = to.materia
  }
  if (to.type === 'chars') {
    to.char.materia[to.slotName] = from.materia
  } else {
    window.data.savemap.materias[to.index] = from.materia
  }
  if (from.type === 'chars' || to.type === 'chars') {
    drawExchangeChars()
  }
  if (from.type === 'list' || to.type === 'list') {
    drawExchangeMateriaList()
  }

  if (from.char || to.char) {
    if (from.char) {
      recalculateAndApplyHPMP(from.char) // Can reduce these calls a bit
    }
    if (to.char) {
      recalculateAndApplyHPMP(to.char)
    }
    if ((from.char && from.char.id === DATA.char.id) || (to.char && to.char.id === DATA.char.id)) {
      setDataFromPartyMember()
      drawHeader()
    }
  }

  drawExchangeMateriaDetailsAndInfo()
  movePointer(POINTERS.pointer2, 0, 0, true)
  DATA.exchange.selected = {type: 'none', page: 0, pos: 0}
  setMenuState('materia-exchange-select')
}
const addIndexInformationToSwapMateria = (from) => {
  from.isEquipment = from.type === 'chars' && from.pos % 9 === 0
  if (from.type === 'chars') {
    from.char = window.data.savemap.characters[DATA.exchange.activeCharacters[from.page + Math.trunc(from.pos / 18)]]
    const equipType = from.pos % 18 < 9 ? 'weapon' : 'armor'
    const slotNumber = from.pos % 18 % 9
    if (slotNumber > 0) {
      from.slotName = `${equipType}Materia${slotNumber}`
      from.invalidSlot = window.data.kernel.allItemData[from.char.equip[equipType].itemId].materiaSlots[slotNumber - 1] === 'None'
      from.materia = JSON.parse(JSON.stringify(from.char.materia[from.slotName]))
    } else {
      from.equipType = equipType
      from.materiaCount = window.data.kernel.allItemData[from.char.equip[equipType].itemId].materiaSlots.filter(s => s !== 'None').length
      from.materias = []
      for (let i = 1; i <= from.materiaCount; i++) {
        from.materias.push(JSON.parse(JSON.stringify(from.char.materia[`${equipType}Materia${i}`])))
      }
    }
  } else { // list
    from.index = from.page + from.pos
    from.materia = JSON.parse(JSON.stringify(window.data.savemap.materias[from.index]))
  }
}

const showExchangeMenu = () => {
  exchangeMateriaDetailsDialog.visible = true
  exchangeInfoDialog.visible = true
  exchangeCharDialog.visible = true
  exchangeMateriaListDialog.visible = true

  headerDialog.visible = false
  checkDialog.visible = false
  smallMateriaListDialog.visible = false
  materiaDetailsDialog.visible = false
  infoDialog.visible = false
  arrangeDialog.visible = false
  // trashDialog.visible = false
  // DATA.exchange.type = 'chars'
  // DATA.exchange.chars.page = 0
  // DATA.exchange.chars.pos = 1
  // DATA.exchange.list.page = 0
  // DATA.exchange.list.pos = 0
  DATA.exchange.selected.type = 'none'

  drawExchangeChars()
  drawExchangeMateriaList()
  drawExchangePointers()
  drawExchangeMateriaDetailsAndInfo()
  setMenuState('materia-exchange-select')
}
const hideExchangeMenu = () => {
  exchangeMateriaDetailsDialog.visible = false
  exchangeInfoDialog.visible = false
  exchangeCharDialog.visible = false
  exchangeMateriaListDialog.visible = false

  headerDialog.visible = true
  checkDialog.visible = true
  smallMateriaListDialog.visible = true
  materiaDetailsDialog.visible = true
  infoDialog.visible = true
  arrangeDialog.visible = true
  // trashDialog.visible = false
  // TODO - get pointers and menus in right position etc
  setMenuState('materia-arrange-menu')
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
const drawMainNavPointer = () => {
  const x = 164.5 - 10
  const y = 32 + 7
  const xAdj = 14
  const yAdj = 26.5
  const xAdjAction = DATA.mainNavPos % 9 === 0 ? -24.5 : 0
  movePointer(POINTERS.pointer1,
    x + ((DATA.mainNavPos % 9) * xAdj) + xAdjAction,
    y + (Math.trunc(DATA.mainNavPos / 9) * yAdj)
  )
  movePointer(POINTERS.pointer2, 0, 0, true)

  removeGroupChildren(checkGroup)
  removeGroupChildren(infoGroup)
  removeGroupChildren(materiaDetailsGroup)
  // removeGroupChildren(smallMateriaListGroup)
  // removeGroupChildren(smallMateriaListContentsGroup)

  if (DATA.mainNavPos === 0) {
    smallMateriaListGroup.visible = false
    smallMateriaListContentsGroup.visible = false
    drawCheck()
  } else if (DATA.mainNavPos === 9) {
    smallMateriaListGroup.visible = true
    smallMateriaListContentsGroup.visible = true
    drawSmallMateriaList()
  } else {
    smallMateriaListGroup.visible = false
    smallMateriaListContentsGroup.visible = false
    drawMateriaDetails()
  }
}
const drawCheck = () => {
  console.log('materia drawCheck', DATA)
  materiaDetailsDialog.visible = false
  materiaDetailsEnemySkillGroup.visible = false
  smallMateriaListDialog.visible = false
  smallMateriaListGroup.visible = false
  smallMateriaListContentsGroup.visible = false

  addMenuCommandsToDialog(checkGroup, 23.5, 107, DATA.battleStats.menu.command)
}
const drawCheckSelect = () => {
  // DATA.check = { main: 0, sub: 0 }
  DATA.check.main = 0

  // Update info
  drawInfo(window.data.kernel.commandData[DATA.battleStats.menu.command[DATA.check.main].id].description)

  // Show main pointer
  drawCheckMainPointer()

  setMenuState('materia-check')
}
const drawCheckMainPointer = () => {
  const x = 27 - 10
  const y = 116.5 + 7
  const xAdj = 43 // TODO - This is not a set value for each col
  const yAdj = 13

  movePointer(POINTERS.pointer1, POINTERS.pointer1.position.x, 240 - POINTERS.pointer1.position.y, false, true)
  movePointer(POINTERS.pointer2,
    x + (Math.trunc(DATA.check.main / 4) * xAdj),
    y + ((DATA.check.main % 4) * yAdj)
  )
}
const cancelCheck = () => {
  console.log('materia cancelCheck')
  drawMainNavPointer()
  drawInfo('')
  setMenuState('materia-main')
}
const checkSelectCommand = () => {
  DATA.check.sub.page = 0
  DATA.check.sub.pos = 0
  const command = DATA.battleStats.menu.command[DATA.check.main]
  console.log('materia checkSelectCommand', command)
  if (command.type && command.type === 2) {
    DATA.check.sub.type = 'magic'
    DATA.check.sub.spells = DATA.battleStats.menu.magic
  } else if (command.type && command.type === 3) {
    DATA.check.sub.type = 'summon'
    DATA.check.sub.spells = DATA.battleStats.menu.summon
  } else if (command.id === 13) {
    DATA.check.sub.type = 'enemySkills'
    DATA.check.sub.spells = DATA.battleStats.menu.enemySkills
  } else {
    return // No sub navigation
  }
  drawCheckSubDialogs()
  drawCheckSubCommand()
  drawCheckSubPointer()
  drawCheckSubCastingInfo()
  setMenuState('materia-check-sub')
}
const checkNavigation = (vertical, delta) => {
  console.log('materia checkNavigation', DATA, vertical, delta)
  do {
    if (vertical) {
    // vertical movement

    // group commands into groups of 4
    // select group which the DATA.check.main is in
      const startPos = Math.trunc(DATA.check.main / 4) * 4
      const commandSubset = DATA.battleStats.menu.command.slice(startPos, startPos + 4)
      let offset = DATA.check.main % 4 + delta
      if (offset < 0) {
        offset = commandSubset.length - 1
      } else if (offset >= commandSubset.length) {
        offset = 0
      }
      DATA.check.main = startPos + offset
      console.log('materia checkNavigation vertical', DATA.check.main)
    // +1 / -1 and wrap around if needed
    } else {
    // horizontal movement

    // group every 4th command
    // select group which the DATA.check.main is in
      const startPos = DATA.check.main % 4
      const commandSubset = DATA.battleStats.menu.command.filter((c, i) => i % 4 === DATA.check.main % 4)
      let offset = (Math.trunc(DATA.check.main / 4)) + delta
      if (offset < 0) {
        offset = commandSubset.length - 1
      } else if (offset >= commandSubset.length) {
        offset = 0
      }
      DATA.check.main = (startPos * 1) + (offset * 4)
      // +1 / -1 and wrap around if needed
      console.log('materia checkNavigation horizontal', DATA.check.main)
    }
  } while (DATA.battleStats.menu.command[DATA.check.main].id === 255)

  drawInfo(window.data.kernel.commandData[DATA.battleStats.menu.command[DATA.check.main].id].description)
  drawCheckMainPointer()
}
const getCheckSubSpellPositions = () => {
  const cols = DATA.check.sub.config[DATA.check.sub.type].cols
  if (cols === 3) {
    return { x: 41 - 8,
      y: 188 - 4,
      xAdj: 65,
      yAdj: 17
    }
  } else if (cols === 2) {
    return { x: 55 - 8, // TODO - Get the right offsets
      y: 188 - 4,
      xAdj: 90, // - Get the right offsets
      yAdj: 17
    }
  } else {
    return { x: 70 - 8, // - Get the right offsets
      y: 188 - 4,
      xAdj: 65, // - Get the right offsets
      yAdj: 17
    }
  }
}
const drawCheckSubDialogs = () => {
  console.log('materia drawCheckSubDialogs')
  removeGroupChildren(checkSubGroup)
  const subDialog = createDialogBox({
    id: 23,
    name: 'subDialog',
    w: 209,
    h: 60,
    x: 23.5,
    y: 171.5,
    expandInstantly: true,
    noClipping: false,
    group: checkSubGroup
  })
  subDialog.visible = true
  checkSubGroup.userData.subDialog = subDialog

  const subContents = addGroupToDialog(subDialog, 33)
  subContents.userData.bg = subDialog.userData.bg
  subContents.position.y = 0
  checkSubGroup.userData.subContents = subContents

  const subCastingDialog = createDialogBox({
    id: 23,
    name: 'subCastingDialog',
    w: 57.5,
    h: 60,
    x: 232.5,
    y: 171.5,
    expandInstantly: true,
    noClipping: true,
    group: checkSubGroup
  })
  subCastingDialog.visible = true

  const subCasting = addGroupToDialog(subCastingDialog, 33)
  checkSubGroup.userData.subCasting = subCasting

  // Default parts
  addImageToDialog(
    subCastingDialog,
    'labels',
    'mp-needed',
    'materia-check-sub-mp-needed-image',
    265,
    181.5,
    0.5
  )
  addTextToDialog(
    subCastingDialog,
    `   /`,
    `materia-check-sub-mp-cost`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    241.5 - 8,
    199 - 4,
    0.5
  )
  // Also, in this menu, when using HP<->MP, the game caps the current mp to 999 for display purposes
  addTextToDialog(
    subCastingDialog,
    ('' + (DATA.battleStats.mp.current > 999 ? 999 : DATA.battleStats.mp.current)).padStart(3, ' '),
    `materia-check-sub-mp-current`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    264.5 - 8,
    199 - 4,
    0.5
  )
}
const drawCheckSubCommand = () => {
  console.log('materia drawCheckSubCommand')

  const cols = DATA.check.sub.config[DATA.check.sub.type].cols
  createItemListNavigation(checkSubGroup.userData.subDialog, 225.5, 174.5 - 136, 54, DATA.check.sub.spells.length / cols, 3)
  checkSubGroup.userData.subDialog.userData.slider.userData.moveToPage(DATA.check.sub.page)
  const {x, y, xAdj, yAdj} = getCheckSubSpellPositions()

  for (let i = 0; i < DATA.check.sub.spells.length; i++) {
    const spell = DATA.check.sub.spells[i]
    if (spell.enabled) {
      // console.log('materia check magic add', magic)
      addTextToDialog(
        checkSubGroup.userData.subContents,
        spell.name,
        `materia-check-magic-${i}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        x + ((i % cols) * xAdj),
        y + (Math.trunc(i / cols) * yAdj),
        0.5
      )
      const isAll = spell.addedAbilities.filter(a => a.type === 'All').length > 0
      if (isAll) {
        addImageToDialog(
          checkSubGroup.userData.subContents,
          'pointers',
          'arrow-right',
          `materia-check-magic-${i}-all`,
          x + ((i % cols) * xAdj) + 56,
          y + (Math.trunc(i / cols) * yAdj),
          0.5
        )
      }
    }
  }
}
const drawCheckSubPointer = () => {
  const cols = DATA.check.sub.config[DATA.check.sub.type].cols
  // if (DATA.check.sub.type === 'magic') {
  const {x, y, xAdj, yAdj} = getCheckSubSpellPositions()
  movePointer(POINTERS.pointer2,
    x + ((DATA.check.sub.pos % cols) * xAdj) - 2,
    y + (Math.trunc(DATA.check.sub.pos / cols) * yAdj) + 4
  )
  // } else if (DATA.check.sub.type === 'summon') {
  // } else if (DATA.check.sub.type === 'enemySkills') {
  // }
}
const drawCheckSubCastingInfo = () => {
  const cols = DATA.check.sub.config[DATA.check.sub.type].cols
  const spell = DATA.check.sub.spells[(DATA.check.sub.page * cols) + DATA.check.sub.pos]
  console.log('materia drawCheckSubCastingInfo', DATA, spell)
  // const checkMagicCastingGroup = checkSubGroup.userData.subCasting
  removeGroupChildren(checkSubGroup.userData.subCasting)

  if (spell.enabled) {
    const attackData = window.data.kernel.attackData[spell.index]
    drawInfo(attackData.description)

    let mpCost = attackData.mp // Add turbo mp if required
    if (isMPTurboActive(spell)) {
      mpCost = applyMPTurbo(mpCost, spell)
    }

    addTextToDialog(
      checkSubGroup.userData.subCasting,
      ('' + mpCost).padStart(3, ' '),
      `materia-check-sub-mp-cost`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      241.5 - 8,
      199 - 4,
      0.5
    )

    const displayedAbilities = [
      ['QuadraMagic', '4x:'],
      ['All', 'All:']
    ]
    const x = 238.5
    const y = 211.5
    for (let i = 0; i < displayedAbilities.length; i++) {
      const displayedAbility = displayedAbilities[i]
      if (spell.addedAbilities.filter(a => a.type === displayedAbility[0]).length) {
        const ability = spell.addedAbilities.filter(a => a.type === displayedAbility[0])[0]
        addTextToDialog(
          checkSubGroup.userData.subCasting,
          displayedAbility[1],
          `materia-check-sub-ability-${displayedAbility[0]}-label`,
          LETTER_TYPES.MenuBaseFont,
          LETTER_COLORS.White,
          x - 8,
          y + (i * 12) - 4,
          0.5
        )
        addTextToDialog(
          checkSubGroup.userData.subCasting,
          ('' + ability.count).padStart(3, ' '),
          `materia-check-sub-ability-${displayedAbility[0]}-times`,
          LETTER_TYPES.MenuTextStats,
          LETTER_COLORS.White,
          x + 6,
          y + (i * 12) - 4,
          0.5
        )
        addImageToDialog(
          checkSubGroup.userData.subCasting,
          'labels',
          'times',
          `materia-check-sub-ability-${displayedAbility[0]}-times-label`,
          x + 36.5,
          y + (i * 12) - 4,
          0.5
        )
      }
    }

    if (spell.hasOwnProperty('uses')) {
      if (spell.uses === 0xFF) {
        addImageToDialog(
          checkSubGroup.userData.subCasting,
          'labels',
          'infinity',
          `materia-check-sub-ability-uses-times-label`,
          x + 36.5 - 10, // TODO - Positioning
          y + (1 * 12) - 4,
          0.5
        )
      } else {
        addTextToDialog(
          checkSubGroup.userData.subCasting,
          ('' + spell.uses).padStart(3, ' '),
          `materia-check-sub-ability-uses-times`,
          LETTER_TYPES.MenuTextStats,
          LETTER_COLORS.White,
          x + 6, // TODO - Positioning
          y + (1 * 12) - 4,
          0.5
        )
      }

      addImageToDialog(
        checkSubGroup.userData.subCasting,
        'labels',
        'times',
        `materia-check-sub-ability-uses-times-label`,
        x + 36.5, // TODO - Positioning
        y + (1 * 12) - 4,
        0.5
      )
    }
  } else {
    drawInfo('')
  }
}
const tweenCheckSubList = (up, state, cb) => {
  setMenuState('materia-tweening-list')
  const subContents = checkSubGroup.userData.subContents
  for (let i = 0; i < DATA.page + 1; i++) {
    subContents.children[i].visible = true
  }
  let from = {y: subContents.position.y}
  let to = {y: up ? subContents.position.y + 17 : subContents.position.y - 17}
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      subContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < DATA.page; i++) {
        subContents.children[i].visible = false
      }
      setMenuState(state)
      cb()
    })
    .start()
}
const checkSubNavigation = (vertical, delta) => {
  // console.log('materia checkSubNavigation', delta)

  const cols = DATA.check.sub.config[DATA.check.sub.type].cols
  if (vertical) {
    delta = cols * delta
  }
  if (!vertical && DATA.check.sub.type === 'summon') {
    return
  }

  const submenu = DATA.check.sub
  const maxPage = (DATA.check.sub.spells.length / cols) - 3
  const maxPos = cols * 3
  const potential = submenu.pos + delta

  console.log('materia checkSubNavigation', delta, '-', submenu.page, submenu.pos, '->', potential, ':', maxPage, maxPos)

  if (potential < 0) {
    if (submenu.page === 0) {
      console.log('materia checkSubNavigation on first page - do nothing')
    } else {
      console.log('materia checkSubNavigation not on first page - PAGE DOWN')
      if (delta === -1 && DATA.check.sub.type !== 'summon') {
        submenu.pos = submenu.pos + (cols - 1) // 3 magic per row
        drawCheckSubPointer()
      }
      submenu.page--
      tweenCheckSubList(false, 'materia-check-sub', drawCheckSubCastingInfo)
      checkSubGroup.userData.subDialog.userData.slider.userData.moveToPage(submenu.page)
    }
  } else if (potential >= maxPos) {
    console.log('materia checkSubNavigation page - is last page??', submenu.page, maxPos, maxPage)
    if (submenu.page >= maxPage) {
      console.log('materia checkSubNavigation on last page - do nothing')
    } else {
      console.log('materia checkSubNavigation not on last page - PAGE UP', delta, delta === 1, submenu.pos)
      if (delta === 1 && DATA.check.sub.type !== 'summon') {
        submenu.pos = submenu.pos - (cols - 1)
        drawCheckSubPointer()
      }
      submenu.page++
      tweenCheckSubList(true, 'materia-check-sub', drawCheckSubCastingInfo)
      checkSubGroup.userData.subDialog.userData.slider.userData.moveToPage(submenu.page)
    }
  } else {
    console.log('materia checkSubNavigation move pointer only', submenu.page, submenu.pos, potential)
    submenu.pos = potential
    drawCheckSubCastingInfo()
    drawCheckSubPointer()
  }
}
const checkSubPageNavigation = (up) => {
  const submenu = DATA.check.sub
  const cols = DATA.check.sub.config[DATA.check.sub.type].cols
  const lastPage = (DATA.check.sub.spells.length / cols) - 3
  if (up) {
    submenu.page = submenu.page + 3
    if (submenu.page > lastPage) {
      submenu.page = lastPage
    }
  } else {
    submenu.page = submenu.page - 3
    if (submenu.page < 0) {
      submenu.page = 0
    }
  }
  // Update list group positions
  checkSubGroup.userData.subDialog.userData.slider.userData.moveToPage(submenu.page)
  checkSubGroup.userData.subContents.position.y = submenu.page * 17
  drawCheckSubCastingInfo()
}

const cancelSubCheck = () => {
  console.log('materia cancelSubCheck')
  removeGroupChildren(checkSubGroup)
  drawInfo(window.data.kernel.commandData[DATA.battleStats.menu.command[DATA.check.main].id].description)
  drawCheckMainPointer()
  setMenuState('materia-check')
}
const getExchangeCharPositions = () => {
  return {
    x: 31,
    y: 51,
    yAdj: 47.25
  }
}
const getExchangeMateriaListPositions = () => {
  return {
    x: 213.5 - 8,
    y: 67 - 4,
    yAdj: 18,
    lines: 10
  }
}
const getSmallMateriaListPositions = () => {
  return {
    x: 213.5 - 8,
    y: 115 - 4,
    yAdj: 13,
    lines: 10
  }
}
const drawSmallMateriaListSlider = () => {
  createItemListNavigation(smallMateriaListGroup, 313, 104 - 32.25, 138.5, window.data.savemap.materias.length, 10)
}
const drawMateriaListOneItem = (group, i, page, x, y, yAdj) => {
  const materia = window.data.savemap.materias[i + page]
  console.log('shop drawMateriaListOneItem', group, i, page, x, y, yAdj, materia)
  if (materia.id < 255) {
    const textGroup = addTextToDialog(
      group,
      materia.name,
      `materia-small-list-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x,
      y + (i * yAdj),
      0.5
    )
    const materiaData = window.data.kernel.materiaData[materia.id]
    const materiaIcon = addImageToDialog(group,
      'materia',
      materiaData.type,
      `materia-small-list-${i}-type`,
      x + 2,
      y + (i * yAdj) - 0.5,
      0.5
    )

    for (let j = 0; j < textGroup.children.length; j++) {
      const textLetters = textGroup.children[j]
      textLetters.material.clippingPlanes = group.parent.userData.bg.material.clippingPlanes // TODO - make sure this works
    }
    materiaIcon.material.clippingPlanes = group.parent.userData.bg.material.clippingPlanes
  }
}
const drawSmallMateriaList = () => {
  console.log('materia drawSmallMateriaList', DATA.smallMateriaList.page, DATA.smallMateriaList.pos, DATA.smallMateriaList.page + DATA.smallMateriaList.pos)
  materiaDetailsDialog.visible = true
  materiaDetailsEnemySkillGroup.visible = false
  smallMateriaListDialog.visible = true
  smallMateriaListGroup.visible = true
  smallMateriaListContentsGroup.visible = true

  removeGroupChildren(smallMateriaListContentsGroup)
  const { x, y, yAdj } = getSmallMateriaListPositions()
  // const menu = DATA.menus[DATA.menuCurrent]
  for (let i = 0; i < 10; i++) {
    drawMateriaListOneItem(smallMateriaListContentsGroup, i, DATA.smallMateriaList.page, x, y, yAdj)
  }
  smallMateriaListGroup.userData.slider.userData.moveToPage(DATA.smallMateriaList.page)
  smallMateriaListContentsGroup.position.y = 0
}
const drawEnemySkillsGroup = () => {
  const skills = getEnemySkillFlagsWithSkills(0)

  const enemySkillTextList = createDialogBox({
    id: 22,
    name: 'enemySkillTextList',
    w: 150,
    h: 80.5,
    x: 20,
    y: 152,
    expandInstantly: true,
    noClipping: false,
    group: materiaDetailsEnemySkillGroup
  })
  for (let i = 0; i < enemySkillTextList.children.length; i++) {
    enemySkillTextList.children[i].visible = false
  }
  enemySkillTextList.visible = true
  materialsDetailsEnemySkillTextContents = addGroupToDialog(enemySkillTextList, 32)
  materialsDetailsEnemySkillTextContents.userData.bg = enemySkillTextList.userData.bg

  addShapeToDialog(
    materiaDetailsEnemySkillGroup,
    WINDOW_COLORS_SUMMARY.ITEM_LIST_SLIDER_BG,
    'material-details-enemy-skills-bg',
    95,
    192.25,
    150,
    80.5
  )

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i]
    // Stars
    const starX = 20 + 6
    const starY = 136 - 6.5
    const starXAdj = 12.5
    const starYAdj = 14.5

    const imgActive = addImageToDialog(
      materiaDetailsEnemySkillGroup,
      'materia',
      `Command-star-active-small`,
      `material-enemy-skill-${skill.index}-active`,
      starX + ((i % 12) * starXAdj),
      starY + (Math.trunc(i / 12) * starYAdj),
      0.5
    )
    imgActive.userData.enemySkills = `${skill.index}-active`

    const imgInactive = addImageToDialog(
      materiaDetailsEnemySkillGroup,
      'materia',
      `Command-star-inactive-small`,
      `material-enemy-skill-${skill.index}-inactive`,
      starX + ((i % 12) * starXAdj),
      starY + (Math.trunc(i / 12) * starYAdj),
      0.5
    )
    imgInactive.userData.enemySkills = `${skill.index}-inactive`

    // Text
    const textX = 24 - 8
    const textY = 163 - 4

    const textXAdj = 77.5
    const textYAdj = 13
    const text2ndGroup = textYAdj * 12

    const textActive1 = addTextToDialog(
      materialsDetailsEnemySkillTextContents,
      skill.name,
      `materia-details-name`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      textX + ((i % 2) * textXAdj),
      textY + (Math.trunc(i / 2) * textYAdj),
      0.5
    )
    textActive1.userData.enemySkills = `${skill.index}-active`

    const textInactive1 = addTextToDialog(
      materialsDetailsEnemySkillTextContents,
      skill.name,
      `materia-details-name`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Gray,
      textX + ((i % 2) * textXAdj),
      textY + (Math.trunc(i / 2) * textYAdj),
      0.5
    )
    textInactive1.userData.enemySkills = `${skill.index}-inactive`

    const textActive2 = addTextToDialog(
      materialsDetailsEnemySkillTextContents,
      skill.name,
      `materia-details-name`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      textX + ((i % 2) * textXAdj),
      text2ndGroup + textY + (Math.trunc(i / 2) * textYAdj),
      0.5
    )
    textActive2.userData.enemySkills = `${skill.index}-active`

    const textInactive2 = addTextToDialog(
      materialsDetailsEnemySkillTextContents,
      skill.name,
      `materia-textActive2details-name`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Gray,
      textX + ((i % 2) * textXAdj),
      text2ndGroup + textY + (Math.trunc(i / 2) * textYAdj),
      0.5
    )
    textInactive2.userData.enemySkills = `${skill.index}-inactive`
  }
  // Hack, I really need to look at the z index issues for fadeoverlay
  for (let i = 0; i < materialsDetailsEnemySkillTextContents.children.length; i++) {
    const words = materialsDetailsEnemySkillTextContents.children[i]
    for (let j = 0; j < words.children.length; j++) {
      const letter = words.children[j]
      letter.position.z = 39
    }
  }

  window.enemySkillTextList = enemySkillTextList
  window.materialsDetailsEnemySkillTextContents = materialsDetailsEnemySkillTextContents
  window.materiaDetailsEnemySkillGroup = materiaDetailsEnemySkillGroup
  window.materiaDetailsDialog = materiaDetailsDialog

  tweenEnemySkills()
}
const tweenEnemySkills = async () => {
  if (DATA.tweenEnemySkills === false) {
    const from = { y: 0 }
    const to = { y: 13 * 12 }
    DATA.tweenEnemySkills = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
      .to(to, 5000)
      .repeat(Infinity)
      .onUpdate(function () {
        materialsDetailsEnemySkillTextContents.position.y = from.y
      })
      .onComplete(function () {
        console.log('materia - Tween enemy skills: START')
      })
      .start()
  } else {
    DATA.tweenEnemySkills.start()
  }
}
const drawMateriaDetails = () => { // TODO - This is generally quite an expensive operation
  materiaDetailsDialog.visible = true
  smallMateriaListDialog.visible = true
  let materia
  if (DATA.smallMateriaList.active) {
    materia = window.data.savemap.materias[DATA.smallMateriaList.page + DATA.smallMateriaList.pos]
  } else if (DATA.mainNavPos < 9) {
    materia = DATA.char.materia[`weaponMateria${DATA.mainNavPos}`]
  } else {
    materia = DATA.char.materia[`armorMateria${DATA.mainNavPos % 9}`]
  }

  drawMateriaDetailsWithGroup(materiaDetailsGroup, materia, materiaDetailsEnemySkillGroup, materialsDetailsEnemySkillTextContents)

  if (materia.id !== 255) {
    const materiaData = window.data.kernel.materiaData[materia.id]
    drawInfo(materiaData.description)
  } else {
    drawInfo('')
  }
}
const drawMateriaDetailsWithGroup = (group, materia, enemySkillGroup, enemySkillTextContents) => { // TODO - This is generally quite an expensive operation
  console.log('materia drawMateriaDetails')

  removeGroupChildren(group)

  if (materia.id === 255) {
    enemySkillGroup.visible = false
    return
  }

  const materiaData = window.data.kernel.materiaData[materia.id]
  console.log('materia drawMateriaDetails', materia, materiaData)

  // Name, type, description
  addTextToDialog(
    group,
    materiaData.name,
    `materia-details-name`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    20 - 8,
    117 - 4,
    0.5
  )
  addImageToDialog(group,
    'materia',
    materiaData.type,
    `materia-details-type`,
    20 - 8 + 0.5,
    117 - 4 - 0.5,
    0.5
  )

  // Appears to be 3 types
  // 1 - Masters - with nothing else, I think I should better flag these masters in kujata
  // 2 - enemy skill, lots to do here
  // 3 - All others with everything
  if (materiaData.attributes.master) {
    console.log('materia MASTER materia, no more details required')
    enemySkillGroup.visible = false
  } else if (materiaData.attributes.skill && materiaData.attributes.skill === 'EnemySkill') {
    enemySkillGroup.visible = true
    const skills = getEnemySkillFlagsWithSkills(materia.ap).map(s => s.enabled ? `${s.index}-active` : `${s.index}-inactive`)
    console.log('materia ENEMY SKILL materia, need to implement', skills)

    const groups = [enemySkillGroup, enemySkillTextContents]

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      for (let j = 0; j < group.children.length; j++) {
        const item = group.children[j]
        if (item.userData.enemySkills) {
          console.log('materia enemySkills item', item.userData.enemySkills, skills.includes(item.userData.enemySkills))
          if (skills.includes(item.userData.enemySkills)) {
            item.visible = true
          } else {
            item.visible = false
          }
        }
      }
    }
  } else {
    console.log('materia standard materia display')
    enemySkillGroup.visible = false

    // Labels
    addTextToDialog(
      group,
      'AP',
      `materia-details-ap-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      103.5 - 8,
      132 - 4,
      0.5
    )
    addTextToDialog(
      group,
      'To next level',
      `materia-details-next-level-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      54 - 8,
      145 - 4,
      0.5
    )
    addTextToDialog(
      group,
      'Ability List',
      `materia-details-next-ability-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      4 - 8,
      160 - 4,
      0.5
    )
    addTextToDialog(
      group,
      'Equip effects',
      `materia-details-next-effects-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      93.5 - 8,
      160 - 4,
      0.5
    )

    // Level stars
    const currentLevel = currentMateriaLevel(materiaData, materia.ap)
    const starX = 103.5 + 6
    const starY = 119 - 6.5
    const starXAdj = 12.5

    for (let i = 0; i < materiaData.apLevels.length; i++) {
      addImageToDialog(
        group,
        'materia',
        i < currentLevel ? `${materiaData.type}-star-active-small` : `${materiaData.type}-star-inactive-small`,
        `material-details-level-${i}`,
        starX + (starXAdj * i),
        starY,
        0.5
      )
    }

    // AP & next level
    if (materia.ap >= materiaData.apLevels[materiaData.apLevels.length - 1]) {
      // Mastered
      addTextToDialog(
        group,
        'MASTER',
        `materia-ap-master`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        125 - 8,
        132 - 4,
        0.5
      )
      addTextToDialog(
        group,
        ('0').padStart(8, ' '),
        `materia-ap-master`,
        LETTER_TYPES.MenuTextStats,
        LETTER_COLORS.White,
        120.5 - 8,
        145 - 4,
        0.5
      )
    } else {
      // Still to develop
      addTextToDialog(
        group,
        ('' + materia.ap).padStart(8, ' '),
        `materia-ap-master`,
        LETTER_TYPES.MenuTextStats,
        LETTER_COLORS.White,
        120.5 - 8,
        132 - 4,
        0.5
      )
      addTextToDialog(
        group,
        ('' + (materiaData.apLevels[currentLevel] - materia.ap)).padStart(8, ' '),
        `materia-ap-master`,
        LETTER_TYPES.MenuTextStats,
        LETTER_COLORS.White,
        120.5 - 8,
        145 - 4,
        0.5
      )
    }

    // Ability list
    if (materiaData.type === 'Magic') {
      for (let i = 0; i < materiaData.attributes.magic.length; i++) {
        const ability = materiaData.attributes.magic[i]
        // color based on it being enabled
        let color = LETTER_COLORS.Gray
        if (ability.level <= currentLevel) {
          color = LETTER_COLORS.White
        }
        console.log('materia level', ability.level, currentLevel, ability)
        addTextToDialog(
          group,
          ability.name,
          `materia-details-ability-${i}`,
          LETTER_TYPES.MenuBaseFont,
          color,
          20 - 8,
          173 + (i * 12) - 4,
          0.5
        )
      }
    } else if (materiaData.type === 'Summon') {
      addTextToDialog(
        group,
        materiaData.attributes.summon[0].name,
        `materia-details-ability`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        20 - 8,
        173 - 4,
        0.5
      )
    } else if (materiaData.type === 'Support') {
      addTextToDialog(
        group,
        materiaData.name,
        `materia-details-ability`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        20 - 8,
        173 - 4,
        0.5
      )
    } else if (materiaData.type === 'Command') {
      const abilities = []

      let attributeSelector = materiaData.attributes.menu // Add is default, change to Replace if needed
      if (materiaData.attributes.type === 'Replace') {
        attributeSelector = materiaData.attributes.with
      }
      for (let i = 0; i < attributeSelector.length; i++) {
        const ability = attributeSelector[i]
        if (i + 1 <= currentLevel) {
          abilities.push({name: ability.name, active: true})
        } else {
          abilities.push({name: ability.name, active: false})
        }
      }
      // Only allow the last active (learned) ability to show. eg, Mug not Steal
      let lastActiveFound = false
      for (var i = abilities.length - 1; i >= 0; i--) {
        const ability = abilities[i]
        if (ability.active && !lastActiveFound) {
          lastActiveFound = true
        } else if (ability.active && lastActiveFound) {
          ability.active = false
        }
      }

      for (let i = 0; i < abilities.length; i++) {
        const ability = abilities[i]
        addTextToDialog(
          group,
          ability.name,
          `materia-details-ability-${i}`,
          LETTER_TYPES.MenuBaseFont,
          ability.active ? LETTER_COLORS.White : LETTER_COLORS.Gray,
          20 - 8,
          173 + (i * 12) - 4,
          0.5
        )
      }
    } else if (materiaData.type === 'Independent') {
      addTextToDialog(
        group,
        materiaAbilityText(materiaData.name),
        `materia-details-ability`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        20 - 8,
        173 - 4,
        0.5
      )

      const xPos = 69.5
      if (['Cover'].includes(materiaData.attributes.type) || ['Luck', 'Magic', 'Dexterity', 'HP', 'MP'].includes(materiaData.attributes.stat)) {
        // positive currentlevel-attributes.attributes as % in ability
        const value = materiaData.attributes.attributes[currentLevel - 1]
        console.log('materia %value', value)
        addTextToDialog(
          group,
          '+',
          `materia-details-effect-${i}-sign`,
          LETTER_TYPES.MenuTextFixed,
          LETTER_COLORS.White,
          xPos - 9 - (value === 100 ? 5.5 : 0),
          173 - 4,
          0.5
        )
        // value
        addTextToDialog(
          group,
          ('' + value).padStart(2, '0'),
          `materia-details-effect-${i}-value`,
          LETTER_TYPES.MenuTextStats,
          LETTER_COLORS.Yellow,
          xPos + 5.5 - 8 - (value === 100 ? 6 : 0),
          173 - 4,
          0.5
        )
        // perc
        addTextToDialog(
          group,
          '%',
          `materia-details-effect-${i}-label`,
          LETTER_TYPES.MenuTextFixed,
          LETTER_COLORS.White,
          xPos + 18.5 - 9,
          173 - 4,
          0.5
        )
      }
    }

    // Equip effects
    for (let i = 0; i < materiaData.equipEffect.length; i++) {
      const effect = materiaData.equipEffect[i]
      // stat name
      addTextToDialog(
        group,
        statDisplayText(effect[0]),
        `materia-details-effect-${i}-label`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        100 - 8,
        173 + (i * 12) - 4,
        0.5
      )

      // + / -
      addTextToDialog(
        group,
        effect[1] < 0 ? '-' : '+',
        `materia-details-effect-${i}-sign`,
        LETTER_TYPES.MenuTextFixed,
        LETTER_COLORS.White,
        151 - 9,
        173 + (i * 12) - 4,
        0.5
      )
      // value
      addTextToDialog(
        group,
        ('' + Math.abs(effect[1])).padStart(2, '0'),
        `materia-details-effect-${i}-value`,
        LETTER_TYPES.MenuTextStats,
        effect[1] < 0 ? LETTER_COLORS.Red : LETTER_COLORS.Yellow,
        156.5 - 8,
        173 + (i * 12) - 4,
        0.5
      )
      // perc
      if (effect[0] === 'HP' || effect[0] === 'MP') {
        addTextToDialog(
          group,
          '%',
          `materia-details-effect-${i}-label`,
          LETTER_TYPES.MenuTextFixed,
          LETTER_COLORS.White,
          169.5 - 9,
          173 + (i * 12) - 4,
          0.5
        )
      }
    }
  }
}
const materiaAbilityText = (materiaName) => { // I'm not sure where these actual data strings are located, just do this for now
  switch (materiaName) {
    case 'Counter Attack': return 'Counter attack'
    case 'Mega All': return 'Attack all'
    case 'Long Range': return 'Long range attack'
    case 'Pre-Emptive': return 'Pre-emptive'
    case 'Chocobo Lure': return 'Meet Chocobos'
    case 'Enemy Lure': return 'Encount Up'
    case 'Enemy Away': return 'Encount Down'
    case 'Gil Plus': return 'Gil UP'
    case 'EXP Plus': return 'EXP. UP'
    case 'Luck Plus': return 'Luck'
    case 'Magic Plus': return 'Magic'
    case 'Speed Plus': return 'Dexterity'
    case 'HP Plus': return 'MaxHPUP'
    case 'MP Plus': return 'MaxMPUP'
    default: return materiaName
  }
}
const statDisplayText = (stat) => {
  switch (stat) {
    // case 'Strength': return 'Strength'
    // case 'Dexterity': return 'Dexterity'
    // case 'Vitality': return 'Vitality'
    // case 'Magic': return 'Magic'
    case 'Spirit': return 'Magic def'
    // case 'Luck': return 'Luck'
    case 'HP': return 'MaxHP'
    case 'MP': return 'MaxMP'
    default: return stat
  }
}
const drawInfo = (text) => {
  removeGroupChildren(infoGroup)
  if (text !== '') {
    addTextToDialog(
      infoGroup,
      text,
      `materia-info`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      13.5 - 8,
      89.5 - 4,
      0.5
    )
  }
}
const mainNavigation = delta => {
  console.log('materia mainNavigation', delta)

  const potential = DATA.mainNavPos + delta
  if (DATA.mainNavPos === 0 && delta === -9) {
    // console.log('materia mainNavigation check -> arrange downwards')
    DATA.mainNavPos = 9
  } else if (DATA.mainNavPos === 9 && delta === 9) {
    // console.log('materia mainNavigation arrange -> check upwards')
    DATA.mainNavPos = 0
  } else if (potential < 0) {
    // console.log('materia mainNavigation too low, do nothing')
    return
  } else if (potential > 17) {
    // console.log('materia mainNavigation too high, do nothing')
    return
  } else if (DATA.mainNavPos === 8 && delta === 1) {
    // console.log('materia mainNavigation dont go up a row')
    return
  } else if (DATA.mainNavPos === 9 && delta === -1) {
    // console.log('materia mainNavigation dont go down a row')
    return
  } else {
    DATA.mainNavPos = potential
  }
  drawMainNavPointer()
}
const mainNavigationSelect = () => {
  console.log('materia mainNavigationSelect', DATA.mainNavPos, DATA.battleStats.menu.command)
  if (DATA.mainNavPos === 0) {
    drawCheckSelect()
  } else if (DATA.mainNavPos === 9) {
    showArrangeMenu()
  } else {
    selectEquippedMateriaForSwap()
  }
}
const getArrangeMenuPos = () => {
  return {
    x: 130, // TODO - Validate these positions
    y: 34,
    yAdj: 12
  }
}
const drawArrangeMenu = () => {
  const options = ['Arrange', 'Exchange', 'Remove all', 'Trash']
  const { x, y, yAdj } = getArrangeMenuPos()
  for (let i = 0; i < options.length; i++) {
    const option = options[i]
    addTextToDialog(
      arrangeDialog,
      option,
      `materia-arrange-menu-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x - 8,
      y + (i * yAdj) - 4,
      0.5
    )
  }
}
const drawArrangePointer = () => {
  const { x, y, yAdj } = getArrangeMenuPos()
  movePointer(POINTERS.pointer1, x - 11.5, y + (DATA.arrangePos * yAdj) - 1) // TODO - Validate these positions
  movePointer(POINTERS.pointer2, 0, 0, true)
}
const arrangeNavigation = (up) => {
  // TODO - Assume that navigation wraps around the top and bottom, need to validate
  if (up) {
    DATA.arrangePos++
    if (DATA.arrangePos > 3) {
      DATA.arrangePos = 0
    }
  } else {
    DATA.arrangePos--
    if (DATA.arrangePos < 0) {
      DATA.arrangePos = 3
    }
  }
  drawArrangePointer()
}
const showArrangeMenu = () => {
  arrangeDialog.visible = true
  // DATA.arrangePos = 0 // TODO - Does this reset each time?
  drawArrangePointer()
  setMenuState('materia-arrange-menu')
  window.arrangeDialog = arrangeDialog
}
const cancelArrangeMenu = () => {
  arrangeDialog.visible = false
  drawMainNavPointer()
  drawInfo('')
  setMenuState('materia-main')
}
const selectArrangeMenuOption = () => {
  console.log('materia selectArrangeMenuOption', DATA.arrangePos)
  if (DATA.arrangePos === 0) {
    setMenuState('loading')
    arrangeMateria()
    drawSmallMateriaList()
    setMenuState('materia-arrange-menu')
    // cancelArrangeMenu() // TODO - Assume that the arrange menu is still open
  } else if (DATA.arrangePos === 1) {
    // TODO - All exchange menus and behaviour
    showExchangeMenu()
  } else if (DATA.arrangePos === 2) {
    setMenuState('loading')
    removeAllMateriaForCharacter()
    cancelArrangeMenu() // TODO - Assume that this closes the menu
  } else if (DATA.arrangePos === 3) {
    setTrashMode()
  }
}
const drawTrashDialog = () => {
  addTextToDialog(
    trashDialog,
    'Are you sure you want to trash?', // TODO - confirm text wording and positions, if yes or no first
    `materia-trash-label-1`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    52.5 - 8,
    32 - 4,
    0.5
  )
  addTextToDialog(
    trashDialog,
    'Yes',
    `materia-trash-label-2`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    75 + 12 - 8,
    32 + 13 - 4,
    0.5
  )
  addTextToDialog(
    trashDialog,
    'No',
    `materia-trash-label-3`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    75 + 12 - 8,
    32 + 26 - 4,
    0.5
  )
}
const setTrashMode = () => {
  DATA.trashMode = true
  DATA.trashConfirmPos = 0 // TODO - confirm when the confirm position is reset
  selectEquippedMateriaForSwap()
}
const cancelTrashConfirm = () => {
  trashDialog.visible = false
  setTrashMode()
}
const confirmTrashConfirm = () => {
  trashDialog.visible = false
  if (DATA.trashConfirmPos === 0) {
    setMenuState('loading')
    console.log('materia trashMateria', DATA.smallMateriaList.page + DATA.smallMateriaList.pos)
    trashMateria(DATA.smallMateriaList.page + DATA.smallMateriaList.pos)
    drawSmallMateriaList()
    cancelSelectMateriaForEquipReplace()
  } else {
    cancelTrashConfirm()
  }
}
const trashConfirmNavigation = () => {
  DATA.trashConfirmPos === 0 ? DATA.trashConfirmPos = 1 : DATA.trashConfirmPos = 0
  drawTrashConfirmPointers()
}
const openTrashConfirmDialog = () => {
  console.log('materia openTrashConfirmDialog')
  trashDialog.visible = true
  drawTrashConfirmPointers()
  setMenuState('materia-trash-confirm-navigation')
}
const drawTrashConfirmPointers = () => {
  if (DATA.trashConfirmPos === 0) {
    movePointer(POINTERS.pointer1, 75, 32 + 13) // TODO - validate positions
  } else {
    movePointer(POINTERS.pointer1, 75, 32 + 26)
  }
  movePointer(POINTERS.pointer2, POINTERS.pointer2.position.x, 240 - POINTERS.pointer2.position.y, false, true)
}
const removeMateriaFromSlot = () => {
  if (DATA.mainNavPos !== 0 && DATA.mainNavPos !== 9) {
    const slot = DATA.mainNavPos < 9 ? `weaponMateria${DATA.mainNavPos}` : `armorMateria${DATA.mainNavPos % 9}`
    unequipMateria(DATA.char, slot)
    recalculateAndApplyHPMP(DATA.char)
    setDataFromPartyMember()
    drawHeader()
  }
}
const removeAllMateriaForCharacter = () => {
  for (const slot in DATA.char.materia) {
    unequipMateria(DATA.char, slot)
  }
  recalculateAndApplyHPMP(DATA.char)
  setDataFromPartyMember()
  drawHeader()
}

const selectEquippedMateriaForSwap = () => {
  console.log('materia selectEquippedMateriaForSwap')
  DATA.smallMateriaList.active = true
  drawSmallMateriaSelectPointer()
  drawSmallMateriaList()
  drawMateriaDetails()
  setMenuState('materia-select-materia-equip-replace')
}
const drawSmallMateriaSelectPointer = () => {
  const { x, y, yAdj } = getSmallMateriaListPositions()
  if (DATA.trashMode) {
    const { x, y, yAdj } = getArrangeMenuPos()
    movePointer(POINTERS.pointer1, x - 11.5, y + (DATA.arrangePos * yAdj) - 1, false, true) // TODO - Validate these positionss
  } else {
    movePointer(POINTERS.pointer1, POINTERS.pointer1.position.x, 240 - POINTERS.pointer1.position.y, false, true)
  }

  movePointer(POINTERS.pointer2,
    x - 14, // TODO - get position right
    y + (DATA.smallMateriaList.pos * yAdj) + 4
  )
}
const cancelSelectMateriaForEquipReplace = () => {
  console.log('materia cancelSelectMateriaForEquipReplace')
  DATA.smallMateriaList.active = false
  drawInfo('')
  if (DATA.trashMode) {
    drawArrangePointer()
    DATA.trashMode = false
    setMenuState('materia-arrange-menu')
  } else {
    drawMainNavPointer()
    drawMateriaDetails()
    setMenuState('materia-main')
  }
}
const selectMateriaForEquipReplace = () => {
  if (DATA.trashMode) {
    openTrashConfirmDialog()
    return
  }
  const slot = DATA.mainNavPos < 9 ? `weaponMateria${DATA.mainNavPos}` : `armorMateria${DATA.mainNavPos % 9}`
  const materiaPos = DATA.smallMateriaList.page + DATA.smallMateriaList.pos

  const toInventoryMateria = JSON.parse(JSON.stringify(DATA.char.materia[slot]))
  const toEquipMateria = JSON.parse(JSON.stringify(window.data.savemap.materias[materiaPos]))
  console.log('materia selectMateriaForEquipReplace', slot, materiaPos, toInventoryMateria, toEquipMateria)
  DATA.char.materia[slot] = toEquipMateria
  window.data.savemap.materias[materiaPos] = toInventoryMateria
  recalculateAndApplyHPMP(DATA.char)
  setDataFromPartyMember()
  drawHeader()
  cancelSelectMateriaForEquipReplace()
}
const tweenSmallMateriaList = (up, state, cb) => {
  setMenuState('materia-tweening-list')
  const subContents = smallMateriaListContentsGroup
  for (let i = 0; i < DATA.page + 1; i++) {
    subContents.children[i].visible = true
  }
  let from = {y: subContents.position.y}
  let to = {y: up ? subContents.position.y + 13 : subContents.position.y - 13}
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      subContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < DATA.page; i++) {
        subContents.children[i].visible = false
      }
      setMenuState(state)
      cb()
    })
    .start()
}
const smallMateriaNavigation = (delta) => {
  const maxPage = window.data.savemap.materias.length - 10
  const maxPos = 10
  const potential = DATA.smallMateriaList.pos + delta

  console.log('materia smallMateriaNavigation', delta, '-', DATA.smallMateriaList.page, DATA.smallMateriaList.pos, '->', potential, ':', maxPage, maxPos)

  const { x, y, yAdj } = getSmallMateriaListPositions()

  if (potential < 0) {
    if (DATA.smallMateriaList.page === 0) {
      console.log('materia smallMateriaNavigation on first page - do nothing')
    } else {
      console.log('materia smallMateriaNavigation not on first page - PAGE DOWN')
      drawMateriaListOneItem(smallMateriaListContentsGroup, -1, DATA.smallMateriaList.page, x, y, yAdj)
      DATA.smallMateriaList.page--
      tweenSmallMateriaList(false, 'materia-select-materia-equip-replace', drawSmallMateriaList) // Could optimise further
      drawMateriaDetails()
    }
  } else if (potential >= maxPos) {
    console.log('materia smallMateriaNavigation page - is last page??', DATA.smallMateriaList.page, maxPos, maxPage)
    if (DATA.smallMateriaList.page >= maxPage) {
      console.log('materia smallMateriaNavigation on last page - do nothing')
    } else {
      console.log('materia smallMateriaNavigation not on last page - PAGE UP', delta, DATA.smallMateriaList.pos)
      drawMateriaListOneItem(smallMateriaListContentsGroup, 10, DATA.smallMateriaList.page, x, y, yAdj)
      DATA.smallMateriaList.page++
      tweenSmallMateriaList(true, 'materia-select-materia-equip-replace', drawSmallMateriaList)
      drawMateriaDetails()
    }
  } else {
    console.log('materia smallMateriaNavigation move pointer only', DATA.smallMateriaList.page, DATA.smallMateriaList.pos, potential)
    DATA.smallMateriaList.pos = potential
    drawMateriaDetails()
    drawSmallMateriaSelectPointer()
  }
}
const smallMateriaPageNavigation = (up) => {
  const lastPage = window.data.savemap.materias.length - 10
  if (up) {
    DATA.smallMateriaList.page = DATA.smallMateriaList.page + 10
    if (DATA.smallMateriaList.page > lastPage) {
      DATA.smallMateriaList.page = lastPage
    }
  } else {
    DATA.smallMateriaList.page = DATA.smallMateriaList.page - 10
    if (DATA.smallMateriaList.page < 0) {
      DATA.smallMateriaList.page = 0
    }
  }
  // Update list group positions
  smallMateriaListGroup.userData.slider.userData.moveToPage(DATA.smallMateriaList.page)
  // smallMateriaListContentsGroup.position.y = DATA.smallMateriaList.page * 13
  drawSmallMateriaList()
  drawMateriaDetails()
}
const switchPartyMember = delta => {
  let newMember = false
  let potential = DATA.partyMember
  while (newMember === false) {
    potential = potential + delta
    if (potential > 2) {
      potential = 0
    } else if (potential < 0) {
      potential = 2
    }
    if (window.data.savemap.party.members[potential] !== 'None') {
      newMember = potential
    }
  }
  DATA.partyMember = newMember
  setDataFromPartyMember()
  drawHeader()
  drawMainNavPointer()
}
const switchToEquipMenu = async () => {
  setMenuState('loading')
  movePointer(POINTERS.pointer1, 0, 0, true)
  await fadeOverlayIn(getMenuBlackOverlay())
  headerDialog.visible = false
  infoDialog.visible = false
  arrangeDialog.visible = false
  materiaDetailsDialog.visible = false
  smallMateriaListDialog.visible = false
  trashDialog.visible = false
  checkDialog.visible = false
  loadEquipMenu(DATA.partyMember)
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  DATA.tweenEnemySkills.stop()

  headerDialog.visible = false
  infoDialog.visible = false
  arrangeDialog.visible = false
  materiaDetailsDialog.visible = false
  smallMateriaListDialog.visible = false
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
    } else if (key === KEY.L1) {
      switchPartyMember(-1)
    } else if (key === KEY.R1) {
      switchPartyMember(1)
    } else if (key === KEY.LEFT) {
      mainNavigation(-1)
    } else if (key === KEY.RIGHT) {
      mainNavigation(1)
    } else if (key === KEY.UP) {
      mainNavigation(-9)
    } else if (key === KEY.DOWN) {
      mainNavigation(9)
    } else if (key === KEY.O) {
      mainNavigationSelect()
    } else if (key === KEY.TRIANGLE) {
      removeMateriaFromSlot()
    } else if (key === KEY.SQUARE) {
      switchToEquipMenu()
    }
  } else if (state === 'materia-check') {
    if (key === KEY.LEFT) {
      checkNavigation(false, -1)
    } else if (key === KEY.RIGHT) {
      checkNavigation(false, 1)
    } else if (key === KEY.UP) {
      checkNavigation(true, -1)
    } else if (key === KEY.DOWN) {
      checkNavigation(true, 1)
    } else if (key === KEY.O) {
      checkSelectCommand()
    } else if (key === KEY.X) {
      cancelCheck()
    }
  } else if (state === 'materia-check-sub') {
    if (key === KEY.LEFT) {
      checkSubNavigation(false, -1)
    } else if (key === KEY.RIGHT) {
      checkSubNavigation(false, 1)
    } else if (key === KEY.UP) {
      checkSubNavigation(true, -1)
    } else if (key === KEY.DOWN) {
      checkSubNavigation(true, 1)
    } else if (key === KEY.L1) {
      checkSubPageNavigation(false)
    } else if (key === KEY.R1) {
      checkSubPageNavigation(true)
    } else if (key === KEY.X) {
      cancelSubCheck()
    }
  } else if (state === 'materia-select-materia-equip-replace') {
    if (key === KEY.UP) {
      smallMateriaNavigation(-1)
    } else if (key === KEY.DOWN) {
      smallMateriaNavigation(1)
    } else if (key === KEY.L1) {
      smallMateriaPageNavigation(false)
    } else if (key === KEY.R1) {
      smallMateriaPageNavigation(true)
    } else if (key === KEY.O) {
      selectMateriaForEquipReplace()
    } else if (key === KEY.X) {
      cancelSelectMateriaForEquipReplace()
    }
  } else if (state === 'materia-arrange-menu') {
    if (key === KEY.UP) {
      arrangeNavigation(false)
    } else if (key === KEY.DOWN) {
      arrangeNavigation(true)
    } else if (key === KEY.O) {
      selectArrangeMenuOption()
    } else if (key === KEY.X) {
      cancelArrangeMenu()
    }
  } else if (state === 'materia-trash-confirm-navigation') {
    if (key === KEY.UP) {
      trashConfirmNavigation()
    } else if (key === KEY.DOWN) {
      trashConfirmNavigation()
    } else if (key === KEY.O) {
      confirmTrashConfirm()
    } else if (key === KEY.X) {
      cancelTrashConfirm()
    }
  } else if (state === 'materia-exchange-select') {
    if (key === KEY.LEFT) {
      exchangeNavigation(false, -1)
    } else if (key === KEY.RIGHT) {
      exchangeNavigation(false, 1)
    } else if (key === KEY.UP) {
      exchangeNavigation(true, -1)
    } else if (key === KEY.DOWN) {
      exchangeNavigation(true, 1)
    } else if (key === KEY.L1) {
      exchangePageNavigation(false)
    } else if (key === KEY.R1) {
      exchangePageNavigation(true)
    } else if (key === KEY.TRIANGLE) {
      exchangeRemoveMateriaFromSlot()
    } else if (key === KEY.X) {
      exchangeSelectCancel()
    } else if (key === KEY.O) {
      exchangeSelectSelect()
    }
  } else if (state === 'materia-exchange-confirm') {
    if (key === KEY.LEFT) {
      exchangeNavigation(false, -1)
    } else if (key === KEY.RIGHT) {
      exchangeNavigation(false, 1)
    } else if (key === KEY.UP) {
      exchangeNavigation(true, -1)
    } else if (key === KEY.DOWN) {
      exchangeNavigation(true, 1)
    } else if (key === KEY.L1) {
      exchangePageNavigation(false)
    } else if (key === KEY.R1) {
      exchangePageNavigation(true)
    } else if (key === KEY.TRIANGLE) {
      exchangeRemoveMateriaFromSlot()
    } else if (key === KEY.X) {
      exchangeConfirmCancel()
    } else if (key === KEY.O) {
      exchangeConfirmSelect()
    }
  }
}
export { loadMateriaMenu, keyPress, drawMateriaListOneItem, getSmallMateriaListPositions, drawMateriaDetailsWithGroup }

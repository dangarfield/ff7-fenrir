import TWEEN from '../../assets/tween.esm.js'
import { currentMateriaLevel, getBattleStatsForChar, getEnemySkillFlagsWithSkills, isMPTurboActive, applyMPTurbo } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'
import {
  addCharacterSummary, addGroupToDialog, addImageToDialog, addMenuCommandsToDialog, addShapeToDialog, addTextToDialog, createDialogBox, createEquipmentMateriaViewer, createItemListNavigation, EQUIPMENT_TYPE, fadeOverlayIn, fadeOverlayOut, LETTER_COLORS, LETTER_TYPES, movePointer, POINTERS, removeGroupChildren, WINDOW_COLORS_SUMMARY
} from './menu-box-helper.js'
import { fadeInHomeMenu, setSelectedNav } from './menu-main-home.js'
import { getMenuBlackOverlay, setMenuState } from './menu-module.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'

let headerDialog, headerGroup
let infoDialog, infoGroup
let arrangeDialog
let materiaDetailsDialog, materiaDetailsGroup, materiaDetailsEnemySkillGroup, materialsDetailsEnemySkillTextContents
let smallMateriaListDialog, smallMateriaListGroup, smallMateriaListContentsGroup
let trashDialog
let checkDialog, checkGroup, checkSubGroup

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  mainNavPos: 1, // 0 check, 1-8 weap, 9 arrange, 10-17 arm
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
  }
}
const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
  // DATA.check.sub.spells = DATA.battleStats.menu.magic
  // DATA.check.sub.spells = DATA.battleStats.menu.summon
  // DATA.check.sub.spells = DATA.battleStats.menu.enemySkills

  window.DATA = DATA
}

const loadMateriaMenu = async partyMember => {
  DATA.partyMember = partyMember
  setDataFromPartyMember()
  DATA.mainNavPos = 1
  DATA.smallMateriaList.pos = 0
  DATA.smallMateriaList.page = 0
  DATA.check.main = 0

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

  trashDialog = createDialogBox({
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

  console.log('materia DATA', DATA)
  setSelectedNav(2)
  drawEnemySkillsGroup()
  drawHeader()
  drawMainNavPointer()
  drawSmallMateriaList()
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
    showSmallMateriaList()
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
const showSmallMateriaList = () => {
  materiaDetailsDialog.visible = true
  materiaDetailsEnemySkillGroup.visible = false
  smallMateriaListDialog.visible = true
  smallMateriaListGroup.visible = true
  smallMateriaListContentsGroup.visible = true
}
const getSmallMateriaListPositions = () => {
  return {
    x: 213.5 - 8,
    y: 115 - 4,
    yAdj: 13
  }
}
const drawSmallMateriaList = () => {
  console.log('materia drawSmallMateriaList')
  // materiaDetailsDialog.visible = false
  smallMateriaListDialog.visible = true
  smallMateriaListGroup.visible = false
  smallMateriaListContentsGroup.visible = false

  const { x, y, yAdj } = getSmallMateriaListPositions()
  // const menu = DATA.menus[DATA.menuCurrent]
  for (let i = 0; i < window.data.savemap.materias.length; i++) {
    const materia = window.data.savemap.materias[i]
    if (materia.id < 255) {
      const textGroup = addTextToDialog(
        smallMateriaListContentsGroup,
        materia.name,
        `materia-small-list-${i}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        x,
        y + (i * yAdj),
        0.5
      )
      const materiaData = window.data.kernel.materiaData[materia.id]
      const materiaIcon = addImageToDialog(smallMateriaListContentsGroup,
        'materia',
        materiaData.type,
        `materia-small-list-${i}-type`,
        x + 2,
        y + (i * yAdj) - 0.5,
        0.5
      )

      for (let j = 0; j < textGroup.children.length; j++) {
        const textLetters = textGroup.children[j]
        textLetters.material.clippingPlanes = smallMateriaListDialog.userData.bg.material.clippingPlanes
      }
      materiaIcon.material.clippingPlanes = smallMateriaListDialog.userData.bg.material.clippingPlanes
    }
  }
  createItemListNavigation(smallMateriaListGroup, 313, 104 - 32, 138.5, window.data.savemap.materias.length, 10)
  smallMateriaListGroup.userData.slider.userData.moveToPage(DATA.smallMateriaList.page)
  smallMateriaListContentsGroup.position.y = DATA.smallMateriaList.page * yAdj
  // TODO - Still need some clipping etc, will look at when doing list navigation
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
const drawMateriaDetails = () => {
  console.log('materia drawMateriaDetails')
  materiaDetailsDialog.visible = true
  smallMateriaListDialog.visible = true
  removeGroupChildren(materiaDetailsGroup)

  let materia
  if (DATA.smallMateriaList.active) {
    materia = window.data.savemap.materias[DATA.smallMateriaList.page + DATA.smallMateriaList.pos]
    // smallMateriaListGroup.visible = true
    // smallMateriaListContentsGroup.visible = true
  } else if (DATA.mainNavPos < 9) {
    materia = DATA.char.materia[`weaponMateria${DATA.mainNavPos}`]
    // smallMateriaListGroup.visible = false
    // smallMateriaListContentsGroup.visible = false
  } else {
    materia = DATA.char.materia[`armorMateria${DATA.mainNavPos % 9}`]
    // smallMateriaListGroup.visible = false
    // smallMateriaListContentsGroup.visible = false
  }
  if (materia.id === 255) {
    return
  }

  const materiaData = window.data.kernel.materiaData[materia.id]
  console.log('materia drawMateriaDetails', materia, materiaData)

  // Name, type, description
  addTextToDialog(
    materiaDetailsGroup,
    materiaData.name,
    `materia-details-name`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    20 - 8,
    117 - 4,
    0.5
  )
  addImageToDialog(materiaDetailsGroup,
    'materia',
    materiaData.type,
    `materia-details-type`,
    20 - 8 + 0.5,
    117 - 4 - 0.5,
    0.5
  )
  drawInfo(materiaData.description)

  // Appears to be 3 types
  // 1 - Masters - with nothing else, I think I should better flag these masters in kujata
  // 2 - enemy skill, lots to do here
  // 3 - All others with everything
  if (materiaData.attributes.master) {
    console.log('materia MASTER materia, no more details required')
    materiaDetailsEnemySkillGroup.visible = false
  } else if (materiaData.attributes.skill && materiaData.attributes.skill === 'EnemySkill') {
    materiaDetailsEnemySkillGroup.visible = true
    const skills = getEnemySkillFlagsWithSkills(materia.ap).map(s => s.enabled ? `${s.index}-active` : `${s.index}-inactive`)
    console.log('materia ENEMY SKILL materia, need to implement', skills)

    const groups = [materiaDetailsEnemySkillGroup, materialsDetailsEnemySkillTextContents]

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      for (let j = 0; j < group.children.length; j++) {
        const item = group.children[j]
        if (item.userData.enemySkills) {
          // console.log('materia enemySkills item', item.userData.enemySkills, skills.includes(item.userData.enemySkills))
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
    materiaDetailsEnemySkillGroup.visible = false

    // Labels
    addTextToDialog(
      materiaDetailsGroup,
      'AP',
      `materia-details-ap-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      103.5 - 8,
      132 - 4,
      0.5
    )
    addTextToDialog(
      materiaDetailsGroup,
      'To next level',
      `materia-details-next-level-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      54 - 8,
      145 - 4,
      0.5
    )
    addTextToDialog(
      materiaDetailsGroup,
      'Ability List',
      `materia-details-next-ability-label`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      4 - 8,
      160 - 4,
      0.5
    )
    addTextToDialog(
      materiaDetailsGroup,
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
        materiaDetailsGroup,
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
        materiaDetailsGroup,
        'MASTER',
        `materia-ap-master`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        125 - 8,
        132 - 4,
        0.5
      )
      addTextToDialog(
        materiaDetailsGroup,
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
        materiaDetailsGroup,
        ('' + materia.ap).padStart(8, ' '),
        `materia-ap-master`,
        LETTER_TYPES.MenuTextStats,
        LETTER_COLORS.White,
        120.5 - 8,
        132 - 4,
        0.5
      )
      addTextToDialog(
        materiaDetailsGroup,
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
          materiaDetailsGroup,
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
        materiaDetailsGroup,
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
        materiaDetailsGroup,
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
          materiaDetailsGroup,
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
        materiaDetailsGroup,
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
          materiaDetailsGroup,
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
          materiaDetailsGroup,
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
          materiaDetailsGroup,
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
        materiaDetailsGroup,
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
        materiaDetailsGroup,
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
        materiaDetailsGroup,
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
          materiaDetailsGroup,
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
    // TODO - Show arrange menu
  } else {
    selectEquippedMateriaForSwap()
  }
}

const selectEquippedMateriaForSwap = () => {
  const slot = DATA.mainNavPos < 9 ? `weaponMateria${DATA.mainNavPos}` : `armorMateria${DATA.mainNavPos - 9}`
  console.log('materia selectEquippedMateriaForSwap', slot)
  DATA.smallMateriaList.active = true
  drawSmallMateriaSelectPointer()
  showSmallMateriaList()
  drawMateriaDetails()
  setMenuState('materia-select-materia-equip-replace')
}
const drawSmallMateriaSelectPointer = () => {
  const { x, y, yAdj } = getSmallMateriaListPositions()
  movePointer(POINTERS.pointer1, POINTERS.pointer1.position.x, 240 - POINTERS.pointer1.position.y, false, true)
  movePointer(POINTERS.pointer2,
    x - 14, // TODO - get position right
    y + (DATA.smallMateriaList.pos * yAdj) + 4
  )
}
const cancelSelectMateriaForEquipReplace = () => {
  console.log('materia cancelSelectMateriaForEquipReplace')
  DATA.smallMateriaList.active = false
  drawMainNavPointer()
  drawInfo('')
  drawMateriaDetails()
  setMenuState('materia-main')
}
const selectMateriaForEquipReplace = () => {
  console.log('materia selectMateriaForEquipReplace')
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

  if (potential < 0) {
    if (DATA.smallMateriaList.page === 0) {
      console.log('materia smallMateriaNavigation on first page - do nothing')
    } else {
      console.log('materia smallMateriaNavigation not on first page - PAGE DOWN')
      // if (delta === -1 && DATA.check.sub.type !== 'summon') {
      //   DATA.smallMateriaList.pos = DATA.smallMateriaList.pos + (cols - 1) // 3 magic per row
      //   drawCheckSubPointer()
      // }
      DATA.smallMateriaList.page--
      tweenSmallMateriaList(false, 'materia-select-materia-equip-replace', drawMateriaDetails)
      smallMateriaListGroup.userData.slider.userData.moveToPage(DATA.smallMateriaList.page)
    }
  } else if (potential >= maxPos) {
    console.log('materia smallMateriaNavigation page - is last page??', DATA.smallMateriaList.page, maxPos, maxPage)
    if (DATA.smallMateriaList.page >= maxPage) {
      console.log('materia smallMateriaNavigation on last page - do nothing')
    } else {
      console.log('materia smallMateriaNavigation not on last page - PAGE UP', delta, delta === 1, DATA.smallMateriaList.pos)
      // if (delta === 1 && DATA.check.sub.type !== 'summon') {
      //   DATA.smallMateriaList.pos = DATA.smallMateriaList.pos - (cols - 1)
      //   drawCheckSubPointer()
      // }
      DATA.smallMateriaList.page++
      tweenSmallMateriaList(true, 'materia-select-materia-equip-replace', drawMateriaDetails)
      smallMateriaListGroup.userData.slider.userData.moveToPage(DATA.smallMateriaList.page)
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
    DATA.smallMateriaList.page = DATA.smallMateriaList.page + 3
    if (DATA.smallMateriaList.page > lastPage) {
      DATA.smallMateriaList.page = lastPage
    }
  } else {
    DATA.smallMateriaList.page = DATA.smallMateriaList.page - 3
    if (DATA.smallMateriaList.page < 0) {
      DATA.smallMateriaList.page = 0
    }
  }
  // Update list group positions
  smallMateriaListGroup.userData.slider.userData.moveToPage(DATA.smallMateriaList.page)
  smallMateriaListContentsGroup.position.y = DATA.smallMateriaList.page * 13
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
  }
}
export { loadMateriaMenu, keyPress }

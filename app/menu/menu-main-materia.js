import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'
import { getMenuBlackOverlay, setMenuState } from './menu-module.js'
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
  addGroupToDialog,
  removeGroupChildren,
  addImageToDialog,
  addCharacterSummary,
  createEquipmentMateriaViewer,
  EQUIPMENT_TYPE,
  addMenuCommandsToDialog,
  createItemListNavigation,
  addShapeToDialog
} from './menu-box-helper.js'
import { fadeInHomeMenu, setSelectedNav } from './menu-main-home.js'
import { getBattleStatsForChar, currentMateriaLevel, getEnemySkillFlagsWithSkills } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, headerGroup
let infoDialog, infoGroup
let arrangeDialog
let materiaDetailsDialog, materiaDetailsGroup, materialsDetailsEnemySkillGroup, materialsDetailsEnemySkillTextContents
let smallMateriaListDialog, smallMateriaListGroup, smallMateriaListContentsGroup
let trashDialog
let checkDialog, checkGroup, checkSubGroup

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  mainNavPos: 1, // 0 check, 1-8 weap, 9 arrange, 10-17 arm
  smallMateriaListPos: 0,
  smallMateriaListPage: 0,
  tweenEnemySkills: false,
  check: { main: 0, sub: 0 }
}
const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
}

const loadMateriaMenu = async partyMember => {
  DATA.partyMember = partyMember
  setDataFromPartyMember()
  DATA.mainNavPos = 1
  DATA.smallMateriaListPos = 0
  DATA.smallMateriaListPage = 0
  DATA.check = { main: 0, sub: 0 }

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
  materialsDetailsEnemySkillGroup = addGroupToDialog(materiaDetailsDialog, 32)

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
  removeGroupChildren(smallMateriaListGroup)
  removeGroupChildren(smallMateriaListContentsGroup)

  if (DATA.mainNavPos === 0) {
    drawCheck()
  } else if (DATA.mainNavPos === 9) {
    drawSmallMateriaList()
  } else {
    drawMateriaDetails()
  }
}
const drawCheck = () => {
  console.log('materia drawCheck', DATA)
  materiaDetailsDialog.visible = false
  smallMateriaListDialog.visible = false
  materialsDetailsEnemySkillGroup.visible = false

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
  const command = DATA.battleStats.menu.command[DATA.check.main]
  console.log('materia checkSelectCommand', command)
  if (command.type && command.type === 2) {
    drawCheckCommandMagic()
  } else if (command.type && command.type === 3) {
    drawCheckCommandSummon()
  } else if (command.id === 13) {
    drawCheckCommandEnemySkill()
  }
}
const checkNavigation = (vertical, delta) => {
  console.log('materia checkNavigation', DATA, vertical, delta)
  window.DATA = DATA

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
  drawInfo(window.data.kernel.commandData[DATA.battleStats.menu.command[DATA.check.main].id].description)
  drawCheckMainPointer()
}

const drawCheckCommandMagic = () => {
  console.log('materia drawCheckCommandMagic')
  removeGroupChildren(checkSubGroup)
  const checkMagicDialog = createDialogBox({
    id: 23,
    name: 'checkMagicDialog',
    w: 209,
    h: 60,
    x: 23.5,
    y: 171.5,
    expandInstantly: true,
    noClipping: false,
    group: checkSubGroup
  })
  checkMagicDialog.visible = true
  const checkMagicList = addGroupToDialog(checkMagicDialog, 33)
  const checkMagicListContents = addGroupToDialog(checkMagicDialog, 33)

  const x = 41
  const y = 188
  const xAdj = 65
  const yAdj = 17
  for (let i = 0; i < DATA.battleStats.menu.magic.length; i++) {
    const magic = DATA.battleStats.menu.magic[i]
    if (magic.enabled) {
      // addTextToDialog(
      //   materiaDetailsGroup,
      //   'AP',
      //   `materia-details-ap-label`,
      //   LETTER_TYPES.MenuBaseFont,
      //   LETTER_COLORS.Cyan,
      //   103.5 - 8,
      //   132 - 4,
      //   0.5
      // )
    }
  }

  const checkMagicCastingDialog = createDialogBox({
    id: 23,
    name: 'checkMagicCastingDialog',
    w: 57.5,
    h: 60,
    x: 232.5,
    y: 171.5,
    expandInstantly: true,
    noClipping: true,
    group: checkSubGroup
  })
  checkMagicCastingDialog.visible = true
  const checkMagicCastingGroup = addGroupToDialog(checkMagicCastingDialog, 33)
  setMenuState('materia-check-sub')
}

const drawCheckCommandSummon = () => {
  console.log('materia drawCheckCommandSummon')
}

const drawCheckCommandEnemySkill = () => {
  console.log('materia drawCheckCommandEnemySkill')
}
const checkSubNavigation = (vertical, delta) => {
  console.log('materia checkSubNavigation', vertical, delta)
}
const cancelSubCheck = () => {
  console.log('materia cancelSubCheck')
  removeGroupChildren(checkSubGroup)
  drawInfo(window.data.kernel.commandData[DATA.battleStats.menu.command[DATA.check.main].id].description)
  drawCheckMainPointer()
  setMenuState('materia-check')
}
const drawSmallMateriaList = () => {
  console.log('materia drawCheck')
  materiaDetailsDialog.visible = true
  smallMateriaListDialog.visible = true
  materialsDetailsEnemySkillGroup.visible = false

  const x = 213.5 - 8
  const y = 115 - 4
  const yAdj = 13
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
  smallMateriaListGroup.userData.slider.userData.moveToPage(DATA.smallMateriaListPage)
  smallMateriaListContentsGroup.position.y = DATA.smallMateriaListPage * yAdj
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
    group: materialsDetailsEnemySkillGroup
  })
  for (let i = 0; i < enemySkillTextList.children.length; i++) {
    enemySkillTextList.children[i].visible = false
  }
  enemySkillTextList.visible = true
  materialsDetailsEnemySkillTextContents = addGroupToDialog(enemySkillTextList, 32)
  materialsDetailsEnemySkillTextContents.userData.bg = enemySkillTextList.userData.bg

  addShapeToDialog(
    materialsDetailsEnemySkillGroup,
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
      materialsDetailsEnemySkillGroup,
      'materia',
      `Command-star-active-small`,
      `material-enemy-skill-${skill.index}-active`,
      starX + ((i % 12) * starXAdj),
      starY + (Math.trunc(i / 12) * starYAdj),
      0.5
    )
    imgActive.userData.enemyskill = `${skill.index}-active`

    const imgInactive = addImageToDialog(
      materialsDetailsEnemySkillGroup,
      'materia',
      `Command-star-inactive-small`,
      `material-enemy-skill-${skill.index}-inactive`,
      starX + ((i % 12) * starXAdj),
      starY + (Math.trunc(i / 12) * starYAdj),
      0.5
    )
    imgInactive.userData.enemyskill = `${skill.index}-inactive`

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
    textActive1.userData.enemyskill = `${skill.index}-active`

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
    textInactive1.userData.enemyskill = `${skill.index}-inactive`

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
    textActive2.userData.enemyskill = `${skill.index}-active`

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
    textInactive2.userData.enemyskill = `${skill.index}-inactive`
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
  window.materialsDetailsEnemySkillGroup = materialsDetailsEnemySkillGroup
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

  let slotName
  if (DATA.mainNavPos < 9) {
    slotName = `weaponMateria${DATA.mainNavPos}`
  } else {
    slotName = `armorMateria${DATA.mainNavPos % 9}`
  }
  const materia = DATA.char.materia[slotName]

  if (materia.id === 255) {
    return
  }

  const materiaData = window.data.kernel.materiaData[materia.id]
  console.log('materia drawMateriaDetails', slotName, materia, materiaData)

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
    materialsDetailsEnemySkillGroup.visible = false
  } else if (materiaData.attributes.skill && materiaData.attributes.skill === 'EnemySkill') {
    materialsDetailsEnemySkillGroup.visible = true
    const skills = getEnemySkillFlagsWithSkills(materia.ap).map(s => s.enabled ? `${s.index}-active` : `${s.index}-inactive`)
    console.log('materia ENEMY SKILL materia, need to implement', skills)

    const groups = [materialsDetailsEnemySkillGroup, materialsDetailsEnemySkillTextContents]

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      for (let j = 0; j < group.children.length; j++) {
        const item = group.children[j]
        if (item.userData.enemyskill) {
          // console.log('materia enemyskill item', item.userData.enemyskill, skills.includes(item.userData.enemyskill))
          if (skills.includes(item.userData.enemyskill)) {
            item.visible = true
          } else {
            item.visible = false
          }
        }
      }
    }
  } else {
    console.log('materia standard materia display')
    materialsDetailsEnemySkillGroup.visible = false

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
    8 - 8,
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
  }
}
// const listNavigation = (delta) => {
//   const menu = DATA.menus[DATA.menuCurrent]
//   const maxPage = menu.spells.length / menu.cols
//   const maxPos = menu.cols * 7 // 21
//   const potential = menu.pos + delta
//   if (potential < 0) {
//     if (menu.page === 0) {
//       // console.log('magic listNavigation on first page - do nothing')
//     } else {
//       // console.log('magic listNavigation not on first page - PAGE DOWN')
//       if (delta === -1) {
//         menu.pos = menu.pos + (menu.cols - 1)
//         drawListPointer()
//       }
//       menu.page--
//       tweenMagicList(false, menu.state, updateInfoForSelectedSpell)
//       listGroup.userData.slider.userData.moveToPage(menu.page)
//     }
//   } else if (potential >= maxPos) {
//     // console.log('magic listNavigation page - is last page??', menu.page, maxPos, maxPage - 7)
//     if (menu.page >= (maxPage - 7)) {
//       // console.log('magic listNavigation on last page - do nothing')
//     } else {
//       // console.log('magic listNavigation not on last page - PAGE UP', delta, delta === 1, menu.pos)
//       if (delta === 1) {
//         menu.pos = menu.pos - (menu.cols - 1)
//         drawListPointer()
//       }
//       menu.page++
//       tweenMagicList(true, menu.state, updateInfoForSelectedSpell)
//       listGroup.userData.slider.userData.moveToPage(menu.page)
//     }
//   } else {
//     // console.log('magic listNavigation', menu.page, menu.pos, potential)
//     menu.pos = potential
//     updateInfoForSelectedSpell()
//     drawListPointer()
//   }
// }
// const listPageNavigation = (up) => {
//   const menu = DATA.menus[DATA.menuCurrent]
//   const lastPage = (menu.spells.length / menu.cols) - 7
//   if (up) {
//     menu.page = menu.page + 7
//     if (menu.page > lastPage) {
//       menu.page = lastPage
//     }
//   } else {
//     menu.page = menu.page - 7
//     if (menu.page < 0) {
//       menu.page = 0
//     }
//   }
//   // Update list group positions
//   listGroup.userData.slider.userData.moveToPage(menu.page)
//   listGroupContents.position.y = menu.page * 18
//   updateInfoForSelectedSpell()
// }
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
    } else if (key === KEY.X) {
      cancelSubCheck()
    }
  }
}
export { loadMateriaMenu, keyPress }

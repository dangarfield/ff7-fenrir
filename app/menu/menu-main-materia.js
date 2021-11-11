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
  EQUIPMENT_TYPE,
  addMenuCommandsToDialog,
  createItemListNavigation
} from './menu-box-helper.js'
import { fadeInHomeMenu, homeNav, setSelectedNav } from './menu-main-home.js'
import { getBattleStatsForChar } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, headerGroup //
let infoDialog, infoGroup //
let arrangeDialog // no need for group //
let materiaDetailsDialog, materiaDetailsGroup //
let smallMateriaListDialog, smallMateriaListGroup, smallMateriaListContentsGroup //
let trashDialog // no need for group
let checkDialog, checkGroup //

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  mainNavPos: 1, // 0 check, 1-8 weap, 9 arrange, 10-17 arm
  smallMateriaListPos: 0,
  smallMateriaListPage: 0
}
const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
}

const loadMateriaMenu = async partyMember => {
  setDataFromPartyMember()
  DATA.mainNavPos = 1
  DATA.smallMateriaListPos = 0
  DATA.smallMateriaListPage = 0

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

  smallMateriaListDialog = await createDialogBox({
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

  materiaDetailsDialog = await createDialogBox({
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

  console.log('materia DATA', DATA)
  setSelectedNav(2)
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
  console.log('materia drawCheck')
  materiaDetailsDialog.visible = false
  smallMateriaListDialog.visible = false

  addMenuCommandsToDialog(checkGroup, 23.5, 107, DATA.battleStats.menu.command)
}
const drawSmallMateriaList = () => {
  console.log('materia drawCheck')
  materiaDetailsDialog.visible = true
  smallMateriaListDialog.visible = true

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
const drawMateriaDetails = () => {
  console.log('materia drawMateriaDetails')
  materiaDetailsDialog.visible = true
  smallMateriaListDialog.visible = true

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
    smallMateriaListContentsGroup,
    materiaData.name,
    `materia-details-name`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    20 - 8,
    117 - 4,
    0.5
  )
  addImageToDialog(smallMateriaListContentsGroup,
    'materia',
    materiaData.type,
    `materia-details-type`,
    20 - 8 + 0.5,
    117 - 4 - 0.5,
    0.5
  )
  drawInfo(materiaData.description)
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
    }
  }
}
export { loadMateriaMenu, keyPress }

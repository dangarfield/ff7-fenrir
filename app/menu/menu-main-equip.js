import { getMenuBlackOverlay, setMenuState } from './menu-module.js'
import { loadMateriaMenu } from './menu-main-materia.js'
import { equipItemOnCharacter } from '../items/items-module.js'
import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'
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
  createItemListNavigation
} from './menu-box-helper.js'
import { fadeInHomeMenu, setSelectedNavByName } from './menu-main-home.js'
import { getBattleStatsForChar } from '../battle/battle-stats.js'
import { getMenuVisibility } from '../data/savemap-alias.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, infoDialog, slotsDialog, statsDialog, listDialog
let headerGroup, infoGroup, slotsGroup, statsLabelsGroup, statsBaseGroup, statsSelectedGroup, listGroup, listGroupContents

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  equipType: 0,
  page: 0,
  pos: 0,
  equipable: [],
  showMateriaMenuOnExit: false
}
const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
}

const getEquipTypeName = () => {
  if (DATA.equipType === 0) {
    return 'Weapon'
  } else if (DATA.equipType === 1) {
    return 'Armor'
  } else {
    return 'Accessory'
  }
}
const loadEquipMenu = async partyMember => {
  // Reset data
  DATA.partyMember = partyMember
  DATA.equipType = 0
  DATA.page = 0
  DATA.pos = 0
  DATA.showMateriaMenuOnExit = false
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
    noClipping: false
  })
  listDialog.visible = true
  listGroup = addGroupToDialog(listDialog, 19)

  // drawHeader()
  // drawInfo()
  // drawSlots()

  if (isMateriaMenuAvailable()) {
    setSelectedNavByName('Equip')
  }

  drawStatsLabels()
  // drawStatsBase()
  // drawStatsSelectedBase()
  // drawList()
  loadCharacter()
  await fadeOverlayOut(getMenuBlackOverlay())

  setMenuState('equip-select-type')
  // movePointer(POINTERS.pointer1, 237, 17)
}
const loadCharacter = () => {
  drawHeader()
  drawInfo()
  drawSlots()
  drawStatsBase()
  drawSelectTypePointer()
}
const drawHeader = () => {
  removeGroupChildren(headerGroup)
  const charName = window.data.savemap.party.members[DATA.partyMember]
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
const drawInfo = (isFromList) => {
  removeGroupChildren(infoGroup)

  let description
  if (isFromList) {
    console.log('equip', DATA.equipable, DATA.page, DATA.pos)
    description = DATA.equipable[DATA.page + DATA.pos].description
  } else if (DATA.equipType === 0) {
    description = DATA.char.equip.weapon.description
  } else if (DATA.equipType === 1) {
    description = DATA.char.equip.armor.description
  } else if (DATA.equipType === 2) {
    description = DATA.char.equip.accessory.description
  }

  if (description) {
    addTextToDialog(
      infoGroup,
      description,
      `equip-info`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      12 - 8,
      76.5 - 4,
      0.5
    )
  }
}
const getGrowthText = (growthRateText) => {
  if (growthRateText === 'None') {
    return 'Nothing'
  } else if (growthRateText === 'Double') {
    return 'Double'
  } else if (growthRateText === 'Triple') {
    return 'Triple'
  } else {
    // Normal
    return 'Normal'
  }
}
const drawSlots = (isFromList) => {
  removeGroupChildren(slotsGroup)
  // Not right obviously, just placeholder

  let slots
  let growth
  if (isFromList) {
    const equip = DATA.equipable[DATA.page + DATA.pos]
    console.log('equip drawSlots', equip)
    if (equip.type !== 'Accessory') {
      slots = equip.materiaSlots
      growth = getGrowthText(equip.growthRate)
    }
  } else if (DATA.equipType === 0) {
    const equip = window.data.kernel.weaponData[DATA.char.equip.weapon.index]
    slots = equip.materiaSlots
    growth = getGrowthText(equip.growthRate)
  } else if (DATA.equipType === 1) {
    const equip = window.data.kernel.armorData[DATA.char.equip.armor.index]
    slots = equip.materiaSlots
    growth = getGrowthText(equip.growthRate)
  }

  if (slots) {
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
      growth,
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
      slots,
      DATA.char
    )
  }
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
const hideStatsSelected = () => {
  removeGroupChildren(statsSelectedGroup)
}
const drawStatsSelected = () => {
  const charClone = JSON.parse(JSON.stringify(DATA.char))
  const equip = DATA.equipable[DATA.page + DATA.pos]
  if (DATA.equipType === 0) {
    charClone.equip.weapon = {index: equip.index, itemId: equip.itemId, name: equip.name, description: equip.description}
  } else if (DATA.equipType === 1) {
    charClone.equip.armor = {index: equip.index, itemId: equip.itemId, name: equip.name, description: equip.description}
  } else if (DATA.equipType === 2) {
    charClone.equip.accessory = {index: equip.index, itemId: equip.itemId, name: equip.name, description: equip.description}
  }

  // Note: This appears to be more accurate that the game displays in the menu
  // eg, Curse Ring in the game does not shown state changes but here it does because it alters the Strength and Magic stat
  // and affects Attack & Magic atk. I'll keep it in as I like it a little more, even though it's not the exact same behaviour

  console.log('equip drawStatsSelected', charClone)
  const battleStats = getBattleStatsForChar(charClone)
  console.log('equip drawStatsSelected', charClone, battleStats)
  removeGroupChildren(statsSelectedGroup)
  for (let i = 0; i < STAT_TYPES.length; i++) {
    const attr = STAT_TYPES[i][1]

    console.log('equip drawStatsSelected attr', attr, DATA.battleStats[attr], battleStats[attr])

    let color = LETTER_COLORS.White
    if (DATA.battleStats[attr] > battleStats[attr]) {
      color = LETTER_COLORS.Red
    } else if (DATA.battleStats[attr] < battleStats[attr]) {
      color = LETTER_COLORS.Yellow
    }
    addTextToDialog(
      statsSelectedGroup,
      ('' + battleStats[attr]).padStart(3, ' '),
      `equip-stats-${i}`,
      LETTER_TYPES.MenuTextStats,
      color,
      100 + 35 - 8,
      148.5 - 4 + (i * 13),
      0.5
    )
  }
}
const hideList = () => {
  removeGroupChildren(listGroup)
}
const drawList = () => {
  removeGroupChildren(listGroup)
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.equipable = []
  for (let i = 0; i < window.data.savemap.items.length; i++) {
    const item = window.data.savemap.items[i]
    const type = getEquipTypeName(DATA.equipType)
    if (item.itemId !== 0x7F) {
      const itemData = window.data.kernel.allItemData.filter(i => i.itemId === item.itemId)[0]
      if (itemData.type === type && itemData.equipableBy.includes(charName)) {
        DATA.equipable.push(itemData)
      }
    }
  }
  // console.log('equip equipable', DATA.equipable)

  createItemListNavigation(listGroup, 200 + 113, 85.5 - 6.75, 151.5, DATA.equipable.length, 8)
  listGroup.userData.slider.userData.moveToPage(DATA.page)

  listGroupContents = addGroupToDialog(listGroup, 19)
  listGroup.position.x = 0
  listGroup.position.y = 0
  listGroup.userData.contents = listGroupContents
  const x = 213.5
  const y = 106.5
  const yAdj = 18

  for (let i = 0; i < DATA.equipable.length; i++) {
    const equip = DATA.equipable[i]
    addTextToDialog(
      listGroupContents,
      equip.name,
      `equip-list-contents-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x - 8,
      y - 4 + (yAdj * i),
      0.5
    )
  }
  for (let i = 0; i < listGroupContents.children.length; i++) {
    const listGroupContentsChild = listGroupContents.children[i]
    for (let j = 0; j < listGroupContentsChild.children.length; j++) {
      const listGroupContentsChildChild = listGroupContentsChild.children[j]
      listGroupContentsChildChild.material.clippingPlanes = listDialog.userData.bg.material.clippingPlanes
    }
  }
  // listGroupContents.children[0].children[0].material.clippingPlanes = listDialog.userData.bg.material.clippingPlanes

  // window.listGroup = listGroup
  // window.listDialog = listDialog
  // window.listGroupContents = listGroupContents
}
const drawSelectTypePointer = (flashing) => {
  const x = 123.5 - 10 + 0.5
  const y = 9.5 + 7
  const yAdj = 17
  movePointer(POINTERS.pointer1, x, y + (yAdj * DATA.equipType), false, flashing)
  if (flashing === undefined) {
    movePointer(POINTERS.pointer2, 0, 0, true)
  }
}
const drawSelectItemPointer = () => {
  const x = 212.5 - 10 - 0.5
  const y = 99.5 + 7
  const yAdj = 18
  movePointer(POINTERS.pointer2, x, y + (yAdj * DATA.pos))
}
const selectTypeNavigation = (up) => {
  if (up) {
    DATA.equipType++
    if (DATA.equipType > 2) {
      DATA.equipType = 0
    }
  } else {
    DATA.equipType--
    if (DATA.equipType < 0) {
      DATA.equipType = 2
    }
  }
  drawSelectTypePointer()
  drawInfo()
  drawSlots()
}
const selectType = () => {
  drawSelectTypePointer(true)
  drawSelectItemPointer()
  drawList()
  drawInfo(true)
  drawSlots(true)
  drawStatsSelected()
  console.log('equip DATA', DATA.equipable)
  setMenuState('equip-select-item')
}

const updatePage = () => {
  listGroup.userData.slider.userData.moveToPage(DATA.page)
}
const selectItemNavigation = (up) => {
  const lastPage = DATA.equipable.length - 8
  // console.log('equip selectItemNavigation', up, DATA.pos, DATA.page, lastPage)

  if (up && DATA.pos < 7) {
    // console.log('equip selectItemNavigation POS UP')
    DATA.pos++
  } else if (!up && DATA.pos > 0) {
    // console.log('equip selectItemNavigation POS DOWN')
    DATA.pos--
  } else if (up && DATA.pos === 7 && DATA.page === lastPage) {
    // console.log('equip selectItemNavigation LAST PAGE')
    return
  } else if (!up && DATA.pos === 0 && DATA.page === 0) {
    // console.log('equip selectItemNavigation FIRST PAGE')
    return
  } else if (up && DATA.pos === 7 && DATA.page < lastPage) {
    // console.log('equip selectItemNavigation PAGE UP')
    DATA.page++
    tweenItemList(true)
    updatePage()
  } else if (!up && DATA.pos === 0 && DATA.page > 0) {
    // console.log('equip selectItemNavigation PAGE DOWN')
    DATA.page--
    tweenItemList(false)
    updatePage()
  }

  drawSelectItemPointer()
  drawInfo(true)
  drawSlots(true)
  drawStatsSelected()
}
const selectItemPageNavigation = (up) => {
  const lastPage = DATA.equipable.length - 8
  if (up) {
    DATA.page = DATA.page + 8
    if (DATA.page > lastPage) {
      DATA.page = lastPage
    }
  } else {
    DATA.page = DATA.page - 8
    if (DATA.page < 0) {
      DATA.page = 0
    }
  }
  instantlyMoveItemList()
  updatePage()
  drawInfo(true)
  drawSlots(true)
  drawStatsSelected()
}
const instantlyMoveItemList = () => {
  // console.log('equip instantlyMoveItemList', DATA.page, DATA.pos)
  for (let i = 0; i < listGroupContents.children.length; i++) {
    if (i < DATA.page) {
      listGroupContents.children[i].visible = false
    } else {
      listGroupContents.children[i].visible = true
    }
  }
  listGroupContents.position.y = DATA.page * 18
}
const tweenItemList = (up) => {
  setMenuState('equip-tweening-item')

  for (let i = 0; i < DATA.page + 1; i++) {
    listGroupContents.children[i].visible = true
  }
  let from = {y: listGroupContents.position.y}
  let to = {y: up ? listGroupContents.position.y + 18 : listGroupContents.position.y - 18}
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      listGroupContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < DATA.page; i++) {
        listGroupContents.children[i].visible = false
      }
      setMenuState('equip-select-item')
    })
    .start()
}
const selectItem = () => {
  const item = DATA.equipable[DATA.page + DATA.pos]
  const showMateriaMenuOnExit = equipItemOnCharacter(DATA.char, item)
  if (showMateriaMenuOnExit) {
    DATA.showMateriaMenuOnExit = true
  }
  console.log('equip selectItem showMateriaMenuOnExit', showMateriaMenuOnExit)
  // TODO - Switch to materia menu on exitMenu if materia has been removed
  DATA.battleStats = getBattleStatsForChar(DATA.char)
  drawStatsBase()
  drawHeader()
  exitSelectItem()
}
const exitSelectItem = () => {
  DATA.pos = 0
  DATA.page = 0
  drawSelectTypePointer()
  hideList()
  drawInfo()
  drawSlots()
  hideStatsSelected()
  setMenuState('equip-select-type')
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

  if (DATA.showMateriaMenuOnExit && isMateriaMenuAvailable()) { // TODO - Materia menu has to be enabled too
    console.log('equip SHOW MATERIA MENU')
    // fadeInHomeMenu() // Just temp
    loadMateriaMenu(DATA.partyMember)
  } else {
    fadeInHomeMenu()
  }
}
const switchToMateriaMenu = async () => {
  if (isMateriaMenuAvailable()) {
    setMenuState('loading')
    movePointer(POINTERS.pointer1, 0, 0, true)
    await fadeOverlayIn(getMenuBlackOverlay())
    headerDialog.visible = false
    infoDialog.visible = false
    slotsDialog.visible = false
    statsDialog.visible = false
    listDialog.visible = false
    loadMateriaMenu(DATA.partyMember)
  }
}
const isMateriaMenuAvailable = () => {
  return getMenuVisibility()[2]
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
  loadCharacter()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU EQUIP', key, firstPress, state)
  if (state === 'equip-select-type') {
    if (key === KEY.X) {
      console.log('press MAIN MENU EQUIP EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    } else if (key === KEY.UP) {
      selectTypeNavigation(false)
    } else if (key === KEY.DOWN) {
      selectTypeNavigation(true)
    } else if (key === KEY.O) {
      selectType()
    } else if (key === KEY.SQUARE) {
      switchToMateriaMenu()
    } else if (key === KEY.L1) {
      switchPartyMember(-1)
    } else if (key === KEY.R1) {
      switchPartyMember(1)
    }
  }
  if (state === 'equip-select-item') {
    if (key === KEY.X) {
      exitSelectItem()
    } else if (key === KEY.UP) {
      selectItemNavigation(false)
    } else if (key === KEY.DOWN) {
      selectItemNavigation(true)
    } else if (key === KEY.L1) {
      selectItemPageNavigation(false)
    } else if (key === KEY.R1) {
      selectItemPageNavigation(true)
    } else if (key === KEY.O) {
      selectItem()
    }
  }
}
export { loadEquipMenu, keyPress, getGrowthText }

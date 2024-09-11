import TWEEN from '../../assets/tween.esm.js'
import { KEY } from '../interaction/inputs.js'
import { getItemIcon } from '../items/items-module.js'
import {
  addGroupToDialog,
  addImageToDialog,
  addTextToDialog,
  ALIGN,
  closeDialog,
  createDialogBox,
  createItemListNavigation,
  LETTER_COLORS,
  LETTER_TYPES,
  movePointer,
  POINTERS,
  removeGroupChildren,
  showDialog
} from '../menu/menu-box-helper.js'
import { DATA } from './battle-menu-command.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

let listDialog
let listGroup
let listGroupContents
let costDialog
let costGroupContents

const offsets = {
  magic: {
    pos: { x: 42 / 2, y: 380 / 2 },
    yAdj: 32 / 2,
    xAdj: 156 / 2,
    xAdjAll: (108 + 10) / 2
  },
  enemySkills: {
    pos: { x: (42 + 6) / 2, y: 380 / 2 },
    yAdj: 32 / 2,
    xAdj: (156 + 84) / 2
  },
  summon: {
    pos: { x: 112 / 2, y: 380 / 2 },
    yAdj: 32 / 2,
    xAdj: (156 + 84) / 2
  },
  items: {
    pos: { x: (112 - 24) / 2, y: 380 / 2 },
    yAdj: 32 / 2,
    xAdj: (156 + 84) / 2,
    xAdjIcon: 22 / 2,
    xAdjName: 42 / 2,
    xAdjColon: 278 / 2,
    xAdjQuantity: 290 / 2
  }
}
const getTextRowPosition = i => {
  const menu = DATA[DATA.state]
  return {
    x:
      offsets[DATA.state].pos.x +
      (i % menu.cols) * offsets[DATA.state].xAdj -
      8,
    y:
      offsets[DATA.state].pos.y +
      Math.trunc(i / menu.cols) * offsets[DATA.state].yAdj -
      4
  }
}
const drawListPointer = () => {
  const { x, y } = getTextRowPosition(DATA[DATA.state].pos)
  movePointer(POINTERS.pointer1, x - 2, y + 3.5) // Hmm, I think this pointer is too small for battle menus
}
const getCurrentSpell = () => {
  const menu = DATA[DATA.state]
  if (DATA.state === 'items') {
    const inventoryItem =
      window.data.savemap.items[menu.page * menu.cols + menu.pos]
    return inventoryItem.itemId === 0x7f ? undefined : inventoryItem
  }
  return DATA.actor.battleStats.menu[DATA.state][
    menu.page * menu.cols + menu.pos
  ]
}
const updateInfoForSelectedSpell = () => {
  const spell = getCurrentSpell()

  if (spell === undefined) {
    drawInfo()
    return
  }
  if (DATA.state === 'items') {
    drawInfo(window.data.kernel.allItemData[spell.itemId].description)
    return
  }
  const attackData = window.data.kernel.attackData[spell.index]
  removeGroupChildren(costGroupContents)
  if (!spell.enabled) {
    drawMP(DATA.actor.battleStats.mp.current, false)
    drawInfo()
    drawAbilities(false)
  } else {
    drawMP(DATA.actor.battleStats.mp.current, spell.mpCost)
    drawInfo(attackData.description)
    drawAbilities(spell.addedAbilities, spell.uses)
  }
}
const drawMP = (currentMP, mp) => {
  // TODO - Does this alignment change if hp<->mp materia gets 9999 mp?
  // TODO - Should probably put currentMP on the background layer costDialog as it doesn't change
  addTextToDialog(
    costGroupContents,
    `/${('' + currentMP).padStart(3, ' ')}`,
    `cost-amount`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    251 + 25,
    174 + 22,
    0.5
  )
  if (mp === false) return
  addTextToDialog(
    costGroupContents,
    `${('' + mp).padStart(3, ' ')}`,
    `cost-amount`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    251 + 4,
    174 + 22,
    0.5
  )
}
const drawAbilities = (abilities, uses) => {
  if (abilities === false) return
  const displayedAbilities = ['QuadraMagic', 'All']
  for (const [i, abilityType] of displayedAbilities.entries()) {
    const ability = abilities.find(a => a.type === abilityType)
    if (ability && ability.count > 0) {
      addTextToDialog(
        costGroupContents,
        ability.textBattle,
        `ability-${abilityType}-text`,
        LETTER_TYPES.BattleBaseFont,
        LETTER_COLORS.White,
        251 + (16 - 16) / 2,
        174 + (96 - 8 - 16 - 4) / 2 + i * 11,
        0.5,
        null
      )
      addTextToDialog(
        costGroupContents,
        '' + ability.count,
        `ability-${abilityType}-count`,
        LETTER_TYPES.BattleTextStats,
        LETTER_COLORS.White,
        251 + (78 - 16) / 2,
        174 + (96 - 8 - 16 - 4) / 2 + i * 11,
        0.5,
        null
      )
      const times = addImageToDialog(
        costGroupContents,
        'labels',
        'times',
        `ability-${abilityType}-times`,
        251 + (98 + 6) / 2,
        174 + (96 - 8 - 16 - 4) / 2 + i * 11,
        0.5
      )
      times.userData.isText = true
    }
  }
  if (uses !== undefined) {
    const i = 1
    if (uses === 0xff) {
      const infinity = addImageToDialog(
        costGroupContents,
        'labels',
        'infinity',
        `ability-infinity`,
        251 + (98 + 6 - 24) / 2,
        174 + (96 - 8 - 16 - 4) / 2 + i * 11,
        0.5
      )
      infinity.userData.isText = true
    } else {
      addTextToDialog(
        costGroupContents,
        '' + uses,
        `ability-uses`,
        LETTER_TYPES.BattleTextStats,
        LETTER_COLORS.White,
        251 + (78 - 16) / 2,
        174 + (96 - 8 - 16 - 4) / 2 + i * 11,
        0.5,
        null
      )
    }
    const times = addImageToDialog(
      costGroupContents,
      'labels',
      'times',
      `ability-times`,
      251 + (98 + 6) / 2,
      174 + (96 - 8 - 16 - 4) / 2 + i * 11,
      0.5
    )
    times.userData.isText = true
  }
}
const drawInfo = desc => {
  window.currentBattle.ui.battleDescriptions.setText(desc)
}
const drawOneItem = i => {
  const existingItems = drawnList.get(i)

  if (existingItems) {
    for (const item of existingItems) {
      item.visible = true
    }
    return
  }
  if (DATA.state === 'items') {
    // TODO - W-Item decrement after first selection
    const item = window.data.savemap.items[i]
    const itemData = window.data.kernel.allItemData[item.itemId]
    const { x, y } = getTextRowPosition(i)
    // console.log('battleUI spell list', spell, x, y)

    // TODO - Have to validate whether the actor has enough MP + other factors I don't know yet
    if (item.itemId != 0x7f) {
      let color = LETTER_COLORS.White
      if (!itemData.restrictions.includes(DATA.items.restriction)) {
        color = LETTER_COLORS.Gray
      }
      // console.log('battleUI ITEMS position', item, x, offsets.items.xAdjName, offsets.items.xAdjIcon)

      const name = addTextToDialog(
        listGroupContents,
        item.name,
        `item-list-${i}`,
        LETTER_TYPES.BattleBaseFont,
        color,
        x + offsets.items.xAdjName,
        y,
        0.5,
        listDialog.userData.bg.material.clippingPlanes
      )
      name.userData.index = i
      const icon = addImageToDialog(
        listGroupContents,
        'icons-battle',
        getItemIcon(itemData),
        `spell-list-${i}-icon`,
        x + offsets.items.xAdjIcon,
        y,
        0.5,
        null,
        ALIGN.LEFT,
        null,
        listDialog.userData.bg.material.clippingPlanes
      )
      icon.userData.index = i
      const colon = addTextToDialog(
        listGroupContents,
        ':',
        `item-list-${i}-colon`,
        LETTER_TYPES.BattleTextFixed,
        color,
        x + offsets.items.xAdjColon,
        y,
        0.5,
        listDialog.userData.bg.material.clippingPlanes
      )
      colon.userData.index = i
      const quantity = addTextToDialog(
        listGroupContents,
        `${('' + Math.min(99, item.quantity)).padStart(2, '0')}`,
        `item-list-${i}-colon`,
        LETTER_TYPES.BattleTextStats,
        color,
        x + offsets.items.xAdjQuantity,
        y,
        0.5,
        listDialog.userData.bg.material.clippingPlanes
      )
      quantity.userData.index = i

      drawnList.set(i, [name, icon, colon, quantity])
    }
  } else {
    const spell = DATA.actor.battleStats.menu[DATA.state][i]
    const { x, y } = getTextRowPosition(i)
    // console.log('battleUI spell list', spell, x, y)

    // TODO - Have to validate whether the actor has enough MP + other factors I don't know yet
    if (spell.enabled) {
      let color = LETTER_COLORS.White
      if (spell.mpCost > DATA.actor.battleStats.mp.current) {
        color = LETTER_COLORS.Gray
      }

      const name = addTextToDialog(
        listGroupContents,
        spell.name,
        `spell-list-${i}`,
        LETTER_TYPES.BattleBaseFont,
        color,
        x,
        y,
        0.5,
        listDialog.userData.bg.material.clippingPlanes
      )
      name.userData.index = i
      const items = [name]
      const allAbility = spell.addedAbilities.find(a => a.type === 'All')
      if (allAbility && allAbility.count > 0) {
        const allArrow = addImageToDialog(
          listGroupContents,
          'pointers',
          'arrow-right',
          `spell-list-${i}-all`,
          x + offsets[DATA.state].xAdjAll,
          y,
          0.5,
          null,
          ALIGN.LEFT,
          null,
          listDialog.userData.bg.material.clippingPlanes
        )
        allArrow.userData.index = i
        items.push(allArrow)
      }

      drawnList.set(i, items)
    }
  }
}
let drawnList = new Map()
const openSpellMenu = commandContainerGroup => {
  const menu = DATA[DATA.state]
  menu.page = 0
  menu.pos = 0

  // Create list group
  listDialog = createDialogBox({
    // 100 - 20
    id: 20,
    name: 'spell-list',
    w: DATA.state === 'items' ? 320 : 251,
    h: 56,
    x: 0,
    y: 174,
    scene: commandContainerGroup
  })
  listGroup = addGroupToDialog(listDialog, 20)
  listGroupContents = addGroupToDialog(listDialog, 20)

  const drawFrom = menu.page * menu.cols
  const drawToInclusive = drawFrom + menu.cols * menu.rows - 1
  drawnList = new Map()
  window.drawnList = drawnList
  for (let i = drawFrom; i <= drawToInclusive; i++) {
    drawOneItem(i)
  }
  window.listGroupContents = listGroupContents
  // console.log('battleUI spell list actor', DATA.actor)

  createItemListNavigation(
    listGroup,
    DATA.state === 'items' ? 320 - (251 - 243.5) : 243.5,
    38,
    50,
    menu.total / menu.cols,
    menu.rows,
    listDialog.userData.bg.material.clippingPlanes
  )
  window.listDialog = listDialog
  window.listGroup = listGroup

  if (DATA.state !== 'items') {
    // Create cost group
    costDialog = createDialogBox({
      id: 20,
      name: 'spell-cost',
      w: 69,
      h: 56,
      x: 251,
      y: 174,
      scene: commandContainerGroup
    })
    costGroupContents = addGroupToDialog(costDialog, 20)
    const mpNeeded = addImageToDialog(
      costDialog,
      'labels',
      'mp-needed',
      `mp-needed`,
      251 + 16,
      174 + 16,
      0.5,
      null,
      ALIGN.LEFT,
      ALIGN.BOTTOM,
      costDialog.userData.bg.material.clippingPlanes
    )
  }

  // Show all
  showDialog(listDialog)
  if (DATA.state !== 'items') {
    showDialog(costDialog)
  }
  listGroup.userData.slider.userData.moveToPage(menu.page)
  listGroupContents.position.y = menu.page * offsets[DATA.state].yAdj
}

let promiseToResolve
const selectSpell = async () => {
  return new Promise(resolve => {
    promiseToResolve = resolve
    updateInfoForSelectedSpell()
    drawListPointer()
  })
}
const hideNonPageItems = type => {
  const menu = DATA[type]
  const drawFrom = menu.page * menu.cols
  const drawToInclusive = drawFrom + menu.cols * menu.rows - 1
  // console.log('battleUI render hideNonPageItems', drawFrom, drawToInclusive)
  drawnList.forEach((value, key) => {
    const visible = key >= drawFrom && key <= drawToInclusive
    value.forEach(item => (item.visible = visible))
  })
}
const tweenList = (up, state, cb) => {
  DATA.state = 'tween-list'
  for (let i = 0; i < DATA.page + 1; i++) {
    listGroupContents.children[i].visible = true
  }
  const from = { y: listGroupContents.position.y }
  const to = {
    y: up
      ? listGroupContents.position.y + offsets[state].yAdj
      : listGroupContents.position.y - offsets[state].yAdj
  }
  new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      listGroupContents.position.y = from.y
    })
    .onComplete(function () {
      // for (let i = 0; i < DATA.page; i++) {
      //   // TODO - Remove all children that are not within the correct range
      //   listGroupContents.children[i].visible = false
      // }
      hideNonPageItems(state)
      DATA.state = state
      console.log('battleUI tween end', DATA, DATA.state, state)
      cb()
    })
    .start()
}

const listNavigation = delta => {
  const menu = DATA[DATA.state]
  const lastPage = (menu.total - menu.cols * menu.rows) / menu.cols
  const maxPos = menu.cols * menu.rows
  const potential = menu.pos + delta
  if (potential < 0) {
    if (menu.page === 0) {
      // console.log('magic listNavigation on first page - do nothing')
    } else {
      // console.log('magic listNavigation not on first page - PAGE DOWN')
      if (delta === -1) {
        menu.pos = menu.pos + (menu.cols - 1)
        drawListPointer()
      }
      menu.page--

      const drawFrom = menu.page * menu.cols
      const drawToInclusive = drawFrom + menu.rows - 1
      for (let i = drawFrom; i <= drawToInclusive; i++) {
        drawOneItem(i)
      }

      tweenList(false, DATA.state, updateInfoForSelectedSpell)
      listGroup.userData.slider.userData.moveToPage(menu.page)
    }
  } else if (potential >= maxPos) {
    // console.log('magic listNavigation page - is last page??', menu.page, maxPos, maxPage - 7)
    if (menu.page >= lastPage) {
      // console.log('magic listNavigation on last page - do nothing')
    } else {
      // console.log('magic listNavigation not on last page - PAGE UP', delta, delta === 1, menu.pos)
      if (delta === 1) {
        menu.pos = menu.pos - (menu.cols - 1)
        drawListPointer()
      }
      menu.page++

      const drawFrom = (menu.page - 1) * menu.cols + menu.cols * menu.rows
      const drawToInclusive = drawFrom + menu.cols - 1
      for (let i = drawFrom; i <= drawToInclusive; i++) {
        drawOneItem(i)
      }

      tweenList(true, DATA.state, updateInfoForSelectedSpell)
      listGroup.userData.slider.userData.moveToPage(menu.page)
    }
  } else {
    // console.log('magic listNavigation', menu.page, menu.pos, potential)
    menu.pos = potential
    updateInfoForSelectedSpell()
    drawListPointer()
  }
}

const listPageNavigation = up => {
  const menu = DATA[DATA.state]
  const lastPage = (menu.total - menu.cols * menu.rows) / menu.cols

  if (up) {
    menu.page = menu.page + menu.rows
    if (menu.page > lastPage) {
      menu.page = lastPage
    }
  } else {
    menu.page = menu.page - menu.rows
    if (menu.page < 0) {
      menu.page = 0
    }
  }
  console.log('battleUI listPageNavigation', menu, lastPage, menu.page)
  // Update list group positions

  const drawFrom = menu.page * menu.cols
  const drawToInclusive = drawFrom + menu.cols * menu.rows - 1
  for (let i = drawFrom; i <= drawToInclusive; i++) {
    drawOneItem(i)
  }
  hideNonPageItems(DATA.state)

  listGroup.userData.slider.userData.moveToPage(menu.page)
  listGroupContents.position.y = menu.page * offsets[DATA.state].yAdj
  updateInfoForSelectedSpell()
}
const closeSpellDialogs = async () => {
  movePointer(POINTERS.pointer1, -100, -100, true)
  if (costDialog) closeDialog(costDialog)
  await closeDialog(listDialog)
  removeGroupChildren(listDialog)
  if (costDialog) removeGroupChildren(costDialog)
  // Should really remove these listDialog and costDialog too
  listDialog.parent.remove(listDialog)
  listDialog = undefined
  if (costDialog) costDialog.parent.remove(costDialog)
  if (costDialog) costDialog = undefined
}
const handleKeyPressSpell = async key => {
  switch (key) {
    case KEY.UP:
      listNavigation(0 - DATA[DATA.state].cols)
      break
    case KEY.DOWN:
      listNavigation(DATA[DATA.state].cols)
      break
    case KEY.LEFT:
      listNavigation(-1)
      break
    case KEY.RIGHT:
      listNavigation(1)
      break
    case KEY.L1:
      listPageNavigation(false)
      break
    case KEY.R1:
      listPageNavigation(true)
      break
    case KEY.O:
      const spell = getCurrentSpell()
      if (spell === undefined) break
      console.log(
        'battleUI selectSpell',
        spell,
        DATA.actor.battleStats.mp.current
      )
      if (DATA.state === 'items') {
        const itemData = window.data.kernel.allItemData[spell.itemId]
        if (
          !spell.quantity > 0 ||
          !itemData.restrictions.includes(DATA.items.restriction)
        )
          break
      } else {
        if (!spell.enabled || spell.mpCost > DATA.actor.battleStats.mp.current)
          break
      }
      promiseToResolve(spell)
      break
    case KEY.X:
      DATA.state = 'returning'
      // await closeSpellDialogs()
      promiseToResolve(null)
      // DATA.state = 'command'
      // drawCommandCursor()
      // TODO - reinstate command cursor & helper text
      break
    default:
      break
  }
}
export { openSpellMenu, selectSpell, closeSpellDialogs, handleKeyPressSpell }

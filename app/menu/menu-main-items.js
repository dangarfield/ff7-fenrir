import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import { getMenuBlackOverlay, setMenuState, getMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  addCharacterSummary,
  addImageToDialog,
  createItemListNavigation,
  addGroupToDialog,
  removeGroupChildren
} from './menu-box-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { getItemIcon, getKeyItems } from '../items/items-module.js'

// Man, this is a mess. I did this first and have learned a lot since, should could back and redo.
// Although, I did redo the main item list and navigation to render just the displayed 10 items and not using userData
// to store information as the rest of this mess does. Lots learned

const DATA = {
  use: {
    page: 0,
    pos: 0
  },
  selected: {
    page: 0,
    pos: 0
  }
}

let itemActions, itemDesc, itemParty, itemKeyList, itemArrange
let itemKeyListGroup, itemDescGroup
let itemDialog, itemGroup, itemContentsGroup
let char1Group, char2Group, char3Group

const loadItemsMenu = async () => {
  itemActions = await createDialogBox({
    id: 7,
    name: 'itemActions',
    w: 320,
    h: 25.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  addTextToDialog(
    itemActions,
    'Use',
    'items-actions-use',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    20.5,
    14.5,
    0.5
  )
  addTextToDialog(
    itemActions,
    'Arrange',
    'items-actions-arrange',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    67,
    14.5,
    0.5
  )
  addTextToDialog(
    itemActions,
    'Key Items',
    'items-actions-arrange',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    113.5,
    14.5,
    0.5
  )
  itemActions.visible = true

  itemDesc = await createDialogBox({
    id: 5,
    name: 'itemDesc',
    w: 320,
    h: 25.5,
    x: 0,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  itemDesc.visible = true

  itemDescGroup = addGroupToDialog(itemDesc, 15)

  itemParty = await createDialogBox({
    id: 4,
    name: 'itemParty',
    w: 150,
    h: 192.5,
    x: 0,
    y: 48, // 51
    expandInstantly: true,
    noClipping: true
  })
  char1Group = new THREE.Group()
  char1Group.userData = { id: 4, z: 100 - 4 }
  char1Group.position.y = -66
  itemParty.add(char1Group)

  char2Group = new THREE.Group()
  char2Group.userData = { id: 4, z: 100 - 4 }
  char2Group.position.y = -125
  itemParty.add(char2Group)

  char3Group = new THREE.Group()
  char3Group.userData = { id: 4, z: 100 - 4 }
  char3Group.position.y = -185
  itemParty.add(char3Group)
  drawParty()

  itemParty.visible = true

  itemDialog = await createDialogBox({
    id: 6,
    name: 'itemDialog',
    w: 320,
    h: 192.5 + 2,
    x: 0,
    y: 48 - 2,
    expandInstantly: true,
    noClipping: false // TODO - temp
  })
  itemDialog.visible = true
  itemGroup = addGroupToDialog(itemDialog, 16)
  itemContentsGroup = addGroupToDialog(itemDialog, 16)
  itemContentsGroup.userData.bg = itemDialog.userData.bg
  createItemListNavigation(itemGroup, 313, 96, 187, 320, 10)

  itemKeyList = await createDialogBox({
    id: 7,
    name: 'itemKeyList',
    w: 320,
    h: 192.5 + 2,
    x: 0,
    y: 48 - 2,
    expandInstantly: true
  })
  itemKeyList.visible = true
  createItemListNavigation(itemKeyList, 313, 96, 187, 32, 10)
  itemKeyList.userData.slider.visible = false

  itemKeyListGroup = new THREE.Group()
  itemKeyListGroup.position.y = -67.5
  itemKeyListGroup.position.x = 18.5
  itemKeyListGroup.position.z = 100 - itemKeyList.userData.id
  itemKeyList.add(itemKeyListGroup)
  drawKeyItems()

  itemArrange = await createDialogBox({
    id: 3,
    name: 'itemArrange',
    w: 72.5,
    h: 113.5,
    x: 110.5,
    y: 12.5,
    expandInstantly: true,
    noClipping: true
  })
  itemArrange.position.z = 100 - 50
  drawArrangeOptions()
  itemArrange.visible = false
  ACTION_POSITIONS.action = 0
  DATA.use.page = 0
  DATA.use.pos = 0
  // setItempage(DATA.use)
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
  itemActionConfirm()
  await fadeOverlayOut(getMenuBlackOverlay())

  // setMenuState('items-item-select')
}

const drawParty = () => {
  const members = window.data.savemap.party.members
  const charGroups = [char1Group, char2Group, char3Group]
  for (let i = 0; i < members.length; i++) {
    const member = members[i]
    const charGroup = charGroups[i]
    while (charGroup.children.length) {
      charGroup.remove(charGroup.children[0])
    }
    if (member !== 'None') {
      const char = window.data.savemap.characters[member]
      addCharacterSummary(
        charGroup,
        0,
        58,
        0,
        char.name,
        char.status.statusFlags === 'None' ? null : char.status.statusFlags,
        char.level.current,
        char.stats.hp.current,
        char.stats.hp.max,
        char.stats.mp.current,
        char.stats.mp.max
      )
      addImageToDialog(
        charGroup,
        'profiles',
        member,
        `profile-image-${i}`,
        39,
        16.5,
        0.5
      )
    }
  }
  return charGroups
}

const exitMenu = async () => {
  console.log('exitMenu')
  movePointer(POINTERS.pointer1, 0, 0, true)
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  itemActions.visible = false
  const toRemove = [
    itemActions,
    itemDesc,
    itemParty,
    itemDialog,
    itemKeyList,
    itemArrange
  ]
  toRemove.forEach(ele => {
    while (ele.children.length) {
      ele.remove(ele.children[0])
    }
    scene.remove(ele)
  })
  fadeInHomeMenu()
}
const ACTION_POSITIONS = {
  x: [16.5, 63, 109.5],
  y: 20.5,
  action: 0,
  actions: ['Use', 'Arrange', 'Key Items']
}

const itemActionNavigation = up => {
  if (up) {
    ACTION_POSITIONS.action++
  } else {
    ACTION_POSITIONS.action--
  }
  if (ACTION_POSITIONS.action < 0) {
    ACTION_POSITIONS.action = ACTION_POSITIONS.x.length - 1
  } else if (ACTION_POSITIONS.action >= ACTION_POSITIONS.x.length) {
    ACTION_POSITIONS.action = 0
  }
  if (ACTION_POSITIONS.actions[ACTION_POSITIONS.action] === 'Key Items') {
    itemParty.visible = false
    itemDialog.visible = false
    itemKeyList.userData.slider.visible = true
  } else {
    itemParty.visible = true
    itemDialog.visible = true
    itemKeyList.userData.slider.visible = false
  }
  console.log('itemActionNavigation', up, ACTION_POSITIONS)
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
}
const itemActionConfirm = () => {
  const currentAction = ACTION_POSITIONS.actions[ACTION_POSITIONS.action]
  console.log('itemActionConfirm', currentAction)
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y,
    false,
    true
  )
  if (currentAction === 'Use') {
    drawItems()
    drawItemsPointer(DATA.use)
    drawItemInfo(DATA.use)
    setMenuState('items-item-select')
  } else if (currentAction === 'Arrange') {
    showArrangeMenu()
  } else if (currentAction === 'Key Items') {
    selectKeyItems()
  }
}
const getItemPositions = () => {
  return {
    x: 180, // TODO
    y: 62,
    yAdj: 18.5
  }
}
const drawOneItem = (group, i, page, x, y, yAdj) => {
  const item = window.data.savemap.items[i + page]
  if (item.name === '') {
    return
  }
  const itemData = window.data.kernel.allItemData[item.itemId]
  if (itemData.itemId === 127) {
    return
  }
  let color = LETTER_COLORS.Gray
  if (itemData.restrictions.includes('CanBeUsedInMenu')) {
    color = LETTER_COLORS.White
  }
  addTextToDialog(
    group,
    itemData.name,
    `items-list-${i}`,
    LETTER_TYPES.MenuBaseFont,
    color,
    x,
    y + (yAdj * i),
    0.5
  )
  addTextToDialog(
    group,
    ('' + Math.min(99, item.quantity)).padStart(3, ' '),
    `items-count-${i}`,
    LETTER_TYPES.MenuTextStats,
    color,
    x + 88.5,
    y + (yAdj * i),
    0.5
  )
  addTextToDialog(
    group,
    ':',
    `items-count-colon-${i}`,
    LETTER_TYPES.MenuTextFixed,
    color,
    x + 87.5,
    y + (yAdj * i),
    0.5
  )
  addImageToDialog(
    group,
    'icons-menu',
    getItemIcon(itemData),
    `items-icon-${i}`,
    x - 0.5,
    y + (yAdj * i),
    0.5
  )
}
const drawItems = () => {
  // Remove existing itemLiftGroup

  removeGroupChildren(itemContentsGroup)

  const { x, y, yAdj } = getItemPositions()
  // const menu = DATA.menus[DATA.menuCurrent]
  for (let i = 0; i < 10; i++) {
    drawOneItem(itemContentsGroup, i, DATA.use.page, x, y, yAdj)
  }
  itemGroup.userData.slider.userData.moveToPage(DATA.use.page)
  itemContentsGroup.position.y = 0
}
const drawItemsPointer = (POS) => {
  const { x, y, yAdj } = getItemPositions()
  movePointer(
    POINTERS.pointer2,
    x - 17, // TODO - positions
    y + (yAdj * POS.pos) + 2
  )
}
const drawItemsSelectedPointer = () => {
  const pageDiff = DATA.selected.page - DATA.use.page
  const pos = pageDiff + DATA.selected.pos
  if (pos < 0 || pos >= 10) {
    movePointer(POINTERS.pointer3, 0, 0, true)
  } else {
    const { x, y, yAdj } = getItemPositions()
    movePointer(
      POINTERS.pointer3,
      x - 17 - 2, // TODO - positions
      y + (yAdj * pos) + 2 - 2,
      false, true
    )
  }
}

const clearItemDescription = () => {
  removeGroupChildren(itemDescGroup)
}
const drawItemInfo = POS => {
  removeGroupChildren(itemDescGroup)
  const item = window.data.kernel.allItemData[window.data.savemap.items[POS.page + POS.pos].itemId]
  if (item === undefined) {
    return
  }
  addTextToDialog(
    itemDescGroup,
    item.description,
    'item-desciption',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    5.5,
    38,
    0.5
  )
}
const selectItemCancel = () => {
  setMenuState('items-action-select')
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
  movePointer(POINTERS.pointer2, 0, 0, true)
  clearItemDescription()
}
const selectItemConfirm = () => {
  const item = window.data.savemap.items[DATA.use.page + DATA.use.pos]
  console.log('item selectItemConfirm', item)
  // TODO
}

const selectItemNavigation = up => {
  itemNavigation(up, DATA.use)
}
const selectSwapOrderSourceNavigation = up => {
  itemNavigation(up, DATA.use)
}
const selectSwapOrderTargetNavigation = up => {
  itemNavigation(up, DATA.use, drawItemsSelectedPointer)
}
const tweenItemList = (up, state, POS, cb) => {
  setMenuState('loading')
  const subContents = itemContentsGroup
  for (let i = 0; i < POS.page + 1; i++) {
    subContents.children[i].visible = true
  }
  const from = { y: subContents.position.y }
  const to = { y: up ? subContents.position.y + 18.5 : subContents.position.y - 18.5 }
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      subContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < POS.page; i++) {
        subContents.children[i].visible = false
      }
      setMenuState(state)
      cb()
    })
    .start()
}
const itemNavigation = (up, POS, pageChangeCallback) => {
  const maxPage = window.data.savemap.items.length - 10
  const maxPos = 10
  const delta = (up ? 1 : -1)
  const potential = POS.pos + delta

  console.log('item itemNavigation', delta, '-', POS.pos, POS.pos, '->', potential, ':', maxPage, maxPos)

  const { x, y, yAdj } = getItemPositions()

  if (potential < 0) {
    if (POS.page === 0) {
      console.log('item itemNavigation on first page - do nothing')
    } else {
      console.log('item itemNavigation not on first page - PAGE DOWN')
      drawOneItem(itemContentsGroup, -1, POS.page, x, y, yAdj)
      POS.page--
      tweenItemList(false, getMenuState(), POS, drawItems) // Could optimise further
      drawItemInfo(POS)
      if (pageChangeCallback) {
        pageChangeCallback()
      }
    }
  } else if (potential >= maxPos) {
    console.log('item itemNavigation page - is last page??', POS.page, maxPos, maxPage)
    if (POS.page >= maxPage) {
      console.log('item itemNavigation on last page - do nothing')
    } else {
      console.log('item itemNavigation not on last page - PAGE UP', delta, POS.pos)
      drawOneItem(itemContentsGroup, 10, POS.page, x, y, yAdj)
      POS.page++
      tweenItemList(true, getMenuState(), POS, drawItems)
      drawItemInfo(POS)
      if (pageChangeCallback) {
        pageChangeCallback()
      }
    }
  } else {
    console.log('item itemNavigation move pointer only', POS.page, POS.pos, potential)
    POS.pos = potential
    drawItemInfo(POS)
    drawItemsPointer(POS)
  }
}
const selectItemPageNavigation = up => {
  itemPageNavigation(up, DATA.use)
}
const selectSwapOrderSourcePageNavigation = up => {
  itemPageNavigation(up, DATA.use)
}
const selectSwapOrderTargetPageNavigation = up => {
  itemPageNavigation(up, DATA.use)
  drawItemsSelectedPointer()
}
const itemPageNavigation = (up, POS) => {
  const lastPage = window.data.savemap.items.length - 10
  if (up) {
    POS.page = POS.page + 10
    if (POS.page > lastPage) {
      POS.page = lastPage
    }
  } else {
    POS.page = POS.page - 10
    if (POS.page < 0) {
      POS.page = 0
    }
  }
  // Update list group positions
  itemGroup.userData.slider.userData.moveToPage(POS.page)
  drawItems()
  drawItemInfo(POS)
}

const tweenItems = (listGroup, from, to, metadata, resolve) => {
  metadata.tweenInProgress = true
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      listGroup.position.y = from.y
    })
    .onComplete(function () {
      metadata.tweenInProgress = false
      resolve()
    })
    .start()
}

const ARRANGE_POSITIONS = {
  x: 109.5,
  y: new Array(8).fill(null).map((v, i) => 25 + 13 * i),
  offset: { x: -3.5, y: 4 },
  option: 0,
  options: [
    'Customize',
    'Field',
    'Battle',
    'Throw',
    'Type',
    'Name',
    'Most',
    'Least'
  ]
}

const drawArrangeOptions = () => {
  for (let i = 0; i < ARRANGE_POSITIONS.y.length; i++) {
    const y = ARRANGE_POSITIONS.y[i]
    const text = ARRANGE_POSITIONS.options[i]
    addTextToDialog(
      itemArrange,
      text,
      `items-arrange-text-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      ARRANGE_POSITIONS.x,
      y,
      0.5
    )
  }
}
const showArrangeMenu = () => {
  setMenuState('items-arrange-select')
  itemArrange.visible = true
  movePointer(
    POINTERS.pointer2,
    ARRANGE_POSITIONS.x + ARRANGE_POSITIONS.offset.x,
    ARRANGE_POSITIONS.y[ARRANGE_POSITIONS.option] + ARRANGE_POSITIONS.offset.y
  )
}

const selectArrangeCancel = () => {
  itemArrange.visible = false
  setMenuState('items-action-select')
  ARRANGE_POSITIONS.option = 0
  movePointer(
    POINTERS.pointer2,
    ARRANGE_POSITIONS.x,
    ARRANGE_POSITIONS.y[ARRANGE_POSITIONS.option],
    true
  )
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
  //
}
const selectArrangeConfirm = () => {
  const currentOption = ARRANGE_POSITIONS.options[ARRANGE_POSITIONS.option]
  switch (currentOption) {
    case 'Customize':
      selectSwapOrderSource()
      break
    case 'Field':
      sortItemsByRestriction('CanBeUsedInMenu')
      break
    case 'Battle':
      sortItemsByRestriction('CanBeUsedInBattle')
      break
    case 'Throw':
      sortItemsByRestriction('CanBeThrown')
      break
    case 'Type':
      sortItemsByAttribute('itemId')
      break
    case 'Name':
      sortItemsByAttribute('name')
      break
    case 'Most':
      sortItemsByAttribute('quantity', true)
      break
    case 'Least':
      sortItemsByAttribute('quantity')
      break
    default:
      break
  }
}
const sortItemsByAttribute = (attribute, descending) => {
  // Note: This is not correct. See https://github.com/p3k22/FF7-Csharp/blob/main/FF7%20Arrange%20Inventory.cs

  const items = window.data.savemap.items.filter(i => i.itemId !== 127)

  if (items.length > 0 && typeof (items[0][attribute]) === 'string') {
    items.sort((a, b) => descending ? b[attribute].localeCompare(a[attribute]) : a[attribute].localeCompare(b[attribute]))
  } else {
    items.sort((a, b) => descending ? b[attribute] - a[attribute] : a[attribute] - b[attribute])
  }

  window.data.savemap.items = items
  drawItems()
  console.log('item sortItemsByAttribute result', attribute, descending, items)
  selectArrangeCancel()
}
const sortItemsByRestriction = restriction => {
  // Note: This is not correct. See https://github.com/p3k22/FF7-Csharp/blob/main/FF7%20Arrange%20Inventory.cs

  // itemListGroup.userData.items = itemListGroup.userData.items.reverse()
  // itemListGroup.userData.items.sort((item1, item2) => {
  //   if (item1.restrictions.includes(restriction)) {
  //     if (item2.restrictions.includes(restriction)) {
  //       return 0
  //     } else {
  //       return 1
  //     }
  //   } else if (item2.restrictions.includes(restriction)) {
  //     return -1
  //   } else {
  //     return 0
  //   }
  // })
  // itemListGroup.userData.items = itemListGroup.userData.items.reverse()
  // const itemsSimple = itemListGroup.userData.items.map(item => {
  //   return {
  //     itemId: item.itemId,
  //     quantity: item.quantity,
  //     name: item.name
  //   }
  // })

  const yesGroup = []
  const noGroup = []
  for (let i = 0; i < window.data.savemap.items.length; i++) {
    const item = window.data.savemap.items[i]
    const itemData = window.data.kernel.allItemData[item.itemId]
    if (itemData.restrictions.includes(restriction)) {
      yesGroup.push({
        itemId: item.itemId,
        quantity: item.quantity,
        name: item.name
      })
    } else {
      noGroup.push({
        itemId: item.itemId,
        quantity: item.quantity,
        name: item.name
      })
    }
  }
  const itemsSimple = yesGroup.concat(noGroup)

  while (itemsSimple.length < 320) {
    itemsSimple.push({
      itemId: 127,
      quantity: 127,
      name: ''
    })
  }
  window.data.savemap.items = itemsSimple
  drawItems()
  console.log('item sortItemsByRestriction result', itemsSimple)
  selectArrangeCancel()
}
const selectArrangeNavigation = up => {
  if (up) {
    ARRANGE_POSITIONS.option++
  } else {
    ARRANGE_POSITIONS.option--
  }
  if (ARRANGE_POSITIONS.option < 0) {
    ARRANGE_POSITIONS.option = ARRANGE_POSITIONS.y.length - 1
  } else if (ARRANGE_POSITIONS.option >= ARRANGE_POSITIONS.y.length) {
    ARRANGE_POSITIONS.option = 0
  }
  movePointer(
    POINTERS.pointer2,
    ARRANGE_POSITIONS.x + ARRANGE_POSITIONS.offset.x,
    ARRANGE_POSITIONS.y[ARRANGE_POSITIONS.option] + ARRANGE_POSITIONS.offset.y
  )
}
const selectSwapOrderSource = () => {
  console.log('item selectSwapOrderSource')
  setMenuState('items-swap-source')
  DATA.selected.page = 0
  DATA.selected.pos = 0
  movePointer(POINTERS.pointer3, 0, 0, true)
  drawItemsPointer(DATA.use)
  drawItemInfo(DATA.use)
  itemArrange.visible = false
}
const selectSwapOrderSourceCancel = () => {
  selectSwapOrderEnd()
}
const selectSwapOrderSourceConfirm = () => {
  console.log('item selectSwapOrderSourceConfirm', DATA)
  DATA.selected.page = DATA.use.page
  DATA.selected.pos = DATA.use.pos
  drawItemsSelectedPointer(DATA.selected)
  // Change state
  setMenuState('items-swap-target')
}
const selectSwapOrderTargetCancel = () => {
  console.log('item selectSwapOrderTargetCancel')
  selectSwapOrderEnd() // TODO - is this right? or is it just back to swap source selection?
}
const selectSwapOrderTargetConfirm = () => {
  console.log('item selectSwapOrderTargetConfirm', DATA)
  executeSwap(
    DATA.selected.page + DATA.selected.pos,
    DATA.use.page + DATA.use.pos
  )
  selectSwapOrderSource() // Eg go back to swap source selection
}
const executeSwap = (item1Index, item2Index) => {
  const item1 = { ...window.data.savemap.items[item1Index] }
  const item2 = { ...window.data.savemap.items[item2Index] }
  window.data.savemap.items[item1Index] = item2
  window.data.savemap.items[item2Index] = item1
  drawItems()
}
const selectSwapOrderEnd = () => {
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
  movePointer(POINTERS.pointer2, 0, 0, true)
  movePointer(POINTERS.pointer3, 0, 0, true)
  clearItemDescription()
  setMenuState('items-action-select')
}
const KEYITEM_Y_GAP = 18
const KEYDATA = {
  positions: new Array(64).fill(null).map((v, i) => {
    return { x: i % 2 ? 146.5 : 0, y: 0 + Math.floor(i / 2) * KEYITEM_Y_GAP }
  }),
  page: 0,
  pos: 0,
  tweenInProgress: false
}

const drawKeyItems = () => {
  const keyItems = getKeyItems()
  console.log('keyItems', keyItems)

  itemKeyListGroup.userData.items = keyItems
  for (let i = 0; i < keyItems.length; i++) {
    const keyItem = keyItems[i]
    addTextToDialog(
      itemKeyListGroup,
      keyItem.name,
      `items-keylist-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      KEYDATA.positions[i].x,
      KEYDATA.positions[i].y,
      0.5
    )
  }
  setItemKeypage()
  setItemKeySliderPosition()
}
const setItemKeypage = () => {
  const newY = KEYDATA.page * KEYITEM_Y_GAP - 67.5
  itemKeyListGroup.position.y = newY
  for (let i = 0; i < itemKeyListGroup.children.length; i++) {
    const keyItemGroup = itemKeyListGroup.children[i]
    if (i < KEYDATA.page * 2) {
      keyItemGroup.visible = false
    } else {
      keyItemGroup.visible = true
    }
  }
}
const setItemKeySliderPosition = () => {
  itemKeyList.userData.slider.userData.moveToPage(
    KEYDATA.page
  )
}

const setItemKeypos = () => {
  const x = KEYDATA.pos % 2 ? 146.5 : 0
  const y = Math.floor(KEYDATA.pos / 2) * KEYITEM_Y_GAP

  movePointer(
    POINTERS.pointer2,
    x + 18.5 - 6,
    y + 67.5 + 4.5
    // KEYDATA.positions[KEYDATA.pos].x + 18.5 - 6,
    // KEYDATA.positions[KEYDATA.pos].y + 67.5 + 4.5
  )
}
const setItemKeyDescription = () => {
  clearItemDescription()
  const item = itemKeyListGroup.userData.items[KEYDATA.page * 2 + KEYDATA.pos]
  if (item === undefined) {
    return
  }
  addTextToDialog(
    itemDescGroup,
    item.description,
    'item-desciption',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    5.5,
    38,
    0.5
  )
}
const selectKeyItems = () => {
  setMenuState('items-keyitem-select')
  KEYDATA.page = 0
  KEYDATA.pos = 0
  setItemKeypage()
  setItemKeySliderPosition()
  setItemKeypos()
  setItemKeyDescription()
}
const selectKeyItemCancel = () => {
  setMenuState('items-action-select')
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
  movePointer(POINTERS.pointer2, 0, 0, true)
  clearItemDescription()
}
const selectKeyItemConfirm = () => {}
const selectKeyItemNavigation = indexShift => {
  if (KEYDATA.tweenInProgress) {
    return
  }
  let slide = false

  if (indexShift === -1) {
    if (KEYDATA.pos > 0) {
      // Just move cursor
      KEYDATA.pos--
    } else {
      if (KEYDATA.page === 0) {
        // Do nothing
      } else {
        KEYDATA.pos++
        KEYDATA.page--
        slide = true
      }
    }
  }

  if (indexShift === -2) {
    if (KEYDATA.pos > 1) {
      // Just move cursor
      KEYDATA.pos = KEYDATA.pos - 2
    } else {
      if (KEYDATA.page === 0) {
        // Do nothing
      } else {
        KEYDATA.page--
        slide = true
      }
    }
  }

  if (indexShift === 1) {
    if (KEYDATA.pos < 19) {
      // Just move cursor
      KEYDATA.pos++
    } else {
      if (KEYDATA.page === 22) {
        // Do nothing
      } else {
        KEYDATA.pos--
        KEYDATA.page++
        slide = true
      }
    }
  }
  if (indexShift === 2) {
    if (KEYDATA.pos < 18) {
      // Just move cursor
      KEYDATA.pos = KEYDATA.pos + 2
    } else {
      if (KEYDATA.page === 22) {
        // Do nothing
      } else {
        KEYDATA.page++
        slide = true
      }
    }
  }

  console.log('item selectKeyItemNavigation', KEYDATA, slide)
  // if pages dont match, slide
  if (slide) {
    setItemKeySliderPosition()
    const oldY = itemKeyListGroup.position.y
    const newY = KEYDATA.page * KEYITEM_Y_GAP - 67.5
    tweenItems(
      itemKeyListGroup,
      { y: oldY },
      { y: newY },
      KEYDATA,
      function () {
        console.log('item tween finished selectKeyItemNavigation')
        setItemKeypage()
      }
    )
  }

  setItemKeypos()
  setItemKeyDescription()
}
const selectKeyItemPageNavigation = up => {
  if (up) {
    KEYDATA.page = KEYDATA.page + 10
  } else {
    KEYDATA.page = KEYDATA.page - 10
  }
  if (KEYDATA.page < 0) {
    KEYDATA.page = 0
  } else if (KEYDATA.page >= 22) {
    KEYDATA.page = 22
  }

  setItemKeypage()
  setItemKeySliderPosition()
  // setItemKeypos()
  setItemKeyDescription()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU ITEMS', key, firstPress, state)
  if (state === 'items-action-select') {
    if (key === KEY.X) {
      exitMenu()
    } else if (key === KEY.O) {
      itemActionConfirm()
    } else if (key === KEY.LEFT) {
      itemActionNavigation(false)
    } else if (key === KEY.RIGHT) {
      itemActionNavigation(true)
    }
  }
  if (state === 'items-item-select') {
    if (key === KEY.X) {
      selectItemCancel()
    } else if (key === KEY.O) {
      selectItemConfirm()
    } else if (key === KEY.UP) {
      selectItemNavigation(false)
    } else if (key === KEY.DOWN) {
      selectItemNavigation(true)
    } else if (key === KEY.L1) {
      selectItemPageNavigation(false)
    } else if (key === KEY.R1) {
      selectItemPageNavigation(true)
    }
  }
  if (state === 'items-arrange-select') {
    if (key === KEY.X) {
      selectArrangeCancel()
    } else if (key === KEY.O) {
      selectArrangeConfirm()
    } else if (key === KEY.UP) {
      selectArrangeNavigation(false)
    } else if (key === KEY.DOWN) {
      selectArrangeNavigation(true)
    }
  }
  if (state === 'items-swap-source') {
    if (key === KEY.X) {
      selectSwapOrderSourceCancel()
    } else if (key === KEY.O) {
      selectSwapOrderSourceConfirm()
    } else if (key === KEY.UP) {
      selectSwapOrderSourceNavigation(false)
    } else if (key === KEY.DOWN) {
      selectSwapOrderSourceNavigation(true)
    } else if (key === KEY.L1) {
      selectSwapOrderSourcePageNavigation(false)
    } else if (key === KEY.R1) {
      selectSwapOrderSourcePageNavigation(true)
    }
  }
  if (state === 'items-swap-target') {
    if (key === KEY.X) {
      selectSwapOrderTargetCancel()
    } else if (key === KEY.O) {
      selectSwapOrderTargetConfirm()
    } else if (key === KEY.UP) {
      selectSwapOrderTargetNavigation(false)
    } else if (key === KEY.DOWN) {
      selectSwapOrderTargetNavigation(true)
    } else if (key === KEY.L1) {
      selectSwapOrderTargetPageNavigation(false)
    } else if (key === KEY.R1) {
      selectSwapOrderTargetPageNavigation(true)
    }
  }
  if (state === 'items-keyitem-select') {
    if (key === KEY.X) {
      selectKeyItemCancel()
    } else if (key === KEY.O) {
      selectKeyItemConfirm()
    } else if (key === KEY.LEFT) {
      selectKeyItemNavigation(-1)
    } else if (key === KEY.RIGHT) {
      selectKeyItemNavigation(1)
    } else if (key === KEY.UP) {
      selectKeyItemNavigation(-2)
    } else if (key === KEY.DOWN) {
      selectKeyItemNavigation(2)
    } else if (key === KEY.L1) {
      selectKeyItemPageNavigation(false)
    } else if (key === KEY.R1) {
      selectKeyItemPageNavigation(true)
    }
  }
}
export { loadItemsMenu, keyPress }

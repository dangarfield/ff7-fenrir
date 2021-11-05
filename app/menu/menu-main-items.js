import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import { getMenuBlackOverlay, setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  createPointer,
  fadeOverlayOut,
  fadeOverlayIn,
  addCharacterSummary,
  addImageToDialog,
  createItemListNavigation
} from './menu-box-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY, getActiveInputs } from '../interaction/inputs.js'
import { getItemIcon, getKeyItems } from '../items/items-module.js'

let itemActions, itemDesc, itemParty, itemList, itemKeyList, itemArrange
let itemListGroup, itemKeyListGroup, itemDescGroup
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
  window.itemActions = itemActions

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
  window.itemDesc = itemDesc

  itemDescGroup = new THREE.Group()
  itemDescGroup.userData = { id: 5, z: 100 - 5 }
  itemDescGroup.position.x = 5.5
  itemDescGroup.position.y = -38
  itemDesc.add(itemDescGroup)

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
  window.itemParty = itemParty

  itemList = await createDialogBox({
    id: 6,
    name: 'itemList',
    w: 320,
    h: 192.5 + 2,
    x: 0,
    y: 48 - 2,
    expandInstantly: true
  })
  itemList.visible = true
  window.itemList = itemList
  createItemListNavigation(itemList, 313, 96, 187, 320, 10)

  itemListGroup = new THREE.Group()
  itemListGroup.position.y = -60
  itemListGroup.position.x = 160
  itemListGroup.position.z = 100 - itemList.userData.id
  itemList.add(itemListGroup)
  window.itemListGroup = itemListGroup
  drawItems()

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
  window.itemKeyList = itemKeyList
  createItemListNavigation(itemKeyList, 313, 96, 187, 32, 10)
  itemKeyList.userData.slider.visible = false

  itemKeyListGroup = new THREE.Group()
  itemKeyListGroup.position.y = -67.5
  itemKeyListGroup.position.x = 18.5
  itemKeyListGroup.position.z = 100 - itemKeyList.userData.id
  itemKeyList.add(itemKeyListGroup)
  window.itemKeyListGroup = itemKeyListGroup
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
  drawArrangeOptions()
  itemArrange.visible = false
  window.itemArrange = itemArrange
  ACTION_POSITIONS.action = 0
  ITEM_POSITIONS.use.pagePosition = 0
  ITEM_POSITIONS.use.cursorPosition = 0
  setItemPagePosition(ITEM_POSITIONS.use)
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
  await fadeOverlayOut(getMenuBlackOverlay())

  setMenuState('items-action-select')
  itemActionConfirm()
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
    itemList,
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
const ITEM_Y_GAP = 18.5
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
    itemList.visible = false
    itemKeyList.userData.slider.visible = true
  } else {
    itemParty.visible = true
    itemList.visible = true
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
    movePointer(
      POINTERS.pointer2,
      ITEM_POSITIONS.x,
      ITEM_POSITIONS.y[ITEM_POSITIONS.use.cursorPosition] + 2
    )
    setItemDescription(ITEM_POSITIONS.use)
    setMenuState('items-item-select')
    setItemSliderPosition(ITEM_POSITIONS.use)
    setItemPagePosition(ITEM_POSITIONS.use)
  } else if (currentAction === 'Arrange') {
    showArrangeMenu()
  } else if (currentAction === 'Key Items') {
    selectKeyItems()
  }
}
const drawItems = async () => {
  // Remove existing itemLiftGroup
  while (itemListGroup.children.length) {
    itemListGroup.remove(itemListGroup.children[0])
  }

  itemListGroup.userData.items = []
  itemListGroup.userData.bg = itemList.userData.bg

  for (let i = 0; i < window.data.savemap.items.length; i++) {
    const item = window.data.savemap.items[i]
    if (item.name === '') {
      continue
    }
    const itemData = { ...window.data.kernel.allItemData[item.itemId] }
    itemData.show = true
    itemData.useable = false
    itemData.quantity = item.quantity
    let color = LETTER_COLORS.Gray
    if (item.itemId === 127) {
      itemData.show = false
    }
    if (itemData.restrictions.includes('CanBeUsedInMenu')) {
      itemData.useable = true
      color = LETTER_COLORS.White
    }
    itemListGroup.userData.items.push(itemData)
    addTextToDialog(
      itemListGroup,
      itemData.name,
      `items-list-${i}`,
      LETTER_TYPES.MenuBaseFont,
      color,
      18.5,
      ITEM_Y_GAP * i,
      0.5
    )
    addTextToDialog(
      itemListGroup,
      ('' + Math.min(99, itemData.quantity)).padStart(3, ' '),
      `items-count-${i}`,
      LETTER_TYPES.MenuTextStats,
      color,
      107,
      ITEM_Y_GAP * i,
      0.5
    )
    addTextToDialog(
      itemListGroup,
      ':',
      `items-count-colon-${i}`,
      LETTER_TYPES.MenuTextFixed,
      color,
      106,
      ITEM_Y_GAP * i + 1,
      0.5
    )
    // await addTextToDialog(
    //   itemActions,
    //   'Arrange',
    //   'items-actions-arrange',
    //   LETTER_TYPES.MenuBaseFont,
    //   LETTER_COLORS.White,
    //   67,
    //   14.5,
    //   0.5
    // )
    addImageToDialog(
      itemListGroup,
      'icons-menu',
      getItemIcon(itemData),
      `items-icon-${i}`,
      18,
      ITEM_Y_GAP * i,
      0.5
    )
  }
}
const ITEM_POSITIONS = {
  x: 159,
  y: new Array(10).fill(null).map((v, i) => 62 + 18.5 * i),
  use: {
    pagePosition: 0,
    cursorPosition: 0
  },
  swapSource: {
    pagePosition: 0,
    cursorPosition: 0
  },
  swapTarget: {
    pagePosition: 0,
    cursorPosition: 0
  },
  tweenInProgress: false
}
const clearItemDescription = () => {
  while (itemDescGroup.children.length) {
    itemDescGroup.remove(itemDescGroup.children[0])
  }
}
const setItemDescription = POS => {
  clearItemDescription()
  const item =
    itemListGroup.userData.items[POS.pagePosition + POS.cursorPosition]
  if (item === undefined) {
    return
  }
  addTextToDialog(
    itemDescGroup,
    item.description,
    'item-desciption',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    0,
    0,
    0.5
  )
}
const setItemPagePosition = POS => {
  const newY = POS.pagePosition * ITEM_Y_GAP - 60
  itemListGroup.position.y = newY
}
const setItemSliderPosition = POS => {
  itemList.userData.slider.userData.moveToPage(POS.pagePosition)
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
const selectItemConfirm = () => {}

const selectItemNavigation = up => {
  itemNavigation(up, ITEM_POSITIONS.use)
}
const selectSwapOrderSourceNavigation = up => {
  itemNavigation(up, ITEM_POSITIONS.swapSource)
}
const selectSwapOrderTargetNavigation = up => {
  itemNavigation(up, ITEM_POSITIONS.swapTarget)
}
const itemNavigation = (up, POS) => {
  if (ITEM_POSITIONS.tweenInProgress) {
    return
  }
  if (up) {
    const cursorAtBottom = POS.cursorPosition === 9
    const isLastPage = POS.pagePosition === 310
    if (cursorAtBottom && isLastPage) {
      // Do nothing
      console.log('item selectItemNavigation - up do nothing')
    } else if (cursorAtBottom) {
      // Shift page up
      POS.pagePosition++
      console.log('item selectItemNavigation - up shift page')
      const oldY = itemListGroup.position.y
      const newY = POS.pagePosition * ITEM_Y_GAP - 60
      tweenItems(
        itemListGroup,
        { y: oldY },
        { y: newY },
        ITEM_POSITIONS,
        function () {
          // Very jagged...
          if (up && getActiveInputs().up) {
            selectItemNavigation(up)
          } else if (!up && getActiveInputs().down) {
            selectItemNavigation(up)
          }
        }
      )
      // itemListGroup.position.y = newY
      setItemSliderPosition(POS)
    } else {
      // Move pointer
      POS.cursorPosition++
      console.log('item selectItemNavigation - up shift cursor')
      movePointer(
        POINTERS.pointer2,
        ITEM_POSITIONS.x,
        ITEM_POSITIONS.y[POS.cursorPosition] + 2
      )
    }
  } else {
    const cursorAtTop = POS.cursorPosition === 0
    const isFirstPage = POS.pagePosition === 0
    if (cursorAtTop && isFirstPage) {
      // Do nothing
      console.log('item selectItemNavigation - down do nothing')
    } else if (cursorAtTop) {
      // Shift page down
      POS.pagePosition--
      console.log('item selectItemNavigation - down shift page')
      const oldY = itemListGroup.position.y
      const newY = POS.pagePosition * ITEM_Y_GAP - 60
      tweenItems(
        itemListGroup,
        { y: oldY },
        { y: newY },
        ITEM_POSITIONS,
        function () {
          // Very jagged...
          if (up && getActiveInputs().up) {
            selectItemNavigation(up)
          } else if (!up && getActiveInputs().down) {
            selectItemNavigation(up)
          }
        }
      )
      // itemListGroup.position.y = newY
      setItemSliderPosition(POS)
    } else {
      // Move pointer
      POS.cursorPosition--
      console.log('item selectItemNavigation - down shift cursor')
      movePointer(
        POINTERS.pointer2,
        ITEM_POSITIONS.x,
        ITEM_POSITIONS.y[POS.cursorPosition] + 2
      )
    }
  }
  console.log(
    'item selectItemNavigation',
    up,
    POS.cursorPosition,
    POS.pagePosition
  )

  // set description
  setItemDescription(POS)
}
const selectItemPageNavigation = up => {
  itemPageNavigation(up, ITEM_POSITIONS.use)
}
const selectSwapOrderSourcePageNavigation = up => {
  itemPageNavigation(up, ITEM_POSITIONS.swapSource)
}
const selectSwapOrderTargetPageNavigation = up => {
  itemPageNavigation(up, ITEM_POSITIONS.swapTarget)
}
const itemPageNavigation = (up, POS) => {
  if (up) {
    POS.pagePosition = POS.pagePosition + 10
  } else {
    POS.pagePosition = POS.pagePosition - 10
  }
  if (POS.pagePosition < 0) {
    POS.pagePosition = 0
  } else if (POS.pagePosition >= 310) {
    POS.pagePosition = 310
  }
  const newY = POS.pagePosition * ITEM_Y_GAP - 60
  itemListGroup.position.y = newY
  setItemDescription(POS)
  setItemSliderPosition(POS)
  console.log(
    'item selectItemPageNavigation',
    up,
    POS.cursorPosition,
    POS.pagePosition
  )
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

  if (
    itemListGroup.userData.items.length > 0 &&
    typeof itemListGroup.userData.items[0][attribute] === 'string'
  ) {
    itemListGroup.userData.items.sort((a, b) =>
      a[attribute].localeCompare(b[attribute])
    )
  } else {
    console.log(
      'item sortItemsByAttribute number',
      attribute,
      itemListGroup.userData.items[0][attribute],
      itemListGroup.userData.items[1][attribute],
      itemListGroup.userData.items[0][attribute] <
        itemListGroup.userData.items[1][attribute]
    )
    if (!descending) {
      itemListGroup.userData.items.sort((a, b) => {
        const res = a[attribute] - b[attribute]
        if (res === 0) {
          return a.itemId - b.itemId
        } else {
          return res
        }
      })
    } else {
      itemListGroup.userData.items.sort((a, b) => {
        const res = b[attribute] - a[attribute]
        if (res === 0) {
          return a.itemId - b.itemId
        } else {
          return res
        }
      })
    }
  }

  const itemsSimple = itemListGroup.userData.items.map(item => {
    return {
      itemId: item.itemId,
      quantity: item.quantity,
      name: item.name
    }
  })
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
  for (let i = 0; i < itemListGroup.userData.items.length; i++) {
    const item = itemListGroup.userData.items[i]
    if (item.restrictions.includes(restriction)) {
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
const selectSwapOrderSource = (page, cursor) => {
  console.log('item selectSwapOrderSource', page, cursor)
  setMenuState('items-swap-source')
  ITEM_POSITIONS.swapSource.pagePosition = page !== undefined ? page : 0
  ITEM_POSITIONS.swapSource.cursorPosition = cursor !== undefined ? cursor : 0
  movePointer(
    POINTERS.pointer2,
    ITEM_POSITIONS.x,
    ITEM_POSITIONS.y[ITEM_POSITIONS.swapSource.cursorPosition] + 2
  )
  removeTemporarySwapPointer()
  setItemDescription(ITEM_POSITIONS.swapSource)
  setItemSliderPosition(ITEM_POSITIONS.swapSource)
  setItemPagePosition(ITEM_POSITIONS.swapSource)
  itemArrange.visible = false
}
const selectSwapOrderSourceCancel = () => {
  selectSwapOrderEnd()
}
const selectSwapOrderSourceConfirm = () => {
  console.log('item selectSwapOrderSourceConfirm', ITEM_POSITIONS)
  setMenuState('items-swap-target')
  ITEM_POSITIONS.swapTarget.pagePosition =
    ITEM_POSITIONS.swapSource.pagePosition
  ITEM_POSITIONS.swapTarget.cursorPosition =
    ITEM_POSITIONS.swapSource.cursorPosition
  movePointer(
    POINTERS.pointer2,
    ITEM_POSITIONS.x,
    ITEM_POSITIONS.y[ITEM_POSITIONS.swapTarget.cursorPosition] + 2
  )
  setItemDescription(ITEM_POSITIONS.swapTarget)
  setItemSliderPosition(ITEM_POSITIONS.swapTarget)
  setItemPagePosition(ITEM_POSITIONS.swapTarget)
  addTemporarySwapPointer()
}
const addTemporarySwapPointer = () => {
  const listPointer = createPointer(itemListGroup)
  itemListGroup.userData.swapPointer = listPointer
  movePointer(
    itemListGroup.userData.swapPointer,
    -4,
    ITEM_POSITIONS.y[ITEM_POSITIONS.swapSource.cursorPosition] -
      62.5 +
      ITEM_POSITIONS.swapSource.pagePosition * ITEM_Y_GAP,
    false,
    true
  )
  for (let i = 0; i < itemListGroup.userData.swapPointer.children.length; i++) {
    const child = itemListGroup.userData.swapPointer.children[i]
    child.material.clippingPlanes =
      itemListGroup.userData.bg.material.clippingPlanes
  }
}
const removeTemporarySwapPointer = () => {
  if (itemListGroup.userData.swapPointer) {
    movePointer(itemListGroup.userData.swapPointer, 0, 0, true, false)
    itemListGroup.remove(itemListGroup.userData.swapPointer)
    delete itemListGroup.userData.swapPointer
  }
}
const selectSwapOrderTargetCancel = () => {
  console.log('item selectSwapOrderTargetCancel')
  selectSwapOrderEnd()
}
const selectSwapOrderTargetConfirm = () => {
  console.log('item selectSwapOrderTargetConfirm', ITEM_POSITIONS)
  executeSwap(
    ITEM_POSITIONS.swapSource.pagePosition +
      ITEM_POSITIONS.swapSource.cursorPosition,
    ITEM_POSITIONS.swapTarget.pagePosition +
      ITEM_POSITIONS.swapTarget.cursorPosition
  )
  selectSwapOrderSource(
    ITEM_POSITIONS.swapTarget.pagePosition,
    ITEM_POSITIONS.swapTarget.cursorPosition
  )
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
  removeTemporarySwapPointer()
  clearItemDescription()
  setItemSliderPosition(ITEM_POSITIONS.use)
  setItemPagePosition(ITEM_POSITIONS.use)
  setMenuState('items-action-select')
}
const KEYITEM_Y_GAP = 18
const KEYITEM_POSITIONS = {
  positions: new Array(64).fill(null).map((v, i) => {
    return { x: i % 2 ? 146.5 : 0, y: 0 + Math.floor(i / 2) * KEYITEM_Y_GAP }
  }),
  pagePosition: 0,
  cursorPosition: 0,
  tweenInProgress: false
}
window.KEYITEM_POSITIONS = KEYITEM_POSITIONS
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
      KEYITEM_POSITIONS.positions[i].x,
      KEYITEM_POSITIONS.positions[i].y,
      0.5
    )
  }
  setItemKeyPagePosition()
  setItemKeySliderPosition()
}
const setItemKeyPagePosition = () => {
  const newY = KEYITEM_POSITIONS.pagePosition * KEYITEM_Y_GAP - 67.5
  itemKeyListGroup.position.y = newY
  for (let i = 0; i < itemKeyListGroup.children.length; i++) {
    const keyItemGroup = itemKeyListGroup.children[i]
    if (i < KEYITEM_POSITIONS.pagePosition * 2) {
      keyItemGroup.visible = false
    } else {
      keyItemGroup.visible = true
    }
  }
}
const setItemKeySliderPosition = () => {
  itemKeyList.userData.slider.userData.moveToPage(
    KEYITEM_POSITIONS.pagePosition
  )
}

const setItemKeyCursorPosition = () => {
  const x = KEYITEM_POSITIONS.cursorPosition % 2 ? 146.5 : 0
  const y = Math.floor(KEYITEM_POSITIONS.cursorPosition / 2) * KEYITEM_Y_GAP

  movePointer(
    POINTERS.pointer2,
    x + 18.5 - 6,
    y + 67.5 + 4.5
    // KEYITEM_POSITIONS.positions[KEYITEM_POSITIONS.cursorPosition].x + 18.5 - 6,
    // KEYITEM_POSITIONS.positions[KEYITEM_POSITIONS.cursorPosition].y + 67.5 + 4.5
  )
}
const setItemKeyDescription = () => {
  clearItemDescription()
  const item = itemKeyListGroup.userData.items[KEYITEM_POSITIONS.pagePosition * 2 + KEYITEM_POSITIONS.cursorPosition]
  if (item === undefined) {
    return
  }
  addTextToDialog(
    itemDescGroup,
    item.description,
    'item-desciption',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    0,
    0,
    0.5
  )
}
const selectKeyItems = () => {
  setMenuState('items-keyitem-select')
  KEYITEM_POSITIONS.pagePosition = 0
  KEYITEM_POSITIONS.cursorPosition = 0
  setItemKeyPagePosition()
  setItemKeySliderPosition()
  setItemKeyCursorPosition()
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
  if (KEYITEM_POSITIONS.tweenInProgress) {
    return
  }
  let slide = false

  if (indexShift === -1) {
    if (KEYITEM_POSITIONS.cursorPosition > 0) {
      // Just move cursor
      KEYITEM_POSITIONS.cursorPosition--
    } else {
      if (KEYITEM_POSITIONS.pagePosition === 0) {
        // Do nothing
      } else {
        KEYITEM_POSITIONS.cursorPosition++
        KEYITEM_POSITIONS.pagePosition--
        slide = true
      }
    }
  }

  if (indexShift === -2) {
    if (KEYITEM_POSITIONS.cursorPosition > 1) {
      // Just move cursor
      KEYITEM_POSITIONS.cursorPosition = KEYITEM_POSITIONS.cursorPosition - 2
    } else {
      if (KEYITEM_POSITIONS.pagePosition === 0) {
        // Do nothing
      } else {
        KEYITEM_POSITIONS.pagePosition--
        slide = true
      }
    }
  }

  if (indexShift === 1) {
    if (KEYITEM_POSITIONS.cursorPosition < 19) {
      // Just move cursor
      KEYITEM_POSITIONS.cursorPosition++
    } else {
      if (KEYITEM_POSITIONS.pagePosition === 22) {
        // Do nothing
      } else {
        KEYITEM_POSITIONS.cursorPosition--
        KEYITEM_POSITIONS.pagePosition++
        slide = true
      }
    }
  }
  if (indexShift === 2) {
    if (KEYITEM_POSITIONS.cursorPosition < 18) {
      // Just move cursor
      KEYITEM_POSITIONS.cursorPosition = KEYITEM_POSITIONS.cursorPosition + 2
    } else {
      if (KEYITEM_POSITIONS.pagePosition === 22) {
        // Do nothing
      } else {
        KEYITEM_POSITIONS.pagePosition++
        slide = true
      }
    }
  }

  console.log('item selectKeyItemNavigation', KEYITEM_POSITIONS, slide)
  // if pagePositions dont match, slide
  if (slide) {
    setItemKeySliderPosition()
    const oldY = itemKeyListGroup.position.y
    const newY = KEYITEM_POSITIONS.pagePosition * KEYITEM_Y_GAP - 67.5
    tweenItems(
      itemKeyListGroup,
      { y: oldY },
      { y: newY },
      KEYITEM_POSITIONS,
      function () {
        console.log('item tween finished selectKeyItemNavigation')
        setItemKeyPagePosition()
      }
    )
  }

  setItemKeyCursorPosition()
  setItemKeyDescription()
}
const selectKeyItemPageNavigation = up => {
  if (up) {
    KEYITEM_POSITIONS.pagePosition = KEYITEM_POSITIONS.pagePosition + 10
  } else {
    KEYITEM_POSITIONS.pagePosition = KEYITEM_POSITIONS.pagePosition - 10
  }
  if (KEYITEM_POSITIONS.pagePosition < 0) {
    KEYITEM_POSITIONS.pagePosition = 0
  } else if (KEYITEM_POSITIONS.pagePosition >= 22) {
    KEYITEM_POSITIONS.pagePosition = 22
  }

  setItemKeyPagePosition()
  setItemKeySliderPosition()
  // setItemKeyCursorPosition()
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

import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import { getMenuState, setMenuState } from './menu-module.js'
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
  createItemListNavigation
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY, getActiveInputs } from '../interaction/inputs.js'
import { getItemIcon } from '../items/items-module.js'

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
  await addTextToDialog(
    itemActions,
    'Use',
    'items-actions-use',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    20.5,
    14.5,
    0.5
  )
  await addTextToDialog(
    itemActions,
    'Arrange',
    'items-actions-arrange',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    67,
    14.5,
    0.5
  )
  await addTextToDialog(
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
    y: 48, //51
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
  window.itemKeyList = itemList

  itemKeyListGroup = new THREE.Group()
  itemKeyListGroup.position.y = -60
  itemKeyListGroup.position.x = 160
  itemKeyListGroup.position.z = 100 - itemKeyList.userData.id
  itemKeyList.add(itemKeyListGroup)
  window.itemKeyListGroup = itemKeyListGroup

  itemArrange = await createDialogBox({
    id: 3,
    name: 'itemArrange',
    w: 70,
    h: 150,
    x: 120,
    y: 18,
    expandInstantly: true,
    noClipping: true
  })
  // itemArrange.visible = true
  window.itemArrange = itemArrange
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
  await fadeOverlayOut(getHomeBlackOverlay())

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
  await fadeOverlayIn(getHomeBlackOverlay())
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
  } else {
    itemParty.visible = true
    itemList.visible = true
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
      ITEM_POSITIONS.y[ITEM_POSITIONS.cursorPosition]
    )
    setItemDescription()
    setMenuState('items-item-select')
    setItemSliderPosition()
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
      ('' + Math.max(99, itemData.quantity)).padStart(3, ' '),
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
  pagePosition: 0,
  cursorPosition: 0,
  tweenInProgress: false
}
const clearItemDescription = () => {
  while (itemDescGroup.children.length) {
    itemDescGroup.remove(itemDescGroup.children[0])
  }
}
const setItemDescription = () => {
  clearItemDescription()
  const item =
    itemListGroup.userData.items[
      ITEM_POSITIONS.pagePosition + ITEM_POSITIONS.cursorPosition
    ]
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
const setItemSliderPosition = () => {
  itemList.userData.slider.userData.moveToPage(ITEM_POSITIONS.pagePosition)
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
  if (ITEM_POSITIONS.tweenInProgress) {
    return
  }
  if (up) {
    const cursorAtBottom = ITEM_POSITIONS.cursorPosition === 9
    const isLastPage = ITEM_POSITIONS.pagePosition === 310
    if (cursorAtBottom && isLastPage) {
      // Do nothing
      console.log('item selectItemNavigation - up do nothing')
    } else if (cursorAtBottom) {
      // Shift page up
      ITEM_POSITIONS.pagePosition++
      console.log('item selectItemNavigation - up shift page')
      const oldY = itemListGroup.position.y
      const newY = ITEM_POSITIONS.pagePosition * ITEM_Y_GAP - 60
      tweenItems(itemListGroup, { y: oldY }, { y: newY }, ITEM_POSITIONS, up)
      // itemListGroup.position.y = newY
      setItemSliderPosition()
    } else {
      // Move pointer
      ITEM_POSITIONS.cursorPosition++
      console.log('item selectItemNavigation - up shift cursor')
      movePointer(
        POINTERS.pointer2,
        ITEM_POSITIONS.x,
        ITEM_POSITIONS.y[ITEM_POSITIONS.cursorPosition]
      )
    }
  } else {
    const cursorAtTop = ITEM_POSITIONS.cursorPosition === 0
    const isFirstPage = ITEM_POSITIONS.pagePosition === 0
    if (cursorAtTop && isFirstPage) {
      // Do nothing
      console.log('item selectItemNavigation - down do nothing')
    } else if (cursorAtTop) {
      // Shift page down
      ITEM_POSITIONS.pagePosition--
      console.log('item selectItemNavigation - down shift page')
      const oldY = itemListGroup.position.y
      const newY = ITEM_POSITIONS.pagePosition * ITEM_Y_GAP - 60
      tweenItems(itemListGroup, { y: oldY }, { y: newY }, ITEM_POSITIONS, up)
      // itemListGroup.position.y = newY
      setItemSliderPosition()
    } else {
      // Move pointer
      ITEM_POSITIONS.cursorPosition--
      console.log('item selectItemNavigation - down shift cursor')
      movePointer(
        POINTERS.pointer2,
        ITEM_POSITIONS.x,
        ITEM_POSITIONS.y[ITEM_POSITIONS.cursorPosition]
      )
    }
  }
  console.log(
    'item selectItemNavigation',
    up,
    ITEM_POSITIONS.cursorPosition,
    ITEM_POSITIONS.pagePosition
  )

  // set description
  setItemDescription()
}
const selectItemPageNavigation = up => {
  if (up) {
    ITEM_POSITIONS.pagePosition = ITEM_POSITIONS.pagePosition + 10
  } else {
    ITEM_POSITIONS.pagePosition = ITEM_POSITIONS.pagePosition - 10
  }
  if (ITEM_POSITIONS.pagePosition < 0) {
    ITEM_POSITIONS.pagePosition = 0
  } else if (ITEM_POSITIONS.pagePosition >= 310) {
    ITEM_POSITIONS.pagePosition = 310
  }
  const newY = ITEM_POSITIONS.pagePosition * ITEM_Y_GAP - 60
  itemListGroup.position.y = newY
  setItemDescription()
  setItemSliderPosition()
  console.log(
    'item selectItemPageNavigation',
    up,
    ITEM_POSITIONS.cursorPosition,
    ITEM_POSITIONS.pagePosition
  )
}

const tweenItems = (listGroup, from, to, metadata, up) => {
  metadata.tweenInProgress = true
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      listGroup.position.y = from.y
    })
    .onComplete(function () {
      metadata.tweenInProgress = false
      // Very jagged...
      if (up && getActiveInputs().up) {
        selectItemNavigation(up)
      } else if (!up && getActiveInputs().down) {
        selectItemNavigation(up)
      }
    })
    .start()
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
}
export { loadItemsMenu, keyPress }

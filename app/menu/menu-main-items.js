import * as THREE from '../../assets/threejs-r118/three.module.js'
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
  addImageToDialog
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { scene } from '../field/field-ortho-scene.js'

let itemActions, itemDesc, itemParty, itemList, itemKeyList, itemArrange
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
    h: 192.5 + 2, //205
    x: 0, //135
    y: 48 - 2, //43
    expandInstantly: true
  })
  itemList.visible = true
  window.itemList = itemList

  itemKeyList = await createDialogBox({
    id: 7,
    name: 'itemKeyList',
    w: 320,
    h: 192.5 + 2, //205
    x: 0, //135
    y: 48 - 2, //43
    expandInstantly: true
  })
  itemKeyList.visible = true
  window.itemKeyList = itemList

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
  // 675 of 1441
  await fadeOverlayOut(getHomeBlackOverlay())

  setMenuState('items-action-select')
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
  } else if (ACTION_POSITIONS.action > ACTION_POSITIONS.x.length) {
    ACTION_POSITIONS.action = 0
  }

  console.log('itemActionNavigation', up, ACTION_POSITIONS)
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
}
const itemActionConfirm = () => {}
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
}
export { loadItemsMenu, keyPress }

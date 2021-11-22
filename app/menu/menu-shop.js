import { getMenuBlackOverlay, setMenuState, resolveMenuPromise, getMenuState } from './menu-module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  addGroupToDialog,
  addImageToDialog,
  addLevelToDialog,
  addCharacterSummary,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  createEquipmentMateriaViewer,
  EQUIPMENT_TYPE,
  removeGroupChildren,
  createItemListNavigation
} from './menu-box-helper.js'
import { oneColumnVerticalNavigation, oneColumnVerticalPageNavigation } from './menu-navigation-helper.js'
import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'
import { MOD } from '../field/field-op-codes-assign.js'
import { navigateSelect } from '../world/world-destination-selector.js'
import { getItemIcon } from '../items/items-module.js'

let itemShopDialog
let actionDescriptionDialog, actionDescriptionGroup
let navDialog
let itemInfoDialog, itemInfoGroup
let buyItemListDialog, buyItemListGroup, buyItemListContentsGroup
let buyCostDialog, buyCostGroup
let partyEquipDialog, partyEquipGroup

const MODE = {NAV: 'nav', BUY: 'buy', SELL: 'sell'}
const ITEM_TYPE = {ITEM: 'item', MATERIA: 'materia'}
const DATA = {
  nav: ['Buy', 'Sell', 'Exit'],
  mode: MODE.SEL,
  navPos: 0,
  buy: {
    pos: 0,
    page: 0
  },
  chars: [], // Populated below
  shopData: { // TODO - Shop data - https://forums.qhimm.com/index.php?topic=9475.0
    text: {
      shopName: 'Item Shop',
      welcome: 'Welcome!',
      buy: 'What would you like to buy?',
      sell: 'What would you like to sell?'
    },
    items: [
      {type: ITEM_TYPE.ITEM, id: 0, price: 50},
      {type: ITEM_TYPE.ITEM, id: 7, price: 300},
      {type: ITEM_TYPE.ITEM, id: 8, price: 80},
      // {type: ITEM_TYPE.ITEM, id: 268, price: 80},
      // {type: ITEM_TYPE.ITEM, id: 143, price: 80},
      {type: ITEM_TYPE.MATERIA, id: 49, price: 600},
      {type: ITEM_TYPE.MATERIA, id: 50, price: 600},
      {type: ITEM_TYPE.MATERIA, id: 52, price: 600},
      {type: ITEM_TYPE.MATERIA, id: 53, price: 750}
      // {type: ITEM_TYPE.MATERIA, id: 90, price: 750}
    ]
  }

}

const loadCharData = () => {
  DATA.chars = []
  for (let i = 0; i < 9; i++) {
    const name = getPlayableCharacterName(i)
    const showChar = window.data.savemap.party.phsVisibility[name] === 1
    const att = 12 // TBC
    const def = 12
    DATA.chars.push({name, showChar, att, def})
  }
}
const loadShopMenu = async param => {
  DATA.mode = MODE.NAV
  DATA.navPos = 0
  DATA.buy.pos = 0
  DATA.buy.page = 0
  loadCharData()
  // DATA.lettersPos = 0
  // DATA.underscore = null
  // setDataFromCharacter(param)
  console.log('char loadShopMenu', param, DATA)

  itemShopDialog = createDialogBox({
    id: 15,
    name: 'itemShopDialog',
    w: 82, // 82 // TODO - all widths
    h: 25.5, // 25.5
    x: 238, // 238
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  itemShopDialog.visible = true

  actionDescriptionDialog = createDialogBox({
    id: 13,
    name: 'actionDescriptionDialog',
    w: 242, // TODO - all widths
    h: 25.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  actionDescriptionDialog.visible = true
  actionDescriptionGroup = addGroupToDialog(actionDescriptionDialog, 23)

  navDialog = createDialogBox({
    id: 12,
    name: 'navDialog',
    w: 87,
    h: 25.5,
    x: 144.5,
    y: 8,
    expandInstantly: true,
    noClipping: true
  })
  navDialog.visible = true

  itemInfoDialog = createDialogBox({
    id: 14,
    name: 'itemInfoDialog',
    w: 320,
    h: 25.5,
    x: 0,
    y: 25.5,
    expandInstantly: true,
    noClipping: true
  })
  // itemInfoDialog.visible = true
  itemInfoGroup = addGroupToDialog(actionDescriptionDialog, 23)

  buyItemListDialog = createDialogBox({
    id: 14,
    name: 'buyItemListDialog',
    w: 238,
    h: 100,
    x: 0,
    y: 51,
    expandInstantly: true,
    noClipping: false
  })
  // buyItemListDialog.visible = true
  buyItemListGroup = addGroupToDialog(buyItemListDialog, 23)
  buyItemListContentsGroup = addGroupToDialog(buyItemListDialog, 23)
  buyItemListContentsGroup.userData.bg = buyItemListDialog.userData.bg

  buyCostDialog = createDialogBox({
    id: 14,
    name: 'buyCostDialog',
    w: 90,
    h: 100,
    x: 230,
    y: 51,
    expandInstantly: true,
    noClipping: true
  })
  // buyCostDialog.visible = true
  buyCostGroup = addGroupToDialog(buyCostDialog, 23)

  partyEquipDialog = createDialogBox({
    id: 14,
    name: 'partyEquipDialog',
    w: 320,
    h: 89,
    x: 0,
    y: 151,
    expandInstantly: true,
    noClipping: true
  })
  // partyEquipDialog.visible = true
  partyEquipGroup = addGroupToDialog(partyEquipDialog, 23)

  drawItemShop()
  drawActionDescription(DATA.shopData.text.welcome)
  drawNav()
  drawNavPointer()
  drawPartyEquipFixedElements()
  await fadeOverlayOut(getMenuBlackOverlay())
  setMenuState('shop-nav')
}
const drawItemShop = () => {
  // removeGroupChildren(itemShopDialog)
  addTextToDialog(
    itemShopDialog,
    DATA.shopData.text.shopName,
    `shop-item-shop-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    254 - 8, // TODO - positions
    16 - 4,
    0.5
  )
}
const drawActionDescription = (text) => {
  removeGroupChildren(actionDescriptionGroup)
  addTextToDialog(
    actionDescriptionGroup,
    text,
    `shop-action-description`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    22 - 8, // TODO - positions
    16 - 4,
    0.5
  )
}
const drawInfoDescription = (text) => {
  removeGroupChildren(itemInfoGroup)
  if (text !== undefined) {
    addTextToDialog(
      itemInfoGroup,
      text,
      `shop-info-description`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      22 - 8, // TODO - positions
      41 - 4,
      0.5
    )
  }
}
const getNavPositions = () => {
  return {
    x: 152.5,
    y: 24,
    xAdj: 27.5
  }
}
const drawNav = () => {
  const {x, y, xAdj} = getNavPositions()
  for (let i = 0; i < DATA.nav.length; i++) {
    const navItem = DATA.nav[i]
    addTextToDialog(
      navDialog,
      navItem,
      `shop-nav-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x + (xAdj * i) - 8, // TODO - positions
      y - 4,
      0.5
    )
  }
}
const drawNavPointer = () => {
  const {x, y, xAdj} = getNavPositions()
  movePointer(POINTERS.pointer1, x + (xAdj * DATA.navPos) - 12, y - 0)
}
const navNavigate = (delta) => {
  DATA.navPos = DATA.navPos + delta
  if (DATA.navPos >= DATA.nav.length) {
    DATA.navPos = DATA.nav.length - 1
  } else if (DATA.navPos < 0) {
    DATA.navPos = 0
  }
  drawNavPointer()
}
const navSelect = () => {
  const menuName = DATA.nav[DATA.navPos]
  console.log('shop navSelect', DATA, menuName)
  if (menuName === 'Buy') {
    loadBuyMode()
  } else if (menuName === 'Sell') {
    // TODO
  } else if (menuName === 'Exit') {
    exitMenu()
  }
}

const loadBuyMode = () => {
  DATA.mode = MODE.BUY
  itemInfoDialog.visible = true
  buyItemListDialog.visible = true
  buyCostDialog.visible = true
  partyEquipDialog.visible = true
  navDialog.visible = false

  drawActionDescription(DATA.shopData.text.buy)
  drawBuyItemList()
  drawBuyPointer()
  updateBuyItemPreviewDetails()
  setMenuState('shop-buy-select')
}
const getBuyItemPositions = () => {
  return {
    x: 24,
    y: 68,
    yAdj: 18
  }
}

const drawOneBuyItem = (i, page, x, y, yAdj) => {
  const item = DATA.shopData.items[i + page]
  let itemName
  let itemNameOffset
  let icon

  if (item.type === ITEM_TYPE.ITEM) {
    const itemData = window.data.kernel.allItemData[item.id]
    itemName = itemData.name
    itemNameOffset = 14
    icon = ['icons-menu', getItemIcon(itemData), 12, 0]
  } else { // ITEM_TYPE.MATERIA
    const materiaData = window.data.kernel.materiaData[item.id]
    itemName = materiaData.name
    itemNameOffset = 11
    icon = ['materia', materiaData.type, 11, -0.5]
  }

  addTextToDialog(
    buyItemListContentsGroup,
    itemName,
    `shop-buy-item-${i}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    itemNameOffset + x - 8, // TODO - positions
    y + (yAdj * i) - 4,
    0.5
  )
  addImageToDialog(buyItemListContentsGroup,
    icon[0],
    icon[1],
    `shop-buy-item-icon-${i}`,
    icon[2] + x - 8 + 0.5,
    y + (yAdj * i) - 4 + icon[3],
    0.5
  )
  addTextToDialog(
    buyItemListContentsGroup,
    ('' + item.price).padStart(12, ' '),
    `shop-buy-item-${i}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    120 + x - 8, // TODO - positions
    y + (yAdj * i) - 4,
    0.5
  )
}
const drawBuyItemList = () => {
  removeGroupChildren(buyItemListGroup)
  createItemListNavigation(buyItemListGroup, 240 - 14, 83 + 56, 94, DATA.shopData.items.length, 5)
  buyItemListGroup.userData.slider.userData.moveToPage(0)

  removeGroupChildren(buyItemListContentsGroup)
  const { x, y, yAdj } = getBuyItemPositions()
  for (let i = 0; i < 5; i++) {
    drawOneBuyItem(i, DATA.buy.page, x, y, yAdj)
  }
  buyItemListGroup.userData.slider.userData.moveToPage(DATA.buy.page)
  buyItemListContentsGroup.position.y = 0
}
const drawBuyPointer = () => {
  const { x, y, yAdj } = getBuyItemPositions()
  movePointer(POINTERS.pointer1, x - 14, y + (yAdj * DATA.buy.pos) - 0)
}
const updateBuyItemPreviewDetails = () => {
  removeGroupChildren(buyCostGroup)

  const item = DATA.shopData.items[DATA.buy.page + DATA.buy.pos]
  let description = ''
  let owned = 0
  let equipped = 0

  if (item.type === ITEM_TYPE.ITEM) {
    const itemData = window.data.kernel.allItemData[item.id]
    description = itemData.description
    const ownedItemFilter = window.data.savemap.items.filter(i => i.itemId === item.id)
    if (ownedItemFilter.length > 0) {
      owned = Math.min(99, ownedItemFilter[0].quantity)
    }
    // Equipped
    for (let i = 0; i < DATA.chars.length; i++) {
      const char = window.data.savemap.characters[DATA.chars[i].name]
      if (!DATA.chars[i].showChar) {
        continue
      }
      if (char.equip.weapon.itemId === item.id) {
        equipped++
      } else if (char.equip.armor.itemId === item.id) {
        equipped++
      } else if (char.equip.accessory.itemId === item.id) {
        equipped++
      }
    }
  } else if (item.type === ITEM_TYPE.MATERIA) {
    const materiaData = window.data.kernel.materiaData[item.id]
    description = materiaData.description
    owned = window.data.savemap.materias.filter(m => m.id === item.id).length
    // Equipped
    for (let i = 0; i < DATA.chars.length; i++) {
      const char = window.data.savemap.characters[DATA.chars[i].name]
      if (!DATA.chars[i].showChar) {
        continue
      }
      const materiaKeys = Object.keys(char.materia)
      for (let j = 0; j < materiaKeys.length; j++) {
        if (char.materia[materiaKeys[j]].id === item.id) {
          equipped++
        }
      }
    }
  }

  // Description
  drawInfoDescription(description)

  const yAdj = 12
  // Labels
  addTextToDialog(
    buyCostGroup,
    'Gil', // ('' + item.price).padStart(12, ' '),
    `shop-cost-info-gil-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    245 - 8, // TODO - positions
    68 + (0 * yAdj) - 4,
    0.5
  )
  addTextToDialog(
    buyCostGroup,
    'Owned', // ('' + item.price).padStart(12, ' '),
    `shop-cost-info-owned-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    245 - 8, // TODO - positions
    68 + (3 * yAdj) - 4,
    0.5
  )
  addTextToDialog(
    buyCostGroup,
    'Equipped', // ('' + item.price).padStart(12, ' '),
    `shop-cost-info-equipped-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    245 - 8, // TODO - positions
    68 + (5 * yAdj) - 4,
    0.5
  )

  // Values
  addTextToDialog(
    buyCostGroup,
    ('' + window.data.savemap.gil).padStart(12, ' '),
    `shop-cost-info-gil`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    235 - 8, // TODO - positions
    68 + (1 * yAdj) - 4,
    0.5
  )
  addTextToDialog(
    buyCostGroup,
    ('' + owned).padStart(12, ' '),
    `shop-cost-info-owned`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    235 - 8, // TODO - positions
    68 + (4 * yAdj) - 4,
    0.5
  )
  addTextToDialog(
    buyCostGroup,
    ('' + equipped).padStart(12, ' '),
    `shop-cost-info-equipped`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    235 - 8, // TODO - positions
    68 + (6 * yAdj) - 4,
    0.5
  )

  // Party Equip
  // TODO
}
const buyCancel = () => {
  itemInfoDialog.visible = false
  buyItemListDialog.visible = false
  buyCostDialog.visible = false
  partyEquipDialog.visible = false
  navDialog.visible = true
  DATA.mode = MODE.NAV
  drawNavPointer()
  drawActionDescription(DATA.shopData.text.welcome)
  drawInfoDescription()
  setMenuState('shop-nav')
}
const buySelect = () => {

}
const getPartyEquipPositions = () => {
  return {
    x: 12,
    y: 153,
    xAdj: 101,
    yAdj: 27
  }
}
const drawPartyEquipFixedElements = () => {
  const { x, y, xAdj, yAdj } = getPartyEquipPositions()
  for (let i = 0; i < DATA.chars.length; i++) {
    const char = DATA.chars[i]
    if (char.showChar) {
      addImageToDialog(partyEquipDialog, // TODO - There is a background fade effect here also
        'profiles',
        char.name,
        `shop-buy-equip-char-profile-${i}`,
        x + ((i % 3) * xAdj) + 0 + 12,
        y + (Math.trunc(i / 3) * yAdj) + 15,
        0.25
      )
    }
  }
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  itemShopDialog.visible = false
  actionDescriptionDialog.visible = false
  navDialog.visible = false

  console.log('shop EXIT')
  resolveMenuPromise()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CHAR', key, firstPress, state)

  if (state === 'shop-nav') {
    if (key === KEY.RIGHT) {
      navNavigate(1)
    } else if (key === KEY.LEFT) {
      navNavigate(-1)
    } else if (key === KEY.X) {
      navNavigate(3) // Push to far right
    } else if (key === KEY.O) {
      navSelect()
    }
  } else if (state === 'shop-buy-select') {
    if (key === KEY.UP) {
      oneColumnVerticalNavigation(-1, buyItemListContentsGroup, 5, DATA.shopData.items.length, DATA.buy, getBuyItemPositions, drawOneBuyItem, drawBuyItemList, drawBuyPointer, updateBuyItemPreviewDetails)
    } else if (key === KEY.DOWN) {
      oneColumnVerticalNavigation(1, buyItemListContentsGroup, 5, DATA.shopData.items.length, DATA.buy, getBuyItemPositions, drawOneBuyItem, drawBuyItemList, drawBuyPointer, updateBuyItemPreviewDetails)
    } else if (key === KEY.L1) {
      oneColumnVerticalPageNavigation(false, 5, DATA.shopData.items.length, DATA.buy, buyItemListGroup.userData.slider.userData.moveToPage, drawBuyItemList, updateBuyItemPreviewDetails)
    } else if (key === KEY.R1) {
      oneColumnVerticalPageNavigation(true, 5, DATA.shopData.items.length, DATA.buy, buyItemListGroup.userData.slider.userData.moveToPage, drawBuyItemList, updateBuyItemPreviewDetails)
    } else if (key === KEY.X) {
      buyCancel()
    } else if (key === KEY.O) {
      buySelect()
    }
  }
}
export { loadShopMenu, keyPress }

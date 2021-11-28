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
  createItemListNavigation,
  ALIGN,
  addShapeToDialog,
  WINDOW_COLORS_SUMMARY
} from './menu-box-helper.js'
import { oneColumnVerticalNavigation, oneColumnVerticalPageNavigation,
  multiColumnVerticalNavigation, multiColumnVerticalPageNavigation } from './menu-navigation-helper.js'
import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'
import { MOD } from '../field/field-op-codes-assign.js'
import { navigateSelect } from '../world/world-destination-selector.js'
import { getItemIcon, addItemToInventory } from '../items/items-module.js'
import { addMateriaToInventory } from '../materia/materia-module.js'
import { getGrowthText } from './menu-main-equip.js'

let itemShopDialog
let actionDescriptionDialog, actionDescriptionGroup
let navDialog
let navSellDialog
let itemInfoDialog, itemInfoGroup
let buyItemListDialog, buyItemListGroup, buyItemListContentsGroup
let sellItemListDialog, sellItemListGroup, sellItemListContentsGroup
let sellCostDialog, sellCostGroup
let buyOwnedDialog, buyOwnedGroup
let partyEquipDialog, partyEquipGroup
let buyCostDialog, buyCostGroup
let buySlotsDialog, buySlotsGroup

const MODE = {NAV: 'nav', BUY: 'buy', SELL_ITEMS: 'sell-items', SELL_MATERIA: 'sell-materia'}
const ITEM_TYPE = {ITEM: 'item', MATERIA: 'materia'}
const STATES = {
  SHOP_NAV: 'shop-nav',
  SHOP_NAV_SELL: 'shop-nav-sell',
  SHOP_BUY_SELECT: 'shop-buy-select',
  SHOP_BUY_AMOUNT: 'shop-buy-amount',
  SHOP_SELL_ITEMS_SELECT: 'shop-sell-items-select',
  SHOP_SELL_ITEMS_AMOUNT: 'shop-sell-items-amount',
  SHOP_SELL_MATERIA_SELECT: 'shop-sell-materia-select',
  SHOP_SELL_MATERIA_AMOUNT: 'shop-sell-materia-amount'
}

// SELL video - https://youtu.be/-PIG0GVeroQ?t=1083

const DATA = {
  mode: MODE.SEL,
  nav: ['Buy', 'Sell', 'Exit'],
  navPos: 0,
  navSell: ['Item', 'Materia'],
  navSellPos: 0,
  buy: {
    pos: 0,
    page: 0,
    amount: 1
  },
  sell: {
    pos: 0,
    page: 0,
    amount: 1
  },
  chars: [], // Populated below
  shopData: {},
  activeTween: null
}
const loadShopData = (param) => {
  const shop = JSON.parse(JSON.stringify(window.data.exe.shopData.shops[param])) // Temp
  // const shop = window.data.exe.shopData.shops[param]
  DATA.shopData = {
    shopName: shop.name,
    text: window.data.exe.shopData.text.normal, // TODO - When to use slang ?
    items: shop.items
    // TODO - Also, text.amountBuy is incorrectly mapped to whatSell, need to look at and fix
  }
  // Temp
  DATA.shopData.items.push({type: 'item', id: 0, price: 100})
  DATA.shopData.items.push({type: 'materia', id: 4, price: 1000})
  setDecriptionOwnedEquippedDetailsToItems()
}
const loadCharData = () => {
  DATA.chars = []
  for (let i = 0; i < 9; i++) {
    const name = getPlayableCharacterName(i)
    const showChar = window.data.savemap.party.phsVisibility[name] === 1
    const atk = window.data.kernel.allItemData[window.data.savemap.characters[name].equip.weapon.itemId].attackStrength
    const def = window.data.kernel.allItemData[window.data.savemap.characters[name].equip.armor.itemId].defense
    DATA.chars.push({name, showChar, atk, def})
  }
}
const loadShopMenu = async param => {
  DATA.mode = MODE.NAV
  DATA.navPos = 0
  DATA.navSellPos = 0
  DATA.buy.pos = 0
  DATA.buy.page = 0
  DATA.buy.amount = 1
  DATA.sell.pos = 0
  DATA.sell.page = 0
  DATA.sell.amount = 1
  window.DATA = DATA
  loadCharData()
  loadShopData(param)
  console.log('shop loadShopMenu', param, DATA)

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

  itemShopDialog = createDialogBox({
    id: 13,
    name: 'itemShopDialog',
    w: 82, // 82 // TODO - all widths
    h: 25.5, // 25.5
    x: 238, // 238
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  itemShopDialog.visible = true

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

  navSellDialog = createDialogBox({
    id: 12,
    name: 'navSellDialog',
    w: 97,
    h: 25.5,
    x: 140.5,
    y: 38,
    expandInstantly: true,
    noClipping: true
  })
  // navSellDialog.visible = true

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

  sellItemListDialog = createDialogBox({
    id: 14,
    name: 'sellItemListDialog',
    w: 320,
    h: 192,
    x: 0,
    y: 48,
    expandInstantly: true,
    noClipping: false
  })
  // sellItemListDialog.visible = true

  sellItemListGroup = addGroupToDialog(sellItemListDialog, 23)
  sellItemListContentsGroup = addGroupToDialog(sellItemListDialog, 23)
  sellItemListContentsGroup.userData.bg = sellItemListDialog.userData.bg

  sellCostDialog = createDialogBox({
    id: 13,
    name: 'sellCostDialog',
    w: 150,
    h: 192,
    x: 0,
    y: 48,
    expandInstantly: true,
    noClipping: true
  })
  sellCostDialog.position.z = 100 - 13
  // sellItemListDialog.visible = true
  sellCostDialog.userData.leftX = 0
  sellCostDialog.userData.rightX = 320 - 150 - 11
  sellCostGroup = addGroupToDialog(sellCostDialog, 22)

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
  itemInfoGroup = addGroupToDialog(itemInfoDialog, 23)

  buyOwnedDialog = createDialogBox({
    id: 14,
    name: 'buyOwnedDialog',
    w: 90,
    h: 100,
    x: 230,
    y: 51,
    expandInstantly: true,
    noClipping: true
  })
  // buyOwnedDialog.visible = true
  buyOwnedGroup = addGroupToDialog(buyOwnedDialog, 23)

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

  buySlotsDialog = createDialogBox({
    id: 9,
    name: 'buySlotsDialog',
    w: 210,
    h: 47,
    x: 31,
    y: 94.5,
    expandInstantly: true,
    noClipping: true
  })
  // buySlotsDialog.visible = true
  buySlotsDialog.position.z = 100 - 9
  buySlotsGroup = addGroupToDialog(buySlotsDialog, 19)

  buyCostDialog = createDialogBox({
    id: 9,
    name: 'buyCostDialog',
    w: 100,
    h: 37,
    x: 141,
    y: 92,
    expandInstantly: true,
    noClipping: true
  })
  // buyCostDialog.visible = true
  buyCostDialog.position.z = 100 - 9
  buyCostDialog.userData.slotY = 31.5
  buyCostGroup = addGroupToDialog(buyCostDialog, 19)

  window.buyCostDialog = buyCostDialog
  drawItemShop()
  drawActionDescription(DATA.shopData.text.hi)
  drawNav()
  drawNavPointer()
  drawNavSell()
  drawPartyEquipFixedElements()
  drawBuyCostFixedElements()
  drawBuySlotFixedElements()
  await fadeOverlayOut(getMenuBlackOverlay())
  setMenuState(STATES.SHOP_NAV)
}
const drawItemShop = () => {
  // removeGroupChildren(itemShopDialog)
  addTextToDialog(
    itemShopDialog,
    DATA.shopData.shopName,
    `shop-item-shop-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    279 - 8, // TODO - positions
    16 - 4,
    0.5,
    null,
    ALIGN.CENTRE
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
const getNavSellPositions = () => {
  return {
    x: 147.5,
    y: 24 + 30,
    xAdj: 44
  }
}
const drawNavSell = () => {
  const {x, y, xAdj} = getNavSellPositions()
  for (let i = 0; i < DATA.navSell.length; i++) {
    const navItem = DATA.navSell[i]
    addTextToDialog(
      navSellDialog,
      navItem,
      `shop-nav-sell-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      x + (xAdj * i) - 8, // TODO - positions
      y - 4,
      0.5
    )
  }
}
const drawNavSellPointer = () => {
  const {x, y, xAdj} = getNavSellPositions()
  movePointer(POINTERS.pointer1, x + (xAdj * DATA.navSellPos) - 12, y - 0)
}
const navSellNavigate = (delta) => {
  DATA.navSellPos = DATA.navSellPos + delta
  if (DATA.navSellPos >= DATA.navSell.length) {
    DATA.navSellPos = DATA.navSell.length - 1
  } else if (DATA.navSellPos < 0) {
    DATA.navSellPos = 0
  }
  drawNavSellPointer()
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
    selectChooseSellType()
  } else if (menuName === 'Exit') {
    exitMenu()
  }
}
const selectChooseSellType = () => {
  movePointer(POINTERS.pointer2, POINTERS.pointer1.position.x, 240 - POINTERS.pointer1.position.y, false, true)
  drawNavSellPointer()
  navSellDialog.visible = true
  setMenuState(STATES.SHOP_NAV_SELL)
}
const cancelChooseSellType = () => {
  drawActionDescription(DATA.shopData.text.hi)
  movePointer(POINTERS.pointer2, 0, 0, true)
  drawNavPointer()
  navSellDialog.visible = false
  setMenuState(STATES.SHOP_NAV)
}

const confirmChooseSellType = () => {
  DATA.sell.pos = 0
  DATA.sell.page = 0
  DATA.sell.amount = 1

  movePointer(POINTERS.pointer2, 0, 0, true)
  navDialog.visible = false
  navSellDialog.visible = false
  itemInfoDialog.visible = true
  sellItemListDialog.visible = true
  drawActionDescription(DATA.shopData.text.whatSell)
  DATA.sell = { pos: 0, page: 0, amount: 1 }
  if (DATA.navSellPos === 0) {
    loadSellItemsMode()
  } else if (DATA.navSellPos === 1) {
    loadSellItemsMode() // TODO
    // loadSellMateriaMode()
  }
}
const loadSellItemsMode = () => {
  DATA.mode = MODE.SELL_ITEMS

  drawSellItemsList()
  drawSellItemsPointer()
  updateSellItemDescription()
  setMenuState(STATES.SHOP_SELL_ITEMS_SELECT)
}
const updateSellItemDescription = () => {
  const { cols } = getSellItemsPositions()
  const item = window.data.savemap.items[(DATA.sell.page * cols) + DATA.sell.pos]
  if (item.index === 0x7F) {
    removeGroupChildren(itemInfoGroup)
  }
  const itemData = window.data.kernel.allItemData[item.itemId]
  drawInfoDescription(itemData.description)
}
const getSellItemsPositions = () => {
  return {
    x: 19,
    y: 69,
    xAdj: 145,
    yAdj: 18,
    cols: 2,
    lines: 10
  }
}
const drawSellItemsList = () => {
  const { x, y, xAdj, yAdj, cols, lines } = getSellItemsPositions()

  removeGroupChildren(sellItemListGroup)
  if (DATA.shopData.items.length > 5) {
    createItemListNavigation(sellItemListGroup, 320 - 7, 96, 186, window.data.savemap.items.length, lines)
    sellItemListGroup.userData.slider.userData.moveToPage(0)
  }

  removeGroupChildren(sellItemListContentsGroup)

  for (let i = 0; i < lines * cols; i++) { // TODO - 20 items?
    drawOneSellItem(i, DATA.sell.page, x, y, xAdj, yAdj, cols)
  }
  if (window.data.savemap.items.length > lines * cols) {
    sellItemListGroup.userData.slider.userData.moveToPage(DATA.sell.page)
  }
  sellItemListContentsGroup.position.y = 0
}
const drawOneSellItem = (i, page, x, y, xAdj, yAdj, cols) => {
  const item = window.data.savemap.items[i + (page * cols)]

  const rootX = x + (Math.abs(i % cols) * xAdj)
  const rootY = y + (Math.floor(i / cols) * yAdj)
  // console.log('shop drawOneSellItem', i, page, x, y, xAdj, yAdj, item.name, rootX, rootY)

  if (item.index === 0x7F) {
    return
  }
  const itemData = window.data.kernel.allItemData[item.itemId]

  addImageToDialog(sellItemListContentsGroup,
    'icons-menu',
    getItemIcon(itemData),
    `shop-buy-item-icon-${i}`,
    rootX + 17 - 8,
    rootY - 6,
    0.5
  )
  addTextToDialog(
    sellItemListContentsGroup,
    itemData.name,
    `shop-buy-item-${i}`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    rootX + 18.5 - 8, // TODO - positions
    rootY - 4,
    0.5
  )
  addTextToDialog(
    sellItemListContentsGroup,
    ':',
    `items-count-colon-${i}`,
    LETTER_TYPES.MenuTextFixed,
    LETTER_COLORS.White,
    rootX + 107.5 - 8,
    rootY - 3,
    0.5
  )
  addTextToDialog(
    sellItemListContentsGroup,
    ('' + Math.min(99, item.quantity)).padStart(12, ' '),
    `shop-buy-item-${i}`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    rootX + 54 - 8, // TODO - positions
    rootY - 4,
    0.5
  )
}
const drawSellItemsPointer = () => {
  console.log('shop drawSellItemsPointer', DATA)
  const { x, y, xAdj, yAdj, cols } = getSellItemsPositions()
  const rootX = x + ((DATA.sell.pos % cols) * xAdj)
  const rootY = y + (Math.floor(DATA.sell.pos / cols) * yAdj)
  movePointer(POINTERS.pointer1, rootX - 6.5, rootY - 0)
}
const loadSellMateriaMode = () => {
  DATA.mode = MODE.SELL_MATERIA
  // TODO copy from loadSellItemsMode()
}
const loadBuyMode = () => {
  DATA.mode = MODE.BUY
  itemInfoDialog.visible = true
  buyItemListDialog.visible = true
  buyOwnedDialog.visible = true
  partyEquipDialog.visible = true
  navDialog.visible = false

  drawActionDescription(DATA.shopData.text.whatBuy)
  drawBuyItemList()
  drawBuyPointer()
  updateBuyItemPreviewDetails()
  setMenuState(STATES.SHOP_BUY_SELECT)
}
const sellItemsCancel = () => {
  DATA.mode = MODE.NAV
  itemInfoDialog.visible = false
  sellItemListDialog.visible = false
  navDialog.visible = true
  // TODO Back to main nav or sell nav?
  cancelChooseSellType()
}
const tweenSellCostDialog = (group, from, to, ms, state, cb) => {
  setMenuState('loading')
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, ms)
    .onUpdate(function () {
      group.position.x = from.x
    })
    .onComplete(function () {
      setMenuState(state)
      if (cb) {
        cb()
      }
    })
    .start()
}
const sellItemsSelect = () => {
  window.sellCostDialog = sellCostDialog
  const { cols } = getSellItemsPositions()
  const item = window.data.savemap.items[DATA.sell.pos + (DATA.sell.page * cols)]
  console.log('shop sellSelect', item)
  if (item.id === 0x7F) {
    return
  }
  const from = {x: sellCostDialog.userData.leftX - 160}
  const to = {x: sellCostDialog.userData.leftX}
  if (DATA.sell.pos % 2 === 0) {
    from.x = sellCostDialog.userData.rightX + 160
    to.x = sellCostDialog.userData.rightX
  }
  // drawSellItemsAmount()
  sellCostDialog.visible = true

  console.log('shop sellSelect', DATA.sell.pos % 2, from, to)
  tweenSellCostDialog(sellCostDialog, from, to, 200, STATES.SHOP_SELL_ITEMS_AMOUNT)
}
const drawSellItemsAmount = () => {
  const x = 40
  const y = 60
  const xAdj = 70
  const xAdj2 = 75
  const yAdj = 13

  const rows = [
    ['How many', 0, false],
    ['How many', 1, false],
    ['How many', 2, false],
    ['Gil', 7, true],
    ['Owned', 10, true],
    ['Equipped', 12, true]
  ]
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    addTextToDialog(sellCostGroup, row[0], `shop-sell-item-cost-${i}`, LETTER_TYPES.MenuBaseFont, LETTER_COLORS.Cyan, row[2] ? xAdj : x, y + (row[1] * yAdj))
  }
  const rowsValues = [
    [3, 0],
    [150, 1],
    [523, 3],
    [373, 8],
    [3, 11],
    [0, 13]
  ]
  for (let i = 0; i < rowsValues.length; i++) {
    const row = rowsValues[i]
    addTextToDialog(sellCostGroup, ('' + row[0]).padStart(10, ' '), `shop-sell-item-cost-${i}`, LETTER_TYPES.MenuTextStats, LETTER_COLORS.White, xAdj2, y + (row[1] * yAdj))
  }
}

const sellItemsAmountCancel = () => {
  sellCostDialog.visible = false
  console.log('shop sellItemsAmountCancel')
  setMenuState(STATES.SHOP_SELL_ITEMS_SELECT)
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
  if (DATA.shopData.items.length > 5) {
    createItemListNavigation(buyItemListGroup, 240 - 14, 83 + 56, 94, DATA.shopData.items.length, 5)
    buyItemListGroup.userData.slider.userData.moveToPage(0)
  }

  removeGroupChildren(buyItemListContentsGroup)
  const { x, y, yAdj } = getBuyItemPositions()
  for (let i = 0; i < Math.min(DATA.shopData.items.length, 5); i++) {
    drawOneBuyItem(i, DATA.buy.page, x, y, yAdj)
  }
  if (DATA.shopData.items.length > 5) {
    buyItemListGroup.userData.slider.userData.moveToPage(DATA.buy.page)
  }
  buyItemListContentsGroup.position.y = 0
}
const drawBuyPointer = () => {
  const { x, y, yAdj } = getBuyItemPositions()
  movePointer(POINTERS.pointer1, x - 14, y + (yAdj * DATA.buy.pos) - 0)
}
const setDecriptionOwnedEquippedDetailsToItems = () => {
  for (let i = 0; i < DATA.shopData.items.length; i++) {
    const item = DATA.shopData.items[i]
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
    item.description = description
    item.owned = owned
    item.equipped = equipped
  }
}
const updateBuyItemPreviewDetails = () => {
  removeGroupChildren(buyOwnedGroup)

  const item = DATA.shopData.items[DATA.buy.page + DATA.buy.pos]

  // Description
  drawInfoDescription(item.description)

  const yAdj = 12

  const ownedDatas = [
    ['Gil', `shop-cost-info-gil-label`, LETTER_TYPES.MenuBaseFont, LETTER_COLORS.Cyan, 245, 0],
    ['Owned', `shop-cost-info-owned-label`, LETTER_TYPES.MenuBaseFont, LETTER_COLORS.Cyan, 245, 3],
    ['Equipped', `shop-cost-info-equipped-label`, LETTER_TYPES.MenuBaseFont, LETTER_COLORS.Cyan, 245, 5],
    [('' + window.data.savemap.gil).padStart(12, ' '), `shop-cost-info-gil`, LETTER_TYPES.MenuTextStats, LETTER_COLORS.White, 235, 1],
    [('' + item.owned).padStart(12, ' '), `shop-cost-info-owned`, LETTER_TYPES.MenuTextStats, LETTER_COLORS.White, 235, 4],
    [('' + item.equipped).padStart(12, ' '), `shop-cost-info-equipped`, LETTER_TYPES.MenuTextStats, LETTER_COLORS.White, 235, 6]
  ]
  for (let i = 0; i < ownedDatas.length; i++) {
    const ownedData = ownedDatas[i]
    addTextToDialog(
      buyOwnedGroup,
      ownedData[0],
      ownedData[1],
      ownedData[2],
      ownedData[3],
      ownedData[4] - 8, // TODO - positions
      68 + (ownedData[5] * yAdj) - 4,
      0.5
    )
  }

  // Party Equip
  removeGroupChildren(partyEquipGroup)
  if (item.type === ITEM_TYPE.ITEM) {
    const { x, y, xAdj, yAdj } = getPartyEquipPositions()
    const itemData = window.data.kernel.allItemData[item.id]
    if (itemData.equipableBy) {
      console.log('shop updateBuyItemPreviewDetails', DATA, item, itemData)
      for (let i = 0; i < DATA.chars.length; i++) {
        const char = DATA.chars[i]
        if (char.showChar && itemData.equipableBy.includes(char.name)) {
          const currentAtk = char.atk
          const currentDef = char.def
          const newAtk = itemData.attackStrength ? itemData.attackStrength : currentAtk
          const newDef = itemData.defense ? itemData.defense : currentDef
          console.log('shop show item for', char, 'ATK', currentAtk, '->', newAtk, 'DEF', currentDef, '->', newDef)

          const currentAtkStr = ('' + currentAtk).padStart(3, ' ')
          const currentDefStr = ('' + currentDef).padStart(3, ' ')
          const newAtkStr = ('' + newAtk).padStart(3, ' ')
          const newDefStr = ('' + newDef).padStart(3, ' ')

          let newAtkColor = LETTER_COLORS.White
          if (newAtk > currentAtk) { newAtkColor = LETTER_COLORS.Yellow }
          if (newAtk < currentAtk) { newAtkColor = LETTER_COLORS.Red }
          let newDefColor = LETTER_COLORS.White
          if (newDef > currentDef) { newDefColor = LETTER_COLORS.Yellow }
          if (newDef < currentDef) { newDefColor = LETTER_COLORS.Red }

          const rootX = x + ((i % 3) * xAdj) + 0
          const rootY = y + (Math.trunc(i / 3) * yAdj) + 10
          const rootYAdj = 12
          const typeOffset = 18
          const stat1Offset = 35
          const arrowOffset = 54
          const stat2Offset = 62
          addTextToDialog(partyEquipGroup, 'A', `shop-partyequip-${i}-A`, LETTER_TYPES.MenuBaseFont, LETTER_COLORS.Cyan, rootX + typeOffset, rootY, 0.5)
          addTextToDialog(partyEquipGroup, currentAtkStr, `shop-partyequip-${i}-atk1`, LETTER_TYPES.MenuTextStats, LETTER_COLORS.White, rootX + stat1Offset, rootY - 0.5, 0.5)
          addTextToDialog(partyEquipGroup, '→', `shop-partyequip-${i}-arrow1`, LETTER_TYPES.MenuTextFixed, LETTER_COLORS.Cyan, rootX + arrowOffset, rootY - 0.5, 0.5)
          addTextToDialog(partyEquipGroup, newAtkStr, `shop-partyequip-${i}-def1`, LETTER_TYPES.MenuTextStats, newAtkColor, rootX + stat2Offset, rootY - 0.5, 0.5)

          addTextToDialog(partyEquipGroup, 'D', `shop-partyequip-${i}-A`, LETTER_TYPES.MenuBaseFont, LETTER_COLORS.Cyan, rootX + typeOffset, rootY + rootYAdj, 0.5)
          addTextToDialog(partyEquipGroup, currentDefStr, `shop-partyequip-${i}-atk2`, LETTER_TYPES.MenuTextStats, LETTER_COLORS.White, rootX + stat1Offset, rootY + rootYAdj - 0.5, 0.5)
          addTextToDialog(partyEquipGroup, '→', `shop-partyequip-${i}-arrow1`, LETTER_TYPES.MenuTextFixed, LETTER_COLORS.Cyan, rootX + arrowOffset, rootY + rootYAdj - 0.5, 0.5)
          addTextToDialog(partyEquipGroup, newDefStr, `shop-partyequip-${i}-atk2`, LETTER_TYPES.MenuTextStats, newDefColor, rootX + stat2Offset, rootY + rootYAdj - 0.5, 0.5)
        }
      }
    }
  }
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
  DATA.profileBGs = []
  for (let i = 0; i < DATA.chars.length; i++) {
    const char = DATA.chars[i]
    if (char.showChar) {
      addShapeToDialog(partyEquipDialog, WINDOW_COLORS_SUMMARY.CREDITS_BLACK, `shop-buy-equip-char-profile-${i}-bg`,
        x + ((i % 3) * xAdj) + 0 + 12,
        y + (Math.trunc(i / 3) * yAdj) + 15,
        21 + 1,
        24 + 1
      )
      DATA.profileBGs.push(addShapeToDialog(partyEquipDialog, WINDOW_COLORS_SUMMARY.CREDITS_WHITE, `shop-buy-equip-char-profile-${i}-bg`,
        x + ((i % 3) * xAdj) + 0 + 12,
        y + (Math.trunc(i / 3) * yAdj) + 15,
        21 + 1,
        24 + 1
      ))
      const profile = addImageToDialog(partyEquipDialog, // TODO - There is a background fade effect here also
        'profiles',
        char.name,
        `shop-buy-equip-char-profile-${i}`,
        x + ((i % 3) * xAdj) + 0 + 12,
        y + (Math.trunc(i / 3) * yAdj) + 15,
        0.25
      )
      console.log('shop profile', profile)
    }
  }

  beginProfileBGTween()
}
const beginProfileBGTween = () => {
  let from = {opacity: 0}
  let to = {opacity: [1, 0]}
  DATA.activeTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
  // .to(to, 415000)
    .to(to, 2500)
    .repeat(Infinity)
    .onUpdate(function () {
      // console.log('shop beginProfileBGTween update', from)
      for (let i = 0; i < DATA.profileBGs.length; i++) {
        const profileBG = DATA.profileBGs[i]
        profileBG.material.opacity = from.opacity
      }
    })
    .onStop(function () {
      console.log('shop beginProfileBGTween resolve')
      DATA.activeTween = null
    })
    .onComplete(function () {
      console.log('shop beginProfileBGTween complete')
      DATA.activeTween = null
    })
    .start()
}
const buyCancel = () => {
  itemInfoDialog.visible = false
  buyItemListDialog.visible = false
  buyOwnedDialog.visible = false
  partyEquipDialog.visible = false
  navDialog.visible = true
  DATA.mode = MODE.NAV
  drawNavPointer()
  drawActionDescription(DATA.shopData.text.hi)
  drawInfoDescription()
  setMenuState(STATES.SHOP_NAV)
}
const buySelect = () => {
  DATA.buy.amount = 1
  drawBuyCost()

  const item = DATA.shopData.items[DATA.buy.page + DATA.buy.pos]

  if (item.type === ITEM_TYPE.ITEM) {
    const itemData = window.data.kernel.allItemData[item.id]
    if (itemData.type === 'Weapon' || itemData.type === 'Armor') {
      console.log('shop buySelect weapon/armor', itemData)
      drawBuySlot()
      buyCostDialog.position.y = buyCostDialog.userData.slotY
      buyCostDialog.visible = true
      buySlotsDialog.visible = true
      setMenuState(STATES.SHOP_BUY_AMOUNT)
    } else {
      console.log('shop buySelect item', itemData)
      buyCostDialog.position.y = 0
      buyCostDialog.visible = true
      setMenuState(STATES.SHOP_BUY_AMOUNT)
    }
  } else if (item.type === ITEM_TYPE.MATERIA) {
    console.log('shop buySelect materia')
    // TODO - Can you select how materia you buy?
    buyCostDialog.position.y = 0
    buyCostDialog.visible = true
    setMenuState(STATES.SHOP_BUY_AMOUNT)
  }
}
const buyAmountChangeAmount = (delta) => {
  const item = DATA.shopData.items[DATA.buy.page + DATA.buy.pos]
  const maxAfforable = Math.trunc(window.data.savemap.gil / item.price)
  const maxPurchasable = 99 - item.owned - item.equipped

  DATA.buy.amount = DATA.buy.amount + delta
  if (DATA.buy.amount > maxAfforable) {
    DATA.buy.amount = maxAfforable
  }
  if (DATA.buy.amount > maxPurchasable) {
    DATA.buy.amount = maxPurchasable
  }
  if (DATA.buy.amount > 99) { // TODO - Check to see if this is capped at 99 - owned - equipped etc. Eg, cannot have 99 in inventory, or if this is even capped with how much gil you have
    DATA.buy.amount = 99
  } else if (DATA.buy.amount < 1) {
    DATA.buy.amount = 1
  }
  drawBuyCost()
}
const buyAmountCancel = () => {
  buyCostDialog.visible = false
  buySlotsDialog.visible = false
  updateBuyItemPreviewDetails()
  setMenuState(STATES.SHOP_BUY_SELECT)
}
const buyAmountSelect = () => {
  const item = DATA.shopData.items[DATA.buy.page + DATA.buy.pos]
  const maxAfforable = Math.trunc(window.data.savemap.gil / item.price)
  const maxPurchasable = 99 - item.owned - item.equipped
  const price = item.price
  if (price > window.data.savemap.gil || DATA.buy.amount > maxAfforable || DATA.buy.amount > maxPurchasable) {
    // error sound
  } else {
    window.data.savemap.gil = window.data.savemap.gil - price
    if (item.type === ITEM_TYPE.ITEM) {
      addItemToInventory(item.id, DATA.buy.amount)
      item.owned = item.owned + DATA.buy.amount
    } else if (item.type === ITEM_TYPE.MATERIA) {
      for (let i = 0; i < DATA.buy.amount; i++) {
        addMateriaToInventory(item.id, 0)
      }
      item.owned = item.owned + DATA.buy.amount
    }
    buyAmountCancel()
  }
}
const drawBuyCostFixedElements = () => {
  const texts = ['How many', 'Total']
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]
    addTextToDialog(
      buyCostDialog,
      text,
      `shop-buy-cost-label-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      148 - 8, // TODO - positions
      108 + (i * 13) - 4,
      0.5
    )
  }
}
const drawBuySlotFixedElements = () => {
  const texts = ['Slot', 'Growth']
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]
    addTextToDialog(
      buySlotsDialog,
      text,
      `shop-buy-cost-label-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      45 - 8, // TODO - positions
      114 + (i * 15) - 4,
      0.5
    )
  }
}
const drawBuyCost = () => {
  removeGroupChildren(buyCostGroup)
  const price = DATA.shopData.items[DATA.buy.page + DATA.buy.pos].price
  const texts = [DATA.buy.amount, price * DATA.buy.amount]
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]
    addTextToDialog(
      buyCostGroup,
      ('' + text).padStart(12, ' '),
      `shop-buy-cost-label-${i}`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      161 - 8, // TODO - positions
      108 + (i * 13) - 4,
      0.5
    )
  }
}
const drawBuySlot = () => {
  removeGroupChildren(buySlotsGroup)
  const item = DATA.shopData.items[DATA.buy.page + DATA.buy.pos]
  const itemData = window.data.kernel.allItemData[item.id]
  const slots = itemData.materiaSlots
  const growthText = getGrowthText(itemData.growthRate)

  console.log('shop growthText', growthText, itemData, itemData.growthRate)
  createEquipmentMateriaViewer(buySlotsGroup,
    116,
    90.5,
    slots
  )

  addTextToDialog(
    buySlotsGroup,
    growthText,
    `shop-buy-growth-type`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    170 - 8, // TODO - positions
    129 - 4,
    0.5,
    null,
    ALIGN.CENTRE
  )
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  itemShopDialog.visible = false
  actionDescriptionDialog.visible = false
  navDialog.visible = false

  if (DATA.activeTween !== null) {
    DATA.activeTween.stop()
  }

  console.log('shop EXIT')
  resolveMenuPromise()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CHAR', key, firstPress, state)

  if (state === STATES.SHOP_NAV) {
    if (key === KEY.RIGHT) {
      navNavigate(1)
    } else if (key === KEY.LEFT) {
      navNavigate(-1)
    } else if (key === KEY.X) {
      navNavigate(3) // Push to far right
    } else if (key === KEY.O) {
      navSelect()
    }
  } else if (state === STATES.SHOP_NAV_SELL) {
    if (key === KEY.RIGHT) {
      navSellNavigate(1)
    } else if (key === KEY.LEFT) {
      navSellNavigate(-1)
    } else if (key === KEY.X) {
      cancelChooseSellType(3) // Push to far right
    } else if (key === KEY.O) {
      confirmChooseSellType()
    }
  } else if (state === STATES.SHOP_BUY_SELECT) {
    if (key === KEY.UP) {
      oneColumnVerticalNavigation(-1, buyItemListContentsGroup, 5, DATA.shopData.items.length, DATA.buy, getBuyItemPositions, drawOneBuyItem, drawBuyItemList, drawBuyPointer, updateBuyItemPreviewDetails)
    } else if (key === KEY.DOWN) {
      oneColumnVerticalNavigation(1, buyItemListContentsGroup, 5, DATA.shopData.items.length, DATA.buy, getBuyItemPositions, drawOneBuyItem, drawBuyItemList, drawBuyPointer, updateBuyItemPreviewDetails)
    } else if (key === KEY.L1) {
      oneColumnVerticalPageNavigation(false, 5, DATA.shopData.items.length, DATA.buy, buyItemListGroup, drawBuyItemList, updateBuyItemPreviewDetails)
    } else if (key === KEY.R1) {
      oneColumnVerticalPageNavigation(true, 5, DATA.shopData.items.length, DATA.buy, buyItemListGroup, drawBuyItemList, updateBuyItemPreviewDetails)
    } else if (key === KEY.X) {
      buyCancel()
    } else if (key === KEY.O) {
      buySelect()
    }
  } else if (state === STATES.SHOP_BUY_AMOUNT) {
    if (key === KEY.UP) {
      buyAmountChangeAmount(1)
    } else if (key === KEY.DOWN) {
      buyAmountChangeAmount(-1)
    } else if (key === KEY.RIGHT) {
      buyAmountChangeAmount(10)
    } else if (key === KEY.LEFT) {
      buyAmountChangeAmount(-10)
    } else if (key === KEY.X) {
      buyAmountCancel()
    } else if (key === KEY.O) {
      buyAmountSelect()
    }
  } else if (state === STATES.SHOP_SELL_ITEMS_SELECT) {
    if (key === KEY.LEFT) {
      multiColumnVerticalNavigation(-1, sellItemListContentsGroup, window.data.savemap.items.length, DATA.sell, getSellItemsPositions, drawOneSellItem, drawSellItemsList, drawSellItemsPointer, updateSellItemDescription)
    } else if (key === KEY.RIGHT) {
      multiColumnVerticalNavigation(1, sellItemListContentsGroup, window.data.savemap.items.length, DATA.sell, getSellItemsPositions, drawOneSellItem, drawSellItemsList, drawSellItemsPointer, updateSellItemDescription)
    } else if (key === KEY.UP) {
      multiColumnVerticalNavigation(-2, sellItemListContentsGroup, window.data.savemap.items.length, DATA.sell, getSellItemsPositions, drawOneSellItem, drawSellItemsList, drawSellItemsPointer, updateSellItemDescription)
    } else if (key === KEY.DOWN) {
      multiColumnVerticalNavigation(2, sellItemListContentsGroup, window.data.savemap.items.length, DATA.sell, getSellItemsPositions, drawOneSellItem, drawSellItemsList, drawSellItemsPointer, updateSellItemDescription)
    } else if (key === KEY.L1) {
      multiColumnVerticalPageNavigation(false, sellItemListContentsGroup, window.data.savemap.items.length, DATA.sell, getSellItemsPositions, drawSellItemsList, updateSellItemDescription)
    } else if (key === KEY.R1) {
      multiColumnVerticalPageNavigation(true, sellItemListContentsGroup, window.data.savemap.items.length, DATA.sell, getSellItemsPositions, drawSellItemsList, updateSellItemDescription)
    } else if (key === KEY.X) {
      sellItemsCancel()
    } else if (key === KEY.O) {
      sellItemsSelect()
    }
  } else if (state === STATES.SHOP_SELL_ITEMS_AMOUNT) {
    if (key === KEY.UP) {
      // buyAmountChangeAmount(1)
    } else if (key === KEY.DOWN) {
      // buyAmountChangeAmount(-1)
    } else if (key === KEY.RIGHT) {
      // buyAmountChangeAmount(10)
    } else if (key === KEY.LEFT) {
      // buyAmountChangeAmount(-10)
    } else if (key === KEY.X) {
      sellItemsAmountCancel()
    } else if (key === KEY.O) {
      // buyAmountSelect()
    }
  }
}
export { loadShopMenu, keyPress }

import { getBankData } from '../data/savemap.js'

const setItemToInventory = (position, itemId, quantity) => {
  const item = {
    itemId: itemId,
    quantity: quantity,
    name: window.data.kernel.allItemData[itemId].name
  }
  window.data.savemap.items[position] = item
}
const getItemIcon = itemData => {
  let icon = 'item'
  if (itemData.type === 'Item') {
    icon = 'item'
  } else if (itemData.type === 'Armor') {
    icon = 'armor'
  } else if (itemData.type === 'Accessory') {
    icon = 'accessory'
  } else if (itemData.equipableBy.includes('Cloud')) {
    icon = 'sword'
  } else if (itemData.equipableBy.includes('Barret')) {
    icon = 'gun'
  } else if (itemData.equipableBy.includes('Tifa')) {
    icon = 'glove'
  } else if (itemData.equipableBy.includes('Aeris')) {
    icon = 'staff'
  } else if (itemData.equipableBy.includes('RedXIII')) {
    icon = 'clip'
  } else if (itemData.equipableBy.includes('Yuffie')) {
    icon = 'shruiken'
  } else if (itemData.equipableBy.includes('CaitSith')) {
    icon = 'megaphone'
  } else if (itemData.equipableBy.includes('Vincent')) {
    icon = 'pistol'
  } else if (itemData.equipableBy.includes('Cid')) {
    icon = 'spear'
  } else if (itemData.equipableBy.includes('Sephiroth')) {
    icon = 'pistol' // Strange, but it's the last weapon on the list
  }
  return icon
}
const debugFillItems = () => {
  // Items (inc weapons, armor, accessories)
  window.data.savemap.items = []
  for (let i = 0; i < window.data.kernel.allItemData.length; i++) {
    const item = window.data.kernel.allItemData[i]
    if (item.name !== '') {
      window.data.savemap.items.push({
        itemId: item.itemId,
        quantity: 127,
        name: item.name
      })
    }
  }
  while (window.data.savemap.items.length < 320) {
    window.data.savemap.items.push({
      itemId: 127,
      quantity: 127,
      name: ''
    })
  }
}
window.debugFillItems = debugFillItems

const debugClearItems = () => {
  const items = window.data.savemap.items
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    item.itemId = 127
    item.quantity = 0
    item.name = ''
  }
  console.log('debugClearItems - window.data.savemap', window.data.savemap)
}
const dec2bin = dec => {
  return (dec >>> 0).toString(2)
}
const getKeyItems = () => {
  // Bank 1, var 64 - 70
  const keyItems = []
  let ids = []
  for (let i = 64; i <= 70; i++) {
    // Each has 8 bits, starting with the rightmost bit, put into an array of booleans
    // const bankVal = Math.floor(Math.random() * 255) + 0 // Just for testing
    const bankVal = getBankData(1, i)
    const valBin = dec2bin(bankVal).padStart(8, '0')
    const valBinArray = valBin
      .split('')
      .reverse()
      .map(v => v === '1')
    console.log('item keyItems', i, bankVal, valBin, valBinArray)
    // array corresponds to window.data.kernel.keyitemNames & window.data.kernel.keyitemDescriptions
    ids = ids.concat(valBinArray)
  }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    if (id && window.data.kernel.keyitemNames[i] !== '') {
      keyItems.push({
        name: window.data.kernel.keyitemNames[i],
        description: window.data.kernel.keyitemDescriptions[i]
      })
    }
  }
  console.log('item keyItems done', ids, keyItems)
  return keyItems
}
export { debugFillItems, debugClearItems, getItemIcon, getKeyItems }

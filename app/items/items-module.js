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
  // Party
  window.data.savemap.party.members = ['Cloud', 'Barret', 'Aeris']

  // Status
  window.data.savemap.characters.Cloud.status.statusFlags = 'Fury'
  window.data.savemap.characters.Barret.status.statusFlags = 'Sadness'

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

export { debugFillItems, debugClearItems, getItemIcon }

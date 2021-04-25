const getItemsData = () => {
  return window.data.kernel.itemData
}

const setItemToInventory = (position, id, quantity) => {
  const item = {
    index: index, // TODO, not sure what I did here...
    itemId: index,
    quantity: quantity,
    name: getItemsData()[id].name,
    description: getItemsData()[id].description
  }
  window.data.savemap.items[position] = item
}
const debugFillItems = () => {
  // Party
  window.data.savemap.party.members = ['Cloud', 'Barret', 'Aeris']

  // Status
  window.data.savemap.characters.Cloud.status.statusFlags = 'Fury'
  window.data.savemap.characters.Barret.status.statusFlags = 'Sadness'

  // Items
  for (let i = 0; i < window.data.kernel.itemData.length; i++) {
    const item = window.data.kernel.itemData[i]
    window.data.savemap.items[item.index] = {
      index: item.index,
      itemId: item.itemId,
      quantity: 127,
      name: item.name,
      description: item.description
    }
  }
  for (let i = 0; i < window.data.kernel.weaponData.length; i++) {
    const item = window.data.kernel.weaponData[i]
    window.data.savemap.items[item.itemId] = {
      index: item.itemId,
      itemId: item.itemId,
      quantity: 127,
      name: item.name,
      description: item.description
    }
  }
  for (let i = 0; i < window.data.kernel.armorData.length; i++) {
    const item = window.data.kernel.armorData[i]
    window.data.savemap.items[item.itemId] = {
      index: item.itemId,
      itemId: item.itemId,
      quantity: 127,
      name: item.name,
      description: item.description
    }
  }
  for (let i = 0; i < window.data.kernel.accessoryData.length; i++) {
    const item = window.data.kernel.accessoryData[i]
    window.data.savemap.items[item.itemId] = {
      index: item.itemId,
      itemId: item.itemId,
      quantity: 127,
      name: item.name,
      description: item.description
    }
  }
}
window.debugFillItems = debugFillItems

const debugClearItems = () => {
  const items = window.data.savemap.items
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    item.index = 127
    item.itemId = 127
    item.quantity = 0
    item.name = ''
    item.description = ''
  }
  console.log('debugClearItems - window.data.savemap', window.data.savemap)
}

export { debugFillItems, debugClearItems }

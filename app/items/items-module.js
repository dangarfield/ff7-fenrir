const setItemToInventory = (position, itemId, quantity) => {
  const item = {
    itemId: itemId,
    quantity: quantity,
    name: window.data.kernel.allItemData[itemId].name
  }
  window.data.savemap.items[position] = item
}
const debugFillItems = () => {
  // Party
  window.data.savemap.party.members = ['Cloud', 'Barret', 'Aeris']

  // Status
  window.data.savemap.characters.Cloud.status.statusFlags = 'Fury'
  window.data.savemap.characters.Barret.status.statusFlags = 'Sadness'

  // Items (inc weapons, armor, accessories)
  for (let i = 0; i < window.data.kernel.allItemData.length; i++) {
    const item = window.data.kernel.allItemData[i]
    window.data.savemap.items[item.itemId] = {
      itemId: item.itemId,
      quantity: 127,
      name: item.name
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

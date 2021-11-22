import { getBankData } from '../data/savemap.js'
import { unequipMateria } from '../materia/materia-module.js'

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

const addItemToInventory = (itemId, quantity) => {
  console.log('equip addItemToInventory', itemId, quantity)
  let quantityUpdated = false
  for (let i = 0; i < window.data.savemap.items.length; i++) {
    const item = window.data.savemap.items[i]
    if (item.itemId === itemId) {
      item.quantity = Math.min(127, item.quantity + quantity)
      quantityUpdated = true
      console.log('equip addItemToInventory updated')
      break
    }
  }
  if (!quantityUpdated) {
    const itemData = window.data.kernel.allItemData[itemId]
    for (let i = 0; i < window.data.savemap.items.length; i++) {
      const item = window.data.savemap.items[i]
      if (item.itemId === 127) {
        item.itemId = itemData.itemId
        item.quantity = quantity
        item.name = itemData.name
        console.log('equip addItemToInventory added')
        break
      }
    }
  }
}
const removeItemFromInventory = (itemId, quantity) => {
  console.log('equip removeItemFromInventory', itemId, quantity)
  for (let i = 0; i < window.data.savemap.items.length; i++) {
    const item = window.data.savemap.items[i]
    if (item.itemId === itemId) {
      item.quantity = item.quantity - quantity
      if (item.quantity <= 0) {
        item.itemId = 127
        item.quantity = 127
        item.name = ''
      }
      console.log('equip removeItemFromInventory removed')
    }
  }
}
const equipItemOnCharacter = (char, itemToEquip) => {
  let showMateriaMenuOnExit = false
  let existingItemId
  // Remove existing item if there is one and add it to the inventory
  if (itemToEquip.type === 'Weapon') {
    existingItemId = char.equip.weapon.itemId
    showMateriaMenuOnExit = true
  } else if (itemToEquip.type === 'Armor') {
    existingItemId = char.equip.armor.itemId
    showMateriaMenuOnExit = true
  } else if (itemToEquip.type === 'Accessory') {
    existingItemId = char.equip.accessory.itemId
  }
  console.log('equip equipItemOnCharacter', char, itemToEquip, existingItemId)
  if (existingItemId !== 543) { // Eg, index 255 for accessory -> none equipped
    addItemToInventory(existingItemId, 1)
  }

  // Add selected item to char and remove it / decrement it from the inventory
  removeItemFromInventory(itemToEquip.itemId, 1)
  let equip
  if (itemToEquip.type === 'Weapon') {
    equip = char.equip.weapon
  } else if (itemToEquip.type === 'Armor') {
    equip = char.equip.armor
  } else if (itemToEquip.type === 'Accessory') {
    equip = char.equip.accessory
  }
  equip.index = itemToEquip.index
  equip.itemId = itemToEquip.itemId
  equip.name = itemToEquip.name
  equip.description = itemToEquip.description

  // If the armor / materia has less slots, remove those materias and add to materia inventory
  if (itemToEquip.materiaSlots) {
    const materiasToKeep = 8 - window.data.kernel.allItemData[itemToEquip.itemId].materiaSlots.filter(s => s === 'None').length
    if (itemToEquip.type === 'Weapon') {
      for (let i = 1; i <= 8; i++) {
        const slotName = `weaponMateria${i}`
        const materia = char.materia[slotName]
        console.log('equip materia to remove', slotName, materia, i > materiasToKeep)
        if (i > materiasToKeep && materia.id !== 255) {
          unequipMateria(char, slotName)
        }
      }
    } else if (itemToEquip.type === 'Armor') {
      for (let i = 1; i <= 8; i++) {
        const slotName = `armorMateria${i}`
        const materia = char.materia[slotName]
        console.log('equip materia to remove', slotName, materia, i > materiasToKeep)
        if (i > materiasToKeep && materia.id !== 255) {
          unequipMateria(char, slotName)
        }
      }
    }
  }

  // If weapon / armor has been change and materia menu is available, load materia inventory on exitMenu
  return showMateriaMenuOnExit
}
export { debugFillItems, debugClearItems, getItemIcon, getKeyItems, equipItemOnCharacter, addItemToInventory }

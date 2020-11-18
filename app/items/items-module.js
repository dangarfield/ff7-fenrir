const getItemsData = () => { return window.data.kernel.itemData }

const setItemToInventory = (position, id, quantity) => {
    const item = {
        index: index,
        itemId: index,
        quantity: quantity,
        name: getItemsData()[id].name,
        description: getItemsData()[id].description
    }
    window.data.savemap.items[position] = item
}
const debugFillItems = () => {
    // TODO - Will have duplicate items, but this is for debug only, can improve if needed
    const items = window.data.savemap.items
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.index === 0x7F && item.itemId === 0x7F) { // 0x7F
            const randomItem = getItemsData()[Math.floor(Math.random() * getItemsData().length)]
            setItemToInventory(i, randomItem.index, 99)
        }
    }
    console.log('debugFillItems - window.data.savemap', window.data.savemap)
}
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

export {
    debugFillItems,
    debugClearItems
}
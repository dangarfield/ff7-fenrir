import {
  processSavemapAlias,
  getCurrentGameTime,
  getPlayableCharacterInitData
} from './savemap-alias.js'
import { addToast } from '../helpers/toasts.js'
import { getCharacterSaveMap } from '../field/field-op-codes-party-helper.js'
import { loadField } from '../field/field-module.js'
import { stopAllLoops } from '../field/field-op-loop.js'
import { recalculateAndApplyHPMPToAll } from '../battle/battle-stats.js'

let TEMP_FIELD_BANK = new Int16Array(256).fill(0)
window.data.TEMP_FIELD_BANK = TEMP_FIELD_BANK

const initNewSaveMap = () => {
  // console.log('initNewSaveMap: START')
  // console.log('window.data.kernel', window.data.kernel)
  window.data.savemap = Object.assign({}, window.data.kernel.initData.data)
  // console.log('initNewSaveMap: END')
  recalculateAndApplyHPMPToAll()
}

const loadSaveMap = (cardId, slotId) => {
  const savemap = window.localStorage.getItem(`save-${cardId}-${slotId}`)
  console.log('loadSaveMap', cardId, slotId, window.data.savemap)
  if (savemap === null) {
    console.log('no save, creating a new one')
    window.data.savemap = Object.assign({}, window.data.kernel.initData.data)
  } else {
    window.data.savemap = JSON.parse(savemap)
  }
  recalculateAndApplyHPMPToAll()
  // saveSaveMap(cardId, slotId)
  console.log('window.data.savemap', window.data.savemap)
}
const generateSavePreview = () => {
  const savemap = window.data.savemap
  const leadCharacter = getCharacterSaveMap(savemap.party.members[0]) // Assumed, not sure yet how reordering affects this
  savemap.savePreview.level = leadCharacter.level.current
  savemap.savePreview.portrait1 = savemap.party.members[0]
  savemap.savePreview.portrait2 = savemap.party.members[1]
  savemap.savePreview.portrait3 = savemap.party.members[2]
  savemap.savePreview.leader = leadCharacter.name
  savemap.savePreview.currentHP = leadCharacter.stats.hp.current
  savemap.savePreview.maximumHP = leadCharacter.stats.hp.max
  savemap.savePreview.currentMP = leadCharacter.stats.mp.current
  savemap.savePreview.maximumMP = leadCharacter.stats.mp.max
  savemap.savePreview.gil = savemap.gil
  const gameTime = getCurrentGameTime()
  savemap.savePreview.time = `${gameTime.h
    .toString()
    .padStart(2, '0')}:${gameTime.m.toString().padStart(2, '0')}`
  savemap.savePreview.location = savemap.location.currentLocation // This is the menu description not the fieldName
}
const saveSaveMap = (cardId, slotId) => {
  console.log('saveSaveMap', cardId, slotId)
  generateSavePreview()
  window.localStorage.setItem(
    `save-${cardId}-${slotId}`,
    JSON.stringify(window.data.savemap)
  )
  addToast(`Quicksave - ${cardId} - ${slotId}`)
}
const downloadSaveMaps = () => {
  console.log('downloadSaveMaps')
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(window.localStorage)
  )}`
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute(
    'download',
    `ff7-fenrir-saves-${new Date().getTime()}.json`
  )
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
const resetTempBank = () => {
  TEMP_FIELD_BANK = new Int16Array(256).fill(0)
  console.log('resetTempBank')
}
const identifyBank = bankRef => {
  let bank = 1
  let bytes = 1
  switch (bankRef) {
    case 1:
      bank = window.data.savemap.banks.bank1
      bytes = 1
      break // eg 1/2
    case 2:
      bank = window.data.savemap.banks.bank1
      bytes = 2
      break

    case 3:
      bank = window.data.savemap.banks.bank2
      bytes = 1
      break // eg 3/4
    case 4:
      bank = window.data.savemap.banks.bank2
      bytes = 2
      break

    case 5:
      bank = TEMP_FIELD_BANK
      bytes = 1
      break
    case 6:
      bank = TEMP_FIELD_BANK
      bytes = 2
      break

    case 11:
      bank = window.data.savemap.banks.bank3
      bytes = 1
      break // eg B/C
    case 12:
      bank = window.data.savemap.banks.bank3
      bytes = 2
      break

    case 13:
      bank = window.data.savemap.banks.bank4
      bytes = 1
      break // eg D/E
    case 14:
      bank = window.data.savemap.banks.bank4
      bytes = 2
      break

    case 15:
      bank = window.data.savemap.banks.bank5
      bytes = 1
      break // eg 7/F
    case 7:
      bank = window.data.savemap.banks.bank5
      bytes = 2
      break

    default:
      break
  }
  return { bank, bytes }
}

// http://forums.qhimm.com/index.php?topic=15763.0

// 1/2 are Bank 1
// 3/4 are Bank 2
// 5/6 are temporary vars in game and not saved.  They reset to 0 every time you enter new field.
// 8/9 & 10 cannot be written to.
// 11/12 are Bank 3
// 13/14 are Bank 4
// 15/7 are Bank 5

// Field vars 1, 3, 5, 15, 11, 13 are for one-byte writes
// Field vars  2, 4, 6, 12, 14, 7 are for two-byte writes

// (Yeah, for some reason, variable 7 is for two bytes, and variable 15 is for one byte.  Just stop dreaming that FF7 will ever make sense).

// Remember that 1/2, 3/4, 5/6, 11/12, 13/14 and 15/7 share the SAME 256 bytes.
// So if you write to var [1][10] you are ALSO writing to [2][10] (Bank 1, Byte 10).
// And if you write to var [2][10] you are ALSO writing to [1][10] and [1][11] (Bank 1, Bytes 10 and 11).

const UInt8 = function (value) {
  return value & 0xff
}
const Int8 = function (value) {
  var ref = UInt8(value)
  return ref > 0x7f ? ref - 0x100 : ref
}

const getValueFromBank = (bankRef, bank, type, index) => {
  if ((bankRef === 5 && index === 18) || (bankRef === 6 && index === 9)) {
    console.log(
      'getValueFromBank',
      bankRef,
      type,
      index,
      '->',
      bank[index],
      bank[index * 2]
    )
  }

  if (type === 1) {
    return bank[index].valueOf()
  } else {
    // TODO - Not sure when to using signed or unsigned... so for now, just set a two byte value into the index (eg int16)
    return bank[index].valueOf()
    // const bit1 = bank[(index * 2) + 1]
    // const bit2 = bank[(index * 2) + 0]

    // // const bit16 = Int8(UInt8(bit2) << 8 | UInt8(bit1))
    // const bit16 = UInt8(bit2) << 8 | UInt8(bit1)

    // console.log('bit1', bit1, 'bit2', bit2, 'bit16', bit16, Int8(UInt8(bit2) << 8 | UInt8(bit1)))
    // return bit16
  }
}
const setValueToBank = (bankRef, bank, type, index, newValue) => {
  // if (newValue === 148) { // Debug
  //     console.log('setValueToBank GOTCHA', type, index, '->', newValue)
  // }
  if ((bankRef === 5 && index === 18) || (bankRef === 6 && index === 9)) {
    console.log('setValueToBank', bankRef, type, index, '->', newValue)
  }
  if (type === 1) {
    bank[index] = newValue
  } else {
    // TODO - Not sure when to using signed or unsigned... so for now, just set a two byte value into the index
    bank[index] = newValue
    // var bit2 = UInt8(newValue >> 8) //((newValue >> 8) & 0xff)
    // var bit1 = UInt8(newValue) //newValue & 0xff
    // bank[(index * 2) + 1] = bit1
    // bank[(index * 2) + 0] = bit2
    // console.log('setValueToBank', newValue, 'bit1', bit1, 'bit2', bit2)
  }
}
const getBankData = (window.getBankData = (bankRef, index) => {
  // console.log('getBankData', bankRef, index, window.data.savemap)
  const bankData = identifyBank(bankRef)
  const value = getValueFromBank(bankRef, bankData.bank, bankData.bytes, index)
  // if (bankRef === 5 && (index === 4 || index === 7 || index === 8 || index === 9)) { // Debug
  //     console.log('getBankData', bankRef, index, '->', value)
  // }
  return value
})
const setBankData = (window.setBankData = (bankRef, index, value) => {
  // console.log('setBankData', bankRef, index, window.data.savemap)
  const bankData = identifyBank(bankRef)
  setValueToBank(bankRef, bankData.bank, bankData.bytes, index, value)
  processSavemapAlias(bankRef, index, value)
  // if (bankRef === 5 && (index === 4 || index === 7 || index === 8 || index === 9)) { // Debug
  //     console.log('setBankData', bankRef, index, '->', value)
  // }
})
const loadGame = async (cardId, slotId) => {
  // Initialise new savemap
  // initNewSaveMap()
  await stopAllLoops()
  loadSaveMap(cardId, slotId)
  const playableCharacterInitData = getPlayableCharacterInitData()
  console.log('playableCharacterInitData LOAD', playableCharacterInitData)
  if (playableCharacterInitData.fieldName) {
    loadField(playableCharacterInitData.fieldName, playableCharacterInitData)
  } else {
    loadField('md1stin')
    // loadField('startmap')
  }
  // Load field - Replace with menu
}
export {
  initNewSaveMap,
  loadSaveMap,
  saveSaveMap,
  getBankData,
  setBankData,
  resetTempBank,
  loadGame,
  downloadSaveMaps
}

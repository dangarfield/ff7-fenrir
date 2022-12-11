import {
  getPlayableCharacterName,
  getPlayableCharacterId,
  getCharacterSaveMap
} from './field-op-codes-party-helper.js'
import { setBankData, getBankData } from '../data/savemap.js'
import {
  addMateriaToInventory,
  removeMateriaFromInventoryById
} from '../materia/materia-module.js'

const SPTYE = async op => {
  console.log('SPTYE', op)
  const partyMember1 = getPlayableCharacterId(
    window.data.savemap.party.members[0]
  )
  const partyMember2 = getPlayableCharacterId(
    window.data.savemap.party.members[1]
  )
  const partyMember3 = getPlayableCharacterId(
    window.data.savemap.party.members[2]
  )
  console.log('SPTYE result', partyMember1, partyMember2, partyMember3)
  setBankData(op.b1, op.a1, partyMember1)
  setBankData(op.b2, op.a2, partyMember2)
  setBankData(op.b3, op.a3, partyMember3)
  return {}
}
const GTPYE = async op => {
  console.log('GTPYE', op)
  const partyMember1 = getBankData(op.b1, op.a1)
  const partyMember2 = getBankData(op.b2, op.a2)
  const partyMember3 = getBankData(op.b3, op.a3)
  window.data.savemap.party.members = [
    getPlayableCharacterName(partyMember1),
    getPlayableCharacterName(partyMember2),
    getPlayableCharacterName(partyMember3)
  ]
  console.log('GTPYE result', window.data.savemap.party.members)
  return {}
}

const GOLDU = async op => {
  console.log('GOLDU', op)
  const gilChange = op.b1 === 0 ? op.a : getBankData(op.b1, op.a)
  const newGil = Math.min(window.data.savemap.gil + gilChange, 0xffffffff)
  window.data.savemap.gil = newGil
  console.log('GOLDU result', window.data.savemap.gil)
  return {}
}
const GOLDD = async op => {
  console.log('GOLDD', op)
  const gilChange = op.b1 === 0 ? op.a : getBankData(op.b1, op.a)
  const newGil = Math.max(window.data.savemap.gil - gilChange, 0)
  window.data.savemap.gil = newGil
  console.log('GOLDD result', window.data.savemap.gil)
  return {}
}
const CHGLD = async op => {
  console.log('CHGLD', op)
  const gil = window.data.savemap.gil
  const highByte = (gil >> 16) & 0xffff
  const lowByte = gil & 0xffff
  // const bit32 = (((highByte & 0xffff) << 16) | (lowByte & 0xffff))
  setBankData(op.b1, op.nLow, lowByte)
  setBankData(op.b2, op.nHigh, highByte)
  console.log('CHGLD result', window.data.savemap.gil, highByte, lowByte)
  return {}
}

const HMPMAX1 = async op => {
  return HMPMAX3(op)
}
const HMPMAX2 = async op => {
  return HMPMAX3(op)
}
const MHMMX = async op => {
  return HMPMAX3(op)
}
const HMPMAX3 = async op => {
  console.log('HMPMAX3', op)
  const members = window.data.savemap.party.members
  for (let i = 0; i < members.length; i++) {
    const member = members[i]
    if (member !== 'None') {
      const characterSavemap = getCharacterSaveMap(member)
      characterSavemap.stats.hp.current = characterSavemap.stats.hp.base
      characterSavemap.stats.mp.current = characterSavemap.stats.mp.base
    }
  }
  console.log('HMPMAX3', window.data.savemap.characters)
  return {}
}
const MPUP = async op => {
  console.log('MPUP', op)
  const change = op.b === 0 ? op.v : getBankData(op.b, op.v)
  const memberName = window.data.savemap.party.members[op.p]
  const member = getCharacterSaveMap(memberName)
  if (member) {
    member.stats.mp.current = Math.min(
      member.stats.mp.current + change,
      member.stats.mp.base
    )
  }
  console.log('MPUP', member)
  return {}
}
const MPDWN = async op => {
  console.log('MPDWN', op)
  const change = op.b === 0 ? op.v : getBankData(op.b, op.v)
  const memberName = window.data.savemap.party.members[op.p]
  const member = getCharacterSaveMap(memberName)
  if (member) {
    member.stats.mp.current = Math.max(member.stats.mp.current - change, 0)
  }
  console.log('MPDWN', member)
  return {}
}
const HPUP = async op => {
  console.log('HPUP', op)
  const change = op.b === 0 ? op.v : getBankData(op.b, op.v)
  const memberName = window.data.savemap.party.members[op.p]
  const member = getCharacterSaveMap(memberName)
  if (member) {
    member.stats.hp.current = Math.min(
      member.stats.hp.current + change,
      member.stats.hp.base
    )
  }
  console.log('HPUP', member)
  return {}
}
const HPDWN = async op => {
  console.log('HPDWN', op)
  const change = op.b === 0 ? op.v : getBankData(op.b, op.v)
  const memberName = window.data.savemap.party.members[op.p]
  const member = getCharacterSaveMap(memberName)
  if (member) {
    member.stats.hp.current = Math.max(member.stats.hp.current - change, 0)
  }
  console.log('HPDWN', member)
  return {}
}

const STITM = async op => {
  console.log('STITM', op)
  const itemId = op.b1 === 0 ? op.t : getBankData(op.b1, op.t)
  const amount = op.b2 === 0 ? op.a : getBankData(op.b2, op.a)

  // Index and itemIds are a little messy
  // itemID is globally unique and used in item list savemap (9bit - 2 bytes)
  // index is the array position of the item of any given item type (8bit - 1 byte)
  // For now, use both, but will change in future
  // Should really move all of this to items-module.js

  const itemsOfType = window.data.savemap.items
  let index
  let kernelDataType
  if (itemId < 128) {
    index = itemId
    kernelDataType = 'itemData'
  } else if (itemId < 255) {
    index = itemId - 128
    kernelDataType = 'weaponData'
  } else if (itemId < 288) {
    index = itemId - 256
    kernelDataType = 'armorData'
  } else {
    index = itemId - 288
    kernelDataType = 'accessoryData'
  }

  let updated = false
  for (let i = 0; i < itemsOfType.length; i++) {
    const item = itemsOfType[i]
    if (item.itemId === itemId) {
      // The game technically lets you set more, but we'll just limit it to 99
      item.quantity = Math.min(item.quantity + amount, 99)
      updated = true
      break
    }
  }
  if (!updated) {
    for (let i = 0; i < itemsOfType.length; i++) {
      const item = itemsOfType[i]
      if (item.index === 0x7f && item.itemId === 0x7f) {
        item.index = index
        item.itemId = itemId
        item.quantity = Math.min(amount, 99)
        item.name = window.data.kernel[kernelDataType][index].name
        item.description = window.data.kernel[kernelDataType][index].description
        break
      }
    }
  }
  console.log('STITM', itemsOfType)
  return {}
}

const DLITM = async op => {
  console.log('DLITM', op)
  const itemId = op.b1 === 0 ? op.t : getBankData(op.b1, op.t)
  const amount = op.b2 === 0 ? op.a : getBankData(op.b2, op.a)
  const itemsOfType = window.data.savemap.items

  for (let i = 0; i < itemsOfType.length; i++) {
    const item = itemsOfType[i]
    if (item.id === itemId) {
      item.quantity = Math.max(item.quantity - amount, 0)
      break
    }
  }
  console.log('DLITM results', itemsOfType)
  return {}
}
const CKITM = async op => {
  console.log('CKITM', op)
  const itemsOfType = window.data.savemap.items
  for (let i = 0; i < itemsOfType.length; i++) {
    const item = itemsOfType[i]
    if (item.id === op.i) {
      setBankData(op.b, op.a, item.quantity)
      break
    }
  }
  console.log('CKITM results', itemsOfType)
  return {}
}

const SMTRA = async op => {
  console.log('SMTRA', op)
  // Actual calculation is fairly lengthy for ap calculation, but it is one of 2 values as outputted in kujata-data
  const materiaId = op.b1 === 0 ? op.t : getBankData(op.b1, op.t)
  const ap = op.apByte1 + 256 * op.apByte2 + 65536 * op.apByte3 // Either 0x00 or 0xFFFFFF
  addMateriaToInventory(materiaId, ap)
  console.log('SMTRA results', window.data.savemap.materias)
  return {}
}
const DMTRA = async op => {
  console.log('DMTRA', op)
  // Only used in blackbg4, I'm just going to delete all instances regardless of ap...
  const materiaId = op.b1 === 0 ? op.t : getBankData(op.b1, op.t)
  removeMateriaFromInventoryById(materiaId)
  console.log('DMTRA results', window.data.savemap.materias)
  return {}
}
const CMTRA = async op => {
  console.log('CMTRA', op)
  // This is not actually used in the game at all, so I won't implement it
  return {}
}

const GETPC = async op => {
  console.log('GETPC', op)
  const partyMember = getPlayableCharacterId(
    window.data.savemap.party.members[p]
  )
  console.log('GETPC result', partyMember)
  setBankData(op.b, op.a, partyMember)
  return {}
}
const PRTYP = async op => {
  console.log('PRTYP', op)
  const opCharacterName = getPlayableCharacterName(op.c)
  const members = window.data.savemap.party.members
  if (members[0] === 'None') {
    members[0] = opCharacterName
  } else if (members[1] === 'None') {
    members[1] = opCharacterName
  } else {
    members[2] = opCharacterName // Occupy last slot if not party is already full
  }

  console.log('PRTYP result', window.data.savemap.party.members)
  return {}
}
const PRTYM = async op => {
  console.log('PRTYM', op)
  const opCharacterName = getPlayableCharacterName(op.c)
  const members = window.data.savemap.party.members
  for (let i = 0; i < members.length; i++) {
    if (members[i] === opCharacterName) {
      members[i] === 'None'
    }
  }
  console.log('PRTYM result', window.data.savemap.party.members)
  return {}
}
const PRTYE = async op => {
  console.log('PRTYE', op)
  window.data.savemap.party.members[0] = getPlayableCharacterName(op.c1)
  window.data.savemap.party.members[1] = getPlayableCharacterName(op.c2)
  window.data.savemap.party.members[2] = getPlayableCharacterName(op.c3)
  console.log(
    'PRTYE result',
    window.data.savemap.party.members,
    getPlayableCharacterName(op.c1),
    getPlayableCharacterName(op.c2),
    getPlayableCharacterName(op.c3)
  )
  return {}
}
const MMBud = async op => {
  console.log('MMBud', op)
  const opCharacterName = getPlayableCharacterName(op.c)
  window.data.savemap.party.phsVisibility[opCharacterName] = op.s
  console.log('MMBud', window.data.savemap.party.phsVisibility)
  return {}
}
const MMBLK = async op => {
  console.log('MMBLK', op)
  const opCharacterName = getPlayableCharacterName(op.c)
  window.data.savemap.party.phsLocked[opCharacterName] = 1
  console.log('MMBLK', window.data.savemap.party.phsLocked)
  return {}
}
const MMBUK = async op => {
  console.log('MMBUK', op)
  const opCharacterName = getPlayableCharacterName(op.c)
  window.data.savemap.party.phsLocked[opCharacterName] = 0
  console.log('MMBUK', window.data.savemap.party.phsLocked)
  return {}
}

export {
  SPTYE,
  GTPYE,
  GOLDU,
  GOLDD,
  CHGLD,
  HMPMAX1,
  HMPMAX2,
  MHMMX,
  HMPMAX3,
  MPUP,
  MPDWN,
  HPUP,
  HPDWN,
  STITM,
  DLITM,
  CKITM,
  SMTRA,
  DMTRA,
  CMTRA,
  GETPC,
  PRTYP,
  PRTYM,
  PRTYE,
  MMBud,
  MMBLK,
  MMBUK
}

import { dec2hex } from '../helpers/helpers.js'
import {
  getLocalValue,
  setLocalValue,
  getGlobalValue,
  setGlobalValue,
  getActorValueAll,
  setActorValue,
  logMemory as logMemoryMemory
} from './battle-memory.js'
import { currentBattle } from './battle-setup.js'
import { placeholderBattleAttackSequence } from './battle-actions.js'

const TYPES = { VALUE: 'value', ADDRESS: 'address', MULTI: 'multi' }
const LENGTH = { BIT: 'bit', BYTE: 'byte', BYTE2: 'byte2', BYTE4: 'byte4' }
const stack = []
let currentActorIndex = 0

/*
https://pastebin.com/raw/mjfRFNsZ
https://forums.qhimm.com/index.php?topic=3290.msg45951#msg45951
https://forums.qhimm.com/index.php?topic=18668.75
https://wiki.ffrtt.ru/index.php/FF7/Battle/Battle_Scenes/Battle_AI_Addresses
https://wiki.ffrtt.ru/index.php/FF7/Battle/Battle_Mechanics
https://wiki.ffrtt.ru/index.php/FF7/Battle/Battle_Scenes#AI_Data
https://wiki.ffrtt.ru/index.php/FF7/Battle/Battle_Scenes/Battle_Script
https://faqs.neoseeker.com/Games/PS4/final_fantasy_vii_dynamixdj.txt
*/

// Utils
const setCurrentActorIndex = (newIndex) => {
  currentActorIndex = newIndex
}
const resetStack = () => {
  stack.length = 0
}
const logStack = () => {
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const logMemory = () => logMemoryMemory()

const getBiggestType = (x, y) => {
  let type = TYPES.VALUE
  if (x.t === TYPES.ADDRESS || y.t === TYPES.ADDRESS) type = TYPES.ADDRESS
  if (x.t === TYPES.MULTI || y.t === TYPES.MULTI) type = TYPES.MULTI
  return type
}
const getLengthFromOpType = (op) => {
  const nibble = parseInt(op) % 10
  if (nibble == 0) return LENGTH.BIT // eslint-disable-line eqeqeq
  if (nibble == 1) return LENGTH.BYTE // eslint-disable-line eqeqeq
  if (nibble == 2) return LENGTH.BYTE2 // eslint-disable-line eqeqeq
  return LENGTH.BYTE4
}
const getBiggestLength = (x, y) => {
  let type = LENGTH.BIT
  if (x.t === LENGTH.BYTE || y.t === LENGTH.BYTE) type = LENGTH.BYTE
  if (x.t === LENGTH.BYTE2 || y.t === LENGTH.BYTE2) type = LENGTH.BYTE2
  if (x.t === LENGTH.BYTE4 || y.t === LENGTH.BYTE4) type = LENGTH.BYTE4
  return type
}
const testArray10Bits = [
  0b1,
  0b10,
  0b100,
  0b1000,
  0b10000,
  0b100000,
  0b1000000,
  0b10000000,
  0b100000000,
  0b1000000000
]
const testArray12Bits = [
  0b1,
  0b10,
  0b100,
  0b1000,
  0b10000,
  0b100000,
  0b1000000,
  0b10000000,
  0b100000000,
  0b1000000000,
  0b10000000000,
  0b100000000000
]

// 0x: LOAD VALUES
const PSHA = async (op) => { // 00, 01, 02, 03
  console.log('battleOP PSHA', op)
  const l = getLengthFromOpType(op.type)
  const address = op.arg
  let valueFromAddress = 0
  let type = TYPES.VALUE

  if (address <= 0x03FF) {
    valueFromAddress = getLocalValue(currentActorIndex, dec2hex(address, 4, true), l)
  } else if (address < 0x4000) {
    valueFromAddress = getGlobalValue(dec2hex(address, 4, true), l)
  } else {
    valueFromAddress = getActorValueAll(dec2hex(address, 4, true), l)
    type = TYPES.MULTI
  }

  stack.push({ t: type, l, v: valueFromAddress, vhex: dec2hex(valueFromAddress, 4, true) })
  return {}
}

// 1x: LOAD ADDRESSES
const PUSH = async (op) => { // 10, 11, 12, 13
  console.log('battleOP PUSH', op)
  const l = getLengthFromOpType(op.type)
  stack.push({ t: TYPES.ADDRESS, l, v: op.arg, vhex: dec2hex(op.arg, 4, true) })
  return {}
}

// 3x: OPERATORS // TODO - what happens with different lengths here? If 2x is present etc
const ADD = async (op) => { // 30
  console.log('battleOP ADD', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v + y.v
  stack.push({ t: getBiggestType(x, y), l: getBiggestLength(x, y), v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const SUB = async (op) => { // 31
  console.log('battleOP SUB', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v - y.v
  stack.push({ t: getBiggestType(x, y), l: getBiggestLength(x, y), v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const MUL = async (op) => { // 32
  console.log('battleOP MUL', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v * y.v
  stack.push({ t: getBiggestType(x, y), l: getBiggestLength(x, y), v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const DIV = async (op) => { // 33
  console.log('battleOP MUL', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v * y.v
  stack.push({ t: getBiggestType(x, y), l: getBiggestLength(x, y), v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const MOD = async (op) => { // 34
  console.log('battleOP MOD', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v % y.v
  console.log('battleOP MOD', op, 'x', x.v, 'y', y.v, 'z', z)
  stack.push({ t: getBiggestType(x, y), l: getBiggestLength(x, y), v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const BAND = async (op) => { // 35
  console.log('battleOP BAND', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v & y.v
  stack.push({ t: getBiggestType(x, y), l: getBiggestLength(x, y), v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const BOR = async (op) => { // 36
  console.log('battleOP BOR', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v | y.v
  stack.push({ t: getBiggestType(x, y), l: getBiggestLength(x, y), v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const BNOT = async (op) => { // 37
  console.log('battleOP BNOT', op)
  const x = stack.pop()
  const z = ~x.v
  stack.push({ t: x.t, l: x.l, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}

// 4x: COMPARISONS
// TODO: If both were '0x'-Vars though, the result will be an '02'-Var which contains the Mask of all the objects in
//  the variables that passed the comparison (yes, I'm aware that objects are identified with '2x'-Vars, but this is
//  precisely what it appears to do... it doesn't matter much in the end though, as you'll see....)

const EQU = async (op) => { // 40
  console.log('battleOP EQU', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v == y.v // eslint-disable-line eqeqeq
  stack.push({ t: x.t, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const NEQU = async (op) => { // 41
  console.log('battleOP NEQU', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v != y.v // eslint-disable-line eqeqeq
  stack.push({ t: x.t, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const GEQU = async (op) => { // 42
  console.log('battleOP GEQU', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v >= y.v // eslint-disable-line eqeqeq
  stack.push({ t: x.t, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const LEQU = async (op) => { // 43
  console.log('battleOP LEQU', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v <= y.v // eslint-disable-line eqeqeq
  stack.push({ t: x.t, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const GRTN = async (op) => { // 44
  console.log('battleOP GRTN', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v > y.v // eslint-disable-line eqeqeq
  stack.push({ t: x.t, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const LSTN = async (op) => { // 45
  console.log('battleOP GRTN', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v < y.v // eslint-disable-line eqeqeq
  stack.push({ t: x.t, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}

// 5x: LOGICAL OPERATORS
const AND = async (op) => { // 50
  console.log('battleOP AND', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v != 0 && y.v != 0 ? 0b1 : 0b0 // eslint-disable-line eqeqeq
  stack.push({ t: TYPES.VALUE, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const OR = async (op) => { // 51
  console.log('battleOP OR', op)
  const y = stack.pop(); const x = stack.pop()
  const z = x.v != 0 || y.v != 0 ? 0b1 : 0b0 // eslint-disable-line eqeqeq
  stack.push({ t: TYPES.VALUE, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const NOT = async (op) => { // 52
  console.log('battleOP NOT', op)
  const x = stack.pop()
  const z = x.v == 0 ? 0b1 : 0b0 // eslint-disable-line eqeqeq
  stack.push({ t: TYPES.VALUE, l: LENGTH.BIT, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}

// 6x: CONSTANTS
const PUSHV = async (op) => { // 60, 61, 62
  console.log('battleOP PUSHV', op)
  let l = LENGTH.BYTE
  if (op.length == 2) l = LENGTH.BYTE2 // eslint-disable-line eqeqeq
  // TODO: Should be byte3 really
  if (op.length == 3) l = LENGTH.BYTE4 // eslint-disable-line eqeqeq
  stack.push({ t: TYPES.VALUE, l, v: op.arg, vhex: dec2hex(op.arg, 4, true) })
  return {}
}

// 7x: JUMPS
const JMP0 = async (op) => { // 70
  console.log('battleOP JMP0', op)
  const x = stack.pop()
  if (x.v == 0) { // eslint-disable-line eqeqeq
    console.log('battleOP JMP0 - Jumping', op)
    // TODO - Manage Jumps - return will be {next: arg}
    return { next: op.arg }
  } else {
    console.log('battleOP JMP0 - No jump', op)
    return {}
  }
}
const JNEQ = async (op) => { // 71
  console.log('battleOP JNEQ', op)
  const x = stack.pop()
  const [y] = stack.slice(-1)
  // Although 'x' is checked, it is not popped from the stack
  // The vars 'x' and 'y' are compared; if they are different, then we jump to the specified location in the AI script
  // TODO - If either 'x' or 'y' were '2x'-type Vars, then we only look at the value of the *1st* Object defined by the Mask.

  if (x.v != y.v) { // eslint-disable-line eqeqeq
    console.log('battleOP JNEQ - Jumping', op)
    // TODO - Manage Jumps - return will be {next: arg}
    return { next: op.arg }
  } else {
    return {}
  }
}
const JUMP = async (op) => { // 72
  console.log('battleOP JUMP', op)
  console.log('battleOP JUMP - Jumping', op)
  // TODO - Manage Jumps - return will be {next: arg}
  return { next: op.arg }
}
const END = async (op) => { // 73
  console.log('battleOP END', op)
  return { exit: true }
}
const POP = async (op) => { // 74
  console.log('battleOP POP', op)
  stack.pop()
  return {}
}
const LINK = async (op) => { // 75
  console.log('battleOP LINK', op)
  stack.pop()
  // TODO - will store the value of that Var as a byte into [008F4E3D]
  return {}
}

// 8x: MATH LOGIC
// TODO - Need to adjust is any values are of 2x
const MASK = async (op) => { // 80
  console.log('battleOP MASK', op)
  // Absolutely *NOTHING* happens (not even popping variables off) if 'y' is a '1x'-type Var
  const [potential] = stack.slice(-1) // Is this y or x ??
  if (potential.t === TYPES.ADDRESS) {
    console.log('battleOP MASK - NO OPERATION ALLOWED')
    return {}
  }
  const y = stack.pop(); const x = stack.pop()
  const z = x.v & y.v
  stack.push({ t: y.t, l: y.l, v: z, vhex: dec2hex(z, 6, true) })
  return {}
}
const RWRD = async (op) => { // 81
  console.log('battleOP RWRD', op)
  const random = Math.floor(Math.random() * (0xFFFF + 1))
  stack.push({ t: TYPES.VALUE, l: LENGTH.BYTE2, v: random, vhex: dec2hex(random, 4, true) })
  return {}
}
const RBYT = async (op) => { // 82
  const v = stack.pop().v
  const onBits = []
  for (const testBit of testArray12Bits) {
    if (v & testBit) onBits.push(testBit)
  }
  if (onBits.length === 0) onBits.push(0)
  const random = onBits[Math.floor(Math.random() * onBits.length)]
  console.log('battleOP RBYT onBits', op, v, onBits, random)
  stack.push({ t: TYPES.VALUE, l: LENGTH.BYTE2, v: random, vhex: dec2hex(random, 4, true) })
  return {}
}
const CNTB = async (op) => { // 83
  console.log('battleOP CNTB', op)
  const x = stack.pop()
  if (x.t === TYPES.VALUE || x.t === TYPES.ADDRESS) {
    // For '0x' and '1x'-type Vars, 'z' is a '01' Var containing a single integer which is a
    // count of how many bits in the 0x3FF region 'x' had turned on in its value
    let count = 0
    for (const testBit of testArray10Bits) {
      if (x.v & testBit) count++
    }
    stack.push({ t: TYPES.VALUE, l: LENGTH.BYTE, v: count, vhex: dec2hex(count, 2, true) })
  } else {
    // If 'x' is a '2x'-type Var however, then 'z' is a '0x'-type Var containing the DWord in 'x'
    // indicated by the first bit set in 'x''s Mask.
    let firstBit = 0
    let count = 0
    for (const testBit of testArray12Bits) {
      if (x.v & testBit) {
        if (firstBit > 0) firstBit = testBit // TODO - Should this the index of the bit or the value?
        count++ // TODO - Is this right at all?!
      }
    }
    let l = LENGTH.BIT
    if (firstBit === 1) l = LENGTH.BYTE
    if (firstBit === 2) l = LENGTH.BYTE2
    if (firstBit === 3) l = LENGTH.BYTE4

    stack.push({ t: TYPES.VALUE, l, v: count, vhex: dec2hex(firstBit, 2, true) })
  }
  return {}
}

const HMSK = async (op) => { // 84
  console.log('battleOP HMSK', op)
  const x = stack.pop()
  // TODO: Is this using x's mask?!
  const valToMatch = Math.max(...x.v)
  const bArray = []
  for (const i in x.v) {
    x.v[i] === valToMatch ? bArray.unshift(1) : bArray.unshift(0)
  }
  const b = parseInt(bArray.join(''), 2)
  stack.push({ t: TYPES.MULTI, l: LENGTH.BYTE2, v: b, vhex: dec2hex(b, 4, true) })
  return {}
}

const LMSK = async (op) => { // 85
  console.log('battleOP LMSK', op)
  const x = stack.pop()
  // TODO: Is this using x's mask?!
  const valToMatch = Math.min(...x.v)
  const bArray = []
  for (const i in x.v) {
    x.v[i] === valToMatch ? bArray.unshift(1) : bArray.unshift(0)
  }
  const b = parseInt(bArray.join(''), 2)
  stack.push({ t: TYPES.MULTI, l: LENGTH.BYTE2, v: b, vhex: dec2hex(b, 4, true) })
  return {}
}

const MPCT = async (op) => { // 86
  console.log('battleOP MPCT', op)
  const attackId = stack.pop().v
  let mp
  if (attackId <= 0x7F) {
    mp = window.data.kernel.attackData[attackId].mp
  } else {
    mp = currentBattle.attackData.find(a => a.id === attackId).mp
  }
  // TODO Should this take into consideration MP reduce / boosting factors for the actors, I assume so
  stack.push({ t: TYPES.VALUE, l: LENGTH.BYTE2, v: mp, vhex: dec2hex(mp, 4, true) })
  return {}
}

const TBIT = async (op) => { // 87
  console.log('battleOP TBIT', op)
  const x = stack.pop()
  const bit = parseInt('1' + Array(x.v).fill('0').join(''), 2)
  stack.push({ t: TYPES.VALUE, v: bit, vhex: dec2hex(bit, 4, true) })
  return {}
}

// 9x: COMMANDS
const STRA = async (op) => { // 90
  console.log('battleOP STRA', op)
  const y = stack.pop(); const x = stack.pop()
  console.log('battleOP STRA', 'x', x.v, 'y', y.v)
  if (x.v <= 0x03FF) {
    setLocalValue(currentActorIndex, dec2hex(x.v, 4, true), y.v) // Is x.v in 0x2000, 2000 or 8192 form? Assume it's 8192
  } else if (x.v < 0x4000) {
    setGlobalValue(dec2hex(x.v, 4, true), y.v)
  } else {
    const z = stack.pop()
    // If the Address is 4000 and above though, then the second format is used, where 'z' is an Address
    // that points to the location of a Mask that should be used to dictate which
    // Battle Objects will be updated by the command.

    const actorId = z.v // TODO, somehow get this to set the new actorId
    setActorValue(actorId, dec2hex(x.v, 4, true), y.v)
  }
  return {}
}
const POPX = async (op) => { // 91
  console.log('battleOp POPX', op)
  stack.pop()
  return {}
}
const ATTK = async (op) => { // 92
  console.log('battleOp ATTK', op)
  const y = stack.pop(); const x = stack.pop()
  const attackId = y.v
  const attackModifier = x.v
  console.log('battleOP TRIGGERED ATTACK: START', currentActorIndex, attackId, attackModifier)
  // batteActions.triggerAttack(currentActorIndex, attackId, attackModifier) // TODO - Implement this

  await placeholderBattleAttackSequence(currentActorIndex, 0)
  console.log('battleOP TRIGGERED ATTACK: END', currentActorIndex, attackId, attackModifier)
  return {}
}
const DSTR = async (op) => { // 93
  console.log('battleOp DSTR', op)
  console.log('battleOP DISPLAY STRING: START', op.text)
  // batteActions.displayMessage(op.text) // TODO - Implement this
  console.log('battleOP DISPLAY STRING: END', op.text)
  return {}
}
const COPY = async (op) => { // 94
  console.log('battleOp COPY', op)
  stack.pop()
  stack.pop()
  // Copy current status, hp and mp as well as some other specific data (like boosts, multipliers)
  // from units in first given mask to units in second mask
  // TODO: Implement this
  return {}
}
const GLOB = async (op) => { // 95
  console.log('battleOp GLOB', op)
  stack.pop()
  stack.pop()
  // If second pop is 1, takes value at local address 2010 and writes value at memory bank 1/2 at offset specified by first pop
  // If second pop is 0, data at memory bank1/2 at offset specified by first pop is stored at local address 2010.
  // Otherwise, command is ignored.
  // TODO: Implement this
  return {}
}
const EDEF = async (op) => { // 96
  console.log('battleOp EDEF', op)
  stack.pop()
  stack.pop()
  // Get fighter elemental defense
  // TODO: Implement this
  return {}
}
const DEBG = async (op) => { // A0
  console.log('battleOp DEBG', op)
  console.log('battleOP DISPLAY DEBUG STRING: START')
  console.log(op.text)
  console.log('battleOP DISPLAY DEBUG STRING: END')
  return {}
}
const POP2 = async (op) => { // A1
  console.log('battleOp POP2', op)
  stack.pop()
  stack.pop()
  return {}
}
export {
  resetStack,
  logStack,
  logMemory,
  setCurrentActorIndex,
  PUSH,
  PSHA,
  RBYT,
  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
  BAND,
  BOR,
  BNOT,
  EQU,
  NEQU,
  GEQU,
  LEQU,
  GRTN,
  LSTN,
  AND,
  OR,
  NOT,
  PUSHV,
  JMP0,
  JNEQ,
  JUMP,
  END,
  POP,
  LINK,
  MASK,
  RWRD,
  CNTB,
  HMSK,
  LMSK,
  MPCT,
  TBIT,
  STRA,
  POPX,
  ATTK,
  DSTR,
  COPY,
  GLOB,
  EDEF,
  DEBG,
  POP2
}

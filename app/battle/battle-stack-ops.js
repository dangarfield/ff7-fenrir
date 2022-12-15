import { dec2hex } from '../helpers/helpers.js'

const TYPES = { VALUE: 'value', ADDRESS: 'address', MULTI: 'multi' }
const stack = []

const resetStack = () => {
  stack.length = 0
}
// Utils
const getBiggestType = (x, y) => {
  let type = TYPES.VALUE
  if (x.t === TYPES.ADDRESS || y.t === TYPES.ADDRESS) type = TYPES.ADDRESS
  if (x.t === TYPES.MULTI || y.t === TYPES.MULTI) type = TYPES.MULTI
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
const PUSH = async (op) => { // 00, 01, 02, 03
  console.log('battleOP PUSH', op)
  // TODO - Valid values for X are 0, 1, 2, and 3. These will store a bit, byte, word, and dword respectively.
  stack.push({ t: TYPES.ADDRESS, v: op.arg, vhex: dec2hex(op.arg, 4, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
  return {}
}

// 1x: LOAD ADDRESSES
const PSHA = async (op) => { // 10, 11, 12, 13
  console.log('battleOP PSHA', op)
  // TODO - Valid values for X are 0, 1, 2, and 3. These will store a bit, byte, word, and dword respectively.
  // TODO - Get value from address
  const address = op.arg
  const valueFromAddress = address // TODO
  let type = TYPES.VALUE
  if (address >= 0x4000) type = TYPES.MULTI
  stack.push({ t: type, v: valueFromAddress, vhex: dec2hex(valueFromAddress, 4, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
  return {}
}

// 3x: OPERATORS
const ADD = async (op) => { // 30
  console.log('battleOP ADD', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x.v + y.v
  stack.push({ t: getBiggestType(x, y), v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const SUB = async (op) => { // 31
  console.log('battleOP SUB', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x.v - y.v
  stack.push({ t: getBiggestType(x, y), v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const MUL = async (op) => { // 32
  console.log('battleOP MUL', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x.v * y.v
  stack.push({ t: getBiggestType(x, y), v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const DIV = async (op) => { // 33
  console.log('battleOP MUL', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x.v * y.v
  stack.push({ t: getBiggestType(x, y), v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const MOD = async (op) => { // 34
  console.log('battleOP MOD', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x.v % y.v
  stack.push({ t: getBiggestType(x, y), v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const BAND = async (op) => { // 35
  console.log('battleOP BAND', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x.v & y.v
  stack.push({ t: getBiggestType(x, y), v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const BOR = async (op) => { // 36
  console.log('battleOP BOR', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x.v | y.v
  stack.push({ t: getBiggestType(x, y), v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const BNOT = async (op) => { // 37
  console.log('battleOP BNOT', op)
  const x = stack.pop()
  const z = ~x.v
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}

// 4x: COMPARISONS
const EQU = async (op) => { // 40
  console.log('battleOP EQU', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x == y // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const NEQU = async (op) => { // 41
  console.log('battleOP NEQU', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x != y // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const GEQU = async (op) => { // 42
  console.log('battleOP GEQU', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x >= y // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const LEQU = async (op) => { // 43
  console.log('battleOP LEQU', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x <= y // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const GRTN = async (op) => { // 44
  console.log('battleOP GRTN', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x > y // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const LSTN = async (op) => { // 45
  console.log('battleOP GRTN', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x < y // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}

// 5x: LOGICAL OPERATORS
const AND = async (op) => { // 50
  console.log('battleOP AND', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x != 0 && y != 0 ? 0b1 : 0b0 // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const OR = async (op) => { // 51
  console.log('battleOP OR', op)
  const x = stack.pop(); const y = stack.pop()
  const z = x != 0 || y != 0 ? 0b1 : 0b0 // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}
const NOT = async (op) => { // 52
  console.log('battleOP NOT', op)
  const x = stack.pop()
  const z = x != 0 ? 0b0 : 0b1 // eslint-disable-line eqeqeq
  stack.push({ t: x.t, v: z, vhex: dec2hex(z, 6, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
}

// 6x: CONSTANTS
const PUSHV = async (op) => { // 60, 61, 62
  console.log('battleOP PUSHV', op)
  let type = TYPES.VALUE
  if (op.type === '60') type = TYPES.VALUE
  if (op.type === '61') type = TYPES.ADDRESS
  if (op.type === '62') type = TYPES.MULTI
  stack.push({ t: type, v: op.arg, vhex: dec2hex(op.arg, 4, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
  return {}
}

// 7x: JUMPS
const JMP0 = async (op) => { // 70
  console.log('battleOP JMP0', op)
  const x = stack.pop()
  if (x == 0) { // eslint-disable-line eqeqeq
    console.log('battleOP JMP0 - Jumping', op)
    // TODO - Manage Jumps - return will be {next: arg}
    return { next: op.arg }
  } else {
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

  if (x != y) { // eslint-disable-line eqeqeq
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
  // I assume this is just a flag for reading
  return {}
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
const MASK = async (op) => { // 80
  console.log('battleOP MASK', op)
  // Absolutely *NOTHING* happens (not even popping variables off) if 'y' is a '1x'-type Var
  const [potential] = stack.slice(-1) // Is this y or x ??
  if (potential.t === TYPES.ADDRESS) {
    console.log('battleOP MASK - NO OPERATION ALLOWED')
    return {}
  }

  const x = stack.pop(); const y = stack.pop()
  const z = x.v & y.v
  stack.push({ t: y.t, v: z, vhex: dec2hex(z, 6, true) }) // Is this y or x ??
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
  return {}
}
const RWRD = async (op) => { // 81
  console.log('battleOP RWRD', op)
  const random = Math.floor(Math.random() * (0xFFFF + 1))
  stack.push({ t: TYPES.VALUE, v: random, vhex: dec2hex(random, 4, true) }) // Is this y or x ??
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
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

  stack.push({ t: TYPES.VALUE, v: random, vhex: dec2hex(random, 4, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
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
    stack.push({ t: TYPES.VALUE, v: count, vhex: dec2hex(count, 2, true) })
  } else {
    // If 'x' is a '2x'-type Var however, then 'z' is a '0x'-type Var containing the DWord in 'x'
    // indicated by the first bit set in 'x''s Mask.
    let firstBit = 0
    for (const testBit of testArray12Bits) {
      if (x.v & testBit) {
        firstBit = testBit // TODO - Should this the index of the bit or the value?
        break
      }
    }
    stack.push({ t: TYPES.VALUE, v: firstBit, vhex: dec2hex(firstBit, 2, true) })
  }
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
  return {}
}

const HMSK = async (op) => { // 84
  console.log('battleOP HMSK', op)
  const random = Math.floor(Math.random() * (0xFFFF + 1))
  stack.push({ t: TYPES.MULTI, v: random, vhex: dec2hex(random, 4, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
  // TODO - Tricky, need to look at MULTI, it should be a big set of values (40bytes), stored this as an array by default?
  return {}
}

// .. missed some for now

const TBIT = async (op) => { // 84
  console.log('battleOP TBIT', op)
  const x = stack.pop()
  const bit = parseInt('1' + Array(x.v).fill('0').join(''), 2)
  stack.push({ t: TYPES.VALUE, v: bit, vhex: dec2hex(bit, 4, true) })
  console.log('battleOP STACK', stack.map(s => JSON.stringify(s)))
  return {}
}

export {
  resetStack,
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
  TBIT
}

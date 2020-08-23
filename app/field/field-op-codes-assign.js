import { getBankData, setBankData } from '../data/savemap.js'
import { setBitOn, toggleBit } from './field-op-codes-assign-helper.js'

const PLUS_ = (op) => {
    console.log('PLUS!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc + sDesc, 255)
    setBankData(op.bd, op.d, val)
}
const PLUS2_ = (op) => {
    console.log('PLUS2!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc + sDesc, 255)
    setBankData(op.bd, op.d, val)
}
const MINUS_ = (op) => {
    console.log('MINUS!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.max(dDesc - sDesc, 0)
    setBankData(op.bd, op.d, val)
}
const MINUS2_ = (op) => {
    console.log('MINUS2!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.max(dDesc - sDesc, 0)
    setBankData(op.bd, op.d, val)
}
const INC_ = (op) => {
    console.log('INC!', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = Math.min(bankVal + 1, 255)
    setBankData(op.b, op.a, val)
}
const INC2_ = (op) => {
    console.log('INC2!', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = Math.min(bankVal + 1, 255)
    setBankData(op.b, op.a, val)
}
const DEC_ = (op) => {
    console.log('DEC!', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = Math.max(bankVal - 1, 0)
    setBankData(op.b, op.a, val)
}
const DEC2_ = (op) => {
    console.log('DEC2!', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = Math.max(bankVal - 1, 0)
    setBankData(op.b, op.a, val)
}

const SETBYTE = (op) => {
    console.log('SETBYTE', op)
    // const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const vDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    setBankData(op.bd, op.d, vDesc)
}
const SETWORD = (op) => {
    console.log('SETWORD', op)
    // const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const vDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    setBankData(op.bd, op.d, vDesc)
}
const BITON = (op) => {
    console.log('BITON', op)
    let bankVal = getBankData(op.bd, op.d)
    const val = setBitOn(bankVal, op.bit)
    setBankData(op.bd, op.d, val)
}
const BITOFF = (op) => {
    console.log('BITOFF', op)
    let bankVal = getBankData(op.bd, op.d)
    const val = setBitOff(bankVal, op.bit)
    setBankData(op.bd, op.d, val)
}
const BITXOR = (op) => {
    console.log('BITXOR', op)
    let bankVal = getBankData(op.bd, op.d)
    const val = toggleBit(bankVal, op.bit)
    setBankData(op.bd, op.d, val)
}

const MUL = (op) => {
    console.log('MUL', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc * sDesc, 255)
    setBankData(op.bd, op.d, val)
}
const MUL2 = (op) => {
    console.log('MUL2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc * sDesc, 255)
    setBankData(op.bd, op.d, val)
}
const DIV = (op) => {
    console.log('DIV', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.floor(dDesc / sDesc)
    setBankData(op.bd, op.d, val)
}
const DIV2 = (op) => {
    console.log('DIV2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.floor(dDesc / sDesc)
    setBankData(op.bd, op.d, val)
}
const MOD = (op) => {
    console.log('MOD', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc % sDesc
    setBankData(op.bd, op.d, val)
}
const MOD2 = (op) => {
    console.log('MOD2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc % sDesc
    setBankData(op.bd, op.d, val)
}

const AND = (op) => {
    console.log('AND', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc & sDesc
    setBankData(op.bd, op.d, val)
}
const AND2 = (op) => {
    console.log('AND2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc & sDesc
    setBankData(op.bd, op.d, val)
}
const OR = (op) => {
    console.log('OR', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc | sDesc
    setBankData(op.bd, op.d, val)
}
const OR2 = (op) => {
    console.log('OR2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc | sDesc
    setBankData(op.bd, op.d, val)
}
const XOR = (op) => {
    console.log('XOR', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc ^ sDesc
    setBankData(op.bd, op.d, val)
}
const XOR2 = (op) => {
    console.log('XOR2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc ^ sDesc
    setBankData(op.bd, op.d, val)
}




const UNUSED = () => {
    console.log('UNUSED')
}
const PLUS = (op) => {
    console.log('PLUS', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = (dDesc + sDesc) % 255
    setBankData(op.bd, op.d, val)
}
const PLUS2 = (op) => {
    console.log('PLUS2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = (dDesc + sDesc) % 255
    setBankData(op.bd, op.d, val)
}
const MINUS = (op) => {
    console.log('MINUS', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    let val = (dDesc - sDesc) % 255
    if (val < 0) { val = 255 - Math.abs(val) }
    setBankData(op.bd, op.d, val)
}
const MINUS2 = (op) => {
    console.log('MINUS2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    let val = (dDesc - sDesc) % 255
    if (val < 0) { val = 255 - Math.abs(val) }
    setBankData(op.bd, op.d, val)
}
const INC = (op) => {
    console.log('INC', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = (bankVal + 1) % 255
    setBankData(op.b, op.a, val)
}
const INC2 = (op) => {
    console.log('INC2', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = (bankVal + 1) % 255
    setBankData(op.b, op.a, val)
}
const DEC = (op) => {
    console.log('DEC', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    let val = (bankVal - 1) % 255
    if (val < 0) { val = 255 - Math.abs(val) }
    setBankData(op.b, op.a, val)
}
const DEC2 = (op) => {
    console.log('DEC2', op)
    let val = (bankVal - 1) % 255
    if (val < 0) { val = 255 - Math.abs(val) }
    setBankData(op.b, op.a, val)
}

// SIN & COS, have a lot of parameters, will look another time. I believe its only on temple of ancients clock

export {
    PLUS_,
    PLUS2_,
    MINUS_,
    MINUS2_,
    INC_,
    INC2_,
    DEC_,
    DEC2_,

    SETBYTE,
    SETWORD,
    BITON,
    BITOFF,
    BITXOR,

    MUL,
    MUL2,
    DIV,
    DIV2,
    MOD,
    MOD2,

    AND,
    AND2,
    OR,
    OR2,
    XOR,
    XOR2,

    UNUSED,
    PLUS,
    PLUS2,
    MINUS,
    MINUS2,
    INC,
    INC2,
    DEC,
    DEC2
}
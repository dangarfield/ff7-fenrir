import { getBankData, setBankData } from '../data/savemap.js'
import { setBitOn, setBitOff, toggleBit } from './field-op-codes-assign-helper.js'

/*
Note: I haven't checked that many of these and assume the Long (!)
functions will be the same because the banks will be specified. But it may be that
in the low/high bytes may have to be parsed in the saving
*/
const PLUS_ = (op) => {
    console.log('PLUS!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc + sDesc, 255)
    setBankData(op.bd, op.d, val)
    return {}
}
const PLUS2_ = (op) => {
    console.log('PLUS2!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc + sDesc, 255)
    setBankData(op.bd, op.d, val)
    return {}
}
const MINUS_ = (op) => {
    console.log('MINUS!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.max(dDesc - sDesc, 0)
    setBankData(op.bd, op.d, val)
    return {}
}
const MINUS2_ = (op) => {
    console.log('MINUS2!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.max(dDesc - sDesc, 0)
    setBankData(op.bd, op.d, val)
    return {}
}
const INC_ = (op) => {
    console.log('INC!', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = Math.min(bankVal + 1, 255)
    setBankData(op.b, op.a, val)
    return {}
}
const INC2_ = (op) => {
    console.log('INC2!', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = Math.min(bankVal + 1, 255)
    setBankData(op.b, op.a, val)
    return {}
}
const DEC_ = (op) => {
    console.log('DEC!', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = Math.max(bankVal - 1, 0)
    setBankData(op.b, op.a, val)
    return {}
}
const DEC2_ = (op) => {
    console.log('DEC2!', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = Math.max(bankVal - 1, 0)
    setBankData(op.b, op.a, val)
    return {}
}

const RDMSD = (op) => {
    console.log('RDMSD', op)
    // Note: I believe FF7 uses tables for RNG, let's just use JS for now
    // http://forums.qhimm.com/index.php?topic=6431
    const val = Math.floor(Math.random() * 255)
    setBankData(op.b, op.s, val)
    // console.log('RDMSD', val, getBankData(op.b, op.s))
    return {}
}

const SETBYTE = (op) => {
    console.log('SETBYTE', op)
    // const dDesc = op.bd == 0 ? op.a : getBankData(op.bd, op.a)
    const vDesc = op.bs == 0 ? op.v : getBankData(op.bs, op.v)
    setBankData(op.bd, op.a, vDesc)
    return {}
}
const SETWORD = (op) => {
    console.log('SETWORD', op)
    // const dDesc = op.bd == 0 ? op.a : getBankData(op.bd, op.a)
    const vDesc = op.bs == 0 ? op.v : getBankData(op.bs, op.v)
    setBankData(op.bd, op.a, vDesc)
    return {}
}
const BITON = (op) => {
    console.log('BITON', op)
    let bankVal = getBankData(op.bd, op.d)
    const val = setBitOn(bankVal, op.bit)
    setBankData(op.bd, op.d, val)
    return {}
}
const BITOFF = (op) => {
    console.log('BITOFF', op)
    let bankVal = getBankData(op.bd, op.d)
    const val = setBitOff(bankVal, op.bit)
    setBankData(op.bd, op.d, val)
    return {}
}
const BITXOR = (op) => {
    console.log('BITXOR', op)
    let bankVal = getBankData(op.bd, op.d)
    const val = toggleBit(bankVal, op.bit)
    setBankData(op.bd, op.d, val)
    return {}
}

const MUL = (op) => {
    console.log('MUL', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc * sDesc, 255)
    setBankData(op.bd, op.d, val)
    return {}
}
const MUL2 = (op) => {
    console.log('MUL2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc * sDesc, 255)
    setBankData(op.bd, op.d, val)
    return {}
}
const DIV = (op) => {
    console.log('DIV', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.floor(dDesc / sDesc)
    setBankData(op.bd, op.d, val)
    return {}
}
const DIV2 = (op) => {
    console.log('DIV2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.floor(dDesc / sDesc)
    setBankData(op.bd, op.d, val)
    return {}
}
const MOD = (op) => {
    console.log('MOD', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc % sDesc
    setBankData(op.bd, op.d, val)
    return {}
}
const MOD2 = (op) => {
    console.log('MOD2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc % sDesc
    setBankData(op.bd, op.d, val)
    return {}
}

const AND = (op) => {
    console.log('AND', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc & sDesc
    setBankData(op.bd, op.d, val)
    return {}
}
const AND2 = (op) => {
    console.log('AND2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc & sDesc
    setBankData(op.bd, op.d, val)
    return {}
}
const OR = (op) => {
    console.log('OR', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc | sDesc
    setBankData(op.bd, op.d, val)
    return {}
}
const OR2 = (op) => {
    console.log('OR2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc | sDesc
    setBankData(op.bd, op.d, val)
    return {}
}
const XOR = (op) => {
    console.log('XOR', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc ^ sDesc
    setBankData(op.bd, op.d, val)
    return {}
}
const XOR2 = (op) => {
    console.log('XOR2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = dDesc ^ sDesc
    setBankData(op.bd, op.d, val)
    return {}
}


const UNUSED = () => {
    console.log('UNUSED')
    return {}
}
const PLUS = (op) => {
    console.log('PLUS', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = (dDesc + sDesc) % 256
    console.log('PLUS', op, dDesc, sDesc, val)
    setBankData(op.bd, op.d, val)
    return {}
}
const PLUS2 = (op) => {
    console.log('PLUS2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = (dDesc + sDesc) % 256
    setBankData(op.bd, op.d, val)
    return {}
}
const MINUS = (op) => {
    console.log('MINUS', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    let val = (dDesc - sDesc) % 256
    if (val < 0) { val = 255 - Math.abs(val) }
    setBankData(op.bd, op.d, val)
    return {}
}
const MINUS2 = (op) => {
    console.log('MINUS2', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    let val = (dDesc - sDesc) % 256
    if (val < 0) { val = 256 - Math.abs(val) }
    setBankData(op.bd, op.d, val)
    return {}
}
const INC = (op) => {
    console.log('INC', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = (bankVal + 1) % 256
    setBankData(op.b, op.a, val)
    return {}
}
const INC2 = (op) => {
    console.log('INC2', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    const val = (bankVal + 1) % 256
    setBankData(op.b, op.a, val)
    return {}
}
const DEC = (op) => {
    console.log('DEC', op)
    let bankVal = op.b == 0 ? op.a : getBankData(op.b, op.a)
    let val = (bankVal - 1) % 256
    if (val < 0) { val = 256 - Math.abs(val) }
    setBankData(op.b, op.a, val)
    return {}
}
const DEC2 = (op) => {
    console.log('DEC2', op)
    let val = (bankVal - 1) % 256
    if (val < 0) { val = 256 - Math.abs(val) }
    setBankData(op.b, op.a, val)
    return {}
}

const RANDOM = (op) => {
    console.log('RANDOM', op)
    // Note: I believe FF7 uses tables for RNG, let's just use JS for now
    // http://forums.qhimm.com/index.php?topic=6431
    const val = Math.floor(Math.random() * 255)
    setBankData(op.b, op.a, val)
    // console.log('RANDOM', op, val, getBankData(op.b, op.a))
    return {}
}

const LBYTE = (op) => {
    console.log('LBYTE', op)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    // const highByte = ((sDesc >> 8) & 0xff)
    const lowByte = sDesc & 0xff
    setBankData(op.bd, op.d, lowByte)
    return {}
}
const HBYTE = (op) => {
    console.log('HBYTE', op)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const highByte = ((sDesc >> 8) & 0xff)
    // const lowByte = sDesc & 0xff
    setBankData(op.bd, op.d, highByte)
    return {}
}
const TWO_BYTE = (op) => {
    console.log('2BYTE', op)
    const lDesc = op.b2 == 0 ? op.l : getBankData(op.b2, op.l)
    const hDesc = op.b3 == 0 ? op.h : getBankData(op.b3, op.h)
    const bit16 = (((hDesc & 0xff) << 8) | (lDesc & 0xff))
    setBankData(op.b1, op.d, bit16)
    return {}
}
const SIN = (op) => {
    console.log('SIN', op)
    const m = op.b2 == 0 ? op.m : getBankData(op.b2, op.m)
    const a = op.b3 == 0 ? op.a : getBankData(op.b3, op.a)
    const s = op.b4 == 0 ? op.s : getBankData(op.b4, op.s)
    const value = ((Math.sin(s) * m) + a) >> 12 // Var[B1][D] = ( ( Math.sin(Var[B4][S]) * M) + A) >> 12
    setBankData(op.b1, op.d, value)
    return {}
}
const COS = (op) => {
    console.log('COS', op)
    const m = op.b2 == 0 ? op.m : getBankData(op.b2, op.m)
    const a = op.b3 == 0 ? op.a : getBankData(op.b3, op.a)
    const s = op.b4 == 0 ? op.s : getBankData(op.b4, op.s)
    const value = ((Math.cos(s) * m) + a) >> 12 // Var[B1][D] = ( ( Math.cos(Var[B4][S]) * M) + A) >> 12
    setBankData(op.b1, op.d, value)
    return {}
}

export {
    PLUS_,
    PLUS2_,
    MINUS_,
    MINUS2_,
    INC_,
    INC2_,
    DEC_,
    DEC2_,

    RDMSD,
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
    DEC2,

    RANDOM,
    LBYTE,
    HBYTE,
    TWO_BYTE,
    SIN,
    COS
}
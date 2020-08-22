import { sleep } from '../helpers/helpers.js'
import { compareFromBankData, getOpIndexForByteIndex } from './field-op-codes-flow-helper.js'

const RET = async () => {
    console.log('RET')
    return { exit: true }
}
const IFUB = async (ops, op) => {
    console.log('IFUB', ops, op)
    return compareFromBankData(ops, op)
}
const IFUBL = async (ops, op) => {
    console.log('IFUBL', ops, op)
    return compareFromBankData(ops, op)
}
const IFSW = async (ops, op) => {
    console.log('IFSW', ops, op)
    return compareFromBankData(ops, op)
}
const IFSWL = async (ops, op) => {
    console.log('IFSWL', ops, op)
    return compareFromBankData(ops, op)
}
const IFUW = async (ops, op) => {
    console.log('IFUW', ops, op)
    return compareFromBankData(ops, op)
}
const IFUWL = async (ops, op) => {
    console.log('IFUWL', ops, op)
    return compareFromBankData(ops, op)
}
const JMPF = async (ops, op) => {
    console.log('JMPF', ops, op)
    return getOpIndexForByteIndex(ops, op.goto)
}
const JMPFL = async (ops, op) => {
    console.log('JMPFL', ops, op)
    return getOpIndexForByteIndex(ops, op.goto)
}
const JMPB = async (ops, op) => {
    console.log('JMPB', ops, op)
    // This sleep shouldn't really happen here
    // but it's just a safeguard as to protect fast processing loops
    // whilst waiting for a var to be set
    await sleep(200)
    return getOpIndexForByteIndex(ops, op.goto)
}
const JMPBL = async (ops, op) => {
    console.log('JMPBL', ops, op)
    // This sleep shouldn't really happen here
    // but it's just a safeguard as to protect fast processing loops
    // whilst waiting for a var to be set
    await sleep(200)
    return getOpIndexForByteIndex(ops, op.goto)
}
const NOP = async () => {
    console.log('NOP')
    return { flow: true }
}

export {
    RET,
    IFUB,
    IFUBL,
    IFSW,
    IFSWL,
    IFUW,
    IFUWL,
    JMPF,
    JMPFL,
    JMPB,
    JMPBL,
    NOP
}
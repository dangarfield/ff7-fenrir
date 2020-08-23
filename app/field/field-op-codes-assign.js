import { getBankData, setBankData } from '../data/savemap.js'

const PLUS_ = (op) => {
    console.log('PLUS!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc + sDesc, 255)
    setBankData(op.bs, op.s, val)
}
const PLUS2_ = (op) => {
    console.log('PLUS2!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.min(dDesc + sDesc, 255)
    setBankData(op.bs, op.s, val)
}
const MINUS_ = (op) => {
    console.log('MINUS!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.max(dDesc - sDesc, 0)
    setBankData(op.bs, op.s, val)
}
const MINUS2_ = (op) => {
    console.log('MINUS2!', op)
    const dDesc = op.bd == 0 ? op.d : getBankData(op.bd, op.d)
    const sDesc = op.bs == 0 ? op.s : getBankData(op.bs, op.s)
    const val = Math.max(dDesc - sDesc, 0)
    setBankData(op.bs, op.s, val)
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

export {
    PLUS_,
    PLUS2_,
    MINUS_,
    MINUS2_,
    INC_,
    INC2_,
    DEC_,
    DEC2_
}
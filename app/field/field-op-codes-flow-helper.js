import { sleep } from '../helpers/helpers.js'
import { getBankData } from '../data/savemap.js'

const executeCompare = (a, operator, b) => {
    if (operator == 0) return a == b
    if (operator == 1) return a != b
    if (operator == 2) return a > b
    if (operator == 3) return a < b
    if (operator == 4) return a >= b
    if (operator == 5) return a <= b
    if (operator == 6) return a & b
    if (operator == 7) return a ^ b
    if (operator == 8) return a | b
    if (operator == 9) return a & (1 << b)
    if (operator == 10) return !((a & (1 << b)))
    window.alert('unknown operator', operator)
    return false
}
const printCompare = (a, operator, b) => {
    if (operator == 0) return `${a} == ${b}`
    if (operator == 1) return `${a} != ${a}`
    if (operator == 2) return `${a} > ${a}`
    if (operator == 3) return `${a} < ${a}`
    if (operator == 4) return `${a} >= ${a}`
    if (operator == 5) return `${a} <= ${a}`
    if (operator == 6) return `${a} & ${a}`
    if (operator == 7) return `${a} ^ ${a}`
    if (operator == 8) return `${a} | ${a}`
    if (operator == 9) return `${a} & (1 << ${a})`
    if (operator == 10) return `!((${a} & (1 << ${a})))`
    // window.alert('unknown operator', operator)
    return false
}
const getOpIndexForByteIndex = (ops, goto) => {
    for (let i = 0; i < ops.length; i++) {
        if (ops[i].byteIndex === goto) {
            return { flow: true, goto: i, gotoByteIndex: goto }
        }
    }
    window.alert('No matching byteIndex for goto', goto)
    return { flow: true }
}

const compareFromBankData = (ops, op) => {
    const leftCompare = op.b1 == 0 ? op.a : getBankData(op.b1, op.a)
    const rightCompare = op.b2 == 0 ? op.v : getBankData(op.b2, op.v)
    const result = executeCompare(leftCompare, op.c, rightCompare)
    // console.log('result', printCompare(leftCompare, op.c, rightCompare), '->', result)

    // await sleep(2000)
    if (result) { // Continue inside if statement
        return { flow: true }
    } else { // Bypass if statement
        return getOpIndexForByteIndex(ops, op.goto)
    }
}
export {
    getOpIndexForByteIndex,
    compareFromBankData
}
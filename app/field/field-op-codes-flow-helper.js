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
    if (operator == 1) return `${a} != ${b}`
    if (operator == 2) return `${a} > ${b}`
    if (operator == 3) return `${a} < ${b}`
    if (operator == 4) return `${a} >= ${b}`
    if (operator == 5) return `${a} <= ${b}`
    if (operator == 6) return `${a} & ${b}`
    if (operator == 7) return `${a} ^ ${b}`
    if (operator == 8) return `${a} | ${b}`
    if (operator == 9) return `${a} & (1 << ${b})`
    if (operator == 10) return `!((${a} & (1 << ${b})))`
    // window.alert('unknown operator', operator)
    return false
}
const getOpIndexForByteIndex = (ops, goto) => {
    for (let i = 0; i < ops.length; i++) {
        if (ops[i].byteIndex === goto) {
            return { goto: i, gotoByteIndex: goto }
        }
    }
    // window.alert('No matching byteIndex for goto', goto)
    return { exit: true }
}

const compareFromBankData = (ops, op) => {
    const leftCompare = op.b1 == 0 ? op.a : getBankData(op.b1, op.a)
    const rightCompare = op.b2 == 0 ? op.v : getBankData(op.b2, op.v)
    const result = executeCompare(leftCompare, op.c, rightCompare)
    // const printedCompare = printCompare(leftCompare, op.c, rightCompare)
    // console.log('result', printedCompare, '->', result)

    // await sleep(2000)
    if (result) { // Continue inside if statement
        return {}
    } else { // Bypass if statement
        return getOpIndexForByteIndex(ops, op.goto)
    }
}
const KEYS = {
    select: 0x0001, // Assist
    start: 0x0008, // Start
    up: 0x0010, // Up
    right: 0x0020, // Right
    down: 0x0040, // Down
    left: 0x0080, // Left
    l2: 0x0100, // Camera
    r2: 0x0200, // Target
    l1: 0x0400, // PageUp
    r1: 0x0800, // PageDown
    triangle: 0x1000, // Menu
    o: 0x2000, // OK
    x: 0x4000, // Cancel
    square: 0x8000 // Switch
}
const getKeysFromBytes = (val) => {
    let enums = []
    for (var prop in KEYS) {
        if ((val & KEYS[prop]) === KEYS[prop]) { // Bitwise matching
            enums.push(prop)
        }
    }
    return enums
}
export {
    getOpIndexForByteIndex,
    compareFromBankData,
    getKeysFromBytes
}
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
    l2: 1, // Camera
    r2: 2, // Target
    l1: 4, // PageUp
    r1: 8, // PageDown
    triangle: 16, // Menu
    o: 32, // OK
    x: 64, // Cancel
    square: 128, // Switch
    select: 256, // Assist
    unknown1: 512,
    unknown2: 1024,
    start: 2048, // Start
    up: 4096, // Up
    right: 8192, // Right
    down: 16384, // Down
    left: 32768, // Left
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
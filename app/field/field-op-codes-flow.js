import { sleep } from '../helpers/helpers.js'
import { compareFromBankData, getOpIndexForByteIndex, getKeysFromBytes } from './field-op-codes-flow-helper.js'
import { executeScriptLoop } from './field-op-loop.js'
import { getActiveInputs, getInputHistory } from '../interaction/inputs.js'
// Note: Not sure about priority as of yet. Which may warrant a rewrite

const RET = async () => {
    console.log('RET')
    return { exit: true }
}

const REQ = async (entityName, scriptType, op) => {
    console.log('REQ', entityName, scriptType, op)
    const entity = window.currentField.data.script.entities[op.e]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    // console.log('script', entity, script, script.isRunning)

    // Need to validate where 'unless busy' means this entities scripts (non-init, non-main) are running
    // or just this script. For now, assume it is just this script
    if (script.isRunning) {
        console.log('REQ no running script as it is already running', entity, script, script.isRunning)
        return {}
    }
    executeScriptLoop(entity.entityName, script) // Async
    return {}
}
const REQSW = async (entityName, scriptType, op) => {
    console.log('REQSW', entityName, scriptType, op)
    const entity = window.currentField.data.script.entities[op.e]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    // console.log('script', entity, script, script.isRunning)
    // No need to check it is running
    executeScriptLoop(entity.entityName, script) // Async
    return {}
}
const REQEW = async (entityName, scriptType, op) => {
    console.log('REQEW', entityName, scriptType, op)
    const entity = window.currentField.data.script.entities[op.e]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    // console.log('script', entity, script, script.isRunning)
    // No need to check it is running
    await executeScriptLoop(entity.entityName, script) // Sync
    return {}
}

// TODO: PREQ, PRQSW, PRQEW is more of a pain as we have to know which characters are in our current party which I haven't done yet

const RETTO = async (entityName, scriptType, op) => {
    console.log('RETTO', entityName, scriptType, op)
    const entity = window.currentField.data.script.entities.filter(e => e.entityName === entityName)[0]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    // console.log('script', entity, script, script.isRunning)
    // No need to check it is running
    executeScriptLoop(entity.entityName, script) // Async
    return {}
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
    // await sleep(200)
    await sleep(20000)
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

const WAIT = async (op) => {
    console.log('WAIT', op)
    // Should really compare clock deltas in rendering loop, but this is easiest for a start
    const waitMs = Math.round(1000 * (op.a / 30)) //30 fps
    await sleep(waitMs)
    return {}
}
const IFKEY = async (ops, op) => {
    console.log('IFKEY', ops, op)
    const keys = getKeysFromBytes(op.b)
    const activeInputs = getActiveInputs()
    let result = false
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (activeInputs[key]) {
            result = true
            break
        }
    }
    console.log('IFKEY result', result)
    // TODO - If waiting for a keypress, we may need to stop the flow:true, or maybe add a sleep to help FPS
    if (result) { // Continue inside if statement
        return { flow: true }
    } else { // Bypass if statement
        return getOpIndexForByteIndex(ops, op.goto)
    }
}
const IFKEYON = async (ops, op) => {
    console.log('IFKEYON', ops, op)
    const keys = getKeysFromBytes(op.b)
    const history = getInputHistory()
    let result = false
    for (let i = 0; i < history.length; i++) {
        const historyKey = history[i]
        if (keys.includes(historyKey)) {
            if (historyKey.keyDown === true) {
                result = true
            } else {
                result = false
            }
            break
        }
    }
    console.log('IFKEYON result', result)
    // TODO - If waiting for a keypress, we may need to stop the flow:true, or maybe add a sleep to help FPS
    if (result) { // Continue inside if statement
        return { flow: true }
    } else { // Bypass if statement
        return getOpIndexForByteIndex(ops, op.goto)
    }
}
const IFKEYOFF = async (ops, op) => {
    console.log('IFKEYOFF', ops, op)
    const keys = getKeysFromBytes(op.b)
    const history = getInputHistory()
    let result = false
    for (let i = 0; i < history.length; i++) {
        const historyKey = history[i]
        if (keys.includes(historyKey)) {
            if (historyKey.keyDown === false) {
                result = true
            } else {
                result = false
            }
            break
        }
    }
    console.log('IFKEYOFF result', result)
    // TODO - If waiting for a keypress, we may need to stop the flow:true, or maybe add a sleep to help FPS
    if (result) { // Continue inside if statement
        return { flow: true }
    } else { // Bypass if statement
        return getOpIndexForByteIndex(ops, op.goto)
    }
}
const NOP = async () => {
    console.log('NOP')
    return { flow: true }
}

export {
    RET,
    REQ,
    REQSW,
    REQEW,
    RETTO,
    JMPF,
    JMPFL,
    JMPB,
    JMPBL,
    IFUB,
    IFUBL,
    IFSW,
    IFSWL,
    IFUW,
    IFUWL,
    WAIT,
    IFKEY,
    IFKEYON,
    IFKEYOFF,
    NOP
}
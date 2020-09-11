import { sleep } from '../helpers/helpers.js'
import { compareFromBankData, getOpIndexForByteIndex, getKeysFromBytes } from './field-op-codes-flow-helper.js'
import { executeScriptLoop } from './field-op-loop.js'
import { getActiveInputs, getInputHistory } from '../interaction/inputs.js'
import { getPlayableCharacterName } from './field-op-codes-party-helper.js'
import { getModelByPartyMemberId } from './field-models.js'

// Note: Not sure about priority as of yet. Which may warrant a rewrite

const RET = async () => {
    console.log('RET')
    return { exit: true }
}

const REQ = async (entityId, scriptType, op) => {
    console.log('REQ', entityId, scriptType, op)
    const entity = window.currentField.data.script.entities[op.e]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    // console.log('script', entity, script, script.isRunning)

    // Need to validate where 'unless busy' means this entities scripts (non-init, non-main) are running
    // or just this script. For now, assume it is just this script
    if (script.isRunning) {
        console.log('REQ no running script as it is already running', entity, script, script.isRunning)
        return {}
    }
    executeScriptLoop(entity.entityId, script) // Async
    return {}
}
const REQSW = async (entityId, scriptType, op) => {
    console.log('REQSW', entityId, scriptType, op)
    const entity = window.currentField.data.script.entities[op.e]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    // console.log('script', entity, script, script.isRunning)
    // No need to check it is running
    executeScriptLoop(entity.entityId, script) // Async
    return {}
}
const REQEW = async (entityId, scriptType, op) => {
    console.log('REQEW', entityId, scriptType, op)
    const entity = window.currentField.data.script.entities[op.e]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    // console.log('script', entity, script, script.isRunning)
    // No need to check it is running
    await executeScriptLoop(entity.entityId, script) // Sync
    return {}
}
const PREQ = async (entityId, scriptType, op) => {
    console.log('PREQ', entityId, scriptType, op)
    const model = getModelByPartyMemberId(op.e)
    const entity = window.currentField.data.script.entities[model.userData.entityId]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    executeScriptLoop(entity.entityId, script) // Async
    return {}
}
const PRQSW = async (entityId, scriptType, op) => {
    console.log('PRQSW', entityId, scriptType, op)
    const model = getModelByPartyMemberId(op.e)
    const entity = window.currentField.data.script.entities[model.userData.entityId]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    executeScriptLoop(entity.entityId, script) // Async
    return {}
}
const PRQEW = async (entityId, scriptType, op) => {
    console.log('PRQEW', entityId, scriptType, op)
    const model = getModelByPartyMemberId(op.e)
    const entity = window.currentField.data.script.entities[model.userData.entityId]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    await executeScriptLoop(entity.entityId, script) // Sync
    return {}
}

const RETTO = async (entityId, scriptType, op) => {
    console.log('RETTO', entityId, scriptType, op)
    const entity = window.currentField.data.script.entities[entityId]
    const script = entity.scripts.filter(s => s.index === op.f)[0]
    // console.log('script', entity, script, script.isRunning)
    // No need to check it is running
    executeScriptLoop(entity.entityId, script) // Async
    return {}
}

const JMPF = async (ops, op) => {
    console.log('JMPF', ops, op)
    await sleep(1000 / 30)
    const result = getOpIndexForByteIndex(ops, op.goto)
    result.flow = true
    return result
}
const JMPFL = async (ops, op) => {
    console.log('JMPFL', ops, op)
    await sleep(1000 / 30)
    const result = getOpIndexForByteIndex(ops, op.goto)
    result.flow = true
    return result
}
const JMPB = async (ops, op) => {
    console.log('JMPB', ops, op)
    // This sleep shouldn't really happen here
    // but it's just a safeguard as to protect fast processing loops
    // whilst waiting for a var to be set
    // await sleep(200)
    await sleep(1000 / 30)
    const result = getOpIndexForByteIndex(ops, op.goto)
    result.flow = true
    return result
}
const JMPBL = async (ops, op) => {
    console.log('JMPBL', ops, op)
    // This sleep shouldn't really happen here
    // but it's just a safeguard as to protect fast processing loops
    // whilst waiting for a var to be set
    await sleep(1000 / 30)
    const result = getOpIndexForByteIndex(ops, op.goto)
    result.flow = true
    return result
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
        if (keys.includes(historyKey.key)) {
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
        if (keys.includes(historyKey.key)) {
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

const IFPRTYQ = async (ops, op) => {
    console.log('IFPRTYQ', ops, op)
    const currentPartyMembers = window.data.savemap.party.members
    const opPartyMember = getPlayableCharacterName(op.c)
    if (currentPartyMembers.includes(opPartyMember)) {
        return { flow: true }
    } else { // Bypass if statement
        return getOpIndexForByteIndex(ops, op.goto)
    }
}
const IFMEMBQ = async (ops, op) => {
    console.log('IFMEMBQ', ops, op)
    const opPartyMember = getPlayableCharacterName(op.c)
    const isAvailable = window.data.savemap.party.characterAvailability[opPartyMember]
    if (isAvailable) {
        return { flow: true }
    } else { // Bypass if statement
        return getOpIndexForByteIndex(ops, op.goto)
    }
}
export {
    RET,
    REQ,
    REQSW,
    REQEW,
    PREQ,
    PRQSW,
    PRQEW,
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
    NOP,
    IFPRTYQ,
    IFMEMBQ
}
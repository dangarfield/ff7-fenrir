import * as flow from './field-op-codes-flow.js'
import * as control from './field-op-codes-control.js'
import * as assign from './field-op-codes-assign.js'
import * as windowMenu from './field-op-codes-window.js'
import * as party from './field-op-codes-party.js'
import * as models from './field-op-codes-models.js'
import * as background from './field-op-codes-background.js'
import * as cameraMedia from './field-op-codes-camera-media.js'
import * as misc from './field-op-codes-misc.js'

let STOP_ALL_LOOPS = false

const executeOp = async (ops, op) => {
    console.log('   - executeOp: START', op)
    if (STOP_ALL_LOOPS) {
        console.log('Loop stopping')
    }

    let result = {}
    switch (op.op) {
        // Script Flow and Control
        case 'RET': result = await flow.RET(); break
        case 'IFUB': result = await flow.IFUB(ops, op); break
        case 'IFUBL': result = await flow.IFUBL(ops, op); break
        case 'IFSW': result = await flow.IFSW(ops, op); break
        case 'IFSWL': result = await flow.IFSWL(ops, op); break
        case 'IFUW': result = await flow.IFUW(ops, op); break
        case 'IFUWL': result = await flow.IFUWL(ops, op); break

        case 'JMPF': result = await flow.JMPF(ops, op); break
        case 'JMPFL': result = await flow.JMPFL(ops, op); break
        case 'JMPB': result = await flow.JMPB(ops, op); break
        case 'JMPBL': result = await flow.JMPBL(ops, op); break

        case 'NOP': result = await flow.NOP(); break

        // System and Module Control

        // Assignment and Mathematics

        // Windowing and Menu

        // Party and Inventory

        // Field Models and Animation

        // Background and Palette

        // Camera, Audio and Video
        case 'SCR2D': result = await cameraMedia.SCR2D(ops, op); break

        // Uncategorized


        default:
            console.log(`--------- OP: ${op.op} - NOT YET IMPLEMENTED ---------`)
            break;
    }

    console.log('   - executeOp: END', op, result)
    return result
}
const stopAllLoops = () => {
    STOP_ALL_LOOPS = true
}

const executeScriptLoop = async (loop) => {
    console.log(' - executeScriptLoop: START', loop)
    const ops = loop.ops
    let currentOpIndex = 0
    let flowActionCount = 0
    while (currentOpIndex < ops.length) {
        if (flowActionCount >= 10) {
            // Need to test this, as it could be waiting for the presence of a variable to change
            console.log(' - executeScriptLoop: TOO MANY CONSECUIVE GOTO - QUITTING LOOP')
            break
        }

        let op = ops[currentOpIndex]
        const result = await executeOp(ops, op)
        console.log(' - executeScriptLoop: RESULT', result, currentOpIndex, flowActionCount)
        if (result.exit) {
            console.log(' - executeScriptLoop: EXIT')
        }
        if (result.flow) {
            flowActionCount++
        } else {
            flowActionCount = 0
        }
        if (result.goto === undefined) {
            console.log('nextOpIndex null', result.goto)
            currentOpIndex++
        } else {
            console.log('nextOpIndex not null', result.goto)
            currentOpIndex = result.goto
        }

    }
    console.log(' - executeScriptLoop: END')
}
const initEntity = async (entity) => {
    console.log('initEntity: START', entity.entityName, entity)
    const initLoop = entity.scripts.filter(s => s.index === 0 && s.isMain === undefined)[0]
    console.log('initLoop', initLoop)
    await executeScriptLoop(initLoop)
    const mainLoop = entity.scripts.filter(s => s.index === 0 && s.isMain)[0]
    console.log('mainLoop', mainLoop)
    // await executeScriptLoop(mainLoop)
    console.log('initEntity: END', entity.entityName)
}

const initialiseOpLoops = async () => {
    console.log('initialiseOpLoops: START')
    STOP_ALL_LOOPS = false
    const entities = window.currentField.data.script.entities
    for (let i = 0; i < 1; i++) {
        const entity = entities[i]
        initEntity(entity) // All running async
    }
    console.log('initialiseOpLoops: END')
}
export {
    initialiseOpLoops,
    stopAllLoops
}
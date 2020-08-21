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
    switch (op.op) {
        case 'SCR2D': await cameraMedia.SCR2D(ops, op); break;

        default:
            console.log(`--------- OP: ${op.op} - NOT YET IMPLEMENTED ---------`)
            break;
    }

    console.log('   - executeOp: END', op)
    return
}
const stopAllLoops = () => {
    STOP_ALL_LOOPS = true
}

const executeScriptLoop = async (loop) => {
    console.log(' - executeScriptLoop: START', loop)
    const ops = loop.ops
    let currentOpIndex = 0
    while (currentOpIndex < ops.length) {
        let op = ops[currentOpIndex]
        const nextOpIndex = await executeOp(ops, op)

        if (nextOpIndex === undefined) {
            // console.log('nextOpIndex null', nextOpIndex)
            currentOpIndex++
        } else {
            // console.log('nextOpIndex not null', nextOpIndex)
            currentOpIndex = nextOpIndex
        }

    }
    console.log(' - executeScriptLoop: END')
}
const initEntity = async (entity) => {
    console.log('initEntity: START', entity.entityName, entity)
    const initLoop = entity.scripts.filter(s => s.index === 0 && s.isMain === undefined)[0]
    console.log('initLoop', initLoop)
    await executeScriptLoop(initLoop)
    // const mainLoop = entity.scripts.filter(s => s.index === 0 && s.isMain)[0]
    // console.log('mainLoop', mainLoop)
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
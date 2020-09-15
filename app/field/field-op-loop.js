import * as flow from './field-op-codes-flow.js'
import * as control from './field-op-codes-control.js'
import * as assign from './field-op-codes-assign.js'
import * as windowMenu from './field-op-codes-window.js'
import * as party from './field-op-codes-party.js'
import * as models from './field-op-codes-models.js'
import * as background from './field-op-codes-background.js'
import * as cameraMedia from './field-op-codes-camera-media.js'
import * as misc from './field-op-codes-misc.js'
import { sendOpFlowEvent, LoopVisualiserIcons } from './field-op-loop-visualiser.js'
import { positionPlayableCharacterFromTransition } from './field-models.js'
import { sleep } from '../helpers/helpers.js'
import TWEEN from '../../assets/tween.esm.js'

let CURRENT_FIELD = 'None'

const executeOp = async (fieldName, entityId, scriptType, ops, op, currentOpIndex) => {
    console.log('   - executeOp: START', fieldName, entityId, scriptType, op)
    if (CURRENT_FIELD !== fieldName) {
        console.log('Loop stopping', CURRENT_FIELD, '!==', fieldName)
        sendOpFlowEvent(entityId, scriptType, LoopVisualiserIcons.KILL, currentOpIndex + 1)
        return { exit: true }
    }
    sendOpFlowEvent(entityId, scriptType, op.op, currentOpIndex + 1)
    let result = {}
    switch (op.op) {
        // Script Flow and Control
        case 'RET': result = await flow.RET(); break

        case 'REQ': result = await flow.REQ(fieldName, entityId, scriptType, op); break
        case 'REQSW': result = await flow.REQSW(fieldName, entityId, scriptType, op); break
        case 'REQEW': result = await flow.REQEW(fieldName, entityId, scriptType, op); break
        case 'PREQ': result = await flow.PREQ(fieldName, entityId, scriptType, op); break
        case 'PRQSW': result = await flow.PRQSW(fieldName, entityId, scriptType, op); break
        case 'PRQEW': result = await flow.PRQEW(fieldName, entityId, scriptType, op); break
        case 'RETTO': result = await flow.RETTO(fieldName, entityId, scriptType, op); break

        case 'JMPF': result = await flow.JMPF(ops, op); break
        case 'JMPFL': result = await flow.JMPFL(ops, op); break
        case 'JMPB': result = await flow.JMPB(ops, op); break
        case 'JMPBL': result = await flow.JMPBL(ops, op); break

        case 'IFUB': result = await flow.IFUB(ops, op); break
        case 'IFUBL': result = await flow.IFUBL(ops, op); break
        case 'IFSW': result = await flow.IFSW(ops, op); break
        case 'IFSWL': result = await flow.IFSWL(ops, op); break
        case 'IFUW': result = await flow.IFUW(ops, op); break
        case 'IFUWL': result = await flow.IFUWL(ops, op); break

        case 'WAIT': result = await flow.WAIT(op); break
        case 'IFKEY': result = await flow.IFKEY(ops, op); break
        case 'IFKEYON': result = await flow.IFKEYON(ops, op); break
        case 'IFKEYOFF': result = await flow.IFKEYOFF(ops, op); break

        case 'NOP': result = await flow.NOP(); break
        case 'IFPRTYQ': result = await flow.IFPRTYQ(ops, op); break
        case 'IFMEMBQ': result = await flow.IFMEMBQ(ops, op); break

        // System and Module Control
        case 'DSKCG': result = await control.DSKCG(op); break
        case 'SPECIAL': result = await control.SPECIAL(op); break
        case 'MINIGAME': result = await control.MINIGAME(op); break
        case 'BTMD2': result = await control.BTMD2(op); break
        case 'BTRLD': result = await control.BTRLD(op); break
        case 'BTLTB': result = await control.BTLTB(op); break
        case 'MAPJUMP': result = await control.MAPJUMP(op); break
        case 'LSTMP': result = await control.LSTMP(op); break
        case 'BATTLE': result = await control.BATTLE(op); break
        case 'BTLON': result = await control.BTLON(op); break
        case 'BTLMD': result = await control.BTLMD(op); break
        case 'MPJPO': result = await control.MPJPO(op); break
        case 'GAMEOVER': result = await control.GAMEOVER(op); break

        // Assignment and Mathematics
        case 'PLUS!': result = assign.PLUS_(op); break
        case 'PLUS2!': result = assign.PLUS2_(op); break
        case 'MINUS!': result = assign.MINUS_(op); break
        case 'MINUS2!': result = assign.MINUS2_(op); break
        case 'INC!': result = assign.INC_(op); break
        case 'INC2!': result = assign.INC2_(op); break
        case 'DEC!': result = assign.DEC_(op); break
        case 'DEC2!': result = assign.DEC2_(op); break

        case 'RDMSD': result = assign.RDMSD(op); break
        case 'SETBYTE': result = assign.SETBYTE(op); break
        case 'SETWORD': result = assign.SETWORD(op); break
        case 'BITON': result = assign.BITON(op); break
        case 'BITOFF': result = assign.BITOFF(op); break
        case 'BITXOR': result = assign.BITXOR(op); break

        case 'MUL': result = assign.MUL(op); break
        case 'MUL2': result = assign.MUL2(op); break
        case 'DIV': result = assign.DIV(op); break
        case 'DIV2': result = assign.DIV2(op); break
        case 'MOD': result = assign.MOD(op); break
        case 'MOD2': result = assign.MOD2(op); break

        case 'AND': result = assign.AND(op); break
        case 'AND2': result = assign.AND2(op); break
        case 'OR': result = assign.OR(op); break
        case 'OR2': result = assign.OR2(op); break
        case 'XOR': result = assign.XOR(op); break
        case 'XOR2': result = assign.XOR2(op); break

        case 'UNUSED': result = assign.UNUSED(); break
        case 'PLUS': result = assign.PLUS(op); break
        case 'PLUS2': result = assign.PLUS2(op); break
        case 'MINUS': result = assign.MINUS(op); break
        case 'MINUS2': result = assign.MINUS2(op); break
        case 'INC': result = assign.INC(op); break
        case 'INC2': result = assign.INC2(op); break
        case 'DEC': result = assign.DEC(op); break
        case 'DEC2': result = assign.DEC2(op); break

        case 'RANDOM': result = assign.RANDOM(op); break
        case 'LBYTE': result = assign.LBYTE(op); break
        case 'HBYTE': result = assign.HBYTE(op); break
        case '2BYTE': result = assign.TWO_(op); break

        // Windowing and Menu

        case 'WCLS': result = await windowMenu.WCLS(op); break
        case 'WSIZW': result = await windowMenu.WSIZW(op); break
        case 'WSPCL': result = await windowMenu.WSPCL(op); break
        case 'WNUMB': result = await windowMenu.WNUMB(op); break
        case 'STTIM': result = await windowMenu.STTIM(op); break
        case 'MESSAGE': result = await windowMenu.MESSAGE(op); break
        case 'MPARA': result = await windowMenu.MPARA(op); break
        case 'MPRA2': result = await windowMenu.MPRA2(op); break
        case 'MPNAM': result = await windowMenu.MPNAM(op); break
        case 'ASK': result = await windowMenu.ASK(op); break
        case 'MENU': result = await windowMenu.MENU(op); break
        case 'MENU2': result = await windowMenu.MENU2(op); break
        case 'WINDOW': result = await windowMenu.WINDOW(op); break
        case 'WMOVE': result = await windowMenu.WMOVE(op); break
        case 'WMODE': result = await windowMenu.WMODE(op); break
        case 'WREST': result = await windowMenu.WREST(op); break
        case 'WCLSE': result = await windowMenu.WCLSE(op); break
        case 'WROW': result = await windowMenu.WROW(op); break
        case 'GWCOL': result = await windowMenu.GWCOL(op); break
        case 'SWCOL': result = await windowMenu.GWCOL(op); break

        // Party and Inventory
        case 'SPTYE': result = await party.SPTYE(op); break
        case 'GTPYE': result = await party.GTPYE(op); break

        case 'GOLDU': result = await party.GOLDU(op); break
        case 'GOLDD': result = await party.GOLDD(op); break
        case 'CHGLD': result = await party.CHGLD(op); break

        case 'HMPMAX1': result = await party.HMPMAX1(op); break
        case 'HMPMAX2': result = await party.HMPMAX2(op); break
        case 'MHMMX': result = await party.MHMMX(op); break
        case 'HMPMAX3': result = await party.HMPMAX3(op); break

        case 'HPUP': result = await party.HPUP(op); break
        case 'HPDWN': result = await party.HPDWN(op); break
        case 'MPUP': result = await party.MPUP(op); break
        case 'MPDWN': result = await party.MPDWN(op); break

        case 'STITM': result = await party.STITM(op); break
        case 'DLITM': result = await party.DLITM(op); break
        case 'CKITM': result = await party.CKITM(op); break

        case 'SMTRA': result = await party.SMTRA(op); break
        case 'DMTRA': result = await party.DMTRA(op); break
        case 'CMTRA': result = await party.CMTRA(op); break

        case 'GETPC': result = await party.GETPC(op); break
        case 'PRTYP': result = await party.PRTYP(op); break
        case 'PRTYM': result = await party.PRTYM(op); break
        case 'PRTYE': result = await party.PRTYE(op); break
        case 'MMBud': result = await party.MMBud(op); break
        case 'MMBLK': result = await party.MMBLK(op); break
        case 'MMBUK': result = await party.MMBUK(op); break

        // Field Models and Animation

        case 'JOIN': result = await models.JOIN(entityId, op); break
        case 'SPLIT': result = await models.SPLIT(entityId, op); break

        case 'PMOVA': result = await models.PMOVA(entityId, op); break
        case 'UC': result = await models.UC(entityId, op); break
        case 'PDIRA': result = await models.PDIRA(entityId, op); break
        case 'PTURA': result = await models.PTURA(entityId, op); break
        case 'IDLCK': result = await models.IDLCK(entityId, op); break
        case 'PGTDR': result = await models.PGTDR(entityId, op); break

        case 'PXYZI': result = await models.PXYZI(entityId, op); break
        case 'TLKON': result = await models.TLKON(entityId, op); break
        case 'PC': result = await models.PC(entityId, op); break
        case 'CHAR': result = await models.CHAR(entityId, op); break

        case 'DFANM': result = await models.DFANM(entityId, op); break
        case 'ANIME1': result = await models.ANIME1(entityId, op); break

        case 'VISI': result = await models.VISI(entityId, op); break
        case 'XYZI': result = await models.XYZI(entityId, op); break
        case 'XYI': result = await models.XYI(entityId, op); break
        case 'XYZ': result = await models.XYZ(entityId, op); break

        case 'MOVE': result = await models.MOVE(entityId, op); break
        case 'CMOVE': result = await models.CMOVE(entityId, op); break
        case 'MOVA': result = await models.MOVA(entityId, op); break
        case 'TURA': result = await models.TURA(entityId, op); break

        case 'ANIMW': result = await models.ANIMW(entityId, op); break
        case 'FMOVE': result = await models.FMOVE(entityId, op); break
        case 'ANIME2': result = await models.ANIME2(entityId, op); break
        case 'ANIM!1': result = await models.ANIM_1(entityId, op); break
        case 'CANIM1': result = await models.CANIM1(entityId, op); break
        case 'CANM!1': result = await models.CANM_1(entityId, op); break

        case 'MSPED': result = await models.MSPED(entityId, op); break
        case 'DIR': result = await models.DIR(entityId, op); break
        case 'TURNGEN': result = await models.TURNGEN(entityId, op); break
        case 'TURN': result = await models.TURN(entityId, op); break
        case 'DIRA': result = await models.DIRA(entityId, op); break
        case 'GETDIR': result = await models.GETDIR(entityId, op); break

        case 'GETAXY': result = await models.GETAXY(entityId, op); break
        case 'GETAI': result = await models.GETAI(entityId, op); break
        case 'ANIM!2': result = await models.ANIM_2(entityId, op); break
        case 'CANIM2': result = await models.CANIM2(entityId, op); break
        case 'CANM!2': result = await models.CANM_2(entityId, op); break

        case 'ASPED': result = await models.ASPED(entityId, op); break
        case 'CC': result = await models.CC(entityId, op); break
        case 'JUMP': result = await models.JUMP(entityId, op); break
        case 'AXYZI': result = await models.AXYZI(entityId, op); break

        case 'LADER': result = await models.LADER(entityId, op); break
        case 'OFST': result = await models.OFST(entityId, op); break
        case 'OFSTW': result = await models.OFSTW(entityId, op); break

        case 'TALKR': result = await models.TALKR(entityId, op); break
        case 'SLIDR': result = await models.SLIDR(entityId, op); break
        case 'SOLID': result = await models.SOLID(entityId, op); break

        case 'LINE': result = await models.LINE(entityId, op); break
        case 'LINON': result = await models.LINON(entityId, op); break
        case 'SLINE': result = await models.SLINE(entityId, op); break

        case 'TLKR2': result = await models.TLKR2(entityId, op); break
        case 'SLDR2': result = await models.SLDR2(entityId, op); break

        case 'FCFIX': result = await models.FCFIX(entityId, op); break
        case 'CCANM': result = await models.CCANM(entityId, op); break
        case 'ANIMB': result = await models.ANIMB(entityId, op); break
        case 'TURNW': result = await models.TURNW(entityId, op); break


        // Background and Palette
        case 'BGMOVIE': result = await cameraMedia.BGMOVIE(op); break
        case 'BGPDH': result = await background.BGPDH(op); break
        case 'BGON': result = await background.BGON(op); break
        case 'BGOFF': result = await background.BGOFF(op); break
        case 'BGCLR': result = await background.BGCLR(op); break

        // Camera, Audio and Video

        case 'NFADE': result = await cameraMedia.NFADE(op); break
        case 'SHAKE': result = await cameraMedia.SHAKE(op); break

        case 'SCRLO': result = await cameraMedia.SCRLO(op); break
        case 'SCRLC': result = await cameraMedia.SCRLC(op); break
        case 'SCRLA': result = await cameraMedia.SCRLA(op); break
        case 'SCR2D': result = await cameraMedia.SCR2D(op); break
        case 'SCRCC': result = await cameraMedia.SCRCC(op); break
        case 'SCR2DC': result = await cameraMedia.SCR2DC(op); break
        case 'SCRLW': result = await cameraMedia.SCRLW(op); break
        case 'SCR2DL': result = await cameraMedia.SCR2DL(op); break

        case 'FADE': result = await cameraMedia.FADE(op); break
        case 'FADEW': result = await cameraMedia.FADEW(op); break

        case 'SCRLP': result = await cameraMedia.SCRLP(op); break

        case 'AKAO2': result = await cameraMedia.AKAO2(op); break
        case 'MUSIC': result = await cameraMedia.MUSIC(op); break
        case 'SOUND': result = await cameraMedia.SOUND(op); break
        case 'AKAO': result = await cameraMedia.AKAO(op); break
        case 'MUSVT': result = await cameraMedia.MUSVT(op); break
        case 'MUSVM': result = await cameraMedia.MUSVM(op); break
        case 'MULCK': result = await cameraMedia.MULCK(op); break
        case 'BMUSC': result = await cameraMedia.BMUSC(op); break
        case 'CHMPH': result = await cameraMedia.CHMPH(op); break

        case 'PMVIE': result = await cameraMedia.PMVIE(op); break

        case 'MOVIE': result = await cameraMedia.MOVIE(op); break
        case 'MVIEF': result = await cameraMedia.MVIEF(op); break

        case 'FMUSC': result = await cameraMedia.FMUSC(op); break
        case 'CMUSC': result = await cameraMedia.CMUSC(op); break
        case 'CHMST': result = await cameraMedia.CHMST(op); break

        // Uncategorized
        case 'SETX': result = misc.SETX(op); break
        case 'GETX': result = misc.GETX(op); break
        case 'SEARCHX': result = misc.SEARCHX(op); break
        case 'PMJMP': result = misc.PMJMP(op); break
        case 'PMJMP2': result = misc.PMJMP2(op); break

        default:
            console.log(`--------- OP: ${op.op} - NOT YET IMPLEMENTED ---------`)
            break;
    }

    console.log('   - executeOp: END', fieldName, entityId, scriptType, op, result)
    return result
}
const stopAllLoops = async () => {
    CURRENT_FIELD = 'None'
    TWEEN.removeAll()
    // await sleep(100)
}

const executeScriptLoop = async (fieldName, entityId, loop) => {
    console.log(' - executeScriptLoop: START', fieldName, entityId, loop)
    if (loop.isRunning) {
        console.log(' - executeScriptLoop: IS RUNNING')
        return
    }

    loop.isRunning = true
    const ops = loop.ops
    let currentOpIndex = 0
    let flowActionCount = 0
    while (currentOpIndex < ops.length) {
        if (flowActionCount >= 10) {
            // Need to test this, as it could be waiting for the presence of a variable to change
            console.log(' - executeScriptLoop: TOO MANY CONSECUIVE GOTO - QUITTING LOOP', fieldName, entityId, loop)
            // sendOpFlowEvent(entityId, loop.scriptType, '...', currentOpIndex + 1)
            break
        }

        let op = ops[currentOpIndex]
        const result = await executeOp(fieldName, entityId, loop.scriptType, ops, op, currentOpIndex)
        console.log(' - executeScriptLoop: RESULT', fieldName, entityId, result, currentOpIndex, flowActionCount)
        if (result.exit) {
            console.log(' - executeScriptLoop: EXIT', fieldName, entityId, loop)
            break
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
        // TODO - Potentially move this all to the update clock to stop too many repeated loops running too fast
        // For now, just add a 1 frame delay
        // Changed my mind, this is a bad idea as it causes stutter in background on/off effects
        // await sleep(1000 / 30)
    }
    loop.isRunning = false
    if (flowActionCount >= 10) {
        sendOpFlowEvent(entityId, loop.scriptType, LoopVisualiserIcons.FLOWSTOP, currentOpIndex)
    } else {
        sendOpFlowEvent(entityId, loop.scriptType, LoopVisualiserIcons.STOPPED, currentOpIndex)
    }

    console.log(' - executeScriptLoop: END', fieldName, entityId, loop)
}
const initEntity = async (fieldName, entity) => {
    console.log('initEntity: START', fieldName, entity.entityId, entity.entityName, entity)
    const initLoop = entity.scripts.filter(s => s.index === 0 && s.isMain === undefined)[0]
    console.log('initLoop', initLoop)
    await executeScriptLoop(fieldName, entity.entityId, initLoop)
    const mainLoops = entity.scripts.filter(s => s.index === 0 && s.isMain)
    if (mainLoops.length > 0) {
        const mainLoop = mainLoops[0]
        console.log('mainLoop', mainLoop)
        // if (entity.entityName !== 'dir') { // Debug
        await executeScriptLoop(fieldName, entity.entityId, mainLoop)
        // }
    }


    // For debug
    // if (entity.entityName === 'gu0') {
    //     const script3 = entity.scripts.filter(s => s.scriptType === 'Script 3')[0]
    //     console.log('script3', script3)
    //     await executeScriptLoop(fieldName, entity.entityId, script3)
    // }

    console.log('initEntity: END', entity.entityId, entity.entityName)
}
const initialiseOpLoops = async () => {
    console.log('initialiseOpLoops: START')
    CURRENT_FIELD = window.currentField.name
    let entities = window.currentField.data.script.entities
    await positionPlayableCharacterFromTransition()
    // entities = entities.filter(e => e.entityName !== 'timeo' && e.entityName !== 'smoke1' && e.entityName !== 'smoke2') // Debug
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        initEntity(window.currentField.name, entity) // All running async
    }
    console.log('initialiseOpLoops: END')
}
const triggerEntityTalkLoop = async (entityId) => {
    const entity = window.currentField.data.script.entities[entityId]
    console.log('triggerEntityTalkLoop', entityId, entity)
    const filteredTalkLoops = entity.scripts.filter(s => s.scriptType === 'Talk')
    if (filteredTalkLoops.length > 0) {
        const talkLoop = filteredTalkLoops[0]
        console.log('talkLoop', talkLoop)
        if (!talkLoop.isRunning) {
            await executeScriptLoop(window.currentField.name, entity.entityId, talkLoop)
        }
    }
}
const triggerEntityCollisionLoop = async (entityId) => {
    const entity = window.currentField.data.script.entities[entityId]
    console.log('triggerEntityTalkLoop', entityId, entity)
    const contactLoop = entity.scripts.filter(s => s.scriptType === 'Contact')[0]
    console.log('contactLoop', contactLoop)
    await executeScriptLoop(window.currentField.name, entity.entityId, contactLoop)
}
const triggerEntityMoveLoops = async (entityId) => {
    const entity = window.currentField.data.script.entities[entityId]
    console.log('triggerEntityMoveLoops', entityId, entity)
    const loops = entity.scripts.filter(s => s.scriptType === 'Move')
    for (let i = 0; i < loops.length; i++) {
        const loop = loops[i]
        executeScriptLoop(window.currentField.name, entity.entityId, loop) // async
    }
}
const triggerEntityGoLoop = async (entityId) => {
    const entity = window.currentField.data.script.entities[entityId]
    console.log('triggerEntityGoLoop', entityId, entity)
    const loops = entity.scripts.filter(s => s.scriptType === 'Go')
    for (let i = 0; i < loops.length; i++) {
        const loop = loops[i]
        executeScriptLoop(window.currentField.name, entity.entityId, loop) // Will only ever be 1 max
    }
}
const triggerEntityGo1xLoop = async (entityId) => {
    const entity = window.currentField.data.script.entities[entityId]
    console.log('triggerEntityGo1xLoop', entityId, entity)
    const loops = entity.scripts.filter(s => s.scriptType === 'Go 1x')
    for (let i = 0; i < loops.length; i++) {
        const loop = loops[i]
        executeScriptLoop(window.currentField.name, entity.entityId, loop) // Will only ever be 1 max
    }
}
const triggerEntityGoAwayLoop = async (entityId) => {
    const entity = window.currentField.data.script.entities[entityId]
    console.log('triggerEntityGoAwayLoop', entityId, entity)
    const loops = entity.scripts.filter(s => s.scriptType === 'Go away')
    for (let i = 0; i < loops.length; i++) {
        const loop = loops[i]
        executeScriptLoop(window.currentField.name, entity.entityId, loop) // Will only ever be 1 max
    }
}
const triggerEntityOKLoop = async (entityId) => {
    const entity = window.currentField.data.script.entities[entityId]
    console.log('triggerEntityOKLoop', entityId, entity)
    const loops = entity.scripts.filter(s => s.scriptType === '[OK]')
    for (let i = 0; i < loops.length; i++) {
        const loop = loops[i]
        executeScriptLoop(window.currentField.name, entity.entityId, loop) // Will only ever be 1 max
    }
}


const debugLogOpCodeCompletionForField = async () => {
    const completedCodesRes = await fetch(`/workings-out/op-codes-completed.json`)
    const completedCodes = await completedCodesRes.json()

    const done = []
    const missing = []

    const entities = window.currentField.data.script.entities
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        for (let j = 0; j < entity.scripts.length; j++) {
            const script = entity.scripts[j]
            for (let k = 0; k < script.ops.length; k++) {
                const op = script.ops[k].op
                if (completedCodes.includes(op)) {
                    if (!done.includes(op)) {
                        done.push(op)
                    }
                } else {
                    if (!missing.includes(op)) {
                        missing.push(op)
                    }
                }
            }
        }
    }
    console.log('debugLogOpCodeCompletionForField', 'missing ->', missing)
}
export {
    initialiseOpLoops,
    stopAllLoops,
    executeScriptLoop,
    triggerEntityTalkLoop,
    triggerEntityCollisionLoop,
    triggerEntityMoveLoops,
    triggerEntityGoLoop,
    triggerEntityGo1xLoop,
    triggerEntityGoAwayLoop,
    triggerEntityOKLoop,
    debugLogOpCodeCompletionForField
}
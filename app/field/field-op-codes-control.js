import { triggerBattleWithSwirl, setGatewayTriggerEnabled, transitionOutAndLoadMenu, jumpToMap, jumpToMiniGame } from './field-actions.js'
import { getBankData, setBankData } from '../data/savemap.js'
import { setCurrentDisc } from '../data/savemap-alias.js'
import { setConfigFieldMessageSpeed, debugResetGame } from '../data/savemap-config.js'
import { debugFillMateria } from '../materia/materia-module.js'
import { debugFillItems, debugClearItems } from '../items/items-module.js'
import {
    setRandomEncountersEnabled, setBattleOptions, getLastBattleResult,
    setBattleEncounterTableIndex, setBattleLockEnabled
} from './field-battle.js'
import { MENU_TYPE } from '../menu/menu-module.js'
import { setFieldPointersEnabled } from './field-position-helpers.js'
import { setMovieLockEnabled } from '../media/media-movies.js'
import { setCharacterNameFromSpecialText } from './field-op-codes-party-helper.js'
import { getLastFieldId } from './field-metadata.js'

const BATTLE = async (op) => {
    console.log('BATTLE', op)
    const battleId = op.b == 0 ? op.n : getBankData(op.b, op.n)
    await triggerBattleWithSwirl(battleId)
    return {}
}
const BTLON = async (op) => {
    console.log('BTLON', op)
    setRandomEncountersEnabled(op.s === 0)
    return {}
}
const BTLMD = async (op) => {
    console.log('BTLMD', op)
    const options = []
    if (op.bits1 & 0b10000000) { options.push("DisableRewardScreens") }
    if (op.bits1 & 0b01000000) { options.push("ActivateArenaMode") }
    if (op.bits1 & 0b00100000) { options.push("DisableVictoryMusic") }
    if (op.bits1 & 0b00010000) { options.push("Unknown0b00010000") }
    if (op.bits1 & 0b00001000) { options.push("CanNotEscape") }
    if (op.bits1 & 0b00000100) { options.push("PreEmptiveAttack") }
    if (op.bits1 & 0b00000010) { options.push("TimedBattleWithoutRewardScreen") }
    if (op.bits1 & 0b00000001) { options.push("Unknown0b00000001") }
    if (op.bits2 & 0b11111110) { options.push("UnknownLSB") }
    if (op.bits2 & 0b00000001) { options.push("DisableGameOver") }

    // Assumption: This changes all battle options rather than applies a diff
    setBattleOptions(options)
    return {}
}
const BTMD2 = async (op) => {
    console.log('BTMD2', op)
    const options = []
    if (op.bits1 & 0b10000000) { options.push("DisableRewardScreens") }
    if (op.bits1 & 0b01000000) { options.push("ActivateArenaMode") }
    if (op.bits1 & 0b00100000) { options.push("DisableVictoryMusic") }
    if (op.bits1 & 0b00010000) { options.push("Unknown0b00010000") }
    if (op.bits1 & 0b00001000) { options.push("CanNotEscape") }
    if (op.bits1 & 0b00000100) { options.push("PreEmptiveAttack") }
    if (op.bits1 & 0b00000010) { options.push("TimedBattleWithoutRewardScreen") }
    if (op.bits1 & 0b00000001) { options.push("Unknown0b00000001") }
    if (op.bits2 & 0b11111110) { options.push("UnknownLSB") }
    if (op.bits2 & 0b00000001) { options.push("DisableGameOver") }

    if (op.bits1 & 0b10000000) { options.push("DisableRewardScreens") }
    if (op.bits1 & 0b01000000) { options.push("ActivateArenaMode") }
    if (op.bits1 & 0b00100000) { options.push("DisableVictoryMusic") }
    if (op.bits1 & 0b00010000) { options.push("Unknown0b00010000") }
    if (op.bits1 & 0b00001000) { options.push("CanNotEscape") }
    if (op.bits1 & 0b00000100) { options.push("PreEmptiveAttack") }
    if (op.bits1 & 0b00000010) { options.push("TimedBattleWithoutRewardScreen") }
    if (op.bits1 & 0b00000001) { options.push("Unknown0b00000001") }
    if (op.bits2 & 0b00000001) { options.push("NoCelebrations") }
    if (op.bits3 & 0b10000000) { options.push("DisableGameOver") }
    if (op.bits3 & 0b00000001) { options.push("DisableGameOver") }

    // Assumption: This changes all battle options rather than applies a diff
    setBattleOptions(options)
    return {}
}
const BTRLD = async (op) => {
    console.log('BTRLD', op)
    const result = getLastBattleResult()
    let memResult = 0x0000
    if (result.escaped && !result.defeated) {
        memResult = 0x1000
    } else if (!result.escaped && result.defeated) {
        memResult = 0x0001
    } else if (result.escaped && result.defeated) {
        memResult = 0x1001
    }
    setBankData(op.b, op.a, memResult)
    return {}
}
const BTLTB = async (op) => {
    console.log('BTLTB', op)
    setBattleEncounterTableIndex(op.i)
    return {}
}
const MPJPO = async (op) => {
    console.log('MPJPO', op)
    setGatewayTriggerEnabled(op.s === 0)
    return {}
}
const GAMEOVER = async (op) => {
    console.log('GAMEOVER', op)
    await transitionOutAndLoadMenu(MENU_TYPE.GameOver)
    return {}
}
const DSKCG = async (op) => {
    console.log('DSKCG', op)
    setCurrentDisc(op.d)
    return {}
}
const SPECIAL = async (op) => {
    console.log('SPECIAL', op)
    switch (op.subOpName) {
        // Kernel based
        case 'ARROW': setFieldPointersEnabled(op.params[0] === 0); break
        case 'PNAME': window.alert('opcode SPECIAL:PNAME used, there should be no instances of this'); break
        case 'GMSPD': window.alert('opcode SPECIAL:GMSPD used, there should be no instances of this'); break
        case 'SMSPD': setConfigFieldMessageSpeed(op.params[1]); break
        case 'BTLCK': setBattleLockEnabled(op.params[0] === 0); break
        case 'MVLCK': setMovieLockEnabled(op.params[0] === 0); break
        case 'SPCNM': setCharacterNameFromSpecialText(op.params[0], op.params[1]); break
        case 'RSGLB': debugResetGame(); break

        // Inventory
        case 'FLMAT': debugFillMateria(); break
        case 'FLITM': debugFillItems(); break
        case 'CLITM': debugClearItems(); break

        default:
            console.log('Unknown special code', op)
            break;
    }
    return {}
}
const LSTMP = async (op) => {
    console.log('LSTMP', op)
    const fieldId = await getLastFieldId() // Note: dat.gui debug breaks this
    setBankData(op.b, op.a, fieldId)
    return {}
}
const MAPJUMP = async (op) => {
    console.log('MAPJUMP', op)
    await jumpToMap(op.f, op.x, op.y, op.i, op.d)
    return {}
}
const MINIGAME = async (op) => {
    console.log('MINIGAME', op)
    // m: m, x: x, y: y, z: z, g: g, t: t,
    jumpToMiniGame(op.t, op.g, { map: op.m, x: op.x, y: op.y, z: op.z })
    return {}
}
setTimeout(async () => {
    console.log('DEBUG: START')
    // await MINIGAME({ m: 406, x: -101, y: -156, z: 8, g: 0, t: 4 })
    // await SPECIAL({ subOpName: 'ARROW', params: [1] })
    // await SPECIAL({ subOpName: 'SMSPD', params: [0, 255] })
    // await SPECIAL({ subOpName: 'BTLCK', params: [1] })
    // await SPECIAL({ subOpName: 'MVLCK', params: [1] })
    // await SPECIAL({ subOpName: 'SPCNM', params: [1, 2] })
    // await SPECIAL({ subOpName: 'RSGLB', params: [0] })

    // await SPECIAL({ subOpName: 'FLMAT', params: [0] })
    // await SPECIAL({ subOpName: 'FLITM', params: [0] })
    // await SPECIAL({ subOpName: 'CLITM', params: [0] })

    // await MAPJUMP({ f: 74, x: 887, y: -810, i: 46, d: 192 })

    // await LSTMP({ b: 3, a: 3 })
    // const fieldId = getBankData(3, 3)
    // console.log('getBankData lastFieldid', fieldId)
    // await BATTLE({ b: 0, n: 64 })
    console.log('DEBUG: END')
}, 10000)

export {
    DSKCG,
    SPECIAL,
    MINIGAME,
    BTMD2,
    BTRLD,
    BTLTB,
    MAPJUMP,
    LSTMP,
    BATTLE,
    BTLON,
    BTLMD,
    MPJPO,
    GAMEOVER
}
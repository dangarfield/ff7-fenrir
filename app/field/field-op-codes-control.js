import { triggerBattleWithSwirl, setGatewayTriggerEnabled, fadeOutAndLoadMenu } from './field-actions.js'
import { getBankData, setBankData } from '../data/savemap.js'
import { setCurrentDisc } from '../data/savemap-alias.js'
import {
    setRandomEncountersEnabled, setBattleOptions, getLastBattleResult,
    setBattleEncounterTableIndex
} from './field-battle.js'
import { MENU_TYPE } from '../menu/menu-module.js'

const BATTLE = async (op) => {
    console.log('BATTLE', op)
    const battleId = op.b == 0 ? op.n : getBankData(op.b, op.n)
    triggerBattleWithSwirl(battleId)
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
    await fadeOutAndLoadMenu(MENU_TYPE.GameOver)
    return {}
}
const DSKCG = async (op) => {
    console.log('DSKCG', op)
    setCurrentDisc(op.d)
    return {}
}
// setTimeout(async () => {
//     console.log('DEBUG: START')

//     await BTLON({ s: 1 })
//     await BTLMD({ bits1: 3456, bits2: 245 })
//     await BTMD2({ bits1: 12, bits2: 245, bits3: 214, bits4: 21 })
//     // await BATTLE({ b: 0, n: 64 })
//     await BTLTB({ i: 1 })
//     await MPJPO({ s: 1 })
//     await DSKCG({ d: 2 })
//     console.log('DEBUG: END')
// }, 10000)

export {
    DSKCG,
    BTMD2,
    BTRLD,
    BTLTB,
    BATTLE,
    BTLON,
    BTLMD,
    MPJPO,
    GAMEOVER
}
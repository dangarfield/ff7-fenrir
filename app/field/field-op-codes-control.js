
import { triggerBattleWithSwirl } from './field-actions.js'
import { getBankData } from '../data/savemap.js'

const BATTLE = async (op) => {
    console.log('BATTLE', op)
    const battleId = op.b == 0 ? op.n : getBankData(op.b, op.n)
    triggerBattleWithSwirl(battleId)
    return {}
}


setTimeout(async () => {
    console.log('DEBUG: START')
    await BATTLE({ b: 0, n: 64 })
    console.log('DEBUG: END')
}, 10000)

export {
    BATTLE
}
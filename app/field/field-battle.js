let randomEncountersEnabled = true
let battleLockEnabled = false
let encouterTableIndex = 0
let battleOptions = []
let lastBattleResult = { escaped: false, defeated: false }

const setRandomEncountersEnabled = (enabled) => {
    randomEncountersEnabled = enabled
    console.log('randomEncountersEnabled', randomEncountersEnabled)
}
const setBattleOptions = (options) => {
    battleOptions = options
    console.log('setBattleOptions', battleOptions)
}

const getLastBattleResult = () => { return lastBattleResult }

const setLastBattleResult = (escaped, defeated) => {
    lastBattleResult.escaped = escaped
    lastBattleResult.defeated = defeated
    console.log('setLastBattleResult', getLastBattleResult())
}
const setBattleEncounterTableIndex = (index) => {
    encouterTableIndex = index
    console.log('setBattleEncounterTableIndex', encouterTableIndex)
}
const isBattleLockEnabled = () => { return battleLockEnabled }
const setBattleLockEnabled = (enabled) => {
    battleLockEnabled = enabled
    console.log('setBattleLockEnabled', isBattleLockEnabled())
}
const initBattleSettings = () => {
    console.log('initBattleSettings')
    randomEncountersEnabled = true
    battleLockEnabled = false
    encouterTableIndex = 0
    battleOptions = []
    lastBattleResult = { escaped: false, defeated: false } // Reset this every field change ?!
}
export {
    initBattleSettings,
    setRandomEncountersEnabled,
    setBattleOptions,
    getLastBattleResult,
    setLastBattleResult,
    setBattleEncounterTableIndex,
    isBattleLockEnabled,
    setBattleLockEnabled
}
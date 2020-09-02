let randomEncountersEnabled = true
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
const initBattleSettings = () => {
    console.log('initBattleSettings')
    randomEncountersEnabled = true
    battleOptions = []
}

const getLastBattleResult = () => { return lastBattleResult }

const setLastBattleResult = (escaped, defeated) => {
    lastBattleResult.escaped = escaped
    lastBattleResult.defeated = defeated
    console.log('setLastBattleResult', getLastBattleResult())
}
export {
    initBattleSettings,
    setRandomEncountersEnabled,
    setBattleOptions,
    getLastBattleResult,
    setLastBattleResult
}
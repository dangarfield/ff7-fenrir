let randomEncountersEnabled = true
let battleOptions = []

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

export {
    initBattleSettings,
    setRandomEncountersEnabled,
    setBattleOptions
}
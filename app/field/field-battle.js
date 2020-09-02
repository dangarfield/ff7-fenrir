let randomEncountersEnabled = true

const setRandomEncountersEnabled = (enabled) => {
    randomEncountersEnabled = enabled
    console.log('randomEncountersEnabled', randomEncountersEnabled)
}

export {
    setRandomEncountersEnabled
}
import { setCurrentGameTime } from './savemap-alias.js'

const getConfigFieldMessageSpeed = () => {
  // 0-255 fast-slow
  return window.data.savemap.config.fieldMessageSpeed
}
const setConfigFieldMessageSpeed = speed => {
  window.data.savemap.config.fieldMessageSpeed = speed
  console.log('setConfigFieldMessageSpeed', getConfigFieldMessageSpeed())
}
const getConfigWindowColours = () => {
  return [
    // 'rgb(0,88,176)'
    `rgb(${window.data.savemap.config.windowColorTL})`,
    `rgb(${window.data.savemap.config.windowColorTR})`,
    `rgb(${window.data.savemap.config.windowColorBL})`,
    `rgb(${window.data.savemap.config.windowColorBR})`
  ]
}
const debugResetGame = () => {
  // This needs testing to confirm. Resets game time to 0, unlocks PHS and Save menu, resets party to Cloud | (empty) | (empty).
  setCurrentGameTime(0, 0, 0)
  const charNames = Object.keys(window.data.savemap.party.phsVisibility)
  for (let i = 0; i < charNames.length; i++) {
    const charName = charNames[i]
    window.data.savemap.party.phsLocked[charName] = 1
    window.data.savemap.party.phsVisibility[charName] = 1
  }
  window.data.savemap.party.members = ['Cloud', 'None', 'None']
  console.log('debugResetGame - window.data.savemap', window.data.savemap)
}
export {
  getConfigFieldMessageSpeed,
  setConfigFieldMessageSpeed,
  getConfigWindowColours,
  debugResetGame
}

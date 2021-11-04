import { getBankData, setBankData } from './savemap.js'
import { degreesToDirection } from '../field/field-models.js'
import { updatePositionHelperVisility } from '../field/field-position-helpers.js'

const processSavemapAlias = (bankRef, index, value) => {
  if (bankRef === 13 && index === 30) {
    // field pointers
    updatePositionHelperVisility()
  }
}
const persistFieldPointersActiveForPlayer = active => {
  setBankData(13, 30, active ? 0x02 : 0x00)
}
const areFieldPointersActive = () => {
  return getBankData(13, 30) > 0
}

const getCurrentCountdownClockTime = () => {
  return {
    h: getBankData(1, 20),
    m: getBankData(1, 21),
    s: getBankData(1, 22)
  }
}
const setCurrentCountdownClockTime = (h, m, s) => {
  setBankData(1, 20, h)
  setBankData(1, 21, m)
  setBankData(1, 22, s)
  window.data.savemap.time.countdownSeconds = h * 3600 * 60 + m * 60 + s
  window.data.savemap.time.countdownSecondsFractions = 0
}
const getCurrentGameTime = () => {
  return {
    h: getBankData(1, 16),
    m: getBankData(1, 17),
    s: getBankData(1, 18)
  }
}
const setCurrentGameTime = (h, m, s) => {
  // console.log('gametime setCurrentGameTime', h, m, s)
  setBankData(1, 16, h)
  setBankData(1, 17, m)
  setBankData(1, 18, s)
  window.data.savemap.time.secondsPlayed = h * 3600 * 60 + m * 60 + s
  window.data.savemap.time.secondsPlayedFractions = 0
}
const incrementGameTime = () => {
  let { h, m, s } = getCurrentGameTime()
  // console.log('gametime current', h, m, s)
  s++
  if (s >= 60) {
    s = 0
    m++
  }
  if (m >= 60) {
    m = 0
    h++
  }
  setCurrentGameTime(h, m, s)
  // console.log('gametime updated', h, m, s, '->', window.data.savemap.time.secondsPlayed)
}
const decrementCountdownClock = () => {
  let { h, m, s } = getCurrentCountdownClockTime()
  // console.log('decrementCountdownClock OLD', h, m, s)
  let activeCountdown = true
  if (h === 0 && m === 0 && s === 0) {
    activeCountdown = false
  }
  s--
  if (s < 0) {
    m--
    s = 59
  }
  if (m < 0) {
    h--
    m = 59
  }
  if (h < 0) {
    h--
    h = 0
  }
  if (activeCountdown) {
    setCurrentCountdownClockTime(h, m, s)
  }
  // console.log('decrementCountdownClock NEW', h, m, s, activeCountdown)
  return activeCountdown
}
const getCurrentDisc = () => {
  let disc = getBankData(13, 0)
  if (disc === 0) {
    setBankData(13, 0, 1)
    disc = getBankData(13, 0)
  }
  return disc
}
const setCurrentDisc = disc => {
  setBankData(13, 0, disc)
}
const updateSavemapLocationField = (fieldName, fieldDescription) => {
  // console.log('updateSavemapLocationField', fieldName)
  window.data.savemap.location.currentModule = 1
  window.data.savemap.location.currentLocation = fieldDescription // Updated in MPNAM op code
  window.data.savemap.location._currentFieldName = fieldName
  window.data.savemap.location.currentMapValue =
    window.data.savemap.location.currentModule === 1 ? 2 : 0
}
const updateSavemapLocationFieldPosition = (x, y, triangleId, degrees) => {
  const direction = degreesToDirection(degrees)
  // console.log('updateSavemapPlayerFieldPosition', x, y, triangleId, degrees, direction)
  window.data.savemap.location.fieldXPos = x
  window.data.savemap.location.fieldYPos = y
  window.data.savemap.location.fieldTriangle = triangleId
  window.data.savemap.location.fieldDirection = direction
}
const updateSavemapLocationFieldLeader = characterName => {
  // console.log('updateSavemapLocationFieldLeader', characterName)
  // This is not in the game, but a utility method for loading the leader as I haven't looked into that yet
  window.data.savemap.location._fieldLeader = characterName
}
const getPlayableCharacterInitData = () => {
  const playableCharacterInitData = {
    triangleId: window.data.savemap.location.fieldTriangle,
    position: {
      x: window.data.savemap.location.fieldXPos,
      y: window.data.savemap.location.fieldYPos
    },
    direction: window.data.savemap.location.fieldDirection,
    characterName: window.data.savemap.location._fieldLeader,
    module: window.data.savemap.location.currentModule,
    fieldName: window.data.savemap.location._currentFieldName
  }
  return playableCharacterInitData
}
const incrementBattlesFought = () => {
  let count = getBankData(2, 24)
  count++
  setBankData(2, 24, count)
  console.log('incrementBattlesFought', getBankData(2, 24))
}
const incrementBattlesEscaped = () => {
  let count = getBankData(2, 26)
  count++
  setBankData(2, 26, count)
}
const getMenuVisibility = () => {
  return (getBankData(2, 28) >>> 0).toString(2).padStart(8, '0').split('').map((f, i) => f === '1').reverse()
}

export {
  processSavemapAlias,
  areFieldPointersActive,
  persistFieldPointersActiveForPlayer,
  getCurrentCountdownClockTime,
  setCurrentCountdownClockTime,
  decrementCountdownClock,
  getCurrentDisc,
  setCurrentDisc,
  getCurrentGameTime,
  setCurrentGameTime,
  incrementGameTime,
  updateSavemapLocationField,
  updateSavemapLocationFieldPosition,
  updateSavemapLocationFieldLeader,
  getPlayableCharacterInitData,
  incrementBattlesFought,
  incrementBattlesEscaped,
  getMenuVisibility
}

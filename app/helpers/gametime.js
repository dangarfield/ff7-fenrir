import { decrementCountdownClockAndUpdateDisplay } from '../field/field-dialog.js'
import { incrementGameTime } from '../data/savemap-alias.js'
import { updateHomeMenuTime } from '../menu/menu-main-home.js'
import { activateRandomBlinkForFieldCharacters } from '../field/field-model-graphics-operations.js'
let deltaTotal = 0
let deltaSecond = 0
const executeOnceASecond = () => {
  decrementCountdownClockAndUpdateDisplay()
  incrementGameTime()
  updateHomeMenuTime()
  if (window.anim.activeScene === 'field') {
    activateRandomBlinkForFieldCharacters()
  }
}
const updateOnceASecond = () => {
  const delta = window.anim.gametimeClock.getDelta()
  deltaTotal += delta
  const deltaSecondTemp = parseInt(deltaTotal)
  // console.log('updateOnceASecond', delta, deltaTotal, deltaSecond, deltaSecondTemp)
  if (deltaSecond !== deltaSecondTemp) {
    deltaSecond = deltaSecondTemp
    // console.log('updateOnceASecond SECOND', deltaSecond)
    if (window.data.savemap) {
      executeOnceASecond()
    }
  }
  if (deltaSecond > 10000000) {
    deltaTotal = 0
    deltaSecond = 0
    // console.log('updateOnceASecond RESET TO ZERO', delta, deltaTotal, deltaSecond)
  }
}
export { updateOnceASecond }

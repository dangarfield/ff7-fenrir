import { getKeyPressEmitter } from '../interaction/inputs.js'

import {
  navigateUp,
  navigateDown,
  navigateLeft,
  navigateRight,
  navigateSelect
} from './world-destination-selector.js'

const areWorldControlsActive = () => {
  return window.anim.activeScene === 'world'
}

const initWorldKeypressActions = () => {
  getKeyPressEmitter().on('up', () => {
    if (areWorldControlsActive()) {
      navigateUp()
    }
  })
  getKeyPressEmitter().on('down', () => {
    if (areWorldControlsActive()) {
      navigateDown()
    }
  })
  getKeyPressEmitter().on('left', () => {
    if (areWorldControlsActive()) {
      navigateLeft()
    }
  })
  getKeyPressEmitter().on('right', () => {
    if (areWorldControlsActive()) {
      navigateRight()
    }
  })

  getKeyPressEmitter().on('o', firstPress => {
    if (areWorldControlsActive() && firstPress) {
      navigateSelect()
    }
  })
}
export { initWorldKeypressActions }

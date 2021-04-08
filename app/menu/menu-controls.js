import { getKeyPressEmitter } from '../interaction/inputs.js'
import { getMenuState } from './menu-module.js'
import { keyPress as keyPressMain } from './menu-main.js'

const areMenuControlsActive = () => {
  return window.anim.activeScene === 'menu'
}

// Not sure if these can be generalised or have to be added to individual menu / page types

const initMenuKeypressActions = () => {
  getKeyPressEmitter().on('o', firstPress => {
    if (areMenuControlsActive() && getMenuState() === 'home') {
      keyPressMain('o', firstPress)
    }
  })

  getKeyPressEmitter().on('x', async firstPress => {
    console.log('press x', areMenuControlsActive(), firstPress, getMenuState())
    if (areMenuControlsActive() && getMenuState() === 'home') {
      keyPressMain('x', firstPress)
    }
  })
}
export { initMenuKeypressActions }

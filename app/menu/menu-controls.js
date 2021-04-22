import { KEY, getKeyPressEmitter } from '../interaction/inputs.js'
import { getMenuState } from './menu-module.js'
import { keyPress as keyPressMain } from './menu-main.js'
import { keyPress as keyPressItems } from './menu-main-items.js'

const areMenuControlsActive = () => {
  return window.anim.activeScene === 'menu'
}

// Not sure if these can be generalised or have to be added to individual menu / page types

const initMenuKeypressActions = () => {
  getKeyPressEmitter().on(KEY.O, firstPress => {
    if (areMenuControlsActive()) {
      if (getMenuState().startsWith('home')) {
        keyPressMain(KEY.O, firstPress)
      }
      if (getMenuState().startsWith('items')) {
        keyPressItems(KEY.O, firstPress)
      }
    }
  })
  getKeyPressEmitter().on(KEY.X, async firstPress => {
    if (areMenuControlsActive()) {
      if (getMenuState().startsWith('home')) {
        keyPressMain(KEY.X, firstPress)
      }
      if (getMenuState().startsWith('items')) {
        keyPressItems(KEY.X, firstPress)
      }
    }
  })
  getKeyPressEmitter().on(KEY.SQUARE, firstPress => {
    if (areMenuControlsActive()) {
      if (getMenuState().startsWith('home')) {
        keyPressMain(KEY.SQUARE, firstPress)
      }
      if (getMenuState().startsWith('items')) {
        keyPressItems(KEY.SQUARE, firstPress)
      }
    }
  })
  getKeyPressEmitter().on(KEY.TRIANGLE, async firstPress => {
    if (areMenuControlsActive()) {
      if (getMenuState().startsWith('home')) {
        keyPressMain(KEY.TRIANGLE, firstPress)
      }
      if (getMenuState().startsWith('items')) {
        keyPressItems(KEY.TRIANGLE, firstPress)
      }
    }
  })
  getKeyPressEmitter().on(KEY.UP, firstPress => {
    if (areMenuControlsActive()) {
      if (getMenuState().startsWith('home')) {
        keyPressMain(KEY.UP, firstPress)
      }
      if (getMenuState().startsWith('items')) {
        keyPressItems(KEY.UP, firstPress)
      }
    }
  })
  getKeyPressEmitter().on(KEY.DOWN, async firstPress => {
    if (areMenuControlsActive()) {
      if (getMenuState().startsWith('home')) {
        keyPressMain(KEY.DOWN, firstPress)
      }
      if (getMenuState().startsWith('items')) {
        keyPressItems(KEY.DOWN, firstPress)
      }
    }
  })
  getKeyPressEmitter().on(KEY.LEFT, firstPress => {
    if (areMenuControlsActive()) {
      if (getMenuState().startsWith('home')) {
        keyPressMain(KEY.LEFT, firstPress)
      }
      if (getMenuState().startsWith('items')) {
        keyPressItems(KEY.LEFT, firstPress)
      }
    }
  })
  getKeyPressEmitter().on(KEY.RIGHT, async firstPress => {
    if (areMenuControlsActive()) {
      if (getMenuState().startsWith('home')) {
        keyPressMain(KEY.RIGHT, firstPress)
      }
      if (getMenuState().startsWith('items')) {
        keyPressItems(KEY.RIGHT, firstPress)
      }
    }
  })
}
export { initMenuKeypressActions }

import { KEY, getKeyPressEmitter } from '../interaction/inputs.js'
import { getMenuState, resolveMenuPromise } from './menu-module.js'
import { keyPress as keyPressMain } from './menu-main-home.js'
import { keyPress as keyPressItems } from './menu-main-items.js'
import { keyPress as keyPressMagic } from './menu-main-magic.js'
import { keyPress as keyPressSummon } from './menu-main-summon.js'
import { keyPress as keyPressEquip } from './menu-main-equip.js'
import { keyPress as keyPressStatus } from './menu-main-status.js'
import { keyPress as keyPressLimit } from './menu-main-limit.js'
import { keyPress as keyPressConfig } from './menu-main-config.js'
import { keyPress as keyPressPHS } from './menu-main-phs.js'
import { keyPress as keyPressSave } from './menu-main-save.js'

const areMenuControlsActive = () => {
  return window.anim.activeScene === 'menu'
}

const sendKeyPressToMenu = (key, firstPress, state) => {
  if (state.startsWith('home')) {
    keyPressMain(key, firstPress, state)
  } else if (state.startsWith('items')) {
    keyPressItems(key, firstPress, state)
  } else if (state.startsWith('magic')) {
    keyPressMagic(key, firstPress, state)
  } else if (state.startsWith('summon')) {
    keyPressSummon(key, firstPress, state)
  } else if (state.startsWith('equip')) {
    keyPressEquip(key, firstPress, state)
  } else if (state.startsWith('status')) {
    keyPressStatus(key, firstPress, state)
  } else if (state.startsWith('limit')) {
    keyPressLimit(key, firstPress, state)
  } else if (state.startsWith('config')) {
    keyPressConfig(key, firstPress, state)
  } else if (state.startsWith('phs')) {
    keyPressPHS(key, firstPress, state)
  } else if (state.startsWith('save')) {
    keyPressSave(key, firstPress, state)
  } else if (state.startsWith('quit')) {
    // keyPressItems(key, firstPress, state)
    // Nothing...
  } else {
    resolveMenuPromise()
  }
}
const initMenuKeypressActions = () => {
  getKeyPressEmitter().on(KEY.O, firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.O, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.X, async firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.X, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.SQUARE, firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.SQUARE, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.TRIANGLE, async firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.TRIANGLE, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.UP, firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.UP, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.DOWN, async firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.DOWN, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.LEFT, firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.LEFT, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.RIGHT, async firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.RIGHT, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.L1, firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.L1, firstPress, getMenuState())
    }
  })
  getKeyPressEmitter().on(KEY.R1, async firstPress => {
    if (areMenuControlsActive()) {
      sendKeyPressToMenu(KEY.R1, firstPress, getMenuState())
    }
  })
}
export { initMenuKeypressActions }

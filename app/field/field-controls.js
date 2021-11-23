import { getKeyPressEmitter } from '../interaction/inputs.js'
import { togglePositionHelperVisility } from './field-position-helpers.js'
import {
  isActionInProgress,
  transitionOutAndLoadMenu,
  processTalkContactTrigger
} from './field-actions.js'
import {
  nextPageOrCloseActiveDialogs,
  navigateChoice,
  isChoiceActive
} from './field-dialog-helper.js'
import { isMenuEnabled } from './field-module.js'
import { MENU_TYPE } from '../menu/menu-module.js'

let INIT_COMPLETE = false

const areFieldControlsActive = () => {
  return window.anim.activeScene === 'field'
}
const initFieldKeypressActions = () => {
  if (INIT_COMPLETE) {
    return
  }
  getKeyPressEmitter().on('o', firstPress => {
    if (areFieldControlsActive() && firstPress) {
      nextPageOrCloseActiveDialogs()
    }

    if (
      areFieldControlsActive() &&
      firstPress &&
      window.currentField.playableCharacter
    ) {
      // Check talk request - Initiate talk
      console.log('o', isActionInProgress())
      // Probably need to look at a more intelligent way to define which actions are performed
      // Should really be done in the rendering loop for collision
      processTalkContactTrigger()
    }
  })

  getKeyPressEmitter().on('r1', firstPress => {
    if (
      areFieldControlsActive &&
      firstPress &&
      isActionInProgress() === 'talk'
    ) {
      // console.log('r1', isActionInProgress())
      // clearActionInProgress()
      // setPlayableCharacterIsInteracting(false)
    }
  })

  getKeyPressEmitter().on('triangle', async firstPress => {
    if (areFieldControlsActive && firstPress && isMenuEnabled()) {
      // Also need to check is menu is disabled
      // Toggle position helper visibility
      console.log('triangle', isActionInProgress())
      transitionOutAndLoadMenu(MENU_TYPE.MainMenu, 1)
    }
  })
  getKeyPressEmitter().on('r2', async firstPress => {
    if (
      areFieldControlsActive &&
      firstPress &&
      isActionInProgress() === 'menu'
    ) {
      // // Toggle position helper visibility
      // console.log('r2', isActionInProgress())
      // unfreezeField()
    }
  })
  getKeyPressEmitter().on('start', firstPress => {
    if (areFieldControlsActive && firstPress) {
      // Just debug controls
    }
  })
  getKeyPressEmitter().on('select', firstPress => {
    if (areFieldControlsActive && firstPress) {
      // Toggle position helper visibility
      togglePositionHelperVisility()
    }
  })

  getKeyPressEmitter().on('l1', async firstPress => {
    if (areFieldControlsActive && firstPress) {
      transitionOutAndLoadMenu(MENU_TYPE.Shop, 2)
      // transitionOutAndLoadMenu(MENU_TYPE.CharacterNameEntry, 0)
    }
  })
  getKeyPressEmitter().on('l2', async firstPress => {
    if (areFieldControlsActive && firstPress) {
      await nextPageOrCloseActiveDialogs()
    }
  })

  getKeyPressEmitter().on('up', firstPress => {
    if (areFieldControlsActive && isChoiceActive) {
      console.log('navigate choice UP')
      navigateChoice(false)
    }
  })
  getKeyPressEmitter().on('down', firstPress => {
    if (areFieldControlsActive && isChoiceActive) {
      console.log('navigate choice DOWN')
      navigateChoice(true)
    }
  })

  INIT_COMPLETE = true
}

export { initFieldKeypressActions }

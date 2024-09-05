import { getKeyPressEmitter, KEY } from '../interaction/inputs.js'
import { setLastBattleResult } from '../field/field-battle.js'
import { resolveBattlePromise } from './battle-module.js'
import { togglePauseBattle, BATTLE_PAUSED } from './battle-scene.js'
import {
  sendKeyPressToBattleMenu,
  toggleHelperText,
  toggleTargetLabel
} from './battle-menu.js'
import { cycleActiveSelectionPlayer } from './battle-queue.js'

const areBattleControlsActive = () => {
  return window.anim.activeScene === 'battle'
}

const initBattleKeypressActions = () => {
  getKeyPressEmitter().on(KEY.L2, firstPress => {
    if (areBattleControlsActive() && firstPress && !BATTLE_PAUSED) {
      console.log('press x')
      // Temp
      setLastBattleResult(true, false)
      resolveBattlePromise()
    }
  })
  getKeyPressEmitter().on(KEY.START, firstPress => {
    if (areBattleControlsActive() && firstPress) {
      console.log('press start')
      togglePauseBattle()
    }
  })
  getKeyPressEmitter().on(KEY.SELECT, firstPress => {
    if (areBattleControlsActive() && firstPress && !BATTLE_PAUSED) {
      console.log('press select')
      toggleHelperText()
    }
  })

  getKeyPressEmitter().on(KEY.TRIANGLE, firstPress => {
    if (areBattleControlsActive() && firstPress && !BATTLE_PAUSED) {
      console.log('press triangle')
      window.currentBattle.ui.battlePointer.closeIfOpen()
      cycleActiveSelectionPlayer()
    }
  })
  getKeyPressEmitter().on(KEY.SQUARE, firstPress => {
    if (areBattleControlsActive() && firstPress && !BATTLE_PAUSED) {
      console.log('press square')
      // TODO - Hide menus
    }
  })

  getKeyPressEmitter().on(KEY.O, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.O)
    }
  })
  getKeyPressEmitter().on(KEY.X, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.X)
    }
  })
  getKeyPressEmitter().on(KEY.UP, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.UP)
    }
  })
  getKeyPressEmitter().on(KEY.DOWN, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.DOWN)
    }
  })
  getKeyPressEmitter().on(KEY.LEFT, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.LEFT)
    }
  })
  getKeyPressEmitter().on(KEY.RIGHT, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.RIGHT)
    }
  })
  getKeyPressEmitter().on(KEY.L1, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.L1)
    }
  })
  getKeyPressEmitter().on(KEY.R1, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.R1)
    }
  })
  getKeyPressEmitter().on(KEY.L2, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      sendKeyPressToBattleMenu(KEY.L2)
    }
  })
  getKeyPressEmitter().on(KEY.R2, firstPress => {
    if (areBattleControlsActive() && !BATTLE_PAUSED) {
      toggleTargetLabel()
    }
  })
}
export { initBattleKeypressActions }

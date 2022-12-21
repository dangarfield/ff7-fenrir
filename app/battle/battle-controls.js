import { getKeyPressEmitter } from '../interaction/inputs.js'
import { setLastBattleResult } from '../field/field-battle.js'
import { resolveBattlePromise } from './battle-module.js'
import { togglePauseBattle, BATTLE_PAUSED } from './battle-scene.js'
import { toggleHelperText } from './battle-menu.js'
import { cycleActiveSelectionPlayer } from './battle-queue.js'

const areBattleControlsActive = () => {
  return window.anim.activeScene === 'battle'
}

const initBattleKeypressActions = () => {
  getKeyPressEmitter().on('o', firstPress => {
    if (areBattleControlsActive() && firstPress && !BATTLE_PAUSED) {
      console.log('press o')
    }
  })

  getKeyPressEmitter().on('x', firstPress => {
    if (areBattleControlsActive() && firstPress && !BATTLE_PAUSED) {
      console.log('press x')
      // Temp
      setLastBattleResult(true, false)
      resolveBattlePromise()
    }
  })
  getKeyPressEmitter().on('triangle', firstPress => {
    if (areBattleControlsActive() && firstPress && !BATTLE_PAUSED) {
      console.log('press triangle')
      cycleActiveSelectionPlayer()
    }
  })
  getKeyPressEmitter().on('start', firstPress => {
    if (areBattleControlsActive() && firstPress) {
      console.log('press start')
      togglePauseBattle()
    }
  })
  getKeyPressEmitter().on('select', firstPress => {
    if (areBattleControlsActive() && firstPress && !BATTLE_PAUSED) {
      console.log('press select')
      toggleHelperText()
    }
  })
}
export { initBattleKeypressActions }

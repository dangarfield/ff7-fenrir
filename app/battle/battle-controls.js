import { getKeyPressEmitter } from '../interaction/inputs.js'
import { setLastBattleResult } from '../field/field-battle.js'
import { resolveBattlePromise } from './battle-module.js'
import { togglePauseBattle, BATTLE_PAUSED } from './battle-scene.js'

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
  getKeyPressEmitter().on('start', firstPress => {
    if (areBattleControlsActive() && firstPress) {
      console.log('press start')
      togglePauseBattle()
    }
  })
}
export { initBattleKeypressActions }

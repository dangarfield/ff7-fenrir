import { getKeyPressEmitter } from '../interaction/inputs.js'

const areBattleControlsActive = () => { return window.anim.activeScene === 'battle' }

const initBattleKeypressActions = () => {

    getKeyPressEmitter().on('o', (firstPress) => {
        if (areBattleControlsActive() && firstPress) {
            console.log('press o')
        }
    })

    getKeyPressEmitter().on('x', (firstPress) => {
        if (areBattleControlsActive() && firstPress) {
            console.log('press x')
        }
    })

}
export {
    initBattleKeypressActions
}
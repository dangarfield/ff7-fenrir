import { getKeyPressEmitter } from '../interaction/inputs.js'
import { jumpToMapFromMiniGame } from '../field/field-actions.js'
import { RETURN_DATA } from './minigame-module.js'

const areMiniGameControlsActive = () => { return window.anim.activeScene === 'minigame' }

const initMiniGameKeypressActions = () => {

    getKeyPressEmitter().on('o', (firstPress) => {
        if (areMiniGameControlsActive() && firstPress) {
            console.log('press o')
        }
    })

    getKeyPressEmitter().on('x', (firstPress) => {
        if (areMiniGameControlsActive() && firstPress) {
            console.log('press x')
            // Temp
            console.log('return', RETURN_DATA)
            jumpToMapFromMiniGame(RETURN_DATA.map, RETURN_DATA.x, RETURN_DATA.y, RETURN_DATA.z)
        }
    })

}
export {
    initMiniGameKeypressActions
}
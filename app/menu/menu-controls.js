import { getKeyPressEmitter } from '../interaction/inputs.js'
import { unfreezeField } from '../field/field-actions.js'
const areMenuControlsActive = () => { return window.anim.activeScene === 'menu' }

// Not sure if these can be generalised or have to be added to individual menu / page types

const initMenuKeypressActions = () => {

    getKeyPressEmitter().on('o', (firstPress) => {
        if (areMenuControlsActive() && firstPress) {
            console.log('press o')
        }
    })

    getKeyPressEmitter().on('x', (firstPress) => {
        if (areMenuControlsActive() && firstPress) {
            console.log('press x')
            // Temp just for testing
            unfreezeField()
        }
    })

}
export {
    initMenuKeypressActions
}
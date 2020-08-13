import { getKeyPressEmitter } from '../interaction/inputs.js'
import { togglePositionHelperVisility } from './field-position-helpers.js'
import { toggleFader } from './field-fader.js'

const triggered = {
    menu: false,
    talkAction: false
}

const initFieldKeypressActions = () => {
    getKeyPressEmitter().on('select', (firstPress) => {
        if (firstPress) {
            // Toggle position helper visibility
            togglePositionHelperVisility()
        }
    })
    getKeyPressEmitter().on('triangle', async (firstPress) => {
        if (firstPress && !triggered.menu) {
            // Toggle position helper visibility
            triggered.menu = true
            await toggleFader()
            // Maybe have a menu scene that triggers an event to unfreeze field
            triggered.menu = false
        }
    })
}

export {
    initFieldKeypressActions
}
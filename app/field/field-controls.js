import { getKeyPressEmitter } from '../interaction/inputs.js'
import { togglePositionHelperVisility } from './field-position-helpers.js'
const triggered = {
    menu: false,
    talkAction: false,
    helper: false
}

const initFieldKeypressActions = () => {
    getKeyPressEmitter().on('select', (firstPress) => {
        if (firstPress) {
            // Toggle position helper visibility
            togglePositionHelperVisility()
        }
    })
}

export {
    initFieldKeypressActions
}
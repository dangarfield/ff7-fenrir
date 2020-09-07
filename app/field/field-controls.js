import { getKeyPressEmitter } from '../interaction/inputs.js'
import { togglePositionHelperVisility } from './field-position-helpers.js'
import {
    setPlayableCharacterIsInteracting, initiateTalk, isActionInProgress, setActionInProgress,
    clearActionInProgress, fadeOutAndLoadMenu, unfreezeField
} from './field-actions.js'
import { nextPageOrCloseActiveDialogs, navigateChoice, isChoiceActive } from './field-dialog-helper.js'
import { isMenuEnabled } from './field-module.js'
import { MENU_TYPE } from '../menu/menu-module.js'

const areFieldControlsActive = () => { return window.anim.activeScene === 'field' }
const initFieldKeypressActions = () => {
    getKeyPressEmitter().on('o', (firstPress) => {

        if (areFieldControlsActive() && firstPress) {
            nextPageOrCloseActiveDialogs()
        }

        if (areFieldControlsActive() && firstPress) {
            // Check talk request - Initiate talk
            console.log('o', isActionInProgress())
            for (let i = 0; i < window.currentField.models.length; i++) {
                if (window.currentField.models[i].scene.userData.closeToTalk === true) {
                    // setActionInProgress('talk')
                    initiateTalk(i, window.currentField.models[i])
                }
            }
        }
    })
    getKeyPressEmitter().on('r1', (firstPress) => { // Just for debugging purposes to get 'back' from the talk interaction
        if (areFieldControlsActive && firstPress && isActionInProgress() === 'talk') {
            console.log('r1', isActionInProgress())
            clearActionInProgress()
            setPlayableCharacterIsInteracting(false)
        }
    })


    getKeyPressEmitter().on('triangle', async (firstPress) => {
        if (areFieldControlsActive && firstPress && !isActionInProgress() && isMenuEnabled()) { // Also need to check is menu is disabled
            // Toggle position helper visibility
            console.log('triangle', isActionInProgress())
            fadeOutAndLoadMenu(MENU_TYPE.MainMenu, 1)
        }
    })
    getKeyPressEmitter().on('r2', async (firstPress) => { // Just for debugging purposes to get 'back' from the menu
        if (areFieldControlsActive && firstPress && isActionInProgress() === 'menu') {
            // Toggle position helper visibility
            console.log('r2', isActionInProgress())
            unfreezeField()
        }
    })


    getKeyPressEmitter().on('select', (firstPress) => {
        if (areFieldControlsActive && firstPress) {
            // Toggle position helper visibility
            togglePositionHelperVisility()
        }
    })

    getKeyPressEmitter().on('l1', async (firstPress) => {
        if (areFieldControlsActive && firstPress) {

        }
    })
    getKeyPressEmitter().on('l2', async (firstPress) => {
        if (areFieldControlsActive && firstPress) {
            await nextPageOrCloseActiveDialogs()
        }
    })

    getKeyPressEmitter().on('up', (firstPress) => {
        if (areFieldControlsActive && isChoiceActive) {
            console.log('navigate choice UP')
            navigateChoice(false)
        }
    })
    getKeyPressEmitter().on('down', (firstPress) => {
        if (areFieldControlsActive && isChoiceActive) {
            console.log('navigate choice DOWN')
            navigateChoice(true)
        }
    })


}

export {
    initFieldKeypressActions
}
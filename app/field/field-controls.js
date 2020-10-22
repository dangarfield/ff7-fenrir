import { getKeyPressEmitter } from '../interaction/inputs.js'
import { togglePositionHelperVisility } from './field-position-helpers.js'
import {
    initiateTalk, isActionInProgress, fadeOutAndLoadMenu
} from './field-actions.js'
import { nextPageOrCloseActiveDialogs, navigateChoice, isChoiceActive } from './field-dialog-helper.js'
import { isMenuEnabled } from './field-module.js'
import { MENU_TYPE } from '../menu/menu-module.js'

let INIT_COMPLETE = false

const areFieldControlsActive = () => { return window.anim.activeScene === 'field' }
const initFieldKeypressActions = () => {
    if (INIT_COMPLETE) {
        return
    }
    getKeyPressEmitter().on('o', (firstPress) => {

        if (areFieldControlsActive() && firstPress) {
            nextPageOrCloseActiveDialogs()
        }

        if (areFieldControlsActive() && firstPress && window.currentField.playableCharacter && window.currentField.playableCharacterCanMove) {
            // Check talk request - Initiate talk
            console.log('o', isActionInProgress())
            // Probably need to look at a more intelligent way to define which actions are performed
            // TODO - Need to really sort these by distance before loops
            for (let i = 0; i < window.currentField.models.length; i++) {
                if (window.currentField.models[i].scene.userData.closeToTalk === true &&
                    window.currentField.models[i].userData.talkEnabled === true) {
                    // setActionInProgress('talk')
                    initiateTalk(i, window.currentField.models[i])
                    break
                }
            }
            // for (let i = 0; i < window.currentField.lineLines.children.length; i++) {
            //     const line = window.currentField.lineLines.children[i]
            //     if (line.userData.enabeled) {
            //         if (line.userData.triggered) {
            //             // TODO - This can be called whilst dialogs are shown etc
            //             // maybe only trigger this if player is allowed to move
            //             lineOKTriggered(line.userData.entityId)
            //             lineGoTriggered(line.userData.entityId, line) // Workaround for ladders
            //         }
            //     }
            // }

        }
    })

    getKeyPressEmitter().on('r1', (firstPress) => {
        if (areFieldControlsActive && firstPress && isActionInProgress() === 'talk') {
            // console.log('r1', isActionInProgress())
            // clearActionInProgress()
            // setPlayableCharacterIsInteracting(false)
        }
    })


    getKeyPressEmitter().on('triangle', async (firstPress) => {
        if (areFieldControlsActive && firstPress && isMenuEnabled()) { // Also need to check is menu is disabled
            // Toggle position helper visibility
            console.log('triangle', isActionInProgress())
            fadeOutAndLoadMenu(MENU_TYPE.MainMenu, 1)
        }
    })
    getKeyPressEmitter().on('r2', async (firstPress) => {
        if (areFieldControlsActive && firstPress && isActionInProgress() === 'menu') {
            // // Toggle position helper visibility
            // console.log('r2', isActionInProgress())
            // unfreezeField()
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

    INIT_COMPLETE = true
}

export {
    initFieldKeypressActions
}
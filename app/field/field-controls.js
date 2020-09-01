import { getKeyPressEmitter } from '../interaction/inputs.js'
import { togglePositionHelperVisility } from './field-position-helpers.js'
import { setPlayableCharacterMovability, initiateTalk, isActionInProgress, setActionInProgress, clearActionInProgress, loadMenu, unfreezeFieldFromClosedMenu } from './field-actions.js'
import { nextPageOrCloseActiveDialogs, navigateChoice, isChoiceActive } from './field-dialog-helper.js'

const initFieldKeypressActions = () => {
    getKeyPressEmitter().on('o', (firstPress) => {

        if (firstPress) {
            nextPageOrCloseActiveDialogs()
        }


        // TODO - Refactor
        // if (firstPress && !isActionInProgress()) {
        //     // Check talk request - Initiate talk
        //     console.log('o', isActionInProgress())
        //     for (let i = 0; i < window.currentField.models.length; i++) {
        //         if (window.currentField.models[i].scene.userData.closeToTalk === true) {
        //             setActionInProgress('talk')
        //             initiateTalk(i, window.currentField.models[i])
        //         }
        //     }

        // } else if (firstPress && isActionInProgress() === 'talk') {
        //     console.log('speed up or cancel talk')
        //     // Need to test this when there are multiple dialogs on screen etc, will probably want amending
        //     // Ideally there woud be an opcode for closing, but I haven't looked too much yet
        //     nextPageOrCloseActiveDialogs()
        // }
    })
    getKeyPressEmitter().on('r1', (firstPress) => { // Just for debugging purposes to get 'back' from the talk interaction
        if (firstPress && isActionInProgress() === 'talk') {
            console.log('r1', isActionInProgress())
            clearActionInProgress()
            setPlayableCharacterMovability(true)
        }
    })


    getKeyPressEmitter().on('triangle', async (firstPress) => {
        if (firstPress && !isActionInProgress()) { // Also need to check is menu is disabled
            // Toggle position helper visibility
            console.log('triangle', isActionInProgress())
            loadMenu()
        }
    })
    getKeyPressEmitter().on('r2', async (firstPress) => { // Just for debugging purposes to get 'back' from the menu
        if (firstPress && isActionInProgress() === 'menu') {
            // Toggle position helper visibility
            console.log('r2', isActionInProgress())
            unfreezeFieldFromClosedMenu()
        }
    })


    getKeyPressEmitter().on('select', (firstPress) => {
        if (firstPress) {
            // Toggle position helper visibility
            togglePositionHelperVisility()
        }
    })

    getKeyPressEmitter().on('l1', async (firstPress) => {
        if (firstPress) {

        }
    })
    getKeyPressEmitter().on('l2', async (firstPress) => {
        if (firstPress) {
            await nextPageOrCloseActiveDialogs()
        }
    })

    getKeyPressEmitter().on('up', (firstPress) => {
        if (isChoiceActive) {
            console.log('navigate choice UP')
            navigateChoice(false)
        }
    })
    getKeyPressEmitter().on('down', (firstPress) => {
        if (isChoiceActive) {
            console.log('navigate choice DOWN')
            navigateChoice(true)
        }
    })


}

export {
    initFieldKeypressActions
}
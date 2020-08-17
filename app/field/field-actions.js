import { isFadeInProgress, fadeIn, fadeOut } from './field-fader.js'
import { loadField } from './field-module.js'
import { createDialogBox, showWindowWithDialog } from './field-ortho-scene.js'

let actionInProgress = false

const isActionInProgress = () => {
    const progress = isFadeInProgress() ? 'transition' : actionInProgress
    // console.log('isActionInProgress', progress)
    return progress
}
const setActionInProgress = (action) => { actionInProgress = action }
const clearActionInProgress = () => { actionInProgress = false }


const triggerTriggered = (i, isOn) => {
    let trigger = window.currentField.data.triggers.triggers[i]
    console.log('triggerTriggered', i, isOn, trigger)
    // TODO Implement sounds too
    let paramBGs = window.currentField.backgroundLayers.children.filter(bg => bg.userData.param === trigger.bgGroupId_param)
    // 0 - OnTrigger - ON
    // 1 - OnTrigger - OFF
    // 2 - OnTrigger - ON, AwayFromTrigger - OFF
    // 3 - OnTrigger - OFF, AwayFromTrigger - ON
    // 4 - OnTrigger - ON, AwayFromTriggerOnPlusSide - OFF
    // 5 - OnTrigger - OFF, AwayFromTriggerOnPlusSide - ON
    switch (trigger.behavior) {
        case 0: // behavior: 1 -> sininb2 (HAVEN'T TESTED)
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = true
                }
            }
            break
        case 1: // behavior: 1 -> sininb2 (HAVEN'T TESTED)
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = false
                }
            }
            break
        case 2:
        case 4:
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = isOn
                }
            }
            break
        case 3: // behavior: 3 -> itown1a, itown1b
        case 5: // WAll market materia seller door sound https://www.youtube.com/watch?v=S5WqtdsdvXM&list=PLDgypNs3MY2TrF00OMNcK2BCHc9CovwPI&index=4 11:28
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = !isOn
                }
            }
            break
        default:
            window.alert('Unknown trigger triggered', i, isOn, trigger)
            break
    }


    // Sounds, not 100% yet, by the looks of it:
    // soundId: 2 -> door -> 122.ogg
    // soundId: 3 -> swish
}

const modelCollisionTriggered = (i) => {
    console.log('modelCollisionTriggered', i)
}

const initiateTalk = async (i, fieldModel) => {
    console.log('initiateTalk', i, fieldModel)
    setPlayableCharacterMovability(false)
    window.currentField.playableCharacter.mixer.stopAllAction()

    // Hardcoded placeholders
    // await createDialogBox(0, 10, 10, 266, 57, 1)
    // await showWindowWithDialog(0, 'Biggs<br/>“Think how many of our people risked their<br/>	lives, just for this code…”')
    // await showWindowWithDialog(0, '{CLOUD}<br/>“Think how many of our people risked their<br/>	lives, just for this code…”')
    await createDialogBox(2, 60, 145, 209, 73, 1)
    await showWindowWithDialog(2, '{Cloud}<br/>“…”<br/>{CHOICE}Don\'t see many flowers around here<br/>{CHOICE}Never mind')


    console.log('talk progressed')
    setPlayableCharacterMovability(true)
    clearActionInProgress()
}
const setPlayableCharacterMovability = (canMove) => {
    window.currentField.playableCharacter.scene.userData.playableCharacterMovability = canMove
}
const loadMenu = async () => {
    setActionInProgress('menu')
    window.anim.clock.stop()
    setPlayableCharacterMovability(false)
    await fadeOut()
    // TODO - LoadMenuModule
}
const unfreezeFieldFromClosedMenu = async () => {
    clearActionInProgress()
    window.anim.clock.start()
    setPlayableCharacterMovability(true)
    await fadeIn()
}
const gatewayTriggered = async (i) => {
    const gateway = window.currentField.data.triggers.gateways[i]
    console.log('gatewayTriggered', i, gateway, gateway.fieldName)
    setActionInProgress('gateway')
    window.anim.clock.stop()
    setPlayableCharacterMovability(false)
    await fadeOut()
    const playableCharacterInitData = { position: gateway.destinationVertex, direction: 100 }
    loadField(gateway.fieldName, playableCharacterInitData)
}
export {
    gatewayTriggered,
    triggerTriggered,
    modelCollisionTriggered,
    initiateTalk,
    setPlayableCharacterMovability,
    isActionInProgress,
    setActionInProgress,
    clearActionInProgress,
    loadMenu,
    unfreezeFieldFromClosedMenu
}
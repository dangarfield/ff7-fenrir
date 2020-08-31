import { isFadeInProgress, fadeIn, fadeOut } from './field-fader.js'
import { loadField } from './field-module.js'

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

    // Hardcoded placeholders -> Move these to op code section init
    // await createDialogBox(0, 10, 10, 266, 57, 1)
    // await createDialogBox(0, 10, 121, 265, 89, 1)
    // const currentChoice = await showWindowWithDialog(0, 'Jessie<br/>“Push <fe>{YELLOW}[OK]<fe>{WHITE} in front of a ladder<br/>\tto grab on to it.<br/>\tThen use the <fe>{PURPLE}[Directional button]<fe>{GREEN}<br/>\tto climb up and down.”')

    // await createDialogBox(1, 10, 10, 239, 217, 1)
    // const currentChoice = await showWindowWithDialog(1, 'Do <fe>{PURPLE}[CANCEL]<fe>{WHITE}<br/>Re <fe>{PURPLE}[SWITCH]<fe>{WHITE}<br/>Mi <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Fa <fe>{PURPLE}[OK]<fe>{WHITE}<br/>So <fe>{PURPLE}[END]<fe>{WHITE}/<fe>{PURPLE}[HOME]<fe>{WHITE} + <fe>{PURPLE}[CANCEL]<fe>{WHITE}<br/>La <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[SWITCH]<fe>{WHITE}<br/>Ti <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[MENU]<fe>{WHITE}<br/>Do <fe>{PURPLE}[PAGEUP]<fe>{WHITE}/<fe>{PURPLE}[PAGEDOWN]<fe>{WHITE} + <fe>{PURPLE}[OK]<fe>{WHITE}<br/>Do Mi So (C)\tDirectional key Down<br/>Do Fa La (F)\tDirectional key Left<br/>Re So Ti (G)\tDirectional key Up<br/>Mi So Do (C)\tDirectional key Right<br/>End\t\t<fe>{PURPLE}[START]<fe>{WHITE} and select[SELECT]')

    // await createDialogBox(2, 60, 145, 209, 73, 1)
    // const currentChoice = await showWindowWithDialog(2, '{Cloud}<br/>“…”<br/>{CHOICE}Don\'t see many flowers around here<br/>{CHOICE}Never mind')
    // const currentChoice = await showWindowWithDialog(2, 'Flower girl<br/>“What happened?”<br/>{CHOICE}You\'d better get out of here<br/>{CHOICE}Nothing…hey…')
    // 'Biggs<br/>“He WAS in SOLDIER, Jessie.”{PAUSE}“But he quit and is with us now.”'
    // 'Jessie<br/>“Push <fe>{PURPLE}[OK]<fe>{WHITE} in front of a ladder<br/>\tto grab on to it.<br/>\tThen use the <fe>{PURPLE}[Directional button]<fe>{WHITE}<br/>\tto climb up and down.”'
    // 'Biggs<br/>“Think how many of our people risked their<br/>\tlives, just for this code…”'

    console.log('talk progressed', currentChoice)
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
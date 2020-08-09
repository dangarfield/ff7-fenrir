const gatewayTriggered = (i) => {
    console.log('gatewayTriggered', i)
    // Should probably disable movement after this has been hit
    // window.currentField.playableCharacter = undefined
}

const triggerTriggered = (i, isOn) => {
    let trigger = window.currentField.data.triggers.triggers[i]
    console.log('triggerTriggered', i, isOn, trigger)
    // TODO Implement sounds too
    let paramBGs = window.currentField.backgroundLayers.children.filter(bg => bg.userData.param === trigger.bgGroupId_param)
    switch (trigger.behavior) {
        case 1: // behavior: 1 -> sininb2 (HAVEN'T TESTED)
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = !isOn
                }
            }
            break
        case 3: // behavior: 3 -> itown1a, itown1b
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = !isOn
                }
            }
            break
        case 4:
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = isOn
                }
            }
            break
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

const initiateTalk = (i, fieldModel) => {
    console.log('initiateTalk', i, fieldModel)
    setPlayableCharacterMovability(false)
}
const setPlayableCharacterMovability = (canMove) => {
    window.currentField.playableCharacter.scene.userData.playableCharacterMovability = canMove
}
export {
    gatewayTriggered,
    triggerTriggered,
    modelCollisionTriggered,
    initiateTalk,
    setPlayableCharacterMovability
}
const gatewayTriggered = (i) => {
    console.log('gatewayTriggered', i)
    // Should probably disable movement after this has been hit
    // window.currentField.playableCharacter = undefined
}

const triggerTriggered = (i, isOn) => {
    let trigger = window.currentField.data.triggers.triggers[i]
    // console.log('triggerTriggered', i, isOn, trigger)
    switch (trigger.behavior) {
        case 5:
            let paramBGs = window.currentField.backgroundLayers.children.filter(bg => bg.userData.param === trigger.bgGroupId_param)
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = !isOn
                }
            }
            // console.log('Change background', trigger.bgGroupId_param, trigger.bgFrameId_state, paramBGs)
            break;

        default:
            window.alert('Unknown trigger triggered', i, isOn, trigger)
            break;
    }
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
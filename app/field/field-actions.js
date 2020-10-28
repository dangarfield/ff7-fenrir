import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getActiveInputs } from '../interaction/inputs.js'
import { isFadeInProgress, fadeIn, fadeOut } from './field-fader.js'
import { loadField } from './field-module.js'
import { startFieldRenderLoop } from './field-scene.js'
import { loadMenuWithWait, loadMenuWithoutWait, doesMenuRequireFadeOut, loadTutorial } from '../menu/menu-module.js'
import { loadBattleWithSwirl } from '../battle-swirl/battle-swirl-module.js'
import { loadMiniGame } from '../minigame/minigame-module.js'
import { isBattleLockEnabled } from './field-battle.js'
import { getFieldNameForId } from './field-metadata.js'
import { getDegreesFromTwoPoints } from './field-models.js'
import {
    stopAllLoops, triggerEntityTalkLoop, triggerEntityMoveLoops, triggerEntityGoLoop,
    triggerEntityGo1xLoop, triggerEntityGoAwayLoop, triggerEntityOKLoop, triggerEntityCollisionLoop
} from './field-op-loop.js'

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
const processTalkContactTriggersForFrame = () => {
    if (!window.currentField.playableCharacter) {
        return
    }

    // console.log('asd', delta, window.currentField.playableCharacterCanMove, window.currentField.setPlayableCharacterIsInteracting)
    // Can player move?
    if (window.currentField.setPlayableCharacterIsInteracting) {
        return
    }
}
const processLineTriggersForFrame = () => {
    if (!window.currentField.playableCharacter) {
        return
    }

    // console.log('asd', delta, window.currentField.playableCharacterCanMove, window.currentField.setPlayableCharacterIsInteracting)
    // Can player move?
    if (window.currentField.setPlayableCharacterIsInteracting) {
        return
    }
    const position = window.currentField.playableCharacter.scene.position

    for (let i = 0; i < window.currentField.lineLines.children.length; i++) {
        const line = window.currentField.lineLines.children[i]
        if (line.userData.enabled) {
            const closestPointOnLine = new THREE.Line3(line.geometry.vertices[0], line.geometry.vertices[1]).closestPointToPoint(position, true, new THREE.Vector3())
            const distance = position.distanceTo(closestPointOnLine)
            const entityId = line.userData.entityId
            if (distance < 0.007) {
                // if (line.userData.triggered === false) {
                //     line.userData.triggered = true
                if (window.currentField.playableCharacter.scene.userData.isSlipDirection && !line.userData.slippabilityEnabled) {
                    window.currentField.playableCharacter.scene.rotation.y = THREE.Math.degToRad(180 - window.currentField.playableCharacter.scene.userData.originalDirection)
                    window.currentField.playableCharacter.mixer.stopAllAction()
                    return
                }
                if (line.userData.triggeredOnce === undefined || line.userData.triggeredOnce === false) {
                    triggerEntityGo1xLoop(entityId)
                    line.userData.triggeredOnce = true
                    return
                }
                line.userData.triggered = true
                triggerEntityGoLoop(entityId)

                let playerDirection = window.currentField.data.triggers.header.controlDirectionDegrees
                // console.log('Direction', window.currentField.data.triggers.header.controlDirection, window.currentField.data.triggers.header.controlDirectionDegrees, direction)

                let isMoving = true
                if (getActiveInputs().up && getActiveInputs().right) { playerDirection += 45 }
                else if (getActiveInputs().right && getActiveInputs().down) { playerDirection += 135 }
                else if (getActiveInputs().down && getActiveInputs().left) { playerDirection += 225 }
                else if (getActiveInputs().left && getActiveInputs().up) { playerDirection += 315 }
                else if (getActiveInputs().up) { playerDirection += 0 }
                else if (getActiveInputs().right) { playerDirection += 90 }
                else if (getActiveInputs().down) { playerDirection += 180 }
                else if (getActiveInputs().left) { playerDirection += 270 }
                else { isMoving = false }

                const lineDirection = getDegreesFromTwoPoints(position, closestPointOnLine)
                const directionAlignment = Math.abs(playerDirection - lineDirection)
                const movingInDirectionOfLine = isMoving && (directionAlignment <= 110)

                // console.log('triggerEntity KEYS', line.userData.entityName, isMoving, movingInDirectionOfLine, playerDirection, lineDirection, directionAlignment, '-', distance, getActiveInputs().up, getActiveInputs().right, getActiveInputs().down, getActiveInputs().left, '-', getActiveInputs().o)
                if (movingInDirectionOfLine) {
                    triggerEntityMoveLoops(entityId)
                    triggerEntityOKLoop(entityId)
                    return
                }
                if (getActiveInputs().o) {
                    triggerEntityOKLoop(entityId)
                    return
                }

                // }
                // if (window.currentField.playableCharacter.scene.userData.isSlipDirection && !line.userData.slippabilityEnabled) {
                //     window.currentField.playableCharacter.scene.rotation.y = THREE.Math.degToRad(180 - window.currentField.playableCharacter.scene.userData.originalDirection)
                //     window.currentField.playableCharacter.mixer.stopAllAction()
                //     return
                // }
                // } else {
                //     if (line.userData.triggered === true) {
                //         line.userData.triggered = false
                //         lineGoTriggered(entityId, line)
                //     }
            } else {
                // console.log('triggerEntity FAR', line.userData.entityName, distance)
                // console.log('triggerEntity ELSE', line.userData.triggered)
                if (line.userData.triggered) {
                    triggerEntityGoAwayLoop(entityId)
                    line.userData.triggered = false
                    line.userData.triggeredOnce = false
                    return
                }
                // line.userData.triggered = false
                // line.userData.triggeredOnce = false
            }
            // if (distance < 0.05 && distance < 0.05) { // TODO - Guess
            //     if (line.userData.triggeredAway === false) {
            //         line.userData.triggeredAway = true
            //     }
            // } else {
            //     if (line.userData.triggeredAway === true) {
            //         line.userData.triggeredAway = false
            //         triggerEntityGoAwayLoop(entityId)
            //     }
            // }
        }
    }
}

const modelCollisionTriggered = (i, fieldModel) => {
    console.log('modelCollisionTriggered', i)
    triggerEntityCollisionLoop(fieldModel.userData.entityId)
}

const initiateTalk = async (i, fieldModel) => {
    console.log('initiateTalk', i, fieldModel)
    setPlayableCharacterIsInteracting(true)
    window.currentField.playableCharacter.mixer.stopAllAction()
    triggerEntityTalkLoop(fieldModel.userData.entityId)
    setPlayableCharacterIsInteracting(false)
    clearActionInProgress()
}

const setPlayableCharacterIsInteracting = (isInteracting) => {
    window.currentField.playableCharacterIsInteracting = isInteracting
    // window.currentField.playableCharacterCanMove = !isInteracting
}
const fadeOutAndLoadMenu = async (menuType, menuParam) => {
    if (doesMenuRequireFadeOut(menuType)) {
        setActionInProgress('menu')
        window.anim.clock.stop()
        setPlayableCharacterIsInteracting(true)
        await fadeOut(true)
        await loadMenuWithWait(menuType, menuParam)
        await unfreezeField()
    } else {
        loadMenuWithoutWait(menuType, menuParam)
    }
}
const fadeOutAndLoadTutorial = async (tutorialId) => {
    setActionInProgress('menu')
    window.anim.clock.stop()
    setPlayableCharacterIsInteracting(true)
    await fadeOut(true)
    await loadTutorial(tutorialId)
    await unfreezeField()
}
const unfreezeField = async () => {
    startFieldRenderLoop()
    clearActionInProgress()
    window.anim.clock.start()
    setPlayableCharacterIsInteracting(false)
    await fadeIn()
}
const gatewayTriggered = async (i) => {
    const gateway = window.currentField.data.triggers.gateways[i]
    console.log('positionPlayableCharacterFromTransition gatewayTriggered', i, gateway, gateway.fieldName, window.currentField.gatewayTriggersEnabled)
    setActionInProgress('gateway')
    window.anim.clock.stop()
    window.currentField.playableCharacterCanMove = false
    setPlayableCharacterIsInteracting(true)
    await stopAllLoops()
    await fadeOut()
    const playableCharacterInitData = {
        triangleId: gateway.destinationVertex.triangleId,
        position: { x: gateway.destinationVertex.x, y: gateway.destinationVertex.y },
        direction: gateway.destinationVertex.direction,
        characterName: window.currentField.playableCharacter.userData.characterName
    }
    loadField(gateway.fieldName, playableCharacterInitData)
}
const jumpToMap = async (fieldId, x, y, triangleId, direction) => {
    const fieldName = await getFieldNameForId(fieldId)
    console.log('jumpToMap', fieldId, fieldName, x, y, triangleId, direction)
    setActionInProgress('gateway')
    window.anim.clock.stop()
    window.currentField.playableCharacterCanMove = false
    setPlayableCharacterIsInteracting(true)
    await stopAllLoops()
    await fadeOut()
    const playableCharacterInitData = {
        triangleId: triangleId,
        position: { x: x, y: y },
        direction: direction,
        characterName: window.currentField.playableCharacter.userData.characterName
    }
    loadField(fieldName, playableCharacterInitData)
}
const jumpToMapFromMiniGame = async (fieldId, x, y, z) => {
    const fieldName = await getFieldNameForId(fieldId)
    console.log('jumpToMapFromMinigame', fieldId, fieldName, x, y, z)

    const playableCharacterInitData = {
        position: { x: x, y: y, z: z },
        direction: 0,
        characterName: window.currentField.playableCharacter.userData.characterName
    }
    loadField(fieldName, playableCharacterInitData)
}
const jumpToMiniGame = async (gameId, options, returnInstructions) => {
    setActionInProgress('gateway')
    window.anim.clock.stop()
    window.currentField.playableCharacterCanMove = false
    setPlayableCharacterIsInteracting(true)
    await stopAllLoops()
    await fadeOut()
    loadMiniGame(gameId, options, returnInstructions)
}
const setGatewayTriggerEnabled = (enabled) => {
    window.currentField.gatewayTriggersEnabled = enabled
    console.log('setGatewayTriggerEnabled', window.currentField.gatewayTriggersEnabled)
}
const triggerBattleWithSwirl = (battleId) => {
    // Maybe pause current field loop ?!
    if (isBattleLockEnabled()) {
        return
    }
    setActionInProgress('battle')
    window.anim.clock.stop()
    setPlayableCharacterIsInteracting(true)
    const options = { things: 'more-things' } // get options from currentField / somewhere
    loadBattleWithSwirl(battleId, options)
}
export {
    gatewayTriggered,
    triggerTriggered,
    modelCollisionTriggered,
    initiateTalk,
    setPlayableCharacterIsInteracting,
    isActionInProgress,
    setActionInProgress,
    clearActionInProgress,
    fadeOutAndLoadMenu,
    fadeOutAndLoadTutorial,
    unfreezeField,
    triggerBattleWithSwirl,
    setGatewayTriggerEnabled,
    jumpToMap,
    jumpToMapFromMiniGame,
    jumpToMiniGame,
    processLineTriggersForFrame
}
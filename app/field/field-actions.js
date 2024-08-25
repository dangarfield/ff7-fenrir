import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import { getActiveInputs } from '../interaction/inputs.js'
import {
  isTransitionInProgress,
  transitionIn,
  transitionOut,
  getTransitionFaderColor,
  TRANSITION_COLOR
} from './field-fader.js'
import { loadField } from './field-module.js'
import { startFieldRenderLoop } from './field-scene.js'
import {
  loadMenuWithWait,
  loadMenuWithoutWait,
  doesMenuRequireTransitionOut,
  loadTutorial
} from '../menu/menu-module.js'
import { loadBattleWithSwirl } from '../battle-swirl/battle-swirl-module.js'
import { loadMiniGame } from '../minigame/minigame-module.js'
import { isBattleLockEnabled } from './field-battle.js'
import { getFieldNameForId } from './field-metadata.js'
import {
  getDegreesFromTwoPoints,
  setPlayableCharacterCanMove
} from './field-models.js'
import {
  stopAllLoops,
  triggerEntityTalkLoop,
  triggerEntityMoveLoops,
  triggerEntityGoLoop,
  triggerEntityGo1xLoop,
  triggerEntityGoAwayLoop,
  triggerEntityOKLoop,
  triggerEntityCollisionLoop,
  canOKLoopBeTriggeredOnMovement,
  isFieldLoopActive,
  setFieldLoopActive
} from './field-op-loop.js'
import TWEEN from '../../assets/tween.esm.js'
import { SHAKE_TWEEN_GROUP } from './field-op-codes-camera-media-helper.js'

let actionInProgress = false

const isActionInProgress = () => {
  const progress = isTransitionInProgress() ? 'transition' : actionInProgress
  // console.log('isActionInProgress', progress)
  return progress
}
const setActionInProgress = action => {
  actionInProgress = action
}
const clearActionInProgress = () => {
  actionInProgress = false
}

const triggerTriggered = (i, isOn) => {
  const trigger = window.currentField.data.triggers.triggers[i]
  console.log('triggerTriggered', i, isOn, trigger)
  // TODO Implement sounds too
  const paramBGs = window.currentField.backgroundLayers.children.filter(
    bg => bg.userData.param === trigger.bgGroupId_param
  )
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
// const processTalkContactTriggersForFrame = () => {
//   if (!window.currentField.playableCharacter) {
//     return
//   }
//   // console.log('asd', delta, window.currentField.playableCharacterCanMove, window.currentField.playableCharacterIsInteracting)
//   // Can player move?
//   if (window.currentField.playableCharacterIsInteracting) {
//   }
// }
const processTalkContactTrigger = () => {
  if (!window.currentField.playableCharacter) {
    return
  }
  // TODO - There should probably be another mechanism of seeing if the player is allowed to talk
  // It COULD be whether they are allowed to move or not, but this breaks on ealin_2
  if (window.currentField.playableCharacterIsInteracting) {
    console.log('Talk distance PLAYER IS INTERACTING')
    return
  }
  if (!window.currentField.playableCharacterCanMove) {
    console.log('Talk distance PLAYER CANNOT MOVE')
    return
  }

  const position = window.currentField.playableCharacter.scene.position
  const closeModels = []
  for (let i = 0; i < window.currentField.models.length; i++) {
    const fieldModel = window.currentField.models[i]
    if (fieldModel === window.currentField.playableCharacter) {
      continue
    }
    if (
      fieldModel.scene.position.x === 0 &&
      fieldModel.scene.position.y === 0 &&
      fieldModel.scene.position.z === 0
    ) {
      // Temporary until we place models properly, playable chars are dropped at 0,0,0
      continue
    }
    if (fieldModel.visible === false) {
      continue
    }
    if (!fieldModel.userData.talkEnabled) {
      continue
    }
    const distance = position.distanceTo(fieldModel.scene.position)
    const cutoff = (fieldModel.userData.talkRadius / 4096) * 1.85 // Seems to be 1.3, but in ealin_2, needs to be higher
    const closeToTalk = distance < cutoff
    console.log(
      `Talk distance ${fieldModel.userData.entityName}`,
      fieldModel.userData,
      fieldModel.scene.userData,
      i,
      distance,
      cutoff,
      closeToTalk
    )
    if (closeToTalk) {
      closeModels.push({ distance, fieldModel })
    }
  }
  closeModels.sort((a, b) => a.distance - b.distance)

  if (closeModels.length > 0) {
    for (let i = 0; i < closeModels.length; i++) {
      const fieldModel = closeModels[i].fieldModel
      const distance = closeModels[i].distance
      console.log(
        `Talk distance sorted ${fieldModel.userData.entityName}`,
        fieldModel.userData,
        fieldModel.scene.userData,
        distance
      )
    }
    const fieldModel = closeModels[0].fieldModel
    const distance = closeModels[0].distance
    console.log(
      `Talk distance closest ${fieldModel.userData.entityName}`,
      fieldModel.userData,
      fieldModel.scene.userData,
      distance
    )
    initiateTalk(fieldModel)
  }
}
const processLineTriggersForFrame = () => {
  if (!window.currentField.playableCharacter) {
    return
  }

  // console.log('asd', delta, window.currentField.playableCharacterCanMove, window.currentField.playableCharacterIsInteracting)
  // Can player move?
  if (window.currentField.playableCharacterIsInteracting) {
    return
  }
  const position = window.currentField.playableCharacter.scene.position

  // My gut instinct is that we should only process one line trigger even if there are two in proximity
  // but in wcrmb_2, it just did't work
  // TOOD - I'll keep it just 1 for now
  const closeLines = []

  for (let i = 0; i < window.currentField.lineLines.children.length; i++) {
    const line = window.currentField.lineLines.children[i]
    if (line.userData.enabled) {
      const linePos = line.geometry.getAttribute('position')
      const closestPointOnLine = new THREE.Line3(
        { x: linePos.getX(0), y: linePos.getY(0), z: linePos.getZ(0) },
        { x: linePos.getX(1), y: linePos.getY(1), z: linePos.getZ(1) }
      ).closestPointToPoint(position, true, new THREE.Vector3())
      const distance = position.distanceTo(closestPointOnLine)
      console.log('processLineTriggersForFrame', line.userData, distance)
      if (distance < 0.008) {
        closeLines.push({ distance, line, closestPointOnLine })
      } else {
        line.userData.playerClose = false
        // console.log('triggerEntity FAR', line.userData.entityName, distance)
        // console.log('triggerEntity ELSE', line.userData.triggered)
        if (line.userData.triggered) {
          triggerEntityGoAwayLoop(line.userData.entityId)
          line.userData.triggered = false
          line.userData.triggeredOnce = false
          return
        }
      }
    }
  }

  closeLines.sort((a, b) => a.distance - b.distance)
  if (closeLines.length > 0) {
    for (let i = 0; i < closeLines.length; i++) {
      const line = closeLines[i].line
      const distance = closeLines[i].distance
      console.log(
        `Line distance sorted ${line.userData.entityName}`,
        line.userData,
        distance
      )
    }
    const line = closeLines[0].line
    const distance = closeLines[0].distance
    const closestPointOnLine = closeLines[0].closestPointOnLine
    console.log(
      `Line distance closest ${line.userData.entityName}`,
      line.userData,
      distance
    )

    // if (line.userData.triggered === false) {
    //     line.userData.triggered = true
    line.userData.playerClose = true
    if (
      line.userData.triggeredOnce === undefined ||
      line.userData.triggeredOnce === false
    ) {
      triggerEntityGo1xLoop(line.userData.entityId)
      line.userData.triggeredOnce = true
      return
    }
    line.userData.triggered = true
    triggerEntityGoLoop(line.userData.entityId)

    let playerDirection =
      window.currentField.data.triggers.header.controlDirectionDegrees
    // console.log('Direction', window.currentField.data.triggers.header.controlDirection, window.currentField.data.triggers.header.controlDirectionDegrees, direction)

    let isMoving = true
    if (getActiveInputs().up && getActiveInputs().right) {
      playerDirection += 45
    } else if (getActiveInputs().right && getActiveInputs().down) {
      playerDirection += 135
    } else if (getActiveInputs().down && getActiveInputs().left) {
      playerDirection += 225
    } else if (getActiveInputs().left && getActiveInputs().up) {
      playerDirection += 315
    } else if (getActiveInputs().up) {
      playerDirection += 0
    } else if (getActiveInputs().right) {
      playerDirection += 90
    } else if (getActiveInputs().down) {
      playerDirection += 180
    } else if (getActiveInputs().left) {
      playerDirection += 270
    } else {
      isMoving = false
    }

    const lineDirection = getDegreesFromTwoPoints(position, closestPointOnLine)
    const directionAlignment = Math.abs(playerDirection - lineDirection)
    const movingInDirectionOfLine = isMoving && directionAlignment <= 110

    // console.log('triggerEntity KEYS', line.userData.entityName, isMoving, movingInDirectionOfLine, playerDirection, lineDirection, directionAlignment, '-', distance, getActiveInputs().up, getActiveInputs().right, getActiveInputs().down, getActiveInputs().left, '-', getActiveInputs().o)
    if (movingInDirectionOfLine) {
      triggerEntityMoveLoops(line.userData.entityId)
      // Strangely, OK loop is triggered repeatedbly on distance if there are NO Move loops. Infinity is no S2 - Move, About 8 times if there are no S3 - Move scripts with empty returns
      if (canOKLoopBeTriggeredOnMovement(line.userData.entityId)) {
        triggerEntityOKLoop(line.userData.entityId)
      }
    } else if (getActiveInputs().o) {
      triggerEntityOKLoop(line.userData.entityId)
    } else {
      // triggerEntityMoveLoops(line.userData.entityId) // Adding this back in for any movement as in ealin_1
      // TODO - Should be looked at later, potentially checking to see if any gateways have been crossed AFTER the event loop has gone round each time
      // return
    }
  }
}

const modelCollisionTriggered = (i, fieldModel) => {
  console.log('modelCollisionTriggered', i)
  triggerEntityCollisionLoop(fieldModel.userData.entityId)
}

const initiateTalk = async fieldModel => {
  console.log('initiateTalk', fieldModel)
  setPlayableCharacterIsInteracting(true)
  window.currentField.playableCharacter.mixer.stopAllAction()
  triggerEntityTalkLoop(fieldModel.userData.entityId)
  setPlayableCharacterIsInteracting(false)
  clearActionInProgress()
}

const setPlayableCharacterIsInteracting = isInteracting => {
  console.log('setPlayableCharacterIsInteracting', isInteracting)
  window.currentField.playableCharacterIsInteracting = isInteracting
  // window.currentField.playableCharacterCanMove = !isInteracting
}
const transitionOutAndLoadMenu = async (menuType, menuParam) => {
  if (doesMenuRequireTransitionOut(menuType)) {
    setActionInProgress('menu')
    stopFieldSceneAnimating()
    setPlayableCharacterIsInteracting(true)
    await transitionOut(true)
    await loadMenuWithWait(menuType, menuParam)
    await unfreezeField()
  } else {
    loadMenuWithoutWait(menuType, menuParam)
  }
}
const transitionOutAndLoadTutorial = async tutorialId => {
  setActionInProgress('menu')
  stopFieldSceneAnimating()
  setPlayableCharacterIsInteracting(true)
  await transitionOut(true)
  await loadTutorial(tutorialId)
  await unfreezeField()
}
const unfreezeField = async () => {
  setFieldLoopActive(true)
  startFieldRenderLoop()
  clearActionInProgress()
  window.anim.clock.start()
  setPlayableCharacterIsInteracting(false)
  await transitionIn()
}
const togglePauseField = async () => {
  if (isFieldLoopActive()) {
    stopFieldSceneAnimating()
    setPlayableCharacterIsInteracting(true)
  } else {
    await unfreezeField()
  }
}
const gatewayTriggered = async i => {
  const gateway = window.currentField.data.triggers.gateways[i]
  console.log(
    'positionPlayableCharacterFromTransition gatewayTriggered',
    i,
    gateway,
    gateway.fieldName,
    window.currentField.gatewayTriggersEnabled
  )
  setActionInProgress('gateway')
  stopFieldSceneAnimating()
  setPlayableCharacterCanMove(false)
  setPlayableCharacterIsInteracting(true)
  await stopAllLoops()
  await transitionOut()
  const playableCharacterInitData = {
    triangleId: gateway.destinationVertex.triangleId,
    position: {
      x: gateway.destinationVertex.x,
      y: gateway.destinationVertex.y
    },
    direction: gateway.destinationVertex.direction,
    characterName: window.currentField.playableCharacter.userData.characterName
  }
  loadField(gateway.fieldName, playableCharacterInitData)
}
const jumpToMap = async (fieldId, x, y, triangleId, direction) => {
  const fieldName = await getFieldNameForId(fieldId)
  console.log('jumpToMap', fieldId, fieldName, x, y, triangleId, direction)
  setActionInProgress('gateway')
  stopFieldSceneAnimating()
  setPlayableCharacterIsInteracting(true)
  setPlayableCharacterCanMove(false)
  await stopAllLoops()
  // await transitionOut() // I believe this fixes the issues when movies play before MAPJUMP
  // TODO - investigate if there are any MAPJUMPS with a transitionOut fade or if they are all instant
  let characterName = ''
  if (window.currentField.playableCharacter) {
    characterName = window.currentField.playableCharacter.userData.characterName
  }
  const playableCharacterInitData = {
    triangleId,
    position: { x, y },
    direction,
    characterName
  }
  if (getTransitionFaderColor() === TRANSITION_COLOR.WHITE) {
    playableCharacterInitData.whiteTransition = true
  }
  loadField(fieldName, playableCharacterInitData)
}
const jumpToMapFromMiniGame = async (fieldId, x, y, z) => {
  const fieldName = await getFieldNameForId(fieldId)
  console.log('jumpToMapFromMinigame', fieldId, fieldName, x, y, z)

  const playableCharacterInitData = {
    position: { x, y, z },
    direction: 0,
    characterName: window.currentField.playableCharacter.userData.characterName
  }
  loadField(fieldName, playableCharacterInitData)
}
const jumpToMiniGame = async (gameId, options, returnInstructions) => {
  setActionInProgress('gateway')
  stopFieldSceneAnimating()
  setPlayableCharacterCanMove(false)
  setPlayableCharacterIsInteracting(true)
  await stopAllLoops()
  await transitionOut()
  loadMiniGame(gameId, options, returnInstructions)
}
const setGatewayTriggerEnabled = enabled => {
  window.currentField.gatewayTriggersEnabled = enabled
  console.log(
    'setGatewayTriggerEnabled',
    window.currentField.gatewayTriggersEnabled
  )
}
const triggerBattleWithSwirl = async battleId => {
  // Maybe pause current field loop ?!
  if (isBattleLockEnabled()) {
    return
  }
  setActionInProgress('battle')
  stopFieldSceneAnimating()
  setPlayableCharacterIsInteracting(true)
  const options = { things: 'more-things' } // get options from currentField / somewhere
  // await loadBattleWithSwirl(battleId, options)
  unfreezeField()
}
const stopFieldSceneAnimating = () => {
  setFieldLoopActive(false)
  window.anim.clock.stop()
  TWEEN.removeAll()
  SHAKE_TWEEN_GROUP.removeAll()
}
export {
  gatewayTriggered,
  triggerTriggered,
  modelCollisionTriggered,
  setPlayableCharacterIsInteracting,
  isActionInProgress,
  setActionInProgress,
  clearActionInProgress,
  transitionOutAndLoadMenu,
  transitionOutAndLoadTutorial,
  unfreezeField,
  triggerBattleWithSwirl,
  setGatewayTriggerEnabled,
  jumpToMap,
  jumpToMapFromMiniGame,
  jumpToMiniGame,
  processLineTriggersForFrame,
  processTalkContactTrigger,
  togglePauseField
}

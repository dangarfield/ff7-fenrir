import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { sleep } from '../helpers/helpers.js'
import { runCameraScriptPair } from './battle-camera-op-loop.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

// MEMORY ADDRESSES
// POS x: 00BF2158, y: 00BF215A, z: 00BF215C
// TAR x: 00BE1130, y: 00BE1132, z: 00BE1134

const CAM_DATA = {
  position: {
    active: new THREE.Vector3(),
    to: new THREE.Vector3(),
    wait: 0,
    zInverted: false,
    easing: TWEEN.Easing.Quadratic.InOut,
    updateFunction: null
  },
  focus: {
    active: new THREE.Vector3(),
    to: new THREE.Vector3(),
    wait: 0,
    zInverted: false,
    easing: TWEEN.Easing.Quadratic.InOut,
    updateFunction: null
  },
  idle: {
    position: new THREE.Vector3(),
    focus: new THREE.Vector3()
  },
  actors: {
    // Probably should hold this in the battle-action state
    attacker: null,
    targets: []
  },
  fps: 15,
  idleCameraTargetSelection: 0 // This is when selecting targets, but a main animation is happening 0-1
}
window.BATTLE_CAM_DATA = CAM_DATA

const clearUpdateFunctionPosition = () => {
  CAM_DATA.position.updateFunction = null
}
const clearUpdateFunctionFocus = () => {
  CAM_DATA.focus.updateFunction = null
}
const applyCamData = battleCamera => {
  if (CAM_DATA.position.updateFunction) {
    CAM_DATA.position.updateFunction()
  }
  if (CAM_DATA.focus.updateFunction) {
    CAM_DATA.focus.updateFunction()
  }
  if (CAM_DATA.idleCameraTargetSelection === 0) {
    battleCamera.position.copy(CAM_DATA.position.active)
    battleCamera.lookAt(CAM_DATA.focus.active)
  } else {
    const lerpPos = CAM_DATA.position.active.clone()
    lerpPos.lerp(CAM_DATA.idle.position, CAM_DATA.idleCameraTargetSelection)
    battleCamera.position.copy(lerpPos)

    const lerpFoc = CAM_DATA.focus.active.clone()
    lerpFoc.lerp(CAM_DATA.idle.focus, CAM_DATA.idleCameraTargetSelection)
    battleCamera.lookAt(lerpFoc)
  }
}
const resetCamData = () => {
  CAM_DATA.position.active.set(0, 0, 0)
  CAM_DATA.position.to.set(0, 0, 0)
  CAM_DATA.position.wait = 0
  CAM_DATA.position.zInverted = false
  CAM_DATA.position.easing = TWEEN.Easing.Quadratic.InOut
  CAM_DATA.focus.active.set(0, -1, 0)
  CAM_DATA.focus.to.set(0, 0, 0)
  CAM_DATA.focus.wait = 0
  CAM_DATA.focus.zInverted = false
  CAM_DATA.focus.easing = TWEEN.Easing.Quadratic.InOut
  CAM_DATA.idle.position.set(0, 0, 0)
  CAM_DATA.idle.focus.set(0, 0, 0)
  CAM_DATA.idleCameraTargetSelection = 0
}

const setDebugCameraPosition = (positionID, cameraID) => {
  if (cameraID === undefined) cameraID = 1
  CAM_DATA.position.active.set(
    currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.x,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.y,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.z
  )
  CAM_DATA.focus.active.set(
    currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.x,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.y,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.z
  )
}
window.setDebugCameraPosition = setDebugCameraPosition

const tweenCamera = (camVector, from, to, frames, reference) => {
  const time = frames === 1 ? 1 : framesToTime(frames) // As fps is 15, an 'instant 1 frame' has to be kept the same
  const t = new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
    .to(to, time) // eg, 15 fps
    .easing(TWEEN.Easing.Quadratic.InOut) // ?
    .onUpdate(() => {
      camVector.set(from.x, from.y, from.z)
      // console.log(`CAMERA ${reference}: UPDATE`, camVector)
    })
    .onComplete(() => {
      console.log(`CAMERA ${reference}: END`, camVector, CAM_DATA)
      BATTLE_TWEEN_GROUP.remove(t)
    })
  // There is often a WAIT after a 1 frame MOVE then a FLASH, I assume the engine groups them, this is a simple fix
  if (frames === 1) {
    t.delay(1000 / 15)
  }
  t.start()
}
const setBattleCameraSpeed = isAMainScript => {
  CAM_DATA.fps = isAMainScript ? 30 : 15
}
const framesToTime = frames => {
  return (1000 / CAM_DATA.fps) * frames
}
const framesToActualFrames = frames => {
  return Math.floor(frames / (CAM_DATA.fps / 15))
}

const setDirectionOverride = (fromActor, toActor) => {
  if (fromActor === toActor) {
    return fromActor.model.scene.position > 0 ? -1 : 1
  }
  return false
}
const calcPosition = (from, to, offset, zInverted, directionOverride) => {
  // INPUTS
  // const from = new THREE.Vector3(0, 0, 0)
  // const to = new THREE.Vector3(1000, 0, 1000)
  // const offset = new THREE.Vector3(100, 0, 100)

  let direction2
  if (directionOverride) {
    direction2 = new THREE.Vector2(0, -to.z) // If attacker & target are same / same row
  } else {
    direction2 = new THREE.Vector2(to.x - from.x, to.z - from.z)
  }
  const angle2 = Math.atan2(direction2.y, direction2.x)

  const offsetDistance2 = Math.sqrt(offset.x * offset.x + offset.z * offset.z)
  const offsetAngle2 = Math.atan2(offset.x, offset.z)
  const combinedAngle2 = offsetAngle2 + angle2

  const rotatedOffsetX2 = offsetDistance2 * Math.cos(combinedAngle2)
  const rotatedOffsetZ2 = offsetDistance2 * Math.sin(combinedAngle2)

  // OUTPUTS
  // console.log(
  //   'CAMERA calcPosition',
  //   to.x,
  //   to.z,
  //   directionOverride,
  //   '->',
  //   direction2,
  //   angle2
  // )

  return zInverted
    ? new THREE.Vector3(
        to.x + rotatedOffsetX2,
        to.y + -offset.y,
        to.z + rotatedOffsetZ2
      )
    : new THREE.Vector3(
        to.x - rotatedOffsetX2,
        to.y + -offset.y,
        to.z - rotatedOffsetZ2
      )
}
const setIdleCameraPosition = (currentBattle, index) => {
  CAM_DATA.idle.position.x = currentBattle.camera[`camera${index + 1}`].pos.x
  CAM_DATA.idle.position.y = -currentBattle.camera[`camera${index + 1}`].pos.y
  CAM_DATA.idle.position.z = -currentBattle.camera[`camera${index + 1}`].pos.z
}
const setIdleCameraFocus = (currentBattle, index) => {
  CAM_DATA.idle.focus.x = currentBattle.camera[`camera${index + 1}`].dir.x
  CAM_DATA.idle.focus.y = -currentBattle.camera[`camera${index + 1}`].dir.y
  CAM_DATA.idle.focus.z = -currentBattle.camera[`camera${index + 1}`].dir.z
}
const executeInitialCameraScript = async currentBattle => {
  resetCamData()
  setIdleCameraPosition(currentBattle, 0)
  setIdleCameraFocus(currentBattle, 0)

  const initialCameraPosition = window.currentBattle.setup.initialCameraPosition

  const scriptPair =
    window.data.battle.camData.initialScripts[initialCameraPosition]

  // TODO - The is a 'horizontal fade' effect here too. Make it async
  console.log('CAMERA initial: START', scriptPair)
  // await runCameraScriptPair(scriptPair)
  // CAM_DATA.position.active.set(7000, 2000, 2000) // Temp, to speed up dev
  // CAM_DATA.focus.active.set(0, 0, -300)
  CAM_DATA.position.active.copy(CAM_DATA.idle.position) // Temp, to speed up dev
  CAM_DATA.focus.active.copy(CAM_DATA.idle.focus)

  console.log('CAMERA initial: END')
}
const setActorsForBattleCamera = (attacker, targets) => {
  CAM_DATA.actors.attacker = attacker
  CAM_DATA.actors.targets = targets
}
const ensureIdleCameraFocused = idleIsFocused => {
  // console.log(`ensureIdleCameraFocused: START`, idleIsFocused)
  const t = new TWEEN.Tween(CAM_DATA, BATTLE_TWEEN_GROUP)
    .to(
      { idleCameraTargetSelection: idleIsFocused ? 1 : 0 },
      150 // I think this is instant upon it's return, but I'll leave it here
    )
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onComplete(() => {
      // console.log(`ensureIdleCameraFocused: END`)
      BATTLE_TWEEN_GROUP.remove(t)
    })
  t.start()
}
const getPrimaryTarget = () => {
  if (CAM_DATA.actors.targets.includes(CAM_DATA.actors.attacker)) {
    return window.currentBattle.actors[CAM_DATA.actors.attacker] // For healing wind ?!
  }
  if (CAM_DATA.actors.targets.length > 0) {
    const target = Math.floor((CAM_DATA.actors.targets.length - 1) / 2)
    return window.currentBattle.actors[CAM_DATA.actors.targets[target]]
  }
  return window.currentBattle.actors[CAM_DATA.actors.targets[0]]
}

export {
  executeInitialCameraScript,
  CAM_DATA,
  applyCamData,
  tweenCamera,
  clearUpdateFunctionPosition,
  clearUpdateFunctionFocus,
  framesToTime,
  framesToActualFrames,
  setActorsForBattleCamera,
  setBattleCameraSpeed,
  setIdleCameraPosition,
  setIdleCameraFocus,
  calcPosition,
  setDirectionOverride,
  ensureIdleCameraFocused,
  getPrimaryTarget
}

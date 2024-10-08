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
  fps: 15
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
  battleCamera.position.copy(CAM_DATA.position.active)
  battleCamera.lookAt(CAM_DATA.focus.active)
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
  CAM_DATA.idle.position.set(0, 0, 0)
  CAM_DATA.idle.focus.set(0, 0, 0)
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
const getOrientedOpZ = (z, zInverted) => {
  // TODO - Take into account CAMDATA.position/focus.zInverted
  const aZ =
    window.currentBattle.actors[CAM_DATA.actors.attacker].model.scene.position.z
  const tZ =
    window.currentBattle.actors[CAM_DATA.actors.targets[0]].model.scene.position
      .z
  let rZ = z
  if (!zInverted) return rZ
  return -rZ
  // const aR = window.currentBattle.actors[
  //   CAM_DATA.actors.attacker
  // ].model.scene.
  // console.log('getOrientedOpZ', z, aZ, tZ)
  if (aZ < tZ) {
    // console.log('getOrientedOpZ aZ < tZ', z, aZ, tZ)
    // return -z
    rZ = -z
  } else if (aZ > tZ) {
    // console.log('getOrientedOpZ aZ > tZ', z, aZ, tZ)
    // return z
  } else if (aZ < 0) {
    // console.log('getOrientedOpZ aZ < 0', z, aZ, tZ)
    // return -z
    rZ = -z
  } else {
    // console.log('getOrientedOpZ aZ => 0', z, aZ, tZ)
    // return z
  }
  return rZ
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
  await runCameraScriptPair(scriptPair)
  console.log('CAMERA initial: END')
}
const setActorsForBattleCamera = (attacker, targets) => {
  CAM_DATA.actors.attacker = attacker
  CAM_DATA.actors.targets = targets
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
  getOrientedOpZ
}

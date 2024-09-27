import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { sleep } from '../helpers/helpers.js'
import { runScriptPair } from './battle-camera-op-loop.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

const CAM_DATA = {
  position: {
    active: new THREE.Vector3(),
    to: new THREE.Vector3(),
    wait: 0,
    unknown1: false,
    unknown2: false
  },
  target: {
    active: new THREE.Vector3(),
    to: new THREE.Vector3(),
    wait: 0,
    unknown1: false
  },
  idle: {
    position: new THREE.Vector3(),
    target: new THREE.Vector3()
  }
}
window.BATTLE_CAM_DATA = CAM_DATA

const applyCamData = battleCamera => {
  battleCamera.position.copy(CAM_DATA.position.active)
  battleCamera.lookAt(CAM_DATA.target.active)
}
const resetCamData = () => {
  CAM_DATA.position.active.set(0, 0, 0)
  CAM_DATA.position.to.set(0, 0, 0)
  CAM_DATA.position.wait = 0
  CAM_DATA.position.unknown1 = false
  CAM_DATA.position.unknown2 = false
  CAM_DATA.target.active.set(0, -1, 0)
  CAM_DATA.target.to.set(0, 0, 0)
  CAM_DATA.target.wait = 0
  CAM_DATA.target.unknown1 = false
  CAM_DATA.idle.position.set(0, 0, 0)
  CAM_DATA.idle.target.set(0, 0, 0)
}

const setDebugCameraPosition = (positionID, cameraID) => {
  if (cameraID === undefined) cameraID = 1
  CAM_DATA.position.active.set(
    currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.x,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.y,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.z
  )
  CAM_DATA.target.active.set(
    currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.x,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.y,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.z
  )
}
window.setDebugCameraPosition = setDebugCameraPosition

const tweenCamera = (camVector, from, to, frames, reference) => {
  const time = frames === 1 ? 1 : (frames / 15) * 1000 // As fps is 15, an 'instant 1 frame' has to be kept the same
  const t = new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
    .to(to, time) // eg, 15 fps
    .easing(TWEEN.Easing.Quadratic.InOut) // ?
    .onUpdate(() => {
      camVector.set(from.x, from.y, from.z)
      console.log(`CAMERA ${reference}: UPDATE`, camVector)
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

const setIdleCamera = currentBattle => {
  const idleCameraIndex = 1 // TODO - Not sure how to ascertain this value yet. 0-3

  CAM_DATA.idle.position.x =
    currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.x
  CAM_DATA.idle.position.y =
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.y
  CAM_DATA.idle.position.z =
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.z
  CAM_DATA.idle.target.x =
    currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.x
  CAM_DATA.idle.target.x =
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.y
  CAM_DATA.idle.target.x =
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.z
}
const executeInitialCameraScript = async currentBattle => {
  resetCamData()
  setIdleCamera(currentBattle)

  const initialCameraPosition = window.currentBattle.setup.initialCameraPosition

  const scriptPair =
    window.data.battle.camData.initialScripts[initialCameraPosition]

  // TODO - The is a 'horizontal fade' effect here too. Make it async
  console.log('CAMERA initial: START', scriptPair)
  await runScriptPair(scriptPair)
  console.log('CAMERA initial: END')
}

export { executeInitialCameraScript, CAM_DATA, applyCamData, tweenCamera }

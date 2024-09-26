import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { sleep } from '../helpers/helpers.js'
import { runScriptPair } from './battle-camera-op-loop.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

const CAM_DATA = {
  position: {
    active: new THREE.Vector3(),
    to: new THREE.Vector3(),
    wait: 0
  },
  target: {
    active: new THREE.Vector3(),
    to: new THREE.Vector3(),
    wait: 0
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
  CAM_DATA.target.active.set(0, -1, 0)
  CAM_DATA.target.to.set(0, 0, 0)
  CAM_DATA.target.wait = 0
  CAM_DATA.idle.position.set(0, 0, 0)
  CAM_DATA.idle.target.set(0, 0, 0)
}

const setDebugCameraPosition = (positionID, cameraID) => {
  if (cameraID === undefined) cameraID = 1
  window.battleCamera.position.set(
    currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.x,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.y,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].pos.z
  )
  window.battleCamera.lookAt(
    currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.x,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.y,
    -currentBattle.scene.cameraPlacement[positionID][`camera${cameraID}`].dir.z
  )
}
window.setDebugCameraPosition = setDebugCameraPosition

const executeInitialCameraScriptDebug = async () => {
  const initialCameraPosition = window.currentBattle.setup.initialCameraPosition
  const idleCameraIndex = 0

  const posOp0 =
    window.data.battle.camData.initialScripts[initialCameraPosition].position[0] // Get correct offsets from scene config
  const targetOp0 =
    window.data.battle.camData.initialScripts[initialCameraPosition].target[0]

  console.log(
    'CAMERA initial Scripts',
    window.data.battle.camData.initialScripts[initialCameraPosition]
  )
  console.log(
    'CAMERA initialCameraPosition',
    window.currentBattle.setup.initialCameraPosition,
    'idleCameraIndex',
    idleCameraIndex
  )

  const initialPosition = new THREE.Vector3(posOp0.x, -posOp0.y, -posOp0.z)
  const initialTarget = new THREE.Vector3(
    targetOp0.x,
    -targetOp0.y,
    -targetOp0.z
  )

  // How to find what offset for the idle camera? Or is this part of the random?!
  const idlePosition = new THREE.Vector3(
    currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.x,
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.y,
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.z
  )
  const idleTarget = new THREE.Vector3(
    currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.x,
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.y,
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.z
  )

  console.log(
    'CAMERA',
    posOp0,
    targetOp0,
    '->',
    initialPosition,
    initialTarget,
    '-',
    idlePosition,
    idleTarget
  )
  window.idleTarget = idleTarget

  const applyCamera = () => {
    window.battleCamera.position.copy(initialPosition)
    window.battleCamera.lookAt(initialTarget)
  }
  applyCamera()

  const tweenPosition = initialPosition.clone()
  const initialCameraPositionTween = new TWEEN.Tween(
    tweenPosition,
    BATTLE_TWEEN_GROUP
  )
    .to(idlePosition, 4000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      window.battleCamera.position.set(
        tweenPosition.x,
        tweenPosition.y,
        tweenPosition.z
      )
    })
    .onComplete(() => {
      BATTLE_TWEEN_GROUP.remove(initialCameraPositionTween)
    })
    .start()
  const tweenTarget = initialTarget.clone()
  const initialCameraTargetTween = new TWEEN.Tween(
    tweenTarget,
    BATTLE_TWEEN_GROUP
  )
    .to(idleTarget, 4000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      window.battleCamera.lookAt(tweenTarget)
    })
    .onComplete(() => {
      BATTLE_TWEEN_GROUP.remove(initialCameraTargetTween)
    })
    .start()
}
window.executeInitialCameraScriptDebug = executeInitialCameraScriptDebug

const setIdleCamera = currentBattle => {
  const idleCameraIndex = 0 // TODO - Not sure how to ascertain this value yet. 0-3

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

export { executeInitialCameraScript, CAM_DATA, applyCamData }

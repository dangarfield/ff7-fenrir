import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { sleep } from '../helpers/helpers.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

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

const executeInitialCameraScript = async () => {
  const initialCameraPosition = window.currentBattle.setup.initialCameraPosition
  const idleCameraIndex = 0

  const posOp0 =
    window.data.battle.camData.initialPositionScripts[initialCameraPosition][0] // Get correct offsets from scene config
  const dirOp0 =
    window.data.battle.camData.initialDirectionScripts[initialCameraPosition][0]

  console.log(
    'CAMERA initial Scripts',
    window.data.battle.camData.initialPositionScripts[initialCameraPosition],
    window.data.battle.camData.initialDirectionScripts[initialCameraPosition]
  )
  console.log(
    'CAMERA initialCameraPosition',
    window.currentBattle.setup.initialCameraPosition,
    'idleCameraIndex',
    idleCameraIndex
  )

  const initialPosition = new THREE.Vector3(
    posOp0.arg,
    -posOp0.arg2,
    -posOp0.arg3
  )
  const initialDirection = new THREE.Vector3( // Is this a point in space or rotation?!
    dirOp0.arg,
    -dirOp0.arg2,
    -dirOp0.arg3
  )

  // How to find what offset for the idle camera? Or is this part of the random?!
  const idlePosition = new THREE.Vector3(
    currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.x,
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.y,
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.pos.z
  )
  const idleDirection = new THREE.Vector3( // It's really a vector
    currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.x,
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.y,
    -currentBattle.scene.cameraPlacement[idleCameraIndex].camera1.dir.z
  )

  console.log(
    'CAMERA',
    posOp0,
    dirOp0,
    '->',
    initialPosition,
    initialPosition,
    '-',
    idlePosition,
    idleDirection
  )
  window.idleDirection = idleDirection

  const cameraPosition = initialPosition.clone()
  const cameraTarget = initialDirection.clone()

  const applyCamera = () => {
    window.battleCamera.position.copy(initialPosition)
    window.battleCamera.lookAt(initialDirection)
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
  const tweenTarget = initialDirection.clone()
  const initialCameraDirectionTween = new TWEEN.Tween(
    tweenTarget,
    BATTLE_TWEEN_GROUP
  )
    .to(idleDirection, 4000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      window.battleCamera.lookAt(tweenTarget)
    })
    .onComplete(() => {
      BATTLE_TWEEN_GROUP.remove(initialCameraDirectionTween)
    })
    .start()
}
window.executeInitialCameraScript = executeInitialCameraScript

export { setDebugCameraPosition, executeInitialCameraScript }

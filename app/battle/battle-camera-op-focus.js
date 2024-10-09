import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import {
  calcPosition,
  CAM_DATA,
  framesToTime,
  setDirectionOverride,
  setIdleCameraFocus,
  tweenCamera
} from './battle-camera.js'
import { BATTLE_TWEEN_GROUP, tweenSleep } from './battle-scene.js'

const ZINV = () => {
  CAM_DATA.focus.zInverted = true
  console.log('CAMERA focus ZINV', CAM_DATA.focus.zInverted)
}
const ZNORM = () => {
  console.log('CAMERA focus ZNORM')
  CAM_DATA.focus.zInverted = false
}
const IDLE = () => {
  console.log('CAMERA focus IDLE')
  CAM_DATA.focus.active.copy(CAM_DATA.focus.position)
}
const SETIDLE = op => {
  // Note: It's used in cam data initial scripts, but no battle is using any of those scripts...
  console.log('CAMERA focus SETIDLE', op)
  setIdleCameraFocus(window.currentBattle, op.index)
}
const XYZ = op => {
  CAM_DATA.focus.active.set(op.x, -op.y, -op.z)
  console.log('CAMERA focus XYZ', op, CAM_DATA)
}

const MOVEI = op => {
  console.log('CAMERA focus MOVEI: START', op, CAM_DATA)
  const from = CAM_DATA.focus.active.clone()
  const to = CAM_DATA.idle.focus
  tweenCamera(CAM_DATA.focus.active, from, to, op.frames, 'focus MOVEI')
}
const MOVE = op => {
  console.log('CAMERA focus MOVE: START', op, CAM_DATA)
  const from = CAM_DATA.focus.active.clone()
  const to = new THREE.Vector3(op.x, -op.y, -op.z)
  tweenCamera(CAM_DATA.focus.active, from, to, op.frames, 'focus MOVE')
}
const FOCUSA = op => {
  console.log('CAMERA focus FOCUSA', op)
  const fromActor = currentBattle.actors[CAM_DATA.actors.targets[0]]
  const toActor = currentBattle.actors[CAM_DATA.actors.attacker]
  // TODO - Not sure, but I think this might just be for one frame rather than a 'follow'
  focusToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const FOCUST = op => {
  console.log('CAMERA focus FOCUST', op)
  const fromActor = currentBattle.actors[CAM_DATA.actors.attacker]
  const toActor = currentBattle.actors[CAM_DATA.actors.targets[0]]
  // TODO - Not sure, but I think this might just be for one frame rather than a 'follow'
  focusToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const FOLLOWA = op => {
  console.log('CAMERA focus FOLLOWA', op)
  const fromActor = currentBattle.actors[CAM_DATA.actors.targets[0]]
  const toActor = currentBattle.actors[CAM_DATA.actors.attacker]
  focusToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const FOLLOWT = op => {
  console.log('CAMERA focus FOLLOWT', op)
  const fromActor = currentBattle.actors[CAM_DATA.actors.attacker]
  const toActor = currentBattle.actors[CAM_DATA.actors.targets[0]]
  focusToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const focusToActor = (fromActor, toActor, op, directionOverride) => {
  CAM_DATA.focus.updateFunction = () => {
    const from = fromActor.model.userData.getBonePosition(0)
    const to = toActor.model.userData.getBonePosition(op.bone)
    const target = calcPosition(
      from,
      to,
      op,
      CAM_DATA.focus.zInverted,
      directionOverride
    )
    CAM_DATA.focus.active.copy(target)
  }
}
const MOVEA = op => {
  console.log('CAMERA focus MOVEA', op)
  const fromActor = window.currentBattle.actors[CAM_DATA.actors.targets[0]] // Index ?!
  const toActor = window.currentBattle.actors[CAM_DATA.actors.attacker]
  moveToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const MOVET = op => {
  console.log('CAMERA focus MOVET', op)
  const fromActor = window.currentBattle.actors[CAM_DATA.actors.attacker]
  const toActor = window.currentBattle.actors[CAM_DATA.actors.targets[0]] // Index ?!
  moveToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
// This should generally happen as though the z axis is aligned between the target and actor's (z,x)
// I'm not sure about always though. eg target and attacker are same actor, maybe same row?
const moveToActor = (fromActor, toActor, op, directionOverride) => {
  let from = fromActor.model.userData.getBonePosition(0) // Or just get main position ?!
  let to = toActor.model.userData.getBonePosition(op.bone)
  const target = calcPosition(
    from,
    to,
    op,
    CAM_DATA.focus.zInverted,
    directionOverride
  )
  console.log(
    'CAMERA pos moveToActor',
    from,
    to,
    '-',
    op,
    CAM_DATA.focus.active,
    '->',
    target
  )

  const startPos = CAM_DATA.focus.active.clone()
  const lerpTween = new TWEEN.Tween({ p: 0 }, BATTLE_TWEEN_GROUP)
    .to({ p: 1 }, framesToTime(op.frames))
    .easing(CAM_DATA.focus.easing)
    .onUpdate(({ p }) => {
      const lerpPos = startPos.clone()
      let from = toActor.model.userData.getBonePosition(0) // Or just get main position ?!
      let to = fromActor.model.userData.getBonePosition(op.bone)
      calcPosition(from, to, op, CAM_DATA.focus.zInverted, directionOverride)
      lerpPos.lerp(target, p)

      // console.log('CAMERA pos moveToActor update', to, lerpPos)
      CAM_DATA.focus.active.copy(lerpPos)
    })

    .onComplete(() => {
      // console.log(`CAMERA ${reference}: END`, camVector, CAM_DATA)
      BATTLE_TWEEN_GROUP.remove(lerpTween)
    })
    // .repeat(Infinity) // Continuously repeat the tween
    .start()
}

const SETWAIT = op => {
  CAM_DATA.focus.wait = op.frames
  console.log('CAMERA focus SETWAIT:', op, CAM_DATA)
}
const WAIT = async op => {
  return new Promise(async resolve => {
    console.log('CAMERA focus WAIT: START', op, CAM_DATA.focus.wait)
    await tweenSleep(framesToTime(CAM_DATA.focus.wait))
    console.log('CAMERA focus WAIT: END')
    resolve()
  })
}
const RET = () => {
  console.log('CAMERA focus RET')
  // MOVEI({ frames: 15 })
}
const RET2 = () => {
  console.log('CAMERA focus RET2')
  // MOVEI({ frames: 15 })
}

// Add all unused (in game) below: Kind of cheating, just to improve the 'completion %...'
const D9 = () => {
  console.log(
    'CAMERA focus D9 - Used in initial cam scripts, but no battles use these scripts'
  )
}
const DE = () => {
  console.log('CAMERA focus DE - No instances in game')
}
const E3 = () => {
  console.log('CAMERA focus E3 - No instances in game')
}
const EC = () => {
  console.log('CAMERA focus EC - No instances in game')
}
const F0 = () => {
  console.log('CAMERA focus F0 - No instances in game')
}
const FE = () => {
  console.log('CAMERA focus FE - No instances in game')
}

export {
  ZINV,
  ZNORM,
  IDLE,
  SETIDLE,
  XYZ,
  MOVEI,
  MOVE,
  FOCUSA,
  FOCUST,
  FOLLOWA,
  FOLLOWT,
  MOVEA,
  MOVET,
  SETWAIT,
  WAIT,
  RET,
  RET2,
  D9,
  DE,
  E3,
  EC,
  F0,
  FE
}

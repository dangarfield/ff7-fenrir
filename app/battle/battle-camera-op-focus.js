import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import {
  CAM_DATA,
  framesToTime,
  getOrientedOpZ,
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

const SETIDLE = op => {
  // Note: It's used in cam data initial scripts, but no battle is using any of those scripts...
  console.log('CAMERA focus SETIDLE', op)
  setIdleCameraFocus(window.currentBattle, op.index)
}
const XYZ = op => {
  CAM_DATA.focus.active.set(op.x, -op.y, -op.z)
  console.log('CAMERA focus XYZ', op, CAM_DATA)
}

const MIDLE = op => {
  console.log('CAMERA focus MIDLE: START', op, CAM_DATA)
  const from = CAM_DATA.focus.active.clone()
  const to = CAM_DATA.idle.focus
  tweenCamera(CAM_DATA.focus.active, from, to, op.frames, 'focus MIDLE')
}
const MOVE = op => {
  console.log('CAMERA focus MOVE: START', op, CAM_DATA)
  const from = CAM_DATA.focus.active.clone()
  const to = new THREE.Vector3(op.x, -op.y, -op.z)
  tweenCamera(CAM_DATA.focus.active, from, to, op.frames, 'focus MOVE')
}
const FOCUSA = op => {
  console.log('CAMERA focus FOCUSA', op, CAM_DATA.actors.attacker)
  const orientedOpZ = getOrientedOpZ(op.z, CAM_DATA.focus.zInverted)
  CAM_DATA.focus.updateFunction = () => {
    const model = currentBattle.actors[CAM_DATA.actors.attacker].model
    const c = model.userData.getBonePosition(op.bone)
    const x = op.x === 0 ? c.x : op.x
    const y = op.y === 0 ? c.y : c.y + -op.y
    const z = op.z === 0 ? c.z : orientedOpZ

    // console.log('CAMERA focus FOCUSA updateFunction', x, y, z)
    CAM_DATA.focus.active.set(x, y, z)
  }
}
const MOVEA = op => {
  console.log('CAMERA focus MOVEA', op)
  const actor = window.currentBattle.actors[CAM_DATA.actors.attacker]
  moveToActor(actor, op)
}
const MOVET = op => {
  console.log('CAMERA focus MOVET', op)
  const actor = window.currentBattle.actors[CAM_DATA.actors.targets[0]]
  moveToActor(actor, op)
}
const moveToActor = (actor, op) => {
  let c = actor.model.userData.getBonePosition(op.bone)
  const orientedOpZ = getOrientedOpZ(op.z, CAM_DATA.focus.zInverted)
  const x = op.x === 0 ? c.x : c.x + op.x
  const y = op.y === 0 ? c.y : c.y + -op.y
  const z = op.z === 0 ? c.z : c.z + orientedOpZ
  const target = new THREE.Vector3(x, y, z)
  console.log('CAMERA focus moveToActor', op, c, target)

  const startPos = CAM_DATA.focus.active.clone()
  const lerpTween = new TWEEN.Tween({ p: 0 }, BATTLE_TWEEN_GROUP)
    .to({ p: 1 }, framesToTime(op.frames))
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ p }) => {
      c = actor.model.userData.getBonePosition(op.bone).clone()
      const lerpPos = startPos.clone()
      const x = op.x === 0 ? c.x : c.x + op.x
      const y = op.y === 0 ? c.y : c.y + -op.y
      const z = op.z === 0 ? c.z : c.z + orientedOpZ
      const to = new THREE.Vector3(x, y, z)
      // c.add(offset)
      // if (op.y !== 0) c.y = op.y
      // console.log('CAMERA focus moveToActor update', op.y, c.y)
      lerpPos.lerp(to, p)
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
  // MIDLE({ frames: 15 })
}
const RET2 = () => {
  console.log('CAMERA focus RET2')
  // MIDLE({ frames: 15 })
}

// Add all unused (in game) below: Kind of cheating, just to improve the 'completion %...'
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
  SETIDLE,
  XYZ,
  MIDLE,
  MOVE,
  FOCUSA,
  MOVEA,
  MOVET,
  SETWAIT,
  WAIT,
  RET,
  RET2,
  DE,
  E3,
  EC,
  F0,
  FE
}

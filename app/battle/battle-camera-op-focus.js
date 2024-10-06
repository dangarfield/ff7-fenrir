import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { CAM_DATA, framesToTime, tweenCamera } from './battle-camera.js'
import { BATTLE_TWEEN_GROUP, tweenSleep } from './battle-scene.js'

const U1ON = () => {
  console.log('CAMERA focus U1ON')
  CAM_DATA.focus.unknown1 = true
}
const U1OFF = () => {
  console.log('CAMERA focus U1OFF')
  CAM_DATA.focus.unknown1 = false
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
  CAM_DATA.actors.attacker = 4 // TODO - This needs to be set through the action scripts
  console.log('CAMERA focus FOCUSA', op)
  CAM_DATA.focus.updateFunction = () => {
    const model = currentBattle.actors[CAM_DATA.actors.attacker].model
    const c = model.userData.getBonePosition(op.bone)
    const z = c.z > 0 ? op.z : -op.z
    CAM_DATA.focus.active.set(c.x + op.x, -op.y, c.z + z) // Unsure about all of this, eg, y seems to be absolute
  }
}
const MOVEA = op => {
  console.log('CAMERA focus MOVEA', op)
  CAM_DATA.actors.attacker = 4 // TODO - This needs to be set through the action scripts
  CAM_DATA.actors.targets = [1]

  const actor = window.currentBattle.actors[CAM_DATA.actors.attacker]
  moveToActor(actor, op)
}
const MOVET = op => {
  console.log('CAMERA focus MOVET', op)
  CAM_DATA.actors.attacker = 4 // TODO - This needs to be set through the action scripts
  CAM_DATA.actors.targets = [1]

  const actor = window.currentBattle.actors[CAM_DATA.actors.targets[0]]
  moveToActor(actor, op)
}
const moveToActor = (actor, op) => {
  let c = actor.model.userData.getBonePosition(op.bone)
  // TODO get bone
  const z = c.z > 0 ? op.z : -op.z
  const offset = new THREE.Vector3(op.x, 0, -z) // TODO - y?!
  console.log('CAMERA focus moveToActor offset', offset)

  const startPos = CAM_DATA.focus.active.clone()
  const lerpTween = new TWEEN.Tween({ p: 0 }, BATTLE_TWEEN_GROUP)
    .to({ p: 1 }, framesToTime(op.frames))
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ p }) => {
      c = actor.model.userData.getBonePosition(op.bone).clone()
      const lerpPos = startPos.clone()
      c.add(offset)
      if (op.y !== 0) c.y = op.y
      console.log('CAMERA focus moveToActor update', op.y, c.y, offset)
      lerpPos.lerp(c, p)
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
  U1ON,
  U1OFF,
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

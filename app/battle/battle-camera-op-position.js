import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { CAM_DATA, framesToTime, tweenCamera } from './battle-camera.js'
import { BATTLE_TWEEN_GROUP, tweenSleep } from './battle-scene.js'

/*
  Find scripts with ops
data.battle.camData.initialScripts.filter(s => s.position.some(o => o.op === 'E6'))
data.battle.camData.initialScripts.map((s, i) => s.position.some(o => o.op === 'E6') ? i : -1).filter(i => i !== -1)
*/

const U1ON = () => {
  console.log('CAMERA pos U1ON')
  CAM_DATA.position.unknown1 = true
}
const U1OFF = () => {
  console.log('CAMERA pos U1OFF')
  CAM_DATA.position.unknown1 = false
}
const U2ON = () => {
  console.log('CAMERA pos U2ON')
  CAM_DATA.position.unknown2 = true
}
const U2OFF = () => {
  console.log('CAMERA pos U2OFF')
  CAM_DATA.position.unknown2 = false
}

const FLASH = () => {
  console.log('CAMERA pos FLASH')
  window.currentBattle.ui.flashPlane.userData.quickFlash()
}
const XYZ = op => {
  CAM_DATA.position.active.set(op.x, -op.y, -op.z)
  console.log('CAMERA pos XYZ', op, CAM_DATA)
}
const MIDLE = op => {
  console.log('CAMERA pos MIDLE: START', op, CAM_DATA)
  const from = CAM_DATA.position.active.clone()
  const to = CAM_DATA.idle.position
  tweenCamera(CAM_DATA.position.active, from, to, op.frames, 'pos MIDLE')
}
const MOVE = op => {
  console.log('CAMERA pos MOVE: START', op, CAM_DATA)
  const from = CAM_DATA.position.active.clone()
  const to = new THREE.Vector3(op.x, -op.y, -op.z)
  tweenCamera(CAM_DATA.position.active, from, to, op.frames, 'pos MOVE')
}
const FOCUSA = op => {
  CAM_DATA.actors.attacker = 4 // TODO - This needs to be set through the action scripts
  console.log('CAMERA pos FOCUSA', op)
  CAM_DATA.position.updateFunction = () => {
    const model = currentBattle.actors[CAM_DATA.actors.attacker].model
    const c = model.userData.getBonePosition(op.bone)
    // TODO - Ensure rotation is taken into account
    const z = c.z > 0 ? op.z : -op.z
    // console.log('CAMERA updateFunction', c)
    CAM_DATA.position.active.set(c.x + op.x, c.y + op.y + 300, c.z + z - 300) // TODO - 300 offset seems to work?!
  }
}
const MOVET = op => {
  console.log('CAMERA pos MOVET :START', op)
  CAM_DATA.actors.attacker = 4 // TODO - This needs to be set through the action scripts
  CAM_DATA.actors.targets = [1]

  const actor = window.currentBattle.actors[CAM_DATA.actors.targets[0]]
  let c = actor.model.userData.getBonePosition(op.bone)
  const z = c.z > 0 ? op.z : -op.z
  const offset = new THREE.Vector3(op.x, 0, -z) // TODO - y?!
  console.log('CAMERA pos MOVET offset', offset)

  const startPos = CAM_DATA.position.active.clone()
  const lerpTween = new TWEEN.Tween({ p: 0 }, BATTLE_TWEEN_GROUP)
    .to({ p: 1 }, framesToTime(op.frames)) // Duration of 1 second
    // .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ p }) => {
      c = actor.model.userData.getBonePosition(op.bone).clone()
      const lerpPos = startPos.clone()
      c.add(offset)
      lerpPos.lerp(c, p)
      CAM_DATA.position.active.copy(lerpPos)
    })
    .onComplete(() => {
      console.log('CAMERA pos MOVET :END')
      BATTLE_TWEEN_GROUP.remove(lerpTween)
    })
    .start()
}
const TRANS = op => {
  const actor = window.currentBattle.actors[CAM_DATA.actors.targets[0]]
  let c = actor.model.userData.getBonePosition(0)

  const startPos = CAM_DATA.position.active.clone()

  // args: { "op": "F8", "arg": -40, "arg2": 250, "arg3": 1985, "arg4": 15, "arg5": 0, "arg6": 35, "raw": "F8 D8 FF FA 00 C1 07 0F 00 00 00 23 00", "js": "opF8()" }
  // actor bone: x: 15, y: 591, z: -1674

  // start pos: 214, 591, -3000
  // end pos: 2243, 599, -5531

  // 1985 / Math.cos(40 * (Math.PI / 180))

  // const endPos = new THREE.Vector3(2243, 599, -5531)

  // op.angle = op.arg
  // op.x = op.arg3
  // op.frames = op.arg6

  let z = 1985 / Math.cos(40 * (Math.PI / 180))
  if (op.angle > 0) z = z * -1

  const endPos = new THREE.Vector3(
    startPos.x + op.x,
    startPos.y,
    startPos.z - z
  )

  console.log('CAMERA pos F8', op, c, '-', startPos, '->', endPos)
  const lerpTween = new TWEEN.Tween({ p: 0 }, BATTLE_TWEEN_GROUP)
    .to({ p: 1 }, framesToTime(op.frames))
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ p }) => {
      const lerpPos = startPos.clone()
      lerpPos.lerp(endPos, p)
      CAM_DATA.position.active.copy(lerpPos)
    })
    .onComplete(() => {
      BATTLE_TWEEN_GROUP.remove(lerpTween)
    })
    .start()
}
const SETWAIT = op => {
  CAM_DATA.position.wait = op.frames
  console.log('CAMERA pos SETWAIT:', op, CAM_DATA)
}
const WAIT = async op => {
  return new Promise(async resolve => {
    console.log('CAMERA pos WAIT: START', op, CAM_DATA.position.wait)
    const from = {}
    await tweenSleep(framesToTime(CAM_DATA.position.wait))
    console.log('CAMERA pos WAIT: END')
    resolve()
  })
}
const RET = () => {
  console.log('CAMERA pos RET')
  // MIDLE({ frames: 15 })
}
const RET2 = () => {
  console.log('CAMERA pos RET2')
  // MIDLE({ frames: 15 })
}

export {
  U1ON,
  U1OFF,
  U2ON,
  U2OFF,
  FLASH,
  XYZ,
  MIDLE,
  MOVE,
  FOCUSA,
  MOVET,
  TRANS,
  SETWAIT,
  WAIT,
  RET,
  RET2
}

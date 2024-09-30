import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { CAM_DATA, tweenCamera } from './battle-camera.js'
import { BATTLE_TWEEN_GROUP, tweenSleep } from './battle-scene.js'

const U1ON = () => {
  console.log('CAMERA pos U1ON')
  CAM_DATA.focus.unknown1 = true
}
const U1OFF = () => {
  console.log('CAMERA pos U1OFF')
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
  tweenCamera(CAM_DATA.focus.active, from, to, op.frames, 'pos MOVE')
}
const FOCUSA = op => {
  CAM_DATA.actors.attacker = 4 // TODO - This needs to be set through the action scripts
  console.log('CAMERA focus FOCUSA', op)
  CAM_DATA.focus.updateFunction = () => {
    const actor = currentBattle.actors[CAM_DATA.actors.attacker].model
    const c = actor.userData.centreBoneWorld // TODO, use op.bone to find the specific bone coord
    const z = c.z > 0 ? op.z : -op.z
    CAM_DATA.focus.active.set(c.x + op.x, -op.y, c.z + z) // Unsure about all of this, eg, y seems to be absolute
  }
}
const MOVEA = op => {
  console.log('CAMERA focus MOVEA', op)
  CAM_DATA.actors.attacker = 4 // TODO - This needs to be set through the action scripts
  CAM_DATA.actors.targets = [1]

  const actor = window.currentBattle.actors[CAM_DATA.actors.attacker]
  let c = actor.model.userData.centreBoneWorld
  // TODO get bone
  const z = c.z > 0 ? op.z : -op.z
  const offset = new THREE.Vector3(op.x, 0, -z) // TODO - y?!
  console.log('CAMERA focus MOVEA offset', offset)

  const lerpTween = new TWEEN.Tween({ p: 0 }, BATTLE_TWEEN_GROUP)
    .to({ p: 1 }, (1000 / 15) * op.frames) // Duration of 1 second
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ p }) => {
      c = actor.model.userData.centreBoneWorld.clone()
      const lerpPos = CAM_DATA.focus.active.clone()
      c.add(offset)
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
    await tweenSleep((CAM_DATA.focus.wait / 15) * 1000)
    console.log('CAMERA focus WAIT: END')
    resolve()
  })
}
const RET = () => {
  console.log('CAMERA focus RET')
  MIDLE({ frames: 15 })
}
const RET2 = () => {
  console.log('CAMERA focus RET2')
  MIDLE({ frames: 15 })
}
export {
  U1ON,
  U1OFF,
  XYZ,
  MIDLE,
  MOVE,
  FOCUSA,
  MOVEA,
  SETWAIT,
  WAIT,
  RET,
  RET2
}

import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import {
  calcPosition,
  CAM_DATA,
  framesToActualFrames,
  framesToTime,
  setDirectionOverride,
  setIdleCameraPosition,
  tweenCamera
} from './battle-camera.js'
import { BATTLE_TWEEN_GROUP, tweenSleep } from './battle-scene.js'

/*
  Find scripts with ops
data.battle.camData.initialScripts.filter(s => s.position.some(o => o.op === 'E6'))
data.battle.camData.initialScripts.map((s, i) => s.position.some(o => o.op === 'E6') ? i : -1).filter(i => i !== -1)

data.battle.camData.camdataFiles[0].scripts.main.filter(s => s.position.some(o => o.op === 'E6'))
data.battle.camData.camdataFiles[0].scripts.main.map((s, i) => s.position.some(o => o.op === 'E6') ? i : -1).filter(i => i !== -1)
MEMORY ADDRESSES
POS x: 00BF2158, y: 00BF215A, z: 00BF215C
TAR x: 00BE1130, y: 00BE1132, z: 00BE1134

*/

const ZINV = () => {
  CAM_DATA.position.zInverted = true
  console.log('CAMERA pos ZINV', CAM_DATA.position.zInverted)
}
const ZNORM = () => {
  console.log('CAMERA pos ZNORM')
  CAM_DATA.position.zInverted = false
}
const LINEAR = () => {
  console.log('CAMERA pos LINEAR')
  CAM_DATA.position.easing = TWEEN.Easing.Linear.None
}
const EASING = () => {
  console.log('CAMERA pos EASING')
  CAM_DATA.position.easing = TWEEN.Easing.Quadratic.InOut
}
const SETU3 = op => {
  console.log('CAMERA pos SETU3', op)
  // Unknown effect - Set on and then off 2 bytes in the sephiroth final battle. Unknown effect
  // In fenrir, the initial camera seems to 'work' without this, so I'll mark it as completed...
}
const IDLE = () => {
  console.log('CAMERA pos IDLE')
  CAM_DATA.position.active.copy(CAM_DATA.idle.position)
}
const SETIDLE = op => {
  // Note: It's used in cam data initial scripts, but no battle is using any of those scripts...
  console.log('CAMERA pos SETIDLE', op)
  setIdleCameraPosition(window.currentBattle, op.index)
}
const FLASH = () => {
  console.log('CAMERA pos FLASH')
  window.currentBattle.ui.flashPlane.userData.quickFlash()
}
const XYZ = op => {
  CAM_DATA.position.active.set(op.x, -op.y, -op.z)
  console.log('CAMERA pos XYZ', op, CAM_DATA)
}
const MOVEI = op => {
  console.log('CAMERA pos MOVEI: START', op, CAM_DATA)
  const from = CAM_DATA.position.active.clone()
  const to = CAM_DATA.idle.position
  tweenCamera(CAM_DATA.position.active, from, to, op.frames, 'pos MOVEI')
}
const MOVE = op => {
  console.log('CAMERA pos MOVE: START', op, CAM_DATA)
  const from = CAM_DATA.position.active.clone()
  const to = new THREE.Vector3(op.x, -op.y, -op.z)
  tweenCamera(CAM_DATA.position.active, from, to, op.frames, 'pos MOVE')
}
const FOCUSA = op => {
  console.log('CAMERA pos FOCUSA', op)
  const fromActor = currentBattle.actors[CAM_DATA.actors.targets[0]]
  const toActor = currentBattle.actors[CAM_DATA.actors.attacker]
  // TODO - Not sure, but I think this might just be for one frame rather than a 'follow'
  focusToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const FOCUST = op => {
  console.log('CAMERA pos FOCUST', op)
  const fromActor = currentBattle.actors[CAM_DATA.actors.attacker]
  const toActor = currentBattle.actors[CAM_DATA.actors.targets[0]]
  // TODO - Not sure, but I think this might just be for one frame rather than a 'follow'
  focusToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const FOLLOWA = op => {
  console.log('CAMERA pos FOLLOWA', op)
  const fromActor = currentBattle.actors[CAM_DATA.actors.targets[0]]
  const toActor = currentBattle.actors[CAM_DATA.actors.attacker]
  focusToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const FOLLOWT = op => {
  console.log('CAMERA pos FOLLOWT', op)
  const fromActor = currentBattle.actors[CAM_DATA.actors.attacker]
  const toActor = currentBattle.actors[CAM_DATA.actors.targets[0]]
  focusToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const focusToActor = (fromActor, toActor, op, directionOverride) => {
  CAM_DATA.position.updateFunction = () => {
    const from = fromActor.model.userData.getBonePosition(0)
    const to = toActor.model.userData.getBonePosition(op.bone)
    const target = calcPosition(
      from,
      to,
      op,
      CAM_DATA.position.zInverted,
      directionOverride
    )
    CAM_DATA.position.active.copy(target)
  }
}
const MOVEA = op => {
  console.log('CAMERA pos MOVEA', op)
  const fromActor = window.currentBattle.actors[CAM_DATA.actors.targets[0]] // Index ?!
  const toActor = window.currentBattle.actors[CAM_DATA.actors.attacker]
  moveToActor(fromActor, toActor, op, setDirectionOverride(fromActor, toActor))
}
const MOVET = op => {
  console.log('CAMERA pos MOVET', op)
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
    CAM_DATA.position.zInverted,
    directionOverride
  )
  console.log(
    'CAMERA pos moveToActor',
    from,
    to,
    '-',
    op,
    CAM_DATA.position.active,
    '->',
    target
  )

  const startPos = CAM_DATA.position.active.clone()
  const lerpTween = new TWEEN.Tween({ p: 0 }, BATTLE_TWEEN_GROUP)
    .to({ p: 1 }, framesToTime(op.frames))
    .easing(CAM_DATA.position.easing)
    .onUpdate(({ p }) => {
      const lerpPos = startPos.clone()
      let from = toActor.model.userData.getBonePosition(0) // Or just get main position ?!
      let to = fromActor.model.userData.getBonePosition(op.bone)
      calcPosition(from, to, op, CAM_DATA.position.zInverted, directionOverride)
      lerpPos.lerp(target, p)

      // console.log('CAMERA pos moveToActor update', to, lerpPos)
      CAM_DATA.position.active.copy(lerpPos)
    })

    .onComplete(() => {
      // console.log(`CAMERA ${reference}: END`, camVector, CAM_DATA)
      BATTLE_TWEEN_GROUP.remove(lerpTween)
    })
    // .repeat(Infinity) // Continuously repeat the tween
    .start()
}
const SPIRAL = op => {
  const gCos = Math.cos(((90 + op.growth) * Math.PI) / 180)
  const gSin = Math.sin(((90 + op.growth) * Math.PI) / 180)
  const zFac = op.zoom * -8

  // TODO - It appears as though some directions and 'durations of the spiral' don't exactly match the game
  // But, to be honest, I've had enough of it for the time being...

  const setInitialPos = () => {
    const x = Math.floor(
      0 +
        op.radius * 8 * Math.cos((op.rotation / 4096) * 360 * (Math.PI / 180)) +
        CAM_DATA.focus.active.x
    )
    const y = CAM_DATA.position.active.y
    const z = Math.floor(
      0 +
        op.radius * 8 * Math.sin((op.rotation / 4096) * 360 * (Math.PI / 180)) +
        -CAM_DATA.focus.active.z
    )
    console.log(
      'CAMERA pos SPIRAL setInitialPos',
      op,
      CAM_DATA.focus.active.clone(),
      CAM_DATA.position.active.clone(),
      '->',
      x,
      y,
      z
    )
    CAM_DATA.position.active.set(x, y, -z)
  }
  const calcNextPos = () => {
    console.log('CAMERA pos SPIRAL calcNextPos')
    const deltaX = CAM_DATA.focus.active.x - CAM_DATA.position.active.x
    const deltaZ = CAM_DATA.focus.active.z - CAM_DATA.position.active.z
    const mag = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ)
    const factor = zFac / mag
    return {
      x: CAM_DATA.position.active.x + (deltaX * gCos - deltaZ * gSin) * factor,
      y: CAM_DATA.position.active.y + op.yAdj, // TODO - check
      z: CAM_DATA.position.active.z + (deltaZ * gCos + deltaX * gSin) * factor
    }
  }

  // setInitialPos() // Do I really need to set this as XYZ alwasy proeceeds it?
  let posToSet = calcNextPos()
  console.log(
    'CAMERA pos SPIRAL initial',
    op,
    CAM_DATA.position.active,
    posToSet,
    framesToActualFrames(op.frames),
    framesToTime(op.frames)
  )
  // console.log('CAMERA pos SPIRAL theta', thetaStart, thetaEnd)
  // const focusStart = CAM_DATA.focus.active.clone()

  let currentFrame = 0
  const spiralTween = new TWEEN.Tween({ f: 0 }, BATTLE_TWEEN_GROUP)
    .to({ f: framesToActualFrames(op.frames) }, framesToTime(op.frames))
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ f }) => {
      const lerpDistance = Math.min(f - currentFrame, 1)
      const lerpPos = CAM_DATA.position.active.clone()
      lerpPos.lerp(posToSet, lerpDistance)
      // console.log(
      //   'CAMERA pos SPIRAL update',
      //   f,
      //   lerpDistance,
      //   '-',
      //   CAM_DATA.position.active,
      //   posToSet,
      //   '->',
      //   lerpPos
      // )
      // console.log('CAMERA pos SPIRAL update: ', t, posToSet, lerpPos)
      CAM_DATA.position.active.copy(lerpPos)

      if (f > currentFrame + 0.95) {
        posToSet = calcNextPos()
        currentFrame++
        // console.log(
        //   'CAMERA pos SPIRAL update next pos',
        //   posToSet,
        //   currentFrame,
        //   lerpDistance
        // )
      }
    })
    .onComplete(() => {
      BATTLE_TWEEN_GROUP.remove(spiralTween)
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
  // MOVEI({ frames: 15 })
}
const RET2 = () => {
  console.log('CAMERA pos RET2')
  // MOVEI({ frames: 15 })
}
// Add all unused (in game) below: Kind of cheating, just to improve the 'completion %...'
const D5 = () => {
  console.log('CAMERA pos D5 - No instances in game')
}
const D9 = () => {
  console.log(
    'CAMERA pos D9 - Used in initial cam scripts, but no battles use these scripts'
  )
}
const DE = () => {
  console.log('CAMERA pos DE - No instances in game')
}
const E0 = () => {
  // Frog Song - only in (149*3)+1 - Not sure what is does. Doesn't appear to do anything noticeable
  console.log('CAMERA pos E0 - No perceptible effect')
}
const E3 = () => {
  console.log('CAMERA pos E3 - No instances in game')
}
const E8 = () => {
  console.log('CAMERA pos E8 - No instances in game')
}
const E9 = () => {
  console.log('CAMERA pos E9 - No instances in game')
}
const EB = () => {
  console.log('CAMERA pos EB - No instances in game')
}
const EF = () => {
  console.log('CAMERA pos EF - No instances in game')
}
const F2 = () => {
  console.log('CAMERA pos F2 - No instances in game')
}
const F3 = () => {
  console.log('CAMERA pos F3 - No instances in game')
}
const FE = () => {
  console.log('CAMERA pos F3 - No instances in game')
}

export {
  ZINV,
  ZNORM,
  EASING,
  LINEAR,
  SETU3,
  IDLE,
  SETIDLE,
  FLASH,
  XYZ,
  MOVEI,
  MOVE,
  FOCUSA,
  FOCUST,
  FOLLOWA,
  FOLLOWT,
  MOVEA,
  MOVET,
  SPIRAL,
  SETWAIT,
  WAIT,
  RET,
  RET2,
  D5,
  D9,
  DE,
  E0,
  E3,
  E8,
  E9,
  EB,
  EF,
  F2,
  F3,
  FE
}

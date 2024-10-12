import TWEEN from '../../assets/tween.esm.js'
import { playSound } from '../media/media-sound.js'
import { ACTION_DATA, framesToTime } from './battle-actions.js'
import { tweenSleep } from './battle-scene.js'

const getTargetFocusPoint = () => {
  return BATTLE_ACTION_DATA.actors.targets[0].model.scene.position
}
const getTargetActor = () => {
  return BATTLE_ACTION_DATA.actors.targets[0]
}
const ROTF = () => {
  // Note: Being hurt seems to also have a turn effect too but I can't see it in the scripts
  // Maybe this op code also rotates the target(s) too?
  console.log(
    'ACTION ROTF: START',
    ACTION_DATA.actors.attacker.model.scene.rotation
  )
  ACTION_DATA.actors.attacker.model.scene.lookAt(getTargetFocusPoint())
  console.log(
    'ACTION ROTF: END',
    ACTION_DATA.actors.attacker.model.scene.rotation
  )
}

const ROTI = () => {
  console.log(
    'ACTION ROTI: START',
    ACTION_DATA.actors.attacker.model.scene.rotation
  )
  ACTION_DATA.actors.attacker.model.scene.rotation.y =
    ACTION_DATA.actors.attacker.model.userData.defaultRotationY
  console.log(
    'ACTION ROTI: END',
    ACTION_DATA.actors.attacker.model.scene.rotation
  )
}

const ANIM = async op => {
  await ACTION_DATA.actors.attacker.model.userData.playAnimationOnce(
    op.animation,
    { nextAnim: 0 }
  )
  //   await sleep(1000)
}
const SOUND = async op => {
  await tweenSleep(framesToTime(op.frames))
  playSound(op.sound)
}
const moveTowardsWithCollision = (pos1, pos2, radius1, radius2) => {
  const x1 = pos1.x
  const z1 = pos1.z
  const x2 = pos2.x
  const z2 = pos2.z

  const dx = x2 - x1
  const dz = z2 - z1
  const distance = Math.sqrt(dx * dx + dz * dz)
  const totalRadius = radius1 + radius2

  console.log(
    'ACTION moveTowardsWithCollision: ',
    distance,
    totalRadius,
    '-',
    dx,
    dz
  )
  if (distance > totalRadius) {
    const factor = (distance - totalRadius) / distance
    return { x: x1 + dx * factor, z: z1 + dz * factor }
  }

  return { x: x2, z: dz }
}

const MOVE = async op => {
  // TODO: Not sure what op.distance or op.steps is about. Both actors have collision radius
  const distance = op.distance // +- ?
  const attActor = ACTION_DATA.actors.attacker
  const attPos = attActor.model.scene.position
  const tarActor = getTargetActor()
  const tarPos = tarActor.model.scene.position
  const attCol = attActor.actionSequences.collisionRadius
  const tarCol = attActor.actionSequences.collisionRadius
  console.log('ACTION MOVE: ', attPos, tarPos, '-', attCol, tarCol, '-')
  const to = moveTowardsWithCollision(attPos, tarPos, attCol, tarCol)
  const time = framesToTime(op.steps)
  return new Promise(resolve => {
    const t = new TWEEN.Tween(
      ACTION_DATA.actors.attacker.model.scene.position,
      BATTLE_TWEEN_GROUP
    )
      .to(to, time)
      .onComplete(function () {
        BATTLE_TWEEN_GROUP.remove(t)
        resolve()
      })
      .start()
  })
}
const MOVI = () => {
  const p = ACTION_DATA.actors.attacker.model.userData.defaultPosition
  ACTION_DATA.actors.attacker.model.scene.position.set(p.x, p.y, p.z)
}
const HURT = async op => {
  await tweenSleep(framesToTime(op.frames))
  window.currentBattle.ui.flashPlane.userData.quickFlash()
}
export { ANIM, ROTF, ROTI, SOUND, MOVE, MOVI, HURT }

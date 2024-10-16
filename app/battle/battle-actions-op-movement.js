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

const ROTI = async () => {
  console.log(
    'ACTION ROTI: START',
    ACTION_DATA.actors.attacker.model.scene.rotation
  )
  //   ACTION_DATA.actors.attacker.model.scene.rotation.y =
  //     ACTION_DATA.actors.attacker.model.userData.defaultRotationY

  return new Promise(resolve => {
    const t = new TWEEN.Tween(
      ACTION_DATA.actors.attacker.model.scene.rotation,
      BATTLE_TWEEN_GROUP
    )
      .to(
        {
          y: 0 // ACTION_DATA.actors.attacker.model.userData.defaultRotationY
        },
        framesToTime(1)
      )
      .onComplete(function () {
        BATTLE_TWEEN_GROUP.remove(t)
        console.log(
          'ACTION ROTI: END',
          ACTION_DATA.actors.attacker.model.scene.rotation
        )
        resolve()
      })
      .start()
  })
}

const moveTowardsWithCollision = (pos1, pos2, radius1, radius2, opDistance) => {
  const x1 = pos1.x
  const z1 = pos1.z
  const x2 = pos2.x
  const z2 = pos2.z

  const dx = x2 - x1
  const dz = z2 - z1
  const distance = Math.sqrt(dx * dx + dz * dz)
  const totalRadius = radius1 + radius2 + opDistance

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
const ED = () => {
  // More than likely something to renote 'row'... I think E4 might be the opposite, but EB is there too, maybe EB is return to normal
  // eg: Take current animation position into account
  ACTION_DATA.attackerPosition.position =
    ACTION_DATA.actors.attacker.model.scene.children[0].position.clone()
  // TODO - Not actually sure what is required here, but it seems to mitigate the position changes somewhere...
}
const EB = () => {
  // TODO - Not actually sure what is required here, but it seems to mitigate the position changes somewhere...
}
const MOVE = async op => {
  const attActor = ACTION_DATA.actors.attacker
  const attPos = attActor.model.scene.position
  const tarActor = getTargetActor()
  const tarPos = tarActor.model.scene.position
  const attCol = attActor.actionSequences.collisionRadius
  const tarCol = tarActor.actionSequences.collisionRadius
  console.log('ACTION MOVE: ', attPos, tarPos, '-', attCol, tarCol, '-')
  const to = moveTowardsWithCollision(
    attPos,
    tarPos,
    attCol,
    tarCol,
    op.distance
  )
  const time = framesToTime(op.frames)
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
const MOVJ = async op => {
  const attActor = ACTION_DATA.actors.attacker
  const attPos = attActor.model.scene.position
  const tarActor = getTargetActor()
  const tarPos = tarActor.model.scene.position
  const attCol = attActor.actionSequences.collisionRadius
  const tarCol = tarActor.actionSequences.collisionRadius
  console.log('ACTION MOVJ: ', attPos, tarPos, '-', attCol, tarCol, '-')
  const to = moveTowardsWithCollision(
    attPos,
    tarPos,
    attCol,
    tarCol,
    op.distance
  )
  const time = framesToTime(op.frames)
  const initialY = ACTION_DATA.actors.attacker.model.scene.position.y
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
    const t2 = new TWEEN.Tween(
      ACTION_DATA.actors.attacker.model.scene.position,
      BATTLE_TWEEN_GROUP
    )
      .to({ y: [initialY + 800, initialY] }, time) // Guess at 800
      .interpolation(TWEEN.Interpolation.Bezier)
      .onComplete(function () {
        BATTLE_TWEEN_GROUP.remove(t2)
      })
      .start()
  })
}
const MOVI = () => {
  if (ACTION_DATA.attackerPosition.applied) {
    const attPos = ACTION_DATA.actors.attacker.model.scene.position
    const attDefPos = ACTION_DATA.actors.attacker.model.userData.defaultPosition
    attPos.x = attDefPos.x
    attPos.z = attDefPos.z
    ACTION_DATA.applied = false
    ACTION_DATA.attackerPosition.position = 0
  }

  const to = ACTION_DATA.actors.attacker.model.userData.defaultPosition
  const time = framesToTime(2) // ? is this fixed? based on the previous MOVE? Looks like paired anim is 0.2 seconds
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

    const t2 = new TWEEN.Tween(
      ACTION_DATA.actors.attacker.model.scene.children[0].position,
      BATTLE_TWEEN_GROUP
    )
      .to({ x: 0, z: 0 }, time)
      .onComplete(function () {
        BATTLE_TWEEN_GROUP.remove(t2)
        resolve()
      })
      .start()
  })
}
export { ROTF, ROTI, MOVJ, MOVE, MOVI, ED, EB }

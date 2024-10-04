import TWEEN from '../../assets/tween.esm.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'
import { tempSlow } from './battle-3d.js'
import { returnToIdle, runCameraScriptPair } from './battle-camera-op-loop.js'
import { sleep } from '../helpers/helpers.js'

const moveEntity = (model, from, to) => {
  // TODO - Rotation too?
  return new Promise(resolve => {
    const time = 500 * tempSlow
    const fromClone = { ...from }
    fromClone.z = fromClone.z - 600
    const toClone = { ...to }
    toClone.z = toClone.z + 1200

    // console.log('battle moveEntity', from, to, fromClone, toClone)
    new TWEEN.Tween(fromClone, BATTLE_TWEEN_GROUP)
      .to(toClone, time)
      .onUpdate(function () {
        // console.log('battle move', fromClone, to)
        model.scene.position.x = fromClone.x
        model.scene.position.z = fromClone.z
      })
      .onComplete(function () {
        // console.log('battle move complete', from)
        resolve()
      })
      .start()
  })
}

const placeholderBattleAttackSequence = async (
  fromEntityIndex,
  toEntityIndex,
  attackId
) => {
  const fromEntity = window.currentBattle.actors[fromEntityIndex]
  const toEntity = window.currentBattle.actors[toEntityIndex]
  window.currentBattle.ui.battleText.showBattleMessage(
    `${fromEntity.data.name}: ${
      window.currentBattle.attackData.find(a => a.id === attackId).name
    } -> ${toEntity.data.name}`
  )

  const scriptPair =
    window.data.battle.camData.camdataFiles[0].scripts.main[210]
  // const scriptPair =
  //   window.data.battle.camData.camdataFiles[0].scripts.victory[0]
  // const scriptPair =
  //   window.data.battle.camData.camdataFiles[0].scripts.main[0x5a * 3]

  // await Promise.all([
  //   fromEntity.model.userData.playAnimationOnce(9, { nextAnim: 0 }),
  //   runScriptPair(scriptPair)
  // ])
  // Move forward and get ready animation
  runCameraScriptPair(scriptPair, fromEntityIndex, [1], false)
  await fromEntity.model.userData.playAnimationOnce(6, { nextAnim: 7 })
  await fromEntity.model.userData.playAnimationOnce(7, { nextAnim: 9 })
  await fromEntity.model.userData.playAnimationOnce(9, { nextAnim: 0 })

  await sleep(2000)
  await returnToIdle()

  // await moveEntity(
  //   fromEntity.model,
  //   fromEntity.model.userData.defaultPosition,
  //   toEntity.model.userData.defaultPosition
  // )

  // Allow testing
  // for (let i = 0; i < 20; i++) {
  // Action animation
  // await Promise.all([
  // toEntity.model.userData.playAnimationOnce(14, { delay: 400, nextAnim: 0 }),
  // fromEntity.model.userData.playAnimationOnce(8)
  // fromEntity.model.userData.playAnimationOnce(9)
  // ])
  // }

  // fromEntity.model.scene.position.x =
  //   fromEntity.model.userData.defaultPosition.x
  // fromEntity.model.scene.position.z =
  //   fromEntity.model.userData.defaultPosition.z

  // await fromEntity.model.userData.playAnimationOnce(9, { nextAnim: 0 })
}
const placeholdePlayerAnimation = async actor => {
  await actor.model.userData.playAnimationOnce(9, { nextAnim: 0 })
}
const executePlayerAction = async (actor, queueItem) => {
  // const { actorIndex, type, commandId, attack, targetMask, priority } = queueItem
  const { commandId } = queueItem
  const command = window.data.kernel.commandData[commandId]
  const actionName = queueItem.attack ? queueItem.attack.name : command.name
  window.currentBattle.ui.battleText.showBattleMessage(
    `${actor.data.name} -> ${actionName} -> ${queueItem.targetMask.target
      .map(t => t.data.name)
      .join(' + ')}`
  )
  await placeholdePlayerAnimation(actor)
}

export { placeholderBattleAttackSequence, executePlayerAction }

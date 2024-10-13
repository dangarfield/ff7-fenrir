import TWEEN from '../../assets/tween.esm.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'
import { tempSlow } from './battle-3d.js'
import { returnToIdle, runCameraScriptPair } from './battle-camera-op-loop.js'
import { sleep } from '../helpers/helpers.js'
import { runActionSequence } from './battle-actions-op-loop.js'

const ACTION_DATA = {
  actors: {
    attacker: null,
    targets: []
  }
}
window.BATTLE_ACTION_DATA = ACTION_DATA

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

  // const scriptPair =
  //   window.data.battle.camData.camdataFiles[0].scripts.main[210 * 3] // Grunt - Beam Gun
  // const scriptPair =
  //   window.data.battle.camData.camdataFiles[0].scripts.victory[0] // Victory

  // window.data.battle.camData.camdataFiles[0].scripts.main[0x5a * 3].position = [
  //   ...window.data.battle.camData.camdataFiles[0].scripts.main[
  //     0x5a * 3
  //   ].position.slice(0, 9 - 1),
  //   window.data.battle.camData.camdataFiles[0].scripts.main[0x5a * 3].position[
  //     window.data.battle.camData.camdataFiles[0].scripts.main[0x5a * 3].position
  //       .length - 1
  //   ]
  // ]

  const scriptPair =
    window.data.battle.camData.camdataFiles[0].scripts.main[0x5a * 3] // Healing Wind

  // const scriptPair = data.battle.camData.camdataFiles[0].scripts.main[23 * 3] // Demi3 - z on target is reversed, meh...
  // const scriptPair = data.battle.camData.camdataFiles[0].scripts.main[27 * 3] // Flare - some rotation issues, meh...
  // const scriptPair = data.battle.camData.camdataFiles[0].scripts.main[9 * 3] // Quake - E4/E5, but both go to attacker?!
  // const scriptPair = data.battle.camData.camdataFiles[0].scripts.main[59 * 3] // Omnislash - unknown effect at the minute, d8 op code
  // const scriptPair = data.battle.camData.camdataFiles[1].scripts.main[22 * 3 + 1] // Bio3 - unknown effect at the minute, e8 op code seems like a parsing error though, backttack only
  // const scriptPair = data.battle.camData.camdataFiles[1].scripts.main[295 * 3] // Hell Combo - focus op EA - materia keeper, battle 595
  // const scriptPair = data.battle.camData.camdataFiles[0].scripts.main[212 * 3] // Tail Laser - focus op F8 - guard scorpion, battle 324
  // const scriptPair =
  //   data.battle.camData.camdataFiles[0].scripts.main[149 * 3 + 1] // Frog Song - op E0 - touch me, battle 116
  // const scriptPair =
  //   data.battle.camData.camdataFiles[0].scripts.main[145 * 3 + 1] // Bolt3 all - DF - any

  // Temporary grunt action animation
  await Promise.all([
    runCameraScriptPair(scriptPair, 2, [2], false),
    // runCameraScriptPair(scriptPair, 0, [4], false),
    (async () => {
      await fromEntity.model.userData.playAnimationOnce(6, { nextAnim: 7 })
      await fromEntity.model.userData.playAnimationOnce(7, { nextAnim: 9 })
      await fromEntity.model.userData.playAnimationOnce(9, { nextAnim: 0 })
    })()
  ])
  await sleep(1000)
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
const placeholderPlayerAnimation = async actor => {
  await actor.model.userData.playAnimationOnce(9, { nextAnim: 0 })
}
const getActionSequenceForCommand = (actor, queueItem) => {
  const sequenceFile = actor.modelCode.substring(0, 2) + 'ab'
  const scriptId = 4 // TODO - Just for testing now
  return window.data.battle.actionSequences[sequenceFile].scriptsPlayer[
    scriptId
  ]
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
  console.log(
    'battleQueue executePlayerAction',
    actor,
    queueItem,
    command,
    actionName
  )
  ACTION_DATA.actors.attacker = actor
  ACTION_DATA.actors.targets = queueItem.targetMask.target
  // await placeholderPlayerAnimation(actor)
  const actionSequence = getActionSequenceForCommand(actor, queueItem)
  // TODO - Get camera data and execute here in parallel
  await runActionSequence(actionSequence)
  // TODO - Play default 'idle' animation, eg 0 or whatever is appropriate for injured, dead, status afflicted etc
  ACTION_DATA.actors.attacker.model.userData.playAnimation(0)

  // FC                   setRotationToActors()
  // F0                   setDustEffect()
  // D8 00 1A 00          playSound({frames: 0, sound: 26})
  // 1A                   playAnimation({animation: 26})                      // This 'appears' to be sync
  // D1 B0 04 00 00 04    moveToTarget({distance: 1200, arg2: 0, frames: 4})  // has anim 27 first frame held
  // F0                   setDustEffect()
  // 1B                   playAnimation({animation: 27})                      // This appears to be first action halted, almost like it's waiting for the previous anim, but it holds the first frame until movement is finished
  // F7 01                executeAttack({frames: 1})
  // 1E                   playAnimation({animation: 30})
  // 1C                   playAnimation({animation: 28})                      // Return animation, but appears to be async
  // FA                   returnToIdlePosition()
  // F0                   setDustEffect()
  // 1D                   playAnimation({animation: 29})
  // E5                   rotateBackToIdleDirection()
  // EE                   return()
}
const framesToTime = frames => {
  return (1000 / 15) * frames
}

export {
  placeholderBattleAttackSequence,
  executePlayerAction,
  framesToTime,
  ACTION_DATA
}

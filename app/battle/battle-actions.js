import TWEEN from '../../assets/tween.esm.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'
import { tempSlow } from './battle-3d.js'
import { returnToIdle, runCameraScriptPair } from './battle-camera-op-loop.js'
import { sleep } from '../helpers/helpers.js'
import { runActionSequence } from './battle-actions-op-loop.js'
import { currentBattle } from './battle-setup.js'
import { loadSound } from '../media/media-sound.js'

const ACTION_DATA = {
  actors: {
    attacker: null,
    targets: []
  },
  attackerPosition: {
    position: 0,
    applied: false
  },
  attack: null,
  actionName: null,
  command: null,
  wait: 0
}
window.BATTLE_ACTION_DATA = ACTION_DATA
const resetActionData = (attacker, queueItem, command) => {
  ACTION_DATA.actors.attacker = attacker
  ACTION_DATA.actors.targets = queueItem.targetMask.target
  ACTION_DATA.command = command
  ACTION_DATA.attackerPosition.position = 0
  ACTION_DATA.attackerPosition.applied = false
  ACTION_DATA.attack = queueItem.attack
  ACTION_DATA.actionName = getActionName(command, queueItem)
}
const getActionName = (command, queueItem) => {
  const actionName = queueItem.attack ? queueItem.attack.name : command.name
  return actionName
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
const getActionSequenceForCommand = (actor, queueItem) => {
  const scriptId = 4 // TODO - Just for testing now
  return actor.actionSequences.scriptsPlayer[scriptId]
}
const executePlayerAction = async (actor, queueItem) => {
  const { commandId } = queueItem
  const command = window.data.kernel.commandData[commandId]

  resetActionData(actor, queueItem, command)
  console.log(
    'battleQueue executePlayerAction',
    actor,
    queueItem,
    command,
    ACTION_DATA.actionName
  )
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
const preLoadBattleSounds = async () => {
  // Intentionally don't load async, so that it's faster to load the scene

  const soundsLoaded = []

  for (const actor of window.currentBattle.actors) {
    if (actor.actionSequences) {
      for (const scriptType of ['scriptsPlayer', 'scriptsEnemy']) {
        for (const seq of actor.actionSequences[scriptType]) {
          for (const op of seq) {
            if (op.op === 'SOUND' && !soundsLoaded.includes(op.sound)) {
              console.log('LOAD BATTLE SOUNDS', op)
              soundsLoaded.push(op.sound)
              loadSound(op.sound)
            }
          }
        }
      }
    }
  }

  // TODO - It appears as though EFFEXE (EC) also has these hardcoded. So should be part loadEffect LOAD (E8)

  console.log('LOAD BATTLE SOUNDS soundsLoaded', soundsLoaded)
}

export {
  placeholderBattleAttackSequence,
  executePlayerAction,
  framesToTime,
  ACTION_DATA,
  preLoadBattleSounds
}

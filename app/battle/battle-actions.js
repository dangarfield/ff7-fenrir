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
  wait: 0,
  damage: null,
  previousPlayerQueueItem: null
}
window.BATTLE_ACTION_DATA = ACTION_DATA
const resetActionData = (attacker, targets, attack, command) => {
  ACTION_DATA.actors.attacker = attacker
  ACTION_DATA.actors.targets = targets
  ACTION_DATA.command = command
  ACTION_DATA.attackerPosition.position = 0
  ACTION_DATA.attackerPosition.applied = false
  ACTION_DATA.attack = attack
  ACTION_DATA.actionName = getActionName(command, attack)
  ACTION_DATA.damage = null
}
const getActionName = (command, attack) => {
  const actionName = attack ? attack.name : command.name
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
  //   fromEntity.model.userData.dbaefaultPosition.z

  // await fromEntity.model.userData.playAnimationOnce(9, { nextAnim: 0 })
}
const getActionSequenceForCommand = (actor, queueItem) => {
  // TODO - The action-sequence-metadata-player.json is all wrong for the script types. Go and find the correct ones
  console.log(
    'getActionSequenceForCommand',
    actor,
    queueItem,
    window.data.battle.actionSequenceMetadataPlayer
  )
  let actionSequence
  try {
    const actionSequencesMetadata =
      window.data.battle.actionSequenceMetadataPlayer.find(
        c => c.commandId === queueItem.commandId
      )?.actionSequences
    if (actionSequencesMetadata) {
      if (actionSequencesMetadata.length === 1) {
        actionSequence =
          actor.actionSequences.scripts[actionSequencesMetadata[0].id]
      } else {
        // is front / back row
        if (queueItem.commandId === 18) {
          // Change
          if (actor.data.status.battleOrder === 'Normal') {
            // TODO - Need to make sure that this data is updated during / after the action sequence...
            actionSequence =
              actor.actionSequences.scripts[
                actionSequencesMetadata.find(a => a.target === 'back').id
              ]
          } else {
            actionSequence =
              actor.actionSequences.scripts[
                actionSequencesMetadata.find(a => a.target === 'front').id
              ]
          }
        } else {
          if (queueItem.targetMask.target.length > 1) {
            actionSequence =
              actor.actionSequences.scripts[
                actionSequencesMetadata.find(a => a.target === 'multiple').id
              ]
          } else {
            actionSequence =
              actor.actionSequences.scripts[
                actionSequencesMetadata.find(a => a.target === 'single').id
              ]
          }
        }
        // is multi / single target
      }
    }
  } catch (error) {
    console.error(
      'getActionSequenceForCommand ERROR FETCHING SEQUENCE - commandId',
      queueItem.commandId
    )
  }
  if (!actionSequence) {
    console.error('getActionSequenceForCommand UNKNOWN ACTION SEQUENCE')
    actionSequence = actor.actionSequences.scripts[20]
  }
  // const scriptId = 4 // TODO - Just for testing now
  // return actor.actionSequences.scriptsPlayer[scriptId]
  console.log('getActionSequenceForCommand actionSequence', actionSequence)
  return actionSequence // Catch all
}
const executeEnemyAction = async (actor, attackId, attackModifier) => {
  console.log('executeEnemyAction', actor, attackId, attackModifier)
  const attackIndex = window.currentBattle.attackData.findIndex(
    a => a.id === attackId
  )
  const attack = window.currentBattle.attackData[attackIndex]
  const targets = [window.currentBattle.actors[0]] // TODO - Get target mask from stack - Looks like variable 2070
  const command = { name: 'Enemy Attack' }
  console.log('executeEnemyAction queueItem', targets, attack, command)
  const actionSequenceIndex = actor.data.actionSequenceIndex[attackIndex]
  const actionSequence = actor.actionSequences.scripts[actionSequenceIndex]
  console.log('executeEnemyAction actionSequence', actionSequence)

  // TODO - Check for magic power?
  resetActionData(actor, targets, attack, command)
  console.log('executeEnemyAction resetActionData', ACTION_DATA)
  // TODO - Decrement MP / item count etc
  // TODO - Get camera data and execute here in parallel
  await runActionSequence(actionSequence)
  // TODO - Play default 'idle' animation, eg 0 or whatever is appropriate for injured, dead, status afflicted etc
  ACTION_DATA.actors.attacker.model.userData.playAnimation(0)
}
const executePlayerAction = async (actor, queueItem) => {
  // TODO: Comands to ensure 'flow' properly
  //  Change - Actually change the row
  //  Limit - Lookup the correct action sequence
  //  2x Cut & 4x Cut - Ensure multiple sequences are queued and run
  //  W-Item - Need to fix, should be one queueItem in order to work with mime, or at least, need to make it work
  //  W-Magic
  //  W-Summon
  // TODO - Ensure idle animation/sequence is correctly set
  // TODO - Script to run for unable to execute action (eg, no mp, item, no previous mime)
  // TODO - Added effect materia - quadra magic specifically

  if (queueItem.commandId === 12) {
    console.log('executePlayerAction - MIME')
    if (ACTION_DATA.previousPlayerQueueItem === null) {
      console.log('executePlayerAction - MIME - No previous action available')
      // TODO - Display 'X made a useless imitation' animation action
      return
    }
    queueItem = ACTION_DATA.previousPlayerQueueItem
    // queueItem.actorIndex = ?? Do I need to set this properly?
    if (queueItem.attack.type && queueItem.attack.type === 'WEAPON') {
      queueItem.attack.type =
        window.data.kernel.allItemData[actor.data.equip.weapon.itemId]
      // TODO - Seems wrong, as the target flags might change, investigate
    }
  }

  let command = JSON.parse(
    JSON.stringify(window.data.kernel.commandData[queueItem.commandId])
  )

  console.log(
    'executePlayerAction - resetActionData',
    queueItem.targetMask.target,
    queueItem.attack,
    command
  )
  ACTION_DATA.previousPlayerQueueItem = queueItem
  resetActionData(actor, queueItem.targetMask.target, queueItem.attack, command)
  console.log(
    'executePlayerAction',
    actor,
    queueItem,
    command,
    ACTION_DATA.actionName
  )
  if (queueItem.commandId === 19) {
    console.log('executePlayerAction - DEFEND')
    actor.data.status.defend = true // Reset on player atb is full. Need to reset at end of battle too
    return
  }

  // TODO - Check for MP / item count / money etc

  const actionSequence = getActionSequenceForCommand(actor, queueItem)
  // TODO - Decrement MP / item count / money / all usage / summon usage etc
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

  const add = id => {
    if (!soundsLoaded.includes(id)) {
      soundsLoaded.push(id)
      loadSound(id)
    }
  }

  for (const actor of window.currentBattle.actors.filter(a => a.active)) {
    if (actor.actionSequences) {
      for (const seq of actor.actionSequences.scripts) {
        for (const op of seq) {
          if (op.op === 'SOUND') {
            // console.log('LOAD BATTLE SOUNDS', op)
            add(op.sound)
          }
        }
      }
    }
    // Current weapon sounds, all attacks sounds
    if (actor.type === 'player') {
      const weaponData =
        window.data.kernel.allItemData[actor.data.equip.weapon.itemId]
      add(weaponData.impactSoundHit)
      add(weaponData.impactSoundCritical)
      add(weaponData.impactSoundMiss)
    }
  }
  for (const attack of window.currentBattle.attackData.filter(
    a => a.impactSound !== 0xffff
  )) {
    add(attack.impactSound)
  }

  // TODO - It appears as though EFFEXE (EC) also has these hardcoded. So should be part loadEffect LOAD (E8)

  console.log('LOAD BATTLE SOUNDS soundsLoaded', soundsLoaded)
}

export {
  placeholderBattleAttackSequence,
  executeEnemyAction,
  executePlayerAction,
  framesToTime,
  ACTION_DATA,
  preLoadBattleSounds
}

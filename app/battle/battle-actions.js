import TWEEN from '../../assets/tween.esm.js'
import { BATTLE_TWEEN_GROUP, tweenSleep } from './battle-scene.js'
import { tempSlow } from './battle-3d.js'
import {
  getCameraScriptPair,
  returnCameraToIdle,
  runCameraScriptPair
} from './battle-camera-op-loop.js'
import { sleep } from '../helpers/helpers.js'
import { runActionSequence } from './battle-actions-op-loop.js'
import { currentBattle } from './battle-setup.js'
import { loadSound } from '../media/media-sound.js'
import { battleFormationConfig } from './battle-formation.js'

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
  previousPlayerQueueItem: null,
  previousPlayerIndex: null,
  previousQueueItem: null
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

const runUnableToExecuteActionSequence = async (actor, message) => {
  ACTION_DATA.actors.attacker = actor
  // Note: This is not using the [16] action sequence that I think the game does
  await runActionSequence([
    { op: 'ANIM', animation: 3 },
    { op: 'ED' },
    { op: 'MSG', message }, // Not a real op
    { op: 'ANIM', animation: 4 },
    { op: 'MOVI' },
    { op: 'ROTI' },
    { op: 'RET' }
  ])
}
const getActionSequenceForCommand = (actor, queueItem) => {
  console.log(
    'getActionSequenceForCommand',
    actor,
    queueItem,
    window.data.battle.actionSequenceMetadataPlayer
  )

  let actionSequence

  try {
    // Limit break
    if (queueItem.commandId === 20) {
      return actor.actionSequences.scripts[queueItem.attack.actionSequenceIndex]
    }

    const actionSequencesMetadata =
      window.data.battle.actionSequenceMetadataPlayer.find(
        c => c.commandId === queueItem.commandId
      )?.actionSequences

    if (!actionSequencesMetadata) {
      throw new Error('No action sequence metadata found')
    }

    if (actionSequencesMetadata.length === 1) {
      return actor.actionSequences.scripts[actionSequencesMetadata[0].id]
    }

    // Handle front / back row
    if (queueItem.commandId === 18) {
      const target =
        actor.data.status.battleOrder === 'Normal' ? 'back' : 'front'
      return actor.actionSequences.scripts[
        actionSequencesMetadata.find(a => a.target === target).id
      ]
    }

    // Handle multi / single target
    const target =
      queueItem.targetMask.target.length > 1 ? 'multiple' : 'single'
    return actor.actionSequences.scripts[
      actionSequencesMetadata.find(a => a.target === target).id
    ]
  } catch (error) {
    console.error(
      'getActionSequenceForCommand ERROR FETCHING SEQUENCE - commandId',
      queueItem.commandId,
      error
    )
  }

  // Fallback if no valid action sequence found
  console.error('getActionSequenceForCommand UNKNOWN ACTION SEQUENCE')
  actionSequence = actor.actionSequences.scripts[20]

  console.log('getActionSequenceForCommand actionSequence', actionSequence)
  return actionSequence
}
const executeEnemyAction = async (actor, attackId, attackModifier, targets) => {
  console.log('executeEnemyAction', actor, attackId, attackModifier, targets)
  const attackIndex = window.currentBattle.attackData.findIndex(
    a => a.id === attackId
  )
  const attack = window.currentBattle.attackData[attackIndex]
  // const targets = [window.currentBattle.actors[0]] // TODO - Get target mask from stack - Looks like variable 2070
  const command = { name: 'Enemy Attack' }
  console.log('executeEnemyAction queueItem', targets, attack, command)
  const actionSequenceIndex = actor.data.actionSequenceIndex[attackIndex]
  const actionSequence = actor.actionSequences.scripts[actionSequenceIndex]
  console.log('executeEnemyAction actionSequence', actionSequence)

  // TODO - Check for magic power?
  resetActionData(actor, targets, attack, command)
  console.log('executeEnemyAction resetActionData', ACTION_DATA)
  // TODO - Decrement MP / item count etc - No, this happens at action selection confirmed / add to queue

  await Promise.all([
    runCameraScriptPair(
      getCameraScriptPair(
        window.currentBattle,
        command,
        attack,
        targets.length > 1
      ),
      actor.index,
      targets.map(t => t.index),
      false
    ),
    runActionSequence(actionSequence)
  ])
  console.log('executeEnemyAction END')
  returnCameraToIdle()
  ACTION_DATA.previousQueueItem = {
    // Not sure that I need this
    actorIndex: 0,
    attack,
    commandId: 0x23 //?
  }
}
const cannotExecuteAction = (actor, command, attack) => {
  console.log('cannotExecuteAction', actor, command, attack)
  // TODO - If status is applied, death?
  if (attack.mpCost && attack.mpCost > actor.battleStats.mp.current) {
    return window.data.kernel.battleText[91] // Not enough MP!
  }
  return false
}
const executePlayerAction = async (actor, queueItem) => {
  // TODO: Comands to ensure 'flow' properly
  //  Limit - Mostly scheduled, but it runs horribly, async / sync, need to implement more op codes
  //  2x Cut & 4x Cut - Ensure multiple sequences are queued and run
  //  W-Item - Need to fix, should be one queueItem in order to work with mime, or at least, need to make it work
  //  W-Magic
  //  W-Summon
  //  Frog ?!
  // TODO - Ensure idle animation/sequence is correctly set
  // TODO - Added effect materia - quadra magic specifically
  // TODO - Implement the rest of the op codes
  // TODO - Hurt animations

  console.log('executePlayerAction', actor, queueItem)
  if (queueItem.commandId === 12) {
    console.log('executePlayerAction - MIME')
    if (ACTION_DATA.previousPlayerQueueItem === null) {
      console.log('executePlayerAction - MIME - No previous action available')
      await runUnableToExecuteActionSequence(
        actor,
        window.data.kernel.battleText[88].replace('{TARGET}', actor.data.name)
      )
      return
    }
    // TODO - Is a limit break from a different player. Is this the only use case?
    // TODO - Need to implement limit break action sequences and then test this
    if (
      ACTION_DATA.previousPlayerQueueItem.commandId === 19 &&
      actor.index !== ACTION_DATA.previousPlayerIndex
    ) {
      console.log('executePlayerAction - MIME - No previous action available')
      await runUnableToExecuteActionSequence(
        actor,
        window.data.kernel.battleText[87]
          .replace('{TARGET}', actor.data.name)
          .replace('{ATTACK}', ACTION_DATA.previousPlayerQueueItem.attack.name)
      )
      return
    }
    queueItem = ACTION_DATA.previousPlayerQueueItem
    // queueItem.actorIndex = ?? Do I need to set this properly?
    if (queueItem.attack.data.type && queueItem.attack.data.type === 'WEAPON') {
      queueItem.attack.data.type =
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
  resetActionData(actor, queueItem.targetMask.target, queueItem.attack, command)
  const actionSequence = getActionSequenceForCommand(actor, queueItem)
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

  if (queueItem.commandId === 18) {
    console.log('executePlayerAction - CHANGE')
    // Set default position so that it gets updated in the script sequence
    if (actor.data.status.battleOrder === 'Normal') {
      actor.data.status.battleOrder = 'BackRow'
      actor.model.userData.defaultPosition.z =
        actor.model.userData.defaultPosition.z +
        (actor.model.userData.defaultPosition.z > 0
          ? battleFormationConfig.row
          : -battleFormationConfig.row)
    } else {
      actor.data.status.battleOrder = 'Normal'
      actor.model.userData.defaultPosition.z =
        actor.model.userData.defaultPosition.z +
        (actor.model.userData.defaultPosition.z > 0
          ? -battleFormationConfig.row
          : battleFormationConfig.row)
    }
  }
  // Check for MP / summon power?! - Item, throw, coin is already decremented
  const cannotExecuteMessage = cannotExecuteAction(
    actor,
    command,
    queueItem.attack
  )
  if (cannotExecuteMessage) {
    // TODO - I'm not sure this is right? Does the 'charge' happen first before the check?
    await runUnableToExecuteActionSequence(actor, cannotExecuteMessage)
    return
  }

  // TODO - Decrement MP / money / all usage / summon usage etc, quadra magic etc, I think any added effect that has a 'count' can be reduced
  // No, this happens at action selection confirmed / add to queue

  await Promise.all([
    runCameraScriptPair(
      getCameraScriptPair(
        window.currentBattle,
        command,
        queueItem.attack.data,
        queueItem.targetMask.target.length > 1
      ),
      actor.index,
      queueItem.targetMask.target.map(t => t.index),
      false
    ),
    runActionSequence(actionSequence)
  ])

  console.log('executePlayerAction END')
  returnCameraToIdle()

  ACTION_DATA.previousPlayerQueueItem = queueItem
  ACTION_DATA.previousPlayerIndex = actor.index
  ACTION_DATA.previousQueueItem = queueItem
  // TODO - Increment any counters, eg limit usage. Anything else?
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

  // TODO - It appears as though EXEEFF (EC) & EXEITEM also has these hardcoded. So should be part loadEffect LOAD (E8)

  console.log('LOAD BATTLE SOUNDS soundsLoaded', soundsLoaded)
}

export {
  executeEnemyAction,
  executePlayerAction,
  framesToTime,
  ACTION_DATA,
  preLoadBattleSounds
}

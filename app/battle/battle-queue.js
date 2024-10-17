import { executePlayerAction } from './battle-actions.js'
import { executeScript } from './battle-stack.js'
import { resetTurnTimer } from './battle-timers.js'

const initBattleQueue = currentBattle => {
  currentBattle.queue = {
    current: null,
    actions: [],
    activeSelectionPlayers: []
  }
}

const allowPlayerToSelectAction = actorIndex => {
  console.log(
    'battleQueue allowPlayerToSelectAction: START',
    actorIndex,
    window.currentBattle.queue.actions,
    window.currentBattle.queue.activeSelectionPlayers
  )
  delete window.currentBattle.actors[actorIndex].data.status.defend
  if (!window.currentBattle.queue.activeSelectionPlayers.includes(actorIndex)) {
    window.currentBattle.queue.activeSelectionPlayers.push(actorIndex)
    console.log('battleQueue allowPlayerToSelectAction', actorIndex)
    promoteAvailablePlayerToSelectAction(actorIndex)
  }
  console.log(
    'battleQueue allowPlayerToSelectAction: END',
    actorIndex,
    window.currentBattle.queue.actions,
    window.currentBattle.queue.activeSelectionPlayers
  )
}
const promoteAvailablePlayerToSelectAction = async actorIndex => {
  console.log(
    'battleQueue promoteAvailablePlayerToSelectAction: START',
    actorIndex,
    window.currentBattle.queue.actions,
    window.currentBattle.queue.activeSelectionPlayers
  )
  if (window.currentBattle.queue.activeSelectionPlayers.length > 0) {
    const nextActorIndex = window.currentBattle.queue.activeSelectionPlayers[0]
    if (actorIndex === undefined) {
      // When actorIndex is undefined, it will promote the first actor
      await window.currentBattle.actors[
        window.currentBattle.queue.activeSelectionPlayers[0]
      ].ui.makeActiveSelectionPlayer()
    } else if (actorIndex === nextActorIndex) {
      // When actorIndex is set, it will only promote if they are the first actor
      await window.currentBattle.actors[
        actorIndex
      ].ui.makeActiveSelectionPlayer()
    }
  }
  console.log(
    'battleQueue promoteAvailablePlayerToSelectAction: END',
    window.currentBattle.queue.actions,
    window.currentBattle.queue.activeSelectionPlayers
  )
}
const removeActivePlayerFromSelectionList = async () => {
  console.log('battleQueue removeActivePlayerFromSelectionList')
  const current = window.currentBattle.queue.activeSelectionPlayers.shift()
  await window.currentBattle.actors[current].ui.removeActiveSelectionPlayer()
}
// const doNotAllowPlayerToSelectAction = actorIndex => {
//   console.log(
//     'battleQueue doNotAllowPlayerToSelectAction: START',
//     actorIndex,
//     window.currentBattle.queue.actions,
//     window.currentBattle.queue.activeSelectionPlayer,
//     window.currentBattle.queue.activeSelectionPlayers
//   )
//   if (window.currentBattle.queue.activeSelectionPlayer === actorIndex)
//     window.currentBattle.queue.activeSelectionPlayer = null
//   const index =
//     window.currentBattle.queue.activeSelectionPlayers.indexOf(actorIndex)
//   if (index !== -1) {
//     window.currentBattle.queue.activeSelectionPlayers.splice(index, 1)
//     console.log('battleQueue doNotAllowPlayerToSelectAction', actorIndex)
//   }
//   console.log(
//     'battleQueue doNotAllowPlayerToSelectAction: END',
//     actorIndex,
//     window.currentBattle.queue.actions,
//     window.currentBattle.queue.activeSelectionPlayer,
//     window.currentBattle.queue.activeSelectionPlayers
//   )
//   promoteAvailablePlayerToSelectAction()
// }
const addPlayerActionToQueue = async (
  actorIndex,
  commandId,
  attack,
  targetMask,
  priority,
  dontProcess
) => {
  console.log(
    'battleQueue addPlayerActionToQueue',
    actorIndex,
    commandId,
    attack,
    targetMask,
    priority,
    dontProcess
  )
  window.currentBattle.queue.actions.push({
    actorIndex,
    type: 'playerAction',
    commandId,
    attack,
    targetMask,
    priority
  }) // TODO - Priority - https://wiki.ffrtt.ru/index.php/FF7/Battle/Battle_Mechanics#Queued_Actions
  if (dontProcess) return // Eg, for multi queued items, such a w-magic, w-summon etc
  await removeActivePlayerFromSelectionList()
  await promoteAvailablePlayerToSelectAction()
  processQueue()
}
const addScriptActionToQueue = actorIndex => {
  console.log('battleQueue addScriptActionToQueue', actorIndex) // Priority ?
  window.currentBattle.queue.actions.push({ actorIndex, type: 'script' }) // TODO - Priority ?!
  processQueue()
}
const processQueue = async () => {
  const queue = window.currentBattle.queue
  if (queue.current === null && queue.actions.length > 0) {
    queue.current = queue.actions.shift()
    const actorIndex = queue.current.actorIndex
    const actor = window.currentBattle.actors[actorIndex]
    if (queue.current.type === 'script') {
      // Execute script
      console.log('battleQueue enemy action: START', actor)
      await executeScript(actorIndex, actor.script.main.script)
      console.log('battleQueue enemy action: END', actor)
      currentHasEnded()
      resetTurnTimer(actorIndex)
    } else if (queue.current.type === 'playerAction') {
      console.log('battleQueue player action: START', actor, queue.current)
      await executePlayerAction(actor, queue.current)
      console.log('battleQueue player action: END', actor)
      currentHasEnded()
      resetTurnTimer(actorIndex)
    }
  }
  // TODO - When the battle is finished, the item actions that were not completed are added back into the inventory
  // TODO - When the battle is finished, the gil were not completed are added back into the inventory
}

const cycleActiveSelectionPlayer = async () => {
  console.log(
    'battleQueue cycleActiveSelectionPlayer: START',
    window.currentBattle.queue.actions,
    window.currentBattle.queue.activeSelectionPlayers
  )
  if (window.currentBattle.queue.activeSelectionPlayers.length === 0) return

  const current = window.currentBattle.queue.activeSelectionPlayers.shift()
  window.currentBattle.queue.activeSelectionPlayers.push(current)
  const next = window.currentBattle.queue.activeSelectionPlayers[0]
  await window.currentBattle.actors[current].ui.removeActiveSelectionPlayer()
  await window.currentBattle.actors[next].ui.makeActiveSelectionPlayer()
  console.log('battleQueue cycleActiveSelectionPlayer', current, next)
  console.log(
    'battleQueue cycleActiveSelectionPlayer: END',
    window.currentBattle.queue.actions,
    window.currentBattle.queue.activeSelectionPlayers
  )
}
const currentHasEnded = () => {
  window.currentBattle.queue.current = null
  processQueue()
}
export {
  initBattleQueue,
  allowPlayerToSelectAction,
  addPlayerActionToQueue,
  addScriptActionToQueue,
  currentHasEnded,
  cycleActiveSelectionPlayer
}

import { executePlayerAction } from './battle-actions.js'
import { executeScript } from './battle-stack.js'
import { resetTurnTimer } from './battle-timers.js'

const initBattleQueue = currentBattle => {
  currentBattle.queue = {
    current: null,
    actions: [],
    activeSelectionPlayer: null,
    activeSelectionPlayers: []
  }
}

const allowPlayerToSelectAction = actorIndex => {
  if (!window.currentBattle.queue.activeSelectionPlayers.includes(actorIndex)) {
    window.currentBattle.queue.activeSelectionPlayers.push(actorIndex)
    console.log('battleQueue allowPlayerToSelectAction', actorIndex)
    promoteAvailablePlayerToSelectAction()
  }
}
const promoteAvailablePlayerToSelectAction = () => {
  if (
    window.currentBattle.queue.activeSelectionPlayer === null &&
    window.currentBattle.queue.activeSelectionPlayers.length > 0
  ) {
    const actorIndex = window.currentBattle.queue.activeSelectionPlayers[0]
    window.currentBattle.queue.activeSelectionPlayer = actorIndex
    window.currentBattle.actors[actorIndex].ui.makeActiveSelectionPlayer()
  }
}
const doNotAllowPlayerToSelectAction = actorIndex => {
  if (window.currentBattle.queue.activeSelectionPlayer === actorIndex)
    window.currentBattle.queue.activeSelectionPlayer = null
  const index =
    window.currentBattle.queue.activeSelectionPlayers.indexOf(actorIndex)
  if (index !== -1) {
    window.currentBattle.queue.activeSelectionPlayers.splice(index, 1)
    console.log('battleQueue doNotAllowPlayerToSelectAction', actorIndex)
  }
  promoteAvailablePlayerToSelectAction()
}
const addPlayerActionToQueue = (
  actorIndex,
  commandId,
  attack,
  targetMask,
  priority
) => {
  console.log(
    'battleQueue addPlayerActionToQueue',
    actorIndex,
    commandId,
    attack,
    targetMask,
    priority
  )
  window.currentBattle.queue.actions.push({
    actorIndex,
    type: 'playerAction',
    commandId,
    attack,
    targetMask,
    priority
  }) // TODO - Priority - https://wiki.ffrtt.ru/index.php/FF7/Battle/Battle_Mechanics#Queued_Actions
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
}

const cycleActiveSelectionPlayer = async () => {
  if (window.currentBattle.queue.activeSelectionPlayer === null) return
  const doubleList = [
    ...window.currentBattle.queue.activeSelectionPlayers,
    ...window.currentBattle.queue.activeSelectionPlayers
  ]
  const current = window.currentBattle.queue.activeSelectionPlayer
  const next =
    doubleList[
      doubleList.findIndex(
        a => a === window.currentBattle.queue.activeSelectionPlayer
      ) + 1
    ]
  await window.currentBattle.actors[current].ui.removeActiveSelectionPlayer()
  await window.currentBattle.actors[next].ui.makeActiveSelectionPlayer()
  window.currentBattle.queue.activeSelectionPlayer = next
  console.log(
    'battleQueue cycleActiveSelectionPlayer',
    doubleList,
    current,
    next
  )
}
const currentHasEnded = () => {
  window.currentBattle.queue.current = null
  processQueue()
}
export {
  initBattleQueue,
  allowPlayerToSelectAction,
  doNotAllowPlayerToSelectAction,
  addPlayerActionToQueue,
  addScriptActionToQueue,
  currentHasEnded,
  cycleActiveSelectionPlayer
}

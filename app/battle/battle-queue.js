import { executeScript } from './battle-stack.js'

const initBattleQueue = (currentBattle) => {
  currentBattle.queue = {
    current: null,
    queue: [],
    activeSelectionPlayers: [] // Should probably set this on the player actor itself
  }
}

const allowPlayerToSelectAction = (actorIndex) => {
  if (!window.currentBattle.queue.activeSelectionPlayers.includes[actorIndex]) {
    window.currentBattle.queue.activeSelectionPlayers.push(actorIndex)
    console.log('battleQueue allowPlayerToSelectAction', actorIndex)
  }
}
const doNotAllowPlayerToSelectAction = (actorIndex) => {
  const index = window.currentBattle.queue.activeSelectionPlayers.indexOf(actorIndex)
  if (index !== -1) {
    window.currentBattle.queue.activeSelectionPlayers.splice(index, 1)
    console.log('battleQueue doNotAllowPlayerToSelectAction', actorIndex)
  }
}
const addPlayerActionToQueue = (actorIndex, action, priority) => {
  // TODO
  console.log('battleQueue addPlayerActionToQueue', actorIndex, action, priority)
//   window.currentBattle.queue.queue.push({ actorIndex, type: 'playerAction' }) // TODO - Priority ?!
}
const addScriptActionToQueue = (actorIndex) => {
  console.log('battleQueue addScriptActionToQueue', actorIndex) // Priority ?
  window.currentBattle.queue.queue.push({ actorIndex, type: 'script' }) // TODO - Priority ?!
  processQueue()
}
const processQueue = () => {
  const queue = window.currentBattle.queue
  if (queue.current === null && queue.queue.length > 0) {
    queue.current = queue.queue.shift()
    if (queue.current.type === 'script') {
      // Execute script
      executeScript(queue.current.actorIndex, window.currentBattle.actors[queue.current.actorIndex].script.main.script)
    } else if (queue.current.type === 'playerAction') {
      // TODO: Execute player action
    }
  }
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
  currentHasEnded
}

// import { tweenSleep } from './battle-scene.js'
import { currentHasEnded } from './battle-queue.js'
import { resetTurnTimer } from './battle-timers.js'
import * as stackOps from './battle-stack-ops.js'

const executeOp = async (op) => {
  return stackOps[op.op](op)
}
const executeScript = async (actorIndex, script) => {
  stackOps.setCurrentActorIndex(actorIndex)
  stackOps.resetStack()
  let exit = false
  let currentScriptPosition = 0
  while (!exit) {
    const op = script[currentScriptPosition]
    const result = await executeOp(op)
    stackOps.logStack()
    stackOps.logMemory()
    if (result.exit) exit = true
    if (result.next) {
      currentScriptPosition = script.findIndex(o => o.index === result.next)
    } else {
      currentScriptPosition++
    }
    // await tweenSleep(1000)
  }
  for (const op of script) {
    console.log('battle stack queue', 'op', op)
  }
  currentHasEnded()
  resetTurnTimer(actorIndex)
}

// TODO - Not sure, it looks as though this is done before every action, rather than once before all actions
const executeAllPreActionSetupScripts = async (currentBattle) => {
  for (const actor of currentBattle.actors.filter(a => a.type === 'player')) {
    if (actor.script && actor.script.preActionSetup && actor.script.preActionSetup.count > 0) {
      executeScript(actor.index, actor.script.preActionSetup.script)
    }
  }
  for (const actor of currentBattle.actors.filter(a => a.type === 'enemy')) {
    if (actor.script && actor.script.preActionSetup && actor.script.preActionSetup.count > 0) {
      executeScript(actor.index, actor.script.preActionSetup.script)
    }
  }
  for (const actor of currentBattle.actors.filter(a => a.type === 'formation')) { // ?!?! Not sure yet
    if (actor.script && actor.script.preActionSetup && actor.script.preActionSetup.count > 0) {
      executeScript(actor.index, actor.script.preActionSetup.script)
    }
  }
}
export { executeScript, executeAllPreActionSetupScripts }

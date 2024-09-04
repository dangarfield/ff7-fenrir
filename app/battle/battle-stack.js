import { sleep } from '../helpers/helpers.js'
import * as stackOps from './battle-stack-ops.js'

const executeScript = async (actorIndex, script) => {
  const stack = [] // Each invocation gets it's own stack instance
  let exit = false
  let currentScriptPosition = 0
  while (!exit) {
    const op = script[currentScriptPosition]
    console.log('battleStack op', op, actorIndex, script)
    const result = await stackOps[op.op](stack, op, actorIndex)
    stackOps.logStack(stack)
    stackOps.logMemory()
    console.log('battleStack result', result)
    if (result.exit) exit = true
    if (result.next) {
      currentScriptPosition = script.findIndex(o => o.index === result.next)
    } else {
      currentScriptPosition++
    }
    await sleep(50) // Just add this for walking through
  }
  for (const op of script) {
    console.log('battleStack queue', 'op', op)
  }
}

const executeAllInitScripts = async currentBattle => {
  for (const actor of currentBattle.actors.filter(a => a.type === 'player')) {
    if (actor.script && actor.script.init && actor.script.init.count > 0) {
      console.log('battleStack init: START', actor)
      await executeScript(actor.index, actor.script.init.script)
      console.log('battleStack init: END', actor)
    }
  }
  for (const actor of currentBattle.actors.filter(a => a.type === 'enemy')) {
    if (actor.script && actor.script.init && actor.script.init.count > 0) {
      console.log('battleStack init: START', actor)
      await executeScript(actor.index, actor.script.init.script)
      console.log('battleStack init: END', actor)
    }
  }
  for (const actor of currentBattle.actors.filter(
    a => a.type === 'formation'
  )) {
    // ?!?! Not sure yet
    if (actor.script && actor.script.init && actor.script.init.count > 0) {
      console.log('battleStack init: START', actor)
      await executeScript(actor.index, actor.script.init.script)
      console.log('battleStack init: END', actor)
    }
  }
}

const executeAllPreActionSetupScripts = async () => {
  for (const actor of window.currentBattle.actors) {
    // Any order?!
    if (
      actor.script &&
      actor.script.preActionSetup &&
      actor.script.preActionSetup.count > 0
    ) {
      console.log('battleStack preActionSetup: START', actor)
      await executeScript(actor.index, actor.script.preActionSetup.script)
      console.log('battleStack preActionSetup: END', actor)
    }
  }
}

export { executeScript, executeAllInitScripts, executeAllPreActionSetupScripts }

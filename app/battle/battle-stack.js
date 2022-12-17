import { initTestBattleSequence } from './battle-actions.js'
import { tweenSleep } from './battle-scene.js'
import * as stackOps from './battle-stack-ops.js'

const executeOp = async (op) => {
  return stackOps[op.op](op)
}
const walkThroughEnemy1StackExample = async () => {
  const script = window.currentBattle.scene.enemyScript1.main.script
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
    await tweenSleep(1000)
  }
  for (const op of script) {
    console.log('battle stack queue', 'op', op)
  }
}
const initBattleStackForActor = async (index) => {
  stackOps.setCurrentActorIndex(0)
  stackOps.resetStack()
  await walkThroughEnemy1StackExample()
  await initTestBattleSequence()
}

export { initBattleStackForActor }

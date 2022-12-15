import { initTestBattleSequence } from './battle-actions.js'
import { tweenSleep } from './battle-scene.js'
import * as stackOps from './battle-stack-ops.js'

const executeOp = async (op) => {
  if (op.op === 'PUSH') { await stackOps.PUSH(op) }
  if (op.op === 'PSHA') { await stackOps.PSHA(op) }

  if (op.op === 'RBYT') { await stackOps.RBYT(op) }
}
const walkThroughEnemy1StackExample = async () => {
  const script = window.currentBattle.scene.enemyScript1.main.script
  for (const op of script) {
    console.log('battle stack queue', 'op', op)
    await executeOp(op)
    await tweenSleep(1000)
  }
}
const initBattleStack = async () => {
  stackOps.resetStack()
  await walkThroughEnemy1StackExample()
  // await initTestBattleSequence()
}

export { initBattleStack }

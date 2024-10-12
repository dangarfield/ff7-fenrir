import { ACTION_DATA } from './battle-actions.js'
import * as actions from './battle-actions-op-actions.js'
import { loadSound } from '../media/media-sound.js'

const executeOp = async op => {
  console.log('ACTION execute op: START', op)
  switch (op.op) {
    case 'ROTF': // FC
      actions.ROTF()
      break
    case 'ROTI':
      actions.ROTI()
      break
    case 'ANIM':
      await actions.ANIM(op)
      break
    case 'SOUND':
      actions.SOUND(op)
      break
    case 'MOVE':
      await actions.MOVE(op)
      break
    case 'MOVI':
      actions.MOVI()
      break
    case 'HURT':
      actions.HURT(op)
      break
    default:
      //   window.alert(
      //     `--------- CAMERA POSITION OP: ${op.op} - NOT YET IMPLEMENTED ---------`
      //   )
      break
  }
  console.log('ACTION execute op: END')
}

const runActionSequence = async sequence => {
  console.log('ACTION runActionSequence: START', sequence, ACTION_DATA)
  // TODO - Preload anything that needs to be loaded, sounds, assets etc
  loadSound(26)
  for (const op of sequence) {
    await executeOp(op) // TODO, if op.op === RET
    if (op.op === 'RET' || op.op === 'RET2') {
      break
    }
  }
  console.log('ACTION runActionSequence: END')
}
export { runActionSequence }

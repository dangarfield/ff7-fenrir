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
      await actions.ROTI()
      break
    case 'ANIM':
      await actions.ANIM(op)
      break
    case 'SOUND':
      actions.SOUND(op)
      break
    case 'MOVE':
      actions.MOVE(op)
      break
    case 'MOVI':
      await actions.MOVI()
      break
    case 'HURT':
      actions.HURT(op)
      break
    case 'ATT':
      actions.ATT(op)
      break
    case 'ED':
      actions.ED()
      break
    case 'EB':
      actions.EB()
      break
    case 'SETWAIT':
      actions.SETWAIT(op)
      break
    case 'WAIT':
      await actions.WAIT()
      break
    case 'NAME':
      actions.NAME()
      break
    case 'RET':
      actions.RET()
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

  // Add next anim so we can 'hold' it - NOPE, NOT IT!
  // for (let i = sequence.length - 1; i >= 0; i--) {
  //   if (sequence[i].op === 'ANIM') {
  //     for (let j = i - 1; j >= 0; j--) {
  //       if (sequence[j].op === 'ANIM') {
  //         sequence[j].hold = sequence[i].animation
  //         break
  //       }
  //     }
  //   }
  // }

  // Anims are sync apart from if MOVI is after it?! Looks ok ?!
  for (let i = sequence.length - 1; i >= 0; i--) {
    if (sequence[i].op === 'MOVI') {
      for (let j = i - 1; j >= 0; j--) {
        if (sequence[j].op === 'ANIM') {
          sequence[j].async = true
          break
        }
      }
    }
  }

  for (const op of sequence) {
    await executeOp(op)
    if (op.op === 'RET') {
      break
    }
  }
  console.log('ACTION runActionSequence: END')
}
export { runActionSequence }

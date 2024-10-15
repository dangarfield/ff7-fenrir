import { ACTION_DATA } from './battle-actions.js'
import * as actions from './battle-actions-op-actions.js'
import * as movement from './battle-actions-op-movement.js'
import * as control from './battle-actions-op-control.js'
import { loadSound } from '../media/media-sound.js'

// https://wiki.ffrtt.ru/index.php?title=FF7/Battle/Battle_Animation/Animation_Script

const executeOp = async op => {
  console.log('ACTION execute op: START', op)
  switch (op.op) {
    case 'ROTF': // FC
      movement.ROTF()
      break
    case 'ROTI':
      movement.ROTI()
      break
    case 'ANIM':
      await control.ANIM(op)
      break
    case 'SOUND':
      actions.SOUND(op)
      break
    case 'MOVJ':
      movement.MOVJ(op)
      break
    case 'MOVE':
      movement.MOVE(op)
      break
    case 'MOVI':
      await movement.MOVI()
      break
    case 'HURT':
      actions.HURT(op)
      break
    case 'ATT':
      actions.ATT(op)
      break
    case 'ED':
      movement.ED()
      break
    case 'EB':
      movement.EB()
      break
    case 'SETWAIT':
      control.SETWAIT(op)
      break
    case 'WAIT':
      await control.WAIT()
      break
    case 'NAME':
      control.NAME()
      break
    case 'RET':
      control.RET()
      break
    case 'DUST':
      actions.DUST()
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

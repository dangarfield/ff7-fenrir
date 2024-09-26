import * as pos from './battle-camera-op-position.js'
import * as target from './battle-camera-op-target.js'

// https://forums.qhimm.com/index.php?topic=9126.msg124233#msg124233
// https://github.com/q-gears/q-gears-reversing-data/blob/master/reversing/ffvii/ffvii_battle/camera/camera_script_export_start.lua

const executePositionOp = async op => {
  //   console.log('CAMERA executePositionOp', op)
  switch (op.op) {
    case 'MOVA': // E2
      pos.MOVA(op)
      break
    case 'XYZ': // F9
      pos.XYZ(op)
      break
    case 'WAIT': // F4
      await pos.WAIT(op)
      break
    case 'SETWAIT': // F5
      pos.SETWAIT(op)
      break
    case 'RET': // FF
      pos.RET()
      break

    default:
      //   window.alert(
      //     `--------- CAMERA POSITION OP: ${op.op} - NOT YET IMPLEMENTED ---------`
      //   )
      break
  }
}

const executeTargetOp = async op => {
  //   console.log('CAMERA executeTargetOp', op)
  switch (op.op) {
    case 'MOVA': // E2
      target.MOVA(op)
      break
    case 'XYZ': // FA
      target.XYZ(op)
      break
    case 'WAIT': // F4
      await target.WAIT(op)
      break
    case 'SETWAIT': // F5
      target.SETWAIT(op)
      break
    case 'RET': // FF
      target.RET()
      break

    default:
      //   window.alert(
      //     `--------- CAMERA TARGET OP: ${op.op} - NOT YET IMPLEMENTED ---------`
      //   )
      break
  }
}
const executeScript = async (script, method) => {
  for (const op of script) {
    await method(op)
  }
}
const runScriptPair = async scriptPair => {
  // Note: start with a simple script execution, rather than a queue with cancellables etc

  console.log('CAMERA runScriptPair: START')
  await Promise.all([
    executeScript(scriptPair.position, executePositionOp)
    // executeScript(scriptPair.target, executeTargetOp)
  ])
  console.log('CAMERA runScriptPair: END')
}

export { runScriptPair }

import * as pos from './battle-camera-op-position.js'
import * as target from './battle-camera-op-target.js'

// https://forums.qhimm.com/index.php?topic=9126.msg124233#msg124233
// https://github.com/q-gears/q-gears-reversing-data/blob/master/reversing/ffvii/ffvii_battle/camera/camera_script_export_start.lua

const executePositionOp = async op => {
  //   console.log('CAMERA executePositionOp', op)
  switch (op.op) {
    case 'U2OFF': // DA
      pos.U2OFF()
      break
    case 'U2ON': // DB
      pos.U2ON()
      break
    case 'U1ON': // DC
      pos.U1ON()
      break
    case 'U1OFF': // F1
      pos.U1OFF()
      break
    case 'U2OFF': // DA
      pos.U2OFF()
      break
    case 'FLASH': // D6
      pos.FLASH()
      break
    case 'MIDLE': // E2
      pos.MIDLE(op)
      break
    case 'MOVE': // E6
      pos.MOVE(op)
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
    case 'RET2': // 00 - Should never be called really
      pos.RET2()
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
    case 'U1OFF': // DB
      target.U1OFF()
      break
    case 'U1ON': // DC
      target.U1ON()
      break
    case 'MIDLE': // E2
      target.MIDLE(op)
      break
    case 'MOVE': // E6
      target.MOVE(op)
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
    case 'RET2': // 00 - Should never be called really
      target.RET2()
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
    executeScript(scriptPair.position, executePositionOp),
    executeScript(scriptPair.target, executeTargetOp)
  ])
  console.log('CAMERA runScriptPair: END')
}

export { runScriptPair }

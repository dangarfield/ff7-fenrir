import * as pos from './battle-camera-op-position.js'
import * as focus from './battle-camera-op-focus.js'
import {
  clearUpdateFunctionPosition,
  clearUpdateFunctionFocus
} from './battle-camera.js'

// https://forums.qhimm.com/index.php?topic=9126.msg124233#msg124233
// https://github.com/q-gears/q-gears-reversing-data/blob/master/reversing/ffvii/ffvii_battle/camera/camera_script_export_start.lua

// TODO: Validate whether -+ z based on orientation of actors
// TODO: Investigate and solve the 'facing each other', eg, turn slightly and apply along the adjusted axis of alignment

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
      clearUpdateFunctionPosition()
      pos.MIDLE(op)
      break
    case 'MOVET':
      clearUpdateFunctionPosition()
      pos.MOVET(op)
      break
    case 'MOVE': // E6
      clearUpdateFunctionPosition()
      pos.MOVE(op)
    case 'FOCUSA': // F0
      clearUpdateFunctionPosition()
      pos.FOCUSA(op)
      break
    case 'XYZ': // F9
      clearUpdateFunctionPosition()
      pos.XYZ(op)
      break
    case 'WAIT': // F4
      await pos.WAIT(op)
      break
    case 'SETWAIT': // F5
      pos.SETWAIT(op)
      break
    case 'TRANS': // F8
      pos.TRANS(op)
      break
    case 'RET': // FF
      clearUpdateFunctionPosition()
      pos.RET()
      break
    case 'RET2': // 00 - Should never be called really
      clearUpdateFunctionPosition()
      pos.RET2()
      break

    default:
      clearUpdateFunctionPosition()
      //   window.alert(
      //     `--------- CAMERA POSITION OP: ${op.op} - NOT YET IMPLEMENTED ---------`
      //   )
      break
  }
}

const executeFocusOp = async op => {
  //   console.log('CAMERA executeFocusOp', op)
  switch (op.op) {
    case 'U1OFF': // DB
      focus.U1OFF()
      break
    case 'U1ON': // DC
      focus.U1ON()
      break
    case 'MIDLE': // E2
      clearUpdateFunctionFocus()
      focus.MIDLE(op)
      break
    case 'MOVEA': // E4
      clearUpdateFunctionFocus()
      focus.MOVEA(op)
      break
    case 'MOVET': // E5
      clearUpdateFunctionFocus()
      focus.MOVET(op)
      break
    case 'MOVE': // E6
      clearUpdateFunctionFocus()
      focus.MOVE(op)
      break
    case 'XYZ': // FA
      clearUpdateFunctionFocus()
      focus.XYZ(op)
      break
    case 'WAIT': // F4
      await focus.WAIT(op)
      break
    case 'SETWAIT': // F5
      focus.SETWAIT(op)
      break
    case 'FOCUSA': // F0
      clearUpdateFunctionFocus()
      focus.FOCUSA(op)
      break
    case 'RET': // FF
      clearUpdateFunctionFocus()
      focus.RET()
      break
    case 'RET2': // 00 - Should really never be called, just added to solve parsing
      clearUpdateFunctionFocus()
      focus.RET2()
      break
    default:
      clearUpdateFunctionFocus()
      //   window.alert(
      //     `--------- CAMERA FOCUS OP: ${op.op} - NOT YET IMPLEMENTED ---------`
      //   )
      break
  }
}
const executeScript = async (script, method) => {
  for (const op of script) {
    await method(op)
  }
}
const runCameraScriptPair = async scriptPair => {
  // Note: start with a simple script execution, rather than a queue with cancellables etc

  console.log('CAMERA runScriptPair: START')
  await Promise.all([
    executeScript(scriptPair.position, executePositionOp),
    executeScript(scriptPair.focus, executeFocusOp)
  ])
  console.log('CAMERA runScriptPair: END')
}
const returnToIdle = async () => {
  await Promise.all([pos.MIDLE({ frames: 15 }), focus.MIDLE({ frames: 15 })])
}

export { runCameraScriptPair, returnToIdle }

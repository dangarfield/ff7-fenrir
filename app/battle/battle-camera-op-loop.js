import * as pos from './battle-camera-op-position.js'
import * as focus from './battle-camera-op-focus.js'
import {
  clearUpdateFunctionPosition,
  clearUpdateFunctionFocus,
  setActorsForBattleCamera,
  setBattleCameraSpeed
} from './battle-camera.js'

// https://forums.qhimm.com/index.php?topic=9126.msg124233#msg124233
// https://github.com/q-gears/q-gears-reversing-data/blob/master/reversing/ffvii/ffvii_battle/camera/camera_script_export_start.lua

// TODO: Validate whether -+ z based on orientation of actors
// TODO: Investigate and solve the 'facing each other', eg, turn slightly and apply along the adjusted axis of alignment

const executePositionOp = async op => {
  console.log('CAMERA executePositionOp', op, op.op)
  switch (op.op) {
    case 'EASING': // DA
      pos.EASING()
      break
    case 'LINEAR': // DB
      pos.LINEAR()
      break
    case 'ZINV': // DC
      pos.ZINV()
      break
    case 'SETIDLE': // DD
      pos.SETIDLE(op)
      break
    case 'ZNORM': // F1
      pos.ZNORM()
      break
    case 'FLASH': // D6
      pos.FLASH()
      break
    case 'SETU3': // D7
      pos.SETU3(op)
      break
    case 'MIDLE': // E2
      clearUpdateFunctionPosition()
      pos.MIDLE(op)
      break
    case 'MOVEA': // E4
      clearUpdateFunctionPosition()
      pos.MOVEA(op)
      break
    case 'MOVET': // E5
      clearUpdateFunctionPosition()
      pos.MOVET(op)
      break
    case 'MOVE': // E6
      clearUpdateFunctionPosition()
      pos.MOVE(op)
      break
    case 'FOLLOWA': // E7
      clearUpdateFunctionPosition()
      pos.FOLLOWA(op)
      break
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
    case 'SPIRAL': // F8
      clearUpdateFunctionPosition()
      pos.SPIRAL(op)
      break
    case 'RET': // FF
      clearUpdateFunctionPosition()
      pos.RET()
      break
    case 'RET2': // 00 - Should never be called really
      clearUpdateFunctionPosition()
      pos.RET2()
      break

    case 'D5': // D5
      pos.D5()
      break
    case 'DE': // DE
      pos.DE()
      break
    case 'E3': // E3
      pos.E3()
      break
    case 'E9': // E9
      pos.E9()
      break
    case 'EB': // EB
      pos.EB()
      break
    case 'EF': // EF
      pos.EF()
      break
    case 'F2': // F2
      pos.F2()
      break
    case 'F3': // F3
      pos.F3()
      break
    case 'FE': // FE
      pos.FE()
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
    case 'ZINV': // DB
      focus.ZINV()
      break
    case 'ZNORM': // DC
      focus.ZNORM()
      break
    case 'SETIDLE': // DD
      focus.SETIDLE(op)
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
    case 'FOLLOWA': // E8
      clearUpdateFunctionPosition()
      focus.FOLLOWA(op)
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

    case 'DE': // DE
      pos.DE()
      break
    case 'E3': // E3
      pos.E3()
      break
    case 'EC': // EC
      pos.EC()
      break
    case 'F0': // F0
      pos.F0()
      break
    case 'FE': // FE
      pos.FE()
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
const runCameraScriptPair = async (
  scriptPair,
  attacker,
  targets,
  isAMainScript
) => {
  // Note: start with a simple script execution, rather than a queue with cancellables etc

  console.log(
    'CAMERA runScriptPair: START',
    scriptPair,
    attacker,
    targets,
    isAMainScript
  )
  setActorsForBattleCamera(attacker, targets)
  setBattleCameraSpeed(isAMainScript)
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

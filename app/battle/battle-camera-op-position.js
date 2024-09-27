import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { CAM_DATA, tweenCamera } from './battle-camera.js'
import { BATTLE_TWEEN_GROUP, tweenSleep } from './battle-scene.js'

/*
  Find scripts with ops
data.battle.camData.initialScripts.filter(s => s.position.some(o => o.op === 'E6'))
data.battle.camData.initialScripts.map((s, i) => s.position.some(o => o.op === 'E6') ? i : -1).filter(i => i !== -1)
*/

/*
// Sephiroth final - Battle 925, initial script 88


{"op"":"D7","arg":0,"arg2":88,"raw":"D7 00 58","js":"opD7()"},
{"op"":"DB","raw":"DB","js":"opDB()"},
{"op"":"XYZ","x":32767,"y":8888,"z":704,"raw":"F9 FF 7F B8 22 C0 02","js":"setXYZ({x: 32767, y: 8888, z:704});"},
{"op"":"MOVE","x":25134,"y":6584,"z":725,"frames":59,"raw":"E6 2E 62 B8 19 D5 02 3B","js":"moveToPositionAsync({x: 25134, y: 6584, z: 725, frames: 59})"},
{"op"":"SETWAIT","frames":59,"raw":"F5 3B","js":"setWait({frames: 59})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":789,"y":56,"z":382,"frames":1,"raw":"E6 15 03 38 00 7E 01 01","js":"moveToPositionAsync({x: 789, y: 56, z: 382, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D6","raw":"D6","js":"opD6()"},
{"op"":"SETWAIT","frames":6,"raw":"F5 06","js":"setWait({frames: 6})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":25134,"y":6584,"z":725,"frames":1,"raw":"E6 2E 62 B8 19 D5 02 01","js":"moveToPositionAsync({x: 25134, y: 6584, z: 725, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":17501,"y":4280,"z":746,"frames":40,"raw":"E6 5D 44 B8 10 EA 02 28","js":"moveToPositionAsync({x: 17501, y: 4280, z: 746, frames: 40})"},
{"op"":"SETWAIT","frames":40,"raw":"F5 28","js":"setWait({frames: 40})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":1128,"y":-456,"z":-501,"frames":1,"raw":"E6 68 04 38 FE 0B FE 01","js":"moveToPositionAsync({x: 1128, y: -456, z: -501, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D6","raw":"D6","js":"opD6()"},
{"op"":"SETWAIT","frames":5,"raw":"F5 05","js":"setWait({frames: 5})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":17501,"y":4280,"z":746,"frames":1,"raw":"E6 5D 44 B8 10 EA 02 01","js":"moveToPositionAsync({x: 17501, y: 4280, z: 746, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":9867,"y":1976,"z":766,"frames":30,"raw":"E6 8B 26 B8 07 FE 02 1E","js":"moveToPositionAsync({x: 9867, y: 1976, z: 766, frames: 30})"},
{"op"":"SETWAIT","frames":30,"raw":"F5 1E","js":"setWait({frames: 30})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":379,"y":-520,"z":1386,"frames":1,"raw":"E6 7B 01 F8 FD 6A 05 01","js":"moveToPositionAsync({x: 379, y: -520, z: 1386, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D6","raw":"D6","js":"opD6()"},
{"op"":"SETWAIT","frames":4,"raw":"F5 04","js":"setWait({frames: 4})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":759,"y":-904,"z":-1281,"frames":1,"raw":"E6 F7 02 78 FC FF FA 01","js":"moveToPositionAsync({x: 759, y: -904, z: -1281, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D6","raw":"D6","js":"opD6()"},
{"op"":"SETWAIT","frames":4,"raw":"F5 04","js":"setWait({frames: 4})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":-50,"y":-712,"z":1030,"frames":1,"raw":"E6 CE FF 38 FD 06 04 01","js":"moveToPositionAsync({x: -50, y: -712, z: 1030, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D6","raw":"D6","js":"opD6()"},
{"op"":"SETWAIT","frames":4,"raw":"F5 04","js":"setWait({frames: 4})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":9867,"y":1976,"z":766,"frames":1,"raw":"E6 8B 26 B8 07 FE 02 01","js":"moveToPositionAsync({x: 9867, y: 1976, z: 766, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":2234,"y":-328,"z":787,"frames":20,"raw":"E6 BA 08 B8 FE 13 03 14","js":"moveToPositionAsync({x: 2234, y: -328, z: 787, frames: 20})"},
{"op"":"SETWAIT","frames":20,"raw":"F5 14","js":"setWait({frames: 20})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":82,"y":-904,"z":-755,"frames":1,"raw":"E6 52 00 78 FC 0D FD 01","js":"moveToPositionAsync({x: 82, y: -904, z: -755, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D6","raw":"D6","js":"opD6()"},
{"op"":"SETWAIT","frames":3,"raw":"F5 03","js":"setWait({frames: 3})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":0,"y":-648,"z":1316,"frames":1,"raw":"E6 00 00 78 FD 24 05 01","js":"moveToPositionAsync({x: 0, y: -648, z: 1316, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D6","raw":"D6","js":"opD6()"},
{"op"":"SETWAIT","frames":3,"raw":"F5 03","js":"setWait({frames: 3})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"MOVE","x":57,"y":-904,"z":-849,"frames":1,"raw":"E6 39 00 78 FC AF FC 01","js":"moveToPositionAsync({x: 57, y: -904, z: -849, frames: 1})"},
{"op"":"SETWAIT","frames":1,"raw":"F5 01","js":"setWait({frames: 1})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D6","raw":"D6","js":"opD6()"},
{"op"":"SETWAIT","frames":3,"raw":"F5 03","js":"setWait({frames: 3})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"DA","raw":"DA","js":"opDA()"},
{"op"":"MIDLE","frames":30,"raw":"E2 1E","js":"moveToIdlePositionAsync({frames: 30})"},
{"op"":"SETWAIT","frames":30,"raw":"F5 1E","js":"setWait({frames: 30})"},
{"op"":"WAIT","raw":"F4","js":"executeWait()"},
{"op"":"D7","arg":0,"arg2":0,"raw":"D7 00 00","js":"opD7()"},
{"op"":"RET","raw":"FF","js":"return()"}]

*/

const U1ON = () => {
  console.log('CAMERA pos U1ON')
  CAM_DATA.position.unknown1 = true
}
const U1OFF = () => {
  console.log('CAMERA pos U1OFF')
  CAM_DATA.position.unknown1 = false
}
const U2ON = () => {
  console.log('CAMERA pos U2ON')
  CAM_DATA.position.unknown2 = true
}
const U2OFF = () => {
  console.log('CAMERA pos U2OFF')
  CAM_DATA.position.unknown2 = false
}

const FLASH = () => {
  console.log('CAMERA pos FLASH')
  window.currentBattle.ui.flashPlane.userData.quickFlash()
}
const XYZ = op => {
  CAM_DATA.position.active.set(op.x, -op.y, -op.z)
  console.log('CAMERA pos XYZ', op, CAM_DATA)
}
const MIDLE = op => {
  console.log('CAMERA pos MIDLE: START', op, CAM_DATA)
  const from = CAM_DATA.position.active.clone()
  const to = CAM_DATA.idle.position
  tweenCamera(CAM_DATA.position.active, from, to, op.frames, 'pos MIDLE')
}
const MOVE = op => {
  console.log('CAMERA pos MOVE: START', op, CAM_DATA)
  const from = CAM_DATA.position.active.clone()
  const to = new THREE.Vector3(op.x, -op.y, -op.z)
  tweenCamera(CAM_DATA.position.active, from, to, op.frames, 'pos MOVE')
}

const SETWAIT = op => {
  CAM_DATA.position.wait = op.frames
  console.log('CAMERA pos SETWAIT:', op, CAM_DATA)
}
const WAIT = async op => {
  return new Promise(async resolve => {
    console.log('CAMERA pos WAIT: START', op, CAM_DATA.position.wait)
    const from = {}
    await tweenSleep((CAM_DATA.position.wait / 15) * 1000)
    console.log('CAMERA pos WAIT: END')
    resolve()
  })
}
const RET = () => {
  console.log('CAMERA pos RET')
}
const RET2 = () => {
  console.log('CAMERA pos RET2')
}

export {
  U1ON,
  U1OFF,
  U2ON,
  U2OFF,
  FLASH,
  XYZ,
  MIDLE,
  MOVE,
  SETWAIT,
  WAIT,
  RET,
  RET2
}

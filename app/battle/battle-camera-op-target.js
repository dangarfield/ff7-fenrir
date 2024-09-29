import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import { CAM_DATA, tweenCamera } from './battle-camera.js'
import { tweenSleep } from './battle-scene.js'

const U1ON = () => {
  console.log('CAMERA pos U1ON')
  CAM_DATA.target.unknown1 = true
}
const U1OFF = () => {
  console.log('CAMERA pos U1OFF')
  CAM_DATA.target.unknown1 = false
}

const XYZ = op => {
  CAM_DATA.target.active.set(op.x, -op.y, -op.z)
  console.log('CAMERA target XYZ', op, CAM_DATA)
}

const MIDLE = op => {
  console.log('CAMERA target MIDLE: START', op, CAM_DATA)
  const from = CAM_DATA.target.active.clone()
  const to = CAM_DATA.idle.target
  tweenCamera(CAM_DATA.target.active, from, to, op.frames, 'target MIDLE')
}
const MOVE = op => {
  console.log('CAMERA target MOVE: START', op, CAM_DATA)
  const from = CAM_DATA.target.active.clone()
  const to = new THREE.Vector3(op.x, -op.y, -op.z)
  tweenCamera(CAM_DATA.target.active, from, to, op.frames, 'pos MOVE')
}

const SETWAIT = op => {
  CAM_DATA.target.wait = op.frames
  console.log('CAMERA target SETWAIT:', op, CAM_DATA)
}
const WAIT = async op => {
  return new Promise(async resolve => {
    console.log('CAMERA target WAIT: START', op, CAM_DATA.target.wait)
    await tweenSleep((CAM_DATA.target.wait / 15) * 1000)
    console.log('CAMERA target WAIT: END')
    resolve()
  })
}
const RET = () => {
  console.log('CAMERA target RET')
}
const RET2 = () => {
  console.log('CAMERA target RET2')
}
export { U1ON, U1OFF, XYZ, MIDLE, MOVE, SETWAIT, WAIT, RET, RET2 }

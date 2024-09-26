import TWEEN from '../../assets/tween.esm.js'
import { CAM_DATA } from './battle-camera.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

const XYZ = op => {
  CAM_DATA.target.to.set(op.x, -op.y, -op.z)
  console.log('CAMERA target XYZ', op, CAM_DATA)
}
const MOVA = op => {
  console.log('CAMERA target MOVA: START', op, CAM_DATA)
  const tweenVector = CAM_DATA.target.to.clone()
  const t = new TWEEN.Tween(tweenVector, BATTLE_TWEEN_GROUP)
    .to(CAM_DATA.idle.target, (op.frames / 15) * 1000) // eg, 15 fps
    .easing(TWEEN.Easing.Quadratic.InOut) // ?
    .onUpdate(() => {
      CAM_DATA.target.active.set(tweenVector.x, tweenVector.y, tweenVector.z)
      console.log('CAMERA target MOVA: update', CAM_DATA.target.active)
      // console.log(
      //   'CAMERA pos MOVA: update',
      //   tweenVector,
      //   CAM_DATA.target.active
      // )
    })
    .onComplete(() => {
      console.log('CAMERA target MOVA: END', CAM_DATA.target.active)
      BATTLE_TWEEN_GROUP.remove(t)
    })
    .start()
}

const SETWAIT = op => {
  CAM_DATA.target.wait = op.frames
  console.log('CAMERA target SETWAIT:', op, CAM_DATA)
}
const WAIT = async op => {
  return new Promise(resolve => {
    console.log('CAMERA target WAIT: START', op, CAM_DATA.target.wait)
    const from = {}
    const t = new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
      .to({}, (CAM_DATA.target.wait / 15) * 1000) // eg, 15 fps
      .onComplete(() => {
        // console.log('CAMERA target MOVA: END', CAM_DATA)
        console.log('CAMERA target WAIT: END')
        BATTLE_TWEEN_GROUP.remove(t)
        resolve()
      })
      .start()
  })
}
const RET = () => {
  console.log('CAMERA target RET')
}
export { XYZ, MOVA, SETWAIT, WAIT, RET }

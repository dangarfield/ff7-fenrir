import TWEEN from '../../assets/tween.esm.js'
import { CAM_DATA } from './battle-camera.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'

const XYZ = op => {
  CAM_DATA.position.to.set(op.x, -op.y, -op.z)
  console.log('CAMERA pos XYZ', op, CAM_DATA)
}
const MOVA = op => {
  console.log('CAMERA pos MOVA: START', op, CAM_DATA)
  const tweenVector = CAM_DATA.position.to.clone()
  const t = new TWEEN.Tween(tweenVector, BATTLE_TWEEN_GROUP)
    .to(CAM_DATA.idle.position, (op.frames / 15) * 1000) // eg, 15 fps
    .easing(TWEEN.Easing.Quadratic.InOut) // ?
    .onUpdate(() => {
      // console.log('CAMERA pos MOVA: update', CAM_DATA)
      CAM_DATA.position.active.set(tweenVector.x, tweenVector.y, tweenVector.z)
      // console.log(
      //   'CAMERA pos MOVA: update',
      //   tweenVector,
      //   CAM_DATA.position.active
      // )
    })
    .onComplete(() => {
      // console.log('CAMERA pos MOVA: END', CAM_DATA)
      BATTLE_TWEEN_GROUP.remove(t)
    })
    .start()
}

const SETWAIT = op => {
  CAM_DATA.position.wait = op.frames
  console.log('CAMERA pos SETWAIT:', op, CAM_DATA)
}
const WAIT = async op => {
  return new Promise(resolve => {
    console.log('CAMERA pos WAIT: START', op, CAM_DATA.position.wait)
    const from = {}
    const t = new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
      .to({}, (CAM_DATA.position.wait / 15) * 1000) // eg, 15 fps
      .onComplete(() => {
        // console.log('CAMERA pos MOVA: END', CAM_DATA)
        console.log('CAMERA pos WAIT: END')
        BATTLE_TWEEN_GROUP.remove(t)
        resolve()
      })
      .start()
  })
}
const RET = () => {
  console.log('CAMERA pos RET')
}
export { XYZ, MOVA, SETWAIT, WAIT, RET }

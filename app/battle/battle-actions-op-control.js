import { ACTION_DATA, framesToTime } from './battle-actions.js'
import { tweenSleep } from './battle-scene.js'

const ANIM = async op => {
  const attActor = ACTION_DATA.actors.attacker
  const attPos = attActor.model.scene.position
  const attAnimPos = attActor.model.scene.children[0].position

  // Apply the previous translation to the root... I bit of a mess, but it mostly solves the problems
  // This is a mess, need to solve this better, but it appears as though it's related to the animation start frames
  if (
    ACTION_DATA.attackerPosition.position !== 0 &&
    !ACTION_DATA.attackerPosition.applied
  ) {
    attActor.model.scene.children[0].updateMatrixWorld()
    const finalWorldPosition = new THREE.Vector3()
    attActor.model.scene.children[0].getWorldPosition(finalWorldPosition)
    attPos.x = finalWorldPosition.x
    attPos.z = finalWorldPosition.z
    attAnimPos.x = 0
    attAnimPos.z = 0
  }

  const animOptions = {}
  if (op.async && ACTION_DATA.attackerPosition.position === 0) {
    // Note: Looks like the return to idle anim is always 28 ?
    ACTION_DATA.actors.attacker.model.userData.playAnimationOnce(
      op.animation,
      animOptions
    )
  } else {
    await ACTION_DATA.actors.attacker.model.userData.playAnimationOnce(
      op.animation,
      animOptions
    )
  }

  // It visually looks like after you finish, you should hold the first frame of the next animation, maybe...
}
const SETWAIT = op => {
  ACTION_DATA.wait = op.frames
}
const WAIT = async () => {
  await tweenSleep(framesToTime(ACTION_DATA.wait))
  ACTION_DATA.wait = 0
}
const NAME = () => {
  window.currentBattle.ui.battleText.showBattleMessage(ACTION_DATA.actionName)
}
const RET = () => {}
export { ANIM, SETWAIT, WAIT, NAME, RET }

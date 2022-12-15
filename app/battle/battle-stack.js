import TWEEN from '../../assets/tween.esm.js'
import { BATTLE_TWEEN_GROUP, tweenSleep } from './battle-scene.js'

const moveEntity = (model, from, to) => {
  // TODO - Rotation too?
  return new Promise(resolve => {
    const time = 500 / 5 // ??
    const fromClone = { ...from }
    fromClone.z = fromClone.z - 600
    const toClone = { ...to }
    toClone.z = toClone.z + 1200

    console.log('battle moveEntity', from, to, fromClone, toClone)
    new TWEEN.Tween(fromClone, BATTLE_TWEEN_GROUP)
      .to(toClone, time)
      .onUpdate(function () {
        console.log('battle move', fromClone, to)
        model.scene.position.x = fromClone.x
        model.scene.position.z = fromClone.z
      })
      .onComplete(function () {
        console.log('battle move complete', from)
        resolve()
      })
      .start()
  })
}

const battleAttackSequence = async (fromEntity, toEntity) => {
  await fromEntity.model.userData.playAnimationOnce(6, { nextAnim: 7 })
  await moveEntity(fromEntity.model, fromEntity.model.userData.defaultPosition, toEntity.model.userData.defaultPosition)
  await Promise.all([
    toEntity.model.userData.playAnimationOnce(14, { delay: 400, nextAnim: 0 }),
    fromEntity.model.userData.playAnimationOnce(8)
  ])

  fromEntity.model.scene.position.x = fromEntity.model.userData.defaultPosition.x
  fromEntity.model.scene.position.z = fromEntity.model.userData.defaultPosition.z

  await fromEntity.model.userData.playAnimationOnce(9, { nextAnim: 0 })
}

const initBattleStack = async () => {
  const battleConfig = window.currentBattle

  await tweenSleep(1000)
  battleAttackSequence(battleConfig.enemies[0], battleConfig.party[0])
}

export { initBattleStack }

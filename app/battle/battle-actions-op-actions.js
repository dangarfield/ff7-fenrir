import TWEEN from '../../assets/tween.esm.js'
import { playSound } from '../media/media-sound.js'
import { position3DToOrtho } from './battle-3d.js'
import { ACTION_DATA, framesToTime } from './battle-actions.js'
import { calcDamage, DMG_TYPE } from './battle-damage-calc.js'
import { displayEffectAnimation } from './battle-effects.js'
import { tweenInterval, tweenSleep } from './battle-scene.js'

const SOUND = async op => {
  await tweenSleep(framesToTime(op.frames))
  playSound(op.sound)
}
const triggerHurt = async targets => {
  for (const target of targets) {
    // TODO - Just a placeholder for now
    // Note, I think attacks have a 'hurt action index' on them, so use this to 'apply' to the targets?!
    // For players:
    //    hurtIndex 0 => enemyActionScript[5] - Normal Hurt
    //    hurtIndex 2 => enemyActionScript[6] - Sustained
    //    hurtIndex 2 => enemyActionScript[6] - Knocked off feet
    // For enemies:
    //                   enemyActionScript[1] - Normal Hurt
    //                   enemyActionScript[2] - Knocked off feet
    // Note: op F2 is trigger when this happens too...

    // actor.data.status.defend - Is there a specific animation if target (player) is set to defend?
    target.model.userData.playAnimationOnce(1, {
      nextAnim: 0
    })
  }
}
const getRandomItem = list => {
  return list[Math.floor(Math.random() * list.length)]
}

const triggerHitEffect = async (targets, hitEffectId) => {
  const effect = getRandomItem(
    Object.keys(window.battleTextures.effects32.assets).filter(
      a => a !== 'dust'
    )
  )
  for (const target of targets) {
    const pos = target.model.userData.getBonePosition(0)
    displayEffectAnimation(pos, 'effects32', effect)
  }
}
const triggerSound = async () => {
  // https://github.com/Akari1982/q-gears_reverse/blob/8a5bca40f61858eb94b516488a143badff338a09/ffvii/address_battle.txt#L314
  // Should be impactSound (from attack) or impactSoundHit/impactSoundCritical/impactSoundMiss

  let soundId = -1
  if (ACTION_DATA.attack.impactSound) {
    soundId = ACTION_DATA.attack.impactSound
  } else if (
    ACTION_DATA.attack.impactSoundCritical &&
    ACTION_DATA.damage[0] &&
    ACTION_DATA.damage[0].isCritical
  ) {
    soundId = ACTION_DATA.attack.impactSoundCritical
  } else if (ACTION_DATA.attack.impactSoundHit) {
    soundId = ACTION_DATA.attack.impactSoundHit
  }

  console.log('ACTION triggerSound', soundId)
  if (soundId > 0) {
    playSound(soundId, undefined, undefined, true)
  }
}
const triggerDamage = async () => {
  // TODO
}
const triggerBarrier = async () => {
  // TODO - Not sure
}
const triggerCritical = async () => {
  // TODO - Not sure
}

const ATT = async op => {
  // executeAttack({frames}) - after wait time ends execute hurt action, effect, sound. This will display damage and barriers effect
  await tweenSleep(framesToTime(op.frames))
  window.currentBattle.ui.flashPlane.userData.quickFlash() // Temp for visualisation
  // This appears to be hardcoded ?!

  // Do this before att? because HURT needs it for the sound
  ACTION_DATA.damage = calcDamage(
    ACTION_DATA.actors.attacker,
    ACTION_DATA.command,
    ACTION_DATA.attack,
    ACTION_DATA.actors.targets
  )

  triggerHitEffect(ACTION_DATA.actors.targets, 0x2e) // I can't see where this is saved for normal player attacks...
  triggerHurt(ACTION_DATA.actors.targets) // Should probably save these positions as hurt animation messed it up
  triggerSound() // ?

  triggerDamage()
  triggerBarrier() // ?
  triggerCritical() // ?
}

const HURT = async op => {
  // executeHurt({frames}) - After wait time ends execute hurt action, effect, sound. This will NOT display damage and barriers effect
  await tweenSleep(framesToTime(op.frames))
  window.currentBattle.ui.flashPlane.userData.quickFlash() // Temp for visualisation

  if (!ACTION_DATA.damage) {
    // Do this before att? because HURT needs it for the sound
    ACTION_DATA.damage = calcDamage(
      ACTION_DATA.actors.attacker,
      ACTION_DATA.command,
      ACTION_DATA.attack,
      ACTION_DATA.actors.targets
    )
  }
  triggerHitEffect(ACTION_DATA.actors.targets, 0x2e) // I can't see where this is saved for normal player attacks...
  triggerHurt(ACTION_DATA.actors.targets) // Should probably save these positions as hurt animation messed it up
  triggerSound() // ?
}
const DAMAGE = async op => {
  await tweenSleep(framesToTime(op.frames))
  // Show barrier effect too - Assume yes

  triggerDamage()
  triggerBarrier() // ?
  triggerCritical() // ?
}
const EFFEXE = async op => {
  // executeEffect() - If effect not loaded we will call this opcode until it does. For magic, summon, limit, enemy skill and enemy attack we execute loaded effect.
  // All effects are hardcoded so they can do whatever they want (play sounds, display damage, request hurt for target and so on)
}
const DUST = () => {
  // 0x800d3bf0 (foot_dust part) - effect of dust (one dust cloud)
  // create particle quad that scale from 1 to 2 by 8 frames, changing texture every frame. Position not changed.
  // 0x800d3d88 (foot_dust) - effect of dust (total).
  // create 4 effects 0x800d3bf0 (one dust cloud) in position of joints 0xb,0xc,0xb,0xc. One effect by frame.
  const executeOneDustCloud = count => {
    const pos = ACTION_DATA.actors.attacker.model.userData.getBonePosition(
      count % 2 === 0 ? 0xb : 0xc
    )
    // Hmm, dust pos appears to really be on the floor... might need to forcibly adjust the y in the bone position
    pos.y = 0
    // displayEffectAnimation(pos, 'effects32', 'dust', 2, 0.75)
  }
  const time = framesToTime(1)
  let count = 0
  executeOneDustCloud(count)
  count++
  tweenInterval(time, 3, () => {
    executeOneDustCloud(count)
    count++
  })
}
const GUN = () => {
  // 0x800d3af0 (machinegun splash) used as effect of shell take off and as effect that shell drop on ground.
  // create particle quad that changing texture every of 8 frames. Position not changed. Uses tha same texture as 0x800d3bf0.
  // 0x800d7368 (machinegun shell)
  // load 3d data for shell effect and move it by setted direction every frame. When position reach ground we create effect 0x800d3af0 at this
  // place and set it to fall down again (with random direction). When it falls down again we create effect 0x800d3af0 at this place and stop this effect.
  // 0x800d751c (machinegun fire&light light)
  // create particle quad for 1 frame that rotates by Y randomly.
  // 0x800d7724 (machinegun fire&light)
  // load 3d data for fire effect for 1 frame and create effect for 0x800d751c.
  // 0x800d7888 (machinegun) - effect of machinegun fire (total).
  // every second frame create effect 0x800d7724 and, if 0x80 bit in end frame data setted, create effect 0x800d7368 with random direction of movement and effect 0x800d3af0.
  // https://github.com/Akari1982/q-gears_reverse/blob/8a5bca40f61858eb94b516488a143badff338a09/ffvii/address_battle.txt#L1005
}
export { DUST, SOUND, HURT, ATT, DAMAGE }

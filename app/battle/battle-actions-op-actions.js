import TWEEN from '../../assets/tween.esm.js'
import { playSound } from '../media/media-sound.js'
import { ACTION_DATA, framesToTime } from './battle-actions.js'
import { tweenSleep } from './battle-scene.js'

const SOUND = async op => {
  await tweenSleep(framesToTime(op.frames))
  playSound(op.sound)
}
const HURT = async op => {
  // executeHurt({frames}) - After wait time ends execute hurt action, effect, sound. This will NOT display damage and barriers effect
  await tweenSleep(framesToTime(op.frames))
  window.currentBattle.ui.flashPlane.userData.quickFlash()
}
const ATT = async op => {
  // executeAttack({frames}) - after wait time ends execute hurt action, effect, sound. This will display damage and barriers effect
  await tweenSleep(framesToTime(op.frames))
  window.currentBattle.ui.flashPlane.userData.quickFlash()
}
const DAMAGE = async op => {
  // executeDamage({frames}) - After wait time ends show damage
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
}
export { SOUND, HURT, ATT }

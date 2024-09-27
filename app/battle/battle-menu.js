import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import {
  addImageToDialog,
  addImageToGroup,
  ALIGN,
  createDialogBox,
  initPointers
} from '../menu/menu-box-helper.js'
import {
  addBattleBarrier,
  addBattleLimit,
  addPauseMenu,
  addPlayerName,
  addTurnTimer,
  addHP,
  addMP,
  addBattleDescriptionsTextMenu,
  addBattleTextMenu,
  addFlashPlane
} from './battle-menu-box-helper.js'
import { initCommands } from './battle-menu-command.js'
import { orthoScene, activeCamera } from './battle-scene.js'
import { battlePointer } from './battle-target.js'
window.THREE = THREE

const playerLineHeight = 16

const constructMainMenus = () => {
  // Main Left
  const mainL = createDialogBox({
    id: 95,
    x: 0,
    y: 166,
    w: 137,
    h: 56,
    expandInstantly: true,
    noClipping: true,
    scene: orthoScene
  })
  mainL.visible = true
  console.log('battleMenu mainL', mainL)

  // Main right
  const mainR = createDialogBox({
    id: 95,
    x: 137,
    y: 166,
    w: 183,
    h: 56,
    expandInstantly: true,
    noClipping: true,
    scene: orthoScene
  })
  mainR.visible = true
  console.log('battleMenu mainL', mainR)

  // Labels
  addImageToDialog(
    mainL,
    'labels',
    'name',
    'name-label',
    14,
    174,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  ) // Are colours ok?
  addImageToDialog(
    mainL,
    'labels',
    'barrier',
    'barrier-label',
    93,
    174,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )
  addImageToDialog(
    mainR,
    'labels',
    'hp',
    'hp-label',
    144,
    174,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )
  addImageToDialog(
    mainR,
    'labels',
    'mp',
    'mp-label',
    210,
    174,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )
  addImageToDialog(
    mainR,
    'labels',
    'limit',
    'limit-label',
    240,
    174,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )
  // TODO - Note, I think that TIME and WAIT change depending on ATB status, need to look
  addImageToDialog(
    mainR,
    'labels',
    'time-1',
    'time-label',
    279,
    174,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )

  addImageToDialog(
    mainR,
    'labels',
    'time-2',
    'time-label',
    279 + 16,
    174,
    0.5,
    null,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )

  const commands = initCommands()

  // Player Elements
  for (const [i, player] of window.currentBattle.actors
    .filter(a => a.index < 3)
    .entries()) {
    if (!player.active) continue
    const name = addPlayerName(
      mainL,
      player.data.name,
      `player-name-${i}`,
      14,
      184 + playerLineHeight * i
    )
    name.setActive(false)

    const barrier = addBattleBarrier(
      mainL,
      95,
      186 + playerLineHeight * i,
      `barrier-${i}`
    )
    barrier.setPBarrier(200)
    barrier.setMBarrier(50)

    const limit = addBattleLimit(
      mainR,
      238,
      184 + playerLineHeight * i,
      `limit-${i}`
    )
    // limit.setLimit(255)
    limit.setLimit(player.data.limit.bar)
    // limit.setStatus('Sadness')

    const turnTimer = addTurnTimer(
      mainR,
      277,
      184 + playerLineHeight * i,
      `turn-${i}`
    )
    turnTimer.set(0)
    // turnTimer.setActive(false)

    const hp = addHP(mainR, 144, 184 + playerLineHeight * i, `hp-${i}`)
    hp.set(player.battleStats.hp.current, player.battleStats.hp.max, true)

    const mp = addMP(mainR, 207, 184 + playerLineHeight * i, `mp-${i}`)
    mp.set(player.battleStats.mp.current, player.battleStats.mp.max, true)

    // TODO - When a player is dead, name, hp, mp, barrier, limit and wait are all red and blanked out
    player.ui = {
      name,
      barrier,
      limit,
      turnTimer,
      hp: '',
      mp: '',
      commands,
      makeActiveSelectionPlayer: async () => {
        name.setActive(true)
        turnTimer.setActive(true)
        window.currentBattle.miscModels.selectionTriangle.showForActor(player)
        await commands.show(player)
      },
      removeActiveSelectionPlayer: async () => {
        name.setActive(false)
        turnTimer.setActive(false)
        window.currentBattle.miscModels.selectionTriangle.hide()
        await commands.hide()
      }
    }
  }
}
const updateActorsUI = () => {
  for (const player of window.currentBattle.actors) {
    if (player.ui) {
      if (
        player.timers.turnTimerProgress &&
        player.ui.turnTimer &&
        player.ui.turnTimer.get() !== player.timers.turnTimerProgress
      ) {
        player.ui.turnTimer.set(player.timers.turnTimerProgress)
      }
    }
  }
}
// TODO - Validate whether the savemap contains the target helper displayed or not
let showTargetLabel = false // Only persisted for playing session, not in savemap
const toggleTargetLabel = () => {
  showTargetLabel = !showTargetLabel
  for (const actor of window.currentBattle.actors.filter(
    a => a.active && a.type && a.type === 'enemy'
  )) {
    actor.positionSprite.userData.target.visible = showTargetLabel
  }
}
const toggleHelperText = () => {
  if (
    window.currentBattle &&
    window.currentBattle.ui &&
    window.currentBattle.ui.battleDescriptions
  ) {
    window.currentBattle.ui.battleDescriptions.toggle()
  }
}
const sendKeyPressToBattleMenu = key => {
  if (window.currentBattle.queue.activeSelectionPlayers.length === 0) return
  window.currentBattle.actors[
    window.currentBattle.queue.activeSelectionPlayers[0]
  ].ui.commands.keyPress(key)
}
const clearOrthoScene = () => {
  while (orthoScene.children.length) {
    orthoScene.remove(orthoScene.children[0])
  }
}
const initActorPositionSprites = actors => {
  for (const actor of actors.filter(a => a.active && a.type)) {
    console.log('initActorPositionSprites', actor)
    const positionSprite = new THREE.Group()
    positionSprite.userData.z = 0
    if (actor.type && actor.type === 'enemy') {
      positionSprite.userData.target = addImageToGroup(
        positionSprite,
        'labels',
        'target',
        0,
        0,
        0.5,
        null,
        ALIGN.LEFT
      )
      positionSprite.userData.target.visible = showTargetLabel
    }
    actor.positionSprite = positionSprite
    orthoScene.add(positionSprite)
  }
}
const initBattleMenu = async currentBattle => {
  clearOrthoScene()
  initPointers(orthoScene)
  initActorPositionSprites(currentBattle.actors)
  constructMainMenus()
  const pause = addPauseMenu()
  const battleDescriptions = addBattleDescriptionsTextMenu()
  const battleText = addBattleTextMenu()
  const flashPlane = addFlashPlane()

  window.currentBattle.ui = {
    pause,
    battleDescriptions,
    battleText,
    battlePointer,
    flashPlane
  }
  // Command list w = 1 list
  const command = createDialogBox({
    id: 28,
    x: 71,
    y: 168,
    w: 60,
    h: 56,
    expandInstantly: true,
    noClipping: true,
    scene: orthoScene
  })
  //   command.visible = true
  console.log('battleMenu command', command)
}
export {
  initBattleMenu,
  updateActorsUI,
  toggleTargetLabel,
  toggleHelperText,
  sendKeyPressToBattleMenu
}

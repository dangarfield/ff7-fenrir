import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import { addImageToDialog, ALIGN, createDialogBox, initPointers } from '../menu/menu-box-helper.js'
import {
  addBattleBarrier, addBattleLimit, addPauseMenu, addPlayerName, addTurnTimer,
  addHP, addMP, addBattleDescriptionsTextMenu, addBattleTextMenu
} from './battle-menu-box-helper.js'
import { addCommands } from './battle-menu-command.js'
import { orthoScene } from './battle-scene.js'
window.THREE = THREE

const playerLineHeight = 16

const constructMagicMenu = () => {
  return ''
}

const constructMainMenus = (currentBattle) => {
  // Main Left
  const mainL = createDialogBox({ id: 30, x: 0, y: 166, w: 137, h: 56, expandInstantly: true, noClipping: true, scene: orthoScene })
  mainL.visible = true
  console.log('battleMenu mainL', mainL)

  // Main right
  const mainR = createDialogBox({ id: 29, x: 137, y: 166, w: 183, h: 56, expandInstantly: true, noClipping: true, scene: orthoScene })
  mainR.visible = true
  console.log('battleMenu mainL', mainR)

  // Labels
  addImageToDialog(mainL, 'labels', 'name', 'name-label', 14, 174, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM) // Are colours ok?
  addImageToDialog(mainL, 'labels', 'barrier', 'barrier-label', 93, 174, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM)
  addImageToDialog(mainR, 'labels', 'hp', 'hp-label', 144, 174, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM)
  addImageToDialog(mainR, 'labels', 'mp', 'mp-label', 210, 174, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM)
  addImageToDialog(mainR, 'labels', 'limit', 'limit-label', 240, 174, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM)
  addImageToDialog(mainR, 'labels', 'wait', 'wait-label', 279, 174, 0.5, null, ALIGN.LEFT, ALIGN.BOTTOM)

  // Player Elements
  for (const [i, player] of window.currentBattle.actors.filter(a => a.index < 3).entries()) {
    if (!player.active) continue
    const name = addPlayerName(mainL, player.data.name, `player-name-${i}`, 14, 184 + (playerLineHeight * i))
    name.setActive(false)

    const barrier = addBattleBarrier(mainL, 95, 186 + (playerLineHeight * i), `barrier-${i}`)
    barrier.setPBarrier(200)
    barrier.setMBarrier(50)

    const limit = addBattleLimit(mainR, 238, 184 + (playerLineHeight * i), `limit-${i}`)
    // limit.setLimit(255)
    limit.setLimit(player.data.limit.bar)
    // limit.setStatus('Sadness')

    const turnTimer = addTurnTimer(mainR, 277, 184 + (playerLineHeight * i), `turn-${i}`)
    turnTimer.set(0)
    // turnTimer.setActive(false)

    const hp = addHP(mainR, 144, 184 + (playerLineHeight * i), `hp-${i}`)
    hp.set(player.battleStats.hp.current, player.battleStats.hp.max, true)

    const mp = addMP(mainR, 207, 184 + (playerLineHeight * i), `mp-${i}`)
    mp.set(player.battleStats.mp.current, player.battleStats.mp.max, true)

    const commands = addCommands(i)
    // TODO - When a player is dead, name, hp, mp, barrier, limit and wait are all red and blanked out
    player.ui = {
      name,
      barrier,
      limit,
      turnTimer,
      hp,
      mp,
      commands,
      makeActiveSelectionPlayer: async () => {
        name.setActive(true)
        turnTimer.setActive(true)
        window.currentBattle.miscModels.selectionTriangle.showForActor(player)
        await commands.show()
      },
      removeActiveSelectionPlayer: async () => {
        name.setActive(false)
        turnTimer.setActive(false)
        window.currentBattle.miscModels.selectionTriangle.hide()
        await commands.hide()
      }
    }
  }

  const magicDialog = constructMagicMenu()
  return { magicDialog }
}
const updateActorsUI = () => {
  for (const player of window.currentBattle.actors) {
    if (player.ui) {
      if (player.timers.turnTimerProgress && player.ui.turnTimer && player.ui.turnTimer.get() !== player.timers.turnTimerProgress) {
        player.ui.turnTimer.set(player.timers.turnTimerProgress)
      }
    }
  }
}
const toggleHelperText = () => {
  if (window.currentBattle && window.currentBattle.ui && window.currentBattle.ui.battleDescriptions) {
    window.currentBattle.ui.battleDescriptions.toggle()
  }
}
const sendKeyPressToBattleMenu = (key) => {
  if (window.currentBattle.queue.activeSelectionPlayer === null) return
  window.currentBattle.actors[window.currentBattle.queue.activeSelectionPlayer].ui.commands.keyPress(key)
}
const initBattleMenu = async (currentBattle) => {
  // TODO - Clear orthoScene
  initPointers(orthoScene)
  const { magicDialog } = constructMainMenus()
  const pause = addPauseMenu()
  const battleDescriptions = addBattleDescriptionsTextMenu()
  const battleText = addBattleTextMenu()

  window.currentBattle.ui = {
    pause, battleDescriptions, battleText, magicDialog
  }
  // Command list w = 1 list
  const command = createDialogBox({ id: 28, x: 71, y: 168, w: 60, h: 56, expandInstantly: true, noClipping: true, scene: orthoScene })
  //   command.visible = true
  console.log('battleMenu command', command)
}
export {
  initBattleMenu,
  updateActorsUI,
  toggleHelperText,
  sendKeyPressToBattleMenu
}

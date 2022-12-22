import { KEY } from '../interaction/inputs.js'
import { addMenuCommandsToDialog, closeDialog, showDialog, POINTERS, movePointer, createDialogBox, addTextToDialog, LETTER_TYPES, LETTER_COLORS } from '../menu/menu-box-helper.js'
import { startLimitTextTween, stopAllCoinTextTweens, startCoinTextTweens, stopAllLimitTextTweens } from '../menu/menu-limit-tween-helper.js'
import { BATTLE_TWEEN_GROUP, orthoScene } from './battle-scene.js'

const addCommands = (actorIndex) => {
  const actor = window.currentBattle.actors[actorIndex]
  const commandsGroup = addMenuCommandsToDialog(orthoScene, 72, 170, actor.battleStats.menu.command, true, BATTLE_TWEEN_GROUP)
  commandsGroup.visible = false
  console.log('battleUI commandsGroup', commandsGroup)

  // TODO - change and defend have variable y, rather than just fixed
  const changeGroup = createDialogBox({ id: 2, name: 'change', w: 56, h: 23, x: 24, y: 169, scene: orthoScene })
  addTextToDialog(changeGroup, window.data.kernel.commandData[18].name, 'change-text', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 32, 185, 0.5, null, null, true)

  const defendGroup = createDialogBox({ id: 2, name: 'defend', w: 56, h: 23, x: 72 + commandsGroup.userData.w - 8, y: 169, scene: orthoScene })
  addTextToDialog(defendGroup, window.data.kernel.commandData[19].name, 'defend-text', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 72 + commandsGroup.userData.w, 185, 0.5, null, null, true)

  const DATA = {
    state: 'command',
    command: { pos: 0, special: null }
  }
  const drawCommandCursor = () => {
    const x = 72 + 5 - 10
    const y = 170 + 9 + 7
    const xAdj = [0, 40.5, 76.5]
    const yAdj = 13
    let commandId
    if (DATA.command.special === 'change') {
      movePointer(POINTERS.pointer1,
        30 - 10,
        178 + 7)
      commandId = 18
    } else if (DATA.command.special === 'defend') {
      movePointer(POINTERS.pointer1,
        70 + commandsGroup.userData.w - 10,
        178 + 7)
      commandId = 19
    } else {
      movePointer(POINTERS.pointer1,
        x + xAdj[Math.trunc(DATA.command.pos / 4)],
        y + ((DATA.command.pos % 4) * yAdj))
      commandId = actor.battleStats.menu.command[DATA.command.pos].id
    }
    const commandDescription = window.data.kernel.commandData[commandId].description
    window.currentBattle.ui.battleDescriptions.setText(commandDescription)
    console.log('battleUI drawCommandCursor', commandId, commandDescription)
  }
  const handleKeyPressCommand = (key) => {
    switch (key) {
      case KEY.UP: {
        if (DATA.command.special === null) {
          let navCorrect = false
          while (!navCorrect) {
            DATA.command.pos--
            if (DATA.command.pos % 4 === 3 || DATA.command.pos === -1) DATA.command.pos = DATA.command.pos + 4
            if (actor.battleStats.menu.command[DATA.command.pos].id < 255) navCorrect = true
          }
          drawCommandCursor()
        }
        break
      }
      case KEY.DOWN: {
        if (DATA.command.special === null) {
          let navCorrect = false
          while (!navCorrect) {
            DATA.command.pos++
            if (DATA.command.pos % 4 === 0) DATA.command.pos = DATA.command.pos - 4
            if (actor.battleStats.menu.command[DATA.command.pos].id < 255) navCorrect = true
          }
          drawCommandCursor()
        }
        break
      }
      case KEY.LEFT: {
        if (DATA.command.special === 'change') {
          // Do nothing
        } else if (DATA.command.special === 'defend') {
          DATA.command.special = null
          closeDialog(defendGroup)
        } else if (DATA.command.pos < 4) {
          DATA.command.special = 'change'
          showDialog(changeGroup)
        } else if (actor.battleStats.menu.command[DATA.command.pos - 4] && actor.battleStats.menu.command[DATA.command.pos - 4].id < 255) {
          DATA.command.pos = DATA.command.pos - 4
        }
        drawCommandCursor()
        break
      }
      case KEY.RIGHT: {
        const next = actor.battleStats.menu.command[DATA.command.pos + 4]
        if (DATA.command.special === 'defend') {
          // Do nothing
        } else if (DATA.command.special === 'change') {
          DATA.command.special = null
          closeDialog(changeGroup)
        } else if (next && next.id < 255) {
          DATA.command.pos = DATA.command.pos + 4
        } else {
          DATA.command.special = 'defend'
          showDialog(defendGroup)
        }
        drawCommandCursor()
        break
      }
    }
  }
  const keyPress = (key) => {
    if (DATA.state === 'command') {
      handleKeyPressCommand(key)
    }
  }
  return {
    show: async () => {
      startLimitTextTween(commandsGroup.userData.limitGroup, BATTLE_TWEEN_GROUP)
      startCoinTextTweens(commandsGroup.userData.coinGroup, BATTLE_TWEEN_GROUP)
      await showDialog(commandsGroup)
      drawCommandCursor()
    },
    hide: async () => {
      movePointer(POINTERS.pointer1, 0, 0, true)
      movePointer(POINTERS.pointer2, 0, 0, true)
      movePointer(POINTERS.pointer3, 0, 0, true)
      DATA.command.special = null
      closeDialog(changeGroup)
      closeDialog(defendGroup)
      await closeDialog(commandsGroup) // TODO - Clipping doesn't happen here, so text doesn't disappear
      stopAllCoinTextTweens()
      stopAllLimitTextTweens()
      DATA.state = 'command'
    },
    keyPress
  }
}

export {
  addCommands
}

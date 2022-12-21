import { KEY } from '../interaction/inputs.js'
import { addMenuCommandsToDialog, closeDialog, showDialog, POINTERS, movePointer } from '../menu/menu-box-helper.js'
import { BATTLE_TWEEN_GROUP, orthoScene } from './battle-scene.js'

const addCommands = (actorIndex) => {
  const actor = window.currentBattle.actors[actorIndex]
  const commandsGroup = addMenuCommandsToDialog(orthoScene, 82, 170, actor.battleStats.menu.command, true, BATTLE_TWEEN_GROUP)
  commandsGroup.visible = false

  const DATA = {
    state: 'command',
    command: { pos: 0 }
  }
  const drawCommandCursor = () => {
    const x = 82 + 5 - 10
    const y = 170 + 9 + 7
    const xAdj = 43 // TODO - This is not a set value for each col
    const yAdj = 13

    // movePointer(POINTERS.pointer1, POINTERS.pointer1.position.x, 240 - POINTERS.pointer1.position.y, false, true)
    movePointer(POINTERS.pointer1,
      x + (Math.trunc(DATA.command.pos / 4) * xAdj),
      y + ((DATA.command.pos % 4) * yAdj))
  }
  const handleKeyPressCommand = (key) => {
    switch (key) {
      case KEY.UP:{
        let navCorrect = false
        while (!navCorrect) {
          DATA.command.pos--
          // TODO: This skips 'empty' commands. Try and resuse what I did in the menu
          if (DATA.command.pos % 4 === 3 || DATA.command.pos === -1) DATA.command.pos = DATA.command.pos + 4
          if (actor.battleStats.menu.command[DATA.command.pos].id < 255) navCorrect = true
        }
        drawCommandCursor()
        break
      }
      case KEY.DOWN:{
        let navCorrect = false
        while (!navCorrect) {
          DATA.command.pos++
          if (DATA.command.pos % 4 === 0) DATA.command.pos = DATA.command.pos - 4
          if (actor.battleStats.menu.command[DATA.command.pos].id < 255) navCorrect = true
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
      await showDialog(commandsGroup)
      drawCommandCursor()
    },
    hide: async () => {
      movePointer(POINTERS.pointer1, 0, 0, true)
      movePointer(POINTERS.pointer2, 0, 0, true)
      movePointer(POINTERS.pointer3, 0, 0, true)
      await closeDialog(commandsGroup) // TODO - Clipping doesn't happen here, so text doesn't disappear
      DATA.state = 'command'
    },
    keyPress
  }
}

export {
  addCommands
}

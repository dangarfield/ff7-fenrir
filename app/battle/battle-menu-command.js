import { KEY } from '../interaction/inputs.js'
import {
  createCommandsDialog,
  addMenuCommandsToDialog,
  closeDialog,
  showDialog,
  POINTERS,
  movePointer,
  createDialogBox,
  addTextToDialog,
  LETTER_TYPES,
  LETTER_COLORS
} from '../menu/menu-box-helper.js'
import {
  startLimitTextTween,
  stopAllCoinTextTweens,
  startCoinTextTweens,
  stopAllLimitTextTweens
} from '../menu/menu-limit-tween-helper.js'
import {
  addPlayerActionToQueue,
  doNotAllowPlayerToSelectAction
} from './battle-queue.js'
import { BATTLE_TWEEN_GROUP, orthoScene } from './battle-scene.js'
import { handleKeyPressTarget } from './battle-target.js'

const addCommands = actorIndex => {
  const actor = window.currentBattle.actors[actorIndex]
  const commandsGroup = createCommandsDialog(
    orthoScene,
    72,
    170,
    actor.battleStats.menu.command,
    true
  )
  commandsGroup.visible = false
  console.log('battleUI commandsGroup', commandsGroup)

  // TODO - change and defend have variable y, rather than just fixed
  // TODO - You cannot select change if you are in a pincer attack
  const changeGroup = createDialogBox({
    id: 2,
    name: 'change',
    w: 56,
    h: 23,
    x: 24,
    y: 169,
    scene: orthoScene
  })
  addTextToDialog(
    changeGroup,
    window.data.kernel.commandData[18].name,
    'change-text',
    LETTER_TYPES.BattleBaseFont,
    LETTER_COLORS.White,
    32,
    185,
    0.5,
    null,
    null,
    true
  )

  const defendGroup = createDialogBox({
    id: 2,
    name: 'defend',
    w: 56,
    h: 23,
    x: 72 + commandsGroup.userData.w - 8,
    y: 169,
    scene: orthoScene
  })
  addTextToDialog(
    defendGroup,
    window.data.kernel.commandData[19].name,
    'defend-text',
    LETTER_TYPES.BattleBaseFont,
    LETTER_COLORS.White,
    72 + commandsGroup.userData.w,
    185,
    0.5,
    null,
    null,
    true
  )

  const DATA = {
    state: 'command',
    command: { pos: 0, special: null }
  }
  // window.COMMAND_DATA = DATA
  const hideCommandCursor = () => {
    POINTERS.pointer1.visible = false
  }
  const drawCommandCursor = () => {
    const x = 72 + 5 - 10
    const y = 170 + 9 + 7
    const xAdj = [0, 52.5, 96.5]
    const yAdj = 13
    let commandId
    if (DATA.command.special === 'change') {
      movePointer(POINTERS.pointer1, 30 - 10, 178 + 7)
      commandId = 18
    } else if (DATA.command.special === 'defend') {
      movePointer(
        POINTERS.pointer1,
        70 + commandsGroup.userData.w - 10,
        178 + 7
      )
      commandId = 19
    } else {
      movePointer(
        POINTERS.pointer1,
        x + xAdj[Math.trunc(DATA.command.pos / 4)],
        y + (DATA.command.pos % 4) * yAdj
      )
      const command = actor.battleStats.menu.command[DATA.command.pos]
      commandId = command.limit ? command.limit : command.id
    }
    const commandDescription =
      window.data.kernel.commandData[commandId].description
    window.currentBattle.ui.battleDescriptions.setText(commandDescription)
    // console.log('battleUI drawCommandCursor', commandId, commandDescription)
  }
  const selectCommand = async () => {
    const posCommand = actor.battleStats.menu.command[DATA.command.pos]
    let commandId = posCommand.limit ? posCommand.limit : posCommand.id
    if (DATA.command.special === 'change') commandId = 18
    if (DATA.command.special === 'defend') commandId = 19
    if (commandId === 7 && commandsGroup.userData.coinGroup) {
      // Coin
      if (commandsGroup.userData.coinGroup[0].visible === false) commandId = 8 // Throw
    }
    const command = window.data.kernel.commandData[commandId]
    console.log('battleUI selectCommand', command)
    switch (command.initialCursorAction) {
      // "PerformCommandUsingTargetData"
      // "EnableTargetSelectionUsingCursor"
      // "MagicMenu"
      // "SummonMenu"
      // "ItemMenu"
      // "CoinMenu"
      // "ThrowMenu"
      // "ESkillMenu"
      // "LimitMenu"
      // "WMagicMenu"
      // "WSummonMenu"
      // "WItemMenu"
      // "None"

      // If the command is 'attack' (maybe some others too), use the target flags from the weapon
      // Not entirely sure what the difference between EnableTargetSelectionUsingCursor and PerformCommandUsingTargetData is
      case 'PerformCommandUsingTargetData':
        // TODO - Go to target selection
        console.log('battleUI EnableSelection', command)
        DATA.state = 'target'
        // TODO - Add weapon, magic, item details to targetFlags
        hideCommandCursor()
        const selectionResult =
          await window.currentBattle.ui.battlePointer.startSelection(
            actorIndex,
            command.targetFlags
          )
        DATA.state = 'command'
        console.log('battleUI target selectionResult', selectionResult)
        if (selectionResult.target) {
          console.log('battleUI target confirmed, sending to op stack')
          // TODO - Add command to stack with targets, not sure what this looks like
          hide()
        } else {
          POINTERS.pointer1.visible = true // More than one pointer required here ? Need a better way to keep track
        }
        // console.log('battleUI Add player action', command)
        // addPlayerActionToQueue(actorIndex, command.index, null, null, 6)
        // actor.ui.removeActiveSelectionPlayer()
        // doNotAllowPlayerToSelectAction(actorIndex)
        // window.currentBattle.ui.battleDescriptions.setText('')

        break

      default:
        window.currentBattle.ui.battleText.showBattleMessage(
          `Unknown command action - ${command.initialCursorAction}`
        )
        break
    }
  }
  const handleKeyPressCommand = key => {
    switch (key) {
      case KEY.UP: {
        if (DATA.command.special === null) {
          let navCorrect = false
          while (!navCorrect) {
            DATA.command.pos--
            if (DATA.command.pos % 4 === 3 || DATA.command.pos === -1)
              DATA.command.pos = DATA.command.pos + 4
            if (actor.battleStats.menu.command[DATA.command.pos].id < 255)
              navCorrect = true
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
            if (DATA.command.pos % 4 === 0)
              DATA.command.pos = DATA.command.pos - 4
            if (actor.battleStats.menu.command[DATA.command.pos].id < 255)
              navCorrect = true
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
        } else if (
          actor.battleStats.menu.command[DATA.command.pos - 4] &&
          actor.battleStats.menu.command[DATA.command.pos - 4].id < 255
        ) {
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
      case KEY.O: {
        selectCommand()
      }
    }
  }
  const keyPress = key => {
    if (DATA.state === 'command') {
      handleKeyPressCommand(key)
    } else if (DATA.state === 'target') {
      handleKeyPressTarget(key)
    }
  }
  const show = async () => {
    addMenuCommandsToDialog(
      commandsGroup,
      72,
      170,
      actor.battleStats.menu.command
    )
    startLimitTextTween(commandsGroup.userData.limitGroup, BATTLE_TWEEN_GROUP)
    startCoinTextTweens(commandsGroup.userData.coinGroup, BATTLE_TWEEN_GROUP)
    await showDialog(commandsGroup)
    drawCommandCursor()
  }
  const hide = async () => {
    movePointer(POINTERS.pointer1, 0, 0, true)
    movePointer(POINTERS.pointer2, 0, 0, true)
    movePointer(POINTERS.pointer3, 0, 0, true)
    DATA.command.special = null
    stopAllCoinTextTweens()
    stopAllLimitTextTweens()
    closeDialog(changeGroup)
    closeDialog(defendGroup)
    await closeDialog(commandsGroup) // TODO - Clipping doesn't happen here, so text doesn't disappear
    DATA.state = 'command'
  }
  return {
    show,
    hide,
    keyPress,
    commandsGroup
  }
}

export { addCommands }

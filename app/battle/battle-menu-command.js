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
  const combineTargetFlags = (
    commandIndex,
    commandFlags,
    attackFlags,
    weaponFlags,
    isAll,
    hasLongRangeMateria // TODO
  ) => {
    // more to do
    let combined = commandFlags.length === 8 ? [] : [...commandFlags]
    for (const weaponFlag of weaponFlags) {
      if (!combined.includes(weaponFlag)) combined.push(weaponFlag)
    }
    if (
      // Most commands and summons default flags set to target all enemies.
      // Filter out if we haven't got an all material or mega all
      combined.includes('ToggleSingleMultiTarget') &&
      combined.includes('DefaultMultipleTargets') &&
      !isAll
    ) {
      combined = combined.filter(
        f => f !== 'ToggleSingleMultiTarget' && f !== 'DefaultMultipleTargets'
      )
      // if (posCommand.all) combined.push('ToggleSingleMultiTarget')
    }
    // Note: Most commands have a SingleRowOnly applied, but not present in the config at least are the ones with
    // EnableTargetSelectionUsingCursor, eg: Steal, Mug, 2x-Cut. Most likely hardcoded into the battle engine
    // Steal and mug can also be combined with mega-all, but not just a normal all and it behaves like a long range command
    if ([5, 17, 25].includes(commandIndex)) combined.push('SingleRowOnly')
    if ([5, 17].includes(commandIndex) && isAll) {
      combined.push('ToggleSingleMultiTarget', 'DefaultMultipleTargets')
      combined = combined.filter(f => f !== 'ShortRange')
    }

    if (hasLongRangeMateria) combined = combined.filter(f => f !== 'ShortRange')

    console.log(
      'battleUI combineTargetFlags',
      commandFlags,
      attackFlags,
      weaponFlags,
      '-',
      isAll === true,
      hasLongRangeMateria,
      '->',
      combined
    )
    return combined
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

    console.log('battleUI selectCommand', command, posCommand)

    let combinedTargetFlags // Just to keep the variable names consistent
    let selectionResult

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

      // Not entirely sure what the difference between EnableTargetSelectionUsingCursor and PerformCommandUsingTargetData is
      // If the command is 'attack' (maybe some others too), use the target flags from the weapon
      // EnableTargetSelectionUsingCursor - Attack, Steal, Mug, 2x-Cut
      // Steal+MegaAll - Targets all (eg, not bound by cover flags)
      // Steal with a mega all switched to a single target mode, also allows all targets
      // Steal and no long range - bound by cover flags
      // 2x cut bound by cover flag
      // 2x cut with long range weapon / material - Targets all

      // When mega-all commands - you cannot target own player
      // All of these seem to be start on enemy row too

      case 'PerformCommandUsingTargetData':
        // TODO - Go to target selection
        console.log('battleUI PerformCommandUsingTargetData', command)
        DATA.state = 'target'
        // TODO - Add weapon, magic, item details to targetFlags
        // If it's a command and a mega-all, it should not target players
        hideCommandCursor()
        combinedTargetFlags = combineTargetFlags(
          command.index,
          command.targetFlags,
          [],
          actor.battleStats.weaponData.targets,
          posCommand.all,
          actor.battleStats.hasLongRangeMateria
        )
        selectionResult =
          await window.currentBattle.ui.battlePointer.startSelection(
            actorIndex,
            combinedTargetFlags,
            false
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
      case 'EnableTargetSelectionUsingCursor':
        // TODO - Go to target selection
        console.log('battleUI EnableTargetSelectionUsingCursor', command)
        DATA.state = 'target'
        // TODO - Add weapon, magic, item details to targetFlags
        hideCommandCursor()
        combinedTargetFlags = combineTargetFlags(
          command.index,
          command.targetFlags,
          [],
          actor.battleStats.weaponData.targets,
          posCommand.all,
          actor.battleStats.hasLongRangeMateria
        )
        selectionResult =
          await window.currentBattle.ui.battlePointer.startSelection(
            actorIndex,
            combinedTargetFlags,
            combinedTargetFlags.includes('ShortRange')
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
    movePointer(POINTERS.pointer1, -100, -100, true)
    movePointer(POINTERS.pointer2, -100, -100, true)
    movePointer(POINTERS.pointer3, -100, -100, true)
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

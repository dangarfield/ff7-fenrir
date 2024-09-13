import { asyncWrap } from '../helpers/helpers.js'
import { KEY } from '../interaction/inputs.js'
import { removeItemFromInventory } from '../items/items-module.js'
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
  LETTER_COLORS,
  removeGroupChildren
} from '../menu/menu-box-helper.js'
import {
  startLimitTextTween,
  stopAllCoinTextTweens,
  startCoinTextTweens,
  stopAllLimitTextTweens
} from '../menu/menu-limit-tween-helper.js'
import {
  closeCoinDialog,
  handleKeyPressCoin,
  openCoinDialog,
  selectCoinAmount
} from './battle-menu-coin.js'
import {
  closeLimitDialog,
  handleKeyPressLimit,
  openLimitDialog,
  selectLimit
} from './battle-menu-limit.js'
import {
  selectSpell,
  handleKeyPressSpell,
  closeSpellDialogs,
  openSpellMenu,
  drawAllInView
} from './battle-menu-spells.js'
import { addPlayerActionToQueue } from './battle-queue.js'
import { BATTLE_TWEEN_GROUP, orthoScene } from './battle-scene.js'
import { handleKeyPressTarget } from './battle-target.js'

const DATA = {
  state: 'command', // Should really keep this at the actor level,
  actor: null,
  command: { pos: 0, special: null },
  magic: { pos: 0, page: 0, cols: 3, rows: 3, total: 54 },
  enemySkills: { pos: 0, page: 0, cols: 2, rows: 3, total: 24 },
  summon: { pos: 0, page: 0, cols: 1, rows: 3, total: 16 },
  items: {
    pos: 0,
    page: 0,
    cols: 1,
    rows: 3,
    total: 320,
    restriction: 'CanBeUsedInBattle',
    firstItemId: null
  },
  limit: { pos: 0 }
}
let commandContainerGroup
let commandsGroup
let changeGroup
let defendGroup
let temporaryConcealPointerState = {
  visible: true,
  state: '',
  pointers: {}
}

const temporarilyConcealCommands = visible => {
  temporaryConcealPointerState.visible = visible
  if (POINTERS.pointer1 !== null) {
    if (visible) {
      DATA.state = temporaryConcealPointerState.state
      for (const key in temporaryConcealPointerState.pointers) {
        POINTERS[key].visible = temporaryConcealPointerState.pointers[key]
      }
    } else {
      temporaryConcealPointerState.state = DATA.state
      DATA.state = 'conceal'
      temporaryConcealPointerState.pointers = {}
      for (const key in POINTERS) {
        temporaryConcealPointerState.pointers[key] = POINTERS[key].visible
        POINTERS[key].visible = false
      }
    }
  }

  if (commandContainerGroup) {
    commandContainerGroup.visible = visible
  }
  console.log('press CONCEAL', visible, temporaryConcealPointerState)
}
const initCommands = () => {
  commandContainerGroup = new THREE.Group()
  commandContainerGroup.userData = { id: 30, z: 50 }
  // commandContainerGroup.position.z = 0
  commandContainerGroup.visible = true
  orthoScene.add(commandContainerGroup)
  window.commandContainerGroup = commandContainerGroup
  const init = () => {
    DATA.state = 'command'
    console.log('battleUI commands INIT', commandContainerGroup.children.length)
    DATA.command = { pos: 0, special: null }
    commandsGroup = createCommandsDialog(
      // 100 - z - 3
      commandContainerGroup,
      72,
      170,
      DATA.actor.battleStats.menu.command,
      true
    )
    commandsGroup.visible = false
    window.commandsGroup = commandsGroup
    // console.log('battleUI commandsGroup', commandsGroup)
    console.log('battleUI addCommands', commandsGroup, DATA.actor)
    // TODO - change and defend have variable y, rather than just fixed
    // TODO - You cannot select change if you are in a pincer attack
    changeGroup = createDialogBox({
      id: 25,
      name: 'change',
      w: 56,
      h: 23,
      x: 24,
      y: 169,
      scene: commandContainerGroup
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

    defendGroup = createDialogBox({
      id: 25,
      name: 'defend',
      w: 56,
      h: 23,
      x: 72 + commandsGroup.userData.w - 8,
      y: 169,
      scene: commandContainerGroup
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

    window.b = {
      commandContainerGroup,
      commandsGroup,
      changeGroup,
      defendGroup
    }
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
      const command = DATA.actor.battleStats.menu.command[DATA.command.pos]
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
    console.log(
      'battleUI combineTargetFlags: START',
      commandIndex,
      commandFlags,
      attackFlags,
      weaponFlags,
      isAll,
      hasLongRangeMateria
    )
    let combined
    if (attackFlags !== null) {
      // When attack is present it's magic, summon, eskill, so just use this combined with 'all'
      combined = [...attackFlags]

      // Multi target is selected on magic by default, need to make this work with 'alls'
      if (!isAll && combined.includes('ToggleSingleMultiTarget')) {
        combined = combined.filter(
          f => f !== 'ToggleSingleMultiTarget' && f !== 'DefaultMultipleTargets'
        )
      }
      return combined
    }
    if (commandFlags.length === 0) return commandFlags // Mime, Change, Defend
    combined = commandFlags.length === 8 ? [] : [...commandFlags]
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
  const limitMenuProcess = async command => {
    POINTERS.pointer1.visible = false
    DATA.state = 'limit'

    const selectedActions = []
    console.log('battleUI LIMIT: START')
    await openLimitDialog(commandContainerGroup)
    while (selectedActions.length < 2) {
      if (selectedActions.length % 2 === 0) {
        // Select limit
        DATA.state = 'limit'
        const selectedLimit = await selectLimit()
        POINTERS.pointer1.visible = false
        if (selectedLimit === null) break
        selectedActions.push(selectedLimit)
        continue
      } else {
        // Select target
        DATA.state = 'target' // Note: Not all limits require targetting
        const combinedTargetFlags = combineTargetFlags(
          command.index,
          command.targetFlags,
          selectedActions[0].targetFlags,
          DATA.actor.battleStats.weaponData.targets,
          true,
          DATA.actor.battleStats.hasLongRangeMateria
        )

        console.log(
          'battleUI LIMIT: Target Selection',
          selectedActions[0],
          combinedTargetFlags
        )

        const selectionResult =
          await window.currentBattle.ui.battlePointer.startSelection(
            DATA.actor.index,
            combinedTargetFlags,
            false
          )
        console.log('battleUI LIMIT: Target Selection Results', selectionResult)
        if (selectionResult.target) {
          selectedActions.push(selectionResult)
        } else {
          // Remove last spell so that it goes back to spell selection
          selectedActions.pop()
        }
      }
    }
    console.log(
      'battleUI LIMIT: END',
      selectedActions,
      selectedActions.length === 2
    )
    DATA.state = 'command'
    await closeLimitDialog()
    window.currentBattle.ui.battleDescriptions.setText()
    if (selectedActions.length === 2) {
      addPlayerActionToQueue(
        // Envoking this each times removes current player from queue, need to fix for w-magic etc
        // Includes hiding commands, which is ok in fenrir, but all dialogs are closed in one action in the main game
        DATA.actor.index,
        command.index,
        selectedActions[0],
        selectedActions[1],
        1 // Limits are 1?
      )
    } else {
      drawCommandCursor()
    }
  }
  const coinMenuProcess = async command => {
    POINTERS.pointer1.visible = false
    DATA.state = 'coin'

    const selectedActions = []
    console.log('battleUI COIN: START')
    await openCoinDialog(commandContainerGroup)
    while (selectedActions.length < 2) {
      if (selectedActions.length % 2 === 0) {
        // Select coin amount
        DATA.state = 'coin'
        const coinAmount = await selectCoinAmount()
        POINTERS.pointer1.visible = false
        if (coinAmount === null) break
        selectedActions.push(coinAmount)
        continue
      } else {
        // Select target
        DATA.state = 'target'
        const combinedTargetFlags = combineTargetFlags(
          command.index,
          command.targetFlags,
          null,
          DATA.actor.battleStats.weaponData.targets,
          true,
          DATA.actor.battleStats.hasLongRangeMateria
        )
        console.log(
          'battleUI start target selection for CoinMenu',
          selectedActions[0],
          combinedTargetFlags
        )

        const selectionResult =
          await window.currentBattle.ui.battlePointer.startSelection(
            DATA.actor.index,
            combinedTargetFlags,
            false
          )
        console.log('battleUI selectionResult for CoinMenu', selectionResult)
        if (selectionResult.target) {
          selectedActions.push(selectionResult)
        } else {
          // Remove last spell so that it goes back to spell selection
          selectedActions.pop()
        }
      }
    }
    console.log(
      'battleUI COIN: END',
      selectedActions,
      selectedActions.length === 2
    )
    DATA.state = 'command'
    await closeCoinDialog()
    window.currentBattle.ui.battleDescriptions.setText()
    if (selectedActions.length === 2) {
      addPlayerActionToQueue(
        // Envoking this each times removes current player from queue, need to fix for w-magic etc
        // Includes hiding commands, which is ok in fenrir, but all dialogs are closed in one action in the main game
        DATA.actor.index,
        command.index,
        selectedActions[0],
        selectedActions[1],
        6
      )
      window.data.savemap.gil =
        window.data.savemap.gil - selectedActions[0].amount
      // TODO - When the battle is finished, the gil were not completed are added back into the inventory
    } else {
      drawCommandCursor()
    }
  }
  const spellMenuProcess = async (command, type, spellsRequired) => {
    // TODO - There are some async / await operations here, of which I should cancel and return this method immediately
    // if cycleActiveSelectionPlayer is triggered

    let selectedSpell
    POINTERS.pointer1.visible = false

    const selectedActions = [] // has spell, target, spell, target etc
    DATA.items.firstItemId = null

    DATA.state = type
    openSpellMenu(commandContainerGroup)

    console.log('battleUI SELECT SPELL: START')
    while (selectedActions.length < spellsRequired * 2) {
      if (selectedActions.length % 2 === 0) {
        // Select spell
        DATA.state = type
        // TODO: For W-Magic etc should this show the 'new provisional' mp amount too?
        // Nope, the original game doesn't, it allows to go over, then when executing it says 'not enough mp'
        // But if this happens, it still decrements the 'all and summon count' even if it fails to execute because of mp etc
        // If remaining all count is 1, you CAN queue 2 all spells with both targets for all. But when the second executes,
        // it only targets a random 1 of those in the all target
        selectedSpell = await selectSpell()

        console.log('battleUI spellMenuProcess selectSpell', selectedSpell)
        if (selectedSpell === null) {
          // If w-menu, null goes back to previous target selection
          if (selectedActions.length > 0) {
            // Remove last target so that it goes back to target selection
            selectedActions.pop()
            POINTERS.pointer1.visible = false
            DATA.items.firstItemId = null
            continue
          } else {
            DATA.state = 'command'
            drawCommandCursor()
            break
          }
        }
        POINTERS.pointer1.visible = false // Improve...
        selectedActions.push(selectedSpell)
      } else {
        // Select target
        // drawAllInView(DATA[type])
        DATA.state = 'target'
        selectedSpell = selectedActions[selectedActions.length - 1]

        const attackFlags =
          type === 'items'
            ? window.data.kernel.allItemData[selectedSpell.itemId].targetData
            : window.data.kernel.attackData[selectedSpell.index].targetFlags
        const isAll =
          type === 'items'
            ? false
            : selectedSpell.addedAbilities.find(a => a.type === 'All')?.count >
              0
        const combinedTargetFlags = combineTargetFlags(
          command.index,
          command.targetFlags,
          attackFlags,
          DATA.actor.battleStats.weaponData.targets,
          isAll,
          DATA.actor.battleStats.hasLongRangeMateria
        )
        console.log(
          'battleUI start target selection for MagicMenu',
          selectedSpell,
          // selectedSpell.addedAbilities.find(a => a.type === 'All')?.count > 0,
          combinedTargetFlags
        )

        const selectionResult =
          await window.currentBattle.ui.battlePointer.startSelection(
            DATA.actor.index,
            combinedTargetFlags,
            false
          )
        console.log('battleUI selectionResult for MagicMenu', selectionResult)
        if (selectionResult.target) {
          selectedActions.push(selectionResult)
          if (type === 'items') DATA.items.firstItemId = selectedSpell.itemId
        } else {
          // Remove last spell so that it goes back to spell selection
          selectedActions.pop()
          continue
        }
      }
    }

    console.log(
      'battleUI SELECT SPELL: END',
      selectedActions,
      selectedActions.length === spellsRequired * 2
    )
    DATA.state = 'command'
    await closeSpellDialogs()
    window.currentBattle.ui.battleDescriptions.setText()
    if (selectedActions.length === spellsRequired * 2) {
      for (let i = 0; i < spellsRequired; i++) {
        addPlayerActionToQueue(
          // Envoking this each times removes current player from queue, need to fix for w-magic etc
          // Includes hiding commands, which is ok in fenrir, but all dialogs are closed in one action in the main game
          DATA.actor.index,
          command.index,
          selectedActions[i * 2 + 0],
          selectedActions[i * 2 + 1],
          6,
          i + 1 < spellsRequired // Don't trigger process queue of first one of w-magic etc
        )
        if (type === 'items')
          removeItemFromInventory(selectedActions[i * 2 + 0].itemId, 1)
        // TODO - When the battle is finished, the item actions that were not completed are added back into the inventory
      }
    } else {
      drawCommandCursor()
    }
  }
  const selectCommand = async () => {
    const posCommand = DATA.actor.battleStats.menu.command[DATA.command.pos]
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

    // TODO - A big one - state changes when menu selection is open (eg, mp or status affects commands)
    // TODO - TIME and WAIT - When selecting a command, ATB can stop if configured
    // TODO - Cannot always execute change command, need to validate it is possible on field
    // TODO - Some spells and items have a condition sub menu to be displayed for hp and status

    switch (command.initialCursorAction) {
      // "PerformCommandUsingTargetData" // DONE
      // "EnableTargetSelectionUsingCursor" // DONE
      // "MagicMenu" // DONE
      // "SummonMenu" // DONE
      // "ItemMenu" // DONE
      // "CoinMenu" // DONE
      // "ThrowMenu" // DONE
      // "ESkillMenu" // DONE
      // "LimitMenu"
      // "WMagicMenu" // DONE
      // "WSummonMenu" // DONE
      // "WItemMenu" // DONE
      // "None" // DONE

      case 'PerformCommandUsingTargetData':
        console.log('battleUI PerformCommandUsingTargetData', command)
        DATA.state = 'target'
        hideCommandCursor()
        combinedTargetFlags = combineTargetFlags(
          command.index,
          command.targetFlags,
          null,
          DATA.actor.battleStats.weaponData.targets,
          posCommand.all,
          DATA.actor.battleStats.hasLongRangeMateria
        )
        selectionResult = [18, 19].includes(command.index)
          ? { target: [DATA.actor] } // For some reason, Change and Defend look the same as Mime, but are treated
          : // differently with no visible config differences
            await window.currentBattle.ui.battlePointer.startSelection(
              DATA.actor.index,
              combinedTargetFlags,
              false
            )
        DATA.state = 'command'
        console.log('battleUI target selectionResult', selectionResult)
        window.currentBattle.ui.battleDescriptions.setText()
        if (selectionResult.target) {
          console.log('battleUI target confirmed, sending to op stack')
          // Add command to stack with targets, not sure what this looks like yet, pass whole target for now
          addPlayerActionToQueue(
            // Includes hiding commands etc
            DATA.actor.index,
            command.index,
            null,
            selectionResult,
            6
          )
        } else {
          POINTERS.pointer1.visible = true // More than one pointer required here ? Need a better way to keep track
        }
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
          null,
          DATA.actor.battleStats.weaponData.targets,
          posCommand.all,
          DATA.actor.battleStats.hasLongRangeMateria
        )
        selectionResult =
          await window.currentBattle.ui.battlePointer.startSelection(
            DATA.actor.index,
            combinedTargetFlags,
            combinedTargetFlags.includes('ShortRange')
          )
        DATA.state = 'command'
        window.currentBattle.ui.battleDescriptions.setText()
        console.log('battleUI target selectionResult', selectionResult)
        if (selectionResult.target) {
          console.log('battleUI target confirmed, sending to op stack')
          // Add command to stack with targets, not sure what this looks like yet, pass whole target for now
          addPlayerActionToQueue(
            // Includes hiding commands etc
            DATA.actor.index,
            command.index,
            null,
            selectionResult,
            6
          )
        } else {
          POINTERS.pointer1.visible = true // More than one pointer required here ? Need a better way to keep track
        }
        break
      case 'MagicMenu':
        spellMenuProcess(command, 'magic', 1)
        break
      case 'SummonMenu':
        spellMenuProcess(command, 'summon', 1)
        break
      case 'ESkillMenu':
        spellMenuProcess(command, 'enemySkills', 1)
        break
      case 'WMagicMenu':
        spellMenuProcess(command, 'magic', 2)
        break
      case 'WSummonMenu':
        spellMenuProcess(command, 'summon', 2)
        break
      case 'ItemMenu':
        DATA.items.restriction = 'CanBeUsedInBattle'
        spellMenuProcess(command, 'items', 1)
        break
      case 'WItemMenu':
        DATA.items.restriction = 'CanBeUsedInBattle'
        spellMenuProcess(command, 'items', 2)
        break
      case 'ThrowMenu':
        DATA.items.restriction = 'CanBeThrown'
        spellMenuProcess(command, 'items', 1)
        break
      case 'CoinMenu':
        coinMenuProcess(command)
        break
      case 'LimitMenu':
        limitMenuProcess(command)
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
            if (DATA.actor.battleStats.menu.command[DATA.command.pos].id < 255)
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
            if (DATA.actor.battleStats.menu.command[DATA.command.pos].id < 255)
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
          DATA.actor.battleStats.menu.command[DATA.command.pos - 4] &&
          DATA.actor.battleStats.menu.command[DATA.command.pos - 4].id < 255
        ) {
          DATA.command.pos = DATA.command.pos - 4
        }
        drawCommandCursor()
        break
      }
      case KEY.RIGHT: {
        const next = DATA.actor.battleStats.menu.command[DATA.command.pos + 4]
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
    } else if (DATA.state === 'magic') {
      handleKeyPressSpell(key)
    } else if (DATA.state === 'enemySkills') {
      handleKeyPressSpell(key)
    } else if (DATA.state === 'summon') {
      handleKeyPressSpell(key)
    } else if (DATA.state === 'items') {
      handleKeyPressSpell(key)
    } else if (DATA.state === 'coin') {
      handleKeyPressCoin(key)
    } else if (DATA.state === 'limit') {
      handleKeyPressLimit(key)
    }
  }
  const show = async player => {
    DATA.actor = player
    removeGroupChildren(commandContainerGroup)
    init()
    addMenuCommandsToDialog(
      commandsGroup,
      72,
      170,
      DATA.actor.battleStats.menu.command
    )
    startLimitTextTween(commandsGroup.userData.limitGroup, BATTLE_TWEEN_GROUP)
    startCoinTextTweens(commandsGroup.userData.coinGroup, BATTLE_TWEEN_GROUP)
    console.log('battleUI command menu show')
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
    await Promise.all([
      asyncWrap(() => closeDialog(changeGroup)),
      asyncWrap(() => closeDialog(defendGroup)),
      asyncWrap(() => closeDialog(commandsGroup))
    ])
    removeGroupChildren(commandContainerGroup)
    DATA.state = 'command'
  }
  return {
    show,
    hide,
    keyPress
  }
}

export { initCommands, DATA, temporarilyConcealCommands }

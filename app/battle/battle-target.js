import { KEY } from '../interaction/inputs.js'
import { POINTERS, movePointer } from '../menu/menu-box-helper.js'
import { keyPress } from '../menu/menu-main-items.js'
import { currentBattle } from './battle-setup.js'

const data = {
  battlePointerIsActive: false,
  currentTargetActorIndex: 0,
  currentTargetGroup: 0,
  // Groups: - Set on battle load
  // -1 - All viable targets
  // 0 - left (eg, normally enemies)
  // 1 - centre (eg, normally players)
  // 2 - right (eg, enemies with no SideAttackInitialDirection, eg outside of pincer)
  currentSelectionTypeMulti: false,

  selectionMultiToggleAllowed: false,
  selectionEnabled: true,
  selectionLockedOnEnemyOrPlayer: null,
  // 01h - EnableSelection - Cursor will move to the battle field and a target can be selected with the constraints in the following.
  // 02h - StartCursorOnEnemyRow - Cursor will start on the first enemy row.
  // 04h - DefaultMultipleTargets - Cursor will select all targets in a given row.
  // 08h - ToggleSingleMultiTarget - Caster can switch cursor between multiple targets or single targets. (Also indicates if damage will be split among targets)
  // 10h - SingleRowOnly - Cursor will only target allies or enemies as defined in 02h and cannot be moved from the row.
  // 20h - ShortRange - (physical damage only) - If the target or the caster is not in the front of their row, the target will take half damage.
  //       For every attack this is enabled, they are constrained by the Binary "Cover Flags"
  // 40h - AllRows - Cursor will select all viable targets
  // 80h - RandomTarget - When multiple targets are selected, one will be selected at random to be the receiving target. Cursor will cycle among all viable targets.

  selectionPromise: null
}
const isViableTarget = a => {
  // TODO - filter out dead or not viable enemies
  return true
}
const getFirstViableEnemyTarget = () => {
  const enemies = currentBattle.actors
    .filter(a => a.active && a.type === 'enemy')
    .filter(isViableTarget)
    .sort((a, b) => a.initialData.row < b.initialData.row)
  if (enemies.length > 0) {
    return enemies[0]
  } else {
    return null
  }
}
const allViableTargets = () => {
  return currentBattle.actors
    .filter(
      a =>
        a.active &&
        (data.selectionLockedOnEnemyOrPlayer
          ? a.type === data.selectionLockedOnEnemyOrPlayer
          : true)
    )
    .filter(isViableTarget)
}
const viableTargetsForGroup = targetGroup => {
  return currentBattle.actors
    .filter(a => a.active && a.targetGroup === targetGroup)
    .filter(isViableTarget)
}
const startSelection = (actorIndex, targetFlags) => {
  targetFlags = [
    // DEBUG
    'EnableSelection', // DONE
    'StartCursorOnEnemyRow', // DONE
    'DefaultMultipleTargets' // DONE
    // 'ToggleSingleMultiTarget' // DONE
    // 'SingleRowOnly' // DONE
    // 'ShortRange',
    // 'AllRows',
    // 'RandomTarget',
  ]
  return new Promise(resolve => {
    data.selectionPromise = resolve
    data.currentTargetActorIndex = actorIndex
    data.selectionEnabled = targetFlags.includes('EnableSelection')
    data.selectionMultiToggleAllowed = targetFlags.includes(
      'ToggleSingleMultiTarget'
    )
    data.currentSelectionTypeMulti = targetFlags.includes(
      'DefaultMultipleTargets'
    )
    if (targetFlags.includes('StartCursorOnEnemyRow')) {
      const enemy = getFirstViableEnemyTarget()
      if (enemy) {
        data.currentTargetActorIndex = enemy.index
      }
    }

    if (targetFlags.includes('DefaultMultipleTargets')) {
      if (targetFlags.includes('StartCursorOnEnemyRow')) {
        const enemy = getFirstViableEnemyTarget()
        if (enemy) {
          data.currentTargetGroup = enemy.targetGroup
        }
      } else {
        data.currentTargetGroup =
          window.currentBattle.actors[actorIndex].targetGroup
      }
    }
    if (targetFlags.includes('SingleRowOnly')) {
      if (targetFlags.includes('StartCursorOnEnemyRow')) {
        data.selectionLockedOnEnemyOrPlayer = 'enemy'
      } else {
        data.selectionLockedOnEnemyOrPlayer = 'player'
      }
    } else {
      data.selectionLockedOnEnemyOrPlayer = null
    }
    if (targetFlags.includes('AllRows')) data.currentTargetGroup = -1

    console.log(
      'battlePointer data',
      window.currentBattle.actors[actorIndex],
      targetFlags,
      data
    )
    updatePositionOrtho() // Start
    // TODO - Turn off battle pointer on selection, do this with a callback from calling method
  })
}
const updatePositionOrtho = () => {
  if (window.currentBattle.actors[data.currentTargetActorIndex]) {
    data.battlePointerIsActive = true
    const { x, y } =
      window.currentBattle.actors[data.currentTargetActorIndex].model.userData
        .orthoPosition
    movePointer(
      POINTERS.pointerLeft,
      x + 10,
      window.config.sizing.height - y + 4
    )
  } else {
    POINTERS.pointerLeft.visible = false
    data.battlePointerIsActive = false
  }
}
const selectTargetGroup = delta => {
  const groupTypes = window.currentBattle.formationConfig.targetGroups
  let newIndex = data.currentTargetGroup
  const totalGroups = groupTypes.length
  do {
    console.log('battlePointer selectedTargetGroup: do: START', newIndex, delta)
    newIndex = (newIndex + delta + totalGroups) % totalGroups
    console.log('battlePointer selectedTargetGroup: do: END', newIndex)
  } while (
    data.selectionLockedOnEnemyOrPlayer &&
    groupTypes[newIndex] !== data.selectionLockedOnEnemyOrPlayer
  )
  console.log('battlePointer selectedTargetGroup: END', newIndex)
  data.currentTargetGroup = newIndex
}
const getClosestItemInDirection = (itemsLarge, index, direction) => {
  const items = itemsLarge.map(a => {
    return {
      index: a.index,
      position: new THREE.Vector2(
        a.model.userData.orthoPosition.x,
        a.model.userData.orthoPosition.y
      )
    }
  })
  const currentItem = items.find(item => item.index === index)
  if (!currentItem) return null

  const pi4th = Math.PI / 4
  const angleMap = {
    up: a => a > pi4th * 5 && pi4th * 7 > a,
    right: a => a > pi4th * 3 && pi4th * 5 > a,
    down: a => a > pi4th * 1 && pi4th * 3 > a,
    left: a => a > pi4th * 7 || pi4th * 1 > a
  }

  const calculateAngle = (a, b) =>
    (Math.atan2(a.y - b.y, a.x - b.x) + 2 * Math.PI) % (2 * Math.PI)

  const filterByDirection = item =>
    angleMap[direction](calculateAngle(currentItem.position, item.position))

  const candidates = items.filter(
    item => item.index !== index && filterByDirection(item)
  )

  if (candidates.length === 0) return null

  const result = candidates.reduce((closest, item) => {
    return currentItem.position.distanceToSquared(item.position) <
      currentItem.position.distanceToSquared(closest.position)
      ? item
      : closest
  })
  console.log('battlePointer getClosestItemInDirection: END', result)
  return result.index
}
const selectTargetActor = direction => {
  const targets = allViableTargets()
  const target = getClosestItemInDirection(
    targets,
    data.currentTargetActorIndex,
    direction
  )
  if (target !== null) data.currentTargetActorIndex = target
}
const handleKeyPressTarget = key => {
  console.log('battlePointer handleKeyPressTarget', key)
  switch (key) {
    case KEY.X:
      hide()
      data.selectionPromise({ cancelled: true })
      break

    case KEY.O:
      hide()
      data.selectionPromise({
        target: data.currentSelectionTypeMulti
          ? viableTargetsForGroup(data.currentTargetGroup)
          : [window.currentBattle.actors[data.currentTargetActorIndex]] // Should this be an array of one?
      })
      break

    case KEY.UP:
      if (!data.selectionEnabled) break
      if (!data.currentSelectionTypeMulti) {
        // Single target selection
        selectTargetActor('up')
      }
      break
    case KEY.DOWN:
      if (!data.selectionEnabled) break
      if (!data.currentSelectionTypeMulti) {
        // Single target selection
        selectTargetActor('down')
      }
      break
    case KEY.LEFT:
      if (!data.selectionEnabled) break
      if (data.currentSelectionTypeMulti) {
        selectTargetGroup(1)
      } else {
        // Single target selection
        selectTargetActor('left')
      }
      break
    case KEY.RIGHT:
      if (!data.selectionEnabled) break
      if (data.currentSelectionTypeMulti) {
        selectTargetGroup(-1)
      } else {
        // Single target selection
        selectTargetActor('right')
      }
      break
    case KEY.L1:
    case KEY.R1:
      if (!data.selectionEnabled) break
      if (data.selectionMultiToggleAllowed) {
        if (!data.currentSelectionTypeMulti) {
          // Ensure current multi group from current actor
          data.currentTargetGroup =
            window.currentBattle.actors[
              data.currentTargetActorIndex
            ].targetGroup
        } else {
          // Ensure first actor from current multi group
          const targets = viableTargetsForGroup(data.currentTargetGroup)
          if (targets.length > 0)
            data.currentTargetActorIndex = targets[0].index
        }
        data.currentSelectionTypeMulti = !data.currentSelectionTypeMulti
      }
      break
    default:
      break
  }
}
const getNextItem = (arr, index) =>
  arr[(arr.findIndex(item => item.index === index) + 1) % arr.length]

let cycleCounter = 0
const cycleAndDisplayBattlePointer = () => {
  if (data.currentSelectionTypeMulti) {
    cycleCounter++
    if (cycleCounter > 2) {
      cycleCounter = 0
      const targets = viableTargetsForGroup(data.currentTargetGroup)
      const nextTargetIndex = getNextItem(
        targets,
        data.currentTargetActorIndex
      ).index
      data.currentTargetActorIndex = nextTargetIndex
    }
  }
  updatePositionOrtho()
}
const hide = () => {
  POINTERS.pointerLeft.visible = false
  data.battlePointerIsActive = false
}
const battlePointer = {
  isShow: () => {
    return data.battlePointerIsActive
  },
  show: () => {
    POINTERS.pointerLeft.visible = true
    data.battlePointerIsActive = true
  },
  hide,
  updatePositionOrtho,
  setCurrentActor: id => {
    data.currentTargetActorIndex = id
    updatePositionOrtho()
  },
  startSelection,
  cycleAndDisplayBattlePointer
}
export { battlePointer, handleKeyPressTarget }

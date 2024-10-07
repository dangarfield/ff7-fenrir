const FACING = { IN: 'in', OUT: 'out' }
const battleFormationConfig = {
  // Updated with exe data on load
  row: 2 * 256,
  formations: {
    Normal: {
      // DONE - 99
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.IN, default: FACING.IN }
      }
    },
    Preemptive: {
      // DONE
      message: 50,
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.OUT, default: FACING.IN }
      }
    },
    BackAttack: {
      // DONE 101
      message: 51,
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowSwap: true,
      directions: {
        player: { initial: FACING.OUT, default: FACING.IN },
        enemy: { initial: FACING.IN, default: FACING.IN }
      }
    },
    SideAttack1: {
      // DONE - 511
      message: 52,
      targetGroups: ['player', 'enemy', 'player'],
      playerTargetGroups: [0, 2, 0],
      enemyTargetGroup: 1,
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.OUT, default: FACING.OUT }
      }
    },
    PincerAttack: {
      // DONE
      message: 53,
      targetGroups: ['enemy', 'player', 'enemy'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.OUT, default: FACING.OUT },
        enemy: { initial: FACING.IN, default: FACING.IN }
      }
    },
    SideAttack2: {
      message: 52,
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true, // Appears to be back row?!
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.OUT, default: FACING.OUT }
      }
    },
    SideAttack3: {
      message: 52,
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.OUT, default: FACING.OUT }
      }
    },
    SideAttack4: {
      message: 52,
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.IN, default: FACING.IN }
      }
    },
    NormalLockFrontRow: {
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.IN, default: FACING.IN }
      }
    }
  }
}
const combineBattleFormationConfig = exeFormationData => {
  // Updated from exe-extractor.js in kujata

  for (const battleType of Object.keys(battleFormationConfig.formations)) {
    battleFormationConfig.formations[battleType].positions =
      exeFormationData[battleType].positions
    battleFormationConfig.formations[battleType].positions['1'] = [
      exeFormationData[battleType].positions['3'][1]
    ]
    battleFormationConfig.formations[battleType].rotations =
      exeFormationData[battleType].rotations
  }
  // console.log('FORMATION merged', battleFormationConfig)
}

const showBattleMessageForFormation = () => {
  const message =
    window.data.kernel.battleText[
      battleFormationConfig.formations[
        window.currentBattle.setup.battleLayoutType
      ].message
    ]
  if (message) {
    window.currentBattle.ui.battleText.showBattleMessage(message)
  }
}
export {
  combineBattleFormationConfig,
  battleFormationConfig,
  FACING,
  showBattleMessageForFormation
}

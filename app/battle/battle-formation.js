const p = {
  p0: 0,
  p1: 1 * 256,
  p2: 2 * 256,
  p4: 4 * 256,
  p6: 6 * 256,
  p65: 6.5 * 256,
  p7: 7 * 256,
  p9: 9 * 256,
  p95: 9.5 * 256,
  p10: 10 * 256,
  p14: 14 * 256,
  p18: 18 * 256
}

const FACING = { IN: 'in', OUT: 'out' }

const battleFormationConfig = {
  // Massive guess, need to adjust
  row: p.p2,
  formations: {
    Normal: {
      // DONE - 99
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.IN, default: FACING.IN }
      },
      positions: {
        1: [{ x: p.p0, z: -p.p65 }],
        2: [
          { x: -p.p4, z: -p.p65 },
          { x: p.p4, z: -p.p65 }
        ],
        3: [
          { x: -p.p65, z: -p.p65 },
          { x: p.p0, z: -p.p65 },
          { x: p.p65, z: -p.p65 }
        ]
      }
    },
    Preemptive: {
      // DONE
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.OUT, default: FACING.IN }
      },
      positions: {
        1: [{ x: p.p0, z: -p.p65 }],
        2: [
          { x: -p.p4, z: -p.p65 },
          { x: p.p4, z: -p.p65 }
        ],
        3: [
          { x: -p.p65, z: -p.p65 },
          { x: p.p0, z: -p.p65 },
          { x: p.p65, z: -p.p65 }
        ]
      }
    },
    BackAttack: {
      // DONE 101
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowSwap: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.IN, default: FACING.IN }
      },
      positions: {
        1: [{ x: p.p0, z: -p.p65 }],
        2: [
          { x: -p.p4, z: -p.p65 },
          { x: p.p4, z: -p.p65 }
        ],
        3: [
          { x: -p.p65, z: p.p65 },
          { x: p.p0, z: p.p65 },
          { x: p.p65, z: p.p65 }
        ]
      }
    },
    SideAttack1: {
      // DONE - 511
      targetGroups: ['player', 'enemy', 'player'],
      playerTargetGroups: [0, 2, 0],
      enemyTargetGroup: 1,
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.OUT, default: FACING.OUT }
      },
      positions: {
        1: [{ x: p.p0, z: -p.p10 }],
        2: [
          { x: p.p0, z: -p.p10 },
          { x: p.p0, z: p.p10 }
        ],
        3: [
          { x: -p.p4, z: -p.p10 },
          { x: p.p0, z: p.p10 },
          { x: p.p4, z: -p.p10 }
        ]
      }
    },
    PincerAttack: {
      // DONE
      targetGroups: ['enemy', 'player', 'enemy'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.OUT, default: FACING.OUT },
        enemy: { initial: FACING.IN, default: FACING.IN }
      },
      positions: {
        1: [{ x: p.p0, z: p.p0 }],
        2: [
          { x: -p.p4, z: p.p0 },
          { x: p.p4, z: -p.p2 }
        ],
        3: [
          { x: -p.p6, z: p.p0 },
          { x: p.p0, z: -p.p2 },
          { x: p.p6, z: p.p0 }
        ]
      }
    },
    SideAttack2: {
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true, // Appears to be back row?!
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.OUT, default: FACING.OUT }
      },
      positions: {
        1: [{ x: p.p0, z: -p.p14 }],
        2: [
          { x: p.p0, z: -p.p14 },
          { x: p.p0, z: p.p14 }
        ],
        3: [
          { x: -p.p4, z: -p.p14 },
          { x: p.p0, z: p.p14 },
          { x: p.p4, z: -p.p14 }
        ]
      }
    },
    SideAttack3: {
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.OUT, default: FACING.OUT }
      },
      positions: {
        1: [{ x: p.p0, z: -p.p18 }],
        2: [
          { x: p.p0, z: -p.p18 },
          { x: p.p0, z: p.p18 }
        ],
        3: [
          { x: -p.p4, z: -p.p18 },
          { x: p.p0, z: p.p18 },
          { x: p.p4, z: -p.p18 }
        ]
      }
    },
    SideAttack4: {
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.IN, default: FACING.IN }
      },
      positions: {
        1: [{ x: p.p0, z: p.p10 }],
        2: [
          { x: p.p0, z: p.p10 },
          { x: p.p0, z: -p.p10 }
        ],
        3: [
          { x: -p.p4, z: p.p10 },
          { x: p.p0, z: -p.p10 },
          { x: p.p4, z: p.p10 }
        ]
      }
    },
    NormalLockFrontRow: {
      targetGroups: ['enemy', 'player'],
      playerTargetGroups: [1, 1, 1],
      playerRowLocked: true,
      directions: {
        player: { initial: FACING.IN, default: FACING.IN },
        enemy: { initial: FACING.IN, default: FACING.IN }
      },
      positions: {
        1: [{ x: p.p0, z: -p.p65 }],
        2: [
          { x: -p.p4, z: -p.p65 },
          { x: p.p4, z: -p.p65 }
        ],
        3: [
          { x: -p.p65, z: -p.p65 },
          { x: p.p0, z: -p.p65 },
          { x: p.p65, z: -p.p65 }
        ]
      }
    }
  }
}
export { battleFormationConfig, FACING }

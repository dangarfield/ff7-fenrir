const p = {
  p0: 0,
  p1: 1 * 256,
  p2: 2 * 256,
  p4: 4 * 256,
  p6: 6 * 256,
  p65: 6.5 * 256,
  p7: 7 * 256
}

const battleFormationConfig = {
  // Massive guess, need to adjust
  row: p.p2,
  formations: {
    Normal: {
      // DONE
      playerTargetGroups: [0, 0, 0],
      positions: {
        1: [{ x: p.p0, z: -p.p7 }],
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
      playerTargetGroups: [0, 0, 0],
      positions: {
        1: [{ x: p.p0, z: -p.p7 }],
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
      playerTargetGroups: [0, 0, 0],
      positions: {
        1: [{ x: p.p0, z: -p.p7 }],
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
    SideAttack1: {
      playerTargetGroups: [0, 2, 0],
      enemyTargetGroup: 1,
      positions: {
        1: [{ x: p.p0, z: -p.p7 }],
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
    PincerAttack: {
      // DONE
      targetGroups: ['enemy', 'player', 'enemy'],
      playerTargetGroups: [1, 1, 1],
      positions: {
        1: [{ x: p.p0, z: p.p0 }],
        2: [
          { x: -p.p4, z: p.p0 },
          { x: p.p4, z: -p.p1, faceBackwards: true }
        ],
        3: [
          { x: -p.p6, z: p.p0 },
          { x: p.p0, z: -p.p2, faceBackwards: true },
          { x: p.p6, z: p.p0 }
        ]
      }
    },
    SideAttack2: {
      playerTargetGroups: [0, 0, 0],
      positions: {
        1: [{ x: p.p0, z: -p.p7 }],
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
    SideAttack3: {
      playerTargetGroups: [0, 0, 0],
      positions: {
        1: [{ x: p.p0, z: -p.p7 }],
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
    SideAttack4: {
      playerTargetGroups: [0, 0, 0],
      positions: {
        1: [{ x: p.p0, z: -p.p7 }],
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
    NormalLockFrontRow: {
      playerTargetGroups: [0, 0, 0],
      positions: {
        1: [{ x: p.p0, z: -p.p7 }],
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
export { battleFormationConfig }

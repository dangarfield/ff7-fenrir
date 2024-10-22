const DMG_TYPE = {
  HIT: 'HIT',
  MISS: 'MISS',
  DEATH: 'DEATH',
  RECOVERY: 'RECOVERY'
}
//    +0e [][]     damage flags  (0x0001 - heal, 0x0002 - critical damage, 0x0004 - damage to MP).

const getDefault = () => {
  return {
    amount: 0, // Numerical
    type: DMG_TYPE.HIT, // hit, miss, death, recovery - How does this affects sounds and impact?
    isCritical: false,
    isRestorative: false,
    isMp: false,
    // isBarrier? isFrog? anything else that may affects the impact effect, sound or animation?
    status: {
      add: [],
      removed: []
    }
    // TODO - What happens about calculating absorb values for HP Absorb / MP Absorb after actions etc? Not sure yet
  }
}
// https://github.com/Akari1982/q-gears_reverse/blob/master/ffvii/documents/final_fantasy_vii_battle_mech.txt
// https://wiki.ffrtt.ru/index.php/FF7/Battle/Battle_Mechanics
// https://wiki.ffrtt.ru/index.php/FF7/Battle/Damage_Calculation
const calcDamage = (actor, command, attack, targets) => {
  const isCritical = Math.random() >= 0.5
  const damages = targets.map(t => {
    const d = getDefault()
    d.amount = 0

    if (actor.index === 0) {
      d.type = DMG_TYPE.HIT
      d.amount = isCritical ? 2468 : 1234
      d.isCritical = isCritical
    } else if (actor.index === 1) {
      // d.type = DMG_TYPE.HIT
      d.isRestorative = true
      d.amount = 1234
      d.isMp = true
    } else if (actor.index === 2) {
      d.amount = 123
      d.isMp = true
    } else if (actor.index === 4) {
      // d.type = DMG_TYPE.MISS
      d.amount = 1234
      d.isMp = true
    }
    return d
  })
  return damages
}
const hasStatus = (char, status) => {
  return char?.status?.includes(status)
}
const hasOneOfStatuses = (char, statuses) => {
  return char?.status?.some(status => statuses.includes(status))
}
const addStatus = (char, status) => {
  !char.status.includes(status) && char.status.push(status)
}
const addStatuses = (char, statuses) => {
  statuses.forEach(
    status => !char.status.includes(status) && char.status.push(status)
  )
}
const removeStatus = (char, status) => {
  char.status = char.status.filter(s => s !== status)
}
const removeStatuses = (char, statuses) => {
  char.status = char.status.filter(s => !statuses.includes(s))
}
export {
  calcDamage,
  DMG_TYPE,
  hasStatus,
  hasOneOfStatuses,
  addStatus,
  addStatuses,
  removeStatus,
  removeStatuses
}

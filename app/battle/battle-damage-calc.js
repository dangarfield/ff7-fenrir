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
  }
}
// https://github.com/Akari1982/q-gears_reverse/blob/master/ffvii/documents/final_fantasy_vii_battle_mech.txt
const calcDamage = (actor, command, attack, targets) => {
  const isCritical = Math.random() >= 0.5
  const damages = targets.map(t => {
    const d = getDefault()
    d.amount = 1234
    d.isCritical = isCritical
    return d
  })
  return damages
}
export { calcDamage, DMG_TYPE }
// TODO - Implement all of these
/*
There are seven Primary Stats and seven Derived Stats that make up your
basic character.  The Primary Stats are:
  Str: Strength           Dex: Dexterity
  Vit: Vitality           Mag: Magic
  Spr: Spirit             Lck: Luck
  Lvl: Level

The Derived Stats are:
  Att: Attack             At%: Attack%
  Def: Defense            Df%: Defense%
  MAt: Magic atk          MDf: Magic def
  MD%: Magic def%


The Primary Stats dictate the overall strengths of your character.  Level
dictates exactly how powerful the character is, while the last six stats
round off the character.  Each character has a starting value for their
Primary Stats, and every level, there is a chance that these stats will
be raised by a random number of points.  In addition, it's possible to
further raise these stats permenantly using Sources.


The Derived Stats are based from your Primary Stats and your currently worn
equipment.  They are derived as such:
  Att =  Str      + Weapon Attack Bonus
  At% =             Weapon Attack% Bonus
  Def =  Vit      + Armour Defense Bonus
  Df% = [Dex / 4] + Armour Defense% Bonus
  MAt =  Mag
  MDf =  Spr      + Armour MDefense Bonus
  MD% =             Armour MDefense% Bonus
*/

// Base Stats
const str = player => {
  return player.data.stats.strength + player.data.stats.strengthBonus
}

const getPlayerAttackPower = player => {
  if (player.data == null) return 0 // Check for stack operations
  return 1
}
const getPlayerMagicAttackPower = player => {
  if (player.data == null) return 0 // Check for stack operations
  return 1
}
export { getPlayerAttackPower, getPlayerMagicAttackPower }

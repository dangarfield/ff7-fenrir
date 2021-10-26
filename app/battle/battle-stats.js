const calculateEquipBonus = (stat, items) => {
  let total = 0
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item) {
      if (item.boostedStat1 === stat) {
        total = total + item.boostedStat1Bonus
      }
      if (item.boostedStat2 === stat) {
        total = total + item.boostedStat2Bonus
      }
      if (item.boostedStat3 === stat) {
        total = total + item.boostedStat3Bonus
      }
      if (item.boostedStat4 === stat) {
        total = total + item.boostedStat4Bonus
      }
    }
  }
  console.log('status stat bonus', stat, total)
  return total
}

const getBattleStatsForChar = (char) => {
  const weaponData = window.data.kernel.weaponData[char.equip.weapon.index]
  const armorData = window.data.kernel.armorData[char.equip.armor.index]
  const accessoryData = window.data.kernel.accessoryData[char.equip.accessory.index]
  const equipItems = [weaponData, armorData, accessoryData]

  const strength = char.stats.strength + char.stats.strengthBonus + calculateEquipBonus('Strength', equipItems)
  const dexterity = char.stats.dexterity + char.stats.dexterityBonus + calculateEquipBonus('Dexterity', equipItems)
  const vitality = char.stats.vitality + char.stats.vitalityBonus + calculateEquipBonus('Vitality', equipItems)
  const magic = char.stats.magic + char.stats.magicBonus + calculateEquipBonus('Magic', equipItems)
  const spirit = char.stats.spirit + char.stats.spiritBonus + calculateEquipBonus('Spirit', equipItems)
  const luck = char.stats.luck + char.stats.luckBonus + calculateEquipBonus('Luck', equipItems)

  const attack = strength + weaponData.attackStrength
  const attackPercent = weaponData.accuracyRate
  const defense = vitality + armorData.defense
  const defensePercent = armorData.evade // wrong
  const magicAttack = magic // ???
  const magicDefense = spirit + armorData.magicDefense
  const magicDefensePercent = armorData.magicEvade

  // TODO - boosted stats
  return {
    strength,
    dexterity,
    vitality,
    magic,
    spirit,
    luck,

    attack,
    attackPercent,
    defense,
    defensePercent,
    magicAttack,
    magicDefense,
    magicDefensePercent
  }
}

export {
  getBattleStatsForChar
}

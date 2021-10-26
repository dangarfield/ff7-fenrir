const calculateEquipBonus = (stat, items, materias) => {
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
  for (let i = 0; i < materias.length; i++) {
    const materia = materias[i]
    for (let j = 0; j < materia.equipEffect.length; j++) {
      const equipEffect = materia.equipEffect[j]
      if (equipEffect[0] === stat) {
        total = total + equipEffect[1]
      }
    }
  }
  //   console.log('status stat bonus', stat, total)
  return total
}

const getBattleStatsForChar = (char) => {
  const weaponData = window.data.kernel.weaponData[char.equip.weapon.index]
  const armorData = window.data.kernel.armorData[char.equip.armor.index]
  const accessoryData = window.data.kernel.accessoryData[char.equip.accessory.index]
  const equippedItems = [weaponData, armorData, accessoryData]
  const equippedMateria = []
  for (const materiaSlot in char.materia) {
    if (char.materia[materiaSlot].id !== 255) {
      equippedMateria.push(window.data.kernel.materiaData[char.materia[materiaSlot].id])
    }
  }

  const strength = char.stats.strength + char.stats.strengthBonus + calculateEquipBonus('Strength', equippedItems, equippedMateria)
  const dexterity = char.stats.dexterity + char.stats.dexterityBonus + calculateEquipBonus('Dexterity', equippedItems, equippedMateria)
  const vitality = char.stats.vitality + char.stats.vitalityBonus + calculateEquipBonus('Vitality', equippedItems, equippedMateria)
  const magic = char.stats.magic + char.stats.magicBonus + calculateEquipBonus('Magic', equippedItems, equippedMateria)
  const spirit = char.stats.spirit + char.stats.spiritBonus + calculateEquipBonus('Spirit', equippedItems, equippedMateria)
  const luck = char.stats.luck + char.stats.luckBonus + calculateEquipBonus('Luck', equippedItems, equippedMateria)

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

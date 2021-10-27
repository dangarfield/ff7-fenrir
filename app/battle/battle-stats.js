const calculateEquipBonus = (stat, items, materias) => {
  let total = 0
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item) {
      for (let j = 0; j < item.boostedStats.length; j++) {
        if (item.boostedStats[j].stat === stat) {
          // total = total + item.boostedStats[j].value
        }
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
const calculateElementEquip = (elements, items, materias) => {
  // weapon
  addNoDuplicates(elements.attack, items[0].elements)
  // armor
  if (items[1].elements.length > 0) {
    if (items[1].elementDamageModifier === 'Halve') {
      addNoDuplicates(elements.halve, items[1].elements)
    } else if (items[1].elementDamageModifier === 'Invalid') {
      addNoDuplicates(elements.invalid, items[1].elements)
    } else if (items[1].elementDamageModifier === 'Absorb') {
      addNoDuplicates(elements.absorb, items[1].elements)
    }
  }
  // accessory
  if (items[2] && items[2].elements && items[2].elements.length > 0) {
    if (items[2].elementDamageModifier === 'Halve') {
      addNoDuplicates(elements.halve, items[2].elements)
    } else if (items[2].elementDamageModifier === 'Invalid') {
      addNoDuplicates(elements.invalid, items[2].elements)
    } else if (items[2].elementDamageModifier === 'Absorb') {
      addNoDuplicates(elements.absorb, items[2].elements)
    }
  }

  // Materia
  // TODO
}
const addNoDuplicates = (arr1, arr2) => {
  for (let i = 0; i < arr2.length; i++) {
    const v = arr2[i]
    if (!arr1.includes(v)) {
      arr1.push(v)
    }
  }
}
const getBattleStatsForChar = (char) => {
  char.equip.weapon.index = 15
  char.equip.weapon.name = 'Ultima Weapon'
  char.equip.armor.index = 29
  char.equip.armor.name = 'Ziedrich'
  char.equip.accessory.index = 29
  char.equip.accessory.name = 'Water Ring'

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

  const elements = { attack: [], halve: [], invalid: [], absorb: [] }
  calculateElementEquip(elements, equippedItems, equippedMateria)

  console.log('status getBattleStatsForChar', char, elements)
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
    magicDefensePercent,

    elements
  }
}

export {
  getBattleStatsForChar
}

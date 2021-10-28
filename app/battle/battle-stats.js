const calculateEquipBonus = (stat, items, materias) => {
  let total = 0
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item) {
      for (let j = 0; j < item.boostedStats.length; j++) {
        if (item.boostedStats[j].stat === stat) {
          total = total + item.boostedStats[j].value
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
  console.log('status stat bonus', stat, total)
  return total
}
const calculateElementEquip = (elements, items, materia) => {
  // weapon
  addNoDuplicates(elements.attack, items[0].elements)
  // armor
  if (items[1].elements.length > 0) {
    if (items[1].elementDamageModifier === 'Halve') {
      addNoDuplicates(elements.halve, items[1].elements)
    } else if (items[1].elementDamageModifier === 'Nullify') {
      addNoDuplicates(elements.invalid, items[1].elements)
    } else if (items[1].elementDamageModifier === 'Absorb') {
      addNoDuplicates(elements.absorb, items[1].elements)
    }
  }
  // accessory
  if (items[2] && items[2].elements && items[2].elements.length > 0) {
    if (items[2].elementDamageModifier === 'Halve') {
      addNoDuplicates(elements.halve, items[2].elements)
    } else if (items[2].elementDamageModifier === 'Nullify') {
      addNoDuplicates(elements.invalid, items[2].elements)
    } else if (items[2].elementDamageModifier === 'Absorb') {
      addNoDuplicates(elements.absorb, items[2].elements)
    }
  }

  // Materia
  const equipment = [
    {item: items[0], type: 'weapon'},
    {item: items[1], type: 'armor'}
  ]
  const elementalMateriaData = window.data.kernel.materiaData.filter(m => m.name === 'Elemental')[0]
  for (let i = 0; i < equipment.length; i++) {
    const item = equipment[i].item
    const type = equipment[i].type

    for (let j = 0; j < item.materiaSlots.length; j++) {
      const slot = item.materiaSlots[j]
      if (slot.includes('LinkedSlot')) {
        // check if this slot has an elemental materia
        const slotMateria = materia[`${type}Materia${j + 1}`]

        // console.log('status linked slot', type, j, slot, slotMateria)
        if (slotMateria.name && slotMateria.name === 'Elemental') {
          let attachedMateria
          if (slot.includes('Left')) {
            attachedMateria = materia[`${type}Materia${j + 2}`]
          } else {
            attachedMateria = materia[`${type}Materia${j}`]
          }
          // console.log('status IS elemental - attached:', attachedMateria)

          // if this has a materia, check it's ap and elements
          if (attachedMateria.name) {
            let elementModifier
            if (type === 'weapon') {
              elementModifier = 'attack'
            } else {
              if (slotMateria.ap >= elementalMateriaData.level3Ap) {
                elementModifier = 'absorb'
              } else if (slotMateria.ap >= elementalMateriaData.level2Ap) {
                elementModifier = 'invalid'
              } else {
                elementModifier = 'halve'
              }
            }
            const attachedMateriaElements = [window.data.kernel.materiaData[attachedMateria.id].element]
            console.log('status elemental ap', slotMateria.ap, elementalMateriaData.level3Ap, elementalMateriaData.level2Ap, elementModifier, elements[elementModifier], attachedMateriaElements)

            addNoDuplicates(elements[elementModifier], attachedMateriaElements)
          }
        }
      }
    }
  }
}

const calculateStatusEquip = (statusEffects, items, materia) => {
  // weapon
  addNoDuplicates(statusEffects.attack, items[0].status)
  // armor
  if (items[1].status.length > 0) {
    addNoDuplicates(statusEffects.defend, items[1].status)
  }
  // acc
  if (items[2] && items[2].status && items[2].status.length > 0) {
    addNoDuplicates(statusEffects.defend, items[2].status)
  }
  console.log('status calculateStatusEquip', statusEffects, items)
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
  // Temp data override
  char.equip.weapon.index = 15
  char.equip.weapon.name = 'Ultima Weapon'
  char.equip.armor.index = 27
  char.equip.armor.name = 'Escort Guard'
  // char.equip.accessory.index = 29
  // char.equip.accessory.name = 'Water Ring'
  char.equip.accessory.index = 18
  char.equip.accessory.name = 'Ribbon'
  window.data.savemap.characters.Cloud.materia.armorMateria1 = {id: 29, ap: 60000, name: 'Elemental', description: 'Adds Materia element to equiped weapon or armor'}
  window.data.savemap.characters.Cloud.materia.armorMateria2 = {id: 83, ap: 8000, name: 'Alexander', description: 'Summons Alexander'}

  window.data.savemap.characters.Cloud.materia.weaponMateria3 = {id: 83, ap: 8000, name: 'Alexander', description: 'Summons Alexander'}
  window.data.savemap.characters.Cloud.materia.weaponMateria4 = {id: 29, ap: 60000, name: 'Elemental', description: 'Adds Materia element to equiped weapon or armor'}

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
  const defensePercent = Math.round(dexterity / 4) + armorData.evade // wrong
  const magicAttack = magic // ???
  const magicDefense = spirit + armorData.magicDefense
  const magicDefensePercent = armorData.magicEvade

  const elements = { attack: [], halve: [], invalid: [], absorb: [] }
  calculateElementEquip(elements, equippedItems, char.materia)

  const statusEffects = { attack: [], defend: [] }
  calculateStatusEquip(statusEffects, equippedItems, char.materia)

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

    elements,
    statusEffects
  }
}

export {
  getBattleStatsForChar
}

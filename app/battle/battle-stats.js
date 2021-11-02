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
  // console.log('status stat bonus', stat, total)
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
  // Haste, not able to attack, slow / stop?
  // Time with added effect? Levels of ap apply slow or stop?!
  // Frog or small with transform?

  const validStatusToApply = ['Death', 'Sleep', 'Poison', 'Sadness', 'Fury', 'Confusion', 'Silence', 'Slow', 'Stop',
    'Frog', 'Small', 'SlowNumb', 'Petrify', 'DeathSentence', 'Berserk', 'Paralysis', 'Darkness']

  // weapon
  addNoDuplicates(statusEffects.attack, removeInvalidStatusEffect(items[0].status, validStatusToApply))
  // armor
  if (items[1].status.length > 0) {
    addNoDuplicates(statusEffects.defend, removeInvalidStatusEffect(items[1].status, validStatusToApply))
  }
  // acc
  if (items[2] && items[2].status && items[2].status.length > 0) {
    addNoDuplicates(statusEffects.defend, removeInvalidStatusEffect(items[2].status, validStatusToApply))
  }
  // Materia
  const equipment = [
    {item: items[0], type: 'weapon'},
    {item: items[1], type: 'armor'}
  ]
  const addedEffectMateriaData = window.data.kernel.materiaData.filter(m => m.name === 'Added Effect')[0]

  for (let i = 0; i < equipment.length; i++) {
    const item = equipment[i].item
    const type = equipment[i].type

    for (let j = 0; j < item.materiaSlots.length; j++) {
      const slot = item.materiaSlots[j]
      if (slot.includes('LinkedSlot')) {
        // check if this slot has an elemental materia
        const slotMateria = materia[`${type}Materia${j + 1}`]

        console.log('status status linked slot', type, j, slot, slotMateria)
        if (slotMateria.name && slotMateria.name === 'Added Effect') {
          let attachedMateria
          if (slot.includes('Left')) {
            attachedMateria = materia[`${type}Materia${j + 2}`]
          } else {
            attachedMateria = materia[`${type}Materia${j}`]
          }
          // console.log('status IS added effect - attached:', attachedMateria)

          // if this has a materia, check it's ap and elements
          if (attachedMateria.name) {
            let elementModifier
            if (type === 'weapon') {
              elementModifier = 'attack'
            } else {
              elementModifier = 'defend'
            }
            const attachedMateriaStatusEffects = window.data.kernel.materiaData[attachedMateria.id].status
            console.log('status status ap', slotMateria.ap, addedEffectMateriaData.level3Ap, addedEffectMateriaData.level2Ap, elementModifier, statusEffects[elementModifier], attachedMateriaStatusEffects)

            addNoDuplicates(statusEffects[elementModifier], removeInvalidStatusEffect(attachedMateriaStatusEffects, validStatusToApply))
          }
        }
      }
    }
  }
  // TODO - Not all statuses have an added effect applied in game, eg weapon with addedEffect+Kujata = Barrier MBarrier Reflect, but nothing shows in game

  console.log('status calculateStatusEquip', statusEffects, items)
}
const removeInvalidStatusEffect = (arr1, arr2) => {
  const newArr = []
  for (let i = 0; i < arr1.length; i++) {
    const v = arr1[i]
    if (arr2.includes(v)) {
      newArr.push(v)
    }
  }
  return newArr
}
const addNoDuplicates = (arr1, arr2) => {
  for (let i = 0; i < arr2.length; i++) {
    const v = arr2[i]
    if (!arr1.includes(v)) {
      arr1.push(v)
    }
  }
}
const calculateHPMP = (char) => {
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
  const hp = {
    current: char.stats.hp.current,
    max: Math.trunc(char.stats.hp.base * ((100 + calculateEquipBonus('HP', equippedItems, equippedMateria)) / 100))
  }
  if (hp.current > hp.max) {
    hp.current = hp.max
  }
  const mp = {
    current: char.stats.mp.current,
    max: Math.trunc(char.stats.mp.base * ((100 + calculateEquipBonus('MP', equippedItems, equippedMateria)) / 100))
  }
  if (mp.current > mp.max) {
    mp.current = mp.max
  }
  return {hp, mp}
}

const recalculateAndApplyHPMPToAll = () => {
  const names = Object.keys(window.data.savemap.characters)
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    recalculateAndApplyHPMP(window.data.savemap.characters[name])
  }
}
const recalculateAndApplyHPMP = (char) => {
  const {hp, mp} = calculateHPMP(char)
  char.stats.hp.current = hp.current
  char.stats.hp.max = hp.max
  char.stats.mp.current = mp.current
  char.stats.mp.max = mp.max
}
const getMenuOptions = (char) => {
  // console.log('status getMenuOptions')
  const addMenuOption = (all, choiceName) => {
    const choice = CHOICES.filter(c => c.name === choiceName)[0]
    all.push(choice)
  }
  const sortAndFilterCommands = (all) => {
    // Command materia is actually just the order that the materia is on equipment...

    let all2 = [...all]
    if (all2.filter(c => c.name === 'Mug').length > 0) {
      all2 = all2.filter(c => c.name !== 'Steal')
    }
    if (all2.filter(c => c.name === 'Coin').length > 0) {
      all2 = all2.filter(c => c.name !== 'Throw')
    }
    // console.log('status sortAndFilterCommands start', all2, all2.filter(c => c.name === 'Mug'), all2.filter(c => c.name !== 'Steal'))
    const filtered = []
    const types = {}
    for (let i = 0; i < all2.length; i++) {
      const cmd = all2[i]
      if (!(cmd.type in types)) {
        types[cmd.type] = []
      }
      types[cmd.type].push(cmd)
    }
    // console.log('status sortAndFilterCommands type', types)
    const oneOfTypes = ['Item', 'Attack', 'Magic', 'Summon']
    for (let i = 0; i < oneOfTypes.length; i++) {
      const oneOfType = oneOfTypes[i]
      if (types[oneOfType]) {
        if (oneOfType === 'Attack') {
          filtered.push(types[oneOfType][types[oneOfType].length - 1])
        } else {
          types[oneOfType].sort((a, b) => b.order - a.order)
          filtered.push(types[oneOfType][0])
          console.log('status oneOftype', oneOfType, types[oneOfType])
        }
      }
    }
    if (types['Command']) {
      for (let i = 0; i < types['Command'].length; i++) {
        const cmd = types['Command'][i]
        console.log('status command', cmd)
        if (!filtered.includes(cmd)) {
          filtered.push(cmd)
        }
      }
    }
    const itemChoice = filtered.shift()
    while (filtered.length < 3) {
      filtered.push({name: '', type: 'Empty', order: 39})
    }
    filtered.splice(3, 0, itemChoice)
    // console.log('status sortAndFilterCommands end', filtered, all, all2)
    all.length = 0
    for (let i = 0; i < filtered.length; i++) {
      all.push(filtered[i])
    }
  }
  const CHOICES = [

    {name: 'Item', type: 'Item', order: 0},
    {name: 'W-Item', type: 'Item', order: 1},

    {name: 'Attack', type: 'Attack', order: 10},
    {name: '2x-Cut', type: 'Attack', order: 12},
    {name: '4x-Cut', type: 'Attack', order: 13},
    {name: 'Slash-All', type: 'Attack', order: 14},
    {name: 'Flash', type: 'Attack', order: 15},
    {name: 'Limit', type: 'Attack', order: 16},

    {name: 'Magic', type: 'Magic', order: 20},
    {name: 'W-Magic', type: 'Magic', order: 21},

    {name: 'Summon', type: 'Summon', order: 30},
    {name: 'W-Sum.', type: 'Summon', order: 31},

    {name: 'Steal', type: 'Command', order: 50},
    {name: 'Mug', type: 'Command', order: 11},
    {name: 'Sense', type: 'Command', order: 51},
    {name: 'Coin', type: 'Command', order: 52},
    {name: 'Throw', type: 'Command', order: 53},
    {name: 'Morph', type: 'Command', order: 54},
    {name: 'D.blow', type: 'Command', order: 55},
    {name: 'Manip.', type: 'Command', order: 56},
    {name: 'Mime', type: 'Command', order: 57},
    {name: 'E.Skill', type: 'Command', order: 58},

    {name: 'Change', type: 'Change', order: 60},

    {name: 'Defend', type: 'Defend', order: 70},

    {name: 'Left', type: '?', order: 80}
  ]

  const command = []
  const magic = []
  const summon = []

  addMenuOption(command, 'Attack')
  addMenuOption(command, 'Item')

  for (const materiaSlot in char.materia) {
    const materia = char.materia[materiaSlot]
    if (materia.id !== 255) {
      const materiaData = window.data.kernel.materiaData[char.materia[materiaSlot].id]
      if (materiaData.type === 'Magic') {
        addMenuOption(command, 'Magic')
        magic.push(materiaData) // TODO - improve this, eg, master magic, support links etc
      }
      if (materiaData.type === 'Summon') {
        addMenuOption(command, 'Summon')
        summon.push(materiaData) // TODO - improve this, eg, master magic, support links etc
      }
      if (materiaData.name === 'Mega All') {
        addMenuOption(command, 'Slash-All')
      }
      if (materiaData.type === 'Command') {
        if (materiaData.name === 'Steal') {
          if (materiaData.name === 'Double Cut') {
            if (materia.ap >= materiaData.level2Ap) {
              addMenuOption(command, '4x-Cut')
            } else {
              addMenuOption(command, '2x-Cut')
            }
          }
          if (materiaData.name === 'Slash-All') {
            if (materia.ap >= materiaData.level2Ap) {
              addMenuOption(command, 'Flash')
            } else {
              addMenuOption(command, 'Slash-All')
            }
          }
          if (materia.ap >= materiaData.level2Ap) {
            addMenuOption(command, 'Mug')
          } else {
            addMenuOption(command, 'Steal')
          }
        }
        if (materiaData.name === 'Throw') {
          if (materia.ap >= materiaData.level2Ap) {
            addMenuOption(command, 'Coin')
          } else {
            addMenuOption(command, 'Throw')
          }
        }
        if (materiaData.name === 'Sense') { addMenuOption(command, 'Sense') }
        if (materiaData.name === 'Morph') { addMenuOption(command, 'Morph') }
        if (materiaData.name === 'Deathblow') { addMenuOption(command, 'D.blow') }
        if (materiaData.name === 'Manipulate') { addMenuOption(command, 'Manip.') }
        if (materiaData.name === 'Mime') { addMenuOption(command, 'Mime') }
        if (materiaData.name === 'Enemy Skill') { addMenuOption(command, 'E.Skill') }
        if (materiaData.name === 'W-Item') { addMenuOption(command, 'W-Item') }
        if (materiaData.name === 'W-Magic') { addMenuOption(command, 'W-Magic') }
        if (materiaData.name === 'W-Summon') { addMenuOption(command, 'W-Sum.') }
        if (materiaData.name === 'Master Command') {
          addMenuOption(command, 'Steal')
          addMenuOption(command, 'Sense')
          addMenuOption(command, 'Coin')
          addMenuOption(command, 'Morph')
          addMenuOption(command, 'D.blow')
          addMenuOption(command, 'Manip.')
          addMenuOption(command, 'Mime')
        }
      }
    }
  }
  sortAndFilterCommands(command)
  const menu = {command, magic, summon}
  console.log('status menu', menu)

  return menu
}
const setEquipmentAndMateriaForTesting = (char, weaponName, armorName, accessoryName, weaponMat, armorMat) => {
  const ap = 40000
  const weaponData = window.data.kernel.weaponData.filter(m => m.name === weaponName)[0]
  char.equip.weapon.index = weaponData.itemId - 128
  char.equip.weapon.name = weaponData.name
  const armorData = window.data.kernel.armorData.filter(m => m.name === armorName)[0]
  char.equip.armor.index = armorData.itemId - 256
  char.equip.armor.name = armorData.name
  if (accessoryName === '') {
    char.equip.accessory.index = 255
    delete char.equip.accessory.name
  } else {
    const accessoryData = window.data.kernel.accessoryData.filter(m => m.name === accessoryName)[0]
    char.equip.accessory.index = accessoryData.itemId - 128
    char.equip.accessory.name = accessoryData.name
  }

  for (let i = 0; i < weaponMat.length; i++) {
    const materiaName = weaponMat[i]
    if (materiaName.length > 0) {
      const materia = window.data.kernel.materiaData.filter(m => m.name === materiaName)[0]
      char.materia[`weaponMateria${i + 1}`] = {id: materia.index, ap: ap, name: materia.name, description: materia.description}
    } else {
      char.materia[`weaponMateria${i + 1}`] = {id: 255, ap: 16777215}
    }
  }
  for (let i = 0; i < armorMat.length; i++) {
    const materiaName = armorMat[i]
    if (materiaName.length > 0) {
      const materia = window.data.kernel.materiaData.filter(m => m.name === materiaName)[0]
      char.materia[`armorMateria${i + 1}`] = {id: materia.index, ap: ap, name: materia.name, description: materia.description}
    } else {
      char.materia[`weaponMateria${i + 1}`] = {id: 255, ap: 16777215}
    }
  }
}
const getBattleStatsForChar = (char) => {
  // Temp equipment and materia override for testing
  setEquipmentAndMateriaForTesting(
    char,
    'Ultima Weapon', 'Escort Guard', '',
    ['', '', ''],
    ['Fire', 'Steal', 'Master Command', 'Steal']
  )

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

  const {hp, mp} = calculateHPMP(char)
  const strength = char.stats.strength + char.stats.strengthBonus + calculateEquipBonus('Strength', equippedItems, equippedMateria)
  const dexterity = char.stats.dexterity + char.stats.dexterityBonus + calculateEquipBonus('Dexterity', equippedItems, equippedMateria)
  const vitality = char.stats.vitality + char.stats.vitalityBonus + calculateEquipBonus('Vitality', equippedItems, equippedMateria)
  const magic = char.stats.magic + char.stats.magicBonus + calculateEquipBonus('Magic', equippedItems, equippedMateria)
  const spirit = char.stats.spirit + char.stats.spiritBonus + calculateEquipBonus('Spirit', equippedItems, equippedMateria)
  const luck = char.stats.luck + char.stats.luckBonus + calculateEquipBonus('Luck', equippedItems, equippedMateria)

  const attack = strength + weaponData.attackStrength
  const attackPercent = weaponData.accuracyRate
  const defense = vitality + armorData.defense
  const defensePercent = Math.trunc(dexterity / 4) + armorData.evade // wrong
  const magicAttack = magic // ???
  const magicDefense = spirit + armorData.magicDefense
  const magicDefensePercent = armorData.magicEvade

  const elements = { attack: [], halve: [], invalid: [], absorb: [] }
  calculateElementEquip(elements, equippedItems, char.materia)

  const statusEffects = { attack: [], defend: [] }
  calculateStatusEquip(statusEffects, equippedItems, char.materia)
  console.log('status getBattleStatsForChar', char, hp, mp)

  const menu = getMenuOptions(char)

  // TODO - boosted stats
  return {
    hp,
    mp,
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
    statusEffects,

    menu
  }
}
export {
  recalculateAndApplyHPMPToAll,
  recalculateAndApplyHPMP,
  getBattleStatsForChar
}

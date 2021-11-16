import { dec2bin } from '../helpers/helpers.js'

const groupStatBonuses = (items, materias) => {
  const stats = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item) {
      for (let j = 0; j < item.boostedStats.length; j++) {
        const boost = item.boostedStats[j]
        stats.push({stat: boost.stat, value: boost.value, type: 'amount'})
      }
    }
  }
  for (const materiaSlot in materias) {
    const materia = materias[materiaSlot]
    if (materia.id !== 255) {
      const materiaData = window.data.kernel.materiaData.filter(a => a.index === materia.id)[0]
      for (let j = 0; j < materiaData.equipEffect.length; j++) {
        const equipEffect = materiaData.equipEffect[j]
        stats.push({stat: equipEffect[0], value: equipEffect[1], type: equipEffect[0] === 'HP' || equipEffect[0] === 'MP' ? 'percent' : 'amount'})
      }

      if (materiaData.type === 'Independent' && materiaData.attributes.type === 'StatBoost') {
        const currentLevel = currentMateriaLevel(materiaData, materia.ap)
        stats.push({stat: materiaData.attributes.stat, value: materiaData.attributes.attributes[Math.min(currentLevel - 1, materiaData.attributes.attributes.length - 1)], type: 'percent'})
      }
    }
  }

  // console.log('status stat bonus', stat, total)
  return stats
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
  const elementalMateriaData = window.data.kernel.materiaData.filter(a => a.attributes.type === 'Elemental')[0]
  for (let i = 0; i < equipment.length; i++) {
    const item = equipment[i].item
    const type = equipment[i].type

    for (let j = 0; j < item.materiaSlots.length; j++) {
      const slot = item.materiaSlots[j]
      if (slot.includes('LinkedSlot')) {
        // check if this slot has an elemental materia
        const slotMateria = materia[`${type}Materia${j + 1}`]

        console.log('status linked slot', type, j, slot, slotMateria)
        if (slotMateria.id === elementalMateriaData.index) {
          let attachedMateria
          if (slot.includes('Left')) {
            attachedMateria = materia[`${type}Materia${j + 2}`]
          } else {
            attachedMateria = materia[`${type}Materia${j}`]
          }
          console.log('status IS elemental - attached:', attachedMateria)

          // if this has a materia, check it's ap and elements
          if (attachedMateria.name) {
            let elementModifier
            if (type === 'weapon') {
              elementModifier = 'attack'
            } else {
              const materiaLevel = currentMateriaLevel(elementalMateriaData, slotMateria.ap)
              console.log('status elemental materia level', materiaLevel, elementalMateriaData, slotMateria.ap)
              if (materiaLevel === 1) {
                elementModifier = 'halve'
              } else if (materiaLevel === 2) {
                elementModifier = 'invalid'
              } else {
                elementModifier = 'absorb'
              }
            }
            const attachedMateriaElements = [window.data.kernel.materiaData[attachedMateria.id].element]
            // console.log('status elemental ap', slotMateria.ap, elementModifier, elements[elementModifier], attachedMateriaElements)

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
  const addedEffectMateriaData = window.data.kernel.materiaData.filter(m => m.attributes.type === 'AddedEffect')[0]

  for (let i = 0; i < equipment.length; i++) {
    const item = equipment[i].item
    const type = equipment[i].type

    for (let j = 0; j < item.materiaSlots.length; j++) {
      const slot = item.materiaSlots[j]
      if (slot.includes('LinkedSlot')) {
        // check if this slot has an elemental materia
        const slotMateria = materia[`${type}Materia${j + 1}`]

        console.log('status status linked slot', type, j, slot, slotMateria)
        if (slotMateria.id && addedEffectMateriaData.index) {
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
            console.log('status status ap', slotMateria.ap, elementModifier, statusEffects[elementModifier], attachedMateriaStatusEffects)

            addNoDuplicates(statusEffects[elementModifier], removeInvalidStatusEffect(attachedMateriaStatusEffects, validStatusToApply))
          }
        }
      }
    }
  }
  // TODO - Not all statuses have an added effect applied in game, eg weapon with addedEffect+Kujata = Barrier MBarrier Reflect, but nothing shows in game

  console.log('status calculateStatusEquip', statusEffects, items)
}
const currentMateriaLevel = (materiaData, currentAP) => {
  let level = 0
  for (let i = 0; i < materiaData.apLevels.length; i++) {
    const apForLevel = materiaData.apLevels[i]
    if (currentAP >= apForLevel) {
      level++
    } else {
      return level
    }
  }
  return level
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
const hasMPHPMateria = (char) => {
  const hpMPMateriaData = window.data.kernel.materiaData.filter(m => m.attributes.type && m.attributes.type === 'HP<->MP')[0]
  for (const materiaSlot in char.materia) {
    const materia = char.materia[materiaSlot]
    if (materia.id === hpMPMateriaData.index) {
      return true
    }
  }
  return false
}
const getEnemySkillFlags = (ap) => {
// This is a little tricky and should probably be done else, but keep it here for now.
  // Basically ap is 3 bytes, 1st byte contains the first 8 spell flags from LSB to MSB, but because I store the ap as single int, it's a pain
  const flags = dec2bin(ap).padStart(24, '0').match(/[\s\S]{1,8}/g).map(s => s.split('').reverse().join('')).join('').split('').map(s => s === '1')
  return flags
}
const populateAllEnemySkillsList = () => {
  // I assume there is a more kernel oriented way of getting this
  const s = []
  for (let i = 72; i <= 95; i++) {
    s.push({
      index: i,
      name: window.data.kernel.attackData[i].name,
      enabled: false,
      addedAbilities: []
    })
  }
  return s
}
const getEnemySkillFlagsWithSkills = (ap) => {
  const flags = getEnemySkillFlags(ap)
  const skills = populateAllEnemySkillsList()
  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i]
    delete skill.addedAbilities
    skill.enabled = flags[i]
  }
  return skills
}
const calculateHPMP = (char, statBonuses) => {
  // Calc max HP MP
  const hpBonusAmount = statBonuses.filter(s => s.type === 'percent' && s.stat === 'HP').map(s => s.value).reduce((a, b) => a + b, 100)
  const hp = {
    current: char.stats.hp.current ? char.stats.hp.current : char.stats.hp.base,
    max: Math.min(9999, Math.trunc(char.stats.hp.base * (hpBonusAmount / 100)))
  }

  // console.log('status HP', char.stats.hp.base, hpBonusAmount, hp, char, statBonuses.filter(s => s.type === 'percent' && s.stat === 'HP'))
  const mpBonusAmount = statBonuses.filter(s => s.type === 'percent' && s.stat === 'MP').map(s => s.value).reduce((a, b) => a + b, 100)
  const mp = {
    current: char.stats.mp.current ? char.stats.mp.current : char.stats.mp.base,
    max: Math.min(999, Math.trunc(char.stats.mp.base * (mpBonusAmount / 100)))
  }
  // Swap max if required
  if (hasMPHPMateria(char)) {
    const hpTemp = hp.max
    hp.max = mp.max
    mp.max = hpTemp
  }

  // Ensure current <= max
  if (hp.current > hp.max) {
    hp.current = hp.max
  }
  if (mp.current > mp.max) {
    mp.current = mp.max
  }
  // hp.current = hp.max
  // mp.current = mp.max
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
  const weaponData = window.data.kernel.weaponData[char.equip.weapon.index]
  const armorData = window.data.kernel.armorData[char.equip.armor.index]
  const accessoryData = window.data.kernel.accessoryData[char.equip.accessory.index]
  const equippedItems = [weaponData, armorData, accessoryData]
  const statBonuses = groupStatBonuses(equippedItems, char.materia)

  const {hp, mp} = calculateHPMP(char, statBonuses)
  char.stats.hp.current = hp.current
  char.stats.hp.max = hp.max
  char.stats.mp.current = mp.current
  char.stats.mp.max = mp.max
}
const getMenuOptions = (char) => {
  // console.log('status getMenuOptions')
  const addMenuOption = (all, choice) => {
    const materiaData = window.data.kernel.materiaData.filter(a => a.name && a.attributes.menu && a.attributes.type === 'Add' && a.attributes.menu.length > 0 && a.attributes.menu.filter(m => m.id === choice.id).length > 0)[0]
    const moreThanOneChoice = materiaData.attributes.menu.length > 1

    if (!moreThanOneChoice) {
      // if only one choice, add if not present
      const choiceIsInList = all.filter(a => a.id === choice.id).length > 0
      if (!choiceIsInList) {
        all.push({...choice})
      }
    } else {
      const firstChoiceSelected = materiaData.attributes.menu[0].id === choice.id
      const choice1IsInList = all.filter(a => a.id === materiaData.attributes.menu[0].id).length > 0
      const choice2IsInList = all.filter(a => a.id === materiaData.attributes.menu[1].id).length > 0

      // if two choice, 1st choice is selected, 1st is not in list, 2nd is not in list = Add
      if (firstChoiceSelected && !choice1IsInList && !choice2IsInList) {
        all.push({...choice})
      }
      // if two choice, 1st choice is selected, 1st is in list    , 2nd is not in list = No Add
      // if two choice, 1st choice is selected, 1st is not in list, 2nd is in list     = No Add
      // if two choice, 1st choice is selected, 1st is in list    , 2nd is in list     = No Add  // Bad

      // if two choice, 2nd choice is selected, 1st is not in list, 2nd is not in list = Add
      if (!firstChoiceSelected && !choice1IsInList && !choice2IsInList) {
        all.push({...choice})
      }
      // if two choice, 2nd choice is selected, 1st is in list    , 2nd is not in list = Replace 1st with 2nd
      if (!firstChoiceSelected && choice1IsInList && !choice2IsInList) {
        replaceMenuOption(all, materiaData.attributes.menu[0].id, choice)
      }
      // if two choice, 2nd choice is selected, 1st is not in list, 2nd is in list     = No Add
      // if two choice, 2nd choice is selected, 1st is in list    , 2nd is in list     = No Add // Bad
    }
  }
  const replaceMenuOption = (all, replaceChoiceId, withChoice) => {
    for (let i = 0; i < all.length; i++) {
      const choice = all[i]

      if (replaceChoiceId <= 4) {
        // Replace type
        if (choice.type === replaceChoiceId) {
          choice.id = withChoice.id
          choice.name = withChoice.name
        }
      } else {
        // Replace choice
        if (choice.id === replaceChoiceId) {
          choice.id = withChoice.id
          choice.name = withChoice.name
        }
      }
    }
  }
  const removeMenuOption = (all, choiceId) => {
    for (let i = 0; i < all.length; i++) {
      const choice = all[i]
      if (choice.id === choiceId) {
        all.splice(i, 1)
        break
      }
    }
  }
  const ensureCommandMenuMagicSummonItemOrder = (command, hasMagic, hasSummon) => {
    // Command materia is actually just the order that the materia is on equipment...

    if (!hasMagic) {
      // Remove magic command (2), keep W-Magic
      removeMenuOption(command, 2)
    }
    if (!hasSummon) {
      // Remove summon command (3), keep W-Summon
      removeMenuOption(command, 3)
    }

    // Ensure item is always 4th
    const itemCommandPosition = (command) => {
      for (let i = 0; i < command.length; i++) {
        const choice = command[i]
        if (choice.id === 4 || choice.id === 23) {
          return i
        }
      }
      return 0
    }
    while (command.length < 4 && itemCommandPosition(command) !== 3) {
      command.splice(command.length - 1, 0, {id: 255, name: 'BLANK'})
    }
  }

  const command = [
    {id: 1, name: window.data.kernel.commandData[1].name, type: 1}, // Attack
    {id: 2, name: window.data.kernel.commandData[2].name, type: 2}, // Magic
    {id: 3, name: window.data.kernel.commandData[3].name, type: 3}, // Summon
    {id: 4, name: window.data.kernel.commandData[4].name, type: 4} // Item
  ]
  let hasMagic = false
  let hasSummon = false

  for (const materiaSlot in char.materia) {
    const materia = char.materia[materiaSlot]
    if (materia.id !== 255) {
      const materiaData = window.data.kernel.materiaData[materia.id]
      const currentLevel = currentMateriaLevel(materiaData, materia.ap)
      if (materiaData.type === 'Magic') {
        hasMagic = true
      }
      if (materiaData.type === 'Summon') {
        hasSummon = true
      }
      if (materiaData.name === 'Mega All') {
        // addMenuOption(command, 'Slash-All') // TODO
      }
      if (materiaData.type === 'Command') {
        if (materiaData.attributes.type === 'Add') {
          for (let i = 0; i < currentLevel; i++) {
            // console.log('status Add', materiaData.name, materiaData, currentLevel)
            if (currentLevel > 1 && materiaData.attributes.menu.length > 1) {
              addMenuOption(command, materiaData.attributes.menu[1])
            } else {
              addMenuOption(command, materiaData.attributes.menu[0])
            }
          }
        }
        if (materiaData.attributes.type === 'AddAll') {
          for (let i = 0; i < materiaData.attributes.menu.length; i++) {
            addMenuOption(command, materiaData.attributes.menu[i])
          }
        }
        if (materiaData.attributes.type === 'Replace') {
          // console.log('status Replace', materiaData.name, materiaData, currentLevel)
          if (currentLevel > 1 && materiaData.attributes.with.length > 1) {
            replaceMenuOption(command, materiaData.attributes.menu.id, materiaData.attributes.with[1])
          } else {
            replaceMenuOption(command, materiaData.attributes.menu.id, materiaData.attributes.with[0])
          }
        }
      }
    }
  }
  ensureCommandMenuMagicSummonItemOrder(command, hasMagic, hasSummon)
  const { magicMenu, summonMenu, enemySkillsMenu } = calculateMagicSummonEnemySkillMenus(char)
  const menu = {command, magic: magicMenu, summon: summonMenu, enemySkills: enemySkillsMenu}
  console.log('status menu', menu)

  return menu
}

const calculateMagicSummonEnemySkillMenus = (char) => {
  // Interestingly, the config magic order does change the order of the magic on the menu, must just be in battle. Leave it as below for now
  const pairedAddedAbilities = [
    {type: 'All', order: 1, text: 'All', count: 5, targetFlag: 'ToggleSingleMultiTarget'}, // not escape, only available if targetFlags has ToggleSingleMultiTarget
    {type: 'QuadraMagic', order: 2, text: '4x-M', count: 5, targetFlag: 'EnableSelection'}, // not escape
    {type: 'HPAbsorb', order: 3, text: 'Absorb HP'},
    {type: 'MPAbsorb', order: 4, text: 'Absorb MP'},
    {type: 'StealAsWell', order: 5, text: 'Steal as well'},
    {type: 'AddedCut', order: 6, text: 'Extra cut'},
    {type: 'MPTurbo', order: 7, text: 'Turbo MP', level: 5}
  ]
  // remove - ['EnableSelection', 'StartCursorOnEnemyRow', 'DefaultMultipleTargets']

  const populateAllMagicsList = () => {
    const m = []
    for (let i = 0; i < window.data.kernel.battleAndGrowthData.spellOrder.length; i++) {
      const spell = window.data.kernel.battleAndGrowthData.spellOrder[i]
      m.push({
        index: spell.index,
        name: spell.name,
        enabled: false,
        addedAbilities: []
      })
    }
    return m
  }
  const populateAllSummonsList = () => {
    // I assume there is a more kernel oriented way of getting this
    return window.data.kernel.materiaData.filter(m => m.type === 'Summon' && m.attributes.summon.length > 1)[0]
      .attributes.summon.map((s) => {
        return {index: s.attackId, name: s.name, enabled: false, addedAbilities: []}
      })
  }

  const enabledAttacks = (list, id, addedAbility, targetFlag) => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (item.index === id) {
        item.enabled = true
        // console.log('stats enable', magic.index, addedAbility, targetFlag)
        if (addedAbility !== null) {
          // First check if it can be added to the magic with targetFlag check
          if (targetFlag && !window.data.kernel.attackData[id].targetFlags.includes(targetFlag)) {
            break
          }
          let updated = false
          for (let j = 0; j < item.addedAbilities.length; j++) {
            const ability = item.addedAbilities[j]
            if (ability.type === addedAbility.type) {
              // console.log('stats updated', ability.count, addedAbility.count, ability.count + addedAbility.count)
              if (ability.hasOwnProperty('count') && addedAbility.hasOwnProperty('count')) {
                // console.log('stats updated count', magic, ability, addedAbility, ability.count, addedAbility.count, ability.count + addedAbility.count)
                ability.count = ability.count + addedAbility.count // All is accumulative in terms of count
              } else if (ability.hasOwnProperty('level') && addedAbility.hasOwnProperty('level') && addedAbility.level > ability.level) {
                // console.log('stats updated level', ability.count, addedAbility.count, ability.count + addedAbility.count)
                ability.level = addedAbility.level
              }
              updated = true
              break
            }
          }
          if (!updated) {
            item.addedAbilities.push(JSON.parse(JSON.stringify(addedAbility)))
            // console.log('stats added', addedAbility)
          }
          item.addedAbilities.sort(function (a, b) {
            return a.order - b.order
          })
        }
        break
      }
    }
  }

  const getLinkedAbility = (isLinked, linkedMateria) => {
    let addedAbility = null
    let targetFlag = null
    if (isLinked && linkedMateria && linkedMateria.id !== 255) {
      const linkedMateriaData = window.data.kernel.materiaData[linkedMateria.id]
      const level = currentMateriaLevel(linkedMateriaData, linkedMateria.ap)
      // console.log('stats linked materia', linkedMateria, linkedMateriaData, level)

      if (linkedMateriaData.attributes.type) {
        const ability = pairedAddedAbilities.filter(a => a.type === linkedMateriaData.attributes.type)[0]

        if (ability !== undefined) {
          addedAbility = { type: ability.type, order: ability.order, text: ability.text }
          if (ability.hasOwnProperty('count')) {
            addedAbility.count = level
          }
          if (ability.hasOwnProperty('level')) {
            addedAbility.level = level
          }
          if (ability.hasOwnProperty('targetFlag')) {
            targetFlag = ability.targetFlag
          }
        }
      }
    }

    return {addedAbility, targetFlag}
  }
  const filterUnusedMagicRows = (oMagics) => {
    // Magic list does't leave gaps, eg, filter the un-enabled spell options, but it does include the row if there is an active spell on that row,
    // eg, restore has regen and is on row 3 with life and life2, therefore include that row but if you don't have poisona, esuna or resist, ignore row 2
    const filteredMagics = []
    for (let i = 0; i < oMagics.length; i = i + 3) {
      const keepRow = oMagics[i].enabled || oMagics[i + 1].enabled || oMagics[i + 2].enabled
      // console.log('magic filter row', i, 'of', oMagics.length,
      //   oMagics[i].name, oMagics[i].enabled,
      //   oMagics[i + 1].name, oMagics[i + 1].enabled,
      //   oMagics[i + 2].name, oMagics[i + 2].enabled,
      //   '->', keepRow
      // )
      if (keepRow) {
        filteredMagics.push(oMagics[i])
        filteredMagics.push(oMagics[i + 1])
        filteredMagics.push(oMagics[i + 2])
      }
    }
    // console.log('magic filterUnusedMagicRows', oMagics, filteredMagics)
    while (filteredMagics.length !== oMagics.length) {
      filteredMagics.push({index: 255, name: '', enabled: false, addedAbilities: []})
    }
    return filteredMagics
  }

  let magics = populateAllMagicsList()
  const summons = populateAllSummonsList()
  const enemySkills = populateAllEnemySkillsList()

  const equipment = [
    {item: window.data.kernel.allItemData[char.equip.weapon.itemId], type: 'weapon'},
    {item: window.data.kernel.allItemData[char.equip.armor.itemId], type: 'armor'}
  ]
  let megaAllPresent = false
  for (let i = 0; i < equipment.length; i++) {
    const item = equipment[i].item
    const type = equipment[i].type

    for (let j = 0; j < item.materiaSlots.length; j++) {
      const slot = item.materiaSlots[j]
      const isLinked = slot.includes('LinkedSlot')
      const linkedMateria = slot.includes('Left') ? char.materia[`${type}Materia${j + 2}`] : char.materia[`${type}Materia${j}`]
      const materia = char.materia[`${type}Materia${j + 1}`]
      if (materia.id !== 255) {
        const materiaData = window.data.kernel.materiaData[materia.id]
        const currentLevel = currentMateriaLevel(materiaData, materia.ap)
        if (materiaData.type === 'Magic') {
          const toAdd = materiaData.attributes.magic.filter(m => m.level <= currentLevel)
          const {addedAbility, targetFlag} = getLinkedAbility(isLinked, linkedMateria)
          for (let i = 0; i < toAdd.length; i++) {
            const spell = toAdd[i]
            enabledAttacks(magics, spell.attackId, addedAbility, targetFlag)
          }
        } else if (materiaData.type === 'Summon') {
          const {addedAbility, targetFlag} = getLinkedAbility(isLinked, linkedMateria)
          // console.log('magic ADD SUMMON', materiaData, materiaData.attributes.summon)

          for (let i = 0; i < materiaData.attributes.summon.length; i++) {
            const summon = materiaData.attributes.summon[i]
            // console.log('magic ENABLE SUMMON', summon.attackId, addedAbility, targetFlag, window.data.kernel.attackData[summon.attackId])

            // For some reason KOTR summon isn't allowed to use Quadra Magic, but I can't see what flag to use, so I'll use this
            if (window.data.kernel.attackData[summon.attackId].additionalEffects.type === 0 && addedAbility && addedAbility.type === 'QuadraMagic') {
              enabledAttacks(summons, summon.attackId, null, null)
            } else {
              enabledAttacks(summons, summon.attackId, addedAbility, targetFlag)
            }
          }
        } else if (materiaData.type === 'Command' && materiaData.attributes.skill && materiaData.attributes.skill === 'EnemySkill') {
          const flags = getEnemySkillFlags(materia.ap)

          for (let i = 0; i < flags.length; i++) {
            const enabled = flags[i]
            if (enabled) {
              enemySkills[i].enabled = true
              // No added abilities?
            }
          }
          console.log('magic enemy Skill materia', materia, materia.ap, dec2bin(materia.ap).padStart(24, '0'), flags)
        } else if (materiaData.attributes.type && materiaData.attributes.type === 'MegaAll') {
          megaAllPresent = true
        }
      }
    }
  }
  // If mega all is present, added an extra count 5 all to every active magic if targetFlags allow

  if (megaAllPresent) {
    // console.log('stats MEGA ALL')
    for (let i = 0; i < magics.length; i++) {
      const magic = magics[i]
      if (magic.enabled) {
        const allAbility = JSON.parse(JSON.stringify(pairedAddedAbilities.filter(a => a.type === 'All')[0]))
        const targetFlag = allAbility.targetFlag
        delete allAbility.targetFlag
        enabledAttacks(magics, magic.index, allAbility, targetFlag)
      }
    }
  }

  return {magicMenu: filterUnusedMagicRows(magics), summonMenu: summons, enemySkillsMenu: enemySkills}
}

const setEquipmentAndMateriaForTesting = (char, weaponName, armorName, accessoryName, weaponMat, armorMat) => {
  const ap = 10000000
  const weaponData = window.data.kernel.weaponData.filter(m => m.name === weaponName)[0]
  char.equip.weapon.index = weaponData.itemId - 128
  char.equip.weapon.itemId = weaponData.itemId
  char.equip.weapon.name = weaponData.name
  const armorData = window.data.kernel.armorData.filter(m => m.name === armorName)[0]
  char.equip.armor.index = armorData.itemId - 256
  char.equip.armor.itemId = armorData.itemId
  char.equip.armor.name = armorData.name
  if (accessoryName === '') {
    char.equip.accessory.index = 255
    delete char.equip.accessory.name
  } else {
    const accessoryData = window.data.kernel.accessoryData.filter(m => m.name === accessoryName)[0]
    char.equip.accessory.index = accessoryData.itemId - 128
    char.equip.accessory.itemId = accessoryData.itemId
    char.equip.accessory.name = accessoryData.name
  }

  for (let i = 0; i < weaponMat.length; i++) {
    const materiaName = weaponMat[i]
    console.log('magic', `weaponMateria${i + 1}`, materiaName)
    if (materiaName.length > 0) {
      const materia = window.data.kernel.materiaData.filter(m => m.name === materiaName)[0]
      char.materia[`weaponMateria${i + 1}`] = {id: materia.index, ap: ap, name: materia.name, description: materia.description}
    } else {
      char.materia[`weaponMateria${i + 1}`] = {id: 255, ap: 0xFFFFFF}
    }
  }
  for (let i = 0; i < armorMat.length; i++) {
    const materiaName = armorMat[i]
    if (materiaName.length > 0) {
      const materia = window.data.kernel.materiaData.filter(m => m.name === materiaName)[0]
      char.materia[`armorMateria${i + 1}`] = {id: materia.index, ap: ap, name: materia.name, description: materia.description}
    } else {
      char.materia[`armorMateria${i + 1}`] = {id: 255, ap: 0xFFFFFF}
    }
  }

  recalculateAndApplyHPMP(char)
}
const calculateStatValue = (base, bonus, stat, statBonuses) => {
  const statBonusAmount = statBonuses.filter(s => s.type === 'amount' && s.stat === stat).map(s => s.value).reduce((a, b) => a + b, 0)
  const statBonusPercent = statBonuses.filter(s => s.type === 'percent' && s.stat === stat).map(s => s.value).reduce((a, b) => a + b, 100) / 100
  const total = Math.trunc((base + bonus + statBonusAmount) * statBonusPercent)

  console.log('status calculateStatValue', base, bonus, stat, statBonuses, statBonusAmount, statBonusPercent, total)

  return total
}
const getBattleStatsForChar = (char) => {
  // Temp equipment and materia override for testing
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

  const statBonuses = groupStatBonuses(equippedItems, char.materia)
  const {hp, mp} = calculateHPMP(char, statBonuses)

  const strength = calculateStatValue(char.stats.strength, char.stats.strengthBonus, 'Strength', statBonuses)
  const dexterity = calculateStatValue(char.stats.dexterity, char.stats.dexterityBonus, 'Dexterity', statBonuses)
  const vitality = calculateStatValue(char.stats.vitality, char.stats.vitalityBonus, 'Vitality', statBonuses)
  const magic = calculateStatValue(char.stats.magic, char.stats.magicBonus, 'Magic', statBonuses)
  const spirit = calculateStatValue(char.stats.spirit, char.stats.spiritBonus, 'Spirit', statBonuses)
  const luck = calculateStatValue(char.stats.luck, char.stats.luckBonus, 'Luck', statBonuses)

  // TODO - How to add battle / field affecting materia (eg, all support and independent materia), Gil Exp

  const modifiers = {
    exp: 1,
    gil: 1,
    encounter: 1,
    chocoobo: 1
  }

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

    menu,

    modifiers
  }
}
const debugSetEquipmentAndMateria = () => {
  setEquipmentAndMateriaForTesting(
    window.data.savemap.characters.Cloud,
    'Ultima Weapon', 'Wizard Bracelet', '',
    ['Full Cure', 'Master Magic', 'Ultima', 'Poison', 'Lightning', 'Quadra Magic', 'W-Magic', 'Enemy Skill'],
    ['Deathblow', 'Steal', 'Double Cut', 'Cover', 'Enemy Lure', 'HP Plus', 'Master Summon', 'Odin']
  )

  window.data.savemap.characters.Cloud.materia.weaponMateria1.ap = 3245677
  window.data.savemap.characters.Cloud.materia.weaponMateria5.ap = 2000
  // window.data.savemap.characters.Cloud.materia.armorMateria3.ap = 2000
  setEquipmentAndMateriaForTesting(
    window.data.savemap.characters.Tifa,
    'Premium Heart', 'Wizard Bracelet', '',
    ['HP<->MP', 'Underwater', 'Cover', 'Counter Attack', 'Mega All', 'Long Range', 'Pre-Emptive', 'Chocobo Lure'],
    ['Enemy Lure', 'Enemy Away', 'Gil Plus', 'EXP Plus', 'Luck Plus', 'Magic Plus', 'Speed Plus', 'HP Plus']
  )
}
window.debugSetEquipmentAndMateria = debugSetEquipmentAndMateria
export {
  recalculateAndApplyHPMPToAll,
  recalculateAndApplyHPMP,
  getBattleStatsForChar,
  currentMateriaLevel,
  getEnemySkillFlagsWithSkills
}

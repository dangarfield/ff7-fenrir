import { dec2bin } from '../helpers/helpers.js'
import { getLimitMenuData } from './battle-limits.js'

const groupStatBonuses = (items, materias) => {
  const stats = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item) {
      for (let j = 0; j < item.boostedStats.length; j++) {
        const boost = item.boostedStats[j]
        stats.push({ stat: boost.stat, value: boost.value, type: 'amount' })
      }
    }
  }
  for (const materiaSlot in materias) {
    const materia = materias[materiaSlot]
    if (materia.id !== 255) {
      const materiaData = window.data.kernel.materiaData.filter(
        a => a.index === materia.id
      )[0]
      for (let j = 0; j < materiaData.equipEffect.length; j++) {
        const equipEffect = materiaData.equipEffect[j]
        stats.push({
          stat: equipEffect[0],
          value: equipEffect[1],
          type:
            equipEffect[0] === 'HP' || equipEffect[0] === 'MP'
              ? 'percent'
              : 'amount'
        })
      }

      if (
        materiaData.type === 'Independent' &&
        materiaData.attributes.type === 'StatBoost'
      ) {
        const currentLevel = currentMateriaLevel(materiaData, materia.ap)
        stats.push({
          stat: materiaData.attributes.stat,
          value:
            materiaData.attributes.attributes[
              Math.min(
                currentLevel - 1,
                materiaData.attributes.attributes.length - 1
              )
            ],
          type: 'percent'
        })
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
    { item: items[0], type: 'weapon' },
    { item: items[1], type: 'armor' }
  ]
  const elementalMateriaData = window.data.kernel.materiaData.filter(
    a => a.attributes.type === 'Elemental'
  )[0]
  for (let i = 0; i < equipment.length; i++) {
    const item = equipment[i].item
    const type = equipment[i].type

    for (let j = 0; j < item.materiaSlots.length; j++) {
      const slot = item.materiaSlots[j]
      if (slot.includes('LinkedSlot')) {
        // check if this slot has an elemental materia
        const slotMateria = materia[`${type}Materia${j + 1}`]

        // console.log('status linked slot', type, j, slot, slotMateria)
        if (slotMateria.id === elementalMateriaData.index) {
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
              const materiaLevel = currentMateriaLevel(
                elementalMateriaData,
                slotMateria.ap
              )
              // console.log('status elemental materia level', materiaLevel, elementalMateriaData, slotMateria.ap)
              if (materiaLevel === 1) {
                elementModifier = 'halve'
              } else if (materiaLevel === 2) {
                elementModifier = 'invalid'
              } else {
                elementModifier = 'absorb'
              }
            }
            const attachedMateriaElements = [
              window.data.kernel.materiaData[attachedMateria.id].element
            ]
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

  const validStatusToApply = [
    'Death',
    'Sleep',
    'Poison',
    'Sadness',
    'Fury',
    'Confusion',
    'Silence',
    'Slow',
    'Stop',
    'Frog',
    'Small',
    'SlowNumb',
    'Petrify',
    'DeathSentence',
    'Berserk',
    'Paralysis',
    'Darkness'
  ]

  // weapon
  addNoDuplicates(
    statusEffects.attack,
    removeInvalidStatusEffect(items[0].status, validStatusToApply)
  )
  // armor
  if (items[1].status.length > 0) {
    addNoDuplicates(
      statusEffects.defend,
      removeInvalidStatusEffect(items[1].status, validStatusToApply)
    )
  }
  // acc
  if (items[2] && items[2].status && items[2].status.length > 0) {
    addNoDuplicates(
      statusEffects.defend,
      removeInvalidStatusEffect(items[2].status, validStatusToApply)
    )
  }
  // Materia
  const equipment = [
    { item: items[0], type: 'weapon' },
    { item: items[1], type: 'armor' }
  ]
  const addedEffectMateriaData = window.data.kernel.materiaData.filter(
    m => m.attributes.type === 'AddedEffect'
  )[0]

  for (let i = 0; i < equipment.length; i++) {
    const item = equipment[i].item
    const type = equipment[i].type

    for (let j = 0; j < item.materiaSlots.length; j++) {
      const slot = item.materiaSlots[j]
      if (slot.includes('LinkedSlot')) {
        // check if this slot has an elemental materia
        const slotMateria = materia[`${type}Materia${j + 1}`]

        // console.log('status status linked slot', type, j, slot, slotMateria)
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
            const attachedMateriaStatusEffects =
              window.data.kernel.materiaData[attachedMateria.id].status
            // console.log('status status ap', slotMateria.ap, elementModifier, statusEffects[elementModifier], attachedMateriaStatusEffects)

            addNoDuplicates(
              statusEffects[elementModifier],
              removeInvalidStatusEffect(
                attachedMateriaStatusEffects,
                validStatusToApply
              )
            )
          }
        }
      }
    }
  }
  // TODO - Not all statuses have an added effect applied in game, eg weapon with addedEffect+Kujata = Barrier MBarrier Reflect, but nothing shows in game

  // console.log('status calculateStatusEquip', statusEffects, items)
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
const hasMPHPMateria = char => {
  const hpMPMateriaData = window.data.kernel.materiaData.filter(
    m => m.attributes.type && m.attributes.type === 'HP<->MP'
  )[0]
  for (const materiaSlot in char.materia) {
    const materia = char.materia[materiaSlot]
    if (materia.id === hpMPMateriaData.index) {
      return true
    }
  }
  return false
}
const getEnemySkillFlags = ap => {
  // This is a little tricky and should probably be done else, but keep it here for now.
  // Basically ap is 3 bytes, 1st byte contains the first 8 spell flags from LSB to MSB, but because I store the ap as single int, it's a pain
  const flags = dec2bin(ap)
    .padStart(24, '0')
    .match(/[\s\S]{1,8}/g)
    .map(s => s.split('').reverse().join(''))
    .join('')
    .split('')
    .map(s => s === '1')
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
const getEnemySkillFlagsWithSkills = ap => {
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
  const hpBonusAmount = statBonuses
    .filter(s => s.type === 'percent' && s.stat === 'HP')
    .map(s => s.value)
    .reduce((a, b) => a + b, 100)
  const hp = {
    current: char.stats.hp.current ? char.stats.hp.current : char.stats.hp.base,
    max: Math.min(9999, Math.trunc(char.stats.hp.base * (hpBonusAmount / 100)))
  }

  // console.log('status HP', char.stats.hp.base, hpBonusAmount, hp, char, statBonuses.filter(s => s.type === 'percent' && s.stat === 'HP'))
  const mpBonusAmount = statBonuses
    .filter(s => s.type === 'percent' && s.stat === 'MP')
    .map(s => s.value)
    .reduce((a, b) => a + b, 100)
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
  return { hp, mp }
}

const recalculateAndApplyHPMPToAll = () => {
  const names = Object.keys(window.data.savemap.characters)
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    recalculateAndApplyHPMP(window.data.savemap.characters[name])
  }
}
const recalculateAndApplyHPMP = char => {
  const weaponData = getWeaponDataFromItemId[char.equip.weapon.itemId]
  const armorData = getArmorDataFromItemId(char.equip.armor.itemId)
  const accessoryData = getAccessoryDataFromItemId(char.equip.accessory.itemId)
  const equippedItems = [weaponData, armorData, accessoryData]
  const statBonuses = groupStatBonuses(equippedItems, char.materia)

  const { hp, mp } = calculateHPMP(char, statBonuses)
  char.stats.hp.current = hp.current
  char.stats.hp.max = hp.max
  char.stats.mp.current = mp.current
  char.stats.mp.max = mp.max
}
const getMenuOptions = char => {
  // console.log('status getMenuOptions')
  const addMenuOption = (all, choice) => {
    const materiaData = window.data.kernel.materiaData.filter(
      a =>
        a.name &&
        a.attributes.menu &&
        a.attributes.type === 'Add' &&
        a.attributes.menu.length > 0 &&
        a.attributes.menu.filter(m => m.id === choice.id).length > 0
    )[0]
    const moreThanOneChoice = materiaData.attributes.menu.length > 1
    // console.log('stats addMenuOption', choice, materiaData)
    if (!moreThanOneChoice) {
      // if only one choice, add if not present
      const choiceIsInList = all.filter(a => a.id === choice.id).length > 0
      // console.log('stats addMenuOption one', choiceIsInList)
      if (!choiceIsInList) {
        all.push({ ...choice })
        // console.log('stats addMenuOption one push A', all, choice)
      }
    } else {
      const firstChoiceSelected =
        materiaData.attributes.menu[0].id === choice.id
      const choice1IsInList =
        all.filter(a => a.id === materiaData.attributes.menu[0].id).length > 0
      const choice2IsInList =
        all.filter(a => a.id === materiaData.attributes.menu[1].id).length > 0

      // console.log('stats addMenuOption multi', firstChoiceSelected, choice1IsInList, choice2IsInList)
      // if two choice, 1st choice is selected, 1st is not in list, 2nd is not in list = Add
      if (firstChoiceSelected && !choice1IsInList && !choice2IsInList) {
        all.push({ ...choice })
        // console.log('stats addMenuOption multi push A', all, choice)
      }
      // if two choice, 1st choice is selected, 1st is in list    , 2nd is not in list = No Add
      // if two choice, 1st choice is selected, 1st is not in list, 2nd is in list     = No Add
      // if two choice, 1st choice is selected, 1st is in list    , 2nd is in list     = No Add  // Bad

      // if two choice, 2nd choice is selected, 1st is not in list, 2nd is not in list = Add
      if (!firstChoiceSelected && !choice1IsInList && !choice2IsInList) {
        all.push({ ...choice })
        // console.log('stats addMenuOption multi push B', all, choice)
      }
      // if two choice, 2nd choice is selected, 1st is in list    , 2nd is not in list = Replace 1st with 2nd
      if (!firstChoiceSelected && choice1IsInList && !choice2IsInList) {
        replaceMenuOption(all, materiaData.attributes.menu[0].id, choice)
        // console.log('stats addMenuOption multi replace', all, choice)
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
  const ensureCommandMenuMagicSummonItemOrder = (all, hasMagic, hasSummon) => {
    // Command materia is actually just the order that the materia is on equipment...
    const itemCommandPosition = all => {
      for (let i = 0; i < all.length; i++) {
        const choice = all[i]
        if (choice.id === 4 || choice.id === 23) {
          return i
        }
      }
      return 0
    }
    if (!hasMagic) {
      // Remove magic command (2), keep W-Magic
      removeMenuOption(all, 2)
    }
    if (!hasSummon) {
      // Remove summon command (3), keep W-Summon
      removeMenuOption(all, 3)
    }

    const itemPosition = itemCommandPosition(all)
    const itemCommand = all.splice(itemPosition, 1)[0]
    // Ensure item is always 4th
    if (all.length < 4) {
      while (all.length < 3) {
        all.splice(all.length, 0, { id: 255, name: 'BLANK' })
      }
      all.push(itemCommand)
    } else {
      all.splice(3, 0, itemCommand)
    }
    // console.log('materia ensureCommandMenuMagicSummonItemOrder', all, itemPosition, itemCommand)
  }

  const command = [
    { id: 1, name: window.data.kernel.commandData[1].name, type: 1 }, // Attack
    { id: 2, name: window.data.kernel.commandData[2].name, type: 2 }, // Magic
    { id: 3, name: window.data.kernel.commandData[3].name, type: 3 }, // Summon
    { id: 4, name: window.data.kernel.commandData[4].name, type: 4 } // Item
  ]
  let hasMagic = false
  let hasSummon = false
  let hasMegaAll = false

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
        const slashAllMateriaData = window.data.kernel.materiaData.filter(
          m => m.index === 14
        )[0]
        replaceMenuOption(
          command,
          slashAllMateriaData.attributes.menu.id,
          slashAllMateriaData.attributes.with[0]
        )
        hasMegaAll = true
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
          // console.log('status AddAll', materiaData.name, materiaData, currentLevel)
          for (let i = 0; i < materiaData.attributes.menu.length; i++) {
            addMenuOption(command, materiaData.attributes.menu[i])
          }
        }
        if (materiaData.attributes.type === 'Replace') {
          // console.log('status Replace', materiaData.name, materiaData, currentLevel)
          if (currentLevel > 1 && materiaData.attributes.with.length > 1) {
            replaceMenuOption(
              command,
              materiaData.attributes.menu.id,
              materiaData.attributes.with[1]
            )
          } else {
            replaceMenuOption(
              command,
              materiaData.attributes.menu.id,
              materiaData.attributes.with[0]
            )
          }
        }
      }
    }
  }
  if (hasMegaAll) {
    for (const commandItem of command) {
      // TODO: Add a number that can be decremented, same with magic all & summons etc
      // Steal, Mug, Sense, Morph, Deathblow, Manipulate
      if ([5, 17, 6, 9, 10, 11].includes(commandItem.id)) commandItem.all = true
    }
  }
  // Add Limit command is limit is full
  if (char.limit.bar === 0xff) {
    console.log('limit battleStats', command)
    command[0].limit = 20 // Hardcoded ref to limit command
  }
  ensureCommandMenuMagicSummonItemOrder(command, hasMagic, hasSummon)

  const { magicMenu, summonMenu, enemySkillsMenu } =
    calculateMagicSummonEnemySkillMenus(char)
  const limitMenuData = getLimitMenuData(char)

  const menu = {
    command,
    magic: magicMenu,
    summon: summonMenu,
    enemySkills: enemySkillsMenu,
    limit: limitMenuData
  }
  console.log('status menu', menu)

  return menu
}

const calculateMagicSummonEnemySkillMenus = char => {
  // Interestingly, the config magic order does change the order of the magic on the menu, must just be in battle. Leave it as below for now
  const pairedAddedAbilities = [
    {
      type: 'All',
      order: 1,
      text: 'All',
      textBattle: 'All:',
      count: 5,
      targetFlag: 'ToggleSingleMultiTarget'
    }, // not escape, only available if targetFlags has ToggleSingleMultiTarget
    {
      type: 'QuadraMagic',
      order: 2,
      text: '4x-M',
      textBattle: '4x:',
      count: 5,
      targetFlag: 'EnableSelection'
    }, // not escape
    { type: 'HPAbsorb', order: 3, text: 'Absorb HP' },
    { type: 'MPAbsorb', order: 4, text: 'Absorb MP' },
    { type: 'StealAsWell', order: 5, text: 'Steal as well' },
    { type: 'AddedCut', order: 6, text: 'Extra cut' },
    { type: 'MPTurbo', order: 7, text: 'Turbo MP', level: 5 }
  ]
  // remove - ['EnableSelection', 'StartCursorOnEnemyRow', 'DefaultMultipleTargets']

  const populateAllMagicsList = () => {
    // There is an interesting 'bug' in the game where the sorted magic order as defined in the config settings doesn't update the magic list
    // UNTIL you either go into a battle of the check command in the materia menu, at which point, it is updated
    // I'm just going to make sure that it's always the right order in the beginning
    // restore - 0
    // attack - 1
    // indirect - 2
    // ultimate - 3 (no position config, always last)
    // window.data.savemap.config.magicOrder = {
    //   AttackIndirectRestore: false,
    //   AttackRestoreIndirect: false,
    //   IndirectAttackRestore: false,
    //   IndirectRestoreAttack: false,
    //   RestoreAttackIndirect: true,
    //   RestoreIndirectAttack: false
    // }
    const orderingList = []
    let boostRestore = 0
    let boostAttack = 0
    let boostIndirect = 0
    const boostUltimate = 400
    if (window.data.savemap.config.magicOrder.RestoreAttackIndirect) {
      boostRestore = 100
      boostAttack = 200
      boostIndirect = 300
    } else if (window.data.savemap.config.magicOrder.RestoreIndirectAttack) {
      boostRestore = 100
      boostAttack = 300
      boostIndirect = 200
    } else if (window.data.savemap.config.magicOrder.AttackIndirectRestore) {
      boostRestore = 300
      boostAttack = 100
      boostIndirect = 200
    } else if (window.data.savemap.config.magicOrder.AttackRestoreIndirect) {
      boostRestore = 200
      boostAttack = 100
      boostIndirect = 300
    } else if (window.data.savemap.config.magicOrder.IndirectRestoreAttack) {
      boostRestore = 200
      boostAttack = 300
      boostIndirect = 100
    } else if (window.data.savemap.config.magicOrder.IndirectAttackRestore) {
      boostRestore = 300
      boostAttack = 200
      boostIndirect = 100
    }
    const orderTypes = [boostRestore, boostAttack, boostIndirect, boostUltimate]

    for (
      let i = 0;
      i < window.data.kernel.battleAndGrowthData.spellOrder.length;
      i++
    ) {
      const spell = window.data.kernel.battleAndGrowthData.spellOrder[i]
      orderingList.push({
        index: spell.index,
        name: spell.name,
        order: orderTypes[spell.section] + spell.position
      })
    }

    orderingList.sort((a, b) => a.order - b.order)
    // console.log('materia ORDERING LIST', orderingList)
    const m = []

    for (let i = 0; i < orderingList.length; i++) {
      const spell = orderingList[i]
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
    return window.data.kernel.materiaData
      .filter(m => m.type === 'Summon' && m.attributes.summon.length > 1)[0]
      .attributes.summon.map(s => {
        return {
          index: s.attackId,
          name: s.name,
          enabled: false,
          addedAbilities: [],
          uses: 0
        }
      })
  }

  const enabledAttacks = (list, id, addedAbility, targetFlag, uses) => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (item.index === id) {
        item.enabled = true
        // console.log('stats enable', magic.index, addedAbility, targetFlag)
        if (addedAbility !== null) {
          // First check if it can be added to the magic with targetFlag check
          if (
            targetFlag &&
            !window.data.kernel.attackData[id].targetFlags.includes(targetFlag)
          ) {
            break
          }
          let updated = false
          for (let j = 0; j < item.addedAbilities.length; j++) {
            const ability = item.addedAbilities[j]
            if (ability.type === addedAbility.type) {
              // console.log('stats updated', ability.count, addedAbility.count, ability.count + addedAbility.count)
              if (
                Object.hasOwnProperty.call(ability, 'count') &&
                Object.hasOwnProperty.call(addedAbility, 'count')
              ) {
                // console.log('stats updated count', magic, ability, addedAbility, ability.count, addedAbility.count, ability.count + addedAbility.count)
                ability.count = ability.count + addedAbility.count // All is accumulative in terms of count
              } else if (
                Object.hasOwnProperty.call(ability, 'level') &&
                Object.hasOwnProperty.call(addedAbility, 'level') &&
                addedAbility.level > ability.level
              ) {
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

        if (uses !== undefined) {
          if (!Object.hasOwnProperty.call(item, 'uses')) {
            item.uses = uses
          } else if (
            Object.hasOwnProperty.call(item, 'uses') &&
            uses > item.uses
          ) {
            item.uses = uses
          }
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
        const ability = pairedAddedAbilities.filter(
          a => a.type === linkedMateriaData.attributes.type
        )[0]

        if (ability !== undefined) {
          addedAbility = {
            type: ability.type,
            order: ability.order,
            text: ability.text,
            textBattle: ability.textBattle
          }
          if (Object.hasOwnProperty.call(ability, 'count')) {
            addedAbility.count = level
          }
          if (Object.hasOwnProperty.call(ability, 'level')) {
            addedAbility.level = level
          }
          if (Object.hasOwnProperty.call(ability, 'targetFlag')) {
            targetFlag = ability.targetFlag
          }
        }
      }
    }

    return { addedAbility, targetFlag }
  }
  const filterUnusedMagicRows = oMagics => {
    // Magic list does't leave gaps, eg, filter the un-enabled spell options, but it does include the row if there is an active spell on that row,
    // eg, restore has regen and is on row 3 with life and life2, therefore include that row but if you don't have poisona, esuna or resist, ignore row 2
    const filteredMagics = []
    for (let i = 0; i < oMagics.length; i = i + 3) {
      const keepRow =
        oMagics[i].enabled || oMagics[i + 1].enabled || oMagics[i + 2].enabled
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
      filteredMagics.push({
        index: 255,
        name: '',
        enabled: false,
        addedAbilities: []
      })
    }
    return filteredMagics
  }

  const magics = populateAllMagicsList()
  const summons = populateAllSummonsList()
  const enemySkills = populateAllEnemySkillsList()

  const equipment = [
    {
      item: window.data.kernel.allItemData[char.equip.weapon.itemId],
      type: 'weapon'
    },
    {
      item: window.data.kernel.allItemData[char.equip.armor.itemId],
      type: 'armor'
    }
  ]
  let megaAllPresent = false
  for (let i = 0; i < equipment.length; i++) {
    const item = equipment[i].item
    const type = equipment[i].type

    for (let j = 0; j < item.materiaSlots.length; j++) {
      const slot = item.materiaSlots[j]
      const isLinked = slot.includes('LinkedSlot')
      const linkedMateria = slot.includes('Left')
        ? char.materia[`${type}Materia${j + 2}`]
        : char.materia[`${type}Materia${j}`]
      const materia = char.materia[`${type}Materia${j + 1}`]
      if (materia.id !== 255) {
        const materiaData = window.data.kernel.materiaData[materia.id]
        const currentLevel = currentMateriaLevel(materiaData, materia.ap)
        if (materiaData.type === 'Magic') {
          const toAdd = materiaData.attributes.magic.filter(
            m => m.level <= currentLevel
          )
          const { addedAbility, targetFlag } = getLinkedAbility(
            isLinked,
            linkedMateria
          )
          for (let i = 0; i < toAdd.length; i++) {
            const spell = toAdd[i]
            enabledAttacks(magics, spell.attackId, addedAbility, targetFlag)
          }
        } else if (materiaData.type === 'Summon') {
          const { addedAbility, targetFlag } = getLinkedAbility(
            isLinked,
            linkedMateria
          )
          console.log(
            'stats ADD SUMMON',
            materiaData,
            materiaData.attributes.summon,
            currentLevel
          )

          for (let i = 0; i < materiaData.attributes.summon.length; i++) {
            const summon = materiaData.attributes.summon[i]

            // console.log('magic ENABLE SUMMON', summon.attackId, addedAbility, targetFlag, window.data.kernel.attackData[summon.attackId])
            const uses = materiaData.attributes.master ? 0xff : currentLevel
            console.log('stats ADD SUMMON attack', summon, uses)
            // For some reason KOTR summon isn't allowed to use Quadra Magic, but I can't see what flag to use, so I'll use this
            if (
              window.data.kernel.attackData[summon.attackId].additionalEffects
                .type === 0 &&
              addedAbility &&
              addedAbility.type === 'QuadraMagic'
            ) {
              enabledAttacks(summons, summon.attackId, null, null, uses)
            } else {
              enabledAttacks(
                summons,
                summon.attackId,
                addedAbility,
                targetFlag,
                uses
              )
            }
          }
        } else if (
          materiaData.type === 'Command' &&
          materiaData.attributes.skill &&
          materiaData.attributes.skill === 'EnemySkill'
        ) {
          const flags = getEnemySkillFlags(materia.ap)

          for (let i = 0; i < flags.length; i++) {
            const enabled = flags[i]
            if (enabled) {
              enemySkills[i].enabled = true
              // No added abilities?
            }
          }
          console.log(
            'magic enemy Skill materia',
            materia,
            materia.ap,
            dec2bin(materia.ap).padStart(24, '0'),
            flags
          )
        } else if (
          materiaData.attributes.type &&
          materiaData.attributes.type === 'MegaAll'
        ) {
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
        const allAbility = JSON.parse(
          JSON.stringify(pairedAddedAbilities.filter(a => a.type === 'All')[0])
        )
        const targetFlag = allAbility.targetFlag
        delete allAbility.targetFlag
        enabledAttacks(magics, magic.index, allAbility, targetFlag)
      }
    }
  }

  const calculateMPCostForSpells = spells => {
    for (const spell of spells) {
      if (spell.index === 0xff) continue
      const attackData = window.data.kernel.attackData[spell.index]
      // TODO - Other MP cost affecting equipment? Golden hairpin?

      spell.mpCost = attackData.mp
      // MP Turbo - Done
      if (isMPTurboActive(spell))
        spell.mpCost = applyMPTurbo(spell.mpCost, spell)
      // All - ?
      // Quadra Magic - ?

      // There is a limit of 255
      if (spell.mpCost > 0xff) spell.mpCost = 0xff
    }
    return spells
  }
  return {
    magicMenu: calculateMPCostForSpells(filterUnusedMagicRows(magics)),
    summonMenu: calculateMPCostForSpells(summons),
    enemySkillsMenu: calculateMPCostForSpells(enemySkills)
  }
}

const setEquipmentAndMateriaForTesting = (
  char,
  weaponName,
  armorName,
  accessoryName,
  weaponMat,
  armorMat
) => {
  const ap = 10000000
  const weaponData = window.data.kernel.weaponData.filter(
    m => m.name === weaponName
  )[0]
  char.equip.weapon.index = weaponData.itemId - 128
  char.equip.weapon.itemId = weaponData.itemId
  char.equip.weapon.name = weaponData.name
  const armorData = window.data.kernel.armorData.filter(
    m => m.name === armorName
  )[0]
  char.equip.armor.index = armorData.itemId - 256
  char.equip.armor.itemId = armorData.itemId
  char.equip.armor.name = armorData.name
  if (accessoryName === '') {
    char.equip.accessory.index = 255
    delete char.equip.accessory.name
  } else {
    const accessoryData = window.data.kernel.accessoryData.filter(
      m => m.name === accessoryName
    )[0]
    char.equip.accessory.index = accessoryData.itemId - 128
    char.equip.accessory.itemId = accessoryData.itemId
    char.equip.accessory.name = accessoryData.name
  }

  for (let i = 0; i < weaponMat.length; i++) {
    const materiaName = weaponMat[i]
    console.log('magic', `weaponMateria${i + 1}`, materiaName)
    if (materiaName.length > 0) {
      const materia = window.data.kernel.materiaData.filter(
        m => m.name === materiaName
      )[0]
      if (!materia) {
        window.alert(`No materia: ${materiaName} in weaponMateria${i + 1}`)
      }
      char.materia[`weaponMateria${i + 1}`] = {
        id: materia.index,
        ap,
        name: materia.name,
        description: materia.description
      }
    } else {
      char.materia[`weaponMateria${i + 1}`] = { id: 255, ap: 0xffffff }
    }
  }
  for (let i = 0; i < armorMat.length; i++) {
    const materiaName = armorMat[i]
    if (materiaName.length > 0) {
      const materia = window.data.kernel.materiaData.filter(
        m => m.name === materiaName
      )[0]
      if (!materia) {
        window.alert(`No materia: ${materiaName} in armorMateria${i + 1}`)
      }
      char.materia[`armorMateria${i + 1}`] = {
        id: materia.index,
        ap,
        name: materia.name,
        description: materia.description
      }
    } else {
      char.materia[`armorMateria${i + 1}`] = { id: 255, ap: 0xffffff }
    }
  }

  recalculateAndApplyHPMP(char)
}
const calculateStatValue = (base, bonus, stat, statBonuses) => {
  const statBonusAmount = statBonuses
    .filter(s => s.type === 'amount' && s.stat === stat)
    .map(s => s.value)
    .reduce((a, b) => a + b, 0)
  const statBonusPercent =
    statBonuses
      .filter(s => s.type === 'percent' && s.stat === stat)
      .map(s => s.value)
      .reduce((a, b) => a + b, 100) / 100
  const total = Math.trunc((base + bonus + statBonusAmount) * statBonusPercent)

  console.log(
    'status calculateStatValue',
    base,
    bonus,
    stat,
    statBonuses,
    statBonusAmount,
    statBonusPercent,
    total
  )

  return total
}
const getBattleStatsForChar = char => {
  // Temp equipment and materia override for testing
  const weaponData = getWeaponDataFromItemId(char.equip.weapon.itemId)
  const armorData = getArmorDataFromItemId(char.equip.armor.itemId)
  const accessoryData = getAccessoryDataFromItemId(char.equip.accessory.itemId)
  const equippedItems = [weaponData, armorData, accessoryData]
  const equippedMateria = []
  for (const materiaSlot in char.materia) {
    if (char.materia[materiaSlot].id !== 255) {
      equippedMateria.push(
        window.data.kernel.materiaData[char.materia[materiaSlot].id]
      )
    }
  }

  const statBonuses = groupStatBonuses(equippedItems, char.materia)
  const { hp, mp } = calculateHPMP(char, statBonuses)

  const strength = calculateStatValue(
    char.stats.strength,
    char.stats.strengthBonus,
    'Strength',
    statBonuses
  )
  const dexterity = calculateStatValue(
    char.stats.dexterity,
    char.stats.dexterityBonus,
    'Dexterity',
    statBonuses
  )
  const vitality = calculateStatValue(
    char.stats.vitality,
    char.stats.vitalityBonus,
    'Vitality',
    statBonuses
  )
  const magic = calculateStatValue(
    char.stats.magic,
    char.stats.magicBonus,
    'Magic',
    statBonuses
  )
  const spirit = calculateStatValue(
    char.stats.spirit,
    char.stats.spiritBonus,
    'Spirit',
    statBonuses
  )
  const luck = calculateStatValue(
    char.stats.luck,
    char.stats.luckBonus,
    'Luck',
    statBonuses
  )

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

  // console.log('battleUI equippedMateria', char, equippedMateria)
  const hasLongRangeMateria = equippedMateria.some(m => m.index === 11)
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

    modifiers,

    weaponData,
    armorData,
    accessoryData,
    hasLongRangeMateria
  }
}
const isMPTurboActive = item => {
  return item.addedAbilities.filter(a => a.type === 'MPTurbo').length > 0
}
const applyMPTurbo = (originalMP, item) => {
  const mpTurboAbility = item.addedAbilities.filter(
    a => a.type === 'MPTurbo'
  )[0]
  const mp = Math.min(
    255,
    Math.trunc((originalMP * (10 + mpTurboAbility.level)) / 10 + 1)
  )
  return mp
}
const debugSetEquipmentAndMateria = () => {
  setEquipmentAndMateriaForTesting(
    window.data.savemap.characters.Cloud,
    'Ultima Weapon',
    'Wizard Bracelet',
    '',
    // ['Master Summon', 'All', 'Master Summon', 'Quadra Magic', 'Master Summon', 'HP Absorb', 'Master Summon', 'MP Absorb'],
    // ['Master Summon', 'Steal as well', 'Master Summon', 'Added Cut', 'Master Summon', 'MP Turbo', 'Master Summon', 'Mega All']
    [
      // '',
      'Mega All',
      // '',
      'Master Command',
      'Master Magic',
      '',
      'Master Summon',
      'Enemy Skill',
      '',
      ''
    ],
    ['Restore', 'MP Turbo', 'Restore', 'Quadra Magic', '', '', '', '']
  )

  // window.data.savemap.characters.Cloud.materia.weaponMateria1.ap = 3245677
  // window.data.savemap.characters.Cloud.materia.weaponMateria5.ap = 2000
  // window.data.savemap.characters.Cloud.materia.armorMateria3.ap = 2000

  setEquipmentAndMateriaForTesting(
    window.data.savemap.characters.Tifa,
    'Premium Heart',
    'Wizard Bracelet',
    '',
    [
      'W-Magic',
      'W-Item',
      'Cover',
      'Ultima',
      'Steal',
      'All',
      'Pre-Emptive',
      'Chocobo Lure'
    ],
    [
      'Enemy Skill',
      'Time',
      'Gil Plus',
      'Revive',
      'Fire',
      'Magic Plus',
      'Speed Plus',
      'HP Plus'
    ]
  )
  setEquipmentAndMateriaForTesting(
    window.data.savemap.characters.Barret,
    'Missing Score',
    'Wizard Bracelet',
    'Choco Feather',
    [
      'Steal',
      'Choco/Mog',
      'Shiva',
      'Ifrit',
      'Throw',
      'Throw',
      'W-Summon',
      'Deathblow'
    ],
    ['', '', '', '', '', '', '', '']
  )
  window.data.savemap.characters.Barret.materia.weaponMateria2.ap = 1000
  window.data.savemap.characters.Barret.materia.weaponMateria3.ap = 16000
  window.data.savemap.characters.Barret.materia.weaponMateria4.ap = 50000
  window.data.savemap.characters.Barret.materia.weaponMateria6.ap = 50000

  window.data.savemap.characters.Cloud.limit.level = 2
  window.data.savemap.characters.Cloud.limit.learnedLimitSkills = [
    'Limit_1_1',
    'Limit_1_2',
    'Limit_2_1',
    'Limit_2_2',
    'Limit_3_1',
    'Limit_3_2',
    'Limit_4_1'
  ]
  window.data.savemap.characters.Cloud.limit.bar = 255
  window.data.savemap.characters.Tifa.limit.bar = 128
  window.data.savemap.characters.Tifa.limit.level = 4
  window.data.savemap.characters.Tifa.limit.learnedLimitSkills = [
    'Limit_1_1',
    'Limit_1_2',
    'Limit_2_1',
    'Limit_2_2',
    'Limit_3_1',
    'Limit_3_2',
    'Limit_4_1'
  ]
  window.data.savemap.characters.Barret.limit.bar = 255
  window.data.savemap.characters.Barret.limit.learnedLimitSkills = [
    'Limit_1_1',
    'Limit_1_2'
  ]
  window.data.savemap.characters.Barret.status.battleOrder = 'BackRow'

  window.data.savemap.characters.CaitSith.limit.level = 2
  window.data.savemap.characters.CaitSith.limit.learnedLimitSkills = [
    'Limit_1_1',
    'Limit_2_1'
  ]
  window.data.savemap.characters.Aeris.limit.bar = 255
  window.data.savemap.characters.Aeris.status.battleOrder = 'BackRow'

  window.data.savemap.party.members = ['Cloud', 'Tifa', 'Aeris']
  // window.data.savemap.party.members = ['Cloud', 'Tifa', 'None']
  // window.data.savemap.party.members = ['Cloud', 'None', 'None']
}
window.debugSetEquipmentAndMateria = debugSetEquipmentAndMateria
const getWeaponDataFromItemId = itemId => {
  return window.data.kernel.weaponData.find(i => i.itemId === itemId)
}
const getArmorDataFromItemId = itemId => {
  return window.data.kernel.armorData.find(i => i.itemId === itemId)
}
const getAccessoryDataFromItemId = itemId => {
  return window.data.kernel.accessoryData.find(i => i.itemId === itemId)
}
export {
  recalculateAndApplyHPMPToAll,
  recalculateAndApplyHPMP,
  getBattleStatsForChar,
  currentMateriaLevel,
  getEnemySkillFlagsWithSkills,
  getWeaponDataFromItemId,
  getArmorDataFromItemId,
  getAccessoryDataFromItemId
}

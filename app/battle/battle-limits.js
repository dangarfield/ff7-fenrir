import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'

const LIMIT_MENU_TYPES = {
  STANDARD: 'standard',
  REELS_TIFA: 'reels-tifa',
  REELS_CAITSITH: 'reels-caitsith'
}

const standardLimit = index => {
  return {
    levelsTotal: 4,
    limitsPerLevel: 2,
    limitAttackIndex: index,
    menuType: LIMIT_MENU_TYPES.STANDARD
  }
}

const CONFIG = {
  Cloud: standardLimit(0), // There is a duplicate Finishing Touch at 70 ?
  Barret: standardLimit(7),
  Tifa: {
    levelsTotal: 4,
    limitsPerLevel: 2,
    limitAttackIndex: 21,
    menuType: LIMIT_MENU_TYPES.REELS_TIFA
  }, //standardLimit(0),// 21 - 27
  Aeris: standardLimit(14),
  RedXIII: standardLimit(35),
  Yuffie: standardLimit(49),
  CaitSith: {
    levelsTotal: 1,
    limitsPerLevel: 1,
    limitAttackIndex: 42,
    limitAttackLevel2Skip: 1,
    menuType: [LIMIT_MENU_TYPES.STANDARD, LIMIT_MENU_TYPES.REELS_CAITSITH]
  }, // standardLimit(0), // 42-44 but attacks are: 56-60
  Vincent: {
    levelsTotal: 1,
    limitsPerLevel: 1,
    limitAttackIndex: 45,
    menuType: LIMIT_MENU_TYPES.STANDARD
  }, //standardLimit(0), // 45-48 but attacks are: 61-69
  Cid: standardLimit(28),
  YoungCloud: standardLimit(0) // Is this needed?
  //   Sephiroth: standardLimit(0), // Required?
  //   Chocobo: standardLimit(0)
}

const getLimitAttack = (playerName, limitEnum) => {
  const limitSplit = limitEnum.split('_')
  const level = parseInt(limitSplit[1])
  const levelIndex = limitSplit.length > 2 ? parseInt(limitSplit[2]) : 1
  const limitConfig = CONFIG[playerName]
  let limitAttackId =
    limitConfig.limitAttackIndex +
    (level - 1) * limitConfig.limitsPerLevel +
    (levelIndex - 1)
  if (limitConfig.limitAttackLevel2Skip && level === 2)
    limitAttackId = limitAttackId + limitConfig.limitAttackLevel2Skip
  //   console.log(
  //     'battleUI LIMIT: attack',
  //     limitSplit,
  //     level,
  //     levelIndex,
  //     limitConfig,
  //     limitAttackId
  //   )
  return window.data.exe.limitData.limits[limitAttackId]
}

const getLimitMenuData = char => {
  const playerName = getPlayableCharacterName(char.id)
  const level = char.limit.level
  const limits = char.limit.learnedLimitSkills
    .filter(l => l.startsWith(`Limit_${level}`))
    .map(l => getLimitAttack(playerName, l))
  //   console.log('battleUI LIMIT: ', char, level, limits)

  const menuType = Array.isArray(CONFIG[playerName].menuType)
    ? CONFIG[playerName].menuType[level - 1]
    : CONFIG[playerName].menuType
  return { limits, menuType }
}
export { getLimitMenuData, LIMIT_MENU_TYPES }

import * as THREE from '../../assets/threejs-r148/build/three.module.js'
import { setMenuState, getMenuBlackOverlay } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  addLevelToDialog,
  addLimitToDialog,
  POINTERS,
  movePointer,
  addCharacterSummary,
  addImageToDialog,
  fadeOverlayOut,
  fadeOverlayIn,
  createEquipmentMateriaViewer,
  EQUIPMENT_TYPE,
  createCommandsDialog,
  addMenuCommandsToDialog
} from './menu-box-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import {
  getBattleStatsForChar,
  getArmorDataFromItemId,
  getWeaponDataFromItemId
} from '../battle/battle-stats.js'
import {
  stopAllLimitBarTweens,
  stopAllLimitTextTweens
} from './menu-limit-tween-helper.js'

let statusDialog, headerGroup, statsGroup, elementGroup, statusesGroup

const STATUS_DATA = {
  partyMember: 0,
  page: 0
}
const loadStatusMenu = async partyMember => {
  STATUS_DATA.partyMember = partyMember
  STATUS_DATA.page = 0

  statusDialog = createDialogBox({
    id: 3,
    name: 'statusMenu',
    w: 320,
    h: 240,
    x: 0,
    y: 0,
    slideX: 0,
    slideY: 240,
    expandInstantly: true,
    noClipping: true
  })
  headerGroup = new THREE.Group()
  headerGroup.userData = { id: 15, z: 100 - 15 }
  headerGroup.position.z = 12
  headerGroup.visible = true
  statusDialog.add(headerGroup)

  statsGroup = new THREE.Group()
  statsGroup.userData = { id: 15, z: 100 - 15 }
  statsGroup.position.z = 12
  statsGroup.visible = false
  statusDialog.add(statsGroup)

  elementGroup = new THREE.Group()
  elementGroup.userData = { id: 15, z: 100 - 15 }
  elementGroup.position.z = 12
  elementGroup.visible = false
  statusDialog.add(elementGroup)

  statusesGroup = new THREE.Group()
  statusesGroup.userData = { id: 15, z: 100 - 15 }
  statusesGroup.position.z = 12
  statusesGroup.visible = false
  statusDialog.add(statusesGroup)

  statusDialog.visible = true
  window.statusDialog = statusDialog
  populatePagesForCharacter()
  displayPage()
  await fadeOverlayOut(getMenuBlackOverlay())
  setMenuState('status-stats')
}

const loadNextPage = () => {
  if (STATUS_DATA.page === 2) {
    STATUS_DATA.page = 0
  } else {
    STATUS_DATA.page++
  }
  displayPage()
}
const displayPage = () => {
  if (STATUS_DATA.page === 0) {
    statsGroup.visible = true
    elementGroup.visible = false
    statusesGroup.visible = false
  } else if (STATUS_DATA.page === 1) {
    statsGroup.visible = false
    elementGroup.visible = true
    statusesGroup.visible = false
  } else {
    statsGroup.visible = false
    elementGroup.visible = false
    statusesGroup.visible = true
  }
}
const populatePagesForCharacter = () => {
  const char =
    window.data.savemap.characters[
      window.data.savemap.party.members[STATUS_DATA.partyMember]
    ]

  const battleStats = getBattleStatsForChar(char)
  addPartyMemberHeader(char, STATUS_DATA.partyMember)
  addPartyMemberStats(char, battleStats)
  addPartyMemberElements(char, battleStats)
  addPartyMemberStatus(char, battleStats)
}

const addPartyMemberHeader = (char, partyMember) => {
  while (headerGroup.children.length) {
    headerGroup.remove(headerGroup.children[0])
  }

  console.log('status char', char, headerGroup)
  addImageToDialog(
    headerGroup,
    'profiles',
    window.data.savemap.party.members[partyMember],
    'profile-image',
    28,
    29,
    0.5
  )
  addCharacterSummary(
    headerGroup,
    partyMember,
    43.5,
    14.5,
    char.name,
    char.status,
    char.level.current,
    char.stats.hp.current,
    char.stats.hp.max,
    char.stats.mp.current,
    char.stats.mp.max
  )

  // EXP
  addTextToDialog(
    headerGroup,
    'EXP:',
    'status-exp-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    123.5 - 8,
    16.5 - 4,
    0.5
  )
  addTextToDialog(
    headerGroup,
    ('' + char.level.currentEXP).padStart(14, ' '),
    'status-exp',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    128.5 + 8,
    16.5 - 4,
    0.5
  )
  addImageToDialog(
    headerGroup,
    'labels',
    'points-small',
    'status-next-level-p',
    232.5,
    14,
    0.5
  )
  addLevelToDialog(headerGroup, 195, 25, char)

  // Next level
  addTextToDialog(
    headerGroup,
    'next level:',
    'status-next-level-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    123.5 - 8,
    41 - 4,
    0.5
  )
  addTextToDialog(
    headerGroup,
    ('' + char.level.nextLevelEXP).padStart(14, ' '),
    'status-exp-next',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    161 + 8,
    41 - 4,
    0.5
  )

  addImageToDialog(
    headerGroup,
    'labels',
    'points-small',
    'status-next-limit-p',
    264.5,
    38.5,
    0.5
  )

  // Limit
  addTextToDialog(
    headerGroup,
    'Limit level:',
    'status-limit-level-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    123.5 - 8,
    55 - 4,
    0.5
  )
  addTextToDialog(
    headerGroup,
    char.limit.level + '',
    'status-limit-level',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    175.5 - 8,
    55 - 4,
    0.5
  )
  addLimitToDialog(headerGroup, 232.5, 49, char)
  headerGroup.visible = true
  window.headerGroup = headerGroup
}
const addPartyMemberStats = (char, battleStats) => {
  while (statsGroup.children.length) {
    statsGroup.remove(statsGroup.children[0])
  }
  console.log('status stats char', char, battleStats)

  // Stats
  const stats = [
    ['Strength', battleStats.strength],
    ['Dexterity', battleStats.dexterity],
    ['Vitality', battleStats.vitality],
    ['Magic', battleStats.magic],
    ['Spirit', battleStats.spirit],
    ['Luck', battleStats.luck],

    ['Attack', battleStats.attack],
    ['Attack%', battleStats.attackPercent],
    ['Defense', battleStats.defense],
    ['Defense%', battleStats.defensePercent],
    ['Magic atk', battleStats.magicAttack],
    ['Magic def', battleStats.magicDefense],
    ['Magic def%', battleStats.magicDefensePercent]
  ]

  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i]
    const adj = i > 5 ? 16 : 0
    addTextToDialog(
      statsGroup,
      stat[0],
      `stat-label-${stat[0]}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      30 - 8,
      70 - 4 + i * 12 + adj,
      0.5
    )
    addTextToDialog(
      statsGroup,
      ('' + stat[1]).padStart(3, ' '),
      `stat-${stat[0]}`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      101.5 - 8,
      70 - 4 + i * 12 + adj,
      0.5
    )
  }

  // Commands

  const commandsGroup = createCommandsDialog(
    statsGroup,
    148.5,
    68.5,
    battleStats.menu.command
  )
  addMenuCommandsToDialog(commandsGroup, 148.5, 68.5, battleStats.menu.command)

  // Equips
  const equips = [
    ['Wpn :', char.equip.weapon.name ? char.equip.weapon.name : ''],
    ['Arm :', char.equip.armor.name ? char.equip.armor.name : ''],
    ['Acc :', char.equip.accessory.name ? char.equip.accessory.name : '']
  ]

  for (let i = 0; i < equips.length; i++) {
    const equip = equips[i]
    addTextToDialog(
      statsGroup,
      equip[0],
      `stat-label-equip${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Cyan,
      154.5 - 8,
      166.5 - 4 + i * 32,
      0.5
    )
    // console.log('status equip', i, equip)
    addTextToDialog(
      statsGroup,
      equip[1],
      `stat-equip-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      188 - 8,
      166.5 - 4 + i * 32,
      0.5
    )
  }

  createEquipmentMateriaViewer(
    statsGroup,
    178.5,
    159,
    getWeaponDataFromItemId(char.equip.weapon.itemId).materiaSlots,
    char,
    EQUIPMENT_TYPE.WEAPON
  )
  createEquipmentMateriaViewer(
    statsGroup,
    178.5,
    159 + 32,
    getArmorDataFromItemId(char.equip.armor.itemId).materiaSlots,
    char,
    EQUIPMENT_TYPE.ARMOR
  )
}
const addPartyMemberElements = (char, battleStats) => {
  while (elementGroup.children.length) {
    elementGroup.remove(elementGroup.children[0])
  }
  // console.log('status elements char', char, battleStats)

  addTextToDialog(
    elementGroup,
    'Element',
    'status-element-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    18 - 8,
    70 - 4,
    0.5
  )
  addTextToDialog(
    elementGroup,
    'Attack',
    'status-element-attack-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    87 - 4,
    0.5
  )
  addTextToDialog(
    elementGroup,
    'Half',
    'status-element-half-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    123.5 - 4,
    0.5
  )
  addTextToDialog(
    elementGroup,
    'Invalid',
    'status-element-invalid-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    160 - 4,
    0.5
  )
  addTextToDialog(
    elementGroup,
    'Absorb',
    'status-element-absorb-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    196.5 - 4,
    0.5
  )

  const elements = [
    // display text, element enum, x, y
    ['Fire', 'Fire', 0, 0],
    ['Ice', 'Ice', 25.5, 0],
    ['Lightning', 'Bolt', 46, 0],
    ['Earth', 'Earth', 96, 0],
    ['Poison', 'Poison', 129.5, 0],
    ['Gravity', 'Gravity', 166.5, 0],
    ['Water', 'Water', 0, 15],
    ['Wind', 'Wind', 37, 15],
    ['Holy', 'Holy', 67.5, 15]
  ]
  const xPos = 69
  const yPos = [87, 123.5, 160, 196.5]
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    addTextToDialog(
      elementGroup,
      element[0],
      `status-element-${element[1]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.elements.attack.includes(element[1])
        ? LETTER_COLORS.White
        : LETTER_COLORS.Gray,
      xPos + element[2] - 8,
      yPos[0] + element[3] - 4,
      0.5
    )
    addTextToDialog(
      elementGroup,
      element[0],
      `status-element-${element[1]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.elements.half.includes(element[1])
        ? LETTER_COLORS.White
        : LETTER_COLORS.Gray,
      xPos + element[2] - 8,
      yPos[1] + element[3] - 4,
      0.5
    )
    addTextToDialog(
      elementGroup,
      element[0],
      `status-element-${element[1]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.elements.nullify.includes(element[1])
        ? LETTER_COLORS.White
        : LETTER_COLORS.Gray,
      xPos + element[2] - 8,
      yPos[2] + element[3] - 4,
      0.5
    )
    addTextToDialog(
      elementGroup,
      element[0],
      `status-element-${element[0]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.elements.absorb.includes(element[1])
        ? LETTER_COLORS.White
        : LETTER_COLORS.Gray,
      xPos + element[2] - 8,
      yPos[3] + element[3] - 4,
      0.5
    )
  }

  elementGroup.visible = true
  window.elementGroup = elementGroup
}
const addPartyMemberStatus = (char, battleStats) => {
  while (statusesGroup.children.length) {
    statusesGroup.remove(statusesGroup.children[0])
  }
  // console.log('status status char', char, battleStats)

  addTextToDialog(
    statusesGroup,
    'Effect',
    'status-status-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    6.5 - 8,
    70 - 4,
    0.5
  )
  addTextToDialog(
    statusesGroup,
    'Attack',
    'status-status-attack-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    9.5 - 8,
    85 - 4,
    0.5
  )
  addTextToDialog(
    statusesGroup,
    'Defend',
    'status-status-defend-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    9.5 - 8,
    162 - 4,
    0.5
  )

  const statuses = [
    // display text, status enum, x, y
    ['Death', 'Death', 0, 0],
    ['Near-death', 'NearDeath', 32.5, 0],
    ['Sleep', 'Sleep', 89.5, 0],
    ['Poison', 'Poison', 118.5, 0],
    ['Sadness', 'Sadness', 152, 0],
    ['Fury', 'Fury', 193.5, 0],

    ['Confusion', 'Confusion', 0, 15],
    ['Silence', 'Silence', 50, 15],
    ['Haste', 'Haste', 85.5, 15],
    ['Slow', 'Slow', 117, 15],
    ['Stop', 'Stop', 144, 15],
    ['Frog', 'Frog', 170, 15],
    ['Small', 'Small', 195.5, 15],

    ['Slow-numb', 'SlowNumb', 0, 30],
    ['Petrify', 'Petrify', 56.5, 30],
    ['Regen', 'Regen', 93, 30],
    ['Barrier', 'Barrier', 125.5, 30],
    ['MBarrier', 'MBarrier', 161, 30],
    ['Reflect', 'Reflect', 205.5, 30],

    ['Shield', 'Shield', 0, 45],
    ['Death-sentence', 'DeathSentence', 31, 45],
    ['Manipulate', 'Manipulate', 108.5, 45],
    ['Berserk', 'Berserk', 164, 45],
    ['Peerless', 'Peerless', 202.5, 45],

    ['Paralysed', 'Paralysis', 0, 60],
    ['Darkness', 'Darkness', 48.5, 60]
  ]
  const xPos = 47
  const yPos = [85, 162]
  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i]
    // console.log('status test', battleStats.statuses, status[1], battleStats.statuses.attack.includes(status[1]), battleStats.statuses.attack.includes(status[2]))
    addTextToDialog(
      statusesGroup,
      status[0],
      `status-element-${status[1]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.statuses.attack.includes(status[1])
        ? LETTER_COLORS.White
        : LETTER_COLORS.Gray,
      xPos + status[2] - 8,
      yPos[0] + status[3] - 4,
      0.5
    )
    addTextToDialog(
      statusesGroup,
      status[0],
      `status-element-${status[1]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.statuses.nullify.includes(status[1])
        ? LETTER_COLORS.White
        : LETTER_COLORS.Gray,
      xPos + status[2] - 8,
      yPos[1] + status[3] - 4,
      0.5
    )
  }

  statusesGroup.visible = true
  window.statusesGroup = statusesGroup
}

const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  movePointer(POINTERS.pointer1, 0, 0, true)
  await fadeOverlayIn(getMenuBlackOverlay())
  statusDialog.visible = false
  stopAllLimitBarTweens()
  stopAllLimitTextTweens()
  fadeInHomeMenu()
}
const switchPartyMember = delta => {
  let newMember = false
  let potential = STATUS_DATA.partyMember
  while (newMember === false) {
    potential = potential + delta
    if (potential > 2) {
      potential = 0
    } else if (potential < 0) {
      potential = 2
    }
    if (window.data.savemap.party.members[potential] !== 'None') {
      newMember = potential
    }
  }
  STATUS_DATA.partyMember = newMember
  stopAllLimitBarTweens()
  stopAllLimitTextTweens()
  populatePagesForCharacter()
  displayPage()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU STATUS', key, firstPress, state)
  if (state === 'status-stats') {
    if (key === KEY.X) {
      await exitMenu()
    } else if (key === KEY.O) {
      loadNextPage()
    } else if (key === KEY.L1) {
      switchPartyMember(-1)
    } else if (key === KEY.R1) {
      switchPartyMember(1)
    }
  }
}
export { loadStatusMenu, keyPress }

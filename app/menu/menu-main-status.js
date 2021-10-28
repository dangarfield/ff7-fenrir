import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getMenuState, setMenuState } from './menu-module.js'
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
  createEquipmentMateriaViewer
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { getBattleStatsForChar } from '../battle/battle-stats.js'

let statusDialog, headerGroup, statsGroup, elementGroup, statusEffectsGroup

const loadStatusMenu = async partyMember => {
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
  statsGroup.visible = true
  statusDialog.add(statsGroup)

  elementGroup = new THREE.Group()
  elementGroup.userData = { id: 15, z: 100 - 15 }
  elementGroup.position.z = 12
  elementGroup.visible = false
  statusDialog.add(elementGroup)

  statusEffectsGroup = new THREE.Group()
  statusEffectsGroup.userData = { id: 15, z: 100 - 15 }
  statusEffectsGroup.position.z = 12
  statusEffectsGroup.visible = false
  statusDialog.add(statusEffectsGroup)

  statusDialog.visible = true
  window.statusDialog = statusDialog
  addPartyMemberHeader(partyMember)
  // addPartyMemberStats(partyMember)
  // addPartyMemberElements(partyMember)
  addPartyMemberStatus(partyMember)
  await fadeOverlayOut(getHomeBlackOverlay())
  setMenuState('status-stats')
}

const addPartyMemberHeader = (partyMember) => {
  while (headerGroup.children.length) {
    headerGroup.remove(headerGroup.children[0])
  }
  const char = window.data.savemap.characters[window.data.savemap.party.members[partyMember]]
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
    char.status.statusFlags === 'None' ? null : char.status.statusFlags,
    char.level.current,
    char.stats.hp.current,
    char.stats.hp.max,
    char.stats.mp.current,
    char.stats.mp.max
  )

  // EXP
  addTextToDialog(
    headerGroup,
    `EXP:`,
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
    `status-exp`,
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
    `next level:`,
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
    `status-exp-next`,
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
    `Limit level:`,
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
const addPartyMemberStats = (partyMember) => {
  while (statsGroup.children.length) {
    statsGroup.remove(statsGroup.children[0])
  }
  const char = window.data.savemap.characters[window.data.savemap.party.members[partyMember]]
  const battleStats = getBattleStatsForChar(char)
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
      70 - 4 + (i * 12) + adj,
      0.5
    )
    addTextToDialog(
      statsGroup,
      ('' + stat[1]).padStart(3, ' '),
      `stat-${stat[0]}`,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White,
      101.5 - 8,
      70 - 4 + (i * 12) + adj,
      0.5
    )
  }

  // Commands
  // TODO - Finish this
  const commandDialog = createDialogBox({
    id: 15,
    name: 'commandDialog',
    w: 50,
    h: 60,
    x: 148.5,
    y: 68.5,
    expandInstantly: true,
    noClipping: true
  })
  commandDialog.visible = true
  statsGroup.add(commandDialog)
  addTextToDialog(
    commandDialog,
    'Attack',
    `stat-cmd`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    153.5 - 8,
    84 - 4,
    0.5
  )
  addTextToDialog(
    commandDialog,
    'Magic',
    `stat-cmd`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    153.5 - 8,
    84 - 4 + 13,
    0.5
  )
  addTextToDialog(
    commandDialog,
    'Item',
    `stat-cmd`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    153.5 - 8,
    84 - 4 + (13 * 3),
    0.5
  )

  // Equips
  const equips = [
    ['Wpn :', char.equip.weapon.index < 255 ? char.equip.weapon.name : ''],
    ['Arm :', char.equip.armor.index < 255 ? char.equip.armor.name : ''],
    ['Acc :', char.equip.accessory.index < 255 ? char.equip.accessory.name : '']
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
      166.5 - 4 + (i * 32),
      0.5
    )
    console.log('status equip', i, equip)
    addTextToDialog(
      statsGroup,
      equip[1],
      `stat-equip-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      188 - 8,
      166.5 - 4 + (i * 32),
      0.5
    )
  }

  createEquipmentMateriaViewer(statsGroup,
    178.5,
    159,
    window.data.kernel.weaponData[char.equip.weapon.index].materiaSlots,
    weaponMateriaTypes(char)
  )
  createEquipmentMateriaViewer(statsGroup,
    178.5,
    159 + 32,
    window.data.kernel.armorData[char.equip.armor.index].materiaSlots,
    armorMateriaTypes(char)
  )
}
const addPartyMemberElements = (partyMember) => {
  while (elementGroup.children.length) {
    elementGroup.remove(elementGroup.children[0])
  }
  const char = window.data.savemap.characters[window.data.savemap.party.members[partyMember]]
  const battleStats = getBattleStatsForChar(char)
  console.log('status elements char', char, battleStats)

  addTextToDialog(
    elementGroup,
    `Element`,
    'status-element-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    18 - 8,
    70 - 4,
    0.5
  )
  addTextToDialog(
    elementGroup,
    `Attack`,
    'status-element-attack-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    87 - 4,
    0.5
  )
  addTextToDialog(
    elementGroup,
    `Halve`,
    'status-element-halve-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    123.5 - 4,
    0.5
  )
  addTextToDialog(
    elementGroup,
    `Invalid`,
    'status-element-invalid-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    160 - 4,
    0.5
  )
  addTextToDialog(
    elementGroup,
    `Absorb`,
    'status-element-absorb-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    196.5 - 4,
    0.5
  )

  const elements = [
    ['Fire', 0, 0],
    ['Ice', 25.5, 0],
    ['Lightning', 46, 0],
    ['Earth', 96, 0],
    ['Poison', 129.5, 0],
    ['Gravity', 166.5, 0],
    ['Water', 0, 15],
    ['Wind', 37, 15],
    ['Holy', 67.5, 15]
  ]
  const xPos = 69
  const yPos = [87, 123.5, 160, 196.5]
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    addTextToDialog(
      elementGroup,
      element[0],
      `status-element-${element[0]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.elements.attack.includes(element[0]) ? LETTER_COLORS.White : LETTER_COLORS.Gray,
      xPos + element[1] - 8,
      yPos[0] + element[2] - 4,
      0.5
    )
    addTextToDialog(
      elementGroup,
      element[0],
      `status-element-${element[0]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.elements.halve.includes(element[0]) ? LETTER_COLORS.White : LETTER_COLORS.Gray,
      xPos + element[1] - 8,
      yPos[1] + element[2] - 4,
      0.5
    )
    addTextToDialog(
      elementGroup,
      element[0],
      `status-element-${element[0]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.elements.invalid.includes(element[0]) ? LETTER_COLORS.White : LETTER_COLORS.Gray,
      xPos + element[1] - 8,
      yPos[2] + element[2] - 4,
      0.5
    )
    addTextToDialog(
      elementGroup,
      element[0],
      `status-element-${element[0]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.elements.absorb.includes(element[0]) ? LETTER_COLORS.White : LETTER_COLORS.Gray,
      xPos + element[1] - 8,
      yPos[3] + element[2] - 4,
      0.5
    )
  }

  elementGroup.visible = true
  window.elementGroup = elementGroup
}
const addPartyMemberStatus = (partyMember) => {
  while (statusEffectsGroup.children.length) {
    statusEffectsGroup.remove(statusEffectsGroup.children[0])
  }
  const char = window.data.savemap.characters[window.data.savemap.party.members[partyMember]]
  const battleStats = getBattleStatsForChar(char)
  console.log('status status char', char, battleStats)

  addTextToDialog(
    statusEffectsGroup,
    `Effect`,
    'status-status-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    18 - 8,
    70 - 4,
    0.5
  )
  addTextToDialog(
    statusEffectsGroup,
    `Attack`,
    'status-status-attack-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    87 - 4,
    0.5
  )
  addTextToDialog(
    statusEffectsGroup,
    `Defend`,
    'status-status-defend-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    31.5 - 8,
    123.5 - 4,
    0.5
  )

  const statuses = [
    ['Death', 0, 0],
    ['Near-death', 25.5, 0],
    ['Sleep', 46, 0],
    ['Poison', 96, 0],
    ['Sadness', 129.5, 0],
    ['Fury', 166.5, 0],

    ['Confusion', 0, 15],
    ['Silence', 25.5, 15],
    ['Haste', 46, 15],
    ['Slow', 96, 15],
    ['Stop', 129.5, 15],
    ['Frog', 166.5, 15],
    ['Small', 185.5, 15],

    ['Slow-numb', 0, 30],
    ['Petrify', 25.5, 30],
    ['Regen', 46, 30],
    ['Barrier', 96, 30],
    ['MBarrier', 129.5, 30],
    ['Reflect', 166.5, 30],

    ['Shield', 0, 45],
    ['Death-sentence', 25.5, 45],
    ['Manipulate', 46, 45],
    ['Berserk', 96, 45],
    ['Peerless', 129.5, 45],

    ['Paralysed', 0, 60],
    ['Darkness', 25.5, 60]
  ]
  const xPos = 69
  const yPos = [87, 160]
  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i]
    addTextToDialog(
      statusEffectsGroup,
      status[0],
      `status-element-${status[0]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.statusEffects.attack.includes(status[0]) ? LETTER_COLORS.White : LETTER_COLORS.Gray,
      xPos + status[1] - 8,
      yPos[0] + status[2] - 4,
      0.5
    )
    addTextToDialog(
      statusEffectsGroup,
      status[0],
      `status-element-${status[0]}`,
      LETTER_TYPES.MenuBaseFont,
      battleStats.statusEffects.defend.includes(status[0]) ? LETTER_COLORS.White : LETTER_COLORS.Gray,
      xPos + status[1] - 8,
      yPos[1] + status[2] - 4,
      0.5
    )
  }

  statusEffectsGroup.visible = true
  window.statusEffectsGroup = statusEffectsGroup
}

const weaponMateriaTypes = (char) => {
  const materiaTypes = []
  for (let i = 1; i < 9; i++) {
    materiaTypes.push(char.materia[`weaponMateria${i}`].id < 255 ? window.data.kernel.materiaData[char.materia[`weaponMateria${i}`].id].type : 'None')
  }
  return materiaTypes
}
const armorMateriaTypes = (char) => {
  const materiaTypes = []
  for (let i = 1; i < 9; i++) {
    materiaTypes.push(char.materia[`armorMateria${i}`].id < 255 ? window.data.kernel.materiaData[char.materia[`armorMateria${i}`].id].type : 'None')
  }
  return materiaTypes
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  movePointer(POINTERS.pointer1, 0, 0, true)
  await fadeOverlayIn(getHomeBlackOverlay())
  statusDialog.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU STATUS', key, firstPress, state)
  if (state === 'status-stats') {
    if (key === KEY.X) {
      await exitMenu()
    }
  }
}
export { loadStatusMenu, keyPress }

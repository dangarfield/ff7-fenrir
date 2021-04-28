import * as THREE from '../../assets/threejs-r118/three.module.js'
import { setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  WINDOW_COLORS_SUMMARY,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  addCharacterSummary,
  addImageToDialog,
  addLimitToDialog,
  showDialog,
  closeDialog
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'

let limitActions, limitDesc, limitList, limitConfirm, limitConfirmComplete
let limitActionsGroup, limitDescGroup, limitListGroup

const loadLimitMenu = async partyMember => {
  limitActions = await createDialogBox({
    id: 5,
    name: 'limitActions',
    w: 320,
    h: 60,
    x: 0,
    y: 0,
    expandInstantly: true
  })
  limitActionsGroup = new THREE.Group()
  limitActionsGroup.userData = { id: 5, z: 100 - 5 }
  limitActions.add(limitActionsGroup)
  limitActions.visible = true
  window.limitActionsGroup = limitActionsGroup

  limitDesc = await createDialogBox({
    id: 6,
    name: 'limitDesc',
    w: 320,
    h: 25.5,
    x: 0,
    y: 60,
    expandInstantly: true
  })
  limitDescGroup = new THREE.Group()
  limitDescGroup.userData = { id: 6, z: 100 - 6 }
  // limitDescGroup.position.x = 20
  // limitDescGroup.position.y = -60
  // limitDescGroup.userData.z = 100 - 6
  limitDesc.add(limitDescGroup)
  limitDesc.visible = true
  window.limitDescGroup = limitDescGroup

  limitList = await createDialogBox({
    id: 7,
    name: 'limitList',
    w: 320,
    h: 160,
    x: 0,
    y: 80,
    expandInstantly: true
  })
  limitListGroup = new THREE.Group()
  limitListGroup.userData = { id: 7, z: 100 - 7 }
  limitListGroup.position.x = 20
  limitListGroup.position.y = -102.5
  limitListGroup.userData.z = 100 - 7
  limitList.add(limitListGroup)
  limitList.visible = true
  window.limitListGroup = limitListGroup

  limitConfirm = await createDialogBox({
    id: 4,
    name: 'limitConfirm',
    w: 167,
    h: 89,
    x: 76.5,
    y: 31,
    expandInstantly: true
  })
  window.limitConfirm = limitConfirm
  limitConfirmComplete = await createDialogBox({
    id: 3,
    name: 'limitConfirmComplete',
    w: 58.5,
    h: 25, // 30
    x: 121,
    y: 101.5,
    colors: WINDOW_COLORS_SUMMARY.DIALOG_SPECIAL
  })
  // limitConfirmComplete.visible = true
  window.limitConfirmComplete = limitConfirmComplete
  drawConfirm()

  drawAll(partyMember)

  window.itemActions = limitActions
  await fadeOverlayOut(getHomeBlackOverlay())
  ACTION_POSITIONS.action = 0
  loadActionSelection()
}
const drawConfirm = () => {
  addTextToDialog(
    limitConfirm,
    'To change BREAK LEVEL,',
    'limit-confirm-1',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    75.5,
    43.5,
    0.5
  )
  addTextToDialog(
    limitConfirm,
    'it will begin from Limit Point 0.',
    'limit-confirm-2',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    75.5,
    43.5 + 1 * 17,
    0.5
  )
  addTextToDialog(
    limitConfirm,
    'Change BREAK LEVEL?',
    'limit-confirm-3',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    75.5,
    43.5 + 2 * 17,
    0.5
  )

  addTextToDialog(
    limitConfirm,
    'Yes',
    'limit-confirm-yes',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    140.5,
    44 + 3 * 17,
    0.5
  )
  addTextToDialog(
    limitConfirm,
    'No',
    'limit-confirm-no',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    140.5,
    39.5 + 4 * 17,
    0.5
  )
  addTextToDialog(
    limitConfirmComplete,
    'Limit Set!',
    'limit-confirm-set',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    120,
    113.5,
    0.5
  )
}
const LIMIT_DATA = {
  member: 0,
  levelPositions: [
    { x: 0, y: 0 },
    { x: 146, y: 0 },
    { x: 0, y: -68.5 },
    { x: 146, y: -68.5 }
  ],
  level: 0,
  limit: 0,
  confirm: false
}
window.LIMIT_DATA = LIMIT_DATA
const drawAll = partyMember => {
  // Remove everything that was already drawn
  while (limitActionsGroup.children.length) {
    limitActionsGroup.remove(limitActionsGroup.children[0])
  }
  while (limitDescGroup.children.length) {
    limitDescGroup.remove(limitDescGroup.children[0])
  }
  while (limitListGroup.children.length) {
    limitListGroup.remove(limitListGroup.children[0])
  }
  console.log('limit partyMember', partyMember, typeof partyMember)
  LIMIT_DATA.member = partyMember
  const char =
    window.data.savemap.characters[
      window.data.savemap.party.members[LIMIT_DATA.member]
    ]
  addCharacterSummary(
    limitActionsGroup,
    LIMIT_DATA.member,
    46.5,
    16,
    char.name,
    char.status.statusFlags === 'None' ? null : char.status.statusFlags,
    char.level.current,
    char.stats.hp.current,
    char.stats.hp.max,
    char.stats.mp.current,
    char.stats.mp.max
  )
  addImageToDialog(
    limitActionsGroup,
    'profiles',
    window.data.savemap.party.members[LIMIT_DATA.member],
    'profile-image',
    30,
    28.5,
    0.5
  )
  addTextToDialog(
    limitActionsGroup,
    'Limit level',
    'limit-level-title',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    155.5,
    15.5,
    0.5
  )
  addTextToDialog(
    limitActionsGroup,
    '' + char.limit.level,
    'limit-level-title',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    204.5,
    15.5,
    0.5
  )

  addTextToDialog(
    limitActionsGroup,
    'Set',
    'limit-level-set',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    160.5,
    46.5,
    0.5
  )
  addTextToDialog(
    limitActionsGroup,
    'Check',
    'limit-level-check',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    200.5,
    46.5,
    0.5
  )
  addLimitToDialog(limitActionsGroup, 200, 25.5, char)
  drawLimitList(window.data.savemap.party.members[LIMIT_DATA.member], char)
}
const getAvailableLimitSkillsForCharacter = (charName, char) => {
  // Not sure exactly where to get this skills list other than kernel.bin
  const allLimits = [
    ['Limit_1_1', 'Limit_1_2'],
    ['Limit_2_1', 'Limit_2_2'],
    ['Limit_3_1', 'Limit_3_2'],
    ['Limit_4_1']
  ]
  const caitLimits = [['Limit_1_1'], ['Limit_2_1']]
  const vincentLimits = [
    ['Limit_1_1'],
    ['Limit_2_1'],
    ['Limit_3_1'],
    ['Limit_4_1']
  ]
  const noLimits = [[]]
  if (charName === 'Cloud') return getLimitSkills(char, allLimits, 128)
  if (charName === 'Barret') return getLimitSkills(char, allLimits, 135)
  if (charName === 'Tifa') return getLimitSkills(char, allLimits, 98)
  if (charName === 'Aeris') return getLimitSkills(char, allLimits, 142)
  if (charName === 'RedXIII') return getLimitSkills(char, allLimits, 163)
  if (charName === 'Yuffie') return getLimitSkills(char, allLimits, 177)
  if (charName === 'CaitSith') return getLimitSkills(char, caitLimits, 170, 2)
  if (charName === 'Vincent') return getLimitSkills(char, vincentLimits, 173)
  if (charName === 'Cid') return getLimitSkills(char, allLimits, 156)
  // Not sure what will happen here, these char names will probably set to Vincent etc
  if (charName === 'YoungCloud') return getLimitSkills(char, allLimits, 128)
  if (charName === 'Sephiroth') return getLimitSkills(char, noLimits, 128)
  if (charName === 'Chocobo') return getLimitSkills(char, noLimits, 128)
}
const getLimitSkills = (char, potentialLimits, magicNameIndex, skip) => {
  const skills = []
  let counter = 0
  for (let i = 0; i < potentialLimits.length; i++) {
    const potentialLimitLevel = potentialLimits[i]
    skills.push([])
    for (let j = 0; j < potentialLimitLevel.length; j++) {
      const potentialLimit = potentialLimitLevel[j]
      if (char.limit.learnedLimitSkils.includes(potentialLimit)) {
        // if (true) { // Just temp
        skills[i].push({
          name: window.data.kernel.magicNames[magicNameIndex + counter].replace(
            '{COLOR(2)}',
            ''
          ),
          description: window.data.kernel.magicDescriptions[
            magicNameIndex + counter
          ].replace('{COLOR(2)}', '')
        })
      }
      if (skip) {
        counter = counter + skip
      } else {
        counter++
      }
    }
  }
  return skills
}
const drawLimitList = (charName, char) => {
  LIMIT_DATA.skills = getAvailableLimitSkillsForCharacter(charName, char)
  console.log('limit drawLimitList', LIMIT_DATA.skills)

  for (let i = 0; i < LIMIT_DATA.skills.length; i++) {
    const skillLevel = LIMIT_DATA.skills[i]

    const skillGroup = new THREE.Group()
    skillGroup.position.x = LIMIT_DATA.levelPositions[i].x
    skillGroup.position.y = LIMIT_DATA.levelPositions[i].y
    skillGroup.userData.z = limitListGroup.userData.z
    limitListGroup.add(skillGroup)
    let color = LETTER_COLORS.Gray
    if (skillLevel.length > 0) {
      color = LETTER_COLORS.White
    }
    addTextToDialog(
      skillGroup,
      'LEVEL ' + (i + 1),
      `limit-level-title-${i}`,
      LETTER_TYPES.MenuBaseFont,
      color,
      0,
      0,
      0.5
    )
    for (let j = 0; j < skillLevel.length; j++) {
      const limit = skillLevel[j]
      console.log('limit -> ', limit)
      addTextToDialog(
        skillGroup,
        limit.name,
        `limit-name-${i}-${j}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        9.5,
        13 - j * -17,
        0.5
      )
    }
  }
}
const exitMenu = async () => {
  setMenuState('loading')
  movePointer(POINTERS.pointer1, 0, 0)
  await fadeOverlayIn(getHomeBlackOverlay())
  limitActions.visible = false
  limitDesc.visible = false
  limitList.visible = false
  limitConfirm.visible = false
  limitConfirmComplete.visible = false
  fadeInHomeMenu()
}
const clearDescription = () => {
  while (limitDescGroup.children.length) {
    limitDescGroup.remove(limitDescGroup.children[0])
  }
}
const setDescription = description => {
  clearDescription()
  addTextToDialog(
    limitDescGroup,
    description,
    'description',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    13,
    72.5,
    0.5
  )
}
const ACTION_POSITIONS = {
  x: [156, 196],
  y: 50,
  action: 0,
  actions: ['Set', 'Check']
}
const loadActionSelection = () => {
  setMenuState('limit-action-select')
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y
  )
  movePointer(POINTERS.pointer2, 0, 0, true, false)
  clearDescription()
}
const limitActionConfirm = () => {
  if (ACTION_POSITIONS.actions[ACTION_POSITIONS.action] === 'Check') {
    loadCheckLevelSelection()
  } else if (ACTION_POSITIONS.actions[ACTION_POSITIONS.action] === 'Set') {
    loadSetLevelSelection()
  }
}
const limitActionNavigationToggle = () => {
  ACTION_POSITIONS.action = ACTION_POSITIONS.action === 0 ? 1 : 0
  loadActionSelection()
}

const loadCheckLevelSelection = () => {
  setMenuState('limit-check-level')
  LIMIT_DATA.level = 0
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y,
    false,
    true
  )
  movePointer(
    POINTERS.pointer2,
    LIMIT_DATA.levelPositions[LIMIT_DATA.level].x + 10,
    -LIMIT_DATA.levelPositions[LIMIT_DATA.level].y + 109
  )
  setDescription('Select LEVEL.')
}

const limitLevelNavigation = horizontal => {
  let newLevel = 0
  if (LIMIT_DATA.level === 0 && horizontal) {
    newLevel = 1
  } else if (LIMIT_DATA.level === 1 && horizontal) {
    newLevel = 0
  } else if (LIMIT_DATA.level === 2 && horizontal) {
    newLevel = 3
  } else if (LIMIT_DATA.level === 3 && horizontal) {
    newLevel = 2
  } else if (LIMIT_DATA.level === 0 && !horizontal) {
    newLevel = 2
  } else if (LIMIT_DATA.level === 1 && !horizontal) {
    newLevel = 3
  } else if (LIMIT_DATA.level === 2 && !horizontal) {
    newLevel = 0
  } else if (LIMIT_DATA.level === 3 && !horizontal) {
    newLevel = 1
  }
  if (LIMIT_DATA.skills.length > newLevel) {
    LIMIT_DATA.level = newLevel
    movePointer(
      POINTERS.pointer2,
      LIMIT_DATA.levelPositions[LIMIT_DATA.level].x + 10,
      -LIMIT_DATA.levelPositions[LIMIT_DATA.level].y + 109
    )
  }
}
const limitCheckLevelConfirm = () => {
  if (LIMIT_DATA.skills[LIMIT_DATA.level].length > 0) {
    setMenuState('limit-check-limit')
    LIMIT_DATA.limit = 0
    limitCheckSelect()
  }
}
const limitCheckLimitNavigationToggle = () => {
  LIMIT_DATA.limit = 0
  if (
    LIMIT_DATA.skills[LIMIT_DATA.level].length > 1 &&
    LIMIT_DATA.limit === 0
  ) {
    LIMIT_DATA.limit = 1
  }
  limitCheckSelect()
}
const limitCheckSelect = () => {
  setDescription(
    LIMIT_DATA.skills[LIMIT_DATA.level][LIMIT_DATA.limit].description
  )
  movePointer(
    POINTERS.pointer2,
    LIMIT_DATA.levelPositions[LIMIT_DATA.level].x + 24,
    -LIMIT_DATA.levelPositions[LIMIT_DATA.level].y +
      120.5 +
      17 * LIMIT_DATA.limit
  )
}
const loadSetLevelSelection = () => {
  setMenuState('limit-set-level')
  limitConfirm.visible = false
  LIMIT_DATA.level = 0
  movePointer(
    POINTERS.pointer1,
    ACTION_POSITIONS.x[ACTION_POSITIONS.action],
    ACTION_POSITIONS.y,
    false,
    true
  )
  movePointer(
    POINTERS.pointer2,
    LIMIT_DATA.levelPositions[LIMIT_DATA.level].x + 10,
    -LIMIT_DATA.levelPositions[LIMIT_DATA.level].y + 109
  )
  setDescription('Set BREAK LEVEL.')
}

const limitSetLevelConfirm = () => {
  if (LIMIT_DATA.skills[LIMIT_DATA.level].length > 0) {
    setMenuState('limit-set-confirm')
    console.log('limit limitSetLevelConfirm')
    limitConfirm.visible = true
    LIMIT_DATA.confirm = 0
    movePointer(POINTERS.pointer1, 135.5, LIMIT_DATA.confirm ? 99 : 112)
    movePointer(POINTERS.pointer2, 0, 0, true)
  }
}
const limitChangeLevelNavigationToggle = () => {
  LIMIT_DATA.confirm = !LIMIT_DATA.confirm
  movePointer(POINTERS.pointer1, 135.5, LIMIT_DATA.confirm ? 99 : 112)
}
const limitSetLevelConfirmChangeLevel = () => {
  if (LIMIT_DATA.confirm) {
    changeLevel()
  } else {
    loadSetLevelSelection()
  }
}
const changeLevel = async () => {
  setMenuState('loading')
  limitConfirm.visible = false
  movePointer(POINTERS.pointer1, 0, 0, true)
  const char =
    window.data.savemap.characters[
      window.data.savemap.party.members[LIMIT_DATA.member]
    ]
  char.limit.level = LIMIT_DATA.level + 1
  char.limit.bar = 0
  drawAll(LIMIT_DATA.member)
  await showDialog(limitConfirmComplete)
  await sleep(500)
  await closeDialog(limitConfirmComplete)
  loadSetLevelSelection()
}
const limitSwitchPartyMember = delta => {
  let newMember = false
  while (newMember === false) {
    let potential = LIMIT_DATA.member + delta
    if (potential > 2) {
      potential = 0
    } else if (potential < 0) {
      potential = 2
    }
    if (window.data.savemap.party.members[potential] !== 'None') {
      newMember = potential
    }
  }
  LIMIT_DATA.member = newMember
  drawAll(newMember)
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU LIMIT', key, firstPress, state)
  if (state === 'limit-action-select') {
    if (key === KEY.X) {
      exitMenu()
    } else if (key === KEY.O) {
      limitActionConfirm()
    } else if (key === KEY.LEFT) {
      limitActionNavigationToggle()
    } else if (key === KEY.RIGHT) {
      limitActionNavigationToggle()
    } else if (key === KEY.L1) {
      limitSwitchPartyMember(-1)
    } else if (key === KEY.R1) {
      limitSwitchPartyMember(1)
    }
  }
  if (state === 'limit-check-level') {
    if (key === KEY.X) {
      loadActionSelection()
    } else if (key === KEY.O) {
      limitCheckLevelConfirm()
    } else if (key === KEY.UP) {
      limitLevelNavigation(false)
    } else if (key === KEY.DOWN) {
      limitLevelNavigation(false)
    } else if (key === KEY.LEFT) {
      limitLevelNavigation(true)
    } else if (key === KEY.RIGHT) {
      limitLevelNavigation(true)
    }
  }
  if (state === 'limit-check-limit') {
    if (key === KEY.X) {
      loadCheckLevelSelection()
    } else if (key === KEY.UP) {
      limitCheckLimitNavigationToggle()
    } else if (key === KEY.DOWN) {
      limitCheckLimitNavigationToggle()
    }
  }
  if (state === 'limit-set-level') {
    if (key === KEY.X) {
      loadActionSelection()
    } else if (key === KEY.O) {
      limitSetLevelConfirm()
    } else if (key === KEY.UP) {
      limitLevelNavigation(false)
    } else if (key === KEY.DOWN) {
      limitLevelNavigation(false)
    } else if (key === KEY.LEFT) {
      limitLevelNavigation(true)
    } else if (key === KEY.RIGHT) {
      limitLevelNavigation(true)
    }
  }
  if (state === 'limit-set-confirm') {
    if (key === KEY.X) {
      loadSetLevelSelection()
    } else if (key === KEY.O) {
      limitSetLevelConfirmChangeLevel()
    } else if (key === KEY.UP) {
      limitChangeLevelNavigationToggle()
    } else if (key === KEY.DOWN) {
      limitChangeLevelNavigationToggle()
    }
  }
}
export { loadLimitMenu, keyPress }

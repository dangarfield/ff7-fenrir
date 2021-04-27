import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getMenuState, setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  addCharacterSummary,
  addImageToDialog,
  addLimitToDialog
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'

let limitActions, limitDesc, limitList
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

  drawAll(partyMember)

  // await addTextToDialog(
  //   limitActions,
  //   `Limit menu - ${partyMember}`,
  //   'home-loc',
  //   LETTER_TYPES.MenuBaseFont,
  //   LETTER_COLORS.White,
  //   163,
  //   225,
  //   0.5
  // )
  window.itemActions = limitActions
  await fadeOverlayOut(getHomeBlackOverlay())

  setMenuState('limit')

  movePointer(POINTERS.pointer1, 237, 17)
}
const LIMIT_DATA = {
  member: 0
}
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
      // if (char.limit.learnedLimitSkils.includes(potentialLimit)) {
      if (true) {
        // Just temp
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

  const skillGroupPositions = [
    { x: 0, y: 0 },
    { x: 146, y: 0 },
    { x: 0, y: -68.5 },
    { x: 146, y: -68.5 }
  ]
  for (let i = 0; i < LIMIT_DATA.skills.length; i++) {
    const skillLevel = LIMIT_DATA.skills[i]

    const skillGroup = new THREE.Group()
    skillGroup.position.x = skillGroupPositions[i].x
    skillGroup.position.y = skillGroupPositions[i].y
    skillGroup.userData.z = limitListGroup.userData.z
    limitListGroup.add(skillGroup)
    addTextToDialog(
      skillGroup,
      'LEVEL ' + (i + 1),
      `limit-level-title-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
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
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getHomeBlackOverlay())
  limitActions.visible = false
  limitDesc.visible = false
  limitList.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU LIMIT', key, firstPress, state)
  if (state === 'limit') {
    if (key === KEY.X) {
      console.log('press MAIN MENU LIMIT EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    }
  }
}
export { loadLimitMenu, keyPress }

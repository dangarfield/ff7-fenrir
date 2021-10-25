import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getMenuState, setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  addCharacterSummary,
  addImageToDialog,
  fadeOverlayOut,
  fadeOverlayIn
} from './menu-box-helper.js'
import { getHomeBlackOverlay, fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'

let statusDialog, headerGroup, statsGroup, elementGroup, statusGroup
window.statusDialog = statusDialog
window.headerGroup = headerGroup
window.statsGroup = statsGroup
window.elementGroup = elementGroup
window.statusGroup = statusGroup

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
  headerGroup.userData = { id: 4, z: 100 - 4 }
  statusDialog.add(headerGroup)
  headerGroup.visible = true
  console.log('status headerGroup', headerGroup)
  statsGroup = new THREE.Group()
  statsGroup.userData = { id: 5, z: 100 - 5 }
  statusDialog.add(statsGroup)
  statsGroup.visible = true

  elementGroup = new THREE.Group()
  elementGroup.userData = { id: 5, z: 100 - 5 }
  statusDialog.add(elementGroup)
  elementGroup.visible = false

  statusGroup = new THREE.Group()
  statusGroup.userData = { id: 5, z: 100 - 5 }
  statusDialog.add(statusGroup)
  statusGroup.visible = false

  statusDialog.visible = true
  window.statusDialog = statusDialog
  addPartyMemberHeader(partyMember)
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
    statusDialog,
    'profiles',
    window.data.savemap.party.members[partyMember],
    'profile-image',
    28,
    29,
    0.5
  )

  addCharacterSummary(
    statusDialog,
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

  addTextToDialog(
    statusDialog,
    `EXP:`,
    'status-exp-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    123.5 - 8,
    16.5 - 4,
    0.5
  )
  addTextToDialog(
    statusDialog,
    `next level:`,
    'status-next-level-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    123.5 - 8,
    41 - 4,
    0.5
  )
  addTextToDialog(
    statusDialog,
    `Limit level:`,
    'status-limit-level-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    123.5 - 8,
    55 - 4,
    0.5
  )
  addTextToDialog(
    statusDialog,
    ('' + char.level.currentEXP).padStart(14, ' '),
    `status-exp`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    128.5 + 8,
    16.5 - 4,
    0.5
  )
  addTextToDialog(
    statusDialog,
    ('' + char.level.nextLevelEXP).padStart(14, ' '),
    `status-exp-next`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    161 + 8,
    41 - 4,
    0.5
  )
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

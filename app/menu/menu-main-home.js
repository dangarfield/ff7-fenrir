import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  slideFrom,
  slideTo,
  addTextToDialog,
  addImageToDialog,
  addCharacterSummary,
  getLetterTexture,
  POINTERS,
  movePointer,
  shrinkDialog,
  expandDialog,
  fadeOverlayIn,
  fadeOverlayOut,
  addLimitToDialog,
  addLevelToDialog
} from './menu-box-helper.js'
import { stopAllLimitBarTweens } from './menu-limit-tween-helper.js'
import {
  getMenuState,
  setMenuState,
  resolveMenuPromise,
  getMenuBlackOverlay
} from './menu-module.js'
import { loadItemsMenu } from './menu-main-items.js'
import { loadMagicMenu } from './menu-main-magic.js'
import { loadMateriaMenu } from './menu-main-materia.js'
import { loadEquipMenu } from './menu-main-equip.js'
import { loadStatusMenu } from './menu-main-status.js'
import { loadLimitMenu } from './menu-main-limit.js'
import { loadConfigMenu } from './menu-main-config.js'
import { loadPHSMenu } from './menu-main-phs.js'
import { loadSaveMenu } from './menu-main-save.js'

import { getCurrentGameTime, getMenuVisibility, isSaveMenuEnabled } from '../data/savemap-alias.js'
import { KEY } from '../interaction/inputs.js'
import { loadTitleMenu } from './menu-title.js'

let homeNav,
  homeTime,
  homeLocation,
  homeMain,
  char1Group,
  char2Group,
  char3Group
const navOptions = [
  { name: 'Item', display: true },
  { name: 'Magic', display: true },
  { name: 'Materia', display: true },
  { name: 'Equip', display: true },
  { name: 'Status', display: true },
  { name: 'Order', display: true },
  { name: 'Limit', display: true },
  { name: 'Config', display: true },
  { name: 'PHS', display: true },
  { name: 'Save', display: true },
  { name: 'Quit', display: true }
]
const navOptionsMembersRequired = [
  'Magic',
  'Materia',
  'Equip',
  'Status',
  'Limit'
]
const nav = {
  current: 0,
  options: [],
  saveEnabled: false
}

const debugPopulateMenuTestData = () => {
  // Menu Visibility
  window.setBankData(2, 28, 0b1111111111) // Menu visibility
  window.setBankData(1, 75, 0b11000000) // Magic menu

  // Party
  window.data.savemap.party.members = ['Cloud', 'Tifa', 'Barret']
  window.data.savemap.party.phsLocked = { Cloud: 1, Barret: 0, Tifa: 0, Aeris: 0, RedXIII: 1, Yuffie: 0, CaitSith: 0, Vincent: 0, Cid: 1 }
  window.data.savemap.party.phsVisibility = { Cloud: 1, Barret: 1, Tifa: 1, Aeris: 0, RedXIII: 1, Yuffie: 0, CaitSith: 1, Vincent: 1, Cid: 0 }

  // Status
  window.data.savemap.characters.Cloud.status.statusFlags = 'Fury'
  window.data.savemap.characters.Barret.status.statusFlags = 'Sadness'

  // Limit
  window.data.savemap.characters.Cloud.limit.bar = 255
  window.data.savemap.characters.Tifa.limit.bar = 255

  window.debugFillItems()
  window.debugFillMateria()
  window.debugSetEquipmentAndMateria()
  // console.log('magic debugPopulateMenuTestData', window.data.savemap.characters.Cloud.materia)
}
window.debugPopulateMenuTestData = debugPopulateMenuTestData
const loadHomeMenu = async () => {
  // debugPopulateMenuTestData() // Temp

  homeNav = await createDialogBox({
    id: 1,
    name: 'homeNav',
    w: 82,
    h: 156,
    x: 320 - 82,
    y: 0,
    slideX: 0,
    slideY: -240,
    expandInstantly: true,
    noClipping: true
  })
  const homeNav2 = await createDialogBox({
    id: 0.5,
    name: 'homeNav2',
    w: 82,
    h: 25.5,
    x: 320 - 82,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  for (let i = 0; i < 8; i++) {
    homeNav.userData.posAdjustList[i].userData.posShrink =
      homeNav2.userData.posAdjustList[i].userData.posExpand
  }
  for (let i = 0; i < 4; i++) {
    homeNav.userData.sizeAdjustList[i].userData.sizeShrink =
      homeNav2.userData.sizeAdjustList[i].userData.sizeExpand
  }
  homeNav.userData.bg.userData.posShrink =
    homeNav2.userData.bg.userData.posExpand
  homeNav.userData.bg.userData.sizeShrink =
    homeNav2.userData.bg.userData.sizeExpand

  // homeNav2.visible = true
  window.homeNav2 = homeNav2

  const x = 246
  const y = 12
  const d = 13

  // Update menu visibility
  const menuVisibility = getMenuVisibility()
  nav.saveEnabled = isSaveMenuEnabled()
  for (let i = 0; i < menuVisibility.length; i++) {
    navOptions[i].display = menuVisibility[i]
  }
  nav.options = []
  for (let i = 0; i < navOptions.length; i++) {
    const navOption = navOptions[i]
    if (navOption.display) {
      let color = LETTER_COLORS.White
      if (navOption.name === 'Save' && !nav.saveEnabled) {
        color = LETTER_COLORS.Gray
      }
      addTextToDialog(
        homeNav,
        navOption.name,
        `nav-${navOption.name.toLowerCase()}`,
        LETTER_TYPES.MenuBaseFont,
        color,
        x,
        y + d * i,
        0.5
      )
      nav.options.push({
        pointerX: 237,
        pointerY: 17 + 13 * i,
        type: navOption.name
      })
    }
  }
  nav.current = 0

  homeTime = createDialogBox({
    id: 3,
    name: 'homeTime',
    w: 84,
    h: 36,
    x: 320 - 84,
    y: 240 - 31 - 35,
    slideX: -320,
    slideY: 0,
    expandInstantly: true,
    noClipping: true
  })
  addTextToDialog(
    homeTime,
    'Time',
    'home-label-time',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    232,
    186,
    0.5
  )
  addTextToDialog(
    homeTime,
    'Gil',
    'home-label-gil',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    233,
    201,
    0.5
  )

  const gameTime = getCurrentGameTime()
  addTextToDialog(
    homeTime,
    ('' + gameTime.h).padStart(2, '0'),
    'home-time-hrs',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    264,
    186,
    0.5
  )
  addTextToDialog(
    homeTime,
    ('' + gameTime.m).padStart(2, '0'),
    'home-time-mins',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    279,
    186,
    0.5
  )
  addTextToDialog(
    homeTime,
    ('' + gameTime.s).padStart(2, '0'),
    'home-time-secs',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    294,
    186,
    0.5
  )
  addTextToDialog(
    homeTime,
    ':',
    'home-time-colon-1',
    LETTER_TYPES.MenuTextFixed,
    LETTER_COLORS.White,
    273.75,
    187,
    0.5
  )
  addTextToDialog(
    homeTime,
    ':',
    'home-time-colon-2',
    LETTER_TYPES.MenuTextFixed,
    LETTER_COLORS.White,
    288.75,
    187,
    0.5
  )

  addTextToDialog(
    homeTime,
    ('' + window.data.savemap.gil).padStart(9, ' '),
    'home-gil',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    252,
    201,
    0.5
  )
  updateHomeMenuTime()
  homeLocation = await createDialogBox({
    id: 4,
    name: 'homeLocation',
    w: 157,
    h: 29,
    x: 320 - 157,
    y: 240 - 1 - 29,
    slideX: 0,
    slideY: 240,
    expandInstantly: true,
    noClipping: true
  })
  addTextToDialog(
    homeLocation,
    window.data.savemap.location.currentLocation,
    'home-loc',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    163,
    225,
    0.5
  )

  homeMain = await createDialogBox({
    id: 5,
    name: 'homeMain',
    w: 259,
    h: 211,
    x: 0,
    y: 12,
    slideX: 320,
    slideY: 0,
    expandInstantly: true,
    noClipping: true
  })

  char1Group = new THREE.Group()
  char1Group.userData = { id: 4, z: 100 - 4 }
  char1Group.position.y = -31
  homeMain.add(char1Group)

  char2Group = new THREE.Group()
  char2Group.userData = { id: 4, z: 100 - 4 }
  char2Group.position.y = -90.5
  homeMain.add(char2Group)

  char3Group = new THREE.Group()
  char3Group.userData = { id: 4, z: 100 - 4 }
  char3Group.position.y = -150
  homeMain.add(char3Group)
  drawHomeMain()
  window.homeMain = homeMain

  await Promise.all([
    slideFrom(homeNav),
    slideFrom(homeTime),
    slideFrom(homeLocation),
    slideFrom(homeMain)
  ])
  setMenuState('home')
  movePointer(POINTERS.pointer1, 237, 17)
  // Nav pointer position, 217, 3, then -13
}
const drawHomeMain = () => {
  const members = window.data.savemap.party.members
  const charGroups = [char1Group, char2Group, char3Group]
  for (let i = 0; i < members.length; i++) {
    const member = members[i]
    const charGroup = charGroups[i]

    while (charGroup.children.length) {
      charGroup.remove(charGroup.children[0])
    }
    if (member !== 'None') {
      const char = window.data.savemap.characters[member]

      addCharacterSummary(
        charGroup,
        0,
        77,
        0,
        char.name,
        char.status.statusFlags === 'None' ? null : char.status.statusFlags,
        char.level.current,
        char.stats.hp.current,
        char.stats.hp.max,
        char.stats.mp.current,
        char.stats.mp.max
      )
      addImageToDialog(
        charGroup,
        'profiles',
        member,
        `profile-image-${i}`,
        char.status.battleOrder === 'Normal' ? 35.5 : 61.5,
        16.5,
        0.5
      )
      addTextToDialog(
        charGroup,
        'next level',
        `next-level-${i}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        154.5,
        10.5,
        0.5
      )
      addTextToDialog(
        charGroup,
        'Limit level',
        `next-level-${i}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        154.5,
        30.5,
        0.5
      )
      addLevelToDialog(charGroup, 200, 19.5, char)
      addLimitToDialog(charGroup, 200, 39.5, char)
    }
  }
  return charGroups
}
window.drawHomeMain = drawHomeMain

const testColor = (i, j) => {
  // May be useful to find all the interpolated battle guage colours later on
  const c = [
    'rgb(38,38,38)',
    'rgb(126,38,38)',
    'rgb(38,126,38)',
    'rgb(38,38,126)',
    'rgb(126,76,38)',
    'rgb(126,38,76)',
    'rgb(76,126,38)',
    'rgb(76,38,126)'
  ]
  if (j === 1) {
    return ['rgb(0,0,0)', 'rgb(0,0,0)', c[i], c[i]]
  } else {
    return ['rgb(126,126,126)', 'rgb(126,126,126)', c[i], c[i]]
  }
}
const updateHomeMenuTime = async () => {
  if (getMenuState() === 'home') {
    const gameTime = getCurrentGameTime()
    const hSplit = ('' + gameTime.h).padStart(2, '0').split('')
    const h1 = hSplit[0]
    const h2 = hSplit[1]
    const mSplit = ('' + gameTime.m).padStart(2, '0').split('')
    const m1 = mSplit[0]
    const m2 = mSplit[1]
    const sSplit = ('' + gameTime.s).padStart(2, '0').split('')
    const s1 = sSplit[0]
    const s2 = sSplit[1]

    const hrsGroup = homeTime.children.filter(
      f => f.userData.id === 'home-time-hrs'
    )[0]
    hrsGroup.userData.text = hSplit.join('')
    hrsGroup.children[0].material.map = getLetterTexture(
      h1,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White
    ).texture
    hrsGroup.children[1].material.map = getLetterTexture(
      h2,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White
    ).texture

    const minsGroup = homeTime.children.filter(
      f => f.userData.id === 'home-time-mins'
    )[0]
    minsGroup.userData.text = mSplit.join('')
    minsGroup.children[0].material.map = getLetterTexture(
      m1,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White
    ).texture
    minsGroup.children[1].material.map = getLetterTexture(
      m2,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White
    ).texture

    const secsGroup = homeTime.children.filter(
      f => f.userData.id === 'home-time-secs'
    )[0]
    secsGroup.userData.text = sSplit.join('')
    secsGroup.children[0].material.map = getLetterTexture(
      s1,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White
    ).texture
    secsGroup.children[1].material.map = getLetterTexture(
      s2,
      LETTER_TYPES.MenuTextStats,
      LETTER_COLORS.White
    ).texture

    const colon1Group = homeTime.children.filter(
      f => f.userData.id === 'home-time-colon-1'
    )[0]
    colon1Group.children[0].material.map = getLetterTexture(
      ':',
      LETTER_TYPES.MenuTextFixed,
      LETTER_COLORS.White
    ).texture
    const colon2Group = homeTime.children.filter(
      f => f.userData.id === 'home-time-colon-2'
    )[0]
    colon2Group.children[0].material.map = getLetterTexture(
      ':',
      LETTER_TYPES.MenuTextFixed,
      LETTER_COLORS.White
    ).texture

    setTimeout(() => {
      console.log('change colon')
      colon1Group.children[0].material.map = getLetterTexture(
        ':',
        LETTER_TYPES.MenuTextFixed,
        LETTER_COLORS.Gray
      ).texture
      colon2Group.children[0].material.map = getLetterTexture(
        ':',
        LETTER_TYPES.MenuTextFixed,
        LETTER_COLORS.Gray
      ).texture
    }, 500)
  }
}
const slideOutMainMenu = async () => {
  setMenuState('loading')
  await Promise.all([
    slideTo(homeNav),
    slideTo(homeTime),
    slideTo(homeLocation),
    slideTo(homeMain)
  ])
}
const navNavigation = up => {
  if (up) {
    if (nav.current - 1 < 0) {
      nav.current = nav.options.length - 1
    } else {
      nav.current--
    }
  } else {
    if (nav.current + 1 >= nav.options.length) {
      nav.current = 0
    } else {
      nav.current++
    }
  }
  movePointer(
    POINTERS.pointer1,
    nav.options[nav.current].pointerX,
    nav.options[nav.current].pointerY
  )
}
const SELECT_PARTY_MEMBER_POSITIONS = {
  x: 10,
  y: [53, 113, 173],
  from: 0,
  to: 0,
  adjust: { x: 3, y: 7 },
  type: '',
  member: 0
}

const navSelectOrderFromLoad = () => {
  console.log('navSelectOrderFromLoad')
  setMenuState('home-order-from')
  movePointer(
    POINTERS.pointer1,
    nav.options[nav.current].pointerX,
    nav.options[nav.current].pointerY,
    false,
    true
  )
  movePointer(
    POINTERS.pointer2,
    SELECT_PARTY_MEMBER_POSITIONS.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.from]
  )
  movePointer(POINTERS.pointer3, 0, 0, true)
}
const navSelectOrderFromNavigation = up => {
  console.log('navSelectOrderFromNavigation', up)
  if (up) {
    if (SELECT_PARTY_MEMBER_POSITIONS.from - 1 < 0) {
      SELECT_PARTY_MEMBER_POSITIONS.from =
        SELECT_PARTY_MEMBER_POSITIONS.y.length - 1
    } else {
      SELECT_PARTY_MEMBER_POSITIONS.from--
    }
  } else {
    if (
      SELECT_PARTY_MEMBER_POSITIONS.from + 1 >=
      SELECT_PARTY_MEMBER_POSITIONS.y.length
    ) {
      SELECT_PARTY_MEMBER_POSITIONS.from = 0
    } else {
      SELECT_PARTY_MEMBER_POSITIONS.from++
    }
  }
  movePointer(
    POINTERS.pointer2,
    SELECT_PARTY_MEMBER_POSITIONS.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.from]
  )
}
const navSelectOrderFromCancel = () => {
  console.log('navSelectOrderFromCancel')
  setMenuState('home')
  movePointer(
    POINTERS.pointer1,
    nav.options[nav.current].pointerX,
    nav.options[nav.current].pointerY,
    false
  )
  movePointer(
    POINTERS.pointer2,
    SELECT_PARTY_MEMBER_POSITIONS.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.from],
    true
  )
}
const navSelectOrderFromConfirm = () => {
  console.log('navSelectOrderFromConfirm')
  setMenuState('home-order-to')
  SELECT_PARTY_MEMBER_POSITIONS.to = SELECT_PARTY_MEMBER_POSITIONS.from
  movePointer(
    POINTERS.pointer2,
    SELECT_PARTY_MEMBER_POSITIONS.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.to]
  )
  movePointer(
    POINTERS.pointer3,
    SELECT_PARTY_MEMBER_POSITIONS.x - SELECT_PARTY_MEMBER_POSITIONS.adjust.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.from] -
      SELECT_PARTY_MEMBER_POSITIONS.adjust.y,
    false,
    true
  )
}
const navSelectOrderToNavigation = up => {
  console.log('navSelectOrderToNavigation')
  if (up) {
    if (SELECT_PARTY_MEMBER_POSITIONS.to - 1 < 0) {
      SELECT_PARTY_MEMBER_POSITIONS.to =
        SELECT_PARTY_MEMBER_POSITIONS.y.length - 1
    } else {
      SELECT_PARTY_MEMBER_POSITIONS.to--
    }
  } else {
    if (
      SELECT_PARTY_MEMBER_POSITIONS.to + 1 >=
      SELECT_PARTY_MEMBER_POSITIONS.y.length
    ) {
      SELECT_PARTY_MEMBER_POSITIONS.to = 0
    } else {
      SELECT_PARTY_MEMBER_POSITIONS.to++
    }
  }
  movePointer(
    POINTERS.pointer2,
    SELECT_PARTY_MEMBER_POSITIONS.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.to]
  )
}
const navSelectOrderToConfirm = () => {
  console.log('navSelectOrderToConfirm', SELECT_PARTY_MEMBER_POSITIONS)
  if (SELECT_PARTY_MEMBER_POSITIONS.from !== SELECT_PARTY_MEMBER_POSITIONS.to) {
    const tempMembers = [...window.data.savemap.party.members]
    window.data.savemap.party.members[SELECT_PARTY_MEMBER_POSITIONS.from] =
      tempMembers[SELECT_PARTY_MEMBER_POSITIONS.to]
    window.data.savemap.party.members[SELECT_PARTY_MEMBER_POSITIONS.to] =
      tempMembers[SELECT_PARTY_MEMBER_POSITIONS.from]
    console.log(
      'navSelectOrderToConfirm',
      'swapped pos',
      tempMembers,
      window.data.savemap.party.members
    )
  } else {
    if (
      window.data.savemap.party.members[SELECT_PARTY_MEMBER_POSITIONS.from] ===
      'None'
    ) {
      // Not possile, play sound
      navSelectOrderFromLoad()
      return
    }
    const char = window.data.savemap.characters[window.data.savemap.party.members[SELECT_PARTY_MEMBER_POSITIONS.from]]
    if (char.status.battleOrder === 'Normal') {
      char.status.battleOrder = 'BackRow'
    } else {
      char.status.battleOrder = 'Normal'
    }
    console.log('navSelectOrderToConfirm', 'change row', char)
  }
  drawHomeMain()
  SELECT_PARTY_MEMBER_POSITIONS.from = SELECT_PARTY_MEMBER_POSITIONS.to
  navSelectOrderFromLoad()
}

const navSelectMember = () => {
  console.log('navSelectMember')
  setMenuState('home-nav-select')
  movePointer(
    POINTERS.pointer1,
    nav.options[nav.current].pointerX,
    nav.options[nav.current].pointerY,
    false,
    true
  )
  movePointer(
    POINTERS.pointer2,
    SELECT_PARTY_MEMBER_POSITIONS.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.member]
  )
}
const navSelectNavigation = up => {
  console.log('navSelectNavigation')
  console.log('navSelectOrderToNavigation')
  if (up) {
    if (SELECT_PARTY_MEMBER_POSITIONS.member - 1 < 0) {
      SELECT_PARTY_MEMBER_POSITIONS.member =
        SELECT_PARTY_MEMBER_POSITIONS.y.length - 1
    } else {
      SELECT_PARTY_MEMBER_POSITIONS.member--
    }
  } else {
    if (
      SELECT_PARTY_MEMBER_POSITIONS.member + 1 >=
      SELECT_PARTY_MEMBER_POSITIONS.y.length
    ) {
      SELECT_PARTY_MEMBER_POSITIONS.member = 0
    } else {
      SELECT_PARTY_MEMBER_POSITIONS.member++
    }
  }
  movePointer(
    POINTERS.pointer2,
    SELECT_PARTY_MEMBER_POSITIONS.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.member]
  )
}
const navSelectCancel = () => {
  console.log('navSelectCancel')
  setMenuState('home')
  movePointer(
    POINTERS.pointer1,
    nav.options[nav.current].pointerX,
    nav.options[nav.current].pointerY,
    false
  )
  movePointer(
    POINTERS.pointer2,
    SELECT_PARTY_MEMBER_POSITIONS.x,
    SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.from],
    true
  )
}
const navSelectConfirm = () => {
  console.log('navSelectConfirm', SELECT_PARTY_MEMBER_POSITIONS)
  if (
    window.data.savemap.party.members[SELECT_PARTY_MEMBER_POSITIONS.member] ===
    'None'
  ) {
    // Not possile, play sound
    navSelectMember()
  } else {
    movePointer(
      POINTERS.pointer1,
      nav.options[nav.current].pointerX,
      nav.options[nav.current].pointerY,
      false
    )
    movePointer(
      POINTERS.pointer2,
      SELECT_PARTY_MEMBER_POSITIONS.x,
      SELECT_PARTY_MEMBER_POSITIONS.y[SELECT_PARTY_MEMBER_POSITIONS.from],
      true
    )
    navSlideDown(
      SELECT_PARTY_MEMBER_POSITIONS.type,
      SELECT_PARTY_MEMBER_POSITIONS.member
    )
  }
}

const navSlideDown = async (type, member) => {
  setMenuState('loading') // temp, should be 'loading'
  console.log('Nav Select Slide Down', 'loading', type, member)
  movePointer(
    POINTERS.pointer1,
    nav.options[nav.current].pointerX,
    nav.options[nav.current].pointerY,
    true
  )
  shrinkDialog(homeNav, type)
  await fadeOverlayIn(getMenuBlackOverlay())
  homeTime.visible = false
  homeLocation.visible = false
  homeMain.visible = false
  stopAllLimitBarTweens()
  loadSecondaryMenu(type, member)
}
const navSlideUp = async type => {
  await expandDialog(homeNav, type)
  movePointer(
    POINTERS.pointer1,
    nav.options[nav.current].pointerX,
    nav.options[nav.current].pointerY
  )
  setMenuState('home')
}
const fadeInHomeMenu = async () => {
  drawHomeMain()
  homeTime.visible = true
  homeLocation.visible = true
  homeMain.visible = true
  fadeOverlayOut(getMenuBlackOverlay())
  const selectedNav = nav.options[nav.current]
  navSlideUp(selectedNav.type)
}
const setSelectedNavByName = (name) => {
  console.log('menu setSelectedNavByName', name, homeNav, nav)
  const homeNavGroups = homeNav.children.filter(c => c.type === 'Group')
  for (let i = 0; i < homeNavGroups.length; i++) {
    const childNav = homeNavGroups[i]
    console.log('menu childnav', childNav.userData.type, name, childNav.userData.type === name)
    if (childNav.userData.type === name) {
      nav.current = i
      console.log('menu childnav YES', childNav.userData.type, nav)
      childNav.position.y = nav.current * 13
      childNav.visible = true
    } else {
      childNav.position.y = 0
      childNav.visible = false
    }
  }
}
const loadSecondaryMenu = async (type, member) => {
  console.log('loadSecondaryMenu', type, member)
  if (type === 'Item') {
    loadItemsMenu()
  } else if (type === 'Magic') {
    loadMagicMenu(member)
  } else if (type === 'Materia') {
    loadMateriaMenu(member)
  } else if (type === 'Equip') {
    loadEquipMenu(member)
  } else if (type === 'Status') {
    loadStatusMenu(member)
  } else if (type === 'Limit') {
    loadLimitMenu(member)
  } else if (type === 'Config') {
    loadConfigMenu()
  } else if (type === 'PHS') {
    loadPHSMenu()
  } else if (type === 'Save') {
    loadSaveMenu()
  }
}
const navSelect = async () => {
  const selectedNav = nav.options[nav.current]
  console.log('Nav Select', selectedNav)
  if (selectedNav.type === 'Order') {
    navSelectOrderFromLoad()
  } else if (selectedNav.type === 'Quit') {
    console.log('Nav Select - QUIT - Not implemented')
    movePointer(POINTERS.pointer1, 0, 0, true)
    await slideOutMainMenu()
    stopAllLimitBarTweens()
    loadTitleMenu()
  } else if (navOptionsMembersRequired.includes(selectedNav.type)) {
    console.log('Nav Select member required')
    SELECT_PARTY_MEMBER_POSITIONS.type = selectedNav.type
    navSelectMember()
  } else if (selectedNav.type === 'Save' && !nav.saveEnabled) {
    // Don't do anything
  } else {
    console.log('Nav Select Slide Down')
    navSlideDown(selectedNav.type)
  }
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU HOME', key, firstPress, state)
  if (state === 'home') {
    if (key === KEY.X) {
      console.log('press MAIN MENU HOME EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await slideOutMainMenu()
      stopAllLimitBarTweens()
      resolveMenuPromise()
    } else if (key === KEY.O) {
      console.log('press MAIN MENU HOME SELECT')
      navSelect()
    } else if (key === KEY.UP) {
      console.log('press MAIN MENU HOME UP')
      navNavigation(true)
    } else if (key === KEY.DOWN) {
      console.log('press MAIN MENU HOME DOWN')
      navNavigation(false)
    }
  }
  if (state === 'home-order-from') {
    if (key === KEY.X) {
      navSelectOrderFromCancel()
    } else if (key === KEY.O) {
      navSelectOrderFromConfirm()
    } else if (key === KEY.UP) {
      navSelectOrderFromNavigation(true)
    } else if (key === KEY.DOWN) {
      navSelectOrderFromNavigation(false)
    }
  }
  if (state === 'home-order-to') {
    if (key === KEY.X) {
      navSelectOrderFromLoad()
    } else if (key === KEY.O) {
      navSelectOrderToConfirm()
    } else if (key === KEY.UP) {
      navSelectOrderToNavigation(true)
    } else if (key === KEY.DOWN) {
      navSelectOrderToNavigation(false)
    }
  }
  if (state === 'home-nav-select') {
    if (key === KEY.X) {
      navSelectCancel()
    } else if (key === KEY.O) {
      navSelectConfirm()
    } else if (key === KEY.UP) {
      navSelectNavigation(true)
    } else if (key === KEY.DOWN) {
      navSelectNavigation(false)
    }
  }
}
export {
  loadHomeMenu,
  keyPress,
  updateHomeMenuTime,
  fadeInHomeMenu,
  homeNav,
  setSelectedNavByName
}

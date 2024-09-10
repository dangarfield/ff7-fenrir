import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'
import { getMenuBlackOverlay, setMenuState } from './menu-module.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  addGroupToDialog,
  addCharacterSummary,
  addImageToDialog,
  removeGroupChildren,
  createItemListNavigation
} from './menu-box-helper.js'
import {
  isMagicMenuSummonEnabled,
  isMagicMenuEnemySkillEnabled
} from '../data/savemap-alias.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { getBattleStatsForChar } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog,
  infoDialog,
  typeSelectDialog,
  mpDialog,
  listDialog,
  applyDialog,
  applyNameDialog
let headerGroup,
  abilityGroup,
  infoGroup,
  typeSelectGroup,
  mpGroup,
  listGroup,
  listGroupContents,
  applyGroup,
  applyNameGroup

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  menus: [
    {
      type: 'Magic',
      enabled: true,
      page: 0,
      pos: 0,
      cols: 3,
      state: 'magic-magic'
    },
    {
      type: 'Summon',
      enabled: false,
      page: 0,
      pos: 0,
      cols: 2,
      state: 'magic-summon'
    },
    {
      type: 'Enemy-Skill',
      enabled: false,
      page: 0,
      pos: 0,
      cols: 2,
      state: 'magic-enemyskills'
    }
  ],
  menuCurrent: 0,
  applyCurrent: 0,
  applyAll: false
}
const ALLOWABLE_MENU_MAGIC = [0, 1, 2, 7, 8, 51] // Cure, Cure2, Cure3, Life, Life2, FullCure

const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
  DATA.menus[0].spells = DATA.battleStats.menu.magic
  DATA.menus[1].spells = DATA.battleStats.menu.summon
  DATA.menus[2].spells = DATA.battleStats.menu.enemySkills
}
const setMenuVisibility = () => {
  DATA.menus[1].enabled = isMagicMenuSummonEnabled()
  DATA.menus[2].enabled = isMagicMenuEnemySkillEnabled()
}
const loadMagicMenu = async partyMember => {
  DATA.partyMember = partyMember
  DATA.menuCurrent = 0
  DATA.applyCurrent = 0
  DATA.menus.forEach(m => {
    m.page = 0
    m.pos = 0
  })
  setMenuVisibility()
  setDataFromPartyMember()

  headerDialog = await createDialogBox({
    id: 15,
    name: 'headerDialog',
    w: 253.5,
    h: 81.5,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  headerDialog.visible = true
  headerGroup = addGroupToDialog(headerDialog, 15)
  abilityGroup = addGroupToDialog(headerDialog, 15)

  mpDialog = await createDialogBox({
    id: 15,
    name: 'mpDialog',
    w: 71,
    h: 60.5,
    x: 249,
    y: 21,
    expandInstantly: true,
    noClipping: true
  })
  mpDialog.visible = true
  drawMPNeededImage()
  mpGroup = addGroupToDialog(mpDialog, 15)

  listDialog = await createDialogBox({
    id: 15,
    name: 'listDialog',
    w: 320,
    h: 136,
    x: 0,
    y: 104,
    expandInstantly: true,
    noClipping: false
  })
  listDialog.visible = true
  listGroup = addGroupToDialog(listDialog, 15)
  listGroupContents = addGroupToDialog(listDialog, 15)

  infoDialog = await createDialogBox({
    id: 15,
    name: 'infoDialog',
    w: 320,
    h: 25.5,
    x: 0,
    y: 81.5,
    expandInstantly: true,
    noClipping: true
  })
  infoDialog.visible = true
  infoGroup = addGroupToDialog(infoDialog, 15)

  typeSelectDialog = await createDialogBox({
    id: 15,
    name: 'typeSelectDialog',
    w: 82,
    h: 60.5,
    x: 238,
    y: 21,
    expandInstantly: true,
    noClipping: true
  })
  typeSelectDialog.visible = true
  typeSelectGroup = addGroupToDialog(typeSelectDialog, 15)

  applyDialog = await createDialogBox({
    id: 10,
    name: 'applyDialog',
    w: 146.5,
    h: 183,
    x: 83.5,
    y: 53.5,
    expandInstantly: true,
    noClipping: true
  })
  applyDialog.visible = false
  applyDialog.position.z = 10 // Some weird stuff required here, need to revisit at some point
  applyGroup = addGroupToDialog(applyDialog, 16)

  applyNameDialog = await createDialogBox({
    id: 10,
    name: 'applyNameDialog',
    w: 77,
    h: 25.5,
    x: 160.5,
    y: 32,
    expandInstantly: true,
    noClipping: true
  })
  applyNameDialog.visible = false
  applyNameDialog.position.z = 10
  applyNameGroup = addGroupToDialog(applyNameDialog, 16)

  drawHeaderCharacterSummary()
  drawTypeSelect()
  drawTypeSelectPointer()
  console.log('magic DATA', DATA)
  await fadeOverlayOut(getMenuBlackOverlay())

  setMenuState('magic-type-select')
}
const drawHeaderCharacterSummary = () => {
  removeGroupChildren(headerGroup)
  const charName = window.data.savemap.party.members[DATA.partyMember]
  addImageToDialog(
    headerGroup,
    'profiles',
    charName,
    'profile-image',
    8 + 20,
    19.5 + 24,
    0.5
  )
  addCharacterSummary(
    headerGroup,
    charName,
    51.5 - 8,
    29.5 - 4,
    DATA.char.name,
    DATA.char.status.statusFlags === 'None'
      ? null
      : DATA.char.status.statusFlags,
    DATA.char.level.current,
    DATA.char.stats.hp.current,
    DATA.char.stats.hp.max,
    DATA.char.stats.mp.current,
    DATA.char.stats.mp.max
  )
}
const drawTypeSelectPointer = () => {
  const x = 245 - 10
  const y = 32 + 7
  const yAdj = 17
  movePointer(POINTERS.pointer1, x, y + yAdj * DATA.menuCurrent)
}
const drawTypeSelect = () => {
  for (let i = 0; i < DATA.menus.length; i++) {
    const menu = DATA.menus[i]
    if (menu.enabled) {
      addTextToDialog(
        typeSelectGroup,
        menu.type,
        `magic-type-${i}`,
        LETTER_TYPES.MenuBaseFont,
        LETTER_COLORS.White,
        254 - 8,
        38 - 4 + i * 17,
        0.5
      )
    }
  }
}
const typeSelectNavigation = up => {
  if (up) {
    DATA.menuCurrent++
    if (DATA.menuCurrent > 2) {
      DATA.menuCurrent = 0
    }
  } else {
    DATA.menuCurrent--
    if (DATA.menuCurrent < 0) {
      DATA.menuCurrent = 2
    }
  }
  drawTypeSelectPointer()
}
const getTextRowPosition = (i, cols) => {
  if (cols === 2) {
    return getTwoRowTextPosition(i)
  } else {
    // then cols === 3
    return getThreeRowTextPosition(i)
  }
}
const getTwoRowTextPosition = i => {
  const x = 23.5
  const y = 121.5
  const xAdj = 155 // Needs to change
  const yAdj = 18
  return {
    x: x + (i % 2) * xAdj - 8,
    y: y + Math.trunc(i / 2) * yAdj - 4
  }
}
const getThreeRowTextPosition = i => {
  const x = 38.5
  const y = 121.5
  const xAdj = 84
  const yAdj = 18
  return {
    x: x + (i % 3) * xAdj - 8,
    y: y + Math.trunc(i / 3) * yAdj - 4
  }
}
const drawListPointer = () => {
  const menu = DATA.menus[DATA.menuCurrent]
  if (menu.type === 'Magic') {
    const { x, y } = getThreeRowTextPosition(menu.pos)
    movePointer(POINTERS.pointer1, x - 10.5, y + 5.5)
  }
  if (menu.type === 'Summon' || menu.type === 'Enemy-Skill') {
    const { x, y } = getTwoRowTextPosition(menu.pos)
    movePointer(POINTERS.pointer1, x - 10.5 + 5, y + 5.5)
  }
  movePointer(POINTERS.pointer2, 0, 0, true)
  movePointer(POINTERS.pointer3, 0, 0, true)
}
const drawList = () => {
  removeGroupChildren(listGroup)
  removeGroupChildren(listGroupContents)

  const menu = DATA.menus[DATA.menuCurrent]
  for (let i = 0; i < menu.spells.length; i++) {
    const spell = menu.spells[i]
    const { x, y } = getTextRowPosition(i, menu.cols)
    if (spell.enabled) {
      let color = LETTER_COLORS.White
      if (
        menu.type === 'Magic' &&
        !ALLOWABLE_MENU_MAGIC.includes(spell.index)
      ) {
        color = LETTER_COLORS.Gray
      }

      const textGroup = addTextToDialog(
        listGroupContents,
        spell.name,
        `magic-list-${i}`,
        LETTER_TYPES.MenuBaseFont,
        color,
        x,
        y,
        0.5
      )
      for (let j = 0; j < textGroup.children.length; j++) {
        const textLetters = textGroup.children[j]
        textLetters.material.clippingPlanes =
          listDialog.userData.bg.material.clippingPlanes
      }
    }
  }
  createItemListNavigation(
    listGroup,
    313,
    100 - 32,
    130,
    menu.spells.length / menu.cols,
    7
  )
  listGroup.userData.slider.userData.moveToPage(menu.page)
  listGroupContents.position.y = menu.page * 18
}
const drawMPNeededImage = () => {
  addImageToDialog(
    mpDialog,
    'labels',
    'mp-needed',
    'mp-needed-image',
    282.5,
    38,
    0.5
  )
}
const drawMP = mp => {
  removeGroupChildren(mpGroup)
  if (mp === false) {
    return
  }
  addTextToDialog(
    mpGroup,
    ('' + mp).padStart(3, '0'),
    'magic-mp',
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    261,
    64,
    0.5
  )
}
const drawAbilities = abilities => {
  removeGroupChildren(abilityGroup)

  addTextToDialog(
    abilityGroup,
    'Added-Ability',
    'magic-ability-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    113.5 - 8,
    20.5 - 4,
    0.5
  )
  if (abilities === false) {
    return
  }
  const x = 124
  const y = 32.5
  const xAdj = 60
  const yAdj = 13
  for (let i = 0; i < abilities.length; i++) {
    const ability = abilities[i]
    const xPos = x + Math.trunc(i / 4) * xAdj - 8
    const yPos = y + (i % 4) * yAdj - 4
    addTextToDialog(
      abilityGroup,
      ability.text,
      `magic-ability-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      xPos,
      yPos,
      0.5
    )
    if (ability.hasOwnProperty('count')) {
      addTextToDialog(
        abilityGroup,
        ('' + ability.count).padStart(3, ' '),
        `magic-ability-count-${i}`,
        LETTER_TYPES.MenuTextStats,
        LETTER_COLORS.White,
        xPos + 29.5,
        yPos - 0.5,
        0.5
      )
      addImageToDialog(
        abilityGroup,
        'labels',
        'times',
        `magic-ability-times-${i}`,
        xPos + 60,
        yPos - 0.5,
        0.5
      )
    }

    if (ability.hasOwnProperty('level')) {
      addTextToDialog(
        abilityGroup,
        ('' + ability.level).padStart(3, ' '),
        `magic-ability-level-${i}`,
        LETTER_TYPES.MenuTextStats,
        LETTER_COLORS.White,
        xPos + 35.5,
        yPos - 0.5,
        0.5
      )
    }
  }
  if (abilities.length === 0) {
    addTextToDialog(
      abilityGroup,
      'Nothing.',
      'magic-ability-nothing-label',
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.White,
      128.5 - 8,
      38 - 4,
      0.5
    )
  }
}
const drawInfo = info => {
  removeGroupChildren(infoGroup)
  if (info === false) {
    return
  }
  addTextToDialog(
    mpGroup,
    info,
    'magic-info',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    13.5 - 8,
    98 - 4,
    0.5
  )
}

const updateInfoForSelectedSpell = () => {
  const menu = DATA.menus[DATA.menuCurrent]
  let spell
  if (menu.type === 'Magic') {
    spell = DATA.battleStats.menu.magic[menu.page * 3 + menu.pos]
  } else if (menu.type === 'Summon') {
    spell = DATA.battleStats.menu.summon[menu.page * 2 + menu.pos]
  } else if (menu.type === 'Enemy-Skill') {
    spell = DATA.battleStats.menu.enemySkills[menu.page * 2 + menu.pos]
  }

  const attackData = window.data.kernel.attackData[spell.index]
  if (!spell.enabled) {
    drawMP(false)
    drawAbilities(false)
  } else {
    drawMP(spell.mpCost)
    drawInfo(attackData.description)
    drawAbilities(spell.addedAbilities)
  }
}
const tweenMagicList = (up, state, cb) => {
  setMenuState('magic-tweening-list')
  for (let i = 0; i < DATA.page + 1; i++) {
    listGroupContents.children[i].visible = true
  }
  const from = { y: listGroupContents.position.y }
  const to = {
    y: up
      ? listGroupContents.position.y + 18
      : listGroupContents.position.y - 18
  }
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      listGroupContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < DATA.page; i++) {
        listGroupContents.children[i].visible = false
      }
      setMenuState(state)
      cb()
    })
    .start()
}
const listNavigation = delta => {
  const menu = DATA.menus[DATA.menuCurrent]
  const maxPage = menu.spells.length / menu.cols
  const maxPos = menu.cols * 7 // 21
  const potential = menu.pos + delta
  if (potential < 0) {
    if (menu.page === 0) {
      // console.log('magic listNavigation on first page - do nothing')
    } else {
      // console.log('magic listNavigation not on first page - PAGE DOWN')
      if (delta === -1) {
        menu.pos = menu.pos + (menu.cols - 1)
        drawListPointer()
      }
      menu.page--
      tweenMagicList(false, menu.state, updateInfoForSelectedSpell)
      listGroup.userData.slider.userData.moveToPage(menu.page)
    }
  } else if (potential >= maxPos) {
    // console.log('magic listNavigation page - is last page??', menu.page, maxPos, maxPage - 7)
    if (menu.page >= maxPage - 7) {
      // console.log('magic listNavigation on last page - do nothing')
    } else {
      // console.log('magic listNavigation not on last page - PAGE UP', delta, delta === 1, menu.pos)
      if (delta === 1) {
        menu.pos = menu.pos - (menu.cols - 1)
        drawListPointer()
      }
      menu.page++
      tweenMagicList(true, menu.state, updateInfoForSelectedSpell)
      listGroup.userData.slider.userData.moveToPage(menu.page)
    }
  } else {
    // console.log('magic listNavigation', menu.page, menu.pos, potential)
    menu.pos = potential
    updateInfoForSelectedSpell()
    drawListPointer()
  }
}
const listPageNavigation = up => {
  const menu = DATA.menus[DATA.menuCurrent]
  const lastPage = menu.spells.length / menu.cols - 7
  if (up) {
    menu.page = menu.page + 7
    if (menu.page > lastPage) {
      menu.page = lastPage
    }
  } else {
    menu.page = menu.page - 7
    if (menu.page < 0) {
      menu.page = 0
    }
  }
  // Update list group positions
  listGroup.userData.slider.userData.moveToPage(menu.page)
  listGroupContents.position.y = menu.page * 18
  updateInfoForSelectedSpell()
}
const selectType = () => {
  if (!DATA.menus[DATA.menuCurrent].enabled) {
    return
  }
  drawList()
  drawListPointer()
  typeSelectDialog.visible = false
  updateInfoForSelectedSpell()
  setMenuState(DATA.menus[DATA.menuCurrent].state)
}
const cancelListView = () => {
  removeGroupChildren(listGroup)
  removeGroupChildren(listGroupContents)
  removeGroupChildren(infoGroup)
  removeGroupChildren(mpGroup)
  removeGroupChildren(abilityGroup)
  typeSelectDialog.visible = true
  drawTypeSelectPointer()
  setMenuState('magic-type-select')
}
const centrePaddedString = (str, desiredLength) => {
  const changed = ' '.repeat(Math.floor((desiredLength - str.length) / 2)) + str
  console.log(
    `magic centrePaddedString _${changed}_ ${str}`,
    Math.floor((desiredLength - str.length) / 2)
  )
  return changed
}
const drawApplyMagic = spell => {
  removeGroupChildren(applyGroup)
  removeGroupChildren(applyNameGroup)
  addTextToDialog(
    applyNameGroup,
    centrePaddedString(spell.name, 8), // Should really be horizontally centered, but this good enough
    'magic-apply-magic-label',
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    180.5 - 8,
    48.5 - 4,
    0.5
  )

  const yAdj = 60
  for (let i = 0; i < window.data.savemap.party.members.length; i++) {
    const charName = window.data.savemap.party.members[i]
    const char = window.data.savemap.characters[charName]
    addImageToDialog(
      applyGroup,
      'profiles',
      charName,
      'profile-image',
      101 + 20,
      59 + 24 + i * yAdj,
      0.5
    )
    addCharacterSummary(
      applyGroup,
      charName,
      147.5 - 8,
      69 - 4 + i * yAdj,
      char.name,
      char.status.statusFlags === 'None' ? null : char.status.statusFlags,
      char.level.current,
      char.stats.hp.current,
      char.stats.hp.max,
      char.stats.mp.current,
      char.stats.mp.max
    )
  }
  applyDialog.visible = true
  applyNameDialog.visible = true
}
const drawApplyPointer = () => {
  const yAdj = 60
  const x = 103.5 // - 10
  const y = 84.5 // + 7
  if (!DATA.applyAll) {
    movePointer(POINTERS.pointer1, x - 10, y + yAdj * DATA.applyCurrent + 7)
    movePointer(POINTERS.pointer2, 0, 0, true)
    movePointer(POINTERS.pointer3, 0, 0, true)
  } else {
    movePointer(POINTERS.pointer1, x - 10, y + yAdj * 0 + 7, false, true)
    movePointer(POINTERS.pointer2, x - 10, y + yAdj * 1 + 7, false, true)
    movePointer(POINTERS.pointer3, x - 10, y + yAdj * 2 + 7, false, true)
  }
}
const applyNavigationAllToggle = () => {
  const menu = DATA.menus[DATA.menuCurrent]
  const spell = menu.spells[menu.page * menu.cols + menu.pos]
  if (spell.addedAbilities.filter(a => a.type === 'All').length > 0) {
    DATA.applyAll = !DATA.applyAll
    drawApplyPointer()
  }
}
const applyNavigation = up => {
  // Note: You can still navigate whilst applying all, which is how the game works
  if (up) {
    DATA.applyCurrent++
    if (DATA.applyCurrent > 2) {
      DATA.applyCurrent = 0
    }
  } else {
    DATA.applyCurrent--
    if (DATA.applyCurrent < 0) {
      DATA.applyCurrent = 2
    }
  }
  drawApplyPointer()
}
const cancelApplyMagic = () => {
  applyDialog.visible = false
  applyNameDialog.visible = false
  DATA.applyAll = false
  drawListPointer()
  setMenuState('magic-magic')
}
const playErrorSound = () => {
  console.log('magic playErrorSound')
}
const selectMagicToApply = () => {
  const menu = DATA.menus[DATA.menuCurrent]

  console.log('magic', 'selectMagicToApply menu.type', menu.type)
  if (menu.type === 'Magic') {
    const spell = menu.spells[menu.page * menu.cols + menu.pos]
    console.log('magic', 'selectMagicToApply spell', spell)
    if (ALLOWABLE_MENU_MAGIC.includes(spell.index)) {
      console.log('magic', 'selectMagicToApply ALLOW', spell)
      drawApplyMagic(spell)
      drawApplyPointer()
      setMenuState('magic-apply')
    } else {
      playErrorSound()
    }
  } else {
    playErrorSound()
  }
}
const envokeMagic = () => {
  // TODO - Apply healing magic menu and logic
  // Life = 1/4 of max HP
  // Life2 = all hp
  // Cure = (5 x 22) + ((charLevel + MagicAtk) x 6)
  // Cure = (35 x 22) + ((charLevel + MagicAtk) x 6)
  // Cure = (130 x 22) + ((charLevel + MagicAtk) x 6)
  // Dont forgot to factor in MP Turbo and ALL abilities
}
const switchPartyMember = delta => {
  let newMember = false
  let potential = DATA.partyMember
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
  DATA.partyMember = newMember
  setDataFromPartyMember()
  drawHeaderCharacterSummary()
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  headerDialog.visible = false
  infoDialog.visible = false
  typeSelectDialog.visible = false
  mpDialog.visible = false
  listDialog.visible = false
  applyDialog.visible = false
  applyNameDialog.visible = false
  fadeInHomeMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU MAGIC', key, firstPress, state)
  if (state === 'magic-type-select') {
    if (key === KEY.X) {
      console.log('press MAIN MENU MAGIC EXIT')
      movePointer(POINTERS.pointer1, 0, 0, true)
      await exitMenu()
    } else if (key === KEY.UP) {
      typeSelectNavigation(false)
    } else if (key === KEY.DOWN) {
      typeSelectNavigation(true)
    } else if (key === KEY.O) {
      selectType()
    } else if (key === KEY.L1) {
      switchPartyMember(-1)
    } else if (key === KEY.R1) {
      switchPartyMember(1)
    }
  } else if (
    state === 'magic-magic' ||
    state === 'magic-summon' ||
    state === 'magic-enemyskills'
  ) {
    if (key === KEY.UP) {
      listNavigation(0 - DATA.menus[DATA.menuCurrent].cols)
    } else if (key === KEY.DOWN) {
      listNavigation(DATA.menus[DATA.menuCurrent].cols)
    } else if (key === KEY.LEFT) {
      listNavigation(-1)
    } else if (key === KEY.RIGHT) {
      listNavigation(1)
    } else if (key === KEY.L1) {
      listPageNavigation(false)
    } else if (key === KEY.R1) {
      listPageNavigation(true)
    } else if (key === KEY.X) {
      cancelListView()
    } else if (key === KEY.O) {
      selectMagicToApply()
    }
  } else if (state === 'magic-apply') {
    if (key === KEY.UP) {
      applyNavigation(false)
    } else if (key === KEY.DOWN) {
      applyNavigation(true)
    } else if (key === KEY.L1 || key === KEY.R1) {
      applyNavigationAllToggle()
    } else if (key === KEY.O) {
      envokeMagic()
    } else if (key === KEY.X) {
      cancelApplyMagic()
    }
  }
}

export { loadMagicMenu, keyPress }

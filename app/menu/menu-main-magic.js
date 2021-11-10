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
import { isMagicMenuSummonEnabled, isMagicMenuEnemySkillEnabled } from '../data/savemap-alias.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { getBattleStatsForChar } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, infoDialog, typeSelectDialog, mpDialog, listDialog
let headerGroup, abilityGroup, infoGroup, typeSelectGroup, mpGroup, listGroup, listGroupContents

const DATA = {
  partyMember: 0,
  char: {},
  battleStats: {},
  menus: [
    {type: 'Magic', enabled: true, page: 0, pos: 0},
    {type: 'Summon', enabled: false, page: 0, pos: 0},
    {type: 'Enemy-Skill', enabled: false, page: 0, pos: 0}
  ],
  menuCurrent: 0
}
const setDataFromPartyMember = () => {
  const charName = window.data.savemap.party.members[DATA.partyMember]
  DATA.char = window.data.savemap.characters[charName]
  DATA.battleStats = getBattleStatsForChar(DATA.char)
}
const setMenuVisibility = () => {
  DATA.menus[1].enabled = isMagicMenuSummonEnabled()
  DATA.menus[2].enabled = isMagicMenuEnemySkillEnabled()
}
const loadMagicMenu = async partyMember => {
  DATA.partyMember = partyMember
  DATA.menuCurrent = 0
  DATA.menus.forEach(m => { m.page = 0; m.pos = 0 })
  setMenuVisibility()
  setDataFromPartyMember()

  headerDialog = await createDialogBox({
    id: 3,
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
    id: 3,
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
    id: 3,
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
    id: 3,
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
    id: 3,
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

  // Testing
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
    DATA.char.status.statusFlags === 'None' ? null : DATA.char.status.statusFlags,
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
  movePointer(POINTERS.pointer1, x, y + (yAdj * DATA.menuCurrent))
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
        38 - 4 + (i * 17),
        0.5
      )
    }
  }
}
const typeSelectNavigation = (up) => {
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
const getThreeRowTextPosition = (i) => {
  const x = 38.5
  const y = 121.5
  const xAdj = 84
  const yAdj = 18
  return {
    x: x + ((i % 3) * xAdj) - 8,
    y: y + (Math.trunc(i / 3) * yAdj) - 4
  }
}
const drawListPointer = () => {
  const menu = DATA.menus[DATA.menuCurrent]
  if (menu.type === 'Magic') {
    const {x, y} = getThreeRowTextPosition(menu.pos)
    movePointer(POINTERS.pointer1, x - 10.5, y + 5.5)
  }
}
const drawMagicList = () => {
  removeGroupChildren(listGroup)
  removeGroupChildren(listGroupContents)
  const menu = DATA.menus[DATA.menuCurrent]
  for (let i = 0; i < DATA.battleStats.menu.magic.length; i++) {
    const magic = DATA.battleStats.menu.magic[i]
    const {x, y} = getThreeRowTextPosition(i)
    const textGroup = addTextToDialog(
      listGroupContents,
      magic.name,
      `magic-list-${i}`,
      LETTER_TYPES.MenuBaseFont,
      LETTER_COLORS.Gray, // TODO - Cure, Cure2, Cure3, Life, Life2, FullCure can be used. Any others? What is the trigger?
      x,
      y,
      0.5
    )
    for (let j = 0; j < textGroup.children.length; j++) {
      const textLetters = textGroup.children[j]
      textLetters.material.clippingPlanes = listDialog.userData.bg.material.clippingPlanes
    }
  }
  createItemListNavigation(listGroup, 313, 100 - 32, 130, DATA.battleStats.menu.magic.length / 3, 7)
  listGroup.userData.slider.userData.moveToPage(menu.page)
  window.listGroup = listGroup
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
const drawMP = (mp) => {
  removeGroupChildren(mpGroup)
  if (mp === false) {
    return
  }
  addTextToDialog(
    mpGroup,
    ('' + mp).padStart(3, '0'),
    `magic-mp`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    261,
    64,
    0.5
  )
}
const drawAbilities = (abilities) => {
  removeGroupChildren(abilityGroup)

  addTextToDialog(
    abilityGroup,
    'Added-Ability',
    `magic-ability-label`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.Cyan,
    113.5 - 8,
    20.5 - 4,
    0.5
  )
  const x = 124
  const y = 32.5
  const xAdj = 60
  const yAdj = 13
  for (let i = 0; i < abilities.length; i++) {
    const ability = abilities[i]
    const xPos = x + (Math.trunc(i / 4) * xAdj) - 8
    const yPos = y + ((i % 4) * yAdj) - 4
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
      // TODO - do the x sign
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
}
const drawInfo = (info) => {
  removeGroupChildren(infoGroup)
  if (info === false) {
    return
  }
  addTextToDialog(
    mpGroup,
    info,
    `magic-info`,
    LETTER_TYPES.MenuBaseFont,
    LETTER_COLORS.White,
    13.5 - 8,
    98 - 4,
    0.5
  )
}

const updateInfoForSelectedMagic = () => {
  const menu = DATA.menus[DATA.menuCurrent]
  console.log('magic updateInfoForSelectedMagic', menu.page, menu.pos)
  const magic = DATA.battleStats.menu.magic[(menu.page * 3) + menu.pos]
  const attackData = window.data.kernel.attackData[magic.index]
  if (!magic.enabled) {
    drawMP(false)
  } else {
    // TODO - Apply MP Turbo
    console.log('magic drawMP', magic, attackData)
    if (magic.addedAbilities.filter(a => a.type === 'MPTurbo').length > 0) {
      const mpTurboAbility = magic.addedAbilities.filter(a => a.type === 'MPTurbo')[0]
      const mp = Math.min(255, Math.trunc(((attackData.mp * (10 + mpTurboAbility.level)) / 10) + 1))
      // console.log('magic MP Turbo', attackData.mp, mpTurboAbility.level, '->', mp)
      drawMP(mp)
    } else {
      drawMP(attackData.mp)
    }
    drawInfo(attackData.description)
    drawAbilities(magic.addedAbilities)
  }
}
const selectTypeMagic = () => {
  drawMagicList()
  drawListPointer()
  typeSelectDialog.visible = false
  updateInfoForSelectedMagic()
  setMenuState('magic-magic')
}
const selectTypeSummon = () => {
  // setMenuState('magic-summon')
}
const selectTypeEnemySkill = () => {

}
const selectType = () => {
  if (DATA.menus[DATA.menuCurrent].type === 'Magic') {
    selectTypeMagic()
  }
  if (DATA.menus[DATA.menuCurrent].type === 'Summon') {
    selectTypeSummon()
  }
  if (DATA.menus[DATA.menuCurrent].type === 'Enemy-Skill') {
    selectTypeEnemySkill()
  }
}
const tweenMagicList = (up, state, cb) => {
  setMenuState('magic-tweening-list')
  for (let i = 0; i < DATA.page + 1; i++) {
    listGroupContents.children[i].visible = true
  }
  let from = {y: listGroupContents.position.y}
  let to = {y: up ? listGroupContents.position.y + 18 : listGroupContents.position.y - 18}
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
const magicNavigation = (delta) => {
  const maxPage = DATA.battleStats.menu.magic.length / 3
  const maxPos = 21
  const menu = DATA.menus[DATA.menuCurrent]
  const potential = menu.pos + delta
  if (potential < 0) {
    if (menu.page === 0) {
      console.log('magic magicNavigation on first page - do nothing')
    } else {
      console.log('magic magicNavigation not on first page - PAGE DOWN')
      menu.page--
      tweenMagicList(false, 'magic-magic', updateInfoForSelectedMagic)
      listGroup.userData.slider.userData.moveToPage(menu.page)
    }
  } else if (potential >= maxPos) {
    console.log('magic magicNavigation page - is last page??', menu.page, maxPos, maxPage - 7)
    if (menu.page >= (maxPage - 7)) {
      console.log('magic magicNavigation on last page - do nothing')
    } else {
      console.log('magic magicNavigation not on last page - PAGE UP')
      menu.page++
      tweenMagicList(true, 'magic-magic', updateInfoForSelectedMagic)
      listGroup.userData.slider.userData.moveToPage(menu.page)
    }
  } else {
    console.log('magic magicNavigation', menu.page, menu.pos, potential)
    menu.pos = potential
    updateInfoForSelectedMagic()
    drawListPointer()
  }
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
    }
  } else if (state === 'magic-magic') {
    if (key === KEY.UP) {
      magicNavigation(-3)
    } else if (key === KEY.DOWN) {
      magicNavigation(3)
    } else if (key === KEY.LEFT) {
      magicNavigation(-1)
    } else if (key === KEY.RIGHT) {
      magicNavigation(1)
    }
  }
}
export { loadMagicMenu, keyPress }

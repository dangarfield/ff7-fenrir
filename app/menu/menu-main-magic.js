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
  removeGroupChildren
} from './menu-box-helper.js'
import { isMagicMenuSummonEnabled, isMagicMenuEnemySkillEnabled } from '../data/savemap-alias.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { getBattleStatsForChar } from '../battle/battle-stats.js'
import { KEY } from '../interaction/inputs.js'

let headerDialog, infoDialog, typeSelectDialog, mpDialog, itemsDailog
let headerGroup, abilityGroup, infoGroup, typeSelectGroup, mpGroup, itemsGroup

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
  mpGroup = addGroupToDialog(mpDialog, 15)

  itemsDailog = await createDialogBox({
    id: 3,
    name: 'itemsDailog',
    w: 320,
    h: 136,
    x: 0,
    y: 104,
    expandInstantly: true,
    noClipping: true
  })
  itemsDailog.visible = true
  itemsGroup = addGroupToDialog(itemsDailog, 15)

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
const selectTypeMagic = () => {

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
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  headerDialog.visible = false
  infoDialog.visible = false
  typeSelectDialog.visible = false
  mpDialog.visible = false
  itemsDailog.visible = false
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
  }
}
export { loadMagicMenu, keyPress }

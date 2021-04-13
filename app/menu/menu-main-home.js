import { scene, showDebugText } from './menu-scene.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  WINDOW_COLORS_SUMMARY,
  createDialogBox,
  slideFrom,
  slideTo,
  addTextToDialog,
  addImageToDialog,
  addCharacterSummary,
  getLetterTexture,
  addShapeToDialog
} from './menu-box-helper.js'
import {
  getMenuState,
  setMenuState,
  resolveMenuPromise
} from './menu-module.js'
import { getCurrentGameTime } from '../data/savemap-alias.js'
import { sleep } from '../helpers/helpers.js'

let homeNav, homeTime, homeLocation, homeMain

const loadHomeMenu = async () => {
  homeNav = await createDialogBox({
    id: 0,
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

  const x = 246
  const y = 12
  const d = 13
  await addTextToDialog(homeNav, 'Item', 'nav-item', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 0, 0.5)
  await addTextToDialog(homeNav, 'Magic', 'nav-magic', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 1, 0.5)
  await addTextToDialog(homeNav, 'Summon', 'nav-summon', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 2, 0.5)
  await addTextToDialog(homeNav, 'Equip', 'nav-equip', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 3, 0.5)
  await addTextToDialog(homeNav, 'Status', 'nav-status', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 4, 0.5)
  await addTextToDialog(homeNav, 'Order', 'nav-order', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 5, 0.5)
  await addTextToDialog(homeNav, 'Limit', 'nav-limit', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 6, 0.5)
  await addTextToDialog(homeNav, 'Config', 'nav-config', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 7, 0.5)
  await addTextToDialog(homeNav, 'PHS', 'nav-unknown', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 8, 0.5)
  await addTextToDialog(homeNav, 'Save', 'nav-save', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 9, 0.5)
  await addTextToDialog(homeNav, 'Quit', 'nav-quit', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x, y + d * 10, 0.5)
  homeTime = await createDialogBox({
    id: 1,
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
  await addTextToDialog(homeTime, 'Time', 'home-label-time', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 232, 186, 0.5)
  await addTextToDialog(homeTime, 'Gil', 'home-label-gil', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 233, 201, 0.5)
  
  const gameTime = getCurrentGameTime()
  await addTextToDialog(homeTime, ('' + gameTime.h).padStart(2, '0'), 'home-time-hrs', LETTER_TYPES.BattleTextStats, LETTER_COLORS.White, 264, 186, 0.5)
  await addTextToDialog(homeTime, ('' + gameTime.m).padStart(2, '0'), 'home-time-mins', LETTER_TYPES.BattleTextStats, LETTER_COLORS.White, 279, 186, 0.5)
  await addTextToDialog(homeTime, ('' + gameTime.s).padStart(2, '0'), 'home-time-secs', LETTER_TYPES.BattleTextStats, LETTER_COLORS.White, 294, 186, 0.5)
  await addTextToDialog(homeTime, ':', 'home-time-colon-1', LETTER_TYPES.MenuTextFixed, LETTER_COLORS.White, 273.75, 187, 0.5)
  await addTextToDialog(homeTime, ':', 'home-time-colon-2', LETTER_TYPES.MenuTextFixed, LETTER_COLORS.White, 288.75, 187, 0.5)
  
  await addTextToDialog(homeTime, ('' + window.data.savemap.gil).padStart(9, ' '), 'home-gil', LETTER_TYPES.BattleTextStats, LETTER_COLORS.White, 252, 201, 0.5)
  updateHomeMenuTime()
  homeLocation = await createDialogBox({
    id: 2,
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
  await addTextToDialog(homeLocation, window.data.savemap.location.currentLocation, 'home-loc', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 163, 225, 0.5)
  homeMain = await createDialogBox({
    id: 3,
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
  const char1Y = 30
  const char2Y = 90.5
  const char3Y = 150
  await addCharacterSummary(homeMain, 0, 77, char1Y, 'Ex-SOLDIER', 99, 298, 9999, 54, 999)
  await addCharacterSummary(homeMain, 1, 77, char2Y, 'Barret', 1, 222, 222, 15, 15)
  await addCharacterSummary(homeMain, 1, 77, char3Y, 'Tifa', 6, 500, 750, 20, 98)

  await addImageToDialog(homeMain, 'profiles', 'Cloud', 'profile-image-1', 35.5, char1Y + 16.5, 0.5) // backrow order = position.x = 64.5
  await addImageToDialog(homeMain, 'profiles', 'Barret', 'profile-image-2', 35.5, char2Y + 16.5, 0.5)
  await addImageToDialog(homeMain, 'profiles', 'Tifa', 'profile-image-3', 35.5, char3Y + 16.5, 0.5)

  await addTextToDialog(homeMain, 'next level', 'next-level-1', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 154.5, char1Y + 10.5, 0.5)
  await addTextToDialog(homeMain, 'next level', 'next-level-2', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 154.5, char2Y + 10.5, 0.5)
  await addTextToDialog(homeMain, 'next level', 'next-level-3', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 154.5, char3Y + 10.5, 0.5)

  await addTextToDialog(homeMain, 'Limit level', 'next-level-1', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 154.5, char1Y + 30.5, 0.5)
  await addTextToDialog(homeMain, 'Limit level', 'next-level-2', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 154.5, char2Y + 30.5, 0.5)
  await addTextToDialog(homeMain, 'Limit level', 'next-level-3', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, 154.5, char3Y + 30.5, 0.5)

  await addImageToDialog(homeMain, 'bars', 'level', 'level-bar-bg-1', 200.5, char1Y + 19.5, 0.5)
  await addImageToDialog(homeMain, 'bars', 'level', 'level-bar-bg-2', 200.5, char2Y + 19.5, 0.5)
  await addImageToDialog(homeMain, 'bars', 'level', 'level-bar-bg-3', 200.5, char3Y + 19.5, 0.5)

  await addImageToDialog(homeMain, 'bars', 'level', 'limit-bar-bg-1', 200.5, char1Y + 39.5, 0.5)
  await addImageToDialog(homeMain, 'bars', 'level', 'limit-bar-bg-2', 200.5, char2Y + 39.5, 0.5)
  await addImageToDialog(homeMain, 'bars', 'level', 'limit-bar-bg-3', 200.5, char3Y + 39.5, 0.5)

  
  await addShapeToDialog(homeMain, WINDOW_COLORS_SUMMARY.EXP, 'level-bar-1a', 200, char1Y + 19-1, 58, 2, 1)
  await addShapeToDialog(homeMain, WINDOW_COLORS_SUMMARY.EXP, 'level-bar-1b', 200, char1Y + 19+1, 58, 2, 1)

  await addShapeToDialog(homeMain, WINDOW_COLORS_SUMMARY.EXP, 'level-bar-2', 200, char2Y + 19, 58, 4, 1)
  await addShapeToDialog(homeMain, WINDOW_COLORS_SUMMARY.EXP, 'level-bar-3', 200, char3Y + 19, 58, 4, 1)

  await addShapeToDialog(homeMain, WINDOW_COLORS_SUMMARY.LIMIT, 'limit-bar-1', 200, char1Y + 39, 57, 4, 1)
  await addShapeToDialog(homeMain, WINDOW_COLORS_SUMMARY.LIMIT, 'limit-bar-2', 200, char2Y + 39, 56, 4, 1)
  await addShapeToDialog(homeMain, WINDOW_COLORS_SUMMARY.LIMIT, 'limit-bar-3', 200, char3Y + 39, 58, 4, 1)

  // 106 - 230 - 124
  // 106 - 144 - 38
  // 106 - 144 - 38

  // 90  - 215 - 125
  // 90  - 205 - 115
  // 90  - 205 - 115
  

  await Promise.all([
    slideFrom(homeNav),
    slideFrom(homeTime),
    slideFrom(homeLocation),
    slideFrom(homeMain)
  ])
  setMenuState('home')
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

    const hrsGroup = homeTime.children.filter(f => f.userData.id === 'home-time-hrs')[0]
    hrsGroup.userData.text = hSplit.join('')
    hrsGroup.children[0].material.map = getLetterTexture(h1, LETTER_TYPES.BattleTextStats, LETTER_COLORS.White).texture
    hrsGroup.children[1].material.map = getLetterTexture(h2, LETTER_TYPES.BattleTextStats, LETTER_COLORS.White).texture

    const minsGroup = homeTime.children.filter(f => f.userData.id === 'home-time-mins')[0]
    minsGroup.userData.text = mSplit.join('')
    minsGroup.children[0].material.map = getLetterTexture(m1, LETTER_TYPES.BattleTextStats, LETTER_COLORS.White).texture
    minsGroup.children[1].material.map = getLetterTexture(m2, LETTER_TYPES.BattleTextStats, LETTER_COLORS.White).texture

    const secsGroup = homeTime.children.filter(f => f.userData.id === 'home-time-secs')[0]
    secsGroup.userData.text = sSplit.join('')
    secsGroup.children[0].material.map = getLetterTexture(s1, LETTER_TYPES.BattleTextStats, LETTER_COLORS.White).texture
    secsGroup.children[1].material.map = getLetterTexture(s2, LETTER_TYPES.BattleTextStats, LETTER_COLORS.White).texture

    const colon1Group = homeTime.children.filter(f => f.userData.id === 'home-time-colon-1')[0]
    colon1Group.children[0].material.map = getLetterTexture(':', LETTER_TYPES.MenuTextFixed, LETTER_COLORS.White).texture

    setTimeout(() => {
      console.log('change colon')
      colon1Group.children[0].material.map = getLetterTexture(':', LETTER_TYPES.MenuTextFixed, LETTER_COLORS.Gray).texture
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
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU HOME', key, firstPress, state)
  if (key === 'x') {
    console.log('press MAIN MENU HOME EXIT')
    await slideOutMainMenu()
    resolveMenuPromise()
  } else if (key === 'o') {
    console.log('press MAIN MENU HOME SELECT')
  }
}
export { loadHomeMenu, keyPress, updateHomeMenuTime }

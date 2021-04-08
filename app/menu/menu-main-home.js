import { scene, showDebugText } from './menu-scene.js'
import { createDialogBox, slideFrom, slideTo } from './menu-box-helper.js'
import {
  getMenuState,
  setMenuState,
  resolveMenuPromise
} from './menu-module.js'
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
  await Promise.all([
    slideFrom(homeNav),
    slideFrom(homeTime),
    slideFrom(homeLocation),
    slideFrom(homeMain)
  ])
  setMenuState('home')
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
export { loadHomeMenu, keyPress }

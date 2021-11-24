import { getMenuBlackOverlay, setMenuState, resolveMenuPromise, getMenuState } from './menu-module.js'
import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { scene, MENU_TWEEN_GROUP } from './menu-scene.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  addGroupToDialog,
  addImageToDialog,
  addLevelToDialog,
  addShapeToDialog,
  addCharacterSummary,
  POINTERS,
  movePointer,
  fadeOverlayOut,
  fadeOverlayIn,
  createEquipmentMateriaViewer,
  EQUIPMENT_TYPE,
  removeGroupChildren,
  createItemListNavigation,
  WINDOW_COLORS_SUMMARY
} from './menu-box-helper.js'
import { oneColumnVerticalNavigation, oneColumnVerticalPageNavigation } from './menu-navigation-helper.js'
import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'
import { fadeInHomeMenu } from './menu-main-home.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'
import { MOD } from '../field/field-op-codes-assign.js'
import { navigateSelect } from '../world/world-destination-selector.js'
import { getItemIcon, addItemToInventory } from '../items/items-module.js'
import { addMateriaToInventory } from '../materia/materia-module.js'

let scrollingTextDialog, scrollingTextGroup

const STATES = {SCROLL: 'credits-scroll'}
const DATA = {
  lines: [],
  activeTween: null, // TODO - cancel this on exit
  y: 0
}
const loadCreditsData = () => {
  DATA.lines = window.data.cd.credits.lines
}
const loadCreditsMenu = async param => {
  loadCreditsData()
  DATA.currentLine = 0
  DATA.y = 240
  console.log('credits loadCreditsMenu', param, DATA)
  window.DATA = DATA
  scrollingTextDialog = createDialogBox({
    id: 9,
    name: 'scrollingTextDialog',
    w: 320,
    h: 240,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  removeGroupChildren(scrollingTextDialog)
  scrollingTextDialog.visible = true
  // scrollingTextDialog.position.z = 100 - 9
  scrollingTextGroup = addGroupToDialog(scrollingTextDialog, 19)
  console.log('credits scrollingTextGroup.position.y', scrollingTextGroup.position.y)
  window.scrollingTextGroup = scrollingTextGroup

  await fadeOverlayOut(getMenuBlackOverlay())
  setMenuState(STATES.SCROLL)
  playCreditsSequence()
}
const tweenScrollingCredits = (ms) => {
  return new Promise((resolve, reject) => {
    let from = {y: scrollingTextGroup.position.y}
    let to = {y: DATA.y - 240 - 120}
    DATA.activeTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    // .to(to, 415000)
      .to(to, ms)
      .onUpdate(function () {
        // console.log('credits tween update', sjjcrollingTextGroup.position.y, from.y)
        scrollingTextGroup.position.y = from.y
      })
      .onComplete(function () {
        console.log('credits tween resolve', scrollingTextGroup.position.y)
        DATA.activeTween = null
        resolve()
      })
      .start()
  })
}
const tween500YearsFadeIn = (group) => {
  return new Promise((resolve, reject) => {
    let from = {x: 0}
    let to = {x: 386}
    DATA.activeTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    // .to(to, 415000)
      .to(to, 3000)
      .easing(TWEEN.Easing.Exponential.Out)
      // .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function () {
        // console.log('credits tween update', sjjcrollingTextGroup.position.y, from.y)
        group.position.x = from.x
      })
      .onComplete(function () {
        console.log('credits tween500YearsFaeIn resolve')
        DATA.activeTween = null
        resolve()
      })
      .start()
  })
}
const tween500YearsFadeOut = (shape) => {
  return new Promise((resolve, reject) => {
    let from = {opacity: 1}
    let to = {opacity: 0}
    DATA.activeTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    // .to(to, 415000)
      .to(to, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      // .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function () {
        // console.log('credits tween update', sjjcrollingTextGroup.position.y, from.y)
        shape.material.opacity = from.opacity
      })
      .onComplete(function () {
        console.log('credits tween500YearsFadeOut resolve')
        DATA.activeTween = null
        resolve()
      })
      .start()
  })
}
const playCreditsSequence = async () => {
  await beginScrollingCredits(5000)
  // await beginScrollingCredits(415000)
  await show500YearsMessage()
}
const beginScrollingCredits = async (ms) => {
  for (let i = 0; i < DATA.lines.length; i++) {
    const line = DATA.lines[i]
    let font
    let scale = 0.5
    let color
    // const line = DATA.lines[DATA.currentLine]
    switch (line.type) {
      case 0: font = LETTER_TYPES.CreditsBigFont; break
      case 1: font = LETTER_TYPES.CreditsBaseUnderlineFont; break
      case 2: font = LETTER_TYPES.CreditsBaseFont; break
      case 3: font = LETTER_TYPES.CreditsBaseFont; scale = 0.25; break // scrollingTextGroup.position.y = 8200 small text
      case 4: font = LETTER_TYPES.CreditsBaseUnderlineFont; scale = 0.25; break
      case 5: font = LETTER_TYPES.CreditsBaseFont; scale = 0.25; break // scrollingTextGroup.position.y = 8440
      default: font = LETTER_TYPES.CreditsBigFont; break
    }
    switch (line.color) {
      case 0: color = LETTER_COLORS.White; break
      case 1: color = LETTER_COLORS.Red; break
      case 2: color = LETTER_COLORS.Green; break
      case 3: color = LETTER_COLORS.Blue; break
      default: color = LETTER_COLORS.White; break
    }
    // console.log('credits draw', line, line.names, line.type, font, scale, color)
    if (line.names.length === 1) {
      addTextToDialog(
        scrollingTextGroup,
        line.names[0],
        `credits-text-${1}`,
        font,
        color,
        160 - 8,
        DATA.y - 4,
        scale,
        null,
        true
      )
    } else {
      for (let j = 0; j < line.names.length; j++) {
        const name = line.names[j]
        addTextToDialog(
          scrollingTextGroup,
          name,
          `credits-text-${1}-${j}`,
          font,
          color,
          15 + (j * 150) - 8,
          DATA.y - 4,
          scale,
          null
        )
      }
    }
    DATA.y = DATA.y + (line.linePadding / 2)
  }
  console.log('credits rendering finished', DATA.y)
  console.log('credits beginScrollingCredits', DATA.currentLine)
  await tweenScrollingCredits(ms)

  console.log('credits tween finished')
}
const show500YearsMessage = async () => {
  scrollingTextGroup.position.y = 0
  removeGroupChildren(scrollingTextGroup)

  const fadeGroup = addGroupToDialog(scrollingTextGroup, 19)

  const c500 = addImageToDialog(scrollingTextGroup, 'end-credits', 'credits-500-years-later', 'credits-500-years-later', 160, 120, 0.5)
  const shape1 = addShapeToDialog(fadeGroup, WINDOW_COLORS_SUMMARY.CREDITS_WHITE, 'credits-years-cover', 160 - 386, 120, 386 / 2, 32 / 2, 1, THREE.MultiplyBlending)
  const shape2 = addShapeToDialog(fadeGroup, WINDOW_COLORS_SUMMARY.CREDITS_FADE, 'credits-years-cover', 160 - (386 / 2), 120, 386 / 2, 32 / 2, 1, THREE.MultiplyBlending)
  const shape3 = addShapeToDialog(fadeGroup, WINDOW_COLORS_SUMMARY.CREDITS_BLACK, 'credits-years-cover', 160, 120, 386 / 2, 32 / 2, 1, THREE.MultiplyBlending)
  window.c500 = c500
  window.shape1 = shape1
  window.shape2 = shape2
  window.shape3 = shape3
  window.fadeGroup = fadeGroup
  console.log('credits 500 years fade in: START')
  await tween500YearsFadeIn(fadeGroup)
  console.log('credits 500 years fade in: END')
  console.log('credits 500 years pause: START')
  await sleep(3000)
  console.log('credits 500 years pause: END')
  console.log('credits 500 years fade out: START')
  await tween500YearsFadeOut(c500)
  console.log('credits 500 years fade out: END')
}
const exitMenu = async () => {
  console.log('exitMenu')
  // TODO - cancel DATA.activeTween on exit
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())
  // itemShopDialog.visible = false
  // actionDescriptionDialog.visible = false
  // navDialog.visible = false

  console.log('shop EXIT')
  resolveMenuPromise()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CREDITS', key, firstPress, state)
  if (state === STATES.SCROLL) {
    if (key === KEY.X || key) {
      exitMenu()
    }
  }
}
export { loadCreditsMenu, keyPress }

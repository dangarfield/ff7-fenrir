import { getMenuBlackOverlay, setMenuState, resolveMenuPromise, getMenuState } from './menu-module.js'
import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  createDialogBox,
  addTextToDialog,
  addGroupToDialog,
  addImageToDialog,
  addShapeToDialog,
  fadeOverlayOut,
  fadeOverlayIn,
  removeGroupChildren,
  WINDOW_COLORS_SUMMARY
} from './menu-box-helper.js'
import { KEY } from '../interaction/inputs.js'
import { sleep } from '../helpers/helpers.js'
import { loadMovie } from '../media/media-movies.js'
import { playMusic, loadMusic } from '../media/media-music.js'
import { setCurrentDisc } from '../data/savemap-alias.js'
import { loadTitleMenu } from './menu-title.js'

let scrollingTextDialog, scrollingTextGroup

const STATES = {CREDITS_SHOW: 'credits-show'}
const DATA = {
  lines: [],
  activeTween: null, // TODO - cancel this on exit
  activeVideo: null, // TODO - cancel this on exit
  y: 0
}
const loadCreditsData = () => {
  DATA.lines = window.data.cd.credits.lines
}
const loadCreditsMenu = async param => {
  loadCreditsData()
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
  setMenuState(STATES.CREDITS_SHOW)
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
      .onStop(function () {
        console.log('credits tween resolve', scrollingTextGroup.position.y)
        DATA.activeTween = null
        resolve()
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
      .onStop(function () {
        console.log('credits tween500YearsFadeOut resolve')
        DATA.activeTween = null
        resolve()
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
      .onStop(function () {
        console.log('credits tween500YearsFadeOut resolve')
        DATA.activeTween = null
        resolve()
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
  // await beginScrollingCredits(5000)
  playEndingMusic()
  await beginScrollingCredits(415000)
  await show500YearsMessage()
  await playEndingVideo()
  await exitCreditsToTitleScreen()
  console.log('credits ALL FINISHED')
}
const playEndingMusic = async () => {
  await loadMusic(100, 'roll')
  playMusic(100, true, 1000)
}
const beginScrollingCredits = async (ms) => {
  if (getMenuState() !== STATES.CREDITS_SHOW) {
    console.log('credits not showing beginScrollingCredits')
    return
  }
  for (let i = 0; i < DATA.lines.length; i++) {
    const line = DATA.lines[i]
    let font
    let scale = 0.5
    let color
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
  console.log('credits beginScrollingCredits: START')
  await tweenScrollingCredits(ms)
  console.log('credits beginScrollingCredits: END')
}
const show500YearsMessage = async () => {
  if (getMenuState() !== STATES.CREDITS_SHOW) {
    console.log('credits not showing show500YearsMessage')
    return
  }
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

  if (getMenuState() !== STATES.CREDITS_SHOW) {
    console.log('credits not showing show500YearsMessage fade out')
    return
  }
  await tween500YearsFadeOut(c500)
  console.log('credits 500 years fade out: END')
}
const playVideoAndWaitForEnd = (video) => {
  return new Promise((resolve, reject) => {
    DATA.activeVideo = video
    video.onended = () => {
      console.log('credits video ended')
      video.removeAttribute('src')
      video.load()
      DATA.activeVideo = null
      resolve()
    }
    video.onpause = () => {
      console.log('credits video pauses')
      DATA.activeVideo = null
      resolve()
    }
    video.play()
  })
}
const playEndingVideo = async () => {
  if (getMenuState() !== STATES.CREDITS_SHOW) {
    console.log('credits not showing playEndingVideo')
    return
  }

  removeGroupChildren(scrollingTextGroup)
  console.log('credits video loading')
  setCurrentDisc(3)
  const video = await loadMovie(26)
  console.log('credits video loaded', video)
  const geometry = new THREE.PlaneGeometry(
    window.config.sizing.width,
    window.config.sizing.height
  )
  const texture = new THREE.VideoTexture(video)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.format = THREE.RGBFormat
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  })
  const videoBG = new THREE.Mesh(geometry, material)
  videoBG.position.x = window.config.sizing.width / 2
  videoBG.position.y = window.config.sizing.height / 2
  scrollingTextGroup.add(videoBG)
  console.log('credits video play')
  await playVideoAndWaitForEnd(video)
}
const exitCreditsToTitleScreen = async () => {
  if (getMenuState() !== STATES.CREDITS_SHOW) {
    console.log('credits not showing playEndingVideo')
    return
  }
  exitMenu()
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())

  if (DATA.activeTween !== null) {
    DATA.activeTween.stop()
  }
  if (DATA.activeVideo !== null) {
    console.log('credits DATA.activeVideo', DATA.activeVideo)
    DATA.activeVideo.pause()
  }

  scrollingTextDialog.visible = false

  console.log('credits EXIT')
  // resolveMenuPromise()
  loadTitleMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU CREDITS', key, firstPress, state)
  if (state === STATES.CREDITS_SHOW) {
    if (key === KEY.X) {
      exitMenu()
    }
  }
}
export { loadCreditsMenu, keyPress }

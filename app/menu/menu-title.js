import { getMenuBlackOverlay, setMenuState, resolveMenuPromise, getMenuState } from './menu-module.js'
import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP, showDebugText } from './menu-scene.js'
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
import { loadMovieByName } from '../media/media-movies.js'
import { playMusic, loadMusic } from '../media/media-music.js'
import { setCurrentDisc } from '../data/savemap-alias.js'

let titleDialog, bgGroup, nameGroup, movieGroup, logoGroup

const STATES = {TITLE_SEQUENCE: 'title-sequence'}
const DATA = {
  activeTween: null,
  activeMovie: null
}
const loadTitleMenu = async () => {
  console.log('loadTitleMenu')
  console.log('mediaLoaded')
  window.DATA = DATA
  titleDialog = createDialogBox({
    id: 10,
    name: 'titleDialog',
    w: 320,
    h: 240,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  removeGroupChildren(titleDialog)
  titleDialog.visible = true
  // scrollingTextDialog.position.z = 100 - 9
  bgGroup = addGroupToDialog(titleDialog, 20)
  nameGroup = addGroupToDialog(titleDialog, 19)
  movieGroup = addGroupToDialog(titleDialog, 18)
  logoGroup = addGroupToDialog(titleDialog, 17)

  await fadeOverlayOut(getMenuBlackOverlay())
  // showDebugText('Title')
  setMenuState(STATES.TITLE_SEQUENCE)
  beginTitleSequence()
}

const loadMedia = async () => {
  await loadMusic(100, 'pre')
  playMusic(100, true, 1000)

  removeGroupChildren(movieGroup)
  console.log('title video loading')
  const video = await loadMovieByName('Explode')
  console.log('title video loaded', video)
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
  movieGroup.add(videoBG)
  console.log('credits video play')
  return video
}
const beginTitleSequence = async () => {
  const video = await loadMedia()

  await playCreditsLoop(video)
  // await playExplodeVideoAndWaitForEnd(video)
  // exitMenu()
}
const tweenOpacity = (mesh, fromOpacity, toOpacity, ms) => {
  return new Promise((resolve, reject) => {
    let from = {opacity: fromOpacity}
    let to = {opacity: toOpacity}
    DATA.activeTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
      .to(to, ms)
      .onUpdate(function () {
        // console.log('credits tween update', scrollingTextGroup.position.y, from.y)
        mesh.material.opacity = from.opacity
      })
      .onStop(function () {
        console.log('title tweenOpacity stop', mesh.material.opacity)
        DATA.activeTween = null
        resolve()
      })
      .onComplete(function () {
        console.log('title tweenOpacity resolve', mesh.material.opacity)
        DATA.activeTween = null
        resolve()
      })
      .start()
  })
}

const playCreditsLoop = async (video) => {
  removeGroupChildren(bgGroup)

  const bgImage = addImageToDialog(bgGroup, 'intro', 'background', 'intro-background', 320 / 2, 240 / 2, 0.5)
  bgImage.material.opacity = 0

  // Fade in
  await tweenOpacity(bgImage, 0, 1, 1000)

  const titlePos = [
    {x: 303, y: 24},
    {x: 80, y: 184},
    {x: 80, y: 24},
    {x: 303, y: 184}
  ]
  // Main credit items
  for (let i = 0; i < 4; i++) {
    const x = titlePos[i % 4].x
    const y = titlePos[i % 4].y
    const titleBlack = addImageToDialog(bgGroup, 'intro', `title-${i + 1}-a`, 'intro-background', x + 1, y + 1, 0.5, THREE.SubtractiveBlending)
    const titleWhite = addImageToDialog(bgGroup, 'intro', `title-${i + 1}-a`, 'intro-background', x, y, 0.5, THREE.AdditiveBlending)

    const yGap = titleWhite.geometry.parameters.height
    console.log('title yGap', yGap)
    const nameBlack = addImageToDialog(bgGroup, 'intro', `title-${i + 1}-b`, 'intro-background', x + 1, y + 1 + yGap, 0.5, THREE.SubtractiveBlending)
    const nameWhite = addImageToDialog(bgGroup, 'intro', `title-${i + 1}-b`, 'intro-background', x, y + yGap, 0.5, THREE.AdditiveBlending)

    if (i % 4 === 0 || i % 4 === 3) {
      // Right align
      titleWhite.position.x = titleWhite.position.x - (titleWhite.geometry.parameters.width / 2)
      nameWhite.position.x = nameWhite.position.x - (nameWhite.geometry.parameters.width / 2)

      titleBlack.position.x = titleBlack.position.x - (titleBlack.geometry.parameters.width / 2)
      nameBlack.position.x = nameBlack.position.x - (nameBlack.geometry.parameters.width / 2)
    }
    window[`titleWhite${i}`] = titleWhite
    window[`titleBlack${i}`] = titleBlack

    window[`nameWhite${i}`] = nameWhite
    window[`nameBlack${i}`] = nameBlack
  }
}
const playExplodeVideoAndWaitForEnd = (video) => {
  return new Promise((resolve, reject) => {
    if (getMenuState() !== STATES.TITLE_SEQUENCE) {
      console.log('title not showing playExplodeVideo')
      resolve()
      return
    }
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
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  await fadeOverlayIn(getMenuBlackOverlay())

  if (DATA.activeTween !== null) {
    DATA.activeTween.stop()
  }
  if (DATA.activeVideo !== null) {
    console.log('title DATA.activeVideo', DATA.activeVideo)
    DATA.activeVideo.pause()
  }

  titleDialog.visible = false

  console.log('title EXIT')
  // resolveMenuPromise()
  // loadTitleMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU TITLE', key, firstPress, state)
  if (state === 'title') {
    // if (key === KEY.X) {
    //   exitMenu()
    // }
  }
}
export { loadTitleMenu, keyPress }

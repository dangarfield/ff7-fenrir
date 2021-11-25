import { getMenuBlackOverlay, setMenuState, resolveMenuPromise, getMenuState } from './menu-module.js'
import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP, showDebugText } from './menu-scene.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  ALIGN,
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
const tweenOpacity = (meshes, fromOpacity, toOpacity, ms) => {
  return new Promise((resolve, reject) => {
    let from = {opacity: fromOpacity}
    let to = {opacity: toOpacity}
    DATA.activeTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
      .to(to, ms)
      .onUpdate(function () {
        // console.log('credits tween update', scrollingTextGroup.position.y, from.y)
        for (let i = 0; i < meshes.length; i++) {
          const mesh = meshes[i]
          mesh.material.opacity = from.opacity
        }
      })
      .onStop(function () {
        console.log('title tweenOpacity stop')
        DATA.activeTween = null
        resolve()
      })
      .onComplete(function () {
        console.log('title tweenOpacity resolve')
        DATA.activeTween = null
        resolve()
      })
      .start()
  })
}
const tweenCreditsFlyIn = (meshes, ms) => {
  return new Promise((resolve, reject) => {
    let from = {distance: 320}
    let to = {distance: 0}
    DATA.activeTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
      .to(to, ms)
      .onUpdate(function () {
        console.log('title tweenCreditsFlyIn update', meshes[0], meshes[0].userData.position.x, from.distance, '->', meshes[0].userData.position.x + from.distance)
        meshes[0].position.x = meshes[0].userData.position.x + from.distance
        meshes[1].position.x = meshes[1].userData.position.x - from.distance
        meshes[2].position.y = meshes[2].userData.position.y + from.distance
        meshes[3].position.y = meshes[3].userData.position.y - from.distance
      })
      .onStop(function () {
        console.log('title tweenCreditsFlyIn stop')
        DATA.activeTween = null
        resolve()
      })
      .onComplete(function () {
        console.log('title tweenCreditsFlyIn resolve')
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
  await tweenOpacity([bgImage], 0, 1, 1000)

  const titlePositionConfig = [
    {x: 16, y: 24 - 16, align: ALIGN.LEFT, flyInOrder: ['tb', 'tw', 'nb', 'nw']}, // tl
    {x: 308, y: 24 - 16, align: ALIGN.RIGHT, flyInOrder: ['tw', 'tb', 'nw', 'nb']}, // tr
    {x: 16, y: 184 - 16, align: ALIGN.LEFT, flyInOrder: ['nb', 'nw', 'tb', 'tw']}, // bl
    {x: 308, y: 184 - 16, align: ALIGN.RIGHT, flyInOrder: ['nw', 'nb', 'tw', 'tb']} // br
  ]
  const titlePositionLookup = [
    1, 2, 0, 3, //
    1, 2, 0, 3, //
    1, 2, 0, 3, //
    1, 2, 0, 3, //
    1, 2, 0, // For some reason they missed this position out
    1, 2, 0, 3, //
    1, 2, 0, 3, //
    1, 2
  ]
  // Main credit items
  for (let i = 0; i < 4; i++) {
    const pos = titlePositionConfig[titlePositionLookup[i]]
    const x = pos.x
    const y = pos.y
    const align = pos.align
    const titleBlack = addImageToDialog(bgGroup, 'intro', `title-${i + 1}-a`, 'intro-background', x + 1, y + 0.5, 0.5, THREE.SubtractiveBlending, align, ALIGN.TOP)
    const titleWhite = addImageToDialog(bgGroup, 'intro', `title-${i + 1}-a`, 'intro-background', x, y, 0.5, THREE.AdditiveBlending, align, ALIGN.TOP)

    const yGap = titleWhite.geometry.parameters.height
    console.log('title yGap', yGap)
    const nameBlack = addImageToDialog(bgGroup, 'intro', `title-${i + 1}-b`, 'intro-background', x + 1, y + 0.5 + yGap, 0.5, THREE.SubtractiveBlending, align, ALIGN.TOP)
    const nameWhite = addImageToDialog(bgGroup, 'intro', `title-${i + 1}-b`, 'intro-background', x, y + yGap, 0.5, THREE.AdditiveBlending, align, ALIGN.TOP)

    titleBlack.userData.position = {x: titleBlack.position.x, y: titleBlack.position.y}
    titleWhite.userData.position = {x: titleWhite.position.x, y: titleWhite.position.y}
    nameBlack.userData.position = {x: nameBlack.position.x, y: nameBlack.position.y}
    nameWhite.userData.position = {x: nameWhite.position.x, y: nameWhite.position.y}

    const meshes = { tb: titleBlack, tw: titleWhite, nb: nameBlack, nw: nameWhite }

    window[`titleWhite${i}`] = titleWhite
    window[`titleBlack${i}`] = titleBlack
    window[`nameWhite${i}`] = nameWhite
    window[`nameBlack${i}`] = nameBlack

    await tweenCreditsFlyIn(pos.flyInOrder.map(m => meshes[m]), 1000)
    await tweenOpacity([titleBlack, titleWhite, nameWhite, nameBlack], 1, 0, 1000)
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

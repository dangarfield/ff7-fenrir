import { getMenuBlackOverlay, setMenuState, getMenuState } from './menu-module.js'
import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'
import {
  LETTER_TYPES,
  LETTER_COLORS,
  ALIGN,
  createDialogBox,
  addTextToDialog,
  addGroupToDialog,
  addImageToDialog,
  fadeOverlayOut,
  fadeOverlayIn,
  removeGroupChildren,
  movePointer,
  POINTERS
} from './menu-box-helper.js'
import { KEY } from '../interaction/inputs.js'
import { loadMovieByName } from '../media/media-movies.js'
import { playMusic, stopMusic, loadMusic } from '../media/media-music.js'
import { loadNewGame } from '../data/savemap.js'
import { loadSaveMenu } from './menu-main-save.js'

let titleDialog, bgGroup, nameGroup, movieGroup, logoGroup, gameSelectGroup

const STATES = {TITLE_SEQUENCE: 'title-sequence', TITLE_SELECT: 'title-select'}
const DATA = {
  gameSelectPos: 1,
  activeTween: null,
  activeVideo: null
}
const loadTitleMenu = async (straightToGameSelect) => {
  console.log('title loadTitleMenu')
  console.log('mediaLoaded')
  DATA.gameSelectPos = 1
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
  movieGroup = addGroupToDialog(titleDialog, 21)
  movieGroup.userData.z = 100 - movieGroup.position.z
  logoGroup = addGroupToDialog(titleDialog, 9)
  logoGroup.userData.z = 100 - logoGroup.position.z
  gameSelectGroup = addGroupToDialog(titleDialog, 18)

  await fadeOverlayOut(getMenuBlackOverlay())
  // showDebugText('Title')
  setMenuState(STATES.TITLE_SEQUENCE)
  if (straightToGameSelect) {
    showGameSelect()
  } else {
    beginTitleSequence()
  }
}

const loadMedia = async () => {
  await loadMusic(100, 'pre')

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
  videoBG.position.z = 100 - movieGroup.position.z
  movieGroup.add(videoBG)
  console.log('title video play')
  movieGroup.visible = false
  return video
}
const beginTitleSequence = async () => {
  const video = await loadMedia()

  await playCreditsLoop(video)
  // exitMenu()
  console.log('title beginTitleSequence: END')
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
        reject(new Error('UserInterruptAction'))
      })
      .onComplete(function () {
        console.log('title tweenOpacity resolve')
        DATA.activeTween = null
        resolve()
      })
      .start()
  })
}
const tweenSleep = (ms) => {
  return new Promise((resolve, reject) => {
    let from = {something: 1}
    let to = {something: 1}
    DATA.activeTween = new TWEEN.Tween(from, MENU_TWEEN_GROUP)
      .to(to, ms)
      .onStop(function () {
        console.log('title tweenSleep stop')
        DATA.activeTween = null
        reject(new Error('UserInterruptAction'))
      })
      .onComplete(function () {
        console.log('title tweenSleep resolve')
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
        // console.log('title tweenCreditsFlyIn update', meshes[0], meshes[0].userData.position.x, from.distance, '->', meshes[0].userData.position.x + from.distance)
        meshes[0].position.x = meshes[0].userData.position.x + from.distance
        meshes[1].position.x = meshes[1].userData.position.x - from.distance
        meshes[2].position.y = meshes[2].userData.position.y + from.distance
        meshes[3].position.y = meshes[3].userData.position.y - from.distance
      })
      .onStop(function () {
        console.log('title tweenCreditsFlyIn stop')
        DATA.activeTween = null
        reject(new Error('UserInterruptAction'))
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

  try {
    const bgImage = addImageToDialog(bgGroup, 'intro', 'background', 'intro-background', 320 / 2, 240 / 2, 0.5)
    bgImage.material.opacity = 0
    const logoImage = addImageToDialog(logoGroup, 'intro', 'title-logo', 'title-logo', 320 / 2, 180, 0.5, null, null, ALIGN.BOTTOM)
    logoImage.material.opacity = 0
    const copyrightImage = addImageToDialog(logoGroup, 'intro', 'title-copyright', 'title-copyright', 320 / 2, 220, 0.5, null, null, ALIGN.BOTTOM)
    copyrightImage.material.opacity = 0

    while (true) {
      playMusic(100, true, 1000) // TODO - This actually stops and restarts on each loop
      await tweenSleep(3000)
      await tweenOpacity([bgImage], 0, 1, 500)

      const titlePositionConfig = [
        {x: 16, y: 24 - 16, align: ALIGN.LEFT, flyInOrder: ['tb', 'tw', 'nw', 'nb']}, // tl
        {x: 308, y: 24 - 16, align: ALIGN.RIGHT, flyInOrder: ['tw', 'tb', 'nw', 'nb']}, // tr
        {x: 16, y: 184 - 16, align: ALIGN.LEFT, flyInOrder: ['nb', 'nw', 'tb', 'tw']}, // bl
        {x: 308, y: 184 - 16, align: ALIGN.RIGHT, flyInOrder: ['nw', 'nb', 'tb', 'tw']} // br
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
      for (let i = 0; i < titlePositionLookup.length; i++) {
        // Loop is about 7 seconds
        removeGroupChildren(nameGroup)
        await tweenSleep(1800)
        const pos = titlePositionConfig[titlePositionLookup[i]]
        const x = pos.x
        const y = pos.y
        const align = pos.align
        const titleBlack = addImageToDialog(nameGroup, 'intro', `title-${i + 1}-a`, 'intro-background', x + 1, y + 0.5, 0.5, THREE.SubtractiveBlending, align, ALIGN.TOP)
        const titleWhite = addImageToDialog(nameGroup, 'intro', `title-${i + 1}-a`, 'intro-background', x, y, 0.5, THREE.AdditiveBlending, align, ALIGN.TOP)

        const yGap = titleWhite.geometry.parameters.height
        console.log('title yGap', yGap)
        const nameBlack = addImageToDialog(nameGroup, 'intro', `title-${i + 1}-b`, 'intro-background', x + 1, y + 0.5 + yGap, 0.5, THREE.SubtractiveBlending, align, ALIGN.TOP)
        const nameWhite = addImageToDialog(nameGroup, 'intro', `title-${i + 1}-b`, 'intro-background', x, y + yGap, 0.5, THREE.AdditiveBlending, align, ALIGN.TOP)

        titleBlack.userData.position = {x: titleBlack.position.x, y: titleBlack.position.y}
        titleWhite.userData.position = {x: titleWhite.position.x, y: titleWhite.position.y}
        nameBlack.userData.position = {x: nameBlack.position.x, y: nameBlack.position.y}
        nameWhite.userData.position = {x: nameWhite.position.x, y: nameWhite.position.y}
        const meshes = { tb: titleBlack, tw: titleWhite, nb: nameBlack, nw: nameWhite }

        await tweenCreditsFlyIn(pos.flyInOrder.map(m => meshes[m]), 3000)
        await tweenSleep(1200)
        await tweenOpacity([titleBlack, titleWhite, nameWhite, nameBlack], 1, 0, 800)
        titleBlack.visible = false // TODO - For some reason I can't get THREE.SubtractiveBlending with opacity 0 to tween to be invisible
        nameBlack.visible = false
      }

      await tweenSleep(500)
      console.log('title playCreditsLoop video: START')
      tweenOpacity([logoImage], 0, 1, 2000)
      await playExplodeVideoAndWaitForEnd(video)
      bgImage.material.opacity = 0
      console.log('title playCreditsLoop video: END')

      await tweenSleep(3000)
      await tweenOpacity([copyrightImage], 0, 1, 1000)
      await tweenSleep(15000)
      await tweenOpacity([logoImage, copyrightImage], 1, 0, 1000)
    }
  } catch (error) {
    console.log('title CATCH playCreditsLoop', error)
  }
  console.log('title playCreditsLoop: END')
}
const playExplodeVideoAndWaitForEnd = (video) => {
  return new Promise((resolve, reject) => {
    if (getMenuState() !== STATES.TITLE_SEQUENCE) {
      console.log('title not showing playExplodeVideo')
      resolve()
      return
    }
    movieGroup.visible = true
    video.currentTime = 0
    DATA.activeVideo = video
    video.onpause = () => {
      if (video.readyState !== 4) {
        return true
      }

      // Firefox dispatches the pause event but
      // doesn't set the video to paused
      setTimeout(() => {
        if (video.paused) {
          console.log('title video paused')
          DATA.activeVideo = null
          movieGroup.visible = false
          reject(new Error('UserInterruptAction'))
        }
      }, 250)
    }
    video.onended = () => {
      console.log('title video ended')
      // video.removeAttribute('src')
      // video.load()
      DATA.activeVideo = null
      movieGroup.visible = false
      resolve()
    }
    video.play()
  })
}
const cancelCreditsLoop = async () => {
  console.log('title exitMenu', DATA.activeTween, DATA.activeVideo)
  setMenuState('loading')

  await fadeOverlayIn(getMenuBlackOverlay())

  if (DATA.activeTween !== null) {
    DATA.activeTween.stop()
  }
  if (DATA.activeVideo !== null) {
    console.log('title DATA.activeVideo', DATA.activeVideo)
    DATA.activeVideo.pause()
  }
  removeGroupChildren(bgGroup)
  removeGroupChildren(nameGroup)
  removeGroupChildren(movieGroup)
  removeGroupChildren(logoGroup)
  stopMusic(500)
  showGameSelect()
}
const getGameSelectPos = () => {
  return {
    x: 125, // TODO - positions from game
    y: 120,
    yAdj: 13
  }
}
const showGameSelect = async () => {
  console.log('title showGameSelect: START')
  window.buster = addImageToDialog(gameSelectGroup, 'misc', 'Buster', 'buster', 320 / 2, 255, 1, null, null, ALIGN.BOTTOM) // TODO - Is there not a better image of this?

  const { x, y, yAdj } = getGameSelectPos()
  addTextToDialog(gameSelectGroup, 'NEW GAME', 'title-new-game', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x - 8, y - 4, 0.5)
  addTextToDialog(gameSelectGroup, 'Continue?', 'title-continue', LETTER_TYPES.MenuBaseFont, LETTER_COLORS.White, x - 8, y + yAdj - 4, 0.5)

  await fadeOverlayOut(getMenuBlackOverlay())
  drawGameSelectPointer()
  setMenuState(STATES.TITLE_SELECT)
  console.log('title showGameSelect: READY')
}
const drawGameSelectPointer = () => {
  const { x, y, yAdj } = getGameSelectPos()
  movePointer(POINTERS.pointer1, x - 15, y + (yAdj * DATA.gameSelectPos) - 2)
}
const gameSelectNavigation = (targetPos) => {
  DATA.gameSelectPos = targetPos
  drawGameSelectPointer()
}
const gameSelectConfirm = async () => {
  if (DATA.gameSelectPos === 0) {
    console.log('title BEGIN NEW GAME')
    setMenuState('loading')
    await fadeOverlayIn(getMenuBlackOverlay())
    loadNewGame()
  } else if (DATA.gameSelectPos === 1) {
    console.log('title SHOW LOAD GAME MENU')
    setMenuState('loading')
    await fadeOverlayIn(getMenuBlackOverlay())
    removeGroupChildren(gameSelectGroup)
    loadSaveMenu(null, true)
    // loadGame(window.config.save.cardId, window.config.save.slotId) // TODO - Just temp
  }
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU TITLE', key, firstPress, state)
  if (state === STATES.TITLE_SEQUENCE) {
    if (key === KEY.O || key === KEY.X || key === KEY.START) {
      cancelCreditsLoop()
    }
  } else if (state === STATES.TITLE_SELECT) {
    if (key === KEY.UP) {
      gameSelectNavigation(0)
    } else if (key === KEY.DOWN) {
      gameSelectNavigation(1)
    } else if (key === KEY.O) {
      gameSelectConfirm()
    }
  }
}
export { loadTitleMenu, keyPress }

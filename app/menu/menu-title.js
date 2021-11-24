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
import { loadMovie } from '../media/media-movies.js'
import { playMusic, loadMusic } from '../media/media-music.js'
import { setCurrentDisc } from '../data/savemap-alias.js'

const loadTitleMenu = async () => {
  console.log('loadTitleMenu')
  await fadeOverlayOut(getMenuBlackOverlay())
  showDebugText('Title')
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
